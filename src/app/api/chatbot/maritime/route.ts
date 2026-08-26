import { NextRequest, NextResponse } from "next/server";
import { chatbotIndexCache } from "../../../../lib/ai/chatbotIndexCache";

// ============================================================================
// 3. DEDICATED MARITIME FLEET & SHIP OPERATIONS CHATBOT ROUTE (WITH SEMANTIC INDEX & CACHE)
// ============================================================================
const MARITIME_SYSTEM_PROMPT = `You are the Maritime Fleet & Ship Operations AI Copilot for Stellar SCIO.
You assist ship captains, chief engineers, and fleet managers managing 12 cargo vessels at sea.

YOUR SCOPE:
• Ship live tracking: vessel GPS positions, speeds, weather delays, and arrival times (ETA) at port.
• Main propulsion engines: cylinder exhaust temperatures, oil pressure, generators, and vibration alerts.
• Fuel management: daily fuel burn rate (metric tons/day) and fuel remaining on board in ship tanks.
• Safety equipment inspections: routine crew checklists for lifeboats, fire alarms, life jackets, emergency generators, and watertight doors.
• Port spare parts & repairs: ordering replacement valves, filters, and seals to meet the ship when it docks at port.
• Crew management: shift schedules, rest hours, and onboard officers.

RULES:
- Answer ONLY about Maritime Fleet & Ship operations.
- NEVER use robotic buzzwords or acronyms. Use plain terms like "Safety Equipment Inspections", "Lifeboat Checks", and "Fuel Efficiency Logs".
- Keep answers medium-length (120-180 words, 3-4 clean bullet points).
- Use practical, clear, real-world ship operations language.`;

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    // 1. Check Semantic Inverted Index & Cache first
    const cachedResult = chatbotIndexCache.lookup("maritime", query);
    if (cachedResult.hit && cachedResult.data) {
      return NextResponse.json(cachedResult.data);
    }

    const mistralKey = process.env.MISTRAL_API_KEY_MARITIME || process.env.MARITIME_MISTRAL_API_KEY || process.env.MISTRAL_API_KEY || "";
    let aiText = "";
    let provider = "Maritime Fleet AI (Mistral)";

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
              { role: "system", content: MARITIME_SYSTEM_PROMPT },
              { role: "user", content: query }
            ],
            temperature: 0.3,
            max_tokens: 350
          })
        });

        if (response.ok) {
          const data = await response.json();
          aiText = data.choices?.[0]?.message?.content || "";
          provider = "Maritime Fleet Copilot (Mistral AI)";
        }
      } catch (err) {
        console.warn("Maritime Mistral API call failed:", err);
      }
    }

    const geminiKey = process.env.GEMINI_API_KEY || "";
    if (geminiKey && !aiText) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `${MARITIME_SYSTEM_PROMPT}\n\nUser Question: ${query}` }] }]
          })
        });
        if (response.ok) {
          const data = await response.json();
          aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
          provider = "Maritime Fleet Copilot (Gemini AI)";
        }
      } catch (err) {
        console.warn("Maritime Gemini API call failed:", err);
      }
    }

    if (!aiText) {
      aiText = `**Maritime Fleet & Ship Operations Overview**:\n\n` +
        `• **Live Ship Locations**: Real-time GPS map tracking all 12 ships at sea, their speeds, and estimated arrival times (ETA) at port.\n` +
        `• **Engine & Machinery Health**: Continuous temperature and pressure monitoring on main propulsion engines and generators to catch overheating before breakdowns at sea.\n` +
        `• **Fuel Remaining & Burn Rate**: Live tank levels in metric tons and daily fuel consumption rates to keep voyage costs low.\n` +
        `• **Safety Equipment Inspections**: Scheduled routine checks for lifeboats, fire extinguishers, emergency generators, and life jackets so ships are safe and ready for port checks.\n` +
        `• **Port Spare Parts Delivery**: Automatically orders replacement valves, filters, and gaskets to be delivered directly to the next destination port.`;
    }

    const finalResponse = {
      text: aiText,
      provider,
      suggestedAction: { type: "launch_occ", label: "Launch Maritime Fleet Control Center", payload: { industry: "maritime", tab: "dashboard" } },
      cacheMeta: {
        hit: false,
        matchType: "Live Generated & Indexed",
        similarityScore: 0,
        latencyMs: 0,
        indexSize: 1
      }
    };

    // 2. Automatically store newly generated answer in the semantic inverted index
    chatbotIndexCache.store("maritime", query, {
      text: aiText,
      provider,
      suggestedAction: finalResponse.suggestedAction
    });

    return NextResponse.json(finalResponse);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to process query" }, { status: 500 });
  }
}

