import { query } from "./_generated/server";
import { v } from "convex/values";

// Generate customized report tables
export const generate = query({
  args: {
    plantId: v.optional(v.id("plants")),
    startDate: v.float64(),
    endDate: v.float64(),
    reportType: v.union(v.literal("production"), v.literal("health"), v.literal("alarms")),
  },
  handler: async (ctx, args) => {
    const plants = await ctx.db.query("plants").collect();
    
    // Filter plants if selected
    const targetPlants = args.plantId 
      ? plants.filter(p => p._id === args.plantId)
      : plants;

    const reportRows = [];

    for (const p of targetPlants) {
      // Get metrics in date range
      const metrics = await ctx.db
        .query("energyMetrics")
        .withIndex("by_plant_and_timestamp", (q) => q.eq("plantId", p._id))
        .collect();

      const filteredMetrics = metrics.filter(
        m => m.timestamp >= args.startDate && m.timestamp <= args.endDate
      );

      if (args.reportType === "production") {
        // Sum todayProduction
        const totalProduction = filteredMetrics.reduce((sum, m) => sum + m.todayProduction, 0);
        const maxPower = filteredMetrics.reduce((max, m) => Math.max(max, m.powerOutput), 0);
        const avgEfficiency = filteredMetrics.length > 0
          ? filteredMetrics.reduce((sum, m) => sum + m.efficiency, 0) / filteredMetrics.length
          : 0;

        // Capacity Factor = Actual MWh / (Capacity MW * Hours in period)
        const days = Math.max(1, (args.endDate - args.startDate) / (24 * 3600 * 1000));
        const totalHours = days * 24;
        const capacityFactor = p.capacity > 0 
          ? (totalProduction / (p.capacity * totalHours)) * 100 
          : 0;

        reportRows.push({
          plantId: p._id,
          plantName: p.name,
          plantType: p.type,
          capacity: p.capacity,
          totalProductionMWh: parseFloat(totalProduction.toFixed(2)),
          peakGenerationMW: parseFloat(maxPower.toFixed(2)),
          averageEfficiency: parseFloat(avgEfficiency.toFixed(1)),
          capacityFactor: parseFloat(Math.min(100, capacityFactor).toFixed(1)),
          co2OffsetTonnes: parseFloat((totalProduction * 0.7).toFixed(2)),
        });
      } else if (args.reportType === "health") {
        const avgHealth = filteredMetrics.length > 0
          ? filteredMetrics.reduce((sum, m) => sum + m.stateOfHealth, 0) / filteredMetrics.length
          : p.healthScore;

        const assets = await ctx.db
          .query("assets")
          .withIndex("by_plant", (q) => q.eq("plantId", p._id))
          .collect();
        
        const offlineAssets = assets.filter(a => a.status === "offline").length;

        reportRows.push({
          plantId: p._id,
          plantName: p.name,
          plantType: p.type,
          capacity: p.capacity,
          averageHealthScore: parseFloat(avgHealth.toFixed(1)),
          totalAssets: assets.length,
          offlineAssetsCount: offlineAssets,
          downtimePercentage: parseFloat((offlineAssets / (assets.length || 1) * 100).toFixed(1)),
        });
      } else if (args.reportType === "alarms") {
        const alarms = await ctx.db
          .query("alarms")
          .withIndex("by_plant", (q) => q.eq("plantId", p._id))
          .collect();

        const rangeAlarms = alarms.filter(
          a => a.timestamp >= args.startDate && a.timestamp <= args.endDate
        );

        const critical = rangeAlarms.filter(a => a.severity === "critical").length;
        const high = rangeAlarms.filter(a => a.severity === "high").length;
        const active = rangeAlarms.filter(a => a.status === "active" || a.status === "acknowledged").length;

        reportRows.push({
          plantId: p._id,
          plantName: p.name,
          plantType: p.type,
          totalAlarms: rangeAlarms.length,
          criticalCount: critical,
          highCount: high,
          activeCount: active,
          resolvedCount: rangeAlarms.length - active,
        });
      }
    }

    return reportRows;
  },
});
