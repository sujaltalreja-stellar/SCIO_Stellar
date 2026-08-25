"use client";

import React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { BRAND, C, SHELL } from "./tokens";
import { ENTRANCE } from "./motion";
import OperationsDashboard from "./OperationsDashboard";

/**
 * Page opener, built to the hero's Figma spec.
 *
 * The eyebrow and the two CTAs deliberately use StellarMind's brand colours
 * rather than the design file's warm-grey/indigo treatment — royal blue for the
 * eyebrow, the blue vertical-gradient pill for the primary action and the green
 * hairline pill for the secondary. Those values come from the supplied Figma
 * measurements, not from the SICO design source, so they are declared here
 * rather than in `tokens.js` (which mirrors the design file).
 *
 * The design file also ships its own sticky site header; that is not reproduced
 * because this route already renders inside the global Navbar from
 * `src/app/layout.jsx`.
 *
 * The headline block animates on mount rather than on scroll — it is above the
 * fold at every viewport, so a `whileInView` trigger would leave it blank on
 * first paint.
 */
function SicoHero() {
  const shouldReduceMotion = useReducedMotion();
  const rise = (delay) =>
    shouldReduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 22 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.7, ease: ENTRANCE, delay },
        };

  return (
    <section id="top" className="relative pt-24 pb-6 sm:pt-28 sm:pb-8">
      {/* Outer column carries the spec's 25px rhythm between eyebrow, headline
          and the lead/CTA row. */}
      <div className={`${SHELL} flex flex-col items-start gap-[25px]`}>
        <motion.div {...rise(0)} className="flex w-full items-center gap-2.5">
          <span
            className="h-1.5 w-1.5 shrink-0"
            style={{ background: BRAND.blueDot, borderRadius: "3px" }}
          />
          <span
            className="uppercase"
            style={{
              fontFamily: "var(--font-sico-mono), 'DM Mono', monospace",
              fontWeight: 500,
              fontSize: "14px",
              lineHeight: "18px",
              letterSpacing: "1.98px",
              color: BRAND.blue,
            }}
          >
            SCIO Platform — Enterprise Operations OS
          </span>
        </motion.div>

        <motion.h1
          {...rise(0.1)}
          className="max-w-[1002px]"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 500,
            // 74px at full width, scales to ~26px at 320px.
            // Tracking stays -0.038em (em-relative) at every size.
            fontSize: "clamp(26px, 5.1vw + 8px, 74px)",
            lineHeight: 1.08,
            letterSpacing: "-.038em",
            color: C.ink,
            textWrap: "balance",
          }}
        >
          Unify Supply Chain Intelligence &amp; Field Inspection Operations in One Platform
        </motion.h1>

        <div className="flex w-full flex-col items-start justify-between gap-8 pt-[9px] lg:flex-row lg:items-end lg:gap-[150px]">
          <motion.p
            {...rise(0.2)}
            className="max-w-[745px]"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 400,
              /* 15px on small phones → 18px on desktop */
              fontSize: "clamp(15px, 1.3vw + 11px, 18px)",
              lineHeight: 1.65,
              color: C.inkBody,
              textWrap: "pretty",
            }}
          >
            Eliminate operational silos. SCIO bridges end-to-end supply chain planning, computer
            vision asset inspections, real-time field operations, and automated audit compliance
            delivering enterprise-grade control from executive dashboards to floor-level execution.
          </motion.p>

          <motion.div
            {...rise(0.3)}
            className="flex flex-wrap items-center gap-x-3 gap-y-3.5 lg:shrink-0"
          >
            <Link
              href="/contact"
              prefetch={false}
              className="inline-flex items-center rounded-full px-[26px] py-[15px] transition-transform duration-200 hover:-translate-y-px"
              style={{
                background: `linear-gradient(180deg, ${BRAND.primaryFrom} 0%, ${BRAND.primaryTo} 100%)`,
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 500,
                fontSize: "16px",
                lineHeight: "21px",
                color: BRAND.primaryLabel,
              }}
            >
              Request a Demo
            </Link>

            <Link
              href="#vision"
              prefetch={false}
              className="inline-flex items-center gap-2.5 rounded-full px-6 py-3.5 transition-colors duration-200"
              style={{
                boxSizing: "border-box",
                border: `1px solid ${BRAND.green}`,
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 500,
                fontSize: "16px",
                lineHeight: "21px",
                color: C.ink,
              }}
            >
              <span
                className="inline-block h-2 w-2 shrink-0"
                style={{ background: BRAND.green, borderRadius: "4px" }}
              />
              View Live AI Workflow
            </Link>
          </motion.div>
        </div>

        {/* Positioning strip — the client's own tagline, not from the Figma
            spec. Sits as a closing statement for the promise/CTA block above,
            right before the product proof (the dashboard) begins. The
            arrow-walked flow reuses the same visual language as the Digital
            Registry breadcrumb elsewhere on this page, so it doesn't
            introduce a new pattern. */}
        <motion.div
          {...rise(0.4)}
          className="mt-2 flex w-full flex-col items-start gap-4 border-t border-[#14110E]/[0.08] pt-7 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
        >
          <p className="max-w-[42ch]">
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: "15px", color: C.ink }}>
              SCIO doesn&apos;t replace your ERP.{" "}
            </span>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 400, fontSize: "15px", color: C.inkBody }}>
              It makes your existing supply-chain data intelligent and actionable.
            </span>
          </p>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {["CONNECT", "PREDICT", "DECIDE", "ACT"].map((step, index, arr) => (
              <span key={step} className="flex items-center gap-2">
                {index > 0 && (
                  <span style={{ color: C.inkGhost, fontSize: "13px" }} aria-hidden="true">
                    ⟶
                  </span>
                )}
                <span
                  style={{
                    fontFamily: "var(--font-sico-mono), 'DM Mono', monospace",
                    fontWeight: 500,
                    fontSize: "12px",
                    letterSpacing: "1.4px",
                    color: index === arr.length - 1 ? BRAND.green : BRAND.blue,
                  }}
                >
                  {step}
                </span>
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      <div className={`${SHELL} mt-10`}>
        <OperationsDashboard />
      </div>
    </section>
  );
}

export default SicoHero;
