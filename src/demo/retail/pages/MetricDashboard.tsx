import React, { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowLeft, Store, Barcode, Wallet, PackageX, Layers, Truck, CalendarClock, TrendingDown, Target, ChevronRight, LayoutDashboard, Info } from "lucide-react";
import { useRetail } from "../RetailContext";
import { NSKU } from "../generate";
import { supplierScorecards, type Scope } from "../analytics";
import { dailySales, salesByStore, salesPrev, salesTotals, stockSummary } from "../metrics";
import type { RetailState } from "../state";
import { Card, CardTitle, ChartTooltip, axisProps, C, CATEGORY_COLORS, cx, AnimatedValue } from "../../ui";
import { aed, nf, pctf, DataGrid, Pill, MiniBar, type Column } from "../rui";

// ---------------------------------------------------------------------------
// One dashboard per Command Center KPI card: /demo/retail/insights/:metric
// Every figure is computed from the live retail state (Convex data + actions).
// ---------------------------------------------------------------------------

const P = "/app/retail";

type Tone = "good" | "bad" | "warn" | undefined;
interface Tile {
  label: string;
  value: string;
  sub?: string;
  tone?: Tone;
  tag?: "Confirmed" | "Estimated";
}
interface ChartSpec {
  title: string;
  hint: string;
  kind: "hbar" | "bar" | "area" | "pie" | "line";
  data: Array<Record<string, string | number>>;
  x: string;
  series: Array<{ key: string; name: string; color: string; dashed?: boolean }>;
  format: (v: number) => string;
}
interface TableSpec {
  title: string;
  hint: string;
  rows: any[];
  columns: Column<any>[];
  search?: (r: any) => string;
  rowKey: (r: any) => string;
  link?: (r: any) => string;
}
interface MetricView {
  title: string;
  icon: React.ElementType;
  definition: string;
  period?: boolean;
  tiles: Tile[];
  charts: ChartSpec[];
  table: TableSpec;
  actions: Array<{ label: string; to: string; primary?: boolean }>;
}

type Ctx = { st: RetailState; k: ReturnType<typeof useRetail>["kpis"]; scope: Scope; days: number };

