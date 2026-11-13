import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  Store,
  Barcode,
  Wallet,
  PackageX,
  Layers,
  Truck,
  CalendarClock,
  TrendingDown,
  Target,
  ChevronRight,
  Home,
  Sparkles,
  History,
  Ghost,
  Refrigerator,
  ShoppingCart,
  Activity,
  ArrowUpRight,
  Clock,
  BadgePercent,
  Megaphone,
  Undo2,
  ArrowLeftRight,
  ClipboardCheck,
} from "lucide-react";
import { useRetail } from "../RetailContext";
import { useDemoAuth } from "../../auth";
import { drillDown, nextLevel, type DrillPath, type ProblemKind } from "../analytics";
import { Kpi, Card, CardTitle, cx, AnimatedValue, useCountUp, ChartTooltip, axisProps, C, CATEGORY_COLORS, HealthRing, LiveBadge } from "../../ui";
import { aed, nf, pctf, Pill, MiniBar } from "../rui";
import { dailySalesTrend, gulfHour, trendSeries, useLiveSales, useNow } from "../live";

const SEV = { critical: { tone: "bad", label: "Critical", strip: "bg-rose-500", glow: "from-rose-50" }, high: { tone: "warn", label: "High", strip: "bg-amber-400", glow: "from-amber-50" }, medium: { tone: "accent", label: "Medium", strip: "bg-blue-400", glow: "from-blue-50" } } as const;
const KIND_ICON: Record<ProblemKind, React.ElementType> = {
  stockout: PackageX,
  supplier: Truck,
  expiry: CalendarClock,
  phantom: Ghost,
  equipment: Refrigerator,
  overstock: Layers,
  store: Store,
  margin: BadgePercent,
  promotion: Megaphone,
  returns: Undo2,
  transfer: ArrowLeftRight,
  compliance: ClipboardCheck,
};
const P = "/app/retail";

