"use client";

import React from "react";
import { SITE_SHELL } from "../site/SiteLayout";

/*
 * "Backed by leading AI and cloud partners": an auto-scrolling strip right under the hero,
 * styled like the "Built on the platforms you already trust" strip near the bottom of the page. Partners: OpenAI,
 * Databricks, AWS, NVIDIA (Inception) and Sarvam AI (Startup Program), all in full colour. NVIDIA and Sarvam use
 * colour versions made for the light page (public/logos/partners/*-color.png); on the dark theme the
 * .scio-partner-mono class turns them white.
 */
type Partner = {
  name: string;
  src: string;
  /** Brand name shown beside an icon-only mark. */
  label?: string;
  /** Height class, tuned per mark so they read at equal weight. */
  h: string;
  /** "mono": white source file, shown dark on the light page. "icon": dark source file. */
  kind?: "mono" | "color";
};

const BASE: Partner[] = [
  { name: "OpenAI Select Partner", src: "/logos/openai-icon.svg", label: "OpenAI", h: "h-7" },
  { name: "Databricks", src: "/logos/partners/databricks.svg", label: "databricks", h: "h-7" },
  { name: "AWS Partner", src: "/logos/aws.svg", h: "h-9" },
  { name: "NVIDIA Inception", src: "/logos/partners/nvidia-original.svg", h: "h-12", kind: "mono" },
  { name: "Sarvam AI Startup Program", src: "/logos/partners/sarvam-color.svg", h: "h-5", kind: "mono" },
];

/* Only a few logos, so repeat them to make each half of the loop wider than any screen (no gap at the end). */
const PARTNERS: Partner[] = [...BASE, ...BASE, ...BASE];

function Item({ p, hidden = false }: { p: Partner; hidden?: boolean }) {
  return (
    <li
      aria-hidden={hidden || undefined}
      className="shrink-0 px-7 sm:px-10 flex items-center gap-2.5 h-12 transition-transform duration-300 hover:scale-105"
    >
      <img
        src={p.src}
        alt={hidden || p.label ? "" : p.name}
        title={p.name}
        decoding="async"
        draggable={false}
        className={`${p.kind === "mono" ? "scio-partner-mono" : "scio-platform-logo"} ${p.h} w-auto select-none`}
      />
      {p.label && <span className="whitespace-nowrap text-[#111113] text-[20px] font-semibold leading-none tracking-tight">{p.label}</span>}
    </li>
  );
}

export default function PartnerStrip() {
  return (
    <section aria-labelledby="partner-strip-title" className="bg-white">
      <div className={`${SITE_SHELL} py-14 sm:py-16`}>
        <h2 id="partner-strip-title" className="text-center text-[20px] sm:text-[24px] font-light tracking-tight text-[#4a4843]">
          Backed by leading AI and cloud partners
        </h2>
        <div
          className="group relative mt-9 sm:mt-10 overflow-hidden"
          style={{
            maskImage: "linear-gradient(to right, transparent, #000 10%, #000 90%, transparent)",
            WebkitMaskImage: "linear-gradient(to right, transparent, #000 10%, #000 90%, transparent)",
          }}
        >
          <ul className="flex w-max items-center animate-[scio-marquee_40s_linear_infinite] group-hover:[animation-play-state:paused]">
            {PARTNERS.map((p, i) => (
              <Item key={`${p.name}-${i}`} p={p} hidden={i >= BASE.length} />
            ))}
            {PARTNERS.map((p, i) => (
              <Item key={`${p.name}-dup-${i}`} p={p} hidden />
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
