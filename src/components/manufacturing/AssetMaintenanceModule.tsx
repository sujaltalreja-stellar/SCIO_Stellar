"use client";

import React, { useState } from "react";
import {
  Wrench,
  Activity,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Sliders,
  Shield,
  Layers,
  Sparkles,
  Plus,
  RefreshCw,
  Gauge
} from "lucide-react";

interface MachineAsset {
  id: string;
  name: string;
  model: string;
  line: string;
  healthIndex: number;
  status: "Healthy" | "Attention Required" | "Critical Maintenance";
  spindleHours: number;
  vibrationMmSec: number;
  tempCelsius: number;
  rulDays: number;
  nextScheduledPM: string;
}

interface MaintenanceWorkOrder {
  id: string;
  woNumber: string;
  title: string;
  machine: string;
  type: "Predictive" | "Preventive" | "Corrective";
  priority: "Critical" | "High" | "Normal";
  status: "Open" | "In Progress" | "Completed";
  assignedTech: string;
  estimatedDurationHours: number;
  downtimeSavedHours: number;
}

const MACHINE_ASSETS: MachineAsset[] = [
  {
    id: "m-01",
    name: "5-Axis High-Precision CNC Mill",
    model: "Hermle C42U / Heidenhain TNC 640",
    line: "Line B2",
    healthIndex: 78,
    status: "Attention Required",
    spindleHours: 4820,
    vibrationMmSec: 2.38,
    tempCelsius: 58.6,
    rulDays: 14,
    nextScheduledPM: "Tomorrow, Shift 2",
  },
  {
    id: "m-02",
    name: "Fiber Laser Welding Cell",
    model: "Trumpf 6kW TruDisk 6001 / Precitec Head",
    line: "Line A1",
    healthIndex: 94,
    status: "Healthy",
    spindleHours: 2150,
    vibrationMmSec: 0.65,
    tempCelsius: 38.2,
    rulDays: 68,
    nextScheduledPM: "In 12 Days",
  },
  {
    id: "m-03",
    name: "High-Speed SMT Pick & Place",
    model: "Yamaha YSM20R (45k CPH)",
    line: "Line C3",
    healthIndex: 96,
    status: "Healthy",
    spindleHours: 1840,
    vibrationMmSec: 0.42,
    tempCelsius: 34.8,
    rulDays: 92,
    nextScheduledPM: "In 18 Days",
  },
  {
    id: "m-04",
    name: "Automated Robotic QA & Palletizer",
    model: "KUKA KR CYBERTECH / Cognex 24MP AOI",
    line: "Line D4",
    healthIndex: 89,
    status: "Healthy",
    spindleHours: 3200,
    vibrationMmSec: 0.88,
    tempCelsius: 32.1,
    rulDays: 45,
    nextScheduledPM: "In 8 Days",
  },
];

const MAINTENANCE_WOS: MaintenanceWorkOrder[] = [
  {
    id: "mwo-01",
    woNumber: "MWO-4821",
    title: "Main Spindle Bearing Preload & Vibration Check",
    machine: "Hermle C42U (Line B2)",
    type: "Predictive",
    priority: "Critical",
    status: "Open",
    assignedTech: "Alex Schneider (Senior Millwright)",
    estimatedDurationHours: 1.5,
    downtimeSavedHours: 18.0,
  },
  {
    id: "mwo-02",
    woNumber: "MWO-4822",
    title: "Laser Protective Window & Optic Alignment",
    machine: "Trumpf 6kW (Line A1)",
    type: "Preventive",
    priority: "High",
    status: "In Progress",
    assignedTech: "Carlos Gomez (Laser Specialist)",
    estimatedDurationHours: 0.8,
    downtimeSavedHours: 6.5,
  },
  {
    id: "mwo-03",
    woNumber: "MWO-4823",
    title: "Feeder Bank Vacuum Filter Purge",
    machine: "Yamaha SMT (Line C3)",
    type: "Preventive",
    priority: "Normal",
    status: "Completed",
    assignedTech: "Elena Rostova (SMT Technician)",
    estimatedDurationHours: 0.5,
    downtimeSavedHours: 3.2,
  },
];

