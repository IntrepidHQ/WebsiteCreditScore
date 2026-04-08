import type { AuditCategoryKey, AuditCategoryScore } from "@/lib/types/audit";

import { comparisonMetrics } from "./constants";

export const deriveComparisonMetrics = (categoryScores: AuditCategoryScore[]) => {
  const scoreMap = Object.fromEntries(
    categoryScores.map((score) => [score.key, score.score]),
  ) as Record<AuditCategoryKey, number>;

  return [
    {
      ...comparisonMetrics[0],
      value: Math.round(((scoreMap["visual-design"] + scoreMap["ux-conversion"]) / 2) * 10),
      format: "percent" as const,
    },
    {
      ...comparisonMetrics[1],
      value: Math.round(scoreMap["trust-credibility"] * 10),
      format: "percent" as const,
    },
    {
      ...comparisonMetrics[2],
      value: Math.round(scoreMap["mobile-experience"] * 10),
      format: "percent" as const,
    },
    {
      ...comparisonMetrics[3],
      value: Math.round(scoreMap["seo-readiness"] * 10),
      format: "percent" as const,
    },
  ];
};
