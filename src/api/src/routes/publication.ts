import express, { Request } from "express";
import { AppConfig } from "../config/appConfig";
import { PublicContentChangeModel } from "../models/publicContentChange";
import { DeploymentTriggerType, PublicWebClientDeploymentModel } from "../models/publicWebClientDeployment";
import { changedByFromRequest } from "../services/publicContentChanges";
import { dispatchWebClientRebuild, findDispatchedRun, getRunStatus, GitHubDispatchError } from "../services/githubDispatch";

// Every route in this file sits behind the same Entra ID bearer-auth middleware every other
// admin route uses (mounted in app.ts) — this codebase has no separate admin/viewer role
// concept, so "authenticated" is the only notion of "admin" that exists here today. If a
// finer-grained permission system is added later, gate publish specifically on it here.

type OverviewStatus = "upToDate" | "pending" | "publishing" | "failed";

async function buildOverview() {
    const pendingChanges = await PublicContentChangeModel.find({ status: "pending" }).sort({ changedAt: -1 }).exec();
    const latestDeploymentDoc = await PublicWebClientDeploymentModel.findOne().sort({ createdAt: -1 }).exec();
    const history = await PublicWebClientDeploymentModel.find().sort({ createdAt: -1 }).limit(10).exec();

    const latestDeployment = latestDeploymentDoc ? latestDeploymentDoc.toJSON() : null;
    const hasPendingChanges = pendingChanges.length > 0;

    let status: OverviewStatus;
    if (latestDeployment && (latestDeployment.status === "queued" || latestDeployment.status === "running")) {
        status = "publishing";
    } else if (latestDeployment && latestDeployment.status === "failed") {
        status = "failed";
    } else if (hasPendingChanges) {
        status = "pending";
    } else {
        status = "upToDate";
    }

    return {
        status,
        hasPendingChanges,
        pendingChanges: pendingChanges.map(c => c.toJSON()),
        latestDeployment,
        history: history.map(d => d.toJSON()),
    };
}

export default function createPublicationRouter(config: AppConfig) {
    const router = express.Router();

    router.get("/overview", async (req, res) => {
        res.json(await buildOverview());
    });

    router.get("/deployments", async (req, res) => {
        const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);
        const rows = await PublicWebClientDeploymentModel.find().sort({ createdAt: -1 }).limit(limit).exec();
        res.json(rows.map(r => r.toJSON()));
    });

    router.post("/publish", async (req, res) => {
        const reason: string = req.body?.reason || "manual-publish";
        const includePendingChanges = req.body?.includePendingChanges !== false;

        const alreadyRunning = await PublicWebClientDeploymentModel.findOne({ status: { $in: ["queued", "running"] } }).exec();
        if (alreadyRunning) {
            return res.status(409).json({ error: "Veröffentlichung läuft bereits.", deployment: alreadyRunning.toJSON() });
        }

        const pendingChanges = includePendingChanges
            ? await PublicContentChangeModel.find({ status: "pending" }).sort({ changedAt: -1 }).exec()
            : [];

        const triggeredBy = changedByFromRequest(req);
        const triggerType: DeploymentTriggerType = pendingChanges.length > 0 ? "pendingChanges" : "manual";
        const triggeredAt = new Date();

        const deployment = await PublicWebClientDeploymentModel.create({
            status: "queued",
            triggerType,
            reason,
            triggeredBy,
            triggeredAt,
            gitRef: config.github.ref,
            githubWorkflowId: config.github.workflowId,
            affectedChanges: pendingChanges.map(c => ({
                changeId: String(c.id), entityType: c.entityType, entityId: c.entityId,
                entityTitle: c.entityTitle, reason: c.reason,
            })),
        });

        // Mark affected changes as "publishing" up front — they're only flipped to
        // "published" once a later refresh-status call confirms the deployment succeeded, and
        // put back to "pending" (not lost) if dispatch or the deployment itself fails.
        if (pendingChanges.length) {
            await PublicContentChangeModel.updateMany(
                { _id: { $in: pendingChanges.map(c => c.id) } },
                { $set: { status: "publishing", deploymentId: String(deployment.id) } },
            ).exec();
        }

        const entityTypes = Array.from(new Set(pendingChanges.map(c => c.entityType))).join(",");

        try {
            await dispatchWebClientRebuild(config.github, {
                reason,
                deploymentId: String(deployment.id),
                triggeredBy,
                changesCount: String(pendingChanges.length),
                entityTypes,
            });
        } catch (err) {
            deployment.status = "failed";
            deployment.errorMessage = err instanceof GitHubDispatchError ? err.message : "Veröffentlichung konnte nicht gestartet werden.";
            deployment.completedAt = new Date();
            await deployment.save();

            if (pendingChanges.length) {
                await PublicContentChangeModel.updateMany(
                    { _id: { $in: pendingChanges.map(c => c.id) } },
                    { $set: { status: "pending" }, $unset: { deploymentId: "" } },
                ).exec();
            }

            // Saving admin content itself must never be blocked by a failed rebuild dispatch —
            // this endpoint only triggers a rebuild, it doesn't gate any content save, so we
            // simply report the failure here for the UI to surface.
            return res.status(502).json({ error: "Änderung gespeichert. Veröffentlichung konnte nicht gestartet werden.", deployment: deployment.toJSON() });
        }

        res.status(201).json(deployment.toJSON());
    });

    router.post("/deployments/:id/refresh-status", async (req: Request<{ id: string }>, res) => {
        const deployment = await PublicWebClientDeploymentModel.findById(req.params.id).exec();
        if (!deployment) {
            return res.status(404).json({ error: "Deployment nicht gefunden." });
        }

        if (deployment.status === "success" || deployment.status === "failed") {
            return res.json(deployment.toJSON());
        }

        const runInfo = deployment.githubRunId
            ? await getRunStatus(config.github, deployment.githubRunId)
            : await findDispatchedRun(config.github, deployment.triggeredAt.toISOString());

        if (!runInfo) {
            return res.json(deployment.toJSON());
        }

        if (!deployment.githubRunId) {
            deployment.githubRunId = runInfo.runId;
            deployment.githubRunUrl = runInfo.runUrl;
        }

        if (runInfo.status !== "completed") {
            deployment.status = "running";
            if (!deployment.startedAt) {
                deployment.startedAt = new Date();
            }
            await deployment.save();
            return res.json(deployment.toJSON());
        }

        const succeeded = runInfo.conclusion === "success";
        deployment.completedAt = new Date();
        deployment.durationMs = deployment.completedAt.getTime() - deployment.triggeredAt.getTime();

        if (succeeded) {
            deployment.status = "success";
            await PublicContentChangeModel.updateMany(
                { deploymentId: String(deployment.id), status: "publishing" },
                { $set: { status: "published", publishedAt: new Date() } },
            ).exec();
        } else {
            deployment.status = "failed";
            deployment.errorMessage = `GitHub Actions run finished with conclusion "${runInfo.conclusion}".`;
            await PublicContentChangeModel.updateMany(
                { deploymentId: String(deployment.id), status: "publishing" },
                { $set: { status: "pending" }, $unset: { deploymentId: "" } },
            ).exec();
        }

        await deployment.save();
        res.json(deployment.toJSON());
    });

    return router;
}
