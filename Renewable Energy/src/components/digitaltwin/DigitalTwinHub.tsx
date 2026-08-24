import React, { useState, useEffect } from "react";
import { useQuery } from "../../lib/convex";
import { api } from "../../lib/convex";
import {
  Boxes, Thermometer, Zap, Activity, Clock, AlertTriangle,
  GitBranch, Monitor, Radio, Battery, Sun, Wind, ChevronDown, ChevronRight
} from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, AreaChart, Area
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";

const ASSET_ICONS: Record<string, React.ReactNode> = {
  panel: <Sun className="w-4 h-4" />,
  inverter: <Zap className="w-4 h-4" />,
  transformer: <GitBranch className="w-4 h-4" />,
  turbine: <Wind className="w-4 h-4" />,
  battery: <Battery className="w-4 h-4" />,
  sensor: <Radio className="w-4 h-4" />,
};

const HEALTH_COLOR = (h: number) =>
  h >= 85 ? "#10b981" : h >= 70 ? "#f59e0b" : h >= 50 ? "#f97316" : "#ef4444";

const PLANT_LABELS = [
  { id: "plant_1", name: "Mojave Solar Array I" },
  { id: "plant_2", name: "High Plains Wind Farm" },
  { id: "plant_3", name: "Gulf Coast BESS Station" },
  { id: "plant_4", name: "Sonora Solar Park" },
  { id: "plant_5", name: "Panhandle Wind Turbines" },
];

