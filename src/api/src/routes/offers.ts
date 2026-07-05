import express, { Request } from "express";
import { OfferModel } from "../models/offer";
import { ProductModel } from "../models/product";
import { slugify, today } from "./utils";

const router = express.Router();

const SLOTS = ["solarModule", "inverter", "storage", "wallbox", "heatingSystem"];

function isExpired(validUntil?: string | null): boolean {
    return !!validUntil && validUntil < today();
}

function linkedProductCount(products: Record<string, any>): number {
    return SLOTS.reduce((n, s) => n + (products && products[`${s}Id`] ? 1 : 0), 0);
}

router.get("/", async (req, res) => {
    const { status, q, price, valid } = req.query as Record<string, string | undefined>;
    let rows = (await OfferModel.find().sort({ updatedAt: -1 }).exec()).map(r => r.toJSON());

    if (status && status !== "all") {
        rows = rows.filter((o: any) => o.status === status);
    }
    if (q) {
        const needle = q.toLowerCase();
        rows = rows.filter((o: any) => `${o.title} ${o.id} ${o.subtitle}`.toLowerCase().includes(needle));
    }
    if (price && price !== "all") {
        rows = rows.filter((o: any) => {
            const amt = o.priceAmount || 0;
            if (price === "lt15") return amt < 15000;
            if (price === "15to30") return amt >= 15000 && amt <= 30000;
            return amt > 30000;
        });
    }
    if (valid && valid !== "all") {
        rows = rows.filter((o: any) => (valid === "active" ? !isExpired(o.validUntil) : isExpired(o.validUntil)));
    }

    res.json(rows);
});

router.get("/next-id", async (req, res) => {
    const rows = await OfferModel.find({}, { _id: 1 }).exec();
    const nums = rows.map(r => parseInt(String(r.id).replace(/\D/g, ""), 10) || 0);
    const n = (nums.length ? Math.max(...nums) : 0) + 1;
    res.json({ id: `OFF-${String(n).padStart(3, "0")}` });
});

router.get("/:id", async (req: Request<{ id: string }>, res) => {
    const row = await OfferModel.findById(req.params.id).exec();
    if (!row) {
        return res.status(404).json({ error: "Angebot nicht gefunden." });
    }
    res.json(row.toJSON());
});

async function validateOffer(body: any, excludeId: string | undefined, asDraft: boolean) {
    const errors: Record<string, string> = {};
    const id = (body.id || "").trim();

    if (!id) {
        errors.id = "ID erforderlich";
    } else if (id !== excludeId) {
        if (await OfferModel.findById(id).exec()) {
            errors.id = "Diese ID existiert bereits";
        }
    }

    if (!(body.title || "").trim()) {
        errors.title = "Titel erforderlich";
    }

    const slug = body.slug || slugify(body.title);
    if (slug) {
        const dupeSlug = await OfferModel.findOne({ slug, _id: { $ne: excludeId || "" } }).exec();
        if (dupeSlug) {
            errors.slug = "Slug bereits vergeben";
        }
    }

    if (body.priceAmount !== "" && body.priceAmount != null && isNaN(Number(body.priceAmount))) {
        errors.priceAmount = "Muss eine Zahl sein";
    }

    const products = body.products || {};
    for (const s of SLOTS) {
        const pid = products[`${s}Id`];
        if (pid && !(await ProductModel.findById(pid).exec())) {
            errors.products = `Produkt ${pid} existiert nicht im Katalog`;
        }
    }

    if (!asDraft) {
        if (!(body.subtitle || "").trim()) {
            errors.subtitle = "Untertitel erforderlich";
        }
        if (!(body.description || "").trim()) {
            errors.description = "Beschreibung erforderlich";
        }
        if (!(body.priceLabel || "").trim() && (body.priceAmount === "" || body.priceAmount == null)) {
            errors.priceLabel = "Preis-Label oder Betrag erforderlich";
        }
        if (!body.previewImage) {
            errors.previewImage = "Vorschaubild erforderlich";
        }
        if (!body.validUntil || isNaN(Date.parse(body.validUntil))) {
            errors.validUntil = "Gültiges Datum erforderlich";
        }
        if (linkedProductCount(products) === 0) {
            errors.products = "Mindestens ein Produkt verknüpfen";
        }
        (body.inclusive || []).forEach((s: any, i: number) => {
            if (!(s.name || "").trim() || (Number(s.quantity) || 0) <= 0 || !(s.descriptionLines || []).some((l: string) => (l || "").trim())) {
                errors[`svc${i}`] = "Ungültige Leistungsposition";
            }
        });
    }

    return errors;
}

