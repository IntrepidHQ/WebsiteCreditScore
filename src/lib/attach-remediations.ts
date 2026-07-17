import "server-only";
import type { WCSReport } from "@/lib/schema";
import { remediationForDimension } from "@/lib/remediation";

/**
 * Attach the productized remediation (self-serve actions + the Brainztem add-on
 * that addresses it) to every weak dimension, in place-safe fashion. Runs
 * server-side after the agent submits the report and before it is saved /
 * handed off to SP, so the recommendation travels inside the report to both the
 * WCS report UI and the Strategy Presentation pitch.
 */
export function attachRemediations(
  report: WCSReport,
  tier: "standard" | "nonprofit" = "standard",
): WCSReport {
  return {
    ...report,
    dimensions: report.dimensions.map((dim) => {
      const remediation = remediationForDimension(dim.key, dim.score, tier);
      return remediation ? { ...dim, remediation } : dim;
    }),
  };
}
