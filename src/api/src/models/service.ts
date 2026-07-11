import mongoose, { Schema } from "mongoose";

export type Service = {
    id: string
    name: string
    category: string
    descriptionLines: string[]
    taxRelevantForCraftsmanWork: boolean
    visibility: "public" | "internal" | "hidden"
    included: boolean
    updatedAt?: Date
}

const schema = new Schema({
    _id: { type: String, required: true },
    name: { type: String, required: true },
    category: { type: String, default: "" },
    descriptionLines: { type: [String], default: [] },
    taxRelevantForCraftsmanWork: { type: Boolean, default: false },
    visibility: { type: String, enum: ["public", "internal", "hidden"], default: "public" },
    included: { type: Boolean, default: true },
}, {
    timestamps: { createdAt: false, updatedAt: "updatedAt" },
});

export const ServiceModel = mongoose.model<Service>("Service", schema, "Services");
