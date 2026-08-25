"use client";

import React from "react";
import { motion } from "framer-motion";
import { BRAND, C, SHELL } from "./tokens";
import { VIEWPORT, fadeUp, stagger } from "./motion";

const MONO = { fontFamily: "var(--font-sico-mono), 'DM Mono', monospace" };
const SANS = { fontFamily: "'DM Sans', sans-serif" };

const ENVIRONMENTS = [
  "Global Manufacturing & Heavy Industry Facilities",
  "Energy, Oil & Gas Infrastructure & Pipelines",
  "Multi-Site Corporate & Commercial Real Estate Campuses",
  "High-Security Data Centers & Infrastructure Operations",
  "Logistics, Warehousing & Distribution Hubs",
];

/**
 * The five environment classes SICO is built for, built to the supplied Figma
 * spec: a blue monospace eyebrow trailed by a hairline, then a five-across row
 * of numbered cells hung off a top rule.
 *
 * The spec gives each cell a slightly different bottom padding (42.25px, except
 * the three-line third cell at 22px). That difference only exists because Figma
 * reports each cell's own content height — the row is `align-items: flex-start`
 * with equal-height columns, so a uniform 42px bottom padding renders the same
 * and avoids hard-coding one cell's line count.
 *
 * Reveals stagger left to right, matching the design source's 60ms cascade.
 */
function EnterpriseStrip() {
  return (
    <section className="py-6 sm:py-8">
      <div className={`${SHELL} flex flex-col items-start gap-[26px]`}>
        <motion.div
          className="w-full"
          variants={stagger(0.06)}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT}
        >
          <motion.div variants={fadeUp} className="flex w-full items-center gap-[17px]">
            <span
              style={{
                ...MONO,
                fontWeight: 500,
                fontSize: "14px",
                lineHeight: "18px",
                letterSpacing: "1.98px",
                color: BRAND.blue,
              }}
            >
              BUILT FOR SCALED ENTERPRISE ENVIRONMENTS
            </span>
            <span
              className="h-px min-w-[40px] flex-1"
              style={{ background: C.lineLight }}
              aria-hidden="true"
            />
          </motion.div>

          <div
            className="mt-[26px] grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-5"
            style={{ borderTop: `1px solid ${C.lineLight}` }}
          >
            {ENVIRONMENTS.map((label, index) => (
              <motion.div
                key={label}
                variants={fadeUp}
                className="flex flex-col items-start gap-3 border-b border-[#14110E]/[0.12] pb-7 pt-7 last:border-b-0 lg:border-b-0 lg:border-r lg:border-[#14110E]/[0.12] lg:px-[22px] lg:pb-[42px] lg:first:pl-0 lg:last:border-r-0 lg:last:pr-0"
              >
                <span
                  style={{
                    ...MONO,
                    fontWeight: 400,
                    fontSize: "20px",
                    lineHeight: "26px",
                    letterSpacing: "1px",
                    color: BRAND.blue,
                  }}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p
                  className="self-stretch"
                  style={{
                    ...SANS,
                    fontWeight: 500,
                    fontSize: "16px",
                    lineHeight: "20px",
                    color: C.ink,
                  }}
                >
                  {label}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default EnterpriseStrip;
