import React from "react";

/** Stellar SCIO brand mark (public/favicon.svg) with optional wordmark. */
export function ScioLogo({ size = 28, withText = false, dark = true }: { size?: number; withText?: boolean; dark?: boolean }) {
  return (
    <span className="inline-flex items-center gap-3">
      <img src="/favicon.svg" width={size} height={size} alt="Stellar SCIO" className="shrink-0 rounded-[22%] shadow-[0_4px_14px_-4px_rgba(79,70,229,0.55)]" />
      {withText && (
        <span className="leading-tight">
          <span className={`block text-[20px] font-extrabold tracking-tight ${dark ? "text-[#fff]" : "text-slate-900"}`}>
            Stellar <span className="bg-gradient-to-r from-[#818cf8] to-[#a78bfa] bg-clip-text text-transparent">SCIO</span>
          </span>
          <span className={`block text-[12px] tracking-wide ${dark ? "text-[#cbd5e1]" : "text-slate-500"}`}>Business OS</span>
        </span>
      )}
    </span>
  );
}
