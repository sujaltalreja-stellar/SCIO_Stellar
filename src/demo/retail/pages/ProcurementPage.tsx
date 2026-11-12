import React, { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useRetail } from "../RetailContext";
import { useWorkflows } from "../workflows";
import { discrepancies, type Discrepancy } from "../analytics";
import type { PurchaseOrder } from "../model";
import { ActButton, aed, DataGrid, Drawer, nf, PageTitle, pctf, Pill, Situation, Stat, Tabs, type Column } from "../rui";
import { Card } from "../../ui";

type Tab = "open" | "all" | "approval" | "discrepancies" | "create";

export default function ProcurementPage() {
  const { state, scope } = useRetail();
  const wf = useWorkflows();
  const { base } = state;
  const [tab, setTab] = useState<Tab>("open");
  const [openPo, setOpenPo] = useState<PurchaseOrder | null>(null);
  const today = base.anchorDate;

  const visible = useMemo(
    () => state.pos.filter((p) => !scope || (p.destType === "store" ? scope.has(p.destIdx) : base.stores.some((s) => scope.has(s.idx) && s.dcIdx === p.destIdx))),
    [state.pos, scope, base]
  );
  const open = visible.filter((p) => p.status === "Sent" || p.status === "Approved" || p.status === "Pending approval");
  const pending = visible.filter((p) => p.status === "Pending approval");
  const late = open.filter((p) => p.promised < today && p.status !== "Pending approval");
  const disc = useMemo(() => discrepancies(state).filter((d) => visible.some((p) => p.id === d.poId)), [state, visible]);
  const value = (p: PurchaseOrder) => p.lines.reduce((a, l) => a + l.ordered * l.unitCost, 0);
  const dest = (p: PurchaseOrder) => (p.destType === "dc" ? base.dcs[p.destIdx].name : `${base.stores[p.destIdx].id} ${base.stores[p.destIdx].name}`);

  const statusPill = (p: PurchaseOrder) => {
    if (p.status !== "Received" && p.status !== "Partially received" && p.status !== "Pending approval" && p.promised < today) return <Pill tone="bad">Overdue {Math.round((new Date(today).getTime() - new Date(p.promised).getTime()) / 86_400_000)} d</Pill>;
    const tone = p.status === "Received" ? "good" : p.status === "Partially received" ? "warn" : p.status === "Pending approval" ? "violet" : "accent";
    return <Pill tone={tone}>{p.status}</Pill>;
  };

  const cols: Column<PurchaseOrder>[] = [
    { key: "id", label: "PO", sort: (p) => p.id, render: (p) => (<span><span className="font-semibold text-slate-900">{p.id}</span><span className="block text-xs text-slate-500">{p.createdBy}</span></span>) },
    { key: "sup", label: "Supplier", sort: (p) => base.suppliers[p.supplierIdx].name, render: (p) => base.suppliers[p.supplierIdx].name },
    { key: "dest", label: "Deliver to", render: dest },
    { key: "created", label: "Created", sort: (p) => p.created, render: (p) => p.created },
    { key: "promised", label: "Promised", sort: (p) => p.promised, render: (p) => p.promised },
    { key: "lines", label: "Lines", align: "right", render: (p) => p.lines.length },
    { key: "fill", label: "Received", align: "right", render: (p) => { const o = p.lines.reduce((a, l) => a + l.ordered, 0); const r = p.lines.reduce((a, l) => a + l.received, 0); return o ? pctf(r / o, 0) : "–"; } },
    { key: "value", label: "Value", align: "right", sort: value, render: (p) => aed(value(p)) },
    { key: "status", label: "Status", render: statusPill },
  ];

  return (
    <div className="space-y-6">
      <PageTitle title="Procurement" sub="Purchase orders from creation to receipt, partial deliveries and invoice discrepancies" right={<ActButton perm="po.create" size="md" onClick={() => setTab("create")}><Plus className="h-4 w-4" /> New purchase order</ActButton>} />
      <Situation
        what={<>{late.length} open POs are overdue · {disc.length} receiving / invoice discrepancies</>}
        why={<>Supplier delays and short deliveries; some invoices billed above PO price or quantity</>}
        where={<>{new Set(late.map((p) => p.supplierIdx)).size} suppliers · {aed(disc.reduce((a, d) => a + d.impact, 0))} in disputed value</>}
        action={<>Approve pending POs, receive deliveries, dispute invoice differences, arrange alternatives for late POs</>}
      />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <Stat label="Open POs" value={nf(open.length)} sub={aed(open.reduce((a, p) => a + value(p), 0))} />
        <Stat label="Pending approval" value={nf(pending.length)} tone={pending.length ? "warn" : undefined} />
        <Stat label="Overdue" value={nf(late.length)} tone={late.length ? "bad" : "good"} />
        <Stat label="Discrepancies" value={nf(disc.length)} sub={aed(disc.reduce((a, d) => a + d.impact, 0))} tone={disc.length ? "warn" : undefined} />
        <Stat label="Spend · 70 days" value={aed(visible.reduce((a, p) => a + value(p), 0))} />
      </div>

      <Tabs<Tab>
        value={tab}
        onChange={setTab}
        tabs={[
          ["open", "Open", open.length],
          ["approval", "Pending approval", pending.length],
          ["discrepancies", "Discrepancies", disc.length],
          ["all", "All POs", visible.length],
          ["create", "Create PO"],
        ]}
      />

      {(tab === "open" || tab === "all" || tab === "approval") && (
        <DataGrid
          rows={tab === "open" ? open : tab === "approval" ? pending : visible}
          columns={cols}
          rowKey={(p) => p.id}
          search={(p) => `${p.id} ${base.suppliers[p.supplierIdx].name} ${dest(p)}`}
          placeholder="Search PO, supplier or destination…"
          onRowClick={(p) => setOpenPo(p)}
          initialSort={{ key: "promised", dir: "asc" }}
        />
      )}

      {tab === "discrepancies" && <DiscrepancyTable rows={disc} />}
      {tab === "create" && <CreatePo onDone={() => setTab("open")} />}

      {openPo && <PoDrawer po={state.pos.find((p) => p.id === openPo.id) ?? openPo} onClose={() => setOpenPo(null)} onApprove={(id) => wf.approvePo(id)} />}
    </div>
  );
}

