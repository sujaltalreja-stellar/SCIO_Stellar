"use client";

import React, { useState, useEffect } from "react";
import {
  Activity,
  Radio,
  Gauge,
  Zap,
  Flame,
  Layers,
  Cpu,
  RefreshCw,
  Sliders,
  Sparkles,
  Waves,
  Eye,
  SlidersHorizontal,
  Server,
  Share2,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell
} from "recharts";

interface IndustrialCockpitHUDProps {
  currentIndustry: string;
}

export default function IndustrialCockpitHUD({ currentIndustry }: IndustrialCockpitHUDProps) {
  const [hudView, setHudView] = useState<"spectrum" | "heatmap" | "topology">("spectrum");
  const [liveStreamActive, setLiveStreamActive] = useState<boolean>(true);
  const [selectedHeatmapCell, setSelectedHeatmapCell] = useState<{ zone: string; hour: number; temp: number; status: string } | null>(null);

  // 24-Band FFT Audio & Vibration Spectral Analyzer Data
  const [spectrumBands, setSpectrumBands] = useState([
    { freq: "20Hz", amplitude: 42, color: "#00f0ff" },
    { freq: "40Hz", amplitude: 65, color: "#00f0ff" },
    { freq: "63Hz", amplitude: 78, color: "#00f0ff" },
    { freq: "100Hz", amplitude: 92, color: "#38bdf8" },
    { freq: "160Hz", amplitude: 84, color: "#38bdf8" },
    { freq: "250Hz", amplitude: 58, color: "#818cf8" },
    { freq: "400Hz", amplitude: 72, color: "#818cf8" },
    { freq: "630Hz", amplitude: 88, color: "#a855f7" },
    { freq: "1kHz", amplitude: 95, color: "#a855f7" },
    { freq: "1.6kHz", amplitude: 82, color: "#c084fc" },
    { freq: "2.5kHz", amplitude: 64, color: "#c084fc" },
    { freq: "4kHz", amplitude: 48, color: "#00ff9d" },
    { freq: "6.3kHz", amplitude: 56, color: "#00ff9d" },
    { freq: "8kHz", amplitude: 70, color: "#34d399" },
    { freq: "10kHz", amplitude: 85, color: "#f59e0b" },
    { freq: "12kHz", amplitude: 76, color: "#f59e0b" },
    { freq: "14kHz", amplitude: 62, color: "#fb923c" },
    { freq: "16kHz", amplitude: 45, color: "#fb923c" },
    { freq: "18kHz", amplitude: 38, color: "#ff6b00" },
    { freq: "20kHz", amplitude: 30, color: "#ff6b00" },
    { freq: "22kHz", amplitude: 52, color: "#ff0055" },
    { freq: "24kHz", amplitude: 68, color: "#ff0055" },
    { freq: "26kHz", amplitude: 44, color: "#ff0055" },
    { freq: "28kHz", amplitude: 25, color: "#ff0055" }
  ]);

  // Live Jiggle for Spectral Bands
  useEffect(() => {
    if (!liveStreamActive) return;
    const interval = setInterval(() => {
      setSpectrumBands(prev => prev.map(band => ({
        ...band,
        amplitude: Math.min(100, Math.max(15, Math.round(band.amplitude + (Math.random() - 0.5) * 16)))
      })));
    }, 2500);

    return () => clearInterval(interval);
  }, [liveStreamActive]);

  // Heatmap Zones
  const zones = [
    "Turbine Gen ST-01",
    "Turbine Gen ST-02",
    "Inverter Array INV-A",
    "Inverter Array INV-B",
    "Main XFMR 500kV",
    "Step-Up XFMR 230kV",
    "BESS Bank Alpha",
    "BESS Bank Beta"
  ];

  // Colors for Heatmap values (18°C to 85°C)
  const getHeatmapColor = (temp: number) => {
    if (temp < 30) return "bg-sky-950/80 border-sky-800/40 text-sky-400";
    if (temp < 45) return "bg-emerald-950/80 border-emerald-800/40 text-emerald-400";
    if (temp < 60) return "bg-amber-950/80 border-amber-800/40 text-amber-400";
    if (temp < 75) return "bg-orange-950/80 border-orange-800/40 text-orange-400";
    return "bg-rose-950/90 border-rose-700/60 text-rose-300 font-bold animate-pulse";
  };

  return (
    <div className="space-y-6">
      {/* ==================== 1. FORTUNE 500 AEROSPACE RADIAL DIAL CLUSTER ==================== */}
      <section className="cockpit-panel p-6 border border-slate-700/40 shadow-2xl relative overflow-hidden">
        {/* Ambient Top Glow Line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-5 mb-6">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg chrome-plate flex items-center justify-center border border-slate-600/40 text-cyan-400 shadow-sm">
              <Gauge className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold tracking-[0.25em] text-cyan-400 uppercase">
                  Telemetry Instrumentation Cockpit
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                  REAL-TIME DSP
                </span>
              </div>
              <h2 className="text-xl font-bold font-display tracking-tight text-white mt-0.5">
                Multi-Vector Harmonic & Physical Diagnostics
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            <button
              onClick={() => setHudView("spectrum")}
              className={`px-3 py-1.5 rounded-lg border transition-all ${
                hudView === "spectrum"
                  ? "chrome-plate text-cyan-300 border-cyan-500/50 shadow-sm font-bold"
                  : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200"
              }`}
            >
              ⚡ 24-Band FFT Spectrum
            </button>

            <button
              onClick={() => setHudView("heatmap")}
              className={`px-3 py-1.5 rounded-lg border transition-all ${
                hudView === "heatmap"
                  ? "chrome-plate text-amber-300 border-amber-500/50 shadow-sm font-bold"
                  : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200"
              }`}
            >
              🔥 24h Thermal Matrix
            </button>

            <button
              onClick={() => setHudView("topology")}
              className={`px-3 py-1.5 rounded-lg border transition-all ${
                hudView === "topology"
                  ? "chrome-plate text-emerald-300 border-emerald-500/50 shadow-sm font-bold"
                  : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200"
              }`}
            >
              🌐 SCADA Node Mesh
            </button>

            <button
              onClick={() => setLiveStreamActive(!liveStreamActive)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs"
              title="Toggle Live Stream"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${liveStreamActive ? "animate-spin text-cyan-400" : ""}`} />
            </button>
          </div>
        </div>

        {/* 4 Concentric Radial Cockpit Meters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* DIAL 1: GRID FREQUENCY SYNCHRONIZATION */}
          <div className="silver-card p-4 flex items-center gap-4">
            <div className="relative h-20 w-20 flex-shrink-0 flex items-center justify-center">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  strokeWidth="3.2"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-cyan-400 drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]"
                  strokeDasharray="98, 100"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute font-mono text-xs font-bold text-cyan-300">50.02</span>
            </div>
            <div>
              <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block">Grid Frequency</span>
              <span className="text-sm font-bold text-white font-mono">50.02 Hz</span>
              <span className="text-[10px] font-mono text-emerald-400 block mt-0.5">±0.01Hz Phase Locked</span>
            </div>
          </div>

          {/* DIAL 2: INVERTER LOAD FACTOR */}
          <div className="silver-card p-4 flex items-center gap-4">
            <div className="relative h-20 w-20 flex-shrink-0 flex items-center justify-center">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  strokeWidth="3.2"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-emerald-400 drop-shadow-[0_0_8px_rgba(0,255,157,0.8)]"
                  strokeDasharray="86, 100"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute font-mono text-xs font-bold text-emerald-300">86.4%</span>
            </div>
            <div>
              <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block">Active Power Yield</span>
              <span className="text-sm font-bold text-white font-mono">2,480 MW</span>
              <span className="text-[10px] font-mono text-emerald-400 block mt-0.5">Optimal PPA Influx</span>
            </div>
          </div>

          {/* DIAL 3: SUBSTATION THERMAL FLUX */}
          <div className="silver-card p-4 flex items-center gap-4">
            <div className="relative h-20 w-20 flex-shrink-0 flex items-center justify-center">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  strokeWidth="3.2"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]"
                  strokeDasharray="64, 100"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute font-mono text-xs font-bold text-amber-300">54.2°</span>
            </div>
            <div>
              <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block">Thermal Hotspot</span>
              <span className="text-sm font-bold text-white font-mono">54.2°C Oil Core</span>
              <span className="text-[10px] font-mono text-amber-400 block mt-0.5">18.0°C Safe Margin</span>
            </div>
          </div>

          {/* DIAL 4: ASSET HEALTH INDEX */}
          <div className="silver-card p-4 flex items-center gap-4">
            <div className="relative h-20 w-20 flex-shrink-0 flex items-center justify-center">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  strokeWidth="3.2"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]"
                  strokeDasharray="98, 100"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute font-mono text-xs font-bold text-purple-300">98.6%</span>
            </div>
            <div>
              <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block">Reliability Factor</span>
              <span className="text-sm font-bold text-white font-mono">98.6% MTBF</span>
              <span className="text-[10px] font-mono text-purple-400 block mt-0.5">Zero Trip Warnings</span>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== 2. MAIN DYNAMIC HUD VISUALIZATION CANVAS ==================== */}
      {hudView === "spectrum" && (
        <section className="cockpit-panel p-6 border border-slate-700/40 shadow-2xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Waves className="h-4 w-4 text-cyan-400" />
                <h3 className="text-base font-bold font-display text-white">24-Band FFT Audio & Vibration Spectral Analyzer</h3>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Real-time acoustic vibration signature monitoring for early bearing raceway flaking and turbine cavitation.
              </p>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-mono">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-cyan-400" /> Sub-harmonic</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-purple-400" /> Fundamental 1X</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-400" /> High-freq FFT</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-rose-500" /> Ultrasonic</span>
            </div>
          </div>

          {/* 24-Band Animated Spectrum Graphic */}
          <div className="h-64 flex items-end justify-between gap-1.5 pt-4 px-2 bg-[#0a0d14] rounded-xl border border-slate-800/80">
            {spectrumBands.map((band, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group cursor-pointer">
                {/* Value tooltip on hover */}
                <span className="opacity-0 group-hover:opacity-100 text-[9px] font-mono text-white transition-opacity">
                  {band.amplitude}%
                </span>
                
                {/* Bar */}
                <div className="w-full bg-slate-900 rounded-t-sm overflow-hidden flex flex-col justify-end h-4/5">
                  <div
                    className="w-full rounded-t-sm transition-all duration-300"
                    style={{
                      height: `${band.amplitude}%`,
                      backgroundColor: band.color,
                      boxShadow: `0 0 12px ${band.color}66`
                    }}
                  />
                </div>

                {/* Frequency Label */}
                <span className="text-[8px] font-mono text-slate-500 rotate-[-45deg] origin-center truncate mt-1">
                  {band.freq}
                </span>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center text-xs font-mono text-slate-400 pt-2">
            <span>SAMPLING RATE: 96.0 kS/s • RESOLUTION: 24-BIT Σ-Δ ADC</span>
            <span className="text-emerald-400 font-bold">ACOUSTIC INTEGRITY: NOMINAL</span>
          </div>
        </section>
      )}

      {/* ==================== 3. 24-HOUR THERMAL TELEMETRY HEATMAP ==================== */}
      {hudView === "heatmap" && (
        <section className="cockpit-panel p-6 border border-slate-700/40 shadow-2xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-amber-400" />
                <h3 className="text-base font-bold font-display text-white">24-Hour 8-Zone Machine Thermal Telemetry Matrix</h3>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Hourly thermal flux logs across primary equipment cores. Click any cell to inspect peak telemetry.
              </p>
            </div>

            <div className="flex items-center gap-2 text-[10px] font-mono">
              <span className="px-2 py-0.5 bg-sky-950 border border-sky-800 text-sky-400 rounded">Cool (&lt;30°C)</span>
              <span className="px-2 py-0.5 bg-emerald-950 border border-emerald-800 text-emerald-400 rounded">Nominal (30-45°C)</span>
              <span className="px-2 py-0.5 bg-amber-950 border border-amber-800 text-amber-400 rounded">Elevated (45-60°C)</span>
              <span className="px-2 py-0.5 bg-rose-950 border border-rose-700 text-rose-300 rounded">Critical (&gt;75°C)</span>
            </div>
          </div>

          {/* Matrix Grid */}
          <div className="overflow-x-auto">
            <div className="min-w-[700px] space-y-1.5">
              {/* Hour Header */}
              <div className="grid grid-cols-25 gap-1 text-[9px] font-mono text-slate-500 pl-36">
                {Array.from({ length: 24 }).map((_, h) => (
                  <span key={h} className="text-center">{String(h).padStart(2, "0")}h</span>
                ))}
              </div>

              {/* Rows */}
              {zones.map((zone, zIdx) => (
                <div key={zone} className="flex items-center gap-2">
                  <span className="w-36 text-[11px] font-mono font-semibold text-slate-300 truncate">{zone}</span>
                  <div className="flex-1 grid grid-cols-24 gap-1">
                    {Array.from({ length: 24 }).map((_, h) => {
                      // Generate semi-realistic temp curve with peak during mid-day
                      const baseTemp = 28 + (zIdx * 4);
                      const dayFactor = Math.sin((h / 24) * Math.PI) * 22;
                      const temp = +(baseTemp + dayFactor + (Math.sin(h + zIdx) * 3)).toFixed(1);
                      const colorClass = getHeatmapColor(temp);

                      return (
                        <div
                          key={h}
                          onClick={() => setSelectedHeatmapCell({ zone, hour: h, temp, status: temp > 70 ? "Warning" : "Nominal" })}
                          className={`h-7 rounded flex items-center justify-center border text-[9px] font-mono cursor-pointer transition-all hover:scale-110 hover:z-10 ${colorClass}`}
                          title={`${zone} at ${h}:00 - ${temp}°C`}
                        >
                          {Math.round(temp)}°
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selectedHeatmapCell && (
            <div className="p-3 bg-slate-900/80 border border-slate-700 rounded-lg text-xs font-mono flex items-center justify-between text-slate-300">
              <span>Selected: <strong className="text-white">{selectedHeatmapCell.zone}</strong> at {selectedHeatmapCell.hour}:00 UTC</span>
              <span>Temperature: <strong className="text-amber-400">{selectedHeatmapCell.temp}°C</strong></span>
              <span className="text-emerald-400 font-bold">STATUS: {selectedHeatmapCell.status}</span>
            </div>
          )}
        </section>
      )}

      {/* ==================== 4. SCADA NODE INTERCONNECT TOPOLOGY MESH ==================== */}
      {hudView === "topology" && (
        <section className="cockpit-panel p-6 border border-slate-700/40 shadow-2xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Share2 className="h-4 w-4 text-emerald-400" />
                <h3 className="text-base font-bold font-display text-white">Distributed SCADA RTU & PLC Mesh Topology</h3>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Fiber optic ring bus and satellite telemetry uplink interconnections with zero packet drop.
              </p>
            </div>
            <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-300 px-2.5 py-1 rounded border border-emerald-500/20">
              IEC 61850 / DNP3 PROTOCOL OK
            </span>
          </div>

          {/* Interactive Topology Graph Visualizer */}
          <div className="h-64 bg-[#090c12] rounded-xl border border-slate-800 relative flex items-center justify-around p-4 overflow-hidden">
            {/* Background Grid Lines */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:32px_32px] opacity-20" />

            {/* NODE 1: Substation RTU */}
            <div className="relative z-10 p-3.5 silver-card text-center space-y-1 w-44 border-cyan-500/40">
              <span className="text-[9px] font-mono text-cyan-400 font-bold block">RTU-SUB-500kV</span>
              <h4 className="text-xs font-bold text-white font-mono">Main Substation</h4>
              <span className="text-[10px] text-emerald-400 font-mono block">12ms Latency</span>
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping inline-block mt-1"></span>
            </div>

            {/* Pulsing Connector Line 1 */}
            <div className="relative z-10 flex-1 h-0.5 bg-gradient-to-r from-cyan-500 via-purple-500 to-emerald-500 relative">
              <span className="absolute top-[-4px] left-1/2 h-2.5 w-2.5 rounded-full bg-white animate-ping" />
            </div>

            {/* NODE 2: Edge Gateway */}
            <div className="relative z-10 p-3.5 silver-card text-center space-y-1 w-44 border-purple-500/40">
              <span className="text-[9px] font-mono text-purple-400 font-bold block">GW-EDGE-01</span>
              <h4 className="text-xs font-bold text-white font-mono">SCIO Edge Gateway</h4>
              <span className="text-[10px] text-purple-300 font-mono block">4,800 tags/sec</span>
              <span className="h-2 w-2 rounded-full bg-purple-400 animate-ping inline-block mt-1"></span>
            </div>

            {/* Pulsing Connector Line 2 */}
            <div className="relative z-10 flex-1 h-0.5 bg-gradient-to-r from-purple-500 via-emerald-500 to-cyan-500 relative">
              <span className="absolute top-[-4px] left-1/2 h-2.5 w-2.5 rounded-full bg-cyan-300 animate-ping" />
            </div>

            {/* NODE 3: Cloud Telemetry Hub */}
            <div className="relative z-10 p-3.5 silver-card text-center space-y-1 w-44 border-emerald-500/40">
              <span className="text-[9px] font-mono text-emerald-400 font-bold block">SAT-UPLINK-09</span>
              <h4 className="text-xs font-bold text-white font-mono">Cloud Ops Room</h4>
              <span className="text-[10px] text-emerald-400 font-mono block">Zero Loss • 99.999%</span>
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping inline-block mt-1"></span>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
