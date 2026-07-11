import mongoose, { Schema } from "mongoose";

export type ProjectInsightBadge = {
    id: string
    label: string
    type: "Leistung" | "Modulanzahl" | "Speicher" | "Wallbox" | "Hersteller" | "Besonderheit" | "Gebäudetyp" | "Sonstiges"
    visible: boolean
    sortOrder: number
}

export type ProjectInsightGalleryImage = {
    id: string
    image: string
    alt: string
    sortOrder: number
    visible: boolean
}

export type ProjectInsight = {
    id: string
    status: "Entwurf" | "Veröffentlicht" | "Archiviert"

    title: string
    locationLabel: string
    buildingType: string
    customerType: string
    projectYear?: number | null
    projectStatus: string

    mainImage: string | null
    imageAlt: string
    galleryImages: ProjectInsightGalleryImage[]

    badges: ProjectInsightBadge[]

    shortDescription: string
    internalNote?: string

    visibility: {
        landingPage: boolean
        aboutPage: boolean
        projectOverview: boolean
        offerDetails: boolean
        internalOnly: boolean
    }

    featured: boolean
    sortOrder: number
    publishedFrom?: string | null
    publishedUntil?: string | null

    createdAt?: Date
    updatedAt?: Date
}

const badgeSchema = new Schema({
    id: { type: String, required: true },
    label: { type: String, required: true },
    type: { type: String, enum: ["Leistung", "Modulanzahl", "Speicher", "Wallbox", "Hersteller", "Besonderheit", "Gebäudetyp", "Sonstiges"], default: "Sonstiges" },
    visible: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
}, { _id: false });

const galleryImageSchema = new Schema({
    id: { type: String, required: true },
    image: { type: String, required: true },
    alt: { type: String, default: "" },
    sortOrder: { type: Number, default: 0 },
    visible: { type: Boolean, default: true },
}, { _id: false });

const visibilitySchema = new Schema({
    landingPage: { type: Boolean, default: false },
    aboutPage: { type: Boolean, default: false },
    projectOverview: { type: Boolean, default: true },
    offerDetails: { type: Boolean, default: false },
    internalOnly: { type: Boolean, default: false },
}, { _id: false });

const schema = new Schema({
    _id: { type: String, required: true },
    status: { type: String, enum: ["Entwurf", "Veröffentlicht", "Archiviert"], default: "Entwurf" },

    title: { type: String, required: true },
    locationLabel: { type: String, required: true },
    buildingType: { type: String, default: "Einfamilienhaus" },
    customerType: { type: String, default: "Privatkunde" },
    projectYear: { type: Number, default: null },
    projectStatus: { type: String, default: "umgesetzt" },

    mainImage: { type: String, default: null },
    imageAlt: { type: String, default: "" },
    galleryImages: { type: [galleryImageSchema], default: [] },

    badges: { type: [badgeSchema], default: [] },

    shortDescription: { type: String, default: "" },
    internalNote: { type: String, default: "" },

    visibility: { type: visibilitySchema, default: () => ({}) },

    featured: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
    publishedFrom: { type: String, default: null },
    publishedUntil: { type: String, default: null },
}, {
    timestamps: {
        createdAt: "createdAt",
        updatedAt: "updatedAt",
    },
});

export const ProjectInsightModel = mongoose.model<ProjectInsight>("ProjectInsight", schema, "ProjectInsights");
