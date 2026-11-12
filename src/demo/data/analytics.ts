import type { Asset, DemoDataset, Item } from "./types";

// ---------------------------------------------------------------------------
// Deterministic analytics over the SCIO dataset.
// These functions are the single source of truth for every number shown in the
// demo; the AI Copilot will call the same functions as tools later.
// ---------------------------------------------------------------------------

const DAY = 86_400_000;

function daysBetween(fromIso: string, toIso: string) {
  return Math.round((new Date(toIso).getTime() - new Date(fromIso).getTime()) / DAY);
}
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
const mean = (xs: number[]) => (xs.length ? sum(xs) / xs.length : 0);

export function avgDailyUsage(item: Item, days = 30) {
  return mean(item.dailyUsage.slice(-days));
}

export function inventoryValue(ds: DemoDataset) {
  return sum(ds.items.map((i) => i.stock * i.unitCost));
}

// ---- Inventory ---------------------------------------------------------------

export interface ShortageRow {
  item: Item;
  warehouseName: string;
  shortfall: number; // units below minimum
  daysOfCover: number; // at current 30-day usage
  replenishCost: number; // cost to bring back to max stock
  linkedAssets: Asset[]; // assets that use this part and are due for service within 7 days (or overdue)
}

export function stockShortages(ds: DemoDataset): ShortageRow[] {
  const whName = new Map(ds.warehouses.map((w) => [w.id, w.name]));
  const dueSoon = ds.assets.filter((a) => daysBetween(ds.anchorDate, a.nextServiceDate) <= 7);
  return ds.items
    .filter((i) => i.stock < i.minStock)
    .map((item) => {
      const rate = avgDailyUsage(item);
      return {
        item,
        warehouseName: whName.get(item.warehouseId) ?? item.warehouseId,
        shortfall: item.minStock - item.stock,
        daysOfCover: rate > 0 ? item.stock / rate : Infinity,
        replenishCost: (item.maxStock - item.stock) * item.unitCost,
        linkedAssets: dueSoon.filter((a) => a.partIds.includes(item.id)),
      };
    })
    .sort((a, b) => {
      const crit = (r: ShortageRow) => (r.linkedAssets.length ? 0 : 1) + (r.item.criticality === "Critical" ? 0 : 0.5);
      return crit(a) - crit(b) || a.daysOfCover - b.daysOfCover;
    });
}

export function shortagesByWarehouse(ds: DemoDataset) {
  const rows = stockShortages(ds);
  return ds.warehouses.map((w) => {
    const mine = rows.filter((r) => r.item.warehouseId === w.id);
    return {
      warehouse: w,
      shortageCount: mine.length,
      criticalCount: mine.filter((r) => r.item.criticality === "Critical").length,
      replenishCost: sum(mine.map((r) => r.replenishCost)),
    };
  });
}

export function stockHealthByWarehouse(ds: DemoDataset) {
  return ds.warehouses.map((w) => {
    const its = ds.items.filter((i) => i.warehouseId === w.id);
    return {
      name: w.name.split(" · ")[0],
      belowMin: its.filter((i) => i.stock < i.minStock).length,
      healthy: its.filter((i) => i.stock >= i.minStock && i.stock <= i.maxStock).length,
      excess: its.filter((i) => i.stock > i.maxStock).length,
    };
  });
}

export function excessInventory(ds: DemoDataset) {
  return ds.items
    .filter((i) => i.stock > i.maxStock)
    .map((item) => ({
      item,
      excessUnits: item.stock - item.maxStock,
      tiedUpValue: (item.stock - item.maxStock) * item.unitCost,
      daysOfCover: avgDailyUsage(item, 90) > 0 ? item.stock / avgDailyUsage(item, 90) : Infinity,
    }))
    .sort((a, b) => b.tiedUpValue - a.tiedUpValue);
}

// ---- Maintenance ---------------------------------------------------------------

export function overdueMaintenance(ds: DemoDataset) {
  return ds.assets
    .map((a) => ({ asset: a, daysOverdue: -daysBetween(ds.anchorDate, a.nextServiceDate) }))
    .filter((r) => r.daysOverdue > 0)
    .sort((a, b) => b.daysOverdue - a.daysOverdue);
}

