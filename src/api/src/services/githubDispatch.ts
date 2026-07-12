import { GitHubConfig } from "../config/appConfig";

const API_BASE = "https://api.github.com";

export class GitHubDispatchError extends Error {}

export interface DispatchInputs {
    reason: string
    deploymentId: string
    triggeredBy: string
    changesCount: string
    entityTypes: string
}

export interface WorkflowRunInfo {
    runId: string
    runUrl: string
    status: "queued" | "in_progress" | "completed"
    conclusion: string | null
}

function githubHeaders(token: string): Record<string, string> {
    return {
        // The token is only ever placed in this header, on a server-to-server request to
        // GitHub — it is never logged and never sent to/reachable from the browser.
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
    };
}

/**
 * Triggers `workflow_dispatch` on the public WebClient rebuild workflow. Resolves once
 * GitHub has accepted the dispatch (202) — it does not wait for the run to start or finish.
 */
export async function dispatchWebClientRebuild(config: GitHubConfig, inputs: DispatchInputs): Promise<void> {
    if (!config.token) {
        throw new GitHubDispatchError("GitHub token is not configured (GITHUB_TOKEN_FOR_WEBCLIENT_REBUILD).");
    }

    const url = `${API_BASE}/repos/${config.owner}/${config.repo}/actions/workflows/${config.workflowId}/dispatches`;
    const res = await fetch(url, {
        method: "POST",
        headers: githubHeaders(config.token),
        body: JSON.stringify({
            ref: config.ref,
            inputs: {
                reason: inputs.reason,
                deploymentId: inputs.deploymentId,
                triggeredBy: inputs.triggeredBy,
                changesCount: inputs.changesCount,
                entityTypes: inputs.entityTypes,
            },
        }),
    });

    if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new GitHubDispatchError(`GitHub workflow dispatch failed with status ${res.status}: ${body}`);
    }
}

/**
 * GitHub's dispatch endpoint doesn't return the created run's id, so we look it up
 * separately: the most recent `workflow_dispatch`-triggered run created at/after the
 * deployment's `triggeredAt` timestamp. May return null if the run hasn't registered with
 * GitHub yet — callers should retry (e.g. from the refresh-status endpoint).
 */
export async function findDispatchedRun(config: GitHubConfig, sinceIso: string): Promise<WorkflowRunInfo | null> {
    if (!config.token) return null;

    const url = `${API_BASE}/repos/${config.owner}/${config.repo}/actions/workflows/${config.workflowId}/runs?event=workflow_dispatch&per_page=10`;
    const res = await fetch(url, { headers: githubHeaders(config.token) });
    if (!res.ok) return null;

    const body = await res.json() as { workflow_runs?: Array<{ id: number, html_url: string, status: string, conclusion: string | null, created_at: string }> };
    const since = new Date(sinceIso).getTime() - 5000; // small grace window for clock/registration skew
    const match = (body.workflow_runs || []).find(run => new Date(run.created_at).getTime() >= since);
    if (!match) return null;

    return {
        runId: String(match.id),
        runUrl: match.html_url,
        status: match.status as WorkflowRunInfo["status"],
        conclusion: match.conclusion,
    };
}

/** Fetches the current status of an already-known run id. */
export async function getRunStatus(config: GitHubConfig, runId: string): Promise<WorkflowRunInfo | null> {
    if (!config.token) return null;

    const url = `${API_BASE}/repos/${config.owner}/${config.repo}/actions/runs/${runId}`;
    const res = await fetch(url, { headers: githubHeaders(config.token) });
    if (!res.ok) return null;

    const run = await res.json() as { id: number, html_url: string, status: string, conclusion: string | null };
    return {
        runId: String(run.id),
        runUrl: run.html_url,
        status: run.status as WorkflowRunInfo["status"],
        conclusion: run.conclusion,
    };
}
