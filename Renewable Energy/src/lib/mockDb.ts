// Reactive In-Memory Client-side Database simulating Convex behavior.
// Extended for Phase 3: Vendors, Warehouses, Inventory, PRs, POs, Cost Centers, Sync Jobs.

export interface Plant {
  _id: string;
  name: string;
  type: "solar" | "wind" | "bess";
  location: string;
  latitude: number;
  longitude: number;
  capacity: number;
  status: "online" | "offline" | "maintenance";
  commissioningDate: string;
  owner: string;
  healthScore: number;
}

export interface Asset {
  _id: string;
  plantId: string;
  name: string;
  type: "panel" | "inverter" | "transformer" | "turbine" | "battery" | "sensor";
  status: "online" | "offline" | "maintenance";
  healthScore: number;
  manufacturer: string;
  serialNumber: string;
  installationDate: string;
  warrantyExpiry: string;
}

export interface EnergyMetric {
  _id: string;
  plantId: string;
  timestamp: number;
  powerOutput: number;
  todayProduction: number;
  stateOfCharge: number;
  stateOfHealth: number;
  frequency: number;
  gridImport: number;
  gridExport: number;
  efficiency: number;
  voltage: number;
  current: number;
}

export interface Weather {
  _id: string;
  plantId: string;
  timestamp: number;
  temperature: number;
  humidity: number;
  windSpeed: number;
  cloudCover: number;
  irradiance: number;
  description: string;
}

export interface Alarm {
  _id: string;
  plantId: string;
  assetId?: string;
  severity: "critical" | "high" | "medium" | "low";
  status: "active" | "acknowledged" | "resolved";
  code: string;
  message: string;
  timestamp: number;
  resolvedAt?: number;
  assignedEngineer?: string;
}

export interface Maintenance {
  _id: string;
  plantId: string;
  assetId: string;
  type: "preventive" | "corrective" | "predictive";
  description: string;
  status: "scheduled" | "in_progress" | "completed";
  scheduledDate: string;
  completedDate?: string;
  engineer: string;
}

export interface AuditLog {
  _id: string;
  plantId?: string;
  action: string;
  details: string;
  timestamp: number;
  operator: string;
}

export interface Notification {
  _id: string;
  type: "alarm" | "maintenance" | "weather" | "system";
  title: string;
  message: string;
  severity: "critical" | "high" | "medium" | "low";
  timestamp: number;
  read: boolean;
}

export interface InspectionTemplate {
  _id: string;
  name: string;
  type: "solar" | "wind" | "bess";
  checklistItems: string[];
}

export interface ChecklistAnswer {
  item: string;
  checked: boolean;
  notes?: string;
}

export interface Inspection {
  _id: string;
  plantId: string;
  assetId: string;
  templateId?: string;
  inspector: string;
  checklist: ChecklistAnswer[];
  status: "pending" | "in_progress" | "completed";
  scheduledDate: string;
  completedDate?: string;
  findings?: string;
  recommendations?: string;
  signature?: string;
  photos?: string[];
}

export interface SparePart {
  name: string;
  quantity: number;
  cost: number;
  partCode: string;
}

export interface WorkOrder {
  _id: string;
  plantId: string;
  assetId: string;
  type: "preventive" | "corrective" | "predictive" | "emergency";
  title: string;
  description: string;
  priority: "critical" | "high" | "medium" | "low";
  status: "draft" | "open" | "assigned" | "in_progress" | "waiting_parts" | "under_review" | "completed" | "closed";
  assignedTechnician?: string;
  scheduledDate: string;
  completedDate?: string;
  estimatedHours: number;
  actualHours?: number;
  spareParts?: SparePart[];
  laborCost?: number;
  materialsCost?: number;
  downtimeHours?: number;
}

export interface Technician {
  _id: string;
  name: string;
  skills: string[];
  status: "active" | "on_leave" | "dispatched";
  workload: number;
}

export interface AiInsight {
  _id: string;
  plantId: string;
  assetId?: string;
  type: "anomaly" | "prediction" | "recommendation" | "risk";
  title: string;
  description: string;
  confidence: number;
  failureProbability?: number;
  remainingUsefulLife?: number;
  riskScore?: number;
  rootCauseAnalysis?: string;
  timestamp: number;
}

/* PHASE 3 INTERFACES */
export interface Vendor {
  _id: string;
  name: string;
  category: "panels" | "turbines" | "batteries" | "logistics" | "services";
  compliance: boolean;
  deliveryRating: number;
  qualityRating: number;
  paymentTerms: string;
  contacts: string;
}

export interface Warehouse {
  _id: string;
  name: string;
  location: string;
  capacity: number;
  utilization: number;
}

export interface InventoryItem {
  _id: string;
  warehouseId: string;
  partName: string;
  partCode: string;
  category: "mechanical" | "electrical" | "consumables";
  quantity: number;
  reserved: number;
  minStock: number;
  maxStock: number;
  unitCost: number;
  binLocation: string;
}

export interface PurchaseRequisition {
  _id: string;
  plantId: string;
  workOrderId?: string;
  title: string;
  requestedBy: string;
  status: "draft" | "pending_approval" | "approved" | "ordered" | "rejected";
  requiredDate: string;
  estimatedCost: number;
  items: {
    partName: string;
    partCode: string;
    quantity: number;
    cost: number;
  }[];
}

export interface PurchaseOrder {
  _id: string;
  prId?: string;
  vendorId: string;
  poNumber: string;
  status: "draft" | "sent" | "delivered" | "invoiced" | "closed";
  totalCost: number;
  items: {
    partName: string;
    partCode: string;
    quantity: number;
    cost: number;
  }[];
  scheduledDeliveryDate: string;
  deliveredDate?: string;
}

export interface CostCenter {
  _id: string;
  code: string;
  name: string;
  allocatedBudget: number;
  spentBudget: number;
  category: "solar" | "wind" | "bess" | "corporate";
}

export interface IntegrationJob {
  _id: string;
  system: "sap" | "oracle" | "dynamics" | "odoo";
  jobType: "sync_inventory" | "sync_invoices" | "sync_pos";
  status: "success" | "running" | "failed";
  lastRun: number;
  recordsSynced: number;
}

export interface IntegrationLog {
  _id: string;
  jobId?: string;
  timestamp: number;
  level: "info" | "warning" | "error";
  message: string;
  payload?: string;
}

export interface Contract {
  _id: string;
  vendorId: string;
  title: string;
  slaAvailability: number;
  slaResponseHours: number;
  penaltyRatePerHour: number;
  status: "active" | "terminated";
}

export interface PPABilling {
  _id: string;
  plantId: string;
  billingPeriod: string;
  mwhGenerated: number;
  tariffRate: number;
  totalRevenue: number;
  status: "pending" | "settled";
}

export interface Shipment {
  _id: string;
  poId?: string;
  partCode: string;
  carrier: string;
  origin: string;
  status: "in_transit" | "customs" | "delivered";
  eta: string;
}

class MockDbStore {
  plants: Plant[] = [];
  assets: Asset[] = [];
  energyMetrics: EnergyMetric[] = [];
  weather: Weather[] = [];
  alarms: Alarm[] = [];
  maintenance: Maintenance[] = [];
  auditLogs: AuditLog[] = [];
  notifications: Notification[] = [];
  inspectionTemplates: InspectionTemplate[] = [];
  inspections: Inspection[] = [];
  workOrders: WorkOrder[] = [];
  technicians: Technician[] = [];
  aiInsights: AiInsight[] = [];

  // Phase 3 Collections
  vendors: Vendor[] = [];
  warehouses: Warehouse[] = [];
  inventoryItems: InventoryItem[] = [];
  purchaseRequisitions: PurchaseRequisition[] = [];
  purchaseOrders: PurchaseOrder[] = [];
  costCenters: CostCenter[] = [];
  integrationJobs: IntegrationJob[] = [];
  integrationLogs: IntegrationLog[] = [];
  contracts: Contract[] = [];
  ppaBillings: PPABilling[] = [];
  shipments: Shipment[] = [];

  private listeners: Set<() => void> = new Set();

  constructor() {
    this.seed();
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach((l) => l());
  }

