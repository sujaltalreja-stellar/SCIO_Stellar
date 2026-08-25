"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import SectionIntro from "./SectionIntro";
import CountUp from "./CountUp";
import { BRAND } from "./tokens";
import { ENTRANCE, VIEWPORT, fadeLeft, fadeRight, fadeUp, stagger } from "./motion";

const MONO = { fontFamily: "var(--font-sico-mono), 'DM Mono', monospace" };
const SANS = { fontFamily: "'DM Sans', sans-serif" };

const LOOP_STAGES = [
  { title: "Demand Planning", body: "Forecast & material plan" },
  { title: "Inventory", body: "Multi-echelon balancing" },
  { title: "Distribution", body: "Routing to site stores" },
  { title: "Field Work", body: "Inspections & work orders", highlight: true },
  { title: "Material Consumption", body: "MRO parts deducted" },
  { title: "Replenishment", body: "Requisition on threshold" },
  { title: "Enterprise Planning", body: "Back into the plan" },
];

const TRIGGER_CHAIN = [
  "Technician completes work order WO-44182",
  "Material used — 2 × bearing 6205-2RS",
  "MRO inventory updated automatically — bin B-14",
  "Stock threshold breached — minimum 6 units",
  "Purchase requisition PR-7781 triggered",
];

// Labels are literal, not CSS-uppercased: "SKUs" keeps its mixed case in the
// spec ("SKUs TRACKED", not "SKUS TRACKED"), so text-transform can't be used.
const STATS = [
  { label: "ECHELONS", to: 3, decimals: 0 },
  { label: "SKUs TRACKED", to: 2418, decimals: 0 },
  { label: "AUTO-REQUISITIONS", to: 96, decimals: 0, suffix: "%" },
];

const ADVANCE_MS = 1600;

