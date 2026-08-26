import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  organizations: defineTable({
    name: v.string(),
    industry: v.string(), // "maritime" | "energy" | "manufacturing" | "logistics"
  }),
  
  users: defineTable({
    name: v.string(),
    role: v.string(),
    email: v.string(),
    organizationId: v.string(),
  }),

  // Multi-Sector Assets (Manufacturing, Logistics, Maritime, Energy)
  assets: defineTable({
    organizationId: v.string(),
    industry: v.string(),
    name: v.string(),
    type: v.string(), // Vessel, Transformer, CNC Machine, Warehouse
    status: v.string(), // "healthy" | "warning" | "offline"
    healthScore: v.number(), // 0 to 100
    failureRisk: v.number(), // 0 to 100
    location: v.string(),
    criticality: v.string(), // "Critical" | "High" | "Medium" | "Low"
    lastMaintenance: v.string(),
    nextMaintenance: v.string(),
    details: v.any(), // JSON details for industry specific values
  }),

  assetEvents: defineTable({
    assetId: v.string(),
    timestamp: v.string(),
    type: v.string(), // Warning, Alert, Event
    title: v.string(),
    description: v.string(),
    severity: v.string(), // "Critical" | "High" | "Medium" | "Low"
  }),

  // Energy & Utility Plants (Solar, Wind, BESS, Hydro)
  plants: defineTable({
    name: v.string(),
    type: v.string(), // "solar" | "wind" | "bess"
    location: v.string(),
    latitude: v.number(),
    longitude: v.number(),
    capacity: v.number(), // MW
    status: v.string(), // "online" | "offline" | "maintenance"
    commissioningDate: v.string(),
    owner: v.string(),
    healthScore: v.number(),
  }),

  // Real-time SCADA Energy Telemetry
  energyMetrics: defineTable({
    plantId: v.string(),
    timestamp: v.number(),
    powerOutput: v.number(),
    todayProduction: v.number(),
    stateOfCharge: v.number(),
    stateOfHealth: v.number(),
    frequency: v.number(),
    gridImport: v.number(),
    gridExport: v.number(),
    efficiency: v.number(),
    voltage: v.number(),
    current: v.number(),
  }),

  weather: defineTable({
    plantId: v.string(),
    timestamp: v.number(),
    temperature: v.number(),
    humidity: v.number(),
    windSpeed: v.number(),
    cloudCover: v.number(),
    irradiance: v.number(),
    description: v.string(),
  }),

  alarms: defineTable({
    plantId: v.string(),
    assetId: v.optional(v.string()),
    severity: v.string(), // "critical" | "high" | "medium" | "low"
    status: v.string(), // "active" | "acknowledged" | "resolved"
    code: v.string(),
    message: v.string(),
    timestamp: v.number(),
    resolvedAt: v.optional(v.number()),
    assignedEngineer: v.optional(v.string()),
  }),

  workOrders: defineTable({
    organizationId: v.string(),
    industry: v.string(),
    assetId: v.string(),
    title: v.string(),
    priority: v.string(), // "Critical" | "High" | "Medium" | "Low"
    status: v.string(), // "New" | "Planned" | "Assigned" | "In Progress" | "Blocked" | "Completed" | "Verified" | "Closed"
    assignedTeam: v.string(),
    assignedPerson: v.string(),
    createdDate: v.string(),
    dueDate: v.string(),
    estimatedDuration: v.string(),
    requiredParts: v.array(v.object({
      partId: v.string(),
      quantity: v.number()
    })),
    notes: v.string(),
  }),

  maintenancePlans: defineTable({
    organizationId: v.string(),
    industry: v.string(),
    assetId: v.string(),
    type: v.string(), // "Preventive" | "Corrective" | "Scheduled" | "Emergency"
    title: v.string(),
    frequency: v.string(),
    nextScheduledDate: v.string(),
  }),

  inventoryItems: defineTable({
    organizationId: v.string(),
    industry: v.string(),
    partId: v.string(), // SKU e.g. BR-440
    name: v.string(),
    category: v.string(),
    stock: v.number(),
    reserved: v.number(),
    reorderLevel: v.number(),
    location: v.string(),
    supplierId: v.string(),
    leadTimeDays: v.number(),
  }),

  suppliers: defineTable({
    organizationId: v.string(),
    name: v.string(),
    category: v.string(),
    ontimeDeliveryRate: v.number(), // 0 to 100
    qualityScore: v.number(), // 0 to 100
    riskLevel: v.string(), // "High" | "Medium" | "Low"
    leadTimeDays: v.number(),
  }),

  complianceRecords: defineTable({
    organizationId: v.string(),
    industry: v.string(),
    assetId: v.optional(v.string()),
    title: v.string(),
    authority: v.string(),
    expiryDate: v.string(),
    status: v.string(), // "Valid" | "Expiring" | "Expired"
  }),

  notifications: defineTable({
    organizationId: v.string(),
    title: v.string(),
    message: v.string(),
    severity: v.string(),
    timestamp: v.string(),
    read: v.boolean(),
  }),

  aiInsights: defineTable({
    organizationId: v.string(),
    industry: v.string(),
    type: v.string(), // "risk" | "supply" | "operational"
    title: v.string(),
    severity: v.string(),
    targetEntity: v.string(), // e.g. "Transformer TX-204"
    detail: v.string(),
    recommendation: v.string(),
    resolved: v.boolean(),
  }),

  // Maritime Telemetry
  maritimeVessels: defineTable({
    name: v.string(),
    imo: v.string(),
    type: v.string(),
    flag: v.string(),
    dwt: v.number(),
    status: v.string(),
    speedKnots: v.number(),
    lat: v.number(),
    lng: v.number(),
    origin: v.string(),
    destination: v.string(),
    eta: v.string(),
    fuelEfficiencyScore: v.number(),
    ciiRating: v.string(),
    cargo: v.string(),
  }),

  maritimeSafety: defineTable({
    vesselId: v.string(),
    title: v.string(),
    category: v.string(),
    severity: v.string(),
    status: v.string(),
    findingDate: v.string(),
    targetResolutionDate: v.string(),
  }),

  maritimeBunkerLogs: defineTable({
    vesselId: v.string(),
    mgoROBMetricTons: v.number(),
    hfoROBMetricTons: v.number(),
    lastBunkeringPort: v.string(),
    lastBunkeringDate: v.string(),
    bunkerSupplier: v.string(),
    sulfurContentPercent: v.number(),
    consumptionDailyMT: v.number(),
  }),

  // Homepage Live Operations Telemetry Ticker
  homepageSignals: defineTable({
    businessHealth: v.object({
      operations: v.number(),
      supplyChain: v.number(),
      finance: v.number(),
      procurement: v.number(),
    }),
    aiSignals: v.array(v.object({
      label: v.string(),
      val: v.string(),
      severity: v.string(),
    })),
    telemetryJitter: v.object({
      gridLoadMW: v.number(),
      frequencyHz: v.number(),
      uptimePercent: v.number(),
    })
  }),

  // Industry-Wise Chatbot Conversation History
  chatHistory: defineTable({
    industry: v.string(), // "home" | "energy" | "maritime" | "manufacturing" | "logistics"
    sessionId: v.optional(v.string()),
    sender: v.string(), // "user" | "bot"
    text: v.string(),
    timestamp: v.string(),
    provider: v.optional(v.string()),
    suggestedAction: v.optional(
      v.object({
        type: v.string(),
        label: v.string(),
        payload: v.optional(v.record(v.string(), v.string())),
      })
    ),
  })
    .index("by_industry", ["industry"])
    .index("by_industry_and_timestamp", ["industry", "timestamp"])
});
