import type { IncomingMessage, ServerResponse } from "node:http";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";
import { generateResponse } from "../lib/ai/chatbotEngine";

function sendJson(res: ServerResponse, statusCode: number, data: any) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(data));
}

function parseJsonBody(req: IncomingMessage): Promise<any> {
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

        const client = new ConvexHttpClient(convexUrl);
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

        const client = new ConvexHttpClient(convexUrl);
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