function SupplyChainLoop() {
  const shouldReduceMotion = useReducedMotion();
  const chainRef = useRef(null);
  const chainInView = useInView(chainRef, { amount: 0.4 });
  // Rests on the second link, as the design shows, then walks the chain so the
  // "field signal feeds the plan" claim is demonstrated rather than asserted.
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (shouldReduceMotion || !chainInView) return undefined;
    const id = setInterval(() => setStep((i) => (i + 1) % TRIGGER_CHAIN.length), ADVANCE_MS);
    return () => clearInterval(id);
  }, [shouldReduceMotion, chainInView]);

  return (
    <section className="bg-white px-5 pt-6 pb-10 sm:px-8 md:px-12 lg:px-[75px] lg:pt-8 lg:pb-14">
      <div className="mx-auto w-full max-w-[1290px]">
        <SectionIntro
          eyebrow="05 — Decide · Supply Chain & Field Operations"
          title="Connect Supply Planning With What Happens on the Ground"
          description="Integrated material planning, multi-echelon inventory balancing and distribution routing — synchronized with the work actually being performed in the field."
        />

        {/* ── Closed operational loop ──────────────────────────────── */}
        <motion.div
          className="mt-10 rounded-[20px] border border-[#14110E]/[0.12] bg-[#FFFDFA] p-5 sm:p-7"
          style={{ boxShadow: "0 30px 60px -50px rgba(20,17,14,.45)" }}
          variants={stagger(0.07)}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT}
        >
          <motion.p
            variants={fadeUp}
            className="font-sico-mono text-[11.5px] uppercase tracking-[0.16em] text-[#5B4DF0] sm:text-[12.5px]"
          >
            Closed Operational Loop
          </motion.p>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
            {LOOP_STAGES.map((stage, index) => (
              <motion.div
                key={stage.title}
                variants={fadeUp}
                className={`rounded-lg border p-3 transition-colors duration-500 ease-entrance sm:last:col-span-2 md:last:col-span-1 ${
                  stage.highlight
                    ? "border-[#8B5CF6]/45 bg-[#8B5CF6]/[0.1]"
                    : "border-[#14110E]/[0.09] bg-[#FFFDFA]"
                }`}
              >
                <span
                  className={`font-sico-mono text-[11.5px] ${
                    stage.highlight ? "text-[#4A3FD6]" : "text-black/30"
                  }`}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="mt-2 text-[13px] font-semibold leading-tight text-[#14110E]">
                  {stage.title}
                </p>
                <p className="mt-1 text-[12.5px] leading-snug text-[#6B6259]">{stage.body}</p>
              </motion.div>
            ))}
          </div>

          {/* Return path: a dashed U running back from the last stage to the
              first, with the label notched into the bottom edge. */}
          <motion.div variants={fadeUp} className="relative mt-1 hidden h-12 lg:block">
            <div className="mx-[7%] h-full rounded-b-2xl border-b border-l border-r border-dashed border-[#8B5CF6]/45" />
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 bg-[#FFFDFA] px-3 font-sico-mono text-[11px] uppercase tracking-[0.16em] text-[#4A3FD6]">
              Field signal feeds the plan
            </span>
          </motion.div>
        </motion.div>

        {/* ── Why it matters / live trigger chain ──────────────────── */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2" ref={chainRef}>
          <motion.div
            variants={fadeRight}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT}
            className="flex flex-col gap-[17px] rounded-[18px] px-7 pb-[50px] pt-[37px]"
            style={{ background: "#14110E", border: "1px solid rgba(20,17,14,.12)" }}
          >
            <p style={{ ...MONO, fontWeight: 500, fontSize: "14px", letterSpacing: "1.52px", color: BRAND.green }}>
              WHY IT MATTERS
            </p>
            <p
              className="max-w-[36ch]"
              style={{ ...SANS, fontWeight: 500, fontSize: "22px", lineHeight: "28px", letterSpacing: "-.42px", color: "#FCF7F1" }}
            >
              Planning systems assume what happened. SCIO knows — because the same platform that
              plans the material also watched the technician consume it.
            </p>

            <dl
              className="mt-auto grid grid-cols-3 gap-4 pt-[22px]"
              style={{ borderTop: "1px solid rgba(252,247,241,.14)" }}
            >
              {STATS.map((stat) => (
                <div key={stat.label} className="flex flex-col gap-1.5">
                  <dt style={{ ...MONO, fontWeight: 500, fontSize: "12px", letterSpacing: "1.08px", color: BRAND.green }}>
                    {stat.label}
                  </dt>
                  <dd style={{ ...SANS, fontWeight: 500, fontSize: "20px", lineHeight: "26px", color: "#FCF7F1" }}>
                    <CountUp to={stat.to} decimals={stat.decimals} suffix={stat.suffix} />
                  </dd>
                </div>
              ))}
            </dl>
          </motion.div>

          <motion.div
            variants={fadeLeft}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT}
            className="flex flex-col gap-[18px] rounded-[18px] px-6 pb-[22px] pt-6"
            style={{ background: "#FFFDFA", border: "1px solid rgba(20,17,14,.12)" }}
          >
            <div className="flex items-center gap-2.5">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: "#5B4DF0" }} />
              <span style={{ ...MONO, fontWeight: 500, fontSize: "12px", letterSpacing: "1.52px", color: BRAND.blue }}>
                LIVE TRIGGER CHAIN
              </span>
              <span className="ml-auto" style={{ ...MONO, fontSize: "14px", color: "#A89A88" }}>
                WO-44182
              </span>
            </div>

            <ul className="flex flex-col gap-1">
              {TRIGGER_CHAIN.map((entry, index) => {
                const done = index < step;
                const running = index === step;
                return (
                  <motion.li
                    key={entry}
                    className="flex items-center gap-[13px] rounded-[10px] p-3"
                    animate={{ backgroundColor: running ? "rgba(91,77,240,.07)" : "rgba(91,77,240,0)" }}
                    transition={{ duration: 0.4, ease: ENTRANCE }}
                  >
                    <motion.span
                      className="h-2 w-2 shrink-0 rounded-[4px]"
                      animate={{
                        backgroundColor: done ? "#2FBF71" : running ? "#5B4DF0" : "#DDD2C4",
                      }}
                      transition={{ duration: 0.35, ease: ENTRANCE }}
                    />
                    <span className="shrink-0" style={{ ...MONO, fontSize: "16px", lineHeight: "21px", color: "#A89A88" }}>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <motion.span
                      className="min-w-0"
                      style={{ ...SANS, fontSize: "16px", lineHeight: "19px" }}
                      animate={{
                        color: done || running ? "#14110E" : "#A89A88",
                        fontWeight: running ? 600 : 400,
                      }}
                      transition={{ duration: 0.35, ease: ENTRANCE }}
                    >
                      {entry}
                    </motion.span>
                  </motion.li>
                );
              })}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default SupplyChainLoop;
