import { NSKU, addDaysIso } from "./generate";
import { available, type Scope } from "./analytics";
import type { RetailState } from "./state";

// ---------------------------------------------------------------------------
// Retail metrics with standard industry definitions. Sales figures come from
// POS store-day facts (rtStoreDays); stock figures from the live, event-applied
// store x SKU position. Money in AED excl. VAT.
// ---------------------------------------------------------------------------

const inScope = (scope: Scope, s: number) => !scope || scope.has(s);
const SQFT_PER_SQM = 10.7639;

export interface SalesTotals {
  gross: number;
  discounts: number;
  returns: number;
  net: number;
  cogs: number;
  gm: number; // gross margin AED = net - COGS
  gmPct: number;
  txns: number;
  units: number;
  footfall: number;
  atv: number; // average transaction value
  upt: number; // units per transaction
  asp: number; // average selling price per unit
  conversion: number; // transactions / footfall
  lyNet: number;
  lfl: number; // like-for-like growth vs last year
  discountRate: number; // discounts / gross
  days: number;
}

function totals(rows: RetailState["base"]["storeDays"], days: number): SalesTotals {
  let gross = 0, discounts = 0, returns = 0, net = 0, cogs = 0, txns = 0, units = 0, footfall = 0, lyNet = 0;
  for (const d of rows) {
    gross += d.grossSales;
    discounts += d.discounts;
    returns += d.returns;
    net += d.netSales;
    cogs += d.cogs;
    txns += d.transactions;
    units += d.units;
    footfall += d.footfall;
    lyNet += d.lyNetSales;
  }
  const gm = net - cogs;
  return {
    gross, discounts, returns, net, cogs, gm,
    gmPct: net ? gm / net : 0,
    txns, units, footfall,
    atv: txns ? net / txns : 0,
    upt: txns ? units / txns : 0,
    asp: units ? net / units : 0,
    conversion: footfall ? txns / footfall : 0,
    lyNet,
    lfl: lyNet ? net / lyNet - 1 : 0,
    discountRate: gross ? discounts / gross : 0,
    days,
  };
}

/** Window of `days` ending `endOffset` days before the anchor (inclusive of the anchor when 0). */
function windowRows(st: RetailState, scope: Scope, days: number, endOffset = 0, storeIdx?: number) {
  const to = addDaysIso(st.base.anchorDate, -endOffset);
  const from = addDaysIso(to, -days);
  return st.base.storeDays.filter((d) => d.date > from && d.date <= to && inScope(scope, d.storeIdx) && (storeIdx === undefined || d.storeIdx === storeIdx));
}

export function salesTotals(st: RetailState, scope: Scope, days = 30, endOffset = 0, storeIdx?: number): SalesTotals {
  return totals(windowRows(st, scope, days, endOffset, storeIdx), days);
}

/** Same metrics for the previous period (for period-over-period deltas). */
export function salesPrev(st: RetailState, scope: Scope, days = 30, storeIdx?: number) {
  return salesTotals(st, scope, days, days, storeIdx);
}

export function dailySales(st: RetailState, scope: Scope, days = 30, storeIdx?: number) {
  const m = new Map<string, { date: string; net: number; ly: number; gm: number; txns: number; discounts: number; footfall: number }>();
  for (const d of windowRows(st, scope, days, 0, storeIdx)) {
    const r = m.get(d.date) ?? { date: d.date, net: 0, ly: 0, gm: 0, txns: 0, discounts: 0, footfall: 0 };
    r.net += d.netSales;
    r.ly += d.lyNetSales;
    r.gm += d.netSales - d.cogs;
    r.txns += d.transactions;
    r.discounts += d.discounts;
    r.footfall += d.footfall;
    m.set(d.date, r);
  }
  return [...m.values()].sort((a, b) => a.date.localeCompare(b.date)).map((r) => ({ ...r, gmPct: r.net ? r.gm / r.net : 0, label: new Date(r.date + "T00:00:00Z").toLocaleDateString("en-GB", { timeZone: "Asia/Dubai", day: "2-digit", month: "short" }) }));
}

