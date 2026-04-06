import { describe, expect, it } from "vitest";

import {
  mergeReferenceShowcase,
  PUBLIC_REFERENCE_MIN_OVERALL,
  listHighScorePublicScanReferences,
} from "@/lib/benchmarks/public-reference-showcase";

describe("public reference showcase", () => {
  it("only includes public scans at or above the minimum overall score", () => {
    const list = listHighScorePublicScanReferences();
    for (const ref of list) {
      expect(ref.measuredScore ?? 0).toBeGreaterThanOrEqual(PUBLIC_REFERENCE_MIN_OVERALL);
    }
  });

  it("mergeReferenceShowcase returns unique hosts and includes high-score pool when curated is empty", () => {
    const merged = mergeReferenceShowcase([]);
    expect(merged.length).toBeGreaterThan(0);
    const hosts = merged.map((r) => new URL(r.url).hostname.replace(/^www\./i, "").toLowerCase());
    expect(new Set(hosts).size).toBe(hosts.length);
  });
});
