"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  House,
  CircleAlert,
  Workflow,
  ChartColumn,
  LayoutGrid,
  CircleHelp,
  Settings,
  CalendarDays,
  ChevronDown,
  TriangleAlert,
  ShieldCheck,
  Coins,
  Layers,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Info,
  ArrowRight,
  WandSparkles,
  CalendarClock,
  Database,
  Store,
  Box,
  Users,
  CircleCheck,
} from "lucide-react";

/** Design width of the mockup; it is scaled down to fit narrower containers. */
const DESIGN_W = 860;
const DESIGN_H = 505;

function useFitScale() {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setScale(Math.min(1, el.clientWidth / DESIGN_W));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return { ref, scale };
}

function Delta({ value, up, good }: { value: string; up: boolean; good: boolean }) {
  const Icon = up ? ArrowUp : ArrowDown;
  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
        good ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"
      }`}
    >
      <Icon className="h-2.5 w-2.5" strokeWidth={3} />
      {value}
    </span>
  );
}

function Kpi({ icon: Icon, label, value, delta, tint }: { icon: typeof Coins; label: string; value: string; delta?: React.ReactNode; tint?: boolean }) {
  return (
    <div className={`rounded-xl border p-3 ${tint ? "border-[#FCE3BF] bg-[#FFF5E8]" : "border-[#EEECE8] bg-white"}`}>
      <p className="flex items-center gap-1.5 text-[11px] font-medium text-[#3a3936]">
        <Icon className={`h-3.5 w-3.5 ${tint ? "text-[#D98B16]" : "text-[#3a3936]"}`} />
        {label}
      </p>
      <div className="mt-2 flex items-center gap-2 pl-5">
        <span className="text-[22px] font-bold leading-none text-[#111113]">{value}</span>
        {delta}
      </div>
    </div>
  );
}

function Severity({ level }: { level: "High" | "Medium" }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[9.5px] font-semibold ${
        level === "High" ? "bg-red-50 text-red-500" : "bg-[#FFF2DD] text-[#C27A0E]"
      }`}
    >
      {level}
    </span>
  );
}

