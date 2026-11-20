"use client";

import React from "react";
import { motion } from "framer-motion";
import { Check, Minus, X } from "lucide-react";
import { SITE_SHELL } from "../site/SiteLayout";
import { Eyebrow, SectionHeading, reveal } from "../site/blocks";

/*
 * Market positioning: SCIO compared with the categories of tools a business already has.
 * Compares tool *categories* (not named vendors) and only claims what SCIO's product copy states.
 */

type Level = "yes" | "partial" | "no";
type Cell = { level: Level; note: string };
type Row = { label: string; cells: [Cell, Cell, Cell, Cell] };

const COLUMNS = ["ERP & POS suites", "BI dashboards", "Generic AI chatbots", "Stellar SCIO"] as const;
const SCIO = 3;

const ROWS: Row[] = [
  {
    label: "Sees ERP, POS, warehouse, HR and finance together",
    cells: [
      { level: "partial", note: "Only its own modules" },
      { level: "partial", note: "After a data project" },
      { level: "no", note: "No live business data" },
      { level: "yes", note: "Connects the systems you run" },
    ],
  },
  {
    label: "Answers questions in plain language",
    cells: [
      { level: "no", note: "Menus and fixed reports" },
      { level: "partial", note: "Analysts build the reports" },
      { level: "partial", note: "Not grounded in your data" },
      { level: "yes", note: "With sources and evidence" },
    ],
  },
  {
    label: "Flags problems before they cost money",
    cells: [
      { level: "no", note: "Found later in reports" },
      { level: "partial", note: "If someone checks the chart" },
      { level: "no", note: "Only when you ask" },
      { level: "yes", note: "Stockouts, late deliveries, unusual sales" },
    ],
  },
  {
    label: "Turns insight into action",
    cells: [
      { level: "partial", note: "Manual data entry" },
      { level: "no", note: "Read-only" },
      { level: "no", note: "Stops at the answer" },
      { level: "yes", note: "Drafts orders and transfers, written back" },
    ],
  },
  {
    label: "People approve, every step is logged",
    cells: [
      { level: "partial", note: "For its own transactions" },
      { level: "no", note: "Nothing to approve" },
      { level: "no", note: "Hard to trace" },
      { level: "yes", note: "Approvals by role, full audit trail" },
    ],
  },
  {
    label: "Runs on your own infrastructure",
    cells: [
      { level: "partial", note: "Depends on the vendor" },
      { level: "partial", note: "Often cloud only" },
      { level: "no", note: "Usually public cloud" },
      { level: "yes", note: "On-premises, private cloud or hybrid" },
    ],
  },
  {
    label: "Time to value",
    cells: [
      { level: "no", note: "Months of migration" },
      { level: "partial", note: "Quarters of data work" },
      { level: "partial", note: "Fast, but shallow" },
      { level: "yes", note: "Weeks, no rip-and-replace" },
    ],
  },
];

const LEVEL_LABEL: Record<Level, string> = { yes: "Yes", partial: "Partly", no: "No" };

