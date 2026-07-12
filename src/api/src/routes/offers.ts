import express, { Request } from "express";
import { OfferModel, MainProductSlot } from "../models/offer";
import { ProductModel } from "../models/product";
import { computeSystem, computeEconomics, ProductLite } from "../services/offerCalc";
import { slugify, today } from "./utils";
import { changedByFromRequest, fieldsChanged, recordPublicChange } from "../services/publicContentChanges";

const router = express.Router();

// Public-facing fields — a change to any of these on an Active offer affects its public
// detail page (and the Angebote listing/comparison table).
const PUBLIC_OFFER_FIELDS = [
    "title", "subtitle", "targetCustomer", "designedFor", "shortDescription", "longDescription",
    "priceType", "priceAmount", "priceCurrency", "priceLabel", "taxNote", "validUntil",
    "previewImageUrl", "mainProducts", "systemComponents", "includedServices", "requirementsAndExclusions",
];

const SLOTS: MainProductSlot[] = ["solarModule", "inverter", "storage", "wallbox", "heatingSystem"];

function isExpired(validUntil?: string | null): boolean {
    return !!validUntil && validUntil < today();
}

function linkedProductCount(mainProducts: Record<string, unknown>): number {
    return SLOTS.reduce((n, s) => n + (mainProducts && mainProducts[s] ? 1 : 0), 0);
}

async function withComputed(doc: any) {
    const o = doc.toJSON ? doc.toJSON() : doc;
    const ids = SLOTS.map(s => o.mainProducts?.[s]?.productId).filter(Boolean);
    const products = ids.length ? await ProductModel.find({ _id: { $in: ids } }).exec() : [];
    const productsById: Record<string, ProductLite> = {};
    products.forEach(p => { productsById[p.id] = p.toJSON() as unknown as ProductLite; });

    const calculatedSystem = computeSystem(o.mainProducts || {}, productsById);
    const economics = computeEconomics(calculatedSystem.pvPowerKwp, o.economics, o.priceAmount);

    return { ...o, calculatedSystem, economics: { ...o.economics, ...economics } };
}

