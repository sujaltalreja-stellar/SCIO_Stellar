import React, { useState } from "react";
import { useQuery } from "../lib/convex";
import { api } from "../lib/convex";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Layers,
  Cpu,
  ShieldCheck,
  ShieldAlert,
  Calendar,
  Wrench,
  Clock,
  X,
  SlidersHorizontal
} from "lucide-react";

import { mockDb } from "../../../config/energyMockDb";

export default function AssetRegistry() {
  const [search, setSearch] = useState("");
  const [plantFilter, setPlantFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  
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

  return (
    <div className="space-y-6 relative min-h-screen">
      {/* Title */}
      <div className="border-b border-slate-200 dark:border-white/[0.07] pb-5">
        <h2 className="text-xl font-bold tracking-tight text-[#090D16] dark:text-white">Equipment & Asset Registry</h2>
        <p className="text-xs text-slate-500 dark:text-white/40 font-mono mt-0.5">PORTFOLIO HARDWARE LIFECYCLE AND METRICS</p>
      </div>

      {/* Filters Strip */}
      <div className="flex flex-col xl:flex-row items-center gap-4 bg-white dark:bg-[#FFFDFA]/[0.02] border border-slate-200/90 dark:border-white/[0.07] p-4 rounded-xl shadow-xs dark:shadow-none">
        {/* Search */}
        <div className="relative w-full xl:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-zinc-500" />
          <input
            type="text"
            placeholder="Search by asset name, serial #, manufacturer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-[#080A0D] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white focus:outline-none rounded-lg text-xs placeholder:text-slate-400 dark:placeholder:text-zinc-500 font-sans"
          />
        </div>

        {/* Plant Select */}
        <div className="flex items-center space-x-2 w-full xl:w-auto">
          <span className="text-[10px] text-slate-500 dark:text-white/40 font-mono uppercase font-bold">Plant:</span>
          <select
            value={plantFilter}
            onChange={(e) => setPlantFilter(e.target.value)}
            className="w-full xl:w-48 bg-slate-50 dark:bg-[#080A0D] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white px-3 py-2 rounded-lg text-xs focus:outline-none font-sans"
          >
            <option value="all">All Power Plants</option>
            {plants.map((p: any) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Type Select */}
        <div className="flex items-center space-x-2 w-full xl:w-auto">
          <span className="text-[10px] text-slate-500 dark:text-white/40 font-mono uppercase font-bold">Type:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full xl:w-40 bg-slate-50 dark:bg-[#080A0D] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white px-3 py-2 rounded-lg text-xs focus:outline-none font-sans"
          >
            <option value="all">All Equipment Types</option>
            <option value="panel">Solar Panels</option>
            <option value="inverter">Grid Inverters</option>
            <option value="turbine">Wind Turbines</option>
            <option value="battery">Battery Units</option>
            <option value="transformer">Substation XFMR</option>
            <option value="sensor">SCADA Sensors</option>
          </select>
        </div>

        {/* Status Select */}
        <div className="flex items-center space-x-2 w-full xl:w-auto">
          <span className="text-[10px] text-slate-500 dark:text-white/40 font-mono uppercase font-bold">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full xl:w-36 bg-slate-50 dark:bg-[#080A0D] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white px-3 py-2 rounded-lg text-xs focus:outline-none font-sans"
          >
            <option value="all">All Statuses</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>

        <div className="ml-auto text-[10px] font-mono text-slate-500 dark:text-white/40 font-semibold">
          {assets.length} EQUIPMENT RECORDS LOADED
        </div>
      </div>

      {/* Main Grid table */}
      <div className="bg-white dark:bg-[#FFFDFA]/[0.02] rounded-xl overflow-hidden border border-slate-200/90 dark:border-white/[0.07] shadow-xs dark:shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/[0.07] bg-slate-50/70 dark:bg-[#080A0D] text-slate-700 dark:text-white/40 font-bold uppercase text-[10.5px]">
                <th className="p-4">EQUIPMENT ID / NAME</th>
                <th className="p-4">OPERATING SITE</th>
                <th className="p-4">TYPE</th>
                <th className="p-4 text-right">HEALTH SCORE</th>
                <th className="p-4 text-right">STATUS</th>
                <th className="p-4 text-right">MANUFACTURER</th>
                <th className="p-4 text-right">SERIAL NUMBER</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
              {assets.map((a: any) => {
                const health = a.healthScore;
                let healthColor = "text-emerald-700 dark:text-emerald-400";
                if (health < 88) healthColor = "text-rose-700 dark:text-red-400";
                else if (health < 93) healthColor = "text-amber-700 dark:text-yellow-400";

                return (
                  <tr
                    key={a._id}
                    onClick={() => setSelectedAssetId(a._id)}
                    className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-all cursor-pointer"
                  >
                    <td className="p-4 font-bold text-[#090D16] dark:text-white">{a.name}</td>
                    <td className="p-4 text-slate-700 dark:text-white/70">{a.plantName}</td>
                    <td className="p-4 uppercase text-[10px] text-slate-500 dark:text-white/40 font-semibold">{a.type}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <div className="w-16 bg-slate-200 dark:bg-white/[0.08] h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              health < 88 ? "bg-rose-500" : health < 93 ? "bg-amber-500" : "bg-emerald-500"
                            }`}
                            style={{ width: `${health}%` }}
                          ></div>
                        </div>
                        <span className={`font-bold ${healthColor}`}>{health.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <span className={`px-2.5 py-0.5 rounded-[4px] text-[9px] font-bold uppercase border ${
                        a.status === "online"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-500 dark:border-emerald-500/20"
                          : a.status === "maintenance"
                          ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-yellow-500/10 dark:text-yellow-500 dark:border-yellow-500/20"
                          : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-red-500/10 dark:text-red-500 dark:border-red-500/20 animate-pulse"
                      }`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="p-4 text-right text-slate-700 dark:text-white/70">{a.manufacturer}</td>
                    <td className="p-4 text-right text-slate-500 dark:text-white/40">{a.serialNumber}</td>
                  </tr>
                );
              })}

              {assets.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-slate-400 dark:text-zinc-500">
                    No hardware assets matched the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-out SIDE DRAWER for Asset Detail */}
      <AnimatePresence>
        {selectedAssetId && assetDetails && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAssetId(null)}
              className="fixed inset-0 bg-black z-40"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              className="fixed right-0 top-0 bottom-0 w-[420px] bg-white dark:bg-[#101315] border-l border-slate-200 dark:border-white/[0.08] shadow-2xl p-6 z-50 flex flex-col justify-between overflow-hidden"
            >
              <div className="space-y-6 overflow-y-auto pr-1 flex-1">
                {/* Header info */}
                <div className="flex items-start justify-between border-b border-slate-200 dark:border-white/[0.08] pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Cpu className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400" />
                      <h3 className="font-bold text-md text-[#090D16] dark:text-white">{assetDetails.asset.name}</h3>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-white/40 font-mono uppercase">
                      PARENT SITE: {assetDetails.plantName}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedAssetId(null)}
                    className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:text-zinc-500 dark:hover:text-zinc-300 dark:hover:bg-zinc-900 rounded"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Specs Box */}
                <div className="bg-slate-50 dark:bg-[#080A0D] border border-slate-200 dark:border-white/[0.08] rounded-xl p-4 space-y-3 font-mono text-[11px]">
                  <div className="text-slate-500 dark:text-white/40 text-[10px] border-b border-slate-200 dark:border-white/[0.06] pb-1 mb-2 uppercase font-bold">EQUIPMENT SPECS</div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-white/40">MANUFACTURER</span>
                    <span className="text-slate-900 dark:text-white font-semibold">{assetDetails.asset.manufacturer}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-white/40">SERIAL NUMBER</span>
                    <span className="text-slate-900 dark:text-white font-semibold">{assetDetails.asset.serialNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-white/40">INSTALLATION DATE</span>
                    <span className="text-slate-700 dark:text-white/70">{assetDetails.asset.installationDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-white/40">WARRANTY EXPIRY</span>
                    <span className="text-slate-700 dark:text-white/70">{assetDetails.asset.warrantyExpiry}</span>
                  </div>
                  <div className="flex justify-between pt-1.5 border-t border-slate-200 dark:border-white/[0.06]">
                    <span className="text-slate-500 dark:text-white/40">WARRANTY STATUS</span>
                    {new Date(assetDetails.asset.warrantyExpiry).getTime() > Date.now() ? (
                      <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5" /> ACTIVE</span>
                    ) : (
                      <span className="text-rose-700 dark:text-red-400 font-bold flex items-center gap-1"><ShieldAlert className="h-3.5 w-3.5" /> EXPIRED</span>
                    )}
                  </div>
                </div>

                {/* Active Alarms */}
                <div className="space-y-3">
                  <h4 className="text-[10px] text-slate-500 dark:text-white/40 font-mono uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 dark:border-white/[0.08] pb-1.5 font-bold">
                    <ShieldAlert className="h-4 w-4" /> Active Device Alarms
                  </h4>
                  {assetDetails.activeAlarms.length === 0 ? (
                    <p className="text-slate-400 dark:text-white/40 font-mono text-[10px] py-1">Zero active telemetry alarm codes.</p>
                  ) : (
                    assetDetails.activeAlarms.map((a: any) => (
                      <div key={a._id} className="p-3 bg-rose-50 border border-rose-200 dark:bg-red-950/20 dark:border-red-950/40 rounded-lg text-xs">
                        <div className="flex items-center justify-between font-mono mb-1">
                          <span className="font-bold text-rose-700 dark:text-red-400">{a.code}</span>
                          <span className="text-slate-500 dark:text-white/40 text-[10px]">{new Date(a.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-slate-700 dark:text-white/70 text-[11px] leading-snug">{a.message}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* EAM Lifecycle & Cost Analytics */}
                <div className="bg-slate-50 dark:bg-[#080A0D] border border-slate-200 dark:border-white/[0.08] rounded-xl p-4 space-y-3 font-mono text-[11px]">
                  <div className="text-slate-500 dark:text-white/40 text-[10px] border-b border-slate-200 dark:border-white/[0.06] pb-1 mb-2 uppercase font-bold">EAM LIFECYCLE ANALYTICS</div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-white/40">ACCUMULATED DOWNTIME</span>
                    <span className="text-amber-700 dark:text-amber-400 font-bold">{totalDowntime.toFixed(1)} Hrs</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-white/40">AGGREGATE EAM COST</span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold">${totalCost.toFixed(2)}</span>
                  </div>
                  {partsConsumed.length > 0 && (
                    <div className="pt-2 border-t border-slate-200 dark:border-white/[0.06]">
                      <span className="text-slate-500 dark:text-white/40 block mb-1">PARTS CONSUMED:</span>
                      <div className="flex flex-wrap gap-1">
                        {partsConsumed.map((p: any, idx: number) => (
                          <span key={idx} className="text-[9px] bg-white border border-slate-200 text-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:border-zinc-900 px-1.5 py-0.5 rounded">
                            {p.name} (x{p.quantity})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Maintenance Records */}
                <div className="space-y-3">
                  <h4 className="text-[10px] text-slate-500 dark:text-white/40 font-mono uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 dark:border-white/[0.08] pb-1.5 font-bold">
                    <Wrench className="h-4 w-4" /> Maintenance Log
                  </h4>
                  {assetDetails.maintenanceLogs.length === 0 ? (
                    <p className="text-slate-400 dark:text-white/40 font-mono text-[10px] py-1">No past work orders filed for this asset.</p>
                  ) : (
                    <div className="space-y-3">
                      {assetDetails.maintenanceLogs.map((m: any) => (
                        <div key={m._id} className="p-3 bg-slate-50 dark:bg-[#080A0D] border border-slate-200 dark:border-white/[0.06] rounded-lg text-xs space-y-1.5">
                          <div className="flex justify-between items-center font-mono text-[10px]">
                            <span className="text-slate-800 dark:text-white font-semibold uppercase">{m.type}</span>
                            <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                              m.status === "completed" 
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-500 dark:border-emerald-500/20"
                                : "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-yellow-500/10 dark:text-yellow-500 dark:border-yellow-500/20 animate-pulse"
                            }`}>{m.status}</span>
                          </div>
                          <p className="text-slate-600 dark:text-white/60 leading-snug text-[11px]">{m.description}</p>
                          <div className="flex justify-between items-center text-[10px] text-slate-500 dark:text-white/40 font-mono pt-1">
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
    </div>
  );
}
