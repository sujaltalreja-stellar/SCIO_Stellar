import { defineTable } from "convex/server";
import { v } from "convex/values";

// ---------------------------------------------------------------------------
// SCIO demo database (/demo). Kept separate from the marketing-site tables.
//   scio*  - snapshot metadata, accounts, sessions
//   ind*   - Industrial operations dataset
//   rt*    - Retail OS dataset (GCC, 50 stores x 5,000 SKUs) + event log
// All business records are synthetic demo data.
// ---------------------------------------------------------------------------

const nullableNumber = v.union(v.number(), v.null());
const nullableString = v.union(v.string(), v.null());

export const scioTables = {
  // ---- platform ------------------------------------------------------------
  scioMeta: defineTable({
    key: v.string(), // "snapshot"
    anchorDate: v.string(), // the dataset's "today" (YYYY-MM-DD)
    companyName: v.string(),
    version: v.number(), // bumps on every reseed (lets caches invalidate)
    seededAt: v.number(),
    counts: v.record(v.string(), v.number()),
  }).index("by_key", ["key"]),

  scioAccounts: defineTable({
    email: v.string(),
    name: v.string(),
    role: v.string(),
    retailRole: v.optional(v.string()),
    scopeCountry: v.optional(v.string()),
    scopeStore: v.optional(v.string()),
    salt: v.string(),
    passwordHash: v.string(),
    order: v.number(),
  }).index("by_email", ["email"]),

  scioSessions: defineTable({
    token: v.string(),
    accountId: v.id("scioAccounts"),
    createdAt: v.number(),
  })
    .index("by_token", ["token"])
    .index("by_accountId", ["accountId"]),

  // ---- industrial ----------------------------------------------------------
  indWarehouses: defineTable({ id: v.string(), name: v.string(), city: v.string() }).index("by_code", ["id"]),

  indSuppliers: defineTable({
    id: v.string(),
    name: v.string(),
    country: v.string(),
    category: v.string(),
    promisedLeadDays: v.number(),
  }).index("by_code", ["id"]),

  indItems: defineTable({
    id: v.string(),
    name: v.string(),
    category: v.string(),
    warehouseId: v.string(),
    supplierId: v.string(),
    unitCost: v.number(),
    minStock: v.number(),
    maxStock: v.number(),
    stock: v.number(),
    leadTimeDays: v.number(),
    criticality: v.string(),
    dailyUsage: v.array(v.number()), // fixed 365-day window
  })
    .index("by_code", ["id"])
    .index("by_warehouseId", ["warehouseId"]),

  indAssets: defineTable({
    id: v.string(),
    name: v.string(),
    type: v.string(),
    site: v.string(),
    criticality: v.string(),
    installedYear: v.number(),
    lastServiceDate: v.string(),
    serviceIntervalDays: v.number(),
    nextServiceDate: v.string(),
    runningHours: v.number(),
    partIds: v.array(v.string()),
    vibration: v.array(v.number()), // fixed 90-day window, mm/s RMS
    pressure: v.array(v.number()), // fixed 90-day window, bar
  }).index("by_code", ["id"]),

  indInspections: defineTable({
    id: v.string(),
    assetId: v.string(),
    date: v.string(),
    result: v.string(),
    finding: v.string(),
  }).index("by_assetId", ["assetId"]),

  indPurchaseOrders: defineTable({
    id: v.string(),
    supplierId: v.string(),
    itemId: v.string(),
    quantity: v.number(),
    unitPrice: v.number(),
    orderDate: v.string(),
    promisedDate: v.string(),
    deliveredDate: nullableString,
  })
    .index("by_code", ["id"])
    .index("by_supplierId", ["supplierId"]),

  indInvoices: defineTable({
    number: v.string(),
    supplierId: v.string(),
    poId: v.string(),
    date: v.string(),
    quantity: v.number(),
    unitPrice: v.number(),
    total: v.number(),
    status: v.string(),
  }).index("by_poId", ["poId"]),

  /** CMMS downtime log (breakdowns and planned stoppages, 90 days). */
  indDowntime: defineTable({
    id: v.string(),
    assetId: v.string(),
    start: v.string(),
    hours: v.number(),
    type: v.string(),
    cause: v.string(),
  }).index("by_assetId", ["assetId"]),

  // ---- retail master data --------------------------------------------------
  rtCountries: defineTable({
    code: v.string(),
    name: v.string(),
    currency: v.string(),
    toAed: v.number(),
    vat: v.number(),
    regions: v.array(v.string()),
    order: v.number(),
  }).index("by_order", ["order"]),

  rtStores: defineTable({
    idx: v.number(),
    id: v.string(),
    name: v.string(),
    country: v.string(),
    region: v.string(),
    city: v.string(),
    format: v.string(),
    sizeSqm: v.number(),
    manager: v.string(),
    opened: v.number(),
    traffic: v.number(),
    dcIdx: v.number(),
    monthlyTargetAed: v.number(),
  })
    .index("by_idx", ["idx"])
    .index("by_code", ["id"]),

  rtDcs: defineTable({ idx: v.number(), id: v.string(), name: v.string(), country: v.string() }).index("by_idx", ["idx"]),

  rtSkus: defineTable({
    idx: v.number(),
    id: v.string(),
    name: v.string(),
    brand: v.string(),
    department: v.string(),
    category: v.string(),
    subcategory: v.string(),
    variant: v.string(),
    size: v.string(),
    colour: nullableString,
    gtin: v.string(),
    baseUom: v.string(),
    uoms: v.array(v.object({ uom: v.string(), factor: v.number(), label: v.string() })),
    cost: v.number(),
    price: v.number(),
    status: v.string(),
    perishable: v.boolean(),
    shelfLifeDays: nullableNumber,
    serialized: v.boolean(),
    supplierIdx: v.number(),
    altSupplierIdx: v.number(),
    baseRate: v.number(),
    icon: v.string(),
    // product master (optional so older snapshots still validate)
    ean: v.optional(v.string()),
    upc: v.optional(nullableString),
    spu: v.optional(v.string()),
    flavour: v.optional(nullableString),
    packaging: v.optional(v.string()),
    lifecycle: v.optional(v.string()),
    casePack: v.optional(v.number()),
    moq: v.optional(v.number()),
    landedCost: v.optional(v.number()),
    mrp: v.optional(nullableNumber),
  })
    .index("by_idx", ["idx"])
    .index("by_code", ["id"])
    .index("by_department_and_category", ["department", "category"]),

  rtSuppliers: defineTable({
    idx: v.number(),
    id: v.string(),
    name: v.string(),
    country: v.string(),
    categories: v.array(v.string()),
    leadTimeDays: v.number(),
    onTimeTarget: v.number(),
    fillTarget: v.number(),
    contact: v.string(),
  }).index("by_idx", ["idx"]),

  rtPurchaseOrders: defineTable({
    order: v.number(),
    id: v.string(),
    supplierIdx: v.number(),
    destType: v.string(),
    destIdx: v.number(),
    created: v.string(),
    promised: v.string(),
    received: nullableString,
    status: v.string(),
    createdBy: v.string(),
    grn: v.optional(nullableString),
    asn: v.optional(v.union(v.null(), v.object({ id: v.string(), shipped: v.string(), eta: v.string(), carrier: v.string() }))),
    flow: v.optional(v.string()),
    // bounded (max ~10 lines per PO)
    lines: v.array(
      v.object({
        skuIdx: v.number(),
        ordered: v.number(),
        received: v.number(),
        unitCost: v.number(),
        invoicedQty: nullableNumber,
        invoicedCost: nullableNumber,
      })
    ),
  })
    .index("by_order", ["order"])
    .index("by_code", ["id"])
    .index("by_supplierIdx", ["supplierIdx"]),

  rtEquipment: defineTable({
    order: v.number(),
    id: v.string(),
    storeIdx: v.number(),
    type: v.string(),
    name: v.string(),
    make: v.string(),
    installed: v.number(),
    setpoint: nullableNumber,
    readings: v.array(v.number()), // fixed 48-hour window
    unit: v.string(),
    fault: v.union(v.null(), v.object({ kind: v.string(), since: v.number() })),
    lastService: v.string(),
    serviceIntervalDays: v.number(),
  })
    .index("by_order", ["order"])
    .index("by_storeIdx", ["storeIdx"]),

  rtAudits: defineTable({
    order: v.number(),
    id: v.string(),
    storeIdx: v.number(),
    type: v.string(),
    date: v.string(),
    score: v.number(),
    auditor: v.string(),
    findings: v.array(v.string()),
  })
    .index("by_order", ["order"])
    .index("by_storeIdx", ["storeIdx"]),

  rtPricingExceptions: defineTable({
    order: v.number(),
    id: v.string(),
    storeIdx: v.number(),
    skuIdx: v.number(),
    shelfPrice: v.number(),
    systemPrice: v.number(),
    found: v.string(),
  }).index("by_order", ["order"]),

  rtPromotions: defineTable({
    order: v.number(),
    id: v.string(),
    name: v.string(),
    skuIdxs: v.array(v.number()),
    discountPct: v.number(),
    start: v.string(),
    end: v.string(),
    countries: v.array(v.string()),
    upliftPct: v.number(),
  }).index("by_order", ["order"]),

  rtTasks: defineTable({
    order: v.number(),
    id: v.string(),
    storeIdx: v.number(),
    title: v.string(),
    type: v.string(),
    due: v.string(),
    assignee: v.string(),
    status: v.string(),
  })
    .index("by_order", ["order"])
    .index("by_storeIdx", ["storeIdx"]),

  rtTickets: defineTable({
    order: v.number(),
    id: v.string(),
    equipmentId: v.string(),
    storeIdx: v.number(),
    issue: v.string(),
    priority: v.string(),
    status: v.string(),
    technician: nullableString,
    created: v.string(),
    resolved: nullableString,
  }).index("by_order", ["order"]),

  // ---- retail stock --------------------------------------------------------
  /** One row per store x SKU the store carries (source of truth, queryable). */
  rtInventory: defineTable({
    storeIdx: v.number(),
    skuIdx: v.number(),
    storeId: v.string(),
    skuId: v.string(),
    onHand: v.number(),
    reserved: v.number(),
    damaged: v.number(),
    velocity: v.number(), // base units sold per day
    lastSaleDaysAgo: v.number(),
    discountPct: v.optional(v.number()), // realised discount vs shelf price, 30d
    returns30: v.optional(v.number()), // customer return units, 30d
    ageDays: v.optional(v.number()), // age of oldest units on hand
    lyVelocity: v.optional(v.number()), // same period last year
  })
    .index("by_storeIdx_and_skuIdx", ["storeIdx", "skuIdx"])
    .index("by_skuIdx_and_storeIdx", ["skuIdx", "storeIdx"])
    .index("by_storeId_and_skuId", ["storeId", "skuId"]),

  /** Distribution-centre stock (non-zero rows only). */
  rtDcStock: defineTable({
    dcIdx: v.number(),
    skuIdx: v.number(),
    dcId: v.string(),
    skuId: v.string(),
    qty: v.number(),
  }).index("by_dcIdx_and_skuIdx", ["dcIdx", "skuIdx"]),

  /**
   * Columnar copy of rtInventory / rtDcStock, one document per store or DC,
   * written in the same seed run. The app loads these to analyse the full
   * 250k store x SKU matrix in the browser without fetching 177k rows.
   */
  rtStockPacks: defineTable({
    kind: v.union(v.literal("store"), v.literal("dc")),
    idx: v.number(),
    carried: v.optional(v.bytes()), // Uint8Array(NSKU)
    onHand: v.bytes(), // Int32Array(NSKU)
    reserved: v.optional(v.bytes()), // Int32Array(NSKU)
    damaged: v.optional(v.bytes()), // Int32Array(NSKU)
    velocity: v.optional(v.bytes()), // Float32Array(NSKU)
    lastSaleDaysAgo: v.optional(v.bytes()), // Uint8Array(NSKU)
    discountPct: v.optional(v.bytes()), // Uint8Array(NSKU)
    returns30: v.optional(v.bytes()), // Uint16Array(NSKU)
    ageDays: v.optional(v.bytes()), // Uint16Array(NSKU)
    lyVelocity: v.optional(v.bytes()), // Float32Array(NSKU)
  }).index("by_kind_and_idx", ["kind", "idx"]),

  // ---- retail sales ----------------------------------------------------------
  /** POS sales per store per day (120 days), AED excl. VAT. */
  rtStoreDays: defineTable({
    storeIdx: v.number(),
    date: v.string(),
    grossSales: v.number(),
    discounts: v.number(),
    returns: v.number(),
    netSales: v.number(),
    cogs: v.number(),
    transactions: v.number(),
    units: v.number(),
    footfall: v.number(),
    lyNetSales: v.number(),
    lyTransactions: v.number(),
  }).index("by_storeIdx_and_date", ["storeIdx", "date"]),

  /** Today's POS tickets (sample journal, 120 per store). */
  rtPosTxns: defineTable({
    id: v.string(),
    storeIdx: v.number(),
    at: v.string(),
    tender: v.string(),
    member: v.boolean(),
    lines: v.array(v.object({ skuIdx: v.number(), qty: v.number(), unitPrice: v.number(), discount: v.number() })), // bounded basket
    total: v.number(),
  }).index("by_storeIdx_and_at", ["storeIdx", "at"]),

  /** GCC trading calendar (religious, national and promotional events). */
  rtCalendar: defineTable({
    id: v.string(),
    name: v.string(),
    kind: v.string(),
    countries: v.array(v.string()),
    start: v.string(),
    end: v.string(),
    uplift: v.record(v.string(), v.number()),
  }).index("by_start", ["start"]),

  /** Category affinity mined from POS baskets. */
  rtBasketPairs: defineTable({
    a: v.string(),
    b: v.string(),
    baskets: v.number(),
    support: v.number(),
    confidence: v.number(),
    lift: v.number(),
  }).index("by_lift", ["lift"]),

  // ---- retail activity -----------------------------------------------------
  /** Every action taken in Retail OS (transfers, POs, markdowns, tickets…). */
  rtEvents: defineTable({
    anchorDate: v.string(),
    eventId: v.string(),
    type: v.string(),
    at: v.string(),
    user: v.string(),
    role: v.string(),
    accountId: v.id("scioAccounts"),
    // event-specific fields; shape is validated by the app's RetailEvent union
    payload: v.record(v.string(), v.any()),
  })
    .index("by_anchorDate", ["anchorDate"])
    .index("by_eventId", ["eventId"]),
};
