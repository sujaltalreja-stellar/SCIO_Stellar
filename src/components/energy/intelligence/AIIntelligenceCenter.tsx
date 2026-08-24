import React, { useState } from "react";
import { useQuery } from "../lib/convex";
import { api } from "../lib/convex";
import { phase4Data } from "../../../config/energyMockDb";
import {
  Sparkles, AlertTriangle, TrendingDown, Lightbulb, Shield,
  ChevronRight, Activity, Brain, Zap, Target, ArrowUpRight,
  ArrowDownRight, Filter, RefreshCw, Clock
} from "lucide-react";
import {
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar,
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
  AreaChart, Area
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";

export default function AIIntelligenceCenter() {
  const [activeTab, setActiveTab] = useState<"overview" | "anomalies" | "recommendations" | "risk">("overview");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const summary = useQuery(api.intelligence.getInsightsSummary) ?? {};
  const insights = summary.topInsights ?? [];
  const optimizations = summary.optimizations ?? phase4Data.optimizationRecommendations;

  const riskMatrixData = [
    { name: "Battery Thermal Failure", x: 72, y: 88, plant: "Gulf Coast BESS", fill: "#ef4444" },
    { name: "Blade Erosion", x: 58, y: 68, plant: "High Plains Wind", fill: "#f97316" },
    { name: "Inverter Degradation", x: 45, y: 55, plant: "Mojave Solar", fill: "#eab308" },
    { name: "Grid Frequency Deviation", x: 30, y: 75, plant: "Panhandle Wind", fill: "#f97316" },
    { name: "Transformer Oil Leak", x: 25, y: 40, plant: "Sonora Solar", fill: "#eab308" },
    { name: "Sensor Drift", x: 20, y: 25, plant: "All Plants", fill: "#22c55e" },
    { name: "Weather Curtailment", x: 65, y: 35, plant: "Mojave Solar", fill: "#eab308" },
    { name: "BESS Capacity Fade", x: 55, y: 60, plant: "Gulf Coast BESS", fill: "#f97316" },
  ];

  const radarData = [
    { subject: "Generation", A: 88, fullMark: 100 },
    { subject: "Availability", A: 94, fullMark: 100 },
    { subject: "Maintenance", A: 76, fullMark: 100 },
    { subject: "Procurement", A: 82, fullMark: 100 },
    { subject: "Safety", A: 96, fullMark: 100 },
    { subject: "ESG", A: 88, fullMark: 100 },
  ];

  const healthTrend = Array.from({ length: 12 }, (_, i) => ({
    month: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i],
    score: parseFloat((84 + i * 0.5 + Math.sin(i) * 2).toFixed(1)),
  }));

  const insightTypeColor: Record<string, string> = {
    anomaly: "text-red-400 bg-red-500/10 border-red-500/20",
    risk: "text-orange-400 bg-orange-500/10 border-orange-500/20",
    recommendation: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    prediction: "text-sky-400 bg-sky-500/10 border-sky-500/20",
  };
  const insightTypeIcon: Record<string, React.ReactNode> = {
    anomaly: <AlertTriangle className="w-4 h-4" />,
    risk: <Shield className="w-4 h-4" />,
    recommendation: <Lightbulb className="w-4 h-4" />,
    prediction: <Brain className="w-4 h-4" />,
  };

  const filteredOptimizations = categoryFilter === "all"
    ? optimizations
    : optimizations.filter((o: any) => o.category === categoryFilter);

  const effortColor = { low: "text-emerald-400", medium: "text-amber-400", high: "text-red-400" };
  const impactColor = { low: "text-zinc-400", medium: "text-sky-400", high: "text-emerald-400" };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-900 pb-5 gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            AI Intelligence Center
            <span className="text-xs font-mono px-2 py-0.5 rounded border border-zinc-700 text-zinc-400 bg-slate-800/35">Phase 4</span>
          </h2>
          <p className="text-xs text-zinc-500 font-mono">ENTERPRISE AI ANOMALY DETECTION, RISK ANALYSIS, AND OPTIMIZATION ENGINE</p>
        </div>
        <div className="flex bg-zinc-950/40 p-1.5 rounded-xl border border-zinc-900/80 gap-1 text-xs font-mono font-semibold">
          {(["overview","anomalies","recommendations","risk"] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-2 rounded-lg transition-all capitalize ${activeTab === tab ? "bg-zinc-900 border border-emerald-500/20 text-emerald-400 font-bold" : "text-zinc-400 hover:text-zinc-200 border border-transparent"}`}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Banner */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Total AI Insights", value: summary.total ?? 24, icon: <Sparkles className="w-4 h-4 text-violet-400" />, color: "text-violet-400" },
          { label: "Active Anomalies", value: summary.anomalies ?? 6, icon: <AlertTriangle className="w-4 h-4 text-red-400" />, color: "text-red-400" },
          { label: "Risk Events", value: summary.risks ?? 4, icon: <Shield className="w-4 h-4 text-orange-400" />, color: "text-orange-400" },
          { label: "Recommendations", value: summary.recommendations ?? 8, icon: <Lightbulb className="w-4 h-4 text-emerald-400" />, color: "text-emerald-400" },
          { label: "Predictions", value: summary.predictions ?? 6, icon: <Brain className="w-4 h-4 text-sky-400" />, color: "text-sky-400" },
        ].map((kpi, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-zinc-500 font-mono uppercase">{kpi.label}</p>
              <h3 className={`text-2xl font-bold mt-0.5 ${kpi.color}`}>{kpi.value}</h3>
            </div>
            {kpi.icon}
          </motion.div>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-zinc-300">Top AI Insights Feed</h3>
            <div className="space-y-2.5">
              {insights.slice(0, 6).map((ins: any, i: number) => (
                <motion.div key={ins._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                  className="bg-zinc-950/30 border border-zinc-900 rounded-xl p-4 flex items-start gap-4">
                  <span className={`p-2 rounded-lg border ${insightTypeColor[ins.type]}`}>
                    {insightTypeIcon[ins.type]}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-bold text-white truncate">{ins.title}</h4>
                      <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded border ${insightTypeColor[ins.type]} whitespace-nowrap`}>{ins.type}</span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{ins.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-[10px] font-mono text-zinc-500">
                      <span className="flex items-center gap-1"><Target className="w-3 h-3" /> Confidence: {ins.confidence?.toFixed(0)}%</span>
                      {ins.failureProbability && <span className="flex items-center gap-1 text-red-400"><AlertTriangle className="w-3 h-3" /> Failure P: {ins.failureProbability?.toFixed(0)}%</span>}
                      {ins.remainingUsefulLife && <span className="flex items-center gap-1 text-amber-400"><Clock className="w-3 h-3" /> RUL: {ins.remainingUsefulLife?.toFixed(0)} days</span>}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-5">
              <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-zinc-300 mb-4">Fleet Health Radar</h3>
              <ResponsiveContainer width="100%" height={200}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#27272a" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: "#71717a", fontSize: 10 }} />
                  <Radar name="Health" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.15} strokeWidth={1.5} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-5">
              <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-zinc-300 mb-3">Health Score Trend</h3>
              <ResponsiveContainer width="100%" height={110}>
                <AreaChart data={healthTrend}>
                  <defs>
                    <linearGradient id="healthGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#18181b" />
                  <XAxis dataKey="month" tick={{ fill: "#71717a", fontSize: 9 }} />
                  <YAxis domain={[80, 95]} tick={{ fill: "#71717a", fontSize: 9 }} />
                  <Tooltip contentStyle={{ background: "#09090b", border: "1px solid #27272a", borderRadius: 8, fontSize: 11 }} />
                  <Area type="monotone" dataKey="score" stroke="#10b981" fill="url(#healthGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* RISK MATRIX TAB */}
      {activeTab === "risk" && (
        <div className="space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-zinc-300">Operational Risk Matrix — Likelihood vs. Impact</h3>
          <div className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-5">
            <div className="mb-2 flex gap-4 text-[10px] font-mono text-zinc-500">
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-red-500" /> Critical Risk</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-orange-500" /> High Risk</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-yellow-500" /> Medium Risk</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Low Risk</span>
            </div>
            <ResponsiveContainer width="100%" height={340}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#18181b" />
                <XAxis type="number" dataKey="x" name="Likelihood %" domain={[0, 100]}
                  label={{ value: "Likelihood (%)", position: "insideBottom", offset: -5, fill: "#71717a", fontSize: 10 }}
                  tick={{ fill: "#71717a", fontSize: 10 }} />
                <YAxis type="number" dataKey="y" name="Impact Score" domain={[0, 100]}
                  label={{ value: "Impact Score", angle: -90, position: "insideLeft", fill: "#71717a", fontSize: 10 }}
                  tick={{ fill: "#71717a", fontSize: 10 }} />
                <Tooltip cursor={{ strokeDasharray: "3 3" }}
                  contentStyle={{ background: "#09090b", border: "1px solid #27272a", borderRadius: 8, fontSize: 11 }}
                  formatter={(value, name, props) => [value, props?.payload?.name ?? name]} />
                <Scatter name="Risks" data={riskMatrixData}>
                  {riskMatrixData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {riskMatrixData.map((risk, i) => (
              <div key={i} className="bg-zinc-950/30 border border-zinc-900 rounded-xl p-4 flex items-center gap-3">
                <span className="h-3 w-3 rounded-full flex-shrink-0" style={{ background: risk.fill }} />
                <div>
                  <h4 className="text-sm font-bold text-white">{risk.name}</h4>
                  <p className="text-[10px] text-zinc-500 font-mono">{risk.plant} · Likelihood: {risk.x}% · Impact: {risk.y}/100</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RECOMMENDATIONS TAB */}
      {activeTab === "recommendations" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-zinc-300">AI Optimization Recommendations</h3>
            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs rounded-lg px-3 py-1.5 font-mono">
              {["all","maintenance","procurement","energy","workforce","financial","sustainability"].map(c => (
                <option key={c} value={c}>{c === "all" ? "All Categories" : c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>
          <div className="space-y-3">
            {filteredOptimizations.map((rec: any, i: number) => (
              <motion.div key={rec._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-zinc-950/30 border border-zinc-900 rounded-xl p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">{rec.category}</span>
                      <span className="text-[9px] font-mono text-zinc-500">Priority: {rec.priority}/10</span>
                    </div>
                    <h4 className="font-bold text-white text-sm">{rec.title}</h4>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{rec.description}</p>
                    <div className="flex gap-4 mt-2 text-[10px] font-mono">
                      <span>Effort: <span className={effortColor[rec.effort as keyof typeof effortColor]}>{rec.effort}</span></span>
                      <span>Impact: <span className={impactColor[rec.impact as keyof typeof impactColor]}>{rec.impact}</span></span>
                      <span>Status: <span className={rec.status === "implemented" ? "text-emerald-400" : rec.status === "in_progress" ? "text-sky-400" : "text-zinc-400"}>{rec.status.replace("_"," ")}</span></span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[10px] text-zinc-500 font-mono">Est. Saving</p>
                    <p className="text-lg font-bold text-emerald-400">${(rec.estimatedSaving / 1000).toFixed(0)}K</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-400 font-mono">Total Potential Annual Savings</p>
              <p className="text-2xl font-bold text-emerald-400">
                ${(filteredOptimizations.reduce((s: number, r: any) => s + r.estimatedSaving, 0) / 1000).toFixed(0)}K
              </p>
            </div>
            <ArrowUpRight className="w-8 h-8 text-emerald-400 opacity-60" />
          </div>
        </div>
      )}

      {/* ANOMALIES TAB */}
      {activeTab === "anomalies" && (
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-zinc-300">Active Anomaly Detection Log</h3>
          {insights.filter((i: any) => i.type === "anomaly" || i.type === "risk").map((ins: any, i: number) => (
            <motion.div key={ins._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
              className="bg-zinc-950/30 border border-zinc-900 rounded-xl p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded border ${insightTypeColor[ins.type]}`}>{ins.type}</span>
                  <h4 className="text-sm font-bold text-white">{ins.title}</h4>
                </div>
                <p className="text-xs text-zinc-400 mt-1">{ins.description}</p>
                {ins.rootCauseAnalysis && <p className="text-[10px] text-zinc-500 font-mono mt-2 italic">Root Cause: {ins.rootCauseAnalysis}</p>}
              </div>
              <div className="space-y-2 font-mono text-[11px]">
                <div className="flex justify-between"><span className="text-zinc-500">Confidence</span><span className="text-white font-bold">{ins.confidence?.toFixed(0)}%</span></div>
                {ins.failureProbability && <div className="flex justify-between"><span className="text-zinc-500">Failure P.</span><span className="text-red-400 font-bold">{ins.failureProbability?.toFixed(0)}%</span></div>}
                {ins.remainingUsefulLife && <div className="flex justify-between"><span className="text-zinc-500">RUL</span><span className="text-amber-400 font-bold">{ins.remainingUsefulLife?.toFixed(0)} days</span></div>}
              </div>
              <div className="flex items-center">
                <div className="w-full">
                  <div className="flex justify-between text-[10px] font-mono text-zinc-500 mb-1">
                    <span>Risk Score</span><span>{ins.riskScore?.toFixed(0) ?? "N/A"}%</span>
                  </div>
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${(ins.riskScore ?? 0) > 70 ? "bg-red-500" : (ins.riskScore ?? 0) > 40 ? "bg-orange-500" : "bg-emerald-500"}`}
                      style={{ width: `${ins.riskScore ?? 50}%` }} />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          {insights.filter((i: any) => i.type === "anomaly" || i.type === "risk").length === 0 && (
            <div className="text-center py-12 text-zinc-500 font-mono text-sm">✅ No anomalies currently detected across all assets</div>
          )}
        </div>
      )}
    </div>
  );
}
