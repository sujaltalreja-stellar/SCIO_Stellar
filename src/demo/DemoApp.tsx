import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { DemoAuthProvider, RequireDemoAuth } from "./auth";
import { ApprovalProvider } from "./components/Approval";
import DemoShell from "./layout/DemoShell";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import AskPage from "./pages/AskPage";
import InventoryPage from "./pages/InventoryPage";
import MaintenancePage from "./pages/MaintenancePage";
import VisionPage from "./pages/VisionPage";
import DocumentsPage from "./pages/DocumentsPage";
import AssetsPage from "./pages/AssetsPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
import { ThemeProvider } from "./theme";
import { ConvexProvider } from "convex/react";
import { convex } from "./convexClient";
import { DataGate } from "./DataGate";
import "./demo.css";
import "./theme-dark.css";

const RetailApp = React.lazy(() => import("./retail/RetailApp"));

// SCIO application, mounted at /demo/* (not linked from the public site).
export default function DemoApp() {
  return (
    <ConvexProvider client={convex}>
      <ThemeProvider>
        <DemoAuthProvider>
          <Routes>
            <Route path="login" element={<LoginPage />} />
            <Route
              path="retail/*"
              element={
                <RequireDemoAuth>
                  <DataGate retail>
                    <ApprovalProvider>
                      <React.Suspense
                        fallback={
                          <div className="flex min-h-screen items-center justify-center bg-[var(--scio-page)] text-sm text-slate-500">
                            Loading SCIO Retail OS…
                          </div>
                        }
                      >
                        <RetailApp />
                      </React.Suspense>
                    </ApprovalProvider>
                  </DataGate>
                </RequireDemoAuth>
              }
            />
            <Route
              element={
                <RequireDemoAuth>
                  <DataGate>
                    <ApprovalProvider>
                      <DemoShell />
                    </ApprovalProvider>
                  </DataGate>
                </RequireDemoAuth>
              }
            >
              <Route index element={<HomePage />} />
              <Route path="ask" element={<AskPage />} />
              <Route
                path="inventory"
                element={<InventoryPage mode="inventory" />}
              />
              <Route
                path="procurement"
                element={<InventoryPage mode="procurement" />}
              />
              <Route path="maintenance" element={<MaintenancePage />} />
              <Route path="assets" element={<AssetsPage />} />
              <Route path="vision" element={<VisionPage />} />
              <Route path="documents" element={<DocumentsPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/app" replace />} />
          </Routes>
        </DemoAuthProvider>
      </ThemeProvider>
    </ConvexProvider>
  );
}
