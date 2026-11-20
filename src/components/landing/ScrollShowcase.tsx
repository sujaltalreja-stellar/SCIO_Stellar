"use client";

import React, { useRef, useState } from "react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { SITE_SHELL } from "../site/SiteLayout";
import { Eyebrow } from "../site/blocks";

// Hotspots on the real Command Center screenshot (x/y as % of the image).
const POINTS = [
  { x: 70, y: 23, title: "Live sales vs target", body: "Today's sales across every store and channel, updated as the POS syncs." },
  { x: 91, y: 26, title: "One health score", body: "Stock, sales, suppliers and losses rolled into a single number you can track." },
  { x: 72, y: 56, title: "Stockout risk, before it happens", body: "Products about to run out, by store, with the sales at stake." },
  { x: 23, y: 80, title: "Supplier delays", body: "Overdue purchase orders flagged automatically, so you can chase them early." },
  { x: 8, y: 80, title: "Every system connected", body: "ERP, POS, WMS, CRM and more feed one picture. Nothing is re-entered." },
];

const START = 0.22; // when the first callout appears
const STEP = 0.13; // scroll distance between callouts

function Hotspot({ i, progress, still }: { i: number; progress: MotionValue<number>; still: boolean }) {
  const p = POINTS[i];
  const s = START + i * STEP;
  const last = i === POINTS.length - 1;
  const opacity = useTransform(progress, [s, s + 0.04], [0, 1]);
  const scale = useTransform(progress, [s, s + 0.04], [0.6, 1]);
  // Only the current step shows its card; earlier steps keep just the dot.
  const cardOpacity = useTransform(progress, last ? [s, s + 0.04] : [s, s + 0.04, s + STEP - 0.02, s + STEP], last ? [0, 1] : [0, 1, 1, 0]);
  const cardY = useTransform(progress, [s, s + 0.04], [10, 0]);
  const cardLeft = p.x > 50;

  return (
    <motion.div
      className="absolute"
      style={{ left: `${p.x}%`, top: `${p.y}%`, opacity: still ? 1 : opacity, scale: still ? 1 : scale }}
    >
      <span className="relative -translate-x-1/2 -translate-y-1/2 flex h-5 w-5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#F2A93B] opacity-60" />
        <span className="relative inline-flex h-5 w-5 rounded-full border-[3px] border-white bg-[#F2A93B] shadow-md" />
      </span>
      <motion.div
        style={{ opacity: still ? 1 : cardOpacity, y: still ? 0 : cardY }}
        className={`hidden md:block absolute -top-6 w-[240px] z-10 rounded-xl bg-[#111113] p-4 text-left text-white shadow-2xl ${
          cardLeft ? "right-6" : "left-6"
        }`}
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#f2a93b]">{String(i + 1).padStart(2, "0")}</p>
        <p className="mt-1 text-[15px] font-semibold leading-snug">{p.title}</p>
        <p className="mt-1.5 text-[13px] leading-relaxed text-white/70">{p.body}</p>
      </motion.div>
    </motion.div>
  );
}

export default function ScrollShowcase() {
  const ref = useRef<HTMLElement>(null);
  const still = !!useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const scale = useTransform(scrollYProgress, [0, 0.2], [0.82, 1]);
  const rotateX = useTransform(scrollYProgress, [0, 0.2], [22, 0]);
  const y = useTransform(scrollYProgress, [0, 0.2], [60, 0]);
  const headOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0.35]);

  // Which callout is active (for the mobile caption under the screenshot).
  const [active, setActive] = useState(-1);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const idx = Math.min(POINTS.length - 1, Math.floor((v - START) / STEP));
    setActive(v < START ? -1 : idx);
  });

  return (
    <section id="command-center-tour" ref={ref} className="relative bg-white" style={{ height: still ? "auto" : "360vh" }} aria-labelledby="scroll-showcase-heading">
      <div className={`${still ? "" : "sticky top-[72px] h-[calc(100vh-72px)]"} flex flex-col items-center justify-center overflow-hidden py-6`}>
        <motion.div style={{ opacity: still ? 1 : headOpacity }} className={`${SITE_SHELL} text-center`}>
          <Eyebrow>Command Center</Eyebrow>
          <h2
            id="scroll-showcase-heading"
            className="mx-auto mt-3 max-w-3xl font-display font-bold text-[#111113] text-balance"
            style={{ fontSize: "clamp(28px, 3.6vw, 46px)", lineHeight: 1.08, letterSpacing: "-0.035em" }}
          >
            Your whole business, on one screen
          </h2>
        </motion.div>

        <div className="mt-8 w-full px-4 sm:px-8" style={{ perspective: 1400 }}>
          <motion.div
            style={still ? { maxWidth: 1080 } : { scale, rotateX, y, maxWidth: "min(1080px, calc((100vh - 72px - 230px) * 1.6))" }}
            className="relative mx-auto w-full origin-top"
          >
            <div className="overflow-hidden rounded-2xl border border-[#E7E5E1] bg-white shadow-[0_50px_120px_-40px_rgba(17,17,19,0.5)]">
              <div className="flex items-center gap-2 border-b border-[#EFEEEB] bg-[#F7F6F4] px-4 py-2.5" aria-hidden="true">
                <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
                <span className="ml-3 rounded-md bg-white px-3 py-0.5 text-[11px] text-[#8f8b84]">stellarscio.app/app/retail/command-center</span>
              </div>
              <div className="relative">
                <img
                  src="/images/scio-command-center-dashboard.webp"
                  alt="SCIO Command Center showing live sales against target, a retail health score, stockout risk, overstock, supplier delays and inventory losses"
                  width={2160}
                  height={1350}
                  loading="lazy"
                  className="block h-auto w-full"
                />
                {POINTS.map((_, i) => (
                  <Hotspot key={i} i={i} progress={scrollYProgress} still={still} />
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Caption: on phones the callout cards are hidden, so show the active one here. */}
        <div className="mt-8 min-h-[72px] px-6 text-center md:hidden" aria-live="polite">
          {active >= 0 && (
            <>
              <p className="text-[16px] font-semibold text-[#111113]">{POINTS[active].title}</p>
              <p className="mt-1 text-[14px] text-[#5D5A54]">{POINTS[active].body}</p>
            </>
          )}
        </div>
        {/* Progress dots */}
        {!still && (
          <div className="mt-4 flex gap-2" aria-hidden="true">
            {POINTS.map((_, i) => (
              <span key={i} className={`h-1.5 rounded-full transition-all ${i <= active ? "w-6 bg-[#F2A93B]" : "w-1.5 bg-[#D6D3CE]"}`} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
