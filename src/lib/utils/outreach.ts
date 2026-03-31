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
  const scoreLine = `${report.title} scored ${report.overallScore.toFixed(1)} in my review`;
  const opportunityLine =
    report.categoryScores
      .slice()
      .sort((left, right) => left.score - right.score)
      .slice(0, 2)
      .map((item) => item.label.toLowerCase())
      .join(" and ") || "clarity and trust";

  return {
    subject: `${report.title}: scored ${report.overallScore.toFixed(1)} in review`,
    previewLine: `Lead with the score, then frame the clearest gains in ${opportunityLine}.`,
    body: `Hi team,\n\n${scoreLine}. The clearest opportunity is in ${opportunityLine}.\n\nI attached a short audit showing where the site is creating friction around ${findingLine}.\n\nThe goal is simple: make the site easier to trust, easier to understand, and easier to act on.\n\nIf helpful, I can walk through the highest-leverage fixes live.\n\nBest,\nWebsiteCreditScore.com`,
  };
}
