// Static data seed definition which also acts as the client-side database seed
// in case Convex local service is not running. This ensures the demo is 100% robust.

export interface SupplierSeed {
  id: string;
  name: string;
  category: string;
  ontimeDeliveryRate: number;
  qualityScore: number;
  riskLevel: "High" | "Medium" | "Low";
  leadTimeDays: number;
}

export interface InventorySeed {
  partId: string;
  name: string;
  category: string;
  stock: number;
  reserved: number;
  reorderLevel: number;
  location: string;
  supplierId: string;
  leadTimeDays: number;
}

export interface AssetSeed {
  id: string;
  name: string;
  type: string;
  status: "healthy" | "warning" | "offline";
  healthScore: number;
  failureRisk: number;
  location: string;
  criticality: "Critical" | "High" | "Medium" | "Low";
  lastMaintenance: string;
  nextMaintenance: string;
  details: Record<string, any>;
}

export interface WorkOrderSeed {
  id: string;
  assetId: string;
  title: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  status: "New" | "Planned" | "Assigned" | "In Progress" | "Blocked" | "Completed" | "Verified" | "Closed";
  assignedTeam: string;
  assignedPerson: string;
  createdDate: string;
  dueDate: string;
  estimatedDuration: string;
  requiredParts: Array<{ partId: string; quantity: number }>;
  notes: string;
}

export interface ComplianceSeed {
  id: string;
  title: string;
  authority: string;
  expiryDate: string;
  status: "Valid" | "Expiring" | "Expired";
}

export interface AIInsightSeed {
  id: string;
  type: "risk" | "supply" | "operational";
  title: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  targetEntity: string;
  detail: string;
  recommendation: string;
}

// Expanded Maritime Core Interfaces
export interface VesselVoyage {
  vesselId: string;
  vesselName: string;
  status: "At Sea" | "In Port" | "Anchored" | "Maintenance";
  voyageNumber: string;
  departurePort: string;
  destinationPort: string;
  eta: string;
  speedKts: number;
  availabilityPercent: number;
  charterRatePerDay: number;
}

export interface MarineSafetyDeficiency {
  id: string;
  vesselId: string;
  title: string;
  category: string; // Safety, Fire, Machinery, Lifesaving
  severity: "Critical" | "High" | "Medium" | "Low";
  status: "Open" | "CAPA Pending" | "Resolved";
  findingDate: string;
  targetResolutionDate: string;
}

export interface MarineProcurementOrder {
  poNumber: string;
  vesselId: string;
  itemDescription: string;
  qtyRequested: number;
  status: "Draft" | "PR Approved" | "PO Sent" | "Port Delivery Pending" | "Delivered";
  supplierName: string;
  portDestination: string;
  leadTimeDays: number;
}

export interface CrewMember {
  id: string;
  name: string;
  rank: string;
  vesselId: string;
  currentTask: string;
  safetyChecklistCompleted: boolean;
  evidenceUploaded: boolean;
  stcwStatus: "Valid" | "Expired";
  certificateNo: string;
}

// New Maritime Elements
export interface PortClearance {
  vesselId: string;
  customsCleared: boolean;
  immigrationCleared: boolean;
  portAgentNotified: boolean;
  pilotageRequested: boolean;
}

export interface BunkerLog {
  vesselId: string;
  mgoROBMetricTons: number;
  hfoROBMetricTons: number;
  sulfurContentPercent: number;
  lastBunkeredDate: string;
}

export interface SafetyEquipmentInspection {
  equipmentId: string;
  vesselId: string;
  name: string;
  lastInspectionDate: string;
  expiryDate: string;
  status: "Passed" | "Due" | "Failed";
  assignedCrewId: string;
}

export const SUPPLIERS: SupplierSeed[] = [
  { id: "sup-1", name: "Industrial Spares Inc.", category: "MRO & Bearings", ontimeDeliveryRate: 98, qualityScore: 99, riskLevel: "Low", leadTimeDays: 3 },
  { id: "sup-2", name: "Apex Grid Solutions", category: "Heavy Electrical", ontimeDeliveryRate: 85, qualityScore: 92, riskLevel: "Medium", leadTimeDays: 14 },
  { id: "sup-3", name: "Global Maritime Logistics", category: "Vessel Propulsion", ontimeDeliveryRate: 72, qualityScore: 95, riskLevel: "High", leadTimeDays: 22 },
  { id: "sup-4", name: "QuickParts Supply", category: "Pneumatics & Automation", ontimeDeliveryRate: 95, qualityScore: 97, riskLevel: "Low", leadTimeDays: 5 },
  { id: "sup-5", name: "Vanguard Heavy Industries", category: "Forgings & Castings", ontimeDeliveryRate: 91, qualityScore: 94, riskLevel: "Low", leadTimeDays: 10 },
  { id: "sup-6", name: "Interstellar Electrical", category: "Cables & Relays", ontimeDeliveryRate: 89, qualityScore: 90, riskLevel: "Medium", leadTimeDays: 8 }
];

