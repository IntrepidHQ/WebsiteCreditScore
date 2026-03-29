import { describe, expect, it } from "vitest";

import {
  buildDesignElementScores,
  buildDesignPrincipleScores,
  calculateDesignScore,
} from "@/lib/benchmarks/design-score";
import type { AuditCategoryScore, SiteObservation } from "@/lib/types/audit";

const categoryScores: AuditCategoryScore[] = [
  {
    key: "visual-design",
    label: "Visual Design",
    score: 8.4,
    summary: "",
    weight: 1,
    details: [],
  },
  {
    key: "ux-conversion",
    label: "UX / Conversion",
    score: 8.1,
    summary: "",
    weight: 1,
    details: [],
  },
  {
    key: "mobile-experience",
    label: "Mobile Experience",
    score: 8.2,
    summary: "",
    weight: 1,
    details: [],
  },
  {
    key: "seo-readiness",
    label: "SEO Readiness",
    score: 7.9,
    summary: "",
    weight: 1,
    details: [],
  },
  {
    key: "accessibility",
    label: "Accessibility",
    score: 8,
    summary: "",
    weight: 1,
    details: [],
  },
  {
    key: "trust-credibility",
    label: "Trust / Credibility",
    score: 8.3,
    summary: "",
    weight: 1,
    details: [],
  },
  {
    key: "security-posture",
    label: "Security Posture",
    score: 8.1,
    summary: "",
    weight: 1,
    details: [],
  },
];

const observation: SiteObservation = {
  fetchedAt: "2026-03-29T12:00:00.000Z",
  finalUrl: "https://example.com",
  pageTitle: "Example Site",
  metaDescription: "A strong example site.",
  heroHeading: "A strong example",
  aboutSnippet: "A strong example site with clear proof and a usable message hierarchy.",
  verifiedFacts: [],
  primaryCtas: ["Book now", "Contact us"],
  trustSignals: ["Reviews are visible.", "Credentials are visible."],
  seoSignals: ["Title tag present.", "Meta description present."],
  securitySignals: ["HTTPS present.", "Content Security Policy present."],
  technicalSignals: ["Viewport meta tag present.", "Language attribute present."],
  notableDetails: [],
  templateSignals: [],
  motionSignals: ["micro-feedback", "scroll-story", "reduced-motion"],
  screenshotUrl: "/api/preview",
  formCount: 1,
  internalLinkCount: 8,
  headingCount: 5,
  hasViewport: true,
  hasCanonical: true,
  hasSchema: true,
  hasLang: true,
  missingAltRatio: 0,
  fetchSucceeded: true,
};

describe("design score", () => {
  it("builds art and design breakdowns and averages them into a design score", () => {
    const elements = buildDesignElementScores(observation, categoryScores);
    const principles = buildDesignPrincipleScores(observation, categoryScores);
    const score = calculateDesignScore(elements, principles);

    expect(elements).toHaveLength(7);
    expect(principles).toHaveLength(12);
    expect(score).toBeGreaterThan(6.8);
  });
});
