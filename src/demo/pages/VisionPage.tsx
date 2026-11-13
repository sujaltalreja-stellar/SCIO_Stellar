import React, { useMemo, useRef, useState } from "react";
import { readApi, scioHeaders } from "../auth";
import { ImagePlus, ScanSearch, Eye, BrainCircuit, Download, RefreshCw, History, X, ShieldAlert } from "lucide-react";
import { useDataset } from "../useDataset";
import { Badge, Card, CardTitle, cx } from "../ui";

// Mirrors src/server/demo/vision.ts
interface Defect {
  type: string;
  label: string;
  box: { x: number; y: number; w: number; h: number } | null;
  confidence: number;
  evidence: string;
}
interface VisionResult {
  equipment: string;
  imageQuality: "good" | "fair" | "poor";
  defects: Defect[];
  interpretation: { severity: "none" | "low" | "moderate" | "high" | "critical"; summary: string; likelyCause: string; recommendedAction: string; followUp: string };
  comparison?: { trend: "worse" | "similar" | "better" | "unclear"; summary: string };
}

const TYPE_STYLE: Record<string, { color: string; label: string }> = {
  corrosion: { color: "#fb923c", label: "Corrosion" },
  crack: { color: "#fb7185", label: "Crack" },
  leak: { color: "#38d9f5", label: "Leak" },
  deformation: { color: "#c084fc", label: "Deformation" },
  missing_component: { color: "#fbbf24", label: "Missing component" },
  surface_damage: { color: "#f472b6", label: "Surface damage" },
  wear: { color: "#a3e635", label: "Wear" },
  other: { color: "#94a3b8", label: "Other" },
};
const SEVERITY_TONE = { none: "good", low: "good", moderate: "warn", high: "bad", critical: "bad" } as const;
const TREND_TONE = { worse: "bad", similar: "neutral", better: "good", unclear: "neutral" } as const;

/** Downscale to max 1280px JPEG to keep uploads fast and under API limits. */
async function fileToDataUrl(file: File, maxSide = 1280): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error("Could not read image"));
      i.src = url;
    });
    const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.88);
  } finally {
    URL.revokeObjectURL(url);
  }
}

function DropZone({ label, image, onImage, compact }: { label: string; image: string | null; onImage: (d: string | null) => void; compact?: boolean }) {
  const ref = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const take = async (f?: File | null) => {
    if (f && f.type.startsWith("image/")) onImage(await fileToDataUrl(f));
  };
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        void take(e.dataTransfer.files?.[0]);
      }}
      className={cx(
        "relative flex items-center justify-center overflow-hidden rounded-xl border border-dashed transition",
        compact ? "h-40" : "h-64",
        drag ? "border-indigo-400 bg-blue-50" : "border-slate-200 bg-slate-50 hover:border-slate-200"
      )}
    >
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={(e) => void take(e.target.files?.[0])} />
      {image ? (
        <>
          <img src={image} alt={label} className="h-full w-full object-contain" />
          <button onClick={() => onImage(null)} className="absolute right-2 top-2 rounded-lg bg-black/60 p-1.5 text-[#fff] hover:bg-black/80" aria-label="Remove image">
            <X className="h-4 w-4" />
          </button>
          <span className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-0.5 text-[11px] text-[#fff]">{label}</span>
        </>
      ) : (
        <button onClick={() => ref.current?.click()} className="flex flex-col items-center gap-2 p-6 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <ImagePlus className="h-5 w-5" />
          </span>
          <span className="text-sm font-medium text-slate-800">{label}</span>
          <span className="text-xs text-slate-500">Drop a photo or click to upload · JPG, PNG, WebP</span>
        </button>
      )}
    </div>
  );
}

