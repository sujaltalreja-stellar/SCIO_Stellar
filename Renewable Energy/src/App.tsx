import { useState, useEffect } from "react";
import AppLayout from "./components/layout/AppLayout";
import DashboardOverview from "./components/dashboard/DashboardOverview";
import GISMapView from "./components/map/GISMapView";
import PlantDirectory from "./components/plants/PlantDirectory";
import PlantDetailsView from "./components/plants/PlantDetailsView";
import AssetRegistry from "./components/assets/AssetRegistry";
import AlarmConsole from "./components/alarms/AlarmConsole";
import WeatherMonitor from "./components/weather/WeatherMonitor";
import ReportingModule from "./components/reports/ReportingModule";
import AuditTrail from "./components/audit/AuditTrail";
import AIOpsControl from "./components/ai/AIOpsControl";
import FieldOpsControl from "./components/field/FieldOpsControl";
import InspectionsHub from "./components/field/InspectionsHub";
import ProcurementModule from "./components/procurement/ProcurementModule";
import InventoryModule from "./components/inventory/InventoryModule";
import FinanceModule from "./components/finance/FinanceModule";
import ERPSyncHub from "./components/erp/ERPSyncHub";

import { useMutation } from "./lib/convex";
import { api } from "./lib/convex";

function App() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);

  const triggerSimulation = useMutation(api.metrics.simulateLiveTelemetry);

  // Live SCADA simulation loop - runs every 5 seconds
  useEffect(() => {
    // Run simulation tick immediately on load
    triggerSimulation();

    const interval = setInterval(() => {
      triggerSimulation();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Helper to handle plant selection from other tabs
  const handleSelectPlant = (plantId: string) => {
    setSelectedPlantId(plantId);
    setActiveTab("plant-detail");
  };

  const renderContent = () => {
    if (activeTab === "plant-detail" && selectedPlantId) {
      return (
        <PlantDetailsView
          plantId={selectedPlantId}
          onBack={() => {
            setSelectedPlantId(null);
            setActiveTab("plants");
          }}
          onSelectAsset={(assetId) => {
            setActiveTab("assets");
          }}
        />
      );
    }

    switch (activeTab) {
      case "dashboard":
        return <DashboardOverview onSelectPlant={handleSelectPlant} />;
      case "map":
        return <GISMapView onSelectPlant={handleSelectPlant} />;
      case "plants":
        return <PlantDirectory onSelectPlant={handleSelectPlant} />;
      case "assets":
        return <AssetRegistry />;
      case "alarms":
        return <AlarmConsole onSelectPlant={handleSelectPlant} />;
      case "weather":
        return <WeatherMonitor onSelectPlant={handleSelectPlant} />;
      case "ai-ops":
        return <AIOpsControl />;
      case "field-ops":
        return <FieldOpsControl />;
      case "inspections":
        return <InspectionsHub />;
      case "reports":
        return <ReportingModule />;
      case "audit":
        return <AuditTrail />;
      case "erp-sync":
        return <ERPSyncHub />;

      default:
        return <DashboardOverview onSelectPlant={handleSelectPlant} />;
    }
  };

  return (
    <AppLayout
      activeTab={activeTab}
      setActiveTab={(tab) => {
        setSelectedPlantId(null);
        setActiveTab(tab);
      }}
    >
      {renderContent()}
    </AppLayout>
  );
}

export default App;
