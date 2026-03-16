import { describe, expect, it } from "vitest";

import { buildAuditReportFromUrl } from "@/lib/mock/report-builder";
import {
  calculateProjectedScore,
  calculatePricingSummary,
  calculateRoiScenario,
  getDefaultSelectedIds,
} from "@/lib/utils/pricing";

describe("pricing utilities", () => {
  const report = buildAuditReportFromUrl("https://northshore-roofing.com");
  const bundle = report.pricingBundle;

  it("keeps the base package in the total", () => {
    const summary = calculatePricingSummary(bundle, []);

    expect(summary.total).toBe(bundle.baseItem.price);
    expect(summary.selectedIds).toContain(bundle.baseItem.id);
  });

  it("calculates add-on totals and synergy notes", () => {
    const selectedIds = [
      ...getDefaultSelectedIds(bundle),
      "booking-funnel",
      "analytics",
    ];
    const summary = calculatePricingSummary(bundle, selectedIds);

    expect(summary.total).toBeGreaterThan(bundle.baseItem.price);
    expect(summary.synergyNotes.length).toBeGreaterThan(0);
    expect(summary.synergyNotes.every((note) => note.includes("+"))).toBe(true);
    expect(summary.projectedScoreLift).toBeGreaterThan(0);
  });

  it("projects score lift with diminishing returns", () => {
    const projected = calculateProjectedScore(report.overallScore, [
      bundle.addOns.find((item) => item.id === "full-site")!,
      bundle.addOns.find((item) => item.id === "copywriting")!,
      bundle.addOns.find((item) => item.id === "technical-seo")!,
    ]);

    expect(projected).toBeGreaterThan(report.overallScore);
    expect(projected).toBeLessThanOrEqual(9.8);
  });

  it("calculates the ROI scenario", () => {
    const result = calculateRoiScenario(12000, {
      monthlyLeadGain: 10,
      leadToClientRate: 20,
      averageClientValue: 4000,
    });

    expect(result.monthlyPipelineValue).toBe(8000);
    expect(result.paybackMonths).toBe(1.5);
    expect(result.annualizedValue).toBe(96000);
  });
});
