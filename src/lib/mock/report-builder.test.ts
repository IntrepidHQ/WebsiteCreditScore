import { describe, expect, it } from "vitest";

import { FORTUNE_500_HERO_CANDIDATE_IDS } from "@/lib/mock/fortune-500-sample-audits";
import { buildBenchmarkReferences, getBenchmarkReferenceScore } from "@/lib/mock/report-enhancements";
import { getPublicScanHistoryCards, getSampleAuditCards, selectBenchmarkReferencesForReport } from "@/lib/mock/report-builder";

describe("report builder benchmark selection", () => {
  it("filters the current domain out of the stronger-site set", () => {
    const references = buildBenchmarkReferences("saas").map((reference) => {
      if (reference.name === "Stripe") {
        return { ...reference, measuredScore: 7.6, scoreSource: "measured" as const };
      }

      if (reference.name === "Linear") {
        return { ...reference, measuredScore: 7.6, scoreSource: "measured" as const };
      }

      if (reference.name === "Apple") {
        return { ...reference, measuredScore: 8.7, scoreSource: "measured" as const };
      }

      if (reference.name === "Vercel") {
        return { ...reference, measuredScore: 8.2, scoreSource: "measured" as const };
      }

      return { ...reference, measuredScore: 7.2, scoreSource: "measured" as const };
    });

    const selected = selectBenchmarkReferencesForReport(
      "https://linear.app",
      7.6,
      references,
    );

    expect(selected).toHaveLength(4);
    expect(selected.some((reference) => reference.name === "Linear")).toBe(false);
    expect(selected.slice(0, 3).map((reference) => reference.name)).toEqual(["Apple", "Vercel", "Stripe"]);
    expect(selected.slice(0, 3).map((reference) => getBenchmarkReferenceScore(reference))).toEqual([8.7, 8.2, 7.6]);
    expect(getBenchmarkReferenceScore(selected[3]!)).toBe(7.2);
  });

  it("returns the public scan cards newest-first and omits provider pages", () => {
    const cards = getSampleAuditCards();
    const publicHistory = getPublicScanHistoryCards();

    expect(cards.some((card) => card.title === "Provider Pages")).toBe(false);
    expect(cards.length).toBeGreaterThan(3);
    expect(cards.some((card) => card.id === "one-medical")).toBe(true);
    expect(cards[0]?.scannedAt).toBeDefined();
    expect(cards[1]?.scannedAt).toBeDefined();
    expect(new Date(cards[0]!.scannedAt!).getTime()).toBeGreaterThanOrEqual(
      new Date(cards[1]!.scannedAt!).getTime(),
    );
    expect(publicHistory.map((card) => card.id)).toEqual(cards.map((card) => card.id));
  });

  it("exposes 20 fortune 500 demos with Apple as the highest-scoring marketing hero candidate (9+)", () => {
    const cards = getPublicScanHistoryCards();
    const pool = cards.filter((card) => FORTUNE_500_HERO_CANDIDATE_IDS.includes(card.id));

    expect(pool).toHaveLength(20);

    const [head, ...tail] = pool;
    const hero = tail.reduce(
      (best, current) => ((current.score ?? 0) > (best.score ?? 0) ? current : best),
      head,
    );

    expect(hero?.id).toBe("f500-apple");
    expect(hero?.score ?? 0).toBeGreaterThanOrEqual(9);
  });
});
