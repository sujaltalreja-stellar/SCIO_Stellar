"use client";

import React from "react";
import {
  Cpu,
  Eye,
  Workflow
} from "lucide-react";
import { C, SHELL, SectionIntro } from "../shared";

export default function SolutionSection() {

  return (
    <>
      {/* ==================== 5. OUR SOLUTION (SEE → PREDICT → ACT) ==================== */}
      <section id="solution" className="py-20 border-t" style={{ background: C.whiteSurface, borderColor: C.lineLight }}>
        <div className={`${SHELL} space-y-12`}>
          <SectionIntro
            eyebrow="03 — THE OPERATING LOOP · SEE → PREDICT → ACT"
            title="What Is Our Solution?"
            description="Stellar SCIO is the unified, non-invasive operational AI layer that connects on top of your existing systems to deliver a closed-loop intelligence cycle:"
            tone="light"
            rule
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                phase: "SEE",
                title: "Unified Live Telemetry",
                desc: "Zero-rip-and-replace connectors ingest high-frequency IoT sensors, SCADA OPC-UA, and ERP databases into a synchronized digital twin.",
                tone: C.cyan,
                img: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
                icon: Eye
              },
              {
                step: "02",
                phase: "PREDICT",
                title: "Continuous Multivariate AI",
                desc: "Neural anomaly detection identifies thermal hotspots, bearing vibration fatigue, and port customs delays up to 14 days before failure.",
                tone: C.indigo,
                img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
                icon: Cpu
              },
              {
                step: "03",
                phase: "ACT",
                title: "Autonomous Work Execution",
                desc: "Automatically drafts MRO purchase orders, dispatches technician work orders, and syncs status back to ERP ledgers.",
                tone: C.green,
                img: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80",
                icon: Workflow
              },
            ].map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.step}
                  className="rounded-2xl border overflow-hidden transition-all duration-300 hover:-translate-y-1 shadow-md"
                  style={{ borderColor: C.lineLight, background: C.white }}
                >
                  <div className="h-40 relative overflow-hidden bg-black">
                    <img src={pillar.img} alt={pillar.title} className="w-full h-full object-cover opacity-90 hover:scale-105 transition-all duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 rounded-full font-mono text-[10px] font-bold border backdrop-blur-md bg-white text-black shadow-xs" style={{ borderColor: pillar.tone }}>
                        {pillar.step} — {pillar.phase}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg border bg-slate-50" style={{ borderColor: C.lineLight }}>
                        <Icon className="h-4 w-4" style={{ color: pillar.tone }} />
                      </div>
                      <h3 className="text-lg font-bold" style={{ color: C.ink }}>{pillar.title}</h3>
                    </div>
                    <p className="text-xs sm:text-sm leading-relaxed font-medium" style={{ color: C.inkBody }}>
                      {pillar.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

    </>
  );
}
