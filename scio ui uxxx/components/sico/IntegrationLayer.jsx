"use client";

import React from "react";
import { motion } from "framer-motion";
import { LayoutGrid } from "lucide-react";
import SectionIntro from "./SectionIntro";
import { VIEWPORT, fadeLeft, fadeRight, fadeUp, scaleIn, stagger } from "./motion";

const SIGNALS = ["Inspection results", "Work orders", "Inventory changes", "Compliance records"];

const SYSTEMS = [
  ["SAP", "ERP · EAM"],
  ["IBM Maximo", "EAM"],
  ["Oracle", "ERP"],
  ["Salesforce", "CRM · SERVICE"],
];

/** Dashed connector whose dashes flow toward the hub, so the sync reads as live. */
function Connector({ className = "", reverse = false }) {
  return (
    <span className={`pointer-events-none absolute hidden items-center lg:flex ${className}`} aria-hidden="true">
      <svg className="h-2 w-full overflow-visible" preserveAspectRatio="none">
        <line
          x1={reverse ? "100%" : "0"}
          y1="4"
          x2={reverse ? "0" : "100%"}
          y2="4"
          stroke="#8B5CF6"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          className="animate-dash-flow"
          opacity="0.5"
        />
      </svg>
    </span>
  );
}

function IntegrationLayer() {
  return (
    <section className="bg-white px-5 pt-6 pb-10 sm:px-8 md:px-12 lg:px-[75px] lg:pt-8 lg:pb-14">
      <div className="mx-auto w-full max-w-[1290px]">
        <SectionIntro
          eyebrow="10 — Enterprise Integration Layer"
          title="Built Around the Enterprise Systems You Already Use"
          description="Pre-built REST and GraphQL APIs sync compliance data, work orders and inventory changes directly with the systems of record already running your enterprise."
        />

        <motion.div
          className="relative mt-10 grid gap-6 rounded-[20px] border border-[#14110E]/[0.12] bg-[#FFFDFA] p-5 sm:p-8 lg:grid-cols-[1fr_1.15fr_1fr] lg:items-center lg:gap-10"
          style={{ boxShadow: "0 30px 60px -50px rgba(20,17,14,.45)" }}
          variants={stagger(0.08)}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT}
        >
          {/* ── Operational signal ─────────────────────────────────── */}
          <div>
            <motion.p
              variants={fadeUp}
              className="font-sico-mono text-[11.5px] uppercase tracking-[0.16em] text-[#5B4DF0] sm:text-[12.5px]"
            >
              Operational Signal
            </motion.p>
            <ul className="mt-4 space-y-2.5">
              {SIGNALS.map((signal) => (
                <motion.li
                  key={signal}
                  variants={fadeRight}
                  className="rounded-lg border border-[#14110E]/[0.09] bg-[#FFFDFA] px-4 py-3 text-[13px] text-[#14110E]"
                >
                  {signal}
                </motion.li>
              ))}
            </ul>
          </div>

          {/* ── Hub ────────────────────────────────────────────────── */}
          <motion.div variants={scaleIn} className="relative">
            <Connector className="-left-10 top-1/2 w-10 -translate-y-1/2" />
            <Connector className="-right-10 top-1/2 w-10 -translate-y-1/2" reverse />

            <div className="rounded-xl bg-[#14110E] p-6 text-center sm:p-8">
              <span className="mx-auto grid h-10 w-10 place-items-center rounded-lg bg-[#8B5CF6]">
                <LayoutGrid className="h-5 w-5 text-white" strokeWidth={2} />
              </span>
              <p className="mt-4 text-card-title font-semibold text-white">SCIO Integration Layer</p>
              <p className="mx-auto mt-2.5 max-w-[34ch] text-[13px] leading-relaxed text-white/50">
                Bi-directional sync between physical operations and the enterprise system of record.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {["REST APIs", "GraphQL APIs"].map((api) => (
                  <span
                    key={api}
                    className="rounded border border-white/[0.15] px-2.5 py-1.5 font-sico-mono text-[11px] uppercase tracking-[0.1em] text-white/70 sm:text-[11.5px]"
                  >
                    {api}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ── System of record ───────────────────────────────────── */}
          <div>
            <motion.p
              variants={fadeUp}
              className="font-sico-mono text-[11.5px] uppercase tracking-[0.16em] text-[#5B4DF0] sm:text-[12.5px] lg:text-right"
            >
              System of Record
            </motion.p>
            <ul className="mt-4 space-y-2.5">
              {SYSTEMS.map(([name, kind]) => (
                <motion.li
                  key={name}
                  variants={fadeLeft}
                  className="flex items-center justify-between gap-3 rounded-lg border border-[#14110E]/[0.09] bg-[#FFFDFA] px-4 py-3"
                >
                  <span className="text-[13px] text-[#14110E]">{name}</span>
                  <span className="shrink-0 font-sico-mono text-[11px] uppercase tracking-[0.1em] text-black/35">
                    {kind}
                  </span>
                </motion.li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default IntegrationLayer;
