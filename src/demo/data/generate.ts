import { createRng, type Rng } from "./rng";
import type {
  Asset,
  Downtime,
  AssetType,
  Criticality,
  DemoDataset,
  Inspection,
  InvoiceRecord,
  Item,
  PurchaseOrder,
  Supplier,
  Warehouse,
} from "./types";

// ---------------------------------------------------------------------------
// SCIO demo dataset generator.
// Produces one fictional company with 12 months of operational history.
// Deterministic: same seed + same anchor day => identical data.
// ---------------------------------------------------------------------------

export const COMPANY_NAME = "SCIO";
export const CURRENCY = "AED";
const USD_TO_AED = 3.6725;
export const HISTORY_DAYS = 365;
export const SENSOR_DAYS = 90;
const SEED = 20261112;

const DAY = 86_400_000;

export function toIso(d: Date): string {
  return d.toISOString().slice(0, 10);
}
function addDays(d: Date, days: number): Date {
  return new Date(d.getTime() + days * DAY);
}

const WAREHOUSES: Warehouse[] = [
  { id: "WH-A", name: "Warehouse A · Central DC", city: "Dubai" },
  { id: "WH-B", name: "Warehouse B · Regional Hub", city: "Riyadh" },
  { id: "WH-C", name: "Warehouse C · Plant Store", city: "Dammam" },
];

const SUPPLIER_DEFS: Array<[string, string, string]> = [
  ["Gulf Bearing Supply", "UAE", "Bearings & Seals"],
  ["Al Waha Industrial Trading", "Saudi Arabia", "Mechanical Parts"],
  ["Nordic Seal Systems", "Sweden", "Bearings & Seals"],
  ["Desert Hydraulics Co.", "UAE", "Hydraulics"],
  ["Peninsula Electrical", "Qatar", "Electrical"],
  ["Rhein Antriebstechnik", "Germany", "Motors & Drives"],
  ["Oasis Filtration", "Oman", "Filters"],
  ["Coastal Fasteners", "UAE", "Fasteners"],
  ["Indus Belt & Drive", "India", "Belts & Chains"],
  ["Falcon Lubricants", "UAE", "Lubricants"],
  ["Pacific Packaging Materials", "Singapore", "Packaging"],
  ["Safeguard PPE Trading", "Saudi Arabia", "Safety & PPE"],
  ["Anatolia Valve Works", "Turkey", "Valves & Fittings"],
  ["Lumen Automation", "Japan", "Sensors & Automation"],
  ["Crescent Pumps & Spares", "Kuwait", "Pump Spares"],
  ["Meridian Compressor Parts", "Italy", "Compressor Spares"],
  ["Bahrain Steel Components", "Bahrain", "Mechanical Parts"],
  ["Sahara Electrical Wholesale", "Egypt", "Electrical"],
];

// [name, category, unitCost range, criticality weight]
const ITEM_TEMPLATES: Array<[string, string, [number, number]]> = [
  ["Deep Groove Ball Bearing 6205", "Bearings & Seals", [8, 18]],
  ["Spherical Roller Bearing 22216", "Bearings & Seals", [140, 260]],
  ["Mechanical Seal Kit 45mm", "Bearings & Seals", [180, 420]],
  ["Oil Seal 60x80x8", "Bearings & Seals", [4, 9]],
  ["Hydraulic Hose Assembly 1/2\"", "Hydraulics", [35, 80]],
  ["Hydraulic Cylinder Seal Kit", "Hydraulics", [60, 150]],
  ["Directional Control Valve 24V", "Hydraulics", [420, 900]],
  ["Contactor 3P 40A", "Electrical", [55, 120]],
  ["Motor Protection Breaker 16A", "Electrical", [70, 140]],
  ["Variable Frequency Drive 7.5kW", "Motors & Drives", [900, 1600]],
  ["Electric Motor 5.5kW IE3", "Motors & Drives", [650, 1200]],
  ["Coupling Element Spider", "Motors & Drives", [12, 30]],
  ["Air Filter Element", "Filters", [25, 60]],
  ["Hydraulic Return Filter", "Filters", [30, 75]],
  ["Oil Separator Cartridge", "Compressor Spares", [210, 380]],
  ["Compressor Valve Plate", "Compressor Spares", [320, 640]],
  ["Impeller 150mm Bronze", "Pump Spares", [380, 720]],
  ["Pump Wear Ring Set", "Pump Spares", [90, 190]],
  ["V-Belt SPB 2000", "Belts & Chains", [14, 32]],
  ["Conveyor Belt Splice Kit", "Belts & Chains", [120, 260]],
  ["Roller Chain 16B Duplex (5m)", "Belts & Chains", [95, 180]],
  ["Hex Bolt M16x60 (box 50)", "Fasteners", [18, 36]],
  ["Anchor Bolt M20 (box 20)", "Fasteners", [40, 80]],
  ["Gear Oil ISO VG 220 (20L)", "Lubricants", [85, 140]],
  ["Lithium Grease EP2 (18kg)", "Lubricants", [95, 160]],
  ["Stretch Film 500mm Roll", "Packaging", [9, 16]],
  ["Corrugated Carton 600x400", "Packaging", [1.2, 2.4]],
  ["Safety Gloves Cut-Resistant (pair)", "Safety & PPE", [4, 9]],
  ["Safety Helmet Class E", "Safety & PPE", [12, 22]],
  ["Gate Valve DN50 PN16", "Valves & Fittings", [110, 230]],
  ["Ball Valve 2\" Stainless", "Valves & Fittings", [75, 160]],
  ["Proximity Sensor M18", "Sensors & Automation", [45, 95]],
  ["Pressure Transmitter 0-16 bar", "Sensors & Automation", [240, 480]],
  ["Vibration Sensor 100mV/g", "Sensors & Automation", [190, 380]],
  ["Shaft Sleeve 50mm", "Mechanical Parts", [60, 130]],
  ["Gearbox Output Shaft", "Mechanical Parts", [520, 980]],
];

