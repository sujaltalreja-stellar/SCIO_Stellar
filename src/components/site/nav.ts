// Site-wide navigation map for the public marketing site (header dropdowns + footer).

export interface NavLinkItem {
  label: string;
  desc?: string;
  href: string;
}

export interface NavGroup {
  label: string;
  items: NavLinkItem[];
  footer?: NavLinkItem;
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Platform",
    items: [
      { label: "How SCIO works", desc: "Connect, understand, predict, act", href: "/platform" },
      { label: "Control Tower", desc: "One live view across every operation", href: "/platform/control-tower" },
      { label: "Integrations", desc: "SCADA, ERP and IoT, with no rip-and-replace", href: "/platform/integrations" },
      { label: "Capabilities", desc: "Root cause, documents, inspections, actions", href: "/platform#capabilities" },
    ],
    footer: { label: "Open the live platform", href: "/app" },
  },
  {
    label: "Industries",
    items: [
      { label: "Renewable Energy & Utilities", desc: "Solar, wind, BESS and grid", href: "/industries/energy" },
      { label: "Maritime Fleet & Ports", desc: "Vessels, bunkering and safety", href: "/industries/maritime" },
      { label: "Manufacturing 4.0", desc: "OEE, robotics and quality", href: "/industries/manufacturing" },
      { label: "Logistics & Cold-Chain", desc: "Freight, demurrage and IoT", href: "/industries/logistics" },
    ],
    footer: { label: "All industries", href: "/industries" },
  },
  {
    label: "Customers",
    items: [
      { label: "Private beta cohort", desc: "Enterprises running SCIO today", href: "/customers" },
      { label: "Case studies & blogs", desc: "Field notes and results", href: "/resources" },
    ],
  },
  {
    label: "Company",
    items: [
      { label: "Why SCIO", desc: "The problem we solve, and how we compare", href: "/why-scio" },
      { label: "Enterprise questions", desc: "Deployment, security, AI and ROI", href: "/faq" },
      { label: "Contact", desc: "Start a conversation", href: "/contact" },
    ],
  },
];

export const FOOTER_COLUMNS: NavGroup[] = [
  {
    label: "Platform",
    items: [
      { label: "How SCIO works", href: "/platform" },
      { label: "Control Tower", href: "/platform/control-tower" },
      { label: "Integrations", href: "/platform/integrations" },
      { label: "Open SCIO", href: "/app" },
    ],
  },
  {
    label: "Industries",
    items: [
      { label: "Renewable Energy", href: "/industries/energy" },
      { label: "Maritime Fleet", href: "/industries/maritime" },
      { label: "Manufacturing 4.0", href: "/industries/manufacturing" },
      { label: "Logistics & Cold-Chain", href: "/industries/logistics" },
    ],
  },
  {
    label: "Company",
    items: [
      { label: "Why SCIO", href: "/why-scio" },
      { label: "Customers", href: "/customers" },
      { label: "Case studies", href: "/resources" },
      { label: "Enterprise questions", href: "/faq" },
      { label: "Contact", href: "/contact" },
    ],
  },
];
