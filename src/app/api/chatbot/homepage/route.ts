import { NextRequest, NextResponse } from "next/server";
import { chatbotIndexCache } from "../../../../lib/ai/chatbotIndexCache";

// ============================================================================
// 1. DEDICATED HOME PAGE CHATBOT ROUTE (WITH SEMANTIC INDEX & CACHE)
// ============================================================================
const HOMEPAGE_SYSTEM_PROMPT = `You are the Stellar SCIO Executive AI Companion on the Home Page.
You guide enterprise executives and engineers through the Stellar SCIO platform.

YOUR SCOPE:
• Platform Overview: Explain how SCIO unifies operations across Renewable Energy, Maritime Fleets, Manufacturing 4.0, and Cold-Chain Logistics.
• 4-Step Intelligence Loop:
  1. CONNECT: Ingest live machine, PLC, and sensor telemetry (OPC-UA, Modbus, MQTT Sparkplug B) with zero hardware replacement.
  2. UNDERSTAND: Construct semantic digital twins connecting physical assets, operating manuals, and maintenance logs.
  3. PREDICT: Predict bearing failure and equipment anomalies 14 days before breakdown.
  4. ACT: Automatically draft work orders in SAP S/4HANA PM and IBM Maximo and stage spare parts.
• Private Beta Program: Guide users to apply for the private beta sandbox.

RULES:
- Keep responses medium-length (120-180 words, 3-4 clean bullet points).
- Use clear, practical enterprise language. NO buzzwords, NO fake headers.`;

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    // 1. Check Semantic Inverted Index & Cache first
    const cachedResult = chatbotIndexCache.lookup("homepage", query);
    if (cachedResult.hit && cachedResult.data) {
      return NextResponse.json(cachedResult.data);
    }

    const mistralKey = process.env.MISTRAL_API_KEY_HOMEPAGE || process.env.MISTRAL_API_KEY || "";
    let aiText = "";
    let provider = "SCIO Executive AI (Home)";

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
              { role: "system", content: HOMEPAGE_SYSTEM_PROMPT },
              { role: "user", content: query }
            ],
            temperature: 0.3,
            max_tokens: 350
          })
        });

        if (response.ok) {
          const data = await response.json();
          aiText = data.choices?.[0]?.message?.content || "";
          provider = "SCIO Home Companion (Mistral AI)";
        }
      } catch (err) {
        console.warn("Home Mistral API call failed:", err);
      }
    }

    // Secondary fallback: Gemini if available
    const geminiKey = process.env.GEMINI_API_KEY || "";
    if (geminiKey && !aiText) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `${HOMEPAGE_SYSTEM_PROMPT}\n\nUser Question: ${query}` }] }]
          })
        });
        if (response.ok) {
          const data = await response.json();
          aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
          provider = "SCIO Home Companion (Gemini AI)";
        }
      } catch (err) {
        console.warn("Home Gemini API call failed:", err);
      }
    }

    if (!aiText) {
      aiText = `**Stellar SCIO Enterprise Operations Platform**:\n\n` +
        `• **Unified Across 4 Sectors**: Purpose-built intelligence for Renewable Energy (12.4 GW), Maritime Fleets (12 Ships), Manufacturing 4.0 (91.4% OEE), and Cold-Chain Logistics (142 Reefers).\n` +
        `• **4-Step Closed Loop**: CONNECT live telemetry → UNDERSTAND digital twins → PREDICT issues 14 days early → ACT in SAP/Maximo.\n` +
        `• **Zero Hardware Rip-and-Replace**: Connects directly to existing OPC-UA, Modbus, MQTT, and SCADA without replacing PLCs.\n` +
        `• **Join Private Beta**: Access our interactive operations sandbox and experience live predictive maintenance.`;
    }

    const finalResponse = {
      text: aiText,
      provider,
      suggestedAction: { type: "open_beta", label: "Apply for Private Beta Access" },
      cacheMeta: {
        hit: false,
        matchType: "Live Generated & Indexed",
        similarityScore: 0,
        latencyMs: 0,
        indexSize: 1
      }
    };

    // 2. Automatically store newly generated answer in the semantic inverted index
    chatbotIndexCache.store("homepage", query, {
      text: aiText,
      provider,
      suggestedAction: finalResponse.suggestedAction
    });

    return NextResponse.json(finalResponse);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to process query" }, { status: 500 });
  }
}

