"use client";

import React from "react";
import { motion } from "framer-motion";
import { BRAND, C } from "./tokens";
import { VIEWPORT, fadeUp, stagger } from "./motion";

/**
 * The header block every numbered section in the design opens with: a
 * monospace eyebrow ("01 — THE OPERATING LOOP"), then a 1.25fr/1fr row holding
 * the headline against a supporting paragraph, baseline-aligned at the bottom.
 *
 * Eyebrow colour follows the page's brand two-tone system rather than the
 * design source's per-section palette (which used `inkFaint` on light bands
 * and a muted warm grey — later violet — on dark ones): light-section
 * eyebrows are brand blue, dark-section eyebrows are brand green, matching
 * the hero's blue eyebrow / green secondary-CTA marker pairing. Headline
 * colour still follows the design source (near-black on light, `chalk` on
 * dark).
 *
 * Type is the literal Figma spec shared by every numbered section (confirmed
 * against Operating Loop, Digital Registry and Supply Chain & Field
 * Operations, all identical): eyebrow DM Mono 500 14px/18px, letter-spacing
 * 1.98px; headline DM Sans 500, letter-spacing -1.96px, landing on 56px/58px
 * at desktop; lead paragraph DM Sans 400 18px/26px. The headline's fontSize
 * still clamps down on narrow viewports (the spec is a fixed desktop value)
 * so it doesn't overflow small screens.
 */
function SectionIntro({
  eyebrow,
  title,
  description,
  tone = "light",
  rule = false,
  className = "",
}) {
  const dark = tone === "dark";

  return (
    <motion.div
      className={className}
      variants={stagger(0.09)}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
    >
      <motion.div variants={fadeUp} className="flex items-baseline gap-4">
        <span
          className="uppercase"
          style={{
            fontFamily: "var(--font-sico-mono), 'DM Mono', monospace",
            fontWeight: 500,
            fontSize: "14px",
            lineHeight: "18px",
            letterSpacing: "1.98px",
            color: dark ? BRAND.green : BRAND.blue,
          }}
        >
          {eyebrow}
        </span>
        {rule && (
          <span
            className="h-px min-w-[40px] flex-1"
            style={{ background: dark ? "rgba(255,255,255,.12)" : C.lineLight }}
            aria-hidden="true"
          />
        )}
      </motion.div>

      {(title || description) && (
        <div className="mt-6 grid items-end gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:gap-12">
          {title && (
            <motion.h2
              variants={fadeUp}
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "clamp(28px, 4.6vw, 56px)",
                fontWeight: 500,
                /* em-based so tracking scales with the clamped font size.
                   -0.038em ≈ -1.96px at the 52px desktop rendering; at the
                   28px mobile floor it becomes -1.06px — intentional, not tight. */
                letterSpacing: "-0.038em",
                lineHeight: 1.036,
                textWrap: "balance",
                color: dark ? C.chalk : C.ink,
              }}
            >
              {title}
            </motion.h2>
          )}
          {description && (
            <motion.p
              variants={fadeUp}
              className="max-w-[52ch]"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                /* 15px on small phones → 18px on desktop */
                fontSize: "clamp(15px, 1.3vw + 11px, 18px)",
                lineHeight: "1.6",
                color: dark ? C.slate400 : C.inkMuted,
                textWrap: "pretty",
              }}
            >
              {description}
            </motion.p>
          )}
        </div>
      )}
    </motion.div>
  );
}

export default SectionIntro;