const ASSET_TYPES: Array<{ type: AssetType; prefix: string; categories: string[]; pressure: [number, number] }> = [
  { type: "Pump", prefix: "P", categories: ["Pump Spares", "Bearings & Seals", "Motors & Drives"], pressure: [5.5, 7.5] },
  { type: "Compressor", prefix: "C", categories: ["Compressor Spares", "Filters", "Lubricants"], pressure: [7.0, 9.5] },
  { type: "Conveyor", prefix: "CV", categories: ["Belts & Chains", "Bearings & Seals", "Motors & Drives"], pressure: [0, 0] },
  { type: "Forklift", prefix: "FL", categories: ["Hydraulics", "Filters", "Lubricants"], pressure: [150, 180] },
  { type: "Generator", prefix: "G", categories: ["Filters", "Electrical", "Lubricants"], pressure: [3.0, 4.5] },
  { type: "Packaging Line", prefix: "PL", categories: ["Packaging", "Sensors & Automation", "Belts & Chains"], pressure: [5.5, 6.5] },
  { type: "Hydraulic Press", prefix: "HP", categories: ["Hydraulics", "Valves & Fittings", "Electrical"], pressure: [180, 210] },
  { type: "Mixer", prefix: "MX", categories: ["Mechanical Parts", "Bearings & Seals", "Motors & Drives"], pressure: [0, 0] },
];

const SITES = ["Dubai Distribution Centre", "Riyadh Hub", "Dammam Plant"];

function weightedCriticality(rng: Rng): Criticality {
  const r = rng.next();
  if (r < 0.15) return "Critical";
  if (r < 0.4) return "High";
  if (r < 0.8) return "Medium";
  return "Low";
}

function round(n: number, dp = 2) {
  const f = 10 ** dp;
  return Math.round(n * f) / f;
}

