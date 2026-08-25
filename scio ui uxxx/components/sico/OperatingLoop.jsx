"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { BRAND, C, SHELL } from "./tokens";
import { VIEWPORT, fadeUp, stagger } from "./motion";

const MONO = { fontFamily: "var(--font-sico-mono), 'DM Mono', monospace" };
const SANS = { fontFamily: "'DM Sans', sans-serif" };

const STEPS = [
  { title: "Physical Asset", body: "Pumps, vessels, panels and safety equipment mapped across the facility topology." },
  { title: "Capture", body: "A technician captures a multi-image payload from the SCIO mobile runtime." },
  { title: "AI Vision", body: "Vision Language Models classify the asset and evaluate every visible component.", active: true },
  { title: "Intelligence", body: "OCR tag extraction, surface defect detection and condition classification.", active: true },
  { title: "Action", body: "A work order, inventory movement or compliance record is generated automatically." },
  { title: "Enterprise System", body: "Synced to SAP, IBM Maximo, Oracle or Salesforce over REST and GraphQL APIs." },
];

// Three coloured packets travel the rail continuously (`sicoRun`, defined in
// sico.css: `left` animates 0% -> 100%, fading in/out at the edges). A 7s
// cycle staggered by 2.4s across three dots is what produces the "several
// packets in flight at once, evenly spaced" look in the reference screenshot —
// it is decorative telemetry, not tied to which step is "active".
const PACKETS = [
  { color: C.indigo, shadow: "rgba(91,77,240,.12)", delay: "0s" },
  { color: "#8B5CF6", shadow: "rgba(139,92,246,.1)", delay: "2.4s" },
  { color: "#2FBF71", shadow: "rgba(47,191,113,.12)", delay: "4.8s" },
];

function OperatingLoop() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section id="operating-loop" className="scroll-mt-24 bg-white py-8 sm:py-10 lg:py-12">
      <div className={SHELL}>
        {/* ── Header: eyebrow + headline on the left, lead paragraph aligned
              near its top on the right ─────────────────────────────── */}
        <motion.div
          className="grid items-start gap-8 lg:grid-cols-[minmax(0,682px)_minmax(0,521px)] lg:gap-10"
          variants={stagger(0.09)}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT}
        >
          <div className="flex flex-col gap-[19px]">
            <motion.span
              variants={fadeUp}
              style={{
                ...MONO,
                fontWeight: 500,
                fontSize: "14px",
                lineHeight: "18px",
                letterSpacing: "1.98px",
                color: BRAND.blue,
              }}
            >
              01 — THE OPERATING LOOP
            </motion.span>
            <motion.h2
              variants={fadeUp}
              style={{
                ...SANS,
                fontWeight: 500,
                fontSize: "clamp(28px, 4.6vw, 56px)",
                lineHeight: 1.036,
                letterSpacing: "-0.038em",
                color: C.ink,
                textWrap: "balance",
              }}
            >
              From Physical Operations to Digital Intelligence
            </motion.h2>
          </div>

          <motion.p
            variants={fadeUp}
            className="max-w-[521px] lg:mt-[13px]"
            style={{
              ...SANS,
              fontWeight: 400,
              fontSize: "18px",
              lineHeight: "26px",
              color: C.inkBody,
              textWrap: "pretty",
            }}
          >
            Every SCIO capability sits on one continuous loop. A physical asset is captured,
            understood by vision models, resolved into an operational decision, and executed
            inside the enterprise systems you already run.
          </motion.p>
        </motion.div>

        {/* ── Rail + steps ─────────────────────────────────────────── */}
        <div className="relative mt-16">
          {/* Fading rule: neutral at both ends, indigo through the middle. */}
          <div
            className="absolute inset-x-0 top-[33px] hidden h-px lg:block"
            style={{
              background:
                "linear-gradient(90deg, rgba(20,17,14,.10), rgba(91,77,240,.5) 50%, rgba(20,17,14,.10))",
            }}
            aria-hidden="true"
          />

          {/* Travelling packets */}
          {!shouldReduceMotion && (
            <div
              className="pointer-events-none absolute inset-x-0 top-[29px] hidden h-[9px] lg:block"
              aria-hidden="true"
            >
              {PACKETS.map((p) => (
                <span
                  key={p.color}
                  className="absolute top-0 h-[9px] w-[9px] rounded-full"
                  style={{
                    background: p.color,
                    boxShadow: `0 0 0 5px ${p.shadow}`,
                    animation: `sicoRun 7s linear infinite ${p.delay}`,
                  }}
                />
              ))}
            </div>
          )}

          <motion.div
            className="grid grid-cols-1 gap-y-9 sm:grid-cols-2 sm:gap-x-8 lg:relative lg:grid-cols-6 lg:gap-x-[26px] lg:gap-y-0"
            variants={stagger(0.07)}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT}
          >
            {STEPS.map((step, index) => (
              <motion.div key={step.title} variants={fadeUp} className="flex flex-col">
                {/* line-height is a literal 10px only on `lg` (desktop) —
                    per spec ("identical to box height, or 50%"). That tight
                    box is what makes this number's flow-height come out to
                    exactly 28px (10px box + 18px margin below), which in turn
                    puts the node dot's vertical centre at y=33px — precisely
                    on the rail line drawn at top:33px. On mobile the rail and
                    dot nodes are hidden (lg:block), so a normal line-height
                    is used there to avoid the number looking compressed. */}
                <span
                  className="mb-[18px] block leading-normal lg:leading-[10px]"
                  style={{
                    ...MONO,
                    fontWeight: 400,
                    fontSize: "20px",
                    letterSpacing: "1.4px",
                    color: BRAND.blue,
                  }}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>

                {/* Node: reserves an 11px slot on the rail; active steps
                    overlay a larger dot centred on it. Note the active dot's
                    border-radius is a literal 5.5px, not 50% of its 15px box —
                    per spec it renders as a rounded square, not a circle,
                    which is what gives steps 3/4 their slightly blockier shape
                    against the true circles used everywhere else. */}
                <span className="relative mb-[22px] hidden h-[11px] w-[11px] lg:block" aria-hidden="true">
                  <span
                    className="block h-[11px] w-[11px] rounded-full"
                    style={{
                      boxSizing: "border-box",
                      background: step.active ? C.indigo : C.cream,
                      border: `2px solid ${step.active ? C.indigo : C.ink}`,
                    }}
                  />
                  {step.active && (
                    <span
                      className="absolute -left-[2px] -top-[2px] h-[15px] w-[15px]"
                      style={{
                        borderRadius: "5.5px",
                        background: C.indigo,
                        border: `2px solid ${C.indigo}`,
                        boxShadow: "0 0 0 5px rgba(91,77,240,.14)",
                      }}
                    />
                  )}
                </span>

                <h3
                  style={{
                    ...SANS,
                    fontWeight: 700,
                    fontSize: "20px",
                    lineHeight: "26px",
                    letterSpacing: "0.26px",
                    color: BRAND.blue,
                  }}
                >
                  {step.title}
                </h3>
                <p
                  className="mt-2 lg:pr-2"
                  style={{
                    ...SANS,
                    fontWeight: 400,
                    fontSize: "16px",
                    lineHeight: "20px",
                    color: "#000000",
                  }}
                >
                  {step.body}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default OperatingLoop;
