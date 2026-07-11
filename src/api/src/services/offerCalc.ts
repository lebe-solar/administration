import { OfferMainProducts, OfferEconomics } from "../models/offer";

// Pure calculation helpers shared by the offers route (calculatedSystem/economics on
// read) and contact-request submission (computedSystemSnapshot/wirtschaftlichkeitsrechnung).
// Mirrored client-side in src/web/src/lib/offerCalc.ts so the builder can recompute live
// without a round-trip; keep both in sync when changing formulas.

export type ProductLite = {
    id: string
    category: string
    Power?: number | null
    Unit?: string
    panelHeightMeters?: number | null
    panelWidthMeters?: number | null
};

export type CalculatedSystem = {
    pvPowerKwp: number | null
    moduleCount: number
    moduleAreaM2: number | null
    inverterPowerKw: number | null
    storageCapacityKwh: number | null
    wallboxPowerKw: number | null
    dcAcRatio: number | null
};

export function computeSystem(mainProducts: OfferMainProducts, productsById: Record<string, ProductLite>): CalculatedSystem {
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

    const inverterPowerKw = inverter && mainProducts.inverter
        ? (inverter.Power || 0) * (mainProducts.inverter.quantity || 1)
        : null;

    const storageCapacityKwh = storage && mainProducts.storage
        ? (storage.Power || 0) * (mainProducts.storage.quantity || 1)
        : null;

    const wallboxPowerKw = wallbox && mainProducts.wallbox
        ? (wallbox.Power || 0) * (mainProducts.wallbox.quantity || 1)
        : null;

    const dcAcRatio = pvPowerKwp && inverterPowerKw ? pvPowerKwp / inverterPowerKw : null;

    return { pvPowerKwp, moduleCount, moduleAreaM2, inverterPowerKw, storageCapacityKwh, wallboxPowerKw, dcAcRatio };
}

export type EconomicsResult = {
    expectedAnnualYieldKwh: number | null
    selfUsedEnergyKwh: number | null
    fedInEnergyKwh: number | null
    estimatedSavingsPerYear: number | null
    estimatedFeedInRevenuePerYear: number | null
    estimatedTotalBenefitPerYear: number | null
    amortizationYears: number | null
};

export function computeEconomics(pvPowerKwp: number | null, economics: OfferEconomics, priceAmount?: number | null): EconomicsResult {
    if (!economics.enabled || !pvPowerKwp) {
        return {
            expectedAnnualYieldKwh: null, selfUsedEnergyKwh: null, fedInEnergyKwh: null,
            estimatedSavingsPerYear: null, estimatedFeedInRevenuePerYear: null,
            estimatedTotalBenefitPerYear: null, amortizationYears: null,
        };
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
