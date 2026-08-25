"use client";

import React from "react";
import { motion } from "framer-motion";
import CountUp from "./CountUp";
import { C, GRADIENT_BRAND, GRADIENT_BRAND_BUTTON, T } from "./tokens";
import { ENTRANCE, VIEWPORT_WIDE, fadeUp } from "./motion";

/**
 * The hero product shot — SICO's "Operations Overview" screen, ported from the
 * design source. Colours, copy and layout are the design's; what is added here
 * is the scroll-staggered entrance and the counting KPIs. The ambient loops
 * (drifting grid, dashed graph flow, pulsing status dots) are the design's own
 * CSS keyframes from sico.css.
 */

const MAIN_NAV = [
  { label: "Overview", active: true },
  { label: "Inspections", badge: "3" },
  { label: "Assets" },
  { label: "Inventory" },
  { label: "Supply Chain" },
];

const MANAGEMENT_NAV = [{ label: "Operations" }, { label: "Analytics" }, { label: "Reports" }];

const STATS = [
  { accent: C.violet, to: 1286, decimals: 0, label: "Active Inspections", delta: "▲ +124 this month", tone: C.green },
  { accent: C.red, to: 37, decimals: 0, label: "Critical Assets", delta: "▲ needs action", tone: C.red },
  { accent: C.green, to: 88.3, decimals: 1, suffix: "%", label: "Avg. Compliance", delta: "▲ +2.1% vs last month", tone: C.green },
];

// Vertices of the operational graph, in the SVG's 0-100 space. The chips are
// positioned with the same numbers as CSS percentages so they sit exactly on
// the polyline at any width.
const GRAPH_POINTS = "8,64 25,30 43,70 61,32 79,66 94,34";
const GRAPH_NODES = [
  { label: "Asset", x: 8, y: 64, dot: C.slate500 },
  { label: "AI Inspection", x: 25, y: 30, dot: C.violet, active: true },
  { label: "Inventory", x: 43, y: 70, dot: C.green },
  { label: "Work Order", x: 61, y: 32, dot: C.amber },
  { label: "Supply Chain", x: 79, y: 66, dot: C.cyan, hideSm: true },
  { label: "Compliance", x: 94, y: 34, dot: C.green, hideSm: true },
];

const OVERDUE = [
  ["EXT-MUM-0113", "Parking Level P1", "18 DAYS"],
  ["EXT-MUM-0087", "Basement B2", "25 DAYS"],
  ["EXT-MUM-0044", "Server Room A", "41 DAYS"],
];

const ALERTS = [
  {
    dot: C.amber,
    title: "Inventory below threshold",
    body: "MRO bin B-14 · Replacement bearing 6205-2RS — 4 units left",
    footer: "→ Purchase requisition drafted",
    footerTone: C.amber,
  },
  {
    dot: C.cyan,
    title: "Supply bottleneck — Line 2",
    body: "Distribution route DEL→MUM delayed 36h, 3 work orders at risk",
  },
  {
    dot: C.green,
    title: "Compliance package ready",
    body: "Audit bundle EXT-2026-9104 — 42 assets, photo-verified",
  },
];

const shell = {
  hidden: { opacity: 0, y: 34, scale: 0.99 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.85, ease: ENTRANCE, staggerChildren: 0.08, delayChildren: 0.25 },
  },
};

const mono = { fontFamily: "var(--font-sico-mono), 'DM Mono', monospace" };

function NavItem({ label, active, badge }) {
  return (
    <span
      className="flex items-center gap-2.5 rounded-lg px-2.5 py-[9px]"
      style={{
        fontSize: T.dense,
        background: active ? "rgba(91,77,240,.16)" : undefined,
        border: active ? "1px solid rgba(139,92,246,.24)" : "1px solid transparent",
        color: active ? "#C9C2FF" : C.slate400,
        fontWeight: active ? 500 : 400,
      }}
    >
      <span
        className="h-1.5 w-1.5 shrink-0 rounded-[2px]"
        style={{ background: active ? C.violet : C.slate900 }}
      />
      <span className="truncate">{label}</span>
      {badge && (
        <span
          className="ml-auto rounded-[5px] px-1.5 py-px text-white"
          style={{ ...mono, fontSize: T.monoMicro, background: C.red }}
        >
          {badge}
        </span>
      )}
    </span>
  );
}

