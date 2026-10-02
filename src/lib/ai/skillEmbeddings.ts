// ============================================================================
// STELLAR SCIO SKILL VECTOR EMBEDDINGS & DYNAMIC RAG RETRIEVAL ENGINE
// Ultra token-efficient vector representation of the Stellar SCIO Skill Knowledge Base.
// Extracts and injects dense, minimal-token facts (<40 tokens) into chatbot contexts.
// ============================================================================

export interface SkillKnowledgeChunk {
  id: string;
  sector: "energy" | "maritime" | "manufacturing" | "logistics" | "general" | "all";
  category: string;
  title: string;
  keywords: string[];
  compactFact: string; // Token-condensed factual summary (under 25-40 tokens)
  content: string;     // Full detailed technical content
  suggestedAction?: {
    type: "launch_occ" | "open_beta" | "scroll";
    label: string;
    payload?: Record<string, string> | string;
  };
  embedding?: number[];
}

export interface RetrievalResult {
  chunk: SkillKnowledgeChunk;
  similarity: number;
  extractedKeyPoints: string[];
}

// ============================================================================
// 1. EXTRACTED SEMANTIC KNOWLEDGE CHUNKS WITH DENSE TOKEN-COMPACT FACTS
// ============================================================================

export const SKILL_KNOWLEDGE_CHUNKS: SkillKnowledgeChunk[] = [
  // --- PLATFORM CORE & ARCHITECTURE ---
  {
    id: "platform-overview-core",
    sector: "all",
    category: "Platform Overview",
    title: "Stellar SCIO Enterprise Operations Platform Overview",
    keywords: ["what is scio", "platform overview", "roi", "savings", "uptime", "early warning", "false alarms"],
    compactFact: "Stellar SCIO unifies machines, SCADA, logs & supply chain into one cockpit. Saves $1.4M-$2.8M/site/yr, 99.98% uptime, 91% fewer false alarms, 14-21d early breakdown warning. Zero hardware overhaul.",
    content: 
      "Stellar SCIO is an enterprise AI software platform that bridges the physical-digital divide by unifying industrial machinery, sensor telemetry, maintenance logs, supply chain logistics, and ERP systems into a centralized, real-time command cockpit. " +
      "It delivers $1.4M to $2.8M in annual cost savings per site by eliminating emergency downtime, maintains 99.98% fleet uptime, reduces false alarms by 91% through contextual multi-sensor corroboration, and predicts catastrophic machine breakdowns 14 to 21 days in advance. " +
      "It requires zero hardware rip-and-replace by connecting side-by-side with existing SCADA, PLCs, and historians.",
    suggestedAction: { type: "open_beta", label: "Apply for Private Beta Access" }
  },
  {
    id: "platform-intelligence-loop",
    sector: "all",
    category: "Architecture",
    title: "The 4-Step Closed-Loop Intelligence Cycle",
    keywords: ["how it works", "4 step", "connect", "understand", "predict", "act", "closed loop", "digital twin"],
    compactFact: "4-Step Closed-Loop: 1.CONNECT (OPC-UA/Modbus/MQTT/PLCs) ➔ 2.UNDERSTAND (digital twin) ➔ 3.PREDICT (vibration/thermal models 14-21d early) ➔ 4.ACT (auto-creates SAP PM/Maximo work orders).",
    content: 
      "Stellar SCIO operates on a continuous 4-step intelligence cycle:\n" +
      "1. CONNECT: Ingests real-time telemetry from industrial machines, PLCs, and SCADA historians using standard protocols (OPC-UA, Modbus, MQTT, Siemens S7, Rockwell) without hardware disruption.\n" +
      "2. UNDERSTAND: Fuses high-frequency sensor streams with operating manuals, asset bills-of-materials (BOM), and historical work orders to build a living semantic Digital Twin.\n" +
      "3. PREDICT: Runs multi-variate anomaly detection and physics-informed ML models to forecast mechanical wear, cavitation, electrical degradation, and supply chain bottlenecks 14 to 21 days early.\n" +
      "4. ACT: Automatically synthesizes actionable mitigation plans, drafts maintenance work orders in SAP S/4HANA PM or IBM Maximo, and reserves or orders critical spare parts.",
    suggestedAction: { type: "scroll", label: "View Architecture & 4-Step Loop", payload: "#how-it-works" }
  },
  {
    id: "platform-data-sovereignty",
    sector: "all",
    category: "Security & Sovereignty",
    title: "100% Data Sovereignty, Security & Air-Gapped Deployment",
    keywords: ["security", "data sovereignty", "on-premise", "private cloud", "nerc-cip", "soc2", "air-gapped", "encryption"],
    compactFact: "100% Data Sovereignty: On-Premise & Private Cloud (AWS/Azure/GCP GovCloud, air-gapped). NERC-CIP & SOC2 Type II compliant, TLS 1.3 & AES-256. Operational data never leaves client boundary.",
    content: 
      "Stellar SCIO guarantees 100% Data Sovereignty for mission-critical operations. The platform can be deployed 100% On-Premise on bare-metal servers or inside customer-owned private VPCs (AWS GovCloud, Azure Government, Google Cloud Assured Workloads) and air-gapped SCADA environments. " +
      "Operational telemetry and equipment data never leave your enterprise security boundary. " +
      "Complies with SOC 2 Type II, NERC-CIP (Critical Infrastructure Protection), ISO 27001, and ISO 55001 standards, with end-to-end TLS 1.3 encryption in transit and AES-256 at rest.",
    suggestedAction: { type: "open_beta", label: "Request Security & Compliance Spec" }
  },
  {
    id: "platform-erp-integrations",
    sector: "all",
    category: "Integrations",
    title: "Enterprise ERP & Industrial Protocol Integration",
    keywords: ["integrations", "opc-ua", "modbus", "mqtt", "sap", "maximo", "netsuite", "siemens", "rockwell"],
    compactFact: "Protocols: OPC-UA, Modbus TCP/RTU, MQTT Sparkplug B, Siemens S7, Rockwell. ERPs: SAP S/4HANA PM (auto-drafts IW21/IW31 work orders, MB21 reservations), IBM Maximo, Oracle NetSuite.",
    content: 
      "Stellar SCIO integrates plug-and-play with existing industrial automation and enterprise resource planning software:\n" +
      "• Protocols: Native connectors for OPC-UA / OPC-DA, Modbus TCP/RTU, MQTT Sparkplug B, Siemens S7, and Rockwell Ethernet/IP.\n" +
      "• SAP S/4HANA PM: Automated generation of maintenance notifications (IW21) and work orders (IW31), with real-time spare parts inventory reservation (MB21).\n" +
      "• IBM Maximo: Direct REST/MIF synchronization of asset failure codes, work packages, and technician labor scheduling.\n" +
      "• Oracle NetSuite & Microsoft Dynamics 365: Purchase requisitions and supplier delivery performance sync.",
    suggestedAction: { type: "scroll", label: "Explore Supported Connectors", payload: "#integrations" }
  },

  // --- RENEWABLE ENERGY & POWER GRID ---
  {
    id: "energy-occ-operations",
    sector: "energy",
    category: "Renewable Energy",
    title: "Renewable Energy Central Operations Room (OCC)",
    keywords: ["energy occ", "grid operations", "power dispatch", "solar yield", "wind generation", "bess battery", "spinning reserves"],
    compactFact: "Energy OCC (12.4GW live): Real-time CO2 offsets, green share %, spinning reserves MW, Recharts solar/wind/BESS vs ERCOT load, frequency containment reserve stabilizer.",
    content: 
      "The Central Operations Room (OCC) provides command-level visibility across 12.4 GW of clean energy capacity:\n" +
      "• Grid Performance Indicators: Real-time CO₂ Offsets (tonnes), Green Share Ratio (%), Spinning Reserves Capacity (MW), and SCADA Average Equipment Health (0-100%).\n" +
      "• Live Energy Dispatch Chart: 24-hour rolling Recharts visual plotting live Solar yields, Wind generator yields, and active BESS battery charging/discharging curves matched against Grid Demand Load (MW).\n" +
      "• Sourced Generation Mix: Real-time generation percentage breakdown across Solar PV, Wind Ridges, and BESS capacity blocks.\n" +
      "• Grid Stabilizer Advisory Console: Predictive automated advice for frequency containment reserves (FCR) and reactive power voltage adjustments.",
    suggestedAction: { type: "launch_occ", label: "Open Energy Control Room", payload: { industry: "energy", tab: "energy-dashboard" } }
  },
  {
    id: "energy-plants-registry",
    sector: "energy",
    category: "Renewable Energy",
    title: "Fleet Infrastructure & 9 Utility Power Plants Registry",
    keywords: ["power plants", "mojave solar", "desert sunlight", "hornsdale storage", "sweetwater wind", "substations", "bess capacity"],
    compactFact: "9 Active Plants: Mojave Solar One (350MW, 96% health), Desert Sunlight (550MW, 92%), Hornsdale BESS (150MW/193MWh, 99%), Sweetwater Wind (585MW, 88%), Roscoe Wind (781MW, 90%), Moss Landing BESS (400MW, 98%).",
    content: 
      "Stellar SCIO monitors 9 utility-scale generation plants in the fleet registry:\n" +
      "1. Mojave Solar One (Solar PV, 350 MW, Barstow CA, Health: 96%)\n" +
      "2. Desert Sunlight (Solar PV, 550 MW, Riverside CA, Health: 92%)\n" +
      "3. Hornsdale Storage (BESS, 150 MW / 193.5 MWh, South Australia, Health: 99%)\n" +
      "4. Sweetwater Wind (Wind, 585 MW, Nolan County TX, Health: 88%)\n" +
      "5. Columbia Gorge Hydro (Hydro, 420 MW, Cascade Locks OR, Health: 94%)\n" +
      "6. Roscoe Wind Farm (Wind, 781 MW, Roscoe TX, Health: 90%)\n" +
      "7. Moss Landing Facility (BESS, 400 MW / 1600 MWh, Monterey County CA, Health: 98%)\n" +
      "8. Copper Mountain Solar (Solar PV, 802 MW, Boulder City NV, Health: 95%)\n" +
      "9. Tehachapi Pass Wind (Wind, 705 MW, Kern County CA, Health: 84%)\n" +
      "Displays live ambient temperature, solar irradiance (W/m²), rotor RPM, blade pitch angles, and grid AC voltage profiles.",
    suggestedAction: { type: "launch_occ", label: "Explore Plants Directory", payload: { industry: "energy", tab: "energy-plants" } }
  },
  {
    id: "energy-scio-flow-texas",
    sector: "energy",
    category: "Renewable Energy",
    title: "SCIO Flow Explorer & Texas ERCOT Transmission Map",
    keywords: ["ercot", "texas grid", "transmission map", "linear grid path", "substation nodes", "el paso", "abilene", "austin"],
    compactFact: "ERCOT Texas Flow: Animated grid power transfers (El Paso solar, Abilene wind, Austin/San Antonio substations). 10-step diagnostics: Infrastructure➔Site➔Asset➔Field➔Condition➔Maint➔Materials➔Supply➔Compliance➔Intel.",
    content: 
      "The SCIO Flow Explorer visualizes the linear path of energy through an interactive Texas ERCOT SVG transmission map:\n" +
      "• Animated transmission lines display active power transfers between West Texas solar generation zones (El Paso), Northern wind clusters (Abilene), and Central substation nodes (Austin/San Antonio).\n" +
      "• 10-Step Sequential Diagnostics Ticker: Infrastructure ➔ Site ➔ Asset ➔ Field Job ➔ Condition ➔ Maintenance ➔ Materials ➔ Supply ➔ Compliance ➔ Intelligence.\n" +
      "Allows operators to isolate bottlenecks and trace individual node health logs across the entire grid value chain.",
    suggestedAction: { type: "launch_occ", label: "Open SCIO Flow Explorer", payload: { industry: "energy", tab: "energy-scio-flow" } }
  },
  {
    id: "energy-asset-reliability",
    sector: "energy",
    category: "Renewable Energy",
    title: "Equipment Reliability, Gearbox Vibration & MTBF/MTTR",
    keywords: ["wind turbine health", "gearbox vibration", "bearing wear", "blade pitch", "inverter efficiency", "mtbf", "mttr"],
    compactFact: "Energy Reliability: Wind gearbox vibration spectra & bearing wear detected 14-21d early. Blade pitch torque transient checks. Solar inverter IGBT efficiency & BESS thermal runaway prevention. MTBF/MTTR tracking.",
    content: 
      "Predictive asset diagnostics for renewable generation infrastructure:\n" +
      "• Wind Turbines: Continuous vibration spectra monitoring on gearbox high-speed stages and main bearings to detect pitting and spalling 14 to 21 days before catastrophic failure.\n" +
      "• Blade Pitch Drives: Tracks hydraulic pressure transients and electric pitch actuator current draw to prevent aerodynamic imbalances.\n" +
      "• Solar Inverters & BESS: Thermographic and electrical telemetry tracking string current imbalance, IGBT degradation, inverter conversion efficiency, and battery cell thermal runaway risks.\n" +
      "• Reliability Metrics: Mean Time Between Failures (MTBF) and Mean Time To Repair (MTTR) gauges with automated root-cause recommendations.",
    suggestedAction: { type: "launch_occ", label: "View Asset Health Registry", payload: { industry: "energy", tab: "energy-assets" } }
  },

  // --- MARITIME FLEET OPERATIONS ---
  {
    id: "maritime-fleet-tracking",
    sector: "maritime",
    category: "Maritime Operations",
    title: "Global Maritime Fleet Tracking & AIS Satellite Telemetry",
    keywords: ["maritime fleet", "ship tracking", "vessels", "stellar voyager", "pacific pioneer", "ais gps", "port eta", "charter rates"],
    compactFact: "Maritime Fleet: 48 ships tracked via satellite AIS: Stellar Voyager (14k TEU container), Pacific Pioneer (180k DWT bulk), Atlantic Horizon (158k DWT crude), Nordic Star (174k m3 LNG). Live SOG/COG, ETAs, charter earnings.",
    content: 
      "Stellar SCIO tracks 48 commercial cargo vessels worldwide using real-time satellite AIS telematics:\n" +
      "• Monitored Fleet: Container Ships (e.g. Stellar Voyager, 14,000 TEU, Singapore ➔ Rotterdam), Capesize Bulk Carriers (Pacific Pioneer, 180,000 DWT), Suezmax Crude Tankers (Atlantic Horizon, 158,000 DWT), and LNG Carriers (Nordic Star, 174,000 m³).\n" +
      "• Live Telemetry: GPS coordinates, speed over ground (SOG, knots), course over ground (COG), route waypoints, port arrival estimates (ETA), and daily charter earnings ($/day).\n" +
      "• Weather Routing: Dynamic oceanic voyage optimization matching sea swell, wind vectors, and bunker consumption.",
    suggestedAction: { type: "launch_occ", label: "Launch Maritime Fleet Center", payload: { industry: "maritime", tab: "dashboard" } }
  },
  {
    id: "maritime-engine-diagnostics",
    sector: "maritime",
    category: "Maritime Operations",
    title: "Ship Main Engine Health & Mechanical Telemetry",
    keywords: ["ship engine", "cylinder temperature", "oil pressure", "turbocharger vibration", "engine failure", "fuel injector fouling"],
    compactFact: "Marine Engine: Exhaust cylinder temps (Cyl #4: 398°C), lube oil differential pressure, turbocharger vibration harmonics. Catches fuel injector fouling and crankpin bearing wear 18d before sea breakdown.",
    content: 
      "Continuous mechanical diagnostics for marine main engines and auxiliary generators:\n" +
      "• Cylinder Combustion: Real-time exhaust gas temperatures (e.g. peak cylinder #4 at 398°C), scavenging air pressures, and peak firing pressures.\n" +
      "• Lubrication & Bearings: Oil differential pressure across filters, sump oil viscosity, and main crankpin bearing temperature monitoring.\n" +
      "• Failure Preemption: Detects fuel injector nozzle fouling, turbocharger surging, and exhaust valve blow-by 18 days before engine breakdown at sea.\n" +
      "• Automated Alerts: Dispatches immediate maintenance instructions to shipboard chief engineers.",
    suggestedAction: { type: "launch_occ", label: "Inspect Vessel Telemetry", payload: { industry: "maritime", tab: "dashboard" } }
  },
  {
    id: "maritime-bunker-management",
    sector: "maritime",
    category: "Maritime Operations",
    title: "Bunker Fuel Logs, Consumption Rates & IMO CII Compliance",
    keywords: ["bunker fuel", "mgo", "hfo", "fuel consumption", "sulfur content", "imo cii", "bunkering port"],
    compactFact: "Bunker & Fuel: MGO & HFO ROB (metric tons), daily fuel burn rate vs speed, IMO 0.50% sulfur compliance, CII ratings (A-E), automated bunkering requisition 5d before destination port arrival.",
    content: 
      "Comprehensive maritime bunker and environmental compliance management:\n" +
      "• Fuel Tank Stocks: Live tracking of Marine Gas Oil (MGO) and Heavy Fuel Oil (HFO) Remaining on Board (ROB, metric tons).\n" +
      "• Burn Rates: Calculates daily fuel consumption rates (MT/day) relative to vessel speed, sea state, and draft displacement.\n" +
      "• Sulfur Cap & CII: Validates fuel sulfur content (% mass) against the IMO 0.50% global sulfur cap, and tracks Carbon Intensity Indicator (CII ratings A to E).\n" +
      "• Port Bunkering: Flags refueling requirements 5 days before arrival, automating bunker delivery coordination at destination berths.",
    suggestedAction: { type: "launch_occ", label: "Open Bunker Fuel Console", payload: { industry: "maritime", tab: "bunker" } }
  },
  {
    id: "maritime-safety-compliance",
    sector: "maritime",
    category: "Maritime Operations",
    title: "SOLAS/MARPOL Safety Inspections & Port State Control (PSC)",
    keywords: ["safety inspection", "lifeboats", "fire alarms", "port state control", "psc deficiencies", "capa", "0 detentions"],
    compactFact: "Marine Safety: SOLAS/MARPOL digital checklists (lifeboats, fire pumps, watertight doors). Port State Control (PSC) CAPA tracking with DNV/LR/ABS. 94% inspection pass rate, 0 port detentions.",
    content: 
      "Ensures continuous regulatory inspection readiness across all vessels:\n" +
      "• Digital Safety Checklists: Scheduled audits for lifeboats and davit winches, CO₂ fixed fire suppression stations, emergency fire pumps, watertight bulkhead doors, and immersion suits.\n" +
      "• Port State Control (PSC): Tracks deficiencies and Corrective Actions (CAPA) with classification societies (DNV, Lloyd's Register, ABS).\n" +
      "• Track Record: Stellar SCIO maintains a 94% inspection pass rate and 0 port detentions across all monitored fleets.",
    suggestedAction: { type: "launch_occ", label: "View Marine Safety Hub", payload: { industry: "maritime", tab: "safety" } }
  },

  // --- MANUFACTURING 4.0 & FACTORY OEE ---
  {
    id: "mfg-oee-tracking",
    sector: "manufacturing",
    category: "Smart Factory",
    title: "Real-Time Factory OEE & Robotic Assembly Line Metrics",
    keywords: ["oee", "overall equipment effectiveness", "availability", "performance", "quality", "downtime", "robotic cells"],
    compactFact: "Factory OEE: Availability x Performance x Quality across 24 robotic cells (91.4% avg). Flags micro-stoppages & conveyor jams. Delivers +11.2% OEE, -38% downtime, -64% defect escapes.",
    content: 
      "Real-time Overall Equipment Effectiveness (OEE) tracking across automated shopfloors:\n" +
      "• OEE Calculation: Multiplies Availability × Performance × Quality across 24 robotic assembly cells and CNC lines (achieving 91.4% average fleet OEE).\n" +
      "• Availability: Flags unpredicted downtime, tool changeover latencies, and mechanical faults.\n" +
      "• Performance: Tracks actual machine cycle speeds against rated cycle time, identifying micro-stoppages (<5 min) and feeder conveyor jams that cause cumulative production losses.\n" +
      "• Business Impact: Delivers +11.2% OEE improvement, -38% unplanned downtime, and -64% defect escapes within two quarters.",
    suggestedAction: { type: "launch_occ", label: "Open Manufacturing Cockpit", payload: { industry: "manufacturing", tab: "dashboard" } }
  },
  {
    id: "mfg-asset-maintenance",
    sector: "manufacturing",
    category: "Smart Factory",
    title: "CNC Spindle Vibration, Acoustic Bearing Wear & Tool Maintenance",
    keywords: ["cnc spindle", "spindle vibration", "tool wear", "bearing wear", "sap work order", "plant maintenance"],
    compactFact: "Factory Maintenance: CNC spindle & robot joint vibration (Robotic Arm Joint 3: 4.2mm/s RMS), thermal hotspots (82.1°C), tool wear. Auto-drafts SAP PM work orders with vibration signatures.",
    content: 
      "Industrial machine diagnostics and automated work order generation:\n" +
      "• High-Frequency Vibration: Monitors CNC machine spindle bearings and robotic joints (e.g. Robotic Arm Joint 3 at 4.2 mm/s RMS) to catch bearing wear before catastrophic tool breakdown.\n" +
      "• Thermal Telemetry: High-speed infrared sensors detect spindle motor thermal hotspots (peaking at 82.1°C during high-speed milling).\n" +
      "• SAP PM Integration: Automatically auto-drafts tool changeover and corrective work orders in SAP S/4HANA PM with attached vibration spectra and parts reservations.",
    suggestedAction: { type: "launch_occ", label: "Open Asset Maintenance Hub", payload: { industry: "manufacturing", tab: "maintenance" } }
  },
  {
    id: "mfg-quality-vision",
    sector: "manufacturing",
    category: "Smart Factory",
    title: "AI Computer Vision Quality Inspection & Full Traceability",
    keywords: ["quality inspection", "computer vision", "defect detection", "traceability", "first pass yield", "scrap rate"],
    compactFact: "Quality & Vision: 100% optical camera inspection for surface cracks, dimensional tolerances, weld seam porosity. Auto-quarantine routing & batch/lot ingot-to-serial number traceability.",
    content: 
      "Quality assurance and closed-loop defect elimination:\n" +
      "• In-Line Vision AI: Optical cameras inspect 100% of finished and semi-finished parts for surface cracks, dimensional tolerances, and weld seam porosity.\n" +
      "• Automated Quarantine: Defective parts are automatically diverted to rework bays without stopping primary line flow.\n" +
      "• Complete Traceability: Full batch and lot traceability linking raw material ingot lots to final assembled serial numbers.",
    suggestedAction: { type: "launch_occ", label: "View Quality & Traceability", payload: { industry: "manufacturing", tab: "quality" } }
  },
  {
    id: "mfg-production-planning",
    sector: "manufacturing",
    category: "Smart Factory",
    title: "Dynamic Production Planning, Line Balancing & Takt Time",
    keywords: ["production planning", "line scheduling", "takt time", "throughput", "shift quota"],
    compactFact: "Production Planning: Adaptive line balancing & takt time pacing. Re-routes orders away from degrading cells undergoing maintenance onto high-health lines. Shift throughput analytics.",
    content: 
      "Intelligent shopfloor production management:\n" +
      "• Adaptive Scheduling: Dynamically paces takt time across work centers based on live machine health and operator throughput.\n" +
      "• Load Balancing: Routes orders away from degrading cells undergoing predictive maintenance onto parallel high-health stations.\n" +
      "• Shift Analytics: Compares shift-over-shift performance and isolates operational bottlenecks.",
    suggestedAction: { type: "launch_occ", label: "Open Production Planning", payload: { industry: "manufacturing", tab: "planning" } }
  },

  // --- LOGISTICS & COLD-CHAIN SUPPLY ---
  {
    id: "logistics-coldchain-reefer",
    sector: "logistics",
    category: "Cold-Chain Logistics",
    title: "Cold-Chain Reefer IoT Temperature & Humidity Telemetry",
    keywords: ["cold chain", "reefer", "refrigerated container", "temperature control", "temperature excursion", "pharma"],
    compactFact: "Cold-Chain: Reefer IoT telemetry (-25°C to +4°C, Reefer #RC-804) logged every 15s. Alerts on +/-0.5°C drift, door openings, compressor spikes, and defrost cycles to protect cargo.",
    content: 
      "High-precision thermal monitoring for perishable and pharmaceutical freight:\n" +
      "• Continuous Telemetry: High-frequency IoT sensors log internal container temperature (-25°C to +4°C) every 15 seconds across refrigerated reefers (e.g. Reefer #RC-804).\n" +
      "• Excursion Alerts: Instant notifications alert operators when temperature drifts beyond threshold (+/- 0.5°C delta), door seals open unexpectedly, or refrigerant compressor pressure spikes.\n" +
      "• Defrost Cycle Tracking: Logs defrost cycles to protect biologics, vaccines, and frozen perishables from thermal degradation.",
    suggestedAction: { type: "launch_occ", label: "Open Cold-Chain Monitor", payload: { industry: "logistics", tab: "cold-chain" } }
  },
  {
    id: "logistics-congestion-forecasting",
    sector: "logistics",
    category: "Cold-Chain Logistics",
    title: "Port & Rail Congestion Forecasting & Demurrage Mitigation",
    keywords: ["port congestion", "shipping delay", "demurrage", "freight delay", "rail dwell time", "bottlenecks"],
    compactFact: "Supply Chain Bottlenecks: Port yard congestion & rail dwell times predicted 6-9d ahead. Dynamic container re-routing avoids $320K/yr demurrage. +17.8% on-time delivery, 96.4% ETA accuracy.",
    content: 
      "Machine learning bottleneck forecasting across global freight corridors:\n" +
      "• Predictive Lead Time: Forecasts port yard bottlenecks, terminal congestion, and rail dwell times 6 to 9 days in advance.\n" +
      "• Demurrage Avoidance: Automatically recommends dynamic container re-routing and accelerated chassis pickups, avoiding $320,000+ in carrier demurrage and detention fees annually.\n" +
      "• Delivery Reliability: Proven +17.8% improvement in On-Time In-Full (OTIF) delivery with 96.4% ETA prediction accuracy.",
    suggestedAction: { type: "launch_occ", label: "Open Supply Chain Tower", payload: { industry: "logistics", tab: "dashboard" } }
  },
  {
    id: "logistics-multimodal-map",
    sector: "logistics",
    category: "Cold-Chain Logistics",
    title: "Multimodal Live Fleet Map & Regional Warehouse Spare Parts",
    keywords: ["multimodal map", "fleet map", "warehouse stock", "spare parts sync", "automated po", "purchase orders"],
    compactFact: "Multimodal & Spares: Live GIS map tracking intermodal containers across vessels, trucks, and rail. Warehouse MRO stock synced with field work orders. Automated POs below safety threshold.",
    content: 
      "Unified supply chain visibility and MRO inventory harmonization:\n" +
      "• Multimodal Live GIS Map: Interactive map tracking intermodal containers across ocean freight vessels, linehaul trucks, and freight rail corridors.\n" +
      "• Warehouse MRO Spares: Synchronizes central warehouse stock levels directly with field technician repair requests across distribution hubs.\n" +
      "• Automated Purchase Orders: Automatically generates purchase requisitions when critical spare parts drop below safety stock thresholds, updating locked maintenance schedules.",
    suggestedAction: { type: "launch_occ", label: "Open Multimodal Map", payload: { industry: "logistics", tab: "multimodal-map" } }
  }
];

