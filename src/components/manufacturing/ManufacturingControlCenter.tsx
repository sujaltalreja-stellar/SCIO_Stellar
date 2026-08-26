"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Factory,
  Cpu,
  Gauge,
  Activity,
  AlertTriangle,
  CheckCircle2,
  CircleAlert,
  TrendingUp,
  Wrench,
  Scan,
  Zap,
  Layers,
  ArrowUpRight,
  ShieldAlert,
  Play,
  Pause,
  SlidersHorizontal,
  Package,
  Clock,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Search,
  Filter
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
} from "recharts";

interface ManufacturingControlCenterProps {
  onNavigate: (tab: string) => void;
  onCreateWorkOrder: (title: string, assetId: string, priority: string) => void;
}

// Motion easing & viewport constants
const ENTRANCE = [0.22, 1, 0.36, 1] as const;
const VIEWPORT_WIDE = { once: true, amount: 0.15 };

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: ENTRANCE },
  },
};

const stagger = (delayChildren = 0.08, staggerChildren = 0.1) => ({
  hidden: {},
  visible: {
    transition: {
      delayChildren,
      staggerChildren,
    },
  },
});

// Interactive Sub-tabs for Manufacturing Tower
const TABS = [
  "Overview",
  "Production Lines & Telemetry",
  "Vision QA & Defects",
  "OEE Pareto & Energy",
  "Tooling & Maintenance",
];

// Helper: Lightweight Animated CountUp
function CountUp({
  to,
  decimals = 0,
  duration = 1.2,
}: {
  to: number;
  decimals?: number;
  duration?: number;
}) {
  const [val, setVal] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setVal(easeOut * to);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setVal(to);
      }
    };

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [to, duration]);

  return <>{decimals > 0 ? val.toFixed(decimals) : Math.round(val)}</>;
}

