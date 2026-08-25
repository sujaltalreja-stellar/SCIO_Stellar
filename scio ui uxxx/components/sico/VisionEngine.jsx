"use client";

import React from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import SectionIntro from "./SectionIntro";
import { BRAND, T } from "./tokens";
import { ENTRANCE, VIEWPORT, fadeLeft, fadeRight, fadeUp, stagger } from "./motion";

const MONO = { fontFamily: "var(--font-sico-mono), 'DM Mono', monospace" };
const SANS = { fontFamily: "'DM Sans', sans-serif" };

const CHIPS = [
  "Multi-Image Payload Evaluation",
  "Vision Language Models",
  "Asset Classification",
  "Component Integrity Checks",
  "Surface Defect Detection",
  "OCR Tag Extraction",
];

/**
 * Detection overlays on the inspection photo, positioned with the exact
 * left/right/top/bottom percentages from the Figma spec (rather than
 * left/top/width/height) so they reproduce the spec's box geometry precisely.
 * `glow` is the soft colour-matched shadow spec gives two of the three boxes;
 * `labelPos` controls whether the tag chip sits above or below the box, which
 * the spec varies per box depending on how close it sits to the frame edge.
 */
const DETECTIONS = [
  {
    label: "SHELL · INTEGRITY OK",
    color: "#8B5CF6",
    labelText: "#0B0D0F",
    box: { left: "12.11%", right: "53.99%", top: "20.11%", bottom: "50%" },
    glow: "rgba(139,92,246,.28)",
    dashed: false,
    labelPos: "above",
  },
  {
    label: "CORROSION · 0.87",
    color: "#F0526B",
    labelText: "#FFFFFF",
    box: { left: "53.99%", right: "20.09%", top: "41.03%", bottom: "39.04%" },
    glow: "rgba(240,82,107,.3)",
    dashed: false,
    labelPos: "above",
  },
  {
    label: "OCR TAG · PV-204-7781",
    color: "#2FBF71",
    labelText: "#0B0D0F",
    box: { left: "22.08%", right: "53.99%", top: "61.96%", bottom: "24.1%" },
    glow: null,
    dashed: true,
    labelPos: "below",
  },
];

const OCR_FIELDS = [
  ["Serial Number", "PV-204-7781", "99.2%"],
  ["Capacity", "2,500 L", "98.7%"],
  ["Pressure Rating", "18.5 bar", "97.4%"],
  ["Manufacturing Date", "03 / 2019", "99.1%"],
  ["Inspection Tag", "TAG-9104-B", "96.8%"],
];

const FINDINGS = [
  { dot: "#F0526B", text: "Surface corrosion — shell weld seam", status: "MODERATE", tone: "#F0526B" },
  { dot: "#E8A33D", text: "Inspection seal missing — relief valve", status: "FLAGGED", tone: "#E8A33D" },
  { dot: "#2FBF71", text: "Pressure gauge legible, within range", status: "PASS", tone: BRAND.green },
  { dot: "#2FBF71", text: "Mounting bracket and anchors intact", status: "PASS", tone: BRAND.green },
];

const box = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.45, ease: ENTRANCE } },
};

function Panel({ children, className = "", gradient = false }) {
  return (
    <div
      className={`rounded-[14px] border border-white/10 ${className}`}
      style={{ background: gradient ? "linear-gradient(180deg, #14181B 0%, #101315 100%)" : "#101315" }}
    >
      {children}
    </div>
  );
}

