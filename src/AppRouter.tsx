import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useParams } from "react-router-dom";
import PageLoader from "./components/site/PageLoader";
// The homepage ships in the main bundle so it renders immediately on first visit (no loading screen).
// Everything else is loaded on demand: /app and the platform dashboards never weigh down the homepage.
import HomeRoutePage from "./components/landing/HomeRoutePage";
import { lazyWithReload } from "./lazyWithReload";

/** Blank page-coloured placeholder for public pages while their code loads (no spinner). */
function SiteBlank() {
  return <div className="min-h-screen bg-white" />;
}

const App = lazyWithReload(() => import("./app/page"));
const DemoApp = lazyWithReload(() => import("./demo/DemoApp"));
const sitePage = (name: "PlatformPage" | "IntegrationsPage" | "UseCasesPage" | "WhyScioPage" | "FaqPage" | "ContactPage") =>
  lazyWithReload(() => import("./app/site/pages").then((m) => ({ default: m[name] })));
const PlatformPage = sitePage("PlatformPage");
const IntegrationsPage = sitePage("IntegrationsPage");
const UseCasesPage = sitePage("UseCasesPage");
const WhyScioPage = sitePage("WhyScioPage");
const FaqPage = sitePage("FaqPage");
const ContactPage = sitePage("ContactPage");
const ErpExpertsPage = lazyWithReload(() => import("./app/site/ErpExpertsPage").then((m) => ({ default: m.ErpExpertsPage })));

/** "/" serves the platform dashboards only when the query asks for it (?launch=1 or ?industry=). */
function isPlatformSearch(search: string) {
  const p = new URLSearchParams(search);
  return p.get("launch") === "1" || p.has("industry");
}

function HomeRoute() {
  const { search } = useLocation();
  const view = new URLSearchParams(search).get("view");
  if (view === "contact") return <Navigate to="/contact" replace />;
  if (view === "resources") return <Navigate to="/" replace />;
  if (isPlatformSearch(search)) {
    return (
      <React.Suspense fallback={<PageLoader dark />}>
        <App />
      </React.Suspense>
    );
  }
  return <HomeRoutePage />;
}

function LegacyRedirect() {
  const params = useParams();
  return <Navigate to={`/app/${params["*"] ?? ""}`} replace />;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <React.Suspense fallback={<SiteBlank />}>
        <Routes>
          {/* Homepage, or the platform when launched via ?launch=1 / ?industry= / ?view= */}
          <Route path="/" element={<HomeRoute />} />

          {/* Marketing subpages */}
          <Route path="/platform" element={<PlatformPage />} />
          <Route path="/platform/integrations" element={<IntegrationsPage />} />
          <Route path="/use-cases" element={<UseCasesPage />} />
          <Route path="/why-scio" element={<WhyScioPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/erp-experts" element={<ErpExpertsPage />} />

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

          {/* Retired pages (industries, control tower, customers, case studies) */}
          <Route path="/industries/*" element={<Navigate to="/" replace />} />
          <Route path="/platform/control-tower" element={<Navigate to="/platform" replace />} />
          <Route path="/customers" element={<Navigate to="/" replace />} />

          {/* Redirect Routes matching next.config.mjs */}
          <Route path="/energy" element={<Navigate to="/?industry=energy&tab=energy-dashboard" replace />} />
          <Route path="/renewable-energy" element={<Navigate to="/?industry=energy&tab=energy-dashboard" replace />} />
          <Route path="/maritime" element={<Navigate to="/?industry=maritime&tab=dashboard" replace />} />
          <Route path="/maritime-fleet" element={<Navigate to="/?industry=maritime&tab=dashboard" replace />} />
          <Route path="/manufacturing" element={<Navigate to="/?industry=manufacturing&tab=dashboard" replace />} />
          <Route path="/logistics" element={<Navigate to="/?industry=logistics&tab=dashboard" replace />} />
          <Route path="/supply-chain" element={<Navigate to="/?industry=logistics&tab=dashboard" replace />} />
          <Route path="/dashboard" element={<Navigate to="/?industry=energy&tab=energy-dashboard" replace />} />
          <Route path="/resources" element={<Navigate to="/" replace />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </React.Suspense>
    </BrowserRouter>
  );
}
