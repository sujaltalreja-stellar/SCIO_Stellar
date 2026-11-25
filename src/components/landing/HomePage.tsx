"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Plug,
  Network,
  MessageSquareText,
  CheckCircle2,
  Search,
  BellRing,
  ShieldCheck,
  Plus,
  Minus,
  Play,
  Pause,
  Maximize2,
  Volume2,
  VolumeX,
  Check,
  RotateCcw,
  RotateCw,
} from "lucide-react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { SITE_SHELL } from "../site/SiteLayout";
import { useSite } from "../site/SiteContext";
import { ArrowLink, ConnectBand, Eyebrow, PrimaryButton, SectionHeading, reveal } from "../site/blocks";
import { useSeo } from "../site/seo";
import { ENTERPRISE_QUESTIONS_DATA } from "../site/faqData";
import HeroCommandCenter from "./HeroCommandCenter";
import ProductShowcase from "./ProductShowcase";
import SystemsHub from "./SystemsHub";
import ErpTrust from "./ErpTrust";
import Industries from "./Industries";
import StaffAugmentation from "./StaffAugmentation";
import UseCasesTabs from "./UseCasesTabs";
import WatchItWork from "./WatchItWork";
import TrustedPlatforms from "./TrustedPlatforms";
import PositioningCompare from "./PositioningCompare";

// ---------- Content ----------

const OUTCOMES = [
  {
    icon: Search,
    title: "Ask instead of digging",
    body: "Type “which stores will run out of best-sellers this week?” and get the answer, with the numbers and sources behind it.",
  },
  {
    icon: BellRing,
    title: "Hear about problems first",
    body: "SCIO watches sales, stock, orders and suppliers together, and flags what needs attention before it costs you.",
  },
  {
    icon: CheckCircle2,
    title: "Act without switching tools",
    body: "Turn an insight into a purchase order, stock transfer or task, sent to the right person to approve.",
  },
  {
    icon: ShieldCheck,
    title: "Keep control of your data",
    body: "Runs on your infrastructure or private cloud. Every action is permissioned, approved and logged.",
  },
];

const STEPS = [
  { icon: Plug, step: "01", title: "Connect", body: "Plug SCIO into the ERP, POS, warehouse, HR and finance tools you already use. Nothing gets replaced." },
  { icon: Network, step: "02", title: "Understand", body: "SCIO links stores, products, orders, suppliers and people into one live picture of your business." },
  { icon: MessageSquareText, step: "03", title: "Ask", body: "Anyone can ask questions in plain language and get answers with the evidence attached." },
  { icon: CheckCircle2, step: "04", title: "Act", body: "Recommendations become approved actions, written back to your systems with a full audit trail." },
];

const FAQ_TEASER_IDS = [1, 2, 5, 10];

function SectionTitle({ children, className = "", as = "h2" }: { children: React.ReactNode; className?: string; as?: "h2" | "h3" }) {
  return <SectionHeading as={as} className={className}>{children}</SectionHeading>;
}

/** Drop the demo recording at /public/videos/hero-demo.mp4 (and optionally hero-demo.webm + hero-poster.webp). */
const HERO_VIDEO = { mp4: "/videos/hero-demo.mp4", poster: "/videos/hero-poster.webp" };

/** The five use cases as the hero background: five slanted photo panels side by side, one per tab in
 *  "Start with one problem" (Inventory, Sales, Purchasing, Finance, Approvals). Full colour. */
const HERO_SLICES = [
  // Photos: Pexels (free for commercial use, no attribution required). IDs for reference:
  // Inventory 4484078, Sales 36730427, Purchasing 34585121 (forklift unloading a supplier truck), Finance 8296970, Approvals 8729721 (manager signing)
  { label: "Inventory", src: "/images/hero-inventory.webp", pos: "50% 40%" },
  { label: "Sales", src: "/images/hero-sales.webp", pos: "30% 45%" },
  { label: "Purchasing", src: "/images/hero-purchasing.webp", pos: "45% 68%" },
  { label: "Finance", src: "/images/hero-finance.webp", pos: "50% 50%" },
  { label: "Approvals", src: "/images/hero-approvals.webp", pos: "48% 35%" },
];

