"use client";

import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowLeft, Plus, Minus, Radio, Layers, Cpu, Workflow, Zap, Ship, Building2, Truck } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { SITE_SHELL } from "../site/SiteLayout";
import { useSite } from "../site/SiteContext";
import { ArrowLink, ConnectBand, Eyebrow, PrimaryButton, SecondaryButton, reveal } from "../site/blocks";
import { INDUSTRY_DATA, HOW_SCIO_WORKS_STEPS } from "./shared";

type IndustryKey = keyof typeof INDUSTRY_DATA;

// ---------- Content ----------
const IMPACT_CARDS = [
  { sector: "Energy", value: "14 days", body: "Early warning on transformer insulation degradation for a top-3 global utility managing 12.4 GW.", to: "/industries/energy" },
  { sector: "Manufacturing", value: "+4.2%", body: "Overall OEE gain across 38 plants, with tool-chatter defects behind $1.8M of scrap eliminated.", to: "/industries/manufacturing" },
  { sector: "Logistics", value: "99.98%", body: "Cold-chain temperature compliance across 18,000+ refrigerated reefers, with zero spoiled shipments.", to: "/industries/logistics" },
  { sector: "Maritime", value: "100%", body: "First-pass port safety inspection readiness across a 240-vessel ocean fleet.", to: "/industries/maritime" },
  { sector: "Platform", value: "91%", body: "Fewer false alarms when cross-sensor AI replaces static thresholds.", to: "/platform#how-it-works" },
];

