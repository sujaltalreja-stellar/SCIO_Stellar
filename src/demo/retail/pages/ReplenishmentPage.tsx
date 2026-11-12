import React, { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useRetail } from "../RetailContext";
import { useWorkflows } from "../workflows";
import { useApproval } from "../../components/Approval";
import { NSKU } from "../generate";
import { newId } from "../state";
import type { ExpiryRow, OverstockRow, PhantomRow, StockoutRisk } from "../analytics";
import { ActButton, aed, DataGrid, nf, PageTitle, Pill, Situation, Tabs, type Column } from "../rui";
import { Card } from "../../ui";

type Tab = "stockouts" | "phantom" | "overstock" | "expiry" | "plan" | "counts";

export default function ReplenishmentPage() {
  const { state, kpis, can, dispatch } = useRetail();
  const wf = useWorkflows();
  const { request } = useApproval();
  const { base } = state;
  const [params, setParams] = useSearchParams();
  const tab = (params.get("tab") as Tab) || "stockouts";
  const setTab = (t: Tab) => setParams({ tab: t });
  const sn = (s: number) => `${base.stores[s].id} ${base.stores[s].name}`;
  const skuCell = (k: number, s?: number) => (
    <Link to={`/app/retail/skus?sku=${base.skus[k].id}${s !== undefined ? `&store=${base.stores[s].id}` : ""}`} onClick={(e) => e.stopPropagation()} className="flex items-center gap-2 hover:text-blue-700">
      <span className="text-lg">{base.skus[k].icon}</span>
      <span className="min-w-0">
        <span className="block truncate font-semibold text-slate-900">{base.skus[k].name}</span>
        <span className="text-xs text-slate-500">{base.skus[k].id}</span>
      </span>
    </Link>
  );
  const pendingTo = useMemo(() => new Set(state.transfers.filter((t) => t.status === "Requested" || t.status === "Approved · in transit").map((t) => `${t.toStore}-${t.skuIdx}`)), [state.transfers]);

  // DC replenishment plan
  const plan = useMemo(() => {
    const rows: Array<{ id: string; dc: number; k: number; stock: number; inbound: number; demand: number; cover: number; qty: number; supplier: number }> = [];
    for (const dc of base.dcs) {
      const served = base.stores.filter((s) => s.dcIdx === dc.idx);
      for (let k = 0; k < NSKU; k++) {
        let demand = 0;
        for (const s of served) demand += base.velocity[s.idx * NSKU + k];
        if (demand < 0.5) continue;
        const stock = state.dcOnHand(dc.idx, k);
        const inbound = state.dcInbound(dc.idx, k);
        const lead = base.suppliers[base.skus[k].supplierIdx].leadTimeDays;
        const cover = (stock + inbound) / demand;
        if (cover > lead + 7) continue;
        const qty = Math.ceil(demand * (lead + 28) - stock - inbound);
        if (qty <= 0) continue;
        rows.push({ id: `pl-${dc.idx}-${k}`, dc: dc.idx, k, stock, inbound, demand, cover, qty, supplier: base.skus[k].supplierIdx });
      }
    }
    return rows.sort((a, b) => a.cover - b.cover);
  }, [state, base]);

  const recs = kpis.so.filter((r) => r.donor && !pendingTo.has(`${r.storeIdx}-${r.skuIdx}`));
  const bulkTransfers = async () => {
    const top = recs.slice(0, 20);
    const rec = await request({
      kind: "Stock transfer",
      title: `${top.length} recommended transfers`,
      lines: [
        ["Stores helped", String(new Set(top.map((t) => t.storeIdx)).size)],
        ["Units moved", nf(top.reduce((a, t) => a + (t.donor?.qty ?? 0), 0))],
        ["Lost sales avoided (7 days)", aed(top.reduce((a, t) => a + t.lostSalesPerDay * 7, 0))],
      ],
      note: "Each transfer keeps at least 3 weeks of cover at the source store.",
      confirmLabel: "Approve all",
      silent: true,
    });
    if (!rec) return;
    for (const r of top) {
      const transferId = newId("TRF");
      dispatch({ type: "transfer_create", transferId, skuIdx: r.skuIdx, from: { type: r.donor!.type, idx: r.donor!.idx }, toStore: r.storeIdx, qty: r.donor!.qty, reason: "Stockout risk (bulk)", alertId: r.id });
      if (can("transfer.approve")) dispatch({ type: "transfer_approve", transferId });
    }
  };

  const soCols: Column<StockoutRisk>[] = [
    { key: "sku", label: "Product", render: (r) => skuCell(r.skuIdx, r.storeIdx) },
    { key: "store", label: "Store", sort: (r) => r.storeIdx, render: (r) => sn(r.storeIdx) },
    { key: "av", label: "Available", align: "right", sort: (r) => r.available, render: (r) => (r.outOfStock ? <Pill tone="bad">0 · OOS</Pill> : nf(r.available)) },
    { key: "dos", label: "Days left", align: "right", sort: (r) => r.daysOfSupply, render: (r) => nf(r.daysOfSupply, 1) },
    { key: "lost", label: "Lost sales/day", align: "right", sort: (r) => r.lostSalesPerDay, render: (r) => aed(r.lostSalesPerDay) },
    { key: "src", label: "Best source", render: (r) => (r.donor ? <span className="text-xs">{r.donor.type === "store" ? sn(r.donor.idx) : base.dcs[r.donor.idx].name}<span className="block text-slate-500">{nf(r.donor.available)} available</span></span> : <span className="text-xs text-slate-400">None nearby · reorder</span>) },
    { key: "act", label: "", align: "right", render: (r) => (pendingTo.has(`${r.storeIdx}-${r.skuIdx}`) ? <Pill tone="accent">Transfer pending</Pill> : r.donor ? <ActButton perm="transfer.create" onClick={() => wf.transferForStockout(r)}>Transfer {nf(r.donor.qty)}</ActButton> : <ActButton perm="po.create" variant="secondary" onClick={() => wf.createPo({ supplierIdx: base.skus[r.skuIdx].supplierIdx, destType: "store", destIdx: r.storeIdx, lines: [{ skuIdx: r.skuIdx, qty: r.needQty }], reason: "Stockout, no internal stock" })}>Create PO</ActButton>) },
  ];

  const phCols: Column<PhantomRow>[] = [
    { key: "sku", label: "Product", render: (r) => skuCell(r.skuIdx, r.storeIdx) },
    { key: "store", label: "Store", render: (r) => sn(r.storeIdx) },
    { key: "sys", label: "System qty", align: "right", sort: (r) => r.systemQty, render: (r) => nf(r.systemQty) },
    { key: "nosale", label: "Days without sale", align: "right", sort: (r) => r.daysNoSale, render: (r) => <span className="font-semibold text-rose-600">{r.daysNoSale}</span> },
    { key: "vel", label: "Normal sales/day", align: "right", render: (r) => nf(r.velocity, 1) },
    { key: "lost", label: "Sales missed", align: "right", sort: (r) => r.expectedSalesLost, render: (r) => aed(r.expectedSalesLost) },
    { key: "act", label: "", align: "right", render: (r) => <ActButton perm="count.run" onClick={() => wf.startCount(r)}>Start cycle count</ActButton> },
  ];

  const ovCols: Column<OverstockRow>[] = [
    { key: "sku", label: "Product", render: (r) => skuCell(r.skuIdx, r.storeIdx) },
    { key: "store", label: "Store", render: (r) => sn(r.storeIdx) },
    { key: "oh", label: "On hand", align: "right", sort: (r) => r.onHand, render: (r) => nf(r.onHand) },
    { key: "dos", label: "Days of supply", align: "right", sort: (r) => r.daysOfSupply, render: (r) => <span className="font-semibold text-amber-600">{nf(r.daysOfSupply)}</span> },
    { key: "ex", label: "Excess value", align: "right", sort: (r) => r.excessValue, render: (r) => aed(r.excessValue) },
    {
      key: "act",
      label: "Rebalance",
      align: "right",
      render: (r) => {
        const need = kpis.so.find((x) => x.skuIdx === r.skuIdx && base.stores[x.storeIdx].country === base.stores[r.storeIdx].country && !pendingTo.has(`${x.storeIdx}-${x.skuIdx}`));
        return need ? (
          <ActButton perm="transfer.create" onClick={() => wf.transferForStockout({ ...need, donor: { type: "store", idx: r.storeIdx, available: r.onHand, daysOfSupply: r.daysOfSupply, qty: Math.min(need.needQty, r.excessUnits) } })}>
            Send to {base.stores[need.storeIdx].id}
          </ActButton>
        ) : (
          <span className="text-xs text-slate-500">No store short · pause reorders</span>
        );
      },
    },
  ];

  const exCols: Column<ExpiryRow>[] = [
    { key: "sku", label: "Product", render: (r) => skuCell(r.skuIdx, r.storeIdx) },
    { key: "store", label: "Store", render: (r) => sn(r.storeIdx) },
    { key: "lot", label: "Lot / expiry", render: (r) => (<span className="text-xs"><span className="font-mono">{r.lot}</span><span className="block text-slate-500">{r.expiry}</span></span>) },
    { key: "days", label: "Days left", align: "right", sort: (r) => r.daysLeft, render: (r) => <span className={r.daysLeft <= 3 ? "font-semibold text-rose-600" : "font-semibold text-amber-600"}>{r.daysLeft}</span> },
    { key: "qty", label: "Qty / will sell", align: "right", render: (r) => `${nf(r.qty)} / ${nf(r.expectedToSell)}` },
    { key: "val", label: "At risk", align: "right", sort: (r) => r.atRiskValue, render: (r) => aed(r.atRiskValue) },
    {
      key: "act",
      label: "",
      align: "right",
      render: (r) =>
        r.markedDown !== null ? (
          <Pill tone="good">{r.markedDown ? `${r.markedDown}% markdown · tracking` : "Transferred"}</Pill>
        ) : (
          <span className="inline-flex gap-1.5">
            <ActButton perm="markdown.apply" onClick={() => wf.markdownExpiry(r)}>Markdown {state.thresholds.markdownPct}%</ActButton>
            {r.transferTo !== null && (
              <ActButton perm="transfer.create" variant="secondary" onClick={() => wf.transferExpiry(r)}>
                → {base.stores[r.transferTo].id}
              </ActButton>
            )}
          </span>
        ),
    },
  ];

  const openCounts = state.counts.filter((c) => c.status === "Counting");
  const expiryOpen = kpis.ex.filter((x) => x.markedDown === null);

  return (
    <div className="space-y-6">
      <PageTitle title="Inventory & Replenishment" sub="Exception queues with recommended actions: stockouts, phantom inventory, excess, expiry and DC reorders" />
      <Situation
        what={<>{nf(kpis.outOfStock)} OOS · {nf(kpis.phantomCount)} phantom · {nf(expiryOpen.length)} expiring batches</>}
        why={<>Demand outpacing replenishment, supplier delays, inaccurate stock records, slow sell-through of fresh</>}
        where={<>{new Set(kpis.so.map((x) => x.storeIdx)).size} stores affected · worst: {kpis.perf.slice().sort((a, b) => b.outOfStock - a.outOfStock)[0]?.store.id}</>}
        action={<>Approve transfers, start cycle counts, mark down expiring lots, raise DC purchase orders</>}
      />

      <Tabs<Tab>
        value={tab}
        onChange={setTab}
        tabs={[
          ["stockouts", "Stockouts", kpis.so.length],
          ["phantom", "Phantom inventory", kpis.ph.length],
          ["counts", "Cycle counts", openCounts.length],
          ["expiry", "Expiry", expiryOpen.length],
          ["overstock", "Overstock", kpis.ov.length],
          ["plan", "DC replenishment", plan.length],
        ]}
      />

      {tab === "stockouts" && (
        <DataGrid
          rows={kpis.so}
          columns={soCols}
          rowKey={(r) => r.id}
          search={(r) => `${base.skus[r.skuIdx].name} ${base.skus[r.skuIdx].id} ${base.stores[r.storeIdx].id} ${base.stores[r.storeIdx].name}`}
          placeholder="Search product or store…"
          toolbar={
            <ActButton perm="transfer.create" size="md" onClick={bulkTransfers} disabled={recs.length === 0}>
              Approve top {Math.min(20, recs.length)} transfers
            </ActButton>
          }
        />
      )}
      {tab === "phantom" && <DataGrid rows={kpis.ph} columns={phCols} rowKey={(r) => r.id} search={(r) => `${base.skus[r.skuIdx].name} ${base.stores[r.storeIdx].id}`} placeholder="Search product or store…" />}
      {tab === "counts" && <CountsTab />}
      {tab === "expiry" && <DataGrid rows={kpis.ex} columns={exCols} rowKey={(r) => r.id} search={(r) => `${base.skus[r.skuIdx].name} ${base.stores[r.storeIdx].id} ${r.lot}`} placeholder="Search product, store or lot…" />}
      {tab === "overstock" && <DataGrid rows={kpis.ov} columns={ovCols} rowKey={(r) => r.id} search={(r) => `${base.skus[r.skuIdx].name} ${base.stores[r.storeIdx].id}`} placeholder="Search product or store…" />}
      {tab === "plan" && (
        <DataGrid
          rows={plan}
          rowKey={(r) => r.id}
          search={(r) => `${base.skus[r.k].name} ${base.dcs[r.dc].name} ${base.suppliers[r.supplier].name}`}
          placeholder="Search product, DC or supplier…"
          columns={[
            { key: "sku", label: "Product", render: (r) => skuCell(r.k) },
            { key: "dc", label: "DC", render: (r) => base.dcs[r.dc].name },
            { key: "cover", label: "Days of cover (incl. inbound)", align: "right", sort: (r) => r.cover, render: (r) => <span className={r.cover < 3 ? "font-semibold text-rose-600" : "font-semibold text-amber-600"}>{nf(r.cover, 1)}</span> },
            { key: "stock", label: "DC stock / inbound", align: "right", render: (r) => `${nf(r.stock)} / ${nf(r.inbound)}` },
            { key: "sup", label: "Supplier", render: (r) => (<span className="text-xs">{base.suppliers[r.supplier].name}<span className="block text-slate-500">lead {base.suppliers[r.supplier].leadTimeDays} d</span></span>) },
            { key: "qty", label: "Suggested qty", align: "right", sort: (r) => r.qty, render: (r) => nf(r.qty) },
            { key: "act", label: "", align: "right", render: (r) => <ActButton perm="po.create" onClick={() => wf.createPo({ supplierIdx: r.supplier, destType: "dc", destIdx: r.dc, lines: [{ skuIdx: r.k, qty: r.qty }], reason: "DC cover below lead time + 1 week" })}>Create PO</ActButton> },
          ]}
        />
      )}
    </div>
  );
}

