import mongoose, { Schema } from "mongoose";

export type PublicEntityType =
    "product" | "manufacturer" | "offer" | "projectInsight" | "knowledge" | "landingPage" | "settings" | "manual";

export type PublicChangeType =
    "created" | "updated" | "published" | "hidden" | "archived" | "deleted" | "manual";

export type PublicChangeStatus = "pending" | "publishing" | "published" | "ignored";

export type PublicContentChange = {
    id: string
    entityType: PublicEntityType
    entityId: string
    entityTitle: string
    changeType: PublicChangeType
    reason: string
    changedBy?: string
    changedAt: Date
    publishedAt?: Date | null
    deploymentId?: string | null
    status: PublicChangeStatus
    createdAt?: Date
    updatedAt?: Date
}

const schema = new Schema({
    entityType: {
        type: String,
        required: true,
        enum: ["product", "manufacturer", "offer", "projectInsight", "knowledge", "landingPage", "settings", "manual"],
    },
    entityId: { type: String, required: true },
    entityTitle: { type: String, default: "" },
    changeType: {
        type: String,
        required: true,
        enum: ["created", "updated", "published", "hidden", "archived", "deleted", "manual"],
    },
    reason: { type: String, required: true },
    changedBy: { type: String, default: "" },
    changedAt: { type: Date, required: true, default: Date.now },
    publishedAt: { type: Date, default: null },
    deploymentId: { type: String, default: null },
    status: {
        type: String,
        required: true,
        enum: ["pending", "publishing", "published", "ignored"],
        default: "pending",
    },
}, {
    timestamps: {
        createdAt: "createdAt",
        updatedAt: "updatedAt",
    },
});

// Publication overview reads are always "pending changes, newest first" or "changes for a
// given deployment" — index both access patterns.
schema.index({ status: 1, changedAt: -1 });
schema.index({ deploymentId: 1 });

export const PublicContentChangeModel = mongoose.model<PublicContentChange>(
    "PublicContentChange", schema, "PublicContentChanges",
);
