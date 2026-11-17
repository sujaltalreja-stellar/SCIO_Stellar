"use client";

import React, { useState, useEffect, useRef } from "react";
import SiteChatWindow from "./SiteChatWindow";
import { motion, AnimatePresence } from "framer-motion";
import { generateResponse } from "../../lib/ai/chatbotEngine";
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
  Eye,
  Check,
  Copy
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
  followUps?: string[];
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
    tag: "Overview",
    title: "The AI business operating system",
    color: "#D98B16",
    colorBg: "rgba(242, 169, 59, 0.15)",
    summary: "SCIO connects your ERP, POS, warehouse, HR and finance tools, surfaces issues early and turns insights into approved actions.",
    keyPoints: ["ERP + POS + WMS", "Plain-language answers", "Approved actions"],
    suggestedPrompt: "Give me a 1-minute summary of what Stellar SCIO does for a business."
  },
  "command-center-tour": {
    id: "command-center-tour",
    stepNum: "02",
    tag: "Command Center",
    title: "Your whole business on one screen",
    color: "#D98B16",
    colorBg: "rgba(242, 169, 59, 0.15)",
    summary: "Live sales vs target, one health score, stockout risk, supplier delays and every connected system, in a single view.",
    keyPoints: ["Live sales", "Health score", "Stockout risk"],
    suggestedPrompt: "What does the SCIO Command Center show, and how would my team use it every day?"
  },
  product: {
    id: "product",
    stepNum: "03",
    tag: "The product",
    title: "See SCIO at work",
    color: "#D98B16",
    colorBg: "rgba(242, 169, 59, 0.15)",
    summary: "Real screens from SCIO: ask a question and get the reasons and the fix, see intelligence your ERP can't show, and act from one place.",
    keyPoints: ["Ask SCIO", "Intelligence", "Priority actions"],
    suggestedPrompt: "Walk me through asking SCIO a question, from the answer to approving the action."
  },
  outcomes: {
    id: "outcomes",
    stepNum: "04",
    tag: "Outcomes",
    title: "Skip the dashboards. Just ask.",
    color: "#D98B16",
    colorBg: "rgba(242, 169, 59, 0.15)",
    summary: "Ask instead of digging through reports, hear about problems first, and act without switching between tools.",
    keyPoints: ["Ask, don't dig", "Early warnings", "Act in one place"],
    suggestedPrompt: "What kinds of questions can my team ask SCIO?"
  },
  "use-cases": {
    id: "use-cases",
    stepNum: "05",
    tag: "Use cases",
    title: "Where businesses start",
    color: "#D98B16",
    colorBg: "rgba(242, 169, 59, 0.15)",
    summary: "Inventory and replenishment, store and sales performance, purchasing and suppliers, invoice matching and approvals.",
    keyPoints: ["Inventory", "Purchasing", "Finance"],
    suggestedPrompt: "How does SCIO help with inventory, replenishment and purchasing?"
  },
  "how-it-works": {
    id: "how-it-works",
    stepNum: "06",
    tag: "How it works",
    title: "Connect. Understand. Ask. Act.",
    color: "#D98B16",
    colorBg: "rgba(242, 169, 59, 0.15)",
    summary: "Connect the systems you already run, link them into one picture, ask in plain language and act with approvals.",
    keyPoints: ["1. Connect", "2. Understand", "3. Ask", "4. Act"],
    suggestedPrompt: "Explain how SCIO works in 4 simple steps: Connect, Understand, Ask, Act."
  },
  capabilities: {
    id: "capabilities",
    stepNum: "07",
    tag: "Capabilities",
    title: "Everything in one place",
    color: "#D98B16",
    colorBg: "rgba(242, 169, 59, 0.15)",
    summary: "Ask anything, live views, alerts, forecasts, document AI, workflows and approvals, a full audit trail and role-based access.",
    keyPoints: ["Alerts", "Forecasts", "Document AI"],
    suggestedPrompt: "What are SCIO's main capabilities?"
  },
  governance: {
    id: "governance",
    stepNum: "08",
    tag: "Security",
    title: "Your data, your approvals",
    color: "#D98B16",
    colorBg: "rgba(242, 169, 59, 0.15)",
    summary: "Runs on-premises, in your private cloud or hybrid. AI recommends, people approve, and every action is logged.",
    keyPoints: ["On-prem or private cloud", "Human approval", "Audit trail"],
    suggestedPrompt: "How does SCIO keep our data secure, and can it run on our own infrastructure?"
  },
  faq: {
    id: "faq",
    stepNum: "09",
    tag: "FAQ",
    title: "Questions businesses ask",
    color: "#D98B16",
    colorBg: "rgba(242, 169, 59, 0.15)",
    summary: "Integration with your ERP, deployment options, data ownership, AI governance and how to get started.",
    keyPoints: ["ERP integration", "Data ownership", "Getting started"],
    suggestedPrompt: "How do we get started with SCIO and what does a pilot look like?"
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

function ChatMessageFormatted({ text, isBot, isLatest }: { text: string; isBot: boolean; isLatest?: boolean }) {
  const [displayedText, setDisplayedText] = useState(isBot && isLatest ? "" : text);
  const [isTyping, setIsTyping] = useState(isBot && isLatest);

  useEffect(() => {
    if (!isBot || !isLatest) {
      setDisplayedText(text);
      setIsTyping(false);
      return;
    }

    let i = 0;
    const speed = Math.max(6, Math.min(20, Math.floor(1000 / (text.length || 1))));
    setDisplayedText("");
    setIsTyping(true);

    const timer = setInterval(() => {
      i += 3;
      if (i >= text.length) {
        setDisplayedText(text);
        setIsTyping(false);
        clearInterval(timer);
      } else {
        setDisplayedText(text.slice(0, i));
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, isBot, isLatest]);

  const textToRender = displayedText;

  if (!isBot) {
    return <span className="whitespace-pre-wrap">{textToRender}</span>;
  }

  // Clean out artificial meta headers or '---' lines if present
  const cleaned = textToRender
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
      {isTyping && (
        <span className="inline-block w-1.5 h-3 bg-cyan-400 ml-1 animate-pulse" />
      )}
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
  home: {
    name: "Stellar SCIO AI Assistant",
    badge: "ENTERPRISE OS",
    color: "#3B82F6",
    watchingText: "Here to answer questions about SCIO, any time.",
    welcomeMessage: "Welcome to **Stellar SCIO**, the AI business operating system. SCIO connects your ERP, POS, warehouse, HR and finance tools into one place you can ask questions of and act from.\n\nAsk me how it works, what it connects to, how it keeps your data secure, or how to get started.",
    quickPrompts: [
      { label: "🚀 What is Stellar SCIO?", query: "What is Stellar SCIO and what problem does it solve for a business?" },
      { label: "⚡ How SCIO works", query: "Explain how SCIO works in 4 simple steps: Connect, Understand, Ask, Act." },
      { label: "🔌 Systems it connects to", query: "Which systems can SCIO connect to, such as ERP, POS, WMS, HRMS and CRM?" },
      { label: "📦 Inventory & purchasing", query: "How does SCIO help with inventory, replenishment and purchasing?" },
      { label: "🔒 Security & data", query: "How does SCIO keep our data secure, and can it run on our own infrastructure?" },
      { label: "🧭 Getting started", query: "How do we get started with SCIO and what does a pilot look like?" }
    ]
  },
  general: {
    name: "Stellar SCIO AI Assistant",
    badge: "ENTERPRISE OS",
    color: "#3B82F6",
    watchingText: "Here to answer questions about SCIO, any time.",
    welcomeMessage: "Welcome to **Stellar SCIO**, the AI business operating system. SCIO connects your ERP, POS, warehouse, HR and finance tools into one place you can ask questions of and act from.\n\nAsk me how it works, what it connects to, how it keeps your data secure, or how to get started.",
    quickPrompts: [
      { label: "🚀 What is Stellar SCIO?", query: "What is Stellar SCIO and what problem does it solve for a business?" },
      { label: "⚡ How SCIO works", query: "Explain how SCIO works in 4 simple steps: Connect, Understand, Ask, Act." },
      { label: "🔌 Systems it connects to", query: "Which systems can SCIO connect to, such as ERP, POS, WMS, HRMS and CRM?" },
      { label: "📦 Inventory & purchasing", query: "How does SCIO help with inventory, replenishment and purchasing?" },
      { label: "🔒 Security & data", query: "How does SCIO keep our data secure, and can it run on our own infrastructure?" },
      { label: "🧭 Getting started", query: "How do we get started with SCIO and what does a pilot look like?" }
    ]
  },
  energy: {
    name: "Renewable Energy & Power Grid",
    badge: "12.4 GW LIVE",
    color: "#10B981",
    watchingText: "Monitoring power generation, wind/solar health, and grid performance 24/7.",
    welcomeMessage: "Welcome to **Renewable Energy & Grid Operations**. I monitor live power generation, wind/solar performance, and battery storage across grid nodes.\n\nWhat would you like to check on your energy operations today?",
    quickPrompts: [
      { label: "⚡ Power Generation & Load", query: "Analyze current grid load and power output across substations." },
      { label: "🌀 Wind Turbine Health", query: "Check wind turbine gearbox health and vibration monitoring." },
      { label: "☀️ Solar Farm Output", query: "What is the performance ratio and panel temperature on our solar farms?" },
      { label: "🔋 Battery Storage Status", query: "Check Battery Energy Storage (BESS) cell voltage balance and health." },
      { label: "⚡ How SCIO Works (4 Steps)", query: "Explain how SCIO works in 4 simple steps: Connect, Understand, Predict, Act." },
      { label: "🔌 Systems & ERP Integration", query: "How does SCIO integrate with existing OPC-UA, SCADA, and SAP PM?" }
    ]
  },
  maritime: {
    name: "Maritime Fleet & Ship Operations",
    badge: "12 SHIPS ACTIVE",
    color: "#3B82F6",
    watchingText: "Monitoring vessel locations, engine health, fuel levels, and safety checklists 24/7.",
    welcomeMessage: "Welcome to **Maritime Fleet Operations**. I help you manage your ships at sea — from tracking vessel routes and engine health to fuel logs, safety inspections, and port spare parts delivery.\n\nWhat would you like to check on the fleet today?",
    quickPrompts: [
      { label: "🚢 Ship Locations & Port ETAs", query: "Where are our 12 ships right now and what are their estimated arrival times at port?" },
      { label: "🦺 Safety Inspection Checklist", query: "What routine safety inspections are due for lifeboats, fire systems, and emergency equipment?" },
      { label: "⚙️ Ship Engine Status", query: "Check engine temperatures, oil pressure, and vibration for active vessels." },
      { label: "⛽ Fuel Levels & Consumption", query: "How much fuel do our ships have left and what is our daily fuel burn rate?" },
      { label: "📦 Spare Parts & Port Delivery", query: "What spare parts need to be ordered and delivered to the next port for repairs?" },
      { label: "⚡ How SCIO Works (4 Steps)", query: "Explain how SCIO works in 4 simple steps: Connect, Understand, Predict, Act." }
    ]
  },
  manufacturing: {
    name: "Manufacturing 4.0 & Industrial OEE",
    badge: "91.4% OEE",
    color: "#F59E0B",
    watchingText: "Monitoring 24 robotic cells, factory OEE, machine health, and product quality 24/7.",
    welcomeMessage: "Welcome to **Manufacturing 4.0 & Factory OEE**. I track real-time OEE across robotic cells and CNC machining centers, detecting downtime causes and equipment wear.\n\nHow can I assist with your factory operations today?",
    quickPrompts: [
      { label: "📊 Factory OEE & Line Uptime", query: "Explain how SCIO calculates real-time OEE across Availability, Performance, and Quality." },
      { label: "📉 Downtime Root Causes", query: "Show top root causes of downtime and micro-stoppages across the robotic cells." },
      { label: "🔧 Machine Health & Tool Wear", query: "Analyze machine spindle vibration and tool wear to prevent breakdown." },
      { label: "📦 Work Orders in SAP", query: "How does SCIO trigger automated tool-wear changeover work orders in SAP PM?" },
      { label: "⚡ How SCIO Works (4 Steps)", query: "Explain how SCIO works in 4 simple steps: Connect, Understand, Predict, Act." },
      { label: "🔌 Sensor & PLC Connection", query: "How does SCIO connect to Siemens S7 and Rockwell PLCs without hardware swap?" }
    ]
  },
  logistics: {
    name: "Cold-Chain & Multimodal Logistics",
    badge: "142 REEFERS",
    color: "#06B6D4",
    watchingText: "Monitoring refrigerated container temperatures, shipping routes, and warehouse stock 24/7.",
    welcomeMessage: "Welcome to **Cold-Chain & Supply Chain Logistics**. I monitor refrigerated container temperatures, shipping delays, and warehouse spare parts inventory.\n\nHow can I assist your logistics operations today?",
    quickPrompts: [
      { label: "❄️ Container Temperature Control", query: "Check live temperature telemetry across all refrigerated reefers for excursion breaches." },
      { label: "🚢 Shipment Delay Forecasts", query: "Forecast vendor shipping delays and port bottlenecks for upcoming freight." },
      { label: "📦 Warehouse Spare Parts Stock", query: "How does SCIO synchronize warehouse spare parts stock with field repair work orders?" },
      { label: "📋 Automated Purchase Orders", query: "Explain automated purchase requisition workflows when safety stock drops below threshold." },
      { label: "⚡ How SCIO Works (4 Steps)", query: "Explain how SCIO works in 4 simple steps: Connect, Understand, Predict, Act." },
      { label: "🔌 Tracking & ERP Integration", query: "How does SCIO integrate with fleet GPS telematics and SAP/Oracle supply chain?" }
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
    faceBg: "bg-[#111113]",
    eyeColor: "bg-[#F2A93B] shadow-[0_0_10px_rgba(242,169,59,0.9)]",
    mouthStroke: "#F2A93B",
    pulseRingColor: "bg-[#F2A93B]/25",
    radarBadgeBg: "bg-emerald-500",
    shadowColor: "shadow-[0_12px_32px_-8px_rgba(17,17,19,0.55)] hover:shadow-[0_16px_40px_-8px_rgba(217,139,22,0.55)]",
    borderColor: "border border-white/10",
    name: "SCIO Site Face"
  },
  home: {
    faceBg: "bg-[#111113]",
    eyeColor: "bg-[#F2A93B] shadow-[0_0_10px_rgba(242,169,59,0.9)]",
    mouthStroke: "#F2A93B",
    pulseRingColor: "bg-[#F2A93B]/25",
    radarBadgeBg: "bg-emerald-500",
    shadowColor: "shadow-[0_12px_32px_-8px_rgba(17,17,19,0.55)] hover:shadow-[0_16px_40px_-8px_rgba(217,139,22,0.55)]",
    borderColor: "border border-white/10",
    name: "SCIO Site Face"
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
  currentIndustry = "home",
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
  const faceTheme = SECTOR_FACE_THEMES[currentIndustry] || SECTOR_FACE_THEMES.home || SECTOR_FACE_THEMES.general;
  const isSiteFace = !["energy", "maritime", "manufacturing", "logistics"].includes(currentIndustry);
  const faceShape = isSiteFace ? "rounded-[20px]" : "rounded-full";
  const historyKey = isSiteFace ? "site-v2" : currentIndustry;
  
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
  const currentIndConfig = INDUSTRY_SENTINEL_CONFIG[currentIndustry] || INDUSTRY_SENTINEL_CONFIG.home || INDUSTRY_SENTINEL_CONFIG.general;

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

  // Load recorded chat history from Convex Database (with LocalStorage fallback)
  useEffect(() => {
    let isCancelled = false;

    const indConfig = INDUSTRY_SENTINEL_CONFIG[currentIndustry] || INDUSTRY_SENTINEL_CONFIG.home || INDUSTRY_SENTINEL_CONFIG.general;
    const defaultWelcome: ChatMessage = {
      id: `welcome-${currentIndustry}`,
      sender: "bot",
      text: indConfig.welcomeMessage,
      timestamp: "Live",
      provider: `${indConfig.name} Assistant`
    };

    // Reset messages immediately when industry changes to show the correct welcome message
    setMessages([defaultWelcome]);

    async function loadHistory() {
      let loaded: ChatMessage[] = [];

      try {
        if (isSiteFace) throw new Error("site chat keeps history in this browser only");
        const res = await fetch(`/api/chatbot/history?industry=${currentIndustry}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.messages) && data.messages.length > 0) {
            loaded = data.messages;
          }
        }
      } catch (err) {
        console.warn("Failed to fetch Convex chat history", err);
      }

      // LocalStorage fallback if offline or no Convex records
      if (loaded.length === 0) {
        try {
          const storageKey = `scio_chat_history_${historyKey}`;
          const saved = localStorage.getItem(storageKey);
          if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
              loaded = parsed;
            }
          }
        } catch (e) {
          console.warn("Failed to load local chat history", e);
        }
      }

      if (!isCancelled) {
        if (loaded.length > 0) {
          // Normalize first welcome message to always match current industry's config
          const normalized = loaded.map((msg, idx) => {
            if (idx === 0 && (msg.id.startsWith("welcome") || msg.sender === "bot")) {
              return {
                ...msg,
                text: indConfig.welcomeMessage,
                provider: `${indConfig.name} Assistant`
              };
            }
            return msg;
          });
          setMessages(normalized);
        } else {
          setMessages([defaultWelcome]);
        }
      }
    }

    loadHistory();

    return () => {
      isCancelled = true;
    };
  }, [currentIndustry]);

  // Save messages to LocalStorage safely (only when messages match currentIndustry)
  useEffect(() => {
    if (messages.length > 0) {
      const indConfig = INDUSTRY_SENTINEL_CONFIG[currentIndustry] || INDUSTRY_SENTINEL_CONFIG.home || INDUSTRY_SENTINEL_CONFIG.general;
      const firstMsg = messages[0];
      // Prevent saving if first message is a welcome message from another industry
      if (firstMsg && firstMsg.id.startsWith("welcome") && firstMsg.text !== indConfig.welcomeMessage) {
        return;
      }
      try {
        const storageKey = `scio_chat_history_${historyKey}`;
        localStorage.setItem(storageKey, JSON.stringify(messages));
      } catch (e) {
        console.warn("Failed to save chat history", e);
      }
    }
  }, [messages, currentIndustry, historyKey]);

  // Clear chat function
  const handleClearChat = async () => {
    try {
      const storageKey = `scio_chat_history_${historyKey}`;
      localStorage.removeItem(storageKey);
      if (!isSiteFace) await fetch(`/api/chatbot/history?industry=${currentIndustry}`, { method: "DELETE" });
    } catch (e) {
      console.warn("Failed to clear Convex history", e);
    }
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: "bot",
        text: currentIndConfig.welcomeMessage,
        timestamp: "Live",
        provider: `${currentIndConfig.name} Assistant`
      }
    ]);
  };

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
        "faq",
        "governance",
        "capabilities",
        "how-it-works",
        "use-cases",
        "outcomes",
        "product",
        "command-center-tour",
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

    if (isSiteFace) {
      const history = messages
        .filter((m) => !m.id.startsWith("welcome"))
        .slice(-6)
        .map((m) => ({ role: m.sender === "user" ? "user" : "assistant", content: m.text }));
      try {
        const res = await fetch("/api/site-assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query, history, section: activeIntel.title }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error || "Request failed");
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: "bot",
            text: data.text,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            provider: data.provider || "SCIO Assistant",
            suggestedAction: data.suggestedAction || null,
            followUps: Array.isArray(data.followUps) ? data.followUps : [],
          },
        ]);
      } catch (err) {
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: "bot",
            text: err instanceof Error && /too many/i.test(err.message)
              ? err.message
              : "Sorry, I couldn't answer that just now. Please try again, or book a demo and our team will help.",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            provider: "SCIO Assistant",
            suggestedAction: { type: "open_demo", label: "Book a demo" },
          },
        ]);
      } finally {
        setIsLoading(false);
      }
      return;
    }

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
      try {
        const dynamicResult = (await generateResponse(currentIndustry, query)) as { text?: string; provider?: string; suggestedAction?: any };
        const dynamicBotMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          sender: "bot",
          text: dynamicResult.text || "Operational intelligence verified across connected digital twins.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          provider: dynamicResult.provider || "SCIO Vector Engine",
          suggestedAction: dynamicResult.suggestedAction || null
        };
        setMessages((prev) => [...prev, dynamicBotMsg]);
      } catch (innerErr) {
        const fallbackMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          sender: "bot",
          text: `Operational intelligence analysis for "${query}": Active SCADA telemetry indicates nominal operating bounds across ${activeIntel.title}.`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          provider: "SCIO Vector Engine",
          suggestedAction: { type: "open_beta", label: "Apply for Private Beta Access" }
        };
        setMessages((prev) => [...prev, fallbackMsg]);
      }
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
      } else {
        // The marketing site is split into subpages; open the page that holds this section.
        const SECTION_ROUTES: Record<string, string> = {
          "#why-scio": "/why-scio",
          "#use-cases": "/use-cases",
          "#governance": "/platform#governance",
          "#how-it-works": "/platform#how-it-works",
          "#capabilities": "/platform#capabilities",
          "#integrations": "/platform/integrations",
          "#enterprise-questions": "/faq",
        };
        const route = SECTION_ROUTES[action.payload];
        if (route) window.location.href = route;
      }
    } else if (action.type === "launch_occ" && onLaunchPlatform) {
      onLaunchPlatform(action.payload?.industry || "energy", action.payload?.tab || "energy-dashboard");
    }
  };

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyText = (id: string, text: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (e) {
      console.warn("Failed to copy text", e);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[999999] pointer-events-auto flex items-end justify-end select-text">
      {/* ==================== EXPANDED CHATBOT WINDOW ==================== */}
      <AnimatePresence>
        {isOpen && isSiteFace && (
          <SiteChatWindow
            key="site-chat"
            messages={messages}
            isLoading={isLoading}
            input={inputQuery}
            setInput={setInputQuery}
            onSend={(q) => handleSend(q)}
            onClear={handleClearChat}
            onClose={() => {
              setIsOpen(false);
              if (onCloseCopilot) onCloseCopilot();
            }}
            onAction={(a) => handleActionClick(a as { type: string; label: string; payload?: any })}
            quickPrompts={currentIndConfig.quickPrompts}
            eyeOffset={eyeOffset}
            blinking={isBlinking}
          />
        )}
        {isOpen && !isSiteFace && (
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
                <div className={`relative h-9 w-9 ${isSiteFace ? "rounded-xl" : "rounded-full"} ${faceTheme.faceBg} ${faceTheme.borderColor} flex items-center justify-center shadow-md shrink-0 transition-colors duration-300`}>
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
                  onClick={handleClearChat}
                  title="Clear Chat History"
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
              {messages.map((msg, idx) => {
                const isBot = msg.sender === "bot";
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex flex-col ${isBot ? "items-start" : "items-end"}`}
                  >
                    <div
                      className={`max-w-[88%] p-3.5 rounded-2xl leading-relaxed relative select-text cursor-text ${
                        isBot
                          ? "bg-slate-900 border border-white/10 text-slate-100 shadow-sm rounded-tl-sm"
                          : "bg-blue-600 text-white font-medium shadow-md rounded-tr-sm"
                      }`}
                    >
                      {/* Copy Action Button */}
                      {isBot && (
                        <button
                          onClick={() => handleCopyText(msg.id, msg.text)}
                          title="Copy Message Text"
                          className="absolute top-2 right-2 p-1 rounded-md bg-white/5 hover:bg-white/15 text-white/50 hover:text-white transition-all text-[10px] font-mono flex items-center gap-1 cursor-pointer"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="h-3 w-3 text-emerald-400" />
                              <span className="text-emerald-400 text-[9px]">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              <span className="text-[9px]">Copy</span>
                            </>
                          )}
                        </button>
                      )}

                      <ChatMessageFormatted text={msg.text} isBot={isBot} isLatest={idx === messages.length - 1} />

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

                    <div className="flex items-center justify-between w-full mt-1 px-1 text-[9.5px] font-mono text-white/40">
                      <div className="flex items-center gap-1.5">
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
                      {isBot && (
                        <button
                          onClick={() => handleCopyText(msg.id, msg.text)}
                          title="Copy message text"
                          className="p-1 rounded text-white/40 hover:text-white hover:bg-white/10 transition-colors inline-flex items-center gap-1 text-[10px] font-mono cursor-pointer"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="h-3 w-3 text-emerald-400" />
                              <span className="text-emerald-400 font-bold">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
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
        {/* Section guide card (updates as the visitor scrolls) */}
        <AnimatePresence>
          {!isOpen && !isGuideDismissed && (
            <motion.div
              initial={{ opacity: 0, x: 20, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.96 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="hidden sm:block absolute right-[5.25rem] bottom-0 w-[320px] rounded-2xl bg-white text-[#111113] border border-[#E7E5E1] shadow-[0_24px_60px_-20px_rgba(17,17,19,0.35)] font-sans select-none overflow-hidden"
            >
              <div className="px-4 pt-3.5 pb-2 flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="inline-flex items-center rounded-full bg-[#FFF4E2] px-2.5 py-1 text-[11px] font-semibold text-[#B06D0F] whitespace-nowrap">
                    {activeIntel.stepNum} · {activeIntel.tag}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#6b6862]">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live guide
                  </span>
                </div>
                <div className="flex items-center">
                  <button
                    onClick={() => setGuideExpanded(!guideExpanded)}
                    className="h-7 w-7 rounded-full flex items-center justify-center text-[#8f8b84] hover:text-[#111113] hover:bg-[#F3F2EF] transition-colors cursor-pointer"
                    aria-label={guideExpanded ? "Collapse guide" : "Expand guide"}
                  >
                    {guideExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsGuideDismissed(true);
                    }}
                    className="h-7 w-7 rounded-full flex items-center justify-center text-[#8f8b84] hover:text-[#111113] hover:bg-[#F3F2EF] transition-colors cursor-pointer"
                    aria-label="Hide guide"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <AnimatePresence initial={false}>
                {guideExpanded ? (
                  <motion.div
                    key={activeIntel.id}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-4 pb-4"
                  >
                    <h4 className="font-display text-[17px] font-semibold leading-snug tracking-tight text-[#111113]">{activeIntel.title}</h4>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-[#5D5A54]">{activeIntel.summary}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {activeIntel.keyPoints.map((pt, idx) => (
                        <span key={idx} className="rounded-full border border-[#E7E5E1] bg-[#F7F6F4] px-2.5 py-1 text-[11.5px] font-medium text-[#3a3936]">
                          {pt}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={() => handleSend(activeIntel.suggestedPrompt)}
                      className="group mt-4 w-full rounded-full bg-[#111113] px-4 py-2.5 text-[13px] font-semibold text-white flex items-center justify-between hover:bg-[#2a2a30] transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2 truncate">
                        <Sparkles className="h-4 w-4 shrink-0 text-[#F2A93B]" />
                        <span className="truncate">Ask SCIO about this</span>
                      </span>
                      <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  </motion.div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setGuideExpanded(true)}
                    className="w-full px-4 pb-3.5 text-left text-[13px] font-semibold text-[#111113] hover:text-[#B06D0F] truncate cursor-pointer"
                  >
                    {activeIntel.title}
                  </button>
                )}
              </AnimatePresence>

              {/* Scroll progress */}
              <div className="h-1 w-full bg-[#F3F2EF]">
                <motion.div className="h-full bg-[#F2A93B]" style={{ width: `${scrollProgress}%` }} />
              </div>

              {/* Tail pointing to the assistant */}
              <div className="absolute -right-[7px] bottom-6 h-3.5 w-3.5 rotate-45 border-r border-t border-[#E7E5E1] bg-white" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* First-visit greeting */}
        <AnimatePresence>
          {isWaving && (
            <motion.div
              initial={{ scale: 0.6, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.6, opacity: 0, y: -6, transition: { duration: 0.3 } }}
              className="absolute -top-12 right-0 z-30 flex items-center gap-1.5 pointer-events-none"
            >
              <motion.div
                animate={{ rotate: [0, 24, -16, 24, -16, 14, -8, 0] }}
                transition={{ duration: 2.2, repeat: 1, ease: "easeInOut" }}
                className="text-2xl origin-bottom-right select-none"
              >
                👋
              </motion.div>
              <div className="rounded-full border border-[#E7E5E1] bg-white px-3 py-1.5 text-[12.5px] font-semibold text-[#111113] shadow-lg whitespace-nowrap flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#F2A93B]" />
                Hi! I&apos;m SCIO. Ask me anything.
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic Sector Eye Orb Entity (Maritime=White, Energy=Green, Manufacturing=Yellow, Logistics=Light Blue) */}
        <motion.div
          ref={orbRef}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => setIsOpen(!isOpen)}
          className={`relative h-14 w-14 sm:h-16 sm:w-16 ${faceShape} ${faceTheme.faceBg} ${faceTheme.borderColor} cursor-pointer ${faceTheme.shadowColor} flex items-center justify-center transition-all duration-300 group select-none shrink-0`}
        >
          {/* Subtle Ambient Pulse Ring */}
          <span className={`absolute -inset-1 ${faceShape} ${faceTheme.pulseRingColor} animate-ping opacity-60 pointer-events-none`} />

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
