import React from "react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import type { IssueSeverity } from "./data/analytics";

// Shared UI primitives for the SCIO app (light enterprise theme).

export function cx(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

export const money = (n: number, compact = false) =>
  compact
    ? "AED " + Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n)
    : "AED " + Math.round(n).toLocaleString("en-US");

export const num = (n: number) => Math.round(n).toLocaleString("en-US");

// Chart palette tuned for white surfaces
export const C = {
  indigo: "#f2a93b", // primary (SCIO gold)
  cyan: "#14b8a6", // teal
  violet: "#8b5cf6",
  emerald: "#22c55e",
  amber: "#f59e0b",
  rose: "#ef4444",
  slate: "#94a3b8",
  grid: "rgba(148,163,184,0.18)",
};
export const CATEGORY_COLORS = ["#f2a93b", "#8b5cf6", "#14b8a6", "#f59e0b", "#ec4899", "#22c55e", "#06b6d4", "#f97316", "#334155", "#94a3b8"];

export const axisProps = { stroke: "#94a3b8", fontSize: 11, tickLine: false, axisLine: false } as const;

export function Card({ className, children, delay = 0 }: { className?: string; children: React.ReactNode; glow?: boolean; delay?: number }) {
  return (
    <div
      style={delay ? { animationDelay: `${delay}ms` } : undefined}
      className={cx("scio-rise relative rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.08)] transition-shadow hover:shadow-[0_1px_2px_rgba(15,23,42,0.04),0_14px_32px_-14px_rgba(15,23,42,0.14)]", className)}
    >
      {children}
    </div>
  );
}

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/** Animates a number from its previous value to `target`. */
export function useCountUp(target: number, duration = 900) {
  const [v, setV] = React.useState(0);
  const from = React.useRef(0);
  React.useEffect(() => {
    if (typeof window === "undefined" || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setV(target);
      from.current = target;
      return;
    }
    const start = performance.now();
    const a = from.current;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const cur = a + (target - a) * easeOut(t);
      setV(cur);
      from.current = cur;
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return v;
}

/** Renders a formatted value string ("AED 12.4M", "97%", "1,204") with its number counting up. */
export function AnimatedValue({ value, duration }: { value: string; duration?: number }) {
  const m = /^(.*?)(-?\d[\d,]*(?:\.\d+)?)(.*)$/.exec(value);
  const raw = m ? m[2] : "";
  const decimals = raw.includes(".") ? raw.split(".")[1].length : 0;
  const grouped = raw.includes(",");
  const target = m ? Number(raw.replace(/,/g, "")) : 0;
  const v = useCountUp(target, duration);
  if (!m) return <>{value}</>;
  const shown = v.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals, useGrouping: grouped });
  return (
    <>
      {m[1]}
      {shown}
      {m[3]}
    </>
  );
}

export function CardTitle({ children, hint, right, icon }: { children: React.ReactNode; hint?: string; right?: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div className="flex items-start gap-3">
        {icon && <span className="mt-0.5 text-slate-500">{icon}</span>}
        <div>
          <h3 className="text-[17px] font-semibold tracking-tight text-slate-900">{children}</h3>
          {hint && <p className="mt-0.5 text-[13px] text-slate-500">{hint}</p>}
        </div>
      </div>
      {right}
    </div>
  );
}

