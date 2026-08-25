import React, { useState } from "react";
import { useQuery, useMutation } from "../lib/convex";
import { api } from "../lib/convex";
import {
  AlertTriangle,
  Layers,
  ShieldAlert,
  Check,
  UserPlus,
  Clock,
  Activity,
  SlidersHorizontal,
  X
} from "lucide-react";

interface AlarmConsoleProps {
  onSelectPlant: (plantId: string) => void;
}

export default function AlarmConsole({ onSelectPlant }: AlarmConsoleProps) {
  const [plantFilter, setPlantFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Interactive assignment modal state
  const [assignAlarmId, setAssignAlarmId] = useState<string | null>(null);
  const [engineerName, setEngineerName] = useState("");
  const [assignActionType, setAssignActionType] = useState<"ack" | "res">("ack");

  // Queries
  const plants = useQuery(api.plants.list) ?? [];
  const alarms = useQuery(api.alarms.list, {
    plantId: plantFilter === "all" ? undefined : (plantFilter as any),
    severity: severityFilter === "all" ? undefined : (severityFilter as any),
    status: statusFilter === "all" ? undefined : (statusFilter as any),
  }) ?? [];

  // Mutations
  const acknowledgeAlarm = useMutation(api.alarms.acknowledge);
  const resolveAlarm = useMutation(api.alarms.resolve);

  const handleActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignAlarmId || !engineerName) return;

    if (assignActionType === "ack") {
      await acknowledgeAlarm({ alarmId: assignAlarmId as any, engineerName });
    } else {
      await resolveAlarm({ alarmId: assignAlarmId as any, engineerName });
    }

    setAssignAlarmId(null);
    setEngineerName("");
  };

  const openActionModal = (alarmId: string, action: "ack" | "res") => {
    setAssignAlarmId(alarmId);
    setAssignActionType(action);
  };

  // Count stats
  const activeCount = alarms.filter((a: any) => a.status === "active").length;
  const ackCount = alarms.filter((a: any) => a.status === "acknowledged").length;
  const criticalCount = alarms.filter((a: any) => a.severity === "critical" && a.status !== "resolved").length;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="border-b border-slate-200 dark:border-white/[0.07] pb-5">
        <h2 className="text-xl font-bold tracking-tight text-[#090D16] dark:text-white">Real-Time SCADA Alarm Console</h2>
        <p className="text-xs text-slate-500 dark:text-white/40 font-mono mt-0.5">PORTFOLIO ALERTS MATRIX AND FAULT MANAGEMENT</p>
      </div>

      {/* Mini Overview Counters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#FFFDFA]/[0.02] border border-slate-200/90 dark:border-white/[0.07] p-5 rounded-xl flex items-center justify-between shadow-xs dark:shadow-none">
          <div>
            <span className="text-[10.5px] text-slate-500 dark:text-white/40 uppercase tracking-wider font-mono font-semibold">Active Unacknowledged</span>
            <h3 className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-1 flex items-baseline gap-1.5">
              {activeCount} <span className="text-xs text-slate-500 dark:text-white/40 font-normal">faults</span>
            </h3>
          </div>
          <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20">
            <ShieldAlert className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#FFFDFA]/[0.02] border border-slate-200/90 dark:border-white/[0.07] p-5 rounded-xl flex items-center justify-between shadow-xs dark:shadow-none">
          <div>
            <span className="text-[10.5px] text-slate-500 dark:text-white/40 uppercase tracking-wider font-mono font-semibold">Acknowledged / In Repairs</span>
            <h3 className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1 flex items-baseline gap-1.5">
              {ackCount} <span className="text-xs text-slate-500 dark:text-white/40 font-normal">dispatched</span>
            </h3>
          </div>
          <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
            <Clock className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#FFFDFA]/[0.02] border border-slate-200/90 dark:border-white/[0.07] p-5 rounded-xl flex items-center justify-between shadow-xs dark:shadow-none">
          <div>
            <span className="text-[10.5px] text-slate-500 dark:text-white/40 uppercase tracking-wider font-mono font-semibold">Pending Critical Items</span>
            <h3 className="text-2xl font-bold font-mono text-[#090D16] dark:text-white mt-1 flex items-baseline gap-1.5">
              {criticalCount} <span className="text-xs text-rose-600 dark:text-rose-400 font-semibold animate-pulse">critical</span>
            </h3>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700">
            <AlertTriangle className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Filters Strip */}
      <div className="flex flex-col xl:flex-row items-center gap-4 bg-white dark:bg-[#FFFDFA]/[0.02] border border-slate-200/90 dark:border-white/[0.07] p-4 rounded-xl shadow-xs dark:shadow-none">
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

        {/* Severity Select */}
        <div className="flex items-center space-x-2 w-full xl:w-auto">
          <span className="text-[10px] text-slate-500 dark:text-white/40 font-mono uppercase font-bold">Severity:</span>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="w-full xl:w-40 bg-slate-50 dark:bg-[#080A0D] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white px-3 py-2 rounded-lg text-xs focus:outline-none font-sans"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Status Select */}
        <div className="flex items-center space-x-2 w-full xl:w-auto">
          <span className="text-[10px] text-slate-500 dark:text-white/40 font-mono uppercase font-bold">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full xl:w-40 bg-slate-50 dark:bg-[#080A0D] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white px-3 py-2 rounded-lg text-xs focus:outline-none font-sans"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active (Unacknowledged)</option>
            <option value="acknowledged">Acknowledged (Assigned)</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        <div className="ml-auto text-[10px] font-mono text-slate-500 dark:text-white/40 font-semibold">
          SHOWING {alarms.length} ALARM LOGS
        </div>
      </div>

      {/* Alarms grid list */}
      <div className="space-y-3.5">
        {alarms.map((a: any) => {
          const isCritical = a.severity === "critical";
          const isHigh = a.severity === "high";
          const isMedium = a.severity === "medium";

          let borderClass = "border-slate-200/90 dark:border-white/[0.07] bg-white dark:bg-[#FFFDFA]/[0.02]";
          let alertLabel = "bg-sky-50 text-sky-700 border-sky-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20";
          if (isCritical) {
            borderClass = "border-rose-200 bg-rose-50/40 dark:border-red-950/40 dark:bg-red-950/5";
            alertLabel = "bg-rose-100 text-rose-700 border-rose-300 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20 animate-pulse";
          } else if (isHigh) {
            borderClass = "border-amber-200 bg-amber-50/40 dark:border-orange-950/40 dark:bg-orange-950/5";
            alertLabel = "bg-amber-100 text-amber-800 border-amber-300 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20";
          } else if (isMedium) {
            borderClass = "border-yellow-200 bg-yellow-50/30 dark:border-yellow-950/40 dark:bg-yellow-950/5";
            alertLabel = "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/20";
          }

          if (a.status === "resolved") {
            borderClass = "border-slate-100 bg-slate-50 dark:border-white/[0.03] dark:bg-white/[0.01] opacity-70";
            alertLabel = "bg-slate-100 text-slate-600 border-slate-200 dark:bg-zinc-800/10 dark:text-zinc-400 dark:border-zinc-800";
          }

          return (
            <div
              key={a._id}
              className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all shadow-xs dark:shadow-none ${borderClass}`}
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-[4px] text-[9.5px] font-bold font-mono uppercase tracking-wider border ${alertLabel}`}>
                    {a.severity}
                  </span>
                  <span className="font-bold text-xs text-[#090D16] dark:text-zinc-200 font-mono tracking-wide">{a.code}</span>
                  <span
                    onClick={() => onSelectPlant(a.plantId)}
                    className="text-[10px] text-slate-500 dark:text-zinc-500 font-mono hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer uppercase transition-colors"
                  >
                    SITE: {a.plantName} • UNIT: {a.assetName}
                  </span>
                </div>
                <p className="text-slate-800 dark:text-zinc-300 text-xs leading-relaxed max-w-4xl font-medium">{a.message}</p>
                <div className="flex items-center space-x-4 text-[10px] text-slate-500 dark:text-zinc-500 font-mono">
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> TRIGGERED: {new Date(a.timestamp).toLocaleString()}</span>
                  {a.resolvedAt && (
                    <span className="text-emerald-700 dark:text-emerald-500 flex items-center gap-1 font-semibold"><Check className="h-3.5 w-3.5" /> RESOLVED: {new Date(a.resolvedAt).toLocaleString()}</span>
                  )}
                  {a.assignedEngineer && (
                    <span className="uppercase font-semibold text-slate-700 dark:text-zinc-300">TECHNICIAN: {a.assignedEngineer}</span>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center space-x-2 flex-shrink-0 self-end md:self-center">
                {a.status === "active" && (
                  <button
                    onClick={() => openActionModal(a._id, "ack")}
                    className="bg-slate-900 hover:bg-black text-white dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:border dark:border-zinc-800 dark:text-zinc-300 px-4 py-2 rounded-lg text-xs font-mono tracking-wider uppercase transition-all font-bold shadow-xs"
                  >
                    Acknowledge Fault
                  </button>
                )}
                {a.status === "acknowledged" && (
                  <button
                    onClick={() => openActionModal(a._id, "res")}
                    className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 dark:border-emerald-500/30 dark:text-emerald-400 px-4 py-2 rounded-lg text-xs font-mono tracking-wider uppercase transition-all font-bold"
                  >
                    Mark Resolved
                  </button>
                )}
                {a.status === "resolved" && (
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 px-3 py-1.5 rounded-lg text-[10px] font-bold font-mono uppercase flex items-center gap-1">
                    <Check className="h-3.5 w-3.5" /> Closed
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {alarms.length === 0 && (
          <div className="text-center py-20 text-slate-400 dark:text-zinc-500 border border-dashed border-slate-200 dark:border-zinc-800 rounded-xl">
            <Check className="h-8 w-8 mx-auto mb-2 opacity-40 text-emerald-500" />
            <p className="text-sm font-semibold">Zero alarm codes fit the active search parameters.</p>
          </div>
        )}
      </div>

      {/* Assignment Modal dialog */}
      {assignAlarmId && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50" onClick={() => setAssignAlarmId(null)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-[#101315] border border-slate-200 dark:border-white/[0.08] p-6 rounded-xl w-96 shadow-2xl z-[60] space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/[0.08] pb-3">
              <h3 className="font-bold text-sm text-[#090D16] dark:text-white">
                {assignActionType === "ack" ? "Acknowledge Fault & Assign Tech" : "Mark Alarm Resolved"}
              </h3>
              <button onClick={() => setAssignAlarmId(null)} className="text-slate-400 hover:text-slate-700 dark:text-zinc-500 dark:hover:text-zinc-300">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleActionSubmit} className="space-y-4 text-xs font-mono">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 dark:text-white/40 uppercase tracking-wider block font-bold">Technician Name</label>
                <select
                  required
                  value={engineerName}
                  onChange={(e) => setEngineerName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#080A0D] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white p-2 rounded-lg focus:outline-none font-sans"
                >
                  <option value="">Select Technician...</option>
                  <option value="Sarah Connor">Sarah Connor (BESS Specialist)</option>
                  <option value="John Doe">John Doe (Solar PV Inspector)</option>
                  <option value="Marcus Vance">Marcus Vance (HV Transformer Engineer)</option>
                  <option value="Elena Rostova">Elena Rostova (Turbine Controls Analyst)</option>
                  <option value="Devon Cole">Devon Cole (Substation Manager)</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-2 text-[10px] uppercase font-bold tracking-wider">
                <button
                  type="button"
                  onClick={() => setAssignAlarmId(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-zinc-900 dark:hover:bg-zinc-850 border border-slate-200 dark:border-zinc-850 dark:text-zinc-400 px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 dark:border dark:border-emerald-500/30 dark:text-emerald-400 px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-xs"
                >
                  <UserPlus className="h-3.5 w-3.5" /> Confirm Dispatch
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
