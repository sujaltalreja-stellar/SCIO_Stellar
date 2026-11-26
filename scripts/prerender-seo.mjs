// Post-build SEO/GEO step for the public site (runs after `vite build`).
//
// The site is a single-page app, so the raw HTML every URL returns is the same "Loading SCIO…" shell.
// Google renders JavaScript, but AI crawlers (GPTBot, ClaudeBot, PerplexityBot…) and most link
// previews do not. For each public route this writes dist/<route>.html with that page's own title,
// description, canonical URL, social tags, structured data and its real heading + intro as plain HTML.
// React replaces the static block as soon as it boots, so visitors see the normal page.
// It also writes dist/llms.txt and dist/llms-full.txt for AI answer engines.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, "dist");
const SITE = "https://www.stellarscio.app";
// Every page shares the same branded card (public/thumbnail.png, 1200x630). Bump ?v= to make chat apps re-fetch it.
const DEFAULT_IMAGE = "/thumbnail.png?v=4";

// Titles and descriptions come from src/components/site/seoRoutes.json, the same file the live pages
// read through pageSeo(), so the two can't drift apart. Keep h1/intro/points in sync with the PageHero
// copy in src/app/site/pages.tsx, ErpExpertsPage.tsx and HomePage.tsx.
const SEO = JSON.parse(readFileSync(join(ROOT, "src/components/site/seoRoutes.json"), "utf8"));
// Google shows roughly 60 title characters and 160 description characters before cutting them off.
const MAX_TITLE = 60;
const MAX_DESCRIPTION = 160;

