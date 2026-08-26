import { NextRequest, NextResponse } from "next/server";
import { chatbotIndexCache } from "../../../../lib/ai/chatbotIndexCache";

// ============================================================================
// 2. DEDICATED RENEWABLE ENERGY & POWER GRID CHATBOT ROUTE (WITH SEMANTIC INDEX & CACHE)
// ============================================================================
const ENERGY_SYSTEM_PROMPT = `You are the Renewable Energy & Power Grid AI Copilot for Stellar SCIO.
You assist power plant managers and grid operators managing 12.4 GW of solar, wind, and battery storage.

YOUR SCOPE:
• Grid frequency stability (50.02 Hz / 60.00 Hz) and active power load across 8 substations.
• Wind turbine health: gearbox vibration, pitch bearing grease degradation, rotor imbalance.
• Solar PV farms: inverter DC/AC performance ratios (PR), string clipping, thermal hotspots.
• Battery Energy Storage (BESS): cell voltage balance, state of charge (SoC), thermal runaway prevention.
• Substation transformers: oil temperature, gas analysis (DGA), load capacity.

RULES:
- Answer ONLY about Renewable Energy & Power Grid operations.
- Keep answers medium-length (120-180 words, 3-4 clean bullet points).
- Use practical, clear engineering terms. NO buzzwords.`;

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    // 1. Check Semantic Inverted Index & Cache first
    const cachedResult = chatbotIndexCache.lookup("energy", query);
    if (cachedResult.hit && cachedResult.data) {
      return NextResponse.json(cachedResult.data);
    }

    const mistralKey = process.env.MISTRAL_API_KEY_ENERGY || process.env.ENERGY_MISTRAL_API_KEY || process.env.MISTRAL_API_KEY || "";
    let aiText = "";
    let provider = "Energy Grid AI (Mistral)";

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
              { role: "system", content: ENERGY_SYSTEM_PROMPT },
              { role: "user", content: query }
            ],
            temperature: 0.3,
            max_tokens: 350
          })
        });

        if (response.ok) {
          const data = await response.json();
          aiText = data.choices?.[0]?.message?.content || "";
          provider = "Energy Grid Copilot (Mistral AI)";
        }
      } catch (err) {
        console.warn("Energy Mistral API call failed:", err);
      }
    }

    const geminiKey = process.env.GEMINI_API_KEY || "";
    if (geminiKey && !aiText) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `${ENERGY_SYSTEM_PROMPT}\n\nUser Question: ${query}` }] }]
          })
        });
        if (response.ok) {
          const data = await response.json();
          aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
          provider = "Energy Grid Copilot (Gemini AI)";
        }
      } catch (err) {
        console.warn("Energy Gemini API call failed:", err);
      }
    }

    if (!aiText) {
      aiText = `**Renewable Energy & Power Grid Operations**:\n\n` +
        `• **12.4 GW Grid Load Balancing**: Real-time power telemetry and 50.02 Hz frequency synchronization across 8 grid substations.\n` +
        `• **Wind Turbine Health**: Pitch bearing vibration FFT harmonics, gearbox oil temperature, and yaw drive fatigue.\n` +
        `• **Solar PV Performance**: DC/AC performance ratios, string clipping, and thermal hotspot detection on Solar Array 02.\n` +
        `• **BESS Battery Storage**: Individual cell voltage balancing, state of health, and thermal runaway prevention.`;
    }

    const finalResponse = {
      text: aiText,
      provider,
      suggestedAction: { type: "launch_occ", label: "Launch Energy Control Room", payload: { industry: "energy", tab: "energy-dashboard" } },
      cacheMeta: {
        hit: false,
        matchType: "Live Generated & Indexed",
        similarityScore: 0,
        latencyMs: 0,
        indexSize: 1
      }
    };

    // 2. Automatically store newly generated answer in the semantic inverted index
    chatbotIndexCache.store("energy", query, {
      text: aiText,
      provider,
      suggestedAction: finalResponse.suggestedAction
    });

    return NextResponse.json(finalResponse);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to process query" }, { status: 500 });
  }
}

