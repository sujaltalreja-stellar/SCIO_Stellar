import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const createWorkOrder = mutation({
  args: {
    industry: v.string(),
    assetId: v.string(),
    title: v.string(),
    priority: v.string(),
    status: v.string(),
    assignedTeam: v.string(),
    assignedPerson: v.string(),
    createdDate: v.string(),
    dueDate: v.string(),
    estimatedDuration: v.string(),
    requiredParts: v.array(v.object({
      partId: v.string(),
      quantity: v.number()
    })),
    notes: v.string(),
  },
  handler: async (ctx, args) => {
    // Reserve parts if stock is available
    for (const partReq of args.requiredParts) {
      const existingPart = await ctx.db
        .query("inventoryItems")
        .filter((q) => q.eq(q.field("partId"), partReq.partId))
        .first();
      if (existingPart) {
        await ctx.db.patch(existingPart._id, {
          reserved: existingPart.reserved + partReq.quantity,
        });
      }
    }

    const id = await ctx.db.insert("workOrders", {
      organizationId: "org-1",
      ...args
    });
    return id;
  },
});

export const updateWorkOrderStatus = mutation({
  args: {
    id: v.id("workOrders"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
    
    // If completed or verified, deduct reserved inventory items
    if (args.status === "Completed" || args.status === "Verified") {
      const wo = await ctx.db.get(args.id);
      if (wo && wo.requiredParts) {
        for (const partReq of wo.requiredParts) {
          const item = await ctx.db
            .query("inventoryItems")
            .filter((q) => q.eq(q.field("partId"), partReq.partId))
            .first();
          if (item) {
            const newReserved = Math.max(0, item.reserved - partReq.quantity);
            const newStock = Math.max(0, item.stock - partReq.quantity);
            await ctx.db.patch(item._id, {
              reserved: newReserved,
              stock: newStock
            });
          }
        }
      }
    }
  },
});

export const adjustStock = mutation({
  args: {
    id: v.id("inventoryItems"),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id);
    if (item) {
      await ctx.db.patch(args.id, {
        stock: Math.max(0, item.stock + args.amount)
      });
    }
  },
});

// Industry-Wise Chatbot Mutations
export const saveChatMessage = mutation({
  args: {
    industry: v.string(),
    sessionId: v.optional(v.string()),
    sender: v.string(),
    text: v.string(),
    timestamp: v.string(),
    provider: v.optional(v.string()),
    suggestedAction: v.optional(
      v.object({
        type: v.string(),
        label: v.string(),
        payload: v.optional(v.record(v.string(), v.string())),
      })
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("chatHistory", args);
  },
});

export const clearChatHistory = mutation({
  args: { industry: v.string() },
  handler: async (ctx, args) => {
    const records = await ctx.db
      .query("chatHistory")
      .withIndex("by_industry", (q) => q.eq("industry", args.industry))
      .collect();

    for (const record of records) {
      await ctx.db.delete(record._id);
    }
  },
});
