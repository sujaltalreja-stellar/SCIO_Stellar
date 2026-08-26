import { NextRequest, NextResponse } from "next/server";
import { generateResponse } from "../../../../lib/ai/chatbotEngine";

// ============================================================================
// DEDICATED MARITIME CHATBOT ROUTE (POWERED BY CHATBOT ENGINE)
// ============================================================================
export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const result = await generateResponse("maritime", query);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to process query" },
      { status: 500 }
    );
  }
}
