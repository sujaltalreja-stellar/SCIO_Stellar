import React from "react";
import { Area, Bar, BarChart, CartesianGrid, Cell, ComposedChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { CellValue, Visual } from "../copilotTypes";
import { axisProps, Badge, C, CATEGORY_COLORS, ChartTooltip, money, num } from "../ui";

const SERIES_COLORS = [C.indigo, C.rose, C.cyan, C.amber];

function fmt(v: CellValue, format?: string) {
  if (v === null || v === undefined || v === "") return "–";
  if (typeof v !== "number") return String(v);
  switch (format) {
    case "money":
      return money(v);
    case "percent":
      return `${v}%`;
    case "days":
      return `${v} d`;
    case "number":
      return num(v);
    default:
      return String(v);
  }
}

function toneFor(value: CellValue): "bad" | "warn" | "good" | "neutral" | null {
  if (typeof value !== "string") return null;
  const v = value.toLowerCase();
  if (v === "critical") return "bad";
  if (v === "high" || v === "warning") return "warn";
  if (v === "medium" || v === "info") return "neutral";
  if (v === "low") return "good";
  return null;
}

export default function VisualView({ visual, index }: { visual: Visual; index: number }) {
  const gid = `v${index}-${visual.title.replace(/\W/g, "")}`;

  if (visual.kind === "table") {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50">
        <div className="border-b border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-800">{visual.title}</div>
        <div className="max-h-[340px] overflow-auto">
          <table className="w-full min-w-[520px] text-[13px]">
            <thead className="sticky top-0 bg-slate-50">
              <tr className="text-left text-[11px] uppercase tracking-wider text-slate-500">
                {visual.columns.map((c) => (
                  <th key={c.key} className={`px-4 py-2 font-medium ${c.format && c.format !== "text" ? "text-right" : ""}`}>
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visual.rows.map((r, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  {visual.columns.map((c) => {
                    const tone = toneFor(r[c.key]);
                    return (
                      <td key={c.key} className={`px-4 py-2 text-slate-600 ${c.format && c.format !== "text" ? "text-right tabular-nums" : ""}`}>
                        {tone ? <Badge tone={tone}>{String(r[c.key])}</Badge> : fmt(r[c.key], c.format)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  const fmtVal = (v: number) => fmt(v, visual.format);
  const tick = (v: number) => (visual.format === "money" ? money(v, true).replace("AED ", "") : num(v));

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-slate-800">{visual.title}</span>
        {visual.series.length > 1 && visual.kind !== "pie" && (
          <span className="flex gap-3 text-[11px] text-slate-500">
            {visual.series.map((s, i) => (
              <span key={s.key} className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: SERIES_COLORS[i] }} />
                {s.label}
              </span>
            ))}
          </span>
        )}
      </div>

      {visual.kind === "pie" ? (
        <div className="flex flex-wrap items-center gap-4">
          <div className="h-[190px] w-[190px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={visual.rows} dataKey={visual.series[0].key} nameKey={visual.xKey} innerRadius={56} outerRadius={88} paddingAngle={2} stroke="none">
                  {visual.rows.map((_, i) => (
                    <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip format={fmtVal} />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="min-w-[160px] flex-1 space-y-1.5 text-xs">
            {visual.rows.map((r, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-sm" style={{ background: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }} />
                <span className="truncate text-slate-600">{String(r[visual.xKey])}</span>
                <span className="ml-auto tabular-nums text-slate-500">{fmtVal(Number(r[visual.series[0].key]))}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : visual.kind === "hbar" ? (
        <div style={{ height: Math.max(160, visual.rows.length * 34 + 20) }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={visual.rows} layout="vertical" margin={{ left: 8, right: 24 }}>
              <defs>
                <linearGradient id={`${gid}-h`} x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor={C.indigo} stopOpacity={0.55} />
                  <stop offset="100%" stopColor={C.cyan} />
                </linearGradient>
              </defs>
              <CartesianGrid horizontal={false} stroke={C.grid} />
              <XAxis type="number" {...axisProps} tickFormatter={tick} />
              <YAxis type="category" dataKey={visual.xKey} {...axisProps} width={170} tick={{ fill: "#94a3b8", fontSize: 11 }} />
              <Tooltip content={<ChartTooltip format={fmtVal} />} cursor={{ fill: "rgba(59,130,246,0.05)" }} />
              <Bar dataKey={visual.series[0].key} name={visual.series[0].label} fill={`url(#${gid}-h)`} radius={[0, 6, 6, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : visual.kind === "line" ? (
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={visual.rows} margin={{ left: -4, right: 8 }}>
              <defs>
                <linearGradient id={`${gid}-a`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={C.cyan} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={C.cyan} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke={C.grid} />
              <XAxis dataKey={visual.xKey} {...axisProps} />
              <YAxis {...axisProps} tickFormatter={tick} width={56} />
              <Tooltip content={<ChartTooltip format={fmtVal} />} cursor={{ stroke: "rgba(15,23,42,0.15)" }} />
              <Area type="monotone" dataKey={visual.series[0].key} name={visual.series[0].label} stroke={C.cyan} strokeWidth={2.5} fill={`url(#${gid}-a)`} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={visual.rows} margin={{ left: -4, right: 8 }}>
              <CartesianGrid vertical={false} stroke={C.grid} />
              <XAxis dataKey={visual.xKey} {...axisProps} />
              <YAxis {...axisProps} tickFormatter={tick} width={56} />
              <Tooltip content={<ChartTooltip format={fmtVal} />} cursor={{ fill: "rgba(59,130,246,0.05)" }} />
              {visual.series.map((s, i) => (
                <Bar key={s.key} dataKey={s.key} name={s.label} fill={SERIES_COLORS[i]} radius={[5, 5, 0, 0]} maxBarSize={36} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

