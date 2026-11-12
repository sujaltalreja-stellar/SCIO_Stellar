import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Area, Bar, CartesianGrid, ComposedChart, Pie, PieChart, Cell, ReferenceDot, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  Boxes,
  PackageX,
  Truck,
  Sparkles,
  ChevronRight,
  ClipboardList,
  Settings2,
  ChartColumnIncreasing,
  Calendar,
  ChevronDown,
  Activity,
  Clock,
  MapPin,
  Gauge,
  Timer,
  ShieldCheck,
  Radio,
  Siren,
} from "lucide-react";
import { useDataset } from "../useDataset";
import { useDemoAuth } from "../auth";
import {
  dailyOperations,
  inventoryValue,
  monthlyOnTime,
  monthlySpend,
  overallOnTimeRate,
  overdueMaintenance,
  stockShortages,
  todaysIssues,
  type Issue,
} from "../data/analytics";
import { fleetHealth } from "../data/assetHealth";
import { attentionQueue, forSite, plantKpis, SITES, DOWNTIME_COST_PER_HOUR } from "../data/plantKpis";
import { axisProps, C, Card, CardTitle, ChartTooltip, cx, Kpi, money, Sparkline, LiveBadge } from "../ui";

const pct = (n: number) => `${Math.round(n * 100)}%`;
const pctDp = (n: number) => `${(n * 100).toFixed(1)}%`;
const nf = (n: number) => Math.round(n).toLocaleString("en-US");
const RANGES = { 7: "Last 7 Days", 30: "Last 30 Days", 90: "Last 90 Days" } as const;
type Range = keyof typeof RANGES;

const ISSUE_LINK: Record<Issue["area"], string> = {
  Inventory: "/app/inventory",
  Maintenance: "/app/maintenance",
  Procurement: "/app/procurement",
  Assets: "/app/assets",
};
const SEVERITY_BADGE = {
  critical: { label: "Critical", cls: "bg-rose-50 text-rose-600 ring-rose-200" },
  warning: { label: "High", cls: "bg-amber-50 text-amber-700 ring-amber-200" },
  info: { label: "Medium", cls: "bg-sky-50 text-sky-700 ring-sky-200" },
};

