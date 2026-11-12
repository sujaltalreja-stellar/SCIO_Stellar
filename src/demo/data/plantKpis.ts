import type { DemoDataset } from "./types";
import { fleetHealth } from "./assetHealth";
import { overdueMaintenance, stockShortages, inventoryValue } from "./analytics";

// ---------------------------------------------------------------------------
// Plant KPIs for the Industrial home page. Reliability figures come from the
// CMMS downtime log; delivery figures from purchase orders. Money in AED.
// ---------------------------------------------------------------------------

export const SITES = ["Dubai Distribution Centre", "Riyadh Hub", "Dammam Plant"] as const;
const SITE_WAREHOUSE: Record<string, string> = { "Dubai Distribution Centre": "WH-A", "Riyadh Hub": "WH-B", "Dammam Plant": "WH-C" };

/** Cost of one hour of unplanned downtime by asset criticality (planning assumption). */
export const DOWNTIME_COST_PER_HOUR: Record<string, number> = { Critical: 2400, High: 1200, Medium: 500, Low: 200 };
const SCHEDULED_HOURS_PER_DAY = 20; // two shifts
const DAY = 86_400_000;

/** The dataset restricted to one site (assets, its warehouse's items, related POs and records). */
export function forSite(ds: DemoDataset, site: string | null): DemoDataset {
  if (!site) return ds;
  const wh = SITE_WAREHOUSE[site];
  const assets = ds.assets.filter((a) => a.site === site);
  const assetIds = new Set(assets.map((a) => a.id));
  const items = ds.items.filter((i) => i.warehouseId === wh);
  const itemIds = new Set(items.map((i) => i.id));
  const purchaseOrders = ds.purchaseOrders.filter((p) => itemIds.has(p.itemId));
  const poIds = new Set(purchaseOrders.map((p) => p.id));
  return {
    ...ds,
    warehouses: ds.warehouses.filter((w) => w.id === wh),
    assets,
    items,
    purchaseOrders,
    inspections: ds.inspections.filter((i) => assetIds.has(i.assetId)),
    invoices: ds.invoices.filter((i) => poIds.has(i.poId)),
    downtime: (ds.downtime ?? []).filter((d) => assetIds.has(d.assetId)),
  };
}

const daysAgo = (anchor: string, iso: string) => (new Date(anchor).getTime() - new Date(iso).getTime()) / DAY;

function otif(ds: DemoDataset, fromDaysAgo: number, toDaysAgo: number) {
  const pos = ds.purchaseOrders.filter((p) => {
    const d = daysAgo(ds.anchorDate, p.promisedDate);
    return d <= fromDaysAgo && d > toDaysAgo && p.deliveredDate;
  });
  const ok = pos.filter((p) => p.deliveredDate! <= p.promisedDate).length;
  return { rate: pos.length ? ok / pos.length : 1, count: pos.length };
}

export function plantKpis(ds: DemoDataset) {
  const days = 90;
  const dt = (ds.downtime ?? []).filter((d) => daysAgo(ds.anchorDate, d.start) <= days);
  const breakdowns = dt.filter((d) => d.type === "Breakdown");
  const scheduled = ds.assets.length * days * SCHEDULED_HOURS_PER_DAY;
  const downHours = dt.reduce((a, d) => a + d.hours, 0);
  const bdHours = breakdowns.reduce((a, d) => a + d.hours, 0);
  const critOf = new Map(ds.assets.map((a) => [a.id, a.criticality]));
  const downtimeCost = breakdowns.reduce((a, d) => a + d.hours * (DOWNTIME_COST_PER_HOUR[critOf.get(d.assetId) ?? "Medium"] ?? 500), 0);
  const overdue = overdueMaintenance(ds);
  const shortages = stockShortages(ds);
  const criticalSpares = shortages.filter((s) => s.item.criticality === "Critical" || s.item.criticality === "High");
  const otifNow = otif(ds, 90, 0);
  const otifPrev = otif(ds, 180, 90);
  // breakdowns in the last 30 vs previous 30 days
  const bd30 = breakdowns.filter((d) => daysAgo(ds.anchorDate, d.start) <= 30).length;
  const bdPrev30 = breakdowns.filter((d) => daysAgo(ds.anchorDate, d.start) > 30 && daysAgo(ds.anchorDate, d.start) <= 60).length;
  return {
    assets: ds.assets.length,
    availability: scheduled ? 1 - downHours / scheduled : 1,
    breakdowns: breakdowns.length,
    bd30,
    bdPrev30,
    mtbf: breakdowns.length ? (scheduled - downHours) / breakdowns.length : scheduled,
    mttr: breakdowns.length ? bdHours / breakdowns.length : 0,
    downtimeCost,
    pmCompliance: ds.assets.length ? 1 - overdue.length / ds.assets.length : 1,
    overdue,
    shortages,
    criticalSpares,
    otif: otifNow.rate,
    otifDelta: otifNow.rate - otifPrev.rate,
    otifCount: otifNow.count,
    inventoryValue: inventoryValue(ds),
    recentBreakdowns: breakdowns.slice(0, 6),
  };
}

