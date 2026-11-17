"use client";

import React from "react";
import {
  ShieldCheck,
  Sparkles,
  Lock
} from "lucide-react";
import { C, SHELL } from "../shared";
import { useSite } from "../../site/SiteContext";

export default function BetaCohortSection() {
  const { openBeta } = useSite();

  return (
    <>
      {/* ==================== 10. ACTIVE PRIVATE BETA COHORT (UNDER STRICT NDA) ==================== */}
      <section id="beta-cohort" className="py-24 border-t bg-slate-950 text-white relative overflow-hidden" style={{ borderColor: C.lineDark }}>
        {/* Subtle Ambient Background Gradient */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className={`${SHELL} space-y-12 relative z-10`}>
          {/* Header Row */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold shadow-xs">
                <ShieldCheck className="h-4 w-4" />
                <span>CONFIDENTIAL PILOT PROGRAM · ACTIVE BETA COHORT</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white font-display">
                Trusted by 4 Global Market Leaders
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
                Stellar SCIO is currently deployed in live production pilots across 4 of the world&apos;s largest industrial operators under strict non-disclosure agreements.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => openBeta()}
                className="px-6 py-3 rounded-full font-mono text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-black transition-all flex items-center gap-2 shadow-lg cursor-pointer hover:scale-105"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Apply for Beta Cohort</span>
              </button>
            </div>
          </div>

          {/* 4 NDA Beta Giant Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* GIANT 1: Clean Energy & Utility Operator */}
            <div className="p-6 rounded-2xl border border-white/10 bg-slate-900/90 backdrop-blur-xl shadow-xl flex flex-col justify-between space-y-5 transition-all hover:border-emerald-500/50 hover:shadow-emerald-500/10 group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded font-mono text-[9.5px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <Lock className="h-3 w-3" />
                    <span>CONFIDENTIAL · TOP 3 GLOBAL UTILITY</span>
                  </span>
                </div>

                <div>
                  <h3 className="font-extrabold text-base text-white group-hover:text-emerald-300 transition-colors">
                    Fortune 50 Clean Energy &amp; Power Grid Operator
                  </h3>
                  <p className="text-xs font-mono text-emerald-400 mt-1">12.4 GW Managed · 42 Grid Substations</p>
                </div>

                <div className="pt-3 border-t border-white/10 space-y-2 text-xs text-slate-300 font-sans">
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">›</span>
                    <span><strong>Live Pilot:</strong> Substation transformer DGA gas analysis &amp; 50.02 Hz frequency telemetry.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">›</span>
                    <span><strong>Verified Impact:</strong> 14-day early warning on transformer dielectric insulation degradation.</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Status: Production Pilot</span>
                <span className="text-emerald-400 font-bold">● Active 24/7</span>
              </div>
            </div>

            {/* GIANT 2: Maritime Shipping Fleet */}
            <div className="p-6 rounded-2xl border border-white/10 bg-slate-900/90 backdrop-blur-xl shadow-xl flex flex-col justify-between space-y-5 transition-all hover:border-blue-500/50 hover:shadow-blue-500/10 group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded font-mono text-[9.5px] font-bold uppercase tracking-wider bg-blue-500/15 text-blue-400 border border-blue-500/30 flex items-center gap-1">
                    <Lock className="h-3 w-3" />
                    <span>CONFIDENTIAL · TOP 5 GLOBAL SHIPPING LINE</span>
                  </span>
                </div>

                <div>
                  <h3 className="font-extrabold text-base text-white group-hover:text-blue-300 transition-colors">
                    Global Ocean Cargo &amp; Container Shipping Giant
                  </h3>
                  <p className="text-xs font-mono text-blue-400 mt-1">240+ Ocean Vessels · Global Sea Lanes</p>
                </div>

                <div className="pt-3 border-t border-white/10 space-y-2 text-xs text-slate-300 font-sans">
                  <div className="flex items-start gap-2">
                    <span className="text-blue-400 font-bold">›</span>
                    <span><strong>Live Pilot:</strong> Propulsion engine vibration, daily fuel burn rate logs &amp; safety inspection checklists.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-400 font-bold">›</span>
                    <span><strong>Verified Impact:</strong> 100% first-pass port safety inspection readiness; 240 MT fuel burn protected.</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Status: Ocean Pilot</span>
                <span className="text-blue-400 font-bold">● Active 24/7</span>
              </div>
            </div>

            {/* GIANT 3: Advanced Automotive & Aerospace OEM */}
            <div className="p-6 rounded-2xl border border-white/10 bg-slate-900/90 backdrop-blur-xl shadow-xl flex flex-col justify-between space-y-5 transition-all hover:border-amber-500/50 hover:shadow-amber-500/10 group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded font-mono text-[9.5px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                    <Lock className="h-3 w-3" />
                    <span>CONFIDENTIAL · TIER-1 GLOBAL OEM</span>
                  </span>
                </div>

                <div>
                  <h3 className="font-extrabold text-base text-white group-hover:text-amber-300 transition-colors">
                    Tier-1 Global Aerospace &amp; Precision OEM
                  </h3>
                  <p className="text-xs font-mono text-amber-400 mt-1">38 Smart Plants · 1,200+ CNC Machining Cells</p>
                </div>

                <div className="pt-3 border-t border-white/10 space-y-2 text-xs text-slate-300 font-sans">
                  <div className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">›</span>
                    <span><strong>Live Pilot:</strong> 5-axis CNC spindle FFT vibration, micro-stoppage detection &amp; automated SAP PM work orders.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">›</span>
                    <span><strong>Verified Impact:</strong> 4.2% overall OEE boost; eliminated tool-chatter defects causing $1.8M scrap.</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Status: Plant Pilot</span>
                <span className="text-amber-400 font-bold">● Active 24/7</span>
              </div>
            </div>

            {/* GIANT 4: Cold-Chain & Food Logistics Enterprise */}
            <div className="p-6 rounded-2xl border border-white/10 bg-slate-900/90 backdrop-blur-xl shadow-xl flex flex-col justify-between space-y-5 transition-all hover:border-cyan-500/50 hover:shadow-cyan-500/10 group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded font-mono text-[9.5px] font-bold uppercase tracking-wider bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 flex items-center gap-1">
                    <Lock className="h-3 w-3" />
                    <span>CONFIDENTIAL · GLOBAL SUPPLY CHAIN GIANT</span>
                  </span>
                </div>

                <div>
                  <h3 className="font-extrabold text-base text-white group-hover:text-cyan-300 transition-colors">
                    Multinational Cold-Chain &amp; Freight Network
                  </h3>
                  <p className="text-xs font-mono text-cyan-400 mt-1">18,000+ Refrigerated Reefers · Intermodal Rail</p>
                </div>

                <div className="pt-3 border-t border-white/10 space-y-2 text-xs text-slate-300 font-sans">
                  <div className="flex items-start gap-2">
                    <span className="text-cyan-400 font-bold">›</span>
                    <span><strong>Live Pilot:</strong> Continuous IoT temperature telemetry (-25°C to +4°C) &amp; 6-9 day delay prediction.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-cyan-400 font-bold">›</span>
                    <span><strong>Verified Impact:</strong> 99.98% cold-chain temperature compliance; 0 perishable shipments spoiled.</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Status: Multimodal Pilot</span>
                <span className="text-cyan-400 font-bold">● Active 24/7</span>
              </div>
            </div>

          </div>
        </div>
      </section>

    </>
  );
}
