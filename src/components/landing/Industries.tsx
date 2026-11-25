"use client";

import React, { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { SITE_SHELL } from "../site/SiteLayout";
import { Eyebrow, SectionHeading, reveal } from "../site/blocks";

/*
 * "Built for how your industry runs": four photo panels. On desktop they sit side by side and the one you
 * hover (or focus, or tap) opens wide to show what SCIO does for that industry; the others stay as slim
 * strips with a vertical name. On tablets and phones they stack as full cards.
 * Photos: Pexels (free for commercial use). FMCG 18631424, Logistics 28185416, Manufacturing 19233057;
 * Retail 15491784 (supermarket aisle).
 */
const INDUSTRIES = [
  {
    name: "Retail",
    line: "Every store, till and shelf in one view.",
    chips: ["Store stock", "POS sales", "Replenishment"],
    src: "/images/industry-retail.webp",
    alt: "A well-lit supermarket aisle with stocked shelves",
    pos: "50% 55%",
  },
  {
    name: "FMCG",
    line: "Fast-moving stock, batches and distributors under control.",
    chips: ["Batch and expiry", "Distributor orders", "Demand swings"],
    src: "/images/industry-fmcg.webp",
    alt: "Bottled water moving along a factory conveyor",
    pos: "55% 55%",
  },
  {
    name: "Logistics",
    line: "Shipments, fleet and warehouse flow without the guesswork.",
    chips: ["Shipments", "Fleet", "Warehouse flow"],
    src: "/images/industry-logistics.webp",
    alt: "Rows of shipping containers in a cargo yard",
    pos: "50% 60%",
  },
  {
    name: "Manufacturing",
    line: "Plants, materials and production plans connected.",
    chips: ["Materials", "Production plans", "Supplier delays"],
    src: "/images/industry-manufacturing.webp",
    alt: "Robotic arms assembling a car on a factory floor",
    pos: "50% 50%",
  },
];

export default function Industries() {
  const still = useReducedMotion();
  const [active, setActive] = useState(0);

  return (
    <section id="industries" className="relative overflow-hidden bg-white" aria-labelledby="industries-heading">
      {/* soft gold wash behind the panels */}
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-[55%] h-[420px] w-[820px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(242,169,59,0.16),transparent)]" />
      <div className={`${SITE_SHELL} relative py-16 sm:py-24`}>
        <motion.div {...reveal} className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <Eyebrow>Industries</Eyebrow>
          <SectionHeading id="industries-heading" className="mt-4">
            Built for how your industry runs.
          </SectionHeading>
          <p className="mt-5 max-w-[40rem] text-balance text-[17px] leading-relaxed text-[#4a4843] sm:text-[18px]">
            The same operating system, set up for retail, FMCG, logistics and manufacturing teams. Pick yours.
          </p>
        </motion.div>

        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:flex lg:h-[460px] lg:gap-3 sm:mt-16">
          {INDUSTRIES.map((it, i) => {
            const open = active === i;
            return (
              <motion.li
                key={it.name}
                initial={still ? false : { opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                onMouseEnter={() => setActive(i)}
                className={`theme-fixed group relative isolate aspect-[4/5] overflow-hidden rounded-[28px] bg-[#111113] shadow-[0_26px_56px_-30px_rgba(17,17,19,0.6)] transition-[flex-grow] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] sm:aspect-[4/3] lg:aspect-auto lg:flex-1 ${open ? "lg:grow-[3.2]" : "lg:grow-[0.9]"}`}
              >
                <button
                  type="button"
                  onClick={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  aria-expanded={open}
                  aria-label={`${it.name}: ${it.line}`}
                  className="absolute inset-0 z-10 cursor-pointer rounded-[28px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2A93B] focus-visible:ring-offset-2"
                />
                <img
                  src={it.src}
                  alt={it.alt}
                  loading="lazy"
                  decoding="async"
                  className={`absolute inset-0 -z-10 h-full w-full object-cover transition-transform duration-[1200ms] ease-out ${open ? "scale-100" : "lg:scale-110"} group-hover:scale-[1.04]`}
                  style={{ objectPosition: it.pos }}
                />
                <div aria-hidden="true" className={`absolute inset-0 -z-10 bg-gradient-to-t from-black/90 via-black/30 to-black/10 transition-opacity duration-500 ${open ? "opacity-100" : "lg:opacity-100"}`} />
                {/* Slim strips on desktop darken a little more so the vertical name reads */}
                <div aria-hidden="true" className={`absolute inset-0 -z-10 hidden bg-black/30 transition-opacity duration-500 lg:block ${open ? "opacity-0" : "opacity-100"}`} />

                {/* number, top left */}
                <span className="absolute left-5 top-5 text-[13px] font-semibold tracking-[0.2em] text-[#F2A93B]">{String(i + 1).padStart(2, "0")}</span>

                {/* vertical name on the slim desktop strips */}
                <span
                  aria-hidden="true"
                  className={`absolute bottom-6 left-1/2 hidden -translate-x-1/2 text-[22px] font-semibold tracking-tight text-white transition-opacity duration-300 [writing-mode:vertical-rl] [text-orientation:mixed] rotate-180 lg:block ${open ? "opacity-0" : "opacity-100 delay-300"}`}
                >
                  {it.name}
                </span>

                {/* the open panel's content (always shown below lg) */}
                <div className={`absolute inset-x-0 bottom-0 z-20 p-5 transition-all duration-500 sm:p-6 lg:p-7 ${open ? "lg:translate-y-0 lg:opacity-100 lg:delay-300" : "lg:pointer-events-none lg:translate-y-3 lg:opacity-0"}`}>
                  <span aria-hidden="true" className="mb-3 block h-[3px] w-10 rounded-full bg-[#F2A93B]" />
                  <h3 className="text-[26px] font-semibold tracking-tight text-white sm:text-[30px]">{it.name}</h3>
                  <p className="mt-1.5 max-w-[26rem] text-[15px] leading-snug text-white/85 sm:text-[16px]">{it.line}</p>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {it.chips.map((c) => (
                      <li key={c} className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[12.5px] font-medium text-white backdrop-blur-sm">
                        {c}
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/contact"
                    className="relative z-20 mt-5 inline-flex items-center text-[14.5px] font-semibold text-[#F2A93B] underline-offset-4 transition-colors hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2A93B]"
                  >
                    Book a demo for {it.name}
                  </Link>
                </div>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
