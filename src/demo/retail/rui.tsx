import React, { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Search, X, ArrowUpDown, Lock, Info } from "lucide-react";
import { cx } from "../ui";
import { useRetail } from "./RetailContext";
import type { Permission } from "./rbac";
import type { RetailBase } from "./model";

// Shared Retail OS UI building blocks.

export const aed = (n: number, compact = true) =>
  compact ? "AED " + Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n) : "AED " + Math.round(n).toLocaleString("en-US");

export const nf = (n: number, dp = 0) => n.toLocaleString("en-US", { maximumFractionDigits: dp, minimumFractionDigits: 0 });
export const pctf = (n: number, dp = 1) => `${(n * 100).toFixed(dp)}%`;

/** Price in a store's local currency (base prices are AED). */
export function localPrice(base: RetailBase, storeIdx: number, aedAmount: number) {
  const c = base.countries.find((x) => x.code === base.stores[storeIdx].country)!;
  const v = aedAmount / c.toAed;
  return `${c.currency} ${v.toLocaleString("en-US", { minimumFractionDigits: c.toAed > 5 ? 3 : 2, maximumFractionDigits: c.toAed > 5 ? 3 : 2 })}`;
}

export function PageTitle({ title, sub, right }: { title: string; sub: string; right?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-[30px] font-bold tracking-tight text-slate-900">{title}</h1>
        <p className="mt-1.5 text-[15px] text-slate-600">{sub}</p>
      </div>
      {right}
    </div>
  );
}

/** The four questions every screen must answer. */
export function Situation({ what, why, where, action }: { what: React.ReactNode; why: React.ReactNode; where: React.ReactNode; action: React.ReactNode }) {
  const items: Array<[string, React.ReactNode, string]> = [
    ["What is happening", what, "border-l-rose-400"],
    ["Why", why, "border-l-amber-400"],
    ["Where", where, "border-l-blue-400"],
    ["Action required", action, "border-l-emerald-500"],
  ];
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {items.map(([k, v, c]) => (
        <div key={k} className={cx("rounded-xl border border-slate-200 border-l-4 bg-white px-4 py-3 shadow-sm", c)}>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{k}</div>
          <div className="mt-1 text-[13.5px] leading-snug text-slate-800">{v}</div>
        </div>
      ))}
    </div>
  );
}

export function Tabs<T extends string>({ tabs, value, onChange }: { tabs: Array<[T, string, number?]>; value: T; onChange: (t: T) => void }) {
  return (
    <div className="flex gap-1 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">
      {tabs.map(([k, label, count]) => (
        <button
          key={k}
          onClick={() => onChange(k)}
          className={cx("inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition", value === k ? "bg-[#111113] text-[#fff] shadow-sm" : "text-slate-700 hover:bg-slate-50")}
        >
          {label}
          {count !== undefined && (
            <span className={cx("rounded-md px-1.5 py-0.5 text-[11px] font-bold", value === k ? "bg-[#fff]/20 text-[#fff]" : "bg-slate-100 text-slate-600")}>{nf(count)}</span>
          )}
        </button>
      ))}
    </div>
  );
}

export function Pill({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "good" | "warn" | "bad" | "accent" | "violet" }) {
  const cls = {
    neutral: "bg-slate-100 text-slate-600 ring-slate-200",
    good: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    warn: "bg-amber-50 text-amber-700 ring-amber-200",
    bad: "bg-rose-50 text-rose-600 ring-rose-200",
    accent: "bg-blue-50 text-blue-700 ring-blue-200",
    violet: "bg-violet-50 text-violet-700 ring-violet-200",
  }[tone];
  return <span className={cx("inline-flex items-center whitespace-nowrap rounded-md px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset", cls)}>{children}</span>;
}

/** Button that respects role permissions. */
export function ActButton({
  perm,
  onClick,
  children,
  variant = "primary",
  size = "sm",
  disabled,
  title,
}: {
  perm?: Permission;
  onClick: () => void;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md";
  disabled?: boolean;
  title?: string;
}) {
  const { can, role } = useRetail();
  const allowed = !perm || can(perm);
  const cls = {
    primary: "bg-[#111113] text-[#fff] hover:bg-[#2a2a30] shadow-sm shadow-blue-600/20",
    secondary: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
    danger: "border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100",
    ghost: "text-blue-700 hover:bg-blue-50",
  }[variant];
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        if (allowed && !disabled) onClick();
      }}
      disabled={!allowed || disabled}
      title={!allowed ? `Your role (${role}) cannot perform this action` : title}
      className={cx(
        "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg font-semibold transition disabled:cursor-not-allowed disabled:opacity-45",
        size === "sm" ? "px-2.5 py-1.5 text-xs" : "px-4 py-2 text-sm",
        cls
      )}
    >
      {!allowed && <Lock className="h-3 w-3" />}
      {children}
    </button>
  );
}

export interface Column<T> {
  key: string;
  label: string;
  render: (row: T) => React.ReactNode;
  sort?: (row: T) => number | string;
  align?: "left" | "right" | "center";
  width?: string;
}

