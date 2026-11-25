"use client";

/* Public marketing subpages (general business operating system). */
import React, { useMemo, useState } from "react";
import {
  Plug,
  Network,
  MessageSquareText,
  CheckCircle2,
  LayoutDashboard,
  BellRing,
  TrendingUp,
  FileText,
  GitPullRequestArrow,
  ScrollText,
  Users,
  Server,
  Cloud,
  Layers,
  Lock,
  KeyRound,
  Database,
  ShoppingCart,
  Warehouse,
  Briefcase,
  Contact,
  Receipt,
  Store,
  FileSpreadsheet,
  Mail,
  Phone,
  Search,
  Plus,
  Minus,
  X,
  Check,
} from "lucide-react";
import SiteLayout, { SITE_SHELL } from "../../components/site/SiteLayout";
import { useSite } from "../../components/site/SiteContext";
import { ConnectBand, Eyebrow, NextPages, PageHero, PrimaryButton, SecondaryButton, SectionHeading } from "../../components/site/blocks";
import { useSeo } from "../../components/site/seo";
import { USE_CASES } from "../../components/site/nav";
import { ENTERPRISE_QUESTIONS_DATA } from "../../components/site/faqData";
import { LeadForm } from "../../components/site/ContactForms";
import AnimatedScreenshot from "../../components/site/AnimatedScreenshot";
import ProductDemo from "../../components/landing/ProductDemo";

