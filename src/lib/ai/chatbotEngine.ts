import { chatbotIndexCache } from "./chatbotIndexCache";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../convex/_generated/api";

// Helper to save chat history directly to Convex Database
async function persistChatToConvex(
  sector: string,
  userText: string,
  botText: string,
  provider: string,
  suggestedAction?: any
) {
  try {
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) return;
    const client = new ConvexHttpClient(convexUrl);
    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    let formattedAction: { type: string; label: string; payload?: Record<string, string> } | undefined = undefined;
    if (suggestedAction) {
      let normPayload: Record<string, string> | undefined = undefined;
      if (typeof suggestedAction.payload === "string") {
        normPayload = { target: suggestedAction.payload };
      } else if (typeof suggestedAction.payload === "object" && suggestedAction.payload !== null) {
        normPayload = {};
        for (const [k, v] of Object.entries(suggestedAction.payload)) {
          normPayload[k] = String(v);
        }
      }
      formattedAction = {
        type: String(suggestedAction.type || ""),
        label: String(suggestedAction.label || ""),
        payload: normPayload,
      };
    }

    // 1. Save User Message
    await client.mutation(api.mutations.saveChatMessage, {
      industry: sector,
      sender: "user",
      text: userText,
      timestamp: timeStr,
    });

    // 2. Save Bot Message
    await client.mutation(api.mutations.saveChatMessage, {
      industry: sector,
      sender: "bot",
      text: botText,
      timestamp: timeStr,
      provider,
      suggestedAction: formattedAction,
    });
  } catch (err) {
    console.warn("Convex chat history persistence warning:", err);
  }
}

// ============================================================================
// STELLAR SCIO CHATBOT ENGINE
// Simple, practical AI engine with clear product knowledge, token limits,
// intent classification, and plain-English fallback answers.
// ============================================================================

export interface ChatbotConfig {
  maxInputChars: number;
  maxOutputTokens: number;
  maxResponseChars: number;
}

export const TOKEN_LIMITS: ChatbotConfig = {
  maxInputChars: 2000,
  maxOutputTokens: 350,
  maxResponseChars: 2000,
};

