"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import SectionIntro from "./SectionIntro";
import { ENTRANCE, VIEWPORT, fadeLeft, fadeRight, stagger } from "./motion";

const STEPS = [
  {
    title: "Capture",
    summary: "Technician captures asset images",
    detail:
      "A multi-image payload is shot from the SCIO mobile runtime — wide frame, tag close-up and any visible damage.",
  },
  {
    title: "Analyze",
    summary: "SCIO's Vision AI processes the images",
    detail:
      "Vision Language Models segment the asset, isolate each visible component and score image quality before anything is trusted.",
  },
  {
    title: "Extract",
    summary: "OCR extracts physical asset information",
    detail:
      "Serial number, brand, capacity, ratings and manufacturing date are read directly off the physical tag.",
  },
  {
    title: "Validate",
    summary: "AI evaluates component condition and defects",
    detail:
      "Surface corrosion, missing seals, gauge legibility and mounting integrity are each graded against the asset's inspection rule set.",
  },
  {
    title: "Decide",
    summary: "SCIO determines the operational action",
    detail:
      "Findings resolve into a decision — pass, flag for review, or raise a maintenance work order with the parts already identified.",
  },
  {
    title: "Execute",
    summary: "Work order, inventory or compliance workflow is triggered",
    detail:
      "The decision is written into SAP, IBM Maximo, Oracle or Salesforce, and the MRO parts consumed are deducted from inventory.",
  },
];

const RUNTIME_LINES = [
  "Initializing VLM Analysis Engine..",
  "Reading and extracting inspection tag details..",
  "Processing and packaging image payload..",
  "Evaluating asset classification & type..",
  "Performing visual component checklist analysis..",
  "Scanning for defects (rust, dents, corrosion)..",
  "Executing safety rule risk assessment..",
  "Compiling final compliance report..",
];

const ADVANCE_MS = 3200;

