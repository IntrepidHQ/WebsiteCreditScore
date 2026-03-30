import type { AuditCategoryKey, AuditCategoryScore } from "@/lib/types/audit";

const MAX_SCORE = 10;

const benchmarkCategoryTargets: Record<AuditCategoryKey, number> = {
  "visual-design": 9.1,
  "ux-conversion": 9.3,
  "mobile-experience": 9.0,
  "seo-readiness": 8.7,
  accessibility: 8.8,
  "trust-credibility": 9.2,
  "security-posture": 8.8,
};

export function clampVisualScore(score: number, max = MAX_SCORE) {
  return Math.max(0, Math.min(max, Number(score.toFixed(1))));
}

export function getDialMetrics(score: number, radius: number) {
  const normalizedScore = clampVisualScore(score);
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (normalizedScore / MAX_SCORE) * circumference;

  return {
    circumference,
    dashOffset,
    normalizedScore,
  };
}

export function getRadarPoint(
  centerX: number,
  centerY: number,
  radius: number,
  angle: number,
  score: number,
) {
  const normalizedScore = clampVisualScore(score) / MAX_SCORE;
  const radians = ((angle - 90) * Math.PI) / 180;

  return {
    x: centerX + Math.cos(radians) * radius * normalizedScore,
    y: centerY + Math.sin(radians) * radius * normalizedScore,
  };
}

export function getRadarPolygonPoints(
  scores: number[],
  centerX: number,
  centerY: number,
  radius: number,
) {
  return scores
    .map((score, index) => {
      const point = getRadarPoint(
        centerX,
        centerY,
        radius,
        (360 / scores.length) * index,
        score,
      );

      return `${point.x},${point.y}`;
    })
    .join(" ");
}

export function getWeightPercent(weight: number, maxWeight: number) {
  if (maxWeight <= 0) {
    return 0;
  }

  return Math.round((weight / maxWeight) * 100);
}

export function buildBenchmarkTargetCategoryScores(
  categoryScores: AuditCategoryScore[],
) {
  return categoryScores.map((item) => ({
    ...item,
    score: benchmarkCategoryTargets[item.key] ?? 9,
    summary: `${item.label} needs to land in benchmark-ready territory.`,
    details: item.details,
  }));
}
