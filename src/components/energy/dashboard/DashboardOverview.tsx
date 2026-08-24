"use client";

import React, { useState, useEffect } from "react";
import { 
  Zap, 
  TrendingUp, 
  Leaf, 
  AlertTriangle, 
  Layers, 
  ChevronRight, 
  ShieldAlert, 
  Heart, 
  Sun,
  Activity,
  Gauge,
  Flame,
  Radio,
  Waves,
  Cpu,
  RefreshCw,
  Terminal,
  Share2
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

import { mockDb } from "../../../config/energyMockDb";

interface DashboardOverviewProps {
  onSelectPlant: (plantId: string) => void;
}

export default function DashboardOverview({ onSelectPlant }: DashboardOverviewProps) {
  const [activeVisualMode, setActiveVisualMode] = useState<"spectral" | "thermal" | "topology">("spectral");

  // === Live telemetry state (client-only, deterministic init) ===
  const [livePower, setLivePower] = useState(2480.5);
  const [thermalTemp, setThermalTemp] = useState(54.2);
  const [todayProduction, setTodayProduction] = useState(18450.2);
  const [fleetHealth, setFleetHealth] = useState(94.6);
  const [gridFreq, setGridFreq] = useState(50.00);
  const [loadFactor, setLoadFactor] = useState(86.4);

  // === FFT spectrum bands amplitudes (dance every 350ms) ===
  const [spectrumAmplitudes, setSpectrumAmplitudes] = useState<
    number[]
  >([42, 65, 78, 92, 84, 58, 72, 88, 95, 82, 64, 48, 56, 70, 85, 76, 62, 45, 38, 30, 52, 68, 44, 25]);

  // === Rolling live dispatch waveform (last 40 points) ===
  const [liveChartData, setLiveChartData] = useState({
    solar: [] as number[],
    wind: [] as number[],
    bess: [] as number[],
    thermal: [] as number[],
  });

  // === Interval: update live telemetry every 1.5s ===
  useEffect(() => {
    const interval = setInterval(() => {
      setLivePower((prev) => Math.max(2400, Math.min(2600, prev + (Math.random() - 0.5) * 20)));
      setThermalTemp((prev) => Math.max(48, Math.min(68, prev + (Math.random() - 0.5) * 2)));
      setTodayProduction((prev) => Math.max(18000, prev + (Math.random() - 0.5) * 2));
      setFleetHealth((prev) => Math.max(90, Math.min(98, prev + (Math.random() - 0.5) * 0.5)));
      setGridFreq((prev) => Math.max(49.95, Math.min(50.05, prev + (Math.random() - 0.5) * 0.02)));
      setLoadFactor((prev) => Math.max(80, Math.min(95, prev + (Math.random() - 0.5) * 1)));
      // append new point to rolling chart
      const now = Date.now();
      const t = now;
      const base = 200 + 300 * Math.sin((liveChartData.solar.length * 0.3) + (now / 1000));
      setLiveChartData((prev) => ({
        solar: [...prev.solar, Math.max(0, base + Math.sin(prev.solar.length * 0.5) * 50)],
        wind: [...prev.wind, Math.max(0, base * 0.7 + Math.cos(prev.wind.length * 0.4) * 60)],
        bess: [...prev.bess, Math.max(0, base * 0.4 + Math.sin(prev.bess.length * 0.2) * 40)],
        thermal: [...prev.thermal, Math.max(0, base * 0.5 + Math.cos(prev.thermal.length * 0.6) * 30)],
      }));
    }, 1500);
    return () => clearInterval(interval);
  }, [liveChartData.solar.length]);

  // === Interval: update FFT spectrum amplitudes every 350ms ===
  useEffect(() => {
    const interval = setInterval(() => {
      setSpectrumAmplitudes((prev) =>
        prev.map((amp, i) => {
          const direction = i % 2 === 0 ? 1 : -1;
          const change = (Math.random() - 0.5) * 8 * direction;
          return Math.max(0, Math.min(100, amp + change));
        })
      );
    }, 350);
    return () => clearInterval(interval);
  }, [spectrumAmplitudes.length]);

  // ---------- Original static data (unchanged) ----------
  const stats = {
    totalCapacity: 12470,
    onlineCount: 42,
    totalPlants: 50,
    maintenanceCount: 5,
    offlineCount: 3,
    totalLivePower: livePower,
    totalTodayProduction: todayProduction,
    averageHealth: fleetHealth,
    carbonOffsetTonnes: 1420.8,
    activeAlarmsCount: 2,
  };

  const plants = mockDb.plants;

  const mockChartData = [
    { date: "08/10", solar: 820, wind: 1100, bess: 340, thermal: 450 },
    { date: "08/11", solar: 890, wind: 1240, bess: 380, thermal: 420 },
    { date: "08/12", solar: 940, wind: 1050, bess: 360, thermal: 480 },
    { date: "08/13", solar: 780, wind: 1320, bess: 410, thermal: 390 },
    { date: "08/14", solar: 910, wind: 1280, bess: 390, thermal: 410 },
    { date: "08/15", solar: 960, wind: 1150, bess: 370, thermal: 460 },
    { date: "08/16", solar: 880, wind: 1400, bess: 420, thermal: 400 },
    { date: "08/17", solar: 920, wind: 1350, bess: 400, thermal: 430 },
    { date: "08/18", solar: 950, wind: 1200, bess: 380, thermal: 470 },
    { date: "08/19", solar: 870, wind: 1450, bess: 440, thermal: 380 },
    { date: "08/20", solar: 930, wind: 1380, bess: 410, thermal: 420 },
    { date: "08/21", solar: 980, wind: 1250, bess: 390, thermal: 490 },
    { date: "08/22", solar: 910, wind: 1420, bess: 430, thermal: 410 },
    { date: "08/23", solar: 960, wind: 1480, bess: 450, thermal: 440 },
  ];

  const chartData = mockChartData;

  // Filter top & bottom performing plants
  const sortedByGeneration = [...plants].sort((a: any, b: any) => (b.currentPower || b.capacity) - (a.currentPower || a.capacity));
  const topPlants = sortedByGeneration.slice(0, 5);
  const strugglingPlants = [...plants]
    .filter((p: any) => p.status !== "online" || p.healthScore < 90)
    .sort((a: any, b: any) => a.healthScore - b.healthScore)
    .slice(0, 5);

  // === 24-Band FFT data (frequencies fixed, amplitudes from state) ===
  const spectrumBands = [
    { freq: "20Hz", amplitude: spectrumAmplitudes[0], color: "#00f0ff" },
    { freq: "40Hz", amplitude: spectrumAmplitudes[1], color: "#00f0ff" },
    { freq: "63Hz", amplitude: spectrumAmplitudes[2], color: "#00f0ff" },
    { freq: "100Hz", amplitude: spectrumAmplitudes[3], color: "#38bdf8" },
    { freq: "160Hz", amplitude: spectrumAmplitudes[4], color: "#38bdf8" },
    { freq: "250Hz", amplitude: spectrumAmplitudes[5], color: "#818cf8" },
    { freq: "400Hz", amplitude: spectrumAmplitudes[6], color: "#818cf8" },
    { freq: "630Hz", amplitude: spectrumAmplitudes[7], color: "#a855f7" },
    { freq: "1kHz", amplitude: spectrumAmplitudes[8], color: "#a855f7" },
    { freq: "1.6kHz", amplitude: spectrumAmplitudes[9], color: "#c084fc" },
    { freq: "2.5kHz", amplitude: spectrumAmplitudes[10], color: "#c084fc" },
    { freq: "4kHz", amplitude: spectrumAmplitudes[11], color: "#00ff9d" },
    { freq: "6.3kHz", amplitude: spectrumAmplitudes[12], color: "#00ff9d" },
    { freq: "8kHz", amplitude: spectrumAmplitudes[13], color: "#34d399" },
    { freq: "10kHz", amplitude: spectrumAmplitudes[14], color: "#f59e0b" },
    { freq: "12kHz", amplitude: spectrumAmplitudes[15], color: "#f59e0b" },
    { freq: "14kHz", amplitude: spectrumAmplitudes[16], color: "#fb923c" },
    { freq: "16kHz", amplitude: spectrumAmplitudes[17], color: "#fb923c" },
    { freq: "18kHz", amplitude: spectrumAmplitudes[18], color: "#ff6b00" },
    { freq: "20kHz", amplitude: spectrumAmplitudes[19], color: "#ff6b00" },
    { freq: "22kHz", amplitude: spectrumAmplitudes[20], color: "#ff0055" },
    { freq: "24kHz", amplitude: spectrumAmplitudes[21], color: "#ff0055" }
  ];

  const thermalZones = [
    { name: "500kV Main XFMR", temp: thermalTemp, status: thermalTemp > 60 ? "Elevated" : "Nominal", color: thermalTemp > 60 ? "text-orange-400" : "text-amber-400" },
    { name: "Turbine Gen ST-01", temp: Math.max(60, thermalTemp + 14.2), status: "Elevated", color: "text-orange-400" },
    { name: "Inverter Array INV-A", temp: Math.max(30, thermalTemp - 16.1), status: "Cool", color: "text-cyan-400" },
    { name: "BESS Bank Alpha", temp: Math.max(20, thermalTemp - 30.5), status: "Optimal", color: "text-emerald-400" }
  ];

  // Filter top & bottom performing plants by capacity factor/current power output
  const sortedByGeneration2 = [...plants].sort((a: any, b: any) => (b.currentPower || b.capacity) - (a.currentPower || a.capacity));
  const topPlants2 = sortedByGeneration2.slice(0, 5);
  const strugglingPlants2 = [...plants]
    .filter((p: any) => p.status !== "online" || p.healthScore < 90)
    .sort((a: any, b: any) => a.healthScore - b.healthScore)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      
      {/* ==================== 1. EXECUTIVE COCKPIT INSTRUMENT CLUSTER ==================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        
        <div className="silver-card p-4 flex flex-col justify-between min-h-[135px] border-slate-700/60 bg-gradient-to-b from-[#131824] to-[#0c0f17]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 uppercase font-mono font-bold tracking-wider">Total Grid Pool</span>
            <div className="h-6 w-6 rounded-md chrome-plate flex items-center justify-center text-cyan-400 border border-cyan-500/30">
              <Layers className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-white tracking-tight flex items-baseline gap-1">
              {(livePower / 1000).toFixed(2)}
              <span className="text-xs text-cyan-400 font-normal">GW</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[9px] font-mono text-cyan-300 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
                50 INFRA NODES
              </span>
              <span className="text-[9px] font-mono text-slate-400">99.98% UPTIME</span>
            </div>
          </div>
        </div>

        <div className="silver-card p-4 flex flex-col justify-between min-h-[135px] border-slate-700/60 bg-gradient-to-b from-[#101c1c] to-[#0a1212]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 uppercase font-mono font-bold tracking-wider">Active Generation</span>
            <div className="h-6 w-6 rounded-md chrome-plate flex items-center justify-center text-emerald-400 border border-emerald-500/30">
              <Zap className="h-3.5 w-3.5 animate-pulse" />
              <span className="absolute -top-0.5 -left-0.5 h-3.5 w-3.5 bg-emerald-500/20 rounded-full animate-pulse" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-emerald-400 tracking-tight flex items-baseline gap-1">
              {livePower.toLocaleString(undefined, { maximumFractionDigits: 1 })}
              <span className="text-xs text-emerald-300 font-normal">MW</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[9px] font-mono text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>86.{Math.round(loadFactor)}% LOAD FACTOR {"(OPTIMAL)"}</span>
            </div>
          </div>
        </div>

        <div className="silver-card p-4 flex flex-col justify-between min-h-[135px] border-slate-700/60 bg-gradient-to-b from-[#181326] to-[#0d0a17]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 uppercase font-mono font-bold tracking-wider">Fleet MTBF Factor</span>
            <div className="h-6 w-6 rounded-md chrome-plate flex items-center justify-center text-purple-400 border border-purple-500/30">
              <Heart className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-purple-300 tracking-tight flex items-baseline gap-1">
              {fleetHealth.toFixed(1)}
              <span className="text-xs text-purple-400 font-normal">%</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[9px] font-mono text-purple-300">
              <span className="bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20">
                ZERO CRITICAL TRIPS
              </span>
            </div>
          </div>
        </div>

        <div className="silver-card p-4 flex flex-col justify-between min-h-[135px] border-slate-700/60 bg-gradient-to-b from-[#1f1910] to-[#120e09]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 uppercase font-mono font-bold tracking-wider">Substation Thermal</span>
            <div className="h-6 w-6 rounded-md chrome-plate flex items-center justify-center text-amber-400 border border-amber-500/30">
              <Flame className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-amber-300 tracking-tight flex items-baseline gap-1">
              {thermalTemp.toFixed(1)}
              <span className="text-xs text-amber-400 font-normal">°C</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[9px] font-mono text-amber-400">
              <span>18.0°C SAFETY HEADROOM</span>
            </div>
          </div>
        </div>

        <div className="silver-card p-4 flex flex-col justify-between min-h-[135px] border-slate-700/60 bg-gradient-to-b from-[#111824] to-[#090e17]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 uppercase font-mono font-bold tracking-wider">24h Generation</span>
            <div className="h-6 w-6 rounded-md chrome-plate flex items-center justify-center text-sky-400 border border-sky-500/30">
              <Sun className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-slate-100 tracking-tight flex items-baseline gap-1">
              {todayProduction.toLocaleString(undefined, { maximumFractionDigits: 1 })}
              <span className="text-xs text-sky-400 font-normal">MWh</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[9px] font-mono text-sky-300">
              <span>+{Math.round((livePower / 2500) * 10)}% VS PPA FORECAST</span>
            </div>
          </div>
        </div>

        <div className="silver-card p-4 flex flex-col justify-between min-h-[135px] border-slate-700/60 bg-gradient-to-b from-[#221017] to-[#12080c]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 uppercase font-mono font-bold tracking-wider">Trip Interlocks</span>
            <div className="h-6 w-6 rounded-md chrome-plate flex items-center justify-center text-rose-500 border border-rose-500/30">
              <ShieldAlert className="h-3.5 w-3.5 animate-pulse" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-rose-400 tracking-tight flex items-baseline gap-1">
              {2}
              <span className="text-xs text-rose-300 font-normal">Active</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[9px] font-mono text-rose-300">
              <span className="bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
                NERC COMPLIANT
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== 2. EMBEDDED MULTI-COLOR SPECTRAL & THERMAL COCKPIT HUD ==================== */}
      <div className="cockpit-panel p-5 border border-slate-700/50 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg chrome-plate flex items-center justify-center text-cyan-400 border border-slate-600/40">
              <Waves className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-400 uppercase">
                  DSP Vibration & Harmonic Telemetry
                </span>
                <span className="px-1.5 py-0.2 rounded text-[8px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  LIVE 96.0 kS/s
                </span>
              </div>
              <h3 className="text-sm font-bold font-display text-white">24-Band FFT Audio & Vibration Spectral Analyzer</h3>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-[10px] text-slate-400 mr-2">SPECTRAL BANDS:</span>
            <span className="flex items-center gap-1 text-[10px] text-cyan-400"><span className="h-2 w-2 rounded-full bg-cyan-400" /> Sub-harmonic</span>
            <span className="flex items-center gap-1 text-[10px] text-purple-400"><span className="h-2 w-2 rounded-full bg-purple-400" /> 1X RPM</span>
            <span className="flex items-center gap-1 text-[10px] text-emerald-400"><span className="h-2 w-2 rounded-full bg-emerald-400" /> High-freq</span>
            <span className="flex items-center gap-1 text-[10px] text-rose-500"><span className="h-2 w-2 rounded-full bg-rose-500" /> Ultrasonic</span>
          </div>
        </div>

        {/* Multi-Color 24-Band Spectrum Graphic — amplitudes driven by live state */}
        <div className="h-44 flex items-end justify-between gap-1.5 pt-4 px-3 bg-[#080b11] rounded-xl border border-slate-800">
          {spectrumBands.map((band, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group cursor-pointer">
              <span className="opacity-0 group-hover:opacity-100 text-[8px] font-mono text-white transition-opacity">
                {band.amplitude}%
              </span>
              <div className="w-full bg-slate-900/90 rounded-t-sm overflow-hidden flex flex-col justify-end h-4/5">
                <div
                  className="w-full rounded-t-sm transition-all duration-500"
                  style={{
                    height: `${band.amplitude}%`,
                    backgroundColor: band.color,
                  }}
                />
              </div>
              <span className="text-[8px] font-mono text-slate-500 rotate-[-45deg] origin-center truncate mt-0.5">
                {band.freq}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ==================== 3. PRODUCTION WAVEFORM & SCADA ALARMS ==================== */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Production Trends Area Chart */}
        <div className="silver-card p-5 xl:col-span-2 border-slate-700/60 flex flex-col justify-between min-h-[380px]">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold font-display text-white tracking-wide">Multi-Source Generation Profile</h3>
              <p className="text-[10px] text-slate-400 font-mono">14-DAY POWER DISPATCH ACROSS SOLAR, WIND, BESS & THERMAL</p>
            </div>
            <div className="flex items-center space-x-3 text-[10px] font-mono">
              <span className="flex items-center gap-1 text-amber-400"><span className="h-2 w-2 rounded bg-amber-400 shadow-[0_0_6px_#f59e0b]"></span> Solar</span>
              <span className="flex items-center gap-1 text-cyan-400"><span className="h-2 w-2 rounded bg-cyan-400 shadow-[0_0_6px_#00f0ff]"></span> Wind</span>
              <span className="flex items-center gap-1 text-emerald-400"><span className="h-2 w-2 rounded bg-emerald-400 shadow-[0_0_6px_#00ff9d]"></span> BESS</span>
              <span className="flex items-center gap-1 text-purple-400"><span className="h-2 w-2 rounded bg-purple-400 shadow-[0_0_6px_#a855f7]"></span> Gas/Thermal</span>
            </div>
          </div>

          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSolarMulti" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorWindMulti" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#00f0ff" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorBessMulti" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00ff9d" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#00ff9d" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorThermalMulti" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" vertical={false} />
                <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0d1017",
                    borderColor: "rgba(203, 213, 225, 0.2)",
                    borderRadius: "8px",
                    fontSize: "11px",
                    fontFamily: "monospace",
                    color: "#ffffff"
                  }}
                />
                <Area type="monotone" dataKey="solar" name="Solar" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorSolarMulti)" />
                <Area type="monotone" dataKey="wind" name="Wind" stroke="#00f0ff" strokeWidth={2} fillOpacity={1} fill="url(#colorWindMulti)" />
                <Area type="monotone" dataKey="bess" name="BESS" stroke="#00ff9d" strokeWidth={2} fillOpacity={1} fill="url(#colorBessMulti)" />
                <Area type="monotone" dataKey="thermal" name="Thermal" stroke="#a855f7" strokeWidth={2} fillOpacity={1} fill="url(#colorThermalMulti)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Active Alarms Console */}
        <div className="silver-card p-5 border-slate-700/60 flex flex-col justify-between min-h-[380px]">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold font-display text-white tracking-wide flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-rose-500 animate-pulse" />
                <span>SCADA Priority Alarms</span>
              </h3>
              <span className="text-[9px] font-mono text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 uppercase font-bold">
                IEC 61850 TRIP BUS
              </span>
            </div>

            <div className="space-y-2.5">
              <div
                onClick={() => onSelectPlant("plant_1")}
                className="p-3 bg-rose-950/20 border border-rose-800/40 hover:border-rose-600 rounded-lg cursor-pointer flex items-center justify-between transition-all"
              >
                <div className="flex items-center space-x-3 overflow-hidden">
                  <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping flex-shrink-0" />
                  <div className="overflow-hidden">
                    <h4 className="font-bold text-white text-xs font-mono truncate">Mojave Solar One - Inverter #04</h4>
                    <p className="text-[10px] text-rose-300 font-mono mt-0.5">IGBT Junction Overheat • 84.2°C</p>
                  </div>
                </div>
                <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[9px] font-mono font-bold px-2 py-0.5 rounded">
                  CRITICAL
                </span>
              </div>

              <div
                onClick={() => onSelectPlant("plant_2")}
                className="p-3 bg-amber-950/20 border border-amber-800/40 hover:border-amber-600 rounded-lg cursor-pointer flex items-center justify-between transition-all"
              >
                <div className="flex items-center space-x-3 overflow-hidden">
                  <span className="h-2 w-2 rounded-full bg-amber-400 flex-shrink-0" />
                  <div className="overflow-hidden">
                    <h4 className="font-bold text-white text-xs font-mono truncate">Roscoe Wind Farm - Turbine #12</h4>
                    <p className="text-[10px] text-amber-300 font-mono mt-0.5">Yaw Discrepancy • 0.8° offset</p>
                  </div>
                </div>
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-mono font-bold px-2 py-0.5 rounded">
                  WARNING
                </span>
              </div>

              <div
                onClick={() => onSelectPlant("plant_3")}
                className="p-3 bg-purple-950/20 border border-purple-800/40 hover:border-purple-600 rounded-lg cursor-pointer flex items-center justify-between transition-all"
              >
                <div className="flex items-center space-x-3 overflow-hidden">
                  <span className="h-2 w-2 rounded-full bg-purple-400 flex-shrink-0" />
                  <div className="overflow-hidden">
                    <h4 className="font-bold text-white text-xs font-mono truncate">Moss Landing Storage - Rack B2</h4>
                    <p className="text-[10px] text-purple-300 font-mono mt-0.5">Cell ΔV Imbalance • 18mV</p>
                  </div>
                </div>
                <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[9px] font-mono font-bold px-2 py-0.5 rounded">
                  ADVISORY
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 border-t border-slate-800 pt-3 text-center">
            <span className="text-[10px] text-slate-500 font-mono">AUTOMATED E-STOP INTERLOCK: ARMED & READY</span>
          </div>
        </div>
      </div>

      {/* ==================== 4. LEADERBOARDS: TOP VS RISK SITES ==================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top Producing Plants */}
        <div className="silver-card p-5 border-slate-700/60">
          <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold font-display text-white tracking-wide">Top Generating Infrastructure</h3>
            <span className="text-[9px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 uppercase font-bold">
              LIVE DISPATCH
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="font-bold pb-2 text-slate-300">PLANT NAME</th>
                  <th className="font-bold pb-2 text-slate-300">TYPE</th>
                  <th className="font-bold pb-2 text-right text-slate-300">CAPACITY</th>
                  <th className="font-bold pb-2 text-right text-slate-300">LIVE POWER</th>
                  <th className="font-bold pb-2 text-right text-slate-300">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {topPlants2.slice(0, 5).map((p: any) => (
                  <tr key={p._id} className="hover:bg-slate-800/40 transition-all border-b border-slate-800/50">
                    <td className="font-bold text-white py-3">{p.name}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        p.type === "solar" 
                          ? "bg-amber-500/15 text-amber-300 border border-amber-500/30" 
                          : p.type === "wind"
                          ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
                          : "bg-purple-500/15 text-purple-300 border border-purple-500/30"
                        }`}>
                        {p.type}
                      </span>
                    </td>
                    <td className="text-right py-3 text-slate-300">{p.capacity} MW</td>
                    <td className="text-right text-emerald-400 py-3 font-bold">{p.currentPower ? p.currentPower.toFixed(1) : p.capacity} MW</td>
                    <td className="text-right py-3">
                      <button onClick={() => onSelectPlant(p._id)} className="text-slate-400 hover:text-cyan-400">
                        <ChevronRight className="h-4 w-4 ml-auto" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* High Risk / Underperforming Plants */}
        <div className="silver-card p-5 border-slate-700/60">
          <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold font-display text-white tracking-wide">Underperforming & Risk Sites</h3>
            <span className="text-[9px] font-mono text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 uppercase font-bold">
              INTERVENTION QUEUE
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="font-bold pb-2 text-slate-300">PLANT NAME</th>
                  <th className="font-bold pb-2 text-slate-300">TYPE</th>
                  <th className="font-bold pb-2 text-right text-slate-300">HEALTH</th>
                  <th className="font-bold pb-2 text-right text-slate-300">STATUS</th>
                  <th className="font-bold pb-2 text-right text-slate-300">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {strugglingPlants2.map((p: any) => (
                  <tr key={p._id} className="hover:bg-slate-800/40 transition-all border-b border-slate-800/50">
                    <td className="font-bold text-white py-3">{p.name}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        p.type === "solar" 
                          ? "bg-amber-500/15 text-amber-300 border border-amber-500/30" 
                          : p.type === "wind"
                          ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
                          : "bg-purple-500/15 text-purple-300 border border-purple-500/30"
                        }`}>
                        {p.type}
                      </span>
                    </td>
                    <td className={`text-right py-3 font-bold ${
                      p.healthScore < 88 ? "text-rose-400" : "text-amber-400"
                    }`}>{p.healthScore.toFixed(1)}%</td>
                    <td className="text-right py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                        p.status === "offline" 
                          ? "bg-rose-500/15 text-rose-300 border border-rose-500/30" 
                          : "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                        }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="text-right py-3">
                      <button onClick={() => onSelectPlant(p._id)} className="text-slate-400 hover:text-cyan-400">
                        <ChevronRight className="h-4 w-4 ml-auto" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}