export const MARITIME_FLEET: VesselVoyage[] = [
  { vesselId: "vess-01", vesselName: "SCIO Ocean 01", status: "At Sea", voyageNumber: "VOY-2026-99", departurePort: "Rotterdam", destinationPort: "Houston", eta: "2026-08-28", speedKts: 18.5, availabilityPercent: 98, charterRatePerDay: 28000 },
  { vesselId: "vess-02", vesselName: "SCIO Carrier 02", status: "In Port", voyageNumber: "VOY-2026-104", departurePort: "Singapore", destinationPort: "Shanghai", eta: "2026-08-24", speedKts: 0.0, availabilityPercent: 92, charterRatePerDay: 32000 },
  { vesselId: "vess-03", vesselName: "SCIO Marine 07", status: "Maintenance", voyageNumber: "VOY-2026-12", departurePort: "Hamburg", destinationPort: "Hamburg Drydock", eta: "2026-09-05", speedKts: 2.1, availabilityPercent: 45, charterRatePerDay: 15000 },
  { vesselId: "vess-04", vesselName: "SCIO Navigator 09", status: "Anchored", voyageNumber: "VOY-2026-18", departurePort: "Yokohama", destinationPort: "LA Port", eta: "2026-08-30", speedKts: 0.0, availabilityPercent: 97, charterRatePerDay: 26000 },
  { vesselId: "vess-05", vesselName: "SCIO Explorer 11", status: "At Sea", voyageNumber: "VOY-2026-44", departurePort: "Portsmouth", destinationPort: "New York", eta: "2026-09-02", speedKts: 16.4, availabilityPercent: 99, charterRatePerDay: 30000 }
];

export const MARITIME_DEFICIENCIES: MarineSafetyDeficiency[] = [
  { id: "def-01", vesselId: "vess-02", title: "Auxiliary Gen Fuel Line Seepage", category: "Machinery", severity: "High", status: "Open", findingDate: "2026-08-20", targetResolutionDate: "2026-08-25" },
  { id: "def-02", vesselId: "vess-03", title: "Emergency Fire Pump Coupling Wear", category: "Fire Safety", severity: "Critical", status: "CAPA Pending", findingDate: "2026-08-18", targetResolutionDate: "2026-08-22" },
  { id: "def-03", vesselId: "vess-01", title: "Starboard Lifeboat Release Mechanism Corrosion", category: "Lifesaving", severity: "Medium", status: "Resolved", findingDate: "2026-07-15", targetResolutionDate: "2026-08-15" },
  { id: "def-04", vesselId: "vess-04", title: "Bridge Gyros Signal Drop", category: "Navigation", severity: "High", status: "Open", findingDate: "2026-08-21", targetResolutionDate: "2026-08-27" }
];

export const MARITIME_SUPPLY_ORDERS: MarineProcurementOrder[] = [
  { poNumber: "MPO-88401", vesselId: "vess-01", itemDescription: "Aux Engine Fuel Injector Nozzles", qtyRequested: 6, status: "PO Sent", supplierName: "Industrial Spares Inc.", portDestination: "Houston Port Terminal 3", leadTimeDays: 5 },
  { poNumber: "MPO-88402", vesselId: "vess-03", itemDescription: "High-Temp Turbine Gasket Kit", qtyRequested: 2, status: "Port Delivery Pending", supplierName: "Global Maritime Logistics", portDestination: "Hamburg Drydock 4", leadTimeDays: 22 },
  { poNumber: "MPO-88403", vesselId: "vess-02", itemDescription: "Emergency Hydrant Couplings", qtyRequested: 10, status: "PR Approved", supplierName: "QuickParts Supply", portDestination: "Shanghai Terminal A", leadTimeDays: 7 },
  { poNumber: "MPO-88404", vesselId: "vess-05", itemDescription: "ECDIS Console Spare Drive", qtyRequested: 1, status: "Draft", supplierName: "Industrial Spares Inc.", portDestination: "LA Terminal 12", leadTimeDays: 3 }
];

