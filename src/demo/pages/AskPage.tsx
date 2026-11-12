import React, { useEffect, useRef, useState } from "react";
import { readApi, scioHeaders } from "../auth";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowUp, Sparkles, Database, RotateCcw, PackageX, Wrench, Wallet, Truck, ClipboardX, Coins } from "lucide-react";
import type { CopilotResponse, CopilotTurn } from "../copilotTypes";
import VisualView from "../components/VisualView";
import { cx } from "../ui";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  response?: CopilotResponse;
  error?: string;
}

const SUGGESTIONS = [
  { icon: PackageX, q: "Which warehouse has the highest inventory shortage?" },
  { icon: Wrench, q: "Which assets have overdue maintenance?" },
  { icon: Wallet, q: "What are the top 10 items consuming the most procurement budget?" },
  { icon: Truck, q: "Which suppliers have the highest delivery delays?" },
  { icon: ClipboardX, q: "Show me assets with repeated inspection failures." },
  { icon: Coins, q: "What is the estimated financial impact of current stock shortages?" },
  { icon: PackageX, q: "Which parts should we reorder this week, and how many?" },
  { icon: Wrench, q: "Which machines are likely to fail soon?" },
];

const TOOL_LABELS: Record<string, string> = {
  get_business_overview: "Business KPIs",
  get_stock_shortages: "Inventory levels",
  get_overdue_maintenance: "Maintenance schedule",
  get_top_spend_items: "Purchase orders",
  get_supplier_performance: "Supplier deliveries",
  get_repeat_inspection_failures: "Inspection records",
  estimate_shortage_financial_impact: "Inventory × maintenance × cost model",
  get_asset_risk: "Sensor history",
  get_excess_inventory: "Inventory levels",
  get_spend_analysis: "Procurement ledger",
  get_reorder_recommendations: "Demand forecast",
  get_asset_health: "Asset health model",
  get_retail_overview: "Retail KPIs",
  get_stockout_forecast: "Store stock & sales velocity",
  get_overstock: "Store stock",
  get_transfer_recommendations: "Transfer engine",
  diagnose_store: "Store diagnosis",
  get_expiring_products: "Batches & expiry",
  get_inventory_accuracy: "Cycle counts & sales",
  get_equipment_issues: "IoT equipment",
  get_sku_analysis: "SKU master & stock",
};

const THINKING_STEPS = ["Understanding your question", "Querying operational data", "Analysing figures", "Preparing recommendation"];

/** Tiny, safe markdown renderer for bold text, bullets and the Recommendation line. */
function RichText({ text }: { text: string }) {
  const inline = (s: string) =>
    s.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
      part.startsWith("**") && part.endsWith("**") ? (
        <strong key={i} className="font-semibold text-slate-900">
          {part.slice(2, -2)}
        </strong>
      ) : (
        <React.Fragment key={i}>{part}</React.Fragment>
      )
    );
  const lines = text.split("\n").map((l) => l.trimEnd()).filter((l, i, arr) => l.trim() || (i > 0 && arr[i - 1].trim()));
  const out: React.ReactNode[] = [];
  let bullets: string[] = [];
  const flush = () => {
    if (bullets.length) {
      out.push(
        <ul key={`ul${out.length}`} className="my-2 space-y-1.5">
          {bullets.map((b, i) => (
            <li key={i} className="flex gap-2.5">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-sky-400" />
              <span>{inline(b)}</span>
            </li>
          ))}
        </ul>
      );
      bullets = [];
    }
  };
  for (const raw of lines) {
    const l = raw.trim();
    if (/^[-*•]\s+/.test(l)) {
      bullets.push(l.replace(/^[-*•]\s+/, ""));
      continue;
    }
    flush();
    if (!l) continue;
    if (/^\**recommendation:?\**/i.test(l)) {
      out.push(
        <div key={`r${out.length}`} className="mt-3 flex gap-2.5 rounded-xl border border-teal-200 bg-gradient-to-r from-teal-50 to-blue-50 p-3 text-teal-700">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" />
          <span>{inline(l.replace(/^\**recommendation:?\**\s*/i, ""))}</span>
        </div>
      );
    } else {
      out.push(
        <p key={`p${out.length}`} className="my-1.5">
          {inline(l.replace(/^#+\s*/, ""))}
        </p>
      );
    }
  }
  flush();
  return <div className="text-[14px] leading-relaxed text-slate-600">{out}</div>;
}

function Thinking() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep((s) => Math.min(s + 1, THINKING_STEPS.length - 1)), 700);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="flex gap-3">
      <Avatar />
      <div className="space-y-1.5 pt-1">
        {THINKING_STEPS.slice(0, step + 1).map((s, i) => (
          <div key={s} className={cx("flex items-center gap-2 text-sm", i === step ? "text-slate-800" : "text-slate-500")}>
            {i === step ? (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
            ) : (
              <span className="flex h-3.5 w-3.5 items-center justify-center text-[10px] text-emerald-600">✓</span>
            )}
            {s}
          </div>
        ))}
      </div>
    </div>
  );
}

