import React, { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  ArrowLeftRight,
  BadgePercent,
  CalendarClock,
  ChevronRight,
  ClipboardCheck,
  Ghost,
  Layers,
  Megaphone,
  PackageX,
  Refrigerator,
  Sparkles,
  Store,
  Truck,
  Undo2,
} from "lucide-react";
import { useRetail } from "../RetailContext";
import AgentChat from "./AgentChat";
import { useDemoAuth } from "../../auth";
import type { ProblemKind } from "../analytics";
import { salesPrev, salesTotals } from "../metrics";
import { AnimatedValue, Card, cx } from "../../ui";
import { aed, nf } from "../rui";

// ---------------------------------------------------------------------------
// Retail Home: only the essentials. Four headline numbers, the three actions
// that matter most right now, connected systems, sales trend and sales by region.
// Everything deeper lives in Actions, Operate and Insights.
// ---------------------------------------------------------------------------

const P = "/app/retail";

const KIND: Record<ProblemKind, { icon: React.ElementType; verb: string; tone: string }> = {
  stockout: { icon: PackageX, verb: "Review", tone: "bg-rose-50 text-rose-600" },
  store: { icon: Store, verb: "Diagnose", tone: "bg-rose-50 text-rose-600" },
  supplier: { icon: Truck, verb: "Expedite", tone: "bg-blue-50 text-blue-600" },
  expiry: { icon: CalendarClock, verb: "Mark down", tone: "bg-amber-50 text-amber-600" },
  phantom: { icon: Ghost, verb: "Count", tone: "bg-slate-100 text-slate-600" },
  equipment: { icon: Refrigerator, verb: "Assign", tone: "bg-blue-50 text-blue-600" },
  overstock: { icon: Layers, verb: "Plan", tone: "bg-amber-50 text-amber-600" },
  margin: { icon: BadgePercent, verb: "Review", tone: "bg-rose-50 text-rose-600" },
  promotion: { icon: Megaphone, verb: "Review", tone: "bg-blue-50 text-blue-600" },
  returns: { icon: Undo2, verb: "Review", tone: "bg-slate-100 text-slate-600" },
  transfer: { icon: ArrowLeftRight, verb: "Transfer", tone: "bg-blue-50 text-blue-600" },
  compliance: { icon: ClipboardCheck, verb: "Fix", tone: "bg-amber-50 text-amber-600" },
};


