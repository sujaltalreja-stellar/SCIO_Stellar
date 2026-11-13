import React, { useEffect, useMemo, useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowRight, Sparkles } from "lucide-react";
import { useRetail } from "../RetailContext";
import { equipmentIssues, supplierScorecards } from "../analytics";
import { dailySales, salesTotals } from "../metrics";
import { ChartTooltip, axisProps, C, cx } from "../../ui";
import { aed, nf } from "../rui";

// ---------------------------------------------------------------------------
// What an ERP can't show: cross-system cause chains, money leaking now,
// predictions, phantom stock, true supplier cost, and money SCIO protected.
// ---------------------------------------------------------------------------

const LEAK_COLORS = ["#ef4444", "#f59e0b", "#f2a93b", "#64748b", "#a78bfa"];

export function useIntel() {
  const { state: st, kpis: k, scope } = useRetail();
  return useMemo(() => {
    const { base } = st;
    const sn = (i: number) => `${base.stores[i].id}`;

    // Money leaking per day, by cause
    const leaks = [
      { name: "Empty shelves", value: k.lostSalesPerDay },
      { name: "Expiring stock", value: k.expiryRiskValue / Math.max(1, st.thresholds.expiryDays) },
      { name: "Shrinkage", value: k.perf.reduce((a, p) => a + p.shrinkValue, 0) / 30 },
      { name: "Overstock cost", value: (k.overstockValue * 0.25) / 365 },
      { name: "Phantom stock", value: k.ph.reduce((a, x) => a + x.expectedSalesLost, 0) / 30 },
    ].map((l) => ({ ...l, value: Math.round(l.value) }));
    const leakPerDay = leaks.reduce((a, l) => a + l.value, 0);

    // Why chain for the store losing the most
    const worst = [...k.perf].sort((a, b) => b.lostSales30 - a.lostSales30)[0];
    const chain: Array<{ sys: string; text: string; tone: string }> = [];
    if (worst) {
      const idx = worst.store.idx;
      chain.push({ sys: "POS", text: `${sn(idx)} ${worst.store.city} lost ${aed(worst.lostSales30)} in 30 days`, tone: "text-rose-600" });
      chain.push({ sys: "POS", text: `${nf(worst.outOfStock)} fast sellers empty on shelf`, tone: "text-slate-800" });
      const late = k.sd.filter((d) => d.affectedStores.includes(idx)).sort((a, b) => b.daysLate - a.daysLate)[0];
      if (late) chain.push({ sys: "P2P", text: `${base.suppliers[late.supplierIdx].name} delivery ${late.daysLate} days late`, tone: "text-slate-800" });
      const donors = k.so.filter((x) => x.storeIdx === idx && x.donor);
      if (donors.length) chain.push({ sys: "WMS", text: `${nf(donors.reduce((a, x) => a + (x.donor?.qty ?? 0), 0))} units available nearby — not transferred`, tone: "text-slate-800" });
      const fault = equipmentIssues(st, new Set([idx]))[0];
      if (fault) chain.push({ sys: "IoT", text: `${fault.equipment.type} fault · ${aed(fault.stockAtRiskValue)} stock at risk`, tone: "text-slate-800" });
    }

    // Predictions: next stockouts
    const next = k.so
      .filter((x) => !x.outOfStock && x.velocity > 0)
      .sort((a, b) => a.daysOfSupply - b.daysOfSupply)
      .slice(0, 3)
      .map((x) => ({ sku: base.skus[x.skuIdx].name, store: sn(x.storeIdx), hours: Math.max(1, Math.round(x.daysOfSupply * 14)), perDay: x.velocity * base.skus[x.skuIdx].price }));

    // Phantom stock
    const phValue = k.ph.reduce((a, x) => a + x.systemQty * base.skus[x.skuIdx].cost, 0);
    const phTop = [...k.ph].sort((a, b) => b.daysNoSale - a.daysNoSale)[0];

    // Supplier true cost: lost sales from their out-of-stock SKUs
    const lostBySup = new Map<number, number>();
    for (const x of k.so) if (x.outOfStock) {
      const s = base.skus[x.skuIdx].supplierIdx;
      lostBySup.set(s, (lostBySup.get(s) ?? 0) + x.lostSalesPerDay * 30);
    }
    const cards = supplierScorecards(st);
    const supTop = [...lostBySup].sort((a, b) => b[1] - a[1])[0];
    const supplier = supTop ? { name: base.suppliers[supTop[0]].name, lost: supTop[1], onTime: cards.find((c) => c.idx === supTop[0])?.onTimeRate ?? 1 } : null;

    // Money protected by approved actions this month
    let protectedValue = 0;
    let actions = 0;
    for (const e of st.events) {
      if (!e.at || Date.now() - new Date(e.at).getTime() > 30 * 864e5) continue;
      if (e.type === "transfer_create") {
        protectedValue += e.qty * base.skus[e.skuIdx].price;
        actions++;
      } else if (e.type === "po_create") {
        protectedValue += e.lines.reduce((a, l) => a + l.qty * base.skus[l.skuIdx].price, 0);
        actions++;
      } else if (["ticket_create", "markdown", "alert_status", "count_start", "price_fix"].includes(e.type)) actions++;
    }

    // Chart data
    const daily = dailySales(st, scope, 30).map((x) => ({ label: x.label, net: Math.round(x.net) }));
    const byCountry = [...new Set(k.perf.map((p) => p.store.country))].map((c) => ({
      name: base.countries.find((x) => x.code === c)?.name ?? c,
      value: Math.round(salesTotals(st, new Set(k.perf.filter((p) => p.store.country === c).map((p) => p.store.idx)), 30).net),
    }));
    const weakest = [...k.perf].sort((a, b) => a.vsTarget - b.vsTarget).slice(0, 8).map((p) => ({ name: p.store.id, value: Math.round(p.vsTarget * 100) }));

    return { leaks, leakPerDay, worst, chain, next, phCount: k.ph.length, phValue, phTop: phTop ? { sku: base.skus[phTop.skuIdx].name, store: sn(phTop.storeIdx), days: phTop.daysNoSale, qty: phTop.systemQty } : null, supplier, protectedValue, actions, daily, byCountry, weakest };
  }, [st, k, scope]);
}

