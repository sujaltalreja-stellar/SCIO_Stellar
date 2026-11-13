import React, { useState } from "react";
import { Check, Database, Loader2, RefreshCw, Zap } from "lucide-react";
import { SOURCES, syncLabel } from "../sources";
import { cx } from "../../ui";

/** Settings › Connected Systems: every source system SCIO reads, with sync status. */
export default function ConnectedSystems() {
  const [testing, setTesting] = useState<string | null>(null);
  const [tested, setTested] = useState<Record<string, number>>({});
  const total = SOURCES.reduce((a, s) => a + s.records, 0);
  const live = SOURCES.filter((s) => s.lastSyncMin === 0).length;

  const test = (id: string) => {
    setTesting(id);
    setTimeout(() => {
      setTesting(null);
      setTested((t) => ({ ...t, [id]: 40 + Math.round(Math.random() * 160) }));
    }, 900);
  };

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="overflow-hidden rounded-2xl bg-[#0b1220] p-5 text-[#fff] shadow-lg">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#111113]"><Database className="h-5 w-5" /></span>
            <div>
              <div className="text-[17px] font-bold">All systems connected</div>
              <div className="text-[13px] text-[#94a3b8]">SCIO unifies your existing systems into one context. Nothing is re-entered.</div>
            </div>
          </div>
          <div className="ml-auto flex flex-wrap gap-6">
            {[
              [String(SOURCES.length), "Systems"],
              [String(live), "Real-time feeds"],
              [Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(total), "Records synced"],
              ["99.98%", "Uptime · 30 days"],
            ].map(([v, l]) => (
              <div key={l}>
                <div className="text-[22px] font-extrabold tabular-nums">{v}</div>
                <div className="text-[12px] text-[#94a3b8]">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <SystemsMap />

      {/* Systems */}
      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {SOURCES.map((s) => (
          <div key={s.id} className="flex flex-col rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <span className={cx("grid h-11 w-11 shrink-0 place-items-center rounded-xl", s.bg, s.tone)}><s.icon className="h-5 w-5" /></span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[16px] font-extrabold text-slate-900">{s.id}</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Connected
                  </span>
                </div>
                <div className="truncate text-[13px] text-slate-600">{s.name}</div>
              </div>
            </div>
            <p className="mt-3 text-[13.5px] text-slate-700">{s.provides}</p>

            <dl className="mt-3 grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-3 text-[12px]">
              <div><dt className="text-slate-500">Method</dt><dd className="font-semibold text-slate-800">{s.method}</dd></div>
              <div><dt className="text-slate-500">Sync</dt><dd className="font-semibold text-slate-800">{s.syncEvery}</dd></div>
              <div><dt className="text-slate-500">Last sync</dt><dd className={cx("font-semibold", s.lastSyncMin === 0 ? "text-emerald-600" : "text-slate-800")}>{syncLabel(s.lastSyncMin)}</dd></div>
            </dl>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {s.feeds.map((f) => <span key={f} className="rounded-md bg-blue-50 px-2 py-0.5 text-[11.5px] font-medium text-blue-700">{f}</span>)}
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
              <span className="text-[12px] text-slate-500">{s.records.toLocaleString("en-US")} records</span>
              <button onClick={() => test(s.id)} disabled={testing === s.id} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[12px] font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700 disabled:opacity-60">
                {testing === s.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : tested[s.id] ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <RefreshCw className="h-3.5 w-3.5" />}
                {testing === s.id ? "Testing…" : tested[s.id] ? `OK · ${tested[s.id]} ms` : "Test connection"}
              </button>
            </div>
          </div>
        ))}
      </div>

      <p className="flex items-center gap-1.5 text-[12px] text-slate-400"><Zap className="h-3.5 w-3.5" /> Connection details shown are for this sample workspace.</p>
    </div>
  );
}

/** SCIO in the centre, every source system wired to it. */
function SystemsMap() {
  const n = SOURCES.length;
  const pos = SOURCES.map((s, i) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    return { s, x: 50 + Math.cos(a) * 40, y: 50 + Math.sin(a) * 38 };
  });
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-[15px] font-semibold text-slate-900">SCIO is connected to all your systems</div>
          <div className="text-[13px] text-slate-500">Every figure in SCIO comes from these sources, unified into one context.</div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[12px] font-medium text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> {n} of {n} connected
        </span>
      </div>

      <div className="relative mx-auto mt-4 aspect-[16/10] w-full max-w-[760px]">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
          {pos.map(({ s, x, y }, i) => (
            <g key={s.id}>
              <line x1="50" y1="50" x2={x} y2={y} stroke="#cbd5e1" strokeWidth="0.25" vectorEffect="non-scaling-stroke" />
              <circle r="0.7" fill="#e8901a">
                <animateMotion dur={`${2.2 + (i % 5) * 0.35}s`} repeatCount="indefinite" path={`M${x},${y} L50,50`} />
              </circle>
            </g>
          ))}
        </svg>

        {/* Centre: SCIO */}
        <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
          <span className="relative grid h-16 w-16 place-items-center rounded-2xl bg-[#111113] ring-1 ring-[#fff]/10 text-[28px] font-black text-[#fff] ring-8 ring-slate-100">
            S
            <span className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500" />
          </span>
          <span className="mt-2 text-[14px] font-semibold text-slate-900">SCIO</span>
          <span className="text-[11.5px] text-slate-500">Unified context</span>
        </div>

        {/* Systems */}
        {pos.map(({ s, x, y }) => (
          <div key={s.id} style={{ left: `${x}%`, top: `${y}%` }} title={`${s.name} · ${s.provides}`} className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 shadow-sm">
            <s.icon className={cx("h-4 w-4", s.tone)} />
            <span className="text-[12.5px] font-semibold text-slate-800">{s.id}</span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </div>
        ))}
      </div>
    </div>
  );
}
