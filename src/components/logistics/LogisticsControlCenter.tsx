"use client";

import React, { useState, useEffect } from "react";
import {
  Truck,
  Ship,
  Plane,
  Train,
  MapPin,
  ThermometerSnowflake,
  ShieldCheck,
  AlertTriangle,
  Clock,
  ArrowRight,
  TrendingUp,
  Package,
  Boxes,
  Navigation,
  Globe,
  Radio,
  BarChart3,
  Calendar,
  Layers,
  Sparkles,
  Zap,
  CheckCircle2
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
  Cell,
  PieChart,
  Pie
} from "recharts";

interface LogisticsControlCenterProps {
  onNavigate: (tab: string) => void;
  onCreateWorkOrder: (title: string, assetId: string, priority: string) => void;
}

export default function LogisticsControlCenter({
  onNavigate,
  onCreateWorkOrder,
}: LogisticsControlCenterProps) {
  const [selectedShipmentId, setSelectedShipmentId] = useState<string>("SHP-8801");
  const [activeFreightFilter, setActiveFreightFilter] = useState<string>("All");
  const [liveTelemetryActive, setLiveTelemetryActive] = useState<boolean>(true);

  // Active Multimodal Shipments & Fleet Units
  const [shipments, setShipments] = useState([
    {
      id: "SHP-8801",
      trackingNumber: "TRK-GLOBAL-9942",
      mode: "Sea Freight",
      origin: "Rotterdam Europort (NL)",
      destination: "Houston Bayport (US)",
      carrier: "Maersk Triple-E Class",
      cargo: "High-Voltage Inverter Sub-Assemblies",
      status: "In Transit",
      eta: "2026-08-28 14:00 UTC",
      progressPercent: 74,
      coldChainRequired: true,
      currentTempC: -18.4,
      targetTempC: -18.0,
      humidityPercent: 82,
      riskLevel: "Low",
      demurrageRisk: "$0.00 (Cleared)",
    },
    {
      id: "SHP-8802",
      trackingNumber: "TRK-GLOBAL-6410",
      mode: "Air Cargo",
      origin: "Tokyo Haneda (HND)",
      destination: "Frankfurt CargoCity (FRA)",
      carrier: "Lufthansa Cargo B777F",
      cargo: "Lithium-Ion Cathode Raw Catalyst",
      status: "Customs Clearance",
      eta: "2026-08-24 19:30 UTC",
      progressPercent: 92,
      coldChainRequired: false,
      currentTempC: 19.2,
      targetTempC: 20.0,
      humidityPercent: 45,
      riskLevel: "Low",
      demurrageRisk: "$0.00 (On-Time)",
    },
    {
      id: "SHP-8803",
      trackingNumber: "TRK-GLOBAL-3108",
      mode: "Intermodal Rail",
      origin: "Chicago Logistics Park (US)",
      destination: "Long Beach Port Pier T (US)",
      carrier: "BNSF Double-Stack Intermodal",
      cargo: "Renewable Wind Nacelle Spares",
      status: "Delayed",
      eta: "2026-08-26 08:00 UTC",
      progressPercent: 48,
      coldChainRequired: false,
      currentTempC: 24.5,
      targetTempC: 22.0,
      humidityPercent: 60,
      riskLevel: "High",
      demurrageRisk: "$4,200 (Switching Delay)",
    },
    {
      id: "SHP-8804",
      trackingNumber: "TRK-GLOBAL-1954",
      mode: "OTR Heavy Truck",
      origin: "Plant Alpha Stamping Bay (DE)",
      destination: "Giga-Factory Warehouse Bay 4 (FR)",
      carrier: "Volvo FH Electric Heavy Haul",
      cargo: "Stamped EV Chassis Frame Lot 12",
      status: "In Transit",
      eta: "2026-08-24 22:15 UTC",
      progressPercent: 62,
      coldChainRequired: false,
      currentTempC: 21.0,
      targetTempC: 20.0,
      humidityPercent: 50,
      riskLevel: "Low",
      demurrageRisk: "$0.00 (Optimal)",
    }
  ]);

  // Warehouse Distribution Hub Capacity
  const [warehouseHubs, setWarehouseHubs] = useState([
    { id: "HUB-EU", name: "Rotterdam Euro-Hub DC", baysTotal: 48, baysOccupied: 42, pickRatePerHour: 1420, onTimeDispatch: 98.4, dwellTimeHours: 2.1 },
    { id: "HUB-NA", name: "Chicago Midwest Gateway DC", baysTotal: 64, baysOccupied: 58, pickRatePerHour: 1890, onTimeDispatch: 94.2, dwellTimeHours: 3.4 },
    { id: "HUB-APAC", name: "Singapore Tuas Logistics Hub", baysTotal: 80, baysOccupied: 72, pickRatePerHour: 2340, onTimeDispatch: 99.1, dwellTimeHours: 1.8 }
  ]);

  // Cold Chain Telemetry Series
  const [coldChainHistory, setColdChainHistory] = useState([
    { time: "06:00", temp: -18.2, setpoint: -18.0, humidity: 80 },
    { time: "07:00", temp: -18.3, setpoint: -18.0, humidity: 81 },
    { time: "08:00", temp: -18.1, setpoint: -18.0, humidity: 82 },
    { time: "09:00", temp: -18.5, setpoint: -18.0, humidity: 83 },
    { time: "10:00", temp: -18.4, setpoint: -18.0, humidity: 82 },
    { time: "11:00", temp: -18.2, setpoint: -18.0, humidity: 81 },
    { time: "12:00", temp: -18.4, setpoint: -18.0, humidity: 82 },
  ]);

  // Freight Mode Share Data for Pie Chart
  const modeShareData = [
    { name: "Ocean Freight", value: 48, color: "#3b82f6" },
    { name: "Over-the-Road (OTR)", value: 28, color: "#10b981" },
    { name: "Air Freight", value: 14, color: "#a855f7" },
    { name: "Intermodal Rail", value: 10, color: "#f59e0b" },
  ];

  // Live Jiggle
  useEffect(() => {
    if (!liveTelemetryActive) return;
    const interval = setInterval(() => {
      setShipments(prev => prev.map(s => {
        if (s.status === "In Transit" && s.progressPercent < 99) {
          return {
            ...s,
            progressPercent: s.progressPercent + 1,
            currentTempC: s.coldChainRequired ? +(-18.0 + (Math.random() - 0.5) * 0.8).toFixed(1) : s.currentTempC
          };
        }
        return s;
      }));
    }, 4000);

    return () => clearInterval(interval);
  }, [liveTelemetryActive]);

  const selectedShipment = shipments.find(s => s.id === selectedShipmentId) || shipments[0];

  return (
    <div className="space-y-6">
      {/* ==================== 1. EXECUTIVE HERO COMMAND BANNER ==================== */}
      <section className="relative overflow-hidden rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-500/10 via-panel to-slate-900/10 dark:from-[#08152e] dark:via-[#11141f] dark:to-[#090b10] p-6 shadow-sm">
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/4 h-px w-1/2 bg-gradient-to-r from-transparent via-blue-400/60 to-transparent" />
        
        <div className="relative flex flex-col justify-between gap-6 xl:flex-row xl:items-end">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-blue-700 dark:text-blue-400 font-mono">
              <Globe className="h-4 w-4" />
              Multimodal Global Supply Chain & Fleet Telematics
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Logistics & Distribution Command Center
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Real-time GPS multimodal routing, cold-chain IoT temperature telemetry, cross-dock warehouse capacity, and demurrage cost prevention.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setLiveTelemetryActive(!liveTelemetryActive)}
              className="inline-flex items-center gap-2 rounded-lg border border-blue-400/40 bg-blue-50 dark:bg-blue-500/10 px-3.5 py-2 text-xs font-semibold text-blue-700 dark:text-blue-300 shadow-sm transition-all"
            >
              <Radio className="h-3.5 w-3.5 animate-pulse" />
              <span>{liveTelemetryActive ? "AIS & GPS Uplink Active" : "GPS Paused"}</span>
            </button>

            <button
              onClick={() => onCreateWorkOrder(`Expedited Freight Re-Route: ${selectedShipment.id}`, selectedShipment.id, "High")}
              className="inline-flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2 text-xs font-semibold shadow-sm transition-all"
            >
              <Zap className="h-3.5 w-3.5" /> Expedite Freight Carrier
            </button>
          </div>
        </div>
      </section>

      {/* ==================== 2. LOGISTICS KPI METRICS STRIP ==================== */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {/* TOTAL ACTIVE FREIGHT CONVOYS */}
        <article className="silver-card p-4 rounded-xl border border-slate-700/60 bg-[#0d1017] shadow-xl relative overflow-hidden transition-all group hover:border-slate-500">
          <div className="flex items-start justify-between">
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 font-mono">Active Consignments</span>
            <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-cyan-400">
              <Truck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-cyan-400">1,248</span>
            <span className="text-[10px] font-semibold text-emerald-400 font-mono">98.2% On-Schedule</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400 font-mono truncate">42 Trade Lanes Active</p>
          <div className="mt-3 w-full bg-slate-900 h-1 rounded-full overflow-hidden">
            <div className="h-full bg-cyan-400 rounded-full" style={{ width: "98%" }} />
          </div>
        </article>

        {/* ON-TIME DELIVERY RATE (OTIF) */}
        <article className="silver-card p-4 rounded-xl border border-slate-700/60 bg-[#0d1017] shadow-xl relative overflow-hidden transition-all group hover:border-slate-500">
          <div className="flex items-start justify-between">
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 font-mono">OTIF Delivery</span>
            <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 font-mono text-2xl font-black text-emerald-400">
            96.8% <span className="text-[10px] font-mono text-slate-400 font-normal">(+1.4% MoM)</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400 font-mono truncate">Benchmark: 95.0% SLA</p>
          <div className="mt-3 w-full bg-slate-900 h-1 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-400 rounded-full" style={{ width: "96.8%" }} />
          </div>
        </article>

        {/* COLD CHAIN TEMPERATURE COMPLIANCE */}
        <article className="silver-card p-4 rounded-xl border border-slate-700/60 bg-[#0d1017] shadow-xl relative overflow-hidden transition-all group hover:border-slate-500">
          <div className="flex items-start justify-between">
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 font-mono">Cold-Chain IoT</span>
            <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-blue-400">
              <ThermometerSnowflake className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 font-mono text-2xl font-black text-blue-400">
            99.8% <span className="text-[10px] font-mono text-slate-400 font-normal">Zero Excursions</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400 font-mono truncate">184 Active Reefer Units</p>
          <div className="mt-3 w-full bg-slate-900 h-1 rounded-full overflow-hidden">
            <div className="h-full bg-blue-400 rounded-full" style={{ width: "99.8%" }} />
          </div>
        </article>

        {/* WAREHOUSE CROSS-DOCK CAPACITY */}
        <article className="silver-card p-4 rounded-xl border border-slate-700/60 bg-[#0d1017] shadow-xl relative overflow-hidden transition-all group hover:border-slate-500">
          <div className="flex items-start justify-between">
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 font-mono">DC Bay Load</span>
            <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-amber-400">
              <Boxes className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 font-mono text-2xl font-black text-amber-400">
            88.5% <span className="text-[10px] font-mono text-slate-400 font-normal">(172 / 192 Bays)</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400 font-mono truncate">Dwell Time: 2.4 hrs</p>
          <div className="mt-3 w-full bg-slate-900 h-1 rounded-full overflow-hidden">
            <div className="h-full bg-amber-400 rounded-full" style={{ width: "88.5%" }} />
          </div>
        </article>

        {/* DEMURRAGE RISK EXPOSURE */}
        <article className="silver-card p-4 rounded-xl border border-slate-700/60 bg-[#0d1017] shadow-xl relative overflow-hidden transition-all group hover:border-slate-500">
          <div className="flex items-start justify-between">
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 font-mono">Demurrage Avoidance</span>
            <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-rose-400">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 font-mono text-2xl font-black text-rose-400">
            $4,200 <span className="text-[10px] font-mono text-slate-400 font-normal">1 Alert</span>
          </div>
          <p className="mt-1 text-[11px] text-emerald-400 font-mono truncate font-semibold">$38.4k saved MoM</p>
          <div className="mt-3 w-full bg-slate-900 h-1 rounded-full overflow-hidden">
            <div className="h-full bg-rose-400 rounded-full" style={{ width: "15%" }} />
          </div>
        </article>
      </section>

      {/* ==================== 3. LIVE MULTIMODAL SHIPMENT ROSTER & COLD-CHAIN IOT ==================== */}
      <section className="grid grid-cols-1 gap-6 2xl:grid-cols-3">
        {/* Left: Active Shipments Selector */}
        <div className="2xl:col-span-2 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-bold uppercase tracking-wider font-mono text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Navigation className="h-4 w-4 text-blue-500" /> Multimodal Live Freight Corridor Roster
            </h2>

            {/* Mode Filter Pills */}
            <div className="flex items-center space-x-1 text-xs font-mono">
              {["All", "Sea Freight", "Air Cargo", "Intermodal Rail", "OTR Heavy Truck"].map(f => (
                <button
                  key={f}
                  onClick={() => setActiveFreightFilter(f)}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    activeFreightFilter === f
                      ? "bg-blue-600 text-white font-bold"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {shipments
              .filter(s => activeFreightFilter === "All" || s.mode === activeFreightFilter)
              .map(shipment => {
                const isSelected = shipment.id === selectedShipmentId;
                const isDelayed = shipment.status === "Delayed";

                return (
                  <div
                    key={shipment.id}
                    onClick={() => setSelectedShipmentId(shipment.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? "border-blue-500 bg-blue-500/5 shadow-md"
                        : "border-borderMuted bg-panel hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 bg-blue-500/10 text-blue-700 dark:text-blue-400 rounded border border-blue-500/20">
                            {shipment.mode}
                          </span>
                          <span className="font-bold text-slate-900 dark:text-white text-sm">{shipment.id} • {shipment.carrier}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                            isDelayed
                              ? "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30"
                              : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                          }`}>
                            {shipment.status}
                          </span>
                        </div>

                        <div className="mt-2 text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2 font-mono">
                          <span>{shipment.origin}</span>
                          <ArrowRight className="h-3 w-3 text-slate-400" />
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{shipment.destination}</span>
                        </div>

                        <div className="mt-1 text-xs text-slate-500 font-mono">
                          Cargo: <strong className="text-slate-700 dark:text-slate-300">{shipment.cargo}</strong>
                        </div>
                      </div>

                      <div className="flex md:flex-col items-end justify-between md:justify-center text-xs font-mono min-w-44">
                        <span className="text-slate-500 text-[11px]">ETA: <strong className="text-slate-800 dark:text-slate-200">{shipment.eta}</strong></span>
                        <div className="w-full mt-2">
                          <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                            <span>Route Progress</span>
                            <span className="font-bold text-blue-600 dark:text-blue-400">{shipment.progressPercent}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${shipment.progressPercent}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Right: Selected Consignment Cold-Chain Telemetry */}
        <div className="rounded-xl border border-borderMuted bg-panel p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-borderMuted pb-3">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase text-cyan-600 dark:text-cyan-400">Cold-Chain IoT Sensor Hub</span>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">{selectedShipment.id}</h3>
            </div>
            <span className="flex items-center gap-1.5 text-[10px] font-mono bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/20">
              <ThermometerSnowflake className="h-3 w-3" /> Reefer Live
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[10px] font-mono text-slate-500">Core Temp Sensor</span>
              <div className="text-xl font-bold font-mono text-cyan-600 dark:text-cyan-400">
                {selectedShipment.currentTempC}°C
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Setpoint: {selectedShipment.targetTempC}°C</span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[10px] font-mono text-slate-500">Relative Humidity</span>
              <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                {selectedShipment.humidityPercent}%
              </div>
              <span className="text-[10px] text-emerald-600 font-mono">Within Bounds</span>
            </div>
          </div>

          {/* Temperature Trend Area Chart */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-slate-500">6-Hour Temperature Drift Profile</span>
            <div className="h-36">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={coldChainHistory} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <CartesianGrid stroke="#334155" strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={9} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={9} domain={[-20, -16]} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", color: "#f8fafc", borderRadius: "6px" }} />
                  <Area type="monotone" dataKey="temp" name="Temperature (°C)" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.2} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-mono space-y-1">
            <div className="flex justify-between text-slate-500">
              <span>Demurrage Risk:</span>
              <strong className={selectedShipment.demurrageRisk.includes("$0") ? "text-emerald-600" : "text-rose-600"}>
                {selectedShipment.demurrageRisk}
              </strong>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Security Seal ID:</span>
              <strong className="text-slate-800 dark:text-slate-200">ISO-17712-H #88490</strong>
            </div>
          </div>

          <button
            onClick={() => onCreateWorkOrder(`Expedited Cross-Dock Clear: ${selectedShipment.id}`, selectedShipment.id, "High")}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-semibold rounded-lg shadow-sm transition-all"
          >
            Pre-Clear Customs & Cross-Dock
          </button>
        </div>
      </section>

      {/* ==================== 4. WAREHOUSE HUBS & MULTIMODAL SPLIT ==================== */}
      <section className="grid grid-cols-1 gap-6 2xl:grid-cols-5">
        {/* Warehouse Hub Performance */}
        <article className="2xl:col-span-3 rounded-xl border border-borderMuted bg-panel p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400 font-mono">Cross-Dock Distribution Centers</p>
              <h3 className="mt-1 text-base font-bold text-slate-900 dark:text-white">Warehouse Bay Utilization & Pick-Pack Speeds</h3>
            </div>
            <span className="text-[10px] font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">LIVE DC METRICS</span>
          </div>

          <div className="space-y-3">
            {warehouseHubs.map(hub => {
              const utilPercent = Math.round((hub.baysOccupied / hub.baysTotal) * 100);
              return (
                <div key={hub.id} className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-bold text-slate-900 dark:text-white text-sm font-mono">{hub.name}</span>
                    <span className="text-xs font-mono text-blue-600 dark:text-blue-400 font-semibold">{hub.pickRatePerHour} units/hr</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs font-mono text-slate-500">
                    <div>Bays: <strong className="text-slate-800 dark:text-slate-200">{hub.baysOccupied}/{hub.baysTotal} ({utilPercent}%)</strong></div>
                    <div>OTIF Dispatch: <strong className="text-emerald-600">{hub.onTimeDispatch}%</strong></div>
                    <div>Dwell Time: <strong className="text-slate-800 dark:text-slate-200">{hub.dwellTimeHours} hrs</strong></div>
                  </div>

                  <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${utilPercent}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </article>

        {/* Multimodal Transport Split Pie */}
        <article className="2xl:col-span-2 rounded-xl border border-borderMuted bg-panel p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 font-mono">Freight Mode Allocation</p>
              <h3 className="mt-1 text-base font-bold text-slate-900 dark:text-white">Active Cargo Ton-Miles Split</h3>
            </div>
            <BarChart3 className="h-4 w-4 text-blue-500" />
          </div>

          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={modeShareData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={4} dataKey="value">
                  {modeShareData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", color: "#f8fafc", borderRadius: "8px" }} />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>
    </div>
  );
}
