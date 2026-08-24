import React, { useState } from "react";
import { useQuery, useMutation } from "../../lib/convex";
import { api } from "../../lib/convex";
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Real-Time SCADA Alarm Console</h2>
          <p className="text-xs text-zinc-500 font-mono">PORTFOLIO ALERTS MATRIX AND FAULT MANAGEMENT</p>
        </div>
      </div>

      {/* Mini Overview Counters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-4.5 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">Active Unacknowledged</span>
            <h3 className="text-2xl font-bold font-mono text-red-500 mt-1.5 flex items-baseline gap-1.5">
              {activeCount} <span className="text-xs text-zinc-500 font-normal">faults</span>
            </h3>
          </div>
          <ShieldAlert className="h-8 w-8 text-red-500/20" />
        </div>

        <div className="glass-panel p-4.5 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">Acknowledged / In Repairs</span>
            <h3 className="text-2xl font-bold font-mono text-yellow-500 mt-1.5 flex items-baseline gap-1.5">
              {ackCount} <span className="text-xs text-zinc-500 font-normal">dispatched</span>
            </h3>
          </div>
          <Clock className="h-8 w-8 text-yellow-500/20" />
        </div>

        <div className="glass-panel p-4.5 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">Pending Critical Items</span>
            <h3 className="text-2xl font-bold font-mono text-zinc-100 mt-1.5 flex items-baseline gap-1.5">
              {criticalCount} <span className="text-xs text-red-500 font-semibold animate-pulse">critical</span>
            </h3>
          </div>
          <AlertTriangle className="h-8 w-8 text-zinc-500/20" />
        </div>
      </div>

      {/* Filters Strip */}
      <div className="flex flex-col xl:flex-row items-center gap-4 bg-zinc-950/40 border border-zinc-900 p-4 rounded-xl">
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

        {/* Severity Select */}
        <div className="flex items-center space-x-2 w-full xl:w-auto">
          <span className="text-[10px] text-zinc-500 font-mono uppercase">Severity:</span>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="w-full xl:w-40 bg-zinc-900 border border-zinc-800 focus:border-zinc-700 text-zinc-300 px-3 py-2 rounded-lg text-xs focus:outline-none font-sans"
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
          <span className="text-[10px] text-zinc-500 font-mono uppercase">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full xl:w-40 bg-zinc-900 border border-zinc-800 focus:border-zinc-700 text-zinc-300 px-3 py-2 rounded-lg text-xs focus:outline-none font-sans"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active (Unacknowledged)</option>
            <option value="acknowledged">Acknowledged (Assigned)</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        <div className="ml-auto text-[10px] font-mono text-zinc-500">
          SHOWING {alarms.length} ALARM LOGS
        </div>
      </div>

      {/* Alarms grid list */}
      <div className="space-y-3.5">
        {alarms.map((a: any) => {
          const isCritical = a.severity === "critical";
          const isHigh = a.severity === "high";
          const isMedium = a.severity === "medium";

          let borderClass = "border-zinc-900 hover:border-zinc-800";
          let alertLabel = "bg-blue-500/10 text-blue-500 border-blue-500/20";
          if (isCritical) {
            borderClass = "border-red-950/40 hover:border-red-900/60 bg-red-950/5";
            alertLabel = "bg-red-500/10 text-red-500 border border-red-500/20 animate-pulse";
          } else if (isHigh) {
            borderClass = "border-orange-950/40 hover:border-orange-900/60 bg-orange-950/5";
            alertLabel = "bg-orange-500/10 text-orange-500 border border-orange-500/20";
          } else if (isMedium) {
            borderClass = "border-yellow-950/40 hover:border-yellow-900/60 bg-yellow-950/5";
            alertLabel = "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20";
          }

          if (a.status === "resolved") {
            borderClass = "border-zinc-950 bg-zinc-950/40 opacity-55";
            alertLabel = "bg-zinc-800/10 text-zinc-400 border border-zinc-800";
          }

          return (
            <div
              key={a._id}
              className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${borderClass}`}
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-[4px] text-[9px] font-bold font-mono uppercase tracking-wider ${alertLabel}`}>
                    {a.severity}
                  </span>
                  <span className="font-bold text-xs text-zinc-200 font-mono tracking-wide">{a.code}</span>
                  <span
                    onClick={() => onSelectPlant(a.plantId)}
                    className="text-[10px] text-zinc-500 font-mono hover:text-emerald-400 cursor-pointer uppercase transition-colors"
                  >
                    SITE: {a.plantName} • UNIT: {a.assetName}
                  </span>
                </div>
                <p className="text-zinc-300 text-xs leading-relaxed max-w-4xl">{a.message}</p>
                <div className="flex items-center space-x-4 text-[10px] text-zinc-500 font-mono">
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> TRIGGERED: {new Date(a.timestamp).toLocaleString()}</span>
                  {a.resolvedAt && (
                    <span className="text-emerald-500 flex items-center gap-1"><Check className="h-3.5 w-3.5" /> RESOLVED: {new Date(a.resolvedAt).toLocaleString()}</span>
                  )}
                  {a.assignedEngineer && (
                    <span className="uppercase">TECHNICIAN: {a.assignedEngineer}</span>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center space-x-2 flex-shrink-0 self-end md:self-center">
                {a.status === "active" && (
                  <button
                    onClick={() => openActionModal(a._id, "ack")}
                    className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 px-4 py-2 rounded-lg text-xs font-mono tracking-wider uppercase transition-all"
                  >
                    Acknowledge Fault
                  </button>
                )}
                {a.status === "acknowledged" && (
                  <button
                    onClick={() => openActionModal(a._id, "res")}
                    className="bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-4 py-2 rounded-lg text-xs font-mono tracking-wider uppercase transition-all"
                  >
                    Mark Resolved
                  </button>
                )}
                {a.status === "resolved" && (
                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-lg text-[10px] font-bold font-mono uppercase flex items-center gap-1">
                    <Check className="h-3.5 w-3.5" /> Closed
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {alarms.length === 0 && (
          <div className="text-center py-20 text-zinc-500 border border-dashed border-zinc-900 rounded-xl">
            <Check className="h-8 w-8 mx-auto mb-2 opacity-40 text-emerald-500" />
            <p className="text-sm font-semibold">Zero alarm codes fit the active search parameters.</p>
          </div>
        )}
      </div>

      {/* Assignment Modal dialog */}
      {assignAlarmId && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={() => setAssignAlarmId(null)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-zinc-950 border border-zinc-900 p-6 rounded-xl w-96 shadow-2xl z-[60] space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <h3 className="font-bold text-sm text-zinc-200">
                {assignActionType === "ack" ? "Acknowledge Fault & Assign Tech" : "Mark Alarm Resolved"}
              </h3>
              <button onClick={() => setAssignAlarmId(null)} className="text-zinc-500 hover:text-zinc-300">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleActionSubmit} className="space-y-4 text-xs font-mono">
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500 uppercase tracking-wider block">Technician Name</label>
                <select
                  required
                  value={engineerName}
                  onChange={(e) => setEngineerName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 p-2 rounded focus:outline-none"
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
                  className="bg-zinc-900 hover:bg-zinc-850 border border-zinc-850 text-zinc-400 px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-4 py-2 rounded flex items-center gap-1.5"
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
