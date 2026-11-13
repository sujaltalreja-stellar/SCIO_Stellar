import React, { useMemo, useState } from "react";
import { Area, CartesianGrid, ComposedChart, Line, ReferenceArea, ReferenceLine, ResponsiveContainer, Scatter, Tooltip, XAxis, YAxis } from "recharts";
import { useLocation } from "react-router-dom";
import { HeartPulse, AlarmClock, Wrench, Activity, ClipboardList, CheckCircle2, XCircle, Package } from "lucide-react";
import { useDataset } from "../useDataset";
import { fleetHealth, VIBRATION_ZONES, type AssetHealth } from "../data/assetHealth";
import { axisProps, Badge, C, Card, CardTitle, ChartTooltip, cx, Kpi, num } from "../ui";
import AiExplain from "../components/AiExplain";
import { useApproval } from "../components/Approval";

const STATUS: Record<AssetHealth["status"], { color: string; tone: "bad" | "warn" | "accent" | "good" }> = {
  Critical: { color: C.rose, tone: "bad" },
  "At risk": { color: C.amber, tone: "warn" },
  Watch: { color: C.violet, tone: "accent" },
  Healthy: { color: C.emerald, tone: "good" },
};

const addDays = (iso: string, d: number) => new Date(new Date(iso + "T00:00:00Z").getTime() + d * 86_400_000);
const short = (d: Date) => d.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });

function Gauge({ value, color }: { value: number; color: string }) {
  const r = 46;
  const c = 2 * Math.PI * r;
  const arc = c * 0.75;
  return (
    <svg viewBox="0 0 120 120" className="h-28 w-28">
      <circle cx="60" cy="60" r={r} fill="none" stroke="#e2e8f0" strokeWidth="10" strokeDasharray={`${arc} ${c}`} strokeLinecap="round" transform="rotate(135 60 60)" />
      <circle
        cx="60"
        cy="60"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="10"
        strokeDasharray={`${(arc * value) / 100} ${c}`}
        strokeLinecap="round"
        transform="rotate(135 60 60)"
        style={{ filter: `drop-shadow(0 0 6px ${color})` }}
      />
      <text x="60" y="62" textAnchor="middle" className="fill-slate-900" fontSize="26" fontWeight="600">
        {value}
      </text>
      <text x="60" y="80" textAnchor="middle" fill="#64748b" fontSize="9" letterSpacing="1.5">
        HEALTH
      </text>
    </svg>
  );
}