export interface Attention {
  id: string;
  severity: "critical" | "high";
  title: string;
  cause: string;
  impact: number;
  impactLabel: string;
  action: string;
  to: string;
  state?: unknown;
}

/** The few things a plant manager should act on now, each with cause, money and action. */
export function attentionQueue(ds: DemoDataset): Attention[] {
  const out: Attention[] = [];
  const fleet = fleetHealth(ds);
  for (const f of fleet.filter((x) => x.status === "Critical" || x.status === "At risk").slice(0, 2)) {
    const rate = DOWNTIME_COST_PER_HOUR[f.asset.criticality] ?? 500;
    out.push({
      id: `asset-${f.asset.id}`,
      severity: f.status === "Critical" ? "critical" : "high",
      title: `${f.asset.name} · ${f.asset.site}`,
      cause: `Vibration ${f.vibration.recentMean.toFixed(1)} mm/s vs baseline ${f.vibration.baselineMean.toFixed(1)}${f.daysToAlarm !== null ? ` · alarm level in ~${Math.max(1, Math.round(f.daysToAlarm))} days` : ""}${f.partsAvailable < f.partsTotal ? ` · ${f.partsTotal - f.partsAvailable} spare part(s) short` : ""}`,
      impact: rate * 12,
      impactLabel: "downtime risk (12 h unplanned stop)",
      action: "Plan repair",
      to: "/app/assets",
      state: { assetId: f.asset.id },
    });
  }
  const spares = stockShortages(ds).filter((s) => s.linkedAssets.length > 0 || s.item.criticality === "Critical").slice(0, 1);
  for (const s of spares) {
    out.push({
      id: `spare-${s.item.id}`,
      severity: s.item.criticality === "Critical" ? "critical" : "high",
      title: `${s.item.name} below minimum`,
      cause: `${s.item.stock} on hand vs minimum ${s.item.minStock}${s.linkedAssets.length ? ` · needed for ${s.linkedAssets.map((a) => a.id).join(", ")} service` : ""} · ${Number.isFinite(s.daysOfCover) ? `${s.daysOfCover.toFixed(0)} days of cover` : "no usage"} · lead time ${s.item.leadTimeDays} days`,
      impact: s.replenishCost,
      impactLabel: "to restore max stock",
      action: "Raise purchase order",
      to: "/app/procurement",
    });
  }
  const od = overdueMaintenance(ds)[0];
  if (od) {
    out.push({
      id: `pm-${od.asset.id}`,
      severity: od.asset.criticality === "Critical" || od.asset.criticality === "High" ? "high" : "high",
      title: `${od.asset.name} service overdue`,
      cause: `${od.daysOverdue} days past its ${od.asset.serviceIntervalDays}-day interval · ${od.asset.criticality} asset`,
      impact: (DOWNTIME_COST_PER_HOUR[od.asset.criticality] ?? 500) * 8,
      impactLabel: "risk if it fails before service",
      action: "Schedule service",
      to: "/app/maintenance",
    });
  }
  return out.slice(0, 4);
}
