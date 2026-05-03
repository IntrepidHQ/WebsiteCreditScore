import { describe, expect, it } from "vitest";
import fixture from "@/lib/fixtures/wcs-mock.json";
import type { WCSReport } from "@/lib/schema";
import { buildScanResultSummary } from "@/lib/scan-result-summary";

function makeReport(): WCSReport {
  return structuredClone(fixture) as WCSReport;
}

describe("buildScanResultSummary", () => {
  it("selects strongest and weakest categories by score", () => {
    const report = makeReport();
    report.dimensions = report.dimensions.map((dimension) => {
      if (dimension.key === "technical") return { ...dimension, score: 100 };
      if (dimension.key === "visual_design") return { ...dimension, score: 98 };
      if (dimension.key === "content") return { ...dimension, score: 97 };
      if (dimension.key === "transparency") return { ...dimension, score: 41 };
      if (dimension.key === "ux_conversion") return { ...dimension, score: 55 };
      if (dimension.key === "social_presence") return { ...dimension, score: 62 };
      return { ...dimension, score: 80 };
    });

    const summary = buildScanResultSummary(report);

    expect(summary.strongestCategories.map((dimension) => dimension.key)).toEqual([
      "technical",
      "visual_design",
      "content",
    ]);
    expect(summary.weakestCategories.map((dimension) => dimension.key)).toEqual([
      "transparency",
      "ux_conversion",
      "social_presence",
    ]);
  });

  it("orders priority findings by severity, then title", () => {
    const report = makeReport();
    report.red_flags = [
      { title: "Medium gap", detail: "Moderate issue", severity: "medium" },
      { title: "Critical beta", detail: "Critical issue", severity: "critical" },
      { title: "High gap", detail: "High issue", severity: "high" },
      { title: "Critical alpha", detail: "Critical issue", severity: "critical" },
    ];

    const summary = buildScanResultSummary(report);

    expect(summary.priorityFindings.map((finding) => finding.title)).toEqual([
      "Critical alpha",
      "Critical beta",
      "High gap",
    ]);
  });

  it("keeps observed facts useful when source and flag data is empty", () => {
    const report = makeReport();
    report.sources = [];
    report.red_flags = [];
    report.green_flags = [];

    const summary = buildScanResultSummary(report);

    expect(summary.observedFacts).toHaveLength(4);
    expect(summary.observedFacts[1]).toMatchObject({
      label: "Evidence trail",
      value: "0 cited sources",
      detail: "Cited public evidence appears here when sources are available.",
    });
    expect(summary.observedFacts[2].detail).toBe("No major red flags were detected in the public evidence set.");
    expect(summary.ctaSignals).toEqual([]);
  });
});
