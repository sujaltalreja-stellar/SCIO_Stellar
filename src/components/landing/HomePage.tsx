"use client";

import React, { useRef, useState } from "react";
import {
  Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowLeft,
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
  Check,
} from "lucide-react";
import { motion } from "framer-motion";
import { SITE_SHELL } from "../site/SiteLayout";
import { useSite } from "../site/SiteContext";
import { ArrowLink, ConnectBand, Eyebrow, PrimaryButton, reveal } from "../site/blocks";
import { useSeo } from "../site/seo";
import { ENTERPRISE_QUESTIONS_DATA } from "../site/faqData";
import HeroCommandCenter from "./HeroCommandCenter";
import ProductShowcase from "./ProductShowcase";
import ScrollShowcase from "./ScrollShowcase";
import SystemsHub from "./SystemsHub";
import ProductDemo from "./ProductDemo";

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

const USE_CASE_CARDS = [
  { title: "Reorder the right stock, in the right store, before it runs out", img: "/images/warehouse-inventory-shelves.webp", alt: "Warehouse shelves stocked with inventory boxes", to: "/use-cases#inventory" },
  { title: "See every store, channel and product in one place", img: "/images/retail-store-aisle-inventory.webp", alt: "Retail store aisle with stocked shelves", to: "/use-cases#sales" },
  { title: "Draft purchase orders and keep suppliers on time", img: "/images/distribution-center-stock.webp", alt: "Distribution centre with stock ready to ship", to: "/use-cases#purchasing" },
  { title: "Read invoices and POs, match them, flag the gaps", img: "/images/invoices-and-finance-documents.webp", alt: "Invoices and finance documents on a desk", to: "/use-cases#finance" },
  { title: "Send every action to the right person to approve", img: "/images/point-of-sale-checkout-tablet.webp", alt: "Store employee using a point-of-sale tablet at checkout", to: "/use-cases#approvals" },
];

const FAQ_TEASER_IDS = [1, 2, 5, 10];