function greeting() {
  const h = Number(new Date().toLocaleString("en-GB", { hour: "2-digit", hour12: false, timeZone: "Asia/Dubai" }));
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

const EVENT_LABEL: Partial<Record<string, string>> = {
  transfer_create: "created a transfer",
  transfer_approve: "approved a transfer",
  po_create: "raised a purchase order",
  po_approve: "approved a purchase order",
  po_receive: "received a delivery",
  markdown: "marked down expiring stock",
  count_start: "started a stock count",
  count_complete: "completed a stock count",
  ticket_create: "logged an equipment fault",
  ticket_assign: "assigned a technician",
  ticket_status: "updated a repair",
  alert_status: "resolved an alert",
  price_fix: "fixed a shelf price",
};

export default function RetailHome() {
  const { state: st, kpis: k, problems, scope } = useRetail();
  const { user } = useDemoAuth();
  const navigate = useNavigate();

  const d = useMemo(() => ({ t: salesTotals(st, scope, 30), prev: salesPrev(st, scope, 30) }), [st, scope]);

  const critical = problems.filter((p) => p.severity === "critical").length;
  const attention = problems.filter((p) => p.severity !== "medium").length;
  const health = Math.round(100 * (0.4 * Math.min(1, k.salesVsTarget) + 0.45 * k.availability + 0.15 * Math.max(0, 1 - critical / 8)));
  const salesDelta = d.prev.net ? (d.t.net / d.prev.net - 1) * 100 : 0;
  const top = problems.slice(0, 3);
  const firstName = user?.name.split(" ")[0] ?? "there";

  // What people did today, from the shared action log.
  const today = new Date().toISOString().slice(0, 10);
  const doneToday = st.events.filter((e) => e.at?.slice(0, 10) === today && EVENT_LABEL[e.type]);
  const last = doneToday[doneToday.length - 1];
  const ownerOf = (id: string) => {
    const ev = [...st.events].reverse().find((e) => (e as { alertId?: string }).alertId === id);
    return ev ? `${ev.user.split(" ")[0]} · In progress` : null;
  };

  // Short brief built from the top problems and the latest action.
  const lower = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);
  const brief = [
    top[0] ? `${top[0].title} (${aed(top[0].impact)} at stake).` : "No urgent issues across your stores.",
    top[1] ? `Also watch: ${lower(top[1].title)}.` : "",
    last ? `Latest: ${last.user.split(" ")[0]} ${EVENT_LABEL[last.type]}.` : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="mx-auto max-w-[1100px] space-y-6">
      {/* Greeting + brief */}
      <div className="scio-rise">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-[30px] font-bold tracking-tight text-slate-900 md:text-[34px]">
            {greeting()}, {firstName}
          </h1>
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[12.5px] font-semibold text-slate-600">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> POS · ERP · WMS connected
          </span>
        </div>
        <p className="mt-1 text-[15px] text-slate-600">
          <b className="text-slate-900">{nf(k.stores)} stores</b>
          <span className="mx-2 text-slate-300">·</span>
          {attention === 0 ? (
            "Nothing needs attention."
          ) : (
            <>
              <b className="text-slate-900">{attention}</b> {attention === 1 ? "issue needs" : "issues need"} attention
            </>
          )}
        </p>
        <div className="mt-4 flex gap-3 rounded-2xl border border-blue-100 bg-blue-50/60 px-4 py-3.5">
          <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-[#e8901a]" />
          <p className="text-[14.5px] leading-relaxed text-slate-700">{brief}</p>
        </div>
      </div>

      {/* Three numbers */}
      <div className="scio-rise grid divide-y divide-slate-100 rounded-2xl border border-slate-200/80 bg-white shadow-sm sm:grid-cols-3 sm:divide-x sm:divide-y-0 [animation-delay:60ms]">
        <Stat label="Sales · 30 days" value={aed(d.t.net)} sub={`${salesDelta >= 0 ? "▲" : "▼"} ${Math.abs(salesDelta).toFixed(1)}%`} subTone={salesDelta >= 0 ? "text-emerald-600" : "text-rose-600"} onClick={() => navigate(`${P}/insights/sales`)} />
        <Stat label="Stock at risk" value={`${nf(k.stockoutRisks)} SKUs`} valueTone="text-rose-600" sub={`${nf(k.outOfStock)} out now`} onClick={() => navigate(`${P}/insights/stockouts`)} />
        <Stat label="Health score" value={`${health}/100`} sub={health >= 85 ? "Healthy" : health >= 70 ? "Watch" : "At risk"} subTone={health >= 85 ? "text-emerald-600" : health >= 70 ? "text-amber-600" : "text-rose-600"} onClick={() => navigate(`${P}/master`)} />
      </div>

      {/* Priority actions */}
      <Card delay={120}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-[19px] font-bold tracking-tight text-slate-900">Priority Actions</h2>
          <span className="text-[13px] font-medium text-slate-500">
            {doneToday.length > 0 ? (
              <>
                <b className="text-emerald-600">{doneToday.length}</b> actions taken today
              </>
            ) : (
              "No actions taken yet today"
            )}
          </span>
        </div>
        {top.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">Nothing needs your attention right now.</p>
        ) : (
          <ul className="space-y-3">
            {top.map((p, i) => {
              const meta = KIND[p.kind];
              const owner = ownerOf(p.id);
              return (
                <li key={p.id} style={{ animationDelay: `${180 + i * 60}ms` }} className="scio-rise flex flex-wrap items-center gap-4 rounded-xl border border-slate-100 px-4 py-3.5 transition hover:border-slate-200 hover:shadow-sm sm:flex-nowrap">
                  <span className={cx("grid h-10 w-10 shrink-0 place-items-center rounded-xl", meta.tone)}>
                    <meta.icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[15px] font-semibold text-slate-900">{p.title}</div>
                    <div className="truncate text-[13px] text-slate-500">
                      <b className={p.severity === "critical" ? "text-rose-600" : "text-amber-600"}>{aed(p.impact)}</b> {p.impactLabel}
                    </div>
                  </div>
                  <span className={cx("shrink-0 rounded-full px-2.5 py-1 text-[12px] font-semibold", owner ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600")}>{owner ?? "Not started"}</span>
                  <Link to={p.link} className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-[13px] font-semibold text-[#e8901a] transition hover:border-blue-300 hover:bg-blue-50">
                    {meta.verb} <ChevronRight className="h-4 w-4" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
        <Link to={`${P}/actions`} className="mt-4 inline-flex items-center gap-1 text-[13px] font-semibold text-[#e8901a] hover:underline">
          See all actions <ChevronRight className="h-4 w-4" />
        </Link>
      </Card>

      {/* Agent */}
      <AgentChat />
    </div>
  );
}

function Stat({ label, value, valueTone, sub, subTone, onClick }: { label: string; value: string; valueTone?: string; sub?: string; subTone?: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="group flex items-end justify-between gap-3 px-5 py-4 text-left transition hover:bg-slate-50/70">
      <span>
        <span className="block text-[13px] font-medium text-slate-500">{label}</span>
        <span className={cx("mt-0.5 block text-[24px] font-bold tabular-nums tracking-tight", valueTone ?? "text-slate-900")}>
          <AnimatedValue value={value} />
        </span>
      </span>
      {sub && <span className={cx("pb-1.5 text-[12.5px] font-semibold", subTone ?? "text-slate-500")}>{sub}</span>}
    </button>
  );
}
