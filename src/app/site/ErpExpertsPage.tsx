"use client";

/*
 * /erp-experts: the dedicated ERP experts (staff augmentation) page.
 *
 * The three Blue Yonder role profiles come from Stellarmind.ai's own role documents:
 * "Blue Yonder Demand Planning Consultant", "Blue Yonder Supply Planning / ESP Consultant" and
 * "Blue Yonder Developer", plus the M365 / Windows Infrastructure, SAP Data Migration (S/4HANA & SAC) and SAP Treasury
 * role requirements. Experience levels, location and skills are taken from those documents as written;
 * nothing here adds numbers, client names or guarantees that the documents do not state.
 */
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { useForm, ValidationError } from "@formspree/react";
import {
  ArrowRight,
  ArrowDown,
  BadgeCheck,
  CheckCircle2,
  ChevronRight,
  Code2,
  Database,
  Factory,
  Landmark,
  FileText,
  MapPin,
  MessagesSquare,
  Plus,
  Server,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import SiteLayout, { SITE_SHELL } from "../../components/site/SiteLayout";
import { Eyebrow, SectionHeading, reveal } from "../../components/site/blocks";
import { useSeo } from "../../components/site/seo";
import { FORMSPREE_ID } from "../../components/site/ContactForms";
import { ERP, PLANNING, Tile } from "../../components/landing/ErpTrust";

type Role = {
  id: string;
  title: string;
  short: string;
  years: string;
  icon: typeof TrendingUp;
  accent: string;
  image: string;
  imageAlt: string;
  /** Platform family, shown as a small tag on the card. */
  group: string;
  /** Only set when the role requirement states it. */
  location?: string;
  summary: string;
  skills: string[];
  extras: string[];
};

const ROLES: Role[] = [
  {
    id: "demand-planning",
    group: "Blue Yonder",
    location: "India",
    title: "Blue Yonder Demand Planning Consultant",
    short: "Demand Planning",
    years: "10+ years",
    icon: TrendingUp,
    accent: "#F2A93B",
    image: "/images/experts-demand.webp",
    imageAlt: "A planning consultant reviewing demand forecasts on screen",
    summary: "Shapes the forecast your whole plan runs on.",
    skills: [
      "Blue Yonder Demand Planning, hands-on",
      "Forecasting, consensus planning and S&OP",
      "Solution design, configuration, testing and user support",
      "Integration with ERP / SAP",
    ],
    extras: ["Demand 360", "Cognitive Demand Planning", "Power BI and analytics", "Post go-live support"],
  },
  {
    id: "supply-planning",
    group: "Blue Yonder",
    location: "India",
    title: "Blue Yonder Supply Planning / ESP Consultant",
    short: "Supply Planning / ESP",
    years: "10+ years",
    icon: Factory,
    accent: "#34D399",
    image: "/images/experts-supply.webp",
    imageAlt: "A supply planner checking stock on a tablet in a warehouse",
    summary: "Turns demand into a supply plan you can actually build.",
    skills: [
      "Blue Yonder Supply Planning / ESP, hands-on",
      "Material, capacity and constraint-based planning",
      "Solvers, planning parameters and forecast netting",
      "Integration with ERP / SAP",
    ],
    extras: ["ESP solvers", "SPARQ / MAP", "Inventory optimization", "Post go-live support"],
  },
  {
    id: "developer",
    group: "Blue Yonder",
    location: "India",
    title: "Blue Yonder Developer",
    short: "Developer",
    years: "5+ years",
    icon: Code2,
    accent: "#60A5FA",
    image: "/images/experts-developer.webp",
    imageAlt: "A developer working on code across two monitors",
    summary: "Keeps the data and integrations running underneath.",
    skills: [
      "Blue Yonder / JDA technical development",
      "Strong SQL and planning data models",
      "Workflows, batch jobs and data loads",
      "Integration with ERP / SAP, middleware or cloud",
    ],
    extras: ["Demand or Supply / ESP modules", "Azure integration", "Java / Python automation"],
  },
  {
    id: "m365-infrastructure",
    group: "Microsoft",
    title: "Senior M365 / Windows Infrastructure Engineer",
    short: "M365 / Windows Infrastructure",
    years: "6+ years",
    icon: Server,
    accent: "#A78BFA",
    image: "/images/experts-m365.webp",
    imageAlt: "An infrastructure engineer working on a laptop in a server room",
    summary: "Runs the Microsoft workplace your teams log in to every day.",
    skills: [
      "Microsoft 365 and Exchange Online",
      "Entra ID / Active Directory",
      "Microsoft Teams and SharePoint",
      "Windows Server administration",
    ],
    extras: ["Endpoint and infrastructure support", "Service Desk Plus / Endpoint Central / OpManager", "PowerShell"],
  },
  {
    id: "sap-data-migration",
    group: "SAP",
    title: "Senior SAP Data Migration Consultant, S/4HANA & SAC",
    short: "SAP Data Migration",
    years: "7+ years",
    icon: Database,
    accent: "#38BDF8",
    image: "/images/experts-sap-migration.webp",
    imageAlt: "A consultant validating migrated finance data across two screens",
    summary: "Moves your finance data to S/4HANA and SAC, validated and reconciled.",
    skills: [
      "At least 2 full-cycle S/4HANA migrations",
      "SAP Migration Cockpit, LTMC / LTMOM and staging tables",
      "SAC model migration, account-based to measure-based",
      "SAP BPC, ECC and FI/CO data structures",
    ],
    extras: ["SQL and Python", "Validation, reconciliation and cutover", "Datasphere / BW/4HANA", "SLT, Data Services, Integration Suite"],
  },
  {
    id: "sap-treasury",
    group: "SAP",
    title: "SAP Treasury Consultant",
    short: "SAP Treasury",
    years: "5+ years",
    icon: Landmark,
    accent: "#F472B6",
    image: "/images/experts-treasury.webp",
    imageAlt: "Treasury consultants working with a finance team at their desks",
    summary: "Designs and configures treasury, cash and risk processes in SAP.",
    skills: [
      "SAP TRM: Transaction Manager, Market and Counterparty Risk",
      "Cash Management and Liquidity Planning",
      "In-House Cash and Bank Account Management",
      "Payments with SAP BCM, SWIFT and EBICS",
    ],
    extras: ["S/4HANA Finance customizing", "Workshops and fit-gap analysis", "National and international rollouts", "SAP FSCM"],
  },
];

const STEPS = [
  { icon: FileText, title: "Share the role", body: "Module, seniority and how long you need them." },
  { icon: UserCheck, title: "Review matched profiles", body: "Matched to your requirement, skill by skill." },
  { icon: MessagesSquare, title: "Interview and choose", body: "Nobody starts without your yes." },
  { icon: Users, title: "Onboard into your team", body: "Managed by you. Scale up or down anytime." },
];

const PARTNERS = [
  { name: "ISO 9001 certified", src: "/logos/partners/iso-trim.png", h: "h-12" },
  { name: "Reviewed on Clutch", src: "/logos/partners/clutch-trim.png", h: "h-7", href: "https://clutch.co/profile/betasource-technologies" },
  { name: "Stellarmind.ai on Guru", src: "/logos/partners/guru-trim.png", h: "h-6", href: "https://www.guru.com/freelancers/stellarmindai" },
  { name: "OpenAI Select Partner", src: "/logos/partners/openai.png", h: "h-10" },
  { name: "AWS Partner", src: "/logos/partners/aws-logo-white.png", h: "h-9" },
  { name: "NVIDIA Inception", src: "/logos/partners/nvidia-original-white.svg", h: "h-12" },
  { name: "Databricks", src: "/logos/partners/databricks.svg", h: "h-9" },
  { name: "Sarvam AI Startup Program", src: "/logos/partners/sarvam-wordmark-white.svg", h: "h-5" },
];

const EASE = [0.22, 1, 0.36, 1] as const;

// Hero logo row: sizes tuned per mark so all six read at the same visual weight.
const HERO_LOGO: Record<string, { img: string; label?: string }> = {
  SAP: { img: "h-7 sm:h-8 w-auto" },
  Oracle: { img: "h-6 sm:h-7 w-auto", label: "text-[14px] sm:text-[16px] tracking-[0.12em]" },
  "Microsoft Dynamics 365": { img: "h-8 sm:h-10 w-auto" },
  "Blue Yonder": { img: "w-[104px] sm:w-[124px] h-auto" },
  Kinaxis: { img: "w-[92px] sm:w-[110px] h-auto" },
  // the o9 file has empty space above and below its square mark, so it needs a taller box
  "o9 Solutions": { img: "h-12 sm:h-[54px] w-auto -mx-1", label: "-ml-1 text-[15px] sm:text-[17px] tracking-tight" },
};

// ---------- one full role profile ----------
function RoleCard({ r, i }: { r: Role; i: number }) {
  const still = useReducedMotion();
  return (
    <motion.article
      id={r.id}
      initial={still ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, delay: i * 0.08, ease: EASE }}
      className="group relative flex scroll-mt-28 flex-col overflow-hidden rounded-[28px] border border-[#E7E5E1] bg-white shadow-[0_24px_56px_-36px_rgba(17,17,19,0.45)] transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_34px_70px_-34px_rgba(17,17,19,0.5)]"
    >
      {/* profile header */}
      <div className="theme-fixed relative h-[260px] overflow-hidden text-white">
        <img
          src={r.image}
          alt={r.imageAlt}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#0c0c0e] via-[#0c0c0e]/55 to-transparent" />
        <div className="absolute left-5 right-5 top-5 flex items-center justify-between">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-black/45 ring-1 ring-white/15 backdrop-blur-md" style={{ color: r.accent }}>
            <r.icon className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="flex items-center gap-1.5">
            <span className="rounded-full border border-white/20 bg-black/40 px-3 py-1 text-[12.5px] font-medium text-white backdrop-blur-md">{r.group}</span>
            <span className="rounded-full px-3 py-1 text-[12.5px] font-semibold text-[#111113]" style={{ backgroundColor: r.accent }}>
              {r.years}
            </span>
          </span>
        </div>
        <div className="absolute inset-x-5 bottom-5">
          <h3 className="text-[20px] font-semibold leading-snug tracking-tight">{r.title}</h3>
          <p className="mt-1.5 flex items-center gap-1.5 text-[13.5px] text-white/75">
            {r.location && (
              <>
                <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /> {r.location} ·
              </>
            )}{" "}
            {r.summary}
          </p>
        </div>
      </div>

      {/* skills */}
      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <p className="text-[12.5px] font-semibold uppercase tracking-[0.14em] text-[#B06D0F]">Core skills</p>
        <ul className="mt-4 space-y-3">
          {r.skills.map((s) => (
            <li key={s} className="flex gap-3 text-[15px] leading-snug text-[#2b2a27]">
              <CheckCircle2 className="mt-0.5 h-[18px] w-[18px] shrink-0 text-[#1f9d6b]" aria-hidden="true" />
              {s}
            </li>
          ))}
        </ul>
        <p className="mt-6 text-[12.5px] font-semibold uppercase tracking-[0.14em] text-[#8f8b84]">Also brings</p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {r.extras.map((x) => (
            <li key={x} className="inline-flex items-center gap-1 rounded-full border border-[#E7E5E1] bg-[#F6F5F3] px-3 py-1.5 text-[13px] font-medium text-[#3d3b37]">
              <Plus className="h-3 w-3 text-[#B06D0F]" aria-hidden="true" /> {x}
            </li>
          ))}
        </ul>
        <a
          href="#request"
          className="mt-auto inline-flex items-center gap-1.5 pt-7 text-[15px] font-semibold text-[#111113] transition-colors hover:text-[#B06D0F]"
        >
          Request this profile <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </a>
      </div>
    </motion.article>
  );
}

