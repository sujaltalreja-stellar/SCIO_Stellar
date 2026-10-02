import { handleApiRequest } from "../src/server/apiHandler";

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const handled = await handleApiRequest(req, res);
  if (!handled) {
    res.statusCode = 404;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Endpoint not found" }));
  }
}