  private seed() {
    // [Site/Assets/Telemetry seeding remains identical to Phase 2 to ensure integrity]
    const plantDefs = [
      { name: "Mojave Solar One", type: "solar" as const, location: "San Bernardino, CA", lat: 35.011, lng: -117.123, cap: 280, owner: "Siemens Energy Partners", health: 94 },
      { name: "Desert Sunlight Project", type: "solar" as const, location: "Riverside County, CA", lat: 33.823, lng: -115.394, cap: 550, owner: "GE Vernova Assets", health: 91 },
      { name: "El Dorado Solar", type: "solar" as const, location: "Boulder City, NV", lat: 35.792, lng: -114.968, cap: 150, owner: "Tesla Energy Operations", health: 96 },
      { name: "Red Mesa Solar", type: "solar" as const, location: "Cibola, NM", lat: 35.138, lng: -107.822, cap: 102, owner: "Apex Renewable Energy", health: 88 },
      { name: "Saguaro Sun Power", type: "solar" as const, location: "Maricopa County, AZ", lat: 33.150, lng: -112.512, cap: 210, owner: "NextEra Portfolio", health: 93 },
      { name: "Valley Verde Solar Center", type: "solar" as const, location: "Pinal, AZ", lat: 32.885, lng: -111.758, cap: 125, owner: "Siemens Energy Partners", health: 95 },
      { name: "Plains Solar Farm", type: "solar" as const, location: "Lubbock, TX", lat: 33.578, lng: -101.855, cap: 180, owner: "Texas Power Grid Corp", health: 89 },
      { name: "Rio Grande Solar", type: "solar" as const, location: "Val Verde, TX", lat: 29.362, lng: -100.896, cap: 95, owner: "Rio Energy Co", health: 92 },
      { name: "Apache Solar Station", type: "solar" as const, location: "Cochise, AZ", lat: 31.897, lng: -109.845, cap: 85, owner: "Arizona Solar Trust", health: 87 },
      { name: "Helios Solar Park", type: "solar" as const, location: "El Paso, TX", lat: 31.761, lng: -106.485, cap: 160, owner: "Texas Power Grid Corp", health: 94 },
      { name: "Lone Star Solar Project", type: "solar" as const, location: "Midland, TX", lat: 31.997, lng: -102.078, cap: 250, owner: "Tesla Energy Operations", health: 97 },
      { name: "Sun Valley Ranch", type: "solar" as const, location: "Kern County, CA", lat: 35.345, lng: -118.895, cap: 110, owner: "NextEra Portfolio", health: 90 },
      { name: "Desert Wind & Sun", type: "solar" as const, location: "San Juan, NM", lat: 36.751, lng: -108.218, cap: 135, owner: "Apex Renewable Energy", health: 92 },
      { name: "Phoenix Solar Array", type: "solar" as const, location: "Buckeye, AZ", lat: 33.370, lng: -112.583, cap: 300, owner: "GE Vernova Assets", health: 93 },
      { name: "Tucson Energy Center", type: "solar" as const, location: "Pima County, AZ", lat: 32.221, lng: -110.975, cap: 140, owner: "Arizona Solar Trust", health: 95 },
      { name: "Pecos Solar Station", type: "solar" as const, location: "Pecos, TX", lat: 31.422, lng: -103.493, cap: 220, owner: "Texas Power Grid Corp", health: 91 },
      { name: "West Texas Sun", type: "solar" as const, location: "Ward, TX", lat: 31.583, lng: -103.184, cap: 175, owner: "Rio Energy Co", health: 96 },
      { name: "Rio Bravo Solar", type: "solar" as const, location: "Zapata, TX", lat: 26.908, lng: -99.271, cap: 115, owner: "Rio Energy Co", health: 86 },
      { name: "Arid Plains Solar", type: "solar" as const, location: "Eddy, NM", lat: 32.421, lng: -104.228, cap: 90, owner: "Apex Renewable Energy", health: 93 },
      { name: "Gila Bend Solar", type: "solar" as const, location: "Gila Bend, AZ", lat: 32.948, lng: -112.716, cap: 200, owner: "GE Vernova Assets", health: 91 },

      // Wind (20 plants)
      { name: "Alta Wind Energy Center", type: "wind" as const, location: "Tehachapi Pass, CA", lat: 35.021, lng: -118.312, cap: 1548, owner: "GE Vernova Assets", health: 93 },
      { name: "Shepherds Flat Wind", type: "wind" as const, location: "Gilliam County, OR", lat: 45.698, lng: -120.612, cap: 845, owner: "Siemens Energy Partners", health: 92 },
      { name: "Roscoe Wind Farm", type: "wind" as const, location: "Roscoe, TX", lat: 32.378, lng: -100.538, cap: 781, owner: "Texas Power Grid Corp", health: 89 },
      { name: "Horse Hollow Wind", type: "wind" as const, location: "Taylor County, TX", lat: 32.188, lng: -100.118, cap: 735, owner: "Texas Power Grid Corp", health: 91 },
      { name: "Blue Canyon Wind", type: "wind" as const, location: "Saddle Mountain, OK", lat: 34.821, lng: -98.572, cap: 350, owner: "Apex Renewable Energy", health: 94 },
      { name: "Fowler Ridge Wind", type: "wind" as const, location: "Benton County, IN", lat: 40.612, lng: -87.322, cap: 600, owner: "NextEra Portfolio", health: 90 },
      { name: "Sweetwater Wind", type: "wind" as const, location: "Nolan County, TX", lat: 32.485, lng: -100.412, cap: 585, owner: "Rio Energy Co", health: 88 },
      { name: "Buffalo Gap Wind", type: "wind" as const, location: "Abilene, TX", lat: 32.278, lng: -99.882, cap: 524, owner: "Texas Power Grid Corp", health: 92 },
      { name: "Caprock Wind Ranch", type: "wind" as const, location: "Quay County, NM", lat: 35.031, lng: -103.352, cap: 120, owner: "Apex Renewable Energy", health: 91 },
      { name: "San Gorgonio Wind Pass", type: "wind" as const, location: "Palm Springs, CA", lat: 33.918, lng: -116.658, cap: 360, owner: "GE Vernova Assets", health: 87 },
      { name: "Tehachapi Wind Array", type: "wind" as const, location: "Kern County, CA", lat: 35.088, lng: -118.258, cap: 420, owner: "Siemens Energy Partners", health: 93 },
      { name: "Great Plains Wind Farm", type: "wind" as const, location: "Dodge City, KS", lat: 37.752, lng: -100.018, cap: 280, owner: "NextEra Portfolio", health: 95 },
      { name: "High Lonesome Wind", type: "wind" as const, location: "Crockett, TX", lat: 30.712, lng: -101.352, cap: 500, owner: "Texas Power Grid Corp", health: 94 },
      { name: "Cedar Creek Wind", type: "wind" as const, location: "Weld County, CO", lat: 40.852, lng: -104.225, cap: 300, owner: "Tesla Energy Operations", health: 91 },
      { name: "Limestone Wind", type: "wind" as const, location: "Limestone, TX", lat: 31.428, lng: -96.582, cap: 220, owner: "Rio Energy Co", health: 92 },
      { name: "Dry Lake Wind", type: "wind" as const, location: "Navajo, AZ", lat: 34.452, lng: -110.155, cap: 127, owner: "Arizona Solar Trust", health: 89 },
      { name: "Blowing Winds Farm", type: "wind" as const, location: "Carbon County, WY", lat: 41.682, lng: -106.218, cap: 340, owner: "Apex Renewable Energy", health: 90 },
      { name: "Coastal Breeze Wind", type: "wind" as const, location: "Kenedy County, TX", lat: 26.921, lng: -97.682, cap: 400, owner: "Rio Energy Co", health: 93 },
      { name: "Thunder Mountain Wind", type: "wind" as const, location: "Elmore, ID", lat: 43.155, lng: -115.588, cap: 180, owner: "NextEra Portfolio", health: 91 },
      { name: "Silver Peak Wind", type: "wind" as const, location: "Esmeralda, NV", lat: 37.755, lng: -117.618, cap: 150, owner: "Tesla Energy Operations", health: 94 },

      // BESS (10 plants)
      { name: "Moss Landing Storage", type: "bess" as const, location: "Monterey County, CA", lat: 36.804, lng: -121.786, cap: 400, owner: "Tesla Energy Operations", health: 97 },
      { name: "Gateway Battery Storage", type: "bess" as const, location: "San Diego, CA", lat: 32.552, lng: -116.912, cap: 250, owner: "GE Vernova Assets", health: 94 },
      { name: "Valley Center BESS", type: "bess" as const, location: "Valley Center, CA", lat: 33.228, lng: -117.018, cap: 140, owner: "Siemens Energy Partners", health: 95 },
      { name: "Pecos Battery Array", type: "bess" as const, location: "Pecos County, TX", lat: 30.852, lng: -102.882, cap: 100, owner: "Texas Power Grid Corp", health: 93 },
      { name: "Hornsdale Storage North", type: "bess" as const, location: "Austin, TX", lat: 30.267, lng: -97.743, cap: 150, owner: "Tesla Energy Operations", health: 98 },
      { name: "Redwood Battery Reserve", type: "bess" as const, location: "Sonoma, CA", lat: 38.291, lng: -122.458, cap: 80, owner: "NextEra Portfolio", health: 96 },
      { name: "Falcon Battery Hub", type: "bess" as const, location: "El Paso, TX", lat: 31.812, lng: -106.322, cap: 120, owner: "Texas Power Grid Corp", health: 92 },
      { name: "Sienna BESS", type: "bess" as const, location: "Sugar Land, TX", lat: 29.598, lng: -95.622, cap: 75, owner: "Rio Energy Co", health: 95 },
      { name: "Cobalt Energy Storage", type: "bess" as const, location: "Reno, NV", lat: 39.529, lng: -119.813, cap: 110, owner: "Tesla Energy Operations", health: 96 },
      { name: "Titan Grid Reserve", type: "bess" as const, location: "Phoenix, AZ", lat: 33.448, lng: -112.074, cap: 200, owner: "GE Vernova Assets", health: 94 },
    ];

    // Seed Plants
    this.plants = plantDefs.map((p, idx) => ({
      _id: `plant_${idx + 1}`,
      name: p.name,
      type: p.type,
      location: p.location,
      latitude: p.lat,
      longitude: p.lng,
      capacity: p.cap,
      status: p.health > 92 ? "online" : p.health > 88 ? "maintenance" : "offline",
      commissioningDate: new Date(Date.now() - Math.random() * 8 * 365 * 24 * 3600 * 1000).toISOString().split("T")[0],
      owner: p.owner,
      healthScore: p.health,
    }));

    const solarMfrs = ["First Solar", "Trina Solar", "JinkoSolar", "Canadian Solar", "SMA Solar"];
    const windMfrs = ["GE Renewable Energy", "Vestas", "Siemens Gamesa", "Goldwind", "Nordex"];
    const bessMfrs = ["Tesla Energy", "Fluence", "LG Energy Solution", "Samsung SDI", "BYD"];

    // Seed Assets
    let assetIdx = 1;
    for (const p of this.plants) {
      let assetTypes: string[] = [];
      let mfrs: string[] = [];

      if (p.type === "solar") {
        assetTypes = ["panel", "panel", "inverter", "inverter", "transformer", "sensor"];
        mfrs = solarMfrs;
      } else if (p.type === "wind") {
        assetTypes = ["turbine", "turbine", "turbine", "turbine", "transformer", "sensor"];
        mfrs = windMfrs;
      } else {
        assetTypes = ["battery", "battery", "inverter", "transformer", "sensor", "sensor"];
        mfrs = bessMfrs;
      }

      for (let i = 0; i < assetTypes.length; i++) {
        const type = assetTypes[i];
        const status = p.healthScore > 90 ? "online" : Math.random() > 0.35 ? "online" : "maintenance";
        const healthScore = Math.min(100, Math.max(40, p.healthScore - 6 + Math.random() * 12));

        this.assets.push({
          _id: `asset_${assetIdx++}`,
          plantId: p._id,
          name: `${p.name} - ${type.charAt(0).toUpperCase() + type.slice(1)} ${i + 1}`,
          type: type as any,
          status: status as any,
          healthScore: parseFloat(healthScore.toFixed(1)),
          manufacturer: mfrs[Math.floor(Math.random() * mfrs.length)],
          serialNumber: `SN-${p.type.substring(0, 2).toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`,
          installationDate: new Date(Date.now() - Math.random() * 5 * 365 * 24 * 3600 * 1000).toISOString().split("T")[0],
          warrantyExpiry: new Date(Date.now() + Math.random() * 8 * 365 * 24 * 3600 * 1000).toISOString().split("T")[0],
        });
      }
    }

    const nowMs = Date.now();
    const oneDayMs = 24 * 3600 * 1000;
    let metricIdx = 1;
    let weatherIdx = 1;

    for (const p of this.plants) {
      for (let d = 30; d >= 0; d--) {
        const timestamp = nowMs - d * oneDayMs;
        const hourScale = d === 0 ? 0.6 : 1.0;

        let baseEff = p.healthScore / 100;
        let powerOutput = 0;
        let todayProduction = 0;
        let stateOfCharge = 0;
        let stateOfHealth = p.healthScore;
        let gridImport = 0;
        let gridExport = 0;

        if (p.type === "solar") {
          powerOutput = d === 0 ? p.capacity * 0.45 : 0;
          todayProduction = p.capacity * 24 * 0.22 * baseEff * hourScale * (0.8 + Math.random() * 0.4);
          gridExport = powerOutput;
        } else if (p.type === "wind") {
          powerOutput = (0.2 + Math.random() * 0.65) * p.capacity;
          todayProduction = p.capacity * 24 * 0.38 * baseEff * hourScale * (0.75 + Math.random() * 0.5);
          gridExport = powerOutput;
        } else {
          stateOfCharge = 15 + Math.floor(Math.random() * 75);
          powerOutput = (Math.random() - 0.48) * p.capacity * 0.4;
          todayProduction = Math.abs(powerOutput) * 24 * hourScale * 0.82;
          if (powerOutput > 0) {
            gridExport = powerOutput;
          } else {
            gridImport = Math.abs(powerOutput);
          }
        }

        this.energyMetrics.push({
          _id: `metric_${metricIdx++}`,
          plantId: p._id,
          timestamp,
          powerOutput: parseFloat(powerOutput.toFixed(2)),
          todayProduction: parseFloat(todayProduction.toFixed(2)),
          stateOfCharge,
          stateOfHealth,
          frequency: parseFloat((59.96 + Math.random() * 0.08).toFixed(3)),
          gridImport: parseFloat(gridImport.toFixed(2)),
          gridExport: parseFloat(gridExport.toFixed(2)),
          efficiency: parseFloat((baseEff * 100).toFixed(1)),
          voltage: parseFloat((345000 + (Math.random() - 0.5) * 4000).toFixed(0)),
          current: parseFloat(((Math.abs(powerOutput) * 1e6) / (345000 * Math.sqrt(3))).toFixed(1)),
        });

        let temp = p.type === "solar" ? 25 + Math.random() * 15 : 12 + Math.random() * 18;
        let windSpeed = p.type === "wind" ? 8 + Math.random() * 14 : 2 + Math.random() * 8;
        let cloudCover = p.type === "solar" ? Math.random() * 25 : Math.random() * 80;
        let irradiance = p.type === "solar" ? (cloudCover > 15 ? 450 : 850) : 0;
        let desc = p.type === "solar" ? "Sunny" : p.type === "wind" ? "Windy" : "Clear";

        this.weather.push({
          _id: `weather_${weatherIdx++}`,
          plantId: p._id,
          timestamp,
          temperature: parseFloat(temp.toFixed(1)),
          humidity: Math.floor(25 + Math.random() * 55),
          windSpeed: parseFloat(windSpeed.toFixed(1)),
          cloudCover: Math.floor(cloudCover),
          irradiance,
          description: desc,
        });
      }
    }

    const engineers = ["Sarah Connor", "John Doe", "Marcus Vance", "Elena Rostova", "Devon Cole"];
    const alarmTemplates = [
      { code: "INV_OVERHEAT", msg: "Inverter module internal temperature exceeded threshold (85°C)", sev: "critical" as const },
      { code: "XFMR_OIL_TEMP", msg: "Transformer oil temperature high warning", sev: "high" as const },
      { code: "COMM_LOSS", msg: "Communication loss with string tracker controller #14", sev: "medium" as const },
      { code: "TURB_YAW_FAIL", msg: "Wind turbine yaw adjustment failure", sev: "critical" as const },
      { code: "BATT_CELL_DEV", msg: "Battery rack cell voltage deviation warning", sev: "high" as const },
    ];

    let alarmIdx = 1;
    const troubledPlants = this.plants.filter((p) => p.healthScore < 95).slice(0, 12);
    troubledPlants.forEach((p, i) => {
      const template = alarmTemplates[i % alarmTemplates.length];
      const plantAssets = this.assets.filter((a) => a.plantId === p._id);
      const asset = plantAssets[Math.floor(Math.random() * plantAssets.length)];

      this.alarms.push({
        _id: `alarm_${alarmIdx++}`,
        plantId: p._id,
        assetId: asset?._id,
        severity: template.sev,
        status: Math.random() > 0.5 ? "acknowledged" : "active",
        code: template.code,
        message: `${asset ? asset.type.toUpperCase() + ": " : ""}${template.msg}`,
        timestamp: nowMs - Math.random() * 36 * 3600 * 1000,
        assignedEngineer: engineers[Math.floor(Math.random() * engineers.length)],
      });

      this.notifications.push({
        _id: `notif_${alarmIdx}`,
        type: "alarm",
        title: `CRITICAL ALERT: ${p.name}`,
        message: template.msg,
        severity: template.sev,
        timestamp: nowMs - Math.random() * 4 * 3600 * 1000,
        read: false,
      });
    });

    const maintenanceTypes = [
      { desc: "Biannual panel washing and tracker alignment check", type: "preventive" as const },
      { desc: "Replacement of cooling system air filters in BESS container", type: "preventive" as const },
      { desc: "Turbine gearbox bearing lubrication and vibration check", type: "preventive" as const },
      { desc: "Corrective fuse replacement in Inverter box 4", type: "corrective" as const },
    ];

    let maintIdx = 1;
    for (let i = 0; i < 20; i++) {
      const p = this.plants[Math.floor(Math.random() * this.plants.length)];
      const plantAssets = this.assets.filter((a) => a.plantId === p._id);
      const asset = plantAssets[Math.floor(Math.random() * plantAssets.length)];
      const task = maintenanceTypes[i % maintenanceTypes.length];
      const isPast = i >= 8;

      this.maintenance.push({
        _id: `maint_${maintIdx++}`,
        plantId: p._id,
        assetId: asset._id,
        type: task.type,
        description: task.desc,
        status: !isPast ? (i < 4 ? "scheduled" : "in_progress") : "completed",
        scheduledDate: new Date(Date.now() + (!isPast ? (Math.random() * 5 * 24 * 3600 * 1000) : -(Math.random() * 15 * 24 * 3600 * 1000))).toISOString().split("T")[0],
        completedDate: isPast ? new Date(Date.now() - (Math.random() * 10 * 24 * 3600 * 1000)).toISOString().split("T")[0] : undefined,
        engineer: engineers[Math.floor(Math.random() * engineers.length)],
      });
    }

    const techDefs = [
      { name: "Sarah Connor", skills: ["BESS Cell Diagnostics", "Cooling Loop Calibration"], status: "active" as const, workload: 2 },
      { name: "John Doe", skills: ["Solar Tracker Lubrication", "Inverter Fuse Fitting"], status: "active" as const, workload: 3 },
      { name: "Marcus Vance", skills: ["High Voltage Substation Repairs", "Transformer Oil Sampling"], status: "dispatched" as const, workload: 1 },
      { name: "Elena Rostova", skills: ["Turbine Yaw Calibration", "Hydraulic Pitch Diagnostics"], status: "active" as const, workload: 2 },
      { name: "Devon Cole", skills: ["Grid Breaker Synchronization", "SCADA Sensor Wiring"], status: "active" as const, workload: 0 },
      { name: "Clara Barton", skills: ["BESS Cell Balancing", "HV Electrical Safety"], status: "on_leave" as const, workload: 0 },
      { name: "Alex Mercer", skills: ["Solar PV Cleaning Systems", "Thermal Imaging"], status: "dispatched" as const, workload: 4 },
      { name: "Bruce Wayne", skills: ["Turbine Vibration Testing", "Ultrasonic Blade Scans"], status: "active" as const, workload: 1 },
    ];

    this.technicians = techDefs.map((t, idx) => ({
      _id: `tech_${idx + 1}`,
      name: t.name,
      skills: t.skills,
      status: t.status,
      workload: t.workload,
    }));

    const templates = [
      {
        name: "Solar PV Maintenance Checklist",
        type: "solar" as const,
        checklistItems: [
          "Inspect tracker mechanical gear wear & lubrication",
          "Test string electrical VOC and ISC ratios",
          "Perform module infrared thermal imaging hot-spot scan",
          "Check inverter cooling fans & ventilation filter blocks",
        ],
      },
      {
        name: "Wind Turbine Safety Checklist",
        type: "wind" as const,
        checklistItems: [
          "Check main gearbox oil pressure & inspect magnetic plugs",
          "Inspect pitch hydraulic fluid pressure and line sealants",
          "Perform ultrasonic scan of blades for micro-cracks",
        ],
      },
    ];

    this.inspectionTemplates = templates.map((t, idx) => ({
      _id: `template_${idx + 1}`,
      name: t.name,
      type: t.type,
      checklistItems: t.checklistItems,
    }));

    let inspIdx = 1;
    for (let i = 0; i < 20; i++) {
      const p = this.plants[i % this.plants.length];
      const pAssets = this.assets.filter((a) => a.plantId === p._id);
      const asset = pAssets[i % pAssets.length] || this.assets[0];
      const template = this.inspectionTemplates.find((t) => t.type === p.type) || this.inspectionTemplates[0];

      this.inspections.push({
        _id: `insp_${inspIdx++}`,
        plantId: p._id,
        assetId: asset._id,
        templateId: template._id,
        inspector: this.technicians[i % this.technicians.length].name,
        checklist: template.checklistItems.map(item => ({ item, checked: true })),
        status: "completed",
        scheduledDate: new Date(Date.now() - i * oneDayMs).toISOString().split("T")[0],
        completedDate: new Date(Date.now() - i * oneDayMs).toISOString().split("T")[0],
        findings: "All systems checked nominal.",
      });
    }

    let woIdx = 1;
    for (let i = 0; i < 30; i++) {
      const p = this.plants[i % this.plants.length];
      const pAssets = this.assets.filter((a) => a.plantId === p._id);
      const asset = pAssets[i % pAssets.length] || this.assets[0];

      const statuses = ["open", "assigned", "in_progress", "waiting_parts", "completed"] as const;
      const priorities = ["critical", "high", "medium", "low"] as const;

      const status = statuses[i % statuses.length];
      const priority = priorities[i % priorities.length];

      this.workOrders.push({
        _id: `wo_${woIdx++}`,
        plantId: p._id,
        assetId: asset._id,
        type: i % 3 === 0 ? "preventive" : "corrective",
        title: `Asset calibration ${woIdx}`,
        description: `Routine EAM scheduled calibrations. Check status logs.`,
        priority,
        status,
        assignedTechnician: this.technicians[i % this.technicians.length].name,
        scheduledDate: new Date(Date.now() + (status === "completed" ? -i * oneDayMs : i * 2 * oneDayMs)).toISOString().split("T")[0],
        estimatedHours: 4,
        laborCost: status === "completed" ? 250 : 0,
        materialsCost: status === "completed" ? 150 : 0,
        downtimeHours: status === "completed" && priority === "critical" ? 2.5 : 0,
      });
    }

    /* =========================================================================
       PHASE 3 ENTERPRISE SEEDING
       ========================================================================= */

    // 1. Seed Vendors
    const vendorDefs = [
      { name: "First Solar Panels Inc", category: "panels" as const, compliance: true, deliveryRating: 95, qualityRating: 98, paymentTerms: "Net 30", contacts: "rep@firstsolar.com" },
      { name: "Vestas Blade Mechanics", category: "turbines" as const, compliance: true, deliveryRating: 91, qualityRating: 94, paymentTerms: "Net 45", contacts: "rep@vestas.com" },
      { name: "Fluence Battery Systems", category: "batteries" as const, compliance: true, deliveryRating: 94, qualityRating: 96, paymentTerms: "Net 30", contacts: "rep@fluence.com" },
      { name: "ABB Transformer Grid", category: "services" as const, compliance: true, deliveryRating: 96, qualityRating: 95, paymentTerms: "Net 15", contacts: "rep@abb.com" },
      { name: "SMA Inverters Co", category: "panels" as const, compliance: true, deliveryRating: 89, qualityRating: 93, paymentTerms: "Net 30", contacts: "rep@sma.com" },
      { name: "Apex Logistics Global", category: "logistics" as const, compliance: true, deliveryRating: 97, qualityRating: 92, paymentTerms: "Net 30", contacts: "dispatch@apexlog.com" },
      { name: "Siemens Gamesa Parts", category: "turbines" as const, compliance: true, deliveryRating: 92, qualityRating: 95, paymentTerms: "Net 45", contacts: "rep@siemens.com" },
      { name: "Maximo Field Services", category: "services" as const, compliance: false, deliveryRating: 84, qualityRating: 87, paymentTerms: "Net 30", contacts: "support@maximo.com" },
    ];

    this.vendors = vendorDefs.map((v, idx) => ({
      _id: `vendor_${idx + 1}`,
      name: v.name,
      category: v.category,
      compliance: v.compliance,
      deliveryRating: v.deliveryRating,
      qualityRating: v.qualityRating,
      paymentTerms: v.paymentTerms,
      contacts: v.contacts,
    }));

    // 2. Seed Warehouses
    const warehouseDefs = [
      { name: "West Coast Logistics", location: "Oakland, CA", capacity: 45000, utilization: 62 },
      { name: "Mid-West Distribution Hub", location: "Chicago, IL", capacity: 60000, utilization: 48 },
      { name: "Texas Warehouse Terminal", location: "Houston, TX", capacity: 50000, utilization: 74 },
    ];

    this.warehouses = warehouseDefs.map((w, idx) => ({
      _id: `wh_${idx + 1}`,
      name: w.name,
      location: w.location,
      capacity: w.capacity,
      utilization: w.utilization,
    }));

    // 3. Seed Inventory Spare Parts
    const partsDefs = [
      { name: "300A Substation Inverter Fuse", code: "INV-FUSE-300", cat: "electrical" as const, qty: 15, res: 0, min: 5, max: 30, cost: 120, bin: "A-12" },
      { name: "Cooling Fan Air Filter Panel", code: "BESS-FLTR-88", cat: "electrical" as const, qty: 3, res: 2, min: 10, max: 50, cost: 45, bin: "B-04" }, // below reorder point
      { name: "Substation Sub-transformer Seal Ring", code: "XFMR-SEAL-01", cat: "mechanical" as const, qty: 8, res: 0, min: 2, max: 10, cost: 85, bin: "C-08" },
      { name: "Wind Yaw Pinion Drive Bearing", code: "TURB-BRNG-99", cat: "mechanical" as const, qty: 1, res: 0, min: 2, max: 6, cost: 450, bin: "D-15" }, // below reorder point
      { name: "BESS HVAC Exchanger Pump Motor", code: "BESS-MOTR-45", cat: "mechanical" as const, qty: 4, res: 1, min: 2, max: 8, cost: 350, bin: "E-01" },
    ];

    let invPartIdx = 1;
    this.warehouses.forEach(wh => {
      partsDefs.forEach(p => {
        this.inventoryItems.push({
          _id: `inv_${invPartIdx++}`,
          warehouseId: wh._id,
          partName: p.name,
          partCode: p.code,
          category: p.cat,
          quantity: p.qty,
          reserved: p.res,
          minStock: p.min,
          maxStock: p.max,
          unitCost: p.cost,
          binLocation: p.bin,
        });
      });
    });

    // 4. Seed Purchase Requisitions
    for (let i = 0; i < 15; i++) {
      const p = this.plants[i % this.plants.length];
      const statuses = ["draft", "pending_approval", "approved", "ordered", "rejected"] as const;
      
      this.purchaseRequisitions.push({
        _id: `pr_${i + 1}`,
        plantId: p._id,
        title: `Restock Inverter components - batch ${i + 1}`,
        requestedBy: "Operations Warehouse Supervisor",
        status: statuses[i % statuses.length],
        requiredDate: new Date(Date.now() + i * oneDayMs).toISOString().split("T")[0],
        estimatedCost: 1500,
        items: [
          { partName: "300A Substation Inverter Fuse", partCode: "INV-FUSE-300", quantity: 10, cost: 120 }
        ],
      });
    }

    // 5. Seed Purchase Orders
    for (let i = 0; i < 20; i++) {
      const v = this.vendors[i % this.vendors.length];
      const statuses = ["draft", "sent", "delivered", "invoiced", "closed"] as const;
      const poNum = `PO-2026-${1000 + i}`;

      this.purchaseOrders.push({
        _id: `po_${i + 1}`,
        vendorId: v._id,
        poNumber: poNum,
        status: statuses[i % statuses.length],
        totalCost: 1800,
        items: [
          { partName: "BESS HVAC Exchanger Pump Motor", partCode: "BESS-MOTR-45", quantity: 4, cost: 350 }
        ],
        scheduledDeliveryDate: new Date(Date.now() + 6 * oneDayMs).toISOString().split("T")[0],
        deliveredDate: i % 3 === 0 ? new Date(Date.now() - oneDayMs).toISOString().split("T")[0] : undefined,
      });
    }

    // 6. Seed Cost Centers
    const cCenters = [
      { code: "CC-SOL-01", name: "Mojave Solar Operations", allocated: 1500000, spent: 485000, cat: "solar" as const },
      { code: "CC-WND-02", name: "Alta Wind Operations", allocated: 2500000, spent: 920000, cat: "wind" as const },
      { code: "CC-BES-03", name: "Moss Landing Storage", allocated: 1200000, spent: 310000, cat: "bess" as const },
      { code: "CC-CORP-00", name: "Corporate Operations", allocated: 800000, spent: 240000, cat: "corporate" as const },
    ];

    this.costCenters = cCenters.map((cc, idx) => ({
      _id: `cc_${idx + 1}`,
      code: cc.code,
      name: cc.name,
      allocatedBudget: cc.allocated,
      spentBudget: cc.spent,
      category: cc.cat,
    }));

    // 7. Seed Integration Sync Jobs
    const erpSystems = ["sap", "oracle", "dynamics", "odoo"] as const;
    const syncTypes = ["sync_inventory", "sync_invoices", "sync_pos"] as const;

    let jobIdx = 1;
    let logIdx = 1;

    erpSystems.forEach(sys => {
      syncTypes.forEach(type => {
        const jobId = `job_${jobIdx++}`;
        this.integrationJobs.push({
          _id: jobId,
          system: sys,
          jobType: type,
          status: "success",
          lastRun: nowMs - Math.random() * 4 * 3600 * 1000,
          recordsSynced: Math.floor(10 + Math.random() * 45),
        });

        // Seed logs
        this.integrationLogs.push({
          _id: `log_${logIdx++}`,
          jobId,
          timestamp: nowMs - Math.random() * 2 * 3600 * 1000,
          level: "info",
          message: `Synchronized ledger objects with external instance of ${sys.toUpperCase()}`,
        });
      });
    });

    // 8. Seed Advanced ERP (Contracts, PPA Billings, and Cargo Shipments)
    this.vendors.forEach((vendor, idx) => {
      this.contracts.push({
        _id: `ct_${idx + 1}`,
        vendorId: vendor._id,
        title: `${vendor.name} Service Level SLA Agreement`,
        slaAvailability: 98.5,
        slaResponseHours: 4.0,
        penaltyRatePerHour: 150.0,
        status: "active"
      });
    });

    this.plants.slice(0, 10).forEach((plant, idx) => {
      const mwh = 1200 + Math.random() * 800;
      const rate = plant.type === "solar" ? 45 : plant.type === "wind" ? 38 : 65;
      this.ppaBillings.push({
        _id: `ppa_${idx + 1}`,
        plantId: plant._id,
        billingPeriod: "2026-Q2",
        mwhGenerated: parseFloat(mwh.toFixed(1)),
        tariffRate: rate,
        totalRevenue: parseFloat((mwh * rate).toFixed(2)),
        status: idx % 2 === 0 ? "settled" : "pending"
      });
    });

    const carriers = ["Maersk Logistics", "MSC Cargo", "DHL Global Forwarding", "Kuehne + Nagel"];
    const origins = ["Esbjerg Port, Denmark", "Shanghai Terminal, China", "Hamburg Port, Germany", "Houston Logistics Center, TX"];
    const parts = ["TURB-BRNG-99", "INV-FUSE-300", "BESS-FLTR-88", "BESS-MOTR-45"];

    for (let i = 0; i < 4; i++) {
      this.shipments.push({
        _id: `ship_${i + 1}`,
        partCode: parts[i],
        carrier: carriers[i],
        origin: origins[i],
        status: i === 3 ? "delivered" : i === 2 ? "customs" : "in_transit",
        eta: new Date(Date.now() + (i + 2) * 24 * 3600 * 1000).toISOString().split("T")[0]
      });
    }

    // Add NERC security compliance logs to audit logs
    const complianceEvents = [
      { action: "SCADA Setpoint Hardening", details: "Interconnection telemetry frequency deviation control loop hardened." },
      { action: "Interconnection Verification", details: "Verified generation export output values conform to FERC regulatory criteria." },
      { action: "Breaker Lockout Tagout", details: "Substation breaker tagged out for safe preventive diagnostic inspection." },
      { action: "NERC Cyber CIP Scan", details: "Network security audit logged: zero unauthorized access attempts reported." }
    ];

    complianceEvents.forEach((ev, idx) => {
      this.auditLogs.push({
        _id: `aud_comp_${idx + 1}`,
        plantId: undefined,
        action: ev.action,
        details: ev.details,
        timestamp: nowMs - (idx + 1) * 3 * 3600 * 1000,
        operator: "Regulatory Compliance Officer"
      });
    });

    // Seed AI Insights
    this.aiInsights = [
      { _id: "insight_1", plantId: "plant_3", assetId: "asset_15", type: "anomaly", title: "BESS Battery Thermal Deviation", description: "Battery cell #42 temperature is 12°C above rack average. Potential thermal runaway risk.", confidence: 88, failureProbability: 34, remainingUsefulLife: 42, riskScore: 82, rootCauseAnalysis: "Cell degradation / internal resistance increase", timestamp: nowMs - 3600000 },
      { _id: "insight_2", plantId: "plant_2", assetId: "asset_20", type: "risk", title: "Turbine Blade Erosion", description: "Blade aerodynamic profiling indicates severe surface erosion on turbines B-05 through B-09.", confidence: 76, failureProbability: 24, remainingUsefulLife: 78, riskScore: 76, rootCauseAnalysis: "Environmental wear / leading edge delamination", timestamp: nowMs - 7200000 },
      { _id: "insight_3", plantId: "plant_1", assetId: "asset_2", type: "recommendation", title: "Inverter Maintenance Schedule Optimisation", description: "Vibration telemetry on INV-04 suggests service is required 14 days earlier than scheduled.", confidence: 92, remainingUsefulLife: 15, riskScore: 45, rootCauseAnalysis: "Bearing wear in cooling fan assembly", timestamp: nowMs - 14400000 },
      { _id: "insight_4", plantId: "plant_4", assetId: "asset_22", type: "prediction", title: "Transformer Oil Health Degradation", description: "Spectroscopic oil analysis predicts dielectric breakdown risk within 90 days.", confidence: 82, failureProbability: 18, remainingUsefulLife: 90, riskScore: 55, rootCauseAnalysis: "Moisture ingress in sealing gasket", timestamp: nowMs - 86400000 }
    ];

    this.notifications.push({
      _id: "notif_phase3",
      type: "system",
      title: "ERP & Supply Chain Ledger Seeded",
      message: "Seeded vendor scorecards, cost center accounts, warehouse bins, and ERP connectors.",
      severity: "low",
      timestamp: nowMs,
      read: false,
    });
  }
}