const ROUTE_CONTENT = [
  {
    path: "/",
    name: "Home",
    image: "/images/business-operations-team-at-work.webp",
    h1: "The AI business operating system for ERP, POS & inventory.",
    intro: "Connect your ERP, POS, warehouse, HR and finance tools. Spot problems early. Approve every fix in one place.",
    points: [
      "Works on top of the systems you already run: ERP, point of sale, warehouse (WMS), HR & finance, CRM, procurement, spreadsheets, documents and email.",
      "Skip the dashboards. Just ask: any number, reason or next step, explained in plain words.",
      "From scattered systems to one operating picture.",
      "Built for control and governance: every action is approved by a person and recorded in a full audit trail.",
      "Your ERP stays the source of truth: SCIO plugs into SAP, Oracle, Microsoft Dynamics 365, Blue Yonder, Kinaxis and o9 Solutions, and our developers build the connection.",
      "Built for how your industry runs: retail, FMCG, logistics and manufacturing.",
      "Expert ERP talent, ready to join your team: experienced professionals in SAP, Oracle, Microsoft Dynamics 365, Blue Yonder, Kinaxis and o9 Solutions (staff augmentation).",
    ],
    faqTeaser: true,
  },
  {
    path: "/platform",
    name: "Platform",
    image: "/images/scio-intelligence-dashboard.webp",
    h1: "Connect. Understand. Ask. Act.",
    intro: "SCIO sits on top of the systems you already run and turns them into one operating picture your whole team can question and act on.",
    points: [
      "Connect: lightweight connectors read from your ERP, POS, warehouse, HR, CRM and finance tools, plus spreadsheets and documents. Your existing systems stay the system of record.",
      "Understand: SCIO links stores, products, stock, orders, suppliers, staff and money into one connected model of your business, refreshed as things change.",
      "Ask: anyone on the team can ask questions in plain language, from margin by store this month to which supplier is late most often, and see the evidence behind every answer.",
      "Act: recommendations become actions (a purchase order, a stock transfer, a task). Each one goes to the right person to approve and is written back to your systems.",
      "Capabilities: plain-language questions with sources, live views, alerts, demand and stock forecasts, document AI, workflows and approvals, a full audit trail, and roles and permissions.",
      "Security and governance: deploy on-premises, in a private cloud or hybrid, with encryption in transit and at rest, single sign-on and least-privilege access. Nothing happens without approval.",
    ],
  },
  {
    path: "/platform/integrations",
    name: "Integrations",
    parent: { name: "Platform", path: "/platform" },
    image: "/images/distribution-center-stock.webp",
    h1: "Works with the systems you already run",
    intro: "SCIO reads from and writes back to your existing tools. Nothing gets replaced, and your systems stay the source of truth.",
    points: [
      "ERP: products, stock, purchase and sales orders, finance and master data.",
      "Point of sale: sales by store, product, time and payment, as they happen.",
      "Warehouse (WMS): stock levels, locations, receipts, picks and transfers.",
      "HR and payroll: teams, shifts, roles and labour cost by location.",
      "CRM: customers, accounts, orders and service history.",
      "Procurement: suppliers, POs, lead times, deliveries and quality.",
      "Accounting: invoices, payments, margins and cost centres.",
      "Spreadsheets and documents: the Excel files, PDFs and emails your team really runs on.",
      "Live in weeks, not a migration project. SCIO runs where your data lives: on-premises, private cloud or hybrid.",
    ],
  },
  {
    path: "/use-cases",
    name: "Use cases",
    image: "/images/warehouse-inventory-shelves.webp",
    h1: "Start with one problem. Expand from there.",
    intro: "Most businesses begin with one workflow that costs them money every week. Here's where SCIO usually starts.",
    points: [
      "Inventory and replenishment: SCIO combines sales, stock on hand, stock in transit and supplier lead times to tell you what to reorder and where to move stock between locations.",
      "Store and sales performance: compare stores, regions and channels side by side, and find out why numbers moved, not only that they did.",
      "Purchasing and suppliers: SCIO drafts POs from real demand, tracks deliveries against promises and scores suppliers on reliability and quality.",
      "Invoices and documents: document AI reads invoices, purchase orders and delivery notes, matches them against each other and your records, and highlights what doesn't add up.",
      "Approvals: set rules by role, amount and location. SCIO routes each recommendation to the right approver and records every decision.",
    ],
  },
  {
    path: "/why-scio",
    name: "Why SCIO",
    image: "/images/leadership-business-review-meeting.webp",
    h1: "Your data already knows what's happening",
    intro:
      "The answers are in your systems. They're just split across your ERP, POS, warehouse, HR and finance tools, and nobody has time to stitch them together.",
    points: [
      "Finding an answer: instead of exporting reports from several systems into Excel, ask a question and get the answer with sources.",
      "Spotting problems: instead of noticing them in weekly or monthly reviews, see them flagged as they develop, with the likely cause.",
      "Taking action: instead of re-keying data and chasing approvals by email, go in one click to an approved PO, transfer or task.",
      "Rollout: instead of a long, risky migration, SCIO sits on top of what you have and goes live in weeks.",
      "Control: every recommendation and approval is logged, so you can see who changed what and why.",
      "What we believe: keep what works, people stay in charge, and measure rather than promise.",
    ],
  },
  {
    path: "/erp-experts",
    name: "ERP experts",
    h1: "ERP and planning experts, ready to join your team.",
    intro:
      "Consultants and developers for SAP, Oracle, Microsoft Dynamics 365, Blue Yonder, Kinaxis and o9 Solutions, including Blue Yonder planning leads with 10+ years and developers with 5+. They work inside your team, managed by you, for as long as you need them.",
    points: [
      "Blue Yonder Demand Planning Consultant (10+ years): demand planning, forecasting, consensus planning and S&OP; integration with ERP / SAP.",
      "Blue Yonder Supply Planning / ESP Consultant (10+ years): supply, material, capacity and constraint-based planning; solvers and forecast netting.",
      "Blue Yonder Developer (5+ years): Blue Yonder / JDA development, SQL and planning data models, batch jobs, data loads and integrations.",
      "Senior SAP Data Migration Consultant, S/4HANA & SAC (7+ years): full-cycle S/4HANA migrations, Migration Cockpit, LTMC / LTMOM, SAC account-based to measure-based model migration, SAP BPC.",
      "SAP Treasury Consultant (5+ years): SAP TRM, Cash Management and Liquidity Planning, In-House Cash, Bank Account Management, SAP BCM, SWIFT and EBICS payments.",
      "Senior M365 / Windows Infrastructure Engineer (6+ years): Microsoft 365, Exchange Online, Entra ID / Active Directory, Teams, SharePoint and Windows Server.",
      "Also SAP, Oracle, Microsoft Dynamics 365, Kinaxis and o9 Solutions professionals.",
    ],
  },
  {
    path: "/faq",
    name: "FAQ",
    h1: "Questions businesses ask us",
    intro: "Deployment, security, AI and getting started.",
    faqAll: true,
  },
  {
    path: "/contact",
    name: "Contact",
    h1: "Let's talk about your business",
    intro: "Tell us how you run today and what you'd like to fix. We'll reply within one business day. Email sales@stellarmind.ai.",
    points: [
      "Sales: sales@stellarmind.ai",
      "General enquiries: info@stellarmind.ai",
      "Phone: +91 97230 99765",
      "Ask about a live demo, a pilot on one workflow, pricing, deployment options or ERP expert staff augmentation.",
    ],
  },
];

const ROUTES = ROUTE_CONTENT.map((route) => {
  const seo = SEO[route.path];
  if (!seo) throw new Error(`prerender-seo: no entry for ${route.path} in seoRoutes.json`);
  if (seo.title.length > MAX_TITLE) throw new Error(`prerender-seo: title for ${route.path} is ${seo.title.length} chars (max ${MAX_TITLE})`);
  if (seo.description.length > MAX_DESCRIPTION) throw new Error(`prerender-seo: description for ${route.path} is ${seo.description.length} chars (max ${MAX_DESCRIPTION})`);
  return { ...route, title: seo.title, description: seo.description };
});

