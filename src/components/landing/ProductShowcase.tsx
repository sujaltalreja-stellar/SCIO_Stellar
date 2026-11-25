"use client";

import React, { useCallback, useRef, useState } from "react";
import { MessageSquareText, Brain, LayoutDashboard, Network, ListChecks } from "lucide-react";
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { SITE_SHELL } from "../site/SiteLayout";
import { Eyebrow, SectionHeading } from "../site/blocks";
import { scrollToTarget } from "../../lib/smoothScroll";

// Real screenshots of the SCIO app (/app), captured from the live product with a demo user name.
const SCREENS = [
  {
    id: "ask",
    label: "Ask SCIO",
    icon: MessageSquareText,
    title: "Ask in plain words. Get the fix.",
    body: "Answers with the reason and the next step, ready to approve.",
    img: "/images/scio-ai-assistant-answer-with-approvals.webp",
    alt: "SCIO AI assistant explaining why a store is underperforming, with stock transfers and a technician dispatch ready to approve",
  },
  {
    id: "intelligence",
    label: "Intelligence",
    icon: Brain,
    title: "See where money leaks.",
    body: "Losses, savings and risks, all in one view.",
    img: "/images/scio-intelligence-dashboard.webp",
    alt: "SCIO intelligence dashboard showing money leaking today, value protected, items running out and supplier cost",
  },
  {
    id: "command",
    label: "Command Center",
    icon: LayoutDashboard,
    title: "Your business on one screen.",
    body: "Live sales, stock and supplier health, every store.",
    img: "/images/scio-command-center-dashboard.webp",
    alt: "SCIO command center with live sales, health score, stockout risk, overstock and supplier delay metrics",
  },
  {
    id: "actions",
    label: "Priority actions",
    icon: ListChecks,
    title: "Know what to fix first.",
    body: "Problems ranked by the money at stake.",
    img: "/images/scio-priority-actions-home.webp",
    alt: "SCIO home screen listing priority actions such as out-of-stock items and a store losing sales",
  },
  {
    id: "systems",
    label: "Connected systems",
    icon: Network,
    title: "All your tools, connected.",
    body: "ERP, POS, WMS and more. Nothing re-entered.",
    img: "/images/scio-connected-business-systems.webp",
    alt: "SCIO connected systems map showing ERP, POS, WMS, CRM, HRMS and other systems linked to SCIO",
  },
];

const N = SCREENS.length;
const EASE = [0.22, 1, 0.36, 1] as const;
const isDesktop = () => typeof window !== "undefined" && window.innerWidth >= 1024;

