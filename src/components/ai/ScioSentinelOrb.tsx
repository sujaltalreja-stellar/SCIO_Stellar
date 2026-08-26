"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Send,
  Sparkles,
  RefreshCw,
  ArrowRight,
  Cpu,
  Bot,
  Zap,
  Activity,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Shield,
  Layers,
  Terminal,
  FileText,
  Compass,
  Radio,
  Eye
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip
} from "recharts";

interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
  provider?: string;
  visualType?: "trend" | "pareto" | "risk_matrix" | "work_order_action" | "none";
  suggestedAction?: {
    type: string;
    label: string;
    payload?: any;
  } | null;
}

interface SectionIntel {
  id: string;
  stepNum: string;
  tag: string;
  title: string;
  color: string;
  colorBg: string;
  summary: string;
  keyPoints: string[];
  suggestedPrompt: string;
}

const SECTION_INTELLIGENCE: Record<string, SectionIntel> = {
  hero: {
    id: "top",
    stepNum: "01",
    tag: "ENTERPRISE OS",
    title: "Operations Intelligence Overview",
    color: "#3B82F6",
    colorBg: "rgba(59, 130, 246, 0.15)",
    summary: "One platform unifying machines, inspections, supply chain & field operations for complete real-time visibility.",
    keyPoints: ["12.4 GW Monitored", "98.4% Reliability", "Live AI Copilot"],
    suggestedPrompt: "Give me a 1-minute executive summary of the Stellar SCIO platform."
  },
  industries: {
    id: "industries",
    stepNum: "02",
    tag: "4 SECTOR HUBS",
    title: "Multi-Industry Operations",
    color: "#10B981",
    colorBg: "rgba(16, 185, 129, 0.15)",
    summary: "Specialized intelligence modules for Renewable Energy, Maritime Fleets, Manufacturing 4.0, and Supply Chain.",
    keyPoints: ["Energy Grid", "Maritime AIS", "Plant OEE", "Cold-Chain"],
    suggestedPrompt: "Which 4 industries does SCIO support and what are the main features?"
  },
  problem: {
    id: "problem",
    stepNum: "03",
    tag: "OPERATIONAL BOTTLENECKS",
    title: "The Problem: Siloed Industrial Data",
    color: "#EF4444",
    colorBg: "rgba(239, 68, 68, 0.15)",
    summary: "Fragmented SCADA systems, false alarm fatigue, and parts stockouts cause 18% unexpected production downtime.",
    keyPoints: ["Data Silos", "Alert Fatigue", "Delayed Repairs"],
    suggestedPrompt: "How does SCIO solve industrial data silos and false alarm fatigue?"
  },
  solution: {
    id: "solution",
    stepNum: "04",
    tag: "CLOSED-LOOP OS",
    title: "Autonomous Context Graph",
    color: "#6366F1",
    colorBg: "rgba(99, 102, 241, 0.15)",
    summary: "Connects raw sensors with equipment BOMs, maintenance manuals & ERP systems into a live semantic Digital Twin.",
    keyPoints: ["Semantic Twin", "Sub-second Ingestion", "Closed-Loop Actions"],
    suggestedPrompt: "Explain the SCIO Context Graph and semantic Digital Twin."
  },
  "how-it-works": {
    id: "how-it-works",
    stepNum: "05",
    tag: "4-STEP LOOP",
    title: "How SCIO Works (4 Simple Steps)",
    color: "#06B6D4",
    colorBg: "rgba(6, 182, 212, 0.15)",
    summary: "CONNECT all telemetry → UNDERSTAND digital twins → PREDICT bearing failure 14 days early → ACT in SAP/Maximo.",
    keyPoints: ["1. Connect", "2. Understand", "3. Predict", "4. Act"],
    suggestedPrompt: "Explain the 4 steps: CONNECT, UNDERSTAND, PREDICT, and ACT."
  },
  "control-tower": {
    id: "control-tower",
    stepNum: "06",
    tag: "CONTROL TOWER",
    title: "Operations Control Tower (Live OCC)",
    color: "#8B5CF6",
    colorBg: "rgba(139, 92, 246, 0.15)",
    summary: "Live interactive telemetry cockpit tracking 2,854 MW load, 50.02 Hz frequency, and automated dispatch matrix.",
    keyPoints: ["2,854 MW Live", "50.02 Hz Grid", "Real-time Telemetry"],
    suggestedPrompt: "Explain what metrics are shown in this Control Tower dashboard."
  },
  gallery: {
    id: "gallery",
    stepNum: "07",
    tag: "FIELD MOBILITY",
    title: "Field Telemetry & Mobile Tech App",
    color: "#EC4899",
    colorBg: "rgba(236, 72, 153, 0.15)",
    summary: "Field technicians scan QR codes to view live vibration spectra, schematics, and execute guided digital work orders.",
    keyPoints: ["QR Scanning", "Offline Sync", "Mobile Checklist"],
    suggestedPrompt: "How do technicians use the mobile inspection copilot in the field?"
  },
  integrations: {
    id: "integrations",
    stepNum: "08",
    tag: "CONNECTORS",
    title: "Universal Protocols & ERP Sync",
    color: "#F59E0B",
    colorBg: "rgba(245, 158, 11, 0.15)",
    summary: "Plug-and-play drivers for OPC-UA, Modbus, MQTT Sparkplug B, SAP S/4HANA PM, IBM Maximo, and Oracle.",
    keyPoints: ["OPC-UA / Modbus", "MQTT Sparkplug", "SAP / Maximo Sync"],
    suggestedPrompt: "How easily can SCIO integrate with our plant's existing OPC-UA & SAP systems?"
  },
  "why-scio": {
    id: "why-scio",
    stepNum: "09",
    tag: "ENTERPRISE ROI",
    title: "Why SCIO: 8.4x Value Realization",
    color: "#10B981",
    colorBg: "rgba(16, 185, 129, 0.15)",
    summary: "Proven metrics: 91% drop in false alarms, 14-day early warning before failure, and $2.8M annual downtime saved per site.",
    keyPoints: ["8.4x ROI", "14-Day Warning", "$2.8M Saved/Site"],
    suggestedPrompt: "What is the ROI and payback timeline for deploying SCIO?"
  }
};

