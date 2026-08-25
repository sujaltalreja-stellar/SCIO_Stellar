"use client";

import React from "react";
import { motion } from "framer-motion";
import SectionIntro from "../sico/SectionIntro";
import CountUp from "../sico/CountUp";
import { ENTRANCE, VIEWPORT_WIDE, fadeUp, stagger } from "../sico/motion";

const TABS = ["Overview", "Assets", "Inspections", "Supply", "Compliance"];

const KPIS = [
  { label: "Asset Health", to: 94.2, decimals: 1, suffix: "%", accent: "#2FBF71", fill: 94.2 },
  {
    label: "Inspection Compliance",
    to: 88.3,
    decimals: 1,
    suffix: "%",
    accent: "#8B5CF6",
    fill: 88.3,
  },
  { label: "AI Model Accuracy", to: 97.4, decimals: 1, suffix: "%", accent: "#3FC8D8", fill: 97.4 },
  {
    label: "Critical Alerts",
    to: 37,
    decimals: 0,
    accent: "#F0526B",
    critical: true,
    footnote: "15 overdue · 22 flagged by AI",
  },
];

const VOLUME = [
  ["Feb 2026", 187],
  ["Mar 2026", 234],
  ["Apr 2026", 274],
  ["May 2026", 212],
  ["Jun 2026", 249],
  ["Jul 2026", 276],
];
const VOLUME_MAX = 300;

const ASSET_TYPES = [
  { label: "ABC Dry Powder", value: 114, color: "#8B5CF6" },
  { label: "CO₂", value: 54, color: "#3FC8D8" },
  { label: "Foam (AFFF)", value: 45, color: "#E8A33D" },
  { label: "Wet Chemical", value: 22, color: "#F0526B" },
  { label: "Others", value: 12, color: "#5A6270" },
];
const ASSET_TOTAL = ASSET_TYPES.reduce((sum, type) => sum + type.value, 0);

const ZONES = [
  ["Block A", 96, "#2FBF71"],
  ["Block B", 91, "#2FBF71"],
  ["Server Rm", 78, "#E8A33D"],
  ["Parking", 64, "#E8A33D"],
  ["Basement", 55, "#F0526B"],
  ["Cafeteria", 100, "#2FBF71"],
];

const ACCURACY = [
  ["Label OCR", 99],
  ["Brand ID", 98],
  ["Defect Det.", 94],
  ["Serial No.", 97],
  ["QR Detect", 96],
  ["Type Class.", 99],
];

const FOOTER_CARDS = [
  {
    label: "Supply Bottlenecks",
    value: "5",
    highlight: "2 critical routes",
    highlightTone: "#E8A33D",
    body: "DEL → MUM delayed 36h · 3 work orders at risk",
  },
  {
    label: "Field Operations",
    value: "28",
    highlight: "technicians active",
    highlightTone: "#2FBF71",
    body: "6 working offline · queued payloads sync on reconnect",
  },
  {
    label: "Defect Trend · 90 Days",
    value: "−18%",
    highlight: "improving",
    highlightTone: "#2FBF71",
    body: "Corrosion findings down after Q2 coating programme",
  },
];

function Card({ title, children, className = "" }) {
  return (
    <div className={`rounded-xl border border-white/[0.07] bg-[#FFFDFA]/[0.02] p-4 ${className}`}>
      <p className="flex items-center gap-2 font-sico-mono text-[11px] uppercase tracking-[0.14em] text-white/40 sm:text-[11.5px]">
        <span className="h-1 w-1 rounded-full bg-[#8B5CF6]" />
        {title}
      </p>
      {children}
    </div>
  );
}

