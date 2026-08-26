import { NextRequest, NextResponse } from "next/server";
import { chatbotIndexCache } from "../../../lib/ai/chatbotIndexCache";

// ============================================================================
// 4 DEDICATED INDUSTRIAL COPILOT PROMPTS (ZERO BUZZWORDS, 100% PRACTICAL)
// ============================================================================

// 1. RENEWABLE ENERGY & POWER GRID COPILOT
const ENERGY_SYSTEM_PROMPT = `You are the Energy Operations AI Copilot for Stellar SCIO.
You assist power plant managers and grid operators managing 12.4 GW of solar, wind, and battery storage.

YOUR DOMAIN SCOPE:
• Grid frequency stability (50.02 Hz / 60.00 Hz) and active power load across 8 substations.
• Wind turbine health: gearbox vibration, pitch bearing grease degradation, rotor imbalance.
• Solar PV farms: inverter DC/AC performance ratios (PR), string clipping, thermal hotspots.
• Battery Energy Storage (BESS): cell voltage balance, state of charge (SoC), thermal runaway prevention.
• Substation transformers: oil temperature, gas analysis, load capacity.

RULES:
- Answer ONLY about Renewable Energy & Power Grid operations.
- Keep answers medium-length (120-180 words, 3-4 clean bullet points).
- Use simple, practical engineering language. NO marketing fluff or artificial headers.`;

// 2. MARITIME FLEET & SHIP OPERATIONS COPILOT
const MARITIME_SYSTEM_PROMPT = `You are the Maritime Fleet AI Copilot for Stellar SCIO.
You assist ship captains, chief engineers, and fleet managers managing 12 cargo vessels at sea.

YOUR DOMAIN SCOPE:
• Ship live tracking: vessel GPS positions, speeds, weather delays, and arrival times (ETA) at port.
• Main propulsion engines: cylinder exhaust temperatures, oil pressure, generators, and vibration alerts.
• Fuel management: daily fuel burn rate (metric tons/day) and fuel remaining on board in ship tanks.
• Safety equipment inspections: routine crew checklists for lifeboats, fire alarms, life jackets, emergency generators, and watertight doors.
• Port spare parts & repairs: ordering replacement valves, filters, and seals to meet the ship when it docks at port.
• Crew management: shift schedules, rest hours, and onboard officers.

RULES:
- Answer ONLY about Maritime Fleet & Ship operations.
- Use plain terms: "Safety Equipment Inspections", "Routine Ship Checklists", "Lifeboat Checks", and "Fuel Efficiency Logs".
- Keep answers medium-length (120-180 words, 3-4 clean bullet points).
- Use practical, clear, real-world ship operations language.`;

// 3. MANUFACTURING 4.0 & FACTORY OEE COPILOT
const MANUFACTURING_SYSTEM_PROMPT = `You are the Manufacturing 4.0 AI Copilot for Stellar SCIO.
You assist plant managers, production supervisors, and maintenance teams across 24 robotic cells and CNC lines.

YOUR DOMAIN SCOPE:
• Real-time OEE breakdown: Availability (uptime), Performance (speed), and Quality (good parts vs scrap).
• Micro-stoppage root causes: detecting sub-minute jams and hydraulic pressure drops that cause cumulative downtime.
• Machine health: multi-axis vibration analysis on 5-axis CNC spindles to detect bearing wear before tool breakage.
• Automated work orders: auto-drafting tool changeovers in SAP PM or Maximo when tool wear exceeds threshold.
• Quality quarantine: isolating defect batches automatically based on sensor drift.

RULES:
- Answer ONLY about Manufacturing & Factory OEE operations.
- Keep answers medium-length (120-180 words, 3-4 clean bullet points).
- Use direct, practical factory operations language.`;

// 4. COLD-CHAIN & MULTIMODAL LOGISTICS COPILOT
const LOGISTICS_SYSTEM_PROMPT = `You are the Cold-Chain & Supply Chain AI Copilot for Stellar SCIO.
You assist logistics directors, fleet coordinators, and warehouse managers tracking 142 refrigerated containers (reefers) and cargo routes.

YOUR DOMAIN SCOPE:
• Cold-chain temperature tracking: continuous IoT monitoring of reefer container temperatures (-25°C to +4°C) with immediate breach alerts.
• Disruption forecasting: predicting vendor shipping delays (6-9 days early) and port congestion bottlenecks.
• Warehouse spare parts: synchronizing MRO spare parts stock in warehouse bins with technician work order demand.
• Automated purchase orders: triggering reorder requisitions when critical spare parts drop below safety thresholds.

RULES:
- Answer ONLY about Supply Chain, Cold-Chain, and Warehouse Logistics operations.
- Keep answers medium-length (120-180 words, 3-4 clean bullet points).
- Use clear, practical supply chain operations language.`;