export const MARITIME_CREW: CrewMember[] = [
  { id: "crew-01", name: "Captain Sarah Lind", rank: "Master", vesselId: "vess-01", currentTask: "Voyage Navigation Control", safetyChecklistCompleted: true, evidenceUploaded: true, stcwStatus: "Valid", certificateNo: "STCW-2026-A109" },
  { id: "crew-02", name: "Chief Engineer Kenji Sato", rank: "Chief Engineer", vesselId: "vess-01", currentTask: "Main Engine Exhaust Valve Inspect", safetyChecklistCompleted: true, evidenceUploaded: false, stcwStatus: "Valid", certificateNo: "STCW-2026-E448" },
  { id: "crew-03", name: "Second Mate Elena Rostova", rank: "Second Officer", vesselId: "vess-02", currentTask: "Bridge Gyro Calibration", safetyChecklistCompleted: false, evidenceUploaded: false, stcwStatus: "Expired", certificateNo: "STCW-2024-O021" },
  { id: "crew-04", name: "Third Eng Liam O'Connor", rank: "Third Officer", vesselId: "vess-05", currentTask: "Cooling Loop Level Check", safetyChecklistCompleted: true, evidenceUploaded: true, stcwStatus: "Valid", certificateNo: "STCW-2025-O304" }
];

// Seed arrays for the new datasets
export const MARITIME_CLEARANCES: PortClearance[] = [
  { vesselId: "vess-01", customsCleared: true, immigrationCleared: true, portAgentNotified: true, pilotageRequested: true },
  { vesselId: "vess-02", customsCleared: true, immigrationCleared: false, portAgentNotified: true, pilotageRequested: false },
  { vesselId: "vess-03", customsCleared: false, immigrationCleared: false, portAgentNotified: false, pilotageRequested: false }
];

export const MARITIME_BUNKER_LOGS: BunkerLog[] = [
  { vesselId: "vess-01", mgoROBMetricTons: 120, hfoROBMetricTons: 680, sulfurContentPercent: 0.10, lastBunkeredDate: "2026-08-15" },
  { vesselId: "vess-02", mgoROBMetricTons: 85, hfoROBMetricTons: 420, sulfurContentPercent: 0.45, lastBunkeredDate: "2026-08-18" },
  { vesselId: "vess-03", mgoROBMetricTons: 15, hfoROBMetricTons: 100, sulfurContentPercent: 0.12, lastBunkeredDate: "2026-08-01" }
];

export const MARITIME_SAFETY_INSPECTIONS: SafetyEquipmentInspection[] = [
  { equipmentId: "eq-01", vesselId: "vess-01", name: "15-Person Inflatable Liferaft A", lastInspectionDate: "2026-06-10", expiryDate: "2027-06-10", status: "Passed", assignedCrewId: "crew-02" },
  { equipmentId: "eq-02", vesselId: "vess-01", name: "CO2 Engine Room Fire Extinguishers (10x)", lastInspectionDate: "2025-08-20", expiryDate: "2026-08-20", status: "Due", assignedCrewId: "crew-02" },
  { equipmentId: "eq-03", vesselId: "vess-02", name: "Bridge Pyrotechnic Distress Flares", lastInspectionDate: "2024-05-12", expiryDate: "2026-05-12", status: "Failed", assignedCrewId: "crew-03" }
];

