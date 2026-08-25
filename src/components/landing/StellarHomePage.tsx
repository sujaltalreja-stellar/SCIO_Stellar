"use client";

import React, { useState, useEffect } from "react";
import {
  Zap,
  Building2,
  Ship,
  Truck,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Activity,
  Bot,
  Layers,
  ChevronRight,
  TrendingUp,
  Cpu,
  BarChart3,
  Search,
  Sparkles,
  CheckCircle2,
  Radio,
  FileText,
  Sliders,
  Play,
  Share2,
  Database,
  Cloud,
  Network,
  Lock,
  MessageSquare,
  Flame,
  Globe,
  ArrowUpRight,
  Terminal,
  Clock,
  Compass,
  Briefcase,
  Gauge,
  Check,
  X,
  RefreshCw,
  Eye,
  Workflow,
  Camera,
  Maximize2,
  Anchor,
  CircleAlert,
  Fuel,
  PackageSearch,
  Filter,
  BookOpen
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface StellarHomePageProps {
  onLaunchPlatform: (industry?: string, tab?: string) => void;
  onOpenResources?: () => void;
}

// Crisp High-Contrast Black & White Design System
const C = {
  // Pure White & Clean Surfaces
  white: "#FFFFFF",
  whiteSurface: "#F8FAFC",
  whiteSunk: "#F1F5F9",
  lineLight: "#E2E8F0",
  lineLightSoft: "#EDF2F7",

  // Crisp High-Contrast Typography
  ink: "#090D16",
  inkBody: "#1E293B",
  inkMuted: "#475569",
  inkFaint: "#64748B",
  inkDim: "#94A3B8",

  // Obsidian Deep Black Surfaces
  night: "#06080D",
  nightRaised: "#0D111A",
  nightCard: "#131824",
  nightPanel: "#080B11",
  lineDark: "rgba(255,255,255,0.08)",
  lineDarkSoft: "rgba(255,255,255,0.05)",

  chalk: "#F8FAFC",
  chalkBright: "#FFFFFF",
  slate400: "#94A3B8",
  slate600: "#64748B",

  // Vivid Precision Accents
  indigo: "#4F46E5",
  violet: "#7C3AED",
  green: "#10B981",
  cyan: "#06B6D4",
  red: "#EF4444",
  amber: "#F59E0B",
  blue: "#2563EB",
};

const ENTRANCE = [0.22, 1, 0.36, 1] as const;
const EASE = [0.2, 0.7, 0.3, 1] as const;
const SHELL = "mx-auto w-full max-w-[1360px] px-4 sm:px-6 lg:px-8";
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

// Maritime Dashboard Sub-tabs
const MARITIME_TABS = [
  "Overview",
  "Fleet & AIS Tracking",
  "Inspections & PSC",
  "Bunkering & MRO",
  "SOLAS Compliance",
];

// CountUp Helper for Control Tower numerals
function CountUp({ to, decimals = 0, duration = 1.2 }: { to: number; decimals?: number; duration?: number }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start: number | null = null;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / (duration * 1000), 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setVal(easeOut * to);
      if (progress < 1) requestAnimationFrame(step);
      else setVal(to);
    };
    requestAnimationFrame(step);
  }, [to, duration]);
  return <>{decimals > 0 ? val.toFixed(decimals) : Math.round(val)}</>;
}

