import React from "react";
import { Download, FileBarChart } from "lucide-react";
import { useRetail } from "../RetailContext";
import { useDemoAuth } from "../../auth";
import { NSKU } from "../generate";
import { discrepancies, supplierScorecards, type Scope } from "../analytics";
import type { RetailState } from "../state";
import { Card } from "../../ui";
import { PageTitle } from "../rui";
import type { retailKpis } from "../analytics";

type K = ReturnType<typeof retailKpis>;
const esc = (s: string | number) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
const aed = (n: number) => "AED " + Math.round(n).toLocaleString("en-US");
const pct = (n: number) => `${(n * 100).toFixed(1)}%`;
const table = (head: string[], rows: Array<Array<string | number>>) =>
  `<table><tr>${head.map((h) => `<th>${esc(h)}</th>`).join("")}</tr>${rows.map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</table>`;
const kpis = (items: Array<[string, string]>) => `<div class="kpis">${items.map(([k, v]) => `<div class="kpi"><span class="muted">${esc(k)}</span><b>${esc(v)}</b></div>`).join("")}</div>`;

function open(title: string, body: string, who: string, scopeLabel: string) {
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>SCIO Retail · ${esc(title)}</title>
<style>body{font-family:Inter,Arial,sans-serif;color:#0f172a;max-width:980px;margin:28px auto;padding:0 24px}h1{font-size:23px;margin:4px 0 0}h2{font-size:14px;margin:24px 0 8px;color:#1e3a8a}
.muted{color:#64748b;font-size:12px}.kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:14px}.kpi{border:1px solid #e2e8f0;border-radius:10px;padding:10px 12px}.kpi b{display:block;font-size:19px;margin-top:4px}
table{width:100%;border-collapse:collapse;font-size:12px}th{text-align:left;background:#f1f5f9;padding:6px 8px}td{padding:5px 8px;border-bottom:1px solid #e2e8f0}.bar{height:4px;background:linear-gradient(90deg,#e8901a,#38bdf8);border-radius:4px;margin-bottom:16px}
.note{margin-top:20px;padding:8px 10px;background:#fffbeb;border:1px solid #fde68a;border-radius:8px;font-size:11px;color:#92400e}</style></head>
<body><div class="bar"></div><div class="muted">SCIO Retail OS · ${esc(scopeLabel)}</div><h1>${esc(title)}</h1><div class="muted">Generated ${new Date().toLocaleString("en-GB", { timeZone: "Asia/Dubai" })} by ${esc(who)}</div>${body}
<script>setTimeout(()=>window.print(),400)</script></body></html>`);
  w.document.close();
}

const REPORTS: Array<{ id: string; title: string; desc: string; build: (st: RetailState, k: K, scope: Scope) => string }> = [
  {
    id: "availability",
    title: "Stock availability",
    desc: "On-shelf availability by store and region against target.",
    build: (_st, k) => kpis([["Average availability", pct(k.availability)], ["Out-of-stock store-SKUs", String(k.outOfStock)], ["Lost sales / day", aed(k.lostSalesPerDay)], ["Stores", String(k.stores)]]) + `<h2>By store</h2>${table(["Store", "Region", "Availability", "OOS SKUs", "Lost sales 30d"], [...k.perf].sort((a, b) => a.availability - b.availability).map((p) => [`${p.store.id} ${p.store.name}`, p.store.region, pct(p.availability), p.outOfStock, aed(p.lostSales30)]))}`,
  },
  {
    id: "stockout",
    title: "Stockout report",
    desc: "Every out-of-stock or at-risk store-SKU with best transfer source.",
    build: (st, k) => kpis([["At risk", String(k.stockoutRisks)], ["Out of stock now", String(k.outOfStock)], ["With transfer source", String(k.so.filter((x) => x.donor).length)], ["Lost sales / day", aed(k.lostSalesPerDay)]]) + table(["Store", "SKU", "Product", "Available", "Days left", "Lost/day", "Best source"], k.so.slice(0, 400).map((r) => [st.base.stores[r.storeIdx].id, st.base.skus[r.skuIdx].id, st.base.skus[r.skuIdx].name, r.available, r.daysOfSupply.toFixed(1), aed(r.lostSalesPerDay), r.donor ? (r.donor.type === "store" ? st.base.stores[r.donor.idx].id : st.base.dcs[r.donor.idx].name) : "-"])),
  },
  {
    id: "ageing",
    title: "Inventory ageing",
    desc: "Stock grouped by days of supply: fresh, normal, slow and excess.",
    build: (st, _k, scope) => {
      const b = [["0-7 days", 0, 0], ["8-30 days", 0, 0], ["31-90 days", 0, 0], ["91-180 days", 0, 0], ["180+ days", 0, 0]] as Array<[string, number, number]>;
      for (const s of st.base.stores) {
        if (scope && !scope.has(s.idx)) continue;
        for (let k = 0; k < NSKU; k++) {
          const p = s.idx * NSKU + k;
          if (!st.base.carried[p]) continue;
          const oh = st.onHand(p);
          const d = oh / Math.max(0.02, st.base.velocity[p]);
          const i = d <= 7 ? 0 : d <= 30 ? 1 : d <= 90 ? 2 : d <= 180 ? 3 : 4;
          b[i][1]++;
          b[i][2] += oh * st.base.skus[k].cost;
        }
      }
      return table(["Days of supply", "Store-SKUs", "Stock value"], b.map(([l, n, v]) => [l, n, aed(v)]));
    },
  },
  {
    id: "velocity",
    title: "Sales velocity",
    desc: "Fastest and slowest moving SKUs across the chain.",
    build: (st, _k, scope) => {
      const rows = st.base.skus.map((sku) => {
        let v = 0;
        for (const s of st.base.stores) if ((!scope || scope.has(s.idx)) && st.base.carried[s.idx * NSKU + sku.idx]) v += st.base.velocity[s.idx * NSKU + sku.idx];
        return { sku, v };
      });
      const sorted = rows.filter((r) => r.v > 0).sort((a, b) => b.v - a.v);
      return `<h2>Top 50 movers</h2>${table(["SKU", "Product", "Units/day", "Revenue/day"], sorted.slice(0, 50).map((r) => [r.sku.id, r.sku.name, r.v.toFixed(1), aed(r.v * r.sku.price)]))}<h2>Slowest 50</h2>${table(["SKU", "Product", "Units/day"], sorted.slice(-50).map((r) => [r.sku.id, r.sku.name, r.v.toFixed(2)]))}`;
    },
  },
  {
    id: "shrink",
    title: "Shrinkage & losses",
    desc: "Damaged stock, expiry write-off risk and unexplained losses by store.",
    build: (st, k) => kpis([["Total loss estimate", aed(k.inventoryLoss)], ["Damaged stock", aed(k.perf.reduce((a, p) => a + p.shrinkValue, 0))], ["Expiry at risk", aed(k.expiryRiskValue)], ["Phantom records", String(k.phantomCount)]]) + table(["Store", "Damaged value", "Phantom records", "Expiry at risk"], k.perf.map((p) => [`${p.store.id} ${p.store.name}`, aed(p.shrinkValue), k.ph.filter((x) => x.storeIdx === p.store.idx).length, aed(k.ex.filter((x) => x.storeIdx === p.store.idx && !x.markedDown).reduce((a, x) => a + x.atRiskValue, 0))])),
  },
  {
    id: "supplier",
    title: "Supplier performance",
    desc: "On-time, fill rate, delays, invoice issues and spend by supplier.",
    build: (st) => table(["Supplier", "POs", "On time", "Fill rate", "Avg delay", "Late open", "Invoice issues", "Spend"], supplierScorecards(st).sort((a, b) => b.riskScore - a.riskScore).map((s) => [st.base.suppliers[s.idx].name, s.pos, pct(s.onTimeRate), pct(s.fillRate), `${s.avgDelayDays.toFixed(1)} d`, s.latePos, s.invoiceIssues, aed(s.spend)])),
  },
  {
    id: "profit",
    title: "Store profitability",
    desc: "30-day sales, gross margin estimate and sales vs target per store.",
    build: (st, k) =>
      table(
        ["Store", "Format", "Sales 30d", "Gross margin est.", "vs Target", "Sales / m²"],
        k.perf.map((p) => {
          let gm = 0;
          for (let s = 0; s < NSKU; s++) {
            const q = p.store.idx * NSKU + s;
            if (st.base.carried[q]) gm += st.base.velocity[q] * (st.base.skus[s].price - st.base.skus[s].cost) * (30 - Math.min(30, st.lastSale(q)));
          }
          return [`${p.store.id} ${p.store.name}`, p.store.format, aed(p.sales30), aed(gm), pct(p.vsTarget), aed(p.sales30 / p.store.sizeSqm)];
        })
      ),
  },
  {
    id: "expiry",
    title: "Expiry",
    desc: "Perishable lots expiring before they sell, with markdown status.",
    build: (st, k) => table(["Store", "Product", "Lot", "Expiry", "Days", "Qty", "At risk", "Status"], k.ex.map((x) => [st.base.stores[x.storeIdx].id, st.base.skus[x.skuIdx].name, x.lot, x.expiry, x.daysLeft, x.qty, aed(x.atRiskValue), x.markedDown !== null ? (x.markedDown ? `Markdown ${x.markedDown}%` : "Transferred") : "Open"])),
  },
  {
    id: "procurement",
    title: "Procurement",
    desc: "Open, overdue and received POs plus receiving and invoice discrepancies.",
    build: (st) => {
      const open = st.pos.filter((p) => p.status === "Sent" || p.status === "Pending approval");
      const d = discrepancies(st);
      return kpis([["Open POs", String(open.length)], ["Overdue", String(open.filter((p) => p.promised < st.base.anchorDate).length)], ["Discrepancies", String(d.length)], ["Disputed value", aed(d.reduce((a, x) => a + x.impact, 0))]]) + `<h2>Discrepancies</h2>${table(["PO", "Supplier", "Product", "Issue", "Impact"], d.slice(0, 200).map((x) => [x.poId, st.base.suppliers[x.supplierIdx].name, st.base.skus[x.skuIdx].name, x.kind, aed(x.impact)]))}`;
    },
  },
  {
    id: "ops",
    title: "Operational performance",
    desc: "Actions taken this session, tickets, counts, transfers and their impact.",
    build: (st, k) =>
      kpis([["Actions recorded", String(st.events.length)], ["Transfers", String(st.transfers.length)], ["Cycle counts", String(st.counts.length)], ["Tickets open", String(st.tickets.filter((t) => t.status !== "Resolved").length)]]) +
      `<h2>Current exposure</h2>${table(["Measure", "Value"], [["Out of stock", k.outOfStock], ["Lost sales / day", aed(k.lostSalesPerDay)], ["Expiry at risk", aed(k.expiryRiskValue)], ["Overstock", aed(k.overstockValue)]])}<h2>Audit trail</h2>${table(["Time", "User", "Role", "Action"], [...st.events].reverse().slice(0, 150).map((e) => [new Date(e.at).toLocaleString("en-GB", { timeZone: "Asia/Dubai" }), e.user, e.role, e.type]))}`,
  },
];

export default function RetailReports() {
  const { state, kpis: k, scope, scopeLabel } = useRetail();
  const { user } = useDemoAuth();
  return (
    <div className="space-y-6">
      <PageTitle title="Reports & Analytics" sub={`Print-ready reports from live data · ${scopeLabel}`} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {REPORTS.map((r) => (
          <Card key={r.id} className="flex flex-col">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <FileBarChart className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-[16px] font-semibold text-slate-900">{r.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{r.desc}</p>
              </div>
            </div>
            <button onClick={() => open(r.title, r.build(state, k, scope), `${user?.name} · ${user?.role}`, scopeLabel)} className="mt-4 inline-flex items-center gap-2 self-start rounded-xl bg-[#111113] px-4 py-2 text-sm font-semibold text-[#fff] hover:bg-[#2a2a30]">
              <Download className="h-4 w-4" /> Generate PDF
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
}
