import { getAnthropicClient } from "@/lib/ai/client";
import type { AuditReport } from "@/lib/types/audit";

import { serializeAuditForMaxHandoff } from "@/lib/max/serialize-report-for-handoff";

// Default to Sonnet 4.6 for high-quality design handoffs; override via env if needed
const MODEL = process.env.ANTHROPIC_MAX_MODEL?.trim() || "claude-sonnet-4-6";

/**
 * Claude-generated build handoff: structured, pricing-aware, coding-agent ready.
 */
export async function generateMaxHandoffWithClaude(
  report: AuditReport,
  assetUrls: string[],
): Promise<string | null> {
  const client = getAnthropicClient();
  if (!client) {
    return null;
  }

  const rawPayload = serializeAuditForMaxHandoff(report, assetUrls);

  // Guard against pathologically large inputs that would waste the context window
  const payloadJson = JSON.stringify(rawPayload);
  const payload =
    payloadJson.length > 60_000
      ? {
          ...rawPayload,
          findings: Array.isArray(rawPayload.findings) ? rawPayload.findings.slice(0, 10) : rawPayload.findings,
          benchmarkReferences: Array.isArray(rawPayload.benchmarkReferences)
            ? rawPayload.benchmarkReferences.slice(0, 5)
            : rawPayload.benchmarkReferences,
          opportunities: Array.isArray(rawPayload.opportunities)
            ? rawPayload.opportunities.slice(0, 8)
            : rawPayload.opportunities,
        }
      : rawPayload;

  const userContent = [
    "You are a principal web strategist and design engineer. Produce a single markdown document that a coding agent (e.g. Claude Code, Codex, Lovable) can execute without follow-up questions.",
    "",
    "Requirements:",
    "1) Start with a one-paragraph executive brief tied to the business goal.",
    "2) Propose information architecture: pages/sections with H2/H3 structure.",
    "3) For each audit category score, list concrete UI/content/engineering actions that would lift that score (reference the category key).",
    "4) Map work to the pricing bundle: base + recommended add-ons — include a table or bullet checklist of deliverables that match estimated lifts.",
    "5) List acceptance criteria (a11y basics, performance, SEO hygiene) grounded in the findings.",
    "6) Include a 'Component inventory' section (hero, nav, proof strip, CTA band, footer, forms, etc.).",
    "7) If dataroomImageUrls are non-empty, instruct the builder to embed those exact URLs (hero, gallery, logo treatments) and name where each is used.",
    "8) End with a 'Paste-ready prompt for the coding agent' — second person, imperative, single fenced block of plain text (no markdown inside the block).",
    "",
    "Audit JSON:",
    JSON.stringify(payload),
  ].join("\n");

  try {
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 8192,
      messages: [{ role: "user", content: userContent }],
    });

    const text =
      message.content[0]?.type === "text" ? message.content[0].text.trim() : "";

    return text || null;
  } catch (err) {
    console.warn("[max/ai-generate-handoff]", err);
    return null;
  }
}