// Reusable Dashboard Card Component
function DashboardCard({
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
      className={`rounded-xl border border-white/[0.08] bg-[#FFFDFA]/[0.02] p-4 sm:p-5 transition-all hover:border-white/[0.14] ${className}`}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-white/60 font-bold sm:text-[11.5px]">
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

// Reusable Meter Bar Component
function DashboardMeter({
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
      <span className="truncate font-mono text-[11px] text-white/80 font-bold sm:text-[11.5px]" title={label}>
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
      <span className="text-right font-mono text-[11px] text-white font-black sm:text-[11.5px]">
        {display ?? (typeof value === "number" ? `${value}%` : value)}
      </span>
    </div>
  );
}

// Section Intro Component with High Contrast Header
function SectionIntro({
  eyebrow,
  title,
  description,
  tone = "light",
  rule = true,
  className = "",
}: {
  eyebrow: string;
  title?: string;
  description?: string;
  tone?: "light" | "dark";
  rule?: boolean;
  className?: string;
}) {
  const dark = tone === "dark";
  return (
    <div className={className}>
      <div className="flex items-baseline gap-4">
        <span
          className="uppercase font-mono font-bold text-[12px] sm:text-[13px] tracking-[2px]"
          style={{ color: dark ? C.green : C.blue }}
        >
          {eyebrow}
        </span>
        {rule && (
          <span
            className="h-px min-w-[40px] flex-1"
            style={{ background: dark ? "rgba(255,255,255,0.1)" : C.lineLight }}
            aria-hidden="true"
          />
        )}
      </div>

      {(title || description) && (
        <div className="mt-4 grid items-end gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:gap-12">
          {title && (
            <h2
              className="text-balance font-extrabold tracking-tight"
              style={{
                fontSize: "clamp(28px, 4.4vw, 52px)",
                letterSpacing: "-0.035em",
                lineHeight: 1.06,
                color: dark ? C.chalkBright : C.ink,
              }}
            >
              {title}
            </h2>
          )}
          {description && (
            <p
              className="max-w-[54ch] text-pretty leading-relaxed text-sm sm:text-base font-medium"
              style={{
                color: dark ? C.slate400 : C.inkBody,
              }}
            >
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function StellarHomePage({ onLaunchPlatform, onOpenResources }: StellarHomePageProps) {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [demoSubmitted, setDemoSubmitted] = useState(false);
  const [oscilloscopePhase, setOscilloscopePhase] = useState(0);
  const [selectedIndustryTab, setSelectedIndustryTab] = useState<"energy" | "maritime" | "manufacturing" | "logistics">("energy");
  
  // Dashboard Sub-Tab State
  const [dashboardTab, setDashboardTab] = useState("Overview");

  // Interactive Integration Infographic State
  const [selectedIntegrationSource, setSelectedIntegrationSource] = useState<"erp" | "scada" | "fleet" | "cloud">("erp");
  const [simulatingPacket, setSimulatingPacket] = useState(true);

  const [liveJitter, setLiveJitter] = useState({ mw: 2854.2, hz: 50.02, health: 98.4 });
  const [businessHealth, setBusinessHealth] = useState({
    operations: 98.4,
    supplyChain: 89.1,
    finance: 96.8,
    procurement: 94.2
  });

  const [aiSignals] = useState([
    { label: "Supply Risk", val: "74% Prob", color: C.amber, icon: AlertTriangle },
    { label: "Demand Shift", val: "+18.4%", color: C.cyan, icon: TrendingUp },
    { label: "Vendor Delay", val: "6-9 Days", color: C.red, icon: AlertTriangle }
  ]);

  // Helper function to handle smooth local switch or allow native new-tab navigation
  const handleNavClick = (e: React.MouseEvent, industry: string, tab?: string) => {
    if (!e.ctrlKey && !e.metaKey && !e.shiftKey && e.button === 0) {
      e.preventDefault();
      onLaunchPlatform(industry, tab);
    }
  };

  useEffect(() => {
    setMounted(true);

    let current = 0;
    const interval = setInterval(() => {
      current += Math.floor(Math.random() * 16) + 8;
      if (current >= 100) {
        current = 100;
        setLoadProgress(100);
        clearInterval(interval);
        setTimeout(() => setLoading(false), 300);
      } else {
        setLoadProgress(current);
      }
    }, 45);

    const waveInterval = setInterval(() => {
      setOscilloscopePhase((p) => (p + 2) % 360);
    }, 40);

    const jitterInterval = setInterval(() => {
      setLiveJitter({
        mw: +(2850 + (Math.random() - 0.5) * 8).toFixed(1),
        hz: +(50.00 + (Math.random() - 0.5) * 0.04).toFixed(2),
        health: +(98.2 + Math.random() * 0.4).toFixed(1)
      });
      setBusinessHealth(prev => ({
        operations: +(Math.min(100, Math.max(95, prev.operations + (Math.random() - 0.5) * 0.4))).toFixed(1) as any,
        supplyChain: +(Math.min(100, Math.max(85, prev.supplyChain + (Math.random() - 0.5) * 0.6))).toFixed(1) as any,
        finance: +(Math.min(100, Math.max(92, prev.finance + (Math.random() - 0.5) * 0.3))).toFixed(1) as any,
        procurement: +(Math.min(100, Math.max(90, prev.procurement + (Math.random() - 0.5) * 0.4))).toFixed(1) as any,
      }));
    }, 1500);

    return () => {
      clearInterval(interval);
      clearInterval(waveInterval);
      clearInterval(jitterInterval);
    };
  }, []);

  // 4 Core Operating Industries Definition with Ultra-Relevant Industrial Photography
  const INDUSTRY_DATA = {
    energy: {
      id: "energy",
      name: "Renewable Energy & Grid Utilities",
      tagline: "12.4 GW Generation · Real-Time Vibration FFT · Grid Balancing",
      icon: Zap,
      accentColor: C.green,
      heroImg: "https://images.unsplash.com/photo-1497440001374-f26997328c1b?auto=format&fit=crop&w=1200&q=80",
      gallery: [
        { label: "Utility Solar Array (6.2 GW)", img: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=600&q=80" },
        { label: "Offshore Wind Turbine Cluster", img: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=600&q=80" },
        { label: "500kV Substation & BESS Storage", img: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=600&q=80" },
      ],
      problem: "Intermittent weather fluctuations, transformer thermal degradation, and fragmented SCADA silos lead to catastrophic grid trips and curtailment penalties.",
      solution: "SCIO ingests 96.0 kS/s DSP vibration telemetry, forecasts load spikes 72 hours in advance, and optimizes multi-source power dispatch across solar, wind, and BESS in real-time.",
      kpis: [
        { label: "Monitored Capacity", val: "12.4 GW", tone: C.green },
        { label: "FFT Vibration Sampling", val: "96.0 kS/s", tone: C.cyan },
        { label: "Inverter Fleet Health", val: "98.4%", tone: C.green },
        { label: "Prevented Outage Costs", val: "$1.4M / yr", tone: C.indigo }
      ],
      tab: "energy-dashboard"
    },
    maritime: {
      id: "maritime",
      name: "Maritime Fleet & Port Operations",
      tagline: "Live AIS Vessel Tracking · Bunker Fuel Watch · SOLAS/MARPOL CAPA",
      icon: Ship,
      accentColor: C.violet,
      heroImg: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=1200&q=80",
      gallery: [
        { label: "Mega Container Vessel at Sea", img: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80" },
        { label: "ECDIS Navigation Bridge Console", img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80" },
        { label: "Automated Port Gantry Cranes", img: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=600&q=80" },
      ],
      problem: "Ocean-going fleets operate with high-latency offline communication gaps, rising bunker fuel costs, and severe Port State Control (PSC) detention risks.",
      solution: "SCIO's Operations Control Tower monitors vessel availability, tracks 200 MT bunker reserve margins, and closes safety CAPA deficiencies before port arrival.",
      kpis: [
        { label: "Fleet Monitored", val: "28 Vessels", tone: C.violet },
        { label: "PSC Compliance Score", val: "91.8%", tone: C.green },
        { label: "Bunker ROB Accuracy", val: "99.2%", tone: C.cyan },
        { label: "Port Clearance Rate", val: "97.5%", tone: C.green }
      ],
      tab: "dashboard"
    },
    manufacturing: {
      id: "manufacturing",
      name: "Manufacturing 4.0 & Industrial Automation",
      tagline: "Dual-Axis OEE Analysis · Robotic Joint Telemetry · Optical Defect QA",
      icon: Building2,
      accentColor: C.amber,
      heroImg: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80",
      gallery: [
        { label: "6-Axis Automotive Robotic Welding", img: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80" },
        { label: "Precision 5-Axis CNC Titanium Mill", img: "https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=600&q=80" },
        { label: "Automated Optical PCB Inspection Line", img: "https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=600&q=80" },
      ],
      problem: "Unscheduled assembly line stops cost upwards of $120,000/hr, while micro-defects escape visual checks and exhaust spare parts buffers.",
      solution: "SCIO correlates robotic joint vibration with hydraulic pressure loss, calculates dual-axis OEE pareto breakdown, and dispatches automated MRO work orders.",
      kpis: [
        { label: "Overall OEE Score", val: "88.6%", tone: C.amber },
        { label: "Robotic Line Uptime", val: "99.4%", tone: C.green },
        { label: "Optical Defect Catch Rate", val: "99.1%", tone: C.cyan },
        { label: "Spindle Fault Lead Time", val: "14 Days", tone: C.violet }
      ],
      tab: "dashboard"
    },
    logistics: {
      id: "logistics",
      name: "Global Multimodal Supply Chain",
      tagline: "Cold-Chain IoT Telemetry · Demurrage Prevention · Route Bottlenecks",
      icon: Truck,
      accentColor: C.cyan,
      heroImg: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80",
      gallery: [
        { label: "High-Bay Robotic Distribution Hub", img: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80" },
        { label: "Intermodal Rail Freight Container Yard", img: "https://images.unsplash.com/photo-1580674684081-7617fbf3d745?auto=format&fit=crop&w=600&q=80" },
        { label: "IoT Cold-Chain Carrier (-18.4°C)", img: "https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=600&q=80" },
      ],
      problem: "Terminal congestion, temperature excursions in sub-zero cold chains, and supplier lead-time blindness lead to costly stockouts and demurrage fees.",
      solution: "SCIO monitors in-transit freight, alerts on cold-chain excursions (-18.4°C threshold), and predicts port customs clearance bottlenecks 9 days in advance.",
      kpis: [
        { label: "Active Shipments", val: "1,420 TEU", tone: C.cyan },
        { label: "On-Time Delivery Rate", val: "96.4%", tone: C.green },
        { label: "Cold-Chain Compliance", val: "99.8%", tone: C.green },
        { label: "Demurrage Avoidance", val: "$420k / qtr", tone: C.violet }
      ],
      tab: "dashboard"
    }
  };

  const currentInd = INDUSTRY_DATA[selectedIndustryTab];

  // Maritime Mock Telemetry for Homepage Control Tower
  const MARITIME_DATA = {
    vesselClasses: [
      { label: "Ultra Container Ships", value: 12, color: "#8B5CF6", percent: 42.8 },
      { label: "Capesize Bulk Carriers", value: 8, color: "#3FC8D8", percent: 28.5 },
      { label: "Chemical Tankers", value: 5, color: "#E8A33D", percent: 17.8 },
      { label: "Offshore Escort Tugs", value: 3, color: "#2FBF71", percent: 10.9 },
    ],
    vesselScores: [
      { name: "Ever Apex (24,000 TEU)", score: 98.4, color: "#2FBF71", route: "Shanghai → Rotterdam", status: "At Sea" },
      { name: "CMA CGM Palais", score: 96.2, color: "#3FC8D8", route: "Singapore → Hamburg", status: "At Sea" },
      { name: "Maersk Mc-Kinney", score: 91.8, color: "#2FBF71", route: "Busan → Los Angeles", status: "Anchored" },
      { name: "MSC Isabella", score: 87.5, color: "#E8A33D", route: "Antwerp → Felixstowe", status: "Moored" },
      { name: "Cosco Galaxy", score: 58.2, color: "#F0526B", route: "Dubai → Mumbai", status: "Maintenance" },
    ],
    aiPrecision: [
      { label: "Hull Fouling & Bio-Index", val: 99.2 },
      { label: "Propulsion Vibration FFT", val: 97.8 },
      { label: "Exhaust CII / MARPOL", val: 95.4 },
      { label: "AIS Route Drift Detection", val: 98.6 },
      { label: "Safety Gear CV OCR", val: 96.9 },
      { label: "Bunker Fuel Viscosity Match", val: 99.4 },
    ],
    inspections: [
      { item: "Starboard Lifeboat Release Mechanism", severity: "Critical", vessel: "Cosco Galaxy", date: "24 Aug 2026", status: "CAPA Pending" },
      { item: "Engine Room CO2 Fixed Fire System", severity: "Passed", vessel: "Ever Apex", date: "22 Aug 2026", status: "Certified" },
      { item: "Oily Water Separator 15ppm Bilge Alarm", severity: "Passed", vessel: "CMA CGM Palais", date: "20 Aug 2026", status: "Certified" },
      { item: "Emergency Diesel Generator Auto-Start", severity: "Warning", vessel: "MSC Isabella", date: "19 Aug 2026", status: "Work Order Active" },
    ],
    bunkerStatus: [
      { vessel: "Ever Apex", vlsfo: "840 MT", mgo: "180 MT", status: "Optimal", nextPort: "Rotterdam" },
      { vessel: "CMA CGM Palais", vlsfo: "620 MT", mgo: "140 MT", status: "Optimal", nextPort: "Hamburg" },
      { vessel: "Maersk Mc-Kinney", vlsfo: "410 MT", mgo: "95 MT", status: "Replenish Scheduled", nextPort: "Los Angeles" },
      { vessel: "MSC Isabella", vlsfo: "165 MT", mgo: "45 MT", status: "Low Reserve (<200 MT)", nextPort: "Felixstowe" },
    ]
  };

  return (
    <div
      className="min-h-screen font-sans selection:bg-black selection:text-white overflow-x-hidden"
      style={{ background: C.white, color: C.ink }}
    >
      {/* ==================== 0. BOOT SEQUENCE ==================== */}
      <AnimatePresence>
        {loading && (
          <motion.div
            key="preloader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center font-mono px-6"
            style={{ background: C.night, color: C.chalk }}
          >
            <div className="relative z-10 w-full max-w-md space-y-6">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                <div className="flex items-center space-x-3">
                  <div
                    className="h-8 w-8 rounded-lg shadow-lg flex items-center justify-center font-mono font-black text-xs bg-white text-black"
                  >
                    <span>S</span>
                  </div>
                  <div>
                    <span className="font-bold text-xs tracking-widest uppercase block text-white">
                      STELLAR SCIO
                    </span>
                    <span className="text-[10px] text-white/40 tracking-wider">
                      SYSTEM INITIALIZATION
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setLoading(false)}
                  className="text-[11px] text-white/50 hover:text-white border border-white/10 rounded px-2 py-0.5"
                >
                  Skip [ESC]
                </button>
              </div>

              <div className="space-y-1.5 text-xs text-white/60 min-h-[85px]">
                <p className="flex items-center gap-2">
                  <span style={{ color: C.cyan }}>01</span>
                  <span>Telemetry Gateway: Initialized [96.0 kS/s]</span>
                </p>
                {loadProgress > 30 && (
                  <motion.p initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2">
                    <span style={{ color: C.violet }}>02</span>
                    <span>Multivariate Neural Matrix: Calibrated</span>
                  </motion.p>
                )}
                {loadProgress > 65 && (
                  <motion.p initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2">
                    <span style={{ color: C.green }}>03</span>
                    <span>4-Sector Telemetry Synchronized (Energy, Maritime, Mfg, Logistics)</span>
                  </motion.p>
                )}
                {loadProgress >= 100 && (
                  <motion.p initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 text-white font-bold">
                    <span style={{ color: C.green }}>04</span>
                    <span>Mission Control Ready · Launching Platform</span>
                  </motion.p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-white/40">CORE STATUS</span>
                  <span style={{ color: C.cyan }}>{loadProgress}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08]">
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      width: `${loadProgress}%`,
                      background: `linear-gradient(90deg, ${C.cyan}, ${C.blue}, ${C.green})`,
                    }}
                    transition={{ ease: "easeOut" }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================== 1. STICKY TOP NAVIGATION BAR ==================== */}
      <nav
        className="sticky top-0 z-50 h-16 border-b backdrop-blur-xl px-4 sm:px-6 lg:px-8 flex items-center justify-between shadow-xs transition-colors bg-white/95 border-slate-200"
      >
        {/* Brand Logo & Tagline (Strict Single-Line No Wrapping) */}
        <div className="flex items-center space-x-4 lg:space-x-6 shrink-0">
          <div
            className="flex items-center space-x-2.5 cursor-pointer group select-none shrink-0"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <div
              className="h-9 w-9 rounded-xl shadow-xs flex items-center justify-center font-mono font-black text-sm bg-black text-white group-hover:scale-105 transition-transform shrink-0"
            >
              S
            </div>
            <div className="flex flex-col whitespace-nowrap">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm tracking-tight text-slate-950 group-hover:text-blue-600 transition-colors">
                  STELLAR SCIO
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              </div>
              <span className="text-[9.5px] font-mono tracking-wider font-bold text-slate-500">
                OPERATIONAL AI PLATFORM
              </span>
            </div>
          </div>

          {/* Clean Modern Navigation Links (Single-Line, No 2-Line Wraps) */}
          <div className="hidden lg:flex items-center space-x-1 text-[13px] font-medium text-slate-700 font-sans whitespace-nowrap">
            <a
              href="#industries"
              className="px-2.5 py-1 rounded-full whitespace-nowrap hover:text-black hover:bg-slate-100 transition-all font-semibold"
            >
              Industries
            </a>
            <a
              href="#problem"
              className="px-2.5 py-1 rounded-full whitespace-nowrap hover:text-black hover:bg-slate-100 transition-all"
            >
              The Problem
            </a>
            <a
              href="#solution"
              className="px-2.5 py-1 rounded-full whitespace-nowrap hover:text-black hover:bg-slate-100 transition-all"
            >
              Solution
            </a>
            <a
              href="#control-tower"
              className="px-2.5 py-1 rounded-full whitespace-nowrap hover:text-black hover:bg-slate-100 transition-all flex items-center gap-1.5 font-semibold text-slate-900"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-violet-600 shrink-0" />
              <span>Control Tower</span>
            </a>
            <a
              href="#gallery"
              className="px-2.5 py-1 rounded-full whitespace-nowrap hover:text-black hover:bg-slate-100 transition-all"
            >
              Field Telemetry
            </a>
            <a
              href="#integrations"
              className="px-2.5 py-1 rounded-full whitespace-nowrap hover:text-black hover:bg-slate-100 transition-all"
            >
              Integrations
            </a>
            <a
              href="#why-scio"
              className="px-2.5 py-1 rounded-full whitespace-nowrap hover:text-black hover:bg-slate-100 transition-all"
            >
              Why SCIO
            </a>
            <button
              onClick={onOpenResources}
              className="px-3 py-1 rounded-full whitespace-nowrap hover:bg-indigo-50 transition-all font-semibold text-indigo-700 hover:text-indigo-900 flex items-center gap-1.5 border border-indigo-200 bg-white shadow-2xs"
            >
              <BookOpen className="h-3.5 w-3.5 shrink-0" />
              <span>Case Studies &amp; Blogs</span>
            </button>
          </div>
        </div>

        {/* Right CTA Actions (Strict Single-Line No Wrapping) */}
        <div className="flex items-center space-x-2 sm:space-x-2.5 shrink-0 whitespace-nowrap">
          <div className="hidden 2xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-emerald-400/40 bg-emerald-50 font-mono text-[10.5px] font-bold text-emerald-800 whitespace-nowrap shrink-0">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 shrink-0" />
            <span>50 Nodes Live</span>
          </div>

          <button
            onClick={() => setDemoModalOpen(true)}
            className="hidden sm:inline-flex px-3.5 py-1.5 rounded-full border border-slate-300 bg-white font-sans text-xs font-semibold text-slate-800 transition-all hover:bg-slate-50 hover:border-slate-400 shadow-xs whitespace-nowrap shrink-0"
          >
            Request Demo
          </button>
          
          <a
            href="/?launch=1&industry=energy&tab=energy-dashboard"
            onClick={(e) => handleNavClick(e, "energy", "energy-dashboard")}
            className="px-4 py-1.5 rounded-full font-sans text-xs font-bold shadow-md flex items-center gap-1.5 transition-all hover:scale-[1.02] bg-[#090D16] text-white hover:bg-slate-900 whitespace-nowrap shrink-0"
          >
            <span>Launch Platform</span>
            <ArrowRight className="h-3.5 w-3.5 opacity-80 shrink-0" />
          </a>
        </div>
      </nav>

      {/* ==================== 2. HERO SECTION (PURE WHITE & HIGH CONTRAST) ==================== */}
      <section id="top" className="relative pt-16 pb-12 sm:pt-20 sm:pb-16" style={{ background: C.white }}>
        <div className={`${SHELL} flex flex-col items-start gap-[24px]`}>
          
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="flex w-full items-center gap-2.5"
          >
            <span
              className="h-2 w-2 rounded-full shrink-0 bg-blue-600"
            />
            <span
              className="uppercase font-mono font-bold text-[12px] sm:text-[13px] tracking-[2px] text-blue-600"
            >
              SCIO PLATFORM — ENTERPRISE OPERATIONS OS
            </span>
          </motion.div>

          {/* Main Display Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: EASE, delay: 0.1 }}
            className="max-w-[1020px] font-black text-balance"
            style={{
              fontSize: "clamp(30px, 5.4vw + 6px, 72px)",
              lineHeight: 1.05,
              letterSpacing: "-.038em",
              color: C.ink,
            }}
          >
            Unify Supply Chain Intelligence &amp; Multi-Sector Field Operations in One Platform
          </motion.h1>

          {/* Lead & CTAs Row */}
          <div className="flex w-full flex-col items-start justify-between gap-8 pt-[8px] lg:flex-row lg:items-end lg:gap-[120px]">
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: EASE, delay: 0.2 }}
              className="max-w-[740px] text-pretty text-base sm:text-lg leading-relaxed font-semibold text-slate-800"
            >
              One intelligent platform to connect your machines, people, inspections, supply chain, and operations &mdash; giving you complete visibility and control across your business.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: EASE, delay: 0.25 }}
              className="flex flex-wrap items-center gap-3 shrink-0"
            >
              <button
                onClick={() => setDemoModalOpen(true)}
                className="inline-flex items-center justify-center rounded-full px-6 py-3.5 font-mono text-xs sm:text-sm font-bold tracking-wide transition-all hover:scale-[1.02] shadow-md bg-black text-white hover:bg-slate-900"
              >
                Request Enterprise Demo
              </button>
              <a
                href="/?launch=1&industry=energy&tab=energy-dashboard"
                onClick={(e) => handleNavClick(e, "energy", "energy-dashboard")}
                className="inline-flex items-center gap-2 rounded-full px-5 py-3.5 font-mono text-xs sm:text-sm font-bold transition-all hover:scale-[1.02] border-2 border-emerald-500 bg-white text-slate-900 shadow-xs hover:bg-emerald-50"
              >
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>Launch Live OCC</span>
                <ArrowRight className="h-3.5 w-3.5 opacity-70" />
              </a>
            </motion.div>
          </div>

          {/* 4 Industries Quick-Jump Cards (Enlarged, High-Contrast Typography, No Emojis) */}
          <div className="w-full pt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                id: "energy",
                tag: "ENERGY",
                name: "Renewable Energy",
                stat: "12.4 GW Monitored",
                tab: "energy-dashboard",
                icon: Zap,
                iconColor: "#10B981",
                img: "https://images.unsplash.com/photo-1497440001374-f26997328c1b?auto=format&fit=crop&w=800&q=80"
              },
              {
                id: "maritime",
                tag: "MARITIME",
                name: "Maritime Fleet",
                stat: "28 Vessels AIS Live",
                tab: "dashboard",
                icon: Ship,
                iconColor: "#06B6D4",
                img: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80"
              },
              {
                id: "manufacturing",
                tag: "MANUFACTURING",
                name: "Manufacturing 4.0",
                stat: "Dual-Axis OEE Analysis",
                tab: "dashboard",
                icon: Building2,
                iconColor: "#F59E0B",
                img: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80"
              },
              {
                id: "logistics",
                tag: "SUPPLY CHAIN",
                name: "Global Supply Chain",
                stat: "-18.4°C Cold-Chain Guard",
                tab: "dashboard",
                icon: Truck,
                iconColor: "#8B5CF6",
                img: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80"
              },
            ].map((rib) => {
              const Icon = rib.icon;
              return (
                <a
                  key={rib.id}
                  href={`/?launch=1&industry=${rib.id}&tab=${rib.tab}`}
                  onClick={(e) => {
                    handleNavClick(e, rib.id, rib.tab);
                    setSelectedIndustryTab(rib.id as any);
                  }}
                  className="relative h-44 sm:h-48 rounded-2xl overflow-hidden cursor-pointer border border-slate-300 group transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl shadow-md block bg-black"
                >
                  {/* Photo Layer */}
                  <img
                    src={rib.img}
                    alt={rib.name}
                    className="absolute inset-0 w-full h-full object-cover opacity-85 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                  />
                  {/* High Contrast Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-black/20" />

                  {/* Top Sector Tag Badge (Clean Icon, No Emojis) */}
                  <div className="absolute top-3.5 left-3.5 z-10">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-[11px] font-bold bg-white text-slate-900 shadow-sm">
                      <Icon className="h-3.5 w-3.5" style={{ color: rib.iconColor }} />
                      <span>{rib.tag}</span>
                    </span>
                  </div>

                  {/* Bottom Text Content (Large, High Readability) */}
                  <div className="absolute bottom-4 left-4 right-4 z-10 space-y-1.5">
                    <h3 className="text-base sm:text-lg font-bold text-white leading-snug drop-shadow-md group-hover:text-cyan-300 transition-colors">
                      {rib.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-xs font-mono text-emerald-400 font-bold drop-shadow-sm">
                        {rib.stat}
                      </span>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>

          {/* HARDWARE MISSION CONTROL COCKPIT (DEEP OBSIDIAN BLACK) */}
          <div
            className="mt-6 w-full rounded-2xl border shadow-2xl overflow-hidden"
            style={{ borderColor: C.lineDark, background: C.nightRaised }}
          >
            <div
              className="h-11 px-4 border-b flex items-center justify-between text-xs font-mono"
              style={{ background: C.nightPanel, borderColor: C.lineDark, color: C.slate400 }}
            >
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1.5">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: C.green }} />
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: C.amber }} />
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: C.cyan }} />
                </div>
                <span className="font-bold tracking-widest uppercase text-[10px] pl-2 border-l border-white/10 text-white/90">
                  SCIO MISSION CONTROL // CONSOLE_ID: 0x88F2
                </span>
              </div>
              <div className="flex items-center gap-3 text-[10px]">
                <span className="flex items-center gap-1.5 font-bold" style={{ color: C.green }}>
                  <span className="h-2 w-2 rounded-full animate-ping" style={{ background: C.green }} />
                  LIVE TELEMETRY
                </span>
                <span className="opacity-30 text-white">|</span>
                <span className="font-mono font-bold" style={{ color: C.cyan }}>{liveJitter.hz} Hz</span>
                <span className="opacity-30 text-white">|</span>
                <span className="font-mono font-bold text-white">{liveJitter.mw} MW</span>
              </div>
            </div>

            <div className="p-6 space-y-5" style={{ background: C.night }}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
                
                {/* Box 1: Business Health */}
                <div className="p-4 rounded-xl border space-y-3" style={{ borderColor: C.lineDark, background: C.nightRaised }}>
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-white/40">Business Health</span>
                    <span className="text-[10px] font-bold" style={{ color: C.green }}>{liveJitter.health}% LIVE</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-white/80 flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full" style={{ background: C.green }} /> Operations</span>
                      <span className="font-bold" style={{ color: C.green }}>{businessHealth.operations}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/80 flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full" style={{ background: C.amber }} /> Supply Chain</span>
                      <span className="font-bold" style={{ color: C.amber }}>{businessHealth.supplyChain}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/80 flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full" style={{ background: C.green }} /> Finance</span>
                      <span className="font-bold" style={{ color: C.green }}>{businessHealth.finance}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/80 flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full" style={{ background: C.cyan }} /> Procurement</span>
                      <span className="font-bold" style={{ color: C.cyan }}>{businessHealth.procurement}%</span>
                    </div>
                  </div>
                </div>

                {/* Box 2: Live AI Signal Ticker */}
                <div className="p-4 rounded-xl border space-y-3" style={{ borderColor: C.lineDark, background: C.nightRaised }}>
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-white/40">AI Signals</span>
                    <span className="text-[10px] font-bold" style={{ color: C.red }}>{aiSignals.length} ACTIVE</span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    {aiSignals.map((sig, sIdx) => {
                      const SigIcon = sig.icon;
                      return (
                        <div
                          key={sIdx}
                          className="flex items-center justify-between p-1.5 rounded border text-[11px]"
                          style={{ background: C.night, borderColor: "rgba(255,255,255,0.06)", color: sig.color }}
                        >
                          <span className="flex items-center gap-1.5 font-medium">
                            <SigIcon className="h-3 w-3" /> {sig.label}
                          </span>
                          <span className="font-bold">{sig.val}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Box 3: LIVE DSP OSCILLOSCOPE WAVEFORM */}
                <div className="p-4 rounded-xl border flex flex-col justify-between" style={{ borderColor: C.lineDark, background: C.nightRaised }}>
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-white/40">DSP Telemetry</span>
                    <span className="text-[10px] font-bold flex items-center gap-1" style={{ color: C.cyan }}>
                      <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: C.cyan }} />
                      96.0 kS/s LIVE
                    </span>
                  </div>
                  <div className="h-16 w-full rounded-lg border relative flex items-center justify-center overflow-hidden px-2" style={{ background: C.nightPanel, borderColor: C.lineDark }}>
                    <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                      <path
                        d={`M 0 ${20 + 7 * Math.sin((0 + oscilloscopePhase) * 0.1)} Q 25 ${20 + 11 * Math.sin((25 + oscilloscopePhase) * 0.1)}, 50 ${20 + 9 * Math.sin((50 + oscilloscopePhase) * 0.1)} T 100 ${20 + 7 * Math.sin((100 + oscilloscopePhase) * 0.1)}`}
                        fill="none"
                        stroke={C.cyan}
                        strokeWidth="1.5"
                      />
                      <path
                        d={`M 0 ${20 + 5 * Math.sin((0 + oscilloscopePhase * 1.5) * 0.1)} Q 25 ${20 + 8 * Math.sin((25 + oscilloscopePhase * 1.5) * 0.1)}, 50 ${20 + 6 * Math.sin((50 + oscilloscopePhase * 1.5) * 0.1)} T 100 ${20 + 5 * Math.sin((100 + oscilloscopePhase * 1.5) * 0.1)}`}
                        fill="none"
                        stroke={C.green}
                        strokeWidth="1"
                        strokeDasharray="2,2"
                      />
                    </svg>
                  </div>
                  <div className="flex justify-between text-[10px] pt-1 text-white/40">
                    <span>FREQ: {liveJitter.hz} Hz</span>
                    <span style={{ color: C.green }}>THD: 1.2%</span>
                  </div>
                </div>

              </div>

              {/* Action Trigger Bar with direct industry links */}
              <div className="p-4 rounded-xl border font-mono space-y-3" style={{ borderColor: C.lineDark, background: C.nightCard }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold" style={{ color: C.cyan }}>
                    <Sparkles className="h-4 w-4" />
                    <span>PREDICTIVE AI SYNTHESIS</span>
                  </div>
                  <span className="text-[10px] text-white/40 font-bold">ACTION DISPATCH READY</span>
                </div>
                <p className="text-xs sm:text-sm leading-relaxed font-sans text-white/90">
                  &ldquo;Supplier X (Hydraulic Valve Seals) is showing a <strong style={{ color: C.amber }}>74% probability of delivery disruption</strong> within the next 14 days due to port congestion in Rotterdam. Production Line Beta will experience safety buffer exhaustion in 8 days.&rdquo;
                </p>
                <div className="flex flex-wrap items-center gap-2.5 pt-1">
                  <a
                    href="/?launch=1&industry=manufacturing&tab=dashboard"
                    onClick={(e) => handleNavClick(e, "manufacturing", "dashboard")}
                    className="px-3.5 py-1.5 rounded-lg text-white font-bold text-xs shadow-xs transition-all hover:opacity-90 bg-indigo-600 hover:bg-indigo-500 inline-block"
                  >
                    Investigate Root Cause
                  </a>
                  <a
                    href="/?launch=1&industry=energy&tab=energy-inventory"
                    onClick={(e) => handleNavClick(e, "energy", "energy-inventory")}
                    className="px-3.5 py-1.5 rounded-lg border text-xs font-bold text-white transition-all hover:bg-white/10 inline-block"
                    style={{ borderColor: C.lineDark, background: C.nightRaised }}
                  >
                    Check MRO Stock
                  </a>
                  <a
                    href="/?launch=1&industry=energy&tab=energy-dashboard"
                    onClick={(e) => handleNavClick(e, "energy", "energy-dashboard")}
                    className="px-3.5 py-1.5 rounded-lg border text-xs text-white/70 transition-all hover:text-white inline-block"
                    style={{ borderColor: C.lineDark, background: C.nightRaised }}
                  >
                    Launch Grid OCC
                  </a>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ==================== 3. THE 4 CORE INDUSTRIES (WHERE SCIO RUNS) ==================== */}
      <section id="industries" className="py-20 border-t" style={{ background: C.whiteSurface, borderColor: C.lineLight }}>
        <div className={`${SHELL} space-y-12`}>
          <SectionIntro
            eyebrow="01 — WHERE SCIO RUNS · 4 CORE INDUSTRIAL SECTORS"
            title="Purpose-Built for Heavy Industry Operations"
            description="Explore how SCIO delivers deep vertical intelligence across Energy, Maritime, Manufacturing, and Supply Chains."
            tone="light"
            rule
          />

          {/* Industry Tabs with Direct Link Targets */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {[
              { id: "energy", label: "⚡ Renewable Energy", icon: Zap, tab: "energy-dashboard" },
              { id: "maritime", label: "🚢 Maritime Fleet", icon: Ship, tab: "dashboard" },
              { id: "manufacturing", label: "🏭 Manufacturing 4.0", icon: Building2, tab: "dashboard" },
              { id: "logistics", label: "🚚 Global Supply Chain", icon: Truck, tab: "dashboard" },
            ].map((tab) => {
              const isActive = selectedIndustryTab === tab.id;
              const Icon = tab.icon;
              return (
                <a
                  key={tab.id}
                  href={`/?launch=1&industry=${tab.id}&tab=${tab.tab}`}
                  onClick={(e) => {
                    if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
                      e.preventDefault();
                      setSelectedIndustryTab(tab.id as any);
                    }
                  }}
                  className="flex items-center gap-2 px-6 py-3 rounded-full font-mono text-xs font-bold transition-all shadow-xs"
                  style={{
                    background: isActive ? "#090D16" : "#FFFFFF",
                    color: isActive ? "#FFFFFF" : C.ink,
                    border: `1px solid ${isActive ? "#090D16" : C.lineLight}`,
                  }}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </a>
              );
            })}
          </div>

          {/* Active Industry Card (Vibrant, High Contrast, Real-World Photo) */}
          <div
            className="rounded-3xl border overflow-hidden shadow-xl"
            style={{ borderColor: C.lineLight, background: C.white }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-12">
              
              {/* Left Column: Image Banner in Full Color */}
              <div className="lg:col-span-5 relative min-h-[440px] overflow-hidden flex flex-col justify-between p-8">
                <img
                  src={currentInd.heroImg}
                  alt={currentInd.name}
                  className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent" />

                <div className="relative z-10 space-y-2">
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-[11px] font-bold uppercase tracking-wider text-black bg-white shadow-xs"
                  >
                    <currentInd.icon className="h-3.5 w-3.5" />
                    <span>{currentInd.id.toUpperCase()} SECTOR OCC</span>
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-white mt-2">
                    {currentInd.name}
                  </h3>
                  <p className="text-xs font-mono text-white/80 font-bold">
                    {currentInd.tagline}
                  </p>
                </div>

                <div className="relative z-10 grid grid-cols-2 gap-3 pt-6">
                  {currentInd.kpis.map((kpi) => (
                    <div
                      key={kpi.label}
                      className="p-3 rounded-xl border bg-black/80 backdrop-blur-md shadow-xs border-white/20"
                    >
                      <span className="font-mono text-base sm:text-lg font-black block text-white" style={{ color: kpi.tone }}>
                        {kpi.val}
                      </span>
                      <span className="text-[10px] font-mono text-white/70 block truncate font-semibold">
                        {kpi.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Problem, Solution & Gallery */}
              <div className="lg:col-span-7 p-8 sm:p-10 space-y-6 flex flex-col justify-between bg-white">
                <div className="space-y-5">
                  
                  <div className="p-5 rounded-2xl border bg-red-50/70 border-red-200">
                    <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider mb-2 text-red-700">
                      <AlertTriangle className="h-4 w-4" />
                      <span>The Specific Challenge:</span>
                    </div>
                    <p className="text-xs sm:text-sm leading-relaxed font-bold text-slate-900">
                      {currentInd.problem}
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl border bg-emerald-50/70 border-emerald-200">
                    <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider mb-2 text-emerald-700">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>How SCIO Solves It:</span>
                    </div>
                    <p className="text-xs sm:text-sm leading-relaxed font-bold text-slate-900">
                      {currentInd.solution}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 mb-2.5">
                      Field Telemetry Assets Monitored:
                    </h4>
                    <div className="grid grid-cols-3 gap-2.5">
                      {currentInd.gallery.map((g, gIdx) => (
                        <div
                          key={gIdx}
                          className="relative h-24 rounded-xl overflow-hidden border group bg-black shadow-xs"
                          style={{ borderColor: C.lineLight }}
                        >
                          <img src={g.img} alt={g.label} className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                          <span className="absolute bottom-1.5 left-2 right-2 text-[10.5px] font-mono text-white font-bold truncate drop-shadow-sm">
                            {g.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                <div className="pt-5 border-t flex items-center justify-between" style={{ borderColor: C.lineLight }}>
                  <span className="text-xs font-mono text-slate-700 font-bold">
                    Live data feeds initialized
                  </span>
                  <a
                    href={`/?launch=1&industry=${currentInd.id}&tab=${currentInd.tab}`}
                    onClick={(e) => handleNavClick(e, currentInd.id, currentInd.tab)}
                    className="px-6 py-3 rounded-full text-white font-bold text-xs font-mono shadow-md flex items-center gap-2 transition-all hover:scale-105 bg-black hover:bg-slate-900"
                  >
                    <span>Launch {currentInd.name.split(" ")[0]} Mission Control</span>
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>

              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ==================== 4. THE PROBLEM SECTION ==================== */}
      <section id="problem" className="py-20 border-t" style={{ background: C.white, borderColor: C.lineLight }}>
        <div className={`${SHELL} space-y-12`}>
          <SectionIntro
            eyebrow="02 — THE PROBLEM · THE INDUSTRIAL FRAGMENTATION CRISIS"
            title="What Problem Are We Solving?"
            description="Heavy industrial operations are drowning in siloed telemetry while critical equipment failures and supply bottlenecks remain hidden until disaster strikes."
            tone="light"
            rule
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "1. Data Trapped in Legacy Silos",
                desc: "SCADA systems, SAP/Oracle ERPs, IoT sensor streams, and spreadsheets never communicate with each other in real-time.",
                stat: "80% of signals unanalyzed",
                img: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80",
                tone: C.red
              },
              {
                title: "2. Reactive Firefighting",
                desc: "Engineering teams only discover turbine faults, hydraulic line leaks, and bunker fuel shortages after an outage occurs.",
                stat: "$120,000 / hr downtime",
                img: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80",
                tone: C.amber
              },
              {
                title: "3. Slow Action Execution",
                desc: "Even when an anomaly is spotted, drafting work orders, checking MRO spare parts inventory, and dispatching crews takes days.",
                stat: "6–9 day response lag",
                img: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80",
                tone: C.indigo
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border overflow-hidden transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between shadow-md"
                style={{ borderColor: C.lineLight, background: C.white }}
              >
                <div className="h-48 relative overflow-hidden bg-black">
                  <img src={item.img} alt={item.title} className="w-full h-full object-cover opacity-90 hover:scale-105 transition-all duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                  <span
                    className="absolute top-4 left-4 px-3 py-1 rounded-full font-mono text-[11px] font-bold border backdrop-blur-md bg-white text-black shadow-xs"
                    style={{ borderColor: item.tone }}
                  >
                    {item.stat}
                  </span>
                </div>

                <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold" style={{ color: C.ink }}>{item.title}</h3>
                    <p className="text-xs sm:text-sm leading-relaxed mt-2 font-medium" style={{ color: C.inkBody }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== 5. OUR SOLUTION (SEE → PREDICT → ACT) ==================== */}
      <section id="solution" className="py-20 border-t" style={{ background: C.whiteSurface, borderColor: C.lineLight }}>
        <div className={`${SHELL} space-y-12`}>
          <SectionIntro
            eyebrow="03 — THE OPERATING LOOP · SEE → PREDICT → ACT"
            title="What Is Our Solution?"
            description="Stellar SCIO is the unified, non-invasive operational AI layer that connects on top of your existing systems to deliver a closed-loop intelligence cycle:"
            tone="light"
            rule
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                phase: "SEE",
                title: "Unified Live Telemetry",
                desc: "Zero-rip-and-replace connectors ingest high-frequency IoT sensors, SCADA OPC-UA, and ERP databases into a synchronized digital twin.",
                tone: C.cyan,
                img: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
                icon: Eye
              },
              {
                step: "02",
                phase: "PREDICT",
                title: "Continuous Multivariate AI",
                desc: "Neural anomaly detection identifies thermal hotspots, bearing vibration fatigue, and port customs delays up to 14 days before failure.",
                tone: C.indigo,
                img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
                icon: Cpu
              },
              {
                step: "03",
                phase: "ACT",
                title: "Autonomous Work Execution",
                desc: "Automatically drafts MRO purchase orders, dispatches technician work orders, and syncs status back to ERP ledgers.",
                tone: C.green,
                img: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80",
                icon: Workflow
              },
            ].map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.step}
                  className="rounded-2xl border overflow-hidden transition-all duration-300 hover:-translate-y-1 shadow-md"
                  style={{ borderColor: C.lineLight, background: C.white }}
                >
                  <div className="h-40 relative overflow-hidden bg-black">
                    <img src={pillar.img} alt={pillar.title} className="w-full h-full object-cover opacity-90 hover:scale-105 transition-all duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 rounded-full font-mono text-[10px] font-bold border backdrop-blur-md bg-white text-black shadow-xs" style={{ borderColor: pillar.tone }}>
                        {pillar.step} — {pillar.phase}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg border bg-slate-50" style={{ borderColor: C.lineLight }}>
                        <Icon className="h-4 w-4" style={{ color: pillar.tone }} />
                      </div>
                      <h3 className="text-lg font-bold" style={{ color: C.ink }}>{pillar.title}</h3>
                    </div>
                    <p className="text-xs sm:text-sm leading-relaxed font-medium" style={{ color: C.inkBody }}>
                      {pillar.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ==================== 6. OPERATIONS CONTROL TOWER (FULL INTERACTIVE MARITIME/MULTI-SECTOR DASHBOARD) ==================== */}
      <section id="control-tower" className="py-20" style={{ background: C.night, color: C.chalk }}>
        <div className={`${SHELL} space-y-10`}>
          
          {/* Section Header */}
          <div className="flex flex-col justify-between gap-6 border-b border-white/[0.07] pb-8 xl:flex-row xl:items-end">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.09] bg-white/[0.03] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-[#8B5CF6] font-bold">
                <Anchor className="h-3.5 w-3.5" />
                04 — CONTROL TOWER · REAL-TIME MISSION CONTROL SUITE
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
                One Operations Control Tower for Global Industrial Fleets
              </h2>
              <p className="max-w-3xl text-sm leading-relaxed text-white/60 sm:text-[14.5px] font-medium">
                Live AIS maritime fleet tracking, Port State Control (PSC) deficiency remediation, bunker fuel reserves,
                and SOLAS/MARPOL compliance — with sub-second node telemetry behind every number.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href="/?launch=1&industry=maritime&tab=dashboard"
                onClick={(e) => handleNavClick(e, "maritime", "dashboard")}
                className="inline-flex items-center gap-2 rounded-xl border border-white/[0.12] bg-[#101315] px-4 py-2.5 font-mono text-xs font-bold text-white/80 transition-all hover:border-[#8B5CF6]/50 hover:bg-[#8B5CF6]/10 hover:text-white"
              >
                <Ship className="h-4 w-4 text-[#8B5CF6]" />
                <span>Open Full Fleet OCC</span>
                <ArrowUpRight className="h-3.5 w-3.5 opacity-60" />
              </a>
              <a
                href="/?launch=1&industry=maritime&tab=dashboard"
                onClick={(e) => handleNavClick(e, "maritime", "dashboard")}
                className="inline-flex items-center gap-2 rounded-xl border border-[#F0526B]/30 bg-[#F0526B]/10 px-4 py-2.5 font-mono text-xs font-bold text-[#F0526B] transition-all hover:border-[#F0526B]/60 hover:bg-[#F0526B]/20"
              >
                <CircleAlert className="h-4 w-4" />
                <span>1 Active SOLAS Deficiency</span>
              </a>
            </div>
          </div>

          {/* MAIN CONTROL TOWER SHELL */}
          <motion.div
            className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#101315] shadow-2xl"
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
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/40 font-bold">
                  CONTROL TOWER
                </span>
                <span className="h-3 w-[1px] bg-white/[0.1]" />
                <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                  {MARITIME_TABS.map((tab) => {
                    const isActive = dashboardTab === tab;
                    return (
                      <button
                        key={tab}
                        onClick={() => setDashboardTab(tab)}
                        className={`relative px-3 py-1.5 text-xs font-semibold transition-all rounded-md ${
                          isActive
                            ? "text-white bg-white/[0.08] font-bold shadow-xs"
                            : "text-white/40 hover:text-white/80 hover:bg-white/[0.02]"
                        }`}
                      >
                        {tab}
                        {isActive && (
                          <motion.span
                            layoutId="activeMaritimeHomeTabUnderline"
                            className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-[#8B5CF6]"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-[#2FBF71] font-bold">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#2FBF71] opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#2FBF71]" />
                </span>
                <span>Live · Global AIS Fleet Feed · 28 Vessels</span>
              </div>
            </motion.div>

            {/* Tab Content Panels */}
            <div className="p-4 sm:p-6 space-y-6">
              <AnimatePresence mode="wait">
                
                {/* ==================== TAB 1: OVERVIEW ==================== */}
                {dashboardTab === "Overview" && (
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
                      {/* KPI 1: Fleet Seaworthiness */}
                      <div className="rounded-xl border border-white/[0.08] bg-[#FFFDFA]/[0.02] p-4 transition-all hover:border-white/[0.14]">
                        <p className="font-mono text-[11px] uppercase tracking-[0.13em] text-white/50 font-bold sm:text-[11.5px]">
                          Fleet Seaworthiness
                        </p>
                        <p className="mt-3 text-[32px] font-bold leading-none tracking-[-0.03em] text-white sm:text-[38px]">
                          <CountUp to={94.8} decimals={1} />
                          <span className="text-[18px] font-bold text-white/55 ml-0.5">%</span>
                        </p>
                        <span className="mt-4 block h-1 overflow-hidden rounded-full bg-[#FFFDFA]/[0.06]">
                          <motion.span
                            className="block h-full rounded-full bg-[#2FBF71]"
                            initial={{ width: 0 }}
                            whileInView={{ width: "94.8%" }}
                            viewport={{ once: true, amount: 0.6 }}
                            transition={{ duration: 1.2, ease: ENTRANCE, delay: 0.1 }}
                          />
                        </span>
                      </div>

                      {/* KPI 2: Port Clearance Readiness */}
                      <div className="rounded-xl border border-white/[0.08] bg-[#FFFDFA]/[0.02] p-4 transition-all hover:border-white/[0.14]">
                        <p className="font-mono text-[11px] uppercase tracking-[0.13em] text-white/50 font-bold sm:text-[11.5px]">
                          Port Clearance Rate
                        </p>
                        <p className="mt-3 text-[32px] font-bold leading-none tracking-[-0.03em] text-white sm:text-[38px]">
                          <CountUp to={97.5} decimals={1} />
                          <span className="text-[18px] font-bold text-white/55 ml-0.5">%</span>
                        </p>
                        <span className="mt-4 block h-1 overflow-hidden rounded-full bg-[#FFFDFA]/[0.06]">
                          <motion.span
                            className="block h-full rounded-full bg-[#3FC8D8]"
                            initial={{ width: 0 }}
                            whileInView={{ width: "97.5%" }}
                            viewport={{ once: true, amount: 0.6 }}
                            transition={{ duration: 1.2, ease: ENTRANCE, delay: 0.2 }}
                          />
                        </span>
                      </div>

                      {/* KPI 3: PSC Inspection Readiness */}
                      <div className="rounded-xl border border-white/[0.08] bg-[#FFFDFA]/[0.02] p-4 transition-all hover:border-white/[0.14]">
                        <p className="font-mono text-[11px] uppercase tracking-[0.13em] text-white/50 font-bold sm:text-[11.5px]">
                          PSC Inspection Readiness
                        </p>
                        <p className="mt-3 text-[32px] font-bold leading-none tracking-[-0.03em] text-white sm:text-[38px]">
                          <CountUp to={91.8} decimals={1} />
                          <span className="text-[18px] font-bold text-white/55 ml-0.5">%</span>
                        </p>
                        <span className="mt-4 block h-1 overflow-hidden rounded-full bg-[#FFFDFA]/[0.06]">
                          <motion.span
                            className="block h-full rounded-full bg-[#8B5CF6]"
                            initial={{ width: 0 }}
                            whileInView={{ width: "91.8%" }}
                            viewport={{ once: true, amount: 0.6 }}
                            transition={{ duration: 1.2, ease: ENTRANCE, delay: 0.3 }}
                          />
                        </span>
                      </div>

                      {/* KPI 4: Critical Deficiencies */}
                      <div className="rounded-xl border border-[#F0526B]/30 bg-[#F0526B]/[0.07] p-4">
                        <p className="font-mono text-[11px] uppercase tracking-[0.13em] text-[#F0526B]/80 font-bold sm:text-[11.5px]">
                          Critical Deficiencies
                        </p>
                        <p className="mt-3 text-[32px] font-bold leading-none tracking-[-0.03em] text-white sm:text-[38px]">
                          <CountUp to={1} />
                          <span className="text-[18px] font-bold text-[#F0526B] ml-1">Flagged</span>
                        </p>
                        <p className="mt-3 font-mono text-[11px] text-[#F0526B] font-bold sm:text-[11.5px]">
                          Starboard Lifeboat Release · Cosco Galaxy
                        </p>
                      </div>
                    </motion.div>

                    {/* Middle Row 1: Fleet Distribution Radial Chart + Monthly Volume */}
                    <motion.div
                      variants={fadeUp}
                      className="grid gap-4 lg:grid-cols-[1fr_1.35fr]"
                    >
                      {/* Vessel Class Breakdown */}
                      <DashboardCard
                        title="Maritime Fleet Class Distribution"
                        accentColor="#8B5CF6"
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
                                className="text-white/[0.05]"
                                strokeWidth="4"
                              />
                              {MARITIME_DATA.vesselClasses.map((item, index) => {
                                const fraction = item.percent / 100;
                                const offset = MARITIME_DATA.vesselClasses.slice(0, index).reduce(
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
                                <span className="block text-[20px] font-black leading-none text-white">
                                  <CountUp to={28} />
                                </span>
                                <span className="mt-1 block font-mono text-[9.5px] uppercase tracking-[0.14em] text-white/50 font-bold">
                                  Vessels
                                </span>
                              </span>
                            </span>
                          </div>

                          <ul className="min-w-0 flex-1 space-y-2.5 w-full">
                            {MARITIME_DATA.vesselClasses.map((item) => (
                              <li key={item.label} className="flex items-center justify-between gap-2 text-xs">
                                <span className="flex items-center gap-2 truncate">
                                  <span
                                    className="h-2 w-2 shrink-0 rounded-full"
                                    style={{ background: item.color }}
                                  />
                                  <span className="truncate text-white/80 font-bold">{item.label}</span>
                                </span>
                                <span className="font-mono text-white font-black">
                                  {item.value} ({item.percent}%)
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </DashboardCard>

                      {/* Monthly Inspections & Voyage Volume Chart */}
                      <DashboardCard
                        title="Fleet Voyage Volume & Safety Inspections Logged"
                        accentColor="#3FC8D8"
                        badge={
                          <span className="font-mono text-[10.5px] text-[#3FC8D8] font-bold">
                            +22.4% Q3 Growth
                          </span>
                        }
                      >
                        <div className="mt-4 flex h-[140px] items-end justify-between gap-2 pt-2">
                          {[
                            ["Mar", 42],
                            ["Apr", 58],
                            ["May", 64],
                            ["Jun", 71],
                            ["Jul", 85],
                            ["Aug", 94],
                          ].map(([month, val], i) => (
                            <div key={month as string} className="flex flex-1 flex-col items-center gap-2 h-full justify-end">
                              <span className="text-[10px] font-mono text-white/60 font-bold">{val}</span>
                              <div className="w-full max-w-[28px] bg-white/[0.05] rounded-t-sm h-full flex flex-col justify-end overflow-hidden">
                                <motion.div
                                  className="w-full rounded-t-sm bg-gradient-to-t from-[#8B5CF6] to-[#3FC8D8]"
                                  initial={{ height: 0 }}
                                  whileInView={{ height: `${val}%` }}
                                  viewport={{ once: true, amount: 0.6 }}
                                  transition={{ duration: 0.8, delay: i * 0.08, ease: ENTRANCE }}
                                />
                              </div>
                              <span className="text-[10px] font-mono text-white/50 font-bold">{month}</span>
                            </div>
                          ))}
                        </div>
                      </DashboardCard>
                    </motion.div>

                    {/* Middle Row 2: Vessel Readiness & AI Marine Precision */}
                    <motion.div
                      variants={fadeUp}
                      className="grid gap-4 lg:grid-cols-2"
                    >
                      <DashboardCard
                        title="Vessel Seaworthiness & Active Voyage Routes"
                        accentColor="#2FBF71"
                        badge={
                          <span className="font-mono text-[10.5px] uppercase tracking-wider text-white/60 font-bold">
                            23 of 28 At Sea
                          </span>
                        }
                      >
                        <div className="mt-5 space-y-3.5">
                          {MARITIME_DATA.vesselScores.map((vessel, index) => (
                            <DashboardMeter
                              key={vessel.name}
                              label={vessel.name}
                              display={`${vessel.score}%`}
                              percent={vessel.score}
                              color={vessel.color}
                              delay={index * 0.07}
                            />
                          ))}
                        </div>
                      </DashboardCard>

                      <DashboardCard
                        title="AI Marine Computer Vision & Anomaly Precision"
                        accentColor="#3FC8D8"
                        badge={
                          <span className="font-mono text-[10.5px] uppercase tracking-wider text-[#3FC8D8] font-bold">
                            SCIO SeaOps Engine v4.2
                          </span>
                        }
                      >
                        <div className="mt-5 space-y-3.5">
                          {MARITIME_DATA.aiPrecision.map((item, index) => (
                            <DashboardMeter
                              key={item.label}
                              label={item.label}
                              display={`${item.val}%`}
                              percent={item.val}
                              color="#3FC8D8"
                              delay={index * 0.07}
                            />
                          ))}
                        </div>
                      </DashboardCard>
                    </motion.div>

                    {/* Bottom Operational Telemetry Footer Cards */}
                    <motion.div
                      variants={fadeUp}
                      className="grid gap-3 sm:grid-cols-3"
                    >
                      <div className="rounded-xl border border-white/[0.08] bg-[#FFFDFA]/[0.02] p-4 transition-all hover:border-white/[0.14]">
                        <p className="font-mono text-[11px] uppercase tracking-[0.13em] text-white/50 font-bold sm:text-[11.5px]">
                          Bunker &amp; Supply Bottlenecks
                        </p>
                        <p className="mt-3 flex items-baseline gap-2">
                          <span className="text-[26px] font-black leading-none text-white">2 Alerts</span>
                          <span className="text-[12.5px] font-bold text-[#E8A33D]">Rotterdam → Houston</span>
                        </p>
                        <p className="mt-2.5 text-[12px] leading-relaxed text-white/50 font-medium">
                          Spares delayed 48h · Aux injector work order prioritized for arrival berth.
                        </p>
                      </div>

                      <div className="rounded-xl border border-white/[0.08] bg-[#FFFDFA]/[0.02] p-4 transition-all hover:border-white/[0.14]">
                        <p className="font-mono text-[11px] uppercase tracking-[0.13em] text-white/50 font-bold sm:text-[11.5px]">
                          Active Maritime Crew &amp; Checklists
                        </p>
                        <p className="mt-3 flex items-baseline gap-2">
                          <span className="text-[26px] font-black leading-none text-white">28 Active</span>
                          <span className="text-[12.5px] font-bold text-[#2FBF71]">4 offline encrypted</span>
                        </p>
                        <p className="mt-2.5 text-[12px] leading-relaxed text-white/50 font-medium">
                          Encrypted voyage checklists synchronize immediately upon satellite bridge reconnect.
                        </p>
                      </div>

                      <div className="rounded-xl border border-white/[0.08] bg-[#FFFDFA]/[0.02] p-4 transition-all hover:border-white/[0.14]">
                        <p className="font-mono text-[11px] uppercase tracking-[0.13em] text-white/50 font-bold sm:text-[11.5px]">
                          Fleet Machinery Defect Trend
                        </p>
                        <p className="mt-3 flex items-baseline gap-2">
                          <span className="text-[26px] font-black leading-none text-white">−24%</span>
                          <span className="text-[12.5px] font-bold text-[#2FBF71]">90-day improvement</span>
                        </p>
                        <p className="mt-2.5 text-[12px] leading-relaxed text-white/50 font-medium">
                          Propulsion bearing vibration anomalies reduced following condition-based lubrication.
                        </p>
                      </div>
                    </motion.div>
                  </motion.div>
                )}

                {/* ==================== TAB 2: FLEET & AIS TRACKING ==================== */}
                {dashboardTab === "Fleet & AIS Tracking" && (
                  <motion.div
                    key="fleet-tab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <div className="rounded-xl border border-white/[0.08] bg-[#FFFDFA]/[0.02] p-5">
                      <div className="flex items-center justify-between mb-4 border-b border-white/[0.07] pb-3">
                        <h3 className="text-sm font-black text-white">Live AIS Maritime Fleet Registry</h3>
                        <span className="font-mono text-[10px] text-[#2FBF71] bg-[#2FBF71]/10 px-2 py-0.5 rounded border border-[#2FBF71]/20 font-bold uppercase">
                          28 VESSELS SYNCED
                        </span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs font-mono">
                          <thead>
                            <tr className="border-b border-white/[0.07] text-white/60 font-bold">
                              <th className="pb-2">VESSEL NAME</th>
                              <th className="pb-2">TYPE</th>
                              <th className="pb-2">CURRENT VOYAGE</th>
                              <th className="pb-2 text-right">SEAWORTHINESS</th>
                              <th className="pb-2 text-right">STATUS</th>
                              <th className="pb-2 text-right">ACTION</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/[0.04]">
                            {MARITIME_DATA.vesselScores.map((v) => (
                              <tr key={v.name} className="hover:bg-white/[0.02] transition-colors">
                                <td className="font-bold text-white py-3">{v.name}</td>
                                <td className="py-3 text-white/70">Container</td>
                                <td className="py-3 text-[#3FC8D8] font-bold">{v.route}</td>
                                <td className="text-right py-3 font-black" style={{ color: v.color }}>{v.score}%</td>
                                <td className="text-right py-3">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                    v.status === "At Sea" ? "bg-[#2FBF71]/15 text-[#2FBF71] border border-[#2FBF71]/30" :
                                    v.status === "Anchored" ? "bg-[#3FC8D8]/15 text-[#3FC8D8] border border-[#3FC8D8]/30" :
                                    "bg-[#F0526B]/15 text-[#F0526B] border border-[#F0526B]/30"
                                  }`}>
                                    {v.status}
                                  </span>
                                </td>
                                <td className="text-right py-3">
                                  <a
                                    href="/?launch=1&industry=maritime&tab=dashboard"
                                    onClick={(e) => handleNavClick(e, "maritime", "dashboard")}
                                    className="text-white/50 hover:text-white inline-block"
                                  >
                                    <ChevronRight className="h-4 w-4 ml-auto" />
                                  </a>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ==================== TAB 3: INSPECTIONS & PSC ==================== */}
                {dashboardTab === "Inspections & PSC" && (
                  <motion.div
                    key="inspections-tab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <div className="rounded-xl border border-white/[0.08] bg-[#FFFDFA]/[0.02] p-5">
                      <div className="flex items-center justify-between mb-4 border-b border-white/[0.07] pb-3">
                        <h3 className="text-sm font-black text-white">Port State Control (PSC) Deficiency &amp; Safety Audits</h3>
                        <span className="font-mono text-[10px] text-[#F0526B] bg-[#F0526B]/10 px-2 py-0.5 rounded border border-[#F0526B]/20 font-bold uppercase">
                          1 Critical / CAPA Pending
                        </span>
                      </div>

                      <div className="divide-y divide-white/[0.05]">
                        {MARITIME_DATA.inspections.map((insp, idx) => (
                          <div key={idx} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
                            <div className="flex items-center gap-3">
                              <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${
                                insp.severity === "Critical" ? "bg-[#F0526B]" : insp.severity === "Warning" ? "bg-[#E8A33D]" : "bg-[#2FBF71]"
                              }`} />
                              <div>
                                <span className="font-bold text-white text-sm block">{insp.item}</span>
                                <span className="text-white/50 text-[11px]">{insp.vessel} · Logged {insp.date}</span>
                              </div>
                            </div>
                            <span className={`px-2.5 py-1 rounded text-[10.5px] font-bold shrink-0 self-start sm:self-auto ${
                              insp.status === "Certified" ? "bg-[#2FBF71]/15 text-[#2FBF71] border border-[#2FBF71]/30" : "bg-[#F0526B]/15 text-[#F0526B] border border-[#F0526B]/30"
                            }`}>
                              {insp.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ==================== TAB 4: BUNKERING & MRO ==================== */}
                {dashboardTab === "Bunkering & MRO" && (
                  <motion.div
                    key="bunker-tab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <div className="rounded-xl border border-white/[0.08] bg-[#FFFDFA]/[0.02] p-5">
                      <div className="flex items-center justify-between mb-4 border-b border-white/[0.07] pb-3">
                        <h3 className="text-sm font-black text-white">Bunker Fuel ROB (Remaining On Board) Status</h3>
                        <span className="font-mono text-[10px] text-[#3FC8D8] bg-[#3FC8D8]/10 px-2 py-0.5 rounded border border-[#3FC8D8]/20 font-bold uppercase">
                          ISO 8217 VERIFIED
                        </span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs font-mono">
                          <thead>
                            <tr className="border-b border-white/[0.07] text-white/60 font-bold">
                              <th className="pb-2">VESSEL</th>
                              <th className="pb-2">VLSFO ON BOARD</th>
                              <th className="pb-2">MGO ON BOARD</th>
                              <th className="pb-2">NEXT BUNKER PORT</th>
                              <th className="pb-2 text-right">RESERVE STATUS</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/[0.04]">
                            {MARITIME_DATA.bunkerStatus.map((b) => (
                              <tr key={b.vessel} className="hover:bg-white/[0.02] transition-colors">
                                <td className="font-bold text-white py-3">{b.vessel}</td>
                                <td className="py-3 text-white font-bold">{b.vlsfo}</td>
                                <td className="py-3 text-white/80">{b.mgo}</td>
                                <td className="py-3 text-[#3FC8D8] font-bold">{b.nextPort}</td>
                                <td className="text-right py-3">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                    b.status === "Optimal" ? "bg-[#2FBF71]/15 text-[#2FBF71] border border-[#2FBF71]/30" : "bg-[#E8A33D]/15 text-[#E8A33D] border border-[#E8A33D]/30"
                                  }`}>
                                    {b.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ==================== TAB 5: SOLAS COMPLIANCE ==================== */}
                {dashboardTab === "SOLAS Compliance" && (
                  <motion.div
                    key="solas-tab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="grid gap-4 sm:grid-cols-3"
                  >
                    <div className="rounded-xl border border-white/[0.08] bg-[#FFFDFA]/[0.02] p-4">
                      <ShieldCheck className="h-6 w-6 text-[#2FBF71] mb-2" />
                      <h4 className="font-bold text-white text-sm">SOLAS Safety Equipment</h4>
                      <p className="text-xs text-white/50 mt-1">Life rafts, EPIRBs, and immersion suits inspected and certified.</p>
                      <span className="mt-3 inline-block font-mono text-[10px] text-[#2FBF71] font-bold">100% COMPLIANT</span>
                    </div>

                    <div className="rounded-xl border border-white/[0.08] bg-[#FFFDFA]/[0.02] p-4">
                      <Radio className="h-6 w-6 text-[#3FC8D8] mb-2" />
                      <h4 className="font-bold text-white text-sm">MARPOL Annex VI (CII)</h4>
                      <p className="text-xs text-white/50 mt-1">Carbon Intensity Indicator telemetry verified against IMO 2026 trajectories.</p>
                      <span className="mt-3 inline-block font-mono text-[10px] text-[#3FC8D8] font-bold">GRADE A RATING</span>
                    </div>

                    <div className="rounded-xl border border-white/[0.08] bg-[#FFFDFA]/[0.02] p-4">
                      <Anchor className="h-6 w-6 text-[#8B5CF6] mb-2" />
                      <h4 className="font-bold text-white text-sm">ISM Code SMS Audits</h4>
                      <p className="text-xs text-white/50 mt-1">Safety Management System internal audits synchronized for all 28 vessels.</p>
                      <span className="mt-3 inline-block font-mono text-[10px] text-[#8B5CF6] font-bold">ANNUAL AUDIT PASSED</span>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </motion.div>

        </div>
      </section>

      {/* ==================== 7. FIELD TELEMETRY PHOTO GALLERY ==================== */}
      <section id="gallery" className="py-20 border-t" style={{ background: C.white, borderColor: C.lineLight }}>
        <div className={`${SHELL} space-y-12`}>
          <SectionIntro
            eyebrow="05 — GLOBAL FOOTPRINT · CONNECTED FIELD TELEMETRY"
            title="Connected Field Assets in Active Operation"
            description="SCIO powers control centers, ocean navigation bridges, robotic plants, and sub-zero cold chain corridors worldwide."
            tone="light"
            rule
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: "12.4 GW Renewable Grid",
                sub: "50 Power Plants Monitored",
                industry: "energy",
                tab: "energy-dashboard",
                img: "https://images.unsplash.com/photo-1497440001374-f26997328c1b?auto=format&fit=crop&w=800&q=80",
                tag: "ENERGY"
              },
              {
                title: "Global Container Fleet",
                sub: "28 Ocean Vessels AIS Synced",
                industry: "maritime",
                tab: "dashboard",
                img: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=800&q=80",
                tag: "MARITIME"
              },
              {
                title: "Robotic Automotive Line",
                sub: "Sub-Second Vibration Analysis",
                industry: "manufacturing",
                tab: "dashboard",
                img: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80",
                tag: "MFG 4.0"
              },
              {
                title: "Cold-Chain Logistics Hub",
                sub: "-18.4°C IoT Telemetry Guard",
                industry: "logistics",
                tab: "dashboard",
                img: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80",
                tag: "SUPPLY CHAIN"
              },
            ].map((item) => (
              <a
                key={item.title}
                href={`/?launch=1&industry=${item.industry}&tab=${item.tab}`}
                onClick={(e) => handleNavClick(e, item.industry, item.tab)}
                className="group relative h-64 rounded-2xl overflow-hidden border transition-all duration-300 hover:scale-[1.02] shadow-md bg-black block cursor-pointer"
                style={{ borderColor: C.lineLight }}
              >
                <img src={item.img} alt={item.title} className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
                
                <div className="absolute top-3 left-3 z-10">
                  <span className="px-2.5 py-0.5 rounded font-mono text-[9px] font-bold bg-white text-black shadow-xs">
                    {item.tag}
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 space-y-1 z-10">
                  <h4 className="text-sm font-bold text-white leading-snug drop-shadow-sm">{item.title}</h4>
                  <p className="text-[11px] font-mono text-emerald-400 font-bold drop-shadow-sm">{item.sub}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== 8. THE "WHY SCIO?" COMPARISON ==================== */}
      <section id="why-scio" className="py-20 border-t" style={{ background: C.whiteSurface, borderColor: C.lineLight }}>
        <div className={`${SHELL} space-y-12`}>
          <SectionIntro
            eyebrow="06 — PARADIGM SHIFT · TRADITIONAL BI VS. STELLAR SCIO"
            title="Traditional dashboards tell you what happened. SCIO helps you understand what happens next."
            description="Transition from passive static charts to a proactive operational decision cockpit."
            tone="light"
            rule
          />

          <div
            className="max-w-4xl mx-auto rounded-2xl border overflow-hidden shadow-lg"
            style={{ borderColor: C.lineLight, background: C.white }}
          >
            <table className="w-full text-left border-collapse text-xs sm:text-sm font-mono">
              <thead>
                <tr className="border-b font-bold" style={{ borderColor: C.lineLight, background: "#F1F5F9", color: C.ink }}>
                  <th className="p-4 sm:p-5 uppercase tracking-wider">Dimension</th>
                  <th className="p-4 sm:p-5 uppercase tracking-wider opacity-60">Traditional BI</th>
                  <th className="p-4 sm:p-5 uppercase tracking-wider border-l font-black bg-black text-white">
                    Stellar SCIO
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: C.lineLightSoft }}>
                {[
                  { dim: "Focus", trad: "Historical reporting", scio: "Predictive intelligence" },
                  { dim: "Format", trad: "Static, passive dashboards", scio: "Dynamic operational cockpit" },
                  { dim: "Output", trad: "Raw data & charts", scio: "Concrete decision recommendations" },
                  { dim: "Workload", trad: "Manual human analysis", scio: "AI-powered automated triage" },
                  { dim: "Architecture", trad: "Isolated, siloed reports", scio: "Connected operational layer" },
                  { dim: "Posture", trad: "Reactive firefighting", scio: "Proactive risk prevention" },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 sm:p-5 font-bold" style={{ color: C.ink }}>{row.dim}</td>
                    <td className="p-4 sm:p-5 font-medium" style={{ color: C.inkMuted }}>{row.trad}</td>
                    <td className="p-4 sm:p-5 font-bold border-l flex items-center gap-2 bg-slate-900 text-white" style={{ borderColor: C.lineDark }}>
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                      <span>{row.scio}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ==================== 9. ENTERPRISE INTEGRATION INFOGRAPHIC PIPELINE ==================== */}
      <section id="integrations" className="py-20 border-t" style={{ background: C.whiteSurface, borderColor: C.lineLight }}>
        <div className={`${SHELL} space-y-12`}>
          <SectionIntro
            eyebrow="07 — INTEGRATION PIPELINE · ZERO RIP-AND-REPLACE"
            title="How SCIO Bridges Your Existing ERP & Telemetry to Autonomous Outcomes"
            description="SCIO sits non-invasively on top of your current enterprise systems. Click any data source below to trace how raw telemetry flows through SCIO's neural engine into automated actions."
            tone="light"
            rule
          />

          {/* Interactive 3-Stage Infographic Card */}
          <div
            className="rounded-3xl border overflow-hidden shadow-xl bg-white transition-all"
            style={{ borderColor: C.lineLight }}
          >
            {/* Top Interactive Selector Tabs */}
            <div className="p-4 sm:p-5 border-b bg-slate-50/80 flex flex-wrap items-center justify-between gap-3" style={{ borderColor: C.lineLight }}>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-mono text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Interactive Telemetry Flow Pipeline
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                {[
                  { id: "erp", label: "🏢 Business ERP & Finance", color: "#4F46E5" },
                  { id: "scada", label: "⚡ SCADA & Sensors (96 kS/s)", color: "#06B6D4" },
                  { id: "fleet", label: "🚢 Fleet & Vessel AIS", color: "#7C3AED" },
                  { id: "cloud", label: "☁️ Cloud & Data Lakes", color: "#10B981" },
                ].map((s) => {
                  const isSel = selectedIntegrationSource === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setSelectedIntegrationSource(s.id as any)}
                      className={`px-3.5 py-1.5 rounded-full font-mono text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs ${
                        isSel
                          ? "bg-black text-white shadow-sm"
                          : "bg-white text-slate-700 hover:text-black hover:bg-slate-100 border border-slate-200"
                      }`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: s.color }} />
                      <span>{s.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Main 3-Column Visual Pipeline */}
            <div className="p-6 sm:p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-11 gap-6 items-center">
              
              {/* STAGE 1: Left Column (Your Business ERP & Data Sources) */}
              <div className="lg:col-span-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] uppercase tracking-wider font-bold text-slate-500">
                    STAGE 01 · INPUT SOURCE
                  </span>
                  <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                    LEGACY &amp; REAL-TIME
                  </span>
                </div>

                <div className="p-5 rounded-2xl border bg-slate-50/70 border-slate-200 space-y-3.5 shadow-xs">
                  {selectedIntegrationSource === "erp" && (
                    <>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                          ERP
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">SAP S/4HANA &amp; Oracle</h4>
                          <p className="text-xs text-slate-600">MRO Ledgers, Purchase Requisitions, Vendor Lead Times</p>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-slate-200 text-xs font-mono space-y-1 text-slate-700">
                        <p className="flex justify-between"><span>PO Status Feed:</span> <span className="font-bold text-emerald-600">Connected</span></p>
                        <p className="flex justify-between"><span>Inventory Buffer:</span> <span className="font-bold text-slate-900">4,200 SKUs</span></p>
                        <p className="flex justify-between"><span>Sync Latency:</span> <span className="font-bold text-indigo-600">Sub-Second</span></p>
                      </div>
                    </>
                  )}

                  {selectedIntegrationSource === "scada" && (
                    <>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold text-sm">
                          IoT
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">OPC-UA / Modbus SCADA</h4>
                          <p className="text-xs text-slate-600">96.0 kS/s DSP Vibration, Substation Temperatures, Grid Frequency</p>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-slate-200 text-xs font-mono space-y-1 text-slate-700">
                        <p className="flex justify-between"><span>Sampling Rate:</span> <span className="font-bold text-cyan-600">96.0 kS/s DSP</span></p>
                        <p className="flex justify-between"><span>Active Channels:</span> <span className="font-bold text-slate-900">128 Vibration Ch</span></p>
                        <p className="flex justify-between"><span>Protocol:</span> <span className="font-bold text-cyan-700">IEC 61850 / OPC-UA</span></p>
                      </div>
                    </>
                  )}

                  {selectedIntegrationSource === "fleet" && (
                    <>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center font-bold text-sm">
                          AIS
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">AIS Transponders &amp; GPS</h4>
                          <p className="text-xs text-slate-600">Satellite Vessel Tracking, Bunker Fuel Levels, Cold-Chain IoT</p>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-slate-200 text-xs font-mono space-y-1 text-slate-700">
                        <p className="flex justify-between"><span>Monitored Fleet:</span> <span className="font-bold text-violet-600">28 Ocean Vessels</span></p>
                        <p className="flex justify-between"><span>Cold-Chain Temp:</span> <span className="font-bold text-slate-900">-18.4°C Target</span></p>
                        <p className="flex justify-between"><span>Satellite Feed:</span> <span className="font-bold text-emerald-600">Encrypted AIS</span></p>
                      </div>
                    </>
                  )}

                  {selectedIntegrationSource === "cloud" && (
                    <>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                          DWH
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">Snowflake, AWS &amp; Kafka</h4>
                          <p className="text-xs text-slate-600">Enterprise Data Lakehouses, Event Bus Telemetry, S3 Buckets</p>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-slate-200 text-xs font-mono space-y-1 text-slate-700">
                        <p className="flex justify-between"><span>Event Ingestion:</span> <span className="font-bold text-emerald-600">Kafka Streams</span></p>
                        <p className="flex justify-between"><span>Data Warehouse:</span> <span className="font-bold text-slate-900">Snowflake Zero-Copy</span></p>
                        <p className="flex justify-between"><span>Cloud Security:</span> <span className="font-bold text-emerald-700">SOC2 Type II</span></p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* FLOW ARROW 1 */}
              <div className="hidden lg:flex lg:col-span-1 items-center justify-center">
                <div className="flex flex-col items-center gap-1 text-slate-400">
                  <span className="font-mono text-[9.5px] uppercase font-bold text-slate-500">Ingest</span>
                  <div className="h-0.5 w-12 bg-gradient-to-r from-slate-300 via-indigo-500 to-slate-300 relative overflow-hidden">
                    <motion.div
                      className="absolute inset-0 bg-blue-500 w-4 h-full"
                      animate={{ x: [-20, 50] }}
                      transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                    />
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-600" />
                </div>
              </div>

              {/* STAGE 2: Center Column (STELLAR SCIO IN BETWEEN) */}
              <div className="lg:col-span-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] uppercase tracking-wider font-bold text-violet-700 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" />
                    STAGE 02 · SCIO OPERATIONAL AI (IN BETWEEN)
                  </span>
                  <span className="px-2 py-0.5 rounded font-mono text-[10px] font-black bg-black text-white shadow-xs">
                    THE AI ENGINE
                  </span>
                </div>

                <div className="p-5 rounded-2xl border bg-black text-white space-y-3.5 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/20 rounded-full blur-2xl pointer-events-none" />
                  
                  <div className="flex items-center gap-3 relative z-10">
                    <div className="h-10 w-10 rounded-xl bg-white text-black flex items-center justify-center font-black text-sm">
                      S
                    </div>
                    <div>
                      <h4 className="font-black text-white text-sm">STELLAR SCIO AI LAYER</h4>
                      <p className="text-xs font-mono text-emerald-400 font-bold">Multivariate Telemetry Ingestion</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs font-sans text-white/80 relative z-10 leading-relaxed border-t border-white/10 pt-3">
                    {selectedIntegrationSource === "erp" && (
                      <p>
                        <strong className="text-white">Cross-Silo AI Synthesis:</strong> Correlates ERP vendor delivery promises with real-time port delays, identifying supply chain bottlenecks 14 days in advance.
                      </p>
                    )}
                    {selectedIntegrationSource === "scada" && (
                      <p>
                        <strong className="text-white">DSP Anomaly Extraction:</strong> 24-Band FFT Spectral decomposition detects micro-vibration harmonic anomalies at 1.2 kHz, preventing catastrophic turbine bearing failure.
                      </p>
                    )}
                    {selectedIntegrationSource === "fleet" && (
                      <p>
                        <strong className="text-white">Autonomous SeaOps Routing:</strong> Evaluates vessel fuel consumption curves and Port State Control compliance checklists before destination berthing.
                      </p>
                    )}
                    {selectedIntegrationSource === "cloud" && (
                      <p>
                        <strong className="text-white">Unified Digital Twin:</strong> Synchronizes live telemetry streams from 50 enterprise assets into a single real-time decision cockpit.
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10.5px] font-mono text-white/60">
                    <span>Inference Speed: &lt; 20ms</span>
                    <span className="text-emerald-400 font-bold">Closed-Loop Active</span>
                  </div>
                </div>
              </div>

              {/* FLOW ARROW 2 */}
              <div className="hidden lg:flex lg:col-span-1 items-center justify-center">
                <div className="flex flex-col items-center gap-1 text-slate-400">
                  <span className="font-mono text-[9.5px] uppercase font-bold text-slate-500">Action</span>
                  <div className="h-0.5 w-12 bg-gradient-to-r from-slate-300 via-emerald-500 to-slate-300 relative overflow-hidden">
                    <motion.div
                      className="absolute inset-0 bg-emerald-500 w-4 h-full"
                      animate={{ x: [-20, 50] }}
                      transition={{ duration: 1.2, repeat: Infinity, ease: "linear", delay: 0.3 }}
                    />
                  </div>
                  <ChevronRight className="h-4 w-4 text-emerald-600" />
                </div>
              </div>

              {/* STAGE 3: Right Column (Automated Business Outcomes) */}
              <div className="lg:col-span-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] uppercase tracking-wider font-bold text-emerald-700">
                    STAGE 03 · AUTOMATED OUTCOME
                  </span>
                  <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                    ROI DELIVERED
                  </span>
                </div>

                <div className="p-5 rounded-2xl border bg-emerald-50/60 border-emerald-200 space-y-3.5 shadow-xs">
                  {selectedIntegrationSource === "erp" && (
                    <>
                      <div className="flex items-center gap-2 text-emerald-800">
                        <CheckCircle2 className="h-5 w-5 shrink-0" />
                        <h4 className="font-black text-slate-950 text-sm">Automatic MRO PO Generated</h4>
                      </div>
                      <p className="text-xs text-slate-800 leading-relaxed font-medium">
                        Work order and spare parts PO drafted directly into SAP S/4HANA with 0 manual paperwork, preventing assembly line buffer exhaustion.
                      </p>
                      <div className="pt-2 border-t border-emerald-200 font-mono text-xs font-bold text-emerald-900 flex justify-between">
                        <span>Expected Savings:</span>
                        <span>$1.4M / yr Outage Cost</span>
                      </div>
                    </>
                  )}

                  {selectedIntegrationSource === "scada" && (
                    <>
                      <div className="flex items-center gap-2 text-emerald-800">
                        <CheckCircle2 className="h-5 w-5 shrink-0" />
                        <h4 className="font-black text-slate-950 text-sm">Zero Unplanned Downtime</h4>
                      </div>
                      <p className="text-xs text-slate-800 leading-relaxed font-medium">
                        Technician dispatched with precise bearing replacement kit 14 days before line failure, preventing $120,000/hr in downtime losses.
                      </p>
                      <div className="pt-2 border-t border-emerald-200 font-mono text-xs font-bold text-emerald-900 flex justify-between">
                        <span>Line Uptime:</span>
                        <span>99.4% OEE Reliability</span>
                      </div>
                    </>
                  )}

                  {selectedIntegrationSource === "fleet" && (
                    <>
                      <div className="flex items-center gap-2 text-emerald-800">
                        <CheckCircle2 className="h-5 w-5 shrink-0" />
                        <h4 className="font-black text-slate-950 text-sm">Demurrage &amp; PSC Clearance</h4>
                      </div>
                      <p className="text-xs text-slate-800 leading-relaxed font-medium">
                        Vessel speed optimized to berth just-in-time while safety CAPA is closed before arrival, eliminating $420k in demurrage penalties.
                      </p>
                      <div className="pt-2 border-t border-emerald-200 font-mono text-xs font-bold text-emerald-900 flex justify-between">
                        <span>Port Clearance:</span>
                        <span>97.5% On-Schedule</span>
                      </div>
                    </>
                  )}

                  {selectedIntegrationSource === "cloud" && (
                    <>
                      <div className="flex items-center gap-2 text-emerald-800">
                        <CheckCircle2 className="h-5 w-5 shrink-0" />
                        <h4 className="font-black text-slate-950 text-sm">Executive Boardroom Control</h4>
                      </div>
                      <p className="text-xs text-slate-800 leading-relaxed font-medium">
                        Instant executive visibility connecting high-level financials to live edge IoT sensor streams with zero latency.
                      </p>
                      <div className="pt-2 border-t border-emerald-200 font-mono text-xs font-bold text-emerald-900 flex justify-between">
                        <span>Enterprise Sync:</span>
                        <span>50 Assets Monitored</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

            </div>

            {/* Bottom Integration Ecosystem Logos */}
            <div className="p-4 sm:p-5 border-t bg-slate-50 border-slate-200 flex flex-wrap items-center justify-between gap-4">
              <span className="font-mono text-xs font-bold text-slate-700">
                Pre-Built Connectors:
              </span>
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono font-bold text-slate-800">
                {["SAP ERP", "Oracle NetSuite", "OPC-UA SCADA", "Modbus TCP", "Snowflake", "AWS / Azure", "Salesforce", "Kafka Streams"].map((tech) => (
                  <span key={tech} className="px-3 py-1 rounded-lg bg-white border border-slate-200 shadow-xs">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== 10. CLOSING CTA (DEEP OBSIDIAN BLACK) ==================== */}
      <section className="py-20" style={{ background: C.night, color: C.chalk }}>
        <div className={`${SHELL}`}>
          <div
            className="p-10 sm:p-16 rounded-3xl border text-center space-y-6 shadow-2xl relative overflow-hidden"
            style={{ borderColor: C.lineDark, background: C.nightRaised }}
          >
            <h2 className="text-3xl sm:text-5xl font-bold font-display" style={{ color: C.chalkBright }}>
              Your data already knows what&apos;s happening.<br />
              <span style={{ color: C.cyan }}>
                Let SCIO tell you what to do next.
              </span>
            </h2>
            <p className="text-sm max-w-xl mx-auto font-sans leading-relaxed text-white/80 font-medium">
              Connect your operational telemetry. Surface the signals that matter. Predict outcomes. Execute with speed.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <button
                onClick={() => setDemoModalOpen(true)}
                className="px-8 py-3.5 rounded-full font-bold text-xs sm:text-sm font-mono shadow-lg transition-all hover:scale-105 bg-white text-black hover:bg-slate-100"
              >
                Request a Demo
              </button>
              <a
                href="/?launch=1&industry=energy&tab=energy-dashboard"
                onClick={(e) => handleNavClick(e, "energy", "energy-dashboard")}
                className="px-8 py-3.5 rounded-full border-2 border-emerald-500 font-bold text-xs sm:text-sm font-mono shadow-md transition-all hover:scale-105 text-white bg-transparent hover:bg-emerald-500/10 inline-block"
              >
                Launch Live Platform →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== 11. ENTERPRISE FOOTER ==================== */}
      <footer className="border-t py-14 px-6 lg:px-12 text-xs font-mono" style={{ background: C.nightPanel, borderColor: C.lineDark, color: C.slate400 }}>
        <div className={`${SHELL} grid grid-cols-2 md:grid-cols-5 gap-8`}>
          <div className="col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div
                className="h-8 w-8 rounded-lg flex items-center justify-center font-mono font-black text-xs bg-white text-black"
              >
                S
              </div>
              <span className="font-bold text-xs uppercase tracking-widest text-white">STELLAR SCIO</span>
            </div>
            <p className="text-[11px] leading-relaxed font-sans max-w-sm opacity-80">
              AI-Powered Operational Intelligence & Mission Control layer for Fortune 500 enterprise operations.
            </p>
            <p className="text-[10px] opacity-60">
              © 2026 StellarMind.ai. All rights reserved.
            </p>
          </div>

          <div className="space-y-2.5">
            <h5 className="font-bold uppercase text-[10px] tracking-wider text-white">Solutions</h5>
            <div className="space-y-1.5 flex flex-col">
              <a href="/?launch=1&industry=energy&tab=energy-dashboard" onClick={(e) => handleNavClick(e, "energy", "energy-dashboard")} className="text-left hover:text-white transition-colors">Renewable Energy</a>
              <a href="/?launch=1&industry=maritime&tab=dashboard" onClick={(e) => handleNavClick(e, "maritime", "dashboard")} className="text-left hover:text-white transition-colors">Maritime Fleet</a>
              <a href="/?launch=1&industry=manufacturing&tab=dashboard" onClick={(e) => handleNavClick(e, "manufacturing", "dashboard")} className="text-left hover:text-white transition-colors">Manufacturing 4.0</a>
              <a href="/?launch=1&industry=logistics&tab=dashboard" onClick={(e) => handleNavClick(e, "logistics", "dashboard")} className="text-left hover:text-white transition-colors">Supply Chain</a>
            </div>
          </div>

          <div className="space-y-2.5">
            <h5 className="font-bold uppercase text-[10px] tracking-wider text-white">Platform</h5>
            <div className="space-y-1.5 flex flex-col">
              <a href="/?launch=1&industry=energy&tab=energy-dashboard" onClick={(e) => handleNavClick(e, "energy", "energy-dashboard")} className="text-left hover:text-white transition-colors">Intelligence Engine</a>
              <a href="/?launch=1&industry=maritime&tab=dashboard" onClick={(e) => handleNavClick(e, "maritime", "dashboard")} className="text-left hover:text-white transition-colors">AI Copilot</a>
              <a href="/?launch=1&industry=manufacturing&tab=dashboard" onClick={(e) => handleNavClick(e, "manufacturing", "dashboard")} className="text-left hover:text-white transition-colors">Predictive Analytics</a>
              <a href="/?launch=1&industry=logistics&tab=dashboard" onClick={(e) => handleNavClick(e, "logistics", "dashboard")} className="text-left hover:text-white transition-colors">Integrations</a>
            </div>
          </div>

          <div className="space-y-2.5">
            <h5 className="font-bold uppercase text-[10px] tracking-wider text-white">Company &amp; Insights</h5>
            <div className="space-y-1.5 flex flex-col">
              <a href="#problem" className="hover:text-white transition-colors">The Problem</a>
              <a href="#solution" className="hover:text-white transition-colors">Our Solution</a>
              <a href="#industries" className="hover:text-white transition-colors">4 Industries</a>
              <button onClick={onOpenResources} className="text-left hover:text-white transition-colors text-emerald-400 font-bold">Case Studies &amp; Blogs</button>
              <button onClick={() => setDemoModalOpen(true)} className="text-left hover:text-white transition-colors">Contact Sales</button>
            </div>
          </div>
        </div>
      </footer>

      {/* ==================== DEMO REQUEST MODAL ==================== */}
      {demoModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div
            className="border rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl font-mono"
            style={{ background: C.nightRaised, borderColor: C.lineDark, color: C.chalk }}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full animate-pulse" style={{ background: C.cyan }} />
                <h3 className="font-bold text-sm text-white">Request Enterprise Demo</h3>
              </div>
              <button onClick={() => setDemoModalOpen(false)} className="opacity-50 hover:opacity-100 text-lg text-white">✕</button>
            </div>

            {demoSubmitted ? (
              <div className="py-6 text-center space-y-3 font-sans">
                <div className="h-12 w-12 rounded-full border mx-auto flex items-center justify-center" style={{ background: "rgba(16,185,129,0.2)", borderColor: C.green, color: C.green }}>
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h4 className="text-base font-bold text-white">Demo Request Received</h4>
                <p className="text-xs text-white/70">Our Enterprise Architecture team will reach out within 2 hours.</p>
                <a
                  href="/?launch=1&industry=energy&tab=energy-dashboard"
                  onClick={(e) => {
                    handleNavClick(e, "energy", "energy-dashboard");
                    setDemoModalOpen(false);
                    setDemoSubmitted(false);
                  }}
                  className="mt-4 px-4 py-2 rounded-lg font-bold text-xs font-mono bg-white text-black hover:bg-slate-100 inline-block"
                >
                  Explore Interactive Live Demo Now →
                </a>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setDemoSubmitted(true);
                }}
                className="space-y-3 font-sans text-xs"
              >
                <div>
                  <label className="block mb-1 font-mono text-[10px] uppercase text-white/60">Corporate Work Email</label>
                  <input
                    type="email"
                    required
                    placeholder="name@enterprise.com"
                    className="w-full px-3 py-2 border rounded-lg font-mono focus:outline-none text-white"
                    style={{ background: C.night, borderColor: C.lineDark }}
                  />
                </div>
                <div>
                  <label className="block mb-1 font-mono text-[10px] uppercase text-white/60">Primary Operating Sector</label>
                  <select
                    className="w-full px-3 py-2 border rounded-lg font-mono focus:outline-none text-white"
                    style={{ background: C.night, borderColor: C.lineDark }}
                  >
                    <option value="energy">Renewable Energy & Utilities</option>
                    <option value="maritime">Maritime Fleet Operations</option>
                    <option value="manufacturing">Manufacturing 4.0 & OEE</option>
                    <option value="logistics">Multimodal Supply Chain</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full mt-2 py-3 font-bold text-xs font-mono rounded-lg shadow-md bg-white text-black hover:bg-slate-100"
                >
                  Submit Demo Request
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
