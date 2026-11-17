import React from "react";

/** Full-screen loading state. Light for the marketing site, dark for the platform and /app. */
export default function PageLoader({ dark = false }: { dark?: boolean }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex min-h-screen flex-col items-center justify-center gap-4 ${
        dark ? "bg-[#0a0d14] text-slate-300" : "bg-white text-[#5d5a54]"
      }`}
    >
      <span className="h-9 w-9 animate-spin rounded-full border-[3px] border-current border-t-transparent opacity-70" />
      <span className="text-sm font-medium">Loading SCIO…</span>
    </div>
  );
}
