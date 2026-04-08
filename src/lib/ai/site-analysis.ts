/**
 * AI-powered site analysis using Claude.
 *
 * Replaces template-based content generation (generic audience, primaryGoal,
 * industryLabel, executiveSummary, outreach email) with Claude-written copy
 * grounded in the actual content scraped from the site. Nothing is invented —
 * Claude is explicitly instructed to derive everything from provided signals.
 *
 * Designed to degrade gracefully: returns null when ANTHROPIC_API_KEY is
 * absent or when the API call fails, allowing the heuristic fallbacks to run.
 */

import type { SiteObservation } from "@/lib/types/audit";
import { getAnthropicClient } from "@/lib/ai/client";

export interface AISiteAnalysis {
  /** Short industry label, e.g. "B2B SaaS", "Dental Practice", "Coffee Franchise" */
  industryLabel: string;
  /** 1–2 sentences describing what the business does, based on page copy. */
  businessDescription: string;
  /** Who their likely customers are, inferred from messaging and CTAs. */
  audienceProfile: string;
  /** What the site is trying to get visitors to do (primary conversion goal). */
  primaryGoal: string;
  /** 2–3 sentence audit executive summary: what works and the biggest opportunity. */
  executiveSummary: string;
  /** Cold outreach email subject line. */
  outreachSubject: string;
  /** Single-sentence email preview/preheader. */
  outreachPreview: string;
  /** Short personalized cold email body (4–6 sentences). */
  outreachBody: string;
}

function buildObservationContext(url: string, observation: SiteObservation): string {
  const lines: string[] = [`URL: ${url}`];

  if (observation.pageTitle) lines.push(`Page title: ${observation.pageTitle}`);
  if (observation.metaDescription) lines.push(`Meta description: ${observation.metaDescription}`);
  if (observation.heroHeading) lines.push(`Hero heading: ${observation.heroHeading}`);
  if (observation.aboutSnippet) lines.push(`About / intro copy: ${observation.aboutSnippet}`);
  if (observation.primaryCtas?.length)
    lines.push(`Primary calls-to-action: ${observation.primaryCtas.slice(0, 6).join(" | ")}`);
  if (observation.trustSignals?.length)
    lines.push(`Trust signals: ${observation.trustSignals.slice(0, 6).join(", ")}`);
  if (observation.notableDetails?.length)
    lines.push(`Notable details: ${observation.notableDetails.slice(0, 4).join(", ")}`);

  return lines.join("\n");
}

function buildPrompt(
  url: string,
  observation: SiteObservation,
  overallScore: number,
): string {
  const context = buildObservationContext(url, observation);
  const scoreFormatted = overallScore.toFixed(1);

  return `You are analyzing a real website audit. Use ONLY the page data provided below — do not invent facts, claims, or details that are not present in the content.

WEBSITE DATA:
${context}

AUDIT SCORE: ${scoreFormatted} / 10

Respond with ONLY a valid JSON object (no markdown fences, no explanation). Use these exact keys:

{
  "industryLabel": "2–5 word label for the type of business (e.g. 'Dental Practice', 'B2B SaaS', 'Local Roofing Company', 'Coffee Franchise')",
  "businessDescription": "1–2 sentences describing what this business does, drawn from their actual page copy. If data is thin, keep it short and factual.",
  "audienceProfile": "1–2 sentences describing who their likely customers are, based on the CTAs, messaging tone, and any visible targeting signals.",
  "primaryGoal": "1 sentence stating what the website is trying to get visitors to do (book, buy, call, sign up, etc.).",
  "executiveSummary": "2–3 sentences for an audit report: start with what the site does well, then name the single biggest opportunity to improve trust, clarity, or conversion. Be specific — reference actual findings like score ${scoreFormatted}/10, the hero heading, or missing trust signals.",
  "outreachSubject": "A concise cold email subject line that references the site name and score. Example: 'Quick note on [Brand] — scored ${scoreFormatted} in review'",
  "outreachPreview": "One sentence email preview/preheader that teases the audit finding without being pushy.",
  "outreachBody": "A short, human-sounding cold email body (4–6 sentences). Reference the specific business and what you noticed. Lead with insight, not a sales pitch. End with a single soft ask like offering to share the full report or walk through the findings."
}

Rules:
- If page data is sparse, keep descriptions short and conservative — do not pad with generic industry clichés.
- The outreach email must feel personal and specific to this business, not a template.
- Respond with only the JSON object.`;
}

/**
 * Analyze a website using Claude and return AI-written content to replace
 * template-based report fields. Returns null if the API key is missing or
 * the call fails, allowing heuristic fallbacks to take over.
 */
export async function analyzeSiteWithAI(
  url: string,
  observation: SiteObservation,
  overallScore: number,
): Promise<AISiteAnalysis | null> {
  const client = getAnthropicClient();
  if (!client) return null;

  // If the site fetch failed entirely, there's not enough data for AI to work with.
  if (!observation.fetchSucceeded) return null;

  try {
    const prompt = buildPrompt(url, observation, overallScore);

    const message = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 1200,
      messages: [{ role: "user", content: prompt }],
    });

    const text =
      message.content[0]?.type === "text" ? message.content[0].text.trim() : "";

    if (!text) return null;

    // Strip markdown code fences if the model added them despite instructions
    const cleaned = text.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();

    const parsed = JSON.parse(cleaned) as Partial<AISiteAnalysis>;

    // Validate that required fields exist and are non-empty strings
    const required: (keyof AISiteAnalysis)[] = [
      "industryLabel",
      "businessDescription",
      "audienceProfile",
      "primaryGoal",
      "executiveSummary",
      "outreachSubject",
      "outreachPreview",
      "outreachBody",
    ];

    for (const key of required) {
      if (typeof parsed[key] !== "string" || !parsed[key]) {
        console.warn(`[ai/site-analysis] Missing or empty field: ${key}`);
        return null;
      }
    }

    return parsed as AISiteAnalysis;
  } catch (err) {
    console.warn("[ai/site-analysis] Analysis failed, falling back to heuristics:", err);
    return null;
  }
}
