import type { AuditReport, OutreachEmailTemplate } from "@/lib/types/audit";

export function generateOutreachEmail(report: AuditReport): OutreachEmailTemplate {
  const topFindings = report.findings
    .filter((finding) => finding.severity === "high")
    .slice(0, 3)
    .map((finding) => finding.title);

  return {
    subject: `${report.title}: a few quick website opportunities`,
    previewLine:
      "A short website audit, a concise redesign path, and a few ideas worth considering.",
    body: `Hi team,\n\nI spent a little time reviewing ${report.title} and pulled together a concise website packet. A few things stood out right away: ${topFindings.join("; ")}.\n\nThe opportunity is less about changing everything and more about tightening the message, reducing friction, and making the next step clearer for the right visitor. I attached a short packet with the highest-leverage observations, a suggested direction, and a scope range so you can quickly see whether it feels relevant.\n\nIf helpful, I can also walk you through the packet live and show what I would prioritize first.\n\nBest,\nCraydl Web Design Agency`,
  };
}
