import { useState, useEffect } from "react";
import { mockDb } from "./mockDb";

// Convex API Endpoint mapping definition
export const api = {
  plants: {
    list: "plants:list",
    getById: "plants:getById",
    getPortfolioStats: "plants:getPortfolioStats",
  },
  assets: {
    list: "assets:list",
    getById: "assets:getById",
  },
  metrics: {
    getHistoricalPortfolioMetrics: "metrics:getHistoricalPortfolioMetrics",
    simulateLiveTelemetry: "metrics:simulateLiveTelemetry",
  },
  alarms: {
    list: "alarms:list",
    acknowledge: "alarms:acknowledge",
    resolve: "alarms:resolve",
    getNotifications: "alarms:getNotifications",
    markNotificationRead: "alarms:markNotificationRead",
    markAllNotificationsRead: "alarms:markAllNotificationsRead",
  },
  maintenance: {
    list: "maintenance:list",
    create: "maintenance:create",
    complete: "maintenance:complete",
  },
  reports: {
    generate: "reports:generate",
  },
  audit: {
    list: "audit:list",
  },

  /* PHASE 2 ENDPOINTS */
  inspections: {
    list: "inspections:list",
    listTemplates: "inspections:listTemplates",
    submit: "inspections:submit",
  },
  workOrders: {
    list: "workOrders:list",
    getTechnicians: "workOrders:getTechnicians",
    create: "workOrders:create",
    updateStatus: "workOrders:updateStatus",
  },
  aiInsights: {
    list: "aiInsights:list",
    getSummary: "aiInsights:getSummary",
  },

  /* PHASE 3 ENDPOINTS */
  procurement: {
    listVendors: "procurement:listVendors",
    listRequisitions: "procurement:listRequisitions",
    approveRequisition: "procurement:approveRequisition",
    listPurchaseOrders: "procurement:listPurchaseOrders",
    receiveGoods: "procurement:receiveGoods",
    listContracts: "procurement:listContracts",
  },
  inventory: {
    listWarehouses: "inventory:listWarehouses",
    listInventory: "inventory:listInventory",
    adjustStock: "inventory:adjustStock",
    listShipments: "inventory:listShipments",
  },
  finance: {
    listCostCenters: "finance:listCostCenters",
    listInvoices: "finance:listInvoices",
    payInvoice: "finance:payInvoice",
    listPpaBillings: "finance:listPpaBillings",
  },
  erp: {
    listJobs: "erp:listJobs",
    listLogs: "erp:listLogs",
    triggerSync: "erp:triggerSync",
  },

  /* PHASE 4 ENDPOINTS */
  intelligence: {
    getInsightsSummary: "intelligence:getInsightsSummary",
    getOptimizationRecommendations: "intelligence:getOptimizationRecommendations",
  },
  forecasting: {
    list: "forecasting:list",
    getByCategory: "forecasting:getByCategory",
  },
  digitalTwin: {
    getPlantLayout: "digitalTwin:getPlantLayout",
  },
  esg: {
    listSustainabilityMetrics: "esg:listSustainabilityMetrics",
    listESGReports: "esg:listESGReports",
  },
  portfolio: {
    listAnalytics: "portfolio:listAnalytics",
    listExecutiveKPIs: "portfolio:listExecutiveKPIs",
    listBoardReports: "portfolio:listBoardReports",
  },
  copilot: {
    listConversations: "copilot:listConversations",
    sendMessage: "copilot:sendMessage",
  },
  bi: {
    getAnalyticsSummary: "bi:getAnalyticsSummary",
  },
  integrations: {
    listConnectors: "integrations:listConnectors",
    listWorkflows: "integrations:listWorkflows",
    toggleWorkflow: "integrations:toggleWorkflow",
  },
};

import { phase4Data } from "./mockDb";

// Internal query engine matching server-side convex functions
function executeQuery(apiName: string, args: any): any {
  const result = executeQueryInternal(apiName, args);
  console.log("Convex Query:", apiName, "args:", args, "result:", result);
  return result;
}

