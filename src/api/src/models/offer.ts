import mongoose, { Schema } from "mongoose";

export type OfferItem = {
    id: string
    name: string
    quantity: number
    price: number
    descriptionLines: string[]
}

export type OfferProducts = {
    solarModuleId?: string | null
    solarModuleCount?: number
    inverterId?: string | null
    inverterCount?: number
    storageId?: string | null
    storageCount?: number
    wallboxId?: string | null
    wallboxCount?: number
    heatingSystemId?: string | null
    heatingSystemCount?: number
}

export type Offer = {
    id: string
    title: string
    subtitle?: string
    description?: string
    conditions?: string
    validUntil?: string
    designedFor?: string
    system?: string
    price?: string
    priceAmount?: number | null
    priceCurrency?: string
    priceLabel?: string
    link?: string
    slug?: string
    previewImage?: string | null
    products: OfferProducts
    inclusive: OfferItem[]
    allowChanges: boolean
    status: "Active" | "Draft" | "Hidden"
    createdAt?: Date
    updatedAt?: Date
}

const offerItemSchema = new Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    quantity: { type: Number, default: 1 },
    price: { type: Number, default: 0 },
    descriptionLines: { type: [String], default: [] },
}, { _id: false });

const productsSchema = new Schema({
    solarModuleId: { type: String, default: null },
    solarModuleCount: { type: Number, default: 0 },
    inverterId: { type: String, default: null },
    inverterCount: { type: Number, default: 0 },
    storageId: { type: String, default: null },
    storageCount: { type: Number, default: 0 },
    wallboxId: { type: String, default: null },
    wallboxCount: { type: Number, default: 0 },
    heatingSystemId: { type: String, default: null },
    heatingSystemCount: { type: Number, default: 0 },
}, { _id: false });

const schema = new Schema({
    _id: { type: String, required: true },
    title: { type: String, required: true },
    subtitle: { type: String, default: "" },
    description: { type: String, default: "" },
    conditions: { type: String, default: "" },
    validUntil: { type: String, default: null },
    designedFor: { type: String, default: "" },
    system: { type: String, default: "" },
    price: { type: String, default: "" },
    priceAmount: { type: Number, default: null },
    priceCurrency: { type: String, default: "EUR" },
    priceLabel: { type: String, default: "" },
    link: { type: String, default: "" },
    slug: { type: String, default: null },
    previewImage: { type: String, default: null },
    products: { type: productsSchema, default: () => ({}) },
    inclusive: { type: [offerItemSchema], default: [] },
    allowChanges: { type: Boolean, default: false },
    status: { type: String, required: true, enum: ["Active", "Draft", "Hidden"], default: "Draft" },
}, {
    timestamps: {
        createdAt: "createdAt",
        updatedAt: "updatedAt",
    },
});

export const OfferModel = mongoose.model<Offer>("Offer", schema, "Offers");