export function salesByStore(st: RetailState, scope: Scope, days = 30) {
  const by = new Map<number, RetailState["base"]["storeDays"]>();
  for (const d of windowRows(st, scope, days)) {
    const a = by.get(d.storeIdx) ?? [];
    a.push(d);
    by.set(d.storeIdx, a);
  }
  return [...by.entries()].map(([storeIdx, rows]) => {
    const t = totals(rows, days);
    const store = st.base.stores[storeIdx];
    return { storeIdx, store, ...t, salesPerSqft: t.net / (store.sizeSqm * SQFT_PER_SQM) };
  });
}

// ---- Store x SKU inventory metrics ------------------------------------------------

/** Demand variability (coefficient of variation) by department, used for safety stock. */
const DEMAND_CV: Record<string, number> = { "Fresh Food": 0.35, Frozen: 0.3, Grocery: 0.25, Household: 0.3, "Personal Care": 0.32, Baby: 0.3, Electronics: 0.6, "Home & Living": 0.55 };
const Z_95 = 1.65; // 95% cycle service level

export interface PairMetrics {
  soh: number; // stock on hand
  reserved: number;
  damaged: number;
  ats: number; // available to sell = SOH - reserved - damaged
  inbound: number;
  atp: number; // available to promise = ATS + confirmed inbound
  velocity: number; // units / day
  dos: number; // days of supply on ATS
  leadDays: number;
  safetyStock: number;
  rop: number; // reorder point
  min: number;
  max: number;
  suggestedOrder: number; // rounded up to case pack, at least MOQ
  sold30: number;
  sellThrough: number; // sold / (sold + SOH), 30 days
  itr: number; // annualised inventory turnover
  ageDays: number;
  gmPct: number;
  markupPct: number;
  gmroi: number;
  asp: number;
  discountPct: number;
  returns30: number;
  returnRate: number;
  lyVelocity: number;
  lfl: number;
}

export function pairMetrics(st: RetailState, s: number, k: number): PairMetrics {
  const { base } = st;
  const p = s * NSKU + k;
  const sku = base.skus[k];
  const v = base.velocity[p];
  const soh = st.onHand(p);
  const ats = available(st, p);
  const inbound = st.inbound(p);
  const leadDays = sku.perishable ? base.suppliers[sku.supplierIdx].leadTimeDays : 2;
  const sigma = v * (DEMAND_CV[sku.department] ?? 0.3);
  const safetyStock = Math.ceil(Z_95 * sigma * Math.sqrt(leadDays));
  const rop = Math.ceil(v * leadDays + safetyStock);
  const max = Math.ceil(rop + v * st.thresholds.targetDays);
  const casePack = sku.casePack || 1;
  const moq = sku.moq || casePack;
  const need = Math.max(0, max - ats - inbound);
  const suggestedOrder = ats + inbound <= rop && need > 0 ? Math.max(moq, Math.ceil(need / casePack) * casePack) : 0;
  const sold30 = v * Math.max(0, 30 - Math.min(30, st.lastSale(p)));
  const disc = base.discountPct[p] ?? 0;
  const asp = sku.price * (1 - disc / 100);
  const landed = sku.landedCost || sku.cost;
  const gmPct = asp ? (asp - landed) / asp : 0;
  const annualGm = v * 365 * (asp - landed);
  return {
    soh,
    reserved: base.reserved[p],
    damaged: base.damaged[p],
    ats,
    inbound,
    atp: ats + inbound,
    velocity: v,
    dos: v > 0 ? ats / v : Infinity,
    leadDays,
    safetyStock,
    rop,
    min: rop,
    max,
    suggestedOrder,
    sold30,
    sellThrough: sold30 + soh > 0 ? sold30 / (sold30 + soh) : 0,
    itr: soh > 0 ? (v * 365) / soh : 0,
    ageDays: base.ageDays[p] ?? 0,
    gmPct,
    markupPct: (sku.price - sku.cost) / sku.cost,
    gmroi: soh > 0 ? annualGm / (soh * landed) : 0,
    asp,
    discountPct: disc,
    returns30: base.returns30[p] ?? 0,
    returnRate: sold30 > 0 ? (base.returns30[p] ?? 0) / sold30 : 0,
    lyVelocity: base.lyVelocity[p] ?? 0,
    lfl: base.lyVelocity[p] ? v / base.lyVelocity[p] - 1 : 0,
  };
}

