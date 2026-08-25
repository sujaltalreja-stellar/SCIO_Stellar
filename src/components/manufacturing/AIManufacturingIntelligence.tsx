"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Cpu,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Zap,
  ArrowRight,
  Sliders,
  RefreshCw,
  Send,
  MessageSquare,
  Bot
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from "recharts";

interface Recommendation {
  id: string;
  category: "Schedule Recovery" | "Energy Optimization" | "Quality Guard" | "Tooling Wear";
  impact: "High" | "Medium" | "Critical";
  title: string;
  description: string;
  projectedBenefit: string;
  actionLabel: string;
  applied: boolean;
}

const INITIAL_RECOMMENDATIONS: Recommendation[] = [
  {
    id: "rec-01",
    category: "Schedule Recovery",
    impact: "Critical",
    title: "Line B2 Output Target Recovery Recommendation",
    description: "If Line B2 continues at current performance (178.7s cycle time), today's production will miss target by 86 units. Move WO-4821 to Line A3 and replace Tool B2-17 during Shift 2 to recover the schedule.",
    projectedBenefit: "+86 units recovered ($43,000 SLA preserved)",
    actionLabel: "Execute Re-route & Tool Change",
    applied: false,
  },
  {
    id: "rec-02",
    category: "Tooling Wear",
    impact: "High",
    title: "Thermal Spindle Pre-Emptive Calibration",
    description: "Spindle #2 on Line B2 is showing thermal creep (+3.8°C over 4 hours). Reduce feed rate by 6% on Ti-6Al-4V impeller finishing pass to extend tool life by 140 cycles.",
    projectedBenefit: "+140 End Mill cycles ($1,400 tooling saved)",
    actionLabel: "Apply Feed Rate Trim (-6%)",
    applied: false,
  },
  {
    id: "rec-03",
    category: "Energy Optimization",
    impact: "Medium",
    title: "Peak Tariff Power Shifting (14:00 - 17:00)",
    description: "Heavy laser welding heat cycles coincide with regional peak power rates ($0.22/kWh). Shift Laser Weld Batch #4 to 17:30 low-tariff window ($0.09/kWh).",
    projectedBenefit: "14.2% energy cost reduction ($840/day)",
    actionLabel: "Schedule Load Shift",
    applied: false,
  },
];

const COST_PER_UNIT_DATA = [
  { item: "Raw Material", cost: 142.5, color: "#3b82f6" },
  { item: "Machining Labor", cost: 38.2, color: "#06b6d4" },
  { item: "Power & Energy", cost: 18.6, color: "#f59e0b" },
  { item: "Tooling Wear", cost: 12.4, color: "#8b5cf6" },
  { item: "Scrap & Defect", cost: 4.8, color: "#f43f5e" },
];

