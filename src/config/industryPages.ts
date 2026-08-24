import { Zap, Ship, Building2, Truck } from "lucide-react";

export interface IndustryPage {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  desc: string;
  problemStatement: string;
  problemPoints: string[];
  solutionStatement: string;
  solutionPoints: string[];
  outcomePoints: string[];
  stats: { label: string; value: string }[];
  icon: typeof Zap;
  color: string;
  accent: string;
  launchTab: string;
  img: string;
}

export const INDUSTRY_PAGES: IndustryPage[] = [
  {
    id: "energy",
    slug: "renewable-energy",
    name: "Renewable Energy & Utilities",
    tagline: "12.4 GW UNDER LIVE MANAGEMENT",
    desc: "SCIO unifies solar, wind, BESS, and thermal generation into one operational cockpit.",
    problemStatement:
      "Energy operators run fragmented estates — 50+ plants, dozens of SCADA servers, and isolated ERP databases. Telemetry exists but nobody sees it in time. Inverter faults, thermal hotspots, and grid imbalances are discovered only after they become expensive unplanned outages, and maintenance remains reactive instead of predictive.",
    problemPoints: [
      "Operational data siloed across SCADA, ERP, weather, and finance systems",
      "Reactive maintenance culture — faults found after failure, not before",
      "No unified view of PPA revenue variance vs. live generation",
      "Manual compliance reporting consuming engineering weeks each quarter"
    ],
    solutionStatement:
      "SCIO deploys as the centralized intelligence layer across the entire generation fleet — ingesting 96.0 kS/s DSP vibration telemetry, thermography, and market data into one mission-control cockpit where AI predicts failures 14 days ahead and dispatches work orders automatically.",
    solutionPoints: [
      "Live SCADA & DSP vibration telemetry at 96.0 kS/s per asset",
      "Predictive failure detection 14 days before outages occur",
      "BESS dispatch optimization & peak-grid load forecasting",
      "NERC-CIP compliant audit trails & one-click executive reporting"
    ],
    outcomePoints: [
      "99.98% fleet uptime sustained across the full portfolio",
      "$1.4M saved annually in averted unplanned outage costs",
      "Zero critical trips recorded in 2026"
    ],
    stats: [
      { label: "GRID CAPACITY", value: "12.4 GW" },
      { label: "FLEET UPTIME", value: "99.98%" },
      { label: "SAVED / YEAR", value: "$1.4M" }
    ],
    icon: Zap,
    color: "text-cyan-400",
    accent: "border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
    launchTab: "energy-dashboard",
    img: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=1600&q=80"
  },
  {
    id: "maritime",
    slug: "maritime-fleet",
    name: "Maritime Fleet Operations",
    tagline: "GLOBAL FLEET COMMAND & COMPLIANCE",
    desc: "SCIO gives fleet operators a single command center for AIS routing, bunker management, and port compliance.",
    problemStatement:
      "Fleet superintendents juggle vessel positions from AIS vendors, bunker fuel figures in spreadsheets, paper-based Port State Control records, and crew certificates across email threads. One missed deficiency or expired safety certificate can trigger costly detentions, off-hire disputes, and PSC detentions that damage charter relationships.",
    problemPoints: [
      "Vessel positions, voyages, and ETAs tracked across disconnected systems",
      "Bunker ROB discrepancies and unmonitored MGO/HFO consumption drift",
      "Port State Control deficiencies managed manually with no CAPA tracking",
      "Safety equipment certificates expiring without proactive alerts"
    ],
    solutionStatement:
      "SCIO consolidates every vessel into one Maritime Command Center — live AIS routing with deviation alerts, real-time bunker analytics, automated deficiency CAPA workflows, and certificate expiry watchlists that keep the fleet inspection-ready at all times.",
    solutionPoints: [
      "Live AIS tracking & route deviation alerting for the whole fleet",
      "Bunker ROB monitoring with MGO/HFO burn-rate analytics",
      "Automated Port State Control deficiency CAPA workflows",
      "Safety equipment certificate & inspection scheduling engine"
    ],
    outcomePoints: [
      "94% deficiency closure rate maintained across inspections",
      "Zero PSC detentions since deployment",
      "Bunker over-consumption detected within hours, not weeks"
    ],
    stats: [
      { label: "VESSELS TRACKED", value: "48" },
      { label: "DEFICIENCY CLOSERATE", value: "94%" },
      { label: "PSC DETENTIONS", value: "0" }
    ],
    icon: Ship,
    color: "text-purple-400",
    accent: "border-purple-500/30 bg-purple-500/10 text-purple-300",
    launchTab: "dashboard",
    img: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1600&q=80"
  },
  {
    id: "manufacturing",
    slug: "manufacturing",
    name: "Manufacturing 4.0",
    tagline: "SMART FACTORY INTELLIGENCE",
    desc: "SCIO connects production lines, QA vision systems, and maintenance crews into one predictive layer.",
    problemStatement:
      "Factories run blind between shift reports. OEE losses are calculated manually weeks later, quality defects escape to customers because optical inspection is sampled not continuous, and machine failures halt lines because vibration and thermal signals are never correlated against production schedules.",
    problemPoints: [
      "OEE measured manually — loss pareto invisible until month-end reviews",
      "QA defect escapes due to sampling-based manual inspection",
      "Unplanned downtime halting lines with no early-warning system",
      "Maintenance crews dispatched reactively with incomplete context"
    ],
    solutionStatement:
      "SCIO wires the smart factory together — dual-axis OEE loss pareto computed live, vision AI inspecting 100% of production output, thermal anomaly detection on critical machinery, and auto-generated work orders pushed directly to field crew mobile devices.",
    solutionPoints: [
      "Dual-axis OEE loss pareto & line-level availability in real time",
      "Optical vision AI defect inspection automation on full output",
      "Thermal anomaly detection on critical machinery",
      "Auto-generated work orders dispatched to field crews instantly"
    ],
    outcomePoints: [
      "+11.2% OEE improvement within two quarters",
      "-38% unplanned downtime across monitored lines",
      "-64% QA defect escape rate to customers"
    ],
    stats: [
      { label: "OEE IMPROVEMENT", value: "+11.2%" },
      { label: "UNPLANNED DOWNTIME", value: "-38%" },
      { label: "QA DEFECT ESCAPE", value: "-64%" }
    ],
    icon: Building2,
    color: "text-amber-400",
    accent: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    launchTab: "dashboard",
    img: "https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=1600&q=80"
  },
  {
    id: "logistics",
    slug: "supply-chain",
    name: "Logistics & Supply Chain",
    tagline: "MULTIMODAL SUPPLY CHAIN CONTROL",
    desc: "SCIO predicts freight delays, enforces cold-chain compliance, and rebalances inventory before bottlenecks hit.",
    problemStatement:
      "Supply chain teams discover delays when containers are already stacking up at ports. Cold-chain excursions are found after product is lost, demurrage bills arrive as surprises, and inventory buffers are set by gut feel — tying up working capital while still stocking-out on critical MRO parts.",
    problemPoints: [
      "Freight disruptions identified after demurrage clocks start running",
      "Cold-chain temperature excursions detected post-loss, not pre-empted",
      "Inventory buffers sized by intuition instead of demand signal data",
      "Procurement requisitions raised manually, days behind actual need"
    ],
    solutionStatement:
      "SCIO turns the supply chain into a predictive control loop — freight delay prediction with vendor risk scoring, IoT cold-chain enforcement with threshold alerting, inventory MRO rebalancing driven by demand forecasts, and automated procurement requisitioning.",
    solutionPoints: [
      "Freight delay prediction with vendor & lane risk scoring",
      "Cold-chain IoT compliance (-18.4°C threshold alerts)",
      "Inventory MRO rebalancing & safety buffer optimization",
      "Demurrage avoidance & procurement requisition automation"
    ],
    outcomePoints: [
      "+17.8% on-time delivery improvement across lanes",
      "$320K in demurrage costs avoided annually",
      "96.4% forecast accuracy driving buffer sizing"
    ],
    stats: [
      { label: "ON-TIME DELIVERY", value: "+17.8%" },
      { label: "DEMURRAGE AVOIDED", value: "$320K" },
      { label: "FORECAST ACCURACY", value: "96.4%" }
    ],
    icon: Truck,
    color: "text-emerald-400",
    accent: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    launchTab: "dashboard",
    img: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1600&q=80"
  }
];

export function getIndustryPage(key: string): IndustryPage | undefined {
  return INDUSTRY_PAGES.find(
    (p) => p.id === key || p.slug === key
  );
}
