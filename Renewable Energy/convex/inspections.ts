import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// List inspection records with optional filters
export const list = query({
  args: {
    plantId: v.optional(v.id("plants")),
    status: v.optional(v.union(v.literal("pending"), v.literal("in_progress"), v.literal("completed"))),
  },
  handler: async (ctx, args) => {
    let list = await ctx.db.query("inspections").collect();

    if (args.plantId) {
      list = list.filter((i) => i.plantId === args.plantId);
    }
    if (args.status) {
      list = list.filter((i) => i.status === args.status);
    }

    const enriched = [];
    for (const item of list) {
      const plant = await ctx.db.get(item.plantId);
      const asset = await ctx.db.get(item.assetId);
      const temp = item.templateId ? await ctx.db.get(item.templateId) : null;

      enriched.push({
        ...item,
        plantName: plant?.name ?? "Unknown Plant",
        plantType: plant?.type ?? "solar",
        assetName: asset?.name ?? "Unknown Asset",
        templateName: temp?.name ?? "Custom Checklist",
      });
    }

    // Sort by scheduled date descending
    return enriched.sort(
      (a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime()
    );
  },
});

// List checklist templates
export const listTemplates = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("inspectionTemplates").collect();
  },
});

// Submit a completed checklist mutation
export const submit = mutation({
  args: {
    inspectionId: v.optional(v.id("inspections")), // if updating an existing scheduled checklist
    plantId: v.id("plants"),
    assetId: v.id("assets"),
    templateId: v.optional(v.id("inspectionTemplates")),
    inspector: v.string(),
    checklist: v.array(
      v.object({
        item: v.string(),
        checked: v.boolean(),
        notes: v.optional(v.string()),
      })
    ),
    findings: v.string(),
    recommendations: v.string(),
    signature: v.string(), // base64 draw
  },
  handler: async (ctx, args) => {
    const nowStr = new Date().toISOString().split("T")[0];

    let resultId;
    if (args.inspectionId) {
      // Update existing
      await ctx.db.patch(args.inspectionId, {
        status: "completed",
        checklist: args.checklist,
        inspector: args.inspector,
        completedDate: nowStr,
        findings: args.findings,
        recommendations: args.recommendations,
        signature: args.signature,
      });
      resultId = args.inspectionId;
    } else {
      // Insert new
      resultId = await ctx.db.insert("inspections", {
        plantId: args.plantId,
        assetId: args.assetId,
        templateId: args.templateId,
        inspector: args.inspector,
        checklist: args.checklist,
        status: "completed",
        scheduledDate: nowStr,
        completedDate: nowStr,
        findings: args.findings,
        recommendations: args.recommendations,
        signature: args.signature,
      });
    }

    const plant = await ctx.db.get(args.plantId);
    const asset = await ctx.db.get(args.assetId);

    // Write Audit Log
    await ctx.db.insert("auditLogs", {
      plantId: args.plantId,
      action: "INSPECTION_SUBMIT",
      details: `Field inspection checklist completed for asset ${asset?.name ?? "Unknown"} by inspector ${args.inspector}. Findings: "${args.findings}"`,
      timestamp: Date.now(),
      operator: args.inspector,
    });

    // If there were critical failures (e.g. any item unchecked with bad notes), downgrade asset health slightly
    const failItemsCount = args.checklist.filter(c => !c.checked).length;
    if (asset && failItemsCount > 0) {
      const penalty = failItemsCount * 12;
      const newHealth = Math.max(20, asset.healthScore - penalty);
      await ctx.db.patch(args.assetId, {
        healthScore: parseFloat(newHealth.toFixed(1)),
        status: "maintenance",
      });

      // Auto-trigger a high alarm if there are unchecked items in a completed report
      await ctx.db.insert("alarms", {
        plantId: args.plantId,
        assetId: args.assetId,
        severity: "high",
        status: "active",
        code: "INSP_FAIL_ALERT",
        message: `Asset failed ${failItemsCount} points in checklist inspection. Findings: ${args.findings}`,
        timestamp: Date.now(),
      });
    }

    return resultId;
  },
});
