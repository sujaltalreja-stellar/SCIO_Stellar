"use client";

import React from "react";
import {
  CheckCircle2
} from "lucide-react";
import { C, SHELL, SectionIntro } from "../shared";

export default function WhyScioSection() {

  return (
    <>
      {/* ==================== 8. THE "WHY SCIO?" COMPARISON ==================== */}
      <section id="why-scio" className="py-20 border-t" style={{ background: C.whiteSurface, borderColor: C.lineLight }}>
        <div className={`${SHELL} space-y-12`}>
          <SectionIntro
            eyebrow="06 — PARADIGM SHIFT · TRADITIONAL BI VS. STELLAR SCIO"
            title="Traditional dashboards tell you what happened. SCIO helps you understand what happens next."
            description="Transition from passive static charts to a proactive operational decision cockpit."
            tone="light"
            rule
          />

          <div
            className="max-w-4xl mx-auto rounded-2xl border overflow-hidden shadow-lg"
            style={{ borderColor: C.lineLight, background: C.white }}
          >
            <table className="w-full text-left border-collapse text-xs sm:text-sm font-mono">
              <thead>
                <tr className="border-b font-bold" style={{ borderColor: C.lineLight, background: "#F1F5F9", color: C.ink }}>
                  <th className="p-4 sm:p-5 uppercase tracking-wider">Dimension</th>
                  <th className="p-4 sm:p-5 uppercase tracking-wider opacity-60">Traditional BI</th>
                  <th className="p-4 sm:p-5 uppercase tracking-wider border-l font-black bg-black text-white">
                    Stellar SCIO
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: C.lineLightSoft }}>
                {[
                  { dim: "Focus", trad: "Historical reporting", scio: "Predictive intelligence" },
                  { dim: "Format", trad: "Static, passive dashboards", scio: "Dynamic operational cockpit" },
                  { dim: "Output", trad: "Raw data & charts", scio: "Concrete decision recommendations" },
                  { dim: "Workload", trad: "Manual human analysis", scio: "AI-powered automated triage" },
                  { dim: "Architecture", trad: "Isolated, siloed reports", scio: "Connected operational layer" },
                  { dim: "Posture", trad: "Reactive firefighting", scio: "Proactive risk prevention" },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 sm:p-5 font-bold" style={{ color: C.ink }}>{row.dim}</td>
                    <td className="p-4 sm:p-5 font-medium" style={{ color: C.inkMuted }}>{row.trad}</td>
                    <td className="p-4 sm:p-5 font-bold border-l flex items-center gap-2 bg-slate-900 text-white" style={{ borderColor: C.lineDark }}>
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                      <span>{row.scio}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

    </>
  );
}
