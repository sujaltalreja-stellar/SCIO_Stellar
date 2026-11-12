import type { Asset, DemoDataset } from "./types";

// ---------------------------------------------------------------------------
// Predictive maintenance: anomaly detection on vibration & pressure history,
// trend extrapolation to alarm limits, and a combined asset health score.
// ---------------------------------------------------------------------------

const DAY = 86_400_000;
const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
const sd = (xs: number[]) => {
  const m = mean(xs);
  return Math.sqrt(mean(xs.map((x) => (x - m) ** 2)));
};

/** ISO 10816-3 style vibration zones (mm/s RMS) for medium machines. */
export const VIBRATION_ZONES = { good: 2.8, acceptable: 4.5, alarm: 7.1 };

function slope(ys: number[]) {
  const xs = ys.map((_, i) => i);
  const mx = mean(xs);
  const my = mean(ys);
  const num = xs.reduce((a, x, i) => a + (x - mx) * (ys[i] - my), 0);
  const den = xs.reduce((a, x) => a + (x - mx) ** 2, 0) || 1;
  return num / den;
}

export interface SignalAnalysis {
  series: number[];
  baselineMean: number;
  baselineSd: number;
  upper: number;
  lower: number;
  anomalies: number[]; // indices
  recentMean: number;
  zRecent: number;
  slopePerDay: number; // last 14 days
}

function analyseSignal(series: number[]): SignalAnalysis {
  const base = series.slice(0, 60);
  const m = mean(base);
  const s = sd(base) || 0.05;
  const anomalies = series.map((v, i) => (Math.abs(v - m) > 3 * s ? i : -1)).filter((i) => i >= 0);
  const recent = series.slice(-7);
  return {
    series,
    baselineMean: m,
    baselineSd: s,
    upper: m + 3 * s,
    lower: m - 3 * s,
    anomalies,
    recentMean: mean(recent),
    zRecent: (mean(recent) - m) / s,
    slopePerDay: slope(series.slice(-14)),
  };
}

export interface AssetHealth {
  asset: Asset;
  vibration: SignalAnalysis;
  pressure: SignalAnalysis | null;
  healthScore: number; // 0-100 (100 = perfect)
  riskScore: number; // 0-100
  status: "Healthy" | "Watch" | "At risk" | "Critical";
  daysToAlarm: number | null;
  daysOverdue: number;
  inspectionFails: number;
  partsAvailable: number;
  partsTotal: number;
  drivers: string[];
}

export function assetHealth(ds: DemoDataset, asset: Asset): AssetHealth {
  const vib = analyseSignal(asset.vibration);
  const pres = asset.pressure.some((p) => p > 0) ? analyseSignal(asset.pressure) : null;
  const daysOverdue = Math.max(0, Math.round((new Date(ds.anchorDate).getTime() - new Date(asset.nextServiceDate).getTime()) / DAY));
  const inspectionFails = ds.inspections.filter((i) => i.assetId === asset.id && i.result === "Fail").length;
  const parts = ds.items.filter((i) => asset.partIds.includes(i.id));
  const partsAvailable = parts.filter((p) => p.stock >= 1).length;

  let daysToAlarm: number | null = null;
  if (vib.slopePerDay > 0.02 && vib.recentMean < VIBRATION_ZONES.alarm) {
    daysToAlarm = Math.max(1, Math.round((VIBRATION_ZONES.alarm - asset.vibration[asset.vibration.length - 1]) / vib.slopePerDay));
  } else if (vib.recentMean >= VIBRATION_ZONES.alarm) daysToAlarm = 0;

  const drivers: string[] = [];
  let risk = 5;
  if (vib.zRecent > 2) {
    risk += Math.min(45, vib.zRecent * 7);
    drivers.push(`Vibration ${vib.recentMean.toFixed(1)} mm/s vs ${vib.baselineMean.toFixed(1)} mm/s baseline`);
  }
  if (vib.slopePerDay > 0.05) {
    risk += Math.min(15, vib.slopePerDay * 40);
    drivers.push(`Rising ${vib.slopePerDay.toFixed(2)} mm/s per day over the last 14 days`);
  }
  if (pres && pres.zRecent < -2) {
    risk += Math.min(15, -pres.zRecent * 3);
    drivers.push(`Pressure ${pres.recentMean.toFixed(1)} bar, below normal ${pres.baselineMean.toFixed(1)} bar`);
  }
  if (daysOverdue > 0) {
    risk += Math.min(15, daysOverdue / 2);
    drivers.push(`Maintenance ${daysOverdue} days overdue`);
  }
  if (inspectionFails >= 2) {
    risk += inspectionFails * 4;
    drivers.push(`${inspectionFails} failed inspections in 12 months`);
  }
  if (partsAvailable < parts.length) drivers.push(`${parts.length - partsAvailable} required spare part(s) out of stock`);

  const riskScore = Math.round(Math.min(100, risk));
  const healthScore = 100 - riskScore;
  const status = riskScore >= 70 ? "Critical" : riskScore >= 45 ? "At risk" : riskScore >= 25 ? "Watch" : "Healthy";
  return { asset, vibration: vib, pressure: pres, healthScore, riskScore, status, daysToAlarm, daysOverdue, inspectionFails, partsAvailable, partsTotal: parts.length, drivers };
}

export function fleetHealth(ds: DemoDataset) {
  return ds.assets.map((a) => assetHealth(ds, a)).sort((a, b) => b.riskScore - a.riskScore);
}
