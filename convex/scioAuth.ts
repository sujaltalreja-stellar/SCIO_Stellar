import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { publicUser, randomHex, sessionAccount, sha256Hex } from "./scioLib";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Self-service sign-up. New accounts are always read-only Viewers: the role is
// set here, never taken from the client. Signs the new user straight in.
export const signup = mutation({
  args: { name: v.string(), email: v.string(), password: v.string() },
  handler: async (ctx, args) => {
    const name = args.name.trim().replace(/\s+/g, " ");
    const email = args.email.trim().toLowerCase();
    if (name.length < 2 || name.length > 80) throw new ConvexError("Please enter your full name.");
    if (email.length > 254 || !EMAIL_RE.test(email)) throw new ConvexError("Please enter a valid email address.");
    if (args.password.length < 8 || args.password.length > 128) throw new ConvexError("Password must be 8 to 128 characters.");

    const existing = await ctx.db
      .query("scioAccounts")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();
    if (existing) throw new ConvexError("An account with this email already exists. Please sign in.");

    const salt = randomHex(16);
    const passwordHash = await sha256Hex(`${salt}:${args.password}`);
    const accountId = await ctx.db.insert("scioAccounts", {
      email,
      name,
      role: "Viewer",
      retailRole: "Viewer",
      salt,
      passwordHash,
      order: Date.now(), // after the seeded personas
    });
    const account = await ctx.db.get("scioAccounts", accountId);
    if (!account) throw new Error("Account was not created");
    const token = randomHex(24);
    await ctx.db.insert("scioSessions", { token, accountId, createdAt: Date.now() });
    return { token, user: publicUser(account) };
  },
});

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