// ============================================================================
// 2. DENSE SEMANTIC VECTOR ENCODER (128-DIMENSIONAL L2-NORMALIZED)
// ============================================================================

const DOMAIN_CONCEPT_VOCAB: string[] = [
  "scio", "stellar", "platform", "enterprise", "downtime", "savings", "roi", "twin",
  "connect", "understand", "predict", "act", "sovereignty", "on-premise", "private",
  "soc2", "nerc-cip", "security", "encryption", "protocol", "opc-ua", "modbus", "mqtt",
  "sap", "maximo", "workorder", "maintenance", "spares", "inventory", "supplier",
  "energy", "power", "grid", "renewable", "solar", "wind", "bess", "battery",
  "megawatt", "dispatch", "load", "frequency", "substation", "mojave", "hornsdale",
  "desert", "sweetwater", "roscoe", "turbine", "gearbox", "vibration", "bearing",
  "pitch", "inverter", "irradiance", "thermal", "ercot", "texas", "transmission", "co2",
  "maritime", "fleet", "ship", "vessel", "voyage", "ais", "satellite", "gps",
  "voyager", "pioneer", "horizon", "nordic", "engine", "cylinder", "temperature", "pressure",
  "turbocharger", "bunker", "fuel", "mgo", "hfo", "consumption", "sulfur", "cii",
  "imo", "safety", "solas", "marpol", "lifeboat", "inspection", "psc", "detention",
  "manufacturing", "factory", "oee", "robotic", "cell", "availability", "performance", "quality",
  "stoppage", "conveyor", "jam", "cycle", "cnc", "spindle", "acoustic", "tooling",
  "wear", "vision", "camera", "defect", "scrap", "tolerance", "traceability", "takt",
  "logistics", "supply", "chain", "cold", "reefer", "container", "temperature", "excursion",
  "delay", "forecast", "port", "congestion", "demurrage", "rail", "dwell", "multimodal",
  "truck", "freight", "warehouse", "stock", "reorder", "purchase", "po"
];

