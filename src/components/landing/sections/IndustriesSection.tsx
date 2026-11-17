"use client";

import React, { useState } from "react";
import {
  Zap,
  Building2,
  Ship,
  Truck,
  ArrowRight,
  AlertTriangle,
  CheckCircle2
} from "lucide-react";
import { C, SHELL, SectionIntro, INDUSTRY_DATA } from "../shared";
import { useSite } from "../../site/SiteContext";

export default function IndustriesSection() {
  const { handleNavClick } = useSite();
  const [selectedIndustryTab, setSelectedIndustryTab] = useState<"energy" | "maritime" | "manufacturing" | "logistics">("energy");
  const currentInd = INDUSTRY_DATA[selectedIndustryTab];

  return (
    <>
      {/* ==================== 3. THE 4 CORE INDUSTRIES (WHERE SCIO RUNS) ==================== */}
      <section id="industries" className="py-20 border-t" style={{ background: C.whiteSurface, borderColor: C.lineLight }}>
        <div className={`${SHELL} space-y-12`}>
          <SectionIntro
            eyebrow="01 — WHERE SCIO RUNS · 4 CORE INDUSTRIAL SECTORS"
            title="Purpose-Built for Heavy Industry Operations"
            description="Explore how SCIO delivers deep vertical intelligence across Energy, Maritime, Manufacturing, and Supply Chains."
            tone="light"
            rule
          />

          {/* Industry Tabs with Direct Link Targets */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {[
              { id: "energy", label: "⚡ Renewable Energy", icon: Zap, tab: "energy-dashboard" },
              { id: "maritime", label: "🚢 Maritime Fleet", icon: Ship, tab: "dashboard" },
              { id: "manufacturing", label: "🏭 Manufacturing 4.0", icon: Building2, tab: "dashboard" },
              { id: "logistics", label: "🚚 Global Supply Chain", icon: Truck, tab: "dashboard" },
            ].map((tab) => {
              const isActive = selectedIndustryTab === tab.id;
              const Icon = tab.icon;
              return (
                <a
                  key={tab.id}
                  href={`/?launch=1&industry=${tab.id}&tab=${tab.tab}`}
                  onClick={(e) => {
                    if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
                      e.preventDefault();
                      setSelectedIndustryTab(tab.id as any);
                    }
                  }}
                  className="flex items-center gap-2 px-6 py-3 rounded-full font-mono text-xs font-bold transition-all shadow-xs"
                  style={{
                    background: isActive ? "#090D16" : "#FFFFFF",
                    color: isActive ? "#FFFFFF" : C.ink,
                    border: `1px solid ${isActive ? "#090D16" : C.lineLight}`,
                  }}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </a>
              );
            })}
          </div>

          {/* Active Industry Card (Vibrant, High Contrast, Real-World Photo) */}
          <div
            className="rounded-3xl border overflow-hidden shadow-xl"
            style={{ borderColor: C.lineLight, background: C.white }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-12">
              
              {/* Left Column: Image Banner in Full Color */}
              <div className="lg:col-span-5 relative min-h-[440px] overflow-hidden flex flex-col justify-between p-8">
                <img
                  src={currentInd.heroImg}
                  alt={currentInd.name}
                  className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent" />

                <div className="relative z-10 space-y-2">
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-[11px] font-bold uppercase tracking-wider text-black bg-white shadow-xs"
                  >
                    <currentInd.icon className="h-3.5 w-3.5" />
                    <span>{currentInd.id.toUpperCase()} SECTOR OCC</span>
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-white mt-2">
                    {currentInd.name}
                  </h3>
                  <p className="text-xs font-mono text-white/80 font-bold">
                    {currentInd.tagline}
                  </p>
                </div>

                <div className="relative z-10 grid grid-cols-2 gap-3 pt-6">
                  {currentInd.kpis.map((kpi) => (
                    <div
                      key={kpi.label}
                      className="p-3 rounded-xl border bg-black/80 backdrop-blur-md shadow-xs border-white/20"
                    >
                      <span className="font-mono text-base sm:text-lg font-black block text-white" style={{ color: kpi.tone }}>
                        {kpi.val}
                      </span>
                      <span className="text-[10px] font-mono text-white/70 block truncate font-semibold">
                        {kpi.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Problem, Solution & Gallery */}
              <div className="lg:col-span-7 p-8 sm:p-10 space-y-6 flex flex-col justify-between bg-white">
                <div className="space-y-5">
                  
                  <div className="p-5 rounded-2xl border bg-red-50/70 border-red-200">
                    <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider mb-2 text-red-700">
                      <AlertTriangle className="h-4 w-4" />
                      <span>The Specific Challenge:</span>
                    </div>
                    <p className="text-xs sm:text-sm leading-relaxed font-bold text-slate-900">
                      {currentInd.problem}
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl border bg-emerald-50/70 border-emerald-200">
                    <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider mb-2 text-emerald-700">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>How SCIO Solves It:</span>
                    </div>
                    <p className="text-xs sm:text-sm leading-relaxed font-bold text-slate-900">
                      {currentInd.solution}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 mb-2.5">
                      Field Telemetry Assets Monitored:
                    </h4>
                    <div className="grid grid-cols-3 gap-2.5">
                      {currentInd.gallery.map((g, gIdx) => (
                        <div
                          key={gIdx}
                          className="relative h-24 rounded-xl overflow-hidden border group bg-black shadow-xs"
                          style={{ borderColor: C.lineLight }}
                        >
                          <img src={g.img} alt={g.label} className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                          <span className="absolute bottom-1.5 left-2 right-2 text-[10.5px] font-mono text-white font-bold truncate drop-shadow-sm">
                            {g.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                <div className="pt-5 border-t flex flex-wrap items-center justify-between gap-3" style={{ borderColor: C.lineLight }}>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-slate-700 font-bold">
                      Live data feeds initialized
                    </span>
                    <a
                      href={`/industries/${currentInd.id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <span>Sector Blueprint</span>
                      <ArrowRight className="h-3 w-3" />
                    </a>
                  </div>
                  <a
                    href={`/?launch=1&industry=${currentInd.id}&tab=${currentInd.tab}`}
                    onClick={(e) => handleNavClick(e, currentInd.id, currentInd.tab)}
                    className="px-6 py-3 rounded-full text-white font-bold text-xs font-mono shadow-md flex items-center gap-2 transition-all hover:scale-105 bg-black hover:bg-slate-900"
                  >
                    <span>Launch {currentInd.name.split(" ")[0]} Mission Control</span>
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>

              </div>

            </div>
          </div>
        </div>
      </section>

    </>
  );
}
