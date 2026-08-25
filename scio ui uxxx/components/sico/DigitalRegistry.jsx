"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BRAND, C, SHELL, T } from "./tokens";
import { ENTRANCE, VIEWPORT, fadeLeft, fadeRight, fadeUp, stagger } from "./motion";

const MONO = { fontFamily: "var(--font-sico-mono), 'DM Mono', monospace" };

/**
 * Section 04 — the digital registry, ported from the design source.
 *
 * Each level owns the record that opens on the right when it is picked; the
 * design's copy promises "select any level to open its record", so the tree is
 * genuinely interactive. Every figure below is the design's own — do not
 * substitute invented numbers.
 */
const LEVELS = [
  {
    kind: "BUILDING",
    name: "Building A",
    sub: "Mumbai HQ Campus · 18 floors",
    cells: [
      ["ASSETS", "412"],
      ["ZONES", "54"],
      ["COMPLIANCE", "94.1%"],
      ["OPEN WO", "31"],
    ],
    links: [
      ["Floors mapped", "18"],
      ["Inspection coverage", "96.4%"],
      ["Linked ERP site", "SAP · PLANT-1100"],
    ],
  },
  {
    kind: "FLOOR",
    name: "Floor 03",
    sub: "Building A · Production level",
    cells: [
      ["ASSETS", "138"],
      ["ZONES", "9"],
      ["COMPLIANCE", "91.8%"],
      ["OPEN WO", "12"],
    ],
    links: [
      ["Zones", "03-A, 03-B, 03-C"],
      ["Last full sweep", "24 Jul 2026"],
      ["Risk rating", "Medium"],
    ],
  },
  {
    kind: "ZONE",
    name: "Zone 03-B",
    sub: "Floor 03 · Utility & pressure systems",
    cells: [
      ["ASSETS", "46"],
      ["CRITICAL", "3"],
      ["COMPLIANCE", "78.0%"],
      ["OPEN WO", "5"],
    ],
    links: [
      ["Zone owner", "Plant Maintenance"],
      ["Inspection window", "Every 90 days"],
      ["Defect trend", "▲ 2 vs last quarter"],
    ],
  },
  {
    kind: "ASSET",
    name: "Pump P-204",
    sub: "Zone 03-B · Centrifugal process pump",
    cells: [
      ["COMPONENTS", "9"],
      ["MRO PARTS", "14"],
      ["HEALTH", "72%"],
      ["OPEN WO", "1"],
    ],
    links: [
      ["Serial", "PV-204-7781"],
      ["Last inspection", "27 Jul 2026 · AI verified"],
      ["Next due", "25 Oct 2026"],
    ],
  },
  {
    kind: "COMPONENT",
    name: "Motor — 22 kW",
    sub: "Pump P-204 · Drive assembly",
    cells: [
      ["SUB-PARTS", "6"],
      ["MRO PARTS", "4"],
      ["HEALTH", "68%"],
      ["OPEN WO", "1"],
    ],
    links: [
      ["Condition", "Attention required"],
      ["Detected defect", "Bearing vibration signature"],
      ["AI confidence", "96.2%"],
    ],
  },
  {
    kind: "MRO PART",
    name: "Bearing 6205-2RS",
    sub: "Motor · Replacement bearing",
    cells: [
      ["ON HAND", "4"],
      ["MIN LEVEL", "6"],
      ["LEAD TIME", "9 d"],
      ["RESERVED", "2"],
    ],
    links: [
      ["Status", "Below minimum threshold"],
      ["Requisition", "PR-7781 drafted"],
      ["Supplier sync", "SAP MM · pending"],
    ],
  },
  {
    kind: "INVENTORY",
    name: "MRO Bin B-14",
    sub: "Store 02 · Bin location",
    cells: [
      ["SKUs", "38"],
      ["BELOW MIN", "5"],
      ["VALUE", "₹4.2L"],
      ["MOVEMENTS", "112"],
    ],
    links: [
      ["Replenishment", "Auto-triggered"],
      ["Last count", "21 Jul 2026"],
      ["Echelon", "Site store → Central DC"],
    ],
  },
];

