export type ProductStatus = 'Active' | 'Draft' | 'Hidden';

export interface Category {
  key: 'Solarmodule' | 'Wechselrichter' | 'Heimspeicher' | 'Ladestationen' | 'Heizsysteme';
  en: string;
  prefix: string;
  icon: string;
}

export interface Manufacturer {
  id: string;
  name: string;
  description: string;
  logo: string | null;
  link: string;
  linkedProducts?: number;
}

export interface Product {
  id: string;
  category: Category['key'];
  Header: string;
  Beschreibung: string;
  Hersteller: string;
  manufacturer_id: string;
  Garantie: string;
  Power: number | null;
  Unit: string;
  Spezifikation: string | null;
  hasSpec: boolean;
  Logo: string | null;
  image: string | null;
  Status: ProductStatus;
  panelHeightMeters: number | null;
  panelWidthMeters: number | null;
  createdAt: string;
  updatedAt: string;
}

export type MainProductSlot = 'solarModule' | 'inverter' | 'storage' | 'wallbox' | 'heatingSystem';

export type OfferMainProducts = Partial<Record<MainProductSlot, { productId: string; quantity: number }>>;

export type Visibility = 'public' | 'internal' | 'hidden';

export interface OfferSystemComponent {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  internalPrice: number;
  publicLabel: string;
  publicDescription: string;
  visibility: Visibility;
  included: boolean;
  optional: boolean;
}

export interface OfferIncludedService {
  id: string;
  name: string;
  quantity: number;
  internalPrice: number;
  publicDescription: string;
  descriptionLines: string[];
  category: string;
  visibility: Visibility;
  included: boolean;
  taxRelevantForCraftsmanWork: boolean;
}

export type RequirementType = 'requirement' | 'optionalAdditionalWork' | 'exclusion';
export type PriceType = 'included' | 'onRequest' | 'fixed' | 'startingFrom';

export interface OfferRequirement {
  id: string;
  title: string;
  description: string;
  type: RequirementType;
  visibility: Visibility;
  priceType: PriceType;
  optionalPrice?: number | null;
}

export interface OfferEconomics {
  enabled: boolean;
  annualConsumptionKwh?: number;
  electricityPriceCentPerKwh?: number;
  specificYieldKwhPerKwp?: number;
  selfConsumptionRate?: number;
  autarkyRate?: number;
  feedInTariffCentPerKwh?: number;
  observationYears?: number;
  electricityPriceIncreasePercent?: number;
  disclaimer: string;
  // Derived server-side, present on GET responses only.
  expectedAnnualYieldKwh?: number | null;
  selfUsedEnergyKwh?: number | null;
  fedInEnergyKwh?: number | null;
  estimatedSavingsPerYear?: number | null;
  estimatedFeedInRevenuePerYear?: number | null;
  estimatedTotalBenefitPerYear?: number | null;
  amortizationYears?: number | null;
}

export interface CalculatedSystem {
  pvPowerKwp: number | null;
  moduleCount: number;
  moduleAreaM2: number | null;
  inverterPowerKw: number | null;
  storageCapacityKwh: number | null;
  wallboxPowerKw: number | null;
  dcAcRatio: number | null;
}

export type OfferPriceType = 'fixed' | 'starting_from' | 'indicative' | 'on_request';

export interface Offer {
  id: string;
  title: string;
  subtitle: string;
  status: ProductStatus;

  targetCustomer: string;
  designedFor: string;
  shortDescription: string;
  longDescription: string;

  priceType: OfferPriceType;
  priceAmount?: number | null;
  priceCurrency?: string;
  priceLabel: string;
  taxNote: string;
  validUntil: string | null;

  slug: string | null;
  publicUrl: string;
  previewImageUrl: string | null;

  mainProducts: OfferMainProducts;
  calculatedSystem?: CalculatedSystem;
  systemComponents: OfferSystemComponent[];
  includedServices: OfferIncludedService[];
  requirementsAndExclusions: OfferRequirement[];
  economics: OfferEconomics;