/** Searchable, sortable, paginated table for large datasets. */
export function DataGrid<T>({
  rows,
  columns,
  search,
  placeholder = "Search…",
  pageSize = 25,
  onRowClick,
  empty = "Nothing to show.",
  toolbar,
  rowKey,
  initialSort,
}: {
  rows: T[];
  columns: Column<T>[];
  search?: (row: T) => string;
  placeholder?: string;
  pageSize?: number;
  onRowClick?: (row: T) => void;
  empty?: string;
  toolbar?: React.ReactNode;
  rowKey: (row: T) => string;
  initialSort?: { key: string; dir: "asc" | "desc" };
}) {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" } | null>(initialSort ?? null);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let r = needle && search ? rows.filter((x) => search(x).toLowerCase().includes(needle)) : rows;
    if (sort) {
      const col = columns.find((c) => c.key === sort.key);
      if (col?.sort) {
        const f = col.sort;
        r = [...r].sort((a, b) => {
          const va = f(a);
          const vb = f(b);
          const c = typeof va === "number" && typeof vb === "number" ? va - vb : String(va).localeCompare(String(vb));
          return sort.dir === "asc" ? c : -c;
        });
      }
    }
    return r;
  }, [rows, q, sort, columns, search]);

  useEffect(() => setPage(0), [q, rows.length]);
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const view = filtered.slice(page * pageSize, page * pageSize + pageSize);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      {(search || toolbar) && (
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-3">
          {search && (
            <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 focus-within:border-blue-400 focus-within:bg-white">
              <Search className="h-4 w-4 text-slate-400" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={placeholder} className="w-full bg-transparent py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400" />
              {q && (
                <button onClick={() => setQ("")} aria-label="Clear search">
                  <X className="h-4 w-4 text-slate-400" />
                </button>
              )}
            </div>
          )}
          {toolbar}
          <span className="ml-auto text-xs text-slate-500">{nf(filtered.length)} rows</span>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70 text-[12px] text-slate-600">
              {columns.map((c) => (
                <th
                  key={c.key}
                  style={{ width: c.width }}
                  onClick={() => c.sort && setSort((s) => (s?.key === c.key ? { key: c.key, dir: s.dir === "asc" ? "desc" : "asc" } : { key: c.key, dir: "desc" }))}
                  className={cx("px-3 py-2.5 font-semibold", c.align === "right" ? "text-right" : c.align === "center" ? "text-center" : "text-left", c.sort && "cursor-pointer select-none hover:text-slate-900")}
                >
                  <span className="inline-flex items-center gap-1">
                    {c.label}
                    {c.sort && <ArrowUpDown className={cx("h-3 w-3", sort?.key === c.key ? "text-blue-600" : "text-slate-300")} />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {view.map((r) => (
              <tr key={rowKey(r)} onClick={() => onRowClick?.(r)} className={cx("hover:bg-blue-50/40", onRowClick && "cursor-pointer")}>
                {columns.map((c) => (
                  <td key={c.key} className={cx("px-3 py-2.5 align-middle text-slate-700", c.align === "right" ? "text-right tabular-nums" : c.align === "center" ? "text-center" : "")}>
                    {c.render(r)}
                  </td>
                ))}
              </tr>
            ))}
            {view.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-3 py-10 text-center text-sm text-slate-500">
                  {empty}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {pages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-100 px-3 py-2 text-xs text-slate-600">
          <span>
            Page {page + 1} of {nf(pages)}
          </span>
          <div className="flex gap-1">
            <button disabled={page === 0} onClick={() => setPage((p) => p - 1)} className="rounded-lg border border-slate-200 p-1.5 hover:bg-slate-50 disabled:opacity-40" aria-label="Previous page">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button disabled={page >= pages - 1} onClick={() => setPage((p) => p + 1)} className="rounded-lg border border-slate-200 p-1.5 hover:bg-slate-50 disabled:opacity-40" aria-label="Next page">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function Drawer({ open, onClose, title, sub, children, width = "max-w-3xl" }: { open: boolean; onClose: () => void; title: React.ReactNode; sub?: React.ReactNode; children: React.ReactNode; width?: string }) {
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-[#0f172a]/30 backdrop-blur-[2px]" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className={cx("flex h-full w-full flex-col bg-[var(--scio-page)] shadow-2xl animate-[fadein_.2s_ease-out]", width)}>
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-6 py-4">
          <div className="min-w-0">
            <div className="truncate text-lg font-bold text-slate-900">{title}</div>
            {sub && <div className="mt-0.5 text-sm text-slate-500">{sub}</div>}
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}

export function Stat({ label, value, sub, tone }: { label: string; value: React.ReactNode; sub?: React.ReactNode; tone?: "bad" | "good" | "warn" }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3.5">
      <div className="text-[12px] text-slate-500">{label}</div>
      <div className={cx("mt-1 text-xl font-bold tabular-nums", tone === "bad" ? "text-rose-600" : tone === "good" ? "text-emerald-600" : tone === "warn" ? "text-amber-600" : "text-slate-900")}>{value}</div>
      {sub && <div className="mt-0.5 text-xs text-slate-500">{sub}</div>}
    </div>
  );
}

export function SyntheticNote() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-800 ring-1 ring-inset ring-amber-200">
      <Info className="h-3.5 w-3.5" /> Synthetic demo data · actions are simulated
    </span>
  );
}

export function MiniBar({ value, tone = "accent" }: { value: number; tone?: "accent" | "bad" | "good" | "warn" }) {
  const c = { accent: "bg-blue-500", bad: "bg-rose-500", good: "bg-emerald-500", warn: "bg-amber-400" }[tone];
  return (
    <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100">
      <div className={cx("h-full rounded-full", c)} style={{ width: `${Math.max(2, Math.min(100, value * 100))}%` }} />
    </div>
  );
}