function DiscrepancyTable({ rows }: { rows: Discrepancy[] }) {
  const { state, dispatch } = useRetail();
  const { base } = state;
  return (
    <DataGrid
      rows={rows}
      rowKey={(d) => d.id}
      search={(d) => `${d.poId} ${base.suppliers[d.supplierIdx].name} ${base.skus[d.skuIdx].name}`}
      placeholder="Search PO, supplier or product…"
      columns={[
        { key: "po", label: "PO", render: (d) => <span className="font-semibold text-slate-900">{d.poId}</span> },
        { key: "sup", label: "Supplier", render: (d) => base.suppliers[d.supplierIdx].name },
        { key: "sku", label: "Product", render: (d) => base.skus[d.skuIdx].name },
        { key: "kind", label: "Issue", render: (d) => <Pill tone={d.kind === "Short delivery" ? "warn" : "bad"}>{d.kind}</Pill> },
        { key: "detail", label: "Ordered / received / invoiced", align: "right", render: (d) => `${nf(d.ordered)} / ${nf(d.received)} / ${d.invoicedQty === null ? "–" : nf(d.invoicedQty)}` },
        { key: "price", label: "PO / invoice price", align: "right", render: (d) => `${d.unitCost.toFixed(2)} / ${d.invoicedCost?.toFixed(2) ?? "–"}` },
        { key: "imp", label: "Impact", align: "right", sort: (d) => d.impact, render: (d) => aed(d.impact) },
        {
          key: "act",
          label: "",
          align: "right",
          render: (d) =>
            state.alertStatus.get(d.id) ? (
              <Pill tone="good">{state.alertStatus.get(d.id)!.status === "resolved" ? "Debit note raised" : "Disputed"}</Pill>
            ) : (
              <ActButton perm="po.approve" onClick={() => dispatch({ type: "alert_status", alertId: d.id, status: "resolved", note: `Debit note for ${aed(d.impact, false)}` }, `Debit note raised to ${base.suppliers[d.supplierIdx].name}`)}>
                Raise debit note
              </ActButton>
            ),
        },
      ]}
    />
  );
}