/** Illustrative SCIO "Command Center" screen for the homepage hero. Decorative: the real product lives at /app. */
export default function HeroCommandCenter() {
  const { ref, scale } = useFitScale();

  return (
    <div ref={ref} className="theme-fixed relative w-full" style={{ height: DESIGN_H * scale + 24 }} aria-hidden="true">
      {/* Soft glow behind the window */}
      <div className="absolute inset-x-[6%] top-[8%] h-[80%] rounded-[40px] bg-[#F9C982]/40 blur-3xl" />

      <div
        className="absolute left-0 top-3 origin-top-left"
        style={{ width: DESIGN_W, height: DESIGN_H, transform: `scale(${scale})` }}
      >
        <div className="flex h-full overflow-hidden rounded-[18px] border border-[#E7E5E1] bg-[#FAFAF9] shadow-[0_30px_80px_-30px_rgba(17,17,19,0.35)] font-sans">
          {/* Sidebar */}
          <div className="flex w-[146px] shrink-0 flex-col bg-[#111113] px-2.5 py-4 text-white">
            <div className="flex items-center gap-2 px-2">
              <span className="relative text-[15px] font-black">
                S<span className="absolute -right-1.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-[#f2a93b]" />
              </span>
              <span className="text-[13px] font-bold tracking-wide">SCIO</span>
            </div>
            <nav className="mt-6 space-y-1 text-[11px]">
              {[
                { icon: House, label: "Command Center", active: true },
                { icon: CircleAlert, label: "Issues", badge: "3" },
                { icon: Workflow, label: "Workflows" },
                { icon: ChartColumn, label: "Insights" },
                { icon: LayoutGrid, label: "Systems" },
              ].map((n) => (
                <div
                  key={n.label}
                  className={`flex items-center gap-2 rounded-lg px-2 py-2 ${n.active ? "bg-[#3a2a14] text-white font-semibold" : "text-white/75"}`}
                >
                  <n.icon className={`h-3.5 w-3.5 ${n.active ? "text-[#f2a93b]" : ""}`} />
                  <span className="flex-1 whitespace-nowrap">{n.label}</span>
                  {n.badge && <span className="h-4 w-4 rounded-full bg-[#f2a93b] text-[9px] font-bold text-[#111113] flex items-center justify-center">{n.badge}</span>}
                </div>
              ))}
            </nav>
            <div className="mt-auto flex gap-3 px-2 text-white/60">
              <CircleHelp className="h-4 w-4" />
              <Settings className="h-4 w-4" />
            </div>
          </div>

          {/* Main */}
          <div className="flex-1 p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[17px] font-bold text-[#111113]">Command Center</p>
                <p className="text-[11px] text-[#6b6862]">Operational intelligence across your business systems</p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#E7E5E1] bg-white px-2.5 py-1.5 text-[10px] font-medium text-[#111113]">
                <CalendarDays className="h-3 w-3" /> Last 30 days <ChevronDown className="h-3 w-3" />
              </span>
            </div>

            <div className="mt-3 grid grid-cols-4 gap-2.5">
              <Kpi icon={TriangleAlert} label="Open issues" value="3" tint delta={<Delta value="-57%" up={false} good={false} />} />
              <Kpi icon={ShieldCheck} label="Actions approved" value="28" delta={<Delta value="+40%" up good />} />
              <Kpi icon={Coins} label="Cost impact" value="$218K" delta={<Delta value="+32%" up good />} />
              <Kpi icon={Layers} label="Systems connected" value="6" />
            </div>

            <div className="mt-2.5 grid grid-cols-[1.75fr_1fr] gap-2.5">
              <div className="rounded-xl border border-[#EEECE8] bg-white p-3">
                <p className="flex items-center gap-1 text-[11px] font-semibold text-[#111113]">
                  Operational health <Info className="h-3 w-3 text-[#8f8b84]" />
                </p>
                <div className="mt-1 flex items-center gap-3">
                  <span className="text-[28px] font-bold text-[#111113]">96%</span>
                  <Delta value="+4pp" up good />
                  <svg viewBox="0 0 260 60" className="ml-auto h-[58px] w-[270px]">
                    <defs>
                      <linearGradient id="hero-spark" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0" stopColor="#F2A93B" stopOpacity="0.28" />
                        <stop offset="1" stopColor="#F2A93B" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d="M4 44 L26 46 L48 38 L70 42 L92 36 L114 28 L136 32 L158 26 L180 22 L202 30 L224 18 L256 12 L256 60 L4 60 Z" fill="url(#hero-spark)" />
                    <path d="M4 44 L26 46 L48 38 L70 42 L92 36 L114 28 L136 32 L158 26 L180 22 L202 30 L224 18 L256 12" fill="none" stroke="#F2A93B" strokeWidth="2" strokeLinejoin="round" />
                    {[[4, 44], [70, 42], [114, 28], [202, 30], [256, 12]].map(([x, y]) => (
                      <circle key={x} cx={x} cy={y} r="2.6" fill="#fff" stroke="#F2A93B" strokeWidth="1.6" />
                    ))}
                  </svg>
                </div>
              </div>
              <div className="rounded-xl border border-[#EEECE8] bg-white p-3">
                <p className="text-[11px] font-semibold text-[#111113]">Connected systems</p>
                <ul className="mt-1.5 space-y-1.5 text-[10px] text-[#3a3936]">
                  {[
                    { icon: Database, label: "ERP" },
                    { icon: Store, label: "POS" },
                    { icon: Box, label: "Warehouse (WMS)" },
                    { icon: Users, label: "HR & Finance" },
                  ].map((s) => (
                    <li key={s.label} className="flex items-center gap-2">
                      <s.icon className="h-3 w-3 text-[#3a3936]" />
                      <span className="flex-1">{s.label}</span>
                      <span className="inline-flex items-center gap-1 text-[#6b6862]">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Connected
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-2.5 grid grid-cols-3 gap-2.5">
              <div className="rounded-xl border border-[#EEECE8] bg-white p-3">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold text-[#111113]">Active issues (3)</p>
                  <span className="inline-flex items-center gap-0.5 text-[9px] text-[#3a3936]">View all <ArrowRight className="h-2.5 w-2.5" /></span>
                </div>
                <ul className="mt-2 divide-y divide-[#F1EFEC]">
                  {[
                    { t: "Inventory below reorder point", s: "12 SKUs across 3 locations", l: "High" as const },
                    { t: "POS sales sync delay", s: "Data is 2+ hours behind ERP", l: "Medium" as const },
                    { t: "Overtime above target", s: "+18% vs. plan this week", l: "Medium" as const },
                  ].map((i) => (
                    <li key={i.t} className="flex items-center gap-2 py-1.5">
                      <TriangleAlert className="h-3.5 w-3.5 shrink-0 text-[#E8900C]" />
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-[9.5px] font-semibold text-[#111113]">{i.t}</p>
                        <p className="truncate text-[8.5px] text-[#6b6862]">{i.s}</p>
                      </div>
                      <Severity level={i.l} />
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-[#EEECE8] bg-white p-3">
                <p className="flex items-center gap-1 text-[11px] font-semibold text-[#111113]">
                  <Sparkles className="h-3 w-3 text-[#f2a93b]" /> AI recommendations
                </p>
                <div className="mt-2 rounded-lg bg-[#F1EEFB] p-2">
                  <div className="flex gap-2">
                    <WandSparkles className="h-3.5 w-3.5 mt-0.5 shrink-0 text-[#4f3fb5]" />
                    <div>
                      <p className="text-[9.5px] font-semibold text-[#2b2380]">Replenish inventory</p>
                      <p className="text-[8.5px] text-[#4a4843]">Create PO for 12 SKUs to avoid stockouts.</p>
                      <span className="mt-1.5 inline-flex items-center gap-1 rounded-md bg-[#111113] px-2 py-1 text-[8.5px] font-semibold text-white">
                        Review &amp; approve <ArrowRight className="h-2.5 w-2.5" />
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex gap-2 px-2">
                  <CalendarClock className="h-3.5 w-3.5 mt-0.5 shrink-0 text-[#3a3936]" />
                  <div>
                    <p className="text-[9.5px] font-semibold text-[#111113]">Adjust workforce schedule</p>
                    <p className="text-[8.5px] text-[#4a4843]">Reduce overtime by 18% this week.</p>
                    <span className="mt-1.5 inline-flex items-center gap-1 rounded-md border border-[#D6D3CE] px-2 py-1 text-[8.5px] font-semibold text-[#111113]">
                      Review &amp; approve <ArrowRight className="h-2.5 w-2.5" />
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-[#EEECE8] bg-white p-3">
                <p className="text-[11px] font-semibold text-[#111113]">Workflow: Issue to action</p>
                <ol className="relative mt-2.5 space-y-3.5 before:absolute before:left-[6.5px] before:top-2 before:bottom-2 before:w-px before:bg-[#E7E5E1]">
                  {[
                    { t: "Issue detected", r: "2:14 PM", s: "done" },
                    { t: "AI recommendation", r: "2:15 PM", s: "done" },
                    { t: "Review & approve", r: "Pending", s: "now" },
                    { t: "Action in systems", r: "", s: "todo" },
                  ].map((w) => (
                    <li key={w.t} className="relative flex items-center gap-2 text-[9.5px]">
                      {w.s === "done" ? (
                        <CircleCheck className="relative h-3.5 w-3.5 shrink-0 fill-emerald-500 text-white" />
                      ) : (
                        <span className={`relative h-3.5 w-3.5 shrink-0 rounded-full border-2 bg-white ${w.s === "now" ? "border-[#f2a93b]" : "border-[#D6D3CE]"}`} />
                      )}
                      <span className={`flex-1 ${w.s === "todo" ? "text-[#6b6862]" : "font-medium text-[#111113]"}`}>{w.t}</span>
                      <span className="text-[8.5px] text-[#6b6862]">{w.r}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Floating approval card: shows the issue-to-action outcome */}
      <div className="absolute -bottom-1 left-3 hidden sm:flex items-center gap-3 rounded-2xl border border-[#E7E5E1] bg-white py-3 pl-3 pr-5 shadow-[0_18px_40px_-18px_rgba(17,17,19,0.35)] font-sans">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <CircleCheck className="h-5 w-5" />
        </span>
        <span>
          <span className="block text-[13px] font-semibold text-[#111113]">Purchase order approved</span>
          <span className="block text-[12px] text-[#6b6862]">Synced to ERP · logged in audit trail</span>
        </span>
      </div>
    </div>
  );
}
