import type { IncomingMessage, ServerResponse } from "node:http";
import { handleApiRequest } from "./apiHandler";

// Single serverless entry point for every /api/* route. vercel.json rewrites
// /api/<path> to /api?__p=<path>; restore the original URL before routing.
export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const url = new URL(req.url || "/api", "http://localhost");
  const original = url.searchParams.get("__p");
  if (original !== null) {
    url.searchParams.delete("__p");
    const qs = url.searchParams.toString();
    req.url = `/api/${original.replace(/^\/+/, "")}${qs ? `?${qs}` : ""}`;
  }
  const handled = await handleApiRequest(req, res);
  if (!handled) {
    res.statusCode = 404;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Endpoint not found" }));
  }
}
