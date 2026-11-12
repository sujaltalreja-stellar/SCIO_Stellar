import React, { useMemo, useState } from "react";
import { useRetail } from "../RetailContext";
import type { Audit } from "../model";
import VisionPage, { type VisionTarget } from "../../pages/VisionPage";
import { ActButton, DataGrid, nf, PageTitle, Pill, Situation, Stat, Tabs, type Column } from "../rui";

type Tab = "audits" | "photo";

export default function InspectionPage() {
  const { state, scope, dispatch } = useRetail();
  const { base } = state;
  const [tab, setTab] = useState<Tab>("audits");
  const [type, setType] = useState<string>("All");
  const audits = base.audits.filter((a) => (!scope || scope.has(a.storeIdx)) && (type === "All" || a.type === type)).sort((a, b) => b.date.localeCompare(a.date));
  const failing = audits.filter((a) => a.score < 75);
  const openFindings = audits.filter((a) => a.findings.length && !state.alertStatus.has(`aud-${a.id}`));

  const targets = useMemo<VisionTarget[]>(() => {
    const stores = base.stores.filter((s) => !scope || scope.has(s.idx));
    const out: VisionTarget[] = [];
    for (const s of stores) {
      out.push({ id: s.id, label: `${s.id} ${s.name} · shelf / aisle`, meta: [["Format", s.format], ["Manager", s.manager], ["Last shelf audit", base.audits.filter((a) => a.storeIdx === s.idx && a.type === "Shelf").sort((a, b) => b.date.localeCompare(a.date))[0]?.date ?? "–"]] });
      for (const e of base.equipment.filter((x) => x.storeIdx === s.idx && x.type !== "POS Terminal").slice(0, 6))
        out.push({ id: e.id, label: `${s.id} · ${e.type} ${e.id}`, meta: [["Make", e.make], ["Last service", e.lastService], ["Installed", String(e.installed)]] });
    }
    return out;
  }, [base, scope]);

  const cols: Column<Audit>[] = [
    { key: "id", label: "Audit", render: (a) => (<span><span className="font-semibold text-slate-900">{a.type} audit</span><span className="block text-xs text-slate-500">{a.id} · {a.auditor}</span></span>) },
    { key: "store", label: "Store", sort: (a) => a.storeIdx, render: (a) => `${base.stores[a.storeIdx].id} ${base.stores[a.storeIdx].name}` },
    { key: "date", label: "Date", sort: (a) => a.date, render: (a) => a.date },
    { key: "score", label: "Score", align: "right", sort: (a) => a.score, render: (a) => <span className={a.score < 75 ? "font-bold text-rose-600" : a.score < 85 ? "font-bold text-amber-600" : "font-bold text-emerald-700"}>{a.score}</span> },
    { key: "findings", label: "Findings (evidence)", render: (a) => (a.findings.length ? <ul className="list-disc pl-4 text-[13px]">{a.findings.map((f) => <li key={f}>{f}</li>)}</ul> : <span className="text-slate-400">No findings</span>) },
    {
      key: "act",
      label: "",
      align: "right",
      render: (a) =>
        a.findings.length === 0 ? null : state.alertStatus.get(`aud-${a.id}`) ? (
          <Pill tone="good">{state.alertStatus.get(`aud-${a.id}`)!.status === "resolved" ? "Closed" : "Follow-up assigned"}</Pill>
        ) : (
          <span className="inline-flex gap-1.5">
            <ActButton perm="alert.manage" variant="secondary" onClick={() => dispatch({ type: "alert_status", alertId: `aud-${a.id}`, status: "acknowledged", note: `Follow-up assigned to ${base.stores[a.storeIdx].manager}` }, "Follow-up task assigned to store manager")}>Assign follow-up</ActButton>
            <ActButton perm="alert.manage" onClick={() => dispatch({ type: "alert_status", alertId: `aud-${a.id}`, status: "resolved", note: "Findings closed with photo evidence" }, "Audit findings closed")}>Close</ActButton>
          </span>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageTitle title="Inspection" sub="Store audits, shelf, safety, hygiene, cold-chain and pricing checks, plus AI photo inspection" />
      <Situation
        what={<>{failing.length} audits below 75 · {openFindings.length} with open findings</>}
        why={<>Shelf gaps, planogram issues, hygiene logs and cold-chain discipline</>}
        where={<>{new Set(failing.map((a) => base.stores[a.storeIdx].id)).size} stores, worst: {failing.sort((a, b) => a.score - b.score)[0] ? base.stores[failing[0].storeIdx].id : "–"}</>}
        action={<>Assign follow-ups, close with photo evidence, use AI photo inspection for shelves and equipment</>}
      />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Audits (90 days)" value={nf(audits.length)} />
        <Stat label="Average score" value={audits.length ? (audits.reduce((a, x) => a + x.score, 0) / audits.length).toFixed(1) : "–"} />
        <Stat label="Below 75" value={failing.length} tone={failing.length ? "bad" : "good"} />
        <Stat label="Open findings" value={openFindings.length} tone={openFindings.length ? "warn" : "good"} />
      </div>
      <Tabs<Tab>
        value={tab}
        onChange={setTab}
        tabs={[
          ["audits", "Store audits", audits.length],
          ["photo", "AI photo inspection"],
        ]}
      />
      {tab === "audits" ? (
        <DataGrid
          rows={audits}
          columns={cols}
          rowKey={(a) => a.id}
          search={(a) => `${a.id} ${a.type} ${base.stores[a.storeIdx].name} ${a.findings.join(" ")}`}
          placeholder="Search store, audit type or finding…"
          initialSort={{ key: "score", dir: "asc" }}
          toolbar={
            <select value={type} onChange={(e) => setType(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
              {["All", "Shelf", "Safety", "Hygiene", "Cold chain", "Pricing"].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          }
        />
      ) : (
        <VisionPage targets={targets} targetLabel="Store or equipment" hideHeader />
      )}
    </div>
  );
}
