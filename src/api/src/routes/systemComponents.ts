import express, { Request } from "express";
import { SystemComponentModel } from "../models/systemComponent";
import { slugify } from "./utils";

const router = express.Router();

router.get("/", async (req, res) => {
    const rows = await SystemComponentModel.find().sort({ updatedAt: -1 }).exec();
    res.json(rows.map(r => r.toJSON()));
});

router.get("/:id", async (req: Request<{ id: string }>, res) => {
    const row = await SystemComponentModel.findById(req.params.id).exec();
    if (!row) {
        return res.status(404).json({ error: "Systemkomponente nicht gefunden." });
    }
    res.json(row.toJSON());
});

function validate(body: any) {
    const errors: Record<string, string> = {};
    if (!(body.name || "").trim()) {
        errors.name = "Name erforderlich";
    }
    return errors;
}

router.post("/", async (req, res) => {
    const errors = validate(req.body);
    if (Object.keys(errors).length) {
        return res.status(422).json({ errors });
    }

    const b = req.body;
    let id = slugify(b.name) || `component-${Date.now()}`;
    if (await SystemComponentModel.findById(id).exec()) {
        id = `${id}-${Date.now().toString(36)}`;
    }

    const created = await SystemComponentModel.create({
        _id: id,
        name: b.name.trim(),
        category: b.category || "",
        unit: b.unit || "Stück",
        internalPrice: Number(b.internalPrice) || 0,
        publicLabel: b.publicLabel || "",
        publicDescription: b.publicDescription || "",
        visibility: b.visibility || "public",
        included: b.included !== false,
        optional: !!b.optional,
    });

    res.status(201).json(created.toJSON());
});

router.put("/:id", async (req: Request<{ id: string }>, res) => {
    const existing = await SystemComponentModel.findById(req.params.id).exec();
    if (!existing) {
        return res.status(404).json({ error: "Systemkomponente nicht gefunden." });
    }

    const errors = validate(req.body);
    if (Object.keys(errors).length) {
        return res.status(422).json({ errors });
    }

    const b = req.body;
    existing.name = b.name.trim();
    existing.category = b.category || "";
    existing.unit = b.unit || "Stück";
    existing.internalPrice = Number(b.internalPrice) || 0;
    existing.publicLabel = b.publicLabel || "";
    existing.publicDescription = b.publicDescription || "";
    existing.visibility = b.visibility || "public";
    existing.included = b.included !== false;
    existing.optional = !!b.optional;
    await existing.save();

    res.json(existing.toJSON());
});

router.delete("/:id", async (req: Request<{ id: string }>, res) => {
    const existing = await SystemComponentModel.findById(req.params.id).exec();
    if (!existing) {
        return res.status(404).json({ error: "Systemkomponente nicht gefunden." });
    }
    await existing.deleteOne();
    res.status(204).send();
});

export default router;
