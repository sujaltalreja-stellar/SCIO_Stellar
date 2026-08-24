import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// List Integration Sync Jobs
export const listJobs = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("integrationJobs").collect();
  },
});

// List Integration Sync Logs
export const listLogs = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("integrationLogs")
      .order("desc")
      .take(args.limit ?? 50);
  },
});

// Trigger Mock Sync Job
export const triggerSync = mutation({
  args: {
    system: v.union(v.literal("sap"), v.literal("oracle"), v.literal("dynamics"), v.literal("odoo")),
    jobType: v.union(v.literal("sync_inventory"), v.literal("sync_invoices"), v.literal("sync_pos")),
    operator: v.string(),
  },
  handler: async (ctx, args) => {
    const job = await ctx.db
      .query("integrationJobs")
      .filter((q) => q.and(q.eq(q.field("system"), args.system), q.eq(q.field("jobType"), args.jobType)))
      .first();

    const timestamp = Date.now();
    const count = Math.floor(5 + Math.random() * 25);

    if (job) {
      await ctx.db.patch(job._id, {
        status: "success",
        lastRun: timestamp,
        recordsSynced: count,
      });

      await ctx.db.insert("integrationLogs", {
        jobId: job._id,
        timestamp,
        level: "info",
        message: `Successfully synchronized ${count} ledger records with external ${args.system.toUpperCase()} ERP instance.`,
        payload: JSON.stringify({ syncedRecords: count, status: "200_OK" }),
      });
    } else {
      const jobId = await ctx.db.insert("integrationJobs", {
        system: args.system,
        jobType: args.jobType,
        status: "success",
        lastRun: timestamp,
        recordsSynced: count,
      });

      await ctx.db.insert("integrationLogs", {
        jobId,
        timestamp,
        level: "info",
        message: `Initialized connector and successfully synchronized ${count} ledger records with external ${args.system.toUpperCase()} ERP instance.`,
        payload: JSON.stringify({ syncedRecords: count, status: "200_OK" }),
      });
    }

    // Write Audit Log
    await ctx.db.insert("auditLogs", {
      action: "ERP_SYNC",
      details: `Manual ERP Sync triggered for ${args.system.toUpperCase()} (${args.jobType}). Synced ${count} records.`,
      timestamp,
      operator: args.operator,
    });

    return { success: true, count };
  },
});
