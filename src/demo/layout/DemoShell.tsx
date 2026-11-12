import React, { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  MessageSquareText,
  Boxes,
  ScanSearch,
  FileText,
  LogOut,
  ChevronDown,
  Search,
  Bell,
  Network,
  ShoppingCart,
  Wrench,
  Factory,
  BarChart3,
  Settings,
  Store,
  Barcode,
  Truck,
  ArrowLeftRight,
  Refrigerator,
  LayoutDashboard,
} from "lucide-react";
import { useRetailOptional } from "../retail/RetailContext";
import { useDemoAuth } from "../auth";
import { ScioLogo } from "./ScioLogo";
import { useDataset } from "../useDataset";
import { todaysIssues } from "../data/analytics";
import { Aurora, cx } from "../ui";
import { ThemeToggle } from "../theme";

const OPERATIONS = [
  { to: "/app/inventory", label: "Inventory", icon: Boxes },
  { to: "/app/procurement", label: "Procurement", icon: ShoppingCart },
  { to: "/app/maintenance", label: "Maintenance", icon: Wrench },
  { to: "/app/assets", label: "Assets", icon: Factory },
];

const RETAIL_OPERATIONS = [
  { to: "/app/retail/stores", label: "Stores", icon: Store },
  { to: "/app/retail/skus", label: "SKU Intelligence", icon: Barcode },
  { to: "/app/retail/replenishment", label: "Inventory & Replenishment", icon: Boxes },
  { to: "/app/retail/procurement", label: "Procurement", icon: ShoppingCart },
  { to: "/app/retail/suppliers", label: "Suppliers", icon: Truck },
  { to: "/app/retail/transfers", label: "Transfers", icon: ArrowLeftRight },
  { to: "/app/retail/maintenance", label: "Maintenance", icon: Wrench },
  { to: "/app/retail/assets", label: "Assets", icon: Refrigerator },
];

function NavItem({ to, label, icon: Icon, end, badge, sub }: { to: string; label: string; icon: typeof Home; end?: boolean; badge?: string; sub?: boolean }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cx(
          "flex items-center gap-3 rounded-xl transition",
          sub ? "py-2 pl-11 pr-3 text-[13.5px]" : "px-4 py-3 text-[15px]",
          isActive
            ? sub
              ? "bg-[#fff]/10 font-semibold text-[#fff]"
              : "bg-[#2563eb] font-semibold text-[#fff] shadow-lg shadow-blue-900/40"
            : "text-[#cbd5e1] hover:bg-[#fff]/[0.06] hover:text-[#fff]"
        )
      }
    >
      <Icon className={sub ? "h-4 w-4" : "h-5 w-5"} />
      {label}
      {badge && <span className="ml-auto rounded-md bg-[#3b82f6] px-2 py-0.5 text-[11px] font-bold text-[#fff]">{badge}</span>}
    </NavLink>
  );
}