function buildOfferDoc(id: string, b: any) {
    return {
        _id: id,
        title: b.title.trim(),
        subtitle: b.subtitle || "",
        description: b.description || "",
        conditions: b.conditions || "",
        validUntil: b.validUntil || null,
        designedFor: b.designedFor || "",
        system: b.system || "",
        priceAmount: b.priceAmount === "" || b.priceAmount == null ? null : Number(b.priceAmount),
        priceCurrency: b.priceCurrency || "EUR",
        priceLabel: b.priceLabel || "",
        price: b.priceLabel || b.price || (b.priceAmount ? `${Number(b.priceAmount).toLocaleString("de-DE")} €` : ""),
        link: b.link || "",
        slug: b.slug || slugify(b.title),
        previewImage: b.previewImage || null,
        products: b.products || {},
        inclusive: b.inclusive || [],
        allowChanges: !!b.allowChanges,
        status: b.status || "Draft",
    };
}

router.post("/", async (req, res) => {
    const b = req.body;
    const asDraft = b.status === "Draft";
    const errors = await validateOffer(b, undefined, asDraft);
    if (Object.keys(errors).length) {
        return res.status(422).json({ errors });
    }

    const created = await OfferModel.create(buildOfferDoc(b.id.trim(), b));
    res.status(201).json(created.toJSON());
});

router.put("/:id", async (req: Request<{ id: string }>, res) => {
    const existing = await OfferModel.findById(req.params.id).exec();
    if (!existing) {
        return res.status(404).json({ error: "Angebot nicht gefunden." });
    }

    const b = req.body;
    const asDraft = b.status === "Draft";
    const errors = await validateOffer(b, existing.id, asDraft);
    if (Object.keys(errors).length) {
        return res.status(422).json({ errors });
    }

    const newId = b.id.trim();
    const doc = buildOfferDoc(newId, b);

    if (newId === existing.id) {
        Object.assign(existing, doc);
        await existing.save();
        return res.json(existing.toJSON());
    }

    // `_id` is immutable in Mongo/Cosmos — an ID rename means recreate + delete old.
    const createdAt = existing.createdAt;
    await existing.deleteOne();
    const recreated = await OfferModel.create({ ...doc, createdAt });
    res.json(recreated.toJSON());
});

router.post("/:id/duplicate", async (req: Request<{ id: string }>, res) => {
    const existing = await OfferModel.findById(req.params.id).exec();
    if (!existing) {
        return res.status(404).json({ error: "Angebot nicht gefunden." });
    }

    const rows = await OfferModel.find({}, { _id: 1 }).exec();
    const nums = rows.map(r => parseInt(String(r.id).replace(/\D/g, ""), 10) || 0);
    const newId = `OFF-${String((nums.length ? Math.max(...nums) : 0) + 1).padStart(3, "0")}`;
    const title = `${existing.title} (Copy)`;
    let slug = slugify(title);
    if (await OfferModel.findOne({ slug }).exec()) {
        slug = `${slug}-${Date.now().toString(36)}`;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _oldId, createdAt: _createdAt, updatedAt: _updatedAt, ...source } = existing.toJSON() as any;
    const created = await OfferModel.create({
        ...source,
        _id: newId,
        title,
        slug,
        status: "Draft",
    });

    res.status(201).json(created.toJSON());
});

router.delete("/:id", async (req: Request<{ id: string }>, res) => {
    const existing = await OfferModel.findById(req.params.id).exec();
    if (!existing) {
        return res.status(404).json({ error: "Angebot nicht gefunden." });
    }
    await existing.deleteOne();
    res.status(204).send();
});

export default router;