// ---------- shared bits ----------
function H2({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <SectionHeading className={className}>{children}</SectionHeading>;
}

function TalkButton({ label = "Book a demo" }: { label?: string }) {
  const { openDemo } = useSite();
  return <PrimaryButton onClick={openDemo}>{label}</PrimaryButton>;
}

function FeatureGrid({ items }: { items: { icon: typeof Plug; title: string; body: string }[] }) {
  return (
    <div className="grid gap-px overflow-hidden rounded-3xl border border-[#E7E5E1] bg-[#E7E5E1] sm:grid-cols-2 lg:grid-cols-4">
      {items.map((f) => (
        <div key={f.title} className="bg-white p-7">
          <span className="h-11 w-11 rounded-xl bg-[#FFF4E2] text-[#B06D0F] flex items-center justify-center">
            <f.icon className="h-5 w-5" aria-hidden="true" />
          </span>
          <h3 className="mt-5 text-[18px] font-semibold text-[#111113]">{f.title}</h3>
          <p className="mt-2 text-[15px] leading-relaxed text-[#5D5A54]">{f.body}</p>
        </div>
      ))}
    </div>
  );
}

// ================= /platform =================
const STEPS = [
  {
    icon: Plug,
    title: "Connect",
    body: "Lightweight connectors read from your ERP, POS, warehouse, HR, CRM and finance tools, plus spreadsheets and documents. Your existing systems stay the system of record.",
  },
  {
    icon: Network,
    title: "Understand",
    body: "SCIO links stores, products, stock, orders, suppliers, staff and money into one connected model of your business, refreshed as things change.",
  },
  {
    icon: MessageSquareText,
    title: "Ask",
    body: "Anyone on the team can ask questions in plain language, from “what's our margin by store this month?” to “which supplier is late most often?”, and see the evidence behind every answer.",
  },
  {
    icon: CheckCircle2,
    title: "Act",
    body: "Recommendations become actions: a purchase order, a stock transfer, a task. Each one goes to the right person to approve and is written back to your systems.",
  },
];

const CAPABILITIES = [
  { icon: MessageSquareText, title: "Ask anything", body: "Plain-language questions across all your systems, with sources." },
  { icon: LayoutDashboard, title: "Live views", body: "Store, product, supplier and team views that update as data changes." },
  { icon: BellRing, title: "Alerts", body: "Stockouts, late deliveries and unusual sales flagged before they hurt." },
  { icon: TrendingUp, title: "Forecasts", body: "Demand and stock forecasts that account for seasonality and promotions." },
  { icon: FileText, title: "Document AI", body: "Read invoices, POs and delivery notes, then match them to your records." },
  { icon: GitPullRequestArrow, title: "Workflows & approvals", body: "Approve, edit, escalate or reject, with rules you set by role and amount." },
  { icon: ScrollText, title: "Audit trail", body: "Every question, recommendation and action is recorded and traceable." },
  { icon: Users, title: "Roles & permissions", body: "People see and do only what their role allows, down to the store." },
];

export function PlatformPage() {
  useSeo({
    title: "Platform | Stellar SCIO AI Business Operating System",
    description:
      "How SCIO works: connect your ERP, POS, WMS and HR systems, understand your business in one model, ask questions in plain language, and act with approvals and a full audit trail.",
    path: "/platform",
    image: "/images/scio-intelligence-dashboard.webp",
  });
  return (
    <SiteLayout>
      <PageHero
        crumbs={[{ label: "Platform" }]}
        eyebrow="Platform"
        title="Connect. Understand. Ask. Act."
        subtitle="SCIO sits on top of the systems you already run and turns them into one operating picture your whole team can question and act on."
        media={
          <AnimatedScreenshot
            src="/images/scio-intelligence-dashboard.webp"
            alt="SCIO intelligence dashboard showing money leaking today, value protected, stock running out and supplier cost, with the SCIO assistant"
            badge="Live intelligence across 12 systems"
          />
        }
        actions={
          <>
            <TalkButton />
            <SecondaryButton href="/app">Open SCIO</SecondaryButton>
          </>
        }
      />

      <section id="how-it-works" className="bg-[#F6F5F3] border-y border-[#E7E5E1] scroll-mt-20">
        <div className={`${SITE_SHELL} py-20 sm:py-28`}>
          <Eyebrow>How it works</Eyebrow>
          <H2 className="mt-4 max-w-3xl">Four steps from scattered data to approved action</H2>
          <ol className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <li key={s.title} className="rounded-3xl bg-white border border-[#E7E5E1] p-8">
                <span className="text-[13px] font-semibold tracking-[0.14em] text-[#8f8b84]">STEP {String(i + 1).padStart(2, "0")}</span>
                <span className="mt-4 h-12 w-12 rounded-2xl bg-[#111113] text-white flex items-center justify-center">
                  <s.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-5 font-display text-[24px] font-semibold text-[#111113]">{s.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-[#5D5A54]">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="capabilities" className="bg-white scroll-mt-20">
        <div className={`${SITE_SHELL} py-20 sm:py-28`}>
          <Eyebrow>Capabilities</Eyebrow>
          <H2 className="mt-4 max-w-3xl">Everything your operations team needs, in one place</H2>
          <div className="mt-12">
            <FeatureGrid items={CAPABILITIES} />
          </div>
        </div>
      </section>

      <section id="governance" className="bg-[#0F0F11] text-white scroll-mt-20">
        <div className={`${SITE_SHELL} py-20 sm:py-28 grid gap-12 lg:grid-cols-2 lg:items-center`}>
          <div>
            <Eyebrow tone="light">Security & governance</Eyebrow>
            <SectionHeading tone="light" className="mt-4">
              Your data, your infrastructure, your approvals
            </SectionHeading>
            <ul className="mt-10 space-y-6">
              {[
                { icon: Server, title: "Deploy where you want", body: "On-premises, private cloud or hybrid, aligned with your data-residency rules." },
                { icon: Lock, title: "Encrypted and isolated", body: "Encryption in transit and at rest, single sign-on and environment isolation." },
                { icon: KeyRound, title: "Least privilege by default", body: "Role-based access and segregation of duties, down to store and team level." },
                { icon: ScrollText, title: "Nothing happens unapproved", body: "AI recommends; people approve. Every action is logged with who, what and why." },
              ].map((g) => (
                <li key={g.title} className="flex gap-4">
                  <g.icon className="h-6 w-6 mt-0.5 text-[#f2a93b] shrink-0" aria-hidden="true" />
                  <div>
                    <h3 className="text-[18px] font-semibold">{g.title}</h3>
                    <p className="mt-1 text-[15px] leading-relaxed text-white/70">{g.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative aspect-[16/11] overflow-hidden rounded-3xl">
            <img src="/images/secure-private-data-center.webp" alt="Secure private data centre with server racks" loading="lazy" width={1200} height={675} className="absolute inset-0 h-full w-full object-cover" />
          </div>
        </div>
      </section>

      <NextPages
        items={[
          { label: "Integrations", desc: "The systems SCIO connects to, and how.", to: "/platform/integrations" },
          { label: "Use cases", desc: "Inventory, sales, purchasing, finance and approvals.", to: "/use-cases" },
          { label: "FAQ", desc: "Deployment, security, AI and pricing questions.", to: "/faq" },
        ]}
      />
      <ConnectBand />
    </SiteLayout>
  );
}

// ================= /platform/integrations =================
const SYSTEM_GROUPS = [
  { icon: Database, title: "ERP", body: "Products, stock, purchase and sales orders, finance and master data." },
  { icon: Store, title: "Point of sale", body: "Sales by store, product, time and payment, as they happen." },
  { icon: Warehouse, title: "Warehouse (WMS)", body: "Stock levels, locations, receipts, picks and transfers." },
  { icon: Briefcase, title: "HR & payroll", body: "Teams, shifts, roles and labour cost by location." },
  { icon: Contact, title: "CRM", body: "Customers, accounts, orders and service history." },
  { icon: ShoppingCart, title: "Procurement", body: "Suppliers, POs, lead times, deliveries and quality." },
  { icon: Receipt, title: "Accounting", body: "Invoices, payments, margins and cost centres." },
  { icon: FileSpreadsheet, title: "Spreadsheets & documents", body: "The Excel files, PDFs and emails your team really runs on." },
];

export function IntegrationsPage() {
  useSeo({
    title: "Integrations: ERP, POS, WMS, HRMS & CRM | Stellar SCIO",
    description:
      "SCIO connects to your ERP (SAP, Oracle and others), point of sale, warehouse, HR, CRM, procurement and accounting systems, plus spreadsheets and documents, without replacing them.",
    path: "/platform/integrations",
    image: "/images/distribution-center-stock.webp",
  });
  return (
    <SiteLayout>
      <PageHero
        crumbs={[{ label: "Platform", to: "/platform" }, { label: "Integrations" }]}
        eyebrow="Integrations"
        title="Works with the systems you already run"
        subtitle="SCIO reads from and writes back to your existing tools. Nothing gets replaced, and your systems stay the source of truth."
        image="/images/distribution-center-stock.webp"
        imageAlt="Distribution centre with stock on shelves and pallets"
        actions={<TalkButton label="Check your systems with us" />}
      />

      <section className="bg-[#F6F5F3] border-y border-[#E7E5E1]">
        <div className={`${SITE_SHELL} py-20 sm:py-28`}>
          <H2 className="max-w-3xl">What SCIO connects to</H2>
          <p className="mt-5 max-w-[62ch] text-[17px] leading-relaxed text-[#4a4843]">
            We confirm the exact connectors for your stack during setup. Most businesses start with their ERP and point of sale, then add more over time.
          </p>
          <div className="mt-12">
            <FeatureGrid items={SYSTEM_GROUPS} />
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className={`${SITE_SHELL} py-20 sm:py-28 grid gap-12 lg:grid-cols-2`}>
          <div>
            <Eyebrow>How connecting works</Eyebrow>
            <H2 className="mt-4">Live in weeks, not a migration project</H2>
            <ol className="mt-10 space-y-6">
              {[
                ["Pick one workflow", "Start with a problem worth solving, such as stockouts or slow purchasing."],
                ["Connect the systems behind it", "Read-only connectors first, so nothing in your systems changes."],
                ["Validate the numbers", "Check SCIO's figures against your own reports before anyone relies on them."],
                ["Turn on actions", "Enable write-back with approvals, then expand to more stores and teams."],
              ].map(([t, b], i) => (
                <li key={t} className="flex gap-5">
                  <span className="h-10 w-10 shrink-0 rounded-full border border-[#D6D3CE] flex items-center justify-center font-semibold text-[#111113]">{i + 1}</span>
                  <div>
                    <h3 className="text-[18px] font-semibold text-[#111113]">{t}</h3>
                    <p className="mt-1 text-[15px] leading-relaxed text-[#5D5A54]">{b}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <Eyebrow>Deployment options</Eyebrow>
            <H2 className="mt-4">Runs where your data lives</H2>
            <div className="mt-10 grid gap-4">
              {[
                { icon: Server, title: "On-premises", body: "Inside your own data centre, on your hardware." },
                { icon: Cloud, title: "Private cloud", body: "In your own cloud account, under your security policies." },
                { icon: Layers, title: "Hybrid", body: "Keep sensitive data on-site and use the cloud where it helps." },
              ].map((d) => (
                <div key={d.title} className="flex gap-4 rounded-2xl border border-[#E7E5E1] p-6">
                  <d.icon className="h-6 w-6 mt-0.5 text-[#B06D0F] shrink-0" aria-hidden="true" />
                  <div>
                    <h3 className="text-[18px] font-semibold text-[#111113]">{d.title}</h3>
                    <p className="mt-1 text-[15px] text-[#5D5A54]">{d.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <NextPages
        items={[
          { label: "How SCIO works", desc: "What happens after your data is connected.", to: "/platform" },
          { label: "Use cases", desc: "Where businesses start with SCIO.", to: "/use-cases" },
        ]}
      />
      <ConnectBand />
    </SiteLayout>
  );
}

// ================= /use-cases =================
const USE_CASE_DETAIL: Record<(typeof USE_CASES)[number]["id"], { img: string; alt: string; title: string; body: string; points: string[]; ask: string }> = {
  inventory: {
    img: "/images/warehouse-inventory-shelves.webp",
    alt: "Warehouse shelves stocked with inventory",
    title: "Reorder the right stock, in the right place, before it runs out",
    body: "SCIO combines sales, stock on hand, stock in transit and supplier lead times to tell you what to reorder and where to move stock between locations.",
    points: ["Low-stock and stockout alerts by store and product", "Reorder and transfer suggestions with reasons", "Slow-moving and excess stock flagged early"],
    ask: "Which products will run out in the next 7 days, and where?",
  },
  sales: {
    img: "/images/retail-store-aisle-inventory.webp",
    alt: "Retail store aisle with stocked shelves",
    title: "See every store, channel and product in one view",
    body: "Compare stores, regions and channels side by side, and find out why numbers moved, not only that they did.",
    points: ["Sales, margin and basket trends by location", "Top and bottom performers, with explanations", "Promotion and seasonality effects"],
    ask: "Why did sales drop in our North region last week?",
  },
  purchasing: {
    img: "/images/distribution-center-stock.webp",
    alt: "Distribution centre stock ready to ship",
    title: "Draft purchase orders and keep suppliers on time",
    body: "SCIO drafts POs from real demand, tracks deliveries against promises and scores suppliers on reliability and quality.",
    points: ["PO drafts based on forecast demand", "Late and partial deliveries flagged", "Supplier scorecards for on-time and quality"],
    ask: "Which suppliers delivered late most often this quarter?",
  },
  finance: {
    img: "/images/invoices-and-finance-documents.webp",
    alt: "Invoices and finance documents on a desk",
    title: "Read invoices and POs, match them, flag the gaps",
    body: "Document AI reads invoices, purchase orders and delivery notes, matches them against each other and your records, and highlights what doesn't add up.",
    points: ["Invoice, PO and receipt matching", "Price and quantity mismatches flagged", "Spend by supplier, category and store"],
    ask: "Show invoices this month that don't match their purchase order.",
  },
  approvals: {
    img: "/images/team-planning-workflow-meeting.webp",
    alt: "Team planning a workflow on a whiteboard",
    title: "Send every action to the right person to approve",
    body: "Set rules by role, amount and location. SCIO routes each recommendation to the right approver and records every decision.",
    points: ["Approve, edit, escalate or reject in one click", "Rules by role, value and location", "Full history of who approved what and why"],
    ask: "What's waiting for my approval today?",
  },
};

export function UseCasesPage() {
  useSeo({
    title: "Use Cases: Inventory, Sales, Purchasing & Finance | Stellar SCIO",
    description:
      "How businesses use SCIO: inventory and replenishment, store and sales performance, purchasing and supplier management, invoice and document matching, and approval workflows.",
    path: "/use-cases",
    image: "/images/warehouse-inventory-shelves.webp",
  });
  return (
    <SiteLayout>
      <PageHero
        crumbs={[{ label: "Use cases" }]}
        eyebrow="Use cases"
        title="Start with one problem. Expand from there."
        subtitle="Most businesses begin with one workflow that costs them money every week. Here's where SCIO usually starts."
        media={<ProductDemo />}
        actions={<TalkButton />}
      />
      {USE_CASES.map((u, i) => {
        const d = USE_CASE_DETAIL[u.id];
        return (
          <section key={u.id} id={u.id} className={`scroll-mt-20 border-t border-[#E7E5E1] ${i % 2 ? "bg-[#F6F5F3]" : "bg-white"}`}>
            <div className={`${SITE_SHELL} py-20 sm:py-24 grid gap-12 lg:grid-cols-2 lg:items-center`}>
              <div className={`relative aspect-[4/3] overflow-hidden rounded-3xl ${i % 2 ? "lg:order-last" : ""}`}>
                <img src={d.img} alt={d.alt} loading={i === 0 ? "eager" : "lazy"} width={900} height={675} className="absolute inset-0 h-full w-full object-cover" />
              </div>
              <div>
                <Eyebrow>{u.label}</Eyebrow>
                <H2 className="mt-4">{d.title}</H2>
                <p className="mt-5 text-[17px] leading-relaxed text-[#4a4843]">{d.body}</p>
                <ul className="mt-7 space-y-3">
                  {d.points.map((p) => (
                    <li key={p} className="flex gap-3 text-[16px] text-[#111113]">
                      <Check className="h-5 w-5 mt-0.5 text-[#B06D0F] shrink-0" aria-hidden="true" /> {p}
                    </li>
                  ))}
                </ul>
                <div className="mt-8 rounded-2xl border border-[#E7E5E1] bg-white p-5">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#8f8b84]">Ask SCIO</p>
                  <p className="mt-2 text-[17px] font-medium text-[#111113]">“{d.ask}”</p>
                </div>
              </div>
            </div>
          </section>
        );
      })}
      <ConnectBand />
    </SiteLayout>
  );
}

// ================= /why-scio =================
export function WhyScioPage() {
  useSeo({
    title: "Why SCIO | One Business Operating System Instead of a Dozen Tools",
    description:
      "Your ERP, POS, warehouse and finance tools each hold part of the picture. SCIO connects them without replacing anything, answers questions in plain language and keeps people in control.",
    path: "/why-scio",
    image: "/images/leadership-business-review-meeting.webp",
  });
  const rows = [
    ["Finding an answer", "Export reports from several systems and combine them in Excel", "Ask a question and get the answer with sources"],
    ["Spotting problems", "Noticed after the fact, in weekly or monthly reviews", "Flagged as they develop, with the likely cause"],
    ["Taking action", "Switch between tools, re-key data, chase approvals by email", "One click to an approved PO, transfer or task"],
    ["Rollout", "Replace systems in a long, risky migration", "Sits on top of what you have; live in weeks"],
    ["Control", "Hard to see who changed what and why", "Every recommendation and approval is logged"],
  ];
  return (
    <SiteLayout>
      <PageHero
        crumbs={[{ label: "Company" }, { label: "Why SCIO" }]}
        eyebrow="Why SCIO"
        title="Your data already knows what's happening"
        subtitle="The answers are in your systems. They're just split across your ERP, POS, warehouse, HR and finance tools, and nobody has time to stitch them together."
        image="/images/leadership-business-review-meeting.webp"
        imageAlt="Leadership team reviewing business performance in a meeting"
        actions={<TalkButton />}
      />
      <section className="bg-[#F6F5F3] border-y border-[#E7E5E1]">
        <div className={`${SITE_SHELL} py-20 sm:py-28`}>
          <H2 className="max-w-3xl">Before and after SCIO</H2>
          <div className="mt-12 overflow-x-auto rounded-3xl border border-[#E7E5E1] bg-white">
            <table className="w-full min-w-[640px] text-left">
              <caption className="sr-only">How work changes with SCIO</caption>
              <thead>
                <tr className="border-b border-[#E7E5E1] text-[14px] text-[#6b6862]">
                  <th scope="col" className="p-5 font-semibold w-[22%]"> </th>
                  <th scope="col" className="p-5 font-semibold">Without SCIO</th>
                  <th scope="col" className="p-5 font-semibold text-[#111113]">With SCIO</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(([k, a, b]) => (
                  <tr key={k} className="border-b border-[#EFEEEB] last:border-0 align-top">
                    <th scope="row" className="p-5 text-[16px] font-semibold text-[#111113]">{k}</th>
                    <td className="p-5 text-[15px] text-[#5D5A54]">
                      <span className="inline-flex gap-2"><X className="h-4 w-4 mt-1 text-red-500 shrink-0" aria-hidden="true" />{a}</span>
                    </td>
                    <td className="p-5 text-[15px] text-[#111113]">
                      <span className="inline-flex gap-2"><Check className="h-4 w-4 mt-1 text-emerald-600 shrink-0" aria-hidden="true" />{b}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
      <section className="bg-white">
        <div className={`${SITE_SHELL} py-20 sm:py-28`}>
          <H2 className="max-w-3xl">What we believe</H2>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {[
              ["Keep what works", "Your ERP and POS took years to set up. SCIO makes them more useful instead of replacing them."],
              ["People stay in charge", "AI should do the digging and drafting. Decisions that move money or stock need a person's approval."],
              ["Measure, don't promise", "We agree baseline numbers with you first, then measure the change. No invented ROI."],
            ].map(([t, b]) => (
              <div key={t} className="rounded-3xl border border-[#E7E5E1] p-8">
                <h3 className="font-display text-[24px] font-semibold text-[#111113]">{t}</h3>
                <p className="mt-3 text-[16px] leading-relaxed text-[#5D5A54]">{b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <NextPages
        items={[
          { label: "How SCIO works", desc: "The four-step operating loop.", to: "/platform" },
          { label: "Use cases", desc: "Where businesses start.", to: "/use-cases" },
        ]}
      />
      <ConnectBand />
    </SiteLayout>
  );
}

// ================= /faq =================
const FAQ_CATEGORIES = [
  { id: "all", label: "All" },
  { id: "platform", label: "Platform" },
  { id: "deployment", label: "Deployment & security" },
  { id: "ai", label: "AI & governance" },
  { id: "roi", label: "Value & getting started" },
] as const;

export function FaqPage() {
  useSeo({
    title: "FAQ | Stellar SCIO Business Operating System",
    description:
      "Answers to common questions about SCIO: ERP integration, on-premises and private cloud deployment, data ownership, AI governance, security and how to get started.",
    path: "/faq",
  });
  const [cat, setCat] = useState<(typeof FAQ_CATEGORIES)[number]["id"]>("all");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<number[]>([1]);
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return ENTERPRISE_QUESTIONS_DATA.filter(
      (f) => (cat === "all" || f.category === cat) && (!s || f.question.toLowerCase().includes(s) || f.answerText.toLowerCase().includes(s))
    );
  }, [cat, q]);

  // FAQPage structured data for search results.
  const jsonLd = useMemo(
    () =>
      JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: ENTERPRISE_QUESTIONS_DATA.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answerText.replace(/\n+/g, " ") },
        })),
      }),
    []
  );

  return (
    <SiteLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <PageHero
        crumbs={[{ label: "Company" }, { label: "FAQ" }]}
        eyebrow="FAQ"
        title="Questions businesses ask us"
        subtitle="Deployment, security, AI and getting started. Search below, or ask the SCIO assistant in the corner."
      />
      <section className="bg-white">
        <div className={`${SITE_SHELL} pb-24 max-w-4xl`}>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#8f8b84]" aria-hidden="true" />
            <label htmlFor="faq-search" className="sr-only">Search questions</label>
            <input
              id="faq-search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search questions"
              className="w-full rounded-full border border-[#D6D3CE] bg-white py-3.5 pl-12 pr-5 text-[16px] focus:border-[#111113] focus:outline-none"
            />
          </div>
          <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Filter by topic">
            {FAQ_CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                aria-pressed={cat === c.id}
                onClick={() => setCat(c.id)}
                className={`rounded-full px-4 py-2 text-[14px] font-medium cursor-pointer transition-colors ${
                  cat === c.id ? "bg-[#111113] text-white" : "border border-[#D6D3CE] text-[#3a3936] hover:border-[#111113]"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
          <div className="mt-10 border-t border-[#E7E5E1]">
            {list.length === 0 && <p className="py-10 text-[16px] text-[#5D5A54]">No questions match. Try another word, or contact us.</p>}
            {list.map((f) => {
              const isOpen = open.includes(f.id);
              return (
                <div key={f.id} className="border-b border-[#E7E5E1]">
                  <h2>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => setOpen((o) => (isOpen ? o.filter((x) => x !== f.id) : [...o, f.id]))}
                      className="w-full flex items-center justify-between gap-6 py-6 text-left text-[18px] font-semibold text-[#111113] cursor-pointer"
                    >
                      {f.question}
                      {isOpen ? <Minus className="h-5 w-5 shrink-0" /> : <Plus className="h-5 w-5 shrink-0" />}
                    </button>
                  </h2>
                  {isOpen && <div className="pb-7 -mt-1 text-[16px] leading-relaxed text-[#4a4843] whitespace-pre-line">{f.answerText}</div>}
                </div>
              );
            })}
          </div>
        </div>
      </section>
      <ConnectBand />
    </SiteLayout>
  );
}

// ================= /contact =================
export function ContactPage() {
  useSeo({
    title: "Contact | Stellar SCIO",
    description: "Talk to the Stellar SCIO team about a demo, a pilot or pricing for your business. Email sales@stellarmind.ai or send us a message.",
    path: "/contact",
  });
  return (
    <SiteLayout>
      <PageHero
        crumbs={[{ label: "Contact" }]}
        eyebrow="Contact"
        title="Let's talk about your business"
        subtitle="Tell us how you run today and what you'd like to fix. We'll reply within one business day."
      />
      <section className="bg-white">
        <div className={`${SITE_SHELL} pb-24 grid gap-12 lg:grid-cols-[1.3fr_0.7fr]`}>
          <div className="rounded-3xl border border-[#E7E5E1] p-6 sm:p-10">
            <LeadForm variant="contact" />
          </div>
          <aside className="space-y-6">
            <div className="rounded-3xl bg-[#F6F5F3] p-8">
              <h2 className="text-[18px] font-semibold text-[#111113]">Reach us directly</h2>
              <ul className="mt-5 space-y-4 text-[15px]">
                <li>
                  <a href="mailto:sales@stellarmind.ai" className="inline-flex items-center gap-3 text-[#111113] hover:text-[#B06D0F]">
                    <Mail className="h-5 w-5" aria-hidden="true" /> sales@stellarmind.ai
                  </a>
                </li>
                <li>
                  <a href="mailto:info@stellarmind.ai" className="inline-flex items-center gap-3 text-[#111113] hover:text-[#B06D0F]">
                    <Mail className="h-5 w-5" aria-hidden="true" /> info@stellarmind.ai
                  </a>
                </li>
                <li>
                  <a href="tel:+919723099765" className="inline-flex items-center gap-3 text-[#111113] hover:text-[#B06D0F]">
                    <Phone className="h-5 w-5" aria-hidden="true" /> +91 97230 99765
                  </a>
                </li>
              </ul>
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
              <img src="/images/team-planning-workflow-meeting.webp" alt="SCIO team planning with a customer" loading="lazy" width={1200} height={800} className="absolute inset-0 h-full w-full object-cover" />
            </div>
          </aside>
        </div>
      </section>
    </SiteLayout>
  );
}
