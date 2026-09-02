import type { WCSReport } from "@/lib/schema";

const HIGH_RISK_TERMS = /\b(scam|fraud|criminal|crime|abuse|assault|misconduct|lawsuit|illegal|deception)\b/i;

export type HighRiskFlag = WCSReport["red_flags"][number] & { reason: "high-risk-claim" };

/** Find allegations that require human review before a report becomes a public example. */
export function highRiskFlags(report: Pick<WCSReport, "red_flags">): HighRiskFlag[] {
  return report.red_flags
    .filter((flag) => HIGH_RISK_TERMS.test(`${flag.title} ${flag.detail}`))
    .map((flag) => ({ ...flag, reason: "high-risk-claim" as const }));
}

export function requiresHighRiskReview(report: Pick<WCSReport, "red_flags">): boolean {
  return highRiskFlags(report).length > 0;
}
