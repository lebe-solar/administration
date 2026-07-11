// Ported from the Claude Design prototype's solar-calc.js — a separate, pure
// calculation engine powering the PV-Simulator and offer-detail economics
// charts: bilinear interpolation over lookup tables (Eigenverbrauch /
// Autarkiegrad by PV-ratio × battery-ratio). "HTW-Berlin-artig, illustrativ,
// nicht amtlich" — not an official/certified calculation, ported as-is.

export const YIELD = 950; // kWh per kWp per year (Rhein-Main region)
export const PRICE = 0.35; // €/kWh — electricity price
export const FEEDIN = 0.079; // €/kWh — feed-in tariff (partial feed-in < 10 kWp)

const PV_RATIOS = [0, 0.5, 1, 1.5, 2, 2.5, 3]; // kWp per 1,000 kWh annual consumption
const BAT_RATIOS = [0, 0.5, 1, 1.5, 2]; // kWh storage per 1,000 kWh annual consumption

// Self-consumption share (%) — share of PV generation used directly
const EIGEN_TABLE = [
  [0, 0, 0, 0, 0],
  [85, 90, 93, 95, 96],
  [60, 72, 78, 82, 85],
  [45, 58, 65, 70, 74],
  [35, 47, 54, 59, 63],
  [28, 39, 46, 51, 55],
  [23, 33, 40, 45, 49],
];

// Autarky rate (%) — share of consumption covered by the PV system
const AUTARK_TABLE = [
  [0, 0, 0, 0, 0],
  [35, 45, 50, 53, 55],
  [45, 58, 65, 69, 72],
  [50, 65, 72, 77, 80],
  [52, 68, 76, 81, 85],
  [53, 70, 79, 84, 87],
  [53, 71, 80, 86, 89],
];

function clampIndex(ratios: number[], v: number): { i0: number; i1: number; t: number } {
  if (v <= ratios[0]) return { i0: 0, i1: 0, t: 0 };
  if (v >= ratios[ratios.length - 1]) {
    const i = ratios.length - 1;
    return { i0: i, i1: i, t: 0 };
  }
  for (let i = 0; i < ratios.length - 1; i++) {
    if (v >= ratios[i] && v <= ratios[i + 1]) {
      const t = (v - ratios[i]) / (ratios[i + 1] - ratios[i]);
      return { i0: i, i1: i + 1, t };
    }
  }
  return { i0: 0, i1: 0, t: 0 };
}

function bilinear(table: number[][], ratioPv: number, ratioBattery: number): number {
  const px = clampIndex(PV_RATIOS, ratioPv);
  const bx = clampIndex(BAT_RATIOS, ratioBattery);
  const v00 = table[px.i0][bx.i0];
  const v01 = table[px.i0][bx.i1];
  const v10 = table[px.i1][bx.i0];
  const v11 = table[px.i1][bx.i1];
  const top = v00 + (v01 - v00) * bx.t;
  const bot = v10 + (v11 - v10) * bx.t;
  return top + (bot - top) * px.t;
}

export function eigenAutark(ratioPv: number, ratioBattery: number): { eigenPct: number; autarkPct: number } {
  ratioPv = Math.max(0, Number(ratioPv) || 0);
  ratioBattery = Math.max(0, Number(ratioBattery) || 0);
  return {
    eigenPct: Math.round(bilinear(EIGEN_TABLE, ratioPv, ratioBattery)),
    autarkPct: Math.round(bilinear(AUTARK_TABLE, ratioPv, ratioBattery)),
  };
}

export interface SolarCalcOptions {
  yieldPerKwp?: number;
  price?: number;
  feedInTariff?: number;
}

export interface SolarCalcResult {
  gen: number;
  ratioPv: number;
  ratioBattery: number;
  autark: number;
  eigen: number;
  autarkPct: number;
  eigenPct: number;
  directEigenPct: number;
  directAutarkPct: number;
  selfUsed: number;
  gridDraw: number;
  exported: number;
  savings: number;
  feedIn: number;
  gridCost: number;
  totalBenefit: number;
}

export function compute(consumption: number, pvKwp: number, batteryKwh: number, opts: SolarCalcOptions = {}): SolarCalcResult {
  consumption = Math.max(500, Number(consumption) || 0);
  pvKwp = Math.max(0, Number(pvKwp) || 0);
  batteryKwh = Math.max(0, Number(batteryKwh) || 0);
  const yieldPerKwp = Number(opts.yieldPerKwp) > 0 ? Number(opts.yieldPerKwp) : YIELD;
  const price = Number(opts.price) > 0 ? Number(opts.price) : PRICE;
  const feedInTariff = Number(opts.feedInTariff) >= 0 ? Number(opts.feedInTariff) : FEEDIN;

  const gen = pvKwp * yieldPerKwp;
  const ratioPv = (pvKwp / consumption) * 1000;
  const ratioBattery = (batteryKwh / consumption) * 1000;

  const { eigenPct, autarkPct } = eigenAutark(ratioPv, ratioBattery);
  const direct = eigenAutark(ratioPv, 0); // without storage, for comparison

  const autark = autarkPct / 100;
  const eigen = eigenPct / 100;

  const selfUsed = autark * consumption; // kWh from own PV consumed
  const gridDraw = (1 - autark) * consumption; // kWh drawn from grid
  const exported = Math.max(0, gen - selfUsed); // kWh fed in

  const savings = selfUsed * price; // €/year via self-consumption
  const feedIn = exported * feedInTariff; // €/year feed-in tariff
  const gridCost = gridDraw * price; // €/year remaining grid draw
  const totalBenefit = savings + feedIn; // €/year total benefit

  return {
    gen, ratioPv, ratioBattery,
    autark, eigen,
    autarkPct, eigenPct,
    directEigenPct: direct.eigenPct, directAutarkPct: direct.autarkPct,
    selfUsed, gridDraw, exported,
    savings, feedIn, gridCost, totalBenefit,
  };
}

export function euro(n: number): string {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(Math.round(n));
}

export function num(n: number, digits?: number): string {
  return new Intl.NumberFormat('de-DE', { maximumFractionDigits: digits ?? 0 }).format(n);
}
