import { DM_Mono } from "next/font/google";

import "./components/sico/sico.css";
import SicoHero from "./components/sico/SicoHero";
import EnterpriseStrip from "./components/sico/EnterpriseStrip";
import OperatingLoop from "./components/sico/OperatingLoop";
import VisionEngine from "./components/sico/VisionEngine";
import InspectionWorkflow from "./components/sico/InspectionWorkflow";
import DigitalRegistry from "./components/sico/DigitalRegistry";
import SupplyChainLoop from "./components/sico/SupplyChainLoop";
import ControlTower from "./components/sico/ControlTower";
import ProductScreens from "./components/sico/ProductScreens";
import WhereSicoRuns from "./components/sico/WhereSicoRuns";
import IntegrationLayer from "./components/sico/IntegrationLayer";
import ClosingCTA from "./components/sico/ClosingCTA";

// DM Mono — the technical face the design source specifies for eyebrows, data
// labels and every dashboard readout. Scoped to this route rather than added to
// the root layout so the extra font is only paid for here; `--font-sico-mono`
// backs both the `font-sico-mono` Tailwind family and the inline `mono` styles
// in the section components.
const sicoMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-sico-mono",
});

export const metadata = {
  title: "SCIO Platform | Supply Chain & Field Inspection Operations | StellarMind",
  description:
    "SCIO unifies supply chain planning, computer vision asset inspections, field operations and audit compliance in one enterprise operating platform.",
  alternates: {
    canonical: "https://stellarmind.ai/products/scio-platform",
  },
  openGraph: {
    title: "SCIO Platform | StellarMind",
    description:
      "Unify supply chain intelligence and field inspection operations — AI vision inspections, a digital asset registry and an operations control tower in one platform.",
    url: "https://stellarmind.ai/products/scio-platform",
    type: "website",
  },
};

export default function Page() {
  return (
    <main
      className={`sico-page ${sicoMono.variable}`}
      style={{ background: "#FFFFFF", color: "#14110E" }}
    >
      <SicoHero />
      <EnterpriseStrip />
      <OperatingLoop />
      <VisionEngine />
      <InspectionWorkflow />
      <DigitalRegistry />
      <SupplyChainLoop />
      <ControlTower />
      <ProductScreens />
      <WhereSicoRuns />
      <IntegrationLayer />
      <ClosingCTA />
    </main>
  );
}
