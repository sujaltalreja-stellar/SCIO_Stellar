import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
// Every page is loaded on demand, so /app (the SCIO application) doesn't download
// the marketing site and industry dashboards, and vice versa.
import { lazyWithReload } from "./lazyWithReload";
const App = lazyWithReload(() => import("./app/page"));
const ContactPage = lazyWithReload(() => import("./app/contact/page"));
const IndustryDetailPage = lazyWithReload(() => import("./app/industries/[id]/page")) as unknown as React.ComponentType<{ params: Promise<{ id: string }> }>;
const DemoApp = lazyWithReload(() => import("./demo/DemoApp"));
const sitePage = (name: "PlatformPage" | "ControlTowerPage" | "IntegrationsPage" | "IndustriesPage" | "WhyScioPage" | "CustomersPage" | "FaqPage") =>
  lazyWithReload(() => import("./app/site/pages").then((m) => ({ default: m[name] })));
const PlatformPage = sitePage("PlatformPage");
const ControlTowerPage = sitePage("ControlTowerPage");
const IntegrationsPage = sitePage("IntegrationsPage");
const IndustriesPage = sitePage("IndustriesPage");
const WhyScioPage = sitePage("WhyScioPage");
const CustomersPage = sitePage("CustomersPage");
const FaqPage = sitePage("FaqPage");

function PageLoader({ dark = false }: { dark?: boolean }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex min-h-screen flex-col items-center justify-center gap-4 ${
        dark ? "bg-[#0a0d14] text-slate-300" : "bg-white text-slate-600"
      }`}
    >
      <span className="h-9 w-9 animate-spin rounded-full border-[3px] border-current border-t-transparent opacity-70" />
      <span className="text-sm font-medium">Loading SCIO…</span>
    </div>
  );
}

function IndustryDetailRouteWrapper() {
  const params = useParams<{ id: string }>();
  return <IndustryDetailPage params={Promise.resolve({ id: params.id || "" })} />;
}

function LegacyRedirect() {
  const params = useParams();
  return <Navigate to={`/app/${params["*"] ?? ""}`} replace />;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main Application (Landing, OCC Control Center, Resources) */}
        <Route path="/" element={<App />} />

        {/* Marketing subpages */}
        <Route path="/platform" element={<PlatformPage />} />
        <Route path="/platform/control-tower" element={<ControlTowerPage />} />
        <Route path="/platform/integrations" element={<IntegrationsPage />} />
        <Route path="/industries" element={<IndustriesPage />} />
        <Route path="/why-scio" element={<WhyScioPage />} />
        <Route path="/customers" element={<CustomersPage />} />
        <Route path="/faq" element={<FaqPage />} />

        {/* Contact Page */}
        <Route path="/contact" element={<ContactPage />} />

        {/* SCIO application (unlisted; reachable only by URL). Old /demo links redirect here. */}
        <Route path="/demo/*" element={<LegacyRedirect />} />
        <Route
          path="/app/*"
          element={
            <React.Suspense fallback={<PageLoader dark />}>
              <DemoApp />
            </React.Suspense>
          }
        />

        {/* Dynamic Industry Pages */}
        <Route path="/industries/:id" element={<IndustryDetailRouteWrapper />} />

        {/* Redirect Routes matching next.config.mjs */}
        <Route path="/energy" element={<Navigate to="/?industry=energy&tab=energy-dashboard" replace />} />
        <Route path="/renewable-energy" element={<Navigate to="/?industry=energy&tab=energy-dashboard" replace />} />
        <Route path="/maritime" element={<Navigate to="/?industry=maritime&tab=dashboard" replace />} />
        <Route path="/maritime-fleet" element={<Navigate to="/?industry=maritime&tab=dashboard" replace />} />
        <Route path="/manufacturing" element={<Navigate to="/?industry=manufacturing&tab=dashboard" replace />} />
        <Route path="/logistics" element={<Navigate to="/?industry=logistics&tab=dashboard" replace />} />
        <Route path="/supply-chain" element={<Navigate to="/?industry=logistics&tab=dashboard" replace />} />
        <Route path="/dashboard" element={<Navigate to="/?industry=energy&tab=energy-dashboard" replace />} />
        <Route path="/resources" element={<Navigate to="/?view=resources" replace />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
