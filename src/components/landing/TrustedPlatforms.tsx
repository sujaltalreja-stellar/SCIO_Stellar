"use client";

import React from "react";
import { SITE_SHELL } from "../site/SiteLayout";

/*
 * "Built on the platforms you already trust" — an auto-scrolling strip of the
 * official brand logos (public/logos), shown in full colour.
 *
 * Sources: simple-icons (ClickHouse, Databricks, OpenAI, Oracle, Snowflake) and
 * svgl.app (IBM, Salesforce, Google Cloud, Azure, AWS).
 */

type Logo = {
  name: string;
  src: string;
  /** Brand name shown beside icon-only marks; omitted for full wordmarks. */
  label?: string;
  /** Tailwind height class for the image, tuned per mark so they read at equal weight. */
  h: string;
};

const LOGOS: Logo[] = [
  { name: "ClickHouse", src: "/logos/clickhouse.svg", label: "ClickHouse", h: "h-6" },
  { name: "OpenAI", src: "/logos/openai-icon.svg", label: "OpenAI", h: "h-7" },
  { name: "IBM Cloud", src: "/logos/ibm.svg", label: "Cloud", h: "h-7" },
  { name: "Oracle", src: "/logos/oracle.svg", label: "ORACLE", h: "h-8" },
  { name: "Salesforce", src: "/logos/salesforce.svg", h: "h-11" },
  { name: "Google Cloud", src: "/logos/google-cloud.svg", label: "Google Cloud", h: "h-8" },
  { name: "Microsoft Azure", src: "/logos/azure.svg", label: "Azure", h: "h-8" },
  { name: "AWS", src: "/logos/aws.svg", h: "h-9" },
  { name: "Snowflake", src: "/logos/snowflake.svg", label: "snowflake", h: "h-8" },
  { name: "Databricks", src: "/logos/partners/databricks.svg", label: "databricks", h: "h-7" },
];

function LogoItem({ logo, hidden = false }: { logo: Logo; hidden?: boolean }) {
  return (
    <li
      aria-hidden={hidden || undefined}
      className="group/logo shrink-0 px-7 sm:px-10 flex items-center gap-2.5 h-12 transition-transform duration-300 hover:scale-105"
    >
      <img
        src={logo.src}
        alt={hidden || logo.label ? "" : logo.name}
        decoding="async"
        draggable={false}
        className={`scio-platform-logo ${logo.h} w-auto select-none`}
      />
      {logo.label && (
        <span
          className={`whitespace-nowrap text-[#111113] text-[20px] leading-none ${
            logo.label === "ORACLE" ? "font-semibold tracking-[0.14em]" : "font-semibold tracking-tight"
          }`}
        >
          {logo.label}
        </span>
      )}
    </li>
  );
}

export default function TrustedPlatforms() {
  return (
    <section aria-labelledby="trusted-platforms-title" className="bg-white border-t border-[#E7E5E1]">
      <div className={`${SITE_SHELL} py-16 sm:py-20`}>
        <h2
          id="trusted-platforms-title"
          className="text-center text-[20px] sm:text-[24px] font-light tracking-tight text-[#4a4843]"
        >
          Built on the platforms you already trust
        </h2>

        <div
          className="group relative mt-10 sm:mt-12 overflow-hidden"
          style={{
            maskImage: "linear-gradient(to right, transparent, #000 10%, #000 90%, transparent)",
            WebkitMaskImage: "linear-gradient(to right, transparent, #000 10%, #000 90%, transparent)",
          }}
        >
          <ul className="flex w-max items-center animate-[scio-marquee_45s_linear_infinite] group-hover:[animation-play-state:paused]">
            {LOGOS.map((l) => (
              <LogoItem key={l.name} logo={l} />
            ))}
            {/* duplicate set for a seamless loop; hidden from assistive tech */}
            {LOGOS.map((l) => (
              <LogoItem key={`${l.name}-dup`} logo={l} hidden />
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
