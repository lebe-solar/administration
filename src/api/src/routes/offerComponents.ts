import express, { Request } from "express";
import { OfferComponentModel } from "../models/offerComponent";
import { slugify } from "./utils";

const router = express.Router();

router.get("/", async (req, res) => {
    const rows = await OfferComponentModel.find().sort({ updatedAt: -1 }).exec();
    res.json(rows.map(r => r.toJSON()));
});

router.get("/:id", async (req: Request<{ id: string }>, res) => {
    const row = await OfferComponentModel.findById(req.params.id).exec();
    if (!row) {
        return res.status(404).json({ error: "Leistungsposition nicht gefunden." });
    }
    res.json(row.toJSON());
});

function validateComponent(body: any) {
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
    const errors = validateComponent(req.body);
    if (Object.keys(errors).length) {
        return res.status(422).json({ errors });
    }

    const b = req.body;
    let id = slugify(b.name) || `service-${Date.now()}`;
    if (await OfferComponentModel.findById(id).exec()) {
        id = `${id}-${Date.now().toString(36)}`;
    }

    const created = await OfferComponentModel.create({
        _id: id,
        name: b.name.trim(),
        quantity: Number(b.quantity) || 1,
        price: Number(b.price) || 0,
        descriptionLines: b.descriptionLines.filter((l: string) => (l || "").trim()),
    });

    res.status(201).json(created.toJSON());
});

router.put("/:id", async (req: Request<{ id: string }>, res) => {
    const existing = await OfferComponentModel.findById(req.params.id).exec();
    if (!existing) {
        return res.status(404).json({ error: "Leistungsposition nicht gefunden." });
    }

    const errors = validateComponent(req.body);
    if (Object.keys(errors).length) {
        return res.status(422).json({ errors });
    }

    const b = req.body;
    existing.name = b.name.trim();
    existing.quantity = Number(b.quantity) || 1;
    existing.price = Number(b.price) || 0;
    existing.descriptionLines = b.descriptionLines.filter((l: string) => (l || "").trim());
    await existing.save();

    res.json(existing.toJSON());
});

router.post("/:id/duplicate", async (req: Request<{ id: string }>, res) => {
    const existing = await OfferComponentModel.findById(req.params.id).exec();
    if (!existing) {
        return res.status(404).json({ error: "Leistungsposition nicht gefunden." });
    }

    const id = `${existing.id}-copy-${Date.now().toString(36)}`;
    const created = await OfferComponentModel.create({
        _id: id,
        name: `${existing.name} (Copy)`,
        quantity: existing.quantity,
        price: existing.price,
        descriptionLines: existing.descriptionLines,
    });

    res.status(201).json(created.toJSON());
});

router.delete("/:id", async (req: Request<{ id: string }>, res) => {
    const existing = await OfferComponentModel.findById(req.params.id).exec();
    if (!existing) {
        return res.status(404).json({ error: "Leistungsposition nicht gefunden." });
    }
    await existing.deleteOne();
    res.status(204).send();
});

export default router;
