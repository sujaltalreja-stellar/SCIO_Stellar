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

export const USE_CASES = [
  { id: "inventory", label: "Inventory & replenishment", desc: "Know what to reorder, where, before it runs out" },
  { id: "sales", label: "Sales & store performance", desc: "See every store, channel and product in one view" },
  { id: "purchasing", label: "Purchasing & suppliers", desc: "Draft POs and track supplier delivery and quality" },
  { id: "finance", label: "Finance & documents", desc: "Read invoices and POs, match them, flag the gaps" },
  { id: "approvals", label: "Approvals & workflows", desc: "Route every action to the right person to sign off" },
] as const;

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Platform",
    items: [
      { label: "Platform overview", desc: "Connect, understand, ask, act", href: "/platform" },
      { label: "How it works", desc: "From your systems to approved actions", href: "/platform#how-it-works" },
      { label: "Integrations", desc: "ERP, POS, WMS, HRMS, CRM and more", href: "/platform/integrations" },
      { label: "Security & governance", desc: "Your infrastructure, your approvals", href: "/platform#governance" },
    ],
    footer: { label: "Try live demo", href: "/app" },
  },
  {
    label: "Use cases",
    items: USE_CASES.map((u) => ({ label: u.label, desc: u.desc, href: `/use-cases#${u.id}` })),
    footer: { label: "All use cases", href: "/use-cases" },
  },
  {
    label: "Company",
    items: [
      { label: "Why SCIO", desc: "The problem we solve, and how we're different", href: "/why-scio" },
      { label: "FAQ", desc: "Deployment, security, AI and pricing questions", href: "/faq" },
      { label: "Contact", desc: "Start a conversation", href: "/contact" },
    ],
  },
];

export const FOOTER_COLUMNS: NavGroup[] = [
  {
    label: "Platform",
    items: [
      { label: "Overview", href: "/platform" },
      { label: "How it works", href: "/platform#how-it-works" },
      { label: "Integrations", href: "/platform/integrations" },
      { label: "Security", href: "/platform#governance" },
      { label: "Try live demo", href: "/app" },
    ],
  },
  {
    label: "Use cases",
    items: USE_CASES.map((u) => ({ label: u.label, href: `/use-cases#${u.id}` })),
  },
  {
    label: "Company",
    items: [
      { label: "Why SCIO", href: "/why-scio" },
      { label: "FAQ", href: "/faq" },
      { label: "Contact", href: "/contact" },
    ],
  },
];
