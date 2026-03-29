import { describe, expect, it } from "vitest";

import {
  calculateAnimationScore,
  getAnimationPatterns,
} from "@/lib/benchmarks/motion";
import type { SiteObservation } from "@/lib/types/audit";

const baseObservation: SiteObservation = {
  fetchedAt: "2026-03-29T12:00:00.000Z",
  finalUrl: "https://example.com",
  pageTitle: "Example",
  metaDescription: "",
  heroHeading: "",
  aboutSnippet: "",
  verifiedFacts: [],
  primaryCtas: [],
  trustSignals: [],
  seoSignals: [],
  securitySignals: [],
  technicalSignals: [],
  motionSignals: [],
  notableDetails: [],
  templateSignals: [],
  screenshotUrl: "/api/preview",
  formCount: 0,
  internalLinkCount: 0,
  headingCount: 0,
  hasViewport: true,
  hasCanonical: true,
  hasSchema: false,
  hasLang: true,
  missingAltRatio: 0,
  fetchSucceeded: true,
};

describe("motion benchmark scoring", () => {
  it("provides a 10-point motion rubric", () => {
    const patterns = getAnimationPatterns();
    const total = patterns.reduce((sum, pattern) => sum + pattern.pointValue, 0);

    expect(patterns).toHaveLength(8);
    expect(total).toBe(10);
  });

  it("scores purposeful motion when signals are present", () => {
    const score = calculateAnimationScore({
      ...baseObservation,
      motionSignals: ["micro-feedback", "scroll-story", "layout-transition", "reduced-motion"],
    });

    expect(score).toBeGreaterThanOrEqual(6);
  });

  it("keeps motion at zero when there are no detectable signals", () => {
    expect(calculateAnimationScore(baseObservation)).toBe(0);
  });
});
