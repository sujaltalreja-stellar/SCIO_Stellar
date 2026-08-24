import React from "react";
import { useQuery } from "../../lib/convex";
import { api } from "../../lib/convex";
import { motion } from "framer-motion";
import {
  Sun,
  Wind,
  Battery,
  TrendingUp,
  Leaf,
  AlertTriangle,
  Heart,
  ChevronRight,
  ShieldAlert,
  Settings,
  Layers
} from "lucide-react";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

interface DashboardOverviewProps {
  onSelectPlant: (plantId: string) => void;
}

export default function DashboardOverview({ onSelectPlant }: DashboardOverviewProps) {
  const stats = useQuery(api.plants.getPortfolioStats);
  const plants = useQuery(api.plants.list) ?? [];
  const chartData = useQuery(api.metrics.getHistoricalPortfolioMetrics, { days: 14 }) ?? [];

  // Filter top & bottom performing plants by capacity factor/current power output
  const sortedByGeneration = [...plants].sort((a: any, b: any) => b.currentPower - a.currentPower);
  const topPlants = sortedByGeneration.slice(0, 5);
  const strugglingPlants = [...plants]
    .filter((p: any) => p.status !== "online" || p.healthScore < 90)
    .sort((a: any, b: any) => a.healthScore - b.healthScore)
    .slice(0, 5);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Executive Portfolio Overview</h2>
          <p className="text-xs text-zinc-500 font-mono">SCADA DATA INTEGRITY: NOMINAL</p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* TOTAL CAPACITY */}
        <motion.div variants={itemVariants} className="glass-panel p-4.5 rounded-xl flex flex-col justify-between min-h-[120px]">
          <div className="flex items-start justify-between">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">Portfolio capacity</span>
            <Layers className="h-4.5 w-4.5 text-zinc-500" />
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold font-mono">
              {stats?.totalCapacity ? (stats.totalCapacity / 1000).toFixed(2) : "0.00"}
            </h3>
            <p className="text-[10px] text-zinc-500 font-mono mt-1">GIGAWATTS INSTALLED</p>
          </div>
        </motion.div>

        {/* ACTIVE PLANTS STATUS */}
        <motion.div variants={itemVariants} className="glass-panel p-4.5 rounded-xl flex flex-col justify-between min-h-[120px]">
          <div className="flex items-start justify-between">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">Active Plants</span>
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse mt-1"></span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold font-mono">
              {stats?.onlineCount ?? 0}
              <span className="text-zinc-500 text-sm font-normal"> / {stats?.totalPlants ?? 0}</span>
            </h3>
            <div className="flex items-center space-x-3 text-[10px] font-mono text-zinc-500 mt-1">
              <span className="text-emerald-500">{stats?.onlineCount ?? 0} ON</span>
              <span className="text-yellow-500">{stats?.maintenanceCount ?? 0} MT</span>
              <span className="text-red-500">{stats?.offlineCount ?? 0} OFF</span>
            </div>
          </div>
        </motion.div>

        {/* LIVE GENERATION */}
        <motion.div variants={itemVariants} className="glass-panel p-4.5 rounded-xl flex flex-col justify-between min-h-[120px] digital-glow-bess">
          <div className="flex items-start justify-between">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">Current generation</span>
            <TrendingUp className="h-4.5 w-4.5 text-emerald-500 animate-bounce" />
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold font-mono text-emerald-400">
              {stats?.totalLivePower ? stats.totalLivePower.toLocaleString(undefined, { maximumFractionDigits: 1 }) : "0.0"}
            </h3>
            <p className="text-[10px] text-emerald-500/80 font-mono mt-1">
              MW LIVE OUTPUT ({stats?.totalLivePower && stats?.totalCapacity 
                ? ((stats.totalLivePower / stats.totalCapacity) * 100).toFixed(1)
                : "0.0"}% UTILITY)
            </p>
          </div>
        </motion.div>

        {/* TODAY PRODUCTION */}
        <motion.div variants={itemVariants} className="glass-panel p-4.5 rounded-xl flex flex-col justify-between min-h-[120px]">
          <div className="flex items-start justify-between">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">Today's energy yield</span>
            <Sun className="h-4.5 w-4.5 text-zinc-500" />
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold font-mono">
              {stats?.totalTodayProduction ? stats.totalTodayProduction.toLocaleString(undefined, { maximumFractionDigits: 1 }) : "0.0"}
            </h3>
            <p className="text-[10px] text-zinc-500 font-mono mt-1">MEGAWATT-HOURS (MWh)</p>
          </div>
        </motion.div>

        {/* PORTFOLIO HEALTH SCORE */}
        <motion.div variants={itemVariants} className="glass-panel p-4.5 rounded-xl flex flex-col justify-between min-h-[120px]">
          <div className="flex items-start justify-between">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">Portfolio Health</span>
            <Heart className="h-4.5 w-4.5 text-rose-500 animate-pulse" />
          </div>
          <div className="mt-4">
            <h3 className={`text-2xl font-bold font-mono ${
              (stats?.averageHealth ?? 100) > 92 
                ? "text-emerald-400" 
                : (stats?.averageHealth ?? 100) > 85 
                ? "text-yellow-400" 
                : "text-red-400"
            }`}>
              {stats?.averageHealth ? stats.averageHealth.toFixed(1) : "0.0"}%
            </h3>
            <p className="text-[10px] text-zinc-500 font-mono mt-1">AVG ASSET RELIABILITY INDEX</p>
          </div>
        </motion.div>

        {/* CO2 OFFSET */}
        <motion.div variants={itemVariants} className="glass-panel p-4.5 rounded-xl flex flex-col justify-between min-h-[120px] digital-glow-solar">
          <div className="flex items-start justify-between">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">Carbon offset</span>
            <Leaf className="h-4.5 w-4.5 text-emerald-500" />
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold font-mono text-zinc-200">
              {stats?.carbonOffsetTonnes ? stats.carbonOffsetTonnes.toLocaleString(undefined, { maximumFractionDigits: 1 }) : "0.0"}
            </h3>
            <p className="text-[10px] text-zinc-500 font-mono mt-1">TONNES CO2 AVOIDED TODAY</p>
          </div>
        </motion.div>
      </div>

      {/* Main Charts & Leaderboards section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Production Trends Area Chart */}
        <motion.div variants={itemVariants} className="glass-panel p-6 rounded-xl xl:col-span-2 flex flex-col justify-between min-h-[400px]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-semibold tracking-wide">Historical Generation Profiles</h3>
              <p className="text-[11px] text-zinc-500 font-mono">AVERAGE GENERATION (MW) BY PLANT TYPE (14 DAY TIMELINE)</p>
            </div>
            <div className="flex items-center space-x-4 text-[10px] font-mono">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded bg-amber-500"></span> Solar</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded bg-sky-500"></span> Wind</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded bg-emerald-500"></span> BESS</span>
            </div>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSolar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorWind" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorBess" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(63, 63, 70, 0.2)" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#71717a" 
                  fontSize={10} 
                  tickLine={false} 
                  tickFormatter={(str) => {
                    const parts = str.split("-");
                    return parts.length > 2 ? `${parts[1]}/${parts[2]}` : str;
                  }}
                />
                <YAxis stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} label={{ value: "Generation (MW)", angle: -90, position: "insideLeft", offset: 10, style: { fill: "#71717a", fontSize: 10, fontFamily: "monospace" } }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(9, 9, 11, 0.95)",
                    borderColor: "rgba(63, 63, 70, 0.5)",
                    borderRadius: "8px",
                    fontSize: "11px",
                    fontFamily: "monospace",
                    color: "#f4f4f5",
                  }}
                  itemStyle={{ color: "#a1a1aa" }}
                />
                <Area type="monotone" dataKey="solar" name="Solar (MW)" stroke="#f59e0b" strokeWidth={1.5} fillOpacity={1} fill="url(#colorSolar)" />
                <Area type="monotone" dataKey="wind" name="Wind (MW)" stroke="#0ea5e9" strokeWidth={1.5} fillOpacity={1} fill="url(#colorWind)" />
                <Area type="monotone" dataKey="bess" name="BESS Output (MW)" stroke="#10b981" strokeWidth={1.5} fillOpacity={1} fill="url(#colorBess)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Live Active Alarms Ticker / Quick Actions */}
        <motion.div variants={itemVariants} className="glass-panel p-6 rounded-xl flex flex-col justify-between min-h-[400px]">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-zinc-900 pb-4">
              <h3 className="text-sm font-semibold tracking-wide flex items-center gap-2">
                <ShieldAlert className="h-4.5 w-4.5 text-red-500 animate-pulse" /> Urgent Alarms
              </h3>
              <span className="text-[10px] text-zinc-500 font-mono uppercase">Live SCADA</span>
            </div>

            <div className="space-y-3 overflow-y-auto max-h-[280px]">
              {plants
                .flatMap((p: any) => p.activeAlarmsCount > 0 ? [p] : [])
                .slice(0, 4)
                .map((p: any) => (
                  <div
                    key={p._id}
                    onClick={() => onSelectPlant(p._id)}
                    className="p-3 bg-red-950/10 border border-red-950/30 hover:border-red-900/60 rounded-lg cursor-pointer flex items-center justify-between transition-all"
                  >
                    <div className="flex items-center space-x-3 overflow-hidden">
                      <div className="h-2 w-2 rounded-full bg-red-500 animate-ping flex-shrink-0"></div>
                      <div className="overflow-hidden">
                        <h4 className="font-semibold text-zinc-200 text-xs truncate">{p.name}</h4>
                        <p className="text-[10px] text-zinc-500 font-mono uppercase mt-0.5">{p.type} • {p.location}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-3">
                      <span className="bg-red-500/10 text-red-500 border border-red-500/20 text-[9px] font-bold font-mono px-2 py-0.5 rounded">
                        {p.activeAlarmsCount} ALERTS
                      </span>
                    </div>
                  </div>
                ))}

              {plants.every((p: any) => p.activeAlarmsCount === 0) && (
                <div className="text-center text-zinc-500 py-12 flex flex-col items-center justify-center">
                  <div className="bg-emerald-500/10 p-3 rounded-full border border-emerald-500/20 mb-3">
                    <Heart className="h-6 w-6 text-emerald-500 animate-pulse" />
                  </div>
                  <h4 className="font-semibold text-xs text-zinc-300">All Systems Nominal</h4>
                  <p className="text-[10px] text-zinc-500 font-mono mt-1">Zero active alerts across the portfolio.</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 border-t border-zinc-900 pt-4 text-center">
            <p className="text-[10px] text-zinc-500 font-mono">LATEST SYSTEM SECURITY INTEGRITY: SECURE</p>
          </div>
        </motion.div>
      </div>

      {/* Leaderboard Grid tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Plants */}
        <motion.div variants={itemVariants} className="glass-panel p-6 rounded-xl">
          <div className="flex items-center justify-between mb-4 border-b border-zinc-900 pb-4">
            <h3 className="text-sm font-semibold tracking-wide">Top Producing Plants</h3>
            <span className="text-[9px] font-mono text-zinc-500 uppercase">Live Output</span>
          </div>

          <div className="space-y-1.5">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-zinc-900 text-zinc-500 pb-2">
                  <th className="font-medium pb-2">PLANT NAME</th>
                  <th className="font-medium pb-2">TYPE</th>
                  <th className="font-medium pb-2 text-right">CAPACITY</th>
                  <th className="font-medium pb-2 text-right">LIVE POWER</th>
                  <th className="font-medium pb-2 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {topPlants.slice(0, 5).map((p: any) => (
                  <tr key={p._id} className="hover:bg-zinc-900/30 transition-all border-b border-zinc-900/40">
                    <td className="font-semibold text-zinc-200 py-3">{p.name}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-[4px] text-[10px] font-bold uppercase ${
                        p.type === "solar" 
                          ? "bg-amber-500/10 text-amber-500 border border-amber-500/10" 
                          : p.type === "wind"
                          ? "bg-sky-500/10 text-sky-500 border border-sky-500/10"
                          : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/10"
                      }`}>
                        {p.type}
                      </span>
                    </td>
                    <td className="text-right py-3">{p.capacity} MW</td>
                    <td className="text-right text-emerald-400 py-3 font-semibold">{p.currentPower.toFixed(1)} MW</td>
                    <td className="text-right py-3">
                      <button onClick={() => onSelectPlant(p._id)} className="text-zinc-400 hover:text-emerald-400">
                        <ChevronRight className="h-4 w-4 ml-auto" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* High Risk / Underperforming Plants */}
        <motion.div variants={itemVariants} className="glass-panel p-6 rounded-xl">
          <div className="flex items-center justify-between mb-4 border-b border-zinc-900 pb-4">
            <h3 className="text-sm font-semibold tracking-wide">Underperforming / In Alarm Plants</h3>
            <span className="text-[9px] font-mono text-red-500 uppercase">Attention Required</span>
          </div>

          <div className="space-y-1.5">
            {strugglingPlants.length > 0 ? (
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="border-b border-zinc-900 text-zinc-500 pb-2">
                    <th className="font-medium pb-2">PLANT NAME</th>
                    <th className="font-medium pb-2">TYPE</th>
                    <th className="font-medium pb-2 text-right">HEALTH</th>
                    <th className="font-medium pb-2 text-right">STATUS</th>
                    <th className="font-medium pb-2 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {strugglingPlants.map((p: any) => (
                    <tr key={p._id} className="hover:bg-zinc-900/30 transition-all border-b border-zinc-900/40">
                      <td className="font-semibold text-zinc-200 py-3">{p.name}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-[4px] text-[10px] font-bold uppercase ${
                          p.type === "solar" 
                            ? "bg-amber-500/10 text-amber-500 border border-amber-500/10" 
                            : p.type === "wind"
                            ? "bg-sky-500/10 text-sky-500 border border-sky-500/10"
                            : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/10"
                        }`}>
                          {p.type}
                        </span>
                      </td>
                      <td className={`text-right py-3 font-semibold ${
                        p.healthScore < 88 ? "text-red-400" : "text-yellow-400"
                      }`}>{p.healthScore.toFixed(1)}%</td>
                      <td className="text-right py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                          p.status === "offline" 
                            ? "bg-red-500/10 text-red-500 border border-red-500/20" 
                            : "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="text-right py-3">
                        <button onClick={() => onSelectPlant(p._id)} className="text-zinc-400 hover:text-emerald-400">
                          <ChevronRight className="h-4 w-4 ml-auto" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center text-zinc-500 py-12 flex flex-col items-center justify-center">
                <div className="bg-emerald-500/10 p-3 rounded-full border border-emerald-500/20 mb-3">
                  <Heart className="h-6 w-6 text-emerald-500" />
                </div>
                <h4 className="font-semibold text-xs text-zinc-300">All Plants Operational</h4>
                <p className="text-[10px] text-zinc-500 font-mono mt-1">Zero systems in warning or offline conditions.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