const VOCAB_DIMENSION = 128;

export function computeDenseEmbedding(text: string): number[] {
  const vector = new Float32Array(VOCAB_DIMENSION);
  if (!text) return Array.from(vector);

  const clean = text.toLowerCase().replace(/[^\w\s-]/g, " ");
  const words = clean.split(/\s+/).filter(w => w.length > 1);

  // 1. Domain Concept Projections
  for (let i = 0; i < DOMAIN_CONCEPT_VOCAB.length; i++) {
    const concept = DOMAIN_CONCEPT_VOCAB[i];
    const targetDim = i % VOCAB_DIMENSION;
    let count = 0;

    for (const w of words) {
      if (w === concept) {
        count += 2.0;
      } else if (w.includes(concept) || concept.includes(w)) {
        count += 0.8;
      }
    }

    if (count > 0) {
      vector[targetDim] += count;
    }
  }

  // 2. Character 3-Gram Hashing for Morphological Generalization
  for (const word of words) {
    if (word.length >= 3) {
      for (let i = 0; i <= word.length - 3; i++) {
        const trigram = word.slice(i, i + 3);
        let hash = 0;
        for (let j = 0; j < 3; j++) {
          hash = (hash * 31 + trigram.charCodeAt(j)) & 0x7fffffff;
        }
        const dim = hash % VOCAB_DIMENSION;
        vector[dim] += 0.15;
      }
    }
  }

  // 3. L2 Normalization (Unit Length)
  let norm = 0;
  for (let i = 0; i < VOCAB_DIMENSION; i++) {
    norm += vector[i] * vector[i];
  }
  norm = Math.sqrt(norm);

  const result = new Array<number>(VOCAB_DIMENSION);
  if (norm > 0) {
    for (let i = 0; i < VOCAB_DIMENSION; i++) {
      result[i] = vector[i] / norm;
    }
  } else {
    for (let i = 0; i < VOCAB_DIMENSION; i++) {
      result[i] = 0;
    }
  }

  return result;
}