// ============================================================================
// PRODUCT KNOWLEDGE BASE (Plain, Practical English - Zero Jargon)
// ============================================================================
export const PRODUCT_KNOWLEDGE_BASE = {
  platformName: "Stellar SCIO Platform",
  overview: "Stellar SCIO is an enterprise AI software platform that connects industrial machines, sensors, maintenance logs, and supply chains into one central dashboard. It predicts equipment breakdowns 14 days before they happen and automatically creates maintenance work orders in SAP or Maximo.",
  coreStats: [
    { label: "Monitored Energy", value: "12.4 GW Grid Capacity" },
    { label: "Uptime", value: "99.98%" },
    { label: "Annual Cost Savings", value: "$1.4M to $2.8M per site" },
    { label: "Early Failure Warning", value: "14 to 21 Days Ahead" },
    { label: "False Alarms", value: "91% Reduction" },
    { label: "OEE Improvement", value: "+11.2% in 2 Quarters" },
  ],
  intelligenceLoop: [
    {
      step: "1. CONNECT",
      desc: "Connects directly to your existing sensors, PLCs, and SCADA systems (using OPC-UA, Modbus, and MQTT) without needing any new hardware.",
    },
    {
      step: "2. UNDERSTAND",
      desc: "Combines live machine sensor data with manuals, equipment parts lists, and repair history into a single live digital twin.",
    },
    {
      step: "3. PREDICT",
      desc: "Analyzes machine vibration and temperature patterns to catch bearing wear and electrical faults 14 to 21 days before breakdown.",
    },
    {
      step: "4. ACT",
      desc: "Automatically drafts repair work orders and orders required spare parts in SAP S/4HANA PM or IBM Maximo.",
    },
  ],
  sectors: {
    home: {
      name: "Stellar SCIO Platform",
      tagline: "ENTERPRISE OPERATIONS SOFTWARE",
      stats: "Supports 4 Industries | 99.98% Uptime | $1.4M Saved/Yr",
      highlights: [
        "Unifies operations across Renewable Energy, Maritime, Manufacturing, and Logistics",
        "Connects machines to digital twins to predict failures 14 days early",
        "Automatically creates maintenance work orders in SAP PM and IBM Maximo",
        "Reduces false alarms by 91% and saves $1.4M to $2.8M annually per site",
      ],
      pricingOrTrial: "Available via Private Beta Program.",
    },
    general: {
      name: "Stellar SCIO Platform",
      tagline: "ENTERPRISE OPERATIONS SOFTWARE",
      stats: "Supports 4 Industries | 99.98% Uptime | $1.4M Saved/Yr",
      highlights: [
        "Unifies operations across Renewable Energy, Maritime, Manufacturing, and Logistics",
        "Connects machines to digital twins to predict failures 14 days early",
        "Automatically creates maintenance work orders in SAP PM and IBM Maximo",
        "Reduces false alarms by 91% and saves $1.4M to $2.8M annually per site",
      ],
      pricingOrTrial: "Available via Private Beta Program.",
    },
    energy: {
      name: "Renewable Energy & Power Grid",
      tagline: "12.4 GW MANAGED LIVE",
      stats: "12.4 GW Capacity | 99.98% Uptime | $1.4M Saved/Yr",
      highlights: [
        "Real-time power generation and grid frequency monitoring across substations",
        "Early warning for wind turbine gearbox vibration and pitch bearing wear",
        "Solar farm panel performance tracking and hotspot detection",
        "Battery storage cell balance and thermal safety monitoring",
        "Automated compliance audit trails and executive reporting",
      ],
      pricingOrTrial: "Available in Private Beta Sandbox.",
    },
    maritime: {
      name: "Maritime Fleet Operations",
      tagline: "GLOBAL FLEET MANAGEMENT",
      stats: "48 Ships Tracked | 94% Inspection Pass Rate | 0 Detentions",
      highlights: [
        "Live satellite GPS tracking and route ETAs for cargo vessels at sea",
        "Ship main engine temperature, oil pressure, and vibration monitoring",
        "Fuel tank monitoring and daily fuel consumption rate tracking",
        "Safety equipment inspection checklists (lifeboats, fire alarms, life jackets)",
        "Automated spare parts delivery to destination ports for repairs",
      ],
      pricingOrTrial: "Available for vessel operators in Private Beta.",
    },
    manufacturing: {
      name: "Manufacturing 4.0 & Factory OEE",
      tagline: "SMART FACTORY OPERATIONS",
      stats: "+11.2% OEE Improvement | -38% Downtime | -64% Defect Escapes",
      highlights: [
        "Real-time OEE tracking (Availability, Performance, Quality) across robotic cells",
        "Identifies short micro-stoppages and conveyor jams causing downtime",
        "CNC machine spindle vibration monitoring to catch bearing wear before tool damage",
        "Camera vision AI inspecting 100% of finished parts for quality defects",
        "Auto-drafting tool changeover work orders in SAP PM",
      ],
      pricingOrTrial: "Available for plant managers in Private Beta.",
    },
    logistics: {
      name: "Logistics & Cold-Chain Supply",
      tagline: "SUPPLY CHAIN CONTROL",
      stats: "+17.8% On-Time Delivery | $320K Demurrage Avoided | 96.4% Accuracy",
      highlights: [
        "Live temperature monitoring across refrigerated containers (-25°C to +4°C)",
        "Predicts shipping delays and port bottlenecks 6 to 9 days in advance",
        "Matches warehouse spare parts inventory directly with field repair work orders",
        "Automatically generates purchase orders when spare parts drop below safety stock",
      ],
      pricingOrTrial: "Available for supply chain directors in Private Beta.",
    },
  },
  integrations: [
    "OPC-UA", "Modbus", "MQTT", "SAP S/4HANA PM",
    "IBM Maximo", "Oracle NetSuite", "Siemens S7", "Rockwell Automation"
  ],
  security: "SOC2 Type II compliant, NERC-CIP compliant, end-to-end TLS encryption.",
};

// ============================================================================
// INTENT CLASSIFICATION
// ============================================================================
export type IntentType = "complaint" | "pricing" | "technical" | "comparison" | "product_inquiry" | "general";

