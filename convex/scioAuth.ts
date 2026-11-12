import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { publicUser, randomHex, sessionAccount, sha256Hex } from "./scioLib";

// Sign-in for the SCIO demo app. Passwords are checked here against salted
// hashes in scioAccounts; the browser only ever holds an opaque session token.

export const login = mutation({
  args: { email: v.string(), password: v.string() },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();
    const account = await ctx.db
      .query("scioAccounts")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first(); // tolerate a duplicate left by overlapping reseeds
    if (!account) return null;
    const hash = await sha256Hex(`${account.salt}:${args.password}`);
    if (hash !== account.passwordHash) return null;
    const token = randomHex(24);
    await ctx.db.insert("scioSessions", { token, accountId: account._id, createdAt: Date.now() });
    return { token, user: publicUser(account) };
  },
});

export const logout = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const s = await ctx.db
      .query("scioSessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();
    if (s) await ctx.db.delete("scioSessions", s._id);
    return null;
  },
});

/** The signed-in user for a token (null once the session ends or the database is reseeded). */
export const me = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const a = await sessionAccount(ctx, args.token);
    return a ? publicUser(a) : null;
  },
});
