import React, { useState } from "react";
import { useQuery } from "../lib/convex";
import { api } from "../lib/convex";
import {
  TrendingUp, BarChart2, Zap, DollarSign, Wrench, Package,
  AlertTriangle, Info, Calendar
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, BarChart, Bar, LineChart, Line, ReferenceLine,
  ComposedChart, Scatter
} from "recharts";
import { motion } from "framer-motion";

export default function ForecastingEngine() {
  const [activeTab, setActiveTab] = useState<"generation" | "cost" | "revenue" | "maintenance">("generation");
  const [horizon, setHorizon] = useState<"12m" | "24m" | "36m">("24m");

  const allForecasts = useQuery(api.forecasting.list) ?? [];

  const getFiltered = (cat: string) => {
    const fc = allForecasts.filter((f: any) => f.category === cat);
    const limit = horizon === "12m" ? 12 : horizon === "24m" ? 24 : 36;
    return fc.slice(0, limit).map((f: any) => ({
      period: f.period,
      predicted: f.predicted,
      actual: f.actual,
      lower: f.lower,
      upper: f.upper,
    }));
  };

  const genData = getFiltered("generation");
  const costData = getFiltered("cost");
  const revData = getFiltered("revenue");

  // Synthetic maintenance forecast
  const maintenanceData = Array.from({ length: 12 }, (_, i) => ({
    period: `2026-${String(i + 1).padStart(2, "0")}`,
    predicted: 680000 + i * 12000 + Math.sin(i) * 40000,
    actual: i < 8 ? 650000 + i * 11000 + Math.random() * 50000 : undefined,
    budget: 750000,
  }));

  // Asset degradation curves
  const degradationData = Array.from({ length: 10 }, (_, i) => ({
    year: `Y${i + 1}`,
    solar: parseFloat((100 - i * 0.7 - Math.random() * 0.5).toFixed(1)),
    wind: parseFloat((100 - i * 1.1 - Math.random() * 0.8).toFixed(1)),
    bess: parseFloat((100 - i * 2.2 - Math.random() * 1.2).toFixed(1)),
  }));

  const COLORS = { predicted: "#10b981", actual: "#60a5fa", lower: "#6366f1", budget: "#f59e0b" };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-xs font-mono">
        <p className="text-zinc-300 font-bold mb-2">{label}</p>
        {payload.map((p: any, i: number) => (
          <div key={i} className="flex justify-between gap-4">
            <span style={{ color: p.color }}>{p.name}</span>
            <span className="text-white">{typeof p.value === "number" ? p.value.toLocaleString() : p.value}</span>
          </div>
        ))}
      </div>
    );
  };

  const tabs = [
    { id: "generation", label: "Energy Generation", icon: <Zap className="w-3.5 h-3.5" /> },
    { id: "cost", label: "OPEX Forecast", icon: <DollarSign className="w-3.5 h-3.5" /> },
    { id: "revenue", label: "Revenue Forecast", icon: <TrendingUp className="w-3.5 h-3.5" /> },
    { id: "maintenance", label: "Maintenance Cost", icon: <Wrench className="w-3.5 h-3.5" /> },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-900 pb-5 gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Forecasting Engine
            <span className="text-xs font-mono px-2 py-0.5 rounded border border-zinc-700 text-zinc-400 bg-slate-800/35">AI Predictive</span>
          </h2>
          <p className="text-xs text-zinc-500 font-mono">ML-POWERED GENERATION, COST, REVENUE, AND MAINTENANCE FORECASTING</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-zinc-950/40 p-1 rounded-lg border border-zinc-900/80 text-xs font-mono">
            {(["12m","24m","36m"] as const).map(h => (
              <button key={h} onClick={() => setHorizon(h)}
                className={`px-3 py-1.5 rounded-md transition-all ${horizon === h ? "bg-zinc-900 text-emerald-400 border border-emerald-500/20" : "text-zinc-400 border border-transparent"}`}>
                {h}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Model info badges */}
      <div className="flex flex-wrap gap-2">
        {[
          { model: "LSTM-v2.3", use: "Generation Forecasting", acc: "94.2%" },
          { model: "XGBoost-v1.8", use: "Cost Modeling", acc: "91.8%" },
          { model: "Prophet-v3.1", use: "Revenue Projection", acc: "93.5%" },
          { model: "Weibull-v2.0", use: "Equipment Degradation", acc: "88.7%" },
        ].map((m, i) => (
          <div key={i} className="flex items-center gap-2 bg-zinc-950/40 border border-zinc-900 rounded-lg px-3 py-2 text-[10px] font-mono">
            <span className="text-emerald-400 font-bold">{m.model}</span>
            <span className="text-zinc-500">|</span>
            <span className="text-zinc-400">{m.use}</span>
            <span className="text-zinc-500">|</span>
            <span className="text-sky-400">Acc: {m.acc}</span>
          </div>
        ))}
      </div>

      {/* Sub-tab nav */}
      <div className="flex flex-wrap gap-2 border-b border-zinc-900 pb-4">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-semibold transition-all ${activeTab === tab.id ? "bg-zinc-900 border border-emerald-500/20 text-emerald-400" : "text-zinc-400 border border-zinc-900 hover:text-zinc-200"}`}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* GENERATION */}
      {activeTab === "generation" && (
        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Predicted Next 12M", value: `${(genData.slice(0,12).reduce((s:number,f:any) => s + f.predicted, 0) / 1000).toFixed(0)} GWh` },
              { label: "Confidence Interval", value: "±12%" },
              { label: "Model Accuracy", value: "94.2%" },
            ].map((kpi, i) => (
              <div key={i} className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-4 text-center">
                <p className="text-[10px] text-zinc-500 font-mono uppercase">{kpi.label}</p>
                <p className="text-xl font-bold text-white mt-1">{kpi.value}</p>
              </div>
            ))}
          </div>

          <div className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-zinc-300 mb-4">Energy Generation Forecast (MWh) with Confidence Bands</h3>
            <ResponsiveContainer width="100%" height={320}>
              <ComposedChart data={genData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#18181b" />
                <XAxis dataKey="period" tick={{ fill: "#71717a", fontSize: 9 }} />
                <YAxis tick={{ fill: "#71717a", fontSize: 9 }} tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 10, color: "#71717a" }} />
                <Area type="monotone" dataKey="upper" fill="#10b98120" stroke="transparent" name="Upper Bound" />
                <Area type="monotone" dataKey="lower" fill="#10b98108" stroke="transparent" name="Lower Bound" />
                <Line type="monotone" dataKey="predicted" stroke="#10b981" strokeWidth={2.5} dot={false} name="Predicted" />
                <Line type="monotone" dataKey="actual" stroke="#60a5fa" strokeWidth={2} dot={false} name="Actual" strokeDasharray="0" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Spare Parts Demand forecast */}
          <div className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-zinc-300 mb-4">Top Spare Parts Demand Forecast — Next 12 Months</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono">
                <thead><tr className="border-b border-zinc-800 text-zinc-500 uppercase text-[10px]">
                  <th className="pb-2 text-left">Part Name</th><th className="pb-2 text-right">Q3 2026</th><th className="pb-2 text-right">Q4 2026</th><th className="pb-2 text-right">Q1 2027</th><th className="pb-2 text-right">Q2 2027</th><th className="pb-2 text-right">Trend</th>
                </tr></thead>
                <tbody>
                  {[
                    { name: "IGBT Power Module", q: [18, 22, 19, 25] },
                    { name: "Turbine Bearing Set", q: [8, 12, 10, 14] },
                    { name: "Solar Panel Inverter Fuse", q: [42, 48, 44, 52] },
                    { name: "BESS Battery Cell Module", q: [6, 10, 8, 15] },
                    { name: "Transformer Seal Kit", q: [15, 18, 16, 20] },
                  ].map((p, i) => {
                    const trend = p.q[3] > p.q[0] ? "↑" : "↓";
                    return (
                      <tr key={i} className="border-b border-zinc-900 hover:bg-zinc-900/10">
                        <td className="py-2 text-white font-semibold">{p.name}</td>
                        {p.q.map((v, j) => <td key={j} className="py-2 text-right text-zinc-300">{v} units</td>)}
                        <td className={`py-2 text-right font-bold ${trend === "↑" ? "text-amber-400" : "text-emerald-400"}`}>{trend}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* COST */}
      {activeTab === "cost" && (
        <div className="space-y-5">
          <div className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-zinc-300 mb-4">OPEX Forecast (USD) — {horizon} Horizon</h3>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={costData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#18181b" />
                <XAxis dataKey="period" tick={{ fill: "#71717a", fontSize: 9 }} />
                <YAxis tick={{ fill: "#71717a", fontSize: 9 }} tickFormatter={v => `$${(v/1000000).toFixed(1)}M`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 10, color: "#71717a" }} />
                <Bar dataKey="predicted" name="Predicted" fill="#6366f1" radius={[2,2,0,0]} />
                <Bar dataKey="actual" name="Actual" fill="#60a5fa" radius={[2,2,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* REVENUE */}
      {activeTab === "revenue" && (
        <div className="space-y-5">
          <div className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-zinc-300 mb-4">Revenue Projection (USD) — {horizon} Horizon</h3>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={revData}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="actGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#18181b" />
                <XAxis dataKey="period" tick={{ fill: "#71717a", fontSize: 9 }} />
                <YAxis tick={{ fill: "#71717a", fontSize: 9 }} tickFormatter={v => `$${(v/1000000).toFixed(1)}M`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 10, color: "#71717a" }} />
                <Area type="monotone" dataKey="predicted" stroke="#10b981" fill="url(#revGrad)" strokeWidth={2.5} name="Predicted" />
                <Area type="monotone" dataKey="actual" stroke="#60a5fa" fill="url(#actGrad)" strokeWidth={2} name="Actual" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* MAINTENANCE */}
      {activeTab === "maintenance" && (
        <div className="space-y-5">
          <div className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-zinc-300 mb-4">Maintenance Cost Forecast vs Budget (USD)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={maintenanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#18181b" />
                <XAxis dataKey="period" tick={{ fill: "#71717a", fontSize: 9 }} />
                <YAxis tick={{ fill: "#71717a", fontSize: 9 }} tickFormatter={v => `$${(v/1000).toFixed(0)}K`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 10, color: "#71717a" }} />
                <Bar dataKey="predicted" name="Predicted" fill="#f59e0b" radius={[2,2,0,0]} opacity={0.8} />
                <Bar dataKey="actual" name="Actual" fill="#10b981" radius={[2,2,0,0]} />
                <Line type="monotone" dataKey="budget" stroke="#ef4444" strokeDasharray="6 3" strokeWidth={1.5} name="Budget Cap" dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-zinc-300 mb-4">Asset Degradation Curves — Performance (%) vs. Years</h3>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={degradationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#18181b" />
                <XAxis dataKey="year" tick={{ fill: "#71717a", fontSize: 10 }} />
                <YAxis domain={[60, 105]} tick={{ fill: "#71717a", fontSize: 10 }} tickFormatter={v => `${v}%`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 10, color: "#71717a" }} />
                <ReferenceLine y={80} stroke="#ef444440" strokeDasharray="4 4" label={{ value: "Replace Threshold", fill: "#ef4444", fontSize: 9 }} />
                <Line type="monotone" dataKey="solar" stroke="#eab308" strokeWidth={2} dot={false} name="Solar Panels" />
                <Line type="monotone" dataKey="wind" stroke="#60a5fa" strokeWidth={2} dot={false} name="Wind Turbines" />
                <Line type="monotone" dataKey="bess" stroke="#10b981" strokeWidth={2} dot={false} name="Battery (BESS)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
