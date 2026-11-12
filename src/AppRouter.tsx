import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import App from "./app/page";
import ContactPage from "./app/contact/page";
import IndustryDetailPage from "./app/industries/[id]/page";
// Loaded on demand so the public site bundle doesn't include the demo.
const DemoApp = React.lazy(() => import("./demo/DemoApp"));

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

        {/* Contact Page */}
        <Route path="/contact" element={<ContactPage />} />

        {/* SCIO application (unlisted; reachable only by URL). Old /demo links redirect here. */}
        <Route path="/demo/*" element={<LegacyRedirect />} />
        <Route
          path="/app/*"
          element={
            <React.Suspense fallback={<div className="min-h-screen bg-[#0a0d14]" />}>
              <DemoApp />
            </React.Suspense>
          }
        />

        {/* Dynamic Industry Pages */}
        <Route path="/industries/:id" element={<IndustryDetailRouteWrapper />} />

        {/* Redirect Routes matching next.config.mjs */}
        <Route path="/industries" element={<Navigate to="/#industries" replace />} />
        <Route path="/energy" element={<Navigate to="/?industry=energy&tab=energy-dashboard" replace />} />
        <Route path="/renewable-energy" element={<Navigate to="/?industry=energy&tab=energy-dashboard" replace />} />
        <Route path="/maritime" element={<Navigate to="/?industry=maritime&tab=dashboard" replace />} />
        <Route path="/maritime-fleet" element={<Navigate to="/?industry=maritime&tab=dashboard" replace />} />
        <Route path="/manufacturing" element={<Navigate to="/?industry=manufacturing&tab=dashboard" replace />} />
        <Route path="/logistics" element={<Navigate to="/?industry=logistics&tab=dashboard" replace />} />
        <Route path="/supply-chain" element={<Navigate to="/?industry=logistics&tab=dashboard" replace />} />
        <Route path="/platform" element={<Navigate to="/?industry=energy&tab=energy-dashboard" replace />} />
        <Route path="/dashboard" element={<Navigate to="/?industry=energy&tab=energy-dashboard" replace />} />
        <Route path="/resources" element={<Navigate to="/?view=resources" replace />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
