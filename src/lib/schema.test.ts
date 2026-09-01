import { describe, expect, it } from "vitest";
import { DIMENSION_KEYS, DIMENSION_WEIGHTS, WCSReportSchema } from "@/lib/schema";

function validReport() {
  return {
    domain: "example.com",
    scanned_at: new Date(0).toISOString(),
    overall: { score: 70, grade: "B-", headline: "A credible example", one_liner: "A complete test report." },
    dimensions: DIMENSION_KEYS.map((key) => ({
      key,
      label: key,
      score: 70,
      grade: "B-",
      weight: DIMENSION_WEIGHTS[key],
      verdict: "Evidence supports this score.",
      evidence: [{ claim: "Evidence supports this score.", url: "https://example.com/evidence" }],
    })),
    red_flags: [],
    green_flags: [],
    sources: Array.from({ length: 12 }, (_, index) => ({
      url: `https://example.com/source-${index}`,
      title: `Source ${index}`,
    })),
    summary: "A complete test report.",
  };
}

describe("WCSReportSchema", () => {
  it("accepts one complete canonical set of dimensions", () => {
    expect(WCSReportSchema.safeParse(validReport()).success).toBe(true);
  });

  it("rejects duplicate dimensions even when there are ten entries", () => {
    const report = validReport();
    report.dimensions[9].key = "legitimacy";

    const parsed = WCSReportSchema.safeParse(report);
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues.some((issue) => issue.path[0] === "dimensions")).toBe(true);
    }
  });

  it("rejects a report that pads its source count with duplicate URLs", () => {
    const report = validReport();
    report.sources[11].url = report.sources[0].url;

    expect(WCSReportSchema.safeParse(report).success).toBe(false);
  });
});