// ---------- FAQ, read from the same source the site uses ----------
function loadFaq() {
  const src = readFileSync(join(ROOT, "src/components/site/faqData.ts"), "utf8");
  const items = [];
  const re = /question:\s*"((?:[^"\\]|\\.)*)"[\s\S]*?answerText:\s*"((?:[^"\\]|\\.)*)"/g;
  let m;
  while ((m = re.exec(src))) {
    items.push({ q: JSON.parse(`"${m[1]}"`), a: JSON.parse(`"${m[2]}"`) });
  }
  return items;
}

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const abs = (p) => (p.startsWith("http") ? p : `${SITE}${p}`);
const url = (p) => (p === "/" ? `${SITE}/` : `${SITE}${p}`);

function setTag(html, re, replacement, label) {
  if (!re.test(html)) throw new Error(`prerender-seo: could not find ${label} in dist/index.html`);
  return html.replace(re, replacement);
}

function jsonLd(route, faq) {
  const crumbs = [{ name: "Home", path: "/" }];
  if (route.parent) crumbs.push(route.parent);
  if (route.path !== "/") crumbs.push({ name: route.name, path: route.path });
  const graph = [
    {
      "@type": "WebPage",
      "@id": `${url(route.path)}#webpage`,
      url: url(route.path),
      name: route.title,
      description: route.description,
      inLanguage: "en",
      isPartOf: { "@id": `${SITE}/#website` },
      about: { "@id": `${SITE}/#software` },
      primaryImageOfPage: abs(DEFAULT_IMAGE),
    },
  ];
  if (crumbs.length > 1) {
    graph.push({
      "@type": "BreadcrumbList",
      itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: url(c.path) })),
    });
  }
  // FAQPage schema is not added here: FaqPage in src/app/site/pages.tsx already injects it at runtime,
  // and two FAQPage blocks on one URL is a Search Console error. Non-JS crawlers still get every
  // question and answer as plain HTML from staticBody().
  return `<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c")}</script>`;
}

function staticBody(route, faq) {
  const nav = ROUTES.filter((r) => r.path !== route.path)
    .map((r) => `<li><a href="${r.path}">${esc(r.name)}</a></li>`)
    .join("");
  const points = route.points ? `<ul>${route.points.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>` : "";
  const faqList = route.faqAll ? faq : route.faqTeaser ? faq.slice(0, 4) : [];
  const faqHtml = faqList.length
    ? `<section><h2>Questions businesses ask us</h2>${faqList
        .map((f) => `<h3>${esc(f.q)}</h3>${f.a.split(/\n+/).map((p) => `<p>${esc(p)}</p>`).join("")}`)
        .join("")}</section>`
    : "";
  return `<div class="scio-static"><header><a href="/">Stellar SCIO</a></header><main><h1>${esc(route.h1)}</h1><p>${esc(route.intro)}</p>${points}${faqHtml}<nav aria-label="Site"><ul>${nav}</ul></nav></main></div>`;
}

// The plain-text copy of each page is for crawlers, AI answer engines and screen readers. It stays in
// the HTML but is visually hidden, so a refresh shows the normal loading background (instead of a page
// of plain text) until React renders and replaces everything inside #root.
const STATIC_CSS = `<style>.scio-static{position:absolute!important;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);clip-path:inset(50%);white-space:nowrap;border:0}</style>`;

// Visitors with JavaScript turned off get the plain-text copy as a readable page instead of a blank one.
const NOSCRIPT_CSS = `<noscript><style>.scio-boot{display:none!important}.scio-static{position:static!important;width:auto;height:auto;margin:0 auto;overflow:visible;clip:auto;clip-path:none;white-space:normal;max-width:760px;padding:96px 20px 64px;font:400 17px/1.6 Inter,system-ui,sans-serif;color:#4a4843;background:#fff}.scio-static header a{font-weight:700;color:#111113;text-decoration:none}.scio-static h1{margin:40px 0 16px;font-size:clamp(30px,5vw,52px);line-height:1.15;letter-spacing:-.03em;font-weight:500;color:#111113}.scio-static h2{margin:40px 0 8px;font-size:22px;color:#111113}.scio-static h3{margin:24px 0 4px;font-size:17px;color:#111113}.scio-static nav ul{display:flex;flex-wrap:wrap;gap:8px 20px;padding:0;list-style:none;margin-top:40px}.scio-static a{color:#111113}</style></noscript>`;

