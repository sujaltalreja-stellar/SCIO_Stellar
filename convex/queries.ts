import { query } from "./_generated/server";
import { v } from "convex/values";

// Assets & Work Orders
export const getAssets = query({
  args: { industry: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("assets")
      .filter((q) => q.eq(q.field("industry"), args.industry))
      .collect();
  },
});

export const getWorkOrders = query({
  args: { industry: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("workOrders")
      .filter((q) => q.eq(q.field("industry"), args.industry))
      .collect();
  },
});

export const getInventoryItems = query({
  args: { industry: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("inventoryItems")
      .filter((q) => q.eq(q.field("industry"), args.industry))
      .collect();
  },
});

export const getSuppliers = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("suppliers").collect();
  },
});

export const getComplianceRecords = query({
  args: { industry: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("complianceRecords")
      .filter((q) => q.eq(q.field("industry"), args.industry))
      .collect();
  },
});

export const getAIInsights = query({
  args: { industry: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("aiInsights")
      .filter((q) => q.eq(q.field("industry"), args.industry))
      .collect();
  },
});

// Energy & Power Plants
export const getPlants = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("plants").collect();
  },
});

export const getEnergyMetrics = query({
  args: { plantId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.plantId) {
      return await ctx.db
        .query("energyMetrics")
        .filter((q) => q.eq(q.field("plantId"), args.plantId))
        .collect();
    }
    return await ctx.db.query("energyMetrics").collect();
  },
});

export const getAlarms = query({
  args: { status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.status) {
      return await ctx.db
        .query("alarms")
        .filter((q) => q.eq(q.field("status"), args.status))
        .collect();
    }
    return await ctx.db.query("alarms").collect();
  },
});

// Maritime Fleet & Safety
export const getMaritimeSafety = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("maritimeSafety").collect();
  },
});

// Industry-Wise Chat History Query
export const getChatHistory = query({
  args: { industry: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("chatHistory")
      .withIndex("by_industry", (q) => q.eq("industry", args.industry))
      .collect();
  },
});

export const getMaritimeSafety = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("maritimeSafety").collect();
  },
});

export const getMaritimeBunkerLogs = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("maritimeBunkerLogs").collect();
  },
});

// Homepage Live Operations Telemetry Signals
export const getHomepageSignals = query({
  args: {},
  handler: async (ctx) => {
    const signals = await ctx.db.query("homepageSignals").first();
    return signals || {
      businessHealth: { operations: 98.4, supplyChain: 89.1, finance: 96.8, procurement: 94.2 },
      aiSignals: [
        { label: "Supply Risk", val: "74% Prob", severity: "warning" },
        { label: "Demand Shift", val: "+18.4%", severity: "info" },
        { label: "Vendor Delay", val: "6-9 Days", severity: "critical" },
      ],
      telemetryJitter: { gridLoadMW: 2854.2, frequencyHz: 50.02, uptimePercent: 99.98 }
    };
  },
});
