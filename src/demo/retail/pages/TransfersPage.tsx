import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useRetail } from "../RetailContext";
import { useWorkflows } from "../workflows";
import { transferRecommendations, type StockoutRisk } from "../analytics";
import type { Transfer } from "../state";
import { ActButton, aed, DataGrid, nf, PageTitle, Pill, Situation, Tabs, type Column } from "../rui";

type Tab = "recommended" | "active" | "history";

export default function TransfersPage() {
  const { state, scope } = useRetail();
  const wf = useWorkflows();
  const { base } = state;
  const [tab, setTab] = useState<Tab>("recommended");
  const recs = useMemo(() => transferRecommendations(state, scope), [state, scope]);
  const mine = state.transfers.filter((t) => !scope || scope.has(t.toStore) || (t.from.type === "store" && scope.has(t.from.idx)));
  const active = mine.filter((t) => t.status === "Requested" || t.status === "Approved · in transit");
  const history = mine.filter((t) => t.status === "Received" || t.status === "Cancelled");
  const loc = (t: Transfer["from"]) => (t.type === "store" ? `${base.stores[t.idx].id} ${base.stores[t.idx].name}` : base.dcs[t.idx].name);

  const recCols: Column<StockoutRisk>[] = [
    { key: "sku", label: "Product", render: (r) => <Link to={`/app/retail/skus?sku=${base.skus[r.skuIdx].id}`} className="font-semibold text-slate-900 hover:text-blue-700">{base.skus[r.skuIdx].icon} {base.skus[r.skuIdx].name}</Link> },
    { key: "from", label: "From", render: (r) => loc({ type: r.donor!.type, idx: r.donor!.idx }) },
    { key: "to", label: "To", render: (r) => `${base.stores[r.storeIdx].id} ${base.stores[r.storeIdx].name}` },
    { key: "qty", label: "Qty", align: "right", sort: (r) => r.donor!.qty, render: (r) => nf(r.donor!.qty) },
    { key: "days", label: "Dest. days left", align: "right", sort: (r) => r.daysOfSupply, render: (r) => (r.outOfStock ? <Pill tone="bad">OOS</Pill> : nf(r.daysOfSupply, 1)) },
    { key: "val", label: "Sales protected (7d)", align: "right", sort: (r) => r.lostSalesPerDay, render: (r) => aed(r.lostSalesPerDay * 7) },
    { key: "act", label: "", align: "right", render: (r) => <ActButton perm="transfer.create" onClick={() => wf.transferForStockout(r)}>Create transfer</ActButton> },
  ];

  const tCols: Column<Transfer>[] = [
    { key: "id", label: "Transfer", render: (t) => (<span><span className="font-semibold text-slate-900">{t.id}</span><span className="block text-xs text-slate-500">{t.createdBy} · {new Date(t.created).toLocaleString("en-GB", { timeZone: "Asia/Dubai", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span></span>) },
    { key: "sku", label: "Product", render: (t) => base.skus[t.skuIdx].name },
    { key: "route", label: "Route", render: (t) => `${loc(t.from)} → ${base.stores[t.toStore].id}` },
    { key: "qty", label: "Qty", align: "right", render: (t) => nf(t.qty) },
    { key: "reason", label: "Reason", render: (t) => t.reason },
    { key: "status", label: "Status", render: (t) => <Pill tone={t.status === "Received" ? "good" : t.status === "Cancelled" ? "neutral" : t.status === "Requested" ? "violet" : "accent"}>{t.status}</Pill> },
    {
      key: "act",
      label: "",
      align: "right",
      render: (t) =>
        t.status === "Requested" ? (
          <span className="inline-flex gap-1.5">
            <ActButton perm="transfer.approve" onClick={() => wf.approveTransfer(t.id)}>Approve</ActButton>
            <ActButton perm="transfer.approve" variant="secondary" onClick={() => wf.cancelTransfer(t.id)}>Cancel</ActButton>
          </span>
        ) : t.status === "Approved · in transit" ? (
          <ActButton perm="transfer.receive" onClick={() => wf.receiveTransfer(t.id)}>Receive at {base.stores[t.toStore].id}</ActButton>
        ) : null,
    },
  ];

  return (
    <div className="space-y-6">
      <PageTitle title="Transfers" sub="Inter-store and DC-to-store stock movements: recommended, in progress and completed" />
      <Situation
        what={<>{nf(recs.length)} transfers recommended · {active.length} in progress</>}
        why={<>Stores out of stock while nearby stores or the DC hold surplus</>}
        where={<>{new Set(recs.map((r) => r.storeIdx)).size} destination stores</>}
        action={<>Create & approve transfers, then receive them at the destination to update shelf stock</>}
      />
      <Tabs<Tab>
        value={tab}
        onChange={setTab}
        tabs={[
          ["recommended", "Recommended", recs.length],
          ["active", "In progress", active.length],
          ["history", "Completed", history.length],
        ]}
      />
      {tab === "recommended" && <DataGrid rows={recs} columns={recCols} rowKey={(r) => r.id} search={(r) => `${base.skus[r.skuIdx].name} ${base.stores[r.storeIdx].id} ${base.stores[r.storeIdx].name}`} placeholder="Search product or store…" />}
      {tab === "active" && <DataGrid rows={active} columns={tCols} rowKey={(t) => t.id} empty="No transfers in progress." />}
      {tab === "history" && <DataGrid rows={history} columns={tCols} rowKey={(t) => t.id} empty="No completed transfers yet." />}
    </div>
  );
}
