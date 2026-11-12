import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { internalMutation } from "./_generated/server";
import { requireAccount, sessionAccount } from "./scioLib";
import { can, type Permission, type RetailRole } from "../src/demo/retail/rbac";

// Retail OS action log. Every workflow step (transfer, PO, markdown, count,
// ticket, alert, threshold change…) is an event; the app derives live state
// from the seeded snapshot plus these events. Shared by all users in real time.

const PERMISSION: Record<string, Permission> = {
  transfer_create: "transfer.create",
  transfer_approve: "transfer.approve",
  transfer_cancel: "transfer.approve",
  transfer_receive: "transfer.receive",
  po_create: "po.create",
  po_approve: "po.approve",
  po_receive: "po.receive",
  markdown: "markdown.apply",
  count_start: "count.run",
  count_complete: "count.run",
  ticket_create: "ticket.create",
  ticket_assign: "ticket.assign",
  ticket_status: "ticket.resolve",
  alert_status: "alert.manage",
  task_status: "task.update",
  price_fix: "price.fix",
  thresholds: "settings.thresholds",
};

const MAX_EVENTS = 5000;

/** The action log for a snapshot; null when the session is not valid. */
export const listEvents = query({
  args: { token: v.string(), anchorDate: v.string() },
  handler: async (ctx, args) => {
    if (!(await sessionAccount(ctx, args.token))) return null;
    const rows = await ctx.db
      .query("rtEvents")
      .withIndex("by_anchorDate", (q) => q.eq("anchorDate", args.anchorDate))
      .take(MAX_EVENTS);
    return rows.map((r) => ({ ...r.payload, id: r.eventId, type: r.type, at: r.at, user: r.user, role: r.role }));
  },
});

export const appendEvent = mutation({
  args: {
    token: v.string(),
    anchorDate: v.string(),
    eventId: v.string(),
    type: v.string(),
    payload: v.record(v.string(), v.any()),
  },
  handler: async (ctx, args) => {
    const account = await requireAccount(ctx, args.token);
    const perm = PERMISSION[args.type];
    if (!perm) throw new Error(`Unknown action type: ${args.type}`);
    const role = (account.retailRole ?? "HQ") as RetailRole;
    if (!can(role, perm)) throw new Error(`Your role (${role}) cannot perform this action`);
    const existing = await ctx.db
      .query("rtEvents")
      .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
      .unique();
    if (existing) return null; // idempotent retry
    const { id: _i, type: _t, at: _a, user: _u, role: _r, ...payload } = args.payload;
    await ctx.db.insert("rtEvents", {
      anchorDate: args.anchorDate,
      eventId: args.eventId,
      type: args.type,
      at: new Date().toISOString(),
      user: account.name,
      role,
      accountId: account._id,
      payload,
    });
    return null;
  },
});

/** Clear the action log for the current snapshot (HQ only). */
export const resetEvents = mutation({
  args: { token: v.string(), anchorDate: v.string() },
  handler: async (ctx, args) => {
    const account = await requireAccount(ctx, args.token);
    if ((account.retailRole ?? "HQ") !== "HQ") throw new Error("Only HQ can reset the action log");
    await ctx.runMutation(internal.scioRetail.deleteEventsBatch, { anchorDate: args.anchorDate });
    return null;
  },
});

export const deleteEventsBatch = internalMutation({
  args: { anchorDate: v.string() },
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("rtEvents")
      .withIndex("by_anchorDate", (q) => q.eq("anchorDate", args.anchorDate))
      .take(1000);
    for (const r of rows) await ctx.db.delete("rtEvents", r._id);
    if (rows.length === 1000) await ctx.scheduler.runAfter(0, internal.scioRetail.deleteEventsBatch, args);
    return null;
  },
});
