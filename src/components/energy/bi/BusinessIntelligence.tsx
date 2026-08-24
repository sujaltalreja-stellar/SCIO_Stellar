import React, { useState } from "react";
import { useQuery } from "../lib/convex";
import { api } from "../lib/convex";
import {
  PieChart, BarChart3, TrendingUp, DollarSign, Package, Wrench,
  Zap, ArrowUpRight, ArrowDownRight, Activity, Globe
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, BarChart, Bar, PieChart as RePieChart, Pie, Cell,
  LineChart, Line, ComposedChart, Scatter, ScatterChart
} from "recharts";
import { motion } from "framer-motion";

const PIE_COLORS = ["#10b981","#3b82f6","#8b5cf6","#f59e0b","#f43f5e","#06b6d4"];

export default function BusinessIntelligence() {
  const [activeTab, setActiveTab] = useState<"executive" | "financial" | "procurement" | "maintenance" | "energy">("executive");

  const biData = useQuery(api.bi.getAnalyticsSummary) ?? {};
  const kpis: any[] = biData.monthlyKPIs ?? [];
  const latest = biData.latest ?? {};
  const analytics: any[] = biData.portfolioAnalytics ?? [];

  const financialData = kpis.map((k: any) => ({
    period: k.period,
    revenue: parseFloat((k.revenueUSD / 1e6).toFixed(2)),
    opex: parseFloat((k.opexUSD / 1e6).toFixed(2)),
    ebitda: parseFloat((k.ebitda / 1e6).toFixed(2)),
    maintenance: parseFloat((k.maintenanceCostUSD / 1e6).toFixed(2)),
  }));

  const procurementSpend = [
    { category: "Solar Components", spend: 2840000 },
    { category: "Wind Parts", spend: 1920000 },
    { category: "BESS Equipment", spend: 1580000 },
    { category: "Electrical", spend: 980000 },
    { category: "Logistics", spend: 640000 },
    { category: "Services", spend: 420000 },
  ];

  const maintenanceTypes = [
    { name: "Preventive", value: 48 },
    { name: "Corrective", value: 28 },
    { name: "Predictive", value: 18 },
    { name: "Emergency", value: 6 },
  ];

  const energyMix = [
    { name: "Solar PV", value: 52 },
    { name: "Wind", value: 34 },
    { name: "BESS Discharge", value: 14 },
  ];

  const capacityData = kpis.map((k: any) => ({
    period: k.period,
    capacity: k.totalCapacityMW,
    generation: parseFloat((k.totalGenerationMWh / 1000).toFixed(1)),
    capacityFactor: k.capacityFactor,
    uptime: k.uptime,
  }));

  const vendorSpendData = [
    { vendor: "SunPower Corp", spend: 1.24, poCount: 8, onTime: 96 },
    { vendor: "Vestas Wind", spend: 0.98, poCount: 6, onTime: 89 },
    { vendor: "LG Energy Sol.", spend: 0.74, poCount: 5, onTime: 94 },
    { vendor: "ABB Group", spend: 0.52, poCount: 7, onTime: 91 },
    { vendor: "Siemens Energy", spend: 0.41, poCount: 4, onTime: 98 },
  ];

  const tabs = [
    { id: "executive", label: "Executive Dashboard", icon: <Activity className="w-3.5 h-3.5" /> },
    { id: "financial", label: "Financial Analytics", icon: <DollarSign className="w-3.5 h-3.5" /> },
    { id: "procurement", label: "Procurement Analytics", icon: <Package className="w-3.5 h-3.5" /> },
    { id: "maintenance", label: "Maintenance Analytics", icon: <Wrench className="w-3.5 h-3.5" /> },
    { id: "energy", label: "Energy Analytics", icon: <Zap className="w-3.5 h-3.5" /> },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-900 pb-5 gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Business Intelligence
            <span className="text-xs font-mono px-2 py-0.5 rounded border border-zinc-700 text-zinc-400 bg-slate-800/35">BI Suite</span>
          </h2>
          <p className="text-xs text-zinc-500 font-mono">CROSS-MODULE ANALYTICS, DRILL-DOWN BI, FINANCIAL & OPERATIONAL INTELLIGENCE</p>
        </div>
      </div>

      {/* Tab nav */}
      <div className="flex flex-wrap gap-2 border-b border-zinc-900 pb-4">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-semibold transition-all ${activeTab === tab.id ? "bg-zinc-900 border border-emerald-500/20 text-emerald-400" : "text-zinc-400 border border-zinc-900 hover:text-zinc-200"}`}>
            {tab.icon}{tab.label}
          </button>
        ))}
      </div>

      {/* EXECUTIVE TAB */}
      {activeTab === "executive" && (
        <div className="space-y-5">
          {/* Top KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "YoY Revenue Growth", value: `+${biData.yoyRevenueGrowth ?? 11.2}%`, color: "text-emerald-400", arrow: "up" },
              { label: "YoY Generation Growth", value: `+${biData.yoyGenerationGrowth ?? 8.4}%`, color: "text-sky-400", arrow: "up" },
              { label: "Fleet Uptime", value: `${latest.uptime?.toFixed(1) ?? "97.4"}%`, color: "text-emerald-400", arrow: "up" },
              { label: "EBITDA Margin", value: `${latest.revenueUSD ? ((latest.ebitda/latest.revenueUSD)*100).toFixed(1) : "55.4"}%`, color: "text-violet-400", arrow: "up" },
            ].map((kpi, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.07 }}
                className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-4">
                <p className="text-[10px] text-zinc-500 font-mono uppercase">{kpi.label}</p>
                <div className="flex items-center justify-between mt-1">
                  <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
                  <ArrowUpRight className={`w-4 h-4 ${kpi.color}`} />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Main Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-5">
              <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-zinc-300 mb-4">12-Month Revenue Waterfall ($M)</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={financialData.slice(-12)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#18181b" />
                  <XAxis dataKey="period" tick={{ fill: "#71717a", fontSize: 9 }} />
                  <YAxis tick={{ fill: "#71717a", fontSize: 9 }} tickFormatter={v => `$${v}M`} />
                  <Tooltip contentStyle={{ background: "#09090b", border: "1px solid #27272a", borderRadius: 8, fontSize: 11 }} />
                  <Legend wrapperStyle={{ fontSize: 10, color: "#71717a" }} />
                  <Bar dataKey="revenue" name="Revenue" fill="#10b981" radius={[2,2,0,0]} />
                  <Bar dataKey="opex" name="OPEX" fill="#f59e0b" radius={[2,2,0,0]} />
                  <Bar dataKey="ebitda" name="EBITDA" fill="#3b82f6" radius={[2,2,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-5">
              <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-zinc-300 mb-4">Capacity Factor Trend (%)</h3>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={capacityData.slice(-12)}>
                  <defs>
                    <linearGradient id="cfGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#18181b" />
                  <XAxis dataKey="period" tick={{ fill: "#71717a", fontSize: 9 }} />
                  <YAxis tick={{ fill: "#71717a", fontSize: 9 }} tickFormatter={v => `${v}%`} />
                  <Tooltip contentStyle={{ background: "#09090b", border: "1px solid #27272a", borderRadius: 8, fontSize: 11 }} />
                  <Area type="monotone" dataKey="capacityFactor" stroke="#3b82f6" fill="url(#cfGrad)" strokeWidth={2.5} name="Capacity Factor" />
                  <Area type="monotone" dataKey="uptime" stroke="#10b981" fill="none" strokeWidth={1.5} strokeDasharray="4 2" name="Uptime %" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* FINANCIAL TAB */}
      {activeTab === "financial" && (
        <div className="space-y-5">
          <div className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-zinc-300 mb-4">Full Financial Timeline — Revenue, OPEX, EBITDA, Maintenance ($M)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={financialData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#18181b" />
                <XAxis dataKey="period" tick={{ fill: "#71717a", fontSize: 9 }} />
                <YAxis tick={{ fill: "#71717a", fontSize: 9 }} tickFormatter={v => `$${v}M`} />
                <Tooltip contentStyle={{ background: "#09090b", border: "1px solid #27272a", borderRadius: 8, fontSize: 11 }} />
                <Legend wrapperStyle={{ fontSize: 10, color: "#71717a" }} />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="#10b98112" strokeWidth={2} name="Revenue" />
                <Area type="monotone" dataKey="ebitda" stroke="#3b82f6" fill="#3b82f612" strokeWidth={2} name="EBITDA" />
                <Bar dataKey="opex" fill="#f59e0b" opacity={0.7} radius={[1,1,0,0]} name="OPEX" />
                <Line type="monotone" dataKey="maintenance" stroke="#f43f5e" strokeWidth={1.5} strokeDasharray="4 2" dot={false} name="Maintenance" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Budget Variance */}
          <div className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-zinc-300 mb-4">Budget Variance Analysis — Current Month</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono">
                <thead><tr className="border-b border-zinc-800 text-zinc-500 uppercase text-[10px]">
                  <th className="pb-2 text-left">Category</th><th className="pb-2 text-right">Budget</th><th className="pb-2 text-right">Actual</th><th className="pb-2 text-right">Variance</th><th className="pb-2 text-right">Status</th>
                </tr></thead>
                <tbody>
                  {[
                    { cat: "O&M Labor", budget: 1200000, actual: 1148000 },
                    { cat: "Spare Parts", budget: 820000, actual: 894000 },
                    { cat: "Contractor Services", budget: 640000, actual: 612000 },
                    { cat: "Insurance & Compliance", budget: 380000, actual: 380000 },
                    { cat: "Grid Connection Fees", budget: 290000, actual: 287000 },
                    { cat: "Software & IT", budget: 180000, actual: 162000 },
                  ].map((row, i) => {
                    const variance = row.actual - row.budget;
                    const pct = ((variance / row.budget) * 100).toFixed(1);
                    const over = variance > 0;
                    return (
                      <tr key={i} className="border-b border-zinc-900 hover:bg-zinc-900/10">
                        <td className="py-2.5 text-white font-semibold">{row.cat}</td>
                        <td className="py-2.5 text-right text-zinc-300">${(row.budget/1000).toFixed(0)}K</td>
                        <td className="py-2.5 text-right text-zinc-300">${(row.actual/1000).toFixed(0)}K</td>
                        <td className={`py-2.5 text-right font-bold ${over ? "text-red-400" : "text-emerald-400"}`}>
                          {over ? "+" : ""}{(variance/1000).toFixed(0)}K ({over ? "+" : ""}{pct}%)
                        </td>
                        <td className="py-2.5 text-right">
                          <span className={`text-[9px] px-2 py-0.5 rounded ${over ? "bg-red-500/10 text-red-400" : "bg-emerald-500/10 text-emerald-400"}`}>
                            {over ? "OVER" : "UNDER"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* PROCUREMENT TAB */}
      {activeTab === "procurement" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-zinc-300 mb-4">Spend by Category (YTD)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <RePieChart>
                <Pie data={procurementSpend} cx="50%" cy="50%" innerRadius={55} outerRadius={90}
                  dataKey="spend" paddingAngle={3} label={({ name, percent }) => `${name.split(" ")[0]}: ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}>
                  {procurementSpend.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#09090b", border: "1px solid #27272a", fontSize: 11 }}
                  formatter={(v: any) => [`$${(v/1000000).toFixed(2)}M`, "Spend"]} />
              </RePieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-zinc-300 mb-4">Vendor Performance — Spend vs On-Time Delivery</h3>
            <div className="space-y-3">
              {vendorSpendData.map((v, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-28 flex-shrink-0 text-xs text-zinc-300 font-medium truncate">{v.vendor}</div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${v.onTime}%` }} />
                      </div>
                      <span className="text-[9px] font-mono text-emerald-400 w-8 text-right">{v.onTime}%</span>
                    </div>
                  </div>
                  <div className="text-xs font-mono text-sky-400 w-12 text-right">${v.spend.toFixed(2)}M</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MAINTENANCE TAB */}
      {activeTab === "maintenance" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-zinc-300 mb-4">Work Order Type Distribution</h3>
            <ResponsiveContainer width="100%" height={240}>
              <RePieChart>
                <Pie data={maintenanceTypes} cx="50%" cy="50%" innerRadius={50} outerRadius={85}
                  dataKey="value" paddingAngle={4} label={({ name, value }) => `${name}: ${value}%`} labelLine={false}>
                  {maintenanceTypes.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#09090b", border: "1px solid #27272a", fontSize: 11 }} />
              </RePieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-zinc-300 mb-4">MTTR & MTBF Trend (12 Months)</h3>
            <ResponsiveContainer width="100%" height={240}>
              <ComposedChart data={kpis.slice(-12)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#18181b" />
                <XAxis dataKey="period" tick={{ fill: "#71717a", fontSize: 9 }} />
                <YAxis yAxisId="left" tick={{ fill: "#71717a", fontSize: 9 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: "#71717a", fontSize: 9 }} />
                <Tooltip contentStyle={{ background: "#09090b", border: "1px solid #27272a", borderRadius: 8, fontSize: 11 }} />
                <Legend wrapperStyle={{ fontSize: 10, color: "#71717a" }} />
                <Bar yAxisId="right" dataKey="mttr" fill="#f59e0b" radius={[2,2,0,0]} name="MTTR (hrs)" opacity={0.7} />
                <Line yAxisId="left" type="monotone" dataKey="mtbf" stroke="#10b981" strokeWidth={2} dot={false} name="MTBF (hrs)" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ENERGY TAB */}
      {activeTab === "energy" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-zinc-300 mb-4">Generation Mix (Current Month)</h3>
            <ResponsiveContainer width="100%" height={240}>
              <RePieChart>
                <Pie data={energyMix} cx="50%" cy="50%" innerRadius={55} outerRadius={90}
                  dataKey="value" paddingAngle={4} label={({ name, value }) => `${name}: ${value}%`} labelLine={false}>
                  {energyMix.map((_, i) => <Cell key={i} fill={["#eab308","#3b82f6","#10b981"][i]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#09090b", border: "1px solid #27272a", fontSize: 11 }} />
              </RePieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-zinc-300 mb-4">Total Generation vs Capacity (GWh / MW)</h3>
            <ResponsiveContainer width="100%" height={240}>
              <ComposedChart data={capacityData.slice(-12)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#18181b" />
                <XAxis dataKey="period" tick={{ fill: "#71717a", fontSize: 9 }} />
                <YAxis yAxisId="left" tick={{ fill: "#71717a", fontSize: 9 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: "#71717a", fontSize: 9 }} />
                <Tooltip contentStyle={{ background: "#09090b", border: "1px solid #27272a", borderRadius: 8, fontSize: 11 }} />
                <Legend wrapperStyle={{ fontSize: 10, color: "#71717a" }} />
                <Bar yAxisId="left" dataKey="generation" fill="#10b981" radius={[2,2,0,0]} name="Generation (GWh)" opacity={0.8} />
                <Line yAxisId="right" type="monotone" dataKey="capacity" stroke="#f59e0b" strokeWidth={2} dot={false} name="Capacity (MW)" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