export function classifyIntent(query: string) {
  const lower = query.toLowerCase();

  let sentiment: "negative" | "neutral" | "positive" = "neutral";
  if (lower.includes("not working") || lower.includes("fail") || lower.includes("broken") || lower.includes("bad") || lower.includes("frustrated") || lower.includes("problem") || lower.includes("downtime")) {
    sentiment = "negative";
  } else if (lower.includes("great") || lower.includes("good") || lower.includes("best") || lower.includes("love")) {
    sentiment = "positive";
  }

  if (lower.includes("price") || lower.includes("cost") || lower.includes("plan") || lower.includes("buy") || lower.includes("beta") || lower.includes("license") || lower.includes("demo")) {
    return { intent: "pricing" as IntentType, sentiment, keyTopic: "Pricing & Beta Access" };
  }
  if (lower.includes("not working") || lower.includes("issue") || lower.includes("error") || lower.includes("bug") || lower.includes("down") || lower.includes("slow")) {
    return { intent: "complaint" as IntentType, sentiment: "negative" as const, keyTopic: "Support & Troubleshooting" };
  }
  if (lower.includes("how to") || lower.includes("how does") || lower.includes("opc") || lower.includes("sap") || lower.includes("modbus") || lower.includes("sensor") || lower.includes("vibration") || lower.includes("protocol")) {
    return { intent: "technical" as IntentType, sentiment, keyTopic: "Technical & Integration" };
  }
  if (lower.includes("versus") || lower.includes("vs") || lower.includes("compared") || lower.includes("difference")) {
    return { intent: "comparison" as IntentType, sentiment, keyTopic: "Comparison" };
  }
  if (lower.includes("feature") || lower.includes("product") || lower.includes("what is") || lower.includes("scio") || lower.includes("capability") || lower.includes("what can")) {
    return { intent: "product_inquiry" as IntentType, sentiment, keyTopic: "Features & Capabilities" };
  }

  return { intent: "general" as IntentType, sentiment, keyTopic: "General Inquiry" };
}

// ============================================================================
// INPUT SANITIZATION & TRUNCATION
// ============================================================================
export function sanitizeInput(query: string): string {
  if (!query) return "";
  let clean = query.slice(0, TOKEN_LIMITS.maxInputChars);
  clean = clean.replace(/<\|endoftext\|>/g, "").replace(/\[SYSTEM_PROMPT\]/gi, "");
  return clean.trim();
}

export function truncateResponse(text: string): string {
  if (!text) return "";
  if (text.length <= TOKEN_LIMITS.maxResponseChars) return text;
  const sliced = text.slice(0, TOKEN_LIMITS.maxResponseChars);
  const lastPeriod = Math.max(sliced.lastIndexOf("."), sliced.lastIndexOf("\n"));
  if (lastPeriod > TOKEN_LIMITS.maxResponseChars * 0.7) {
    return sliced.slice(0, lastPeriod + 1);
  }
  return sliced + "...";
}

// ============================================================================
// SECTOR NORMALIZATION HELPER
// ============================================================================
export function normalizeSectorKey(rawSector: string): "home" | "general" | "energy" | "maritime" | "manufacturing" | "logistics" {
  const s = (rawSector || "").toLowerCase().trim();
  if (s.includes("manufactur") || s.includes("factory") || s.includes("oee") || s.includes("plant")) return "manufacturing";
  if (s.includes("maritime") || s.includes("ship") || s.includes("fleet") || s.includes("vessel")) return "maritime";
  if (s.includes("logistics") || s.includes("cold") || s.includes("supply") || s.includes("reefer")) return "logistics";
  if (s.includes("energy") || s.includes("power") || s.includes("grid") || s.includes("renewable")) return "energy";
  if (s === "general") return "general";
  return "home";
}