router.get("/", async (req, res) => {
    const { status, q, price, valid } = req.query as Record<string, string | undefined>;
    const rows = await OfferModel.find().sort({ updatedAt: -1 }).exec();
    let offers = await Promise.all(rows.map(withComputed));

    if (status && status !== "all") {
        offers = offers.filter((o: any) => o.status === status);
    }
    if (q) {
        const needle = q.toLowerCase();
        offers = offers.filter((o: any) => `${o.title} ${o.id} ${o.subtitle}`.toLowerCase().includes(needle));
    }
    if (price && price !== "all") {
        offers = offers.filter((o: any) => {
            const amt = o.priceAmount || 0;
            if (price === "lt15") return amt < 15000;
            if (price === "15to30") return amt >= 15000 && amt <= 30000;
            return amt > 30000;
        });
    }
    if (valid && valid !== "all") {
        offers = offers.filter((o: any) => (valid === "active" ? !isExpired(o.validUntil) : isExpired(o.validUntil)));
    }

    res.json(offers);
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
    res.json(await withComputed(row));
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

    const mainProducts = body.mainProducts || {};
    for (const s of SLOTS) {
        const ref = mainProducts[s];
        if (ref?.productId && !(await ProductModel.findById(ref.productId).exec())) {
            errors.mainProducts = `Produkt ${ref.productId} existiert nicht im Katalog`;
        }
    }

    if (!asDraft) {
        if (!(body.subtitle || "").trim()) {
            errors.subtitle = "Untertitel erforderlich";
        }
        if (!(body.shortDescription || "").trim()) {
            errors.shortDescription = "Kurzbeschreibung erforderlich";
        }
        if (body.priceType === "fixed" && (body.priceAmount === "" || body.priceAmount == null)) {
            errors.priceAmount = "Preisbetrag erforderlich bei Festpreis";
        }
        if (!body.previewImageUrl) {
            errors.previewImageUrl = "Vorschaubild erforderlich";
        }
        if (!body.validUntil || isNaN(Date.parse(body.validUntil))) {
            errors.validUntil = "Gültiges Datum erforderlich";
        }
        if (linkedProductCount(mainProducts) === 0) {
            errors.mainProducts = "Mindestens ein Hauptprodukt auswählen";
        }
        if (mainProducts.solarModule && !((mainProducts.solarModule.quantity || 0) > 0)) {
            errors.mainProducts = "Modulanzahl muss größer als 0 sein";
        }
    }

    return errors;
}

function buildOfferDoc(id: string, b: any) {
    return {
        _id: id,
        title: b.title.trim(),
        subtitle: b.subtitle || "",
        status: b.status || "Draft",
        targetCustomer: b.targetCustomer || "",
        designedFor: b.designedFor || "",
        shortDescription: b.shortDescription || "",
        longDescription: b.longDescription || "",
        priceType: b.priceType || "fixed",
        priceAmount: b.priceAmount === "" || b.priceAmount == null ? null : Number(b.priceAmount),
        priceCurrency: b.priceCurrency || "EUR",
        priceLabel: b.priceLabel || "",
        taxNote: b.taxNote || "",
        validUntil: b.validUntil || null,
        slug: b.slug || slugify(b.title),
        publicUrl: b.publicUrl || `lebe-solarenergie.de/angebot/${b.slug || slugify(b.title)}`,
        previewImageUrl: b.previewImageUrl || null,
        mainProducts: b.mainProducts || {},
        systemComponents: b.systemComponents || [],
        includedServices: b.includedServices || [],
        requirementsAndExclusions: b.requirementsAndExclusions || [],
        economics: b.economics || {},
        allowChanges: !!b.allowChanges,
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

    if (created.status === "Active") {
        await recordPublicChange({
            entityType: "offer", entityId: created.id, entityTitle: created.title,
            changeType: "published", reason: "offer-published", changedBy: changedByFromRequest(req),
        });
    }

    res.status(201).json(await withComputed(created));
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

    const before = existing.toJSON() as Record<string, unknown>;
    const prevStatus = existing.status;
    const nextStatus = doc.status;
    const changedBy = changedByFromRequest(req);
    if (prevStatus !== "Active" && nextStatus === "Active") {
        await recordPublicChange({
            entityType: "offer", entityId: newId, entityTitle: doc.title,
            changeType: "published", reason: "offer-published", changedBy,
        });
    } else if (prevStatus === "Active" && nextStatus === "Active" && fieldsChanged(before, doc, PUBLIC_OFFER_FIELDS)) {
        await recordPublicChange({
            entityType: "offer", entityId: newId, entityTitle: doc.title,
            changeType: "updated", reason: "offer-updated", changedBy,
        });
    } else if (prevStatus === "Active" && nextStatus !== "Active") {
        await recordPublicChange({
            entityType: "offer", entityId: newId, entityTitle: doc.title,
            changeType: "hidden", reason: "offer-hidden", changedBy,
        });
    }

    if (newId === existing.id) {
        Object.assign(existing, doc);
        await existing.save();
        return res.json(await withComputed(existing));
    }

    // `_id` is immutable in Mongo/Cosmos — an ID rename means recreate + delete old.
    const createdAt = existing.createdAt;
    await existing.deleteOne();
    const recreated = await OfferModel.create({ ...doc, createdAt });
    res.json(await withComputed(recreated));
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

    res.status(201).json(await withComputed(created));
});

router.delete("/:id", async (req: Request<{ id: string }>, res) => {
    const existing = await OfferModel.findById(req.params.id).exec();
    if (!existing) {
        return res.status(404).json({ error: "Angebot nicht gefunden." });
    }
    const wasActive = existing.status === "Active";
    await existing.deleteOne();
    if (wasActive) {
        await recordPublicChange({
            entityType: "offer", entityId: existing.id, entityTitle: existing.title,
            changeType: "deleted", reason: "offer-deleted", changedBy: changedByFromRequest(req),
        });
    }
    res.status(204).send();
});

export default router;
