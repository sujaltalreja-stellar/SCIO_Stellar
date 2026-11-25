"use client";

import React from "react";
import { motion } from "framer-motion";
import { Rocket, UserCheck, Users } from "lucide-react";
import { SITE_SHELL } from "../site/SiteLayout";
import { useSite } from "../site/SiteContext";
import { reveal } from "../site/blocks";
import { ERP, PLANNING, Tile } from "./ErpTrust";

/* Staff augmentation: experienced ERP professionals who join the customer's team. */
const STAFFING = [
  { icon: UserCheck, text: "Experienced consultants and developers" },
  { icon: Rocket, text: "Start on your timeline, scale up or down" },
  { icon: Users, text: "Work inside your team, managed by you" },
];

export default function StaffAugmentation() {
  const { openDemo } = useSite();
  return (
    <section id="staff-augmentation" className="bg-white" aria-label="Dedicated ERP experts">
      <div className={`${SITE_SHELL} py-10 sm:py-14`}>
      <motion.div
        {...reveal}
        className="theme-fixed relative mx-auto max-w-[1080px] overflow-hidden rounded-[28px] bg-[#111113] p-7 text-white shadow-[0_30px_64px_-32px_rgba(17,17,19,0.7)] sm:p-10"
      >
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[radial-gradient(closest-side,rgba(242,169,59,0.28),transparent)]" />
        <div className="relative grid gap-8 lg:grid-cols-[1.25fr_1fr] lg:items-center">
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#F2A93B]">Dedicated ERP experts</p>
            <h3 className="mt-3 text-[26px] font-semibold leading-tight tracking-tight sm:text-[32px]">Expert ERP talent, ready to join your team.</h3>
            <p className="mt-4 max-w-[34rem] text-[16px] leading-relaxed text-white/75">
              Skilled professionals with hands-on experience in SAP, Oracle, Microsoft Dynamics 365, Blue Yonder, Kinaxis and o9 Solutions join your team for as long as you need them.
            </p>
            <button
              type="button"
              onClick={openDemo}
              className="mt-7 inline-flex h-[44px] items-center rounded-full bg-[#F2A93B] px-6 text-[15px] font-semibold text-[#111113] transition hover:bg-[#FFC15E] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#111113]"
            >
              Talk about staffing
            </button>
          </div>
          <ul className="grid gap-3">
            {STAFFING.map((x) => (
              <li key={x.text} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3.5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#F2A93B]/15 text-[#F2A93B]">
                  <x.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="text-[15.5px] font-medium">{x.text}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="relative mt-9 border-t border-white/10 pt-7">
          <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-white/55">Specialists across these platforms</p>
          <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {[...ERP, ...PLANNING].map((x, i) => (
              <Tile key={x.name} s={x} i={i} />
            ))}
          </ul>
        </div>
      </motion.div>
      </div>
    </section>
  );
}
