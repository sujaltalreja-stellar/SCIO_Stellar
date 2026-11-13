import type { IncomingMessage, ServerResponse } from "node:http";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";
import { generateResponse } from "../lib/ai/chatbotEngine";
import { runCopilot } from "./demo/copilot";
import { runRetailCopilot } from "./demo/retailCopilot";
import { runVision } from "./demo/vision";
import { processDocument } from "./demo/documents";
import { explainAsset, explainItem } from "./demo/explain";
import { NotSignedInError } from "./demo/data";
import { rateLimited, sarvamConfigured } from "./demo/sarvam";

function sendJson(res: ServerResponse, statusCode: number, data: any) {
  if (typeof (res as any).status === "function" && typeof (res as any).json === "function") {
    return (res as any).status(statusCode).json(data);
  }
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(data));
}

function parseJsonBody(req: IncomingMessage): Promise<any> {
  if ((req as any).body) {
    if (typeof (req as any).body === "string") {
      try {
        return Promise.resolve(JSON.parse((req as any).body));
      } catch (e) {
        return Promise.resolve({});
      }
    }
    return Promise.resolve((req as any).body);
  }
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
}

export async function handleApiRequest(
  req: IncomingMessage,
  res: ServerResponse
): Promise<boolean> {
  const urlObj = new URL(req.url || "/", "http://localhost");
  const pathname = urlObj.pathname;
  const method = req.method?.toUpperCase();

  // 0. SCIO DEMO ROUTES (Sarvam-powered copilot + vision)
  if (pathname.startsWith("/api/scio/") && method === "POST") {
    const ip = String(req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "unknown").split(",")[0].trim();
    if (!sarvamConfigured()) {
      sendJson(res, 503, { error: "AI service is not configured (SARVAM_API_KEY missing)." });
      return true;
    }
    if (rateLimited(ip, pathname.endsWith("/vision") ? 15 : 40)) {
      sendJson(res, 429, { error: "Too many requests. Please wait a few minutes and try again." });
      return true;
    }
    try {
      const body = await parseJsonBody(req);
      const scioToken = typeof req.headers["x-scio-token"] === "string" ? req.headers["x-scio-token"] : undefined;
      if (pathname === "/api/scio/copilot") {
        const question = typeof body?.question === "string" ? body.question.trim() : "";
        if (!question) {
          sendJson(res, 400, { error: "Question is required" });
          return true;
        }
        const history = Array.isArray(body?.history)
          ? body.history
              .filter((t: any) => (t?.role === "user" || t?.role === "assistant") && typeof t?.content === "string")
              .slice(-8)
          : [];
        sendJson(res, 200, await runCopilot(question, history, scioToken));
        return true;
      }
      if (pathname === "/api/scio/retail-copilot") {
        const question = typeof body?.question === "string" ? body.question.trim() : "";
        if (!question) {
          sendJson(res, 400, { error: "Question is required" });
          return true;
        }
        const history = Array.isArray(body?.history) ? body.history.filter((t: any) => (t?.role === "user" || t?.role === "assistant") && typeof t?.content === "string").slice(-8) : [];
        const scopeStores = Array.isArray(body?.scope) ? body.scope.filter((n: unknown) => Number.isInteger(n)).slice(0, 60) : null;
        sendJson(res, 200, await runRetailCopilot(question, history, Array.isArray(body?.events) ? body.events : [], scopeStores, scioToken, body?.mode === "card" ? "card" : "text"));
        return true;
      }
      if (pathname === "/api/scio/vision") {
        sendJson(res, 200, await runVision(body?.image, body?.previousImage ?? null));
        return true;
      }
      if (pathname === "/api/scio/document") {
        sendJson(res, 200, await processDocument(body?.text, body?.sector === "retail" ? "retail" : "industrial", scioToken));
        return true;
      }
      if (pathname === "/api/scio/explain") {
        const id = typeof body?.id === "string" ? body.id : "";
        sendJson(res, 200, body?.kind === "item" ? await explainItem(id, scioToken) : await explainAsset(id, scioToken));
        return true;
      }
    } catch (error: any) {
      if (error instanceof NotSignedInError) {
        sendJson(res, 401, { error: error.message });
        return true;
      }
      const msg = String(error?.message || "");
      if (/^(Image (must|is too)|Document text is empty|Unknown (asset|item))/.test(msg)) {
        sendJson(res, 400, { error: msg });
        return true;
      }
      console.error("SCIO demo API error:", error);
      sendJson(res, 502, { error: error?.message?.startsWith("Sarvam API") ? "The AI service is temporarily unavailable. Please try again." : error?.message || "Request failed" });
      return true;
    }
  }

  // 1. DEDICATED INDUSTRIAL COPILOT ROUTE
  if (pathname === "/api/copilot" && method === "POST") {
    try {
      const body = await parseJsonBody(req);
      const { query, industry = "energy" } = body;

      if (!query || typeof query !== "string") {
        sendJson(res, 400, { error: "Query is required" });
        return true;
      }

      const result = await generateResponse(industry, query);
      sendJson(res, 200, result);
    } catch (error: any) {
      sendJson(res, 500, { error: error.message || "Failed to process query" });
    }
    return true;
  }

  // 2. CHATBOT HISTORY ROUTE
  if (pathname === "/api/chatbot/history") {
    const industry = urlObj.searchParams.get("industry") || "home";
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

    if (method === "GET") {
      try {
        if (!convexUrl) {
          sendJson(res, 200, { success: false, messages: [], reason: "Convex URL not configured" });
          return true;
        }

        const client = new ConvexHttpClient(convexUrl.replace(/\/+$/, ""));
        const history = await client.query(api.queries.getChatHistory, { industry });

        const formattedMessages = history.map((record: any) => ({
          id: record._id,
          sender: record.sender,
          text: record.text,
          timestamp: record.timestamp,
          provider: record.provider,
          suggestedAction: record.suggestedAction,
        }));

        sendJson(res, 200, { success: true, messages: formattedMessages });
      } catch (err: any) {
        console.warn("Failed to fetch chat history from Convex:", err);
        sendJson(res, 200, { success: false, messages: [], error: err?.message || String(err) });
      }
      return true;
    }

    if (method === "DELETE") {
      try {
        if (!convexUrl) {
          sendJson(res, 200, { success: false, reason: "Convex URL not configured" });
          return true;
        }

        const client = new ConvexHttpClient(convexUrl.replace(/\/+$/, ""));
        await client.mutation(api.mutations.clearChatHistory, { industry });

        sendJson(res, 200, { success: true });
      } catch (err: any) {
        console.warn("Failed to clear chat history in Convex:", err);
        sendJson(res, 200, { success: false, error: err?.message || String(err) });
      }
      return true;
    }
  }

  // 3. SECTOR-SPECIFIC CHATBOT ROUTES
  const chatbotMatch = pathname.match(/^\/api\/chatbot\/(energy|maritime|manufacturing|logistics|homepage)$/);
  if (chatbotMatch && method === "POST") {
    const sector = chatbotMatch[1];
    try {
      const body = await parseJsonBody(req);
      const { query } = body;

      if (!query || typeof query !== "string") {
        sendJson(res, 400, { error: "Query is required" });
        return true;
      }

      const result = await generateResponse(sector, query);
      sendJson(res, 200, result);
    } catch (error: any) {
      sendJson(res, 500, { error: error.message || "Failed to process query" });
    }
    return true;
  }

  return false;
}
