import { query } from "./_generated/server";
import { v } from "convex/values";

// Get list of audit logs
export const list = query({
  args: { limit: v.optional(v.float64()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    const logs = await ctx.db
      .query("auditLogs")
      .order("desc")
      .take(limit);

    const enriched = [];
    for (const log of logs) {
      let plantName = "System Core";
      if (log.plantId) {
        const plant = await ctx.db.get(log.plantId);
        if (plant) plantName = plant.name;
      }
      enriched.push({
        ...log,
        plantName,
      });
    }

    return enriched;
  },
});
