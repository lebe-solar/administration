import type { CalculatedSystem, OfferEconomics, OfferMainProducts, Product } from '../types';

// Mirrors src/api/src/services/offerCalc.ts so the builder can recompute live without a
// round-trip to the API. Keep both in sync when changing formulas.

export function computeSystem(mainProducts: OfferMainProducts, productsById: Record<string, Product>): CalculatedSystem {
  const solarModule = mainProducts.solarModule ? productsById[mainProducts.solarModule.productId] : undefined;
  const inverter = mainProducts.inverter ? productsById[mainProducts.inverter.productId] : undefined;
  const storage = mainProducts.storage ? productsById[mainProducts.storage.productId] : undefined;
  const wallbox = mainProducts.wallbox ? productsById[mainProducts.wallbox.productId] : undefined;

  const moduleCount = mainProducts.solarModule?.quantity || 0;
  const modulePowerW = solarModule?.Power || 0;
  const pvPowerKwp = moduleCount && modulePowerW ? (moduleCount * modulePowerW) / 1000 : null;

  const moduleAreaM2 = moduleCount && solarModule?.panelHeightMeters && solarModule?.panelWidthMeters
    ? moduleCount * solarModule.panelHeightMeters * solarModule.panelWidthMeters
    : null;

  const inverterPowerKw = inverter && mainProducts.inverter ? (inverter.Power || 0) * (mainProducts.inverter.quantity || 1) : null;
  const storageCapacityKwh = storage && mainProducts.storage ? (storage.Power || 0) * (mainProducts.storage.quantity || 1) : null;
  const wallboxPowerKw = wallbox && mainProducts.wallbox ? (wallbox.Power || 0) * (mainProducts.wallbox.quantity || 1) : null;
  const dcAcRatio = pvPowerKwp && inverterPowerKw ? pvPowerKwp / inverterPowerKw : null;

  return { pvPowerKwp, moduleCount, moduleAreaM2, inverterPowerKw, storageCapacityKwh, wallboxPowerKw, dcAcRatio };
}

export interface EconomicsResult {
  expectedAnnualYieldKwh: number | null;
  selfUsedEnergyKwh: number | null;
  fedInEnergyKwh: number | null;
  estimatedSavingsPerYear: number | null;
  estimatedFeedInRevenuePerYear: number | null;
  estimatedTotalBenefitPerYear: number | null;
  amortizationYears: number | null;
}

export function computeEconomics(pvPowerKwp: number | null, economics: OfferEconomics, priceAmount?: number | null): EconomicsResult {
  if (!economics.enabled || !pvPowerKwp) {
    return { expectedAnnualYieldKwh: null, selfUsedEnergyKwh: null, fedInEnergyKwh: null, estimatedSavingsPerYear: null, estimatedFeedInRevenuePerYear: null, estimatedTotalBenefitPerYear: null, amortizationYears: null };
  }

  const specificYield = economics.specificYieldKwhPerKwp ?? 950;
  const selfConsumptionRate = economics.selfConsumptionRate ?? 0.35;
  const electricityPrice = (economics.electricityPriceCentPerKwh ?? 35) / 100;
  const feedInTariff = (economics.feedInTariffCentPerKwh ?? 7.9) / 100;

  const expectedAnnualYieldKwh = pvPowerKwp * specificYield;
  const selfUsedEnergyKwh = expectedAnnualYieldKwh * selfConsumptionRate;
  const fedInEnergyKwh = expectedAnnualYieldKwh - selfUsedEnergyKwh;
  const estimatedSavingsPerYear = selfUsedEnergyKwh * electricityPrice;
  const estimatedFeedInRevenuePerYear = fedInEnergyKwh * feedInTariff;
  const estimatedTotalBenefitPerYear = estimatedSavingsPerYear + estimatedFeedInRevenuePerYear;
  const amortizationYears = priceAmount && estimatedTotalBenefitPerYear > 0 ? priceAmount / estimatedTotalBenefitPerYear : null;

  return { expectedAnnualYieldKwh, selfUsedEnergyKwh, fedInEnergyKwh, estimatedSavingsPerYear, estimatedFeedInRevenuePerYear, estimatedTotalBenefitPerYear, amortizationYears };
}

// Self-consumption / autarky as a function of PV size and battery size relative to
// consumption — an HTW-Berlin-style simplified curve (diminishing-returns saturation),
// consistent with the prototype's "PV-Simulator" model. Used for the offer detail
// preview's Eigenverbrauchsanteil/Autarkiegrad doughnuts.
export function estimateSelfConsumptionAndAutarky(pvPowerKwp: number, storageCapacityKwh: number, annualConsumptionKwh: number, specificYieldKwhPerKwp = 950) {
  if (!pvPowerKwp || !annualConsumptionKwh) return { selfConsumptionRate: 0, autarkyRate: 0 };
  const annualYieldKwh = pvPowerKwp * specificYieldKwhPerKwp;
  const ratioPv = annualYieldKwh / annualConsumptionKwh;
  const batteryBoost = storageCapacityKwh > 0 ? Math.min(0.25, (storageCapacityKwh / annualConsumptionKwh) * 8) : 0;

  const baseSelfConsumption = Math.min(0.9, 0.9 / (0.55 + ratioPv));
  const selfConsumptionRate = Math.min(0.95, baseSelfConsumption + batteryBoost);
  const autarkyRate = Math.min(0.95, (selfConsumptionRate * annualYieldKwh) / annualConsumptionKwh);

  return { selfConsumptionRate, autarkyRate };
}