function AnnotatedImage({ src, defects, active, onHover }: { src: string; defects: Defect[]; active: number | null; onHover: (i: number | null) => void }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
      <div className="relative mx-auto w-fit">
        <img src={src} alt="Inspected equipment" className="block max-h-[520px] w-auto max-w-full" />
        {defects.map((d, i) =>
          d.box ? (
            <div
              key={i}
              onMouseEnter={() => onHover(i)}
              onMouseLeave={() => onHover(null)}
              className="absolute rounded-md transition"
              style={{
                left: `${d.box.x * 100}%`,
                top: `${d.box.y * 100}%`,
                width: `${d.box.w * 100}%`,
                height: `${d.box.h * 100}%`,
                border: `2px solid ${TYPE_STYLE[d.type]?.color ?? "#fff"}`,
                boxShadow: active === i ? `0 0 0 3px ${TYPE_STYLE[d.type]?.color}55, 0 0 24px ${TYPE_STYLE[d.type]?.color}88` : `0 0 12px ${TYPE_STYLE[d.type]?.color}55`,
                background: active === i ? `${TYPE_STYLE[d.type]?.color}22` : "transparent",
              }}
            >
              <span
                className="absolute -top-6 left-0 whitespace-nowrap rounded px-1.5 py-0.5 text-[10px] font-semibold text-[#fff]"
                style={{ background: TYPE_STYLE[d.type]?.color }}
              >
                {i + 1} · {TYPE_STYLE[d.type]?.label} {Math.round(d.confidence * 100)}%
              </span>
            </div>
          ) : null
        )}
      </div>
    </div>
  );
}

