// Minimal Sarvam AI client (OpenAI-compatible /v2/chat/completions). Server-side only.

const SARVAM_URL = "https://api.sarvam.ai/v2/chat/completions";

export interface ChatMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string | null | Array<Record<string, unknown>>;
  tool_calls?: Array<{ id: string; type: "function"; function: { name: string; arguments: string } }>;
  tool_call_id?: string;
}

export interface ToolDef {
  type: "function";
  function: { name: string; description: string; parameters: Record<string, unknown> };
}

export function sarvamConfigured() {
  return Boolean(process.env.SARVAM_API_KEY);
}

export async function sarvamChat(opts: {
  messages: ChatMessage[];
  tools?: ToolDef[];
  json?: boolean;
  maxTokens?: number;
  temperature?: number;
  timeoutMs?: number;
}) {
  const key = process.env.SARVAM_API_KEY;
  if (!key) throw new Error("SARVAM_API_KEY is not configured");

  const body: Record<string, unknown> = {
    model: process.env.SARVAM_MODEL || "gemma4",
    messages: opts.messages,
    max_tokens: opts.maxTokens ?? 1200,
    temperature: opts.temperature ?? 0.2,
  };
  if (opts.tools?.length) {
    body.tools = opts.tools;
    body.tool_choice = "auto";
  }
  if (opts.json) body.response_format = { type: "json_object" };

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), opts.timeoutMs ?? 55_000);
  try {
    const res = await fetch(SARVAM_URL, {
      method: "POST",
      headers: { "api-subscription-key": key, "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Sarvam API ${res.status}: ${text.slice(0, 300)}`);
    }
    const data = (await res.json()) as {
      choices?: Array<{ finish_reason: string; message: { content: string | null; tool_calls?: ChatMessage["tool_calls"] } }>;
      usage?: { total_tokens?: number };
    };
    const choice = data.choices?.[0];
    if (!choice) throw new Error("Sarvam API returned no choices");
    return { message: choice.message, finishReason: choice.finish_reason, tokens: data.usage?.total_tokens ?? 0 };
  } finally {
    clearTimeout(timer);
  }
}

/** Extract a JSON object from model output (tolerates code fences / leading text). */
export function parseJsonLoose<T = unknown>(text: string | null | undefined): T | null {
  if (!text) return null;
  const cleaned = text.replace(/```(?:json)?/gi, "").trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1)) as T;
      } catch {
        return null;
      }
    }
    return null;
  }
}

// Best-effort per-IP rate limit (per server instance).
const hits = new Map<string, number[]>();
export function rateLimited(ip: string, limit = 30, windowMs = 10 * 60_000) {
  const now = Date.now();
  const arr = (hits.get(ip) ?? []).filter((t) => now - t < windowMs);
  arr.push(now);
  hits.set(ip, arr);
  return arr.length > limit;
}
