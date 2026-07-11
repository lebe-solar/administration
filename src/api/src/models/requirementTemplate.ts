import mongoose, { Schema } from "mongoose";

export type RequirementTemplate = {
    id: string
    title: string
    description: string
    type: "requirement" | "optionalAdditionalWork" | "exclusion"
    visibility: "public" | "internal" | "hidden"
    priceType: "included" | "onRequest" | "fixed" | "startingFrom"
    optionalPrice?: number | null
}

const schema = new Schema({
    _id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    type: { type: String, enum: ["requirement", "optionalAdditionalWork", "exclusion"], default: "requirement" },
    visibility: { type: String, enum: ["public", "internal", "hidden"], default: "public" },
    priceType: { type: String, enum: ["included", "onRequest", "fixed", "startingFrom"], default: "included" },
    optionalPrice: { type: Number, default: null },
});

export const RequirementTemplateModel = mongoose.model<RequirementTemplate>("RequirementTemplate", schema, "RequirementTemplates");
