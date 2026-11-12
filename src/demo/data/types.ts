// Core entities of the SCIO demo company. Everything is SAMPLE data.

export type Criticality = "Critical" | "High" | "Medium" | "Low";

export interface Warehouse {
  id: string;
  name: string;
  city: string;
}

export interface Supplier {
  id: string;
  name: string;
  country: string;
  category: string;
  promisedLeadDays: number;
}

export interface Item {
  id: string; // SKU
  name: string;
  category: string;
  warehouseId: string;
  supplierId: string;
  unitCost: number; // AED
  minStock: number;
  maxStock: number;
  stock: number;
  leadTimeDays: number;
  criticality: Criticality;
  /** Units consumed per day for the last HISTORY_DAYS days (oldest first). */
  dailyUsage: number[];
}

export type AssetType = "Pump" | "Compressor" | "Conveyor" | "Forklift" | "Generator" | "Packaging Line" | "Hydraulic Press" | "Mixer";

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  site: string;
  criticality: Criticality;
  installedYear: number;
  lastServiceDate: string; // ISO date
  serviceIntervalDays: number;
  nextServiceDate: string; // ISO date
  runningHours: number;
  /** Spare-part SKUs this asset consumes during maintenance. */
  partIds: string[];
  /** Daily sensor readings for the last SENSOR_DAYS days (oldest first). SIMULATED. */
  vibration: number[]; // mm/s RMS
  pressure: number[]; // bar
}

export interface Inspection {
  id: string;
  assetId: string;
  date: string;
  result: "Pass" | "Fail";
  finding: string;
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  itemId: string;
  quantity: number;
  unitPrice: number;
  orderDate: string;
  promisedDate: string;
  deliveredDate: string | null; // null = still open
}

export interface InvoiceRecord {
  number: string;
  supplierId: string;
  poId: string;
  date: string;
  quantity: number;
  unitPrice: number;
  total: number; // incl. VAT
  status: "Paid" | "Approved";
}

/** Asset stoppage recorded by the CMMS (last 90 days). */
export interface Downtime {
  id: string;
  assetId: string;
  start: string; // ISO date
  hours: number;
  type: "Breakdown" | "Planned";
  cause: string;
}

export interface DemoDataset {
  companyName: string;
  anchorDate: string; // "today" for the dataset
  warehouses: Warehouse[];
  suppliers: Supplier[];
  items: Item[];
  assets: Asset[];
  inspections: Inspection[];
  purchaseOrders: PurchaseOrder[];
  invoices: InvoiceRecord[];
  downtime: Downtime[];
}
