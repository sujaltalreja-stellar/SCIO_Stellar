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
  Gauge
} from "lucide-react";
import { motion } from "framer-motion";

interface StellarHomePageProps {
  onLaunchPlatform: (industry?: string, tab?: string) => void;
}

export default function StellarHomePage({ onLaunchPlatform }: StellarHomePageProps) {
  const [mounted, setMounted] = useState(false);
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [demoSubmitted, setDemoSubmitted] = useState(false);
  const [oscilloscopePhase, setOscilloscopePhase] = useState(0);
  const [liveJitter, setLiveJitter] = useState({ mw: 2854.2, hz: 50.02, health: 98.4 });
  const [businessHealth, setBusinessHealth] = useState({
    operations: 98.4,
    supplyChain: 89.1,
    finance: 96.8,
    procurement: 94.2
  });
  const [aiSignals, setAiSignals] = useState([
    { label: "Supply Risk", val: "74% Prob", color: "text-amber-300", borderColor: "border-amber-500/20", icon: AlertTriangle, iconColor: "text-amber-400" },
    { label: "Demand Shift", val: "+18.4%", color: "text-cyan-300", borderColor: "border-cyan-500/20", icon: TrendingUp, iconColor: "text-cyan-400" },
    { label: "Vendor Delay", val: "6-9 Days", color: "text-rose-300", borderColor: "border-rose-500/20", icon: AlertTriangle, iconColor: "text-rose-400" }
  ]);

  useEffect(() => {
    setMounted(true);
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
      clearInterval(waveInterval);
      clearInterval(jitterInterval);
    };
  }, []);

  const fadeInSection = {
    initial: { opacity: 0, y: 28 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-50px" },
    transition: { duration: 0.5, ease: "easeOut" as const }
  };

  return (
    <div suppressHydrationWarning className="min-h-screen bg-[#06080d] text-slate-100 font-sans selection:bg-cyan-500/20 selection:text-cyan-300 overflow-x-hidden">
      
      {/* ==================== STICKY ENTERPRISE TOP NAV ==================== */}
      <nav className="sticky top-0 z-50 h-16 border-b border-slate-800/90 bg-[#06080d]/95 backdrop-blur-2xl px-6 lg:px-12 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-slate-200 via-slate-400 to-slate-700 p-[1px] shadow-lg flex-shrink-0">
              <div className="h-full w-full bg-[#090c14] rounded-[7px] flex items-center justify-center font-mono font-black text-slate-100 text-sm tracking-wider">
                S
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xs tracking-widest text-slate-100 uppercase font-mono group-hover:text-cyan-400 transition-colors">STELLAR SCIO</span>
              <span className="text-[9px] text-slate-500 font-mono tracking-wider">ENTERPRISE MISSION CONTROL</span>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-6 text-xs font-mono text-slate-400">
            <a href="#platform" className="hover:text-slate-200 transition-colors">Platform</a>
            <a href="#solutions" className="hover:text-slate-200 transition-colors">Solutions</a>
            <a href="#why-scio" className="hover:text-slate-200 transition-colors">Why SCIO</a>
            <a href="#integrations" className="hover:text-slate-200 transition-colors">Integrations</a>
            <a href="#impact" className="hover:text-slate-200 transition-colors">Impact</a>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setDemoModalOpen(true)}
            className="hidden sm:inline-flex px-4 py-2 rounded-lg border border-slate-700 bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-mono transition-all"
          >
            Request Demo
          </button>
          <button
            onClick={() => onLaunchPlatform("energy", "energy-dashboard")}
            className="px-4 py-2 rounded-lg bg-gradient-to-b from-slate-100 via-slate-200 to-slate-400 hover:from-white hover:to-slate-300 text-slate-950 font-bold text-xs font-mono shadow-[0_0_20px_rgba(255,255,255,0.15)] flex items-center gap-1.5 transition-all"
          >
            <span>Launch Mission Control</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </nav>

      {/* ==================== 1. HERO SECTION WITH LIVE HARDWARE HUD ==================== */}
      <section className="relative pt-16 pb-24 px-6 lg:px-12 max-w-7xl mx-auto overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#1e293b0a_1px,transparent_1px),linear-gradient(to_bottom,#1e293b0a_1px,transparent_1px)] bg-[size:32px_32px]" />
        <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-cyan-500/5 blur-[120px]" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto space-y-6 relative z-10"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-slate-700/80 bg-[#0d1017] text-[11px] font-mono text-slate-300 shadow-inner">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#00ff9d]" />
            <span className="tracking-widest uppercase font-bold text-white">STELLAR SCIO</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">OPERATIONAL AI INTELLIGENCE LAYER</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white font-display leading-[1.05]">
            Turn Operational Data Into <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Intelligent Decisions.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed font-sans font-normal">
            SCIO brings your business data, workflows, and operational signals into one AI-powered intelligence layer — helping teams detect risks, predict outcomes, and take action before problems become expensive.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => setDemoModalOpen(true)}
              className="px-7 py-3.5 rounded-xl bg-gradient-to-b from-white to-slate-200 hover:from-slate-100 hover:to-slate-300 text-slate-950 font-bold text-xs sm:text-sm font-mono shadow-xl transition-all flex items-center gap-2 hover:scale-[1.02]"
            >
              <span>Request a Demo</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => onLaunchPlatform("energy", "energy-dashboard")}
              className="px-7 py-3.5 rounded-xl border border-slate-700 bg-[#0f131d] hover:bg-[#161c2b] text-slate-200 hover:text-white font-bold text-xs sm:text-sm font-mono shadow-lg transition-all flex items-center gap-2 hover:scale-[1.02]"
            >
              <Terminal className="h-4 w-4 text-cyan-400" />
              <span>Explore SCIO Live</span>
            </button>
          </div>
        </motion.div>

        {/* REAL HARDWARE MISSION CONTROL COCKPIT WITH LIVE MOVING VISUALIZATIONS */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-14 relative mx-auto max-w-5xl rounded-2xl border border-slate-700/80 bg-[#0a0d14] shadow-[0_25px_80px_rgba(0,0,0,0.9)] overflow-hidden"
        >
          {/* Beveled Titanium Chassis Header */}
          <div className="h-11 px-4 bg-gradient-to-b from-[#161c28] to-[#0e121a] border-b border-slate-700/70 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80 shadow-[0_0_8px_#00ff9d]" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-cyan-500/80" />
              </div>
              <span className="text-slate-300 font-bold tracking-widest uppercase text-[10px] pl-2 border-l border-slate-700">
                SCIO MISSION CONTROL // CONSOLE_ID: 0x88F2
              </span>
            </div>
            <div className="flex items-center gap-3 text-[10px]">
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                LIVE TELEMETRY
              </span>
              <span className="text-slate-600">|</span>
              <span className="text-cyan-400 font-mono">{liveJitter.hz} Hz</span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-300 font-mono">{liveJitter.mw} MW</span>
            </div>
          </div>

          {/* Cockpit Multi-Zone Grid */}
          <div className="p-6 space-y-5 bg-[#080a10]">
            
            {/* Top 3 Metric Gauges with Live Ticking Numbers */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
              
              {/* Box 1: Business Health */}
              <div className="silver-card p-4 rounded-xl border border-slate-700/60 bg-[#0d1017] space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Business Health</span>
                  <span className="text-[10px] text-emerald-400 font-bold">{liveJitter.health}% LIVE</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Operations</span>
                    <span className="text-emerald-400 font-bold">{businessHealth.operations}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> Supply Chain</span>
                    <span className="text-amber-400 font-bold">{businessHealth.supplyChain}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Finance</span>
                    <span className="text-emerald-400 font-bold">{businessHealth.finance}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-cyan-400" /> Procurement</span>
                    <span className="text-cyan-400 font-bold">{businessHealth.procurement}%</span>
                  </div>
                </div>
              </div>

              {/* Box 2: Live AI Signal Ticker */}
              <div className="silver-card p-4 rounded-xl border border-slate-700/60 bg-[#0d1017] space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">AI Signals</span>
                  <span className="text-[10px] text-rose-400 font-bold">{aiSignals.length} ACTIVE</span>
                </div>
                <div className="space-y-1.5 text-xs">
                  {aiSignals.map((sig, sIdx) => {
                    const SigIcon = sig.icon;
                    return (
                      <div key={sIdx} className={`flex items-center justify-between p-1.5 rounded bg-[#07090e] border ${sig.borderColor} ${sig.color} text-[11px]`}>
                        <span className="flex items-center gap-1.5">
                          <SigIcon className={`h-3 w-3 ${sig.iconColor}`} /> {sig.label}
                        </span>
                        <span className="font-bold">{sig.val}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Box 3: LIVE MOVING DSP OSCILLOSCOPE WAVEFORM */}
              <div className="silver-card p-4 rounded-xl border border-slate-700/60 bg-[#0d1017] flex flex-col justify-between">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">DSP Telemetry</span>
                  <span className="text-[10px] text-cyan-400 font-bold flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    96.0 kS/s LIVE
                  </span>
                </div>
                <div className="h-16 w-full bg-[#06080d] rounded-lg border border-slate-800 relative flex items-center justify-center overflow-hidden px-2">
                  <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                    <path
                      d={`M 0 ${20 + 7 * Math.sin((0 + oscilloscopePhase) * 0.1)} Q 25 ${20 + 11 * Math.sin((25 + oscilloscopePhase) * 0.1)}, 50 ${20 + 9 * Math.sin((50 + oscilloscopePhase) * 0.1)} T 100 ${20 + 7 * Math.sin((100 + oscilloscopePhase) * 0.1)}`}
                      fill="none"
                      stroke="#00f0ff"
                      strokeWidth="1.5"
                    />
                    <path
                      d={`M 0 ${20 + 5 * Math.sin((0 + oscilloscopePhase * 1.5) * 0.1)} Q 25 ${20 + 8 * Math.sin((25 + oscilloscopePhase * 1.5) * 0.1)}, 50 ${20 + 6 * Math.sin((50 + oscilloscopePhase * 1.5) * 0.1)} T 100 ${20 + 5 * Math.sin((100 + oscilloscopePhase * 1.5) * 0.1)}`}
                      fill="none"
                      stroke="#00ff9d"
                      strokeWidth="1"
                      strokeDasharray="2,2"
                    />
                  </svg>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 pt-1">
                  <span>FREQ: {liveJitter.hz} Hz</span>
                  <span className="text-emerald-400">THD: 1.2%</span>
                </div>
              </div>

            </div>

            {/* Live AI Insight & Action Trigger Bar */}
            <div className="p-4 rounded-xl border border-slate-700 bg-gradient-to-r from-[#111624] via-[#0d1017] to-[#121620] font-mono space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-cyan-400 font-bold">
                  <Sparkles className="h-4 w-4" />
                  <span>PREDICTIVE AI SYNTHESIS</span>
                </div>
                <span className="text-[10px] text-slate-400 font-bold">ACTION DISPATCH READY</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
                &ldquo;Supplier X (Hydraulic Valve Seals) is showing a <strong className="text-amber-400">74% probability of delivery disruption</strong> within the next 14 days due to port congestion in Rotterdam. Production Line Beta will experience safety buffer exhaustion in 8 days.&rdquo;
              </p>
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <button
                  onClick={() => onLaunchPlatform("manufacturing", "dashboard")}
                  className="px-3.5 py-1.5 rounded-lg bg-gradient-to-b from-slate-100 to-slate-300 hover:from-white hover:to-slate-200 text-slate-950 font-bold text-xs transition-all shadow-md"
                >
                  Investigate Root Cause
                </button>
                <button
                  onClick={() => onLaunchPlatform("energy", "procurement")}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all"
                >
                  Create Work Action
                </button>
                <button
                  onClick={() => onLaunchPlatform("energy", "energy-dashboard")}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs transition-all"
                >
                  Assign Field Team
                </button>
              </div>
            </div>

          </div>
        </motion.div>
      </section>

      {/* ==================== 2. TRUST / PROOF STRIP ==================== */}
      <motion.section {...fadeInSection} className="py-12 border-y border-slate-800/80 bg-[#0a0d14]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center space-y-6">
          <p className="text-xs font-mono uppercase tracking-[0.2em] text-slate-400 font-semibold">
            Built for complex, data-driven operations
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm font-mono text-slate-300">
            <span className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0d1017] border border-slate-800 hover:border-slate-600 transition-all"><Building2 className="h-4 w-4 text-amber-400" /> Manufacturing</span>
            <span className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0d1017] border border-slate-800 hover:border-slate-600 transition-all"><Truck className="h-4 w-4 text-emerald-400" /> Supply Chain</span>
            <span className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0d1017] border border-slate-800 hover:border-slate-600 transition-all"><Zap className="h-4 w-4 text-cyan-400" /> Renewable Energy</span>
            <span className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0d1017] border border-slate-800 hover:border-slate-600 transition-all"><Ship className="h-4 w-4 text-purple-400" /> Maritime Fleet</span>
            <span className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0d1017] border border-slate-800 hover:border-slate-600 transition-all"><Briefcase className="h-4 w-4 text-blue-400" /> Enterprise Operations</span>
          </div>
        </div>
      </motion.section>

      {/* ==================== 3. PROBLEM SECTION ==================== */}
      <motion.section {...fadeInSection} className="py-24 px-6 lg:px-12 max-w-7xl mx-auto space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-mono uppercase tracking-[0.2em] text-rose-400 font-bold">The Fragmented Enterprise</span>
          <h2 className="text-3xl sm:text-5xl font-bold font-display text-white">
            Your business already generates the data.<br />
            <span className="text-slate-400">The problem is turning it into action.</span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Enterprise teams operate across ERPs, SCADA telemetry, CRMs, logistics platforms, and scattered spreadsheets. But critical operational signals remain fragmented in siloes.
          </p>
        </div>

        {/* Integration Architecture Diagram with Pulsing Data Streams */}
        <div className="p-8 rounded-2xl border border-slate-800 bg-[#0a0d14] max-w-4xl mx-auto font-mono shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-6 text-center">
            
            {/* Siloed Sources */}
            <div className="space-y-2.5 text-xs text-slate-400">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block mb-3">FRAGMENTED SYSTEMS</span>
              <div className="p-2.5 rounded-lg bg-[#06080d] border border-slate-800">SAP / Oracle ERP</div>
              <div className="p-2.5 rounded-lg bg-[#06080d] border border-slate-800">SCADA & IoT Sensors</div>
              <div className="p-2.5 rounded-lg bg-[#06080d] border border-slate-800">Salesforce / CRM</div>
              <div className="p-2.5 rounded-lg bg-[#06080d] border border-slate-800">Spreadsheets & Flat Files</div>
              <div className="p-2.5 rounded-lg bg-[#06080d] border border-slate-800">Procurement & WMS</div>
            </div>

            {/* SCIO AI ENGINE */}
            <div className="p-6 rounded-xl border border-slate-600 bg-gradient-to-b from-[#141a27] via-[#0e121a] to-[#0a0d14] shadow-xl space-y-3 relative overflow-hidden">
              <div className="h-12 w-12 mx-auto rounded-xl bg-slate-800 border border-slate-600 flex items-center justify-center text-cyan-400">
                <Cpu className="h-6 w-6 animate-pulse" />
              </div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">SCIO AI Engine</h4>
              <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                Ingests, normalizes, detects anomalies, and generates predictive decision models.
              </p>
            </div>

            {/* ACTION PIPELINE */}
            <div className="space-y-2.5 text-xs text-slate-400">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block mb-3">DIRECT EXECUTION</span>
              <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 font-bold">Predictive Dispatch</div>
              <div className="p-2.5 rounded-lg bg-cyan-950/30 border border-cyan-500/30 text-cyan-300 font-bold">Automated Work Orders</div>
              <div className="p-2.5 rounded-lg bg-purple-950/30 border border-purple-500/30 text-purple-300 font-bold">Inventory Rebalancing</div>
              <div className="p-2.5 rounded-lg bg-blue-950/30 border border-blue-500/30 text-blue-300 font-bold">Executive Decision Briefs</div>
            </div>

          </div>
        </div>
      </motion.section>

      {/* ==================== 4. SCIO INTELLIGENCE ENGINE (3 PILLARS) ==================== */}
      <motion.section id="platform" {...fadeInSection} className="py-24 px-6 lg:px-12 max-w-7xl mx-auto space-y-16 border-t border-slate-800/80">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-mono uppercase tracking-[0.2em] text-cyan-400 font-bold">Operational Velocity</span>
          <h2 className="text-3xl sm:text-5xl font-bold font-display text-white">
            From data overload to operational intelligence.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="silver-card p-8 rounded-2xl border border-slate-700/60 bg-[#0d1017] space-y-4 hover:border-slate-500 transition-all duration-300 hover:-translate-y-1">
            <span className="text-xs font-mono font-bold text-cyan-400 tracking-widest block">01 — SEE</span>
            <h3 className="text-xl font-bold font-display text-white">Understand what&apos;s happening.</h3>
            <p className="text-sm text-slate-400 leading-relaxed font-sans">
              SCIO unifies live operational telemetry, asset hierarchies, and financial metrics to give teams a real-time, zero-latency view of total business performance.
            </p>
          </div>

          <div className="silver-card p-8 rounded-2xl border border-slate-700/60 bg-[#0d1017] space-y-4 hover:border-slate-500 transition-all duration-300 hover:-translate-y-1">
            <span className="text-xs font-mono font-bold text-purple-400 tracking-widest block">02 — PREDICT</span>
            <h3 className="text-xl font-bold font-display text-white">Know what&apos;s likely to happen next.</h3>
            <p className="text-sm text-slate-400 leading-relaxed font-sans">
              Continuous machine learning models identify patterns, supply delays, thermal anomalies, and emerging risks before they manifest into expensive outages.
            </p>
          </div>

          <div className="silver-card p-8 rounded-2xl border border-slate-700/60 bg-[#0d1017] space-y-4 hover:border-slate-500 transition-all duration-300 hover:-translate-y-1">
            <span className="text-xs font-mono font-bold text-emerald-400 tracking-widest block">03 — ACT</span>
            <h3 className="text-xl font-bold font-display text-white">Move from insight to execution.</h3>
            <p className="text-sm text-slate-400 leading-relaxed font-sans">
              SCIO automatically converts intelligence into assigned work orders, procurement requisitions, field crew alerts, and executive follow-ups.
            </p>
          </div>
        </div>
      </motion.section>

      {/* ==================== 5. CORE FEATURE SECTION (6-GRID) ==================== */}
      <motion.section {...fadeInSection} className="py-24 px-6 lg:px-12 max-w-7xl mx-auto space-y-16 border-t border-slate-800/80">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-mono uppercase tracking-[0.2em] text-cyan-400 font-bold">Capabilities</span>
          <h2 className="text-3xl sm:text-5xl font-bold font-display text-white">
            One intelligence layer for your entire operation.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: "AI Command Center",
              desc: "A unified cockpit of operational telemetry, risk indicators, and dispatch channels in real time.",
              icon: Activity,
              color: "text-cyan-400"
            },
            {
              title: "Predictive Intelligence",
              desc: "Forecast demand surges, supply-chain bottlenecks, asset degradation, and trip risks 14 days out.",
              icon: TrendingUp,
              color: "text-purple-400"
            },
            {
              title: "AI Operations Agents",
              desc: "Autonomous agents that triage anomalies, formulate root causes, and draft standard work orders.",
              icon: Bot,
              color: "text-emerald-400"
            },
            {
              title: "Anomaly Detection",
              desc: "Sub-second multivariate pattern analysis identifying thermal hotspots, vibration spikes, and pressure drops.",
              icon: AlertTriangle,
              color: "text-amber-400"
            },
            {
              title: "Decision Intelligence",
              desc: "AI-generated recommendations with clear risk scores, financial trade-offs, and compliance verification.",
              icon: Sparkles,
              color: "text-blue-400"
            },
            {
              title: "Executive Intelligence",
              desc: "C-suite strategic overview aggregating PPA revenue variance, EBITDA, and regulatory compliance.",
              icon: BarChart3,
              color: "text-rose-400"
            },
          ].map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div key={idx} className="silver-card p-6 rounded-2xl border border-slate-700/60 bg-[#0d1017] space-y-3 transition-all duration-300 hover:border-slate-500 hover:-translate-y-1 hover:shadow-xl">
                <div className={`p-2.5 rounded-xl bg-[#080a10] border border-slate-800 inline-block ${feat.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h4 className="text-base font-bold font-display text-white">{feat.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </motion.section>

      {/* ==================== 6. THE "WHY SCIO?" COMPARISON SECTION ==================== */}
      <motion.section id="why-scio" {...fadeInSection} className="py-24 px-6 lg:px-12 max-w-7xl mx-auto space-y-16 border-t border-slate-800/80">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-mono uppercase tracking-[0.2em] text-cyan-400 font-bold">Paradigm Shift</span>
          <h2 className="text-3xl sm:text-5xl font-bold font-display text-white">
            Traditional dashboards tell you what happened.<br />
            <span className="text-slate-300">SCIO helps you understand what happens next.</span>
          </h2>
        </div>

        <div className="max-w-4xl mx-auto rounded-2xl border border-slate-700/80 bg-[#0a0d14] overflow-hidden shadow-2xl">
          <table className="w-full text-left border-collapse text-xs sm:text-sm font-mono">
            <thead>
              <tr className="border-b border-slate-800 bg-[#111622] text-slate-400 font-bold">
                <th className="p-4 sm:p-5 uppercase tracking-wider">Dimension</th>
                <th className="p-4 sm:p-5 text-slate-400 uppercase tracking-wider">Traditional BI</th>
                <th className="p-4 sm:p-5 text-slate-100 uppercase tracking-wider bg-slate-800/60 border-l border-slate-700">Stellar SCIO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {[
                { dim: "Focus", trad: "Historical reporting", scio: "Predictive intelligence" },
                { dim: "Format", trad: "Static, passive dashboards", scio: "Dynamic operational cockpit" },
                { dim: "Output", trad: "Raw data & charts", scio: "Concrete decision recommendations" },
                { dim: "Workload", trad: "Manual human analysis", scio: "AI-powered automated triage" },
                { dim: "Architecture", trad: "Isolated, siloed reports", scio: "Connected operational layer" },
                { dim: "Posture", trad: "Reactive firefighting", scio: "Proactive risk prevention" },
              ].map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                  <td className="p-4 sm:p-5 font-bold text-slate-300">{row.dim}</td>
                  <td className="p-4 sm:p-5 text-slate-400">{row.trad}</td>
                  <td className="p-4 sm:p-5 font-bold text-white bg-slate-900/40 border-l border-slate-700 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                    <span>{row.scio}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.section>

      {/* ==================== 7. AI COPILOT INTERACTIVE SECTION ==================== */}
      <motion.section {...fadeInSection} className="py-24 px-6 lg:px-12 max-w-7xl mx-auto space-y-16 border-t border-slate-800/80">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-mono uppercase tracking-[0.2em] text-cyan-400 font-bold">Natural Language Intelligence</span>
          <h2 className="text-3xl sm:text-5xl font-bold font-display text-white">
            Ask your business anything.
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            SCIO AI Copilot analyzes operational logs, sensor telemetry, and financial data in real time to provide synthesized answers and immediate action paths.
          </p>
        </div>

        {/* Copilot Chat Window */}
        <div className="max-w-3xl mx-auto rounded-2xl border border-slate-700 bg-[#0a0d14] shadow-2xl overflow-hidden font-mono">
          <div className="h-11 px-4 bg-[#111622] border-b border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-200">
              <Bot className="h-4 w-4 text-cyan-400" />
              <span className="font-bold">SCIO AI Copilot — Live Interactive Console</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#00ff9d]" />
              <span>ONLINE</span>
            </div>
          </div>

          <div className="p-6 space-y-6 text-xs sm:text-sm">
            <div className="p-4 rounded-xl bg-[#06080d] border border-slate-800 text-slate-200">
              <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">OPERATIONS LEADER QUERY:</span>
              &ldquo;Why did our operational maintenance costs increase this month?&rdquo;
            </div>

            <div className="p-5 rounded-xl bg-gradient-to-r from-[#111624] to-[#0e121a] border border-slate-700 text-slate-200 space-y-3">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
                <Sparkles className="h-4 w-4" />
                <span>SCIO COPILOT SYNTHESIS:</span>
              </div>
              <p className="leading-relaxed font-sans">
                Operational costs increased <strong className="text-white">12.8% ($48,200 USD)</strong> primarily due to three correlated factors:
              </p>
              <ul className="space-y-1.5 text-xs text-slate-300 font-mono list-disc list-inside">
                <li><strong>8.2%</strong> increase in emergency vendor expedited freight fees</li>
                <li><strong>14.0%</strong> increase in thermal degradation replacement on Inverter Array 04</li>
                <li>Higher inventory holding costs for critical high-load bearings</li>
              </ul>
              <div className="p-3 rounded-lg bg-[#06080d] border border-slate-800 text-xs text-slate-300 font-sans">
                <strong className="text-cyan-300">Recommended Action:</strong> Renegotiate SLA contracts with Supplier Alpha and optimize inventory safety buffers for Product Group B to save an estimated $34k next quarter.
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onLaunchPlatform("energy", "finance")}
                className="px-4 py-2 rounded-lg bg-gradient-to-b from-slate-100 to-slate-300 hover:from-white hover:to-slate-200 text-slate-950 font-bold text-xs transition-all shadow-md"
              >
                Investigate Cost Breakdown →
              </button>
              <button
                onClick={() => onLaunchPlatform("energy", "reports")}
                className="px-4 py-2 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all"
              >
                Generate Executive Report
              </button>
              <button
                onClick={() => onLaunchPlatform("energy", "work-orders")}
                className="px-4 py-2 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs transition-all"
              >
                Dispatch Optimization Plan
              </button>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ==================== 8. SECTOR SOLUTIONS (5 CARDS WITH PHOTOGRAPHY MOCKUPS) ==================== */}
      <motion.section id="solutions" {...fadeInSection} className="py-24 px-6 lg:px-12 max-w-7xl mx-auto space-y-16 border-t border-slate-800/80">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-mono uppercase tracking-[0.2em] text-cyan-400 font-bold">Industry Solutions</span>
          <h2 className="text-3xl sm:text-5xl font-bold font-display text-white">
            Intelligence built around your business.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              id: "manufacturing",
              name: "Manufacturing 4.0",
              desc: "Predict production downtime, calculate dual-axis OEE loss pareto, and automate optical vision QA defect inspection.",
              icon: Building2,
              color: "text-amber-400",
              img: "https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=800&q=80",
              tab: "dashboard"
            },
            {
              id: "logistics",
              name: "Global Supply Chain",
              desc: "Predict freight delays, track cold-chain IoT temperature compliance (-18.4°C), and avoid demurrage costs.",
              icon: Truck,
              color: "text-emerald-400",
              img: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80",
              tab: "dashboard"
            },
            {
              id: "energy",
              name: "Renewable Energy & Utilities",
              desc: "Monitor 12.4 GW grid capacity, inspect 24-band FFT vibration spectra, and balance solar, wind, BESS & thermal assets.",
              icon: Zap,
              color: "text-cyan-400",
              img: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=800&q=80",
              tab: "energy-dashboard"
            },
            {
              id: "maritime",
              name: "Maritime Fleet Command",
              desc: "Track live AIS vessel routing, monitor bunker fuel reserves (200 MT threshold), and automate Port State Control CAPA.",
              icon: Ship,
              color: "text-purple-400",
              img: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80",
              tab: "dashboard"
            },
            {
              id: "energy",
              name: "Enterprise Operations",
              desc: "Connect ERP general ledgers, reconcile inventory MRO, and provide executive C-suite predictive intelligence.",
              icon: Briefcase,
              color: "text-blue-400",
              img: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80",
              tab: "inventory"
            },
          ].map((sec, idx) => {
            const Icon = sec.icon;
            return (
              <div
                key={idx}
                onClick={() => onLaunchPlatform(sec.id, sec.tab)}
                className="silver-card rounded-2xl border border-slate-700/60 bg-[#0d1017] overflow-hidden cursor-pointer transition-all duration-300 hover:border-slate-500 hover:-translate-y-1.5 hover:shadow-2xl group flex flex-col justify-between"
              >
                <div className="h-36 relative overflow-hidden">
                  <img
                    src={sec.img}
                    alt={sec.name}
                    className="w-full h-full object-cover opacity-35 group-hover:opacity-60 group-hover:scale-105 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d1017] via-[#0d1017]/40 to-transparent" />
                  <div className="absolute top-4 left-4 p-2 rounded-xl bg-[#080a10]/90 backdrop-blur-md border border-slate-700">
                    <Icon className={`h-5 w-5 ${sec.color}`} />
                  </div>
                </div>

                <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold font-display text-white group-hover:text-cyan-400 transition-colors">{sec.name}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed font-sans mt-2">{sec.desc}</p>
                  </div>
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-300 group-hover:text-white flex items-center gap-1 transition-colors">
                      Explore Solution <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">LIVE OCC</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.section>

      {/* ==================== 9. WORKFLOW AUTOMATION PIPELINE ==================== */}
      <motion.section {...fadeInSection} className="py-24 px-6 lg:px-12 max-w-7xl mx-auto space-y-16 border-t border-slate-800/80">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-mono uppercase tracking-[0.2em] text-cyan-400 font-bold">Closed-Loop Execution</span>
          <h2 className="text-3xl sm:text-5xl font-bold font-display text-white">
            Intelligence shouldn&apos;t stop at an insight.
          </h2>
          <p className="text-slate-400 text-sm max-w-2xl mx-auto leading-relaxed">
            SCIO continuously turns operational signals into intelligent workflows — from identifying a risk to assigning the right action and tracking its outcome.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 font-mono text-center">
          {[
            { step: "01", name: "DETECT", desc: "Live signal anomaly" },
            { step: "02", name: "ANALYZE", desc: "Root cause correlation" },
            { step: "03", name: "PREDICT", desc: "Impact & timeline model" },
            { step: "04", name: "RECOMMEND", desc: "Ranked action matrix" },
            { step: "05", name: "AUTOMATE", desc: "Dispatch work order" },
            { step: "06", name: "MEASURE", desc: "Outcome verification" },
          ].map((item, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-slate-800 bg-[#0d1017] space-y-2 hover:border-slate-600 transition-colors">
              <span className="text-[10px] text-cyan-400 font-bold">{item.step}</span>
              <h4 className="text-sm font-bold text-white tracking-wider">{item.name}</h4>
              <p className="text-[10px] text-slate-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </motion.section>

      {/* ==================== 10. REAL-TIME RISK SECTION ==================== */}
      <motion.section {...fadeInSection} className="py-24 px-6 lg:px-12 max-w-7xl mx-auto space-y-16 border-t border-slate-800/80">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-mono uppercase tracking-[0.2em] text-rose-400 font-bold">Continuous Watchdog</span>
          <h2 className="text-3xl sm:text-5xl font-bold font-display text-white">
            Know what needs attention.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto font-mono">
          <div className="p-6 rounded-2xl border border-rose-500/40 bg-gradient-to-b from-rose-950/20 to-[#0d1017] space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                HIGH PRIORITY THREAT
              </span>
              <span className="text-xs text-rose-400">82% Confidence</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-display">Supplier Delivery Disruption</h3>
              <p className="text-xs text-slate-400 font-sans mt-1">High-pressure valve seals delayed at Rotterdam port.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-800">
              <div>
                <span className="text-[10px] text-slate-500 block">EXPECTED DELAY</span>
                <span className="font-bold text-rose-300">6–9 Days</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">FINANCIAL IMPACT</span>
                <span className="font-bold text-rose-300">$126,000 USD</span>
              </div>
            </div>
            <button
              onClick={() => onLaunchPlatform("energy", "procurement")}
              className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg transition-all"
            >
              Investigate Alternate Supplier →
            </button>
          </div>

          <div className="p-6 rounded-2xl border border-cyan-500/40 bg-gradient-to-b from-cyan-950/20 to-[#0d1017] space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                DEMAND FORECAST SPIKE
              </span>
              <span className="text-xs text-cyan-400">91% Confidence</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-display">Regional Peak Grid Load</h3>
              <p className="text-xs text-slate-400 font-sans mt-1">Predicted heatwave will increase cooling demand in 72h.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-800">
              <div>
                <span className="text-[10px] text-slate-500 block">DEMAND INCREASE</span>
                <span className="font-bold text-cyan-300">+18.4% MW</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">RECOMMENDED BESS CHARGE</span>
                <span className="font-bold text-cyan-300">+12% Storage</span>
              </div>
            </div>
            <button
              onClick={() => onLaunchPlatform("energy", "forecasting")}
              className="w-full py-2.5 bg-gradient-to-b from-slate-100 to-slate-300 hover:from-white hover:to-slate-200 text-slate-950 font-bold text-xs rounded-lg transition-all shadow-md"
            >
              View Dispatch Forecast →
            </button>
          </div>
        </div>
      </motion.section>

      {/* ==================== 11. ARCHITECTURE / INTEGRATIONS ==================== */}
      <motion.section id="integrations" {...fadeInSection} className="py-24 px-6 lg:px-12 max-w-7xl mx-auto space-y-16 border-t border-slate-800/80">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-mono uppercase tracking-[0.2em] text-cyan-400 font-bold">Enterprise Connectivity</span>
          <h2 className="text-3xl sm:text-5xl font-bold font-display text-white">
            SCIO works with the systems you already use.
          </h2>
          <p className="text-slate-400 text-sm max-w-2xl mx-auto leading-relaxed">
            Connect your existing ERPs, SCADA protocols, cloud data warehouses, and IoT streams to create a unified intelligence layer without replacing your core infrastructure.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 font-mono text-center text-xs">
          {[
            "SAP ERP",
            "Oracle NetSuite",
            "SCADA OPC-UA",
            "Modbus TCP",
            "Snowflake",
            "AWS / Azure",
            "Salesforce",
            "Kafka Streams"
          ].map((item, idx) => (
            <div key={idx} className="p-3.5 rounded-xl border border-slate-800 bg-[#0d1017] text-slate-300 font-bold truncate hover:border-slate-600 transition-colors">
              {item}
            </div>
          ))}
        </div>
      </motion.section>

      {/* ==================== 12. BUSINESS IMPACT SECTION ==================== */}
      <motion.section id="impact" {...fadeInSection} className="py-24 px-6 lg:px-12 max-w-7xl mx-auto space-y-16 border-t border-slate-800/80">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-mono uppercase tracking-[0.2em] text-cyan-400 font-bold">Value Realization</span>
          <h2 className="text-3xl sm:text-5xl font-bold font-display text-white">
            Built to improve the decisions that matter.
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 font-mono">
          {[
            { metric: "↓ Risk", title: "Operational Risk", desc: "Detect component faults 14 days before failure" },
            { metric: "↑ Accuracy", title: "Forecast Accuracy", desc: "Make precision generation and supply adjustments" },
            { metric: "↓ Triage", title: "Manual Analysis", desc: "Automate repetitive data collection workflows" },
            { metric: "↑ Velocity", title: "Decision Speed", desc: "Transition from telemetry to dispatch in seconds" },
            { metric: "↑ Visibility", title: "C-Suite Visibility", desc: "One unified source of truth across all 4 sectors" },
          ].map((imp, idx) => (
            <div key={idx} className="silver-card p-5 rounded-xl border border-slate-700/60 bg-[#0d1017] space-y-2 hover:border-slate-500 transition-all">
              <span className="text-base font-bold text-cyan-400 block">{imp.metric}</span>
              <h4 className="text-sm font-bold text-white">{imp.title}</h4>
              <p className="text-xs text-slate-400 font-sans">{imp.desc}</p>
            </div>
          ))}
        </div>
      </motion.section>

      {/* ==================== 13. FLAGSHIP CASE STUDY ==================== */}
      <motion.section {...fadeInSection} className="py-24 px-6 lg:px-12 max-w-7xl mx-auto space-y-16 border-t border-slate-800/80">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-mono uppercase tracking-[0.2em] text-cyan-400 font-bold">Case Study</span>
          <h2 className="text-3xl sm:text-5xl font-bold font-display text-white">
            Intelligence in action.
          </h2>
        </div>

        <div className="p-8 sm:p-12 rounded-3xl border border-slate-700/70 bg-[#0d1017] max-w-4xl mx-auto space-y-8 shadow-2xl relative overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold tracking-wider">
                FLAGSHIP IMPLEMENTATION
              </span>
              <h3 className="text-2xl font-bold font-display text-white mt-1">
                12.4 GW Renewable Energy & Industrial Operations
              </h3>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Zero Critical Trips in 2026
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
            <div className="space-y-2">
              <h4 className="text-xs font-bold font-mono text-rose-400 uppercase tracking-wider">The Challenge</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Operating data was fragmented across 50 power plants, 42 SCADA servers, and isolated ERP databases, leading to reactive maintenance.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="text-xs font-bold font-mono text-cyan-400 uppercase tracking-wider">SCIO Solution</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Deployed SCIO as the centralized intelligence layer, ingesting 96.0 kS/s DSP vibration telemetry and predictive inverter thermography.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="text-xs font-bold font-mono text-emerald-400 uppercase tracking-wider">The Outcome</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                99.98% fleet uptime achieved with an estimated $1.4M saved annually in averted unplanned outage costs.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              onClick={() => onLaunchPlatform("energy", "energy-dashboard")}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-b from-slate-100 to-slate-300 hover:from-white hover:to-slate-200 text-slate-950 font-mono text-xs font-bold flex items-center gap-2 transition-all shadow-md"
            >
              <span>Inspect Live Energy Cockpit</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </motion.section>

      {/* ==================== 14. FINAL CALL TO ACTION ==================== */}
      <motion.section {...fadeInSection} className="py-24 px-6 lg:px-12 max-w-7xl mx-auto border-t border-slate-800/80">
        <div className="p-10 sm:p-16 rounded-3xl border border-slate-700/80 bg-gradient-to-b from-[#141a27] via-[#0d1017] to-[#06080d] text-center space-y-6 shadow-2xl">
          <h2 className="text-3xl sm:text-5xl font-bold font-display text-white">
            Your data already knows what&apos;s happening.<br />
            <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Let SCIO tell you what to do next.
            </span>
          </h2>
          <p className="text-slate-300 text-sm max-w-xl mx-auto font-sans leading-relaxed">
            Connect your operational telemetry. Surface the signals that matter. Predict outcomes. Execute with speed.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => setDemoModalOpen(true)}
              className="px-7 py-3.5 rounded-xl bg-gradient-to-b from-white to-slate-200 hover:from-slate-100 hover:to-slate-300 text-slate-950 font-bold text-xs sm:text-sm font-mono shadow-xl transition-all hover:scale-105"
            >
              Request a Demo
            </button>
            <button
              onClick={() => onLaunchPlatform("energy", "energy-dashboard")}
              className="px-7 py-3.5 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white font-bold text-xs sm:text-sm font-mono shadow-lg transition-all hover:scale-105"
            >
              Launch Live Platform →
            </button>
          </div>
        </div>
      </motion.section>

      {/* ==================== 15. ENTERPRISE FOOTER ==================== */}
      <footer className="border-t border-slate-800/80 bg-[#040508] py-16 px-6 lg:px-12 text-xs font-mono text-slate-400">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8">
          
          <div className="col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-slate-200 via-slate-400 to-slate-700 p-[1px]">
                <div className="h-full w-full bg-[#090c14] rounded-[7px] flex items-center justify-center font-mono font-black text-slate-100 text-xs">
                  S
                </div>
              </div>
              <span className="font-bold text-xs text-white uppercase tracking-widest">STELLAR SCIO</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed font-sans max-w-sm">
              AI-Powered Operational Intelligence & Mission Control layer for Fortune 500 enterprise operations.
            </p>
            <p className="text-[10px] text-slate-600">
              © 2026 StellarMind.ai. All rights reserved.
            </p>
          </div>

          <div className="space-y-2.5">
            <h5 className="font-bold text-white uppercase text-[10px] tracking-wider">Solutions</h5>
            <div className="space-y-1.5 flex flex-col">
              <button onClick={() => onLaunchPlatform("manufacturing")} className="text-left hover:text-white transition-colors">Manufacturing 4.0</button>
              <button onClick={() => onLaunchPlatform("logistics")} className="text-left hover:text-white transition-colors">Supply Chain</button>
              <button onClick={() => onLaunchPlatform("energy")} className="text-left hover:text-white transition-colors">Renewable Energy</button>
              <button onClick={() => onLaunchPlatform("maritime")} className="text-left hover:text-white transition-colors">Maritime Fleet</button>
            </div>
          </div>

          <div className="space-y-2.5">
            <h5 className="font-bold text-white uppercase text-[10px] tracking-wider">Platform</h5>
            <div className="space-y-1.5 flex flex-col">
              <button onClick={() => onLaunchPlatform("energy", "energy-dashboard")} className="text-left hover:text-white transition-colors">Intelligence Engine</button>
              <button onClick={() => onLaunchPlatform("energy", "ai-center")} className="text-left hover:text-white transition-colors">AI Copilot</button>
              <button onClick={() => onLaunchPlatform("energy", "forecasting")} className="text-left hover:text-white transition-colors">Predictive Analytics</button>
              <button onClick={() => onLaunchPlatform("energy", "integrations")} className="text-left hover:text-white transition-colors">Integrations</button>
            </div>
          </div>

          <div className="space-y-2.5">
            <h5 className="font-bold text-white uppercase text-[10px] tracking-wider">Company</h5>
            <div className="space-y-1.5 flex flex-col">
              <a href="#impact" className="hover:text-white transition-colors">Case Studies</a>
              <a href="#why-scio" className="hover:text-white transition-colors">Why SCIO</a>
              <a href="#integrations" className="hover:text-white transition-colors">Architecture</a>
              <button onClick={() => setDemoModalOpen(true)} className="text-left hover:text-white transition-colors">Contact Sales</button>
            </div>
          </div>

        </div>
      </footer>

      {/* ==================== DEMO REQUEST MODAL ==================== */}
      {demoModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-[#0d1017] border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl font-mono">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                <h3 className="font-bold text-white text-sm">Request Enterprise Demo</h3>
              </div>
              <button onClick={() => setDemoModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            {demoSubmitted ? (
              <div className="py-6 text-center space-y-3 font-sans">
                <div className="h-12 w-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h4 className="text-base font-bold text-white">Demo Request Received</h4>
                <p className="text-xs text-slate-400">Our Enterprise Architecture team will reach out within 2 hours.</p>
                <button
                  onClick={() => {
                    setDemoModalOpen(false);
                    setDemoSubmitted(false);
                    onLaunchPlatform("energy", "energy-dashboard");
                  }}
                  className="mt-4 px-4 py-2 rounded-lg bg-gradient-to-b from-slate-100 to-slate-300 text-slate-950 font-bold text-xs font-mono"
                >
                  Explore Interactive Live Demo Now →
                </button>
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
                  <label className="block text-slate-400 mb-1 font-mono text-[10px] uppercase">Corporate Work Email</label>
                  <input
                    type="email"
                    required
                    placeholder="name@enterprise.com"
                    className="w-full px-3 py-2 bg-[#06080d] border border-slate-800 rounded-lg text-white font-mono focus:border-cyan-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-mono text-[10px] uppercase">Primary Operating Sector</label>
                  <select className="w-full px-3 py-2 bg-[#06080d] border border-slate-800 rounded-lg text-white font-mono focus:border-cyan-400 focus:outline-none">
                    <option value="energy">Renewable Energy & Utilities</option>
                    <option value="manufacturing">Manufacturing 4.0 & OEE</option>
                    <option value="logistics">Multimodal Supply Chain</option>
                    <option value="maritime">Maritime Fleet Operations</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full mt-2 py-3 bg-gradient-to-b from-white to-slate-200 hover:from-slate-100 hover:to-slate-300 text-slate-950 font-bold text-xs font-mono rounded-lg shadow-lg"
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
