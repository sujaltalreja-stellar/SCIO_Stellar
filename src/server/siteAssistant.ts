// Website assistant for the public marketing site (homepage, platform, use cases, FAQ).
// Answers only from the SCIO product knowledge below, using the existing Sarvam API key.
import { sarvamChat, sarvamConfigured, parseJsonLoose, type ChatMessage } from "./demo/sarvam";
import { ENTERPRISE_QUESTIONS_DATA } from "../components/site/faqData";

const FAQ_TEXT = ENTERPRISE_QUESTIONS_DATA.map((f) => `Q: ${f.question}\nA: ${f.answerText.replace(/\n+/g, " ")}`).join("\n\n");

const KNOWLEDGE = `
PRODUCT: Stellar SCIO is an AI business operating system. Tagline: "Your systems are connected. Now connect the decisions."
SCIO connects a company's ERP, point of sale (POS), warehouse (WMS), HR & payroll, CRM, procurement, accounting, e-commerce, spreadsheets and documents/email.
It surfaces operational issues, answers questions in plain language with sources, and turns insights into approved actions (purchase orders, stock transfers, tasks) written back to existing systems.
It does not replace existing systems; they stay the system of record. No rip-and-replace.

HOW IT WORKS (4 steps): 1) Connect: lightweight connectors read from ERP, POS, WMS, HR, CRM, finance tools, spreadsheets and documents. 2) Understand: SCIO links stores, products, stock, orders, suppliers, staff and money into one connected model. 3) Ask: anyone asks questions in plain language and sees the evidence. 4) Act: recommendations become actions that go to the right person to approve and are written back.

CAPABILITIES: ask anything in plain language; live views by store/product/supplier/team; alerts for stockouts, late deliveries and unusual sales; demand and stock forecasts; document AI that reads invoices, POs and delivery notes and matches them; workflows and approvals (approve, edit, escalate, reject) with rules by role, amount and location; full audit trail; roles and permissions down to store level.

PRODUCT SCREENS: Command Center (live sales vs target, one health score, stockout risk, overstock, expiry risk, supplier delays, inventory losses), Intelligence (money leaking today, value protected by SCIO, items running out next, supplier true cost), Ask SCIO (answers with reasons and actions ready to approve), Priority actions, Connected systems map.

USE CASES: inventory & replenishment (what to reorder and where, transfers between locations, slow/excess stock); sales & store performance (compare stores, regions, channels and explain changes); purchasing & suppliers (draft POs from demand, track late/partial deliveries, supplier scorecards); finance & documents (invoice/PO/receipt matching, price and quantity mismatches, spend analysis); approvals & workflows (route actions to the right approver, full history).
Typical customers: multi-store and multi-location businesses, distribution and wholesale, companies running separate ERP, POS, warehouse, HR and finance tools.

SECURITY & DEPLOYMENT: on-premises, private cloud or hybrid; data stays on the customer's infrastructure; encryption in transit and at rest; SSO; role-based access and least privilege; segregation of duties; environment isolation; AI recommends and people approve; every action is logged.

GETTING STARTED: start with one workflow that costs money (e.g. stockouts or slow purchasing), connect the systems behind it read-only first, validate SCIO's numbers against your own reports, then enable actions with approvals and expand. Live in weeks, not a migration project. No invented ROI: baseline KPIs are agreed first and then measured.

CONTACT: book a demo on the website, email sales@stellarmind.ai or info@stellarmind.ai, phone +91 97230 99765. Pricing is shared on a call; there is no public price list.

PAGES: /platform (how it works, capabilities, security), /platform/integrations, /use-cases, /why-scio, /faq, /contact. The live product is at /app.

FAQ:
${FAQ_TEXT}
`.trim();

const SYSTEM_PROMPT = `You are SCIO, the friendly assistant on the Stellar SCIO website. Help visitors understand the product and decide whether to book a demo.

Rules:
- Answer ONLY from the KNOWLEDGE below. If something isn't covered (exact pricing, specific customer names, a connector not listed), say you don't have that detail and suggest booking a demo or emailing sales@stellarmind.ai.
- Never invent numbers, customers, certifications or results.
- SCIO is not an energy, maritime, manufacturing or logistics product. Don't describe it that way.
- Be concise: 2–5 short sentences or a few bullet points ("- "). Plain, warm language; no jargon. Use **bold** sparingly.
- Reply as JSON: {"answer": string, "action": "demo" | "none", "followUps": [up to 3 short follow-up questions]}.
  Use "demo" when the visitor asks about pricing, a pilot, trying it, getting started, or talking to someone.

KNOWLEDGE:
${KNOWLEDGE}`;

export interface SiteTurn {
  role: "user" | "assistant";
  content: string;
}

export interface SiteAnswer {
  text: string;
  provider: string;
  suggestedAction: { type: "open_demo"; label: string } | null;
  followUps: string[];
}

function fallbackAnswer(query: string): SiteAnswer {
  const q = query.toLowerCase();
  const hit =
    ENTERPRISE_QUESTIONS_DATA.find((f) => q.split(/\W+/).filter((w) => w.length > 3).some((w) => f.question.toLowerCase().includes(w))) ??
    ENTERPRISE_QUESTIONS_DATA[0];
  return {
    text: `${hit.answerText}\n\nWant to see it on your own data? Book a demo and we'll walk you through it.`,
    provider: "SCIO Assistant",
    suggestedAction: { type: "open_demo", label: "Book a demo" },
    followUps: ["How does SCIO work?", "Which systems does it connect to?", "Can it run on our own infrastructure?"],
  };
}

export async function answerSiteQuestion(query: string, history: SiteTurn[] = [], section?: string): Promise<SiteAnswer> {
  if (!sarvamConfigured()) return fallbackAnswer(query);

  const messages: ChatMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history.slice(-6).map((t) => ({ role: t.role, content: t.content.slice(0, 1500) }) as ChatMessage),
    { role: "user", content: section ? `(Visitor is looking at: ${section})\n${query}` : query },
  ];

  try {
    const { message } = await sarvamChat({ messages, json: true, maxTokens: 700, temperature: 0.3, timeoutMs: 30_000 });
    const raw = typeof message.content === "string" ? message.content : "";
    const parsed = parseJsonLoose<{ answer?: string; action?: string; followUps?: string[] }>(raw);
    const text = (parsed?.answer || raw || "").trim();
    if (!text) return fallbackAnswer(query);
    return {
      text,
      provider: "SCIO Assistant · Sarvam AI",
      suggestedAction: parsed?.action === "demo" ? { type: "open_demo", label: "Book a demo" } : null,
      followUps: Array.isArray(parsed?.followUps) ? parsed!.followUps.filter((s) => typeof s === "string").slice(0, 3) : [],
    };
  } catch (err) {
    console.warn("Site assistant: Sarvam call failed, using fallback", err);
    return fallbackAnswer(query);
  }
}