// ─────────────────────────────────────────────
// PHASE 4 — SYNTHETIC DATA STORES (CLIENT-SIDE)
// ─────────────────────────────────────────────

export interface Forecast {
  _id: string;
  category: "generation" | "cost" | "maintenance" | "demand" | "revenue" | "capacity";
  period: string; // "2026-01"
  predicted: number;
  actual?: number;
  lower: number; // confidence lower bound
  upper: number; // confidence upper bound
  unit: string;
  model: string;
}

export interface DigitalTwinAsset {
  _id: string;
  plantId: string;
  assetId: string;
  name: string;
  type: string;
  x: number; // layout x position (0-100)
  y: number; // layout y position (0-100)
  healthScore: number;
  temperature: number;
  vibration: number;
  operatingHours: number;
  lastMaintenance: string;
  nextMaintenance: string;
  parentId?: string;
  children: string[];
}

export interface SustainabilityMetric {
  _id: string;
  plantId: string;
  period: string; // "2026-01"
  co2AvoidedTonnes: number;
  mwhGenerated: number;
  recCertificates: number;
  waterUsageLitres: number;
  wasteTonnes: number;
  carbonIntensity: number; // gCO2/kWh
  scope1Emissions: number;
  scope2Emissions: number;
  renewablePercent: number;
}

