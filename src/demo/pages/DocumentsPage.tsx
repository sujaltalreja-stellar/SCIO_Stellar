import React, { useMemo, useRef, useState } from "react";
import { scioHeaders } from "../auth";
import { FileText, Inbox, Upload, ScanText, Sparkles, GitCompareArrows, CheckCircle2, XCircle, AlertTriangle, ShieldCheck, Mail, Globe, ScanLine, Eye, EyeOff } from "lucide-react";
import { useDataset } from "../useDataset";
import { buildInbox, invoiceTotals, type InvoiceDoc } from "../data/documents";
import { renderInvoice } from "../lib/renderInvoice";
import { imageFileToCanvas, pdfToCanvas, runOcr, type OcrOutput } from "../lib/ocr";
import { Badge, Card, CardTitle, cx, Kpi, money, C } from "../ui";
import { useApproval } from "../components/Approval";

// Mirrors src/server/demo/documents.ts
interface Check {
  id: string;
  label: string;
  status: "pass" | "fail" | "warn";
  detail: string;
}
interface DocResult {
  extracted: {
    documentType: string;
    supplierName: string | null;
    supplierTrn: string | null;
    invoiceNumber: string | null;
    invoiceDate: string | null;
    poNumber: string | null;
    paymentTerms: string | null;
    dueDate: string | null;
    currency: string | null;
    lineItems: Array<{ itemCode: string | null; description: string; quantity: number; unitPrice: number; amount: number }>;
    subtotal: number | null;
    vat: number | null;
    total: number | null;
  };
  matchedPo: null | { id: string; supplier: string; item: string; quantity: number; unitPrice: number; orderDate: string; deliveredDate: string | null };
  checks: Check[];
  decision: "auto-approve" | "needs-approval" | "reject";
  summary: string;
  amountAtRisk: number;
}

type Stage = "idle" | "ocr" | "extract" | "match" | "done" | "error";
interface WorkItem {
  key: string;
  title: string;
  subtitle: string;
  channel: string;
  amount: number | null;
  receivedAt: string;
  image: string; // data URL preview
  canvas: HTMLCanvasElement;
  stage: Stage;
  ocr?: OcrOutput;
  result?: DocResult;
  error?: string;
  timings: { extract?: number; match?: number };
  outcome?: string;
}

const CHANNEL_ICON = { Email: Mail, "Supplier portal": Globe, Scan: ScanLine, Upload: Upload } as Record<string, typeof Mail>;

function fromInvoice(doc: InvoiceDoc): WorkItem {
  const canvas = renderInvoice(doc);
  return {
    key: doc.id,
    title: doc.supplier.name,
    subtitle: doc.number,
    channel: doc.channel,
    amount: invoiceTotals(doc).total,
    receivedAt: doc.receivedAt,
    image: canvas.toDataURL("image/jpeg", 0.9),
    canvas,
    stage: "idle",
    timings: {},
  };
}

