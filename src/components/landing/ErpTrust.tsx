"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeftRight, Code2, ShieldCheck } from "lucide-react";
import { SITE_SHELL } from "../site/SiteLayout";
import { useSite } from "../site/SiteContext";
import { Eyebrow, PrimaryButton, SectionHeading, reveal } from "../site/blocks";
import { StellarScioMark, StellarScioWordmark } from "../site/StellarScioLogo";

/*
 * "Your ERP stays. SCIO plugs into it." — trust section for enterprise buyers.
 *
 * Shows the ERP and planning systems SCIO connects to, with our developers building the connection.
 * Logos (public/logos) are the companies' own marks, not redrawn:
 *   SAP, Oracle ........ simple-icons
 *   Dynamics 365, Kinaxis  Wikimedia Commons (official logo files)
 *   Blue Yonder ........ blueyonder.com media library (logo-blue.png)
 *   o9 Solutions ....... o9solutions.com (o9-Logo.svg is the "o9" mark only, so the name sits beside it)
 * All are registered trademarks of their owners; the section footnote says so.
 */

type Sys = {
  name: string;
  /** Official logo file in /public/logos. Leave out to show the name as text. */
  logo?: string;
  /** Tailwind size classes for the logo image, tuned per mark so they all read at equal weight. */
  cls?: string;
  /** Brand name shown beside an icon-only mark. */
  label?: string;
  /** Style for that label. */
  labelCls?: string;
};

const SPACED = "text-[18px] font-semibold tracking-[0.14em]";
const PLAIN = "text-[20px] font-semibold tracking-tight";

export const ERP: Sys[] = [
  { name: "SAP", logo: "/logos/sap.svg", cls: "h-10 w-auto" },
  { name: "Oracle", logo: "/logos/oracle.svg", cls: "h-7 w-auto", label: "ORACLE", labelCls: SPACED },
  { name: "Microsoft Dynamics 365", logo: "/logos/dynamics-365.svg", cls: "h-11 w-auto" },
];

export const PLANNING: Sys[] = [
  { name: "Blue Yonder", logo: "/logos/blue-yonder.png", cls: "w-[132px] h-auto" },
  { name: "Kinaxis", logo: "/logos/kinaxis.svg", cls: "w-[118px] h-auto" },
  { name: "o9 Solutions", logo: "/logos/o9-solutions.svg", cls: "h-14 w-auto", label: "Solutions", labelCls: PLAIN },
];

const TRUST = [
  {
    icon: Code2,
    title: "Built by our developers",
    body: "Our developers build the connection to your ERP and planning tools, so your own team doesn't have to.",
  },
  {
    icon: ArrowLeftRight,
    title: "Your ERP stays the source of truth",
    body: "SCIO reads from and writes back to your systems. Nothing gets replaced, and nothing is re-entered.",
  },
  {
    icon: ShieldCheck,
    title: "Every change approved and logged",
    body: "A person approves each action before it reaches your systems, and it is recorded in a full audit trail.",
  },
];

