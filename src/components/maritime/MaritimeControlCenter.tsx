"use client";

import {
  AlertTriangle,
  Anchor,
  ArrowUpRight,
  CheckCircle2,
  CircleAlert,
  Fuel,
  PackageSearch,
  ShieldCheck,
  Ship,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  MARITIME_FLEET,
  MARITIME_SUPPLY_ORDERS,
} from "../../config/industries";
import type {
  BunkerLog,
  MarineSafetyDeficiency,
  PortClearance,
  SafetyEquipmentInspection,
} from "../../config/industries";

type MaritimeControlCenterProps = {
  bunkerLogs: BunkerLog[];
  clearances: PortClearance[];
  deficiencies: MarineSafetyDeficiency[];
  safetyInspections: SafetyEquipmentInspection[];
  onNavigate: (tab: string) => void;
  onOpenDeficiency: () => void;
};

const tooltipStyle = {
  backgroundColor: "#0c0e17",
  border: "1px solid #28333d",
  borderRadius: "8px",
  color: "#f5f7fb",
};

const statusColors: Record<string, string> = {
  "At Sea": "#2dd4bf",
  "In Port": "#fbbf24",
  Anchored: "#60a5fa",
  Maintenance: "#fb7185",
};

const severityScore: Record<MarineSafetyDeficiency["severity"], number> = {
  Critical: 46,
  High: 30,
  Medium: 16,
  Low: 8,
};

const severityClass: Record<MarineSafetyDeficiency["severity"], string> = {
  Critical: "text-rose-300 border-rose-500/30 bg-rose-500/10",
  High: "text-orange-300 border-orange-500/30 bg-orange-500/10",
  Medium: "text-amber-300 border-amber-500/30 bg-amber-500/10",
  Low: "text-cyan-300 border-cyan-500/30 bg-cyan-500/10",
};

