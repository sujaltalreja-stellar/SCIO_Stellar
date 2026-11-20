"use client";

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { SITE_SHELL } from "../site/SiteLayout";
import { Eyebrow, HEADING_SCALE, SectionHeading } from "../site/blocks";

const CASES = [
  {
    id: "inventory",
    tab: "Inventory",
    title: "Reorder the right stock, in the right store, before it runs out.",
    body: "SCIO watches stock across every store and warehouse and drafts the transfers and orders for you to approve.",
    img: "/images/warehouse-inventory-shelves.webp",
    alt: "Warehouse shelves stocked with inventory boxes",
    to: "/use-cases#inventory",
  },
  {
    id: "sales",
    tab: "Sales",
    title: "See every store, channel and product in one place.",
    body: "Live sales against target, with the reason behind every dip, across all your stores and channels.",
    img: "/images/retail-store-aisle-inventory.webp",
    alt: "Retail store aisle with stocked shelves",
    to: "/use-cases#sales",
  },
  {
    id: "purchasing",
    tab: "Purchasing",
    title: "Draft purchase orders and keep suppliers on time.",
    body: "Purchase orders are prepared from real demand, and late deliveries are flagged before they hurt.",
    img: "/images/distribution-center-stock.webp",
    alt: "Distribution centre with stock ready to ship",
    to: "/use-cases#purchasing",
  },
  {
    id: "finance",
    tab: "Finance",
    title: "Read invoices and POs, match them, flag the gaps.",
    body: "Documents are read and matched automatically, so only the exceptions need a person.",
    img: "/images/invoices-and-finance-documents.webp",
    alt: "Invoices and finance documents on a desk",
    to: "/use-cases#finance",
  },
  {
    id: "approvals",
    tab: "Approvals",
    title: "Send every action to the right person to approve.",
    body: "Every fix goes to the right owner, with the evidence attached and a full audit trail.",
    img: "/images/point-of-sale-checkout-tablet.webp",
    alt: "Store employee using a point-of-sale tablet at checkout",
    to: "/use-cases#approvals",
  },
];

const EASE = [0.22, 1, 0.36, 1] as const;

export default function UseCasesTabs() {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const c = CASES[index];

  const onKey = (e: React.KeyboardEvent, i: number) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = (i + (e.key === "ArrowRight" ? 1 : -1) + CASES.length) % CASES.length;
    setIndex(next);
    document.getElementById(`uc-tab-${CASES[next].id}`)?.focus();
  };

  return (
    <section id="use-cases" className="border-y border-[#E7E5E1] bg-white" aria-labelledby="use-cases-heading">
      <div className={`${SITE_SHELL} pb-20 pt-20 sm:pb-28 sm:pt-28`}>
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          <Eyebrow>Use cases</Eyebrow>
          <SectionHeading id="use-cases-heading" className="mt-4">
            Built for the work that runs your business
          </SectionHeading>
        </div>

        <div className="mt-12 overflow-hidden rounded-2xl border border-[#E7E5E1] bg-white sm:mt-14">
          {/* Tabs */}
          <div
            role="tablist"
            aria-label="Use cases"
            className="flex overflow-x-auto border-b border-[#E7E5E1] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {CASES.map((t, i) => {
              const active = i === index;
              return (
                <button
                  key={t.id}
                  id={`uc-tab-${t.id}`}
                  role="tab"
                  type="button"
                  aria-selected={active}
                  aria-controls="uc-panel"
                  tabIndex={active ? 0 : -1}
                  onClick={() => setIndex(i)}
                  onKeyDown={(e) => onKey(e, i)}
                  className={`h-14 min-w-[132px] flex-1 cursor-pointer whitespace-nowrap border-r border-[#E7E5E1] px-5 text-[15px] font-medium transition-colors duration-200 last:border-r-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#F2A93B] ${
                    active ? "bg-[#111113] text-white" : "bg-white text-[#3a3936] hover:bg-[#F6F5F3]"
                  }`}
                >
                  {t.tab}
                </button>
              );
            })}
          </div>

          {/* Panel */}
          <div id="uc-panel" role="tabpanel" aria-labelledby={`uc-tab-${c.id}`} className="grid lg:grid-cols-2">
            <div className="relative aspect-[4/3] overflow-hidden bg-[#111113] lg:aspect-auto lg:min-h-[500px]">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.img
                  key={c.id}
                  src={c.img}
                  alt={c.alt}
                  width={900}
                  height={1125}
                  loading="lazy"
                  initial={reduceMotion ? false : { opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={reduceMotion ? undefined : { opacity: 0 }}
                  transition={{ duration: 0.6, ease: EASE }}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </AnimatePresence>
              <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
              <span className="absolute bottom-5 left-5 rounded-full bg-black/55 px-3.5 py-1.5 text-[12px] font-semibold uppercase tracking-[0.12em] text-white backdrop-blur">
                {c.tab}
              </span>
            </div>

            <div className="flex min-h-[320px] flex-col justify-between gap-10 p-7 sm:p-10 lg:p-14">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={c.id}
                  initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, y: -10 }}
                  transition={{ duration: 0.35, ease: EASE }}
                  className="flex flex-1 flex-col justify-between gap-10"
                >
                  <div>
                    <h3
                      className="font-display font-medium text-[#111113] text-balance"
                      style={HEADING_SCALE.sub}
                    >
                      {c.title}
                    </h3>
                    <p className="mt-5 max-w-[34rem] text-[16px] leading-[1.65] text-[#5D5A54] sm:text-[17px]">{c.body}</p>
                  </div>
                  <Link
                    to={c.to}
                    className="group inline-flex min-h-11 w-fit items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.12em] text-[#111113] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2A93B]"
                  >
                    Explore {c.tab}
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
                  </Link>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