function executeQueryInternal(apiName: string, args: any): any {
  switch (apiName) {
    case "plants:list": {
      let list = [...mockDb.plants];
      if (args?.type) {
        list = list.filter((p) => p.type === args.type);
      }
      if (args?.status) {
        list = list.filter((p) => p.status === args.status);
      }
      if (args?.search) {
        const q = args.search.toLowerCase();
        list = list.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.location.toLowerCase().includes(q) ||
            p.owner.toLowerCase().includes(q)
        );
      }
      return list.map((p) => {
        const pMetrics = mockDb.energyMetrics
          .filter((m) => m.plantId === p._id)
          .sort((a, b) => b.timestamp - a.timestamp);
        const latestMetric = pMetrics[0];

        const pWeather = mockDb.weather
          .filter((w) => w.plantId === p._id)
          .sort((a, b) => b.timestamp - a.timestamp);
        const latestWeather = pWeather[0];

        const activeAlarms = mockDb.alarms.filter(
          (a) => a.plantId === p._id && a.status === "active"
        );

        return {
          ...p,
          currentPower: latestMetric?.powerOutput ?? 0,
          todayProduction: latestMetric?.todayProduction ?? 0,
          stateOfCharge: latestMetric?.stateOfCharge ?? 0,
          weatherTemp: latestWeather?.temperature ?? 0,
          weatherDesc: latestWeather?.description ?? "Normal",
          activeAlarmsCount: activeAlarms.length,
        };
      });
    }

    case "plants:getById": {
      if (!args?.plantId) return null;
      const plant = mockDb.plants.find((p) => p._id === args.plantId);
      if (!plant) return null;

      const pMetrics = mockDb.energyMetrics
        .filter((m) => m.plantId === plant._id)
        .sort((a, b) => b.timestamp - a.timestamp);
      const latestMetric = pMetrics[0];

      const pWeather = mockDb.weather
        .filter((w) => w.plantId === plant._id)
        .sort((a, b) => b.timestamp - a.timestamp);
      const latestWeather = pWeather[0];

      const activeAlarms = mockDb.alarms.filter(
        (a) => a.plantId === plant._id && a.status === "active"
      );

      // Past 24 ticks/hours
      const recentMetrics = pMetrics.slice(0, 24).reverse();

      const assets = mockDb.assets.filter((a) => a.plantId === plant._id);

      return {
        plant,
        telemetry: latestMetric ?? null,
        weather: latestWeather ?? null,
        activeAlarms,
        recentMetrics,
        assets,
      };
    }

    case "plants:getPortfolioStats": {
      const plants = mockDb.plants;
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

      const averageHealth = plants.length > 0 ? sumHealth / plants.length : 100;

      let totalLivePower = 0;
      let totalTodayProduction = 0;

      for (const p of plants) {
        const pMetrics = mockDb.energyMetrics
          .filter((m) => m.plantId === p._id)
          .sort((a, b) => b.timestamp - a.timestamp);
        const latestMetric = pMetrics[0];

        if (latestMetric) {
          totalLivePower += latestMetric.powerOutput;
          totalTodayProduction += latestMetric.todayProduction;
        }
      }

      const activeAlarms = mockDb.alarms.filter((a) => a.status === "active");
      const criticalAlarmsCount = activeAlarms.filter((a) => a.severity === "critical").length;
      const highAlarmsCount = activeAlarms.filter((a) => a.severity === "high").length;

      const upcomingMaintenance = mockDb.maintenance.filter((t) => t.status === "scheduled");

      return {
        totalCapacity,
        totalPlants: plants.length,
        onlineCount,
        offlineCount,
        maintenanceCount,
        averageHealth,
        totalLivePower,
        totalTodayProduction,
        carbonOffsetTonnes: totalTodayProduction * 0.7,
        activeAlarmsCount: activeAlarms.length,
        criticalAlarmsCount,
        highAlarmsCount,
        upcomingMaintenanceCount: upcomingMaintenance.length,
      };
    }

    case "assets:list": {
      let list = [...mockDb.assets];
      if (args?.plantId) {
        list = list.filter((a) => a.plantId === args.plantId);
      }
      if (args?.type) {
        list = list.filter((a) => a.type === args.type);
      }
      if (args?.status) {
        list = list.filter((a) => a.status === args.status);
      }
      if (args?.search) {
        const q = args.search.toLowerCase();
        list = list.filter(
          (a) =>
            a.name.toLowerCase().includes(q) ||
            a.serialNumber.toLowerCase().includes(q) ||
            a.manufacturer.toLowerCase().includes(q)
        );
      }

      const limit = args?.limit ?? 100;
      const paginated = list.slice(0, limit);

      return paginated.map((a) => {
        const plant = mockDb.plants.find((p) => p._id === a.plantId);
        return {
          ...a,
          plantName: plant?.name ?? "Unknown Plant",
          plantType: plant?.type ?? "solar",
        };
      });
    }

    case "assets:getById": {
      if (!args?.assetId) return null;
      const asset = mockDb.assets.find((a) => a._id === args.assetId);
      if (!asset) return null;

      const plant = mockDb.plants.find((p) => p._id === asset.plantId);
      const activeAlarms = mockDb.alarms.filter(
        (a) => a.assetId === asset._id && a.status === "active"
      );

      const maintenanceLogs = mockDb.workOrders
        .filter((w) => w.assetId === asset._id)
        .map((w) => ({
          _id: w._id,
          plantId: w.plantId,
          assetId: w.assetId,
          type: w.type,
          description: w.description,
          status: w.status === "completed" || w.status === "closed" ? "completed" as const : "scheduled" as const,
          scheduledDate: w.scheduledDate,
          engineer: w.assignedTechnician ?? "Field Tech",
        }));

      return {
        asset,
        plantName: plant?.name ?? "Unknown Plant",
        activeAlarms,
        maintenanceLogs,
      };
    }

    case "metrics:getHistoricalPortfolioMetrics": {
      const daysLimit = args?.days ?? 30;
      const plants = mockDb.plants;
      const metrics = mockDb.energyMetrics;
      const weather = mockDb.weather;

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

      for (const m of metrics) {
        if (m.timestamp < cutoff) continue;
        const dateStr = new Date(m.timestamp).toISOString().split("T")[0];
        if (!dailyDataMap[dateStr]) continue;

        const plant = plants.find((p) => p._id === m.plantId);
        if (!plant) continue;

        if (plant.type === "solar") {
          dailyDataMap[dateStr].solar += m.todayProduction;
        } else if (plant.type === "wind") {
          dailyDataMap[dateStr].wind += m.todayProduction;
        } else if (plant.type === "bess") {
          dailyDataMap[dateStr].bess += m.todayProduction;
        }
      }

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

      return Object.values(dailyDataMap).map((d) => {
        const count = d.count || 1;
        return {
          date: d.date,
          solar: parseFloat((d.solar / 24).toFixed(2)),
          wind: parseFloat((d.wind / 24).toFixed(2)),
          bess: parseFloat((d.bess / 24).toFixed(2)),
          irradiance: parseFloat((d.irradiance / count).toFixed(1)),
          windSpeed: parseFloat((d.windSpeed / count).toFixed(1)),
          avgTemp: parseFloat((d.avgTemp / count).toFixed(1)),
        };
      });
    }

    case "alarms:list": {
      let list = [...mockDb.alarms];
      if (args?.plantId) {
        list = list.filter((a) => a.plantId === args.plantId);
      }
      if (args?.status) {
        list = list.filter((a) => a.status === args.status);
      }
      if (args?.severity) {
        list = list.filter((a) => a.severity === args.severity);
      }

      return list
        .map((a) => {
          const plant = mockDb.plants.find((p) => p._id === a.plantId);
          const asset = a.assetId ? mockDb.assets.find((as) => as._id === a.assetId) : null;
          return {
            ...a,
            plantName: plant?.name ?? "Unknown Plant",
            assetName: asset?.name ?? "Substation / Grid Link",
          };
        })
        .sort((x, y) => y.timestamp - x.timestamp);
    }

    case "alarms:getNotifications": {
      return [...mockDb.notifications]
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, args?.limit ?? 15);
    }

    case "maintenance:list": {
      let list = [...mockDb.maintenance];
      if (args?.plantId) {
        list = list.filter((t) => t.plantId === args.plantId);
      }
      if (args?.status) {
        list = list.filter((t) => t.status === args.status);
      }

      return list
        .map((t) => {
          const plant = mockDb.plants.find((p) => p._id === t.plantId);
          const asset = mockDb.assets.find((as) => as._id === t.assetId);
          return {
            ...t,
            plantName: plant?.name ?? "Unknown Plant",
            assetName: asset?.name ?? "Unknown Asset",
            assetType: asset?.type ?? "panel",
          };
        })
        .sort(
          (a, b) =>
            new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime()
        );
    }

    case "reports:generate": {
      const plants = mockDb.plants;
      const targetPlants = args?.plantId
        ? plants.filter((p) => p._id === args.plantId)
        : plants;

      const reportRows = [];
      const start = args?.startDate ?? 0;
      const end = args?.endDate ?? Date.now();

      for (const p of targetPlants) {
        const metrics = mockDb.energyMetrics.filter(
          (m) => m.plantId === p._id && m.timestamp >= start && m.timestamp <= end
        );

        if (args?.reportType === "production") {
          const totalProduction = metrics.reduce((sum, m) => sum + m.todayProduction, 0);
          const maxPower = metrics.reduce((max, m) => Math.max(max, m.powerOutput), 0);
          const avgEfficiency = metrics.length > 0
            ? metrics.reduce((sum, m) => sum + m.efficiency, 0) / metrics.length
            : 0;

          const days = Math.max(1, (end - start) / (24 * 3600 * 1000));
          const capacityFactor = p.capacity > 0
            ? (totalProduction / (p.capacity * days * 24)) * 100
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
        } else if (args?.reportType === "health") {
          const avgHealth = metrics.length > 0
            ? metrics.reduce((sum, m) => sum + m.stateOfHealth, 0) / metrics.length
            : p.healthScore;

          const assets = mockDb.assets.filter((a) => a.plantId === p._id);
          const offlineAssets = assets.filter((a) => a.status === "offline").length;

          reportRows.push({
            plantId: p._id,
            plantName: p.name,
            plantType: p.type,
            capacity: p.capacity,
            averageHealthScore: parseFloat(avgHealth.toFixed(1)),
            totalAssets: assets.length,
            offlineAssetsCount: offlineAssets,
            downtimePercentage: parseFloat(
              ((offlineAssets / (assets.length || 1)) * 100).toFixed(1)
            ),
          });
        } else if (args?.reportType === "alarms") {
          const alarms = mockDb.alarms.filter(
            (a) => a.plantId === p._id && a.timestamp >= start && a.timestamp <= end
          );

          const critical = alarms.filter((a) => a.severity === "critical").length;
          const high = alarms.filter((a) => a.severity === "high").length;
          const active = alarms.filter((a) => a.status === "active" || a.status === "acknowledged").length;

          reportRows.push({
            plantId: p._id,
            plantName: p.name,
            plantType: p.type,
            totalAlarms: alarms.length,
            criticalCount: critical,
            highCount: high,
            activeCount: active,
            resolvedCount: alarms.length - active,
          });
        }
      }

      return reportRows;
    }

    case "audit:list": {
      return mockDb.auditLogs
        .map((l) => {
          const plant = l.plantId ? mockDb.plants.find((p) => p._id === l.plantId) : null;
          return {
            ...l,
            plantName: plant?.name ?? "System Core",
          };
        })
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, args?.limit ?? 50);
    }

    /* PHASE 2 QUERY IMPLEMENTATIONS */
    case "inspections:list": {
      let list = [...mockDb.inspections];
      if (args?.plantId) list = list.filter(i => i.plantId === args.plantId);
      if (args?.status) list = list.filter(i => i.status === args.status);
      return list.map(item => {
        const plant = mockDb.plants.find(p => p._id === item.plantId);
        const asset = mockDb.assets.find(a => a._id === item.assetId);
        const temp = item.templateId ? mockDb.inspectionTemplates.find(t => t._id === item.templateId) : null;
        return {
          ...item,
          plantName: plant?.name ?? "Unknown Plant",
          plantType: plant?.type ?? "solar",
          assetName: asset?.name ?? "Unknown Asset",
          templateName: temp?.name ?? "Custom Checklist",
        };
      }).sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime());
    }

    case "inspections:listTemplates": {
      return mockDb.inspectionTemplates;
    }

    case "workOrders:list": {
      let list = [...mockDb.workOrders];
      if (args?.plantId) list = list.filter(w => w.plantId === args.plantId);
      if (args?.status) list = list.filter(w => w.status === args.status);
      if (args?.priority) list = list.filter(w => w.priority === args.priority);
      return list.map(item => {
        const plant = mockDb.plants.find(p => p._id === item.plantId);
        const asset = mockDb.assets.find(a => a._id === item.assetId);
        return {
          ...item,
          plantName: plant?.name ?? "Unknown Plant",
          plantType: plant?.type ?? "solar",
          assetName: asset?.name ?? "Unknown Asset",
          assetType: asset?.type ?? "panel",
        };
      }).sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime());
    }

    case "workOrders:getTechnicians": {
      return mockDb.technicians;
    }

    case "aiInsights:list": {
      let list = [...mockDb.aiInsights];
      if (args?.plantId) list = list.filter(i => i.plantId === args.plantId);
      if (args?.type) list = list.filter(i => i.type === args.type);
      return list.map(item => {
        const plant = mockDb.plants.find(p => p._id === item.plantId);
        const asset = item.assetId ? mockDb.assets.find(a => a._id === item.assetId) : null;
        return {
          ...item,
          plantName: plant?.name ?? "Unknown Plant",
          plantType: plant?.type ?? "solar",
          assetName: asset?.name ?? "Substation Unit",
          assetType: asset?.type ?? "panel",
        };
      }).sort((a, b) => b.timestamp - a.timestamp);
    }

    case "aiInsights:getSummary": {
      const insights = mockDb.aiInsights;
      const plants = mockDb.plants;
      const assets = mockDb.assets;

      const anomaliesCount = insights.filter(i => i.type === "anomaly").length;
      const recommendationsCount = insights.filter(i => i.type === "recommendation").length;

      const highRiskInsights = insights
        .filter((i) => i.failureProbability !== undefined && i.failureProbability > 60)
        .sort((a, b) => (b.failureProbability ?? 0) - (a.failureProbability ?? 0));

      const highRiskAssets = highRiskInsights.map((insight) => {
        const plant = plants.find(p => p._id === insight.plantId);
        const asset = insight.assetId ? assets.find(a => a._id === insight.assetId) : null;

        return {
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
        };
      });

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
    }

    /* PHASE 3 QUERY IMPLEMENTATIONS */
    case "procurement:listVendors": {
      return mockDb.vendors;
    }

    case "procurement:listRequisitions": {
      let list = [...mockDb.purchaseRequisitions];
      if (args?.status) {
        list = list.filter((r) => r.status === args.status);
      }
      return list.map((r) => {
        const plant = mockDb.plants.find((p) => p._id === r.plantId);
        return {
          ...r,
          plantName: plant?.name ?? "Unknown Plant",
        };
      }).sort((a, b) => new Date(b.requiredDate).getTime() - new Date(a.requiredDate).getTime());
    }

    case "procurement:listPurchaseOrders": {
      let list = [...mockDb.purchaseOrders];
      if (args?.status) {
        list = list.filter((po) => po.status === args.status);
      }
      return list.map((po) => {
        const vendor = mockDb.vendors.find((v) => v._id === po.vendorId);
        return {
          ...po,
          vendorName: vendor?.name ?? "Unknown Vendor",
          vendorCategory: vendor?.category ?? "services",
        };
      });
    }

    case "inventory:listWarehouses": {
      return mockDb.warehouses;
    }

    case "inventory:listInventory": {
      let list = [...mockDb.inventoryItems];
      if (args?.warehouseId) {
        list = list.filter((i) => i.warehouseId === args.warehouseId);
      }
      if (args?.category) {
        list = list.filter((i) => i.category === args.category);
      }
      return list.map((item) => {
        const wh = mockDb.warehouses.find((w) => w._id === item.warehouseId);
        return {
          ...item,
          warehouseName: wh?.name ?? "Unknown Warehouse",
        };
      });
    }

    case "finance:listCostCenters": {
      return mockDb.costCenters;
    }

    case "finance:listInvoices": {
      const pos = mockDb.purchaseOrders;
      const invoices = [];
      for (const po of pos) {
        if (po.status === "delivered" || po.status === "invoiced" || po.status === "closed") {
          const vendor = mockDb.vendors.find((v) => v._id === po.vendorId);
          const status = po.status === "closed" ? "paid" : "unpaid";

          if (args?.status && status !== args.status) continue;

          invoices.push({
            _id: po._id,
            invoiceNumber: `INV-${po.poNumber.substring(3)}`,
            poNumber: po.poNumber,
            vendorName: vendor?.name ?? "Unknown Vendor",
            amount: po.totalCost,
            dueDate: new Date(Date.now() + 15 * 24 * 3600 * 1000).toISOString().split("T")[0],
            status,
            billingDetails: po.items.map((i: any) => `${i.partName} (x${i.quantity})`).join(", "),
          });
        }
      }
      return invoices;
    }

    case "erp:listJobs": {
      return mockDb.integrationJobs;
    }

    case "erp:listLogs": {
      return [...mockDb.integrationLogs]
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, args?.limit ?? 50);
    }

    case "procurement:listContracts": {
      return mockDb.contracts.map((c: any) => {
        const vendor = mockDb.vendors.find((v: any) => v._id === c.vendorId);
        return {
          ...c,
          vendorName: vendor?.name ?? "Unknown Vendor",
          vendorCategory: vendor?.category ?? "services",
        };
      });
    }

    case "finance:listPpaBillings": {
      return mockDb.ppaBillings.map((b: any) => {
        const plant = mockDb.plants.find((p: any) => p._id === b.plantId);
        return {
          ...b,
          plantName: plant?.name ?? "Unknown Plant",
          plantType: plant?.type ?? "solar",
        };
      });
    }

    case "inventory:listShipments": {
      return mockDb.shipments;
    }

    /* ── PHASE 4 QUERY CASES ── */
    case "intelligence:getInsightsSummary": {
      const allInsights = mockDb.aiInsights;
      const anomalies = allInsights.filter((i: any) => i.type === "anomaly");
      const risks = allInsights.filter((i: any) => i.type === "risk");
      const recommendations = allInsights.filter((i: any) => i.type === "recommendation");
      const predictions = allInsights.filter((i: any) => i.type === "prediction");
      return {
        total: allInsights.length,
        anomalies: anomalies.length,
        risks: risks.length,
        recommendations: recommendations.length,
        predictions: predictions.length,
        topInsights: allInsights.slice(0, 8),
        optimizations: phase4Data.optimizationRecommendations,
      };
    }

    case "intelligence:getOptimizationRecommendations": {
      let recs = [...phase4Data.optimizationRecommendations];
      if (args?.category) recs = recs.filter(r => r.category === args.category);
      return recs.sort((a, b) => b.priority - a.priority);
    }

    case "forecasting:list": {
      let fc = [...phase4Data.forecasts];
      if (args?.category) fc = fc.filter(f => f.category === args.category);
      return fc;
    }

    case "forecasting:getByCategory": {
      return phase4Data.forecasts.filter(f => f.category === (args?.category ?? "generation"));
    }

    case "digitalTwin:getPlantLayout": {
      const plant = mockDb.plants.find(p => p._id === args?.plantId) ?? mockDb.plants[0];
      const assets = mockDb.assets.filter(a => a.plantId === plant._id);
      const twAssets = assets.map((a, i) => ({
        _id: `dt_${a._id}`,
        plantId: plant._id,
        assetId: a._id,
        name: a.name,
        type: a.type,
        x: 10 + (i % 5) * 18,
        y: 15 + Math.floor(i / 5) * 22,
        healthScore: a.healthScore,
        temperature: 28 + Math.random() * 20,
        vibration: parseFloat((0.1 + Math.random() * 0.8).toFixed(2)),
        operatingHours: 12000 + Math.floor(Math.random() * 8000),
        lastMaintenance: "2026-05-15",
        nextMaintenance: "2026-11-20",
        children: [],
      }));
      return { plant, assets: twAssets };
    }

    case "esg:listSustainabilityMetrics": {
      let metrics = [...phase4Data.sustainabilityMetrics];
      if (args?.plantId) metrics = metrics.filter(m => m.plantId === args.plantId);
      if (args?.limit) metrics = metrics.slice(-args.limit);
      return metrics;
    }

    case "esg:listESGReports": {
      return [...phase4Data.esgReports].slice(args?.limit ? -args.limit : 0);
    }

    case "portfolio:listAnalytics": {
      let analytics = [...phase4Data.portfolioAnalytics];
      if (args?.period) analytics = analytics.filter(a => a.period === args.period);
      return analytics;
    }

    case "portfolio:listExecutiveKPIs": {
      let kpis = [...phase4Data.executiveKPIs];
      if (args?.limit) kpis = kpis.slice(-args.limit);
      return kpis;
    }

    case "portfolio:listBoardReports": {
      return [...phase4Data.boardReports];
    }

    case "copilot:listConversations": {
      return [...phase4Data.copilotConversations].sort((a, b) => a.timestamp - b.timestamp);
    }

    case "bi:getAnalyticsSummary": {
      const kpis = phase4Data.executiveKPIs;
      const latest = kpis[kpis.length - 1];
      const prior = kpis[kpis.length - 13] ?? kpis[0];
      return {
        latest,
        yoyRevenueGrowth: parseFloat(((latest.revenueUSD - prior.revenueUSD) / prior.revenueUSD * 100).toFixed(1)),
        yoyGenerationGrowth: parseFloat(((latest.totalGenerationMWh - prior.totalGenerationMWh) / prior.totalGenerationMWh * 100).toFixed(1)),
        monthlyKPIs: kpis.slice(-12),
        portfolioAnalytics: phase4Data.portfolioAnalytics,
      };
    }

    case "integrations:listConnectors": {
      return [...phase4Data.integrationConnectors];
    }

    case "integrations:listWorkflows": {
      return [...phase4Data.workflowAutomations];
    }

    default:
      return null;
  }
}