export function Tile({ s, i }: { s: Sys; i: number }) {
  const still = useReducedMotion();
  return (
    <motion.li
      initial={still ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.5, delay: 0.15 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="theme-fixed group/tile relative flex h-24 items-center justify-center rounded-2xl border border-[#E7E5E1] bg-white px-3 shadow-[0_10px_28px_-20px_rgba(17,17,19,0.4)] transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-0.5 hover:border-[#F2A93B] hover:shadow-[0_18px_36px_-18px_rgba(242,169,59,0.55)]"
    >
      {s.logo ? (
        <span className="flex max-w-full items-center justify-center gap-2.5">
          {/* alt is the company name; when a text label sits beside the mark, the label is read instead */}
          <img src={s.logo} alt={s.label ? "" : s.name} decoding="async" draggable={false} className={`${s.cls ?? "h-8 w-auto"} max-w-full shrink-0 select-none object-contain`} />
          {s.label && <span className={`whitespace-nowrap leading-none text-[#111113] ${s.labelCls ?? PLAIN}`}>{s.label}</span>}
        </span>
      ) : (
        <span className={`text-center leading-tight text-[#111113] ${PLAIN}`}>{s.name}</span>
      )}
    </motion.li>
  );
}

function Group({ label, note, items, offset }: { label: string; note: string; items: Sys[]; offset: number }) {
  return (
    <div className="scio-erp-group rounded-[28px] border border-[#E7E5E1] p-5 sm:p-6">
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#B06D0F]">{label}</p>
        <p className="text-[13px] text-[#6b6862]">{note}</p>
      </div>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 [&>li:last-child]:col-span-2 sm:[&>li:last-child]:col-span-1">
        {items.map((s, i) => (
          <Tile key={s.name} s={s} i={offset + i} />
        ))}
      </ul>
    </div>
  );
}

/** Two gold threads that draw from SCIO down to each group, with a pulse running along them. */
function Threads() {
  const still = useReducedMotion();
  const paths = ["M 500 0 C 500 78, 250 44, 250 130", "M 500 0 C 500 78, 750 44, 750 130"];
  return (
    <>
      {/* Phones: a single short line instead of the branching threads */}
      <div aria-hidden="true" className="mx-auto h-8 w-px bg-gradient-to-b from-[#F2A93B] to-[#F2A93B]/20 md:hidden" />
      <svg aria-hidden="true" viewBox="0 0 1000 130" preserveAspectRatio="none" className="hidden h-[110px] w-full md:block">
        {paths.map((d, i) => (
          <g key={d}>
            <motion.path
              d={d}
              fill="none"
              stroke="#F2A93B"
              strokeOpacity={0.45}
              strokeWidth={2}
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              initial={still ? false : { pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 1.1, delay: 0.1 + i * 0.12, ease: "easeOut" }}
            />
            {!still && (
              <motion.path
                d={d}
                fill="none"
                stroke="#F2A93B"
                strokeWidth={3}
                strokeLinecap="round"
                strokeDasharray="2 26"
                vectorEffect="non-scaling-stroke"
                animate={{ strokeDashoffset: [0, -56] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
              />
            )}
          </g>
        ))}
      </svg>
    </>
  );
}

function ScioNode() {
  const still = useReducedMotion();
  return (
    <div className="relative mx-auto w-max">
      {!still &&
        [0, 1].map((i) => (
          <motion.span
            key={i}
            aria-hidden="true"
            className="absolute inset-0 rounded-[26px] border-2 border-[#F2A93B]"
            initial={{ opacity: 0.45, scale: 1 }}
            animate={{ opacity: 0, scale: 1.28 }}
            transition={{ duration: 2.8, repeat: Infinity, delay: i * 1.4, ease: "easeOut" }}
          />
        ))}
      <div className="theme-fixed relative flex items-center gap-4 rounded-[26px] bg-[#111113] py-3 pl-3 pr-7 text-white shadow-[0_28px_60px_-24px_rgba(17,17,19,0.7)] ring-1 ring-white/10">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/[0.07] ring-1 ring-white/10">
          <StellarScioMark className="h-7 w-auto" />
        </span>
        <span className="text-left">
          <StellarScioWordmark className="block h-[20px] w-auto" />
          <span className="mt-1.5 block text-[13px] text-[#B9B5AE]">One operating picture</span>
        </span>
      </div>
    </div>
  );
}

export default function ErpTrust() {
  const { openDemo } = useSite();
  return (
    <section className="border-y border-[#E7E5E1] bg-[#F6F5F3]" aria-labelledby="erp-trust-heading">
      <div className={`${SITE_SHELL} py-16 sm:py-24`}>
        <motion.div {...reveal} className="mx-auto flex max-w-5xl flex-col items-center text-center">
          <Eyebrow>Enterprise-ready</Eyebrow>
          {/* One line on desktop; wraps naturally on tablets and phones */}
          <SectionHeading id="erp-trust-heading" className="mt-4 lg:whitespace-nowrap">
            Your ERP stays. SCIO plugs into it.
          </SectionHeading>
          {/* About two lines on desktop */}
          <p className="mt-5 max-w-[46rem] text-balance text-[17px] leading-relaxed text-[#4a4843] sm:text-[18px]">
            SCIO connects to the ERP and planning systems your business already depends on. Our developers build the connection, so nothing gets replaced.
          </p>
        </motion.div>

        <div className="mx-auto mt-12 max-w-[1080px] sm:mt-16">
          <ScioNode />
          <Threads />
          <div className="grid gap-5 md:grid-cols-2">
            <Group label="ERP" note="Your system of record" items={ERP} offset={0} />
            <Group label="Planning & supply chain" note="Forecast, plan, replenish" items={PLANNING} offset={3} />
          </div>
        </div>

        <motion.ul {...reveal} className="mx-auto mt-12 grid max-w-[1080px] gap-4 sm:mt-14 md:grid-cols-3">
          {TRUST.map((t) => (
            <li key={t.title} className="rounded-2xl border border-[#E7E5E1] bg-white p-6">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#FFF4E2] text-[#B06D0F]">
                <t.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-[17px] font-semibold text-[#111113]">{t.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-[#4a4843]">{t.body}</p>
            </li>
          ))}
        </motion.ul>

        <motion.div {...reveal} className="mx-auto mt-10 flex max-w-[1080px] flex-col items-center gap-5 text-center">
          <p className="text-[17px] text-[#111113]">
            <span className="font-semibold">Don&rsquo;t see your system?</span> <span className="text-[#4a4843]">Tell us. Our developers build the connection.</span>
          </p>
          <PrimaryButton onClick={openDemo}>Talk to our team</PrimaryButton>
          <p className="max-w-[70ch] text-[12.5px] leading-relaxed text-[#8f8b84]">
            SAP, Oracle, Microsoft Dynamics 365, Blue Yonder, Kinaxis and o9 Solutions are trademarks of their respective owners. Their names and logos are shown only to identify the systems SCIO connects to and do not imply endorsement.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
