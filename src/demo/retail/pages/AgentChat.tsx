import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeftRight, ArrowUp, Bot, CalendarClock, Check, ChevronDown, ExternalLink, Loader2, RotateCcw, ShoppingCart, Sparkles, Wrench, X } from "lucide-react";
import { useRetail } from "../RetailContext";
import { readApi, scioHeaders } from "../../auth";
import { equipmentIssues, expiryRisks, stockoutRisks } from "../analytics";
import { TECHNICIANS } from "../generate";
import { newId } from "../state";
import type { Permission } from "../rbac";
import type { ActionProposal, CopilotResponse, ProposalKind } from "../../copilotTypes";
import { cx } from "../../ui";
import { aed } from "../rui";

// ---------------------------------------------------------------------------
// SCIO Agent on the Home page: answers questions from live data and drafts
// real operations (transfers, POs, technician dispatch, markdowns). Nothing runs
// until the user approves; approval writes the same events as the rest of the app.
// ---------------------------------------------------------------------------

type Turn =
  | { role: "user"; content: string }
  | { role: "assistant"; res: CopilotResponse; done: Record<string, "approved" | "dismissed" | undefined>; created: Record<string, number> };

export const KIND: Record<ProposalKind, { icon: React.ElementType; verb: string; perm: Permission; tone: string }> = {
  transfer: { icon: ArrowLeftRight, verb: "Approve transfers", perm: "transfer.create", tone: "bg-blue-50 text-blue-600" },
  reorder: { icon: ShoppingCart, verb: "Raise purchase orders", perm: "po.create", tone: "bg-blue-50 text-blue-600" },
  technician: { icon: Wrench, verb: "Dispatch technicians", perm: "ticket.create", tone: "bg-amber-50 text-amber-600" },
  markdown: { icon: CalendarClock, verb: "Apply markdowns", perm: "markdown.apply", tone: "bg-rose-50 text-rose-600" },
};

const STARTERS = ["Fix today's stockouts", "Dispatch technicians for open equipment faults", "Why is S118 losing sales?", "Mark down products about to expire"];

