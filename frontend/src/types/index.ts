export type ProductStatus = 'Active' | 'Draft' | 'Hidden';

export interface Category {
  key: 'Solarmodule' | 'Wechselrichter' | 'Heimspeicher' | 'Ladestationen' | 'Heizsysteme';
  en: string;
  prefix: string;
  icon: string;
}

export interface Manufacturer {
  id: number;
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
  manufacturer_id: number;
  Garantie: string;
  Power: number | null;
  Unit: string;
  Spezifikation: string | null;
  hasSpec: boolean;
  Logo: string | null;
  Status: ProductStatus;
  panelHeightMeters: number | null;
  panelWidthMeters: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface OfferItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  descriptionLines: string[];
  updatedAt?: string;
}

export interface OfferProducts {
  solarModuleId?: string | null;
  solarModuleCount?: number;
  inverterId?: string | null;
  inverterCount?: number;
  storageId?: string | null;
  storageCount?: number;
  wallboxId?: string | null;
  wallboxCount?: number;
  heatingSystemId?: string | null;
  heatingSystemCount?: number;
}

export interface Offer {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  conditions: string;
  validUntil: string;
  designedFor: string;
  system: string;
  price: string;
  priceAmount?: number | null;
  priceCurrency?: 'EUR';
  priceLabel?: string;
  link: string;
  slug: string;
  previewImage: string | null;
  products: OfferProducts;
  inclusive: OfferItem[];
  allowChanges: boolean;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ApiErrors {
  errors?: Record<string, string>;
  error?: string;
}
