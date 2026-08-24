import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// List maintenance tasks
export const list = query({
  args: {
    plantId: v.optional(v.id("plants")),
    status: v.optional(v.union(v.literal("scheduled"), v.literal("in_progress"), v.literal("completed"))),
  },
  handler: async (ctx, args) => {
    let tasks = await ctx.db.query("maintenance").collect();

    if (args.plantId) {
      tasks = tasks.filter(t => t.plantId === args.plantId);
    }
    if (args.status) {
      tasks = tasks.filter(t => t.status === args.status);
    }

    const enriched = [];
    for (const t of tasks) {
      const plant = await ctx.db.get(t.plantId);
      const asset = await ctx.db.get(t.assetId);

      enriched.push({
        ...t,
        plantName: plant?.name ?? "Unknown Plant",
        assetName: asset?.name ?? "Unknown Asset",
        assetType: asset?.type ?? "panel",
      });
    }

    return enriched.sort((x, y) => new Date(y.scheduledDate).getTime() - new Date(x.scheduledDate).getTime());
  },
});

// Create new maintenance task
export const create = mutation({
  args: {
    plantId: v.id("plants"),
    assetId: v.id("assets"),
    type: v.union(v.literal("preventive"), v.literal("corrective"), v.literal("predictive")),
    description: v.string(),
    engineer: v.string(),
    scheduledDate: v.string(),
  },
  handler: async (ctx, args) => {
    const taskId = await ctx.db.insert("maintenance", {
      plantId: args.plantId,
      assetId: args.assetId,
      type: args.type,
      description: args.description,
      status: "scheduled",
      scheduledDate: args.scheduledDate,
      engineer: args.engineer,
    });

    const plant = await ctx.db.get(args.plantId);

    // Notification
    await ctx.db.insert("notifications", {
      type: "maintenance",
      title: "New Maintenance Scheduled",
      message: `Task scheduled for plant: ${plant?.name ?? "Unknown"}. Specialist: ${args.engineer}`,
      severity: "low",
      timestamp: Date.now(),
      read: false,
    });

    // Audit Log
    await ctx.db.insert("auditLogs", {
      plantId: args.plantId,
      action: "MAINTENANCE_SCHEDULE",
      details: `Scheduled ${args.type} maintenance: "${args.description}"`,
      timestamp: Date.now(),
      operator: "Operations Scheduler",
    });

    return taskId;
  },
});

// Complete maintenance task
export const complete = mutation({
  args: {
    taskId: v.id("maintenance"),
    engineer: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("Maintenance task not found");

    await ctx.db.patch(args.taskId, {
      status: "completed",
      completedDate: new Date().toISOString().split("T")[0],
    });

    // If correction task was performed, restore asset health score
    const asset = await ctx.db.get(task.assetId);
    if (asset) {
      await ctx.db.patch(task.assetId, {
        status: "online",
        healthScore: Math.min(100, asset.healthScore + 20), // boost health
      });
    }

    // Audit Log
    await ctx.db.insert("auditLogs", {
      plantId: task.plantId,
      action: "MAINTENANCE_COMPLETE",
      details: `Completed maintenance task on asset ${asset?.name ?? "Unknown"}. Specialist: ${args.engineer}. ${args.notes ? "Notes: " + args.notes : ""}`,
      timestamp: Date.now(),
      operator: args.engineer,
    });

    return { success: true };
  },
});