// Reusable Dark Card Component
function Card({
  title,
  children,
  className = "",
  accentColor = "#E8A33D",
  badge,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
  accentColor?: string;
  badge?: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-xl border border-white/[0.07] bg-[#FFFDFA]/[0.02] p-4 sm:p-5 transition-all hover:border-white/[0.12] ${className}`}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-white/40 sm:text-[11.5px]">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: accentColor }}
          />
          {title}
        </p>
        {badge}
      </div>
      {children}
    </div>
  );
}

// Reusable Meter Bar Component
function Meter({
  label,
  value,
  display,
  percent,
  color,
  delay = 0,
}: {
  label: string;
  value?: number | string;
  display?: string | number;
  percent: number;
  color: string;
  delay?: number;
}) {
  return (
    <div className="grid grid-cols-[100px_minmax(0,1fr)_44px] items-center gap-3 sm:grid-cols-[130px_minmax(0,1fr)_48px]">
      <span className="truncate font-mono text-[11px] text-white/50 sm:text-[11.5px]" title={label}>
        {label}
      </span>
      <span className="h-1.5 overflow-hidden rounded-full bg-[#FFFDFA]/[0.06]">
        <motion.span
          className="block h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
          transition={{ duration: 0.8, ease: ENTRANCE, delay }}
        />
      </span>
      <span className="text-right font-mono text-[11px] text-white/75 sm:text-[11.5px]">
        {display ?? (typeof value === "number" ? `${value}%` : value)}
      </span>
    </div>
  );
}

export default function ManufacturingControlCenter({
  onNavigate,
  onCreateWorkOrder,
}: ManufacturingControlCenterProps) {
  const [selectedTab, setSelectedTab] = useState("Overview");
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

  // Live Machine Sensor Telemetry Stream
  const [plcTags, setPlcTags] = useState([
    { tag: "Speed Sensor", label: "Spindle Speed", value: 14250, unit: "RPM", status: "Optimal", min: 0, max: 18000, target: "Target: 14,000" },
    { tag: "Thermal Sensor", label: "Spindle Bearing Temp", value: 58.6, unit: "°C", status: "Warning", min: 20, max: 80, target: "Limit: < 70°C" },
    { tag: "Vibration Sensor", label: "Vibration Level (RMS)", value: 2.38, unit: "mm/s", status: "Warning", min: 0, max: 4.5, target: "Optimal < 3.0" },
    { tag: "Pressure Sensor", label: "Hydraulic Pressure", value: 184.2, unit: "Bar", status: "Optimal", min: 100, max: 250, target: "Nominal: 180" },
    { tag: "Feed Sensor", label: "Servo Feed Rate", value: 1240, unit: "mm/min", status: "Optimal", min: 0, max: 2000, target: "Target: 1,200" },
    { tag: "Power Sensor", label: "Machine Power Load", value: 48.6, unit: "kW", status: "Optimal", min: 10, max: 75, target: "Rated: 60 kW" },
  ]);

  // Optical Inspection Feed
  const [visionDefects] = useState([
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

  // Tooling Roster
  const [toolingRoster] = useState([
    { id: "T-01", name: "Solid Carbide End Mill Ø12mm", line: "Line B2", remainingCycles: 142, maxCycles: 800, wearPercent: 82.2, status: "Replace Soon" },
    { id: "T-02", name: "Laser Optic Protective Lens Kit", line: "Line A1", remainingCycles: 480, maxCycles: 1000, wearPercent: 52.0, status: "Healthy" },
    { id: "T-03", name: "SMT Pick & Place Vacuum Nozzle N4", line: "Line C3", remainingCycles: 2450, maxCycles: 5000, wearPercent: 51.0, status: "Healthy" },
    { id: "T-04", name: "Spot Welding Copper Tip Set", line: "Line A1", remainingCycles: 85, maxCycles: 600, wearPercent: 85.8, status: "Critical Wear" }
  ]);

  // Real-time Trend Series
  const [telemetryHistory] = useState([
    { time: "09:00", oee: 84.2, throughput: 380, vibration: 1.2, power: 42 },
    { time: "09:30", oee: 86.1, throughput: 395, vibration: 1.3, power: 44 },
    { time: "10:00", oee: 88.4, throughput: 410, vibration: 1.4, power: 46 },
    { time: "10:30", oee: 82.0, throughput: 360, vibration: 2.1, power: 49 },
    { time: "11:00", oee: 79.5, throughput: 345, vibration: 2.4, power: 51 },
    { time: "11:30", oee: 85.3, throughput: 405, vibration: 1.8, power: 47 },
    { time: "12:00", oee: 87.2, throughput: 418, vibration: 1.5, power: 45 },
  ]);

  // Live simulation ticker
  useEffect(() => {
    if (!simulationActive) return;
    const interval = setInterval(() => {
      setPlcTags(prev => prev.map(tag => {
        let delta = (Math.random() - 0.5) * (tag.max - tag.min) * 0.02;
        let nextVal = +(Math.min(tag.max, Math.max(tag.min, tag.value + delta))).toFixed(1);
        if (tag.unit === "RPM") nextVal = Math.round(nextVal);
        return { ...tag, value: nextVal };
      }));

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

  // Portfolio calculations
  const avgAvailability = Math.round(productionLines.reduce((acc, l) => acc + l.availabilityPercent, 0) / productionLines.length);
  const avgPerformance = Math.round(productionLines.reduce((acc, l) => acc + l.performancePercent, 0) / productionLines.length);
  const avgQuality = Math.round(productionLines.reduce((acc, l) => acc + l.qualityPercent, 0) / productionLines.length);
  const overallOEE = Math.round((avgAvailability * avgPerformance * avgQuality) / 10000);

  const totalActualUnits = productionLines.reduce((acc, l) => acc + l.actualUnitsShift, 0);
  const totalTargetUnits = productionLines.reduce((acc, l) => acc + l.targetUnitsShift, 0);
  const totalScrapUnits = productionLines.reduce((acc, l) => acc + l.scrapUnits, 0);
  const overallScrapRate = +((totalScrapUnits / (totalActualUnits || 1)) * 100).toFixed(2);
  const firstPassYield = +(100 - overallScrapRate).toFixed(2);

  // Six Big Losses Pareto
  const rawLosses = [
    { name: "Unplanned Breakdown", category: "Availability Loss", lossHours: 4.2, costDollars: 12600, color: "#F0526B", icon: "🚨" },
    { name: "Setup & Tool Change", category: "Availability Loss", lossHours: 2.8, costDollars: 8400, color: "#E8A33D", icon: "🔧" },
    { name: "Idling & Micro-Stops", category: "Performance Loss", lossHours: 2.1, costDollars: 6300, color: "#E8A33D", icon: "⏱️" },
    { name: "Reduced Cycle Speed", category: "Performance Loss", lossHours: 1.6, costDollars: 4800, color: "#3FC8D8", icon: "📉" },
    { name: "Process Defects & Scrap", category: "Quality Loss", lossHours: 1.1, costDollars: 3300, color: "#8B5CF6", icon: "🔬" },
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

  // AI Inspection Precision
  const AI_QA_METRICS = [
    ["Surface Micro-Crack AOI", 98.6],
    ["Solder Bridge SPI (3D)", 97.4],
    ["Laser Weld Seam Pyrometer", 95.8],
    ["Gasket Alignment Robot CV", 99.1],
  ] as const;

  // Footer Highlights
  const FOOTER_HIGHLIGHTS = [
    {
      label: "Tooling & Cycle Bottlenecks",
      value: "1 Watchlist",
      highlight: "Line B2 Mill",
      highlightTone: "#E8A33D",
      body: "Hermle C42U End Mill at 82% wear · Changeover scheduled for Shift 2",
    },
    {
      label: "Active Plant Operators",
      value: "24 Technicians",
      highlight: "Shift 1 Active",
      highlightTone: "#2FBF71",
      body: "All digital work orders synchronized via SCIO Edge Tablet Terminals",
    },
    {
      label: "Plant Scrap Trend · 90 Days",
      value: "−24%",
      highlight: "improving",
      highlightTone: "#2FBF71",
      body: "First pass yield improved to 99.12% after AI vision closed-loop gating",
    },
  ];

  return (
    <section className="bg-[#0B0D0F] rounded-2xl border border-white/[0.08] px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-10 shadow-2xl">
      <div className="mx-auto w-full max-w-[1360px] space-y-8">
        
        {/* ==================== 1. TOP HERO SECTION INTRO ==================== */}
        <div className="flex flex-col justify-between gap-6 border-b border-white/[0.07] pb-8 xl:flex-row xl:items-end">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.09] bg-white/[0.03] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-[#E8A33D]">
              <Factory className="h-3.5 w-3.5" />
              01 — SHOPFLOOR · MANUFACTURING OPERATIONS CONTROL TOWER
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
              One Control Tower for the Entire Shopfloor Ecosystem
            </h1>
            <p className="max-w-3xl text-sm leading-relaxed text-white/50 sm:text-[14.5px]">
              Centralized, real-time visibility into overall plant OEE, live machine telemetry, AI computer vision defect inspection,
              and ISO/IATF compliance — with cell-level telemetry behind every number.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate("planning")}
              className="inline-flex items-center gap-2 rounded-xl border border-white/[0.12] bg-[#101315] px-4 py-2.5 font-mono text-xs font-semibold text-white/80 transition-all hover:border-[#E8A33D]/50 hover:bg-[#E8A33D]/10 hover:text-white"
            >
              <Cpu className="h-4 w-4 text-[#E8A33D]" />
              <span>Production Planning (Gantt)</span>
              <ArrowUpRight className="h-3.5 w-3.5 opacity-60" />
            </button>
            <button
              onClick={() => onCreateWorkOrder("Emergency Tooling Changeover", selectedLine.robotModel, "Critical")}
              className="inline-flex items-center gap-2 rounded-xl border border-[#F0526B]/30 bg-[#F0526B]/10 px-4 py-2.5 font-mono text-xs font-semibold text-[#F0526B] transition-all hover:border-[#F0526B]/60 hover:bg-[#F0526B]/20"
            >
              <CircleAlert className="h-4 w-4" />
              <span>Report Finding / CAPA</span>
            </button>
          </div>
        </div>

        {/* ==================== 2. MAIN CONTROL TOWER SHELL ==================== */}
        <motion.div
          className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#101315] shadow-2xl"
          variants={stagger(0.08, 0.12)}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_WIDE}
        >
          {/* Sub-Nav Header Bar */}
          <motion.div
            variants={fadeUp}
            className="flex flex-wrap items-center justify-between gap-x-5 gap-y-3 border-b border-white/[0.07] bg-[#0E1113] px-4 py-3 sm:px-6"
          >
            <div className="flex items-center gap-4">
              <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/35">
                CONTROL TOWER
              </span>
              <span className="h-3 w-[1px] bg-white/[0.1]" />
              <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                {TABS.map((tab) => {
                  const isActive = selectedTab === tab;
                  return (
                    <button
                      key={tab}
                      onClick={() => setSelectedTab(tab)}
                      className={`relative px-3 py-1.5 text-xs font-medium transition-all rounded-md ${
                        isActive
                          ? "text-white bg-white/[0.06] font-semibold"
                          : "text-white/40 hover:text-white/70 hover:bg-white/[0.02]"
                      }`}
                    >
                      {tab}
                      {isActive && (
                        <motion.span
                          layoutId="activeMfgTabUnderline"
                          className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-[#E8A33D]"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-[#2FBF71]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#2FBF71] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#2FBF71]" />
              </span>
              <span>Live · Shopfloor OPC-UA Feed · {productionLines.length} Active Lines</span>
            </div>
          </motion.div>

          {/* Tab Content Panels */}
          <div className="p-4 sm:p-6 space-y-6">
            <AnimatePresence mode="wait">
              {/* ==================== TAB 1: OVERVIEW ==================== */}
              {selectedTab === "Overview" && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4 sm:space-y-6"
                >
                  {/* Top 4 KPI Metric Cards */}
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {/* KPI 1: Overall Plant OEE */}
                    <div className="rounded-xl border border-white/[0.07] bg-[#FFFDFA]/[0.02] p-4 transition-all hover:border-white/[0.14]">
                      <p className="font-mono text-[11px] uppercase tracking-[0.13em] text-white/40 sm:text-[11.5px]">
                        Overall Plant OEE
                      </p>
                      <p className="mt-3 text-[32px] font-semibold leading-none tracking-[-0.03em] text-white sm:text-[38px]">
                        <CountUp to={overallOEE} decimals={1} />
                        <span className="text-[18px] font-medium text-white/55 ml-0.5">%</span>
                      </p>
                      <span className="mt-4 block h-1 overflow-hidden rounded-full bg-[#FFFDFA]/[0.06]">
                        <motion.span
                          className="block h-full rounded-full bg-[#2FBF71]"
                          initial={{ width: 0 }}
                          animate={{ width: `${overallOEE}%` }}
                          transition={{ duration: 0.8, ease: ENTRANCE, delay: 0.1 }}
                        />
                      </span>
                    </div>

                    {/* KPI 2: First Pass Yield */}
                    <div className="rounded-xl border border-white/[0.07] bg-[#FFFDFA]/[0.02] p-4 transition-all hover:border-white/[0.14]">
                      <p className="font-mono text-[11px] uppercase tracking-[0.13em] text-white/40 sm:text-[11.5px]">
                        First Pass Yield (FPY)
                      </p>
                      <p className="mt-3 text-[32px] font-semibold leading-none tracking-[-0.03em] text-white sm:text-[38px]">
                        <CountUp to={firstPassYield} decimals={2} />
                        <span className="text-[18px] font-medium text-white/55 ml-0.5">%</span>
                      </p>
                      <span className="mt-4 block h-1 overflow-hidden rounded-full bg-[#FFFDFA]/[0.06]">
                        <motion.span
                          className="block h-full rounded-full bg-[#E8A33D]"
                          initial={{ width: 0 }}
                          animate={{ width: `${firstPassYield}%` }}
                          transition={{ duration: 0.8, ease: ENTRANCE, delay: 0.2 }}
                        />
                      </span>
                    </div>

                    {/* KPI 3: AI Defect Recognition Precision */}
                    <div className="rounded-xl border border-white/[0.07] bg-[#FFFDFA]/[0.02] p-4 transition-all hover:border-white/[0.14]">
                      <p className="font-mono text-[11px] uppercase tracking-[0.13em] text-white/40 sm:text-[11.5px]">
                        AI Vision QA Precision
                      </p>
                      <p className="mt-3 text-[32px] font-semibold leading-none tracking-[-0.03em] text-white sm:text-[38px]">
                        <CountUp to={98.6} decimals={1} />
                        <span className="text-[18px] font-medium text-white/55 ml-0.5">%</span>
                      </p>
                      <span className="mt-4 block h-1 overflow-hidden rounded-full bg-[#FFFDFA]/[0.06]">
                        <motion.span
                          className="block h-full rounded-full bg-[#3FC8D8]"
                          initial={{ width: 0 }}
                          animate={{ width: "98.6%" }}
                          transition={{ duration: 0.8, ease: ENTRANCE, delay: 0.3 }}
                        />
                      </span>
                    </div>

                    {/* KPI 4: Active Shopfloor Warnings */}
                    <div className="rounded-xl border border-[#F0526B]/30 bg-[#F0526B]/[0.07] p-4">
                      <p className="font-mono text-[11px] uppercase tracking-[0.13em] text-[#F0526B]/80 sm:text-[11.5px]">
                        Critical Shopfloor Alerts
                      </p>
                      <p className="mt-3 text-[32px] font-semibold leading-none tracking-[-0.03em] text-white sm:text-[38px]">
                        <CountUp to={1} />
                      </p>
                      <p className="mt-1 font-mono text-[11px] text-[#F0526B]/90 sm:text-[11.5px]">
                        Line B2 CNC Thermal Warning · Action Assigned
                      </p>
                    </div>
                  </div>

                  {/* Mid Section Grid: 4 Detailed Metric Cards */}
                  <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
                    {/* Card 1: Production Line OEE & Cycle Velocity */}
                    <Card
                      title="Shopfloor Line OEE & Cycle Velocity"
                      accentColor="#E8A33D"
                      badge={
                        <span className="font-mono text-[11px] text-white/40">
                          {productionLines.length} Cells Active
                        </span>
                      }
                    >
                      <div className="mt-4 space-y-3">
                        {productionLines.map((line, idx) => {
                          const oee = Math.round((line.availabilityPercent * line.performancePercent * line.qualityPercent) / 10000);
                          const color = oee >= 85 ? "#2FBF71" : oee >= 75 ? "#E8A33D" : "#F0526B";
                          return (
                            <Meter
                              key={line.id}
                              label={line.name.split(" - ")[0]}
                              percent={oee}
                              display={`${oee}% OEE`}
                              color={color}
                              delay={0.1 * idx}
                            />
                          );
                        })}
                      </div>
                    </Card>

                    {/* Card 2: Shift Output Yield */}
                    <Card
                      title="Shift Output Yield & Target Run"
                      accentColor="#2FBF71"
                      badge={
                        <span className="font-mono text-[11px] text-white/40">
                          {totalActualUnits.toLocaleString()} / {totalTargetUnits.toLocaleString()} units
                        </span>
                      }
                    >
                      <div className="mt-4 space-y-3">
                        {productionLines.map((line, idx) => {
                          const pct = Math.min(100, Math.round((line.actualUnitsShift / line.targetUnitsShift) * 100));
                          return (
                            <Meter
                              key={line.id}
                              label={line.currentProduct.slice(0, 18)}
                              percent={pct}
                              display={`${line.actualUnitsShift}/${line.targetUnitsShift}`}
                              color="#2FBF71"
                              delay={0.1 * idx}
                            />
                          );
                        })}
                      </div>
                    </Card>

                    {/* Card 3: Live Machine Telemetry Registers */}
                    <Card
                      title="Live Machine Telemetry Registers (Line A1)"
                      accentColor="#3FC8D8"
                      badge={
                        <span className="font-mono text-[11px] text-[#2FBF71] flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#2FBF71] animate-pulse" /> S7-1500 PLC
                        </span>
                      }
                    >
                      <div className="mt-4 grid grid-cols-2 gap-2 font-mono text-xs">
                        {plcTags.slice(0, 4).map(tag => (
                          <div key={tag.tag} className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] space-y-1">
                            <span className="text-[10px] text-white/40 block">{tag.label}</span>
                            <span className="text-white font-bold text-sm">
                              {tag.value} <span className="text-white/40 text-[10px] font-normal">{tag.unit}</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    </Card>

                    {/* Card 4: AI Optical QA & Inspection Accuracy */}
                    <Card
                      title="AI Computer Vision QA Accuracy"
                      accentColor="#8B5CF6"
                      badge={
                        <span className="font-mono text-[11px] text-white/40">
                          60 FPS AOI Camera Feed
                        </span>
                      }
                    >
                      <div className="mt-4 space-y-3">
                        {AI_QA_METRICS.map(([label, score], idx) => (
                          <Meter
                            key={label}
                            label={label}
                            percent={score}
                            display={`${score}%`}
                            color="#8B5CF6"
                            delay={0.1 * idx}
                          />
                        ))}
                      </div>
                    </Card>
                  </div>

                  {/* 3 Footer Operational Cards */}
                  <div className="grid gap-3 sm:grid-cols-3">
                    {FOOTER_HIGHLIGHTS.map((item, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl border border-white/[0.07] bg-[#FFFDFA]/[0.02] p-4 transition-all hover:border-white/[0.14] space-y-2"
                      >
                        <div className="flex justify-between items-center text-xs font-mono">
                          <span className="text-white/40">{item.label}</span>
                          <span
                            className="px-1.5 py-0.5 rounded text-[10px] font-bold"
                            style={{ color: item.highlightTone, backgroundColor: `${item.highlightTone}15` }}
                          >
                            {item.highlight}
                          </span>
                        </div>
                        <p className="text-lg font-bold text-white font-mono">{item.value}</p>
                        <p className="text-xs text-white/50 leading-relaxed">{item.body}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* ==================== TAB 2: PRODUCTION LINES & TELEMETRY ==================== */}
              {selectedTab === "Production Lines & Telemetry" && (
                <motion.div
                  key="lines"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid grid-cols-1 gap-6 lg:grid-cols-3"
                >
                  <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between border-b border-white/[0.07] pb-3">
                      <h3 className="font-bold text-white text-sm font-mono uppercase tracking-wider">
                        Active Shopfloor Lines ({productionLines.length})
                      </h3>
                      <button
                        onClick={() => setSimulationActive(!simulationActive)}
                        className="text-xs font-mono text-[#E8A33D] hover:underline flex items-center gap-1.5"
                      >
                        {simulationActive ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                        {simulationActive ? "Pause Telemetry Stream" : "Resume Stream"}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {productionLines.map(line => {
                        const isSelected = line.id === selectedLineId;
                        const isWarning = line.status === "Warning";
                        const oee = Math.round((line.availabilityPercent * line.performancePercent * line.qualityPercent) / 10000);
                        return (
                          <div
                            key={line.id}
                            onClick={() => setSelectedLineId(line.id)}
                            className={`p-4 rounded-xl border cursor-pointer transition-all space-y-3 ${
                              isSelected
                                ? "border-[#E8A33D] bg-[#E8A33D]/[0.05] shadow-lg"
                                : "border-white/[0.07] bg-white/[0.02] hover:border-white/[0.15]"
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="text-[10px] font-mono text-white/40 block uppercase">{line.type}</span>
                                <h4 className="font-bold text-white text-sm mt-0.5">{line.name}</h4>
                              </div>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                                isWarning
                                  ? "border-[#E8A33D]/40 text-[#E8A33D] bg-[#E8A33D]/10"
                                  : "border-[#2FBF71]/40 text-[#2FBF71] bg-[#2FBF71]/10"
                              }`}>
                                {line.status}
                              </span>
                            </div>

                            <div className="text-xs font-mono text-white/60">
                              Product: <strong className="text-white font-medium">{line.currentProduct}</strong>
                            </div>

                            <div className="pt-2 border-t border-white/[0.06] flex justify-between items-center text-xs font-mono">
                              <span className="text-white/40">Shift Units: <strong className="text-white">{line.actualUnitsShift}/{line.targetUnitsShift}</strong></span>
                              <span className="text-[#E8A33D] font-bold">{oee}% OEE</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right: Selected Line Telemetry */}
                  <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-5 space-y-4">
                    <div className="border-b border-white/[0.07] pb-3">
                      <span className="text-[10px] font-mono text-[#E8A33D] uppercase block">Selected Machine Telemetry</span>
                      <h4 className="text-white font-bold text-sm mt-0.5">{selectedLine.name}</h4>
                      <p className="text-xs text-white/40 font-mono mt-0.5">{selectedLine.robotModel}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      {plcTags.map(tag => (
                        <div key={tag.tag} className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-lg space-y-1">
                          <div className="flex justify-between text-[10px] font-mono text-white/40">
                            <span>{tag.tag}</span>
                            <span className={tag.status === "Warning" ? "text-[#E8A33D]" : "text-[#2FBF71]"}>●</span>
                          </div>
                          <div className="text-xs font-semibold text-white truncate">{tag.label}</div>
                          <div className="text-base font-bold text-white font-mono">
                            {tag.value} <span className="text-xs font-normal text-white/40">{tag.unit}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => onCreateWorkOrder(`Calibration & Diagnostic Check: ${selectedLine.name}`, selectedLine.id, "High")}
                      className="w-full py-2.5 bg-white/[0.06] hover:bg-white/[0.1] text-white font-mono text-xs font-bold rounded-lg border border-white/[0.1] transition-all flex items-center justify-center gap-2"
                    >
                      <SlidersHorizontal className="h-3.5 w-3.5 text-[#E8A33D]" />
                      <span>Adjust Machine Control Setpoints</span>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ==================== TAB 3: VISION QA & DEFECTS ==================== */}
              {selectedTab === "Vision QA & Defects" && (
                <motion.div
                  key="vision"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid grid-cols-1 gap-6 lg:grid-cols-2"
                >
                  {/* Optical AOI Canvas Simulator */}
                  <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-5 space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-[10px] font-mono text-[#3FC8D8] uppercase block">High-Speed AOI Camera #04</span>
                        <h4 className="text-white font-bold text-base mt-0.5">Optical Inspection AI Feed</h4>
                      </div>
                      <span className="px-2 py-1 rounded bg-[#3FC8D8]/10 text-[#3FC8D8] border border-[#3FC8D8]/30 text-[10px] font-mono">
                        60 FPS LIVE
                      </span>
                    </div>

                    <div className="relative h-64 bg-[#08090C] rounded-xl border border-white/[0.08] flex items-center justify-center overflow-hidden">
                      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:20px_20px] opacity-20" />
                      
                      <div className="relative z-10 w-4/5 h-4/5 rounded-lg border border-white/20 bg-white/[0.02] p-4 flex flex-col justify-between">
                        <div className="flex justify-between text-[10px] font-mono text-[#3FC8D8]">
                          <span>INSPECTING: {selectedDefect.component}</span>
                          <span>BATCH: {selectedDefect.inspectedBatch}</span>
                        </div>

                        {/* Defect Bounding Box */}
                        <div
                          className="absolute border-2 border-[#F0526B] bg-[#F0526B]/20 rounded flex flex-col justify-between p-1"
                          style={{
                            left: `${selectedDefect.bbox.x}%`,
                            top: `${selectedDefect.bbox.y}%`,
                            width: `${selectedDefect.bbox.w}%`,
                            height: `${selectedDefect.bbox.h}%`,
                          }}
                        >
                          <span className="bg-[#F0526B] text-white font-mono text-[8px] font-bold px-1 rounded w-fit">
                            {selectedDefect.defectType} ({selectedDefect.confidence}%)
                          </span>
                        </div>

                        <div className="flex justify-between text-[9px] font-mono text-white/40">
                          <span>SENSOR: CMOS 24.5MP Global Shutter</span>
                          <span>AI MODEL: YOLOv9-MFG-v4.2</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg border border-[#F0526B]/30 bg-[#F0526B]/10 text-xs font-mono text-white/80">
                      <strong className="text-[#F0526B]">{selectedDefect.defectType} Detected:</strong> {selectedDefect.actionTaken}
                    </div>
                  </div>

                  {/* Defect Incident Log */}
                  <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-5 space-y-4">
                    <div className="flex justify-between items-center border-b border-white/[0.07] pb-3">
                      <h4 className="text-white font-bold text-sm font-mono uppercase tracking-wider">
                        Recent Vision QA Detections
                      </h4>
                      <button onClick={() => onNavigate("quality")} className="text-xs text-[#E8A33D] font-mono hover:underline">
                        Open Quality Engine
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {visionDefects.map(d => (
                        <div
                          key={d.id}
                          onClick={() => setSelectedDefectId(d.id)}
                          className={`p-3 rounded-lg border text-xs font-mono cursor-pointer transition-all ${
                            selectedDefectId === d.id
                              ? "border-[#E8A33D] bg-[#E8A33D]/10"
                              : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]"
                          }`}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-white">{d.component}</span>
                            <span className="text-[#F0526B] font-bold">{d.confidence}% Match</span>
                          </div>
                          <div className="flex justify-between text-white/40 text-[10.5px]">
                            <span>{d.line} • {d.defectType}</span>
                            <span>{d.timestamp}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ==================== TAB 4: OEE PARETO & ENERGY ==================== */}
              {selectedTab === "OEE Pareto & Energy" && (
                <motion.div
                  key="pareto"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-5 space-y-4">
                    <div className="flex flex-wrap justify-between items-center gap-3 border-b border-white/[0.07] pb-3">
                      <div>
                        <span className="text-[10px] font-mono text-[#F0526B] uppercase block">ISO 22400 Downtime Root Cause Pareto</span>
                        <h4 className="text-white font-bold text-base mt-0.5">Six Big Losses &amp; Cumulative Loss (%)</h4>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] font-mono text-white/50">
                        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-[#F0526B]" /> Downtime (Hrs)</span>
                        <span className="flex items-center gap-1.5"><span className="h-1 w-3 bg-[#3FC8D8] rounded-full" /> Cumulative %</span>
                      </div>
                    </div>

                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={sixLossesData} margin={{ top: 10, right: 15, left: -10, bottom: 5 }}>
                          <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} opacity={0.4} />
                          <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                          <YAxis yAxisId="left" stroke="#64748b" fontSize={10} tickLine={false} unit="h" />
                          <YAxis yAxisId="right" orientation="right" stroke="#3FC8D8" fontSize={10} tickLine={false} unit="%" domain={[0, 100]} />
                          <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", color: "#f8fafc", borderRadius: "8px", fontSize: "11px", fontFamily: "monospace" }} />
                          <Bar yAxisId="left" dataKey="lossHours" radius={[4, 4, 0, 0]}>
                            {sixLossesData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                          <Line yAxisId="right" type="monotone" dataKey="cumulativePercent" stroke="#3FC8D8" strokeWidth={2.5} dot={{ r: 4, fill: "#3FC8D8" }} />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ==================== TAB 5: TOOLING & MAINTENANCE ==================== */}
              {selectedTab === "Tooling & Maintenance" && (
                <motion.div
                  key="tooling"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid grid-cols-1 gap-6 lg:grid-cols-2"
                >
                  <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-5 space-y-4">
                    <h4 className="text-white font-bold text-sm font-mono uppercase tracking-wider border-b border-white/[0.07] pb-3">
                      Predictive Tooling Life Countdown
                    </h4>

                    <div className="space-y-3">
                      {toolingRoster.map(t => (
                        <div key={t.id} className="p-3.5 bg-white/[0.02] border border-white/[0.06] rounded-lg space-y-2 font-mono text-xs">
                          <div className="flex justify-between items-center">
                            <strong className="text-white">{t.name}</strong>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                              t.wearPercent > 80
                                ? "border-[#F0526B]/40 text-[#F0526B] bg-[#F0526B]/10"
                                : "border-[#2FBF71]/40 text-[#2FBF71] bg-[#2FBF71]/10"
                            }`}>
                              {t.status}
                            </span>
                          </div>
                          <div className="flex justify-between text-white/50 text-[11px]">
                            <span>{t.line} • {t.remainingCycles} cycles left</span>
                            <span>{t.wearPercent}% worn</span>
                          </div>
                          <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${t.wearPercent}%`, backgroundColor: t.wearPercent > 80 ? "#F0526B" : "#E8A33D" }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-5 space-y-4">
                    <h4 className="text-white font-bold text-sm font-mono uppercase tracking-wider border-b border-white/[0.07] pb-3">
                      Dispatch Tooling Maintenance Order
                    </h4>
                    <p className="text-xs text-white/50 leading-relaxed font-mono">
                      Pre-emptive tooling changeovers during planned shift buffers prevent micro-stoppages and ensure Cpk dimension accuracy.
                    </p>

                    <button
                      onClick={() => onCreateWorkOrder("Tool Changeover: End Mill Ø12mm", "Line B2", "High")}
                      className="w-full py-3 bg-[#E8A33D] hover:bg-[#E8A33D]/90 text-black font-mono text-xs font-bold rounded-lg transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      <Wrench className="h-4 w-4" />
                      <span>Schedule Line B2 Tool Change</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
