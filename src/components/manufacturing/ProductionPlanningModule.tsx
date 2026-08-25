"use client";

import React, { useState } from "react";
import {
  Calendar,
  Clock,
  Layers,
  AlertTriangle,
  Play,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Sliders,
  ChevronRight,
  Sparkles,
  RefreshCw,
  Plus,
  BarChart3,
  Flame
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";

interface WorkOrderJob {
  id: string;
  orderNumber: string;
  customer: string;
  product: string;
  line: string;
  shift: string;
  startTime: string;
  endTime: string;
  quantity: number;
  completedQuantity: number;
  status: "In Progress" | "Scheduled" | "Changeover" | "Completed" | "Delayed";
  priority: "Critical" | "High" | "Normal";
  changeoverMins: number;
}

const INITIAL_JOBS: WorkOrderJob[] = [
  {
    id: "job-101",
    orderNumber: "WO-9842",
    customer: "Tesla Gigafactory",
    product: "Lithium-Ion 800V Module B2",
    line: "Line A1 (Laser Welding)",
    shift: "Shift 1 (06:00 - 14:00)",
    startTime: "06:00",
    endTime: "11:30",
    quantity: 480,
    completedQuantity: 360,
    status: "In Progress",
    priority: "Critical",
    changeoverMins: 25,
  },
  {
    id: "job-102",
    orderNumber: "WO-9843",
    customer: "Rivian Automotive",
    product: "Pack Busbar Sub-Assembly",
    line: "Line A1 (Laser Welding)",
    shift: "Shift 1 (06:00 - 14:00)",
    startTime: "12:00",
    endTime: "14:00",
    quantity: 220,
    completedQuantity: 0,
    status: "Scheduled",
    priority: "High",
    changeoverMins: 30,
  },
  {
    id: "job-103",
    orderNumber: "WO-9844",
    customer: "Rolls-Royce Aerospace",
    product: "Turbine Impeller Ti-6Al-4V",
    line: "Line B2 (5-Axis CNC)",
    shift: "Shift 1 (06:00 - 14:00)",
    startTime: "06:00",
    endTime: "13:30",
    quantity: 120,
    completedQuantity: 94,
    status: "In Progress",
    priority: "Critical",
    changeoverMins: 45,
  },
  {
    id: "job-104",
    orderNumber: "WO-9845",
    customer: "Siemens Energy",
    product: "Inverter Power Control PCB v3",
    line: "Line C3 (SMT Assembly)",
    shift: "Shift 1 (06:00 - 14:00)",
    startTime: "06:00",
    endTime: "14:00",
    quantity: 1600,
    completedQuantity: 1540,
    status: "In Progress",
    priority: "Normal",
    changeoverMins: 15,
  },
  {
    id: "job-105",
    orderNumber: "WO-9846",
    customer: "Schneider Electric",
    product: "Finished Assembly Unit Audit",
    line: "Line D4 (Vision QA)",
    shift: "Shift 1 (06:00 - 14:00)",
    startTime: "06:00",
    endTime: "14:00",
    quantity: 1200,
    completedQuantity: 1180,
    status: "In Progress",
    priority: "Normal",
    changeoverMins: 10,
  },
  {
    id: "job-106",
    orderNumber: "WO-9847",
    customer: "Lockheed Martin",
    product: "Titanium Bracket Stator",
    line: "Line B2 (5-Axis CNC)",
    shift: "Shift 2 (14:00 - 22:00)",
    startTime: "14:00",
    endTime: "21:30",
    quantity: 85,
    completedQuantity: 0,
    status: "Scheduled",
    priority: "High",
    changeoverMins: 40,
  },
];

const CAPACITY_DATA = [
  { line: "Line A1", plannedHours: 7.5, maxHours: 8.0, utilization: 93.8, bottleneckRisk: "Low" },
  { line: "Line B2", plannedHours: 7.9, maxHours: 8.0, utilization: 98.7, bottleneckRisk: "High" },
  { line: "Line C3", plannedHours: 7.2, maxHours: 8.0, utilization: 90.0, bottleneckRisk: "Low" },
  { line: "Line D4", plannedHours: 7.0, maxHours: 8.0, utilization: 87.5, bottleneckRisk: "Low" },
];

export function ProductionPlanningModule() {
  const [jobs, setJobs] = useState<WorkOrderJob[]>(INITIAL_JOBS);
  const [selectedShift, setSelectedShift] = useState<"All" | "Shift 1" | "Shift 2" | "Shift 3">("All");
  const [whatIfDelayMins, setWhatIfDelayMins] = useState(25);
  const [optimizedSequenceApplied, setOptimizedSequenceApplied] = useState(false);

  const filteredJobs = selectedShift === "All"
    ? jobs
    : jobs.filter(j => j.shift.includes(selectedShift));

  const totalPlannedUnits = jobs.reduce((acc, j) => acc + j.quantity, 0);
  const totalCompletedUnits = jobs.reduce((acc, j) => acc + j.completedQuantity, 0);

  const handleApplyOptimization = () => {
    setOptimizedSequenceApplied(true);
    // Sort jobs to minimize changeovers
    setJobs(prev => [...prev].sort((a, b) => a.changeoverMins - b.changeoverMins));
  };

  return (
    <div className="space-y-6">
      {/* ==================== 1. HEADER BANNER ==================== */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-panel p-6 shadow-2xs">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400 font-mono">
              <Calendar className="h-4 w-4" /> Production Planning &amp; Scheduling Engine
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
              Plan ➔ Schedule ➔ Allocate ➔ Execute
            </h1>
            <p className="mt-1 text-sm text-slate-700 dark:text-slate-300 font-medium">
              Dynamic capacity loading, job sequencing, changeover optimization, and real-time bottleneck detection.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleApplyOptimization}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-mono font-bold shadow-xs transition-all ${
                optimizedSequenceApplied
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>{optimizedSequenceApplied ? "AI Sequence Optimized (-2.4h)" : "Optimize Job Sequence"}</span>
            </button>
          </div>
        </div>
      </section>

      {/* ==================== 2. KPI METRICS STRIP ==================== */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 dark:border-borderMuted bg-white dark:bg-panel p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-bold uppercase text-slate-700 dark:text-slate-400 font-mono">
            <span>Capacity Utilization</span>
            <Layers className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-950 dark:text-white">92.5%</div>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 font-medium">30.6 / 32.0 Planned Line Hours</p>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-borderMuted bg-white dark:bg-panel p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-bold uppercase text-slate-700 dark:text-slate-400 font-mono">
            <span>Active Work Orders</span>
            <Clock className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-950 dark:text-white">
            {jobs.filter(j => j.status === "In Progress").length} <span className="text-sm font-normal text-slate-500">/ {jobs.length} Total</span>
          </div>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 font-medium">{totalCompletedUnits.toLocaleString()} / {totalPlannedUnits.toLocaleString()} Units Produced</p>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-borderMuted bg-white dark:bg-panel p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-bold uppercase text-slate-700 dark:text-slate-400 font-mono">
            <span>Changeover Overhead</span>
            <RefreshCw className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-950 dark:text-white">120 min</div>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 font-medium">4 Scheduled Line Retoolings</p>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-borderMuted bg-white dark:bg-panel p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-bold uppercase text-slate-700 dark:text-slate-400 font-mono">
            <span>Bottleneck Risk</span>
            <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-rose-700 dark:text-rose-400">Line B2 (98.7%)</div>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 font-medium">CNC Impeller Milling Near Limit</p>
        </div>
      </section>

      {/* ==================== 3. GANTT JOB SEQUENCING & CAPACITY LOADING ==================== */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Left: Job Sequencing Table & Gantt */}
        <div className="xl:col-span-2 rounded-xl border border-slate-200 dark:border-borderMuted bg-white dark:bg-panel p-5 shadow-2xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-borderMuted pb-3">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider font-mono text-slate-950 dark:text-white flex items-center gap-2">
                <Layers className="h-4 w-4 text-amber-600 dark:text-amber-400" /> Visual Job Sequencing Schedule
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">Shift allocation and job sequence timeline</p>
            </div>

            {/* Shift filter tabs */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
              {(["All", "Shift 1", "Shift 2", "Shift 3"] as const).map(shift => (
                <button
                  key={shift}
                  onClick={() => setSelectedShift(shift)}
                  className={`px-2.5 py-1 text-xs font-mono font-bold rounded transition-all ${
                    selectedShift === shift
                      ? "bg-white dark:bg-slate-700 text-slate-950 dark:text-white shadow-2xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white"
                  }`}
                >
                  {shift}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredJobs.map(job => {
              const progressPct = Math.round((job.completedQuantity / job.quantity) * 100);
              return (
                <div
                  key={job.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/50 hover:border-slate-400 dark:hover:border-slate-700 transition-all space-y-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-950 dark:text-white">{job.orderNumber}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-300 font-bold">
                          {job.customer}
                        </span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase border ${
                          job.priority === "Critical"
                            ? "bg-rose-100 text-rose-950 border-rose-300 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800"
                            : "bg-amber-100 text-amber-950 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800"
                        }`}>
                          {job.priority}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-950 dark:text-white mt-1">{job.product}</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 font-mono mt-0.5">
                        {job.line} • {job.startTime} - {job.endTime} ({job.shift.split(" ")[0]})
                      </p>
                    </div>

                    <div className="text-right font-mono">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase border ${
                        job.status === "In Progress"
                          ? "bg-emerald-100 text-emerald-950 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800"
                          : "bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                      }`}>
                        {job.status}
                      </span>
                      <span className="block text-xs font-bold text-slate-950 dark:text-slate-200 mt-1.5">
                        {job.completedQuantity} / {job.quantity} units
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-slate-600 dark:text-slate-400">Completion Progress:</span>
                      <span className="text-slate-950 dark:text-white font-bold">{progressPct}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 rounded-full transition-all"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Capacity Loading & What-If Simulator */}
        <div className="space-y-6">
          {/* Capacity Loading Chart */}
          <div className="rounded-xl border border-slate-200 dark:border-borderMuted bg-white dark:bg-panel p-5 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-slate-950 dark:text-white flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Line Capacity Loading (Hours)
            </h3>

            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={CAPACITY_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
                  <XAxis dataKey="line" fontSize={11} stroke="#64748b" tickLine={false} />
                  <YAxis fontSize={11} stroke="#64748b" domain={[0, 8.5]} tickLine={false} unit="h" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", color: "#f8fafc", borderRadius: "8px", fontSize: "11px" }}
                    formatter={(val) => [`${val} Hours (Max 8.0h)`, "Scheduled Loading"]}
                  />
                  <Bar dataKey="plannedHours" radius={[4, 4, 0, 0]}>
                    {CAPACITY_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.bottleneckRisk === "High" ? "#f43f5e" : "#10b981"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              {CAPACITY_DATA.map(c => (
                <div key={c.line} className="flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-700 dark:text-slate-300 font-bold">{c.line}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    c.bottleneckRisk === "High"
                      ? "bg-rose-100 text-rose-950 dark:bg-rose-950 dark:text-rose-300"
                      : "bg-emerald-100 text-emerald-950 dark:bg-emerald-950 dark:text-emerald-300"
                  }`}>
                    {c.utilization}% Loading
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Schedule What-If Simulator */}
          <div className="rounded-xl border border-slate-200 dark:border-borderMuted bg-white dark:bg-panel p-5 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-slate-950 dark:text-white flex items-center gap-2">
              <Sliders className="h-4 w-4 text-amber-600 dark:text-amber-400" /> Schedule What-If Simulator
            </h3>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-700 dark:text-slate-300 font-medium">Simulate Line B2 Changeover Delay:</span>
                  <span className="font-bold text-slate-950 dark:text-white">+{whatIfDelayMins} mins</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="60"
                  step="5"
                  value={whatIfDelayMins}
                  onChange={(e) => setWhatIfDelayMins(Number(e.target.value))}
                  className="w-full mt-2 accent-amber-600"
                />
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg text-xs font-mono space-y-1">
                <div className="font-bold text-amber-950 dark:text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-600" /> AI Schedule Impact Recommendation:
                </div>
                <p className="text-slate-700 dark:text-slate-300">
                  {whatIfDelayMins > 20
                    ? `A ${whatIfDelayMins}m delay will push WO-9847 into Shift 3. Re-route 40 units of Titanium Bracket to CNC Line B1 to preserve delivery SLA.`
                    : `Schedule buffer absorbs the ${whatIfDelayMins}m delay with 0 delivery slippage.`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
