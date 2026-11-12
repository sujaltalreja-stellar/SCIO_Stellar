import { getIndustrialData } from "./data";
import {
  avgDailyUsage,
  excessInventory,
  inventoryValue,
  monthlySpend,
  overallOnTimeRate,
  overdueMaintenance,
  repeatInspectionFailures,
  riskiestAssets,
  shortagesByWarehouse,
  spendByCategory,
  stockShortages,
  supplierPerformance,
  todaysIssues,
  topSpendItems,
  totalSpend12m,
  dueThisWeek,
} from "../../demo/data/analytics";
import { forecastAll, portfolioAccuracy, reorderPlan } from "../../demo/data/forecast";
import { fleetHealth } from "../../demo/data/assetHealth";
import type { CopilotResponse, CopilotTurn, Visual } from "../../demo/copilotTypes";
import type { DemoDataset } from "../../demo/data/types";
import { sarvamChat, type ChatMessage, type ToolDef } from "./sarvam";

// ---------------------------------------------------------------------------
// Ask SCIO: LLM + tool calling over SCIO's operational data.
// The model decides WHICH data to fetch; every figure comes from the tools.
// Charts/tables are built here from tool output, never invented by the model.
// ---------------------------------------------------------------------------

type Args = Record<string, unknown>;
interface ToolResult {
  data: unknown;
  visuals: Visual[];
}

const r0 = (n: number) => Math.round(n);
const r1 = (n: number) => Math.round(n * 10) / 10;

function matchWarehouse(ds: DemoDataset, w: unknown): string | null {
  if (!w || typeof w !== "string") return null;
  const q = w.toLowerCase().replace(/warehouse/g, "").replace(/[^a-z0-9 -]/g, "").trim();
  if (!q || q === "all" || q === "any") return null;
  // 1) exact letter / id ("c", "wh-c")
  const byId = ds.warehouses.find((x) => x.id.toLowerCase() === q || x.id.toLowerCase().endsWith("-" + q));
  if (byId) return byId.id;
  // 2) city or a whole word of the name (avoids "c" matching "Central DC")
  if (q.length < 3) return null;
  const hit = ds.warehouses.find((x) => x.city.toLowerCase().includes(q) || x.name.toLowerCase().split(/[\s·]+/).some((word) => word === q || (q.length >= 4 && word.startsWith(q))));
  return hit?.id ?? null;
}
function matchSite(ds: DemoDataset, s: unknown): string | null {
  if (!s || typeof s !== "string") return null;
  const q = s.toLowerCase();
  const sites = Array.from(new Set(ds.assets.map((a) => a.site)));
  return sites.find((x) => x.toLowerCase().includes(q) || q.includes(x.toLowerCase().split(" ")[0])) ?? null;
}
const limitOf = (a: Args, def = 10, max = 25) => Math.min(max, Math.max(1, Number(a.limit) || def));

// Downtime cost assumptions (AED per hour) used for financial-impact estimates.
const DOWNTIME_AED_PER_HOUR: Record<string, number> = { Critical: 18_000, High: 9_000, Medium: 3_500, Low: 1_200 };

