"use client";

import React, { useState } from "react";
import {
  ChevronRight,
  Cpu,
  Check,
  Copy
} from "lucide-react";
import { motion } from "framer-motion";
import { C, SHELL, SectionIntro, HOW_SCIO_WORKS_STEPS } from "../shared";

export default function HowItWorksSection() {
  const [howItWorksStep, setHowItWorksStep] = useState<number>(0);
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [activeConsoleTab, setActiveConsoleTab] = useState<"payload" | "logic" | "architecture">("payload");

  return (
    <>
      {/* ==================== 5B. HOW SCIO WORKS (END-TO-END ARCHITECTURE & OPERATIONAL LOOP) ==================== */}
      <section id="how-it-works" className="py-20 sm:py-24 border-t relative overflow-hidden" style={{ background: C.white, borderColor: C.lineLight }}>
        {/* Subtle Background Geometry */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-blue-100/50 blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full bg-indigo-100/40 blur-3xl" />
        </div>

        <div className={`${SHELL} relative space-y-12`}>
          {/* Section Header */}
          <SectionIntro
            eyebrow="04 — HOW SCIO WORKS · CONNECT → UNDERSTAND → PREDICT → ACT"
            title="How SCIO Works: A Simple 4-Step Intelligence Loop"
            description="From connecting your machines to predicting problems and executing repairs, SCIO simplifies your entire operational workflow into four clear steps: Connect All Data, Understand Operations, Predict Failures, and Take Action."
            tone="light"
            rule
          />

          {/* Interactive 4-Stage Stepper Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {HOW_SCIO_WORKS_STEPS.map((st, idx) => {
              const isActive = howItWorksStep === idx;
              const Icon = st.icon;
              return (
                <button
                  key={st.step}
                  onClick={() => setHowItWorksStep(idx)}
                  className={`text-left p-4 sm:p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden group flex flex-col justify-between ${
                    isActive
                      ? "bg-slate-950 text-white shadow-xl scale-[1.02] border-slate-900"
                      : "bg-white text-slate-800 border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 shadow-xs"
                  }`}
                >
                  <div>
                    {/* Top Status & Number */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span
                        className={`font-mono text-[11px] font-black px-2.5 py-0.5 rounded-full ${
                          isActive
                            ? "bg-white/15 text-white"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        STEP {st.step} — {st.phase}
                      </span>
                      <span
                        className={`h-2 w-2 rounded-full ${
                          isActive ? "animate-pulse" : "opacity-40"
                        }`}
                        style={{ backgroundColor: st.accent }}
                      />
                    </div>

                    {/* Icon & Step Name */}
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <div
                        className={`p-1.5 rounded-lg border shrink-0 ${
                          isActive
                            ? "bg-white/10 border-white/20 text-white"
                            : "bg-slate-100 border-slate-200 text-slate-700 group-hover:text-black"
                        }`}
                      >
                        <Icon className="h-4 w-4" style={{ color: isActive ? "#FFFFFF" : st.accent }} />
                      </div>
                      <span className="font-extrabold text-sm sm:text-base tracking-tight leading-tight">
                        {st.stepName}
                      </span>
                    </div>

                    {/* Technical Subtitle Tag */}
                    <div
                      className={`text-[11px] font-mono font-semibold mb-2 ${
                        isActive ? "text-cyan-300" : "text-slate-500"
                      }`}
                    >
                      {st.title}
                    </div>

                    {/* Clear Simple Description */}
                    <p
                      className={`text-xs leading-relaxed font-medium ${
                        isActive ? "text-slate-300" : "text-slate-600"
                      }`}
                    >
                      {st.subtitle}
                    </p>
                  </div>

                  {/* Active Indicator Underline */}
                  {isActive && (
                    <motion.div
                      layoutId="activeHowItWorksUnderline"
                      className="absolute bottom-0 left-0 right-0 h-1"
                      style={{ backgroundColor: st.accent }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Interactive Split Workbench (Left: Capabilities & Metrics, Right: Live Engine Inspector) */}
          {(() => {
            const currentStep = HOW_SCIO_WORKS_STEPS[howItWorksStep];
            const StepIcon = currentStep.icon;

            return (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                {/* Left Column: Clear Customer-Centric Explanation & Deep Architecture */}
                <div className="lg:col-span-6 flex flex-col justify-between space-y-6 bg-slate-50/70 border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm">
                  <div className="space-y-4">
                    {/* Stage Tag Badge & Metric Pill */}
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-[11px] font-bold text-white shadow-xs"
                        style={{ backgroundColor: currentStep.accent }}
                      >
                        <StepIcon className="h-3.5 w-3.5" />
                        <span>STEP {currentStep.step} — {currentStep.phase}</span>
                      </span>
                      <span className="px-3 py-1 rounded-full font-mono text-[11px] font-bold bg-white text-slate-800 border border-slate-200 shadow-2xs">
                        {currentStep.badge}
                      </span>
                    </div>

                    {/* Headline & Subtitle */}
                    <div>
                      <h3 className="text-xl sm:text-3xl font-black text-slate-950 tracking-tight">
                        {currentStep.stepName}
                      </h3>
                      <p className="text-xs sm:text-sm font-mono font-bold text-blue-600 mt-1 uppercase tracking-wider">
                        {currentStep.title}
                      </p>
                    </div>

                    {/* Simple Customer-Facing Summary */}
                    <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
                      <p className="text-xs sm:text-sm text-slate-900 font-semibold leading-relaxed">
                        {currentStep.subtitle}
                      </p>
                    </div>

                    {/* Deeper Description */}
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                      {currentStep.description}
                    </p>

                    {/* Key Engineering Capabilities */}
                    <div className="space-y-2.5 pt-2">
                      <h4 className="font-mono text-[11px] uppercase tracking-wider font-bold text-slate-500">
                        How It Works Under the Hood:
                      </h4>
                      <div className="space-y-2">
                        {currentStep.capabilities.map((cap, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs"
                          >
                            <div
                              className="h-4 w-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-white"
                              style={{ backgroundColor: currentStep.accent }}
                            >
                              <Check className="h-2.5 w-2.5 stroke-[3]" />
                            </div>
                            <span className="text-xs text-slate-800 font-medium leading-snug">
                              {cap}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 4 Performance Metric Chips */}
                  <div className="pt-4 border-t border-slate-200/80">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {currentStep.metrics.map((met, i) => (
                        <div
                          key={i}
                          className="p-3 rounded-xl bg-white border border-slate-200 text-center shadow-2xs"
                        >
                          <div
                            className="font-mono text-base sm:text-lg font-black"
                            style={{ color: currentStep.accent }}
                          >
                            {met.val}
                          </div>
                          <div className="font-mono text-[9.5px] uppercase font-bold text-slate-500 mt-0.5 tracking-tight">
                            {met.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column: High-Tech SCIO Live Runtime Inspector Terminal */}
                <div className="lg:col-span-6 flex flex-col rounded-3xl overflow-hidden border border-slate-800 bg-[#07090E] shadow-2xl">
                  {/* Console Header Bar */}
                  <div className="h-12 px-4 bg-[#0D111A] border-b border-white/[0.08] flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
                        <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                      </div>
                      <span className="text-[10.5px] font-bold text-white/80 tracking-wider">
                        SCIO_RUNTIME // {currentStep.phase}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                        <span>LIVE RUNTIME</span>
                      </span>
                    </div>
                  </div>

                  {/* Inspector Tabs (JSON Payload vs Logic Engine vs Nodes) */}
                  <div className="flex items-center border-b border-white/[0.08] bg-[#0A0D14] px-4 pt-2 gap-2 text-xs font-mono">
                    <button
                      onClick={() => setActiveConsoleTab("payload")}
                      className={`px-3 py-1.5 rounded-t-lg font-bold transition-colors ${
                        activeConsoleTab === "payload"
                          ? "bg-[#121722] text-cyan-400 border-t border-x border-cyan-500/40"
                          : "text-white/40 hover:text-white/70"
                      }`}
                    >
                      Live Telemetry Payload
                    </button>
                    <button
                      onClick={() => setActiveConsoleTab("logic")}
                      className={`px-3 py-1.5 rounded-t-lg font-bold transition-colors ${
                        activeConsoleTab === "logic"
                          ? "bg-[#121722] text-violet-400 border-t border-x border-violet-500/40"
                          : "text-white/40 hover:text-white/70"
                      }`}
                    >
                      Engine Logic &amp; Rules
                    </button>
                    <button
                      onClick={() => setActiveConsoleTab("architecture")}
                      className={`px-3 py-1.5 rounded-t-lg font-bold transition-colors ${
                        activeConsoleTab === "architecture"
                          ? "bg-[#121722] text-amber-400 border-t border-x border-amber-500/40"
                          : "text-white/40 hover:text-white/70"
                      }`}
                    >
                      Connected Pipeline Nodes
                    </button>
                  </div>

                  {/* Console Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between font-mono text-xs overflow-auto min-h-[380px]">
                    {activeConsoleTab === "payload" && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-[11px] text-white/50 border-b border-white/[0.06] pb-2">
                          <span>// LIVE DATA PACKET AT STEP {currentStep.step} ({currentStep.phase})</span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(JSON.stringify(currentStep.payload, null, 2));
                              setCopiedPayload(true);
                              setTimeout(() => setCopiedPayload(false), 2000);
                            }}
                            className="flex items-center gap-1 text-[10.5px] px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-white/80 transition-colors border border-white/10"
                          >
                            <Copy className="h-3 w-3" />
                            <span>{copiedPayload ? "Copied!" : "Copy JSON"}</span>
                          </button>
                        </div>
                        <pre className="text-[11.5px] leading-relaxed text-slate-300 overflow-x-auto p-3 rounded-xl bg-black/40 border border-white/[0.05]">
                          <code>{JSON.stringify(currentStep.payload, null, 2)}</code>
                        </pre>
                      </div>
                    )}

                    {activeConsoleTab === "logic" && (
                      <div className="space-y-4">
                        <div className="text-[11px] text-white/50 border-b border-white/[0.06] pb-2">
                          // INTERNAL EVALUATION LOGIC
                        </div>
                        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-3">
                          <div className="flex items-center gap-2 text-violet-400 font-bold text-xs">
                            <Cpu className="h-4 w-4" />
                            <span>EXECUTION RULESET SUMMARY</span>
                          </div>
                          <p className="text-slate-300 text-xs leading-relaxed font-sans font-medium">
                            {currentStep.logicSummary}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <div className="text-[10px] uppercase font-bold tracking-wider text-white/40">
                            Telemetry Stream Status:
                          </div>
                          <div className="flex items-center justify-between p-2.5 rounded-lg bg-black/40 border border-white/[0.06] text-xs">
                            <span className="text-white/70">Edge Sync Status:</span>
                            <span className="text-emerald-400 font-bold">100% IN-SYNC (0.8ms jitter)</span>
                          </div>
                          <div className="flex items-center justify-between p-2.5 rounded-lg bg-black/40 border border-white/[0.06] text-xs">
                            <span className="text-white/70">Security Protocol:</span>
                            <span className="text-cyan-400 font-bold">TLS 1.3 mTLS Unidirectional Diode</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeConsoleTab === "architecture" && (
                      <div className="space-y-4">
                        <div className="text-[11px] text-white/50 border-b border-white/[0.06] pb-2">
                          // DATA PATHWAY &amp; TOPOLOGY MAPPING
                        </div>
                        <div className="space-y-3">
                          {currentStep.architectureNodes.map((node, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.08]"
                            >
                              <div className="flex items-center gap-2.5">
                                <span className="h-5 w-5 rounded-full bg-white/10 flex items-center justify-center font-mono text-[10px] font-bold text-white">
                                  {i + 1}
                                </span>
                                <span className="text-xs text-white font-bold">{node}</span>
                              </div>
                              <span className="text-[10.5px] text-emerald-400 font-bold flex items-center gap-1">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                ACTIVE
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Terminal Footer Info Bar */}
                    <div className="pt-4 mt-4 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-3 text-[10.5px] text-white/40">
                      <span>CONNECTOR: SCIO_STREAM_ENGINE</span>
                      <div className="flex items-center gap-3">
                        <span className="text-cyan-400 font-bold">CONNECT → UNDERSTAND → PREDICT → ACT</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Bottom 4-Card Architecture Overview Grid (Simple Customer-Facing Cards) */}
          <div className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {HOW_SCIO_WORKS_STEPS.map((card, idx) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.step}
                    onClick={() => setHowItWorksStep(idx)}
                    className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-3 group"
                  >
                    <div className="flex items-center justify-between">
                      <div
                        className="p-2 rounded-xl border text-slate-800 transition-colors group-hover:text-white"
                        style={{
                          backgroundColor: "rgba(0,0,0,0.03)",
                          borderColor: "rgba(0,0,0,0.08)"
                        }}
                      >
                        <Icon className="h-4 w-4" style={{ color: card.accent }} />
                      </div>
                      <span className="font-mono text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {card.phase}
                      </span>
                    </div>

                    <div>
                      <span className="font-mono text-[11px] font-black text-slate-400">
                        STEP {card.step}
                      </span>
                      <h4 className="font-extrabold text-slate-900 text-sm mt-0.5 group-hover:text-blue-600 transition-colors">
                        {card.stepName}
                      </h4>
                      <div className="font-mono text-[11px] text-slate-500 font-semibold mt-0.5">
                        {card.title}
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed mt-1.5 font-medium">
                        {card.subtitle}
                      </p>
                    </div>

                    <div className="pt-2 flex items-center text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
                      <span>Explore {card.phase} Details</span>
                      <ChevronRight className="h-3.5 w-3.5 ml-1" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

    </>
  );
}
