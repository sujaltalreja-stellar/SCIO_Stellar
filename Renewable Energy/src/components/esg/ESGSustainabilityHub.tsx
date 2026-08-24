import React, { useState } from "react";
import { useQuery } from "../../lib/convex";
import { api } from "../../lib/convex";
import {
  Leaf, TreePine, Droplets, Wind, BarChart3, Award, Shield,
  Users, TrendingUp, TrendingDown, CheckCircle, Globe, Recycle
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, BarChart, Bar, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, LineChart, Line, PieChart, Pie, Cell
} from "recharts";
import { motion } from "framer-motion";

const PIE_COLORS = ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b"];

export default function ESGSustainabilityHub() {
  const [activeTab, setActiveTab] = useState<"overview" | "carbon" | "scorecard" | "reports">("overview");
  const [selectedQuarter, setSelectedQuarter] = useState("2026-Q2");

  const metricsRaw = useQuery(api.esg.listSustainabilityMetrics, { limit: 20 }) ?? [];
  const esgReports = useQuery(api.esg.listESGReports) ?? [];

  // Aggregate metrics by period across all plants
  const periodMap: Record<string, { co2: number; mwh: number; rec: number; water: number; renewable: number }> = {};
  metricsRaw.forEach((m: any) => {
    if (!periodMap[m.period]) periodMap[m.period] = { co2: 0, mwh: 0, rec: 0, water: 0, renewable: 0 };
    periodMap[m.period].co2 += m.co2AvoidedTonnes;
    periodMap[m.period].mwh += m.mwhGenerated;
    periodMap[m.period].rec += m.recCertificates;
    periodMap[m.period].water += m.waterUsageLitres / 1000;
    periodMap[m.period].renewable += m.renewablePercent / 5;
  });
  const carbonData = Object.entries(periodMap).slice(-12).map(([period, v]) => ({
    period,
    co2Avoided: parseFloat(v.co2.toFixed(0)),
    mwh: parseFloat(v.mwh.toFixed(0)),
    rec: v.rec,
    renewable: parseFloat((v.renewable).toFixed(1)),
  }));

  const latestReport = esgReports[esgReports.length - 1] ?? {
    environmentScore: 88.4, socialScore: 82.1, governanceScore: 86.7, overallScore: 85.7,
    co2Avoided: 58200, safetyIncidents: 0, trainingHours: 2840, boardDiversity: 48.5, complianceRate: 99.1,
    highlights: ["Exceeded generation target by 8%", "Zero critical safety incidents", "Record ESG score 88.4"],
  };

  const scopeData = [
    { name: "Scope 1 (Direct)", value: 12.4, color: "#ef4444" },
    { name: "Scope 2 (Electricity)", value: 4.8, color: "#f97316" },
    { name: "Scope 3 (Value Chain)", value: 18.2, color: "#eab308" },
    { name: "CO₂ Avoided", value: 5740, color: "#10b981" },
  ];

  const radarData = [
    { subject: "Environment", value: latestReport.environmentScore },
    { subject: "Social", value: latestReport.socialScore },
    { subject: "Governance", value: latestReport.governanceScore },
    { subject: "Safety", value: 98 },
    { subject: "Compliance", value: latestReport.complianceRate },
    { subject: "Diversity", value: latestReport.boardDiversity },
  ];

  const initiatives = [
    { name: "Solar Panel Recycling Program", status: "active", progress: 72, target: "2026-Q4", impact: "High" },
    { name: "Water Footprint Reduction", status: "active", progress: 54, target: "2026-Q3", impact: "Medium" },
    { name: "Zero-Emission O&M Fleet", status: "planned", progress: 18, target: "2027-Q1", impact: "High" },
    { name: "Biodiversity Corridor Project", status: "active", progress: 38, target: "2027-Q2", impact: "Medium" },
    { name: "Community Solar for Local Grid", status: "completed", progress: 100, target: "2026-Q1", impact: "High" },
    { name: "Green Hydrogen Pilot (Gulf Coast)", status: "planned", progress: 8, target: "2027-Q3", impact: "Critical" },
  ];

  const impactColor: Record<string, string> = {
    Critical: "text-red-400", High: "text-emerald-400", Medium: "text-amber-400",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-900 pb-5 gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            ESG & Sustainability Hub
            <span className="text-xs font-mono px-2 py-0.5 rounded border border-zinc-700 text-zinc-400 bg-slate-800/35">Environmental</span>
          </h2>
          <p className="text-xs text-zinc-500 font-mono">CARBON ACCOUNTING, RENEWABLES CERTIFICATION, ESG SCORECARD & COMPLIANCE</p>
        </div>
        <div className="flex bg-zinc-950/40 p-1.5 rounded-xl border border-zinc-900/80 gap-1 text-xs font-mono font-semibold">
          {(["overview","carbon","scorecard","reports"] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-2 rounded-lg transition-all capitalize ${activeTab === tab ? "bg-zinc-900 border border-emerald-500/20 text-emerald-400" : "text-zinc-400 hover:text-zinc-200 border border-transparent"}`}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "CO₂ Avoided (Aug)", value: "5,740 t", icon: <Leaf className="w-4 h-4 text-emerald-400" />, color: "text-emerald-400", sub: "+8.2% MoM" },
          { label: "RECs Issued (YTD)", value: "432", icon: <Award className="w-4 h-4 text-sky-400" />, color: "text-sky-400", sub: "Renewable Energy Certs" },
          { label: "Renewable %", value: "97.4%", icon: <TreePine className="w-4 h-4 text-lime-400" />, color: "text-lime-400", sub: "Of total generation" },
          { label: "ESG Overall Score", value: "88.4", icon: <Shield className="w-4 h-4 text-violet-400" />, color: "text-violet-400", sub: "Platform record" },
        ].map((kpi, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] text-zinc-500 font-mono uppercase">{kpi.label}</p>
              {kpi.icon}
            </div>
            <h3 className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</h3>
            <p className="text-[10px] text-zinc-500 font-mono mt-1">{kpi.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-zinc-300 mb-4">CO₂ Avoided Trend (Tonnes)</h3>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={carbonData}>
                <defs>
                  <linearGradient id="co2Grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#18181b" />
                <XAxis dataKey="period" tick={{ fill: "#71717a", fontSize: 9 }} />
                <YAxis tick={{ fill: "#71717a", fontSize: 9 }} />
                <Tooltip contentStyle={{ background: "#09090b", border: "1px solid #27272a", borderRadius: 8, fontSize: 11 }} />
                <Area type="monotone" dataKey="co2Avoided" stroke="#10b981" fill="url(#co2Grad)" strokeWidth={2} name="CO₂ Avoided (t)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-zinc-300 mb-4">Sustainability Initiatives Tracker</h3>
            <div className="space-y-3 overflow-y-auto max-h-60">
              {initiatives.map((ini, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${ini.status === "completed" ? "bg-emerald-500" : ini.status === "active" ? "bg-sky-500" : "bg-zinc-500"}`} />
                      <span className="text-xs text-white font-medium">{ini.name}</span>
                    </div>
                    <span className={`text-[9px] font-bold font-mono ${impactColor[ini.impact]}`}>{ini.impact}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${ini.status === "completed" ? "bg-emerald-500" : ini.status === "active" ? "bg-sky-500" : "bg-zinc-600"}`}
                        style={{ width: `${ini.progress}%` }} />
                    </div>
                    <span className="text-[9px] font-mono text-zinc-500 w-8 text-right">{ini.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Scope Emissions */}
          <div className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-zinc-300 mb-4">Emission Scope Breakdown (Tonnes CO₂e/month)</h3>
            <div className="grid grid-cols-2 gap-4">
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={scopeData.slice(0,3)} cx="50%" cy="50%" innerRadius={35} outerRadius={60}
                    dataKey="value" paddingAngle={3}>
                    {scopeData.slice(0,3).map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#09090b", border: "1px solid #27272a", fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 font-mono text-xs flex flex-col justify-center">
                {scopeData.slice(0,3).map((s, i) => (
                  <div key={i} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
                      <span className="text-zinc-400 text-[10px]">{s.name}</span>
                    </div>
                    <span className="font-bold text-white">{s.value}t</span>
                  </div>
                ))}
                <div className="border-t border-zinc-800 pt-2 flex justify-between">
                  <span className="text-emerald-400 text-[10px]">CO₂ Avoided</span>
                  <span className="text-emerald-400 font-bold">5,740t</span>
                </div>
              </div>
            </div>
          </div>

          {/* REC Tracker */}
          <div className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-zinc-300 mb-3">Renewable Energy Certificates (RECs)</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={carbonData.slice(-8)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#18181b" />
                <XAxis dataKey="period" tick={{ fill: "#71717a", fontSize: 9 }} />
                <YAxis tick={{ fill: "#71717a", fontSize: 9 }} />
                <Tooltip contentStyle={{ background: "#09090b", border: "1px solid #27272a", borderRadius: 8, fontSize: 11 }} />
                <Bar dataKey="rec" fill="#3b82f6" radius={[3,3,0,0]} name="RECs Issued" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* SCORECARD TAB */}
      {activeTab === "scorecard" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-zinc-300 mb-4">ESG Radar Scorecard</h3>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#27272a" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "#71717a", fontSize: 10 }} />
                <Radar name="ESG Score" dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.15} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-4">
            <div className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-5">
              <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-zinc-300 mb-4">ESG Pillar Scores</h3>
              {[
                { label: "Environment", value: latestReport.environmentScore, color: "#10b981", icon: <Leaf className="w-4 h-4" /> },
                { label: "Social", value: latestReport.socialScore, color: "#3b82f6", icon: <Users className="w-4 h-4" /> },
                { label: "Governance", value: latestReport.governanceScore, color: "#8b5cf6", icon: <Shield className="w-4 h-4" /> },
              ].map((p, i) => (
                <div key={i} className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2" style={{ color: p.color }}>
                      {p.icon}<span className="text-xs font-semibold text-white">{p.label}</span>
                    </div>
                    <span className="text-sm font-bold" style={{ color: p.color }}>{p.value?.toFixed(1)}</span>
                  </div>
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div className="h-full rounded-full" initial={{ width: 0 }}
                      animate={{ width: `${p.value}%` }} transition={{ duration: 0.9, ease: "easeOut", delay: i * 0.1 }}
                      style={{ background: p.color }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-5">
              <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-zinc-300 mb-3">Key Metrics</h3>
              <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                {[
                  ["Safety Incidents", latestReport.safetyIncidents === 0 ? "✅ None" : latestReport.safetyIncidents, "text-emerald-400"],
                  ["Training Hours", latestReport.trainingHours?.toLocaleString(), "text-sky-400"],
                  ["Board Diversity", `${latestReport.boardDiversity?.toFixed(1)}%`, "text-violet-400"],
                  ["Compliance Rate", `${latestReport.complianceRate?.toFixed(1)}%`, "text-emerald-400"],
                ].map(([k, v, c]) => (
                  <div key={k as string} className="bg-zinc-900/50 rounded-lg p-2.5">
                    <p className="text-zinc-500 text-[10px]">{k}</p>
                    <p className={`font-bold mt-0.5 ${c}`}>{v}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CARBON TAB */}
      {activeTab === "carbon" && (
        <div className="space-y-5">
          <div className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-zinc-300 mb-4">36-Month Carbon Performance Dashboard</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={carbonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#18181b" />
                <XAxis dataKey="period" tick={{ fill: "#71717a", fontSize: 9 }} />
                <YAxis yAxisId="left" tick={{ fill: "#71717a", fontSize: 9 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: "#71717a", fontSize: 9 }} />
                <Tooltip contentStyle={{ background: "#09090b", border: "1px solid #27272a", borderRadius: 8, fontSize: 11 }} />
                <Legend wrapperStyle={{ fontSize: 10, color: "#71717a" }} />
                <Bar yAxisId="left" dataKey="co2Avoided" fill="#10b981" radius={[2,2,0,0]} name="CO₂ Avoided (t)" opacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* REPORTS TAB */}
      {activeTab === "reports" && (
        <div className="space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-zinc-300">Quarterly ESG Performance Reports</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {esgReports.slice(-4).reverse().map((report: any, i: number) => (
              <motion.div key={report._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                className="bg-zinc-950/30 border border-zinc-900 rounded-xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500">{report.period}</span>
                    <h4 className="text-sm font-bold text-white">ESG Report — {report.period}</h4>
                  </div>
                  <span className="text-lg font-bold text-emerald-400">{report.overallScore?.toFixed(1)}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-3 text-[10px] font-mono">
                  {[
                    ["E-Score", report.environmentScore?.toFixed(0), "text-emerald-400"],
                    ["S-Score", report.socialScore?.toFixed(0), "text-sky-400"],
                    ["G-Score", report.governanceScore?.toFixed(0), "text-violet-400"],
                  ].map(([k, v, c]) => (
                    <div key={k as string} className="bg-zinc-900/50 rounded p-1.5 text-center">
                      <p className="text-zinc-500">{k}</p>
                      <p className={`font-bold ${c}`}>{v}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-1">
                  {report.highlights?.map((h: string, j: number) => (
                    <div key={j} className="flex items-start gap-1.5">
                      <CheckCircle className="w-3 h-3 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span className="text-[10px] text-zinc-400">{h}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
