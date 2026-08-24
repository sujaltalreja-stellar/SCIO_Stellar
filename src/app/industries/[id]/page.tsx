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
  TrendingUp
} from "lucide-react";
import { getIndustryPage } from "../../../config/industryPages";

export default function IndustryDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [industry, setIndustry] = React.useState<ReturnType<typeof getIndustryPage>>(undefined);

  React.useEffect(() => {
    params.then((p) => setIndustry(getIndustryPage(p.id)));
  }, [params]);

  if (!industry) {
    return (
      <div className="min-h-screen bg-[#06080d] text-slate-100 flex items-center justify-center font-mono text-xs text-slate-500">
        LOADING INDUSTRY DATA...
      </div>
    );
  }

  const Icon = industry.icon;

  const handleLaunch = () => {
    router.push(`/?industry=${industry.id}&tab=${industry.launchTab}&launch=1`);
  };

  return (
    <div className="min-h-screen bg-[#06080d] text-slate-100 font-sans selection:bg-cyan-500/20 selection:text-cyan-300">

      {/* ==================== NAV ==================== */}
      <nav className="sticky top-0 z-50 h-16 border-b border-slate-800/90 bg-[#06080d]/95 backdrop-blur-2xl px-6 lg:px-12 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-slate-200 via-slate-400 to-slate-700 p-[1px] shadow-lg">
            <div className="h-full w-full bg-[#090c14] rounded-[7px] flex items-center justify-center font-mono font-black text-slate-100 text-sm">
              S
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xs tracking-widest text-slate-100 uppercase font-mono group-hover:text-cyan-400 transition-colors">STELLAR SCIO</span>
            <span className="text-[9px] text-slate-500 font-mono tracking-wider">ENTERPRISE MISSION CONTROL</span>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/#industries"
            className="hidden sm:inline-flex px-4 py-2 rounded-lg border border-slate-700 bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-mono transition-all"
          >
            All Industries
          </Link>
          <button
            onClick={handleLaunch}
            className="px-4 py-2 rounded-lg bg-gradient-to-b from-slate-100 via-slate-200 to-slate-400 hover:from-white hover:to-slate-300 text-slate-950 font-bold text-xs font-mono shadow-[0_0_20px_rgba(255,255,255,0.15)] flex items-center gap-1.5 transition-all"
          >
            <span>Launch Mission Control</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </nav>

      {/* ==================== HERO ==================== */}
      <section className="relative py-20 px-6 lg:px-12 max-w-7xl mx-auto overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#1e293b0a_1px,transparent_1px),linear-gradient(to_bottom,#1e293b0a_1px,transparent_1px)] bg-[size:32px_32px]" />
        <div className={`pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[350px] ${industry.color.replace("text-", "bg-")}/5 blur-[120px]`} />

        <Link href="/#industries" className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-white transition-colors mb-8 relative z-10">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to all industries
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center relative z-10">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-slate-700/80 bg-[#0d1017] text-[11px] font-mono text-slate-300">
              <Icon className={`h-3.5 w-3.5 ${industry.color}`} />
              <span className="tracking-widest uppercase font-bold">{industry.tagline}</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white font-display leading-[1.05]">
              {industry.name.split(" ").slice(0, -2).join(" ")}{" "}
              <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                {industry.name.split(" ").slice(-2).join(" ")}
              </span>
            </h1>

            <p className="text-base text-slate-400 max-w-xl leading-relaxed">
              {industry.desc}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={handleLaunch}
                className="px-7 py-3.5 rounded-xl bg-gradient-to-b from-white to-slate-200 hover:from-slate-100 hover:to-slate-300 text-slate-950 font-bold text-xs sm:text-sm font-mono shadow-xl transition-all flex items-center gap-2"
              >
                <span>Launch Platform</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => document.getElementById("solution")?.scrollIntoView({ behavior: "smooth" })}
                className="px-7 py-3.5 rounded-xl border border-slate-700 bg-[#0f131d] hover:bg-[#161c2b] text-slate-200 hover:text-white font-bold text-xs sm:text-sm font-mono transition-all"
              >
                See Our Solution ↓
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-6 font-mono">
              {industry.stats.map((stat, i) => (
                <div key={i} className="space-y-1">
                  <span className="block text-lg sm:text-xl font-bold text-white">{stat.value}</span>
                  <span className="block text-[9px] text-slate-500 uppercase tracking-wider">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative rounded-2xl border border-slate-700/80 overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.9)] h-80 lg:h-[420px]">
            <img src={industry.img} alt={industry.name} className="w-full h-full object-cover opacity-50" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#06080d] via-transparent to-transparent" />
            <div className={`absolute bottom-4 left-4 px-3 py-1.5 rounded-lg backdrop-blur-md border font-mono text-[10px] font-bold ${industry.accent}`}>
              SCIO DEPLOYMENT // LIVE
            </div>
          </div>
        </div>
      </section>

      {/* ==================== PROBLEM STATEMENT ==================== */}
      <section id="problem" className="py-24 px-6 lg:px-12 max-w-7xl mx-auto border-t border-slate-800/80 space-y-12">
        <div className="max-w-3xl space-y-4">
          <span className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-rose-400 font-bold">
            <AlertTriangle className="h-4 w-4" /> The Problem Statement
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold font-display text-white leading-tight">
            Operations are drowning in data<br />
            <span className="text-slate-500">and starving for decisions.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="p-8 rounded-2xl border border-rose-500/30 bg-gradient-to-b from-rose-950/10 to-[#0d1017] space-y-5">
            <p className="text-sm text-slate-300 leading-relaxed">{industry.problemStatement}</p>
          </div>
          <div className="space-y-3">
            {industry.problemPoints.map((point, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl border border-slate-800 bg-[#0d1017] hover:border-rose-500/40 transition-colors">
                <span className="mt-0.5 h-5 w-5 rounded-md bg-rose-500/15 border border-rose-500/30 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="h-3 w-3 text-rose-400" />
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== OUR SOLUTION ==================== */}
      <section id="solution" className="py-24 px-6 lg:px-12 max-w-7xl mx-auto border-t border-slate-800/80 space-y-12">
        <div className="max-w-3xl space-y-4">
          <span className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-emerald-400 font-bold">
            <Sparkles className="h-4 w-4" /> Our Solution
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold font-display text-white leading-tight">
            One intelligence layer.<br />
            <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Predict, decide, and act — automatically.
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="p-8 rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-emerald-950/10 to-[#0d1017] space-y-5">
            <p className="text-sm text-slate-300 leading-relaxed">{industry.solutionStatement}</p>
            <div className="pt-2 space-y-2">
              {industry.outcomePoints.map((o, i) => (
                <div key={i} className="flex items-center gap-2.5 text-xs text-emerald-300 font-mono">
                  <TrendingUp className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>{o}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            {industry.solutionPoints.map((point, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl border border-slate-800 bg-[#0d1017] hover:border-emerald-500/40 transition-colors">
                <CheckCircle2 className="h-4 w-4 mt-0.5 text-emerald-400 flex-shrink-0" />
                <p className="text-xs text-slate-300 leading-relaxed">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== FINAL CTA ==================== */}
      <section className="py-24 px-6 lg:px-12 max-w-7xl mx-auto border-t border-slate-800/80">
        <div className="p-10 sm:p-16 rounded-3xl border border-slate-700/80 bg-gradient-to-b from-[#141a27] via-[#0d1017] to-[#06080d] text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className={`pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[300px] ${industry.color.replace("text-", "bg-")}/10 blur-[100px]`} />
          <h2 className="text-3xl sm:text-5xl font-bold font-display text-white relative z-10">
            Ready to run {industry.name.split(" ")[0].toLowerCase()} on SCIO?
          </h2>
          <p className="text-slate-300 text-sm max-w-xl mx-auto relative z-10">
            Launch the live mission control for this industry — real telemetry, predictive AI, and dispatch workflows running now.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4 relative z-10">
            <button
              onClick={handleLaunch}
              className="px-7 py-3.5 rounded-xl bg-gradient-to-b from-white to-slate-200 hover:from-slate-100 hover:to-slate-300 text-slate-950 font-bold text-xs sm:text-sm font-mono shadow-xl transition-all inline-flex items-center gap-2"
            >
              <span>Launch Platform</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <Link
              href="/#industries"
              className="px-7 py-3.5 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white font-bold text-xs sm:text-sm font-mono transition-all"
            >
              Explore Other Industries
            </Link>
          </div>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer className="border-t border-slate-800/80 bg-[#040508] py-10 px-6 lg:px-12 text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-slate-200 via-slate-400 to-slate-700 p-[1px]">
              <div className="h-full w-full bg-[#090c14] rounded-[6px] flex items-center justify-center font-mono font-black text-slate-100 text-[10px]">S</div>
            </div>
            <span className="font-bold text-[10px] text-white uppercase tracking-widest">STELLAR SCIO</span>
          </div>
          <span>© 2026 StellarMind.ai — {industry.name} Intelligence</span>
        </div>
      </footer>

    </div>
  );
}