export default function HomePage() {
  const allDs = useDataset();
  const [site, setSite] = useState<string | null>(null);
  const ds = useMemo(() => forSite(allDs, site), [allDs, site]);
  const pk = useMemo(() => plantKpis(ds), [ds]);
  const queue = useMemo(() => attentionQueue(ds), [ds]);
  const { user } = useDemoAuth();
  const navigate = useNavigate();
  const [range, setRange] = useState<Range>(30);
  const [rangeOpen, setRangeOpen] = useState(false);

  const m = useMemo(() => {
    const shortages = stockShortages(ds);
    const overdue = overdueMaintenance(ds);
    const ops = dailyOperations(ds, 180);
    const monthly = monthlySpend(ds);
    const onTimeSeries = monthlyOnTime(ds);
    const fleet = fleetHealth(ds);
    const onTime = overallOnTimeRate(ds);

    const health = [
      { name: "Stock Availability", value: 1 - shortages.length / ds.items.length, fill: C.emerald },
      { name: "Maintenance Compliance", value: 1 - overdue.length / ds.assets.length, fill: C.indigo },
      { name: "Supplier Reliability", value: onTime, fill: C.violet },
      { name: "Asset Reliability", value: fleet.filter((f) => f.status === "Healthy" || f.status === "Watch").length / fleet.length, fill: C.cyan },
    ];
    const healthScore = Math.round((health.reduce((a, h) => a + h.value, 0) / health.length) * 100);

    const lastM = monthly[monthly.length - 1].spend;
    const prevM = monthly[monthly.length - 2].spend;
    const lastOT = onTimeSeries[onTimeSeries.length - 1].rate;
    const prevOT = onTimeSeries[onTimeSeries.length - 2].rate;

    return {
      shortages,
      criticalShort: shortages.filter((s) => s.item.criticality === "Critical").length,
      overdue,
      overdueHigh: overdue.filter((o) => o.asset.criticality === "Critical" || o.asset.criticality === "High").length,
      inv: inventoryValue(ds),
      ops,
      onTime,
      otDelta: lastOT - prevOT,
      lastSpend: lastM,
      spendDelta: (lastM - prevM) / prevM,
      issues: todaysIssues(ds),
      fleet,
      health,
      healthScore,
    };
  }, [ds]);

  // Range-dependent figures
  const view = m.ops.slice(-range);
  const before = m.ops[m.ops.length - range - 1] ?? m.ops[0];
  const invDelta = (m.inv - before.inventory) / before.inventory;
  const bucket = range === 7 ? 1 : range === 30 ? 3 : 7;
  const trend = useMemo(() => {
    const rows: Array<{ label: string; inventory: number; purchasing: number; consumption: number }> = [];
    for (let i = 0; i < view.length; i += bucket) {
      const chunk = view.slice(i, i + bucket);
      rows.push({
        label: chunk[chunk.length - 1].label,
        inventory: chunk[chunk.length - 1].inventory,
        purchasing: chunk.reduce((s, c) => s + c.procurement, 0),
        consumption: chunk.reduce((s, c) => s + c.consumption, 0),
      });
    }
    return rows;
  }, [view, bucket]);
  const lastPoint = trend[trend.length - 1];
  const invMin = Math.min(...trend.map((t) => t.inventory));
  const invMax = Math.max(...trend.map((t) => t.inventory));
  const barMax = Math.max(...trend.map((t) => Math.max(t.purchasing, t.consumption)));


  const firstName = user?.name.split(" ")[0] ?? "";

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="scio-rise relative z-10 rounded-3xl bg-gradient-to-br from-[#000000] via-[#0a0a0c] to-[#111827] ring-1 ring-[#fff]/10 p-6 text-[#fff] shadow-[0_20px_50px_-20px_rgba(30,64,175,0.55)] md:p-7">
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
          <div className="scio-drift absolute -right-16 -top-24 h-72 w-72 rounded-full bg-[#5eead4]/20 blur-3xl" />
          <div className="absolute inset-0 opacity-[0.06] [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:18px_18px]" />
        </div>
        <div className="relative grid gap-6 lg:grid-cols-[1fr_1.25fr]">
          <div className="flex flex-col">
            <div className="flex flex-wrap items-center gap-2 text-[12px] font-medium text-[#dbeafe]">
              <LiveBadge />
              <HeroClock />
            </div>
            <h1 className="mt-4 text-[28px] font-bold leading-tight tracking-tight md:text-[32px]">
              {greeting()}, {firstName}
            </h1>
            <p className="mt-1.5 max-w-lg text-[14.5px] text-[#dbeafe]/90">
              {site ?? "All sites"} · availability <b className="text-[#fff]">{pctDp(pk.availability)}</b> over 90 days, <b className="text-[#fff]">{pk.bd30}</b> breakdown{pk.bd30 === 1 ? "" : "s"} in the last 30 days and <b className="text-[#fff]">{queue.length}</b> item{queue.length === 1 ? "" : "s"} needing a decision.
            </p>
            <div className="mt-auto flex flex-wrap items-center gap-2 pt-5">
              <Link to="/app/ask" className="inline-flex items-center gap-2 rounded-xl bg-[#fff] px-4 py-2.5 text-sm font-semibold text-[#1d4ed8] shadow-lg shadow-[#0b1a3a]/20 transition hover:-translate-y-0.5 hover:shadow-xl">
                <Sparkles className="h-4 w-4" /> Ask SCIO
              </Link>
              <label className="inline-flex items-center gap-2 rounded-xl bg-[#fff]/10 px-3 py-2 text-sm font-semibold text-[#fff] ring-1 ring-[#fff]/25">
                <MapPin className="h-4 w-4" />
                <select value={site ?? ""} onChange={(e) => setSite(e.target.value || null)} className="bg-transparent text-[#fff] outline-none [&>option]:text-[#0f172a]" aria-label="Site">
                  <option value="">All sites</option>
                  {SITES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </label>
              <div className="relative">
                <button onClick={() => setRangeOpen((o) => !o)} className="inline-flex items-center gap-2 rounded-xl bg-[#fff]/10 px-3 py-2.5 text-sm font-semibold text-[#fff] ring-1 ring-[#fff]/25 transition hover:bg-[#fff]/20">
                  <Calendar className="h-4 w-4" /> {RANGES[range]} <ChevronDown className="h-4 w-4" />
                </button>
                {rangeOpen && (
                  <div className="scio-page absolute left-0 z-30 mt-2 w-44 rounded-xl border border-slate-200 bg-white p-1 shadow-xl">
                    {(Object.keys(RANGES) as unknown as Range[]).map((r) => (
                      <button
                        key={r}
                        onClick={() => {
                          setRange(Number(r) as Range);
                          setRangeOpen(false);
                        }}
                        className={cx("w-full rounded-lg px-3 py-2 text-left text-sm", Number(r) === range ? "bg-blue-50 font-semibold text-blue-700" : "text-slate-700 hover:bg-slate-50")}
                      >
                        {RANGES[r]}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-[#fff]/[0.08] p-4 ring-1 ring-[#fff]/15 backdrop-blur-md">
            <div className="mb-3 flex items-center justify-between">
              <span className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#fff]"><Siren className="h-4 w-4 text-[#fda4af]" /> Needs your attention</span>
              <span className="text-[11px] text-[#dbeafe]/80">ranked by money at risk</span>
            </div>
            {queue.length === 0 ? (
              <p className="py-6 text-center text-sm text-[#dbeafe]">Nothing urgent at {site ?? "any site"}.</p>
            ) : (
              <ul className="space-y-2">
                {[...queue].sort((a, b) => b.impact - a.impact).map((q) => (
                  <li key={q.id} className="flex items-center gap-3 rounded-xl bg-[#0b1a3a]/40 p-3 ring-1 ring-[#fff]/10">
                    <span className={cx("h-9 w-1 shrink-0 rounded-full", q.severity === "critical" ? "bg-[#fb7185]" : "bg-[#fbbf24]")} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13.5px] font-semibold text-[#fff]">{q.title}</div>
                      <div className="truncate text-[11.5px] text-[#cbd5e1]">{q.cause}</div>
                    </div>
                    <div className="hidden shrink-0 text-right sm:block">
                      <div className="text-[13px] font-bold tabular-nums text-[#fff]">{money(q.impact, true)}</div>
                      <div className="text-[10.5px] text-[#94a3b8]">{q.impactLabel}</div>
                    </div>
                    <button onClick={() => navigate(q.to, { state: q.state })} className="shrink-0 rounded-lg bg-[#fff] px-2.5 py-1.5 text-[12px] font-semibold text-[#1d4ed8] transition hover:bg-[#dbeafe]">
                      {q.action}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* Data sources */}
      <div className="scio-rise flex flex-wrap items-center gap-x-5 gap-y-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-[12px] text-slate-600 shadow-sm [animation-delay:60ms]">
        <span className="inline-flex items-center gap-1.5 font-semibold text-slate-800"><Radio className="h-3.5 w-3.5 text-emerald-600" /> Connected sources</span>
        <SourceChip label="ERP" detail={`${nf(ds.purchaseOrders.length)} POs · synced 2 min ago`} />
        <SourceChip label="CMMS" detail={`${nf(ds.downtime?.length ?? 0)} downtime records · ${ds.assets.length} assets`} />
        <SourceChip label="IoT" detail={`${ds.assets.length}/${ds.assets.length} vibration sensors reporting`} />
        <SourceChip label="WMS" detail={`${ds.warehouses.length} warehouse${ds.warehouses.length > 1 ? "s" : ""} · ${nf(ds.items.length)} SKUs`} />
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Kpi delay={50} onClick={() => navigate("/app/assets")} label="Asset availability" value={pctDp(pk.availability)} sub="90 days · incl. planned stops" tint={pk.availability >= 0.95 ? "green" : "amber"} icon={<Gauge />} />
        <Kpi delay={100} onClick={() => navigate("/app/maintenance")} label="MTBF" value={`${nf(pk.mtbf)} h`} sub={`MTTR ${pk.mttr.toFixed(1)} h · ${pk.breakdowns} breakdowns`} delta={pk.bd30 === pk.bdPrev30 ? undefined : `${pk.bd30 > pk.bdPrev30 ? "▲" : "▼"} ${Math.abs(pk.bd30 - pk.bdPrev30)} vs prior 30d`} deltaGood={pk.bd30 <= pk.bdPrev30} tint="blue" icon={<Timer />} />
        <Kpi delay={150} onClick={() => navigate("/app/maintenance")} label="PM compliance" value={pctDp(pk.pmCompliance)} delta={pk.overdue.length ? `${pk.overdue.length} overdue` : "On schedule"} deltaPill deltaGood={pk.overdue.length === 0} tint="lavender" icon={<ShieldCheck />} />
        <Kpi delay={200} onClick={() => navigate("/app/inventory")} label="Critical spares at risk" value={String(pk.criticalSpares.length)} delta={`${pk.shortages.length} below min`} deltaPill deltaGood={pk.criticalSpares.length === 0} sub={`of ${ds.items.length} SKUs`} tint="rose" icon={<PackageX />} />
        <Kpi delay={250} onClick={() => navigate("/app/procurement")} label="Supplier OTIF" value={pct(pk.otif)} delta={`${pk.otifDelta >= 0 ? "▲" : "▼"} ${Math.abs(pk.otifDelta * 100).toFixed(1)} pp`} deltaGood={pk.otifDelta >= 0} sub="90 days vs prior 90" tint="violet" icon={<Truck />} />
        <Kpi delay={300} onClick={() => navigate("/app/inventory")} label="Inventory value" value={money(m.inv, true)} delta={`${invDelta >= 0 ? "▲" : "▼"} ${Math.abs(invDelta * 100).toFixed(1)}%`} deltaGood={invDelta >= 0} sub={`vs ${range} days ago`} spark={view.map((o) => o.inventory)} tint="teal" icon={<Boxes />} />
      </div>

      {/* Trend + Health + Insights */}
      <div className="grid gap-5 xl:grid-cols-12">
        <Card className="xl:col-span-6" delay={100}>
          <CardTitle
            icon={<ChartColumnIncreasing className="h-5 w-5 text-blue-600" />}
            hint="Inventory, purchasing, and parts consumption over time"
            right={
              <div className="flex gap-1.5">
                {([7, 30, 90] as Range[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRange(r)}
                    className={cx("rounded-lg border px-3 py-1 text-xs font-semibold", range === r ? "border-blue-600 bg-[#2563eb] text-[#fff]" : "border-slate-200 text-slate-600 hover:bg-slate-50")}
                  >
                    {r}D
                  </button>
                ))}
              </div>
            }
          >
            Operations Trend
          </CardTitle>
          <div className="mb-2 flex flex-wrap gap-5 text-xs text-slate-600">
            <LegendDot color={C.indigo} label="Inventory Value (AED)" />
            <LegendDot color="#a78bfa" label="Purchasing (AED)" />
            <LegendDot color="#2dd4bf" label="Consumption (AED)" />
          </div>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={trend} margin={{ top: 18, right: 12, left: 0, bottom: 0 }} barGap={2}>
                <defs>
                  <linearGradient id="invArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={C.indigo} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={C.indigo} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke={C.grid} />
                <XAxis dataKey="label" {...axisProps} minTickGap={24} />
                <YAxis
                  yAxisId="inv"
                  {...axisProps}
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  width={56}
                  domain={[Math.floor((invMin * 0.92) / 100000) * 100000, Math.ceil((invMax * 1.04) / 100000) * 100000]}
                  tickFormatter={(v) => money(v, true).replace("AED ", "")}
                />
                <YAxis yAxisId="flow" hide domain={[0, barMax * 3.2]} />
                <Tooltip content={<ChartTooltip format={(v) => money(v)} />} cursor={{ fill: "rgba(59,130,246,0.05)" }} />
                <Bar yAxisId="flow" dataKey="purchasing" name="Purchasing" fill="#a78bfa" radius={[3, 3, 0, 0]} maxBarSize={12} />
                <Bar yAxisId="flow" dataKey="consumption" name="Consumption" fill="#2dd4bf" radius={[3, 3, 0, 0]} maxBarSize={12} />
                <Area yAxisId="inv" type="monotone" dataKey="inventory" name="Inventory value" stroke={C.indigo} strokeWidth={2.5} fill="url(#invArea)" activeDot={{ r: 5 }} />
                {lastPoint && (
                  <ReferenceDot
                    yAxisId="inv"
                    x={lastPoint.label}
                    y={lastPoint.inventory}
                    r={5}
                    fill={C.indigo}
                    stroke="#fff"
                    strokeWidth={2}
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="xl:col-span-3" delay={160}>
          <CardTitle icon={<Settings2 className="h-5 w-5" />}>Operations Health</CardTitle>
          <div className="flex flex-col items-center gap-5">
            <div className="relative h-[150px] w-[150px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <defs>
                    <linearGradient id="healthRing" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#4ade80" />
                      <stop offset="100%" stopColor="#16a34a" />
                    </linearGradient>
                  </defs>
                  <Pie
                    data={[{ v: m.healthScore }, { v: 100 - m.healthScore }]}
                    dataKey="v"
                    innerRadius={56}
                    outerRadius={72}
                    startAngle={90}
                    endAngle={-270}
                    stroke="none"
                    cornerRadius={8}
                    isAnimationActive={false}
                  >
                    <Cell fill="url(#healthRing)" />
                    <Cell fill="rgba(148,163,184,0.22)" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[38px] font-bold leading-none text-slate-900">{m.healthScore}</span>
                <span className="mt-1 text-xs text-slate-500">of 100</span>
              </div>
            </div>
            <ul className="w-full space-y-3">
              {m.health.map((h) => (
                <li key={h.name} className="flex items-center gap-2.5 text-[13px]">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: h.fill }} />
                  <span className="text-slate-700">{h.name}</span>
                  <span className="ml-auto font-semibold tabular-nums text-slate-900">{pct(h.value)}</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>

        <Card className="xl:col-span-3" delay={220}>
          <CardTitle icon={<Activity className="h-5 w-5 text-rose-500" />} hint="Unplanned stops from the CMMS log">
            Recent breakdowns
          </CardTitle>
          {pk.recentBreakdowns.length === 0 ? (
            <p className="text-sm text-slate-500">No breakdowns in the last 90 days.</p>
          ) : (
            <ul className="space-y-2.5">
              {pk.recentBreakdowns.map((d) => {
                const a = ds.assets.find((x) => x.id === d.assetId);
                const cost = d.hours * (DOWNTIME_COST_PER_HOUR[a?.criticality ?? "Medium"] ?? 500);
                return (
                  <li key={d.id}>
                    <button onClick={() => navigate("/app/assets", { state: { assetId: d.assetId } })} className="flex w-full items-start gap-3 rounded-xl border border-slate-100 p-2.5 text-left transition hover:border-blue-200 hover:bg-blue-50/40">
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-rose-500" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-semibold text-slate-900">{a?.name ?? d.assetId}</span>
                        <span className="block truncate text-[11.5px] text-slate-500">{d.cause} · {d.start}</span>
                      </span>
                      <span className="shrink-0 text-right">
                        <span className="block text-[12.5px] font-semibold tabular-nums text-slate-900">{d.hours.toFixed(1)} h</span>
                        <span className="block text-[11px] tabular-nums text-rose-600">{money(cost, true)}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          <div className="mt-3 border-t border-slate-100 pt-3 text-[12px] text-slate-500">
            90-day downtime cost <b className="text-slate-900">{money(pk.downtimeCost, true)}</b> · MTTR {pk.mttr.toFixed(1)} h
          </div>
        </Card>
      </div>

      {/* Priorities + Risk assets */}
      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <CardTitle icon={<ClipboardList className="h-5 w-5" />} hint="Actions that need your attention">
            Today's Priorities
          </CardTitle>
          <ul className="divide-y divide-slate-100">
            {m.issues.map((i) => (
              <li key={i.id}>
                <Link to={ISSUE_LINK[i.area]} className="group flex items-start gap-4 py-3 transition hover:bg-slate-50/70">
                  <span className="mt-1">
                    <span className={cx("block h-3 w-3 rounded-full ring-4", i.severity === "critical" ? "bg-rose-500 ring-rose-100" : i.severity === "warning" ? "bg-amber-400 ring-amber-100" : "bg-sky-400 ring-sky-100")} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-[14.5px] font-semibold text-slate-900">{i.title}</span>
                      <span className={cx("rounded-md px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset", SEVERITY_BADGE[i.severity].cls)}>{SEVERITY_BADGE[i.severity].label}</span>
                    </span>
                    <span className="mt-0.5 block text-[13px] text-slate-600">{i.detail}</span>
                  </span>
                  <ChevronRight className="mt-2 h-5 w-5 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-slate-700" />
                </Link>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardTitle icon={<Activity className="h-5 w-5" />} hint="Assets with increasing vibration or abnormal behaviour">
            Highest-Risk Assets
          </CardTitle>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-[13px] text-slate-600">
                  <th className="pb-2.5 font-semibold">Asset</th>
                  <th className="pb-2.5 font-semibold">Location</th>
                  <th className="pb-2.5 text-center font-semibold">Risk Score</th>
                  <th className="pb-2.5 font-semibold">Trend (30D)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {m.fleet.slice(0, 6).map((f) => {
                  const high = f.riskScore >= 45;
                  return (
                    <tr key={f.asset.id} className="cursor-pointer hover:bg-slate-50/70" onClick={() => navigate("/app/assets", { state: { assetId: f.asset.id } })}>
                      <td className="py-3 font-semibold text-slate-900">{f.asset.name}</td>
                      <td className="py-3 text-slate-600">{f.asset.site}</td>
                      <td className="py-3 text-center">
                        <span className={cx("inline-block min-w-[40px] rounded-md px-2 py-0.5 text-[13px] font-bold", high ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-700")}>{f.riskScore}</span>
                      </td>
                      <td className="py-2">
                        <div className="h-8 w-32">
                          <Sparkline data={f.asset.vibration.slice(-30)} color={high ? C.rose : C.emerald} id={`r-${f.asset.id}`} fill={false} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

function greeting() {
  const h = Number(new Date().toLocaleString("en-GB", { hour: "2-digit", hour12: false, timeZone: "Asia/Dubai" }));
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

function HeroClock() {
  const [now, setNow] = useState(() => new Date());
  React.useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fff]/10 px-2.5 py-1 ring-1 ring-[#fff]/15 tabular-nums">
      <Clock className="h-3.5 w-3.5" />
      {now.toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short", timeZone: "Asia/Dubai" })} · {now.toLocaleTimeString("en-GB", { timeZone: "Asia/Dubai" })} GST
    </span>
  );
}

function SourceChip({ label, detail }: { label: string; detail: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
      <b className="font-semibold text-slate-700">{label}</b> {detail}
    </span>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}
