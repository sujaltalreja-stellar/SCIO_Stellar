"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { getLenis, scrollToTarget, startSmoothScroll } from "../../lib/smoothScroll";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, ArrowUpRight, ChevronDown, Menu, X, Mail, Phone, ShieldCheck } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { SiteContext, SiteActions, launchHref } from "./SiteContext";
import { NAV_GROUPS, FOOTER_COLUMNS } from "./nav";
import { LeadModal } from "./ContactForms";
import { ThemeToggle, useSiteThemeRoot } from "./theme";
import { lazyWithReload } from "../../lazyWithReload";
import { StellarScioLogo } from "./StellarScioLogo";

// The AI assistant is large (~240 KB); load it after the page is visible, not before.
const ScioSentinelOrb = lazyWithReload(() => import("../ai/ScioSentinelOrb"));

function useAfterFirstPaint(delayMs = 1200) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    const t = window.setTimeout(() => {
      if (w.requestIdleCallback) w.requestIdleCallback(() => setReady(true), { timeout: 2000 });
      else setReady(true);
    }, delayMs);
    return () => window.clearTimeout(t);
  }, [delayMs]);
  return ready;
}

export const SITE_SHELL = "mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-10";

/** The StellarSCIO wordmark. One component everywhere (header, footer) so it renders the same in
 *  light and dark mode; colour comes from `tone`, never from the theme remap. */
function Logo({ tone = "ink" }: { tone?: "ink" | "light" }) {
  return (
    <span
      className={`theme-fixed inline-flex items-center select-none leading-none ${
        tone === "light" ? "text-white" : "scio-logo-ink"
      }`}
    >
      <StellarScioLogo className="block h-[clamp(24px,0.8vw+16px,30px)] w-auto" />
    </span>
  );
}

