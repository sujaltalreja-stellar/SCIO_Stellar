import { parseJsonLoose, sarvamChat, type ChatMessage } from "./sarvam";

// ---------------------------------------------------------------------------
// SCIO Vision Inspection: vision-language model (Sarvam gemma4) analysis.
// Output separates WHAT IS VISIBLE (defects + boxes) from AI INTERPRETATION
// (severity, cause, recommendation), which is decision support only.
// ---------------------------------------------------------------------------

export const DEFECT_TYPES = ["corrosion", "crack", "leak", "deformation", "missing_component", "surface_damage", "wear", "other"] as const;
export type DefectType = (typeof DEFECT_TYPES)[number];

export interface Defect {
  type: DefectType;
  label: string;
  /** Normalised box, 0..1, relative to image width/height. */
  box: { x: number; y: number; w: number; h: number } | null;
  confidence: number; // 0..1
  evidence: string;
}

export interface VisionResult {
  equipment: string;
  imageQuality: "good" | "fair" | "poor";
  defects: Defect[];
  interpretation: {
    severity: "none" | "low" | "moderate" | "high" | "critical";
    summary: string;
    likelyCause: string;
    recommendedAction: string;
    followUp: string;
  };
  comparison?: {
    trend: "worse" | "similar" | "better" | "unclear";
    summary: string;
  };
}

const SCHEMA_TEXT = `Return ONLY a JSON object with exactly this shape:
{
  "equipment": string,                       // what the equipment/structure appears to be
  "image_quality": "good" | "fair" | "poor",
  "defects": [                               // only defects that are VISIBLE in the image; [] if none
    {
      "type": ${DEFECT_TYPES.map((t) => `"${t}"`).join(" | ")},
      "label": string,                       // short, e.g. "Surface rust on flange bolts"
      "box_2d": [ymin, xmin, ymax, xmax],    // integers 0-1000, normalised to image height/width
      "confidence": number,                  // 0-1, how certain the defect is visible
      "evidence": string                     // the visual cue you see (colour, texture, shape)
    }
  ],
  "interpretation": {
    "severity": "none" | "low" | "moderate" | "high" | "critical",
    "summary": string,                       // 1-2 sentences
    "likely_cause": string,
    "recommended_action": string,
    "follow_up": string                      // e.g. re-inspect in 30 days, ultrasonic thickness test
  }COMPARISON
}`;

const COMPARISON_TEXT = `,
  "comparison": {                            // compare CURRENT image (second) against PREVIOUS image (first)
    "trend": "worse" | "similar" | "better" | "unclear",
    "summary": string                        // e.g. "The corroded area has grown and now covers the weld seam."
  }`;

const SYSTEM = `You are an industrial visual inspection assistant. You examine photos of equipment, machinery, pipelines and infrastructure.
Be precise and conservative: only report defects you can actually see. Never invent defects. If the image is unclear or not industrial equipment, say so with an empty defects list.
Bounding boxes must tightly enclose each visible defect region.`;

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

function normaliseBox(b: unknown): Defect["box"] {
  if (!Array.isArray(b) || b.length !== 4) return null;
  const [ymin, xmin, ymax, xmax] = b.map(Number);
  if ([ymin, xmin, ymax, xmax].some((v) => !Number.isFinite(v))) return null;
  const scale = Math.max(ymin, xmin, ymax, xmax) <= 1.0001 ? 1 : 1000;
  const x = clamp01(Math.min(xmin, xmax) / scale);
  const y = clamp01(Math.min(ymin, ymax) / scale);
  const w = clamp01(Math.abs(xmax - xmin) / scale);
  const h = clamp01(Math.abs(ymax - ymin) / scale);
  if (w < 0.01 || h < 0.01) return null;
  return { x, y, w, h };
}

const isDataUrl = (s: unknown): s is string => typeof s === "string" && /^data:image\/(png|jpe?g|webp);base64,/.test(s);

export async function runVision(image: string, previousImage?: string | null): Promise<VisionResult> {
  if (!isDataUrl(image)) throw new Error("Image must be a PNG, JPEG or WebP data URL");
  if (image.length > 4_000_000) throw new Error("Image is too large");
  const compare = isDataUrl(previousImage);

  const content: Array<Record<string, unknown>> = [];
  if (compare) {
    content.push({ type: "text", text: "PREVIOUS inspection image:" });
    content.push({ type: "image_url", image_url: { url: previousImage, detail: "high" } });
    content.push({ type: "text", text: "CURRENT inspection image (analyse defects in THIS image):" });
  }
  content.push({ type: "image_url", image_url: { url: image, detail: "high" } });
  content.push({ type: "text", text: SCHEMA_TEXT.replace("COMPARISON", compare ? COMPARISON_TEXT : "") });

  const messages: ChatMessage[] = [
    { role: "system", content: SYSTEM },
    { role: "user", content },
  ];

  const { message } = await sarvamChat({ messages, json: true, maxTokens: 1500, temperature: 0.1, timeoutMs: 58_000 });
  const raw = parseJsonLoose<Record<string, any>>(message.content);
  if (!raw) throw new Error("The vision model returned an unreadable response. Please try again.");

  const defects: Defect[] = (Array.isArray(raw.defects) ? raw.defects : []).slice(0, 12).map((d: any) => ({
    type: (DEFECT_TYPES as readonly string[]).includes(d?.type) ? d.type : "other",
    label: String(d?.label ?? "Defect").slice(0, 120),
    box: normaliseBox(d?.box_2d ?? d?.box),
    confidence: clamp01(Number(d?.confidence) || 0.5),
    evidence: String(d?.evidence ?? "").slice(0, 300),
  }));

  const it = raw.interpretation ?? {};
  const sev = ["none", "low", "moderate", "high", "critical"].includes(it.severity) ? it.severity : defects.length ? "moderate" : "none";
  const result: VisionResult = {
    equipment: String(raw.equipment ?? "Equipment").slice(0, 160),
    imageQuality: ["good", "fair", "poor"].includes(raw.image_quality) ? raw.image_quality : "fair",
    defects,
    interpretation: {
      severity: sev,
      summary: String(it.summary ?? "").slice(0, 600),
      likelyCause: String(it.likely_cause ?? "").slice(0, 400),
      recommendedAction: String(it.recommended_action ?? "").slice(0, 400),
      followUp: String(it.follow_up ?? "").slice(0, 300),
    },
  };
  if (compare && raw.comparison) {
    const c = raw.comparison;
    result.comparison = {
      trend: ["worse", "similar", "better", "unclear"].includes(c.trend) ? c.trend : "unclear",
      summary: String(c.summary ?? "").slice(0, 500),
    };
  }
  return result;
}
