"use client";

import React, { useState } from "react";
import {
  ChevronRight,
  Sparkles,
  CheckCircle2
} from "lucide-react";
import { motion } from "framer-motion";
import { C, SHELL, SectionIntro } from "../shared";

export default function IntegrationsSection() {
  const [selectedIntegrationSource, setSelectedIntegrationSource] = useState<"erp" | "scada" | "fleet" | "cloud">("erp");

  return (
    <>
      {/* ==================== 9. ENTERPRISE INTEGRATION INFOGRAPHIC PIPELINE ==================== */}
      <section id="integrations" className="py-20 border-t" style={{ background: C.whiteSurface, borderColor: C.lineLight }}>
        <div className={`${SHELL} space-y-12`}>
          <SectionIntro
            eyebrow="08 — INTEGRATION PIPELINE · ZERO RIP-AND-REPLACE"
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

    </>
  );
}
