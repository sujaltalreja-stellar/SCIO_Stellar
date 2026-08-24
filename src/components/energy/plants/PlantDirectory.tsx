import React, { useState } from "react";
import { useQuery } from "../lib/convex";
import { api } from "../lib/convex";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  Layers,
  Thermometer,
  Activity,
  ShieldAlert,
  ChevronRight,
  Sun,
  Wind,
  Battery,
  MapPin,
  Calendar
} from "lucide-react";

interface PlantDirectoryProps {
  onSelectPlant: (plantId: string) => void;
}

export default function PlantDirectory({ onSelectPlant }: PlantDirectoryProps) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const plants = useQuery(api.plants.list, {
    search: search || undefined,
    type: typeFilter === "all" ? undefined : (typeFilter as any),
    status: statusFilter === "all" ? undefined : (statusFilter as any),
  }) ?? [];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.03 },
    },
  };

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Plant Management Registry</h2>
          <p className="text-xs text-zinc-500 font-mono">PORTFOLIO DATABASE OVERVIEW AND STATUS</p>
        </div>
      </div>

      {/* Filters Strip */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-zinc-950/40 border border-zinc-900 p-4 rounded-xl">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by name, region, owner..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 focus:border-zinc-700 focus:outline-none rounded-lg text-xs placeholder:text-zinc-500 font-sans"
          />
        </div>

        {/* Type Filter */}
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <span className="text-[10px] text-zinc-500 font-mono uppercase">Type:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 focus:border-zinc-700 text-zinc-300 px-3 py-2 rounded-lg text-xs focus:outline-none font-sans"
          >
            <option value="all">All Plant Types</option>
            <option value="solar">Solar PV</option>
            <option value="wind">Wind Farm</option>
            <option value="bess">BESS (Battery Storage)</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <span className="text-[10px] text-zinc-500 font-mono uppercase">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 focus:border-zinc-700 text-zinc-300 px-3 py-2 rounded-lg text-xs focus:outline-none font-sans"
          >
            <option value="all">All Operational Statuses</option>
            <option value="online">Online</option>
            <option value="maintenance">Maintenance</option>
            <option value="offline">Offline</option>
          </select>
        </div>

        {/* Total Count */}
        <div className="ml-auto text-[10px] font-mono text-zinc-500">
          SHOWING {plants.length} RECORDS
        </div>
      </div>

      {/* Grid of Plants */}
      {plants.length === 0 ? (
        <div className="text-center py-20 text-zinc-500 border border-dashed border-zinc-900 rounded-xl">
          <Layers className="h-8 w-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm font-semibold">No plants match the specified query filters.</p>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
        >
          {plants.map((p: any) => {
            const isSolar = p.type === "solar";
            const isWind = p.type === "wind";
            const isBess = p.type === "bess";

            let icon = <Sun className="h-5 w-5 text-amber-500" />;
            let glowClass = "digital-glow-solar";
            if (isWind) {
              icon = <Wind className="h-5 w-5 text-sky-500" />;
              glowClass = "digital-glow-wind";
            } else if (isBess) {
              icon = <Battery className="h-5 w-5 text-emerald-500" />;
              glowClass = "digital-glow-bess";
            }

            return (
              <motion.div
                key={p._id}
                variants={cardVariants}
                onClick={() => onSelectPlant(p._id)}
                className={`glass-panel p-5 rounded-xl flex flex-col justify-between cursor-pointer border border-zinc-900 group hover:scale-[1.01] transition-all relative ${glowClass}`}
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-zinc-900 p-2 rounded-lg border border-zinc-800">
                        {icon}
                      </div>
                      <div>
                        <h3 className="font-bold text-zinc-200 text-sm tracking-wide group-hover:text-emerald-400 transition-colors">
                          {p.name}
                        </h3>
                        <p className="text-[10px] text-zinc-500 font-mono flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3" /> {p.location}
                        </p>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono uppercase border ${
                      p.status === "online" 
                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                        : p.status === "maintenance"
                        ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                        : "bg-red-500/10 text-red-500 border-red-500/20 animate-pulse"
                    }`}>
                      {p.status}
                    </span>
                  </div>

                  {/* Core Metrics */}
                  <div className="grid grid-cols-2 gap-4 border-t border-b border-zinc-900/60 py-4 my-4 font-mono text-[11px] text-zinc-400">
                    <div>
                      <span className="text-[9px] text-zinc-500 uppercase tracking-wider block">Installed capacity</span>
                      <span className="text-zinc-200 text-sm font-semibold">{p.capacity} MW</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-zinc-500 uppercase tracking-wider block">Current output</span>
                      <span className="text-emerald-400 text-sm font-semibold">{p.currentPower.toFixed(1)} MW</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-zinc-500 uppercase tracking-wider block">reliability index</span>
                      <span className={`text-sm font-semibold ${
                        p.healthScore > 90 ? "text-emerald-400" : p.healthScore > 85 ? "text-yellow-400" : "text-red-400"
                      }`}>{p.healthScore.toFixed(1)}%</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-zinc-500 uppercase tracking-wider block">Today's yield</span>
                      <span className="text-zinc-200 text-sm font-semibold">{p.todayProduction.toFixed(1)} MWh</span>
                    </div>
                  </div>
                </div>

                {/* Card Footer info */}
                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 pt-1">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center gap-1"><Thermometer className="h-3 w-3 text-zinc-500" /> {p.weatherTemp.toFixed(1)}°C</span>
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3 text-zinc-500" /> {p.commissioningDate.split("-")[0]}</span>
                  </div>

                  {p.activeAlarmsCount > 0 ? (
                    <span className="bg-red-500/10 text-red-500 border border-red-500/20 text-[9px] font-bold font-mono px-2 py-0.5 rounded flex items-center gap-1">
                      <ShieldAlert className="h-3 w-3 text-red-500" /> {p.activeAlarmsCount} ALERTS
                    </span>
                  ) : (
                    <span className="text-zinc-600 flex items-center gap-1 group-hover:text-emerald-500 transition-colors uppercase font-bold text-[9px]">
                      Open Console <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
