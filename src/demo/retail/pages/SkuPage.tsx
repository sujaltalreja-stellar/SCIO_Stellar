import React, { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Sparkles } from "lucide-react";
import { useRetail } from "../RetailContext";
import { NSKU, SALES_DAYS, batchesFor, skuDailySales } from "../generate";
import { available, expiryRisks, movementHistory, overstock, phantomInventory, replenParams, stockoutRisks, supplierScorecards } from "../analytics";
import { useWorkflows } from "../workflows";
import type { Sku } from "../model";
import { axisProps, C, ChartTooltip, Card, cx } from "../../ui";
import { ActButton, aed, DataGrid, Drawer, localPrice, nf, PageTitle, pctf, Pill, Situation, Stat, Tabs, type Column } from "../rui";

interface SkuRow {
  sku: Sku;
  stores: number;
  onHand: number;
  value: number;
  velocity: number;
  dos: number;
  oosStores: number;
  margin: number;
}

export default function SkuPage() {
  const { state, scope } = useRetail();
  const [params, setParams] = useSearchParams();
  const { base } = state;
  const [dept, setDept] = useState("All");
  const [status, setStatus] = useState("All");

  const rows = useMemo<SkuRow[]>(() => {
    const out: SkuRow[] = [];
    for (const sku of base.skus) {
      let stores = 0;
      let oh = 0;
      let vel = 0;
      let oos = 0;
      for (const s of base.stores) {
        if (scope && !scope.has(s.idx)) continue;
        const p = s.idx * NSKU + sku.idx;
        if (!base.carried[p]) continue;
        stores++;
        const o = state.onHand(p);
        oh += o;
        vel += base.velocity[p];
        if (available(state, p) === 0 && base.velocity[p] >= 0.25) oos++;
      }
      out.push({ sku, stores, onHand: oh, value: oh * sku.cost, velocity: vel, dos: vel > 0 ? oh / vel : 999, oosStores: oos, margin: (sku.price - sku.cost) / sku.price });
    }
    return out;
  }, [state, scope, base]);

  const filtered = rows.filter((r) => (dept === "All" || r.sku.department === dept) && (status === "All" || r.sku.status === status) && r.stores > 0);
  const selected = params.get("sku");
  const storeParam = params.get("store");
  const open = selected ? base.skus.find((s) => s.id === selected) : undefined;

  const cols: Column<SkuRow>[] = [
    { key: "sku", label: "Product", sort: (r) => r.sku.name, render: (r) => (<div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-lg">{r.sku.icon}</span><div className="min-w-0"><div className="truncate font-semibold text-slate-900">{r.sku.name}</div><div className="text-xs text-slate-500">{r.sku.id} · GTIN {r.sku.gtin}</div></div></div>) },
    { key: "cat", label: "Category", sort: (r) => r.sku.category, render: (r) => (<div><div className="text-slate-800">{r.sku.category}</div><div className="text-xs text-slate-500">{r.sku.subcategory}</div></div>) },
    { key: "status", label: "Status", render: (r) => <Pill tone={r.sku.status === "Active" ? "good" : r.sku.status === "Discontinued" ? "neutral" : r.sku.status === "New" ? "accent" : "violet"}>{r.sku.status}</Pill> },
    { key: "price", label: "Price / Margin", align: "right", sort: (r) => r.margin, render: (r) => (<div><div>{aed(r.sku.price, false).replace("AED ", "AED ")}</div><div className="text-xs text-slate-500">{pctf(r.margin)} margin</div></div>) },
    { key: "oh", label: "On hand", align: "right", sort: (r) => r.onHand, render: (r) => `${nf(r.onHand)} ${r.sku.baseUom}` },
    { key: "vel", label: "Sales/day", align: "right", sort: (r) => r.velocity, render: (r) => nf(r.velocity, 1) },
    { key: "dos", label: "Days of supply", align: "right", sort: (r) => r.dos, render: (r) => <span className={r.dos < 5 ? "font-semibold text-rose-600" : r.dos > state.thresholds.overstockDays ? "font-semibold text-amber-600" : ""}>{r.dos > 900 ? "–" : nf(r.dos)}</span> },
    { key: "oos", label: "OOS stores", align: "right", sort: (r) => r.oosStores, render: (r) => (r.oosStores ? <Pill tone="bad">{r.oosStores} / {r.stores}</Pill> : <span className="text-slate-400">0 / {r.stores}</span>) },
    { key: "value", label: "Stock value", align: "right", sort: (r) => r.value, render: (r) => aed(r.value) },
  ];

  const oosSkus = filtered.filter((r) => r.oosStores > 0).length;
  return (
    <div className="space-y-6">
      <PageTitle title="SKU Intelligence" sub={`${nf(base.skus.length)} SKUs with barcodes, units of measure, pricing, store stock, batches, forecasts and AI recommendations`} />
      <Situation
        what={<>{nf(oosSkus)} SKUs are out of stock in at least one store</>}
        why={<>Sales velocity exceeds replenishment; some suppliers are late</>}
        where={<>Sort by “OOS stores” or open a SKU to see every store</>}
        action={<>Open a SKU → Inventory by Store → transfer or reorder</>}
      />
      <DataGrid
        rows={filtered}
        columns={cols}
        rowKey={(r) => r.sku.id}
        search={(r) => `${r.sku.id} ${r.sku.name} ${r.sku.gtin} ${r.sku.brand} ${r.sku.category} ${r.sku.subcategory}`}
        placeholder="Search by name, SKU, barcode (GTIN), brand or category…"
        onRowClick={(r) => setParams({ sku: r.sku.id })}
        initialSort={{ key: "oos", dir: "desc" }}
        toolbar={
          <>
            <select value={dept} onChange={(e) => setDept(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
              <option value="All">All departments</option>
              {Array.from(new Set(base.skus.map((s) => s.department))).map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
              {["All", "Active", "New", "Seasonal", "Discontinued"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </>
        }
      />
      {open && <SkuDrawer sku={open} initialStore={storeParam} onClose={() => setParams({})} />}
    </div>
  );
}

type Tab = "overview" | "stores" | "sales" | "suppliers" | "pos" | "transfers" | "batches" | "movements" | "ai";

function SkuDrawer({ sku, initialStore, onClose }: { sku: Sku; initialStore: string | null; onClose: () => void }) {
  const { state, scope } = useRetail();
  const wf = useWorkflows();
  const navigate = useNavigate();
  const { base } = state;
  const [tab, setTab] = useState<Tab>(initialStore ? "stores" : "overview");
  const visibleStores = base.stores.filter((s) => (!scope || scope.has(s.idx)) && base.carried[s.idx * NSKU + sku.idx]);
  const [storeId, setStoreId] = useState<string>(initialStore ?? visibleStores[0]?.id ?? "");
  const store = base.stores.find((s) => s.id === storeId) ?? visibleStores[0];
  const [convQty, setConvQty] = useState(1);
  const [convUom, setConvUom] = useState(sku.uoms[1]?.uom ?? sku.baseUom);

  const storeScope = useMemo(() => new Set(visibleStores.map((s) => s.idx)), [visibleStores]);
  const risks = useMemo(() => stockoutRisks(state, storeScope).filter((r) => r.skuIdx === sku.idx), [state, storeScope, sku.idx]);
  const over = useMemo(() => overstock(state, storeScope).filter((r) => r.skuIdx === sku.idx), [state, storeScope, sku.idx]);
  const exp = useMemo(() => (sku.perishable ? expiryRisks(state, storeScope).filter((r) => r.skuIdx === sku.idx) : []), [state, storeScope, sku]);
  const ph = useMemo(() => phantomInventory(state, storeScope).filter((r) => r.skuIdx === sku.idx), [state, storeScope, sku.idx]);

  const sales = useMemo(() => {
    const series = skuDailySales(base, sku.idx, tab === "sales" && store ? store.idx : undefined);
    const avg7 = series.slice(-7).reduce((a, b) => a + b, 0) / 7;
    const rows = series.map((v, i) => ({ label: new Date(new Date(base.anchorDate).getTime() - (SALES_DAYS - i) * 86_400_000).toLocaleDateString("en-GB", { timeZone: "Asia/Dubai", day: "numeric", month: "short" }), actual: v, forecast: null as number | null }));
    for (let d = 1; d <= 14; d++) {
      const date = new Date(new Date(base.anchorDate).getTime() + d * 86_400_000);
      const wd = date.getUTCDay();
      rows.push({ label: date.toLocaleDateString("en-GB", { timeZone: "Asia/Dubai", day: "numeric", month: "short" }), actual: null as unknown as number, forecast: Math.round(avg7 * (wd === 4 || wd === 5 ? 1.25 : wd === 6 ? 1.1 : 0.93) * 10) / 10 });
    }
    return { rows, total: series.reduce((a, b) => a + b, 0), avg7, forecast14: rows.slice(-14).reduce((a, r) => a + (r.forecast ?? 0), 0) };
  }, [base, sku.idx, store, tab]);

  const sc = useMemo(() => supplierScorecards(state), [state]);
  const supplierRows = [sku.supplierIdx, sku.altSupplierIdx].filter((v, i, a) => a.indexOf(v) === i).map((i) => ({ s: base.suppliers[i], score: sc[i], primary: i === sku.supplierIdx }));
  const poRows = state.pos.filter((p) => p.lines.some((l) => l.skuIdx === sku.idx)).slice(0, 30);
  const trRows = state.transfers.filter((t) => t.skuIdx === sku.idx);

  const margin = (sku.price - sku.cost) / sku.price;
  const conv = sku.uoms.find((u) => u.uom === convUom)?.factor ?? 1;

  return (
    <Drawer open onClose={onClose} title={<span className="flex items-center gap-3"><span className="text-2xl">{sku.icon}</span>{sku.name}</span>} sub={`${sku.id} · GTIN ${sku.gtin} · ${sku.department} › ${sku.category} › ${sku.subcategory}`} width="max-w-5xl">
      <div className="space-y-5">
        <Tabs<Tab>
          value={tab}
          onChange={setTab}
          tabs={[
            ["overview", "Overview"],
            ["stores", "Inventory by Store", risks.length || undefined],
            ["sales", "Sales History"],
            ["suppliers", "Suppliers"],
            ["pos", "Purchase Orders", poRows.length],
            ["transfers", "Transfers", trRows.length],
            ["batches", "Batches / Expiry", sku.perishable ? exp.length : undefined],
            ["movements", "Movements"],
            ["ai", "AI Recommendations"],
          ]}
        />

        {(tab === "sales" || tab === "batches" || tab === "movements") && (
          <select value={store?.id} onChange={(e) => setStoreId(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
            {visibleStores.map((s) => (
              <option key={s.id} value={s.id}>
                {s.id} {s.name}
              </option>
            ))}
          </select>
        )}

        {tab === "overview" && (
          <div className="space-y-5">
            <div className="grid gap-5 lg:grid-cols-3">
              <div className="flex aspect-square items-center justify-center rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-blue-50 text-7xl">{sku.icon}</div>
              <Card className="lg:col-span-2">
                <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                  {(
                    [
                      ["Brand", sku.brand],
                      ["Variant", sku.variant],
                      ["Size", sku.size],
                      ["Colour", sku.colour ?? "–"],
                      ["Status", sku.status],
                      ["Base unit", sku.baseUom],
                      ["Perishable", sku.perishable ? `Yes · ${sku.shelfLifeDays} days shelf life` : "No"],
                      ["Serial numbers", sku.serialized ? "Tracked" : "Not tracked"],
                      ["Primary supplier", base.suppliers[sku.supplierIdx].name],
                      ["Ranged in", `${visibleStores.length} stores`],
                    ] as Array<[string, string]>
                  ).map(([k, v]) => (
                    <div key={k}>
                      <dt className="text-xs text-slate-500">{k}</dt>
                      <dd className="font-medium text-slate-900">{v}</dd>
                    </div>
                  ))}
                </dl>
              </Card>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <Stat label="Purchase price" value={aed(sku.cost, false).replace(/AED (\d+)$/, "AED $1")} sub={`AED ${sku.cost.toFixed(2)} / ${sku.baseUom}`} />
              <Stat label="Selling price (ex VAT)" value={`AED ${sku.price.toFixed(2)}`} />
              <Stat label="Margin" value={pctf(margin)} tone={margin < 0.2 ? "warn" : "good"} />
              <Stat label="Units on hand" value={nf(visibleStores.reduce((a, s) => a + state.onHand(s.idx * NSKU + sku.idx), 0))} sub={sku.baseUom} />
            </div>
            <div className="grid gap-5 lg:grid-cols-2">
              <Card>
                <h4 className="mb-3 text-sm font-semibold text-slate-900">Shelf price by country (incl. VAT)</h4>
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-slate-100">
                    {base.countries.map((c) => (
                      <tr key={c.code}>
                        <td className="py-1.5 text-slate-700">{c.name}</td>
                        <td className="py-1.5 text-xs text-slate-500">VAT {Math.round(c.vat * 100)}%</td>
                        <td className="py-1.5 text-right font-semibold tabular-nums">
                          {c.currency} {((sku.price * (1 + c.vat)) / c.toAed).toFixed(c.toAed > 5 ? 3 : 2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
              <Card>
                <h4 className="mb-3 text-sm font-semibold text-slate-900">Units of measure</h4>
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-slate-100">
                    {sku.uoms.map((u) => (
                      <tr key={u.uom}>
                        <td className="py-1.5 text-slate-700">{u.label}</td>
                        <td className="py-1.5 text-right tabular-nums text-slate-900">
                          = {nf(u.factor, 3)} {sku.baseUom}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl bg-slate-50 p-3 text-sm">
                  <span className="text-slate-600">Convert</span>
                  <input type="number" min={0} value={convQty} onChange={(e) => setConvQty(Math.max(0, Number(e.target.value)))} className="w-20 rounded-lg border border-slate-200 px-2 py-1" />
                  <select value={convUom} onChange={(e) => setConvUom(e.target.value as typeof convUom)} className="rounded-lg border border-slate-200 bg-white px-2 py-1">
                    {sku.uoms.map((u) => (
                      <option key={u.uom} value={u.uom}>
                        {u.uom}
                      </option>
                    ))}
                  </select>
                  <span className="font-semibold text-slate-900">
                    = {nf(convQty * conv, 3)} {sku.baseUom} · cost {aed(convQty * conv * sku.cost, false)}
                  </span>
                </div>
              </Card>
            </div>
          </div>
        )}

        {tab === "stores" && (
          <DataGrid
            rows={visibleStores}
            rowKey={(s) => s.id}
            pageSize={15}
            search={(s) => `${s.id} ${s.name} ${s.city}`}
            placeholder="Search store…"
            initialSort={{ key: "dos", dir: "asc" }}
            columns={[
              { key: "store", label: "Store", sort: (s) => s.id, render: (s) => (<div><div className="font-semibold text-slate-900">{s.id} {s.name}</div><div className="text-xs text-slate-500">{s.city}</div></div>) },
              { key: "oh", label: "On hand", align: "right", sort: (s) => state.onHand(s.idx * NSKU + sku.idx), render: (s) => nf(state.onHand(s.idx * NSKU + sku.idx)) },
              { key: "av", label: "Available", align: "right", render: (s) => nf(available(state, s.idx * NSKU + sku.idx)) },
              { key: "rs", label: "Reserved / Damaged", align: "right", render: (s) => `${base.reserved[s.idx * NSKU + sku.idx]} / ${base.damaged[s.idx * NSKU + sku.idx]}` },
              { key: "in", label: "In transit + incoming", align: "right", render: (s) => nf(state.inbound(s.idx * NSKU + sku.idx)) },
              { key: "par", label: "Min / ROP / Max", align: "right", render: (s) => { const r = replenParams(state, s.idx, sku.idx); return `${r.min} / ${r.rop} / ${r.max}`; } },
              { key: "dos", label: "Days of supply", align: "right", sort: (s) => available(state, s.idx * NSKU + sku.idx) / Math.max(0.02, base.velocity[s.idx * NSKU + sku.idx]), render: (s) => { const p = s.idx * NSKU + sku.idx; const d = available(state, p) / Math.max(0.02, base.velocity[p]); return <span className={d <= state.thresholds.stockoutDays ? "font-semibold text-rose-600" : d > state.thresholds.overstockDays ? "font-semibold text-amber-600" : ""}>{d > 900 ? "–" : nf(d, 1)}</span>; } },
              {
                key: "act",
                label: "",
                align: "right",
                render: (s) => {
                  const r = risks.find((x) => x.storeIdx === s.idx);
                  const pending = state.transfers.find((t) => t.toStore === s.idx && t.skuIdx === sku.idx && (t.status === "Requested" || t.status === "Approved · in transit"));
                  if (pending) return <Pill tone="accent">{pending.status}</Pill>;
                  if (r?.donor) return <ActButton perm="transfer.create" onClick={() => wf.transferForStockout(r)}>Transfer {nf(r.donor.qty)}</ActButton>;
                  return <ActButton perm="count.run" variant="secondary" onClick={() => wf.startCount({ storeIdx: s.idx, skuIdx: sku.idx, id: `manual-${s.idx}-${sku.idx}` })}>Count</ActButton>;
                },
              },
            ]}
          />
        )}

        {tab === "sales" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <Stat label={`Units sold · ${SALES_DAYS} days`} value={nf(sales.total)} />
              <Stat label="Sales velocity (7-day avg)" value={`${nf(sales.avg7, 1)}/day`} />
              <Stat label="Forecast · next 14 days" value={nf(sales.forecast14)} />
              <Stat label="Days of supply" value={nf(available(state, store.idx * NSKU + sku.idx) / Math.max(0.05, base.velocity[store.idx * NSKU + sku.idx]), 1)} sub={store.id} />
            </div>
            <Card>
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sales.rows} margin={{ left: -10, right: 8 }}>
                    <defs>
                      <linearGradient id="skuSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={C.indigo} stopOpacity={0.3} />
                        <stop offset="100%" stopColor={C.indigo} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke={C.grid} />
                    <XAxis dataKey="label" {...axisProps} minTickGap={30} />
                    <YAxis {...axisProps} width={40} />
                    <Tooltip content={<ChartTooltip />} />
                    <Area dataKey="actual" name="Units sold" stroke={C.indigo} strokeWidth={2} fill="url(#skuSales)" connectNulls={false} />
                    <Area dataKey="forecast" name="Forecast" stroke={C.violet} strokeDasharray="5 4" strokeWidth={2} fill="none" connectNulls={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <p className="mt-2 text-xs text-slate-500">Daily units at {store.id}. Flat zero periods mean the item was not selling (out of stock or not on shelf).</p>
            </Card>
          </div>
        )}

        {tab === "suppliers" && (
          <div className="grid gap-4 md:grid-cols-2">
            {supplierRows.map(({ s, score, primary }) => (
              <Card key={s.id}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-900">{s.name}</div>
                    <div className="text-xs text-slate-500">
                      {s.country} · {s.contact}
                    </div>
                  </div>
                  <Pill tone={primary ? "accent" : "neutral"}>{primary ? "Primary" : "Alternative"}</Pill>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <Stat label="Lead time" value={`${s.leadTimeDays} d`} />
                  <Stat label="On-time" value={pctf(score.onTimeRate, 0)} tone={score.onTimeRate < 0.75 ? "bad" : "good"} />
                  <Stat label="Fill rate" value={pctf(score.fillRate, 0)} tone={score.fillRate < 0.9 ? "warn" : "good"} />
                  <Stat label="Unit cost" value={`AED ${sku.cost.toFixed(2)}`} />
                </div>
              </Card>
            ))}
          </div>
        )}

        {tab === "pos" && (
          <DataGrid
            rows={poRows}
            rowKey={(p) => p.id}
            pageSize={12}
            columns={[
              { key: "id", label: "PO", render: (p) => <span className="font-semibold text-slate-900">{p.id}</span> },
              { key: "sup", label: "Supplier", render: (p) => base.suppliers[p.supplierIdx].name },
              { key: "dest", label: "Destination", render: (p) => (p.destType === "dc" ? base.dcs[p.destIdx].name : base.stores[p.destIdx].id) },
              { key: "dates", label: "Created / Promised", render: (p) => `${p.created} / ${p.promised}` },
              { key: "qty", label: "Ordered / Received", align: "right", render: (p) => { const l = p.lines.find((x) => x.skuIdx === sku.idx)!; return `${nf(l.ordered)} / ${nf(l.received)}`; } },
              { key: "status", label: "Status", render: (p) => <Pill tone={p.status === "Received" ? "good" : p.status === "Partially received" ? "warn" : p.promised < base.anchorDate && !p.received ? "bad" : "accent"}>{p.promised < base.anchorDate && !p.received && p.status !== "Pending approval" ? "Overdue" : p.status}</Pill> },
            ]}
            empty="No purchase orders for this SKU."
          />
        )}

        {tab === "transfers" && (
          <DataGrid
            rows={trRows}
            rowKey={(t) => t.id}
            columns={[
              { key: "id", label: "Transfer", render: (t) => <span className="font-semibold text-slate-900">{t.id}</span> },
              { key: "route", label: "Route", render: (t) => `${t.from.type === "store" ? base.stores[t.from.idx].id : base.dcs[t.from.idx].name} → ${base.stores[t.toStore].id}` },
              { key: "qty", label: "Qty", align: "right", render: (t) => nf(t.qty) },
              { key: "reason", label: "Reason", render: (t) => t.reason },
              { key: "status", label: "Status", render: (t) => <Pill tone={t.status === "Received" ? "good" : t.status === "Cancelled" ? "neutral" : "accent"}>{t.status}</Pill> },
              { key: "act", label: "", align: "right", render: (t) => (t.status === "Requested" ? <ActButton perm="transfer.approve" onClick={() => wf.approveTransfer(t.id)}>Approve</ActButton> : t.status === "Approved · in transit" ? <ActButton perm="transfer.receive" onClick={() => wf.receiveTransfer(t.id)}>Receive</ActButton> : null) },
            ]}
            empty="No transfers yet. Use Inventory by Store to move stock between stores."
          />
        )}

        {tab === "batches" &&
          (sku.perishable ? (
            <BatchTable sku={sku} storeIdx={store.idx} />
          ) : (
            <Card>
              <p className="text-sm text-slate-600">This SKU is not date-controlled. {sku.serialized ? "Serial numbers are captured at sale for warranty." : "No batch or serial tracking required."}</p>
            </Card>
          ))}

        {tab === "movements" && (
          <DataGrid
            rows={movementHistory(state, store.idx, sku.idx)}
            rowKey={(m) => `${m.date}-${m.type}-${m.ref}`}
            pageSize={15}
            columns={[
              { key: "date", label: "Date", render: (m) => m.date },
              { key: "type", label: "Movement", render: (m) => <Pill tone={m.qty > 0 ? "good" : m.type === "Sale" ? "neutral" : "warn"}>{m.type}</Pill> },
              { key: "qty", label: "Qty", align: "right", render: (m) => <span className={m.qty > 0 ? "text-emerald-700" : "text-slate-700"}>{m.qty > 0 ? "+" : ""}{nf(m.qty, 1)}</span> },
              { key: "ref", label: "Reference", render: (m) => m.ref },
            ]}
          />
        )}

        {tab === "ai" && (
          <div className="space-y-3">
            {risks.filter((r) => r.donor).slice(0, 4).map((r) => (
              <Rec key={r.id} tone="bad" title={`Transfer ${nf(r.donor!.qty)} to ${base.stores[r.storeIdx].id} ${base.stores[r.storeIdx].name}`} why={`${nf(r.daysOfSupply, 1)} days of supply left at ${nf(r.velocity, 1)}/day; ${r.donor!.type === "store" ? base.stores[r.donor!.idx].id : base.dcs[r.donor!.idx].name} has ${nf(r.donor!.available)} available. Avoids ${aed(r.lostSalesPerDay * 7)} lost sales this week.`} action={<ActButton perm="transfer.create" onClick={() => wf.transferForStockout(r)}>Create transfer</ActButton>} />
            ))}
            {exp.filter((x) => !x.markedDown).slice(0, 3).map((x) => (
              <Rec key={x.id} tone="warn" title={`${x.recommendation === "transfer" ? "Transfer" : `Mark down ${state.thresholds.markdownPct}%`}: lot ${x.lot} at ${base.stores[x.storeIdx].id}`} why={`${nf(x.qty)} units expire in ${x.daysLeft} days but only ${nf(x.expectedToSell)} are forecast to sell. ${aed(x.atRiskValue)} at risk.`} action={x.recommendation === "transfer" ? <ActButton perm="transfer.create" onClick={() => wf.transferExpiry(x)}>Transfer</ActButton> : <ActButton perm="markdown.apply" onClick={() => wf.markdownExpiry(x)}>Apply markdown</ActButton>} />
            ))}
            {ph.slice(0, 3).map((x) => (
              <Rec key={x.id} tone="violet" title={`Cycle count at ${base.stores[x.storeIdx].id}`} why={`System shows ${nf(x.systemQty)} units but nothing sold for ${x.daysNoSale} days (normally ${nf(x.velocity, 1)}/day). Possible phantom inventory.`} action={<ActButton perm="count.run" onClick={() => wf.startCount(x)}>Start count</ActButton>} />
            ))}
            {over.slice(0, 3).map((x) => (
              <Rec key={x.id} tone="accent" title={`Reduce stock at ${base.stores[x.storeIdx].id}`} why={`${nf(x.daysOfSupply)} days of supply; ${nf(x.excessUnits)} excess units (${aed(x.excessValue)}). Pause replenishment and use as a transfer source.`} action={<Pill tone="accent">Auto-orders paused</Pill>} />
            ))}
            {risks.length + exp.length + ph.length + over.length === 0 && <Card><p className="text-sm text-slate-600">No issues detected for this SKU in your stores.</p></Card>}
            <button onClick={() => navigate("/app/retail/ask", { state: { question: `Give me a full analysis of ${sku.name} (${sku.id}) across my stores and what to do.` } })} className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100">
              <Sparkles className="h-4 w-4" /> Ask SCIO about this SKU
            </button>
          </div>
        )}
      </div>
    </Drawer>
  );
}

function Rec({ tone, title, why, action }: { tone: "bad" | "warn" | "accent" | "violet"; title: string; why: string; action: React.ReactNode }) {
  const border = { bad: "border-l-rose-400", warn: "border-l-amber-400", accent: "border-l-blue-400", violet: "border-l-violet-400" }[tone];
  return (
    <div className={cx("flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 border-l-4 bg-white p-4", border)}>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-slate-900">{title}</div>
        <div className="mt-0.5 text-[13px] text-slate-600">{why}</div>
      </div>
      {action}
    </div>
  );
}

function BatchTable({ sku, storeIdx }: { sku: Sku; storeIdx: number }) {
  const { state } = useRetail();
  const wf = useWorkflows();
  const { base } = state;
  const p = storeIdx * NSKU + sku.idx;
  const batches = batchesFor(base, storeIdx, sku.idx, state.onHand(p));
  const md = state.markdowns.get(p);
  const risk = expiryRisks(state, new Set([storeIdx])).find((x) => x.skuIdx === sku.idx);
  return (
    <Card>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-left text-[12px] text-slate-500">
            <th className="pb-2 font-semibold">Lot</th>
            <th className="pb-2 font-semibold">Manufactured</th>
            <th className="pb-2 font-semibold">Expiry</th>
            <th className="pb-2 text-right font-semibold">Days left</th>
            <th className="pb-2 text-right font-semibold">Qty</th>
            <th className="pb-2 text-right font-semibold">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {batches.map((b, i) => (
            <tr key={b.lot}>
              <td className="py-2 font-mono text-xs text-slate-800">{b.lot}</td>
              <td className="py-2">{b.mfg}</td>
              <td className="py-2">{b.expiry}</td>
              <td className={cx("py-2 text-right font-semibold", b.daysLeft <= 3 ? "text-rose-600" : b.daysLeft <= state.thresholds.expiryDays ? "text-amber-600" : "text-slate-700")}>{b.daysLeft}</td>
              <td className="py-2 text-right">{nf(b.qty)}</td>
              <td className="py-2 text-right">
                {i === 0 && md ? <Pill tone="good">{md.pct ? `${md.pct}% markdown` : "Transferred"}</Pill> : i === 0 && risk && risk.atRiskUnits > 0 ? <ActButton perm="markdown.apply" onClick={() => wf.markdownExpiry(risk)}>Mark down</ActButton> : <Pill tone="neutral">OK</Pill>}
              </td>
            </tr>
          ))}
          {batches.length === 0 && (
            <tr>
              <td colSpan={6} className="py-6 text-center text-slate-500">
                No stock on hand at this store.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <p className="mt-3 text-xs text-slate-500">FEFO: oldest expiry is sold first. Price shown at {base.stores[storeIdx].id}: {localPrice(base, storeIdx, sku.price)} ex VAT.</p>
    </Card>
  );
}