export function Sparkline({ data, color, id, fill = true }: { data: number[]; color: string; id: string; fill?: boolean }) {
  const rows = data.map((v, i) => ({ i, v }));
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={rows} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={`spark-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={fill ? 0.28 : 0} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.75} fill={`url(#spark-${id})`} isAnimationActive animationDuration={1100} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

type Tint = "blue" | "violet" | "rose" | "green" | "lavender" | "amber" | "teal";
const TINTS: Record<Tint, { card: string; icon: string }> = {
  blue: { card: "bg-gradient-to-br from-blue-50 to-white border-blue-100", icon: "text-blue-600" },
  violet: { card: "bg-gradient-to-br from-violet-50/80 to-white border-violet-100", icon: "text-violet-600" },
  rose: { card: "bg-gradient-to-br from-orange-50 to-white border-orange-100", icon: "text-orange-500" },
  green: { card: "bg-gradient-to-br from-emerald-50 to-white border-emerald-100", icon: "text-emerald-600" },
  lavender: { card: "bg-gradient-to-br from-indigo-50 to-white border-indigo-100", icon: "text-indigo-600" },
  amber: { card: "bg-gradient-to-br from-amber-50 to-white border-amber-100", icon: "text-amber-600" },
  teal: { card: "bg-gradient-to-br from-teal-50 to-white border-teal-100", icon: "text-teal-600" },
};
const COLOR_TINT: Record<string, Tint> = {
  [C.indigo]: "blue",
  [C.cyan]: "teal",
  [C.violet]: "violet",
  [C.emerald]: "green",
  [C.amber]: "amber",
  [C.rose]: "rose",
};

export function Kpi({
  label,
  value,
  delta,
  deltaGood,
  deltaPill,
  sub,
  spark,
  color = C.indigo,
  tint,
  icon,
  delay = 0,
  onClick,
}: {
  label: string;
  value: string;
  delta?: string;
  deltaGood?: boolean;
  /** Render delta as a coloured pill (e.g. "5 Critical"). */
  deltaPill?: boolean;
  sub?: string;
  spark?: number[];
  color?: string;
  tint?: Tint;
  icon?: React.ReactNode;
  delay?: number;
  onClick?: () => void;
}) {
  const t = TINTS[tint ?? COLOR_TINT[color] ?? "blue"];
  return (
    <div style={delay ? { animationDelay: `${delay}ms` } : undefined} className={cx("scio-rise scio-lift group relative overflow-hidden rounded-2xl border p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]", t.card, onClick && "cursor-pointer")} onClick={onClick}>
      <div className="flex items-center gap-2.5">
        {icon && <span className={cx("grid h-9 w-9 place-items-center rounded-xl bg-white/80 shadow-sm ring-1 ring-black/5 transition-transform duration-300 group-hover:scale-110 [&>svg]:h-5 [&>svg]:w-5", t.icon)}>{icon}</span>}
        <span className="text-[15px] font-semibold text-slate-800">{label}</span>
      </div>
      <div className="mt-3 text-[30px] font-bold leading-none tracking-tight text-slate-900 tabular-nums">
        <AnimatedValue value={value} />
      </div>
      <div className="relative z-[1] mt-3 flex min-w-0 items-center gap-2 text-[13px]">
        {delta &&
          (deltaPill ? (
            <span className={cx("whitespace-nowrap rounded-md px-2 py-0.5 font-medium", deltaGood ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-600")}>{delta}</span>
          ) : (
            <span className={cx("whitespace-nowrap rounded-md px-1.5 py-0.5 font-semibold", deltaGood ? "bg-emerald-100/70 text-emerald-700" : "bg-rose-100/70 text-rose-600")}>{delta}</span>
          ))}
        {sub && <span className="min-w-0 truncate text-slate-500">{sub}</span>}
      </div>
      {spark && (
        <div className="pointer-events-none -mx-5 -mb-5 mt-2 h-10 opacity-90">
          <Sparkline data={spark} color={color === C.indigo ? C.emerald : color} id={label.replace(/\W/g, "")} />
        </div>
      )}
    </div>
  );
}

export function SeverityDot({ severity }: { severity: IssueSeverity }) {
  const cls = {
    critical: "bg-rose-500 ring-rose-100",
    warning: "bg-amber-400 ring-amber-100",
    info: "bg-sky-400 ring-sky-100",
  }[severity];
  return <span className={cx("mt-1.5 inline-block h-2.5 w-2.5 shrink-0 rounded-full ring-4", cls)} />;
}

export function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "good" | "warn" | "bad" | "accent" }) {
  const cls = {
    neutral: "bg-slate-100 text-slate-600 ring-slate-200",
    good: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    warn: "bg-amber-50 text-amber-700 ring-amber-200",
    bad: "bg-rose-50 text-rose-600 ring-rose-200",
    accent: "bg-blue-50 text-blue-700 ring-blue-200",
  }[tone];
  return <span className={cx("inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold capitalize ring-1 ring-inset", cls)}>{children}</span>;
}

export function ChartTooltip({
  active,
  payload,
  label,
  format = (v: number) => num(v),
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number; color?: string; stroke?: string; fill?: string; dataKey?: string }>;
  label?: string;
  format?: (v: number, key?: string) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-xl">
      {label && <div className="mb-1.5 font-semibold text-slate-700">{label}</div>}
      {payload.map((p) => (
        <div key={String(p.dataKey ?? p.name)} className="flex items-center gap-2 py-0.5">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color || p.stroke || (typeof p.fill === "string" && !p.fill.startsWith("url") ? p.fill : "#f2a93b") }} />
          <span className="text-slate-500">{p.name}</span>
          <span className="ml-auto pl-4 font-semibold tabular-nums text-slate-900">{format(Number(p.value), p.dataKey)}</span>
        </div>
      ))}
    </div>
  );
}

/** Page background. */
export function Aurora() {
  return <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 bg-[var(--scio-page)]" />;
}

/** Primary button classes. */
export const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-[#111113] px-4 py-2 text-sm font-semibold text-[#fff] shadow-sm shadow-blue-600/20 transition hover:bg-[#2a2a30] disabled:opacity-40";
export const btnSecondary = "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50";

/** Pulsing "Live" chip for use on dark hero surfaces. */
export function LiveBadge({ label = "Live" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fff]/15 px-2.5 py-1 ring-1 ring-[#fff]/20 backdrop-blur">
      <span className="relative flex h-2 w-2">
        <span className="scio-ping absolute inline-flex h-full w-full rounded-full bg-[#6ee7b7]" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-[#34d399]" />
      </span>
      {label}
    </span>
  );
}

/** Animated score ring for hero banners (0-100). */
export function HealthRing({ score, label = "Health score" }: { score: number; label?: string }) {
  const v = useCountUp(score, 1600);
  const r = 52;
  const c = 2 * Math.PI * r;
  const tone = score >= 85 ? "#6ee7b7" : score >= 70 ? "#fcd34d" : "#fda4af";
  return (
    <div className="flex flex-col items-center justify-self-center">
      <div className="relative h-[136px] w-[136px]">
        <svg viewBox="0 0 128 128" className="h-full w-full -rotate-90">
          <circle cx="64" cy="64" r={r} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="11" />
          <circle cx="64" cy="64" r={r} fill="none" stroke={tone} strokeWidth="11" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - v / 100)} style={{ filter: `drop-shadow(0 0 8px ${tone}88)` }} />
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <div className="text-[34px] font-bold leading-none tabular-nums">{Math.round(v)}</div>
            <div className="mt-1 text-[11px] uppercase tracking-wider text-[#dbeafe]">Health</div>
          </div>
        </div>
      </div>
      <div className="mt-2 text-[12px] text-[#dbeafe]">{label}</div>
    </div>
  );
}

