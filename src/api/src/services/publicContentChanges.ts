import { Request } from "express";
import { PublicContentChangeModel, PublicChangeType, PublicEntityType } from "../models/publicContentChange";

export interface RecordPublicChangeInput {
    entityType: PublicEntityType
    entityId: string
    entityTitle: string
    changeType: PublicChangeType
    reason: string
    changedBy?: string
}

/**
 * Records a pending public-website change. Generic across every entity type that can affect
 * the statically-generated public WebClient (products, manufacturers, offers, project
 * insights, and — later — knowledge/landingPage/settings content). Callers decide *when* a
 * change is public-relevant (e.g. only for Active/Veröffentlicht entities); this function just
 * persists the record.
 */
export async function recordPublicChange(input: RecordPublicChangeInput): Promise<void> {
    await PublicContentChangeModel.create({
        entityType: input.entityType,
        entityId: input.entityId,
        entityTitle: input.entityTitle,
        changeType: input.changeType,
        reason: input.reason,
        changedBy: input.changedBy || "",
        changedAt: new Date(),
        status: "pending",
    });
}

/** Best-effort human/email identifier for "changed by" / "triggered by" attribution. */
export function changedByFromRequest(req: Request): string {
    return req.user?.name || req.user?.email || req.user?.oid || "";
}

/**
 * Shallow "did any of these fields change" check, comparing each key by JSON value equality.
 * Good enough for the plain-object/array-of-plain-object public fields on our models (arrays
 * and nested objects are always written back in a consistent shape by the routes that call
 * this, so stringify-equality reliably detects real content changes).
 */
export function fieldsChanged(before: Record<string, unknown>, after: Record<string, unknown>, keys: string[]): boolean {
    return keys.some(key => JSON.stringify(before[key]) !== JSON.stringify(after[key]));
}