// ---------- how the three roles fit together ----------
function TeamMap() {
  const node = "theme-fixed relative rounded-2xl border border-white/10 bg-white/[0.04] p-5";
  return (
    <section className="theme-fixed relative overflow-hidden bg-[#0F0F11] text-white">
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-0 h-[480px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(242,169,59,0.14),transparent)]" />
      <div className={`${SITE_SHELL} relative py-20 sm:py-28`}>
        <motion.div {...reveal} className="mx-auto max-w-3xl text-center">
          <Eyebrow tone="light">One planning team</Eyebrow>
          <SectionHeading tone="light" className="mt-4">How they work together</SectionHeading>
          <p className="mx-auto mt-5 max-w-[44rem] text-[17px] leading-relaxed text-white/70">
            Hire one role or the full set. Demand feeds supply, supply feeds your ERP, and the developer keeps the data moving between them.
          </p>
        </motion.div>

        <motion.div {...reveal} className="mx-auto mt-14 max-w-[1080px]">
          <div className="grid items-stretch gap-4 lg:grid-cols-[1fr_auto_1fr_auto_1fr]">
            <div className={node}>
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#F2A93B]">1 · Forecast</p>
              <p className="mt-2 text-[18px] font-semibold">Demand Planning Consultant</p>
              <p className="mt-2 text-[14.5px] leading-relaxed text-white/65">Forecasting, consensus planning and S&amp;OP.</p>
              <span aria-hidden="true" className="pointer-events-none absolute left-1/2 top-full hidden h-10 -translate-x-1/2 lg:block">
                <span className="absolute left-1/2 top-0 h-full -translate-x-1/2 border-l-2 border-dashed border-[#60A5FA]/45" />
                <span className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#60A5FA]" />
                <span className="absolute bottom-0 left-1/2 h-2 w-2 -translate-x-1/2 translate-y-1/2 rounded-full bg-[#60A5FA]" />
              </span>
            </div>
            <div className="flex items-center justify-center text-[#F2A93B]" aria-hidden="true">
              <ChevronRight className="hidden h-7 w-7 lg:block" />
              <ArrowDown className="h-6 w-6 lg:hidden" />
            </div>
            <div className={node}>
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#34D399]">2 · Plan supply</p>
              <p className="mt-2 text-[18px] font-semibold">Supply Planning / ESP Consultant</p>
              <p className="mt-2 text-[14.5px] leading-relaxed text-white/65">Materials, capacity and constraint-based plans.</p>
              <span aria-hidden="true" className="pointer-events-none absolute left-1/2 top-full hidden h-10 -translate-x-1/2 lg:block">
                <span className="absolute left-1/2 top-0 h-full -translate-x-1/2 border-l-2 border-dashed border-[#60A5FA]/45" />
                <span className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#60A5FA]" />
                <span className="absolute bottom-0 left-1/2 h-2 w-2 -translate-x-1/2 translate-y-1/2 rounded-full bg-[#60A5FA]" />
              </span>
            </div>
            <div className="flex items-center justify-center text-[#F2A93B]" aria-hidden="true">
              <ChevronRight className="hidden h-7 w-7 lg:block" />
              <ArrowDown className="h-6 w-6 lg:hidden" />
            </div>
            <div className={node}>
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-white/60">3 · Execute</p>
              <p className="mt-2 text-[18px] font-semibold">Your ERP / SAP</p>
              <p className="mt-2 text-[14.5px] leading-relaxed text-white/65">Orders, stock and finance stay in your system of record.</p>
              <span aria-hidden="true" className="pointer-events-none absolute left-1/2 top-full hidden h-10 -translate-x-1/2 lg:block">
                <span className="absolute left-1/2 top-0 h-full -translate-x-1/2 border-l-2 border-dashed border-[#60A5FA]/45" />
                <span className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#60A5FA]" />
                <span className="absolute bottom-0 left-1/2 h-2 w-2 -translate-x-1/2 translate-y-1/2 rounded-full bg-[#60A5FA]" />
              </span>
            </div>
          </div>

          {/* the developer runs underneath all three */}
          <div className="mt-4 flex flex-col gap-4 rounded-2xl border border-[#60A5FA]/30 bg-[#60A5FA]/[0.07] p-5 sm:flex-row sm:items-center sm:p-6 lg:mt-10">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#60A5FA]/15 text-[#60A5FA] ring-1 ring-[#60A5FA]/25">
              <Code2 className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#60A5FA]">Underneath all three</p>
              <p className="mt-1 text-[18px] font-semibold">Blue Yonder Developer</p>
              <p className="mt-1 text-[14.5px] leading-relaxed text-white/65">Keeps data moving between planning and your ERP.</p>
            </div>
            <ul className="flex flex-wrap gap-2 sm:max-w-[480px] sm:justify-end lg:max-w-none lg:shrink-0 lg:flex-nowrap">
              {["SQL", "Data loads", "Batch jobs", "Workflows", "ERP / SAP integration"].map((t) => (
                <li key={t} className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[12.5px] text-white/80">{t}</li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ---------- request form ----------
const inputCls =
  "w-full rounded-xl border border-[#D6D3CE] bg-white px-4 py-3 text-[15px] text-[#111113] placeholder:text-[#a19d96] focus:border-[#111113] focus:outline-none focus:ring-2 focus:ring-[#f2a93b]/40";
const labelCls = "block text-[13px] font-semibold text-[#111113] mb-1.5";

function RequestForm() {
  const [state, handleSubmit] = useForm(FORMSPREE_ID);
  const [role, setRole] = useState("");
  const lastRef = useRef<Record<string, string> | null>(null);
  const sentRef = useRef(false);

  // Same as the other site forms: after Formspree accepts it, email the requester a confirmation.
  useEffect(() => {
    if (!state.succeeded || sentRef.current || !lastRef.current?.email) return;
    sentRef.current = true;
    fetch("/api/contact/confirmation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ variant: "contact", ...lastRef.current }),
    }).catch(() => {});
  }, [state.succeeded]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const fd = new FormData(e.currentTarget);
    const get = (k: string) => String(fd.get(k) || "");
    lastRef.current = {
      name: get("name"),
      email: get("email"),
      company: get("company"),
      role: get("expert"),
      message: [
        `Expert needed: ${get("expert")}`,
        get("headcount") && `How many: ${get("headcount")}`,
        get("start") && `Start: ${get("start")}`,
        get("message"),
      ]
        .filter(Boolean)
        .join("\n"),
    };
    sentRef.current = false;
    return handleSubmit(e);
  };

  if (state.succeeded) {
    return (
      <div className="flex flex-col items-start gap-4 py-6" role="status">
        <CheckCircle2 className="h-10 w-10 text-emerald-600" aria-hidden="true" />
        <p className="text-[18px] font-semibold text-[#111113]">Thanks. We'll match profiles to your requirement and get back to you shortly.</p>
      </div>
    );
  }
  return (
    <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
      <input type="hidden" name="_subject" value="Website: ERP expert profiles request" />
      <input type="hidden" name="source" value="Website: ERP expert profiles request" />
      <div>
        <label htmlFor="xp-name" className={labelCls}>Full name</label>
        <input id="xp-name" name="name" required autoComplete="name" className={inputCls} placeholder="Your name" />
      </div>
      <div>
        <label htmlFor="xp-email" className={labelCls}>Work email</label>
        <input id="xp-email" name="email" type="email" required autoComplete="email" className={inputCls} placeholder="you@company.com" />
        <ValidationError prefix="Email" field="email" errors={state.errors} className="mt-1 block text-[12px] text-red-600" />
      </div>
      <div>
        <label htmlFor="xp-company" className={labelCls}>Company</label>
        <input id="xp-company" name="company" required autoComplete="organization" className={inputCls} placeholder="Company name" />
      </div>
      <div>
        <label htmlFor="xp-role" className={labelCls}>Expert you need</label>
        <select id="xp-role" name="expert" required className={inputCls} value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="" disabled>Select one</option>
          {ROLES.map((r) => (
            <option key={r.id}>{r.title}</option>
          ))}
          <option>Other SAP consultant or developer</option>
          <option>Oracle consultant or developer</option>
          <option>Microsoft Dynamics 365 consultant or developer</option>
          <option>Kinaxis consultant</option>
          <option>o9 Solutions consultant</option>
          <option>Other ERP or planning role</option>
        </select>
      </div>
      <div>
        <label htmlFor="xp-count" className={labelCls}>How many people</label>
        <select id="xp-count" name="headcount" className={inputCls} defaultValue="">
          <option value="" disabled>Select one</option>
          <option>1</option>
          <option>2 to 3</option>
          <option>4 or more</option>
        </select>
      </div>
      <div>
        <label htmlFor="xp-start" className={labelCls}>When should they start</label>
        <select id="xp-start" name="start" className={inputCls} defaultValue="">
          <option value="" disabled>Select one</option>
          <option>As soon as possible</option>
          <option>Within a month</option>
          <option>In 1 to 3 months</option>
          <option>Just exploring</option>
        </select>
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="xp-message" className={labelCls}>About the project (optional)</label>
        <textarea
          id="xp-message"
          name="message"
          rows={3}
          className={inputCls}
          placeholder="e.g. Blue Yonder Demand Planning upgrade, six-month engagement, works with our SAP team"
        />
      </div>
      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={state.submitting}
          className="group inline-flex items-center gap-2 rounded-full bg-[#111113] px-6 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-[#2a2a30] disabled:opacity-60 cursor-pointer"
        >
          {state.submitting ? "Sending…" : "Request expert profiles"}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </button>
        <ValidationError errors={state.errors} className="mt-1 block text-[12px] text-red-600" />
      </div>
    </form>
  );
}

export function ErpExpertsPage() {
  useSeo({
    title: "ERP & Supply Chain Planning Experts for Your Team | Stellar SCIO by Stellarmind.ai",
    description:
      "Hire experienced ERP and IT experts from Stellarmind.ai: Blue Yonder planning consultants (10+ years) and developers (5+ years), SAP S/4HANA & SAC data migration (7+ years), SAP Treasury (5+ years) and M365 / Windows infrastructure engineers (6+ years), plus SAP, Oracle, Dynamics 365, Kinaxis and o9 specialists.",
    path: "/erp-experts",
  });

  return (
    <SiteLayout>
      {/* ===== Hero: centred copy on a soft panel, photo card overlapping its bottom edge ===== */}
      <section className="relative -mt-[var(--nav-offset)] bg-[#F6F5F3]">
        <div className="px-2 pt-2 sm:px-3 sm:pt-3">
          <div
            className="theme-fixed relative overflow-hidden rounded-[24px] sm:rounded-[32px]"
            style={{ background: "linear-gradient(135deg, #3f5068 0%, #6c7d93 45%, #9aa7b7 100%)" }}
          >
            <div aria-hidden="true" className="pointer-events-none absolute -left-24 top-10 h-[420px] w-[520px] rounded-full bg-[radial-gradient(closest-side,rgba(30,44,64,0.55),transparent)]" />
            <div aria-hidden="true" className="pointer-events-none absolute -right-20 bottom-0 h-[380px] w-[520px] rounded-full bg-[radial-gradient(closest-side,rgba(242,169,59,0.22),transparent)]" />
            <div className="relative mx-auto max-w-[860px] px-5 pb-[clamp(130px,24vw,330px)] pt-[calc(var(--nav-offset)+40px)] text-center sm:pt-[calc(var(--nav-offset)+64px)]">
              <nav aria-label="Breadcrumb" className="flex items-center justify-center gap-1 text-[12.5px] text-white/60">
                <Link to="/" className="hover:text-white">Home</Link>
                <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="text-white/85" aria-current="page">ERP experts</span>
              </nav>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: EASE }}
                className="mt-6 text-[11.5px] font-semibold uppercase tracking-[0.18em] text-white/80 sm:text-[12.5px]"
              >
                Staff augmentation · Consultants &amp; developers
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.05, ease: EASE }}
                className="mt-4 font-display font-medium text-white text-balance"
                style={{ fontSize: "clamp(36px, 5.6vw, 72px)", lineHeight: 1.02, letterSpacing: "-0.04em" }}
              >
                ERP and planning experts, ready to join your team
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.12, ease: EASE }}
                className="mx-auto mt-5 max-w-[40rem] text-[16px] leading-relaxed text-white/85 sm:text-[17.5px]"
              >
                Experienced consultants and developers for SAP, Oracle, Dynamics 365, Blue Yonder, Kinaxis and o9, working inside your team for as long as you need them.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.18, ease: EASE }}
                className="mt-8 flex flex-wrap justify-center gap-3"
              >
                <a
                  href="#request"
                  className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-[15px] font-semibold text-[#111113] transition-colors hover:bg-[#F2A93B]"
                >
                  Request expert profiles <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </a>
                <a
                  href="#roles"
                  className="group inline-flex items-center gap-2 rounded-full border border-white/40 px-6 py-3.5 text-[15px] font-semibold text-white transition-colors hover:border-white hover:bg-white/10"
                >
                  See the roles <ArrowDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" aria-hidden="true" />
                </a>
              </motion.div>
            </div>
          </div>
        </div>

        {/* photo card */}
        <div className={`${SITE_SHELL} relative -mt-[clamp(100px,20vw,280px)] pb-4 sm:pb-8`}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25, ease: EASE }}
            className="theme-fixed relative mx-auto max-w-[1040px] overflow-hidden rounded-[20px] shadow-[0_40px_80px_-40px_rgba(17,17,19,0.6)] sm:rounded-[26px]"
          >
            <img
              src="/images/experts-hero.webp"
              alt="An ERP consultant walking a client team through a planning dashboard"
              className="aspect-[4/3] w-full object-cover sm:aspect-[16/8]"
              style={{ objectPosition: "50% 40%" }}
              fetchPriority="high"
            />
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/55 to-transparent" />
            <dl className="absolute inset-x-3 bottom-3 grid grid-cols-3 gap-2 sm:inset-x-auto sm:bottom-6 sm:left-6 sm:gap-3">
              {[
                ["10+ yrs", "Planning leads"],
                ["5+ yrs", "Developers"],
                ["6", "Platforms"],
              ].map(([v, l]) => (
                <div key={l} className="rounded-2xl border border-white/20 bg-white/15 px-3 py-2.5 text-white backdrop-blur-md sm:px-5 sm:py-3">
                  <dd className="text-[19px] font-semibold leading-none tracking-tight sm:text-[24px]">{v}</dd>
                  <dt className="mt-1 text-[11px] text-white/80 sm:text-[12.5px]">{l}</dt>
                </div>
              ))}
            </dl>
          </motion.div>

          {/* platforms covered */}
          <ul
            className="mx-auto mt-10 grid max-w-[1040px] grid-cols-3 items-center gap-x-4 gap-y-6 sm:grid-cols-6 sm:gap-x-6"
            aria-label="Platforms our experts cover"
          >
            {[...ERP, ...PLANNING].map((x) => {
              const s = HERO_LOGO[x.name];
              return (
                <li key={x.name} className="flex h-12 items-center justify-center gap-2">
                  <img src={x.logo} alt={x.name} className={`scio-platform-logo ${s.img} object-contain`} loading="lazy" />
                  {x.label && <span className={`scio-platform-logo whitespace-nowrap font-semibold text-[#111113] ${s.label}`}>{x.label}</span>}
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* ===== The roles ===== */}
      <section id="roles" className="scroll-mt-24 border-t border-[#E7E5E1] bg-[#F6F5F3]">
        <div className={`${SITE_SHELL} py-20 sm:py-28`}>
          <motion.div {...reveal} className="max-w-3xl">
            <Eyebrow>Our expert profiles</Eyebrow>
            <SectionHeading className="mt-4">Roles we already staff, ready for your team too.</SectionHeading>
            <p className="mt-5 max-w-[44rem] text-[17px] leading-relaxed text-[#4a4843]">
              Our experts already work in these roles with clients today. Need the same skills, or something close? We'll match you with the right person, or build a full team.
            </p>
          </motion.div>
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {ROLES.map((r, i) => (
              <RoleCard key={r.id} r={r} i={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ===== How they fit together ===== */}
      <TeamMap />

      {/* ===== Other platforms ===== */}
      <section className="bg-white">
        <div className={`${SITE_SHELL} py-20 sm:py-24`}>
          <motion.div {...reveal} className="mx-auto max-w-3xl text-center">
            <Eyebrow>Beyond Blue Yonder</Eyebrow>
            <SectionHeading className="mt-4">Experts across your other platforms too.</SectionHeading>
            <p className="mx-auto mt-5 max-w-[42rem] text-[17px] leading-relaxed text-[#4a4843]">
              Our professionals also work hands-on with SAP, Oracle, Microsoft Dynamics 365, Kinaxis and o9 Solutions.
            </p>
          </motion.div>
          <ul className="mx-auto mt-12 grid max-w-[920px] grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 [&>li:last-child]:col-span-2 sm:[&>li:last-child]:col-span-1">
            {[...ERP, ...PLANNING].filter((x) => x.name !== "Blue Yonder").map((x, i) => (
              <Tile key={x.name} s={x} i={i} />
            ))}
          </ul>
        </div>
      </section>

      {/* ===== How hiring works ===== */}
      <section className="border-t border-[#E7E5E1] bg-[#F6F5F3]">
        <div className={`${SITE_SHELL} py-20 sm:py-28`}>
          <motion.div {...reveal} className="max-w-3xl">
            <Eyebrow>How it works</Eyebrow>
            <SectionHeading className="mt-4">From requirement to your team, in four steps.</SectionHeading>
          </motion.div>
          <div className="mt-12 grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-stretch">
          <motion.figure {...reveal} className="theme-fixed relative min-h-[300px] overflow-hidden rounded-[24px]">
            <img
              src="/images/experts-interview.webp"
              alt="A client interviewing an ERP consultant over a video call"
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <figcaption className="absolute bottom-5 left-5 right-5 inline-flex items-center gap-2 text-[15px] font-semibold text-white">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-[#34D399] text-[#111113]">
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              </span>
              You interview every person before they join
            </figcaption>
          </motion.figure>
          <ol className="relative grid gap-4 sm:grid-cols-2">
            {STEPS.map((s, i) => (
              <motion.li
                key={s.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: EASE }}
                className="relative rounded-2xl border border-[#E7E5E1] bg-white p-6"
              >
                <span className="relative z-[1] grid h-[44px] w-[44px] place-items-center rounded-full bg-[#111113] text-[#F2A93B]">
                  <s.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <p className="mt-5 text-[12.5px] font-semibold uppercase tracking-[0.14em] text-[#B06D0F]">Step {i + 1}</p>
                <h3 className="mt-1.5 text-[18px] font-semibold text-[#111113]">{s.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-[#5D5A54]">{s.body}</p>
              </motion.li>
            ))}
          </ol>
          </div>
        </div>
      </section>

      {/* ===== Trust ===== */}
      <section className="theme-fixed relative overflow-hidden bg-[#0F0F11] text-white">
        <div aria-hidden="true" className="pointer-events-none absolute -right-40 top-1/2 h-[520px] w-[520px] -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(242,169,59,0.16),transparent)]" />
        <div className={`${SITE_SHELL} relative py-20 sm:py-24`}>
          <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-center">
            <motion.div {...reveal}>
              <Eyebrow tone="light">Why clients trust Stellarmind.ai</Eyebrow>
              <SectionHeading tone="light" className="mt-4">Certified, reviewed and backed by leading partners.</SectionHeading>
              <ul className="mt-8 space-y-4">
                {[
                  "ISO 9001 certified delivery processes",
                  "Reviewed on Clutch and Guru, so you can check our work before you hire",
                  "Partners and programs with OpenAI, AWS, NVIDIA, Databricks and Sarvam AI",
                  "You interview every person before they join your team",
                ].map((t) => (
                  <li key={t} className="flex gap-3 text-[16px] leading-snug text-white/85">
                    <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#F2A93B]" aria-hidden="true" />
                    {t}
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.ul {...reveal} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {PARTNERS.map((p) => {
                const img = <img src={p.src} alt={p.name} title={p.name} loading="lazy" className={`${p.h} w-auto max-w-full object-contain`} />;
                const cls =
                  "flex h-24 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-3 transition-colors duration-200 hover:border-[#F2A93B]/50 hover:bg-white/[0.07]";
                return (
                  <li key={p.name}>
                    {p.href ? (
                      <a href={p.href} target="_blank" rel="noopener noreferrer" aria-label={`${p.name} (opens in a new tab)`} className={cls}>
                        {img}
                      </a>
                    ) : (
                      <div className={cls}>{img}</div>
                    )}
                  </li>
                );
              })}
            </motion.ul>
          </div>
        </div>
      </section>

      {/* ===== Request ===== */}
      <section id="request" className="scroll-mt-24 bg-white">
        <div className={`${SITE_SHELL} grid gap-12 py-20 sm:py-28 lg:grid-cols-[0.8fr_1.2fr]`}>
          <motion.div {...reveal}>
            <Eyebrow>Request profiles</Eyebrow>
            <SectionHeading className="mt-4">Tell us the role. We'll share matching profiles.</SectionHeading>
            <p className="mt-5 max-w-[30rem] text-[17px] leading-relaxed text-[#4a4843]">
              Send the module, the seniority and how long you need someone. You can also email{" "}
              <a href="mailto:sales@stellarmind.ai" className="font-semibold text-[#111113] underline-offset-4 hover:underline">sales@stellarmind.ai</a>.
            </p>
            <div className="theme-fixed relative mt-8 hidden overflow-hidden rounded-[24px] lg:block">
              <img
                src="/images/experts-team.webp"
                alt="Consultants and a client team working together at a table"
                loading="lazy"
                className="h-[340px] w-full object-cover"
                style={{ objectPosition: "50% 45%" }}
              />
            </div>
          </motion.div>
          <div className="rounded-3xl border border-[#E7E5E1] p-6 sm:p-10">
            <RequestForm />
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
