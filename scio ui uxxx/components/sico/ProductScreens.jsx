"use client";

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import SectionIntro from "./SectionIntro";
import { ENTRANCE, VIEWPORT, fadeLeft, fadeRight, stagger } from "./motion";

/**
 * The six product surfaces. `render` draws a schematic of each screen from
 * primitives rather than embedding a bitmap: no production screenshots have
 * been supplied for this page yet, and a schematic that animates is both
 * honest about being a diagram and lighter than six large PNGs. Swap each
 * `render` for an <Image> once real captures exist.
 */

function Tile({ accent, label, value, className = "" }) {
  return (
    <div className={`rounded-lg border border-white/[0.07] bg-[#FFFDFA]/[0.03] p-3 ${className}`}>
      <span className="block h-[2px] w-5 rounded-full" style={{ background: accent }} />
      <p className="mt-2.5 text-[17px] font-semibold leading-none text-white">{value}</p>
      <p className="mt-1.5 text-[11px] text-white/40">{label}</p>
    </div>
  );
}

function BarRow({ label, percent, color = "#8B5CF6", delay = 0 }) {
  return (
    <div className="grid grid-cols-[52px_minmax(0,1fr)] items-center gap-2.5">
      <span className="truncate font-sico-mono text-[11px] text-white/35">{label}</span>
      <span className="h-1.5 overflow-hidden rounded-full bg-[#FFFDFA]/[0.06]">
        <motion.span
          className="block h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.8, ease: ENTRANCE, delay }}
        />
      </span>
    </div>
  );
}

function Line({ width, tone = "rgba(255,255,255,0.12)", height = 6 }) {
  return <span className="block rounded-full" style={{ width, height, background: tone }} />;
}

