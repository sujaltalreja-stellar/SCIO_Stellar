import React, { useState } from "react";
import { useQuery, useMutation } from "../../lib/convex";
import { api } from "../../lib/convex";
import {
  LayoutDashboard,
  Map,
  Layers,
  Cpu,
  AlertTriangle,
  CloudSun,
  FileText,
  History,
  ChevronLeft,
  ChevronRight,
  Bell,
  Activity,
  Check,
  Settings,
  Radio,
  Brain,
  Wrench,
  ShoppingCart,
  Warehouse,
  DollarSign,
  RefreshCw,
  Sun,
  Moon,
  Sparkles,
  TrendingUp,
  Boxes,
  Leaf,
  BarChart3,
  MessageSquare,
  PieChart,
  Plug
} from "lucide-react";

interface AppLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function AppLayout({ children, activeTab, setActiveTab }: AppLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    if (nextTheme === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
  };
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const stats = useQuery(api.plants.getPortfolioStats);
  const notifications = useQuery(api.alarms.getNotifications, { limit: 8 }) ?? [];
  const markAllRead = useMutation(api.alarms.markAllNotificationsRead);
  const markRead = useMutation(api.alarms.markNotificationRead);

  const unreadCount = notifications.filter((n: any) => !n.read).length;

  const menuItems = [
    { id: "dashboard", label: "Executive Portfolio", icon: LayoutDashboard },
    { id: "map", label: "GIS Operations Map", icon: Map },
    { id: "plants", label: "Plant Management", icon: Layers },
    { id: "assets", label: "Asset Registry", icon: Cpu },
    { id: "ai-ops", label: "AI Operations", icon: Brain },
    { id: "field-ops", label: "Field Operations", icon: Wrench },
    { id: "inspections", label: "Inspections Hub", icon: FileText },
    { id: "erp-sync", label: "ERP Management", icon: RefreshCw },
    { id: "alarms", label: "Alarm Console", icon: AlertTriangle, badge: stats?.activeAlarmsCount },
    { id: "weather", label: "Weather Monitor", icon: CloudSun },
    { id: "reports", label: "Analytics & Reports", icon: FileText },
    { id: "audit", label: "Audit Trail", icon: History },
  ];

  return (
    <div className="min-h-screen bg-[#07070a] text-zinc-100 flex flex-col font-sans cyber-grid selection:bg-emerald-500 selection:text-black">
      {/* HEADER Telemetry Banner */}
      <header className="bg-zinc-950/80 border-b border-zinc-900 sticky top-0 z-40 backdrop-blur-md px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
            <Activity className="h-6 w-6 text-emerald-500 animate-pulse" />
          </div>
          <div>
            <h1 className="text-md font-bold tracking-wider text-zinc-100 flex items-center gap-2">
              AETHERIS <span className="text-emerald-500 text-xs font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">RENEWABLES</span>
            </h1>
            <p className="text-[10px] text-zinc-500 tracking-widest font-mono">OPERATIONS CONTROL CENTER</p>
          </div>
        </div>

        {/* Live System Metrics Banner */}
        <div className="hidden lg:flex items-center space-x-8 text-xs font-mono">
          <div className="flex flex-col">
            <span className="text-[9px] text-zinc-500 uppercase tracking-wider">Total Portfolio Capacity</span>
            <span className="text-sm font-semibold text-zinc-100">
              {stats?.totalCapacity ? (stats.totalCapacity / 1000).toFixed(2) : "0.00"} GW
            </span>
          </div>
          <div className="flex flex-col border-l border-zinc-900 pl-8">
            <span className="text-[9px] text-zinc-500 uppercase tracking-wider">Live Power Output</span>
            <span className="text-sm font-semibold text-emerald-400 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {stats?.totalLivePower ? stats.totalLivePower.toLocaleString(undefined, { maximumFractionDigits: 1 }) : "0.0"} MW
            </span>
          </div>
          <div className="flex flex-col border-l border-zinc-900 pl-8">
            <span className="text-[9px] text-zinc-500 uppercase tracking-wider">Capacity Factor Avg</span>
            <span className="text-sm font-semibold text-sky-400">
              {stats?.totalLivePower && stats?.totalCapacity 
                ? ((stats.totalLivePower / stats.totalCapacity) * 100).toFixed(1)
                : "0.0"}%
            </span>
          </div>
          <div className="flex flex-col border-l border-zinc-900 pl-8">
            <span className="text-[9px] text-zinc-500 uppercase tracking-wider">Active Alarms</span>
            <span className={`text-sm font-semibold flex items-center gap-1.5 ${
              (stats?.activeAlarmsCount ?? 0) > 0 ? "text-red-500 font-bold" : "text-zinc-500"
            }`}>
              {stats?.activeAlarmsCount ?? 0} active
            </span>
          </div>
        </div>

        {/* Simulator Pulse + Notification Bell */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-[10px] font-mono bg-zinc-900/60 border border-zinc-800 px-3 py-1.5 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-zinc-400">SCADA FEED: LIVE</span>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 rounded-lg transition-all"
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {theme === "dark" ? <Sun className="h-5 w-5 text-amber-500" /> : <Moon className="h-5 w-5 text-indigo-400" />}
          </button>

          {/* Bell button */}
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 rounded-lg transition-all"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 animate-pulse-glow-red"></span>
            )}
          </button>

          <div className="h-8 w-8 rounded-full border border-zinc-800 bg-zinc-900 flex items-center justify-center text-xs font-mono font-semibold text-emerald-500">
            OP
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* SIDEBAR Collapsible Panel */}
        <aside
          className={`bg-zinc-950 border-r border-zinc-900 transition-all duration-300 flex flex-col justify-between z-30 ${
            sidebarCollapsed ? "w-16" : "w-64"
          }`}
        >
          <div className="py-4 px-3 flex-1 flex flex-col space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id || (activeTab === "plant-detail" && item.id === "plants");
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center p-3 rounded-lg text-sm transition-all group ${
                    isActive
                      ? "bg-zinc-900 border border-zinc-800 text-zinc-100 font-semibold"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40 border border-transparent"
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 flex-shrink-0 transition-transform group-hover:scale-105 ${
                      isActive ? "text-emerald-500" : "text-zinc-500"
                    }`}
                  />
                  {!sidebarCollapsed && (
                    <span className="ml-3 truncate">{item.label}</span>
                  )}
                  {!sidebarCollapsed && item.badge !== undefined && item.badge > 0 && (
                    <span className="ml-auto bg-red-500/10 text-red-500 border border-red-500/20 text-[10px] font-bold font-mono px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}


          </div>

          <div className="p-3 border-t border-zinc-900">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="w-full flex items-center justify-center p-2 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 transition-all"
            >
              {sidebarCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            </button>
          </div>
        </aside>

        {/* MAIN PANEL CONTENT AREA */}
        <main className="flex-1 overflow-y-auto bg-zinc-950/30 p-6">
          {children}
        </main>
      </div>

      {/* NOTIFICATIONS PANEL Drawer Overlay */}
      {notificationsOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
            onClick={() => setNotificationsOpen(false)}
          />
          <div className="fixed right-0 top-0 bottom-0 w-96 bg-zinc-950 border-l border-zinc-900 shadow-2xl z-50 flex flex-col p-6 overflow-hidden">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-4 mb-4">
              <div className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-emerald-500" />
                <h2 className="font-semibold text-lg">System Events</h2>
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllRead()}
                  className="text-xs text-emerald-500 hover:text-emerald-400 font-mono flex items-center gap-1 border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-1 rounded"
                >
                  <Check className="h-3 w-3" /> Dismiss All
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {notifications.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-zinc-500">
                  <Check className="h-8 w-8 mb-2 opacity-50" />
                  <p className="text-sm">No new operational alerts</p>
                </div>
              ) : (
                notifications.map((n: any) => (
                  <div
                    key={n._id}
                    onClick={() => {
                      if (!n.read) markRead({ notificationId: n._id });
                    }}
                    className={`p-3.5 rounded-lg border text-xs transition-all relative ${
                      !n.read 
                        ? "bg-zinc-900/60 border-zinc-800 hover:bg-zinc-900 cursor-pointer" 
                        : "bg-zinc-950 border-zinc-950 opacity-60"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1.5">
                      <span className={`px-2 py-0.5 rounded-[4px] text-[10px] font-mono font-bold uppercase tracking-wider border ${
                        n.type === "alarm" && n.severity === "critical"
                          ? "bg-red-500/10 text-red-500 border-red-500/20"
                          : n.type === "alarm" && n.severity === "high"
                          ? "bg-orange-500/10 text-orange-500 border-orange-500/20"
                          : n.type === "maintenance"
                          ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                          : n.type === "weather"
                          ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                          : "bg-zinc-800/10 text-zinc-400 border-zinc-800"
                      }`}>
                        {n.type}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {new Date(n.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <h3 className="font-semibold text-zinc-200 mb-1 leading-snug">{n.title}</h3>
                    <p className="text-zinc-400 leading-normal">{n.message}</p>
                    {!n.read && (
                      <span className="absolute top-4 right-4 h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
