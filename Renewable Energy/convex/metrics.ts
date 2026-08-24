import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Retrieve portfolio-wide historical production charts
export const getHistoricalPortfolioMetrics = query({
  args: { days: v.optional(v.float64()) },
  handler: async (ctx, args) => {
    const daysLimit = args.days ?? 30;
    const plants = await ctx.db.query("plants").collect();
    const metrics = await ctx.db.query("energyMetrics").collect();
    const weather = await ctx.db.query("weather").collect();

    // Group by day (rounded timestamp to midnight)
    const dailyDataMap: Record<string, {
      date: string;
      solar: number;
      wind: number;
      bess: number;
      irradiance: number;
      windSpeed: number;
      avgTemp: number;
      count: number;
    }> = {};

    const oneDayMs = 24 * 3600 * 1000;
    const cutoff = Date.now() - daysLimit * oneDayMs;

    // Build timeline buckets
    for (let i = daysLimit - 1; i >= 0; i--) {
      const dateStr = new Date(Date.now() - i * oneDayMs).toISOString().split("T")[0];
      dailyDataMap[dateStr] = {
        date: dateStr,
        solar: 0,
        wind: 0,
        bess: 0,
        irradiance: 0,
        windSpeed: 0,
        avgTemp: 0,
        count: 0,
      };
    }

    // Process energy metrics
    for (const m of metrics) {
      if (m.timestamp < cutoff) continue;
      const dateStr = new Date(m.timestamp).toISOString().split("T")[0];
      if (!dailyDataMap[dateStr]) continue;

      const plant = plants.find((p) => p._id === m.plantId);
      if (!plant) continue;

      // Increment daily production sums
      if (plant.type === "solar") {
        dailyDataMap[dateStr].solar += m.todayProduction;
      } else if (plant.type === "wind") {
        dailyDataMap[dateStr].wind += m.todayProduction;
      } else if (plant.type === "bess") {
        dailyDataMap[dateStr].bess += m.todayProduction;
      }
    }

    // Process weather metrics
    for (const w of weather) {
      if (w.timestamp < cutoff) continue;
      const dateStr = new Date(w.timestamp).toISOString().split("T")[0];
      if (!dailyDataMap[dateStr]) continue;

      const plant = plants.find((p) => p._id === w.plantId);
      if (!plant) continue;

      dailyDataMap[dateStr].avgTemp += w.temperature;
      if (plant.type === "solar") {
        dailyDataMap[dateStr].irradiance += w.irradiance ?? 0;
      } else if (plant.type === "wind") {
        dailyDataMap[dateStr].windSpeed += w.windSpeed;
      }
      dailyDataMap[dateStr].count++;
    }

    // Format for charting
    return Object.values(dailyDataMap).map((d) => {
      const count = d.count || 1;
      return {
        date: d.date,
        solar: parseFloat(d.solar.toFixed(2)),
        wind: parseFloat(d.wind.toFixed(2)),
        bess: parseFloat(d.bess.toFixed(2)),
        irradiance: parseFloat((d.irradiance / count).toFixed(1)),
        windSpeed: parseFloat((d.windSpeed / count).toFixed(1)),
        avgTemp: parseFloat((d.avgTemp / count).toFixed(1)),
      };
    });
  },
});