export default function MaritimeControlCenter({
  bunkerLogs,
  clearances,
  deficiencies,
  safetyInspections,
  onNavigate,
  onOpenDeficiency,
}: MaritimeControlCenterProps) {
  const averageAvailability = Math.round(
    MARITIME_FLEET.reduce((total, vessel) => total + vessel.availabilityPercent, 0) /
      MARITIME_FLEET.length,
  );
  const atSeaCount = MARITIME_FLEET.filter((vessel) => vessel.status === "At Sea").length;
  const criticalDeficiencies = deficiencies.filter(
    (deficiency) => deficiency.severity === "Critical" && deficiency.status !== "Resolved",
  );
  const openDeficiencies = deficiencies.filter((deficiency) => deficiency.status !== "Resolved");
  const dueInspections = safetyInspections.filter((inspection) => inspection.status !== "Passed");
  const supplyRiskOrders = MARITIME_SUPPLY_ORDERS.filter(
    (order) =>
      order.leadTimeDays > 14 ||
      order.status === "Draft" ||
      order.status === "Port Delivery Pending",
  );
  const lowFuelVessels = bunkerLogs.filter(
    (log) => log.mgoROBMetricTons + log.hfoROBMetricTons < 200,
  );
  const clearanceSteps = clearances.reduce(
    (total, clearance) =>
      total +
      Number(clearance.customsCleared) +
      Number(clearance.immigrationCleared) +
      Number(clearance.portAgentNotified) +
      Number(clearance.pilotageRequested),
    0,
  );
  const clearanceReadiness = clearances.length
    ? Math.round((clearanceSteps / (clearances.length * 4)) * 100)
    : 100;
  const inspectionReadiness = safetyInspections.length
    ? Math.round(
        (safetyInspections.filter((inspection) => inspection.status === "Passed").length /
          safetyInspections.length) *
          100,
      )
    : 100;
  const supplyReadiness = Math.round(
    ((MARITIME_SUPPLY_ORDERS.length - supplyRiskOrders.length) /
      MARITIME_SUPPLY_ORDERS.length) *
      100,
  );
  const fleetReadiness = Math.round(
    averageAvailability * 0.45 +
      inspectionReadiness * 0.2 +
      clearanceReadiness * 0.2 +
      supplyReadiness * 0.15,
  );

  const statusData = Object.keys(statusColors).map((status) => ({
    name: status,
    value: MARITIME_FLEET.filter((vessel) => vessel.status === status).length,
    color: statusColors[status],
  }));

  const vesselRiskData = MARITIME_FLEET.map((vessel) => {
    const vesselDeficiencies = deficiencies.filter(
      (deficiency) =>
        deficiency.vesselId === vessel.vesselId && deficiency.status !== "Resolved",
    );
    const fuelLog = bunkerLogs.find((log) => log.vesselId === vessel.vesselId);
    const totalFuel = fuelLog
      ? fuelLog.mgoROBMetricTons + fuelLog.hfoROBMetricTons
      : undefined;
    const statusRisk = vessel.status === "Maintenance" ? 44 : vessel.status === "In Port" ? 10 : 0;
    const fuelRisk = totalFuel === undefined ? 12 : totalFuel < 200 ? 36 : totalFuel < 350 ? 15 : 0;
    const deficiencyRisk = vesselDeficiencies.reduce(
      (total, deficiency) => total + severityScore[deficiency.severity],
      0,
    );

    return {
      name: vessel.vesselName.replace("SCIO ", ""),
      availability: vessel.availabilityPercent,
      exposure: Math.min(100, statusRisk + fuelRisk + deficiencyRisk),
      route: `${vessel.departurePort} - ${vessel.destinationPort}`,
      status: vessel.status,
      eta: vessel.eta,
    };
  });

  const bunkerData = bunkerLogs.map((log) => {
    const vessel = MARITIME_FLEET.find((item) => item.vesselId === log.vesselId);
    return {
      name: vessel?.vesselName.replace("SCIO ", "") ?? log.vesselId,
      mgo: log.mgoROBMetricTons,
      hfo: log.hfoROBMetricTons,
      total: log.mgoROBMetricTons + log.hfoROBMetricTons,
    };
  });

  const supplyData = MARITIME_SUPPLY_ORDERS.map((order) => ({
    name: order.poNumber.replace("MPO-", "PO "),
    leadTime: order.leadTimeDays,
    status: order.status,
    atRisk:
      order.leadTimeDays > 14 ||
      order.status === "Draft" ||
      order.status === "Port Delivery Pending",
  }));

  const actionQueue = [
    ...criticalDeficiencies.map((item) => ({
      key: item.id,
      title: item.title,
      detail: `${item.vesselId} - CAPA due ${item.targetResolutionDate}`,
      category: "Critical CAPA",
      severity: item.severity,
      tab: "compliance",
    })),
    ...lowFuelVessels.map((log) => ({
      key: `fuel-${log.vesselId}`,
      title: "Low bunker reserve",
      detail: `${log.vesselId} has ${log.mgoROBMetricTons + log.hfoROBMetricTons} MT remaining onboard`,
      category: "Fuel risk",
      severity: "High" as const,
      tab: "fleet",
    })),
    ...dueInspections.map((item) => ({
      key: item.equipmentId,
      title: item.name,
      detail: `${item.vesselId} safety inspection is ${item.status.toLowerCase()}`,
      category: "Inspection",
      severity: item.status === "Failed" ? ("Critical" as const) : ("Medium" as const),
      tab: "compliance",
    })),
  ].slice(0, 5);

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-[#071719] via-[#0c0e17] to-[#101322] p-6 shadow-[0_0_50px_rgba(34,211,238,0.08)]">
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-px w-2/3 bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />
        <div className="relative flex flex-col justify-between gap-6 xl:flex-row xl:items-end">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">
              <Anchor className="h-4 w-4" />
              Maritime HQ - Connected Operations
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">Fleet Command Center</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              One operational view across vessel availability, bunker resilience, safety obligations,
              port readiness, and supply-chain exposure.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate("fleet")}
              className="inline-flex items-center gap-2 rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-3.5 py-2 text-xs font-semibold text-cyan-200 transition hover:border-cyan-300/70 hover:bg-cyan-400/15"
            >
              View Fleet Grid <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={onOpenDeficiency}
              className="inline-flex items-center gap-2 rounded-lg border border-rose-400/25 bg-rose-400/10 px-3.5 py-2 text-xs font-semibold text-rose-200 transition hover:border-rose-300/70 hover:bg-rose-400/15"
            >
              <CircleAlert className="h-3.5 w-3.5" /> Report a finding
            </button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {[
          {
            label: "Fleet Readiness",
            value: `${fleetReadiness}%`,
            detail: "Weighted Operating Score",
            icon: ShieldCheck,
            color: "#00ff9d",
            glow: "glow-emerald",
          },
          {
            label: "Fleet Availability",
            value: `${averageAvailability}%`,
            detail: `${atSeaCount} vessels currently at sea`,
            icon: Ship,
            color: "#00f0ff",
            glow: "glow-cyan",
          },
          {
            label: "Critical Actions",
            value: criticalDeficiencies.length + dueInspections.filter((item) => item.status === "Failed").length,
            detail: "CAPA & failed safety checks",
            icon: AlertTriangle,
            color: "#ff0055",
            glow: "glow-crimson",
          },
          {
            label: "Bunker Watch",
            value: lowFuelVessels.length,
            detail: lowFuelVessels.length ? "Vessels below reserve" : "All reported reserves healthy",
            icon: Fuel,
            color: "#f59e0b",
            glow: "glow-amber",
          },
          {
            label: "Supply Exposure",
            value: supplyRiskOrders.length,
            detail: "Orders needing port clearance",
            icon: PackageSearch,
            color: "#a855f7",
            glow: "glow-violet",
          },
        ].map((metric) => {
          const Icon = metric.icon;
          return (
            <article key={metric.label} className={`silver-card p-4 rounded-xl border border-slate-700/60 bg-[#0d1017] shadow-xl relative overflow-hidden transition-all group hover:border-slate-500`}>
              <div className="flex items-start justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 font-mono">{metric.label}</span>
                <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800" style={{ color: metric.color }}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 font-mono text-2xl font-black text-white" style={{ color: metric.color }}>{metric.value}</div>
              <p className="mt-1 text-[11px] text-slate-400 font-mono truncate">{metric.detail}</p>
              <div className="mt-3 w-full bg-slate-900 h-1 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: "85%", backgroundColor: metric.color }} />
              </div>
            </article>
          );
        })}
      </section>

      <section className="grid grid-cols-1 gap-6 2xl:grid-cols-5">
        <article className="2xl:col-span-3 rounded-xl border border-borderMuted bg-panel p-5 shadow-lg shadow-black/10">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-300">Fleet readiness matrix</p>
              <h2 className="mt-1 text-base font-semibold text-textBright">Availability versus operational exposure</h2>
            </div>
            <span className="rounded border border-borderMuted bg-panelLight px-2 py-1 text-[10px] font-mono text-textMuted">LIVE COMMAND VIEW</span>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vesselRiskData} margin={{ top: 8, right: 4, left: -18, bottom: 0 }} barGap={6}>
                <CartesianGrid stroke="#202638" strokeDasharray="3 4" vertical={false} />
                <XAxis dataKey="name" stroke="#7e87a2" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#7e87a2" fontSize={10} domain={[0, 100]} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  cursor={{ fill: "rgba(34, 211, 238, 0.05)" }}
                  formatter={(value, name) => [`${value}%`, name === "availability" ? "Availability" : "Operational exposure"]}
                  labelFormatter={(label) => {
                    const vessel = vesselRiskData.find((item) => item.name === label);
                    return vessel ? `${label} - ${vessel.route}` : label;
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: "11px", color: "#a7b0c3", paddingTop: "12px" }}
                  formatter={(value) => (value === "availability" ? "Availability" : "Operational exposure")}
                />
                <Bar dataKey="availability" fill="#2dd4bf" radius={[5, 5, 0, 0]} maxBarSize={34} />
                <Bar dataKey="exposure" fill="#fb7185" radius={[5, 5, 0, 0]} maxBarSize={34} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="2xl:col-span-2 rounded-xl border border-borderMuted bg-panel p-5 shadow-lg shadow-black/10">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-300">Operating posture</p>
              <h2 className="mt-1 text-base font-semibold text-textBright">Fleet status distribution</h2>
            </div>
            <Anchor className="h-5 w-5 text-cyan-400" />
          </div>
          <div className="relative h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${value} vessel${Number(value) === 1 ? "" : "s"}`, "Count"]} />
                <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={88} paddingAngle={4} stroke="none">
                  {statusData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pt-2">
              <span className="font-mono text-3xl font-semibold text-white">{MARITIME_FLEET.length}</span>
              <span className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Vessels</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {statusData.map((item) => (
              <div key={item.name} className="flex items-center justify-between rounded-md bg-panelLight/60 px-2.5 py-2 text-xs">
                <span className="flex items-center gap-2 text-textMuted"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />{item.name}</span>
                <span className="font-mono font-semibold text-textBright">{item.value}</span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <article className="rounded-xl border border-borderMuted bg-panel p-5 shadow-lg shadow-black/10">
          <div className="mb-5 flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-300">Bunker resilience</p>
              <h2 className="mt-1 text-base font-semibold text-textBright">Fuel remaining onboard by vessel</h2>
            </div>
            <button onClick={() => onNavigate("fleet")} className="text-xs font-semibold text-cyan-300 hover:text-cyan-200">Open fuel log</button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={bunkerData} margin={{ top: 5, right: 0, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="mgoFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.42} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="hfoFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.34} />
                    <stop offset="95%" stopColor="#fbbf24" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#202638" strokeDasharray="3 4" vertical={false} />
                <XAxis dataKey="name" stroke="#7e87a2" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#7e87a2" fontSize={10} tickLine={false} axisLine={false} unit=" MT" />
                <Tooltip contentStyle={tooltipStyle} formatter={(value, name) => [`${value} MT`, String(name).toUpperCase()]} />
                <Legend wrapperStyle={{ fontSize: "11px", color: "#a7b0c3", paddingTop: "8px" }} />
                <Area type="monotone" dataKey="hfo" name="HFO" stroke="#fbbf24" fill="url(#hfoFill)" strokeWidth={2} />
                <Area type="monotone" dataKey="mgo" name="MGO" stroke="#38bdf8" fill="url(#mgoFill)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Reserve threshold: <span className="font-mono text-amber-300">200 MT</span>. {lowFuelVessels.length ? `${lowFuelVessels.length} vessel requires replenishment planning.` : "All reported bunker reserves are above threshold."}
          </p>
        </article>

        <article className="rounded-xl border border-borderMuted bg-panel p-5 shadow-lg shadow-black/10">
          <div className="mb-5 flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-violet-300">Supply-chain exposure</p>
              <h2 className="mt-1 text-base font-semibold text-textBright">Marine order lead-time watch</h2>
            </div>
            <button onClick={() => onNavigate("supply")} className="text-xs font-semibold text-cyan-300 hover:text-cyan-200">Open procurement</button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={supplyData} layout="vertical" margin={{ top: 0, right: 18, left: 18, bottom: 0 }}>
                <CartesianGrid stroke="#202638" strokeDasharray="3 4" horizontal={false} />
                <XAxis type="number" stroke="#7e87a2" fontSize={10} tickLine={false} axisLine={false} unit=" d" />
                <YAxis type="category" dataKey="name" stroke="#7e87a2" fontSize={10} width={48} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${value} days`, "Lead time"]} />
                <Bar dataKey="leadTime" radius={[0, 5, 5, 0]} maxBarSize={22}>
                  {supplyData.map((entry) => (
                    <Cell key={entry.name} fill={entry.atRisk ? "#fb7185" : "#a78bfa"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
            <span>Orders at risk: <strong className="font-mono text-rose-300">{supplyRiskOrders.length}</strong></span>
            <span>Clearance readiness: <strong className="font-mono text-cyan-300">{clearanceReadiness}%</strong></span>
          </div>
        </article>
      </section>

      <section className="grid grid-cols-1 gap-6 2xl:grid-cols-5">
        <article className="2xl:col-span-3 rounded-xl border border-borderMuted bg-panel p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-rose-300">Priority response queue</p>
              <h2 className="mt-1 text-base font-semibold text-textBright">Events requiring operational ownership</h2>
            </div>
            <button onClick={onOpenDeficiency} className="inline-flex items-center gap-1.5 rounded border border-borderMuted bg-panelLight px-3 py-1.5 text-xs font-semibold text-textBright hover:border-cyan-400/50">
              <CircleAlert className="h-3.5 w-3.5 text-cyan-300" /> New finding
            </button>
          </div>
          <div className="space-y-2">
            {actionQueue.length ? actionQueue.map((action) => (
              <button
                key={action.key}
                onClick={() => onNavigate(action.tab)}
                className="group flex w-full items-center gap-3 rounded-lg border border-borderMuted/80 bg-panelLight/40 px-3.5 py-3 text-left transition hover:border-cyan-400/35 hover:bg-panelLight"
              >
                <span className={`rounded border px-2 py-0.5 text-[10px] font-bold uppercase ${severityClass[action.severity]}`}>{action.severity}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-textBright">{action.title}</span>
                  <span className="mt-0.5 block truncate text-xs text-textMuted">{action.category} - {action.detail}</span>
                </span>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-textMuted transition group-hover:text-cyan-300" />
              </button>
            )) : (
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-5 text-sm text-emerald-200">
                <CheckCircle2 className="mr-2 inline h-4 w-4" /> No critical maritime events require intervention.
              </div>
            )}
          </div>
        </article>

        <article className="2xl:col-span-2 rounded-xl border border-borderMuted bg-panel p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300">Connected operational chain</p>
          <h2 className="mt-1 text-base font-semibold text-textBright">From vessel event to action</h2>
          <div className="mt-5 space-y-3">
            {[
              ["01", "Vessel & asset", `${MARITIME_FLEET.length} vessels monitored`, "fleet"],
              ["02", "Safety & compliance", `${openDeficiencies.length} open findings / ${dueInspections.length} due`, "compliance"],
              ["03", "Maintenance", "Dispatch corrective work and crew", "work-orders"],
              ["04", "MRO & supply", `${supplyRiskOrders.length} orders need attention`, "supply"],
            ].map(([step, label, detail, tab]) => (
              <button key={step} onClick={() => onNavigate(tab)} className="flex w-full items-center gap-3 rounded-lg border border-borderMuted/60 bg-panelLight/30 p-3 text-left transition hover:border-emerald-400/35 hover:bg-panelLight">
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-emerald-400/25 bg-emerald-400/10 font-mono text-xs font-bold text-emerald-300">{step}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-textBright">{label}</span>
                  <span className="block truncate text-xs text-textMuted">{detail}</span>
                </span>
                <ArrowUpRight className="h-4 w-4 text-textMuted" />
              </button>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