export interface ESGReport {
  _id: string;
  period: string; // "2026-Q1"
  environmentScore: number; // 0-100
  socialScore: number;
  governanceScore: number;
  overallScore: number;
  co2Avoided: number;
  renewableGeneration: number;
  safetyIncidents: number;
  trainingHours: number;
  boardDiversity: number; // %
  complianceRate: number; // %
  highlights: string[];
}

export interface ExecutiveKPI {
  _id: string;
  period: string;
  totalCapacityMW: number;
  totalGenerationMWh: number;
  capacityFactor: number; // %
  uptime: number; // %
  revenueUSD: number;
  opexUSD: number;
  ebitda: number;
  maintenanceCostUSD: number;
  mttr: number; // hours
  mtbf: number; // hours
  safetyScore: number;
  esgScore: number;
  procurementSavings: number;
  inventoryTurnover: number;
}

export interface PortfolioAnalytic {
  _id: string;
  plantId: string;
  plantName: string;
  period: string;
  capacityFactor: number;
  availabilityFactor: number;
  revenuePerMW: number;
  maintenanceCostPerMW: number;
  healthScore: number;
  co2Avoided: number;
  performanceIndex: number; // 0-100
}

export interface AIConversation {
  _id: string;
  sessionId: string;
  timestamp: number;
  role: "user" | "assistant";
  content: string;
  dataUsed?: string[]; // table names queried
  charts?: { type: string; title: string; data: any[] }[];
}

