import mongoose, { Schema } from "mongoose";

export type DeploymentStatus = "queued" | "running" | "success" | "failed";
export type DeploymentTriggerType = "manual" | "pendingChanges" | "system";

export type DeploymentAffectedChange = {
    changeId: string
    entityType: string
    entityId: string
    entityTitle: string
    reason: string
}

export type PublicWebClientDeployment = {
    id: string
    status: DeploymentStatus
    triggerType: DeploymentTriggerType
    reason: string
    triggeredBy?: string
    triggeredAt: Date
    startedAt?: Date | null
    completedAt?: Date | null
    durationMs?: number | null
    githubWorkflowId?: string
    githubRunId?: string | null
    githubRunUrl?: string | null
    gitRef?: string
    affectedChanges: DeploymentAffectedChange[]
    errorMessage?: string | null
    createdAt?: Date
    updatedAt?: Date
}

const affectedChangeSchema = new Schema({
    changeId: { type: String, required: true },
    entityType: { type: String, required: true },
    entityId: { type: String, required: true },
    entityTitle: { type: String, default: "" },
    reason: { type: String, default: "" },
}, { _id: false });

const schema = new Schema({
    status: {
        type: String,
        required: true,
        enum: ["queued", "running", "success", "failed"],
        default: "queued",
    },
    triggerType: {
        type: String,
        required: true,
        enum: ["manual", "pendingChanges", "system"],
        default: "manual",
    },
    reason: { type: String, required: true },
    triggeredBy: { type: String, default: "" },
    triggeredAt: { type: Date, required: true, default: Date.now },
    startedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    durationMs: { type: Number, default: null },
    githubWorkflowId: { type: String, default: "" },
    githubRunId: { type: String, default: null },
    githubRunUrl: { type: String, default: null },
    gitRef: { type: String, default: "main" },
    affectedChanges: { type: [affectedChangeSchema], default: [] },
    errorMessage: { type: String, default: null },
}, {
    timestamps: {
        createdAt: "createdAt",
        updatedAt: "updatedAt",
    },
});

// History view is always "last N deployments" sorted by createdAt descending.
schema.index({ createdAt: -1 });

export const PublicWebClientDeploymentModel = mongoose.model<PublicWebClientDeployment>(
    "PublicWebClientDeployment", schema, "PublicWebClientDeployments",
);
