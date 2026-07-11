import mongoose, { Schema } from "mongoose";

export type SystemComponent = {
    id: string
    name: string
    category: string
    unit: string
    internalPrice: number
    publicLabel: string
    publicDescription: string
    visibility: "public" | "internal" | "hidden"
    included: boolean
    optional: boolean
    updatedAt?: Date
}

const schema = new Schema({
    _id: { type: String, required: true },
    name: { type: String, required: true },
    category: { type: String, default: "" },
    unit: { type: String, default: "Stück" },
    internalPrice: { type: Number, default: 0 },
    publicLabel: { type: String, default: "" },
    publicDescription: { type: String, default: "" },
    visibility: { type: String, enum: ["public", "internal", "hidden"], default: "public" },
    included: { type: Boolean, default: true },
    optional: { type: Boolean, default: false },
}, {
    timestamps: { createdAt: false, updatedAt: "updatedAt" },
});

export const SystemComponentModel = mongoose.model<SystemComponent>("SystemComponent", schema, "SystemComponents");
