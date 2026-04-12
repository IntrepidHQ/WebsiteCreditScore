/**
 * Smart model selection: Sonnet 4.6 for design/complex tasks, Haiku for simple Q&A.
 * This keeps credit spend low while ensuring quality where it matters.
 */

export const HAIKU = "claude-haiku-4-5-20251001";
export const SONNET = "claude-sonnet-4-6";

const DESIGN_KEYWORDS = [
  "design",
  "redesign",
  "proposal",
  "outreach",
  "pitch",
  "handoff",
  "brief",
  "audit",
  "layout",
  "component",
  "hero",
  "copy",
  "landing",
  "conversion",
  "trust",
  "visual",
  "email",
  "draft",
  "website",
  "ux",
  "ui",
  "typography",
  "color",
  "brand",
  "client",
];

/**
 * Picks the cheapest model that can handle the request well.
 *
 * Rules:
 * - Audit context present → always Sonnet (richer context, needs nuance)
 * - Message contains design/outreach keywords → Sonnet
 * - Message is longer than 200 chars → Sonnet (complex question)
 * - Everything else → Haiku (math, factual, simple Q&A)
 */
export function selectModel(
  messages: Array<{ role: string; content: string }>,
  hasAuditContext: boolean,
): string {
  if (hasAuditContext) return SONNET;

  const last = [...messages].reverse().find((m) => m.role === "user");
  if (!last) return HAIKU;

  const lc = last.content.toLowerCase();
  const isDesign = DESIGN_KEYWORDS.some((kw) => lc.includes(kw));
  const isLong = last.content.length > 200;

  return isDesign || isLong ? SONNET : HAIKU;
}