const TOOLS: Array<ToolDef & { run: (ds: DemoDataset, a: Args) => ToolResult }> = [
  {
    type: "function",
    function: {
      name: "get_business_overview",
      description: "High-level KPIs: inventory value, shortages, overdue maintenance, supplier on-time rate, 12-month spend, and today's top issues.",
      parameters: { type: "object", properties: {} },
    },
    run: (ds) => {
      const issues = todaysIssues(ds);
      return {
        data: {
          currency: "AED",
          inventoryValue: r0(inventoryValue(ds)),
          skus: ds.items.length,
          partsBelowMinimum: stockShortages(ds).length,
          assets: ds.assets.length,
          overdueMaintenance: overdueMaintenance(ds).length,
          supplierOnTimeRate: r1(overallOnTimeRate(ds) * 100) + "%",
          procurementSpend12m: r0(totalSpend12m(ds)),
          topIssues: issues.slice(0, 6).map((i) => ({ severity: i.severity, title: i.title, detail: i.detail, recommendation: i.recommendation })),
        },
        visuals: [
          {
            kind: "table",
            title: "Today's priorities",
            columns: [
              { key: "severity", label: "Severity" },
              { key: "area", label: "Area" },
              { key: "title", label: "Issue" },
              { key: "recommendation", label: "Recommendation" },
            ],
            rows: issues.map((i) => ({ severity: i.severity, area: i.area, title: i.title, recommendation: i.recommendation })),
          },
        ],
      };
    },
  },
  {
    type: "function",
    function: {
      name: "get_stock_shortages",
      description: "Inventory items below minimum stock, optionally for one warehouse (A, B, C or city: Dubai, Riyadh, Dammam). Includes days of cover, replenishment cost and assets due for maintenance that need the part.",
      parameters: {
        type: "object",
        properties: {
          warehouse: { type: "string", description: "Warehouse letter, name or city" },
          critical_only: { type: "boolean" },
          limit: { type: "number" },
        },
      },
    },
    run: (ds, a) => {
      const wh = matchWarehouse(ds, a.warehouse);
      let rows = stockShortages(ds).filter((r) => !wh || r.item.warehouseId === wh);
      if (a.critical_only) rows = rows.filter((r) => r.item.criticality === "Critical");
      const byWh = shortagesByWarehouse(ds);
      const list = rows.slice(0, limitOf(a, 15));
      return {
        data: {
          currency: "AED",
          totalShortItems: rows.length,
          byWarehouse: byWh.map((w) => ({ warehouse: w.warehouse.name, shortItems: w.shortageCount, critical: w.criticalCount, replenishCost: r0(w.replenishCost) })),
          items: list.map((r) => ({
            sku: r.item.id,
            name: r.item.name,
            warehouse: r.warehouseName,
            criticality: r.item.criticality,
            stock: r.item.stock,
            minimum: r.item.minStock,
            daysOfCover: Number.isFinite(r.daysOfCover) ? r1(r.daysOfCover) : null,
            replenishCost: r0(r.replenishCost),
            neededForMaintenanceOn: r.linkedAssets.map((x) => x.id),
          })),
        },
        visuals: [
          {
            kind: "bar" as const,
            title: "Parts below minimum by warehouse",
            xKey: "warehouse",
            series: [
              { key: "short", label: "Below minimum" },
              { key: "critical", label: "Critical" },
            ],
            rows: byWh.map((w) => ({ warehouse: w.warehouse.name.split(" · ")[0], short: w.shortageCount, critical: w.criticalCount })),
          },
          {
            kind: "table",
            title: wh ? `Shortages · ${ds.warehouses.find((x) => x.id === wh)?.name}` : "Items below minimum stock",
            columns: [
              { key: "sku", label: "SKU" },
              { key: "name", label: "Item" },
              { key: "warehouse", label: "Warehouse" },
              { key: "criticality", label: "Criticality" },
              { key: "stock", label: "Stock", format: "number" },
              { key: "min", label: "Min", format: "number" },
              { key: "cover", label: "Cover", format: "days" },
              { key: "assets", label: "Needed for" },
            ],
            rows: list.map((r) => ({
              sku: r.item.id,
              name: r.item.name,
              warehouse: r.warehouseName.split(" · ")[0],
              criticality: r.item.criticality,
              stock: r.item.stock,
              min: r.item.minStock,
              cover: Number.isFinite(r.daysOfCover) ? r1(r.daysOfCover) : null,
              assets: r.linkedAssets.map((x) => x.id).join(", ") || "-",
            })),
          },
        ],
      };
    },
  },
  {
    type: "function",
    function: {
      name: "get_overdue_maintenance",
      description: "Assets whose scheduled maintenance is overdue, plus assets due within 7 days. Optional site filter (Dubai, Riyadh, Dammam).",
      parameters: { type: "object", properties: { site: { type: "string" }, limit: { type: "number" } } },
    },
    run: (ds, a) => {
      const site = matchSite(ds, a.site);
      const rows = overdueMaintenance(ds).filter((r) => !site || r.asset.site === site);
      const due = dueThisWeek(ds).filter((x) => !site || x.site === site);
      const list = rows.slice(0, limitOf(a, 15));
      return {
        data: {
          overdueCount: rows.length,
          dueWithin7Days: due.map((x) => ({ id: x.id, name: x.name, due: x.nextServiceDate })),
          overdue: list.map((r) => ({ id: r.asset.id, name: r.asset.name, site: r.asset.site, criticality: r.asset.criticality, daysOverdue: r.daysOverdue, lastService: r.asset.lastServiceDate })),
        },
        visuals: [
          {
            kind: "hbar",
            title: "Days overdue",
            xKey: "asset",
            series: [{ key: "days", label: "Days overdue" }],
            format: "days",
            rows: list.map((r) => ({ asset: r.asset.id, days: r.daysOverdue })),
          },
          {
            kind: "table",
            title: "Overdue maintenance",
            columns: [
              { key: "id", label: "Asset" },
              { key: "name", label: "Name" },
              { key: "site", label: "Site" },
              { key: "criticality", label: "Criticality" },
              { key: "last", label: "Last service" },
              { key: "days", label: "Overdue", format: "days" },
            ],
            rows: list.map((r) => ({ id: r.asset.id, name: r.asset.name, site: r.asset.site, criticality: r.asset.criticality, last: r.asset.lastServiceDate, days: r.daysOverdue })),
          },
        ],
      };
    },
  },
  {
    type: "function",
    function: {
      name: "get_top_spend_items",
      description: "Items consuming the most procurement budget over the last 12 months.",
      parameters: { type: "object", properties: { limit: { type: "number" } } },
    },
    run: (ds, a) => {
      const rows = topSpendItems(ds, limitOf(a, 10));
      const total = totalSpend12m(ds);
      return {
        data: { currency: "AED", totalSpend12m: r0(total), items: rows.map((r) => ({ sku: r.item.id, name: r.item.name, category: r.item.category, spend: r0(r.spend), shareOfTotal: r1((r.spend / total) * 100) + "%" })) },
        visuals: [
          {
            kind: "hbar",
            title: `Top ${rows.length} items by procurement spend`,
            xKey: "item",
            series: [{ key: "spend", label: "Spend" }],
            format: "money",
            rows: rows.map((r) => ({ item: `${r.item.name} (${r.item.warehouseId.replace("WH-", "")})`, spend: r0(r.spend) })),
          },
        ],
      };
    },
  },
  {
    type: "function",
    function: {
      name: "get_supplier_performance",
      description: "Supplier delivery performance: on-time rate, average delay in days, deliveries, open orders and spend. Sorted by worst delay.",
      parameters: { type: "object", properties: { limit: { type: "number" } } },
    },
    run: (ds, a) => {
      const rows = supplierPerformance(ds).slice(0, limitOf(a, 10));
      const open = (id: string) => ds.purchaseOrders.filter((p) => p.supplierId === id && !p.deliveredDate).length;
      return {
        data: rows.map((s) => ({ supplier: s.supplier.name, country: s.supplier.country, onTimeRate: r1(s.onTimeRate * 100) + "%", avgDelayDays: r1(s.avgDelayDays), deliveries: s.orders, openOrders: open(s.supplier.id), spend12m: r0(s.spend) })),
        visuals: [
          {
            kind: "hbar",
            title: "Average delivery delay (days)",
            xKey: "supplier",
            series: [{ key: "delay", label: "Avg. delay" }],
            format: "days",
            rows: rows.map((s) => ({ supplier: s.supplier.name, delay: r1(s.avgDelayDays) })),
          },
          {
            kind: "table",
            title: "Supplier performance",
            columns: [
              { key: "supplier", label: "Supplier" },
              { key: "country", label: "Country" },
              { key: "ontime", label: "On time", format: "percent" },
              { key: "delay", label: "Avg. delay", format: "days" },
              { key: "open", label: "Open POs", format: "number" },
              { key: "spend", label: "Spend · 12m", format: "money" },
            ],
            rows: rows.map((s) => ({ supplier: s.supplier.name, country: s.supplier.country, ontime: r1(s.onTimeRate * 100), delay: r1(s.avgDelayDays), open: open(s.supplier.id), spend: r0(s.spend) })),
          },
        ],
      };
    },
  },
  {
    type: "function",
    function: {
      name: "get_repeat_inspection_failures",
      description: "Assets that failed inspection repeatedly in the last 12 months, with findings.",
      parameters: { type: "object", properties: { min_failures: { type: "number" } } },
    },
    run: (ds, a) => {
      const rows = repeatInspectionFailures(ds, Math.max(2, Number(a.min_failures) || 2));
      return {
        data: rows.map((r) => ({ id: r.asset.id, name: r.asset.name, site: r.asset.site, failures: r.failCount, findings: Array.from(new Set(r.findings)) })),
        visuals: [
          {
            kind: "table",
            title: "Repeated inspection failures (last 4 inspections)",
            columns: [
              { key: "id", label: "Asset" },
              { key: "name", label: "Name" },
              { key: "site", label: "Site" },
              { key: "fails", label: "Failures", format: "number" },
              { key: "findings", label: "Findings" },
            ],
            rows: rows.map((r) => ({ id: r.asset.id, name: r.asset.name, site: r.asset.site, fails: r.failCount, findings: Array.from(new Set(r.findings)).join("; ") })),
          },
        ],
      };
    },
  },
  {
    type: "function",
    function: {
      name: "estimate_shortage_financial_impact",
      description: "Estimated financial impact of current stock shortages: replenishment cost plus downtime exposure for assets that need short parts. Optional warehouse filter.",
      parameters: { type: "object", properties: { warehouse: { type: "string" } } },
    },
    run: (ds, a) => {
      const wh = matchWarehouse(ds, a.warehouse);
      const rows = stockShortages(ds).filter((r) => !wh || r.item.warehouseId === wh);
      const detail = rows.map((r) => {
        const gapDays = Math.max(0, r.item.leadTimeDays - (Number.isFinite(r.daysOfCover) ? r.daysOfCover : 999));
        const downtime = r.linkedAssets.reduce((acc, asset) => acc + Math.min(gapDays, 3) * 8 * (DOWNTIME_AED_PER_HOUR[asset.criticality] ?? 0), 0);
        return { r, downtime };
      });
      const replenish = detail.reduce((s, d) => s + d.r.replenishCost, 0);
      const downtime = detail.reduce((s, d) => s + d.downtime, 0);
      const byWh = ds.warehouses
        .filter((w) => !wh || w.id === wh)
        .map((w) => {
          const mine = detail.filter((d) => d.r.item.warehouseId === w.id);
          return { warehouse: w.name.split(" · ")[0], replenish: r0(mine.reduce((s, d) => s + d.r.replenishCost, 0)), downtime: r0(mine.reduce((s, d) => s + d.downtime, 0)) };
        });
      return {
        data: {
          currency: "AED",
          shortItems: rows.length,
          replenishmentCost: r0(replenish),
          downtimeExposure: r0(downtime),
          totalEstimatedImpact: r0(replenish + downtime),
          assumptions:
            "Downtime exposure = assets that need a short part × days the part arrives after stock runs out (capped at 3) × 8 production hours × hourly downtime cost by criticality (Critical 18,000, High 9,000, Medium 3,500, Low 1,200 AED/h).",
          largestExposures: detail
            .filter((d) => d.downtime > 0)
            .sort((x, y) => y.downtime - x.downtime)
            .slice(0, 5)
            .map((d) => ({ sku: d.r.item.id, item: d.r.item.name, assets: d.r.linkedAssets.map((x) => x.id), downtimeExposure: r0(d.downtime) })),
        },
        visuals: [
          {
            kind: "bar",
            title: "Shortage impact by warehouse (AED)",
            xKey: "warehouse",
            format: "money",
            series: [
              { key: "replenish", label: "Replenishment cost" },
              { key: "downtime", label: "Downtime exposure" },
            ],
            rows: byWh,
          },
        ],
      };
    },
  },
  {
    type: "function",
    function: {
      name: "get_asset_risk",
      description: "Assets ranked by risk score from vibration and pressure trend anomalies versus their own baseline.",
      parameters: { type: "object", properties: { limit: { type: "number" } } },
    },
    run: (ds, a) => {
      const rows = riskiestAssets(ds, limitOf(a, 8));
      return {
        data: rows.map((r) => ({ id: r.asset.id, name: r.asset.name, site: r.asset.site, riskScore: r.risk, vibrationNow: r1(r.recent), vibrationBaseline: r1(r.baseline), runningHours: r.asset.runningHours })),
        visuals: [
          {
            kind: "hbar",
            title: "Asset risk score (0-100)",
            xKey: "asset",
            series: [{ key: "risk", label: "Risk score" }],
            rows: rows.map((r) => ({ asset: r.asset.name, risk: r.risk })),
          },
        ],
      };
    },
  },
  {
    type: "function",
    function: {
      name: "get_excess_inventory",
      description: "Slow-moving and excess inventory above maximum stock, with capital tied up.",
      parameters: { type: "object", properties: { limit: { type: "number" } } },
    },
    run: (ds, a) => {
      const rows = excessInventory(ds).slice(0, limitOf(a, 10));
      return {
        data: { currency: "AED", items: rows.map((r) => ({ sku: r.item.id, name: r.item.name, warehouse: r.item.warehouseId, excessUnits: r.excessUnits, tiedUpValue: r0(r.tiedUpValue), avgDailyUsage90d: r1(avgDailyUsage(r.item, 90)) })) },
        visuals: [
          {
            kind: "table",
            title: "Excess inventory",
            columns: [
              { key: "sku", label: "SKU" },
              { key: "name", label: "Item" },
              { key: "wh", label: "Warehouse" },
              { key: "excess", label: "Excess units", format: "number" },
              { key: "value", label: "Capital tied up", format: "money" },
            ],
            rows: rows.map((r) => ({ sku: r.item.id, name: r.item.name, wh: r.item.warehouseId.replace("WH-", "Warehouse "), excess: r.excessUnits, value: r0(r.tiedUpValue) })),
          },
        ],
      };
    },
  },
  {
    type: "function",
    function: {
      name: "get_spend_analysis",
      description: "Procurement spend by month (last 12 complete months) and by category.",
      parameters: { type: "object", properties: {} },
    },
    run: (ds) => {
      const monthly = monthlySpend(ds);
      const cats = spendByCategory(ds);
      return {
        data: { currency: "AED", monthly: monthly.map((m) => ({ month: m.month, spend: m.spend })), byCategory: cats.slice(0, 10) },
        visuals: [
          { kind: "line", title: "Monthly procurement spend", xKey: "label", format: "money", series: [{ key: "spend", label: "Spend" }], rows: monthly.map((m) => ({ label: m.label, spend: m.spend })) },
          { kind: "pie", title: "Spend by category", xKey: "category", format: "money", series: [{ key: "spend", label: "Spend" }], rows: cats.slice(0, 8) },
        ],
      };
    },
  },
  {
    type: "function",
    function: {
      name: "get_reorder_recommendations",
      description:
        "Demand forecast-based replenishment plan: items predicted to fall below minimum stock or run out, days until critical/stockout, recommended order quantity and value, order-by date. Optional warehouse filter or specific SKU / item name.",
      parameters: { type: "object", properties: { warehouse: { type: "string" }, item: { type: "string", description: "SKU or part of the item name" }, limit: { type: "number" } } },
    },
    run: (ds, a) => {
      const wh = matchWarehouse(ds, a.warehouse);
      const q = typeof a.item === "string" ? a.item.toLowerCase() : "";
      const pool = q ? forecastAll(ds).filter((f) => f.item.id.toLowerCase() === q || f.item.name.toLowerCase().includes(q)) : reorderPlan(ds);
      const rows = pool.filter((f) => !wh || f.item.warehouseId === wh).slice(0, limitOf(a, 10));
      return {
        data: {
          currency: "AED",
          method: "Holt-Winters forecast on 12 months of daily consumption with weekly seasonality; order quantity covers lead time + 30 days plus safety stock, net of stock on order.",
          portfolioForecastAccuracy: r1(portfolioAccuracy(ds) * 100) + "%",
          items: rows.map((f) => ({
            sku: f.item.id,
            name: f.item.name,
            warehouse: f.item.warehouseId,
            stock: f.item.stock,
            minimum: f.item.minStock,
            avgDailyUse30d: r1(f.avgDaily30),
            forecastDailyUse30d: r1(f.forecastDaily30),
            onOrder: f.onOrder,
            daysUntilBelowMinimum: f.daysToCritical,
            daysUntilStockout: f.daysToStockout,
            recommendedQty: f.recommendedQty,
            recommendedValue: r0(f.recommendedCost),
            orderBy: f.orderBy,
            urgency: f.urgency,
          })),
        },
        visuals: [
          {
            kind: "table",
            title: "Replenishment recommendations",
            columns: [
              { key: "sku", label: "SKU" },
              { key: "name", label: "Item" },
              { key: "stock", label: "Stock", format: "number" },
              { key: "crit", label: "Below min in", format: "days" },
              { key: "qty", label: "Order qty", format: "number" },
              { key: "value", label: "Value", format: "money" },
              { key: "by", label: "Order by" },
            ],
            rows: rows.map((f) => ({ sku: f.item.id, name: f.item.name, stock: f.item.stock, crit: f.daysToCritical, qty: f.recommendedQty, value: r0(f.recommendedCost), by: f.orderBy ?? "-" })),
          },
        ],
      };
    },
  },
  {
    type: "function",
    function: {
      name: "get_asset_health",
      description: "Predictive maintenance view: asset health and risk scores, status, risk drivers and projected days until vibration reaches the alarm limit. Optional asset id filter.",
      parameters: { type: "object", properties: { asset: { type: "string" }, limit: { type: "number" } } },
    },
    run: (ds, a) => {
      const q = typeof a.asset === "string" ? a.asset.toLowerCase() : "";
      const rows = fleetHealth(ds)
        .filter((h) => !q || h.asset.id.toLowerCase() === q || h.asset.name.toLowerCase().includes(q))
        .slice(0, limitOf(a, 8));
      return {
        data: rows.map((h) => ({ id: h.asset.id, name: h.asset.name, site: h.asset.site, healthScore: h.healthScore, status: h.status, daysToVibrationAlarm: h.daysToAlarm, drivers: h.drivers })),
        visuals: [
          {
            kind: "hbar",
            title: "Asset health score (100 = healthy)",
            xKey: "asset",
            series: [{ key: "health", label: "Health score" }],
            rows: rows.map((h) => ({ asset: h.asset.name, health: h.healthScore })),
          },
        ],
      };
    },
  },
];

