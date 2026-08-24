import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// List cost centers
export const listCostCenters = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("costCenters").collect();
  },
});

// Accounts Payable: list invoices (drafted from POs)
export const listInvoices = query({
  args: {
    status: v.optional(v.union(v.literal("unpaid"), v.literal("paid"))),
  },
  handler: async (ctx, args) => {
    const pos = await ctx.db.query("purchaseOrders").collect();
    
    const invoices = [];
    for (const po of pos) {
      if (po.status === "delivered" || po.status === "invoiced" || po.status === "closed") {
        const vendor = await ctx.db.get(po.vendorId);
        
        // Mock invoice status: PO status closed = paid, otherwise unpaid
        const status = po.status === "closed" ? "paid" : "unpaid";
        
        if (args.status && status !== args.status) continue;

        invoices.push({
          _id: po._id, // match invoice ID to PO ID
          invoiceNumber: `INV-${po.poNumber.substring(3)}`,
          poNumber: po.poNumber,
          vendorName: vendor?.name ?? "Unknown Vendor",
          amount: po.totalCost,
          dueDate: new Date(Date.now() + 15 * 24 * 3600 * 1000).toISOString().split("T")[0],
          status,
          billingDetails: po.items.map(i => `${i.partName} (x${i.quantity})`).join(", "),
        });
      }
    }

    return invoices;
  },
});

// Pay invoice (transitions PO to closed, adds cost to cost center spent budget)
export const payInvoice = mutation({
  args: {
    poId: v.id("purchaseOrders"),
    operator: v.string(),
  },
  handler: async (ctx, args) => {
    const po = await ctx.db.get(args.poId);
    if (!po) throw new Error("Purchase Order/Invoice not found");

    await ctx.db.patch(args.poId, { status: "closed" });

    // Deduct cost from matching cost center
    const costCenters = await ctx.db.query("costCenters").collect();
    let code = "CC-CORP-00"; // default corp
    const pr = po.prId ? await ctx.db.get(po.prId) : null;

    if (pr) {
      const plant = await ctx.db.get(pr.plantId);
      if (plant?.type === "solar") code = "CC-SOL-01";
      else if (plant?.type === "wind") code = "CC-WND-02";
      else if (plant?.type === "bess") code = "CC-BES-03";
    }

    const cc = costCenters.find(c => c.code === code);
    if (cc) {
      await ctx.db.patch(cc._id, {
        spentBudget: cc.spentBudget + po.totalCost,
      });
    }

    // Audit log
    await ctx.db.insert("auditLogs", {
      action: "INVOICE_PAYMENT",
      details: `Paid Invoice INV-${po.poNumber.substring(3)} for $${po.totalCost.toFixed(2)}. Capital debited from Cost Center ${code}.`,
      timestamp: Date.now(),
      operator: args.operator,
    });

    return { success: true };
  },
});
