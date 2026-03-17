import { describe, expect, it } from "vitest";

import { buildBenchmarkReferences, getBenchmarkReferenceScore } from "@/lib/mock/report-enhancements";
import { selectBenchmarkReferencesForReport } from "@/lib/mock/report-builder";

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

    expect(selected).toHaveLength(3);
    expect(selected.some((reference) => reference.name === "Linear")).toBe(false);
    expect(selected.map((reference) => reference.name)).toEqual(["Apple", "Vercel", "Stripe"]);
    expect(selected.map((reference) => getBenchmarkReferenceScore(reference))).toEqual([8.7, 8.2, 7.6]);
  });
});
