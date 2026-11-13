import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUp, Check, Loader2, RotateCcw } from "lucide-react";
import { useRetail } from "../RetailContext";
import { useDemoAuth, readApi, scioHeaders } from "../../auth";
import { equipmentIssues } from "../analytics";
import { salesPrev, salesTotals } from "../metrics";
import type { ActionProposal, CopilotResponse } from "../../copilotTypes";
import { KIND, useProposalRunner } from "./AgentChat";
import { IntelCharts, LeakCounter, Phantom, Predictions, Protected, SupplierCost, WhyChain, useIntel } from "./IntelInsights";
import { TOOL_SOURCES } from "../sources";
import { cx } from "../../ui";
import { aed, nf, pctf } from "../rui";

// ---------------------------------------------------------------------------
// Intelligence: only the key operational signals, side by side with SCIO —
// a square-faced assistant you can ask about any number on the page.
// ---------------------------------------------------------------------------

const P = "/app/retail";
type Mood = "idle" | "thinking" | "talking";
type Msg = { role: "user" | "assistant"; text: string; res?: CopilotResponse; done?: Record<string, number | "dismissed"> };

export default function IntelligencePage() {
  const { state: st, kpis: k, problems, scope, can } = useRetail();
  const { user } = useDemoAuth();
  const run = useProposalRunner();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [mood, setMood] = useState<Mood>("idle");
  const [view, setView] = useState<"numbers" | "charts">("numbers");
  const intel = useIntel();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), [msgs, busy]);

  const d = useMemo(() => {
    const t = salesTotals(st, scope, 30);
    const prev = salesPrev(st, scope, 30);
    const below = [...k.perf].filter((p) => p.vsTarget < 0.97).sort((a, b) => a.vsTarget - b.vsTarget);
    const faults = equipmentIssues(st, scope);
    return { t, delta: prev.net ? (t.net / prev.net - 1) * 100 : 0, below, faults };
  }, [st, scope, k]);
  const critical = problems.filter((p) => p.severity === "critical").length;
  const health = Math.round(100 * (0.4 * Math.min(1, k.salesVsTarget) + 0.45 * k.availability + 0.15 * Math.max(0, 1 - critical / 8)));

  const ask = async (text: string) => {
    const question = text.trim();
    if (!question || busy) return;
    const history = msgs.slice(-6).map((m) => ({ role: m.role, content: m.text }));
    setMsgs((m) => [...m, { role: "user", text: question }]);
    setQ("");
    setBusy(true);
    setMood("thinking");
    let res: CopilotResponse;
    try {
      const r = await fetch("/api/scio/retail-copilot", {
        method: "POST",
        headers: scioHeaders(),
        body: JSON.stringify({ question: `${question}\n(Answer in simple everyday words, max 5 short bullets.)`, history, events: st.events, scope: scope ? [...scope] : null }),
      });
      const data = await readApi<CopilotResponse>(r);
      if (!r.ok || data.error) throw new Error(data.error || `Request failed (${r.status})`);
      res = data;
    } catch (err) {
      res = { answer: `Sorry, I couldn't reach the data: ${err instanceof Error ? err.message : "request failed"}.`, visuals: [], toolsUsed: [], followUps: [] };
    }
    setMsgs((m) => [...m, { role: "assistant", text: res.answer, res, done: {} }]);
    setBusy(false);
    setMood("talking");
    setTimeout(() => setMood("idle"), 2400);
  };

  const decide = (mi: number, p: ActionProposal, approve: boolean) => {
    const n = approve ? run(p) : "dismissed";
    setMsgs((all) => all.map((m, i) => (i === mi ? { ...m, done: { ...m.done, [p.id]: n } } : m)));
  };

  const Ask = ({ q: question }: { q: string }) => (
    <button onClick={() => ask(question)} disabled={busy} className="text-[12px] font-medium text-amber-700 hover:underline disabled:opacity-50">
      Ask SCIO
    </button>
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-semibold tracking-tight text-slate-900">Intelligence</h1>
          <p className="mt-0.5 text-[14px] text-slate-500">What your ERP can't show you.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[12.5px] text-slate-500">● Live</span>
          <div className="flex rounded-lg bg-slate-100 p-0.5 text-[13px]">
            {(["numbers", "charts"] as const).map((v) => (
              <button key={v} onClick={() => setView(v)} className={cx("rounded-md px-3 py-1 capitalize transition", view === v ? "bg-white font-medium text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800")}>
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_440px] xl:grid-cols-[minmax(0,1fr)_400px]">
        {/* ---- Key information ---- */}
        <div className="min-w-0 space-y-5">
          {/* Stat row */}
          <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-slate-200 bg-white md:grid-cols-4 md:divide-x md:divide-slate-200">
            <Stat label="Sales · 30 days" value={aed(d.t.net)} note={`${d.delta >= 0 ? "▲" : "▼"} ${Math.abs(d.delta).toFixed(1)}% vs last month`} noteTone={d.delta >= 0 ? "text-emerald-600" : "text-rose-600"} ask={<Ask q="Why did my sales change this month?" />} />
            <Stat label="On-shelf availability" value={pctf(k.availability)} note={`${nf(k.outOfStock)} items out of stock`} noteTone="text-slate-500" ask={<Ask q="Where are my products out of stock and what should I do?" />} />
            <Stat label="Sales vs target" value={pctf(k.salesVsTarget, 0)} note={`${d.below.length} stores below target`} noteTone={k.salesVsTarget >= 1 ? "text-emerald-600" : "text-amber-600"} ask={<Ask q="Which stores are below target and why?" />} />
            <Stat label="Health score" value={`${health}/100`} note={health >= 85 ? "Healthy" : health >= 70 ? "Watch closely" : "At risk"} noteTone={health >= 85 ? "text-emerald-600" : "text-amber-600"} ask={<Ask q="Give me today's business overview in simple words." />} />
          </div>

          {view === "charts" ? (
            <IntelCharts intel={intel} />
          ) : (
            <>
              <div className="grid gap-5 md:grid-cols-2">
                <LeakCounter intel={intel} onAsk={ask} />
                <Protected intel={intel} onAsk={ask} />
              </div>
              <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
                <WhyChain intel={intel} onAsk={ask} />
                <div className="space-y-5">
                  <Predictions intel={intel} onAsk={ask} />
                  <SupplierCost intel={intel} onAsk={ask} />
                </div>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <Phantom intel={intel} onAsk={ask} />
                <Panel title="Needs attention" right={<Link to={`${P}/actions`} className="text-[12.5px] text-slate-500 hover:text-slate-900">All →</Link>}>
                  <ul className="divide-y divide-slate-100">
                    {problems.slice(0, 3).map((p) => (
                      <li key={p.id} className="flex items-center gap-3 px-4 py-2.5">
                        <span className={cx("h-2 w-2 shrink-0 rounded-full", p.severity === "critical" ? "bg-rose-500" : "bg-amber-500")} />
                        <span className="min-w-0 flex-1 truncate text-[13.5px] text-slate-900">{p.title}</span>
                        <span className="shrink-0 text-[12.5px] tabular-nums text-slate-500">{aed(p.impact)}</span>
                      </li>
                    ))}
                  </ul>
                </Panel>
              </div>
            </>
          )}
        </div>

        {/* ---- SCIO assistant ---- */}
        <aside className="flex h-[calc(100vh-170px)] min-h-[560px] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white xl:sticky xl:top-[92px]">
          <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3">
            <ScioFace mood={mood} size={44} />
            <div className="min-w-0 flex-1">
              <div className="text-[14px] font-semibold text-slate-900">SCIO</div>
              <div className="text-[12px] text-slate-500">{mood === "thinking" ? "Looking through your systems…" : "Your operations assistant"}</div>
            </div>
            {msgs.length > 0 && (
              <button onClick={() => setMsgs([])} title="New conversation" className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                <RotateCcw className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
            {msgs.length === 0 && (
              <div className="flex flex-col items-center pt-6 text-center">
                <ScioFace mood="idle" size={88} />
                <div className="mt-4 text-[16px] font-semibold text-slate-900">Hi {user?.name.split(" ")[0] ?? "there"}, I'm SCIO.</div>
                <p className="mt-1 max-w-[300px] text-[13.5px] text-slate-500">Ask me about anything on this page, or tap “Ask SCIO” next to a number.</p>
                <div className="mt-5 w-full space-y-1.5 text-left">
                  {["What should I focus on today?", "Fix today's stockouts", "Why is my best store struggling?"].map((s) => (
                    <button key={s} onClick={() => ask(s)} className="group flex w-full items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-[13px] text-slate-700 transition hover:border-slate-300 hover:text-slate-900">
                      {s} <ArrowRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-slate-600" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {msgs.map((m, i) =>
              m.role === "user" ? (
                <div key={i} className="ml-auto w-fit max-w-[85%] rounded-2xl bg-slate-100 px-3.5 py-2 text-[14px] text-slate-900">{m.text}</div>
              ) : (
                <div key={i} className="flex items-start gap-2.5">
                  <ScioFace mood="idle" size={28} />
                  <div className="min-w-0 flex-1 space-y-2.5">
                    <Simple text={m.text} />
                    {m.res?.proposals?.map((p) => {
                      const s = m.done?.[p.id];
                      const kk = KIND[p.kind];
                      return (
                        <div key={p.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 px-3 py-2">
                          <kk.icon className="h-4 w-4 text-slate-400" />
                          <span className="min-w-0 flex-1 text-[13px] font-medium text-slate-900">{p.title}</span>
                          {typeof s === "number" ? (
                            <span className="inline-flex items-center gap-1 text-[12.5px] font-medium text-emerald-700"><Check className="h-3.5 w-3.5" /> {s} created</span>
                          ) : s === "dismissed" ? (
                            <span className="text-[12.5px] text-slate-400">Dismissed</span>
                          ) : can(kk.perm) ? (
                            <span className="flex gap-1">
                              <button onClick={() => decide(i, p, false)} className="rounded-md px-2 py-1 text-[12.5px] text-slate-500 hover:bg-slate-100">Dismiss</button>
                              <button onClick={() => decide(i, p, true)} className="rounded-md bg-[#111113] px-2.5 py-1 text-[12.5px] font-medium text-[#fff] ring-1 ring-[#fff]/10 hover:bg-[#2a2a30]">Approve</button>
                            </span>
                          ) : (
                            <span className="text-[12px] text-slate-400">Needs approval</span>
                          )}
                        </div>
                      );
                    })}
                    {m.res && m.res.toolsUsed.length > 0 && (
                      <div className="text-[11.5px] text-slate-400">
                        Sources: {[...new Set(m.res.toolsUsed.flatMap((t) => TOOL_SOURCES[t] ?? []))].join(", ")}
                      </div>
                    )}
                  </div>
                </div>
              )
            )}
            {busy && (
              <div className="flex items-center gap-2 text-[13px] text-slate-500">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Thinking…
              </div>
            )}
            <div ref={endRef} />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void ask(q);
            }}
            className="flex items-center gap-2 border-t border-slate-200 p-3"
          >
            <input value={q} onChange={(e) => setQ(e.target.value)} disabled={busy} placeholder="Ask SCIO…" className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[14px] text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-400" />
            <button type="submit" disabled={busy || !q.trim()} aria-label="Send" className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#111113] text-[#fff] ring-1 ring-[#fff]/10 transition hover:bg-[#2a2a30] disabled:opacity-40">
              <ArrowUp className="h-4 w-4" />
            </button>
          </form>
        </aside>
      </div>
    </div>
  );
}

function Panel({ title, right, children }: { title: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <h2 className="text-[14px] font-semibold text-slate-900">{title}</h2>
        {right}
      </div>
      {children}
    </section>
  );
}

function Stat({ label, value, note, noteTone, ask }: { label: string; value: string; note: string; noteTone: string; ask: React.ReactNode }) {
  return (
    <div className="min-w-0 px-5 py-4">
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-[12.5px] text-slate-500">{label}</span>
        {ask}
      </div>
      <div className="mt-0.5 text-[24px] font-semibold tabular-nums tracking-tight text-slate-900">{value}</div>
      <div className={cx("truncate text-[12px]", noteTone)}>{note}</div>
    </div>
  );
}


function Simple({ text }: { text: string }) {
  return (
    <div className="space-y-1.5 text-[14px] leading-relaxed text-slate-700">
      {text
        .split(/\n+/)
        .filter((l) => l.trim())
        .map((line, i) => {
          const bullet = /^\s*([*\-•]|\d+\.)\s+/.test(line);
          const body = line.replace(/^\s*([*\-•]|\d+\.)\s+/, "");
          const parts = body.split(/(\*\*[^*]+\*\*)/g).map((x, j) => (x.startsWith("**") && x.endsWith("**") ? <b key={j} className="font-semibold text-slate-900">{x.slice(2, -2)}</b> : <React.Fragment key={j}>{x}</React.Fragment>));
          return bullet ? (
            <div key={i} className="flex gap-2">
              <span className="mt-[10px] h-1 w-1 shrink-0 rounded-full bg-slate-400" />
              <span>{parts}</span>
            </div>
          ) : (
            <p key={i}>{parts}</p>
          );
        })}
    </div>
  );
}

/** SCIO's square face: blinks when idle, looks around when thinking, talks when answering. */
export function ScioFace({ mood = "idle", size = 44 }: { mood?: Mood; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className="shrink-0" aria-label={`SCIO is ${mood}`}>
      {/* antenna */}
      <line x1="32" y1="4" x2="32" y2="11" stroke="#111113" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="32" cy="4.5" r="3.2" fill="#f2a93b">
        {mood === "thinking" && <animate attributeName="opacity" values="1;0.3;1" dur="0.9s" repeatCount="indefinite" />}
      </circle>
      {/* head */}
      <rect x="6" y="11" width="52" height="48" rx="14" fill="#111113" />
      <rect x="11" y="16" width="42" height="38" rx="10" fill="#1d1d21" />
      {/* eyes */}
      <g>
        {mood === "thinking" && <animateTransform attributeName="transform" type="translate" values="0 0; -3 -1; 3 -1; 0 0" dur="1.6s" repeatCount="indefinite" />}
        <rect x="19" y="27" width="7" height="9" rx="3.5" fill="#f2a93b">
          {mood !== "thinking" && <animate attributeName="height" values="9;9;1;9" keyTimes="0;0.92;0.96;1" dur="4s" repeatCount="indefinite" />}
          {mood !== "thinking" && <animate attributeName="y" values="27;27;31;27" keyTimes="0;0.92;0.96;1" dur="4s" repeatCount="indefinite" />}
        </rect>
        <rect x="38" y="27" width="7" height="9" rx="3.5" fill="#f2a93b">
          {mood !== "thinking" && <animate attributeName="height" values="9;9;1;9" keyTimes="0;0.92;0.96;1" dur="4s" repeatCount="indefinite" />}
          {mood !== "thinking" && <animate attributeName="y" values="27;27;31;27" keyTimes="0;0.92;0.96;1" dur="4s" repeatCount="indefinite" />}
        </rect>
      </g>
      {/* mouth */}
      {mood === "talking" ? (
        <rect x="26" y="42" width="12" height="5" rx="2.5" fill="#f2a93b">
          <animate attributeName="height" values="2;6;3;6;2" dur="0.5s" repeatCount="indefinite" />
          <animate attributeName="y" values="44;41;43;41;44" dur="0.5s" repeatCount="indefinite" />
        </rect>
      ) : mood === "thinking" ? (
        <g fill="#f2a93b">
          {[25, 32, 39].map((cx, i) => (
            <circle key={cx} cx={cx} cy="45" r="1.8">
              <animate attributeName="opacity" values="0.2;1;0.2" dur="1.2s" begin={`${i * 0.2}s`} repeatCount="indefinite" />
            </circle>
          ))}
        </g>
      ) : (
        <path d="M24 42 Q32 49 40 42" fill="none" stroke="#f2a93b" strokeWidth="2.5" strokeLinecap="round" />
      )}
      {/* cheeks */}
      <circle cx="16" cy="41" r="2" fill="#f2a93b" opacity="0.25" />
      <circle cx="48" cy="41" r="2" fill="#f2a93b" opacity="0.25" />
    </svg>
  );
}