// ============================================================================
// SYSTEM PROMPT BUILDER (Strict Company Chatbot Boundaries)
// ============================================================================
export function buildSystemPrompt(rawSector: string, query: string): string {
  const sector = normalizeSectorKey(rawSector);
  const intentMeta = classifyIntent(query);
  const sectorData = PRODUCT_KNOWLEDGE_BASE.sectors[sector] || PRODUCT_KNOWLEDGE_BASE.sectors.home;

  return `You are the official Company AI Assistant for ${PRODUCT_KNOWLEDGE_BASE.platformName}.

YOUR SOLE PURPOSE:
Represent Stellar SCIO. Answer questions exclusively about Stellar SCIO, its features, capabilities, 4 supported industries (Renewable Energy, Maritime, Manufacturing, Logistics), ROI, security, and integration.

WHAT STELLAR SCIO DOES:
${PRODUCT_KNOWLEDGE_BASE.overview}

CURRENT CONTEXT (${sectorData.name.toUpperCase()}):
Highlights:
${sectorData.highlights.map(h => `• ${h}`).join("\n")}

SUPPORTED INTEGRATIONS:
${PRODUCT_KNOWLEDGE_BASE.integrations.join(", ")}

STRICT COMPANY BOUNDARY GUARDRAILS:
1. You are a COMPANY CHATBOT representing Stellar SCIO. You are NOT a general AI coding assistant, language tutor, or trivia bot.
2. DO NOT write general programming code (Python, Flask, C++, SQL, etc.), code tutorials, or custom backend scripts.
3. DO NOT answer off-topic requests (e.g. language lessons, Sindhi/English translation, recipes, homework, general trivia).
4. If the user asks off-topic questions or requests general coding/tutoring, politely decline:
   "I am the official Stellar SCIO Platform Assistant. I am specialized in answering questions about Stellar SCIO's platform, features, industrial operations, and integration. How can I assist you with Stellar SCIO today?"
5. Keep all responses brief, direct, professional, and formatted in 3-4 bullet points using simple English.`;
}