function OperationsDashboard() {
  return (
    <motion.div
      variants={shell}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT_WIDE}
      className="relative overflow-hidden rounded-[20px]"
      style={{
        background: C.night,
        border: "1px solid rgba(255,255,255,.09)",
        boxShadow: "0 60px 120px -60px rgba(11,13,15,.7), 0 2px 0 rgba(255,255,255,.04) inset",
      }}
    >
      {/* ── Chrome ───────────────────────────────────────────────── */}
      <motion.div
        variants={fadeUp}
        className="flex items-center gap-3 px-4 py-3 sm:gap-4 sm:px-[18px]"
        style={{ borderBottom: `1px solid ${C.lineDark}`, background: "#0E1114" }}
      >
        <span
          className="grid h-[22px] w-[22px] shrink-0 place-items-center rounded-md"
          style={{ background: GRADIENT_BRAND }}
        >
          <span className="block h-2 w-2 rounded-[2px] border-[1.6px] border-white" />
        </span>
        <span
          className="hidden sm:inline"
          style={{ ...mono, fontSize: T.monoLabel, letterSpacing: ".1em", color: C.slate600 }}
        >
          SCIO PLATFORM
        </span>
        <span className="hidden sm:inline" style={{ color: C.slate900 }}>
          /
        </span>
        <span style={{ fontSize: T.ui, color: C.chalk, fontWeight: 500 }}>Operations Overview</span>

        <div
          className="ml-auto hidden items-center gap-2.5 rounded-lg px-3 py-[7px] lg:flex lg:w-[260px]"
          style={{ background: "#15191C", border: `1px solid ${C.lineDark}` }}
        >
          <span
            className="block h-[11px] w-[11px] shrink-0 rounded-full"
            style={{ border: `1.4px solid ${C.slate700}` }}
          />
          <span style={{ fontSize: T.dense, color: C.slate700 }}>Search assets, reports…</span>
        </div>

        <div className="ml-auto flex items-center gap-2 lg:ml-3">
          <span
            className="relative grid h-[26px] w-[26px] place-items-center rounded-[7px]"
            style={{ border: "1px solid rgba(255,255,255,.09)" }}
          >
            <span
              className="absolute right-[5px] top-[5px] h-[5px] w-[5px] rounded-full"
              style={{ background: C.red }}
            />
            <span
              className="block h-[9px] w-[9px] rounded-t-[2px]"
              style={{ border: `1.4px solid ${C.slate600}` }}
            />
          </span>
          <span
            className="grid h-[26px] w-[26px] place-items-center rounded-full text-[11px] font-bold text-white"
            style={{ background: GRADIENT_BRAND }}
          >
            AJ
          </span>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:min-h-[560px] lg:grid-cols-[208px_minmax(0,1fr)_300px]">
        {/* ── Left rail ──────────────────────────────────────────── */}
        <motion.aside
          variants={fadeUp}
          className="hidden flex-col gap-[3px] px-3 py-[18px] lg:flex"
          style={{ borderRight: "1px solid rgba(255,255,255,.06)", background: C.nightPanel }}
        >
          <span
            className="px-2.5 pb-2 pt-1.5"
            style={{ ...mono, fontSize: T.monoMicro, letterSpacing: ".16em", color: C.slate800 }}
          >
            MAIN
          </span>
          {MAIN_NAV.map((item) => (
            <NavItem key={item.label} {...item} />
          ))}

          <span
            className="px-2.5 pb-2 pt-4"
            style={{ ...mono, fontSize: T.monoMicro, letterSpacing: ".16em", color: C.slate800 }}
          >
            MANAGEMENT
          </span>
          {MANAGEMENT_NAV.map((item) => (
            <NavItem key={item.label} {...item} />
          ))}

          <div
            className="mt-auto flex items-center gap-2.5 px-2.5 pb-0.5 pt-3"
            style={{ borderTop: "1px solid rgba(255,255,255,.06)" }}
          >
            <span
              className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[11px] font-semibold"
              style={{ background: "#1D2126", color: C.slate400 }}
            >
              AJ
            </span>
            <span className="flex min-w-0 flex-col leading-[1.3]">
              <span className="truncate" style={{ fontSize: T.microCopy, color: C.chalk }}>
                Alex Johnson
              </span>
              <span className="truncate" style={{ fontSize: T.monoMicro, color: C.slate700 }}>
                Safety Officer
              </span>
            </span>
          </div>
        </motion.aside>

        {/* ── Main column ────────────────────────────────────────── */}
        <main className="flex min-w-0 flex-col gap-3.5 p-4 sm:p-[18px]">
          <motion.div variants={fadeUp} className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl px-[15px] py-3.5"
                style={{
                  border: `1px solid ${C.lineDark}`,
                  background: "linear-gradient(180deg, #131719, #101315)",
                }}
              >
                <div
                  className="mb-3 h-0.5 w-[34px] rounded-sm"
                  style={{ background: stat.accent }}
                />
                <div
                  style={{
                    fontSize: "clamp(22px, 2vw + 14px, 27px)",
                    fontWeight: 500,
                    letterSpacing: "-.02em",
                    color: C.chalkBright,
                  }}
                >
                  <CountUp to={stat.to} decimals={stat.decimals} suffix={stat.suffix} delay={0.45} />
                </div>
                <div className="mt-[3px]" style={{ fontSize: T.microCopy, color: C.slate500 }}>
                  {stat.label}
                </div>
                <div className="mt-[7px]" style={{ ...mono, fontSize: T.monoBody, color: stat.tone }}>
                  {stat.delta}
                </div>
              </div>
            ))}
          </motion.div>

          {/* Operational graph */}
          <motion.div
            variants={fadeUp}
            className="relative min-h-[260px] flex-1 overflow-hidden rounded-xl"
            style={{ border: `1px solid ${C.lineDark}`, background: "#0D1012" }}
          >
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,.032) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.032) 1px, transparent 1px)",
                backgroundSize: "40px 40px",
                animation: "sicoDrift 22s linear infinite",
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(120% 90% at 50% 120%, rgba(91,77,240,.15), transparent 62%)",
              }}
            />
            <div className="absolute left-3.5 top-3 z-[2] flex items-center gap-2">
              <span
                style={{ ...mono, fontSize: T.monoMicro, letterSpacing: ".16em", color: C.slate700 }}
              >
                OPERATIONAL GRAPH — MUMBAI HQ CAMPUS
              </span>
              <span
                className="h-[5px] w-[5px] rounded-full"
                style={{ background: C.green, animation: "sicoPulse 2s ease-in-out infinite" }}
              />
            </div>

            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="absolute inset-0 h-full w-full"
              aria-hidden="true"
            >
              <polyline
                points={GRAPH_POINTS}
                fill="none"
                stroke="rgba(139,92,246,.14)"
                strokeWidth={6}
                vectorEffect="non-scaling-stroke"
              />
              <polyline
                points={GRAPH_POINTS}
                fill="none"
                stroke="rgba(139,92,246,.55)"
                strokeWidth={1.2}
                vectorEffect="non-scaling-stroke"
                strokeDasharray="6 5"
                style={{ animation: "sicoDash 9s linear infinite" }}
              />
              <polyline
                points="25,30 43,70 79,66"
                fill="none"
                stroke="rgba(47,191,113,.35)"
                strokeWidth={1}
                vectorEffect="non-scaling-stroke"
                strokeDasharray="3 6"
                style={{ animation: "sicoDash 14s linear infinite reverse" }}
              />
            </svg>

            {GRAPH_NODES.map((node) => (
              <motion.div
                key={node.label}
                variants={fadeUp}
                className={`absolute z-[2] flex -translate-x-1/2 -translate-y-1/2 items-center gap-[7px] rounded-lg px-2.5 py-[7px] ${
                  node.hideSm ? "hidden sm:flex" : "flex"
                }`}
                style={{
                  left: `${node.x}%`,
                  top: `${node.y}%`,
                  background: "rgba(19,23,25,.92)",
                  border: node.active
                    ? "1px solid rgba(139,92,246,.4)"
                    : "1px solid rgba(255,255,255,.1)",
                  boxShadow: node.active ? "0 0 0 4px rgba(139,92,246,.09)" : undefined,
                  backdropFilter: "blur(6px)",
                }}
              >
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{
                    background: node.dot,
                    animation: node.active ? "sicoPulse 1.8s ease-in-out infinite" : undefined,
                  }}
                />
                <span
                  className="whitespace-nowrap"
                  style={{
                    ...mono,
                    fontSize: T.monoMicro,
                    letterSpacing: ".1em",
                    color: node.active ? C.violetPale : C.slate200,
                  }}
                >
                  {node.label.toUpperCase()}
                </span>
              </motion.div>
            ))}
          </motion.div>

          {/* Overdue assets */}
          <motion.div
            variants={fadeUp}
            className="overflow-hidden rounded-xl"
            style={{ border: `1px solid ${C.lineDark}`, background: C.nightRaised }}
          >
            <div
              className="flex items-center gap-2 px-3.5 py-2.5"
              style={{ borderBottom: "1px solid rgba(255,255,255,.06)" }}
            >
              <span className="h-[5px] w-[5px] rounded-full" style={{ background: C.red }} />
              <span
                style={{ ...mono, fontSize: T.monoMicro, letterSpacing: ".16em", color: C.slate450 }}
              >
                CRITICAL — OVERDUE ASSETS
              </span>
              <span
                className="ml-auto"
                style={{ ...mono, fontSize: T.monoLabel, color: C.slate700 }}
              >
                15 total
              </span>
            </div>
            {OVERDUE.map(([id, location, days], index) => (
              <div
                key={id}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2.5 px-3.5 py-2.5 sm:grid-cols-[1fr_1fr_auto]"
                style={{
                  borderBottom:
                    index < OVERDUE.length - 1 ? "1px solid rgba(255,255,255,.04)" : undefined,
                }}
              >
                <span
                  className="truncate"
                  style={{ ...mono, fontSize: T.monoBody, color: C.violetSoft }}
                >
                  {id}
                </span>
                <span
                  className="hidden truncate sm:block"
                  style={{ fontSize: T.dense, color: C.slate400 }}
                >
                  {location}
                </span>
                <span
                  className="rounded-[5px] px-2 py-[3px]"
                  style={{
                    ...mono,
                    fontSize: T.monoLabel,
                    color: C.red,
                    background: "rgba(240,82,107,.12)",
                  }}
                >
                  {days}
                </span>
              </div>
            ))}
          </motion.div>
        </main>

        {/* ── Alert rail ─────────────────────────────────────────── */}
        <motion.aside
          variants={fadeUp}
          className="flex min-w-0 flex-col gap-3 px-4 py-[18px]"
          style={{
            borderTop: "1px solid rgba(255,255,255,.06)",
            background: C.nightPanel,
          }}
        >
          <div className="flex items-center gap-2">
            <span
              style={{ ...mono, fontSize: T.monoMicro, letterSpacing: ".16em", color: C.slate700 }}
            >
              LIVE OPERATIONAL ALERTS
            </span>
            <span
              className="h-[5px] w-[5px] rounded-full"
              style={{ background: C.red, animation: "sicoBlink 1.4s ease-in-out infinite" }}
            />
          </div>

          <div
            className="overflow-hidden rounded-xl"
            style={{
              border: "1px solid rgba(240,82,107,.32)",
              background: "linear-gradient(180deg, rgba(240,82,107,.10), rgba(240,82,107,.02))",
            }}
          >
            <div
              className="flex items-center gap-2 px-3.5 py-3"
              style={{ borderBottom: "1px solid rgba(240,82,107,.2)" }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: C.red, animation: "sicoPulse 1.6s ease-in-out infinite" }}
              />
              <span style={{ fontSize: T.dense, fontWeight: 600, color: "#FFD9DF" }}>
                Critical Asset Detected
              </span>
            </div>
            <div className="flex flex-col gap-2.5 px-3.5 py-3">
              <span style={{ fontSize: T.microCopy, color: C.slate300, lineHeight: 1.45 }}>
                Visual anomaly detected during automated inspection sweep.
              </span>
              <div className="flex flex-col gap-[7px]">
                {[
                  ["ASSET", "Pressure Vessel — PV-204", C.chalk, false],
                  ["ZONE", "Floor 03 · Zone 03-B", C.chalk, false],
                  ["AI CONFIDENCE", "98.4%", C.green, true],
                ].map(([term, value, tone, isMono]) => (
                  <div key={term} className="flex justify-between gap-2.5">
                    <span
                      style={{
                        ...mono,
                        fontSize: T.monoMicro,
                        letterSpacing: ".1em",
                        color: C.slate600,
                      }}
                    >
                      {term}
                    </span>
                    <span
                      className="text-right"
                      style={{
                        ...(isMono ? mono : {}),
                        fontSize: T.monoBody,
                        color: tone,
                      }}
                    >
                      {value}
                    </span>
                  </div>
                ))}
              </div>
              <div
                className="h-[3px] overflow-hidden rounded-[3px]"
                style={{ background: "rgba(255,255,255,.08)" }}
              >
                <motion.div
                  className="h-full"
                  style={{ background: `linear-gradient(90deg, ${C.indigo}, ${C.green})` }}
                  initial={{ width: 0 }}
                  whileInView={{ width: "98.4%" }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={{ duration: 1.1, ease: ENTRANCE, delay: 0.5 }}
                />
              </div>
              <button
                type="button"
                className="w-full rounded-[9px] border-none py-2.5 text-white"
                style={{
                  background: GRADIENT_BRAND_BUTTON,
                  fontSize: T.dense,
                  fontWeight: 500,
                  boxShadow: "0 8px 20px -10px rgba(91,77,240,.9)",
                }}
              >
                Create maintenance work order
              </button>
            </div>
          </div>

          {ALERTS.map((alert) => (
            <div
              key={alert.title}
              className="flex flex-col gap-1.5 rounded-xl px-3.5 py-3"
              style={{ border: "1px solid rgba(255,255,255,.08)", background: C.nightRaised }}
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ background: alert.dot }}
                />
                <span style={{ fontSize: T.microCopy, fontWeight: 500, color: C.chalk }}>
                  {alert.title}
                </span>
              </div>
              <span style={{ fontSize: T.microCopy, color: C.slate500, lineHeight: 1.45 }}>
                {alert.body}
              </span>
              {alert.footer && (
                <span
                  className="mt-0.5"
                  style={{ ...mono, fontSize: T.monoLabel, color: alert.footerTone }}
                >
                  {alert.footer}
                </span>
              )}
            </div>
          ))}

          <div
            className="mt-auto flex items-center justify-between pt-3"
            style={{ borderTop: "1px solid rgba(255,255,255,.06)" }}
          >
            <span
              style={{ ...mono, fontSize: T.monoMicro, letterSpacing: ".12em", color: C.slate800 }}
            >
              AI ENGINE
            </span>
            <span className="flex items-center gap-1.5">
              <span
                className="h-[5px] w-[5px] rounded-full"
                style={{ background: C.green, animation: "sicoPulse 2s ease-in-out infinite" }}
              />
              <span style={{ ...mono, fontSize: T.monoLabel, color: C.green }}>ONLINE</span>
            </span>
          </div>
        </motion.aside>
      </div>
    </motion.div>
  );
}

export default OperationsDashboard;
