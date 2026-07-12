// Ported from the Claude Design prototype's lebe-offer-model.js "Rechenkern"
// (computeSystem/computeEconomics) and derivation helpers used on offer
// cards and detail pages. Pure functions — no network/mock coupling.

import { catalog, componentTemplates, requirementTemplates, serviceTemplates } from './mockData';
import type {
  CalculatedSystem,
  MainComponentListItem,
  MainProductSlot,
  Offer,
  OfferEconomicsInput,
  OfferEconomicsResult,
  OfferMainProducts,
  RequirementsSplit,
  ServiceListItem,
  TechComponentListItem,
} from './types';

export function num(n: number, digits?: number): string {
  return new Intl.NumberFormat('de-DE', { maximumFractionDigits: digits ?? 0 }).format(n);
}

export function euro(n: number): string {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(Math.round(n));
}

/** Automatic system values derived from the main products — never set manually. */
export function computeSystem(mainProducts: OfferMainProducts): CalculatedSystem {
  const sys: CalculatedSystem = {};

  const mod = mainProducts.solarModule;
  if (mod && catalog[mod.productId]) {
    const p = catalog[mod.productId];
    sys.moduleCount = mod.quantity;
    sys.pvPowerKwp = Math.round(((mod.quantity * p.power) / 1000) * 100) / 100;
    if (p.panelHeightMeters && p.panelWidthMeters) {
      sys.moduleAreaM2 = Math.round(mod.quantity * p.panelHeightMeters * p.panelWidthMeters * 10) / 10;
    }
  }
  const inv = mainProducts.inverter;
  if (inv && catalog[inv.productId]) sys.inverterPowerKw = inv.quantity * catalog[inv.productId].power;
  const st = mainProducts.storage;
  if (st && catalog[st.productId]) sys.storageCapacityKwh = Math.round(st.quantity * catalog[st.productId].power * 100) / 100;
  const wb = mainProducts.wallbox;
  if (wb && catalog[wb.productId]) sys.wallboxPowerKw = wb.quantity * catalog[wb.productId].power;
  if (sys.pvPowerKwp && sys.inverterPowerKw) sys.dcAcRatio = Math.round((sys.pvPowerKwp / sys.inverterPowerKw) * 100) / 100;

  return sys;
}

/** Assumption-based economics (self-consumption / autarky / savings). */
export function computeEconomics(sys: CalculatedSystem, eco: OfferEconomicsInput & { priceAmount?: number }): OfferEconomicsResult {
  const price = (eco.electricityPriceCentPerKwh || 0) / 100;
  const tariff = (eco.feedInTariffCentPerKwh || 0) / 100;
  const yieldKwh = (sys.pvPowerKwp || 0) * (eco.specificYieldKwhPerKwp || 0);
  const selfUsed = yieldKwh * (eco.selfConsumptionRate || 0);
  const fedIn = Math.max(0, yieldKwh - selfUsed);
  const savings = selfUsed * price;
  const feedInRev = fedIn * tariff;
  const total = savings + feedInRev;
  const amort = total > 0 && eco.priceAmount ? eco.priceAmount / total : 0;

  const gridTodayCost = (eco.annualConsumptionKwh || 0) * price;
  const gridAfterKwh = Math.max(0, (eco.annualConsumptionKwh || 0) - selfUsed);
  const gridAfterCost = gridAfterKwh * price;

  return {
    expectedAnnualYieldKwh: Math.round(yieldKwh),
    selfUsedEnergyKwh: Math.round(selfUsed),
    fedInEnergyKwh: Math.round(fedIn),
    estimatedSavingsPerYear: savings,
    estimatedFeedInRevenuePerYear: feedInRev,
    estimatedTotalBenefitPerYear: total,
    amortizationYears: amort,
    gridTodayCost,
    gridAfterCost,
  };
}

const SLOT_ORDER: [MainProductSlot, string][] = [
  ['solarModule', 'Solarmodule'],
  ['inverter', 'Wechselrichter'],
  ['storage', 'Heimspeicher'],
  ['wallbox', 'Ladestation'],
  ['heatingSystem', 'Heizsystem'],
];

export function mainComponentsList(o: Offer): MainComponentListItem[] {
  return SLOT_ORDER.filter(([k]) => o.mainProducts[k]).map(([k, catLabel]) => {
    const ref = o.mainProducts[k]!;
    const p = catalog[ref.productId];
    return {
      slotKey: k,
      category: catLabel,
      manufacturer: p?.manufacturer,
      name: p?.name,
      logo: p?.logo,
      hasLogo: !!p?.logo,
      image: p?.image || '',
      hasImage: !!p?.image,
      beschreibung: p?.beschreibung || '',
      quantity: ref.quantity,
      qtyLabel: ref.quantity + '× ' + (k === 'solarModule' ? 'Modul' : 'Stück'),
      power: p?.power,
      unit: p?.unit,
      powerLabel: p?.power ? num(p.power, p.unit === 'W' ? 0 : 1) + ' ' + p.unit : '',
      warranty: p?.warranty,
    };
  });
}

export function techComponentsList(o: Offer): TechComponentListItem[] {
  return (o.systemComponentIds || [])
    .map((id) => componentTemplates.find((c) => c.id === id))
    .filter((c): c is NonNullable<typeof c> => !!c && c.visibility === 'public')
    .map((c) => ({ label: c.publicLabel || c.name, desc: c.publicDescription, optional: c.optional }));
}

export function servicesList(o: Offer): ServiceListItem[] {
  return (o.serviceIds || [])
    .map((id) => serviceTemplates.find((s) => s.id === id))
    .filter((s): s is NonNullable<typeof s> => !!s && s.visibility === 'public' && s.included)
    .map((s) => ({ name: s.name, descriptionLines: s.descriptionLines || [] }));
}

export function requirementsSplit(o: Offer): RequirementsSplit {
  const chosen = (o.requirementIds || [])
    .map((id) => requirementTemplates.find((r) => r.id === id))
    .filter((r): r is NonNullable<typeof r> => !!r && r.visibility === 'public');
  const priceLabelMap: Record<string, string> = { included: 'inklusive', onRequest: 'auf Anfrage', fixed: 'Festpreis', startingFrom: 'ab' };
  return {
    requirements: chosen.filter((r) => r.type === 'requirement'),
    optionalWork: chosen
      .filter((r) => r.type === 'optionalAdditionalWork')
      .map((r) => ({
        title: r.title,
        description: r.description,
        priceLabel: r.priceType === 'startingFrom' && r.optionalPrice ? 'ab ' + euro(r.optionalPrice) : priceLabelMap[r.priceType],
      })),
  };
}

export function keyFactsList(o: Offer): string[] {
  const sys = computeSystem(o.mainProducts);
  const facts: string[] = [];
  if (sys.moduleCount) facts.push(sys.moduleCount + ' Module');
  if (sys.pvPowerKwp) facts.push(num(sys.pvPowerKwp, 1) + ' kWp');
  if (sys.storageCapacityKwh) facts.push(num(sys.storageCapacityKwh, 1) + ' kWh Speicher');
  if (sys.wallboxPowerKw) facts.push('Wallbox inkl.');
  facts.push('Smart Meter inkl.');
  return facts;
}
