import { describe, expect, it } from "vitest";

import {
  aggregateOverallScore,
  clampScore,
  describeScore,
  getScoreBandLabel,
  getScoreMethodologyNotes,
  getScoreTone,
} from "@/lib/utils/scores";

describe("score utilities", () => {
  it("clamps scores into the expected range", () => {
    expect(clampScore(11.7)).toBe(10);
    expect(clampScore(0.4)).toBe(1);
  });

  it("aggregates weighted category scores", () => {
    const score = aggregateOverallScore([
      {
        key: "visual-design",
        label: "Visual Design",
        score: 8,
        summary: "",
        weight: 1,
        details: [],
      },
      {
        key: "ux-conversion",
        label: "UX / Conversion",
        score: 6,
        summary: "",
        weight: 2,
        details: [],
      },
    ]);

    expect(score).toBe(6.8);
  });

  it("describes score bands clearly", () => {
    expect(describeScore(8.3)).toMatch(/Strong foundation/);
    expect(describeScore(4.2)).toMatch(/working against the business/);
  });

  it("labels score bands consistently", () => {
    expect(getScoreBandLabel(1.5)).toBe("Awful");
    expect(getScoreBandLabel(3.1)).toBe("Poor");
    expect(getScoreBandLabel(5.4)).toBe("Average");
    expect(getScoreBandLabel(7.2)).toBe("Great");
    expect(getScoreBandLabel(8.6)).toBe("Excellent");
    expect(getScoreBandLabel(10)).toBe("Perfect");
  });

  it("maps scores to semantic tones", () => {
    expect(getScoreTone(8.1)).toBe("success");
    expect(getScoreTone(6.4)).toBe("accent");
    expect(getScoreTone(5.4)).toBe("warning");
    expect(getScoreTone(3.9)).toBe("danger");
  });

  it("exposes score methodology notes", () => {
    expect(getScoreMethodologyNotes()).toHaveLength(3);
  });
});
