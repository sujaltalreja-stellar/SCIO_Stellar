import React, { useState } from "react";
import { useQuery } from "../../lib/convex";
import { api } from "../../lib/convex";
import { motion } from "framer-motion";
import {
  Sun,
  Wind,
  CloudRain,
  CloudSun,
  Thermometer,
  Droplets,
  Cloud,
  ChevronRight,
  ShieldAlert,
  Info
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

interface WeatherMonitorProps {
  onSelectPlant: (plantId: string) => void;
}

export default function WeatherMonitor({ onSelectPlant }: WeatherMonitorProps) {
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);

  // Queries
  const plants = useQuery(api.plants.list) ?? [];
  const activePlantId = selectedPlantId || (plants[0]?._id ?? "");
  const plantDetails = useQuery(
    api.plants.getById,
    activePlantId ? { plantId: activePlantId as any } : (null as any)
  );

  // Format historical weather points for the selected plant
  const weatherHistory = plantDetails?.recentMetrics?.map((m: any, idx: number) => {
    // Generate simulated weather timeline matching telemetry timestamps
    const cloud = plantDetails.weather?.cloudCover ?? 30;
    const temp = plantDetails.weather?.temperature ?? 22;
    const wind = plantDetails.weather?.windSpeed ?? 5;
    const irr = plantDetails.weather?.irradiance ?? 0;

    return {
      time: new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      temperature: parseFloat((temp + Math.sin(idx / 3) * 3).toFixed(1)),
      windSpeed: parseFloat(Math.max(0.5, wind + Math.cos(idx / 2) * 2).toFixed(1)),
      irradiance: parseFloat(Math.max(0, irr + Math.sin(idx / 4) * 150).toFixed(0)),
    };
  }) ?? [];

  const handlePlantClick = (plantId: string) => {
    setSelectedPlantId(plantId);
  };

  const activePlant = plants.find((p: any) => p._id === activePlantId);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Environmental & Weather Monitor</h2>
          <p className="text-xs text-zinc-500 font-mono">PORTFOLIO MICROCLIMATES AND METEOROLOGICAL DATA</p>
        </div>
      </div>

      {/* Warning Alert Banner */}
      <div className="bg-blue-950/10 border border-blue-900/40 p-4 rounded-xl flex items-start space-x-3 text-xs">
        <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-bold text-zinc-200 uppercase tracking-wider font-mono">Generation Impact Analytics</h4>
          <p className="text-zinc-400 leading-relaxed font-sans">
            Solar array yields degrade by 0.4% per °C above 25°C panel module temperature. Wind turbine gear boxes cut out at wind speeds exceeding 25 m/s to prevent structural fatigue. BESS cooling loops toggle high capacity at cell temperatures above 35°C to avoid accelerated thermal degradation.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column: Plant List with brief weather snapshot */}
        <div className="glass-panel p-5 rounded-xl flex flex-col h-[520px]">
          <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-wider border-b border-zinc-900 pb-3 mb-4">
            Plant Microclimates
          </h3>
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {plants.map((p: any) => {
              const isActive = p._id === activePlantId;
              const isSolar = p.type === "solar";
              const isWind = p.type === "wind";

              let icon = <CloudSun className="h-4.5 w-4.5 text-zinc-400" />;
              if (isSolar && p.weatherDesc === "Sunny") {
                icon = <Sun className="h-4.5 w-4.5 text-amber-500 animate-spin" style={{ animationDuration: "12s" }} />;
              } else if (isWind) {
                icon = <Wind className="h-4.5 w-4.5 text-sky-400" />;
              }

              return (
                <div
                  key={p._id}
                  onClick={() => handlePlantClick(p._id)}
                  className={`p-3 border rounded-lg cursor-pointer transition-all flex items-center justify-between text-xs font-mono ${
                    isActive
                      ? "bg-zinc-900 border-zinc-800 font-semibold text-zinc-200"
                      : "bg-zinc-950/40 border-zinc-950 hover:bg-zinc-900/30 text-zinc-400"
                  }`}
                >
                  <div className="overflow-hidden">
                    <h4 className="font-bold text-zinc-200 truncate">{p.name}</h4>
                    <p className="text-[9px] text-zinc-500 uppercase mt-0.5">{p.type} • {p.location}</p>
                  </div>
                  
                  <div className="flex items-center space-x-4 ml-4 flex-shrink-0">
                    <div className="flex items-center space-x-1.5">
                      {icon}
                      <span className="text-zinc-300">{p.weatherTemp.toFixed(0)}°C</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Center/Right Column: Detailed Plant Weather Insights */}
        {plantDetails && activePlant && (
          <div className="xl:col-span-2 space-y-6">
            {/* Snap Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="glass-panel p-4.5 rounded-xl flex items-center space-x-3">
                <Thermometer className="h-8 w-8 text-zinc-500" />
                <div>
                  <span className="text-[9px] text-zinc-500 uppercase font-mono tracking-wider">Air Temperature</span>
                  <h4 className="text-xl font-bold font-mono text-zinc-100">{plantDetails.weather?.temperature.toFixed(1)}°C</h4>
                </div>
              </div>
              
              <div className="glass-panel p-4.5 rounded-xl flex items-center space-x-3">
                <Droplets className="h-8 w-8 text-zinc-500" />
                <div>
                  <span className="text-[9px] text-zinc-500 uppercase font-mono tracking-wider">Humidity Index</span>
                  <h4 className="text-xl font-bold font-mono text-zinc-100">{plantDetails.weather?.humidity}%</h4>
                </div>
              </div>

              <div className="glass-panel p-4.5 rounded-xl flex items-center space-x-3">
                {activePlant.type === "solar" ? (
                  <>
                    <Sun className="h-8 w-8 text-amber-500 animate-pulse" />
                    <div>
                      <span className="text-[9px] text-zinc-500 uppercase font-mono tracking-wider">Solar Radiance</span>
                      <h4 className="text-xl font-bold font-mono text-zinc-100">{plantDetails.weather?.irradiance ?? 0} W/m²</h4>
                    </div>
                  </>
                ) : (
                  <>
                    <Wind className="h-8 w-8 text-sky-400" />
                    <div>
                      <span className="text-[9px] text-zinc-500 uppercase font-mono tracking-wider">Wind velocity</span>
                      <h4 className="text-xl font-bold font-mono text-zinc-100">{plantDetails.weather?.windSpeed.toFixed(1)} m/s</h4>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Weather Area Timeline Chart */}
            <div className="glass-panel p-6 rounded-xl min-h-[360px] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-sm font-semibold tracking-wide">24h Environmental Timeline</h3>
                    <p className="text-[10px] text-zinc-500 font-mono uppercase">
                      Microclimate variables at {activePlant.name}
                    </p>
                  </div>
                  <span className="text-[9px] font-mono bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded text-zinc-400 uppercase">
                    {activePlant.type} parameters
                  </span>
                </div>

                <div className="h-[220px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={weatherHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorWindSpd" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorIrr" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(63, 63, 70, 0.2)" vertical={false} />
                      <XAxis dataKey="time" stroke="#71717a" fontSize={9} tickLine={false} />
                      <YAxis stroke="#71717a" fontSize={9} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#09090b",
                          borderColor: "#27272a",
                          fontSize: "11px",
                          fontFamily: "monospace",
                          color: "#f4f4f5",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="temperature"
                        name="Temp (°C)"
                        stroke="#ef4444"
                        strokeWidth={1.5}
                        fillOpacity={1}
                        fill="url(#colorTemp)"
                      />
                      {activePlant.type === "wind" ? (
                        <Area
                          type="monotone"
                          dataKey="windSpeed"
                          name="Wind (m/s)"
                          stroke="#0ea5e9"
                          strokeWidth={1.5}
                          fillOpacity={1}
                          fill="url(#colorWindSpd)"
                        />
                      ) : (
                        <Area
                          type="monotone"
                          dataKey="irradiance"
                          name="Irradiance (W/m²)"
                          stroke="#f59e0b"
                          strokeWidth={1.5}
                          fillOpacity={1}
                          fill="url(#colorIrr)"
                        />
                      )}
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="mt-4 border-t border-zinc-900 pt-4 text-center">
                <button
                  onClick={() => onSelectPlant(activePlant._id)}
                  className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-850 text-[10px] font-bold tracking-wider font-mono text-emerald-400 uppercase py-2.5 px-6 rounded inline-flex items-center gap-1.5 transition-all group"
                >
                  Enter Plant Operations Room <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
