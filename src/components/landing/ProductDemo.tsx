"use client";

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { CheckCircle2, Pause, Play } from "lucide-react";

// A looping, video-like walkthrough built from real SCIO screenshots with a fake cursor.
// Coordinates are % of the screenshot (captured at 1440x900).
type Step = { x: number; y: number; click?: boolean; hold?: number };
type Scene = { img: string; alt: string; title: string; caption: string; steps: Step[]; toast?: string };

const SIDEBAR = { ask: { x: 6.5, y: 13.6 }, intelligence: { x: 7, y: 18.5 }, home: { x: 5.8, y: 23.3 }, settings: { x: 6.2, y: 95 } };

const SCENES: Scene[] = [
  {
    img: "/images/scio-priority-actions-home.webp",
    alt: "SCIO home screen with priority actions",
    title: "Start with what matters",
    caption: "SCIO ranks today's issues by the money at stake.",
    steps: [
      { x: 60, y: 40, hold: 500 },
      { x: 91, y: 54, hold: 900 },
      { ...SIDEBAR.intelligence, click: true },
    ],
  },
  {
    img: "/images/scio-intelligence-dashboard.webp",
    alt: "SCIO intelligence dashboard",
    title: "See what your ERP can't",
    caption: "Money leaking today, value protected, and what runs out next.",
    steps: [
      { x: 28, y: 48, hold: 1100 },
      { x: 62, y: 72, hold: 700 },
      { ...SIDEBAR.ask, click: true },
    ],
  },
  {
    img: "/images/scio-ai-assistant-answer-with-approvals.webp",
    alt: "SCIO assistant answer with actions ready to approve",
    title: "Ask, then approve the fix",
    caption: "SCIO explains the cause and drafts the actions for you to approve.",
    steps: [
      { x: 45, y: 22, hold: 900 },
      { x: 60, y: 45, hold: 700 },
      { x: 85, y: 64, click: true, hold: 1400 },
      { ...SIDEBAR.settings, click: true },
    ],
    toast: "Approved · 10 stock transfers sent",
  },
  {
    img: "/images/scio-connected-business-systems.webp",
    alt: "SCIO connected systems map",
    title: "Every system, one context",
    caption: "ERP, POS, WMS, CRM and more feed one live picture.",
    steps: [
      { x: 49.5, y: 76, hold: 1300 },
      { x: 78, y: 60, hold: 600 },
      { ...SIDEBAR.home, click: true },
    ],
  },
];

const MOVE_MS = 850;

function Cursor() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" className="drop-shadow-[0_3px_6px_rgba(0,0,0,0.35)]" aria-hidden="true">
      <path d="M5 3l14 7.5-6.3 1.6L9.7 19 5 3z" fill="#111113" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

