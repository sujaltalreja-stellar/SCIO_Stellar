import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, api } from "@/lib/convex";
import {
  Brain,
  Cpu,
  AlertTriangle,
  Wrench,
  CheckCircle,
  Clock,
  Sparkles,
  Send,
  User,
  Activity,
  ArrowRight,
  TrendingDown,
  Gauge,
  Database,
  TrendingUp,
  Boxes,
  Leaf,
  BarChart3,
  MessageSquare,
  PieChart,
  Plug
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from "recharts";

import AIIntelligenceCenter from "../intelligence/AIIntelligenceCenter";
import ForecastingEngine from "../forecasting/ForecastingEngine";
import DigitalTwinHub from "../digitaltwin/DigitalTwinHub";
import ESGSustainabilityHub from "../esg/ESGSustainabilityHub";
import PortfolioIntelligence from "../portfolio/PortfolioIntelligence";
import AIExecutiveCopilot from "../copilot/AIExecutiveCopilot";
import BusinessIntelligence from "../bi/BusinessIntelligence";
import IntegrationCenter from "../integrations/IntegrationCenter";

interface Message {
  id: string;
  sender: "user" | "copilot";
  text: string;
  timestamp: Date;
  tableData?: any[];
  tableHeaders?: string[];
}

export default function AIOpsControl() {
  const summary = useQuery(api.aiInsights.getSummary);
  const insights = useQuery(api.aiInsights.list);
  const plants = useQuery(api.plants.list);
  const alarms = useQuery(api.alarms.list);
  const workOrders = useQuery(api.workOrders.list);
  const inspections = useQuery(api.inspections.list);

  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "copilot",
      text: "Aetheris AI Operations Copilot online. How can I assist you with operational diagnostics, asset risks, or maintenance summaries today?",
      timestamp: new Date()
    }
  ]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const [isTyping, setIsTyping] = useState(false);

  // NLP query parser simulating real-time agent execution over Convex collections
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userQuery = chatInput.trim();
    const newMsg: Message = {
      id: `usr_${Date.now()}`,
      sender: "user",
      text: userQuery,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, newMsg]);
    setChatInput("");
    setIsTyping(true);

    try {
      const apiKey = (import.meta as any).env.VITE_MISTRAL_API_KEY;
      if (apiKey) {
        // Build live context prompt for Mistral
        const contextText = `You are Aetheris AI Operations Copilot. Answer user queries based on this real-time data:
- Plants: ${JSON.stringify((plants ?? []).map((p: any) => ({ name: p.name, type: p.type, capacity: p.capacity, health: p.healthScore, status: p.status })))}
- High Risk Assets: ${JSON.stringify((summary?.highRiskAssets ?? []).map((h: any) => ({ name: h.assetName, plant: h.plantName, failProb: h.failureProbability, RUL: h.remainingUsefulLife })))}
- Active Alarms: ${JSON.stringify((alarms ?? []).filter((a: any) => a.status === "active").map((a: any) => ({ plant: a.plantName, message: a.message, severity: a.severity })))}
- Work Orders: ${JSON.stringify((workOrders ?? []).map((w: any) => ({ title: w.title, asset: w.assetName, status: w.status, tech: w.assignedTechnician })))}

Respond concisely and professionally. Use **bold** format for key metrics and parameters.`;

        const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: "mistral-large-latest",
            messages: [
              { role: "system", content: contextText },
              { role: "user", content: userQuery }
            ]
          })
        });

        const data = await res.json();
        const responseText = data.choices?.[0]?.message?.content || "No operational response received.";

        setMessages((prev) => [...prev, {
          id: `cop_${Date.now()}`,
          sender: "copilot",
          text: responseText,
          timestamp: new Date()
        }]);
      } else {
        // Fallback to local NLP
        setTimeout(() => {
          const response = processNLPQuery(userQuery);
          setMessages((prev) => [...prev, response]);
          setIsTyping(false);
        }, 600);
        return;
      }
    } catch (err) {
      console.error("Mistral API error:", err);
      // Fallback on error
      const response = processNLPQuery(userQuery);
      setMessages((prev) => [...prev, {
        ...response,
        text: `[API Fallback] ${response.text}`
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const processNLPQuery = (queryText: string): Message => {
    const q = queryText.toLowerCase();
    const replyDate = new Date();

    // 1. "Which assets require maintenance this week?"
    if (q.includes("assets require maintenance") || q.includes("maintenance this week")) {
      const activeWO = (workOrders ?? []).filter(
        (w: any) =>
          (w.status === "open" || w.status === "assigned" || w.status === "in_progress") &&
          new Date(w.scheduledDate).getTime() >= Date.now() - 2 * 24 * 3600 * 1000 &&
          new Date(w.scheduledDate).getTime() <= Date.now() + 7 * 24 * 3600 * 1000
      );

      if (activeWO.length === 0) {
        return {
          id: `cop_${Date.now()}`,
          sender: "copilot",
          text: "No pending or assigned work orders are scheduled for this week. All equipment indexes are currently stable.",
          timestamp: replyDate
        };
      }

      return {
        id: `cop_${Date.now()}`,
        sender: "copilot",
        text: `Here are the active and scheduled work orders for this week. I recommend verifying technicians' spare parts kits for these tasks:`,
        timestamp: replyDate,
        tableHeaders: ["Asset", "Work Title", "Priority", "Status", "Date"],
        tableData: activeWO.map((w: any) => ({
          Asset: w.assetName,
          "Work Title": w.title,
          Priority: w.priority.toUpperCase(),
          Status: w.status.replace("_", " ").toUpperCase(),
          Date: w.scheduledDate
        }))
      };
    }

    // 2. "Show all critical alarms from the last seven days"
    if (q.includes("critical alarms") || q.includes("alarms from the last")) {
      const criticalAlarms = (alarms ?? []).filter(
        (a: any) =>
          a.severity === "critical" &&
          a.timestamp >= Date.now() - 7 * 24 * 3600 * 1000
      );

      if (criticalAlarms.length === 0) {
        return {
          id: `cop_${Date.now()}`,
          sender: "copilot",
          text: "Excellent! There have been zero critical alarms logged in the past 7 days across all active portfolio nodes.",
          timestamp: replyDate
        };
      }

      return {
        id: `cop_${Date.now()}`,
        sender: "copilot",
        text: `I found ${criticalAlarms.length} critical alarms in the last 7 days. These require immediate supervisor oversight:`,
        timestamp: replyDate,
        tableHeaders: ["Plant", "Equipment", "Alarm Msg", "Status", "Triggered At"],
        tableData: criticalAlarms.map((a: any) => ({
          Plant: a.plantName,
          Equipment: a.assetName,
          "Alarm Msg": a.message,
          Status: a.status.toUpperCase(),
          "Triggered At": new Date(a.timestamp).toLocaleString()
        }))
      };
    }

    // 3. "Which inverter has the highest failure probability?"
    if (q.includes("highest failure probability") || q.includes("inverter") && q.includes("failure")) {
      const invInsights = (insights ?? [])
        .filter((i: any) => i.assetType === "inverter" && i.failureProbability !== undefined)
        .sort((a: any, b: any) => (b.failureProbability ?? 0) - (a.failureProbability ?? 0));

      if (invInsights.length === 0) {
        return {
          id: `cop_${Date.now()}`,
          sender: "copilot",
          text: "No anomaly projections or predictive models are reporting failure hazards on current inverters.",
          timestamp: replyDate
        };
      }

      const topInv = invInsights[0];
      return {
        id: `cop_${Date.now()}`,
        sender: "copilot",
        text: `The inverter with the highest failure probability is **${topInv.assetName}** at **${topInv.plantName}**.\n\n*   **Failure Probability**: ${topInv.failureProbability}%\n*   **RUL Forecast**: ${topInv.remainingUsefulLife} Days\n*   **Root Cause**: ${topInv.rootCauseAnalysis}\n\nI recommend dispatching a preventive diagnostic team to inspect the IGBT junction temperature gradients immediately.`,
        timestamp: replyDate
      };
    }

    // 4. "Summarize today's maintenance activities."
    if (q.includes("today's maintenance") || q.includes("maintenance activities")) {
      const todayStr = new Date().toISOString().split("T")[0];
      const todayWO = (workOrders ?? []).filter(
        (w: any) => w.scheduledDate === todayStr || w.completedDate === todayStr
      );

      if (todayWO.length === 0) {
        return {
          id: `cop_${Date.now()}`,
          sender: "copilot",
          text: "No active maintenance work orders or field compliance checklist entries are logged for today.",
          timestamp: replyDate
        };
      }

      return {
        id: `cop_${Date.now()}`,
        sender: "copilot",
        text: `Summary of maintenance tasks scheduled or finalized today:`,
        timestamp: replyDate,
        tableHeaders: ["Work Title", "Asset", "Status", "Technician", "Est. Hours"],
        tableData: todayWO.map((w: any) => ({
          "Work Title": w.title,
          Asset: w.assetName,
          Status: w.status.replace("_", " ").toUpperCase(),
          Technician: w.assignedTechnician ?? "Unassigned",
          "Est. Hours": `${w.estimatedHours} hrs`
        }))
      };
    }

    // 5. "What inspections are overdue?"
    if (q.includes("inspections are overdue") || q.includes("overdue inspections")) {
      const todayStr = new Date().toISOString().split("T")[0];
      const overdueInsp = (inspections ?? []).filter(
        (i: any) => i.status !== "completed" && i.scheduledDate < todayStr
      );

      if (overdueInsp.length === 0) {
        return {
          id: `cop_${Date.now()}`,
          sender: "copilot",
          text: "All scheduled inspections are up-to-date and compliant. No compliance actions are overdue.",
          timestamp: replyDate
        };
      }

      return {
        id: `cop_${Date.now()}`,
        sender: "copilot",
        text: `I've flagged ${overdueInsp.length} overdue safety checklists that have exceeded their target dates:`,
        timestamp: replyDate,
        tableHeaders: ["Plant", "Equipment", "Assigned Inspector", "Scheduled Date"],
        tableData: overdueInsp.map((i: any) => ({
          Plant: i.plantName,
          Equipment: i.assetName,
          "Assigned Inspector": i.inspector,
          "Scheduled Date": i.scheduledDate
        }))
      };
    }

    // 6. "Which plants have declining performance?"
    if (q.includes("declining performance") || q.includes("poor performance") || q.includes("plants") && q.includes("health")) {
      const lowHealthPlants = (plants ?? []).filter((p: any) => p.healthScore < 91);

      if (lowHealthPlants.length === 0) {
        return {
          id: `cop_${Date.now()}`,
          sender: "copilot",
          text: "All portfolio plants are running at optimal indices (Health Scores > 90%). No systemic performance declines detected.",
          timestamp: replyDate
        };
      }

      return {
        id: `cop_${Date.now()}`,
        sender: "copilot",
        text: `The following renewable energy sites are exhibiting lower health scores and declining capacity outputs due to active hardware faults:`,
        timestamp: replyDate,
        tableHeaders: ["Plant Name", "Type", "Capacity (MW)", "Health Index", "Operational Status"],
        tableData: lowHealthPlants.map((p: any) => ({
          "Plant Name": p.name,
          Type: p.type.toUpperCase(),
          "Capacity (MW)": `${p.capacity} MW`,
          "Health Index": `${p.healthScore}%`,
          "Operational Status": p.status.toUpperCase()
        }))
      };
    }

    // Default Fallback Help Message
    return {
      id: `cop_${Date.now()}`,
      sender: "copilot",
      text: `Sorry, I couldn't parse that command directly. Try asking questions like:\n\n*   *"Which assets require maintenance this week?"*\n*   *"Show all critical alarms from the last seven days."*\n*   *"Which inverter has the highest failure probability?"*\n*   *"Summarize today's maintenance activities."*\n*   *"What inspections are overdue?"*\n*   *"Which plants have declining performance?"*`,
      timestamp: replyDate
    };
  };

  const highRiskChartData = (summary?.highRiskAssets ?? []).map((h: any) => ({
    name: h.assetName.substring(0, 18) + "...",
    "Failure Prob %": h.failureProbability,
    "RUL Days": h.remainingUsefulLife,
    risk: h.riskScore
  }));

  const [activeSubTab, setActiveSubTab] = useState<string>("command-center");

  const subTabs = [
    { id: "command-center", label: "Command Center", icon: Brain },
    { id: "ai-intel", label: "AI Intelligence", icon: Sparkles },
    { id: "forecasting", label: "Forecasting Engine", icon: TrendingUp },
    { id: "digital-twin", label: "Digital Twin", icon: Boxes },
    { id: "esg", label: "ESG & Sustainability", icon: Leaf },
    { id: "portfolio", label: "Portfolio Intelligence", icon: BarChart3 },
    { id: "copilot", label: "AI Copilot", icon: MessageSquare },
    { id: "bi-analytics", label: "Business Intelligence", icon: PieChart },
    { id: "integrations", label: "Integration Center", icon: Plug },
  ];

  const renderSubTabContent = () => {
    switch (activeSubTab) {
      case "ai-intel":
        return <AIIntelligenceCenter />;
      case "forecasting":
        return <ForecastingEngine />;
      case "digital-twin":
        return <DigitalTwinHub />;
      case "esg":
        return <ESGSustainabilityHub />;
      case "portfolio":
        return <PortfolioIntelligence />;
      case "copilot":
        return <AIExecutiveCopilot />;
      case "bi-analytics":
        return <BusinessIntelligence />;
      case "integrations":
        return <IntegrationCenter />;
      case "command-center":
      default:
        return (
          <div className="space-y-6">
            {/* Header Banner */}
            <div className="flex flex-col md:flex-row md:items-center justify-between border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/10 backdrop-blur-md rounded-lg p-5 gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-500/10 p-3 rounded-lg border border-emerald-200 dark:border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)] animate-pulse">
                  <Brain className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                    AI Operations Command <span className="text-xs font-mono font-medium px-2 py-0.5 rounded border border-emerald-400/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5">Co-Pilot Core v2</span>
                  </h1>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Predictive health forecasting, anomaly telemetry analysis, and natural language copilot dispatching.
                  </p>
                </div>
              </div>

              {/* Portfolio Stats Strips */}
              <div className="flex gap-4 self-end md:self-auto">
                <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-3 rounded-lg text-right min-w-[100px] shadow-sm dark:shadow-none">
                  <p className="text-[10px] uppercase font-mono text-slate-500">Risk Index</p>
                  <p className={`text-xl font-bold ${summary?.portfolioRiskIndex > 25 ? 'text-amber-500 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {summary?.portfolioRiskIndex ?? 0}%
                  </p>
                </div>
                <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-3 rounded-lg text-right min-w-[100px] shadow-sm dark:shadow-none">
                  <p className="text-[10px] uppercase font-mono text-slate-500">Anomalies</p>
                  <p className="text-xl font-bold text-red-500 dark:text-red-400">{summary?.anomaliesCount ?? 0}</p>
                </div>
              </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              
              {/* Left 2 Columns: Dashboards & Charts */}
              <div className="xl:col-span-2 space-y-6">
                
                {/* Anomaly Dashboard */}
                <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/20 backdrop-blur-md rounded-lg p-5 shadow-sm dark:shadow-none">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-semibold tracking-wider uppercase font-mono text-slate-900 dark:text-white flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Active Predictive Anomalies
                    </h2>
                    <span className="text-xs px-2 py-0.5 rounded bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20">
                      {summary?.highRiskAssetsCount ?? 0} High Risk Assets
                    </span>
                  </div>

                  <div className="space-y-4">
                    {(summary?.highRiskAssets ?? []).slice(0, 4).map((item: any, idx: number) => (
                      <div
                        key={item.insightId}
                        className="border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-emerald-500/20 dark:hover:border-emerald-500/20 transition-all"
                      >
                        <div className="space-y-1 max-w-md">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded ${
                              item.failureProbability > 75 
                                ? 'bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/30' 
                                : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30'
                            }`}>
                              {item.failureProbability}% FAIL RISK
                            </span>
                            <span className="text-xs font-mono text-slate-500">{item.plantName}</span>
                          </div>
                          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{item.title}</h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{item.rca}</p>
                        </div>

                        <div className="flex items-center gap-6 min-w-[200px]">
                          <div className="flex-1">
                            <div className="flex justify-between text-[10px] font-mono text-slate-500 mb-1">
                              <span>RUL Remaining</span>
                              <span className="text-amber-600 dark:text-amber-400 font-bold">{item.remainingUsefulLife} Days</span>
                            </div>
                            <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  item.remainingUsefulLife < 12 ? 'bg-red-500' : 'bg-amber-500'
                                }`}
                                style={{ width: `${Math.min(100, (item.remainingUsefulLife / 40) * 100)}%` }}
                              />
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="text-[10px] uppercase font-mono text-slate-500">Risk Score</p>
                            <p className="text-sm font-bold font-mono text-slate-800 dark:text-white">{item.riskScore}%</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* RUL Charts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Failure probability breakdown */}
                  <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/20 backdrop-blur-md rounded-lg p-5 shadow-sm dark:shadow-none">
                    <h3 className="text-xs font-semibold tracking-wider uppercase font-mono text-slate-600 dark:text-slate-400 mb-4 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" /> Top Failure Risk Assets
                    </h3>
                    
                    <div className="h-[200px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={highRiskChartData} layout="vertical" margin={{ left: -10, right: 10 }}>
                          <XAxis type="number" stroke="#94a3b8" className="text-[10px] font-mono" />
                          <YAxis dataKey="name" type="category" stroke="#94a3b8" className="text-[10px] font-mono" width={80} />
                          <Tooltip
                            contentStyle={{ backgroundColor: "#020617", border: "1px solid #1e293b" }}
                            itemStyle={{ color: "#fff" }}
                          />
                          <Bar dataKey="Failure Prob %" fill="#ef4444">
                            {highRiskChartData.map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={entry["Failure Prob %"] > 75 ? "#ef4444" : "#f59e0b"} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* AI Insights and Energy Optimization List */}
                  <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/20 backdrop-blur-md rounded-lg p-5 shadow-sm dark:shadow-none">
                    <h3 className="text-xs font-semibold tracking-wider uppercase font-mono text-slate-600 dark:text-slate-400 mb-4 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Operational Insights & Recommendations
                    </h3>

                    <div className="space-y-3 max-h-[200px] overflow-y-auto pr-1">
                      {(insights ?? []).filter((i: any) => i.type === "recommendation").slice(0, 4).map((rec: any) => (
                        <div key={rec._id} className="border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 rounded p-3 text-xs space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">{rec.assetName}</span>
                            <span className="text-[9px] font-mono text-slate-500">{rec.plantName}</span>
                          </div>
                          <p className="text-slate-800 dark:text-slate-300 font-medium">{rec.title}</p>
                          <p className="text-slate-500 dark:text-slate-400 text-[11px]">{rec.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>

              {/* Right Column: AI Copilot Chat Interface */}
              <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/20 backdrop-blur-md rounded-lg flex flex-col h-[520px] shadow-sm dark:shadow-none">
                
                {/* Chat Header */}
                <div className="border-b border-slate-200 dark:border-slate-800 p-4 flex items-center gap-2">
                  <div className="bg-emerald-500/10 p-2 rounded border border-emerald-200 dark:border-emerald-500/30">
                    <Brain className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Operations Copilot</h3>
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-mono">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      ONLINE (MISTRAL API ACTIVE)
                    </p>
                  </div>
                </div>

                {/* Messages Console */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-xs">
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex gap-2.5 max-w-[85%] ${m.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                    >
                      <div className={`p-2.5 rounded-lg border ${
                        m.sender === "user" 
                          ? "bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200" 
                          : "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/50 dark:border-emerald-500/10 text-slate-700 dark:text-slate-300"
                      }`}>
                        <p className="whitespace-pre-line leading-relaxed">{m.text}</p>

                        {/* Render Table Data if present */}
                        {m.tableData && m.tableHeaders && (
                          <div className="mt-3 overflow-x-auto border border-slate-200 dark:border-slate-800 rounded bg-white dark:bg-slate-950/80">
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                                  {m.tableHeaders.map((h) => (
                                    <th key={h} className="p-1.5 text-[9px] uppercase font-mono text-slate-500 dark:text-slate-400">{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {m.tableData.map((row, rIdx) => (
                                  <tr key={rIdx} className="border-b border-slate-100 dark:border-slate-900 hover:bg-slate-50 dark:hover:bg-slate-900/20">
                                    {m.tableHeaders!.map((h) => (
                                      <td key={h} className="p-1.5 font-mono text-[10px] text-slate-700 dark:text-slate-300">{row[h]}</td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex gap-2.5 max-w-[85%] mr-auto">
                      <div className="p-2.5 rounded-lg border bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/50 dark:border-emerald-500/10 text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Quick Queries strip */}
                <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-900 flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-none">
                  <button
                    onClick={() => setChatInput("Which inverter has the highest failure probability?")}
                    className="text-[9px] font-mono border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:border-emerald-500/20 hover:text-slate-900 dark:hover:text-white px-2 py-1 rounded"
                  >
                    Highest fail inverter?
                  </button>
                  <button
                    onClick={() => setChatInput("Which assets require maintenance this week?")}
                    className="text-[9px] font-mono border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:border-emerald-500/20 hover:text-slate-900 dark:hover:text-white px-2 py-1 rounded"
                  >
                    Weekly Work Orders
                  </button>
                  <button
                    onClick={() => setChatInput("What inspections are overdue?")}
                    className="text-[9px] font-mono border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:border-emerald-500/20 hover:text-slate-900 dark:hover:text-white px-2 py-1 rounded"
                  >
                    Overdue Checklist
                  </button>
                </div>

                {/* Chat Form */}
                <form onSubmit={handleSendMessage} className="border-t border-slate-200 dark:border-slate-800 p-3 flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask Copilot (e.g. Overdue inspections?)..."
                    className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-3 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500/40"
                  />
                  <button
                    type="submit"
                    className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded px-3.5 py-2 flex items-center justify-center font-bold transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>

              </div>

            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub-tabs Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-zinc-900 pb-3">
        {subTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold font-mono tracking-wider transition-all border ${
                isActive
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.05)]"
                  : "bg-slate-100 dark:bg-zinc-950/40 border-slate-200 dark:border-zinc-900/60 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 hover:bg-slate-200 dark:hover:bg-zinc-900/40"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-zinc-500"}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="mt-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSubTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
          >
            {renderSubTabContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
