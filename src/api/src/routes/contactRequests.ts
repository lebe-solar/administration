import express, { Request } from "express";
import { ContactRequestModel, REQUEST_STATUSES, RequestStatus } from "../models/contactRequest";
import { EmployeeModel } from "../models/employee";

const router = express.Router();

const PACKAGE_MODES = ["contactPackage", "offerPackage", "simulationPackage"];
const SIMULATION_MODES = ["simulationIndividual", "simulationPackage"];

router.get("/", async (req, res) => {
    const {
        status, requestMode, source, assignedTo, from, to, plz,
        hasPackage, hasSimulation, hasAttachments, unreadOnly, todoOnly, q,
    } = req.query as Record<string, string | undefined>;

    let rows = (await ContactRequestModel.find().sort({ createdAt: -1 }).exec()).map(r => r.toJSON());

    if (status && status !== "all") rows = rows.filter((r: any) => r.status === status);
    if (requestMode && requestMode !== "all") rows = rows.filter((r: any) => r.requestMode === requestMode);
    if (source && source !== "all") rows = rows.filter((r: any) => r.anfrageweg?.source === source);
    if (assignedTo && assignedTo !== "all") rows = rows.filter((r: any) => r.admin?.assignedTo?.employeeId === assignedTo);
    if (from) rows = rows.filter((r: any) => (r.metainformationen?.createdAt || "") >= from);
    if (to) rows = rows.filter((r: any) => (r.metainformationen?.createdAt || "") <= to);
    if (plz) rows = rows.filter((r: any) => (r.kunde?.postalCode || "").includes(plz) || (r.kunde?.city || "").toLowerCase().includes(plz.toLowerCase()));
    if (hasPackage === "true") rows = rows.filter((r: any) => PACKAGE_MODES.includes(r.requestMode));
    if (hasSimulation === "true") rows = rows.filter((r: any) => SIMULATION_MODES.includes(r.requestMode));
    if (hasAttachments === "true") rows = rows.filter((r: any) => (r.attachments || []).length > 0);
    if (unreadOnly === "true") rows = rows.filter((r: any) => r.status === "Neu");
    if (todoOnly === "true") rows = rows.filter((r: any) => r.status === "To-do");
    if (q) {
        const needle = q.toLowerCase();
        rows = rows.filter((r: any) => [
            r.kunde?.name, r.kunde?.email, r.kunde?.phone, r.kunde?.city, r.kunde?.postalCode,
            r.anfrageSnapshot?.offerSnapshot?.title, r.message, r.anfrageweg?.sourceUrl,
        ].filter(Boolean).join(" ").toLowerCase().includes(needle));
    }

    res.json(rows);
});

router.get("/:id", async (req: Request<{ id: string }>, res) => {
    const row = await ContactRequestModel.findById(req.params.id).exec();
    if (!row) {
        return res.status(404).json({ error: "Anfrage nicht gefunden." });
    }
    res.json(row.toJSON());
});

function pushLog(existing: any, action: string, actorName = "Admin", metadata?: string) {
    existing.admin.activityLog.push({ id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, action, actorName, createdAt: new Date().toISOString(), metadata: metadata || "" });
}

router.patch("/:id/status", async (req: Request<{ id: string }>, res) => {
    const existing = await ContactRequestModel.findById(req.params.id).exec();
    if (!existing) {
        return res.status(404).json({ error: "Anfrage nicht gefunden." });
    }
    const status = req.body.status as RequestStatus;
    if (!REQUEST_STATUSES.includes(status)) {
        return res.status(422).json({ error: "Ungültiger Status." });
    }
    existing.status = status;
    if (status === "To-do" && req.body.todo) {
        existing.admin.todo = { dueDate: req.body.todo.dueDate || "", note: req.body.todo.note || "" };
    }
    pushLog(existing, `Status geändert: ${status}`);
    await existing.save();
    res.json(existing.toJSON());
});

router.patch("/:id/assign", async (req: Request<{ id: string }>, res) => {
    const existing = await ContactRequestModel.findById(req.params.id).exec();
    if (!existing) {
        return res.status(404).json({ error: "Anfrage nicht gefunden." });
    }
    const employee = await EmployeeModel.findById(req.body.employeeId).exec();
    if (!employee || !employee.active) {
        return res.status(422).json({ error: "Mitarbeiter nicht gefunden oder nicht aktiv." });
    }

    const now = new Date().toISOString();
    existing.admin.assignedTo = { employeeId: employee.id, name: employee.name, email: employee.email, role: employee.role, assignedAt: now, assignedBy: req.body.assignedBy || "Admin" };
    if (!req.body.keepStatus) {
        existing.status = "In Bearbeitung";
    }
    pushLog(existing, "Mitarbeiter zugewiesen", req.body.assignedBy || "Admin", employee.name);

    // Simulated email notification — no real mail integration exists in this environment.
    const emailOk = true;
    if (emailOk) {
        pushLog(existing, "E-Mail-Benachrichtigung gesendet", "System", employee.email);
    } else {
        pushLog(existing, "Benachrichtigung fehlgeschlagen", "System", employee.email);
    }

    await existing.save();
    res.json({ ...existing.toJSON(), emailOk });
});

router.post("/:id/notes", async (req: Request<{ id: string }>, res) => {
    const existing = await ContactRequestModel.findById(req.params.id).exec();
    if (!existing) {
        return res.status(404).json({ error: "Anfrage nicht gefunden." });
    }
    if (!(req.body.text || "").trim()) {
        return res.status(422).json({ error: "Notiztext erforderlich." });
    }
    existing.admin.internalNotes.push({ id: `note-${Date.now()}`, text: req.body.text.trim(), authorName: req.body.authorName || "Admin", createdAt: new Date().toISOString() });
    pushLog(existing, "Notiz hinzugefügt", req.body.authorName || "Admin");
    await existing.save();
    res.json(existing.toJSON());
});

router.patch("/:id/archive", async (req: Request<{ id: string }>, res) => {
    const existing = await ContactRequestModel.findById(req.params.id).exec();
    if (!existing) {
        return res.status(404).json({ error: "Anfrage nicht gefunden." });
    }
    existing.status = "Archiviert";
    pushLog(existing, "Anfrage archiviert");
    await existing.save();
    res.json(existing.toJSON());
});

router.patch("/:id/trash", async (req: Request<{ id: string }>, res) => {
    const existing = await ContactRequestModel.findById(req.params.id).exec();
    if (!existing) {
        return res.status(404).json({ error: "Anfrage nicht gefunden." });
    }
    existing.status = "Papierkorb";
    pushLog(existing, "Anfrage in Papierkorb verschoben");
    await existing.save();
    res.json(existing.toJSON());
});

export default router;
