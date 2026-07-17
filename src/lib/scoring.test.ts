import { describe, expect, it } from "vitest";
import {
  gradeFromScore,
  computeOverallScore,
  normalizeReportScores,
  GRADE_THRESHOLDS,
  GRADE_COUNT_OK,
} from "@/lib/scoring";
import { GRADES, DIMENSION_KEYS, DIMENSION_WEIGHTS, type WCSReport } from "@/lib/schema";

describe("gradeFromScore", () => {
  it("covers every grade exactly once and stays in sync with GRADES", () => {
    expect(GRADE_COUNT_OK).toBe(true);
    expect(new Set(GRADE_THRESHOLDS.map((g) => g.grade))).toEqual(new Set(GRADES));
  });

  it("maps scores to the canonical grade deterministically", () => {
    // 62 is always C — the exact bug from the field (was C+ one scan, B- the next).
    expect(gradeFromScore(62)).toBe("C");
    expect(gradeFromScore(62)).toBe(gradeFromScore(62));
    expect(gradeFromScore(95)).toBe("A+");
    expect(gradeFromScore(90)).toBe("A");
    expect(gradeFromScore(76)).toBe("B");
    expect(gradeFromScore(70)).toBe("B-");
    expect(gradeFromScore(55)).toBe("C-");
    expect(gradeFromScore(42)).toBe("D-");
    expect(gradeFromScore(39)).toBe("F");
    expect(gradeFromScore(0)).toBe("F");
  });

  it("clamps and rounds out-of-range / fractional scores", () => {
    expect(gradeFromScore(120)).toBe("A+");
    expect(gradeFromScore(-5)).toBe("F");
    expect(gradeFromScore(59.6)).toBe("C"); // rounds to 60
  });
});

function dimsFromScores(scores: number[]) {
  return DIMENSION_KEYS.map((key, i) => ({ key, score: scores[i] }));
}

describe("computeOverallScore", () => {
  it("is the weighted average of the dimension scores", () => {
    // All 80 → overall 80 regardless of weights.
    expect(computeOverallScore(dimsFromScores(DIMENSION_KEYS.map(() => 80)))).toBe(80);
  });

  it("moves the overall up when a weak dimension is lifted (by its weight)", () => {
    const base = DIMENSION_KEYS.map(() => 60);
    const before = computeOverallScore(dimsFromScores(base));
    const lifted = [...base];
    const tIndex = DIMENSION_KEYS.indexOf("transparency");
    lifted[tIndex] = 90; // +30 on a 0.10-weight dimension → +3 overall
    const after = computeOverallScore(dimsFromScores(lifted));
    expect(after).toBe(before + Math.round(30 * DIMENSION_WEIGHTS.transparency));
    expect(after).toBeGreaterThan(before);
  });
});

describe("normalizeReportScores", () => {
  const report = {
    domain: "example.com",
    scanned_at: new Date(0).toISOString(),
    overall: { score: 99, grade: "A+", headline: "h", one_liner: "o" },
    dimensions: DIMENSION_KEYS.map((key) => ({
      key,
      label: key,
      score: 62,
      grade: "A+", // deliberately wrong — should be recomputed to C
      weight: DIMENSION_WEIGHTS[key],
      verdict: "v",
      evidence: [],
    })),
    red_flags: [],
    green_flags: [],
    sources: [],
    summary: "s",
  } as unknown as WCSReport;

  it("recomputes overall and every grade from the scores, ignoring the model's guesses", () => {
    const n = normalizeReportScores(report);
    expect(n.overall.score).toBe(62); // weighted avg of all-62
    expect(n.overall.grade).toBe("C");
    expect(n.dimensions.every((d) => d.grade === "C")).toBe(true);
  });

  it("is idempotent — a second pass changes nothing", () => {
    const once = normalizeReportScores(report);
    const twice = normalizeReportScores(once);
    expect(twice.overall).toEqual(once.overall);
    expect(twice.dimensions.map((d) => d.grade)).toEqual(once.dimensions.map((d) => d.grade));
  });
});
