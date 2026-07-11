import mongoose, { Schema } from "mongoose";

export type MainProductSlot = "solarModule" | "inverter" | "storage" | "wallbox" | "heatingSystem";

export type OfferMainProducts = Partial<Record<MainProductSlot, { productId: string; quantity: number }>>;

export type OfferSystemComponent = {
    id: string
    name: string
    category: string
    quantity: number
    unit: string
    internalPrice: number
    publicLabel: string
    publicDescription: string
    visibility: "public" | "internal" | "hidden"
    included: boolean
    optional: boolean
}

export type OfferIncludedService = {
    id: string
    name: string
    quantity: number
    internalPrice: number
    publicDescription: string
    descriptionLines: string[]
    category: string
    visibility: "public" | "internal" | "hidden"
    included: boolean
    taxRelevantForCraftsmanWork: boolean
}

export type OfferRequirement = {
    id: string
    title: string
    description: string
    type: "requirement" | "optionalAdditionalWork" | "exclusion"
    visibility: "public" | "internal" | "hidden"
    priceType: "included" | "onRequest" | "fixed" | "startingFrom"
    optionalPrice?: number | null
}

export type OfferEconomics = {
    enabled: boolean
    annualConsumptionKwh?: number
    electricityPriceCentPerKwh?: number
    specificYieldKwhPerKwp?: number
    selfConsumptionRate?: number
    autarkyRate?: number
    feedInTariffCentPerKwh?: number
    observationYears?: number
    electricityPriceIncreasePercent?: number
    disclaimer: string
}

export type Offer = {
    id: string
    title: string
    subtitle?: string
    status: "Active" | "Draft" | "Hidden"

    targetCustomer?: string
    designedFor?: string
    shortDescription?: string
    longDescription?: string

    priceType: "fixed" | "starting_from" | "indicative" | "on_request"
    priceAmount?: number | null
    priceCurrency?: string
    priceLabel?: string
    taxNote?: string
    validUntil?: string | null

    slug?: string | null
    publicUrl?: string
    previewImageUrl?: string | null

    mainProducts: OfferMainProducts
    systemComponents: OfferSystemComponent[]
    includedServices: OfferIncludedService[]
    requirementsAndExclusions: OfferRequirement[]
    economics: OfferEconomics

    allowChanges: boolean
    createdAt?: Date
    updatedAt?: Date
}

const mainProductRefSchema = new Schema({
    productId: { type: String, required: true },
    quantity: { type: Number, default: 1 },
}, { _id: false });

const mainProductsSchema = new Schema({
    solarModule: { type: mainProductRefSchema, default: undefined },
    inverter: { type: mainProductRefSchema, default: undefined },
    storage: { type: mainProductRefSchema, default: undefined },
    wallbox: { type: mainProductRefSchema, default: undefined },
    heatingSystem: { type: mainProductRefSchema, default: undefined },
}, { _id: false });

const systemComponentSchema = new Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    category: { type: String, default: "" },
    quantity: { type: Number, default: 1 },
    unit: { type: String, default: "Stück" },
    internalPrice: { type: Number, default: 0 },
    publicLabel: { type: String, default: "" },
    publicDescription: { type: String, default: "" },
    visibility: { type: String, enum: ["public", "internal", "hidden"], default: "public" },
    included: { type: Boolean, default: true },
    optional: { type: Boolean, default: false },
}, { _id: false });

const includedServiceSchema = new Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    quantity: { type: Number, default: 1 },
    internalPrice: { type: Number, default: 0 },
    publicDescription: { type: String, default: "" },
    descriptionLines: { type: [String], default: [] },
    category: { type: String, default: "" },
    visibility: { type: String, enum: ["public", "internal", "hidden"], default: "public" },
    included: { type: Boolean, default: true },
    taxRelevantForCraftsmanWork: { type: Boolean, default: false },
}, { _id: false });

const requirementSchema = new Schema({
    id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    type: { type: String, enum: ["requirement", "optionalAdditionalWork", "exclusion"], default: "requirement" },
    visibility: { type: String, enum: ["public", "internal", "hidden"], default: "public" },
    priceType: { type: String, enum: ["included", "onRequest", "fixed", "startingFrom"], default: "included" },
    optionalPrice: { type: Number, default: null },
}, { _id: false });

const economicsSchema = new Schema({
    enabled: { type: Boolean, default: true },
    annualConsumptionKwh: { type: Number, default: 4500 },
    electricityPriceCentPerKwh: { type: Number, default: 35 },
    specificYieldKwhPerKwp: { type: Number, default: 950 },
    selfConsumptionRate: { type: Number, default: 0.35 },
    autarkyRate: { type: Number, default: 0.55 },
    feedInTariffCentPerKwh: { type: Number, default: 7.9 },
    observationYears: { type: Number, default: 20 },
    electricityPriceIncreasePercent: { type: Number, default: 3 },
    disclaimer: {
        type: String,
        default: "Diese Berechnung ist eine unverbindliche Beispielrechnung. Die tatsächliche Wirtschaftlichkeit hängt unter anderem von Dachausrichtung, Verschattung, Verbrauchsprofil, Strompreis, Inbetriebnahmezeitpunkt und technischer Auslegung ab.",
    },
}, { _id: false });

const schema = new Schema({
    _id: { type: String, required: true },
    title: { type: String, required: true },
    subtitle: { type: String, default: "" },
    status: { type: String, required: true, enum: ["Active", "Draft", "Hidden"], default: "Draft" },

    targetCustomer: { type: String, default: "" },
    designedFor: { type: String, default: "" },
    shortDescription: { type: String, default: "" },
    longDescription: { type: String, default: "" },

    priceType: { type: String, enum: ["fixed", "starting_from", "indicative", "on_request"], default: "fixed" },
    priceAmount: { type: Number, default: null },
    priceCurrency: { type: String, default: "EUR" },
    priceLabel: { type: String, default: "" },
    taxNote: { type: String, default: "" },
    validUntil: { type: String, default: null },

    slug: { type: String, default: null },
    publicUrl: { type: String, default: "" },
    previewImageUrl: { type: String, default: null },

    mainProducts: { type: mainProductsSchema, default: () => ({}) },
    systemComponents: { type: [systemComponentSchema], default: [] },
    includedServices: { type: [includedServiceSchema], default: [] },
    requirementsAndExclusions: { type: [requirementSchema], default: [] },
    economics: { type: economicsSchema, default: () => ({}) },

    allowChanges: { type: Boolean, default: false },
}, {
    timestamps: {
        createdAt: "createdAt",
        updatedAt: "updatedAt",
    },
});

export const OfferModel = mongoose.model<Offer>("Offer", schema, "Offers");
