"use client";

import React, { useState } from "react";
import {
  Package,
  Boxes,
  Truck,
  AlertTriangle,
  Search,
  CheckCircle2,
  Layers,
  Sparkles,
  ArrowRight,
  TrendingDown,
  Building2,
  FileSpreadsheet
} from "lucide-react";

interface MaterialItem {
  id: string;
  sku: string;
  name: string;
  category: "Raw Material" | "WIP" | "Finished Goods" | "MRO Spare";
  currentStock: number;
  minThreshold: number;
  unit: string;
  locationBin: string;
  supplier: string;
  leadTimeDays: number;
  shortageRisk: "Low" | "Moderate" | "Critical";
  status: "In Stock" | "Reorder Required" | "PO Placed";
}

interface BOMItem {
  id: string;
  partNumber: string;
  name: string;
  qtyPerUnit: number;
  unit: string;
  stockAvailable: number;
  supplier: string;
}

const MATERIAL_INVENTORY: MaterialItem[] = [
  {
    id: "mat-01",
    sku: "RM-TI-6401",
    name: "Aerospace Titanium Ti-6Al-4V Billet Ø150mm",
    category: "Raw Material",
    currentStock: 145,
    minThreshold: 100,
    unit: "Billets",
    locationBin: "Rack A-04-B",
    supplier: "Timet Aerospace Corp",
    leadTimeDays: 18,
    shortageRisk: "Moderate",
    status: "In Stock",
  },
  {
    id: "mat-02",
    sku: "RM-LI-800V",
    name: "Lithium Nickel Cobalt Aluminum (NCA) 21700 Cells",
    category: "Raw Material",
    currentStock: 18400,
    minThreshold: 20000,
    unit: "Cells",
    locationBin: "Vault C-01-A",
    supplier: "Panasonic Energy",
    leadTimeDays: 24,
    shortageRisk: "Critical",
    status: "Reorder Required",
  },
  {
    id: "mat-03",
    sku: "WIP-MOD-800",
    name: "Welded 800V Sub-Module Core Assembly",
    category: "WIP",
    currentStock: 320,
    minThreshold: 150,
    unit: "Units",
    locationBin: "Buffer Line A1-OUT",
    supplier: "Internal Shopfloor",
    leadTimeDays: 1,
    shortageRisk: "Low",
    status: "In Stock",
  },
  {
    id: "mat-04",
    sku: "FG-IMP-488",
    name: "Finished Ti Turbine Impeller Blisk",
    category: "Finished Goods",
    currentStock: 85,
    minThreshold: 50,
    unit: "Units",
    locationBin: "Warehouse Bay F-08",
    supplier: "Internal Final QA",
    leadTimeDays: 0,
    shortageRisk: "Low",
    status: "In Stock",
  },
  {
    id: "mat-05",
    sku: "MRO-END-12",
    name: "Solid Carbide End Mill Ø12mm (AlCrN Coated)",
    category: "MRO Spare",
    currentStock: 14,
    minThreshold: 20,
    unit: "Tools",
    locationBin: "Tool Crib 02",
    supplier: "Sandvik Coromant",
    leadTimeDays: 5,
    shortageRisk: "Moderate",
    status: "PO Placed",
  },
];

const BOM_EXPLORER: BOMItem[] = [
  { id: "b-01", partNumber: "CEL-21700", name: "21700 Cylindrical Li-Ion Battery Cell", qtyPerUnit: 192, unit: "pcs", stockAvailable: 18400, supplier: "Panasonic" },
  { id: "b-02", partNumber: "BUS-CU-04", name: "Laser-Welded Copper Busbar Plate", qtyPerUnit: 16, unit: "pcs", stockAvailable: 1420, supplier: "Wieland Metals" },
  { id: "b-03", partNumber: "BMS-PCB-08", name: "Integrated Cell Supervisory Circuit PCB", qtyPerUnit: 1, unit: "pcs", stockAvailable: 450, supplier: "In-House SMT" },
  { id: "b-04", partNumber: "ENC-AL-6061", name: "Extruded Aluminum 6061 Housing & Coolant Jacket", qtyPerUnit: 1, unit: "pcs", stockAvailable: 290, supplier: "Alcoa Extrusions" },
];