function InspectionWorkflow() {
  const shouldReduceMotion = useReducedMotion();
  const containerRef = React.useRef(null);
  const inView = useInView(containerRef, { amount: 0.35 });
  // Opens on "Extract" to match the design's resting state.
  const [active, setActive] = useState(2);

  // The step list and the runtime panel are driven by one index so the two
  // halves always agree: whatever step is open on the left is the stage the
  // runtime log on the right has reached. Advancing only while the section is
  // on screen keeps an off-screen timer from burning cycles.
  useEffect(() => {
    if (shouldReduceMotion || !inView) return undefined;
    const id = setInterval(() => setActive((i) => (i + 1) % STEPS.length), ADVANCE_MS);
    return () => clearInterval(id);
  }, [shouldReduceMotion, inView]);

  const progress = (active + 1) / STEPS.length;
  const activeLine = Math.round(progress * RUNTIME_LINES.length) - 1;

  return (
    <section className="bg-[#0B0D0F] px-5 pt-6 pb-10 sm:px-8 md:px-12 lg:px-[75px] lg:pt-8 lg:pb-14">
      <div className="mx-auto w-full max-w-[1290px]" ref={containerRef}>
        <SectionIntro
          tone="dark"
          eyebrow="03 — Understand · Inspection Workflow"
          title="Six steps from a photograph to an executed work order"
        />

        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          {/* ── Step list ──────────────────────────────────────────── */}
          <motion.ul
            className="space-y-2.5"
            variants={stagger(0.07)}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT}
          >
            {STEPS.map((step, index) => {
              const isActive = index === active;
              return (
                <motion.li key={step.title} variants={fadeRight}>
                  <button
                    type="button"
                    onClick={() => setActive(index)}
                    aria-expanded={isActive}
                    className={`flex w-full items-start gap-4 rounded-xl border px-4 py-4 text-left transition-colors duration-500 ease-entrance ${
                      isActive
                        ? "border-[#8B5CF6] bg-[#8B5CF6]/[0.14]"
                        : "border-white/[0.07] bg-[#101315] hover:border-white/[0.15]"
                    }`}
                  >
                    <span
                      className={`shrink-0 pt-0.5 font-sico-mono text-[13px] ${
                        isActive ? "text-[#A99BFF]" : "text-white/30"
                      }`}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={`block text-[15px] font-semibold ${
                          isActive ? "text-white" : "text-white/85"
                        }`}
                      >
                        {step.title}
                      </span>
                      <span className="mt-0.5 block text-[13px] text-white/45">{step.summary}</span>

                      <AnimatePresence initial={false}>
                        {isActive && (
                          <motion.span
                            key="detail"
                            className="block overflow-hidden"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.4, ease: ENTRANCE }}
                          >
                            <span className="mt-3 block border-t border-white/[0.1] pt-3 text-[13px] leading-relaxed text-white/55">
                              {step.detail}
                            </span>
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </span>
                  </button>
                </motion.li>
              );
            })}
          </motion.ul>

          {/* ── Runtime panel ──────────────────────────────────────── */}
          <motion.div
            variants={fadeLeft}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT}
            className="flex h-fit flex-col rounded-xl border border-white/[0.07] bg-[#101315] lg:sticky lg:top-24"
          >
            <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-2.5">
              <span className="flex items-center gap-1.5 font-sico-mono text-[11px] uppercase tracking-[0.14em] text-white/40 sm:text-[11.5px]">
                <span className="h-1 w-1 animate-pulse-soft rounded-full bg-[#2FBF71]" />
                SCIO Inspection Runtime
              </span>
              <span className="font-sico-mono text-[11px] text-white/25 sm:text-[11.5px]">
                EXT-2026-9104
              </span>
            </div>

            <div className="px-4 py-6 text-center sm:px-6">
              <p className="text-card-title font-semibold text-white">
                Running Vision Inspection Engine
              </p>
              <p className="mt-1.5 text-[13px] text-white/40">
                AI is analyzing the inspection payload…
              </p>
            </div>

            <div className="mx-4 rounded-lg bg-[#FFFDFA]/[0.03] p-4 sm:mx-6">
              <ul className="space-y-2.5">
                {RUNTIME_LINES.map((line, index) => {
                  const done = index < activeLine;
                  const running = index === activeLine;
                  return (
                    <li key={line} className="flex items-center gap-2.5">
                      <motion.span
                        className="h-1.5 w-1.5 shrink-0 rounded-full"
                        animate={{
                          backgroundColor: done
                            ? "#2FBF71"
                            : running
                              ? "#A99BFF"
                              : "rgba(255,255,255,0.15)",
                          scale: running ? 1.25 : 1,
                        }}
                        transition={{ duration: 0.35, ease: ENTRANCE }}
                      />
                      <motion.span
                        className="text-[12.5px] sm:text-[13px]"
                        animate={{
                          color: done
                            ? "rgba(255,255,255,0.45)"
                            : running
                              ? "rgba(255,255,255,0.95)"
                              : "rgba(255,255,255,0.22)",
                        }}
                        transition={{ duration: 0.35, ease: ENTRANCE }}
                      >
                        {line}
                      </motion.span>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="px-4 pb-5 pt-5 sm:px-6">
              <div className="h-1 w-full overflow-hidden rounded-full bg-[#FFFDFA]/[0.08]">
                <motion.span
                  className="block h-full rounded-full bg-[#8B5CF6]"
                  animate={{ width: `${progress * 100}%` }}
                  transition={{ duration: 0.6, ease: ENTRANCE }}
                />
              </div>
              <p className="mt-2 text-right font-sico-mono text-[11px] text-white/35 sm:text-[11.5px]">
                {Math.round(progress * 100)}% complete
              </p>
            </div>

            <div className="flex items-center justify-between border-t border-white/[0.07] px-4 py-2.5 sm:px-6">
              <span className="font-sico-mono text-[11px] uppercase tracking-[0.14em] text-white/25 sm:text-[11.5px]">
                OCR Fields
              </span>
              <span className="font-sico-mono text-[11px] text-white/50 sm:text-[11.5px]">5 of 5</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default InspectionWorkflow;