function Mark({ level, onDark = false }: { level: Level; onDark?: boolean }) {
  const Icon = level === "yes" ? Check : level === "partial" ? Minus : X;
  const tone =
    level === "yes"
      ? "bg-[#F2A93B] text-[#111113]"
      : onDark
        ? "bg-white/10 text-white/70"
        : level === "partial"
          ? "bg-[#EFEEEB] text-[#5d5a54]"
          : "bg-[#F6F5F3] text-[#a19d96]";
  return (
    <span className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${tone}`}>
      <Icon className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden="true" />
      <span className="sr-only">{LEVEL_LABEL[level]}</span>
    </span>
  );
}

export default function PositioningCompare() {
  return (
    <section id="why-scio" aria-labelledby="compare-heading" className="bg-[#F6F5F3] border-y border-[#E7E5E1]">
      <div className={`${SITE_SHELL} py-20 sm:py-28`}>
        <motion.div {...reveal} className="mx-auto flex max-w-6xl flex-col items-center text-center">
          <Eyebrow>Why SCIO</Eyebrow>
          <SectionHeading id="compare-heading" className="mt-4 lg:whitespace-nowrap">
            Not another dashboard. Not another ERP.
          </SectionHeading>
          <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-[#4a4843] sm:text-[19px]">
            SCIO sits on top of the systems you already run and closes the gap between seeing a problem and fixing it.
          </p>
        </motion.div>

        {/* Desktop: comparison table with the SCIO column raised */}
        <motion.div {...reveal} className="mt-14 hidden lg:block">
          <table className="w-full border-separate border-spacing-0 text-left">
            <caption className="sr-only">How Stellar SCIO compares with ERP and POS suites, BI dashboards and generic AI chatbots</caption>
            <thead>
              <tr>
                <th scope="col" className="w-[26%] pb-5 pr-6 align-bottom text-[13px] font-semibold uppercase tracking-[0.12em] text-[#8f8b84]">
                  Capability
                </th>
                {COLUMNS.map((c, i) =>
                  i === SCIO ? (
                    <th
                      key={c}
                      scope="col"
                      className="theme-fixed scio-compare-col w-[20%] rounded-t-2xl bg-[#111113] px-5 pb-5 pt-6 align-bottom text-[17px] font-semibold text-white"
                    >
                      <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#F2A93B]">Built for this</span>
                      {c}
                    </th>
                  ) : (
                    <th key={c} scope="col" className="w-[18%] px-5 pb-5 align-bottom text-[15px] font-semibold text-[#3a3936]">
                      {c}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r, ri) => {
                const last = ri === ROWS.length - 1;
                return (
                  <tr key={r.label}>
                    <th scope="row" className="border-t border-[#E7E5E1] py-5 pr-6 align-top text-[16px] font-medium leading-snug text-[#111113]">
                      {r.label}
                    </th>
                    {r.cells.map((cell, ci) =>
                      ci === SCIO ? (
                        <td
                          key={ci}
                          className={`theme-fixed scio-compare-col border-t border-white/10 bg-[#111113] px-5 py-5 align-top ${last ? "rounded-b-2xl pb-7" : ""}`}
                        >
                          <span className="flex items-start gap-3">
                            <Mark level={cell.level} onDark />
                            <span className="text-[15px] font-medium leading-snug text-white">{cell.note}</span>
                          </span>
                        </td>
                      ) : (
                        <td key={ci} className="border-t border-[#E7E5E1] px-5 py-5 align-top">
                          <span className="flex items-start gap-3">
                            <Mark level={cell.level} />
                            <span className="text-[14.5px] leading-snug text-[#5d5a54]">{cell.note}</span>
                          </span>
                        </td>
                      ),
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </motion.div>

        {/* Mobile & tablet: one card per capability, SCIO first, the others below */}
        <ul className="mt-12 space-y-4 lg:hidden">
          {ROWS.map((r) => (
            <li key={r.label} className="rounded-2xl border border-[#E7E5E1] bg-white p-5 sm:p-6">
              <h3 className="text-[17px] font-semibold leading-snug text-[#111113]">{r.label}</h3>
              <div className="theme-fixed scio-compare-col mt-4 flex items-start gap-3 rounded-xl bg-[#111113] p-4">
                <Mark level={r.cells[SCIO].level} onDark />
                <span className="text-[15px] leading-snug text-white">
                  <span className="block text-[12px] font-semibold uppercase tracking-[0.12em] text-[#F2A93B]">Stellar SCIO</span>
                  {r.cells[SCIO].note}
                </span>
              </div>
              <dl className="mt-4 space-y-3">
                {r.cells.slice(0, SCIO).map((cell, ci) => (
                  <div key={ci} className="flex items-start gap-3">
                    <Mark level={cell.level} />
                    <div className="text-[14.5px] leading-snug">
                      <dt className="font-medium text-[#111113]">{COLUMNS[ci]}</dt>
                      <dd className="text-[#5d5a54]">{cell.note}</dd>
                    </div>
                  </div>
                ))}
              </dl>
            </li>
          ))}
        </ul>

        <p className="mt-8 text-center text-[13px] text-[#8f8b84]">
          Compares typical capabilities of each tool category, not specific vendors. SCIO works alongside your ERP and POS, which stay your system of record.
        </p>
      </div>
    </section>
  );
}
