import { NextRequest, NextResponse } from "next/server";
import { chatbotIndexCache } from "../../../../lib/ai/chatbotIndexCache";

// ============================================================================
// 5. DEDICATED COLD-CHAIN & MULTIMODAL LOGISTICS CHATBOT ROUTE (WITH SEMANTIC INDEX & CACHE)
// ============================================================================
const LOGISTICS_SYSTEM_PROMPT = `You are the Cold-Chain & Multimodal Supply Chain AI Copilot for Stellar SCIO.
You assist logistics directors, fleet coordinators, and warehouse managers tracking 142 refrigerated containers (reefers) and cargo routes.

YOUR SCOPE:
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
    const { query } = await req.json();

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    // 1. Check Semantic Inverted Index & Cache first
    const cachedResult = chatbotIndexCache.lookup("logistics", query);
    if (cachedResult.hit && cachedResult.data) {
      return NextResponse.json(cachedResult.data);
    }

    const mistralKey = process.env.MISTRAL_API_KEY_LOGISTICS || process.env.LOGISTICS_MISTRAL_API_KEY || process.env.MISTRAL_API_KEY || "";
    let aiText = "";
    let provider = "Cold-Chain Logistics AI (Mistral)";

    if (mistralKey) {
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
              { role: "system", content: LOGISTICS_SYSTEM_PROMPT },
              { role: "user", content: query }
            ],
            temperature: 0.3,
            max_tokens: 350
          })
        });

        if (response.ok) {
          const data = await response.json();
          aiText = data.choices?.[0]?.message?.content || "";
          provider = "Cold-Chain Copilot (Mistral AI)";
        }
      } catch (err) {
        console.warn("Logistics Mistral API call failed:", err);
      }
    }

    const geminiKey = process.env.GEMINI_API_KEY || "";
    if (geminiKey && !aiText) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `${LOGISTICS_SYSTEM_PROMPT}\n\nUser Question: ${query}` }] }]
          })
        });
        if (response.ok) {
          const data = await response.json();
          aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
          provider = "Cold-Chain Copilot (Gemini AI)";
        }
      } catch (err) {
        console.warn("Logistics Gemini API call failed:", err);
      }
    }

    if (!aiText) {
      aiText = `**Cold-Chain & Supply Chain Logistics Overview**:\n\n` +
        `• **Cold-Chain Temperature Control**: Live IoT temperature monitoring across all 142 refrigerated reefers (-25°C to +4°C) with instant breach alerts.\n` +
        `• **Disruption Risk Forecasting**: Forecasts shipping delays and port bottlenecks 6 to 9 days in advance.\n` +
        `• **Warehouse Spare Parts Staging**: Syncs warehouse spare parts bins with technician maintenance work orders.\n` +
        `• **Automated Purchase Orders**: Auto-generates purchase requisitions when safety stock drops below minimum threshold.`;
    }

    const finalResponse = {
      text: aiText,
      provider,
      suggestedAction: { type: "launch_occ", label: "Launch Supply Chain Control Center", payload: { industry: "logistics", tab: "dashboard" } },
      cacheMeta: {
        hit: false,
        matchType: "Live Generated & Indexed",
        similarityScore: 0,
        latencyMs: 0,
        indexSize: 1
      }
    };

    // 2. Automatically store newly generated answer in the semantic inverted index
    chatbotIndexCache.store("logistics", query, {
      text: aiText,
      provider,
      suggestedAction: finalResponse.suggestedAction
    });

    return NextResponse.json(finalResponse);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to process query" }, { status: 500 });
  }
}

