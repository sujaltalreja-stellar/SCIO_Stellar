"use client";

import React, { createContext, useContext } from "react";

export interface SiteActions {
  openDemo: () => void;
  openBeta: () => void;
  openContact: () => void;
  openResources: () => void;
  launchPlatform: (industry?: string, tab?: string) => void;
  /** For <a href> links into the live platform: plain clicks launch in-app, modifier clicks open natively. */
  handleNavClick: (e: React.MouseEvent, industry: string, tab?: string) => void;
}

export const SiteContext = createContext<SiteActions | null>(null);

export function useSite(): SiteActions {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error("useSite must be used inside <SiteLayout>");
  return ctx;
}

export function launchHref(industry: string, tab?: string) {
  const t = tab ?? (industry === "energy" ? "energy-dashboard" : "dashboard");
  return `/?launch=1&industry=${industry}&tab=${t}`;
}
