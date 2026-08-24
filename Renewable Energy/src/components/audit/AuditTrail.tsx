import React, { useState } from "react";
import { useQuery } from "../../lib/convex";
import { api } from "../../lib/convex";
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
      <div className="flex flex-col md:flex-row items-center gap-4 bg-zinc-950/40 border border-zinc-900 p-4 rounded-xl">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by action, details, site or engineer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 focus:border-zinc-700 focus:outline-none rounded-lg text-xs placeholder:text-zinc-500 font-sans"
          />
        </div>

        {/* Action filter */}
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <span className="text-[10px] text-zinc-500 font-mono uppercase">Filter Code:</span>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 focus:border-zinc-700 text-zinc-300 px-3 py-2 rounded-lg text-xs focus:outline-none font-sans"
          >
            <option value="all">All Action Types</option>
            <option value="ALARM_TRIGGER">ALARM_TRIGGER</option>
            <option value="ALARM_ACKNOWLEDGE">ALARM_ACKNOWLEDGE</option>
            <option value="ALARM_RESOLVE">ALARM_RESOLVE</option>
            <option value="MAINTENANCE_SCHEDULE">MAINTENANCE_SCHEDULE</option>
            <option value="MAINTENANCE_COMPLETE">MAINTENANCE_COMPLETE</option>
          </select>
        </div>

        <div className="ml-auto text-[10px] font-mono text-zinc-500">
          {filteredLogs.length} TRANSACTION ENTRIES LISTED
        </div>
      </div>

      {/* Ledger Log Panel */}
      <div className="glass-panel rounded-xl overflow-hidden border border-zinc-900">
        <div className="border-b border-zinc-900 bg-zinc-950/60 p-4 flex items-center justify-between">
          <h3 className="text-xs font-semibold tracking-wide font-mono flex items-center gap-2">
            <History className="h-4.5 w-4.5 text-zinc-500" /> Immutable Event Journal
          </h3>
          <span className="text-[9px] font-mono text-zinc-500 uppercase">
            SCADA SEED LEVEL 2 LOGS
          </span>
        </div>

        <div className="max-h-[500px] overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-zinc-900 bg-zinc-950/20 text-zinc-500 sticky top-0 backdrop-blur z-10">
                <th className="font-semibold p-4">TIMESTAMP</th>
                <th className="font-semibold p-4">OPERATOR</th>
                <th className="font-semibold p-4">SITE</th>
                <th className="font-semibold p-4">ACTION CODE</th>
                <th className="font-semibold p-4">LOG TRANSACTION SUMMARY</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((l: any) => {
                let badgeStyle = "bg-zinc-800/10 text-zinc-400 border border-zinc-800";
                if (l.action === "ALARM_TRIGGER") {
                  badgeStyle = "bg-red-500/10 text-red-500 border border-red-500/20";
                } else if (l.action === "ALARM_ACKNOWLEDGE") {
                  badgeStyle = "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20";
                } else if (l.action === "ALARM_RESOLVE") {
                  badgeStyle = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
                } else if (l.action === "MAINTENANCE_SCHEDULE") {
                  badgeStyle = "bg-blue-500/10 text-blue-500 border border-blue-500/20";
                } else if (l.action === "MAINTENANCE_COMPLETE") {
                  badgeStyle = "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20";
                }

                return (
                  <tr
                    key={l._id}
                    className="hover:bg-zinc-900/20 border-b border-zinc-900/40"
                  >
                    <td className="p-4 text-zinc-500 text-[10px] w-48">
                      {new Date(l.timestamp).toLocaleString()}
                    </td>
                    <td className="p-4 text-zinc-400 font-semibold w-36 truncate">{l.operator}</td>
                    <td className="p-4 text-zinc-400 w-44 truncate">{l.plantName}</td>
                    <td className="p-4 w-48">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${badgeStyle}`}>
                        {l.action}
                      </span>
                    </td>
                    <td className="p-4 text-zinc-300 leading-snug">{l.details}</td>
                  </tr>
                );
              })}

              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-16 text-zinc-500">
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