export default function DocumentsPage({ docs, sector = "industrial" }: { docs?: InvoiceDoc[]; sector?: "industrial" | "retail" } = {}) {
  const ds = useDataset();
  const { request, toast } = useApproval();
  const [items, setItems] = useState<WorkItem[]>(() => (docs ?? buildInbox(ds)).map(fromInvoice));
  const [selKey, setSelKey] = useState(items[0]?.key);
  const [showBoxes, setShowBoxes] = useState(true);
  const [showText, setShowText] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const sel = items.find((i) => i.key === selKey) ?? items[0];

  const patch = (key: string, p: Partial<WorkItem>) => setItems((xs) => xs.map((x) => (x.key === key ? { ...x, ...p } : x)));

  const process = async (w: WorkItem) => {
    patch(w.key, { stage: "ocr", error: undefined, result: undefined, ocr: undefined, timings: {} });
    try {
      setOcrLoading(true);
      const ocr = await runOcr(w.canvas);
      setOcrLoading(false);
      patch(w.key, { stage: "extract", ocr });
      const t0 = performance.now();
      const res = await fetch("/api/scio/document", {
        method: "POST",
        headers: scioHeaders(),
        body: JSON.stringify({ text: ocr.text, sector }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || `Request failed (${res.status})`);
      const extractMs = Math.round(performance.now() - t0);
      patch(w.key, { stage: "match", timings: { extract: extractMs } });
      await new Promise((r) => setTimeout(r, 450));
      patch(w.key, { stage: "done", result: data as DocResult, timings: { extract: extractMs, match: 12 } });
    } catch (e: any) {
      setOcrLoading(false);
      patch(w.key, { stage: "error", error: e?.message || "Processing failed" });
    }
  };

  const onUpload = async (file?: File | null) => {
    if (!file) return;
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    const canvas = isPdf ? await pdfToCanvas(file) : await imageFileToCanvas(file);
    const w: WorkItem = {
      key: `up-${Date.now()}`,
      title: file.name,
      subtitle: isPdf ? "PDF document" : "Image",
      channel: "Upload",
      amount: null,
      receivedAt: new Date().toISOString(),
      image: canvas.toDataURL("image/jpeg", 0.9),
      canvas,
      stage: "idle",
      timings: {},
    };
    setItems((xs) => [w, ...xs]);
    setSelKey(w.key);
    void process(w);
  };

  const act = async (kind: "approve" | "hold" | "reject") => {
    if (!sel.result) return;
    const ex = sel.result.extracted;
    if (kind === "reject") {
      patch(sel.key, { outcome: "Rejected · supplier notified" });
      toast(`Invoice ${ex.invoiceNumber ?? ""} rejected and supplier notified`);
      return;
    }
    const rec = await request({
      kind: kind === "approve" ? "Invoice payment" : "Invoice hold",
      title: `${ex.supplierName ?? "Supplier"} · ${ex.invoiceNumber ?? "invoice"}`,
      lines: [
        ["PO", ex.poNumber ?? "-"],
        ["Invoice total", ex.total !== null ? money(ex.total) : "-"],
        ["Due date", ex.dueDate ?? "-"],
        ...(sel.result.amountAtRisk > 0 ? ([["Disputed amount", money(sel.result.amountAtRisk)]] as Array<[string, string]>) : []),
      ],
      note: kind === "approve" ? "Payment will be scheduled for the due date in the ERP." : "The invoice is placed on hold and a query is sent to the supplier with the mismatches found.",
      confirmLabel: kind === "approve" ? "Approve for payment" : "Hold & query supplier",
    });
    if (rec) patch(sel.key, { outcome: kind === "approve" ? `Approved · ${rec.ref}` : `On hold · ${rec.ref}` });
  };

  const done = items.filter((i) => i.stage === "done");
  const exceptions = done.filter((i) => i.result && i.result.decision !== "auto-approve").length;
  const protectedAmt = done.reduce((s, i) => s + (i.result?.amountAtRisk ?? 0), 0);

  const imgDims = useMemo(() => ({ w: sel?.canvas.width ?? 1, h: sel?.canvas.height ?? 1 }), [sel]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[30px] font-bold tracking-tight text-slate-900">Document Intelligence</h1>
          <p className="mt-1.5 text-[15px] text-slate-600">{sector === "retail" ? "Supplier invoices, delivery notes and POs read by PaddleOCR and AI, then matched line by line against purchase orders and goods receipts." : "Reads invoices, purchase orders and delivery notes, then checks them against your POs, goods receipts and payment history."}</p>
        </div>
        <div>
          <input ref={fileRef} type="file" accept="application/pdf,image/*" className="hidden" onChange={(e) => void onUpload(e.target.files?.[0])} />
          <button onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-4 py-2 text-sm text-slate-800 hover:bg-slate-100">
            <Upload className="h-4 w-4" /> Upload PDF or image
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Documents in inbox" value={String(items.length)} sub={`${items.filter((i) => i.stage === "idle").length} waiting`} color={C.indigo} icon={<Inbox className="h-4 w-4" />} />
        <Kpi label="Processed" value={String(done.length)} sub="this session" color={C.cyan} icon={<FileText className="h-4 w-4" />} />
        <Kpi label="Exceptions found" value={String(exceptions)} sub="need human approval" color={C.amber} icon={<AlertTriangle className="h-4 w-4" />} />
        <Kpi label="Overpayment prevented" value={money(protectedAmt, true)} sub="disputed amounts" color={C.emerald} icon={<ShieldCheck className="h-4 w-4" />} />
      </div>

      <div className="grid gap-6 xl:grid-cols-12">
        {/* Inbox */}
        <Card className="xl:col-span-3">
          <CardTitle hint="Received today">Inbox</CardTitle>
          <ul className="space-y-1.5">
            {items.map((w) => {
              const Icon = CHANNEL_ICON[w.channel] ?? FileText;
              const status =
                w.outcome ??
                (w.stage === "done"
                  ? w.result?.decision === "auto-approve"
                    ? "Matched"
                    : w.result?.decision === "reject"
                      ? "Duplicate"
                      : "Exception"
                  : w.stage === "idle"
                    ? "New"
                    : w.stage === "error"
                      ? "Error"
                      : "Processing…");
              const tone = status.startsWith("Approved") || status === "Matched" ? "good" : status === "New" ? "accent" : status.startsWith("Processing") ? "neutral" : "bad";
              return (
                <li key={w.key}>
                  <button
                    onClick={() => setSelKey(w.key)}
                    className={cx("w-full rounded-xl border p-3 text-left transition", sel?.key === w.key ? "border-blue-200 bg-blue-50" : "border-slate-200 bg-slate-50 hover:bg-slate-100")}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex min-w-0 items-center gap-2 text-sm font-medium text-slate-900">
                        <Icon className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                        <span className="truncate">{w.title}</span>
                      </span>
                      <Badge tone={tone as any}>{status.split(" · ")[0]}</Badge>
                    </div>
                    <div className="mt-1 flex justify-between text-[11px] text-slate-500">
                      <span>{w.subtitle}</span>
                      <span>{w.amount !== null ? money(w.amount) : new Date(w.receivedAt).toLocaleTimeString("en-GB", { timeZone: "Asia/Dubai", hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </Card>

        {/* Document preview */}
        <Card className="p-3 xl:col-span-4">
          <div className="mb-2 flex items-center justify-between px-1">
            <span className="text-xs text-slate-500">{sel?.ocr ? `${sel.ocr.lines.length} text regions detected` : "Document"}</span>
            {sel?.ocr && (
              <button onClick={() => setShowBoxes((s) => !s)} className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900">
                {showBoxes ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />} {showBoxes ? "Hide" : "Show"} OCR boxes
              </button>
            )}
          </div>
          {sel && (
            <div className="relative overflow-hidden rounded-lg bg-white">
              <img src={sel.image} alt="Document" className="block w-full" />
              {showBoxes &&
                sel.ocr?.lines.map((l, i) => (
                  <div
                    key={i}
                    className="absolute rounded-[2px] border border-cyan-500/80 bg-teal-50"
                    style={{ left: `${(l.box.x / imgDims.w) * 100}%`, top: `${(l.box.y / imgDims.h) * 100}%`, width: `${(l.box.width / imgDims.w) * 100}%`, height: `${(l.box.height / imgDims.h) * 100}%` }}
                    title={l.text}
                  />
                ))}
              {sel.stage === "ocr" && (
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                  <div className="absolute inset-x-0 h-24 animate-[scan_1.6s_ease-in-out_infinite] bg-gradient-to-b from-transparent via-cyan-400/30 to-transparent" />
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Processing & results */}
        <div className="space-y-4 xl:col-span-5">
          {sel && (
            <Card glow>
              <CardTitle
                hint={`${sel.channel} · ${new Date(sel.receivedAt).toLocaleString("en-GB", { timeZone: "Asia/Dubai", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}`}
                right={
                  (sel.stage === "idle" || sel.stage === "error" || sel.stage === "done") && (
                    <button
                      onClick={() => process(sel)}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#2563eb] px-3.5 py-1.5 text-sm font-semibold text-[#fff] shadow-sm shadow-blue-600/20 hover:bg-[#1d4ed8]"
                    >
                      <Sparkles className="h-4 w-4" /> {sel.stage === "idle" ? "Process document" : "Re-process"}
                    </button>
                  )
                }
              >
                {sel.title}
              </CardTitle>
              <ol className="space-y-2.5">
                <Step
                  icon={ScanText}
                  label="Read document"
                  tech="PaddleOCR"
                  state={sel.stage === "ocr" ? "run" : sel.ocr ? "done" : "wait"}
                  detail={
                    sel.stage === "ocr" && ocrLoading && !sel.ocr
                      ? "Loading OCR models (first run downloads about 6 MB)…"
                      : sel.ocr
                        ? `${sel.ocr.lines.length} text regions · ${(sel.ocr.confidence * 100).toFixed(1)}% confidence · ${(sel.ocr.ms / 1000).toFixed(1)} s`
                        : undefined
                  }
                />
                <Step
                  icon={Sparkles}
                  label="Extract fields"
                  tech="Gemma 4 · Sarvam"
                  state={sel.stage === "extract" ? "run" : sel.timings.extract ? "done" : "wait"}
                  detail={sel.timings.extract ? `Supplier, PO, line items, totals · ${(sel.timings.extract / 1000).toFixed(1)} s` : undefined}
                />
                <Step
                  icon={GitCompareArrows}
                  label="Match & validate"
                  tech="PO · goods receipt · invoice history"
                  state={sel.stage === "match" ? "run" : sel.stage === "done" ? "done" : "wait"}
                  detail={sel.result ? `${sel.result.checks.length} checks · ${sel.result.checks.filter((c) => c.status !== "pass").length} issues` : undefined}
                />
              </ol>
              {sel.stage === "error" && <p className="mt-3 rounded-lg bg-rose-50 p-3 text-sm text-rose-600">{sel.error}</p>}
            </Card>
          )}

          {sel?.result && (
            <>
              <Card>
                <div
                  className={cx(
                    "rounded-xl border p-4",
                    sel.result.decision === "auto-approve" ? "border-emerald-200 bg-emerald-50" : sel.result.decision === "reject" ? "border-rose-200 bg-rose-50" : "border-amber-200 bg-amber-50"
                  )}
                >
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    {sel.result.decision === "auto-approve" ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    ) : sel.result.decision === "reject" ? (
                      <XCircle className="h-4 w-4 text-rose-500" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-amber-700" />
                    )}
                    <span className="text-slate-900">
                      {sel.result.decision === "auto-approve" ? "Ready to approve" : sel.result.decision === "reject" ? "Duplicate invoice: do not pay" : "Requires human approval"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-800">{sel.result.summary}</p>
                </div>

                <div className="mt-4 space-y-1.5">
                  {sel.result.checks.map((c) => (
                    <div key={c.id} className="flex gap-2.5 rounded-lg bg-slate-50 px-3 py-2 text-sm">
                      {c.status === "pass" ? (
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      ) : c.status === "warn" ? (
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
                      ) : (
                        <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                      )}
                      <span className="w-32 shrink-0 text-slate-500">{c.label}</span>
                      <span className="text-slate-800">{c.detail}</span>
                    </div>
                  ))}
                </div>

                {sel.outcome ? (
                  <div className="mt-4 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-800">{sel.outcome}</div>
                ) : (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {sel.result.decision !== "reject" && (
                      <button onClick={() => act("approve")} className="rounded-xl bg-[#2563eb] px-4 py-2 text-sm font-semibold text-[#fff] hover:bg-[#1d4ed8]">
                        Approve for payment
                      </button>
                    )}
                    {sel.result.decision !== "auto-approve" && (
                      <button onClick={() => act("hold")} className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-700 hover:bg-amber-50">
                        Hold & query supplier
                      </button>
                    )}
                    <button onClick={() => act("reject")} className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-100">
                      Reject
                    </button>
                  </div>
                )}
              </Card>

              <Card>
                <CardTitle hint="Extracted by AI from the OCR text">Extracted fields</CardTitle>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
                  {(
                    [
                      ["Supplier", sel.result.extracted.supplierName],
                      ["Supplier TRN", sel.result.extracted.supplierTrn],
                      ["Invoice no.", sel.result.extracted.invoiceNumber],
                      ["Invoice date", sel.result.extracted.invoiceDate],
                      ["PO number", sel.result.extracted.poNumber],
                      ["Payment terms", sel.result.extracted.paymentTerms],
                      ["Due date", sel.result.extracted.dueDate],
                      ["Total", sel.result.extracted.total !== null ? money(sel.result.extracted.total) : null],
                    ] as Array<[string, string | null]>
                  ).map(([k, v]) => (
                    <div key={k}>
                      <div className="text-[11px] text-slate-500">{k}</div>
                      <div className="text-slate-900">{v ?? "–"}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-[460px] text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500">
                        <th className="pb-2 text-left font-medium">Item</th>
                        <th className="pb-2 text-right font-medium">Qty</th>
                        <th className="pb-2 text-right font-medium">Unit price</th>
                        <th className="pb-2 text-right font-medium">PO qty / price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sel.result.extracted.lineItems.map((l, i) => {
                        const po = sel.result!.matchedPo;
                        const qtyBad = po && l.quantity !== po.quantity;
                        const priceBad = po && Math.abs(l.unitPrice - po.unitPrice) / po.unitPrice > 0.01;
                        return (
                          <tr key={i}>
                            <td className="py-2 pr-3 text-slate-800">
                              {l.description}
                              <span className="block text-[11px] text-slate-500">{l.itemCode}</span>
                            </td>
                            <td className={cx("py-2 text-right tabular-nums", qtyBad ? "font-semibold text-rose-600" : "text-slate-800")}>{l.quantity}</td>
                            <td className={cx("py-2 text-right tabular-nums", priceBad ? "font-semibold text-rose-600" : "text-slate-800")}>{money(l.unitPrice)}</td>
                            <td className="py-2 text-right tabular-nums text-slate-500">{po ? `${po.quantity} / ${money(po.unitPrice)}` : "–"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {sel.ocr && (
                  <div className="mt-4">
                    <button onClick={() => setShowText((s) => !s)} className="text-xs text-blue-700 hover:text-blue-700">
                      {showText ? "Hide" : "View"} raw OCR text
                    </button>
                    {showText && <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap rounded-lg bg-slate-50 p-3 font-mono text-[11px] text-slate-500">{sel.ocr.text}</pre>}
                  </div>
                )}
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Step({ icon: Icon, label, tech, state, detail }: { icon: typeof FileText; label: string; tech: string; state: "wait" | "run" | "done"; detail?: string }) {
  return (
    <li className={cx("flex gap-3 rounded-xl border p-3", state === "run" ? "border-blue-200 bg-blue-50" : "border-slate-200 bg-slate-50")}>
      <span className={cx("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", state === "done" ? "bg-emerald-50 text-emerald-700" : state === "run" ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-500")}>
        {state === "run" ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" /> : state === "done" ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
      </span>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className={state === "wait" ? "text-slate-500" : "text-slate-900"}>{label}</span>
          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500">{tech}</span>
        </div>
        {detail && <div className="mt-0.5 text-xs text-slate-500">{detail}</div>}
      </div>
    </li>
  );
}
