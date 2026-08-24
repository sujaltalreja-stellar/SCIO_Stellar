import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// List alarms with optional filters
export const list = query({
  args: {
    plantId: v.optional(v.id("plants")),
    status: v.optional(v.union(v.literal("active"), v.literal("acknowledged"), v.literal("resolved"))),
    severity: v.optional(v.union(v.literal("critical"), v.literal("high"), v.literal("medium"), v.literal("low"))),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("alarms");

    // Standard filter collects
    let alarms = await query.collect();

    if (args.plantId) {
      alarms = alarms.filter(a => a.plantId === args.plantId);
    }
    if (args.status) {
      alarms = alarms.filter(a => a.status === args.status);
    }
    if (args.severity) {
      alarms = alarms.filter(a => a.severity === args.severity);
    }

    // Attach plant names & asset names
    const enrichedAlarms = [];
    for (const a of alarms) {
      const plant = await ctx.db.get(a.plantId);
      const asset = a.assetId ? await ctx.db.get(a.assetId) : null;
      
      enrichedAlarms.push({
        ...a,
        plantName: plant?.name ?? "Unknown Plant",
        assetName: asset?.name ?? "Substation / Grid Link",
      });
    }

    // Sort by timestamp descending
    return enrichedAlarms.sort((x, y) => y.timestamp - x.timestamp);
  },
});

// Acknowledge alarm
export const acknowledge = mutation({
  args: {
    alarmId: v.id("alarms"),
    engineerName: v.string(),
  },
  handler: async (ctx, args) => {
    const alarm = await ctx.db.get(args.alarmId);
    if (!alarm) throw new Error("Alarm not found");

    await ctx.db.patch(args.alarmId, {
      status: "acknowledged",
      assignedEngineer: args.engineerName,
    });

    const plant = await ctx.db.get(alarm.plantId);

    // Add audit log
    await ctx.db.insert("auditLogs", {
      plantId: alarm.plantId,
      action: "ALARM_ACKNOWLEDGE",
      details: `Alarm ${alarm.code} acknowledged by ${args.engineerName} for plant ${plant?.name ?? "Unknown"}.`,
      timestamp: Date.now(),
      operator: args.engineerName,
    });

    return { success: true };
  },
});

// Resolve alarm
export const resolve = mutation({
  args: {
    alarmId: v.id("alarms"),
    engineerName: v.string(),
  },
  handler: async (ctx, args) => {
    const alarm = await ctx.db.get(args.alarmId);
    if (!alarm) throw new Error("Alarm not found");

    await ctx.db.patch(args.alarmId, {
      status: "resolved",
      resolvedAt: Date.now(),
      assignedEngineer: args.engineerName,
    });

    const plant = await ctx.db.get(alarm.plantId);

    // Add audit log
    await ctx.db.insert("auditLogs", {
      plantId: alarm.plantId,
      action: "ALARM_RESOLVE",
      details: `Alarm ${alarm.code} marked as resolved by ${args.engineerName} for plant ${plant?.name ?? "Unknown"}.`,
      timestamp: Date.now(),
      operator: args.engineerName,
    });

    return { success: true };
  },
});

// Get unread notifications
export const getNotifications = query({
  args: { limit: v.optional(v.float64()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;
    return await ctx.db
      .query("notifications")
      .order("desc")
      .take(limit);
  },
});

// Mark notification read
export const markNotificationRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.notificationId, { read: true });
    return { success: true };
  },
});

// Mark all read
export const markAllNotificationsRead = mutation({
  args: {},
  handler: async (ctx) => {
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_read", q => q.eq("read", false))
      .collect();
    
    for (const n of unread) {
      await ctx.db.patch(n._id, { read: true });
    }

    return { success: true };
  },
});