export default function ProductDemo({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.35 });
  const still = !!useReducedMotion();
  const [scene, setScene] = useState(0);
  const [step, setStep] = useState(0);
  const [clickKey, setClickKey] = useState(0);
  const [toast, setToast] = useState(false);
  const [paused, setPaused] = useState(false);

  const running = inView && !paused && !still;
  const s = SCENES[scene];
  const target = s.steps[Math.min(step, s.steps.length - 1)];

  // Timeline clock: move → (click) → hold → next step. Progress lives in refs, so re-renders or
  // brief visibility changes never restart a step; time only accrues while running.
  const pos = useRef({ scene: 0, step: 0, elapsed: 0, clicked: false });
  useEffect(() => {
    if (!running) return;
    let last = performance.now();
    const id = window.setInterval(() => {
      const now = performance.now();
      const p = pos.current;
      p.elapsed += now - last;
      last = now;
      const sc = SCENES[p.scene];
      const st = sc.steps[p.step];
      if (st.click && !p.clicked && p.elapsed >= MOVE_MS) {
        p.clicked = true;
        setClickKey((k) => k + 1);
        if (sc.toast && p.step === sc.steps.length - 2) setToast(true);
      }
      const total = MOVE_MS + (st.hold ?? (st.click ? 380 : 600));
      if (p.elapsed >= total) {
        p.elapsed = 0;
        p.clicked = false;
        if (p.step + 1 < sc.steps.length) {
          p.step += 1;
        } else {
          p.step = 0;
          p.scene = (p.scene + 1) % SCENES.length;
          setToast(false);
          setScene(p.scene);
        }
        setStep(p.step);
      }
    }, 60);
    return () => window.clearInterval(id);
  }, [running]);

  // Preload all screens once.
  useEffect(() => {
    SCENES.forEach((sc) => {
      const i = new Image();
      i.src = sc.img;
    });
  }, []);

  const jump = (i: number) => {
    pos.current = { scene: i, step: 0, elapsed: 0, clicked: false };
    setToast(false);
    setScene(i);
    setStep(0);
  };

  return (
    <div ref={ref} className={`relative ${className}`}>
      <div className="overflow-hidden rounded-2xl border border-[#E7E5E1] bg-white shadow-[0_40px_100px_-36px_rgba(17,17,19,0.45)]">
        {/* Browser chrome */}
        <div className="flex items-center gap-2 border-b border-[#EFEEEB] bg-[#F7F6F4] px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
          <span className="ml-3 truncate rounded-md bg-white px-3 py-0.5 text-[11px] text-[#8f8b84]">stellarscio.app/app</span>
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            aria-label={paused ? "Play demo" : "Pause demo"}
            className="ml-auto flex h-7 w-7 items-center justify-center rounded-full text-[#6b6862] hover:bg-white hover:text-[#111113] cursor-pointer"
          >
            {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
          </button>
        </div>

        {/* Screen */}
        <div className="relative aspect-[16/10] overflow-hidden bg-[#F7F6F4]">
          <AnimatePresence initial={false}>
            <motion.img
              key={s.img}
              src={s.img}
              alt={s.alt}
              width={2160}
              height={1350}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover object-left-top"
              initial={{ opacity: 0, scale: 1.015 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45 }}
            />
          </AnimatePresence>

          {/* Toast */}
          <AnimatePresence>
            {toast && s.toast && (
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8 }}
                className="absolute bottom-[7%] left-1/2 -translate-x-1/2 inline-flex items-center gap-2 rounded-full bg-[#111113] px-4 py-2 text-[13px] font-semibold text-white shadow-xl"
              >
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                {s.toast}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Cursor + click ripple */}
          {!still && (
            <motion.div
              className="pointer-events-none absolute left-0 top-0 z-10"
              initial={false}
              animate={{ left: `${target.x}%`, top: `${target.y}%` }}
              transition={{ duration: MOVE_MS / 1000, ease: [0.45, 0, 0.2, 1] }}
            >
              <AnimatePresence>
                <motion.span
                  key={clickKey}
                  className="absolute -left-4 -top-4 h-8 w-8 rounded-full border-2 border-[#F2A93B] bg-[#F2A93B]/25"
                  initial={{ scale: 0.3, opacity: clickKey ? 1 : 0 }}
                  animate={{ scale: 1.6, opacity: 0 }}
                  transition={{ duration: 0.55, ease: "easeOut" }}
                />
              </AnimatePresence>
              <motion.div key={`c${clickKey}`} initial={{ scale: clickKey ? 0.82 : 1 }} animate={{ scale: 1 }} transition={{ duration: 0.2 }}>
                <Cursor />
              </motion.div>
            </motion.div>
          )}
        </div>

        {/* Caption + progress */}
        <div className="flex flex-col gap-3 border-t border-[#EFEEEB] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0" aria-live="polite">
            <p className="text-[15px] font-semibold text-[#111113]">{s.title}</p>
            <p className="text-[13.5px] text-[#5D5A54]">{s.caption}</p>
          </div>
          <div className="flex shrink-0 gap-1.5" role="group" aria-label="Demo steps">
            {SCENES.map((sc, i) => (
              <button
                key={sc.title}
                type="button"
                onClick={() => jump(i)}
                aria-label={`Show step ${i + 1}: ${sc.title}`}
                aria-current={i === scene}
                className="group h-6 py-2.5 cursor-pointer"
              >
                <span className={`block h-1 rounded-full transition-all ${i === scene ? "w-8 bg-[#F2A93B]" : "w-4 bg-[#D6D3CE] group-hover:bg-[#8f8b84]"}`} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
