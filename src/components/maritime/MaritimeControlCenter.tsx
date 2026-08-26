"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Ship,
  Anchor,
  ShieldCheck,
  AlertTriangle,
  Fuel,
  PackageSearch,
  CheckCircle2,
  CircleAlert,
  ArrowUpRight,
  Gauge,
  Compass,
  Radio,
  FileText,
  Activity,
  Layers,
  Sparkles,
  ExternalLink,
  Search,
  Filter,
} from "lucide-react";

import {
  MARITIME_FLEET,
  MARITIME_SUPPLY_ORDERS,
  MARITIME_CREW,
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

// Interactive Sub-tabs for Maritime Tower
const TABS = [
  "Overview",
  "Fleet & Hull",
  "Inspections & Safety",
  "Bunkering & MRO",
  "Safety Equipment",
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
      // Ease out cubic
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

// Reusable Dark Card Component from ControlTower theme
function Card({
  title,
  children,
  className = "",
  accentColor = "#8B5CF6",
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

// Reusable Meter Bar Component from ControlTower theme
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

export default function MaritimeControlCenter({
  bunkerLogs,
  clearances,
  deficiencies,
  safetyInspections,
  onNavigate,
  onOpenDeficiency,
}: MaritimeControlCenterProps) {
  const [selectedTab, setSelectedTab] = useState("Overview");

  // Calculations
  const averageAvailability = Math.round(
    MARITIME_FLEET.reduce((total, v) => total + v.availabilityPercent, 0) /
      MARITIME_FLEET.length,
  );
  const atSeaCount = MARITIME_FLEET.filter((v) => v.status === "At Sea").length;
  const criticalDeficiencies = deficiencies.filter(
    (d) => d.severity === "Critical" && d.status !== "Resolved",
  );
  const openDeficiencies = deficiencies.filter((d) => d.status !== "Resolved");
  const dueInspections = safetyInspections.filter((i) => i.status !== "Passed");
  const failedInspections = safetyInspections.filter((i) => i.status === "Failed");

  const lowFuelVessels = bunkerLogs.filter(
    (log) => log.mgoROBMetricTons + log.hfoROBMetricTons < 200,
  );

  const clearanceSteps = clearances.reduce(
    (total, c) =>
      total +
      Number(c.customsCleared) +
      Number(c.immigrationCleared) +
      Number(c.portAgentNotified) +
      Number(c.pilotageRequested),
    0,
  );
  const clearanceReadiness = clearances.length
    ? Math.round((clearanceSteps / (clearances.length * 4)) * 100)
    : 100;
  const inspectionReadiness = safetyInspections.length
    ? Math.round(
        (safetyInspections.filter((i) => i.status === "Passed").length /
          safetyInspections.length) *
          100,
      )
    : 100;
  const supplyRiskOrders = MARITIME_SUPPLY_ORDERS.filter(
    (o) =>
      o.leadTimeDays > 14 ||
      o.status === "Draft" ||
      o.status === "Port Delivery Pending",
  );

  const fleetReadiness = Math.round(
    averageAvailability * 0.45 +
      inspectionReadiness * 0.2 +
      clearanceReadiness * 0.2 +
      (100 - (supplyRiskOrders.length / MARITIME_SUPPLY_ORDERS.length) * 100) * 0.15,
  );

  const totalCriticalAlerts =
    criticalDeficiencies.length +
    failedInspections.length +
    lowFuelVessels.length;

  // Monthly Inspections & Voyage Volume (6 months historical)
  const MARITIME_VOLUME = [
    ["Mar 2026", 42],
    ["Apr 2026", 58],
    ["May 2026", 64],
    ["Jun 2026", 71],
    ["Jul 2026", 85],
    ["Aug 2026", 94],
  ] as const;
  const MARITIME_VOLUME_MAX = 100;

  // Fleet Vessel Class Distribution
  const VESSEL_CLASSES = [
    { label: "Container Ships", value: 2, color: "#8B5CF6" },
    { label: "Bulk Carriers", value: 1, color: "#3FC8D8" },
    { label: "Chemical Tankers", value: 1, color: "#E8A33D" },
    { label: "Offshore / Tugs", value: 1, color: "#2FBF71" },
  ];
  const TOTAL_VESSELS = VESSEL_CLASSES.reduce((sum, v) => sum + v.value, 0);

  // Vessel Seaworthiness & Zone Compliance
  const VESSEL_SCORES = MARITIME_FLEET.map((vessel) => {
    let color = "#2FBF71";
    if (vessel.status === "Maintenance" || vessel.availabilityPercent < 60) {
      color = "#F0526B";
    } else if (vessel.availabilityPercent < 90) {
      color = "#E8A33D";
    }
    return [
      vessel.vesselName.replace("SCIO ", ""),
      vessel.availabilityPercent,
      color,
      `${vessel.departurePort} → ${vessel.destinationPort}`,
    ] as [string, number, string, string];
  });

  // AI Marine Computer Vision & Anomaly Detection Accuracy
  const AI_ACCURACY = [
    ["Hull Cleanliness Index", 99],
    ["Propulsion Vibration FFT", 97],
    ["Exhaust & Fuel Efficiency", 95],
    ["AIS Route Drift Detection", 98],
    ["Safety Gear Inspection CV", 96],
    ["Bunker Fuel Match", 99],
  ] as const;

  // Footer Operational Cards
  const FOOTER_CARDS = [
    {
      label: "Bunker & Supply Bottlenecks",
      value: `${supplyRiskOrders.length + lowFuelVessels.length}`,
      highlight: "2 priority routes",
      highlightTone: "#E8A33D",
      body: "Rotterdam → Houston spares delayed 48h · Aux injector work order at risk",
    },
    {
      label: "Active Maritime Crew",
      value: `${MARITIME_CREW.length}`,
      highlight: "4 working offline",
      highlightTone: "#2FBF71",
      body: "Encrypted offline voyage checklist payloads sync on satellite reconnect",
    },
    {
      label: "Fleet Defect Trend · 90 Days",
      value: "−24%",
      highlight: "improving",
      highlightTone: "#2FBF71",
      body: "Machinery vibration findings down after ultrasonic condition-based maintenance",
    },
  ];

  return (
    <section className="bg-[#0B0D0F] rounded-2xl border border-white/[0.08] px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-10 shadow-2xl">
      <div className="mx-auto w-full max-w-[1360px] space-y-8">
        
        {/* ==================== 1. TOP HERO SECTION INTRO ==================== */}
        <div className="flex flex-col justify-between gap-6 border-b border-white/[0.07] pb-8 xl:flex-row xl:items-end">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.09] bg-white/[0.03] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-[#8B5CF6]">
              <Anchor className="h-3.5 w-3.5" />
              01 — FLEET · MARITIME OPERATIONS CONTROL TOWER
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
              One Control Tower for the Entire Maritime Fleet
            </h1>
            <p className="max-w-3xl text-sm leading-relaxed text-white/50 sm:text-[14.5px]">
              Centralized, real-time visibility into vessel seaworthiness, port safety inspection readiness,
              fuel resilience, and routine equipment walkthroughs — with vessel-level telemetry behind every number.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate("fleet")}
              className="inline-flex items-center gap-2 rounded-xl border border-white/[0.12] bg-[#101315] px-4 py-2.5 font-mono text-xs font-semibold text-white/80 transition-all hover:border-[#8B5CF6]/50 hover:bg-[#8B5CF6]/10 hover:text-white"
            >
              <Ship className="h-4 w-4 text-[#8B5CF6]" />
              <span>Fleet AIS Registry</span>
              <ArrowUpRight className="h-3.5 w-3.5 opacity-60" />
            </button>
            <button
              onClick={onOpenDeficiency}
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
                          layoutId="activeTabUnderline"
                          className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-[#8B5CF6]"
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
              <span>Live · Global AIS Fleet Feed · {MARITIME_FLEET.length} Vessels</span>
            </div>
          </motion.div>

          {/* Tab Content Panels */}
          <div className="p-4 sm:p-6 space-y-6">
            <AnimatePresence mode="wait">
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
                    {/* KPI 1: Fleet Seaworthiness */}
                    <div className="rounded-xl border border-white/[0.07] bg-[#FFFDFA]/[0.02] p-4 transition-all hover:border-white/[0.14]">
                      <p className="font-mono text-[11px] uppercase tracking-[0.13em] text-white/40 sm:text-[11.5px]">
                        Fleet Seaworthiness
                      </p>
                      <p className="mt-3 text-[32px] font-semibold leading-none tracking-[-0.03em] text-white sm:text-[38px]">
                        <CountUp to={fleetReadiness} decimals={1} />
                        <span className="text-[18px] font-medium text-white/55 ml-0.5">%</span>
                      </p>
                      <span className="mt-4 block h-1 overflow-hidden rounded-full bg-[#FFFDFA]/[0.06]">
                        <motion.span
                          className="block h-full rounded-full bg-[#2FBF71]"
                          initial={{ width: 0 }}
                          animate={{ width: `${fleetReadiness}%` }}
                          transition={{ duration: 0.8, ease: ENTRANCE, delay: 0.1 }}
                        />
                      </span>
                    </div>

                    {/* KPI 2: PSC & Class Compliance */}
                    <div className="rounded-xl border border-white/[0.07] bg-[#FFFDFA]/[0.02] p-4 transition-all hover:border-white/[0.14]">
                      <p className="font-mono text-[11px] uppercase tracking-[0.13em] text-white/40 sm:text-[11.5px]">
                        PSC & Class Compliance
                      </p>
                      <p className="mt-3 text-[32px] font-semibold leading-none tracking-[-0.03em] text-white sm:text-[38px]">
                        <CountUp to={inspectionReadiness} decimals={1} />
                        <span className="text-[18px] font-medium text-white/55 ml-0.5">%</span>
                      </p>
                      <span className="mt-4 block h-1 overflow-hidden rounded-full bg-[#FFFDFA]/[0.06]">
                        <motion.span
                          className="block h-full rounded-full bg-[#8B5CF6]"
                          initial={{ width: 0 }}
                          animate={{ width: `${inspectionReadiness}%` }}
                          transition={{ duration: 0.8, ease: ENTRANCE, delay: 0.2 }}
                        />
                      </span>
                    </div>

                    {/* KPI 3: AI Telemetry & Vision Accuracy */}
                    <div className="rounded-xl border border-white/[0.07] bg-[#FFFDFA]/[0.02] p-4 transition-all hover:border-white/[0.14]">
                      <p className="font-mono text-[11px] uppercase tracking-[0.13em] text-white/40 sm:text-[11.5px]">
                        AI Anomaly Detection Precision
                      </p>
                      <p className="mt-3 text-[32px] font-semibold leading-none tracking-[-0.03em] text-white sm:text-[38px]">
                        <CountUp to={97.4} decimals={1} />
                        <span className="text-[18px] font-medium text-white/55 ml-0.5">%</span>
                      </p>
                      <span className="mt-4 block h-1 overflow-hidden rounded-full bg-[#FFFDFA]/[0.06]">
                        <motion.span
                          className="block h-full rounded-full bg-[#3FC8D8]"
                          initial={{ width: 0 }}
                          animate={{ width: "97.4%" }}
                          transition={{ duration: 0.8, ease: ENTRANCE, delay: 0.3 }}
                        />
                      </span>
                    </div>

                    {/* KPI 4: Critical Marine Alerts */}
                    <div className="rounded-xl border border-[#F0526B]/30 bg-[#F0526B]/[0.07] p-4">
                      <p className="font-mono text-[11px] uppercase tracking-[0.13em] text-[#F0526B]/80 sm:text-[11.5px]">
                        Critical Marine Alerts
                      </p>
                      <p className="mt-3 text-[32px] font-semibold leading-none tracking-[-0.03em] text-white sm:text-[38px]">
                        <CountUp to={totalCriticalAlerts} />
                      </p>
                      <p className="mt-3 font-mono text-[11px] text-[#F0526B] sm:text-[11.5px]">
                        {criticalDeficiencies.length} CAPA overdue · {lowFuelVessels.length} low bunker reserves
                      </p>
                    </div>
                  </div>

                  {/* Middle Row 1: Monthly Voyage/Inspection Volume + Vessel Type Radial Donut */}
                  <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
                    <Card
                      title="Monthly PSC Inspections & Voyage Volume"
                      accentColor="#8B5CF6"
                    >
                      <div className="mt-5 space-y-3.5">
                        {MARITIME_VOLUME.map(([month, count], index) => (
                          <Meter
                            key={month}
                            label={month}
                            display={`${count} audits`}
                            percent={(count / MARITIME_VOLUME_MAX) * 100}
                            color="#8B5CF6"
                            delay={index * 0.08}
                          />
                        ))}
                      </div>
                    </Card>

                    <Card
                      title="Fleet Vessel Class Distribution"
                      accentColor="#3FC8D8"
                    >
                      <div className="mt-4 flex flex-col sm:flex-row items-center gap-6">
                        <div className="relative h-[118px] w-[118px] shrink-0">
                          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                            {VESSEL_CLASSES.map((type, index) => {
                              const fraction = type.value / TOTAL_VESSELS;
                              const offset = VESSEL_CLASSES.slice(0, index).reduce(
                                (sum, prev) => sum + prev.value / TOTAL_VESSELS,
                                0,
                              );
                              return (
                                <motion.circle
                                  key={type.label}
                                  cx="50"
                                  cy="50"
                                  r="40"
                                  fill="transparent"
                                  stroke={type.color}
                                  strokeWidth="10"
                                  strokeDasharray={`${fraction * 251.2} ${251.2}`}
                                  strokeDashoffset={-offset * 251.2}
                                  initial={{ strokeDasharray: "0 251.2" }}
                                  animate={{
                                    strokeDasharray: `${fraction * 251.2} ${251.2}`,
                                  }}
                                  transition={{
                                    duration: 0.8,
                                    ease: ENTRANCE,
                                    delay: 0.1 + index * 0.05,
                                  }}
                                />
                              );
                            })}
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-xl font-bold leading-none text-white">
                              {TOTAL_VESSELS}
                            </span>
                            <span className="font-mono text-[9px] uppercase tracking-wider text-white/40">
                              Vessels
                            </span>
                          </div>
                        </div>

                        <div className="flex-1 space-y-2 w-full">
                          {VESSEL_CLASSES.map((type) => (
                            <div
                              key={type.label}
                              className="flex items-center justify-between text-xs font-mono"
                            >
                              <div className="flex items-center gap-2">
                                <span
                                  className="h-2 w-2 rounded-full"
                                  style={{ background: type.color }}
                                />
                                <span className="text-white/70">{type.label}</span>
                              </div>
                              <span className="font-bold text-white">
                                {type.value} ({Math.round((type.value / TOTAL_VESSELS) * 100)}%)
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* Middle Row 2: Seaworthiness by Vessel + AI Precision */}
                  <div className="grid gap-4 lg:grid-cols-2">
                    <Card
                      title="Seaworthiness & Readiness by Vessel"
                      accentColor="#2FBF71"
                      badge={
                        <span className="font-mono text-[10px] uppercase tracking-wider text-white/40">
                          {atSeaCount} active at sea
                        </span>
                      }
                    >
                      <div className="mt-5 space-y-3.5">
                        {VESSEL_SCORES.map(([vessel, percent, color], index) => (
                          <Meter
                            key={vessel}
                            label={vessel}
                            display={`${percent}%`}
                            percent={percent}
                            color={color}
                            delay={index * 0.07}
                          />
                        ))}
                      </div>
                    </Card>

                    <Card
                      title="AI Maritime Sensor & CV Precision"
                      accentColor="#3FC8D8"
                      badge={
                        <span className="font-mono text-[10px] uppercase tracking-wider text-[#3FC8D8]/80">
                          SCIO Maritime Engine v4.2
                        </span>
                      }
                    >
                      <div className="mt-5 space-y-3.5">
                        {AI_ACCURACY.map(([metric, percent], index) => (
                          <Meter
                            key={metric}
                            label={metric}
                            display={`${percent}%`}
                            percent={percent}
                            color="#3FC8D8"
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
                        className="rounded-xl border border-white/[0.07] bg-[#FFFDFA]/[0.02] p-4 transition-all hover:border-white/[0.14]"
                      >
                        <p className="font-mono text-[11px] uppercase tracking-[0.13em] text-white/35 sm:text-[11.5px]">
                          {card.label}
                        </p>
                        <p className="mt-3 flex items-baseline gap-2">
                          <span className="text-[26px] font-semibold leading-none text-white">
                            {card.value}
                          </span>
                          <span
                            className="text-[12.5px] font-medium"
                            style={{ color: card.highlightTone }}
                          >
                            {card.highlight}
                          </span>
                        </p>
                        <p className="mt-2.5 text-[12.5px] leading-relaxed text-white/40">
                          {card.body}
                        </p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* ==================== TAB: FLEET & HULL ==================== */}
              {selectedTab === "Fleet & Hull" && (
                <motion.div
                  key="fleet-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="rounded-xl border border-white/[0.07] bg-[#FFFDFA]/[0.02] p-5">
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.07] pb-4">
                      <div>
                        <h3 className="text-sm font-semibold text-white">
                          Fleet Hull & Propulsion Status
                        </h3>
                        <p className="text-xs text-white/40 mt-0.5">
                          Real-time AIS speed, charter utilization, and route coordinates
                        </p>
                      </div>
                      <button
                        onClick={() => onNavigate("fleet")}
                        className="font-mono text-xs text-[#8B5CF6] hover:underline flex items-center gap-1"
                      >
                        <span>Deep Fleet Table</span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="mt-4 divide-y divide-white/[0.05]">
                      {MARITIME_FLEET.map((vessel) => (
                        <div
                          key={vessel.vesselId}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.02] text-[#8B5CF6]">
                              <Ship className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-sm text-white">
                                  {vessel.vesselName}
                                </span>
                                <span className="font-mono text-[10px] text-white/35">
                                  {vessel.voyageNumber}
                                </span>
                              </div>
                              <p className="text-xs text-white/40 mt-0.5">
                                {vessel.departurePort} → {vessel.destinationPort} · ETA {vessel.eta}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-6">
                            <div className="text-right">
                              <span className="font-mono text-xs text-white">
                                {vessel.speedKts} kts
                              </span>
                              <span className="block font-mono text-[10px] text-white/40">
                                AIS Speed
                              </span>
                            </div>
                            <div className="text-right">
                              <span
                                className="font-mono text-xs font-semibold"
                                style={{
                                  color:
                                    vessel.availabilityPercent > 90
                                      ? "#2FBF71"
                                      : vessel.availabilityPercent > 60
                                      ? "#E8A33D"
                                      : "#F0526B",
                                }}
                              >
                                {vessel.availabilityPercent}%
                              </span>
                              <span className="block font-mono text-[10px] text-white/40">
                                Availability
                              </span>
                            </div>
                            <span
                              className={`rounded px-2 py-0.5 font-mono text-[10px] uppercase font-bold border ${
                                vessel.status === "At Sea"
                                  ? "border-[#2FBF71]/30 bg-[#2FBF71]/10 text-[#2FBF71]"
                                  : vessel.status === "In Port"
                                  ? "border-[#3FC8D8]/30 bg-[#3FC8D8]/10 text-[#3FC8D8]"
                                  : vessel.status === "Anchored"
                                  ? "border-[#E8A33D]/30 bg-[#E8A33D]/10 text-[#E8A33D]"
                                  : "border-[#F0526B]/30 bg-[#F0526B]/10 text-[#F0526B]"
                              }`}
                            >
                              {vessel.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ==================== TAB: INSPECTIONS & SAFETY ==================== */}
              {selectedTab === "Inspections & Safety" && (
                <motion.div
                  key="inspections-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="rounded-xl border border-white/[0.07] bg-[#FFFDFA]/[0.02] p-5">
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.07] pb-4">
                      <div>
                        <h3 className="text-sm font-semibold text-white">
                          Port State Control (PSC) & Marine Deficiencies
                        </h3>
                        <p className="text-xs text-white/40 mt-0.5">
                          Audit findings, corrective action plans (CAPA), and scheduled resolutions
                        </p>
                      </div>
                      <button
                        onClick={onOpenDeficiency}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#F0526B]/30 bg-[#F0526B]/10 px-3 py-1.5 font-mono text-xs font-semibold text-[#F0526B] hover:bg-[#F0526B]/20"
                      >
                        <CircleAlert className="h-3.5 w-3.5" />
                        <span>Log Deficiency</span>
                      </button>
                    </div>

                    <div className="mt-4 space-y-3">
                      {deficiencies.map((def) => (
                        <div
                          key={def.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-white/[0.05] bg-white/[0.01] p-3.5 hover:border-white/[0.1] transition-all"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span
                                className={`rounded px-1.5 py-0.5 font-mono text-[10px] uppercase font-bold border ${
                                  def.severity === "Critical"
                                    ? "border-[#F0526B]/30 bg-[#F0526B]/10 text-[#F0526B]"
                                    : def.severity === "High"
                                    ? "border-[#E8A33D]/30 bg-[#E8A33D]/10 text-[#E8A33D]"
                                    : "border-[#3FC8D8]/30 bg-[#3FC8D8]/10 text-[#3FC8D8]"
                                }`}
                              >
                                {def.severity}
                              </span>
                              <span className="font-semibold text-sm text-white">
                                {def.title}
                              </span>
                            </div>
                            <p className="text-xs text-white/40">
                              Vessel: <span className="text-white/70">{def.vesselId}</span> · Category: {def.category} · Target Due: {def.targetResolutionDate}
                            </p>
                          </div>

                          <div className="flex items-center gap-3 self-start sm:self-center">
                            <span
                              className={`font-mono text-xs ${
                                def.status === "Resolved"
                                  ? "text-[#2FBF71]"
                                  : "text-[#E8A33D]"
                              }`}
                            >
                              {def.status}
                            </span>
                            <button
                              onClick={() => onNavigate("compliance")}
                              className="rounded border border-white/[0.1] bg-white/[0.03] px-2.5 py-1 text-xs font-mono text-white/70 hover:text-white hover:border-white/[0.2]"
                            >
                              CAPA Plan
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ==================== TAB: BUNKERING & MRO ==================== */}
              {selectedTab === "Bunkering & MRO" && (
                <motion.div
                  key="bunkering-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card title="Fuel Remaining Onboard (ROB)" accentColor="#E8A33D">
                      <div className="mt-4 space-y-3">
                        {bunkerLogs.map((log) => {
                          const totalFuel = log.mgoROBMetricTons + log.hfoROBMetricTons;
                          const isLow = totalFuel < 200;
                          return (
                            <div
                              key={log.vesselId}
                              className="flex items-center justify-between rounded-lg border border-white/[0.04] bg-white/[0.01] p-3"
                            >
                              <div>
                                <span className="font-semibold text-sm text-white">
                                  {log.vesselId}
                                </span>
                                <p className="font-mono text-xs text-white/40 mt-0.5">
                                  MGO: {log.mgoROBMetricTons} MT · HFO: {log.hfoROBMetricTons} MT (Sulfur {log.sulfurContentPercent}%)
                                </p>
                              </div>
                              <div className="text-right">
                                <span
                                  className={`font-mono text-sm font-bold ${
                                    isLow ? "text-[#F0526B]" : "text-[#2FBF71]"
                                  }`}
                                >
                                  {totalFuel} MT
                                </span>
                                <span className="block font-mono text-[10px] text-white/35">
                                  {isLow ? "Low Reserve" : "Healthy"}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </Card>

                    <Card title="Critical Marine Procurement (MRO)" accentColor="#8B5CF6">
                      <div className="mt-4 space-y-3">
                        {MARITIME_SUPPLY_ORDERS.map((order) => (
                          <div
                            key={order.poNumber}
                            className="flex items-center justify-between rounded-lg border border-white/[0.04] bg-white/[0.01] p-3"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-semibold text-white">
                                  {order.poNumber}
                                </span>
                                <span className="text-xs text-white/60">
                                  {order.itemDescription}
                                </span>
                              </div>
                              <p className="font-mono text-[11px] text-white/40 mt-0.5">
                                Dest: {order.portDestination} · Lead: {order.leadTimeDays}d
                              </p>
                            </div>
                            <span className="font-mono text-[11px] text-[#3FC8D8]">
                              {order.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>
                </motion.div>
              )}

              {/* ==================== TAB: SAFETY EQUIPMENT INSPECTIONS ==================== */}
              {selectedTab === "Safety Equipment" && (
                <motion.div
                  key="safety-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="rounded-xl border border-white/[0.07] bg-[#FFFDFA]/[0.02] p-5">
                    <div className="flex items-center justify-between border-b border-white/[0.07] pb-4">
                      <div>
                        <h3 className="text-sm font-semibold text-white">
                          Lifeboats & Safety Equipment Inspections
                        </h3>
                        <p className="text-xs text-white/40 mt-0.5">
                          Liferafts, Fire Extinguishing Systems, Emergency Gear, and Survival Craft Readiness
                        </p>
                      </div>
                      <span className="font-mono text-xs text-[#2FBF71]">
                        Inspection Readiness: {inspectionReadiness}%
                      </span>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      {safetyInspections.map((item) => (
                        <div
                          key={item.equipmentId}
                          className="rounded-lg border border-white/[0.05] bg-white/[0.01] p-3.5 space-y-2"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-semibold text-xs text-white leading-tight">
                              {item.name}
                            </span>
                            <span
                              className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-bold border ${
                                item.status === "Passed"
                                  ? "border-[#2FBF71]/30 bg-[#2FBF71]/10 text-[#2FBF71]"
                                  : item.status === "Due"
                                  ? "border-[#E8A33D]/30 bg-[#E8A33D]/10 text-[#E8A33D]"
                                  : "border-[#F0526B]/30 bg-[#F0526B]/10 text-[#F0526B]"
                              }`}
                            >
                              {item.status}
                            </span>
                          </div>
                          <p className="font-mono text-[11px] text-white/40">
                            Vessel: {item.vesselId}
                          </p>
                          <p className="font-mono text-[11px] text-white/40">
                            Expiry: {item.expiryDate}
                          </p>
                        </div>
                      ))}
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