// Compute embeddings for all chunks once upon module load
for (const chunk of SKILL_KNOWLEDGE_CHUNKS) {
  const combinedText = `${chunk.title} ${chunk.category} ${chunk.keywords.join(" ")} ${chunk.compactFact} ${chunk.content}`;
  chunk.embedding = computeDenseEmbedding(combinedText);
}

export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
  }
  return Math.max(0, Math.min(1, dotProduct));
}

// ============================================================================
// 3. VECTOR SIMILARITY RETRIEVAL (TOP-K RAG SEARCH)
// ============================================================================

export function searchSkillEmbeddings(
  rawSector: string,
  rawQuery: string,
  topK = 2
): RetrievalResult[] {
  const sector = (rawSector || "home").toLowerCase();
  const query = (rawQuery || "").trim();
  if (!query) return [];

  const queryEmbedding = computeDenseEmbedding(query);
  const scoredChunks: RetrievalResult[] = [];

  for (const chunk of SKILL_KNOWLEDGE_CHUNKS) {
    if (!chunk.embedding) continue;

    let baseSim = cosineSimilarity(queryEmbedding, chunk.embedding);

    // Sector context relevance weighting
    let sectorBonus = 0;
    if (chunk.sector === sector) {
      sectorBonus = 0.22;
    } else if (chunk.sector === "all") {
      sectorBonus = (sector === "home" || sector === "general") ? 0.20 : 0.08;
    }

    // Direct keyword match boost
    const queryLower = query.toLowerCase();
    for (const kw of chunk.keywords) {
      if (queryLower.includes(kw)) {
        baseSim += 0.15;
        break;
      }
    }

    const finalScore = Math.min(1.0, baseSim + sectorBonus);

    // Extract key bullet points
    const sentences = chunk.content
      .split(/(?<=[.!?])\s+/)
      .filter(s => s.trim().length > 15);

    scoredChunks.push({
      chunk,
      similarity: Math.round(finalScore * 100) / 100,
      extractedKeyPoints: sentences.slice(0, 2)
    });
  }

  // Sort by similarity descending
  scoredChunks.sort((a, b) => b.similarity - a.similarity);

  return scoredChunks.slice(0, topK);
}

