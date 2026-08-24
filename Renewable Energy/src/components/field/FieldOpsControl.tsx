import React, { useState } from "react";
import { useQuery, useMutation, api } from "@/lib/convex";
import {
  Wrench,
  Calendar,
  Users,
  AlertTriangle,
  Play,
  CheckCircle,
  FileText,
  Clock,
  MapPin,
  TrendingUp,
  Sliders,
  Sparkles,
  ChevronRight,
  Plus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function FieldOpsControl() {
  const [activeSubTab, setActiveSubTab] = useState<"kanban" | "calendar" | "technicians">("kanban");
  
  const workOrders = useQuery(api.workOrders.list) ?? [];
  const technicians = useQuery(api.workOrders.getTechnicians) ?? [];
  const plants = useQuery(api.plants.list) ?? [];
  const assets = useQuery(api.assets.list) ?? [];
  
  const updateStatusMutation = useMutation(api.workOrders.updateStatus);
  const createWOMutation = useMutation(api.workOrders.create);

  // Modal controls
  const [isCloseWOModalOpen, setIsCloseWOModalOpen] = useState(false);
  const [selectedWOForClosing, setSelectedWOForClosing] = useState<any>(null);
  const [closeActualHours, setCloseActualHours] = useState("");
  const [closeLaborCost, setCloseLaborCost] = useState("");
  const [closeDowntime, setCloseDowntime] = useState("");
  const [selectedPart, setSelectedPart] = useState("");
  
  // Create WO form state
  const [isCreateWOModalOpen, setIsCreateWOModalOpen] = useState(false);
  const [newWOTitle, setNewWOTitle] = useState("");
  const [newWODesc, setNewWODesc] = useState("");
  const [newWOType, setNewWOType] = useState<"preventive" | "corrective" | "predictive" | "emergency">("preventive");
  const [newWOPriority, setNewWOPriority] = useState<"critical" | "high" | "medium" | "low">("medium");
  const [newWOPlantId, setNewWOPlantId] = useState("");
  const [newWOAssetId, setNewWOAssetId] = useState("");
  const [newWOTech, setNewWOTech] = useState("");
  const [newWODate, setNewWODate] = useState(new Date().toISOString().split("T")[0]);
  const [newWOHours, setNewWOHours] = useState("4");

  const kanbanColumns = [
    { id: "draft", title: "Draft", bg: "bg-slate-900/40" },
    { id: "open", title: "Open / Dispatched", bg: "bg-slate-900/40" },
    { id: "assigned", title: "Assigned", bg: "bg-slate-900/40" },
    { id: "in_progress", title: "In Progress", bg: "bg-slate-900/40" },
    { id: "waiting_parts", title: "Waiting Parts", bg: "bg-slate-900/40" },
    { id: "completed", title: "Completed / Closed", bg: "bg-slate-900/40" }
  ];

  const getPriorityColor = (p: string) => {
    switch (p) {
      case "critical": return "border-red-500 text-red-400 bg-red-500/5";
      case "high": return "border-orange-500 text-orange-400 bg-orange-500/5";
      case "medium": return "border-amber-500 text-amber-400 bg-amber-500/5";
      default: return "border-blue-500 text-blue-400 bg-blue-500/5";
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: string) => {
    const woId = e.dataTransfer.getData("woId");
    if (!woId) return;

    const wo = workOrders.find((w: any) => w._id === woId);
    if (!wo) return;

    if (targetStatus === "completed") {
      // Open modal to capture completion parameters
      setSelectedWOForClosing(wo);
      setCloseActualHours(wo.estimatedHours.toString());
      setCloseLaborCost("250");
      setCloseDowntime(wo.priority === "critical" ? "2.5" : "0");
      setSelectedPart("Cooling Fan Air Filter Panel");
      setIsCloseWOModalOpen(true);
    } else {
      await updateStatusMutation({
        woId: woId as any,
        status: targetStatus as any,
        assignedTechnician: wo.assignedTechnician ?? (targetStatus === "assigned" ? technicians[0]?.name : undefined)
      });
    }
  };

  const handleCloseWOSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWOForClosing) return;

    const partsCostMap: Record<string, number> = {
      "300A Substation Inverter Fuse": 120,
      "Cooling Fan Air Filter Panel": 45,
      "Substation Sub-transformer Seal Ring": 85,
      "Wind Yaw Pinion Drive Bearing": 450,
      "BESS HVAC Exchanger Pump Motor": 350,
    };

    const spareParts = selectedPart ? [{
      name: selectedPart,
      quantity: 1,
      cost: partsCostMap[selectedPart] ?? 0
    }] : [];

    const materialsCost = spareParts.reduce((sum, p) => sum + p.cost * p.quantity, 0);

    await updateStatusMutation({
      woId: selectedWOForClosing._id,
      status: "completed",
      actualHours: parseFloat(closeActualHours) || 2,
      laborCost: parseFloat(closeLaborCost) || 150,
      materialsCost,
      downtimeHours: parseFloat(closeDowntime) || 0,
      spareParts
    });

    setIsCloseWOModalOpen(false);
    setSelectedWOForClosing(null);
  };

  const handleCreateWOSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWOPlantId || !newWOAssetId || !newWOTitle) return;

    await createWOMutation({
      plantId: newWOPlantId as any,
      assetId: newWOAssetId as any,
      type: newWOType,
      title: newWOTitle,
      description: newWODesc,
      priority: newWOPriority,
      assignedTechnician: newWOTech || undefined,
      scheduledDate: newWODate,
      estimatedHours: parseFloat(newWOHours) || 4
    });

    setIsCreateWOModalOpen(false);
    setNewWOTitle("");
    setNewWODesc("");
  };

  return (
    <div className="space-y-6">
      {/* Title strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-5 gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Field Operations Control Center <span className="text-xs font-mono font-medium px-2 py-0.5 rounded border border-slate-700 text-slate-400 bg-slate-800/35">EAM Panel</span>
          </h1>
          <p className="text-xs text-slate-400">
            Dispatch technicians, transition work order pipelines, track calendar events, and balance maintenance workloads.
          </p>
        </div>

        {/* Buttons and Subtabs */}
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-950 p-0.5 rounded border border-slate-800 text-xs">
            <button
              onClick={() => setActiveSubTab("kanban")}
              className={`px-3 py-1.5 rounded transition-all font-medium ${
                activeSubTab === "kanban" ? "bg-emerald-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
              }`}
            >
              Kanban
            </button>
            <button
              onClick={() => setActiveSubTab("calendar")}
              className={`px-3 py-1.5 rounded transition-all font-medium ${
                activeSubTab === "calendar" ? "bg-emerald-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
              }`}
            >
              Calendar
            </button>
            <button
              onClick={() => setActiveSubTab("technicians")}
              className={`px-3 py-1.5 rounded transition-all font-medium ${
                activeSubTab === "technicians" ? "bg-emerald-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
              }`}
            >
              Technicians
            </button>
          </div>

          <button
            onClick={() => {
              if (plants.length > 0) {
                setNewWOPlantId(plants[0]._id);
                const pAssets = assets.filter((a: any) => a.plantId === plants[0]._id);
                if (pAssets.length > 0) setNewWOAssetId(pAssets[0]._id);
              }
              setIsCreateWOModalOpen(true);
            }}
            className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 px-3.5 py-1.5 text-xs font-bold rounded shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-all"
          >
            <Plus className="w-4 h-4" /> Create Work Order
          </button>
        </div>
      </div>

      {/* Render Subtabs */}
      <AnimatePresence mode="wait">
        
        {/* KANBAN BOARD */}
        {activeSubTab === "kanban" && (
          <motion.div
            key="kanban"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto pb-4"
          >
            {kanbanColumns.map((col) => {
              const colWOs = workOrders.filter((w: any) => {
                if (col.id === "completed") return w.status === "completed" || w.status === "closed";
                return w.status === col.id;
              });

              return (
                <div
                  key={col.id}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, col.id)}
                  className={`border border-slate-800 rounded-lg p-3 ${col.bg} min-w-[210px] flex flex-col h-[580px]`}
                >
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xs font-semibold uppercase font-mono tracking-wider text-slate-300">
                      {col.title}
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400">
                      {colWOs.length}
                    </span>
                  </div>

                  {/* Cards container */}
                  <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                    {colWOs.map((wo: any) => (
                      <div
                        key={wo._id}
                        draggable
                        onDragStart={(e) => e.dataTransfer.setData("woId", wo._id)}
                        className="border border-slate-800 hover:border-slate-700 bg-slate-950 rounded p-3 cursor-grab active:cursor-grabbing text-xs space-y-2 transition-all"
                      >
                        <div className="flex justify-between items-center gap-2">
                          <span className={`text-[8px] font-mono font-medium px-1.5 py-0.5 rounded border uppercase ${getPriorityColor(wo.priority)}`}>
                            {wo.priority}
                          </span>
                          <span className="text-[9px] font-mono text-slate-500 line-clamp-1">{wo.plantName}</span>
                        </div>
                        <h4 className="font-semibold text-slate-200 line-clamp-2">{wo.title}</h4>
                        <p className="text-slate-400 text-[11px] line-clamp-2">{wo.description}</p>
                        
                        <div className="border-t border-slate-900 pt-2 flex items-center justify-between text-[9px] font-mono text-slate-500">
                          <span className="flex items-center gap-1"><Users className="w-2.5 h-2.5" /> {wo.assignedTechnician ?? "Unassigned"}</span>
                          <span className="flex items-center gap-1"><Calendar className="w-2.5 h-2.5" /> {wo.scheduledDate}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}

        {/* DISPATCH CALENDAR */}
        {activeSubTab === "calendar" && (
          <motion.div
            key="calendar"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="border border-slate-800 bg-slate-900/10 backdrop-blur-md rounded-lg p-5"
          >
            <h2 className="text-sm font-semibold uppercase tracking-wider font-mono text-white mb-4">
              Maintenance Schedule Calendar
            </h2>
            
            {/* Generate calendar list */}
            <div className="grid grid-cols-7 gap-1 border-t border-l border-slate-800 text-center font-mono text-[10px]">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                <div key={d} className="p-2 bg-slate-950 border-r border-b border-slate-800 text-slate-500 font-bold uppercase">{d}</div>
              ))}

              {Array.from({ length: 28 }).map((_, idx) => {
                const dayOffset = idx - 7; // show some past and future
                const date = new Date(Date.now() + dayOffset * 24 * 3600 * 1000);
                const dateStr = date.toISOString().split("T")[0];
                const dayWO = workOrders.filter((w: any) => w.scheduledDate === dateStr);

                return (
                  <div key={idx} className="p-2 border-r border-b border-slate-800 bg-slate-950/45 min-h-[90px] text-left flex flex-col justify-between hover:bg-slate-900/10">
                    <span className={`text-[10px] font-bold ${dateStr === new Date().toISOString().split("T")[0] ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {date.getDate()}
                    </span>
                    <div className="space-y-1 mt-1 flex-1 overflow-y-auto">
                      {dayWO.map((w: any) => (
                        <div
                          key={w._id}
                          className={`text-[8px] px-1 py-0.5 rounded truncate font-sans text-slate-200 border ${
                            w.type === "emergency" ? "bg-red-950/40 border-red-500/30" :
                            w.type === "corrective" ? "bg-orange-950/40 border-orange-500/30" :
                            w.type === "predictive" ? "bg-purple-950/40 border-purple-500/30" :
                            "bg-slate-900 border-slate-800"
                          }`}
                        >
                          {w.title}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* TECHNICIAN WORKLOAD BALANCER */}
        {activeSubTab === "technicians" && (
          <motion.div
            key="technicians"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Workload balancing bar list */}
            <div className="border border-slate-800 bg-slate-900/10 backdrop-blur-md rounded-lg p-5">
              <h2 className="text-sm font-semibold uppercase tracking-wider font-mono text-white mb-4">
                Active Workload Balancing
              </h2>
              <div className="space-y-5">
                {technicians.map((t: any) => (
                  <div key={t._id} className="space-y-1.5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          t.status === "active" ? "bg-emerald-400" :
                          t.status === "on_leave" ? "bg-slate-600" : "bg-amber-400"
                        }`} />
                        {t.name}
                      </span>
                      <span className="font-mono text-slate-400">{t.workload} Active Jobs</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          t.workload > 3 ? "bg-red-500" : t.workload > 1 ? "bg-amber-500" : "bg-emerald-500"
                        }`}
                        style={{ width: `${Math.min(100, (t.workload / 5) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Technicians Skills and Status Table */}
            <div className="border border-slate-800 bg-slate-900/10 backdrop-blur-md rounded-lg p-5">
              <h2 className="text-sm font-semibold uppercase tracking-wider font-mono text-white mb-4">
                Technician Registry & Skillsets
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-mono">
                      <th className="pb-2">Technician</th>
                      <th className="pb-2">Status</th>
                      <th className="pb-2">Primary Competencies</th>
                    </tr>
                  </thead>
                  <tbody>
                    {technicians.map((t: any) => (
                      <tr key={t._id} className="border-b border-slate-900 hover:bg-slate-900/10">
                        <td className="py-2.5 font-semibold text-slate-300">{t.name}</td>
                        <td className="py-2.5">
                          <span className={`text-[9px] font-mono px-2 py-0.5 rounded border uppercase ${
                            t.status === "active" ? "bg-emerald-500/5 text-emerald-400 border-emerald-500/20" :
                            t.status === "on_leave" ? "bg-slate-900 text-slate-500 border-slate-800" :
                            "bg-amber-500/5 text-amber-400 border-amber-500/20"
                          }`}>
                            {t.status}
                          </span>
                        </td>
                        <td className="py-2.5">
                          <div className="flex flex-wrap gap-1">
                            {t.skills.map((s: string) => (
                              <span key={s} className="text-[9px] bg-slate-900 text-slate-400 border border-slate-800 px-1.5 py-0.5 rounded font-mono">
                                {s}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CREATE WORK ORDER MODAL */}
      {isCreateWOModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-900 border border-slate-800 rounded-lg p-5 w-full max-w-lg space-y-4 shadow-2xl text-xs text-slate-300"
          >
            <h3 className="text-sm font-semibold uppercase tracking-wider font-mono text-white">Create corrective/preventive dispatch</h3>
            <form onSubmit={handleCreateWOSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400">Target Plant</label>
                  <select
                    value={newWOPlantId}
                    onChange={(e) => {
                      setNewWOPlantId(e.target.value);
                      const pAssets = assets.filter((a: any) => a.plantId === e.target.value);
                      if (pAssets.length > 0) setNewWOAssetId(pAssets[0]._id);
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                  >
                    {plants.map((p: any) => <option key={p._id} value={p._id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400">Target Equipment / Asset</label>
                  <select
                    value={newWOAssetId}
                    onChange={(e) => setNewWOAssetId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                  >
                    {assets.filter((a: any) => a.plantId === newWOPlantId).map((a: any) => (
                      <option key={a._id} value={a._id}>{a.name} ({a.serialNumber})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400">Work Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Inverter switch board replacements"
                  value={newWOTitle}
                  onChange={(e) => setNewWOTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400">Task Descriptions & Directives</label>
                <textarea
                  placeholder="Details of calibration, parts needed..."
                  value={newWODesc}
                  onChange={(e) => setNewWODesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white h-20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400">Work Order Type</label>
                  <select
                    value={newWOType}
                    onChange={(e: any) => setNewWOType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                  >
                    <option value="preventive">Preventive</option>
                    <option value="corrective">Corrective</option>
                    <option value="predictive">Predictive</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400">Priority Tier</label>
                  <select
                    value={newWOPriority}
                    onChange={(e: any) => setNewWOPriority(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical / Emergency</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400">Scheduled Date</label>
                  <input
                    type="date"
                    value={newWODate}
                    onChange={(e) => setNewWODate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400">Estimated Hours</label>
                  <input
                    type="number"
                    value={newWOHours}
                    onChange={(e) => setNewWOHours(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400">Assign Technician</label>
                  <select
                    value={newWOTech}
                    onChange={(e) => setNewWOTech(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                  >
                    <option value="">Unassigned (Pool Queue)</option>
                    {technicians.filter((t: any) => t.status === "active").map((t: any) => (
                      <option key={t._id} value={t.name}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateWOModalOpen(false)}
                  className="px-4 py-2 border border-slate-800 bg-slate-950 text-slate-400 hover:text-white rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded"
                >
                  Dispatch
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* CLOSE WORK ORDER MODAL */}
      {isCloseWOModalOpen && selectedWOForClosing && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-900 border border-slate-800 rounded-lg p-5 w-full max-w-md space-y-4 shadow-2xl text-xs text-slate-300"
          >
            <h3 className="text-sm font-semibold uppercase tracking-wider font-mono text-white flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-400" /> Complete Work Order
            </h3>
            
            <div>
              <p className="font-semibold text-slate-200">{selectedWOForClosing.title}</p>
              <p className="text-[10px] text-slate-400">{selectedWOForClosing.assetName}</p>
            </div>

            <form onSubmit={handleCloseWOSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400">Actual Labor Hours</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={closeActualHours}
                    onChange={(e) => setCloseActualHours(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400">Labor Cost ($)</label>
                  <input
                    type="number"
                    required
                    value={closeLaborCost}
                    onChange={(e) => setCloseLaborCost(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400">Asset Downtime Hours</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={closeDowntime}
                    onChange={(e) => setCloseDowntime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400">Spare Part Consumed</label>
                  <select
                    value={selectedPart}
                    onChange={(e) => setSelectedPart(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                  >
                    <option value="">None Used</option>
                    <option value="300A Substation Inverter Fuse">300A Inverter Fuse ($120)</option>
                    <option value="Cooling Fan Air Filter Panel">Air Filter Panel ($45)</option>
                    <option value="Substation Sub-transformer Seal Ring">Transformer Seal Ring ($85)</option>
                    <option value="Wind Yaw Pinion Drive Bearing">Yaw Bearing ($450)</option>
                    <option value="BESS HVAC Exchanger Pump Motor">HVAC Pump Motor ($350)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCloseWOModalOpen(false)}
                  className="px-4 py-2 border border-slate-800 bg-slate-950 text-slate-400 hover:text-white rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded"
                >
                  Save & Close WO
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
