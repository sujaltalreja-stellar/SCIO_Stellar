import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useConvex, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { RetailRole } from "./retail/rbac";

// ---------------------------------------------------------------------------
// SCIO sign-in, backed by Convex (convex/scioAuth.ts). Passwords are verified
// server-side against salted hashes; the browser keeps only a session token.
// This is demo-grade auth (fixed personas), not a production identity system.
// ---------------------------------------------------------------------------

export { DEMO_ACCOUNTS } from "./accounts";

export interface DemoUser {
  email: string;
  name: string;
  role: string;
  /** Retail OS role and data scope */
  retailRole?: RetailRole;
  scope?: { country?: string; store?: string };
}

interface Session {
  token: string;
  user: DemoUser;
}

const STORAGE_KEY = "scio_session_v2";

function readSession(): Session | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const s = raw ? (JSON.parse(raw) as Session) : null;
    return s?.token && s.user ? s : null;
  } catch {
    return null;
  }
}

function writeSession(s: Session | null) {
  try {
    if (s) localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* storage unavailable: session lasts for this page only */
  }
}

type ServerUser = { email: string; name: string; role: string; retailRole: string | null; scope: { country: string | null; store: string | null } | null };

function toDemoUser(u: ServerUser): DemoUser {
  return {
    email: u.email,
    name: u.name,
    role: u.role,
    ...(u.retailRole ? { retailRole: u.retailRole as RetailRole } : {}),
    ...(u.scope ? { scope: { ...(u.scope.country ? { country: u.scope.country } : {}), ...(u.scope.store ? { store: u.scope.store } : {}) } } : {}),
  };
}

interface AuthCtx {
  user: DemoUser | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const Ctx = createContext<AuthCtx | null>(null);

export function DemoAuthProvider({ children }: { children: React.ReactNode }) {
  const convex = useConvex();
  const [session, setSession] = useState<Session | null>(readSession);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await convex.mutation(api.scioAuth.login, { email, password });
      if (!res) return false;
      const s = { token: res.token, user: toDemoUser(res.user) };
      setSession(s);
      writeSession(s);
      return true;
    },
    [convex]
  );

  const logout = useCallback(() => {
    setSession((s) => {
      if (s) void convex.mutation(api.scioAuth.logout, { token: s.token }).catch(() => {});
      return null;
    });
    writeSession(null);
  }, [convex]);

  // Drop the local session when Convex no longer recognises it (signed out elsewhere, database reseeded).
  const me = useQuery(api.scioAuth.me, session ? { token: session.token } : "skip");
  useEffect(() => {
    if (session && me === null) {
      setSession(null);
      writeSession(null);
    }
  }, [me, session]);

  const value = useMemo(() => ({ user: session?.user ?? null, token: session?.token ?? null, login, logout }), [session, login, logout]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useDemoAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useDemoAuth must be used inside DemoAuthProvider");
  return ctx;
}

export function RequireDemoAuth({ children }: { children: React.ReactNode }) {
  const { user } = useDemoAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/app/login" replace state={{ from: location.pathname }} />;
  return <>{children}</>;
}

/** Read an API response; turns empty or non-JSON platform errors into a clear message. */
export async function readApi<T = Record<string, unknown>>(res: Response): Promise<T & { error?: string }> {
  const text = await res.text();
  try {
    return JSON.parse(text) as T & { error?: string };
  } catch {
    const reason =
      res.status === 504 ? "The AI took too long to respond. Please try again." :
      res.status === 413 ? "The file is too large to upload. Please use a smaller file." :
      res.status === 401 ? "Your session has ended. Please sign in again." :
      res.status === 405 || res.status === 404 ? "The AI service endpoint is not reachable on this deployment." :
      `The server returned an unexpected response (${res.status}). Please try again.`;
    return { error: reason } as T & { error?: string };
  }
}

/** JSON headers plus the session token, for calls to the SCIO API routes. */
export function scioHeaders(): Record<string, string> {
  const s = readSession();
  return { "Content-Type": "application/json", ...(s ? { "x-scio-token": s.token } : {}) };
}