// SCADA Telemetry Simulator Loop Mutation
// In a live system, this would be updated by MQTT/SCADA broker.
export const simulateLiveTelemetry = mutation({
  args: {},
  handler: async (ctx) => {
    const plants = await ctx.db.query("plants").collect();
    const nowMs = Date.now();
    const currentHour = new Date(nowMs).getHours();

    const engineers = ["Sarah Connor", "John Doe", "Marcus Vance", "Elena Rostova", "Devon Cole"];
    const alarmTemplates = [
      { code: "INV_OVERHEAT", msg: "Inverter module internal temperature exceeded threshold (86°C)", sev: "critical" as const },
      { code: "XFMR_OIL_TEMP", msg: "Transformer oil temperature high warning", sev: "high" as const },
      { code: "COMM_LOSS", msg: "Communication loss with string tracker controller #14", sev: "medium" as const },
      { code: "TURB_YAW_FAIL", msg: "Wind turbine yaw adjustment failure", sev: "critical" as const },
      { code: "BATT_CELL_DEV", msg: "Battery rack cell voltage deviation warning", sev: "high" as const },
      { code: "MET_STN_OFFLINE", msg: "Weather station Pyranometer sensor unresponsive", sev: "low" as const },
    ];

    let telemetryUpdatesCount = 0;

    for (const p of plants) {
      if (p.status === "offline") continue;

      // Get latest metric
      const latestMetric = await ctx.db
        .query("energyMetrics")
        .withIndex("by_plant_and_timestamp", (q) => q.eq("plantId", p._id))
        .order("desc")
        .first();

      // Get latest weather
      const latestWeather = await ctx.db
        .query("weather")
        .withIndex("by_plant_and_timestamp", (q) => q.eq("plantId", p._id))
        .order("desc")
        .first();

      let powerOutput = latestMetric?.powerOutput ?? 0;
      let todayProduction = latestMetric?.todayProduction ?? 0;
      let stateOfCharge = latestMetric?.stateOfCharge ?? 0;
      let stateOfHealth = latestMetric?.stateOfHealth ?? p.healthScore;
      let gridImport = 0;
      let gridExport = 0;

      // 1. Simulating weather parameters
      let temp = latestWeather?.temperature ?? 25;
      let windSpeed = latestWeather?.windSpeed ?? 5;
      let irradiance = latestWeather?.irradiance ?? 0;
      let humidity = latestWeather?.humidity ?? 50;
      let cloudCover = latestWeather?.cloudCover ?? 20;

      temp += (Math.random() - 0.5) * 0.4; // gradual drift
      windSpeed = Math.max(0.5, windSpeed + (Math.random() - 0.5) * 1.2);
      cloudCover = Math.max(0, Math.min(100, cloudCover + (Math.random() - 0.5) * 5));

      // Bounded values
      if (p.type === "solar") {
        // Solar irradiance cycles based on hour of day
        if (currentHour >= 6 && currentHour <= 18) {
          const sinScale = Math.sin(Math.PI * ((currentHour - 6) / 12));
          irradiance = sinScale * 900 * (1 - cloudCover / 150) + Math.random() * 50;
          powerOutput = (irradiance / 1000) * p.capacity * 0.95 * (p.healthScore / 100);
        } else {
          irradiance = 0;
          powerOutput = 0;
        }
        todayProduction += powerOutput * (15 / 3600); // 15s tick integration
        gridExport = powerOutput;
      } else if (p.type === "wind") {
        // Wind turbine power curves
        irradiance = 0;
        if (windSpeed < 3.0) {
          powerOutput = 0; // Cut-in speed
        } else if (windSpeed > 25.0) {
          powerOutput = 0; // Cut-out speed (storm protection)
        } else {
          // Linear power generation mapping to capacity
          powerOutput = ((windSpeed - 3) / 22) * p.capacity * 0.95 * (p.healthScore / 100);
        }
        todayProduction += powerOutput * (15 / 3600);
        gridExport = powerOutput;
      } else {
        // BESS charge/discharge cycle simulation
        // Charging during low demand/high solar hours (9am - 3pm), discharging during peak demand (4pm - 8pm)
        let mode: "charge" | "discharge" | "idle" = "idle";
        if (currentHour >= 9 && currentHour <= 15) {
          mode = "charge";
        } else if (currentHour >= 16 && currentHour <= 20) {
          mode = "discharge";
        } else {
          mode = Math.random() > 0.5 ? "charge" : "discharge";
        }

        if (mode === "charge") {
          powerOutput = -p.capacity * 0.4 * (Math.random() * 0.5 + 0.5); // Negative is import
          stateOfCharge = Math.min(100, stateOfCharge + Math.abs(powerOutput) * (15 / 3600) * 0.92); // 92% roundtrip eff
          gridImport = Math.abs(powerOutput);
        } else if (mode === "discharge") {
          powerOutput = p.capacity * 0.4 * (Math.random() * 0.5 + 0.5);
          stateOfCharge = Math.max(5, stateOfCharge - powerOutput * (15 / 3600));
          gridExport = powerOutput;
        }
        todayProduction += Math.abs(powerOutput) * (15 / 3600);
      }

      // Constrain boundaries
      powerOutput = parseFloat(Math.min(p.capacity, Math.max(-p.capacity, powerOutput)).toFixed(2));
      todayProduction = parseFloat(todayProduction.toFixed(2));
      stateOfCharge = parseFloat(stateOfCharge.toFixed(1));
      temp = parseFloat(Math.min(50, Math.max(-10, temp)).toFixed(1));
      windSpeed = parseFloat(windSpeed.toFixed(1));
      cloudCover = parseFloat(cloudCover.toFixed(0));
      irradiance = parseFloat(Math.max(0, irradiance).toFixed(0));

      const frequency = parseFloat((59.97 + Math.random() * 0.06).toFixed(3));
      const voltage = parseFloat((345000 + (Math.random() - 0.5) * 2000).toFixed(0));
      const current = parseFloat((Math.abs(powerOutput) * 1e6 / (voltage * Math.sqrt(3))).toFixed(1));
      const efficiency = parseFloat((p.healthScore - 2 + Math.random() * 4).toFixed(1));

      // Create new metrics
      await ctx.db.insert("energyMetrics", {
        plantId: p._id,
        timestamp: nowMs,
        powerOutput,
        todayProduction,
        stateOfCharge,
        stateOfHealth,
        frequency,
        gridImport,
        gridExport,
        efficiency,
        voltage,
        current,
      });

      await ctx.db.insert("weather", {
        plantId: p._id,
        timestamp: nowMs,
        temperature: temp,
        humidity,
        windSpeed,
        cloudCover,
        irradiance,
        description: latestWeather?.description ?? "Normal",
      });

      // Keep only rolling window of 48 records per plant to avoid database bloating
      const oldestMetrics = await ctx.db
        .query("energyMetrics")
        .withIndex("by_plant_and_timestamp", (q) => q.eq("plantId", p._id))
        .order("asc")
        .take(5);

      if (oldestMetrics.length > 30) {
        // delete oldest if limit exceeded
        for (let i = 0; i < oldestMetrics.length - 24; i++) {
          await ctx.db.delete(oldestMetrics[i]._id);
        }
      }

      const oldestWeather = await ctx.db
        .query("weather")
        .withIndex("by_plant_and_timestamp", (q) => q.eq("plantId", p._id))
        .order("asc")
        .take(5);

      if (oldestWeather.length > 30) {
        for (let i = 0; i < oldestWeather.length - 24; i++) {
          await ctx.db.delete(oldestWeather[i]._id);
        }
      }

      telemetryUpdatesCount++;

      // 2. Random Alarm Trigger (1% chance per cycle for plants with lower health scores)
      if (p.healthScore < 95 && Math.random() < 0.01) {
        const template = alarmTemplates[Math.floor(Math.random() * alarmTemplates.length)];
        const assets = await ctx.db
          .query("assets")
          .withIndex("by_plant", (q) => q.eq("plantId", p._id))
          .collect();
        const asset = assets[Math.floor(Math.random() * assets.length)];

        // Check if there is already an active alarm for this asset
        const existingAlarms = await ctx.db
          .query("alarms")
          .withIndex("by_plant_and_status", (q) => q.eq("plantId", p._id).eq("status", "active"))
          .collect();

        const hasActive = existingAlarms.some(a => a.code === template.code && a.assetId === asset?._id);

        if (!hasActive) {
          const alarmId = await ctx.db.insert("alarms", {
            plantId: p._id,
            assetId: asset?._id,
            severity: template.sev,
            status: "active",
            code: template.code,
            message: `${asset ? asset.type.toUpperCase() + ": " : ""}${template.msg}`,
            timestamp: nowMs,
            assignedEngineer: engineers[Math.floor(Math.random() * engineers.length)],
          });

          // Insert Notification
          await ctx.db.insert("notifications", {
            type: "alarm",
            title: `CRITICAL ALERT: ${p.name}`,
            message: template.msg,
            severity: template.sev,
            timestamp: nowMs,
            read: false,
          });

          // Write Audit Log
          await ctx.db.insert("auditLogs", {
            plantId: p._id,
            action: "ALARM_TRIGGER",
            details: `Alarm code ${template.code} triggered on asset ${asset?.name ?? "Substation"}.`,
            timestamp: nowMs,
            operator: "SCADA System Monitor",
          });
        }
      }

      // 3. Random Alarm Resolution (2% chance of resolving an active alarm)
      if (Math.random() < 0.02) {
        const activeAlarms = await ctx.db
          .query("alarms")
          .withIndex("by_plant_and_status", (q) => q.eq("plantId", p._id).eq("status", "active"))
          .collect();

        if (activeAlarms.length > 0) {
          const alarmToResolve = activeAlarms[0];
          await ctx.db.patch(alarmToResolve._id, {
            status: "resolved",
            resolvedAt: nowMs,
          });

          // Write Audit Log
          await ctx.db.insert("auditLogs", {
            plantId: p._id,
            action: "ALARM_RESOLVE",
            details: `Alarm code ${alarmToResolve.code} resolved by automated self-healing controller.`,
            timestamp: nowMs,
            operator: "Auto-Scada Engine",
          });
        }
      }
    }

    return `Telemetry simulator tick completed. Updated ${telemetryUpdatesCount} plants.`;
  },
});
