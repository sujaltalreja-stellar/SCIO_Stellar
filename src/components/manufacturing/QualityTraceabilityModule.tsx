"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Scan,
  AlertTriangle,
  FileText,
  Search,
  CheckCircle2,
  XCircle,
  GitBranch,
  Layers,
  ArrowRight,
  TrendingDown,
  Activity,
  Sparkles,
  ChevronRight,
  Eye
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from "recharts";

interface DefectRecord {
  id: string;
  ncrNumber: string;
  partName: string;
  lotNumber: string;
  line: string;
  defectType: string;
  severity: "Critical" | "Major" | "Minor";
  status: "Under Investigation" | "CAPA Opened" | "Reworked" | "Scrapped" | "Resolved";
  detectedBy: string;
  timestamp: string;
  rootCause: string;
  capaAction: string;
}

const DEFECT_RECORDS: DefectRecord[] = [
  {
    id: "ncr-01",
    ncrNumber: "NCR-2026-084",
    partName: "Turbine Impeller Ti-6Al-4V",
    lotNumber: "LOT-2026-A488",
    line: "Line B2 (5-Axis CNC)",
    defectType: "Surface Micro-Crack (>15µm)",
    severity: "Critical",
    status: "CAPA Opened",
    detectedBy: "High-Speed AOI Camera #04",
    timestamp: "12:04:18",
    rootCause: "Tool chatter & thermal spike on End Mill Ø12mm at cycle #780",
    capaAction: "Automatic retooling at 750 cycles + coolant flow increased by 15%",
  },
  {
    id: "ncr-02",
    ncrNumber: "NCR-2026-085",
    partName: "Inverter Power Control PCB v3",
    lotNumber: "LOT-2026-C102",
    line: "Line C3 (SMT Assembly)",
    defectType: "Solder Bridging Pin 14-15",
    severity: "Major",
    status: "Reworked",
    detectedBy: "3D Solder Paste Inspection (SPI)",
    timestamp: "11:52:05",
    rootCause: "Stencil aperture paste residue buildup",
    capaAction: "Automated ultrasonic stencil wipe frequency reduced from 20 to 10 boards",
  },
  {
    id: "ncr-03",
    ncrNumber: "NCR-2026-086",
    partName: "Lithium-Ion 800V Module B2",
    lotNumber: "LOT-2026-B904",
    line: "Line A1 (Laser Welding)",
    defectType: "Weld Seam Porosity",
    severity: "Minor",
    status: "Under Investigation",
    detectedBy: "In-line Laser Seam Pyrometer",
    timestamp: "11:28:44",
    rootCause: "Shielding argon gas pressure fluctuation (1.8 bar vs 2.2 bar nominal)",
    capaAction: "Mass flow controller calibrated; secondary ultrasonic audit completed",
  },
  {
    id: "ncr-04",
    ncrNumber: "NCR-2026-087",
    partName: "Finished Pack Enclosure",
    lotNumber: "LOT-2026-D312",
    line: "Line D4 (Vision QA)",
    defectType: "Gasket Seal Misalignment",
    severity: "Minor",
    status: "Resolved",
    detectedBy: "KUKA Vision Robot",
    timestamp: "10:15:20",
    rootCause: "Pneumatic gripper pressure drop during pickup",
    capaAction: "Gripper suction cups replaced and vacuum sensor threshold tightened",
  },
];

// SPC (Statistical Process Control) X-Bar Chart Data for Critical Dimensions (Tolerance 45.00 ± 0.05 mm)
const SPC_DATA = [
  { sample: "S-1", dimension: 45.002, ucl: 45.045, lcl: 44.955, target: 45.000 },
  { sample: "S-2", dimension: 45.012, ucl: 45.045, lcl: 44.955, target: 45.000 },
  { sample: "S-3", dimension: 44.995, ucl: 45.045, lcl: 44.955, target: 45.000 },
  { sample: "S-4", dimension: 45.028, ucl: 45.045, lcl: 44.955, target: 45.000 },
  { sample: "S-5", dimension: 45.035, ucl: 45.045, lcl: 44.955, target: 45.000 },
  { sample: "S-6", dimension: 45.018, ucl: 45.045, lcl: 44.955, target: 45.000 },
  { sample: "S-7", dimension: 44.988, ucl: 45.045, lcl: 44.955, target: 45.000 },
  { sample: "S-8", dimension: 45.022, ucl: 45.045, lcl: 44.955, target: 45.000 },
  { sample: "S-9", dimension: 45.005, ucl: 45.045, lcl: 44.955, target: 45.000 },
  { sample: "S-10", dimension: 45.015, ucl: 45.045, lcl: 44.955, target: 45.000 },
];

