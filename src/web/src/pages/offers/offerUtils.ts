import type { OfferProducts, Product } from '../../types';

export interface Slot {
  key: 'solarModule' | 'inverter' | 'storage' | 'wallbox' | 'heatingSystem';
  cat: Product['category'];
  label: string;
  icon: string;
  showDims?: boolean;
  optional?: boolean;
}

export const SLOTS: Slot[] = [
  { key: 'solarModule', cat: 'Solarmodule', label: 'Solar Module', icon: 'panel', showDims: true },
  { key: 'inverter', cat: 'Wechselrichter', label: 'Inverter', icon: 'inverter' },
  { key: 'storage', cat: 'Heimspeicher', label: 'Storage', icon: 'battery' },
  { key: 'wallbox', cat: 'Ladestationen', label: 'Wallbox / Ladestation', icon: 'plug', optional: true },
  { key: 'heatingSystem', cat: 'Heizsysteme', label: 'Heating System', icon: 'heat', optional: true },
];

export function linkedProductCount(products?: OfferProducts | Record<string, unknown> | null) {
  if (!products) return 0;
  const p = products as Record<string, unknown>;
  return SLOTS.reduce((n, s) => n + (p[s.key + 'Id'] ? 1 : 0), 0);
}
