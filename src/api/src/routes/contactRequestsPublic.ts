import express from "express";
import { ContactRequestModel, REQUEST_MODES } from "../models/contactRequest";

const router = express.Router();

// Unauthenticated on purpose: this is where the public marketing site's contact form
// (out of scope for this task) would POST a `contactRequestPayload`. Not part of the
// admin auth boundary — the backend stores it as-is per the spec, no live joins.
const INQUIRY_TYPE_LABELS: Record<string, string> = {
    generalContact: "Allgemeine Anfrage",
    freeConsultation: "Kostenlose Beratung",
    simulationIndividual: "Simulation prüfen",
    simulationPackage: "Simulation prüfen",
    contactPackage: "Paketprüfung",
    offerPackage: "Paketprüfung",
    productQuestion: "Produktberatung",
    knowledgeQuestion: "Allgemeine Anfrage",
};

router.post("/", async (req, res) => {
    const b = req.body;

    if (!REQUEST_MODES.includes(b.requestMode)) {
        return res.status(422).json({ error: "Ungültiger oder fehlender requestMode." });
    }
    if (!(b.kunde?.name || "").trim() || !(b.kunde?.email || "").trim()) {
        return res.status(422).json({ error: "Name und E-Mail sind erforderlich." });
    }
    if (!b.consent?.privacyAccepted) {
        return res.status(422).json({ error: "Der Datenschutz-Zustimmung ist erforderlich." });
    }

    const rows = await ContactRequestModel.find({}, { _id: 1 }).exec();
    const nums = rows.map(r => parseInt(String(r.id).replace(/\D/g, ""), 10) || 0);
    const id = `REQ-${String((nums.length ? Math.max(...nums) : 0) + 1).padStart(4, "0")}`;
    const now = new Date().toISOString();

    const created = await ContactRequestModel.create({
        _id: id,
        schemaVersion: b.schemaVersion || "contactRequest.v1",
        status: "Neu",
        inquiryType: b.inquiryType || INQUIRY_TYPE_LABELS[b.requestMode as string] || "Allgemeine Anfrage",
        inquiryTypeKey: b.inquiryTypeKey || b.requestMode,
        requestMode: b.requestMode,
        kunde: b.kunde,
        additionalCustomerInputs: b.additionalCustomerInputs || {},
        message: b.message || "",
        anfrageweg: b.anfrageweg || {},
        anfrageSnapshot: b.anfrageSnapshot || {},
        wirtschaftlichkeitsrechnung: b.wirtschaftlichkeitsrechnung || null,
        attachments: b.attachments || [],
        consent: b.consent,
        metainformationen: { ...(b.metainformationen || {}), createdAt: now, submittedAt: b.metainformationen?.submittedAt || now },
        admin: {
            assignedTo: null,
            todo: null,
            internalNotes: [],
            activityLog: [{ id: `log-${Date.now()}`, action: "Anfrage erstellt", actorName: "System", createdAt: now }],
        },
    });

    res.status(201).json({ id: created.id });
});

export default router;
