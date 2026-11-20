import React from "react";

/** Stellar SCIO brand mark (black tile, gold dot) with optional wordmark — same as the sign-in page. */
export function ScioLogo({ size = 28, withText = false, dark = true }: { size?: number; withText?: boolean; dark?: boolean }) {
  return (
    <span className="inline-flex items-center gap-3">
      <span
        style={{ width: size, height: size, fontSize: size * 0.48 }}
        className={`relative grid shrink-0 place-items-center rounded-[26%] font-black text-[#fff] ${dark ? "bg-[#1a1a1d] ring-1 ring-[#fff]/10" : "bg-[#111113]"} shadow-[0_6px_16px_-6px_rgba(0,0,0,0.5)]`}
      >
        S
        <span style={{ width: size * 0.24, height: size * 0.24 }} className="absolute right-[14%] top-[14%] rounded-full bg-[#f2a93b]" />
      </span>
      {withText && (
        <span className="leading-tight">
          <span className={`block text-[19px] font-extrabold tracking-tight ${dark ? "text-[#fff]" : "text-slate-900"}`}>
            Stellar <span className="text-[#f2a93b]">SCIO</span>
          </span>
          <span className={`block text-[12px] ${dark ? "text-[#a1a1aa]" : "text-slate-500"}`}>Business Operating System</span>
        </span>
      )}
    </span>
  );
}