// ============================================================================
// INTELLIGENT FALLBACK (Plain English, Helpful Answers)
// ============================================================================
export function generateIntelligentFallback(rawSector: string, query: string): { text: string; provider: string; suggestedAction?: any } {
  const sector = normalizeSectorKey(rawSector);
  const lower = query.toLowerCase().trim();
  const intent = classifyIntent(query);

  // OFF-TOPIC OR GENERIC CODE/TUTORING GUARDRAIL
  const isOffTopic = lower.includes("sindhi") || lower.includes("teach me") || lower.includes("write code") || lower.includes("write backend") || lower.includes("python code") || lower.includes("flask") || lower.includes("write script") || lower.includes("homework") || lower.includes("recipe") || lower.includes("translate");

  if (isOffTopic) {
    return {
      text: `I am the official **Stellar SCIO Platform Assistant**.\n\n` +
        `My purpose is to assist you with the **Stellar SCIO Platform** — answering questions about our features, enterprise ROI, and industrial operations across Renewable Energy, Maritime, Manufacturing, and Logistics.\n\n` +
        `How can I help you explore Stellar SCIO today?`,
      provider: "Stellar SCIO AI Assistant",
      suggestedAction: { type: "open_beta", label: "Apply for Private Beta Access" }
    };
  }

  // 0. GREETINGS & INTRODUCTIONS (hi, hello, hey, help, who are you)
  const isGreeting = /^(\s*(hi+|hello+|hey+|hola|greetings|good\s+(morning|afternoon|evening)|who\s+are\s+you|help)\s*[\!\?.]*)$/i.test(lower) || lower === "hi" || lower === "hello" || lower === "hey";

  if (isGreeting) {
    if (sector === "home" || sector === "general") {
      return {
        text: `**Hello! Welcome to Stellar SCIO** 👋\n\n` +
          `I am your platform assistant. I can help you with:\n\n` +
          `• **How SCIO Works**: Learn our 4-step loop (Connect ➔ Understand ➔ Predict ➔ Act).\n` +
          `• **Supported Industries**: Explore features for Renewable Energy, Maritime Fleets, Manufacturing, and Logistics.\n` +
          `• **Business Benefits**: See how SCIO reduces downtime and saves **$1.4M–$2.8M per site** annually.\n` +
          `• **Private Beta**: Learn how to join our beta program.\n\n` +
          `What would you like to know today?`,
        provider: "Stellar SCIO AI Assistant",
        suggestedAction: { type: "open_beta", label: "Apply for Private Beta Access" }
      };
    } else {
      const sectorData = PRODUCT_KNOWLEDGE_BASE.sectors[sector as keyof typeof PRODUCT_KNOWLEDGE_BASE.sectors] || PRODUCT_KNOWLEDGE_BASE.sectors.energy;
      return {
        text: `**Hello! Welcome to ${sectorData.name} Operations** 👋\n\n` +
          `I can help answer questions about your operations. Here is what SCIO provides:\n\n` +
          sectorData.highlights.slice(0, 4).map(h => `• ${h}`).join("\n") +
          `\n\nWhat would you like to check today?`,
        provider: `${sectorData.name} Assistant`,
        suggestedAction: { type: "launch_occ", label: `Launch ${sectorData.name} Control Room`, payload: { industry: sector, tab: "dashboard" } }
      };
    }
  }

  // 1. GENERAL PLATFORM OVERVIEW (What is SCIO, tell me about SCIO)
  if (sector === "home" || sector === "general" || lower.includes("what is scio") || lower.includes("what is stellar scio") || lower.includes("tell me about scio") || lower.includes("project overview") || lower.includes("what does this do")) {
    return {
      text: `**Stellar SCIO Platform Overview**:\n\n` +
        `• **What It Does**: Connects industrial equipment, sensor streams, maintenance records, and supply chains into one live dashboard.\n` +
        `• **4 Industries Supported**: Renewable Energy (12.4 GW), Maritime Fleets (48 Ships), Manufacturing 4.0 (Robotic Lines), and Cold-Chain Logistics (Refrigerated Reefers).\n` +
        `• **4-Step Process**: Connects machines ➔ Builds digital twins ➔ Predicts failures 14 days early ➔ Creates work orders in SAP or Maximo.\n` +
        `• **Key Benefits**: Saves **$1.4M to $2.8M per site** annually, reduces false alarms by 91%, and maintains 99.98% uptime.\n` +
        `• **No Hardware Changes Needed**: Connects directly to existing SCADA, OPC-UA, and PLCs.`,
      provider: "Stellar SCIO AI Assistant",
      suggestedAction: { type: "open_beta", label: "Apply for Private Beta Access" }
    };
  }

  // 2. HOW IT WORKS / 4 STEPS
  if (lower.includes("how it works") || lower.includes("4 step") || lower.includes("how scio works") || lower.includes("architecture")) {
    return {
      text: `**How Stellar SCIO Works in 4 Simple Steps**:\n\n` +
        PRODUCT_KNOWLEDGE_BASE.intelligenceLoop.map(s => `• **${s.step}**: ${s.desc}`).join("\n\n") +
        `\n\n• **Zero Hardware Rip-and-Replace**: Connects side-by-side with your existing SCADA, OPC-UA, and PLCs.`,
      provider: "Stellar SCIO AI Assistant",
      suggestedAction: { type: "scroll", label: "View How SCIO Works", payload: "#how-it-works" }
    };
  }

  // 3. ROI / PRICING / BETA
  if (intent.intent === "pricing" || lower.includes("roi") || lower.includes("value") || lower.includes("save") || lower.includes("cost") || lower.includes("price")) {
    return {
      text: `**Stellar SCIO Value & ROI**:\n\n` +
        `• **Cost Reduction**: Saves an average of **$1.4M to $2.8M per site** each year by stopping machine breakdowns before they occur.\n` +
        `• **Fewer False Alarms**: Cuts false alarms by 91%, preventing alarm fatigue for your maintenance teams.\n` +
        `• **14-Day Warning**: Gives engineers 2 to 3 weeks of advance notice to order parts and schedule repairs.\n` +
        `• **Private Beta Program**: We are onboarding select enterprise partners. You can apply today to access the sandbox.`,
      provider: "Stellar SCIO AI Assistant",
      suggestedAction: { type: "open_beta", label: "Apply for Private Beta Access" }
    };
  }

  // 4. INTEGRATION / PROTOCOLS
  if (lower.includes("integration") || lower.includes("connect") || lower.includes("opc") || lower.includes("modbus") || lower.includes("sap") || lower.includes("maximo") || lower.includes("scada")) {
    return {
      text: `**Stellar SCIO Systems & ERP Integration**:\n\n` +
        `• **Machine Protocols**: Connects to **OPC-UA, Modbus, MQTT**, Siemens S7, and Rockwell PLCs.\n` +
        `• **No Hardware Overhaul**: Connects alongside existing SCADA without stopping active machinery.\n` +
        `• **ERP Work Orders**: Automatically creates maintenance work orders and reserves spare parts in **SAP S/4HANA PM & IBM Maximo**.\n` +
        `• **Security**: Built with SOC2 Type II compliance and NERC-CIP audit standards.`,
      provider: "Stellar SCIO AI Assistant",
      suggestedAction: { type: "scroll", label: "Explore Integrations", payload: "#integrations" }
    };
  }

  // 5. MARITIME SPECIFIC
  if (sector === "maritime" || lower.includes("ship") || lower.includes("vessel") || lower.includes("bunker") || lower.includes("port") || lower.includes("safety equipment")) {
    return {
      text: `**Maritime Fleet Operations**:\n\n` +
        `• **Live Ship Tracking**: Real-time satellite GPS tracking for vessel positions, speeds, and port arrival times.\n` +
        `• **Engine Health**: Monitors main engine temperatures, oil pressure, and vibration to prevent failures at sea.\n` +
        `• **Fuel Logs**: Tracks fuel tank levels (HFO/MGO) and daily fuel consumption rates.\n` +
        `• **Safety Checklists**: Automated checklists for lifeboats, fire alarms, and watertight doors to ensure port inspection readiness.`,
      provider: "Maritime Fleet Assistant",
      suggestedAction: { type: "launch_occ", label: "Launch Maritime Fleet Control Center", payload: { industry: "maritime", tab: "dashboard" } }
    };
  }

  // 6. MANUFACTURING SPECIFIC
  if (sector === "manufacturing" || lower.includes("oee") || lower.includes("factory") || lower.includes("cnc") || lower.includes("spindle") || lower.includes("stoppage") || lower.includes("robot")) {
    return {
      text: `**Manufacturing 4.0 & Factory OEE**:\n\n` +
        `• **Real-Time OEE**: Tracks Availability, Performance, and Quality across robotic cells.\n` +
        `• **Downtime Root Causes**: Identifies short conveyor jams and micro-stoppages that cause lost production time.\n` +
        `• **Machine Spindle Wear**: Vibration sensors catch CNC machine spindle bearing wear before tools break.\n` +
        `• **Quality Checks**: Camera vision AI inspects 100% of finished parts to catch defects early.`,
      provider: "Manufacturing Assistant",
      suggestedAction: { type: "launch_occ", label: "Launch Manufacturing Control Center", payload: { industry: "manufacturing", tab: "dashboard" } }
    };
  }

  // 7. LOGISTICS SPECIFIC
  if (sector === "logistics" || lower.includes("cold chain") || lower.includes("reefer") || lower.includes("warehouse") || lower.includes("delay") || lower.includes("supply chain")) {
    return {
      text: `**Cold-Chain & Supply Chain Logistics**:\n\n` +
        `• **Refrigerated Container Monitoring**: Live temperature tracking (-25°C to +4°C) across reefers with breach alerts.\n` +
        `• **Shipment Delay Predictions**: Predicts vendor shipping delays and port congestion 6 to 9 days early.\n` +
        `• **Warehouse Spare Parts**: Syncs warehouse spare parts stock with repair technician work orders.\n` +
        `• **Automated Purchase Orders**: Auto-generates purchase requisitions when spare parts drop below safety stock.`,
      provider: "Logistics Assistant",
      suggestedAction: { type: "launch_occ", label: "Launch Supply Chain Control Center", payload: { industry: "logistics", tab: "dashboard" } }
    };
  }

  const sectorData = PRODUCT_KNOWLEDGE_BASE.sectors[sector as keyof typeof PRODUCT_KNOWLEDGE_BASE.sectors] || PRODUCT_KNOWLEDGE_BASE.sectors.home;

  // DEFAULT
  return {
    text: `**${sectorData.name} Overview**:\n\n` +
      sectorData.highlights.slice(0, 4).map(h => `• ${h}`).join("\n") +
      `\n\nAsk me any question about Stellar SCIO features or how it works!`,
    provider: `${sectorData.name} Assistant`,
    suggestedAction: { type: "launch_occ", label: `Launch ${sectorData.name} Dashboard`, payload: { industry: sector, tab: "dashboard" } }
  };
}

