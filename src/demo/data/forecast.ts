import type { DemoDataset, Item, PurchaseOrder } from "./types";
import { supplierPerformance } from "./analytics";

// ---------------------------------------------------------------------------
// Demand forecasting & replenishment.
// Holt-Winters additive model (level + trend + weekly seasonality) fitted on
// daily consumption history, with a 28-day hold-out backtest for accuracy.
// ---------------------------------------------------------------------------

const DAY = 86_400_000;
const SEASON = 7;
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
const mean = (xs: number[]) => (xs.length ? sum(xs) / xs.length : 0);

interface HwModel {
  level: number;
  trend: number;
  season: number[];
  residualSd: number;
}

function fitHoltWinters(y: number[], alpha = 0.18, beta = 0.02, gamma = 0.12): HwModel {
  const n = y.length;
  const first = y.slice(0, SEASON * 2);
  let level = mean(first);
  let trend = (mean(y.slice(SEASON, SEASON * 2)) - mean(y.slice(0, SEASON))) / SEASON;
  const season = Array.from({ length: SEASON }, (_, i) => mean([y[i], y[i + SEASON]].filter((v) => v !== undefined)) - level);
  const residuals: number[] = [];
  for (let t = 0; t < n; t++) {
    const s = season[t % SEASON];
    const fitted = level + trend + s;
    residuals.push(y[t] - fitted);
    const prevLevel = level;
    level = alpha * (y[t] - s) + (1 - alpha) * (level + trend);
    trend = beta * (level - prevLevel) + (1 - beta) * trend;
    season[t % SEASON] = gamma * (y[t] - level) + (1 - gamma) * s;
  }
  const r = residuals.slice(SEASON * 2);
  const residualSd = Math.sqrt(mean(r.map((x) => x * x))) || 0.5;
  return { level, trend, season, residualSd };
}

function project(m: HwModel, startIndex: number, horizon: number) {
  return Array.from({ length: horizon }, (_, h) => Math.max(0, m.level + (h + 1) * m.trend + m.season[(startIndex + h) % SEASON]));
}

export interface ItemForecast {
  item: Item;
  /** Daily forecast for the next `horizon` days. */
  forecast: number[];
  lower: number[];
  upper: number[];
  /** Mean absolute percentage accuracy on a 28-day hold-out (0..1). */
  accuracy: number;
  avgDaily30: number;
  forecastDaily30: number;
  trendPct: number; // forecast 30d vs last 30d actual
  onOrder: number;
  inbound: Array<{ po: PurchaseOrder; expectedDay: number }>;
  /** Projected stock per future day (after forecast demand and expected receipts). */
  projectedStock: number[];
  daysToCritical: number | null; // falls below minimum
  daysToStockout: number | null; // reaches zero
  safetyStock: number;
  reorderPoint: number;
  recommendedQty: number;
  recommendedCost: number;
  orderBy: string | null; // ISO date to place order to avoid falling below minimum
  urgency: "order-now" | "this-week" | "planned" | "ok";
}

export function forecastItem(ds: DemoDataset, item: Item, horizon = 60, supplierDelay = 0): ItemForecast {
  const y = item.dailyUsage;
  const n = y.length;

  // Backtest: fit on all but the last 28 days, compare.
  const hold = 28;
  const bt = fitHoltWinters(y.slice(0, n - hold));
  const btPred = project(bt, n - hold, hold);
  const actualSum = sum(y.slice(n - hold));
  const predSum = sum(btPred);
  const accuracy = actualSum > 0 ? Math.max(0, 1 - Math.abs(predSum - actualSum) / actualSum) : 1;

  const model = fitHoltWinters(y);
  const forecast = project(model, n, horizon);
  const z = 1.28; // 80% interval
  const lower = forecast.map((f, h) => Math.max(0, f - z * model.residualSd * Math.sqrt(1 + h * 0.05)));
  const upper = forecast.map((f, h) => f + z * model.residualSd * Math.sqrt(1 + h * 0.05));

  const today = new Date(ds.anchorDate).getTime();
  const inbound = ds.purchaseOrders
    .filter((p) => p.itemId === item.id && !p.deliveredDate)
    .map((po) => ({ po, expectedDay: Math.max(1, Math.round((new Date(po.promisedDate).getTime() - today) / DAY + supplierDelay)) }));
  const onOrder = sum(inbound.map((i) => i.po.quantity));

  const projectedStock: number[] = [];
  let stock = item.stock;
  let daysToCritical: number | null = item.stock < item.minStock ? 0 : null;
  let daysToStockout: number | null = item.stock <= 0 ? 0 : null;
  for (let d = 0; d < horizon; d++) {
    stock -= forecast[d];
    for (const ib of inbound) if (ib.expectedDay === d + 1) stock += ib.po.quantity;
    projectedStock.push(Math.round(stock * 10) / 10);
    if (daysToCritical === null && stock < item.minStock) daysToCritical = d + 1;
    if (daysToStockout === null && stock <= 0) daysToStockout = d + 1;
  }

  const lt = item.leadTimeDays + Math.max(0, supplierDelay);
  const safetyStock = Math.ceil(1.65 * model.residualSd * Math.sqrt(lt));
  const ltDemand = sum(forecast.slice(0, lt));
  const reorderPoint = Math.ceil(ltDemand + safetyStock);
  const reviewDays = 30;
  const target = sum(forecast.slice(0, lt + reviewDays)) + safetyStock;
  const pack = item.unitCost > 1000 ? 1 : item.unitCost > 200 ? 5 : 10;
  const rawQty = Math.max(0, target - item.stock - onOrder);
  const recommendedQty = rawQty > 0 ? Math.ceil(rawQty / pack) * pack : 0;

  // Order-by date: last day an order can be placed so it lands before stock drops below minimum.
  let orderBy: string | null = null;
  let urgency: ItemForecast["urgency"] = "ok";
  if (recommendedQty > 0) {
    const crit = daysToCritical ?? horizon + 1;
    const slack = crit - lt;
    orderBy = new Date(today + Math.max(0, slack) * DAY).toISOString().slice(0, 10);
    urgency = slack <= 0 ? "order-now" : slack <= 7 ? "this-week" : "planned";
  }

  const avgDaily30 = mean(y.slice(-30));
  const forecastDaily30 = mean(forecast.slice(0, 30));
  return {
    item,
    forecast,
    lower,
    upper,
    accuracy,
    avgDaily30,
    forecastDaily30,
    trendPct: avgDaily30 > 0 ? (forecastDaily30 - avgDaily30) / avgDaily30 : 0,
    onOrder,
    inbound,
    projectedStock,
    daysToCritical,
    daysToStockout,
    safetyStock,
    reorderPoint,
    recommendedQty,
    recommendedCost: recommendedQty * item.unitCost,
    orderBy,
    urgency,
  };
}