export function dueThisWeek(ds: DemoDataset) {
  return ds.assets.filter((a) => {
    const d = daysBetween(ds.anchorDate, a.nextServiceDate);
    return d >= 0 && d <= 7;
  });
}

export function repeatInspectionFailures(ds: DemoDataset, minFails = 2) {
  return ds.assets
    .map((asset) => {
      const fails = ds.inspections.filter((i) => i.assetId === asset.id && i.result === "Fail");
      return { asset, failCount: fails.length, findings: fails.map((f) => f.finding) };
    })
    .filter((r) => r.failCount >= minFails)
    .sort((a, b) => b.failCount - a.failCount);
}

/**
 * Vibration-trend risk: compares the last 7 days against the asset's own
 * 60-day baseline (z-score). SIMULATED sensor data.
 */
export function assetRisk(asset: Asset) {
  const base = asset.vibration.slice(0, 60);
  const recent = asset.vibration.slice(-7);
  const mu = mean(base);
  const sd = Math.sqrt(mean(base.map((x) => (x - mu) ** 2))) || 0.1;
  const z = (mean(recent) - mu) / sd;
  const risk = Math.max(0, Math.min(100, Math.round(10 + z * 12)));
  return { z, risk, baseline: mu, recent: mean(recent) };
}

export function riskiestAssets(ds: DemoDataset, n = 5) {
  return ds.assets
    .map((asset) => ({ asset, ...assetRisk(asset) }))
    .sort((a, b) => b.risk - a.risk)
    .slice(0, n);
}

// ---- Procurement ---------------------------------------------------------------

export function supplierPerformance(ds: DemoDataset) {
  return ds.suppliers
    .map((s) => {
      const delivered = ds.purchaseOrders.filter((p) => p.supplierId === s.id && p.deliveredDate);
      const delays = delivered.map((p) => daysBetween(p.promisedDate, p.deliveredDate!));
      const onTime = delays.filter((d) => d <= 0).length;
      return {
        supplier: s,
        orders: delivered.length,
        onTimeRate: delivered.length ? onTime / delivered.length : 1,
        avgDelayDays: mean(delays.map((d) => Math.max(0, d))),
        spend: sum(ds.purchaseOrders.filter((p) => p.supplierId === s.id).map((p) => p.quantity * p.unitPrice)),
      };
    })
    .filter((r) => r.orders > 0)
    .sort((a, b) => b.avgDelayDays - a.avgDelayDays);
}

export function overallOnTimeRate(ds: DemoDataset) {
  const delivered = ds.purchaseOrders.filter((p) => p.deliveredDate);
  const onTime = delivered.filter((p) => daysBetween(p.promisedDate, p.deliveredDate!) <= 0).length;
  return delivered.length ? onTime / delivered.length : 1;
}

export function monthlySpend(ds: DemoDataset) {
  const buckets = new Map<string, number>();
  const anchor = new Date(ds.anchorDate);
  // Last 12 complete months (the current, partial month is excluded).
  for (let m = 12; m >= 1; m--) {
    const d = new Date(Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth() - m, 1));
    buckets.set(d.toISOString().slice(0, 7), 0);
  }
  for (const po of ds.purchaseOrders) {
    const key = po.orderDate.slice(0, 7);
    if (buckets.has(key)) buckets.set(key, buckets.get(key)! + po.quantity * po.unitPrice);
  }
  return Array.from(buckets, ([month, spend]) => ({
    month,
    label: new Date(month + "-01T00:00:00Z").toLocaleString("en", { month: "short", timeZone: "UTC" }),
    spend: Math.round(spend),
  }));
}

export function totalSpend12m(ds: DemoDataset) {
  return sum(monthlySpend(ds).map((m) => m.spend));
}

export function topSpendItems(ds: DemoDataset, n = 10) {
  const byItem = new Map<string, number>();
  for (const po of ds.purchaseOrders) byItem.set(po.itemId, (byItem.get(po.itemId) ?? 0) + po.quantity * po.unitPrice);
  const itemById = new Map(ds.items.map((i) => [i.id, i]));
  return Array.from(byItem, ([id, spend]) => ({ item: itemById.get(id)!, spend }))
    .sort((a, b) => b.spend - a.spend)
    .slice(0, n);
}