const TOOL_DEFS: ToolDef[] = TOOLS.map(({ type, function: f }) => ({ type, function: f }));

const FOLLOW_UPS: Record<string, string[]> = {
  get_business_overview: ["Which warehouse has the biggest shortage?", "Which assets are most at risk?"],
  get_stock_shortages: ["What is the financial impact of these shortages?", "Which of these parts are needed this week?"],
  get_overdue_maintenance: ["Do we have the parts for these assets?", "Which assets have repeated inspection failures?"],
  get_top_spend_items: ["Show spend by category", "Which suppliers are delaying deliveries?"],
  get_supplier_performance: ["Which open orders are at risk of arriving late?", "Top 10 items by procurement spend"],
  get_repeat_inspection_failures: ["Which assets have overdue maintenance?", "Show asset risk scores"],
  estimate_shortage_financial_impact: ["Which parts should we reorder first?", "Which suppliers supply these parts?"],
  get_asset_risk: ["Do we have spare parts for the riskiest assets?", "Which assets have overdue maintenance?"],
  get_excess_inventory: ["How much capital is tied up in excess stock per warehouse?", "Which items are short?"],
  get_spend_analysis: ["Top 10 items by procurement spend", "Which suppliers have the highest delays?"],
  get_reorder_recommendations: ["What is the total value of orders needed this week?", "Which of these suppliers are delivering late?"],
  get_asset_health: ["Do we have spare parts for these assets?", "Which assets have overdue maintenance?"],
};