export const INDUSTRY_SEEDS: Record<string, {
  assets: AssetSeed[];
  inventory: InventorySeed[];
  workOrders: WorkOrderSeed[];
  compliance: ComplianceSeed[];
  insights: AIInsightSeed[];
}> = {
  manufacturing: {
    assets: [
      { id: "mfg-ast-1", name: "CNC Machine CNC-402", type: "Production Machine", status: "healthy", healthScore: 92, failureRisk: 8, location: "Bay A - Plant Alpha", criticality: "High", lastMaintenance: "2026-08-01", nextMaintenance: "2026-09-01", details: { OEE: 88, SpindleSpeed: "12,000 RPM", Temperature: "42°C" } },
      { id: "mfg-ast-2", name: "Assembly Robot AR-12", type: "Robotic Arm", status: "warning", healthScore: 68, failureRisk: 32, location: "Assembly Line 2 - Plant Alpha", criticality: "Critical", lastMaintenance: "2026-07-15", nextMaintenance: "2026-08-25", details: { OEE: 74, Joint3Vibration: "High (2.4 mm/s)", Temperature: "58°C" } },
      { id: "mfg-ast-3", name: "Heavy Press Machine PR-88", type: "Hydraulic Press", status: "offline", healthScore: 12, failureRisk: 95, location: "Stamping Bay - Plant Beta", criticality: "Critical", lastMaintenance: "2026-06-20", nextMaintenance: "2026-08-20", details: { OEE: 0, PressureLeak: "Hydraulic Fluid Loss" } },
      { id: "mfg-ast-4", name: "Injection Molder IM-04", type: "Molding Machine", status: "healthy", healthScore: 89, failureRisk: 11, location: "Bay B - Plant Alpha", criticality: "High", lastMaintenance: "2026-07-28", nextMaintenance: "2026-09-28", details: { OEE: 90, ClampingPressure: "250 Tons", Temperature: "185°C" } },
      { id: "mfg-ast-5", name: "Packaging Line PL-1", type: "Conveyor Belt System", status: "healthy", healthScore: 95, failureRisk: 5, location: "Packaging Bay - Plant Alpha", criticality: "Medium", lastMaintenance: "2026-08-10", nextMaintenance: "2026-10-10", details: { Throughput: "120 cpm", RollerVibration: "Low" } },
      { id: "mfg-ast-6", name: "Chiller Unit CH-02", type: "Cooling Compressor", status: "healthy", healthScore: 91, failureRisk: 9, location: "Utility Room - Plant Beta", criticality: "High", lastMaintenance: "2026-08-05", nextMaintenance: "2026-11-05", details: { CoolantTemp: "6°C", FlowRate: "450 L/min" } },
      { id: "mfg-ast-7", name: "Laser Cutter LC-9", type: "Cutting System", status: "warning", healthScore: 73, failureRisk: 27, location: "Bay C - Plant Beta", criticality: "High", lastMaintenance: "2026-07-02", nextMaintenance: "2026-09-02", details: { GasPressure: "Low (1.2 Bar)", LaserTemp: "49°C" } }
    ],
    inventory: [
      { partId: "BR-440", name: "High-Load Spindle Bearing BR-440", category: "Bearings", stock: 4, reserved: 2, reorderLevel: 6, location: "Aisle A1 - Plant Alpha Bin B", supplierId: "sup-1", leadTimeDays: 3 },
      { partId: "HY-91", name: "Hydraulic Valve Seal HY-91", category: "Hydraulics", stock: 15, reserved: 0, reorderLevel: 5, location: "Aisle B4 - Plant Beta Bin D", supplierId: "sup-4", leadTimeDays: 5 },
      { partId: "LSR-LENS", name: "Laser Optics Lens LC-9", category: "Optics", stock: 2, reserved: 0, reorderLevel: 3, location: "Cabinet C - Plant Beta", supplierId: "sup-5", leadTimeDays: 10 },
      { partId: "CNV-BELT", name: "Reinforced Conveyor Belt (10m)", category: "Mechanical spares", stock: 8, reserved: 1, reorderLevel: 4, location: "Aisle D1 - Plant Alpha", supplierId: "sup-1", leadTimeDays: 3 }
    ],
    workOrders: [
      { id: "mfg-wo-1", assetId: "mfg-ast-2", title: "Calibrate Robotic Joint 3 Motor", priority: "High", status: "In Progress", assignedTeam: "Automation Maintenance Team", assignedPerson: "Marcus Vance", createdDate: "2026-08-21", dueDate: "2026-08-24", estimatedDuration: "3 Hours", requiredParts: [{ partId: "BR-440", quantity: 1 }], notes: "Joint 3 shows abnormal vibration during cycles." },
      { id: "mfg-wo-2", assetId: "mfg-ast-3", title: "Rebuild Hydraulic Main Pressure Valve", priority: "Critical", status: "Assigned", assignedTeam: "Hydraulics Crew", assignedPerson: "Sarah Connor", createdDate: "2026-08-22", dueDate: "2026-08-23", estimatedDuration: "6 Hours", requiredParts: [{ partId: "HY-91", quantity: 2 }], notes: "Asset went offline due to fluid pressure drop." },
      { id: "mfg-wo-3", assetId: "mfg-ast-7", title: "Replace Focus Lens and Realign Optic System", priority: "High", status: "Planned", assignedTeam: "Precision Tooling Team", assignedPerson: "Dave Bowman", createdDate: "2026-08-22", dueDate: "2026-08-26", estimatedDuration: "2 Hours", requiredParts: [{ partId: "LSR-LENS", quantity: 1 }], notes: "Gas pressure loss detected, realign optics." }
    ],
    compliance: [
      { id: "mfg-cmp-1", title: "OSHA Machinery Safety Certificate", authority: "OSHA", expiryDate: "2026-12-15", status: "Valid" },
      { id: "mfg-cmp-2", title: "Plant Beta Environmental Emissions Permit", authority: "EPA", expiryDate: "2026-09-05", status: "Expiring" },
      { id: "mfg-cmp-3", title: "ISO 9001 Quality System Certificate", authority: "SGS", expiryDate: "2027-04-18", status: "Valid" }
    ],
    insights: [
      { id: "mfg-ins-1", type: "risk", title: "Vibration Signature Peak Risk", severity: "High", targetEntity: "Assembly Robot AR-12", detail: "Joint 3 vibration telemetry indicates a 32% probability of motor lockup.", recommendation: "Execute joint check as scheduled in WO #mfg-wo-1." },
      { id: "mfg-ins-2", type: "supply", title: "Critical Spare Part Deficit", severity: "Critical", targetEntity: "Bearing BR-440", detail: "Current stock level is 4. Below reorder level of 6, while active work orders require 2 bearings.", recommendation: "Authorize emergency order from Industrial Spares Inc." }
    ]
  },
  maritime: {
    assets: [
      { id: "IMO-9400242", name: "SCIO Ocean Main Propulsion Wärtsilä 12V46F", type: "Engine", status: "healthy", healthScore: 95, failureRisk: 3, location: "Engine Room - Zone ER-01", criticality: "Critical", lastMaintenance: "2026-07-10", nextMaintenance: "2026-09-10", details: { RPM: 500, FuelConsumption: "185 g/kWh", Load: "82%" } },
      { id: "IMO-9602447", name: "SCIO Carrier Aux Gen Yanmar 6EY18AL", type: "Auxiliary Engine", status: "warning", healthScore: 71, failureRisk: 29, location: "Aux Platform - Zone ER-03", criticality: "High", lastMaintenance: "2026-06-01", nextMaintenance: "2026-08-30", details: { FuelSeepage: "Present (WO required)", Vibration: "Moderate" } },
      { id: "IMO-9811024", name: "SCIO Marine Boiler Feed Pump BP-04", type: "Pump", status: "healthy", healthScore: 91, failureRisk: 9, location: "Bilge Space - Zone ER-05", criticality: "Medium", lastMaintenance: "2026-05-12", nextMaintenance: "2026-11-12", details: { PressurePsi: 45, RunTimeHours: 1202 } },
      { id: "IMO-9488301", name: "SCIO Navigator Bridge Gyro ECDIS Nav-3", type: "Navigation Equipment", status: "healthy", healthScore: 97, failureRisk: 3, location: "Bridge - Zone BR-01", criticality: "High", lastMaintenance: "2026-08-15", nextMaintenance: "2027-02-15", details: { GyroState: "Calibrated", GpsSync: "Active" } }
    ],
    inventory: [
      { partId: "MRO-SPINDLE", name: "High-Temp Fuel Spindle Valve", category: "Spare Parts", stock: 8, reserved: 2, reorderLevel: 10, location: "Engine Store Locker 3 - Rotterdam", supplierId: "sup-1", leadTimeDays: 3 },
      { partId: "MRO-GASKET", name: "Aux Engine Cylinder Head Gasket", category: "Consumables", stock: 3, reserved: 1, reorderLevel: 5, location: "Aux Locker B - Rotterdam", supplierId: "sup-3", leadTimeDays: 22 }
    ],
    workOrders: [
      { id: "mar-wo-1", assetId: "IMO-9602447", title: "Planned Cylinder Head Overhaul", priority: "High", status: "Planned", assignedTeam: "Vessel Engine Crew", assignedPerson: "Chief Kenji Sato", createdDate: "2026-08-20", dueDate: "2026-08-28", estimatedDuration: "8 Hours", requiredParts: [{ partId: "MRO-GASKET", quantity: 1 }], notes: "Exhaust temperature rising trend indicates gasket fatigue." },
      { id: "mar-wo-2", assetId: "IMO-9602447", title: "Corrective Fuel Line Seepage Fix", priority: "High", status: "In Progress", assignedTeam: "Vessel Engine Crew", assignedPerson: "Chief Kenji Sato", createdDate: "2026-08-21", dueDate: "2026-08-24", estimatedDuration: "3 Hours", requiredParts: [{ partId: "MRO-SPINDLE", quantity: 1 }], notes: "Seepage detected during rounds on Carrier 02." }
    ],
    compliance: [
      { id: "mar-cmp-1", title: "IMO Class Certificate of Seaworthiness", authority: "DNV", expiryDate: "2026-09-01", status: "Expiring" },
      { id: "mar-cmp-2", title: "MARPOL Annex VI Air Pollution Cert", authority: "IMO", expiryDate: "2027-02-12", status: "Valid" }
    ],
    insights: [
      { id: "mar-ins-1", type: "operational", title: "High Cylinder Temperature Anomaly", severity: "High", targetEntity: "IMO-9602447", detail: "Cylinder exhaust temperature reached 520°C. Head gasket replacement is suggested.", recommendation: "Perform engine power test and inspect head gasket at next port call." }
    ]
  },
  energy: {
    assets: [
      { id: "nrg-ast-1", name: "Main Transformer TX-204", type: "Transformer", status: "warning", healthScore: 78, failureRisk: 22, location: "Grid Substation B - Austin", criticality: "Critical", lastMaintenance: "2026-04-10", nextMaintenance: "2026-09-10", details: { OilTemp: "85°C", LoadFactor: "94%", TotalGas: "120 ppm", CoolingFans: "3/4 Active", VoltageLevel: "345kV" } },
      { id: "nrg-ast-2", name: "Solar Inverter INV-9", type: "Solar Inverter", status: "healthy", healthScore: 98, failureRisk: 1, location: "Solar Array Farm - El Paso", criticality: "Medium", lastMaintenance: "2026-08-18", nextMaintenance: "2026-11-18", details: { Efficiency: "98.8%", CurrentOutput: "480 kW", DCVoltage: "850 V", ACCurrent: "580 A" } },
      { id: "nrg-ast-3", name: "Wind Turbine WT-18", type: "Wind Turbine", status: "healthy", healthScore: 92, failureRisk: 8, location: "Energy Wind Hub C - Abilene", criticality: "High", lastMaintenance: "2026-07-05", nextMaintenance: "2026-10-05", details: { WindSpeed: "14.2 m/s", BladePitch: "12.4 deg", GearboxTemp: "68°C", RotorRPM: "15.4 rpm", YawAngle: "282 deg" } },
      { id: "nrg-ast-4", name: "Solar Inverter INV-10", type: "Solar Inverter", status: "warning", healthScore: 76, failureRisk: 24, location: "Solar Array Farm - El Paso", criticality: "Medium", lastMaintenance: "2026-05-20", nextMaintenance: "2026-09-20", details: { Efficiency: "91.2%", CurrentOutput: "400 kW", DCVoltage: "780 V", ACCurrent: "490 A" } },
      { id: "nrg-ast-5", name: "High-Voltage Circuit Breaker CB-104", type: "Switchgear", status: "healthy", healthScore: 94, failureRisk: 6, location: "Grid Substation B - Austin", criticality: "Critical", lastMaintenance: "2026-08-01", nextMaintenance: "2026-12-01", details: { TripCounter: 42, SF6Pressure: "5.8 Bar", ContactResistance: "28 micro-ohms" } },
      { id: "nrg-ast-6", name: "Emergency Pump BP-08", type: "Pump", status: "healthy", healthScore: 90, failureRisk: 10, location: "Hydro Facility Alpha - Abilene", criticality: "High", lastMaintenance: "2026-06-15", nextMaintenance: "2026-12-15", details: { FlowRate: "1200 gpm", Vibration: "0.15 in/s", MotorTemp: "54°C" } },
      { id: "nrg-ast-7", name: "Main Generator GEN-03", type: "Generator", status: "healthy", healthScore: 95, failureRisk: 5, location: "Gas Turbine Plant - Austin", criticality: "Critical", lastMaintenance: "2026-03-12", nextMaintenance: "2026-09-12", details: { OutputMW: "180 MW", RotorVibration: "Normal", StatorTemp: "75°C" } },
      { id: "nrg-ast-8", name: "Grid Battery Storage BESS-2", type: "Battery", status: "healthy", healthScore: 96, failureRisk: 4, location: "Grid Substation B - Austin", criticality: "High", lastMaintenance: "2026-07-20", nextMaintenance: "2027-01-20", details: { SOC: "88%", BatteryTemp: "28°C", SohPercent: "98.5%", CycleCount: 450 } },
      { id: "nrg-ast-9", name: "Feeder Meter MTR-81", type: "Meter", status: "healthy", healthScore: 99, failureRisk: 1, location: "Infrastructure Segment D - Austin", criticality: "Low", lastMaintenance: "2026-01-10", nextMaintenance: "2027-01-10", details: { TotalActivePower: "24500 kWh", ReactivePower: "180 kVAR", PhaseVoltageA: "120.2 V" } },
      { id: "nrg-ast-10", name: "Transmission Tower Line T-Line 10", type: "Transmission Equipment", status: "healthy", healthScore: 91, failureRisk: 9, location: "Austin - Abilene Network", criticality: "Critical", lastMaintenance: "2025-11-20", nextMaintenance: "2026-11-20", details: { SagMeter: "2.4m", InsulatorLeakage: "0.2mA", LineTension: "18.5kN" } }
    ],
    inventory: [
      { partId: "TX-OIL", name: "High-Grade Transformer Insulating Oil (200L)", category: "Transformer Components", stock: 10, reserved: 2, reorderLevel: 15, location: "Austin Central Depot", supplierId: "sup-2", leadTimeDays: 14 },
      { partId: "WT-RELAY", name: "Relay Controller Card WT-R2", category: "Electrical Components", stock: 3, reserved: 0, reorderLevel: 4, location: "Abilene Operations Depot", supplierId: "sup-6", leadTimeDays: 8 },
      { partId: "SF6-GAS", name: "SF6 Gas Replacement Cylinders", category: "Electrical Components", stock: 6, reserved: 0, reorderLevel: 5, location: "Austin Central Depot", supplierId: "sup-2", leadTimeDays: 14 },
      { partId: "CRIT-INVERTER-BOARD", name: "Solar Inverter Power Module Board", category: "Critical Spares", stock: 2, reserved: 1, reorderLevel: 3, location: "El Paso Solar Depot", supplierId: "sup-4", leadTimeDays: 5 },
      { partId: "FIBER-CON-100", name: "High-Voltage Shielded Control Cable (100m)", category: "Field Materials", stock: 18, reserved: 4, reorderLevel: 10, location: "Austin Central Depot", supplierId: "sup-6", leadTimeDays: 8 }
    ],
    workOrders: [
      { id: "nrg-wo-1", assetId: "nrg-ast-1", title: "Dissolved Gas Analysis (DGA) and Oil Top-Up", priority: "High", status: "Assigned", assignedTeam: "Austin Transmission Team Alpha", assignedPerson: "Nikola Tesla", createdDate: "2026-08-20", dueDate: "2026-08-25", estimatedDuration: "4 Hours", requiredParts: [{ partId: "TX-OIL", quantity: 2 }], notes: "Total dissolved gas level is rising. Perform onsite oil filtration." },
      { id: "nrg-wo-2", assetId: "nrg-ast-4", title: "Overhaul Inverter Ingress Gaskets", priority: "Medium", status: "New", assignedTeam: "El Paso Solar Team Beta", assignedPerson: "Albert Einstein", createdDate: "2026-08-22", dueDate: "2026-08-29", estimatedDuration: "3 Hours", requiredParts: [], notes: "Efficiency degradation observed. Gasket decay suspected." },
      { id: "nrg-wo-3", assetId: "nrg-3", title: "Wind Turbine Gearbox Inspection", priority: "High", status: "In Progress", assignedTeam: "Abilene Wind Team Delta", assignedPerson: "Marie Curie", createdDate: "2026-08-23", dueDate: "2026-08-26", estimatedDuration: "5 Hours", requiredParts: [], notes: "Vibration signature indicates slight gear shift. Inspect oil level and sensor alignment." }
    ],
    compliance: [
      { id: "nrg-cmp-1", title: "NERC CIP Reliability Audit Certification", authority: "FERC", expiryDate: "2026-08-20", status: "Expired" },
      { id: "nrg-cmp-2", title: "EPA Substation Spill Prevention Plan", authority: "EPA", expiryDate: "2027-06-30", status: "Valid" },
      { id: "nrg-cmp-3", title: "ANSI High-Voltage Testing Certificate", authority: "OSHA", expiryDate: "2026-09-15", status: "Expiring" }
    ],
    insights: [
      { id: "nrg-ins-1", type: "risk", title: "NERC Audit Expiry Risk", severity: "Critical", targetEntity: "Compliance Department", detail: "NERC CIP certification expired 3 days ago. Submit field verifications immediately.", recommendation: "Complete and file grid compliance audit data sheets." },
      { id: "nrg-ins-2", type: "operational", title: "Transformer Oil Temp Warning", severity: "High", targetEntity: "nrg-ast-1", detail: "Oil temperature is 85°C. Cooling fans operating at 75% load capacity.", recommendation: "Trigger auxiliary fan manual override check." }
    ]
  },
  logistics: {
    assets: [
      { id: "log-ast-1", name: "Cold Storage Unit CSU-01", type: "Warehouse Unit", status: "healthy", healthScore: 94, failureRisk: 4, location: "SCIO Warehouse North - Chicago", criticality: "High", lastMaintenance: "2026-07-28", nextMaintenance: "2026-09-28", details: { InternalTemp: "-18.5°C", Humidity: "45%", CompressorsActive: 2 } },
      { id: "log-ast-2", name: "Delivery Truck F-150", type: "Fleet Vehicle", status: "warning", healthScore: 65, failureRisk: 35, location: "SCIO Logistics Center West - Seattle", criticality: "Medium", lastMaintenance: "2026-05-15", nextMaintenance: "2026-08-26", details: { FuelLevel: "30%", BrakeWear: "78%", EngineCode: "P0420" } },
      { id: "log-ast-3", name: "Dock Leveler DL-04", type: "Loading Dock System", status: "healthy", healthScore: 92, failureRisk: 8, location: "SCIO Warehouse North - Chicago", criticality: "Medium", lastMaintenance: "2026-08-01", nextMaintenance: "2026-11-01", details: { HydPressure: "2800 psi", CycleCount: 1540 } },
      { id: "log-ast-4", name: "Electric Forklift EF-12", type: "Material Handling", status: "healthy", healthScore: 96, failureRisk: 4, location: "SCIO Distribution Hub 01", criticality: "Medium", lastMaintenance: "2026-08-12", nextMaintenance: "2026-09-12", details: { BatteryHealth: "94%", OperatingHrs: 450 } }
    ],
    inventory: [
      { partId: "COMP-FAN", name: "Evaporator Fan Assembly", category: "HVAC Spares", stock: 3, reserved: 0, reorderLevel: 2, location: "Aisle C9 - Chicago Hub", supplierId: "sup-4", leadTimeDays: 5 },
      { partId: "FL-WHEEL", name: "Forklift Drive Wheel Tire", category: "Tires", stock: 12, reserved: 2, reorderLevel: 4, location: "Aisle E2 - Dist Hub 01", supplierId: "sup-1", leadTimeDays: 3 },
      { partId: "HYD-VALVE", name: "Leveler Hyd Solenoid Valve", category: "Hydraulics", stock: 2, reserved: 0, reorderLevel: 2, location: "Aisle C10 - Chicago Hub", supplierId: "sup-4", leadTimeDays: 5 }
    ],
    workOrders: [
      { id: "log-wo-1", assetId: "log-ast-2", title: "Brake Pad Replacement and O2 Sensor Check", priority: "Medium", status: "Planned", assignedTeam: "Seattle Fleet Maintenance", assignedPerson: "Henry Ford", createdDate: "2026-08-22", dueDate: "2026-08-27", estimatedDuration: "2 Hours", requiredParts: [], notes: "Safety check due. Driver reported brake pad squeaking." },
      { id: "log-wo-2", assetId: "log-ast-4", title: "Inspect Forklift Hydraulic Lift Cylinder", priority: "Medium", status: "New", assignedTeam: "Chicago MRO Crew", assignedPerson: "Nikola Tesla", createdDate: "2026-08-22", dueDate: "2026-08-28", estimatedDuration: "1 Hour", requiredParts: [], notes: "Slight hydraulic fluid leakage reported on hydraulic seals." }
    ],
    compliance: [
      { id: "log-cmp-1", title: "DOT Fleet Operating Certification", authority: "FMCSA", expiryDate: "2027-05-30", status: "Valid" },
      { id: "log-cmp-2", title: "Cold Storage FDA Inspection Certificate", authority: "FDA", expiryDate: "2026-08-25", status: "Expiring" }
    ],
    insights: [
      { id: "log-ins-1", type: "operational", title: "Refrigeration Thermal Fluctuations", severity: "Low", targetEntity: "Cold Storage Unit CSU-01", detail: "Internal temperature fluctuated. Defrost cycles indicate slight compressor wear.", recommendation: "Perform sensor check and clean evaporator coils." }
    ]
  }
};
