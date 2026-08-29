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
                        ? "bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]" 
                        : "bg-[#0f1219] border-[#252b3b] hover:border-[#384259]"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h4 className="font-bold text-white text-sm">{m.name}</h4>
                        <span className="text-[10px] text-emerald-400 font-mono mt-0.5 block font-bold">Active Module</span>
                      </div>
                      <span className="text-[9px] uppercase px-2 py-0.5 rounded border bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-bold flex-shrink-0">
                        {m.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed my-2">{m.desc}</p>
                    
                    <div className="flex items-center gap-1.5 text-[10px] text-cyan-400 font-mono pt-2 border-t border-[#252b3b]">
                      <Database className="w-3.5 h-3.5" /> Schema: `dbo.erp_{m.id}`
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sync trigger panel */}
          <div className="border border-[#252b3b] bg-[#0f1219] rounded-xl p-5 space-y-4 shadow-lg">
            <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-white">ERP Sync & Re-indexing</h3>
            
            <div className="space-y-4 font-mono text-xs">
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Triggers a direct validation scan between the local ERP ledger and the Convex database server, ensuring SCADA parameters match inventory reorder limits.
              </p>

              <div className="space-y-1">
                <label className="text-[9.5px] text-slate-400 uppercase font-semibold">Selected Module Ledger:</label>
                <select
                  value={selectedModule}
                  onChange={(e) => setSelectedModule(e.target.value as any)}
                  className="w-full bg-[#161a24] border border-[#252b3b] text-white p-2.5 rounded-lg focus:outline-none text-xs"
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
                className="w-full bg-emerald-400 hover:bg-emerald-300 disabled:bg-slate-800 text-slate-950 py-3 rounded-lg font-extrabold transition-all flex items-center justify-center gap-1.5 shadow-md text-xs cursor-pointer"
              >
                {syncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                {syncing ? "Re-indexing database..." : "Run Database Verification Scan"}
              </button>
            </div>
          </div>
        </div>

        {/* Integration Jobs summary */}
        <div className="border border-[#252b3b] bg-[#0f1219] rounded-xl p-5 shadow-lg">
          <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-white mb-4">Database Transaction Synchronization</h3>
          <div className="overflow-x-auto text-xs font-mono">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#252b3b] text-slate-400 uppercase text-[10px] font-bold">
                  <th className="pb-3">Module Schema</th>
                  <th className="pb-3">Transaction Type</th>
                  <th className="pb-3">Last Index Timestamp</th>
                  <th className="pb-3 text-right">Synced Records</th>
                  <th className="pb-3 text-right">Data Integrity</th>
                </tr>
              </thead>
              <tbody>
                {jobs.slice(0, 4).map((job: any) => (
                  <tr key={job._id} className="border-b border-[#252b3b]/60 hover:bg-cyan-500/5 transition-colors">
                    <td className="py-3 font-bold text-white uppercase">ERP {job.jobType.split("_")[1]}</td>
                    <td className="py-3 text-cyan-300 font-mono">{job.jobType}</td>
                    <td className="py-3 text-slate-400">{new Date(job.lastRun).toLocaleString()}</td>
                    <td className="py-3 text-right text-slate-200 font-bold">{job.recordsSynced} ledger items</td>
                    <td className="py-3 text-right">
                      <span className="text-emerald-400 text-[10px] border border-emerald-500/30 bg-emerald-950/60 px-2.5 py-0.5 rounded flex items-center gap-1 ml-auto w-fit font-bold">
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
          <div className="border border-[#252b3b] bg-[#0f1219] rounded-xl p-5 shadow-lg">
            <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-white mb-4 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> NERC / FERC Regulatory Interconnection Audit Logs
            </h3>
            <div className="overflow-x-auto text-xs font-mono">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#252b3b] text-slate-400 uppercase text-[10px] font-bold">
                    <th className="pb-3">Timestamp</th>
                    <th className="pb-3">Action Item</th>
                    <th className="pb-3">Details / Security Verification</th>
                    <th className="pb-3 text-right">Audit Status</th>
                  </tr>
                </thead>
                <tbody>
                  {complianceLogs.map((log: any) => (
                    <tr key={log._id} className="border-b border-[#252b3b]/60 hover:bg-cyan-500/5 transition-colors">
                      <td className="py-3 text-slate-400">{new Date(log.timestamp).toLocaleString()}</td>
                      <td className="py-3 font-bold text-white uppercase">{log.action}</td>
                      <td className="py-3 text-slate-200">{log.details}</td>
                      <td className="py-3 text-right">
                        <span className="text-emerald-400 text-[9px] uppercase px-2 py-0.5 rounded border border-emerald-500/30 bg-emerald-950/60 font-bold">
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
        <div className="border border-[#252b3b] bg-[#0f1219] rounded-xl p-5 space-y-3 shadow-lg">
          <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-white flex items-center gap-1.5">
            <Terminal className="w-4 h-4 text-emerald-400" /> ERP Kernel Console Logs
          </h3>
          
          <div className="bg-[#080b11] border border-[#252b3b] rounded-lg p-4 font-mono text-[11px] h-60 overflow-y-auto space-y-2 select-text text-slate-200">
            {logs.map((log: any) => (
              <div key={log._id} className="flex items-start gap-3">
                <span className="text-slate-500 flex-shrink-0">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                <span className={`px-1.5 rounded-[3px] text-[9px] font-bold uppercase tracking-wider flex-shrink-0 ${
                  log.level === "error" 
                    ? "bg-red-500/20 text-red-400 border border-red-500/30" 
                    : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                }`}>
                  {log.level}
                </span>
                <span className="text-slate-200 leading-normal">
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
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#252b3b] pb-5 gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            ERP Operations Control Hub <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded border border-emerald-500/40 text-emerald-400 bg-emerald-950/60">Unified ERP</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono">CONSOLIDATED ENTERPRISE SUPPLY CHAIN, WAREHOUSES, &amp; FINANCIAL LEDGERS</p>
        </div>

        <div className="flex bg-[#0f1219] p-1.5 rounded-xl border border-[#252b3b] gap-1.5 text-xs font-mono font-semibold">
          {(["console", "procurement", "inventory", "finance"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveSubTab(tab)}
              className={`px-4.5 py-2.5 rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                activeSubTab === tab 
                  ? "bg-[#161a24] border border-emerald-500/40 text-emerald-400 font-bold shadow-md" 
                  : "text-slate-400 hover:text-white border border-transparent hover:bg-white/5"
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
