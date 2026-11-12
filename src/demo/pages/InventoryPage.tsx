import React, { useEffect, useMemo, useState } from "react";
import { Area, Bar, BarChart, CartesianGrid, ComposedChart, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell, ScatterChart, Scatter, ZAxis } from "recharts";
import { Target, ShoppingCart, Wallet, Layers, AlertTriangle, ClipboardCheck, TrendingUp, TrendingDown } from "lucide-react";
import { useDataset } from "../useDataset";
import { forecastAll, portfolioAccuracy, priceAnomalies, reorderPlan, supplierRisk, type ItemForecast } from "../data/forecast";
import { excessInventory } from "../data/analytics";
import { axisProps, Badge, C, Card, CardTitle, ChartTooltip, cx, Kpi, money, num } from "../ui";
import AiExplain from "../components/AiExplain";
import { Table } from "../components/DataTable";
import { useApproval } from "../components/Approval";

type Tab = "plan" | "excess" | "suppliers" | "prices";
const URGENCY: Record<ItemForecast["urgency"], { label: string; tone: "bad" | "warn" | "accent" | "good" }> = {
  "order-now": { label: "Order now", tone: "bad" },
  "this-week": { label: "This week", tone: "warn" },
  planned: { label: "Planned", tone: "accent" },
  ok: { label: "OK", tone: "good" },
};

const addDays = (iso: string, d: number) => new Date(new Date(iso + "T00:00:00Z").getTime() + d * 86_400_000);
const short = (d: Date) => d.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });

