import React, { useState } from "react";
import { useQuery } from "../../lib/convex";
import { api } from "../../lib/convex";
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

export default function AssetRegistry() {
  const [search, setSearch] = useState("");
  const [plantFilter, setPlantFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Drawer state
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);

  // Queries
  const plants = useQuery(api.plants.list) ?? [];
  const assets = useQuery(api.assets.list, {
    search: search || undefined,
    plantId: plantFilter === "all" ? undefined : (plantFilter as any),
    type: typeFilter === "all" ? undefined : typeFilter,
    status: statusFilter === "all" ? undefined : statusFilter,
  }) ?? [];

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
      <div>
        <h2 className="text-xl font-bold tracking-tight">Equipment & Asset Registry</h2>
        <p className="text-xs text-zinc-500 font-mono">PORTFOLIO HARDWARE LIFECYCLE AND METRICS</p>
      </div>

      {/* Filters Strip */}
      <div className="flex flex-col xl:flex-row items-center gap-4 bg-zinc-950/40 border border-zinc-900 p-4 rounded-xl">
        {/* Search */}
        <div className="relative w-full xl:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by asset name, serial #, manufacturer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 focus:border-zinc-700 focus:outline-none rounded-lg text-xs placeholder:text-zinc-500 font-sans"
          />
        </div>

        {/* Plant Select */}
        <div className="flex items-center space-x-2 w-full xl:w-auto">
          <span className="text-[10px] text-zinc-500 font-mono uppercase">Plant:</span>
          <select
            value={plantFilter}
            onChange={(e) => setPlantFilter(e.target.value)}
            className="w-full xl:w-48 bg-zinc-900 border border-zinc-800 focus:border-zinc-700 text-zinc-300 px-3 py-2 rounded-lg text-xs focus:outline-none font-sans"
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
          <span className="text-[10px] text-zinc-500 font-mono uppercase">Type:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full xl:w-40 bg-zinc-900 border border-zinc-800 focus:border-zinc-700 text-zinc-300 px-3 py-2 rounded-lg text-xs focus:outline-none font-sans"
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
          <span className="text-[10px] text-zinc-500 font-mono uppercase">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full xl:w-36 bg-zinc-900 border border-zinc-800 focus:border-zinc-700 text-zinc-300 px-3 py-2 rounded-lg text-xs focus:outline-none font-sans"
          >
            <option value="all">All Statuses</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>

        <div className="ml-auto text-[10px] font-mono text-zinc-500">
          {assets.length} EQUIPMENT RECORDS LOADED
        </div>
      </div>

      {/* Main Grid table */}
      <div className="glass-panel rounded-xl overflow-hidden border border-zinc-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-zinc-900 bg-zinc-950/60 text-zinc-500">
                <th className="font-semibold p-4">EQUIPMENT ID / NAME</th>
                <th className="font-semibold p-4">OPERATING SITE</th>
                <th className="font-semibold p-4">TYPE</th>
                <th className="font-semibold p-4 text-right">HEALTH SCORE</th>
                <th className="font-semibold p-4 text-right">STATUS</th>
                <th className="font-semibold p-4 text-right">MANUFACTURER</th>
                <th className="font-semibold p-4 text-right">SERIAL NUMBER</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((a: any) => {
                const health = a.healthScore;
                let healthColor = "text-emerald-400";
                if (health < 88) healthColor = "text-red-400";
                else if (health < 93) healthColor = "text-yellow-400";

                return (
                  <tr
                    key={a._id}
                    onClick={() => setSelectedAssetId(a._id)}
                    className="hover:bg-zinc-900/30 transition-all border-b border-zinc-900/40 cursor-pointer"
                  >
                    <td className="p-4 font-bold text-zinc-200">{a.name}</td>
                    <td className="p-4 text-zinc-400">{a.plantName}</td>
                    <td className="p-4 uppercase text-[10px] text-zinc-400">{a.type}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <div className="w-16 bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              health < 88 ? "bg-red-500" : health < 93 ? "bg-yellow-500" : "bg-emerald-500"
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
                          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                          : a.status === "maintenance"
                          ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                          : "bg-red-500/10 text-red-500 border-red-500/20 animate-pulse"
                      }`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="p-4 text-right text-zinc-400">{a.manufacturer}</td>
                    <td className="p-4 text-right text-zinc-500">{a.serialNumber}</td>
                  </tr>
                );
              })}

              {assets.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-zinc-500">
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
              className="fixed right-0 top-0 bottom-0 w-[420px] bg-zinc-950 border-l border-zinc-900 shadow-2xl p-6 z-50 flex flex-col justify-between overflow-hidden"
            >
              <div className="space-y-6 overflow-y-auto pr-1 flex-1">
                {/* Header info */}
                <div className="flex items-start justify-between border-b border-zinc-900 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Cpu className="h-4.5 w-4.5 text-emerald-500" />
                      <h3 className="font-bold text-md text-zinc-200">{assetDetails.asset.name}</h3>
                    </div>
                    <p className="text-[10px] text-zinc-500 font-mono uppercase">
                      PARENT SITE: {assetDetails.plantName}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedAssetId(null)}
                    className="p-1 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 rounded"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Specs Box */}
                <div className="bg-zinc-900/50 border border-zinc-900 rounded-lg p-4 space-y-3 font-mono text-[11px]">
                  <div className="text-zinc-500 text-[10px] border-b border-zinc-900 pb-1 mb-2 uppercase">EQUIPMENT SPECS</div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">MANUFACTURER</span>
                    <span className="text-zinc-300 font-semibold">{assetDetails.asset.manufacturer}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">SERIAL NUMBER</span>
                    <span className="text-zinc-300 font-semibold">{assetDetails.asset.serialNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">INSTALLATION DATE</span>
                    <span className="text-zinc-300">{assetDetails.asset.installationDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">WARRANTY EXPIRY</span>
                    <span className="text-zinc-300">{assetDetails.asset.warrantyExpiry}</span>
                  </div>
                  <div className="flex justify-between pt-1.5 border-t border-zinc-900/50">
                    <span className="text-zinc-500">WARRANTY STATUS</span>
                    {new Date(assetDetails.asset.warrantyExpiry).getTime() > Date.now() ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5" /> ACTIVE</span>
                    ) : (
                      <span className="text-red-400 font-bold flex items-center gap-1"><ShieldAlert className="h-3.5 w-3.5" /> EXPIRED</span>
                    )}
                  </div>
                </div>

                {/* Active Alarms */}
                <div className="space-y-3">
                  <h4 className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-900 pb-1.5">
                    <ShieldAlert className="h-4 w-4" /> Active Device Alarms
                  </h4>
                  {assetDetails.activeAlarms.length === 0 ? (
                    <p className="text-zinc-500 font-mono text-[10px] py-1">Zero active telemetry alarm codes.</p>
                  ) : (
                    assetDetails.activeAlarms.map((a: any) => (
                      <div key={a._id} className="p-3 bg-red-950/5 border border-red-950/20 rounded-lg text-xs">
                        <div className="flex items-center justify-between font-mono mb-1">
                          <span className="font-bold text-red-400">{a.code}</span>
                          <span className="text-zinc-500 text-[10px]">{new Date(a.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-zinc-400 text-[11px] leading-snug">{a.message}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* EAM Lifecycle & Cost Analytics */}
                <div className="bg-zinc-900/50 border border-zinc-900 rounded-lg p-4 space-y-3 font-mono text-[11px]">
                  <div className="text-zinc-500 text-[10px] border-b border-zinc-900 pb-1 mb-2 uppercase">EAM LIFECYCLE ANALYTICS</div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">ACCUMULATED DOWNTIME</span>
                    <span className="text-amber-400 font-bold">{totalDowntime.toFixed(1)} Hrs</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">AGGREGATE EAM COST</span>
                    <span className="text-emerald-400 font-bold">${totalCost.toFixed(2)}</span>
                  </div>
                  {partsConsumed.length > 0 && (
                    <div className="pt-2 border-t border-zinc-900/50">
                      <span className="text-zinc-500 block mb-1">PARTS CONSUMED:</span>
                      <div className="flex flex-wrap gap-1">
                        {partsConsumed.map((p: any, idx: number) => (
                          <span key={idx} className="text-[9px] bg-slate-950 text-slate-300 border border-zinc-900 px-1.5 py-0.5 rounded">
                            {p.name} (x{p.quantity})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Maintenance Records */}
                <div className="space-y-3">
                  <h4 className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-900 pb-1.5">
                    <Wrench className="h-4 w-4" /> Maintenance Log
                  </h4>
                  {assetDetails.maintenanceLogs.length === 0 ? (
                    <p className="text-zinc-500 font-mono text-[10px] py-1">No past work orders filed for this asset.</p>
                  ) : (
                    <div className="space-y-3">
                      {assetDetails.maintenanceLogs.map((m: any) => (
                        <div key={m._id} className="p-3 bg-zinc-900/40 border border-zinc-900 rounded-lg text-xs space-y-1.5">
                          <div className="flex justify-between items-center font-mono text-[10px]">
                            <span className="text-zinc-300 font-semibold uppercase">{m.type}</span>
                            <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                              m.status === "completed" 
                                ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                                : "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 animate-pulse"
                            }`}>{m.status}</span>
                          </div>
                          <p className="text-zinc-400 leading-snug text-[11px]">{m.description}</p>
                          <div className="flex justify-between items-center text-[10px] text-zinc-500 font-mono pt-1">
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
