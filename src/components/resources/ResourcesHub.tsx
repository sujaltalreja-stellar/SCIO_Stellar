"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  FileText,
  TrendingUp,
  ShieldCheck,
  Zap,
  Ship,
  Building2,
  Truck,
  ArrowRight,
  ArrowUpRight,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  Clock,
  User,
  Tag,
  Share2,
  Download,
  Sparkles,
  ChevronRight,
  ArrowLeft,
  X,
  ExternalLink,
  Layers,
  Cpu,
  BarChart3
} from "lucide-react";
import ScioSentinelOrb from "../ai/ScioSentinelOrb";

interface ResourcesHubProps {
  onBackToHome: () => void;
  onLaunchPlatform: (industry?: string, tab?: string) => void;
}

interface ResourceItem {
  id: string;
  type: "case-study" | "blog" | "whitepaper";
  sector: "energy" | "maritime" | "manufacturing" | "logistics" | "platform";
  sectorLabel: string;
  title: string;
  subtitle: string;
  client?: string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  date: string;
  readTime: string;
  heroImg: string;
  metrics?: { label: string; value: string; color: string }[];
  tags: string[];
  summary: string;
  challenge: string;
  solution: string;
  results: string[];
  architecture?: string[];
}

const RESOURCES_DATA: ResourceItem[] = [
  {
    id: "case-study-energy",
    type: "case-study",
    sector: "energy",
    sectorLabel: "Renewable Energy & Grid Utilities",
    title: "How Mojave Clean Power Prevented $1.8M in Substation Outages Using 96 kS/s Vibration FFT Telemetry",
    subtitle: "Predicting 500kV step-up transformer thermal breakdown 18 days in advance across a 2.4 GW multi-source grid.",
    client: "Mojave Clean Power Consortium (2.4 GW Solar + Wind)",
    author: {
      name: "StellarMind PowerOps Lab",
      role: "Grid Telemetry & Operational Intelligence",
      avatar: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=200&q=80"
    },
    date: "18 August 2026",
    readTime: "6 min read",
    heroImg: "https://images.unsplash.com/photo-1497440001374-f26997328c1b?auto=format&fit=crop&w=1200&q=80",
    metrics: [
      { label: "Prevented Outage Costs", value: "$1.8M / yr", color: "#10B981" },
      { label: "Failure Early Warning", value: "18 Days", color: "#06B6D4" },
      { label: "Dispatch Precision", value: "99.4%", color: "#7C3AED" },
    ],
    tags: ["Energy", "SCADA", "OPC-UA", "BESS", "Predictive FFT"],
    summary: "Mojave Clean Power operates 2.4 GW of utility-scale solar PV and wind generation. Rapid cloud transients and harmonic spikes were causing silent insulation degradation on main step-up transformers, leading to high curtailment fines.",
    challenge: "Traditional SCADA threshold alarms only tripped after temperatures exceeded 85°C — by which point transformer dielectric oil breakdown was already irreversible, risking a $400,000 rewinding replacement and 14 days of downtime.",
    solution: "Stellar SCIO connected non-invasively to the substation OPC-UA stream, continuously sampling 24-band vibration FFT harmonics at 96.0 kS/s and correlating transformer thermal gradients with real-time inverter load curves.",
    results: [
      "Detected micro-harmonic insulation vibration 18 days before critical thermal threshold.",
      "Automatically orchestrated dynamic load shifting to BESS battery storage with zero human lag.",
      "Eliminated $1.8M in unplanned grid curtailment penalties across 4 operating quarters.",
      "Reduced routine manual inspection labor by 42% through automated condition-based reporting."
    ],
    architecture: [
      "Edge OPC-UA Gateway ➔ SCIO 96.0 kS/s Harmonic FFT Stream",
      "Multivariate Neural Anomaly Engine (Inference latency < 20ms)",
      "Automated IEC 61850 Interlock & SAP Work Order Dispatch"
    ]
  },
  {
    id: "case-study-maritime",
    type: "case-study",
    sector: "maritime",
    sectorLabel: "Maritime Fleet & Port Operations",
    title: "Trans-Pacific Container Lines Eliminates $640k in Port Delays and Achieves 100% Inspection Pass Rate",
    subtitle: "Real-time vessel speed curves, encrypted offline voyage checklists, and automated safety equipment inspections.",
    client: "Pacific Horizon Shipping (32 Mega-Vessels)",
    author: {
      name: "StellarMind Maritime Lab",
      role: "Fleet Safety & Maritime Operations",
      avatar: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=200&q=80"
    },
    date: "12 August 2026",
    readTime: "7 min read",
    heroImg: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=1200&q=80",
    metrics: [
      { label: "Inspection Pass Rate", value: "100%", color: "#10B981" },
      { label: "Port Delay Avoidance", value: "$640,000", color: "#06B6D4" },
      { label: "On-Schedule Berth Rate", value: "97.5%", color: "#7C3AED" },
    ],
    tags: ["Maritime", "Fleet GPS", "Safety Inspections", "Fuel Logs", "Maintenance"],
    summary: "Pacific Horizon operates 32 ultra-large container vessels on the Shanghai–Rotterdam corridor. Communication blackouts in open waters left shore managers blind to fuel reserve drawdowns and safety equipment certificate expirations.",
    challenge: "Vessels frequently arrived at European destination ports with pending equipment checklists, triggering unexpected inspection delays and costing over $45,000 per idle day.",
    solution: "Deployed SCIO's Maritime Operations Control Tower with encrypted satellite synchronization, allowing crew to complete offline inspection checklists and monitoring fuel margins in real-time.",
    results: [
      "Achieved 100% port safety inspection pass rate across 18 consecutive months.",
      "Saved $640,000 in port delay penalties through AI-calculated just-in-time steaming arrival curves.",
      "Maintained optimal fuel efficiency and low emissions ratings across all routes.",
      "Unified vessel engine room telemetry with headquarters ERP procurement ledgers."
    ],
    architecture: [
      "Satellite AIS Vessel Feed + Offline Mobile Inspection Client",
      "SCIO SeaOps Engine (Bunker consumption & PSC audit analytics)",
      "Automated Port Clearance Agent & CAPA Workflow Orchestrator"
    ]
  },
  {
    id: "case-study-manufacturing",
    type: "case-study",
    sector: "manufacturing",
    sectorLabel: "Manufacturing 4.0 & Industrial Automation",
    title: "Apex Robotics Gigafactory Reaches 99.4% Line Uptime with Dual-Axis OEE & Optical Defect AI",
    subtitle: "Sub-second hydraulic vibration telemetry and automated closed-loop MRO purchase order drafting.",
    client: "Apex Advanced Robotics & EV Assembly",
    author: {
      name: "StellarMind Robotics Lab",
      role: "Industrial AI & Automation Systems",
      avatar: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=200&q=80"
    },
    date: "04 August 2026",
    readTime: "5 min read",
    heroImg: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80",
    metrics: [
      { label: "Robotic Line Uptime", value: "99.4%", color: "#10B981" },
      { label: "Defect Catch Rate", value: "99.1%", color: "#06B6D4" },
      { label: "Spindle Fault Lead Time", value: "14 Days", color: "#F59E0B" },
    ],
    tags: ["Manufacturing", "Robotics", "OEE", "Computer Vision", "MRO"],
    summary: "Apex Robotics produces 450 EV battery packs daily across 18 robotic assembly lines. High-speed 6-axis robotic arms were experiencing micro-vibration chatter that degraded weld quality and exhausted spare hydraulic valve buffers.",
    challenge: "Each hour of unscheduled robotic cell stoppage incurred $120,000 in lost production output, while manual visual quality inspections allowed sub-millimeter weld porosity defects to pass through.",
    solution: "Integrated SCIO's Dual-Axis OEE Engine and High-Speed Optical Inspection QA cameras to cross-correlate weld current spikes with mechanical joint vibration in real-time.",
    results: [
      "Surpassed world-class manufacturing standards with 99.4% robotic line availability.",
      "Achieved 99.1% optical defect capture, reducing warranty return reserves by $820k.",
      "Spindle bearing wear flagged 14 days in advance with auto-drafted SAP spare parts POs.",
      "Reduced Mean Time to Repair (MTTR) by 54% using mobile technician step-by-step guidance."
    ],
    architecture: [
      "Industrial Camera RTSP Stream + Modbus Joint Vibration Sensors",
      "SCIO Dual-Axis OEE Pareto Engine & Defect Classifier",
      "Bi-Directional SAP S/4HANA Work Order & Inventory Synchronizer"
    ]
  },
  {
    id: "case-study-logistics",
    type: "case-study",
    sector: "logistics",
    sectorLabel: "Global Multimodal Supply Chain",
    title: "Nordic Cold-Chain Network Secures 99.8% Compliance and Cuts Lead-Time Volatility by 36 Hours",
    subtitle: "End-to-end IoT telematics (-18.4°C threshold) and predictive port customs clearance triage.",
    client: "Nordic Cold-Chain Intermodal (1,400 TEU)",
    author: {
      name: "StellarMind Supply Chain Lab",
      role: "Multimodal Logistics & Telematics",
      avatar: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=200&q=80"
    },
    date: "28 July 2026",
    readTime: "6 min read",
    heroImg: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80",
    metrics: [
      { label: "Cold-Chain Compliance", value: "99.8%", color: "#10B981" },
      { label: "Demurrage Avoidance", value: "$420k / qtr", color: "#06B6D4" },
      { label: "Lead-Time Improvement", value: "−36 Hours", color: "#7C3AED" },
    ],
    tags: ["Logistics", "Cold-Chain", "IoT", "Intermodal", "SAP"],
    summary: "Nordic Cold-Chain transports sensitive pharmaceuticals and perishable goods across sea, rail, and road. Rail yard customs bottlenecks and temperature excursions were threatening strict EU cold-chain certification.",
    challenge: "Siloed GPS tracking devices failed to alert dispatchers before temperatures breached -18.4°C, resulting in spoiled cargo claims and demurrage penalties at congested intermodal yards.",
    solution: "Deployed SCIO's Logistics Control Center with real-time IoT temperature telemetry, dynamic route congestion rerouting, and automated carrier SLA validation.",
    results: [
      "Maintained 99.8% temperature threshold compliance across 1,400 refrigerated TEU containers.",
      "Eliminated $420,000 per quarter in intermodal rail yard demurrage penalties.",
      "Accelerated average delivery cycle by 36 hours through predictive port gate reservations.",
      "Provided enterprise customers with sub-second encrypted traceability audits."
    ],
    architecture: [
      "Cellular/Satellite Cold-Chain IoT Telematics Stream",
      "SCIO Supply Chain Risk Predictor & Route Optimizer",
      "Enterprise TMS & ERP Live Integration Hub"
    ]
  },
  {
    id: "blog-fft-dsp",
    type: "blog",
    sector: "energy",
    sectorLabel: "Engineering & DSP Architecture",
    title: "Why 24-Band FFT Spectral Sampling Outperforms Threshold Alarms in Heavy Machinery",
    subtitle: "Decomposing analog vibration into fundamental rotational harmonics and ultrasonic micro-signatures.",
    author: {
      name: "StellarMind DSP Engineering",
      role: "Signal Processing & Vibration FFT",
      avatar: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=200&q=80"
    },
    date: "20 August 2026",
    readTime: "8 min read",
    heroImg: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
    tags: ["DSP", "Vibration FFT", "Engineering", "Algorithms"],
    summary: "Simple threshold alarms (e.g. 'vibration > 4.5 mm/s') are the number one cause of unexpected catastrophic machine failure in industrial operations.",
    challenge: "When overall vibration amplitude spikes, mechanical bearing raceways are already severely pitted and damaged. Threshold alarms give maintenance crews zero actionable lead time.",
    solution: "SCIO utilizes 24-Band Fast Fourier Transform (FFT) spectral decomposition sampled at 96.0 kS/s. By separating sub-harmonics, 1X RPM fundamental frequencies, and ultrasonic acoustic spikes (20Hz to 28kHz), SCIO detects subsurface micro-fractures 14 to 21 days before any temperature rise occurs.",
    results: [
      "Isolates inner raceway, outer raceway, and ball pass defect frequencies individually.",
      "Filters out background environmental electrical noise from variable frequency drives (VFDs).",
      "Enables true condition-based maintenance, eliminating premature component replacements.",
      "Executes real-time inference in under 20ms directly on industrial edge gateways."
    ]
  },
  {
    id: "blog-zero-rip-replace",
    type: "blog",
    sector: "platform",
    sectorLabel: "Platform Architecture",
    title: "Zero Rip-and-Replace: Bridging Legacy SCADA OPC-UA with Cloud ERPs in Under 48 Hours",
    subtitle: "A technical blueprint for non-invasive, bi-directional enterprise operational intelligence.",
    author: {
      name: "StellarMind Core Systems",
      role: "Platform Architecture & Zero-ETL",
      avatar: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=200&q=80"
    },
    date: "15 August 2026",
    readTime: "7 min read",
    heroImg: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80",
    tags: ["Architecture", "SCADA", "ERP Integration", "Zero-ETL"],
    summary: "Enterprise digital transformation projects routinely fail because vendors propose replacing multi-million dollar SCADA and ERP installations.",
    challenge: "Industrial infrastructure has 20-year lifecycles. Ripping out working PLCs or migrating entire SAP ledgers introduces catastrophic operational risk and years of downtime.",
    solution: "Stellar SCIO acts as a non-invasive semantic abstraction layer. It consumes OPC-UA, Modbus TCP, MQTT, and REST APIs, synchronizes a live digital twin, and translates neural anomaly findings directly into SAP/Oracle purchase orders and field tickets.",
    results: [
      "Zero modifications required to existing PLC logic or SCADA supervisory systems.",
      "Sub-second data ingestion with end-to-end TLS 1.3 encryption and SOC2 Type II compliance.",
      "Out-of-the-box bi-directional connectors for SAP S/4HANA, Oracle NetSuite, and Snowflake.",
      "Complete deployment and live dashboard initialization in under 48 hours."
    ]
  }
];