// ============================================================================
// DEDICATED GUIDANCE FOR DASHBOARD TABS ACROSS ALL 4 INDUSTRIES
// ============================================================================
const DASHBOARD_TAB_INTELLIGENCE: Record<string, SectionIntel> = {
  // MARITIME TABS
  "dashboard": {
    id: "dashboard",
    stepNum: "01",
    tag: "CENTRAL COMMAND",
    title: "Fleet Control Room",
    color: "#3B82F6",
    colorBg: "rgba(59, 130, 246, 0.15)",
    summary: "Live fleet overview: 12 cargo ships at sea, propulsion engine alarms, fuel levels & port arrival schedules.",
    keyPoints: ["12 Ships Active", "Engine Health", "Fuel Watch"],
    suggestedPrompt: "Give me an operational summary of the Maritime Fleet Control Room."
  },
  "fleet": {
    id: "fleet",
    stepNum: "02",
    tag: "SHIP TRACKING",
    title: "Live GPS & Voyage Tracking",
    color: "#3B82F6",
    colorBg: "rgba(59, 130, 246, 0.15)",
    summary: "Real-time vessel GPS coordinates, speeds, weather routes, and estimated port arrival times (ETA).",
    keyPoints: ["Live GPS Coordinates", "Speed Curves", "Weather Routing"],
    suggestedPrompt: "Show vessel locations and estimated port arrival times for the fleet."
  },
  "assets": {
    id: "assets",
    stepNum: "03",
    tag: "MACHINERY HEALTH",
    title: "Ship Engines & Equipment",
    color: "#3B82F6",
    colorBg: "rgba(59, 130, 246, 0.15)",
    summary: "Live telemetry on main propulsion engines, generators, boilers & pumps to catch overheating before breakdowns.",
    keyPoints: ["Exhaust Temperatures", "Oil Pressure", "Vibration Spectra"],
    suggestedPrompt: "Check main propulsion engine health and temperature alerts across active vessels."
  },
  "work-orders": {
    id: "work-orders",
    stepNum: "04",
    tag: "PORT MAINTENANCE",
    title: "Ship Work Orders & Repairs",
    color: "#3B82F6",
    colorBg: "rgba(59, 130, 246, 0.15)",
    summary: "Track planned overhauls, emergency repair crews, and maintenance tasks scheduled for the next port call.",
    keyPoints: ["Assigned Crews", "Parts Required", "Port Schedules"],
    suggestedPrompt: "What emergency and planned repair work orders are open for our ships?"
  },
  "inventory": {
    id: "inventory",
    stepNum: "05",
    tag: "SPARE PARTS & MRO",
    title: "Ship Spare Parts & Fuel Logs",
    color: "#3B82F6",
    colorBg: "rgba(59, 130, 246, 0.15)",
    summary: "Monitor on-board spare valves, filters & gaskets, and automatically order parts to be delivered to destination ports.",
    keyPoints: ["Fuel Remaining", "Onboard Lockers", "Port Delivery"],
    suggestedPrompt: "How are ship spare parts synchronized and delivered to destination ports?"
  },
  "compliance": {
    id: "compliance",
    stepNum: "06",
    tag: "SAFETY INSPECTIONS",
    title: "Safety Equipment & Walkthroughs",
    color: "#3B82F6",
    colorBg: "rgba(59, 130, 246, 0.15)",
    summary: "Routine safety checklists for lifeboats, fire alarms, life jackets & watertight doors so ships pass port inspections.",
    keyPoints: ["Lifeboat Readiness", "Fire Systems", "Inspection Pass Rate"],
    suggestedPrompt: "What routine safety equipment inspections are due on our vessels?"
  },
  "supply": {
    id: "supply",
    stepNum: "07",
    tag: "SUPPLY CHAIN",
    title: "Marine Procurement & POs",
    color: "#3B82F6",
    colorBg: "rgba(59, 130, 246, 0.15)",
    summary: "Vendor purchase orders, lead-time tracking, and automated spare parts purchase requisitions.",
    keyPoints: ["Purchase Orders", "Supplier Lead Times", "Automated Approval"],
    suggestedPrompt: "Explain the procurement workflow for ordering marine spare parts."
  },
  "crew": {
    id: "crew",
    stepNum: "08",
    tag: "CREW OPERATIONS",
    title: "Ship Crew & Officer Shifts",
    color: "#3B82F6",
    colorBg: "rgba(59, 130, 246, 0.15)",
    summary: "Track captains, chief engineers, crew shift handovers, rest hours, and onboard medical certifications.",
    keyPoints: ["Captain & Officers", "Shift Handovers", "Rest Hour Compliance"],
    suggestedPrompt: "How does SCIO track ship crew rosters and shift handovers?"
  },

  // ENERGY TABS
  "energy-dashboard": {
    id: "energy-dashboard",
    stepNum: "01",
    tag: "GRID CONTROL ROOM",
    title: "Central Energy Operations Room",
    color: "#10B981",
    colorBg: "rgba(16, 185, 129, 0.15)",
    summary: "Real-time 12.4 GW grid load balancing, 50.02 Hz frequency monitoring, and 8 active substation nodes.",
    keyPoints: ["12.4 GW Grid Load", "50.02 Hz Stability", "8 Substations"],
    suggestedPrompt: "Analyze current grid load and frequency stability across all 8 substations."
  },
  "energy-flow": {
    id: "energy-flow",
    stepNum: "02",
    tag: "POWER FLOW",
    title: "SCIO Power Flow Explorer",
    color: "#10B981",
    colorBg: "rgba(16, 185, 129, 0.15)",
    summary: "Interactive power transmission flow from solar farms and wind hubs into city substations and industrial feeders.",
    keyPoints: ["Substation Flow", "Line Impedance", "Voltage Stability"],
    suggestedPrompt: "How does power flow from wind and solar farms through our 8 substations?"
  },
  "energy-assets": {
    id: "energy-assets",
    stepNum: "03",
    tag: "RENEWABLE ASSETS",
    title: "Solar, Wind & BESS Assets",
    color: "#10B981",
    colorBg: "rgba(16, 185, 129, 0.15)",
    summary: "Condition monitoring for wind turbine pitch bearings, solar inverter DC/AC ratios, and battery storage cells.",
    keyPoints: ["Wind Turbines", "Solar Inverters", "BESS Batteries"],
    suggestedPrompt: "What is the health score of our wind turbines and solar inverter arrays?"
  },
  "energy-field-ops": {
    id: "energy-field-ops",
    stepNum: "04",
    tag: "FIELD CREWS",
    title: "Substation Field Operations",
    color: "#10B981",
    colorBg: "rgba(16, 185, 129, 0.15)",
    summary: "Mobile work order dispatch for high-voltage electricians, transformer oil sampling, and inverter repairs.",
    keyPoints: ["Field Work Orders", "Mobile Dispatch", "Safety Lockout"],
    suggestedPrompt: "How are field technicians dispatched to substation transformer work orders?"
  },

  // MANUFACTURING TABS
  "planning": {
    id: "planning",
    stepNum: "02",
    tag: "PRODUCTION PLANNING",
    title: "Factory Production Planning",
    color: "#F59E0B",
    colorBg: "rgba(245, 158, 11, 0.15)",
    summary: "Dynamic production scheduling across 24 robotic cells and CNC machining lines to prevent bottleneck delays.",
    keyPoints: ["Gantt Scheduling", "Line Capacity", "Shift Targets"],
    suggestedPrompt: "How does SCIO optimize production line scheduling to maximize OEE?"
  },
  "quality": {
    id: "quality",
    stepNum: "03",
    tag: "QUALITY AI",
    title: "Quality & Batch Traceability",
    color: "#F59E0B",
    colorBg: "rgba(245, 158, 11, 0.15)",
    summary: "Continuous quality inspection and automated batch quarantine when machine sensors drift out of tolerance.",
    keyPoints: ["Automated Quarantine", "Scrap Reduction", "Sensor Tolerance"],
    suggestedPrompt: "How does SCIO automatically quarantine defect batches in manufacturing?"
  },
  "maintenance": {
    id: "maintenance",
    stepNum: "04",
    tag: "MACHINE HEALTH",
    title: "CNC Spindle & Machine Health",
    color: "#F59E0B",
    colorBg: "rgba(245, 158, 11, 0.15)",
    summary: "Multi-axis vibration FFT analysis on 5-axis CNC spindles to detect bearing fatigue before tool breakage.",
    keyPoints: ["Spindle Vibration", "Bearing Wear", "Tool Life AI"],
    suggestedPrompt: "Explain how SCIO detects CNC spindle bearing wear before failure."
  },

  // LOGISTICS TABS
  "fleet-map": {
    id: "fleet-map",
    stepNum: "02",
    tag: "GPS TELEMATICS",
    title: "Live Multimodal Fleet Map",
    color: "#38BDF8",
    colorBg: "rgba(56, 189, 248, 0.15)",
    summary: "Global satellite map tracking refrigerated container trucks, intermodal trains, and freight vessels in real-time.",
    keyPoints: ["Live Telematics", "Route Geofencing", "Traffic Alerts"],
    suggestedPrompt: "Show real-time GPS locations and transit status for our freight fleet."
  },
  "cold-chain": {
    id: "cold-chain",
    stepNum: "03",
    tag: "COLD-CHAIN IOT",
    title: "Cold-Chain Reefer Monitoring",
    color: "#38BDF8",
    colorBg: "rgba(56, 189, 248, 0.15)",
    summary: "Continuous temperature monitoring across 142 refrigerated reefers (-25°C to +4°C) with immediate excursion alarms.",
    keyPoints: ["142 Reefers Live", "-21.4°C Average", "0 Excursion Breaches"],
    suggestedPrompt: "Check live temperature telemetry across all 142 refrigerated reefers."
  },
  "demurrage-ai": {
    id: "demurrage-ai",
    stepNum: "04",
    tag: "DISRUPTION AI",
    title: "Delay & Disruption Prediction",
    color: "#38BDF8",
    colorBg: "rgba(56, 189, 248, 0.15)",
    summary: "Forecasts vendor shipping delays and port bottlenecks 6 to 9 days in advance to re-route freight.",
    keyPoints: ["6-9 Days Lead Time", "Port Congestion", "Dynamic Re-routing"],
    suggestedPrompt: "How does SCIO forecast shipping delays and port congestion 6-9 days early?"
  }
};

