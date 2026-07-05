import mongoose, { Schema } from "mongoose";

export type OfferComponent = {
    id: string
    name: string
    quantity: number
    price: number
    descriptionLines: string[]
    updatedAt?: Date
}

const schema = new Schema({
    _id: { type: String, required: true },
    name: { type: String, required: true },
    quantity: { type: Number, default: 1 },
    price: { type: Number, default: 0 },
    descriptionLines: { type: [String], default: [] },
}, {
    timestamps: { createdAt: false, updatedAt: "updatedAt" },
});

export const OfferComponentModel = mongoose.model<OfferComponent>("OfferComponent", schema, "OfferComponents");
