import { NextResponse } from "next/server";

import { getAnthropicClient } from "@/lib/ai/client";
import { getOptionalWorkspaceSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

const SYSTEM = `You are the in-app assistant for WebsiteCreditScore workspace users (agencies and consultants who run website audits and proposals). Be concise, practical, and professional. You help with interpreting audit scores, proposal scope, pricing conversations, and next steps with clients. If asked about data you cannot see, say so and suggest what to check in the product.`;

type ChatMessage = { role?: string; content?: string };

export async function POST(request: Request) {
  const session = await getOptionalWorkspaceSession();
  if (!session) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  let body: { messages?: ChatMessage[] };
  try {
    body = (await request.json()) as { messages?: ChatMessage[] };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const raw = Array.isArray(body.messages) ? body.messages : [];
  const messages = raw
    .filter(
      (m): m is ChatMessage & { role: "user" | "assistant"; content: string } =>
        (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim().length > 0,
    )
    .map((m) => ({ role: m.role, content: m.content.trim() }))
    .slice(-20);

  if (messages.length === 0) {
    return NextResponse.json({ error: "Send at least one user or assistant message." }, { status: 400 });
  }

  const client = getAnthropicClient();
  if (!client) {
    return NextResponse.json(
      { error: "AI assistant is not configured (missing ANTHROPIC_API_KEY)." },
      { status: 503 },
    );
  }

  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1200,
      system: SYSTEM,
      messages,
    });

    const text =
      response.content[0]?.type === "text" ? response.content[0].text.trim() : "";

    if (!text) {
      return NextResponse.json({ error: "Empty model response." }, { status: 502 });
    }

    return NextResponse.json({ message: text });
  } catch (err) {
    console.warn("[api/app/agent-chat]", err);
    return NextResponse.json({ error: "Assistant request failed. Try again shortly." }, { status: 502 });
  }
}
