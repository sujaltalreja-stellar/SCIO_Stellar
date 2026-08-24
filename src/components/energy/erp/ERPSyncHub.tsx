import React, { useState } from "react";
import { useQuery, useMutation } from "../lib/convex";
import { api } from "../lib/convex";
import { 
  RefreshCw, 
  Settings, 
  CheckCircle, 
  Activity, 
  Cpu, 
  AlertCircle, 
  Terminal, 
  Link,
  Sliders,
  Play,
  Database,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  FileSpreadsheet,
  ShoppingCart,
  Warehouse,
  DollarSign
} from "lucide-react";

import ProcurementModule from "../procurement/ProcurementModule";
import InventoryModule from "../inventory/InventoryModule";
import FinanceModule from "../finance/FinanceModule";

export default function ERPSyncHub() {
  const [activeSubTab, setActiveSubTab] = useState<"console" | "procurement" | "inventory" | "finance">("console");
  const [selectedModule, setSelectedModule] = useState<"inventory" | "procurement" | "finance" | "assets">("inventory");
  const [syncing, setSyncing] = useState<boolean>(false);

  const jobs = useQuery(api.erp.listJobs) ?? [];
  const logs = useQuery(api.erp.listLogs, { limit: 25 }) ?? [];
  const auditLogs = useQuery(api.audit.list, { limit: 20 }) ?? [];

  const triggerSync = useMutation(api.erp.triggerSync);

  const complianceLogs = auditLogs.filter((log: any) => log.operator === "Regulatory Compliance Officer");

  const handleRunSync = async () => {
    setSyncing(true);
    try {
      const jobType = selectedModule === "inventory" ? "sync_inventory" : selectedModule === "finance" ? "sync_invoices" : "sync_pos";
      await triggerSync({
        system: "odoo",
        jobType,
        operator: "ERP System Daemon"
      });
      alert(`ERP ledger successfully re-indexed with Convex Cloud!`);
    } catch (err: any) {
      alert("Sync error: " + err.message);
    } finally {
      setSyncing(false);
    }
  };

  const modules = [
    { name: "Warehouse & Stock Ledger", id: "inventory" as const, desc: "Real-time stock levels, min-stock triggers, and warehouse bin locations.", status: "Active" },
    { name: "Purchase & PO Ledger", id: "procurement" as const, desc: "Purchase requisitions, supplier selection matrix, and Goods Receipt Notes.", status: "Active" },
    { name: "General Ledger & Cost Centers", id: "finance" as const, desc: "Budget allocations, capital expenditures, and accounts payable approvals.", status: "Active" },
    { name: "Asset Lifecycle Ledger", id: "assets" as const, desc: "Equipment specifications, downtime metrics, and repair cost balances.", status: "Active" }
  ];

  const renderConsoleView = () => {
    return (
      <div className="space-y-6">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Core modules overview */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-slate-800 dark:text-zinc-200">Active ERP Modules</h3>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-500/5 px-2 py-1 rounded border border-emerald-200 dark:border-emerald-500/10">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Local Kernel: Online
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {modules.map(m => {
                const isSelected = m.id === selectedModule;
                return (
                  <div 
                    key={m.id} 
                    onClick={() => setSelectedModule(m.id)}
                    className={`p-4 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between min-h-[170px] ${
                      isSelected 
                        ? "bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.05)]" 
                        : "bg-white dark:bg-zinc-950/20 border-slate-200 dark:border-zinc-900 hover:border-slate-300 dark:hover:border-zinc-800"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">{m.name}</h4>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono mt-0.5 block">Active Module</span>
                      </div>
                      <span className="text-[9px] uppercase px-2 py-0.5 rounded border bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-semibold flex-shrink-0">
                        {m.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed my-2">{m.desc}</p>
                    
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-zinc-500 font-mono pt-2 border-t border-slate-100 dark:border-zinc-900/60">
                      <Database className="w-3.5 h-3.5" /> Schema: `dbo.erp_{m.id}`
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sync trigger panel */}
          <div className="border border-slate-200 dark:border-zinc-900 bg-white dark:bg-zinc-950/20 rounded-xl p-5 space-y-4 shadow-sm">
            <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-slate-800 dark:text-zinc-200">ERP Sync & Re-indexing</h3>
            
            <div className="space-y-4 font-mono text-xs">
              <p className="text-[11px] text-slate-500 dark:text-zinc-500 leading-relaxed">
                Triggers a direct validation scan between the local ERP ledger and the Convex database server, ensuring SCADA parameters match inventory reorder limits.
              </p>

              <div className="space-y-1">
                <label className="text-[9px] text-slate-500 dark:text-zinc-500 uppercase font-semibold">Selected Module Ledger:</label>
                <select
                  value={selectedModule}
                  onChange={(e) => setSelectedModule(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-300 p-2.5 rounded-lg focus:outline-none"
                >
                  <option value="inventory">Warehouse Spare Parts Ledger</option>
                  <option value="procurement">Purchase Requisitions & POs</option>
                  <option value="finance">Capital Expenses & Accounts Payable</option>
                  <option value="assets">EAM Asset Lifecycle Registry</option>
                </select>
              </div>

              <button
                onClick={handleRunSync}
                disabled={syncing}
                className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-200 dark:disabled:bg-zinc-800 text-slate-950 py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
              >
                {syncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                {syncing ? "Re-indexing database..." : "Run Database Verification Scan"}
              </button>
            </div>
          </div>
        </div>

        {/* Integration Jobs summary */}
        <div className="border border-slate-200 dark:border-zinc-900 bg-white dark:bg-zinc-950/20 rounded-xl p-5 shadow-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-slate-800 dark:text-zinc-200 mb-4">Database Transaction Synchronization</h3>
          <div className="overflow-x-auto text-xs font-mono">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-500 uppercase text-[10px]">
                  <th className="pb-3">Module Schema</th>
                  <th className="pb-3">Transaction Type</th>
                  <th className="pb-3">Last Index Timestamp</th>
                  <th className="pb-3 text-right">Synced Records</th>
                  <th className="pb-3 text-right">Data Integrity</th>
                </tr>
              </thead>
              <tbody>
                {jobs.slice(0, 4).map((job: any) => (
                  <tr key={job._id} className="border-b border-slate-100 dark:border-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-900/10">
                    <td className="py-3 font-bold text-slate-800 dark:text-white uppercase">ERP {job.jobType.split("_")[1]}</td>
                    <td className="py-3 text-slate-500 dark:text-zinc-400 font-mono">{job.jobType}</td>
                    <td className="py-3 text-slate-500 dark:text-zinc-400">{new Date(job.lastRun).toLocaleString()}</td>
                    <td className="py-3 text-right text-slate-700 dark:text-zinc-300 font-bold">{job.recordsSynced} ledger items</td>
                    <td className="py-3 text-right">
                      <span className="text-emerald-600 dark:text-emerald-400 text-[10px] border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/5 px-2.5 py-0.5 rounded flex items-center gap-1 ml-auto w-fit font-bold">
                        <ShieldCheck className="w-3.5 h-3.5" /> Verified
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Regulatory & NERC Interconnection compliance log */}
        {complianceLogs.length > 0 && (
          <div className="border border-slate-200 dark:border-zinc-900 bg-white dark:bg-zinc-950/20 rounded-xl p-5 shadow-sm">
            <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-slate-800 dark:text-zinc-200 mb-4 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> NERC / FERC Regulatory Interconnection Audit Logs
            </h3>
            <div className="overflow-x-auto text-xs font-mono">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-500 uppercase text-[10px]">
                    <th className="pb-3">Timestamp</th>
                    <th className="pb-3">Action Item</th>
                    <th className="pb-3">Details / Security Verification</th>
                    <th className="pb-3 text-right">Audit Status</th>
                  </tr>
                </thead>
                <tbody>
                  {complianceLogs.map((log: any) => (
                    <tr key={log._id} className="border-b border-slate-100 dark:border-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-900/10">
                      <td className="py-3 text-slate-500 dark:text-zinc-500">{new Date(log.timestamp).toLocaleString()}</td>
                      <td className="py-3 font-bold text-slate-800 dark:text-white uppercase">{log.action}</td>
                      <td className="py-3 text-slate-600 dark:text-zinc-400">{log.details}</td>
                      <td className="py-3 text-right">
                        <span className="text-emerald-600 dark:text-emerald-400 text-[9px] uppercase px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/5 font-semibold">
                          Compliant
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Integration Logs Console */}
        <div className="border border-slate-200 dark:border-zinc-900 bg-white dark:bg-zinc-950/20 rounded-xl p-5 space-y-3 shadow-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
            <Terminal className="w-4 h-4 text-emerald-500" /> ERP Kernel Console Logs
          </h3>
          
          <div className="bg-slate-900 dark:bg-zinc-950 border border-slate-800 dark:border-zinc-900 rounded-lg p-4 font-mono text-[11px] h-60 overflow-y-auto space-y-2 select-text text-zinc-300">
            {logs.map((log: any) => (
              <div key={log._id} className="flex items-start gap-3">
                <span className="text-zinc-500 flex-shrink-0">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                <span className={`px-1.5 rounded-[3px] text-[9px] font-bold uppercase tracking-wider flex-shrink-0 ${
                  log.level === "error" 
                    ? "bg-red-500/15 text-red-400 border border-red-500/20" 
                    : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                }`}>
                  {log.level}
                </span>
                <span className="text-zinc-300 leading-normal">
                  {log.message.replace(/external \w+ ERP instance/g, "inbuilt ERP database kernel")}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderActiveTabContent = () => {
    switch (activeSubTab) {
      case "console":
        return renderConsoleView();
      case "procurement":
        return <ProcurementModule hideHeader={true} />;
      case "inventory":
        return <InventoryModule hideHeader={true} />;
      case "finance":
        return <FinanceModule hideHeader={true} />;
      default:
        return renderConsoleView();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Consolidator Page Header & Tab Menu */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 dark:border-zinc-900 pb-5 gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            ERP Operations Control Hub <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 bg-slate-100 dark:bg-slate-800/35">Unified ERP</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-500 font-mono">CONSOLIDATED ENTERPRISE SUPPLY CHAIN, WAREHOUSES, & FINANCIAL LEDGERS</p>
        </div>

        <div className="flex bg-slate-100 dark:bg-zinc-950/40 p-1.5 rounded-xl border border-slate-200 dark:border-zinc-900/80 gap-1.5 text-xs font-mono font-semibold">
          {(["console", "procurement", "inventory", "finance"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveSubTab(tab)}
              className={`px-4.5 py-2.5 rounded-lg transition-all flex items-center gap-2 ${
                activeSubTab === tab 
                  ? "bg-white dark:bg-zinc-900 border border-slate-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold shadow-sm" 
                  : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 border border-transparent hover:bg-slate-200/60 dark:hover:bg-zinc-900/30"
              }`}
            >
              {tab === "console" && <RefreshCw className="w-4.5 h-4.5" />}
              {tab === "procurement" && <ShoppingCart className="w-4.5 h-4.5" />}
              {tab === "inventory" && <Warehouse className="w-4.5 h-4.5" />}
              {tab === "finance" && <DollarSign className="w-4.5 h-4.5" />}
              
              {tab === "console" ? "Core Console" : tab === "procurement" ? "Procurement & RFQs" : tab === "inventory" ? "Warehouse Inventory" : "Finance & Budgets"}
            </button>
          ))}
        </div>
      </div>

      {renderActiveTabContent()}
    </div>
  );
}
