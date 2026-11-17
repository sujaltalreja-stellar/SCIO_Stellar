"use client";
/* Shared design tokens, helpers, modals and static data for the public marketing site. */
import React, { useState, useEffect } from "react";
import {
  Zap,
  Building2,
  Ship,
  Truck,
  ArrowRight,
  Layers,
  Cpu,
  Sparkles,
  CheckCircle2,
  Radio,
  RefreshCw,
  Workflow
} from "lucide-react";
import { motion } from "framer-motion";
import { useForm, ValidationError } from "@formspree/react";


// Crisp High-Contrast Black & White Design System
export const C = {
  // Pure White & Clean Surfaces
  white: "#FFFFFF",
  whiteSurface: "#F6F5F3",
  whiteSunk: "#EFEEEB",
  lineLight: "#E5E3DF",
  lineLightSoft: "#EFEEEB",

  // Crisp High-Contrast Typography
  ink: "#111113",
  inkBody: "#2B2A27",
  inkMuted: "#5D5A54",
  inkFaint: "#7C7871",
  inkDim: "#A8A49D",

  // Obsidian Deep Black Surfaces
  night: "#0F0F11",
  nightRaised: "#17171A",
  nightCard: "#1D1D21",
  nightPanel: "#121214",
  lineDark: "rgba(255,255,255,0.08)",
  lineDarkSoft: "rgba(255,255,255,0.05)",

  chalk: "#F6F5F3",
  chalkBright: "#FFFFFF",
  slate400: "#94A3B8",
  slate600: "#64748B",

  // Vivid Precision Accents
  indigo: "#D98B16",
  violet: "#B06D0F",
  green: "#10B981",
  cyan: "#F2A93B",
  red: "#EF4444",
  amber: "#F59E0B",
  blue: "#D98B16",
};

export const ENTRANCE = [0.22, 1, 0.36, 1] as const;
export const EASE = [0.2, 0.7, 0.3, 1] as const;
export const SHELL = "mx-auto w-full max-w-[1360px] px-4 sm:px-6 lg:px-8";
export const VIEWPORT_WIDE = { once: true, amount: 0.15 };

export const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: ENTRANCE },
  },
};

export const stagger = (delayChildren = 0.08, staggerChildren = 0.1) => ({
  hidden: {},
  visible: {
    transition: {
      delayChildren,
      staggerChildren,
    },
  },
});

// Maritime Dashboard Sub-tabs
export const MARITIME_TABS = [
  "Overview",
  "Fleet & AIS Tracking",
  "Inspections & Safety",
  "Bunkering & MRO",
  "Safety Equipment",
];

// CountUp Helper for Control Tower numerals
export function CountUp({ to, decimals = 0, duration = 1.2 }: { to: number; decimals?: number; duration?: number }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start: number | null = null;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / (duration * 1000), 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setVal(easeOut * to);
      if (progress < 1) requestAnimationFrame(step);
      else setVal(to);
    };
    requestAnimationFrame(step);
  }, [to, duration]);
  return <>{decimals > 0 ? val.toFixed(decimals) : Math.round(val)}</>;
}