const SCREENS = [
  {
    title: "Dashboard",
    caption:
      "Enterprise fire safety compliance overview — asset totals, due windows and overdue exposure in one view.",
    render: () => (
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <Tile accent="#2FBF71" value="247" label="Assets tracked" />
          <Tile accent="#8B5CF6" value="88.3%" label="Compliance" />
          <Tile accent="#F0526B" value="37" label="Overdue" />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-2.5 rounded-lg border border-white/[0.07] bg-[#FFFDFA]/[0.02] p-3">
            {[72, 88, 54, 91].map((percent, index) => (
              <BarRow
                key={percent}
                label={`Zone ${index + 1}`}
                percent={percent}
                delay={index * 0.08}
              />
            ))}
          </div>
          <div className="space-y-2 rounded-lg border border-white/[0.07] bg-[#FFFDFA]/[0.02] p-3">
            {[1, 0.82, 0.64, 0.9, 0.72].map((scale, index) => (
              <Line key={index} width={`${scale * 100}%`} />
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Inspection",
    caption:
      "Guided capture on the mobile runtime — the technician shoots the asset, its tag and any visible damage as one payload.",
    render: () => (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1.1fr_1fr]">
        <div className="relative min-h-[140px] overflow-hidden rounded-lg border border-white/[0.07] bg-[#FFFDFA]/[0.04] sm:min-h-0">
          <span className="absolute left-2 top-2 rounded bg-[#0B0D0F]/70 px-1.5 py-0.5 font-sico-mono text-[11px] uppercase tracking-[0.1em] text-white/70">
            Capture 3 / 5
          </span>
          <span className="absolute left-[16%] top-[34%] h-[38%] w-[46%] rounded-[3px] border-[1.5px] border-[#2FBF71]" />
          <span className="absolute bottom-2 left-2 right-2 h-1 rounded-full bg-[#FFFDFA]/10" />
        </div>
        <div className="space-y-2 rounded-lg border border-white/[0.07] bg-[#FFFDFA]/[0.02] p-3">
          {["Wide frame", "Tag close-up", "Damage detail", "Gauge reading"].map((label, index) => (
            <span key={label} className="flex items-center gap-2">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: index < 3 ? "#2FBF71" : "rgba(255,255,255,0.15)" }}
              />
              <span className="text-[11px] text-white/55">{label}</span>
            </span>
          ))}
        </div>
      </div>
    ),
  },
  {
    title: "AI Processing",
    caption:
      "The vision engine runs classification, OCR and defect detection over the payload, streaming progress back to the field.",
    render: () => (
      <div className="rounded-lg border border-white/[0.07] bg-[#FFFDFA]/[0.02] p-4">
        <div className="space-y-2.5">
          {[
            ["Initializing VLM engine", "#2FBF71"],
            ["Extracting tag details", "#2FBF71"],
            ["Classifying asset type", "#A99BFF"],
            ["Scanning for defects", "rgba(255,255,255,0.15)"],
            ["Compiling report", "rgba(255,255,255,0.15)"],
          ].map(([label, tone]) => (
            <span key={label} className="flex items-center gap-2.5">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: tone }} />
              <span className="text-[11.5px] text-white/55">{label}</span>
            </span>
          ))}
        </div>
        <span className="mt-4 block h-1 overflow-hidden rounded-full bg-[#FFFDFA]/[0.08]">
          <motion.span
            className="block h-full rounded-full bg-[#8B5CF6]"
            initial={{ width: 0 }}
            animate={{ width: "60%" }}
            transition={{ duration: 1, ease: ENTRANCE }}
          />
        </span>
      </div>
    ),
  },
  {
    title: "Asset Registry",
    caption:
      "Every asset resolved to its place in the topology, with components, MRO parts and full inspection history attached.",
    render: () => (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr]">
        <div className="space-y-1.5">
          {["Building A", "Floor 03", "Zone 03-B", "Pump P-204", "Motor 22 kW"].map(
            (label, index) => (
              <div
                key={label}
                className={`rounded border px-2.5 py-2 text-[11px] ${
                  index === 3
                    ? "border-white/20 bg-[#FFFDFA]/[0.09] text-white"
                    : "border-white/[0.07] bg-[#FFFDFA]/[0.02] text-white/50"
                }`}
                style={{ marginLeft: index * 8 }}
              >
                {label}
              </div>
            ),
          )}
        </div>
        <div className="space-y-2 rounded-lg border border-white/[0.07] bg-[#FFFDFA]/[0.02] p-3">
          <Line width="70%" tone="rgba(255,255,255,0.25)" height={8} />
          <Line width="45%" />
          <div className="grid grid-cols-2 gap-2 pt-1.5">
            {["9", "14", "72%", "1"].map((value) => (
              <span key={value} className="text-[13px] font-semibold text-white/80">
                {value}
              </span>
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Operations Analytics",
    caption:
      "Zone-level compliance, inspection volume and model accuracy trends behind every headline number.",
    render: () => (
      <div className="space-y-2.5 rounded-lg border border-white/[0.07] bg-[#FFFDFA]/[0.02] p-4">
        {[
          ["Label OCR", 99, "#8B5CF6"],
          ["Defect Det.", 94, "#3FC8D8"],
          ["Block A", 96, "#2FBF71"],
          ["Basement", 55, "#F0526B"],
          ["Parking", 64, "#E8A33D"],
          ["Serial No.", 97, "#8B5CF6"],
        ].map(([label, percent, color], index) => (
          <BarRow
            key={label}
            label={label}
            percent={percent}
            color={color}
            delay={index * 0.07}
          />
        ))}
      </div>
    ),
  },
  {
    title: "Report Generation",
    caption:
      "Verified, photo-backed audit packages compiled in seconds and exported as a signed compliance PDF.",
    render: () => (
      <div className="rounded-lg border border-white/[0.07] bg-[#FFFDFA]/[0.04] p-4">
        <div className="flex items-center justify-between border-b border-white/[0.07] pb-2.5">
          <Line width="42%" tone="rgba(255,255,255,0.3)" height={8} />
          <span className="rounded bg-[#2FBF71]/15 px-1.5 py-0.5 font-sico-mono text-[11px] uppercase tracking-[0.1em] text-[#2FBF71]">
            Verified
          </span>
        </div>
        <div className="mt-3 flex gap-2">
          <span className="h-11 w-11 shrink-0 rounded border border-white/[0.1] bg-[#FFFDFA]/[0.06]" />
          <span className="h-11 w-11 shrink-0 rounded border border-white/[0.1] bg-[#FFFDFA]/[0.06]" />
          <div className="min-w-0 flex-1 space-y-1.5 pt-1">
            <Line width="90%" />
            <Line width="72%" />
            <Line width="58%" />
          </div>
        </div>
        <div className="mt-3 space-y-1.5 border-t border-white/[0.07] pt-3">
          {["96%", "98%", "91%", "99%"].map((value, index) => (
            <div key={value} className="flex items-center justify-between gap-3">
              <Line width={`${58 - index * 6}%`} />
              <span className="font-sico-mono text-[11px] text-[#2FBF71]">{value}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

const ADVANCE_MS = 4200;

function ProductScreens() {
  const shouldReduceMotion = useReducedMotion();
  const ref = useRef(null);
  const inView = useInView(ref, { amount: 0.35 });
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (shouldReduceMotion || !inView) return undefined;
    const id = setInterval(() => setActive((i) => (i + 1) % SCREENS.length), ADVANCE_MS);
    return () => clearInterval(id);
  }, [shouldReduceMotion, inView]);

  const screen = SCREENS[active];

  return (
    <section className="bg-[#0B0D0F] px-5 pt-6 pb-10 sm:px-8 md:px-12 lg:px-[75px] lg:pt-8 lg:pb-14">
      <div className="mx-auto w-full max-w-[1290px]" ref={ref}>
        <SectionIntro tone="dark" eyebrow="07 — The Actual Product" />

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.7fr] lg:gap-12">
          {/* ── Screen index ───────────────────────────────────────── */}
          <motion.div
            variants={stagger(0.06)}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT}
          >
            <motion.h2 variants={fadeRight} className="text-display-sm font-semibold text-white">
              Six screens, one operating system
            </motion.h2>

            <ul className="mt-7 space-y-0.5">
              {SCREENS.map((item, index) => {
                const isActive = index === active;
                return (
                  <motion.li key={item.title} variants={fadeRight}>
                    <button
                      type="button"
                      onClick={() => setActive(index)}
                      aria-pressed={isActive}
                      className={`flex w-full items-center gap-3 border-l-2 py-2.5 pl-4 text-left transition-colors duration-300 ease-entrance ${
                        isActive
                          ? "border-[#8B5CF6] text-white"
                          : "border-white/[0.1] text-white/40 hover:text-white/70"
                      }`}
                    >
                      <span className="font-sico-mono text-[11.5px] opacity-70">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="text-[14px] font-medium">{item.title}</span>
                    </button>
                  </motion.li>
                );
              })}
            </ul>

            <AnimatePresence mode="wait">
              <motion.p
                key={screen.title}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3, ease: ENTRANCE }}
                className="mt-7 max-w-measure-sm text-[13px] leading-relaxed text-white/45"
              >
                {screen.caption}
              </motion.p>
            </AnimatePresence>
          </motion.div>

          {/* ── Screen frame ───────────────────────────────────────── */}
          <motion.div
            variants={fadeLeft}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT}
            className="overflow-hidden rounded-xl border border-white/[0.07] bg-[#101315]"
          >
            <div className="flex items-center gap-2 border-b border-white/[0.07] px-4 py-2.5">
              <span className="h-2 w-2 rounded-full bg-[#FFFDFA]/15" />
              <span className="h-2 w-2 rounded-full bg-[#FFFDFA]/15" />
              <span className="h-2 w-2 rounded-full bg-[#FFFDFA]/15" />
              <span className="ml-2 font-sico-mono text-[11px] uppercase tracking-[0.12em] text-white/35">
                SCIO · {screen.title}
              </span>
            </div>

            <div className="p-4 sm:p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={screen.title}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35, ease: ENTRANCE }}
                  className="min-h-[248px]"
                >
                  {screen.render()}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex items-center justify-between border-t border-white/[0.07] px-4 py-2.5">
              <span className="font-sico-mono text-[11px] uppercase tracking-[0.12em] text-white/40">
                {String(active + 1).padStart(2, "0")} / 06 &nbsp;·&nbsp; {screen.title}
              </span>
              <span className="font-sico-mono text-[11px] uppercase tracking-[0.12em] text-white/25">
                Click to advance
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default ProductScreens;
