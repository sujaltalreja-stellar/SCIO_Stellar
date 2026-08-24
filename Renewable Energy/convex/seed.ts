import { mutation } from "./_generated/server";

// Idempotent seeding mutation including Phase 2 & 3 tables
export const run = mutation({
  args: {},
  handler: async (ctx) => {
    // 1. Clean existing collections
    const collections = [
      "plants",
      "assets",
      "energyMetrics",
      "weather",
      "alarms",
      "maintenance",
      "auditLogs",
      "notifications",
      "inspectionTemplates",
      "inspections",
      "workOrders",
      "technicians",
      "aiInsights",
      "vendors",
      "warehouses",
      "inventoryItems",
      "purchaseRequisitions",
      "purchaseOrders",
      "costCenters",
      "integrationJobs",
      "integrationLogs",
    ];

    for (const coll of collections) {
      const records = await ctx.db.query(coll as any).take(5000);
      for (const rec of records) {
        await ctx.db.delete(rec._id);
      }
    }

    // 2. Define the 50 plants
    const plantDefinitions = [
      // 20 SOLAR PLANTS
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

      // 20 WIND FARMS
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

      // 10 BATTERY ENERGY STORAGE SYSTEMS (BESS)
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

    const seededPlants = [];

    // Seed Plants
    for (const p of plantDefinitions) {
      const pId = await ctx.db.insert("plants", {
        name: p.name,
        type: p.type,
        location: p.location,
        latitude: p.lat,
        longitude: p.lng,
        capacity: p.cap,
        status: p.health > 91 ? "online" : p.health > 87 ? "maintenance" : "offline",
        commissioningDate: new Date(Date.now() - Math.random() * 8 * 365 * 24 * 3600 * 1000).toISOString().split("T")[0],
        owner: p.owner,
        healthScore: p.health,
      });
      seededPlants.push({ id: pId, name: p.name, type: p.type, cap: p.cap, health: p.health });
    }

    // Manufacturers
    const solarMfrs = ["First Solar", "Trina Solar", "JinkoSolar", "Canadian Solar", "SMA Solar"];
    const windMfrs = ["GE Renewable Energy", "Vestas", "Siemens Gamesa", "Goldwind", "Nordex"];
    const bessMfrs = ["Tesla Energy", "Fluence", "LG Energy Solution", "Samsung SDI", "BYD"];

    const seededAssets = [];

    // Seed Assets for each plant
    for (const p of seededPlants) {
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
        const status = p.health > 90 ? "online" : Math.random() > 0.35 ? "online" : "maintenance";
        const healthScore = Math.min(100, Math.max(40, p.health - 6 + Math.random() * 12));

        const assetId = await ctx.db.insert("assets", {
          plantId: p.id,
          name: `${p.name} - ${type.charAt(0).toUpperCase() + type.slice(1)} ${i + 1}`,
          type: type as any,
          status: status as any,
          healthScore: parseFloat(healthScore.toFixed(1)),
          manufacturer: mfrs[Math.floor(Math.random() * mfrs.length)],
          serialNumber: `SN-${p.type.substring(0, 2).toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`,
          installationDate: new Date(Date.now() - Math.random() * 5 * 365 * 24 * 3600 * 1000).toISOString().split("T")[0],
          warrantyExpiry: new Date(Date.now() + Math.random() * 8 * 365 * 24 * 3600 * 1000).toISOString().split("T")[0],
        });
        seededAssets.push({ id: assetId, plantId: p.id, type, name: `${p.name} - ${type.charAt(0).toUpperCase() + type.slice(1)} ${i + 1}` });
      }
    }

    // Seed historical metrics (30 days)
    const nowMs = Date.now();
    const oneDayMs = 24 * 3600 * 1000;

    for (const p of seededPlants) {
      for (let d = 30; d >= 0; d--) {
        const timestamp = nowMs - d * oneDayMs;
        const hourScale = d === 0 ? 0.6 : 1.0;

        let baseEfficiency = p.health / 100;
        let powerOutput = 0;
        let todayProduction = 0;
        let stateOfCharge = 0;
        let stateOfHealth = p.health;
        let gridImport = 0;
        let gridExport = 0;

        if (p.type === "solar") {
          powerOutput = d === 0 ? p.cap * 0.4 : 0;
          todayProduction = p.cap * 24 * 0.22 * baseEfficiency * hourScale * (0.8 + Math.random() * 0.4);
          gridExport = powerOutput;
        } else if (p.type === "wind") {
          powerOutput = (0.2 + Math.random() * 0.6) * p.cap;
          todayProduction = p.cap * 24 * 0.38 * baseEfficiency * hourScale * (0.75 + Math.random() * 0.5);
          gridExport = powerOutput;
        } else {
          stateOfCharge = 20 + Math.floor(Math.random() * 70);
          powerOutput = (Math.random() - 0.48) * p.cap * 0.4;
          todayProduction = Math.abs(powerOutput) * 24 * hourScale * 0.82;
          if (powerOutput > 0) {
            gridExport = powerOutput;
          } else {
            gridImport = Math.abs(powerOutput);
          }
        }

        await ctx.db.insert("energyMetrics", {
          plantId: p.id,
          timestamp,
          powerOutput: parseFloat(powerOutput.toFixed(2)),
          todayProduction: parseFloat(todayProduction.toFixed(2)),
          stateOfCharge,
          stateOfHealth,
          frequency: parseFloat((59.96 + Math.random() * 0.08).toFixed(3)),
          gridImport: parseFloat(gridImport.toFixed(2)),
          gridExport: parseFloat(gridExport.toFixed(2)),
          efficiency: parseFloat((baseEfficiency * 100).toFixed(1)),
          voltage: parseFloat((345000 + (Math.random() - 0.5) * 4000).toFixed(0)),
          current: parseFloat(((Math.abs(powerOutput) * 1e6) / (345000 * Math.sqrt(3))).toFixed(1)),
        });

        // Seed Weather Matching
        let temp = p.type === "solar" ? 24 + Math.random() * 14 : 14 + Math.random() * 16;
        let windSpeed = p.type === "wind" ? 8 + Math.random() * 12 : 2 + Math.random() * 8;
        let cloudCover = p.type === "solar" ? Math.random() * 30 : Math.random() * 70;
        let irradiance = p.type === "solar" ? (cloudCover > 20 ? 400 : 800) : 0;
        let desc = p.type === "solar" ? "Sunny" : p.type === "wind" ? "Windy" : "Clear";

        await ctx.db.insert("weather", {
          plantId: p.id,
          timestamp,
          temperature: parseFloat(temp.toFixed(1)),
          humidity: Math.floor(30 + Math.random() * 50),
          windSpeed: parseFloat(windSpeed.toFixed(1)),
          cloudCover: Math.floor(cloudCover),
          irradiance,
          description: desc,
        });
      }
    }

    // Seed Alarms (approx 15 active alarms, 50 resolved alarms)
    const engineers = ["Sarah Connor", "John Doe", "Marcus Vance", "Elena Rostova", "Devon Cole"];
    const alarmTemplates = [
      { code: "INV_OVERHEAT", msg: "Inverter module 2 internal temperature exceeded critical threshold (85°C)", sev: "critical" as const },
      { code: "XFMR_OIL_TEMP", msg: "Transformer oil temperature high warning", sev: "high" as const },
      { code: "COMM_LOSS", msg: "Communication loss with string tracker controller #14", sev: "medium" as const },
      { code: "TURB_YAW_FAIL", msg: "Wind turbine yaw adjustment failure", sev: "critical" as const },
      { code: "BATT_CELL_DEV", msg: "Battery rack 4 cell voltage deviation warning", sev: "high" as const },
      { code: "MET_STN_OFFLINE", msg: "Weather station Pyranometer sensor unresponsive", sev: "low" as const },
      { code: "GRID_VOLT_WARN", msg: "Grid connection voltage fluctuation warning", sev: "medium" as const },
      { code: "THERMAL_RUNAWAY", msg: "Thermal management cooling fan malfunction in container B", sev: "critical" as const },
    ];

    // Seed Active Alarms
    const plantsWithAlarms = seededPlants.filter(p => p.health < 94);
    for (let i = 0; i < plantsWithAlarms.length; i++) {
      const p = plantsWithAlarms[i];
      const template = alarmTemplates[i % alarmTemplates.length];
      const plantAssets = seededAssets.filter(a => a.plantId === p.id);
      const asset = plantAssets[Math.floor(Math.random() * plantAssets.length)];

      await ctx.db.insert("alarms", {
        plantId: p.id,
        assetId: asset?.id,
        severity: template.sev,
        status: Math.random() > 0.5 ? "acknowledged" : "active",
        code: template.code,
        message: `${asset ? asset.type.toUpperCase() + ": " : ""}${template.msg}`,
        timestamp: nowMs - Math.random() * 48 * 3600 * 1000,
        assignedEngineer: engineers[Math.floor(Math.random() * engineers.length)],
      });

      // Also create a notification for active alarm
      await ctx.db.insert("notifications", {
        type: "alarm",
        title: `CRITICAL ALERT: ${p.name}`,
        message: template.msg,
        severity: template.sev,
        timestamp: nowMs - Math.random() * 2 * 3600 * 1000,
        read: false,
      });
    }

    // Seed Resolved Alarms
    for (let i = 0; i < 40; i++) {
      const p = seededPlants[Math.floor(Math.random() * seededPlants.length)];
      const template = alarmTemplates[Math.floor(Math.random() * alarmTemplates.length)];
      const plantAssets = seededAssets.filter(a => a.plantId === p.id);
      const asset = plantAssets[Math.floor(Math.random() * plantAssets.length)];
      const alarmTime = nowMs - (Math.random() * 30 * 24 * 3600 * 1000 + 2 * 24 * 3600 * 1000);

      await ctx.db.insert("alarms", {
        plantId: p.id,
        assetId: asset?.id,
        severity: template.sev,
        status: "resolved",
        code: template.code,
        message: `${asset ? asset.type.toUpperCase() + ": " : ""}${template.msg}`,
        timestamp: alarmTime,
        resolvedAt: alarmTime + Math.random() * 8 * 3600 * 1000,
        assignedEngineer: engineers[Math.floor(Math.random() * engineers.length)],
      });
    }

    // Seed Maintenance Tasks
    const maintenanceTasks = [
      { desc: "Biannual panel washing and tracker alignment check", type: "preventive" as const },
      { desc: "Replacement of cooling system air filters in BESS container", type: "preventive" as const },
      { desc: "Turbine gearbox bearing lubrication and vibration check", type: "preventive" as const },
      { desc: "Corrective fuse replacement in Inverter box 4", type: "corrective" as const },
      { desc: "Predictive thermal imaging inspection of substation transformer", type: "predictive" as const },
    ];

    for (let i = 0; i < 15; i++) {
      const p = seededPlants[Math.floor(Math.random() * seededPlants.length)];
      const plantAssets = seededAssets.filter(a => a.plantId === p.id);
      const asset = plantAssets[Math.floor(Math.random() * plantAssets.length)];
      const task = maintenanceTasks[i % maintenanceTasks.length];

      await ctx.db.insert("maintenance", {
        plantId: p.id,
        assetId: asset.id,
        type: task.type,
        description: task.desc,
        status: i < 5 ? "scheduled" : i < 8 ? "in_progress" : "completed",
        scheduledDate: new Date(Date.now() + (i < 8 ? (Math.random() * 5 * 24 * 3600 * 1000) : -(Math.random() * 15 * 24 * 3600 * 1000))).toISOString().split("T")[0],
        completedDate: i >= 8 ? new Date(Date.now() - (Math.random() * 10 * 24 * 3600 * 1000)).toISOString().split("T")[0] : undefined,
        engineer: engineers[Math.floor(Math.random() * engineers.length)],
      });
    }

    // Seed Audit Logs
    const auditActions = [
      { act: "SIMULATOR_TICK", det: "Live operational telemetry values updated via scheduler loop." },
      { act: "ALARM_ACKNOWLEDGE", det: "Alarm COMM_LOSS acknowledged by user." },
      { act: "REPORT_EXPORT", det: "Monthly generation report exported for Mojave Solar One." },
      { act: "MAINTENANCE_SCHEDULE", det: "Preventive gearbox inspection scheduled for Wind Turbine 3." },
      { act: "PLANT_PARAM_UPDATE", det: "Max generation threshold modified on Hornsdale Storage North." },
    ];

    for (let i = 0; i < 25; i++) {
      const p = seededPlants[Math.floor(Math.random() * seededPlants.length)];
      const action = auditActions[i % auditActions.length];

      await ctx.db.insert("auditLogs", {
        plantId: Math.random() > 0.2 ? p.id : undefined,
        action: action.act,
        details: action.det,
        timestamp: nowMs - Math.random() * 15 * 24 * 3600 * 1000,
        operator: engineers[Math.floor(Math.random() * engineers.length)],
      });
    }

    // Seed Technicians
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

    const seededTechs = [];
    for (const t of techDefs) {
      const techId = await ctx.db.insert("technicians", t);
      seededTechs.push({ id: techId, name: t.name });
    }

    // Seed Inspection Templates
    const templates = [
      {
        name: "Solar PV Maintenance Checklist",
        type: "solar" as const,
        checklistItems: [
          "Inspect tracker mechanical gear wear & lubrication",
          "Test string electrical VOC and ISC ratios",
          "Perform module infrared thermal imaging hot-spot scan",
          "Check inverter cooling fans & ventilation filter blocks",
          "Measure transformer oil level & containment sealant integrity",
        ],
      },
      {
        name: "Wind Turbine Safety Checklist",
        type: "wind" as const,
        checklistItems: [
          "Check main gearbox oil pressure & inspect magnetic plugs",
          "Inspect pitch hydraulic fluid pressure and line sealants",
          "Perform ultrasonic scan of blades for micro-cracks",
          "Lubricate yaw drive gear ring and verify teeth alignments",
          "Verify structural tower bolt tension loads",
        ],
      },
      {
        name: "BESS Safety & Balance Checklist",
        type: "bess" as const,
        checklistItems: [
          "Inspect battery container HVAC fans & safety exhaust linkages",
          "Verify cell voltage active balancing coefficients",
          "Scan lithium module terminal contacts for thermal stress",
          "Test active fire suppression links & dry chemical reserves",
          "Verify power conversion system grid phase lock loops",
        ],
      },
    ];

    const seededTemplates = [];
    for (const temp of templates) {
      const tId = await ctx.db.insert("inspectionTemplates", temp);
      seededTemplates.push({ id: tId, name: temp.name, type: temp.type, items: temp.checklistItems });
    }

    // Seed Inspections
    for (let i = 0; i < 30; i++) {
      const p = seededPlants[i % seededPlants.length];
      const pAssets = seededAssets.filter(a => a.plantId === p.id);
      const asset = pAssets[i % pAssets.length] || seededAssets[0];
      const template = seededTemplates.find(t => t.type === p.type) || seededTemplates[0];
      const isPast = i >= 8;

      const checklistAnswers = template.items.map((item, idx) => ({
        item,
        checked: isPast ? (idx === 3 && p.health < 92 ? false : true) : false,
        notes: isPast && idx === 3 && p.health < 92 ? "Slight thermal leakage detected." : undefined,
      }));

      await ctx.db.insert("inspections", {
        plantId: p.id,
        assetId: asset.id,
        templateId: template.id,
        inspector: seededTechs[i % seededTechs.length].name,
        checklist: checklistAnswers,
        status: isPast ? "completed" : i % 2 === 0 ? "pending" : "in_progress",
        scheduledDate: new Date(Date.now() + (isPast ? -i * oneDayMs : i * oneDayMs)).toISOString().split("T")[0],
        completedDate: isPast ? new Date(Date.now() - i * oneDayMs).toISOString().split("T")[0] : undefined,
        findings: isPast ? (p.health < 92 ? "Thermal compound showing dry leakage on modular connector." : "All systems nominal.") : undefined,
        recommendations: isPast && p.health < 92 ? "Recommend dispatching corrective work order." : undefined,
        signature: isPast ? `<svg width="100" height="40" viewBox="0 0 100 40" xmlns="http://www.w3.org/2000/svg"><path d="M 10 20 Q 30 ${5 + Math.random()*25} 50 20 T 90 20" fill="none" stroke="#10b981" stroke-width="2"/></svg>` : undefined,
      });
    }

    // Seed Work Orders
    const sparePartsList = [
      { name: "300A Substation Inverter Fuse", code: "INV-FUSE-300", cost: 120 },
      { name: "Cooling Fan Air Filter Panel", code: "BESS-FLTR-88", cost: 45 },
      { name: "Substation Sub-transformer Seal Ring", code: "XFMR-SEAL-01", cost: 85 },
      { name: "Wind Yaw Pinion Drive Bearing", code: "TURB-BRNG-99", cost: 450 },
      { name: "BESS HVAC Exchanger Pump Motor", code: "BESS-MOTR-45", cost: 350 },
    ];

    const woTitles = [
      { title: "Corrective fuse module swap out", desc: "Alarm active for phase current imbalance. Swap out deteriorated fuses." },
      { title: "HVAC containment pump servicing", desc: "Cooling fan drawing high currents. Lubricate pump bearings." },
      { title: "substation transformer seal leak repair", desc: "Refit transformer sub-seal ring and inspect oil tanks." },
      { title: "Wind Yaw Ring Gear Lubrication", desc: "Yaw drive motor binding warning. Lubricate bearings." },
      { title: "BESS Container thermal balancer reset", desc: "Reset balancer controls and measure cell terminals." },
    ];

    for (let i = 0; i < 45; i++) {
      const p = seededPlants[i % seededPlants.length];
      const pAssets = seededAssets.filter(a => a.plantId === p.id);
      const asset = pAssets[i % pAssets.length] || seededAssets[0];

      const statuses = ["draft", "open", "assigned", "in_progress", "waiting_parts", "under_review", "completed", "closed"] as const;
      const priorities = ["critical", "high", "medium", "low"] as const;

      const status = statuses[i % statuses.length];
      const priority = priorities[i % priorities.length];
      const templateWO = woTitles[i % woTitles.length];

      const isDone = status === "completed" || status === "closed";
      const partsUsed = isDone ? [
        {
          name: sparePartsList[i % sparePartsList.length].name,
          partCode: sparePartsList[i % sparePartsList.length].code,
          quantity: 1,
          cost: sparePartsList[i % sparePartsList.length].cost,
        }
      ] : undefined;

      const laborCost = isDone ? 120 + Math.random() * 400 : 0;
      const materialsCost = partsUsed ? partsUsed.reduce((sum, p) => sum + p.cost * p.quantity, 0) : 0;
      const actualHours = isDone ? 1.5 + Math.random() * 6 : undefined;
      const downtimeHours = isDone && priority === "critical" ? 1.2 + Math.random() * 4 : 0;

      await ctx.db.insert("workOrders", {
        plantId: p.id,
        assetId: asset.id,
        type: i % 4 === 0 ? "preventive" : i % 4 === 1 ? "corrective" : i % 4 === 2 ? "predictive" : "emergency",
        title: templateWO.title,
        description: templateWO.desc,
        priority,
        status,
        assignedTechnician: status !== "draft" && status !== "open" ? seededTechs[i % seededTechs.length].name : undefined,
        scheduledDate: new Date(Date.now() + (isDone ? -i * oneDayMs : i * 2 * oneDayMs)).toISOString().split("T")[0],
        completedDate: isDone ? new Date(Date.now() - i * oneDayMs).toISOString().split("T")[0] : undefined,
        estimatedHours: 2 + Math.floor(Math.random() * 8),
        actualHours,
        laborCost,
        materialsCost,
        downtimeHours,
        spareParts: partsUsed,
      });
    }

    // Seed AI Insights
    const aiInsightTemplates = [
      {
        type: "anomaly" as const,
        title: "Inverter thermal gradient anomaly detected",
        desc: "Core IGBT junction temperature has drifted 6.4°C higher than surrounding units. Paste degradation predicted.",
        conf: 94,
        failProb: 82,
        rul: 11,
        risk: 75,
        rca: "Degraded thermal pad cohesion leading to junction heat retention.",
      },
      {
        type: "prediction" as const,
        title: "Substation oil tank pressure trend alert",
        desc: "Insulation paper degradation. Failure predicted within 40 days under peak load.",
        conf: 87,
        failProb: 44,
        rul: 38,
        risk: 55,
        rca: "Winding insulation deterioration sparking micro-arcing gas release.",
      },
      {
        type: "recommendation" as const,
        title: "Wind yaw assembly vibration compensation",
        desc: "Yaw gearbox drive gear showing friction signatures. Lubricate yaw bearing ring immediately.",
        conf: 91,
        failProb: 65,
        rul: 18,
        risk: 68,
        rca: "Particulate buildup in tooth bearings creating micro-friction loads.",
      },
      {
        type: "risk" as const,
        title: "BESS Rack cell balancing failure probability",
        desc: "Active balancer efficiency dropped. Risk of cell overcharge or premature string cutout.",
        conf: 88,
        failProb: 75,
        rul: 9,
        risk: 84,
        rca: "Cell voltage disparity exceeding active balance current limits.",
      },
    ];

    for (let i = 0; i < 30; i++) {
      const p = seededPlants[i % seededPlants.length];
      const pAssets = seededAssets.filter(a => a.plantId === p.id);
      const asset = pAssets[i % pAssets.length] || seededAssets[0];
      const template = aiInsightTemplates[i % aiInsightTemplates.length];

      await ctx.db.insert("aiInsights", {
        plantId: p.id,
        assetId: asset.id,
        type: template.type,
        title: `${asset.name} - ${template.title}`,
        description: template.desc,
        confidence: template.conf,
        failureProbability: template.failProb,
        remainingUsefulLife: template.rul,
        riskScore: template.risk,
        rootCauseAnalysis: template.rca,
        timestamp: nowMs - i * 1.5 * oneDayMs,
      });
    }

    /* =========================================================================
       PHASE 3 SEEDING MODULES
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

    const seededVendors = [];
    for (const v of vendorDefs) {
      const vId = await ctx.db.insert("vendors", v);
      seededVendors.push({ id: vId, name: v.name, category: v.category });
    }

    // 2. Seed Warehouses
    const warehouseDefs = [
      { name: "West Coast Logistics", location: "Oakland, CA", capacity: 45000, utilization: 62 },
      { name: "Mid-West Distribution Hub", location: "Chicago, IL", capacity: 60000, utilization: 48 },
      { name: "Texas Warehouse Terminal", location: "Houston, TX", capacity: 50000, utilization: 74 },
    ];

    const seededWarehouses = [];
    for (const w of warehouseDefs) {
      const wId = await ctx.db.insert("warehouses", w);
      seededWarehouses.push({ id: wId, name: w.name });
    }

    // 3. Seed Inventory Spare Parts
    const partsDefs = [
      { name: "300A Substation Inverter Fuse", code: "INV-FUSE-300", cat: "electrical" as const, qty: 15, res: 0, min: 5, max: 30, cost: 120, bin: "A-12" },
      { name: "Cooling Fan Air Filter Panel", code: "BESS-FLTR-88", cat: "electrical" as const, qty: 3, res: 2, min: 10, max: 50, cost: 45, bin: "B-04" },
      { name: "Substation Sub-transformer Seal Ring", code: "XFMR-SEAL-01", cat: "mechanical" as const, qty: 8, res: 0, min: 2, max: 10, cost: 85, bin: "C-08" },
      { name: "Wind Yaw Pinion Drive Bearing", code: "TURB-BRNG-99", cat: "mechanical" as const, qty: 1, res: 0, min: 2, max: 6, cost: 450, bin: "D-15" },
      { name: "BESS HVAC Exchanger Pump Motor", code: "BESS-MOTR-45", cat: "mechanical" as const, qty: 4, res: 1, min: 2, max: 8, cost: 350, bin: "E-01" },
    ];

    for (const wh of seededWarehouses) {
      for (const p of partsDefs) {
        await ctx.db.insert("inventoryItems", {
          warehouseId: wh.id,
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
      }
    }

    // 4. Seed Purchase Requisitions
    for (let i = 0; i < 15; i++) {
      const p = seededPlants[i % seededPlants.length];
      const statuses = ["draft", "pending_approval", "approved", "ordered", "rejected"] as const;

      await ctx.db.insert("purchaseRequisitions", {
        plantId: p.id,
        title: `Restock Inverter components - batch ${i + 1}`,
        requestedBy: "Operations Warehouse Supervisor",
        status: statuses[i % statuses.length],
        requiredDate: new Date(Date.now() + i * oneDayMs).toISOString().split("T")[0],
        estimatedCost: 1200,
        items: [
          { partName: "300A Substation Inverter Fuse", partCode: "INV-FUSE-300", quantity: 10, cost: 120 }
        ],
      });
    }

    // 5. Seed Purchase Orders
    for (let i = 0; i < 20; i++) {
      const v = seededVendors[i % seededVendors.length];
      const statuses = ["draft", "sent", "delivered", "invoiced", "closed"] as const;
      const poNum = `PO-2026-${1000 + i}`;

      await ctx.db.insert("purchaseOrders", {
        vendorId: v.id,
        poNumber: poNum,
        status: statuses[i % statuses.length],
        totalCost: 1400,
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

    for (const cc of cCenters) {
      await ctx.db.insert("costCenters", {
        code: cc.code,
        name: cc.name,
        allocatedBudget: cc.allocated,
        spentBudget: cc.spent,
        category: cc.cat,
      });
    }

    // 7. Seed Integration Sync Jobs
    const erpSystems = ["sap", "oracle", "dynamics", "odoo"] as const;
    const syncTypes = ["sync_inventory", "sync_invoices", "sync_pos"] as const;

    for (const sys of erpSystems) {
      for (const type of syncTypes) {
        const jobId = await ctx.db.insert("integrationJobs", {
          system: sys,
          jobType: type,
          status: "success",
          lastRun: nowMs - Math.random() * 4 * 3600 * 1000,
          recordsSynced: Math.floor(10 + Math.random() * 45),
        });

        await ctx.db.insert("integrationLogs", {
          jobId,
          timestamp: nowMs - Math.random() * 2 * 3600 * 1000,
          level: "info",
          message: `Synchronized ledger objects with external instance of ${sys.toUpperCase()}`,
        });
      }
    }

    console.log("Database seeded successfully with Phase 3 collections!");
    return "Seeding successful: 50 plants, 300+ assets, weather, alarms, dispatches, work orders, inspections, cost centers, warehouses, and ERP connectors seeded.";
  },
});
