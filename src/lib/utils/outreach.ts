import type { AuditReport, OutreachEmailTemplate } from "@/lib/types/audit";

export function generateOutreachEmail(report: AuditReport): OutreachEmailTemplate {
  const topFindings = report.findings
    .filter(
      (finding) =>
        finding.section !== "what-working" &&
        finding.confidenceLevel !== "recommended",
    )
    .slice(0, 3)
    .map((finding) => finding.title);
  const findingLine = topFindings.length
    ? topFindings.join("; ")
    : "the first impression, response path, and trust sequence";

  return {
    subject: `${report.title}: a few quick website observations`,
    previewLine:
      "A short website review with the clearest friction points, a tighter direction, and a sensible next step.",
    body: `Hi team,\n\nI reviewed ${report.title} and attached a short website review. The clearest patterns were ${findingLine}.\n\nThe opportunity is to make the site easier to trust, easier to understand, and easier to act on without losing what already works.\n\nThe review stays concise: what is working now, what is likely holding response back, and the scope I would start with first.\n\nIf helpful, I can walk through it live and show what I would prioritize first.\n\nBest,\nCraydl Web Design Agency`,
  };
}