function Avatar() {
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#2563eb] shadow-sm shadow-blue-600/20">
      <Sparkles className="h-4 w-4 text-[#fff]" />
    </span>
  );
}

export interface AskConfig {
  endpoint?: string;
  suggestions?: Array<{ icon: typeof PackageX; q: string }>;
  extraBody?: () => Record<string, unknown>;
  intro?: string;
}

export default function AskPage({ endpoint = "/api/scio/copilot", suggestions = SUGGESTIONS, extraBody, intro }: AskConfig = {}) {
  const location = useLocation();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(1);
  const consumedState = useRef(false);

  const send = async (question: string) => {
    const q = question.trim();
    if (!q || busy) return;
    const history: CopilotTurn[] = messages.filter((m) => !m.error).map((m) => ({ role: m.role, content: m.content }));
    setMessages((ms) => [...ms, { id: idRef.current++, role: "user", content: q }]);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: scioHeaders(),
        body: JSON.stringify({ question: q, history, ...(extraBody ? extraBody() : {}) }),
      });
      const data = await readApi<CopilotResponse>(res);
      if (!res.ok || data.error) throw new Error(data.error || `Request failed (${res.status})`);
      setMessages((ms) => [...ms, { id: idRef.current++, role: "assistant", content: data.answer, response: data }]);
    } catch (e: any) {
      setMessages((ms) => [...ms, { id: idRef.current++, role: "assistant", content: "", error: e?.message || "Something went wrong" }]);
    } finally {
      setBusy(false);
    }
  };

  // Question passed from the top search bar.
  useEffect(() => {
    const q = (location.state as { question?: string } | null)?.question;
    if (q && !consumedState.current) {
      consumedState.current = true;
      navigate(location.pathname, { replace: true, state: null });
      void send(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, busy]);

  const empty = messages.length === 0;

  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-4xl flex-col">
      {empty ? (
        <div className="flex flex-1 flex-col items-center justify-center py-10 text-center">
          <div className="relative">
            <div className="absolute inset-0 -z-10 animate-pulse rounded-full bg-indigo-500/30 blur-2xl" />
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#2563eb] shadow-xl shadow-indigo-500/30">
              <Sparkles className="h-7 w-7 text-[#fff]" />
            </span>
          </div>
          <h1 className="mt-6 text-3xl font-semibold tracking-tight text-slate-900">Ask anything about your business</h1>
          <p className="mt-2 max-w-lg text-sm text-slate-500">
            {intro ?? "SCIO reads your inventory, maintenance, purchasing and supplier data, then answers with figures, charts and a recommended next step."}
          </p>
          <div className="mt-8 grid w-full gap-3 sm:grid-cols-2">
            {suggestions.map(({ icon: Icon, q }) => (
              <button
                key={q}
                onClick={() => send(q)}
                className="group flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-left text-sm text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-slate-900"
              >
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-blue-700 transition group-hover:text-teal-700" />
                {q}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 space-y-8 pb-6">
          <div className="flex justify-end">
            <button
              onClick={() => setMessages([])}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-slate-500 hover:bg-slate-100 hover:text-slate-600"
            >
              <RotateCcw className="h-3.5 w-3.5" /> New conversation
            </button>
          </div>
          {messages.map((m) =>
            m.role === "user" ? (
              <div key={m.id} className="flex justify-end">
                <div className="max-w-[85%] rounded-2xl rounded-br-md bg-[#2563eb] px-4 py-2.5 text-sm text-[#fff] shadow-lg shadow-blue-900/10">
                  {m.content}
                </div>
              </div>
            ) : (
              <div key={m.id} className="flex gap-3">
                <Avatar />
                <div className="min-w-0 flex-1">
                  {m.error ? (
                    <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-600">{m.error}</div>
                  ) : (
                    <>
                      {m.response?.steps && m.response.steps.length > 0 && (
                        <details className="group mb-3 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-[12.5px] text-slate-600" open={m.id === messages[messages.length - 1].id}>
                          <summary className="flex cursor-pointer list-none items-center gap-2 font-semibold text-slate-700">
                            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] text-[#fff]">✓</span>
                            Worked through {m.response.steps.length} steps
                            <span className="ml-auto text-[11px] font-normal text-slate-400 group-open:hidden">show</span>
                          </summary>
                          <ol className="mt-2 space-y-1.5 border-l border-slate-200 pl-4">
                            {m.response.steps.map((s, i) => (
                              <li key={i} className="relative">
                                <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full border-2 border-[#fff] bg-emerald-500" />
                                {s}
                              </li>
                            ))}
                          </ol>
                        </details>
                      )}
                      <RichText text={m.content} />
                      {m.response && m.response.toolsUsed.length > 0 && (
                        <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
                          <Database className="h-3.5 w-3.5" /> Sources:
                          {Array.from(new Set(m.response.toolsUsed.map((t) => TOOL_LABELS[t] ?? t))).map((t) => (
                            <span key={t} className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-slate-500">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                      {m.response && m.response.visuals.length > 0 && (
                        <div className="mt-4 grid gap-3">
                          {m.response.visuals.map((v, i) => (
                            <VisualView key={i} visual={v} index={m.id * 10 + i} />
                          ))}
                        </div>
                      )}
                      {m.response?.actions && m.response.actions.length > 0 && (
                        <div className="mt-4 flex flex-wrap items-center gap-2">
                          <span className="text-[12px] font-semibold text-slate-500">Take action:</span>
                          {m.response.actions.map((a, i) => (
                            <button
                              key={a.to}
                              onClick={() => navigate(a.to)}
                              className={cx(
                                "inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[13px] font-semibold transition",
                                i === 0 ? "bg-[#2563eb] text-[#fff] shadow-sm hover:bg-[#1d4ed8]" : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                              )}
                            >
                              {a.label} →
                            </button>
                          ))}
                        </div>
                      )}
                      {m.response && m.response.followUps.length > 0 && m.id === messages[messages.length - 1].id && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {m.response.followUps.map((f) => (
                            <button
                              key={f}
                              onClick={() => send(f)}
                              disabled={busy}
                              className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs text-blue-700 transition hover:border-blue-300 hover:bg-blue-50"
                            >
                              {f}
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )
          )}
          {busy && <Thinking />}
          <div ref={endRef} />
        </div>
      )}

      {/* Composer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void send(input);
        }}
        className="sticky bottom-4 mt-4 flex items-end gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-900/10 backdrop-blur-xl focus-within:border-blue-200"
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send(input);
            }
          }}
          rows={1}
          placeholder={empty ? "e.g. Which parts will run out this month?" : "Ask a follow-up…"}
          className="max-h-40 min-h-[44px] flex-1 resize-none bg-transparent px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-500"
        />
        <button
          type="submit"
          disabled={!input.trim() || busy}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#2563eb] text-[#fff] transition enabled:hover:bg-[#1d4ed8] disabled:opacity-40"
          aria-label="Send"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