function ChatMessageFormatted({ text, isBot }: { text: string; isBot: boolean }) {
  if (!isBot) {
    return <span className="whitespace-pre-wrap">{text}</span>;
  }

  // Clean out artificial meta headers or '---' lines if present
  const cleaned = text
    .replace(/\*\*SCIO Sentinel 24\/7 Response[^\n]*\*\*/gi, "")
    .replace(/^---+$/gm, "")
    .trim();

  // Split into lines
  const lines = cleaned.split("\n").filter((l) => l.trim().length > 0);

  const formatInline = (str: string) => {
    const parts = str.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="text-white font-bold">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code key={i} className="px-1 py-0.5 rounded bg-white/10 text-cyan-300 font-mono text-[11px]">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  return (
    <div className="space-y-2 text-slate-100 font-sans text-xs leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        // Heading lines (e.g. ### Heading or **Heading**)
        if (trimmed.startsWith("###") || trimmed.startsWith("##")) {
          const headingText = trimmed.replace(/^#+\s*/, "").replace(/\*\*/g, "");
          return (
            <div key={idx} className="pt-1.5 pb-0.5">
              <span className="text-[12px] font-black text-cyan-300 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                {headingText}
              </span>
            </div>
          );
        }

        // Bullet list item
        if (trimmed.startsWith("- ") || trimmed.startsWith("• ") || trimmed.startsWith("* ")) {
          const content = trimmed.replace(/^[-•*]\s*/, "");
          return (
            <div key={idx} className="flex items-start gap-2 pl-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
              <div className="flex-1 text-slate-200">{formatInline(content)}</div>
            </div>
          );
        }

        // Numbered list item (e.g. "1. ")
        if (/^\d+\.\s/.test(trimmed)) {
          const num = trimmed.match(/^(\d+)\.\s/)?.[1] || "•";
          const content = trimmed.replace(/^\d+\.\s*/, "");
          return (
            <div key={idx} className="flex items-start gap-2 pl-0.5">
              <span className="font-mono text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-1.5 py-0.2 rounded shrink-0">
                {num}
              </span>
              <div className="flex-1 text-slate-200">{formatInline(content)}</div>
            </div>
          );
        }

        // Normal paragraph
        return (
          <p key={idx} className="text-slate-200">
            {formatInline(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

interface IndustrySentinelInfo {
  name: string;
  badge: string;
  color: string;
  watchingText: string;
  welcomeMessage: string;
  quickPrompts: { label: string; query: string }[];
}

const INDUSTRY_SENTINEL_CONFIG: Record<string, IndustrySentinelInfo> = {
  energy: {
    name: "Renewable Energy & Power Grid",
    badge: "12.4 GW LIVE",
    color: "#10B981",
    watchingText: "Monitoring 12.4 GW Grid Load, 50.02 Hz frequency, and 8 substation transformers 24/7.",
    welcomeMessage: "Welcome to the **Renewable Energy & Grid OCC**. I am monitoring 12.4 GW of active solar PV, wind turbine telemetry, and BESS storage across 8 grid nodes.\n\nAsk me about transformer DGA, pitch bearing harmonics, or frequency stability.",
    quickPrompts: [
      { label: "⚡ Grid Frequency (50.02 Hz)", query: "Analyze current grid load and frequency stability across all 8 substations." },
      { label: "🌀 Wind Pitch Bearing Vibration", query: "Show vibration FFT harmonics on Wind Turbine 04 pitch bearing." },
      { label: "☀️ Solar Inverter PR & Hotspots", query: "What is the Performance Ratio (PR) and hotspot risk on Solar Array 02?" },
      { label: "🔋 BESS Cell Voltage & Thermal Runaway", query: "Check Battery Energy Storage BESS cell voltage balance and thermal safety." },
      { label: "⚡ How SCIO Works (4 Steps)", query: "Explain how SCIO works in 4 simple steps: Connect, Understand, Predict, Act." },
      { label: "🔌 SCADA & SAP PM Integration", query: "How does SCIO integrate with existing OPC-UA, SCADA, and SAP PM?" }
    ]
  },
  maritime: {
    name: "Maritime Fleet & Ship Operations",
    badge: "12 SHIPS ACTIVE",
    color: "#3B82F6",
    watchingText: "Watching 12 ships at sea, engine temperatures, fuel levels, and safety inspections 24/7.",
    welcomeMessage: "Welcome to **Maritime Fleet Operations**. I help you manage your ships at sea — from tracking vessel routes and engine health to fuel logs, safety inspections, and port spare parts delivery.\n\nWhat would you like to check on the fleet today?",
    quickPrompts: [
      { label: "🚢 Ship Locations & Arrival Times", query: "Where are our 12 ships right now and what are their estimated arrival times (ETA) at port?" },
      { label: "🦺 Safety Equipment & Routine Inspections", query: "What routine safety inspections are due for lifeboats, fire systems, and emergency equipment?" },
      { label: "⚙️ Ship Engine Health & Alarms", query: "Check engine temperatures, oil pressure, and vibration for ships currently sailing." },
      { label: "⛽ Fuel Levels & Daily Consumption", query: "How much fuel do our ships have left and what is our daily fuel burn rate?" },
      { label: "📦 Port Spare Parts & Repairs", query: "What spare parts need to be ordered and delivered to the next port for repairs?" },
      { label: "⚡ How SCIO Works (4 Steps)", query: "Explain how SCIO works in 4 simple steps: Connect, Understand, Predict, Act." }
    ]
  },
  manufacturing: {
    name: "Manufacturing 4.0 & Industrial OEE",
    badge: "91.4% OEE",
    color: "#F59E0B",
    watchingText: "Observing 24 robotic cells, 91.4% OEE, CNC spindle vibration, and micro-stoppages 24/7.",
    welcomeMessage: "Welcome to the **Manufacturing 4.0 OCC**. I am analyzing real-time OEE across 24 robotic cells and CNC machining centers with sub-minute micro-stoppage detection.\n\nAsk me about spindle bearing wear, Pareto downtime causes, or automated batch quarantine.",
    quickPrompts: [
      { label: "📊 Real-Time OEE Breakdown", query: "Explain how SCIO calculates real-time OEE across Availability, Performance, and Quality." },
      { label: "📉 Micro-Stoppage Pareto Analysis", query: "Show top root causes of downtime and micro-stoppages across the robotic cells." },
      { label: "🔧 CNC Spindle Bearing Wear", query: "Analyze 5-axis CNC spindle vibration spectra to detect bearing inner-race spalling." },
      { label: "📦 Automated SAP Tool Changeover", query: "How does SCIO trigger automated tool-wear changeover work orders in SAP PM?" },
      { label: "⚡ How SCIO Works (4 Steps)", query: "Explain how SCIO works in 4 simple steps: Connect, Understand, Predict, Act." },
      { label: "🔌 PLC / OPC-UA Sensor Integration", query: "How does SCIO connect to Siemens S7 and Rockwell PLCs without hardware swap?" }
    ]
  },
  logistics: {
    name: "Cold-Chain & Multimodal Logistics",
    badge: "142 REEFERS",
    color: "#06B6D4",
    watchingText: "Monitoring 142 refrigerated containers (-21.4°C), cargo IoT, and disruption risks 24/7.",
    welcomeMessage: "Welcome to the **Cold-Chain & Supply Chain OCC**. I am continuously monitoring 142 refrigerated reefers with IoT temperature telemetry and AI lead-time delay forecasting.\n\nAsk me about temperature excursion alerts, warehouse ASRS inventory, or vendor risk.",
    quickPrompts: [
      { label: "❄️ Cold-Chain Temp Excursions (-25°C to +4°C)", query: "Check live temperature telemetry across all 142 refrigerated reefers for excursion breaches." },
      { label: "🚢 Supply Disruption & Lead-Time AI", query: "Forecast vendor shipping delays and port bottlenecks for upcoming freight." },
      { label: "📦 MRO Spare Parts Bin Staging", query: "How does SCIO synchronize warehouse MRO spare parts stock with field work order demand?" },
      { label: "📋 Automated Purchase Order Release", query: "Explain automated purchase requisition workflows when safety stock drops below threshold." },
      { label: "⚡ How SCIO Works (4 Steps)", query: "Explain how SCIO works in 4 simple steps: Connect, Understand, Predict, Act." },
      { label: "🔌 Telematics & ERP Integration", query: "How does SCIO integrate with fleet GPS telematics and SAP/Oracle supply chain?" }
    ]
  }
};

interface SectorFaceTheme {
  faceBg: string;
  eyeColor: string;
  mouthStroke: string;
  pulseRingColor: string;
  radarBadgeBg: string;
  shadowColor: string;
  borderColor: string;
  name: string;
}

const SECTOR_FACE_THEMES: Record<string, SectorFaceTheme> = {
  general: {
    faceBg: "bg-white",
    eyeColor: "bg-black",
    mouthStroke: "#000000",
    pulseRingColor: "bg-slate-300/60",
    radarBadgeBg: "bg-emerald-500",
    shadowColor: "shadow-[0_8px_32px_rgba(0,0,0,0.35)] hover:shadow-[0_12px_44px_rgba(37,99,235,0.35)]",
    borderColor: "border-2 border-slate-900/10",
    name: "Enterprise White Face"
  },
  home: {
    faceBg: "bg-white",
    eyeColor: "bg-black",
    mouthStroke: "#000000",
    pulseRingColor: "bg-slate-300/60",
    radarBadgeBg: "bg-emerald-500",
    shadowColor: "shadow-[0_8px_32px_rgba(0,0,0,0.35)] hover:shadow-[0_12px_44px_rgba(37,99,235,0.35)]",
    borderColor: "border-2 border-slate-900/10",
    name: "Home White Face"
  },
  maritime: {
    faceBg: "bg-white",
    eyeColor: "bg-black",
    mouthStroke: "#000000",
    pulseRingColor: "bg-slate-300/60",
    radarBadgeBg: "bg-blue-600",
    shadowColor: "shadow-[0_8px_32px_rgba(255,255,255,0.4)] hover:shadow-[0_12px_44px_rgba(255,255,255,0.65)]",
    borderColor: "border-2 border-slate-300",
    name: "Maritime White Face"
  },
  energy: {
    faceBg: "bg-emerald-500",
    eyeColor: "bg-white",
    mouthStroke: "#FFFFFF",
    pulseRingColor: "bg-emerald-400/60",
    radarBadgeBg: "bg-emerald-600",
    shadowColor: "shadow-[0_8px_32px_rgba(16,185,129,0.55)] hover:shadow-[0_12px_44px_rgba(16,185,129,0.85)]",
    borderColor: "border-2 border-emerald-300/80",
    name: "Renewable Energy Green Face"
  },
  manufacturing: {
    faceBg: "bg-amber-400",
    eyeColor: "bg-black",
    mouthStroke: "#000000",
    pulseRingColor: "bg-amber-300/60",
    radarBadgeBg: "bg-amber-600",
    shadowColor: "shadow-[0_8px_32px_rgba(245,158,11,0.55)] hover:shadow-[0_12px_44px_rgba(245,158,11,0.85)]",
    borderColor: "border-2 border-amber-300/90",
    name: "Manufacturing Yellow Face"
  },
  logistics: {
    faceBg: "bg-sky-400",
    eyeColor: "bg-slate-950",
    mouthStroke: "#020617",
    pulseRingColor: "bg-sky-300/60",
    radarBadgeBg: "bg-sky-600",
    shadowColor: "shadow-[0_8px_32px_rgba(56,189,248,0.55)] hover:shadow-[0_12px_44px_rgba(56,189,248,0.85)]",
    borderColor: "border-2 border-sky-300/90",
    name: "Logistics Light Blue Face"
  }
};

interface ScioSentinelOrbProps {
  onOpenBetaModal?: () => void;
  onOpenDemoModal?: () => void;
  onLaunchPlatform?: (industry?: string, tab?: string) => void;
  currentIndustry?: string;
  activeTab?: string;
  isCopilotOpenTrigger?: boolean;
  onCloseCopilot?: () => void;
}

export default function ScioSentinelOrb({
  onOpenBetaModal,
  onOpenDemoModal,
  onLaunchPlatform,
  currentIndustry = "general",
  activeTab,
  isCopilotOpenTrigger,
  onCloseCopilot
}: ScioSentinelOrbProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);
  const [isWaving, setIsWaving] = useState(true);

  // Auto-dismiss waving hand after initial friendly greeting
  useEffect(() => {
    const waveTimer = setTimeout(() => {
      setIsWaving(false);
    }, 4500);
    return () => clearTimeout(waveTimer);
  }, []);
  
  // Sector Face Theme: Home/General (White), Maritime (White), Energy (Green), Manufacturing (Yellow), Logistics (Light Blue)
  const faceTheme = SECTOR_FACE_THEMES[currentIndustry] || SECTOR_FACE_THEMES.general;
  
  // Section Guide States
  const [activeSectionKey, setActiveSectionKey] = useState<string>("hero");
  const [guideExpanded, setGuideExpanded] = useState<boolean>(true);
  const [isGuideDismissed, setIsGuideDismissed] = useState<boolean>(false);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  
  const [inputQuery, setInputQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const orbRef = useRef<HTMLDivElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const activeIntel = (activeTab && DASHBOARD_TAB_INTELLIGENCE[activeTab])
    ? DASHBOARD_TAB_INTELLIGENCE[activeTab]
    : (SECTION_INTELLIGENCE[activeSectionKey] || SECTION_INTELLIGENCE.hero);
  const currentIndConfig = INDUSTRY_SENTINEL_CONFIG[currentIndustry] || INDUSTRY_SENTINEL_CONFIG.energy;

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      sender: "bot",
      text: currentIndConfig.welcomeMessage,
      timestamp: "Live",
      provider: "SCIO Sentinel Engine"
    }
  ]);

  // Sync with external trigger if navbar "Ask AI Copilot" clicked
  useEffect(() => {
    if (isCopilotOpenTrigger !== undefined) {
      setIsOpen(isCopilotOpenTrigger);
    }
  }, [isCopilotOpenTrigger]);

  // Update welcome message when industry changes
  useEffect(() => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: "bot",
        text: currentIndConfig.welcomeMessage,
        timestamp: "Live",
        provider: `${currentIndConfig.name} Sentinel`
      }
    ]);
  }, [currentIndustry]);

  // 1. Real-Time Mouse Gaze Physics
  useEffect(() => {
    let lastMouseMove = Date.now();
    let idleTimer: NodeJS.Timeout;

    const handleMouseMove = (e: MouseEvent) => {
      lastMouseMove = Date.now();
      if (!orbRef.current) return;

      const rect = orbRef.current.getBoundingClientRect();
      const orbCenterX = rect.left + rect.width / 2;
      const orbCenterY = rect.top + rect.height / 2;

      const dx = e.clientX - orbCenterX;
      const dy = e.clientY - orbCenterY;
      const angle = Math.atan2(dy, dx);
      const distance = Math.min(Math.hypot(dx, dy), 140);

      // Max eye travel in pixels
      const maxEyeTravel = 6.5;
      const eyeX = Math.cos(angle) * (distance / 140) * maxEyeTravel;
      const eyeY = Math.sin(angle) * (distance / 140) * maxEyeTravel;

      setEyeOffset({ x: eyeX, y: eyeY });
    };

    // Idle Eye Glance
    const checkIdle = () => {
      if (Date.now() - lastMouseMove > 3500) {
        const randomAngles = [0, Math.PI / 4, Math.PI / 2, Math.PI, -Math.PI / 2, -Math.PI / 4];
        const randomAngle = randomAngles[Math.floor(Math.random() * randomAngles.length)];
        setEyeOffset({
          x: Math.cos(randomAngle) * 4,
          y: Math.sin(randomAngle) * 4
        });
      }
    };

    idleTimer = setInterval(checkIdle, 3000);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      clearInterval(idleTimer);
    };
  }, []);

  // 2. Periodic Blinking
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 160);
    }, Math.floor(Math.random() * 2500) + 3500);

    return () => clearInterval(blinkInterval);
  }, []);

  // 3. Section Intelligence Scroll Tracker (Detects active section & scroll progress)
  useEffect(() => {
    const handleScroll = () => {
      const winHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight - winHeight;
      const scrollRatio = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
      setScrollProgress(Math.min(100, Math.max(0, Math.round(scrollRatio))));

      const scrollPos = window.scrollY + winHeight * 0.38;

      const sectionKeys = [
        "why-scio",
        "integrations",
        "gallery",
        "control-tower",
        "how-it-works",
        "solution",
        "problem",
        "industries",
        "top"
      ];

      for (const key of sectionKeys) {
        const el = document.getElementById(key === "hero" ? "top" : key);
        if (el) {
          const top = el.offsetTop;
          if (scrollPos >= top) {
            setActiveSectionKey(key === "top" ? "hero" : key);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial check
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Handle Send Query
  const handleSend = async (queryText?: string) => {
    const query = queryText || inputQuery;
    if (!query.trim()) return;

    if (!isOpen) {
      setIsOpen(true);
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputQuery("");
    setIsLoading(true);

    // Resolve dedicated 5-sector API endpoint
    let apiEndpoint = "/api/chatbot/homepage";
    if (currentIndustry === "energy") {
      apiEndpoint = "/api/chatbot/energy";
    } else if (currentIndustry === "maritime") {
      apiEndpoint = "/api/chatbot/maritime";
    } else if (currentIndustry === "manufacturing") {
      apiEndpoint = "/api/chatbot/manufacturing";
    } else if (currentIndustry === "logistics") {
      apiEndpoint = "/api/chatbot/logistics";
    }

    try {
      const res = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          industry: currentIndustry,
          context: {
            currentSection: activeIntel.title,
            sectionTag: activeIntel.tag,
            gridLoadMW: 2854.2,
            activeAlarms: 2,
            systemHealth: "98.4%"
          }
        })
      });

      if (res.ok) {
        const data = await res.json();
        const botMessage: ChatMessage = {
          id: `bot-${Date.now()}`,
          sender: "bot",
          text: data.text || "Operational intelligence verified. How else can I assist?",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          provider: data.provider || "SCIO Sentinel Engine",
          visualType: data.visualType || "none",
          suggestedAction: data.suggestedAction || null
        };
        setMessages((prev) => [...prev, botMessage]);
      } else {
        throw new Error("Failed to fetch response");
      }
    } catch (err) {
      const fallbackMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: `I am actively monitoring SCIO 24/7. Regarding "${query}": In ${activeIntel.title}, ${activeIntel.summary}\n\nYou can explore our 4-step intelligence loop or apply for beta access anytime!`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        provider: "SCIO Neural Engine",
        suggestedAction: { type: "open_beta", label: "Apply for Private Beta Access" }
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Action Button Handler
  const handleActionClick = (action: { type: string; label: string; payload?: any }) => {
    if (action.type === "open_beta" && onOpenBetaModal) {
      onOpenBetaModal();
    } else if (action.type === "open_demo" && onOpenDemoModal) {
      onOpenDemoModal();
    } else if (action.type === "scroll" && action.payload) {
      const el = document.querySelector(action.payload);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    } else if (action.type === "launch_occ" && onLaunchPlatform) {
      onLaunchPlatform(action.payload?.industry || "energy", action.payload?.tab || "energy-dashboard");
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[999999] select-none pointer-events-auto flex items-end justify-end">
      {/* ==================== EXPANDED CHATBOT WINDOW ==================== */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.92 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            className="w-[92vw] sm:w-[420px] h-[590px] rounded-3xl border border-white/15 bg-slate-950/95 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.65)] flex flex-col overflow-hidden text-white font-sans mb-3"
          >
            {/* Chatbot Header */}
            <div className="p-4 border-b border-white/10 bg-slate-900/80 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                {/* Miniature Watching Eye Avatar in Header (Dynamic Industry Face Color with Smile) */}
                <div className={`relative h-9 w-9 rounded-full ${faceTheme.faceBg} ${faceTheme.borderColor} flex items-center justify-center shadow-md shrink-0 transition-colors duration-300`}>
                  <div
                    className="flex flex-col items-center justify-center transition-transform duration-75"
                    style={{
                      transform: `translate(${eyeOffset.x * 0.4}px, ${eyeOffset.y * 0.4}px)`
                    }}
                  >
                    <div className="flex items-center gap-1.5">
                      <div
                        className={`w-1.5 h-2.5 ${faceTheme.eyeColor} rounded-full transition-all`}
                        style={{ transform: isBlinking ? "scaleY(0.1)" : "scaleY(1)" }}
                      />
                      <div
                        className={`w-1.5 h-2.5 ${faceTheme.eyeColor} rounded-full transition-all`}
                        style={{ transform: isBlinking ? "scaleY(0.1)" : "scaleY(1)" }}
                      />
                    </div>
                    {/* Smiling Mouth Arc */}
                    <svg className="w-3.5 h-1.5 mt-0.5" viewBox="0 0 16 8" fill="none">
                      <path
                        d="M 2 2 Q 8 7 14 2"
                        stroke={faceTheme.mouthStroke}
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        fill="none"
                      />
                    </svg>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-sm tracking-tight text-white">{currentIndConfig.name}</h3>
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span
                      className="font-mono text-[9px] uppercase font-bold px-1.5 py-0.5 rounded text-white tracking-wider"
                      style={{ backgroundColor: currentIndConfig.color }}
                    >
                      {currentIndConfig.badge}
                    </span>
                  </div>
                  <p className="text-[10.5px] font-mono text-white/50">{currentIndConfig.watchingText}</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() =>
                    setMessages([
                      {
                        id: `welcome-${Date.now()}`,
                        sender: "bot",
                        text: currentIndConfig.welcomeMessage,
                        timestamp: "Just now",
                        provider: `${currentIndConfig.name} Sentinel`
                      }
                    ])
                  }
                  title="Reset Chat"
                  className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors text-xs cursor-pointer"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    if (onCloseCopilot) onCloseCopilot();
                  }}
                  title="Minimize"
                  className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Industry Specific Quick Chips Bar */}
            <div className="px-3 py-2 border-b border-white/[0.07] bg-black/40 overflow-x-auto flex gap-1.5 scrollbar-none shrink-0">
              {currentIndConfig.quickPrompts.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(chip.query)}
                  className="whitespace-nowrap px-2.5 py-1 rounded-full text-[11px] font-medium bg-white/[0.06] hover:bg-white/15 text-white/85 hover:text-white border border-white/10 transition-all shrink-0 cursor-pointer flex items-center gap-1"
                >
                  <Sparkles className="h-3 w-3 text-cyan-400" />
                  <span>{chip.label}</span>
                </button>
              ))}
            </div>

            {/* Messages Thread */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
              {messages.map((msg) => {
                const isBot = msg.sender === "bot";
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex flex-col ${isBot ? "items-start" : "items-end"}`}
                  >
                    <div
                      className={`max-w-[88%] p-3.5 rounded-2xl leading-relaxed ${
                        isBot
                          ? "bg-slate-900 border border-white/10 text-slate-100 shadow-sm rounded-tl-sm"
                          : "bg-blue-600 text-white font-medium shadow-md rounded-tr-sm"
                      }`}
                    >
                      <ChatMessageFormatted text={msg.text} isBot={isBot} />

                      {/* Visual Component Render if requested */}
                      {isBot && msg.visualType === "trend" && (
                        <div className="mt-3 p-3 rounded-xl bg-black/60 border border-white/10">
                          <span className="font-mono text-[10px] text-amber-400 font-bold block mb-1">
                            ● 24-HR THERMAL EXCURSION (°C)
                          </span>
                          <div className="h-24 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={[
                                { t: "00:00", val: 52 }, { t: "04:00", val: 50 }, { t: "08:00", val: 68 },
                                { t: "12:00", val: 88 }, { t: "16:00", val: 79 }, { t: "20:00", val: 61 }
                              ]}>
                                <Area type="monotone" dataKey="val" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.2} strokeWidth={2} />
                                <XAxis dataKey="t" stroke="#64748B" fontSize={9} tickLine={false} />
                                <YAxis stroke="#64748B" fontSize={9} domain={[40, 100]} hide />
                                <Tooltip contentStyle={{ background: "#0F172A", border: "1px solid rgba(255,255,255,0.2)", fontSize: "11px" }} />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      )}

                      {/* Suggested Action CTA */}
                      {isBot && msg.suggestedAction && (
                        <div className="mt-3 pt-2 border-t border-white/10">
                          <button
                            onClick={() => handleActionClick(msg.suggestedAction!)}
                            className="w-full py-2 px-3 rounded-xl bg-white text-slate-950 hover:bg-slate-100 font-mono font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-md transition-transform hover:scale-[1.01] cursor-pointer"
                          >
                            <span>{msg.suggestedAction.label}</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-1 px-1 text-[9.5px] font-mono text-white/40">
                      <span>{msg.timestamp}</span>
                      {isBot && msg.provider && (
                        <span className="flex items-center gap-1">
                          &bull; <span>{msg.provider}</span>
                          {(msg.provider.includes("Cached") || msg.provider.includes("Indexed")) && (
                            <span className="ml-1 px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30 text-[8.5px] inline-flex items-center gap-0.5">
                              <Zap className="h-2.5 w-2.5 text-cyan-400" />
                              Indexed Cache Hit
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })}

              {isLoading && (
                <div className="flex items-center gap-2 p-3 bg-slate-900 border border-white/10 rounded-2xl rounded-tl-sm w-36">
                  <div className="flex space-x-1.5">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                  <span className="font-mono text-[10px] text-white/50">Analyzing...</span>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Chat Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="p-3 border-t border-white/10 bg-slate-900/90 flex items-center gap-2 shrink-0"
            >
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="Ask about this section, telemetry, 4 steps, beta..."
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white placeholder-white/40 text-xs focus:outline-none focus:border-blue-500 transition-colors font-sans"
              />
              <button
                type="submit"
                disabled={isLoading || !inputQuery.trim()}
                className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold transition-all shadow-md shrink-0 cursor-pointer"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================== THE FLOATING 24/7 EYE / ORB + SECTION INTELLIGENCE GUIDE ==================== */}
      <div className="relative flex items-end justify-end">
        {/* Dynamic Section Intelligence Card (Updates Real-time On Scroll) */}
        <AnimatePresence>
          {!isOpen && !isGuideDismissed && (
            <motion.div
              initial={{ opacity: 0, x: 25, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 25, scale: 0.95 }}
              className="absolute right-20 bottom-0 w-[300px] sm:w-[330px] rounded-2xl bg-slate-950/95 backdrop-blur-xl text-white border border-white/20 shadow-[0_16px_50px_rgba(0,0,0,0.55)] font-sans select-none overflow-hidden"
            >
              {/* Header Bar with Step #, Section Tag, Collapse Toggle & X Close Button */}
              <div className="px-3.5 py-2.5 border-b border-white/10 bg-white/[0.04] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="font-mono text-[10px] font-black px-2 py-0.5 rounded-full text-white shadow-xs"
                    style={{ backgroundColor: activeIntel.color }}
                  >
                    SECTION {activeIntel.stepNum}
                  </span>
                  <span className="font-mono text-[10px] font-bold text-white/60 tracking-wider">
                    {activeIntel.tag}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-[9.5px] text-emerald-400 font-bold flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    LIVE GUIDE
                  </span>
                  <button
                    onClick={() => setGuideExpanded(!guideExpanded)}
                    className="text-white/50 hover:text-white hover:bg-white/10 rounded p-1 transition-colors cursor-pointer"
                    title={guideExpanded ? "Collapse Guide" : "Expand Guide"}
                  >
                    {guideExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsGuideDismissed(true);
                    }}
                    className="text-white/40 hover:text-white hover:bg-white/10 rounded p-1 transition-colors cursor-pointer"
                    title="Hide Section Guide"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Expandable Section Body */}
              <AnimatePresence>
                {guideExpanded ? (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="p-3.5 space-y-2.5"
                  >
                    {/* Section Title */}
                    <div>
                      <h4 className="text-xs font-black text-white tracking-tight flex items-center gap-1.5">
                        <span>{activeIntel.title}</span>
                      </h4>
                      <p className="text-[11.5px] text-slate-300 leading-snug mt-1 font-medium">
                        {activeIntel.summary}
                      </p>
                    </div>

                    {/* Key Highlights Badges */}
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {activeIntel.keyPoints.map((pt, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md text-[9.5px] font-mono font-bold bg-white/[0.07] border border-white/10 text-slate-200"
                        >
                          {pt}
                        </span>
                      ))}
                    </div>

                    {/* Quick Ask AI Button */}
                    <div className="pt-1">
                      <button
                        onClick={() => handleSend(activeIntel.suggestedPrompt)}
                        className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-mono font-bold text-[10.5px] flex items-center justify-between shadow-md transition-all hover:scale-[1.01] cursor-pointer"
                      >
                        <span className="flex items-center gap-1.5 truncate">
                          <Sparkles className="h-3.5 w-3.5 shrink-0 text-cyan-300" />
                          <span className="truncate">Ask AI about this section</span>
                        </span>
                        <ArrowRight className="h-3.5 w-3.5 shrink-0 ml-1 opacity-80" />
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <div
                    onClick={() => setGuideExpanded(true)}
                    className="px-3.5 py-2 text-[11px] font-semibold text-slate-300 hover:text-white cursor-pointer flex items-center justify-between bg-black/30"
                  >
                    <span className="truncate">{activeIntel.title}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[9.5px] font-mono text-blue-400 font-bold">Tap to expand</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsGuideDismissed(true);
                        }}
                        className="text-white/40 hover:text-white hover:bg-white/10 rounded p-0.5"
                        title="Hide Section Guide"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </AnimatePresence>

              {/* Scroll Progress Bar at Bottom of Card */}
              <div className="h-1 w-full bg-white/10">
                <motion.div
                  className="h-full"
                  style={{
                    width: `${scrollProgress}%`,
                    backgroundColor: activeIntel.color
                  }}
                />
              </div>

              {/* Triangle Tail pointing to the Orb */}
              <div className="absolute -right-2 bottom-5 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[8px] border-l-slate-950" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Animated First-Boot Waving Hand & "Hi!" Greeting */}
        <AnimatePresence>
          {isWaving && (
            <motion.div
              initial={{ scale: 0, opacity: 0, y: 12, x: 0 }}
              animate={{ scale: 1, opacity: 1, y: 0, x: 0 }}
              exit={{ scale: 0, opacity: 0, y: -8, transition: { duration: 0.35, ease: "easeInOut" } }}
              className="absolute -top-12 right-0 z-30 flex items-center gap-1.5 pointer-events-none"
            >
              {/* Cute Waving Hand Emoji / SVG with Realistic Back-and-Forth Oscillation */}
              <motion.div
                animate={{
                  rotate: [0, 26, -18, 26, -18, 16, -10, 0],
                  y: [0, -4, 0, -4, 0]
                }}
                transition={{
                  duration: 2.2,
                  repeat: 1,
                  ease: "easeInOut"
                }}
                className="text-2xl sm:text-3xl origin-bottom-right drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] select-none"
              >
                👋
              </motion.div>

              {/* Floating "Hi!" Speech Bubble */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 }}
                className="px-2.5 py-1 rounded-full bg-slate-950/95 border border-white/20 text-white font-mono text-[10px] font-extrabold shadow-xl flex items-center gap-1.5 backdrop-blur-md whitespace-nowrap"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span>Hi! I&apos;m SCIO AI</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic Sector Eye Orb Entity (Maritime=White, Energy=Green, Manufacturing=Yellow, Logistics=Light Blue) */}
        <motion.div
          ref={orbRef}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => setIsOpen(!isOpen)}
          className={`relative h-14 w-14 sm:h-16 sm:w-16 rounded-full ${faceTheme.faceBg} ${faceTheme.borderColor} cursor-pointer ${faceTheme.shadowColor} flex items-center justify-center transition-all duration-300 group select-none shrink-0`}
        >
          {/* Subtle Ambient Pulse Ring */}
          <span className={`absolute -inset-1 rounded-full ${faceTheme.pulseRingColor} animate-ping opacity-60 pointer-events-none`} />

          {/* Real-time Gaze Eyes & Cute Smile (Matching Sector Theme) */}
          <div
            className="flex flex-col items-center justify-center transition-transform duration-75 ease-out"
            style={{
              transform: `translate(${eyeOffset.x}px, ${eyeOffset.y}px)`
            }}
          >
            {/* Left & Right Eyes */}
            <div className="flex items-center gap-2">
              <div
                className={`w-2 sm:w-2.5 h-3.5 sm:h-4 ${faceTheme.eyeColor} rounded-full transition-transform duration-100 shadow-xs`}
                style={{
                  transform: isBlinking ? "scaleY(0.1)" : "scaleY(1)"
                }}
              />
              <div
                className={`w-2 sm:w-2.5 h-3.5 sm:h-4 ${faceTheme.eyeColor} rounded-full transition-transform duration-100 shadow-xs`}
                style={{
                  transform: isBlinking ? "scaleY(0.1)" : "scaleY(1)"
                }}
              />
            </div>

            {/* Cute Smiling Mouth Arc */}
            <svg
              className="w-4 h-2 sm:w-5 sm:h-2.5 mt-1 overflow-visible"
              viewBox="0 0 20 10"
              fill="none"
            >
              <path
                d="M 2 2 Q 10 9 18 2"
                stroke={faceTheme.mouthStroke}
                strokeWidth="2.4"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </div>

          {/* 24/7 Status Radar Badge */}
          <div className={`absolute -top-1 -right-1 h-4 w-4 rounded-full ${faceTheme.radarBadgeBg} border-2 border-white shadow-xs flex items-center justify-center transition-colors duration-300`}>
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
