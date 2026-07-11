import type { MainProductSlot, OfferMainProducts, Offer, Product } from '../../types';

export interface Slot {
  key: MainProductSlot;
  cat: Product['category'];
  label: string;
  icon: string;
  showDims?: boolean;
  optional?: boolean;
}

export const SLOTS: Slot[] = [
  { key: 'solarModule', cat: 'Solarmodule', label: 'Solarmodule', icon: 'panel', showDims: true },
  { key: 'inverter', cat: 'Wechselrichter', label: 'Wechselrichter', icon: 'inverter' },
  { key: 'storage', cat: 'Heimspeicher', label: 'Heimspeicher', icon: 'battery' },
  { key: 'wallbox', cat: 'Ladestationen', label: 'Ladestationen / Wallbox', icon: 'plug', optional: true },
  { key: 'heatingSystem', cat: 'Heizsysteme', label: 'Heizsysteme', icon: 'heat', optional: true },
];

export function linkedProductCount(mainProducts?: OfferMainProducts | null) {
  if (!mainProducts) return 0;
  return SLOTS.reduce((n, s) => n + (mainProducts[s.key] ? 1 : 0), 0);
}

export interface MainComponentEntry {
  slot: Slot;
  product: Product;
  quantity: number;
}

// Compact "Verbaut im Paket" list — the offer/product-card mini-cards. Skips slots
// whose product no longer exists in the catalog rather than rendering a broken row.
export function mainComponentsList(offer: Pick<Offer, 'mainProducts'>, productsById: Record<string, Product>): MainComponentEntry[] {
  return SLOTS.map(slot => {
    const ref = offer.mainProducts[slot.key];
    if (!ref) return null;
    const product = productsById[ref.productId];
    if (!product) return null;
    return { slot, product, quantity: ref.quantity || 1 };
  }).filter((v): v is MainComponentEntry => !!v);
}

export function priceTypeLabel(t: Offer['priceType']) {
  return { fixed: 'Festpreis', starting_from: 'Preis ab', indicative: 'Indikativer Preis', on_request: 'Auf Anfrage' }[t] || t;
}

export const PRICE_TYPE_OPTIONS: { value: Offer['priceType']; label: string }[] = [
  { value: 'fixed', label: 'Festpreis' },
  { value: 'starting_from', label: 'Preis ab' },
  { value: 'indicative', label: 'Indikativer Preis' },
  { value: 'on_request', label: 'Auf Anfrage' },
];

export function displayPrice(offer: Pick<Offer, 'priceType' | 'priceAmount' | 'priceLabel'>) {
  if (offer.priceLabel) return offer.priceLabel;
  if (offer.priceType === 'on_request') return 'Preis auf Anfrage';
  if (offer.priceAmount == null) return '—';
  const amount = `${offer.priceAmount.toLocaleString('de-DE')} €`;
  return offer.priceType === 'starting_from' ? `ab ${amount}` : amount;
}

export { computeSystem, computeEconomics } from '../../lib/offerCalc';
