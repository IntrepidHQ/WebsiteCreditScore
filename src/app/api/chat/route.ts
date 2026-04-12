import { NextResponse } from "next/server";

import { getAnthropicClient } from "@/lib/ai/client";
import { selectModel } from "@/lib/ai/select-model";

export const dynamic = "force-dynamic";

const SYSTEM_PROMPT = `You are a helpful assistant for WebsiteCreditScore.com visitors.

You help with:
- Drafting outreach emails and sales pitches for website redesign conversations
- Answering general questions about website design, UX, and conversion
- Explaining what makes a website earn trust and drive action
- Simple math and general factual questions

Be concise, practical, and friendly. If someone asks you to draft an email or pitch, do it — don't just describe it. Keep responses focused and useful.

You do not have access to specific audit data unless the user shares it in the conversation.`;

// Module-level in-memory rate limiter (per serverless instance)
// Simple: 5 requests per IP per 60 seconds
const rateLimitMap = new Map<string, { count: number; windowStart: number }>();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60_000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, windowStart: now });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }

  entry.count += 1;
  return true;
}

type ChatMessage = { role?: string; content?: string };

export async function POST(request: Request) {
  // Rate limit by IP
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment and try again." },
      { status: 429 },
    );
  }

  let body: { messages?: ChatMessage[] };
  try {
    body = (await request.json()) as { messages?: ChatMessage[] };
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const raw = Array.isArray(body.messages) ? body.messages : [];
  const messages = raw
    .filter(
      (m): m is { role: "user" | "assistant"; content: string } =>
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim().length > 0,
    )
    .map((m) => ({ role: m.role, content: m.content.trim() }))
    .slice(-12); // Keep last 12 turns to manage context window

  if (messages.length === 0 || messages[messages.length - 1].role !== "user") {
    return NextResponse.json({ error: "Send a user message to start." }, { status: 400 });
  }

  const client = getAnthropicClient();
  if (!client) {
    return NextResponse.json(
      { error: "AI assistant is not available right now." },
      { status: 503 },
    );
  }

  const model = selectModel(messages, false);
  const maxTokens = model.includes("sonnet") ? 1200 : 800;

  try {
    const response = await client.messages.create({
      model,
      max_tokens: maxTokens,
      system: SYSTEM_PROMPT,
      messages,
    });

    const text =
      response.content[0]?.type === "text" ? response.content[0].text.trim() : "";

    if (!text) {
      return NextResponse.json({ error: "Empty response. Try again." }, { status: 502 });
    }

    return NextResponse.json({ message: text });
  } catch (err) {
    console.warn("[api/chat]", err);
    return NextResponse.json({ error: "Request failed. Try again shortly." }, { status: 502 });
  }
}