function IndustrySwitch({ retail }: { retail: boolean }) {
  const navigate = useNavigate();
  return (
    <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1 text-[13px] font-semibold" role="tablist" aria-label="Industry">
      {(
        [
          [false, "Industrial", Factory, "/app"],
          [true, "Retail", Store, "/app/retail"],
        ] as const
      ).map(([isRetail, label, Icon, to]) => (
        <button
          key={label}
          role="tab"
          aria-selected={retail === isRetail}
          onClick={() => navigate(to)}
          className={cx("flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition", retail === isRetail ? "bg-white text-blue-700 shadow-sm ring-1 ring-slate-200" : "text-slate-500 hover:text-slate-800")}
        >
          <Icon className="h-4 w-4" />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}

function LiveClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const date = now.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Dubai" });
  const time = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Dubai" });
  return (
    <span className="hidden items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[13px] lg:flex">
      <span className="flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-700">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        Live
      </span>
      <span className="tabular-nums text-slate-600">
        {date}, {time} GST · UAE
      </span>
    </span>
  );
}

export default function DemoShell() {
  const { user, logout } = useDemoAuth();
  const ds = useDataset();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const retail = location.pathname.startsWith("/app/retail");
  const P = retail ? "/app/retail" : "/app";
  const OPS = retail ? RETAIL_OPERATIONS : OPERATIONS;
  const retailCtx = useRetailOptional();
  const opsActive = OPS.some((o) => location.pathname.startsWith(o.to));
  const [opsOpen, setOpsOpen] = useState(true);
  const alerts = retail && retailCtx
    ? retailCtx.problems.filter((p) => p.severity === "critical").map((p) => ({ id: p.id, title: p.title, area: p.team }))
    : todaysIssues(ds).filter((i) => i.severity === "critical");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setBellOpen(false);
  }, [location.pathname]);

  const doLogout = () => {
    logout();
    navigate("/app/login", { replace: true });
  };

  const ask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    navigate(`${P}/ask`, { state: { question: q.trim() } });
    setQ("");
  };

  return (
    <div className="relative flex min-h-screen font-sans text-slate-800 antialiased">
      <Aurora />

      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-[260px] shrink-0 flex-col bg-black px-4 py-6 md:flex">
        <div className="px-3">
          <ScioLogo size={44} withText />
        </div>

        <nav className="mt-9 flex flex-1 flex-col gap-1 overflow-y-auto">
          <NavItem to={P} label="Dashboard" icon={Home} end />
          {retail && <NavItem to={`${P}/master`} label="Master Dashboard" icon={LayoutDashboard} />}
          <NavItem to={`${P}/ask`} label="Ask SCIO" icon={MessageSquareText} badge="AI" />

          <button
            onClick={() => setOpsOpen((o) => !o)}
            className={cx("flex items-center gap-3 rounded-xl px-4 py-3 text-[15px] transition hover:bg-[#fff]/[0.06]", opsActive ? "text-[#fff]" : "text-[#cbd5e1]")}
          >
            <Network className="h-5 w-5" />
            Operations
            <ChevronDown className={cx("ml-auto h-4 w-4 transition", opsOpen ? "" : "-rotate-90")} />
          </button>
          {opsOpen && (
            <div className="flex flex-col gap-0.5">
              {OPS.map((o) => (
                <NavItem key={o.to} {...o} sub />
              ))}
            </div>
          )}

          <NavItem to={retail ? "/app/retail/inspection" : "/app/vision"} label="Inspection" icon={ScanSearch} />
          <NavItem to={`${P}/documents`} label="Documents" icon={FileText} />
          <NavItem to={`${P}/reports`} label="Reports" icon={BarChart3} />
        </nav>

        <div className="mt-4 rounded-xl border border-[#fff]/10 bg-[#fff]/[0.04] p-4">
          <div className="flex items-center gap-2 text-[13px] font-semibold text-[#fff]">
            <span className="h-2 w-2 rounded-full bg-emerald-400" /> All Systems Connected
          </div>
          <p className="mt-2 text-[12px] tracking-wide text-[#94a3b8]">{retail ? "ERP · POS · WMS · IoT" : "ERP · WMS · IoT · GIS"}</p>
        </div>
        <div className="mt-3">
          <NavItem to={`${P}/settings`} label="Settings" icon={Settings} />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-[72px] items-center gap-4 border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur md:px-6">
          <span className="md:hidden">
            <ScioLogo size={30} />
          </span>
          <form onSubmit={ask} className="flex min-w-0 max-w-[600px] flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 shadow-sm focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-100">
            <Search className="h-[18px] w-[18px] shrink-0 text-slate-400" />
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Ask SCIO anything about your operations, inventory, or assets..."
              className="w-full min-w-0 bg-transparent py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-500"
            />
            <kbd className="hidden shrink-0 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] text-slate-500 sm:block">Ctrl + K</kbd>
          </form>

          <div className="ml-auto flex items-center gap-3">
            <IndustrySwitch retail={retail} />
            <LiveClock />
            <ThemeToggle />
            <div className="relative">
              <button onClick={() => setBellOpen((o) => !o)} className="relative rounded-xl p-2.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900" aria-label="Notifications">
                <Bell className="h-5 w-5" />
                {alerts.length > 0 && (
                  <span className="absolute right-1 top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-[#fff] ring-2 ring-white">{alerts.length > 9 ? "9+" : alerts.length}</span>
                )}
              </button>
              {bellOpen && (
                <div className="scio-page absolute right-0 z-40 mt-2 w-[340px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                  <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                    <span className="text-sm font-semibold text-slate-900">Notifications</span>
                    <span className="rounded-md bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-600">{alerts.length} critical</span>
                  </div>
                  <div className="max-h-[360px] overflow-y-auto p-1.5">
                    {alerts.map((a, i) => (
                      <div key={a.id} className="flex gap-3 rounded-xl px-3 py-2.5 hover:bg-slate-50">
                        <span className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-rose-50 text-rose-600">
                          <Bell className="h-3.5 w-3.5" />
                        </span>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-slate-800">{a.title}</div>
                          <div className="text-xs text-slate-500">
                            {a.area} · {i < 2 ? "just now" : `${i * 7 + 3} min ago`}
                          </div>
                        </div>
                      </div>
                    ))}
                    {alerts.length === 0 && <div className="px-3 py-6 text-center text-sm text-slate-500">You're all caught up.</div>}
                  </div>
                </div>
              )}
            </div>
            <div className="relative">
              <button onClick={() => setMenuOpen((o) => !o)} className="flex items-center gap-3 rounded-xl px-2 py-1.5 hover:bg-slate-100">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#3b82f6] to-[#6366f1] text-sm font-bold text-[#fff] shadow-md shadow-blue-500/30 ring-2 ring-white">
                  {user?.name.split(" ").map((p) => p[0]).join("").slice(0, 2)}
                </span>
                <span className="hidden text-left sm:block">
                  <span className="block text-sm font-semibold text-slate-900">{user?.name}</span>
                  <span className="block text-xs text-slate-500">{user?.role}</span>
                </span>
                <ChevronDown className="h-4 w-4 text-slate-500" />
              </button>
              {menuOpen && (
                <div className="scio-page absolute right-0 z-40 mt-2 w-60 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-2xl">
                  <div className="px-3 py-2 text-xs text-slate-500">{user?.email}</div>
                  <button onClick={() => navigate(`${P}/settings`)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                    <Settings className="h-4 w-4" /> Settings
                  </button>
                  <button onClick={doLogout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-rose-600 hover:bg-rose-50">
                    <LogOut className="h-4 w-4" /> Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Mobile nav */}
        <nav className="flex gap-1 overflow-x-auto border-b border-slate-200 bg-white px-3 py-2 md:hidden">
          {[
            { to: P, label: "Dashboard", end: true },
            ...(retail ? [{ to: `${P}/master`, label: "Master" }] : []),
            { to: `${P}/ask`, label: "Ask SCIO" },
            ...OPS,
            { to: retail ? "/app/retail/inspection" : "/app/vision", label: "Inspection" },
            { to: `${P}/documents`, label: "Documents" },
            { to: `${P}/reports`, label: "Reports" },
          ].map(({ to, label, end }: { to: string; label: string; end?: boolean }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => cx("shrink-0 rounded-lg px-3 py-1.5 text-xs", isActive ? "bg-[#2563eb] text-[#fff]" : "text-slate-600")}>
              {label}
            </NavLink>
          ))}
        </nav>

        <main className="mx-auto w-full max-w-[1480px] flex-1 px-4 py-7 md:px-8">
          <div key={location.pathname} className="scio-page">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}