function SensorStream({ assetName }: { assetName: string }) {
  const [logs, setLogs] = useState<{ time: string; temp: number; voltage: number; freq: number }[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().toLocaleTimeString();
      setLogs(prev => [...prev.slice(-14), {
        time: now,
        temp: parseFloat((45 + Math.random() * 20).toFixed(1)),
        voltage: parseFloat((380 + Math.random() * 40).toFixed(1)),
        freq: parseFloat((49.8 + Math.random() * 0.4).toFixed(2)),
      }]);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-2">
      <h4 className="text-[10px] font-mono text-zinc-500 uppercase">Live Telemetry — {assetName}</h4>
      {logs.length < 3 && (
        <div className="text-zinc-600 text-xs font-mono animate-pulse">Initializing sensor stream…</div>
      )}
      {logs.length >= 3 && (
        <ResponsiveContainer width="100%" height={120}>
          <LineChart data={logs}>
            <CartesianGrid strokeDasharray="2 2" stroke="#18181b" />
            <XAxis dataKey="time" tick={{ fill: "#52525b", fontSize: 8 }} />
            <YAxis yAxisId="l" tick={{ fill: "#52525b", fontSize: 8 }} domain={['auto', 'auto']} />
            <YAxis yAxisId="r" orientation="right" tick={{ fill: "#52525b", fontSize: 8 }} domain={['auto', 'auto']} />
            <Tooltip contentStyle={{ background: "#09090b", border: "1px solid #27272a", fontSize: 10 }} />
            <Line yAxisId="l" type="monotone" dataKey="temp" stroke="#f59e0b" strokeWidth={1.5} dot={false} name="Temp (°C)" />
            <Line yAxisId="r" type="monotone" dataKey="voltage" stroke="#60a5fa" strokeWidth={1.5} dot={false} name="Voltage (V)" />
          </LineChart>
        </ResponsiveContainer>
      )}
      <div className="space-y-1 max-h-24 overflow-y-auto">
        {[...logs].reverse().slice(0, 5).map((l, i) => (
          <div key={i} className="flex gap-3 text-[9px] font-mono text-zinc-500 border-b border-zinc-900 pb-1">
            <span className="text-zinc-400">{l.time}</span>
            <span className="text-amber-400">T:{l.temp}°C</span>
            <span className="text-blue-400">V:{l.voltage}V</span>
            <span className="text-emerald-400">F:{l.freq}Hz</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AssetNode({ asset, depth = 0, onSelect, selected }: { asset: any; depth?: number; onSelect: (a: any) => void; selected: string | null }) {
  const [expanded, setExpanded] = useState(depth === 0);
  const hasChildren = asset.children && asset.children.length > 0;

  return (
    <div style={{ marginLeft: depth * 16 }}>
      <div
        className={`flex items-center gap-2 py-1.5 px-2 rounded-lg cursor-pointer hover:bg-zinc-900/50 transition-all ${selected === asset._id ? "bg-zinc-900 border border-emerald-500/20" : ""}`}
        onClick={() => { onSelect(asset); if (hasChildren) setExpanded(e => !e); }}>
        {hasChildren ? (
          expanded ? <ChevronDown className="w-3 h-3 text-zinc-500 flex-shrink-0" /> : <ChevronRight className="w-3 h-3 text-zinc-500 flex-shrink-0" />
        ) : <span className="w-3" />}
        <span className="text-zinc-400">{ASSET_ICONS[asset.type] ?? <Monitor className="w-4 h-4" />}</span>
        <span className="text-xs text-zinc-200 font-medium flex-1">{asset.name}</span>
        <span className="text-[9px] font-mono font-bold" style={{ color: HEALTH_COLOR(asset.healthScore) }}>
          {asset.healthScore?.toFixed(0)}%
        </span>
      </div>
      <AnimatePresence>
        {expanded && hasChildren && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            {asset.children.map((c: any) => (
              <AssetNode key={c._id} asset={c} depth={depth + 1} onSelect={onSelect} selected={selected} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function DigitalTwinHub() {
  const [selectedPlantId, setSelectedPlantId] = useState("plant_1");
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"layout" | "hierarchy" | "lifecycle" | "stream">("layout");

  const twinData = useQuery(api.digitalTwin.getPlantLayout, { plantId: selectedPlantId });
  const assets: any[] = twinData?.assets ?? [];
  const plant = twinData?.plant ?? null;

  const lifecycleData = [
    { name: "Turbine Array A", install: 2018, maintain: 2021, predict: 2026, replace: 2028 },
    { name: "Inverter Stack INV-01", install: 2019, maintain: 2022, predict: 2025, replace: 2027 },
    { name: "Battery Module BMS", install: 2020, maintain: 2023, predict: 2026, replace: 2027 },
    { name: "Transformer TR-01", install: 2017, maintain: 2020, predict: 2024, replace: 2029 },
    { name: "Solar Panel Array", install: 2019, maintain: 2023, predict: 2028, replace: 2034 },
  ];

  const simulationStats = [
    { label: "Active Output", value: `${(480 + Math.random() * 40).toFixed(1)} MW`, color: "text-emerald-400" },
    { label: "Grid Frequency", value: "50.01 Hz", color: "text-sky-400" },
    { label: "Fleet Efficiency", value: "94.3%", color: "text-violet-400" },
    { label: "Active Alarms", value: "6", color: "text-red-400" },
    { label: "Online Assets", value: `${assets.filter(a => a.healthScore > 70).length}/${assets.length}`, color: "text-emerald-400" },
    { label: "Avg Temperature", value: `${(42 + Math.random() * 5).toFixed(1)}°C`, color: "text-amber-400" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-900 pb-5 gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Digital Twin Hub
            <span className="text-xs font-mono px-2 py-0.5 rounded border border-zinc-700 text-zinc-400 bg-slate-800/35">Live Simulation</span>
          </h2>
          <p className="text-xs text-zinc-500 font-mono">REAL-TIME ASSET SIMULATION, EQUIPMENT HIERARCHY, AND LIFECYCLE MANAGEMENT</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={selectedPlantId} onChange={e => { setSelectedPlantId(e.target.value); setSelectedAsset(null); }}
            className="bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs rounded-lg px-3 py-2 font-mono">
            {PLANT_LABELS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      </div>

      {/* Sub-tab nav */}
      <div className="flex flex-wrap gap-2 border-b border-zinc-900 pb-4">
        {[
          { id: "layout", label: "Plant Layout" },
          { id: "hierarchy", label: "Asset Hierarchy" },
          { id: "lifecycle", label: "Lifecycle View" },
          { id: "stream", label: "Sensor Stream" },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-semibold transition-all ${activeTab === tab.id ? "bg-zinc-900 border border-emerald-500/20 text-emerald-400" : "text-zinc-400 border border-zinc-900 hover:text-zinc-200"}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Live Stats Bar */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {simulationStats.map((s, i) => (
          <div key={i} className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-3 text-center">
            <p className="text-[9px] text-zinc-500 font-mono uppercase">{s.label}</p>
            <p className={`text-sm font-bold mt-0.5 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* LAYOUT TAB */}
      {activeTab === "layout" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-zinc-950/40 border border-zinc-900 rounded-xl p-5 relative overflow-hidden">
            <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-zinc-300 mb-4">
              {plant?.name ?? "Plant"} — SVG Equipment Layout
            </h3>
            <svg width="100%" viewBox="0 0 100 80" className="bg-zinc-950/60 rounded-lg border border-zinc-800">
              {/* Grid lines */}
              <defs>
                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#18181b" strokeWidth="0.2" />
                </pattern>
              </defs>
              <rect width="100" height="80" fill="url(#grid)" />
              {/* Plant boundary */}
              <rect x="2" y="2" width="96" height="76" fill="none" stroke="#27272a" strokeWidth="0.3" rx="1" />
              <text x="50" y="6.5" textAnchor="middle" fill="#3f3f46" fontSize="2.5" fontFamily="monospace">{plant?.name}</text>
              {/* Electrical bus line */}
              <line x1="5" y1="40" x2="95" y2="40" stroke="#374151" strokeWidth="0.5" strokeDasharray="2 1" />
              <text x="50" y="38.5" textAnchor="middle" fill="#52525b" fontSize="1.8" fontFamily="monospace">MAIN AC BUS</text>
              {/* Assets */}
              {assets.map((asset) => {
                const hc = HEALTH_COLOR(asset.healthScore);
                const isSelected = selectedAsset?._id === asset._id;
                return (
                  <g key={asset._id} onClick={() => setSelectedAsset(asset)} style={{ cursor: "pointer" }}>
                    <rect x={asset.x - 4} y={asset.y - 4} width={8} height={8}
                      fill={isSelected ? `${hc}30` : "#09090b"} stroke={hc}
                      strokeWidth={isSelected ? 0.8 : 0.4} rx={0.5}
                      opacity={0.9} />
                    <text x={asset.x} y={asset.y + 0.5} textAnchor="middle" fill={hc} fontSize="2" fontFamily="monospace">
                      {asset.type.slice(0,3).toUpperCase()}
                    </text>
                    <text x={asset.x} y={asset.y + 7} textAnchor="middle" fill="#52525b" fontSize="1.5" fontFamily="monospace">
                      {asset.healthScore?.toFixed(0)}%
                    </text>
                    {isSelected && (
                      <circle cx={asset.x} cy={asset.y - 4} r={1.5} fill={hc} opacity={0.8}>
                        <animate attributeName="opacity" values="0.8;0.2;0.8" dur="1.5s" repeatCount="indefinite" />
                      </circle>
                    )}
                  </g>
                );
              })}
            </svg>
            <div className="mt-3 flex flex-wrap gap-3 text-[9px] font-mono text-zinc-500">
              {[["#10b981","Healthy (>85%)"],["#f59e0b","Fair (70-85%)"],["#f97316","Poor (50-70%)"],["#ef4444","Critical (<50%)"]].map(([c,l]) => (
                <span key={l} className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm" style={{ background: c }} />{l}</span>
              ))}
            </div>
          </div>

          {/* Asset detail panel */}
          <div className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-5">
            {selectedAsset ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400">
                    {ASSET_ICONS[selectedAsset.type] ?? <Monitor className="w-4 h-4" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">{selectedAsset.name}</h3>
                    <p className="text-[10px] text-zinc-500 font-mono uppercase">{selectedAsset.type}</p>
                  </div>
                </div>
                <div className="space-y-2 font-mono text-xs">
                  {[
                    ["Health Score", `${selectedAsset.healthScore?.toFixed(1)}%`, HEALTH_COLOR(selectedAsset.healthScore)],
                    ["Temperature", `${selectedAsset.temperature?.toFixed(1)}°C`, "text-amber-400"],
                    ["Vibration", `${selectedAsset.vibration?.toFixed(2)} g`, "text-sky-400"],
                    ["Operating Hours", selectedAsset.operatingHours?.toLocaleString(), "text-zinc-300"],
                    ["Last Maintenance", selectedAsset.lastMaintenance, "text-zinc-300"],
                    ["Next Maintenance", selectedAsset.nextMaintenance, "text-zinc-300"],
                  ].map(([k, v, color]) => (
                    <div key={k as string} className="flex justify-between gap-2 border-b border-zinc-900 pb-1.5">
                      <span className="text-zinc-500">{k}</span>
                      <span className={`font-semibold ${typeof color === "string" && color.startsWith("text") ? color : "text-white"}`}
                        style={{ color: typeof color === "string" && color.startsWith("#") ? color : undefined }}>
                        {v}
                      </span>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex justify-between text-[10px] font-mono text-zinc-500 mb-1">
                    <span>Health</span><span>{selectedAsset.healthScore?.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div className="h-full rounded-full" initial={{ width: 0 }}
                      animate={{ width: `${selectedAsset.healthScore}%` }} transition={{ duration: 0.8, ease: "easeOut" }}
                      style={{ background: HEALTH_COLOR(selectedAsset.healthScore) }} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                <Monitor className="w-8 h-8 text-zinc-700 mb-3" />
                <p className="text-sm text-zinc-500 font-mono">Select an asset on the layout to view details</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* HIERARCHY TAB */}
      {activeTab === "hierarchy" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-zinc-300 mb-4">Asset Dependency Tree</h3>
            <div className="space-y-1 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-800">
              {assets.map(a => (
                <AssetNode key={a._id} asset={a} onSelect={setSelectedAsset} selected={selectedAsset?._id ?? null} />
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-zinc-300">Asset Health Summary</h3>
            <div className="grid grid-cols-2 gap-3">
              {assets.map((a) => (
                <div key={a._id} className="bg-zinc-950/30 border border-zinc-900 rounded-lg p-3 flex items-center gap-2.5">
                  <div className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: HEALTH_COLOR(a.healthScore) }} />
                  <div className="min-w-0">
                    <p className="text-xs text-white font-medium truncate">{a.name}</p>
                    <p className="text-[10px] font-mono" style={{ color: HEALTH_COLOR(a.healthScore) }}>{a.healthScore?.toFixed(1)}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* LIFECYCLE TAB */}
      {activeTab === "lifecycle" && (
        <div className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-5 space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-zinc-300">Equipment Lifecycle Gantt View</h3>
          <div className="overflow-x-auto">
            <div className="min-w-[600px]">
              <div className="flex items-center gap-4 mb-3 text-[9px] font-mono text-zinc-500">
                {[["bg-emerald-500","Installed"],["bg-sky-500","Maintained"],["bg-amber-500","Predicted Failure"],["bg-red-500","Replace By"]].map(([c, l]) => (
                  <span key={l} className="flex items-center gap-1"><span className={`h-2 w-4 rounded-sm ${c}`} />{l}</span>
                ))}
              </div>
              {lifecycleData.map((item, i) => {
                const base = 2017; const range = 2035 - base;
                const pct = (y: number) => `${((y - base) / range) * 100}%`;
                const w = (a: number, b: number) => `${((b - a) / range) * 100}%`;
                return (
                  <div key={i} className="flex items-center gap-3 mb-3">
                    <div className="w-44 flex-shrink-0 text-xs text-zinc-300 font-medium truncate">{item.name}</div>
                    <div className="flex-1 h-6 bg-zinc-900 rounded relative">
                      {[2020, 2025, 2030, 2035].map(yr => (
                        <div key={yr} className="absolute top-0 h-full border-l border-zinc-800/60"
                          style={{ left: pct(yr) }}>
                          <span className="text-[8px] font-mono text-zinc-700 absolute -top-4 -translate-x-1/2">{yr}</span>
                        </div>
                      ))}
                      <div className="absolute h-full rounded bg-zinc-700" style={{ left: pct(item.install), width: w(item.install, item.maintain) }} />
                      <div className="absolute h-full rounded bg-sky-500/70" style={{ left: pct(item.maintain), width: w(item.maintain, item.predict) }} />
                      <div className="absolute h-full rounded bg-amber-500/70" style={{ left: pct(item.predict), width: w(item.predict, item.replace) }} />
                      <div className="absolute top-0 h-full w-0.5 bg-red-500" style={{ left: pct(item.replace) }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SENSOR STREAM TAB */}
      {activeTab === "stream" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {assets.slice(0, 4).map(a => (
            <div key={a._id} className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-4">
              <SensorStream assetName={a.name} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
