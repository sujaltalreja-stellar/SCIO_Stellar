import React from "react";
import { StellarScioLogo, StellarScioMark } from "../../components/site/StellarScioLogo";

// Geometry of the full logo SVG (viewBox 220..4160 wide, 903 tall).
const LOGO_RATIO = 3940 / 903; // width / height
const WORD_START = (1102 - 220) / 3940; // "Stellar" starts ~22% in
const WORD_WIDTH = (4150 - 1102) / 3940; // "Stellar SCIO" spans ~77% of the width

/**
 * Stellar SCIO brand — the same logo as the public site.
 * withText: the full logo with the "Business Operating System" tagline set exactly under the
 * wordmark (same width, accent colour), like a classic logo lockup. Otherwise: the hexagon on a
 * dark tile, for tight spots like the collapsed sidebar or loading screen.
 */
export function ScioLogo({ size = 28, withText = false, dark = true }: { size?: number; withText?: boolean; dark?: boolean }) {
  if (withText) {
    const h = Math.round(size * 1.1); // logo height (size 40 → 44px → 192px wide)
    const w = h * LOGO_RATIO;
    const tagW = Math.round(w * WORD_WIDTH);
    const fs = +(h * 0.25).toFixed(1); // 11px at the sidebar size
    return (
      <span className="inline-flex flex-col items-start" aria-label="Stellar SCIO, Business Operating System" role="img">
        <span style={{ height: h }} className={`flex ${dark ? "text-[#fff]" : "text-[#111113]"}`}>
          <StellarScioLogo className="block h-full w-auto" />
        </span>
        <svg
          aria-hidden="true"
          width={tagW}
          height={Math.ceil(fs * 1.3)}
          viewBox={`0 0 ${tagW} ${Math.ceil(fs * 1.3)}`}
          style={{ marginLeft: Math.round(w * WORD_START), marginTop: Math.round(h * 0.02) }}
          className={dark ? "text-[#F2A93B]" : "text-[#B06D0F]"}
        >
          <text
            x="0"
            y={fs}
            textLength={tagW}
            lengthAdjust="spacing"
            fill="currentColor"
            fontSize={fs}
            fontWeight={600}
            fontFamily="Inter, system-ui, -apple-system, sans-serif"
          >
            Business Operating System
          </text>
        </svg>
      </span>
    );
  }
  return (
    <span
      style={{ width: size, height: size }}
      className={`relative grid shrink-0 place-items-center rounded-[26%] text-[#fff] ${dark ? "bg-[#1a1a1d] ring-1 ring-[#fff]/10" : "bg-[#111113]"} shadow-[0_6px_16px_-6px_rgba(0,0,0,0.5)]`}
    >
      <span style={{ height: size * 0.52 }} className="flex">
        <StellarScioMark className="h-full w-auto" />
      </span>
    </span>
  );
}
