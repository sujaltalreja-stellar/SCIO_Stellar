import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight, ArrowUp, Check, ChevronDown, Loader2, RotateCcw } from "lucide-react";
import { useRetail } from "../RetailContext";
import { salesPrev, salesTotals } from "../metrics";
import { useDemoAuth, readApi, scioHeaders } from "../../auth";
import type { ActionProposal, CopilotResponse, ChartVisual } from "../../copilotTypes";
import VisualView from "../../components/VisualView";
import { KIND, useProposalRunner } from "./AgentChat";
import { SOURCE, SOURCES, TOOL_SOURCES, type SourceId } from "../sources";
import { cx } from "../../ui";
import { aed, nf } from "../rui";

// ---------------------------------------------------------------------------
// Ask SCIO: the master assistant. Chat-first and deliberately quiet: one accent
// colour, borders over shadows, colour only for status.
// ---------------------------------------------------------------------------

const P = "/app/retail";

const SUGGESTIONS = [
  "Why are my Kuwait stores underperforming this month?",
  "Which stores will run out of stock this week?",
  "Which suppliers are delivering late?",
  "Create an action plan for today",
];

type Turn = { q: string; res?: CopilotResponse; at: Date; done: Record<string, number | "dismissed"> };

function greeting() {
  const h = Number(new Date().toLocaleString("en-GB", { hour: "2-digit", hour12: false, timeZone: "Asia/Dubai" }));
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

export default function OperatePage() {
  const { state, scope, can, kpis, problems } = useRetail();
  const { user } = useDemoAuth();
  const run = useProposalRunner();
  const location = useLocation();
  const [turns, setTurns] = useState<Turn[]>([]);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (turns.length) endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [turns, busy]);

  const ask = async (text: string) => {
    const question = text.trim();
    if (!question || busy) return;
    const history = turns.slice(-4).flatMap((t) => [{ role: "user" as const, content: t.q }, ...(t.res ? [{ role: "assistant" as const, content: t.res.answer }] : [])]);
    setTurns((t) => [...t, { q: question, at: new Date(), done: {} }]);
    setQ("");
    setBusy(true);
    let res: CopilotResponse;
    try {
      const r = await fetch("/api/scio/retail-copilot", { method: "POST", headers: scioHeaders(), body: JSON.stringify({ question, history, events: state.events, scope: scope ? [...scope] : null, mode: "card" }) });
      const data = await readApi<CopilotResponse>(r);
      if (!r.ok || data.error) throw new Error(data.error || `Request failed (${r.status})`);
      res = data;
    } catch (err) {
      res = { answer: `Something went wrong: ${err instanceof Error ? err.message : "request failed"}. Please try again.`, visuals: [], toolsUsed: [], followUps: [] };
    }
    setTurns((t) => t.map((x, i) => (i === t.length - 1 ? { ...x, res } : x)));
    setBusy(false);
    inputRef.current?.focus();
  };

  // A question passed from elsewhere (e.g. the top search bar).
  useEffect(() => {
    const preset = (location.state as { question?: string } | null)?.question;
    if (preset) void ask(preset);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const decide = (ti: number, p: ActionProposal, approve: boolean) => {
    const n = approve ? run(p) : "dismissed";
    setTurns((t) => t.map((x, i) => (i === ti ? { ...x, done: { ...x.done, [p.id]: n } } : x)));
  };

  // One consistent status line (same definitions as Home and Actions).
  const status = useMemo(() => {
    const t = salesTotals(state, scope, 30);
    const prev = salesPrev(state, scope, 30);
    return {
      sales: t.net,
      delta: prev.net ? (t.net / prev.net - 1) * 100 : 0,
      atRisk: kpis.stockoutRisks,
      urgent: problems.filter((p) => p.severity === "critical").length,
      open: problems.length,
    };
  }, [state, scope, kpis, problems]);

  const composer = (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void ask(q);
      }}
      className="flex items-end gap-2 rounded-xl border border-slate-300 bg-white p-2 pl-4 transition focus-within:border-slate-400 focus-within:ring-4 focus-within:ring-slate-100"
    >
      <textarea
        ref={inputRef}
        autoFocus
        rows={1}
        value={q}
        disabled={busy}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            void ask(q);
          }
        }}
        placeholder={turns.length ? "Ask a follow-up…" : "Ask about any store, product, supplier or system…"}
        className="max-h-40 min-h-[40px] flex-1 resize-none bg-transparent py-2 text-[15px] leading-6 text-slate-900 outline-none placeholder:text-slate-400"
      />
      {turns.length > 0 && (
        <button type="button" onClick={() => setTurns([])} title="New conversation" className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
          <RotateCcw className="h-4 w-4" />
        </button>
      )}
      <button type="submit" disabled={busy || !q.trim()} aria-label="Send" className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-slate-900 text-[#fff] transition hover:bg-slate-700 disabled:bg-slate-200 disabled:text-slate-400">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
      </button>
    </form>
  );

  // ---- Empty state ---------------------------------------------------------
  if (turns.length === 0) {
    return (
      <div className="mx-auto flex min-h-[calc(100vh-180px)] max-w-[720px] flex-col justify-center py-10">
        <h1 className="text-[28px] font-semibold tracking-tight text-slate-900">
          {greeting()}, {user?.name.split(" ")[0] ?? "there"}
        </h1>
        <p className="mt-1 text-[15px] text-slate-500">
          <span className="font-medium text-slate-800">Skip the dashboards. Just ask.</span> Any number, reason or next step — explained in plain words.
        </p>

        <div className="mt-6">{composer}</div>

        {/* Quiet status line: each part asks SCIO about it */}
        <div className="mt-3 flex flex-wrap items-center gap-x-1 text-[13px] text-slate-500">
          <StatusPart onClick={() => ask("How are my sales doing this month and what is driving the change?")}>
            Sales <b className="font-medium text-slate-800">{aed(status.sales)}</b>{" "}
            <span className={status.delta >= 0 ? "text-emerald-600" : "text-rose-600"}>
              {status.delta >= 0 ? "▲" : "▼"}
              {Math.abs(status.delta).toFixed(1)}%
            </span>
          </StatusPart>
          <Dot />
          <StatusPart onClick={() => ask("Which stores will run out of stock this week and what should I do?")}>
            <b className="font-medium text-slate-800">{nf(status.atRisk)}</b> SKUs at risk
          </StatusPart>
          <Dot />
          <StatusPart onClick={() => ask("What are my most urgent problems right now and what should I do first?")}>
            <b className="font-medium text-rose-600">{status.urgent}</b> urgent of {status.open} open issues
          </StatusPart>
        </div>

        <div className="mt-10">
          <div className="mb-2 text-[12px] font-medium uppercase tracking-wider text-slate-400">Try asking</div>
          <ul className="divide-y divide-slate-100 border-y border-slate-100">
            {SUGGESTIONS.map((s) => (
              <li key={s}>
                <button onClick={() => ask(s)} className="group flex w-full items-center justify-between py-3 text-left text-[14.5px] text-slate-700 transition hover:text-slate-900">
                  {s}
                  <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-600" />
                </button>
              </li>
            ))}
          </ul>
        </div>

        <Link to={`${P}/settings?tab=systems`} className="mt-8 inline-flex w-fit items-center gap-2 text-[12.5px] text-slate-500 hover:text-slate-800">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          {SOURCES.length} sources connected · ERP, POS, WMS and {SOURCES.length - 3} more
        </Link>
      </div>
    );
  }

  // ---- Conversation --------------------------------------------------------
  const last = turns[turns.length - 1];
  return (
    <div className="mx-auto flex max-w-[860px] flex-col gap-8 pb-4">
      {turns.map((t, i) => (
        <div key={i} className="space-y-4">
          <div className="ml-auto w-fit max-w-[80%] rounded-2xl bg-slate-100 px-4 py-2.5 text-[15px] text-slate-900">{t.q}</div>
          {t.res ? <Answer turn={t} onDecide={(p, a) => decide(i, p, a)} canDo={(k) => can(KIND[k].perm)} onAsk={ask} /> : <Thinking />}
        </div>
      ))}
      {!busy && last.res?.followUps?.length ? (
        <div className="flex flex-wrap gap-2 pl-10">
          {last.res.followUps.map((f) => (
            <button key={f} onClick={() => ask(f)} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[13px] text-slate-600 transition hover:border-slate-300 hover:text-slate-900">
              {f}
            </button>
          ))}
        </div>
      ) : null}
      <div ref={endRef} />
      <div className="sticky bottom-4 z-10 bg-gradient-to-t from-[var(--scio-page)] via-[var(--scio-page)] to-transparent pt-4">{composer}</div>
    </div>
  );
}