function openReport(result: VisionResult, image: string, assetLabel: string, inspector: string) {
  const w = window.open("", "_blank");
  if (!w) return;
  const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
  const now = new Date();
  w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>SCIO Inspection Report</title>
<style>body{font-family:Inter,system-ui,sans-serif;color:#0f172a;max-width:820px;margin:32px auto;padding:0 24px}h1{font-size:22px;margin:0}
.muted{color:#64748b;font-size:12px}.box{border:1px solid #e2e8f0;border-radius:10px;padding:14px 16px;margin:14px 0}
table{width:100%;border-collapse:collapse;font-size:13px}td,th{text-align:left;padding:6px 8px;border-bottom:1px solid #e2e8f0}
img{max-width:100%;border-radius:8px;border:1px solid #e2e8f0}.sev{display:inline-block;padding:2px 8px;border-radius:6px;background:#fee2e2;color:#991b1b;font-weight:600;font-size:12px;text-transform:uppercase}
h2{font-size:14px;margin:0 0 8px}</style></head><body>
<div style="display:flex;justify-content:space-between;align-items:flex-end"><div><div class="muted">SCIO · Vision Inspection</div><h1>Inspection report</h1></div>
<div class="muted">${now.toLocaleString("en-GB", { timeZone: "Asia/Dubai" })}<br/>Asset: ${esc(assetLabel)}<br/>Prepared for: ${esc(inspector)}</div></div>
<div class="box"><img src="${image}"/></div>
<div class="box"><h2>1. Visually detected defects</h2><table><tr><th>#</th><th>Type</th><th>Description</th><th>Confidence</th><th>Visual evidence</th></tr>
${result.defects.map((d, i) => `<tr><td>${i + 1}</td><td>${esc(TYPE_STYLE[d.type]?.label ?? d.type)}</td><td>${esc(d.label)}</td><td>${Math.round(d.confidence * 100)}%</td><td>${esc(d.evidence)}</td></tr>`).join("") || `<tr><td colspan="5">No visible defects detected.</td></tr>`}
</table></div>
<div class="box"><h2>2. AI interpretation (decision support)</h2><p><span class="sev">${esc(result.interpretation.severity)}</span></p>
<p>${esc(result.interpretation.summary)}</p><p><b>Likely cause:</b> ${esc(result.interpretation.likelyCause)}</p>
<p><b>Recommended action:</b> ${esc(result.interpretation.recommendedAction)}</p><p><b>Follow-up:</b> ${esc(result.interpretation.followUp)}</p>
${result.comparison ? `<p><b>Change since previous inspection (${esc(result.comparison.trend)}):</b> ${esc(result.comparison.summary)}</p>` : ""}</div>
<p class="muted">Severity and recommendations are a preliminary AI assessment to support engineering review. They are not a certified engineering assessment.</p>
<script>setTimeout(()=>window.print(),400)</script></body></html>`);
  w.document.close();
}

export interface VisionTarget {
  id: string;
  label: string;
  meta: Array<[string, string]>;
}

export default function VisionPage({ targets, title = "Vision Inspection", subtitle = "Upload a photo of equipment, a pipeline or infrastructure. SCIO marks visible defects and drafts the inspection report.", targetLabel = "Link to asset", hideHeader = false }: { targets?: VisionTarget[]; title?: string; subtitle?: string; targetLabel?: string; hideHeader?: boolean } = {}) {
  const ds = useDataset();
  const T = useMemo<VisionTarget[]>(
    () => targets ?? ds.assets.map((a) => ({ id: a.id, label: `${a.name} · ${a.site}`, meta: [["Last service", a.lastServiceDate], ["Running hours", a.runningHours.toLocaleString()], ["Criticality", a.criticality]] as Array<[string, string]> })),
    [targets, ds]
  );
  const [mode, setMode] = useState<"inspect" | "compare">("inspect");
  const [image, setImage] = useState<string | null>(null);
  const [previous, setPrevious] = useState<string | null>(null);
  const [assetId, setAssetId] = useState(T[0]?.id ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<VisionResult | null>(null);
  const [analysedImage, setAnalysedImage] = useState<string | null>(null);
  const [hover, setHover] = useState<number | null>(null);

  const asset = useMemo(() => T.find((a) => a.id === assetId), [T, assetId]);
  const canRun = !!image && (mode === "inspect" || !!previous) && !busy;

  const run = async () => {
    if (!image) return;
    setBusy(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/scio/vision", {
        method: "POST",
        headers: scioHeaders(),
        body: JSON.stringify({ image, previousImage: mode === "compare" ? previous : null }),
      });
      const data = await readApi<any>(res);
      if (!res.ok || data.error) throw new Error(data.error || `Request failed (${res.status})`);
      setResult(data as VisionResult);
      setAnalysedImage(image);
    } catch (e: any) {
      setError(e?.message || "Analysis failed");
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setResult(null);
    setImage(null);
    setPrevious(null);
    setError("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          {!hideHeader && (
            <>
              <h1 className="text-[30px] font-bold tracking-tight text-slate-900">{title}</h1>
              <p className="mt-1.5 text-[15px] text-slate-600">{subtitle}</p>
            </>
          )}
        </div>
        <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1 text-sm">
          {(
            [
              ["inspect", "Single inspection", ScanSearch],
              ["compare", "Compare over time", History],
            ] as const
          ).map(([k, label, Icon]) => (
            <button
              key={k}
              onClick={() => {
                setMode(k);
                setResult(null);
              }}
              className={cx("flex items-center gap-2 rounded-lg px-3 py-1.5", mode === k ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:text-slate-800")}
            >
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </div>
      </div>

      {!result && (
        <Card glow>
          <div className="grid gap-5 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              {mode === "compare" ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <DropZone label="Previous inspection photo" image={previous} onImage={setPrevious} compact />
                  <DropZone label="Current inspection photo" image={image} onImage={setImage} compact />
                </div>
              ) : (
                <DropZone label="Inspection photo" image={image} onImage={setImage} />
              )}
            </div>
            <div className="flex flex-col gap-4">
              <label className="block">
                <span className="text-xs font-medium text-slate-500">{targetLabel}</span>
                <select
                  value={assetId}
                  onChange={(e) => setAssetId(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-200"
                >
                  {T.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.label}
                    </option>
                  ))}
                </select>
              </label>
              {asset && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-500">
                  {asset.meta.map(([k, v], i) => (
                    <div key={k} className={cx("flex justify-between", i > 0 && "mt-1.5")}>
                      <span>{k}</span>
                      <span className="text-slate-800">{v}</span>
                    </div>
                  ))}
                </div>
              )}
              <button
                onClick={run}
                disabled={!canRun}
                className="mt-auto flex items-center justify-center gap-2 rounded-xl bg-[#111113] py-3 text-sm font-semibold text-[#fff] shadow-sm shadow-blue-600/20 transition enabled:hover:bg-[#2a2a30] disabled:opacity-40"
              >
                {busy ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#fff]/30 border-t-white" /> Analysing image…
                  </>
                ) : (
                  <>
                    <ScanSearch className="h-4 w-4" /> {mode === "compare" ? "Compare inspections" : "Run inspection"}
                  </>
                )}
              </button>
              {error && <p className="text-sm text-rose-600">{error}</p>}
            </div>
          </div>
        </Card>
      )}

      {result && analysedImage && (
        <div className="grid gap-6 xl:grid-cols-5">
          <div className="space-y-4 xl:col-span-3">
            <Card className="p-3">
              <AnnotatedImage src={analysedImage} defects={result.defects} active={hover} onHover={setHover} />
              <div className="flex flex-wrap items-center justify-between gap-2 px-1 pt-3 text-xs text-slate-500">
                <span>
                  {result.equipment} · image quality <span className="text-slate-800">{result.imageQuality}</span>
                </span>
                <div className="flex gap-2">
                  <button onClick={reset} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 hover:bg-slate-100 hover:text-slate-900">
                    <RefreshCw className="h-3.5 w-3.5" /> New inspection
                  </button>
                  <button
                    onClick={() => openReport(result, analysedImage, asset ? asset.label : "-", "SCIO Operations")}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-slate-900 hover:bg-slate-100"
                  >
                    <Download className="h-3.5 w-3.5" /> Inspection report
                  </button>
                </div>
              </div>
            </Card>
            {result.comparison && previous && (
              <Card>
                <CardTitle right={<Badge tone={TREND_TONE[result.comparison.trend]}>{result.comparison.trend === "worse" ? "Getting worse" : result.comparison.trend}</Badge>}>
                  Change since previous inspection
                </CardTitle>
                <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
                  <img src={previous} alt="Previous inspection" className="h-28 w-full rounded-lg border border-slate-200 object-cover" />
                  <p className="text-sm text-slate-600">{result.comparison.summary}</p>
                </div>
              </Card>
            )}
          </div>

          <div className="space-y-4 xl:col-span-2">
            <Card>
              <CardTitle hint="What the model can see in the image" right={<Eye className="h-4 w-4 text-slate-500" />}>
                Detected defects · {result.defects.length}
              </CardTitle>
              {result.defects.length === 0 ? (
                <p className="text-sm text-slate-500">No visible defects detected.</p>
              ) : (
                <ul className="space-y-2">
                  {result.defects.map((d, i) => (
                    <li
                      key={i}
                      onMouseEnter={() => setHover(i)}
                      onMouseLeave={() => setHover(null)}
                      className={cx("rounded-xl border p-3 transition", hover === i ? "border-slate-200 bg-slate-100" : "border-slate-200 bg-slate-50")}
                    >
                      <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold text-[#fff]" style={{ background: TYPE_STYLE[d.type]?.color }}>
                          {i + 1}
                        </span>
                        <span className="text-sm font-medium text-slate-900">{d.label}</span>
                      </div>
                      <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-500">
                        <span style={{ color: TYPE_STYLE[d.type]?.color }}>{TYPE_STYLE[d.type]?.label}</span>
                        <div className="h-1 flex-1 overflow-hidden rounded-full bg-slate-100">
                          <div className="h-full rounded-full" style={{ width: `${d.confidence * 100}%`, background: TYPE_STYLE[d.type]?.color }} />
                        </div>
                        <span className="tabular-nums">{Math.round(d.confidence * 100)}%</span>
                      </div>
                      {d.evidence && <p className="mt-1.5 text-xs text-slate-500">{d.evidence}</p>}
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card glow>
              <CardTitle
                hint="Preliminary assessment for engineering review"
                right={<Badge tone={SEVERITY_TONE[result.interpretation.severity]}>{result.interpretation.severity} severity</Badge>}
              >
                <span className="inline-flex items-center gap-2">
                  <BrainCircuit className="h-4 w-4 text-blue-700" /> AI interpretation
                </span>
              </CardTitle>
              <div className="space-y-3 text-sm">
                <p className="text-slate-800">{result.interpretation.summary}</p>
                <Field label="Likely cause" value={result.interpretation.likelyCause} />
                <Field label="Recommended action" value={result.interpretation.recommendedAction} highlight />
                <Field label="Follow-up" value={result.interpretation.followUp} />
              </div>
              <p className="mt-4 flex gap-2 border-t border-slate-200 pt-3 text-[11px] leading-relaxed text-slate-500">
                <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
                Decision support only. Severity and recommendations are not a certified engineering assessment.
              </p>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  if (!value) return null;
  return (
    <div className={cx("rounded-lg p-2.5", highlight ? "border border-teal-200 bg-teal-50" : "bg-slate-50")}>
      <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500">{label}</div>
      <div className={cx("mt-0.5", highlight ? "text-teal-700" : "text-slate-600")}>{value}</div>
    </div>
  );
}
