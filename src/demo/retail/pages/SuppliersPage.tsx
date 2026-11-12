import React, { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useRetail } from "../RetailContext";
import { useWorkflows } from "../workflows";
import { supplierScorecards, type SupplierScore, type SupplierDelay } from "../analytics";
import { ActButton, aed, DataGrid, Drawer, MiniBar, nf, PageTitle, pctf, Pill, Situation, Stat, Tabs, type Column } from "../rui";
import { Card } from "../../ui";

type Tab = "scorecards" | "delays";

export default function SuppliersPage() {
  const { state, kpis } = useRetail();
  const wf = useWorkflows();
  const { base } = state;
  const [params, setParams] = useSearchParams();
  const tab = (params.get("tab") as Tab) || "scorecards";
  const scores = useMemo(() => supplierScorecards(state), [state]);
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const risky = scores.filter((s) => s.riskScore >= 40);

  const cols: Column<SupplierScore>[] = [
    { key: "name", label: "Supplier", sort: (s) => base.suppliers[s.idx].name, render: (s) => (<div><div className="font-semibold text-slate-900">{base.suppliers[s.idx].name}</div><div className="text-xs text-slate-500">{base.suppliers[s.idx].country} · {base.suppliers[s.idx].categories.join(", ")}</div></div>) },
    { key: "risk", label: "Risk", sort: (s) => s.riskScore, render: (s) => <Pill tone={s.riskScore >= 40 ? "bad" : s.riskScore >= 20 ? "warn" : "good"}>{s.riskScore}</Pill> },
    { key: "ot", label: "On-time", sort: (s) => s.onTimeRate, render: (s) => (<div className="flex items-center gap-2"><MiniBar value={s.onTimeRate} tone={s.onTimeRate < 0.75 ? "bad" : "good"} />{pctf(s.onTimeRate, 0)}</div>) },
    { key: "fill", label: "Fill rate", sort: (s) => s.fillRate, render: (s) => (<div className="flex items-center gap-2"><MiniBar value={s.fillRate} tone={s.fillRate < 0.9 ? "warn" : "good"} />{pctf(s.fillRate, 0)}</div>) },
    { key: "lt", label: "Lead time", align: "right", sort: (s) => base.suppliers[s.idx].leadTimeDays, render: (s) => `${base.suppliers[s.idx].leadTimeDays} d` },
    { key: "delay", label: "Avg delay", align: "right", sort: (s) => s.avgDelayDays, render: (s) => `${s.avgDelayDays.toFixed(1)} d` },
    { key: "late", label: "Late open POs", align: "right", sort: (s) => s.latePos, render: (s) => (s.latePos ? <Pill tone="bad">{s.latePos}</Pill> : "0") },
    { key: "inv", label: "Invoice issues", align: "right", sort: (s) => s.invoiceIssues, render: (s) => s.invoiceIssues },
    { key: "spend", label: "Spend · 70d", align: "right", sort: (s) => s.spend, render: (s) => aed(s.spend) },
  ];

  const delays = kpis.sd;
  const dCols: Column<SupplierDelay>[] = [
    { key: "po", label: "PO", render: (d) => <span className="font-semibold text-slate-900">{d.poId}</span> },
    { key: "sup", label: "Supplier", render: (d) => base.suppliers[d.supplierIdx].name },
    { key: "dest", label: "Destination", render: (d) => (d.destType === "dc" ? base.dcs[d.destIdx].name : base.stores[d.destIdx].id) },
    { key: "late", label: "Days late", align: "right", sort: (d) => d.daysLate, render: (d) => <span className="font-semibold text-rose-600">{d.daysLate}</span> },
    { key: "skus", label: "Affected SKUs", align: "right", render: (d) => d.affectedSkus.length },
    { key: "stores", label: "Stores running low", render: (d) => (d.affectedStores.length ? d.affectedStores.slice(0, 4).map((s) => base.stores[s].id).join(", ") + (d.affectedStores.length > 4 ? ` +${d.affectedStores.length - 4}` : "") : <span className="text-slate-400">none yet</span>) },
    { key: "val", label: "Undelivered", align: "right", sort: (d) => d.value, render: (d) => aed(d.value) },
    { key: "act", label: "", align: "right", render: (d) => (state.alertStatus.get(d.id) ? <Pill tone="good">Action created</Pill> : <ActButton perm="transfer.create" onClick={() => wf.alternativeReplenishment(d)}>Alternative supply</ActButton>) },
  ];

  const sel = openIdx !== null ? scores[openIdx] : null;
  return (
    <div className="space-y-6">
      <PageTitle title="Suppliers" sub="Fill rate, on-time delivery, lead time, invoice accuracy and late-order recovery" />
      <Situation
        what={<>{delays.length} overdue purchase orders · {risky.length} high-risk suppliers</>}
        why={<>Chronic late delivery and short fills from {risky.slice(0, 2).map((s) => base.suppliers[s.idx].name).join(" and ") || "a few suppliers"}</>}
        where={<>{new Set(delays.flatMap((d) => d.affectedStores)).size} stores running low on affected SKUs</>}
        action={<>Cover gaps from sister DCs or alternative suppliers; review contracts for repeat offenders</>}
      />
      <Tabs<Tab>
        value={tab}
        onChange={(t) => setParams({ tab: t })}
        tabs={[
          ["scorecards", "Scorecards", scores.length],
          ["delays", "Delivery delays", delays.length],
        ]}
      />
      {tab === "scorecards" ? (
        <DataGrid rows={scores} columns={cols} rowKey={(s) => String(s.idx)} search={(s) => `${base.suppliers[s.idx].name} ${base.suppliers[s.idx].categories.join(" ")}`} placeholder="Search supplier or category…" onRowClick={(s) => setOpenIdx(s.idx)} initialSort={{ key: "risk", dir: "desc" }} />
      ) : (
        <DataGrid rows={delays} columns={dCols} rowKey={(d) => d.id} search={(d) => `${d.poId} ${base.suppliers[d.supplierIdx].name}`} empty="No overdue purchase orders." />
      )}
      {sel && (
        <Drawer open onClose={() => setOpenIdx(null)} title={base.suppliers[sel.idx].name} sub={`${base.suppliers[sel.idx].id} · ${base.suppliers[sel.idx].country} · contact ${base.suppliers[sel.idx].contact}`}>
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <Stat label="Risk score" value={sel.riskScore} tone={sel.riskScore >= 40 ? "bad" : "good"} />
              <Stat label="On-time" value={pctf(sel.onTimeRate, 0)} />
              <Stat label="Fill rate" value={pctf(sel.fillRate, 0)} />
              <Stat label="SKUs supplied" value={nf(sel.skuCount)} />
            </div>
            <Card>
              <h4 className="mb-2 text-sm font-semibold text-slate-900">Recent purchase orders</h4>
              <table className="w-full text-sm">
                <tbody className="divide-y divide-slate-100">
                  {state.pos.filter((p) => p.supplierIdx === sel.idx).slice(0, 15).map((p) => (
                    <tr key={p.id}>
                      <td className="py-2 font-medium text-slate-900">{p.id}</td>
                      <td className="py-2 text-slate-600">{p.created} → {p.promised}</td>
                      <td className="py-2 text-slate-600">{p.received ? `received ${p.received}` : "open"}</td>
                      <td className="py-2 text-right">
                        <Pill tone={p.received ? (p.received <= p.promised ? "good" : "warn") : p.promised < base.anchorDate ? "bad" : "accent"}>{p.received ? (p.received <= p.promised ? "On time" : "Late") : p.promised < base.anchorDate ? "Overdue" : p.status}</Pill>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        </Drawer>
      )}
    </div>
  );
}
