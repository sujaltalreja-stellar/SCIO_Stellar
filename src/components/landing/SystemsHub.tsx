"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Database, Store, Box, Users, Contact, ShoppingCart, FileSpreadsheet, Mail } from "lucide-react";
import { StellarScioMark, StellarScioWordmark } from "../site/StellarScioLogo";

// Business systems around the SCIO hub: left column then right column, top to bottom.
const LEFT = [
  { label: "ERP", icon: Database, color: "#2F6FE4" },
  { label: "Point of sale", icon: Store, color: "#F08A1C" },
  { label: "Warehouse (WMS)", icon: Box, color: "#7C5CE0" },
  { label: "HR & Finance", icon: Users, color: "#7C5CE0" },
];
const RIGHT = [
  { label: "CRM", icon: Contact, color: "#E0457B" },
  { label: "Procurement", icon: ShoppingCart, color: "#1E9E5A" },
  { label: "Spreadsheets", icon: FileSpreadsheet, color: "#1E9E5A" },
  { label: "Documents & email", icon: Mail, color: "#2F6FE4" },
];

// Diagram coordinates (viewBox 1000 x 400). Chips sit in the outer 26% on each side; the hub is centred.
const ROWS = [50, 150, 250, 350];
const HUB = { x: 500, y: 200 };

function connector(side: "left" | "right", y: number) {
  const x0 = side === "left" ? 262 : 738;
  const x1 = side === "left" ? HUB.x - 70 : HUB.x + 70;
  const mid = (x0 + x1) / 2;
  return `M ${x0} ${y} C ${mid} ${y}, ${mid} ${HUB.y}, ${x1} ${HUB.y}`;
}

function Chip({ s }: { s: (typeof LEFT)[number] }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[#EEECE8] bg-white px-4 py-3.5 shadow-[0_8px_24px_-16px_rgba(17,17,19,0.35)]">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: `${s.color}14` }}>
        <s.icon className="h-5 w-5" style={{ color: s.color }} aria-hidden="true" />
      </span>
      <span className="text-[14px] lg:text-[15px] font-semibold text-[#111113] md:whitespace-nowrap">{s.label}</span>
    </div>
  );
}

function HubLogo() {
  const still = useReducedMotion();
  return (
    <div className="relative flex flex-col items-center">
      <div className="relative">
        {!still &&
          [0, 1].map((i) => (
            <motion.span
              key={i}
              aria-hidden="true"
              className="absolute inset-0 rounded-[30px] border-2 border-[#F2A93B]"
              initial={{ opacity: 0.5, scale: 1 }}
              animate={{ opacity: 0, scale: 1.55 }}
              transition={{ duration: 2.6, repeat: Infinity, delay: i * 1.3, ease: "easeOut" }}
            />
          ))}
        <div className="theme-fixed relative flex h-[108px] w-[108px] items-center justify-center rounded-[30px] bg-[#111113] text-white shadow-[0_24px_60px_-18px_rgba(17,17,19,0.6)] ring-1 ring-white/10">
          <StellarScioMark className="h-[54px] w-auto" />
        </div>
      </div>
      <p className="mt-5 text-[#111113]">
        <StellarScioWordmark className="block h-[22px] w-auto" />
      </p>
      <p className="mt-1.5 text-[13px] text-[#6b6862]">One operating picture</p>
    </div>
  );
}

export default function SystemsHub() {
  const still = useReducedMotion();

  return (
    <>
      {/* Desktop / tablet: hub with animated connectors */}
      <div className="relative mt-12 hidden md:block" style={{ aspectRatio: "1000 / 400" }}>
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1000 400" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="hub-line-l" x1="0" x2="1">
              <stop offset="0" stopColor="#E7E5E1" />
              <stop offset="1" stopColor="#F2A93B" />
            </linearGradient>
            <linearGradient id="hub-line-r" x1="1" x2="0">
              <stop offset="0" stopColor="#E7E5E1" />
              <stop offset="1" stopColor="#F2A93B" />
            </linearGradient>
          </defs>
          {(["left", "right"] as const).map((side) =>
            ROWS.map((y, i) => {
              const d = connector(side, y);
              return (
                <g key={`${side}-${i}`}>
                  <path d={d} pathLength={300} fill="none" stroke={`url(#hub-line-${side === "left" ? "l" : "r"})`} strokeWidth="2" vectorEffect="non-scaling-stroke" />
                  {!still && (
                    <path
                      d={d}
                      pathLength={300}
                      fill="none"
                      stroke="#F2A93B"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      vectorEffect="non-scaling-stroke"
                      strokeDasharray="10 290"
                      className="scio-hub-flow"
                      style={{ animationDelay: `${(i * 0.45 + (side === "right" ? 0.2 : 0)).toFixed(2)}s` }}
                    />
                  )}
                </g>
              );
            })
          )}
        </svg>

        {/* Left and right system columns */}
        {[LEFT, RIGHT].map((col, ci) => (
          <div key={ci} className={`absolute top-0 h-full w-[26%] ${ci === 0 ? "left-0" : "right-0"}`}>
            {col.map((s, i) => (
              <motion.div
                key={s.label}
                className="absolute inset-x-0 -translate-y-1/2"
                style={{ top: `${(ROWS[i] / 400) * 100}%` }}
                initial={still ? false : { opacity: 0, x: ci === 0 ? -24 : 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <Chip s={s} />
              </motion.div>
            ))}
          </div>
        ))}

        {/* Centre hub */}
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ marginTop: 22 }}
          initial={still ? false : { opacity: 0, scale: 0.85 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <HubLogo />
        </motion.div>
      </div>

      {/* Phones: logo, then the systems as a grid */}
      <div className="mt-10 md:hidden">
        <div className="flex justify-center">
          <HubLogo />
        </div>
        <div className="mx-auto mt-6 h-8 w-px bg-gradient-to-b from-[#F2A93B] to-[#E7E5E1]" aria-hidden="true" />
        <ul className="mt-2 grid grid-cols-2 gap-3">
          {[...LEFT, ...RIGHT].map((s) => (
            <li key={s.label}>
              <Chip s={s} />
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
