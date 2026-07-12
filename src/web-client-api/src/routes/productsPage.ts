import express from "express";
import { CATEGORIES, ProductModel } from "../models/product";
import { ManufacturerModel } from "../models/manufacturer";

const router = express.Router();

// GET /api/products-page — public-safe data for the WebClient's /produkte page, fetched at
// WebClient build time (see src/web-client/src/lib/productsPageData.ts). Only Active products
// are ever returned; Draft/Hidden products and any admin-only fields never leave this service.
router.get("/", async (req, res) => {
    const productDocs = await ProductModel.find({ Status: "Active" }).sort({ updatedAt: -1 }).exec();
    const products = productDocs.map(p => p.toJSON());

    const manufacturerIds = Array.from(new Set(products.map(p => p.manufacturer_id).filter(Boolean)));
    const manufacturerDocs = manufacturerIds.length
        ? await ManufacturerModel.find({ _id: { $in: manufacturerIds } }).sort({ name: 1 }).exec()
        : [];

    const linkedCounts = new Map<string, number>();
    for (const p of products) {
        linkedCounts.set(p.manufacturer_id, (linkedCounts.get(p.manufacturer_id) || 0) + 1);
    }

    const productsOut = products.map(p => ({
        id: p.id,
        name: p.Header,
        category: p.category,
        manufacturer: p.Hersteller || "",
        power: p.Power ?? null,
        unit: p.Unit || "",
        warranty: p.Garantie || "",
        logo: p.Logo || null,
        image: p.image || null,
        beschreibung: p.Beschreibung || "",
        specPdf: p.Spezifikation || null,
        panelHeightMeters: p.panelHeightMeters ?? null,
        panelWidthMeters: p.panelWidthMeters ?? null,
        updatedAt: p.updatedAt,
        custom: null,
    }));

    const manufacturersOut = manufacturerDocs.map(m => {
        const doc = m.toJSON();
        return {
            id: doc.id,
            name: doc.name,
            logo: doc.logo || null,
            description: doc.description || "",
            link: doc.link || "",
            linkedProducts: linkedCounts.get(String(doc.id)) || 0,
            custom: null,
        };
    });

    const groupedProducts = CATEGORIES.map(c => ({
        category: c.key,
        label: c.label,
        products: productsOut.filter(p => p.category === c.key),
    }));

    res.json({
        schemaVersion: "productsPage.v1",
        generatedAt: new Date().toISOString(),
        products: productsOut,
        manufacturers: manufacturersOut,
        groupedProducts,
    });
});

export default router;
