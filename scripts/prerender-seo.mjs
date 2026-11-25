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
const DEFAULT_IMAGE = "/thumbnail.png?v=3";

// Keep in sync with the useSeo() calls and PageHero copy in src/app/site/pages.tsx and HomePage.tsx.
const ROUTES = [
  {
    path: "/",
    name: "Home",
    title: "Stellar SCIO | The AI Business Operating System for ERP, POS & Inventory",
    description:
      "SCIO connects your ERP, POS, warehouse, HR and finance systems into one AI business operating system. Ask questions in plain language, spot problems early and act with approvals.",
    image: "/images/business-operations-team-at-work.webp",
    h1: "The AI business operating system for ERP, POS & inventory.",
    intro: "Connect your ERP, POS, warehouse, HR and finance tools. Spot problems early. Approve every fix in one place.",
    points: [
      "Works on top of the systems you already run: ERP, point of sale, warehouse (WMS), HR & finance, CRM, procurement, spreadsheets, documents and email.",
      "Skip the dashboards. Just ask: any number, reason or next step, explained in plain words.",
      "From scattered systems to one operating picture.",
      "Built for control and governance: every action is approved by a person and recorded in a full audit trail.",
    ],
    faqTeaser: true,
  },
  {
    path: "/platform",
    name: "Platform",
    title: "Platform | Stellar SCIO AI Business Operating System",
    description:
      "How SCIO works: connect your ERP, POS, WMS and HR systems, understand your business in one model, ask questions in plain language, and act with approvals and a full audit trail.",
    image: "/images/scio-intelligence-dashboard.webp",
    h1: "Connect. Understand. Ask. Act.",
    intro: "SCIO sits on top of the systems you already run and turns them into one operating picture your whole team can question and act on.",
  },
  {
    path: "/platform/integrations",
    name: "Integrations",
    parent: { name: "Platform", path: "/platform" },
    title: "Integrations: ERP, POS, WMS, HRMS & CRM | Stellar SCIO",
    description:
      "SCIO connects to your ERP (SAP, Oracle and others), point of sale, warehouse, HR, CRM, procurement and accounting systems, plus spreadsheets and documents, without replacing them.",
    image: "/images/distribution-center-stock.webp",
    h1: "Works with the systems you already run",
    intro: "SCIO reads from and writes back to your existing tools. Nothing gets replaced, and your systems stay the source of truth.",
  },
  {
    path: "/use-cases",
    name: "Use cases",
    title: "Use Cases: Inventory, Sales, Purchasing & Finance | Stellar SCIO",
    description:
      "How businesses use SCIO: inventory and replenishment, store and sales performance, purchasing and supplier management, invoice and document matching, and approval workflows.",
    image: "/images/warehouse-inventory-shelves.webp",
    h1: "Start with one problem. Expand from there.",
    intro: "Most businesses begin with one workflow that costs them money every week. Here's where SCIO usually starts.",
  },
  {
    path: "/why-scio",
    name: "Why SCIO",
    title: "Why SCIO | One Business Operating System Instead of a Dozen Tools",
    description:
      "Your ERP, POS, warehouse and finance tools each hold part of the picture. SCIO connects them without replacing anything, answers questions in plain language and keeps people in control.",
    image: "/images/leadership-business-review-meeting.webp",
    h1: "Your data already knows what's happening",
    intro:
      "The answers are in your systems. They're just split across your ERP, POS, warehouse, HR and finance tools, and nobody has time to stitch them together.",
  },
  {
    path: "/faq",
    name: "FAQ",
    title: "FAQ | Stellar SCIO Business Operating System",
    description:
      "Answers to common questions about SCIO: ERP integration, on-premises and private cloud deployment, data ownership, AI governance, security and how to get started.",
    h1: "Questions businesses ask us",
    intro: "Deployment, security, AI and getting started.",
    faqAll: true,
  },
  {
    path: "/contact",
    name: "Contact",
    title: "Contact | Stellar SCIO",
    description:
      "Talk to the Stellar SCIO team about a demo, a pilot or pricing for your business. Email sales@stellarmind.ai or send us a message.",
    h1: "Let's talk about your business",
    intro: "Tell us how you run today and what you'd like to fix. We'll reply within one business day. Email sales@stellarmind.ai.",
  },
];

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
      primaryImageOfPage: abs(route.image || DEFAULT_IMAGE),
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
    const image = abs(route.image || DEFAULT_IMAGE);
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
    if (route.image) {
      // Page-specific images are not 1200x630, so drop the default's fixed dimensions.
      html = html.replace(/\s*<meta property="og:image:(width|height)" content="\d+"\s*\/?>/g, "");
    }
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
