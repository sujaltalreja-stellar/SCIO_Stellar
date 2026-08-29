import React, { useState } from "react";
import { useQuery } from "../lib/convex";
import { api } from "../lib/convex";
import { History, Search, Layers, Clock, ShieldCheck, Wrench, ShieldAlert } from "lucide-react";

export default function AuditTrail() {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");

  const logs = useQuery(api.audit.list, { limit: 80 }) ?? [];

  // Filter logs locally
  const filteredLogs = logs.filter((log: any) => {
    const matchesSearch =
      log.details.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.operator.toLowerCase().includes(search.toLowerCase()) ||
      log.plantName.toLowerCase().includes(search.toLowerCase());

    const matchesAction =
      actionFilter === "all" || log.action.toUpperCase() === actionFilter.toUpperCase();

    return matchesSearch && matchesAction;
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">System Audit Trail & Log Ledger</h2>
          <p className="text-xs text-zinc-500 font-mono">SCADA DATA TRANSACTION HISTORY AND COMPLIANCE</p>
        </div>
      </div>

      {/* Filters Strip */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-[#0f1219] border border-[#252b3b] p-4 rounded-xl shadow-lg">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by action, details, site or engineer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#161a24] border border-[#252b3b] focus:border-emerald-500 focus:outline-none rounded-lg text-xs text-white placeholder:text-slate-500 font-sans"
          />
        </div>

        {/* Action filter */}
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <span className="text-[10px] text-slate-400 font-mono uppercase font-semibold">Filter Code:</span>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-[#161a24] border border-[#252b3b] text-white px-3 py-2 rounded-lg text-xs focus:outline-none font-sans"
          >
            <option value="all">All Action Types</option>
            <option value="ALARM_TRIGGER">ALARM_TRIGGER</option>
            <option value="ALARM_ACKNOWLEDGE">ALARM_ACKNOWLEDGE</option>
            <option value="ALARM_RESOLVE">ALARM_RESOLVE</option>
            <option value="MAINTENANCE_SCHEDULE">MAINTENANCE_SCHEDULE</option>
            <option value="MAINTENANCE_COMPLETE">MAINTENANCE_COMPLETE</option>
          </select>
        </div>

        <div className="ml-auto text-[10px] font-mono text-emerald-400 font-bold">
          {filteredLogs.length} TRANSACTION ENTRIES LISTED
        </div>
      </div>

      {/* Ledger Log Panel */}
      <div className="rounded-xl overflow-hidden border border-[#252b3b] bg-[#0f1219] shadow-xl">
        <div className="border-b border-[#252b3b] bg-[#161a24] p-4 flex items-center justify-between">
          <h3 className="text-xs font-semibold tracking-wide font-mono flex items-center gap-2 text-white">
            <History className="h-4.5 w-4.5 text-emerald-400" /> Immutable Event Journal
          </h3>
          <span className="text-[9.5px] font-mono text-cyan-400 uppercase tracking-widest font-bold">
            SCADA SEED LEVEL 2 LOGS
          </span>
        </div>

        <div className="max-h-[500px] overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-[#252b3b] bg-[#161a24]/90 text-slate-300 sticky top-0 backdrop-blur z-10">
                <th className="font-bold p-4">TIMESTAMP</th>
                <th className="font-bold p-4">OPERATOR</th>
                <th className="font-bold p-4">SITE</th>
                <th className="font-bold p-4">ACTION CODE</th>
                <th className="font-bold p-4">LOG TRANSACTION SUMMARY</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((l: any) => {
                let badgeStyle = "bg-slate-800 text-slate-300 border border-slate-700";
                if (l.action === "ALARM_TRIGGER") {
                  badgeStyle = "bg-red-950/80 text-red-400 border border-red-500/40 font-bold";
                } else if (l.action === "ALARM_ACKNOWLEDGE") {
                  badgeStyle = "bg-amber-950/80 text-amber-300 border border-amber-500/40 font-bold";
                } else if (l.action === "ALARM_RESOLVE") {
                  badgeStyle = "bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 font-bold";
                } else if (l.action === "MAINTENANCE_SCHEDULE") {
                  badgeStyle = "bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 font-bold";
                } else if (l.action === "MAINTENANCE_COMPLETE") {
                  badgeStyle = "bg-indigo-950/80 text-indigo-300 border border-indigo-500/40 font-bold";
                }

                return (
                  <tr
                    key={l._id}
                    className="hover:bg-cyan-500/5 border-b border-white/5 transition-colors"
                  >
                    <td className="p-4 text-slate-400 text-[11px] w-48 font-mono">
                      {new Date(l.timestamp).toLocaleString()}
                    </td>
                    <td className="p-4 text-white font-bold w-36 truncate">{l.operator}</td>
                    <td className="p-4 text-cyan-300 w-44 truncate">{l.plantName}</td>
                    <td className="p-4 w-48">
                      <span className={`px-2.5 py-1 rounded text-[9.5px] font-mono ${badgeStyle}`}>
                        {l.action}
                      </span>
                    </td>
                    <td className="p-4 text-slate-200 leading-snug font-sans">{l.details}</td>
                  </tr>
                );
              })}

              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-16 text-slate-500 font-mono text-xs">
                    No transactions matched the active query filter tags.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
