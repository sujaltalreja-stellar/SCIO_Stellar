import React, { useEffect, useRef, useState } from "react";
import { ArrowUp, Bot, Coins, Layers, Loader2, PackageX, Sparkles, TrendingDown, X } from "lucide-react";
import { useRetail } from "../RetailContext";
import { readApi, scioHeaders } from "../../auth";
import { cx } from "../../ui";
import { aed, nf } from "../rui";

// ---------------------------------------------------------------------------
// SKU Intelligence header: four tiles that show what is happening, one line on
// why, and a mini SCIO chat that answers from the live retail data.
// ---------------------------------------------------------------------------

export interface SkuStatRow {
  sku: { name: string; category: string; supplierIdx?: number };
  oosStores: number;
  dos: number;
  velocity: number;
  value: number;
}

export function SkuInsightStrip({ rows, overstockDays, onFilter }: { rows: SkuStatRow[]; overstockDays: number; onFilter: (key: "oos" | "low" | "over" | "value") => void }) {
  const oos = rows.filter((r) => r.oosStores > 0);
  const low = rows.filter((r) => r.dos < 5 && r.oosStores === 0);
  const over = rows.filter((r) => r.dos > overstockDays && r.dos < 900);
  const value = rows.reduce((a, r) => a + r.value, 0);
  const overValue = over.reduce((a, r) => a + r.value, 0);

  // Why: the category with the most out-of-stock SKUs.
  const byCat = new Map<string, number>();
  for (const r of oos) byCat.set(r.sku.category, (byCat.get(r.sku.category) ?? 0) + 1);
  const topCat = [...byCat].sort((a, b) => b[1] - a[1])[0];
  const fast = oos.filter((r) => r.velocity > 30).length;

  const tiles = [
    { key: "oos" as const, label: "Out of stock", value: nf(oos.length), sub: "SKUs in ≥1 store", icon: PackageX, tone: "from-rose-500 to-rose-600", bg: "bg-rose-50", text: "text-rose-600" },
    { key: "low" as const, label: "Running low", value: nf(low.length), sub: "under 5 days of cover", icon: TrendingDown, tone: "from-amber-400 to-amber-500", bg: "bg-amber-50", text: "text-amber-600" },
    { key: "over" as const, label: "Overstocked", value: nf(over.length), sub: `${aed(overValue)} tied up`, icon: Layers, tone: "from-blue-500 to-blue-600", bg: "bg-blue-50", text: "text-blue-600" },
    { key: "value" as const, label: "Stock value", value: aed(value), sub: `${nf(rows.length)} SKUs`, icon: Coins, tone: "from-emerald-500 to-emerald-600", bg: "bg-emerald-50", text: "text-emerald-600" },
  ];

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {tiles.map((t, i) => (
          <button key={t.key} onClick={() => onFilter(t.key)} style={{ animationDelay: `${i * 50}ms` }} className="scio-rise scio-lift group flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 text-left shadow-sm">
            <span className={cx("grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br text-[#fff] shadow-md", t.tone)}>
              <t.icon className="h-6 w-6" />
            </span>
            <span className="min-w-0">
              <span className="block text-[13px] font-medium text-slate-500">{t.label}</span>
              <span className={cx("block text-[24px] font-extrabold tabular-nums leading-tight", t.key === "value" ? "text-slate-900" : t.text)}>{t.value}</span>
              <span className="block truncate text-[12px] text-slate-500">{t.sub}</span>
            </span>
          </button>
        ))}
      </div>
      {oos.length > 0 && (
        <div className="scio-rise flex items-center gap-3 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-white px-4 py-3 text-[14px] text-slate-700 [animation-delay:200ms]">
          <Sparkles className="h-5 w-5 shrink-0 text-blue-600" />
          <span>
            <b className="text-slate-900">Why:</b> sales are outpacing replenishment{topCat ? <> — worst in <b className="text-slate-900">{topCat[0]}</b> ({nf(topCat[1])} SKUs)</> : null}
            {fast ? <>; <b className="text-slate-900">{nf(fast)}</b> are fast sellers.</> : "."} Open a SKU to transfer or reorder.
          </span>
        </div>
      )}
    </div>
  );
}

