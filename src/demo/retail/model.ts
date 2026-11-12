// SCIO Retail OS - core data model (synthetic demo data).

export type CountryCode = "AE" | "SA" | "QA" | "KW" | "OM" | "BH";
export type StoreFormat = "Hypermarket" | "Supermarket" | "Express";
export type Uom = "piece" | "pack" | "carton" | "case" | "pallet" | "kg" | "g" | "litre" | "ml";

export interface Country {
  code: CountryCode;
  name: string;
  currency: string;
  /** 1 unit of local currency in AED */
  toAed: number;
  vat: number;
  regions: string[];
}

export interface Store {
  idx: number;
  id: string; // S101..
  name: string;
  country: CountryCode;
  region: string;
  city: string;
  format: StoreFormat;
  sizeSqm: number;
  manager: string;
  opened: number;
  /** relative traffic factor */
  traffic: number;
  dcIdx: number;
  monthlyTargetAed: number;
}

export interface DistributionCenter {
  idx: number;
  id: string;
  name: string;
  country: CountryCode;
}

export interface Sku {
  idx: number;
  id: string; // SKU-100001
  name: string;
  brand: string;
  department: string;
  category: string;
  subcategory: string;
  variant: string;
  size: string;
  colour: string | null;
  gtin: string;
  baseUom: Uom;
  /** conversion factors to base unit */
  uoms: Array<{ uom: Uom; factor: number; label: string }>;
  cost: number; // AED per base unit
  price: number; // AED per base unit (before VAT)
  status: "Active" | "New" | "Seasonal" | "Discontinued";
  perishable: boolean;
  shelfLifeDays: number | null;
  serialized: boolean;
  supplierIdx: number;
  altSupplierIdx: number;
  /** chain-level base units sold per store-day for a 1.0 traffic store */
  baseRate: number;
  icon: string;
  // ---- product master (identification, packaging, lifecycle) ----
  /** EAN-13 barcode (same as GTIN-13 for GCC-sourced items) */
  ean: string;
  /** UPC-A barcode for North-American sourced items, otherwise null */
  upc: string | null;
  /** Standard Product Unit: groups the variants of one product family */
  spu: string;
  flavour: string | null;
  packaging: string;
  lifecycle: "Introduction" | "Growth" | "Maturity" | "Decline" | "End of life";
  /** base units per supplier case */
  casePack: number;
  /** minimum order quantity in base units (whole cases) */
  moq: number;
  /** AED per base unit incl. freight, duty and handling */
  landedCost: number;
  /** maximum retail price printed on pack (imported items only) */
  mrp: number | null;
}

export interface Supplier {
  idx: number;
  id: string;
  name: string;
  country: string;
  categories: string[];
  leadTimeDays: number;
  /** behaviour used by the generator */
  onTimeTarget: number;
  fillTarget: number;
  contact: string;
}

export interface PoLine {
  skuIdx: number;
  ordered: number;
  received: number;
  unitCost: number;
  invoicedQty: number | null;
  invoicedCost: number | null;
}

export interface Asn {
  id: string;
  shipped: string;
  eta: string;
  carrier: string; // 3PL
}

export type PoStatus = "Pending approval" | "Approved" | "Sent" | "Partially received" | "Received" | "Cancelled";

export interface PurchaseOrder {
  id: string;
  supplierIdx: number;
  /** destination: DC index or store index */
  destType: "dc" | "store";
  destIdx: number;
  created: string;
  promised: string;
  received: string | null;
  status: PoStatus;
  lines: PoLine[];
  createdBy: string;
  /** Goods Receipt Note number once received */
  grn: string | null;
  /** Advance Shipping Notice from the supplier (for shipped orders) */
  asn: Asn | null;
  /** DC flow: put away into stock or cross-docked straight to stores */
  flow: "Putaway" | "Cross-dock" | "Direct to store";
}

