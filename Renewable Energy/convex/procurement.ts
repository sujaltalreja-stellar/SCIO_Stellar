import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// List all vendors
export const listVendors = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("vendors").collect();
  },
});

// List Purchase Requisitions
export const listRequisitions = query({
  args: {
    status: v.optional(v.union(v.literal("draft"), v.literal("pending_approval"), v.literal("approved"), v.literal("ordered"), v.literal("rejected"))),
  },
  handler: async (ctx, args) => {
    let list = await ctx.db.query("purchaseRequisitions").collect();
    if (args.status) {
      list = list.filter((r) => r.status === args.status);
    }
    
    const enriched = [];
    for (const r of list) {
      const plant = await ctx.db.get(r.plantId);
      enriched.push({
        ...r,
        plantName: plant?.name ?? "Unknown Plant",
      });
    }

    return enriched.sort((a, b) => new Date(b.requiredDate).getTime() - new Date(a.requiredDate).getTime());
  },
});

// Approve Requisition
export const approveRequisition = mutation({
  args: {
    prId: v.id("purchaseRequisitions"),
    approved: v.boolean(),
    approver: v.string(),
  },
  handler: async (ctx, args) => {
    const pr = await ctx.db.get(args.prId);
    if (!pr) throw new Error("Purchase Requisition not found");

    const status = args.approved ? "approved" : "rejected";
    await ctx.db.patch(args.prId, { status });

    // Audit log
    await ctx.db.insert("auditLogs", {
      plantId: pr.plantId,
      action: "PR_APPROVAL",
      details: `Purchase Requisition "${pr.title}" approved: ${args.approved}. Approver: ${args.approver}`,
      timestamp: Date.now(),
      operator: args.approver,
    });

    // If approved, automatically create a corresponding Purchase Order (PO) to the highest-rated matching vendor
    if (args.approved) {
      // Find a vendor matching category
      const vendors = await ctx.db.query("vendors").collect();
      const firstItem = pr.items[0];
      let category: "panels" | "turbines" | "batteries" | "logistics" | "services" = "services";
      
      if (firstItem?.partCode.startsWith("SO")) category = "panels";
      else if (firstItem?.partCode.startsWith("WN")) category = "turbines";
      else if (firstItem?.partCode.startsWith("BS")) category = "batteries";

      const matchedVendors = vendors.filter(v => v.category === category);
      const selectedVendor = matchedVendors.sort((a, b) => b.qualityRating - a.qualityRating)[0] ?? vendors[0];

      if (selectedVendor) {
        const poNumber = `PO-2026-${Math.floor(1000 + Math.random() * 9000)}`;
        await ctx.db.insert("purchaseOrders", {
          prId: args.prId,
          vendorId: selectedVendor._id,
          poNumber,
          status: "sent",
          totalCost: pr.estimatedCost,
          items: pr.items,
          scheduledDeliveryDate: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString().split("T")[0],
        });

        await ctx.db.patch(args.prId, { status: "ordered" });
      }
    }

    return { success: true };
  },
});

// List Purchase Orders
export const listPurchaseOrders = query({
  args: {
    status: v.optional(v.union(v.literal("draft"), v.literal("sent"), v.literal("delivered"), v.literal("invoiced"), v.literal("closed"))),
  },
  handler: async (ctx, args) => {
    let list = await ctx.db.query("purchaseOrders").collect();
    if (args.status) {
      list = list.filter((po) => po.status === args.status);
    }

    const enriched = [];
    for (const po of list) {
      const vendor = await ctx.db.get(po.vendorId);
      enriched.push({
        ...po,
        vendorName: vendor?.name ?? "Unknown Supplier",
        vendorCategory: vendor?.category ?? "services",
      });
    }

    return enriched;
  },
});

// Receive Goods on PO (Triggers inventory increment and resolves work order locks)
export const receiveGoods = mutation({
  args: {
    poId: v.id("purchaseOrders"),
    warehouseId: v.id("warehouses"),
    receiver: v.string(),
  },
  handler: async (ctx, args) => {
    const po = await ctx.db.get(args.poId);
    if (!po) throw new Error("Purchase Order not found");

    await ctx.db.patch(args.poId, {
      status: "delivered",
      deliveredDate: new Date().toISOString().split("T")[0],
    });

    // Increment inventory items for each item in PO
    for (const item of po.items) {
      const invItem = await ctx.db
        .query("inventoryItems")
        .filter((q) => q.and(q.eq(q.field("warehouseId"), args.warehouseId), q.eq(q.field("partCode"), item.partCode)))
        .first();

      if (invItem) {
        await ctx.db.patch(invItem._id, {
          quantity: invItem.quantity + item.quantity,
        });
      } else {
        // Create new item in warehouse
        let category: "mechanical" | "electrical" | "consumables" = "consumables";
        if (item.partCode.startsWith("WN")) category = "mechanical";
        else if (item.partCode.startsWith("SO") || item.partCode.startsWith("BS")) category = "electrical";

        await ctx.db.insert("inventoryItems", {
          warehouseId: args.warehouseId,
          partName: item.partName,
          partCode: item.partCode,
          category,
          quantity: item.quantity,
          reserved: 0,
          minStock: 2,
          maxStock: 20,
          unitCost: item.cost,
          binLocation: `${String.fromCharCode(65 + Math.floor(Math.random()*6))}-${Math.floor(1+Math.random()*15)}`,
        });
      }
    }

    // Write Audit Log
    await ctx.db.insert("auditLogs", {
      action: "GOODS_RECEIPT",
      details: `Goods Receipt Note (GRN) created for ${po.poNumber}. Stock incremented in selected warehouse. Receiver: ${args.receiver}`,
      timestamp: Date.now(),
      operator: args.receiver,
    });

    // Check if there was a work order connected to this PO (via the Requisition)
    if (po.prId) {
      const pr = await ctx.db.get(po.prId);
      if (pr?.workOrderId) {
        const wo = await ctx.db.get(pr.workOrderId);
        if (wo && wo.status === "waiting_parts") {
          // Unlock work order status
          await ctx.db.patch(pr.workOrderId, {
            status: "assigned",
          });

          await ctx.db.insert("auditLogs", {
            plantId: wo.plantId,
            action: "WO_UNLOCK",
            details: `Work order "${wo.title}" unlocked (waiting_parts -> assigned) as needed spares were received in warehouse.`,
            timestamp: Date.now(),
            operator: "Auto ERP Sync Link",
          });
        }
      }
    }

    return { success: true };
  },
});