export default function ProductShowcase() {
  const reduceMotion = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const screen = SCREENS[index];

  // Scroll progress through the pinned track (0 → 1) drives the active screen on desktop.
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start start", "end end"] });
  const barScale = useTransform(scrollYProgress, [0, 1], [0, 1]);
  // The window rises and grows slightly as the stage arrives.
  const { scrollYProgress: enter } = useScroll({ target: trackRef, offset: ["start end", "start 20%"] });
  const scale = useTransform(enter, [0, 1], reduceMotion ? [1, 1] : [0.94, 1]);
  const y = useTransform(enter, [0, 1], reduceMotion ? [0, 0] : [40, 0]);

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    if (reduceMotion || !isDesktop()) return;
    const next = Math.min(N - 1, Math.max(0, Math.floor(p * N * 0.9999)));
    setIndex((cur) => (cur === next ? cur : next));
  });

  // Clicking a tab scrolls to that screen's part of the track (desktop) or just switches (mobile).
  const goTo = useCallback(
    (i: number) => {
      setIndex(i);
      const el = trackRef.current;
      if (!el || reduceMotion || !isDesktop()) return;
      const scrollable = el.offsetHeight - window.innerHeight;
      const top = el.getBoundingClientRect().top + window.scrollY;
      scrollToTarget(top + (scrollable * (i + 0.5)) / N, { offset: 0, duration: 1.2 });
    },
    [reduceMotion],
  );

  const onKey = (e: React.KeyboardEvent, i: number) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = (i + (e.key === "ArrowRight" ? 1 : -1) + N) % N;
    goTo(next);
    document.getElementById(`tab-${SCREENS[next].id}`)?.focus();
  };

  return (
    <section id="product" className="bg-[#0F0F11] text-white" aria-labelledby="showcase-heading">
      {/* Heading (scrolls away before the stage pins) */}
      <div className={`${SITE_SHELL} pt-20 sm:pt-28`}>
        <motion.div
          className="mx-auto flex max-w-3xl flex-col items-center text-center"
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          <Eyebrow tone="light">The real product</Eyebrow>
          <SectionHeading id="showcase-heading" tone="light" className="mt-4">
            See SCIO at work
          </SectionHeading>
          <p className="mt-4 text-[17px] leading-relaxed text-white/65 sm:text-[19px]">Real screens from the live product. Scroll to explore.</p>
        </motion.div>
      </div>

      {/* Scroll track: tall on desktop so the stage stays pinned while the screens change */}
      <div ref={trackRef} className={reduceMotion ? "" : "lg:h-[420vh]"}>
        <div className={reduceMotion ? "" : "lg:sticky lg:top-[68px] lg:z-10 lg:flex lg:h-[calc(100dvh-68px)] lg:items-center lg:bg-[#0F0F11]"}>
          <div className={`${SITE_SHELL} w-full py-10 sm:py-12 lg:py-4`}>
            {/* Segmented control */}
            <div className="flex justify-center">
              <div
                role="tablist"
                aria-label="SCIO product screens"
                className="flex max-w-full gap-1 overflow-x-auto rounded-full border border-white/10 bg-white/[0.04] p-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {SCREENS.map((s, i) => {
                  const active = i === index;
                  return (
                    <button
                      key={s.id}
                      id={`tab-${s.id}`}
                      role="tab"
                      type="button"
                      tabIndex={active ? 0 : -1}
                      aria-selected={active}
                      aria-controls="showcase-panel"
                      aria-label={s.label}
                      onClick={() => goTo(i)}
                      onKeyDown={(e) => onKey(e, i)}
                      className={`relative inline-flex h-11 shrink-0 items-center gap-2 rounded-full px-4 text-[14.5px] font-medium transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2A93B] ${
                        active ? "text-[#111113]" : "text-white/65 hover:text-white"
                      }`}
                    >
                      {active && (
                        <motion.span
                          layoutId={reduceMotion ? undefined : "showcase-pill"}
                          className="absolute inset-0 rounded-full bg-white"
                          transition={{ type: "spring", stiffness: 420, damping: 36 }}
                        />
                      )}
                      <span className="relative z-10 inline-flex items-center gap-2">
                        <s.icon className="h-4 w-4" aria-hidden="true" />
                        <span className={active ? "inline" : "hidden sm:inline"}>{s.label}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Product window */}
            <motion.div
              style={{ scale, y }}
              className="relative mx-auto mt-8 w-full max-w-[1120px] lg:mt-6 lg:max-w-[min(1120px,calc((100dvh-68px-280px)*1.6))]"
            >
              <div aria-hidden="true" className="absolute inset-x-16 -top-8 h-32 rounded-full bg-[#F2A93B]/15 blur-3xl" />
              <div
                id="showcase-panel"
                role="tabpanel"
                aria-labelledby={`tab-${screen.id}`}
                className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#1A1A1E] shadow-[0_40px_120px_-30px_rgba(0,0,0,0.85)]"
              >
                <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5" aria-hidden="true">
                  <span className="h-3 w-3 rounded-full bg-[#FF5F57]" />
                  <span className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
                  <span className="h-3 w-3 rounded-full bg-[#28C840]" />
                  <span className="ml-3 rounded-md bg-white/5 px-3 py-1 text-[12px] text-white/50">stellarscio.app/app</span>
                </div>
                <div className="relative aspect-[16/10] w-full bg-[#1A1A1E]">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.img
                      key={screen.id}
                      src={screen.img}
                      alt={screen.alt}
                      width={2160}
                      height={1350}
                      loading="lazy"
                      decoding="async"
                      initial={reduceMotion ? false : { opacity: 0, y: 28, scale: 0.99 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={reduceMotion ? undefined : { opacity: 0, y: -20 }}
                      transition={{ duration: 0.45, ease: EASE }}
                      className="absolute inset-0 block h-full w-full object-cover object-top"
                    />
                  </AnimatePresence>
                </div>
                {/* scroll progress */}
                <div className="absolute inset-x-0 bottom-0 h-[3px] bg-white/10" aria-hidden="true">
                  <motion.div className="h-full origin-left bg-[#F2A93B]" style={{ scaleX: reduceMotion ? (index + 1) / N : barScale }} />
                </div>
              </div>
            </motion.div>

            {/* Caption + CTA */}
            <div
              className="mx-auto mt-6 flex max-w-[1120px] flex-col items-center text-center lg:mt-5"
              aria-live="polite"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={screen.id + "-cap"}
                  initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
                  transition={{ duration: 0.3, ease: EASE }}
                >
                  <h3 className="font-display text-[26px] font-bold leading-tight tracking-tight sm:text-[34px]">{screen.title}</h3>
                  <p className="mt-1.5 text-[15px] text-white/65 sm:text-[17px]">{screen.body}</p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <div className="h-16 sm:h-24 lg:h-10" aria-hidden="true" />
    </section>
  );
}
