import { describe, expect, it } from "vitest";
import { CALIBRATION_CASES, evaluateCalibrationCase, evaluateCalibrationRuns, evaluateSourceQuality } from "@/lib/scanner-evals";

describe("scanner calibration set", () => {
  it("covers the required breadth with valid score bands", () => {
    expect(CALIBRATION_CASES).toHaveLength(40);
    expect(new Set(CALIBRATION_CASES.map((item) => item.category)).size).toBe(7);
    for (const item of CALIBRATION_CASES) {
      expect(item.expectedOverall[0]).toBeGreaterThanOrEqual(0);
      expect(item.expectedOverall[1]).toBeLessThanOrEqual(100);
      expect(item.expectedOverall[0]).toBeLessThanOrEqual(item.expectedOverall[1]);
    }
  });

  it("reports when a scan is inside or outside its agreed calibration band", () => {
    const calibration = CALIBRATION_CASES[0];
    const dimensions = [
      { key: "reputation", score: 75 },
      { key: "legitimacy", score: 100 },
      { key: "longevity", score: 100 },
    ];
    expect(evaluateCalibrationCase({ overall: { score: 90 }, dimensions } as never, calibration).passed).toBe(true);
    expect(evaluateCalibrationCase({ overall: { score: 50 } } as never, calibration).passed).toBe(false);
  });

  it("rejects thin or review-heavy source mixes", () => {
    const strong = Array.from({ length: 12 }, (_, index) => ({
      url: `https://source${index}.example/report`,
      source_type: index < 4 ? "first_party" : index < 8 ? "news" : index < 10 ? "registry" : "technical",
      source_role: index < 4 ? "primary" : index < 8 ? "independent" : "authority",
    }));
    expect(evaluateSourceQuality({ sources: strong } as never).passed).toBe(true);
    expect(evaluateSourceQuality({ sources: strong.map((source) => ({ ...source, source_type: "review", source_role: "reported_experience" })) } as never).passed).toBe(false);
  });

  it("requires repeated scans to stay within band and a stable spread", () => {
    const calibration = CALIBRATION_CASES[0];
    expect(evaluateCalibrationRuns([
      { overall: { score: 90 } },
      { overall: { score: 95 } },
      { overall: { score: 90 } },
    ], calibration)).toMatchObject({ mean: 92, spread: 5, passed: true, consistent: true });
    expect(evaluateCalibrationRuns([
      { overall: { score: 85 } },
      { overall: { score: 100 } },
    ], calibration).consistent).toBe(false);
    expect(evaluateCalibrationRuns([], calibration).passed).toBe(false);
  });
});