function Meter({ label, value, display, percent, color, delay }) {
  return (
    <div className="grid grid-cols-[70px_minmax(0,1fr)_34px] items-center gap-3 sm:grid-cols-[80px_minmax(0,1fr)_38px]">
      <span className="truncate font-sico-mono text-[11px] text-white/40 sm:text-[11.5px]">
        {label}
      </span>
      <span className="h-1.5 overflow-hidden rounded-full bg-[#FFFDFA]/[0.06]">
        <motion.span
          className="block h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          whileInView={{ width: `${percent}%` }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 1, ease: ENTRANCE, delay }}
        />
      </span>
      <span className="text-right font-sico-mono text-[11px] text-white/65 sm:text-[11.5px]">
        {display ?? value}
      </span>
    </div>
  );
}

function ControlTower() {
  return (
    <section className="bg-[#0B0D0F] px-5 pt-10 pb-6 sm:px-8 md:px-12 lg:px-[75px] lg:pt-14 lg:pb-8">
      <div className="mx-auto w-full max-w-[1290px]">
        <SectionIntro
          tone="dark"
          eyebrow="06 — Act · Operations Control Tower"
          title="One Control Tower for the Entire Operation"
          description="Centralized, real-time visibility into asset health, inspection status, supply bottlenecks and critical alerts — with the zone-level analytics behind every number."
        />

        <motion.div
          className="mt-10 overflow-hidden rounded-2xl border border-white/[0.07] bg-[#101315]"
          variants={stagger(0.08, 0.15)}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_WIDE}
        >
          <motion.div
            variants={fadeUp}
            className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-white/[0.07] px-4 py-3 sm:px-5"
          >
            <span className="font-sico-mono text-[11px] uppercase tracking-[0.16em] text-white/30 sm:text-[11.5px]">
              Control Tower
            </span>
            <div className="flex flex-wrap items-center gap-4">
              {TABS.map((tab, index) => (
                <span
                  key={tab}
                  className={`text-[13px] ${
                    index === 0
                      ? "border-b-2 border-[#8B5CF6] pb-1 font-medium text-white"
                      : "text-white/35"
                  }`}
                >
                  {tab}
                </span>
              ))}
            </div>
            <span className="ml-auto flex items-center gap-1.5 font-sico-mono text-[11px] uppercase tracking-[0.12em] text-[#2FBF71] sm:text-[11.5px]">
              <span className="h-1 w-1 animate-pulse-soft rounded-full bg-[#2FBF71]" />
              Live · Mumbai HQ Campus
            </span>
          </motion.div>

          <div className="space-y-3 p-4 sm:p-5">
            <motion.div variants={fadeUp} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {KPIS.map((kpi) => (
                <div
                  key={kpi.label}
                  className={`rounded-xl border p-4 ${
                    kpi.critical
                      ? "border-[#F0526B]/30 bg-[#F0526B]/[0.07]"
                      : "border-white/[0.07] bg-[#FFFDFA]/[0.02]"
                  }`}
                >
                  <p className="font-sico-mono text-[11px] uppercase tracking-[0.13em] text-white/40 sm:text-[11.5px]">
                    {kpi.label}
                  </p>
                  <p className="mt-3 text-[32px] font-semibold leading-none tracking-[-0.03em] text-white sm:text-[38px]">
                    <CountUp to={kpi.to} decimals={kpi.decimals} />
                    {kpi.suffix && (
                      <span className="text-[18px] font-medium text-white/55">{kpi.suffix}</span>
                    )}
                  </p>
                  {kpi.critical ? (
                    <p className="mt-3 font-sico-mono text-[11px] text-[#F0526B] sm:text-[11.5px]">
                      {kpi.footnote}
                    </p>
                  ) : (
                    <span className="mt-4 block h-1 overflow-hidden rounded-full bg-[#FFFDFA]/[0.06]">
                      <motion.span
                        className="block h-full rounded-full"
                        style={{ background: kpi.accent }}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${kpi.fill}%` }}
                        viewport={{ once: true, amount: 0.6 }}
                        transition={{ duration: 1.2, ease: ENTRANCE, delay: 0.2 }}
                      />
                    </span>
                  )}
                </div>
              ))}
            </motion.div>

            <motion.div variants={fadeUp} className="grid gap-3 lg:grid-cols-[1.35fr_1fr]">
              <Card title="Monthly Inspection Volume">
                <div className="mt-4 space-y-3">
                  {VOLUME.map(([month, count], index) => (
                    <Meter
                      key={month}
                      label={month}
                      display={count}
                      percent={(count / VOLUME_MAX) * 100}
                      color="#8B5CF6"
                      delay={index * 0.08}
                    />
                  ))}
                </div>
              </Card>

              <Card title="Asset Type Distribution">
                <div className="mt-4 flex items-center gap-5">
                  <div className="relative h-[104px] w-[104px] shrink-0">
                    <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                      {ASSET_TYPES.map((type, index) => {
                        const fraction = type.value / ASSET_TOTAL;
                        const offset = ASSET_TYPES.slice(0, index).reduce(
                          (sum, prev) => sum + prev.value / ASSET_TOTAL,
                          0,
                        );
                        return (
                          <motion.circle
                            key={type.label}
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke={type.color}
                            strokeWidth="12"
                            pathLength={1}
                            strokeDashoffset={-offset}
                            initial={{ strokeDasharray: "0 1" }}
                            whileInView={{ strokeDasharray: `${fraction} ${1 - fraction}` }}
                            viewport={{ once: true, amount: 0.6 }}
                            transition={{ duration: 0.9, ease: ENTRANCE, delay: 0.15 + index * 0.1 }}
                          />
                        );
                      })}
                    </svg>
                    <span className="absolute inset-0 grid place-items-center text-center">
                      <span>
                        <span className="block text-[20px] font-semibold leading-none text-white">
                          <CountUp to={ASSET_TOTAL} />
                        </span>
                        <span className="mt-1 block font-sico-mono text-[11px] uppercase tracking-[0.12em] text-white/35">
                          Assets
                        </span>
                      </span>
                    </span>
                  </div>

                  <ul className="min-w-0 flex-1 space-y-2">
                    {ASSET_TYPES.map((type) => (
                      <li key={type.label} className="flex items-center gap-2">
                        <span
                          className="h-1.5 w-1.5 shrink-0 rounded-full"
                          style={{ background: type.color }}
                        />
                        <span className="min-w-0 flex-1 truncate text-[12.5px] text-white/60">
                          {type.label}
                        </span>
                        <span className="font-sico-mono text-[11.5px] text-white/75">
                          {type.value}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            </motion.div>

            <motion.div variants={fadeUp} className="grid gap-3 lg:grid-cols-2">
              <Card title="Compliance Rate by Zone">
                <div className="mt-4 space-y-3">
                  {ZONES.map(([zone, percent, color], index) => (
                    <Meter
                      key={zone}
                      label={zone}
                      display={`${percent}%`}
                      percent={percent}
                      color={color}
                      delay={index * 0.07}
                    />
                  ))}
                </div>
              </Card>

              <Card title="AI Inspection Accuracy">
                <div className="mt-4 space-y-3">
                  {ACCURACY.map(([metric, percent], index) => (
                    <Meter
                      key={metric}
                      label={metric}
                      display={`${percent}%`}
                      percent={percent}
                      color="#8B5CF6"
                      delay={index * 0.07}
                    />
                  ))}
                </div>
              </Card>
            </motion.div>

            <motion.div variants={fadeUp} className="grid gap-3 sm:grid-cols-3">
              {FOOTER_CARDS.map((card) => (
                <div
                  key={card.label}
                  className="rounded-xl border border-white/[0.07] bg-[#FFFDFA]/[0.02] p-4"
                >
                  <p className="font-sico-mono text-[11px] uppercase tracking-[0.13em] text-white/35 sm:text-[11.5px]">
                    {card.label}
                  </p>
                  <p className="mt-3 flex items-baseline gap-2">
                    <span className="text-[26px] font-semibold leading-none text-white">
                      {card.value}
                    </span>
                    <span className="text-[12.5px]" style={{ color: card.highlightTone }}>
                      {card.highlight}
                    </span>
                  </p>
                  <p className="mt-2.5 text-[12.5px] leading-relaxed text-white/40">{card.body}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default ControlTower;