type Intel = ReturnType<typeof useIntel>;

/** Ticking "money lost so far today" counter. */
export function LeakCounter({ intel, onAsk }: { intel: Intel; onAsk: (q: string) => void }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const d = new Date(new Date(now).toLocaleString("en-US", { timeZone: "Asia/Dubai" }));
  const frac = (d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds()) / 86400;
  const sofar = intel.leakPerDay * frac;
  return (
    <Card title="Money leaking today" ask={() => onAsk("Where is my business losing money today and how do I stop it?")}>
      <div className="text-[30px] font-semibold tabular-nums tracking-tight text-rose-600">AED {Math.round(sofar).toLocaleString("en-US")}</div>
      <div className="text-[12px] text-slate-500">≈ {aed(intel.leakPerDay)} / day</div>
      <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-slate-100">
        {intel.leaks.map((l, i) => (
          <div key={l.name} title={`${l.name}: ${aed(l.value)}/day`} style={{ width: `${(l.value / (intel.leakPerDay || 1)) * 100}%`, background: LEAK_COLORS[i] }} />
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11.5px] text-slate-500">
        {intel.leaks.map((l, i) => (
          <span key={l.name} className="inline-flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: LEAK_COLORS[i] }} />
            {l.name}
          </span>
        ))}
      </div>
    </Card>
  );
}

export function Protected({ intel, onAsk }: { intel: Intel; onAsk: (q: string) => void }) {
  return (
    <Card title="Protected by SCIO · 30 days" ask={() => onAsk("What has SCIO helped us fix this month?")}>
      <div className="text-[30px] font-semibold tabular-nums tracking-tight text-emerald-600">{aed(intel.protectedValue)}</div>
      <div className="text-[12px] text-slate-500">{intel.actions ? `${nf(intel.actions)} approved actions` : "Approve an action to start counting"}</div>
    </Card>
  );
}

export function WhyChain({ intel, onAsk }: { intel: Intel; onAsk: (q: string) => void }) {
  if (!intel.worst || intel.chain.length === 0) return null;
  const id = intel.worst.store.id;
  return (
    <Card title="Why — across your systems" ask={() => onAsk(`Why is ${id} losing sales? Explain simply.`)}>
      <ol className="relative mt-1 space-y-2.5 border-l border-slate-200 pl-4">
        {intel.chain.map((c, i) => (
          <li key={i} className="relative">
            <span className={cx("absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white", i === 0 ? "bg-rose-500" : "bg-slate-300")} />
            <div className="flex items-baseline justify-between gap-3">
              <span className={cx("text-[13.5px]", i === 0 ? "font-medium" : "", c.tone)}>{c.text}</span>
              <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[10.5px] font-medium text-slate-500">{c.sys}</span>
            </div>
          </li>
        ))}
      </ol>
      <button onClick={() => onAsk(`Fix the stockouts at ${id}`)} className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[#111113] px-3 py-1.5 text-[12.5px] font-medium text-[#fff] ring-1 ring-[#fff]/10 hover:bg-[#2a2a30]">
        <Sparkles className="h-3.5 w-3.5 text-[#f2a93b]" /> Fix with SCIO
      </button>
    </Card>
  );
}

export function Predictions({ intel, onAsk }: { intel: Intel; onAsk: (q: string) => void }) {
  return (
    <Card title="Running out next" ask={() => onAsk("Which products will run out in the next 24 hours?")}>
      <ul className="space-y-2">
        {intel.next.map((n) => (
          <li key={n.sku + n.store} className="flex items-center gap-2 text-[13px]">
            <span className="w-12 shrink-0 rounded bg-rose-50 px-1.5 py-0.5 text-center text-[11.5px] font-semibold tabular-nums text-rose-600">{n.hours}h</span>
            <span className="min-w-0 flex-1 truncate text-slate-800">{n.sku}</span>
            <span className="shrink-0 text-slate-500">{n.store}</span>
          </li>
        ))}
        {intel.next.length === 0 && <li className="text-[13px] text-slate-500">Nothing about to run out.</li>}
      </ul>
    </Card>
  );
}

export function Phantom({ intel, onAsk }: { intel: Intel; onAsk: (q: string) => void }) {
  return (
    <Card title="Stock that isn't really there" ask={() => onAsk("Explain my phantom inventory simply and what to do.")}>
      <div className="text-[22px] font-semibold tabular-nums text-slate-900">{nf(intel.phCount)} <span className="text-[13px] font-normal text-slate-500">items · {aed(intel.phValue)}</span></div>
      {intel.phTop && <div className="mt-1 text-[12.5px] text-slate-500">e.g. {intel.phTop.sku} at {intel.phTop.store}: {nf(intel.phTop.qty)} in system, 0 sold in {intel.phTop.days} days</div>}
    </Card>
  );
}

export function SupplierCost({ intel, onAsk }: { intel: Intel; onAsk: (q: string) => void }) {
  if (!intel.supplier) return null;
  return (
    <Card title="Supplier's true cost" ask={() => onAsk(`What is ${intel.supplier!.name} really costing me?`)}>
      <div className="truncate text-[14px] font-medium text-slate-900">{intel.supplier.name}</div>
      <div className="mt-0.5 text-[22px] font-semibold tabular-nums text-rose-600">{aed(intel.supplier.lost)} <span className="text-[13px] font-normal text-slate-500">lost sales / month</span></div>
      <div className="text-[12.5px] text-slate-500">On time {Math.round(intel.supplier.onTime * 100)}% — not on the invoice</div>
    </Card>
  );
}

/** Chart view of the same intelligence. */
export function IntelCharts({ intel }: { intel: Intel }) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card title="Where money is leaking · per day">
        <div className="flex items-center gap-4">
          <div className="h-[200px] w-[200px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={intel.leaks} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2} stroke="none">
                  {intel.leaks.map((_, i) => <Cell key={i} fill={LEAK_COLORS[i]} />)}
                </Pie>
                <Tooltip content={<ChartTooltip format={(v) => aed(v)} />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="min-w-0 flex-1 space-y-1.5 text-[13px]">
            {intel.leaks.map((l, i) => (
              <li key={l.name} className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ background: LEAK_COLORS[i] }} />
                <span className="flex-1 text-slate-600">{l.name}</span>
                <span className="tabular-nums text-slate-900">{aed(l.value)}</span>
              </li>
            ))}
          </ul>
        </div>
      </Card>

      <Card title="Daily sales · 30 days">
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={intel.daily} margin={{ top: 6, right: 6, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="intel-net" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f2a93b" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#f2a93b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={C.grid} vertical={false} />
              <XAxis dataKey="label" {...axisProps} minTickGap={28} />
              <YAxis {...axisProps} width={52} tickFormatter={(v) => aed(v).replace("AED ", "")} />
              <Tooltip content={<ChartTooltip format={(v) => aed(v, false)} />} />
              <Area type="monotone" dataKey="net" name="Net sales" stroke="#e8901a" strokeWidth={2} fill="url(#intel-net)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card title="Sales by country · 30 days">
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={intel.byCountry} layout="vertical" margin={{ top: 0, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={C.grid} horizontal={false} />
              <XAxis type="number" {...axisProps} tickFormatter={(v) => aed(v).replace("AED ", "")} />
              <YAxis type="category" dataKey="name" {...axisProps} width={120} />
              <Tooltip content={<ChartTooltip format={(v) => aed(v)} />} />
              <Bar dataKey="value" name="Net sales" fill="#111113" radius={[0, 4, 4, 0]} barSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card title="Weakest stores · % of target">
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={intel.weakest} margin={{ top: 6, right: 6, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={C.grid} vertical={false} />
              <XAxis dataKey="name" {...axisProps} />
              <YAxis {...axisProps} width={36} domain={[60, 110]} tickFormatter={(v) => `${v}%`} />
              <Tooltip content={<ChartTooltip format={(v) => `${v}%`} />} />
              <Bar dataKey="value" name="vs target" radius={[4, 4, 0, 0]} barSize={22}>
                {intel.weakest.map((w) => <Cell key={w.name} fill={w.value < 88 ? "#ef4444" : w.value < 97 ? "#f59e0b" : "#22c55e"} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

function Card({ title, ask, children }: { title: string; ask?: () => void; children: React.ReactNode }) {
  return (
    <section className="min-w-0 rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="text-[12.5px] font-medium text-slate-500">{title}</h3>
        {ask && (
          <button onClick={ask} title="Ask SCIO" className="inline-flex items-center gap-0.5 text-[12px] font-medium text-amber-700 hover:underline">
            Ask <ArrowRight className="h-3 w-3" />
          </button>
        )}
      </div>
      {children}
    </section>
  );
}
