"use client";

import React from "react";
import { C, SHELL, SectionIntro } from "../shared";

export default function ProblemSection() {

  return (
    <>
      {/* ==================== 4. THE PROBLEM SECTION ==================== */}
      <section id="problem" className="py-20 border-t" style={{ background: C.white, borderColor: C.lineLight }}>
        <div className={`${SHELL} space-y-12`}>
          <SectionIntro
            eyebrow="02 — THE PROBLEM · THE INDUSTRIAL FRAGMENTATION CRISIS"
            title="What Problem Are We Solving?"
            description="Heavy industrial operations are drowning in siloed telemetry while critical equipment failures and supply bottlenecks remain hidden until disaster strikes."
            tone="light"
            rule
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "1. Data Trapped in Legacy Silos",
                desc: "SCADA systems, SAP/Oracle ERPs, IoT sensor streams, and spreadsheets never communicate with each other in real-time.",
                stat: "80% of signals unanalyzed",
                img: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80",
                tone: C.red
              },
              {
                title: "2. Reactive Firefighting",
                desc: "Engineering teams only discover turbine faults, hydraulic line leaks, and bunker fuel shortages after an outage occurs.",
                stat: "$120,000 / hr downtime",
                img: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80",
                tone: C.amber
              },
              {
                title: "3. Slow Action Execution",
                desc: "Even when an anomaly is spotted, drafting work orders, checking MRO spare parts inventory, and dispatching crews takes days.",
                stat: "6–9 day response lag",
                img: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80",
                tone: C.indigo
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border overflow-hidden transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between shadow-md"
                style={{ borderColor: C.lineLight, background: C.white }}
              >
                <div className="h-48 relative overflow-hidden bg-black">
                  <img src={item.img} alt={item.title} className="w-full h-full object-cover opacity-90 hover:scale-105 transition-all duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                  <span
                    className="absolute top-4 left-4 px-3 py-1 rounded-full font-mono text-[11px] font-bold border backdrop-blur-md bg-white text-black shadow-xs"
                    style={{ borderColor: item.tone }}
                  >
                    {item.stat}
                  </span>
                </div>

                <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold" style={{ color: C.ink }}>{item.title}</h3>
                    <p className="text-xs sm:text-sm leading-relaxed mt-2 font-medium" style={{ color: C.inkBody }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </>
  );
}