const countryName = (st: RetailState, code: string) => st.base.countries.find((c) => c.code === code)?.name ?? code;
const storeName = (st: RetailState, i: number) => `${st.base.stores[i].id} ${st.base.stores[i].name}`;
const top = <T,>(arr: T[], n: number) => arr.slice(0, n);
const sumBy = <T,>(arr: T[], f: (x: T) => number) => arr.reduce((a, x) => a + f(x), 0);
const groupSum = <T,>(arr: T[], key: (x: T) => string, val: (x: T) => number) => {
  const m = new Map<string, number>();
  for (const x of arr) m.set(key(x), (m.get(key(x)) ?? 0) + val(x));
  return [...m.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
};
const deltaTxt = (now: number, prev: number, unit: "pct" | "pp" = "pct") => {
  if (!prev) return "";
  const d = unit === "pct" ? now / prev - 1 : (now - prev) * 100;
  return `${d >= 0 ? "▲" : "▼"} ${Math.abs(unit === "pct" ? d * 100 : d).toFixed(1)}${unit === "pct" ? "%" : " pp"} vs prior period`;
};

// ---- Metric definitions --------------------------------------------------------------

const VIEWS: Record<string, (c: Ctx) => MetricView> = {
  stores: ({ st, k, scope, days }) => {
    const sales = salesByStore(st, scope, days);
    const t = salesTotals(st, scope, days);
    const perf = new Map(k.perf.map((p) => [p.store.idx, p]));
    const rows = sales.map((s) => ({ ...s, perf: perf.get(s.storeIdx)! })).sort((a, b) => a.perf.vsTarget - b.perf.vsTarget);
    return {
      title: "Store network",
      icon: Store,
      definition: "Every store in your scope with POS sales, like-for-like growth, productivity and operational health.",
      period: true,
      tiles: [
        { label: "Stores", value: nf(k.stores), sub: `${new Set(k.perf.map((p) => p.store.country)).size} countries` },
        { label: `Net sales · ${days}d`, value: aed(t.net), sub: deltaTxt(t.net, salesPrev(st, scope, days).net) },
        { label: "LFL growth", value: pctf(t.lfl), sub: "vs same days last year", tone: t.lfl >= 0 ? "good" : "bad" },
        { label: "Sales / sq ft", value: aed(sumBy(sales, (s) => s.net) / sumBy(sales, (s) => s.store.sizeSqm * 10.7639), false), sub: `${days}-day net sales per sq ft` },
        { label: "On-shelf availability", value: pctf(k.availability), tone: k.availability > 0.97 ? "good" : "warn" },
        { label: "Below 95% of target", value: nf(k.perf.filter((p) => p.vsTarget < 0.95).length), sub: "stores", tone: "bad" },
      ],
      charts: [
        { title: "Net sales by country", hint: `${days} days`, kind: "bar", x: "name", data: groupSum(sales, (s) => countryName(st, s.store.country), (s) => s.net), series: [{ key: "value", name: "Net sales", color: C.indigo }], format: (v) => aed(v) },
        { title: "Lowest LFL stores", hint: "Net sales growth vs same days last year", kind: "hbar", x: "name", data: [...sales].sort((a, b) => a.lfl - b.lfl).slice(0, 10).map((s) => ({ name: s.store.id + " " + s.store.name, value: Math.round(s.lfl * 1000) / 10 })), series: [{ key: "value", name: "LFL %", color: C.rose }], format: (v) => `${v}%` },
      ],
      table: {
        title: "Store league table",
        hint: "Sorted by sales vs target (worst first) · click a store to diagnose",
        rows,
        rowKey: (r) => r.store.id,
        search: (r) => `${r.store.id} ${r.store.name} ${r.store.city}`,
        link: (r) => `${P}/stores/${r.store.id}`,
        columns: [
          { key: "s", label: "Store", render: (r) => <div><div className="font-semibold text-slate-900">{r.store.id} {r.store.name}</div><div className="text-xs text-slate-500">{r.store.format} · {r.store.city}</div></div>, sort: (r) => r.store.id },
          { key: "n", label: "Net sales", align: "right", render: (r) => aed(r.net), sort: (r) => r.net },
          { key: "t", label: "vs Target", render: (r) => <span className="inline-flex items-center gap-2"><MiniBar value={r.perf.vsTarget} tone={r.perf.vsTarget < 0.95 ? "bad" : "good"} />{pctf(r.perf.vsTarget, 0)}</span>, sort: (r) => r.perf.vsTarget },
          { key: "l", label: "LFL", align: "right", render: (r) => <span className={r.lfl < 0 ? "text-rose-600" : "text-emerald-600"}>{pctf(r.lfl)}</span>, sort: (r) => r.lfl },
          { key: "g", label: "GM %", align: "right", render: (r) => pctf(r.gmPct), sort: (r) => r.gmPct },
          { key: "a", label: "ATV", align: "right", render: (r) => aed(r.atv, false), sort: (r) => r.atv },
          { key: "c", label: "Conversion", align: "right", render: (r) => pctf(r.conversion, 0), sort: (r) => r.conversion },
          { key: "o", label: "OSA", align: "right", render: (r) => pctf(r.perf.availability), sort: (r) => r.perf.availability },
          { key: "au", label: "Audit", align: "right", render: (r) => Math.round(r.perf.auditScore), sort: (r) => r.perf.auditScore },
        ],
      },
      actions: [
        { label: "Open stores module", to: `${P}/stores`, primary: true },
        { label: "Sales & margin dashboard", to: `${P}/insights/sales` },
      ],
    };
  },

  skus: ({ st, scope }) => {
    const { base } = st;
    const agg = base.skus.map((sku) => ({ sku, stores: 0, units: 0, sales: 0 }));
    for (const s of base.stores) {
      if (scope && !scope.has(s.idx)) continue;
      for (let k = 0; k < NSKU; k++) {
        const p = s.idx * NSKU + k;
        if (!base.carried[p]) continue;
        const a = agg[k];
        a.stores++;
        a.units += base.velocity[p];
        a.sales += base.velocity[p] * base.skus[k].price * (1 - (base.discountPct[p] ?? 0) / 100);
      }
    }
    const active = agg.filter((a) => a.stores > 0 && a.sku.status !== "Discontinued");
    const gm = (a: (typeof agg)[number]) => (a.sku.price - (a.sku.landedCost || a.sku.cost)) / a.sku.price;
    return {
      title: "SKU portfolio",
      icon: Barcode,
      definition: "Active catalogue in your scope with ranging, velocity, lifecycle and margin per SKU.",
      tiles: [
        { label: "Active SKUs", value: nf(active.length), sub: `${nf(base.skus.length)} in catalogue` },
        { label: "Product families (SPU)", value: nf(new Set(active.map((a) => a.sku.spu)).size) },
        { label: "Store-SKU listings", value: nf(sumBy(active, (a) => a.stores)) },
        { label: "New (introduction)", value: nf(active.filter((a) => a.sku.lifecycle === "Introduction").length) },
        { label: "Declining / end of life", value: nf(agg.filter((a) => a.stores && (a.sku.lifecycle === "Decline" || a.sku.lifecycle === "End of life")).length), tone: "warn" },
        { label: "Average shelf margin", value: pctf(sumBy(active, gm) / Math.max(1, active.length)), sub: "(price − landed cost) / price" },
      ],
      charts: [
        { title: "Daily sales by department", hint: "AED per day at realised prices", kind: "hbar", x: "name", data: groupSum(active, (a) => a.sku.department, (a) => a.sales), series: [{ key: "value", name: "Sales / day", color: C.violet }], format: (v) => aed(v) },
        { title: "Lifecycle mix", hint: "Active SKUs by stage", kind: "pie", x: "name", data: groupSum(active, (a) => a.sku.lifecycle, () => 1), series: [{ key: "value", name: "SKUs", color: C.indigo }], format: (v) => nf(v) },
      ],
      table: {
        title: "Top SKUs by sales",
        hint: "Click a SKU for its full detail page",
        rows: [...active].sort((a, b) => b.sales - a.sales),
        rowKey: (r) => r.sku.id,
        search: (r) => `${r.sku.id} ${r.sku.name} ${r.sku.brand} ${r.sku.ean} ${r.sku.category}`,
        link: (r) => `${P}/skus?sku=${r.sku.id}`,
        columns: [
          { key: "n", label: "SKU", render: (r) => <div><div className="font-semibold text-slate-900">{r.sku.name}</div><div className="text-xs text-slate-500">{r.sku.id} · EAN {r.sku.ean}</div></div>, sort: (r) => r.sku.name },
          { key: "d", label: "Category", render: (r) => <span className="text-xs">{r.sku.category}</span>, sort: (r) => r.sku.category },
          { key: "l", label: "Lifecycle", render: (r) => <Pill tone={r.sku.lifecycle === "Decline" || r.sku.lifecycle === "End of life" ? "warn" : r.sku.lifecycle === "Introduction" ? "accent" : "neutral"}>{r.sku.lifecycle}</Pill>, sort: (r) => r.sku.lifecycle },
          { key: "s", label: "Stores", align: "right", render: (r) => r.stores, sort: (r) => r.stores },
          { key: "u", label: "Units / day", align: "right", render: (r) => nf(r.units, 1), sort: (r) => r.units },
          { key: "v", label: "Sales / day", align: "right", render: (r) => aed(r.sales), sort: (r) => r.sales },
          { key: "g", label: "GM %", align: "right", render: (r) => pctf(gm(r)), sort: (r) => gm(r) },
        ],
      },
      actions: [{ label: "Open SKU intelligence", to: `${P}/skus`, primary: true }],
    };
  },

  inventory: ({ st, scope }) => {
    const ss = stockSummary(st, scope);
    const t = salesTotals(st, scope, 30);
    const itr = ss.value ? (t.cogs * (365 / 30)) / ss.value : 0;
    const perStore = st.base.stores
      .filter((s) => !scope || scope.has(s.idx))
      .map((s) => {
        const x = stockSummary(st, new Set([s.idx]));
        const cogs = salesTotals(st, scope, 30, 0, s.idx).cogs * (365 / 30);
        return { store: s, value: x.value, units: x.sohUnits, itr: x.value ? cogs / x.value : 0, dead: x.deadValue, aged: x.ageing[3].value + x.ageing[4].value };
      });
    return {
      title: "Inventory value & health",
      icon: Wallet,
      definition: "Stock on hand (SOH) valued at landed cost, with turnover, ageing and dead stock.",
      tiles: [
        { label: "Inventory value", value: aed(ss.value), sub: "SOH at landed cost" },
        { label: "SOH units", value: nf(ss.sohUnits) },
        { label: "Inventory turnover (ITR)", value: `${itr.toFixed(1)}×`, sub: "annualised COGS / inventory" },
        { label: "Days on hand (DOH)", value: itr ? nf(365 / itr) : "—", sub: "365 / ITR" },
        { label: "Aged > 90 days", value: aed(ss.ageing[3].value + ss.ageing[4].value), tone: "warn" },
        { label: "Dead stock", value: aed(ss.deadValue), sub: `${nf(ss.deadCount)} store-SKUs · no sale 90+ days`, tone: "bad" },
      ],
      charts: [
        { title: "Value by department", hint: "Landed cost", kind: "hbar", x: "name", data: [...ss.byDept].map(([name, e]) => ({ name, value: e.value })).sort((a, b) => b.value - a.value), series: [{ key: "value", name: "Value", color: C.cyan }], format: (v) => aed(v) },
        { title: "Inventory ageing", hint: "Age of oldest units on hand", kind: "bar", x: "name", data: ss.ageing.map((a) => ({ name: a.label, value: a.value })), series: [{ key: "value", name: "Value", color: C.amber }], format: (v) => aed(v) },
      ],
      table: {
        title: "Inventory by store",
        hint: "Low turnover and high dead stock first",
        rows: perStore.sort((a, b) => a.itr - b.itr),
        rowKey: (r) => r.store.id,
        search: (r) => `${r.store.id} ${r.store.name} ${r.store.city}`,
        link: (r) => `${P}/stores/${r.store.id}`,
        columns: [
          { key: "s", label: "Store", render: (r) => <span className="font-semibold text-slate-900">{r.store.id} {r.store.name}</span>, sort: (r) => r.store.id },
          { key: "v", label: "Value", align: "right", render: (r) => aed(r.value), sort: (r) => r.value },
          { key: "u", label: "SOH units", align: "right", render: (r) => nf(r.units), sort: (r) => r.units },
          { key: "i", label: "ITR", align: "right", render: (r) => `${r.itr.toFixed(1)}×`, sort: (r) => r.itr },
          { key: "a", label: "Aged > 90d", align: "right", render: (r) => aed(r.aged), sort: (r) => r.aged },
          { key: "d", label: "Dead stock", align: "right", render: (r) => <span className={r.dead > 0 ? "text-rose-600" : ""}>{aed(r.dead)}</span>, sort: (r) => r.dead },
        ],
      },
      actions: [
        { label: "Overstock & ageing", to: `${P}/replenishment?tab=overstock`, primary: true },
        { label: "Stockout dashboard", to: `${P}/insights/stockouts` },
      ],
    };
  },

  stockouts: ({ st, k }) => {
    const oos = k.so.filter((x) => x.outOfStock);
    const byStore = k.so.filter((x) => x.donor?.type === "store").length;
    const byDc = k.so.filter((x) => x.donor?.type === "dc").length;
    return {
      title: "Stockout risk",
      icon: PackageX,
      definition: `Store-SKUs selling ≥ 0.25 units/day whose days of supply (DOS = ATS ÷ daily sales) is at or below ${st.thresholds.stockoutDays} days, including those already out of stock (OOS).`,
      tiles: [
        { label: "Stockout risks", value: nf(k.stockoutRisks) },
        { label: "Out of stock now", value: nf(oos.length), tone: "bad" },
        { label: "Lost sales / day", value: aed(k.lostSalesPerDay), sub: "OOS only", tone: "bad", tag: "Estimated" },
        { label: "Fixable by store transfer", value: nf(byStore), tone: "good" },
        { label: "Fixable from DC", value: nf(byDc) },
        { label: "On-shelf availability", value: pctf(k.availability) },
      ],
      charts: [
        { title: "Stockout risks by department", hint: "Count of store-SKUs", kind: "hbar", x: "name", data: groupSum(k.so, (x) => st.base.skus[x.skuIdx].department, () => 1), series: [{ key: "value", name: "Risks", color: C.rose }], format: (v) => nf(v) },
        { title: "Lost sales per day by country", hint: "Out-of-stock items", kind: "bar", x: "name", data: groupSum(oos, (x) => countryName(st, st.base.stores[x.storeIdx].country), (x) => x.lostSalesPerDay), series: [{ key: "value", name: "Lost / day", color: C.amber }], format: (v) => aed(v) },
      ],
      table: {
        title: "At-risk store-SKUs",
        hint: "Highest lost sales first · donor = best source for a transfer",
        rows: k.so,
        rowKey: (r) => r.id,
        search: (r) => `${st.base.skus[r.skuIdx].name} ${st.base.skus[r.skuIdx].id} ${storeName(st, r.storeIdx)}`,
        link: (r) => `${P}/skus?sku=${st.base.skus[r.skuIdx].id}&store=${st.base.stores[r.storeIdx].id}`,
        columns: [
          { key: "s", label: "Store", render: (r) => <span className="text-xs font-semibold text-slate-800">{storeName(st, r.storeIdx)}</span>, sort: (r) => r.storeIdx },
          { key: "k", label: "SKU", render: (r) => <span className="text-xs">{st.base.skus[r.skuIdx].name}</span>, sort: (r) => st.base.skus[r.skuIdx].name },
          { key: "a", label: "ATS", align: "right", render: (r) => nf(r.available), sort: (r) => r.available },
          { key: "d", label: "DOS", align: "right", render: (r) => (r.outOfStock ? <Pill tone="bad">OOS</Pill> : `${r.daysOfSupply.toFixed(1)} d`), sort: (r) => r.daysOfSupply },
          { key: "i", label: "Inbound", align: "right", render: (r) => nf(r.inbound), sort: (r) => r.inbound },
          { key: "l", label: "Lost / day", align: "right", render: (r) => aed(r.lostSalesPerDay, false), sort: (r) => r.lostSalesPerDay },
          { key: "o", label: "Best source", render: (r) => (r.donor ? <span className="text-xs">{r.donor.type === "dc" ? st.base.dcs[r.donor.idx].name : storeName(st, r.donor.idx)} · {nf(r.donor.qty)}</span> : <span className="text-xs text-slate-400">PO needed</span>) },
        ],
      },
      actions: [
        { label: "Approve recommended transfers", to: `${P}/transfers`, primary: true },
        { label: "Stockout worklist", to: `${P}/replenishment?tab=stockouts` },
      ],
    };
  },

  overstock: ({ st, k }) => (
    {
      title: "Overstock",
      icon: Layers,
      definition: `Store-SKUs holding more than ${st.thresholds.overstockDays} days of supply. Excess = units above 30 days of cover, valued at cost.`,
      tiles: [
        { label: "Excess value", value: aed(k.overstockValue), tone: "warn", tag: "Confirmed" },
        { label: "Overstocked store-SKUs", value: nf(k.overstockCount) },
        { label: "Excess units", value: nf(sumBy(k.ov, (x) => x.excessUnits)) },
        { label: "Median days of supply", value: k.ov.length ? nf([...k.ov].sort((a, b) => a.daysOfSupply - b.daysOfSupply)[Math.floor(k.ov.length / 2)].daysOfSupply) : "—", sub: "days" },
        { label: "Could cover a stockout", value: nf(k.ov.filter((o) => k.so.some((s) => s.skuIdx === o.skuIdx && st.base.stores[s.storeIdx].country === st.base.stores[o.storeIdx].country)).length), sub: "same SKU at risk in same country", tone: "good" },
      ],
      charts: [
        { title: "Excess value by department", hint: "At cost", kind: "hbar", x: "name", data: groupSum(k.ov, (x) => st.base.skus[x.skuIdx].department, (x) => x.excessValue), series: [{ key: "value", name: "Excess", color: C.amber }], format: (v) => aed(v) },
        { title: "Excess value by country", hint: "At cost", kind: "bar", x: "name", data: groupSum(k.ov, (x) => countryName(st, st.base.stores[x.storeIdx].country), (x) => x.excessValue), series: [{ key: "value", name: "Excess", color: C.violet }], format: (v) => aed(v) },
      ],
      table: {
        title: "Overstocked store-SKUs",
        hint: "Largest excess value first",
        rows: k.ov,
        rowKey: (r) => r.id,
        search: (r) => `${st.base.skus[r.skuIdx].name} ${storeName(st, r.storeIdx)}`,
        link: (r) => `${P}/skus?sku=${st.base.skus[r.skuIdx].id}&store=${st.base.stores[r.storeIdx].id}`,
        columns: [
          { key: "s", label: "Store", render: (r) => <span className="text-xs font-semibold text-slate-800">{storeName(st, r.storeIdx)}</span>, sort: (r) => r.storeIdx },
          { key: "k", label: "SKU", render: (r) => <span className="text-xs">{st.base.skus[r.skuIdx].name}</span> },
          { key: "o", label: "SOH", align: "right", render: (r) => nf(r.onHand), sort: (r) => r.onHand },
          { key: "d", label: "DOS", align: "right", render: (r) => `${nf(r.daysOfSupply)} d`, sort: (r) => r.daysOfSupply },
          { key: "e", label: "Excess units", align: "right", render: (r) => nf(r.excessUnits), sort: (r) => r.excessUnits },
          { key: "v", label: "Excess value", align: "right", render: (r) => aed(r.excessValue), sort: (r) => r.excessValue },
        ],
      },
      actions: [
        { label: "Rebalance with transfers", to: `${P}/transfers`, primary: true },
        { label: "Overstock worklist", to: `${P}/replenishment?tab=overstock` },
      ],
    }
  ),

  suppliers: ({ st, k }) => {
    const cards = supplierScorecards(st);
    const done = st.pos.filter((p) => p.received);
    const otif = done.length ? done.filter((p) => p.received! <= p.promised && p.lines.every((l) => l.received >= l.ordered)).length / done.length : 1;
    const ordered = sumBy(done, (p) => sumBy(p.lines, (l) => l.ordered));
    const recv = sumBy(done, (p) => sumBy(p.lines, (l) => l.received));
    const inTransit = st.pos.filter((p) => p.asn && !p.received);
    return {
      title: "Supplier delivery performance",
      icon: Truck,
      definition: "OTIF = purchase orders delivered On Time (by the promised date) and In Full (every line fully received). Fill rate = units received ÷ units ordered.",
      tiles: [
        { label: "Overdue POs", value: nf(k.supplierDelays), tone: "bad" },
        { label: "Undelivered value", value: aed(sumBy(k.sd, (x) => x.value)) },
        { label: "OTIF", value: pctf(otif), sub: `${nf(done.length)} received POs`, tone: otif > 0.85 ? "good" : "warn" },
        { label: "Fill rate", value: pctf(ordered ? recv / ordered : 1) },
        { label: "Avg days late", value: k.sd.length ? (sumBy(k.sd, (x) => x.daysLate) / k.sd.length).toFixed(1) : "0", sub: "open overdue POs" },
        { label: "ASNs in transit", value: nf(inTransit.length), sub: "shipped, not yet received" },
      ],
      charts: [
        { title: "Lowest on-time suppliers", hint: "On-time delivery rate", kind: "hbar", x: "name", data: [...cards].filter((c) => c.pos >= 5).sort((a, b) => a.onTimeRate - b.onTimeRate).slice(0, 10).map((c) => ({ name: st.base.suppliers[c.idx].name, value: Math.round(c.onTimeRate * 100) })), series: [{ key: "value", name: "On time %", color: C.rose }], format: (v) => `${v}%` },
        { title: "Fill rate by supplier", hint: "Lowest 10", kind: "hbar", x: "name", data: [...cards].filter((c) => c.pos >= 5).sort((a, b) => a.fillRate - b.fillRate).slice(0, 10).map((c) => ({ name: st.base.suppliers[c.idx].name, value: Math.round(c.fillRate * 100) })), series: [{ key: "value", name: "Fill %", color: C.amber }], format: (v) => `${v}%` },
      ],
      table: {
        title: "Overdue purchase orders",
        hint: "Most stores affected first",
        rows: k.sd,
        rowKey: (r) => r.id,
        search: (r) => `${r.poId} ${st.base.suppliers[r.supplierIdx].name}`,
        link: () => `${P}/suppliers?tab=delays`,
        columns: [
          { key: "p", label: "PO", render: (r) => <span className="font-mono text-xs font-semibold">{r.poId}</span>, sort: (r) => r.poId },
          { key: "s", label: "Supplier", render: (r) => st.base.suppliers[r.supplierIdx].name, sort: (r) => st.base.suppliers[r.supplierIdx].name },
          { key: "d", label: "Destination", render: (r) => <span className="text-xs">{r.destType === "dc" ? st.base.dcs[r.destIdx].name : storeName(st, r.destIdx)}</span> },
          { key: "l", label: "Days late", align: "right", render: (r) => <span className="font-semibold text-rose-600">{r.daysLate}</span>, sort: (r) => r.daysLate },
          { key: "v", label: "Undelivered", align: "right", render: (r) => aed(r.value), sort: (r) => r.value },
          { key: "a", label: "Stores at risk", align: "right", render: (r) => r.affectedStores.length, sort: (r) => r.affectedStores.length },
        ],
      },
      actions: [
        { label: "Supplier scorecards", to: `${P}/suppliers`, primary: true },
        { label: "Procurement", to: `${P}/procurement` },
      ],
    };
  },

  expiry: ({ st, k }) => {
    const open = k.ex.filter((x) => !x.markedDown);
    return {
      title: "Expiry risk",
      icon: CalendarClock,
      definition: `Perishable batches (FEFO lots) expiring within ${st.thresholds.expiryDays} days where expected sales before expiry are lower than the quantity on hand.`,
      tiles: [
        { label: "Value at risk", value: aed(k.expiryRiskValue), tone: "bad", tag: "Estimated" },
        { label: "Batches at risk", value: nf(k.expiryCount) },
        { label: "Expiring ≤ 3 days", value: nf(open.filter((x) => x.daysLeft <= 3).length), tone: "bad" },
        { label: "Transfer possible", value: nf(open.filter((x) => x.recommendation === "transfer").length), tone: "good" },
        { label: "Already marked down", value: nf(k.ex.filter((x) => x.markedDown).length) },
      ],
      charts: [
        { title: "Value at risk by category", hint: "At cost", kind: "hbar", x: "name", data: groupSum(open, (x) => st.base.skus[x.skuIdx].category, (x) => x.atRiskValue), series: [{ key: "value", name: "At risk", color: C.rose }], format: (v) => aed(v) },
        { title: "Batches by days to expiry", hint: "Open risks", kind: "bar", x: "name", data: ["0–3", "4–7", "8–15"].map((b, i) => ({ name: `${b} days`, value: open.filter((x) => (i === 0 ? x.daysLeft <= 3 : i === 1 ? x.daysLeft > 3 && x.daysLeft <= 7 : x.daysLeft > 7)).length })), series: [{ key: "value", name: "Batches", color: C.amber }], format: (v) => nf(v) },
      ],
      table: {
        title: "Batches at risk",
        hint: "Highest value first",
        rows: k.ex,
        rowKey: (r) => r.id,
        search: (r) => `${st.base.skus[r.skuIdx].name} ${r.lot} ${storeName(st, r.storeIdx)}`,
        link: () => `${P}/replenishment?tab=expiry`,
        columns: [
          { key: "s", label: "Store", render: (r) => <span className="text-xs font-semibold text-slate-800">{storeName(st, r.storeIdx)}</span> },
          { key: "k", label: "SKU · lot", render: (r) => <span className="text-xs">{st.base.skus[r.skuIdx].name} · <span className="font-mono">{r.lot}</span></span> },
          { key: "e", label: "Expiry", render: (r) => <span className={cx("text-xs", r.daysLeft <= 3 && "font-semibold text-rose-600")}>{r.expiry} ({r.daysLeft}d)</span>, sort: (r) => r.daysLeft },
          { key: "q", label: "Lot qty", align: "right", render: (r) => nf(r.qty) },
          { key: "x", label: "Unsold at expiry", align: "right", render: (r) => nf(r.atRiskUnits), sort: (r) => r.atRiskUnits },
          { key: "v", label: "At risk", align: "right", render: (r) => aed(r.atRiskValue), sort: (r) => r.atRiskValue },
          { key: "r", label: "Action", render: (r) => (r.markedDown ? <Pill tone="good">{r.markedDown}% markdown</Pill> : <Pill tone={r.recommendation === "transfer" ? "accent" : "warn"}>{r.recommendation}</Pill>) },
        ],
      },
      actions: [{ label: "Markdowns & transfers", to: `${P}/replenishment?tab=expiry`, primary: true }],
    };
  },

  losses: ({ st, k, scope }) => {
    const ss = stockSummary(st, scope);
    const expiredWriteOff = sumBy(k.ex.filter((x) => x.daysLeft <= 2 && !x.markedDown), (x) => x.atRiskValue);
    const phantom = sumBy(k.ph, (x) => x.systemQty * st.base.skus[x.skuIdx].cost * 0.5);
    const variance = -sumBy(st.counts.filter((c) => c.status === "Reconciled" && (c.variance ?? 0) < 0), (c) => (c.variance ?? 0) * st.base.skus[c.skuIdx].cost);
    const comps = [
      { name: "Damaged stock", value: ss.damagedValue, tag: "Confirmed" as const },
      { name: "Count variances", value: variance, tag: "Confirmed" as const },
      { name: "Expiry write-off (≤2 days)", value: expiredWriteOff, tag: "Estimated" as const },
      { name: "Unexplained (phantom)", value: phantom, tag: "Estimated" as const },
    ];
    const perStore = st.base.stores
      .filter((s) => !scope || scope.has(s.idx))
      .map((s) => {
        const p = k.perf.find((x) => x.store.idx === s.idx);
        const ph = sumBy(k.ph.filter((x) => x.storeIdx === s.idx), (x) => x.systemQty * st.base.skus[x.skuIdx].cost * 0.5);
        const ex = sumBy(k.ex.filter((x) => x.storeIdx === s.idx && x.daysLeft <= 2 && !x.markedDown), (x) => x.atRiskValue);
        const sales = salesTotals(st, scope, 30, 0, s.idx).net;
        const total = (p?.shrinkValue ?? 0) + ph + ex;
        return { store: s, damaged: p?.shrinkValue ?? 0, phantom: ph, expiry: ex, total, rate: sales ? total / sales : 0 };
      })
      .sort((a, b) => b.total - a.total);
    const net = salesTotals(st, scope, 30).net;
    return {
      title: "Inventory losses (shrinkage)",
      icon: TrendingDown,
      definition: "Shrinkage = stock lost to damage, expiry, count variances and unexplained loss. Confirmed values are recorded; estimated values are SCIO projections.",
      tiles: [
        ...comps.map((c) => ({ label: c.name, value: aed(c.value), tag: c.tag, tone: "bad" as Tone })),
        { label: "Total shrink", value: aed(k.inventoryLoss) },
        { label: "Shrink % of net sales", value: pctf(net ? k.inventoryLoss / net : 0, 2), sub: "30 days" },
      ],
      charts: [
        { title: "Loss by component", hint: "Confirmed vs estimated", kind: "pie", x: "name", data: comps.map((c) => ({ name: `${c.name} · ${c.tag}`, value: Math.round(c.value) })), series: [{ key: "value", name: "AED", color: C.rose }], format: (v) => aed(v) },
        { title: "Highest-loss stores", hint: "Damaged + phantom + expiry", kind: "hbar", x: "name", data: top(perStore, 10).map((r) => ({ name: r.store.id + " " + r.store.name, value: Math.round(r.total) })), series: [{ key: "value", name: "Loss", color: C.amber }], format: (v) => aed(v) },
      ],
      table: {
        title: "Shrinkage by store",
        hint: "Click to open the store",
        rows: perStore,
        rowKey: (r) => r.store.id,
        search: (r) => `${r.store.id} ${r.store.name}`,
        link: (r) => `${P}/stores/${r.store.id}`,
        columns: [
          { key: "s", label: "Store", render: (r) => <span className="font-semibold text-slate-900">{r.store.id} {r.store.name}</span> },
          { key: "d", label: "Damaged", align: "right", render: (r) => aed(r.damaged), sort: (r) => r.damaged },
          { key: "p", label: "Phantom (est.)", align: "right", render: (r) => aed(r.phantom), sort: (r) => r.phantom },
          { key: "e", label: "Expiry (est.)", align: "right", render: (r) => aed(r.expiry), sort: (r) => r.expiry },
          { key: "t", label: "Total", align: "right", render: (r) => <b>{aed(r.total)}</b>, sort: (r) => r.total },
          { key: "r", label: "% of sales", align: "right", render: (r) => pctf(r.rate, 2), sort: (r) => r.rate },
        ],
      },
      actions: [
        { label: "Cycle counts for phantom stock", to: `${P}/replenishment?tab=phantom`, primary: true },
        { label: "Expiry actions", to: `${P}/replenishment?tab=expiry` },
      ],
    };
  },

  performance: ({ st, k, scope, days }) => {
    const sales = new Map(salesByStore(st, scope, days).map((s) => [s.storeIdx, s]));
    const rows = [...k.perf].sort((a, b) => a.vsTarget - b.vsTarget).map((p) => ({ ...p, s: sales.get(p.store.idx) }));
    const byCountry = groupSum(k.perf, (p) => countryName(st, p.store.country), (p) => p.sales30).map((c) => {
      const t = sumBy(k.perf.filter((p) => countryName(st, p.store.country) === c.name), (p) => p.target);
      return { name: c.name, value: Math.round((c.value / t) * 1000) / 10 };
    });
    return {
      title: "Sales vs target",
      icon: Target,
      definition: "30-day sales at shelf price against each store's monthly target, with availability, LFL growth and audit scores.",
      period: true,
      tiles: [
        { label: "Chain vs target", value: pctf(k.salesVsTarget, 0), tone: k.salesVsTarget >= 1 ? "good" : "warn" },
        { label: "Stores below 95%", value: nf(k.perf.filter((p) => p.vsTarget < 0.95).length), tone: "bad" },
        { label: "Stores ahead (≥ 103%)", value: nf(k.perf.filter((p) => p.vsTarget >= 1.03).length), tone: "good" },
        { label: "On-shelf availability", value: pctf(k.availability) },
        { label: "Lost sales · 30d", value: aed(sumBy(k.perf, (p) => p.lostSales30)), tag: "Estimated", tone: "bad" },
      ],
      charts: [
        { title: "Furthest below target", hint: "% of 30-day target", kind: "hbar", x: "name", data: rows.slice(0, 10).map((p) => ({ name: p.store.id + " " + p.store.name, value: Math.round(p.vsTarget * 1000) / 10 })), series: [{ key: "value", name: "% of target", color: C.rose }], format: (v) => `${v}%` },
        { title: "Target attainment by country", hint: "% of 30-day target", kind: "bar", x: "name", data: byCountry, series: [{ key: "value", name: "% of target", color: C.emerald }], format: (v) => `${v}%` },
      ],
      table: {
        title: "Store performance",
        hint: "Worst first · click to diagnose",
        rows,
        rowKey: (r) => r.store.id,
        search: (r) => `${r.store.id} ${r.store.name} ${r.store.city}`,
        link: (r) => `${P}/stores/${r.store.id}`,
        columns: [
          { key: "s", label: "Store", render: (r) => <span className="font-semibold text-slate-900">{r.store.id} {r.store.name}</span> },
          { key: "t", label: "vs Target", render: (r) => <span className="inline-flex items-center gap-2"><MiniBar value={r.vsTarget} tone={r.vsTarget < 0.95 ? "bad" : "good"} />{pctf(r.vsTarget, 0)}</span>, sort: (r) => r.vsTarget },
          { key: "l", label: "LFL", align: "right", render: (r) => (r.s ? <span className={r.s.lfl < 0 ? "text-rose-600" : "text-emerald-600"}>{pctf(r.s.lfl)}</span> : "—"), sort: (r) => r.s?.lfl ?? 0 },
          { key: "a", label: "Availability", align: "right", render: (r) => pctf(r.availability), sort: (r) => r.availability },
          { key: "o", label: "OOS SKUs", align: "right", render: (r) => nf(r.outOfStock), sort: (r) => r.outOfStock },
          { key: "x", label: "Lost sales", align: "right", render: (r) => aed(r.lostSales30), sort: (r) => r.lostSales30 },
          { key: "f", label: "Faults", align: "right", render: (r) => (r.equipmentFaults ? <Pill tone="bad">{r.equipmentFaults}</Pill> : "–"), sort: (r) => r.equipmentFaults },
        ],
      },
      actions: [{ label: "Diagnose weakest store", to: `${P}/stores/${rows[0]?.store.id ?? ""}`, primary: true }],
    };
  },

  sales: ({ st, scope, days }) => {
    const t = salesTotals(st, scope, days);
    const prev = salesPrev(st, scope, days);
    const daily = dailySales(st, scope, days);
    const byStore = salesByStore(st, scope, days);
    const byCountry = [...new Set(byStore.map((s) => s.store.country))].map((code) => {
      const rows = byStore.filter((s) => s.store.country === code);
      const net = sumBy(rows, (r) => r.net);
      const ly = sumBy(rows, (r) => r.lyNet);
      const gm = sumBy(rows, (r) => r.gm);
      const tx = sumBy(rows, (r) => r.txns);
      return { code, name: countryName(st, code), stores: rows.length, net, lfl: ly ? net / ly - 1 : 0, gmPct: net ? gm / net : 0, atv: tx ? net / tx : 0, disc: sumBy(rows, (r) => r.discounts) / Math.max(1, sumBy(rows, (r) => r.gross)) };
    });
    return {
      title: "Sales & margin",
      icon: Wallet,
      definition: "POS sales excl. VAT. Net sales = gross sales − discounts − returns. Gross margin = net sales − COGS (landed cost). LFL compares the same days last year.",
      period: true,
      tiles: [
        { label: "Net sales", value: aed(t.net), sub: deltaTxt(t.net, prev.net) },
        { label: "Gross margin", value: pctf(t.gmPct), sub: deltaTxt(t.gmPct, prev.gmPct, "pp"), tone: t.gmPct >= prev.gmPct ? "good" : "bad" },
        { label: "LFL growth", value: pctf(t.lfl), tone: t.lfl >= 0 ? "good" : "bad" },
        { label: "ATV", value: aed(t.atv, false), sub: "avg transaction value" },
        { label: "UPT", value: t.upt.toFixed(2), sub: "units per transaction" },
        { label: "Conversion", value: pctf(t.conversion), sub: `${nf(t.footfall)} visitors` },
        { label: "Discount rate", value: pctf(t.discountRate), sub: aed(t.discounts) + " discounts", tone: t.discountRate > prev.discountRate * 1.15 ? "bad" : undefined },
        { label: "Returns", value: aed(t.returns), sub: pctf(t.gross ? t.returns / t.gross : 0, 2) + " of gross" },
      ],
      charts: [
        { title: "Net sales vs last year", hint: "Daily, AED", kind: "area", x: "label", data: daily.map((d) => ({ label: d.label, net: Math.round(d.net), ly: Math.round(d.ly) })), series: [{ key: "net", name: "This year", color: C.indigo }, { key: "ly", name: "Last year", color: C.slate, dashed: true }], format: (v) => aed(v) },
        { title: "Gross margin % by day", hint: "Watch for discount-driven dips", kind: "line", x: "label", data: daily.map((d) => ({ label: d.label, gm: Math.round(d.gmPct * 1000) / 10 })), series: [{ key: "gm", name: "GM %", color: C.emerald }], format: (v) => `${v}%` },
      ],
      table: {
        title: "Sales by country",
        hint: "Margin leakage shows up as a high discount rate with falling GM %",
        rows: byCountry.sort((a, b) => b.net - a.net),
        rowKey: (r) => r.code,
        columns: [
          { key: "n", label: "Country", render: (r) => <span className="font-semibold text-slate-900">{r.name}</span> },
          { key: "s", label: "Stores", align: "right", render: (r) => r.stores },
          { key: "v", label: "Net sales", align: "right", render: (r) => aed(r.net), sort: (r) => r.net },
          { key: "l", label: "LFL", align: "right", render: (r) => <span className={r.lfl < 0 ? "text-rose-600" : "text-emerald-600"}>{pctf(r.lfl)}</span>, sort: (r) => r.lfl },
          { key: "g", label: "GM %", align: "right", render: (r) => pctf(r.gmPct), sort: (r) => r.gmPct },
          { key: "d", label: "Discount rate", align: "right", render: (r) => pctf(r.disc), sort: (r) => r.disc },
          { key: "a", label: "ATV", align: "right", render: (r) => aed(r.atv, false), sort: (r) => r.atv },
        ],
      },
      actions: [
        { label: "Retail reports", to: `${P}/reports`, primary: true },
        { label: "Store network", to: `${P}/insights/stores` },
      ],
    };
  },
};

export const METRIC_KEYS = Object.keys(VIEWS);

// ---- Page ------------------------------------------------------------------------------

export default function MetricDashboard() {
  const { metric = "" } = useParams();
  const { state, kpis, scope, scopeLabel } = useRetail();
  const navigate = useNavigate();
  const [days, setDays] = useState(30);
  const build = VIEWS[metric];
  const view = useMemo(() => (build ? build({ st: state, k: kpis, scope, days }) : null), [build, state, kpis, scope, days]);

  if (!view) {
    return (
      <div className="py-16 text-center">
        <p className="text-slate-600">Unknown dashboard.</p>
        <Link to={P} className="mt-3 inline-block text-sm font-semibold text-blue-700">Back to Command Center</Link>
      </div>
    );
  }
  const Icon = view.icon;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
        <Link to={P} className="inline-flex items-center gap-1 hover:text-slate-800"><ArrowLeft className="h-4 w-4" /> Command Center</Link>
        <ChevronRight className="h-4 w-4 text-slate-300" />
        <Link to={`${P}/master`} className="inline-flex items-center gap-1 hover:text-slate-800"><LayoutDashboard className="h-4 w-4" /> Master dashboard</Link>
        <ChevronRight className="h-4 w-4 text-slate-300" />
        <span className="font-semibold text-slate-800">{view.title}</span>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#2563eb] to-[#06b6d4] text-[#fff] shadow-lg shadow-blue-500/20"><Icon className="h-6 w-6" /></span>
          <div>
            <h1 className="text-[28px] font-bold tracking-tight text-slate-900">{view.title}</h1>
            <p className="mt-1 max-w-3xl text-[14px] text-slate-600">{view.definition}</p>
            <p className="mt-1 text-xs text-slate-400">{scopeLabel} · as of {state.base.anchorDate}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {view.period && (
            <div className="flex rounded-xl border border-slate-200 bg-white p-1 text-xs font-semibold">
              {[7, 30, 90].map((d) => (
                <button key={d} onClick={() => setDays(d)} className={cx("rounded-lg px-3 py-1.5 transition", days === d ? "bg-[#2563eb] text-[#fff]" : "text-slate-600 hover:bg-slate-50")}>{d}D</button>
              ))}
            </div>
          )}
          <MetricSwitcher current={metric} onPick={(m) => navigate(`${P}/insights/${m}`)} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {view.tiles.map((t, i) => (
          <div key={t.label} style={{ animationDelay: `${i * 40}ms` }} className="scio-rise rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[12.5px] font-medium text-slate-500">{t.label}</span>
              {t.tag && <span className={cx("rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide", t.tag === "Confirmed" ? "bg-slate-100 text-slate-600" : "bg-amber-50 text-amber-700")}>{t.tag}</span>}
            </div>
            <div className={cx("mt-1.5 text-[22px] font-bold tabular-nums", t.tone === "bad" ? "text-rose-600" : t.tone === "good" ? "text-emerald-600" : t.tone === "warn" ? "text-amber-600" : "text-slate-900")}>
              <AnimatedValue value={t.value} />
            </div>
            {t.sub && <div className="mt-0.5 truncate text-[11.5px] text-slate-500">{t.sub}</div>}
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {view.charts.map((c, i) => (
          <Card key={c.title} delay={80 + i * 60}>
            <CardTitle hint={c.hint}>{c.title}</CardTitle>
            <ChartView spec={c} />
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_280px]">
        <div>
          <div className="mb-3">
            <h3 className="text-[17px] font-semibold text-slate-900">{view.table.title}</h3>
            <p className="text-[13px] text-slate-500">{view.table.hint}</p>
          </div>
          <DataGrid
            rows={view.table.rows}
            columns={view.table.columns}
            rowKey={view.table.rowKey}
            search={view.table.search}
            pageSize={15}
            onRowClick={view.table.link ? (r) => navigate(view.table.link!(r)) : undefined}
          />
        </div>
        <Card className="h-fit">
          <CardTitle hint="Act on this metric">Next steps</CardTitle>
          <div className="space-y-2">
            {view.actions.map((a) => (
              <Link key={a.label} to={a.to} className={cx("flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-semibold transition", a.primary ? "bg-[#2563eb] text-[#fff] hover:bg-[#1d4ed8]" : "border border-slate-200 text-slate-700 hover:bg-slate-50")}>
                {a.label} <ChevronRight className="h-4 w-4" />
              </Link>
            ))}
            <Link to={`${P}/ask`} className="flex items-center justify-between rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Ask SCIO about this <ChevronRight className="h-4 w-4" /></Link>
          </div>
          <p className="mt-4 flex gap-1.5 text-[11.5px] leading-snug text-slate-500"><Info className="mt-0.5 h-3.5 w-3.5 shrink-0" /> Figures update as soon as an action is approved anywhere in the system.</p>
        </Card>
      </div>
    </div>
  );
}

const SWITCH_LABELS: Record<string, string> = {
  stores: "Stores",
  skus: "Active SKUs",
  inventory: "Inventory value",
  stockouts: "Stockout risks",
  overstock: "Overstock",
  suppliers: "Supplier delays",
  expiry: "Expiry risk",
  losses: "Inventory losses",
  performance: "Sales vs target",
  sales: "Sales & margin",
};

function MetricSwitcher({ current, onPick }: { current: string; onPick: (m: string) => void }) {
  return (
    <select value={current} onChange={(e) => onPick(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none focus:border-blue-400" aria-label="Switch dashboard">
      {METRIC_KEYS.map((m) => (
        <option key={m} value={m}>{SWITCH_LABELS[m]}</option>
      ))}
    </select>
  );
}

function ChartView({ spec }: { spec: ChartSpec }) {
  const h = spec.kind === "hbar" ? Math.max(220, spec.data.length * 30 + 20) : 260;
  if (!spec.data.length) return <p className="py-10 text-center text-sm text-slate-500">Nothing to show in this scope.</p>;
  return (
    <div style={{ height: h }}>
      <ResponsiveContainer width="100%" height="100%">
        {spec.kind === "hbar" ? (
          <BarChart data={spec.data} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }} barCategoryGap={6}>
            <CartesianGrid stroke={C.grid} horizontal={false} />
            <XAxis type="number" {...axisProps} tickFormatter={(v) => spec.format(v)} />
            <YAxis type="category" dataKey={spec.x} {...axisProps} width={170} tick={{ fill: "#64748b", fontSize: 11 }} />
            <Tooltip content={<ChartTooltip format={(v) => spec.format(v)} />} cursor={{ fill: "rgba(59,130,246,0.06)" }} />
            {spec.series.map((s) => <Bar key={s.key} dataKey={s.key} name={s.name} fill={s.color} radius={[0, 5, 5, 0]} />)}
          </BarChart>
        ) : spec.kind === "bar" ? (
          <BarChart data={spec.data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={C.grid} vertical={false} />
            <XAxis dataKey={spec.x} {...axisProps} interval={0} tick={{ fill: "#64748b", fontSize: 11 }} />
            <YAxis {...axisProps} width={64} tickFormatter={(v) => spec.format(v)} />
            <Tooltip content={<ChartTooltip format={(v) => spec.format(v)} />} cursor={{ fill: "rgba(59,130,246,0.06)" }} />
            {spec.series.map((s) => <Bar key={s.key} dataKey={s.key} name={s.name} fill={s.color} radius={[6, 6, 0, 0]} maxBarSize={56} />)}
          </BarChart>
        ) : spec.kind === "pie" ? (
          <PieChart>
            <Pie data={spec.data} dataKey="value" nameKey={spec.x} innerRadius={60} outerRadius={95} paddingAngle={2} stroke="none">
              {spec.data.map((_, i) => <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />)}
            </Pie>
            <Tooltip content={<ChartTooltip format={(v) => spec.format(v)} />} />
            <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" wrapperStyle={{ fontSize: 12 }} />
          </PieChart>
        ) : spec.kind === "area" ? (
          <AreaChart data={spec.data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="md-area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={spec.series[0].color} stopOpacity={0.28} />
                <stop offset="100%" stopColor={spec.series[0].color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={C.grid} vertical={false} />
            <XAxis dataKey={spec.x} {...axisProps} minTickGap={20} />
            <YAxis {...axisProps} width={64} tickFormatter={(v) => spec.format(v)} />
            <Tooltip content={<ChartTooltip format={(v) => spec.format(v)} />} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
            {spec.series.map((s, i) =>
              i === 0 ? <Area key={s.key} type="monotone" dataKey={s.key} name={s.name} stroke={s.color} strokeWidth={2.5} fill="url(#md-area)" /> : <Line key={s.key} type="monotone" dataKey={s.key} name={s.name} stroke={s.color} strokeDasharray={s.dashed ? "5 5" : undefined} dot={false} strokeWidth={1.75} />
            )}
          </AreaChart>
        ) : (
          <AreaChart data={spec.data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={C.grid} vertical={false} />
            <XAxis dataKey={spec.x} {...axisProps} minTickGap={20} />
            <YAxis {...axisProps} width={48} domain={["auto", "auto"]} tickFormatter={(v) => spec.format(v)} />
            <Tooltip content={<ChartTooltip format={(v) => spec.format(v)} />} />
            {spec.series.map((s) => <Area key={s.key} type="monotone" dataKey={s.key} name={s.name} stroke={s.color} strokeWidth={2.25} fill={s.color} fillOpacity={0.08} />)}
          </AreaChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