export default function AssetsPage() {
  const ds = useDataset();
  const { request } = useApproval();
  const fleet = useMemo(() => fleetHealth(ds), [ds]);
  const location = useLocation();
  const [selectedId, setSelectedId] = useState<string>(() => (location.state as { assetId?: string } | null)?.assetId ?? fleet[0].asset.id);
  const [site, setSite] = useState<string>("All sites");
  const [workOrders, setWorkOrders] = useState<Record<string, string>>({});
  const sel = fleet.find((f) => f.asset.id === selectedId) ?? fleet[0];
  const sites = ["All sites", ...Array.from(new Set(ds.assets.map((a) => a.site)))];
  const shown = fleet.filter((f) => site === "All sites" || f.asset.site === site);

  const avgHealth = Math.round(fleet.reduce((s, f) => s + f.healthScore, 0) / fleet.length);
  const alarmsSoon = fleet.filter((f) => f.daysToAlarm !== null && f.daysToAlarm <= 14).length;

  const vibData = useMemo(() => {
    const v = sel.vibration;
    const n = v.series.length;
    const rows = v.series.map((val, i) => ({
      label: short(addDays(ds.anchorDate, i - (n - 1))),
      vibration: val,
      band: [Math.max(0, v.baselineMean - 3 * v.baselineSd), v.baselineMean + 3 * v.baselineSd] as [number, number],
      anomaly: v.anomalies.includes(i) ? val : null,
      projection: null as number | null,
      pressure: sel.pressure ? sel.pressure.series[i] : null,
      pBand: sel.pressure ? ([sel.pressure.baselineMean - 3 * sel.pressure.baselineSd, sel.pressure.baselineMean + 3 * sel.pressure.baselineSd] as [number, number]) : null,
    }));
    if (sel.daysToAlarm && sel.daysToAlarm > 0 && v.slopePerDay > 0) {
      const last = v.series[n - 1];
      rows[n - 1].projection = last;
      const steps = Math.min(sel.daysToAlarm, 30);
      for (let d = 1; d <= steps; d++) {
        rows.push({
          label: short(addDays(ds.anchorDate, d)),
          vibration: null as unknown as number,
          band: rows[0].band,
          anomaly: null,
          projection: Math.round((last + v.slopePerDay * d) * 100) / 100,
          pressure: null,
          pBand: rows[0].pBand,
        });
      }
    }
    return rows;
  }, [sel, ds.anchorDate]);

  const inspections = ds.inspections.filter((i) => i.assetId === sel.asset.id).sort((a, b) => b.date.localeCompare(a.date));
  const parts = ds.items.filter((i) => sel.asset.partIds.includes(i.id));

  const createWO = async () => {
    const rec = await request({
      kind: "Work order",
      title: `Inspect & service ${sel.asset.name}`,
      lines: [
        ["Asset", `${sel.asset.id} · ${sel.asset.site}`],
        ["Priority", sel.status === "Critical" ? "P1 · within 24h" : sel.status === "At risk" ? "P2 · within 72h" : "P3 · next planned window"],
        ["Reason", sel.drivers[0] ?? "Preventive maintenance"],
        ["Parts to reserve", parts.map((p) => p.id).join(", ") || "-"],
        ["Estimated duration", sel.asset.type === "Pump" || sel.asset.type === "Compressor" ? "6 h" : "4 h"],
      ],
      note: "Parts will be reserved in the warehouse and the job scheduled with the maintenance team.",
      confirmLabel: "Approve work order",
    });
    if (rec) setWorkOrders((w) => ({ ...w, [sel.asset.id]: rec.ref }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Asset Health</h1>
          <p className="mt-1.5 text-sm text-slate-500">Vibration and pressure anomaly detection, risk scoring and predicted time to alarm for every machine.</p>
        </div>
        <select value={site} onChange={(e) => setSite(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none">
          {sites.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Fleet health" value={`${avgHealth}/100`} sub={`${fleet.length} monitored assets`} color={C.emerald} icon={<HeartPulse className="h-4 w-4" />} />
        <Kpi
          label="Critical / at risk"
          value={String(fleet.filter((f) => f.status === "Critical" || f.status === "At risk").length)}
          delta={`${fleet.filter((f) => f.status === "Watch").length} on watch`}
          deltaGood={false}
          color={C.rose}
          icon={<Activity className="h-4 w-4" />}
        />
        <Kpi label="Alarm predicted ≤ 14 days" value={String(alarmsSoon)} sub={`ISO limit ${VIBRATION_ZONES.alarm} mm/s`} color={C.amber} icon={<AlarmClock className="h-4 w-4" />} />
        <Kpi label="Overdue maintenance" value={String(fleet.filter((f) => f.daysOverdue > 0).length)} sub="assets past service date" color={C.violet} icon={<Wrench className="h-4 w-4" />} />
      </div>

      {/* Fleet map */}
      <Card>
        <CardTitle
          hint="Each tile is one asset · colour shows status"
          right={
            <div className="hidden gap-3 text-xs text-slate-500 sm:flex">
              {(Object.keys(STATUS) as Array<AssetHealth["status"]>).map((s) => (
                <span key={s} className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ background: STATUS[s].color }} />
                  {s}
                </span>
              ))}
            </div>
          }
        >
          Fleet overview
        </CardTitle>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-8 xl:grid-cols-10">
          {shown.map((f) => (
            <button
              key={f.asset.id}
              onClick={() => setSelectedId(f.asset.id)}
              className={cx(
                "group relative overflow-hidden rounded-xl border p-2.5 text-left transition",
                selectedId === f.asset.id ? "border-slate-200 bg-slate-100" : "border-slate-200 bg-slate-50 hover:border-slate-200"
              )}
            >
              <span className="absolute inset-x-0 top-0 h-[3px]" style={{ background: STATUS[f.status].color, boxShadow: `0 0 12px ${STATUS[f.status].color}` }} />
              <div className="text-xs font-semibold text-slate-900">{f.asset.id}</div>
              <div className="truncate text-[10px] text-slate-500">{f.asset.type}</div>
              <div className="mt-1.5 text-lg font-semibold tabular-nums" style={{ color: STATUS[f.status].color }}>
                {f.healthScore}
              </div>
            </button>
          ))}
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Card glow>
            <div className="flex flex-wrap items-center gap-5">
              <Gauge value={sel.healthScore} color={STATUS[sel.status].color} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-semibold text-slate-900">{sel.asset.name}</h2>
                  <Badge tone={STATUS[sel.status].tone}>{sel.status}</Badge>
                  <Badge>{sel.asset.criticality} criticality</Badge>
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  {sel.asset.site} · installed {sel.asset.installedYear} · {num(sel.asset.runningHours)} running hours
                </p>
                {sel.daysToAlarm !== null && (
                  <p className="mt-2 inline-flex items-center gap-2 rounded-lg bg-rose-50 px-2.5 py-1 text-sm text-rose-600">
                    <AlarmClock className="h-4 w-4" />
                    {sel.daysToAlarm === 0 ? "Vibration is above the alarm limit" : `Vibration projected to reach alarm limit in ${sel.daysToAlarm} days`}
                  </p>
                )}
              </div>
              {workOrders[sel.asset.id] ? (
                <Badge tone="good">{workOrders[sel.asset.id]} scheduled</Badge>
              ) : (
                <button
                  onClick={createWO}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#111113] px-4 py-2 text-sm font-semibold text-[#fff] shadow-sm shadow-blue-600/20 hover:bg-[#2a2a30]"
                >
                  <Wrench className="h-4 w-4" /> Create work order
                </button>
              )}
            </div>

            <div className="mt-6 mb-2 flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-semibold text-slate-900">Vibration · mm/s RMS · 90 days</span>
              <span className="flex flex-wrap gap-3 text-[11px] text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ background: C.cyan }} /> Measured
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-sm" style={{ background: "rgba(139,140,255,0.4)" }} /> Normal range (±3σ)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ background: C.rose }} /> Anomaly
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-0.5 w-3" style={{ background: C.amber }} /> Projection
                </span>
              </span>
            </div>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={vibData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                  <defs>
                    <linearGradient id="vibBand" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={C.indigo} stopOpacity={0.28} />
                      <stop offset="100%" stopColor={C.indigo} stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke={C.grid} />
                  <ReferenceArea y1={VIBRATION_ZONES.acceptable} y2={VIBRATION_ZONES.alarm} fill={C.amber} fillOpacity={0.05} />
                  <ReferenceArea y1={VIBRATION_ZONES.alarm} y2={VIBRATION_ZONES.alarm + 2} fill={C.rose} fillOpacity={0.07} />
                  <XAxis dataKey="label" {...axisProps} minTickGap={36} />
                  <YAxis {...axisProps} width={40} domain={[0, VIBRATION_ZONES.alarm + 1]} />
                  <Tooltip content={<ChartTooltip format={(v) => (Array.isArray(v) ? "" : `${Number(v).toFixed(2)}`)} />} cursor={{ stroke: "rgba(15,23,42,0.15)" }} />
                  <ReferenceLine y={VIBRATION_ZONES.alarm} stroke={C.rose} strokeDasharray="5 4" label={{ value: `Alarm ${VIBRATION_ZONES.alarm}`, fill: C.rose, fontSize: 10, position: "insideTopRight" }} />
                  <ReferenceLine y={VIBRATION_ZONES.acceptable} stroke={C.amber} strokeDasharray="3 4" strokeOpacity={0.6} label={{ value: `Alert ${VIBRATION_ZONES.acceptable}`, fill: C.amber, fontSize: 10, position: "insideTopRight" }} />
                  <Area dataKey="band" name="Normal range" stroke="none" fill="url(#vibBand)" isAnimationActive={false} />
                  <Line dataKey="vibration" name="Vibration" stroke={C.cyan} strokeWidth={2} dot={false} connectNulls={false} />
                  <Line dataKey="projection" name="Projection" stroke={C.amber} strokeWidth={2} strokeDasharray="6 4" dot={false} connectNulls />
                  <Scatter dataKey="anomaly" name="Anomaly" fill={C.rose} shape="circle" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {sel.pressure && (
              <>
                <div className="mt-5 mb-2 text-sm font-semibold text-slate-900">Pressure · bar · 90 days</div>
                <div className="h-[170px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={vibData.slice(0, sel.vibration.series.length)} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                      <CartesianGrid vertical={false} stroke={C.grid} />
                      <XAxis dataKey="label" {...axisProps} minTickGap={36} />
                      <YAxis {...axisProps} width={40} domain={["auto", "auto"]} />
                      <Tooltip content={<ChartTooltip format={(v) => (Array.isArray(v) ? "" : `${Number(v).toFixed(2)}`)} />} cursor={{ stroke: "rgba(15,23,42,0.15)" }} />
                      <Area dataKey="pBand" name="Normal range" stroke="none" fill={C.violet} fillOpacity={0.12} isAnimationActive={false} />
                      <Line dataKey="pressure" name="Pressure" stroke={C.violet} strokeWidth={2} dot={false} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
          </Card>

          <AiExplain kind="asset" id={sel.asset.id} />
        </div>

        <div className="space-y-6">
          <Card>
            <CardTitle hint="Why the score is what it is">Risk drivers</CardTitle>
            {sel.drivers.length ? (
              <ul className="space-y-2">
                {sel.drivers.map((d) => (
                  <li key={d} className="flex gap-2.5 rounded-lg bg-slate-50 p-2.5 text-sm text-slate-600">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: STATUS[sel.status].color }} />
                    {d}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">No risk drivers. Operating within normal limits.</p>
            )}
          </Card>

          <Card>
            <CardTitle hint={`Every ${sel.asset.serviceIntervalDays} days`}>
              <span className="inline-flex items-center gap-2">
                <Wrench className="h-4 w-4 text-slate-500" /> Maintenance
              </span>
            </CardTitle>
            <dl className="space-y-2 text-sm">
              <Row k="Last service" v={sel.asset.lastServiceDate} />
              <Row k="Next service" v={sel.asset.nextServiceDate} alert={sel.daysOverdue > 0 ? `${sel.daysOverdue} d overdue` : undefined} />
            </dl>
          </Card>

          <Card>
            <CardTitle>
              <span className="inline-flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-slate-500" /> Inspection history
              </span>
            </CardTitle>
            <ol className="relative space-y-3 border-l border-slate-200 pl-4">
              {inspections.map((i) => (
                <li key={i.id} className="relative">
                  <span className="absolute -left-[22px] top-0.5 rounded-full bg-white">
                    {i.result === "Pass" ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : <XCircle className="h-3.5 w-3.5 text-rose-500" />}
                  </span>
                  <div className="text-xs text-slate-500">{i.date}</div>
                  <div className={cx("text-sm", i.result === "Pass" ? "text-slate-600" : "text-rose-600")}>{i.finding}</div>
                </li>
              ))}
            </ol>
          </Card>

          <Card>
            <CardTitle hint="Needed for the next service">
              <span className="inline-flex items-center gap-2">
                <Package className="h-4 w-4 text-slate-500" /> Spare parts
              </span>
            </CardTitle>
            <ul className="space-y-2 text-sm">
              {parts.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-2">
                  <span className="min-w-0">
                    <span className="block truncate text-slate-800">{p.name}</span>
                    <span className="text-[11px] text-slate-500">{p.id}</span>
                  </span>
                  <Badge tone={p.stock === 0 ? "bad" : p.stock < p.minStock ? "warn" : "good"}>{p.stock} in stock</Badge>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Row({ k, v, alert }: { k: string; v: string; alert?: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <dt className="text-slate-500">{k}</dt>
      <dd className="flex items-center gap-2 text-slate-900">
        {v}
        {alert && <Badge tone="bad">{alert}</Badge>}
      </dd>
    </div>
  );
}
