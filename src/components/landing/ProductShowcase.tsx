"use client";

import React, { useState } from "react";
import { MessageSquareText, Brain, LayoutDashboard, Network, ListChecks, ArrowRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { SITE_SHELL } from "../site/SiteLayout";
import { Eyebrow } from "../site/blocks";

// Real screenshots of the SCIO app (/app), captured from the live product with a demo user name.
const SCREENS = [
  {
    id: "ask",
    label: "Ask SCIO",
    icon: MessageSquareText,
    title: "Ask a question. Get the answer, the reasons and the fix.",
    body: "SCIO checks your POS, ERP, WMS and other systems, explains why a store is underperforming, and drafts the transfers and dispatches for you to approve.",
    img: "/images/scio-ai-assistant-answer-with-approvals.webp",
    alt: "SCIO AI assistant explaining why a store is underperforming, with stock transfers and a technician dispatch ready to approve",
  },
  {
    id: "intelligence",
    label: "Intelligence",
    icon: Brain,
    title: "See what your ERP can't show you",
    body: "Money leaking today, value protected by SCIO, stock running out next and the true cost of each supplier, with an assistant on every page.",
    img: "/images/scio-intelligence-dashboard.webp",
    alt: "SCIO intelligence dashboard showing money leaking today, value protected, items running out and supplier cost",
  },
  {
    id: "command",
    label: "Command Center",
    icon: LayoutDashboard,
    title: "Your whole business on one screen",
    body: "Live sales against target, stockout risk, overstock, expiry, supplier delays and inventory losses across every store and country.",
    img: "/images/scio-command-center-dashboard.webp",
    alt: "SCIO command center with live sales, health score, stockout risk, overstock and supplier delay metrics",
  },
  {
    id: "actions",
    label: "Priority actions",
    icon: ListChecks,
    title: "Start each day with what matters most",
    body: "SCIO ranks the issues costing you money, shows the value at stake and lets you review, diagnose or assign each one in a click.",
    img: "/images/scio-priority-actions-home.webp",
    alt: "SCIO home screen listing priority actions such as out-of-stock items and a store losing sales",
  },
  {
    id: "systems",
    label: "Connected systems",
    icon: Network,
    title: "Every system, one context",
    body: "ERP, POS, WMS, CRM, HRMS, procurement and more, connected and synced, so nothing is re-entered and every figure has a source.",
    img: "/images/scio-connected-business-systems.webp",
    alt: "SCIO connected systems map showing ERP, POS, WMS, CRM, HRMS and other systems linked to SCIO",
  },
];

export default function ProductShowcase() {
  const [active, setActive] = useState(SCREENS[0].id);
  const screen = SCREENS.find((s) => s.id === active)!;

  return (
    <section id="product" className="bg-[#0F0F11] text-white" aria-labelledby="showcase-heading">
      <div className={`${SITE_SHELL} py-20 sm:py-28`}>
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div className="max-w-2xl">
            <Eyebrow tone="light">The real product</Eyebrow>
            <h2
              id="showcase-heading"
              className="mt-4 font-display font-bold text-white text-balance"
              style={{ fontSize: "clamp(32px, 4.4vw, 56px)", lineHeight: 1.05, letterSpacing: "-0.035em" }}
            >
              See SCIO at work
            </h2>
          </div>
          <a href="/app" className="group inline-flex items-center gap-1.5 text-[15px] font-semibold text-white hover:text-[#f2a93b]">
            Open SCIO <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>

        <div role="tablist" aria-label="SCIO product screens" className="mt-10 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {SCREENS.map((s) => (
            <button
              key={s.id}
              id={`tab-${s.id}`}
              role="tab"
              type="button"
              aria-selected={active === s.id}
              aria-controls={`panel-${s.id}`}
              onClick={() => setActive(s.id)}
              className={`shrink-0 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[15px] font-medium transition-colors cursor-pointer ${
                active === s.id ? "bg-white text-[#111113]" : "border border-white/15 text-white/70 hover:text-white"
              }`}
            >
              <s.icon className="h-4 w-4" aria-hidden="true" />
              {s.label}
            </button>
          ))}
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[0.62fr_1.38fr] lg:items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={screen.id + "-text"}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <h3 className="font-display text-[28px] sm:text-[32px] font-semibold leading-tight tracking-tight">{screen.title}</h3>
              <p className="mt-5 text-[17px] leading-relaxed text-white/70">{screen.body}</p>
            </motion.div>
          </AnimatePresence>

          <div
            id={`panel-${screen.id}`}
            role="tabpanel"
            aria-labelledby={`tab-${screen.id}`}
            className="overflow-hidden rounded-2xl border border-white/10 bg-[#1A1A1E] shadow-[0_40px_100px_-30px_rgba(0,0,0,0.8)]"
          >
            <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3" aria-hidden="true">
              <span className="h-3 w-3 rounded-full bg-[#FF5F57]" />
              <span className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
              <span className="h-3 w-3 rounded-full bg-[#28C840]" />
              <span className="ml-3 rounded-md bg-white/5 px-3 py-1 text-[12px] text-white/50">stellarscio.app/app</span>
            </div>
            <AnimatePresence mode="wait">
              <motion.img
                key={screen.id}
                src={screen.img}
                alt={screen.alt}
                width={2160}
                height={1350}
                loading="lazy"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="block w-full h-auto"
              />
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
