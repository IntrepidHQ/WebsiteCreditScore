import { NextResponse } from "next/server";

import { getAnthropicClient } from "@/lib/ai/client";
import { getOptionalWorkspaceSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

const SYSTEM_BASE = `You are the in-app assistant for WebsiteCreditScore workspace users (agencies and consultants who run website audits and proposals). Be concise, practical, and professional.

Capabilities you should lean into:
- Explain category scores as *signals from automated heuristics* (HTML/PageSpeed/structure), not a moral judgment about brand quality — call out when a premium site may score lower because the rubric targets SMB conversion patterns.
- Help craft **coding-agent prompts**: structured briefs with IA, components, acceptance criteria, and explicit ties to score pillars when the user asks.
- Support proposal/pricing conversations using the audit context when provided.

If asked about data you cannot see, say so and suggest what to check in the product.`;

type ChatMessage = { role?: string; content?: string };

type ReportContextPayload = {
  title?: string;
  normalizedUrl?: string;
  overallScore?: number;
  executiveSummary?: string;
  categoryScores?: Array<{ key?: string; label?: string; score?: number }>;
  findings?: Array<{ title?: string; severity?: string }>;
};

const buildReportContextBlock = (ctx: ReportContextPayload) => {
  const lines: string[] = ["## Active audit context (user-supplied snapshot)"];
  if (ctx.title) lines.push(`Site: ${ctx.title}`);
  if (ctx.normalizedUrl) lines.push(`URL: ${ctx.normalizedUrl}`);
  if (typeof ctx.overallScore === "number") lines.push(`Overall score: ${ctx.overallScore.toFixed(1)}/10`);
  if (ctx.executiveSummary) lines.push(`Executive summary: ${ctx.executiveSummary}`);
  if (Array.isArray(ctx.categoryScores) && ctx.categoryScores.length) {
    lines.push("Category scores:");
    ctx.categoryScores.slice(0, 12).forEach((c) => {
      if (c?.label && typeof c.score === "number") {
        lines.push(`- ${c.label} (${c.key ?? "?"}) — ${c.score.toFixed(1)}`);
      }
    });
  }
  if (Array.isArray(ctx.findings) && ctx.findings.length) {
    lines.push("Top findings:");
    ctx.findings.slice(0, 12).forEach((f) => {
      if (f?.title) lines.push(`- [${f.severity ?? "note"}] ${f.title}`);
    });
  }
  lines.push(
    "Use this context when relevant. When the user wants a handoff for Claude Code / Codex / Lovable, output a structured markdown brief: goals, IA, components, copy direction, accessibility/performance acceptance checks, and a final plain-text block they can paste into the builder.",
  );
  return `\n\n${lines.join("\n")}`;
};

export async function POST(request: Request) {
  const session = await getOptionalWorkspaceSession();
  if (!session) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  let body: { messages?: ChatMessage[]; reportContext?: ReportContextPayload };
  try {
    body = (await request.json()) as { messages?: ChatMessage[]; reportContext?: ReportContextPayload };
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

  const reportContext =
    body.reportContext && typeof body.reportContext === "object" ? body.reportContext : null;
  const system = reportContext ? `${SYSTEM_BASE}${buildReportContextBlock(reportContext)}` : SYSTEM_BASE;
  const maxTokens = reportContext ? 2200 : 1200;

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
      max_tokens: maxTokens,
      system,
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
