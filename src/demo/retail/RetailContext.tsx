import React, { createContext, useCallback, useContext, useMemo } from "react";
import { useDemoAuth } from "../auth";
import { useApproval } from "../components/Approval";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useRetailBase } from "../DataGate";
import { buildState, type EventInput, type RetailEvent, type RetailState } from "./state";
import { prioritizedProblems, retailKpis, type Scope } from "./analytics";
import { can as canRole, type Permission, type RetailRole } from "./rbac";

// ---------------------------------------------------------------------------
// Retail OS application state: event log (Convex, shared in real time), derived state, scope,
// permissions and memoised analytics shared by every retail screen.
// ---------------------------------------------------------------------------

interface Ctx {
  state: RetailState;
  kpis: ReturnType<typeof retailKpis>;
  problems: ReturnType<typeof prioritizedProblems>;
  scope: Scope;
  role: RetailRole;
  scopeLabel: string;
  dispatch: (e: EventInput, toastMsg?: string) => void;
  can: (p: Permission) => boolean;
  reset: () => void;
}

/** The readable part of a Convex function error ("Uncaught Error: <msg> at …"). */
function serverMessage(err: unknown) {
  if (!(err instanceof Error)) return "server error";
  const m = /Uncaught Error: ([^\n]+)/.exec(err.message);
  return m ? m[1] : err.message.split("\n")[0];
}

const RetailCtx = createContext<Ctx | null>(null);

export function RetailProvider({ children }: { children: React.ReactNode }) {
  const { user, token } = useDemoAuth();
  const { toast } = useApproval();
  const base = useRetailBase();
  const anchorDate = base.anchorDate;

  // Shared, real-time action log in Convex (convex/scioRetail.ts).
  const remote = useQuery(api.scioRetail.listEvents, token ? { token, anchorDate } : "skip");
  const events = useMemo(() => (remote ?? []) as unknown as RetailEvent[], [remote]);
  const append = useMutation(api.scioRetail.appendEvent).withOptimisticUpdate((store, args) => {
    const key = { token: args.token, anchorDate: args.anchorDate };
    const cur = store.getQuery(api.scioRetail.listEvents, key);
    if (cur) store.setQuery(api.scioRetail.listEvents, key, [...cur, { ...args.payload, id: args.eventId, type: args.type } as (typeof cur)[number]]);
  });
  const resetLog = useMutation(api.scioRetail.resetEvents);
  const role: RetailRole = user?.retailRole ?? "HQ";

  const scope: Scope = useMemo(() => {
    if (user?.scope?.store) {
      const s = base.stores.find((x) => x.id === user.scope!.store);
      return new Set(s ? [s.idx] : []);
    }
    if (user?.scope?.country) return new Set(base.stores.filter((s) => s.country === user.scope!.country).map((s) => s.idx));
    return null;
  }, [user, base]);

  const scopeLabel = user?.scope?.store
    ? `${user.scope.store} ${base.stores.find((s) => s.id === user.scope!.store)?.name ?? ""}`
    : user?.scope?.country
      ? base.countries.find((c) => c.code === user.scope!.country)?.name ?? user.scope.country
      : "All countries · 50 stores";

  const state = useMemo(() => buildState(base, events), [base, events]);
  const kpis = useMemo(() => retailKpis(state, scope), [state, scope]);
  const problems = useMemo(() => prioritizedProblems(state, kpis, scope), [state, kpis, scope]);

  const dispatch = useCallback(
    (e: EventInput, toastMsg?: string) => {
      if (!token) return;
      const ev = { ...e, id: `EV-${Date.now()}-${Math.floor(Math.random() * 1e6)}`, at: new Date().toISOString(), user: user?.name ?? "User", role } as RetailEvent;
      const payload = JSON.parse(JSON.stringify(ev)) as Record<string, unknown>;
      append({ token, anchorDate, eventId: ev.id, type: ev.type, payload }).catch((err: unknown) => toast(`Action not saved: ${serverMessage(err)}`));
      if (toastMsg) toast(toastMsg);
    },
    [user, role, toast, token, anchorDate, append]
  );

  const reset = useCallback(() => {
    if (!token) return;
    resetLog({ token, anchorDate }).then(
      () => toast("Action log cleared · back to the seeded baseline"),
      (err: unknown) => toast(`Reset failed: ${serverMessage(err)}`)
    );
  }, [toast, token, anchorDate, resetLog]);

  const value = useMemo<Ctx>(
    () => ({ state, kpis, problems, scope, role, scopeLabel, dispatch, can: (p) => canRole(role, p), reset }),
    [state, kpis, problems, scope, role, scopeLabel, dispatch, reset]
  );
  return <RetailCtx.Provider value={value}>{children}</RetailCtx.Provider>;
}

export function useRetail() {
  const ctx = useContext(RetailCtx);
  if (!ctx) throw new Error("useRetail must be used inside RetailProvider");
  return ctx;
}

/** Returns the retail context when inside the Retail OS, otherwise null. */
export function useRetailOptional() {
  return useContext(RetailCtx);
}
