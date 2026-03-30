import type { AuditReport } from "@/lib/types/audit";

function buildLine(title: string, body: string) {
  return `- ${title}: ${body}`;
}

export function buildMaxPrompt(report: AuditReport | null) {
  const siteName = report?.title ?? "the prospect site";
  const siteUrl = report?.normalizedUrl ?? "the prospect website";
  const executiveSummary =
    report?.executiveSummary ??
    "Lead with a clear first impression, stronger proof, and a shorter path to contact.";
  const topFindings = report?.findings
    .filter((finding) => finding.severity === "high")
    .slice(0, 3)
    .map((finding) => finding.title) ?? [];
  const benchmarkNotes =
    report?.benchmarkReferences.slice(0, 3).map((reference) => reference.note) ?? [];

  return [
    `You are designing a first-pass website redesign for ${siteName} (${siteUrl}).`,
    `Use the live audit, benchmark examples, and current brand assets as the source of truth.`,
    `Goal: make the site feel immediately credible, easier to scan, and more likely to convert.`,
    "",
    buildLine("Current summary", executiveSummary),
    buildLine(
      "Top issues",
      topFindings.length ? topFindings.join("; ") : "Lead friction, clarity, and proof need to improve.",
    ),
    buildLine(
      "Benchmarks",
      benchmarkNotes.length ? benchmarkNotes.join(" ") : "Use strong examples that feel premium, clear, and conversion-led.",
    ),
    buildLine(
      "Design direction",
      "Favor clearer hierarchy, stronger type, better spacing, and example-first storytelling over decorative complexity.",
    ),
    buildLine(
      "Motion direction",
      "Use motion sparingly and purposefully. Support reduced-motion users, keep interactions quick, and avoid distracting effects.",
    ),
    buildLine(
      "Content direction",
      "Keep copy short, confident, and specific. Use the existing website and public social accounts to gather logos, imagery, and brand cues so the first draft feels familiar.",
    ),
    buildLine(
      "Execution",
      "Produce a clean V1 redesign that can be pasted into Lovable, Claude, or Codex and iterated quickly.",
    ),
    "",
    "Return the prompt as a concise build brief, not a long explanation.",
  ].join("\n");
}
