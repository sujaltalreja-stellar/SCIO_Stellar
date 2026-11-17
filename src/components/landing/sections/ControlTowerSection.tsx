"use client";

import React, { useState } from "react";
import {
  Ship,
  ShieldCheck,
  ChevronRight,
  Radio,
  ArrowUpRight,
  Anchor,
  CircleAlert
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { C, ENTRANCE, SHELL, VIEWPORT_WIDE, fadeUp, stagger, MARITIME_TABS, CountUp, DashboardCard, DashboardMeter, MARITIME_DATA } from "../shared";
import { useSite } from "../../site/SiteContext";

export default function ControlTowerSection() {
  const { handleNavClick } = useSite();
  const [dashboardTab, setDashboardTab] = useState("Overview");

  return (
    <>
      {/* ==================== 6. OPERATIONS CONTROL TOWER (FULL INTERACTIVE MARITIME/MULTI-SECTOR DASHBOARD) ==================== */}
      <section id="control-tower" className="py-20" style={{ background: C.night, color: C.chalk }}>
        <div className={`${SHELL} space-y-10`}>
          
          {/* Section Header */}
          <div className="flex flex-col justify-between gap-6 border-b border-white/[0.07] pb-8 xl:flex-row xl:items-end">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.09] bg-white/[0.03] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-[#8B5CF6] font-bold">
                <Anchor className="h-3.5 w-3.5" />
                05 — CONTROL TOWER · REAL-TIME MISSION CONTROL SUITE
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
                One Operations Control Tower for Global Industrial Fleets
              </h2>
              <p className="max-w-3xl text-sm leading-relaxed text-white/60 sm:text-[14.5px] font-medium">
                Live AIS maritime fleet tracking, routine safety equipment walkthroughs, fuel reserves,
                and port inspection readiness — with sub-second node telemetry behind every number.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href="/?launch=1&industry=maritime&tab=dashboard"
                onClick={(e) => handleNavClick(e, "maritime", "dashboard")}
                className="inline-flex items-center gap-2 rounded-xl border border-white/[0.12] bg-[#101315] px-4 py-2.5 font-mono text-xs font-bold text-white/80 transition-all hover:border-[#8B5CF6]/50 hover:bg-[#8B5CF6]/10 hover:text-white"
              >
                <Ship className="h-4 w-4 text-[#8B5CF6]" />
                <span>Open Full Fleet OCC</span>
                <ArrowUpRight className="h-3.5 w-3.5 opacity-60" />
              </a>
              <a
                href="/?launch=1&industry=maritime&tab=dashboard"
                onClick={(e) => handleNavClick(e, "maritime", "dashboard")}
                className="inline-flex items-center gap-2 rounded-xl border border-[#F0526B]/30 bg-[#F0526B]/10 px-4 py-2.5 font-mono text-xs font-bold text-[#F0526B] transition-all hover:border-[#F0526B]/60 hover:bg-[#F0526B]/20"
              >
                <CircleAlert className="h-4 w-4" />
                <span>1 Safety Inspection Pending</span>
              </a>
            </div>
          </div>

          {/* MAIN CONTROL TOWER SHELL */}
          <motion.div
            className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#101315] shadow-2xl"
            variants={stagger(0.08, 0.12)}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_WIDE}
          >
            {/* Sub-Nav Header Bar */}
            <motion.div
              variants={fadeUp}
              className="flex flex-wrap items-center justify-between gap-x-5 gap-y-3 border-b border-white/[0.07] bg-[#0E1113] px-4 py-3 sm:px-6"
            >
              <div className="flex items-center gap-4">
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/40 font-bold">
                  CONTROL TOWER
                </span>
                <span className="h-3 w-[1px] bg-white/[0.1]" />
                <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                  {MARITIME_TABS.map((tab) => {
                    const isActive = dashboardTab === tab;
                    return (
                      <button
                        key={tab}
                        onClick={() => setDashboardTab(tab)}
                        className={`relative px-3 py-1.5 text-xs font-semibold transition-all rounded-md ${
                          isActive
                            ? "text-white bg-white/[0.08] font-bold shadow-xs"
                            : "text-white/40 hover:text-white/80 hover:bg-white/[0.02]"
                        }`}
                      >
                        {tab}
                        {isActive && (
                          <motion.span
                            layoutId="activeMaritimeHomeTabUnderline"
                            className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-[#8B5CF6]"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-[#2FBF71] font-bold">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#2FBF71] opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#2FBF71]" />
                </span>
                <span>Live · Global AIS Fleet Feed · 28 Vessels</span>
              </div>
            </motion.div>

            {/* Tab Content Panels */}
            <div className="p-4 sm:p-6 space-y-6">
              <AnimatePresence mode="wait">
                
                {/* ==================== TAB 1: OVERVIEW ==================== */}
                {dashboardTab === "Overview" && (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4 sm:space-y-6"
                  >
                    {/* Top 4 KPI Metric Cards */}
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      {/* KPI 1: Fleet Seaworthiness */}
                      <div className="rounded-xl border border-white/[0.08] bg-[#FFFDFA]/[0.02] p-4 transition-all hover:border-white/[0.14]">
                        <p className="font-mono text-[11px] uppercase tracking-[0.13em] text-white/50 font-bold sm:text-[11.5px]">
                          Fleet Seaworthiness
                        </p>
                        <p className="mt-3 text-[32px] font-bold leading-none tracking-[-0.03em] text-white sm:text-[38px]">
                          <CountUp to={94.8} decimals={1} />
                          <span className="text-[18px] font-bold text-white/55 ml-0.5">%</span>
                        </p>
                        <span className="mt-4 block h-1 overflow-hidden rounded-full bg-[#FFFDFA]/[0.06]">
                          <motion.span
                            className="block h-full rounded-full bg-[#2FBF71]"
                            initial={{ width: 0 }}
                            animate={{ width: "94.8%" }}
                            transition={{ duration: 0.8, ease: ENTRANCE, delay: 0.1 }}
                          />
                        </span>
                      </div>

                      {/* KPI 2: Port Clearance Readiness */}
                      <div className="rounded-xl border border-white/[0.08] bg-[#FFFDFA]/[0.02] p-4 transition-all hover:border-white/[0.14]">
                        <p className="font-mono text-[11px] uppercase tracking-[0.13em] text-white/50 font-bold sm:text-[11.5px]">
                          Port Clearance Rate
                        </p>
                        <p className="mt-3 text-[32px] font-bold leading-none tracking-[-0.03em] text-white sm:text-[38px]">
                          <CountUp to={97.5} decimals={1} />
                          <span className="text-[18px] font-bold text-white/55 ml-0.5">%</span>
                        </p>
                        <span className="mt-4 block h-1 overflow-hidden rounded-full bg-[#FFFDFA]/[0.06]">
                          <motion.span
                            className="block h-full rounded-full bg-[#3FC8D8]"
                            initial={{ width: 0 }}
                            animate={{ width: "97.5%" }}
                            transition={{ duration: 0.8, ease: ENTRANCE, delay: 0.2 }}
                          />
                        </span>
                      </div>

                      {/* KPI 3: PSC Inspection Readiness */}
                      <div className="rounded-xl border border-white/[0.08] bg-[#FFFDFA]/[0.02] p-4 transition-all hover:border-white/[0.14]">
                        <p className="font-mono text-[11px] uppercase tracking-[0.13em] text-white/50 font-bold sm:text-[11.5px]">
                          PSC Inspection Readiness
                        </p>
                        <p className="mt-3 text-[32px] font-bold leading-none tracking-[-0.03em] text-white sm:text-[38px]">
                          <CountUp to={91.8} decimals={1} />
                          <span className="text-[18px] font-bold text-white/55 ml-0.5">%</span>
                        </p>
                        <span className="mt-4 block h-1 overflow-hidden rounded-full bg-[#FFFDFA]/[0.06]">
                          <motion.span
                            className="block h-full rounded-full bg-[#8B5CF6]"
                            initial={{ width: 0 }}
                            animate={{ width: "91.8%" }}
                            transition={{ duration: 0.8, ease: ENTRANCE, delay: 0.3 }}
                          />
                        </span>
                      </div>

                      {/* KPI 4: Critical Deficiencies */}
                      <div className="rounded-xl border border-[#F0526B]/30 bg-[#F0526B]/[0.07] p-4">
                        <p className="font-mono text-[11px] uppercase tracking-[0.13em] text-[#F0526B]/80 font-bold sm:text-[11.5px]">
                          Critical Deficiencies
                        </p>
                        <p className="mt-3 text-[32px] font-bold leading-none tracking-[-0.03em] text-white sm:text-[38px]">
                          <CountUp to={1} />
                          <span className="text-[18px] font-bold text-[#F0526B] ml-1">Flagged</span>
                        </p>
                        <p className="mt-3 font-mono text-[11px] text-[#F0526B] font-bold sm:text-[11.5px]">
                          Starboard Lifeboat Release · Cosco Galaxy
                        </p>
                      </div>
                    </div>

                    {/* Middle Row 1: Fleet Distribution Radial Chart + Monthly Volume */}
                    <div className="grid gap-4 lg:grid-cols-[1fr_1.35fr]">
                      {/* Vessel Class Breakdown */}
                      <DashboardCard
                        title="Maritime Fleet Class Distribution"
                        accentColor="#8B5CF6"
                      >
                        <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row">
                          <div className="relative grid h-[140px] w-[140px] shrink-0 place-items-center">
                            <svg className="h-full w-full -rotate-90" viewBox="0 0 42 42">
                              <circle
                                cx="21"
                                cy="21"
                                r="15.915"
                                fill="transparent"
                                stroke="currentColor"
                                className="text-white/[0.05]"
                                strokeWidth="4"
                              />
                              {MARITIME_DATA.vesselClasses.map((item, index) => {
                                const fraction = item.percent / 100;
                                const offset = MARITIME_DATA.vesselClasses.slice(0, index).reduce(
                                  (sum, current) => sum + current.percent / 100,
                                  0
                                );
                                return (
                                  <motion.circle
                                    key={item.label}
                                    cx="21"
                                    cy="21"
                                    r="15.915"
                                    fill="transparent"
                                    stroke={item.color}
                                    strokeWidth="4.2"
                                    pathLength={1}
                                    strokeDasharray={`${fraction} ${1 - fraction}`}
                                    strokeDashoffset={-offset}
                                    initial={{ strokeDasharray: "0 1" }}
                                    animate={{ strokeDasharray: `${fraction} ${1 - fraction}` }}
                                    transition={{
                                      duration: 0.8,
                                      ease: ENTRANCE,
                                      delay: 0.1 + index * 0.05,
                                    }}
                                  />
                                );
                              })}
                            </svg>
                            <span className="absolute inset-0 grid place-items-center text-center">
                              <span>
                                <span className="block text-[20px] font-black leading-none text-white">
                                  <CountUp to={28} />
                                </span>
                                <span className="mt-1 block font-mono text-[9.5px] uppercase tracking-[0.14em] text-white/50 font-bold">
                                  Vessels
                                </span>
                              </span>
                            </span>
                          </div>

                          <ul className="min-w-0 flex-1 space-y-2.5 w-full">
                            {MARITIME_DATA.vesselClasses.map((item) => (
                              <li key={item.label} className="flex items-center justify-between gap-2 text-xs">
                                <span className="flex items-center gap-2 truncate">
                                  <span
                                    className="h-2 w-2 shrink-0 rounded-full"
                                    style={{ background: item.color }}
                                  />
                                  <span className="truncate text-white/80 font-bold">{item.label}</span>
                                </span>
                                <span className="font-mono text-white font-black">
                                  {item.value} ({item.percent}%)
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </DashboardCard>

                      {/* Monthly Inspections & Voyage Volume Chart */}
                      <DashboardCard
                        title="Fleet Voyage Volume & Safety Inspections Logged"
                        accentColor="#3FC8D8"
                        badge={
                          <span className="font-mono text-[10.5px] text-[#3FC8D8] font-bold">
                            +22.4% Q3 Growth
                          </span>
                        }
                      >
                        <div className="mt-4 flex h-[140px] items-end justify-between gap-2 pt-2">
                          {[
                            ["Mar", 42],
                            ["Apr", 58],
                            ["May", 64],
                            ["Jun", 71],
                            ["Jul", 85],
                            ["Aug", 94],
                          ].map(([month, val], i) => (
                            <div key={month as string} className="flex flex-1 flex-col items-center gap-2 h-full justify-end">
                              <span className="text-[10px] font-mono text-white/60 font-bold">{val}</span>
                              <div className="w-full max-w-[28px] bg-white/[0.05] rounded-t-sm h-full flex flex-col justify-end overflow-hidden">
                              <motion.div
                                className="w-full rounded-t-sm bg-gradient-to-t from-[#8B5CF6] to-[#3FC8D8]"
                                initial={{ height: 0 }}
                                animate={{ height: `${val}%` }}
                                transition={{ duration: 0.6, delay: i * 0.05, ease: ENTRANCE }}
                              />
                              </div>
                              <span className="text-[10px] font-mono text-white/50 font-bold">{month}</span>
                            </div>
                          ))}
                        </div>
                      </DashboardCard>
                    </div>

                    {/* Middle Row 2: Vessel Readiness & AI Marine Precision */}
                    <div className="grid gap-4 lg:grid-cols-2">
                      <DashboardCard
                        title="Vessel Seaworthiness & Active Voyage Routes"
                        accentColor="#2FBF71"
                        badge={
                          <span className="font-mono text-[10.5px] uppercase tracking-wider text-white/60 font-bold">
                            23 of 28 At Sea
                          </span>
                        }
                      >
                        <div className="mt-5 space-y-3.5">
                          {MARITIME_DATA.vesselScores.map((vessel, index) => (
                            <DashboardMeter
                              key={vessel.name}
                              label={vessel.name}
                              display={`${vessel.score}%`}
                              percent={vessel.score}
                              color={vessel.color}
                              delay={index * 0.07}
                            />
                          ))}
                        </div>
                      </DashboardCard>

                      <DashboardCard
                        title="AI Marine Computer Vision & Anomaly Precision"
                        accentColor="#3FC8D8"
                        badge={
                          <span className="font-mono text-[10.5px] uppercase tracking-wider text-[#3FC8D8] font-bold">
                            SCIO SeaOps Engine v4.2
                          </span>
                        }
                      >
                        <div className="mt-5 space-y-3.5">
                          {MARITIME_DATA.aiPrecision.map((item, index) => (
                            <DashboardMeter
                              key={item.label}
                              label={item.label}
                              display={`${item.val}%`}
                              percent={item.val}
                              color="#3FC8D8"
                              delay={index * 0.07}
                            />
                          ))}
                        </div>
                      </DashboardCard>
                    </div>

                    {/* Bottom Operational Telemetry Footer Cards */}
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="rounded-xl border border-white/[0.08] bg-[#FFFDFA]/[0.02] p-4 transition-all hover:border-white/[0.14]">
                        <p className="font-mono text-[11px] uppercase tracking-[0.13em] text-white/50 font-bold sm:text-[11.5px]">
                          Bunker &amp; Supply Bottlenecks
                        </p>
                        <p className="mt-3 flex items-baseline gap-2">
                          <span className="text-[26px] font-black leading-none text-white">2 Alerts</span>
                          <span className="text-[12.5px] font-bold text-[#E8A33D]">Rotterdam → Houston</span>
                        </p>
                        <p className="mt-2.5 text-[12px] leading-relaxed text-white/50 font-medium">
                          Spares delayed 48h · Aux injector work order prioritized for arrival berth.
                        </p>
                      </div>

                      <div className="rounded-xl border border-white/[0.08] bg-[#FFFDFA]/[0.02] p-4 transition-all hover:border-white/[0.14]">
                        <p className="font-mono text-[11px] uppercase tracking-[0.13em] text-white/50 font-bold sm:text-[11.5px]">
                          Active Maritime Crew &amp; Checklists
                        </p>
                        <p className="mt-3 flex items-baseline gap-2">
                          <span className="text-[26px] font-black leading-none text-white">28 Active</span>
                          <span className="text-[12.5px] font-bold text-[#2FBF71]">4 offline encrypted</span>
                        </p>
                        <p className="mt-2.5 text-[12px] leading-relaxed text-white/50 font-medium">
                          Encrypted voyage checklists synchronize immediately upon satellite bridge reconnect.
                        </p>
                      </div>

                      <div className="rounded-xl border border-white/[0.08] bg-[#FFFDFA]/[0.02] p-4 transition-all hover:border-white/[0.14]">
                        <p className="font-mono text-[11px] uppercase tracking-[0.13em] text-white/50 font-bold sm:text-[11.5px]">
                          Fleet Machinery Defect Trend
                        </p>
                        <p className="mt-3 flex items-baseline gap-2">
                          <span className="text-[26px] font-black leading-none text-white">−24%</span>
                          <span className="text-[12.5px] font-bold text-[#2FBF71]">90-day improvement</span>
                        </p>
                        <p className="mt-2.5 text-[12px] leading-relaxed text-white/50 font-medium">
                          Propulsion bearing vibration anomalies reduced following condition-based lubrication.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ==================== TAB 2: FLEET & AIS TRACKING ==================== */}
                {dashboardTab === "Fleet & AIS Tracking" && (
                  <motion.div
                    key="fleet-tab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <div className="rounded-xl border border-white/[0.08] bg-[#FFFDFA]/[0.02] p-5">
                      <div className="flex items-center justify-between mb-4 border-b border-white/[0.07] pb-3">
                        <h3 className="text-sm font-black text-white">Live AIS Maritime Fleet Registry</h3>
                        <span className="font-mono text-[10px] text-[#2FBF71] bg-[#2FBF71]/10 px-2 py-0.5 rounded border border-[#2FBF71]/20 font-bold uppercase">
                          28 VESSELS SYNCED
                        </span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs font-mono">
                          <thead>
                            <tr className="border-b border-white/[0.07] text-white/60 font-bold">
                              <th className="pb-2">VESSEL NAME</th>
                              <th className="pb-2">TYPE</th>
                              <th className="pb-2">CURRENT VOYAGE</th>
                              <th className="pb-2 text-right">SEAWORTHINESS</th>
                              <th className="pb-2 text-right">STATUS</th>
                              <th className="pb-2 text-right">ACTION</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/[0.04]">
                            {MARITIME_DATA.vesselScores.map((v) => (
                              <tr key={v.name} className="hover:bg-white/[0.02] transition-colors">
                                <td className="font-bold text-white py-3">{v.name}</td>
                                <td className="py-3 text-white/70">Container</td>
                                <td className="py-3 text-[#3FC8D8] font-bold">{v.route}</td>
                                <td className="text-right py-3 font-black" style={{ color: v.color }}>{v.score}%</td>
                                <td className="text-right py-3">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                    v.status === "At Sea" ? "bg-[#2FBF71]/15 text-[#2FBF71] border border-[#2FBF71]/30" :
                                    v.status === "Anchored" ? "bg-[#3FC8D8]/15 text-[#3FC8D8] border border-[#3FC8D8]/30" :
                                    "bg-[#F0526B]/15 text-[#F0526B] border border-[#F0526B]/30"
                                  }`}>
                                    {v.status}
                                  </span>
                                </td>
                                <td className="text-right py-3">
                                  <a
                                    href="/?launch=1&industry=maritime&tab=dashboard"
                                    onClick={(e) => handleNavClick(e, "maritime", "dashboard")}
                                    className="text-white/50 hover:text-white inline-block"
                                  >
                                    <ChevronRight className="h-4 w-4 ml-auto" />
                                  </a>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ==================== TAB 3: INSPECTIONS & SAFETY ==================== */}
                {dashboardTab === "Inspections & Safety" && (
                  <motion.div
                    key="inspections-tab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <div className="rounded-xl border border-white/[0.08] bg-[#FFFDFA]/[0.02] p-5">
                      <div className="flex items-center justify-between mb-4 border-b border-white/[0.07] pb-3">
                        <h3 className="text-sm font-black text-white">Port State Control (PSC) Deficiency &amp; Safety Audits</h3>
                        <span className="font-mono text-[10px] text-[#F0526B] bg-[#F0526B]/10 px-2 py-0.5 rounded border border-[#F0526B]/20 font-bold uppercase">
                          1 Critical / CAPA Pending
                        </span>
                      </div>

                      <div className="divide-y divide-white/[0.05]">
                        {MARITIME_DATA.inspections.map((insp, idx) => (
                          <div key={idx} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
                            <div className="flex items-center gap-3">
                              <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${
                                insp.severity === "Critical" ? "bg-[#F0526B]" : insp.severity === "Warning" ? "bg-[#E8A33D]" : "bg-[#2FBF71]"
                              }`} />
                              <div>
                                <span className="font-bold text-white text-sm block">{insp.item}</span>
                                <span className="text-white/50 text-[11px]">{insp.vessel} · Logged {insp.date}</span>
                              </div>
                            </div>
                            <span className={`px-2.5 py-1 rounded text-[10.5px] font-bold shrink-0 self-start sm:self-auto ${
                              insp.status === "Certified" ? "bg-[#2FBF71]/15 text-[#2FBF71] border border-[#2FBF71]/30" : "bg-[#F0526B]/15 text-[#F0526B] border border-[#F0526B]/30"
                            }`}>
                              {insp.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ==================== TAB 4: BUNKERING & MRO ==================== */}
                {dashboardTab === "Bunkering & MRO" && (
                  <motion.div
                    key="bunker-tab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <div className="rounded-xl border border-white/[0.08] bg-[#FFFDFA]/[0.02] p-5">
                      <div className="flex items-center justify-between mb-4 border-b border-white/[0.07] pb-3">
                        <h3 className="text-sm font-black text-white">Bunker Fuel ROB (Remaining On Board) Status</h3>
                        <span className="font-mono text-[10px] text-[#3FC8D8] bg-[#3FC8D8]/10 px-2 py-0.5 rounded border border-[#3FC8D8]/20 font-bold uppercase">
                          ISO 8217 VERIFIED
                        </span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs font-mono">
                          <thead>
                            <tr className="border-b border-white/[0.07] text-white/60 font-bold">
                              <th className="pb-2">VESSEL</th>
                              <th className="pb-2">VLSFO ON BOARD</th>
                              <th className="pb-2">MGO ON BOARD</th>
                              <th className="pb-2">NEXT BUNKER PORT</th>
                              <th className="pb-2 text-right">RESERVE STATUS</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/[0.04]">
                            {MARITIME_DATA.bunkerStatus.map((b) => (
                              <tr key={b.vessel} className="hover:bg-white/[0.02] transition-colors">
                                <td className="font-bold text-white py-3">{b.vessel}</td>
                                <td className="py-3 text-white font-bold">{b.vlsfo}</td>
                                <td className="py-3 text-white/80">{b.mgo}</td>
                                <td className="py-3 text-[#3FC8D8] font-bold">{b.nextPort}</td>
                                <td className="text-right py-3">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                    b.status === "Optimal" ? "bg-[#2FBF71]/15 text-[#2FBF71] border border-[#2FBF71]/30" : "bg-[#E8A33D]/15 text-[#E8A33D] border border-[#E8A33D]/30"
                                  }`}>
                                    {b.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ==================== TAB 5: SAFETY EQUIPMENT ==================== */}
                {dashboardTab === "Safety Equipment" && (
                  <motion.div
                    key="safety-tab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="grid gap-4 sm:grid-cols-3"
                  >
                    <div className="rounded-xl border border-white/[0.08] bg-[#FFFDFA]/[0.02] p-4">
                      <ShieldCheck className="h-6 w-6 text-[#2FBF71] mb-2" />
                      <h4 className="font-bold text-white text-sm">Lifeboats & Survival Gear</h4>
                      <p className="text-xs text-white/50 mt-1">Life rafts, emergency beacons, and immersion suits inspected and certified.</p>
                      <span className="mt-3 inline-block font-mono text-[10px] text-[#2FBF71] font-bold">100% INSPECTED</span>
                    </div>

                    <div className="rounded-xl border border-white/[0.08] bg-[#FFFDFA]/[0.02] p-4">
                      <Radio className="h-6 w-6 text-[#3FC8D8] mb-2" />
                      <h4 className="font-bold text-white text-sm">Fuel & Emissions Log</h4>
                      <p className="text-xs text-white/50 mt-1">Fuel consumption and clean exhaust readings verified across all active routes.</p>
                      <span className="mt-3 inline-block font-mono text-[10px] text-[#3FC8D8] font-bold">OPTIMAL STATUS</span>
                    </div>

                    <div className="rounded-xl border border-white/[0.08] bg-[#FFFDFA]/[0.02] p-4">
                      <Anchor className="h-6 w-6 text-[#8B5CF6] mb-2" />
                      <h4 className="font-bold text-white text-sm">Routine Ship Walkthroughs</h4>
                      <p className="text-xs text-white/50 mt-1">Deck, hull, and engine room safety checklists completed on all 28 vessels.</p>
                      <span className="mt-3 inline-block font-mono text-[10px] text-[#8B5CF6] font-bold">ALL SHIPS PASSED</span>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </motion.div>

        </div>
      </section>

    </>
  );
}
