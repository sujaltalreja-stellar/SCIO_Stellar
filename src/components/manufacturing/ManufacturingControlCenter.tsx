"use client";

import React, { useState, useEffect } from "react";
import {
  Factory,
  Cpu,
  Gauge,
  Activity,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Wrench,
  Scan,
  Zap,
  Flame,
  Layers,
  ArrowUpRight,
  ShieldAlert,
  Play,
  Pause,
  RefreshCw,
  Sliders,
  Radio,
  Eye,
  SlidersHorizontal,
  Package,
  Clock,
  Sparkles
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
  PieChart,
  Pie
} from "recharts";

interface ManufacturingControlCenterProps {
  onNavigate: (tab: string) => void;
  onCreateWorkOrder: (title: string, assetId: string, priority: string) => void;
}

export default function ManufacturingControlCenter({
  onNavigate,
  onCreateWorkOrder,
}: ManufacturingControlCenterProps) {
  const [selectedLineId, setSelectedLineId] = useState<string>("line-01");
  const [simulationActive, setSimulationActive] = useState<boolean>(true);
  const [selectedDefectId, setSelectedDefectId] = useState<string | null>("def-v01");

  // Real-time production telemetry state
  const [productionLines, setProductionLines] = useState([
    {
      id: "line-01",
      name: "Line A1 - EV Battery Module Laser Welding",
      type: "Robotic Assembly Cell",
      status: "Running",
      currentProduct: "Lithium-Ion 800V Module B2",
      taktTimeSec: 40.0,
      actualCycleTimeSec: 42.1,
      targetUnitsShift: 480,
      actualUnitsShift: 412,
      scrapUnits: 4,
      availabilityPercent: 94.2,
      performancePercent: 88.5,
      qualityPercent: 99.0,
      activeAlarms: 0,
      robotModel: "FANUC M-20iA / Trumpf 6kW TruDisk",
      spindleTemp: 44.2,
      hydraulicPressureBar: 184.2,
      vibrationMmSec: 1.42,
    },
    {
      id: "line-02",
      name: "Line B2 - 5-Axis Precision Aerospace CNC",
      type: "High-Precision Milling",
      status: "Warning",
      currentProduct: "Turbine Impeller Ti-6Al-4V",
      taktTimeSec: 180.0,
      actualCycleTimeSec: 198.5,
      targetUnitsShift: 120,
      actualUnitsShift: 98,
      scrapUnits: 2,
      availabilityPercent: 86.4,
      performancePercent: 82.1,
      qualityPercent: 98.0,
      activeAlarms: 1,
      robotModel: "Hermle C42U 5-Axis / Renishaw Probe",
      spindleTemp: 58.6,
      hydraulicPressureBar: 172.5,
      vibrationMmSec: 2.38,
    },
    {
      id: "line-03",
      name: "Line C3 - High-Speed SMT Electronics Assembly",
      type: "SMT & Reflow Line",
      status: "Running",
      currentProduct: "Inverter Power Control PCB v3",
      taktTimeSec: 12.0,
      actualCycleTimeSec: 11.8,
      targetUnitsShift: 1600,
      actualUnitsShift: 1540,
      scrapUnits: 8,
      availabilityPercent: 98.1,
      performancePercent: 96.4,
      qualityPercent: 99.5,
      activeAlarms: 0,
      robotModel: "Yamaha YSM20R (45,000 CPH) / Heller 1913",
      spindleTemp: 36.5,
      hydraulicPressureBar: 6.2,
      vibrationMmSec: 0.62,
    },
    {
      id: "line-04",
      name: "Line D4 - Automated Vision QA & Sorting Cell",
      type: "Inspection & Palletizing",
      status: "Running",
      currentProduct: "Finished Assembly Unit Audit",
      taktTimeSec: 15.0,
      actualCycleTimeSec: 14.9,
      targetUnitsShift: 1200,
      actualUnitsShift: 1180,
      scrapUnits: 12,
      availabilityPercent: 96.8,
      performancePercent: 94.2,
      qualityPercent: 98.9,
      activeAlarms: 0,
      robotModel: "KUKA KR CYBERTECH / Cognex AI Vision",
      spindleTemp: 32.1,
      hydraulicPressureBar: 8.5,
      vibrationMmSec: 0.88,
    },
  ]);

  // Live PLC Tag Stream
  const [plcTags, setPlcTags] = useState([
    { tag: "DB10.DBD14", label: "Spindle Drive Velocity", value: 14250, unit: "RPM", status: "Optimal", min: 0, max: 18000 },
    { tag: "DB22.DBD08", label: "Main Spindle Bearing Temp", value: 58.6, unit: "°C", status: "Warning", min: 20, max: 80 },
    { tag: "DB14.DBD32", label: "FFT Vibration Velocity (RMS)", value: 2.38, unit: "mm/s", status: "Warning", min: 0, max: 4.5 },
    { tag: "DB08.DBD04", label: "Hydraulic Chuck Pressure", value: 184.2, unit: "Bar", status: "Optimal", min: 100, max: 250 },
    { tag: "DB30.DBD16", label: "Servo Feed Rate Axis-Z", value: 1240, unit: "mm/min", status: "Optimal", min: 0, max: 2000 },
    { tag: "DB04.DBD02", label: "3-Phase Power Active Load", value: 48.6, unit: "kW", status: "Optimal", min: 10, max: 75 },
  ]);

  // Real-time Trend Series
  const [telemetryHistory, setTelemetryHistory] = useState([
    { time: "09:00", oee: 84.2, throughput: 380, vibration: 1.2, power: 42 },
    { time: "09:30", oee: 86.1, throughput: 395, vibration: 1.3, power: 44 },
    { time: "10:00", oee: 88.4, throughput: 410, vibration: 1.4, power: 46 },
    { time: "10:30", oee: 82.0, throughput: 360, vibration: 2.1, power: 49 },
    { time: "11:00", oee: 79.5, throughput: 345, vibration: 2.4, power: 51 },
    { time: "11:30", oee: 85.3, throughput: 405, vibration: 1.8, power: 47 },
    { time: "12:00", oee: 87.2, throughput: 418, vibration: 1.5, power: 45 },
  ]);

  // Optical Inspection (AI Vision QA) Feed
  const [visionDefects, setVisionDefects] = useState([
    {
      id: "def-v01",
      timestamp: "12:04:18",
      line: "Line B2",
      component: "Turbine Impeller Vane #4",
      defectType: "Surface Micro-Crack",
      confidence: 98.6,
      severity: "Critical",
      bbox: { x: 38, y: 44, w: 24, h: 18 },
      actionTaken: "Pneumatic Ejector Gate 2 Triggered (Rework Bin)",
      inspectedBatch: "LOT-2026-A488"
    },
    {
      id: "def-v02",
      timestamp: "11:52:05",
      line: "Line C3",
      component: "Inverter PCB - QFP Pin 14-15",
      defectType: "Solder Bridging",
      confidence: 96.2,
      severity: "High",
      bbox: { x: 62, y: 30, w: 16, h: 14 },
      actionTaken: "Automated Laser Desolder Routing Assigned",
      inspectedBatch: "LOT-2026-C102"
    },
    {
      id: "def-v03",
      timestamp: "11:28:44",
      line: "Line A1",
      component: "Battery Busbar Seam #2",
      defectType: "Weld Porosity Discontinuity",
      confidence: 92.4,
      severity: "Medium",
      bbox: { x: 22, y: 68, w: 32, h: 12 },
      actionTaken: "Flagged for Secondary Ultrasonic QA Inspection",
      inspectedBatch: "LOT-2026-B904"
    }
  ]);

  // Tool Wear Countdown Roster
  const [toolingRoster, setToolingRoster] = useState([
    { id: "T-01", name: "Solid Carbide End Mill Ø12mm", line: "Line B2", remainingCycles: 142, maxCycles: 800, wearPercent: 82.2, status: "Replace Soon" },
    { id: "T-02", name: "Laser Optic Protective Lens Kit", line: "Line A1", remainingCycles: 480, maxCycles: 1000, wearPercent: 52.0, status: "Healthy" },
    { id: "T-03", name: "SMT Pick & Place Vacuum Nozzle N4", line: "Line C3", remainingCycles: 2450, maxCycles: 5000, wearPercent: 51.0, status: "Healthy" },
    { id: "T-04", name: "Spot Welding Copper Tip Set", line: "Line A1", remainingCycles: 85, maxCycles: 600, wearPercent: 85.8, status: "Critical Wear" }
  ]);

  // Live simulation ticker
  useEffect(() => {
    if (!simulationActive) return;
    const interval = setInterval(() => {
      // Jiggle PLC tags realistically
      setPlcTags(prev => prev.map(tag => {
        let delta = (Math.random() - 0.5) * (tag.max - tag.min) * 0.02;
        let nextVal = +(Math.min(tag.max, Math.max(tag.min, tag.value + delta))).toFixed(1);
        if (tag.unit === "RPM") nextVal = Math.round(nextVal);
        return {
          ...tag,
          value: nextVal,
        };
      }));

      // Update cycle counts & production
      setProductionLines(prev => prev.map(line => {
        const partsDelta = Math.random() > 0.6 ? 1 : 0;
        return {
          ...line,
          actualUnitsShift: line.actualUnitsShift + partsDelta,
          actualCycleTimeSec: +(line.taktTimeSec + (Math.random() - 0.5) * 3).toFixed(1),
          spindleTemp: +(line.spindleTemp + (Math.random() - 0.5) * 0.4).toFixed(1),
          vibrationMmSec: +(Math.max(0.2, line.vibrationMmSec + (Math.random() - 0.5) * 0.06)).toFixed(2)
        };
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, [simulationActive]);

  const selectedLine = productionLines.find(l => l.id === selectedLineId) || productionLines[0];

  // Calculate Overall Portfolio OEE
  const avgAvailability = Math.round(productionLines.reduce((acc, l) => acc + l.availabilityPercent, 0) / productionLines.length);
  const avgPerformance = Math.round(productionLines.reduce((acc, l) => acc + l.performancePercent, 0) / productionLines.length);
  const avgQuality = Math.round(productionLines.reduce((acc, l) => acc + l.qualityPercent, 0) / productionLines.length);
  const overallOEE = Math.round((avgAvailability * avgPerformance * avgQuality) / 10000);

  const totalActualUnits = productionLines.reduce((acc, l) => acc + l.actualUnitsShift, 0);
  const totalTargetUnits = productionLines.reduce((acc, l) => acc + l.targetUnitsShift, 0);
  const totalScrapUnits = productionLines.reduce((acc, l) => acc + l.scrapUnits, 0);
  const overallScrapRate = +((totalScrapUnits / (totalActualUnits || 1)) * 100).toFixed(2);

  // Six Big Losses Breakdown data with cumulative Pareto calculation
  const rawLosses = [
    { name: "Unplanned Breakdown", category: "Availability Loss", lossHours: 4.2, costDollars: 12600, color: "#ff0055", icon: "🚨" },
    { name: "Setup & Tool Change", category: "Availability Loss", lossHours: 2.8, costDollars: 8400, color: "#f97316", icon: "🔧" },
    { name: "Idling & Micro-Stops", category: "Performance Loss", lossHours: 2.1, costDollars: 6300, color: "#f59e0b", icon: "⏱️" },
    { name: "Reduced Cycle Speed", category: "Performance Loss", lossHours: 1.6, costDollars: 4800, color: "#3b82f6", icon: "📉" },
    { name: "Process Defects & Scrap", category: "Quality Loss", lossHours: 1.1, costDollars: 3300, color: "#a855f7", icon: "🔬" },
    { name: "Startup Yield Loss", category: "Quality Loss", lossHours: 0.5, costDollars: 1500, color: "#64748b", icon: "♻️" },
  ];

  const totalLossHours = rawLosses.reduce((acc, l) => acc + l.lossHours, 0);
  let cumulativeSum = 0;
  const sixLossesData = rawLosses.map((l) => {
    cumulativeSum += l.lossHours;
    return {
      ...l,
      cumulativePercent: Math.round((cumulativeSum / totalLossHours) * 100),
    };
  });

  const selectedDefect = visionDefects.find(d => d.id === selectedDefectId) || visionDefects[0];

  return (
    <div className="space-y-6">
      {/* ==================== 1. EXECUTIVE HERO COMMAND BANNER ==================== */}
      <section className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-panel to-slate-900/10 dark:from-[#1b1407] dark:via-[#11141f] dark:to-[#090b10] p-6 shadow-sm">
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/4 h-px w-1/2 bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />
        
        <div className="relative flex flex-col justify-between gap-6 xl:flex-row xl:items-end">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-amber-700 dark:text-amber-400 font-mono">
              <Factory className="h-4 w-4" />
              Smart Manufacturing 4.0 - Digital Shopfloor Hub
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Production Execution & OEE Control Center
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Live SCADA PLC tag acquisition, ISO 22400 OEE performance analytics, computer vision defect inspection, and tooling wear prediction.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setSimulationActive(!simulationActive)}
              className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-semibold shadow-sm transition-all ${
                simulationActive
                  ? "border-emerald-400/40 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                  : "border-amber-400/40 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300"
              }`}
            >
              {simulationActive ? <Pause className="h-3.5 w-3.5 animate-pulse" /> : <Play className="h-3.5 w-3.5" />}
              <span>{simulationActive ? "PLC Telemetry Streaming" : "Simulation Paused"}</span>
            </button>

            <button
              onClick={() => onCreateWorkOrder("Emergency Tooling Changeover", selectedLine.robotModel, "Critical")}
              className="inline-flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3.5 py-2 text-xs font-semibold text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 shadow-sm transition-all"
            >
              <Wrench className="h-3.5 w-3.5" /> Dispatch Line WO
            </button>
          </div>
        </div>
      </section>

      {/* ==================== 2. REAL-TIME OEE & PRODUCTION KPI STRIP ==================== */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {/* OVERALL OEE SCORE */}
        <article className="rounded-xl border border-amber-500/30 bg-panel p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-start justify-between">
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Overall Plant OEE</span>
            <Gauge className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-slate-900 dark:text-white">{overallOEE}%</span>
            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 font-mono">World Class: 85%</span>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-1 text-[10px] font-mono text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div><span className="block text-slate-400">Avail:</span> <strong className="text-slate-800 dark:text-slate-200">{avgAvailability}%</strong></div>
            <div><span className="block text-slate-400">Perf:</span> <strong className="text-slate-800 dark:text-slate-200">{avgPerformance}%</strong></div>
            <div><span className="block text-slate-400">Qual:</span> <strong className="text-slate-800 dark:text-slate-200">{avgQuality}%</strong></div>
          </div>
        </article>

        {/* SHIFT OUTPUT VS TARGET */}
        <article className="rounded-xl border border-borderMuted bg-panel p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Shift Output Yield</span>
            <Package className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-3 font-mono text-2xl font-bold text-slate-900 dark:text-white">
            {totalActualUnits.toLocaleString()} <span className="text-sm font-normal text-slate-400">/ {totalTargetUnits.toLocaleString()}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Progress: {Math.round((totalActualUnits / totalTargetUnits) * 100)}%</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold font-mono">On Schedule</span>
          </div>
        </article>

        {/* REJECT & SCRAP RATE */}
        <article className="rounded-xl border border-borderMuted bg-panel p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Scrap & Defect Rate</span>
            <ShieldAlert className="h-4 w-4 text-rose-500" />
          </div>
          <div className="mt-3 font-mono text-2xl font-bold text-slate-900 dark:text-white">
            {overallScrapRate}% <span className="text-xs font-normal text-rose-600 dark:text-rose-400">({totalScrapUnits} units)</span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Below allowable 1.2% threshold</p>
        </article>

        {/* ACTIVE ASSEMBLY LINES */}
        <article className="rounded-xl border border-borderMuted bg-panel p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Operating Lines</span>
            <Activity className="h-4 w-4 text-cyan-500" />
          </div>
          <div className="mt-3 font-mono text-2xl font-bold text-slate-900 dark:text-white">
            {productionLines.filter(l => l.status === "Running").length} / {productionLines.length}
          </div>
          <p className="mt-1 text-xs text-amber-600 dark:text-amber-400 font-medium">1 Line Micro-Stoppage Warning</p>
        </article>

        {/* TOOLING & MAINTENANCE HEALTH */}
        <article className="rounded-xl border border-borderMuted bg-panel p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Tooling Life Watch</span>
            <Wrench className="h-4 w-4 text-violet-500" />
          </div>
          <div className="mt-3 font-mono text-2xl font-bold text-slate-900 dark:text-white">
            {toolingRoster.filter(t => t.wearPercent > 80).length} Critical
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Changeover scheduled for Shift 2</p>
        </article>
      </section>

      {/* ==================== 3. PRODUCTION LINE MATRIX & LIVE DETAIL ==================== */}
      <section className="grid grid-cols-1 gap-6 2xl:grid-cols-3">
        {/* Left: Production Line Selector Cards */}
        <div className="2xl:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider font-mono text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Factory className="h-4 w-4 text-amber-500" /> Active Shopfloor Production Lines
            </h2>
            <span className="text-xs text-slate-500 font-mono">Select line to view live SCADA telemetry</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {productionLines.map(line => {
              const isSelected = line.id === selectedLineId;
              const isWarning = line.status === "Warning";
              const taktRatio = (line.taktTimeSec / line.actualCycleTimeSec) * 100;

              return (
                <div
                  key={line.id}
                  onClick={() => setSelectedLineId(line.id)}
                  className={`p-5 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                    isSelected
                      ? "border-amber-500 bg-amber-500/5 shadow-md"
                      : "border-borderMuted bg-panel hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400">{line.type}</span>
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">{line.name}</h3>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                        isWarning
                          ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30"
                          : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                      }`}>
                        {line.status}
                      </span>
                    </div>

                    <div className="mt-3 text-xs text-slate-600 dark:text-slate-400 font-mono">
                      Product: <strong className="text-slate-800 dark:text-slate-200">{line.currentProduct}</strong>
                    </div>

                    {/* Cycle Time vs Takt Time */}
                    <div className="mt-3 space-y-1">
                      <div className="flex justify-between text-[11px] font-mono">
                        <span className="text-slate-500">Actual: <strong className="text-slate-800 dark:text-slate-200">{line.actualCycleTimeSec}s</strong></span>
                        <span className="text-slate-500">Takt Target: <strong className="text-slate-800 dark:text-slate-200">{line.taktTimeSec}s</strong></span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${taktRatio >= 95 ? "bg-emerald-500" : "bg-amber-500"}`}
                          style={{ width: `${Math.min(100, taktRatio)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-500">Shift Progress: <strong>{line.actualUnitsShift}/{line.targetUnitsShift}</strong></span>
                    <span className="text-amber-600 dark:text-amber-400 font-bold">OEE {Math.round((line.availabilityPercent * line.performancePercent * line.qualityPercent) / 10000)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Line Live SCADA PLC Registers */}
        <div className="rounded-xl border border-borderMuted bg-panel p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-borderMuted pb-3">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase text-amber-600 dark:text-amber-400">Live PLC Stream</span>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">{selectedLine.name}</h3>
            </div>
            <span className="flex items-center gap-1.5 text-[10px] font-mono bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> S7-1500 PLC
            </span>
          </div>

          <div className="text-xs text-slate-600 dark:text-slate-400 font-mono">
            Machinery: <strong className="text-slate-800 dark:text-slate-200">{selectedLine.robotModel}</strong>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {plcTags.map(tag => (
              <div key={tag.tag} className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
                  <span>{tag.tag}</span>
                  <span className={tag.status === "Warning" ? "text-amber-500 font-bold" : "text-emerald-500"}>●</span>
                </div>
                <div className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 truncate">{tag.label}</div>
                <div className="text-lg font-bold font-mono text-slate-900 dark:text-white">
                  {tag.value} <span className="text-xs font-normal text-slate-500">{tag.unit}</span>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => onCreateWorkOrder(`Calibration & Thermal Check: ${selectedLine.name}`, selectedLine.id, "High")}
            className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-mono text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-center gap-2"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" /> Adjust PLC Control Setpoints
          </button>
        </div>
      </section>

      {/* ==================== 4. COMPUTER VISION AI DEFECT SCANNER ==================== */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Optical AI Defect Visualizer */}
        <article className="rounded-xl border border-borderMuted bg-panel p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-600 dark:text-cyan-400 font-mono flex items-center gap-1.5">
                <Scan className="h-4 w-4" /> Deep Learning Visual QA Scanner
              </p>
              <h3 className="mt-1 text-base font-bold text-slate-900 dark:text-white">Optical Inspection Camera Feed (Camera #04)</h3>
            </div>
            <span className="text-[10px] font-mono bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 px-2 py-1 rounded border border-cyan-500/20">
              60 FPS HIGH-SPEED AOI
            </span>
          </div>

          {/* Visual AI Inspection Box Canvas Simulator */}
          <div className="relative h-64 bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
            {/* Grid background simulation */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:24px_24px] opacity-40" />
            
            {/* Simulated Machined Component Wireframe */}
            <div className="relative z-10 w-4/5 h-4/5 rounded-lg border-2 border-slate-700 bg-slate-900/80 p-4 flex flex-col justify-between">
              <div className="flex justify-between text-[10px] font-mono text-cyan-400">
                <span>INSPECTING: {selectedDefect.component}</span>
                <span>LOT: {selectedDefect.inspectedBatch}</span>
              </div>

              {/* Bounding Box for Defect */}
              <div
                className="absolute border-2 border-rose-500 bg-rose-500/20 rounded flex flex-col justify-between p-1 transition-all"
                style={{
                  left: `${selectedDefect.bbox.x}%`,
                  top: `${selectedDefect.bbox.y}%`,
                  width: `${selectedDefect.bbox.w}%`,
                  height: `${selectedDefect.bbox.h}%`,
                }}
              >
                <span className="bg-rose-600 text-white font-mono text-[8px] font-bold px-1 rounded w-fit">
                  {selectedDefect.defectType} ({selectedDefect.confidence}%)
                </span>
                <span className="h-1.5 w-1.5 bg-rose-400 rounded-full animate-ping self-end"></span>
              </div>

              <div className="flex justify-between items-end text-[9px] font-mono text-slate-500">
                <span>SENSOR: CMOS 24.5MP Global Shutter</span>
                <span>AI MODEL: YOLOv9-MFG-v4.2</span>
              </div>
            </div>
          </div>

          {/* Defect action message */}
          <div className="p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-lg text-xs font-mono flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-rose-900 dark:text-rose-200">{selectedDefect.defectType} detected with {selectedDefect.confidence}% confidence.</strong>
              <p className="text-rose-700 dark:text-rose-300 mt-0.5">{selectedDefect.actionTaken}</p>
            </div>
          </div>
        </article>

        {/* Real-time Defect Audit Queue & Tooling Watch */}
        <article className="rounded-xl border border-borderMuted bg-panel p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-borderMuted pb-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 font-mono">Defect Incident Log</p>
              <h3 className="mt-1 text-base font-bold text-slate-900 dark:text-white">Recent Vision QA Detections</h3>
            </div>
            <button onClick={() => onNavigate("compliance")} className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline">
              View ISO Audit Trail
            </button>
          </div>

          <div className="space-y-2.5">
            {visionDefects.map(d => (
              <div
                key={d.id}
                onClick={() => setSelectedDefectId(d.id)}
                className={`p-3 rounded-lg border text-xs font-mono cursor-pointer transition-all ${
                  selectedDefectId === d.id
                    ? "bg-slate-100 dark:bg-slate-800/80 border-amber-500"
                    : "bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900 dark:text-white">{d.component}</span>
                  <span className="text-rose-600 dark:text-rose-400 font-bold">{d.confidence}% Match</span>
                </div>
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>{d.line} • {d.defectType}</span>
                  <span>{d.timestamp}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Tooling Wear Predictor Section */}
          <div className="pt-3 border-t border-borderMuted space-y-2">
            <h4 className="text-xs font-bold font-mono text-slate-800 dark:text-slate-200 uppercase tracking-wider">Predictive Tooling Life Countdown</h4>
            <div className="space-y-2">
              {toolingRoster.slice(0, 2).map(t => (
                <div key={t.id} className="p-2.5 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">{t.name}</span>
                    <span className="text-slate-500 text-[10px]">{t.line} • {t.remainingCycles} cycles remaining ({t.wearPercent}% worn)</span>
                  </div>
                  <button
                    onClick={() => onCreateWorkOrder(`Tool Replacement: ${t.name}`, t.line, "High")}
                    className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded text-[10px] transition-all shadow-xs"
                  >
                    Schedule Change
                  </button>
                </div>
              ))}
            </div>
          </div>
        </article>
      </section>

      {/* ==================== 5. OEE SIX BIG LOSSES & DOWNTIME PARETO ==================== */}
      <section className="grid grid-cols-1 gap-6 2xl:grid-cols-5">
        
        {/* Dual-Axis Pareto Analyzer */}
        <article className="2xl:col-span-3 rounded-2xl border border-slate-700/60 bg-[#0d1017] p-5 shadow-xl space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-rose-400 font-mono">
                  ISO 22400 Downtime Root Cause Pareto
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                  DUAL-AXIS 80/20 ANALYSIS
                </span>
              </div>
              <h3 className="mt-0.5 text-base font-bold text-white font-display">Six Big Losses & Cumulative Loss (%)</h3>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400">
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-rose-500"></span> Downtime (Hrs)</span>
              <span className="flex items-center gap-1.5"><span className="h-1.5 w-4 bg-cyan-400 rounded-full"></span> Pareto 80/20 Curve (%)</span>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={sixLossesData} margin={{ top: 10, right: 15, left: -10, bottom: 5 }}>
                <defs>
                  <linearGradient id="paretoCrimson" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ff0055" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#ff0055" stopOpacity={0.2} />
                  </linearGradient>
                  <linearGradient id="paretoAmber" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.2} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#94a3b8" 
                  fontSize={10} 
                  tickLine={false} 
                  interval={0}
                />
                <YAxis 
                  yAxisId="left" 
                  stroke="#94a3b8" 
                  fontSize={10} 
                  tickLine={false} 
                  unit=" hrs" 
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  stroke="#00f0ff" 
                  fontSize={10} 
                  tickLine={false} 
                  unit="%" 
                  domain={[0, 100]} 
                />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", color: "#f8fafc", borderRadius: "8px", fontSize: "11px", fontFamily: "monospace" }}
                  formatter={(val, name) => {
                    if (name === "Cumulative %") return [`${val}%`, "Pareto Cumulative"];
                    return [`${val} Hours ($${(Number(val) * 3000).toLocaleString()})`, "Downtime Loss"];
                  }}
                />
                <Bar yAxisId="left" dataKey="lossHours" name="Downtime Loss (Hrs)" radius={[6, 6, 0, 0]}>
                  {sixLossesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="cumulativePercent" 
                  name="Cumulative %" 
                  stroke="#00f0ff" 
                  strokeWidth={2.5} 
                  dot={{ r: 4, fill: "#00f0ff", stroke: "#0f172a", strokeWidth: 2 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Financial Impact Breakdown Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-800">
            {sixLossesData.map((loss, idx) => (
              <div key={idx} className="silver-card p-2.5 flex items-center justify-between gap-2 border-slate-800 bg-[#0a0d14]">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-base flex-shrink-0">{loss.icon}</span>
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono text-white font-bold block truncate">{loss.name}</span>
                    <span className="text-[9px] font-mono text-slate-400 block">{loss.category}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-xs font-mono font-bold text-rose-400 block">${loss.costDollars.toLocaleString()}</span>
                  <span className="text-[9px] font-mono text-slate-400">{loss.lossHours}h</span>
                </div>
              </div>
            ))}
          </div>
        </article>

        {/* Telemetry Shift Trend (High-Contrast Energy vs OEE) */}
        <article className="2xl:col-span-2 rounded-2xl border border-slate-700/60 bg-[#0d1017] p-5 shadow-xl flex flex-col justify-between">
          <div className="mb-4 flex items-start justify-between border-b border-slate-800 pb-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400 font-mono">Shift Correlation Analytics</p>
              <h3 className="mt-0.5 text-base font-bold text-white font-display">OEE % vs Power Demand (kW)</h3>
            </div>
            <Activity className="h-4 w-4 text-emerald-400" />
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={telemetryHistory} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="oeeGradientMulti" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00ff9d" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#00ff9d" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="powerGradientMulti" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00f0ff" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} domain={[0, 100]} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "#0d1017", borderColor: "#334155", color: "#f8fafc", borderRadius: "8px", fontSize: "11px", fontFamily: "monospace" }} />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                <Area type="monotone" dataKey="oee" name="OEE Score %" stroke="#00ff9d" fill="url(#oeeGradientMulti)" strokeWidth={2.5} />
                <Area type="monotone" dataKey="power" name="Power Load (kW)" stroke="#00f0ff" fill="url(#powerGradientMulti)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 pt-3 border-t border-slate-800">
            <span>PEAK LOAD: 94.2 kW</span>
            <span className="text-emerald-400 font-bold">ENERGY EFFICIENCY: 92.4%</span>
          </div>
        </article>
      </section>
    </div>
  );
}
