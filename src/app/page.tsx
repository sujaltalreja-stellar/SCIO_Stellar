"use client";

import React, { useState, useEffect } from "react";
import {
  Building2, Ship, Zap, Truck, Shield, AlertTriangle, Plus,
  X, User, MessageSquare, Anchor, ClipboardList, Activity, Navigation, ShoppingCart, UserCheck, Terminal, Download, FileText, Gauge,
  Search, Filter, CheckCircle2, Clock, ArrowRight, ArrowLeft, ChevronDown, Check, Sparkles, Package, DollarSign, Calendar, Cpu, Boxes, ThermometerSnowflake, Globe
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

import dynamic from "next/dynamic";

const GISMapView = dynamic(() => import("../components/energy/map/GISMapView"), { ssr: false });

import DashboardOverview from "../components/energy/dashboard/DashboardOverview";
import PlantDirectory from "../components/energy/plants/PlantDirectory";
import PlantDetailsView from "../components/energy/plants/PlantDetailsView";
import AssetRegistry from "../components/energy/assets/AssetRegistry";
import AlarmConsole from "../components/energy/alarms/AlarmConsole";
import WeatherMonitor from "../components/energy/weather/WeatherMonitor";
import ReportingModule from "../components/energy/reports/ReportingModule";
import AuditTrail from "../components/energy/audit/AuditTrail";
import AIOpsControl from "../components/energy/ai/AIOpsControl";
import FieldOpsControl from "../components/energy/field/FieldOpsControl";
import InspectionsHub from "../components/energy/field/InspectionsHub";
import ProcurementModule from "../components/energy/procurement/ProcurementModule";
import InventoryModule from "../components/energy/inventory/InventoryModule";
import FinanceModule from "../components/energy/finance/FinanceModule";
import ERPSyncHub from "../components/energy/erp/ERPSyncHub";
import MaritimeControlCenter from "../components/maritime/MaritimeControlCenter";
import ManufacturingControlCenter from "../components/manufacturing/ManufacturingControlCenter";
import { ProductionPlanningModule } from "../components/manufacturing/ProductionPlanningModule";
import { QualityTraceabilityModule } from "../components/manufacturing/QualityTraceabilityModule";
import { AssetMaintenanceModule } from "../components/manufacturing/AssetMaintenanceModule";
import { MaterialsSupplyChainModule } from "../components/manufacturing/MaterialsSupplyChainModule";
import { AIManufacturingIntelligence } from "../components/manufacturing/AIManufacturingIntelligence";
import LogisticsControlCenter from "../components/logistics/LogisticsControlCenter";
import IndustrialCockpitHUD from "../components/visuals/IndustrialCockpitHUD";

import {
  INDUSTRY_SEEDS, SUPPLIERS, MARITIME_FLEET, MARITIME_DEFICIENCIES, MARITIME_SUPPLY_ORDERS, MARITIME_CREW,
  MARITIME_CLEARANCES, MARITIME_BUNKER_LOGS, MARITIME_SAFETY_INSPECTIONS,
  WorkOrderSeed, MarineSafetyDeficiency, SafetyEquipmentInspection
} from "../config/industries";
import StellarHomePage from "../components/landing/StellarHomePage";
import ResourcesHub from "../components/resources/ResourcesHub";
import GenerativeVisualCopilot from "../components/ai/GenerativeVisualCopilot";
import ScioSentinelOrb from "../components/ai/ScioSentinelOrb";
import ContactHub from "../components/contact/ContactHub";
import { mockDb } from "../config/energyMockDb";

export default function App() {
  const [viewMode, setViewMode] = useState<"landing" | "platform" | "resources" | "contact">("landing");
  const [currentIndustry, setCurrentIndustry] = useState<string>("energy");
  const [activeTab, setActiveTab] = useState<string>("energy-dashboard");
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [industryDropdownOpen, setIndustryDropdownOpen] = useState<boolean>(false);
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);
  const [showCockpitHUD, setShowCockpitHUD] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);
  const [isDark, setIsDark] = useState<boolean>(true);

  const handleLaunchPlatform = (industry?: string, tab?: string) => {
    if (industry) setCurrentIndustry(industry);
    if (tab) {
      setActiveTab(tab);
    } else {
      setActiveTab(industry === "energy" ? "energy-dashboard" : "dashboard");
    }
    setViewMode("platform");
  };

  useEffect(() => {
    setMounted(true);
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("launch") === "1") {
      const industry = urlParams.get("industry");
      const tab = urlParams.get("tab");
      handleLaunchPlatform(industry || undefined, tab || undefined);
      window.history.replaceState(null, "", window.location.pathname);
    } else if (urlParams.get("view") === "resources" || urlParams.get("tab") === "resources") {
      setViewMode("resources");
    } else if (urlParams.get("view") === "contact" || urlParams.get("tab") === "contact") {
      setViewMode("contact");
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Modals and dynamic form states
  const [createWoModalOpen, setCreateWoModalOpen] = useState<boolean>(false);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrderSeed | null>(null);

  // Work Order Form State
  const [newWoTitle, setNewWoTitle] = useState("");
  const [newWoAssetId, setNewWoAssetId] = useState("");
  const [newWoPriority, setNewWoPriority] = useState("High");
  const [newWoNotes, setNewWoNotes] = useState("");

  // Deficiency Reporter Form States (Maritime)
  const [deficiencyModalOpen, setDeficiencyModalOpen] = useState<boolean>(false);
  const [newDefTitle, setNewDefTitle] = useState("");
  const [newDefVesselId, setNewDefVesselId] = useState("vess-01");
  const [newDefCategory, setNewDefCategory] = useState("Machinery");
  const [newDefSeverity, setNewDefSeverity] = useState("High");

  // Safety Equipment Certificate View State
  const [selectedCertEquipment, setSelectedCertEquipment] = useState<SafetyEquipmentInspection | null>(null);

  // AI Copilot States
  const [copilotOpen, setCopilotOpen] = useState<boolean>(false);
  const [copilotQuery, setCopilotQuery] = useState<string>("");
  const [copilotResponse, setCopilotResponse] = useState<string>("");

  // Command Palette States
  const [commandPaletteOpen, setCommandPaletteOpen] = useState<boolean>(false);

  // Loaded reactive client state
  const [seeds, setSeeds] = useState(INDUSTRY_SEEDS);

  // Port Clearance, Bunker and Safety Inspection Interactive States
  const [clearances, setClearances] = useState(MARITIME_CLEARANCES);
  const [bunkerLogs, setBunkerLogs] = useState(MARITIME_BUNKER_LOGS);
  const [safetyInspections, setSafetyInspections] = useState(MARITIME_SAFETY_INSPECTIONS);
  const [deficiencies, setDeficiencies] = useState<MarineSafetyDeficiency[]>(MARITIME_DEFICIENCIES);
  const [crew] = useState(MARITIME_CREW);
  const [supplyOrders, setSupplyOrders] = useState(MARITIME_SUPPLY_ORDERS);
  const [supplySearch, setSupplySearch] = useState("");
  const [supplyStatusFilter, setSupplyStatusFilter] = useState("all");
  const [selectedTrackPo, setSelectedTrackPo] = useState<any>(null);

  // Energy Operations Specialized State
  const [activeEnergyNode, setActiveEnergyNode] = useState<string>("Infrastructure");
  const [selectedEnergyInfraNode, setSelectedEnergyInfraNode] = useState<string>("site-austin");
  const [plantSearch, setPlantSearch] = useState("");
  const [plantTypeFilter, setPlantTypeFilter] = useState("all");
  const [plantStatusFilter, setPlantStatusFilter] = useState("all");
  const [energyFieldJobs, setEnergyFieldJobs] = useState([
    { id: "job-101", title: "Main Transformer Oil Top-Up & Filter", site: "Substation B - Austin", technician: "Nikola Tesla", status: "Pending Evidence", priority: "Critical", gps: "30.2672° N, 97.7431° W", code: "TX-OIL", assignedTeam: "Austin Transmission Team Alpha", lastVisit: "2026-08-22", evidence: "", notes: "Dissolved Gas Analysis (DGA) shows thermal faults. Top up with TX-OIL immediately." },
    { id: "job-102", title: "Solar Inverter Calibration & Air-Duct Clear", site: "Solar Array Farm - El Paso", technician: "Albert Einstein", status: "In Progress", priority: "Medium", gps: "31.7619° N, 106.4850° W", code: "CRIT-INVERTER-BOARD", assignedTeam: "El Paso Solar Team Beta", lastVisit: "2026-08-20", evidence: "", notes: "Clean vents and replace PCB board if efficiency drops below 92%." },
    { id: "job-103", title: "Wind Turbine Yaw Sensor Realignment", site: "Energy Wind Hub C - Abilene", technician: "Marie Curie", status: "Completed", priority: "High", gps: "32.4487° N, 99.7331° W", code: "WT-RELAY", assignedTeam: "Abilene Wind Team Delta", lastVisit: "2026-08-23", evidence: "sensor_aligned_ok.png", notes: "Calibrated optical encoders. Yaw discrepancy reduced to 0.1°." }
  ]);
  const [selectedFieldJobId, setSelectedFieldJobId] = useState<string>("job-101");
  const [windTurbineConfig, setWindTurbineConfig] = useState({ speed: 14.2, pitch: 12.4, status: "Optimal" });
  const [transformerConfig, setTransformerConfig] = useState({ oilTemp: 85, load: 94, sf6: 5.8 });
  const [solarConfig, setSolarConfig] = useState({ panelTemp: 44, efficiency: 98.8, tilt: 32 });
  const [gridLoadMW, setGridLoadMW] = useState<number>(2850);
  const [complianceChecklist, setComplianceChecklist] = useState({
    nercAudited: true,
    safetyCertificatesSigned: false,
    epaPermitsValidated: true,
    oshaHighVoltageSignoff: false
  });
  const [outages, setOutages] = useState([
    { id: "out-01", site: "Hydro Facility Alpha", component: "Turbine Feed Valve", type: "Forced Outage", duration: "4.5 Hours", date: "2026-08-21", severity: "Critical" },
    { id: "out-02", site: "Grid Substation B", component: "Switchgear Feeder 4", type: "Planned Outage", duration: "1.2 Hours", date: "2026-08-22", severity: "Medium" }
  ]);

  const [dbTick, setDbTick] = useState<number>(0);
  useEffect(() => {
    const unsub = mockDb.subscribe(() => {
      setDbTick(prev => prev + 1);
    });
    return () => {
      unsub();
    };
  }, []);

  const activeSeeds = seeds[currentIndustry as keyof typeof INDUSTRY_SEEDS] || seeds.energy;

  // Keyboard event listener for command palette trigger
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const triggerEnergySimulation = () => {
    const nowMs = Date.now();
    const currentHour = new Date(nowMs).getHours();

    mockDb.plants.forEach((p) => {
      if (p.status === "offline") return;

      const pMetrics = mockDb.energyMetrics
        .filter((m) => m.plantId === p._id)
        .sort((a, b) => b.timestamp - a.timestamp);
      const latestMetric = pMetrics[0];

      const pWeather = mockDb.weather
        .filter((w) => w.plantId === p._id)
        .sort((a, b) => b.timestamp - a.timestamp);
      const latestWeather = pWeather[0];

      let powerOutput = latestMetric?.powerOutput ?? 0;
      let todayProduction = latestMetric?.todayProduction ?? 0;
      let stateOfCharge = latestMetric?.stateOfCharge ?? 0;
      let stateOfHealth = latestMetric?.stateOfHealth ?? p.healthScore;
      let gridImport = 0;
      let gridExport = 0;

      let temp = latestWeather?.temperature ?? 22;
      let windSpeed = latestWeather?.windSpeed ?? 6;
      let cloudCover = latestWeather?.cloudCover ?? 30;
      let irradiance = latestWeather?.irradiance ?? 0;

      temp += (Math.random() - 0.5) * 0.5;
      windSpeed = Math.max(0.2, windSpeed + (Math.random() - 0.5) * 1.5);
      cloudCover = Math.max(0, Math.min(100, cloudCover + (Math.random() - 0.5) * 6));

      if (p.type === "solar") {
        if (currentHour >= 6 && currentHour <= 18) {
          const sinScale = Math.sin(Math.PI * ((currentHour - 6) / 12));
          irradiance = sinScale * 950 * (1 - cloudCover / 160) + Math.random() * 30;
          powerOutput = (irradiance / 1000) * p.capacity * 0.96 * (p.healthScore / 100);
        } else {
          irradiance = 0;
          powerOutput = 0;
        }
        todayProduction += powerOutput * (15 / 3600);
        gridExport = powerOutput;
      } else if (p.type === "wind") {
        irradiance = 0;
        if (windSpeed < 3.0 || windSpeed > 25.0) {
          powerOutput = 0;
        } else {
          powerOutput = ((windSpeed - 3) / 22) * p.capacity * 0.95 * (p.healthScore / 100);
        }
        todayProduction += powerOutput * (15 / 3600);
        gridExport = powerOutput;
      } else {
        let mode = "idle";
        if (currentHour >= 9 && currentHour <= 15) mode = "charge";
        else if (currentHour >= 16 && currentHour <= 21) mode = "discharge";
        else mode = Math.random() > 0.5 ? "charge" : "discharge";

        if (mode === "charge") {
          powerOutput = -p.capacity * 0.45 * (Math.random() * 0.4 + 0.6);
          stateOfCharge = Math.min(100, stateOfCharge + Math.abs(powerOutput) * (15 / 3600) * 0.92);
          gridImport = Math.abs(powerOutput);
        } else if (mode === "discharge") {
          powerOutput = p.capacity * 0.4 * (Math.random() * 0.4 + 0.6);
          stateOfCharge = Math.max(0, stateOfCharge - powerOutput * (15 / 3600) * (1 / 0.88));
          gridExport = powerOutput;
        }
      }

      mockDb.energyMetrics.push({
        _id: `metric_${Date.now()}_${Math.random()}`,
        plantId: p._id,
        timestamp: nowMs,
        powerOutput: parseFloat(powerOutput.toFixed(2)),
        todayProduction: parseFloat(todayProduction.toFixed(2)),
        stateOfCharge: Math.round(stateOfCharge),
        stateOfHealth: Math.round(stateOfHealth),
        frequency: parseFloat((59.96 + Math.random() * 0.08).toFixed(3)),
        gridImport: parseFloat(gridImport.toFixed(2)),
        gridExport: parseFloat(gridExport.toFixed(2)),
        efficiency: parseFloat((p.healthScore * 0.98).toFixed(1)),
        voltage: parseFloat((345000 + (Math.random() - 0.5) * 4000).toFixed(0)),
        current: parseFloat(((Math.abs(powerOutput) * 1e6) / (345000 * Math.sqrt(3))).toFixed(1)),
      });

      mockDb.weather.push({
        _id: `weather_${Date.now()}_${Math.random()}`,
        plantId: p._id,
        timestamp: nowMs,
        temperature: parseFloat(temp.toFixed(1)),
        humidity: Math.floor(25 + Math.random() * 55),
        windSpeed: parseFloat(windSpeed.toFixed(1)),
        cloudCover: Math.floor(cloudCover),
        irradiance: Math.round(irradiance),
        description: p.type === "solar" ? (cloudCover > 50 ? "Mostly Cloudy" : "Sunny") : "Normal",
      });
    });

    mockDb.notify();
  };

  // Real-time background telemetry update loop
  useEffect(() => {
    const interval = setInterval(() => {
      triggerEnergySimulation();
      setSeeds(prev => {
        const nextSeeds = { ...prev };
        for (const indKey of Object.keys(nextSeeds)) {
          const industryData = nextSeeds[indKey];
          industryData.assets = industryData.assets.map(asset => {
            const updatedDetails = { ...asset.details };

            if (updatedDetails.Temperature) {
              const tempNum = parseFloat(updatedDetails.Temperature);
              if (!isNaN(tempNum)) {
                updatedDetails.Temperature = `${(tempNum + (Math.random() - 0.5) * 2).toFixed(1)}°C`;
              }
            }
            if (updatedDetails.PressurePsi) {
              const pressNum = parseFloat(updatedDetails.PressurePsi);
              if (!isNaN(pressNum)) {
                updatedDetails.PressurePsi = Math.round(pressNum + (Math.random() - 0.5) * 4);
              }
            }
            if (updatedDetails.Efficiency) {
              const effNum = parseFloat(updatedDetails.Efficiency);
              if (!isNaN(effNum)) {
                updatedDetails.Efficiency = `${Math.min(100, Math.max(90, effNum + (Math.random() - 0.5) * 0.4)).toFixed(1)}%`;
              }
            }

            const riskDelta = Math.round((Math.random() - 0.5) * 2);
            const nextRisk = Math.min(100, Math.max(0, asset.failureRisk + riskDelta));
            const nextHealth = Math.min(100, Math.max(0, asset.healthScore - riskDelta));

            return {
              ...asset,
              failureRisk: nextRisk,
              healthScore: nextHealth,
              details: updatedDetails
            };
          });
        }
        return nextSeeds;
      });

      setBunkerLogs(prev => prev.map(log => ({
        ...log,
        mgoROBMetricTons: Math.max(5, +(log.mgoROBMetricTons - Math.random() * 0.2).toFixed(1)),
        hfoROBMetricTons: Math.max(20, +(log.hfoROBMetricTons - Math.random() * 0.8).toFixed(1))
      })));

      setWindTurbineConfig(prev => ({
        ...prev,
        speed: Math.max(1, +(prev.speed + (Math.random() - 0.5) * 0.8).toFixed(1))
      }));
      setTransformerConfig(prev => ({
        ...prev,
        oilTemp: Math.min(110, Math.max(40, Math.round(prev.oilTemp + (Math.random() - 0.5) * 2))),
        load: Math.min(100, Math.max(10, Math.round(prev.load + (Math.random() - 0.5) * 3)))
      }));
      setSolarConfig(prev => ({
        ...prev,
        panelTemp: +(prev.panelTemp + (Math.random() - 0.5) * 0.8).toFixed(1),
        efficiency: +(Math.min(100, Math.max(80, prev.efficiency + (Math.random() - 0.5) * 0.1))).toFixed(2)
      }));
      setGridLoadMW(prev => Math.round(prev + (Math.random() - 0.5) * 40));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleCreateWorkOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWoTitle || !newWoAssetId) return;

    const newWo: WorkOrderSeed = {
      id: `${currentIndustry}-wo-${Date.now()}`,
      assetId: newWoAssetId,
      title: newWoTitle,
      priority: newWoPriority as any,
      status: "New",
      assignedTeam: "Onsite Technical Crew",
      assignedPerson: "AI Dispatcher",
      createdDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      estimatedDuration: "2 Hours",
      requiredParts: [],
      notes: newWoNotes
    };

    setSeeds(prev => ({
      ...prev,
      [currentIndustry]: {
        ...prev[currentIndustry as keyof typeof INDUSTRY_SEEDS],
        workOrders: [newWo, ...prev[currentIndustry as keyof typeof INDUSTRY_SEEDS].workOrders]
      }
    }));

    setNewWoTitle("");
    setNewWoAssetId("");
    setNewWoNotes("");
    setCreateWoModalOpen(false);
  };

  const handleCreateDeficiency = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDefTitle) return;

    const newDef: MarineSafetyDeficiency = {
      id: `def-${Date.now().toString().slice(-4)}`,
      vesselId: newDefVesselId,
      title: newDefTitle,
      category: newDefCategory,
      severity: newDefSeverity as any,
      status: "Open",
      findingDate: new Date().toISOString().split('T')[0],
      targetResolutionDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };

    setDeficiencies(prev => [newDef, ...prev]);
    setNewDefTitle("");
    setDeficiencyModalOpen(false);
  };

  const handleDownloadSafetyReport = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      industry: currentIndustry,
      safetyInspections,
      deficiencies
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `scio-safety-audit-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getPortfolioStats = () => {
    const plants = mockDb.plants;
    let totalCapacity = 0;
    let onlineCount = 0;
    let offlineCount = 0;
    let maintenanceCount = 0;
    let sumHealth = 0;

    for (const p of plants) {
      totalCapacity += p.capacity;
      sumHealth += p.healthScore;
      if (p.status === "online") onlineCount++;
      else if (p.status === "offline") offlineCount++;
      else if (p.status === "maintenance") maintenanceCount++;
    }

    const averageHealth = plants.length > 0 ? sumHealth / plants.length : 100;

    let totalLivePower = 0;
    let totalTodayProduction = 0;

    for (const p of plants) {
      const pMetrics = mockDb.energyMetrics
        .filter((m) => m.plantId === p._id)
        .sort((a, b) => b.timestamp - a.timestamp);
      const latestMetric = pMetrics[0];

      if (latestMetric) {
        totalLivePower += latestMetric.powerOutput;
        totalTodayProduction += latestMetric.todayProduction;
      }
    }

    const activeAlarms = mockDb.alarms.filter((a) => a.status === "active");
    const criticalAlarmsCount = activeAlarms.filter((a) => a.severity === "critical").length;
    const highAlarmsCount = activeAlarms.filter((a) => a.severity === "high").length;
    const upcomingMaintenance = mockDb.workOrders.filter((t) => t.status === "assigned" || t.status === "in_progress");

    return {
      totalCapacity,
      totalPlants: plants.length,
      onlineCount,
      offlineCount,
      maintenanceCount,
      averageHealth,
      totalLivePower,
      totalTodayProduction,
      carbonOffsetTonnes: totalTodayProduction * 0.7,
      activeAlarmsCount: activeAlarms.length,
      criticalAlarmsCount,
      highAlarmsCount,
      upcomingMaintenanceCount: upcomingMaintenance.length,
    };
  };

  const stats = currentIndustry === "energy" ? getPortfolioStats() : null;

  const handleUpdateWoStatus = (woId: string, newStatus: string) => {
    setSeeds(prev => {
      const currentList = prev[currentIndustry as keyof typeof INDUSTRY_SEEDS].workOrders;
      const updatedList = currentList.map(wo => {
        if (wo.id === woId) {
          return { ...wo, status: newStatus as any };
        }
        return wo;
      });
      return {
        ...prev,
        [currentIndustry]: {
          ...prev[currentIndustry as keyof typeof INDUSTRY_SEEDS],
          workOrders: updatedList
        }
      };
    });
  };

  const getPriorityColor = (prio: string) => {
    switch (prio) {
      case "Critical": return "text-critical border-critical/30 bg-critical/10";
      case "High": return "text-high border-high/30 bg-high/10";
      case "Medium": return "text-medium border-medium/30 bg-medium/10";
      default: return "text-low border-low/30 bg-low/10";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
      case "Valid":
      case "Completed":
      case "Verified":
      case "At Sea":
      case "Resolved":
      case "Delivered":
      case "Passed":
        return "text-healthy border-healthy/30 bg-healthy/10";
      case "warning":
      case "Expiring":
      case "In Progress":
      case "Assigned":
      case "Planned":
      case "In Port":
      case "Anchored":
      case "CAPA Pending":
      case "PO Sent":
      case "Port Delivery Pending":
      case "PR Approved":
      case "Due":
        return "text-medium border-medium/30 bg-medium/10";
      case "offline":
      case "Expired":
      case "Blocked":
      case "Maintenance":
      case "Open":
      case "Draft":
      case "Failed":
        return "text-critical border-critical/30 bg-critical/10";
      default:
        return "text-textMuted border-borderMuted bg-panel";
    }
  };

  const totalAssets = activeSeeds.assets.length;
  const criticalAssets = activeSeeds.assets.filter(a => a.status !== "healthy").length;
  const openWos = activeSeeds.workOrders.filter(w => w.status !== "Completed" && w.status !== "Verified").length;
  const inventoryRiskItems = activeSeeds.inventory.filter(i => i.stock <= i.reorderLevel).length;

  if (!mounted) {
    return <div className="min-h-screen bg-[#06080d]" />;
  }

  if (viewMode === "landing") {
    return (
      <StellarHomePage
        onLaunchPlatform={handleLaunchPlatform}
        onOpenResources={() => setViewMode("resources")}
        onOpenContact={() => setViewMode("contact")}
      />
    );
  }

  if (viewMode === "resources") {
    return (
      <ResourcesHub
        onBackToHome={() => setViewMode("landing")}
        onLaunchPlatform={handleLaunchPlatform}
      />
    );
  }

  if (viewMode === "contact") {
    return (
      <ContactHub
        onBackToHome={() => setViewMode("landing")}
        onLaunchPlatform={handleLaunchPlatform}
        onOpenResources={() => setViewMode("resources")}
      />
    );
  }

  return (
    <div className="flex h-screen bg-[#F8FAFC] dark:bg-[#08090d] text-slate-900 dark:text-slate-100 font-sans overflow-hidden transition-colors">

      {/* SIDEBAR */}
      <aside className={`scio-sidebar border-r border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0d1017] flex flex-col transition-all duration-300 ${sidebarOpen ? "w-64" : "w-16"}`}>
        <div className="h-16 flex items-center px-4 border-b border-slate-200 dark:border-slate-800 justify-between">
          {sidebarOpen ? (
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="h-8 w-8 rounded-lg bg-black dark:bg-white text-white dark:text-black shadow-md flex items-center justify-center font-mono font-black text-sm tracking-wider shrink-0">
                S
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-xs tracking-widest text-[#090D16] dark:text-slate-100 uppercase truncate font-mono">STELLAR SCIO</span>
                <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono tracking-wider">MISSION CONTROL</span>
              </div>
            </div>
          ) : (
            <div className="h-8 w-8 rounded-lg bg-black dark:bg-white text-white dark:text-black shadow-md mx-auto flex items-center justify-center font-mono font-black text-xs">
              S
            </div>
          )}
          {sidebarOpen && (
            <button
              onClick={() => setIsDark(!isDark)}
              className="theme-toggle flex-shrink-0 ml-2"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              <div className="theme-toggle-knob">
                {isDark ? '🌙' : '☀️'}
              </div>
            </button>
          )}
        </div>

        {/* SIDEBAR NAVIGATION ITEMS */}
        <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
          {currentIndustry === "maritime" ? (
            [
              { id: "dashboard", label: "Control Center", icon: <Building2 className="h-4 w-4" /> },
              { id: "fleet", label: "Fleet Operations", icon: <Anchor className="h-4 w-4" /> },
              { id: "assets", label: "Marine Assets", icon: <Activity className="h-4 w-4" /> },
              { id: "work-orders", label: "Marine Maintenance", icon: <ClipboardList className="h-4 w-4" /> },
              { id: "inventory", label: "Marine MRO Spares", icon: <ShoppingCart className="h-4 w-4" /> },
              { id: "compliance", label: "Safety & Compliance", icon: <Shield className="h-4 w-4" />, badge: "3" },
              { id: "supply", label: "Procurement & POs", icon: <Navigation className="h-4 w-4" /> },
              { id: "crew", label: "Crew Operations", icon: <UserCheck className="h-4 w-4" /> },
              { id: "ai-copilot", label: "AI Copilot Terminal", icon: <MessageSquare className="h-4 w-4" /> }
            ].map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all group cursor-pointer ${isActive
                      ? "bg-slate-900 text-white shadow-xs font-bold dark:bg-white dark:text-black"
                      : "text-slate-700 hover:text-black hover:bg-slate-100 font-medium dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/[0.07]"
                    }`}
                >
                  <div className="flex items-center space-x-3 truncate">
                    <span className={isActive ? "text-cyan-400 dark:text-blue-600" : "text-slate-500 group-hover:text-slate-900 dark:text-slate-400 dark:group-hover:text-slate-200"}>
                      {tab.icon}
                    </span>
                    {sidebarOpen && <span className="truncate">{tab.label}</span>}
                  </div>
                  {sidebarOpen && tab.badge && (
                    <span className="text-[9.5px] font-mono px-1.5 py-0.5 rounded-md border border-slate-200 bg-slate-100 text-slate-700 dark:border-white/15 dark:bg-white/10 dark:text-slate-200 font-bold">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })
          ) : currentIndustry === "energy" ? (
            [
              { id: "energy-dashboard", label: "Central Operations Room", icon: <Activity className="h-4 w-4" />, badge: "OCC" },
              { id: "energy-flow", label: "SCIO Flow Explorer", icon: <Activity className="h-4 w-4" /> },
              { id: "energy-infra", label: "Infrastructure", icon: <Building2 className="h-4 w-4" /> },
              { id: "energy-assets", label: "Energy Assets", icon: <Zap className="h-4 w-4" /> },
              { id: "energy-field-ops", label: "Field Operations", icon: <ClipboardList className="h-4 w-4" />, badge: "Mobile" },
              { id: "energy-ops", label: "Energy Operations", icon: <Activity className="h-4 w-4" /> },
              { id: "energy-reliability", label: "Asset Reliability", icon: <Shield className="h-4 w-4" /> },
              { id: "energy-inventory", label: "Inventory & MRO", icon: <ShoppingCart className="h-4 w-4" /> },
              { id: "energy-supply", label: "Supply Chain", icon: <Navigation className="h-4 w-4" /> },
              { id: "energy-compliance", label: "Safety & Compliance", icon: <Shield className="h-4 w-4" />, badge: "CIP" }
            ].map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all group cursor-pointer ${isActive
                      ? "bg-slate-900 text-white shadow-xs font-bold dark:bg-white dark:text-black"
                      : "text-slate-700 hover:text-black hover:bg-slate-100 font-medium dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/[0.07]"
                    }`}
                >
                  <div className="flex items-center space-x-3 truncate">
                    <span className={isActive ? "text-emerald-400 dark:text-emerald-600" : "text-slate-500 group-hover:text-slate-900 dark:text-slate-400 dark:group-hover:text-slate-200"}>
                      {tab.icon}
                    </span>
                    {sidebarOpen && <span className="truncate">{tab.label}</span>}
                  </div>
                  {sidebarOpen && tab.badge && (
                    <span className={`text-[9.5px] font-mono px-1.5 py-0.5 rounded-md border uppercase tracking-wider font-bold ${isActive
                        ? "bg-slate-800 text-white border-slate-700 dark:bg-black/20 dark:text-black dark:border-black/20"
                        : "bg-slate-100 text-slate-700 border-slate-200 dark:bg-white/10 dark:text-slate-300 dark:border-white/15"
                      }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })
          ) : currentIndustry === "manufacturing" ? (
            [
              { id: "dashboard", label: "Control Center", icon: <Building2 className="h-4 w-4" /> },
              { id: "planning", label: "Production Planning", icon: <Calendar className="h-4 w-4" />, badge: "Gantt" },
              { id: "quality", label: "Quality & Traceability", icon: <Shield className="h-4 w-4" />, badge: "AI AOI" },
              { id: "maintenance", label: "Asset & Maintenance", icon: <ClipboardList className="h-4 w-4" /> },
              { id: "materials", label: "Materials & Supply", icon: <ShoppingCart className="h-4 w-4" />, badge: "BOM" },
              { id: "compliance", label: "Compliance & Safety", icon: <Shield className="h-4 w-4" />, badge: "IATF" },
              { id: "ai-intelligence", label: "AI Manufacturing Intel", icon: <Cpu className="h-4 w-4" />, badge: "AI" }
            ].map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all group cursor-pointer ${isActive
                      ? "bg-slate-900 text-white shadow-xs font-bold dark:bg-white dark:text-black"
                      : "text-slate-700 hover:text-black hover:bg-slate-100 font-medium dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/[0.07]"
                    }`}
                >
                  <div className="flex items-center space-x-3 truncate">
                    <span className={isActive ? "text-amber-400 dark:text-amber-600" : "text-slate-500 group-hover:text-slate-900 dark:text-slate-400 dark:group-hover:text-slate-200"}>
                      {tab.icon}
                    </span>
                    {sidebarOpen && <span className="truncate">{tab.label}</span>}
                  </div>
                  {sidebarOpen && tab.badge && (
                    <span className={`text-[9.5px] font-mono px-1.5 py-0.5 rounded-md border uppercase tracking-wider font-bold ${isActive
                        ? "bg-slate-800 text-white border-slate-700 dark:bg-black/20 dark:text-black dark:border-black/20"
                        : "bg-slate-100 text-slate-700 border-slate-200 dark:bg-white/10 dark:text-slate-300 dark:border-white/15"
                      }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })
          ) : currentIndustry === "logistics" ? (
            [
              { id: "dashboard", label: "Control Center", icon: <Building2 className="h-4 w-4" /> },
              { id: "fleet-map", label: "Live GPS Fleet Map", icon: <Globe className="h-4 w-4" />, badge: "LIVE" },
              { id: "shipments", label: "Multimodal Freight", icon: <Truck className="h-4 w-4" />, badge: "GPS" },
              { id: "cold-chain", label: "Cold-Chain IoT", icon: <ThermometerSnowflake className="h-4 w-4" />, badge: "Reefer" },
              { id: "warehouses", label: "Distribution Hubs", icon: <Boxes className="h-4 w-4" /> },
              { id: "supply", label: "Procurement & POs", icon: <Navigation className="h-4 w-4" />, badge: "EDI" },
              { id: "demurrage-ai", label: "Demurrage & Route AI", icon: <Zap className="h-4 w-4" />, badge: "AI" },
              { id: "compliance", label: "Customs & Safety", icon: <Shield className="h-4 w-4" />, badge: "C-TPAT" }
            ].map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all group cursor-pointer ${isActive
                      ? "bg-slate-900 text-white shadow-xs font-bold dark:bg-white dark:text-black"
                      : "text-slate-700 hover:text-black hover:bg-slate-100 font-medium dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/[0.07]"
                    }`}
                >
                  <div className="flex items-center space-x-3 truncate">
                    <span className={isActive ? "text-cyan-400 dark:text-cyan-600" : "text-slate-500 group-hover:text-slate-900 dark:text-slate-400 dark:group-hover:text-slate-200"}>
                      {tab.icon}
                    </span>
                    {sidebarOpen && <span className="truncate">{tab.label}</span>}
                  </div>
                  {sidebarOpen && tab.badge && (
                    <span className={`text-[9.5px] font-mono px-1.5 py-0.5 rounded-md border uppercase tracking-wider font-bold ${isActive
                        ? "bg-slate-800 text-white border-slate-700 dark:bg-black/20 dark:text-black dark:border-black/20"
                        : "bg-slate-100 text-slate-700 border-slate-200 dark:bg-white/10 dark:text-slate-300 dark:border-white/15"
                      }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })
          ) : (
            [
              { id: "dashboard", label: "Control Center", icon: <Building2 className="h-4 w-4" /> },
              { id: "assets", label: "Asset Engine", icon: <Building2 className="h-4 w-4" /> },
              { id: "work-orders", label: "Work Orders", icon: <ClipboardList className="h-4 w-4" /> },
              { id: "inventory", label: "Inventory MRO", icon: <ShoppingCart className="h-4 w-4" /> },
              { id: "compliance", label: "Compliance & Safety", icon: <Shield className="h-4 w-4" /> },
              { id: "suppliers", label: "Supplier Engine", icon: <Navigation className="h-4 w-4" /> }
            ].map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all group cursor-pointer ${isActive
                      ? "bg-slate-900 text-white shadow-xs font-bold dark:bg-white dark:text-black"
                      : "text-slate-700 hover:text-black hover:bg-slate-100 font-medium dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/[0.07]"
                    }`}
                >
                  <div className="flex items-center space-x-3 truncate">
                    <span className={isActive ? "text-cyan-400 dark:text-cyan-600" : "text-slate-500 group-hover:text-slate-900 dark:text-slate-400 dark:group-hover:text-slate-200"}>
                      {tab.icon}
                    </span>
                    {sidebarOpen && <span className="truncate">{tab.label}</span>}
                  </div>
                </button>
              );
            })
          )}
        </nav>

        {/* SIDEBAR FOOTER */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 text-center">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 dark:bg-slate-900/80 dark:hover:bg-slate-800 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg text-[11px] font-mono border border-slate-200 dark:border-slate-800 transition-all"
          >
            {sidebarOpen ? "« Collapse Menu" : "»"}
          </button>
        </div>
      </aside>

      {/* MAIN VIEWPORT */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#F1F5F9]/60 dark:bg-[#08090d] transition-colors">

        {/* EXECUTIVE TOP HEADER (ALIGNED WITH HOMEPAGE DESIGN SYSTEM) */}
        <header className="h-16 border-b border-slate-200 dark:border-white/10 bg-white/90 dark:bg-[#090D14]/90 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between relative z-50 shadow-xs transition-colors">
          <div className="flex items-center space-x-3 sm:space-x-4">

            {/* Back to Homepage Gateway */}
            <button
              onClick={() => setViewMode("landing")}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/12 border border-slate-200 dark:border-white/10 rounded-lg text-xs font-medium text-slate-800 dark:text-slate-200 transition-all shadow-2xs cursor-pointer group"
              title="Return to Stellar SCIO Product Homepage"
            >
              <ArrowLeft className="h-3.5 w-3.5 text-slate-500 group-hover:-translate-x-0.5 transition-transform" />
              <span>Home</span>
            </button>

            {/* Industry Selector Dropdown */}
            <div className="relative z-50">
              <button
                onClick={() => setIndustryDropdownOpen(!industryDropdownOpen)}
                className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.08] dark:hover:bg-white/15 border border-slate-200 dark:border-white/12 rounded-lg text-xs font-semibold text-slate-900 dark:text-white transition-all shadow-2xs cursor-pointer"
              >
                <span className="p-1 rounded-md bg-white dark:bg-black/40 shadow-2xs">
                  {currentIndustry === "energy" && <Zap className="h-3.5 w-3.5 text-emerald-500" />}
                  {currentIndustry === "manufacturing" && <Building2 className="h-3.5 w-3.5 text-amber-500" />}
                  {currentIndustry === "maritime" && <Ship className="h-3.5 w-3.5 text-blue-500" />}
                  {currentIndustry === "logistics" && <Truck className="h-3.5 w-3.5 text-cyan-500" />}
                </span>
                <span className="tracking-tight">
                  {currentIndustry === "energy" ? "Renewable Energy & Grid" :
                    currentIndustry === "manufacturing" ? "Manufacturing 4.0" :
                      currentIndustry === "maritime" ? "Maritime Fleet" :
                        currentIndustry === "logistics" ? "Cold-Chain & Logistics" : "Operations"}
                </span>
                <ChevronDown className={`h-3.5 w-3.5 text-slate-400 dark:text-slate-400 transition-transform duration-200 ${industryDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {industryDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40 bg-transparent"
                    onClick={() => setIndustryDropdownOpen(false)}
                  />
                  <div className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/15 rounded-2xl shadow-2xl z-50 p-2 backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-2 py-1.5 border-b border-slate-100 dark:border-white/10 mb-1 flex items-center justify-between">
                      <span className="text-[10.5px] font-mono uppercase font-bold text-slate-400 dark:text-slate-400 tracking-wider">
                        Switch Sector Workspace
                      </span>
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    </div>
                    {[
                      { id: "energy", name: "Renewable Energy & Grid", desc: "12.4 GW Live • SCADA & Wind/Solar OCC", icon: <Zap className="h-4 w-4 text-emerald-500" /> },
                      { id: "manufacturing", name: "Manufacturing 4.0", desc: "91.4% OEE • Spindles & Robotic Cells", icon: <Building2 className="h-4 w-4 text-amber-500" /> },
                      { id: "maritime", name: "Maritime Fleet", desc: "12 Vessels • AIS & Bunker Operations", icon: <Ship className="h-4 w-4 text-blue-500" /> },
                      { id: "logistics", name: "Cold-Chain & Logistics", desc: "142 Reefers • Cargo IoT & Disruption AI", icon: <Truck className="h-4 w-4 text-cyan-500" /> }
                    ].map((ind) => (
                      <button
                        key={ind.id}
                        onClick={() => {
                          setCurrentIndustry(ind.id);
                          setIndustryDropdownOpen(false);
                          setActiveTab(ind.id === "energy" ? "energy-dashboard" : "dashboard");
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs text-left transition-all relative z-50 cursor-pointer ${currentIndustry === ind.id
                            ? "bg-slate-900 text-white dark:bg-white dark:text-black font-semibold shadow-xs"
                            : "text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/[0.07] dark:hover:text-white"
                          }`}
                      >
                        <div className={`p-1.5 rounded-lg shrink-0 ${currentIndustry === ind.id ? "bg-white/20 dark:bg-black/10" : "bg-slate-100 dark:bg-white/10"}`}>
                          {ind.icon}
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="font-bold truncate">{ind.name}</span>
                          <span className={`text-[10px] truncate ${currentIndustry === ind.id ? "text-slate-300 dark:text-slate-600" : "text-slate-400 dark:text-slate-400"}`}>
                            {ind.desc}
                          </span>
                        </div>
                        {currentIndustry === ind.id && (
                          <Check className="h-4 w-4 shrink-0 opacity-90" />
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Dynamic Multi-Industry Live Telemetry Beacon */}
            <div className="hidden xl:flex items-center gap-2.5 px-3 py-1.5 bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-lg text-[11px] font-sans text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                LIVE
              </span>
              <span className="text-slate-300 dark:text-white/20">/</span>
              {currentIndustry === "energy" && (
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  <strong className="text-slate-900 dark:text-white">12.4 GW</strong> Grid Load • <strong className="text-slate-900 dark:text-white">50.02 Hz</strong> • 8 Substations
                </span>
              )}
              {currentIndustry === "maritime" && (
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  <strong className="text-slate-900 dark:text-white">12 Vessels</strong> Active • AIS Satellite Sync • 0 Port Detentions
                </span>
              )}
              {currentIndustry === "manufacturing" && (
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  <strong className="text-slate-900 dark:text-white">91.4% OEE</strong> • 24 Robotic Cells • 0 Batch Defects
                </span>
              )}
              {currentIndustry === "logistics" && (
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  <strong className="text-slate-900 dark:text-white">142 Reefers</strong> • -21.4°C Avg • 0 Temp Excursions
                </span>
              )}
              <span className="text-slate-300 dark:text-white/20">/</span>
              <span className="font-mono text-[10px] text-slate-400 dark:text-slate-400">14ms latency</span>
            </div>
          </div>

          {/* Right Action Suite */}
          <div className="flex items-center space-x-2.5">
            <button
              onClick={() => setShowCockpitHUD(!showCockpitHUD)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border cursor-pointer ${showCockpitHUD
                  ? "bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/40 shadow-xs"
                  : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 dark:bg-white/[0.06] dark:text-slate-300 dark:border-white/10 dark:hover:bg-white/12"
                }`}
            >
              <Gauge className="h-3.5 w-3.5 text-blue-500" />
              <span>{showCockpitHUD ? "HUD Active" : "Telemetry HUD"}</span>
            </button>

            <button
              onClick={() => setCopilotOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-black dark:hover:bg-slate-100 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer group"
            >
              <Sparkles className="h-3.5 w-3.5 text-cyan-400 dark:text-blue-600 group-hover:scale-110 transition-transform" />
              <span>Ask AI Copilot</span>
            </button>

            <button
              onClick={() => setCreateWoModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5 text-white" />
              <span>New Work Order</span>
            </button>

            <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-white/[0.08] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 flex items-center justify-center cursor-pointer hover:bg-slate-200 dark:hover:bg-white/15 transition-colors">
              <User className="h-4 w-4" />
            </div>
          </div>
        </header>

        {/* WORKSPACE VIEW CONTENT */}
        <div className="flex-1 overflow-y-auto p-6 bg-background space-y-6">

          {/* ==================== INDUSTRIAL COCKPIT HUD (AEROSPACE METERS & SPECTRAL ANALYZER) ==================== */}
          {showCockpitHUD && (
            <IndustrialCockpitHUD currentIndustry={currentIndustry} />
          )}


          {/* ==================== MARITIME CENTRALIZED CONTROL CENTER ==================== */}
          {activeTab === "dashboard" && currentIndustry === "maritime" && (
            <MaritimeControlCenter
              bunkerLogs={bunkerLogs}
              clearances={clearances}
              deficiencies={deficiencies}
              safetyInspections={safetyInspections}
              onNavigate={setActiveTab}
              onOpenDeficiency={() => setDeficiencyModalOpen(true)}
            />
          )}

          {/* ==================== MANUFACTURING 4.0 OPERATING SYSTEM MODULES ==================== */}
          {currentIndustry === "manufacturing" && (
            <>
              {activeTab === "dashboard" && (
                <ManufacturingControlCenter
                  onNavigate={setActiveTab}
                  onCreateWorkOrder={(title, assetId, prio) => {
                    setNewWoTitle(title);
                    setNewWoAssetId(assetId);
                    setNewWoPriority(prio);
                    setCreateWoModalOpen(true);
                  }}
                />
              )}
              {activeTab === "planning" && (
                <ProductionPlanningModule />
              )}
              {activeTab === "quality" && (
                <QualityTraceabilityModule />
              )}
              {activeTab === "maintenance" && (
                <AssetMaintenanceModule />
              )}
              {activeTab === "materials" && (
                <MaterialsSupplyChainModule />
              )}
              {activeTab === "ai-intelligence" && (
                <AIManufacturingIntelligence />
              )}
            </>
          )}

          {/* ==================== LOGISTICS & SUPPLY CHAIN COMMAND CENTER ==================== */}
          {currentIndustry === "logistics" && (
            <>
              {activeTab === "dashboard" && (
                <LogisticsControlCenter
                  initialSubTab="Overview"
                  onNavigate={setActiveTab}
                  onCreateWorkOrder={(title, assetId, prio) => {
                    setNewWoTitle(title);
                    setNewWoAssetId(assetId);
                    setNewWoPriority(prio);
                    setCreateWoModalOpen(true);
                  }}
                />
              )}
              {activeTab === "fleet-map" && (
                <LogisticsControlCenter
                  initialSubTab="Live GPS Fleet Map"
                  onNavigate={setActiveTab}
                  onCreateWorkOrder={(title, assetId, prio) => {
                    setNewWoTitle(title);
                    setNewWoAssetId(assetId);
                    setNewWoPriority(prio);
                    setCreateWoModalOpen(true);
                  }}
                />
              )}
              {activeTab === "shipments" && (
                <LogisticsControlCenter
                  initialSubTab="Multimodal Shipments"
                  onNavigate={setActiveTab}
                  onCreateWorkOrder={(title, assetId, prio) => {
                    setNewWoTitle(title);
                    setNewWoAssetId(assetId);
                    setNewWoPriority(prio);
                    setCreateWoModalOpen(true);
                  }}
                />
              )}
              {activeTab === "cold-chain" && (
                <LogisticsControlCenter
                  initialSubTab="Cold-Chain IoT & Sensors"
                  onNavigate={setActiveTab}
                  onCreateWorkOrder={(title, assetId, prio) => {
                    setNewWoTitle(title);
                    setNewWoAssetId(assetId);
                    setNewWoPriority(prio);
                    setCreateWoModalOpen(true);
                  }}
                />
              )}
              {activeTab === "warehouses" && (
                <LogisticsControlCenter
                  initialSubTab="Distribution Hubs & Bays"
                  onNavigate={setActiveTab}
                  onCreateWorkOrder={(title, assetId, prio) => {
                    setNewWoTitle(title);
                    setNewWoAssetId(assetId);
                    setNewWoPriority(prio);
                    setCreateWoModalOpen(true);
                  }}
                />
              )}
              {activeTab === "demurrage-ai" && (
                <LogisticsControlCenter
                  initialSubTab="Demurrage & Route AI"
                  onNavigate={setActiveTab}
                  onCreateWorkOrder={(title, assetId, prio) => {
                    setNewWoTitle(title);
                    setNewWoAssetId(assetId);
                    setNewWoPriority(prio);
                    setCreateWoModalOpen(true);
                  }}
                />
              )}
            </>
          )}

          {/* ==================== GENERIC CONTROL CENTER TAB (Other fallback) ==================== */}
          {activeTab === "dashboard" && currentIndustry !== "maritime" && currentIndustry !== "manufacturing" && currentIndustry !== "logistics" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { title: currentIndustry === "maritime" ? "Total Fleet Pool" : "Total Asset Pool", value: totalAssets, sub: "Registered units", status: "healthy" },
                  { title: "Elevated Risk Units", value: criticalAssets, sub: "Requiring intervention", status: criticalAssets > 0 ? "warning" : "healthy" },
                  { title: "Active Maintenance Orders", value: openWos, sub: "In processing pipeline", status: "warning" },
                  { title: currentIndustry === "maritime" ? "Spare Deficits" : "MRO Stock Disruption", value: inventoryRiskItems, sub: "Below safety margins", status: inventoryRiskItems > 0 ? "offline" : "healthy" }
                ].map((stat, i) => (
                  <div key={i} className="p-4 bg-panel border border-borderMuted rounded-lg relative overflow-hidden glow-card">
                    <span className="text-xs text-textMuted uppercase font-semibold">{stat.title}</span>
                    <div className="text-2xl font-bold mt-2 text-textBright">{stat.value}</div>
                    <span className="text-xs text-textMuted mt-1 block">{stat.sub}</span>
                    <div className={`absolute top-0 right-0 w-1.5 h-full ${getStatusColor(stat.status).split(' ')[2]}`} />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  <div className="bg-panel border border-borderMuted rounded-lg p-5">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-sm font-semibold uppercase tracking-wider text-textMuted flex items-center space-x-2">
                        <AlertTriangle className="h-4 w-4 text-critical" />
                        <span>Active Operational Control Alerts</span>
                      </h2>
                      <span className="text-xs text-textMuted font-mono">Real-time status</span>
                    </div>

                    <div className="divide-y divide-borderMuted/30 space-y-4">
                      {activeSeeds.insights.map((ins) => (
                        <div key={ins.id} className="pt-4 first:pt-0 flex flex-col md:flex-row md:items-start md:justify-between space-y-3 md:space-y-0">
                          <div className="space-y-1 pr-4">
                            <div className="flex items-center space-x-2">
                              <span className={`text-[10px] font-mono font-bold uppercase border px-2 py-0.5 rounded ${getPriorityColor(ins.severity)}`}>
                                {ins.severity}
                              </span>
                              <span className="text-sm font-semibold text-textBright">{ins.targetEntity}</span>
                            </div>
                            <p className="text-xs text-textMuted font-medium">{ins.detail}</p>
                            <div className="text-xs font-semibold text-textBright mt-1">
                              💡 Recommendation: <span className="text-textMuted font-normal">{ins.recommendation}</span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 self-start md:self-center">
                            <button
                              onClick={() => {
                                setNewWoTitle(`Emergency Check: ${ins.targetEntity}`);
                                setNewWoAssetId(ins.targetEntity);
                                setNewWoPriority(ins.severity);
                                setCreateWoModalOpen(true);
                              }}
                              className="px-2.5 py-1.5 bg-panelLight border border-borderMuted hover:border-textMuted rounded text-xs font-semibold"
                            >
                              Dispatch WO
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-panel border border-borderMuted rounded-lg p-5 glow-card">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-textMuted mb-4">Real-time Telemetry Failure Risk Trend Lines</h3>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={activeSeeds.assets}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#222534" />
                          <XAxis dataKey="name" stroke="#7e87a2" fontSize={10} />
                          <YAxis stroke="#7e87a2" fontSize={10} unit="%" />
                          <Tooltip contentStyle={{ backgroundColor: "#11131c", borderColor: "#222534" }} />
                          <Area type="monotone" dataKey="failureRisk" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.12} name="Failure Risk %" />
                          <Area type="monotone" dataKey="healthScore" stroke="#10b981" fill="#10b981" fillOpacity={0.03} name="Health Score" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-panel border border-borderMuted rounded-lg p-5">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-textMuted mb-4">AI Safety Insights</h3>
                    <div className="space-y-4">
                      {activeSeeds.insights.map((insight, idx) => (
                        <div key={idx} className="p-3 bg-panelLight border-l-2 border-emerald-500 rounded-r-lg space-y-1.5">
                          <span className="text-[10px] font-bold uppercase text-emerald-400">{insight.type} check</span>
                          <h4 className="text-xs font-semibold text-textBright">{insight.title}</h4>
                          <p className="text-xs text-textMuted">{insight.detail}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== CENTRAL OPERATIONS ROOM DASHBOARD ==================== */}
          {activeTab === "energy-dashboard" && (
            <DashboardOverview onSelectPlant={(id) => { setSelectedPlantId(id); setActiveTab("energy-infra"); }} />
          )}

          {/* ==================== ENERGY SCIO FLOW EXPLORER ==================== */}
          {activeTab === "energy-flow" && (
            <GISMapView onSelectPlant={(id) => { setSelectedPlantId(id); setActiveTab("energy-infra"); }} />
          )}

          {/* ==================== PLANT INFRASTRUCTURE REGISTRY ==================== */}
          {activeTab === "energy-infra" && (
            selectedPlantId ? (
              <PlantDetailsView
                plantId={selectedPlantId}
                onBack={() => setSelectedPlantId(null)}
                onSelectAsset={() => setActiveTab("energy-assets")}
              />
            ) : (
              <PlantDirectory onSelectPlant={(id) => { setSelectedPlantId(id); }} />
            )
          )}

          {/* ==================== ENERGY ASSETS CATALOG ==================== */}
          {activeTab === "energy-assets" && (
            <AssetRegistry />
          )}

          {/* ==================== FIELD WORK OPERATIONS ==================== */}
          {activeTab === "energy-field-ops" && (
            <div className="space-y-10">
              <FieldOpsControl />
              <div className="border-t border-borderMuted/40 pt-8">
                <InspectionsHub />
              </div>
            </div>
          )}

          {/* ==================== ENERGY ALARMS CONSOLE ==================== */}
          {activeTab === "energy-ops" && (
            <AlarmConsole onSelectPlant={(id) => { setSelectedPlantId(id); setActiveTab("energy-infra"); }} />
          )}

          {/* ==================== AI PREDICTIVE RELIABILITY ==================== */}
          {activeTab === "energy-reliability" && (
            <AIOpsControl />
          )}

          {/* ==================== WAREHOUSE SPARES INVENTORY ==================== */}
          {activeTab === "energy-inventory" && (
            <div className="space-y-10">
              <InventoryModule />
              <div className="border-t border-borderMuted/40 pt-8">
                <ProcurementModule />
              </div>
            </div>
          )}

          {/* ==================== PPA SUPPLY CHAIN FINANCE ==================== */}
          {activeTab === "energy-supply" && (
            <FinanceModule />
          )}

          {/* ==================== COMPLIANCE & ERP SYSTEMS ==================== */}
          {activeTab === "energy-compliance" && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div>
                <AuditTrail />
              </div>
              <div>
                <ERPSyncHub />
              </div>
            </div>
          )}

          {/* ==================== FLEET & VESSEL OPERATIONS TAB (Maritime Only) ==================== */}
          {activeTab === "fleet" && (
            <div className="space-y-6">
              <div className="bg-panel border border-borderMuted rounded-lg p-5">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-textMuted mb-4">Vessel Voyage & Availability Logs</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-borderMuted text-xs text-textMuted uppercase font-mono">
                        <th className="py-3 px-4">Vessel Name</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Voyage Number</th>
                        <th className="py-3 px-4">Port / Routes</th>
                        <th className="py-3 px-4">Charter Hire</th>
                        <th className="py-3 px-4">ETA</th>
                        <th className="py-3 px-4">Current Speed</th>
                        <th className="py-3 px-4">Availability</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-borderMuted/30 text-sm">
                      {MARITIME_FLEET.map(voy => (
                        <tr key={voy.vesselId} className="hover:bg-panelLight/30">
                          <td className="py-3 px-4 font-semibold text-textBright">{voy.vesselName}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded border text-xs font-semibold ${getStatusColor(voy.status)}`}>
                              {voy.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-textMuted font-mono">{voy.voyageNumber}</td>
                          <td className="py-3 px-4 text-textBright">
                            {voy.departurePort} <span className="text-textMuted">➔</span> {voy.destinationPort}
                          </td>
                          <td className="py-3 px-4 text-healthy font-semibold font-mono">${voy.charterRatePerDay.toLocaleString()}/Day</td>
                          <td className="py-3 px-4 text-textMuted font-mono">{voy.eta}</td>
                          <td className="py-3 px-4 text-textMuted font-mono">{voy.speedKts} Kts</td>
                          <td className="py-3 px-4 font-mono font-semibold">{voy.availabilityPercent}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {MARITIME_FLEET.map(voy => {
                  const fuelLog = bunkerLogs.find(b => b.vesselId === voy.vesselId);
                  const fuelCost = fuelLog ? (fuelLog.mgoROBMetricTons * 850) + (fuelLog.hfoROBMetricTons * 600) : 0;

                  const voyageRevenue = voy.charterRatePerDay * 15;
                  const voyageOPEX = fuelCost + 45000;
                  const netProfit = voyageRevenue - voyageOPEX;

                  return (
                    <div key={voy.vesselId} className="p-5 bg-panel border border-borderMuted rounded-lg space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-textBright text-sm">{voy.vesselName}</h3>
                          <span className="text-xs text-textMuted font-mono">15-Day Voyage Forecast</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${netProfit > 150000 ? "border-healthy/30 text-healthy bg-healthy/5" : "border-critical/30 text-critical bg-critical/5"}`}>
                          {netProfit > 150000 ? "High Yield" : "Low Margin"}
                        </span>
                      </div>

                      <div className="space-y-1.5 text-xs font-mono">
                        <div className="flex justify-between">
                          <span className="text-textMuted">Charter Income:</span>
                          <span className="text-textBright font-semibold">${voyageRevenue.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-textMuted">Fuel Expense:</span>
                          <span className="text-critical font-semibold">${fuelCost.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-textMuted">Port & Crew OPEX:</span>
                          <span className="text-critical font-semibold">$45,000</span>
                        </div>
                        <div className="flex justify-between border-t border-borderMuted/30 pt-1.5 text-sm">
                          <span className="text-textBright font-semibold">Net P&L:</span>
                          <span className={`${netProfit >= 0 ? "text-healthy" : "text-critical"} font-bold`}>
                            ${netProfit.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-panel border border-borderMuted rounded-lg p-5">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-textMuted mb-4">Voyage Port Clearance Milestones</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {clearances.map(cls => {
                    const vessel = MARITIME_FLEET.find(v => v.vesselId === cls.vesselId);
                    return (
                      <div key={cls.vesselId} className="p-4 bg-panelLight border border-borderMuted rounded-lg space-y-3">
                        <h3 className="font-semibold text-textBright text-sm">{vessel?.vesselName || "Unknown Vessel"}</h3>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between items-center">
                            <span className="text-textMuted">Customs Status:</span>
                            <button
                              onClick={() => setClearances(prev => prev.map(c => c.vesselId === cls.vesselId ? { ...c, customsCleared: !c.customsCleared } : c))}
                              className={`px-2 py-1 rounded text-[10px] font-semibold border ${cls.customsCleared ? "border-healthy/30 text-healthy bg-healthy/5" : "border-critical/30 text-critical bg-critical/5"}`}
                            >
                              {cls.customsCleared ? "Cleared" : "Pending"}
                            </button>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-textMuted">Immigration:</span>
                            <button
                              onClick={() => setClearances(prev => prev.map(c => c.vesselId === cls.vesselId ? { ...c, immigrationCleared: !c.immigrationCleared } : c))}
                              className={`px-2 py-1 rounded text-[10px] font-semibold border ${cls.immigrationCleared ? "border-healthy/30 text-healthy bg-healthy/5" : "border-critical/30 text-critical bg-critical/5"}`}
                            >
                              {cls.immigrationCleared ? "Cleared" : "Pending"}
                            </button>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-textMuted">Port Agent Notify:</span>
                            <button
                              onClick={() => setClearances(prev => prev.map(c => c.vesselId === cls.vesselId ? { ...c, portAgentNotified: !c.portAgentNotified } : c))}
                              className={`px-2 py-1 rounded text-[10px] font-semibold border ${cls.portAgentNotified ? "border-healthy/30 text-healthy bg-healthy/5" : "border-critical/30 text-critical bg-critical/5"}`}
                            >
                              {cls.portAgentNotified ? "Notified" : "Pending"}
                            </button>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-textMuted">Pilotage:</span>
                            <button
                              onClick={() => setClearances(prev => prev.map(c => c.vesselId === cls.vesselId ? { ...c, pilotageRequested: !c.pilotageRequested } : c))}
                              className={`px-2 py-1 rounded text-[10px] font-semibold border ${cls.pilotageRequested ? "border-healthy/30 text-healthy bg-healthy/5" : "border-critical/30 text-critical bg-critical/5"}`}
                            >
                              {cls.pilotageRequested ? "Requested" : "Pending"}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-panel border border-borderMuted rounded-lg p-5">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-textMuted mb-4">Vessel Bunker & Fuel Consumption Log</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-borderMuted text-xs text-textMuted uppercase font-mono">
                        <th className="py-3 px-4">Vessel Name</th>
                        <th className="py-3 px-4">MGO ROB</th>
                        <th className="py-3 px-4">HFO ROB</th>
                        <th className="py-3 px-4">Bunker Asset Value</th>
                        <th className="py-3 px-4">Fuel Sulfur</th>
                        <th className="py-3 px-4">Last Bunkered Date</th>
                        <th className="py-3 px-4">Replenish Limit Alert</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-borderMuted/30 text-sm">
                      {bunkerLogs.map(log => {
                        const vessel = MARITIME_FLEET.find(v => v.vesselId === log.vesselId);
                        const totalFuel = log.mgoROBMetricTons + log.hfoROBMetricTons;
                        const bunkerValue = (log.mgoROBMetricTons * 850) + (log.hfoROBMetricTons * 600);
                        return (
                          <tr key={log.vesselId} className="hover:bg-panelLight/30">
                            <td className="py-3 px-4 font-semibold text-textBright">{vessel?.vesselName || "Unknown Vessel"}</td>
                            <td className="py-3 px-4 font-mono">{log.mgoROBMetricTons} MT</td>
                            <td className="py-3 px-4 font-mono">{log.hfoROBMetricTons} MT</td>
                            <td className="py-3 px-4 font-mono text-cyan-400 font-semibold">${bunkerValue.toLocaleString()}</td>
                            <td className="py-3 px-4 font-mono">{log.sulfurContentPercent}% S</td>
                            <td className="py-3 px-4 text-textMuted font-mono">{log.lastBunkeredDate}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded border text-xs font-semibold ${totalFuel < 200 ? "border-critical/30 text-critical bg-critical/5" : "border-healthy/30 text-healthy bg-healthy/5"}`}>
                                {totalFuel < 200 ? "Replenish Recommended" : "Sufficient Fuel"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==================== ASSET ENGINE TAB ==================== */}
          {activeTab === "assets" && (
            <div className="space-y-6">
              <div className="bg-panel border border-borderMuted rounded-lg p-5">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-textMuted">Registered Operating Assets ({activeSeeds.assets.length})</h2>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-borderMuted text-xs text-textMuted uppercase font-mono">
                        <th className="py-3 px-4">Asset Name</th>
                        <th className="py-3 px-4">Type</th>
                        <th className="py-3 px-4">Health</th>
                        <th className="py-3 px-4">Risk Index</th>
                        <th className="py-3 px-4">Location</th>
                        <th className="py-3 px-4">Criticality</th>
                        <th className="py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-borderMuted/30 text-sm">
                      {activeSeeds.assets.map(asset => (
                        <tr key={asset.id} className="hover:bg-panelLight/30">
                          <td className="py-3 px-4 font-semibold text-textBright">{asset.name}</td>
                          <td className="py-3 px-4 text-textMuted">{asset.type}</td>
                          <td className="py-3 px-4">
                            <span className="font-mono">{asset.healthScore}%</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`font-mono px-2 py-0.5 rounded border ${asset.failureRisk > 50 ? "border-critical/30 text-critical bg-critical/5" : "border-healthy/30 text-healthy bg-healthy/5"}`}>
                              {asset.failureRisk}%
                            </span>
                          </td>
                          <td className="py-3 px-4 text-textMuted">{asset.location}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded border text-xs font-semibold ${getPriorityColor(asset.criticality)}`}>
                              {asset.criticality}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => setSelectedAsset(asset)}
                              className="px-2.5 py-1 bg-panelLight border border-borderMuted hover:border-textMuted text-xs rounded text-textBright"
                            >
                              Inspect Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==================== WORK ORDERS TAB ==================== */}
          {activeTab === "work-orders" && (
            <div className="space-y-6">
              <div className="bg-panel border border-borderMuted rounded-lg p-5">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-textMuted">Operational Maintenance Work Orders</h2>
                  <button onClick={() => setCreateWoModalOpen(true)} className="px-3 py-1.5 bg-panelLight border border-borderMuted hover:border-textMuted text-xs font-medium rounded flex items-center space-x-1">
                    <Plus className="h-3.5 w-3.5" />
                    <span>Create Work Order</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-borderMuted text-xs text-textMuted uppercase font-mono">
                        <th className="py-3 px-4">Work Order Title</th>
                        <th className="py-3 px-4">Priority</th>
                        <th className="py-3 px-4">Workflow Status</th>
                        <th className="py-3 px-4">Assigned Resource</th>
                        <th className="py-3 px-4">Due Date</th>
                        <th className="py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-borderMuted/30 text-sm">
                      {activeSeeds.workOrders.map(wo => (
                        <tr key={wo.id} className="hover:bg-panelLight/30">
                          <td className="py-3 px-4 font-semibold text-textBright">{wo.title}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded border text-xs font-semibold ${getPriorityColor(wo.priority)}`}>
                              {wo.priority}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded border text-xs font-semibold ${getStatusColor(wo.status)}`}>
                              {wo.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-textMuted">{wo.assignedPerson}</td>
                          <td className="py-3 px-4 text-textMuted font-mono">{wo.dueDate}</td>
                          <td className="py-3 px-4 space-x-2">
                            {wo.status !== "Completed" && wo.status !== "Verified" && (
                              <button
                                onClick={() => handleUpdateWoStatus(wo.id, "Completed")}
                                className="px-2 py-1 bg-healthy/10 border border-healthy/30 text-healthy hover:bg-healthy/20 text-xs rounded font-semibold"
                              >
                                Close & Complete
                              </button>
                            )}
                            <button
                              onClick={() => setSelectedWorkOrder(wo)}
                              className="px-2 py-1 bg-panelLight border border-borderMuted hover:border-textMuted text-xs rounded text-textBright"
                            >
                              Inspect Notes
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==================== INVENTORY MRO TAB ==================== */}
          {activeTab === "inventory" && (
            <div className="space-y-6">
              <div className="bg-panel border border-borderMuted rounded-lg p-5">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-textMuted mb-4">
                  {currentIndustry === "maritime" ? "Marine MRO Spare Parts & Consumables" : "Critical Spares & MRO Catalog"}
                </h2>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-borderMuted text-xs text-textMuted uppercase font-mono">
                        <th className="py-3 px-4">Part Catalog ID</th>
                        <th className="py-3 px-4">Part Description</th>
                        <th className="py-3 px-4">Current Stock</th>
                        <th className="py-3 px-4">Reserved Allocation</th>
                        <th className="py-3 px-4">Reorder Level</th>
                        <th className="py-3 px-4">Lead Time</th>
                        <th className="py-3 px-4">Stock Alert Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-borderMuted/30 text-sm">
                      {activeSeeds.inventory.map(item => {
                        const alertStatus = item.stock <= item.reorderLevel ? "warning" : "healthy";
                        return (
                          <tr key={item.partId} className="hover:bg-panelLight/30">
                            <td className="py-3 px-4 font-mono font-bold text-textBright">{item.partId}</td>
                            <td className="py-3 px-4 text-textMuted">{item.name}</td>
                            <td className="py-3 px-4 font-semibold text-textBright">{item.stock}</td>
                            <td className="py-3 px-4 text-textMuted font-mono">{item.reserved}</td>
                            <td className="py-3 px-4 text-textMuted font-mono">{item.reorderLevel}</td>
                            <td className="py-3 px-4 text-textMuted font-mono">{item.leadTimeDays} Days</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded border text-xs font-semibold ${getStatusColor(alertStatus)}`}>
                                {item.stock <= item.reorderLevel ? "Low Stock" : "Sufficient"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==================== SAFETY & COMPLIANCE TAB ==================== */}
          {activeTab === "compliance" && (
            <div className="space-y-6">
              <div className="bg-panel border border-borderMuted rounded-lg p-5">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-textMuted">Operations Compliance Certificates & Regulatory Records</h2>

                  {currentIndustry === "maritime" && (
                    <div className="flex space-x-2">
                      <button
                        onClick={handleDownloadSafetyReport}
                        className="px-3 py-1.5 bg-panelLight border border-borderMuted hover:border-textMuted text-xs font-medium rounded flex items-center space-x-1.5 text-textBright"
                      >
                        <Download className="h-3.5 w-3.5 text-cyan-400" />
                        <span>Download Audit Report</span>
                      </button>
                      <button
                        onClick={() => setDeficiencyModalOpen(true)}
                        className="px-3 py-1.5 bg-panelLight border border-borderMuted hover:border-textMuted text-xs font-medium rounded flex items-center space-x-1.5 text-textBright"
                      >
                        <Plus className="h-3.5 w-3.5 text-cyan-400" />
                        <span>Report Deficiency</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {activeSeeds.compliance.map(cmp => (
                    <div key={cmp.id} className="p-4 bg-panelLight border border-borderMuted rounded-lg flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-0.5 rounded border text-xs font-semibold ${getStatusColor(cmp.status)}`}>
                            {cmp.status}
                          </span>
                          <h3 className="font-semibold text-textBright">{cmp.title}</h3>
                        </div>
                        <p className="text-xs text-textMuted">Regulatory Body: {cmp.authority} | Expiry: {cmp.expiryDate}</p>
                      </div>

                      {cmp.status !== "Valid" && (
                        <button
                          onClick={() => {
                            setNewWoTitle(`Audit Check: ${cmp.title}`);
                            setNewWoAssetId("Regulatory Compliance Desk");
                            setCreateWoModalOpen(true);
                          }}
                          className="px-3 py-1.5 bg-gradient-to-r from-purple-900 to-indigo-900 text-white rounded text-xs font-bold"
                        >
                          Trigger Compliance Audit WO
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {currentIndustry === "maritime" && (
                <div className="bg-panel border border-borderMuted rounded-lg p-5">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-textMuted mb-4">Marine Life-Saving & Fire Safety Equipment Inspections</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-borderMuted text-xs text-textMuted uppercase font-mono">
                          <th className="py-3 px-4">Equipment Description</th>
                          <th className="py-3 px-4">Assigned Crew</th>
                          <th className="py-3 px-4">Last Inspected</th>
                          <th className="py-3 px-4">Expiry Date</th>
                          <th className="py-3 px-4">Equipment Status</th>
                          <th className="py-3 px-4">Inspection Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-borderMuted/30 text-sm">
                        {safetyInspections.map(ins => {
                          const vessel = MARITIME_FLEET.find(v => v.vesselId === ins.vesselId);
                          const crewMember = crew.find(c => c.id === ins.assignedCrewId);
                          return (
                            <tr key={ins.equipmentId} className="hover:bg-panelLight/30">
                              <td className="py-3 px-4 text-textBright font-semibold">
                                {ins.name} <span className="text-textMuted text-xs font-normal">({vessel?.vesselName})</span>
                              </td>
                              <td className="py-3 px-4 text-textMuted">
                                {crewMember ? (
                                  <div className="flex flex-col">
                                    <span>{crewMember.name} ({crewMember.rank})</span>
                                    {crewMember.stcwStatus === "Expired" && (
                                      <span className="text-[10px] text-critical font-semibold uppercase mt-0.5">⚠️ STCW Expired - Blocked from Duty</span>
                                    )}
                                  </div>
                                ) : (
                                  "Unassigned"
                                )}
                              </td>
                              <td className="py-3 px-4 text-textMuted font-mono">{ins.lastInspectionDate}</td>
                              <td className="py-3 px-4 text-textMuted font-mono">{ins.expiryDate}</td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-0.5 rounded border text-xs font-semibold ${getStatusColor(ins.status)}`}>
                                  {ins.status}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <div className="inline-flex items-center space-x-2">
                                  {ins.status !== "Passed" ? (
                                    <div className="flex items-center space-x-2">
                                      {(crewMember as any)?.stcwStatus === "Expired" ? (
                                        <span className="text-xs text-textMuted bg-panel border border-borderMuted px-2.5 py-1 rounded cursor-not-allowed">Blocked</span>
                                      ) : (
                                        <label className="cursor-pointer px-2.5 py-1 bg-cyan-900/30 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-900/50 text-xs font-semibold rounded flex items-center space-x-1.5 transition-all">
                                          <Terminal className="h-3 w-3" />
                                          <span>Upload Evidence</span>
                                          <input
                                            type="file"
                                            disabled={(crewMember as any)?.stcwStatus === "Expired"}
                                            accept="image/*,.pdf"
                                            className="hidden"
                                            onChange={(e) => {
                                              if (e.target.files && e.target.files[0]) {
                                                const file = e.target.files[0];
                                                alert(`Evidence "${file.name}" uploaded successfully for ${ins.name}. Certificate unlocked.`);
                                                setSafetyInspections(prev => prev.map(i => i.equipmentId === ins.equipmentId ? { ...i, status: "Passed", lastInspectionDate: new Date().toISOString().split('T')[0] } : i));
                                              }
                                            }}
                                          />
                                        </label>
                                      )}
                                      {ins.status === "Failed" && (
                                        <button
                                          onClick={() => {
                                            alert(`Auto-dispatching maintenance Work Order for failed equipment: ${ins.name}`);
                                            const newWo: WorkOrderSeed = {
                                              id: `mar-wo-${Date.now()}`,
                                              assetId: ins.equipmentId,
                                              title: `Emergency Repair: ${ins.name}`,
                                              priority: "Critical",
                                              status: "New",
                                              assignedTeam: "Vessel Technical Crew",
                                              assignedPerson: crewMember?.name || "Onsite Duty Engineer",
                                              createdDate: new Date().toISOString().split('T')[0],
                                              dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                                              estimatedDuration: "4 Hours",
                                              requiredParts: [],
                                              notes: `Automatically generated due to safety inspection failure on ${ins.name}.`
                                            };
                                            setSeeds(prev => ({
                                              ...prev,
                                              maritime: {
                                                ...prev.maritime,
                                                workOrders: [newWo, ...prev.maritime.workOrders]
                                              }
                                            }));
                                          }}
                                          className="px-2.5 py-1 bg-critical/10 border border-critical/30 text-critical hover:bg-critical/20 text-xs font-semibold rounded"
                                        >
                                          Auto-Dispatch WO
                                        </button>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="flex items-center space-x-2">
                                      <span className="text-[10px] text-healthy bg-healthy/5 px-2 py-0.5 border border-healthy/20 rounded font-mono">Evidence OK</span>
                                      <button
                                        onClick={() => setSelectedCertEquipment(ins)}
                                        className="px-2.5 py-1 bg-gradient-to-r from-cyan-900 to-indigo-900 hover:opacity-90 text-white text-xs font-semibold rounded flex items-center space-x-1"
                                      >
                                        <FileText className="h-3 w-3" />
                                        <span>Download Cert</span>
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {currentIndustry === "maritime" && (
                <div className="bg-panel border border-borderMuted rounded-lg p-5">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-textMuted mb-4">Vessel Deficiencies & CAPA Corrective Actions</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-borderMuted text-xs text-textMuted uppercase font-mono">
                          <th className="py-3 px-4">Deficiency Ref</th>
                          <th className="py-3 px-4">Vessel ID</th>
                          <th className="py-3 px-4">Inspection Description</th>
                          <th className="py-3 px-4">Safety Category</th>
                          <th className="py-3 px-4">Severity</th>
                          <th className="py-3 px-4">CAPA Status</th>
                          <th className="py-3 px-4">Target Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-borderMuted/30 text-sm">
                        {deficiencies.map(def => (
                          <tr key={def.id} className="hover:bg-panelLight/30">
                            <td className="py-3 px-4 font-mono font-bold text-textBright">{def.id}</td>
                            <td className="py-3 px-4 text-textMuted">{def.vesselId}</td>
                            <td className="py-3 px-4 font-medium text-textBright">{def.title}</td>
                            <td className="py-3 px-4 text-textMuted">{def.category}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded border text-xs font-semibold ${getPriorityColor(def.severity)}`}>
                                {def.severity}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded border text-xs font-semibold ${getStatusColor(def.status)}`}>
                                {def.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-textMuted font-mono">{def.targetResolutionDate}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==================== PROCUREMENT & SUPPLY TAB ==================== */}
          {activeTab === "supply" && (
            <section className="bg-[#0B0D0F] rounded-2xl border border-white/[0.08] px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-10 shadow-2xl space-y-8">
              {/* Top Hero Section Intro */}
              <div className="flex flex-col justify-between gap-6 border-b border-white/[0.07] pb-6 xl:flex-row xl:items-end">
                <div className="space-y-2.5">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.09] bg-white/[0.03] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-[#3FC8D8]">
                    <Navigation className="h-3.5 w-3.5" />
                    01 — GLOBAL PROCUREMENT · PORT &amp; FREIGHT DELIVERY LOGISTICS
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                    Purchase Requests &amp; Port Delivery Console
                  </h1>
                  <p className="max-w-3xl text-sm leading-relaxed text-white/50">
                    Live tracking of critical engine spares, emergency kits, and berth delivery waybills with automated SAP integration.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      const newPo = {
                        poNumber: `MPO-${Math.floor(88409 + Math.random() * 100)}`,
                        vesselId: "vess-01 (Stellar Navigator)",
                        itemDescription: "Auxiliary Generator Lube Oil Injector Pack",
                        qtyRequested: 4,
                        status: "PR Approved" as const,
                        supplierName: "Industrial Spares Inc.",
                        portDestination: "Houston Port Terminal 3",
                        leadTimeDays: 4,
                        totalCost: 12800,
                        orderDate: new Date().toISOString().split('T')[0],
                        etaDate: new Date(Date.now() + 4*24*60*60*1000).toISOString().split('T')[0],
                        sku: "SKU-GEN-INJ-44",
                        priority: "High" as const
                      };
                      setSupplyOrders(prev => [newPo, ...prev]);
                    }}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 px-4 py-2.5 font-mono text-xs font-bold text-white transition-all hover:opacity-90 shadow-md"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Create Purchase Order</span>
                  </button>
                </div>
              </div>

              {/* Top 4 KPI Cards */}
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-white/[0.07] bg-[#FFFDFA]/[0.02] p-4 transition-all hover:border-white/[0.14]">
                  <div className="flex justify-between items-center">
                    <p className="font-mono text-[11px] uppercase tracking-[0.13em] text-white/40">Total PO Volume</p>
                    <span className="font-mono text-[10px] text-[#2FBF71] bg-[#2FBF71]/10 px-1.5 py-0.5 rounded border border-[#2FBF71]/30">SAP Live</span>
                  </div>
                  <p className="mt-3 text-[30px] font-semibold leading-none tracking-[-0.03em] text-white">
                    $168,800
                  </p>
                  <div className="mt-3 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-white/40">8 Active Orders</span>
                    <span className="text-[#2FBF71] font-bold">+12.4% MoM</span>
                  </div>
                </div>

                <div className="rounded-xl border border-white/[0.07] bg-[#FFFDFA]/[0.02] p-4 transition-all hover:border-white/[0.14]">
                  <div className="flex justify-between items-center">
                    <p className="font-mono text-[11px] uppercase tracking-[0.13em] text-white/40">In-Transit to Berth</p>
                    <Truck className="h-4 w-4 text-[#3FC8D8]" />
                  </div>
                  <p className="mt-3 text-[30px] font-semibold leading-none tracking-[-0.03em] text-white">
                    2 Orders
                  </p>
                  <div className="mt-3 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-white/40">Hamburg &amp; Houston</span>
                    <span className="text-[#3FC8D8] font-bold">98.2% On-Time</span>
                  </div>
                </div>

                <div className="rounded-xl border border-white/[0.07] bg-[#FFFDFA]/[0.02] p-4 transition-all hover:border-white/[0.14]">
                  <div className="flex justify-between items-center">
                    <p className="font-mono text-[11px] uppercase tracking-[0.13em] text-white/40">Pending Approvals</p>
                    <ClipboardList className="h-4 w-4 text-[#E8A33D]" />
                  </div>
                  <p className="mt-3 text-[30px] font-semibold leading-none tracking-[-0.03em] text-white">
                    2 Orders
                  </p>
                  <div className="mt-3 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-white/40">Ready for Signoff</span>
                    <span className="text-[#E8A33D] font-bold">$37,600 Est.</span>
                  </div>
                </div>

                <div className="rounded-xl border border-white/[0.07] bg-[#FFFDFA]/[0.02] p-4 transition-all hover:border-white/[0.14]">
                  <div className="flex justify-between items-center">
                    <p className="font-mono text-[11px] uppercase tracking-[0.13em] text-white/40">Supplier SLA Rate</p>
                    <Shield className="h-4 w-4 text-[#8B5CF6]" />
                  </div>
                  <p className="mt-3 text-[30px] font-semibold leading-none tracking-[-0.03em] text-white">
                    99.1%
                  </p>
                  <div className="mt-3 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-white/40">Certified Vendors</span>
                    <span className="text-[#8B5CF6] font-bold">4.8d Lead Time</span>
                  </div>
                </div>
              </div>

              {/* Main Table Shell */}
              <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#101315] shadow-2xl">
                {/* Table Control Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.07] bg-[#0E1113] px-5 py-4">
                  <div className="relative min-w-[280px] flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/40" />
                    <input
                      type="text"
                      value={supplySearch}
                      onChange={(e) => setSupplySearch(e.target.value)}
                      placeholder="Search PO#, Vessel, SKU, Port, Supplier..."
                      className="w-full pl-9 pr-3 py-2 rounded-lg border border-white/[0.1] bg-[#08090C] text-xs font-mono text-white placeholder:text-white/30 focus:outline-none focus:border-[#3FC8D8]"
                    />
                  </div>

                  {/* Status Filter Chips */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {["all", "PO Sent", "Port Delivery Pending", "PR Approved", "Draft"].map((st) => (
                      <button
                        key={st}
                        onClick={() => setSupplyStatusFilter(st)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                          supplyStatusFilter === st
                            ? "bg-[#3FC8D8] text-black font-bold shadow-md"
                            : "bg-white/[0.03] text-white/50 hover:text-white hover:bg-white/[0.06]"
                        }`}
                      >
                        {st === "all" ? "All Orders" : st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Data Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/[0.07] text-[11px] text-white/40 uppercase font-mono bg-white/[0.01]">
                        <th className="py-3 px-5 font-bold">PO Number &amp; SKU</th>
                        <th className="py-3 px-5 font-bold">Destination</th>
                        <th className="py-3 px-5 font-bold">Part Description</th>
                        <th className="py-3 px-5 font-bold">Qty &amp; Total ($)</th>
                        <th className="py-3 px-5 font-bold">Port &amp; ETA</th>
                        <th className="py-3 px-5 font-bold">Supplier</th>
                        <th className="py-3 px-5 font-bold">Status</th>
                        <th className="py-3 px-5 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.05] text-xs font-mono">
                      {supplyOrders
                        .filter(po => {
                          const matchesStatus = supplyStatusFilter === "all" || po.status === supplyStatusFilter;
                          const matchesSearch = supplySearch === "" ||
                            po.poNumber.toLowerCase().includes(supplySearch.toLowerCase()) ||
                            po.itemDescription.toLowerCase().includes(supplySearch.toLowerCase()) ||
                            po.vesselId.toLowerCase().includes(supplySearch.toLowerCase()) ||
                            po.supplierName.toLowerCase().includes(supplySearch.toLowerCase()) ||
                            po.portDestination.toLowerCase().includes(supplySearch.toLowerCase());
                          return matchesStatus && matchesSearch;
                        })
                        .map(po => {
                          const isDelivered = po.status === "Delivered";
                          const isPending = po.status === "Port Delivery Pending";
                          const isSent = po.status === "PO Sent";
                          const isApproved = po.status === "PR Approved";
                          
                          const badgeColor = isDelivered ? "#2FBF71" : isPending ? "#3FC8D8" : isSent ? "#8B5CF6" : "#E8A33D";

                          return (
                            <tr key={po.poNumber} className="hover:bg-white/[0.02] transition-colors">
                              <td className="py-4 px-5 font-bold">
                                <span className="block text-[#3FC8D8] font-bold">{po.poNumber}</span>
                                <span className="text-[10px] text-white/40 font-normal">{po.sku || "SKU-GENERIC"}</span>
                              </td>
                              <td className="py-4 px-5 text-white font-semibold">{po.vesselId}</td>
                              <td className="py-4 px-5 text-white">
                                <span className="block font-bold">{po.itemDescription}</span>
                                <span className="text-[10.5px] text-white/40">Order Date: {po.orderDate || "2026-08-20"}</span>
                              </td>
                              <td className="py-4 px-5 text-white">
                                <span className="font-bold">{po.qtyRequested} units</span>
                                <span className="block text-[#2FBF71] font-bold">${(po.totalCost || (po.qtyRequested * 2400)).toLocaleString()}</span>
                              </td>
                              <td className="py-4 px-5 text-white">
                                <span className="block font-bold">{po.portDestination}</span>
                                <span className="text-[10.5px] text-white/40">ETA: {po.etaDate || "2026-08-27"} ({po.leadTimeDays}d lead)</span>
                              </td>
                              <td className="py-4 px-5 text-white/60">{po.supplierName}</td>
                              <td className="py-4 px-5">
                                <span
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-bold"
                                  style={{
                                    color: badgeColor,
                                    backgroundColor: `${badgeColor}15`,
                                    border: `1px solid ${badgeColor}40`
                                  }}
                                >
                                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: badgeColor }} />
                                  <span>{po.status}</span>
                                </span>
                              </td>
                              <td className="py-4 px-5 text-right space-x-2 whitespace-nowrap">
                                <button
                                  onClick={() => setSelectedTrackPo(po)}
                                  className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-[#3FC8D8] border border-[#3FC8D8]/30 font-bold text-[11px] transition-all"
                                >
                                  Track Delivery
                                </button>
                                {po.status === "PR Approved" && (
                                  <button
                                    onClick={() => {
                                      setSupplyOrders(prev => prev.map(o => o.poNumber === po.poNumber ? { ...o, status: "PO Sent" } : o));
                                    }}
                                    className="px-3 py-1.5 rounded-lg bg-[#2FBF71]/10 hover:bg-[#2FBF71]/20 text-[#2FBF71] border border-[#2FBF71]/30 font-bold text-[11px] transition-all"
                                  >
                                    Dispatch PO
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Delivery Waypoint Tracker Drawer / Modal */}
              {selectedTrackPo && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="bg-[#101315] border border-white/[0.1] rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl text-white">
                    <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                      <div>
                        <span className="text-[10px] font-mono uppercase font-bold text-white/40 block">Port Delivery Waypoint Tracker</span>
                        <h3 className="font-bold text-sm font-mono text-[#3FC8D8]">{selectedTrackPo.poNumber} · {selectedTrackPo.itemDescription}</h3>
                      </div>
                      <button onClick={() => setSelectedTrackPo(null)} className="h-7 w-7 rounded-full bg-white/[0.06] text-white/60 hover:text-white flex items-center justify-center">✕</button>
                    </div>

                    <div className="space-y-4 text-xs font-mono">
                      <div className="p-3.5 rounded-xl bg-[#08090C] border border-white/[0.06] space-y-1.5">
                        <p className="flex justify-between"><span className="text-white/40">Destination:</span> <span className="font-bold text-white">{selectedTrackPo.vesselId}</span></p>
                        <p className="flex justify-between"><span className="text-white/40">Port Terminal:</span> <span className="font-bold text-white">{selectedTrackPo.portDestination}</span></p>
                        <p className="flex justify-between"><span className="text-white/40">Estimated Berth Delivery:</span> <span className="font-bold text-[#2FBF71]">{selectedTrackPo.etaDate || "2026-08-26"}</span></p>
                        <p className="flex justify-between"><span className="text-white/40">Total Valuation:</span> <span className="font-bold text-white">${(selectedTrackPo.totalCost || 18400).toLocaleString()}</span></p>
                      </div>

                      {/* Timeline Waypoint Steps */}
                      <div className="space-y-3 pt-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-white/40">Live Logistics Pipeline:</span>
                        <div className="space-y-2.5">
                          <div className="flex items-center gap-3">
                            <span className="h-6 w-6 rounded-full bg-[#2FBF71] text-black flex items-center justify-center font-bold text-[10px]">✓</span>
                            <div>
                              <p className="font-bold text-white">PR Authorized &amp; SAP PO Dispatched</p>
                              <p className="text-[10.5px] text-white/40">Electronic EDI transmitted to {selectedTrackPo.supplierName}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="h-6 w-6 rounded-full bg-[#2FBF71] text-black flex items-center justify-center font-bold text-[10px]">✓</span>
                            <div>
                              <p className="font-bold text-white">Customs Clearance &amp; Port Gate Check-In</p>
                              <p className="text-[10.5px] text-white/40">Cleared through {selectedTrackPo.portDestination} Terminal Inspection</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="h-6 w-6 rounded-full bg-[#3FC8D8] animate-pulse text-black flex items-center justify-center font-bold text-[10px]">●</span>
                            <div>
                              <p className="font-bold text-[#3FC8D8]">Final Berth Transit (Barge / Crane Load)</p>
                              <p className="text-[10.5px] text-white/40">Scheduled for shipside handover upon vessel mooring</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/[0.08] flex justify-end">
                      <button
                        onClick={() => setSelectedTrackPo(null)}
                        className="px-4 py-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-white text-xs font-mono font-bold transition-all"
                      >
                        Close Tracker
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* ==================== CREW OPERATIONS TAB (Maritime Only) ==================== */}
          {activeTab === "crew" && (
            <div className="space-y-6">
              <div className="bg-panel border border-borderMuted rounded-lg p-5">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-textMuted mb-4">Crew Assignments, Certification Roster & Task Checklists</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-borderMuted text-xs text-textMuted uppercase font-mono">
                        <th className="py-3 px-4">Crew Member</th>
                        <th className="py-3 px-4">Rank / Role</th>
                        <th className="py-3 px-4">Assigned Vessel</th>
                        <th className="py-3 px-4">STCW Certificate</th>
                        <th className="py-3 px-4">Current Task Assignment</th>
                        <th className="py-3 px-4">Safety Checklist</th>
                        <th className="py-3 px-4">Photo / Evidence Check</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-borderMuted/30 text-sm">
                      {crew.map(member => (
                        <tr key={member.id} className="hover:bg-panelLight/30">
                          <td className="py-3 px-4 font-semibold text-textBright">{member.name}</td>
                          <td className="py-3 px-4 text-textMuted">{member.rank}</td>
                          <td className="py-3 px-4 text-textMuted font-mono">{member.vesselId}</td>
                          <td className="py-3 px-4 font-mono text-xs">
                            <span className={`px-2 py-0.5 rounded border mr-2 font-semibold ${member.stcwStatus === "Valid" ? "border-healthy/30 text-healthy bg-healthy/5" : "border-critical/30 text-critical bg-critical/5"}`}>
                              {member.stcwStatus}
                            </span>
                            <span className="text-textMuted">{member.certificateNo}</span>
                          </td>
                          <td className="py-3 px-4 text-textBright">{member.currentTask}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2.5 py-0.5 rounded border text-xs font-semibold ${member.safetyChecklistCompleted ? "border-healthy/30 text-healthy bg-healthy/5" : "border-critical/30 text-critical bg-critical/5"}`}>
                              {member.safetyChecklistCompleted ? "Passed" : "Pending"}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2.5 py-0.5 rounded border text-xs font-semibold ${member.evidenceUploaded ? "border-healthy/30 text-healthy bg-healthy/5" : "border-critical/30 text-critical bg-critical/5"}`}>
                              {member.evidenceUploaded ? "Uploaded" : "Missing"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==================== AI COPILOT PAGE ==================== */}
          {activeTab === "ai-copilot" && (
            <div className="space-y-6">
              <div className="bg-[#090d0a] border border-emerald-500/20 rounded-lg p-6 glow-card">
                <div className="flex items-center space-x-3 border-b border-borderMuted/30 pb-4 mb-4">
                  <div className="h-10 w-10 rounded bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white">
                    <MessageSquare className="h-6 w-6 animate-pulse" />
                  </div>
                  <div>
                    <h2 className="text-md font-bold text-textBright">SCIO AI Copilot Terminal</h2>
                    <p className="text-xs text-textMuted font-mono">Autonomous Diagnostic & Safety Analysis Engine</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-1 space-y-4">
                    <div className="bg-panelLight/40 p-4 border border-borderMuted/50 rounded-lg space-y-3">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-textMuted font-mono">Select Diagnostic Script</h3>

                      <button
                        onClick={() => {
                          setCopilotQuery("Run Voyage Fuel Efficiency Scan");
                          setCopilotResponse("Checking vessel speeds, charter cost projections, and bunker logs...\n\nDiagnostic Output:\n- SCIO Ocean 01: Burn rate 24 MT/day. Cost efficiency index: 94%.\n- SCIO Carrier 02: Engine load 82% at 0kts in port. Auxiliary Gen 2 shows fuel leakage. ACTION: Resolve leakage to avoid $1,200/day energy loss.\n\nReady for input.");
                        }}
                        className="w-full text-left p-3 bg-panel hover:bg-panelLight border border-borderMuted rounded-lg text-xs font-semibold text-textBright block transition-all"
                      >
                        ⚡ Run Voyage Fuel Efficiency Scan
                      </button>

                      <button
                        onClick={() => {
                          setCopilotQuery("Validate Crew STCW Expiries");
                          setCopilotResponse("Scanning crew database & certificate expiration arrays...\n\nDiagnostic Output:\n- WARNING: Second Mate Elena Rostova credentials expired (STCW-2024-O021).\n- ACTION: Gating validation active. Elena is blocked from duty.\n\nReady for input.");
                        }}
                        className="w-full text-left p-3 bg-panel hover:bg-panelLight border border-borderMuted rounded-lg text-xs font-semibold text-textBright block transition-all"
                      >
                        👮 Validate Crew STCW Expiries
                      </button>

                      <button
                        onClick={() => {
                          setCopilotQuery("Check Cargo Temp Spikes");
                          setCopilotResponse("Connecting to vessel cargo temperature telemetry sensors...\n\nDiagnostic Output:\n- Hold 1: -18.2°C (Healthy)\n- Hold 2: -18.5°C (Healthy)\n- Hold 3: -12.4°C (WARNING - Temperature spike +6.1°C detected). Potential compressor blockage. ACTION: Check bilge pump BP-04.\n\nReady for input.");
                        }}
                        className="w-full text-left p-3 bg-panel hover:bg-panelLight border border-borderMuted rounded-lg text-xs font-semibold text-textBright block transition-all"
                      >
                        🌡️ Check Cargo Temp Spikes
                      </button>
                    </div>
                  </div>

                  <div className="lg:col-span-2 space-y-4">
                    <div className="bg-black border border-borderMuted rounded-lg p-4 h-96 flex flex-col font-mono text-xs text-healthy">
                      <div className="flex justify-between items-center border-b border-borderMuted/30 pb-2 mb-2 text-textMuted">
                        <span>Terminal Output Console</span>
                        <span>SCIO OS v1.0.9</span>
                      </div>

                      <div className="flex-1 overflow-y-auto space-y-4 p-2">
                        <div>
                          <span className="text-emerald-400">guest@scio-hq:~$ </span>
                          <span className="text-textBright">{copilotQuery || "Waiting for diagnostic input..."}</span>
                        </div>
                        {copilotResponse && (
                          <div className="whitespace-pre-line text-textBright bg-[#0b0c10] border border-borderMuted/50 p-3 rounded leading-relaxed">
                            {copilotResponse}
                          </div>
                        )}
                      </div>

                      <div className="border-t border-borderMuted/30 pt-3 flex items-center space-x-2">
                        <span className="text-emerald-400">~$ </span>
                        <input
                          type="text"
                          value={copilotQuery}
                          onChange={(e) => setCopilotQuery(e.target.value)}
                          placeholder="Type AI command here..."
                          className="flex-1 bg-transparent border-0 outline-none focus:ring-0 text-textBright"
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && copilotQuery) {
                              setCopilotResponse(`Processing command: "${copilotQuery}"...\n\nAI Diagnostic Result:\nNo critical system failures found on active assets.`);
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== SUPPLIERS TAB ==================== */}
          {activeTab === "suppliers" && (
            <div className="space-y-6">
              <div className="bg-panel border border-borderMuted rounded-lg p-5">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-textMuted mb-4">Critical Supplier Risk Matrix</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-borderMuted text-xs text-textMuted uppercase font-mono">
                        <th className="py-3 px-4">Supplier Name</th>
                        <th className="py-3 px-4">Sourcing Category</th>
                        <th className="py-3 px-4">On-Time Delivery</th>
                        <th className="py-3 px-4">Quality Rating</th>
                        <th className="py-3 px-4">Sourcing Risk</th>
                        <th className="py-3 px-4">Lead Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-borderMuted/30 text-sm">
                      {SUPPLIERS.map(sup => (
                        <tr key={sup.id} className="hover:bg-panelLight/30">
                          <td className="py-3 px-4 font-semibold text-textBright">{sup.name}</td>
                          <td className="py-3 px-4 text-textMuted">{sup.category}</td>
                          <td className="py-3 px-4 font-mono font-semibold">{sup.ontimeDeliveryRate}%</td>
                          <td className="py-3 px-4 font-mono font-semibold">{sup.qualityScore}%</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded border text-xs font-semibold ${getPriorityColor(sup.riskLevel)}`}>
                              {sup.riskLevel}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-textMuted font-mono">{sup.leadTimeDays} Days</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ==================== AI COPILOT GENERATIVE VISUAL PANEL ==================== */}
      <GenerativeVisualCopilot
        isOpen={copilotOpen}
        onClose={() => setCopilotOpen(false)}
        currentIndustry={currentIndustry}
        onNavigateTab={(tab) => setActiveTab(tab)}
      />

      {/* ==================== CREATE WORK ORDER MODAL ==================== */}
      {createWoModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-panel border border-borderMuted rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-borderMuted pb-3">
              <h3 className="font-semibold text-textBright">Create Enterprise Work Order</h3>
              <button onClick={() => setCreateWoModalOpen(false)} className="text-textMuted hover:text-textBright">✕</button>
            </div>

            <form onSubmit={handleCreateWorkOrder} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-textMuted block">Work Order Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Inspect Joint 3 Bearing"
                  value={newWoTitle}
                  onChange={(e) => setNewWoTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-borderMuted rounded-lg focus:outline-none text-textBright"
                />
              </div>

              <div className="space-y-1">
                <label className="text-textMuted block">Target Asset ID or Unit</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. nrg-ast-1"
                  value={newWoAssetId}
                  onChange={(e) => setNewWoAssetId(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-borderMuted rounded-lg focus:outline-none text-textBright"
                />
              </div>

              <div className="space-y-1">
                <label className="text-textMuted block">Priority Level</label>
                <select
                  value={newWoPriority}
                  onChange={(e) => setNewWoPriority(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-borderMuted rounded-lg focus:outline-none text-textBright"
                >
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-textMuted block">Maintenance Task Notes</label>
                <textarea
                  placeholder="Specify task instructions..."
                  rows={3}
                  value={newWoNotes}
                  onChange={(e) => setNewWoNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-borderMuted rounded-lg focus:outline-none text-textBright"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={() => setCreateWoModalOpen(false)} className="px-4 py-2 bg-background border border-borderMuted hover:border-textMuted rounded-lg font-semibold">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:opacity-90 rounded-lg text-white font-bold">
                  Dispatch Crew
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== REPORT SAFETY DEFICIENCY MODAL ==================== */}
      {deficiencyModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-panel border border-borderMuted rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-borderMuted pb-3">
              <h3 className="font-semibold text-textBright">Report Safety / Machinery Deficiency</h3>
              <button onClick={() => setDeficiencyModalOpen(false)} className="text-textMuted hover:text-textBright">✕</button>
            </div>

            <form onSubmit={handleCreateDeficiency} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-textMuted block">Deficiency Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Windlass Brake Wear"
                  value={newDefTitle}
                  onChange={(e) => setNewDefTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-borderMuted rounded-lg focus:outline-none text-textBright"
                />
              </div>

              <div className="space-y-1">
                <label className="text-textMuted block">Assigned Vessel</label>
                <select
                  value={newDefVesselId}
                  onChange={(e) => setNewDefVesselId(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-borderMuted rounded-lg focus:outline-none text-textBright"
                >
                  {MARITIME_FLEET.map(v => (
                    <option key={v.vesselId} value={v.vesselId}>{v.vesselName}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-textMuted block">Defect Category</label>
                <select
                  value={newDefCategory}
                  onChange={(e) => setNewDefCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-borderMuted rounded-lg focus:outline-none text-textBright"
                >
                  <option value="Machinery">Machinery</option>
                  <option value="Safety">Safety</option>
                  <option value="Fire Safety">Fire Safety</option>
                  <option value="Lifesaving">Lifesaving</option>
                  <option value="Navigation">Navigation</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-textMuted block">Severity</label>
                <select
                  value={newDefSeverity}
                  onChange={(e) => setNewDefSeverity(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-borderMuted rounded-lg focus:outline-none text-textBright"
                >
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={() => setDeficiencyModalOpen(false)} className="px-4 py-2 bg-background border border-borderMuted hover:border-textMuted rounded-lg font-semibold">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:opacity-90 rounded-lg text-white font-bold">
                  File Defect Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== SAFETY EQUIPMENT COMPLIANCE CERTIFICATE MODAL ==================== */}
      {selectedCertEquipment && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div id="printable-certificate-modal" className="bg-panel border border-borderMuted rounded-xl max-w-lg w-full overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-borderMuted/30 pb-3">
              <span className="text-xs font-mono text-cyan-400 flex items-center space-x-1.5">
                <Shield className="h-4 w-4" />
                <span>Marine Safety Equipment Inspection Certificate</span>
              </span>
              <button onClick={() => setSelectedCertEquipment(null)} className="text-textMuted hover:text-textBright print:hidden">✕</button>
            </div>

            <div className="space-y-4">
              <div className="border border-cyan-500/20 bg-cyan-950/10 p-5 rounded-lg text-center space-y-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl" />
                <Anchor className="h-10 w-10 text-cyan-500 mx-auto opacity-75" />
                <h4 className="text-base font-bold text-textBright tracking-wide uppercase">Marine Safety Equipment Certification</h4>
                <div className="text-xs text-textMuted font-mono">Reg ID: CERT-{selectedCertEquipment.equipmentId.toUpperCase()}</div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <span className="text-textMuted block">Equipment Name:</span>
                  <span className="font-semibold text-textBright">{selectedCertEquipment.name}</span>
                </div>
                <div>
                  <span className="text-textMuted block">Inspection Date:</span>
                  <span className="font-semibold text-textBright">{selectedCertEquipment.lastInspectionDate}</span>
                </div>
                <div>
                  <span className="text-textMuted block">Validity Threshold:</span>
                  <span className="font-semibold text-textBright">{selectedCertEquipment.expiryDate}</span>
                </div>
                <div>
                  <span className="text-textMuted block">Class Authority:</span>
                  <span className="font-semibold text-textBright">IMO Class Verification SCIO</span>
                </div>
              </div>

              <div className="pt-2 border-t border-borderMuted/30 flex justify-end space-x-3 print:hidden">
                <button
                  type="button"
                  onClick={() => setSelectedCertEquipment(null)}
                  className="px-4 py-2 bg-background border border-borderMuted hover:border-textMuted rounded-lg text-xs font-semibold"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:opacity-90 rounded-lg text-xs font-bold text-white flex items-center space-x-1"
                >
                  <Download className="h-3 w-3" />
                  <span>Print / Save as PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== COMMAND PALETTE (CTRL+K) MODAL OVERLAY ==================== */}
      {commandPaletteOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-panel border border-borderMuted rounded-xl max-w-lg w-full overflow-hidden shadow-2xl">
            <div className="h-12 border-b border-borderMuted px-4 flex items-center justify-between bg-panelLight/40">
              <span className="text-xs font-mono text-textMuted flex items-center space-x-2">
                <Terminal className="h-4 w-4 text-emerald-400" />
                <span>SCIO Platform Command Console</span>
              </span>
              <kbd className="text-[10px] text-textMuted bg-background px-1.5 py-0.5 rounded border border-borderMuted">ESC to Close</kbd>
            </div>

            <div className="p-2 max-h-80 overflow-y-auto divide-y divide-borderMuted/30">
              <div className="py-2.5">
                <span className="px-2 text-[10px] uppercase text-textMuted tracking-wider font-semibold block mb-1">Switch Operations Workspace</span>
                {[
                  { id: "manufacturing", name: "Switch to Manufacturing Workspace" },
                  { id: "maritime", name: "Switch to Maritime Workspace" },
                  { id: "energy", name: "Switch to Utilities & Energy Workspace" },
                  { id: "logistics", name: "Switch to Logistics & Distribution Workspace" }
                ].map(action => (
                  <button
                    key={action.id}
                    onClick={() => {
                      setCurrentIndustry(action.id);
                      setActiveTab(action.id === "energy" ? "energy-dashboard" : "dashboard");
                      setCommandPaletteOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded hover:bg-panelLight/60 text-xs text-textBright flex justify-between items-center transition-all"
                  >
                    <span>{action.name}</span>
                    <span className="text-[10px] text-textMuted">Workspace</span>
                  </button>
                ))}
              </div>

              <div className="py-2.5">
                <span className="px-2 text-[10px] uppercase text-textMuted tracking-wider font-semibold block mb-1">Jump to View Screen</span>
                {[
                  { id: "dashboard", name: "Go to Control Center Dashboard" },
                  { id: "assets", name: "Go to Assets Telemetry List" },
                  { id: "work-orders", name: "Go to Active Work Orders Console" }
                ].map(action => (
                  <button
                    key={action.id}
                    onClick={() => {
                      setActiveTab(action.id);
                      setCommandPaletteOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded hover:bg-panelLight/60 text-xs text-textBright flex justify-between items-center transition-all"
                  >
                    <span>{action.name}</span>
                    <span className="text-[10px] text-textMuted">Navigation</span>
                  </button>
                ))}
              </div>

              <div className="py-2.5">
                <span className="px-2 text-[10px] uppercase text-textMuted tracking-wider font-semibold block mb-1">Command Actions</span>
                <button
                  onClick={() => {
                    setCommandPaletteOpen(false);
                    setCreateWoModalOpen(true);
                  }}
                  className="w-full text-left px-3 py-2 rounded hover:bg-panelLight/60 text-xs text-textBright flex justify-between items-center transition-all"
                >
                  <span>Dispatch New Emergency Work Order Crew</span>
                  <span className="text-[10px] text-textMuted">Action</span>
                </button>
                <button
                  onClick={() => {
                    setCommandPaletteOpen(false);
                    setCopilotOpen(true);
                  }}
                  className="w-full text-left px-3 py-2 rounded hover:bg-panelLight/60 text-xs text-textBright flex justify-between items-center transition-all"
                >
                  <span>Toggle AI Assistant Copilot Drawer</span>
                  <span className="text-[10px] text-textMuted">AI Agent</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== 24/7 SCIO SENTINEL AI ORB COMPANION ==================== */}
      <ScioSentinelOrb
        onLaunchPlatform={handleLaunchPlatform}
        currentIndustry={(viewMode as string) === "landing" ? "home" : currentIndustry}
        activeTab={activeTab}
        isCopilotOpenTrigger={copilotOpen}
        onCloseCopilot={() => setCopilotOpen(false)}
      />

    </div>
  );
}
