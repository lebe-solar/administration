import mongoose, { Schema } from "mongoose";

export const CATEGORIES = [
    { key: "Solarmodule", en: "Solar Modules", prefix: "MOD", icon: "panel" },
    { key: "Wechselrichter", en: "Inverters", prefix: "INV", icon: "inverter" },
    { key: "Heimspeicher", en: "Storage", prefix: "STO", icon: "battery" },
    { key: "Ladestationen", en: "Charging Stations", prefix: "WAL", icon: "plug" },
    { key: "Heizsysteme", en: "Heating Systems", prefix: "HEAT", icon: "heat" },
] as const;

export type ProductCategory = typeof CATEGORIES[number]["key"];
export type ProductStatus = "Active" | "Draft" | "Hidden";

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
    hasSpec?: boolean
    Logo?: string | null
    image?: string | null
    Status: ProductStatus
    panelHeightMeters?: number | null
    panelWidthMeters?: number | null
    createdAt?: Date
    updatedAt?: Date
}

const schema = new Schema({
    _id: { type: String, required: true },
    category: {
        type: String,
        required: true,
        enum: CATEGORIES.map(c => c.key),
    },
    Header: { type: String, required: true },
    Beschreibung: { type: String, default: "" },
    Hersteller: { type: String, default: "" },
    manufacturer_id: { type: String, required: true, ref: "Manufacturer" },
    Garantie: { type: String, default: "" },
    Power: { type: Number, default: null },
    Unit: { type: String, default: "" },
    Spezifikation: { type: String, default: null },
    hasSpec: { type: Boolean, default: false },
    Logo: { type: String, default: null },
    image: { type: String, default: null },
    Status: { type: String, required: true, enum: ["Active", "Draft", "Hidden"], default: "Draft" },
    panelHeightMeters: { type: Number, default: null },
    panelWidthMeters: { type: Number, default: null },
}, {
    timestamps: {
        createdAt: "createdAt",
        updatedAt: "updatedAt",
    },
});

export const ProductModel = mongoose.model<Product>("Product", schema, "Products");
