"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Truck,
  Ship,
  Plane,
  Train,
  MapPin,
  ThermometerSnowflake,
  ShieldCheck,
  AlertTriangle,
  CircleAlert,
  Clock,
  ArrowRight,
  ArrowUpRight,
  TrendingUp,
  Package,
  Boxes,
  Navigation,
  Globe,
  Radio,
  BarChart3,
  Calendar,
  Layers,
  Sparkles,
  Zap,
  CheckCircle2,
  SlidersHorizontal,
  ExternalLink,
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

import dynamic from "next/dynamic";

const MultimodalFleetLiveMap = dynamic(
  () => import("./MultimodalFleetLiveMap"),
  { ssr: false, loading: () => <div className="h-96 w-full flex items-center justify-center font-mono text-xs text-white/40">Loading Multimodal GPS GIS Engine...</div> }
);

interface LogisticsControlCenterProps {
  onNavigate: (tab: string) => void;
  onCreateWorkOrder: (title: string, assetId: string, priority: string) => void;
  initialSubTab?: string;
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

// Interactive Sub-tabs for Logistics Tower
const TABS = [
  "Overview",
  "Live GPS Fleet Map",
  "Multimodal Shipments",
  "Cold-Chain IoT & Sensors",
  "Distribution Hubs & Bays",
  "Demurrage & Route AI",
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
  accentColor = "#3FC8D8",
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
    <div className="grid grid-cols-[110px_minmax(0,1fr)_48px] items-center gap-3 sm:grid-cols-[140px_minmax(0,1fr)_52px]">
      <span className="truncate font-mono text-[11px] text-white/50 sm:text-[11.5px]" title={label}>
        {label}
      </span>
      <span className="h-1.5 overflow-hidden rounded-full bg-[#FFFDFA]/[0.06]">
        <motion.span
          className="block h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          whileInView={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 1, ease: ENTRANCE, delay }}
        />
      </span>
      <span className="text-right font-mono text-[11px] text-white/75 sm:text-[11.5px]">
        {display ?? (typeof value === "number" ? `${value}%` : value)}
      </span>
    </div>
  );
}