export function generateDataset(anchor: Date = new Date()): DemoDataset {
  const rng = createRng(SEED);
  const today = new Date(Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth(), anchor.getUTCDate()));

  // ---- Suppliers -----------------------------------------------------------
  const suppliers: Supplier[] = SUPPLIER_DEFS.map(([name, country, category], i) => ({
    id: `SUP-${String(i + 1).padStart(3, "0")}`,
    name,
    country,
    category,
    promisedLeadDays: rng.int(7, 35),
  }));
  // Per-supplier delivery behaviour (mean delay in days). A few chronic late suppliers.
  const supplierDelayMean = new Map<string, number>();
  suppliers.forEach((s, i) => {
    const chronic = i === 2 || i === 5 || i === 13; // Nordic Seal, Rhein, Lumen
    supplierDelayMean.set(s.id, chronic ? rng.range(2, 3.5) : rng.range(-3.5, -1));
  });

  // ---- Items (one per template per warehouse subset) ----------------------
  const items: Item[] = [];
  let skuCounter = 1000;
  for (const [name, category, [cMin, cMax]] of ITEM_TEMPLATES) {
    const candidates = suppliers.filter((s) => s.category === category);
    for (const wh of WAREHOUSES) {
      if (!rng.chance(0.85)) continue;
      const supplier = candidates.length ? rng.pick(candidates) : rng.pick(suppliers);
      const usdCost = rng.range(cMin, cMax); // template ranges are in USD
      const unitCost = round(usdCost * USD_TO_AED);
      // Cheap consumables move faster than expensive spares.
      const baseRate = usdCost < 20 ? rng.range(6, 22) : usdCost < 150 ? rng.range(1.2, 6) : rng.range(0.1, 1.2);
      const profile = rng.next(); // <0.15 rising demand, >0.9 slow mover
      const rising = profile < 0.15;
      const slow = profile > 0.9;

      const dailyUsage: number[] = [];
      for (let d = 0; d < HISTORY_DAYS; d++) {
        const date = addDays(today, d - HISTORY_DAYS);
        const weekday = date.getUTCDay();
        const weekly = weekday === 5 ? 0.35 : weekday === 6 ? 0.7 : 1.08; // Friday/Saturday weekend pattern
        const seasonal = 1 + 0.18 * Math.sin((2 * Math.PI * (d + 60)) / 365);
        const trend = rising ? 1 + (1.1 * d) / HISTORY_DAYS : 1;
        const rate = (slow ? baseRate * 0.06 : baseRate) * weekly * seasonal * trend;
        const noisy = rate + rng.gauss() * Math.sqrt(Math.max(rate, 0.05)) * 0.6;
        dailyUsage.push(Math.max(0, Math.round(noisy)));
      }

      const leadTimeDays = supplier.promisedLeadDays;
      const avgDaily = dailyUsage.slice(-60).reduce((a, b) => a + b, 0) / 60;
      // Minimum = safety stock; reorder point = minimum + lead-time demand; maximum adds ~6 weeks of cover.
      const minStock = Math.max(2, Math.ceil(avgDaily * leadTimeDays * 0.5));
      const ltDemand = avgDaily * leadTimeDays;
      const maxStock = Math.max(minStock + 5, Math.ceil(minStock + ltDemand + avgDaily * 45));
      let stock: number;
      if (slow) stock = Math.ceil(maxStock * rng.range(1.4, 3.2)); // excess inventory
      else if (rng.chance(0.055)) stock = Math.floor(minStock * rng.range(0.1, 0.85)); // below minimum
      else if (rng.chance(0.08)) stock = Math.ceil(rng.range(minStock * 1.1, minStock + ltDemand * 0.9)); // approaching reorder point
      else stock = Math.ceil(rng.range(minStock + ltDemand * 1.15, maxStock));

      items.push({
        id: `SKU-${skuCounter++}`,
        name,
        category,
        warehouseId: wh.id,
        supplierId: supplier.id,
        unitCost,
        minStock,
        maxStock,
        stock,
        leadTimeDays,
        criticality: usdCost > 300 ? (rng.chance(0.6) ? "Critical" : "High") : weightedCriticality(rng),
        dailyUsage,
      });
    }
  }

  // ---- Assets ---------------------------------------------------------------
  const assets: Asset[] = [];
  const assetCounts: Record<AssetType, number> = {
    Pump: 8, Compressor: 5, Conveyor: 6, Forklift: 6, Generator: 3, "Packaging Line": 4, "Hydraulic Press": 3, Mixer: 3,
  };
  const faultyAssets = new Set<string>();
  for (const def of ASSET_TYPES) {
    for (let n = 1; n <= assetCounts[def.type]; n++) {
      const id = `${def.prefix}-${100 + n}`;
      const siteIdx = rng.int(0, SITES.length - 1);
      const site = SITES[siteIdx];
      const serviceIntervalDays = rng.pick([60, 90, 120, 180]);
      // Most assets serviced on time; ~7% overdue (typical PM compliance 90-95%).
      const overdue = rng.chance(0.07);
      const daysSinceService = overdue
        ? serviceIntervalDays + rng.int(3, 45)
        : rng.int(5, serviceIntervalDays - 1);
      const lastService = addDays(today, -daysSinceService);
      const nextService = addDays(lastService, serviceIntervalDays);

      const whForSite = WAREHOUSES[siteIdx].id;
      const partPool = items.filter((it) => it.warehouseId === whForSite && def.categories.includes(it.category));
      const partIds = Array.from(new Set(Array.from({ length: 3 }, () => (partPool.length ? rng.pick(partPool).id : "")))).filter(Boolean);

      // Simulated sensor histories. A handful of assets develop a fault in the last 7-14 days.
      const isFaulty = rng.chance(0.06) || id === "P-102";
      if (isFaulty) faultyAssets.add(id);
      const faultStart = SENSOR_DAYS - rng.int(7, 14);
      const vibBase = rng.range(1.6, 3.2);
      const [pLo, pHi] = def.pressure;
      const pBase = pHi > 0 ? rng.range(pLo, pHi) : 0;
      const vibration: number[] = [];
      const pressure: number[] = [];
      for (let d = 0; d < SENSOR_DAYS; d++) {
        const drift = isFaulty && d >= faultStart ? (d - faultStart + 1) * rng.range(0.25, 0.45) : 0;
        vibration.push(round(Math.max(0.3, vibBase + drift + rng.gauss() * 0.25)));
        const pDrop = isFaulty && d >= faultStart && pBase > 0 ? -(d - faultStart + 1) * pBase * 0.008 : 0;
        pressure.push(pBase > 0 ? round(pBase + pDrop + rng.gauss() * pBase * 0.015) : 0);
      }

      assets.push({
        id,
        name: `${def.type} ${id}`,
        type: def.type,
        site,
        criticality: weightedCriticality(rng),
        installedYear: rng.int(2012, 2023),
        lastServiceDate: toIso(lastService),
        serviceIntervalDays,
        nextServiceDate: toIso(nextService),
        runningHours: rng.int(4_000, 42_000),
        partIds,
        vibration,
        pressure,
      });
    }
  }

  // Ensure the "connected story": some below-minimum critical parts belong to assets due this week.
  const dueThisWeek = assets.filter((a) => {
    const diff = (new Date(a.nextServiceDate).getTime() - today.getTime()) / DAY;
    return diff >= -30 && diff <= 7;
  });
  for (const a of dueThisWeek.slice(0, 3)) {
    const part = items.find((it) => it.id === a.partIds[0]);
    if (part) {
      part.stock = Math.floor(part.minStock * 0.3);
      part.criticality = "Critical";
    }
  }

  // ---- Inspections (quarterly) ----------------------------------------------
  const inspections: Inspection[] = [];
  const findingsByType: Record<string, string[]> = {
    Pump: ["Seal weeping at gland", "Bearing noise detected", "Coupling misalignment"],
    Compressor: ["Oil carry-over above limit", "Intake filter clogged", "Valve leakage"],
    Conveyor: ["Belt edge fraying", "Idler roller seized", "Splice wear"],
    Forklift: ["Hydraulic hose abrasion", "Mast chain stretch", "Brake wear"],
    Generator: ["Fuel filter restriction", "Loose terminal", "Exhaust leak"],
    "Packaging Line": ["Sensor misreads", "Sealing jaw wear", "Guard interlock fault"],
    "Hydraulic Press": ["Cylinder seal leak", "Pressure fluctuation", "Valve sticking"],
    Mixer: ["Gearbox noise", "Shaft runout", "Agitator blade wear"],
  };
  let inspCounter = 1;
  const repeatFailers = new Set(assets.filter((_, i) => i % 9 === 4).map((a) => a.id));
  for (const a of assets) {
    for (let q = 4; q >= 1; q--) {
      const date = addDays(today, -q * 90 + rng.int(-10, 10));
      const failP = repeatFailers.has(a.id) ? 0.8 : faultyAssets.has(a.id) && q === 1 ? 0.7 : 0.1;
      const fail = rng.chance(failP);
      inspections.push({
        id: `INS-${String(inspCounter++).padStart(4, "0")}`,
        assetId: a.id,
        date: toIso(date),
        result: fail ? "Fail" : "Pass",
        finding: fail ? rng.pick(findingsByType[a.type]) : "No defects found",
      });
    }
  }

  // ---- Purchase orders (12 months) -----------------------------------------
  const purchaseOrders: PurchaseOrder[] = [];
  let poCounter = 1;
  for (const it of items) {
    const sup = suppliers.find((s) => s.id === it.supplierId)!;
    const delayMean = supplierDelayMean.get(sup.id) ?? 0;
    const annualUsage = it.dailyUsage.reduce((a, b) => a + b, 0);
    const orders = Math.max(1, Math.min(10, Math.round(annualUsage / Math.max(1, it.maxStock - it.minStock))));
    for (let k = 0; k < orders; k++) {
      const orderDate = addDays(today, -HISTORY_DAYS + Math.floor(((k + rng.next()) * HISTORY_DAYS) / orders));
      const promised = addDays(orderDate, sup.promisedLeadDays);
      const delay = Math.round(delayMean + rng.gauss() * (delayMean > 0 ? 3.2 : 2.2));
      const delivered = addDays(promised, delay);
      const isOpen = delivered.getTime() > today.getTime();
      const priceDrift = 1 + (k / orders) * 0.06; // gentle inflation
      const anomaly = rng.chance(0.03) ? rng.range(1.18, 1.35) : 1; // occasional overcharge
      purchaseOrders.push({
        id: `PO-${String(24000 + poCounter++)}`,
        supplierId: sup.id,
        itemId: it.id,
        quantity: Math.max(1, Math.round((annualUsage / orders) * rng.range(0.85, 1.15))),
        unitPrice: round(it.unitCost * priceDrift * anomaly * rng.range(0.97, 1.03)),
        orderDate: toIso(orderDate),
        promisedDate: toIso(promised),
        deliveredDate: isOpen ? null : toIso(delivered),
      });
    }
  }
  purchaseOrders.sort((a, b) => a.orderDate.localeCompare(b.orderDate));

  // ---- Invoice history (separate RNG stream so earlier data stays stable) --------
  const irng = createRng(SEED + 7);
  const invSeq = new Map<string, number>();
  const invoices: InvoiceRecord[] = purchaseOrders
    // Deliveries from the last 10 days have not been invoiced yet (those invoices arrive in the inbox).
    .filter((p) => p.deliveredDate && p.deliveredDate < toIso(addDays(today, -10)))
    .map((p) => {
      const n = (invSeq.get(p.supplierId) ?? 1000 + irng.int(0, 400)) + irng.int(1, 9);
      invSeq.set(p.supplierId, n);
      const prefix = (suppliers.find((s) => s.id === p.supplierId)?.name ?? "SUP").replace(/[^A-Za-z ]/g, "").split(" ").map((w) => w[0]).join("").slice(0, 3).toUpperCase();
      const date = addDays(new Date(p.deliveredDate! + "T00:00:00Z"), irng.int(0, 4));
      const net = p.quantity * p.unitPrice;
      return {
        number: `${prefix}-INV-${n}`,
        supplierId: p.supplierId,
        poId: p.id,
        date: toIso(date),
        quantity: p.quantity,
        unitPrice: p.unitPrice,
        total: round(net * 1.05),
        status: date.getTime() < today.getTime() - 20 * DAY ? "Paid" : "Approved",
      };
    });

  // ---- Downtime log (CMMS, 90 days) ------------------------------------------
  const drng = createRng(SEED + 11);
  const BREAKDOWN_CAUSES: Record<string, string[]> = {
    Pump: ["Mechanical seal failure", "Bearing overheating", "Motor trip"],
    Compressor: ["High discharge temperature trip", "Valve failure", "Oil pressure low"],
    Conveyor: ["Belt misalignment", "Drive motor fault", "Roller seizure"],
    Forklift: ["Hydraulic leak", "Battery fault", "Mast chain issue"],
    Generator: ["Fuel filter blockage", "AVR fault", "Cooling fan failure"],
    "Packaging Line": ["Sealer jam", "Sensor misalignment", "PLC fault"],
    "Hydraulic Press": ["Cylinder seal leak", "Pressure loss", "Control valve stuck"],
    Mixer: ["Gearbox failure", "Coupling wear", "Motor overload"],
  };
  const downtime: Downtime[] = [];
  let dtN = 1;
  for (const a of assets) {
    const breakdowns = faultyAssets.has(a.id) ? drng.int(3, 6) : a.criticality === "Critical" ? drng.int(1, 3) : drng.int(0, 2);
    for (let i = 0; i < breakdowns; i++) {
      const daysAgo = faultyAssets.has(a.id) && i === 0 ? drng.int(1, 9) : drng.int(3, 88);
      downtime.push({ id: `DT-${String(dtN++).padStart(4, "0")}`, assetId: a.id, start: toIso(addDays(today, -daysAgo)), hours: round(drng.range(2, faultyAssets.has(a.id) ? 30 : 18)), type: "Breakdown", cause: drng.pick(BREAKDOWN_CAUSES[a.type]) });
    }
    // planned PM stoppages at each service in the window
    const last = new Date(a.lastServiceDate + "T00:00:00Z");
    for (let t = last.getTime(); t > today.getTime() - 90 * DAY; t -= a.serviceIntervalDays * DAY) {
      downtime.push({ id: `DT-${String(dtN++).padStart(4, "0")}`, assetId: a.id, start: toIso(new Date(t)), hours: round(drng.range(6, 16)), type: "Planned", cause: "Preventive maintenance" });
    }
  }
  downtime.sort((x, y) => y.start.localeCompare(x.start));

  return {
    companyName: COMPANY_NAME,
    anchorDate: toIso(today),
    warehouses: WAREHOUSES,
    suppliers,
    items,
    assets,
    inspections,
    purchaseOrders,
    invoices,
    downtime,
  };
}

// The generated dataset lives in Convex (see convex/scioSeed.ts); the app loads it via src/demo/scioData.ts.