export default function AgentChat() {
  const { state, scope, can } = useRetail();
  const execute = useProposalRunner();
  const [turns, setTurns] = useState<Turn[]>([]);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (turns.length) endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [turns, busy]);

  const ask = async (text: string) => {
    const question = text.trim();
    if (!question || busy) return;
    const history = turns.slice(-6).map((t) => (t.role === "user" ? { role: "user" as const, content: t.content } : { role: "assistant" as const, content: t.res.answer }));
    setTurns((t) => [...t, { role: "user", content: question }]);
    setQ("");
    setBusy(true);
    try {
      const res = await fetch("/api/scio/retail-copilot", { method: "POST", headers: scioHeaders(), body: JSON.stringify({ question, history, events: state.events, scope: scope ? [...scope] : null }) });
      const data = await readApi<CopilotResponse>(res);
      if (!res.ok || data.error) throw new Error(data.error || `Request failed (${res.status})`);
      setTurns((t) => [...t, { role: "assistant", res: data, done: {}, created: {} }]);
    } catch (err) {
      setTurns((t) => [...t, { role: "assistant", res: { answer: `⚠ ${err instanceof Error ? err.message : "Request failed"}`, visuals: [], toolsUsed: [], followUps: [] }, done: {}, created: {} }]);
    } finally {
      setBusy(false);
    }
  };

  const decide = (turnIdx: number, p: ActionProposal, verdict: "approved" | "dismissed") => {
    const count = verdict === "approved" ? execute(p) : 0;
    setTurns((all) => all.map((t, i) => (i === turnIdx && t.role === "assistant" ? { ...t, done: { ...t.done, [p.id]: verdict }, created: { ...t.created, [p.id]: count } } : t)));
  };

  return (
    <div className="scio-rise overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-[0_10px_30px_-12px_rgba(15,23,42,0.18)] [animation-delay:180ms]">
      <div className="flex items-center gap-3 border-b border-slate-100 bg-gradient-to-r from-blue-50 via-white to-white px-5 py-3.5">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[#111113] to-[#2a2a30] text-[#fff] shadow-md shadow-black/20">
          <Bot className="h-5 w-5" />
        </span>
        <div className="flex-1 leading-tight">
          <div className="text-[15px] font-bold text-slate-900">SCIO Agent</div>
          <div className="text-[12px] text-slate-500">Ask anything, or tell it what to fix. You approve every action.</div>
        </div>
        {turns.length > 0 && (
          <button onClick={() => setTurns([])} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12.5px] font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-800">
            <RotateCcw className="h-3.5 w-3.5" /> New
          </button>
        )}
      </div>

      {(turns.length > 0 || busy) && (
        <div className="max-h-[560px] space-y-4 overflow-y-auto bg-slate-50/60 px-5 py-4">
          {turns.map((t, i) =>
            t.role === "user" ? (
              <div key={i} className="ml-auto w-fit max-w-[80%] rounded-2xl rounded-br-md bg-[#111113] px-4 py-2.5 text-[14px] text-[#fff]">{t.content}</div>
            ) : (
              <AssistantTurn key={i} t={t} onDecide={(p, v) => decide(i, p, v)} canDo={(k) => can(KIND[k].perm)} onFollow={ask} />
            )
          )}
          {busy && (
            <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-[13.5px] text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin text-blue-500" /> SCIO is checking POS, WMS, ERP and IoT data…
            </div>
          )}
          <div ref={endRef} />
        </div>
      )}

      <form onSubmit={(e) => { e.preventDefault(); void ask(q); }} className="flex items-center gap-3 px-4 py-3">
        <Sparkles className="h-5 w-5 shrink-0 text-[#e8901a]" />
        <input value={q} onChange={(e) => setQ(e.target.value)} disabled={busy} placeholder={turns.length ? "Ask a follow-up or tell SCIO what to do…" : "Ask SCIO anything, or say “fix today's stockouts”…"} className="w-full bg-transparent py-2 text-[15px] text-slate-900 outline-none placeholder:text-slate-400" />
        <button type="submit" disabled={busy || !q.trim()} aria-label="Send" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#111113] text-[#fff] transition hover:bg-[#2a2a30] disabled:opacity-40">
          <ArrowUp className="h-4 w-4" />
        </button>
      </form>
      {turns.length === 0 && (
        <div className="flex flex-wrap gap-2 px-4 pb-4">
          {STARTERS.map((s) => (
            <button key={s} onClick={() => ask(s)} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[12.5px] font-medium text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700">{s}</button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Executes an approved SCIO proposal against current state; returns operations created. */
export function useProposalRunner() {
  const { state, scope, dispatch, can } = useRetail();
  /** Run an approved proposal against the current state. Returns how many operations were created. */
  return (p: ActionProposal): number => {
    const { base } = state;
    const want = new Set(p.itemIds);
    let n = 0;
    if (p.kind === "transfer" || p.kind === "reorder") {
      for (const r of stockoutRisks(state, scope).filter((x) => want.has(x.id))) {
        if (p.kind === "transfer" && r.donor) {
          const transferId = newId("TRF");
          dispatch({ type: "transfer_create", transferId, skuIdx: r.skuIdx, from: { type: r.donor.type, idx: r.donor.idx }, toStore: r.storeIdx, qty: r.donor.qty, reason: "SCIO agent · stockout risk", alertId: r.id });
          if (can("transfer.approve")) dispatch({ type: "transfer_approve", transferId });
          n++;
        } else if (p.kind === "reorder" && !r.donor) {
          const sku = base.skus[r.skuIdx];
          const poId = newId("PO");
          dispatch({ type: "po_create", poId, supplierIdx: sku.supplierIdx, destType: "store", destIdx: r.storeIdx, lines: [{ skuIdx: r.skuIdx, qty: Math.max(1, Math.round(r.needQty)), unitCost: sku.cost }], reason: "SCIO agent · stockout, no internal stock", leadDays: base.suppliers[sku.supplierIdx].leadTimeDays, alertId: r.id });
          if (can("po.approve")) dispatch({ type: "po_approve", poId });
          n++;
        }
      }
    } else if (p.kind === "technician") {
      for (const e of equipmentIssues(state, scope).filter((x) => want.has(x.id) && !x.ticketId)) {
        const tech = TECHNICIANS.find((t) => (e.equipment.type === "POS Terminal" ? t.includes("POS") : e.equipment.type === "HVAC" ? t.includes("HVAC") : e.equipment.type === "Generator" ? t.includes("Generator") : t.includes("Cold") || t.includes("Refrigeration"))) ?? TECHNICIANS[0];
        const ticketId = newId("TCK");
        dispatch({ type: "ticket_create", ticketId, equipmentId: e.equipment.id, storeIdx: e.storeIdx, issue: e.equipment.fault?.kind ?? "Fault", priority: e.severity === "critical" ? "P1" : "P2", alertId: e.id });
        if (can("ticket.assign")) dispatch({ type: "ticket_assign", ticketId, technician: tech });
        n++;
      }
    } else {
      for (const x of expiryRisks(state, scope).filter((r) => want.has(r.id) && !r.markedDown)) {
        dispatch({ type: "markdown", storeIdx: x.storeIdx, skuIdx: x.skuIdx, lot: x.lot, pct: state.thresholds.markdownPct, alertId: x.id });
        n++;
      }
    }
    return n;
  };

}

function AssistantTurn({ t, onDecide, canDo, onFollow }: { t: Extract<Turn, { role: "assistant" }>; onDecide: (p: ActionProposal, v: "approved" | "dismissed") => void; canDo: (k: ProposalKind) => boolean; onFollow: (q: string) => void }) {
  const [showSteps, setShowSteps] = useState(false);
  const { res } = t;
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-[#111113] to-[#2a2a30] text-[#fff]"><Bot className="h-4 w-4" /></span>
      <div className="min-w-0 flex-1 space-y-3">
        {res.steps && res.steps.length > 0 && (
          <button onClick={() => setShowSteps((s) => !s)} className="inline-flex items-center gap-1.5 text-[12px] font-medium text-slate-500 hover:text-slate-800">
            <Check className="h-3.5 w-3.5 text-emerald-500" /> {res.steps.length} steps · {res.toolsUsed.length} data sources
            <ChevronDown className={cx("h-3.5 w-3.5 transition", showSteps && "rotate-180")} />
          </button>
        )}
        {showSteps && (
          <ol className="space-y-1 border-l-2 border-blue-100 pl-3 text-[12.5px] text-slate-600">
            {res.steps!.map((s, i) => <li key={i}>{s}</li>)}
          </ol>
        )}
        <div className="rounded-2xl rounded-tl-md border border-slate-200 bg-white px-4 py-3 text-[14px] leading-relaxed text-slate-800">
          <Rich text={res.answer} />
        </div>

        {res.proposals?.map((p) => {
          const k = KIND[p.kind];
          const state = t.done[p.id];
          return (
            <div key={p.id} className={cx("rounded-2xl border p-4 transition", state === "approved" ? "border-emerald-200 bg-emerald-50/60" : state === "dismissed" ? "border-slate-200 bg-slate-50 opacity-60" : "border-blue-200 bg-white shadow-sm")}>
              <div className="flex flex-wrap items-center gap-3">
                <span className={cx("grid h-10 w-10 shrink-0 place-items-center rounded-xl", k.tone)}><k.icon className="h-5 w-5" /></span>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-blue-600">Drafted by SCIO · needs approval</div>
                  <div className="text-[15px] font-bold text-slate-900">{p.title}</div>
                  <div className="text-[12.5px] text-slate-500">{p.detail} · <b className="text-emerald-600">{aed(p.impact)}</b> protected</div>
                </div>
                {state === "approved" ? (
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-[13px] font-semibold text-[#fff]"><Check className="h-4 w-4" /> {t.created[p.id] ?? 0} created</span>
                ) : state === "dismissed" ? (
                  <span className="text-[13px] font-medium text-slate-500">Dismissed</span>
                ) : canDo(p.kind) ? (
                  <div className="flex gap-2">
                    <button onClick={() => onDecide(p, "dismissed")} className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[13px] font-semibold text-slate-600 hover:bg-slate-50"><X className="h-4 w-4" /> Dismiss</button>
                    <button onClick={() => onDecide(p, "approved")} className="inline-flex items-center gap-1.5 rounded-xl bg-[#111113] px-3.5 py-2 text-[13px] font-semibold text-[#fff] shadow-sm hover:bg-[#2a2a30]"><Check className="h-4 w-4" /> {k.verb}</button>
                  </div>
                ) : (
                  <span className="text-[12.5px] text-slate-500">Your role can't approve this</span>
                )}
              </div>
            </div>
          );
        })}

        {(res.actions?.length || res.followUps?.length) ? (
          <div className="flex flex-wrap gap-2">
            {res.actions?.map((a) => (
              <Link key={a.to} to={a.to} className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-[12.5px] font-semibold text-blue-700 hover:bg-blue-100">
                {a.label} <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            ))}
            {res.followUps?.map((f) => (
              <button key={f} onClick={() => onFollow(f)} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[12.5px] text-slate-700 hover:border-blue-300 hover:text-blue-700">{f}</button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

/** Minimal markdown: **bold**, bullet lines, paragraphs. */
function Rich({ text }: { text: string }) {
  return (
    <div className="space-y-1.5">
      {text.split(/\n+/).filter((l) => l.trim()).map((line, i) => {
        const bullet = /^\s*[*-]\s+/.test(line);
        const body = line.replace(/^\s*[*-]\s+/, "");
        const parts = body.split(/(\*\*[^*]+\*\*)/g).map((s, j) => (s.startsWith("**") && s.endsWith("**") ? <b key={j} className="font-semibold text-slate-900">{s.slice(2, -2)}</b> : <React.Fragment key={j}>{s}</React.Fragment>));
        return bullet ? (
          <div key={i} className="flex gap-2"><span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" /><span>{parts}</span></div>
        ) : (
          <p key={i}>{parts}</p>
        );
      })}
    </div>
  );
}
