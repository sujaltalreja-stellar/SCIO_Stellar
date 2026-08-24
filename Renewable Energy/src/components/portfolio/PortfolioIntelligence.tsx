import React, { useState } from "react";
import { useQuery } from "../../lib/convex";
import { api } from "../../lib/convex";
import {
  BarChart3, TrendingUp, TrendingDown, Activity, Zap, DollarSign,
  Globe, Award, ChevronUp, ChevronDown, Star, ArrowUpRight, Building2
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  AreaChart, Area, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  Cell
} from "recharts";
import { motion } from "framer-motion";

const PLANT_COLORS = ["#10b981","#3b82f6","#f59e0b","#8b5cf6","#f43f5e"];
const PLANTS = ["Mojave Solar","High Plains Wind","Gulf Coast BESS","Sonora Solar","Panhandle Wind"];

export default function PortfolioIntelligence() {
  const [activeTab, setActiveTab] = useState<"scorecard" | "comparison" | "heatmap" | "board">("scorecard");
  const [selectedPeriod, setSelectedPeriod] = useState("2026-Q2");

  const analytics = useQuery(api.portfolio.listAnalytics, { period: selectedPeriod }) ?? [];
  const kpisRaw = useQuery(api.portfolio.listExecutiveKPIs, { limit: 12 }) ?? [];
  const boardReports = useQuery(api.portfolio.listBoardReports) ?? [];

  const latestKPI = kpisRaw[kpisRaw.length - 1] ?? {};
  const priorKPI = kpisRaw[kpisRaw.length - 2] ?? {};

  const delta = (a: number, b: number) => {
    if (!b || !a) return null;
    const d = ((a - b) / b * 100).toFixed(1);
    return { value: parseFloat(d), up: parseFloat(d) >= 0 };
  };

  const kpiCards = [
    { label: "Fleet Capacity", value: `${latestKPI.totalCapacityMW?.toFixed(0) ?? "1,247"} MW`, delta: delta(latestKPI.totalCapacityMW, priorKPI.totalCapacityMW), color: "text-sky-400" },
    { label: "Generation (Mo)", value: `${((latestKPI.totalGenerationMWh ?? 72000) / 1000).toFixed(1)} GWh`, delta: delta(latestKPI.totalGenerationMWh, priorKPI.totalGenerationMWh), color: "text-emerald-400" },
    { label: "Capacity Factor", value: `${latestKPI.capacityFactor?.toFixed(1) ?? "34.2"}%`, delta: delta(latestKPI.capacityFactor, priorKPI.capacityFactor), color: "text-emerald-400" },
    { label: "Fleet Uptime", value: `${latestKPI.uptime?.toFixed(1) ?? "97.4"}%`, delta: delta(latestKPI.uptime, priorKPI.uptime), color: "text-emerald-400" },
    { label: "Monthly Revenue", value: `$${((latestKPI.revenueUSD ?? 9200000) / 1000000).toFixed(2)}M`, delta: delta(latestKPI.revenueUSD, priorKPI.revenueUSD), color: "text-emerald-400" },
    { label: "OPEX", value: `$${((latestKPI.opexUSD ?? 4100000) / 1000000).toFixed(2)}M`, delta: delta(latestKPI.opexUSD, priorKPI.opexUSD), color: "text-amber-400" },
    { label: "EBITDA", value: `$${((latestKPI.ebitda ?? 5100000) / 1000000).toFixed(2)}M`, delta: delta(latestKPI.ebitda, priorKPI.ebitda), color: "text-emerald-400" },
    { label: "ESG Score", value: `${latestKPI.esgScore?.toFixed(1) ?? "88.4"}`, delta: delta(latestKPI.esgScore, priorKPI.esgScore), color: "text-violet-400" },
    { label: "MTTR", value: `${latestKPI.mttr?.toFixed(1) ?? "5.8"} hrs`, delta: delta(latestKPI.mttr ? -latestKPI.mttr : 0, priorKPI.mttr ? -priorKPI.mttr : 0), color: "text-sky-400" },
    { label: "MTBF", value: `${latestKPI.mtbf?.toFixed(0) ?? "1,940"} hrs`, delta: delta(latestKPI.mtbf, priorKPI.mtbf), color: "text-sky-400" },
  ];

  const revenueHistoryData = kpisRaw.map((k: any) => ({
    period: k.period,
    revenue: parseFloat((k.revenueUSD / 1000000).toFixed(2)),
    opex: parseFloat((k.opexUSD / 1000000).toFixed(2)),
    ebitda: parseFloat((k.ebitda / 1000000).toFixed(2)),
  }));

  const plantCompData = analytics.map((a: any, i: number) => ({
    plant: a.plantName.split(" ")[0] + " " + a.plantName.split(" ")[1],
    capacityFactor: a.capacityFactor,
    availability: a.availabilityFactor,
    health: a.healthScore,
    revenue: parseFloat((a.revenuePerMW / 1000).toFixed(1)),
    perf: a.performanceIndex,
  }));

  const radarDataAllPlants = PLANTS.map((p, i) => ({
    subject: p.split(" ")[0],
    capacityFactor: analytics[i]?.capacityFactor ?? 30 + i * 2,
    availability: analytics[i]?.availabilityFactor ?? 94 + i,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-900 pb-5 gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Portfolio Intelligence
            <span className="text-xs font-mono px-2 py-0.5 rounded border border-zinc-700 text-zinc-400 bg-slate-800/35">C-Suite</span>
          </h2>
          <p className="text-xs text-zinc-500 font-mono">EXECUTIVE SCORECARD, PLANT BENCHMARKING, FINANCIAL PERFORMANCE</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={selectedPeriod} onChange={e => setSelectedPeriod(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs rounded-lg px-3 py-2 font-mono">
            {["2025-Q3","2025-Q4","2026-Q1","2026-Q2"].map(p => <option key={p}>{p}</option>)}
          </select>
          <div className="flex bg-zinc-950/40 p-1 rounded-lg border border-zinc-900/80 text-xs font-mono">
            {(["scorecard","comparison","heatmap","board"] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-md transition-all capitalize ${activeTab === tab ? "bg-zinc-900 text-emerald-400 border border-emerald-500/20" : "text-zinc-400 border border-transparent"}`}>
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SCORECARD TAB */}
      {activeTab === "scorecard" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {kpiCards.map((kpi, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-4">
                <p className="text-[10px] text-zinc-500 font-mono uppercase">{kpi.label}</p>
                <p className={`text-xl font-bold mt-1 ${kpi.color}`}>{kpi.value}</p>
                {kpi.delta !== null && (
                  <div className={`flex items-center gap-1 mt-1 text-[10px] font-mono ${kpi.delta.up ? "text-emerald-400" : "text-red-400"}`}>
                    {kpi.delta.up ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    {Math.abs(kpi.delta.value)}% MoM
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          <div className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-zinc-300 mb-4">Revenue / OPEX / EBITDA — 12-Month Trend ($M)</h3>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={revenueHistoryData}>
                <defs>
                  {["revG","opexG","ebitG"].map((id, i) => (
                    <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={["#10b981","#f59e0b","#3b82f6"][i]} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={["#10b981","#f59e0b","#3b82f6"][i]} stopOpacity={0.02} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#18181b" />
                <XAxis dataKey="period" tick={{ fill: "#71717a", fontSize: 9 }} />
                <YAxis tick={{ fill: "#71717a", fontSize: 9 }} tickFormatter={v => `$${v}M`} />
                <Tooltip contentStyle={{ background: "#09090b", border: "1px solid #27272a", borderRadius: 8, fontSize: 11 }} />
                <Legend wrapperStyle={{ fontSize: 10, color: "#71717a" }} />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="url(#revG)" strokeWidth={2} name="Revenue" />
                <Area type="monotone" dataKey="opex" stroke="#f59e0b" fill="url(#opexG)" strokeWidth={1.5} name="OPEX" />
                <Area type="monotone" dataKey="ebitda" stroke="#3b82f6" fill="url(#ebitG)" strokeWidth={2} name="EBITDA" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* COMPARISON TAB */}
      {activeTab === "comparison" && (
        <div className="space-y-5">
          <div className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-zinc-300 mb-4">Plant Benchmarking — Capacity Factor, Availability, Performance ({selectedPeriod})</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={plantCompData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#18181b" />
                <XAxis dataKey="plant" tick={{ fill: "#71717a", fontSize: 10 }} />
                <YAxis tick={{ fill: "#71717a", fontSize: 10 }} />
                <Tooltip contentStyle={{ background: "#09090b", border: "1px solid #27272a", borderRadius: 8, fontSize: 11 }} />
                <Legend wrapperStyle={{ fontSize: 10, color: "#71717a" }} />
                <Bar dataKey="capacityFactor" name="Capacity Factor %" fill="#10b981" radius={[2,2,0,0]} />
                <Bar dataKey="availability" name="Availability %" fill="#3b82f6" radius={[2,2,0,0]} />
                <Bar dataKey="perf" name="Performance Index" fill="#8b5cf6" radius={[2,2,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-zinc-300 mb-4">Revenue per MW vs Maintenance Cost per MW ({selectedPeriod})</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={plantCompData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#18181b" />
                <XAxis dataKey="plant" tick={{ fill: "#71717a", fontSize: 10 }} />
                <YAxis tick={{ fill: "#71717a", fontSize: 9 }} tickFormatter={v => `$${v}K`} />
                <Tooltip contentStyle={{ background: "#09090b", border: "1px solid #27272a", borderRadius: 8, fontSize: 11 }} />
                <Legend wrapperStyle={{ fontSize: 10, color: "#71717a" }} />
                <Bar dataKey="revenue" name="Revenue/MW ($K)" fill="#10b981" radius={[2,2,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* HEATMAP TAB */}
      {activeTab === "heatmap" && (
        <div className="space-y-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-zinc-300">Operational Performance Heatmap</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 uppercase text-[10px]">
                  <th className="pb-2 text-left">Plant</th>
                  <th className="pb-2 text-center">Capacity Factor</th>
                  <th className="pb-2 text-center">Availability</th>
                  <th className="pb-2 text-center">Health Score</th>
                  <th className="pb-2 text-center">Rev/MW</th>
                  <th className="pb-2 text-center">CO₂ Avoided</th>
                  <th className="pb-2 text-center">Perf Index</th>
                </tr>
              </thead>
              <tbody>
                {analytics.map((a: any, i: number) => {
                  const heatColor = (val: number, max: number) => {
                    const norm = val / max;
                    if (norm > 0.85) return "bg-emerald-500/20 text-emerald-300";
                    if (norm > 0.65) return "bg-sky-500/15 text-sky-300";
                    if (norm > 0.45) return "bg-amber-500/15 text-amber-300";
                    return "bg-red-500/15 text-red-300";
                  };
                  return (
                    <tr key={a._id} className="border-b border-zinc-900 hover:bg-zinc-900/20 transition-colors">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full" style={{ background: PLANT_COLORS[i] }} />
                          <span className="text-white font-semibold">{a.plantName}</span>
                        </div>
                      </td>
                      <td className="py-3 text-center"><span className={`px-2 py-0.5 rounded ${heatColor(a.capacityFactor, 40)}`}>{a.capacityFactor?.toFixed(1)}%</span></td>
                      <td className="py-3 text-center"><span className={`px-2 py-0.5 rounded ${heatColor(a.availabilityFactor, 100)}`}>{a.availabilityFactor?.toFixed(1)}%</span></td>
                      <td className="py-3 text-center"><span className={`px-2 py-0.5 rounded ${heatColor(a.healthScore, 100)}`}>{a.healthScore?.toFixed(1)}%</span></td>
                      <td className="py-3 text-center"><span className={`px-2 py-0.5 rounded ${heatColor(a.revenuePerMW, 9000)}`}>${a.revenuePerMW?.toLocaleString()}</span></td>
                      <td className="py-3 text-center"><span className={`px-2 py-0.5 rounded ${heatColor(a.co2Avoided, 12000)}`}>{a.co2Avoided?.toLocaleString()}t</span></td>
                      <td className="py-3 text-center"><span className={`px-2 py-0.5 rounded ${heatColor(a.performanceIndex, 100)}`}>{a.performanceIndex?.toFixed(1)}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* BOARD REPORTS TAB */}
      {activeTab === "board" && (
        <div className="space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-zinc-300">Board-Level Operations Reports</h3>
          <div className="space-y-4">
            {boardReports.slice().reverse().map((report: any, i: number) => (
              <motion.div key={report._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                className="bg-zinc-950/30 border border-zinc-900 rounded-xl p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded border ${report.status === "published" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : report.status === "approved" ? "bg-sky-500/10 text-sky-400 border-sky-500/20" : "bg-zinc-800 text-zinc-400 border-zinc-700"}`}>{report.status}</span>
                      <span className="text-xs text-zinc-500 font-mono">{report.period}</span>
                    </div>
                    <h4 className="text-sm font-bold text-white">{report.title}</h4>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[10px] text-zinc-500 font-mono">Revenue</p>
                    <p className="text-lg font-bold text-emerald-400">${(report.totalRevenue / 1000000).toFixed(1)}M</p>
                    <p className="text-[10px] text-emerald-500 font-mono">+{report.revenueGrowth?.toFixed(1)}% YoY</p>
                  </div>
                </div>
                <p className="text-xs text-zinc-400 mb-4 leading-relaxed">{report.executiveSummary}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 font-mono text-[11px]">
                  {[
                    ["Total Capacity", `${report.totalCapacity?.toLocaleString()} MW`, "text-sky-400"],
                    ["New Capacity", `+${report.newCapacity} MW`, "text-emerald-400"],
                    ["ESG Score", report.esgScore?.toFixed(1), "text-violet-400"],
                    ["Revenue Growth", `+${report.revenueGrowth?.toFixed(1)}%`, "text-emerald-400"],
                  ].map(([k, v, c]) => (
                    <div key={k as string} className="bg-zinc-900/50 rounded-lg p-2">
                      <p className="text-zinc-500 text-[9px]">{k}</p>
                      <p className={`font-bold mt-0.5 ${c}`}>{v}</p>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] font-mono text-red-400 mb-1 uppercase font-semibold">⚠ Key Risks</p>
                    {report.keyRisks?.map((r: string, j: number) => (
                      <p key={j} className="text-[10px] text-zinc-400 pl-2 border-l border-red-500/30 mb-1">{r}</p>
                    ))}
                  </div>
                  <div>
                    <p className="text-[10px] font-mono text-emerald-400 mb-1 uppercase font-semibold">💡 Opportunities</p>
                    {report.keyOpportunities?.map((o: string, j: number) => (
                      <p key={j} className="text-[10px] text-zinc-400 pl-2 border-l border-emerald-500/30 mb-1">{o}</p>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
