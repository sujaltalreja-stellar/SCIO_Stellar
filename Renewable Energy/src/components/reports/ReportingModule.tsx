import React, { useState } from "react";
import { useQuery } from "../../lib/convex";
import { api } from "../../lib/convex";
import {
  FileText,
  Calendar,
  Download,
  Activity,
  Layers,
  Table,
  Check,
  RefreshCw,
  Search,
  Wrench,
  Users,
  CheckSquare
} from "lucide-react";

export default function ReportingModule() {
  const [plantId, setPlantId] = useState("all");
  const [reportType, setReportType] = useState<"production" | "health" | "alarms" | "inspections" | "workorders" | "technicians">("production");
  
  // Date states (default to past 30 days)
  const [startDateStr, setStartDateStr] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split("T")[0];
  });
  const [endDateStr, setEndDateStr] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });

  // Simulated export loading state
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  // Queries
  const plants = useQuery(api.plants.list) ?? [];
  const allWorkOrders = useQuery(api.workOrders.list) ?? [];
  const allInspections = useQuery(api.inspections.list) ?? [];
  const allTechs = useQuery(api.workOrders.getTechnicians) ?? [];
  
  const startMs = new Date(startDateStr).getTime();
  const endMs = new Date(endDateStr).getTime() + 24 * 3600 * 1000 - 1; // end of day

  // Core stats query
  const reportData = useQuery(api.reports.generate, {
    plantId: plantId === "all" ? undefined : (plantId as any),
    startDate: startMs,
    endDate: endMs,
    reportType: reportType === "inspections" || reportType === "workorders" || reportType === "technicians" ? "production" : reportType,
  }) ?? [];

  // Clientside computation for the EAM-focused reports
  const getCompiledInspections = () => {
    return allInspections.filter((ins: any) => {
      const dateMs = new Date(ins.scheduledDate).getTime();
      const inDate = dateMs >= startMs && dateMs <= endMs;
      const inPlant = plantId === "all" || ins.plantId === plantId;
      return inDate && inPlant;
    });
  };

  const getCompiledWorkOrders = () => {
    const wos = allWorkOrders.filter((wo: any) => {
      const dateMs = new Date(wo.scheduledDate).getTime();
      const inDate = dateMs >= startMs && dateMs <= endMs;
      const inPlant = plantId === "all" || wo.plantId === plantId;
      return inDate && inPlant;
    });

    // Group by plant to show aggregate costs and downtimes
    const plantsMap: Record<string, {
      plantName: string;
      plantType: string;
      totalWOs: number;
      completedWOs: number;
      totalLaborCost: number;
      totalMaterialCost: number;
      totalDowntime: number;
    }> = {};

    wos.forEach((wo: any) => {
      if (!plantsMap[wo.plantId]) {
        plantsMap[wo.plantId] = {
          plantName: wo.plantName,
          plantType: wo.plantType,
          totalWOs: 0,
          completedWOs: 0,
          totalLaborCost: 0,
          totalMaterialCost: 0,
          totalDowntime: 0
        };
      }
      const map = plantsMap[wo.plantId];
      map.totalWOs++;
      if (wo.status === "completed" || wo.status === "closed") {
        map.completedWOs++;
        map.totalLaborCost += wo.laborCost ?? 0;
        map.totalMaterialCost += wo.materialsCost ?? 0;
        map.totalDowntime += wo.downtimeHours ?? 0;
      }
    });

    return Object.values(plantsMap);
  };

  const getCompiledTechnicians = () => {
    const wos = allWorkOrders.filter((wo: any) => {
      const dateMs = new Date(wo.scheduledDate).getTime();
      return dateMs >= startMs && dateMs <= endMs;
    });

    return allTechs.map((tech: any) => {
      const techWOs = wos.filter((w: any) => w.assignedTechnician === tech.name);
      const completed = techWOs.filter((w: any) => w.status === "completed" || w.status === "closed");
      const totalLaborCost = completed.reduce((sum: number, w: any) => sum + (w.laborCost ?? 0), 0);
      const estHours = completed.reduce((sum: number, w: any) => sum + w.estimatedHours, 0);
      const actHours = completed.reduce((sum: number, w: any) => sum + (w.actualHours ?? 0), 0);

      return {
        name: tech.name,
        assignedCount: techWOs.length,
        completedCount: completed.length,
        totalLaborCost,
        estimatedHours: estHours,
        actualHours: actHours,
        efficiencyDelta: estHours > 0 ? ((estHours - actHours) / estHours) * 100 : 0
      };
    });
  };

  const getActiveReportData = () => {
    if (reportType === "inspections") return getCompiledInspections();
    if (reportType === "workorders") return getCompiledWorkOrders();
    if (reportType === "technicians") return getCompiledTechnicians();
    return reportData;
  };

  const activeData = getActiveReportData();

  // CSV Exporter Logic supporting all 6 report configurations
  const handleExportCSV = () => {
    if (activeData.length === 0) return;

    setIsExporting(true);
    setExportSuccess(false);

    setTimeout(() => {
      let headers: string[] = [];
      let rows: string[][] = [];

      if (reportType === "production") {
        headers = ["Plant Name", "Plant Type", "Capacity (MW)", "Total Generation (MWh)", "Peak Output (MW)", "Avg Efficiency (%)", "Capacity Factor (%)", "CO2 Avoided (Tonnes)"];
        rows = activeData.map((r: any) => [
          r.plantName, r.plantType, r.capacity.toString(), r.totalProductionMWh.toString(), r.peakGenerationMW.toString(), r.averageEfficiency.toString(), r.capacityFactor.toString(), r.co2OffsetTonnes.toString()
        ]);
      } else if (reportType === "health") {
        headers = ["Plant Name", "Plant Type", "Capacity (MW)", "Avg Health Score (%)", "Total Assets", "Offline Assets", "Downtime (%)"];
        rows = activeData.map((r: any) => [
          r.plantName, r.plantType, r.capacity.toString(), r.averageHealthScore.toString(), r.totalAssets.toString(), r.offlineAssetsCount.toString(), r.downtimePercentage.toString()
        ]);
      } else if (reportType === "alarms") {
        headers = ["Plant Name", "Plant Type", "Total Alarms", "Critical Alarms", "High Alarms", "Active Alarms", "Resolved Alarms"];
        rows = activeData.map((r: any) => [
          r.plantName, r.plantType, r.totalAlarms.toString(), r.criticalCount.toString(), r.highCount.toString(), r.activeCount.toString(), r.resolvedCount.toString()
        ]);
      } else if (reportType === "inspections") {
        headers = ["Date", "Plant Location", "Asset Name", "Inspector", "Checklist Status", "Findings Summary"];
        rows = activeData.map((r: any) => [
          r.scheduledDate, r.plantName, r.assetName, r.inspector, r.status.toUpperCase(), r.findings ?? "None"
        ]);
      } else if (reportType === "workorders") {
        headers = ["Plant Name", "Plant Type", "Total Dispatches", "Completed WO", "Labor Costs ($)", "Material Costs ($)", "Total Downtime (Hrs)"];
        rows = activeData.map((r: any) => [
          r.plantName, r.plantType, r.totalWOs.toString(), r.completedWOs.toString(), r.totalLaborCost.toFixed(2), r.totalMaterialCost.toFixed(2), r.totalDowntime.toFixed(1)
        ]);
      } else if (reportType === "technicians") {
        headers = ["Technician", "Assigned WO", "Completed WO", "Total Labor Cost ($)", "Estimated Hours", "Actual Hours", "Productivity Margin (%)"];
        rows = activeData.map((r: any) => [
          r.name, r.assignedCount.toString(), r.completedCount.toString(), r.totalLaborCost.toFixed(2), r.estimatedHours.toFixed(1), r.actualHours.toFixed(1), r.efficiencyDelta.toFixed(1)
        ]);
      }

      const csvContent = "data:text/csv;charset=utf-8," 
        + [headers.join(","), ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(","))].join("\n");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `Aetheris_Energy_Report_${reportType}_${startDateStr}_to_${endDateStr}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setIsExporting(false);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-zinc-900 pb-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Analytics & Reports Compiler <span className="text-xs font-mono font-medium px-2 py-0.5 rounded border border-zinc-700 text-zinc-400 bg-slate-800/35">EAM Exports</span>
          </h2>
          <p className="text-xs text-zinc-500 font-mono">PORTFOLIO DATA COMPILATION AND BULK EXPORTS</p>
        </div>
      </div>

      {/* Filters Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 bg-zinc-950/40 border border-zinc-900 p-4 rounded-xl text-xs">
        {/* Plant Selection */}
        <div className="flex flex-col space-y-1">
          <span className="text-[10px] text-zinc-500 font-mono uppercase">Operating Site:</span>
          <select
            value={plantId}
            onChange={(e) => setPlantId(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 text-zinc-300 p-2 rounded-lg focus:outline-none"
          >
            <option value="all">All Sites (Aggregate)</option>
            {plants.map((p: any) => (
              <option key={p._id} value={p._id}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* Report Type */}
        <div className="flex flex-col space-y-1">
          <span className="text-[10px] text-zinc-500 font-mono uppercase">Report Configuration:</span>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value as any)}
            className="bg-zinc-900 border border-zinc-800 text-zinc-300 p-2 rounded-lg focus:outline-none"
          >
            <option value="production">Generation Production</option>
            <option value="health">Equipment Availability / Health</option>
            <option value="alarms">Active Telemetry Alarms</option>
            <option value="inspections">Inspection Compliance Logs</option>
            <option value="workorders">Work Order Summary</option>
            <option value="technicians">Technician Productivity</option>
          </select>
        </div>

        {/* Start Date */}
        <div className="flex flex-col space-y-1">
          <span className="text-[10px] text-zinc-500 font-mono uppercase">Start Range:</span>
          <input
            type="date"
            value={startDateStr}
            onChange={(e) => setStartDateStr(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 text-zinc-300 p-2 rounded-lg focus:outline-none"
          />
        </div>

        {/* End Date */}
        <div className="flex flex-col space-y-1">
          <span className="text-[10px] text-zinc-500 font-mono uppercase">End Range:</span>
          <input
            type="date"
            value={endDateStr}
            onChange={(e) => setEndDateStr(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 text-zinc-300 p-2 rounded-lg focus:outline-none"
          />
        </div>

        {/* Export Button */}
        <div className="flex items-end">
          <button
            onClick={handleExportCSV}
            disabled={activeData.length === 0 || isExporting}
            className={`w-full py-2 rounded-lg border text-[10px] uppercase font-bold tracking-widest font-mono flex items-center justify-center gap-2 transition-all ${
              isExporting
                ? "bg-zinc-900 border-zinc-800 text-zinc-500 cursor-not-allowed"
                : exportSuccess
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold"
                : "bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20 hover:border-emerald-500/40 text-emerald-400"
            }`}
          >
            {isExporting ? (
              <><RefreshCw className="h-3.5 w-3.5 animate-spin" /> Exporting...</>
            ) : exportSuccess ? (
              <><Check className="h-3.5 w-3.5" /> Compiled</>
            ) : (
              <><Download className="h-3.5 w-3.5" /> Compile & Download CSV</>
            )}
          </button>
        </div>
      </div>

      {/* Compiled Report Data Table */}
      <div className="glass-panel rounded-xl overflow-hidden border border-zinc-900">
        <div className="border-b border-zinc-900 bg-zinc-950/60 p-4 flex items-center justify-between">
          <h3 className="text-xs font-semibold tracking-wide font-mono flex items-center gap-2">
            <Table className="h-4.5 w-4.5 text-zinc-500" /> Compiled Analytics Spreadsheet
          </h3>
          <span className="text-[9px] font-mono text-zinc-500 uppercase">
            {activeData.length} records filtered
          </span>
        </div>

        <div className="overflow-x-auto">
          {/* PRODUCTION REPORT */}
          {reportType === "production" && (
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-zinc-900 text-zinc-500">
                  <th className="font-semibold p-4">PLANT NAME</th>
                  <th className="font-semibold p-4">TYPE</th>
                  <th className="font-semibold p-4 text-right">CAPACITY</th>
                  <th className="font-semibold p-4 text-right">TOTAL ENERGY (MWh)</th>
                  <th className="font-semibold p-4 text-right">PEAK POWER (MW)</th>
                  <th className="font-semibold p-4 text-right">AVG EFFICIENCY</th>
                  <th className="font-semibold p-4 text-right">CAPACITY FACTOR</th>
                  <th className="font-semibold p-4 text-right">CO2 SAVED (TONNES)</th>
                </tr>
              </thead>
              <tbody>
                {activeData.map((r: any) => (
                  <tr key={r.plantId} className="hover:bg-zinc-900/25 border-b border-zinc-900/40">
                    <td className="p-4 font-bold text-zinc-200">{r.plantName}</td>
                    <td className="p-4 uppercase text-[10px] text-zinc-400">{r.plantType}</td>
                    <td className="p-4 text-right">{r.capacity} MW</td>
                    <td className="p-4 text-right text-emerald-400 font-bold">{r.totalProductionMWh.toLocaleString()}</td>
                    <td className="p-4 text-right">{r.peakGenerationMW} MW</td>
                    <td className="p-4 text-right">{r.averageEfficiency}%</td>
                    <td className="p-4 text-right text-sky-400 font-bold">{r.capacityFactor}%</td>
                    <td className="p-4 text-right text-zinc-400">{r.co2OffsetTonnes.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* HEALTH REPORT */}
          {reportType === "health" && (
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-zinc-900 text-zinc-500">
                  <th className="font-semibold p-4">PLANT NAME</th>
                  <th className="font-semibold p-4">TYPE</th>
                  <th className="font-semibold p-4 text-right">CAPACITY</th>
                  <th className="font-semibold p-4 text-right">AVG HEALTH INDEX</th>
                  <th className="font-semibold p-4 text-right">TOTAL ASSETS</th>
                  <th className="font-semibold p-4 text-right">OFFLINE ASSETS</th>
                  <th className="font-semibold p-4 text-right">DOWNTIME RATIO</th>
                </tr>
              </thead>
              <tbody>
                {activeData.map((r: any) => (
                  <tr key={r.plantId} className="hover:bg-zinc-900/25 border-b border-zinc-900/40">
                    <td className="p-4 font-bold text-zinc-200">{r.plantName}</td>
                    <td className="p-4 uppercase text-[10px] text-zinc-400">{r.plantType}</td>
                    <td className="p-4 text-right">{r.capacity} MW</td>
                    <td className={`p-4 text-right font-bold ${
                      r.averageHealthScore > 90 ? "text-emerald-400" : r.averageHealthScore > 85 ? "text-yellow-400" : "text-red-400"
                    }`}>{r.averageHealthScore.toFixed(1)}%</td>
                    <td className="p-4 text-right text-zinc-300">{r.totalAssets}</td>
                    <td className="p-4 text-right text-zinc-400">{r.offlineAssetsCount}</td>
                    <td className="p-4 text-right text-amber-500">{r.downtimePercentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* ALARMS REPORT */}
          {reportType === "alarms" && (
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-zinc-900 text-zinc-500">
                  <th className="font-semibold p-4">PLANT NAME</th>
                  <th className="font-semibold p-4">TYPE</th>
                  <th className="font-semibold p-4 text-right">TOTAL ALARMS</th>
                  <th className="font-semibold p-4 text-right">CRITICAL ALARMS</th>
                  <th className="font-semibold p-4 text-right">HIGH SEVERITY</th>
                  <th className="font-semibold p-4 text-right">ACTIVE CODES</th>
                  <th className="font-semibold p-4 text-right">RESOLVED</th>
                </tr>
              </thead>
              <tbody>
                {activeData.map((r: any) => (
                  <tr key={r.plantId} className="hover:bg-zinc-900/25 border-b border-zinc-900/40">
                    <td className="p-4 font-bold text-zinc-200">{r.plantName}</td>
                    <td className="p-4 uppercase text-[10px] text-zinc-400">{r.plantType}</td>
                    <td className="p-4 text-right text-zinc-300">{r.totalAlarms}</td>
                    <td className="p-4 text-right text-red-400 font-bold">{r.criticalCount}</td>
                    <td className="p-4 text-right text-orange-400">{r.highCount}</td>
                    <td className="p-4 text-right text-yellow-400 font-bold">{r.activeCount}</td>
                    <td className="p-4 text-right text-emerald-400">{r.resolvedCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* INSPECTIONS COMPLIANCE */}
          {reportType === "inspections" && (
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-zinc-900 text-zinc-500">
                  <th className="font-semibold p-4">SCHEDULED DATE</th>
                  <th className="font-semibold p-4">OPERATING SITE</th>
                  <th className="font-semibold p-4">EQUIPMENT ASSET</th>
                  <th className="font-semibold p-4">INSPECTOR</th>
                  <th className="font-semibold p-4">STATUS</th>
                  <th className="font-semibold p-4">OBSERVATIONS & FINDINGS</th>
                </tr>
              </thead>
              <tbody>
                {activeData.map((r: any) => (
                  <tr key={r._id} className="hover:bg-zinc-900/25 border-b border-zinc-900/40">
                    <td className="p-4 text-zinc-400 font-mono">{r.scheduledDate}</td>
                    <td className="p-4 font-bold text-zinc-200">{r.plantName}</td>
                    <td className="p-4 text-zinc-300">{r.assetName}</td>
                    <td className="p-4 text-zinc-400">{r.inspector}</td>
                    <td className="p-4">
                      <span className={`text-[9px] font-mono px-2 py-0.5 rounded border uppercase ${
                        r.status === "completed" ? "bg-emerald-500/5 text-emerald-400 border-emerald-500/20" : "bg-amber-500/5 text-amber-400 border-amber-500/20"
                      }`}>{r.status}</span>
                    </td>
                    <td className="p-4 text-zinc-400 max-w-sm truncate">{r.findings ?? "Awaiting Checklist"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* WORK ORDERS */}
          {reportType === "workorders" && (
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-zinc-900 text-zinc-500">
                  <th className="font-semibold p-4">PLANT NAME</th>
                  <th className="font-semibold p-4">TYPE</th>
                  <th className="font-semibold p-4 text-right">TOTAL JOBS</th>
                  <th className="font-semibold p-4 text-right">COMPLETED WO</th>
                  <th className="font-semibold p-4 text-right">LABOR COST</th>
                  <th className="font-semibold p-4 text-right">SPARE PARTS COST</th>
                  <th className="font-semibold p-4 text-right">ACCUMULATED DOWNTIME</th>
                </tr>
              </thead>
              <tbody>
                {activeData.map((r: any, idx: number) => (
                  <tr key={idx} className="hover:bg-zinc-900/25 border-b border-zinc-900/40">
                    <td className="p-4 font-bold text-zinc-200">{r.plantName}</td>
                    <td className="p-4 uppercase text-[10px] text-zinc-400">{r.plantType}</td>
                    <td className="p-4 text-right text-zinc-300">{r.totalWOs}</td>
                    <td className="p-4 text-right text-emerald-400 font-bold">{r.completedWOs}</td>
                    <td className="p-4 text-right font-bold text-slate-300">${r.totalLaborCost.toFixed(2)}</td>
                    <td className="p-4 text-right font-bold text-slate-300">${r.totalMaterialCost.toFixed(2)}</td>
                    <td className="p-4 text-right font-bold text-amber-500">{r.totalDowntime.toFixed(1)} Hrs</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* TECHNICIANS */}
          {reportType === "technicians" && (
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-zinc-900 text-zinc-500">
                  <th className="font-semibold p-4">TECHNICIAN</th>
                  <th className="font-semibold p-4 text-right">ASSIGNED WOs</th>
                  <th className="font-semibold p-4 text-right">COMPLETED WOs</th>
                  <th className="font-semibold p-4 text-right">TOTAL LABOR GENERATED</th>
                  <th className="font-semibold p-4 text-right">ESTIMATED HOURS</th>
                  <th className="font-semibold p-4 text-right">ACTUAL LABORED HOURS</th>
                  <th className="font-semibold p-4 text-right">PRODUCTIVITY VARIATION</th>
                </tr>
              </thead>
              <tbody>
                {activeData.map((r: any, idx: number) => (
                  <tr key={idx} className="hover:bg-zinc-900/25 border-b border-zinc-900/40">
                    <td className="p-4 font-bold text-zinc-200">{r.name}</td>
                    <td className="p-4 text-right text-zinc-300">{r.assignedCount}</td>
                    <td className="p-4 text-right text-emerald-400 font-bold">{r.completedCount}</td>
                    <td className="p-4 text-right text-slate-200">${r.totalLaborCost.toFixed(2)}</td>
                    <td className="p-4 text-right text-slate-300">{r.estimatedHours.toFixed(1)} hrs</td>
                    <td className="p-4 text-right text-slate-300">{r.actualHours.toFixed(1)} hrs</td>
                    <td className={`p-4 text-right font-bold ${
                      r.efficiencyDelta >= 0 ? "text-emerald-400" : "text-red-400"
                    }`}>
                      {r.efficiencyDelta >= 0 ? "+" : ""}{r.efficiencyDelta.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeData.length === 0 && (
            <div className="text-center py-16 text-zinc-500">
              No report rows generated for the selected parameters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