// ============================================================================
// MAIN GENERATE RESPONSE PIPELINE
// ============================================================================
export async function generateResponse(rawSector: string, rawQuery: string) {
  const sector = normalizeSectorKey(rawSector);
  const query = sanitizeInput(rawQuery);

  if (!query) {
    return { error: "Query is required" };
  }

  // 1. Check Semantic Inverted Index & Multi-Tier Cache first
  const cachedResult = chatbotIndexCache.lookup(sector, query);
  if (cachedResult.hit && cachedResult.data) {
    persistChatToConvex(
      sector,
      query,
      cachedResult.data.text,
      cachedResult.data.provider,
      cachedResult.data.suggestedAction
    );
    return cachedResult.data;
  }

  let aiText = "";
  let provider = "Stellar SCIO AI Assistant";
  let suggestedAction: any = null;

  // 2. Select Sector API Keys
  let mistralKey = process.env.MISTRAL_API_KEY || "";
  if (sector === "maritime") {
    mistralKey = process.env.MISTRAL_API_KEY_MARITIME || process.env.MARITIME_MISTRAL_API_KEY || mistralKey;
  } else if (sector === "energy") {
    mistralKey = process.env.MISTRAL_API_KEY_ENERGY || process.env.ENERGY_MISTRAL_API_KEY || mistralKey;
  } else if (sector === "manufacturing") {
    mistralKey = process.env.MISTRAL_API_KEY_MANUFACTURING || process.env.MANUFACTURING_MISTRAL_API_KEY || mistralKey;
  } else if (sector === "logistics") {
    mistralKey = process.env.MISTRAL_API_KEY_LOGISTICS || process.env.LOGISTICS_MISTRAL_API_KEY || mistralKey;
  } else if (sector === "home" || sector === "general") {
    mistralKey = process.env.MISTRAL_API_KEY_HOMEPAGE || mistralKey;
  }

  const systemPrompt = buildSystemPrompt(sector, query);

  // 3. Try Mistral API
  if (mistralKey) {
    try {
      const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${mistralKey}`,
        },
        body: JSON.stringify({
          model: "mistral-small-latest",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: query },
          ],
          temperature: 0.3,
          max_tokens: TOKEN_LIMITS.maxOutputTokens,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        aiText = data.choices?.[0]?.message?.content || "";
        provider = `Stellar SCIO AI Assistant (${sector.toUpperCase()})`;
      }
    } catch (err) {
      console.warn(`Mistral API call failed for sector ${sector}:`, err);
    }
  }

  // 4. Fallback to Gemini API if available
  const geminiKey = process.env.GEMINI_API_KEY || "";
  if (!aiText && geminiKey) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: `${systemPrompt}\n\nUser Question: ${query}` }],
              },
            ],
            generationConfig: {
              maxOutputTokens: TOKEN_LIMITS.maxOutputTokens,
              temperature: 0.3,
            },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        provider = `Stellar SCIO AI Assistant (Gemini)`;
      }
    } catch (err) {
      console.warn(`Gemini API call failed for sector ${sector}:`, err);
    }
  }

  // 5. Fallback to OpenAI if available
  const openaiKey = process.env.OPENAI_API_KEY || "";
  if (!aiText && openaiKey) {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: query },
          ],
          temperature: 0.3,
          max_tokens: TOKEN_LIMITS.maxOutputTokens,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        aiText = data.choices?.[0]?.message?.content || "";
        provider = `Stellar SCIO AI Assistant (OpenAI)`;
      }
    } catch (err) {
      console.warn(`OpenAI API call failed for sector ${sector}:`, err);
    }
  }

  // 6. Intelligent Fallback if all AI APIs fail/unconfigured
  if (!aiText) {
    const fallback = generateIntelligentFallback(sector, query);
    aiText = fallback.text;
    provider = fallback.provider;
    suggestedAction = fallback.suggestedAction;
  }

  // Truncate response safely
  aiText = truncateResponse(aiText);

  // Auto-assign default suggested action if none
  if (!suggestedAction) {
    if (sector === "home" || sector === "general") {
      suggestedAction = { type: "open_beta", label: "Apply for Private Beta Access" };
    } else {
      suggestedAction = {
        type: "launch_occ",
        label: `Launch ${sector.charAt(0).toUpperCase() + sector.slice(1)} Control Room`,
        payload: { industry: sector, tab: "dashboard" },
      };
    }
  }

  const finalResponse = {
    text: aiText,
    provider,
    suggestedAction,
    cacheMeta: {
      hit: false,
      matchType: "Live Generated",
      similarityScore: 0,
      latencyMs: 0,
      indexSize: 1,
    },
  };

  // 7. Store newly synthesized response in index cache
  chatbotIndexCache.store(sector, query, {
    text: aiText,
    provider,
    suggestedAction,
  });

  return finalResponse;
}