// Reusable Dashboard Card Component
export function DashboardCard({
  title,
  children,
  className = "",
  accentColor = "#8B5CF6",
  badge,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
  accentColor?: string;
  badge?: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-xl border border-white/[0.08] bg-[#FFFDFA]/[0.02] p-4 sm:p-5 transition-all hover:border-white/[0.14] ${className}`}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-white/60 font-bold sm:text-[11.5px]">
          <span
            className="h-1.5 w-1.5 rounded-full shrink-0"
            style={{ backgroundColor: accentColor }}
          />
          {title}
        </p>
        {badge}
      </div>
      {children}
    </div>
  );
}

export function DashboardMeter({
  label,
  value,
  display,
  percent,
  color,
  delay = 0,
}: {
  label: string;
  value?: number | string;
  display?: string | number;
  percent: number;
  color: string;
  delay?: number;
}) {
  return (
    <div className="grid grid-cols-[110px_minmax(0,1fr)_48px] items-center gap-3 sm:grid-cols-[140px_minmax(0,1fr)_56px]">
      <span className="truncate font-mono text-[11px] text-white/80 font-bold sm:text-[11.5px]" title={label}>
        {label}
      </span>
      <span className="h-1.5 overflow-hidden rounded-full bg-[#FFFDFA]/[0.06]">
        <motion.span
          className="block h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
          transition={{ duration: 0.8, ease: ENTRANCE, delay }}
        />
      </span>
      <span className="text-right font-mono text-[11px] text-white font-black sm:text-[11.5px]">
        {display ?? (typeof value === "number" ? `${value}%` : value)}
      </span>
    </div>
  );
}

// Section Intro Component with High Contrast Header
export function SectionIntro({
  eyebrow,
  title,
  description,
  tone = "light",
  rule = true,
  className = "",
}: {
  eyebrow: string;
  title?: string;
  description?: string;
  tone?: "light" | "dark";
  rule?: boolean;
  className?: string;
}) {
  const dark = tone === "dark";
  return (
    <div className={className}>
      <div className="flex items-baseline gap-4">
        <span
          className="uppercase font-mono font-bold text-[12px] sm:text-[13px] tracking-[2px]"
          style={{ color: dark ? C.green : C.blue }}
        >
          {eyebrow}
        </span>
        {rule && (
          <span
            className="h-px min-w-[40px] flex-1"
            style={{ background: dark ? "rgba(255,255,255,0.1)" : C.lineLight }}
            aria-hidden="true"
          />
        )}
      </div>

      {(title || description) && (
        <div className="mt-4 grid items-end gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:gap-12">
          {title && (
            <h2
              className="text-balance font-extrabold tracking-tight"
              style={{
                fontSize: "clamp(28px, 4.4vw, 52px)",
                letterSpacing: "-0.035em",
                lineHeight: 1.06,
                color: dark ? C.chalkBright : C.ink,
              }}
            >
              {title}
            </h2>
          )}
          {description && (
            <p
              className="max-w-[54ch] text-pretty leading-relaxed text-sm sm:text-base font-medium"
              style={{
                color: dark ? C.slate400 : C.inkBody,
              }}
            >
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// Formspree-Powered Join Beta Modal Component (Form ID: mrpznygn)
export function BetaFormModal({
  isOpen,
  onClose,
  onLaunchPlatform,
}: {
  isOpen: boolean;
  onClose: () => void;
  onLaunchPlatform: (e: React.MouseEvent, industry: string, tab?: string) => void;
}) {
  const [state, handleSubmit] = useForm("mrpznygn");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div
        className="border rounded-2xl max-w-xl w-full p-6 sm:p-8 space-y-5 shadow-2xl font-sans my-8"
        style={{ background: C.nightRaised, borderColor: C.lineDark, color: C.chalk }}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-white tracking-tight">
                Join SCIO Beta Program (v2.4)
              </h3>
              <p className="font-mono text-[10.5px] text-emerald-400 font-bold tracking-wide mt-0.5 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                EARLY ACCESS COHORT &bull; INSTANT SANDBOX PROVISIONING
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors font-mono text-base"
          >
            ✕
          </button>
        </div>

        {state.succeeded ? (
          <div className="py-6 text-center space-y-4 font-sans">
            <div
              className="h-16 w-16 rounded-full border-2 mx-auto flex items-center justify-center shadow-xl"
              style={{ background: "rgba(16,185,129,0.15)", borderColor: C.green, color: C.green }}
            >
              <CheckCircle2 className="h-9 w-9" />
            </div>
            <div className="space-y-1.5">
              <h4 className="text-xl font-black text-white">Application Received!</h4>
              <p className="text-xs sm:text-sm text-white/70 max-w-md mx-auto leading-relaxed">
                Thank you for applying to the SCIO Private Beta. Your application has been received, and sandbox credentials have been provisioned for your organization.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-black/60 border border-emerald-500/30 text-center font-mono space-y-1">
              <span className="text-[10.5px] text-white/50 uppercase tracking-widest block font-bold">
                Your Early Access Passcode
              </span>
              <span className="text-base sm:text-lg font-black text-emerald-400 tracking-widest">
                SCIO-BETA-PASS-88F2
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs text-white/70 font-sans text-left space-y-1.5">
              <div className="font-bold text-white/90 font-mono text-[11px] uppercase tracking-wider">What happens next:</div>
              <p className="flex items-center gap-2">&bull; <span>Instant access to our interactive OCC dashboard sandbox.</span></p>
              <p className="flex items-center gap-2">&bull; <span>Our technical team will reach out within 2 hours to connect your edge devices.</span></p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="/?launch=1&industry=energy&tab=energy-dashboard"
                onClick={(e) => {
                  onLaunchPlatform(e, "energy", "energy-dashboard");
                  onClose();
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs font-mono bg-white text-black hover:bg-slate-100 inline-flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] transition-all"
              >
                <span>Launch Beta Sandbox Now</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-3 rounded-xl font-bold text-xs font-mono text-white/70 hover:text-white border border-white/10 hover:bg-white/5 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs font-sans">
            {/* Row 1: Name & Work Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="beta-name" className="block mb-1 font-mono text-[10px] uppercase font-bold text-white/70">
                  Full Name *
                </label>
                <input
                  id="beta-name"
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Alex Morgan"
                  className="w-full px-3.5 py-2.5 border rounded-xl font-sans focus:outline-none text-white focus:border-indigo-400 transition-colors"
                  style={{ background: C.night, borderColor: C.lineDark }}
                />
                <ValidationError prefix="Name" field="name" errors={state.errors} className="text-red-400 text-[10.5px] mt-1 block font-mono" />
              </div>

              <div>
                <label htmlFor="beta-email" className="block mb-1 font-mono text-[10px] uppercase font-bold text-white/70">
                  Corporate Work Email *
                </label>
                <input
                  id="beta-email"
                  type="email"
                  name="email"
                  required
                  placeholder="alex@enterprise.com"
                  className="w-full px-3.5 py-2.5 border rounded-xl font-mono focus:outline-none text-white focus:border-indigo-400 transition-colors"
                  style={{ background: C.night, borderColor: C.lineDark }}
                />
                <ValidationError prefix="Email" field="email" errors={state.errors} className="text-red-400 text-[10.5px] mt-1 block font-mono" />
              </div>
            </div>

            {/* Row 2: Company & Role */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="beta-company" className="block mb-1 font-mono text-[10px] uppercase font-bold text-white/70">
                  Company / Organization *
                </label>
                <input
                  id="beta-company"
                  type="text"
                  name="company"
                  required
                  placeholder="e.g. Global Energy Corp"
                  className="w-full px-3.5 py-2.5 border rounded-xl font-sans focus:outline-none text-white focus:border-indigo-400 transition-colors"
                  style={{ background: C.night, borderColor: C.lineDark }}
                />
                <ValidationError prefix="Company" field="company" errors={state.errors} className="text-red-400 text-[10.5px] mt-1 block font-mono" />
              </div>

              <div>
                <label htmlFor="beta-role" className="block mb-1 font-mono text-[10px] uppercase font-bold text-white/70">
                  Job Role / Title
                </label>
                <input
                  id="beta-role"
                  type="text"
                  name="role"
                  placeholder="e.g. VP Operations / Chief Engineer"
                  className="w-full px-3.5 py-2.5 border rounded-xl font-sans focus:outline-none text-white focus:border-indigo-400 transition-colors"
                  style={{ background: C.night, borderColor: C.lineDark }}
                />
                <ValidationError prefix="Role" field="role" errors={state.errors} className="text-red-400 text-[10.5px] mt-1 block font-mono" />
              </div>
            </div>

            {/* Row 3: Industry & Fleet Scale */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="beta-industry" className="block mb-1 font-mono text-[10px] uppercase font-bold text-white/70">
                  Primary Operating Sector *
                </label>
                <select
                  id="beta-industry"
                  name="industry"
                  className="w-full px-3.5 py-2.5 border rounded-xl font-sans focus:outline-none text-white focus:border-indigo-400 transition-colors"
                  style={{ background: C.night, borderColor: C.lineDark }}
                >
                  <option value="Renewable Energy & Power Utilities">Renewable Energy &amp; Power Utilities</option>
                  <option value="Maritime Fleet & Port Operations">Maritime Fleet &amp; Port Operations</option>
                  <option value="Manufacturing 4.0 & Industrial OEE">Manufacturing 4.0 &amp; Industrial OEE</option>
                  <option value="Multimodal Cold-Chain & Supply Chain">Multimodal Cold-Chain &amp; Supply Chain</option>
                  <option value="Mining & Heavy Equipment">Mining &amp; Heavy Equipment</option>
                  <option value="Critical Infrastructure & Smart Grid">Critical Infrastructure &amp; Smart Grid</option>
                </select>
                <ValidationError prefix="Industry" field="industry" errors={state.errors} className="text-red-400 text-[10.5px] mt-1 block font-mono" />
              </div>

              <div>
                <label htmlFor="beta-fleetSize" className="block mb-1 font-mono text-[10px] uppercase font-bold text-white/70">
                  Fleet / Monitored Asset Scale
                </label>
                <select
                  id="beta-fleetSize"
                  name="fleetSize"
                  className="w-full px-3.5 py-2.5 border rounded-xl font-sans focus:outline-none text-white focus:border-indigo-400 transition-colors"
                  style={{ background: C.night, borderColor: C.lineDark }}
                >
                  <option value="1-10 Assets (Pilot Sandbox)">1 – 10 Assets / Machines (Pilot Sandbox)</option>
                  <option value="10-50 Assets (Regional Deployment)">10 – 50 Assets (Regional Deployment)</option>
                  <option value="50-250 Assets (Multi-Site Rollout)">50 – 250 Assets (Multi-Site Rollout)</option>
                  <option value="250+ Assets (Global Enterprise Scale)">250+ Assets (Global Enterprise Scale)</option>
                </select>
                <ValidationError prefix="Fleet Size" field="fleetSize" errors={state.errors} className="text-red-400 text-[10.5px] mt-1 block font-mono" />
              </div>
            </div>

            {/* Row 4: Phone / WhatsApp (Optional) */}
            <div>
              <label htmlFor="beta-phone" className="block mb-1 font-mono text-[10px] uppercase font-bold text-white/70">
                Phone / WhatsApp (Optional for rapid onboarding)
              </label>
              <input
                id="beta-phone"
                type="tel"
                name="phone"
                placeholder="+1 (555) 000-0000"
                className="w-full px-3.5 py-2.5 border rounded-xl font-mono focus:outline-none text-white focus:border-indigo-400 transition-colors"
                style={{ background: C.night, borderColor: C.lineDark }}
              />
              <ValidationError prefix="Phone" field="phone" errors={state.errors} className="text-red-400 text-[10.5px] mt-1 block font-mono" />
            </div>

            {/* Row 5: Message / Requirements */}
            <div>
              <label htmlFor="beta-message" className="block mb-1 font-mono text-[10px] uppercase font-bold text-white/70">
                Current Systems &amp; Key Priorities (Optional)
              </label>
              <textarea
                id="beta-message"
                name="message"
                rows={2}
                placeholder="e.g. Connecting OPC-UA telemetry across 8 gas turbines and syncing work orders with SAP PM."
                className="w-full px-3.5 py-2.5 border rounded-xl font-sans focus:outline-none text-white focus:border-indigo-400 transition-colors resize-none"
                style={{ background: C.night, borderColor: C.lineDark }}
              />
              <ValidationError prefix="Message" field="message" errors={state.errors} className="text-red-400 text-[10.5px] mt-1 block font-mono" />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={state.submitting}
                className="w-full py-3.5 font-bold text-xs font-mono rounded-xl shadow-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer hover:scale-[1.01]"
              >
                {state.submitting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Submitting Application to Formspree...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Submit &amp; Apply for Private Beta Access</span>
                  </>
                )}
              </button>
              <p className="text-[10px] font-mono text-center text-white/40 mt-2">
                Protected by Formspree &bull; Zero spam policy &bull; Instant sandbox pass
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// Formspree-Powered Request Enterprise Demo Modal Component (Form ID: mrpznygn)
export function DemoFormModal({
  isOpen,
  onClose,
  onLaunchPlatform,
}: {
  isOpen: boolean;
  onClose: () => void;
  onLaunchPlatform: (e: React.MouseEvent, industry: string, tab?: string) => void;
}) {
  const [state, handleSubmit] = useForm("mrpznygn");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div
        className="border rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl font-sans my-8"
        style={{ background: C.nightRaised, borderColor: C.lineDark, color: C.chalk }}
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full animate-pulse bg-cyan-400" />
            <h3 className="font-bold text-sm text-white font-mono">Request Enterprise Demo</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10 text-lg cursor-pointer">✕</button>
        </div>

        {state.succeeded ? (
          <div className="py-6 text-center space-y-3 font-sans">
            <div className="h-12 w-12 rounded-full border mx-auto flex items-center justify-center bg-emerald-500/20 border-emerald-500 text-emerald-400">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h4 className="text-base font-bold text-white">Demo Request Received</h4>
            <p className="text-xs text-white/70 max-w-xs mx-auto leading-relaxed">
              Your request has been registered with Formspree. Our Enterprise Architecture team will reach out within 2 hours.
            </p>
            <a
              href="/?launch=1&industry=energy&tab=energy-dashboard"
              onClick={(e) => {
                onLaunchPlatform(e, "energy", "energy-dashboard");
                onClose();
              }}
              className="mt-4 px-4 py-2.5 rounded-lg font-bold text-xs font-mono bg-white text-black hover:bg-slate-100 inline-block shadow-md"
            >
              Explore Interactive Live Demo Now →
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5 font-sans text-xs">
            <input type="hidden" name="form_type" value="Enterprise Demo Request" />
            <input type="hidden" name="source" value="Stellar SCIO Enterprise Demo Modal" />

            <div>
              <label htmlFor="demo-email" className="block mb-1 font-mono text-[10px] uppercase text-white/60 font-bold">
                Corporate Work Email
              </label>
              <input
                id="demo-email"
                type="email"
                name="email"
                required
                placeholder="name@enterprise.com"
                className="w-full px-3.5 py-2.5 border rounded-lg font-mono focus:outline-none text-white transition-colors focus:border-cyan-400"
                style={{ background: C.night, borderColor: C.lineDark }}
              />
              <ValidationError prefix="Email" field="email" errors={state.errors} className="text-red-400 text-[10px] mt-1 font-mono" />
            </div>

            <div>
              <label htmlFor="demo-sector" className="block mb-1 font-mono text-[10px] uppercase text-white/60 font-bold">
                Primary Operating Sector
              </label>
              <select
                id="demo-sector"
                name="sector"
                className="w-full px-3.5 py-2.5 border rounded-lg font-mono focus:outline-none text-white transition-colors focus:border-cyan-400"
                style={{ background: C.night, borderColor: C.lineDark }}
              >
                <option value="Renewable Energy & Utilities">Renewable Energy &amp; Utilities (12.4 GW)</option>
                <option value="Maritime Fleet Operations">Maritime Fleet Operations (28 Ships)</option>
                <option value="Manufacturing 4.0 & OEE">Manufacturing 4.0 &amp; OEE (91.4% OEE)</option>
                <option value="Cold-Chain & Multimodal Logistics">Cold-Chain &amp; Multimodal Logistics (142 Reefers)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={state.submitting}
              className="w-full mt-2 py-3 font-bold text-xs font-mono rounded-lg shadow-md bg-white text-black hover:bg-slate-100 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {state.submitting ? (
                <>
                  <span className="h-3 w-3 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Submitting to Formspree...</span>
                </>
              ) : (
                <span>Submit Demo Request</span>
              )}
            </button>

            <p className="text-[10px] text-center text-white/40 font-mono">
              Protected by Formspree &bull; Zero spam policy
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

// ==================== ENTERPRISE QUESTIONS (FAQ) DATA & RENDERER ====================
export interface EnterpriseQuestion {
  id: number;
  question: string;
  category: "platform" | "deployment" | "ai" | "roi";
  categoryName: string;
  answerText: string;
  badges?: string[];
}

export const ENTERPRISE_QUESTIONS_DATA: EnterpriseQuestion[] = [
  {
    id: 1,
    question: "What is SCIO?",
    category: "platform",
    categoryName: "Platform & Architecture",
    answerText: "SCIO is an Enterprise Operational Intelligence platform that connects assets, people, enterprise systems, workflows, operational data and AI into a shared operational context.\n\nIt helps organizations move from fragmented signals to evidence-backed decisions, governed actions and continuous operational learning.",
    badges: ["Operational Intelligence", "Shared Context", "Governed Action"],
  },
  {
    id: 2,
    question: "Does SCIO replace our existing ERP?",
    category: "platform",
    categoryName: "Platform & Architecture",
    answerText: "No.\n\nSCIO can operate alongside existing ERP/EAM platforms such as SAP, Oracle or IBM Maximo. Existing systems can remain the system of record while SCIO adds operational intelligence, cross-system context, AI-powered decision support and workflow orchestration.",
    badges: ["ERP Side-by-Side", "System of Record Preserved", "Orchestration Layer"],
  },
  {
    id: 3,
    question: "Can SCIO integrate with SAP, Oracle and IBM Maximo?",
    category: "platform",
    categoryName: "Platform & Architecture",
    answerText: "Yes, SCIO is designed to integrate with existing enterprise systems through governed integration boundaries.\n\nDepending on the implementation, SCIO can connect enterprise systems with operational sources such as SCADA, IoT, GIS, inspections, documents and mobile/offline systems.\n\nSpecific connector availability is confirmed during implementation.",
    badges: ["SAP & Oracle Connectors", "IBM Maximo", "SCADA / IoT / GIS"],
  },
  {
    id: 4,
    question: "Can SCIO work without replacing our existing software?",
    category: "platform",
    categoryName: "Platform & Architecture",
    answerText: "Yes.\n\nThis is one of SCIO's core architectural principles. SCIO can sit as an intelligence and orchestration layer around the systems an organization already uses.",
    badges: ["Zero Rip-and-Replace", "Wrapper Layer", "Rapid Value"],
  },
  {
    id: 5,
    question: "Can SCIO be deployed on our own infrastructure?",
    category: "deployment",
    categoryName: "Deployment & Security",
    answerText: "Yes, SCIO supports an on-premises deployment model.\n\nSCIO can be deployed within a customer's controlled infrastructure, allowing deployment architecture and data residency to align with the organization's security, compliance and jurisdictional requirements.",
    badges: ["On-Premises", "Data Residency", "Full Sovereignty"],
  },
  {
    id: 6,
    question: "Does SCIO support private cloud or hybrid deployment?",
    category: "deployment",
    categoryName: "Deployment & Security",
    answerText: "Yes.\n\nSCIO can be architected for:\n• On-premises\n• Private cloud\n• Hybrid environments\n\nThe appropriate model depends on the customer's infrastructure, security policies, operational requirements and data-residency needs.",
    badges: ["Private Cloud", "Hybrid Environment", "Multi-Region"],
  },
  {
    id: 7,
    question: "Can SCIO operate in an offline or air-gapped environment?",
    category: "deployment",
    categoryName: "Deployment & Security",
    answerText: "SCIO's architecture supports local operation and an offline/air-gapped licensing approach.\n\nProduction offline capabilities should be validated as part of the specific deployment architecture before being committed as a contractual requirement.",
    badges: ["Air-Gapped Support", "Offline Licensing", "Local Edge Mode"],
  },
  {
    id: 8,
    question: "What makes SCIO different from another AI platform?",
    category: "platform",
    categoryName: "Platform & Architecture",
    answerText: "SCIO is not positioned as simply an AI chatbot or analytics tool.\n\nIt connects:\nAssets + People + Data + ERP + IoT + Documents + Workflows + AI\n\nand preserves relationships between operational events, assets, maintenance, inspections, inventory, suppliers, decisions, approvals and outcomes.\n\nThe goal is to turn isolated information into shared operational context.",
    badges: ["Full Context Mesh", "Connected Graph", "Beyond Chatbots"],
  },
  {
    id: 9,
    question: "What can SCIO's AI actually do?",
    category: "ai",
    categoryName: "AI Capabilities & Governance",
    answerText: "SCIO can assist with operational intelligence such as:\n• Root-cause analysis\n• Predictive maintenance\n• Document intelligence\n• Inspection intelligence\n• Equipment health analysis\n• Material availability\n• Operational recommendations\n• Workflow assistance\n• Evidence-based decision support\n\nAI recommendations are connected to available operational context and supporting evidence.",
    badges: ["Root-Cause Analysis", "Predictive Maintenance", "Document & Inspection AI"],
  },
  {
    id: 10,
    question: "Can SCIO automatically make operational decisions?",
    category: "ai",
    categoryName: "AI Capabilities & Governance",
    answerText: "SCIO is designed around governed decision-making rather than unrestricted autonomous action.\n\nDepending on the workflow, recommendations can be reviewed through role-based controls such as:\nApprove → Edit → Escalate → Reject\n\nSensitive operational, financial or safety-related actions can require human approval.",
    badges: ["Human-in-the-Loop", "Governed Decisions", "Role-Based Approvals"],
  },
  {
    id: 11,
    question: "Can SCIO automatically control critical machinery?",
    category: "ai",
    categoryName: "AI Capabilities & Governance",
    answerText: "SCIO should not be positioned as an autonomous safety-critical control system.\n\nIts core approach is to provide evidence-backed recommendations, governed permissions and controlled human action rather than independently controlling critical machinery.",
    badges: ["Safety First", "Evidence-Backed", "Human Oversight"],
  },
  {
    id: 12,
    question: "What industries does SCIO support?",
    category: "roi",
    categoryName: "Value & Implementation",
    answerText: "SCIO is designed around multiple industrial environments, including:\n• Energy & Renewable Energy\n• Manufacturing\n• Maritime\n• Logistics\n\nThe underlying platform services remain consistent while workflows, operational context and use cases adapt to each industry.\n\nFor maritime operations, this can include fleet management, vessel assets, maintenance, spares, procurement, crew readiness, safety inspections and safety equipment.",
    badges: ["Energy", "Manufacturing", "Maritime", "Logistics"],
  },
  {
    id: 13,
    question: "Can SCIO include ERP capabilities?",
    category: "platform",
    categoryName: "Platform & Architecture",
    answerText: "Yes.\n\nOrganizations can choose between two approaches:\n\n1. SCIO + Existing ERP\nUse the organization's existing ERP/EAM as the system of record while SCIO provides intelligence and orchestration.\n\n2. SCIO + Built-in Operational Modules\nSCIO can provide selected operational/business capabilities such as:\nAssets | Inventory | Suppliers | Procurement | Work Orders | Maintenance | Inspections | Approvals | Documents | Users/Roles | Analytics\n\nThis allows SCIO to adapt to the customer's existing architecture rather than forcing a single deployment model.",
    badges: ["Dual Approach", "Modular ERP", "Architectural Flexibility"],
  },
  {
    id: 14,
    question: "How does SCIO protect AI governance?",
    category: "ai",
    categoryName: "AI Capabilities & Governance",
    answerText: "SCIO's governed AI approach includes controls such as:\n• Model/version registry\n• Drift monitoring\n• Validation\n• Approval gates\n• Champion/challenger testing\n• Rollback capability\n• Audit trails\n\nThe principle is simple:\nAI recommends. Governance determines what happens.",
    badges: ["Drift Monitoring", "Audit Trails", "AI Recommends. Governance Determines."],
  },
  {
    id: 15,
    question: "How does SCIO create measurable business value?",
    category: "roi",
    categoryName: "Value & Implementation",
    answerText: "SCIO does not rely on invented ROI percentages.\n\nThe implementation begins by establishing a baseline and then measuring agreed KPIs. These can include:\n\n• Operations: Availability, MTTR, schedule adherence\n• Cost: Emergency procurement, excess inventory, demurrage, rework\n• Risk: Evidence completeness, overdue controls, approval compliance\n• Intelligence: Alert precision, recommendation acceptance, time-to-evidence, model drift\n\nThe baseline, formula, data owner, source and evaluation period can be defined before measuring improvement.",
    badges: ["No Invented ROI", "Baseline KPIs", "Empirical Evaluation"],
  },
  {
    id: 16,
    question: "How is SCIO implemented?",
    category: "roi",
    categoryName: "Value & Implementation",
    answerText: "SCIO follows a phased approach:\nAlign → Connect → Validate → Pilot → Scale\n\nThe initial implementation focuses on one high-value workflow or site. Once KPI, security, integration and adoption requirements are validated, the solution can expand to additional assets, departments, sites and use cases.",
    badges: ["Phased Rollout", "Align → Connect → Validate → Pilot → Scale"],
  },
  {
    id: 17,
    question: "How does SCIO handle enterprise security?",
    category: "deployment",
    categoryName: "Deployment & Security",
    answerText: "SCIO's architecture includes enterprise controls such as:\nIdentity & Access Control | Encryption | SSO | Least Privilege | Segregation of Duties | Environment Isolation | Audit | Data Governance\n\nSecurity architecture is aligned with the customer's deployment and governance requirements.",
    badges: ["SSO & RBAC", "End-to-End Encryption", "Segregation of Duties"],
  },
  {
    id: 18,
    question: "Who owns the data when SCIO is deployed?",
    category: "deployment",
    categoryName: "Deployment & Security",
    answerText: "For customer-controlled deployments, the customer's infrastructure, systems, data location and security policies remain under the customer's control.\n\nThe specific data ownership, retention and access arrangements should be defined contractually for each implementation.",
    badges: ["Customer Data Ownership", "Full Data Control", "Contractual Clarity"],
  },
  {
    id: 19,
    question: "Can we start with only one site or workflow?",
    category: "roi",
    categoryName: "Value & Implementation",
    answerText: "Yes.\n\nSCIO is designed to start with a focused, high-value operational workflow, establish a measurable baseline, validate the integration and demonstrate the operating loop before scaling across additional sites or use cases.",
    badges: ["Single Site Start", "Low Risk", "Proven Loop"],
  },
  {
    id: 20,
    question: "How do we get started with SCIO?",
    category: "roi",
    categoryName: "Value & Implementation",
    answerText: "Start with one operational problem worth solving.\n\nA SCIO engagement can begin by identifying:\nThe site → The workflow → The decision owner → The operational problem → The baseline KPI → The required systems/data\n\nFrom there, SCIO can be evaluated through a controlled implementation or pilot.",
    badges: ["One Problem First", "Controlled Pilot", "Guided Onboarding"],
  },
];

export function renderFaqFormattedAnswer(faq: EnterpriseQuestion) {
  const paragraphs = faq.answerText.split("\n\n");
  return paragraphs.map((paragraph, idx) => {
    if (paragraph.startsWith("• ")) {
      const items = paragraph.split("\n").map(p => p.replace(/^•\s*/, "").trim());
      return (
        <ul key={idx} className="space-y-2 pl-1 my-3">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-slate-300">
              <span className="text-cyan-400 font-bold shrink-0 mt-0.5">›</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
    }
    if (paragraph.includes("→")) {
      const steps = paragraph.split("→").map(s => s.trim());
      return (
        <div key={idx} className="my-3 p-3.5 rounded-xl border border-cyan-500/30 bg-cyan-950/20 flex flex-wrap items-center justify-center gap-2">
          {steps.map((step, i) => (
            <React.Fragment key={i}>
              <span className="px-3 py-1 rounded-lg bg-slate-900 border border-cyan-500/30 text-cyan-300 font-mono text-xs font-bold">
                {step}
              </span>
              {i < steps.length - 1 && (
                <span className="text-cyan-400 font-black text-sm">→</span>
              )}
            </React.Fragment>
          ))}
        </div>
      );
    }
    if (paragraph.includes("AI recommends. Governance determines what happens.")) {
      return (
        <div key={idx} className="my-4 p-4 rounded-xl border border-amber-500/40 bg-amber-950/30 text-amber-300 font-mono text-xs font-bold text-center shadow-lg">
          &ldquo;AI recommends. Governance determines what happens.&rdquo;
        </div>
      );
    }
    if (paragraph.includes("Assets + People + Data")) {
      return (
        <div key={idx} className="my-3 p-3.5 rounded-xl border border-indigo-500/30 bg-indigo-950/30 text-indigo-200 font-mono text-xs font-bold text-center">
          {paragraph}
        </div>
      );
    }
    return (
      <p key={idx} className="leading-relaxed text-slate-300 text-sm font-sans">
        {paragraph}
      </p>
    );
  });
}


// ---------- Static page data (moved out of the old single-page component) ----------
// 4 Core Operating Industries Definition with Ultra-Relevant Industrial Photography
export const INDUSTRY_DATA = {
  energy: {
    id: "energy",
    name: "Renewable Energy & Grid Utilities",
    tagline: "12.4 GW Generation · Real-Time Vibration FFT · Grid Balancing",
    icon: Zap,
    accentColor: C.green,
    heroImg: "https://images.unsplash.com/photo-1497440001374-f26997328c1b?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      { label: "Utility Solar Array (6.2 GW)", img: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=600&q=80" },
      { label: "Offshore Wind Turbine Cluster", img: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=600&q=80" },
      { label: "500kV Substation & BESS Storage", img: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=600&q=80" },
    ],
    problem: "Intermittent weather fluctuations, transformer thermal degradation, and fragmented SCADA silos lead to catastrophic grid trips and curtailment penalties.",
    solution: "SCIO ingests 96.0 kS/s DSP vibration telemetry, forecasts load spikes 72 hours in advance, and optimizes multi-source power dispatch across solar, wind, and BESS in real-time.",
    kpis: [
      { label: "Monitored Capacity", val: "12.4 GW", tone: C.green },
      { label: "FFT Vibration Sampling", val: "96.0 kS/s", tone: C.cyan },
      { label: "Inverter Fleet Health", val: "98.4%", tone: C.green },
      { label: "Prevented Outage Costs", val: "$1.4M / yr", tone: C.indigo }
    ],
    tab: "energy-dashboard"
  },
  maritime: {
    id: "maritime",
    name: "Maritime Fleet & Port Operations",
    tagline: "Live Vessel GPS Tracking · Fuel Logs · Safety Inspections & Parts Delivery",
    icon: Ship,
    accentColor: C.violet,
    heroImg: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      { label: "Mega Container Vessel at Sea", img: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80" },
      { label: "ECDIS Navigation Bridge Console", img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80" },
      { label: "Automated Port Gantry Cranes", img: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=600&q=80" },
    ],
    problem: "Ocean-going fleets operate with high-latency offline communication gaps, rising fuel costs, and unexpected equipment breakdowns at sea.",
    solution: "SCIO's Operations Control Tower monitors vessel availability, tracks 200 MT fuel reserves, and completes routine safety equipment checklists before docking.",
    kpis: [
      { label: "Fleet Monitored", val: "28 Vessels", tone: C.violet },
      { label: "Safety Readiness Score", val: "98.8%", tone: C.green },
      { label: "Bunker ROB Accuracy", val: "99.2%", tone: C.cyan },
      { label: "Port Clearance Rate", val: "97.5%", tone: C.green }
    ],
    tab: "dashboard"
  },
  manufacturing: {
    id: "manufacturing",
    name: "Manufacturing 4.0 & Industrial Automation",
    tagline: "Dual-Axis OEE Analysis · Robotic Joint Telemetry · Optical Defect QA",
    icon: Building2,
    accentColor: C.amber,
    heroImg: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      { label: "6-Axis Automotive Robotic Welding", img: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80" },
      { label: "Precision 5-Axis CNC Titanium Mill", img: "https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=600&q=80" },
      { label: "Automated Optical PCB Inspection Line", img: "https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=600&q=80" },
    ],
    problem: "Unscheduled assembly line stops cost upwards of $120,000/hr, while micro-defects escape visual checks and exhaust spare parts buffers.",
    solution: "SCIO correlates robotic joint vibration with hydraulic pressure loss, calculates dual-axis OEE pareto breakdown, and dispatches automated MRO work orders.",
    kpis: [
      { label: "Overall OEE Score", val: "88.6%", tone: C.amber },
      { label: "Robotic Line Uptime", val: "99.4%", tone: C.green },
      { label: "Optical Defect Catch Rate", val: "99.1%", tone: C.cyan },
      { label: "Spindle Fault Lead Time", val: "14 Days", tone: C.violet }
    ],
    tab: "dashboard"
  },
  logistics: {
    id: "logistics",
    name: "Global Multimodal Supply Chain",
    tagline: "Cold-Chain IoT Telemetry · Demurrage Prevention · Route Bottlenecks",
    icon: Truck,
    accentColor: C.cyan,
    heroImg: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      { label: "High-Bay Robotic Distribution Hub", img: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80" },
      { label: "Intermodal Rail Freight Container Yard", img: "https://images.unsplash.com/photo-1580674684081-7617fbf3d745?auto=format&fit=crop&w=600&q=80" },
      { label: "IoT Cold-Chain Carrier (-18.4°C)", img: "https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=600&q=80" },
    ],
    problem: "Terminal congestion, temperature excursions in sub-zero cold chains, and supplier lead-time blindness lead to costly stockouts and demurrage fees.",
    solution: "SCIO monitors in-transit freight, alerts on cold-chain excursions (-18.4°C threshold), and predicts port customs clearance bottlenecks 9 days in advance.",
    kpis: [
      { label: "Active Shipments", val: "1,420 TEU", tone: C.cyan },
      { label: "On-Time Delivery Rate", val: "96.4%", tone: C.green },
      { label: "Cold-Chain Compliance", val: "99.8%", tone: C.green },
      { label: "Demurrage Avoidance", val: "$420k / qtr", tone: C.violet }
    ],
    tab: "dashboard"
  }
};

// How SCIO Works - Simple Hierarchy: CONNECT → UNDERSTAND → PREDICT → ACT
export const HOW_SCIO_WORKS_STEPS = [
  {
    step: "01",
    phase: "CONNECT",
    stepName: "Connect All Data",
    title: "Universal Telemetry Ingestion",
    subtitle: "Bring live data from machines, sensors, PLCs, SCADA, ERP, and other systems into SCIO.",
    accent: C.cyan,
    accentBg: "rgba(6, 182, 212, 0.12)",
    icon: Radio,
    badge: "Zero Rip-and-Replace",
    description:
      "Connect all your physical machines, field sensors, PLC controllers, SCADA historians, and enterprise ERP databases directly to SCIO using lightweight, non-invasive connectors with zero downtime.",
    capabilities: [
      "Connects 40+ standard protocols: OPC-UA, Modbus TCP, MQTT Sparkplug B, IEC 61850, CANbus, and REST APIs",
      "Zero-loss edge buffering: Stores and forwards telemetry during network or remote communications blackouts",
      "100% Data Sovereignty: Deployed on your own secure servers & private cloud — your operational telemetry never leaves your infrastructure",
      "Hardware-grade security: Secure read-only data diode architecture with TLS 1.3 encryption & mTLS",
      "Automatic stream standardization: Unifies timestamps, engineering units, and sampling frequencies"
    ],
    metrics: [
      { label: "Supported Protocols", val: "40+" },
      { label: "Stream Latency", val: "32ms" },
      { label: "Throughput", val: "2.4M msg/s" },
      { label: "Data Integrity", val: "100%" }
    ],
    payload: {
      source_protocol: "OPC-UA / Sparkplug-B",
      gateway_id: "SCIO-EDGE-GW-084",
      asset_id: "TURBINE-04 [Gas-Turbine 45MW]",
      timestamp: "2026-08-26T04:30:12.842Z",
      sensors: {
        radial_vibration_mm_s: 4.82,
        bearing_temp_celsius: 78.4,
        lube_oil_pressure_bar: 3.12,
        harmonic_frequency_hz: 120.4,
        exhaust_gas_temp_c: 542.1
      },
      health_packet: "CRC32_VERIFIED_VALID",
      edge_processing_latency_ms: 1.4
    },
    logicSummary:
      "Edge agent samples registers at 100Hz, verifies packet checksums, filters noise, and securely transmits encrypted batches to SCIO.",
    architectureNodes: [
      "Field Sensors / PLCs",
      "SCIO Edge Gateway Container",
      "Kafka / Telemetry Stream Broker",
      "Dynamic Stream Normalizer"
    ]
  },
  {
    step: "02",
    phase: "UNDERSTAND",
    stepName: "Understand Assets & Operations",
    title: "Digital Twin & Operational Context",
    subtitle: "Connect assets, machines, sensors, maintenance history, processes, and relationships to understand what is happening across the operation.",
    accent: C.violet,
    accentBg: "rgba(124, 58, 237, 0.12)",
    icon: Layers,
    badge: "Complete Context",
    description:
      "SCIO links sensor telemetry to real-world equipment hierarchies, maintenance records, Bill of Materials (BOM), and operational processes to build a living digital replica of your entire operation.",
    capabilities: [
      "Dynamic Asset Graph: Maps every sensor to its exact physical machine, sub-component, and plant",
      "Unified Business & OT Context: Blends live sensor feeds with SAP maintenance logs and asset records",
      "Live Operational State: Reconstructs real-time physical stresses, operating limits, and efficiency",
      "Historical Replay: Replays exact machine behavior and signals leading up to any past event"
    ],
    metrics: [
      { label: "Connected Assets", val: "120K+" },
      { label: "Twin Refresh", val: "100ms" },
      { label: "ERP Linkage", val: "100%" },
      { label: "Model Accuracy", val: "99.9%" }
    ],
    payload: {
      twin_id: "TWIN_TURBINE_04_GE_9E",
      parent_facility: "Combined Cycle Power Plant Station Alpha",
      operating_hours: 14820,
      design_spec: "GE Frame 9E 45MW Base-load",
      current_state_vector: {
        thermal_gradient_delta: "+6.2°C over baseline",
        vibration_harmonic_stress: "Stage 2 Fatigue Risk",
        operating_efficiency: "87.4% (Nominal 92.0%)",
        degradation_index: "0.82 (Elevated)"
      },
      linked_history: {
        last_overhaul_date: "14 Feb 2026",
        active_work_orders: ["WO-98211-MRO"],
        warranty_sla: "Tier-1 OEM Critical Care"
      }
    },
    logicSummary:
      "Dynamic graph matches incoming sensor IDs against equipment Bill of Materials (BOM) schemas, evaluating physical operating limits in real time.",
    architectureNodes: [
      "Raw Stream Pipeline",
      "Graph Entity Resolver",
      "Physics Constraint Engine",
      "Digital Twin State Store"
    ]
  },
  {
    step: "03",
    phase: "PREDICT",
    stepName: "Predict Problems",
    title: "Predictive AI & Diagnostics",
    subtitle: "Use live data, historical data, documents, images, and other information to detect issues, identify root causes, and predict failures.",
    accent: C.amber,
    accentBg: "rgba(245, 158, 11, 0.12)",
    icon: Cpu,
    badge: "14-Day Early Warning",
    description:
      "SCIO's predictive models analyze multi-sensor trends and maintenance manuals to catch subtle anomalies weeks before failure occurs, explaining the exact root cause and recommending fixes in plain language.",
    capabilities: [
      "Early Anomaly Detection: Detects microscopic cross-sensor drift long before static alarms trigger",
      "Failure Date Forecasting: Estimates remaining useful life (RUL) and time to failure with high confidence",
      "Plain-Language AI Diagnostics: Explains root causes citing equipment manuals and past logs",
      "Prescriptive Advice: Recommends exact operating adjustments to protect equipment safely"
    ],
    metrics: [
      { label: "Early Warning", val: "14 Days" },
      { label: "False Alarms Cut", val: "91%" },
      { label: "Response Speed", val: "120ms" },
      { label: "AI Accuracy", val: "98.8%" }
    ],
    payload: {
      inference_job_id: "AI-INF-2026-9810",
      target_subsystem: "Turbine-04 / Bearing #2 Inner Race",
      alert_classification: "CRITICAL_FATIGUE_EARLY_WARNING",
      confidence_score: 97.4,
      failure_mode: "Sub-surface Fatigue Spalling on Bearing 2",
      estimated_time_to_trip: "11.4 Days (at current 42MW continuous load)",
      ai_diagnostic_explanation:
        "Cross-correlation between 120Hz FFT harmonic vibration spike and 6.2°C lube oil thermal rise indicates lubrication breakdown under peak-load cycling.",
      prescriptive_recommendation:
        "Reduce turbine load to 35MW immediately and schedule bearing replacement during the 02:00 off-peak maintenance window."
    },
    logicSummary:
      "Multivariate models compute anomaly scores; upon threshold exceedance, AI cross-examines work logs and manuals to form a clear root-cause diagnosis.",
    architectureNodes: [
      "Time-Series Feature Store",
      "Physics-Informed ML Models",
      "LLM Reasoning Engine",
      "Prescriptive Dispatcher"
    ]
  },
  {
    step: "04",
    phase: "ACT",
    stepName: "Take Action",
    title: "Automation & Enterprise Integration",
    subtitle: "Turn insights into maintenance actions, work orders, alerts, inventory requests, and updates across enterprise systems.",
    accent: C.green,
    accentBg: "rgba(16, 185, 129, 0.12)",
    icon: Workflow,
    badge: "Closed-Loop Action",
    description:
      "Instead of just sending alerts, SCIO triggers real workflows: auto-drafting work orders in SAP or Maximo, checking and reserving warehouse spare parts, dispatching technician checklists, and verifying sensor health post-repair.",
    capabilities: [
      "Two-Way Enterprise Sync: Automatically creates and updates work orders in SAP, Oracle, and Maximo",
      "Spare Parts Staging: Checks warehouse inventory, reserves needed parts, or triggers supplier orders",
      "Technician Field Copilot: Provides mobile step-by-step repair checklists, torque specs, and safety steps",
      "Post-Repair Verification: Continuously monitors sensor streams to certify the issue is fully fixed"
    ],
    metrics: [
      { label: "Response Lag Cut", val: "85%" },
      { label: "Auto-Drafted Orders", val: "100%" },
      { label: "Parts Stockout Drop", val: "94%" },
      { label: "Audit Traceability", val: "100%" }
    ],
    payload: {
      work_order_id: "SAP-WO-2026-4402",
      erp_destination: "SAP S/4HANA Enterprise PM (Connected)",
      order_status: "DISPATCHED_TO_FIELD_CREW",
      assigned_team: "Station Alpha Mechanical Reliability Unit (3 Techs)",
      staged_mro_inventory: [
        { sku: "SKF-BEARING-7320-B", qty: 2, bin: "Bay-4 Rack-12", status: "RESERVED_STAGED" },
        { sku: "MOBIL-DTE-732-OIL-20L", qty: 4, bin: "Hazmat-Chem-B", status: "RESERVED_STAGED" }
      ],
      scheduled_window: "27 Aug 2026 02:00 - 05:30 UTC (Off-Peak)",
      projected_cost_avoidance: "$380,000 in unscheduled trip avoidance",
      verification_loop: "Auto-monitor 48-hr post-install vibration baseline"
    },
    logicSummary:
      "Action Engine invokes enterprise ERP webhooks, reserves warehouse stock, dispatches technicians, and listens to post-repair telemetry to close the loop.",
    architectureNodes: [
      "Action Orchestrator",
      "SAP/ERP Integration Connector",
      "Mobile Technician Copilot",
      "Audit & Verification Loop"
    ]
  }
];

// Maritime Mock Telemetry for Homepage Control Tower
export const MARITIME_DATA = {
  vesselClasses: [
    { label: "Ultra Container Ships", value: 12, color: "#8B5CF6", percent: 42.8 },
    { label: "Capesize Bulk Carriers", value: 8, color: "#3FC8D8", percent: 28.5 },
    { label: "Chemical Tankers", value: 5, color: "#E8A33D", percent: 17.8 },
    { label: "Offshore Escort Tugs", value: 3, color: "#2FBF71", percent: 10.9 },
  ],
  vesselScores: [
    { name: "Ever Apex (24,000 TEU)", score: 98.4, color: "#2FBF71", route: "Shanghai → Rotterdam", status: "At Sea" },
    { name: "CMA CGM Palais", score: 96.2, color: "#3FC8D8", route: "Singapore → Hamburg", status: "At Sea" },
    { name: "Maersk Mc-Kinney", score: 91.8, color: "#2FBF71", route: "Busan → Los Angeles", status: "Anchored" },
    { name: "MSC Isabella", score: 87.5, color: "#E8A33D", route: "Antwerp → Felixstowe", status: "Moored" },
    { name: "Cosco Galaxy", score: 58.2, color: "#F0526B", route: "Dubai → Mumbai", status: "Maintenance" },
  ],
  aiPrecision: [
    { label: "Hull Cleanliness Index", val: 99.2 },
    { label: "Propulsion Vibration FFT", val: 97.8 },
    { label: "Exhaust & Fuel Efficiency", val: 95.4 },
    { label: "AIS Route Drift Detection", val: 98.6 },
    { label: "Safety Gear Inspection CV", val: 96.9 },
    { label: "Bunker Fuel Viscosity Match", val: 99.4 },
  ],
  inspections: [
    { item: "Starboard Lifeboat Release Mechanism", severity: "Critical", vessel: "Cosco Galaxy", date: "24 Aug 2026", status: "CAPA Pending" },
    { item: "Engine Room CO2 Fixed Fire System", severity: "Passed", vessel: "Ever Apex", date: "22 Aug 2026", status: "Certified" },
    { item: "Oily Water Separator 15ppm Bilge Alarm", severity: "Passed", vessel: "CMA CGM Palais", date: "20 Aug 2026", status: "Certified" },
    { item: "Emergency Diesel Generator Auto-Start", severity: "Warning", vessel: "MSC Isabella", date: "19 Aug 2026", status: "Work Order Active" },
  ],
  bunkerStatus: [
    { vessel: "Ever Apex", vlsfo: "840 MT", mgo: "180 MT", status: "Optimal", nextPort: "Rotterdam" },
    { vessel: "CMA CGM Palais", vlsfo: "620 MT", mgo: "140 MT", status: "Optimal", nextPort: "Hamburg" },
    { vessel: "Maersk Mc-Kinney", vlsfo: "410 MT", mgo: "95 MT", status: "Replenish Scheduled", nextPort: "Los Angeles" },
    { vessel: "MSC Isabella", vlsfo: "165 MT", mgo: "45 MT", status: "Low Reserve (<200 MT)", nextPort: "Felixstowe" },
  ]
};
