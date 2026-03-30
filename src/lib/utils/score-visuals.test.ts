import { describe, expect, it } from "vitest";

import type { AuditCategoryScore } from "@/lib/types/audit";
import {
  buildBenchmarkTargetCategoryScores,
  clampVisualScore,
  getDialMetrics,
  getRadarPoint,
  getRadarPolygonPoints,
  getWeightPercent,
} from "@/lib/utils/score-visuals";

const categoryScores: AuditCategoryScore[] = [
  {
    key: "visual-design",
    label: "Visual",
    score: 7.2,
    summary: "Visual hierarchy needs more confidence.",
    weight: 1.25,
    details: ["Tighten contrast."],
  },
  {
    key: "trust-credibility",
    label: "Trust",
    score: 6.4,
    summary: "Trust proof is present but scattered.",
    weight: 1,
    details: ["Bring credentials higher."],
  },
];

describe("score visual helpers", () => {
  it("clamps and rounds scores to the expected display range", () => {
    expect(clampVisualScore(8.44)).toBe(8.4);
    expect(clampVisualScore(-2)).toBe(0);
    expect(clampVisualScore(12)).toBe(10);
  });

  it("returns dial metrics based on the normalized score", () => {
    const metrics = getDialMetrics(7.5, 10);

    expect(metrics.normalizedScore).toBe(7.5);
    expect(metrics.circumference).toBeCloseTo(62.83, 2);
    expect(metrics.dashOffset).toBeCloseTo(15.71, 2);
  });

  it("maps radar geometry from top and around the polygon", () => {
    expect(getRadarPoint(100, 100, 50, 0, 10)).toEqual({ x: 100, y: 50 });
    expect(getRadarPoint(100, 100, 50, 90, 5)).toEqual({ x: 125, y: 100 });

    const polygon = getRadarPolygonPoints([10, 10, 10], 100, 100, 50);

    expect(polygon.split(" ")).toHaveLength(3);
    expect(polygon).toContain("100,50");
  });

  it("derives weight percentages and benchmark targets", () => {
    expect(getWeightPercent(1, 4)).toBe(25);
    expect(getWeightPercent(1, 0)).toBe(0);

    const targets = buildBenchmarkTargetCategoryScores(categoryScores);

    expect(targets[0]).toMatchObject({
      key: "visual-design",
      score: 9.1,
      label: "Visual",
    });
    expect(targets[1]).toMatchObject({
      key: "trust-credibility",
      score: 9.2,
      label: "Trust",
    });
    expect(targets[0].summary).toContain("benchmark-ready territory");
    expect(targets[0].details).toEqual(categoryScores[0].details);
  });
});
