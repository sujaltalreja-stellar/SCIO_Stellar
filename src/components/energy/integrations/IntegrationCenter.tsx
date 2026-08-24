import React, { useState } from "react";
import { useQuery, useMutation } from "../lib/convex";
import { api } from "../lib/convex";
import {
  Plug, Activity, Wifi, WifiOff, AlertTriangle, CheckCircle, Clock,
  Zap, Database, Globe, Server, RefreshCw, Settings, Play, Pause,
  ArrowUpRight, Bot, Cloud, BarChart2
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";

const TYPE_ICONS: Record<string, React.ReactNode> = {
  scada: <Server className="w-4 h-4" />,
  iot: <Wifi className="w-4 h-4" />,
  erp: <Database className="w-4 h-4" />,
  weather: <Cloud className="w-4 h-4" />,
  ai: <Bot className="w-4 h-4" />,
  gis: <Globe className="w-4 h-4" />,
  market: <BarChart2 className="w-4 h-4" />,
  reporting: <BarChart2 className="w-4 h-4" />,
};

const TYPE_COLORS: Record<string, string> = {
  scada: "#10b981", iot: "#3b82f6", erp: "#8b5cf6",
  weather: "#06b6d4", ai: "#f59e0b", gis: "#22d3ee",
  market: "#f43f5e", reporting: "#a78bfa",
};

const STATUS_CONFIG: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  connected: { color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10", icon: <CheckCircle className="w-3.5 h-3.5" />, label: "Connected" },
  degraded: { color: "text-amber-400 border-amber-500/20 bg-amber-500/10", icon: <AlertTriangle className="w-3.5 h-3.5" />, label: "Degraded" },
  disconnected: { color: "text-red-400 border-red-500/20 bg-red-500/10", icon: <WifiOff className="w-3.5 h-3.5" />, label: "Disconnected" },
  configuring: { color: "text-sky-400 border-sky-500/20 bg-sky-500/10", icon: <Settings className="w-3.5 h-3.5" />, label: "Configuring" },
};

const WORKFLOW_CATEGORY_COLORS: Record<string, string> = {
  maintenance: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  procurement: "text-sky-400 bg-sky-500/10 border-sky-500/20",
  safety: "text-red-400 bg-red-500/10 border-red-500/20",
  sustainability: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  financial: "text-violet-400 bg-violet-500/10 border-violet-500/20",
};

function relativeTime(iso: string) {
  if (!iso) return "Never";
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

export default function IntegrationCenter() {
  const [activeTab, setActiveTab] = useState<"connectors" | "workflows" | "activity">("connectors");
  const [typeFilter, setTypeFilter] = useState("all");

  const connectors = useQuery(api.integrations.listConnectors) ?? [];
  const workflows = useQuery(api.integrations.listWorkflows) ?? [];
  const toggleWorkflow = useMutation(api.integrations.toggleWorkflow);

  const filteredConnectors = typeFilter === "all" ? connectors : connectors.filter((c: any) => c.type === typeFilter);

  const connectedCount = connectors.filter((c: any) => c.status === "connected").length;
  const totalRecords = connectors.reduce((s: number, c: any) => s + c.recordsPerHour, 0);
  const avgUptime = connectors.filter((c: any) => c.uptime > 0)
    .reduce((s: number, c: any, _i: number, a: any[]) => s + c.uptime / a.length, 0);

  const latencyData = connectors
    .filter((c: any) => c.latencyMs > 0)
    .map((c: any) => ({ name: c.name.split(" ").slice(0,2).join(" "), latency: c.latencyMs }))
    .sort((a: any, b: any) => a.latency - b.latency);

  const activeWorkflows = workflows.filter((w: any) => w.status === "active").length;
  const totalTriggers = workflows.reduce((s: number, w: any) => s + w.triggerCount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-900 pb-5 gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Integration Center
            <span className="text-xs font-mono px-2 py-0.5 rounded border border-zinc-700 text-zinc-400 bg-slate-800/35">Enterprise</span>
          </h2>
          <p className="text-xs text-zinc-500 font-mono">15 ENTERPRISE CONNECTORS — SCADA, IoT, ERP, AI, GIS, MARKET, REPORTING</p>
        </div>
        <div className="flex bg-zinc-950/40 p-1 rounded-lg border border-zinc-900/80 text-xs font-mono gap-1">
          {(["connectors","workflows","activity"] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-2 rounded-md transition-all capitalize ${activeTab === tab ? "bg-zinc-900 text-emerald-400 border border-emerald-500/20" : "text-zinc-400 border border-transparent"}`}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Connected", value: `${connectedCount}/${connectors.length}`, icon: <CheckCircle className="w-4 h-4 text-emerald-400" />, color: "text-emerald-400" },
          { label: "Records/Hour", value: totalRecords.toLocaleString(), icon: <Zap className="w-4 h-4 text-sky-400" />, color: "text-sky-400" },
          { label: "Avg Uptime", value: `${avgUptime.toFixed(1)}%`, icon: <Activity className="w-4 h-4 text-violet-400" />, color: "text-violet-400" },
          { label: "Active Workflows", value: `${activeWorkflows}/${workflows.length}`, icon: <Play className="w-4 h-4 text-emerald-400" />, color: "text-emerald-400" },
        ].map((kpi, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-zinc-500 font-mono uppercase">{kpi.label}</p>
              <p className={`text-2xl font-bold mt-0.5 ${kpi.color}`}>{kpi.value}</p>
            </div>
            {kpi.icon}
          </motion.div>
        ))}
      </div>

      {/* CONNECTORS TAB */}
      {activeTab === "connectors" && (
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs rounded-lg px-3 py-1.5 font-mono">
              {["all","scada","iot","erp","weather","ai","gis","market","reporting"].map(t => (
                <option key={t} value={t}>{t === "all" ? "All Types" : t.toUpperCase()}</option>
              ))}
            </select>
            <span className="text-xs text-zinc-500 font-mono">{filteredConnectors.length} connectors shown</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredConnectors.map((conn: any, i: number) => {
              const sc = STATUS_CONFIG[conn.status] ?? STATUS_CONFIG.disconnected;
              const typeColor = TYPE_COLORS[conn.type] ?? "#71717a";
              return (
                <motion.div key={conn._id} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}
                  className="bg-zinc-950/30 border border-zinc-900 rounded-xl p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800" style={{ color: typeColor }}>
                        {TYPE_ICONS[conn.type] ?? <Plug className="w-4 h-4" />}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white leading-tight">{conn.name}</h4>
                        <p className="text-[10px] font-mono text-zinc-500 uppercase">{conn.protocol}</p>
                      </div>
                    </div>
                    <span className={`flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded border ${sc.color}`}>
                      {sc.icon}{sc.label}
                    </span>
                  </div>

                  {conn.uptime > 0 && (
                    <div>
                      <div className="flex justify-between text-[10px] font-mono text-zinc-500 mb-1">
                        <span>Uptime</span><span className="text-white">{conn.uptime}%</span>
                      </div>
                      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{
                          width: `${conn.uptime}%`,
                          background: conn.uptime > 98 ? "#10b981" : conn.uptime > 92 ? "#f59e0b" : "#ef4444"
                        }} />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 font-mono text-[10px]">
                    {conn.recordsPerHour > 0 && (
                      <div className="bg-zinc-900/50 rounded p-2">
                        <p className="text-zinc-500">Records/hr</p>
                        <p className="text-white font-bold">{conn.recordsPerHour.toLocaleString()}</p>
                      </div>
                    )}
                    {conn.latencyMs > 0 && (
                      <div className="bg-zinc-900/50 rounded p-2">
                        <p className="text-zinc-500">Latency</p>
                        <p className={`font-bold ${conn.latencyMs < 50 ? "text-emerald-400" : conn.latencyMs < 500 ? "text-amber-400" : "text-red-400"}`}>{conn.latencyMs}ms</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[9px] font-mono text-zinc-600">
                    <span className="truncate max-w-[140px]">{conn.endpoint}</span>
                    <span>{conn.lastSync ? `Sync: ${relativeTime(conn.lastSync)}` : "Not synced"}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Latency Chart */}
          <div className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-zinc-300 mb-4">Connector Latency Comparison (ms)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={latencyData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#18181b" />
                <XAxis type="number" tick={{ fill: "#71717a", fontSize: 9 }} />
                <YAxis type="category" dataKey="name" tick={{ fill: "#71717a", fontSize: 9 }} width={110} />
                <Tooltip contentStyle={{ background: "#09090b", border: "1px solid #27272a", borderRadius: 8, fontSize: 11 }} />
                <Bar dataKey="latency" name="Latency (ms)" radius={[0,2,2,0]}>
                  {latencyData.map((entry: any, i: number) => (
                    <rect key={i} fill={entry.latency < 50 ? "#10b981" : entry.latency < 500 ? "#f59e0b" : "#ef4444"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* WORKFLOWS TAB */}
      {activeTab === "workflows" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-zinc-300">Automation Workflow Rules</h3>
            <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500">
              <span className="text-emerald-400 font-bold">{totalTriggers.toLocaleString()}</span> total trigger events
            </div>
          </div>
          <div className="space-y-3">
            {workflows.map((wf: any, i: number) => {
              const catStyle = WORKFLOW_CATEGORY_COLORS[wf.category] ?? "text-zinc-400 bg-zinc-800 border-zinc-700";
              return (
                <motion.div key={wf._id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  className="bg-zinc-950/30 border border-zinc-900 rounded-xl p-4 flex items-start gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded border ${catStyle}`}>{wf.category}</span>
                      <h4 className="text-sm font-bold text-white">{wf.name}</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-1 font-mono text-[11px]">
                      <p className="text-zinc-500"><span className="text-zinc-400 font-medium">Trigger:</span> {wf.trigger}</p>
                      <p className="text-zinc-500"><span className="text-zinc-400 font-medium">Action:</span> {wf.action}</p>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] font-mono text-zinc-500">
                      <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-amber-400" /> {wf.triggerCount} triggers</span>
                      {wf.lastTriggered && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Last: {relativeTime(wf.lastTriggered)}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-[9px] font-mono px-2 py-0.5 rounded border ${wf.status === "active" ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" : "text-zinc-500 bg-zinc-800 border-zinc-700"}`}>
                      {wf.status}
                    </span>
                    <button onClick={() => toggleWorkflow({ id: wf._id })}
                      className="h-7 w-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-all">
                      {wf.status === "active" ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* ACTIVITY LOG TAB */}
      {activeTab === "activity" && (
        <div className="space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-zinc-300">Recent Sync Activity Log</h3>
          <div className="bg-zinc-950/40 border border-zinc-900 rounded-xl divide-y divide-zinc-900">
            {connectors.filter((c: any) => c.lastSync).slice(0, 12).map((conn: any, i: number) => {
              const sc = STATUS_CONFIG[conn.status];
              return (
                <div key={conn._id} className="flex items-center gap-4 px-4 py-3 hover:bg-zinc-900/20 transition-colors">
                  <div className={`text-xs font-mono ${sc?.color ?? "text-zinc-400"}`}>{sc?.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white font-medium truncate">{conn.name}</p>
                    <p className="text-[10px] text-zinc-500 font-mono">{conn.recordsPerHour.toLocaleString()} records/hr · {conn.latencyMs}ms latency</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[10px] font-mono text-zinc-400">{relativeTime(conn.lastSync)}</p>
                    <p className={`text-[9px] font-mono ${conn.uptime > 98 ? "text-emerald-400" : conn.uptime > 90 ? "text-amber-400" : "text-red-400"}`}>
                      {conn.uptime > 0 ? `${conn.uptime}% uptime` : "Offline"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
