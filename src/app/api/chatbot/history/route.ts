import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const industry = searchParams.get("industry") || "home";

    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      return NextResponse.json({ success: false, messages: [], reason: "Convex URL not configured" });
    }

    const client = new ConvexHttpClient(convexUrl);
    const history = await client.query(api.queries.getChatHistory, { industry });

    const formattedMessages = history.map((record: any) => ({
      id: record._id,
      sender: record.sender,
      text: record.text,
      timestamp: record.timestamp,
      provider: record.provider,
      suggestedAction: record.suggestedAction,
    }));

    return NextResponse.json({ success: true, messages: formattedMessages });
  } catch (err: any) {
    console.warn("Failed to fetch chat history from Convex:", err);
    return NextResponse.json({ success: false, messages: [], error: err?.message || String(err) });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const industry = searchParams.get("industry") || "home";

    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      return NextResponse.json({ success: false, reason: "Convex URL not configured" });
    }

    const client = new ConvexHttpClient(convexUrl);
    await client.mutation(api.mutations.clearChatHistory, { industry });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.warn("Failed to clear chat history in Convex:", err);
    return NextResponse.json({ success: false, error: err?.message || String(err) });
  }
}