function CountsTab() {
  const { state } = useRetail();
  const wf = useWorkflows();
  const { base } = state;
  const [inputs, setInputs] = useState<Record<string, string>>({});
  if (state.counts.length === 0)
    return (
      <Card>
        <p className="text-sm text-slate-600">No cycle counts yet. Start one from the Phantom inventory tab or from a SKU’s Inventory by Store view.</p>
      </Card>
    );
  return (
    <DataGrid
      rows={state.counts}
      rowKey={(c) => c.id}
      columns={[
        { key: "id", label: "Count", render: (c) => (<span><span className="font-semibold text-slate-900">{c.id}</span><span className="block text-xs text-slate-500">by {c.createdBy}</span></span>) },
        { key: "sku", label: "Product", render: (c) => base.skus[c.skuIdx].name },
        { key: "store", label: "Store", render: (c) => `${base.stores[c.storeIdx].id} ${base.stores[c.storeIdx].name}` },
        { key: "sys", label: "System qty", align: "right", render: (c) => nf(c.status === "Counting" ? state.onHand(c.storeIdx * NSKU + c.skuIdx) : c.systemQty) },
        {
          key: "cnt",
          label: "Counted",
          align: "right",
          render: (c) =>
            c.status === "Counting" ? (
              <input
                type="number"
                min={0}
                placeholder="Qty"
                value={inputs[c.id] ?? ""}
                onChange={(e) => setInputs((s) => ({ ...s, [c.id]: e.target.value }))}
                onClick={(e) => e.stopPropagation()}
                className="w-24 rounded-lg border border-slate-200 px-2 py-1 text-right"
              />
            ) : (
              nf(c.counted ?? 0)
            ),
        },
        { key: "var", label: "Variance", align: "right", render: (c) => (c.variance === null ? "–" : <span className={c.variance < 0 ? "font-semibold text-rose-600" : "font-semibold text-emerald-700"}>{c.variance > 0 ? "+" : ""}{nf(c.variance)}</span>) },
        {
          key: "act",
          label: "",
          align: "right",
          render: (c) =>
            c.status === "Counting" ? (
              <ActButton perm="count.run" disabled={inputs[c.id] === undefined || inputs[c.id] === ""} onClick={() => wf.completeCount(c.id, Math.max(0, Number(inputs[c.id])))}>
                Reconcile
              </ActButton>
            ) : (
              <Pill tone="good">Reconciled</Pill>
            ),
        },
      ]}
    />
  );
}
