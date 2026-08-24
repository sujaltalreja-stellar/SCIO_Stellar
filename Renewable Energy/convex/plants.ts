import { query } from "./_generated/server";
import { v } from "convex/values";

// Get list of all plants with optional filtering
export const list = query({
  args: {
    type: v.optional(v.union(v.literal("solar"), v.literal("wind"), v.literal("bess"))),
    status: v.optional(v.union(v.literal("online"), v.literal("offline"), v.literal("maintenance"))),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let plants = await ctx.db.query("plants").collect();

    // Apply filtering
    if (args.type) {
      plants = plants.filter((p) => p.type === args.type);
    }
    if (args.status) {
      plants = plants.filter((p) => p.status === args.status);
    }
    if (args.search) {
      const q = args.search.toLowerCase();
      plants = plants.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q) ||
          p.owner.toLowerCase().includes(q)
      );
    }

    // Attach latest telemetry metrics
    const plantsWithTelemetry = [];
    for (const p of plants) {
      const latestMetric = await ctx.db
        .query("energyMetrics")
        .withIndex("by_plant_and_timestamp", (q) => q.eq("plantId", p._id))
        .order("desc")
        .first();

      const latestWeather = await ctx.db
        .query("weather")
        .withIndex("by_plant_and_timestamp", (q) => q.eq("plantId", p._id))
        .order("desc")
        .first();

      const activeAlarms = await ctx.db
        .query("alarms")
        .withIndex("by_plant_and_status", (q) => q.eq("plantId", p._id).eq("status", "active"))
        .collect();

      plantsWithTelemetry.push({
        ...p,
        currentPower: latestMetric?.powerOutput ?? 0,
        todayProduction: latestMetric?.todayProduction ?? 0,
        stateOfCharge: latestMetric?.stateOfCharge ?? 0,
        weatherTemp: latestWeather?.temperature ?? 0,
        weatherDesc: latestWeather?.description ?? "N/A",
        activeAlarmsCount: activeAlarms.length,
      });
    }

    return plantsWithTelemetry;
  },
});

// Fetch detailed single plant dashboard details
export const getById = query({
  args: { plantId: v.id("plants") },
  handler: async (ctx, args) => {
    const plant = await ctx.db.get(args.plantId);
    if (!plant) return null;

    // Latest metric
    const latestMetric = await ctx.db
      .query("energyMetrics")
      .withIndex("by_plant_and_timestamp", (q) => q.eq("plantId", plant._id))
      .order("desc")
      .first();

    // Latest weather
    const latestWeather = await ctx.db
      .query("weather")
      .withIndex("by_plant_and_timestamp", (q) => q.eq("plantId", plant._id))
      .order("desc")
      .first();

    // Alarms count
    const activeAlarms = await ctx.db
      .query("alarms")
      .withIndex("by_plant_and_status", (q) => q.eq("plantId", plant._id).eq("status", "active"))
      .collect();

    // Get historical production (last 24 hours/ticks)
    const recentMetrics = await ctx.db
      .query("energyMetrics")
      .withIndex("by_plant_and_timestamp", (q) => q.eq("plantId", plant._id))
      .order("desc")
      .take(24);

    // Get assets for this plant
    const assets = await ctx.db
      .query("assets")
      .withIndex("by_plant", (q) => q.eq("plantId", plant._id))
      .collect();

    return {
      plant,
      telemetry: latestMetric ?? null,
      weather: latestWeather ?? null,
      activeAlarms,
      recentMetrics: recentMetrics.reverse(),
      assets,
    };
  },
});

// Fetch executive portfolio summary stats
export const getPortfolioStats = query({
  args: {},
  handler: async (ctx) => {
    const plants = await ctx.db.query("plants").collect();
    
    let totalCapacity = 0;
    let onlineCount = 0;
    let offlineCount = 0;
    let maintenanceCount = 0;
    let sumHealth = 0;

    for (const p of plants) {
      totalCapacity += p.capacity;
      sumHealth += p.healthScore;
      if (p.status === "online") onlineCount++;
      else if (p.status === "offline") offlineCount++;
      else if (p.status === "maintenance") maintenanceCount++;
    }

    const avgHealth = plants.length > 0 ? sumHealth / plants.length : 100;

    // Get latest metrics for all plants to aggregate live power & today's yield
    let totalLivePower = 0;
    let totalTodayProduction = 0;
    let carbonOffsetTonnes = 0;

    for (const p of plants) {
      const metric = await ctx.db
        .query("energyMetrics")
        .withIndex("by_plant_and_timestamp", (q) => q.eq("plantId", p._id))
        .order("desc")
        .first();
      
      if (metric) {
        totalLivePower += metric.powerOutput;
        totalTodayProduction += metric.todayProduction;
      }
    }

    // Siemens-standard: 1 MWh of solar/wind offsets ~0.7 tonnes of CO2
    carbonOffsetTonnes = totalTodayProduction * 0.7;

    // Get active critical alarms count
    const activeCriticalAlarms = await ctx.db
      .query("alarms")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();
    
    const criticalCount = activeCriticalAlarms.filter(a => a.severity === "critical").length;
    const highCount = activeCriticalAlarms.filter(a => a.severity === "high").length;

    // Upcoming maintenance tasks
    const upcomingMaintenance = await ctx.db
      .query("maintenance")
      .withIndex("by_status", (q) => q.eq("status", "scheduled"))
      .take(5);

    return {
      totalCapacity,
      totalPlants: plants.length,
      onlineCount,
      offlineCount,
      maintenanceCount,
      averageHealth: avgHealth,
      totalLivePower,
      totalTodayProduction,
      carbonOffsetTonnes,
      activeAlarmsCount: activeCriticalAlarms.length,
      criticalAlarmsCount: criticalCount,
      highAlarmsCount: highCount,
      upcomingMaintenanceCount: upcomingMaintenance.length,
    };
  },
});
