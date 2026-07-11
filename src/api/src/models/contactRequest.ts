import mongoose, { Schema } from "mongoose";

export const REQUEST_MODES = [
    "generalContact", "freeConsultation", "simulationIndividual", "simulationPackage",
    "contactPackage", "offerPackage", "productQuestion", "knowledgeQuestion",
] as const;
export type RequestMode = typeof REQUEST_MODES[number];

export const REQUEST_STATUSES = [
    "Neu", "Gelesen", "In Bearbeitung", "To-do", "Beantwortet", "Erledigt", "Archiviert", "Papierkorb",
] as const;
export type RequestStatus = typeof REQUEST_STATUSES[number];

export type ContactRequest = {
    id: string
    schemaVersion: string
    status: RequestStatus
    inquiryType: string
    inquiryTypeKey: string
    requestMode: RequestMode

    kunde: {
        name: string
        email: string
        phone?: string
        postalCode?: string
        city?: string
        street?: string
        preferredContactTime?: string
    }
    additionalCustomerInputs?: {
        annualConsumptionKwh?: number | null
        preferredContactTime?: string
        roofPhotoProvided?: boolean
        meterCabinetPhotoProvided?: boolean
        desiredCallbackTime?: string
        topic?: string
        notes?: string
    }
    message?: string

    // Structurally varies by requestMode — see chat4's final `anfrageSnapshot` /
    // `wirtschaftlichkeitsrechnung` spec. Stored as submitted, never reconstructed
    // from live offersDb/allProducts/componentsDb/servicesDb.
    anfrageweg: {
        source?: string
        sourceUrl?: string
        referrer?: string
        entryPointLabel?: string
        ctaLabel?: string
        submittedAt?: string
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    anfrageSnapshot?: Record<string, any>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    wirtschaftlichkeitsrechnung?: Record<string, any> | null

    attachments: { id: string; type: string; fileName: string; fileUrl: string; mimeType: string; uploadedAt: string }[]

    consent: { privacyAccepted: boolean; privacyAcceptedAt?: string; privacyVersion?: string }
    metainformationen: {
        createdAt?: string
        updatedAt?: string
        submittedAt?: string
        userAgent?: string
        deviceType?: string
        locale?: string
        ipHash?: string
    }

    admin: {
        assignedTo?: { employeeId: string; name: string; email: string; role?: string; assignedAt: string; assignedBy?: string } | null
        todo?: { dueDate?: string; note?: string } | null
        internalNotes: { id: string; text: string; authorId?: string; authorName: string; createdAt: string }[]
        activityLog: { id: string; action: string; actorId?: string; actorName: string; createdAt: string; metadata?: string }[]
    }

    createdAt?: Date
    updatedAt?: Date
}

const kundeSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: "" },
    postalCode: { type: String, default: "" },
    city: { type: String, default: "" },
    street: { type: String, default: "" },
    preferredContactTime: { type: String, default: "" },
}, { _id: false });

const additionalInputsSchema = new Schema({
    annualConsumptionKwh: { type: Number, default: null },
    preferredContactTime: { type: String, default: "" },
    roofPhotoProvided: { type: Boolean, default: false },
    meterCabinetPhotoProvided: { type: Boolean, default: false },
    desiredCallbackTime: { type: String, default: "" },
    topic: { type: String, default: "" },
    notes: { type: String, default: "" },
}, { _id: false });

const anfragewegSchema = new Schema({
    source: { type: String, default: "" },
    sourceUrl: { type: String, default: "" },
    referrer: { type: String, default: "" },
    entryPointLabel: { type: String, default: "" },
    ctaLabel: { type: String, default: "" },
    submittedAt: { type: String, default: "" },
}, { _id: false });

const attachmentSchema = new Schema({
    id: { type: String, required: true },
    type: { type: String, enum: ["roofPhoto", "meterCabinetPhoto", "other"], default: "other" },
    fileName: { type: String, default: "" },
    fileUrl: { type: String, default: "" },
    mimeType: { type: String, default: "" },
    uploadedAt: { type: String, default: "" },
}, { _id: false });

const consentSchema = new Schema({
    privacyAccepted: { type: Boolean, required: true },
    privacyAcceptedAt: { type: String, default: "" },
    privacyVersion: { type: String, default: "v1" },
}, { _id: false });

const metaSchema = new Schema({
    createdAt: { type: String, default: "" },
    updatedAt: { type: String, default: "" },
    submittedAt: { type: String, default: "" },
    userAgent: { type: String, default: "" },
    deviceType: { type: String, default: "" },
    locale: { type: String, default: "de-DE" },
    ipHash: { type: String, default: "" },
}, { _id: false });

const assignedToSchema = new Schema({
    employeeId: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    role: { type: String, default: "" },
    assignedAt: { type: String, required: true },
    assignedBy: { type: String, default: "" },
}, { _id: false });

const todoSchema = new Schema({
    dueDate: { type: String, default: "" },
    note: { type: String, default: "" },
}, { _id: false });

const noteSchema = new Schema({
    id: { type: String, required: true },
    text: { type: String, required: true },
    authorId: { type: String, default: "" },
    authorName: { type: String, required: true },
    createdAt: { type: String, required: true },
}, { _id: false });

const activityLogEntrySchema = new Schema({
    id: { type: String, required: true },
    action: { type: String, required: true },
    actorId: { type: String, default: "" },
    actorName: { type: String, required: true },
    createdAt: { type: String, required: true },
    metadata: { type: String, default: "" },
}, { _id: false });

const adminSchema = new Schema({
    assignedTo: { type: assignedToSchema, default: null },
    todo: { type: todoSchema, default: null },
    internalNotes: { type: [noteSchema], default: [] },
    activityLog: { type: [activityLogEntrySchema], default: [] },
}, { _id: false });

const schema = new Schema({
    _id: { type: String, required: true },
    schemaVersion: { type: String, default: "contactRequest.v1" },
    status: { type: String, enum: REQUEST_STATUSES, default: "Neu" },
    inquiryType: { type: String, required: true },
    inquiryTypeKey: { type: String, required: true },
    requestMode: { type: String, enum: REQUEST_MODES, required: true },

    kunde: { type: kundeSchema, required: true },
    additionalCustomerInputs: { type: additionalInputsSchema, default: () => ({}) },
    message: { type: String, default: "" },

    anfrageweg: { type: anfragewegSchema, default: () => ({}) },
    anfrageSnapshot: { type: Schema.Types.Mixed, default: {} },
    wirtschaftlichkeitsrechnung: { type: Schema.Types.Mixed, default: null },

    attachments: { type: [attachmentSchema], default: [] },

    consent: { type: consentSchema, required: true },
    metainformationen: { type: metaSchema, default: () => ({}) },

    admin: { type: adminSchema, default: () => ({ internalNotes: [], activityLog: [] }) },
}, {
    timestamps: {
        createdAt: "createdAt",
        updatedAt: "updatedAt",
    },
});

export const ContactRequestModel = mongoose.model<ContactRequest>("ContactRequest", schema, "ContactRequests");
