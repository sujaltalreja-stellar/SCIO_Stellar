import React, { useMemo, useState } from "react";
import StoresOverview from "./StoresOverview";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, MapPin, User, Ruler, Calendar, Wrench, Tag, ClipboardCheck, Megaphone, PackageX, ShieldAlert } from "lucide-react";
import { useRetail } from "../RetailContext";
import { storeDiagnosis, type StorePerf } from "../analytics";
import { useWorkflows } from "../workflows";
import { Card, CardTitle, cx } from "../../ui";
import { ActButton, aed, DataGrid, localPrice, MiniBar, nf, PageTitle, pctf, Pill, Situation, Stat, type Column } from "../rui";
import { NSKU } from "../generate";

export default function StoresPage() {
  const { id } = useParams();
  return id ? <StoreDetail id={id} /> : <StoresOverview />;
}

function StoreList() {
  const { state, kpis } = useRetail();
  const navigate = useNavigate();
  const { base } = state;
  const [country, setCountry] = useState("All");
  const [format, setFormat] = useState("All");
  const rows = kpis.perf.filter((p) => (country === "All" || p.store.country === country) && (format === "All" || p.store.format === format));

  const regions = useMemo(() => {
    const m = new Map<string, StorePerf[]>();
    for (const p of kpis.perf) m.set(`${p.store.country}|${p.store.region}`, [...(m.get(`${p.store.country}|${p.store.region}`) ?? []), p]);
    return Array.from(m, ([key, ps]) => {
      const [c, region] = key.split("|");
      const sales = ps.reduce((a, p) => a + p.sales30, 0);
      const target = ps.reduce((a, p) => a + p.target, 0);
      return { key, country: c, region, stores: ps.length, sales, vsTarget: sales / target, availability: ps.reduce((a, p) => a + p.availability, 0) / ps.length, lost: ps.reduce((a, p) => a + p.lostSales30, 0) };
    }).sort((a, b) => a.vsTarget - b.vsTarget);
  }, [kpis.perf]);

  const behind = kpis.perf.filter((p) => p.vsTarget < 0.95);
  const cols: Column<StorePerf>[] = [
    { key: "store", label: "Store", sort: (r) => r.store.id, render: (r) => (<div><div className="font-semibold text-slate-900">{r.store.id} {r.store.name}</div><div className="text-xs text-slate-500">{r.store.format} · {r.store.city}, {r.store.country}</div></div>) },
    { key: "sales", label: "Sales · 30d", align: "right", sort: (r) => r.sales30, render: (r) => aed(r.sales30) },
    { key: "target", label: "vs Target", sort: (r) => r.vsTarget, render: (r) => (<div className="flex items-center gap-2"><MiniBar value={Math.min(1, r.vsTarget)} tone={r.vsTarget < 0.95 ? "bad" : r.vsTarget < 1 ? "warn" : "good"} /><span className="tabular-nums">{pctf(r.vsTarget, 0)}</span></div>) },
    { key: "avail", label: "Availability", align: "right", sort: (r) => r.availability, render: (r) => <span className={r.availability < 0.95 ? "font-semibold text-rose-600" : ""}>{pctf(r.availability)}</span> },
    { key: "oos", label: "OOS SKUs", align: "right", sort: (r) => r.outOfStock, render: (r) => nf(r.outOfStock) },
    { key: "lost", label: "Lost sales · 30d", align: "right", sort: (r) => r.lostSales30, render: (r) => aed(r.lostSales30) },
    { key: "audit", label: "Audit score", align: "right", sort: (r) => r.auditScore, render: (r) => <span className={r.auditScore < 75 ? "text-amber-600" : ""}>{r.auditScore.toFixed(0)}</span> },
    { key: "faults", label: "Faults", align: "center", sort: (r) => r.equipmentFaults, render: (r) => (r.equipmentFaults ? <Pill tone="bad">{r.equipmentFaults}</Pill> : <span className="text-slate-400">–</span>) },
    { key: "tasks", label: "Open tasks", align: "right", sort: (r) => r.openTasks, render: (r) => r.openTasks },
  ];

  return (
    <div className="space-y-6">
      <PageTitle title="Stores" sub="Store profiles, regional comparison, availability and operational follow-up" />
      <Situation
        what={<>{behind.length} stores below 95% of sales target</>}
        why={<>Mostly driven by out-of-stocks on fast movers and equipment faults</>}
        where={<>{behind.slice(0, 3).map((b) => b.store.id).join(", ") || "-"}{behind.length > 3 ? "…" : ""}</>}
        action={<>Open the store, fix top stockouts by transfer, raise equipment tickets</>}
      />

      <Card>
        <CardTitle hint="Sorted by sales vs target (worst first)">Regional comparison</CardTitle>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-[12px] text-slate-500">
                <th className="pb-2 font-semibold">Region</th>
                <th className="pb-2 text-right font-semibold">Stores</th>
                <th className="pb-2 text-right font-semibold">Sales · 30d</th>
                <th className="pb-2 pl-6 font-semibold">vs Target</th>
                <th className="pb-2 text-right font-semibold">Availability</th>
                <th className="pb-2 text-right font-semibold">Lost sales</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {regions.map((r) => (
                <tr key={r.key}>
                  <td className="py-2.5 font-semibold text-slate-900">
                    {r.region} <span className="font-normal text-slate-500">· {base.countries.find((c) => c.code === r.country)?.name}</span>
                  </td>
                  <td className="py-2.5 text-right">{r.stores}</td>
                  <td className="py-2.5 text-right tabular-nums">{aed(r.sales)}</td>
                  <td className="py-2.5 pl-6">
                    <div className="flex items-center gap-2">
                      <MiniBar value={Math.min(1, r.vsTarget)} tone={r.vsTarget < 0.97 ? "bad" : "good"} />
                      {pctf(r.vsTarget, 0)}
                    </div>
                  </td>
                  <td className="py-2.5 text-right tabular-nums">{pctf(r.availability)}</td>
                  <td className="py-2.5 text-right tabular-nums">{aed(r.lost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <DataGrid
        rows={rows}
        columns={cols}
        rowKey={(r) => r.store.id}
        search={(r) => `${r.store.id} ${r.store.name} ${r.store.city} ${r.store.region}`}
        placeholder="Search store, city or region…"
        onRowClick={(r) => navigate(`/app/retail/stores/${r.store.id}`)}
        initialSort={{ key: "target", dir: "asc" }}
        toolbar={
          <>
            <select value={country} onChange={(e) => setCountry(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
              <option value="All">All countries</option>
              {base.countries.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
            <select value={format} onChange={(e) => setFormat(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
              {["All", "Hypermarket", "Supermarket", "Express"].map((f) => (
                <option key={f}>{f}</option>
              ))}
            </select>
          </>
        }
      />
    </div>
  );
}

function StoreDetail({ id }: { id: string }) {
  const { state, dispatch, scope } = useRetail();
  const wf = useWorkflows();
  const { base } = state;
  const store = base.stores.find((s) => s.id === id);
  const d = useMemo(() => (store ? storeDiagnosis(state, store.idx) : null), [state, store]);
  if (!store || !d || (scope && !scope.has(store.idx))) {
    return (
      <div className="py-20 text-center text-slate-500">
        Store not found or outside your access. <Link to="/app/retail/stores" className="text-blue-700">Back to stores</Link>
      </div>
    );
  }
  const country = base.countries.find((c) => c.code === store.country)!;
  const p = d.perf;
  const tasks = state.tasks.filter((t) => t.storeIdx === store.idx);
  const promos = base.promotions.filter((x) => x.countries.includes(store.country));
  const reasons: string[] = [];
  if (p.availability < d.peerAvg.availability - 0.01) reasons.push(`availability ${pctf(p.availability)} vs ${pctf(d.peerAvg.availability)} for ${store.region} peers (${nf(p.outOfStock)} SKUs out of stock)`);
  if (d.faults.length) reasons.push(`${d.faults.length} equipment fault(s), including ${d.faults[0].equipment.type.toLowerCase()} ${d.faults[0].equipment.id}`);
  if (d.pricingExceptions.length) reasons.push(`${d.pricingExceptions.length} shelf prices that don't match the system`);
  if (p.auditScore < d.peerAvg.auditScore - 3) reasons.push(`audit score ${p.auditScore.toFixed(0)} vs ${d.peerAvg.auditScore.toFixed(0)} peer average`);
  if (d.supplierDelays.length) reasons.push(`${d.supplierDelays.length} late supplier delivery(ies) affecting its stock`);

  return (
    <div className="space-y-6">
      <Link to="/app/retail/stores" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" /> All stores
      </Link>
      <PageTitle
        title={`${store.id} ${store.name}`}
        sub={`${store.format} · ${store.city}, ${country.name} · local currency ${country.currency} · VAT ${Math.round(country.vat * 100)}%`}
        right={<Pill tone={p.vsTarget < 0.95 ? "bad" : p.vsTarget < 1 ? "warn" : "good"}>{pctf(p.vsTarget, 0)} of sales target</Pill>}
      />

      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
        <span className="inline-flex items-center gap-1.5"><User className="h-4 w-4" /> Manager: {store.manager}</span>
        <span className="inline-flex items-center gap-1.5"><Ruler className="h-4 w-4" /> {nf(store.sizeSqm)} m²</span>
        <span className="inline-flex items-center gap-1.5"><Calendar className="h-4 w-4" /> Opened {store.opened}</span>
        <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" /> Served by {base.dcs[store.dcIdx].name}</span>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Stat label="Sales · 30 days" value={aed(p.sales30)} sub={`target ${aed(p.target)}`} />
        <Stat label="Availability" value={pctf(p.availability)} sub={`peers ${pctf(d.peerAvg.availability)}`} tone={p.availability < d.peerAvg.availability - 0.01 ? "bad" : "good"} />
        <Stat label="Lost sales · 30 days" value={aed(p.lostSales30)} sub={`peers avg ${aed(d.peerAvg.lostSales30)}`} tone={p.lostSales30 > d.peerAvg.lostSales30 * 1.3 ? "bad" : undefined} />
        <Stat label="Inventory" value={aed(p.inventoryValue)} sub={`${nf(p.carried)} SKUs ranged`} />
        <Stat label="Shrink (damaged)" value={aed(p.shrinkValue)} />
        <Stat label="Audit score" value={p.auditScore.toFixed(0)} sub={`peers ${d.peerAvg.auditScore.toFixed(0)}`} tone={p.auditScore < d.peerAvg.auditScore - 3 ? "warn" : undefined} />
      </div>

      {reasons.length > 0 && (
        <Card className="border-rose-200 bg-gradient-to-br from-rose-50/70 to-white">
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-0.5 h-5 w-5 text-rose-500" />
            <div>
              <h3 className="text-[16px] font-semibold text-slate-900">Why is {store.id} {p.vsTarget < 1 ? "losing sales" : "at risk"}?</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                {reasons.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
              {d.oosByCategory.length > 0 && (
                <p className="mt-2 text-sm text-slate-700">
                  Biggest gaps: {d.oosByCategory.slice(0, 3).map((c) => `${c.category} (${c.count} SKUs, ${aed(c.lost * 30)}/month)`).join(" · ")}.
                </p>
              )}
            </div>
          </div>
        </Card>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardTitle hint="Fast movers with no shelf stock · transfer from nearby stores or the DC" icon={<PackageX className="h-5 w-5" />}>
            Top stockouts
          </CardTitle>
          <ul className="divide-y divide-slate-100">
            {d.topOos.map((r) => {
              const sku = base.skus[r.skuIdx];
              const pending = state.transfers.find((t) => t.toStore === r.storeIdx && t.skuIdx === r.skuIdx && t.status !== "Cancelled");
              return (
                <li key={r.id} className="flex items-center gap-3 py-2.5">
                  <span className="text-xl">{sku.icon}</span>
                  <div className="min-w-0 flex-1">
                    <Link to={`/app/retail/skus?sku=${sku.id}&store=${store.id}`} className="block truncate text-sm font-medium text-slate-900 hover:text-blue-700">
                      {sku.name}
                    </Link>
                    <div className="text-xs text-slate-500">
                      {nf(r.velocity, 1)}/day · {aed(r.lostSalesPerDay)}/day lost · {r.donor ? `${r.donor.type === "store" ? base.stores[r.donor.idx].id : base.dcs[r.donor.idx].name} has ${nf(r.donor.available)}` : "no source nearby"}
                    </div>
                  </div>
                  {pending ? <Pill tone="good">{pending.status}</Pill> : r.donor ? <ActButton perm="transfer.create" onClick={() => wf.transferForStockout(r)}>Transfer</ActButton> : <Pill>Reorder</Pill>}
                </li>
              );
            })}
            {d.topOos.length === 0 && <li className="py-4 text-sm text-slate-500">No stockouts. 👍</li>}
          </ul>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardTitle icon={<Wrench className="h-5 w-5" />}>Equipment faults</CardTitle>
            {d.faults.length === 0 ? (
              <p className="text-sm text-slate-500">All equipment operating normally.</p>
            ) : (
              <ul className="space-y-2">
                {d.faults.map((f) => (
                  <li key={f.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 p-3">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">
                        {f.equipment.type} {f.equipment.id}
                      </div>
                      <div className="text-xs text-slate-500">
                        {f.equipment.fault!.kind} · now {f.latest}
                        {f.equipment.unit}
                      </div>
                    </div>
                    {f.ticketId ? <Pill tone="accent">{f.ticketId} · {f.ticketStatus}</Pill> : <ActButton perm="ticket.create" onClick={() => wf.createTicket(f)}>Create ticket</ActButton>}
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <CardTitle hint="Found during shelf audits" icon={<Tag className="h-5 w-5" />}>
              Pricing exceptions
            </CardTitle>
            <ul className="divide-y divide-slate-100">
              {d.pricingExceptions.slice(0, 8).map((x) => (
                <li key={x.id} className="flex items-center gap-3 py-2 text-sm">
                  <span className="min-w-0 flex-1 truncate text-slate-800">{base.skus[x.skuIdx].name}</span>
                  <span className="text-xs text-slate-500">
                    shelf <b className={x.shelfPrice > x.systemPrice ? "text-rose-600" : "text-amber-600"}>{localPrice(base, store.idx, x.shelfPrice)}</b> vs {localPrice(base, store.idx, x.systemPrice)}
                  </span>
                  <ActButton perm="price.fix" variant="secondary" onClick={() => dispatch({ type: "price_fix", exceptionId: x.id }, "Shelf label reprinted")}>
                    Fix label
                  </ActButton>
                </li>
              ))}
              {d.pricingExceptions.length === 0 && <li className="py-3 text-sm text-slate-500">All shelf prices match.</li>}
            </ul>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardTitle icon={<ClipboardCheck className="h-5 w-5" />} hint="Checklists, replenishment and follow-ups">
            Store tasks
          </CardTitle>
          <ul className="divide-y divide-slate-100">
            {tasks.map((t) => (
              <li key={t.id} className="flex flex-wrap items-center gap-3 py-2.5 text-sm">
                <span className={cx("min-w-0 flex-1 font-medium", t.status === "Done" ? "text-slate-400 line-through" : "text-slate-900")}>{t.title}</span>
                <Pill tone="neutral">{t.type}</Pill>
                <span className="text-xs text-slate-500">{t.assignee} · due {t.due}</span>
                <select
                  value={t.status}
                  onChange={(e) => dispatch({ type: "task_status", taskId: t.id, status: e.target.value as typeof t.status }, `Task updated: ${t.title}`)}
                  className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs"
                >
                  {["Open", "In progress", "Done"].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </li>
            ))}
          </ul>
          <div className="mt-4">
            <div className="mb-2 text-[13px] font-semibold text-slate-800">Lowest recent audits</div>
            <div className="grid gap-2 sm:grid-cols-2">
              {d.lowAudits.map((a) => (
                <div key={a.id} className="rounded-xl border border-slate-100 p-3 text-sm">
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-900">{a.type} audit</span>
                    <span className={a.score < 75 ? "font-bold text-rose-600" : "font-bold text-slate-700"}>{a.score}</span>
                  </div>
                  <div className="text-xs text-slate-500">{a.date} · {a.auditor}</div>
                  {a.findings.length > 0 && <div className="mt-1 text-xs text-slate-700">{a.findings.join(" · ")}</div>}
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <CardTitle icon={<Megaphone className="h-5 w-5" />} hint={`Running in ${country.name}`}>
            Active promotions
          </CardTitle>
          <ul className="space-y-2.5">
            {promos.map((pr) => {
              const oos = pr.skuIdxs.filter((k) => base.carried[store.idx * NSKU + k] && wf.available(store.idx * NSKU + k) === 0).length;
              return (
                <li key={pr.id} className="rounded-xl border border-slate-100 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-900">{pr.name}</span>
                    <Pill tone="violet">-{pr.discountPct}%</Pill>
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    {pr.skuIdxs.length} SKUs · until {pr.end} · uplift +{pr.upliftPct}%
                  </div>
                  {oos > 0 && <div className="mt-1 text-xs font-medium text-rose-600">{oos} promoted SKU(s) out of stock here</div>}
                </li>
              );
            })}
          </ul>
        </Card>
      </div>
    </div>
  );
}
