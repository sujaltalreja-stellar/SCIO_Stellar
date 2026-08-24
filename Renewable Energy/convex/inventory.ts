import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// List warehouses
export const listWarehouses = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("warehouses").collect();
  },
});

// List inventory items with optional filters
export const listInventory = query({
  args: {
    warehouseId: v.optional(v.id("warehouses")),
    category: v.optional(v.union(v.literal("mechanical"), v.literal("electrical"), v.literal("consumables"))),
  },
  handler: async (ctx, args) => {
    let list = await ctx.db.query("inventoryItems").collect();

    if (args.warehouseId) {
      list = list.filter((i) => i.warehouseId === args.warehouseId);
    }
    if (args.category) {
      list = list.filter((i) => i.category === args.category);
    }

    const enriched = [];
    for (const item of list) {
      const wh = await ctx.db.get(item.warehouseId);
      enriched.push({
        ...item,
        warehouseName: wh?.name ?? "Unknown Warehouse",
      });
    }

    return enriched;
  },
});

// Adjust stock quantity
export const adjustStock = mutation({
  args: {
    itemId: v.id("inventoryItems"),
    adjustment: v.float64(),
    reason: v.string(),
    operator: v.string(),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.itemId);
    if (!item) throw new Error("Inventory item not found");

    const newQty = Math.max(0, item.quantity + args.adjustment);
    await ctx.db.patch(args.itemId, {
      quantity: newQty,
    });

    // Log movement in audit logs
    await ctx.db.insert("auditLogs", {
      action: "STOCK_ADJUST",
      details: `Stock adjustment for ${item.partName} (${item.partCode}): ${args.adjustment > 0 ? "+" : ""}${args.adjustment} units. Reason: ${args.reason}`,
      timestamp: Date.now(),
      operator: args.operator,
    });

    return { success: true };
  },
});