export default function LogisticsControlCenter({
  onNavigate,
  onCreateWorkOrder,
  initialSubTab = "Overview",
}: LogisticsControlCenterProps) {
  const [selectedTab, setSelectedTab] = useState(initialSubTab);
  const [selectedShipmentId, setSelectedShipmentId] = useState<string>("SHP-8801");
  const [activeFreightFilter, setActiveFreightFilter] = useState<string>("All");
  const [liveTelemetryActive, setLiveTelemetryActive] = useState<boolean>(true);

  useEffect(() => {
    if (initialSubTab) {
      setSelectedTab(initialSubTab);
    }
  }, [initialSubTab]);

  // Active Multimodal Shipments
  const [shipments, setShipments] = useState([
    {
      id: "SHP-8801",
      trackingNumber: "TRK-GLOBAL-9942",
      mode: "Sea Freight",
      origin: "Rotterdam Europort (NL)",
      destination: "Houston Bayport (US)",
      carrier: "Maersk Triple-E Class",
      cargo: "High-Voltage Inverter Sub-Assemblies",
      status: "In Transit",
      eta: "2026-08-28 14:00 UTC",
      progressPercent: 74,
      coldChainRequired: true,
      currentTempC: -18.4,
      targetTempC: -18.0,
      humidityPercent: 82,
      riskLevel: "Low",
      demurrageRisk: "$0.00 (Cleared)",
    },
    {
      id: "SHP-8802",
      trackingNumber: "TRK-GLOBAL-6410",
      mode: "Air Cargo",
      origin: "Tokyo Haneda (HND)",
      destination: "Frankfurt CargoCity (FRA)",
      carrier: "Lufthansa Cargo B777F",
      cargo: "Lithium-Ion Cathode Raw Catalyst",
      status: "Customs Clearance",
      eta: "2026-08-24 19:30 UTC",
      progressPercent: 92,
      coldChainRequired: false,
      currentTempC: 19.2,
      targetTempC: 20.0,
      humidityPercent: 45,
      riskLevel: "Low",
      demurrageRisk: "$0.00 (On-Time)",
    },
    {
      id: "SHP-8803",
      trackingNumber: "TRK-GLOBAL-3108",
      mode: "Intermodal Rail",
      origin: "Chicago Logistics Park (US)",
      destination: "Long Beach Port Pier T (US)",
      carrier: "BNSF Double-Stack Intermodal",
      cargo: "Renewable Wind Nacelle Spares",
      status: "Delayed",
      eta: "2026-08-26 08:00 UTC",
      progressPercent: 48,
      coldChainRequired: false,
      currentTempC: 24.5,
      targetTempC: 22.0,
      humidityPercent: 60,
      riskLevel: "High",
      demurrageRisk: "$4,200 (Switching Delay)",
    },
    {
      id: "SHP-8804",
      trackingNumber: "TRK-GLOBAL-1954",
      mode: "OTR Heavy Truck",
      origin: "Plant Alpha Stamping Bay (DE)",
      destination: "Giga-Factory Warehouse Bay 4 (FR)",
      carrier: "Volvo FH Electric Heavy Haul",
      cargo: "Stamped EV Chassis Frame Lot 12",
      status: "In Transit",
      eta: "2026-08-24 22:15 UTC",
      progressPercent: 62,
      coldChainRequired: false,
      currentTempC: 21.0,
      targetTempC: 20.0,
      humidityPercent: 50,
      riskLevel: "Low",
      demurrageRisk: "$0.00 (Optimal)",
    }
  ]);

  // Warehouse Distribution Hub Capacity
  const [warehouseHubs] = useState([
    { id: "HUB-EU", name: "Rotterdam Euro-Hub DC", baysTotal: 48, baysOccupied: 42, pickRatePerHour: 1420, onTimeDispatch: 98.4, dwellTimeHours: 2.1 },
    { id: "HUB-NA", name: "Chicago Midwest Gateway DC", baysTotal: 64, baysOccupied: 58, pickRatePerHour: 1890, onTimeDispatch: 94.2, dwellTimeHours: 3.4 },
    { id: "HUB-APAC", name: "Singapore Tuas Logistics Hub", baysTotal: 80, baysOccupied: 72, pickRatePerHour: 2340, onTimeDispatch: 99.1, dwellTimeHours: 1.8 }
  ]);

  // Cold Chain Telemetry Series
  const [coldChainHistory] = useState([
    { time: "06:00", temp: -18.2, setpoint: -18.0, humidity: 80 },
    { time: "07:00", temp: -18.3, setpoint: -18.0, humidity: 81 },
    { time: "08:00", temp: -18.1, setpoint: -18.0, humidity: 82 },
    { time: "09:00", temp: -18.5, setpoint: -18.0, humidity: 83 },
    { time: "10:00", temp: -18.4, setpoint: -18.0, humidity: 82 },
    { time: "11:00", temp: -18.2, setpoint: -18.0, humidity: 81 },
    { time: "12:00", temp: -18.4, setpoint: -18.0, humidity: 82 },
  ]);

  // Live simulation ticker
  useEffect(() => {
    if (!liveTelemetryActive) return;
    const interval = setInterval(() => {
      setShipments(prev => prev.map(s => {
        const delta = +( (Math.random() - 0.5) * 0.2 ).toFixed(1);
        return {
          ...s,
          currentTempC: s.coldChainRequired ? +(-18.0 + delta).toFixed(1) : s.currentTempC
        };
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, [liveTelemetryActive]);

  const selectedShipment = shipments.find(s => s.id === selectedShipmentId) || shipments[0];

  const filteredShipments = activeFreightFilter === "All"
    ? shipments
    : shipments.filter(s => s.mode === activeFreightFilter);

  // High-level calculations
  const onScheduleCount = shipments.filter(s => s.status !== "Delayed").length;
  const otifScore = 96.8;
  const coldChainScore = 99.8;
  const totalBays = warehouseHubs.reduce((acc, h) => acc + h.baysTotal, 0);
  const occupiedBays = warehouseHubs.reduce((acc, h) => acc + h.baysOccupied, 0);
  const bayOccupancyPct = Math.round((occupiedBays / totalBays) * 100);

  // Footer highlights
  const FOOTER_HIGHLIGHTS = [
    {
      label: "Multimodal Bottlenecks",
      value: "1 Rail Alert",
      highlight: "Chicago Hub",
      highlightTone: "#E8A33D",
      body: "BNSF switching delay (+4.2h) · Re-routing 2 container units to expedited flatbed",
    },
    {
      label: "Connected Reefer Fleet",
      value: "184 Units",
      highlight: "Live Telemetry",
      highlightTone: "#2FBF71",
      body: "Zero cold-chain thermal excursions across 42 active trade lanes",
    },
    {
      label: "Demurrage Avoidance Trend",
      value: "−32%",
      highlight: "improving",
      highlightTone: "#2FBF71",
      body: "Saved $38,400 in port detention charges via predictive customs pre-clearance",
    },
  ];

  return (
    <section className="bg-[#0B0D0F] rounded-2xl border border-white/[0.08] px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-10 shadow-2xl">
      <div className="mx-auto w-full max-w-[1360px] space-y-8">
        
        {/* ==================== 1. TOP HERO SECTION INTRO ==================== */}
        <div className="flex flex-col justify-between gap-6 border-b border-white/[0.07] pb-8 xl:flex-row xl:items-end">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.09] bg-white/[0.03] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-[#3FC8D8]">
              <Globe className="h-3.5 w-3.5" />
              01 — MULTIMODAL · GLOBAL LOGISTICS &amp; SUPPLY CONTROL TOWER
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
              One Control Tower for Global Multimodal Logistics &amp; Supply
            </h1>
            <p className="max-w-3xl text-sm leading-relaxed text-white/50 sm:text-[14.5px]">
              Real-time GPS multimodal routing, cold-chain IoT temperature telemetry, cross-dock warehouse capacity,
              and demurrage cost prevention across global trade corridors.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate("supply")}
              className="inline-flex items-center gap-2 rounded-xl border border-white/[0.12] bg-[#101315] px-4 py-2.5 font-mono text-xs font-semibold text-white/80 transition-all hover:border-[#3FC8D8]/50 hover:bg-[#3FC8D8]/10 hover:text-white"
            >
              <Navigation className="h-4 w-4 text-[#3FC8D8]" />
              <span>Global GPS &amp; AIS Live Map</span>
              <ArrowUpRight className="h-3.5 w-3.5 opacity-60" />
            </button>
            <button
              onClick={() => onCreateWorkOrder("Expedite Freight Carrier", selectedShipment.id, "High")}
              className="inline-flex items-center gap-2 rounded-xl border border-[#3FC8D8]/30 bg-[#3FC8D8]/10 px-4 py-2.5 font-mono text-xs font-semibold text-[#3FC8D8] transition-all hover:border-[#3FC8D8]/60 hover:bg-[#3FC8D8]/20"
            >
              <Zap className="h-4 w-4" />
              <span>Expedite Freight Carrier</span>
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
                          layoutId="activeLogisticsTabUnderline"
                          className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-[#3FC8D8]"
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
              <span>Live · Multimodal GPS Telemetry · 42 Trade Lanes Active</span>
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
                  <motion.div
                    variants={fadeUp}
                    className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
                  >
                    {/* KPI 1: Active Consignments */}
                    <div className="rounded-xl border border-white/[0.07] bg-[#FFFDFA]/[0.02] p-4 transition-all hover:border-white/[0.14]">
                      <p className="font-mono text-[11px] uppercase tracking-[0.13em] text-white/40 sm:text-[11.5px]">
                        Active Consignments
                      </p>
                      <p className="mt-3 text-[32px] font-semibold leading-none tracking-[-0.03em] text-white sm:text-[38px]">
                        <CountUp to={1248} />
                      </p>
                      <span className="mt-4 block h-1 overflow-hidden rounded-full bg-[#FFFDFA]/[0.06]">
                        <motion.span
                          className="block h-full rounded-full bg-[#3FC8D8]"
                          initial={{ width: 0 }}
                          whileInView={{ width: "98.2%" }}
                          viewport={{ once: true, amount: 0.6 }}
                          transition={{ duration: 1.2, ease: ENTRANCE, delay: 0.1 }}
                        />
                      </span>
                    </div>

                    {/* KPI 2: On-Time In-Full (OTIF) */}
                    <div className="rounded-xl border border-white/[0.07] bg-[#FFFDFA]/[0.02] p-4 transition-all hover:border-white/[0.14]">
                      <p className="font-mono text-[11px] uppercase tracking-[0.13em] text-white/40 sm:text-[11.5px]">
                        OTIF Delivery SLA
                      </p>
                      <p className="mt-3 text-[32px] font-semibold leading-none tracking-[-0.03em] text-white sm:text-[38px]">
                        <CountUp to={otifScore} decimals={1} />
                        <span className="text-[18px] font-medium text-white/55 ml-0.5">%</span>
                      </p>
                      <span className="mt-4 block h-1 overflow-hidden rounded-full bg-[#FFFDFA]/[0.06]">
                        <motion.span
                          className="block h-full rounded-full bg-[#2FBF71]"
                          initial={{ width: 0 }}
                          whileInView={{ width: `${otifScore}%` }}
                          viewport={{ once: true, amount: 0.6 }}
                          transition={{ duration: 1.2, ease: ENTRANCE, delay: 0.2 }}
                        />
                      </span>
                    </div>

                    {/* KPI 3: Cold-Chain IoT Compliance */}
                    <div className="rounded-xl border border-white/[0.07] bg-[#FFFDFA]/[0.02] p-4 transition-all hover:border-white/[0.14]">
                      <p className="font-mono text-[11px] uppercase tracking-[0.13em] text-white/40 sm:text-[11.5px]">
                        Cold-Chain IoT Compliance
                      </p>
                      <p className="mt-3 text-[32px] font-semibold leading-none tracking-[-0.03em] text-white sm:text-[38px]">
                        <CountUp to={coldChainScore} decimals={1} />
                        <span className="text-[18px] font-medium text-white/55 ml-0.5">%</span>
                      </p>
                      <span className="mt-4 block h-1 overflow-hidden rounded-full bg-[#FFFDFA]/[0.06]">
                        <motion.span
                          className="block h-full rounded-full bg-[#8B5CF6]"
                          initial={{ width: 0 }}
                          whileInView={{ width: `${coldChainScore}%` }}
                          viewport={{ once: true, amount: 0.6 }}
                          transition={{ duration: 1.2, ease: ENTRANCE, delay: 0.3 }}
                        />
                      </span>
                    </div>

                    {/* KPI 4: Demurrage Risk Alert */}
                    <div className="rounded-xl border border-[#F0526B]/30 bg-[#F0526B]/[0.07] p-4">
                      <p className="font-mono text-[11px] uppercase tracking-[0.13em] text-[#F0526B]/80 sm:text-[11.5px]">
                        Demurrage Risk Exposure
                      </p>
                      <p className="mt-3 text-[32px] font-semibold leading-none tracking-[-0.03em] text-white sm:text-[38px]">
                        $<CountUp to={4200} />
                      </p>
                      <p className="mt-1 font-mono text-[11px] text-[#F0526B]/90 sm:text-[11.5px]">
                        1 Rail Switching Delay (Chicago Hub)
                      </p>
                    </div>
                  </motion.div>

                  {/* Mid Section Grid: 4 Detailed Metric Cards */}
                  <motion.div
                    variants={fadeUp}
                    className="grid gap-4 sm:gap-6 lg:grid-cols-2"
                  >
                    {/* Card 1: Multimodal Corridor Performance */}
                    <Card
                      title="Multimodal Corridor Performance"
                      accentColor="#3FC8D8"
                      badge={
                        <span className="font-mono text-[11px] text-white/40">
                          {shipments.length} Active Corridors
                        </span>
                      }
                    >
                      <div className="mt-4 space-y-3">
                        {shipments.map((s, idx) => {
                          const color = s.status === "Delayed" ? "#F0526B" : s.status === "In Transit" ? "#2FBF71" : "#3FC8D8";
                          return (
                            <Meter
                              key={s.id}
                              label={`${s.mode.slice(0, 14)} (${s.id})`}
                              percent={s.progressPercent}
                              display={`${s.progressPercent}%`}
                              color={color}
                              delay={0.1 * idx}
                            />
                          );
                        })}
                      </div>
                    </Card>

                    {/* Card 2: Warehouse Distribution Hub Bay Load */}
                    <Card
                      title="Cross-Dock Distribution Hub Bay Load"
                      accentColor="#E8A33D"
                      badge={
                        <span className="font-mono text-[11px] text-white/40">
                          {occupiedBays} / {totalBays} Bays ({bayOccupancyPct}%)
                        </span>
                      }
                    >
                      <div className="mt-4 space-y-3">
                        {warehouseHubs.map((hub, idx) => {
                          const loadPct = Math.round((hub.baysOccupied / hub.baysTotal) * 100);
                          return (
                            <Meter
                              key={hub.id}
                              label={hub.name.split(" ")[0]}
                              percent={loadPct}
                              display={`${hub.baysOccupied}/${hub.baysTotal} Bays`}
                              color="#E8A33D"
                              delay={0.1 * idx}
                            />
                          );
                        })}
                      </div>
                    </Card>

                    {/* Card 3: Cold-Chain Reefer IoT Telemetry */}
                    <Card
                      title="Reefer Cold-Chain IoT Sensor Hub (SHP-8801)"
                      accentColor="#8B5CF6"
                      badge={
                        <span className="font-mono text-[11px] text-[#2FBF71] flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#2FBF71] animate-pulse" /> Reefer Live
                        </span>
                      }
                    >
                      <div className="mt-4 grid grid-cols-2 gap-2 font-mono text-xs">
                        <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] space-y-1">
                          <span className="text-[10px] text-white/40 block">Core Temp Sensor</span>
                          <span className="text-white font-bold text-sm">
                            {selectedShipment.currentTempC}°C <span className="text-white/40 text-[10px] font-normal">Set: -18°C</span>
                          </span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] space-y-1">
                          <span className="text-[10px] text-white/40 block">Relative Humidity</span>
                          <span className="text-white font-bold text-sm">
                            {selectedShipment.humidityPercent}% <span className="text-[#2FBF71] text-[10px] font-normal">Optimal</span>
                          </span>
                        </div>
                      </div>
                    </Card>

                    {/* Card 4: Demurrage & Detention Avoidance */}
                    <Card
                      title="Demurrage & Detention Cost Avoidance"
                      accentColor="#2FBF71"
                      badge={
                        <span className="font-mono text-[11px] text-[#2FBF71]">
                          $38,400 Saved MoM
                        </span>
                      }
                    >
                      <div className="mt-4 space-y-3">
                        <Meter label="Rotterdam Terminal Pre-Clear" percent={98} display="98%" color="#2FBF71" delay={0.1} />
                        <Meter label="Houston Bayport Gate Dwell" percent={94} display="94%" color="#2FBF71" delay={0.2} />
                        <Meter label="Frankfurt Air Hub Customs" percent={96} display="96%" color="#3FC8D8" delay={0.3} />
                        <Meter label="Chicago Rail Ramp Clearance" percent={72} display="72%" color="#F0526B" delay={0.4} />
                      </div>
                    </Card>
                  </motion.div>

                  {/* 3 Footer Operational Cards */}
                  <motion.div
                    variants={fadeUp}
                    className="grid gap-3 sm:grid-cols-3"
                  >
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
                  </motion.div>
                </motion.div>
              )}

              {/* ==================== TAB: LIVE GPS FLEET MAP ==================== */}
              {selectedTab === "Live GPS Fleet Map" && (
                <motion.div
                  key="fleet-map"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <MultimodalFleetLiveMap />
                </motion.div>
              )}

              {/* ==================== TAB 2: MULTIMODAL SHIPMENTS ==================== */}
              {selectedTab === "Multimodal Shipments" && (
                <motion.div
                  key="shipments"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid grid-cols-1 gap-6 lg:grid-cols-3"
                >
                  <div className="lg:col-span-2 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.07] pb-3">
                      <h3 className="font-bold text-white text-sm font-mono uppercase tracking-wider">
                        Live Freight Corridor Roster ({filteredShipments.length})
                      </h3>

                      <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-lg border border-white/[0.08]">
                        {["All", "Sea Freight", "Air Cargo", "Intermodal Rail", "OTR Heavy Truck"].map(filter => (
                          <button
                            key={filter}
                            onClick={() => setActiveFreightFilter(filter)}
                            className={`px-2.5 py-1 text-xs font-mono font-bold rounded transition-all ${
                              activeFreightFilter === filter
                                ? "bg-white/[0.12] text-white"
                                : "text-white/40 hover:text-white"
                            }`}
                          >
                            {filter}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      {filteredShipments.map(s => {
                        const isSelected = s.id === selectedShipmentId;
                        const isDelayed = s.status === "Delayed";
                        return (
                          <div
                            key={s.id}
                            onClick={() => setSelectedShipmentId(s.id)}
                            className={`p-4 rounded-xl border cursor-pointer transition-all space-y-3 ${
                              isSelected
                                ? "border-[#3FC8D8] bg-[#3FC8D8]/[0.05] shadow-lg"
                                : "border-white/[0.07] bg-white/[0.02] hover:border-white/[0.15]"
                            }`}
                          >
                            <div className="flex flex-wrap justify-between items-start gap-2">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-mono text-[#3FC8D8] uppercase font-bold">{s.mode}</span>
                                  <span className="font-mono text-xs font-bold text-white">{s.id} • {s.carrier}</span>
                                </div>
                                <p className="text-xs text-white/60 font-mono mt-1">
                                  {s.origin} ➔ {s.destination}
                                </p>
                              </div>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                                isDelayed
                                  ? "border-[#F0526B]/40 text-[#F0526B] bg-[#F0526B]/10"
                                  : "border-[#2FBF71]/40 text-[#2FBF71] bg-[#2FBF71]/10"
                              }`}>
                                {s.status}
                              </span>
                            </div>

                            <div className="pt-2 border-t border-white/[0.06] flex justify-between items-center text-xs font-mono">
                              <span className="text-white/40">Cargo: <strong className="text-white">{s.cargo}</strong></span>
                              <span className="text-[#3FC8D8] font-bold">{s.progressPercent}% Transit</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right: Selected Shipment Detail */}
                  <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-5 space-y-4 font-mono text-xs">
                    <div className="border-b border-white/[0.07] pb-3">
                      <span className="text-[10px] font-mono text-[#3FC8D8] uppercase block">Manifest Inspection</span>
                      <h4 className="text-white font-bold text-base mt-0.5">{selectedShipment.id}</h4>
                      <p className="text-xs text-white/40 mt-0.5">{selectedShipment.trackingNumber}</p>
                    </div>

                    <div className="space-y-3">
                      <div className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-lg space-y-1">
                        <span className="text-white/40 text-[10px] block">Carrier Vessel / Flight</span>
                        <strong className="text-white text-sm">{selectedShipment.carrier}</strong>
                      </div>

                      <div className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-lg space-y-1">
                        <span className="text-white/40 text-[10px] block">Estimated Arrival (ETA)</span>
                        <strong className="text-white">{selectedShipment.eta}</strong>
                      </div>

                      <div className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-lg space-y-1">
                        <span className="text-white/40 text-[10px] block">Demurrage Risk Status</span>
                        <strong className={selectedShipment.demurrageRisk.includes("$0") ? "text-[#2FBF71]" : "text-[#F0526B]"}>
                          {selectedShipment.demurrageRisk}
                        </strong>
                      </div>
                    </div>

                    <button
                      onClick={() => onCreateWorkOrder(`Expedited Clearing: ${selectedShipment.id}`, selectedShipment.carrier, "High")}
                      className="w-full py-2.5 bg-[#3FC8D8] hover:bg-[#3FC8D8]/90 text-black font-bold rounded-lg transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      <Zap className="h-4 w-4" />
                      <span>Expedite Customs Gate Release</span>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ==================== TAB 3: COLD-CHAIN IOT & SENSORS ==================== */}
              {selectedTab === "Cold-Chain IoT & Sensors" && (
                <motion.div
                  key="coldchain"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-5 space-y-4">
                    <div className="flex flex-wrap justify-between items-center gap-3 border-b border-white/[0.07] pb-3">
                      <div>
                        <span className="text-[10px] font-mono text-[#8B5CF6] uppercase block">Reefer Container Thermal Telemetry</span>
                        <h4 className="text-white font-bold text-base mt-0.5">6-Hour Temperature Drift Profile (Set: -18.0°C)</h4>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] font-mono text-white/50">
                        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-[#8B5CF6]" /> Core Temp (°C)</span>
                        <span className="flex items-center gap-1.5"><span className="h-1 w-3 bg-[#2FBF71] rounded-full" /> Setpoint (-18°C)</span>
                      </div>
                    </div>

                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={coldChainHistory} margin={{ top: 10, right: 15, left: -10, bottom: 5 }}>
                          <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} opacity={0.4} />
                          <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} />
                          <YAxis stroke="#64748b" fontSize={10} domain={[-20, -16]} tickLine={false} unit="°C" />
                          <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", color: "#f8fafc", borderRadius: "8px", fontSize: "11px", fontFamily: "monospace" }} />
                          <Line type="monotone" dataKey="temp" stroke="#8B5CF6" strokeWidth={2.5} dot={{ r: 4, fill: "#8B5CF6" }} />
                          <Line type="monotone" dataKey="setpoint" stroke="#2FBF71" strokeDasharray="4 4" strokeWidth={1.5} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ==================== TAB 4: DISTRIBUTION HUBS & BAYS ==================== */}
              {selectedTab === "Distribution Hubs & Bays" && (
                <motion.div
                  key="hubs"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid grid-cols-1 gap-6 lg:grid-cols-3"
                >
                  {warehouseHubs.map(hub => (
                    <div key={hub.id} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-5 space-y-4 font-mono text-xs">
                      <div className="flex justify-between items-start border-b border-white/[0.07] pb-3">
                        <div>
                          <span className="text-[10px] text-white/40 uppercase block">{hub.id}</span>
                          <h4 className="text-white font-bold text-sm mt-0.5">{hub.name}</h4>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-[#2FBF71]/10 text-[#2FBF71] text-[10px] font-bold">
                          {hub.onTimeDispatch}% On-Time
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-white/40">Bay Utilization:</span>
                          <strong className="text-white">{hub.baysOccupied} / {hub.baysTotal} Bays</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/40">Throughput:</span>
                          <strong className="text-white">{hub.pickRatePerHour} picks/hr</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/40">Average Dwell:</span>
                          <strong className="text-white">{hub.dwellTimeHours} hours</strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}

              {/* ==================== TAB 5: DEMURRAGE & ROUTE AI ==================== */}
              {selectedTab === "Demurrage & Route AI" && (
                <motion.div
                  key="demurrage"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid grid-cols-1 gap-6 lg:grid-cols-2"
                >
                  <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-5 space-y-4 font-mono text-xs">
                    <h4 className="text-white font-bold text-sm uppercase tracking-wider border-b border-white/[0.07] pb-3">
                      AI Route Optimization Engine
                    </h4>
                    <p className="text-white/60 leading-relaxed">
                      Autonomous rerouting dynamically evaluates weather storm tracks, port congestion queues, and intermodal dwell hours to minimize detention penalties.
                    </p>

                    <div className="p-3 bg-[#2FBF71]/10 border border-[#2FBF71]/30 rounded-lg space-y-1">
                      <span className="text-[#2FBF71] font-bold text-xs block">AI Route Recommendation:</span>
                      <p className="text-white/80 text-[11px]">
                        Re-route SHP-8803 from Chicago Rail Ramp to Direct Flatbed OTR. Saves 26 hours and avoids $4,200 weekend demurrage charge.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-5 space-y-4 font-mono text-xs flex flex-col justify-between">
                    <div>
                      <h4 className="text-white font-bold text-sm uppercase tracking-wider border-b border-white/[0.07] pb-3">
                        Execute Autonomous Re-Route
                      </h4>
                      <p className="text-white/60 leading-relaxed mt-2">
                        Dispatches encrypted freight broker contract and updates ERP inventory arrival timestamps across all plants.
                      </p>
                    </div>

                    <button
                      onClick={() => onCreateWorkOrder("Execute Flatbed Re-route", "SHP-8803", "Critical")}
                      className="w-full py-3 bg-[#3FC8D8] hover:bg-[#3FC8D8]/90 text-black font-bold rounded-lg transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      <Zap className="h-4 w-4" />
                      <span>Approve AI Route Re-Assignment</span>
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
