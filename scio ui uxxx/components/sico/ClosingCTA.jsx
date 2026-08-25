"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { VIEWPORT, fadeUp, stagger } from "./motion";

const MONO = { fontFamily: "var(--font-sico-mono), 'DM Mono', monospace" };
const SANS = { fontFamily: "'DM Sans', sans-serif" };

function ClosingCTA() {
  return (
    <section className="bg-white px-5 pt-6 pb-12 sm:px-8 md:px-12 lg:px-[75px] lg:pt-8 lg:pb-16">
      <div className="mx-auto w-full max-w-[1290px]">
        <motion.div
          className="relative flex flex-col items-center overflow-hidden rounded-[24px] px-6 py-16 text-center sm:px-10 sm:py-20 lg:rounded-[50px] lg:py-[102px]"
          variants={stagger(0.09)}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT}
        >
          <Image
            src="/Product/SICO_bottom.png"
            alt=""
            aria-hidden="true"
            fill
            className="object-cover"
            sizes="100vw"
          />
          {/* Flat 60% black tint over the photo, per spec's layered background. */}
          <div className="absolute inset-0" style={{ background: "rgba(0,0,0,.6)" }} />

          <div className="relative z-[1] flex max-w-[849px] flex-col items-center gap-[23px]">
            <motion.p
              variants={fadeUp}
              style={{ ...MONO, fontWeight: 500, fontSize: "14px", letterSpacing: "1.98px", color: "#FFFFFF" }}
            >
              SEE · UNDERSTAND · DECIDE · ACT
            </motion.p>

            <motion.h2
              variants={fadeUp}
              style={{
                ...SANS,
                fontWeight: 500,
                fontSize: "clamp(34px, 5vw, 66px)",
                lineHeight: 1.03,
                color: "#FFFFFF",
              }}
            >
              Ready to Unify Your Supply Chain &amp; Field Operations?
            </motion.h2>

            <motion.p
              variants={fadeUp}
              className="max-w-[42ch]"
              style={{ ...SANS, fontWeight: 400, fontSize: "18px", lineHeight: "27px", color: "#FFFFFF" }}
            >
              Transform manual inspections and fragmented operations into an integrated, AI-powered
              enterprise operating platform.
            </motion.p>

            <motion.div variants={fadeUp} className="mt-[13px] flex flex-wrap justify-center gap-3">
              <Link
                href="/contact"
                prefetch={false}
                className="inline-flex items-center rounded-full px-[30px] py-4 transition-transform duration-300 hover:-translate-y-0.5"
                style={{
                  background: "linear-gradient(0deg, #2568E5 0%, #153A7F 100%)",
                  ...SANS,
                  fontWeight: 500,
                  fontSize: "15px",
                  lineHeight: "20px",
                  color: "#FCF7F1",
                }}
              >
                Request a Demo
              </Link>
              <Link
                href="/contact"
                prefetch={false}
                className="inline-flex items-center rounded-full px-7 py-[15px] transition-transform duration-300 hover:-translate-y-0.5"
                style={{
                  background: "#FFFFFF",
                  border: "1px solid #00D443",
                  ...SANS,
                  fontWeight: 500,
                  fontSize: "15px",
                  lineHeight: "20px",
                  color: "#000000",
                }}
              >
                Contact Enterprise Team
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default ClosingCTA;