export function MaterialsSupplyChainModule() {
  const [materials] = useState<MaterialItem[]>(MATERIAL_INVENTORY);
  const [searchFilter, setSearchFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");

  const filteredMaterials = materials.filter(m => {
    const matchesCategory = categoryFilter === "All" || m.category === categoryFilter;
    const matchesSearch = m.name.toLowerCase().includes(searchFilter.toLowerCase()) || m.sku.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* ==================== 1. HEADER BANNER ==================== */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-panel p-6 shadow-2xs">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-mono">
              <Package className="h-4 w-4" /> Materials, Inventory &amp; Supply Chain Engine
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
              Procure ➔ Receive ➔ Store ➔ Consume ➔ Produce ➔ Ship
            </h1>
            <p className="mt-1 text-sm text-slate-700 dark:text-slate-300 font-medium">
              Multi-tier inventory visibility (Raw, WIP, Finished Goods), Bill of Materials (BOM) explosion, and predictive material shortage AI.
            </p>
          </div>
        </div>
      </section>

      {/* ==================== 2. KPI METRICS STRIP ==================== */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 dark:border-borderMuted bg-white dark:bg-panel p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-bold uppercase text-slate-700 dark:text-slate-400 font-mono">
            <span>Total Inventory Value</span>
            <Boxes className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-950 dark:text-white">$1,482,900</div>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 font-medium">Across 4 Warehouse Locations &amp; Buffer Cribs</p>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-borderMuted bg-white dark:bg-panel p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-bold uppercase text-slate-700 dark:text-slate-400 font-mono">
            <span>Shortage Risk Items</span>
            <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-rose-700 dark:text-rose-400">1 Item Critical</div>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 font-medium">21700 NCA Cells below 20k buffer</p>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-borderMuted bg-white dark:bg-panel p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-bold uppercase text-slate-700 dark:text-slate-400 font-mono">
            <span>Supplier On-Time SLA</span>
            <Truck className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-950 dark:text-white">98.4%</div>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 font-medium">18 of 19 POs delivered on schedule</p>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-borderMuted bg-white dark:bg-panel p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-bold uppercase text-slate-700 dark:text-slate-400 font-mono">
            <span>WIP Buffer Inventory</span>
            <Layers className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-950 dark:text-white">320 Units</div>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 font-medium">Optimal buffer for 1.4 shifts</p>
        </div>
      </section>

      {/* ==================== 3. INVENTORY TABLE & BOM EXPLORER ==================== */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Left: Inventory Table */}
        <div className="xl:col-span-2 rounded-xl border border-slate-200 dark:border-borderMuted bg-white dark:bg-panel p-5 shadow-2xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-borderMuted pb-3">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider font-mono text-slate-950 dark:text-white flex items-center gap-2">
                <Boxes className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Plant Material &amp; Parts Inventory
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">Raw materials, WIP sub-assemblies, and MRO tooling</p>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
              {["All", "Raw Material", "WIP", "Finished Goods", "MRO Spare"].map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2.5 py-1 text-xs font-mono font-bold rounded transition-all ${
                    categoryFilter === cat
                      ? "bg-white dark:bg-slate-700 text-slate-950 dark:text-white shadow-2xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase text-[10px]">
                  <th className="pb-2">SKU &amp; Part Name</th>
                  <th className="pb-2">Category</th>
                  <th className="pb-2">Stock Level</th>
                  <th className="pb-2">Location Bin</th>
                  <th className="pb-2">Shortage Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredMaterials.map(m => (
                  <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 pr-2">
                      <strong className="text-slate-950 dark:text-white block">{m.name}</strong>
                      <span className="text-slate-500 text-[10px]">{m.sku} • {m.supplier}</span>
                    </td>
                    <td className="py-3 text-slate-700 dark:text-slate-300 font-bold">{m.category}</td>
                    <td className="py-3">
                      <span className="font-bold text-slate-950 dark:text-white">{m.currentStock.toLocaleString()} {m.unit}</span>
                      <span className="text-slate-500 block text-[10px]">Min: {m.minThreshold.toLocaleString()}</span>
                    </td>
                    <td className="py-3 text-slate-600 dark:text-slate-400">{m.locationBin}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                        m.shortageRisk === "Critical"
                          ? "bg-rose-100 text-rose-950 border-rose-300 dark:bg-rose-950 dark:text-rose-300"
                          : m.shortageRisk === "Moderate"
                          ? "bg-amber-100 text-amber-950 border-amber-300 dark:bg-amber-950 dark:text-amber-300"
                          : "bg-emerald-100 text-emerald-950 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300"
                      }`}>
                        {m.shortageRisk}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: BOM Explorer */}
        <div className="rounded-xl border border-slate-200 dark:border-borderMuted bg-white dark:bg-panel p-5 shadow-2xs space-y-4">
          <div className="border-b border-slate-200 dark:border-borderMuted pb-3">
            <span className="text-[10px] font-mono font-bold uppercase text-emerald-700 dark:text-emerald-400">Bill of Materials (BOM)</span>
            <h3 className="font-bold text-slate-950 dark:text-white text-sm mt-0.5">Lithium-Ion 800V Module B2</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">Part # BOM-EV-800V-REV4</p>
          </div>

          <div className="space-y-2.5 font-mono text-xs">
            {BOM_EXPLORER.map(item => (
              <div
                key={item.id}
                className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 space-y-1"
              >
                <div className="flex justify-between items-start">
                  <strong className="text-slate-950 dark:text-white text-[11px]">{item.name}</strong>
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold">{item.qtyPerUnit} {item.unit}/unit</span>
                </div>
                <div className="flex justify-between text-slate-500 text-[10.5px]">
                  <span>{item.partNumber} • {item.supplier}</span>
                  <span className="text-slate-950 dark:text-slate-300 font-bold">{item.stockAvailable.toLocaleString()} in stock</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg text-xs font-mono space-y-1">
            <span className="text-amber-950 dark:text-amber-300 font-bold flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-600" /> AI Supply Chain Recommendation:
            </span>
            <p className="text-slate-700 dark:text-slate-300 text-[11px]">
              Cell buffer on 21700 NCA will reach threshold in 3.2 days. Trigger PO-4902 to Panasonic for 40,000 units to avoid line stoppage.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
