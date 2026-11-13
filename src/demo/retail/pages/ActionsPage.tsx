import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeftRight,
  ArrowRight,
  BadgePercent,
  CalendarClock,
  CircleCheck,
  ClipboardCheck,
  Clock,
  Coins,
  Ghost,
  Layers,
  Loader,
  Megaphone,
  Package,
  PackageX,
  Refrigerator,
  Search,
  Sparkles,
  Store,
  TriangleAlert,
  Truck,
  Undo2,
  Wand2,
} from "lucide-react";
import { useRetail } from "../RetailContext";
import type { Problem, ProblemKind } from "../analytics";
import { cx } from "../../ui";
import { aed, nf } from "../rui";

// ---------------------------------------------------------------------------
// Actions: every detected issue in one list, with impact, source system,
// owner and status, plus an AI insight panel for the selected issue.
// ---------------------------------------------------------------------------

const KIND: Record<ProblemKind, { icon: React.ElementType; source: string[]; act: string }> = {
  stockout: { icon: PackageX, source: ["POS", "WMS"], act: "Within 48 hours" },
  store: { icon: Store, source: ["POS"], act: "Today" },
  supplier: { icon: Truck, source: ["Procurement"], act: "Within 3 days" },
  expiry: { icon: CalendarClock, source: ["WMS"], act: "Within 48 hours" },
  phantom: { icon: Ghost, source: ["POS", "ERP"], act: "This week" },
  equipment: { icon: Refrigerator, source: ["IoT"], act: "Today" },
  overstock: { icon: Layers, source: ["ERP"], act: "This week" },
  margin: { icon: BadgePercent, source: ["POS", "ERP"], act: "This week" },
  promotion: { icon: Megaphone, source: ["POS"], act: "This week" },
  returns: { icon: Undo2, source: ["POS"], act: "This week" },
  transfer: { icon: ArrowLeftRight, source: ["WMS"], act: "Within 48 hours" },
  compliance: { icon: ClipboardCheck, source: ["SCIO"], act: "Today" },
};

type Status = "Urgent" | "In Progress" | "Open";
const STATUS_TONE: Record<Status | "Resolved", string> = {
  Urgent: "bg-rose-50 text-rose-600",
  "In Progress": "bg-blue-50 text-blue-600",
  Open: "bg-slate-100 text-slate-700",
  Resolved: "bg-emerald-50 text-emerald-700",
};
const AVATAR = ["bg-blue-500", "bg-blue-500", "bg-orange-500", "bg-pink-400", "bg-emerald-500", "bg-cyan-500"];

type Tab = "all" | "urgent" | "progress" | "resolved";