/** One store-day of POS sales (synthetic). Values in AED excl. VAT. */
export interface StoreDay {
  storeIdx: number;
  date: string;
  grossSales: number; // at regular shelf price
  discounts: number; // promotions, markdowns and manual discounts
  returns: number; // customer refunds
  netSales: number; // gross - discounts - returns
  cogs: number; // landed cost of goods sold
  transactions: number;
  units: number;
  footfall: number; // door counter
  lyNetSales: number; // same weekday last year
  lyTransactions: number;
}

export interface CalendarEvent {
  id: string;
  name: string;
  kind: "Religious" | "National" | "Promotion" | "Seasonal";
  countries: CountryCode[];
  start: string;
  end: string;
  /** expected demand change by department, e.g. { "Grocery": 0.35 } */
  uplift: Record<string, number>;
}

/** Category pair affinity from POS baskets. */
export interface BasketPair {
  a: string;
  b: string;
  baskets: number;
  support: number;
  confidence: number; // P(b | a)
  lift: number;
}

export type EquipmentType = "Freezer" | "Chiller" | "Cold Room" | "HVAC" | "POS Terminal" | "Generator";

export interface Equipment {
  id: string;
  storeIdx: number;
  type: EquipmentType;
  name: string;
  make: string;
  installed: number;
  /** target value (°C for cold chain, % uptime for POS, kW for others) */
  setpoint: number | null;
  /** 48 hourly readings, oldest first */
  readings: number[];
  unit: string;
  fault: null | { kind: string; since: number };
  lastService: string;
  serviceIntervalDays: number;
}

export interface Audit {
  id: string;
  storeIdx: number;
  type: "Shelf" | "Safety" | "Hygiene" | "Cold chain" | "Pricing";
  date: string;
  score: number;
  auditor: string;
  findings: string[];
}

export interface PricingException {
  id: string;
  storeIdx: number;
  skuIdx: number;
  shelfPrice: number;
  systemPrice: number;
  found: string;
}

export interface Promotion {
  id: string;
  name: string;
  skuIdxs: number[];
  discountPct: number;
  start: string;
  end: string;
  countries: CountryCode[];
  upliftPct: number;
}

export interface StoreTask {
  id: string;
  storeIdx: number;
  title: string;
  type: "Checklist" | "Replenishment" | "Pricing" | "Maintenance" | "Audit follow-up";
  due: string;
  assignee: string;
  status: "Open" | "In progress" | "Done";
}

export interface Ticket {
  id: string;
  equipmentId: string;
  storeIdx: number;
  issue: string;
  priority: "P1" | "P2" | "P3";
  status: "Open" | "Assigned" | "In progress" | "Resolved";
  technician: string | null;
  created: string;
  resolved: string | null;
}

export interface RetailBase {
  anchorDate: string;
  countries: Country[];
  stores: Store[];
  dcs: DistributionCenter[];
  skus: Sku[];
  suppliers: Supplier[];
  pos: PurchaseOrder[];
  equipment: Equipment[];
  audits: Audit[];
  pricingExceptions: PricingException[];
  promotions: Promotion[];
  tasks: StoreTask[];
  tickets: Ticket[];
  /** store x sku arrays, index = storeIdx * NSKU + skuIdx */
  carried: Uint8Array;
  onHand: Int32Array;
  reserved: Int32Array;
  damaged: Int32Array;
  velocity: Float32Array; // base units / day
  lastSaleDaysAgo: Uint8Array;
  /** dc x sku stock */
  dcStock: Int32Array;
  /** average realised discount vs shelf price over 30 days, % (store x sku) */
  discountPct: Uint8Array;
  /** customer return units, last 30 days (store x sku) */
  returns30: Uint16Array;
  /** age in days of the oldest units on hand (store x sku) */
  ageDays: Uint16Array;
  /** velocity in the same period last year (store x sku) */
  lyVelocity: Float32Array;
  storeDays: StoreDay[];
  calendar: CalendarEvent[];
  basket: BasketPair[];
}