function build() {
  const shell = readFileSync(join(DIST, "index.html"), "utf8");
  const faq = loadFaq();

  for (const route of ROUTES) {
    const pageUrl = url(route.path);
    const image = abs(DEFAULT_IMAGE);
    let html = shell;
    html = setTag(html, /<title>[\s\S]*?<\/title>/, `<title>${esc(route.title)}</title>`, "<title>");
    html = setTag(html, /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/, `<meta name="description" content="${esc(route.description)}" />`, "meta description");
    html = setTag(html, /<link rel="canonical" href="[^"]*"\s*\/?>/, `<link rel="canonical" href="${pageUrl}" />`, "canonical");
    html = setTag(html, /<meta property="og:url" content="[^"]*"\s*\/?>/, `<meta property="og:url" content="${pageUrl}" />`, "og:url");
    html = setTag(html, /<meta property="og:title" content="[^"]*"\s*\/?>/, `<meta property="og:title" content="${esc(route.title)}" />`, "og:title");
    html = setTag(html, /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/, `<meta property="og:description" content="${esc(route.description)}" />`, "og:description");
    html = setTag(html, /<meta property="og:image" content="[^"]*"\s*\/?>/, `<meta property="og:image" content="${image}" />`, "og:image");
    html = setTag(html, /<meta name="twitter:title" content="[^"]*"\s*\/?>/, `<meta name="twitter:title" content="${esc(route.title)}" />`, "twitter:title");
    html = setTag(html, /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/, `<meta name="twitter:description" content="${esc(route.description)}" />`, "twitter:description");
    html = setTag(html, /<meta name="twitter:image" content="[^"]*"\s*\/?>/, `<meta name="twitter:image" content="${image}" />`, "twitter:image");
    html = html.replace("</head>", `    ${jsonLd(route, faq)}\n    ${STATIC_CSS}\n    ${NOSCRIPT_CSS}\n  </head>`);
    // Keep the loading placeholder on screen and put the hidden plain-text copy right after it. Both sit
    // inside #root, so React replaces them together on its first render.
    html = setTag(html, /<div class="scio-boot"[^>]*>[\s\S]*?<\/div>/, (boot) => `${boot}${staticBody(route, faq)}`, "boot placeholder");

    const out = route.path === "/" ? join(DIST, "index.html") : join(DIST, `${route.path.slice(1)}.html`);
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, html);
  }

  writeFileSync(join(DIST, "llms.txt"), llmsTxt(false, faq));
  writeFileSync(join(DIST, "llms-full.txt"), llmsTxt(true, faq));
  console.log(`prerender-seo: wrote ${ROUTES.length} pages, llms.txt and llms-full.txt (${faq.length} FAQ answers)`);
}

// ---------- llms.txt (https://llmstxt.org) ----------
function llmsTxt(full, faq) {
  const home = ROUTES[0];
  const lines = [
    "# Stellar SCIO",
    "",
    `> ${home.description}`,
    "",
    "Stellar SCIO is built by Stellarmind.ai. It is a business operating system that works on top of the systems a company already runs (ERP, point of sale, warehouse/WMS, HR and finance, CRM, procurement, spreadsheets, documents and email) without replacing them. Teams ask questions in plain language, SCIO spots problems early and proposes fixes, and a person approves every action, with a full audit trail.",
    "",
    "Contact: sales@stellarmind.ai",
    "",
    "## Industries",
    "",
    "SCIO is set up for retail, FMCG, logistics and manufacturing teams: stores, tills and shelves; batches, expiry and distributor orders; shipments, fleet and warehouse flow; plants, materials and production plans.",
    "",
    "## ERP and planning systems",
    "",
    "SCIO connects to SAP, Oracle, Microsoft Dynamics 365, Blue Yonder, Kinaxis and o9 Solutions. Your ERP stays the source of truth; Stellarmind developers build the connection. Names are trademarks of their owners and are used only to identify the systems SCIO connects to.",
    "",
    "## ERP expert talent (staff augmentation)",
    "",
    `Stellarmind.ai can place experienced ERP professionals with your team, with hands-on experience in SAP, Oracle, Microsoft Dynamics 365, Blue Yonder, Kinaxis and o9 Solutions, for as long as you need them. Ask via ${SITE}/contact.`,
    "",
    "## Pages",
    "",
    ...ROUTES.map((r) => `- [${r.name}](${url(r.path)}): ${r.description}`),
    "",
  ];
  if (full) {
    lines.push("## Frequently asked questions", "");
    for (const f of faq) lines.push(`### ${f.q}`, "", f.a, "");
  } else {
    lines.push("## Optional", "", `- [Full FAQ in plain text](${SITE}/llms-full.txt): every question and answer from ${SITE}/faq`, "");
  }
  return lines.join("\n");
}

build();
