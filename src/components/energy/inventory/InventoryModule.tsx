import React, { useState } from "react";
import { useQuery, useMutation } from "../lib/convex";
import { api } from "../lib/convex";
import { 
  Warehouse as WHIcon, 
  Package, 
  RefreshCw, 
  AlertTriangle, 
  Search, 
  Info,
  Sliders,
  TrendingUp,
  MapPin,
  ClipboardList,
  Truck,
  Ship,
  Calendar,
  CheckCircle,
  SlidersHorizontal
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function InventoryModule({ hideHeader = false }: { hideHeader?: boolean }) {
  const [activeSubTab, setActiveSubTab] = useState<"ledger" | "logistics">("ledger");
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>("wh_1");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [adjustingItem, setAdjustingItem] = useState<any | null>(null);
  const [adjustmentQty, setAdjustmentQty] = useState<number>(0);
  const [adjustmentReason, setAdjustmentReason] = useState<string>("");

  const warehouses = useQuery(api.inventory.listWarehouses) ?? [];
  const inventory = useQuery(api.inventory.listInventory, { warehouseId: selectedWarehouseId as any }) ?? [];
  const shipments = useQuery(api.inventory.listShipments) ?? [];
  const auditLogs = useQuery(api.audit.list, { limit: 20 }) ?? [];

  const adjustStock = useMutation(api.inventory.adjustStock);

  const selectedWH = warehouses.find((w: any) => w._id === selectedWarehouseId);

  // Filters
  const filteredInventory = inventory.filter((item: any) => {
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    const matchesSearch = item.partName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.partCode.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingItem) return;

    try {
      await adjustStock({
        itemId: adjustingItem._id,
        adjustment: adjustmentQty,
        reason: adjustmentReason,
        operator: "Inventory Manager"
      });
      alert(`Stock adjusted successfully for ${adjustingItem.partName}!`);
      setAdjustingItem(null);
      setAdjustmentQty(0);
      setAdjustmentReason("");
    } catch (err: any) {
      alert("Error adjusting stock: " + err.message);
    }
  };

  const handleQuickReorder = async (item: any) => {
    alert(`Auto-triggered purchase requisition dispatched in procurement workflow for 10 units of ${item.partName}.`);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/[0.07] pb-5">
        {!hideHeader && (
          <div>
            <h2 className="text-xl font-bold tracking-tight text-[#090D16] dark:text-white flex items-center gap-2">
              Inventory & Warehouse Management 
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded border border-slate-200 bg-slate-100 text-slate-700 dark:border-zinc-700 dark:text-zinc-400 dark:bg-slate-800/35">
                SCM Hub
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-white/40 font-mono mt-0.5">
              WAREHOUSE UTILIZATION, SPARE PARTS, AND STOCK ADJUSTMENTS
            </p>
          </div>
        )}

        {/* Sub tab selectors */}
        <div className="flex bg-slate-100 dark:bg-zinc-900/60 p-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 text-xs font-mono">
          {(["ledger", "logistics"] as const).map(tab => {
            const isActive = activeSubTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveSubTab(tab)}
                className={`px-3 py-1.5 rounded-md transition-all uppercase font-semibold ${
                  isActive 
                    ? "bg-slate-900 text-white shadow-xs dark:bg-emerald-500/10 dark:text-emerald-400 dark:border dark:border-emerald-500/20" 
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 dark:text-zinc-400 dark:hover:text-zinc-200"
                }`}
              >
                {tab === "ledger" ? "Stock Ledger & Bins" : "In-Transit Cargo"}
              </button>
            );
          })}
        </div>
      </div>

      {activeSubTab === "ledger" && (
        <>
          {/* Warehouse Selector grid - Pure Neutral Contrast (Zero Green Background Layer) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {warehouses.map((wh: any) => {
              const isSelected = wh._id === selectedWarehouseId;
              return (
                <button
                  key={wh._id}
                  onClick={() => setSelectedWarehouseId(wh._id)}
                  className={`p-5 rounded-xl text-left transition-all flex items-start gap-4 relative overflow-hidden bg-white dark:bg-slate-900 ${
                    isSelected 
                      ? "border-2 border-slate-900 dark:border-emerald-500 shadow-md ring-1 ring-slate-900/10 dark:ring-emerald-500/20" 
                      : "border border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700 shadow-2xs"
                  }`}
                >
                  {/* Left accent bar on selection */}
                  {isSelected && (
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-600 dark:bg-emerald-400" />
                  )}

                  <div className={`p-2.5 rounded-lg border shrink-0 ${
                    isSelected 
                      ? "bg-slate-100 border-slate-300 text-slate-950 dark:bg-slate-800 dark:border-slate-700 dark:text-emerald-400" 
                      : "bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-400"
                  }`}>
                    <WHIcon className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-slate-950 dark:text-white truncate">{wh.name}</h4>
                      {isSelected ? (
                        <span className="px-2 py-0.5 rounded text-[9.5px] font-mono font-bold bg-slate-100 text-slate-900 border border-slate-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-700 shrink-0 ml-2">
                          ACTIVE
                        </span>
                      ) : null}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1 mt-1 truncate font-medium">
                      <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400 dark:text-slate-400" /> {wh.location}
                    </p>
                    <div className="mt-3">
                      <div className="flex justify-between text-[11px] font-mono mb-1 font-semibold">
                        <span className="text-slate-600 dark:text-slate-400">Utilization:</span>
                        <span className="font-bold text-slate-950 dark:text-white">{wh.utilization}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200/60 dark:border-slate-700/60">
                        <div 
                          className="h-full bg-emerald-600 dark:bg-emerald-500 rounded-full" 
                          style={{ width: `${wh.utilization}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Parts table list */}
            <div className="lg:col-span-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 rounded-xl p-5 space-y-4 shadow-2xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-950 dark:text-white">Spare Parts Inventory List</h3>
                
                <div className="flex items-center gap-2">
                  {/* Search */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search parts code..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white pl-8 pr-3 py-1.5 rounded-lg focus:outline-none text-[11px] font-mono w-44"
                    />
                  </div>

                  {/* Filter */}
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white px-2 py-1.5 rounded-lg focus:outline-none text-[11px] font-mono"
                  >
                    <option value="all">All Types</option>
                    <option value="mechanical">Mechanical</option>
                    <option value="electrical">Electrical</option>
                    <option value="consumables">Consumables</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto text-xs font-mono">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 uppercase text-[10.5px] font-bold">
                      <th className="pb-3">Part Spec</th>
                      <th className="pb-3">Part Code</th>
                      <th className="pb-3">Bin Location</th>
                      <th className="pb-3 text-right">Qty In Stock</th>
                      <th className="pb-3 text-right">Reserved</th>
                      <th className="pb-3 text-right">Min/Max</th>
                      <th className="pb-3 text-right">Reorder Status</th>
                      <th className="pb-3 text-right">Adjust</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {filteredInventory.map((item: any) => {
                      const isLow = item.quantity <= item.minStock;
                      return (
                        <tr key={item._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-3">
                            <p className="font-bold text-slate-950 dark:text-white">{item.partName}</p>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">{item.category}</span>
                          </td>
                          <td className="py-3 text-slate-800 dark:text-slate-300 font-mono text-[11px] font-semibold">{item.partCode}</td>
                          <td className="py-3 text-slate-800 dark:text-slate-300">{item.binLocation}</td>
                          <td className={`py-3 text-right font-bold ${isLow ? "text-rose-600 dark:text-rose-400" : "text-emerald-700 dark:text-emerald-400"}`}>
                            {item.quantity}
                          </td>
                          <td className="py-3 text-right text-slate-700 dark:text-slate-300">{item.reserved}</td>
                          <td className="py-3 text-right text-slate-700 dark:text-slate-300">{item.minStock} / {item.maxStock}</td>
                          <td className="py-3 text-right">
                            {isLow ? (
                              <button
                                onClick={() => handleQuickReorder(item)}
                                className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 dark:text-rose-400 dark:border-rose-500/30 px-2 py-0.5 rounded font-bold transition-all text-[9px] uppercase animate-pulse"
                              >
                                Low - Reorder
                              </button>
                            ) : (
                              <span className="text-emerald-700 dark:text-emerald-400 text-[9px] uppercase px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/5 font-bold">
                                Nominal
                              </span>
                            )}
                          </td>
                          <td className="py-3 text-right">
                            <button
                              onClick={() => {
                                setAdjustingItem(item);
                                setAdjustmentQty(item.quantity);
                              }}
                              className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 p-1.5 rounded transition-all"
                            >
                              <Sliders className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Warehouse Rack Space and Adjust Log */}
            <div className="space-y-6">
              {/* Rack layout visualization */}
              <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 rounded-xl p-5 space-y-4 shadow-2xs">
                <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-950 dark:text-white">2D Warehouse Layout Map</h3>
                <div className="grid grid-cols-4 gap-2 font-mono text-center text-[10px]">
                  {Array.from({ length: 16 }).map((_, idx) => {
                    const rowLetter = String.fromCharCode(65 + Math.floor(idx / 4));
                    const shelfNum = (idx % 4) + 1;
                    const code = `${rowLetter}-${shelfNum}`;
                    const itemsInBin = inventory.filter((i: any) => i.binLocation.startsWith(code));
                    const isOccupied = itemsInBin.length > 0;
                    const sumQty = itemsInBin.reduce((sum: number, it: any) => sum + it.quantity, 0);

                    return (
                      <div 
                        key={idx} 
                        className={`p-2.5 rounded-lg border flex flex-col justify-between h-16 ${
                          isOccupied 
                            ? sumQty > 150
                              ? "bg-amber-50 border-amber-300 text-amber-950 dark:bg-amber-950/40 dark:border-amber-500/40 dark:text-amber-300"
                              : "bg-emerald-50 border-emerald-300 text-emerald-950 dark:bg-emerald-950/40 dark:border-emerald-500/40 dark:text-emerald-300" 
                            : "bg-slate-50 border-slate-200 text-slate-500 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-500"
                        }`}
                      >
                        <span className="font-bold text-[9px] block text-slate-600 dark:text-slate-400">{code}</span>
                        <span className="font-bold block mt-1">{isOccupied ? `${sumQty} pcs` : "Empty"}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between text-[9.5px] font-mono text-slate-600 dark:text-slate-400 pt-1">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-emerald-100 border border-emerald-400 dark:bg-emerald-900/50 dark:border-emerald-500 rounded" /> Inbound Rack Space</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-amber-100 border border-amber-400 dark:bg-amber-900/50 dark:border-amber-500 rounded" /> Near-Capacity Rack</span>
                </div>
              </div>

              {/* Inventory adjustment log drawer */}
              <AnimatePresence>
                {adjustingItem && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border border-slate-200/90 dark:border-white/[0.07] bg-white dark:bg-[#FFFDFA]/[0.02] rounded-xl p-5 space-y-4 shadow-xs dark:shadow-none"
                  >
                    <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-900 dark:text-white">Post Inventory Adjustment</h3>
                    <form onSubmit={handleAdjustStock} className="space-y-4 font-mono text-xs">
                      <div className="border border-slate-200 bg-slate-50 dark:border-white/[0.08] dark:bg-[#080A0D] p-3 rounded-lg">
                        <p className="font-bold text-[#090D16] dark:text-white text-[11px]">{adjustingItem.partName}</p>
                        <p className="text-[10px] text-slate-500 dark:text-white/40 mt-0.5">Part Code: {adjustingItem.partCode} | Current Stock: {adjustingItem.quantity}</p>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] text-slate-500 dark:text-white/40 uppercase font-bold">Adjusted Stock Balance:</label>
                        <input
                          type="number"
                          required
                          value={adjustmentQty}
                          onChange={(e) => setAdjustmentQty(parseInt(e.target.value) || 0)}
                          className="w-full bg-slate-50 dark:bg-[#080A0D] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white p-2 rounded-lg focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] text-slate-500 dark:text-white/40 uppercase font-bold">Reason Code / Explanation:</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Cycle count discrepancy corrected"
                          value={adjustmentReason}
                          onChange={(e) => setAdjustmentReason(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-[#080A0D] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white p-2 rounded-lg focus:outline-none"
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-500 dark:hover:bg-emerald-600 dark:text-zinc-950 py-2 rounded-lg font-bold transition-all"
                        >
                          Post Adjustment
                        </button>
                        <button
                          type="button"
                          onClick={() => setAdjustingItem(null)}
                          className="border border-slate-200 dark:border-white/[0.1] px-3 py-2 text-slate-600 dark:text-white/50 hover:bg-slate-100 dark:hover:bg-white/[0.05] rounded-lg"
                        >
                          Close
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </>
      )}

      {activeSubTab === "logistics" && (
        <div className="border border-slate-200/90 dark:border-white/[0.07] bg-white dark:bg-[#FFFDFA]/[0.02] rounded-xl p-5 shadow-xs dark:shadow-none">
          <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-900 dark:text-white mb-4">In-Transit Heavy Cargo Shipments</h3>
          <div className="space-y-4 font-mono text-xs">
            {shipments.length === 0 ? (
              <p className="text-slate-400 dark:text-white/40 italic text-center py-6">No cargo shipments currently in transit.</p>
            ) : (
              shipments.map((s: any) => {
                const step = s.status === "in_transit" ? 1 : s.status === "customs" ? 2 : 3;
                return (
                  <div key={s._id} className="border border-slate-200 bg-slate-50/50 dark:border-white/[0.06] dark:bg-[#080A0D] p-5 rounded-xl space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/[0.06] pb-3">
                      <div>
                        <h4 className="font-bold text-[#090D16] dark:text-white text-sm flex items-center gap-1.5">
                          <Ship className="w-4 h-4 text-sky-600 dark:text-sky-400" /> Part: {s.partCode}
                        </h4>
                        <p className="text-[10px] text-slate-500 dark:text-white/40 mt-0.5">Carrier: {s.carrier} | Origin: {s.origin}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-500 dark:text-white/40 uppercase text-[9px] block">Estimated Arrival (ETA):</span>
                        <span className="text-emerald-700 dark:text-emerald-400 font-bold text-sm">{s.eta}</span>
                      </div>
                    </div>

                    {/* Step bar */}
                    <div className="relative pt-2">
                      <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 dark:bg-white/[0.08] -translate-y-1/2 rounded" />
                      <div 
                        className="absolute top-1/2 left-0 h-1 bg-emerald-500 -translate-y-1/2 rounded transition-all duration-500" 
                        style={{ width: step === 1 ? "15%" : step === 2 ? "55%" : "100%" }}
                      />
                      
                      <div className="relative flex justify-between">
                        {/* Step 1 */}
                        <div className="flex flex-col items-center">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center font-bold z-10 ${
                            step >= 1 
                              ? "bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400" 
                              : "bg-white border-slate-200 text-slate-400 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-500"
                          }`}>
                            1
                          </div>
                          <span className="text-[9px] text-slate-600 dark:text-white/40 mt-1 uppercase font-bold">Transit</span>
                        </div>

                        {/* Step 2 */}
                        <div className="flex flex-col items-center">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center font-bold z-10 ${
                            step >= 2 
                              ? "bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400" 
                              : "bg-white border-slate-200 text-slate-400 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-500"
                          }`}>
                            2
                          </div>
                          <span className="text-[9px] text-slate-600 dark:text-white/40 mt-1 uppercase font-bold">Customs</span>
                        </div>

                        {/* Step 3 */}
                        <div className="flex flex-col items-center">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center font-bold z-10 ${
                            step >= 3 
                              ? "bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400" 
                              : "bg-white border-slate-200 text-slate-400 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-500"
                          }`}>
                            3
                          </div>
                          <span className="text-[9px] text-slate-600 dark:text-white/40 mt-1 uppercase font-bold">Delivered</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