export default function InventoryPage({ mode = "inventory" }: { mode?: "inventory" | "procurement" }) {
  const ds = useDataset();
  const { request } = useApproval();
  const [tab, setTab] = useState<Tab>(mode === "procurement" ? "suppliers" : "plan");
  useEffect(() => setTab(mode === "procurement" ? "suppliers" : "plan"), [mode]);
  const [ordered, setOrdered] = useState<Record<string, string>>({});

  const m = useMemo(() => {
    const plan = reorderPlan(ds);
    const excess = excessInventory(ds);
    return {
      plan,
      accuracy: portfolioAccuracy(ds),
      orderNow: plan.filter((p) => p.urgency === "order-now"),
      spendNext: plan.filter((p) => p.urgency !== "planned").reduce((s, p) => s + p.recommendedCost, 0),
      excess,
      excessValue: excess.reduce((s, e) => s + e.tiedUpValue, 0),
      suppliers: supplierRisk(ds),
      prices: priceAnomalies(ds),
      all: forecastAll(ds),
    };
  }, [ds]);

  const [selectedId, setSelectedId] = useState<string>(() => m.plan[0]?.item.id ?? ds.items[0].id);
  const sel = m.all.find((f) => f.item.id === selectedId) ?? m.all[0];
  const whName = (id: string) => ds.warehouses.find((w) => w.id === id)?.name.split(" · ")[0] ?? id;
  const supName = (id: string) => ds.suppliers.find((s) => s.id === id)?.name ?? id;

  const chart = useMemo(() => {
    const hist = sel.item.dailyUsage.slice(-90).map((v, i) => {
      const d = addDays(ds.anchorDate, i - 89);
      return { label: short(d), actual: v, forecast: null as number | null, band: null as [number, number] | null, stock: null as number | null };
    });
    const fut = sel.forecast.map((f, h) => ({
      label: short(addDays(ds.anchorDate, h + 1)),
      actual: null,
      forecast: Math.round(f * 10) / 10,
      band: [Math.round(sel.lower[h] * 10) / 10, Math.round(sel.upper[h] * 10) / 10] as [number, number],
      stock: sel.projectedStock[h],
    }));
    // Stitch the forecast line onto the last actual point
    const last = hist[hist.length - 1];
    last.forecast = last.actual;
    last.band = [last.actual ?? 0, last.actual ?? 0];
    last.stock = sel.item.stock;
    return [...hist, ...fut];
  }, [sel, ds.anchorDate]);

  const createPR = async (f: ItemForecast) => {
    const rec = await request({
      kind: "Purchase request",
      title: f.item.name,
      lines: [
        ["SKU", f.item.id],
        ["Warehouse", whName(f.item.warehouseId)],
        ["Supplier", supName(f.item.supplierId)],
        ["Quantity", `${num(f.recommendedQty)} units`],
        ["Unit cost", money(f.item.unitCost)],
        ["Total value", money(f.recommendedCost)],
        ["Needed by", f.daysToCritical !== null ? short(addDays(ds.anchorDate, f.daysToCritical)) : "-"],
      ],
      note: "Quantity covers forecast demand over the supplier lead time plus 30 days, including safety stock and units already on order.",
      confirmLabel: "Approve purchase request",
    });
    if (rec) setOrdered((o) => ({ ...o, [f.item.id]: rec.ref }));
  };

  const headline =
    sel.daysToCritical === 0
      ? `${sel.item.name} is already below its minimum stock of ${sel.item.minStock} units${sel.daysToStockout !== null ? ` and is forecast to run out in ${sel.daysToStockout} days` : ""}.`
      : sel.daysToCritical !== null
        ? `Based on 12 months of consumption, ${sel.item.name} is expected to reach critical stock levels in ${sel.daysToCritical} days.`
        : `${sel.item.name} has enough stock for the next 60 days at forecast demand.`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[30px] font-bold tracking-tight text-slate-900">{mode === "procurement" ? "Procurement Intelligence" : "Predictive Inventory"}</h1>
        <p className="mt-1.5 text-[15px] text-slate-600">
          {mode === "procurement"
            ? "Supplier delivery risk, purchase price anomalies and the replenishment orders waiting for approval."
            : "Demand forecasts from 12 months of daily consumption, stockout prediction and what to buy, how much and when."}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <Kpi label="Forecast accuracy" value={`${(m.accuracy * 100).toFixed(1)}%`} sub="28-day back-test" color={C.emerald} icon={<Target className="h-4 w-4" />} />
        <Kpi label="Order now" value={String(m.orderNow.length)} delta={`${m.plan.length} in plan`} deltaGood={false} color={C.rose} icon={<ShoppingCart className="h-4 w-4" />} />
        <Kpi label="Recommended spend" value={money(m.spendNext, true)} sub="Next 7 days" color={C.indigo} icon={<Wallet className="h-4 w-4" />} />
        <Kpi label="Capital in excess stock" value={money(m.excessValue, true)} sub={`${m.excess.length} SKUs above max`} color={C.amber} icon={<Layers className="h-4 w-4" />} />
        <Kpi
          label="High-risk suppliers"
          value={String(m.suppliers.filter((s) => s.level === "High").length)}
          sub={`of ${m.suppliers.length} active`}
          color={C.violet}
          icon={<AlertTriangle className="h-4 w-4" />}
        />
      </div>

      <div className="flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 p-1 text-sm">
        {(
          [
            ["plan", "Reorder plan"],
            ["excess", "Excess & slow-moving"],
            ["suppliers", "Supplier risk"],
            ["prices", "Price anomalies"],
          ] as const
        )
          .filter(([k]) => (mode === "procurement" ? k === "suppliers" || k === "prices" || k === "plan" : k === "plan" || k === "excess"))
          .map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)} className={cx("shrink-0 rounded-lg px-4 py-2", tab === k ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:text-slate-800")}>
            {label}
          </button>
        ))}
      </div>

      {tab === "plan" && (
        <div className="grid gap-6 xl:grid-cols-5">
          <Card className="xl:col-span-2">
            <CardTitle hint="Sorted by urgency and days until minimum stock">Replenishment priorities</CardTitle>
            <div className="max-h-[760px] space-y-1.5 overflow-y-auto pr-1">
              {m.plan.map((f) => (
                <button
                  key={f.item.id}
                  onClick={() => setSelectedId(f.item.id)}
                  className={cx(
                    "w-full rounded-xl border p-3 text-left transition",
                    selectedId === f.item.id ? "border-blue-200 bg-blue-50" : "border-slate-200 bg-slate-50 hover:border-slate-200 hover:bg-slate-100"
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium text-slate-900">{f.item.name}</span>
                    {ordered[f.item.id] ? <Badge tone="good">{ordered[f.item.id]}</Badge> : <Badge tone={URGENCY[f.urgency].tone}>{URGENCY[f.urgency].label}</Badge>}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-3 text-[11px] text-slate-500">
                    <span>{f.item.id}</span>
                    <span>{whName(f.item.warehouseId)}</span>
                    <span>
                      Stock <span className="text-slate-600">{f.item.stock}</span> / min {f.item.minStock}
                    </span>
                    <span>
                      Order <span className="text-teal-700">{num(f.recommendedQty)}</span>
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          <div className="space-y-6 xl:col-span-3">
            <Card glow>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    {sel.item.id} · {whName(sel.item.warehouseId)} · {sel.item.category}
                  </div>
                  <h2 className="mt-1 text-xl font-semibold text-slate-900">{sel.item.name}</h2>
                </div>
                {ordered[sel.item.id] ? (
                  <Badge tone="good">
                    <ClipboardCheck className="mr-1 h-3 w-3" /> {ordered[sel.item.id]} approved
                  </Badge>
                ) : sel.recommendedQty > 0 ? (
                  <button
                    onClick={() => createPR(sel)}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#2563eb] px-4 py-2 text-sm font-semibold text-[#fff] shadow-sm shadow-blue-600/20 hover:bg-[#1d4ed8]"
                  >
                    <ShoppingCart className="h-4 w-4" /> Create purchase request
                  </button>
                ) : null}
              </div>

              <p className="mt-4 text-[15px] leading-relaxed text-slate-800">
                {headline}{" "}
                {sel.recommendedQty > 0 && (
                  <>
                    Recommended replenishment: <span className="font-semibold text-teal-700">{num(sel.recommendedQty)} units</span> ({money(sel.recommendedCost)})
                    {sel.orderBy && <>, order by <span className="font-semibold text-slate-900">{short(new Date(sel.orderBy + "T00:00:00Z"))}</span></>}.
                  </>
                )}
              </p>

              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Stat label="Avg. daily use (30d)" value={sel.avgDaily30.toFixed(1)} />
                <Stat
                  label="Forecast daily (30d)"
                  value={sel.forecastDaily30.toFixed(1)}
                  extra={
                    <span className={cx("inline-flex items-center gap-0.5 text-[11px]", sel.trendPct > 0 ? "text-rose-600" : "text-emerald-700")}>
                      {sel.trendPct > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {(sel.trendPct * 100).toFixed(0)}%
                    </span>
                  }
                />
                <Stat label="On order" value={num(sel.onOrder)} />
                <Stat label="Model accuracy" value={`${(sel.accuracy * 100).toFixed(0)}%`} />
              </div>

              <div className="mt-6 mb-2 flex flex-wrap gap-4 text-xs text-slate-500">
                <LegendDot color={C.slate} label="Actual daily use" />
                <LegendDot color={C.cyan} label="Forecast" />
                <LegendDot color={C.indigo} label="80% confidence range" />
              </div>
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chart} margin={{ top: 6, right: 6, left: -12, bottom: 0 }}>
                    <defs>
                      <linearGradient id="fcBand" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={C.indigo} stopOpacity={0.35} />
                        <stop offset="100%" stopColor={C.indigo} stopOpacity={0.08} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke={C.grid} />
                    <XAxis dataKey="label" {...axisProps} minTickGap={36} />
                    <YAxis {...axisProps} width={44} />
                    <Tooltip content={<ChartTooltip format={(v) => (Array.isArray(v) ? String(v) : (Math.round(v * 10) / 10).toString())} />} cursor={{ stroke: "rgba(15,23,42,0.15)" }} />
                    <ReferenceLine x={chart[89]?.label} stroke="rgba(15,23,42,0.25)" strokeDasharray="3 3" label={{ value: "Today", fill: "#94a3b8", fontSize: 10, position: "insideTopLeft" }} />
                    <Area dataKey="band" name="Range" stroke="none" fill="url(#fcBand)" connectNulls={false} isAnimationActive={false} />
                    <Bar dataKey="actual" name="Actual" fill={C.slate} fillOpacity={0.55} maxBarSize={4} />
                    <Line dataKey="forecast" name="Forecast" stroke={C.cyan} strokeWidth={2.5} dot={false} connectNulls={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-6 mb-2 flex flex-wrap gap-4 text-xs text-slate-500">
                <LegendDot color={C.amber} label="Projected stock (incl. incoming orders)" />
                <LegendDot color={C.rose} label={`Minimum stock (${sel.item.minStock})`} />
              </div>
              <div className="h-[170px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chart.slice(89)} margin={{ top: 6, right: 6, left: -12, bottom: 0 }}>
                    <defs>
                      <linearGradient id="stockFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={C.amber} stopOpacity={0.35} />
                        <stop offset="100%" stopColor={C.amber} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke={C.grid} />
                    <XAxis dataKey="label" {...axisProps} minTickGap={36} />
                    <YAxis {...axisProps} width={44} />
                    <Tooltip content={<ChartTooltip format={(v) => num(v)} />} cursor={{ stroke: "rgba(15,23,42,0.15)" }} />
                    <ReferenceLine y={sel.item.minStock} stroke={C.rose} strokeDasharray="5 4" />
                    <ReferenceLine y={0} stroke="rgba(15,23,42,0.2)" />
                    <Area dataKey="stock" name="Projected stock" stroke={C.amber} strokeWidth={2.25} fill="url(#stockFill)" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <AiExplain kind="item" id={sel.item.id} />
          </div>
        </div>
      )}

      {tab === "excess" && (
        <div className="grid gap-6 xl:grid-cols-5">
          <Card className="xl:col-span-2">
            <CardTitle hint="Stock above maximum level">Capital tied up by item</CardTitle>
            <div style={{ height: Math.max(220, m.excess.length * 34) }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={m.excess.map((e) => ({ name: e.item.name, value: Math.round(e.tiedUpValue) }))} layout="vertical" margin={{ left: 4, right: 16 }}>
                  <defs>
                    <linearGradient id="exFill" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor={C.amber} stopOpacity={0.5} />
                      <stop offset="100%" stopColor={C.amber} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid horizontal={false} stroke={C.grid} />
                  <XAxis type="number" {...axisProps} tickFormatter={(v) => money(v, true).replace("AED ", "")} />
                  <YAxis type="category" dataKey="name" {...axisProps} width={160} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <Tooltip content={<ChartTooltip format={(v) => money(v)} />} cursor={{ fill: "rgba(59,130,246,0.05)" }} />
                  <Bar dataKey="value" name="Tied up" fill="url(#exFill)" radius={[0, 6, 6, 0]} barSize={14} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card className="xl:col-span-3">
            <CardTitle hint="Candidates for transfer between warehouses, return to supplier or reduced reorders">Excess & slow-moving stock</CardTitle>
            <Table
              head={["Item", "Warehouse", "Excess units", "Days of cover", "Capital tied up"]}
              rows={m.excess.map((e) => [
                <span key="n">
                  <span className="text-slate-900">{e.item.name}</span>
                  <span className="block text-[11px] text-slate-500">{e.item.id}</span>
                </span>,
                whName(e.item.warehouseId),
                num(e.excessUnits),
                Number.isFinite(e.daysOfCover) ? `${num(e.daysOfCover)} d` : "No usage",
                money(e.tiedUpValue),
              ])}
              align={["l", "l", "r", "r", "r"]}
            />
          </Card>
        </div>
      )}

      {tab === "suppliers" && (
        <div className="grid gap-6 xl:grid-cols-5">
          <Card className="xl:col-span-2">
            <CardTitle hint="Bubble size = 12-month spend">On-time rate vs. average delay</CardTitle>
            <div className="h-[340px]">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 16, left: -8, bottom: 8 }}>
                  <CartesianGrid stroke={C.grid} />
                  <XAxis type="number" dataKey="onTime" name="On time" unit="%" domain={[0, 100]} {...axisProps} />
                  <YAxis type="number" dataKey="delay" name="Avg. delay" unit=" d" {...axisProps} width={44} />
                  <ZAxis type="number" dataKey="spend" range={[60, 900]} />
                  <Tooltip
                    cursor={{ strokeDasharray: "3 3" }}
                    content={({ active, payload }) =>
                      active && payload?.length ? (
                        <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-2xl">
                          <div className="font-medium text-slate-900">{payload[0].payload.name}</div>
                          <div className="text-slate-500">
                            {payload[0].payload.onTime}% on time · {payload[0].payload.delay} d delay · {money(payload[0].payload.spend, true)}
                          </div>
                        </div>
                      ) : null
                    }
                  />
                  <Scatter
                    data={m.suppliers.map((s) => ({ name: s.supplier.name, onTime: Math.round(s.onTimeRate * 100), delay: Math.round(s.avgDelayDays * 10) / 10, spend: s.spend, level: s.level }))}
                  >
                    {m.suppliers.map((s) => (
                      <Cell key={s.supplier.id} fill={s.level === "High" ? C.rose : s.level === "Medium" ? C.amber : C.emerald} fillOpacity={0.75} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card className="xl:col-span-3">
            <CardTitle hint="Score combines on-time rate, average delay and delivery variability">Supplier delivery risk</CardTitle>
            <Table
              head={["Supplier", "Risk", "On time", "Avg. delay", "Open POs", "Open value"]}
              rows={m.suppliers.map((s) => [
                <span key="n">
                  <span className="text-slate-900">{s.supplier.name}</span>
                  <span className="block text-[11px] text-slate-500">
                    {s.supplier.country} · {s.supplier.category}
                  </span>
                </span>,
                <span key="r" className="inline-flex items-center gap-2">
                  <span className="font-semibold tabular-nums text-slate-900">{s.riskScore}</span>
                  <Badge tone={s.level === "High" ? "bad" : s.level === "Medium" ? "warn" : "good"}>{s.level}</Badge>
                </span>,
                `${Math.round(s.onTimeRate * 100)}%`,
                `${s.avgDelayDays.toFixed(1)} d`,
                String(s.openOrders),
                money(s.openValue, true),
              ])}
              align={["l", "l", "r", "r", "r", "r"]}
            />
          </Card>
        </div>
      )}

      {tab === "prices" && (
        <Card>
          <CardTitle hint="Purchase orders priced more than 12% above the item's median price">Purchase price anomalies</CardTitle>
          <div className="mb-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Stat label="Flagged purchase orders" value={String(m.prices.length)} />
            <Stat label="Estimated overpayment" value={money(m.prices.reduce((s, p) => s + p.overpaid, 0), true)} />
            <Stat label="Suppliers involved" value={String(new Set(m.prices.map((p) => p.po.supplierId)).size)} />
          </div>
          <Table
            head={["PO", "Item", "Supplier", "Date", "Paid / unit", "Median / unit", "Above median", "Overpaid"]}
            rows={m.prices.map((p) => [
              p.po.id,
              p.item.name,
              p.supplierName,
              p.po.orderDate,
              money(p.po.unitPrice),
              money(p.median),
              <Badge key="d" tone={p.deviation > 0.25 ? "bad" : "warn"}>
                +{(p.deviation * 100).toFixed(0)}%
              </Badge>,
              money(p.overpaid),
            ])}
            align={["l", "l", "l", "l", "r", "r", "r", "r"]}
          />
        </Card>
      )}
    </div>
  );
}

function Stat({ label, value, extra }: { label: string; value: string; extra?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="text-[11px] text-slate-500">{label}</div>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-lg font-semibold tabular-nums text-slate-900">{value}</span>
        {extra}
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="h-2 w-2 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}