export interface WorkflowAutomation {
  _id: string;
  name: string;
  trigger: string;
  action: string;
  status: "active" | "paused" | "triggered";
  lastTriggered?: string;
  triggerCount: number;
  category: "maintenance" | "procurement" | "safety" | "sustainability" | "financial";
}

export interface IntegrationConnector {
  _id: string;
  name: string;
  type: "scada" | "iot" | "erp" | "weather" | "ai" | "gis" | "market" | "reporting";
  protocol: string;
  status: "connected" | "degraded" | "disconnected" | "configuring";
  uptime: number; // %
  lastSync: string;
  recordsPerHour: number;
  latencyMs: number;
  endpoint: string;
}

export interface BoardReport {
  _id: string;
  period: string;
  title: string;
  executiveSummary: string;
  totalRevenue: number;
  revenueGrowth: number; // %
  totalCapacity: number;
  newCapacity: number;
  esgScore: number;
  keyRisks: string[];
  keyOpportunities: string[];
  status: "draft" | "approved" | "published";
}

export interface OptimizationRecommendation {
  _id: string;
  category: "maintenance" | "procurement" | "energy" | "workforce" | "financial" | "sustainability";
  title: string;
  description: string;
  estimatedSaving: number;
  effort: "low" | "medium" | "high";
  impact: "low" | "medium" | "high";
  priority: number; // 1-10
  status: "pending" | "in_progress" | "implemented";
  plantId?: string;
}

