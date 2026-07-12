// Mirrors the shapes in src/web/src/types/index.ts (the admin app) so that
// swapping these mocks for real fetch() calls against the admin API is
// mechanical, not a rewrite.

export type Category = 'Solarmodule' | 'Wechselrichter' | 'Heimspeicher' | 'Ladestationen' | 'Heizsysteme';

export interface CatalogProduct {
  productId: string;
  category: Category;
  manufacturer: string;
  name: string;
  power: number;
  unit: string;
  warranty: string;
  panelHeightMeters?: number;
  panelWidthMeters?: number;
  specPdf?: string;
  logo: string;
  image: string;
  beschreibung: string;
  hybrid?: boolean;
}

/** Catalog product shape used on the /produkte page (mirrors the admin's Product). */
export interface Product {
  id: string;
  category: Category;
  header: string;
  hersteller: string;
  power: number;
  unit: string;
  garantie: string;
  beschreibung: string;
  image: string;
  logo: string;
  status: 'Active' | 'Draft' | 'Hidden';
}

// ---- GET /api/products-page response shape (src/web-client-api) ----
// Fetched at build time by src/lib/productsPageData.ts — see that file for why /produkte is a
// Server Component instead of reading from mockData directly.

export interface ProductsPageProduct {
  id: string;
  name: string;
  category: Category;
  manufacturer: string;
  power: number | null;
  unit: string;
  warranty: string;
  logo: string | null;
  image: string | null;
  beschreibung: string;
  specPdf: string | null;
  panelHeightMeters: number | null;
  panelWidthMeters: number | null;
  updatedAt: string;
}

export interface ProductsPageManufacturer {
  id: string;
  name: string;
  logo: string | null;
  description: string;
  link: string;
  linkedProducts: number;
}

export interface ProductsPageGroup {
  category: Category;
  label: string;
  products: ProductsPageProduct[];
}

export interface ProductsPageData {
  schemaVersion: string;
  generatedAt: string;
  products: ProductsPageProduct[];
  manufacturers: ProductsPageManufacturer[];
  groupedProducts: ProductsPageGroup[];
  /** Local-only flag (not part of the API response) set when the build-time fetch failed. */
  fetchError?: boolean;
}

export type MainProductSlot = 'solarModule' | 'inverter' | 'storage' | 'wallbox' | 'heatingSystem';
export type OfferMainProducts = Partial<Record<MainProductSlot, { productId: string; quantity: number }>>;

export type Visibility = 'public' | 'internal' | 'hidden';

export interface ServiceTemplate {
  id: string;
  name: string;
  category: string;
  publicDescription: string;
  descriptionLines: string[];
  taxRelevantForCraftsmanWork: boolean;
  visibility: Visibility;
  included: boolean;
}

export interface ComponentTemplate {
  id: string;
  name: string;
  category: string;
  unit: string;
  internalPrice: number;
  publicLabel: string;
  publicDescription: string;
  visibility: Visibility;
  included: boolean;
  optional: boolean;
}

export type RequirementType = 'requirement' | 'optionalAdditionalWork' | 'exclusion';
export type PriceType = 'included' | 'onRequest' | 'fixed' | 'startingFrom';

export interface RequirementTemplate {
  id: string;
  title: string;
  description: string;
  type: RequirementType;
  visibility: Visibility;
  priceType: PriceType;
  optionalPrice?: number;
}

export interface OfferEconomicsInput {
  enabled: boolean;
  annualConsumptionKwh: number;
  electricityPriceCentPerKwh: number;
  specificYieldKwhPerKwp: number;
  selfConsumptionRate: number;
  autarkyRate: number;
  feedInTariffCentPerKwh: number;
  disclaimer: string;
}

export interface CalculatedSystem {
  moduleCount?: number;
  pvPowerKwp?: number;
  moduleAreaM2?: number;
  inverterPowerKw?: number;
  storageCapacityKwh?: number;
  wallboxPowerKw?: number;
  dcAcRatio?: number;
}

export interface OfferEconomicsResult {
  expectedAnnualYieldKwh: number;
  selfUsedEnergyKwh: number;
  fedInEnergyKwh: number;
  estimatedSavingsPerYear: number;
  estimatedFeedInRevenuePerYear: number;
  estimatedTotalBenefitPerYear: number;
  amortizationYears: number;
  gridTodayCost: number;
  gridAfterCost: number;
}

export interface FaqEntry {
  q: string;
  a: string;
}

export interface ProcessStep {
  step: string;
  title: string;
  text: string;
}

export type OfferPriceType = 'fixed' | 'starting_from' | 'indicative' | 'on_request';

/** The rich public offer/package shape (mirrors the admin's Offer). */
export interface Offer {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  badge?: string;
  status: 'active' | 'draft' | 'hidden';
  targetCustomer: string;
  designedFor: string;
  shortDescription: string;
  longDescription: string;

  priceType: OfferPriceType;
  priceAmount: number;
  priceCurrency: string;
  priceLabel: string;
  taxNote: string;
  validUntil: string;
  publicUrl: string;
  previewImageUrl: string;
  allowChanges: boolean;

  mainProducts: OfferMainProducts;
  systemComponentIds: string[];
  serviceIds: string[];
  requirementIds: string[];
  economics: OfferEconomicsInput;

  faq: FaqEntry[];
  process: ProcessStep[];
}

export interface MainComponentListItem {
  slotKey: MainProductSlot;
  category: string;
  manufacturer?: string;
  name?: string;
  logo?: string;
  hasLogo: boolean;
  image: string;
  hasImage: boolean;
  beschreibung: string;
  quantity: number;
  qtyLabel: string;
  power?: number;
  unit?: string;
  powerLabel: string;
  warranty?: string;
}

export interface TechComponentListItem {
  label: string;
  desc: string;
  optional: boolean;
}

export interface ServiceListItem {
  name: string;
  descriptionLines: string[];
}

export interface RequirementsSplit {
  requirements: RequirementTemplate[];
  optionalWork: { title: string; description: string; priceLabel: string }[];
}

// ---- Kontakt / contact-request payload (mirrors the admin's ContactRequest,
// minus server-assigned fields id/admin/metainformationen.createdAt). ----

export type RequestMode =
  | 'generalContact' | 'freeConsultation' | 'simulationIndividual' | 'simulationPackage'
  | 'contactPackage' | 'offerPackage' | 'productQuestion' | 'knowledgeQuestion';

export interface ContactRequestPayload {
  requestMode: RequestMode;
  inquiryType: string;
  inquiryTypeKey: string;

  kunde: {
    name: string;
    email: string;
    phone?: string;
    postalCode?: string;
    city?: string;
    street?: string;
    preferredContactTime?: string;
  };
  additionalCustomerInputs?: {
    annualConsumptionKwh?: number | null;
    preferredContactTime?: string;
    topic?: string;
    notes?: string;
  };
  message?: string;

  anfrageweg: {
    source?: string;
    sourceUrl?: string;
    referrer?: string;
    entryPointLabel?: string;
    ctaLabel?: string;
    submittedAt?: string;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  anfrageSnapshot?: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  wirtschaftlichkeitsrechnung?: Record<string, any> | null;

  consent: { privacyAccepted: boolean; privacyAcceptedAt?: string };
}