export const AGE_BUCKETS: Array<[string, number, number]> = [
  ["0–30 days", 0, 30],
  ["31–60 days", 31, 60],
  ["61–90 days", 61, 90],
  ["91–180 days", 91, 180],
  ["180+ days", 181, 99999],
];

export interface StockSummary {
  sohUnits: number;
  value: number; // at landed cost
  carried: number;
  oos: number;
  ageing: Array<{ label: string; units: number; value: number }>;
  deadValue: number;
  deadCount: number;
  damagedValue: number;
  returnsValue: number;
  byDept: Map<string, { value: number; units: number; oos: number; carried: number }>;
  byCountry: Map<string, { value: number; units: number; oos: number; carried: number }>;
}

/** One pass over the store x SKU matrix for value, availability, ageing and dead stock. */
export function stockSummary(st: RetailState, scope: Scope, deadDays = 90): StockSummary {
  const { base } = st;
  const ageing = AGE_BUCKETS.map(([label]) => ({ label, units: 0, value: 0 }));
  const byDept: StockSummary["byDept"] = new Map();
  const byCountry: StockSummary["byCountry"] = new Map();
  let sohUnits = 0, value = 0, carried = 0, oos = 0, deadValue = 0, deadCount = 0, damagedValue = 0, returnsValue = 0;
  for (const s of base.stores) {
    if (!inScope(scope, s.idx)) continue;
    for (let k = 0; k < NSKU; k++) {
      const p = s.idx * NSKU + k;
      if (!base.carried[p]) continue;
      const sku = base.skus[k];
      const soh = st.onHand(p);
      const landed = sku.landedCost || sku.cost;
      const val = soh * landed;
      const isOos = available(st, p) === 0 && base.velocity[p] >= 0.25;
      carried++;
      sohUnits += soh;
      value += val;
      if (isOos) oos++;
      const age = base.ageDays[p] ?? 0;
      const b = AGE_BUCKETS.findIndex(([, lo, hi]) => age >= lo && age <= hi);
      if (b >= 0 && soh > 0) {
        ageing[b].units += soh;
        ageing[b].value += val;
      }
      if (soh > 0 && st.lastSale(p) >= deadDays) {
        deadValue += val;
        deadCount++;
      }
      damagedValue += base.damaged[p] * landed;
      returnsValue += (base.returns30[p] ?? 0) * sku.price;
      for (const [map, key] of [[byDept, sku.department], [byCountry, s.country]] as const) {
        const e = map.get(key) ?? { value: 0, units: 0, oos: 0, carried: 0 };
        e.value += val;
        e.units += soh;
        e.carried++;
        if (isOos) e.oos++;
        map.set(key, e);
      }
    }
  }
  return { sohUnits, value, carried, oos, ageing, deadValue, deadCount, damagedValue, returnsValue, byDept, byCountry };
}

/** Upcoming trading events for the scope's countries within `days`. */
export function upcomingEvents(st: RetailState, scope: Scope, days = 45) {
  const countries = new Set(st.base.stores.filter((s) => inScope(scope, s.idx)).map((s) => s.country));
  const to = addDaysIso(st.base.anchorDate, days);
  return st.base.calendar.filter((e) => e.end >= st.base.anchorDate && e.start <= to && e.countries.some((c) => countries.has(c)));
}