export function openPurchaseOrders(ds: DemoDataset) {
  return ds.purchaseOrders.filter((p) => !p.deliveredDate);
}

// ---- Today's priorities ---------------------------------------------------------

export type IssueSeverity = "critical" | "warning" | "info";
export interface Issue {
  id: string;
  severity: IssueSeverity;
  area: "Inventory" | "Maintenance" | "Procurement" | "Assets";
  title: string;
  detail: string;
  recommendation: string;
}

const fmtMoney = (n: number) => "AED " + Math.round(n).toLocaleString("en-US");

export function todaysIssues(ds: DemoDataset): Issue[] {
  const issues: Issue[] = [];

  const shortages = stockShortages(ds);
  for (const wh of shortagesByWarehouse(ds).filter((w) => w.shortageCount > 0)) {
    const linked = shortages.filter((r) => r.item.warehouseId === wh.warehouse.id && r.linkedAssets.length);
    const linkedAssetIds = Array.from(new Set(linked.flatMap((l) => l.linkedAssets.map((a) => a.id))));
    issues.push({
      id: `short-${wh.warehouse.id}`,
      severity: linked.length ? "critical" : wh.criticalCount ? "warning" : "info",
      area: "Inventory",
      title: `${wh.warehouse.name.split(" · ")[0]}: Parts below minimum stock`,
      detail: linked.length
        ? `${wh.shortageCount} part${wh.shortageCount > 1 ? "s" : ""} below minimum (${wh.criticalCount} critical) · ${linked.length} needed for maintenance on ${linkedAssetIds.join(", ")} within 7 days.`
        : `${wh.shortageCount} part${wh.shortageCount > 1 ? "s" : ""} below minimum (${wh.criticalCount} critical) · replenishment about ${fmtMoney(wh.replenishCost)}.`,
      recommendation: linked.length ? "Prioritise replenishment of the parts linked to this week's maintenance." : "Raise purchase requests for the critical items.",
    });
  }

  const overdue = overdueMaintenance(ds);
  if (overdue.length) {
    const critical = overdue.filter((o) => o.asset.criticality === "Critical" || o.asset.criticality === "High");
    issues.push({
      id: "overdue",
      severity: critical.length ? "critical" : "warning",
      area: "Maintenance",
      title: `${overdue.length} assets have overdue maintenance`,
      detail: `${critical.length} are high or critical. Most overdue: ${overdue[0].asset.name} (${overdue[0].daysOverdue} days).`,
      recommendation: "Schedule the critical assets first and confirm parts availability.",
    });
  }

  const risky = riskiestAssets(ds, 3).filter((r) => r.risk >= 50);
  for (const r of risky) {
    issues.push({
      id: `risk-${r.asset.id}`,
      severity: r.risk >= 75 ? "critical" : "warning",
      area: "Assets",
      title: `${r.asset.name}: abnormal vibration trend`,
      detail: `7-day average ${r.recent.toFixed(1)} mm/s vs. baseline ${r.baseline.toFixed(1)} mm/s. Risk score ${r.risk}/100.`,
      recommendation: "Schedule an inspection before the next production run.",
    });
  }

  const late = supplierPerformance(ds).filter((s) => s.avgDelayDays >= 4).slice(0, 2);
  for (const s of late) {
    const open = openPurchaseOrders(ds).filter((p) => p.supplierId === s.supplier.id).length;
    issues.push({
      id: `sup-${s.supplier.id}`,
      severity: "warning",
      area: "Procurement",
      title: `${s.supplier.name} is delivering ${s.avgDelayDays.toFixed(1)} days late on average`,
      detail: `On-time rate ${(s.onTimeRate * 100).toFixed(0)}% across ${s.orders} deliveries. ${open} order${open === 1 ? "" : "s"} still open.`,
      recommendation: "Add buffer to lead times or qualify an alternative supplier.",
    });
  }

  const rank: Record<IssueSeverity, number> = { critical: 0, warning: 1, info: 2 };
  return issues.sort((a, b) => rank[a.severity] - rank[b.severity]);
}

