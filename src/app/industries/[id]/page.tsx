"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  Sun,
  Moon
} from "lucide-react";
import { getIndustryPage, INDUSTRY_PAGES } from "../../../config/industryPages";

export default function IndustryDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [industry, setIndustry] = React.useState<ReturnType<typeof getIndustryPage>>(undefined);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [isDark, setIsDark] = React.useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("scio_theme") === "dark";
    }
    return false;
  });

  React.useEffect(() => {
    params.then((p) => {
      setIndustry(getIndustryPage(p.id));
      setIsLoaded(true);
    });
  }, [params]);

  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
    if (isDark) {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      localStorage.setItem("scio_theme", next ? "dark" : "light");
      return next;
    });
  };

  if (!industry && isLoaded) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#06080d] dark:text-slate-100 flex flex-col items-center justify-center p-6 text-center font-mono">
        <h1 className="text-xl font-bold text-rose-500 dark:text-rose-400 mb-2">INDUSTRY NOT FOUND</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Select from our 4 core enterprise industry sectors:</p>
        <div className="flex flex-wrap justify-center gap-3">
          {INDUSTRY_PAGES.map((ind) => (
            <Link
              key={ind.id}
              href={`/industries/${ind.id}`}
              className="px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-white transition-all shadow-xs"
            >
              {ind.name}
            </Link>
          ))}
        </div>
        <Link href="/" className="mt-8 text-xs text-cyan-600 dark:text-cyan-400 hover:underline">← Back to Overview</Link>
      </div>
    );
  }

  if (!industry) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#06080d] dark:text-slate-100 flex items-center justify-center font-mono text-xs text-slate-500">
        LOADING INDUSTRY DATA...
      </div>
    );
  }

  const Icon = industry.icon;

  const handleLaunch = () => {
    router.push(`/?industry=${industry.id}&tab=${industry.launchTab}&launch=1`);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#06080d] dark:text-slate-100 font-sans selection:bg-slate-900 selection:text-white dark:selection:bg-cyan-500/20 dark:selection:text-cyan-300 transition-colors">

      {/* ==================== NAV ==================== */}
      <nav className="sticky top-0 z-50 h-16 border-b border-slate-200/90 bg-white/95 dark:border-slate-800/90 dark:bg-[#06080d]/95 backdrop-blur-2xl px-6 lg:px-12 flex items-center justify-between transition-colors shadow-xs">
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-slate-900 to-slate-700 dark:from-slate-200 dark:via-slate-400 dark:to-slate-700 p-[1px] shadow-sm">
            <div className="h-full w-full bg-slate-950 rounded-[7px] flex items-center justify-center font-mono font-black text-white text-sm">
              S
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xs tracking-widest text-slate-900 dark:text-slate-100 uppercase font-mono group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
              STELLAR SCIO
            </span>
            <span className="text-[9px] text-slate-500 font-mono tracking-wider font-semibold">
              ENTERPRISE MISSION CONTROL
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          {/* Industry tabs */}
          <div className="hidden md:flex items-center gap-1.5 border border-slate-200 bg-slate-100/90 dark:border-slate-800 dark:bg-[#090c14] rounded-lg p-1">
            {INDUSTRY_PAGES.map((ind) => {
              const isCurrent = ind.id === industry.id;
              const TabIcon = ind.icon;
              return (
                <Link
                  key={ind.id}
                  href={`/industries/${ind.id}`}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-mono transition-all ${
                    isCurrent
                      ? "bg-white text-slate-950 font-bold shadow-xs border border-slate-300 dark:bg-slate-800 dark:text-white dark:border-slate-700"
                      : "text-slate-600 hover:text-slate-950 hover:bg-white/60 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-900/60"
                  }`}
                >
                  <TabIcon className="h-3 w-3" />
                  <span>{ind.name.split(" ")[0]}</span>
                </Link>
              );
            })}
          </div>

          {/* Theme Toggle Pill */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-300 text-xs font-mono transition-all cursor-pointer shadow-xs"
          >
            {isDark ? (
              <>
                <Sun className="h-3.5 w-3.5 text-amber-400" />
                <span className="hidden sm:inline">Light</span>
              </>
            ) : (
              <>
                <Moon className="h-3.5 w-3.5 text-slate-600" />
                <span className="hidden sm:inline">Dark</span>
              </>
            )}
          </button>

          {/* Launch button */}
          <button
            onClick={handleLaunch}
            className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-950 font-bold text-xs font-mono shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <span>Launch Platform</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </nav>

      {/* ==================== HERO ==================== */}
      <section className="relative py-16 sm:py-20 px-6 lg:px-12 max-w-7xl mx-auto overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#e2e8f008_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f008_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b0a_1px,transparent_1px),linear-gradient(to_bottom,#1e293b0a_1px,transparent_1px)] bg-[size:32px_32px]" />
        <div className={`pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[350px] ${industry.color.replace("text-", "bg-")}/10 blur-[120px]`} />

        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 relative z-10">
          <Link href="/#industries" className="inline-flex items-center gap-2 text-xs font-mono text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to all industries
          </Link>
          <div className="flex md:hidden items-center gap-2 overflow-x-auto pb-1 text-[11px] font-mono">
            {INDUSTRY_PAGES.map((ind) => (
              <Link
                key={ind.id}
                href={`/industries/${ind.id}`}
                className={`px-2.5 py-1 rounded border ${ind.id === industry.id ? "border-blue-500 text-blue-700 bg-blue-50 dark:border-cyan-500 dark:text-cyan-300 dark:bg-cyan-950/30 font-bold" : "border-slate-300 bg-white text-slate-600 dark:border-slate-800 dark:bg-transparent dark:text-slate-400"}`}
              >
                {ind.name.split(" ")[0]}
              </Link>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center relative z-10">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-slate-300 bg-white text-slate-800 dark:border-slate-700/80 dark:bg-[#0d1017] dark:text-slate-300 text-[11px] font-mono shadow-xs">
              <Icon className={`h-3.5 w-3.5 ${industry.color}`} />
              <span className="tracking-widest uppercase font-bold">{industry.tagline}</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-950 dark:text-white font-display leading-[1.05]">
              {industry.name.split(" ").slice(0, -2).join(" ")}{" "}
              <span className="bg-gradient-to-r from-slate-900 via-slate-700 to-slate-500 dark:from-white dark:via-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
                {industry.name.split(" ").slice(-2).join(" ")}
              </span>
            </h1>

            <p className="text-base text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed font-normal">
              {industry.desc}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={handleLaunch}
                className="px-7 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-950 font-bold text-xs sm:text-sm font-mono shadow-lg transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Launch Platform</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => document.getElementById("solution")?.scrollIntoView({ behavior: "smooth" })}
                className="px-7 py-3.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-900 dark:border-slate-700 dark:bg-[#0f131d] dark:hover:bg-[#161c2b] dark:text-slate-200 font-bold text-xs sm:text-sm font-mono transition-all cursor-pointer shadow-xs"
              >
                See Our Solution ↓
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-6 font-mono border-t border-slate-200 dark:border-slate-800/80">
              {industry.stats.map((stat, i) => (
                <div key={i} className="space-y-1">
                  <span className="block text-lg sm:text-2xl font-black text-slate-950 dark:text-white">{stat.value}</span>
                  <span className="block text-[9.5px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative rounded-2xl border border-slate-200 dark:border-slate-700/80 overflow-hidden shadow-xl dark:shadow-[0_25px_80px_rgba(0,0,0,0.9)] h-80 lg:h-[420px] bg-slate-900">
            <img src={industry.img} alt={industry.name} className="w-full h-full object-cover opacity-85 dark:opacity-50" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className={`absolute bottom-4 left-4 px-3 py-1.5 rounded-lg backdrop-blur-md border font-mono text-[10px] font-bold ${industry.accent} bg-black/60 text-white`}>
              SCIO DEPLOYMENT // LIVE
            </div>
          </div>
        </div>
      </section>

      {/* ==================== PROBLEM STATEMENT ==================== */}
      <section id="problem" className="py-20 px-6 lg:px-12 max-w-7xl mx-auto border-t border-slate-200 dark:border-slate-800/80 space-y-12">
        <div className="max-w-3xl space-y-4">
          <span className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-rose-600 dark:text-rose-400 font-bold">
            <AlertTriangle className="h-4 w-4" /> The Problem Statement
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold font-display text-slate-950 dark:text-white leading-tight">
            Operations are drowning in data<br />
            <span className="text-slate-500">and starving for decisions.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="p-8 rounded-2xl border border-rose-200 bg-rose-50/60 dark:border-rose-500/30 dark:bg-gradient-to-b dark:from-rose-950/10 dark:to-[#0d1017] space-y-5 shadow-xs">
            <p className="text-sm text-slate-800 dark:text-slate-300 leading-relaxed font-normal">{industry.problemStatement}</p>
          </div>
          <div className="space-y-3">
            {industry.problemPoints.map((point, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#0d1017] hover:border-rose-400 dark:hover:border-rose-500/40 transition-colors shadow-xs">
                <span className="mt-0.5 h-5 w-5 rounded-md bg-rose-100 border border-rose-200 dark:bg-rose-500/15 dark:border-rose-500/30 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="h-3 w-3 text-rose-600 dark:text-rose-400" />
                </span>
                <p className="text-xs text-slate-800 dark:text-slate-300 leading-relaxed">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== OUR SOLUTION ==================== */}
      <section id="solution" className="py-20 px-6 lg:px-12 max-w-7xl mx-auto border-t border-slate-200 dark:border-slate-800/80 space-y-12">
        <div className="max-w-3xl space-y-4">
          <span className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400 font-bold">
            <Sparkles className="h-4 w-4" /> Our Solution
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold font-display text-slate-950 dark:text-white leading-tight">
            One intelligence layer.<br />
            <span className="bg-gradient-to-r from-slate-900 via-slate-700 to-slate-500 dark:from-white dark:via-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
              Predict, decide, and act — automatically.
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="p-8 rounded-2xl border border-emerald-200 bg-emerald-50/60 dark:border-emerald-500/30 dark:bg-gradient-to-b dark:from-emerald-950/10 dark:to-[#0d1017] space-y-5 shadow-xs">
            <p className="text-sm text-slate-800 dark:text-slate-300 leading-relaxed font-normal">{industry.solutionStatement}</p>
            <div className="pt-2 space-y-2">
              {industry.outcomePoints.map((o, i) => (
                <div key={i} className="flex items-center gap-2.5 text-xs text-emerald-700 dark:text-emerald-300 font-mono font-bold">
                  <TrendingUp className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>{o}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            {industry.solutionPoints.map((point, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#0d1017] hover:border-emerald-400 dark:hover:border-emerald-500/40 transition-colors shadow-xs">
                <CheckCircle2 className="h-4 w-4 mt-0.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <p className="text-xs text-slate-800 dark:text-slate-300 leading-relaxed">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== FINAL CTA ==================== */}
      <section className="py-20 px-6 lg:px-12 max-w-7xl mx-auto border-t border-slate-200 dark:border-slate-800/80">
        <div className="p-10 sm:p-16 rounded-3xl border border-slate-200 bg-white dark:border-slate-700/80 dark:bg-gradient-to-b dark:from-[#141a27] dark:via-[#0d1017] dark:to-[#06080d] text-center space-y-6 shadow-xl dark:shadow-2xl relative overflow-hidden">
          <div className={`pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[300px] ${industry.color.replace("text-", "bg-")}/10 blur-[100px]`} />
          <h2 className="text-3xl sm:text-5xl font-black font-display text-slate-950 dark:text-white relative z-10">
            Ready to run {industry.name.split(" ")[0].toLowerCase()} on SCIO?
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm max-w-xl mx-auto relative z-10 font-normal">
            Launch the live mission control for this industry — real telemetry, predictive AI, and dispatch workflows running now.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4 relative z-10">
            <button
              onClick={handleLaunch}
              className="px-7 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-950 font-bold text-xs sm:text-sm font-mono shadow-lg transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Launch Platform</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <Link
              href="/#industries"
              className="px-7 py-3.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm font-mono transition-all shadow-xs"
            >
              Explore Other Industries
            </Link>
          </div>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#040508] py-10 px-6 lg:px-12 text-xs font-mono text-slate-500 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="h-7 w-7 rounded-lg bg-slate-900 dark:bg-gradient-to-br dark:from-slate-200 dark:via-slate-400 dark:to-slate-700 p-[1px]">
              <div className="h-full w-full bg-slate-950 rounded-[6px] flex items-center justify-center font-mono font-black text-white text-[10px]">S</div>
            </div>
            <span className="font-bold text-[10px] text-slate-900 dark:text-white uppercase tracking-widest">STELLAR SCIO</span>
          </div>
          <span>© 2026 StellarMind.ai — {industry.name} Intelligence</span>
        </div>
      </footer>

    </div>
  );
}
