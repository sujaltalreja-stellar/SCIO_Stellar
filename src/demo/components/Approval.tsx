import React, { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, X, ShieldCheck } from "lucide-react";
import { useDemoAuth } from "../auth";
import { cx } from "../ui";

// Human-in-the-loop approvals + toast notifications shared by all modules.

export interface ApprovalRequest {
  kind: "Purchase request" | "Work order" | "Invoice payment" | "Invoice hold" | "Stock transfer" | "Purchase order" | "Markdown" | "Cycle count" | "Maintenance ticket" | "Replenishment action";
  title: string;
  lines: Array<[string, string]>;
  note?: string;
  confirmLabel?: string;
  /** suppress the "sent to ERP" wording */
  silent?: boolean;
}

export interface ApprovedRecord extends ApprovalRequest {
  ref: string;
  at: string;
  by: string;
}

interface Ctx {
  request: (r: ApprovalRequest) => Promise<ApprovedRecord | null>;
  records: ApprovedRecord[];
  toast: (msg: string) => void;
}

const ApprovalCtx = createContext<Ctx | null>(null);

const PREFIX: Record<ApprovalRequest["kind"], string> = {
  "Purchase request": "PR",
  "Work order": "WO",
  "Invoice payment": "AP",
  "Invoice hold": "HLD",
  "Stock transfer": "TRF",
  "Purchase order": "PO",
  Markdown: "MD",
  "Cycle count": "CC",
  "Maintenance ticket": "TKT",
  "Replenishment action": "ACT",
};

export function ApprovalProvider({ children }: { children: React.ReactNode }) {
  const { user } = useDemoAuth();
  const [pending, setPending] = useState<{ req: ApprovalRequest; resolve: (r: ApprovedRecord | null) => void } | null>(null);
  const [records, setRecords] = useState<ApprovedRecord[]>([]);
  const [toasts, setToasts] = useState<Array<{ id: number; msg: string }>>([]);

  const toast = useCallback((msg: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);

  const request = useCallback((req: ApprovalRequest) => new Promise<ApprovedRecord | null>((resolve) => setPending({ req, resolve })), []);

  const close = (approved: boolean) => {
    if (!pending) return;
    if (approved) {
      const rec: ApprovedRecord = {
        ...pending.req,
        ref: `${PREFIX[pending.req.kind]}-${String(Math.floor(Date.now() / 1000) % 100000).padStart(5, "0")}`,
        at: new Date().toISOString(),
        by: user?.name ?? "User",
      };
      setRecords((r) => [rec, ...r]);
      pending.resolve(rec);
      toast(`${rec.kind} ${rec.ref} approved${pending.req.silent ? "" : " and sent to ERP"}`);
    } else pending.resolve(null);
    setPending(null);
  };

  return (
    <ApprovalCtx.Provider value={{ request, records, toast }}>
      {children}

      {pending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/40 p-4 backdrop-blur-sm" onClick={() => close(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Approval required · {pending.req.kind}</div>
                  <div className="text-lg font-semibold text-slate-900">{pending.req.title}</div>
                </div>
              </div>
              <button onClick={() => close(false)} className="text-slate-500 hover:text-slate-900" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>
            <dl className="mt-5 divide-y divide-slate-100 rounded-xl border border-slate-200 bg-slate-50 text-sm">
              {pending.req.lines.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 px-4 py-2.5">
                  <dt className="text-slate-500">{k}</dt>
                  <dd className="text-right font-medium text-slate-900">{v}</dd>
                </div>
              ))}
            </dl>
            {pending.req.note && <p className="mt-3 text-xs text-slate-500">{pending.req.note}</p>}
            <div className="mt-6 flex gap-3">
              <button onClick={() => close(false)} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm text-slate-600 hover:bg-slate-100">
                Cancel
              </button>
              <button
                onClick={() => close(true)}
                className="flex-1 rounded-xl bg-[#2563eb] py-2.5 text-sm font-semibold text-[#fff] shadow-sm shadow-blue-600/20 hover:bg-[#1d4ed8]"
              >
                {pending.req.confirmLabel ?? "Approve"}
              </button>
            </div>
            <p className="mt-3 text-center text-[11px] text-slate-500">Approving as {user?.name} · {user?.role}</p>
          </div>
        </div>
      )}

      <div className="pointer-events-none fixed bottom-5 right-5 z-[60] flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cx(
              "pointer-events-auto flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm text-emerald-700 shadow-2xl backdrop-blur",
              "animate-[fadein_.25s_ease-out]"
            )}
          >
            <CheckCircle2 className="h-4 w-4 text-emerald-600" /> {t.msg}
          </div>
        ))}
      </div>
    </ApprovalCtx.Provider>
  );
}

export function useApproval() {
  const ctx = useContext(ApprovalCtx);
  if (!ctx) throw new Error("useApproval must be used inside ApprovalProvider");
  return ctx;
}
