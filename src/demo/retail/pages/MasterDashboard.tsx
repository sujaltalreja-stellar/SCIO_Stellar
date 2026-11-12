import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Area, AreaChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { LayoutDashboard, ShoppingCart, Boxes, Truck, ShieldAlert, ChevronRight, CalendarDays, ShoppingBasket, Globe2, ArrowLeft } from "lucide-react";
import { useRetail } from "../RetailContext";
import { equipmentIssues, supplierScorecards } from "../analytics";
import { dailySales, salesPrev, salesTotals, stockSummary, upcomingEvents } from "../metrics";
import { Card, CardTitle, ChartTooltip, axisProps, C, cx, AnimatedValue, CATEGORY_COLORS } from "../../ui";
import { aed, nf, pctf, Pill } from "../rui";

// ---------------------------------------------------------------------------
// Master dashboard: every retail domain on one screen. Each tile opens the
// matching metric dashboard (/demo/retail/insights/:metric).
// ---------------------------------------------------------------------------

const P = "/app/retail";

interface Tile {
  label: string;
  value: string;
  sub?: string;
  tone?: "good" | "bad" | "warn";
  to: string;
}

export default function MasterDashboard() {
  const { state: st, kpis: k, problems, scope, scopeLabel } = useRetail();
  const navigate = useNavigate();
  const [days, setDays] = useState(30);

  const d = useMemo(() => {
    const t = salesTotals(st, scope, days);
    const prev = salesPrev(st, scope, days);
    const ss = stockSummary(st, scope);
    const daily = dailySales(st, scope, days);
    const cards = supplierScorecards(st);
    const done = st.pos.filter((p) => p.received);
    const otif = done.length ? done.filter((p) => p.received! <= p.promised && p.lines.every((l) => l.received >= l.ordered)).length / done.length : 1;
    const ordered = done.reduce((a, p) => a + p.lines.reduce((x, l) => x + l.ordered, 0), 0);
    const received = done.reduce((a, p) => a + p.lines.reduce((x, l) => x + l.received, 0), 0);
    const openPos = st.pos.filter((p) => !p.received && p.status !== "Cancelled");
    const itr = ss.value ? (t.cogs * (365 / days)) / ss.value : 0;
    const faults = equipmentIssues(st, scope);
    const pricing = st.base.pricingExceptions.filter((x) => (!scope || scope.has(x.storeIdx)) && !st.fixedPrices.has(x.id)).length;
    const openTasks = st.tasks.filter((x) => (!scope || scope.has(x.storeIdx)) && x.status !== "Done").length;
    // country scorecard
    const countries = [...new Set(k.perf.map((p) => p.store.country))].map((code) => {
      const idx = new Set(k.perf.filter((p) => p.store.country === code).map((p) => p.store.idx));
      const s = salesTotals(st, idx, days);
      const perf = k.perf.filter((p) => idx.has(p.store.idx));
      return {
        code,
        name: st.base.countries.find((c) => c.code === code)!.name,
        stores: idx.size,
        net: s.net,
        lfl: s.lfl,
        gmPct: s.gmPct,
        osa: perf.reduce((a, p) => a + p.availability, 0) / perf.length,
        vsTarget: perf.reduce((a, p) => a + p.sales30, 0) / perf.reduce((a, p) => a + p.target, 0),
        oos: k.so.filter((x) => x.outOfStock && idx.has(x.storeIdx)).length,
        overstock: k.ov.filter((x) => idx.has(x.storeIdx)).reduce((a, x) => a + x.excessValue, 0),
        expiry: k.ex.filter((x) => idx.has(x.storeIdx) && !x.markedDown).reduce((a, x) => a + x.atRiskValue, 0),
      };
    });
    return { t, prev, ss, daily, cards, otif, fill: ordered ? received / ordered : 1, openPos, itr, faults, pricing, openTasks, countries };
  }, [st, scope, k, days]);

  const delta = (now: number, prev: number, pp = false) => {
    if (!prev) return undefined;
    const v = pp ? (now - prev) * 100 : (now / prev - 1) * 100;
    return `${v >= 0 ? "▲" : "▼"} ${Math.abs(v).toFixed(1)}${pp ? " pp" : "%"} vs prior ${days}d`;
  };

  const sections: Array<{ title: string; icon: React.ElementType; color: string; tiles: Tile[] }> = [
    {
      title: "Sales & margin",
      icon: ShoppingCart,
      color: "from-[#2563eb] to-[#06b6d4]",
      tiles: [
        { label: `Net sales · ${days}d`, value: aed(d.t.net), sub: delta(d.t.net, d.prev.net), to: "sales" },
        { label: "Gross margin", value: pctf(d.t.gmPct), sub: delta(d.t.gmPct, d.prev.gmPct, true), tone: d.t.gmPct >= d.prev.gmPct ? "good" : "bad", to: "sales" },
        { label: "LFL growth", value: pctf(d.t.lfl), tone: d.t.lfl >= 0 ? "good" : "bad", to: "stores" },
        { label: "ATV", value: aed(d.t.atv, false), sub: `UPT ${d.t.upt.toFixed(2)}`, to: "sales" },
        { label: "Conversion", value: pctf(d.t.conversion), sub: `${nf(d.t.footfall)} visitors`, to: "stores" },
        { label: "Sales vs target", value: pctf(k.salesVsTarget, 0), tone: k.salesVsTarget >= 1 ? "good" : "warn", to: "performance" },
      ],
    },
    {
      title: "Inventory",
      icon: Boxes,
      color: "from-[#0d9488] to-[#22c55e]",
      tiles: [
        { label: "Inventory value", value: aed(d.ss.value), sub: `${nf(d.ss.sohUnits)} units SOH`, to: "inventory" },
        { label: "Inventory turnover", value: `${d.itr.toFixed(1)}×`, sub: `${d.itr ? nf(365 / d.itr) : "—"} days on hand`, to: "inventory" },
        { label: "On-shelf availability", value: pctf(k.availability), tone: k.availability > 0.97 ? "good" : "warn", to: "stockouts" },
        { label: "Stockout risks", value: nf(k.stockoutRisks), sub: `${nf(k.outOfStock)} OOS now`, tone: "bad", to: "stockouts" },
        { label: "Overstock", value: aed(k.overstockValue), sub: `${nf(k.overstockCount)} store-SKUs`, tone: "warn", to: "overstock" },
        { label: "Dead stock", value: aed(d.ss.deadValue), sub: "no sale 90+ days", tone: "bad", to: "inventory" },
      ],
    },
    {
      title: "Supply chain",
      icon: Truck,
      color: "from-[#7c3aed] to-[#6366f1]",
      tiles: [
        { label: "OTIF", value: pctf(d.otif), tone: d.otif > 0.85 ? "good" : "warn", to: "suppliers" },
        { label: "Fill rate", value: pctf(d.fill), to: "suppliers" },
        { label: "Overdue POs", value: nf(k.supplierDelays), tone: k.supplierDelays ? "bad" : "good", to: "suppliers" },
        { label: "Open POs", value: nf(d.openPos.length), sub: aed(d.openPos.reduce((a, p) => a + p.lines.reduce((x, l) => x + (l.ordered - l.received) * l.unitCost, 0), 0)) + " on order", to: "suppliers" },
        { label: "ASNs in transit", value: nf(d.openPos.filter((p) => p.asn).length), to: "suppliers" },
        { label: "Suppliers at risk", value: nf(d.cards.filter((c) => c.riskScore >= 40).length), sub: "risk score ≥ 40", tone: "warn", to: "suppliers" },
      ],
    },
    {
      title: "Risk & loss",
      icon: ShieldAlert,
      color: "from-[#e11d48] to-[#f97316]",
      tiles: [
        { label: "Expiry at risk", value: aed(k.expiryRiskValue), sub: `${nf(k.expiryCount)} batches`, tone: "bad", to: "expiry" },
        { label: "Shrinkage", value: aed(k.inventoryLoss), sub: pctf(d.t.net ? k.inventoryLoss / d.t.net : 0, 2) + " of net sales", tone: "bad", to: "losses" },
        { label: "Phantom inventory", value: nf(k.phantomCount), sub: "store-SKUs to count", tone: "warn", to: "losses" },
        { label: "Equipment faults", value: nf(d.faults.length), sub: aed(d.faults.reduce((a, f) => a + f.stockAtRiskValue, 0)) + " stock at risk", tone: d.faults.length ? "bad" : "good", to: "losses" },
        { label: "Pricing exceptions", value: nf(d.pricing), sub: "shelf ≠ system price", tone: d.pricing ? "warn" : "good", to: "performance" },
        { label: "Open store tasks", value: nf(d.openTasks), to: "performance" },
      ],
    },
  ];

  const events = upcomingEvents(st, scope, 60);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
        <Link to={P} className="inline-flex items-center gap-1 hover:text-slate-800"><ArrowLeft className="h-4 w-4" /> Command Center</Link>
      </div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#0f172a] to-[#1e40af] text-[#fff] shadow-lg"><LayoutDashboard className="h-6 w-6" /></span>
          <div>
            <h1 className="text-[28px] font-bold tracking-tight text-slate-900">Master dashboard</h1>
            <p className="mt-1 text-[14px] text-slate-600">Sales, inventory, supply chain and risk in one view · click any figure to open its dashboard.</p>
            <p className="mt-1 text-xs text-slate-400">{scopeLabel} · as of {st.base.anchorDate}</p>
          </div>
        </div>
        <div className="flex rounded-xl border border-slate-200 bg-white p-1 text-xs font-semibold">
          {[7, 30, 90].map((n) => (
            <button key={n} onClick={() => setDays(n)} className={cx("rounded-lg px-3 py-1.5 transition", days === n ? "bg-[#2563eb] text-[#fff]" : "text-slate-600 hover:bg-slate-50")}>{n}D</button>
          ))}
        </div>
      </div>

      {sections.map((sec, si) => (
        <section key={sec.title} className="scio-rise" style={{ animationDelay: `${si * 60}ms` }}>
          <div className="mb-2.5 flex items-center gap-2">
            <span className={cx("grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br text-[#fff]", sec.color)}><sec.icon className="h-4 w-4" /></span>
            <h2 className="text-[15px] font-bold text-slate-900">{sec.title}</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
            {sec.tiles.map((t) => (
              <button key={t.label} onClick={() => navigate(`${P}/insights/${t.to}`)} className="scio-lift group rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm">
                <div className="flex items-center justify-between text-[12.5px] font-medium text-slate-500">
                  {t.label}
                  <ChevronRight className="h-3.5 w-3.5 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-blue-600" />
                </div>
                <div className={cx("mt-1.5 text-[22px] font-bold tabular-nums", t.tone === "bad" ? "text-rose-600" : t.tone === "good" ? "text-emerald-600" : t.tone === "warn" ? "text-amber-600" : "text-slate-900")}>
                  <AnimatedValue value={t.value} />
                </div>
                {t.sub && <div className="mt-0.5 truncate text-[11.5px] text-slate-500">{t.sub}</div>}
              </button>
            ))}
          </div>
        </section>
      ))}

      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <Card delay={60}>
          <CardTitle hint={`Net sales share · ${days} days`}>Sales mix by country</CardTitle>
          <Donut
            data={d.countries.map((c) => ({ name: c.name, value: Math.round(c.net) }))}
            center={aed(d.t.net)}
            centerLabel={`${days}-day net sales`}
            format={(v) => aed(v)}
            onPick={(name) => {
              const c = d.countries.find((x) => x.name === name);
              if (c) navigate(`${P}/stores?country=${c.code}`);
            }}
          />
        </Card>
        <Card delay={120}>
          <CardTitle hint="Stock on hand at landed cost">Inventory by department</CardTitle>
          <Donut
            data={[...d.ss.byDept].map(([name, e]) => ({ name, value: Math.round(e.value) })).sort((a, b) => b.value - a.value)}
            center={aed(d.ss.value)}
            centerLabel="inventory value"
            format={(v) => aed(v)}
            onPick={() => navigate(`${P}/insights/inventory`)}
            offset={3}
          />
        </Card>
        <Card delay={180} className="lg:col-span-2 xl:col-span-1">
          <CardTitle hint={`Daily store traffic and baskets · ${days} days`}>Footfall vs transactions</CardTitle>
          <div className="h-[230px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={d.daily.map((x) => ({ label: x.label, footfall: x.footfall, txns: x.txns, conv: x.footfall ? Math.round((x.txns / x.footfall) * 1000) / 10 : 0 }))} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="ff-line" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                  <linearGradient id="tx-line" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#22c55e" />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={C.grid} vertical={false} />
                <XAxis dataKey="label" {...axisProps} minTickGap={24} />
                <YAxis {...axisProps} width={48} tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}K` : String(v))} />
                <Tooltip content={<ChartTooltip format={(v, key) => (key === "conv" ? `${v}%` : nf(v))} />} />
                <Line type="monotone" dataKey="footfall" name="Footfall" stroke="url(#ff-line)" strokeWidth={2.75} dot={false} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="txns" name="Transactions" stroke="url(#tx-line)" strokeWidth={2.75} dot={false} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex items-center justify-between text-[12px] text-slate-500">
            <span className="inline-flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5"><span className="h-2 w-4 rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#ec4899]" /> Footfall</span>
              <span className="inline-flex items-center gap-1.5"><span className="h-2 w-4 rounded-full bg-gradient-to-r from-[#06b6d4] to-[#22c55e]" /> Transactions</span>
            </span>
            <span>Conversion <b className="text-slate-900">{pctf(d.t.conversion)}</b></span>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2" delay={120}>
          <CardTitle hint={`Daily net sales vs last year · gross margin % (right axis) · ${days} days`}>Sales & margin trend</CardTitle>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={d.daily.map((x) => ({ label: x.label, net: Math.round(x.net), ly: Math.round(x.ly), gm: Math.round(x.gmPct * 1000) / 10 }))} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="master-net" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={C.indigo} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={C.indigo} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={C.grid} vertical={false} />
                <XAxis dataKey="label" {...axisProps} minTickGap={20} />
                <YAxis yAxisId="s" {...axisProps} width={60} tickFormatter={(v) => aed(v).replace("AED ", "")} />
                <YAxis yAxisId="g" orientation="right" {...axisProps} width={40} domain={["auto", "auto"]} tickFormatter={(v) => `${v}%`} />
                <Tooltip content={<ChartTooltip format={(v, key) => (key === "gm" ? `${v}%` : aed(v, false))} />} />
                <Area yAxisId="s" type="monotone" dataKey="net" name="Net sales" stroke={C.indigo} strokeWidth={2.25} fill="url(#master-net)" />
                <Line yAxisId="s" type="monotone" dataKey="ly" name="Last year" stroke={C.slate} strokeDasharray="5 5" dot={false} />
                <Line yAxisId="g" type="monotone" dataKey="gm" name="GM %" stroke={C.emerald} strokeWidth={1.75} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card delay={180}>
          <CardTitle hint="Next 60 days · expected demand change">
            <span className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4 text-violet-600" /> Trading calendar</span>
          </CardTitle>
          {events.length === 0 ? (
            <p className="text-sm text-slate-500">No major events in the next 60 days.</p>
          ) : (
            <ul className="space-y-3">
              {events.map((e) => (
                <li key={e.id} className="rounded-xl border border-slate-100 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[13.5px] font-semibold text-slate-900">{e.name}</span>
                    <Pill tone={e.kind === "Promotion" ? "accent" : e.kind === "Religious" ? "violet" : "neutral"}>{e.kind}</Pill>
                  </div>
                  <div className="mt-0.5 text-[11.5px] text-slate-500">{e.start} → {e.end} · {e.countries.length === 6 ? "All markets" : e.countries.join(", ")}</div>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {Object.entries(e.uplift).map(([dept, u]) => <span key={dept} className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10.5px] font-semibold text-emerald-700">{dept} +{Math.round(u * 100)}%</span>)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card delay={200}>
        <CardTitle hint={`${days}-day sales · click a country to open its stores`}>
          <span className="inline-flex items-center gap-2"><Globe2 className="h-4 w-4 text-blue-600" /> Country scorecard</span>
        </CardTitle>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-[12px] text-slate-500">
                {["Country", "Stores", "Net sales", "LFL", "GM %", "vs Target", "OSA", "OOS now", "Overstock", "Expiry risk"].map((h, i) => <th key={h} className={cx("pb-2 font-semibold", i > 0 && "text-right")}>{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {d.countries.sort((a, b) => b.net - a.net).map((c) => (
                <tr key={c.code} onClick={() => navigate(`${P}/stores?country=${c.code}`)} className="cursor-pointer hover:bg-blue-50/40">
                  <td className="py-2.5 font-semibold text-slate-900">{c.name}</td>
                  <td className="py-2.5 text-right tabular-nums">{c.stores}</td>
                  <td className="py-2.5 text-right tabular-nums">{aed(c.net)}</td>
                  <td className={cx("py-2.5 text-right tabular-nums font-semibold", c.lfl < 0 ? "text-rose-600" : "text-emerald-600")}>{pctf(c.lfl)}</td>
                  <td className="py-2.5 text-right tabular-nums">{pctf(c.gmPct)}</td>
                  <td className={cx("py-2.5 text-right tabular-nums", c.vsTarget < 0.97 && "text-rose-600")}>{pctf(c.vsTarget, 0)}</td>
                  <td className="py-2.5 text-right tabular-nums">{pctf(c.osa)}</td>
                  <td className="py-2.5 text-right tabular-nums">{nf(c.oos)}</td>
                  <td className="py-2.5 text-right tabular-nums">{aed(c.overstock)}</td>
                  <td className="py-2.5 text-right tabular-nums">{aed(c.expiry)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card delay={240}>
          <CardTitle hint="Ranked by severity and impact">Open problems</CardTitle>
          <ul className="divide-y divide-slate-100">
            {problems.map((p) => (
              <li key={p.id}>
                <Link to={p.link} className="group flex items-center gap-3 py-2.5">
                  <Pill tone={p.severity === "critical" ? "bad" : p.severity === "high" ? "warn" : "accent"}>{p.severity}</Pill>
                  <span className="min-w-0 flex-1 truncate text-[13.5px] font-medium text-slate-800">{p.title}</span>
                  <span className="text-[13px] font-semibold tabular-nums text-slate-900">{aed(p.impact)}</span>
                  <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-blue-600" />
                </Link>
              </li>
            ))}
          </ul>
        </Card>
        <Card delay={280}>
          <CardTitle hint="From today's POS baskets · lift > 1 means bought together more than by chance">
            <span className="inline-flex items-center gap-2"><ShoppingBasket className="h-4 w-4 text-amber-600" /> Basket affinity</span>
          </CardTitle>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-[12px] text-slate-500">
                <th className="pb-2 font-semibold">If customer buys</th>
                <th className="pb-2 font-semibold">they also buy</th>
                <th className="pb-2 text-right font-semibold">Confidence</th>
                <th className="pb-2 text-right font-semibold">Lift</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {st.base.basket.filter((_, i) => i % 2 === 0).slice(0, 7).map((b) => (
                <tr key={b.a + b.b}>
                  <td className="py-2 text-slate-800">{b.a}</td>
                  <td className="py-2 text-slate-800">{b.b}</td>
                  <td className="py-2 text-right tabular-nums">{pctf(b.confidence, 0)}</td>
                  <td className="py-2 text-right font-semibold tabular-nums text-emerald-600">{b.lift.toFixed(2)}×</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}

/** Donut chart with a centred total and a clickable legend. */
function Donut({ data, center, centerLabel, format, onPick, offset = 0 }: { data: Array<{ name: string; value: number }>; center: string; centerLabel: string; format: (v: number) => string; onPick?: (name: string) => void; offset?: number }) {
  const total = data.reduce((a, x) => a + x.value, 0) || 1;
  const color = (i: number) => CATEGORY_COLORS[(i + offset) % CATEGORY_COLORS.length];
  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <div className="relative h-[190px] w-[190px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={62} outerRadius={90} paddingAngle={2} cornerRadius={4} stroke="none" animationDuration={1100} onClick={(e) => onPick?.(String((e as { name?: string }).name ?? ""))}>
              {data.map((_, i) => (
                <Cell key={i} fill={color(i)} className="cursor-pointer outline-none transition-opacity hover:opacity-80" />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip format={(v) => format(v)} />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
          <div>
            <div className="text-[17px] font-bold tabular-nums text-slate-900">{center}</div>
            <div className="text-[10.5px] uppercase tracking-wider text-slate-400">{centerLabel}</div>
          </div>
        </div>
      </div>
      <ul className="w-full min-w-0 space-y-1.5">
        {data.slice(0, 7).map((x, i) => (
          <li key={x.name}>
            <button onClick={() => onPick?.(x.name)} className="flex w-full items-center gap-2 rounded-lg px-1.5 py-1 text-left text-[12.5px] transition hover:bg-slate-50">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: color(i) }} />
              <span className="min-w-0 flex-1 truncate text-slate-700">{x.name}</span>
              <span className="font-semibold tabular-nums text-slate-900">{Math.round((x.value / total) * 100)}%</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