function VisionEngine() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="bg-[#0B0D0F] px-5 pt-10 pb-6 sm:px-8 md:px-12 lg:px-[75px] lg:pt-14 lg:pb-8">
      <div className="mx-auto w-full max-w-[1290px]">
        <SectionIntro
          tone="dark"
          eyebrow="02 — See · AI Vision Inspection Engine"
          title="AI That Understands Physical Assets"
          description="SCIO evaluates a multi-image payload with Vision Language Models — classifying the asset, checking component integrity, detecting surface defects, and reading the physical tag with OCR."
        />

        <motion.ul
          className="mt-10 flex flex-wrap gap-2.5"
          variants={stagger(0.05)}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT}
        >
          {CHIPS.map((chip) => (
            <motion.li
              key={chip}
              variants={fadeUp}
              className="rounded-full border px-3.5 py-2 font-sico-mono text-[11.5px] uppercase tracking-[0.1em] sm:text-[12.5px]"
              style={{ borderColor: `${BRAND.green}59`, color: BRAND.green }}
            >
              {chip}
            </motion.li>
          ))}
        </motion.ul>

        <div className="mt-8 grid gap-5 lg:grid-cols-[662.54fr_613.46fr]">
          {/* ── Annotated inspection frame ─────────────────────────── */}
          <motion.div
            variants={fadeRight}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT}
            className="relative h-full overflow-hidden rounded-2xl border border-white/10 bg-[#101315]"
          >
            <div className="relative h-full w-full min-h-[360px] sm:min-h-[440px] lg:min-h-full aspect-[4/3] sm:aspect-[662/566] lg:aspect-auto">
              <Image
                src="/Product/Pressure_container.png"
                alt="Industrial pressure vessel, annotated by the SCIO vision engine"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              {/* Flat tint over the photo, per spec's layered background. */}
              <div className="absolute inset-0" style={{ background: "rgba(0,0,0,.25)" }} />

              {/* Scan sweep — the visual cue that the frame is being processed
                  right now. Suppressed under reduced-motion. */}
              {!shouldReduceMotion && (
                <motion.span
                  className="pointer-events-none absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-[#2FBF71]/20 to-transparent"
                  initial={{ top: "-15%" }}
                  animate={{ top: "105%" }}
                  transition={{ duration: 3.4, ease: "linear", repeat: Infinity, repeatDelay: 1.2 }}
                  aria-hidden="true"
                />
              )}

              <motion.span
                variants={box}
                className="absolute left-[17px] top-[17px] flex items-center gap-[7px] rounded-[7px] px-2.5 py-1.5 backdrop-blur-[4px]"
                style={{
                  background: "rgba(11,13,15,.72)",
                  border: "1px solid rgba(255,255,255,.14)",
                }}
              >
                <span className="h-[5px] w-[5px] shrink-0 animate-pulse-soft rounded-full bg-[#8B5CF6]" />
                <span
                  className="whitespace-nowrap"
                  style={{ ...MONO, fontSize: T.monoLabel, letterSpacing: "1.33px", color: "#FFFFFF" }}
                >
                  ANALYZING · 5 IMAGES
                </span>
              </motion.span>

              {DETECTIONS.map((det) => (
                <motion.span
                  key={det.label}
                  variants={box}
                  className="absolute rounded"
                  style={{
                    ...det.box,
                    border: `1px ${det.dashed ? "dashed" : "solid"} ${det.color}`,
                    boxShadow: det.glow ? `0 0 0 1px rgba(11,13,15,.5), 0 0 24px ${det.glow}` : undefined,
                  }}
                >
                  <span
                    className={`absolute left-0 whitespace-nowrap rounded px-[7px] py-[3px] ${
                      det.labelPos === "above" ? "-top-[21px]" : "-bottom-[21px]"
                    }`}
                    style={{
                      ...MONO,
                      background: det.color,
                      color: det.labelText,
                      fontSize: T.monoMicro,
                      letterSpacing: ".95px",
                    }}
                  >
                    {det.label}
                  </span>
                </motion.span>
              ))}

              {/* Metadata overlay — bottom-left inside the photo, not a
                  separate footer bar beneath it. */}
              <div className="absolute bottom-[17px] left-[17px] right-[17px] flex flex-wrap items-center gap-x-2.5 gap-y-1">
                {["VLM-INSPECT · MODEL v4.2", "GPS 19.0760 N · 72.8777 E", "27 JUL 2026 · 02:56 PM"].map(
                  (item, index, arr) => (
                    <React.Fragment key={item}>
                      <span
                        className="whitespace-nowrap"
                        style={{ ...MONO, fontSize: T.monoMicro, letterSpacing: "1.14px", color: "#FFFFFF" }}
                      >
                        {item}
                      </span>
                      {index < arr.length - 1 && (
                        <span className="h-[3px] w-[3px] shrink-0 rounded-full bg-[#4E5661]" />
                      )}
                    </React.Fragment>
                  ),
                )}
              </div>
            </div>
          </motion.div>

          {/* ── Extraction panels ──────────────────────────────────── */}
          <motion.div
            className="flex flex-col gap-3"
            variants={stagger(0.12, 0.15)}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT}
          >
            <motion.div variants={fadeLeft}>
              <Panel gradient className="flex flex-col gap-3 px-5 py-[18px]">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span
                    className="uppercase"
                    style={{ ...MONO, fontSize: "12px", letterSpacing: "1.52px", color: BRAND.green }}
                  >
                    Asset Identified
                  </span>
                  <span
                    className="flex items-center gap-1.5 rounded-md px-[9px] py-1"
                    style={{
                      background: "rgba(232,163,61,.13)",
                      border: "1px solid rgba(232,163,61,.3)",
                    }}
                  >
                    <span className="h-[5px] w-[5px] shrink-0 rounded-full bg-[#E8A33D]" />
                    <span
                      className="whitespace-nowrap"
                      style={{ ...MONO, fontSize: T.monoMicro, lineHeight: "14px", color: "#E8A33D" }}
                    >
                      ATTENTION REQUIRED
                    </span>
                  </span>
                </div>

                <p style={{ ...SANS, fontWeight: 500, fontSize: "26px", lineHeight: "34px", letterSpacing: "-.65px", color: "#F5F3F0" }}>
                  Pressure Vessel
                </p>

                <dl className="grid grid-cols-3 gap-3.5 pt-1.5" style={{ borderTop: "1px solid rgba(255,255,255,.08)" }}>
                  {[
                    ["SERIAL", "PV-204-7781", "#E8E6E3"],
                    ["ZONE", "03-B", "#E8E6E3"],
                    ["CONFIDENCE", "98.4%", BRAND.green],
                  ].map(([term, value, tone]) => (
                    <div key={term} className="flex flex-col gap-1">
                      <dt style={{ ...MONO, fontWeight: 500, fontSize: "12px", letterSpacing: "1.14px", color: "#6F7783" }}>
                        {term}
                      </dt>
                      <dd style={{ ...MONO, fontSize: "13px", color: tone }}>{value}</dd>
                    </div>
                  ))}
                </dl>
              </Panel>
            </motion.div>

            <motion.div variants={fadeLeft}>
              <Panel>
                <div className="flex items-center gap-2 px-4 py-3">
                  <span
                    className="uppercase"
                    style={{ ...MONO, fontSize: "12px", letterSpacing: "1.52px", color: BRAND.green }}
                  >
                    OCR Tag Extraction
                  </span>
                  <span
                    className="ml-auto"
                    style={{ ...MONO, fontSize: "12px", color: BRAND.green }}
                  >
                    5 / 5 FIELDS
                  </span>
                </div>
                {OCR_FIELDS.map(([field, value, confidence], index) => (
                  <div
                    key={field}
                    className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_54px] items-center gap-2.5 px-4 py-2.5"
                    style={{
                      borderTop: index === 0 ? "1px solid rgba(255,255,255,.08)" : undefined,
                      borderBottom: "1px solid rgba(255,255,255,.06)",
                    }}
                  >
                    <span className="truncate" style={{ ...SANS, fontWeight: 500, fontSize: "14px", color: "#FFFFFF" }}>
                      {field}
                    </span>
                    <span className="truncate" style={{ ...MONO, fontSize: "14px", color: "#E8E6E3" }}>
                      {value}
                    </span>
                    <span className="text-right" style={{ ...MONO, fontSize: "14px", color: BRAND.green }}>
                      {confidence}
                    </span>
                  </div>
                ))}
              </Panel>
            </motion.div>

            <motion.div variants={fadeLeft}>
              <Panel className="flex flex-col gap-3.5 px-4 pb-4 pt-[23px]">
                <span
                  className="uppercase"
                  style={{ ...MONO, fontSize: "12px", letterSpacing: "1.52px", color: BRAND.green }}
                >
                  Component &amp; Defect Findings
                </span>
                <ul className="flex flex-col gap-3">
                  {FINDINGS.map((finding) => (
                    <li key={finding.text} className="flex items-center gap-2.5">
                      <span
                        className="h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ background: finding.dot }}
                      />
                      <span
                        className="min-w-0 flex-1 truncate"
                        style={{ ...SANS, fontSize: "14px", color: "#E8E6E3" }}
                      >
                        {finding.text}
                      </span>
                      <span
                        className="shrink-0"
                        style={{ ...MONO, fontSize: "14px", color: finding.tone }}
                      >
                        {finding.status}
                      </span>
                    </li>
                  ))}
                </ul>
              </Panel>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default VisionEngine;
