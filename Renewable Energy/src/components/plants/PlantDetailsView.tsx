import React, { useState } from "react";
import { useQuery, useMutation } from "../../lib/convex";
import { api } from "../../lib/convex";
import {
  ArrowLeft,
  Sun,
  Wind,
  Battery,
  ShieldAlert,
  Thermometer,
  Wrench,
  Activity,
  Cpu,
  Layers,
  Check,
  Send,
  Calendar,
  AlertTriangle
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
  ResponsiveContainer
} from "recharts";

interface PlantDetailsViewProps {
  plantId: string;
  onBack: () => void;
  onSelectAsset: (assetId: string) => void;
}

export default function PlantDetailsView({ plantId, onBack, onSelectAsset }: PlantDetailsViewProps) {
  const data = useQuery(api.plants.getById, { plantId });
  const ackAlarm = useMutation(api.alarms.acknowledge);
  const resolveAlarm = useMutation(api.alarms.resolve);
  const scheduleMaint = useMutation(api.maintenance.create);

  // Form State for Maintenance Scheduling
  const [showMaintForm, setShowMaintForm] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState("");
  const [maintType, setMaintType] = useState<"preventive" | "corrective" | "predictive">("preventive");
  const [maintDesc, setMaintDesc] = useState("");
  const [maintEngineer, setMaintEngineer] = useState("");
  const [maintDate, setMaintDate] = useState("");

  if (!data) {
    return (
      <div className="h-full flex items-center justify-center text-zinc-500 font-mono">
        <Activity className="h-6 w-6 animate-spin mr-2" /> LOADING SCADA TELEMETRY CHANNEL...
      </div>
    );
  }

  const { plant, telemetry, weather, activeAlarms, recentMetrics, assets } = data;

  const handleScheduleMaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetId || !maintDesc || !maintEngineer || !maintDate) return;

    await scheduleMaint({
      plantId: plant._id,
      assetId: selectedAssetId as any,
      type: maintType,
      description: maintDesc,
      engineer: maintEngineer,
      scheduledDate: maintDate,
    });

    // Reset Form
    setShowMaintForm(false);
    setSelectedAssetId("");
    setMaintDesc("");
    setMaintEngineer("");
    setMaintDate("");
  };

  const isSolar = plant.type === "solar";
  const isWind = plant.type === "wind";
  const isBess = plant.type === "bess";

  return (
    <div className="space-y-6">
      {/* Subheader Navigation */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onBack}
          className="p-2 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 rounded-lg text-zinc-400 hover:text-zinc-200 transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <div className="flex items-center space-x-2.5">
            <h2 className="text-xl font-bold tracking-tight">{plant.name}</h2>
            <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono uppercase border ${
              plant.status === "online" 
                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                : plant.status === "maintenance"
                ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                : "bg-red-500/10 text-red-500 border-red-500/20 animate-pulse"
            }`}>
              {plant.status}
            </span>
          </div>
          <p className="text-[10px] text-zinc-500 font-mono uppercase">
            OPERATING PORT: {plant.location} • OWNER: {plant.owner}
          </p>
        </div>
      </div>

      {/* -------------------- SOLAR PLANT INTERFACE -------------------- */}
      {isSolar && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-panel p-4.5 rounded-xl">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">Solar Irradiance</span>
            <div className="flex items-baseline space-x-1.5 mt-3">
              <span className="text-2xl font-bold font-mono text-zinc-100">{weather?.irradiance ?? 0}</span>
              <span className="text-xs text-zinc-500">W/m²</span>
            </div>
            <p className="text-[10px] text-zinc-500 font-mono mt-1">WEATHER CONDITION: {weather?.description}</p>
          </div>

          <div className="glass-panel p-4.5 rounded-xl">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">Module Temp</span>
            <div className="flex items-baseline space-x-1.5 mt-3">
              <span className="text-2xl font-bold font-mono text-zinc-100">{(weather?.temperature ?? 20) + 12.4}</span>
              <span className="text-xs text-zinc-500">°C</span>
            </div>
            <p className="text-[10px] text-zinc-500 font-mono mt-1">AMBIENT DIFF: +12.4°C</p>
          </div>

          <div className="glass-panel p-4.5 rounded-xl">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">Inverter Efficiency</span>
            <div className="flex items-baseline space-x-1.5 mt-3">
              <span className="text-2xl font-bold font-mono text-emerald-400">{telemetry?.efficiency ?? 98.4}%</span>
            </div>
            <p className="text-[10px] text-zinc-500 font-mono mt-1">DC TO AC CONVERSION INDEX</p>
          </div>

          <div className="glass-panel p-4.5 rounded-xl">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">Operating Voltage</span>
            <div className="flex items-baseline space-x-1.5 mt-3">
              <span className="text-2xl font-bold font-mono text-zinc-100">{telemetry?.voltage ? (telemetry.voltage / 1000).toFixed(1) : "0"}</span>
              <span className="text-xs text-zinc-500">kV AC</span>
            </div>
            <p className="text-[10px] text-zinc-500 font-mono mt-1">CURRENT LOAD: {telemetry?.current ? telemetry.current.toFixed(0) : "0"} AMP</p>
          </div>
        </div>
      )}

      {/* -------------------- WIND FARM INTERFACE -------------------- */}
      {isWind && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-panel p-4.5 rounded-xl">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">Average Wind Velocity</span>
            <div className="flex items-baseline space-x-1.5 mt-3">
              <span className="text-2xl font-bold font-mono text-zinc-100">{weather?.windSpeed ?? 0}</span>
              <span className="text-xs text-zinc-500">m/s</span>
            </div>
            <p className="text-[10px] text-zinc-500 font-mono mt-1">RATED SPEED: 3.0m/s - 25.0m/s</p>
          </div>

          <div className="glass-panel p-4.5 rounded-xl">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">Rotor Speed avg</span>
            <div className="flex items-baseline space-x-1.5 mt-3">
              <span className="text-2xl font-bold font-mono text-zinc-100">{weather?.windSpeed ? Math.round(weather.windSpeed * 1.6) : 0}</span>
              <span className="text-xs text-zinc-500">RPM</span>
            </div>
            <p className="text-[10px] text-zinc-500 font-mono mt-1">BLADE ANGLE: 8.5° PITCH</p>
          </div>

          <div className="glass-panel p-4.5 rounded-xl">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">Yaw Alignment</span>
            <div className="flex items-baseline space-x-1.5 mt-3">
              <span className="text-2xl font-bold font-mono text-zinc-100">224°</span>
              <span className="text-xs text-zinc-500">SW</span>
            </div>
            <p className="text-[10px] text-zinc-500 font-mono mt-1">OPTIMUM BEARING DIRECTION</p>
          </div>

          <div className="glass-panel p-4.5 rounded-xl">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">Operating Frequency</span>
            <div className="flex items-baseline space-x-1.5 mt-3">
              <span className="text-2xl font-bold font-mono text-emerald-400">{telemetry?.frequency ? telemetry.frequency.toFixed(3) : "60.000"}</span>
              <span className="text-xs text-zinc-500">Hz</span>
            </div>
            <p className="text-[10px] text-zinc-500 font-mono mt-1">GRID PHASE LOCK: SYNCHRONIZED</p>
          </div>
        </div>
      )}

      {/* -------------------- BESS PLATFORM INTERFACE -------------------- */}
      {isBess && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-panel p-4.5 rounded-xl digital-glow-bess">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">State of Charge (SoC)</span>
            <div className="flex items-baseline space-x-1.5 mt-3">
              <span className="text-2xl font-bold font-mono text-emerald-400">{telemetry?.stateOfCharge ?? 0}%</span>
            </div>
            {/* SoC battery progress bar */}
            <div className="w-full bg-zinc-900 border border-zinc-800 h-2.5 rounded-full mt-2.5 overflow-hidden">
              <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${telemetry?.stateOfCharge ?? 0}%` }}></div>
            </div>
          </div>

          <div className="glass-panel p-4.5 rounded-xl">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">State of Health (SoH)</span>
            <div className="flex items-baseline space-x-1.5 mt-3">
              <span className="text-2xl font-bold font-mono text-zinc-100">{telemetry?.stateOfHealth ?? 0}%</span>
            </div>
            <p className="text-[10px] text-zinc-500 font-mono mt-1">BATTERY BANK DEGRADATION FACTOR</p>
          </div>

          <div className="glass-panel p-4.5 rounded-xl">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">Grid Balance</span>
            <div className="flex items-baseline space-x-1.5 mt-3">
              <span className={`text-2xl font-bold font-mono ${
                (telemetry?.powerOutput ?? 0) >= 0 ? "text-amber-500" : "text-sky-400"
              }`}>
                {telemetry?.powerOutput ? Math.abs(telemetry.powerOutput).toFixed(1) : "0.0"}
              </span>
              <span className="text-xs text-zinc-500">MW</span>
            </div>
            <p className="text-[10px] text-zinc-500 font-mono mt-1">
              {(telemetry?.powerOutput ?? 0) >= 0 ? "DISCHARGING / EXPORTING" : "CHARGING / IMPORTING"}
            </p>
          </div>

          <div className="glass-panel p-4.5 rounded-xl">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">Cell Temperature avg</span>
            <div className="flex items-baseline space-x-1.5 mt-3">
              <span className="text-2xl font-bold font-mono text-zinc-100">{(weather?.temperature ?? 20) + 4.5}</span>
              <span className="text-xs text-zinc-500">°C</span>
            </div>
            <p className="text-[10px] text-zinc-500 font-mono mt-1">COOLING PUMPS: ACTIVE (30% CAPACITY)</p>
          </div>
        </div>
      )}

      {/* Main Charts area */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Plant Production History Chart */}
        <div className="glass-panel p-6 rounded-xl xl:col-span-2 min-h-[350px]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-semibold tracking-wide">Live Output Trend</h3>
              <p className="text-[10px] text-zinc-500 font-mono">REAL-TIME SCADA TELEMETRY STREAM (ROLLING TIMELINE)</p>
            </div>
            <span className="text-[9px] font-mono bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded text-emerald-500">
              5s INTERVAL
            </span>
          </div>

          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={recentMetrics}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(63, 63, 70, 0.2)" vertical={false} />
                <XAxis
                  dataKey="timestamp"
                  stroke="#71717a"
                  fontSize={9}
                  tickFormatter={(t) => new Date(t).toLocaleTimeString()}
                  tickLine={false}
                />
                <YAxis stroke="#71717a" fontSize={9} tickLine={false} axisLine={false} label={{ value: "Power (MW)", angle: -90, position: "insideLeft", style: { fill: "#71717a", fontSize: 9 } }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#09090b",
                    borderColor: "#27272a",
                    fontSize: "11px",
                    fontFamily: "monospace",
                    color: "#f4f4f5",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="powerOutput"
                  name="Active Power (MW)"
                  stroke={isSolar ? "#f59e0b" : isWind ? "#0ea5e9" : "#10b981"}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Substation Thermal Map / Balancer Grid */}
        <div className="glass-panel p-6 rounded-xl min-h-[350px] flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold tracking-wide mb-4">
              {isSolar ? "String Inverter Array Grid" : isWind ? "Active Turbine Block Status" : "BESS Storage Containment Matrix"}
            </h3>

            {/* Simulated cells grids */}
            <div className="grid grid-cols-5 gap-2.5">
              {Array.from({ length: 20 }).map((_, idx) => {
                let cellColor = "bg-emerald-500/10 border-emerald-500/30 text-emerald-500";
                let titleText = `Module ${idx + 1}: NOMINAL`;
                if (plant.healthScore < 93 && idx === 7) {
                  cellColor = "bg-red-500/20 border-red-500/40 text-red-500 animate-pulse";
                  titleText = `Module ${idx + 1}: ALARM`;
                } else if (plant.healthScore < 95 && idx === 12) {
                  cellColor = "bg-yellow-500/15 border-yellow-500/35 text-yellow-500";
                  titleText = `Module ${idx + 1}: WARNING`;
                }
                return (
                  <div
                    key={idx}
                    title={titleText}
                    className={`aspect-square border rounded-md flex items-center justify-center text-[9px] font-mono font-bold transition-all ${cellColor}`}
                  >
                    {idx + 1}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 border-t border-zinc-900 pt-4 text-[10px] text-zinc-500 font-mono flex justify-between">
            <span>VOLT LOCK: OK</span>
            <span>TEMP RANGE: 18 - 36°C</span>
          </div>
        </div>
      </div>

      {/* Plant Active Alarms Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-xl xl:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
            <h3 className="text-sm font-semibold tracking-wide flex items-center gap-1.5">
              <ShieldAlert className="h-4.5 w-4.5 text-zinc-400" /> Active Alarms
            </h3>
            <span className="text-[10px] text-zinc-500 font-mono">{activeAlarms.length} ACTIVE</span>
          </div>

          {activeAlarms.length === 0 ? (
            <div className="text-center py-10 text-zinc-500 text-xs">
              <Check className="h-6 w-6 text-emerald-500 mx-auto mb-2" />
              All components for this plant are operating within normal limits.
            </div>
          ) : (
            <div className="space-y-3">
              {activeAlarms.map((a: any) => (
                <div
                  key={a._id}
                  className="p-3 bg-zinc-900/60 border border-zinc-900 rounded-lg text-xs flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded-[4px] text-[9px] font-bold font-mono uppercase ${
                        a.severity === "critical"
                          ? "bg-red-500/10 text-red-500 border border-red-500/20"
                          : a.severity === "high"
                          ? "bg-orange-500/10 text-orange-500 border border-orange-500/20"
                          : "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
                      }`}>
                        {a.severity}
                      </span>
                      <span className="font-bold text-zinc-300 font-mono">{a.code}</span>
                      <span className="text-zinc-500 text-[10px] font-mono">
                        {new Date(a.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-zinc-400 mt-1">{a.message}</p>
                    <p className="text-[10px] text-zinc-500 mt-1 font-mono uppercase">
                      ASSIGNED TECH: {a.assignedEngineer ?? "UNASSIGNED"}
                    </p>
                  </div>

                  <div className="flex space-x-2">
                    {a.status === "active" ? (
                      <button
                        onClick={() => ackAlarm({ alarmId: a._id, engineerName: "Elena Rostova" })}
                        className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded text-[10px] font-mono transition-all border border-zinc-700"
                      >
                        ACK
                      </button>
                    ) : (
                      <button
                        onClick={() => resolveAlarm({ alarmId: a._id, engineerName: "Elena Rostova" })}
                        className="bg-emerald-500/10 hover:bg-emerald-500/25 border border-emerald-500/25 text-emerald-400 px-3 py-1.5 rounded text-[10px] font-mono transition-all"
                      >
                        RESOLVE
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Schedule Field Dispatch Form */}
        <div className="glass-panel p-6 rounded-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3 mb-4">
              <h3 className="text-sm font-semibold tracking-wide flex items-center gap-1.5">
                <Wrench className="h-4.5 w-4.5 text-zinc-400" /> Dispatch Specialist
              </h3>
              <span className="text-[10px] text-zinc-500 font-mono uppercase">Work Orders</span>
            </div>

            <form onSubmit={handleScheduleMaint} className="space-y-3.5 text-xs">
              {/* Asset Select */}
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500 font-mono uppercase">Target Equipment</label>
                <select
                  required
                  value={selectedAssetId}
                  onChange={(e) => setSelectedAssetId(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 p-2 rounded focus:outline-none"
                >
                  <option value="">Select Asset...</option>
                  {assets.map((a: any) => (
                    <option key={a._id} value={a._id}>
                      {a.name} ({a.status})
                    </option>
                  ))}
                </select>
              </div>

              {/* Maintenance Type */}
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500 font-mono uppercase">Maintenance Type</label>
                <div className="grid grid-cols-3 gap-2 font-mono text-[10px]">
                  {["preventive", "corrective", "predictive"].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setMaintType(t as any)}
                      className={`py-1.5 rounded border text-center uppercase tracking-wide transition-all ${
                        maintType === t
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold"
                          : "bg-zinc-900 border-zinc-800 text-zinc-500"
                      }`}
                    >
                      {t.substring(0, 4)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Specialist */}
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500 font-mono uppercase">Assigned Technician</label>
                <select
                  required
                  value={maintEngineer}
                  onChange={(e) => setMaintEngineer(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 p-2 rounded focus:outline-none"
                >
                  <option value="">Select Technician...</option>
                  <option value="Sarah Connor">Sarah Connor (BESS Specialist)</option>
                  <option value="John Doe">John Doe (Solar PV Inspector)</option>
                  <option value="Marcus Vance">Marcus Vance (HV Transformer Engineer)</option>
                  <option value="Elena Rostova">Elena Rostova (Turbine Controls Analyst)</option>
                </select>
              </div>

              {/* Dispatch date */}
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500 font-mono uppercase">Dispatch Date</label>
                <input
                  type="date"
                  required
                  value={maintDate}
                  onChange={(e) => setMaintDate(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 p-2 rounded focus:outline-none font-mono"
                />
              </div>

              {/* Task Description */}
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500 font-mono uppercase">Statement of Work</label>
                <textarea
                  required
                  placeholder="Task breakdown notes..."
                  value={maintDesc}
                  onChange={(e) => setMaintDesc(e.target.value)}
                  rows={2}
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 p-2 rounded focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold uppercase py-2 rounded text-[10px] font-mono tracking-widest flex items-center justify-center gap-1.5 transition-all"
              >
                <Send className="h-3 w-3" /> Dispatch Field Team
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Asset Inventory Table */}
      <div className="glass-panel p-6 rounded-xl">
        <div className="flex items-center justify-between border-b border-zinc-900 pb-3 mb-4">
          <h3 className="text-sm font-semibold tracking-wide flex items-center gap-1.5">
            <Cpu className="h-4.5 w-4.5 text-zinc-400" /> Equipment Registry
          </h3>
          <span className="text-[10px] text-zinc-500 font-mono uppercase">{assets.length} ACTIVE ASSETS</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-zinc-900 text-zinc-500">
                <th className="font-medium pb-2.5">ASSET NAME</th>
                <th className="font-medium pb-2.5">TYPE</th>
                <th className="font-medium pb-2.5 text-right">HEALTH SCORE</th>
                <th className="font-medium pb-2.5 text-right">MANUFACTURER</th>
                <th className="font-medium pb-2.5 text-right">STATUS</th>
                <th className="font-medium pb-2.5 text-right">SERIAL NUMBER</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((a: any) => (
                <tr key={a._id} className="hover:bg-zinc-900/20 border-b border-zinc-900/40">
                  <td className="font-semibold text-zinc-200 py-3">{a.name}</td>
                  <td className="py-3 uppercase text-[10px]">{a.type}</td>
                  <td className={`text-right py-3 font-semibold ${
                    a.healthScore > 90 ? "text-emerald-400" : a.healthScore > 85 ? "text-yellow-400" : "text-red-400"
                  }`}>{a.healthScore.toFixed(1)}%</td>
                  <td className="text-right py-3 text-zinc-400">{a.manufacturer}</td>
                  <td className="text-right py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                      a.status === "online" 
                        ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" 
                        : "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
                    }`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="text-right py-3 text-zinc-400">{a.serialNumber}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