// ============================================================================
// 4. TOKEN-OPTIMIZED CONTEXT GENERATOR
// Extracts minimal token facts (<40 tokens per fact) to keep prompt tiny!
// ============================================================================

export function getRetrievedCompactFacts(results: RetrievalResult[], maxChunks = 2): string {
  if (!results.length) return "";
  return results
    .slice(0, maxChunks)
    .map(r => `• ${r.chunk.compactFact}`)
    .join("\n");
}

// ============================================================================
// 5. DYNAMIC GENERATIVE KNOWLEDGE SYNTHESIZER
// Generates intelligent, dynamic, context-aware responses directly from
// retrieved vector embeddings when external LLM API is unavailable/offline.
// ============================================================================

export function synthesizeDynamicResponse(
  rawSector: string,
  rawQuery: string,
  retrieved: RetrievalResult[]
): { text: string; provider: string; suggestedAction?: any } {
  const sector = (rawSector || "home").toLowerCase();

  if (!retrieved.length) {
    return {
      text: `**Stellar SCIO Platform Operational Intelligence**:\n\n` +
        `• **Unified Operations**: Stellar SCIO connects industrial machinery across Renewable Energy, Maritime Fleets, Manufacturing 4.0, and Logistics into one real-time dashboard.\n` +
        `• **14-Day Early Warning**: Detects bearing, thermal, and vibration wear 14 to 21 days before breakdown.\n` +
        `• **Data Sovereignty**: 100% on-premise and private cloud architecture ensures operational data stays on your own servers.\n` +
        `• **Automated Work Orders**: Integrates directly with SAP S/4HANA PM and IBM Maximo to auto-draft repairs.`,
      provider: "Stellar SCIO Vector Synthesizer",
      suggestedAction: { type: "open_beta", label: "Apply for Private Beta Access" }
    };
  }

  const primary = retrieved[0];
  const secondary = retrieved[1] || retrieved[0];

  // Synthesize concise, token-efficient response from the compact facts
  const bulletPoints: string[] = [];
  bulletPoints.push(primary.chunk.compactFact);
  if (secondary.chunk.id !== primary.chunk.id) {
    bulletPoints.push(secondary.chunk.compactFact);
  }

  const title = primary.chunk.title;
  const intro = `**${title}**:\n\n`;
  const formattedText = intro + bulletPoints.map(b => `• ${b}`).join("\n\n");

  const suggestedAction = primary.chunk.suggestedAction || secondary.chunk.suggestedAction || {
    type: "launch_occ",
    label: `Open ${sector.toUpperCase()} Operations Center`,
    payload: { industry: sector, tab: "dashboard" }
  };

  return {
    text: formattedText,
    provider: `Stellar SCIO Vector Intelligence (${primary.chunk.category})`,
    suggestedAction
  };
}
