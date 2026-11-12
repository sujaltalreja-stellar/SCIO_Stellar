import type { QueryCtx } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";

// Shared helpers for the SCIO demo functions.

export async function sha256Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
}

export function randomHex(bytes: number): string {
  const a = new Uint8Array(bytes);
  crypto.getRandomValues(a);
  return Array.from(a, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function publicUser(a: Doc<"scioAccounts">) {
  return {
    email: a.email,
    name: a.name,
    role: a.role,
    retailRole: a.retailRole ?? null,
    scope: a.scopeCountry || a.scopeStore ? { country: a.scopeCountry ?? null, store: a.scopeStore ?? null } : null,
  };
}

/** Resolve a session token to its account, or null. Never trust a user id from the client. */
export async function sessionAccount(ctx: QueryCtx, token: string): Promise<Doc<"scioAccounts"> | null> {
  if (!token) return null;
  const s = await ctx.db
    .query("scioSessions")
    .withIndex("by_token", (q) => q.eq("token", token))
    .unique();
  if (!s) return null;
  return await ctx.db.get("scioAccounts", s.accountId);
}

export async function requireAccount(ctx: QueryCtx, token: string): Promise<Doc<"scioAccounts">> {
  const a = await sessionAccount(ctx, token);
  if (!a) throw new Error("Not signed in");
  return a;
}
