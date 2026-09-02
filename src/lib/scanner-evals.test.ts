import { describe, expect, it } from "vitest";
import { CALIBRATION_CASES, evaluateCalibrationCase } from "@/lib/scanner-evals";

describe("scanner calibration set", () => {
  it("covers the required breadth with valid score bands", () => {
    expect(CALIBRATION_CASES).toHaveLength(30);
    expect(new Set(CALIBRATION_CASES.map((item) => item.category)).size).toBe(7);
    for (const item of CALIBRATION_CASES) {
      expect(item.expectedOverall[0]).toBeGreaterThanOrEqual(0);
      expect(item.expectedOverall[1]).toBeLessThanOrEqual(100);
      expect(item.expectedOverall[0]).toBeLessThanOrEqual(item.expectedOverall[1]);
    }
  });

  it("reports when a scan is inside or outside its agreed calibration band", () => {
    const calibration = CALIBRATION_CASES[0];
    expect(evaluateCalibrationCase({ overall: { score: 90 } } as never, calibration).passed).toBe(true);
    expect(evaluateCalibrationCase({ overall: { score: 50 } } as never, calibration).passed).toBe(false);
  });
});
