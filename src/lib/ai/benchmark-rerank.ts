import { getAnthropicClient } from "@/lib/ai/client";
import {
  buildAiCacheKey,
  readAiCache,
  writeAiCache,
} from "@/lib/ai/ai-response-cache";
import { REPORT_COMPETITOR_REFERENCE_LIMIT } from "@/lib/benchmarks/report-limits";
import type {
  BenchmarkReference,
  ReportProfileType,
  SiteNiche,
  SiteObservation,
} from "@/lib/types/audit";

function buildObservationSnippet(observation: SiteObservation): string {
  const lines: string[] = [];
  if (observation.pageTitle) lines.push(`Title: ${observation.pageTitle}`);
  if (observation.heroHeading) lines.push(`Hero: ${observation.heroHeading}`);
  if (observation.aboutSnippet) lines.push(`About: ${observation.aboutSnippet.slice(0, 400)}`);
  if (observation.primaryCtas?.length)
    lines.push(`CTAs: ${observation.primaryCtas.slice(0, 5).join(" | ")}`);
  return lines.join("\n") || "(limited page text)";
}

type BenchmarkRerankCachePayload = {
  orderedIds: string[];
};

/**
 * Ask Claude to pick benchmark sites for this audit from a fixed candidate list.
 * Results are cached in Supabase (service role) to reduce repeat API spend.
 */
export async function rerankBenchmarkReferencesWithClaude(input: {
  siteObservation: SiteObservation;
  clientProfileType: ReportProfileType;
  normalizedUrl: string;
  industryTags?: string[];
  niche?: SiteNiche;
  candidates: BenchmarkReference[];
}): Promise<BenchmarkReference[] | null> {
  const client = getAnthropicClient();
  if (!client || !input.siteObservation.fetchSucceeded) {
    return null;
  }

  if (input.candidates.length < REPORT_COMPETITOR_REFERENCE_LIMIT) {
    return null;
  }

  const cacheMaterial = [
    "v2-industry-alignment",
    input.normalizedUrl,
    input.clientProfileType,
    input.niche ?? "",
    (input.industryTags ?? []).join("|"),
    input.candidates.map((c) => c.id).join(","),
  ].join("::");
  const cacheKey = buildAiCacheKey("benchmark-rerank", cacheMaterial);

  const cached = await readAiCache<BenchmarkRerankCachePayload>(cacheKey);
  if (cached?.orderedIds?.length === REPORT_COMPETITOR_REFERENCE_LIMIT) {
    const allowedIds = new Set(input.candidates.map((c) => c.id));
    const byId = new Map(input.candidates.map((c) => [c.id, c]));
    const resolved = cached.orderedIds
      .filter((id) => allowedIds.has(id))
      .map((id) => byId.get(id)!)
      .filter(Boolean);
    if (resolved.length === REPORT_COMPETITOR_REFERENCE_LIMIT) {
      return resolved;
    }
  }

  const allowedIds = new Set(input.candidates.map((c) => c.id));
  const catalog = input.candidates.map((c) => ({
    id: c.id,
    name: c.name,
    url: c.url,
    measuredScore: c.measuredScore ?? c.targetScore,
  }));

  const industryContext = [
    input.niche ? `Detected niche classifier: ${input.niche}` : null,
    input.industryTags?.length ? `Industry tags (for indexing / matching): ${input.industryTags.join(", ")}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const prompt = `You are helping pick ${REPORT_COMPETITOR_REFERENCE_LIMIT} real benchmark websites to compare against a scored prospect site.
Prospect URL: ${input.normalizedUrl}
Report profile type: ${input.clientProfileType}

Industry / indexing context (may be incomplete — still obey the hard rule below):
${industryContext || "(none)"}

Page signals (from the prospect site only — do not invent facts):
${buildObservationSnippet(input.siteObservation)}

Candidate benchmarks (you MUST only choose from these ids — exactly ${REPORT_COMPETITOR_REFERENCE_LIMIT} distinct ids):
${JSON.stringify(catalog, null, 2)}

Hard requirements:
- Each chosen benchmark must be plausibly in the SAME industry / buyer journey as the prospect (do not pick unrelated verticals).
- Prefer sites selling to similar customers (e.g. B2B SaaS vs consumer retail vs local services).
- Strong on trust, clarity, and conversion patterns.
- Diverse from each other (not ${REPORT_COMPETITOR_REFERENCE_LIMIT} near-duplicates).

Return ONLY valid JSON with this exact shape (no markdown):
{"orderedIds":["id1","id2","id3","id4"]}

Each id must appear exactly once and must be one of the candidate ids listed above.`;

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 520,
      messages: [{ role: "user", content: prompt }],
    });

    const text =
      message.content[0]?.type === "text" ? message.content[0].text.trim() : "";
    if (!text) {
      return null;
    }

    const cleaned = text.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
    const parsed = JSON.parse(cleaned) as { orderedIds?: unknown };
    if (!Array.isArray(parsed.orderedIds) || parsed.orderedIds.length < REPORT_COMPETITOR_REFERENCE_LIMIT) {
      return null;
    }

    const ids = parsed.orderedIds
      .filter((id): id is string => typeof id === "string")
      .filter((id) => allowedIds.has(id));

    const seen = new Set<string>();
    const unique = ids.filter((id) => {
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });

    if (unique.length < REPORT_COMPETITOR_REFERENCE_LIMIT) {
      return null;
    }

    const byId = new Map(input.candidates.map((c) => [c.id, c]));
    const chosen = unique.slice(0, REPORT_COMPETITOR_REFERENCE_LIMIT).map((id) => byId.get(id)!);

    await writeAiCache(cacheKey, "benchmark-rerank", { orderedIds: chosen.map((c) => c.id) });

    return chosen;
  } catch (err) {
    console.warn("[ai/benchmark-rerank] Failed, using heuristic benchmarks:", err);
    return null;
  }
}
