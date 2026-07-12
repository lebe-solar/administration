import mongoose, { Schema } from "mongoose";

// Read-only mirror of src/api/src/models/product.ts's schema shape. Deliberately duplicated
// rather than imported — this service is a separate deployable with its own package.json and
// must stay independently buildable/deployable, reading the same "Products" collection with
// no write access and no dependency on the Admin API's codebase.
export const CATEGORIES = [
    { key: "Solarmodule", label: "Solarmodule" },
    { key: "Wechselrichter", label: "Wechselrichter" },
    { key: "Heimspeicher", label: "Heimspeicher" },
    { key: "Ladestationen", label: "Ladestationen" },
    { key: "Heizsysteme", label: "Heizsysteme" },
] as const;

export type ProductCategory = typeof CATEGORIES[number]["key"];

export type Product = {
    id: string
    category: ProductCategory
    Header: string
    Beschreibung?: string
    Hersteller?: string
    manufacturer_id: string
    Garantie?: string
    Power?: number | null
    Unit?: string
    Spezifikation?: string | null
    Logo?: string | null
    image?: string | null
    Status: "Active" | "Draft" | "Hidden"
    panelHeightMeters?: number | null
    panelWidthMeters?: number | null
    createdAt?: Date
    updatedAt?: Date
}

const schema = new Schema({
    _id: { type: String },
    category: { type: String },
    Header: { type: String },
    Beschreibung: { type: String },
    Hersteller: { type: String },
    manufacturer_id: { type: String },
    Garantie: { type: String },
    Power: { type: Number },
    Unit: { type: String },
    Spezifikation: { type: String },
    Logo: { type: String },
    image: { type: String },
    Status: { type: String },
    panelHeightMeters: { type: Number },
    panelWidthMeters: { type: Number },
}, {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
});

export const ProductModel = mongoose.model<Product>("Product", schema, "Products");