// ─── PHASE 4 IN-MEMORY DATA ───────────────────

function generateForecasts(): Forecast[] {
  const months = ["2024-01","2024-02","2024-03","2024-04","2024-05","2024-06",
    "2024-07","2024-08","2024-09","2024-10","2024-11","2024-12",
    "2025-01","2025-02","2025-03","2025-04","2025-05","2025-06",
    "2025-07","2025-08","2025-09","2025-10","2025-11","2025-12",
    "2026-01","2026-02","2026-03","2026-04","2026-05","2026-06",
    "2026-07","2026-08","2026-09","2026-10","2026-11","2026-12"];
  const forecasts: Forecast[] = [];
  months.forEach((period, i) => {
    const seasonal = 1 + 0.3 * Math.sin((i / 12) * Math.PI * 2);
    const trend = 1 + i * 0.005;
    const base = 14500 * seasonal * trend;
    forecasts.push({
      _id: `fc_gen_${i}`, category: "generation", period,
      predicted: parseFloat((base).toFixed(0)),
      actual: i < 30 ? parseFloat((base * (0.92 + Math.random() * 0.16)).toFixed(0)) : undefined,
      lower: parseFloat((base * 0.88).toFixed(0)), upper: parseFloat((base * 1.12).toFixed(0)),
      unit: "MWh", model: "LSTM-v2.3"
    });
    const costBase = 820000 + i * 4500;
    forecasts.push({
      _id: `fc_cost_${i}`, category: "cost", period,
      predicted: parseFloat(costBase.toFixed(0)),
      actual: i < 30 ? parseFloat((costBase * (0.93 + Math.random() * 0.14)).toFixed(0)) : undefined,
      lower: parseFloat((costBase * 0.85).toFixed(0)), upper: parseFloat((costBase * 1.15).toFixed(0)),
      unit: "USD", model: "XGBoost-v1.8"
    });
    const revBase = 1850000 + i * 12000 + seasonal * 200000;
    forecasts.push({
      _id: `fc_rev_${i}`, category: "revenue", period,
      predicted: parseFloat(revBase.toFixed(0)),
      actual: i < 30 ? parseFloat((revBase * (0.94 + Math.random() * 0.12)).toFixed(0)) : undefined,
      lower: parseFloat((revBase * 0.87).toFixed(0)), upper: parseFloat((revBase * 1.13).toFixed(0)),
      unit: "USD", model: "Prophet-v3.1"
    });
  });
  return forecasts;
}

function generateSustainabilityMetrics(): SustainabilityMetric[] {
  const metrics: SustainabilityMetric[] = [];
  const plants = ["plant_1","plant_2","plant_3","plant_4","plant_5"];
  const periods = [];
  for (let y = 2024; y <= 2026; y++) {
    for (let m = 1; m <= 12; m++) {
      if (y === 2026 && m > 8) break;
      periods.push(`${y}-${String(m).padStart(2, "0")}`);
    }
  }
  periods.forEach((period, pi) => {
    plants.forEach((plantId, pli) => {
      const seasonal = 1 + 0.25 * Math.sin((pi / 12) * Math.PI * 2);
      const mwh = (2800 + pli * 400) * seasonal * (0.9 + Math.random() * 0.2);
      metrics.push({
        _id: `sust_${period}_${plantId}`,
        plantId, period,
        co2AvoidedTonnes: parseFloat((mwh * 0.386).toFixed(1)),
        mwhGenerated: parseFloat(mwh.toFixed(1)),
        recCertificates: Math.floor(mwh / 1000),
        waterUsageLitres: parseFloat((mwh * 18.5).toFixed(0)),
        wasteTonnes: parseFloat((0.8 + Math.random() * 0.4).toFixed(2)),
        carbonIntensity: parseFloat((12 + Math.random() * 5).toFixed(1)),
        scope1Emissions: parseFloat((8 + Math.random() * 4).toFixed(1)),
        scope2Emissions: parseFloat((2 + Math.random() * 2).toFixed(1)),
        renewablePercent: parseFloat((94 + Math.random() * 5).toFixed(1)),
      });
    });
  });
  return metrics;
}

function generateESGReports(): ESGReport[] {
  const quarters = ["2024-Q1","2024-Q2","2024-Q3","2024-Q4","2025-Q1","2025-Q2","2025-Q3","2025-Q4","2026-Q1","2026-Q2"];
  return quarters.map((period, i) => ({
    _id: `esg_${i}`, period,
    environmentScore: parseFloat((78 + i * 1.2 + Math.random() * 3).toFixed(1)),
    socialScore: parseFloat((72 + i * 0.8 + Math.random() * 3).toFixed(1)),
    governanceScore: parseFloat((81 + i * 0.5 + Math.random() * 2).toFixed(1)),
    overallScore: parseFloat((77 + i * 0.9 + Math.random() * 2.5).toFixed(1)),
    co2Avoided: parseFloat((42000 + i * 1800 + Math.random() * 2000).toFixed(0)),
    renewableGeneration: parseFloat((43500 + i * 800).toFixed(0)),
    safetyIncidents: Math.max(0, 4 - Math.floor(i / 3)),
    trainingHours: 1200 + i * 80,
    boardDiversity: parseFloat((34 + i * 1.5).toFixed(1)),
    complianceRate: parseFloat((96.2 + i * 0.3).toFixed(1)),
    highlights: [
      "Exceeded renewable generation target by " + (5 + i) + "%",
      "Zero critical safety incidents this quarter",
      "Completed " + (120 + i * 15) + " hours of workforce sustainability training",
    ]
  }));
}

function generateExecutiveKPIs(): ExecutiveKPI[] {
  const months = [];
  for (let y = 2024; y <= 2026; y++) {
    for (let m = 1; m <= 12; m++) {
      if (y === 2026 && m > 8) break;
      months.push(`${y}-${String(m).padStart(2, "0")}`);
    }
  }
  return months.map((period, i) => {
    const seasonal = 1 + 0.2 * Math.sin((i / 12) * Math.PI * 2);
    const trend = 1 + i * 0.006;
    return {
      _id: `kpi_${i}`, period,
      totalCapacityMW: parseFloat((1247 + i * 8.5).toFixed(1)),
      totalGenerationMWh: parseFloat((72000 * seasonal * trend).toFixed(0)),
      capacityFactor: parseFloat((31 + 4 * seasonal + Math.random() * 3).toFixed(1)),
      uptime: parseFloat((96.5 + Math.random() * 2.5).toFixed(1)),
      revenueUSD: parseFloat((9200000 * seasonal * trend).toFixed(0)),
      opexUSD: parseFloat((4100000 * trend).toFixed(0)),
      ebitda: parseFloat((5100000 * seasonal * trend).toFixed(0)),
      maintenanceCostUSD: parseFloat((820000 + i * 4200).toFixed(0)),
      mttr: parseFloat((6.2 - i * 0.04).toFixed(1)),
      mtbf: parseFloat((1840 + i * 12).toFixed(0)),
      safetyScore: parseFloat((91 + i * 0.2 + Math.random() * 2).toFixed(1)),
      esgScore: parseFloat((77 + i * 0.9).toFixed(1)),
      procurementSavings: parseFloat((142000 + i * 3500).toFixed(0)),
      inventoryTurnover: parseFloat((4.2 + i * 0.05).toFixed(2)),
    };
  });
}

