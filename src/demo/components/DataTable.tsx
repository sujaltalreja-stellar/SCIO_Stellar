import React from "react";
import { cx } from "../ui";

export function Table({ head, rows, align }: { head: string[]; rows: React.ReactNode[][]; align: Array<"l" | "r"> }) {
  return (
    <div className="max-h-[560px] overflow-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead className="sticky top-0 bg-white">
          <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500">
            {head.map((h, i) => (
              <th key={h} className={cx("pb-2.5 font-medium", align[i] === "r" ? "text-right" : "text-left")}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((r, i) => (
            <tr key={i} className="hover:bg-slate-50">
              {r.map((c, j) => (
                <td key={j} className={cx("py-2.5 text-slate-600", align[j] === "r" ? "text-right tabular-nums" : "pr-3")}>
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