type Msg = { role: "user" | "assistant"; content: string };

const SUGGEST = ["Which SKUs will run out this week?", "Which SKUs are overstocked?", "Which suppliers are causing stockouts?", "Top 5 fast-moving SKUs?"];

/** Floating mini chat that answers SKU questions with the retail copilot. */
export function SkuChat() {
  const { state, scope } = useRetail();
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), [msgs, busy]);

  const send = async (text: string) => {
    const question = text.trim();
    if (!question || busy) return;
    const history = msgs.slice(-6);
    setMsgs((m) => [...m, { role: "user", content: question }]);
    setQ("");
    setBusy(true);
    try {
      const res = await fetch("/api/scio/retail-copilot", {
        method: "POST",
        headers: scioHeaders(),
        body: JSON.stringify({ question: `[SKU Intelligence] ${question} (answer briefly, max 5 bullet points)`, history, events: state.events, scope: scope ? [...scope] : null }),
      });
      const data = await readApi<{ answer?: string }>(res);
      if (!res.ok || data.error) throw new Error(data.error || `Request failed (${res.status})`);
      setMsgs((m) => [...m, { role: "assistant", content: data.answer ?? "No answer." }]);
    } catch (err) {
      setMsgs((m) => [...m, { role: "assistant", content: `⚠ ${err instanceof Error ? err.message : "Request failed"}` }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {!open && (
        <button onClick={() => setOpen(true)} className="scio-rise fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-gradient-to-r from-[#111113] to-[#2a2a30] py-3 pl-4 pr-5 text-[14px] font-semibold text-[#fff] shadow-xl shadow-blue-600/30 transition hover:scale-105">
          <Bot className="h-5 w-5" /> Ask about SKUs
        </button>
      )}
      {open && (
        <div className="scio-rise fixed bottom-6 right-6 z-40 flex h-[520px] w-[380px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
          <div className="flex items-center gap-3 bg-gradient-to-r from-[#111113] to-[#2a2a30] px-4 py-3 text-[#fff]">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#fff]/20"><Bot className="h-5 w-5" /></span>
            <div className="flex-1 leading-tight">
              <div className="text-[14.5px] font-bold">SCIO SKU Assistant</div>
              <div className="text-[11.5px] text-[#dbeafe]">Answers from live stock, sales & suppliers</div>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close" className="rounded-lg p-1.5 hover:bg-[#fff]/15"><X className="h-4 w-4" /></button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4">
            {msgs.length === 0 && (
              <div>
                <p className="text-[13.5px] text-slate-600">Ask anything about your products. Try:</p>
                <div className="mt-3 flex flex-col gap-2">
                  {SUGGEST.map((s) => (
                    <button key={s} onClick={() => send(s)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-[13px] text-slate-800 transition hover:border-blue-300 hover:bg-blue-50">{s}</button>
                  ))}
                </div>
              </div>
            )}
            {msgs.map((m, i) => (
              <div key={i} className={cx("max-w-[88%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-relaxed", m.role === "user" ? "ml-auto bg-[#111113] text-[#fff]" : "border border-slate-200 bg-white text-slate-800")}>
                {m.role === "assistant" ? <Rich text={m.content} /> : m.content}
              </div>
            ))}
            {busy && (
              <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-[13px] text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" /> Checking your data…
              </div>
            )}
            <div ref={endRef} />
          </div>

          <form onSubmit={(e) => { e.preventDefault(); void send(q); }} className="flex items-center gap-2 border-t border-slate-100 p-3">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ask about SKUs…" className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[13.5px] text-slate-900 outline-none focus:border-blue-400" />
            <button type="submit" disabled={busy || !q.trim()} aria-label="Send" className="grid h-10 w-10 place-items-center rounded-xl bg-[#111113] text-[#fff] disabled:opacity-40"><ArrowUp className="h-4 w-4" /></button>
          </form>
        </div>
      )}
    </>
  );
}

/** Renders **bold** segments from the copilot's markdown. */
function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? <b key={i} className="text-slate-900">{part.slice(2, -2)}</b> : <React.Fragment key={i}>{part.replace(/^\s*\*\s+/gm, "• ")}</React.Fragment>
      )}
    </>
  );
}
