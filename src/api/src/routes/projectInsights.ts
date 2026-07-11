import express, { Request } from "express";
import { ProjectInsightModel } from "../models/projectInsight";

const router = express.Router();

router.get("/", async (req, res) => {
    const { status, buildingType, customerType, q } = req.query as Record<string, string | undefined>;
    let rows = (await ProjectInsightModel.find().sort({ sortOrder: 1, updatedAt: -1 }).exec()).map(r => r.toJSON());

    if (status && status !== "all") {
        rows = rows.filter((p: any) => p.status === status);
    }
    if (buildingType && buildingType !== "all") {
        rows = rows.filter((p: any) => p.buildingType === buildingType);
    }
    if (customerType && customerType !== "all") {
        rows = rows.filter((p: any) => p.customerType === customerType);
    }
    if (q) {
        const needle = q.toLowerCase();
        rows = rows.filter((p: any) => `${p.title} ${p.locationLabel} ${p.id}`.toLowerCase().includes(needle));
    }

    res.json(rows);
});

router.get("/next-id", async (req, res) => {
    const rows = await ProjectInsightModel.find({}, { _id: 1 }).exec();
    const nums = rows.map(r => parseInt(String(r.id).replace(/\D/g, ""), 10) || 0);
    const n = (nums.length ? Math.max(...nums) : 0) + 1;
    res.json({ id: `PRJ-${String(n).padStart(3, "0")}` });
});

router.get("/:id", async (req: Request<{ id: string }>, res) => {
    const row = await ProjectInsightModel.findById(req.params.id).exec();
    if (!row) {
        return res.status(404).json({ error: "Projekt nicht gefunden." });
    }
    res.json(row.toJSON());
});

function validate(body: any) {
    const errors: Record<string, string> = {};
    if (!(body.title || "").trim()) {
        errors.title = "Projekt-Titel erforderlich";
    }
    if (!(body.locationLabel || "").trim()) {
        errors.locationLabel = "Ort / Region erforderlich";
    }
    if (!(body.shortDescription || "").trim()) {
        errors.shortDescription = "Kurzbeschreibung erforderlich";
    }
    return errors;
}

function buildDoc(id: string, b: any) {
    return {
        _id: id,
        status: b.status || "Entwurf",
        title: b.title.trim(),
        locationLabel: b.locationLabel.trim(),
        buildingType: b.buildingType || "Einfamilienhaus",
        customerType: b.customerType || "Privatkunde",
        projectYear: b.projectYear === "" || b.projectYear == null ? null : Number(b.projectYear),
        projectStatus: b.projectStatus || "umgesetzt",
        mainImage: b.mainImage || null,
        imageAlt: b.imageAlt || "",
        galleryImages: b.galleryImages || [],
        badges: b.badges || [],
        shortDescription: b.shortDescription || "",
        internalNote: b.internalNote || "",
        visibility: b.visibility || {},
        featured: !!b.featured,
        sortOrder: Number(b.sortOrder) || 0,
        publishedFrom: b.publishedFrom || null,
        publishedUntil: b.publishedUntil || null,
    };
}

router.post("/", async (req, res) => {
    const b = req.body;
    const errors = validate(b);
    if (Object.keys(errors).length) {
        return res.status(422).json({ errors });
    }

    const id = (b.id || "").trim() || `PRJ-${Date.now()}`;
    const created = await ProjectInsightModel.create(buildDoc(id, b));
    res.status(201).json(created.toJSON());
});

router.put("/:id", async (req: Request<{ id: string }>, res) => {
    const existing = await ProjectInsightModel.findById(req.params.id).exec();
    if (!existing) {
        return res.status(404).json({ error: "Projekt nicht gefunden." });
    }

    const errors = validate(req.body);
    if (Object.keys(errors).length) {
        return res.status(422).json({ errors });
    }

    Object.assign(existing, buildDoc(existing.id, req.body));
    await existing.save();
    res.json(existing.toJSON());
});

router.post("/:id/duplicate", async (req: Request<{ id: string }>, res) => {
    const existing = await ProjectInsightModel.findById(req.params.id).exec();
    if (!existing) {
        return res.status(404).json({ error: "Projekt nicht gefunden." });
    }

    const rows = await ProjectInsightModel.find({}, { _id: 1 }).exec();
    const nums = rows.map(r => parseInt(String(r.id).replace(/\D/g, ""), 10) || 0);
    const newId = `PRJ-${String((nums.length ? Math.max(...nums) : 0) + 1).padStart(3, "0")}`;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _oldId, createdAt: _createdAt, updatedAt: _updatedAt, ...source } = existing.toJSON() as any;
    const created = await ProjectInsightModel.create({
        ...source,
        _id: newId,
        title: `${existing.title} (Kopie)`,
        status: "Entwurf",
    });

    res.status(201).json(created.toJSON());
});

router.patch("/:id/archive", async (req: Request<{ id: string }>, res) => {
    const existing = await ProjectInsightModel.findById(req.params.id).exec();
    if (!existing) {
        return res.status(404).json({ error: "Projekt nicht gefunden." });
    }
    existing.status = "Archiviert";
    await existing.save();
    res.json(existing.toJSON());
});

router.delete("/:id", async (req: Request<{ id: string }>, res) => {
    const existing = await ProjectInsightModel.findById(req.params.id).exec();
    if (!existing) {
        return res.status(404).json({ error: "Projekt nicht gefunden." });
    }
    await existing.deleteOne();
    res.status(204).send();
});

export default router;