const RESULTS = [
  { title: "1,200+ CNC cells watched for spindle faults, 14 days ahead", img: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1000&q=75", to: "/industries/manufacturing" },
  { title: "12.4 GW of solar, wind and storage in one operational view", img: "https://images.unsplash.com/photo-1497440001374-f26997328c1b?auto=format&fit=crop&w=1000&q=75", to: "/industries/energy" },
  { title: "Fuel reserves and safety checks tracked for 240+ vessels", img: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=1000&q=75", to: "/industries/maritime" },
  { title: "Customs bottlenecks predicted 9 days before they hit the port", img: "https://images.unsplash.com/photo-1580674684081-7617fbf3d745?auto=format&fit=crop&w=1000&q=75", to: "/industries/logistics" },
  { title: "Work orders drafted in SAP and Maximo the moment risk appears", img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=75", to: "/platform/integrations" },
];

const STEP_ICONS = [Radio, Layers, Cpu, Workflow];

const SYSTEMS = ["SAP S/4HANA", "IBM Maximo", "Oracle", "OPC-UA", "Modbus TCP", "MQTT Sparkplug B", "IEC 61850", "Snowflake", "AWS", "Azure", "Salesforce", "Kafka"];

const INDUSTRY_TABS: { key: IndustryKey; label: string; line: string; icon: typeof Zap }[] = [
  { key: "energy", label: "Renewable Energy", line: "Keep generation online and the grid balanced, 72 hours ahead", icon: Zap },
  { key: "maritime", label: "Maritime", line: "Keep every vessel seaworthy, fuelled and inspection-ready", icon: Ship },
  { key: "manufacturing", label: "Manufacturing", line: "Stop unplanned line stops before they cost $120,000 an hour", icon: Building2 },
  { key: "logistics", label: "Logistics & Cold-Chain", line: "Keep freight moving and every reefer in range", icon: Truck },
];

// ---------- Pieces ----------
function Marquee({ items }: { items: string[] }) {
  return (
    <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
      <div className="flex w-max animate-[scio-marquee_40s_linear_infinite] gap-14 pr-14 hover:[animation-play-state:paused]">
        {[...items, ...items].map((t, i) => (
          <span key={i} aria-hidden={i >= items.length} className="whitespace-nowrap font-display text-[22px] sm:text-[26px] font-semibold text-[#8f8b84]">
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

function SectionTitle({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <h2
      className={`font-display font-bold text-[#111113] text-balance ${className}`}
      style={{ fontSize: "clamp(32px, 4.4vw, 56px)", lineHeight: 1.05, letterSpacing: "-0.035em" }}
    >
      {children}
    </h2>
  );
}

export default function HomePage() {
  const { openDemo } = useSite();
  const railRef = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState<IndustryKey>("energy");
  const [openAccordion, setOpenAccordion] = useState<IndustryKey | null>("energy");

  const scrollRail = (dir: 1 | -1) => {
    const el = railRef.current;
    if (el) el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.8, 480), behavior: "smooth" });
  };

  const activeTab = INDUSTRY_TABS.find((t) => t.key === tab)!;
  const activeInd = INDUSTRY_DATA[tab];

  return (
    <>
      {/* ===== 1. Hero ===== */}
      <section className="bg-white">
        <div className={`${SITE_SHELL} pt-16 pb-12 sm:pt-24 sm:pb-16`}>
          <motion.div {...reveal} className="max-w-5xl">
            <h1
              className="font-display font-bold text-[#111113] text-balance"
              style={{ fontSize: "clamp(44px, 8vw, 112px)", lineHeight: 0.98, letterSpacing: "-0.045em" }}
            >
              AI built for how <span className="text-[#D98B16]">industry</span> runs
            </h1>
            <p className="mt-8 max-w-[52ch] text-[18px] sm:text-[21px] leading-relaxed text-[#4a4843]">
              Built on the telemetry, systems and knowledge your operation already has. Designed to predict what happens next, and act on it.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <PrimaryButton onClick={openDemo}>Talk to our team</PrimaryButton>
              <SecondaryButton to="/platform">Explore the platform</SecondaryButton>
            </div>
          </motion.div>
        </div>

        {/* ===== 2. Impact stat cards ===== */}
        <div className={`${SITE_SHELL} pb-20`}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {IMPACT_CARDS.map((c, i) => (
              <motion.div
                key={c.value}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
              >
                <Link
                  to={c.to}
                  className="group h-full flex flex-col justify-between gap-8 rounded-2xl border border-[#E7E5E1] bg-[#F6F5F3] p-6 hover:bg-white hover:border-[#111113] transition-colors"
                >
                  <div>
                    <p className="text-[12px] font-medium text-[#6b6862]">{c.sector} · Impact</p>
                    <p className="mt-4 font-display font-bold text-[#111113] text-[40px] leading-none tracking-tight">{c.value}</p>
                    <p className="mt-4 text-[14px] leading-relaxed text-[#4a4843]">{c.body}</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-[#111113] group-hover:text-[#B06D0F]">
                    Read more <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 3. Trusted by / systems marquee ===== */}
      <section className="bg-white border-y border-[#E7E5E1]">
        <div className={`${SITE_SHELL} py-12`}>
          <p className="text-center text-[14px] font-medium text-[#6b6862] mb-8">
            Running in production pilots with four global industrial operators, connected to the systems they already use
          </p>
          <Marquee items={SYSTEMS} />
        </div>
      </section>

      {/* ===== 4. Results carousel ===== */}
      <section className="bg-white">
        <div className={`${SITE_SHELL} py-20 sm:py-28`}>
          <div className="flex items-end justify-between gap-6">
            <SectionTitle className="max-w-2xl">Results, delivered at operational scale</SectionTitle>
            <div className="hidden sm:flex gap-2 shrink-0">
              <button type="button" aria-label="Previous" onClick={() => scrollRail(-1)} className="h-12 w-12 rounded-full border border-[#D6D3CE] flex items-center justify-center hover:border-[#111113] cursor-pointer">
                <ArrowLeft className="h-5 w-5" />
              </button>
              <button type="button" aria-label="Next" onClick={() => scrollRail(1)} className="h-12 w-12 rounded-full border border-[#D6D3CE] flex items-center justify-center hover:border-[#111113] cursor-pointer">
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
        <div
          ref={railRef}
          className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-20 sm:pb-28 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{
            paddingLeft: "max(1rem, calc((100vw - 1320px) / 2 + 2.5rem))",
            scrollPaddingLeft: "max(1rem, calc((100vw - 1320px) / 2 + 2.5rem))",
            paddingRight: "1rem",
            marginTop: "-3rem",
          }}
        >
          {RESULTS.map((r) => (
            <Link
              key={r.title}
              to={r.to}
              className="group relative shrink-0 snap-start w-[80vw] sm:w-[420px] aspect-[4/5] overflow-hidden rounded-3xl bg-[#111113]"
            >
              <img src={r.img} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-7">
                <h3 className="font-display font-semibold text-white text-[24px] leading-tight">{r.title}</h3>
                <span className="mt-5 inline-flex items-center gap-1.5 text-[14px] font-semibold text-white/85 group-hover:text-[#f2a93b]">
                  Read more <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ===== 5. Platform intro ===== */}
      <section className="bg-[#F6F5F3] border-y border-[#E7E5E1]">
        <div className={`${SITE_SHELL} py-20 sm:py-28 grid gap-12 lg:grid-cols-2 lg:items-center`}>
          <motion.div {...reveal}>
            <Eyebrow>The SCIO platform</Eyebrow>
            <SectionTitle className="mt-4">Your telemetry isn&apos;t noise, it&apos;s context</SectionTitle>
            <p className="mt-6 max-w-[50ch] text-[18px] leading-relaxed text-[#4a4843]">
              We build AI on the sensors, SCADA historians, maintenance logs and ERP records your business has accumulated, with one operating layer to take it further.
            </p>
            <ArrowLink to="/platform" className="mt-8">Explore the platform</ArrowLink>
          </motion.div>
          <motion.div {...reveal} className="relative aspect-[5/4] overflow-hidden rounded-3xl">
            <img src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=75" alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
          </motion.div>
        </div>
      </section>

      {/* ===== 6. What SCIO enables ===== */}
      <section className="bg-white">
        <div className={`${SITE_SHELL} py-20 sm:py-28`}>
          <SectionTitle>What SCIO enables</SectionTitle>
          <div className="mt-12 grid gap-px overflow-hidden rounded-3xl border border-[#E7E5E1] bg-[#E7E5E1] sm:grid-cols-2 lg:grid-cols-4">
            {HOW_SCIO_WORKS_STEPS.map((s, i) => {
              const Icon = STEP_ICONS[i];
              return (
                <Link key={s.phase} to="/platform#how-it-works" className="group bg-white p-8 flex flex-col gap-6 hover:bg-[#FBFAF8] transition-colors">
                  <span className="h-12 w-12 rounded-2xl bg-[#FFF4E2] text-[#B06D0F] flex items-center justify-center">
                    <Icon className="h-6 w-6" />
                  </span>
                  <div>
                    <p className="text-[12px] font-semibold tracking-[0.14em] text-[#8f8b84]">{s.step} · {s.phase}</p>
                    <h3 className="mt-2 text-[20px] font-semibold text-[#111113]">{s.stepName}</h3>
                    <p className="mt-3 text-[15px] leading-relaxed text-[#5D5A54]">{s.subtitle}</p>
                  </div>
                  <span className="mt-auto inline-flex items-center gap-1.5 text-[14px] font-semibold text-[#111113] group-hover:text-[#B06D0F]">
                    Learn more <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== 7. Control & governance ===== */}
      <section className="bg-white">
        <div className={`${SITE_SHELL} pb-20 sm:pb-28`}>
          <SectionTitle>Built for control and governance</SectionTitle>
          <div className="mt-12 grid gap-5 lg:grid-cols-2">
            {[
              {
                title: "Deployed inside your infrastructure",
                body: "SCIO runs on your own servers or private cloud. Lightweight edge connectors read from your systems without rip-and-replace, and your operational data never leaves your network.",
                link: "Explore integrations",
                to: "/platform/integrations",
                img: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=75",
              },
              {
                title: "Governed from signal to action",
                body: "Read-only data diodes, TLS 1.3 and mTLS by default. Every AI recommendation is explained, human-approved and traceable in a full audit trail.",
                link: "Why SCIO",
                to: "/why-scio",
                img: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1200&q=75",
              },
            ].map((c) => (
              <Link key={c.title} to={c.to} className="group overflow-hidden rounded-3xl border border-[#E7E5E1] bg-[#F6F5F3] hover:border-[#111113] transition-colors">
                <div className="relative aspect-[16/9] overflow-hidden">
                  <img src={c.img} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
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

      {/* ===== 8. Industries switcher ===== */}
      <section className="bg-[#0F0F11] text-white">
        <div className={`${SITE_SHELL} py-20 sm:py-28`}>
          <h2
            className="font-display font-bold text-white text-balance max-w-3xl"
            style={{ fontSize: "clamp(32px, 4.4vw, 56px)", lineHeight: 1.05, letterSpacing: "-0.035em" }}
          >
            Every operation has its complexities, we build around yours
          </h2>

          {/* Desktop: tabs + panel */}
          <div className="hidden md:block mt-12">
            <div role="tablist" aria-label="Industries" className="flex flex-wrap gap-2 border-b border-white/10 pb-6">
              {INDUSTRY_TABS.map((t) => (
                <button
                  key={t.key}
                  role="tab"
                  type="button"
                  aria-selected={tab === t.key}
                  onClick={() => setTab(t.key)}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[15px] font-medium transition-colors cursor-pointer ${
                    tab === t.key ? "bg-white text-[#111113]" : "text-white/70 hover:text-white border border-white/15"
                  }`}
                >
                  <t.icon className="h-4 w-4" />
                  {t.label}
                </button>
              ))}
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                role="tabpanel"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="mt-10 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center"
              >
                <div className="relative aspect-[16/10] overflow-hidden rounded-3xl">
                  <img src={activeInd.heroImg} alt={activeInd.name} className="absolute inset-0 h-full w-full object-cover" />
                </div>
                <div>
                  <p className="text-[14px] font-medium text-[#f2a93b]">{activeInd.name}</p>
                  <h3 className="mt-3 font-display text-[34px] font-semibold leading-tight tracking-tight">{activeTab.line}</h3>
                  <p className="mt-5 text-[16px] leading-relaxed text-white/70">{activeInd.solution}</p>
                  <dl className="mt-8 grid grid-cols-2 gap-6 border-t border-white/10 pt-6">
                    {activeInd.kpis.slice(0, 2).map((k) => (
                      <div key={k.label}>
                        <dt className="text-[13px] text-white/55">{k.label}</dt>
                        <dd className="mt-1 font-display text-[28px] font-semibold">{k.val}</dd>
                      </div>
                    ))}
                  </dl>
                  <ArrowLink to={`/industries/${tab}`} tone="light" className="mt-8">Explore {activeTab.label}</ArrowLink>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Mobile: accordion */}
          <div className="md:hidden mt-10 border-t border-white/10">
            {INDUSTRY_TABS.map((t) => {
              const ind = INDUSTRY_DATA[t.key];
              const open = openAccordion === t.key;
              return (
                <div key={t.key} className="border-b border-white/10">
                  <button
                    type="button"
                    aria-expanded={open}
                    onClick={() => setOpenAccordion(open ? null : t.key)}
                    className="w-full flex items-center justify-between py-5 text-left text-[18px] font-semibold cursor-pointer"
                  >
                    {t.label}
                    {open ? <Minus className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                  </button>
                  {open && (
                    <div className="pb-6">
                      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl">
                        <img src={ind.heroImg} alt={ind.name} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                      </div>
                      <p className="mt-5 text-[20px] font-semibold leading-snug">{t.line}</p>
                      <ArrowLink to={`/industries/${t.key}`} tone="light" className="mt-4">Explore</ArrowLink>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== 9. Platforms you trust ===== */}
      <section className="bg-white">
        <div className={`${SITE_SHELL} py-20 sm:py-24`}>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10">
            <SectionTitle className="max-w-2xl">Built on the platforms you already trust</SectionTitle>
            <ArrowLink to="/platform/integrations">See all integrations</ArrowLink>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px overflow-hidden rounded-2xl border border-[#E7E5E1] bg-[#E7E5E1]">
            {SYSTEMS.map((s) => (
              <div key={s} className="bg-white h-24 flex items-center justify-center px-4 text-center font-display text-[17px] font-semibold text-[#4a4843]">
                {s}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 10. Let's connect ===== */}
      <ConnectBand />
    </>
  );
}