/** Fine, neutral grain (SVG noise) tiled over the hero photos. Blended with "overlay" at low opacity so it adds
 *  texture without draining the colour. */
const HERO_GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='1.7 0 0 0 -0.35 1.7 0 0 0 -0.35 1.7 0 0 0 -0.35 0 0 0 0 1'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

function HeroVideoFrame({ reduceMotion }: { reduceMotion: boolean }) {
  const [failed, setFailed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [muted, setMuted] = useState(true);
  const [clock, setClock] = useState({ cur: 0, dur: 0 });
  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  const videoRef = useRef<HTMLVideoElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const userPaused = useRef(false);
  const inView = useInView(frameRef, { amount: 0.3 });

  // Autoplay (muted) while visible, pause when scrolled away. A manual pause is respected.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (inView && !reduceMotion && !userPaused.current) v.play().catch(() => undefined);
    else v.pause();
  }, [inView, reduceMotion, failed]);

  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      userPaused.current = false;
      v.play().catch(() => undefined);
    } else {
      userPaused.current = true;
      v.pause();
    }
  };

  const skip = (delta: number) => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    v.currentTime = Math.min(v.duration, Math.max(0, v.currentTime + delta));
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const fullscreen = () => {
    const el = videoRef.current?.parentElement;
    if (!el) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void el.requestFullscreen?.();
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    const r = e.currentTarget.getBoundingClientRect();
    v.currentTime = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)) * v.duration;
  };

  return (
    <div ref={frameRef} className="relative">
      <div className="relative overflow-hidden rounded-[20px] border border-[#E7E5E1] bg-white shadow-[0_30px_90px_-40px_rgba(17,17,19,0.45)]">
        {/* window chrome */}
        <div className="relative flex h-11 items-center border-b border-[#E4E6E9] bg-[#EEF0F2] px-4 sm:h-[52px] sm:px-5" aria-hidden="true">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#FF5F57]" />
            <span className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
            <span className="h-3 w-3 rounded-full bg-[#28C840]" />
          </div>
          <span className="absolute left-1/2 top-1/2 flex h-7 w-[46%] max-w-[380px] -translate-x-1/2 -translate-y-1/2 items-center justify-center truncate rounded-lg border border-[#E1E3E6] bg-white px-3 text-[12px] text-[#5f5c57] sm:h-8 sm:text-[14px]">
            SCIO command center
          </span>
        </div>
        <div className="relative aspect-[16/9] w-full bg-[#FAFAF9]">
          {failed ? (
            <div className="absolute inset-0 flex items-start justify-center overflow-hidden p-4 sm:p-8">
              <div className="w-full max-w-[860px]">
                <HeroCommandCenter />
              </div>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                className="absolute inset-0 h-full w-full cursor-pointer object-cover"
                muted
                loop
                playsInline
                preload="metadata"
                poster={HERO_VIDEO.poster}
                aria-label="Product demo: SCIO turning a detected issue into an approved action"
                onClick={toggle}
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onTimeUpdate={(e) => {
                  const v = e.currentTarget;
                  if (v.duration) {
                    setProgress(v.currentTime / v.duration);
                    setClock({ cur: v.currentTime, dur: v.duration });
                  }
                }}
                onLoadedMetadata={(e) => setClock({ cur: 0, dur: e.currentTarget.duration })}
                onError={() => setFailed(true)}
              >
                <source src={HERO_VIDEO.mp4} type="video/mp4" onError={() => setFailed(true)} />
              </video>

              {/* Big play button while paused */}
              {!playing && (
                <button
                  type="button"
                  onClick={toggle}
                  aria-label="Play demo video"
                  className="absolute inset-0 z-20 flex cursor-pointer items-center justify-center bg-black/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#F2A93B]"
                >
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-[#111113] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.5)] transition-transform duration-200 hover:scale-105 sm:h-20 sm:w-20">
                    <Play className="ml-1 h-7 w-7 fill-current sm:h-8 sm:w-8" aria-hidden="true" />
                  </span>
                </button>
              )}

              {/* Controls */}
              <div className="absolute inset-x-0 bottom-0 z-20 flex flex-col bg-gradient-to-t from-black/70 to-transparent px-3 pb-2 pt-10 sm:px-4">
                <div
                  className="group flex h-5 w-full cursor-pointer items-center"
                  onClick={seek}
                  role="progressbar"
                  aria-label="Video progress"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(progress * 100)}
                >
                  <div className="relative h-[3px] w-full rounded-full bg-white/30">
                    <div className="absolute inset-y-0 left-0 rounded-full bg-[#3B82F6]" style={{ width: `${progress * 100}%` }} />
                    <div className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow" style={{ left: `${progress * 100}%` }} />
                  </div>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                <button
                  type="button"
                  onClick={toggle}
                  aria-label={playing ? "Pause video" : "Play video"}
                  className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-white hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2A93B]"
                >
                  {playing ? <Pause className="h-5 w-5 fill-current" aria-hidden="true" /> : <Play className="h-5 w-5 fill-current" aria-hidden="true" />}
                </button>
                <button
                  type="button"
                  onClick={() => skip(-5)}
                  aria-label="Back 5 seconds"
                  className="relative flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-white hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2A93B]"
                >
                  <RotateCcw className="h-[22px] w-[22px]" aria-hidden="true" />
                  <span className="absolute text-[8px] font-bold leading-none" aria-hidden="true">5</span>
                </button>
                <button
                  type="button"
                  onClick={() => skip(5)}
                  aria-label="Forward 5 seconds"
                  className="relative flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-white hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2A93B]"
                >
                  <RotateCw className="h-[22px] w-[22px]" aria-hidden="true" />
                  <span className="absolute text-[8px] font-bold leading-none" aria-hidden="true">5</span>
                </button>
                <span className="ml-1 font-mono text-[13px] tabular-nums text-white">
                  {fmt(clock.cur)} <span className="text-white/60">/ {fmt(clock.dur)}</span>
                </span>
                <span className="flex-1" />
                <button
                  type="button"
                  onClick={toggleMute}
                  aria-label={muted ? "Unmute video" : "Mute video"}
                  aria-pressed={!muted}
                  className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-white hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2A93B]"
                >
                  {muted ? <VolumeX className="h-5 w-5" aria-hidden="true" /> : <Volume2 className="h-5 w-5" aria-hidden="true" />}
                </button>
                <button
                  type="button"
                  onClick={fullscreen}
                  aria-label="Toggle full screen"
                  className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-white hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2A93B]"
                >
                  <Maximize2 className="h-[18px] w-[18px]" aria-hidden="true" />
                </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  useSeo({
    title: "Stellar SCIO | The AI Business Operating System for ERP, POS & Inventory",
    description:
      "SCIO connects your ERP, POS, warehouse, HR and finance systems into one AI business operating system. Ask questions in plain language, spot problems early and act with approvals.",
    path: "/",
    image: "/images/business-operations-team-at-work.webp",
  });

  const { openDemo } = useSite();
  const reduceMotion = useReducedMotion();
  const [openFaq, setOpenFaq] = useState<number | null>(FAQ_TEASER_IDS[0]);
  const faqs = ENTERPRISE_QUESTIONS_DATA.filter((f) => FAQ_TEASER_IDS.includes(f.id));

  return (
    <>
      {/* ===== 1. Hero ===== */}
      <section
        id="top"
        className="relative isolate overflow-hidden bg-white -mt-[var(--nav-offset)] pt-[var(--nav-offset)]"
        aria-labelledby="hero-heading"
      >
        {/* Backdrop: the five use cases, one photo panel each, in full colour. It starts at the very top (the fixed header sits over it)
            and ends just past the top of the product frame, so the video overlaps its bottom edge. */}
        <div
          aria-hidden="true"
          className="theme-fixed pointer-events-none absolute inset-x-2 top-2 -z-10 overflow-hidden rounded-[20px] bg-[#0E0F11] sm:inset-x-4 sm:rounded-[28px] lg:inset-x-5 bottom-[calc(min(1080px,100vw_-_32px)*0.47_+_64px)] sm:bottom-[calc(min(1080px,100vw_-_48px)*0.47_+_96px)]"
        >
          {/* Five use-case panels. Phones: five stacked bands. From tablet width: slanted side-by-side panels that read as
              one sweep, each photo counter-slanted to stay upright. */}
          <div className="absolute inset-0 flex flex-col sm:-inset-x-[7%] sm:flex-row [filter:saturate(1.2)_contrast(1.04)]">
            {HERO_SLICES.map((sl, i) => (
              <div key={sl.label} className="relative flex-1 overflow-hidden border-t border-white/30 first:border-t-0 sm:-skew-x-[7deg] sm:border-l sm:border-t-0 sm:first:border-l-0">
                <img
                  src={sl.src}
                  alt=""
                  loading="eager"
                  decoding="async"
                  className="absolute inset-0 h-full w-full max-w-none object-cover sm:right-auto sm:-left-[14%] sm:w-[128%] sm:skew-x-[7deg]"
                  style={{ objectPosition: sl.pos }}
                />
              </div>
            ))}
          </div>
          {/* Numbered labels: one row across the visible width, nudged right to sit in the middle of each slanted panel */}
          <div className="absolute inset-x-0 top-[112px] z-[1] hidden translate-x-[1.5%] grid-cols-5 sm:grid lg:translate-x-[3%]">
            {HERO_SLICES.map((sl, i) => (
              <div key={sl.label} className="flex justify-center">
                {/* Tag: a pulsing gold dot and the name, no box. Slides in one after another. */}
                <motion.div
                  initial={reduceMotion ? false : { opacity: 0, y: -12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.5 + i * 0.09, ease: [0.22, 1, 0.36, 1] }}
                  className="flex items-center gap-2 lg:gap-2.5 [text-shadow:0_1px_12px_rgba(0,0,0,0.9),0_0_3px_rgba(0,0,0,0.7)]"
                >
                  <span aria-hidden="true" className="relative h-2 w-2 shrink-0 lg:h-2.5 lg:w-2.5">
                    <span className="absolute inset-0 rounded-full bg-[#F2A93B] opacity-70 motion-safe:animate-ping" />
                    <span className="absolute inset-0 rounded-full bg-[#F2A93B]" />
                  </span>
                  <span className="text-[12.5px] font-semibold leading-none tracking-tight text-white lg:text-[15px]">{sl.label}</span>
                </motion.div>
              </div>
            ))}
          </div>
          {/* Black layer over all five photos so the text is easy to read (raise or lower the 0.58 to taste) */}
          <div className="absolute inset-0 bg-[rgba(8,9,11,0.58)]" />
          {/* Readability shade: light overall, a little darker at the top (header) and bottom, and a soft pool
              of dark behind the headline. Photo colours stay visible everywhere else. */}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,13,16,0.38)_0%,rgba(12,13,16,0.16)_40%,rgba(12,13,16,0.66)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_58%_44%_at_50%_36%,rgba(12,13,16,0.5),transparent_100%)]" />
          {/* Phones: the text column is narrower than the photo, so shade a wider band behind it */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_105%_48%_at_50%_42%,rgba(12,13,16,0.6),transparent_100%)] sm:hidden" />
          {/* Texture: fine grain over the photos (no grid) */}
          <div className="absolute inset-0 opacity-[0.3] mix-blend-overlay" style={{ backgroundImage: HERO_GRAIN, backgroundSize: "220px 220px" }} />
          {/* Edge vignette + a faint gold glow behind the headline */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_80%_at_50%_40%,transparent_55%,rgba(0,0,0,0.28)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_50%_32%,rgba(242,169,59,0.12),transparent_70%)]" />
        </div>

        <div className={`${SITE_SHELL} pb-16 pt-14 sm:pb-24 sm:pt-20 lg:pt-24`}>
          <motion.div
            className="theme-fixed mx-auto flex max-w-[1120px] flex-col items-center text-center [text-shadow:0_2px_28px_rgba(0,0,0,0.45)]"
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1
              id="hero-heading"
              className="font-display text-balance"
              style={{ fontSize: "clamp(34px, 5.2vw, 72px)", lineHeight: 1.14, letterSpacing: "-0.03em", fontWeight: 500 }}
            >
              <span className="block text-white">The AI business operating system</span>{" "}
              <span className="mt-1 block text-white sm:mt-2">for ERP, POS &amp; inventory.</span>
            </h1>
            <p className="mt-7 max-w-[40rem] text-[17px] sm:text-[20px] leading-[1.6] text-[#E4E2DE] text-balance">
              Connect your ERP, POS, warehouse, HR and finance tools. Spot problems early. Approve every fix in one place.
            </p>
            <div className="mt-9 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
              <button
                type="button"
                onClick={openDemo}
                className="group inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-full bg-white px-7 text-[15px] font-semibold text-[#111113] transition duration-200 hover:bg-[#F2EFEA] active:scale-[0.98] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2A93B] focus-visible:ring-offset-2 focus-visible:ring-offset-[#16171A] sm:w-auto"
              >
                Book a demo
                <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
              </button>
              <Link
                to="/platform#how-it-works"
                className="group inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-full border border-white/35 bg-white/[0.06] px-7 text-[15px] font-semibold text-white backdrop-blur-sm transition duration-200 hover:border-white/70 hover:bg-white/[0.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2A93B] focus-visible:ring-offset-2 focus-visible:ring-offset-[#16171A] sm:w-auto"
              >
                <Play className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                See how it works
              </Link>
            </div>
          </motion.div>

          {/* Product frame: plays the hero video; falls back to the interactive-looking dashboard mockup */}
          <motion.div
            className="relative mx-auto mt-12 max-w-[1080px] sm:mt-16"
            initial={reduceMotion ? false : { opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Invitation to watch, as a sentence above the frame (nothing drawn over the video) */}
            <p className="theme-fixed mb-5 flex items-center justify-center gap-2.5 text-center text-[15px] text-[#D9D6D0] sm:mb-6 sm:text-[16px]">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#FFF4E2] text-[#B06D0F]" aria-hidden="true">
                <Play className="ml-0.5 h-3 w-3 fill-current" />
              </span>
              <span>
                <span className="font-semibold text-white">See how SCIO works</span>
                <span className="hidden sm:inline">: a tour of the real product in under 4 minutes.</span>
                <span className="sm:hidden">: a tour in under 4 minutes.</span>
              </span>
            </p>
            <HeroVideoFrame reduceMotion={!!reduceMotion} />
          </motion.div>
        </div>
      </section>

      {/* ===== 2. Systems strip ===== */}
      <section className="bg-white" aria-labelledby="systems-heading">
        <div className={`${SITE_SHELL} pt-16 pb-20 sm:pt-20 sm:pb-24`}>
          <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
            <Eyebrow>Connected systems</Eyebrow>
            <SectionHeading id="systems-heading" className="mt-4">
              Works on top of the systems you already run
            </SectionHeading>
          </div>
          <SystemsHub />
        </div>
      </section>

      {/* ===== 2b. ERP and planning systems: trust ===== */}
      <ErpTrust />

      {/* ===== Real product screenshots ===== */}
      <ProductShowcase />

      {/* ===== 3. Outcomes ===== */}
      <section id="outcomes" className="relative overflow-hidden bg-white">
        {/* soft gold glow behind the chat window */}
        <div aria-hidden="true" className="pointer-events-none absolute right-[-10%] top-1/2 h-[620px] w-[760px] -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(242,169,59,0.2),transparent)]" />
        <div className={`${SITE_SHELL} relative py-20 sm:py-28`}>
          <div className="grid items-center gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:gap-10">
            <div>
              <SectionTitle className="max-w-3xl">Skip the dashboards. Just ask.</SectionTitle>
              <p className="mt-5 max-w-[56ch] text-[18px] leading-relaxed text-[#4a4843]">
                Your business already has the answers. They're just split across a dozen systems. SCIO brings them together so your team spends less time pulling reports and more time acting on them.
              </p>
              <ul className="mt-9 grid gap-3 sm:grid-cols-2">
                {OUTCOMES.map((o, i) => (
                  <motion.li
                    key={o.title}
                    initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                    className="rounded-2xl border border-[#E7E5E1] bg-[#F6F5F3] p-5"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF4E2] text-[#B06D0F]">
                      <o.icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <h3 className="mt-4 text-[17px] font-semibold text-[#111113]">{o.title}</h3>
                    <p className="mt-2 text-[14.5px] leading-relaxed text-[#5D5A54]">{o.body}</p>
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* The assistant, shown for real: an answer with the numbers, the reasons and actions ready to approve */}
            <motion.div
              {...reveal}
              className="relative mx-auto w-full max-w-[680px] lg:max-w-none"
            >
              <div className="theme-fixed relative overflow-hidden rounded-[22px] border border-[#E7E5E1] bg-white shadow-[0_44px_90px_-40px_rgba(17,17,19,0.55)] lg:[transform:perspective(1600px)_rotateY(-6deg)_rotateX(2deg)]">
                <div className="flex items-center gap-2 border-b border-[#E7E5E1] bg-[#F6F5F3] px-4 py-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
                  <span className="ml-3 rounded-md bg-white px-3 py-1 text-[11.5px] text-[#6b6862] ring-1 ring-[#E7E5E1]">Ask SCIO</span>
                </div>
                <img
                  src="/images/scio-ai-assistant-answer-with-approvals.webp"
                  alt="SCIO's assistant answering why a store's sales dropped, with the numbers, the causes and two actions ready to approve"
                  width={2160}
                  height={1350}
                  loading="lazy"
                  decoding="async"
                  className="block h-auto w-full"
                />
              </div>

              {/* floating callouts taken from the screen */}
              <motion.div
                animate={reduceMotion ? undefined : { y: [0, -8, 0] }}
                transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
                className="theme-fixed absolute -left-3 top-[14%] hidden items-center gap-2.5 rounded-full border border-[#E7E5E1] bg-white py-2 pl-2 pr-4 shadow-[0_18px_40px_-18px_rgba(17,17,19,0.45)] sm:flex lg:-left-10"
              >
                <span className="grid h-7 w-7 place-items-center rounded-full bg-[#111113] text-[12px] font-bold text-white">S</span>
                <span className="text-[13.5px] font-semibold text-[#111113]">Checked 7 sources in 4 steps</span>
              </motion.div>
              <motion.div
                animate={reduceMotion ? undefined : { y: [0, 9, 0] }}
                transition={{ duration: 6.2, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
                className="theme-fixed absolute -right-2 top-[46%] hidden items-center gap-2.5 rounded-2xl border border-[#E7E5E1] bg-white px-4 py-2.5 shadow-[0_18px_40px_-18px_rgba(17,17,19,0.45)] sm:flex lg:-right-8"
              >
                <span className="h-2 w-2 rounded-full bg-[#F2A93B]" />
                <span className="text-[13.5px] font-semibold text-[#111113]">2 actions ready for your approval</span>
              </motion.div>
              <motion.div
                animate={reduceMotion ? undefined : { y: [0, -7, 0] }}
                transition={{ duration: 5.8, repeat: Infinity, ease: "easeInOut", delay: 1.1 }}
                className="theme-fixed absolute -bottom-5 left-[8%] hidden items-center gap-2.5 rounded-full border border-[#E7E5E1] bg-[#111113] px-4 py-2.5 text-white shadow-[0_18px_40px_-18px_rgba(17,17,19,0.6)] sm:flex lg:-left-4"
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inset-0 rounded-full bg-[#34D399] opacity-70 motion-safe:animate-ping" />
                  <span className="relative h-2 w-2 rounded-full bg-[#34D399]" />
                </span>
                <span className="text-[13.5px] font-medium">12 sources connected, all live</span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      <WatchItWork />

      {/* ===== 4. Use cases (tabbed) ===== */}
      <UseCasesTabs />

      {/* ===== 4b. Industries ===== */}
      <Industries />

      {/* ===== 4c. Staff augmentation ===== */}
      <StaffAugmentation />

      {/* ===== 5. How it works ===== */}
      <section id="how-it-works" className="bg-white">
        <div className={`${SITE_SHELL} py-20 sm:py-28 grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center`}>
          <motion.div {...reveal} className="relative aspect-[5/4] overflow-hidden rounded-3xl order-last lg:order-first">
            <img src="/images/business-analytics-dashboard-laptop.webp" alt="Business analytics dashboard showing sales and stock trends on a laptop" loading="lazy" width={1200} height={960} className="absolute inset-0 h-full w-full object-cover" />
          </motion.div>
          <div>
            <Eyebrow>How it works</Eyebrow>
            <SectionTitle className="mt-4">From scattered systems to one operating picture</SectionTitle>
            <ol className="mt-10 space-y-7">
              {STEPS.map((s) => (
                <li key={s.step} className="flex gap-5">
                  <span className="h-12 w-12 shrink-0 rounded-2xl bg-[#111113] text-white flex items-center justify-center">
                    <s.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="text-[19px] font-semibold text-[#111113]">
                      <span className="text-[#B06D0F] mr-2">{s.step}</span>
                      {s.title}
                    </h3>
                    <p className="mt-1.5 text-[16px] leading-relaxed text-[#5D5A54]">{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
            <ArrowLink to="/platform" className="mt-10">Explore the platform</ArrowLink>
          </div>
        </div>
      </section>

      {/* ===== Market positioning: SCIO vs other tool categories ===== */}
      <PositioningCompare />

      {/* ===== 6. Control & governance ===== */}
      <section id="governance" className="bg-white">
        <div className={`${SITE_SHELL} py-20 sm:py-28`}>
          <SectionTitle>Built for control and governance</SectionTitle>
          <div className="mt-12 grid gap-5 lg:grid-cols-2">
            {[
              {
                title: "Runs inside your infrastructure",
                body: "Deploy SCIO on-premises, in your private cloud or hybrid. Your business data stays on your network, under your security policies.",
                link: "Security & deployment",
                to: "/platform#governance",
                img: "/images/secure-private-data-center.webp",
                alt: "Secure private data centre with server racks",
              },
              {
                title: "AI recommends. People approve.",
                body: "Purchase orders, transfers and payments go to the right person before anything changes. Every decision is traceable in a full audit trail.",
                link: "Why SCIO",
                to: "/why-scio",
                img: "/images/leadership-business-review-meeting.webp",
                alt: "Leadership team reviewing business decisions in a meeting",
              },
            ].map((c) => (
              <Link key={c.title} to={c.to} className="group overflow-hidden rounded-3xl border border-[#E7E5E1] bg-[#F6F5F3] hover:border-[#111113] transition-colors">
                <div className="relative aspect-[16/9] overflow-hidden">
                  <img src={c.img} alt={c.alt} loading="lazy" width={1200} height={675} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                </div>
                <div className="p-8">
                  <h3 className="font-display text-[26px] font-semibold text-[#111113] tracking-tight">{c.title}</h3>
                  <p className="mt-3 text-[16px] leading-relaxed text-[#4a4843] max-w-[56ch]">{c.body}</p>
                  <span className="mt-6 inline-flex items-center gap-1.5 text-[15px] font-semibold text-[#111113] group-hover:text-[#B06D0F]">
                    {c.link} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 7. FAQ teaser ===== */}
      <section id="faq" className="bg-[#F6F5F3] border-t border-[#E7E5E1]">
        <div className={`${SITE_SHELL} py-20 sm:py-28 grid gap-12 lg:grid-cols-[0.8fr_1.2fr]`}>
          <div>
            <Eyebrow>FAQ</Eyebrow>
            <SectionTitle className="mt-4">Questions businesses ask us</SectionTitle>
            <ArrowLink to="/faq" className="mt-8">See all questions</ArrowLink>
          </div>
          <div className="border-t border-[#D6D3CE]">
            {faqs.map((f) => {
              const open = openFaq === f.id;
              return (
                <div key={f.id} className="border-b border-[#D6D3CE]">
                  <h3>
                    <button
                      type="button"
                      aria-expanded={open}
                      onClick={() => setOpenFaq(open ? null : f.id)}
                      className="w-full flex items-center justify-between gap-6 py-6 text-left text-[18px] font-semibold text-[#111113] cursor-pointer"
                    >
                      {f.question}
                      {open ? <Minus className="h-5 w-5 shrink-0" /> : <Plus className="h-5 w-5 shrink-0" />}
                    </button>
                  </h3>
                  {open && (
                    <div className="pb-6 -mt-1 space-y-3 text-[16px] leading-relaxed text-[#4a4843] whitespace-pre-line">
                      {f.answerText}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== 8. Trusted platforms ===== */}
      <TrustedPlatforms />

      {/* ===== 9. Let's connect ===== */}
      <ConnectBand />
    </>
  );
}
