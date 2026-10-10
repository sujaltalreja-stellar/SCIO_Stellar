"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "../lib/convex";
import { api } from "../lib/convex";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Layers,
  Cpu,
  ShieldCheck,
  ShieldAlert,
  Wrench,
  Clock,
  X,
  Sun,
  Wind,
  Battery,
  Zap,
  Activity,
  Radio,
  LayoutGrid,
  List,
  ChevronRight,
  CheckCircle2,
  ArrowUpRight,
  Gauge,
  RotateCcw
} from "lucide-react";

import { mockDb } from "../../../config/energyMockDb";

// Motion animations
const ENTRANCE = [0.22, 1, 0.36, 1] as const;

export default function AssetRegistry() {
  const [search, setSearch] = useState("");
  const [plantFilter, setPlantFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"table" | "grid">("grid");
  
  // Drawer state
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);

  // Queries
  const queryPlants = useQuery(api.plants.list);
  const plants = (queryPlants && queryPlants.length > 0) ? queryPlants : mockDb.plants;

  const queryAssets = useQuery(api.assets.list, {
    search: search || undefined,
    plantId: plantFilter === "all" ? undefined : (plantFilter as any),
    type: typeFilter === "all" ? undefined : typeFilter,
    status: statusFilter === "all" ? undefined : statusFilter,
  });
  const assets = (queryAssets && queryAssets.length > 0) ? queryAssets : mockDb.assets;

  const assetDetails = useQuery(
    api.assets.getById,
    selectedAssetId ? { assetId: selectedAssetId as any } : (null as any)
  );

  const allWorkOrders = useQuery(api.workOrders.list) ?? [];
  const assetWorkOrders = selectedAssetId
    ? allWorkOrders.filter((w: any) => w.assetId === selectedAssetId && (w.status === "completed" || w.status === "closed"))
    : [];

  const totalDowntime = assetWorkOrders.reduce((sum: number, w: any) => sum + (w.downtimeHours ?? 0), 0);
  const totalCost = assetWorkOrders.reduce((sum: number, w: any) => sum + (w.laborCost ?? 0) + (w.materialsCost ?? 0), 0);
  const partsConsumed = assetWorkOrders.flatMap((w: any) => w.spareParts ?? []);

  // Filtered Assets count by type
  const typeCounts = useMemo(() => {
    return {
      all: assets.length,
      panel: assets.filter((a: any) => a.type === "panel").length,
      turbine: assets.filter((a: any) => a.type === "turbine").length,
      battery: assets.filter((a: any) => a.type === "battery").length,
      inverter: assets.filter((a: any) => a.type === "inverter").length,
      transformer: assets.filter((a: any) => a.type === "transformer").length,
    };
  }, [assets]);

  // Overall fleet stats
  const averageHealth = useMemo(() => {
    if (!assets.length) return 98.4;
    return +(assets.reduce((sum: number, a: any) => sum + (a.healthScore ?? 95), 0) / assets.length).toFixed(1);
  }, [assets]);

  const criticalCount = useMemo(() => {
    return assets.filter((a: any) => a.healthScore < 88 || a.status === "offline").length;
  }, [assets]);

  const onlineCount = useMemo(() => {
    return assets.filter((a: any) => a.status === "online").length;
  }, [assets]);

  // Helper for type icons & colors
  const getTypeMeta = (type: string) => {
    switch (type) {
      case "panel":
        return { icon: Sun, label: "Solar PV", color: "#F59E0B", bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-400" };
      case "turbine":
        return { icon: Wind, label: "Wind Turbine", color: "#06B6D4", bg: "bg-cyan-500/10", border: "border-cyan-500/30", text: "text-cyan-400" };
      case "battery":
        return { icon: Battery, label: "BESS Storage", color: "#8B5CF6", bg: "bg-purple-500/10", border: "border-purple-500/30", text: "text-purple-400" };
      case "inverter":
        return { icon: Zap, label: "Grid Inverter", color: "#10B981", bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-400" };
      case "transformer":
        return { icon: Activity, label: "Substation XFMR", color: "#EC4899", bg: "bg-pink-500/10", border: "border-pink-500/30", text: "text-pink-400" };
      default:
        return { icon: Cpu, label: "Telemetry Node", color: "#3B82F6", bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-400" };
    }
  };

  return (
    <section className="relative min-h-screen space-y-6 rounded-2xl bg-[#0B0D0F] p-4 text-white sm:p-6 lg:p-8 border border-white/[0.08] shadow-2xl">
      {/* ==================== 1. COMMAND DECK HERO HEADER ==================== */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.09] bg-white/[0.03] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-[#06B6D4]">
            <Radio className="h-3.5 w-3.5 text-[#06B6D4] animate-pulse" />
            02 — SCADA TELEMETRY · HARDWARE & ASSET REGISTRY
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Industrial Asset & Equipment Fleet Deck
          </h1>
          <p className="mt-1 text-sm text-white/50 max-w-3xl">
            Real-time condition monitoring, harmonic vibration spectra, predictive thermal alerts, and lifecycle maintenance logs across all grid-tied assets.
          </p>
        </div>

        {/* View mode toggle & Quick Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center rounded-xl border border-white/[0.1] bg-[#101315] p-1 font-mono text-xs">
            <button
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                viewMode === "grid"
                  ? "bg-white/[0.12] text-white font-semibold shadow-xs"
                  : "text-white/40 hover:text-white"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Matrix Cards</span>
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                viewMode === "table"
                  ? "bg-white/[0.12] text-white font-semibold shadow-xs"
                  : "text-white/40 hover:text-white"
              }`}
            >
              <List className="h-3.5 w-3.5" />
              <span>SCADA Table</span>
            </button>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-[#10B981]/30 bg-[#10B981]/10 px-3 py-2 font-mono text-xs text-[#2FBF71]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#2FBF71] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#2FBF71]" />
            </span>
            <span>Live Stream · 96.0 kS/s</span>
          </div>
        </div>
      </div>

      {/* ==================== 2. TOP TELEMETRY KPI METRIC CARDS ==================== */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Metric 1: Total Units */}
        <div className="rounded-xl border border-white/[0.07] bg-[#FFFDFA]/[0.02] p-4 transition-all hover:border-white/[0.14]">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[11px] uppercase tracking-[0.13em] text-white/40">
              Total Managed Assets
            </p>
            <Cpu className="h-4 w-4 text-cyan-400" />
          </div>
          <p className="mt-3 text-[30px] font-bold leading-none tracking-tight text-white">
            {assets.length}
            <span className="text-xs font-normal text-white/50 ml-1.5 font-mono">UNITS</span>
          </p>
          <div className="mt-3 flex items-center gap-2 font-mono text-[11px] text-[#2FBF71]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#2FBF71]" />
            <span>{onlineCount} Online & Synced</span>
          </div>
        </div>

        {/* Metric 2: Fleet Mean Health Score */}
        <div className="rounded-xl border border-white/[0.07] bg-[#FFFDFA]/[0.02] p-4 transition-all hover:border-white/[0.14]">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[11px] uppercase tracking-[0.13em] text-white/40">
              Fleet Health Index
            </p>
            <Gauge className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="mt-3 text-[30px] font-bold leading-none tracking-tight text-white">
            {averageHealth}
            <span className="text-[18px] font-medium text-white/50 ml-0.5">%</span>
          </p>
          <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full bg-emerald-400 transition-all duration-700"
              style={{ width: `${averageHealth}%` }}
            />
          </div>
        </div>

        {/* Metric 3: Critical Interventions / Watchlist */}
        <div className="rounded-xl border border-white/[0.07] bg-[#FFFDFA]/[0.02] p-4 transition-all hover:border-white/[0.14]">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[11px] uppercase tracking-[0.13em] text-white/40">
              Elevated Risk Watchlist
            </p>
            <ShieldAlert className="h-4 w-4 text-rose-400" />
          </div>
          <p className="mt-3 text-[30px] font-bold leading-none tracking-tight text-white">
            {criticalCount}
            <span className="text-xs font-normal text-rose-400 ml-1.5 font-mono">ATTENTION</span>
          </p>
          <p className="mt-3 text-[11px] font-mono text-white/40">
            {criticalCount > 0 ? "Thermal or acoustic excursion detected" : "All assets nominal"}
          </p>
        </div>

        {/* Metric 4: EAM Maintenance Flow */}
        <div className="rounded-xl border border-white/[0.07] bg-[#FFFDFA]/[0.02] p-4 transition-all hover:border-white/[0.14]">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[11px] uppercase tracking-[0.13em] text-white/40">
              Active Maintenance WOs
            </p>
            <Wrench className="h-4 w-4 text-amber-400" />
          </div>
          <p className="mt-3 text-[30px] font-bold leading-none tracking-tight text-white">
            {allWorkOrders.length}
            <span className="text-xs font-normal text-white/50 ml-1.5 font-mono">ORDERS</span>
          </p>
          <div className="mt-3 flex items-center gap-2 font-mono text-[11px] text-amber-400">
            <Clock className="h-3 w-3" />
            <span>SAP PM / Maximo Synced</span>
          </div>
        </div>
      </div>

      {/* ==================== 3. CATEGORY CHIP SELECTOR & SEARCH TOOLBAR ==================== */}
      <div className="rounded-xl border border-white/[0.08] bg-[#101315] p-4 space-y-4 shadow-lg">
        {/* Quick Type Filter Chips */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: "all", label: "All Equipment", count: typeCounts.all, icon: Layers },
            { id: "panel", label: "Solar Panels", count: typeCounts.panel, icon: Sun, color: "#F59E0B" },
            { id: "turbine", label: "Wind Turbines", count: typeCounts.turbine, icon: Wind, color: "#06B6D4" },
            { id: "battery", label: "BESS Storage", count: typeCounts.battery, icon: Battery, color: "#8B5CF6" },
            { id: "inverter", label: "Inverters", count: typeCounts.inverter, icon: Zap, color: "#10B981" },
            { id: "transformer", label: "Transformers", count: typeCounts.transformer, icon: Activity, color: "#EC4899" },
          ].map((chip) => {
            const isActive = typeFilter === chip.id;
            const Icon = chip.icon;
            return (
              <button
                key={chip.id}
                onClick={() => setTypeFilter(chip.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-xs transition-all border ${
                  isActive
                    ? "bg-white/[0.12] border-white/20 text-white font-semibold shadow-xs"
                    : "bg-white/[0.02] border-white/[0.06] text-white/50 hover:text-white hover:border-white/[0.12]"
                }`}
              >
                <Icon className="h-3.5 w-3.5" style={{ color: chip.color ?? "currentColor" }} />
                <span>{chip.label}</span>
                <span className={`px-1.5 py-0.2 rounded text-[10px] ${
                  isActive ? "bg-white/[0.2] text-white" : "bg-white/[0.06] text-white/40"
                }`}>
                  {chip.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search, Plant Select, Status Filters */}
        <div className="flex flex-col xl:flex-row items-center gap-3 pt-2 border-t border-white/[0.06]">
          {/* Search Input */}
          <div className="relative w-full xl:w-96">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-white/30" />
            <input
              type="text"
              placeholder="Search asset ID, model, serial #, plant name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#080A0D] border border-white/[0.08] text-white focus:border-[#06B6D4]/50 focus:outline-none rounded-lg text-xs placeholder:text-white/30 font-sans transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-2.5 text-white/30 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Plant Selector */}
          <div className="flex items-center space-x-2 w-full xl:w-auto">
            <span className="text-[10.5px] text-white/40 font-mono uppercase font-semibold shrink-0">Site:</span>
            <select
              value={plantFilter}
              onChange={(e) => setPlantFilter(e.target.value)}
              className="w-full xl:w-56 bg-[#080A0D] border border-white/[0.08] text-white px-3 py-2 rounded-lg text-xs focus:border-[#06B6D4]/50 focus:outline-none font-sans"
            >
              <option value="all">All Operating Plants ({plants.length})</option>
              {plants.map((p: any) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Selector */}
          <div className="flex items-center space-x-2 w-full xl:w-auto">
            <span className="text-[10.5px] text-white/40 font-mono uppercase font-semibold shrink-0">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full xl:w-40 bg-[#080A0D] border border-white/[0.08] text-white px-3 py-2 rounded-lg text-xs focus:border-[#06B6D4]/50 focus:outline-none font-sans"
            >
              <option value="all">All Statuses</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>

          {(search || plantFilter !== "all" || typeFilter !== "all" || statusFilter !== "all") && (
            <button
              onClick={() => {
                setSearch("");
                setPlantFilter("all");
                setTypeFilter("all");
                setStatusFilter("all");
              }}
              className="text-xs font-mono text-[#06B6D4] hover:underline flex items-center gap-1 shrink-0 ml-auto"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset Filters</span>
            </button>
          )}

          <div className="ml-auto text-[10.5px] font-mono text-white/40 shrink-0">
            {assets.length} RECORDS DISPLAYED
          </div>
        </div>
      </div>

      {/* ==================== 4A. MATRIX CARDS VIEW ==================== */}
      {viewMode === "grid" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {assets.map((a: any) => {
            const meta = getTypeMeta(a.type);
            const Icon = meta.icon;
            const health = a.healthScore ?? 96.5;
            let healthColor = "#2FBF71";
            if (health < 88) healthColor = "#F0526B";
            else if (health < 93) healthColor = "#E8A33D";

            return (
              <motion.div
                key={a._id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setSelectedAssetId(a._id)}
                className="group relative rounded-xl border border-white/[0.07] bg-[#101315] p-5 transition-all hover:border-[#06B6D4]/50 hover:bg-[#13171B] cursor-pointer shadow-lg flex flex-col justify-between"
              >
                <div>
                  {/* Top line: Type pill & Status diode */}
                  <div className="flex items-center justify-between gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-mono text-[10px] font-semibold uppercase border ${meta.bg} ${meta.border} ${meta.text}`}>
                      <Icon className="h-3 w-3" />
                      {meta.label}
                    </span>

                    <span className={`inline-flex items-center gap-1.5 font-mono text-[10px] px-2 py-0.5 rounded uppercase font-bold border ${
                      a.status === "online"
                        ? "bg-[#2FBF71]/10 text-[#2FBF71] border-[#2FBF71]/30"
                        : a.status === "maintenance"
                        ? "bg-[#E8A33D]/10 text-[#E8A33D] border-[#E8A33D]/30"
                        : "bg-[#F0526B]/15 text-[#F0526B] border-[#F0526B]/30 animate-pulse"
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${
                        a.status === "online" ? "bg-[#2FBF71]" : a.status === "maintenance" ? "bg-[#E8A33D]" : "bg-[#F0526B]"
                      }`} />
                      {a.status}
                    </span>
                  </div>

                  {/* Asset Title & Site */}
                  <div className="mt-4">
                    <h3 className="font-bold text-sm text-white group-hover:text-[#06B6D4] transition-colors leading-tight">
                      {a.name}
                    </h3>
                    <p className="font-mono text-xs text-white/50 mt-1 flex items-center gap-1">
                      <span>{a.plantName}</span>
                    </p>
                  </div>

                  {/* Health Score Gauge Bar */}
                  <div className="mt-4 p-3 rounded-lg bg-[#080A0D] border border-white/[0.05]">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-white/40 text-[10.5px]">TELEMETRY HEALTH</span>
                      <span className="font-bold" style={{ color: healthColor }}>
                        {health.toFixed(1)}%
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${health}%`,
                          backgroundColor: healthColor,
                          boxShadow: `0 0 8px ${healthColor}66`
                        }}
                      />
                    </div>
                  </div>

                  {/* Serial & Manufacturer Specs */}
                  <div className="mt-3.5 space-y-1.5 font-mono text-[11px] text-white/45">
                    <div className="flex justify-between">
                      <span>OEM / Maker:</span>
                      <span className="text-white/80 font-medium">{a.manufacturer}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Serial No:</span>
                      <span className="text-white/60 truncate max-w-[140px]">{a.serialNumber}</span>
                    </div>
                  </div>
                </div>

                {/* Card Action footer */}
                <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-[#06B6D4]">
                  <span className="group-hover:underline flex items-center gap-1">
                    <span>Inspect Diagnostics</span>
                    <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-white/30 group-hover:text-[#06B6D4] transition-colors" />
                </div>
              </motion.div>
            );
          })}

          {assets.length === 0 && (
            <div className="col-span-full py-16 text-center rounded-xl border border-dashed border-white/[0.1] bg-[#101315]">
              <Cpu className="h-8 w-8 text-white/30 mx-auto mb-2" />
              <p className="text-sm text-white/60 font-mono">No hardware assets match the selected criteria.</p>
              <button
                onClick={() => {
                  setSearch("");
                  setPlantFilter("all");
                  setTypeFilter("all");
                  setStatusFilter("all");
                }}
                className="mt-3 text-xs font-mono text-[#06B6D4] hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* ==================== 4B. SCADA TELEMETRY TABLE VIEW ==================== */}
      {viewMode === "table" && (
        <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#101315] shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-white/[0.08] bg-[#0E1113] text-white/40 uppercase text-[10.5px]">
                  <th className="p-4">EQUIPMENT ID / NAME</th>
                  <th className="p-4">OPERATING SITE</th>
                  <th className="p-4">TYPE</th>
                  <th className="p-4 text-right">HEALTH SCORE</th>
                  <th className="p-4 text-right">STATUS</th>
                  <th className="p-4 text-right">MANUFACTURER</th>
                  <th className="p-4 text-right">SERIAL NUMBER</th>
                  <th className="p-4 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {assets.map((a: any) => {
                  const meta = getTypeMeta(a.type);
                  const Icon = meta.icon;
                  const health = a.healthScore ?? 96.5;
                  let healthColor = "#2FBF71";
                  if (health < 88) healthColor = "#F0526B";
                  else if (health < 93) healthColor = "#E8A33D";

                  return (
                    <tr
                      key={a._id}
                      onClick={() => setSelectedAssetId(a._id)}
                      className="hover:bg-white/[0.03] transition-all cursor-pointer group"
                    >
                      <td className="p-4 font-semibold text-white group-hover:text-[#06B6D4] transition-colors">
                        <div className="flex items-center gap-2">
                          <span className={`p-1 rounded ${meta.bg}`}>
                            <Icon className="h-3.5 w-3.5" style={{ color: meta.color }} />
                          </span>
                          <span>{a.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-white/70">{a.plantName}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${meta.bg} ${meta.border} ${meta.text}`}>
                          {meta.label}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <div className="w-16 bg-white/[0.08] h-1.5 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${health}%`, backgroundColor: healthColor }}
                            />
                          </div>
                          <span className="font-bold" style={{ color: healthColor }}>
                            {health.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <span className={`px-2.5 py-0.5 rounded text-[9.5px] font-bold uppercase border ${
                          a.status === "online"
                            ? "bg-[#2FBF71]/10 text-[#2FBF71] border-[#2FBF71]/30"
                            : a.status === "maintenance"
                            ? "bg-[#E8A33D]/10 text-[#E8A33D] border-[#E8A33D]/30"
                            : "bg-[#F0526B]/15 text-[#F0526B] border-[#F0526B]/30 animate-pulse"
                        }`}>
                          {a.status}
                        </span>
                      </td>
                      <td className="p-4 text-right text-white/70">{a.manufacturer}</td>
                      <td className="p-4 text-right text-white/40">{a.serialNumber}</td>
                      <td className="p-4 text-right">
                        <button className="text-white/40 group-hover:text-[#06B6D4] transition-colors">
                          <ChevronRight className="h-4 w-4 ml-auto" />
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {assets.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-16 text-white/40 font-mono">
                      No hardware assets matched the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================== 5. SLIDE-OUT DIAGNOSTIC SIDE DRAWER ==================== */}
      <AnimatePresence>
        {selectedAssetId && assetDetails && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAssetId(null)}
              className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.28, ease: ENTRANCE }}
              className="fixed right-0 top-0 bottom-0 w-full sm:w-[480px] bg-[#101315] border-l border-white/[0.09] shadow-2xl p-6 z-50 flex flex-col justify-between overflow-hidden text-white"
            >
              <div className="space-y-6 overflow-y-auto pr-1 flex-1">
                {/* Header info */}
                <div className="flex items-start justify-between border-b border-white/[0.08] pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Cpu className="h-5 w-5 text-[#06B6D4]" />
                      <h3 className="font-bold text-base text-white">{assetDetails.asset.name}</h3>
                    </div>
                    <p className="text-[10px] text-white/40 font-mono uppercase">
                      PARENT SITE: {assetDetails.plantName}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedAssetId(null)}
                    className="p-1.5 text-white/40 hover:text-white hover:bg-white/[0.08] rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Real-Time Health & Diagnostic Card */}
                <div className="rounded-xl border border-white/[0.08] bg-[#080A0D] p-4 space-y-3 font-mono text-[11px]">
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                    <span className="text-white/40 text-[10px] uppercase font-bold">SCADA HEALTH PULSE</span>
                    <span className="text-[#2FBF71] font-bold">ACTIVE SENSOR FEED</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/50">HEALTH RATING</span>
                    <span className="text-emerald-400 font-bold text-sm">
                      {assetDetails.asset.healthScore?.toFixed(1) ?? "98.4"}%
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className="h-full rounded-full bg-[#2FBF71]"
                      style={{ width: `${assetDetails.asset.healthScore ?? 98.4}%` }}
                    />
                  </div>
                </div>

                {/* Specs Box */}
                <div className="bg-[#080A0D] border border-white/[0.08] rounded-xl p-4 space-y-3 font-mono text-[11px]">
                  <div className="text-white/40 text-[10px] border-b border-white/[0.06] pb-1.5 uppercase font-bold">
                    HARDWARE SPECIFICATIONS
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">MANUFACTURER</span>
                    <span className="text-white font-medium">{assetDetails.asset.manufacturer}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">SERIAL NUMBER</span>
                    <span className="text-white font-medium">{assetDetails.asset.serialNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">INSTALLATION DATE</span>
                    <span className="text-white/70">{assetDetails.asset.installationDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">WARRANTY EXPIRY</span>
                    <span className="text-white/70">{assetDetails.asset.warrantyExpiry}</span>
                  </div>
                  <div className="flex justify-between pt-1.5 border-t border-white/[0.06]">
                    <span className="text-white/40">WARRANTY STATUS</span>
                    {new Date(assetDetails.asset.warrantyExpiry).getTime() > Date.now() ? (
                      <span className="text-[#2FBF71] font-bold flex items-center gap-1">
                        <ShieldCheck className="h-3.5 w-3.5" /> ACTIVE
                      </span>
                    ) : (
                      <span className="text-[#F0526B] font-bold flex items-center gap-1">
                        <ShieldAlert className="h-3.5 w-3.5" /> EXPIRED
                      </span>
                    )}
                  </div>
                </div>

                {/* Active Alarms */}
                <div className="space-y-3">
                  <h4 className="text-[10.5px] text-white/50 font-mono uppercase tracking-wider flex items-center gap-1.5 border-b border-white/[0.08] pb-2 font-bold">
                    <ShieldAlert className="h-4 w-4 text-rose-400" /> Active Diagnostic Alarm Codes
                  </h4>
                  {assetDetails.activeAlarms.length === 0 ? (
                    <div className="p-3 rounded-lg border border-[#2FBF71]/20 bg-[#2FBF71]/10 text-[#2FBF71] font-mono text-xs flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Zero active telemetry alarm codes. System nominal.</span>
                    </div>
                  ) : (
                    assetDetails.activeAlarms.map((a: any) => (
                      <div key={a._id} className="p-3 bg-[#F0526B]/10 border border-[#F0526B]/30 rounded-lg text-xs space-y-1">
                        <div className="flex items-center justify-between font-mono">
                          <span className="font-bold text-[#F0526B]">{a.code}</span>
                          <span className="text-white/40 text-[10px]">{new Date(a.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-white/80 text-[11px] leading-snug">{a.message}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* EAM Lifecycle & Cost Analytics */}
                <div className="bg-[#080A0D] border border-white/[0.08] rounded-xl p-4 space-y-3 font-mono text-[11px]">
                  <div className="text-white/40 text-[10px] border-b border-white/[0.06] pb-1.5 uppercase font-bold">
                    EAM ASSET LIFECYCLE ANALYTICS
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">ACCUMULATED DOWNTIME</span>
                    <span className="text-amber-400 font-bold">{totalDowntime.toFixed(1)} Hrs</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">AGGREGATE EAM EXPENSE</span>
                    <span className="text-emerald-400 font-bold">${totalCost.toFixed(2)}</span>
                  </div>
                  {partsConsumed.length > 0 && (
                    <div className="pt-2 border-t border-white/[0.06]">
                      <span className="text-white/40 block mb-1">PARTS CONSUMED:</span>
                      <div className="flex flex-wrap gap-1">
                        {partsConsumed.map((p: any, idx: number) => (
                          <span key={idx} className="text-[9px] bg-white/[0.06] border border-white/[0.1] text-white/80 px-2 py-0.5 rounded">
                            {p.name} (x{p.quantity})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Maintenance Records */}
                <div className="space-y-3">
                  <h4 className="text-[10.5px] text-white/50 font-mono uppercase tracking-wider flex items-center gap-1.5 border-b border-white/[0.08] pb-2 font-bold">
                    <Wrench className="h-4 w-4 text-cyan-400" /> Maintenance & Work Order Log
                  </h4>
                  {assetDetails.maintenanceLogs.length === 0 ? (
                    <p className="text-white/40 font-mono text-[11px] py-1">No past work orders filed for this asset.</p>
                  ) : (
                    <div className="space-y-2.5">
                      {assetDetails.maintenanceLogs.map((m: any) => (
                        <div key={m._id} className="p-3 bg-[#080A0D] border border-white/[0.06] rounded-lg text-xs space-y-1.5">
                          <div className="flex justify-between items-center font-mono text-[10px]">
                            <span className="text-white font-semibold uppercase">{m.type}</span>
                            <span className={`px-2 py-0.5 rounded text-[8.5px] font-bold ${
                              m.status === "completed" 
                                ? "bg-[#2FBF71]/10 text-[#2FBF71] border border-[#2FBF71]/30"
                                : "bg-[#E8A33D]/10 text-[#E8A33D] border border-[#E8A33D]/30 animate-pulse"
                            }`}>{m.status}</span>
                          </div>
                          <p className="text-white/60 leading-snug text-[11px]">{m.description}</p>
                          <div className="flex justify-between items-center text-[10px] text-white/40 font-mono pt-1">
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {m.scheduledDate}</span>
                            <span>TECH: {m.engineer}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}
