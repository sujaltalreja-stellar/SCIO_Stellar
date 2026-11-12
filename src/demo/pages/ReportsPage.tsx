import React from "react";
import { FileBarChart, Boxes, Truck, Wrench, Download, ShieldCheck } from "lucide-react";
import { useDataset } from "../useDataset";
import { useDemoAuth } from "../auth";
import {
  excessInventory,
  inventoryValue,
  monthlySpend,
  overallOnTimeRate,
  overdueMaintenance,
  spendByCategory,
  stockShortages,
  supplierPerformance,
  todaysIssues,
  totalSpend12m,
} from "../data/analytics";
import { portfolioAccuracy, reorderPlan, priceAnomalies } from "../data/forecast";
import { fleetHealth } from "../data/assetHealth";
import { useApproval } from "../components/Approval";
import { Card, money, num, btnPrimary, cx } from "../ui";
import type { DemoDataset } from "../data/types";

const esc = (s: string | number) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
const table = (head: string[], rows: Array<Array<string | number>>) =>
  `<table><tr>${head.map((h) => `<th>${esc(h)}</th>`).join("")}</tr>${rows.map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</table>`;

function openReport(title: string, body: string, user: string) {
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>SCIO · ${esc(title)}</title>
<style>body{font-family:Inter,Arial,sans-serif;color:#0f172a;max-width:900px;margin:32px auto;padding:0 24px}
h1{font-size:24px;margin:4px 0 0}h2{font-size:15px;margin:26px 0 8px;color:#1e3a8a}.muted{color:#64748b;font-size:12px}
.kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:16px}.kpi{border:1px solid #e2e8f0;border-radius:10px;padding:10px 12px}
.kpi b{display:block;font-size:20px;margin-top:4px}table{width:100%;border-collapse:collapse;font-size:12.5px}th{text-align:left;background:#f1f5f9;padding:7px 8px}
td{padding:6px 8px;border-bottom:1px solid #e2e8f0}ul{padding-left:18px;font-size:13px}.bar{height:4px;background:linear-gradient(90deg,#2563eb,#38bdf8);border-radius:4px;margin-bottom:18px}</style></head>
<body><div class="bar"></div><div class="muted">SCIO · Business OS</div><h1>${esc(title)}</h1>
<div class="muted">Generated ${new Date().toLocaleString("en-GB", { timeZone: "Asia/Dubai" })} for ${esc(user)}</div>${body}
<script>setTimeout(()=>window.print(),400)</script></body></html>`);
  w.document.close();
}

const kpis = (items: Array<[string, string]>) => `<div class="kpis">${items.map(([k, v]) => `<div class="kpi"><span class="muted">${esc(k)}</span><b>${esc(v)}</b></div>`).join("")}</div>`;

const REPORTS: Array<{ id: string; title: string; desc: string; icon: typeof Boxes; build: (ds: DemoDataset) => string }> = [
  {
    id: "exec",
    title: "Executive summary",
    desc: "Operations health, key figures and today's priorities on one page.",
    icon: FileBarChart,
    build: (ds) =>
      kpis([
        ["Inventory value", money(inventoryValue(ds), true)],
        ["Parts below minimum", String(stockShortages(ds).length)],
        ["Overdue maintenance", String(overdueMaintenance(ds).length)],
        ["Supplier on-time", `${Math.round(overallOnTimeRate(ds) * 100)}%`],
      ]) +
      `<h2>Today's priorities</h2><ul>${todaysIssues(ds)
        .map((i) => `<li><b>${esc(i.title)}</b>: ${esc(i.detail)} <i>→ ${esc(i.recommendation)}</i></li>`)
        .join("")}</ul>` +
      `<h2>Procurement spend by month</h2>${table(
        ["Month", "Spend"],
        monthlySpend(ds).map((m) => [m.label, money(m.spend)])
      )}`,
  },
  {
    id: "inventory",
    title: "Inventory & replenishment",
    desc: "Shortages, forecast-based reorder plan and excess stock.",
    icon: Boxes,
    build: (ds) => {
      const plan = reorderPlan(ds);
      return (
        kpis([
          ["Forecast accuracy", `${(portfolioAccuracy(ds) * 100).toFixed(1)}%`],
          ["Items to reorder", String(plan.length)],
          ["Reorder value", money(plan.reduce((s, p) => s + p.recommendedCost, 0), true)],
          ["Excess stock", money(excessInventory(ds).reduce((s, e) => s + e.tiedUpValue, 0), true)],
        ]) +
        `<h2>Reorder plan</h2>${table(
          ["SKU", "Item", "Stock", "Min", "Below min in", "Order qty", "Value", "Order by"],
          plan.map((p) => [p.item.id, p.item.name, p.item.stock, p.item.minStock, p.daysToCritical === null ? "-" : `${p.daysToCritical} d`, num(p.recommendedQty), money(p.recommendedCost), p.orderBy ?? "-"])
        )}<h2>Excess stock</h2>${table(
          ["SKU", "Item", "Excess units", "Capital tied up"],
          excessInventory(ds).map((e) => [e.item.id, e.item.name, num(e.excessUnits), money(e.tiedUpValue)])
        )}`
      );
    },
  },
  {
    id: "suppliers",
    title: "Supplier performance",
    desc: "On-time delivery, delays, spend and price anomalies by supplier.",
    icon: Truck,
    build: (ds) =>
      kpis([
        ["Spend · 12 months", money(totalSpend12m(ds), true)],
        ["On-time rate", `${Math.round(overallOnTimeRate(ds) * 100)}%`],
        ["Active suppliers", String(supplierPerformance(ds).length)],
        ["Price anomalies", String(priceAnomalies(ds).length)],
      ]) +
      `<h2>Suppliers</h2>${table(
        ["Supplier", "Country", "Deliveries", "On time", "Avg. delay", "Spend"],
        supplierPerformance(ds).map((s) => [s.supplier.name, s.supplier.country, s.orders, `${Math.round(s.onTimeRate * 100)}%`, `${s.avgDelayDays.toFixed(1)} d`, money(s.spend)])
      )}<h2>Spend by category</h2>${table(
        ["Category", "Spend"],
        spendByCategory(ds).map((c) => [c.category, money(c.spend)])
      )}`,
  },
  {
    id: "maintenance",
    title: "Asset health & maintenance",
    desc: "Health scores, risk drivers, predicted alarms and overdue services.",
    icon: Wrench,
    build: (ds) => {
      const fleet = fleetHealth(ds);
      return (
        kpis([
          ["Fleet health", `${Math.round(fleet.reduce((s, f) => s + f.healthScore, 0) / fleet.length)}/100`],
          ["Critical / at risk", String(fleet.filter((f) => f.status === "Critical" || f.status === "At risk").length)],
          ["Overdue services", String(overdueMaintenance(ds).length)],
          ["Monitored assets", String(fleet.length)],
        ]) +
        `<h2>Assets by risk</h2>${table(
          ["Asset", "Site", "Health", "Status", "Days to alarm", "Drivers"],
          fleet.map((f) => [f.asset.name, f.asset.site, f.healthScore, f.status, f.daysToAlarm ?? "-", f.drivers.join("; ") || "-"])
        )}`
      );
    },
  },
];

export default function ReportsPage() {
  const ds = useDataset();
  const { user } = useDemoAuth();
  const { records } = useApproval();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[30px] font-bold tracking-tight text-slate-900">Reports</h1>
        <p className="mt-1.5 text-[15px] text-slate-600">Generate print-ready reports from live operational data.</p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {REPORTS.map((r) => (
          <Card key={r.id} className="flex flex-col">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <r.icon className="h-6 w-6" />
              </span>
              <div className="flex-1">
                <h3 className="text-[17px] font-semibold text-slate-900">{r.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{r.desc}</p>
              </div>
            </div>
            <button onClick={() => openReport(r.title, r.build(ds), `${user?.name} · ${user?.role}`)} className={cx(btnPrimary, "mt-5 self-start")}>
              <Download className="h-4 w-4" /> Generate PDF
            </button>
          </Card>
        ))}
      </div>

      <Card>
        <div className="mb-4 flex items-center gap-3">
          <ShieldCheck className="h-5 w-5 text-slate-500" />
          <div>
            <h3 className="text-[17px] font-semibold text-slate-900">Approval log</h3>
            <p className="text-[13px] text-slate-500">Purchase requests, work orders and invoice decisions approved this session</p>
          </div>
        </div>
        {records.length === 0 ? (
          <p className="text-sm text-slate-500">No approvals yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-[13px] text-slate-600">
                <th className="pb-2 font-semibold">Reference</th>
                <th className="pb-2 font-semibold">Type</th>
                <th className="pb-2 font-semibold">Subject</th>
                <th className="pb-2 font-semibold">Approved by</th>
                <th className="pb-2 font-semibold">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.map((r) => (
                <tr key={r.ref}>
                  <td className="py-2.5 font-semibold text-slate-900">{r.ref}</td>
                  <td className="py-2.5 text-slate-600">{r.kind}</td>
                  <td className="py-2.5 text-slate-800">{r.title}</td>
                  <td className="py-2.5 text-slate-600">{r.by}</td>
                  <td className="py-2.5 text-slate-600">{new Date(r.at).toLocaleTimeString("en-GB", { timeZone: "Asia/Dubai", hour: "2-digit", minute: "2-digit" })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
