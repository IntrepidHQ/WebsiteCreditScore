import { describe, expect, it } from "vitest";

import { buildAuditReportById } from "@/lib/mock/report-builder";
import {
  buildSeoScoreCards,
  calculateAiSearchabilityScore,
  calculateKeywordRankingScore,
} from "@/lib/seo/scoring";

describe("seo scoring", () => {
  const report = buildAuditReportById("mark-deford-md");

  it("builds keyword ranking and ai searchability scores", () => {
    expect(report).toBeTruthy();

    const keywordRankingScore = calculateKeywordRankingScore(report!);
    const aiSearchabilityScore = calculateAiSearchabilityScore(report!);

    expect(keywordRankingScore).toBeGreaterThan(0);
    expect(aiSearchabilityScore).toBeGreaterThan(0);
    expect(buildSeoScoreCards(report!).map((card) => card.id)).toEqual([
      "keyword-ranking",
      "ai-searchability",
    ]);
  });
});