  allowChanges: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SystemComponent {
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
  updatedAt?: string;
}

export interface Service {
  id: string;
  name: string;
  category: string;
  descriptionLines: string[];
  taxRelevantForCraftsmanWork: boolean;
  visibility: Visibility;
  included: boolean;
  updatedAt?: string;
}

export interface RequirementTemplate {
  id: string;
  title: string;
  description: string;
  type: RequirementType;
  visibility: Visibility;
  priceType: PriceType;
  optionalPrice?: number | null;
}

export type ProjectInsightStatus = 'Entwurf' | 'Veröffentlicht' | 'Archiviert';
export type BadgeType = 'Leistung' | 'Modulanzahl' | 'Speicher' | 'Wallbox' | 'Hersteller' | 'Besonderheit' | 'Gebäudetyp' | 'Sonstiges';

export interface ProjectInsightBadge {
  id: string;
  label: string;
  type: BadgeType;
  visible: boolean;
  sortOrder: number;
}

export interface ProjectInsightGalleryImage {
  id: string;
  image: string;
  alt: string;
  sortOrder: number;
  visible: boolean;
}

export interface ProjectInsight {
  id: string;
  status: ProjectInsightStatus;
  title: string;
  locationLabel: string;
  buildingType: string;
  customerType: string;
  projectYear?: number | null;
  projectStatus: string;
  mainImage: string | null;
  imageAlt: string;
  galleryImages: ProjectInsightGalleryImage[];
  badges: ProjectInsightBadge[];
  shortDescription: string;
  internalNote?: string;
  visibility: {
    landingPage: boolean;
    aboutPage: boolean;
    projectOverview: boolean;
    offerDetails: boolean;
    internalOnly: boolean;
  };
  featured: boolean;
  sortOrder: number;
  publishedFrom?: string | null;
  publishedUntil?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
}

export type RequestMode =
  | 'generalContact' | 'freeConsultation' | 'simulationIndividual' | 'simulationPackage'
  | 'contactPackage' | 'offerPackage' | 'productQuestion' | 'knowledgeQuestion';

export type RequestStatus = 'Neu' | 'Gelesen' | 'In Bearbeitung' | 'To-do' | 'Beantwortet' | 'Erledigt' | 'Archiviert' | 'Papierkorb';

export interface ContactRequest {
  id: string;
  schemaVersion: string;
  status: RequestStatus;
  inquiryType: string;
  inquiryTypeKey: string;
  requestMode: RequestMode;

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
    roofPhotoProvided?: boolean;
    meterCabinetPhotoProvided?: boolean;
    desiredCallbackTime?: string;
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

  attachments: { id: string; type: string; fileName: string; fileUrl: string; mimeType: string; uploadedAt: string }[];

  consent: { privacyAccepted: boolean; privacyAcceptedAt?: string; privacyVersion?: string };
  metainformationen: {
    createdAt?: string;
    updatedAt?: string;
    submittedAt?: string;
    userAgent?: string;
    deviceType?: string;
    locale?: string;
    ipHash?: string;
  };

  admin: {
    assignedTo?: { employeeId: string; name: string; email: string; role?: string; assignedAt: string; assignedBy?: string } | null;
    todo?: { dueDate?: string; note?: string } | null;
    internalNotes: { id: string; text: string; authorId?: string; authorName: string; createdAt: string }[];
    activityLog: { id: string; action: string; actorId?: string; actorName: string; createdAt: string; metadata?: string }[];
  };

  createdAt: string;
  updatedAt: string;
}

export interface ApiErrors {
  errors?: Record<string, string>;
  error?: string;
}

// ---- Public WebClient publishing / rebuild (Veröffentlichung) ----

export type PublicEntityType =
  'product' | 'manufacturer' | 'offer' | 'projectInsight' | 'knowledge' | 'landingPage' | 'settings' | 'manual';
export type PublicChangeType = 'created' | 'updated' | 'published' | 'hidden' | 'archived' | 'deleted' | 'manual';
export type PublicChangeStatus = 'pending' | 'publishing' | 'published' | 'ignored';

export interface PublicContentChange {
  id: string;
  entityType: PublicEntityType;
  entityId: string;
  entityTitle: string;
  changeType: PublicChangeType;
  reason: string;
  changedBy?: string;
  changedAt: string;
  publishedAt?: string | null;
  deploymentId?: string | null;
  status: PublicChangeStatus;
}

export type DeploymentStatus = 'queued' | 'running' | 'success' | 'failed';
export type DeploymentTriggerType = 'manual' | 'pendingChanges' | 'system';

export interface DeploymentAffectedChange {
  changeId: string;
  entityType: string;
  entityId: string;
  entityTitle: string;
  reason: string;
}

export interface PublicWebClientDeployment {
  id: string;
  status: DeploymentStatus;
  triggerType: DeploymentTriggerType;
  reason: string;
  triggeredBy?: string;
  triggeredAt: string;
  startedAt?: string | null;
  completedAt?: string | null;
  durationMs?: number | null;
  githubWorkflowId?: string;
  githubRunId?: string | null;
  githubRunUrl?: string | null;
  gitRef?: string;
  affectedChanges: DeploymentAffectedChange[];
  errorMessage?: string | null;
}

export type PublicationOverviewStatus = 'upToDate' | 'pending' | 'publishing' | 'failed';

export interface PublicationOverview {
  status: PublicationOverviewStatus;
  hasPendingChanges: boolean;
  pendingChanges: PublicContentChange[];
  latestDeployment: PublicWebClientDeployment | null;
  history: PublicWebClientDeployment[];
}
