"use client";

import React, { useState } from "react";
import {
  X,
  Bot,
  Send,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  BarChart3,
  Flame,
  ArrowRight,
  Activity,
  Check
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";

interface Message {
  id: string;
  sender: "user" | "copilot";
  text: string;
  timestamp: string;
  visual?: {
    type: "trend" | "pareto" | "risk_matrix" | "work_order_action";
    title: string;
    data?: any[];
    actionPayload?: {
      woNumber: string;
      assetName: string;
      priority: string;
      estimatedCost: string;
      assignedTeam: string;
    };
  };
}

interface GenerativeVisualCopilotProps {
  isOpen: boolean;
  onClose: () => void;
  currentIndustry: string;
  onNavigateTab?: (tab: string) => void;
}

export default function GenerativeVisualCopilot({
  isOpen,
  onClose,
  currentIndustry,
  onNavigateTab
}: GenerativeVisualCopilotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "msg-1",
      sender: "copilot",
      text: "Stellar SCIO AI Copilot online. I can help answer questions about your operations, equipment health, and supply chain. Ask any question or pick a prompt below.",
      timestamp: "Just now"
    }
  ]);
  const [inputQuery, setInputQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [dispatchedOrders, setDispatchedOrders] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleSend = async (queryText?: string) => {
    const query = queryText || inputQuery;
    if (!query.trim()) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery("");
    setIsLoading(true);

    try {
      // Call /api/copilot backend
      const res = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, industry: currentIndustry })
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch (err) {
        console.warn("Failed to parse JSON response", err);
      }

      let responseText = data.text || "";
      let visual: Message["visual"] | undefined;

      const lowerQ = query.toLowerCase();
      const ind = (currentIndustry || "energy").toLowerCase();
      const isMfg = ind.includes("manufactur") || ind.includes("factory");
      const isMar = ind.includes("maritime") || ind.includes("ship");
      const isLog = ind.includes("logistics") || ind.includes("cold");

      if (lowerQ.includes("temp") || lowerQ.includes("thermal") || lowerQ.includes("curve") || lowerQ.includes("trend")) {
        if (!responseText) {
          if (isMfg) {
            responseText = "Retrieved 24-hour thermal telemetry for CNC Spindle Bearing #2 and Robot Arm Joint 3. Peak temperature reached 82.1°C during Shift 2 high-speed milling.";
          } else if (isMar) {
            responseText = "Retrieved 24-hour exhaust gas thermal telemetry from Vessel SCIO Leader Main Cylinder #4. Peak exhaust temperature recorded at 398°C.";
          } else if (isLog) {
            responseText = "Retrieved 24-hour temperature telemetry across Reefer Container #RC-804. Core cargo temperature maintained between -21.4°C and -18.2°C.";
          } else {
            responseText = "Retrieved 24-hour thermal telemetry from Inverter Array 04 and Transformer TX-01. Thermal hotspot peaked at 88.4°C during peak noon solar output.";
          }
        }
        visual = {
          type: "trend",
          title: isMfg ? "CNC Spindle Temp Telemetry (°C)" : isMar ? "Main Engine Exhaust Temp (°C)" : isLog ? "Cold-Chain Reefer Temp (°C)" : "24-Hour Thermal Telemetry (°C)",
          data: [
            { time: "00:00", temp: 42, threshold: 75 },
            { time: "04:00", temp: 39, threshold: 75 },
            { time: "08:00", temp: 58, threshold: 75 },
            { time: "12:00", temp: isLog ? -18.4 : 88.4, threshold: 75 },
            { time: "16:00", temp: isLog ? -19.1 : 79.2, threshold: 75 },
            { time: "20:00", temp: isLog ? -20.2 : 55, threshold: 75 },
            { time: "23:00", temp: isLog ? -21.0 : 46, threshold: 75 }
          ]
        };
      } else if (lowerQ.includes("downtime") || lowerQ.includes("loss") || lowerQ.includes("pareto") || lowerQ.includes("oee")) {
        if (!responseText) {
          if (isMfg) {
            responseText = "Calculated OEE downtime root-cause breakdown. Tooling wear changeovers and feeder jams account for 61.4% ($42,100 USD) of total shopfloor downtime.";
          } else if (isMar) {
            responseText = "Calculated vessel delay root-cause breakdown. Fuel injector fouling and port congestion account for 54.8% ($36,000 USD) of total fleet delays.";
          } else if (isLog) {
            responseText = "Calculated supply chain delay root-cause breakdown. Cold-chain reefer defrost cycles account for 48.2% ($29,800 USD) of transit variance.";
          } else {
            responseText = "Calculated OEE downtime root-cause breakdown. Hydraulic line pressure drops account for 58.2% ($48,200 USD) of total recorded downtime.";
          }
        }
        visual = {
          type: "pareto",
          title: "Downtime Financial Loss Pareto ($ USD)",
          data: isMfg
            ? [
                { cause: "Tooling Wear & Jam", loss: 42100 },
                { cause: "CNC Spindle Vibration", loss: 28400 },
                { cause: "Conveyor Stoppage", loss: 14200 },
                { cause: "Sensor Misalignment", loss: 6800 }
              ]
            : isMar
            ? [
                { cause: "Fuel Injector Clog", loss: 36000 },
                { cause: "Sea Water Pump Leak", loss: 22100 },
                { cause: "Turbocharger Surging", loss: 11500 },
                { cause: "Valve Clearance Drift", loss: 5400 }
              ]
            : isLog
            ? [
                { cause: "Reefer Compressor Defrost", loss: 29800 },
                { cause: "Door Seal Excursion", loss: 18200 },
                { cause: "Route Port Delay", loss: 9400 },
                { cause: "Battery Telematics Drop", loss: 4100 }
              ]
            : [
                { cause: "Hydraulic Seal Leak", loss: 48200 },
                { cause: "Bearing Vibration", loss: 24500 },
                { cause: "Grid Curtailment", loss: 16800 },
                { cause: "Sensor Drift", loss: 8900 }
              ]
        };
      } else if (lowerQ.includes("risk") || lowerQ.includes("high-risk") || lowerQ.includes("asset")) {
        if (!responseText) {
          responseText = `Identified critical ${isMfg ? "robotic and CNC" : isMar ? "vessel engine" : isLog ? "cold-chain reefer" : "power grid"} assets exceeding normal operational risk boundaries.`;
        }
        visual = {
          type: "risk_matrix",
          title: "Top Monitored Risk Assets",
          data: isMfg
            ? [
                { name: "Robotic Arm Joint 3", score: 88, status: "Critical", metric: "4.2 mm/s RMS" },
                { name: "CNC Spindle Bearing #2", score: 79, status: "High Risk", metric: "82.1°C Hotspot" },
                { name: "Conveyor Motor B4", score: 65, status: "Warning", metric: "Current +18%" },
                { name: "Hydraulic Press Line 1", score: 42, status: "Moderate", metric: "Oil Viscosity Normal" }
              ]
            : isMar
            ? [
                { name: "Vessel SCIO Main Engine", score: 88, status: "Critical", metric: "Cyl #4 Temp 398°C" },
                { name: "Purifier Unit 2", score: 79, status: "High Risk", metric: "Vibration 3.6 mm/s" },
                { name: "Aux Generator 3", score: 65, status: "Warning", metric: "Oil Pressure Low" },
                { name: "Bunker Transfer Pump", score: 42, status: "Moderate", metric: "Flow Rate Nominal" }
              ]
            : isLog
            ? [
                { name: "Reefer Unit #RC-804", score: 88, status: "Critical", metric: "Temp Delta +3.4°C" },
                { name: "Cold Room Compressor 2", score: 79, status: "High Risk", metric: "Freon Pressure High" },
                { name: "Loading Dock Chiller", score: 65, status: "Warning", metric: "Door Open Alert" },
                { name: "Fleet Telematics #12", score: 42, status: "Moderate", metric: "Battery 92%" }
              ]
            : [
                { name: "Turbine Feed Valve B", score: 88, status: "Critical", metric: "3.8 mm/s RMS" },
                { name: "Inverter Array 04", score: 79, status: "High Risk", metric: "88.4°C Hotspot" },
                { name: "BESS Inverter Rack 2", score: 65, status: "Warning", metric: "Coolant Flow -14%" },
                { name: "Step-Up Transformer", score: 42, status: "Moderate", metric: "Oil DGA Normal" }
              ]
        };
      } else if (lowerQ.includes("work order") || lowerQ.includes("draft") || lowerQ.includes("fix") || lowerQ.includes("dispatch")) {
        if (!responseText) {
          responseText = "Synthesized automated corrective work order based on telemetry alarms. Review parameters below and dispatch to field crews with 1 click.";
        }
        visual = {
          type: "work_order_action",
          title: "Generated Corrective Work Order",
          actionPayload: {
            woNumber: `WO-${Math.floor(1000 + Math.random() * 9000)}`,
            assetName: isMfg ? "CNC Spindle Bearing #2" : isMar ? "Main Engine Fuel Injector #4" : isLog ? "Reefer Compressor Unit RC-804" : "High-Pressure Hydraulic Valve Seal (Unit 4)",
            priority: "CRITICAL",
            estimatedCost: isMfg ? "$2,850 USD" : isMar ? "$4,200 USD" : isLog ? "$1,950 USD" : "$3,450 USD",
            assignedTeam: isMfg ? "Plant Maintenance Crew Beta" : isMar ? "Shipboard Technical Engineers" : isLog ? "Cold-Chain Logistics Response" : "Rapid Mechanical Response Alpha"
          }
        };
      } else {
        if (!responseText) {
          responseText = "Operational intelligence analysis complete across SCADA streams.";
        }
      }

      const copilotMsg: Message = {
        id: `copilot-${Date.now()}`,
        sender: "copilot",
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        visual
      };

      setMessages((prev) => [...prev, copilotMsg]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDispatchWO = (woNumber: string) => {
    setDispatchedOrders((prev) => [...prev, woNumber]);
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[480px] bg-[#07090f] border-l border-slate-700/80 shadow-[0_0_60px_rgba(0,0,0,0.9)] flex flex-col z-50 font-sans">
      
      {/* Top Header */}
      <div className="h-16 px-5 border-b border-slate-800 bg-[#0a0d17] flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 p-[1.5px] shadow-[0_0_15px_rgba(0,240,255,0.3)]">
            <div className="h-full w-full bg-[#07090f] rounded-[9px] flex items-center justify-center text-cyan-400">
              <Bot className="h-5 w-5" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-white font-mono">SCIO AI COPILOT</h3>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                VISUAL GEN-UI
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Operational Diagnosis & Visual Analytics</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg border border-slate-800 hover:border-slate-600 text-slate-400 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Suggested Prompt Chips */}
      <div className="px-4 py-2.5 bg-[#090c16] border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto no-scrollbar text-[11px] font-mono">
        <span className="text-[10px] text-slate-500 uppercase font-bold flex-shrink-0">PROMPTS:</span>
        <button
          onClick={() => handleSend("Show 24h Inverter Thermal Curve")}
          className="px-2.5 py-1 rounded-lg bg-[#0e1220] hover:bg-[#151c32] border border-slate-700/80 text-cyan-300 flex-shrink-0 transition-all"
        >
          📈 Thermal Curve
        </button>
        <button
          onClick={() => handleSend("OEE Downtime Loss Pareto")}
          className="px-2.5 py-1 rounded-lg bg-[#0e1220] hover:bg-[#151c32] border border-slate-700/80 text-purple-300 flex-shrink-0 transition-all"
        >
          📊 Downtime Pareto
        </button>
        <button
          onClick={() => handleSend("Top High-Risk Assets Breakdown")}
          className="px-2.5 py-1 rounded-lg bg-[#0e1220] hover:bg-[#151c32] border border-slate-700/80 text-rose-300 flex-shrink-0 transition-all"
        >
          ⚠️ Risk Matrix
        </button>
        <button
          onClick={() => handleSend("Draft Corrective Work Order for Valve Seal")}
          className="px-2.5 py-1 rounded-lg bg-[#0e1220] hover:bg-[#151c32] border border-slate-700/80 text-emerald-300 flex-shrink-0 transition-all"
        >
          🛠️ Draft Work Order
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4 font-mono text-xs">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
          >
            <div
              className={`max-w-[90%] p-4 rounded-2xl space-y-3 ${
                m.sender === "user"
                  ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-none shadow-md font-sans"
                  : "bg-[#0d101a] border border-slate-700/80 text-slate-200 rounded-bl-none shadow-xl font-sans"
              }`}
            >
              {m.sender === "copilot" && (
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-cyan-400 font-bold">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>SCIO AI SYNTHESIS</span>
                </div>
              )}

              <p className="text-xs leading-relaxed">{m.text}</p>

              {/* DYNAMIC EMBEDDED VISUALIZATION */}
              {m.visual && (
                <div className="mt-3 p-3.5 rounded-xl bg-[#06080e] border border-slate-700/80 font-mono space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-[11px] font-bold text-slate-200">{m.visual.title}</span>
                    <span className="text-[9px] text-cyan-400 font-bold uppercase">LIVE GENERATIVE UI</span>
                  </div>

                  {/* 1. Thermal Curve Area Chart */}
                  {m.visual.type === "trend" && m.visual.data && (
                    <div className="h-44 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={m.visual.data}>
                          <defs>
                            <linearGradient id="copilotTempGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.4} />
                              <stop offset="95%" stopColor="#00f0ff" stopOpacity={0.0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                          <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 9 }} />
                          <YAxis stroke="#64748b" tick={{ fontSize: 9 }} domain={[30, 100]} />
                          <Tooltip
                            contentStyle={{ backgroundColor: "#090c14", borderColor: "#334155", fontSize: "10px" }}
                          />
                          <Area type="monotone" dataKey="temp" stroke="#00f0ff" strokeWidth={2} fill="url(#copilotTempGrad)" name="Temperature (°C)" />
                          <Area type="monotone" dataKey="threshold" stroke="#ef4444" strokeWidth={1} strokeDasharray="3 3" fill="none" name="Critical Trip Limit" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* 2. Downtime Pareto Bar Chart */}
                  {m.visual.type === "pareto" && m.visual.data && (
                    <div className="h-44 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={m.visual.data} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                          <XAxis type="number" stroke="#64748b" tick={{ fontSize: 9 }} />
                          <YAxis dataKey="cause" type="category" stroke="#64748b" tick={{ fontSize: 8 }} width={100} />
                          <Tooltip
                            contentStyle={{ backgroundColor: "#090c14", borderColor: "#334155", fontSize: "10px" }}
                            formatter={(value: any) => [`$${value.toLocaleString()} USD`, "Financial Loss"]}
                          />
                          <Bar dataKey="loss" fill="#a855f7" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* 3. High Risk Matrix */}
                  {m.visual.type === "risk_matrix" && m.visual.data && (
                    <div className="space-y-2">
                      {m.visual.data.map((item, idx) => (
                        <div key={idx} className="p-2 rounded bg-[#090c14] border border-slate-800 flex items-center justify-between text-[11px]">
                          <div>
                            <span className="font-bold text-white block">{item.name}</span>
                            <span className="text-[10px] text-slate-400">{item.metric}</span>
                          </div>
                          <div className="text-right">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                              item.status === "Critical" ? "bg-rose-500/20 text-rose-300 border border-rose-500/30" :
                              item.status === "High Risk" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" :
                              "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                            }`}>
                              {item.status} ({item.score}%)
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 4. Automated Work Order Action */}
                  {m.visual.type === "work_order_action" && m.visual.actionPayload && (
                    <div className="p-3 rounded-lg bg-[#0a0d16] border border-emerald-500/30 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-emerald-400 font-bold text-xs">{m.visual.actionPayload.woNumber}</span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] bg-rose-500/20 text-rose-300 font-bold">
                          {m.visual.actionPayload.priority}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-200">
                        <strong>Asset:</strong> {m.visual.actionPayload.assetName}
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>Est. Cost: <strong className="text-white">{m.visual.actionPayload.estimatedCost}</strong></span>
                        <span>Team: <strong className="text-white">{m.visual.actionPayload.assignedTeam}</strong></span>
                      </div>

                      {dispatchedOrders.includes(m.visual.actionPayload.woNumber) ? (
                        <div className="w-full py-2 rounded bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 font-bold text-center text-xs flex items-center justify-center gap-1.5">
                          <Check className="h-4 w-4" />
                          <span>Dispatched to Field Crew</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleDispatchWO(m.visual!.actionPayload!.woNumber)}
                          className="w-full py-2 rounded bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-1.5"
                        >
                          <span>Execute 1-Click Dispatch →</span>
                        </button>
                      )}
                    </div>
                  )}

                </div>
              )}
            </div>
            <span className="text-[9px] text-slate-500 mt-1 px-1">{m.timestamp}</span>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 p-3 bg-[#0d101a] border border-slate-800 rounded-xl max-w-[70%]">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-xs text-slate-400">Synthesizing telemetry & generating visual model...</span>
          </div>
        )}
      </div>

      {/* Input Bar */}
      <div className="p-4 border-t border-slate-800 bg-[#0a0d17]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask about thermal curves, downtime pareto, or work orders..."
            className="flex-1 px-3.5 py-2.5 bg-[#06080e] border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 font-mono focus:border-cyan-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={isLoading || !inputQuery.trim()}
            className="p-2.5 rounded-xl bg-gradient-to-b from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 disabled:opacity-50 text-slate-950 font-bold shadow-md transition-all"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>

    </div>
  );
}