function DesktopDropdown({ groupIndex, open, active, onOpen, onClose }: { groupIndex: number; open: boolean; active: boolean; onOpen: () => void; onClose: () => void }) {
  const group = NAV_GROUPS[groupIndex];
  // 4+ items: lay them out as a 2-column grid (2x2 for Platform); short menus stay a single list.
  const twoCol = group.items.length >= 4;
  return (
    <div
      onMouseEnter={onOpen}
      onMouseLeave={onClose}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) onClose();
      }}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => (open ? onClose() : onOpen())}
        className={`relative flex h-10 items-center gap-1.5 px-[18px] rounded-full text-[15px] font-medium transition-[color,background-color,box-shadow] duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2A93B] ${
          open || active
            ? "text-[#111113] bg-white shadow-[0_1px_2px_rgba(17,17,19,0.08),0_4px_12px_-4px_rgba(17,17,19,0.12)]"
            : "text-[#4a4843] hover:text-[#111113]"
        }`}
      >
        {group.label}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.16 }}
            className="absolute left-1/2 top-full -translate-x-1/2 pt-3 z-50"
          >
            <div
              className={`rounded-2xl border border-[#E7E5E1] bg-white p-2 shadow-[0_24px_60px_-20px_rgba(17,17,19,0.25)] ${
                twoCol ? "w-[600px]" : "w-[360px]"
              }`}
            >
              <div className={twoCol ? "grid grid-cols-2 gap-1" : ""}>
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={onClose}
                  className="group flex items-start justify-between gap-3 rounded-xl px-4 py-3 hover:bg-[#F6F5F3] focus-visible:bg-[#F6F5F3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2A93B] transition-colors"
                >
                  <span>
                    <span className="block text-[14px] font-semibold text-[#111113]">{item.label}</span>
                    {item.desc && <span className="block text-[13px] text-[#6b6862] mt-0.5">{item.desc}</span>}
                  </span>
                  <ArrowRight className="h-4 w-4 mt-0.5 text-[#b5b1aa] group-hover:text-[#D98B16] group-hover:translate-x-0.5 transition-all shrink-0" />
                </Link>
              ))}
              </div>
              {group.footer && (
                <Link
                  to={group.footer.href}
                  onClick={onClose}
                  className="mt-1 flex items-center gap-1.5 rounded-xl border-t border-[#EFEEEB] px-4 py-3 text-[13px] font-semibold text-[#D98B16] hover:text-[#B06D0F]"
                >
                  {group.footer.label} <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SiteHeader({ onTalk }: { onTalk: () => void }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileGroup, setMobileGroup] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const closeTimer = useRef<number | null>(null);
  const { pathname } = useLocation();

  // Same behaviour as the Real Estate OS navbar: hide on scroll down, reveal on any
  // scroll up, always shown near the top. One rAF per frame keeps it smooth.
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  useEffect(() => {
    lastY.current = window.scrollY;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        setScrolled(y >= 24);
        setHidden(!(y < 80 || y <= lastY.current));
        lastY.current = y;
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menus on navigation; Escape closes everything.
  useEffect(() => {
    setOpenIdx(null);
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenIdx(null);
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Stop the page scrolling behind the open mobile menu.
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    getLenis()?.stop();
    return () => {
      document.body.style.overflow = prev;
      getLenis()?.start();
    };
  }, [mobileOpen]);

  const isActive = (i: number) =>
    NAV_GROUPS[i].items.some((it) => {
      const base = it.href.split("#")[0];
      return base !== "/" && (pathname === base || pathname.startsWith(base + "/"));
    });

  const open = (i: number) => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    setOpenIdx(i);
  };
  const close = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpenIdx(null), 120);
  };

  const hideBar = hidden && openIdx === null && !mobileOpen;
  // On the home page the hero photo runs up behind the header: until the bar turns solid,
  // use light colours so the logo and buttons read on the dark photo.
  const overHero = pathname === "/" && !scrolled && !mobileOpen;

  return (
    <>
    {/* Spacer: the header is fixed, so reserve its height in the page flow. */}
    <div aria-hidden="true" className="h-[var(--nav-offset)]" />
    <header
      className={`scio-nav fixed inset-x-0 top-0 z-50 focus-within:!translate-y-0 focus-within:!opacity-100 focus-within:!pointer-events-auto ${hideBar ? "is-hidden" : ""}`}
      style={{ padding: "var(--nav-top) clamp(8px,1.5vw + 3px,32px) 0" }}
    >
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-[#111113] focus:px-4 focus:py-2 focus:text-white">
        Skip to content
      </a>
      <div
        className={`relative mx-auto max-w-[1240px] h-[var(--nav-h)] px-[5px] lg:px-[7px] flex items-center justify-between gap-4 lg:grid lg:grid-cols-[1fr_auto_1fr] rounded-full border transition-[background-color,border-color,box-shadow,backdrop-filter] duration-300 ease-out ${
          scrolled || mobileOpen
            ? "border-[#E7E5E1] bg-white/95 backdrop-blur-[14px] shadow-[0_8px_32px_0_rgba(17,17,19,0.14)]"
            : "border-transparent"
        }`}
      >
        <Link to="/" aria-label="Stellar SCIO home" className="ml-3.5 lg:ml-4 justify-self-start rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2A93B] focus-visible:ring-offset-2">
          <Logo tone={overHero ? "light" : "ink"} />
        </Link>

        {/* Centered segmented pill nav */}
        <nav
          className="relative hidden lg:flex h-12 items-center gap-0.5 rounded-full border border-[#E7E5E1] bg-[#F6F5F3] p-1"
          aria-label="Main"
        >
          {NAV_GROUPS.map((g, i) => (
            <DesktopDropdown key={g.label} groupIndex={i} open={openIdx === i} active={isActive(i)} onOpen={() => open(i)} onClose={close} />
          ))}
        </nav>

        <div className="flex items-center justify-self-end gap-2">
          {/* Theme + app chip */}
          <div className="hidden md:inline-flex h-11 lg:h-12 items-center gap-1 rounded-full border border-[#E7E5E1] bg-white p-1 pr-1.5">
            <ThemeToggle className="!h-9 !w-9 lg:!h-10 lg:!w-10 !border-0 bg-[#F6F5F3] hover:bg-[#EFEEEB]" />
            <a
              href="/app"
              className="inline-flex h-9 lg:h-10 items-center px-3.5 rounded-full whitespace-nowrap text-[15px] font-semibold text-[#111113] hover:text-[#B06D0F] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2A93B]"
            >
              Try live demo
            </a>
          </div>
          <div className="md:hidden">
            <ThemeToggle className={`!h-11 !w-11 ${overHero ? "theme-fixed !border-white/35 !text-white hover:!border-white" : ""}`} />
          </div>
          <button
            type="button"
            onClick={onTalk}
            className={`group hidden sm:inline-flex h-11 lg:h-12 items-center gap-2 px-5 lg:px-6 rounded-full whitespace-nowrap text-[15px] font-semibold active:scale-[0.98] transition duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2A93B] focus-visible:ring-offset-2 ${
              overHero ? "theme-fixed bg-white text-[#111113] hover:bg-[#F2EFEA]" : "bg-[#111113] text-white hover:bg-[#2a2a30]"
            }`}
          >
            Book a demo <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            className={`lg:hidden inline-flex h-11 items-center gap-2 px-4 rounded-full border text-[15px] font-medium cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2A93B] ${
              overHero ? "theme-fixed border-white/35 text-white" : "border-[#E7E5E1] text-[#111113]"
            }`}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="h-4 w-4" aria-hidden="true" /> : <Menu className="h-4 w-4" aria-hidden="true" />}
            Menu
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            id="mobile-nav"
            aria-label="Mobile"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden mx-auto mt-2 max-w-[1280px] overflow-hidden rounded-3xl border border-[#E7E5E1] bg-white shadow-[0_16px_40px_-16px_rgba(17,17,19,0.25)]"
          >
            <div className={`${SITE_SHELL} py-4 max-h-[calc(100dvh-110px)] overflow-y-auto`}>
              {NAV_GROUPS.map((g, i) => (
                <div key={g.label} className="border-b border-[#EFEEEB]">
                  <button
                    type="button"
                    onClick={() => setMobileGroup(mobileGroup === i ? null : i)}
                    className="w-full min-h-[52px] flex items-center justify-between py-3 text-[16px] font-semibold text-[#111113] cursor-pointer rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2A93B]"
                  >
                    {g.label}
                    <ChevronDown className={`h-4 w-4 transition-transform ${mobileGroup === i ? "rotate-180" : ""}`} />
                  </button>
                  {mobileGroup === i && (
                    <div className="pb-3 space-y-1">
                      {[...g.items, ...(g.footer ? [g.footer] : [])].map((item) => (
                        <Link key={item.href} to={item.href} onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-2.5 hover:bg-[#F6F5F3]">
                          <span className="block text-[15px] font-medium text-[#111113]">{item.label}</span>
                          {item.desc && <span className="block text-[13px] text-[#6b6862]">{item.desc}</span>}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <div className="flex flex-col gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    onTalk();
                  }}
                  className="inline-flex justify-center items-center gap-1.5 min-h-[48px] px-5 rounded-full bg-[#111113] text-white text-[15px] font-semibold cursor-pointer"
                >
                  Book a demo <ArrowRight className="h-4 w-4" />
                </button>
                <a href="/app" className="inline-flex justify-center items-center min-h-[48px] px-5 rounded-full border border-[#E7E5E1] text-[15px] font-medium text-[#111113]">
                  Try live demo
                </a>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
    </>
  );
}

/** Stellarmind.ai social accounts (same handles as the Contact page). */
const SOCIAL_LINKS = [
  { label: "LinkedIn", href: "https://www.linkedin.com/company/stellarmindai", d: "M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.64 1.64 0 1 0 0-3.28 1.64 1.64 0 0 0 0 3.28m1.39 9.74v-8.37H5.07v8.37h2.78z" },
  { label: "X", href: "https://twitter.com/StellarMind_ai", d: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" },
  { label: "Facebook", href: "https://www.facebook.com/StellarMind/", d: "M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" },
  { label: "Instagram", href: "https://www.instagram.com/stellarmind_ai", d: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" },
  { label: "Pinterest", href: "https://in.pinterest.com/StellarMind_ai/", d: "M12 0a12 12 0 0 0-4.37 23.18c-.07-.98-.13-2.48.03-3.55l1.04-4.42s-.27-.53-.27-1.32c0-1.24.72-2.16 1.62-2.16.76 0 1.13.57 1.13 1.26 0 .77-.49 1.92-.74 2.98-.21.9.45 1.63 1.34 1.63 1.6 0 2.84-1.69 2.84-4.13 0-2.16-1.55-3.67-3.77-3.67-2.57 0-4.08 1.93-4.08 3.92 0 .78.3 1.61.67 2.06.07.09.08.17.06.27l-.25 1.02c-.04.17-.14.23-.32.15-1.18-.55-1.92-2.28-1.92-3.67 0-2.99 2.17-5.74 6.27-5.74 3.29 0 5.85 2.35 5.85 5.48 0 3.27-2.06 5.9-4.92 5.9-.96 0-1.86-.5-2.17-1.09l-.59 2.25c-.21.83-.78 1.86-1.16 2.49A12 12 0 1 0 12 0z" },
];

/** Trusted partners and certifications, as shown on stellarmind.ai. */
const TRUSTED_PARTNERS = [
  { name: "Guru", src: "/logos/partners/guru-trim.png", cls: "h-[22px]" },
  { name: "Clutch", src: "/logos/partners/clutch-trim.png", cls: "h-[26px]" },
  { name: "ISO 9001 certified", src: "/logos/partners/iso-trim.png", cls: "h-11" },
  { name: "OpenAI Select Partner", src: "/logos/partners/openai.png", cls: "h-11" },
  { name: "Databricks", src: "/logos/partners/databricks.svg", cls: "h-9" },
  { name: "AWS Partner", src: "/logos/partners/aws-logo-white.png", cls: "h-9" },
  { name: "NVIDIA Inception", src: "/logos/partners/nvidia-logo-white.svg", cls: "h-5" },
  { name: "Sarvam AI Startup Program", src: "/logos/partners/sarvam-wordmark-white.svg", cls: "h-[18px]" },
];

function SiteFooter({ onTalk, onBeta }: { onTalk: () => void; onBeta: () => void }) {
  const link = "inline-flex min-h-[32px] items-center text-left text-[15px] text-[#B9B5AE] hover:text-white transition-colors duration-200 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2A93B]";
  return (
    <footer className="theme-fixed relative overflow-hidden bg-[#0B0B0D] text-[#B9B5AE] border-t border-white/[0.08]">
      <div className="relative mx-auto max-w-[1280px] px-[clamp(20px,2.6vw,40px)] pt-16 sm:pt-20">
        <div className="grid gap-14 lg:grid-cols-[1.1fr_2fr]">
          {/* Brand + primary actions */}
          <div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
              <a href="https://stellarmind.ai" target="_blank" rel="noopener noreferrer" aria-label="Stellarmind.ai" className="inline-flex rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2A93B]">
                <img src="/logos/stellarmind.png" alt="Stellarmind.ai" width={274} height={86} loading="lazy" className="h-10 w-auto" />
              </a>
              <span className="h-7 w-px bg-white/20" aria-hidden="true" />
              <Link to="/" aria-label="Stellar SCIO home" className="inline-block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2A93B] focus-visible:ring-offset-4 focus-visible:ring-offset-[#0B0B0D]">
                <Logo tone="light" />
              </Link>
            </div>
            <p className="mt-5 max-w-sm text-[15px] leading-relaxed">
              The business operating system that connects your ERP, POS, warehouse, HR and finance tools, answers questions in plain language, and turns them into approved actions.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onTalk}
                className="group inline-flex h-[42px] items-center gap-3 px-[22px] rounded-full bg-white text-[#111113] text-[15px] font-medium whitespace-nowrap hover:bg-[#EFEEEB] active:scale-[0.98] transition duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2A93B] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0B0D]"
              >
                Book a demo <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
              </button>
              <a
                href="/app"
                className="inline-flex h-[42px] items-center px-[22px] rounded-full border border-white/15 bg-white/[0.04] text-white text-[15px] font-medium whitespace-nowrap hover:bg-white/10 hover:border-white/30 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2A93B]"
              >
                Try live demo
              </a>
            </div>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-[1fr_1.15fr_0.9fr_1.35fr]">
            {FOOTER_COLUMNS.map((col) => (
              <nav key={col.label} aria-label={col.label}>
                <h3 className="text-[13px] font-semibold uppercase tracking-[0.12em] text-white/50 mb-4">{col.label}</h3>
                <ul className="space-y-1.5">
                  {col.items.map((item) => (
                    <li key={item.href}>
                      <Link to={item.href} className={link}>{item.label}</Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
            <div className="col-span-2 sm:col-span-1">
              <h3 className="text-[13px] font-semibold uppercase tracking-[0.12em] text-white/50 mb-4">Get in touch</h3>
              <ul className="space-y-1.5">
                <li>
                  <button type="button" onClick={onTalk} className={`${link} gap-1.5 whitespace-nowrap !text-white font-semibold hover:!text-[#f2a93b] cursor-pointer`}>
                    Start a conversation <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </li>
                <li>
                  <button type="button" onClick={onBeta} className={`${link} cursor-pointer`}>Join the private beta</button>
                </li>
                <li>
                  <a href="mailto:sales@stellarmind.ai" className={`${link} gap-2 whitespace-nowrap`}>
                    <Mail className="h-4 w-4 shrink-0" aria-hidden="true" /> sales@stellarmind.ai
                  </a>
                </li>
                <li>
                  <a href="tel:+919723099765" className={`${link} gap-2 whitespace-nowrap`}>
                    <Phone className="h-4 w-4 shrink-0" aria-hidden="true" /> +91 97230 99765
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-8 border-t border-white/10 pt-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-white/50">Follow Stellarmind.ai</p>
            <ul className="mt-3 flex flex-wrap items-center gap-2.5">
              {SOCIAL_LINKS.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Stellarmind.ai on ${s.label}`}
                    className="grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-white/[0.04] text-[#B9B5AE] transition-colors duration-200 hover:border-[#F2A93B]/60 hover:bg-[#F2A93B]/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2A93B]"
                  >
                    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] fill-current" aria-hidden="true"><path d={s.d} /></svg>
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <ul className="flex flex-wrap items-center gap-x-7 gap-y-5 lg:max-w-[560px] lg:justify-end xl:max-w-none" aria-label="Trusted partners">
            {TRUSTED_PARTNERS.map((t) => (
              <li key={t.name} className="flex items-center">
                <img src={t.src} alt={t.name} title={t.name} loading="lazy" className={`${t.cls} w-auto object-contain opacity-90`} />
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col gap-4 text-[13px] sm:flex-row sm:items-center sm:justify-between">
          <p>A product of Stellarmind.ai · © 2026 Stellarmind.ai. All rights reserved.</p>
          <p className="inline-flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 shrink-0 text-[#f2a93b]" aria-hidden="true" />
            Deployed on your infrastructure · TLS 1.3 · Full audit trail
          </p>
        </div>

        {/* Oversized wordmark, cropped by the footer edge */}
        <div
          aria-hidden="true"
          className="pointer-events-none select-none mt-10 -mb-[5%] leading-none text-white/[0.05]"
        >
          <StellarScioLogo className="block w-full h-auto" />
        </div>
      </div>
    </footer>
  );
}

/** Scrolls to the URL hash after navigation (or to top on a new page). */
function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => startSmoothScroll(), []);
  useEffect(() => {
    if (hash) {
      const id = hash.slice(1);
      let tries = 0;
      const t = window.setInterval(() => {
        const el = document.getElementById(id);
        if (el || ++tries > 20) {
          window.clearInterval(t);
          if (el) scrollToTarget(el);
        }
      }, 50);
      return () => window.clearInterval(t);
    }
    if (getLenis()) getLenis()?.scrollTo(0, { immediate: true });
    else window.scrollTo({ top: 0 });
  }, [pathname, hash]);
  return null;
}

export default function SiteLayout({
  children,
  onLaunchPlatform,
  orbIndustry = "home",
}: {
  children: React.ReactNode;
  /** When rendered inside the root App, launch the platform in-place instead of navigating. */
  onLaunchPlatform?: (industry?: string, tab?: string) => void;
  orbIndustry?: string;
}) {
  const navigate = useNavigate();
  const [demoOpen, setDemoOpen] = useState(false);
  const [betaOpen, setBetaOpen] = useState(false);
  const showOrb = useAfterFirstPaint();
  useSiteThemeRoot();
  const closeDemo = React.useCallback(() => setDemoOpen(false), []);
  const closeBeta = React.useCallback(() => setBetaOpen(false), []);

  const actions = useMemo<SiteActions>(() => {
    const launchPlatform = (industry = "energy", tab?: string) => {
      if (onLaunchPlatform) onLaunchPlatform(industry, tab);
      else navigate(launchHref(industry, tab));
    };
    return {
      openDemo: () => setDemoOpen(true),
      openBeta: () => setBetaOpen(true),
      openContact: () => navigate("/contact"),
      openResources: () => navigate("/resources"),
      launchPlatform,
      handleNavClick: (e, industry, tab) => {
        if (!e.ctrlKey && !e.metaKey && !e.shiftKey && e.button === 0) {
          e.preventDefault();
          launchPlatform(industry, tab);
        }
      },
    };
  }, [navigate, onLaunchPlatform]);

  return (
    <SiteContext.Provider value={actions}>
      <ScrollManager />
      <div className="scio-brand min-h-screen bg-white text-[#111113] font-sans overflow-x-clip selection:bg-[#111113] selection:text-white">
        <SiteHeader onTalk={actions.openDemo} />
        <main id="main">{children}</main>
        <SiteFooter onTalk={actions.openDemo} onBeta={actions.openBeta} />
      </div>

      <LeadModal variant="demo" open={demoOpen} onClose={closeDemo} />
      <LeadModal variant="beta" open={betaOpen} onClose={closeBeta} />
      {showOrb && (
        <React.Suspense fallback={null}>
          <ScioSentinelOrb
            onOpenBetaModal={actions.openBeta}
            onOpenDemoModal={actions.openDemo}
            onLaunchPlatform={(ind, tab) => actions.launchPlatform(ind, tab)}
            currentIndustry={orbIndustry}
          />
        </React.Suspense>
      )}
    </SiteContext.Provider>
  );
}
