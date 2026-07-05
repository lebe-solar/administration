import express, { Request } from "express";
import { CATEGORIES, ProductModel, ProductCategory } from "../models/product";
import { ManufacturerModel } from "../models/manufacturer";

const router = express.Router();

router.get("/", async (req, res) => {
    const { category, manufacturer_id, status, q } = req.query as Record<string, string | undefined>;
    const filter: Record<string, unknown> = {};

    if (category && category !== "all") {
        filter.category = category;
    }
    if (manufacturer_id && manufacturer_id !== "all") {
        filter.manufacturer_id = manufacturer_id;
    }
    if (status && status !== "all") {
        filter.Status = status;
    }
    if (q) {
        const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        filter.$or = [
            { Header: { $regex: escaped, $options: "i" } },
            { _id: { $regex: escaped, $options: "i" } },
            { Hersteller: { $regex: escaped, $options: "i" } },
        ];
    }

    const rows = await ProductModel.find(filter).sort({ updatedAt: -1 }).exec();
    res.json(rows.map(r => r.toJSON()));
});

// IMPORTANT: this must be registered before "/:id" so "next-id" isn't parsed as a product id.
router.get("/next-id", async (req, res) => {
    const category = req.query.category as ProductCategory | undefined;
    const cat = CATEGORIES.find(c => c.key === category);
    if (!cat) {
        return res.status(400).json({ error: "Unbekannte Kategorie." });
    }

    const rows = await ProductModel.find({ _id: { $regex: `^${cat.prefix}-` } }, { _id: 1 }).exec();
    const nums = rows.map(r => parseInt(String(r.id).split("-")[1], 10) || 0);
    const n = (nums.length ? Math.max(...nums) : 0) + 1;
    res.json({ id: `${cat.prefix}-${String(n).padStart(3, "0")}` });
});

router.get("/:id", async (req: Request<{ id: string }>, res) => {
    const row = await ProductModel.findById(req.params.id).exec();
    if (!row) {
        return res.status(404).json({ error: "Produkt nicht gefunden." });
    }
    res.json(row.toJSON());
});

async function validateProduct(body: any, excludeId: string | undefined, asDraft: boolean) {
    const errors: Record<string, string> = {};
    const id = (body.id || "").trim();

    if (!id) {
        errors.id = "ID ist erforderlich";
    } else if (id !== excludeId) {
        const dupe = await ProductModel.findById(id).exec();
        if (dupe) {
            errors.id = "Diese ID existiert bereits";
        }
    }

    if (!CATEGORIES.some(c => c.key === body.category)) {
        errors.category = "Ungültige Kategorie";
    }
    if (!(body.Header || "").trim()) {
        errors.Header = "Titel ist erforderlich";
    }

    if (!body.manufacturer_id) {
        errors.manufacturer_id = "Hersteller wählen";
    } else if (!(await ManufacturerModel.findById(body.manufacturer_id).exec())) {
        errors.manufacturer_id = "Hersteller existiert nicht";
    }

    if (!asDraft) {
        if (!(body.Beschreibung || "").trim()) {
            errors.Beschreibung = "Beschreibung ist erforderlich";
        }
        if (!body.Spezifikation) {
            errors.Spezifikation = "Spezifikations-PDF ist erforderlich";
        }
    }

    if (body.Power !== "" && body.Power != null && isNaN(Number(body.Power))) {
        errors.Power = "Power muss eine Zahl sein";
    }

    if (body.category === "Solarmodule") {
        if (body.panelHeightMeters === "" || body.panelHeightMeters == null || isNaN(Number(body.panelHeightMeters))) {
            errors.panelHeightMeters = "Zahl erforderlich (nur Solarmodule)";
        }
        if (body.panelWidthMeters === "" || body.panelWidthMeters == null || isNaN(Number(body.panelWidthMeters))) {
            errors.panelWidthMeters = "Zahl erforderlich (nur Solarmodule)";
        }
    }

    return errors;
}

router.post("/", async (req, res) => {
    const b = req.body;
    const asDraft = b.Status === "Draft";
    const errors = await validateProduct(b, undefined, asDraft);
    if (Object.keys(errors).length) {
        return res.status(422).json({ errors });
    }

    const isSolar = b.category === "Solarmodule";
    const manufacturer = await ManufacturerModel.findById(b.manufacturer_id).exec();
    if (!manufacturer) {
        return res.status(422).json({ errors: { manufacturer_id: "Hersteller existiert nicht" } });
    }

    const created = await ProductModel.create({
        _id: b.id.trim(),
        category: b.category,
        Header: b.Header.trim(),
        Beschreibung: b.Beschreibung || "",
        Hersteller: manufacturer.name,
        manufacturer_id: String(manufacturer.id),
        Garantie: b.Garantie || "",
        Power: b.Power === "" || b.Power == null ? null : Number(b.Power),
        Unit: b.Unit || "",
        Spezifikation: b.Spezifikation || null,
        hasSpec: !!b.Spezifikation,
        Logo: b.Logo || manufacturer.logo,
        Status: b.Status || "Draft",
        panelHeightMeters: isSolar ? Number(b.panelHeightMeters) : null,
        panelWidthMeters: isSolar ? Number(b.panelWidthMeters) : null,
    });

    res.status(201).json(created.toJSON());
});

router.put("/:id", async (req: Request<{ id: string }>, res) => {
    const existing = await ProductModel.findById(req.params.id).exec();
    if (!existing) {
        return res.status(404).json({ error: "Produkt nicht gefunden." });
    }

    const b = req.body;
    const asDraft = b.Status === "Draft";
    const errors = await validateProduct(b, existing.id, asDraft);
    if (Object.keys(errors).length) {
        return res.status(422).json({ errors });
    }

    const isSolar = b.category === "Solarmodule";
    const manufacturer = await ManufacturerModel.findById(b.manufacturer_id).exec();
    if (!manufacturer) {
        return res.status(422).json({ errors: { manufacturer_id: "Hersteller existiert nicht" } });
    }
    const newId = b.id.trim();

    const fields = {
        category: b.category,
        Header: b.Header.trim(),
        Beschreibung: b.Beschreibung || "",
        Hersteller: manufacturer.name,
        manufacturer_id: String(manufacturer.id),
        Garantie: b.Garantie || "",
        Power: b.Power === "" || b.Power == null ? null : Number(b.Power),
        Unit: b.Unit || "",
        Spezifikation: b.Spezifikation || null,
        hasSpec: !!b.Spezifikation,
        Logo: b.Logo || manufacturer.logo,
        Status: b.Status || "Draft",
        panelHeightMeters: isSolar ? Number(b.panelHeightMeters) : null,
        panelWidthMeters: isSolar ? Number(b.panelWidthMeters) : null,
    };

    if (newId === existing.id) {
        Object.assign(existing, fields);
        await existing.save();
        return res.json(existing.toJSON());
    }

    // Mongo/Cosmos `_id` is immutable — renaming the product ID means creating a new
    // document under the new id and removing the old one.
    const createdAt = existing.createdAt;
    await existing.deleteOne();
    const recreated = await ProductModel.create({ _id: newId, ...fields, createdAt });
    res.json(recreated.toJSON());
});

router.delete("/:id", async (req: Request<{ id: string }>, res) => {
    const existing = await ProductModel.findById(req.params.id).exec();
    if (!existing) {
        return res.status(404).json({ error: "Produkt nicht gefunden." });
    }
    await existing.deleteOne();
    res.status(204).send();
});

export default router;
