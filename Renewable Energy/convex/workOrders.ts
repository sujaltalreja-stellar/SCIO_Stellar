import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// List all work orders with optional filters
export const list = query({
  args: {
    plantId: v.optional(v.id("plants")),
    status: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("open"),
        v.literal("assigned"),
        v.literal("in_progress"),
        v.literal("waiting_parts"),
        v.literal("under_review"),
        v.literal("completed"),
        v.literal("closed")
      )
    ),
    priority: v.optional(v.union(v.literal("critical"), v.literal("high"), v.literal("medium"), v.literal("low"))),
  },
  handler: async (ctx, args) => {
    let list = await ctx.db.query("workOrders").collect();

    if (args.plantId) {
      list = list.filter((w) => w.plantId === args.plantId);
    }
    if (args.status) {
      list = list.filter((w) => w.status === args.status);
    }
    if (args.priority) {
      list = list.filter((w) => w.priority === args.priority);
    }

    const enriched = [];
    for (const item of list) {
      const plant = await ctx.db.get(item.plantId);
      const asset = await ctx.db.get(item.assetId);

      enriched.push({
        ...item,
        plantName: plant?.name ?? "Unknown Plant",
        plantType: plant?.type ?? "solar",
        assetName: asset?.name ?? "Unknown Asset",
        assetType: asset?.type ?? "panel",
      });
    }

    // Sort by scheduledDate descending
    return enriched.sort(
      (a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime()
    );
  },
});

// List technicians
export const getTechnicians = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("technicians").collect();
  },
});

// Create work order
export const create = mutation({
  args: {
    plantId: v.id("plants"),
    assetId: v.id("assets"),
    type: v.union(v.literal("preventive"), v.literal("corrective"), v.literal("predictive"), v.literal("emergency")),
    title: v.string(),
    description: v.string(),
    priority: v.union(v.literal("critical"), v.literal("high"), v.literal("medium"), v.literal("low")),
    assignedTechnician: v.optional(v.string()),
    scheduledDate: v.string(),
    estimatedHours: v.float64(),
  },
  handler: async (ctx, args) => {
    const status = args.assignedTechnician ? "assigned" : "open";
    
    const woId = await ctx.db.insert("workOrders", {
      plantId: args.plantId,
      assetId: args.assetId,
      type: args.type,
      title: args.title,
      description: args.description,
      priority: args.priority,
      status,
      assignedTechnician: args.assignedTechnician,
      scheduledDate: args.scheduledDate,
      estimatedHours: args.estimatedHours,
      downtimeHours: 0,
      materialsCost: 0,
      laborCost: 0,
    });

    const plant = await ctx.db.get(args.plantId);

    // Notify
    await ctx.db.insert("notifications", {
      type: "maintenance",
      title: `NEW WORK ORDER: ${args.title}`,
      message: `Work order dispatched for plant ${plant?.name ?? "Unknown"}. Priority: ${args.priority.toUpperCase()}`,
      severity: args.priority === "critical" ? "critical" : args.priority === "high" ? "high" : "low",
      timestamp: Date.now(),
      read: false,
    });

    // Audit Log
    await ctx.db.insert("auditLogs", {
      plantId: args.plantId,
      action: "WO_CREATE",
      details: `Work order "${args.title}" created with status ${status}. Priority: ${args.priority}`,
      timestamp: Date.now(),
      operator: "Operations Center Manager",
    });

    // If technician assigned, increment their workload
    if (args.assignedTechnician) {
      const tech = await ctx.db
        .query("technicians")
        .filter((q) => q.eq(q.field("name"), args.assignedTechnician))
        .first();
      
      if (tech) {
        await ctx.db.patch(tech._id, {
          workload: tech.workload + 1,
          status: "dispatched",
        });
      }
    }

    return woId;
  },
});

