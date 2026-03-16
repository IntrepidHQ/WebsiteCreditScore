import type { AuditCategoryScore } from "@/lib/types/audit";

export function clampScore(value: number) {
  return Math.max(1, Math.min(10, Number(value.toFixed(1))));
}

export function aggregateOverallScore(categoryScores: AuditCategoryScore[]) {
  const totalWeight = categoryScores.reduce((sum, item) => sum + item.weight, 0);

  if (!totalWeight) {
    return 0;
  }

  const weightedScore = categoryScores.reduce(
    (sum, item) => sum + item.score * item.weight,
    0,
  );

  const lowScoreCount = categoryScores.filter((item) => item.score < 5).length;
  const criticalScoreCount = categoryScores.filter((item) => item.score < 4.5).length;
  const strongScoreCount = categoryScores.filter((item) => item.score >= 8).length;
  const penalty = lowScoreCount * 0.08 + criticalScoreCount * 0.12;
  const consistencyBonus =
    lowScoreCount === 0 ? 0.12 : strongScoreCount >= 4 && criticalScoreCount === 0 ? 0.08 : 0;

  return clampScore(weightedScore / totalWeight - penalty + consistencyBonus);
}

export function describeScore(score: number) {
  if (score >= 8) {
    return "Strong foundation with a clear premium upside.";
  }

  if (score >= 6) {
    return "Promising base, but the experience is leaking trust and clarity.";
  }

  if (score >= 4.5) {
    return "Credible business signals are present, but the site is under-selling the value.";
  }

  return "The current site is likely creating drag before prospects ever reach out.";
}

export function getScoreTone(score: number) {
  if (score >= 7.5) {
    return "success" as const;
  }

  if (score >= 5) {
    return "warning" as const;
  }

  return "danger" as const;
}

export function getScoreMethodologyNotes() {
  return [
    "This audit uses a weighted heuristic model across design, conversion, mobile clarity, search readiness, accessibility, trust, and security posture.",
    "The total is not a straight average. Multiple weak categories still lower the final score together, but consistently strong categories now earn a small lift instead of being flattened.",
    "A 10/10 is rare. Most strong commercial sites land in the high-7 to low-9 range because there is usually still room to improve clarity, accessibility, speed, or trust.",
    "Another evaluator can score lower or higher if it weights code-level performance, accessibility, or brand polish differently.",
  ];
}