export function AIManufacturingIntelligence() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>(INITIAL_RECOMMENDATIONS);
  const [chatPrompt, setChatPrompt] = useState("");
  const [chatHistory, setChatHistory] = useState<{ role: "user" | "ai"; text: string }[]>([
    {
      role: "ai",
      text: "Hello! I am your SCIO AI Manufacturing Copilot. I continuously monitor shopfloor OEE, telemetry drifts, tooling life, and ERP delivery schedules. How can I assist your plant operations today?",
    },
  ]);

  const handleApplyRec = (id: string) => {
    setRecommendations(prev =>
      prev.map(r => (r.id === id ? { ...r, applied: true } : r))
    );
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatPrompt.trim()) return;

    const userText = chatPrompt;
    setChatPrompt("");
    setChatHistory(prev => [
      ...prev,
      { role: "user", text: userText },
      {
        role: "ai",
        text: `Analysis complete for: "${userText}". All 4 production lines are operating within ISO 22400 specifications. Line B2 has the highest recovery potential if Tool B2-17 is serviced during Shift 2.`,
      },
    ]);
  };

  const totalCostPerUnit = COST_PER_UNIT_DATA.reduce((acc, c) => acc + c.cost, 0);

  return (
    <div className="space-y-6">
      {/* ==================== 1. HEADER BANNER ==================== */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-panel p-6 shadow-2xs">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400 font-mono">
              <Sparkles className="h-4 w-4" /> AI Manufacturing Intelligence &amp; Copilot
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
              Understand ➔ Predict ➔ Recommend ➔ Optimize
            </h1>
            <p className="mt-1 text-sm text-slate-700 dark:text-slate-300 font-medium">
              Autonomous production rescheduling, predictive bottleneck resolution, cost-per-unit telemetry, and energy load balancing.
            </p>
          </div>
        </div>
      </section>

      {/* ==================== 2. AUTONOMOUS RECOMMENDATIONS ==================== */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider font-mono text-slate-950 dark:text-white flex items-center gap-2">
            <Cpu className="h-4 w-4 text-amber-600 dark:text-amber-400" /> Prescriptive AI Action Recommendations
          </h2>
          <span className="text-xs text-slate-600 dark:text-slate-400 font-mono">Real-time shopfloor intelligence</span>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {recommendations.map(rec => (
            <div
              key={rec.id}
              className={`p-5 rounded-xl border flex flex-col justify-between space-y-4 transition-all ${
                rec.applied
                  ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800"
                  : "bg-white dark:bg-panel border-slate-200 dark:border-borderMuted shadow-2xs hover:border-slate-400"
              }`}
            >
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {rec.category}
                  </span>
                  <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${
                    rec.impact === "Critical"
                      ? "bg-rose-100 text-rose-950 border-rose-300 dark:bg-rose-950 dark:text-rose-300"
                      : "bg-amber-100 text-amber-950 border-amber-300 dark:bg-amber-950 dark:text-amber-300"
                  }`}>
                    {rec.impact} Priority
                  </span>
                </div>

                <h3 className="font-bold text-slate-950 dark:text-white text-sm">{rec.title}</h3>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-mono">
                  {rec.description}
                </p>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="text-xs font-mono font-bold text-emerald-800 dark:text-emerald-300">
                  Benefit: {rec.projectedBenefit}
                </div>

                <button
                  onClick={() => handleApplyRec(rec.id)}
                  disabled={rec.applied}
                  className={`w-full py-2.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center justify-center gap-2 ${
                    rec.applied
                      ? "bg-emerald-600 text-white cursor-default"
                      : "bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 shadow-xs"
                  }`}
                >
                  {rec.applied ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" /> Applied to Schedule
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5 text-amber-400" /> {rec.actionLabel}
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ==================== 3. COST PER UNIT & AI COPILOT CHAT ==================== */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Left: Cost-Per-Unit Breakdown */}
        <div className="rounded-xl border border-slate-200 dark:border-borderMuted bg-white dark:bg-panel p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-borderMuted pb-3">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-slate-950 dark:text-white flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Real-Time Cost-Per-Unit Breakdown
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-mono">Part: Titanium Turbine Impeller (Target: $220.00/unit)</p>
            </div>
            <div className="text-right font-mono">
              <span className="text-lg font-bold text-slate-950 dark:text-white">${totalCostPerUnit.toFixed(2)}</span>
              <span className="block text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">-$3.50 vs standard BOM</span>
            </div>
          </div>

          <div className="space-y-3">
            {COST_PER_UNIT_DATA.map(c => {
              const pct = Math.round((c.cost / totalCostPerUnit) * 100);
              return (
                <div key={c.item} className="space-y-1 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-700 dark:text-slate-300 font-bold">{c.item}</span>
                    <span className="text-slate-950 dark:text-white font-bold">${c.cost.toFixed(2)} ({pct}%)</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, backgroundColor: c.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: AI Manufacturing Copilot Chat Terminal */}
        <div className="rounded-xl border border-slate-200 dark:border-borderMuted bg-white dark:bg-panel p-5 shadow-2xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-borderMuted pb-3">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-slate-950 dark:text-white flex items-center gap-2">
                <Bot className="h-4 w-4 text-amber-600 dark:text-amber-400" /> AI Manufacturing Copilot Terminal
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">Ask about OEE, shift re-scheduling, tool life, and energy tariffs</p>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
            {chatHistory.map((msg, i) => (
              <div
                key={i}
                className={`p-3 rounded-lg text-xs font-mono ${
                  msg.role === "ai"
                    ? "bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                    : "bg-slate-900 text-white ml-6 text-right"
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>

          {/* Chat Input Form */}
          <form onSubmit={handleSendMessage} className="flex gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <input
              type="text"
              value={chatPrompt}
              onChange={(e) => setChatPrompt(e.target.value)}
              placeholder="e.g. How can we recover 86 units on Line B2 today?..."
              className="flex-1 px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-950 dark:text-white"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg text-xs font-mono font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
