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
  CheckCircle
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
      <div className="flex items-center justify-between border-b border-zinc-900 pb-5">
        {!hideHeader && (
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Inventory & Warehouse Management <span className="text-xs font-mono font-medium px-2 py-0.5 rounded border border-zinc-700 text-zinc-400 bg-slate-800/35">SCM Hub</span>
            </h2>
            <p className="text-xs text-zinc-500 font-mono">WAREHOUSE UTILIZATION, SPARE PARTS, AND STOCK ADJUSTMENTS</p>
          </div>
        )}

        {/* Sub tab selectors */}
        <div className="flex bg-zinc-900/60 p-1.5 rounded-lg border border-zinc-800 text-xs font-mono">
          {(["ledger", "logistics"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveSubTab(tab)}
              className={`px-3 py-1.5 rounded-md transition-all uppercase ${
                activeSubTab === tab 
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold" 
                  : "text-zinc-400 hover:text-zinc-200 border border-transparent"
              }`}
            >
              {tab === "ledger" ? "Stock Ledger & Bins" : "In-Transit Cargo"}
            </button>
          ))}
        </div>
      </div>

      {activeSubTab === "ledger" && (
        <>
          {/* Warehouse Selector grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {warehouses.map((wh: any) => {
              const isSelected = wh._id === selectedWarehouseId;
              return (
                <button
                  key={wh._id}
                  onClick={() => setSelectedWarehouseId(wh._id)}
                  className={`p-5 rounded-xl border text-left transition-all flex items-start gap-4 ${
                    isSelected 
                      ? "bg-zinc-900/50 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.05)]" 
                      : "bg-zinc-950/20 border-zinc-900 hover:border-zinc-800"
                  }`}
                >
                  <div className={`p-2.5 rounded-lg border ${
                    isSelected ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-zinc-900 border-zinc-800 text-zinc-400"
                  }`}>
                    <WHIcon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 font-mono text-xs">
                    <h3 className="font-bold text-white text-sm">{wh.name}</h3>
                    <p className="text-zinc-500 flex items-center gap-1 mt-1"><MapPin className="w-3.5 h-3.5" /> {wh.location}</p>
                    <div className="mt-3 space-y-1">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-zinc-500">Utilization:</span>
                        <span className={wh.utilization > 70 ? "text-amber-500 font-bold" : "text-emerald-400"}>{wh.utilization}%</span>
                      </div>
                      <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden border border-zinc-950">
                        <div 
                          className={`h-full rounded-full ${wh.utilization > 70 ? "bg-amber-500" : "bg-emerald-500"}`} 
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
            <div className="lg:col-span-2 border border-zinc-900 bg-zinc-950/20 rounded-xl p-5 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-900 pb-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-zinc-200">Spare Parts Inventory List</h3>
                
                <div className="flex items-center gap-2">
                  {/* Search */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search parts code..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-zinc-950 border border-zinc-900 text-zinc-300 pl-8 pr-3 py-1.5 rounded-lg focus:outline-none text-[11px] font-mono w-44"
                    />
                  </div>

                  {/* Filter */}
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="bg-zinc-900 border border-zinc-800 text-zinc-300 px-2 py-1.5 rounded-lg focus:outline-none text-[11px]"
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
                    <tr className="border-b border-zinc-800 text-zinc-500 uppercase text-[10px]">
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
                  <tbody>
                    {filteredInventory.map((item: any) => {
                      const isLow = item.quantity <= item.minStock;
                      return (
                        <tr key={item._id} className="border-b border-zinc-900 hover:bg-zinc-900/10">
                          <td className="py-3">
                            <p className="font-bold text-white">{item.partName}</p>
                            <span className="text-[10px] text-zinc-500 uppercase">{item.category}</span>
                          </td>
                          <td className="py-3 text-zinc-400 font-mono text-[11px]">{item.partCode}</td>
                          <td className="py-3 text-zinc-400">{item.binLocation}</td>
                          <td className={`py-3 text-right font-bold ${isLow ? "text-red-400" : "text-emerald-400"}`}>{item.quantity}</td>
                          <td className="py-3 text-right text-zinc-500">{item.reserved}</td>
                          <td className="py-3 text-right text-zinc-500">{item.minStock} / {item.maxStock}</td>
                          <td className="py-3 text-right">
                            {isLow ? (
                              <button
                                onClick={() => handleQuickReorder(item)}
                                className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded font-bold transition-all text-[9px] uppercase animate-pulse"
                              >
                                Low - Reorder
                              </button>
                            ) : (
                              <span className="text-emerald-400 text-[9px] uppercase px-2 py-0.5 rounded border border-emerald-500/20 bg-emerald-500/5">
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
                              className="text-zinc-400 hover:text-white hover:bg-zinc-900 p-1.5 rounded transition-all"
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
              <div className="border border-zinc-900 bg-zinc-950/20 rounded-xl p-5 space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-zinc-200">2D Warehouse Layout Map</h3>
                <div className="grid grid-cols-4 gap-2 font-mono text-center text-[10px] text-zinc-300">
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
                        className={`p-3 rounded-lg border flex flex-col justify-between h-16 ${
                          isOccupied 
                            ? sumQty > 150
                              ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                              : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                            : "bg-zinc-950 border-zinc-900 text-zinc-600"
                        }`}
                      >
                        <span className="font-bold text-[9px] block text-zinc-500">{code}</span>
                        <span className="font-bold block mt-1">{isOccupied ? `${sumQty} pcs` : "Empty"}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between text-[9px] font-mono text-zinc-500">
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-emerald-500/20 border border-emerald-500/30 rounded" /> Inbound Rack Space</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-amber-500/20 border border-amber-500/30 rounded" /> Near-Capacity Rack</span>
                </div>
              </div>

              {/* Inventory adjustment log drawer */}
              <AnimatePresence>
                {adjustingItem && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border border-zinc-900 bg-zinc-950/20 rounded-xl p-5 space-y-4"
                  >
                    <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-zinc-200">Post Inventory Adjustment</h3>
                    <form onSubmit={handleAdjustStock} className="space-y-4 font-mono text-xs">
                      <div className="border border-zinc-900 bg-zinc-950/40 p-3 rounded">
                        <p className="font-bold text-white text-[11px]">{adjustingItem.partName}</p>
                        <p className="text-[10px] text-zinc-500 mt-0.5">Part Code: {adjustingItem.partCode} | Current Stock: {adjustingItem.quantity}</p>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] text-zinc-500 uppercase">Adjusted Stock Balance:</label>
                        <input
                          type="number"
                          required
                          value={adjustmentQty}
                          onChange={(e) => setAdjustmentQty(parseInt(e.target.value) || 0)}
                          className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 p-2 rounded focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] text-zinc-500 uppercase">Reason Code / Explanation:</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Cycle count discrepancy corrected"
                          value={adjustmentReason}
                          onChange={(e) => setAdjustmentReason(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 p-2 rounded focus:outline-none"
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 py-2 rounded font-bold transition-all"
                        >
                          Post Adjustment
                        </button>
                        <button
                          type="button"
                          onClick={() => setAdjustingItem(null)}
                          className="border border-zinc-850 px-3 py-2 text-zinc-400 hover:bg-zinc-900 rounded"
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
        <div className="border border-zinc-900 bg-zinc-950/20 rounded-xl p-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-zinc-200 mb-4">In-Transit Heavy Cargo Shipments</h3>
          <div className="space-y-4 font-mono text-xs">
            {shipments.length === 0 ? (
              <p className="text-zinc-500 italic text-center py-6">No cargo shipments currently in transit.</p>
            ) : (
              shipments.map((s: any) => {
                const step = s.status === "in_transit" ? 1 : s.status === "customs" ? 2 : 3;
                return (
                  <div key={s._id} className="border border-zinc-900 bg-zinc-950/40 p-5 rounded-xl space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-900/60 pb-3">
                      <div>
                        <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                          <Ship className="w-4 h-4 text-sky-400" /> Part: {s.partCode}
                        </h4>
                        <p className="text-[10px] text-zinc-500 mt-0.5">Carrier: {s.carrier} | Origin: {s.origin}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-zinc-500 uppercase text-[9px] block">Estimated Arrival (ETA):</span>
                        <span className="text-emerald-400 font-bold text-sm">{s.eta}</span>
                      </div>
                    </div>

                    {/* Step bar */}
                    <div className="relative pt-2">
                      <div className="absolute top-1/2 left-0 right-0 h-1 bg-zinc-800 -translate-y-1/2 rounded" />
                      <div 
                        className="absolute top-1/2 left-0 h-1 bg-emerald-500 -translate-y-1/2 rounded transition-all duration-500" 
                        style={{ width: step === 1 ? "15%" : step === 2 ? "55%" : "100%" }}
                      />
                      
                      <div className="relative flex justify-between">
                        {/* Step 1 */}
                        <div className="flex flex-col items-center">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center font-bold z-10 ${
                            step >= 1 ? "bg-emerald-500/20 border-emerald-500 text-emerald-400" : "bg-zinc-950 border-zinc-800 text-zinc-500"
                          }`}>
                            1
                          </div>
                          <span className="text-[9px] text-zinc-500 mt-1 uppercase font-bold">Transit</span>
                        </div>

                        {/* Step 2 */}
                        <div className="flex flex-col items-center">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center font-bold z-10 ${
                            step >= 2 ? "bg-emerald-500/20 border-emerald-500 text-emerald-400" : "bg-zinc-950 border-zinc-800 text-zinc-500"
                          }`}>
                            2
                          </div>
                          <span className="text-[9px] text-zinc-500 mt-1 uppercase font-bold">Customs</span>
                        </div>

                        {/* Step 3 */}
                        <div className="flex flex-col items-center">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center font-bold z-10 ${
                            step >= 3 ? "bg-emerald-500/20 border-emerald-500 text-emerald-400" : "bg-zinc-950 border-zinc-800 text-zinc-500"
                          }`}>
                            3
                          </div>
                          <span className="text-[9px] text-zinc-500 mt-1 uppercase font-bold">Delivered</span>
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