// ---- Time series for dashboards -------------------------------------------------

function isoDaysAgo(anchorIso: string, n: number) {
  return new Date(new Date(anchorIso).getTime() - n * DAY).toISOString().slice(0, 10);
}

/**
 * Daily operations series for the last `days` days:
 * consumption value (parts used × unit cost), procurement value (POs raised)
 * and reconstructed inventory value (walking stock back through usage and receipts).
 */
export function dailyOperations(ds: DemoDataset, days = 90) {
  const H = ds.items[0]?.dailyUsage.length ?? 0;
  const consumption = new Array(days).fill(0);
  for (const it of ds.items) {
    for (let d = 0; d < days; d++) consumption[d] += (it.dailyUsage[H - days + d] ?? 0) * it.unitCost;
  }
  const dates = Array.from({ length: days }, (_, d) => isoDaysAgo(ds.anchorDate, days - 1 - d));
  const idx = new Map(dates.map((d, i) => [d, i]));
  const procurement = new Array(days).fill(0);
  const receipts = new Array(days).fill(0);
  const costById = new Map(ds.items.map((i) => [i.id, i.unitCost]));
  for (const po of ds.purchaseOrders) {
    const o = idx.get(po.orderDate);
    if (o !== undefined) procurement[o] += po.quantity * po.unitPrice;
    const r = po.deliveredDate ? idx.get(po.deliveredDate) : undefined;
    if (r !== undefined) receipts[r] += po.quantity * (costById.get(po.itemId) ?? po.unitPrice);
  }
  // Walk inventory value backwards from today.
  const inventory = new Array(days).fill(0);
  let value = inventoryValue(ds);
  for (let d = days - 1; d >= 0; d--) {
    inventory[d] = value;
    value = Math.max(0, value + consumption[d] - receipts[d]);
  }
  return dates.map((date, i) => ({
    date,
    label: new Date(date + "T00:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" }),
    consumption: Math.round(consumption[i]),
    procurement: Math.round(procurement[i]),
    inventory: Math.round(inventory[i]),
  }));
}

/** Rolling mean helper for smoothing chart lines. */
export function rolling<T extends Record<string, unknown>>(rows: T[], key: keyof T, window = 7) {
  return rows.map((_, i) => {
    const slice = rows.slice(Math.max(0, i - window + 1), i + 1).map((r) => Number(r[key]));
    return slice.reduce((a, b) => a + b, 0) / slice.length;
  });
}

export function spendByCategory(ds: DemoDataset) {
  const cat = new Map(ds.items.map((i) => [i.id, i.category]));
  const by = new Map<string, number>();
  for (const po of ds.purchaseOrders) {
    const c = cat.get(po.itemId) ?? "Other";
    by.set(c, (by.get(c) ?? 0) + po.quantity * po.unitPrice);
  }
  return Array.from(by, ([category, spend]) => ({ category, spend: Math.round(spend) })).sort((a, b) => b.spend - a.spend);
}

/** On-time delivery rate per month (by promised date), last 12 complete months. */
export function monthlyOnTime(ds: DemoDataset) {
  const months = monthlySpend(ds).map((m) => m.month);
  return months.map((month) => {
    const pos = ds.purchaseOrders.filter((p) => p.deliveredDate && p.promisedDate.startsWith(month));
    const on = pos.filter((p) => daysBetween(p.promisedDate, p.deliveredDate!) <= 0).length;
    return { month, rate: pos.length ? on / pos.length : 1 };
  });
}

export function warehouseUtilisation(ds: DemoDataset) {
  return ds.warehouses.map((w) => {
    const its = ds.items.filter((i) => i.warehouseId === w.id);
    const value = sum(its.map((i) => i.stock * i.unitCost));
    const capacity = sum(its.map((i) => i.maxStock * i.unitCost));
    return { warehouse: w, value, utilisation: capacity ? value / capacity : 0, skus: its.length };
  });
}