export async function POST(req: NextRequest) {
  try {
    const { query, industry = "energy", context } = await req.json();

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    // 1. Check Semantic Inverted Index & Cache first
    const cachedResult = chatbotIndexCache.lookup(industry, query);
    if (cachedResult.hit && cachedResult.data) {
      return NextResponse.json(cachedResult.data);
    }

    // 4 INDEPENDENT MISTRAL API KEYS FOR 4 DIFFERENT SECTOR CHATBOTS
    let mistralKey = "";
    let activePrompt = ENERGY_SYSTEM_PROMPT;
    let sectorName = "Renewable Energy Grid";

    if (industry === "maritime") {
      mistralKey = process.env.MISTRAL_API_KEY_MARITIME || process.env.MARITIME_MISTRAL_API_KEY || process.env.MARITIME_AI_API_KEY || process.env.MISTRAL_API_KEY || "";
      activePrompt = MARITIME_SYSTEM_PROMPT;
      sectorName = "Maritime Fleet & Ship Operations";
    } else if (industry === "manufacturing") {
      mistralKey = process.env.MISTRAL_API_KEY_MANUFACTURING || process.env.MANUFACTURING_MISTRAL_API_KEY || process.env.MANUFACTURING_AI_API_KEY || process.env.MISTRAL_API_KEY || "";
      activePrompt = MANUFACTURING_SYSTEM_PROMPT;
      sectorName = "Manufacturing 4.0 & Industrial OEE";
    } else if (industry === "logistics") {
      mistralKey = process.env.MISTRAL_API_KEY_LOGISTICS || process.env.LOGISTICS_MISTRAL_API_KEY || process.env.LOGISTICS_AI_API_KEY || process.env.MISTRAL_API_KEY || "";
      activePrompt = LOGISTICS_SYSTEM_PROMPT;
      sectorName = "Cold-Chain & Multimodal Logistics";
    } else {
      // Default: Energy
      mistralKey = process.env.MISTRAL_API_KEY_ENERGY || process.env.ENERGY_MISTRAL_API_KEY || process.env.ENERGY_AI_API_KEY || process.env.MISTRAL_API_KEY || "";
      activePrompt = ENERGY_SYSTEM_PROMPT;
      sectorName = "Renewable Energy & Power Grid";
    }

    let aiText = "";
    let provider = `${sectorName} Neural Copilot`;
    let visualType = "none";
    let suggestedAction: { type: string; label: string; payload?: any } | null = null;

    // 1. Primary Engine: Mistral AI (Uses the sector-specific Mistral key)
    if (mistralKey && !aiText) {
      try {
        const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${mistralKey}`
          },
          body: JSON.stringify({
            model: "mistral-small-latest",
            messages: [
              { role: "system", content: activePrompt },
              { role: "user", content: query }
            ],
            temperature: 0.3,
            max_tokens: 350
          })
        });

        if (response.ok) {
          const data = await response.json();
          aiText = data.choices?.[0]?.message?.content || "";
          provider = `${sectorName} (Mistral AI)`;
        } else {
          console.warn("Mistral API returned non-OK status:", response.status);
        }
      } catch (err) {
        console.warn("Mistral API call failed:", err);
      }
    }

    // 2. Secondary Engine: Gemini AI (Fallback if Mistral key is unavailable or fails)
    const geminiKey = process.env.GEMINI_API_KEY || "";
    if (geminiKey && !aiText) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: `${activePrompt}\n\nUser Question: ${query}` }
                ]
              }
            ]
          })
        });
        if (response.ok) {
          const data = await response.json();
          aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
          provider = `${sectorName} (Gemini AI)`;
        }
      } catch (err) {
        console.warn("Gemini API call failed:", err);
      }
    }

    // 3. Try OpenAI if available
    const openaiKey = process.env.OPENAI_API_KEY || "";
    if (openaiKey && !aiText) {
      try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${openaiKey}`
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: activePrompt },
              { role: "user", content: query }
            ],
            temperature: 0.3,
            max_tokens: 350
          })
        });

        if (response.ok) {
          const data = await response.json();
          aiText = data.choices?.[0]?.message?.content || "";
          provider = `${sectorName} (OpenAI GPT)`;
        }
      } catch (err) {
        console.warn("OpenAI API call failed:", err);
      }
    }

    const lowerQ = query.toLowerCase();

    // 4 INDEPENDENT DOMAIN FALLBACK REASONING (CLEAN & PRACTICAL)
    if (industry === "maritime" || lowerQ.includes("ship") || lowerQ.includes("vessel") || lowerQ.includes("bunker") || lowerQ.includes("port") || lowerQ.includes("engine") || lowerQ.includes("safety equipment")) {
      suggestedAction = { type: "launch_occ", label: "Launch Maritime Fleet Control Center", payload: { industry: "maritime", tab: "dashboard" } };
      if (!aiText) {
        aiText = `**Maritime Fleet & Ship Operations Overview**:\n\n` +
          `• **Live Ship Locations**: Real-time GPS map tracking all 12 ships at sea, their speeds, and estimated arrival times (ETA) at port.\n` +
          `• **Engine & Machinery Health**: Continuous temperature and pressure monitoring on main propulsion engines and generators to catch overheating before breakdowns at sea.\n` +
          `• **Fuel Remaining & Burn Rate**: Live tank levels in metric tons and daily fuel consumption rates to keep fuel costs low.\n` +
          `• **Safety Equipment Inspections**: Scheduled routine checks for lifeboats, fire extinguishers, emergency generators, and life jackets so ships are safe and ready for port checks.\n` +
          `• **Port Spare Parts Delivery**: Automatically orders replacement valves, filters, and gaskets to be delivered directly to the next destination port.`;
      }
    } else if (industry === "manufacturing" || lowerQ.includes("manufacturing") || lowerQ.includes("oee") || lowerQ.includes("cnc") || lowerQ.includes("spindle") || lowerQ.includes("stoppage")) {
      suggestedAction = { type: "launch_occ", label: "Launch Manufacturing 4.0 Control Center", payload: { industry: "manufacturing", tab: "dashboard" } };
      if (!aiText) {
        aiText = `**Manufacturing 4.0 & Factory OEE Intelligence**:\n\n` +
          `• **Real-Time OEE (91.4%)**: Live tracking of Availability, Performance, and Quality across 24 robotic cells and CNC milling centers.\n` +
          `• **Micro-Stoppage Root Causes**: Identifies sub-minute part jams and hydraulic drops that cause 58% of cumulative downtime.\n` +
          `• **Spindle & Bearing Wear**: Multi-axis vibration analysis detects spindle bearing fatigue before parts get damaged.\n` +
          `• **Automated Tool Changeovers**: Auto-drafts maintenance work orders in SAP PM when tool wear limits are reached.`;
      }
    } else if (industry === "logistics" || lowerQ.includes("cold chain") || lowerQ.includes("reefer") || lowerQ.includes("warehouse") || lowerQ.includes("supply chain") || lowerQ.includes("delay")) {
      suggestedAction = { type: "launch_occ", label: "Launch Supply Chain Control Center", payload: { industry: "logistics", tab: "dashboard" } };
      if (!aiText) {
        aiText = `**Cold-Chain & Supply Chain Logistics Overview**:\n\n` +
          `• **Cold-Chain Temperature Control**: Live IoT temperature monitoring across all 142 refrigerated reefers (-25°C to +4°C) with instant breach alerts.\n` +
          `• **Disruption Risk Forecasting**: Forecasts shipping delays and port bottlenecks 6 to 9 days in advance.\n` +
          `• **Warehouse Spare Parts Staging**: Syncs warehouse spare parts bins with technician maintenance work orders.\n` +
          `• **Automated Purchase Orders**: Auto-generates purchase requisitions when safety stock drops below minimum threshold.`;
      }
    } else if (lowerQ.includes("how it works") || lowerQ.includes("4 step") || lowerQ.includes("loop")) {
      suggestedAction = { type: "scroll", label: "View How SCIO Works (4 Steps)", payload: "#how-it-works" };
      if (!aiText) {
        aiText = `Stellar SCIO works in 4 simple steps:\n\n` +
          `1. **STEP 01 — CONNECT**: Connects live machines, sensors, PLCs, and SCADA with zero hardware replacement.\n` +
          `2. **STEP 02 — UNDERSTAND**: Builds a live Digital Twin connecting machines, operating manuals, and maintenance history.\n` +
          `3. **STEP 03 — PREDICT**: Predicts equipment problems and bearing wear 14 days before failure using sensor vibration and temperature.\n` +
          `4. **STEP 04 — ACT**: Automatically drafts repair work orders in SAP or Maximo and orders needed spare parts.`;
      }
    } else {
      // Default Energy
      suggestedAction = { type: "launch_occ", label: "Launch Energy Operations Control Tower", payload: { industry: "energy", tab: "energy-dashboard" } };
      if (!aiText) {
        aiText = `**Renewable Energy & Power Grid Operations**:\n\n` +
          `• **12.4 GW Live Generation**: Real-time power curves and 50.02 Hz frequency synchronization across 8 grid substations.\n` +
          `• **Wind Turbine Health**: Pitch bearing vibration harmonics, gearbox oil temperature, and yaw drive fatigue.\n` +
          `• **Solar PV Performance**: DC/AC performance ratios, string clipping, and thermal hotspot detection.\n` +
          `• **BESS Battery Storage**: Individual cell voltage balancing, state of health, and thermal runaway prevention.`;
      }
    }

    // Store newly generated answer in semantic inverted index
    chatbotIndexCache.store(industry, query, {
      text: aiText,
      provider,
      visualType,
      suggestedAction
    });

    return NextResponse.json({
      text: aiText,
      visualType,
      suggestedAction,
      provider,
      cacheMeta: {
        hit: false,
        matchType: "Live Generated & Indexed",
        similarityScore: 0,
        latencyMs: 0,
        indexSize: 1
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to process query" }, { status: 500 });
  }
}