export default function ResourcesHub({ onBackToHome, onLaunchPlatform }: ResourcesHubProps) {
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedSector, setSelectedSector] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedArticle, setSelectedArticle] = useState<ResourceItem | null>(null);

  // Filter resources
  const filteredResources = RESOURCES_DATA.filter((item) => {
    const matchesType = selectedType === "all" || item.type === selectedType;
    const matchesSector = selectedSector === "all" || item.sector === selectedSector;
    const matchesSearch =
      searchQuery === "" ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesSector && matchesSearch;
  });

  const featured = RESOURCES_DATA[0];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-black selection:text-white">
      
      {/* ==================== 1. TOP STICKY NAVIGATION ==================== */}
      <nav className="sticky top-0 z-50 h-16 border-b backdrop-blur-xl bg-white/95 border-slate-200 px-4 sm:px-6 lg:px-12 flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-6">
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 text-xs font-mono font-bold text-slate-700 hover:text-black transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </button>
          <div className="h-4 w-px bg-slate-200" />
          <div className="flex items-center space-x-2.5">
            <div className="h-7 w-7 rounded-lg bg-black text-white flex items-center justify-center font-mono font-black text-xs">
              S
            </div>
            <span className="font-bold font-mono text-xs uppercase tracking-wider text-slate-900">
              RESOURCES &amp; CASE STUDIES
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => onLaunchPlatform("energy", "energy-dashboard")}
            className="px-4 py-2 rounded-full font-mono text-xs font-bold shadow-md flex items-center gap-1.5 transition-all hover:scale-105 bg-black text-white hover:bg-slate-900"
          >
            <span>Launch Live Platform</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </nav>

      {/* ==================== 2. HERO HEADER SECTION ==================== */}
      <section className="py-14 sm:py-18 border-b bg-slate-50 border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1 font-mono text-xs font-bold text-slate-800 shadow-xs">
            <BookOpen className="h-3.5 w-3.5 text-indigo-600" />
            <span>KNOWLEDGE HUB · VERIFIED ENTERPRISE RESULTS</span>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-8 space-y-3">
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-950">
                Case Studies, Architecture Deep-Dives &amp; Operational AI Insights
              </h1>
              <p className="text-base sm:text-lg text-slate-700 max-w-3xl leading-relaxed font-medium">
                Explore real-world deployments where heavy industrial operators eliminated unplanned downtime,
                synchronized legacy ERPs with SCADA streams, and achieved multimillion-dollar operational ROI.
              </p>
            </div>

            {/* Search Input */}
            <div className="lg:col-span-4">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search case studies, tags, sectors..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 bg-white text-xs font-mono font-medium focus:outline-none focus:border-black shadow-xs text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200">
            {/* Type Filters */}
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: "all", label: "All Content" },
                { id: "case-study", label: "📁 Case Studies" },
                { id: "blog", label: "📝 Technical Blogs" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedType(t.id)}
                  className={`px-4 py-1.5 rounded-full font-mono text-xs font-bold transition-all shadow-xs ${
                    selectedType === t.id
                      ? "bg-black text-white"
                      : "bg-white text-slate-700 hover:text-black border border-slate-300 hover:bg-slate-100"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Sector Filters */}
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: "all", label: "All Sectors" },
                { id: "energy", label: "⚡ Energy" },
                { id: "maritime", label: "🚢 Maritime" },
                { id: "manufacturing", label: "🏭 Mfg 4.0" },
                { id: "logistics", label: "🚚 Logistics" },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSector(s.id)}
                  className={`px-3 py-1 rounded-lg font-mono text-xs font-bold transition-all ${
                    selectedSector === s.id
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-white text-slate-600 hover:text-black border border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ==================== 3. FEATURED SPOTLIGHT CASE STUDY ==================== */}
      {selectedType === "all" && selectedSector === "all" && searchQuery === "" && (
        <section className="py-12 border-b bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-indigo-700 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4" />
                Featured Enterprise Case Study
              </span>
              <span className="font-mono text-[11px] text-slate-500 font-bold">
                AUDITED RESULTS · 2026
              </span>
            </div>

            <div
              onClick={() => setSelectedArticle(featured)}
              className="rounded-3xl border border-slate-300 overflow-hidden shadow-lg hover:shadow-2xl transition-all cursor-pointer group grid lg:grid-cols-12 bg-white"
            >
              <div className="lg:col-span-6 relative min-h-[360px] overflow-hidden bg-black">
                <img
                  src={featured.heroImg}
                  alt={featured.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                
                <div className="absolute top-4 left-4 z-10">
                  <span className="px-3 py-1 rounded-full font-mono text-[11px] font-bold bg-white text-black shadow-sm">
                    {featured.sectorLabel}
                  </span>
                </div>

                <div className="absolute bottom-6 left-6 right-6 z-10 grid grid-cols-3 gap-2.5">
                  {featured.metrics?.map((m) => (
                    <div key={m.label} className="p-3 rounded-xl bg-black/85 backdrop-blur-md border border-white/20">
                      <span className="text-base sm:text-lg font-black font-mono block text-white" style={{ color: m.color }}>
                        {m.value}
                      </span>
                      <span className="text-[10px] font-mono text-white/70 block truncate font-bold">
                        {m.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-6 p-8 sm:p-10 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-xs font-mono text-slate-500 font-bold">
                    <span>{featured.client}</span>
                    <span>•</span>
                    <span>{featured.readTime}</span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black text-slate-950 group-hover:text-indigo-600 transition-colors leading-tight">
                    {featured.title}
                  </h2>

                  <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-medium">
                    {featured.subtitle}
                  </p>
                </div>

                <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-slate-950 text-white flex items-center justify-center font-mono font-bold text-xs shadow-xs">
                      S
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{featured.author.name}</p>
                      <p className="text-[10.5px] font-mono text-slate-500">{featured.author.role}</p>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-indigo-700 group-hover:translate-x-1 transition-transform">
                    <span>Read Full Case Study</span>
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ==================== 4. RESOURCE GRID ==================== */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-slate-950">
              {selectedType === "case-study" ? "Enterprise Case Studies" : selectedType === "blog" ? "Technical Engineering Blogs" : "All Published Case Studies & Insights"}
              <span className="ml-2 text-sm font-mono font-bold text-slate-500">({filteredResources.length})</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedArticle(item)}
                className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="h-52 relative overflow-hidden bg-black">
                    <img
                      src={item.heroImg}
                      alt={item.title}
                      className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                    
                    <div className="absolute top-3.5 left-3.5 z-10 flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded font-mono text-[10px] font-bold bg-white text-black shadow-xs">
                        {item.type === "case-study" ? "CASE STUDY" : "ENGINEERING BLOG"}
                      </span>
                      <span className="px-2.5 py-0.5 rounded font-mono text-[10px] font-bold bg-black/80 text-white border border-white/20">
                        {item.sector.toUpperCase()}
                      </span>
                    </div>

                    {item.metrics && item.metrics.length > 0 && (
                      <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-black text-emerald-400 drop-shadow-sm">
                          {item.metrics[0].label}: {item.metrics[0].value}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-6 space-y-3">
                    <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 font-bold">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{item.date}</span>
                      <span>•</span>
                      <Clock className="h-3.5 w-3.5" />
                      <span>{item.readTime}</span>
                    </div>

                    <h4 className="text-base sm:text-lg font-bold text-slate-950 group-hover:text-indigo-600 transition-colors leading-snug">
                      {item.title}
                    </h4>

                    <p className="text-xs sm:text-sm text-slate-700 line-clamp-3 leading-relaxed font-medium">
                      {item.subtitle}
                    </p>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {item.tags.slice(0, 2).map((t) => (
                      <span key={t} className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700">
                        #{t}
                      </span>
                    ))}
                  </div>

                  <span className="text-xs font-mono font-bold text-indigo-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Read</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== 5. ARTICLE DETAIL MODAL ==================== */}
      <AnimatePresence>
        {selectedArticle && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-3xl border border-slate-200 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-6 text-slate-900"
            >
              {/* Modal Top Banner */}
              <div className="relative h-64 sm:h-80 overflow-hidden rounded-t-3xl bg-black">
                <img
                  src={selectedArticle.heroImg}
                  alt={selectedArticle.title}
                  className="w-full h-full object-cover opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="absolute top-4 right-4 h-9 w-9 rounded-full bg-black/80 text-white flex items-center justify-center border border-white/20 hover:bg-black transition-colors z-20"
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full font-mono text-xs font-bold bg-white text-black">
                      {selectedArticle.sectorLabel}
                    </span>
                    <span className="px-3 py-1 rounded-full font-mono text-xs font-bold bg-black/70 border border-white/30">
                      {selectedArticle.readTime}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-3xl font-black leading-tight text-white">
                    {selectedArticle.title}
                  </h2>
                </div>
              </div>

              {/* Modal Content Body */}
              <div className="p-6 sm:p-10 space-y-8">
                
                {/* Author & Client Info */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-full bg-slate-950 text-white flex items-center justify-center font-mono font-bold text-sm shadow-xs">
                      S
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{selectedArticle.author.name}</p>
                      <p className="text-xs font-mono text-slate-500">{selectedArticle.author.role}</p>
                    </div>
                  </div>

                  {selectedArticle.client && (
                    <div className="text-right font-mono">
                      <span className="text-[10.5px] uppercase font-bold text-slate-500 block">Deploying Enterprise</span>
                      <span className="text-xs font-bold text-indigo-700">{selectedArticle.client}</span>
                    </div>
                  )}
                </div>

                {/* Key Metrics Strip (For Case Studies) */}
                {selectedArticle.metrics && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {selectedArticle.metrics.map((m) => (
                      <div key={m.label} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 text-center space-y-1">
                        <span className="text-2xl font-black font-mono block" style={{ color: m.color }}>
                          {m.value}
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-600">
                          {m.label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Challenge & Solution Blocks */}
                <div className="space-y-6 text-sm sm:text-base leading-relaxed">
                  
                  <div className="p-6 rounded-2xl border border-red-200 bg-red-50/70 space-y-2">
                    <h4 className="font-bold text-xs uppercase font-mono tracking-wider text-red-700 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-red-600" />
                      The Operational Challenge
                    </h4>
                    <p className="text-slate-900 font-medium">{selectedArticle.challenge}</p>
                  </div>

                  <div className="p-6 rounded-2xl border border-emerald-200 bg-emerald-50/70 space-y-2">
                    <h4 className="font-bold text-xs uppercase font-mono tracking-wider text-emerald-700 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-600" />
                      How SCIO Solved It
                    </h4>
                    <p className="text-slate-900 font-medium">{selectedArticle.solution}</p>
                  </div>

                  {/* Measurable Results */}
                  <div className="space-y-3 pt-2">
                    <h4 className="font-bold text-base text-slate-950 font-mono">
                      Key Results &amp; Measurable Enterprise Impact:
                    </h4>
                    <div className="grid sm:grid-cols-2 gap-3 font-medium text-xs sm:text-sm">
                      {selectedArticle.results.map((r, rIdx) => (
                        <div key={rIdx} className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-start gap-2.5 shadow-xs">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="text-slate-800">{r}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Architecture Strip */}
                  {selectedArticle.architecture && (
                    <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-2.5 font-mono text-xs">
                      <h5 className="font-bold uppercase tracking-wider text-slate-600">Technical Integration Stack:</h5>
                      <ul className="space-y-1.5">
                        {selectedArticle.architecture.map((arch, aIdx) => (
                          <li key={aIdx} className="flex items-center gap-2 text-slate-900">
                            <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
                            <span>{arch}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                </div>

                {/* Bottom CTA in Modal */}
                <div className="pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
                  <button
                    onClick={() => setSelectedArticle(null)}
                    className="px-5 py-2.5 rounded-full border border-slate-300 font-mono text-xs font-bold text-slate-700 hover:bg-slate-100"
                  >
                    Close Article
                  </button>

                  <button
                    onClick={() => {
                      setSelectedArticle(null);
                      onLaunchPlatform(selectedArticle.sector === "platform" ? "energy" : selectedArticle.sector);
                    }}
                    className="px-6 py-2.5 rounded-full bg-black text-white font-mono text-xs font-bold shadow-md hover:bg-slate-900 flex items-center gap-2"
                  >
                    <span>Launch {selectedArticle.sectorLabel.split(" ")[0]} OCC Live</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 24/7 Sentinel AI Guide */}
      <ScioSentinelOrb onLaunchPlatform={onLaunchPlatform} />

    </div>
  );
}
