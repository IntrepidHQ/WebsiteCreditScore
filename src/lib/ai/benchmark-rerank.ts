import { getAnthropicClient } from "@/lib/ai/client";
import type { BenchmarkReference, ReportProfileType, SiteObservation } from "@/lib/types/audit";

function buildObservationSnippet(observation: SiteObservation): string {
  const lines: string[] = [];
  if (observation.pageTitle) lines.push(`Title: ${observation.pageTitle}`);
  if (observation.heroHeading) lines.push(`Hero: ${observation.heroHeading}`);
  if (observation.aboutSnippet) lines.push(`About: ${observation.aboutSnippet.slice(0, 400)}`);
  if (observation.primaryCtas?.length)
    lines.push(`CTAs: ${observation.primaryCtas.slice(0, 5).join(" | ")}`);
  return lines.join("\n") || "(limited page text)";
}

/**
 * Ask Claude to pick the three best benchmark sites for this audit from a fixed candidate list.
 * Returns null if the API is unavailable, the response is invalid, or any id is not in the list.
 */
export async function rerankBenchmarkReferencesWithClaude(input: {
  siteObservation: SiteObservation;
  clientProfileType: ReportProfileType;
  normalizedUrl: string;
  candidates: BenchmarkReference[];
}): Promise<BenchmarkReference[] | null> {
  const client = getAnthropicClient();
  if (!client || !input.siteObservation.fetchSucceeded) {
    return null;
  }

  if (input.candidates.length < 3) {
    return null;
  }

  const allowedIds = new Set(input.candidates.map((c) => c.id));
  const catalog = input.candidates.map((c) => ({
    id: c.id,
    name: c.name,
    url: c.url,
    measuredScore: c.measuredScore ?? c.targetScore,
  }));

  const prompt = `You are helping pick three real benchmark websites to compare against a scored prospect site.
Prospect URL: ${input.normalizedUrl}
Report profile type: ${input.clientProfileType}

Page signals (from the prospect site only — do not invent facts):
${buildObservationSnippet(input.siteObservation)}

Candidate benchmarks (you MUST only choose from these ids — exactly three distinct ids):
${JSON.stringify(catalog, null, 2)}

Pick the three candidates that would best help this business owner learn from sites that are:
- plausibly relevant to the same kind of buyer journey or service model suggested by the page signals,
- strong on trust, clarity, and conversion patterns,
- diverse from each other (not three near-duplicates).

Return ONLY valid JSON with this exact shape (no markdown):
{"orderedIds":["id1","id2","id3"]}

Each id must appear exactly once and must be one of the candidate ids listed above.`;

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 400,
      messages: [{ role: "user", content: prompt }],
    });

    const text =
      message.content[0]?.type === "text" ? message.content[0].text.trim() : "";
    if (!text) {
      return null;
    }

    const cleaned = text.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
    const parsed = JSON.parse(cleaned) as { orderedIds?: unknown };
    if (!Array.isArray(parsed.orderedIds) || parsed.orderedIds.length < 3) {
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

    if (unique.length < 3) {
      return null;
    }

    const byId = new Map(input.candidates.map((c) => [c.id, c]));
    const chosen = unique.slice(0, 3).map((id) => byId.get(id)!);
    return chosen;
  } catch (err) {
    console.warn("[ai/benchmark-rerank] Failed, using heuristic benchmarks:", err);
    return null;
  }
}
