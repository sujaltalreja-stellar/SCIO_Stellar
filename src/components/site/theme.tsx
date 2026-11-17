"use client";

import React, { useLayoutEffect, useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

/** Public-site light/dark theme. Light by default; dark only when the visitor chooses it (remembered per browser). */
export type SiteTheme = "light" | "dark";
const KEY = "scio_site_theme";
const EVENT = "scio-site-theme";

function preferred(): SiteTheme {
  try {
    if (localStorage.getItem(KEY) === "dark") return "dark";
  } catch {
    /* storage unavailable */
  }
  return "light";
}

function apply(theme: SiteTheme) {
  document.documentElement.setAttribute("data-site-theme", theme);
}

export function setSiteTheme(theme: SiteTheme) {
  try {
    localStorage.setItem(KEY, theme);
  } catch {
    /* storage unavailable: still switch for this visit */
  }
  apply(theme);
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
}
const snapshot = () => (document.documentElement.getAttribute("data-site-theme") === "dark" ? "dark" : "light") as SiteTheme;

export function useSiteTheme(): SiteTheme {
  return useSyncExternalStore(subscribe, snapshot, () => "light");
}

/** Mount once in SiteLayout: applies the theme to the public site and removes it when leaving (e.g. to /app). */
export function useSiteThemeRoot() {
  // Layout effect: re-applied before paint when moving between pages, so there's no flash.
  useLayoutEffect(() => {
    apply(preferred());
    window.dispatchEvent(new Event(EVENT));
    return () => {
      document.documentElement.removeAttribute("data-site-theme");
    };
  }, []);
}

export function ThemeToggle({ className = "" }: { className?: string }) {
  const theme = useSiteTheme();
  const dark = theme === "dark";
  return (
    <button
      type="button"
      onClick={() => setSiteTheme(dark ? "light" : "dark")}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Light mode" : "Dark mode"}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#E7E5E1] text-[#3a3936] hover:text-[#111113] hover:border-[#111113] transition-colors cursor-pointer ${className}`}
    >
      {dark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
    </button>
  );
}
