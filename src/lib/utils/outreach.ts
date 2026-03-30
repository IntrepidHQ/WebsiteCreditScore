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
    previewLine: "A short review with the clearest friction points and next-step direction.",
    body: `Hi team,\n\nI reviewed ${report.title} and attached a short audit. The clearest patterns were ${findingLine}.\n\nThe goal is simple: make the site easier to trust, easier to understand, and easier to act on.\n\nIf helpful, I can walk through the top priorities live.\n\nBest,\nWebsiteCreditScore.com`,
  };
}
