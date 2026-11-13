import {
  Boxes,
  CalendarClock,
  ClipboardCheck,
  Cpu,
  HeartHandshake,
  Layers,
  ReceiptText,
  ShoppingCart,
  Truck,
  Users,
  Wifi,
  Wrench,
  type LucideIcon,
} from "lucide-react";

// ---------------------------------------------------------------------------
// The business systems SCIO reads from. Connection details here are simulated
// for this workspace (sample data), but every module and answer cites them so
// users see where each figure comes from.
// ---------------------------------------------------------------------------

export type SourceId = "ERP" | "POS" | "CRM" | "WMS" | "SCM" | "P2P" | "HRMS" | "WFM" | "CMMS" | "OMS" | "IoT" | "SOTM";

export interface SourceSystem {
  id: SourceId;
  name: string;
  provides: string;
  icon: LucideIcon;
  tone: string; // icon colour
  bg: string; // icon background
  method: "API" | "Database replica" | "Event stream" | "SFTP batch" | "MQTT";
  syncEvery: string;
  lastSyncMin: number; // minutes ago
  records: number;
  feeds: string[]; // SCIO modules fed by this system
}

export const SOURCES: SourceSystem[] = [
  { id: "ERP", name: "Enterprise Resource Planning", provides: "Finance, purchases, inventory, costs", icon: Layers, tone: "text-blue-600", bg: "bg-blue-50", method: "API", syncEvery: "15 min", lastSyncMin: 3, records: 1_284_502, feeds: ["Inventory", "Procurement", "Insights"] },
  { id: "POS", name: "Point of Sale", provides: "Sales, transactions, returns, discounts", icon: ShoppingCart, tone: "text-emerald-600", bg: "bg-emerald-50", method: "Event stream", syncEvery: "Real time", lastSyncMin: 0, records: 9_842_117, feeds: ["Sales", "Stores", "SKU Intelligence"] },
  { id: "CRM", name: "Customer Relationship Management", provides: "Customers, complaints, loyalty", icon: HeartHandshake, tone: "text-pink-600", bg: "bg-pink-50", method: "API", syncEvery: "1 hour", lastSyncMin: 22, records: 412_380, feeds: ["Stores", "Insights"] },
  { id: "WMS", name: "Warehouse Management System", provides: "Warehouse stock, picking, dispatch", icon: Boxes, tone: "text-violet-600", bg: "bg-violet-50", method: "Database replica", syncEvery: "5 min", lastSyncMin: 2, records: 2_106_944, feeds: ["Inventory", "Transfers"] },
  { id: "SCM", name: "Supply Chain Management", provides: "Demand forecasts, replenishment, deliveries", icon: Truck, tone: "text-sky-600", bg: "bg-sky-50", method: "API", syncEvery: "30 min", lastSyncMin: 11, records: 386_215, feeds: ["Inventory", "Suppliers"] },
  { id: "P2P", name: "Procure-to-Pay", provides: "Purchase orders, suppliers, invoices", icon: ReceiptText, tone: "text-indigo-600", bg: "bg-indigo-50", method: "API", syncEvery: "15 min", lastSyncMin: 6, records: 148_902, feeds: ["Procurement", "Suppliers", "Documents"] },
  { id: "HRMS", name: "Human Resource Management System", provides: "Employees, attendance, leave", icon: Users, tone: "text-amber-600", bg: "bg-amber-50", method: "SFTP batch", syncEvery: "Daily 02:00", lastSyncMin: 548, records: 6_412, feeds: ["Stores"] },
  { id: "WFM", name: "Workforce Management", provides: "Shifts, staffing, labor hours", icon: CalendarClock, tone: "text-orange-600", bg: "bg-orange-50", method: "API", syncEvery: "1 hour", lastSyncMin: 37, records: 92_877, feeds: ["Stores"] },
  { id: "CMMS", name: "Computerized Maintenance Management", provides: "Equipment faults, repairs, work orders", icon: Wrench, tone: "text-rose-600", bg: "bg-rose-50", method: "API", syncEvery: "10 min", lastSyncMin: 4, records: 24_590, feeds: ["Maintenance", "Assets"] },
  { id: "OMS", name: "Order Management System", provides: "Online orders, fulfillment, returns", icon: Cpu, tone: "text-cyan-600", bg: "bg-cyan-50", method: "Event stream", syncEvery: "Real time", lastSyncMin: 0, records: 731_064, feeds: ["Sales", "Inventory"] },
  { id: "IoT", name: "Internet of Things", provides: "Sensors, temperature, equipment alerts", icon: Wifi, tone: "text-teal-600", bg: "bg-teal-50", method: "MQTT", syncEvery: "Real time", lastSyncMin: 0, records: 18_220_431, feeds: ["Assets", "Maintenance"] },
  { id: "SOTM", name: "Store Operations & Task Management", provides: "Store checklists, inspections, task completion", icon: ClipboardCheck, tone: "text-lime-700", bg: "bg-lime-50", method: "API", syncEvery: "15 min", lastSyncMin: 9, records: 57_316, feeds: ["Inspection", "Stores"] },
];

export const SOURCE: Record<SourceId, SourceSystem> = Object.fromEntries(SOURCES.map((s) => [s.id, s])) as Record<SourceId, SourceSystem>;

/** Which systems each Ask SCIO tool reads. */
export const TOOL_SOURCES: Record<string, SourceId[]> = {
  get_retail_overview: ["ERP", "POS", "WMS", "CMMS"],
  get_stockout_forecast: ["POS", "WMS", "SCM"],
  get_overstock: ["ERP", "WMS"],
  get_transfer_recommendations: ["WMS", "SCM"],
  diagnose_store: ["POS", "ERP", "WFM", "SOTM"],
  get_supplier_performance: ["P2P", "SCM"],
  get_expiring_products: ["WMS", "ERP"],
  get_inventory_accuracy: ["POS", "WMS", "SOTM"],
  get_equipment_issues: ["IoT", "CMMS"],
  get_sku_analysis: ["POS", "WMS", "ERP"],
  get_sales_growth_levers: ["POS", "ERP", "CRM", "OMS"],
  draft_actions: ["ERP", "WMS"],
  get_top_products: ["POS", "ERP"],
};

export const syncLabel = (min: number) => (min === 0 ? "Live" : min < 60 ? `${min} min ago` : `${Math.round(min / 60)} h ago`);
