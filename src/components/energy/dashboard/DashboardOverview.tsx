"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  TrendingUp,
  Leaf,
  AlertTriangle,
  Layers,
  ChevronRight,
  ShieldAlert,
  Heart,
  Sun,
  Activity,
  Gauge,
  Flame,
  Radio,
  Waves,
  Cpu,
  RefreshCw,
  Wind,
  Battery,
  ShieldCheck,
  CheckCircle2,
  CircleAlert,
  ArrowUpRight,
  ExternalLink,
  Sliders,
  Sparkles,
  Search,
  Filter
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

import { mockDb } from "../../../config/energyMockDb";

interface DashboardOverviewProps {
  onSelectPlant: (plantId: string) => void;
}

// Motion easing & viewport constants (Identical to Maritime & Home Page Control Towers)
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

// Interactive Sub-tabs for the Energy Control Tower
const TABS = [
  "Overview",
  "Generation & SCADA",
  "Asset Health & FFT",
  "Alarms & Interlocks",
  "Fleet Leaderboard",
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

// Reusable Dark/Light Card Component with High-Contrast Dark Fonts in Light Mode
function Card({
  title,
  children,
  className = "",
  accentColor = "#10B981",
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
      className={`rounded-xl border border-slate-200/90 dark:border-white/[0.07] bg-white dark:bg-[#FFFDFA]/[0.02] p-4 sm:p-5 transition-all hover:border-slate-300 dark:hover:border-white/[0.12] shadow-xs dark:shadow-none ${className}`}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-slate-900 dark:text-white font-bold sm:text-[11.5px]">
          <span
            className="h-1.5 w-1.5 rounded-full shrink-0"
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

// Reusable Meter Bar Component (High Contrast Dark Text in Light Mode, Sleek in Dark Mode)
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
    <div className="grid grid-cols-[110px_minmax(0,1fr)_48px] items-center gap-3 sm:grid-cols-[140px_minmax(0,1fr)_56px]">
      <span className="truncate font-mono text-[11px] text-slate-900 dark:text-white/80 font-bold sm:text-[11.5px]" title={label}>
        {label}
      </span>
      <span className="h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-[#FFFDFA]/[0.06]">
        <motion.span
          className="block h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
          transition={{ duration: 0.8, ease: ENTRANCE, delay }}
        />
      </span>
      <span className="text-right font-mono text-[11px] text-slate-950 dark:text-white font-black sm:text-[11.5px]">
        {display ?? (typeof value === "number" ? `${value}%` : value)}
      </span>
    </div>
  );
}

export default function DashboardOverview({ onSelectPlant }: DashboardOverviewProps) {
  const [selectedTab, setSelectedTab] = useState("Overview");

  // === Live telemetry state ===
  const [livePower, setLivePower] = useState(2488.8);
  const [thermalTemp, setThermalTemp] = useState(54.4);
  const [todayProduction, setTodayProduction] = useState(18450.2);
  const [fleetHealth, setFleetHealth] = useState(94.8);
  const [gridFreq, setGridFreq] = useState(50.00);
  const [loadFactor, setLoadFactor] = useState(86.8);

  // === 24-Band FFT spectrum amplitudes (live jiggle) ===
  const [spectrumAmplitudes, setSpectrumAmplitudes] = useState<number[]>([
    28, 45, 62, 78, 88, 74, 52, 65, 84, 91, 72, 58,
    44, 55, 68, 80, 64, 48, 36, 28, 42, 56, 38, 22
  ]);

  // Interval: update live telemetry every 2.0s
  useEffect(() => {
    const interval = setInterval(() => {
      setLivePower((prev) => Math.max(2420, Math.min(2580, prev + (Math.random() - 0.5) * 15)));
      setThermalTemp((prev) => Math.max(50, Math.min(62, prev + (Math.random() - 0.5) * 1.2)));
      setTodayProduction((prev) => prev + 0.8);
      setFleetHealth((prev) => Math.max(92, Math.min(97, prev + (Math.random() - 0.5) * 0.3)));
      setGridFreq((prev) => Math.max(49.96, Math.min(50.04, prev + (Math.random() - 0.5) * 0.01)));
      setLoadFactor((prev) => Math.max(82, Math.min(92, prev + (Math.random() - 0.5) * 0.8)));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Interval: update FFT spectrum amplitudes smoothly every 400ms
  useEffect(() => {
    const timer = setInterval(() => {
      setSpectrumAmplitudes((prev) =>
        prev.map((amp) => {
          const delta = (Math.random() - 0.48) * 8;
          return Math.max(14, Math.min(96, Math.round(amp + delta)));
        })
      );
    }, 400);
    return () => clearInterval(timer);
  }, []);

  const plants = mockDb.plants || [];

  // 14-day energy dispatch waveform
  const chartData = [
    { date: "08/10", solar: 740, wind: 920, bess: 340 },
    { date: "08/11", solar: 860, wind: 1040, bess: 380 },
    { date: "08/12", solar: 920, wind: 980, bess: 360 },
    { date: "08/13", solar: 780, wind: 1180, bess: 420 },
    { date: "08/14", solar: 950, wind: 1050, bess: 390 },
    { date: "08/15", solar: 890, wind: 990, bess: 370 },
    { date: "08/16", solar: 940, wind: 1120, bess: 410 },
    { date: "08/17", solar: 910, wind: 1240, bess: 430 },
    { date: "08/18", solar: 870, wind: 1150, bess: 380 },
    { date: "08/19", solar: 930, wind: 1320, bess: 440 },
    { date: "08/20", solar: 890, wind: 1210, bess: 410 },
    { date: "08/21", solar: 960, wind: 1290, bess: 420 },
    { date: "08/22", solar: 920, wind: 1380, bess: 450 },
    { date: "08/23", solar: 960, wind: 1410, bess: 460 },
  ];

  // Frequency bands for FFT spectrum
  const spectrumFrequencies = [
    "20Hz", "31Hz", "50Hz", "80Hz", "125Hz", "200Hz",
    "315Hz", "500Hz", "800Hz", "1.2k", "2.0k", "3.1k",
    "5.0k", "7.5k", "10k", "12k", "14k", "16k",
    "18k", "20k", "22k", "24k", "26k", "28k"
  ];

  const getBandColor = (idx: number) => {
    if (idx < 6) return "#06B6D4"; // Cyan: sub-harmonics
    if (idx < 12) return "#7C3AED"; // Violet: 1X RPM
    if (idx < 18) return "#10B981"; // Emerald: High-freq FFT
    return "#EF4444"; // Crimson: Ultrasonic bearing friction
  };

  // Generation Mix breakdown
  const GENERATION_MIX = [
    { label: "Solar PV Arrays", value: 960, percent: 38.6, color: "#F59E0B" },
    { label: "Wind Turbines", value: 1040, percent: 41.8, color: "#06B6D4" },
    { label: "BESS Storage", value: 348, percent: 14.0, color: "#7C3AED" },
    { label: "Grid Peakers", value: 140, percent: 5.6, color: "#10B981" },
  ];

  // Cluster Readiness Scores
  const CLUSTER_SCORES = [
    ["Mojave Solar One", 98.2, "#10B981"],
    ["Roscoe Wind Fleet", 96.4, "#06B6D4"],
    ["Moss Landing BESS", 99.1, "#7C3AED"],
    ["Sonoran Array B", 92.5, "#F59E0B"],
    ["Midwest Interconnect", 94.0, "#10B981"],
  ] as const;

  // AI SCADA Precision Metrics
  const AI_PRECISION = [
    ["Inverter MPPT Dynamic Tuning", 99.4],
    ["Turbine Blade Wake Minimization", 97.8],
    ["Transformer Thermal Risk Forecasting", 98.6],
    ["IEC 61850 Trip Interlock Latency", 99.9],
    ["Battery Degradation (SOH) Precision", 96.7],
  ] as const;

  // Footer cards
  const FOOTER_CARDS = [
    {
      label: "Substation Thermal Gradient",
      value: `${thermalTemp.toFixed(1)}°C`,
      highlight: "18.0°C headroom",
      highlightTone: "#10B981",
      body: "500kV Main Step-Up XFMR operating well within IEC thermal threshold · Oil cooling nominal",
    },
    {
      label: "Active Field Operations & Work Orders",
      value: "6 Units",
      highlight: "100% encrypted sync",
      highlightTone: "#06B6D4",
      body: "Field technician mobile checklists synchronizing live telemetry via SCIO satellite bridge",
    },
    {
      label: "PPA Generation Adherence · MTD",
      value: "+10.4%",
      highlight: "above contract quota",
      highlightTone: "#10B981",
      body: "Renewable power generation dispatch outperforming PPA contractual baseline by 1,740 MWh",
    },
  ];

  // Sorted plants for leaderboards
  const sortedByGeneration = [...plants].sort((a: any, b: any) => (b.currentPower || b.capacity) - (a.currentPower || a.capacity));
  const topPlants = sortedByGeneration.slice(0, 5);
  const strugglingPlants = [...plants]
    .filter((p: any) => p.status !== "online" || p.healthScore < 90)
    .sort((a: any, b: any) => a.healthScore - b.healthScore)
    .slice(0, 5);

  const thermalZones = [
    { name: "500kV Main XFMR", temp: thermalTemp, status: thermalTemp > 60 ? "Elevated" : "Nominal", color: thermalTemp > 60 ? "#F59E0B" : "#10B981", limit: "75°C" },
    { name: "Turbine Gen ST-01", temp: Math.max(58, thermalTemp + 12.4), status: "Elevated", color: "#F59E0B", limit: "85°C" },
    { name: "Inverter Array INV-A", temp: Math.max(32, thermalTemp - 14.1), status: "Optimal", color: "#06B6D4", limit: "65°C" },
    { name: "BESS Bank Alpha", temp: Math.max(22, thermalTemp - 28.5), status: "Optimal", color: "#10B981", limit: "45°C" }
  ];

  return (
    <section className="bg-white dark:bg-[#0B0D0F] rounded-2xl border border-slate-200 dark:border-white/[0.08] px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-10 shadow-sm dark:shadow-2xl transition-colors">
      <div className="mx-auto w-full max-w-[1360px] space-y-8">
        
        {/* ==================== 1. TOP HERO SECTION INTRO ==================== */}
        <div className="flex flex-col justify-between gap-6 border-b border-slate-200 dark:border-white/[0.07] pb-8 xl:flex-row xl:items-end">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-50 dark:border-white/[0.09] dark:bg-white/[0.03] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-emerald-800 dark:text-[#10B981] font-bold">
              <Zap className="h-3.5 w-3.5" />
              01 — GRID · UTILITIES & RENEWABLE ENERGY OPERATIONS CONTROL TOWER
            </div>
            <h1 className="text-2xl font-black tracking-tight text-[#090D16] dark:text-white sm:text-3xl lg:text-4xl">
              One Control Tower for Renewable & Hybrid Grid Assets
            </h1>
            <p className="max-w-3xl text-sm leading-relaxed text-slate-800 dark:text-white/60 sm:text-[14.5px] font-medium">
              Centralized, real-time SCADA telemetry into utility solar PV arrays, wind turbine farms, BESS storage banks,
              substation thermals, and automated NERC/IEC trip interlocks — with sub-second node diagnostics behind every number.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onSelectPlant("plant_1")}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white shadow-xs dark:shadow-none dark:border-white/[0.12] dark:bg-[#101315] px-4 py-2.5 font-mono text-xs font-bold text-slate-900 dark:text-white/80 transition-all hover:border-[#10B981]/50 hover:bg-[#10B981]/10 hover:text-emerald-800 dark:hover:text-white"
            >
              <Layers className="h-4 w-4 text-emerald-700 dark:text-[#10B981]" />
              <span>Plant Infrastructure Registry</span>
              <ArrowUpRight className="h-3.5 w-3.5 opacity-70" />
            </button>
            <button
              onClick={() => onSelectPlant("plant_1")}
              className="inline-flex items-center gap-2 rounded-xl border border-rose-300 bg-rose-50 dark:border-[#F0526B]/30 dark:bg-[#F0526B]/10 px-4 py-2.5 font-mono text-xs font-bold text-rose-900 dark:text-[#F0526B] transition-all hover:border-rose-400 dark:hover:border-[#F0526B]/60 hover:bg-rose-100 dark:hover:bg-[#F0526B]/20"
            >
              <CircleAlert className="h-4 w-4" />
              <span>2 SCADA Priority Trips</span>
            </button>
          </div>
        </div>

        {/* ==================== 2. MAIN CONTROL TOWER SHELL ==================== */}
        <motion.div
          className="overflow-hidden rounded-2xl border border-slate-200 dark:border-white/[0.07] bg-[#F8FAFC] dark:bg-[#101315] shadow-sm dark:shadow-2xl transition-colors"
          variants={stagger(0.08, 0.12)}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_WIDE}
        >
          {/* Sub-Nav Header Bar */}
          <motion.div
            variants={fadeUp}
            className="flex flex-wrap items-center justify-between gap-x-5 gap-y-3 border-b border-slate-200 dark:border-white/[0.07] bg-[#F1F5F9] dark:bg-[#0E1113] px-4 py-3 sm:px-6 transition-colors"
          >
            <div className="flex items-center gap-4">
              <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-slate-950 dark:text-white/60 font-black">
                CONTROL TOWER
              </span>
              <span className="h-3 w-[1px] bg-slate-300 dark:bg-white/[0.1]" />
              <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                {TABS.map((tab) => {
                  const isActive = selectedTab === tab;
                  return (
                    <button
                      key={tab}
                      onClick={() => setSelectedTab(tab)}
                      className={`relative px-3 py-1.5 text-xs font-bold transition-all rounded-md ${
                        isActive
                          ? "text-black bg-white shadow-xs dark:text-white dark:bg-white/[0.06] font-black"
                          : "text-slate-800 hover:text-black hover:bg-white/80 dark:text-white/50 dark:hover:text-white/80 dark:hover:bg-white/[0.02]"
                      }`}
                    >
                      {tab}
                      {isActive && (
                        <motion.span
                          layoutId="activeEnergyTabUnderline"
                          className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-emerald-600 dark:bg-[#10B981]"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-emerald-800 dark:text-[#2FBF71] font-black">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 dark:bg-[#2FBF71] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600 dark:bg-[#2FBF71]" />
              </span>
              <span>Live · Global SCADA Grid Feed · 50 Infra Nodes</span>
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
                    {/* KPI 1: Total Grid Pool */}
                    <div className="rounded-xl border border-slate-200/90 dark:border-white/[0.07] bg-white dark:bg-[#FFFDFA]/[0.02] p-4 transition-all hover:border-slate-300 dark:hover:border-white/[0.14] shadow-xs dark:shadow-none">
                      <p className="font-mono text-[11px] uppercase tracking-[0.13em] text-slate-900 dark:text-white/60 font-bold sm:text-[11.5px]">
                        Total Grid Pool Capacity
                      </p>
                      <p className="mt-3 text-[32px] font-black leading-none tracking-[-0.03em] text-black dark:text-white sm:text-[38px]">
                        <CountUp to={2.49} decimals={2} />
                        <span className="text-[18px] font-bold text-slate-800 dark:text-white/55 ml-1">GW</span>
                      </p>
                      <span className="mt-4 block h-1 overflow-hidden rounded-full bg-slate-200 dark:bg-[#FFFDFA]/[0.06]">
                        <motion.span
                          className="block h-full rounded-full bg-[#06B6D4] dark:bg-[#3FC8D8]"
                          initial={{ width: 0 }}
                          animate={{ width: "99.9%" }}
                          transition={{ duration: 0.8, ease: ENTRANCE, delay: 0.1 }}
                        />
                      </span>
                    </div>

                    {/* KPI 2: Live Generation Output */}
                    <div className="rounded-xl border border-slate-200/90 dark:border-white/[0.07] bg-white dark:bg-[#FFFDFA]/[0.02] p-4 transition-all hover:border-slate-300 dark:hover:border-white/[0.14] shadow-xs dark:shadow-none">
                      <p className="font-mono text-[11px] uppercase tracking-[0.13em] text-slate-900 dark:text-white/60 font-bold sm:text-[11.5px]">
                        Live Generation Output
                      </p>
                      <p className="mt-3 text-[32px] font-black leading-none tracking-[-0.03em] text-black dark:text-white sm:text-[38px]">
                        <CountUp to={livePower} decimals={1} />
                        <span className="text-[18px] font-bold text-slate-800 dark:text-white/55 ml-1">MW</span>
                      </p>
                      <span className="mt-4 block h-1 overflow-hidden rounded-full bg-slate-200 dark:bg-[#FFFDFA]/[0.06]">
                        <motion.span
                          className="block h-full rounded-full bg-[#10B981] dark:bg-[#2FBF71]"
                          initial={{ width: 0 }}
                          animate={{ width: `${loadFactor}%` }}
                          transition={{ duration: 0.8, ease: ENTRANCE, delay: 0.2 }}
                        />
                      </span>
                    </div>

                    {/* KPI 3: Fleet MTBF & Reliability */}
                    <div className="rounded-xl border border-slate-200/90 dark:border-white/[0.07] bg-white dark:bg-[#FFFDFA]/[0.02] p-4 transition-all hover:border-slate-300 dark:hover:border-white/[0.14] shadow-xs dark:shadow-none">
                      <p className="font-mono text-[11px] uppercase tracking-[0.13em] text-slate-900 dark:text-white/60 font-bold sm:text-[11.5px]">
                        Fleet Reliability Factor
                      </p>
                      <p className="mt-3 text-[32px] font-black leading-none tracking-[-0.03em] text-black dark:text-white sm:text-[38px]">
                        <CountUp to={fleetHealth} decimals={1} />
                        <span className="text-[18px] font-bold text-slate-800 dark:text-white/55 ml-0.5">%</span>
                      </p>
                      <span className="mt-4 block h-1 overflow-hidden rounded-full bg-slate-200 dark:bg-[#FFFDFA]/[0.06]">
                        <motion.span
                          className="block h-full rounded-full bg-[#7C3AED] dark:bg-[#8B5CF6]"
                          initial={{ width: 0 }}
                          animate={{ width: `${fleetHealth}%` }}
                          transition={{ duration: 0.8, ease: ENTRANCE, delay: 0.3 }}
                        />
                      </span>
                    </div>

                    {/* KPI 4: Active SCADA Priority Alarms */}
                    <div className="rounded-xl border border-rose-300 bg-rose-50/80 dark:border-[#F0526B]/30 dark:bg-[#F0526B]/[0.07] p-4 shadow-xs dark:shadow-none">
                      <p className="font-mono text-[11px] uppercase tracking-[0.13em] text-rose-900 dark:text-[#F0526B]/80 font-bold sm:text-[11.5px]">
                        Grid Alarm Incidents
                      </p>
                      <p className="mt-3 text-[32px] font-black leading-none tracking-[-0.03em] text-rose-950 dark:text-white sm:text-[38px]">
                        <CountUp to={2} />
                        <span className="text-[18px] font-bold text-rose-800 dark:text-white/55 ml-1">Active</span>
                      </p>
                      <p className="mt-3 font-mono text-[11px] text-rose-900 dark:text-[#F0526B] font-bold sm:text-[11.5px]">
                        1 IGBT junction overheat · 1 Yaw offset discrepancy
                      </p>
                    </div>
                  </div>

                  {/* Middle Row 1: Generation Dispatch Waveform + Generation Mix Radial Donut */}
                  <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
                    <Card
                      title="Multi-Source Generation Profile · 14-Day Power Dispatch"
                      accentColor="#10B981"
                      badge={
                        <div className="flex items-center gap-2.5 font-mono text-[10.5px] font-bold">
                          <span className="flex items-center gap-1 text-[#D97706]"><span className="h-1.5 w-1.5 rounded-full bg-[#D97706]" /> Solar</span>
                          <span className="flex items-center gap-1 text-[#0891B2]"><span className="h-1.5 w-1.5 rounded-full bg-[#0891B2]" /> Wind</span>
                          <span className="flex items-center gap-1 text-[#7C3AED]"><span className="h-1.5 w-1.5 rounded-full bg-[#7C3AED]" /> BESS</span>
                        </div>
                      }
                    >
                      <div className="mt-4 h-[220px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorSolarE" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.05}/>
                              </linearGradient>
                              <linearGradient id="colorWindE" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.05}/>
                              </linearGradient>
                              <linearGradient id="colorBessE" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="#7C3AED" stopOpacity={0.05}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-300 dark:text-white/[0.05]" vertical={false} />
                            <XAxis dataKey="date" stroke="currentColor" className="text-slate-900 dark:text-white/40 font-bold" fontSize={10.5} tickLine={false} />
                            <YAxis stroke="currentColor" className="text-slate-900 dark:text-white/40 font-bold" fontSize={10.5} tickLine={false} axisLine={false} />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "var(--color-panel, #FFFFFF)",
                                borderColor: "var(--color-borderMuted, #E2E8F0)",
                                borderRadius: "10px",
                                fontSize: "11px",
                                fontFamily: "monospace",
                                color: "var(--color-textBright, #090D16)",
                                boxShadow: "0 4px 20px rgba(0,0,0,0.12)"
                              }}
                            />
                            <Area type="monotone" dataKey="solar" name="Solar" stroke="#D97706" strokeWidth={2} fillOpacity={1} fill="url(#colorSolarE)" />
                            <Area type="monotone" dataKey="wind" name="Wind" stroke="#0891B2" strokeWidth={2} fillOpacity={1} fill="url(#colorWindE)" />
                            <Area type="monotone" dataKey="bess" name="BESS" stroke="#7C3AED" strokeWidth={2} fillOpacity={1} fill="url(#colorBessE)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </Card>

                    <Card
                      title="Grid Generation Mix Distribution"
                      accentColor="#06B6D4"
                    >
                      <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row">
                        <div className="relative grid h-[140px] w-[140px] shrink-0 place-items-center">
                          <svg className="h-full w-full -rotate-90" viewBox="0 0 42 42">
                            <circle
                              cx="21"
                              cy="21"
                              r="15.915"
                              fill="transparent"
                              stroke="currentColor"
                              className="text-slate-200 dark:text-white/[0.05]"
                              strokeWidth="4"
                            />
                            {GENERATION_MIX.map((item, index) => {
                              const fraction = item.percent / 100;
                              const offset = GENERATION_MIX.slice(0, index).reduce(
                                (sum, current) => sum + current.percent / 100,
                                0
                              );
                              return (
                                <motion.circle
                                  key={item.label}
                                  cx="21"
                                  cy="21"
                                  r="15.915"
                                  fill="transparent"
                                  stroke={item.color}
                                  strokeWidth="4.2"
                                  pathLength={1}
                                  strokeDasharray={`${fraction} ${1 - fraction}`}
                                  strokeDashoffset={-offset}
                                  initial={{ strokeDasharray: "0 1" }}
                                  whileInView={{ strokeDasharray: `${fraction} ${1 - fraction}` }}
                                  viewport={{ once: true, amount: 0.6 }}
                                  transition={{
                                    duration: 0.9,
                                    ease: ENTRANCE,
                                    delay: 0.15 + index * 0.1,
                                  }}
                                />
                              );
                            })}
                          </svg>
                          <span className="absolute inset-0 grid place-items-center text-center">
                            <span>
                              <span className="block text-[19px] font-black leading-none text-black dark:text-white">
                                <CountUp to={2488} />
                              </span>
                              <span className="mt-1 block font-mono text-[9.5px] uppercase tracking-[0.14em] text-slate-800 dark:text-white/40 font-bold">
                                MW Total
                              </span>
                            </span>
                          </span>
                        </div>

                        <ul className="min-w-0 flex-1 space-y-2.5 w-full">
                          {GENERATION_MIX.map((item) => (
                            <li key={item.label} className="flex items-center justify-between gap-2 text-xs">
                              <span className="flex items-center gap-2 truncate">
                                <span
                                  className="h-2 w-2 shrink-0 rounded-full"
                                  style={{ background: item.color }}
                                />
                                <span className="truncate text-slate-900 dark:text-white/80 font-bold">{item.label}</span>
                              </span>
                              <span className="font-mono text-black dark:text-white font-black">
                                {item.value} MW ({item.percent}%)
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </Card>
                  </div>

                  {/* Middle Row 2: Cluster Availability & AI SCADA Sensor Precision */}
                  <div className="grid gap-4 lg:grid-cols-2">
                    <Card
                      title="Cluster Availability & SCADA Readiness"
                      accentColor="#10B981"
                      badge={
                        <span className="font-mono text-[10.5px] uppercase tracking-wider text-slate-900 dark:text-white/60 font-bold">
                          42 of 50 Online
                        </span>
                      }
                    >
                      <div className="mt-5 space-y-3.5">
                        {CLUSTER_SCORES.map(([cluster, percent, color], index) => (
                          <Meter
                            key={cluster}
                            label={cluster}
                            display={`${percent}%`}
                            percent={percent}
                            color={color}
                            delay={index * 0.07}
                          />
                        ))}
                      </div>
                    </Card>

                    <Card
                      title="AI SCADA Sensor & Anomaly Detection Precision"
                      accentColor="#06B6D4"
                      badge={
                        <span className="font-mono text-[10.5px] uppercase tracking-wider text-cyan-900 dark:text-[#3FC8D8]/80 font-bold">
                          SCIO PowerOps Engine v4.2
                        </span>
                      }
                    >
                      <div className="mt-5 space-y-3.5">
                        {AI_PRECISION.map(([metric, percent], index) => (
                          <Meter
                            key={metric}
                            label={metric}
                            display={`${percent}%`}
                            percent={percent}
                            color="#06B6D4"
                            delay={index * 0.07}
                          />
                        ))}
                      </div>
                    </Card>
                  </div>

                  {/* Bottom Row: 3 Operational Telemetry Footer Cards */}
                  <div className="grid gap-3 sm:grid-cols-3">
                    {FOOTER_CARDS.map((card) => (
                      <div
                        key={card.label}
                        className="rounded-xl border border-slate-200/90 dark:border-white/[0.07] bg-white dark:bg-[#FFFDFA]/[0.02] p-4 transition-all hover:border-slate-300 dark:hover:border-white/[0.14] shadow-xs dark:shadow-none"
                      >
                        <p className="font-mono text-[11px] uppercase tracking-[0.13em] text-slate-900 dark:text-white/50 font-bold sm:text-[11.5px]">
                          {card.label}
                        </p>
                        <p className="mt-3 flex items-baseline gap-2">
                          <span className="text-[25px] font-black leading-none text-black dark:text-white">
                            {card.value}
                          </span>
                          <span
                            className="text-[12px] font-bold"
                            style={{ color: card.highlightTone }}
                          >
                            {card.highlight}
                          </span>
                        </p>
                        <p className="mt-2.5 text-[12px] leading-relaxed text-slate-800 dark:text-white/50 font-medium">
                          {card.body}
                        </p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* ==================== TAB 2: GENERATION & SCADA ==================== */}
              {selectedTab === "Generation & SCADA" && (
                <motion.div
                  key="scada-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="grid gap-4 sm:grid-cols-3">
                    <Card title="Grid Frequency Stability" accentColor="#10B981">
                      <div className="mt-3">
                        <span className="text-[30px] font-black font-mono text-black dark:text-white">
                          {gridFreq.toFixed(2)}
                        </span>
                        <span className="text-xs text-slate-800 dark:text-white/50 font-mono font-bold ml-1">Hz</span>
                        <p className="mt-1 text-xs text-emerald-800 dark:text-[#2FBF71] font-mono font-bold">
                          Nominal Corridor: 49.95 - 50.05 Hz
                        </p>
                      </div>
                    </Card>

                    <Card title="Voltage Interconnection (HV)" accentColor="#06B6D4">
                      <div className="mt-3">
                        <span className="text-[30px] font-black font-mono text-black dark:text-white">
                          500.2
                        </span>
                        <span className="text-xs text-slate-800 dark:text-white/50 font-mono font-bold ml-1">kV</span>
                        <p className="mt-1 text-xs text-cyan-800 dark:text-[#3FC8D8] font-mono font-bold">
                          Phase Balance: 99.8% Sym
                        </p>
                      </div>
                    </Card>

                    <Card title="Power Factor (Cos φ)" accentColor="#7C3AED">
                      <div className="mt-3">
                        <span className="text-[30px] font-black font-mono text-black dark:text-white">
                          0.98
                        </span>
                        <span className="text-xs text-slate-800 dark:text-white/50 font-mono font-bold ml-1">Inductive</span>
                        <p className="mt-1 text-xs text-violet-800 dark:text-[#8B5CF6] font-mono font-bold">
                          Reactive Power: 18.4 MVAr
                        </p>
                      </div>
                    </Card>
                  </div>

                  <Card
                    title="Real-Time 14-Day SCADA Power Dispatch Curve"
                    accentColor="#10B981"
                  >
                    <div className="mt-4 h-[280px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colSolarFull" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.45}/>
                              <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colWindFull" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.45}/>
                              <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colBessFull" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.45}/>
                              <stop offset="95%" stopColor="#7C3AED" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-300 dark:text-white/[0.05]" />
                          <XAxis dataKey="date" stroke="currentColor" className="text-slate-900 dark:text-white/40 font-bold" fontSize={11} />
                          <YAxis stroke="currentColor" className="text-slate-900 dark:text-white/40 font-bold" fontSize={11} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "var(--color-panel, #FFFFFF)",
                              borderColor: "var(--color-borderMuted, #E2E8F0)",
                              borderRadius: "10px",
                              fontSize: "11px",
                              fontFamily: "monospace",
                              color: "var(--color-textBright, #090D16)",
                              boxShadow: "0 4px 20px rgba(0,0,0,0.12)"
                            }}
                          />
                          <Area type="monotone" dataKey="solar" name="Solar PV" stroke="#D97706" strokeWidth={2.2} fillOpacity={1} fill="url(#colSolarFull)" />
                          <Area type="monotone" dataKey="wind" name="Wind Fleet" stroke="#0891B2" strokeWidth={2.2} fillOpacity={1} fill="url(#colWindFull)" />
                          <Area type="monotone" dataKey="bess" name="BESS Battery" stroke="#7C3AED" strokeWidth={2.2} fillOpacity={1} fill="url(#colBessFull)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* ==================== TAB 3: ASSET HEALTH & FFT ==================== */}
              {selectedTab === "Asset Health & FFT" && (
                <motion.div
                  key="fft-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* High-Precision 24-Band FFT Audio & Vibration Spectral Analyzer */}
                  <Card
                    title="DSP Vibration & Acoustic Harmonic Telemetry"
                    accentColor="#06B6D4"
                    badge={
                      <div className="flex items-center gap-3 font-mono text-[10.5px] font-bold">
                        <span className="flex items-center gap-1 text-[#0891B2]"><span className="h-1.5 w-1.5 rounded-full bg-[#0891B2]" /> Sub-harmonic</span>
                        <span className="flex items-center gap-1 text-[#7C3AED]"><span className="h-1.5 w-1.5 rounded-full bg-[#7C3AED]" /> 1X RPM Fundamental</span>
                        <span className="flex items-center gap-1 text-[#059669]"><span className="h-1.5 w-1.5 rounded-full bg-[#059669]" /> High-freq FFT</span>
                        <span className="flex items-center gap-1 text-[#DC2626]"><span className="h-1.5 w-1.5 rounded-full bg-[#DC2626]" /> Ultrasonic</span>
                      </div>
                    }
                  >
                    <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-[#080A0D] border border-slate-200 dark:border-white/[0.05]">
                      <div className="flex items-center justify-between mb-3 text-xs font-mono text-slate-900 dark:text-white/70 border-b border-slate-200 dark:border-white/[0.05] pb-2 font-bold">
                        <span>24-BAND FFT SPECTRUM (20Hz - 28kHz) · LIVE 96.0 kS/s</span>
                        <span className="text-emerald-800 dark:text-[#2FBF71] font-black">ACOUSTIC BEARING SIGNATURE: NOMINAL</span>
                      </div>

                      {/* Precision Slim Bars Container */}
                      <div className="h-44 flex items-end justify-between gap-1 sm:gap-1.5 pt-4">
                        {spectrumAmplitudes.map((amp, idx) => {
                          const freqLabel = spectrumFrequencies[idx] || `${idx * 1.2}kHz`;
                          const barColor = getBandColor(idx);
                          return (
                            <div
                              key={idx}
                              className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group cursor-pointer"
                              title={`${freqLabel}: ${amp}% amplitude`}
                            >
                              <span className="opacity-0 group-hover:opacity-100 text-[9px] font-mono text-black dark:text-white transition-opacity font-black">
                                {amp}%
                              </span>
                              
                              <div className="w-full max-w-[14px] bg-slate-200/90 dark:bg-white/[0.04] rounded-t-[2px] overflow-hidden flex flex-col justify-end h-4/5">
                                <div
                                  className="w-full rounded-t-[2px] transition-all duration-300"
                                  style={{
                                    height: `${amp}%`,
                                    backgroundColor: barColor,
                                    boxShadow: `0 0 8px ${barColor}44`,
                                  }}
                                />
                              </div>

                              <span className="text-[8.5px] font-mono text-slate-900 dark:text-white/45 truncate max-w-[24px] font-bold">
                                {freqLabel}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </Card>

                  {/* Substation Thermal Matrix */}
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {thermalZones.map((zone) => (
                      <div
                        key={zone.name}
                        className="rounded-xl border border-slate-200/90 dark:border-white/[0.07] bg-white dark:bg-[#FFFDFA]/[0.02] p-4 transition-all hover:border-slate-300 dark:hover:border-white/[0.14] shadow-xs dark:shadow-none"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[11px] text-slate-900 dark:text-white/60 uppercase tracking-wider font-bold">
                            {zone.name}
                          </span>
                          <Flame className="h-3.5 w-3.5" style={{ color: zone.color }} />
                        </div>
                        <div className="mt-3">
                          <span className="text-2xl font-black font-mono text-black dark:text-white">
                            {zone.temp.toFixed(1)}°C
                          </span>
                          <span className="text-xs font-mono ml-2 font-black" style={{ color: zone.color }}>
                            {zone.status}
                          </span>
                        </div>
                        <div className="mt-3 h-1 overflow-hidden rounded-full bg-slate-200 dark:bg-[#FFFDFA]/[0.06]">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${Math.min(100, (zone.temp / 85) * 100)}%`,
                              backgroundColor: zone.color,
                            }}
                          />
                        </div>
                        <p className="mt-2 text-[10px] font-mono text-slate-800 dark:text-white/40 font-bold">
                          Threshold: {zone.limit}
                        </p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* ==================== TAB 4: ALARMS & INTERLOCKS ==================== */}
              {selectedTab === "Alarms & Interlocks" && (
                <motion.div
                  key="alarms-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="rounded-xl border border-slate-200/90 dark:border-white/[0.07] bg-white dark:bg-[#FFFDFA]/[0.02] p-5 shadow-xs dark:shadow-none">
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-white/[0.07] pb-4">
                      <div>
                        <h3 className="text-sm font-black text-black dark:text-white">
                          IEC 61850 SCADA Priority Alarms
                        </h3>
                        <p className="text-xs text-slate-800 dark:text-white/50 mt-0.5 font-medium">
                          Real-time substation bus events, inverter thermal trips, and automated interlocks
                        </p>
                      </div>
                      <span className="px-2.5 py-1 rounded-full border border-rose-300 bg-rose-50 dark:border-[#F0526B]/30 dark:bg-[#F0526B]/10 font-mono text-[10px] text-rose-900 dark:text-[#F0526B] font-bold uppercase">
                        2 Critical / High Active
                      </span>
                    </div>

                    <div className="mt-4 divide-y divide-slate-200 dark:divide-white/[0.05]">
                      <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-rose-300 bg-rose-50 dark:border-[#F0526B]/30 dark:bg-[#F0526B]/10 text-rose-700 dark:text-[#F0526B]">
                            <ShieldAlert className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-black dark:text-white">
                                Mojave Solar One - Inverter Array #04
                              </span>
                              <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-rose-100 text-rose-900 border border-rose-300 dark:bg-[#F0526B]/15 dark:text-[#F0526B] dark:border-[#F0526B]/30 font-black">
                                CRITICAL
                              </span>
                            </div>
                            <p className="text-xs text-slate-800 dark:text-white/50 mt-0.5 font-medium">
                              IGBT Junction Overheat · 84.2°C (14.2°C above nominal safety margin)
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => onSelectPlant("plant_1")}
                          className="font-mono text-xs text-emerald-800 dark:text-[#10B981] hover:underline flex items-center gap-1 shrink-0 font-bold"
                        >
                          <span>Inspect Plant Details</span>
                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-amber-300 bg-amber-50 dark:border-[#E8A33D]/30 dark:bg-[#E8A33D]/10 text-amber-700 dark:text-[#E8A33D]">
                            <AlertTriangle className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-black dark:text-white">
                                Roscoe Wind Farm - Turbine #12
                              </span>
                              <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 dark:bg-[#E8A33D]/15 dark:text-[#E8A33D] dark:border-[#E8A33D]/30 font-black">
                                WARNING
                              </span>
                            </div>
                            <p className="text-xs text-slate-800 dark:text-white/50 mt-0.5 font-medium">
                              Yaw Discrepancy · 0.8° offset relative to anemometer vector
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => onSelectPlant("plant_2")}
                          className="font-mono text-xs text-emerald-800 dark:text-[#10B981] hover:underline flex items-center gap-1 shrink-0 font-bold"
                        >
                          <span>Inspect Plant Details</span>
                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-violet-300 bg-violet-50 dark:border-[#8B5CF6]/30 dark:bg-[#8B5CF6]/10 text-violet-700 dark:text-[#8B5CF6]">
                            <Activity className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-black dark:text-white">
                                Moss Landing Storage - BESS Rack B2
                              </span>
                              <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-violet-100 text-violet-900 border border-violet-300 dark:bg-[#8B5CF6]/15 dark:text-[#8B5CF6] dark:border-[#8B5CF6]/30 font-black">
                                ADVISORY
                              </span>
                            </div>
                            <p className="text-xs text-slate-800 dark:text-white/50 mt-0.5 font-medium">
                              Cell ΔV Imbalance · 18mV variance during fast peak discharge cycle
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => onSelectPlant("plant_3")}
                          className="font-mono text-xs text-emerald-800 dark:text-[#10B981] hover:underline flex items-center gap-1 shrink-0 font-bold"
                        >
                          <span>Inspect Plant Details</span>
                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ==================== TAB 5: FLEET LEADERBOARD ==================== */}
              {selectedTab === "Fleet Leaderboard" && (
                <motion.div
                  key="leaderboard-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="grid gap-6 lg:grid-cols-2"
                >
                  {/* Top Generating Infrastructure */}
                  <div className="rounded-xl border border-slate-200/90 dark:border-white/[0.07] bg-white dark:bg-[#FFFDFA]/[0.02] p-5 shadow-xs dark:shadow-none">
                    <div className="flex items-center justify-between mb-4 border-b border-slate-200 dark:border-white/[0.07] pb-3">
                      <h3 className="text-sm font-black text-black dark:text-white">Top Generating Infrastructure</h3>
                      <span className="font-mono text-[10px] text-emerald-900 dark:text-[#2FBF71] bg-emerald-100 dark:bg-[#2FBF71]/10 px-2 py-0.5 rounded border border-emerald-300 dark:border-[#2FBF71]/20 font-black uppercase">
                        LIVE DISPATCH
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs font-mono">
                        <thead>
                          <tr className="border-b border-slate-200 dark:border-white/[0.07] text-slate-900 dark:text-white/60 font-black">
                            <th className="pb-2 font-black">PLANT NAME</th>
                            <th className="pb-2 font-black">TYPE</th>
                            <th className="pb-2 text-right font-black">CAPACITY</th>
                            <th className="pb-2 text-right font-black">OUTPUT</th>
                            <th className="pb-2 text-right font-black">ACTION</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200/80 dark:divide-white/[0.04]">
                          {topPlants.map((p: any) => (
                            <tr key={p._id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-all">
                              <td className="font-bold text-black dark:text-white py-3">{p.name}</td>
                              <td className="py-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                  p.type === "solar"
                                    ? "bg-amber-100 text-amber-950 border border-amber-300 dark:bg-[#E8A33D]/15 dark:text-[#E8A33D] dark:border-[#E8A33D]/30"
                                    : p.type === "wind"
                                    ? "bg-cyan-100 text-cyan-950 border border-cyan-300 dark:bg-[#3FC8D8]/15 dark:text-[#3FC8D8] dark:border-[#3FC8D8]/30"
                                    : "bg-violet-100 text-violet-950 border border-violet-300 dark:bg-[#8B5CF6]/15 dark:text-[#8B5CF6] dark:border-[#8B5CF6]/30"
                                }`}>
                                  {p.type}
                                </span>
                              </td>
                              <td className="text-right py-3 text-slate-900 dark:text-white/60 font-bold">{p.capacity} MW</td>
                              <td className="text-right text-emerald-800 dark:text-[#2FBF71] py-3 font-black">
                                {p.currentPower ? p.currentPower.toFixed(1) : p.capacity} MW
                              </td>
                              <td className="text-right py-3">
                                <button
                                  onClick={() => onSelectPlant(p._id)}
                                  className="text-slate-700 hover:text-black dark:text-white/40 dark:hover:text-white"
                                >
                                  <ChevronRight className="h-4 w-4 ml-auto" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Underperforming & Risk Sites */}
                  <div className="rounded-xl border border-slate-200/90 dark:border-white/[0.07] bg-white dark:bg-[#FFFDFA]/[0.02] p-5 shadow-xs dark:shadow-none">
                    <div className="flex items-center justify-between mb-4 border-b border-slate-200 dark:border-white/[0.07] pb-3">
                      <h3 className="text-sm font-black text-black dark:text-white">Underperforming & Risk Sites</h3>
                      <span className="font-mono text-[10px] text-rose-900 dark:text-[#F0526B] bg-rose-100 dark:bg-[#F0526B]/10 px-2 py-0.5 rounded border border-rose-300 dark:border-[#F0526B]/20 font-black uppercase">
                        INTERVENTION QUEUE
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs font-mono">
                        <thead>
                          <tr className="border-b border-slate-200 dark:border-white/[0.07] text-slate-900 dark:text-white/60 font-black">
                            <th className="pb-2 font-black">PLANT NAME</th>
                            <th className="pb-2 font-black">TYPE</th>
                            <th className="pb-2 text-right font-black">HEALTH</th>
                            <th className="pb-2 text-right font-black">STATUS</th>
                            <th className="pb-2 text-right font-black">ACTION</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200/80 dark:divide-white/[0.04]">
                          {strugglingPlants.map((p: any) => (
                            <tr key={p._id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-all">
                              <td className="font-bold text-black dark:text-white py-3">{p.name}</td>
                              <td className="py-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                  p.type === "solar"
                                    ? "bg-amber-100 text-amber-950 border border-amber-300 dark:bg-[#E8A33D]/15 dark:text-[#E8A33D] dark:border-[#E8A33D]/30"
                                    : p.type === "wind"
                                    ? "bg-cyan-100 text-cyan-950 border border-cyan-300 dark:bg-[#3FC8D8]/15 dark:text-[#3FC8D8] dark:border-[#3FC8D8]/30"
                                    : "bg-violet-100 text-violet-950 border border-violet-300 dark:bg-[#8B5CF6]/15 dark:text-[#8B5CF6] dark:border-[#8B5CF6]/30"
                                }`}>
                                  {p.type}
                                </span>
                              </td>
                              <td className={`text-right py-3 font-black ${
                                p.healthScore < 88 ? "text-rose-700 dark:text-[#F0526B]" : "text-amber-800 dark:text-[#E8A33D]"
                              }`}>
                                {p.healthScore.toFixed(1)}%
                              </td>
                              <td className="text-right py-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-black ${
                                  p.status === "offline"
                                    ? "bg-rose-100 text-rose-950 border border-rose-300 dark:bg-[#F0526B]/15 dark:text-[#F0526B] dark:border-[#F0526B]/30"
                                    : "bg-amber-100 text-amber-950 border border-amber-300 dark:bg-[#E8A33D]/15 dark:text-[#E8A33D] dark:border-[#E8A33D]/30"
                                }`}>
                                  {p.status}
                                </span>
                              </td>
                              <td className="text-right py-3">
                                <button
                                  onClick={() => onSelectPlant(p._id)}
                                  className="text-slate-700 hover:text-black dark:text-white/40 dark:hover:text-white"
                                >
                                  <ChevronRight className="h-4 w-4 ml-auto" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
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