export function QualityTraceabilityModule() {
  const [defects] = useState<DefectRecord[]>(DEFECT_RECORDS);
  const [selectedDefect, setSelectedDefect] = useState<DefectRecord>(DEFECT_RECORDS[0]);
  const [searchLot, setSearchLot] = useState("LOT-2026-A488");
  const [activeTab, setActiveTab] = useState<"defects" | "spc" | "genealogy">("defects");

  return (
    <div className="space-y-6">
      {/* ==================== 1. HEADER BANNER ==================== */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-panel p-6 shadow-2xs">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-700 dark:text-cyan-400 font-mono">
              <ShieldCheck className="h-4 w-4" /> Quality &amp; Traceability Engine
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
              Inspect ➔ Detect ➔ Investigate ➔ Correct ➔ Trace
            </h1>
            <p className="mt-1 text-sm text-slate-700 dark:text-slate-300 font-medium">
              High-speed AI optical defect recognition, ISO/IATF Non-Conformance reporting, 8D CAPA workflows, and end-to-end lot genealogy.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setActiveTab("defects")}
              className={`px-3 py-1.5 text-xs font-mono font-bold rounded transition-all ${
                activeTab === "defects"
                  ? "bg-white dark:bg-slate-700 text-slate-950 dark:text-white shadow-2xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white"
              }`}
            >
              Defects &amp; NCRs
            </button>
            <button
              onClick={() => setActiveTab("spc")}
              className={`px-3 py-1.5 text-xs font-mono font-bold rounded transition-all ${
                activeTab === "spc"
                  ? "bg-white dark:bg-slate-700 text-slate-950 dark:text-white shadow-2xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white"
              }`}
            >
              SPC Control Charts
            </button>
            <button
              onClick={() => setActiveTab("genealogy")}
              className={`px-3 py-1.5 text-xs font-mono font-bold rounded transition-all ${
                activeTab === "genealogy"
                  ? "bg-white dark:bg-slate-700 text-slate-950 dark:text-white shadow-2xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white"
              }`}
            >
              Lot Genealogy Trace
            </button>
          </div>
        </div>
      </section>

      {/* ==================== 2. QUALITY KPI METRICS STRIP ==================== */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 dark:border-borderMuted bg-white dark:bg-panel p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-bold uppercase text-slate-700 dark:text-slate-400 font-mono">
            <span>First Pass Yield (FPY)</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-950 dark:text-white">99.12%</div>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 font-medium">+0.3% improvement vs last shift</p>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-borderMuted bg-white dark:bg-panel p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-bold uppercase text-slate-700 dark:text-slate-400 font-mono">
            <span>Active NCR Reports</span>
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-950 dark:text-white">
            {defects.filter(d => d.status !== "Resolved").length} Open
          </div>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 font-medium">1 Critical • 1 Major • 1 Minor</p>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-borderMuted bg-white dark:bg-panel p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-bold uppercase text-slate-700 dark:text-slate-400 font-mono">
            <span>Process Capability (Cpk)</span>
            <Activity className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-950 dark:text-white">1.67 Cpk</div>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 font-medium">Six Sigma Process Capability Target &gt; 1.33</p>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-borderMuted bg-white dark:bg-panel p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-bold uppercase text-slate-700 dark:text-slate-400 font-mono">
            <span>Scrap Rate</span>
            <TrendingDown className="h-4 w-4 text-rose-600 dark:text-rose-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-950 dark:text-white">0.72%</div>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 font-medium">Target: Below 1.20% allowable</p>
        </div>
      </section>

      {/* ==================== 3. ACTIVE TAB VIEW ==================== */}
      {activeTab === "defects" && (
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* Left: Active Defect Incident List */}
          <div className="xl:col-span-2 rounded-xl border border-slate-200 dark:border-borderMuted bg-white dark:bg-panel p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-borderMuted pb-3">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider font-mono text-slate-950 dark:text-white flex items-center gap-2">
                  <Scan className="h-4 w-4 text-cyan-600 dark:text-cyan-400" /> Non-Conformance Reports (NCR) &amp; QA Log
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400">Optical camera detections &amp; manual QC inspections</p>
              </div>
            </div>

            <div className="space-y-3">
              {defects.map(d => {
                const isSelected = selectedDefect.id === d.id;
                return (
                  <div
                    key={d.id}
                    onClick={() => setSelectedDefect(d)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? "border-2 border-cyan-600 dark:border-cyan-500 bg-cyan-50/20 dark:bg-cyan-950/20 shadow-sm"
                        : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-950 dark:text-white">{d.ncrNumber}</span>
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase border ${
                            d.severity === "Critical"
                              ? "bg-rose-100 text-rose-950 border-rose-300 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800"
                              : d.severity === "Major"
                              ? "bg-amber-100 text-amber-950 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800"
                              : "bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                          }`}>
                            {d.severity}
                          </span>
                          <span className="text-[10.5px] font-mono text-slate-500">Lot: {d.lotNumber}</span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-950 dark:text-white mt-1">{d.defectType}</h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-mono mt-0.5">
                          {d.partName} • {d.line}
                        </p>
                      </div>

                      <div className="text-right font-mono">
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                          {d.status}
                        </span>
                        <span className="block text-[10.5px] text-slate-500 mt-1">Detected at {d.timestamp}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: 8D CAPA Root Cause Investigation Card */}
          <div className="rounded-xl border border-slate-200 dark:border-borderMuted bg-white dark:bg-panel p-5 shadow-2xs space-y-4">
            <div className="border-b border-slate-200 dark:border-borderMuted pb-3">
              <span className="text-[10px] font-mono font-bold uppercase text-cyan-700 dark:text-cyan-400">8D CAPA Investigation</span>
              <h3 className="font-bold text-slate-950 dark:text-white text-sm mt-0.5">{selectedDefect.ncrNumber}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">{selectedDefect.partName}</p>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-slate-500 font-bold uppercase text-[10px]">Detected By</span>
                <p className="text-slate-950 dark:text-white font-semibold">{selectedDefect.detectedBy}</p>
              </div>

              <div className="p-3 bg-rose-50 dark:bg-rose-950/30 rounded-lg border border-rose-200 dark:border-rose-800/40 space-y-1">
                <span className="text-rose-900 dark:text-rose-300 font-bold uppercase text-[10px]">Root Cause (5-Why Analysis)</span>
                <p className="text-slate-900 dark:text-slate-200">{selectedDefect.rootCause}</p>
              </div>

              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800/40 space-y-1">
                <span className="text-emerald-900 dark:text-emerald-300 font-bold uppercase text-[10px]">Corrective Action (CAPA)</span>
                <p className="text-slate-900 dark:text-slate-200">{selectedDefect.capaAction}</p>
              </div>
            </div>

            <button className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 font-mono text-xs font-bold rounded-lg transition-all shadow-xs">
              Sign-Off &amp; Close CAPA
            </button>
          </div>
        </section>
      )}

      {/* ==================== SPC CONTROL CHART VIEW ==================== */}
      {activeTab === "spc" && (
        <section className="rounded-xl border border-slate-200 dark:border-borderMuted bg-white dark:bg-panel p-5 shadow-2xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-borderMuted pb-3">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-slate-950 dark:text-white">
                Statistical Process Control (SPC) - X-Bar Critical Dimension Chart
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-mono">
                Part: Turbine Impeller Hub Diameter (Target: 45.000 mm • Tolerance: ±0.050 mm)
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-cyan-500"></span> Actual Dimension</span>
              <span className="flex items-center gap-1.5"><span className="h-0.5 w-3 bg-rose-500"></span> UCL / LCL (±0.045)</span>
            </div>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={SPC_DATA} margin={{ top: 15, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
                <XAxis dataKey="sample" fontSize={11} stroke="#64748b" tickLine={false} />
                <YAxis domain={[44.950, 45.050]} fontSize={11} stroke="#64748b" tickLine={false} unit="mm" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", color: "#f8fafc", borderRadius: "8px", fontSize: "11px" }}
                />
                <ReferenceLine y={45.045} stroke="#f43f5e" strokeDasharray="4 4" label={{ value: "UCL (45.045)", fill: "#f43f5e", fontSize: 10 }} />
                <ReferenceLine y={45.000} stroke="#10b981" label={{ value: "Nominal (45.000)", fill: "#10b981", fontSize: 10 }} />
                <ReferenceLine y={44.955} stroke="#f43f5e" strokeDasharray="4 4" label={{ value: "LCL (44.955)", fill: "#f43f5e", fontSize: 10 }} />
                <Line type="monotone" dataKey="dimension" stroke="#06b6d4" strokeWidth={2.5} dot={{ r: 4, fill: "#06b6d4" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {/* ==================== LOT GENEALOGY TRACE VIEW ==================== */}
      {activeTab === "genealogy" && (
        <section className="rounded-xl border border-slate-200 dark:border-borderMuted bg-white dark:bg-panel p-5 shadow-2xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-borderMuted pb-3">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-slate-950 dark:text-white">
                End-to-End Batch &amp; Serial Genealogy Trace
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">Trace raw titanium ingot suppliers ➔ CNC machining ➔ QA inspection ➔ finished customer batch</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchLot}
                  onChange={(e) => setSearchLot(e.target.value)}
                  placeholder="Enter Lot #..."
                  className="pl-8 pr-3 py-1.5 text-xs font-mono bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-950 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Genealogy Timeline Tree */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 space-y-2 font-mono text-xs">
              <div className="flex items-center gap-2 text-slate-500 font-bold uppercase text-[10px]">
                <Layers className="h-3.5 w-3.5 text-amber-500" /> Step 1: Raw Material Ingot
              </div>
              <p className="font-bold text-slate-950 dark:text-white text-sm">Titanium Ti-6Al-4V Billet</p>
              <div className="text-slate-600 dark:text-slate-400 text-[11px] space-y-0.5">
                <p>Supplier: Timet Aerospace Corp</p>
                <p>Heat Lot: #HT-8409-A</p>
                <p>Spectro Chemistry: 99.98% PASS</p>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 space-y-2 font-mono text-xs">
              <div className="flex items-center gap-2 text-slate-500 font-bold uppercase text-[10px]">
                <Activity className="h-3.5 w-3.5 text-cyan-500" /> Step 2: CNC Machining
              </div>
              <p className="font-bold text-slate-950 dark:text-white text-sm">5-Axis Impeller Milling</p>
              <div className="text-slate-600 dark:text-slate-400 text-[11px] space-y-0.5">
                <p>Machine: Hermle C42U (Line B2)</p>
                <p>Operator: Tech #402 (Shift 1)</p>
                <p>Cycle Duration: 178.7s</p>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 space-y-2 font-mono text-xs">
              <div className="flex items-center gap-2 text-slate-500 font-bold uppercase text-[10px]">
                <Scan className="h-3.5 w-3.5 text-rose-500" /> Step 3: Optical QA &amp; NDT
              </div>
              <p className="font-bold text-slate-950 dark:text-white text-sm">AI AOI Defect Inspection</p>
              <div className="text-slate-600 dark:text-slate-400 text-[11px] space-y-0.5">
                <p>Camera: Cognex 24MP #04</p>
                <p>NCR Triggered: NCR-2026-084</p>
                <p>Rework Cleared: Pass (Shift 2)</p>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 space-y-2 font-mono text-xs">
              <div className="flex items-center gap-2 text-slate-500 font-bold uppercase text-[10px]">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Step 4: Dispatch Package
              </div>
              <p className="font-bold text-slate-950 dark:text-white text-sm">Final Packaged Crate</p>
              <div className="text-slate-600 dark:text-slate-400 text-[11px] space-y-0.5">
                <p>Customer: Rolls-Royce Aero</p>
                <p>Shipping Box: #BX-9042</p>
                <p>COC Certificate: Issued (ISO-9001)</p>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