// Update Work Order Status (Transitions)
export const updateStatus = mutation({
  args: {
    woId: v.id("workOrders"),
    status: v.union(
      v.literal("draft"),
      v.literal("open"),
      v.literal("assigned"),
      v.literal("in_progress"),
      v.literal("waiting_parts"),
      v.literal("under_review"),
      v.literal("completed"),
      v.literal("closed")
    ),
    assignedTechnician: v.optional(v.string()),
    actualHours: v.optional(v.float64()),
    laborCost: v.optional(v.float64()),
    materialsCost: v.optional(v.float64()),
    downtimeHours: v.optional(v.float64()),
    spareParts: v.optional(
      v.array(
        v.object({
          name: v.string(),
          quantity: v.float64(),
          cost: v.float64(),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const wo = await ctx.db.get(args.woId);
    if (!wo) throw new Error("Work order not found");

    const oldStatus = wo.status;
    const oldTech = wo.assignedTechnician;

    const patches: any = {
      status: args.status,
    };

    if (args.assignedTechnician !== undefined) {
      patches.assignedTechnician = args.assignedTechnician;
    }
    if (args.actualHours !== undefined) {
      patches.actualHours = args.actualHours;
    }
    if (args.laborCost !== undefined) {
      patches.laborCost = args.laborCost;
    }
    if (args.materialsCost !== undefined) {
      patches.materialsCost = args.materialsCost;
    }
    if (args.downtimeHours !== undefined) {
      patches.downtimeHours = args.downtimeHours;
    }
    if (args.spareParts !== undefined) {
      patches.spareParts = args.spareParts;
    }

    if (args.status === "completed" || args.status === "closed") {
      patches.completedDate = new Date().toISOString().split("T")[0];
    }

    await ctx.db.patch(args.woId, patches);

    const plant = await ctx.db.get(wo.plantId);
    const asset = await ctx.db.get(wo.assetId);

    // Audit Log
    await ctx.db.insert("auditLogs", {
      plantId: wo.plantId,
      action: "WO_STATUS_CHANGE",
      details: `Work order "${wo.title}" status changed from ${oldStatus} to ${args.status}. Assigned Tech: ${args.assignedTechnician ?? wo.assignedTechnician ?? "None"}`,
      timestamp: Date.now(),
      operator: args.assignedTechnician ?? "Operations Dispatcher",
    });

    // Workload balancer logic on status changes
    if (oldTech && oldTech !== args.assignedTechnician) {
      // decrement old tech
      const t = await ctx.db.query("technicians").filter(q => q.eq(q.field("name"), oldTech)).first();
      if (t) {
        await ctx.db.patch(t._id, { workload: Math.max(0, t.workload - 1) });
      }
    }

    if (args.assignedTechnician && oldTech !== args.assignedTechnician) {
      // increment new tech
      const t = await ctx.db.query("technicians").filter(q => q.eq(q.field("name"), args.assignedTechnician)).first();
      if (t) {
        await ctx.db.patch(t._id, { workload: t.workload + 1, status: "dispatched" });
      }
    }

    if ((args.status === "completed" || args.status === "closed") && wo.assignedTechnician) {
      // decrement tech workload when done
      const t = await ctx.db.query("technicians").filter(q => q.eq(q.field("name"), wo.assignedTechnician)).first();
      if (t) {
        const nextWorkload = Math.max(0, t.workload - 1);
        await ctx.db.patch(t._id, {
          workload: nextWorkload,
          status: nextWorkload === 0 ? "active" : "dispatched",
        });
      }

      // If work order is completed, fix/improve the asset's health score and restore to online
      if (asset) {
        const newHealth = Math.min(100, asset.healthScore + 25);
        await ctx.db.patch(wo.assetId, {
          status: "online",
          healthScore: parseFloat(newHealth.toFixed(1)),
        });

        // Also check if there are any active alarms for this asset and auto-resolve them
        const activeAlarms = await ctx.db
          .query("alarms")
          .filter(q => q.and(q.eq(q.field("assetId"), wo.assetId), q.eq(q.field("status"), "active")))
          .collect();
        
        for (const alarm of activeAlarms) {
          await ctx.db.patch(alarm._id, {
            status: "resolved",
            resolvedAt: Date.now(),
            assignedEngineer: wo.assignedTechnician,
          });
        }
      }
    }

    return { success: true };
  },
});