function systemPrompt(ds: DemoDataset) {
  return `You are SCIO, the AI operations copilot inside SCIO, a unified business operating system.
Today is ${ds.anchorDate}. Currency is AED. Warehouses: ${ds.warehouses.map((w) => `${w.id.replace("WH-", "")} = ${w.name} (${w.city})`).join("; ")}.

Rules:
- ALWAYS call one or more tools to get data before answering any business question. Never guess or invent numbers.
- Use only figures returned by tools. If the data does not cover the question, say so plainly.
- Answer for a busy manager: start with a one-sentence direct answer, then 2-5 short bullet points with the key figures (use **bold** for numbers), then a line starting with "Recommendation:" giving a concrete next action grounded in the data.
- Charts and tables are shown to the user automatically from the tool results, so do not reproduce long tables; refer to them briefly.
- For estimates, mention the key assumption in one short clause.
- Keep answers under 170 words. Use plain business English.`;
}

export async function runCopilot(question: string, history: CopilotTurn[], token?: string): Promise<CopilotResponse> {
  const ds = await getIndustrialData(token);
  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt(ds) },
    ...history.slice(-8).map((t) => ({ role: t.role, content: t.content.slice(0, 2000) }) as ChatMessage),
    { role: "user", content: question.slice(0, 1000) },
  ];

  const visuals: Visual[] = [];
  const toolsUsed: string[] = [];

  for (let step = 0; step < 4; step++) {
    const { message } = await sarvamChat({ messages, tools: TOOL_DEFS, maxTokens: 900 });
    const calls = message.tool_calls ?? [];
    if (!calls.length) {
      return {
        answer: (message.content ?? "").trim() || "I couldn't produce an answer for that. Try rephrasing the question.",
        visuals,
        toolsUsed,
        followUps: Array.from(new Set(toolsUsed.flatMap((t) => FOLLOW_UPS[t] ?? []))).slice(0, 3),
      };
    }
    messages.push({ role: "assistant", content: message.content ?? null, tool_calls: calls });
    for (const call of calls) {
      const tool = TOOLS.find((t) => t.function.name === call.function.name);
      let args: Args = {};
      try {
        args = JSON.parse(call.function.arguments || "{}");
      } catch {
        /* use defaults */
      }
      let content: string;
      if (!tool) content = JSON.stringify({ error: `Unknown tool ${call.function.name}` });
      else {
        const res = tool.run(ds, args);
        if (!toolsUsed.includes(tool.function.name)) {
          toolsUsed.push(tool.function.name);
          visuals.push(...res.visuals);
        }
        content = JSON.stringify(res.data);
      }
      messages.push({ role: "tool", tool_call_id: call.id, content });
    }
  }

  // Tool budget exhausted: ask for a final answer without tools.
  const { message } = await sarvamChat({ messages, maxTokens: 900 });
  return {
    answer: (message.content ?? "").trim(),
    visuals,
    toolsUsed,
    followUps: Array.from(new Set(toolsUsed.flatMap((t) => FOLLOW_UPS[t] ?? []))).slice(0, 3),
  };
}
