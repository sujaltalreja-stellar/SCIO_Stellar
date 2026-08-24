import { query } from "./_generated/server";
import { v } from "convex/values";

// List AI Insights with optional filters
export const list = query({
  args: {
    plantId: v.optional(v.id("plants")),
    type: v.optional(v.union(v.literal("anomaly"), v.literal("prediction"), v.literal("recommendation"), v.literal("risk"))),
  },
  handler: async (ctx, args) => {
    let list = await ctx.db.query("aiInsights").collect();

    if (args.plantId) {
      list = list.filter((i) => i.plantId === args.plantId);
    }
    if (args.type) {
      list = list.filter((i) => i.type === args.type);
    }

    const enriched = [];
    for (const item of list) {
      const plant = await ctx.db.get(item.plantId);
      const asset = item.assetId ? await ctx.db.get(item.assetId) : null;

      enriched.push({
        ...item,
        plantName: plant?.name ?? "Unknown Plant",
        plantType: plant?.type ?? "solar",
        assetName: asset?.name ?? "Substation Unit",
        assetType: asset?.type ?? "panel",
      });
    }

    // Sort by failure probability / risk / timestamp desc
    return enriched.sort((a, b) => b.timestamp - a.timestamp);
  },
});

// Fetch overall AI Portfolio Analytics Risk metrics
export const getSummary = query({
  args: {},
  handler: async (ctx) => {
    const insights = await ctx.db.query("aiInsights").collect();
    const plants = await ctx.db.query("plants").collect();
    const assets = await ctx.db.query("assets").collect();

    const anomaliesCount = insights.filter(i => i.type === "anomaly").length;
    const recommendationsCount = insights.filter(i => i.type === "recommendation").length;

    // Filter high probability failure assets (failProb > 60%)
    const highRiskInsights = insights
      .filter((i) => i.failureProbability !== undefined && i.failureProbability > 60)
      .sort((a, b) => (b.failureProbability ?? 0) - (a.failureProbability ?? 0));

    const highRiskAssets = [];
    for (const insight of highRiskInsights) {
      const plant = plants.find(p => p._id === insight.plantId);
      const asset = insight.assetId ? assets.find(a => a._id === insight.assetId) : null;

      highRiskAssets.push({
        insightId: insight._id,
        plantId: insight.plantId,
        plantName: plant?.name ?? "Unknown Plant",
        assetId: insight.assetId,
        assetName: asset?.name ?? "Substation Unit",
        assetType: asset?.type ?? "panel",
        failureProbability: insight.failureProbability ?? 0,
        remainingUsefulLife: insight.remainingUsefulLife ?? 30,
        riskScore: insight.riskScore ?? 0,
        title: insight.title,
        rca: insight.rootCauseAnalysis ?? "Aging fatigue",
      });
    }

    // Portfolio average risk index (derived from average health score of plants vs insights count)
    const totalHealth = plants.reduce((sum, p) => sum + p.healthScore, 0);
    const averageHealth = plants.length > 0 ? totalHealth / plants.length : 100;
    const portfolioRiskIndex = Math.max(0, 100 - averageHealth + (highRiskAssets.length * 1.8));

    return {
      anomaliesCount,
      recommendationsCount,
      portfolioRiskIndex: parseFloat(portfolioRiskIndex.toFixed(1)),
      highRiskAssetsCount: highRiskAssets.length,
      highRiskAssets: highRiskAssets.slice(0, 8),
    };
  },
});