function SectionTitle({ children, className = "", as: Tag = "h2" }: { children: React.ReactNode; className?: string; as?: "h2" | "h3" }) {
  return (
    <Tag
      className={`font-display font-bold text-[#111113] text-balance ${className}`}
      style={{ fontSize: "clamp(32px, 4.4vw, 56px)", lineHeight: 1.05, letterSpacing: "-0.035em" }}
    >
      {children}
    </Tag>
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
  const railRef = useRef<HTMLDivElement>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(FAQ_TEASER_IDS[0]);
  const faqs = ENTERPRISE_QUESTIONS_DATA.filter((f) => FAQ_TEASER_IDS.includes(f.id));

  const scrollRail = (dir: 1 | -1) => {
    const el = railRef.current;
    if (el) el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.8, 480), behavior: "smooth" });
  };

  return (
    <>
      {/* ===== 1. Hero ===== */}
      <section id="top" className="relative overflow-hidden bg-white">
        <div className={`${SITE_SHELL} pt-12 pb-14 sm:pt-16 sm:pb-20 grid gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:gap-14 lg:items-center`}>
          <div>
            <p className="flex items-center gap-4 text-[13px] font-semibold uppercase tracking-[0.16em] text-[#E0900F]">
              AI business operating system
              <span className="h-px w-12 bg-[#E0900F]" aria-hidden="true" />
            </p>
            <h1
              className="mt-6 font-display font-bold text-[#111113] text-balance"
              style={{ fontSize: "clamp(40px, 4.6vw, 68px)", lineHeight: 1.04, letterSpacing: "-0.045em" }}
            >
              Your systems are connected. Now connect <span className="text-[#F2A93B]">the decisions.</span>
            </h1>
            <p className="mt-7 max-w-[52ch] text-[18px] sm:text-[20px] leading-relaxed text-[#4a4843]">
              SCIO connects ERP, POS, warehouse, HR, and finance tools, surfaces operational issues, and turns insights into approved actions.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <PrimaryButton onClick={openDemo}>Book a demo</PrimaryButton>
              <Link
                to="/platform#how-it-works"
                className="group inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full border border-[#D6D3CE] text-[15px] font-semibold text-[#111113] hover:border-[#111113] transition-colors"
              >
                See how it works
                <Play className="h-4 w-4 fill-current" aria-hidden="true" />
              </Link>
            </div>
            <ul className="mt-9 flex flex-wrap items-center gap-x-4 gap-y-3 text-[13.5px] text-[#3a3936]">
              {["Works with your existing systems", "From insight to action", "Enterprise-ready & secure"].map((t) => (
                <li key={t} className="inline-flex items-center gap-2">
                  <span className="h-[18px] w-[18px] rounded-full bg-[#F2A93B] text-white flex items-center justify-center">
                    <Check className="h-3 w-3" strokeWidth={3.5} aria-hidden="true" />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <HeroCommandCenter />
        </div>
      </section>

      {/* ===== 2. Systems strip ===== */}
      <section className="bg-white" aria-labelledby="systems-heading">
        <div className={`${SITE_SHELL} pb-20 sm:pb-24`}>
          <div className="flex items-center gap-6">
            <span className="h-px flex-1 bg-[#E7E5E1]" aria-hidden="true" />
            <h2 id="systems-heading" className="text-center text-[13px] sm:text-[14px] font-medium uppercase tracking-[0.16em] text-[#3a3936]">
              Works on top of the systems you already run
            </h2>
            <span className="h-px flex-1 bg-[#E7E5E1]" aria-hidden="true" />
          </div>
          <SystemsHub />
        </div>
      </section>

      {/* ===== Scroll-driven Command Center tour ===== */}
      <ScrollShowcase />

      {/* ===== Real product screenshots ===== */}
      <ProductShowcase />

      {/* ===== 3. Outcomes ===== */}
      <section id="outcomes" className="bg-white">
        <div className={`${SITE_SHELL} py-20 sm:py-28`}>
          <SectionTitle className="max-w-3xl">Skip the dashboards. Just ask.</SectionTitle>
          <p className="mt-5 max-w-[60ch] text-[18px] leading-relaxed text-[#4a4843]">
            Your business already has the answers. They're just split across a dozen systems. SCIO brings them together so your team spends less time pulling reports and more time acting on them.
          </p>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {OUTCOMES.map((o) => (
              <motion.div key={o.title} {...reveal} className="rounded-2xl border border-[#E7E5E1] bg-[#F6F5F3] p-7">
                <span className="h-12 w-12 rounded-2xl bg-[#FFF4E2] text-[#B06D0F] flex items-center justify-center">
                  <o.icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <h3 className="mt-6 text-[20px] font-semibold text-[#111113]">{o.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-[#5D5A54]">{o.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 4. Use cases carousel ===== */}
      <section id="use-cases" className="bg-[#F6F5F3] border-y border-[#E7E5E1]">
        <div className={`${SITE_SHELL} pt-20 sm:pt-28 pb-10`}>
          {/* Product walkthrough (real screens, animated cursor) */}
          <div className="mb-20 sm:mb-28 grid gap-10 lg:grid-cols-[0.62fr_1.38fr] lg:items-center">
            <div>
              <Eyebrow>Watch it work</Eyebrow>
              <SectionTitle className="mt-4">From issue to approved action in four clicks</SectionTitle>
              <ol className="mt-8 space-y-4 text-[16px] text-[#4a4843]">
                {[
                  "See today's priorities, ranked by money at stake",
                  "Find where money is leaking, across every system",
                  "Ask why, and approve the fix SCIO drafts",
                  "Know every figure comes from a connected source",
                ].map((t, i) => (
                  <li key={t} className="flex gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#111113] text-[13px] font-semibold text-white">{i + 1}</span>
                    <span className="pt-0.5">{t}</span>
                  </li>
                ))}
              </ol>
            </div>
            <ProductDemo />
          </div>

          <div className="flex items-end justify-between gap-6">
            <div>
              <Eyebrow>Use cases</Eyebrow>
              <SectionTitle className="mt-4 max-w-2xl">Built for the work that runs your business</SectionTitle>
            </div>
            <div className="hidden sm:flex gap-2 shrink-0">
              <button type="button" aria-label="Previous use case" onClick={() => scrollRail(-1)} className="h-12 w-12 rounded-full border border-[#D6D3CE] bg-white flex items-center justify-center hover:border-[#111113] cursor-pointer">
                <ArrowLeft className="h-5 w-5" />
              </button>
              <button type="button" aria-label="Next use case" onClick={() => scrollRail(1)} className="h-12 w-12 rounded-full border border-[#D6D3CE] bg-white flex items-center justify-center hover:border-[#111113] cursor-pointer">
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
          }}
        >
          {USE_CASE_CARDS.map((r) => (
            <Link
              key={r.title}
              to={r.to}
              className="group relative shrink-0 snap-start w-[80vw] sm:w-[400px] aspect-[4/5] overflow-hidden rounded-3xl bg-[#111113]"
            >
              <img src={r.img} alt={r.alt} loading="lazy" width={900} height={1125} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-7">
                <h3 className="font-display font-semibold text-white text-[24px] leading-tight">{r.title}</h3>
                <span className="mt-5 inline-flex items-center gap-1.5 text-[14px] font-semibold text-white/85 group-hover:text-[#f2a93b]">
                  Learn more <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

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

      {/* ===== 6. Control & governance ===== */}
      <section id="governance" className="bg-white">
        <div className={`${SITE_SHELL} pb-20 sm:pb-28`}>
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

      {/* ===== 8. Let's connect ===== */}
      <ConnectBand />
    </>
  );
}
