import { describe, expect, it } from "vitest";
import { highRiskFlags, requiresHighRiskReview } from "@/lib/publication-policy";

describe("publication policy", () => {
  it("holds allegations for explicit human review", () => {
    const report = { red_flags: [{ title: "Fraud allegation", detail: "A reported lawsuit needs attribution.", severity: "high" as const }] };
    expect(requiresHighRiskReview(report)).toBe(true);
    expect(highRiskFlags(report)).toHaveLength(1);
  });

  it("does not block ordinary operational findings", () => {
    const report = { red_flags: [{ title: "Missing pricing", detail: "Visitors cannot compare plans.", severity: "medium" as const }] };
    expect(requiresHighRiskReview(report)).toBe(false);
  });
});
