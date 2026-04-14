import { NextResponse } from "next/server";
import type { MessageParam, ToolResultBlockParam } from "@anthropic-ai/sdk/resources/messages";

import { buildWorkspaceAgentTools, handleWorkspaceAgentTool } from "@/lib/app/agent-chat/run-agent-chat";
import { getAnthropicClient } from "@/lib/ai/client";
import { selectModel } from "@/lib/ai/select-model";
import { getOptionalWorkspaceSessionFromRequest } from "@/lib/auth/session";
import { workspaceHasAgentChatAccess } from "@/lib/billing/max-access";
import { getProductRepository } from "@/lib/product/repository";

export const dynamic = "force-dynamic";

const SYSTEM_BASE = `You are the in-app assistant for WebsiteCreditScore workspace users (agencies and consultants who run website audits and proposals). Be concise, practical, and professional.

Capabilities you should lean into:
- Explain category scores as *signals from automated heuristics* (HTML/PageSpeed/structure), not a moral judgment about brand quality — call out when a premium site may score lower because the rubric targets SMB conversion patterns.
- Help craft **coding-agent prompts**: structured briefs with IA, components, acceptance criteria, and explicit ties to score pillars when the user asks.
- Support proposal/pricing conversations using the audit context when provided.

Industry-aware lens (add this on top of the rubric — do not replace the rubric):
- Different industries imply different “success” on a website: a cosmetic brand may optimize for retail discovery + education; Amazon-like retail optimizes for search, comparison, and checkout trust; some services businesses primarily want a phone call; others want a booked meeting; some want social follows or newsletter growth.
- When you recommend changes, tie recommendations to the likely primary conversion (call, book, buy, signup, follow) inferred from the audit context and page signals.
- If the industry is ambiguous, state the assumption briefly and offer alternatives.

If asked about data you cannot see, say so and suggest what to check in the product.

Pipeline tools:
- Use list_workspace_opportunities when the user asks about their workspace list, stages, or follow-ups.
- Use update_opportunity_stage only when the user explicitly asks to change a stage and you have a valid opportunity id.`;

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
  const session = await getOptionalWorkspaceSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const repository = getProductRepository(session);
  let workspace;
  try {
    workspace = await repository.ensureWorkspace(session, request);
  } catch (err) {
    console.warn("[api/app/agent-chat] ensureWorkspace failed:", err);
    return NextResponse.json(
      {
        error: "Could not load your workspace from the database. Check Supabase migrations and RLS, then refresh.",
        code: "WORKSPACE_LOAD_FAILED",
      },
      { status: 503 },
    );
  }
  if (!workspaceHasAgentChatAccess(workspace)) {
    return NextResponse.json(
      {
        error: "MAX add-on required to use workspace chat.",
        code: "MAX_ENTITLEMENT_REQUIRED",
      },
      { status: 403 },
    );
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

  const model = selectModel(messages, Boolean(reportContext));
  // Sonnet gets more tokens for richer responses; Haiku is fine with fewer
  const maxTokens = reportContext ? 2200 : model.includes("sonnet") ? 1400 : 900;

  const client = getAnthropicClient();
  if (!client) {
    return NextResponse.json(
      { error: "AI assistant is not configured (missing ANTHROPIC_API_KEY)." },
      { status: 503 },
    );
  }

  const tools = buildWorkspaceAgentTools();
  let conversation: MessageParam[] = messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  try {
    for (let round = 0; round < 4; round += 1) {
      const response = await client.messages.create({
        model,
        max_tokens: maxTokens,
        system,
        tools,
        messages: conversation,
      });

      const blocks = response.content;
      const toolUses = blocks.filter((b): b is Extract<typeof b, { type: "tool_use" }> => b.type === "tool_use");

      if (!toolUses.length) {
        const textBlock = blocks.find((b) => b.type === "text" && "text" in b);
        const text =
          textBlock && textBlock.type === "text" && typeof textBlock.text === "string"
            ? textBlock.text.trim()
            : "";

        if (!text) {
          return NextResponse.json({ error: "Empty model response." }, { status: 502 });
        }

        return NextResponse.json({ message: text });
      }

      conversation = [...conversation, { role: "assistant", content: blocks }];

      const toolResults: ToolResultBlockParam[] = [];
      for (const tu of toolUses) {
        const payload = await handleWorkspaceAgentTool(tu.name, tu.input, {
          repository,
          workspaceId: workspace.id,
          session,
        });
        toolResults.push({
          type: "tool_result",
          tool_use_id: tu.id,
          content: payload,
        });
      }

      conversation = [...conversation, { role: "user", content: toolResults }];
    }

    return NextResponse.json({ error: "Tool loop limit reached. Try a narrower question." }, { status: 502 });
  } catch (err) {
    console.warn("[api/app/agent-chat]", err);
    return NextResponse.json({ error: "Assistant request failed. Try again shortly." }, { status: 502 });
  }
}
