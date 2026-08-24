import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  plants: defineTable({
    name: v.string(),
    type: v.union(v.literal("solar"), v.literal("wind"), v.literal("bess")),
    location: v.string(),
    latitude: v.float64(),
    longitude: v.float64(),
    capacity: v.float64(), // MW
    status: v.union(v.literal("online"), v.literal("offline"), v.literal("maintenance")),
    commissioningDate: v.string(),
    owner: v.string(),
    healthScore: v.float64(), // 0 - 100
  })
    .index("by_type", ["type"])
    .index("by_status", ["status"]),

  assets: defineTable({
    plantId: v.id("plants"),
    name: v.string(),
    type: v.union(
      v.literal("panel"),
      v.literal("inverter"),
      v.literal("transformer"),
      v.literal("turbine"),
      v.literal("battery"),
      v.literal("sensor")
    ),
    status: v.union(v.literal("online"), v.literal("offline"), v.literal("maintenance")),
    healthScore: v.float64(),
    manufacturer: v.string(),
    serialNumber: v.string(),
    installationDate: v.string(),
    warrantyExpiry: v.string(),
  })
    .index("by_plant", ["plantId"])
    .index("by_type", ["type"])
    .index("by_status", ["status"])
    .index("by_plant_and_type", ["plantId", "type"]),

  energyMetrics: defineTable({
    plantId: v.id("plants"),
    timestamp: v.float64(), // Unix timestamp (ms)
    powerOutput: v.float64(), // Current power generation in MW
    todayProduction: v.float64(), // Production in MWh
    stateOfCharge: v.float64(), // For BESS (0 - 100)
    stateOfHealth: v.float64(), // For BESS (0 - 100)
    frequency: v.float64(), // Grid frequency (Hz)
    gridImport: v.float64(), // Grid import power in MW
    gridExport: v.float64(), // Grid export power in MW
    efficiency: v.float64(), // System efficiency (%)
    voltage: v.float64(), // System AC/DC voltage (V)
    current: v.float64(), // System current (A)
  })
    .index("by_plant", ["plantId"])
    .index("by_timestamp", ["timestamp"])
    .index("by_plant_and_timestamp", ["plantId", "timestamp"]),

  weather: defineTable({
    plantId: v.id("plants"),
    timestamp: v.float64(),
    temperature: v.float64(), // Celsius
    humidity: v.float64(), // %
    windSpeed: v.float64(), // m/s
    cloudCover: v.float64(), // %
    irradiance: v.float64(), // W/m2 (Solar only)
    description: v.string(), // "Sunny", "Overcast", "Windy", etc.
  })
    .index("by_plant", ["plantId"])
    .index("by_timestamp", ["timestamp"])
    .index("by_plant_and_timestamp", ["plantId", "timestamp"]),

  alarms: defineTable({
    plantId: v.id("plants"),
    assetId: v.optional(v.id("assets")),
    severity: v.union(v.literal("critical"), v.literal("high"), v.literal("medium"), v.literal("low")),
    status: v.union(v.literal("active"), v.literal("acknowledged"), v.literal("resolved")),
    code: v.string(), // e.g. "INV_OVERHEAT_01"
    message: v.string(),
    timestamp: v.float64(),
    resolvedAt: v.optional(v.float64()),
    assignedEngineer: v.optional(v.string()),
  })
    .index("by_plant", ["plantId"])
    .index("by_status", ["status"])
    .index("by_severity", ["severity"])
    .index("by_plant_and_status", ["plantId", "status"]),

  maintenance: defineTable({
    plantId: v.id("plants"),
    assetId: v.id("assets"),
    type: v.union(v.literal("preventive"), v.literal("corrective"), v.literal("predictive")),
    description: v.string(),
    status: v.union(v.literal("scheduled"), v.literal("in_progress"), v.literal("completed")),
    scheduledDate: v.string(), // ISO date
    completedDate: v.optional(v.string()), // ISO date
    engineer: v.string(),
  })
    .index("by_plant", ["plantId"])
    .index("by_asset", ["assetId"])
    .index("by_status", ["status"]),

  auditLogs: defineTable({
    plantId: v.optional(v.id("plants")),
    action: v.string(),
    details: v.string(),
    timestamp: v.float64(),
    operator: v.string(),
  })
    .index("by_timestamp", ["timestamp"]),

  notifications: defineTable({
    type: v.union(v.literal("alarm"), v.literal("maintenance"), v.literal("weather"), v.literal("system")),
    title: v.string(),
    message: v.string(),
    severity: v.union(v.literal("critical"), v.literal("high"), v.literal("medium"), v.literal("low")),
    timestamp: v.float64(),
    read: v.boolean(),
  })
    .index("by_timestamp", ["timestamp"])
    .index("by_read", ["read"]),

  /* PHASE 2 ADDITIONS */
  inspectionTemplates: defineTable({
    name: v.string(),
    type: v.union(v.literal("solar"), v.literal("wind"), v.literal("bess")),
    checklistItems: v.array(v.string()),
  }),

  inspections: defineTable({
    plantId: v.id("plants"),
    assetId: v.id("assets"),
    templateId: v.optional(v.id("inspectionTemplates")),
    inspector: v.string(),
    checklist: v.array(
      v.object({
        item: v.string(),
        checked: v.boolean(),
        notes: v.optional(v.string()),
      })
    ),
    status: v.union(v.literal("pending"), v.literal("in_progress"), v.literal("completed")),
    scheduledDate: v.string(),
    completedDate: v.optional(v.string()),
    findings: v.optional(v.string()),
    recommendations: v.optional(v.string()),
    signature: v.optional(v.string()), // base64 representation of digital signature
    photos: v.optional(v.array(v.string())), // base64/mock urls
  })
    .index("by_plant", ["plantId"])
    .index("by_asset", ["assetId"])
    .index("by_status", ["status"]),

  workOrders: defineTable({
    plantId: v.id("plants"),
    assetId: v.id("assets"),
    type: v.union(v.literal("preventive"), v.literal("corrective"), v.literal("predictive"), v.literal("emergency")),
    title: v.string(),
    description: v.string(),
    priority: v.union(v.literal("critical"), v.literal("high"), v.literal("medium"), v.literal("low")),
    status: v.union(
      v.literal("draft"),
      v.literal("open"),
      v.literal("assigned"),
      v.literal("in_progress"),
      v.literal("waiting_parts"),
      v.literal("under_review"),
      v.literal("completed"),
      v.literal("closed")
    ),
    assignedTechnician: v.optional(v.string()),
    scheduledDate: v.string(),
    completedDate: v.optional(v.string()),
    estimatedHours: v.float64(),
    actualHours: v.optional(v.float64()),
    spareParts: v.optional(
      v.array(
        v.object({
          name: v.string(),
          quantity: v.float64(),
          cost: v.float64(),
          partCode: v.optional(v.string()),
        })
      )
    ),
    laborCost: v.optional(v.float64()),
    materialsCost: v.optional(v.float64()),
    downtimeHours: v.optional(v.float64()),
  })
    .index("by_plant", ["plantId"])
    .index("by_asset", ["assetId"])
    .index("by_status", ["status"])
    .index("by_priority", ["priority"]),

  technicians: defineTable({
    name: v.string(),
    skills: v.array(v.string()),
    status: v.union(v.literal("active"), v.literal("on_leave"), v.literal("dispatched")),
    workload: v.float64(), // number of open work orders
  }),

  aiInsights: defineTable({
    plantId: v.id("plants"),
    assetId: v.optional(v.id("assets")),
    type: v.union(v.literal("anomaly"), v.literal("prediction"), v.literal("recommendation"), v.literal("risk")),
    title: v.string(),
    description: v.string(),
    confidence: v.float64(), // %
    failureProbability: v.optional(v.float64()), // %
    remainingUsefulLife: v.optional(v.float64()), // days
    riskScore: v.optional(v.float64()), // %
    rootCauseAnalysis: v.optional(v.string()),
    timestamp: v.float64(),
  })
    .index("by_plant", ["plantId"])
    .index("by_type", ["type"])
    .index("by_timestamp", ["timestamp"]),

  /* PHASE 3 ADDITIONS */
  vendors: defineTable({
    name: v.string(),
    category: v.union(v.literal("panels"), v.literal("turbines"), v.literal("batteries"), v.literal("logistics"), v.literal("services")),
    compliance: v.boolean(),
    deliveryRating: v.float64(), // 0 - 100
    qualityRating: v.float64(), // 0 - 100
    paymentTerms: v.string(), // e.g. "Net 30"
    contacts: v.string(),
  }),

  warehouses: defineTable({
    name: v.string(),
    location: v.string(),
    capacity: v.float64(), // sqft
    utilization: v.float64(), // %
  }),

  inventoryItems: defineTable({
    warehouseId: v.id("warehouses"),
    partName: v.string(),
    partCode: v.string(), // e.g. "INV-IGBT-300"
    category: v.union(v.literal("mechanical"), v.literal("electrical"), v.literal("consumables")),
    quantity: v.float64(),
    reserved: v.float64(),
    minStock: v.float64(),
    maxStock: v.float64(),
    unitCost: v.float64(),
    binLocation: v.string(), // e.g. "A-14"
  })
    .index("by_warehouse", ["warehouseId"])
    .index("by_partCode", ["partCode"]),

  purchaseRequisitions: defineTable({
    plantId: v.id("plants"),
    workOrderId: v.optional(v.id("workOrders")),
    title: v.string(),
    requestedBy: v.string(),
    status: v.union(v.literal("draft"), v.literal("pending_approval"), v.literal("approved"), v.literal("ordered"), v.literal("rejected")),
    requiredDate: v.string(),
    estimatedCost: v.float64(),
    items: v.array(
      v.object({
        partName: v.string(),
        partCode: v.string(),
        quantity: v.float64(),
        cost: v.float64(),
      })
    ),
  })
    .index("by_plant", ["plantId"])
    .index("by_status", ["status"]),

  purchaseOrders: defineTable({
    prId: v.optional(v.id("purchaseRequisitions")),
    vendorId: v.id("vendors"),
    poNumber: v.string(), // e.g. "PO-2026-001"
    status: v.union(v.literal("draft"), v.literal("sent"), v.literal("delivered"), v.literal("invoiced"), v.literal("closed")),
    totalCost: v.float64(),
    items: v.array(
      v.object({
        partName: v.string(),
        partCode: v.string(),
        quantity: v.float64(),
        cost: v.float64(),
      })
    ),
    scheduledDeliveryDate: v.string(),
    deliveredDate: v.optional(v.string()),
  })
    .index("by_vendor", ["vendorId"])
    .index("by_status", ["status"]),

  costCenters: defineTable({
    code: v.string(), // e.g. "CC-SOL-01"
    name: v.string(),
    allocatedBudget: v.float64(),
    spentBudget: v.float64(),
    category: v.union(v.literal("solar"), v.literal("wind"), v.literal("bess"), v.literal("corporate")),
  }),

  integrationJobs: defineTable({
    system: v.union(v.literal("sap"), v.literal("oracle"), v.literal("dynamics"), v.literal("odoo")),
    jobType: v.union(v.literal("sync_inventory"), v.literal("sync_invoices"), v.literal("sync_pos")),
    status: v.union(v.literal("success"), v.literal("running"), v.literal("failed")),
    lastRun: v.float64(),
    recordsSynced: v.float64(),
  }),

  integrationLogs: defineTable({
    jobId: v.optional(v.id("integrationJobs")),
    timestamp: v.float64(),
    level: v.union(v.literal("info"), v.literal("warning"), v.literal("error")),
    message: v.string(),
    payload: v.optional(v.string()), // JSON string of synced data
  })
    .index("by_timestamp", ["timestamp"]),

  /* ADVANCED ERP EXTENSIONS */
  contracts: defineTable({
    vendorId: v.id("vendors"),
    title: v.string(),
    slaAvailability: v.float64(), // e.g. 98.5%
    slaResponseHours: v.float64(), // e.g. 4.0 hours
    penaltyRatePerHour: v.float64(), // e.g. $150.00
    status: v.union(v.literal("active"), v.literal("terminated")),
  }),

  ppaBillings: defineTable({
    plantId: v.id("plants"),
    billingPeriod: v.string(), // e.g. "2026-Q1"
    mwhGenerated: v.float64(),
    tariffRate: v.float64(), // $/MWh
    totalRevenue: v.float64(),
    status: v.union(v.literal("pending"), v.literal("settled")),
  })
    .index("by_plant", ["plantId"]),

  shipments: defineTable({
    poId: v.optional(v.id("purchaseOrders")),
    partCode: v.string(),
    carrier: v.string(), // e.g. "Maersk Logistics"
    origin: v.string(), // e.g. "Esbjerg Port, Denmark"
    status: v.union(v.literal("in_transit"), v.literal("customs"), v.literal("delivered")),
    eta: v.string(), // ISO date
  }),
});
