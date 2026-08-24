import { mutation } from "./_generated/server";
import { INDUSTRY_SEEDS, SUPPLIERS } from "../src/config/industries";
import { mockDb } from "../src/config/energyMockDb";

export const seedDatabase = mutation({
  args: {},
  handler: async (ctx) => {
    // 1. Clean existing tables to prevent duplicate seed loops
    const tables = [
      "assets",
      "suppliers",
      "inventoryItems",
      "workOrders",
      "complianceRecords",
      "aiInsights",
      "plants",
      "energyMetrics",
      "alarms",
      "maritimeVessels",
      "maritimeSafety",
      "maritimeBunkerLogs",
      "homepageSignals"
    ];

    for (const table of tables) {
      const records = await (ctx.db.query(table as any) as any).collect();
      for (const r of records) {
        await ctx.db.delete(r._id);
      }
    }

    // 2. Seed Suppliers
    const supplierMap = new Map<string, string>();
    for (const sup of SUPPLIERS) {
      const id = await ctx.db.insert("suppliers", {
        organizationId: "org-1",
        name: sup.name,
        category: sup.category,
        ontimeDeliveryRate: sup.ontimeDeliveryRate,
        qualityScore: sup.qualityScore,
        riskLevel: sup.riskLevel,
        leadTimeDays: sup.leadTimeDays,
      });
      supplierMap.set(sup.id, id);
    }

    // 3. Seed Industries & Assets
    for (const [indKey, indData] of Object.entries(INDUSTRY_SEEDS)) {
      const assetMap = new Map<string, string>();
      for (const asset of indData.assets) {
        const id = await ctx.db.insert("assets", {
          organizationId: "org-1",
          industry: indKey,
          name: asset.name,
          type: asset.type,
          status: asset.status,
          healthScore: asset.healthScore,
          failureRisk: asset.failureRisk,
          location: asset.location,
          criticality: asset.criticality,
          lastMaintenance: asset.lastMaintenance,
          nextMaintenance: asset.nextMaintenance,
          details: asset.details
        });
        assetMap.set(asset.id, id);
      }

      for (const item of indData.inventory) {
        const dbSupplierId = supplierMap.get(item.supplierId) || "no-supplier";
        await ctx.db.insert("inventoryItems", {
          organizationId: "org-1",
          industry: indKey,
          partId: item.partId,
          name: item.name,
          category: item.category,
          stock: item.stock,
          reserved: item.reserved,
          reorderLevel: item.reorderLevel,
          location: item.location,
          supplierId: dbSupplierId,
          leadTimeDays: item.leadTimeDays
        });
      }

      for (const wo of indData.workOrders) {
        const dbAssetId = assetMap.get(wo.assetId) || "no-asset";
        await ctx.db.insert("workOrders", {
          organizationId: "org-1",
          industry: indKey,
          assetId: dbAssetId,
          title: wo.title,
          priority: wo.priority,
          status: wo.status,
          assignedTeam: wo.assignedTeam,
          assignedPerson: wo.assignedPerson,
          createdDate: wo.createdDate,
          dueDate: wo.dueDate,
          estimatedDuration: wo.estimatedDuration,
          requiredParts: wo.requiredParts,
          notes: wo.notes
        });
      }

      for (const cmp of indData.compliance) {
        await ctx.db.insert("complianceRecords", {
          organizationId: "org-1",
          industry: indKey,
          title: cmp.title,
          authority: cmp.authority,
          expiryDate: cmp.expiryDate,
          status: cmp.status
        });
      }

      for (const ins of indData.insights) {
        await ctx.db.insert("aiInsights", {
          organizationId: "org-1",
          industry: indKey,
          type: ins.type,
          title: ins.title,
          severity: ins.severity,
          targetEntity: ins.targetEntity,
          detail: ins.detail,
          recommendation: ins.recommendation,
          resolved: false
        });
      }
    }

    // 4. Seed Energy & Utilities Plants & Alarms
    for (const p of mockDb.plants) {
      await ctx.db.insert("plants", {
        name: p.name,
        type: p.type,
        location: p.location,
        latitude: p.latitude,
        longitude: p.longitude,
        capacity: p.capacity,
        status: p.status,
        commissioningDate: p.commissioningDate,
        owner: p.owner,
        healthScore: p.healthScore,
      });
    }

    for (const a of mockDb.alarms) {
      await ctx.db.insert("alarms", {
        plantId: a.plantId,
        assetId: a.assetId,
        severity: a.severity,
        status: a.status,
        code: a.code,
        message: a.message,
        timestamp: a.timestamp,
        assignedEngineer: a.assignedEngineer,
      });
    }

    // 5. Seed Maritime Telemetry
    await ctx.db.insert("maritimeVessels", {
      name: "MV Stellar Pioneer",
      imo: "IMO-9842100",
      type: "Ultra Large Container Vessel (ULCV)",
      flag: "Singapore",
      dwt: 198000,
      status: "Underway",
      speedKnots: 18.4,
      lat: 1.290270,
      lng: 103.851959,
      origin: "Rotterdam (NLRTM)",
      destination: "Singapore (SGSIN)",
      eta: "2026-08-28 14:00 UTC",
      fuelEfficiencyScore: 94.2,
      ciiRating: "A",
      cargo: "18,400 TEU High-Value Electronics & Auto Parts"
    });

    await ctx.db.insert("maritimeSafety", {
      vesselId: "IMO-9842100",
      title: "Lifeboat Engine Quick-Start Battery Voltage Drop",
      category: "SOLAS Safety",
      severity: "High",
      status: "Open",
      findingDate: "2026-08-20",
      targetResolutionDate: "2026-08-27"
    });

    await ctx.db.insert("maritimeBunkerLogs", {
      vesselId: "IMO-9842100",
      mgoROBMetricTons: 142.5,
      hfoROBMetricTons: 680.0,
      lastBunkeringPort: "Rotterdam",
      lastBunkeringDate: "2026-08-14",
      bunkerSupplier: "Shell Marine Global",
      sulfurContentPercent: 0.48,
      consumptionDailyMT: 42.1
    });

    // 6. Seed Live Homepage Telemetry Signals
    await ctx.db.insert("homepageSignals", {
      businessHealth: {
        operations: 98.4,
        supplyChain: 89.1,
        finance: 96.8,
        procurement: 94.2
      },
      aiSignals: [
        { label: "Supply Risk", val: "74% Prob", severity: "warning" },
        { label: "Demand Shift", val: "+18.4%", severity: "info" },
        { label: "Vendor Delay", val: "6-9 Days", severity: "critical" }
      ],
      telemetryJitter: {
        gridLoadMW: 2854.2,
        frequencyHz: 50.02,
        uptimePercent: 99.98
      }
    });

    return { success: true, message: "Convex database seeded with complete multi-sector enterprise data." };
  }
});