export default function RetailDashboard() {
  const { state, kpis: k, problems, scope, scopeLabel } = useRetail();
  const { user } = useDemoAuth();
  const navigate = useNavigate();
  const { base } = state;
  const now = useNow(1000);

  // ---- derived series ------------------------------------------------------
  const trend = useMemo(() => dailySalesTrend(k.perf, base.anchorDate), [k.perf, base.anchorDate]);
  const dailyExpected = trend.length ? trend[trend.length - 1].sales : 0;
  const { today, ticks } = useLiveSales(k.perf, dailyExpected);
  const dailyTarget = trend[0]?.target ?? 1;
  const lastWeekSameTime = dailyExpected > 0 ? (today / dailyExpected) * (trend[trend.length - 8]?.sales ?? dailyExpected) : 0;
  const vsLastWeek = lastWeekSameTime ? today / lastWeekSameTime - 1 : 0;

  const byCountry = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of k.perf) m.set(p.store.country, (m.get(p.store.country) ?? 0) + p.sales30);
    return [...m.entries()].map(([code, v]) => ({ name: base.countries.find((c) => c.code === code)!.name, value: v })).sort((a, b) => b.value - a.value);
  }, [k.perf, base.countries]);

  const byDept = useMemo(() => {
    const m = new Map<string, number>();
    const N = base.skus.length;
    for (const p of k.perf) {
      const off = p.store.idx * N;
      for (let i = 0; i < N; i++) {
        if (!base.carried[off + i]) continue;
        const sku = base.skus[i];
        m.set(sku.department, (m.get(sku.department) ?? 0) + base.velocity[off + i] * sku.price * (30 - Math.min(30, state.lastSale(off + i))));
      }
    }
    return [...m.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [k.perf, base, state]);

  const sparks = useMemo(
    () => ({
      inv: trendSeries("inv", k.inventoryValue, 0.02, -0.004),
      ov: trendSeries("ov", k.overstockValue, 0.04, -0.01),
      tg: trendSeries("tg", k.salesVsTarget, 0.03, -0.002),
      sales: trend.map((t) => t.sales),
      hero: trend.slice(-14),
    }),
    [k.inventoryValue, k.overstockValue, k.salesVsTarget, trend]
  );

  const critical = problems.filter((p) => p.severity === "critical").length;
  const health = Math.round(100 * (0.4 * Math.min(1, k.salesVsTarget) + 0.45 * k.availability + 0.15 * Math.max(0, 1 - critical / 8)));

  // ---- drill-down ------------------------------------------------------------
  const [path, setPath] = useState<DrillPath>(() => {
    if (scope && scope.size === 1) {
      const s = base.stores[[...scope][0]];
      return { country: s.country, region: s.region, store: s.idx };
    }
    if (scope) return { country: base.stores[[...scope][0]].country };
    return {};
  });
  const level = nextLevel(path);
  const rows = useMemo(() => drillDown(state, path, scope), [state, path, scope]);
  const maxSales = Math.max(1, ...rows.map((r) => r.sales30));
  const crumbs: Array<[string, DrillPath]> = [["All", {}]];
  if (path.country) crumbs.push([base.countries.find((c) => c.code === path.country)!.name, { country: path.country }]);
  if (path.region) crumbs.push([path.region, { country: path.country, region: path.region }]);
  if (path.store !== undefined) crumbs.push([`${base.stores[path.store].id} ${base.stores[path.store].name}`, { country: path.country, region: path.region, store: path.store }]);
  if (path.department) crumbs.push([path.department, { ...path, category: undefined }]);
  if (path.category) crumbs.push([path.category, path]);
  const drill = (key: string) => {
    if (level === "country") setPath({ country: key });
    else if (level === "region") setPath({ ...path, region: key });
    else if (level === "store") setPath({ ...path, store: Number(key) });
    else if (level === "department") setPath({ ...path, department: key });
    else if (level === "category") setPath({ ...path, category: key });
    else navigate(`${P}/skus?sku=${base.skus[Number(key)].id}${path.store !== undefined ? `&store=${base.stores[path.store].id}` : ""}`);
  };

  const recent = [...state.events].reverse().filter((e) => e.type !== "thresholds").slice(0, 5);
  const worstStores = [...k.perf].sort((a, b) => a.vsTarget - b.vsTarget).slice(0, 5);
  const hour = Math.floor(gulfHour(now));
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const maxImpact = Math.max(1, ...problems.map((p) => p.impact));

  return (
    <div className="space-y-6">
      {/* ---------------- Hero ---------------- */}
      <section className="scio-rise relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#000000] via-[#0a0a0c] to-[#111827] ring-1 ring-[#fff]/10 p-6 text-[#fff] shadow-[0_20px_50px_-20px_rgba(29,78,216,0.55)] md:p-8">
        <div aria-hidden className="scio-drift pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-cyan-300/25 blur-3xl" />
        <div aria-hidden className="scio-drift pointer-events-none absolute -bottom-28 left-1/3 h-72 w-72 rounded-full bg-indigo-400/30 blur-3xl [animation-delay:-7s]" />
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:radial-gradient(white_1px,transparent_1px)] [background-size:18px_18px]" />

        <div className="relative grid gap-8 lg:grid-cols-[1.3fr_1fr_auto] lg:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-[12px] font-medium text-[#dbeafe]">
              <LiveBadge />
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fff]/10 px-2.5 py-1 ring-1 ring-[#fff]/15">
                <Clock className="h-3.5 w-3.5" />
                {now.toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short", timeZone: "Asia/Dubai" })} · {now.toLocaleTimeString("en-GB", { timeZone: "Asia/Dubai" })} GST
              </span>
            </div>
            <h1 className="mt-4 text-[28px] font-bold leading-tight tracking-tight md:text-[34px]">
              {greeting}, {user?.name?.split(" ")[0] ?? "there"}
            </h1>
            <p className="mt-1.5 max-w-xl text-[15px] text-[#dbeafe]/90">
              {scopeLabel} · <b className="text-[#fff]">{critical}</b> critical issue{critical === 1 ? "" : "s"} and <b className="text-[#fff]">{aed(k.lostSalesPerDay)}</b>/day in lost sales need attention.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link to={`${P}/ask`} className="inline-flex items-center gap-2 rounded-xl bg-[#fff] px-4 py-2.5 text-sm font-semibold text-[#b06d0f] shadow-lg shadow-[#172554]/20 transition hover:-translate-y-0.5 hover:shadow-xl">
                <Sparkles className="h-4 w-4" /> Ask SCIO
              </Link>
              <Link to={`${P}/replenishment`} className="inline-flex items-center gap-2 rounded-xl bg-[#fff]/10 px-4 py-2.5 text-sm font-semibold text-[#fff] ring-1 ring-[#fff]/25 backdrop-blur transition hover:bg-[#fff]/20">
                Fix stockouts <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link to={`${P}/master`} className="inline-flex items-center gap-2 rounded-xl bg-[#fff]/10 px-4 py-2.5 text-sm font-semibold text-[#fff] ring-1 ring-[#fff]/25 backdrop-blur transition hover:bg-[#fff]/20">
                Master dashboard <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="rounded-2xl bg-[#fff]/10 p-5 ring-1 ring-[#fff]/15 backdrop-blur-md">
            <div className="flex items-center justify-between text-[13px] text-[#dbeafe]">
              <span className="inline-flex items-center gap-1.5">
                <ShoppingCart className="h-4 w-4" /> Sales today
              </span>
              <span className={cx("rounded-md px-1.5 py-0.5 text-[12px] font-semibold", vsLastWeek >= 0 ? "bg-emerald-400/20 text-[#a7f3d0]" : "bg-rose-400/20 text-[#fecdd3]")}>
                {vsLastWeek >= 0 ? "▲" : "▼"} {pctf(Math.abs(vsLastWeek))} vs last week
              </span>
            </div>
            <div className="mt-2 text-[34px] font-bold tabular-nums tracking-tight">
              <LiveMoney value={today} />
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#fff]/15">
              <div className="h-full rounded-full bg-gradient-to-r from-emerald-300 to-cyan-200 transition-[width] duration-1000" style={{ width: `${Math.min(100, (today / dailyTarget) * 100)}%` }} />
            </div>
            <div className="mt-2 flex justify-between text-[12px] text-[#dbeafe]/90">
              <span>{pctf(today / dailyTarget, 0)} of daily target</span>
              <span>Target {aed(dailyTarget)}</span>
            </div>
            <div className="mt-4 h-12">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparks.hero} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="hero-g" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ffffff" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="sales" stroke="#ffffff" strokeWidth={2} fill="url(#hero-g)" animationDuration={1400} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <HealthRing score={health} label="Retail health score" />
        </div>
      </section>

      {/* ---------------- KPIs ---------------- */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <Kpi onClick={() => navigate(`${P}/insights/stores`)} delay={60} label="Stores" value={nf(k.stores)} sub={`${new Set(k.perf.map((p) => p.store.country)).size} countries`} tint="blue" icon={<Store />} />
        <Kpi onClick={() => navigate(`${P}/insights/skus`)} delay={100} label="Active SKUs" value={nf(k.activeSkus)} sub={`${nf(base.skus.length)} in catalogue`} tint="lavender" icon={<Barcode />} />
        <Kpi onClick={() => navigate(`${P}/insights/inventory`)} delay={140} label="Inventory Value" value={aed(k.inventoryValue)} sub="at cost" tint="teal" icon={<Wallet />} spark={sparks.inv} color={C.cyan} />
        <Kpi onClick={() => navigate(`${P}/insights/stockouts`)} delay={180} label="Stockout Risks" value={nf(k.stockoutRisks)} delta={`${nf(k.outOfStock)} OOS`} deltaPill sub={`${aed(k.lostSalesPerDay)}/day`} tint="rose" icon={<PackageX />} />
        <Kpi onClick={() => navigate(`${P}/insights/overstock`)} delay={220} label="Overstock" value={aed(k.overstockValue)} sub={`${nf(k.overstockCount)} store-SKUs`} tint="amber" icon={<Layers />} spark={sparks.ov} color={C.amber} />
        <Kpi onClick={() => navigate(`${P}/insights/suppliers`)} delay={260} label="Supplier Delays" value={nf(k.supplierDelays)} sub="overdue POs" tint="violet" icon={<Truck />} />
        <Kpi onClick={() => navigate(`${P}/insights/expiry`)} delay={300} label="Expiry Risk" value={aed(k.expiryRiskValue)} sub={`${nf(k.expiryCount)} batches ≤ ${state.thresholds.expiryDays}d`} tint="rose" icon={<CalendarClock />} />
        <Kpi onClick={() => navigate(`${P}/insights/losses`)} delay={340} label="Inventory Losses" value={aed(k.inventoryLoss)} sub="damage, expiry, unexplained" tint="amber" icon={<TrendingDown />} />
        <Kpi onClick={() => navigate(`${P}/insights/performance`)} delay={380} label="Sales vs Target" value={pctf(k.salesVsTarget, 0)} delta={`${pctf(k.availability)} avail.`} deltaPill deltaGood={k.availability > 0.97} tint="green" icon={<Target />} spark={sparks.tg} color={C.emerald} />
        <Kpi onClick={() => navigate(`${P}/insights/sales`)} delay={420} label="Sales · 30 days" value={aed(k.sales30)} sub="all channels" tint="blue" icon={<Wallet />} spark={sparks.sales} color={C.indigo} />
      </div>

      {/* ---------------- Trend + mix ---------------- */}
      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2" delay={120}>
          <CardTitle hint="Daily net sales against the daily target · last 30 days" right={<Legend items={[["Sales", C.indigo], ["Target", C.amber]]} />}>
            Sales trend
          </CardTitle>
          <div className="h-[270px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="sales-g" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={C.indigo} stopOpacity={0.28} />
                    <stop offset="100%" stopColor={C.indigo} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={C.grid} vertical={false} />
                <XAxis dataKey="day" {...axisProps} interval={4} />
                <YAxis {...axisProps} width={64} tickFormatter={(v) => aed(v).replace("AED ", "")} />
                <Tooltip content={<ChartTooltip format={(v) => aed(v, false)} />} cursor={{ stroke: C.indigo, strokeOpacity: 0.25, strokeWidth: 24 }} />
                <Area type="monotone" dataKey="sales" name="Sales" stroke={C.indigo} strokeWidth={2.5} fill="url(#sales-g)" animationDuration={1300} activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }} />
                <Line type="monotone" dataKey="target" name="Target" stroke={C.amber} strokeDasharray="6 5" strokeWidth={1.75} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card delay={180}>
          <CardTitle hint="30-day sales share by country">Sales mix</CardTitle>
          <div className="relative h-[190px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={byCountry} dataKey="value" nameKey="name" innerRadius={58} outerRadius={86} paddingAngle={2} stroke="none" animationDuration={1200}>
                  {byCountry.map((_, i) => (
                    <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip format={(v) => aed(v, false)} />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
              <div>
                <div className="text-[11px] uppercase tracking-wider text-slate-400">30 days</div>
                <div className="text-lg font-bold text-slate-900">
                  <AnimatedValue value={aed(k.sales30)} />
                </div>
              </div>
            </div>
          </div>
          <ul className="mt-3 space-y-1.5">
            {byCountry.map((c, i) => (
              <li key={c.name} className="flex items-center gap-2 text-[13px]">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }} />
                <span className="text-slate-700">{c.name}</span>
                <span className="ml-auto font-semibold tabular-nums text-slate-900">{pctf(c.value / Math.max(1, k.sales30), 0)}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* ---------------- Problems + live feed ---------------- */}
      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2" delay={160}>
          <CardTitle hint="Ranked by severity and business impact · click to act">Priority problems</CardTitle>
          <div className="space-y-2.5">
            {problems.map((p, i) => {
              const Icon = KIND_ICON[p.kind] ?? Activity;
              const sv = SEV[p.severity];
              return (
                <Link
                  key={p.id}
                  to={p.link}
                  style={{ animationDelay: `${200 + i * 50}ms` }}
                  className={cx("scio-rise group relative flex items-center gap-4 overflow-hidden rounded-xl border border-slate-100 bg-gradient-to-r to-white p-3.5 pl-5 transition hover:border-blue-200 hover:shadow-md", sv.glow)}
                >
                  <span className={cx("absolute inset-y-0 left-0 w-1", sv.strip)} />
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-slate-700 shadow-sm ring-1 ring-slate-200 transition group-hover:scale-105">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Pill tone={sv.tone}>{sv.label}</Pill>
                      <span className="truncate text-[14.5px] font-semibold text-slate-900">{p.title}</span>
                    </div>
                    <p className="mt-0.5 line-clamp-1 text-[12.5px] text-slate-600">{p.why}</p>
                    <div className="mt-1 flex flex-wrap gap-x-3 text-[11.5px] text-slate-500">
                      <span>📍 {p.where}</span>
                      <span>👤 {p.team}</span>
                    </div>
                  </div>
                  <div className="hidden w-36 shrink-0 sm:block">
                    <div className="text-right text-[15px] font-bold tabular-nums text-slate-900">{aed(p.impact)}</div>
                    <div className="text-right text-[11px] text-slate-500">{p.impactLabel}</div>
                    <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-slate-100">
                      <div className={cx("h-full rounded-full", sv.strip)} style={{ width: `${Math.max(4, (p.impact / maxImpact) * 100)}%` }} />
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-blue-600" />
                </Link>
              );
            })}
            {problems.length === 0 && <p className="py-6 text-center text-sm text-slate-500">No open problems in your scope. 🎉</p>}
          </div>
        </Card>

        <Card delay={220} className="flex flex-col">
          <CardTitle
            hint="Point-of-sale tickets and team actions"
            right={
              <span className="relative flex h-2.5 w-2.5">
                <span className="scio-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </span>
            }
          >
            <span className="inline-flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-600" /> Live activity
            </span>
          </CardTitle>
          <ul className="space-y-1">
            {ticks.map((t) => (
              <li key={t.id} className="scio-slidein flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-slate-50">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-600">
                  <ShoppingCart className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-medium text-slate-800">
                    {t.storeId} {t.storeName}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {t.items} item{t.items === 1 ? "" : "s"} · {t.city} · {t.at.toLocaleTimeString("en-GB", { timeZone: "Asia/Dubai", hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                  </div>
                </div>
                <span className="text-[13px] font-semibold tabular-nums text-emerald-700">+{aed(t.amount, false)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 border-t border-slate-100 pt-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wider text-slate-500">
                <History className="h-3.5 w-3.5" /> Team actions
              </span>
              <Link to={`${P}/settings?tab=audit`} className="text-xs font-semibold text-blue-700 hover:underline">
                Audit trail
              </Link>
            </div>
            {recent.length === 0 ? (
              <p className="text-[13px] text-slate-500">No actions yet. Start from a priority problem.</p>
            ) : (
              <ul className="space-y-2 text-[12.5px]">
                {recent.map((e) => (
                  <li key={e.id} className="flex gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                    <span>
                      <span className="font-medium text-slate-800">{describeEvent(e, base)}</span>
                      <span className="block text-[11px] text-slate-500">
                        {e.user} · {new Date(e.at).toLocaleTimeString("en-GB", { timeZone: "Asia/Dubai", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>
      </div>

      {/* ---------------- Store heatmap + departments ---------------- */}
      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2" delay={200}>
          <CardTitle hint="Each tile is a store, coloured by sales vs. 30-day target · click to open" right={<HeatLegend />}>
            Store health map
          </CardTitle>
          <div className="space-y-4">
            {groupByCountry(k.perf).map(([code, list]) => (
              <div key={code}>
                <div className="mb-1.5 text-[12px] font-semibold text-slate-500">
                  {base.countries.find((c) => c.code === code)!.name} <span className="font-normal text-slate-400">· {list.length} stores</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {list.map((p, i) => (
                    <Link
                      key={p.store.id}
                      to={`${P}/stores/${p.store.id}`}
                      style={{ animationDelay: `${i * 25}ms` }}
                      className={cx("scio-rise group relative grid h-12 w-[68px] place-items-center rounded-lg text-[11px] font-bold transition hover:z-10 hover:scale-110 hover:shadow-lg", heatClass(p.vsTarget))}
                    >
                      <span>{p.store.id}</span>
                      <span className="-mt-2 text-[10px] font-semibold opacity-80">{pctf(p.vsTarget, 0)}</span>
                      <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 hidden w-52 -translate-x-1/2 rounded-xl bg-[#0f172a] p-2.5 text-left text-[11px] font-normal text-[#fff] shadow-xl group-hover:block">
                        <b className="block text-[12px]">
                          {p.store.id} {p.store.name}
                        </b>
                        {p.store.format} · {p.store.city}
                        <br />
                        Sales {aed(p.sales30)} · {pctf(p.vsTarget, 0)} of target
                        <br />
                        Availability {pctf(p.availability)} · {nf(p.outOfStock)} OOS
                        {p.equipmentFaults > 0 && <span className="block text-rose-300">{p.equipmentFaults} equipment fault(s)</span>}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card delay={260}>
          <CardTitle hint="30-day sales by department">Department performance</CardTitle>
          <div style={{ height: Math.max(220, byDept.length * 34) }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byDept} layout="vertical" margin={{ top: 0, right: 12, left: 0, bottom: 0 }} barCategoryGap={8}>
                <defs>
                  <linearGradient id="dept-g" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#f2a93b" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" {...axisProps} width={112} tick={{ fill: "#475569", fontSize: 11.5 }} />
                <Tooltip content={<ChartTooltip format={(v) => aed(v, false)} />} cursor={{ fill: "rgba(59,130,246,0.06)" }} />
                <Bar dataKey="value" name="Sales" fill="url(#dept-g)" radius={[0, 6, 6, 0]} animationDuration={1200} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* ---------------- Drill-down + attention ---------------- */}
      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2" delay={240}>
          <CardTitle hint="Country → region → store → department → category → SKU">Performance drill-down</CardTitle>
          <div className="mb-3 flex flex-wrap items-center gap-1 text-sm">
            {crumbs.map(([label, p], i) => (
              <React.Fragment key={i}>
                {i > 0 && <ChevronRight className="h-4 w-4 text-slate-300" />}
                <button onClick={() => setPath(p)} className={cx("inline-flex items-center gap-1 rounded-md px-2 py-1 transition", i === crumbs.length - 1 ? "bg-blue-50 font-semibold text-blue-700" : "text-slate-600 hover:bg-slate-100")}>
                  {i === 0 && <Home className="h-3.5 w-3.5" />}
                  {label}
                </button>
              </React.Fragment>
            ))}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-[12px] text-slate-500">
                  <th className="pb-2 font-semibold capitalize">{level}</th>
                  <th className="pb-2 font-semibold">Sales · 30d</th>
                  <th className="pb-2 text-right font-semibold">Availability</th>
                  <th className="pb-2 text-right font-semibold">Out of stock</th>
                  <th className="pb-2 text-right font-semibold">Overstock</th>
                  <th className="pb-2 text-right font-semibold">Inventory</th>
                </tr>
              </thead>
              <tbody key={level + (path.country ?? "") + (path.region ?? "") + (path.store ?? "") + (path.department ?? "") + (path.category ?? "")} className="divide-y divide-slate-100">
                {rows.slice(0, level === "sku" ? 40 : 60).map((r, i) => (
                  <tr key={r.key} onClick={() => drill(r.key)} style={{ animationDelay: `${Math.min(i, 15) * 20}ms` }} className="scio-rise cursor-pointer transition hover:bg-blue-50/50">
                    <td className="py-2.5 pr-3">
                      <div className="font-semibold text-slate-900">{r.label}</div>
                      {r.sub && <div className="text-xs text-slate-500">{r.sub}</div>}
                    </td>
                    <td className="py-2.5">
                      <div className="flex items-center gap-2">
                        <MiniBar value={r.sales30 / maxSales} />
                        <span className="tabular-nums text-slate-700">{aed(r.sales30)}</span>
                      </div>
                    </td>
                    <td className={cx("py-2.5 text-right font-semibold tabular-nums", r.availability < 0.95 ? "text-rose-600" : r.availability < 0.98 ? "text-amber-600" : "text-emerald-600")}>{pctf(r.availability)}</td>
                    <td className="py-2.5 text-right tabular-nums">{nf(r.outOfStock)}</td>
                    <td className="py-2.5 text-right tabular-nums">{aed(r.overstockValue)}</td>
                    <td className="py-2.5 text-right tabular-nums">{aed(r.inventoryValue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card delay={300}>
          <CardTitle hint="Lowest sales vs. 30-day target">Stores needing attention</CardTitle>
          <ul className="space-y-2.5">
            {worstStores.map((p, i) => (
              <li key={p.store.idx} className="scio-rise" style={{ animationDelay: `${300 + i * 60}ms` }}>
                <Link to={`${P}/stores/${p.store.id}`} className="group flex items-center gap-3 rounded-xl border border-slate-100 p-3 transition hover:border-blue-200 hover:bg-blue-50/30 hover:shadow-sm">
                  <MiniRing value={p.vsTarget} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold text-slate-900">
                      {p.store.id} {p.store.name}
                    </div>
                    <div className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-slate-500">
                      <span>{p.store.city}</span>
                      <span>Avail. {pctf(p.availability)}</span>
                      {p.equipmentFaults > 0 && <span className="text-rose-600">{p.equipmentFaults} fault(s)</span>}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-blue-600" />
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

function LiveMoney({ value }: { value: number }) {
  const v = useCountUp(value, 1200);
  return <>AED {Math.round(v).toLocaleString("en-US")}</>;
}

function MiniRing({ value }: { value: number }) {
  const r = 16;
  const c = 2 * Math.PI * r;
  const color = value < 0.9 ? "#f43f5e" : value < 0.97 ? "#f59e0b" : "#10b981";
  return (
    <div className="relative h-11 w-11 shrink-0">
      <svg viewBox="0 0 40 40" className="h-full w-full -rotate-90">
        <circle cx="20" cy="20" r={r} fill="none" stroke="#f1f5f9" strokeWidth="4" />
        <circle cx="20" cy="20" r={r} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - Math.min(1, value))} />
      </svg>
      <span className="absolute inset-0 grid place-items-center text-[10px] font-bold tabular-nums text-slate-700">{Math.round(value * 100)}%</span>
    </div>
  );
}

function heatClass(v: number) {
  if (v < 0.85) return "bg-rose-500 text-[#fff]";
  if (v < 0.93) return "bg-rose-200 text-rose-900";
  if (v < 0.98) return "bg-amber-200 text-amber-900";
  if (v < 1.04) return "bg-emerald-200 text-emerald-900";
  return "bg-emerald-500 text-[#fff]";
}

function HeatLegend() {
  const items: Array<[string, string]> = [
    ["<85%", "bg-rose-500"],
    ["<93%", "bg-rose-200"],
    ["<98%", "bg-amber-200"],
    ["on target", "bg-emerald-200"],
    ["ahead", "bg-emerald-500"],
  ];
  return (
    <div className="hidden flex-wrap items-center gap-2 text-[11px] text-slate-500 md:flex">
      {items.map(([l, c]) => (
        <span key={l} className="inline-flex items-center gap-1">
          <span className={cx("h-2.5 w-2.5 rounded-sm", c)} />
          {l}
        </span>
      ))}
    </div>
  );
}

function Legend({ items }: { items: Array<[string, string]> }) {
  return (
    <div className="flex items-center gap-3 text-[12px] text-slate-500">
      {items.map(([l, c]) => (
        <span key={l} className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ background: c }} />
          {l}
        </span>
      ))}
    </div>
  );
}

function groupByCountry<T extends { store: { country: string } }>(list: T[]): Array<[string, T[]]> {
  const m = new Map<string, T[]>();
  for (const p of list) {
    if (!m.has(p.store.country)) m.set(p.store.country, []);
    m.get(p.store.country)!.push(p);
  }
  return [...m.entries()].sort((a, b) => b[1].length - a[1].length);
}

export function describeEvent(e: import("../state").RetailEvent, base: import("../model").RetailBase): string {
  const sku = (k: number) => base.skus[k]?.name ?? `SKU ${k}`;
  const st = (s: number) => base.stores[s]?.id ?? `S${s}`;
  switch (e.type) {
    case "transfer_create":
      return `Transfer ${e.transferId}: ${e.qty} × ${sku(e.skuIdx)} → ${st(e.toStore)}`;
    case "transfer_approve":
      return `Transfer ${e.transferId} approved & dispatched`;
    case "transfer_receive":
      return `Transfer ${e.transferId} received`;
    case "transfer_cancel":
      return `Transfer ${e.transferId} cancelled`;
    case "po_create":
      return `${e.poId} created for ${base.suppliers[e.supplierIdx].name} (${e.lines.length} lines)`;
    case "po_approve":
      return `${e.poId} approved`;
    case "po_receive":
      return `${e.poId} goods received (${e.lines.length} lines)`;
    case "markdown":
      return e.pct ? `${e.pct}% markdown on ${sku(e.skuIdx)} at ${st(e.storeIdx)}` : `Expiring lot ${e.lot} moved from ${st(e.storeIdx)}`;
    case "count_start":
      return `Cycle count ${e.countId} issued: ${sku(e.skuIdx)} at ${st(e.storeIdx)}`;
    case "count_complete":
      return `Cycle count ${e.countId} reconciled (counted ${e.counted})`;
    case "ticket_create":
      return `${e.ticketId} opened for ${e.equipmentId}`;
    case "ticket_assign":
      return `${e.ticketId} assigned to ${e.technician}`;
    case "ticket_status":
      return `${e.ticketId} → ${e.status}`;
    case "alert_status":
      return `Alert ${e.status}${e.note ? `: ${e.note}` : ""}`;
    case "task_status":
      return `Task ${e.taskId} → ${e.status}`;
    case "price_fix":
      return `Shelf price corrected (${e.exceptionId})`;
    case "thresholds":
      return `Thresholds updated`;
  }
}