function StatusPart({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} className="rounded px-1 py-0.5 transition hover:bg-slate-100 hover:text-slate-800">
      {children}
    </button>
  );
}
const Dot = () => <span className="text-slate-300">·</span>;

function Mark() {
  return <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-slate-900 text-[13px] font-bold text-[#fff]">S</span>;
}

function Thinking() {
  return (
    <div className="flex items-start gap-3">
      <Mark />
      <div className="flex-1 space-y-2 pt-1">
        <div className="flex items-center gap-2 text-[13px] text-slate-500">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Reading your systems…
        </div>
        <div className="h-3 w-3/4 animate-pulse rounded bg-slate-100" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100" />
      </div>
    </div>
  );
}

function Answer({ turn, onDecide, canDo, onAsk }: { turn: Turn; onDecide: (p: ActionProposal, approve: boolean) => void; canDo: (k: ActionProposal["kind"]) => boolean; onAsk: (q: string) => void }) {
  const res = turn.res!;
  const card = res.card;
  const chart = res.visuals.find((v) => v.kind !== "table") as ChartVisual | undefined;
  const table = res.visuals.find((v) => v.kind === "table");
  const systems = [...new Set(res.toolsUsed.flatMap((t) => TOOL_SOURCES[t] ?? []))] as SourceId[];
  const [evidence, setEvidence] = useState(false);
  const [steps, setSteps] = useState(false);
  const time = turn.at.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="flex items-start gap-3">
      <Mark />
      <div className="min-w-0 flex-1 space-y-4">
        {res.steps && res.steps.length > 0 && (
          <div>
            <button onClick={() => setSteps((s) => !s)} className="inline-flex items-center gap-1 text-[12.5px] text-slate-500 hover:text-slate-800">
              Checked {systems.length || res.toolsUsed.length} sources in {res.steps.length} steps
              <ChevronDown className={cx("h-3.5 w-3.5 transition", steps && "rotate-180")} />
            </button>
            {steps && (
              <ol className="mt-2 space-y-1 border-l border-slate-200 pl-3 text-[12.5px] text-slate-500">
                {res.steps.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ol>
            )}
          </div>
        )}

        {card ? (
          <>
            <div>
              <h3 className="text-[16px] font-semibold text-slate-900">{card.headline}</h3>
              <p className="mt-1 text-[15px] leading-relaxed text-slate-700">{card.summary}</p>
            </div>

            {card.kpis.length > 0 && (
              <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-slate-200 bg-white sm:flex sm:divide-x sm:divide-slate-200">
                {card.kpis.slice(0, 4).map((k) => (
                  <div key={k.label} className="min-w-0 flex-1 px-4 py-3">
                    <div className="truncate text-[12.5px] text-slate-500">{k.label}</div>
                    <div className="mt-0.5 truncate text-[20px] font-semibold tabular-nums text-slate-900">{k.value}</div>
                    {k.note && (
                      <div className={cx("truncate text-[12px]", k.tone === "bad" ? "text-rose-600" : k.tone === "good" ? "text-emerald-600" : "text-slate-500")} title={k.note}>
                        {k.note}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {card.drivers.length > 0 && (
              <div>
                <div className="mb-1.5 text-[12px] font-medium uppercase tracking-wider text-slate-400">Why</div>
                <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
                  {card.drivers.map((d) => (
                    <li key={d.title} className="flex items-start justify-between gap-4 px-4 py-3">
                      <div className="min-w-0">
                        <div className="text-[14px] font-medium text-slate-900">{d.title}</div>
                        <div className="text-[13px] text-slate-500">{d.detail}</div>
                      </div>
                      {d.impact && <span className="shrink-0 pt-0.5 text-[13px] font-medium tabular-nums text-rose-600">{d.impact.replace(/^~/, "").replace(/\s*impact$/i, "")}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        ) : (
          <SimpleText text={res.answer} />
        )}

        {/* Drafted actions */}
        {res.proposals && res.proposals.length > 0 && (
          <div>
            <div className="mb-1.5 text-[12px] font-medium uppercase tracking-wider text-slate-400">Ready for your approval</div>
            <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
              {res.proposals.map((p) => {
                const st = turn.done[p.id];
                const k = KIND[p.kind];
                return (
                  <li key={p.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                    <k.icon className="h-4 w-4 shrink-0 text-slate-400" />
                    <div className="min-w-0 flex-1">
                      <div className="text-[14px] font-medium text-slate-900">{p.title}</div>
                      <div className="text-[12.5px] text-slate-500">
                        {p.detail} · protects <span className="tabular-nums text-slate-700">{aed(p.impact)}</span>
                      </div>
                    </div>
                    {typeof st === "number" ? (
                      <span className="inline-flex items-center gap-1 text-[13px] font-medium text-emerald-700">
                        <Check className="h-4 w-4" /> {st} created
                      </span>
                    ) : st === "dismissed" ? (
                      <span className="text-[13px] text-slate-400">Dismissed</span>
                    ) : canDo(p.kind) ? (
                      <div className="flex gap-1.5">
                        <button onClick={() => onDecide(p, false)} className="rounded-lg px-2.5 py-1.5 text-[13px] text-slate-500 hover:bg-slate-100">
                          Dismiss
                        </button>
                        <button onClick={() => onDecide(p, true)} className="rounded-lg bg-slate-900 px-3 py-1.5 text-[13px] font-medium text-[#fff] hover:bg-slate-700">
                          Approve
                        </button>
                      </div>
                    ) : (
                      <span className="text-[12.5px] text-slate-400">Needs manager approval</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Next steps (only those not already drafted) */}
        {card && card.next.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {(res.proposals?.length ? card.next.slice(0, 1) : card.next.slice(0, 3)).map((n) => (
              <button key={n} onClick={() => onAsk(n)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-left text-[13px] text-slate-700 transition hover:border-slate-300 hover:text-slate-900">
                {n} <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
              </button>
            ))}
          </div>
        )}

        {/* Footer: sources + data */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px] text-slate-500">
          {systems.length > 0 && (
            <span>
              Sources:{" "}
              {systems.map((id, i) => (
                <React.Fragment key={id}>
                  {i > 0 && ", "}
                  <span title={`${SOURCE[id].name} · ${SOURCE[id].provides}`} className="text-slate-700 underline decoration-slate-300 decoration-dotted underline-offset-2">
                    {id}
                  </span>
                </React.Fragment>
              ))}
            </span>
          )}
          <span>· {time}</span>
          {(table || chart) && (
            <button onClick={() => setEvidence((v) => !v)} className="font-medium text-slate-700 hover:text-slate-900">
              · {evidence ? "Hide data" : "Show data"}
            </button>
          )}
        </div>
        {evidence && (
          <div className="grid gap-4 lg:grid-cols-2">
            {chart && (
              <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-3">
                <VisualView visual={chart} index={0} />
              </div>
            )}
            {table && (
              <div className="min-w-0 overflow-x-auto rounded-xl border border-slate-200 bg-white p-3">
                <VisualView visual={table} index={1} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/** Plain reply: paragraphs and bullets, **bold** kept. */
function SimpleText({ text }: { text: string }) {
  return (
    <div className="space-y-2 text-[15px] leading-relaxed text-slate-700">
      {text
        .split(/\n+/)
        .filter((l) => l.trim())
        .map((line, i) => {
          const bullet = /^\s*([*\-•]|\d+\.)\s+/.test(line);
          const body = line.replace(/^\s*([*\-•]|\d+\.)\s+/, "");
          const parts = body.split(/(\*\*[^*]+\*\*)/g).map((x, j) => (x.startsWith("**") && x.endsWith("**") ? <b key={j} className="font-semibold text-slate-900">{x.slice(2, -2)}</b> : <React.Fragment key={j}>{x}</React.Fragment>));
          return bullet ? (
            <div key={i} className="flex gap-2.5">
              <span className="mt-[11px] h-1 w-1 shrink-0 rounded-full bg-slate-400" />
              <span>{parts}</span>
            </div>
          ) : (
            <p key={i}>{parts}</p>
          );
        })}
    </div>
  );
}