export function AssetMaintenanceModule() {
  const [machines] = useState<MachineAsset[]>(MACHINE_ASSETS);
  const [selectedMachine, setSelectedMachine] = useState<MachineAsset>(MACHINE_ASSETS[0]);
  const [workOrders] = useState<MaintenanceWorkOrder[]>(MAINTENANCE_WOS);

  return (
    <div className="space-y-6">
      {/* ==================== 1. HEADER BANNER ==================== */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-panel p-6 shadow-2xs">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-violet-700 dark:text-violet-400 font-mono">
              <Wrench className="h-4 w-4" /> Asset &amp; Maintenance Intelligence (EAM / CMMS)
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
              Monitor ➔ Predict ➔ Maintain ➔ Optimize
            </h1>
            <p className="mt-1 text-sm text-slate-700 dark:text-slate-300 font-medium">
              Vibration harmonics, Remaining Useful Life (RUL) modeling, predictive work orders, and tooling life management.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button className="inline-flex items-center gap-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 px-4 py-2 text-xs font-mono font-bold shadow-xs transition-all">
              <Plus className="h-3.5 w-3.5 text-amber-400" />
              <span>Create Work Order</span>
            </button>
          </div>
        </div>
      </section>

      {/* ==================== 2. KPI METRICS STRIP ==================== */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 dark:border-borderMuted bg-white dark:bg-panel p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-bold uppercase text-slate-700 dark:text-slate-400 font-mono">
            <span>Overall Fleet Health Index</span>
            <Activity className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-950 dark:text-white">89.2%</div>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 font-medium">3 Healthy • 1 Watchlist (Line B2)</p>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-borderMuted bg-white dark:bg-panel p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-bold uppercase text-slate-700 dark:text-slate-400 font-mono">
            <span>Mean Time Between Failures (MTBF)</span>
            <Clock className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-950 dark:text-white">642 hrs</div>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 font-medium">+18% improvement with predictive PM</p>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-borderMuted bg-white dark:bg-panel p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-bold uppercase text-slate-700 dark:text-slate-400 font-mono">
            <span>Mean Time to Repair (MTTR)</span>
            <Wrench className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-950 dark:text-white">42 mins</div>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 font-medium">Down from 1.8h baseline average</p>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-borderMuted bg-white dark:bg-panel p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-bold uppercase text-slate-700 dark:text-slate-400 font-mono">
            <span>Prevented Downtime</span>
            <Shield className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-800 dark:text-emerald-300">27.7 hrs</div>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 font-medium">~$83,100 in catastrophic outage savings</p>
        </div>
      </section>

      {/* ==================== 3. MACHINE ROSTER & WORK ORDER DISPATCH ==================== */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Left: Machine Health Cards */}
        <div className="xl:col-span-2 rounded-xl border border-slate-200 dark:border-borderMuted bg-white dark:bg-panel p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-borderMuted pb-3">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider font-mono text-slate-950 dark:text-white flex items-center gap-2">
                <Activity className="h-4 w-4 text-violet-600 dark:text-violet-400" /> Production Asset Health Roster
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">Real-time vibration, temperature, and RUL countdown</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {machines.map(m => {
              const isSelected = selectedMachine.id === m.id;
              const isWarning = m.healthIndex < 85;
              return (
                <div
                  key={m.id}
                  onClick={() => setSelectedMachine(m)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? "border-2 border-violet-600 dark:border-violet-500 bg-violet-50/20 dark:bg-violet-950/20 shadow-sm"
                      : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase text-slate-700 dark:text-slate-400">{m.line}</span>
                      <h3 className="font-bold text-slate-950 dark:text-white text-sm mt-0.5">{m.name}</h3>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      isWarning
                        ? "bg-amber-100 text-amber-950 border border-amber-300 dark:bg-amber-950 dark:text-amber-300"
                        : "bg-emerald-100 text-emerald-950 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300"
                    }`}>
                      {m.healthIndex}% Health
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 font-mono mt-1">{m.model}</p>

                  <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] font-mono pt-2 border-t border-slate-200 dark:border-slate-800">
                    <div>
                      <span className="text-slate-500 block text-[9px]">Vibration</span>
                      <strong className={m.vibrationMmSec > 2.0 ? "text-rose-600 dark:text-rose-400" : "text-slate-950 dark:text-white"}>
                        {m.vibrationMmSec} mm/s
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[9px]">Temp</span>
                      <strong className={m.tempCelsius > 50 ? "text-amber-600 dark:text-amber-400" : "text-slate-950 dark:text-white"}>
                        {m.tempCelsius}°C
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[9px]">RUL</span>
                      <strong className="text-slate-950 dark:text-white">{m.rulDays} Days</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Predictive Work Orders Queue */}
        <div className="rounded-xl border border-slate-200 dark:border-borderMuted bg-white dark:bg-panel p-5 shadow-2xs space-y-4">
          <div className="border-b border-slate-200 dark:border-borderMuted pb-3">
            <span className="text-[10px] font-mono font-bold uppercase text-violet-700 dark:text-violet-400">Maintenance Dispatch</span>
            <h3 className="font-bold text-slate-950 dark:text-white text-sm mt-0.5">Active Maintenance Work Orders</h3>
          </div>

          <div className="space-y-3">
            {workOrders.map(wo => (
              <div
                key={wo.id}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/50 space-y-2 font-mono text-xs"
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-950 dark:text-white">{wo.woNumber}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                    wo.priority === "Critical"
                      ? "bg-rose-100 text-rose-950 border border-rose-300 dark:bg-rose-950 dark:text-rose-300"
                      : "bg-amber-100 text-amber-950 border border-amber-300 dark:bg-amber-950 dark:text-amber-300"
                  }`}>
                    {wo.type} • {wo.priority}
                  </span>
                </div>

                <p className="font-bold text-slate-900 dark:text-slate-200">{wo.title}</p>
                <p className="text-slate-600 dark:text-slate-400 text-[11px]">{wo.machine}</p>

                <div className="flex justify-between items-center text-[10.5px] pt-1 text-slate-500">
                  <span>Assigned: {wo.assignedTech.split(" ")[0]}</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold">+{wo.downtimeSavedHours}h downtime saved</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
