"use client";

import React from "react";
import {
  ArrowRight,
  Cpu,
  Search,
  CheckCircle2,
  FileText,
  Workflow
} from "lucide-react";
import { C, SHELL } from "../shared";
import { useSite } from "../../site/SiteContext";

export default function CapabilitiesSection() {
  const { openDemo } = useSite();

  return (
    <>
      {/* ==================== 8. CORE OPERATIONAL INTELLIGENCE PILLARS ==================== */}
      <section id="capabilities" className="py-24 border-t bg-slate-900 text-white relative overflow-hidden" style={{ borderColor: C.lineDark }}>
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className={`${SHELL} space-y-12 relative z-10`}>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-xs font-bold shadow-xs">
                <Cpu className="h-4 w-4" />
                <span>07 — 4 CORE PILLARS · INDUSTRIAL INTELLIGENCE</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white font-display">
                Automated Root Cause, Document OCR &amp; Inspections
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
                Stellar SCIO goes beyond simple telemetry dashboards by providing deep-domain diagnosis, technical manual intelligence, mobile checklists, and automated ERP actions.
              </p>
            </div>

            <button
              onClick={() => openDemo()}
              className="px-6 py-3 rounded-full font-mono text-xs font-bold bg-white hover:bg-slate-100 text-black transition-all flex items-center gap-2 shadow-lg cursor-pointer hover:scale-105 shrink-0"
            >
              <span>Explore All 4 Modules</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* 4 Pillars Interactive Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* PILLAR 1: ROOT CAUSE ANALYSIS */}
            <div className="p-6 rounded-2xl border border-white/10 bg-slate-950/80 backdrop-blur-xl shadow-xl flex flex-col justify-between space-y-5 transition-all hover:border-cyan-500/50 hover:shadow-cyan-500/10 group">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center font-bold shadow-inner group-hover:scale-110 transition-transform">
                  <Search className="h-6 w-6" />
                </div>

                <div>
                  <span className="font-mono text-[10px] font-bold text-cyan-400 uppercase tracking-wider">PILLAR 01 · DIAGNOSTICS</span>
                  <h3 className="font-extrabold text-lg text-white group-hover:text-cyan-300 transition-colors mt-0.5">
                    Automated Root Cause Analysis (RCA)
                  </h3>
                  <p className="text-xs text-slate-300 font-sans leading-relaxed mt-2">
                    Correlates multi-axis vibration spectra, temperature transients, and hydraulic pressure curves to isolate true mechanical root causes.
                  </p>
                </div>

                <div className="pt-3 border-t border-white/10 space-y-2 text-xs text-slate-300 font-mono">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">False Alarm Cut:</span>
                    <span className="text-cyan-400 font-bold">91% Drop</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Harmonic FFT:</span>
                    <span className="text-emerald-400 font-bold">Sub-Second</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Failure Prediction:</span>
                    <span className="text-white font-bold">14 Days Early</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-cyan-400">
                <span>Multi-Variable AI</span>
                <span className="font-bold">Active ●</span>
              </div>
            </div>

            {/* PILLAR 2: DOCUMENT INTELLIGENCE SCANNING */}
            <div className="p-6 rounded-2xl border border-white/10 bg-slate-950/80 backdrop-blur-xl shadow-xl flex flex-col justify-between space-y-5 transition-all hover:border-indigo-500/50 hover:shadow-indigo-500/10 group">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-bold shadow-inner group-hover:scale-110 transition-transform">
                  <FileText className="h-6 w-6" />
                </div>

                <div>
                  <span className="font-mono text-[10px] font-bold text-indigo-400 uppercase tracking-wider">PILLAR 02 · OCR &amp; VISION</span>
                  <h3 className="font-extrabold text-lg text-white group-hover:text-indigo-300 transition-colors mt-0.5">
                    Document Intelligence &amp; Manual OCR
                  </h3>
                  <p className="text-xs text-slate-300 font-sans leading-relaxed mt-2">
                    Scans 800+ page OEM manuals, P&amp;ID schematics, and equipment nameplates to link live sensor alerts directly to exact repair steps.
                  </p>
                </div>

                <div className="pt-3 border-t border-white/10 space-y-2 text-xs text-slate-300 font-mono">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Manual Ingestion:</span>
                    <span className="text-indigo-400 font-bold">PDF, CAD &amp; P&amp;ID</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Torque Spec Lookup:</span>
                    <span className="text-emerald-400 font-bold">Instant Vector</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">MTTR Acceleration:</span>
                    <span className="text-white font-bold">82% Faster</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-indigo-400">
                <span>Semantic Twin OCR</span>
                <span className="font-bold">Active ●</span>
              </div>
            </div>

            {/* PILLAR 3: GUIDED SAFETY INSPECTIONS */}
            <div className="p-6 rounded-2xl border border-white/10 bg-slate-950/80 backdrop-blur-xl shadow-xl flex flex-col justify-between space-y-5 transition-all hover:border-emerald-500/50 hover:shadow-emerald-500/10 group">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold shadow-inner group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="h-6 w-6" />
                </div>

                <div>
                  <span className="font-mono text-[10px] font-bold text-emerald-400 uppercase tracking-wider">PILLAR 03 · FIELD OPS</span>
                  <h3 className="font-extrabold text-lg text-white group-hover:text-emerald-300 transition-colors mt-0.5">
                    Safety Equipment &amp; Inspections
                  </h3>
                  <p className="text-xs text-slate-300 font-sans leading-relaxed mt-2">
                    Digital mobile walkthroughs for ship crews and field technicians with QR asset scanning, photo defect logs, and offline audit sync.
                  </p>
                </div>

                <div className="pt-3 border-t border-white/10 space-y-2 text-xs text-slate-300 font-mono">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Inspection Pass Rate:</span>
                    <span className="text-emerald-400 font-bold">100% First-Pass</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">QR / Barcode Sync:</span>
                    <span className="text-cyan-400 font-bold">Offline Ready</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Audit Trail:</span>
                    <span className="text-white font-bold">Tamper-Proof</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-emerald-400">
                <span>Mobile &amp; Port Ready</span>
                <span className="font-bold">Active ●</span>
              </div>
            </div>

            {/* PILLAR 4: CLOSED-LOOP AUTONOMOUS ACTIONS */}
            <div className="p-6 rounded-2xl border border-white/10 bg-slate-950/80 backdrop-blur-xl shadow-xl flex flex-col justify-between space-y-5 transition-all hover:border-amber-500/50 hover:shadow-amber-500/10 group">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold shadow-inner group-hover:scale-110 transition-transform">
                  <Workflow className="h-6 w-6" />
                </div>

                <div>
                  <span className="font-mono text-[10px] font-bold text-amber-400 uppercase tracking-wider">PILLAR 04 · ERP ACTIONS</span>
                  <h3 className="font-extrabold text-lg text-white group-hover:text-amber-300 transition-colors mt-0.5">
                    Closed-Loop Actions &amp; MRO Sync
                  </h3>
                  <p className="text-xs text-slate-300 font-sans leading-relaxed mt-2">
                    Auto-drafts SAP S/4HANA PM and IBM Maximo work orders, reserves spare parts in warehouse bins, and schedules technician dispatch.
                  </p>
                </div>

                <div className="pt-3 border-t border-white/10 space-y-2 text-xs text-slate-300 font-mono">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">SAP / Maximo Sync:</span>
                    <span className="text-amber-400 font-bold">Automated Draft</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Spare Parts Staging:</span>
                    <span className="text-emerald-400 font-bold">Auto-Reserved</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Turnaround Speed:</span>
                    <span className="text-white font-bold">4.2x Faster</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-amber-400">
                <span>Direct ERP Execution</span>
                <span className="font-bold">Active ●</span>
              </div>
            </div>

          </div>
        </div>
      </section>

    </>
  );
}
