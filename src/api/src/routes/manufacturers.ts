import express, { Request } from "express";
import mongoose from "mongoose";
import { ManufacturerModel } from "../models/manufacturer";
import { ProductModel } from "../models/product";
import { changedByFromRequest, fieldsChanged, recordPublicChange } from "../services/publicContentChanges";

const router = express.Router();

// Public-facing fields — manufacturers only ever appear on the public WebClient through
// products that reference them, so a name/logo/description/link change is always what
// matters (there's no separate "manufacturer status" to gate on).
const PUBLIC_MANUFACTURER_FIELDS = ["name", "logo", "description", "link"];

async function withLinkedCount(doc: any) {
    const linkedProducts = await ProductModel.countDocuments({ manufacturer_id: String(doc.id) });
    return { ...doc, linkedProducts };
}

router.get("/", async (req, res) => {
    const rows = await ManufacturerModel.find().sort({ name: 1 }).exec();
    const withCounts = await Promise.all(rows.map(r => withLinkedCount(r.toJSON())));
    res.json(withCounts);
});

router.get("/:id", async (req: Request<{ id: string }>, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(404).json({ error: "Hersteller nicht gefunden." });
    }

    const row = await ManufacturerModel.findById(req.params.id).exec();
    if (!row) {
        return res.status(404).json({ error: "Hersteller nicht gefunden." });
    }
    res.json(await withLinkedCount(row.toJSON()));
});

async function validateManufacturer(name: string, excludeId?: string) {
    const errors: Record<string, string> = {};
    const trimmed = (name || "").trim();
    if (!trimmed) {
        errors.name = "Name ist erforderlich";
        return errors;
    }

    const dupe = await ManufacturerModel.findOne({
        name: { $regex: `^${trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
        ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    }).exec();

    if (dupe) {
        errors.name = "Dieser Herstellername existiert bereits";
    }

    return errors;
}

router.post("/", async (req, res) => {
    const errors = await validateManufacturer(req.body.name);
    if (Object.keys(errors).length) {
        return res.status(422).json({ errors });
    }

    const created = await ManufacturerModel.create({
        name: req.body.name.trim(),
        description: req.body.description || "",
        logo: req.body.logo || null,
        link: req.body.link || "",
    });

    res.status(201).json(await withLinkedCount(created.toJSON()));
});

router.put("/:id", async (req: Request<{ id: string }>, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(404).json({ error: "Hersteller nicht gefunden." });
    }

    const existing = await ManufacturerModel.findById(req.params.id).exec();
    if (!existing) {
        return res.status(404).json({ error: "Hersteller nicht gefunden." });
    }

    const errors = await validateManufacturer(req.body.name, req.params.id);
    if (Object.keys(errors).length) {
        return res.status(422).json({ errors });
    }

    const before = existing.toJSON() as Record<string, unknown>;

    existing.name = req.body.name.trim();
    existing.description = req.body.description || "";
    existing.logo = req.body.logo ?? existing.logo;
    existing.link = req.body.link || "";
    await existing.save();

    const after = existing.toJSON() as Record<string, unknown>;
    if (fieldsChanged(before, after, PUBLIC_MANUFACTURER_FIELDS)) {
        await recordPublicChange({
            entityType: "manufacturer", entityId: String(existing.id), entityTitle: existing.name,
            changeType: "updated", reason: "manufacturer-updated", changedBy: changedByFromRequest(req),
        });
    }

    res.json(await withLinkedCount(after));
});

router.delete("/:id", async (req: Request<{ id: string }>, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(404).json({ error: "Hersteller nicht gefunden." });
    }

    const existing = await ManufacturerModel.findById(req.params.id).exec();
    if (!existing) {
        return res.status(404).json({ error: "Hersteller nicht gefunden." });
    }

    const linked = await ProductModel.countDocuments({ manufacturer_id: req.params.id });
    if (linked > 0) {
        return res.status(409).json({ error: `„${existing.name}" hat ${linked} verknüpfte Produkte und kann nicht gelöscht werden.` });
    }

    await existing.deleteOne();
    res.status(204).send();
});

export default router;