export default function ActionsPage() {
  const { state: st, problems, dispatch, can } = useRetail();
  const [tab, setTab] = useState<Tab>("all");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"impact" | "severity">("impact");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { rows, resolved } = useMemo(() => {
    const byAlert = new Map<string, { user: string; type: string; status?: string; at: string }>();
    for (const e of st.events) {
      const id = (e as { alertId?: string }).alertId;
      if (id) byAlert.set(id, { user: e.user, type: e.type, status: (e as { status?: string }).status, at: e.at });
    }
    const weekAgo = Date.now() - 7 * 864e5;
    const resolved = st.events
      .filter((e) => e.type === "alert_status" && (e as { status?: string }).status === "resolved" && new Date(e.at).getTime() >= weekAgo)
      .map((e) => ({ id: (e as { alertId: string }).alertId, user: e.user, at: e.at }));
    const resolvedIds = new Set(resolved.map((r) => r.id));
    const rows = problems
      .filter((p) => !resolvedIds.has(p.id))
      .map((p) => {
        const ev = byAlert.get(p.id);
        const status: Status = ev ? "In Progress" : p.severity === "critical" ? "Urgent" : "Open";
        return { p, status, owner: ev ? ev.user : p.team.split("·")[0].trim() };
      });
    return { rows, resolved };
  }, [st.events, problems]);

  const counts = {
    all: rows.length,
    urgent: rows.filter((r) => r.status === "Urgent").length,
    progress: rows.filter((r) => r.status === "In Progress").length,
    resolved: resolved.length,
  };
  const potential = rows.reduce((a, r) => a + r.p.impact, 0);

  const sevRank = { critical: 0, high: 1, medium: 2 } as const;
  const visible = rows
    .filter((r) => (tab === "urgent" ? r.status === "Urgent" : tab === "progress" ? r.status === "In Progress" : true))
    .filter((r) => !q.trim() || `${r.p.title} ${r.p.why} ${r.p.where}`.toLowerCase().includes(q.trim().toLowerCase()))
    .sort((a, b) => (sort === "impact" ? b.p.impact - a.p.impact : sevRank[a.p.severity] - sevRank[b.p.severity] || b.p.impact - a.p.impact));

  const selected = rows.find((r) => r.p.id === selectedId) ?? visible[0] ?? rows[0];

  return (
    <div className="space-y-6">
      <div className="scio-rise">
        <h1 className="text-[34px] font-extrabold tracking-tight text-slate-900">Actions</h1>
        <p className="mt-1 text-[15px] text-slate-600">Operational issues detected with recommended actions to keep your business running smoothly.</p>
      </div>

      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-5">
          {/* Summary tiles */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
            <SumTile tone="border-rose-200 bg-rose-50/70" icon={<TriangleAlert className="h-7 w-7 text-rose-600" />} value={nf(counts.urgent)} label="Urgent" onClick={() => setTab("urgent")} />
            <SumTile tone="border-blue-200 bg-blue-50/70" icon={<Loader className="h-7 w-7 text-blue-600" />} value={nf(counts.progress)} label="In Progress" onClick={() => setTab("progress")} />
            <SumTile tone="border-emerald-200 bg-emerald-50/70" icon={<CircleCheck className="h-7 w-7 text-emerald-600" />} value={nf(counts.resolved)} label="Resolved" sub="(Last 7 days)" onClick={() => setTab("resolved")} />
            <SumTile tone="border-orange-200 bg-orange-50/70" icon={<Coins className="h-7 w-7 text-orange-500" />} value={aed(potential)} label="Potential Impact" labelTone="text-orange-600" />
          </div>

          {/* Tabs + tools */}
          <div className="flex flex-wrap items-center gap-3 border-b border-slate-200">
            {(
              [
                ["all", `All Issues (${counts.all})`],
                ["urgent", `Urgent (${counts.urgent})`],
                ["progress", `In Progress (${counts.progress})`],
                ["resolved", `Resolved (${counts.resolved})`],
              ] as const
            ).map(([k, label]) => (
              <button key={k} onClick={() => setTab(k)} className={cx("-mb-px border-b-[3px] px-3 py-3 text-[14.5px] transition", tab === k ? "border-orange-500 font-bold text-slate-900" : "border-transparent text-slate-500 hover:text-slate-800")}>
                {label}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-2 pb-2">
              <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3">
                <Search className="h-4 w-4 text-slate-400" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search issues" className="w-36 bg-transparent py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400" />
              </label>
              <select value={sort} onChange={(e) => setSort(e.target.value as "impact" | "severity")} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 outline-none">
                <option value="impact">Sort: Impact</option>
                <option value="severity">Sort: Severity</option>
              </select>
            </div>
          </div>

          {/* List */}
          {tab === "resolved" ? (
            <div className="rounded-2xl border border-slate-200 bg-white">
              {resolved.length === 0 ? (
                <p className="py-10 text-center text-sm text-slate-500">No issues resolved in the last 7 days yet.</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {resolved.map((r) => (
                    <li key={r.id + r.at} className="flex items-center gap-3 px-5 py-3.5 text-sm">
                      <CircleCheck className="h-5 w-5 text-emerald-600" />
                      <span className="flex-1 font-medium text-slate-800">{problems.find((p) => p.id === r.id)?.title ?? r.id}</span>
                      <span className="text-slate-500">{r.user} · {new Date(r.at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-[860px] space-y-2.5">
                <div className="grid grid-cols-[minmax(0,2.3fr)_1fr_1fr_1.1fr_0.9fr_auto] gap-3 rounded-xl bg-slate-50 px-5 py-3 text-[13px] font-semibold text-slate-600">
                  <span>Issue</span>
                  <span>Business Impact</span>
                  <span>Source</span>
                  <span>Assigned To</span>
                  <span>Status</span>
                  <span className="w-[104px]" />
                </div>
                {visible.length === 0 && <p className="py-10 text-center text-sm text-slate-500">No issues here.</p>}
                {visible.map((r, i) => (
                  <Row key={r.p.id} p={r.p} status={r.status} owner={r.owner} avatar={AVATAR[i % AVATAR.length]} active={selected?.p.id === r.p.id} onSelect={() => setSelectedId(r.p.id)} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right panel */}
        {selected && (
          <aside className="grid items-start gap-5 lg:grid-cols-2 2xl:block 2xl:space-y-5">
            <div className="scio-rise rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1.5 text-[13px] font-bold text-orange-600">
                <Sparkles className="h-4 w-4" /> AI Insight
              </span>
              <h2 className="mt-4 text-[21px] font-extrabold tracking-tight text-slate-900">{selected.p.title}</h2>
              <p className="mt-2 text-[14px] leading-relaxed text-slate-600">{selected.p.why}</p>
              <div className="mt-4 rounded-xl bg-orange-50/70 p-4">
                <div className="flex items-center gap-2 text-[14px] font-bold text-orange-600">
                  <Package className="h-4 w-4" /> Recommended Action
                </div>
                <p className="mt-1.5 text-[14px] leading-relaxed text-slate-800">{selected.p.action}</p>
              </div>
              <Link to={selected.p.link} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-[14.5px] font-semibold text-[#fff] transition hover:bg-slate-800">
                Review & Take Action <ArrowRight className="h-4 w-4" />
              </Link>
              {can("alert.manage") && (
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <button
                    disabled={selected.status === "In Progress"}
                    onClick={() => dispatch({ type: "alert_status", alertId: selected.p.id, status: "acknowledged", note: "Working on it" }, "Marked in progress")}
                    className="rounded-xl border border-slate-200 bg-white py-2.5 text-[13px] font-semibold text-slate-800 transition hover:border-blue-300 hover:bg-blue-50 disabled:opacity-50"
                  >
                    Start working
                  </button>
                  <button
                    onClick={() => dispatch({ type: "alert_status", alertId: selected.p.id, status: "resolved", note: "Resolved from Actions" }, "Issue marked resolved")}
                    className="rounded-xl border border-slate-200 bg-white py-2.5 text-[13px] font-semibold text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-50"
                  >
                    Mark resolved
                  </button>
                </div>
              )}
            </div>

            <div className="scio-rise rounded-2xl border border-slate-200 bg-white p-5 shadow-sm [animation-delay:60ms]">
              <h3 className="flex items-center gap-2 text-[15px] font-bold text-slate-900">
                <Wand2 className="h-4 w-4 text-slate-500" /> Impact Summary
              </h3>
              <dl className="mt-3 space-y-2.5 text-[13.5px]">
                <SumLine icon={Coins} label="Value at stake" value={aed(selected.p.impact)} />
                <SumLine icon={Store} label="Where" value={selected.p.where} />
                <SumLine icon={Layers} label="Items affected" value={nf(selected.p.count)} />
                <SumLine icon={Clock} label="Time to act" value={KIND[selected.p.kind].act} valueTone="text-rose-600" />
              </dl>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

function SumTile({ tone, icon, value, label, labelTone, sub, onClick }: { tone: string; icon: React.ReactNode; value: string; label: string; labelTone?: string; sub?: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} disabled={!onClick} className={cx("scio-rise group flex items-start gap-3 rounded-2xl border p-4 text-left transition enabled:hover:-translate-y-0.5 enabled:hover:shadow-md", tone)}>
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/80">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block break-words text-[22px] font-extrabold leading-tight tabular-nums text-slate-900">{value}</span>
        <span className={cx("block text-[14px] font-medium", labelTone ?? "text-slate-700")}>{label}</span>
        {sub && <span className="block text-[12px] text-slate-500">{sub}</span>}
      </span>
      {onClick && <ArrowRight className="h-4 w-4 text-slate-500 transition group-hover:translate-x-0.5" />}
    </button>
  );
}

function SumLine({ icon: Icon, label, value, valueTone }: { icon: React.ElementType; label: string; value: string; valueTone?: string }) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="h-4 w-4 shrink-0 text-slate-500" />
      <dt className="flex-1 text-slate-600">{label}</dt>
      <dd className={cx("max-w-[55%] truncate text-right font-bold", valueTone ?? "text-slate-900")}>{value}</dd>
    </div>
  );
}

function Row({ p, status, owner, avatar, active, onSelect }: { p: Problem; status: Status; owner: string; avatar: string; active: boolean; onSelect: () => void }) {
  const meta = KIND[p.kind];
  const initials = owner.split(" ").map((x) => x[0]).join("").slice(0, 2).toUpperCase();
  const money = p.impact > 0;
  return (
    <div
      onClick={onSelect}
      className={cx(
        "grid cursor-pointer grid-cols-[minmax(0,2.3fr)_1fr_1fr_1.1fr_0.9fr_auto] items-center gap-3 rounded-xl border px-5 py-3.5 transition",
        active ? "border-orange-300 bg-orange-50/60 shadow-sm" : "border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm"
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-orange-50 text-orange-500">
          <meta.icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <div className="truncate text-[14.5px] font-bold text-slate-900">{p.title}</div>
          <div className="truncate text-[12.5px] text-slate-500">{p.where}</div>
        </div>
      </div>
      <div className="text-[13.5px] leading-tight">
        {money ? <b className={p.severity === "critical" ? "text-rose-600" : "text-slate-900"}>{aed(p.impact)}</b> : <b className="text-slate-900">{nf(p.count)}</b>}
        <div className={cx("text-[12.5px]", p.severity === "critical" ? "text-rose-600" : "text-slate-500")}>{p.impactLabel}</div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {meta.source.map((s) => (
          <span key={s} className="rounded-lg bg-slate-100 px-2 py-1 text-[12px] font-semibold text-slate-700">{s}</span>
        ))}
      </div>
      <div className="flex min-w-0 items-center gap-2">
        <span className={cx("grid h-8 w-8 shrink-0 place-items-center rounded-full text-[11px] font-bold text-[#fff]", avatar)}>{initials}</span>
        <span className="truncate text-[13.5px] text-slate-800">{owner}</span>
      </div>
      <span className={cx("w-fit rounded-lg px-2.5 py-1 text-[12.5px] font-semibold", STATUS_TONE[status])}>{status}</span>
      <Link to={p.link} onClick={(e) => e.stopPropagation()} className="inline-flex w-[104px] items-center justify-center gap-1.5 rounded-xl bg-slate-900 py-2.5 text-[13.5px] font-semibold text-[#fff] transition hover:bg-slate-800">
        Review <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
