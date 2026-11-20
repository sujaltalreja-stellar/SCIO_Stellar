"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { ListChecks, Search, MessageSquareText, Network, Maximize2, Pause, Play, RotateCcw, RotateCw, Volume2, VolumeX } from "lucide-react";
import { SITE_SHELL } from "../site/SiteLayout";
import { Eyebrow, SectionHeading } from "../site/blocks";
import ProductDemo from "./ProductDemo";

/** Drop your recording at /public/videos/watch-demo.mp4 (and optionally watch-demo.webm + watch-poster.webp). */
const VIDEO = { mp4: "/videos/watch-demo.mp4", webm: "/videos/watch-demo.webm", poster: "/videos/watch-poster.webp" };
const EASE = [0.22, 1, 0.36, 1] as const;

const STEPS = [
  { icon: ListChecks, title: "See priorities", body: "Ranked by money at stake." },
  { icon: Search, title: "Find the leak", body: "Across every system." },
  { icon: MessageSquareText, title: "Approve the fix", body: "Ask why, then approve." },
  { icon: Network, title: "Trace the source", body: "Every figure is sourced." },
];

function VideoPlayer({ onReady, ready }: { onReady: () => void; ready: boolean }) {
  const reduceMotion = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const inView = useInView(wrapRef, { amount: 0.5 });
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const userPaused = useRef(false);
  const [muted, setMuted] = useState(true);
  const [clock, setClock] = useState({ cur: 0, dur: 0 });
  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    const r = e.currentTarget.getBoundingClientRect();
    v.currentTime = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)) * v.duration;
  };

  // Autoplay (muted) while on screen; pause when scrolled away. Respect reduced motion and manual pause.
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !ready) return;
    if (inView && !reduceMotion && !userPaused.current) v.play().catch(() => undefined);
    else v.pause();
  }, [inView, ready, reduceMotion]);

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

  const fullscreen = () => {
    const el = wrapRef.current;
    if (!el) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void el.requestFullscreen?.();
  };

  return (
    <div ref={wrapRef} className={ready ? "relative bg-black" : "sr-only"}>
      <video
        ref={videoRef}
        className="block aspect-video w-full object-cover"
        muted
        loop
        playsInline
        preload="metadata"
        poster={VIDEO.poster}
        aria-label="SCIO product demo: from a detected issue to an approved action"
        onLoadedMetadata={(e) => {
          setClock({ cur: 0, dur: e.currentTarget.duration });
          onReady();
        }}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(e) => {
          const v = e.currentTarget;
          if (v.duration) {
            setProgress(v.currentTime / v.duration);
            setClock({ cur: v.currentTime, dur: v.duration });
          }
        }}
        onClick={toggle}
      >
        <source src={VIDEO.webm} type="video/webm" />
        <source src={VIDEO.mp4} type="video/mp4" />
      </video>

      {ready && (
        <>
          {/* Big play button while paused */}
          {!playing && (
            <button
              type="button"
              onClick={toggle}
              aria-label="Play demo video"
              className="absolute inset-0 flex items-center justify-center bg-black/25 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#F2A93B]"
            >
              <span className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-[#111113] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.5)] transition-transform duration-200 hover:scale-105">
                <Play className="ml-1 h-8 w-8 fill-current" aria-hidden="true" />
              </span>
            </button>
          )}

          {/* Controls */}
          <div className="absolute inset-x-0 bottom-0 flex flex-col bg-gradient-to-t from-black/70 to-transparent px-4 pb-3 pt-10">
            <div
              className="flex h-5 w-full cursor-pointer items-center"
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
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white hover:bg-white/15 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2A93B]"
            >
              {playing ? <Pause className="h-5 w-5 fill-current" aria-hidden="true" /> : <Play className="h-5 w-5 fill-current" aria-hidden="true" />}
            </button>
            <button
              type="button"
              onClick={() => skip(-5)}
              aria-label="Back 5 seconds"
              className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white hover:bg-white/15 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2A93B]"
            >
              <RotateCcw className="h-[22px] w-[22px]" aria-hidden="true" />
              <span className="absolute text-[8px] font-bold leading-none" aria-hidden="true">5</span>
            </button>
            <button
              type="button"
              onClick={() => skip(5)}
              aria-label="Forward 5 seconds"
              className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white hover:bg-white/15 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2A93B]"
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
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white hover:bg-white/15 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2A93B]"
            >
              {muted ? <VolumeX className="h-5 w-5" aria-hidden="true" /> : <Volume2 className="h-5 w-5" aria-hidden="true" />}
            </button>
            <button
              type="button"
              onClick={fullscreen}
              aria-label="Toggle full screen"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white hover:bg-white/15 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2A93B]"
            >
              <Maximize2 className="h-[18px] w-[18px]" aria-hidden="true" />
            </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function WatchItWork() {
  const reduceMotion = useReducedMotion();
  const [hasVideo, setHasVideo] = useState(false);

  return (
    <section id="watch" className="relative isolate overflow-hidden border-t border-[#EFEEEB] bg-white" aria-labelledby="watch-heading">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] bg-[radial-gradient(ellipse_60%_100%_at_50%_0%,rgba(242,169,59,0.14),transparent)]" />
      <div className={`${SITE_SHELL} py-20 sm:py-28`}>
        <motion.div
          className="mx-auto flex max-w-5xl flex-col items-center text-center"
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          <Eyebrow>Watch it work</Eyebrow>
          <SectionHeading id="watch-heading" className="mt-4">
            From issue to approved action.
          </SectionHeading>
          <p className="mt-5 text-[17px] leading-relaxed text-[#4a4843] sm:text-[19px]">See SCIO spot a problem and fix it in four clicks.</p>
        </motion.div>

        {/* Player */}
        <motion.div
          className="relative mx-auto mt-12 max-w-[1040px] sm:mt-14"
          initial={reduceMotion ? false : { opacity: 0, y: 36, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <div aria-hidden="true" className="absolute inset-x-12 -bottom-6 h-24 rounded-full bg-[#F2A93B]/20 blur-3xl" />
          {hasVideo ? (
            <div className="relative overflow-hidden rounded-2xl border border-[#E7E5E1] bg-black shadow-[0_40px_100px_-36px_rgba(17,17,19,0.55)]">
              <div className="flex items-center gap-2 border-b border-white/10 bg-[#19191C] px-4 py-2.5" aria-hidden="true">
                <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
                <span className="ml-3 rounded-md bg-white/5 px-3 py-0.5 text-[11px] text-white/50">stellarscio.app/app</span>
              </div>
              <VideoPlayer ready onReady={() => undefined} />
            </div>
          ) : (
            <>
              {/* Probe for the video file; the animated walkthrough shows until it loads */}
              <div className="hidden">
                <VideoPlayer ready={false} onReady={() => setHasVideo(true)} />
              </div>
              <ProductDemo />
            </>
          )}
        </motion.div>

        {/* Steps */}
        <ol className="mx-auto mt-12 grid max-w-[1040px] gap-3 sm:mt-14 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((st, i) => (
            <motion.li
              key={st.title}
              className="rounded-2xl border border-[#E7E5E1] bg-[#F6F5F3] p-5"
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.5, delay: reduceMotion ? 0 : i * 0.07, ease: EASE }}
            >
              <span className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF4E2] text-[#B06D0F]">
                  <st.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="font-mono text-[12px] tracking-[0.1em] text-[#8f8b84]">0{i + 1}</span>
              </span>
              <h3 className="mt-4 text-[17px] font-semibold text-[#111113]">{st.title}</h3>
              <p className="mt-1 text-[14.5px] text-[#5D5A54]">{st.body}</p>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
