import type { AuditCategoryScore } from "@/lib/types/audit";

export function clampScore(value: number) {
  return Math.max(1, Math.min(10, Number(value.toFixed(1))));
}

export type ScoreBandVariant = "danger" | "warning" | "accent" | "success";

export interface ScoreBand {
  label: string;
  variant: ScoreBandVariant;
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
  if (score >= 9.5) {
    return "Elite foundation with very little left to fix.";
  }

  if (score >= 8) {
    return "Strong foundation with room to polish.";
  }

  if (score >= 6) {
    return "Good bones, but clarity still leaves value on the table.";
  }

  if (score >= 4) {
    return "Clarity is weak and likely working against the business.";
  }

  return "The first impression is working against the business.";
}

export function getScoreTone(score: number) {
  if (score >= 8.1) {
    return "success" as const;
  }

  if (score >= 6.1) {
    return "accent" as const;
  }

  if (score >= 4.1) {
    return "warning" as const;
  }

  return "danger" as const;
}

export function getScoreBand(score: number): ScoreBand {
  if (score >= 10) {
    return { label: "Perfect", variant: "success" };
  }

  if (score >= 8.1) {
    return { label: "Excellent", variant: "success" };
  }

  if (score >= 6.1) {
    return { label: "Great", variant: "accent" };
  }

  if (score >= 4.1) {
    return { label: "Average", variant: "warning" };
  }

  if (score >= 2.1) {
    return { label: "Poor", variant: "danger" };
  }

  return { label: "Awful", variant: "danger" };
}

export function getScoreBandLabel(score: number) {
  return getScoreBand(score).label;
}

export function getScoreBandVariant(score: number) {
  return getScoreBand(score).variant;
}

export function getScoreMethodologyNotes() {
  return [
    "Weighted across design, conversion, mobile clarity, search, accessibility, trust, and security.",
    "Weak categories drag the total down; strong ones add only a modest lift.",
    "A 10 is rare, and another evaluator may weight code, accessibility, or polish differently.",
  ];
}
