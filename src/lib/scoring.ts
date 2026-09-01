import {
  DIMENSION_KEYS,
  DIMENSION_LABELS,
  GRADES,
  DIMENSION_WEIGHTS,
  type Grade,
  type DimensionKey,
  type WCSReport,
} from "@/lib/schema";

/**
 * Deterministic scoring — the single source of truth mapping a 0–100 score to a
 * letter grade, and the 10 dimension scores to one overall score.
 *
 * Why this exists: the research agent used to assign both the overall score and
 * every letter grade freely, so two scans of the same site could land the same
 * 62 yet show "C+" once and "B-" the next — and the overall didn't provably
 * follow from the dimensions. Grades and the overall are now COMPUTED from the
 * dimension scores here, so identical dimension scores always produce an
 * identical grade and overall, and lifting one dimension provably lifts the
 * overall by its weight.
 */

/** Lower bound (inclusive) for each grade, highest first. Canonical. */
export const GRADE_THRESHOLDS: { grade: Grade; min: number }[] = [
  { grade: "A+", min: 95 },
  { grade: "A", min: 90 },
  { grade: "A-", min: 85 },
  { grade: "B+", min: 80 },
  { grade: "B", min: 75 },
  { grade: "B-", min: 70 },
  { grade: "C+", min: 65 },
  { grade: "C", min: 60 },
  { grade: "C-", min: 55 },
  { grade: "D+", min: 50 },
  { grade: "D", min: 45 },
  { grade: "D-", min: 40 },
  { grade: "F", min: 0 },
];

/** Map a 0–100 score to its letter grade. Pure and total. */
export function gradeFromScore(score: number): Grade {
  const s = Math.max(0, Math.min(100, Math.round(score)));
  for (const { grade, min } of GRADE_THRESHOLDS) {
    if (s >= min) return grade;
  }
  return "F";
}

/** Scores are intentionally coarse: research evidence supports 5-point bands,
 * not artificial precision such as 62 versus 63. */
export function normalizeDimensionScore(score: number): number {
  const clamped = Math.max(0, Math.min(100, score));
  return Math.round(clamped / 5) * 5;
}

/** Coarse score band used to anchor the agent's per-dimension scoring. */
export const SCORE_BANDS: { min: number; label: string; meaning: string }[] = [
  { min: 90, label: "90–100", meaning: "exceptional — best-in-class, essentially no concerns" },
  { min: 75, label: "75–89", meaning: "strong — solid with only minor gaps" },
  { min: 60, label: "60–74", meaning: "adequate — functional but with meaningful gaps" },
  { min: 40, label: "40–59", meaning: "weak — significant deficiencies a buyer would notice" },
  { min: 20, label: "20–39", meaning: "poor — major red flags or near-absent signals" },
  { min: 0, label: "0–19", meaning: "critical — broken, fraudulent, or nonexistent" },
];

/**
 * Weighted overall score from the 10 dimension scores. Weights come from
 * DIMENSION_WEIGHTS and sum to 1.0, so this is a plain weighted average
 * rounded to an integer. Falls back to a simple mean if a weight is missing.
 */
export function computeOverallScore(
  dimensions: { key: DimensionKey; score: number }[],
): number {
  let weighted = 0;
  let totalWeight = 0;
  for (const dim of dimensions) {
    const w = DIMENSION_WEIGHTS[dim.key] ?? 0;
    weighted += dim.score * w;
    totalWeight += w;
  }
  if (totalWeight === 0) {
    const mean = dimensions.reduce((s, d) => s + d.score, 0) / (dimensions.length || 1);
    return Math.round(mean);
  }
  return Math.round(weighted / totalWeight);
}

/**
 * Normalize a validated report into the public WCS rubric. The agent may supply
 * research and narrative, but cannot change the dimension order, labels,
 * weights, grades, or overall score.
 */
export function normalizeReportScores(report: WCSReport): WCSReport {
  const dimensionsByKey = new Map(report.dimensions.map((dimension) => [dimension.key, dimension]));
  const dimensions = DIMENSION_KEYS.map((key) => {
    const dimension = dimensionsByKey.get(key);
    if (!dimension) {
      // WCSReportSchema guarantees this before production calls this function.
      throw new Error(`Cannot normalize report without ${key} dimension`);
    }

    return {
      ...dimension,
      label: DIMENSION_LABELS[key],
      weight: DIMENSION_WEIGHTS[key],
      score: normalizeDimensionScore(dimension.score),
      grade: gradeFromScore(normalizeDimensionScore(dimension.score)),
    };
  });
  const overallScore = computeOverallScore(dimensions);
  return {
    ...report,
    dimensions,
    overall: {
      ...report.overall,
      score: overallScore,
      grade: gradeFromScore(overallScore),
    },
  };
}

/** Guard so callers can assert GRADES stays in sync with the thresholds. */
export const GRADE_COUNT_OK = GRADE_THRESHOLDS.length === GRADES.length;