let cache: { key: string; rows: ItemForecast[] } | null = null;

/** Forecasts for all items, accounting for each supplier's typical delay. */
export function forecastAll(ds: DemoDataset): ItemForecast[] {
  if (cache && cache.key === ds.anchorDate) return cache.rows;
  const delays = new Map(supplierPerformance(ds).map((s) => [s.supplier.id, s.avgDelayDays]));
  const rows = ds.items.map((it) => forecastItem(ds, it, 60, Math.round(delays.get(it.supplierId) ?? 0)));
  cache = { key: ds.anchorDate, rows };
  return rows;
}

const URGENCY_RANK = { "order-now": 0, "this-week": 1, planned: 2, ok: 3 } as const;

export function reorderPlan(ds: DemoDataset) {
  return forecastAll(ds)
    .filter((f) => f.recommendedQty > 0)
    .sort((a, b) => URGENCY_RANK[a.urgency] - URGENCY_RANK[b.urgency] || (a.daysToCritical ?? 999) - (b.daysToCritical ?? 999));
}

export function portfolioAccuracy(ds: DemoDataset) {
  const rows = forecastAll(ds);
  // Volume-weighted accuracy
  const w = rows.map((r) => r.avgDaily30 * r.item.unitCost);
  const tw = sum(w) || 1;
  return sum(rows.map((r, i) => r.accuracy * w[i])) / tw;
}

// ---- Supplier risk & price intelligence -------------------------------------------

export function supplierRisk(ds: DemoDataset) {
  return supplierPerformance(ds)
    .map((s) => {
      const delays = ds.purchaseOrders
        .filter((p) => p.supplierId === s.supplier.id && p.deliveredDate)
        .map((p) => (new Date(p.deliveredDate!).getTime() - new Date(p.promisedDate).getTime()) / DAY);
      const sd = Math.sqrt(mean(delays.map((d) => (d - mean(delays)) ** 2)));
      const open = ds.purchaseOrders.filter((p) => p.supplierId === s.supplier.id && !p.deliveredDate);
      const openValue = sum(open.map((p) => p.quantity * p.unitPrice));
      const score = Math.round(Math.min(100, (1 - s.onTimeRate) * 55 + Math.min(s.avgDelayDays, 8) * 4 + Math.min(sd, 6) * 2.5));
      return { ...s, variability: sd, openOrders: open.length, openValue, riskScore: score, level: score >= 55 ? "High" : score >= 30 ? "Medium" : "Low" };
    })
    .sort((a, b) => b.riskScore - a.riskScore);
}

export function priceAnomalies(ds: DemoDataset, threshold = 0.12) {
  const byItem = new Map<string, PurchaseOrder[]>();
  for (const po of ds.purchaseOrders) byItem.set(po.itemId, [...(byItem.get(po.itemId) ?? []), po]);
  const items = new Map(ds.items.map((i) => [i.id, i]));
  const out: Array<{ po: PurchaseOrder; item: Item; median: number; deviation: number; overpaid: number; supplierName: string }> = [];
  const supName = new Map(ds.suppliers.map((s) => [s.id, s.name]));
  for (const [itemId, pos] of byItem) {
    if (pos.length < 3) continue;
    const prices = pos.map((p) => p.unitPrice).sort((a, b) => a - b);
    const median = prices[Math.floor(prices.length / 2)];
    for (const po of pos) {
      const deviation = (po.unitPrice - median) / median;
      if (deviation > threshold) {
        out.push({ po, item: items.get(itemId)!, median, deviation, overpaid: (po.unitPrice - median) * po.quantity, supplierName: supName.get(po.supplierId) ?? po.supplierId });
      }
    }
  }
  return out.sort((a, b) => b.overpaid - a.overpaid);
}
