import express, { Request } from "express";
import { ServiceModel } from "../models/service";
import { slugify } from "./utils";

const router = express.Router();

router.get("/", async (req, res) => {
    const rows = await ServiceModel.find().sort({ updatedAt: -1 }).exec();
    res.json(rows.map(r => r.toJSON()));
});

router.get("/:id", async (req: Request<{ id: string }>, res) => {
    const row = await ServiceModel.findById(req.params.id).exec();
    if (!row) {
        return res.status(404).json({ error: "Leistung nicht gefunden." });
    }
    res.json(row.toJSON());
});

function validate(body: any) {
    const errors: Record<string, string> = {};
    if (!(body.name || "").trim()) {
        errors.name = "Name erforderlich";
    }
    if (!Array.isArray(body.descriptionLines) || !body.descriptionLines.some((l: string) => (l || "").trim())) {
        errors.descriptionLines = "Mindestens eine Beschreibungszeile";
    }
    return errors;
}

router.post("/", async (req, res) => {
    const errors = validate(req.body);
    if (Object.keys(errors).length) {
        return res.status(422).json({ errors });
    }

    const b = req.body;
    let id = slugify(b.name) || `service-${Date.now()}`;
    if (await ServiceModel.findById(id).exec()) {
        id = `${id}-${Date.now().toString(36)}`;
    }

    const created = await ServiceModel.create({
        _id: id,
        name: b.name.trim(),
        category: b.category || "",
        descriptionLines: b.descriptionLines.filter((l: string) => (l || "").trim()),
        taxRelevantForCraftsmanWork: !!b.taxRelevantForCraftsmanWork,
        visibility: b.visibility || "public",
        included: b.included !== false,
    });

    res.status(201).json(created.toJSON());
});

router.put("/:id", async (req: Request<{ id: string }>, res) => {
    const existing = await ServiceModel.findById(req.params.id).exec();
    if (!existing) {
        return res.status(404).json({ error: "Leistung nicht gefunden." });
    }

    const errors = validate(req.body);
    if (Object.keys(errors).length) {
        return res.status(422).json({ errors });
    }

    const b = req.body;
    existing.name = b.name.trim();
    existing.category = b.category || "";
    existing.descriptionLines = b.descriptionLines.filter((l: string) => (l || "").trim());
    existing.taxRelevantForCraftsmanWork = !!b.taxRelevantForCraftsmanWork;
    existing.visibility = b.visibility || "public";
    existing.included = b.included !== false;
    await existing.save();

    res.json(existing.toJSON());
});

router.post("/:id/duplicate", async (req: Request<{ id: string }>, res) => {
    const existing = await ServiceModel.findById(req.params.id).exec();
    if (!existing) {
        return res.status(404).json({ error: "Leistung nicht gefunden." });
    }

    const id = `${existing.id}-copy-${Date.now().toString(36)}`;
    const created = await ServiceModel.create({
        _id: id,
        name: `${existing.name} (Copy)`,
        category: existing.category,
        descriptionLines: existing.descriptionLines,
        taxRelevantForCraftsmanWork: existing.taxRelevantForCraftsmanWork,
        visibility: existing.visibility,
        included: existing.included,
    });

    res.status(201).json(created.toJSON());
});

router.delete("/:id", async (req: Request<{ id: string }>, res) => {
    const existing = await ServiceModel.findById(req.params.id).exec();
    if (!existing) {
        return res.status(404).json({ error: "Leistung nicht gefunden." });
    }
    await existing.deleteOne();
    res.status(204).send();
});

export default router;
