import type { Plugin } from "vite";
import { handleApiRequest } from "./src/server/apiHandler.ts";

export function viteApiPlugin(): Plugin {
  return {
    name: "vite-plugin-stellar-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith("/api/")) {
          try {
            const handled = await handleApiRequest(req, res);
            if (handled) return;
          } catch (err) {
            console.error("Error handling API request in Vite server:", err);
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Internal Server Error" }));
            return;
          }
        }
        next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith("/api/")) {
          try {
            const handled = await handleApiRequest(req, res);
            if (handled) return;
          } catch (err) {
            console.error("Error handling API request in Preview server:", err);
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Internal Server Error" }));
            return;
          }
        }
        next();
      });
    },
  };
}