function DigitalRegistry() {
  // Opens on the asset level — the resting state the design ships.
  const [active, setActive] = useState(3);
  const record = LEVELS[active];

  return (
    <section id="registry" className="scroll-mt-24 pt-10 pb-6 sm:pt-12 sm:pb-8 lg:pt-14 lg:pb-8">
      <div className={SHELL}>
        {/* ── Intro ────────────────────────────────────────────────── */}
        <motion.div
          className="grid items-end gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-12"
          variants={stagger(0.09)}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT}
        >
          <div>
            <motion.span
              variants={fadeUp}
              className="block"
              style={{ ...MONO, fontSize: T.monoLabel, letterSpacing: ".18em", color: C.inkFaint }}
            >
              04 — THE DIGITAL REGISTRY
            </motion.span>
            <motion.h2
              variants={fadeUp}
              className="mt-[18px] max-w-[17ch]"
              style={{
                fontSize: "clamp(32px, 3.9vw, 56px)",
                fontWeight: 500,
                letterSpacing: "-.035em",
                lineHeight: 1.04,
                textWrap: "balance",
                color: C.ink,
              }}
            >
              One Digital Registry for Every Physical Asset
            </motion.h2>
          </div>
          <motion.p
            variants={fadeUp}
            className="max-w-[46ch]"
            style={{ fontSize: "clamp(15px, 1vw + 12px, 16.5px)", lineHeight: 1.6, color: C.inkBody, textWrap: "pretty" }}
          >
            Hierarchical asset tracking maps equipment, MRO parts and inventory across the real
            facility topology — from the building down to the bin. Select any level to open its
            record.
          </motion.p>
        </motion.div>

        {/* ── Breadcrumb legend ────────────────────────────────────── */}
        <motion.div
          className="mt-10 flex flex-wrap items-center gap-2 pb-[22px]"
          style={{ borderBottom: `1px solid ${C.lineLight}` }}
          variants={stagger(0.04)}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT}
        >
          {LEVELS.map((level, index) => (
            <motion.span key={level.kind} variants={fadeRight} className="flex items-center gap-1.5">
              {/* Long arrow connector — use a smaller glyph on mobile so it
                  doesn't push the breadcrumb row wider than the container. */}
              {index > 0 && (
                <span className="mx-0.5 text-[11px] sm:text-[13px]" style={{ color: C.inkGhost }}>
                  ➔
                </span>
              )}
              <span
                style={{ ...MONO, fontSize: T.monoLabel, letterSpacing: ".1em", color: BRAND.blue }}
              >
                {level.kind}
              </span>
            </motion.span>
          ))}
        </motion.div>

        <div className="mt-[34px] grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
          {/* ── Hierarchy staircase ──────────────────────────────── */}
          <motion.div
            className="flex flex-col gap-1.5 overflow-x-auto [--sico-indent:8px] sm:[--sico-indent:20px]"
            variants={stagger(0.06)}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT}
          >
            {LEVELS.map((level, index) => {
              const isActive = index === active;
              return (
                <motion.button
                  key={level.kind}
                  type="button"
                  variants={fadeRight}
                  onClick={() => setActive(index)}
                  aria-pressed={isActive}
                  whileHover={{ x: 3 }}
                  transition={{ duration: 0.25, ease: ENTRANCE }}
                  className="flex items-center gap-3 rounded-[10px] px-4 py-[13px] text-left"
                  style={{
                    marginLeft: `calc(${index} * var(--sico-indent))`,
                    border: `1px solid ${isActive ? C.ink : C.lineLight}`,
                    background: isActive ? C.ink : C.creamRaised,
                  }}
                >
                  <span
                    className="whitespace-nowrap"
                    style={{
                      ...MONO,
                      fontSize: T.monoMicro,
                      letterSpacing: ".14em",
                      color: isActive ? C.violetSoft : C.inkDim,
                    }}
                  >
                    {level.kind}
                  </span>
                  <span
                    style={{
                      fontSize: "14.5px",
                      fontWeight: 500,
                      letterSpacing: "-.01em",
                      color: isActive ? C.cream : C.ink,
                    }}
                  >
                    {level.name}
                  </span>
                </motion.button>
              );
            })}
          </motion.div>

          {/* ── Registry record ──────────────────────────────────── */}
          <motion.div
            variants={fadeLeft}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT}
            className="self-start overflow-hidden rounded-2xl"
            style={{
              border: `1px solid ${C.lineLight}`,
              background: C.creamRaised,
              boxShadow: "0 24px 50px -40px rgba(20,17,14,.4)",
            }}
          >
            <div
              className="flex items-center gap-2.5 px-5 py-3.5"
              style={{
                borderBottom: "1px solid rgba(20,17,14,.09)",
                background: "#FAF4EC",
              }}
            >
              <span
                style={{ ...MONO, fontSize: T.monoMicro, letterSpacing: ".16em", color: C.inkFaint }}
              >
                REGISTRY RECORD
              </span>
              <span
                className="ml-auto rounded-[5px] px-2 py-[3px]"
                style={{
                  ...MONO,
                  fontSize: T.monoMicro,
                  letterSpacing: ".12em",
                  color: BRAND.blue,
                  border: "1px solid rgba(37,104,229,.35)",
                }}
              >
                {record.kind}
              </span>
            </div>

            <div className="px-5 py-[22px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={record.kind}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3, ease: ENTRANCE }}
                >
                  <div
                    style={{ fontSize: "25px", fontWeight: 500, letterSpacing: "-.028em", color: C.ink }}
                  >
                    {record.name}
                  </div>
                  <div className="mt-1.5" style={{ fontSize: "13.5px", color: C.inkMuted }}>
                    {record.sub}
                  </div>

                  <div
                    className="mt-[22px] grid grid-cols-2 gap-3 pt-5 sm:grid-cols-4"
                    style={{ borderTop: "1px solid rgba(20,17,14,.08)" }}
                  >
                    {record.cells.map(([k, v]) => (
                      <div key={k} className="flex flex-col gap-1.5">
                        <span
                          style={{
                            ...MONO,
                            fontSize: T.monoMicro,
                            letterSpacing: ".12em",
                            color: C.inkDim,
                          }}
                        >
                          {k}
                        </span>
                        <span
                          style={{
                            fontSize: "19px",
                            fontWeight: 500,
                            letterSpacing: "-.02em",
                            color: C.ink,
                          }}
                        >
                          {v}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div
                    className="mt-[22px] flex flex-col pt-1.5"
                    style={{ borderTop: "1px solid rgba(20,17,14,.08)" }}
                  >
                    {record.links.map(([k, v]) => (
                      <div
                        key={k}
                        className="flex items-baseline justify-between gap-4 py-[11px]"
                        style={{ borderBottom: "1px solid rgba(20,17,14,.05)" }}
                      >
                        <span style={{ fontSize: T.dense, color: C.inkMuted }}>{k}</span>
                        <span
                          className="text-right"
                          style={{ ...MONO, fontSize: T.monoBody, color: C.ink }}
                        >
                          {v}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default DigitalRegistry;
