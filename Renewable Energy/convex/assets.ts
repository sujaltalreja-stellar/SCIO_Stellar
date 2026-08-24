import { query } from "./_generated/server";
import { v } from "convex/values";

// List assets with pagination and filters
export const list = query({
  args: {
    plantId: v.optional(v.id("plants")),
    type: v.optional(v.string()),
    status: v.optional(v.string()),
    search: v.optional(v.string()),
    limit: v.optional(v.float64()),
  },
  handler: async (ctx, args) => {
    let assets = await ctx.db.query("assets").collect();

    if (args.plantId) {
      assets = assets.filter((a) => a.plantId === args.plantId);
    }
    if (args.type) {
      assets = assets.filter((a) => a.type === args.type);
    }
    if (args.status) {
      assets = assets.filter((a) => a.status === args.status);
    }
    if (args.search) {
      const q = args.search.toLowerCase();
      assets = assets.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.serialNumber.toLowerCase().includes(q) ||
          a.manufacturer.toLowerCase().includes(q)
      );
    }

    // Attach plant name to assets
    const assetsWithPlant = [];
    const limit = args.limit ?? 100;
    const paginated = assets.slice(0, limit);

    for (const a of paginated) {
      const plant = await ctx.db.get(a.plantId);
      assetsWithPlant.push({
        ...a,
        plantName: plant?.name ?? "Unknown Plant",
        plantType: plant?.type ?? "solar",
      });
    }

    return assetsWithPlant;
  },
});

// Get asset details along with its alarms and maintenance logs
export const getById = query({
  args: { assetId: v.id("assets") },
  handler: async (ctx, args) => {
    const asset = await ctx.db.get(args.assetId);
    if (!asset) return null;

    const plant = await ctx.db.get(asset.plantId);

    // Get active alarms for this asset
    const activeAlarms = await ctx.db
      .query("alarms")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();
    
    const assetAlarms = activeAlarms.filter(a => a.assetId === asset._id);

    // Get maintenance history
    const maintenanceLogs = await ctx.db
      .query("maintenance")
      .withIndex("by_asset", (q) => q.eq("assetId", asset._id))
      .collect();

    return {
      asset,
      plantName: plant?.name ?? "Unknown Plant",
      activeAlarms: assetAlarms,
      maintenanceLogs,
    };
  },
});