// Internal mutation engine matching server-side convex mutations
async function executeMutation(apiName: string, args: any): Promise<any> {
  const nowMs = Date.now();

  switch (apiName) {
    case "metrics:simulateLiveTelemetry": {
      const engineers = ["Sarah Connor", "John Doe", "Marcus Vance", "Elena Rostova", "Devon Cole"];
      const alarmTemplates = [
        { code: "INV_OVERHEAT", msg: "Inverter module internal temperature exceeded threshold (86°C)", sev: "critical" as const },
        { code: "XFMR_OIL_TEMP", msg: "Transformer oil temperature high warning", sev: "high" as const },
        { code: "COMM_LOSS", msg: "Communication loss with string tracker controller #14", sev: "medium" as const },
        { code: "TURB_YAW_FAIL", msg: "Wind turbine yaw adjustment failure", sev: "critical" as const },
        { code: "BATT_CELL_DEV", msg: "Battery rack cell voltage deviation warning", sev: "high" as const },
        { code: "MET_STN_OFFLINE", msg: "Weather station Pyranometer sensor unresponsive", sev: "low" as const },
      ];

      const currentHour = new Date(nowMs).getHours();
      let updates = 0;

      mockDb.plants.forEach((p) => {
        if (p.status === "offline") return;

        // Find metrics sorted by timestamp desc
        const pMetrics = mockDb.energyMetrics
          .filter((m) => m.plantId === p._id)
          .sort((a, b) => b.timestamp - a.timestamp);
        const latestMetric = pMetrics[0];

        const pWeather = mockDb.weather
          .filter((w) => w.plantId === p._id)
          .sort((a, b) => b.timestamp - a.timestamp);
        const latestWeather = pWeather[0];

        let powerOutput = latestMetric?.powerOutput ?? 0;
        let todayProduction = latestMetric?.todayProduction ?? 0;
        let stateOfCharge = latestMetric?.stateOfCharge ?? 0;
        let stateOfHealth = latestMetric?.stateOfHealth ?? p.healthScore;
        let gridImport = 0;
        let gridExport = 0;

        let temp = latestWeather?.temperature ?? 22;
        let windSpeed = latestWeather?.windSpeed ?? 6;
        let cloudCover = latestWeather?.cloudCover ?? 30;
        let irradiance = latestWeather?.irradiance ?? 0;

        temp += (Math.random() - 0.5) * 0.5;
        windSpeed = Math.max(0.2, windSpeed + (Math.random() - 0.5) * 1.5);
        cloudCover = Math.max(0, Math.min(100, cloudCover + (Math.random() - 0.5) * 6));

        if (p.type === "solar") {
          if (currentHour >= 6 && currentHour <= 18) {
            const sinScale = Math.sin(Math.PI * ((currentHour - 6) / 12));
            irradiance = sinScale * 950 * (1 - cloudCover / 160) + Math.random() * 30;
            powerOutput = (irradiance / 1000) * p.capacity * 0.96 * (p.healthScore / 100);
          } else {
            irradiance = 0;
            powerOutput = 0;
          }
          todayProduction += powerOutput * (15 / 3600); // 15 seconds integration
          gridExport = powerOutput;
        } else if (p.type === "wind") {
          irradiance = 0;
          if (windSpeed < 3.0 || windSpeed > 25.0) {
            powerOutput = 0;
          } else {
            powerOutput = ((windSpeed - 3) / 22) * p.capacity * 0.95 * (p.healthScore / 100);
          }
          todayProduction += powerOutput * (15 / 3600);
          gridExport = powerOutput;
        } else {
          // BESS charging/discharging
          let mode = "idle";
          if (currentHour >= 9 && currentHour <= 15) mode = "charge";
          else if (currentHour >= 16 && currentHour <= 21) mode = "discharge";
          else mode = Math.random() > 0.5 ? "charge" : "discharge";

          if (mode === "charge") {
            powerOutput = -p.capacity * 0.45 * (Math.random() * 0.4 + 0.6);
            stateOfCharge = Math.min(100, stateOfCharge + Math.abs(powerOutput) * (15 / 3600) * 0.92);
            gridImport = Math.abs(powerOutput);
          } else {
            powerOutput = p.capacity * 0.4 * (Math.random() * 0.4 + 0.6);
            stateOfCharge = Math.max(5, stateOfCharge - powerOutput * (15 / 3600));
            gridExport = powerOutput;
          }
          todayProduction += Math.abs(powerOutput) * (15 / 3600);
        }

        powerOutput = parseFloat(Math.min(p.capacity, Math.max(-p.capacity, powerOutput)).toFixed(2));
        todayProduction = parseFloat(todayProduction.toFixed(2));
        stateOfCharge = parseFloat(stateOfCharge.toFixed(1));
        temp = parseFloat(Math.min(50, Math.max(-5, temp)).toFixed(1));
        windSpeed = parseFloat(windSpeed.toFixed(1));

        const frequency = parseFloat((59.97 + Math.random() * 0.06).toFixed(3));
        const voltage = parseFloat((345000 + (Math.random() - 0.5) * 1500).toFixed(0));
        const current = parseFloat((Math.abs(powerOutput) * 1e6 / (voltage * Math.sqrt(3))).toFixed(1));

        mockDb.energyMetrics.push({
          _id: `metric_sim_${nowMs}_${p._id}`,
          plantId: p._id,
          timestamp: nowMs,
          powerOutput,
          todayProduction,
          stateOfCharge,
          stateOfHealth,
          frequency,
          gridImport,
          gridExport,
          efficiency: parseFloat((p.healthScore - 1 + Math.random() * 2).toFixed(1)),
          voltage,
          current,
        });

        mockDb.weather.push({
          _id: `weather_sim_${nowMs}_${p._id}`,
          plantId: p._id,
          timestamp: nowMs,
          temperature: temp,
          humidity: Math.floor(Math.max(10, Math.min(95, (latestWeather?.humidity ?? 50) + (Math.random() - 0.5) * 4))),
          windSpeed,
          cloudCover: Math.floor(cloudCover),
          irradiance: parseFloat(Math.max(0, irradiance).toFixed(0)),
          description: latestWeather?.description ?? "Clear",
        });

        // Slice history
        const updatedMetrics = mockDb.energyMetrics.filter((m) => m.plantId === p._id);
        if (updatedMetrics.length > 30) {
          const toDelete = updatedMetrics.sort((a, b) => a.timestamp - b.timestamp).slice(0, updatedMetrics.length - 24);
          mockDb.energyMetrics = mockDb.energyMetrics.filter(m => !toDelete.some(td => td._id === m._id));
        }

        const updatedWeather = mockDb.weather.filter((w) => w.plantId === p._id);
        if (updatedWeather.length > 30) {
          const toDelete = updatedWeather.sort((a, b) => a.timestamp - b.timestamp).slice(0, updatedWeather.length - 24);
          mockDb.weather = mockDb.weather.filter(w => !toDelete.some(td => td._id === w._id));
        }

        updates++;

        // Random Alarm trigger
        if (p.healthScore < 95 && Math.random() < 0.015) {
          const template = alarmTemplates[Math.floor(Math.random() * alarmTemplates.length)];
          const assets = mockDb.assets.filter(a => a.plantId === p._id);
          const asset = assets[Math.floor(Math.random() * assets.length)];

          const hasActive = mockDb.alarms.some(a => a.plantId === p._id && a.code === template.code && a.status === "active");
          if (!hasActive) {
            mockDb.alarms.push({
              _id: `alarm_sim_${nowMs}`,
              plantId: p._id,
              assetId: asset?._id,
              severity: template.sev,
              status: "active",
              code: template.code,
              message: `${asset ? asset.type.toUpperCase() + ": " : ""}${template.msg}`,
              timestamp: nowMs,
              assignedEngineer: engineers[Math.floor(Math.random() * engineers.length)],
            });

            mockDb.notifications.push({
              _id: `notif_sim_${nowMs}`,
              type: "alarm",
              title: `CRITICAL ALERT: ${p.name}`,
              message: template.msg,
              severity: template.sev,
              timestamp: nowMs,
              read: false,
            });

            mockDb.auditLogs.push({
              _id: `audit_sim_${nowMs}`,
              plantId: p._id,
              action: "ALARM_TRIGGER",
              details: `Alarm ${template.code} generated on asset ${asset?.name ?? "Substation"}.`,
              timestamp: nowMs,
              operator: "SCADA System Monitor",
            });
          }
        }
      });

      // Self-healing alarm resolution (3% chance)
      if (Math.random() < 0.03) {
        const activeAlarms = mockDb.alarms.filter(a => a.status === "active");
        if (activeAlarms.length > 0) {
          const alarm = activeAlarms[Math.floor(Math.random() * activeAlarms.length)];
          alarm.status = "resolved";
          alarm.resolvedAt = nowMs;

          mockDb.auditLogs.push({
            _id: `audit_sim_res_${nowMs}`,
            plantId: alarm.plantId,
            action: "ALARM_RESOLVE",
            details: `Alarm code ${alarm.code} resolved by automated self-healing controller.`,
            timestamp: nowMs,
            operator: "Auto-Scada Engine",
          });
        }
      }

      break;
    }

    case "alarms:acknowledge": {
      const alarm = mockDb.alarms.find((a) => a._id === args.alarmId);
      if (!alarm) throw new Error("Alarm not found");

      alarm.status = "acknowledged";
      alarm.assignedEngineer = args.engineerName;

      const plant = mockDb.plants.find((p) => p._id === alarm.plantId);
      mockDb.auditLogs.push({
        _id: `audit_ack_${nowMs}`,
        plantId: alarm.plantId,
        action: "ALARM_ACKNOWLEDGE",
        details: `Alarm ${alarm.code} acknowledged by ${args.engineerName} for plant ${plant?.name ?? "Unknown"}.`,
        timestamp: nowMs,
        operator: args.engineerName,
      });
      break;
    }

    case "alarms:resolve": {
      const alarm = mockDb.alarms.find((a) => a._id === args.alarmId);
      if (!alarm) throw new Error("Alarm not found");

      alarm.status = "resolved";
      alarm.resolvedAt = nowMs;
      alarm.assignedEngineer = args.engineerName;

      const plant = mockDb.plants.find((p) => p._id === alarm.plantId);
      mockDb.auditLogs.push({
        _id: `audit_res_${nowMs}`,
        plantId: alarm.plantId,
        action: "ALARM_RESOLVE",
        details: `Alarm ${alarm.code} marked as resolved by ${args.engineerName} for plant ${plant?.name ?? "Unknown"}.`,
        timestamp: nowMs,
        operator: args.engineerName,
      });
      break;
    }

    case "maintenance:create": {
      const taskId = `maint_create_${nowMs}`;
      mockDb.maintenance.push({
        _id: taskId,
        plantId: args.plantId,
        assetId: args.assetId,
        type: args.type,
        description: args.description,
        status: "scheduled",
        scheduledDate: args.scheduledDate,
        engineer: args.engineer,
      });

      const plant = mockDb.plants.find((p) => p._id === args.plantId);
      mockDb.notifications.push({
        _id: `notif_maint_${nowMs}`,
        type: "maintenance",
        title: "New Maintenance Scheduled",
        message: `Task scheduled for plant: ${plant?.name ?? "Unknown"}. Specialist: ${args.engineer}`,
        severity: "low",
        timestamp: nowMs,
        read: false,
      });

      mockDb.auditLogs.push({
        _id: `audit_maint_${nowMs}`,
        plantId: args.plantId,
        action: "MAINTENANCE_SCHEDULE",
        details: `Scheduled ${args.type} maintenance: "${args.description}"`,
        timestamp: nowMs,
        operator: "Operations Scheduler",
      });

      return taskId;
    }

    case "maintenance:complete": {
      const task = mockDb.maintenance.find((t) => t._id === args.taskId);
      if (!task) throw new Error("Maintenance task not found");

      task.status = "completed";
      task.completedDate = new Date().toISOString().split("T")[0];

      const asset = mockDb.assets.find((a) => a._id === task.assetId);
      if (asset) {
        asset.status = "online";
        asset.healthScore = Math.min(100, asset.healthScore + 20);
      }

      mockDb.auditLogs.push({
        _id: `audit_maint_comp_${nowMs}`,
        plantId: task.plantId,
        action: "MAINTENANCE_COMPLETE",
        details: `Completed maintenance task on asset ${asset?.name ?? "Unknown"}. Specialist: ${args.engineer}. Notes: ${args.notes ?? "None"}`,
        timestamp: nowMs,
        operator: args.engineer,
      });
      break;
    }

    case "alarms:markNotificationRead": {
      const notif = mockDb.notifications.find((n) => n._id === args.notificationId);
      if (notif) notif.read = true;
      break;
    }

    case "alarms:markAllNotificationsRead": {
      mockDb.notifications.forEach((n) => (n.read = true));
      break;
    }

    /* PHASE 2 MUTATION IMPLEMENTATIONS */
    case "inspections:submit": {
      const nowStr = new Date().toISOString().split("T")[0];
      let resultId;
      if (args.inspectionId) {
        const insp = mockDb.inspections.find(i => i._id === args.inspectionId);
        if (insp) {
          insp.status = "completed";
          insp.checklist = args.checklist;
          insp.inspector = args.inspector;
          insp.completedDate = nowStr;
          insp.findings = args.findings;
          insp.recommendations = args.recommendations;
          insp.signature = args.signature;
        }
        resultId = args.inspectionId;
      } else {
        resultId = `insp_${Date.now()}`;
        mockDb.inspections.push({
          _id: resultId,
          plantId: args.plantId,
          assetId: args.assetId,
          templateId: args.templateId,
          inspector: args.inspector,
          checklist: args.checklist,
          status: "completed",
          scheduledDate: nowStr,
          completedDate: nowStr,
          findings: args.findings,
          recommendations: args.recommendations,
          signature: args.signature,
        });
      }

      const asset = mockDb.assets.find(a => a._id === args.assetId);
      const failItemsCount = args.checklist.filter((c: any) => !c.checked).length;
      if (asset && failItemsCount > 0) {
        asset.healthScore = parseFloat(Math.max(20, asset.healthScore - failItemsCount * 12).toFixed(1));
        asset.status = "maintenance";

        mockDb.alarms.push({
          _id: `alarm_${Date.now()}`,
          plantId: args.plantId,
          assetId: args.assetId,
          severity: "high",
          status: "active",
          code: "INSP_FAIL_ALERT",
          message: `Asset failed ${failItemsCount} points in checklist inspection. Findings: ${args.findings}`,
          timestamp: Date.now(),
        });
      }

      mockDb.auditLogs.push({
        _id: `audit_${Date.now()}`,
        plantId: args.plantId,
        action: "INSPECTION_SUBMIT",
        details: `Field inspection checklist completed for asset ${asset?.name ?? "Unknown"} by inspector ${args.inspector}.`,
        timestamp: Date.now(),
        operator: args.inspector,
      });

      break;
    }

    case "workOrders:create": {
      const woId = `wo_${Date.now()}`;
      let status: "open" | "assigned" | "waiting_parts" = args.assignedTechnician ? "assigned" : "open";

      // Phase 3 automatic reordering check
      let selectedPartCode = "";
      let partCost = 0;
      let partName = "";
      if (args.title.toLowerCase().includes("fuse") || args.description.toLowerCase().includes("fuse")) {
        selectedPartCode = "INV-FUSE-300"; partName = "300A Substation Inverter Fuse"; partCost = 120;
      } else if (args.title.toLowerCase().includes("filter") || args.description.toLowerCase().includes("filter")) {
        selectedPartCode = "BESS-FLTR-88"; partName = "Cooling Fan Air Filter Panel"; partCost = 45;
      } else if (args.title.toLowerCase().includes("seal") || args.description.toLowerCase().includes("seal")) {
        selectedPartCode = "XFMR-SEAL-01"; partName = "Substation Sub-transformer Seal Ring"; partCost = 85;
      } else if (args.title.toLowerCase().includes("bearing") || args.description.toLowerCase().includes("bearing") || args.title.toLowerCase().includes("yaw")) {
        selectedPartCode = "TURB-BRNG-99"; partName = "Wind Yaw Pinion Drive Bearing"; partCost = 450;
      } else if (args.title.toLowerCase().includes("motor") || args.description.toLowerCase().includes("motor") || args.title.toLowerCase().includes("hvac")) {
        selectedPartCode = "BESS-MOTR-45"; partName = "BESS HVAC Exchanger Pump Motor"; partCost = 350;
      }

      const spareParts = selectedPartCode ? [{
        partCode: selectedPartCode,
        name: partName,
        quantity: 1,
        cost: partCost
      }] : [];

      if (selectedPartCode) {
        // Check warehouse items
        const whItem = mockDb.inventoryItems.find(iv => iv.partCode === selectedPartCode);
        if (whItem && whItem.quantity - whItem.reserved < 1) {
          // insufficient stock! lock wo and auto-generate purchase requisition
          status = "waiting_parts";

          // create PR
          const prId = `pr_${Date.now()}`;
          mockDb.purchaseRequisitions.push({
            _id: prId,
            plantId: args.plantId,
            workOrderId: woId,
            title: `Auto parts replenishment - WO lock on ${args.title}`,
            requestedBy: "Automated Maintenance Dispatch Scheduler",
            status: "pending_approval",
            requiredDate: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString().split("T")[0],
            estimatedCost: partCost,
            items: [{ partName, partCode: selectedPartCode, quantity: 5, cost: partCost }]
          });

          // notify
          mockDb.notifications.push({
            _id: `notif_pr_${Date.now()}`,
            type: "maintenance",
            title: "WO LOCK: PR AUTO-GENERATED",
            message: `Work Order ${args.title} locked on WAITING_PARTS. Auto-triggered PR for ${partName}`,
            severity: "high",
            timestamp: Date.now(),
            read: false
          });
        } else if (whItem) {
          // reserve stock
          whItem.reserved++;
        }
      }

      mockDb.workOrders.push({
        _id: woId,
        plantId: args.plantId,
        assetId: args.assetId,
        type: args.type,
        title: args.title,
        description: args.description,
        priority: args.priority,
        status,
        assignedTechnician: args.assignedTechnician,
        scheduledDate: args.scheduledDate,
        estimatedHours: args.estimatedHours,
        downtimeHours: 0,
        materialsCost: 0,
        laborCost: 0,
        spareParts,
      });

      const plant = mockDb.plants.find(p => p._id === args.plantId);
      mockDb.notifications.push({
        _id: `notif_${Date.now()}`,
        type: "maintenance",
        title: `NEW WORK ORDER: ${args.title}`,
        message: `Work order dispatched for plant ${plant?.name ?? "Unknown"}. Status: ${status.toUpperCase()}`,
        severity: args.priority === "critical" ? "critical" : args.priority === "high" ? "high" : "low",
        timestamp: Date.now(),
        read: false,
      });

      mockDb.auditLogs.push({
        _id: `audit_${Date.now()}`,
        plantId: args.plantId,
        action: "WO_CREATE",
        details: `Work order "${args.title}" created with status ${status}.`,
        timestamp: Date.now(),
        operator: "Operations Center Manager",
      });

      if (args.assignedTechnician && status !== "waiting_parts") {
        const tech = mockDb.technicians.find(t => t.name === args.assignedTechnician);
        if (tech) {
          tech.workload++;
          tech.status = "dispatched";
        }
      }

      return woId;
    }

    case "workOrders:updateStatus": {
      const wo = mockDb.workOrders.find(w => w._id === args.woId);
      if (!wo) throw new Error("Work order not found");

      const oldStatus = wo.status;
      const oldTech = wo.assignedTechnician;

      if (args.status !== undefined) wo.status = args.status;
      if (args.assignedTechnician !== undefined) wo.assignedTechnician = args.assignedTechnician;
      if (args.actualHours !== undefined) wo.actualHours = args.actualHours;
      if (args.laborCost !== undefined) wo.laborCost = args.laborCost;
      if (args.materialsCost !== undefined) wo.materialsCost = args.materialsCost;
      if (args.downtimeHours !== undefined) wo.downtimeHours = args.downtimeHours;
      if (args.spareParts !== undefined) {
        wo.spareParts = args.spareParts.map((sp: any) => ({
          partCode: sp.partCode || "SP-MOCK",
          partName: sp.name,
          quantity: sp.quantity,
          cost: sp.cost
        }));
      }
      if (args.status === "completed" || args.status === "closed") {
        wo.completedDate = new Date().toISOString().split("T")[0];
      }

      // Workload balancing
      if (oldTech && oldTech !== wo.assignedTechnician) {
        const t = mockDb.technicians.find(tc => tc.name === oldTech);
        if (t) t.workload = Math.max(0, t.workload - 1);
      }
      if (wo.assignedTechnician && oldTech !== wo.assignedTechnician) {
        const t = mockDb.technicians.find(tc => tc.name === wo.assignedTechnician);
        if (t) {
          t.workload++;
          t.status = "dispatched";
        }
      }
      if ((args.status === "completed" || args.status === "closed") && wo.assignedTechnician) {
        const t = mockDb.technicians.find(tc => tc.name === wo.assignedTechnician);
        if (t) {
          t.workload = Math.max(0, t.workload - 1);
          if (t.workload === 0) t.status = "active";
        }

        // Restore asset health
        const asset = mockDb.assets.find(a => a._id === wo.assetId);
        if (asset) {
          asset.status = "online";
          asset.healthScore = Math.min(100, asset.healthScore + 25);

          // Auto-resolve alarms
          mockDb.alarms.forEach(al => {
            if (al.assetId === wo.assetId && al.status === "active") {
              al.status = "resolved";
              al.resolvedAt = Date.now();
              al.assignedEngineer = wo.assignedTechnician;
            }
          });
        }

        // Consume reserved spare parts from inventory
        if (wo.spareParts && wo.spareParts.length > 0) {
          for (const sp of wo.spareParts) {
            const whItem = mockDb.inventoryItems.find(iv => iv.partCode === sp.partCode);
            if (whItem) {
              whItem.quantity = Math.max(0, whItem.quantity - sp.quantity);
              whItem.reserved = Math.max(0, whItem.reserved - sp.quantity);
            }
          }
        }
      }

      mockDb.auditLogs.push({
        _id: `audit_${Date.now()}`,
        plantId: wo.plantId,
        action: "WO_STATUS_CHANGE",
        details: `Work order "${wo.title}" status changed from ${oldStatus} to ${args.status}.`,
        timestamp: Date.now(),
        operator: wo.assignedTechnician ?? "Operations Manager",
      });

      break;
    }

    /* PHASE 3 MUTATION IMPLEMENTATIONS */
    case "procurement:approveRequisition": {
      const pr = mockDb.purchaseRequisitions.find((r) => r._id === args.prId);
      if (!pr) throw new Error("Purchase Requisition not found");

      const status = args.approved ? "approved" : "rejected";
      pr.status = status;

      mockDb.auditLogs.push({
        _id: `audit_${Date.now()}`,
        plantId: pr.plantId,
        action: "PR_APPROVAL",
        details: `Purchase Requisition "${pr.title}" approved: ${args.approved}. Approver: ${args.approver}`,
        timestamp: Date.now(),
        operator: args.approver,
      });

      if (args.approved) {
        const vendors = mockDb.vendors;
        const firstItem = pr.items[0];
        let category: "panels" | "turbines" | "batteries" | "logistics" | "services" = "services";

        if (firstItem?.partCode.startsWith("INV") || firstItem?.partCode.startsWith("SO")) category = "panels";
        else if (firstItem?.partCode.startsWith("WN") || firstItem?.partCode.startsWith("TURB")) category = "turbines";
        else if (firstItem?.partCode.startsWith("BESS") || firstItem?.partCode.startsWith("BS")) category = "batteries";

        const matchedVendors = vendors.filter((v) => v.category === category);
        const selectedVendor = matchedVendors.sort((a, b) => b.qualityRating - a.qualityRating)[0] ?? vendors[0];

        if (selectedVendor) {
          const poNumber = `PO-2026-${Math.floor(1000 + Math.random() * 9000)}`;
          mockDb.purchaseOrders.push({
            _id: `po_${Date.now()}`,
            prId: pr._id,
            vendorId: selectedVendor._id,
            poNumber,
            status: "sent",
            totalCost: pr.estimatedCost,
            items: pr.items,
            scheduledDeliveryDate: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString().split("T")[0],
          });
          pr.status = "ordered";
        }
      }

      break;
    }

    case "procurement:receiveGoods": {
      const po = mockDb.purchaseOrders.find((p) => p._id === args.poId);
      if (!po) throw new Error("Purchase Order not found");

      po.status = "delivered";
      po.deliveredDate = new Date().toISOString().split("T")[0];

      for (const item of po.items) {
        const invItem = mockDb.inventoryItems.find((iv) => iv.warehouseId === args.warehouseId && iv.partCode === item.partCode);
        if (invItem) {
          invItem.quantity += item.quantity;
        } else {
          let category: "mechanical" | "electrical" | "consumables" = "consumables";
          if (item.partCode.startsWith("WN") || item.partCode.startsWith("TURB")) category = "mechanical";
          else if (item.partCode.startsWith("INV") || item.partCode.startsWith("BESS")) category = "electrical";

          mockDb.inventoryItems.push({
            _id: `inv_${Date.now()}_${item.partCode}`,
            warehouseId: args.warehouseId,
            partName: item.partName,
            partCode: item.partCode,
            category,
            quantity: item.quantity,
            reserved: 0,
            minStock: 2,
            maxStock: 20,
            unitCost: item.cost,
            binLocation: `${String.fromCharCode(65 + Math.floor(Math.random() * 6))}-${Math.floor(1 + Math.random() * 15)}`,
          });
        }
      }

      mockDb.auditLogs.push({
        _id: `audit_${Date.now()}`,
        action: "GOODS_RECEIPT",
        details: `Goods Receipt Note (GRN) created for ${po.poNumber}.`,
        timestamp: Date.now(),
        operator: args.receiver,
      });

      if (po.prId) {
        const pr = mockDb.purchaseRequisitions.find((r) => r._id === po.prId);
        if (pr?.workOrderId) {
          const wo = mockDb.workOrders.find((w) => w._id === pr.workOrderId);
          if (wo && wo.status === "waiting_parts") {
            wo.status = "assigned";

            mockDb.auditLogs.push({
              _id: `audit_${Date.now()}_unlock`,
              plantId: wo.plantId,
              action: "WO_UNLOCK",
              details: `Work order "${wo.title}" unlocked as needed spares were received.`,
              timestamp: Date.now(),
              operator: "Auto ERP Sync Link",
            });
          }
        }
      }

      break;
    }

    case "inventory:adjustStock": {
      const item = mockDb.inventoryItems.find((i) => i._id === args.itemId);
      if (!item) throw new Error("Inventory item not found");

      item.quantity = Math.max(0, item.quantity + args.adjustment);

      mockDb.auditLogs.push({
        _id: `audit_${Date.now()}`,
        action: "STOCK_ADJUST",
        details: `Stock adjusted: ${args.adjustment > 0 ? "+" : ""}${args.adjustment} units for ${item.partName}.`,
        timestamp: Date.now(),
        operator: args.operator,
      });

      break;
    }

    case "finance:payInvoice": {
      const po = mockDb.purchaseOrders.find((p) => p._id === args.poId);
      if (!po) throw new Error("PO not found");

      po.status = "closed";

      let code = "CC-CORP-00";
      const pr = po.prId ? mockDb.purchaseRequisitions.find((r) => r._id === po.prId) : null;
      if (pr) {
        const plant = mockDb.plants.find((p) => p._id === pr.plantId);
        if (plant?.type === "solar") code = "CC-SOL-01";
        else if (plant?.type === "wind") code = "CC-WND-02";
        else if (plant?.type === "bess") code = "CC-BES-03";
      }

      const cc = mockDb.costCenters.find((c) => c.code === code);
      if (cc) cc.spentBudget += po.totalCost;

      mockDb.auditLogs.push({
        _id: `audit_${Date.now()}`,
        action: "INVOICE_PAYMENT",
        details: `Paid invoice for PO ${po.poNumber} for $${po.totalCost}. Cost Center: ${code}`,
        timestamp: Date.now(),
        operator: args.operator,
      });

      break;
    }

    case "erp:triggerSync": {
      const timestamp = Date.now();
      const count = Math.floor(5 + Math.random() * 25);
      const job = mockDb.integrationJobs.find((j) => j.system === args.system && j.jobType === args.jobType);

      if (job) {
        job.status = "success";
        job.lastRun = timestamp;
        job.recordsSynced = count;
      }

      mockDb.integrationLogs.push({
        _id: `log_${Date.now()}`,
        jobId: job?._id,
        timestamp,
        level: "info",
        message: `Synchronized ${count} records with external ${args.system.toUpperCase()} system.`,
      });

      mockDb.auditLogs.push({
        _id: `audit_${Date.now()}`,
        action: "ERP_SYNC",
        details: `Sync triggered for ${args.system.toUpperCase()} (${args.jobType}).`,
        timestamp,
        operator: args.operator,
      });

      break;
    }

    case "copilot:sendMessage": {
      const userMsg = args?.content ?? "";
      let response = "";

      const apiKey = (import.meta as any).env.VITE_MISTRAL_API_KEY;
      if (apiKey) {
        try {
          const plantsCtx = mockDb.plants.map(p => ({ name: p.name, type: p.type, capacity: p.capacity, health: p.healthScore, status: p.status }));
          const financeCtx = mockDb.costCenters.map(cc => ({ name: cc.name, code: cc.code, budget: cc.allocatedBudget, spent: cc.spentBudget }));
          const alarmCtx = mockDb.alarms.filter(a => a.status === "active").map(a => ({ code: a.code, severity: a.severity, message: a.message }));

          const systemMsg = `You are Aetheris AI Executive Copilot. Answer user queries based on this real-time data:
- Portfolio Capacity: 1.24 GW
- Plants: ${JSON.stringify(plantsCtx)}
- Finance Cost Centers: ${JSON.stringify(financeCtx)}
- Active Alarms: ${JSON.stringify(alarmCtx)}

Answer concisely and professionally. Focus on executive-level metrics and recommendations. Use **bold** for key terms and metrics.`;

          const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
              model: "mistral-large-latest",
              messages: [
                { role: "system", content: systemMsg },
                { role: "user", content: userMsg }
              ]
            })
          });
          const data = await res.json();
          response = data.choices?.[0]?.message?.content || "";
        } catch (err) {
          console.error("Mistral API error in Copilot:", err);
        }
      }

      if (!response) {
        const promptMap: Record<string, string> = {
          "Which plants have the highest operational risk?": "Based on real-time telemetry and AI anomaly detection, **Gulf Coast BESS Station** (Risk Score: 82/100) and **High Plains Wind Farm** (Risk Score: 76/100) are the highest-risk assets today. Key factors: battery thermal runaway probability at Gulf Coast (34%), and blade erosion on turbines B-05 through B-09 at High Plains.",
          "Predict maintenance costs for the next quarter.": "Q4 2026 maintenance forecast: **$2.91M** (±9%). Breakdown: Turbine servicing $1.12M, Solar inverter PM $480K, BESS battery refresh $620K, Emergency contingency $710K. Recommend pre-ordering IGBT modules now to avoid 6-week lead times.",
          "Compare procurement efficiency across all regions.": "West Region (Mojave, Sonora): avg PO cycle 18 days, 94% on-time delivery. Central Region (High Plains, Panhandle): avg PO cycle 23 days, 88% on-time. Gulf Region: avg PO cycle 21 days, 91% on-time. **Recommendation**: Adopt West Region vendor shortlist for Central and Gulf procurement.",
          "Which assets should be replaced within the next 6 months?": "Priority replacement list: 1) Turbine B-07 (RUL: 42d), 2) Inverter INV-04 (RUL: 78d), 3) Battery BMS-12 (RUL: 95d), 4) Transformer TR-03 (RUL: 140d). Total replacement CAPEX: **$1.86M**. Initiate RFQ immediately.",
          "Summarize executive KPIs for today's operations.": "**Today's Portfolio Pulse** 📊 Generation: 14,871 MWh (+3.2%) | Uptime: 97.4% ✅ | Revenue run rate: $9.42M/mo | CO₂ avoided: 5,740 t | Active alarms: 6 | Open work orders: 12. All metrics above quarterly targets. ESG score 88.4 — platform record.",
          "Identify procurement bottlenecks.": "3 procurement bottlenecks identified: 1) IGBT module supplier lead time increased to 9 weeks (was 6), 2) Blade erosion coating approval pending legal review (14 days overdue), 3) Gulf Coast warehouse at 74% capacity — no dock space for incoming shipments. Recommend: Qualify secondary IGBT supplier and expedite legal review.",
          "Generate a board-level operational summary.": "**Q2 2026 Board Summary**: Revenue $30.1M (+11.2% YoY) | EBITDA $15.8M (52.5% margin) | Fleet capacity 1,247 MW | ESG score 88.4 | CO₂ avoided 58,200 tonnes | Safety incidents: 0. Three strategic priorities for H2: AI-driven O&M expansion, BESS capacity augmentation, and green hydrogen pilot at Gulf Coast.",
          "Recommend actions to improve plant efficiency.": "Top 5 efficiency actions: 1) Deploy BESS AI dispatch optimization (+7-9% revenue, $640K/yr) 2) Turbine blade cleaning schedule optimization (+2.1% yield) 3) Cross-train 12 technicians for multi-site capability (-30% outsourcing) 4) Consolidate regional inspections (-34% logistics cost) 5) Dynamic safety stock model (-22% inventory cost).",
        };
        for (const [key, val] of Object.entries(promptMap)) {
          if (userMsg.toLowerCase().includes(key.split(" ").slice(0, 3).join(" ").toLowerCase())) {
            response = val;
            break;
          }
        }
        if (!response) {
          response = "I've analyzed the current operational data across all 5 renewable energy plants, 1,247 MW of capacity, and enterprise ERP systems. Based on real-time SCADA telemetry, maintenance records, and financial data: portfolio is performing at 97.4% uptime with $9.42M monthly revenue run rate. ESG score of 88.4 is highest on record. 6 active alarms require attention, with Gulf Coast BESS flagged as highest priority. Recommend reviewing the AI Intelligence Center for full anomaly breakdown.";
        }
      }

      phase4Data.copilotConversations.push({
        _id: `conv_${Date.now()}_u`, sessionId: args?.sessionId ?? "sess_new",
        timestamp: Date.now(), role: "user", content: userMsg,
      });
      phase4Data.copilotConversations.push({
        _id: `conv_${Date.now()}_a`, sessionId: args?.sessionId ?? "sess_new",
        timestamp: Date.now() + 100, role: "assistant", content: response,
        dataUsed: ["energyMetrics", "alarms", "aiInsights", "workOrders", "forecasts"],
      });
      break;
    }

    case "integrations:toggleWorkflow": {
      const wf = phase4Data.workflowAutomations.find(w => w._id === args?.id);
      if (wf) {
        wf.status = wf.status === "active" ? "paused" : "active";
      }
      break;
    }

    default:
      break;
  }

  // Trigger reactive updates across hooks
  mockDb.notify();
  return { success: true };
}

// Custom React hooks replicating real Convex behavior reactively
export function useQuery(apiName: string, args?: any) {
  const [data, setData] = useState<any>(() => executeQuery(apiName, args));

  useEffect(() => {
    setData(executeQuery(apiName, args));

    const unsubscribe = mockDb.subscribe(() => {
      setData(executeQuery(apiName, args));
    });
    return () => {
      unsubscribe();
    };
  }, [apiName, JSON.stringify(args)]);

  return data;
}

export function useMutation(apiName: string) {
  const mutate = async (args?: any) => {
    return await executeMutation(apiName, args);
  };

  return mutate;
}
