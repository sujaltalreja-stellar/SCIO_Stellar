"use client";

import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronRight, MoveRight } from "lucide-react";
import { motion } from "framer-motion";
import { SITE_SHELL } from "./SiteLayout";
import { useSite } from "./SiteContext";

const EASE = [0.22, 1, 0.36, 1] as const;

export const reveal = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.6, ease: EASE },
};

/** Arrow text link, ShyftLabs-style ("Explore →"). */
export function ArrowLink({ to, children, tone = "dark", className = "" }: { to: string; children: React.ReactNode; tone?: "dark" | "light" | "accent"; className?: string }) {
  const color = tone === "light" ? "text-white hover:text-[#f2a93b]" : tone === "accent" ? "text-[#B06D0F] hover:text-[#111113]" : "text-[#111113] hover:text-[#B06D0F]";
  return (
    <Link to={to} className={`group inline-flex items-center gap-1.5 text-[15px] font-semibold transition-colors ${color} ${className}`}>
      {children}
      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

export function Eyebrow({ children, tone = "dark" }: { children: React.ReactNode; tone?: "dark" | "light" }) {
  return (
    <p className={`text-[13px] font-semibold uppercase tracking-[0.14em] ${tone === "light" ? "text-[#f2a93b]" : "text-[#B06D0F]"}`}>
      {children}
    </p>
  );
}

/**
 * Section heading — the one heading style for every section on the marketing site.
 * Type scale (UI/UX Pro Max: Plus Jakarta Sans, consistent modular scale; Regular 400 for an airy, editorial feel):
 *   section  32 → 56px, line-height 1.08, tracking -0.03em  (main section titles)
 *   sub      26 → 36px, line-height 1.15, tracking -0.025em (minor sections, e.g. "Keep exploring")
 */
export const HEADING_SCALE = {
  section: { fontSize: "clamp(32px, 4.4vw, 56px)", lineHeight: 1.1, letterSpacing: "-0.025em" },
  sub: { fontSize: "clamp(26px, 3vw, 36px)", lineHeight: 1.15, letterSpacing: "-0.025em" },
} as const;

export function SectionHeading({
  children,
  id,
  tone = "dark",
  size = "section",
  as: Tag = "h2",
  className = "",
}: {
  children: React.ReactNode;
  id?: string;
  tone?: "dark" | "light";
  size?: keyof typeof HEADING_SCALE;
  as?: "h2" | "h3";
  className?: string;
}) {
  return (
    <Tag
      id={id}
      className={`scio-section-heading font-display font-normal text-balance ${tone === "light" ? "text-white" : "text-[#111113]"} ${className}`}
      style={HEADING_SCALE[size]}
    >
      {children}
    </Tag>
  );
}

/** Top-of-page hero used by every subpage. */
export function PageHero({
  crumbs,
  eyebrow,
  title,
  subtitle,
  image,
  imageAlt,
  media,
  actions,
}: {
  crumbs: { label: string; to?: string }[];
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  image?: string;
  imageAlt?: string;
  /** Custom right-hand visual (e.g. an animated product screenshot); overrides image. */
  media?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <section className="relative bg-white">
      <div className={`${SITE_SHELL} pt-10 pb-14 sm:pt-14 sm:pb-20`}>
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-[13px] text-[#6b6862]">
          <Link to="/" className="hover:text-[#111113]">Home</Link>
          {crumbs.map((c) => (
            <React.Fragment key={c.label}>
              <ChevronRight className="h-3.5 w-3.5 text-[#b5b1aa]" />
              {c.to ? (
                <Link to={c.to} className="hover:text-[#111113]">{c.label}</Link>
              ) : (
                <span className="text-[#111113] font-medium" aria-current="page">{c.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>

        <div className={`mt-8 grid gap-10 ${media ? "lg:grid-cols-[0.9fr_1.1fr] lg:items-center" : image ? "lg:grid-cols-[1.1fr_0.9fr] lg:items-end" : ""}`}>
          <div className="max-w-3xl">
            {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
            <h1
              className="mt-4 font-display font-bold text-[#111113] text-balance"
              style={{ fontSize: "clamp(38px, 5.6vw, 72px)", lineHeight: 1.02, letterSpacing: "-0.035em" }}
            >
              {title}
            </h1>
            {subtitle && <p className="mt-6 max-w-[58ch] text-[17px] sm:text-[19px] leading-relaxed text-[#4a4843]">{subtitle}</p>}
            {actions && <div className="mt-8 flex flex-wrap items-center gap-3">{actions}</div>}
          </div>
          {media}
          {!media && image && (
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-[#EFEEEB]">
              <img src={image} alt={imageAlt ?? ""} className="absolute inset-0 h-full w-full object-cover" loading="eager" fetchPriority="high" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export function PrimaryButton({ onClick, children, to, tone = "dark" }: { onClick?: () => void; to?: string; children: React.ReactNode; tone?: "dark" | "light" }) {
  const cls = `group inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-[15px] font-semibold transition-colors cursor-pointer ${
    tone === "light" ? "bg-white text-[#111113] hover:bg-[#F3F2EF]" : "bg-[#111113] text-white hover:bg-[#2a2a30]"
  }`;
  const inner = (
    <>
      {children}
      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
    </>
  );
  return to ? (
    <Link to={to} className={cls}>{inner}</Link>
  ) : (
    <button type="button" onClick={onClick} className={cls}>{inner}</button>
  );
}

export function SecondaryButton({ to, href, children, tone = "dark" }: { to?: string; href?: string; children: React.ReactNode; tone?: "dark" | "light" }) {
  const cls = `group inline-flex items-center gap-2 px-6 py-3.5 rounded-full border text-[15px] font-semibold transition-colors ${
    tone === "light" ? "border-white/30 text-white hover:border-white" : "border-[#D6D3CE] text-[#111113] hover:border-[#111113]"
  }`;
  const inner = (
    <>
      {children}
      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
    </>
  );
  return to ? <Link to={to} className={cls}>{inner}</Link> : <a href={href} className={cls}>{inner}</a>;
}

/** Closing "Let's connect" band: wide, short, title left and two glass pill buttons right. */
export function ConnectBand({
  title = "Let’s connect",
  subtitle,
}: { title?: string; subtitle?: string }) {
  const { openDemo } = useSite();
  const pill =
    "group inline-flex h-[52px] items-center gap-3 px-7 rounded-full border text-[16px] font-medium backdrop-blur-md transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2A93B] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F0F11]";
  return (
    <section className="theme-fixed relative overflow-hidden bg-[#0F0F11]">
      <img
        src="/images/team-collaborating-on-operations.webp"
        alt="Operations team working together on shared business data"
        width={1600}
        height={900}
        className="absolute inset-0 h-full w-full object-cover"
        loading="lazy"
      />
      {/* Light dark layer so the photo stays visible but text reads clearly */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/45 via-black/30 to-black/20" />
      {/* Texture layer: fine film grain over the photo (generated SVG noise, no image file) */}
      <div aria-hidden="true" className="scio-grain pointer-events-none absolute inset-0" />
      <div className="relative mx-auto max-w-[1840px] px-[clamp(20px,2.6vw,48px)] min-h-[clamp(340px,27.5vw,560px)] py-16 flex flex-col justify-center gap-10 lg:flex-row lg:items-center lg:justify-between">
        <motion.div {...reveal}>
          <h2 className="font-sans font-light text-white" style={{ fontSize: "clamp(52px, 5.6vw, 108px)", lineHeight: 1, letterSpacing: "-0.04em", textShadow: "0 2px 28px rgba(0,0,0,0.45), 0 1px 3px rgba(0,0,0,0.3)" }}>
            {title}
          </h2>
          {subtitle && <p className="mt-5 text-[17px] leading-relaxed text-white/70 max-w-xl">{subtitle}</p>}
        </motion.div>
        <motion.div {...reveal} className="flex flex-wrap gap-3 lg:shrink-0 lg:flex-nowrap">
          <button type="button" onClick={openDemo} className={`${pill} border-white/70 bg-white/90 text-[#111113] hover:bg-white`}>
            Talk to our team <MoveRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </button>
          <Link to="/platform" className={`${pill} border-white/30 bg-black/35 text-white hover:bg-black/50`}>
            Explore the platform <MoveRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

/** "Keep exploring" cards at the bottom of subpages. */
export function NextPages({ items }: { items: { label: string; desc: string; to: string }[] }) {
  return (
    <section className="bg-[#F6F5F3] border-t border-[#E7E5E1]">
      <div className={`${SITE_SHELL} py-16 sm:py-20`}>
        <SectionHeading size="sub">Keep exploring</SectionHeading>
        <div className={`mt-8 grid gap-4 sm:grid-cols-2 ${items.length > 2 ? "lg:grid-cols-3" : ""}`}>
          {items.map((it) => (
            <Link
              key={it.to}
              to={it.to}
              className="group flex flex-col justify-between gap-8 rounded-2xl border border-[#E7E5E1] bg-white p-7 hover:border-[#111113] transition-colors"
            >
              <div>
                <h3 className="text-[20px] font-semibold text-[#111113]">{it.label}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-[#5D5A54]">{it.desc}</p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-[15px] font-semibold text-[#B06D0F]">
                Explore <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
