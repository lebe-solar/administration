import express, { Request } from "express";
import { RequirementTemplateModel } from "../models/requirementTemplate";
import { slugify } from "./utils";

const router = express.Router();

router.get("/", async (req, res) => {
    const rows = await RequirementTemplateModel.find().sort({ title: 1 }).exec();
    res.json(rows.map(r => r.toJSON()));
});

function validate(body: any) {
    const errors: Record<string, string> = {};
    if (!(body.title || "").trim()) {
        errors.title = "Titel erforderlich";
    }
    return errors;
}

router.post("/", async (req, res) => {
    const errors = validate(req.body);
    if (Object.keys(errors).length) {
        return res.status(422).json({ errors });
    }

    const b = req.body;
    let id = slugify(b.title) || `requirement-${Date.now()}`;
    if (await RequirementTemplateModel.findById(id).exec()) {
        id = `${id}-${Date.now().toString(36)}`;
    }

    const created = await RequirementTemplateModel.create({
        _id: id,
        title: b.title.trim(),
        description: b.description || "",
        type: b.type || "requirement",
        visibility: b.visibility || "public",
        priceType: b.priceType || "included",
        optionalPrice: b.optionalPrice === "" || b.optionalPrice == null ? null : Number(b.optionalPrice),
    });

    res.status(201).json(created.toJSON());
});

router.delete("/:id", async (req: Request<{ id: string }>, res) => {
    const existing = await RequirementTemplateModel.findById(req.params.id).exec();
    if (!existing) {
        return res.status(404).json({ error: "Vorlage nicht gefunden." });
    }
    await existing.deleteOne();
    res.status(204).send();
});

export default router;