function generatePortfolioAnalytics(): PortfolioAnalytic[] {
  const analytics: PortfolioAnalytic[] = [];
  const plants = [
    { id: "plant_1", name: "Mojave Solar Array I" },
    { id: "plant_2", name: "High Plains Wind Farm" },
    { id: "plant_3", name: "Gulf Coast BESS Station" },
    { id: "plant_4", name: "Sonora Solar Park" },
    { id: "plant_5", name: "Panhandle Wind Turbines" },
  ];
  const periods = ["2025-Q3","2025-Q4","2026-Q1","2026-Q2"];
  periods.forEach((period, qi) => {
    plants.forEach((plant, pi) => {
      analytics.push({
        _id: `pa_${period}_${plant.id}`,
        plantId: plant.id, plantName: plant.name, period,
        capacityFactor: parseFloat((28 + pi * 2.5 + qi * 0.8 + Math.random() * 4).toFixed(1)),
        availabilityFactor: parseFloat((94 + Math.random() * 5).toFixed(1)),
        revenuePerMW: parseFloat((7400 + pi * 200 + qi * 120 + Math.random() * 400).toFixed(0)),
        maintenanceCostPerMW: parseFloat((620 + pi * 30 - qi * 15 + Math.random() * 80).toFixed(0)),
        healthScore: parseFloat((82 + pi * 2 + qi * 1 + Math.random() * 5).toFixed(1)),
        co2Avoided: parseFloat((8400 + pi * 600 + Math.random() * 1200).toFixed(0)),
        performanceIndex: parseFloat((75 + pi * 3 + qi * 2 + Math.random() * 5).toFixed(1)),
      });
    });
  });
  return analytics;
}

function generateCopilotConversations(): AIConversation[] {
  const now = Date.now();
  return [
    { _id: "conv_1", sessionId: "sess_1", timestamp: now - 7200000, role: "user", content: "Which plants have the highest operational risk today?" },
    { _id: "conv_2", sessionId: "sess_1", timestamp: now - 7190000, role: "assistant", content: "Based on current operational data, **Gulf Coast BESS Station** and **High Plains Wind Farm** show elevated risk profiles. Gulf Coast BESS has 3 active critical alarms with battery cell temperature anomalies (+12°C above baseline). High Plains Wind shows blade erosion patterns on Turbine Array B with a predicted failure probability of 34% within 45 days.", dataUsed: ["alarms", "aiInsights", "assets"] },
    { _id: "conv_3", sessionId: "sess_1", timestamp: now - 3600000, role: "user", content: "Predict maintenance costs for the next quarter." },
    { _id: "conv_4", sessionId: "sess_1", timestamp: now - 3590000, role: "assistant", content: "Forecasting Q3 2026 maintenance expenditure at **$2.84M** (±8% confidence interval: $2.61M–$3.07M). Key cost drivers: 1) Planned turbine gearbox replacement at High Plains ($680K), 2) BESS battery module refresh at Gulf Coast ($520K), 3) Solar inverter preventive maintenance across 8 sites ($340K). Recommend pre-approving 3 purchase requisitions totaling $1.2M to avoid procurement delays.", dataUsed: ["forecasts", "workOrders", "purchaseRequisitions"] },
    { _id: "conv_5", sessionId: "sess_2", timestamp: now - 1800000, role: "user", content: "Summarize executive KPIs for today's operations." },
    { _id: "conv_6", sessionId: "sess_2", timestamp: now - 1790000, role: "assistant", content: "**Portfolio Executive Summary — August 2026**\n\n📊 **Generation**: 14,871 MWh today (+3.2% vs. 30-day avg)\n⚡ **Fleet Uptime**: 97.4% (target: 96%)\n💰 **Revenue Run Rate**: $9.42M/month (↑$340K MoM)\n🌿 **CO₂ Avoided**: 5,740 tonnes this month\n⚠️ **Active Alarms**: 6 (2 critical, 3 high, 1 medium)\n🔧 **Work Orders**: 12 open (3 in-progress, 9 scheduled)\n\nAll KPIs trending above quarterly targets. ESG score at 88.4 — highest in platform history.", dataUsed: ["energyMetrics", "alarms", "workOrders", "sustainabilityMetrics", "executiveKPIs"] },
    { _id: "conv_7", sessionId: "sess_3", timestamp: now - 900000, role: "user", content: "Which assets should be replaced within the next 6 months?" },
    { _id: "conv_8", sessionId: "sess_3", timestamp: now - 890000, role: "assistant", content: "AI lifecycle analysis identifies **4 assets** for priority replacement within 180 days:\n\n1. **Turbine Array B-07** (High Plains) — RUL: 42 days, blade fatigue confirmed\n2. **Inverter Stack INV-04** (Mojave Solar) — RUL: 78 days, IGBT degradation\n3. **Battery Module BMS-12** (Gulf Coast) — RUL: 95 days, capacity at 71%\n4. **Transformer TR-03** (Sonora Solar) — RUL: 140 days, oil analysis irregular\n\nEstimated replacement CAPEX: **$1.86M**. Recommend initiating procurement RFQ cycle immediately to avoid 6–8 week lead times.", dataUsed: ["aiInsights", "assets", "workOrders"] },
  ];
}

function generateWorkflowAutomations(): WorkflowAutomation[] {
  const now = new Date().toISOString();
  return [
    { _id: "wf_1", name: "Low Stock Auto-Requisition", trigger: "Inventory below min threshold", action: "Create purchase requisition + notify procurement team", status: "active", lastTriggered: now, triggerCount: 24, category: "procurement" },
    { _id: "wf_2", name: "Critical Alarm Escalation", trigger: "Alarm severity = CRITICAL for >30 min", action: "Escalate to Plant Manager + create emergency work order", status: "active", lastTriggered: now, triggerCount: 8, category: "maintenance" },
    { _id: "wf_3", name: "Predictive Maintenance Scheduler", trigger: "AI failure probability > 70%", action: "Auto-schedule preventive work order within 14 days", status: "active", lastTriggered: now, triggerCount: 15, category: "maintenance" },
    { _id: "wf_4", name: "ESG Monthly Report Generator", trigger: "1st day of month", action: "Compile sustainability metrics + distribute ESG summary", status: "active", lastTriggered: now, triggerCount: 20, category: "sustainability" },
    { _id: "wf_5", name: "Vendor SLA Breach Monitor", trigger: "Delivery overdue by 48h", action: "Calculate penalty + notify legal + update vendor scorecard", status: "active", lastTriggered: now, triggerCount: 6, category: "procurement" },
    { _id: "wf_6", name: "Daily Executive KPI Digest", trigger: "06:00 UTC daily", action: "Aggregate KPIs + send board-level summary email", status: "active", lastTriggered: now, triggerCount: 180, category: "financial" },
    { _id: "wf_7", name: "Weather-Based Generation Alert", trigger: "Irradiance forecast drops >40%", action: "Alert grid operators + activate BESS discharge protocol", status: "active", lastTriggered: now, triggerCount: 12, category: "safety" },
    { _id: "wf_8", name: "Invoice Auto-Payment Approval", trigger: "Invoice matched to PO + amount <$50K", action: "Auto-approve + schedule payment + update GL", status: "paused", triggerCount: 42, category: "financial" },
    { _id: "wf_9", name: "Carbon Credit Auto-Filing", trigger: "Monthly REC threshold reached", action: "File RECs with registry + update sustainability ledger", status: "active", lastTriggered: now, triggerCount: 20, category: "sustainability" },
    { _id: "wf_10", name: "Technician Auto-Dispatch", trigger: "Work order priority = HIGH, no assignee after 2h", action: "Assign nearest available certified technician", status: "active", lastTriggered: now, triggerCount: 31, category: "maintenance" },
  ];
}

