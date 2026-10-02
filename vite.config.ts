import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { viteApiPlugin } from "./vite-api-plugin.ts";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  // Populate process.env so server-side modules (e.g. Mistral API keys, Convex) work
  Object.assign(process.env, env);

  const baseDir = import.meta.dirname || path.resolve(".");

  return {
    plugins: [
      tailwindcss(),
      react(),
      viteApiPlugin(),
    ],
    resolve: {
      alias: {
        "@": path.resolve(baseDir, "./src"),
        "next/navigation": path.resolve(baseDir, "./src/lib/next-compat/navigation.ts"),
        "next/link": path.resolve(baseDir, "./src/lib/next-compat/link.tsx"),
        "next/dynamic": path.resolve(baseDir, "./src/lib/next-compat/dynamic.tsx"),
        "next/image": path.resolve(baseDir, "./src/lib/next-compat/image.tsx"),
      },
    },
    define: {
      "process.env.NEXT_PUBLIC_CONVEX_URL": JSON.stringify(
        env.NEXT_PUBLIC_CONVEX_URL || "https://polite-civet-30.convex.cloud"
      ),
      "process.env.NEXT_PUBLIC_CONVEX_SITE_URL": JSON.stringify(
        env.NEXT_PUBLIC_CONVEX_SITE_URL || "https://polite-civet-30.convex.site"
      ),
      "process.env.NEXT_PUBLIC_SITE_URL": JSON.stringify(
        env.NEXT_PUBLIC_SITE_URL || "https://www.stellarscio.app"
      ),
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV || "development"),
    },
    server: {
      port: 3000,
      host: true,
      open: false,
    },
    preview: {
      port: 3000,
      host: true,
    },
  };
});