function PoDrawer({ po, onClose, onApprove }: { po: PurchaseOrder; onClose: () => void; onApprove: (id: string) => void }) {
  const { state } = useRetail();
  const wf = useWorkflows();
  const { base } = state;
  const [qty, setQty] = useState<Record<number, number>>(() => Object.fromEntries(po.lines.map((l) => [l.skuIdx, Math.max(0, l.ordered - l.received)])));
  const receivable = po.status === "Sent" || po.status === "Approved" || po.status === "Partially received";
  return (
    <Drawer open onClose={onClose} title={`${po.id} · ${base.suppliers[po.supplierIdx].name}`} sub={`Deliver to ${po.destType === "dc" ? base.dcs[po.destIdx].name : base.stores[po.destIdx].name} · created ${po.created} · promised ${po.promised}`}>
      <div className="space-y-5">
        <div className="flex flex-wrap gap-2">
          {po.status === "Pending approval" && <ActButton perm="po.approve" size="md" onClick={() => onApprove(po.id)}>Approve & send to supplier</ActButton>}
          <Pill tone="accent">{po.status}</Pill>
        </div>
        <Card className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-[12px] text-slate-500">
                <th className="px-4 py-2.5 font-semibold">Product</th>
                <th className="px-2 py-2.5 text-right font-semibold">Ordered</th>
                <th className="px-2 py-2.5 text-right font-semibold">Received</th>
                <th className="px-2 py-2.5 text-right font-semibold">Unit cost</th>
                {receivable && <th className="px-4 py-2.5 text-right font-semibold">Receive now</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {po.lines.map((l) => (
                <tr key={l.skuIdx}>
                  <td className="px-4 py-2.5">
                    <div className="font-medium text-slate-900">{base.skus[l.skuIdx].name}</div>
                    <div className="text-xs text-slate-500">{base.skus[l.skuIdx].id} · {base.skus[l.skuIdx].baseUom}</div>
                  </td>
                  <td className="px-2 py-2.5 text-right">{nf(l.ordered)}</td>
                  <td className={`px-2 py-2.5 text-right ${l.received < l.ordered && po.received ? "font-semibold text-amber-600" : ""}`}>{nf(l.received)}</td>
                  <td className="px-2 py-2.5 text-right">{l.unitCost.toFixed(2)}</td>
                  {receivable && (
                    <td className="px-4 py-2.5 text-right">
                      <input type="number" min={0} max={l.ordered - l.received} value={qty[l.skuIdx] ?? 0} onChange={(e) => setQty((q) => ({ ...q, [l.skuIdx]: Math.max(0, Number(e.target.value)) }))} className="w-24 rounded-lg border border-slate-200 px-2 py-1 text-right" />
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        {receivable && (
          <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-4">
            <p className="text-sm text-slate-600">Enter what physically arrived. Quantities below the order are recorded as a short delivery and stay open.</p>
            <ActButton
              perm="po.receive"
              size="md"
              onClick={() => {
                wf.receivePo(po, qty);
                onClose();
              }}
            >
              Post goods receipt
            </ActButton>
          </div>
        )}
      </div>
    </Drawer>
  );
}

function CreatePo({ onDone }: { onDone: () => void }) {
  const { state, scope } = useRetail();
  const wf = useWorkflows();
  const { base } = state;
  const [supplier, setSupplier] = useState(0);
  const [destType, setDestType] = useState<"dc" | "store">("dc");
  const [destIdx, setDestIdx] = useState(0);
  const [q, setQ] = useState("");
  const [lines, setLines] = useState<Array<{ skuIdx: number; qty: number }>>([]);
  const supplierSkus = useMemo(() => base.skus.filter((s) => s.supplierIdx === supplier || s.altSupplierIdx === supplier), [base, supplier]);
  const matches = q.trim() ? supplierSkus.filter((s) => `${s.name} ${s.id} ${s.gtin}`.toLowerCase().includes(q.toLowerCase())).slice(0, 8) : [];
  const stores = base.stores.filter((s) => !scope || scope.has(s.idx));
  const total = lines.reduce((a, l) => a + l.qty * base.skus[l.skuIdx].cost, 0);

  return (
    <Card>
      <div className="grid gap-4 md:grid-cols-3">
        <label className="text-sm">
          <span className="text-xs font-semibold text-slate-500">Supplier</span>
          <select value={supplier} onChange={(e) => { setSupplier(Number(e.target.value)); setLines([]); }} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2">
            {base.suppliers.map((s) => (
              <option key={s.idx} value={s.idx}>
                {s.name} · lead {s.leadTimeDays} d
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="text-xs font-semibold text-slate-500">Deliver to</span>
          <select value={destType} onChange={(e) => { setDestType(e.target.value as "dc" | "store"); setDestIdx(e.target.value === "dc" ? 0 : stores[0]?.idx ?? 0); }} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2">
            <option value="dc">Distribution centre</option>
            <option value="store">Store (direct delivery)</option>
          </select>
        </label>
        <label className="text-sm">
          <span className="text-xs font-semibold text-slate-500">Location</span>
          <select value={destIdx} onChange={(e) => setDestIdx(Number(e.target.value))} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2">
            {destType === "dc"
              ? base.dcs.map((d) => (
                  <option key={d.idx} value={d.idx}>
                    {d.name}
                  </option>
                ))
              : stores.map((s) => (
                  <option key={s.idx} value={s.idx}>
                    {s.id} {s.name}
                  </option>
                ))}
          </select>
        </label>
      </div>
      <div className="relative mt-4">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Add product from ${base.suppliers[supplier].name} (${supplierSkus.length} SKUs) — search name, SKU or barcode`} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
        {matches.length > 0 && (
          <div className="absolute z-10 mt-1 w-full rounded-xl border border-slate-200 bg-white p-1 shadow-xl">
            {matches.map((s) => (
              <button key={s.idx} onClick={() => { setLines((l) => (l.some((x) => x.skuIdx === s.idx) ? l : [...l, { skuIdx: s.idx, qty: s.uoms.find((u) => u.uom === "case")?.factor ?? 10 }])); setQ(""); }} className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-50">
                <span>{s.icon} {s.name}</span>
                <span className="text-xs text-slate-500">{s.id} · AED {s.cost.toFixed(2)}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <table className="mt-4 w-full text-sm">
        <tbody className="divide-y divide-slate-100">
          {lines.map((l, i) => {
            const s = base.skus[l.skuIdx];
            return (
              <tr key={l.skuIdx}>
                <td className="py-2">{s.icon} {s.name}</td>
                <td className="py-2 text-xs text-slate-500">{s.uoms.slice(1, 3).map((u) => u.label).join(" · ")}</td>
                <td className="py-2 text-right">
                  <input type="number" min={1} value={l.qty} onChange={(e) => setLines((ls) => ls.map((x, j) => (j === i ? { ...x, qty: Math.max(1, Number(e.target.value)) } : x)))} className="w-24 rounded-lg border border-slate-200 px-2 py-1 text-right" /> <span className="text-xs text-slate-500">{s.baseUom}</span>
                </td>
                <td className="py-2 text-right tabular-nums">{aed(l.qty * s.cost, false)}</td>
                <td className="py-2 text-right">
                  <button onClick={() => setLines((ls) => ls.filter((_, j) => j !== i))} className="text-slate-400 hover:text-rose-600" aria-label="Remove line">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {lines.length === 0 && <p className="mt-4 text-sm text-slate-500">Search above to add products.</p>}
      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
        <span className="text-sm text-slate-600">
          {lines.length} line(s) · <b className="text-slate-900">{aed(total, false)}</b>
        </span>
        <ActButton
          perm="po.create"
          size="md"
          disabled={lines.length === 0}
          onClick={async () => {
            const id = await wf.createPo({ supplierIdx: supplier, destType, destIdx, lines, reason: "Manual purchase order" });
            if (id) onDone();
          }}
        >
          Submit purchase order
        </ActButton>
      </div>
    </Card>
  );
}
