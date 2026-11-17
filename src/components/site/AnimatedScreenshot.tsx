"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Sparkles } from "lucide-react";

/** Real product screenshot in a browser frame: slides in, then floats and slowly pans. Respects reduced-motion. */
export default function AnimatedScreenshot({
  src,
  alt,
  url = "stellarscio.app/app",
  badge,
}: {
  src: string;
  alt: string;
  url?: string;
  badge?: string;
}) {
  const still = useReducedMotion();

  return (
    <div className="relative">
      {/* Soft glow behind the window */}
      <div className="pointer-events-none absolute -inset-6 rounded-[40px] bg-gradient-to-br from-[#FDE7C7] via-[#FBD9A8]/60 to-transparent blur-2xl" aria-hidden="true" />

      <motion.div
        initial={still ? false : { opacity: 0, y: 40, rotateX: 8, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformPerspective: 1200 }}
        className="relative"
      >
        <motion.div
          animate={still ? undefined : { y: [0, -10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="overflow-hidden rounded-2xl border border-[#E7E5E1] bg-white shadow-[0_40px_90px_-30px_rgba(17,17,19,0.45)]"
        >
          <div className="flex items-center gap-2 border-b border-[#EFEEEB] bg-[#F7F6F4] px-4 py-2.5" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
            <span className="ml-3 rounded-md bg-white px-3 py-0.5 text-[11px] text-[#8f8b84]">{url}</span>
          </div>
          <div className="relative aspect-[16/10] overflow-hidden">
            <motion.img
              src={src}
              alt={alt}
              width={2160}
              height={1350}
              fetchPriority="high"
              className="absolute inset-0 h-full w-full object-cover object-left-top"
              animate={still ? undefined : { scale: [1, 1.06, 1], x: ["0%", "-2%", "0%"], y: ["0%", "-1.5%", "0%"] }}
              transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
            />
            {/* Light sweep */}
            {!still && (
              <motion.span
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                initial={{ x: "-120%" }}
                animate={{ x: "380%" }}
                transition={{ duration: 1.6, delay: 1, ease: "easeInOut", repeat: Infinity, repeatDelay: 6 }}
              />
            )}
          </div>
        </motion.div>

        {badge && (
          <motion.div
            initial={still ? false : { opacity: 0, y: 12, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="absolute -bottom-5 left-6 inline-flex items-center gap-2 rounded-full bg-[#111113] px-4 py-2.5 text-[13px] font-semibold text-white shadow-xl"
          >
            <Sparkles className="h-4 w-4 text-[#f2a93b]" aria-hidden="true" />
            {badge}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
