"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, ChevronDown, Menu, X, Mail, Phone, ShieldCheck } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { SiteContext, SiteActions, launchHref } from "./SiteContext";
import { NAV_GROUPS, FOOTER_COLUMNS } from "./nav";
import { BetaFormModal, DemoFormModal } from "../landing/shared";
import ScioSentinelOrb from "../ai/ScioSentinelOrb";

export const SITE_SHELL = "mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-10";

function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <span className="flex items-center gap-2.5 select-none">
      <span
        className={`relative h-9 w-9 rounded-[10px] flex items-center justify-center font-black text-[15px] ${
          dark ? "bg-white text-[#111113]" : "bg-[#111113] text-white"
        }`}
      >
        S
        <span className="absolute right-[5px] top-[5px] h-2 w-2 rounded-full bg-[#f2a93b]" />
      </span>
      <span className={`font-extrabold text-[16px] tracking-tight ${dark ? "text-white" : "text-[#111113]"}`}>
        Stellar <span className="text-[#f2a93b]">SCIO</span>
      </span>
    </span>
  );
}

function DesktopDropdown({ groupIndex, open, onOpen, onClose }: { groupIndex: number; open: boolean; onOpen: () => void; onClose: () => void }) {
  const group = NAV_GROUPS[groupIndex];
  return (
    <div className="relative" onMouseEnter={onOpen} onMouseLeave={onClose}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => (open ? onClose() : onOpen())}
        className={`flex items-center gap-1 px-3 py-2 rounded-full text-[14px] font-medium transition-colors cursor-pointer ${
          open ? "text-[#111113] bg-[#F3F2EF]" : "text-[#3a3936] hover:text-[#111113]"
        }`}
      >
        {group.label}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.16 }}
            className="absolute left-0 top-full pt-3 z-50"
          >
            <div className="w-[360px] rounded-2xl border border-[#E7E5E1] bg-white p-2 shadow-[0_24px_60px_-20px_rgba(17,17,19,0.25)]">
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={onClose}
                  className="group flex items-start justify-between gap-3 rounded-xl px-4 py-3 hover:bg-[#F6F5F3] transition-colors"
                >
                  <span>
                    <span className="block text-[14px] font-semibold text-[#111113]">{item.label}</span>
                    {item.desc && <span className="block text-[13px] text-[#6b6862] mt-0.5">{item.desc}</span>}
                  </span>
                  <ArrowRight className="h-4 w-4 mt-0.5 text-[#b5b1aa] group-hover:text-[#D98B16] group-hover:translate-x-0.5 transition-all shrink-0" />
                </Link>
              ))}
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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const open = (i: number) => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    setOpenIdx(i);
  };
  const close = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpenIdx(null), 120);
  };

  return (
    <header
      className={`sticky top-0 z-50 bg-white/95 backdrop-blur-xl transition-shadow ${
        scrolled ? "shadow-[0_1px_0_#E7E5E1]" : ""
      }`}
    >
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-[#111113] focus:px-4 focus:py-2 focus:text-white">
        Skip to content
      </a>
      <div className={`${SITE_SHELL} h-[72px] flex items-center justify-between gap-4`}>
        <div className="flex items-center gap-8">
          <Link to="/" aria-label="Stellar SCIO home">
            <Logo />
          </Link>
          <nav className="hidden lg:flex items-center gap-0.5" aria-label="Main">
            {NAV_GROUPS.map((g, i) => (
              <DesktopDropdown key={g.label} groupIndex={i} open={openIdx === i} onOpen={() => open(i)} onClose={close} />
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/app"
            className="hidden md:inline-flex px-4 py-2.5 rounded-full text-[14px] font-medium text-[#3a3936] hover:text-[#111113]"
          >
            Open SCIO
          </a>
          <button
            type="button"
            onClick={onTalk}
            className="hidden sm:inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#111113] text-white text-[14px] font-semibold hover:bg-[#2a2a30] transition-colors cursor-pointer"
          >
            Talk to our team <ArrowRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="lg:hidden inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-[#E7E5E1] text-[14px] font-medium text-[#111113] cursor-pointer"
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
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
            className="lg:hidden overflow-hidden border-t border-[#E7E5E1] bg-white"
          >
            <div className={`${SITE_SHELL} py-4 max-h-[calc(100vh-72px)] overflow-y-auto`}>
              {NAV_GROUPS.map((g, i) => (
                <div key={g.label} className="border-b border-[#EFEEEB]">
                  <button
                    type="button"
                    onClick={() => setMobileGroup(mobileGroup === i ? null : i)}
                    className="w-full flex items-center justify-between py-4 text-[16px] font-semibold text-[#111113] cursor-pointer"
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
                  className="inline-flex justify-center items-center gap-1.5 px-5 py-3 rounded-full bg-[#111113] text-white text-[15px] font-semibold cursor-pointer"
                >
                  Talk to our team <ArrowRight className="h-4 w-4" />
                </button>
                <a href="/app" className="inline-flex justify-center px-5 py-3 rounded-full border border-[#E7E5E1] text-[15px] font-medium text-[#111113]">
                  Open SCIO
                </a>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

function SiteFooter({ onTalk, onBeta }: { onTalk: () => void; onBeta: () => void }) {
  return (
    <footer className="bg-[#0F0F11] text-[#B9B5AE]">
      <div className={`${SITE_SHELL} pt-16 pb-10`}>
        <div className="grid gap-12 lg:grid-cols-[1.3fr_repeat(3,1fr)_1.2fr]">
          <div className="space-y-5">
            <Logo dark />
            <p className="text-[14px] leading-relaxed max-w-xs">
              Operational intelligence for energy, maritime, manufacturing and logistics. Built on the data your operation already has.
            </p>
            <div className="flex items-center gap-2">
              <a
                href="mailto:info@stellarmind.ai"
                aria-label="Email"
                className="h-9 w-9 rounded-full border border-white/10 flex items-center justify-center hover:border-white/30 hover:text-white transition-colors"
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          {FOOTER_COLUMNS.map((col) => (
            <div key={col.label}>
              <h3 className="text-[13px] font-semibold text-white mb-4">{col.label}</h3>
              <ul className="space-y-2.5 text-[14px]">
                {col.items.map((item) => (
                  <li key={item.href}>
                    <Link to={item.href} className="hover:text-white transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="text-[13px] font-semibold text-white mb-4">Get in touch</h3>
            <ul className="space-y-2.5 text-[14px]">
              <li>
                <button type="button" onClick={onTalk} className="inline-flex items-center gap-1.5 text-white font-semibold hover:text-[#f2a93b] cursor-pointer">
                  Start a conversation <ArrowRight className="h-4 w-4" />
                </button>
              </li>
              <li>
                <button type="button" onClick={onBeta} className="hover:text-white cursor-pointer">
                  Join the private beta
                </button>
              </li>
              <li>
                <a href="mailto:sales@stellarmind.ai" className="inline-flex items-center gap-2 hover:text-white">
                  <Mail className="h-3.5 w-3.5" /> sales@stellarmind.ai
                </a>
              </li>
              <li>
                <a href="tel:+919723099765" className="inline-flex items-center gap-2 hover:text-white">
                  <Phone className="h-3.5 w-3.5" /> +91 97230 99765
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 pt-6 border-t border-white/10 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between text-[13px]">
          <p>© 2026 Stellarmind.ai. All rights reserved.</p>
          <p className="inline-flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#f2a93b]" />
            Deployed on your infrastructure · TLS 1.3 · Full audit trail
          </p>
        </div>
      </div>
    </footer>
  );
}

/** Scrolls to the URL hash after navigation (or to top on a new page). */
function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const id = hash.slice(1);
      let tries = 0;
      const t = window.setInterval(() => {
        const el = document.getElementById(id);
        if (el || ++tries > 20) {
          window.clearInterval(t);
          el?.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 50);
      return () => window.clearInterval(t);
    }
    window.scrollTo({ top: 0 });
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
      <div className="scio-brand min-h-screen bg-white text-[#111113] font-sans overflow-x-hidden selection:bg-[#111113] selection:text-white">
        <SiteHeader onTalk={actions.openDemo} />
        <main id="main">{children}</main>
        <SiteFooter onTalk={actions.openDemo} onBeta={actions.openBeta} />
      </div>

      <DemoFormModal isOpen={demoOpen} onClose={() => setDemoOpen(false)} onLaunchPlatform={actions.handleNavClick} />
      <BetaFormModal isOpen={betaOpen} onClose={() => setBetaOpen(false)} onLaunchPlatform={actions.handleNavClick} />
      <ScioSentinelOrb
        onOpenBetaModal={actions.openBeta}
        onOpenDemoModal={actions.openDemo}
        onLaunchPlatform={(ind, tab) => actions.launchPlatform(ind, tab)}
        currentIndustry={orbIndustry}
      />
    </SiteContext.Provider>
  );
}
