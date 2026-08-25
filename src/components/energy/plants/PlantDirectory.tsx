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
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/[0.07] pb-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#090D16] dark:text-white">Plant Management Registry</h2>
          <p className="text-xs text-slate-500 dark:text-white/40 font-mono mt-0.5">PORTFOLIO DATABASE OVERVIEW AND STATUS</p>
        </div>
      </div>

      {/* Filters Strip */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-white dark:bg-[#FFFDFA]/[0.02] border border-slate-200/90 dark:border-white/[0.07] p-4 rounded-xl shadow-xs dark:shadow-none">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-zinc-500" />
          <input
            type="text"
            placeholder="Search by name, region, owner..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-[#080A0D] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white focus:outline-none rounded-lg text-xs placeholder:text-slate-400 dark:placeholder:text-zinc-500 font-sans"
          />
        </div>

        {/* Type Filter */}
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <span className="text-[10px] text-slate-500 dark:text-white/40 font-mono uppercase font-bold">Type:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-50 dark:bg-[#080A0D] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white px-3 py-2 rounded-lg text-xs focus:outline-none font-sans"
          >
            <option value="all">All Plant Types</option>
            <option value="solar">Solar PV</option>
            <option value="wind">Wind Farm</option>
            <option value="bess">BESS (Battery Storage)</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <span className="text-[10px] text-slate-500 dark:text-white/40 font-mono uppercase font-bold">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 dark:bg-[#080A0D] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white px-3 py-2 rounded-lg text-xs focus:outline-none font-sans"
          >
            <option value="all">All Operational Statuses</option>
            <option value="online">Online</option>
            <option value="maintenance">Maintenance</option>
            <option value="offline">Offline</option>
          </select>
        </div>

        {/* Total Count */}
        <div className="ml-auto text-[10px] font-mono text-slate-500 dark:text-white/40 font-semibold">
          SHOWING {plants.length} RECORDS
        </div>
      </div>

      {/* Grid of Plants */}
      {plants.length === 0 ? (
        <div className="text-center py-20 text-slate-400 dark:text-zinc-500 border border-dashed border-slate-200 dark:border-zinc-800 rounded-xl">
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
            if (isWind) {
              icon = <Wind className="h-5 w-5 text-sky-500" />;
            } else if (isBess) {
              icon = <Battery className="h-5 w-5 text-emerald-500" />;
            }

            return (
              <motion.div
                key={p._id}
                variants={cardVariants}
                onClick={() => onSelectPlant(p._id)}
                className="bg-white dark:bg-[#FFFDFA]/[0.02] p-5 rounded-xl flex flex-col justify-between cursor-pointer border border-slate-200/90 dark:border-white/[0.07] hover:border-slate-300 dark:hover:border-white/[0.14] group shadow-xs dark:shadow-none hover:shadow-md transition-all relative"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-slate-100 dark:bg-[#080A0D] p-2 rounded-lg border border-slate-200 dark:border-white/[0.06]">
                        {icon}
                      </div>
                      <div>
                        <h3 className="font-bold text-[#090D16] dark:text-zinc-200 text-sm tracking-wide group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {p.name}
                        </h3>
                        <p className="text-[10px] text-slate-500 dark:text-zinc-500 font-mono flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3" /> {p.location}
                        </p>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono uppercase border ${
                      p.status === "online" 
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-500 dark:border-emerald-500/20" 
                        : p.status === "maintenance"
                        ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-yellow-500/10 dark:text-yellow-500 dark:border-yellow-500/20"
                        : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-red-500/10 dark:text-red-500 dark:border-red-500/20 animate-pulse"
                    }`}>
                      {p.status}
                    </span>
                  </div>

                  {/* Core Metrics */}
                  <div className="grid grid-cols-2 gap-4 border-t border-b border-slate-100 dark:border-white/[0.06] py-4 my-4 font-mono text-[11px]">
                    <div>
                      <span className="text-[9px] text-slate-500 dark:text-white/40 uppercase tracking-wider block font-semibold">Installed capacity</span>
                      <span className="text-[#090D16] dark:text-zinc-200 text-sm font-semibold">{p.capacity} MW</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 dark:text-white/40 uppercase tracking-wider block font-semibold">Current output</span>
                      <span className="text-emerald-700 dark:text-emerald-400 text-sm font-bold">{p.currentPower.toFixed(1)} MW</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 dark:text-white/40 uppercase tracking-wider block font-semibold">reliability index</span>
                      <span className={`text-sm font-bold ${
                        p.healthScore > 90 ? "text-emerald-700 dark:text-emerald-400" : p.healthScore > 85 ? "text-amber-700 dark:text-yellow-400" : "text-rose-700 dark:text-red-400"
                      }`}>{p.healthScore.toFixed(1)}%</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 dark:text-white/40 uppercase tracking-wider block font-semibold">Today's yield</span>
                      <span className="text-[#090D16] dark:text-zinc-200 text-sm font-semibold">{p.todayProduction.toFixed(1)} MWh</span>
                    </div>
                  </div>
                </div>

                {/* Card Footer info */}
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-white/40 pt-1">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center gap-1"><Thermometer className="h-3 w-3" /> {p.weatherTemp.toFixed(1)}°C</span>
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {p.commissioningDate.split("-")[0]}</span>
                  </div>

                  {p.activeAlarmsCount > 0 ? (
                    <span className="bg-rose-50 text-rose-700 border border-rose-200 dark:bg-red-500/10 dark:text-red-500 dark:border-red-500/20 text-[9px] font-bold font-mono px-2 py-0.5 rounded flex items-center gap-1">
                      <ShieldAlert className="h-3 w-3 text-rose-600 dark:text-red-500" /> {p.activeAlarmsCount} ALERTS
                    </span>
                  ) : (
                    <span className="text-slate-600 dark:text-zinc-400 flex items-center gap-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors uppercase font-bold text-[9px]">
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