function generateIntegrationConnectors(): IntegrationConnector[] {
  return [
    { _id: "int_1", name: "Siemens SCADA Gateway", type: "scada", protocol: "OPC-UA", status: "connected", uptime: 99.7, lastSync: new Date(Date.now() - 15000).toISOString(), recordsPerHour: 86400, latencyMs: 12, endpoint: "opc.tcp://scada.plant1:4840" },
    { _id: "int_2", name: "ABB IoT Edge Hub", type: "iot", protocol: "MQTT", status: "connected", uptime: 98.9, lastSync: new Date(Date.now() - 5000).toISOString(), recordsPerHour: 144000, latencyMs: 8, endpoint: "mqtt://iot.aether.cloud:1883" },
    { _id: "int_3", name: "SAP S/4HANA ERP", type: "erp", protocol: "REST/OAuth2", status: "connected", uptime: 97.2, lastSync: new Date(Date.now() - 300000).toISOString(), recordsPerHour: 1200, latencyMs: 245, endpoint: "https://sap.enterprise.com/api/v4" },
    { _id: "int_4", name: "Tomorrow.io Weather API", type: "weather", protocol: "REST/HTTPS", status: "connected", uptime: 99.1, lastSync: new Date(Date.now() - 600000).toISOString(), recordsPerHour: 60, latencyMs: 180, endpoint: "https://api.tomorrow.io/v4" },
    { _id: "int_5", name: "Azure OpenAI GPT-4o", type: "ai", protocol: "REST/HTTPS", status: "connected", uptime: 99.9, lastSync: new Date(Date.now() - 30000).toISOString(), recordsPerHour: 480, latencyMs: 820, endpoint: "https://aetheris.openai.azure.com" },
    { _id: "int_6", name: "Esri ArcGIS Online", type: "gis", protocol: "REST/HTTPS", status: "connected", uptime: 99.5, lastSync: new Date(Date.now() - 120000).toISOString(), recordsPerHour: 240, latencyMs: 320, endpoint: "https://arcgis.com/arcgis/rest" },
    { _id: "int_7", name: "ERCOT Market API", type: "market", protocol: "REST/XML", status: "degraded", uptime: 94.3, lastSync: new Date(Date.now() - 900000).toISOString(), recordsPerHour: 288, latencyMs: 1240, endpoint: "https://mis.ercot.com/api" },
    { _id: "int_8", name: "Power BI Premium", type: "reporting", protocol: "REST/OAuth2", status: "connected", uptime: 98.4, lastSync: new Date(Date.now() - 60000).toISOString(), recordsPerHour: 24, latencyMs: 580, endpoint: "https://api.powerbi.com/v1.0" },
    { _id: "int_9", name: "OSIsoft PI System", type: "scada", protocol: "PI-Web API", status: "connected", uptime: 99.2, lastSync: new Date(Date.now() - 8000).toISOString(), recordsPerHour: 72000, latencyMs: 22, endpoint: "https://pi.aetheris.local/piwebapi" },
    { _id: "int_10", name: "Honeywell IoT Platform", type: "iot", protocol: "AMQP", status: "disconnected", uptime: 0, lastSync: new Date(Date.now() - 7200000).toISOString(), recordsPerHour: 0, latencyMs: 0, endpoint: "amqp://honeywell.cloud:5672" },
    { _id: "int_11", name: "Oracle Fusion Cloud", type: "erp", protocol: "REST/OAuth2", status: "configuring", uptime: 0, lastSync: "", recordsPerHour: 0, latencyMs: 0, endpoint: "https://oracle.cloud.com/fscmRestApi" },
    { _id: "int_12", name: "Microsoft Dynamics 365", type: "erp", protocol: "OData/REST", status: "connected", uptime: 96.8, lastSync: new Date(Date.now() - 450000).toISOString(), recordsPerHour: 900, latencyMs: 310, endpoint: "https://dynamics.microsoft.com/api" },
    { _id: "int_13", name: "DNV Veritas Compliance", type: "reporting", protocol: "SOAP/XML", status: "connected", uptime: 97.5, lastSync: new Date(Date.now() - 86400000).toISOString(), recordsPerHour: 4, latencyMs: 620, endpoint: "https://api.dnv.com/compliance" },
    { _id: "int_14", name: "CAISO Market Interface", type: "market", protocol: "REST/HTTPS", status: "connected", uptime: 98.2, lastSync: new Date(Date.now() - 180000).toISOString(), recordsPerHour: 144, latencyMs: 440, endpoint: "https://oasis.caiso.com/oasisapi" },
    { _id: "int_15", name: "Palantir Foundry Analytics", type: "reporting", protocol: "REST/OAuth2", status: "connected", uptime: 99.6, lastSync: new Date(Date.now() - 90000).toISOString(), recordsPerHour: 360, latencyMs: 280, endpoint: "https://aetheris.palantirfoundry.com" },
  ];
}

function generateBoardReports(): BoardReport[] {
  return [
    { _id: "br_1", period: "2025-Q3", title: "Q3 2025 Board Operations Report", executiveSummary: "Portfolio delivered record generation of 43,800 MWh, exceeding targets by 8%. Revenue reached $27.6M with EBITDA margin of 54%. ESG score improved to 84.2. Two new solar sites commissioned.", totalRevenue: 27600000, revenueGrowth: 12.4, totalCapacity: 1190, newCapacity: 45, esgScore: 84.2, keyRisks: ["Equipment aging at High Plains Wind", "Supply chain delays for IGBT components"], keyOpportunities: ["PPA tariff renegotiation at Mojave", "BESS expansion grant funding available"], status: "published" },
    { _id: "br_2", period: "2025-Q4", title: "Q4 2025 Board Operations Report", executiveSummary: "Strong year-end performance with $29.1M revenue. Full-year CO₂ avoidance of 218,000 tonnes. Completed all major preventive maintenance cycles. Procurement savings of $1.4M vs budget.", totalRevenue: 29100000, revenueGrowth: 14.8, totalCapacity: 1215, newCapacity: 25, esgScore: 85.9, keyRisks: ["BESS battery degradation rate", "Weather-related curtailment events"], keyOpportunities: ["Offshore wind PPA opportunity", "AI-driven O&M optimization potential"], status: "published" },
    { _id: "br_3", period: "2026-Q1", title: "Q1 2026 Board Operations Report", executiveSummary: "Record ESG score of 87.4. Deployed predictive maintenance AI reducing unplanned downtime by 23%. Procurement cycle time reduced by 18 days. Q1 revenue $28.4M (+9.6% YoY).", totalRevenue: 28400000, revenueGrowth: 9.6, totalCapacity: 1235, newCapacity: 20, esgScore: 87.4, keyRisks: ["Grid interconnection approval delays", "Inflation impact on O&M costs"], keyOpportunities: ["Digital twin deployment for all sites", "Voluntary carbon market expansion"], status: "published" },
    { _id: "br_4", period: "2026-Q2", title: "Q2 2026 Board Operations Report", executiveSummary: "Platform now managing 1,247 MW across 5 states. AI Copilot deployed for executive decision support. Inventory optimization saved $340K in carrying costs. Targeting $120M annual revenue run rate.", totalRevenue: 30100000, revenueGrowth: 11.2, totalCapacity: 1247, newCapacity: 12, esgScore: 88.4, keyRisks: ["Regulatory changes in Texas market", "Cybersecurity framework update required"], keyOpportunities: ["Phase 5 capacity expansion to 1,500 MW", "Green hydrogen pilot at Gulf Coast"], status: "approved" },
  ];
}

function generateOptimizationRecommendations(): OptimizationRecommendation[] {
  return [
    { _id: "opt_1", category: "maintenance", title: "Consolidate Turbine Inspections by Region", description: "Batch turbine inspections across High Plains and Panhandle sites to reduce travel costs. Estimated 34% reduction in logistics spend.", estimatedSaving: 128000, effort: "low", impact: "medium", priority: 8, status: "pending" },
    { _id: "opt_2", category: "procurement", title: "Multi-Year Frame Agreement with Solar Panel Suppliers", description: "Lock in current pricing with 3-year frame agreements with 4 qualified solar panel vendors. Hedge against 12-15% projected price increases.", estimatedSaving: 485000, effort: "medium", impact: "high", priority: 9, status: "in_progress" },
    { _id: "opt_3", category: "energy", title: "BESS Dispatch Optimization via AI Scheduling", description: "Deploy ML-based BESS charge/discharge scheduling to maximize grid revenue from peak pricing windows. Expected 7-9% revenue uplift.", estimatedSaving: 640000, effort: "high", impact: "high", priority: 10, status: "pending" },
    { _id: "opt_4", category: "workforce", title: "Cross-Training Technician Program", description: "Train 12 solar technicians on wind turbine maintenance. Reduce outsourced labor by 30% and improve work order response time.", estimatedSaving: 210000, effort: "medium", impact: "medium", priority: 7, status: "pending" },
    { _id: "opt_5", category: "financial", title: "Accelerate PPA Billing Settlement Cycle", description: "Automate PPA billing reconciliation to reduce settlement cycle from 45 to 12 days. Improves working capital by $1.8M.", estimatedSaving: 87000, effort: "low", impact: "high", priority: 8, status: "implemented" },
    { _id: "opt_6", category: "sustainability", title: "On-Site Solar for Operations Buildings", description: "Install 180kW rooftop solar on 6 operations buildings. Eliminates Scope 2 emissions and generates RECs.", estimatedSaving: 54000, effort: "medium", impact: "medium", priority: 6, status: "pending" },
    { _id: "opt_7", category: "procurement", title: "Dynamic Safety Stock Optimization", description: "Replace static min/max thresholds with ML-driven dynamic safety stock. Reduces inventory carrying cost by 22%.", estimatedSaving: 162000, effort: "medium", impact: "medium", priority: 7, status: "pending" },
    { _id: "opt_8", category: "maintenance", title: "Vibration Sensor Retrofit on Aging Turbines", description: "Install IoT vibration sensors on 18 turbines >10 years old. Enables predictive maintenance saving avg $45K per avoided failure.", estimatedSaving: 315000, effort: "high", impact: "high", priority: 9, status: "in_progress" },
  ];
}

// Phase 4 data export object
export const phase4Data = {
  forecasts: generateForecasts(),
  sustainabilityMetrics: generateSustainabilityMetrics(),
  esgReports: generateESGReports(),
  executiveKPIs: generateExecutiveKPIs(),
  portfolioAnalytics: generatePortfolioAnalytics(),
  copilotConversations: generateCopilotConversations(),
  workflowAutomations: generateWorkflowAutomations(),
  integrationConnectors: generateIntegrationConnectors(),
  boardReports: generateBoardReports(),
  optimizationRecommendations: generateOptimizationRecommendations(),
};

export const mockDb = new MockDbStore();

