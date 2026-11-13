import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { PackageX, Layers, ArrowLeftRight, Store, Truck, CalendarClock, Refrigerator, Wallet } from "lucide-react";
import { RetailProvider, useRetail } from "./RetailContext";
import DemoShell from "../layout/DemoShell";
import AskPage from "../pages/AskPage";
import DocumentsPage from "../pages/DocumentsPage";
import RetailDashboard from "./pages/RetailDashboard";
import RetailHome from "./pages/RetailHome";
import ActionsPage from "./pages/ActionsPage";
import OperatePage from "./pages/OperatePage";
import StoresPage from "./pages/StoresPage";
import SkuPage from "./pages/SkuPage";
import ReplenishmentPage from "./pages/ReplenishmentPage";
import ProcurementPage from "./pages/ProcurementPage";
import SuppliersPage from "./pages/SuppliersPage";
import TransfersPage from "./pages/TransfersPage";
import { MaintenancePage, AssetsPage } from "./pages/EquipmentPages";
import InspectionPage from "./pages/InspectionPage";
import RetailReports from "./pages/RetailReports";
import RetailSettings from "./pages/RetailSettings";
import MetricDashboard from "./pages/MetricDashboard";
import MasterDashboard from "./pages/MasterDashboard";
import { buildRetailInbox } from "./documents";
import { PageTitle } from "./rui";

const SUGGESTIONS = [
  { icon: PackageX, q: "Which stores will run out of stock this week?" },
  { icon: Layers, q: "Which SKUs are overstocked?" },
  { icon: ArrowLeftRight, q: "Which products should be transferred between stores?" },
  { icon: Store, q: "Why is Store 118 losing sales?" },
  { icon: Truck, q: "Which suppliers are delivering late?" },
  { icon: CalendarClock, q: "Which products will expire within 15 days?" },
  { icon: Refrigerator, q: "Which equipment faults are putting stock at risk?" },
  { icon: Wallet, q: "Give me today's retail overview." },
];

function RetailAsk() {
  const { state, scope } = useRetail();
  return (
    <AskPage
      endpoint="/api/scio/retail-copilot"
      suggestions={SUGGESTIONS}
      intro="SCIO reads live store stock, sales velocity, suppliers, batches and equipment, including the actions you've taken, then answers with evidence and recommended actions."
      extraBody={() => ({ events: state.events, scope: scope ? [...scope] : null })}
    />
  );
}

function RetailDocuments() {
  const { state } = useRetail();
  const docs = React.useMemo(() => buildRetailInbox(state.base), [state.base]);
  return <DocumentsPage docs={docs} sector="retail" />;
}

// SCIO Retail OS, mounted at /demo/retail/*
export default function RetailApp() {
  return (
    <RetailProvider>
      <Routes>
        <Route element={<DemoShell />}>
          <Route index element={<RetailHome />} />
          <Route path="actions" element={<ActionsPage />} />
          <Route path="operate" element={<Navigate to="/app/retail/ask" replace />} />
          <Route path="command-center" element={<RetailDashboard />} />
          <Route path="master" element={<MasterDashboard />} />
          <Route path="insights/:metric" element={<MetricDashboard />} />
          <Route path="ask" element={<OperatePage />} />
          <Route path="ask/classic" element={<RetailAsk />} />
          <Route path="stores" element={<StoresPage />} />
          <Route path="stores/:id" element={<StoresPage />} />
          <Route path="skus" element={<SkuPage />} />
          <Route path="replenishment" element={<ReplenishmentPage />} />
          <Route path="procurement" element={<ProcurementPage />} />
          <Route path="suppliers" element={<SuppliersPage />} />
          <Route path="transfers" element={<TransfersPage />} />
          <Route path="maintenance" element={<MaintenancePage />} />
          <Route path="assets" element={<AssetsPage />} />
          <Route path="inspection" element={<InspectionPage />} />
          <Route path="documents" element={<RetailDocuments />} />
          <Route path="reports" element={<RetailReports />} />
          <Route path="settings" element={<RetailSettings />} />
          <Route path="*" element={<div className="py-20"><PageTitle title="Not found" sub="This retail page does not exist." /></div>} />
        </Route>
        <Route path="*" element={<Navigate to="/app/retail" replace />} />
      </Routes>
    </RetailProvider>
  );
}
