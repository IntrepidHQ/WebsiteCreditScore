import { describe, expect, it } from "vitest";

import {
  buildBenchmarkReferences,
  buildObservedCategoryScores,
} from "@/lib/mock/report-enhancements";
import type { SiteObservation } from "@/lib/types/audit";
import { createWebsiteScreenshotUrl } from "@/lib/utils/url";

const strongObservation: SiteObservation = {
  fetchedAt: "2026-03-16T10:00:00.000Z",
  finalUrl: "https://www.apple.com",
  pageTitle: "Apple",
  metaDescription: "Discover Apple products, services, and support.",
  heroHeading: "Apple",
  aboutSnippet: "Apple designs consumer hardware, software, and services with a strong focus on clarity and polish.",
  verifiedFacts: [
    {
      id: "about-schema-apple",
      type: "about",
      label: "About",
      value:
        "Apple designs consumer hardware, software, and services with a strong focus on clarity and polish.",
      source: "schema",
      confidence: "verified",
    },
    {
      id: "phone-tel-apple",
      type: "phone",
      label: "Phone",
      value: "(800) 692-7753",
      source: "tel-link",
      confidence: "verified",
    },
  ],
  primaryCtas: ["Shop", "Learn more", "Buy"],
  trustSignals: [
    "Direct phone contact is published.",
    "Structured data references Organization.",
    "Tenure or local ownership language is visible.",
  ],
  seoSignals: [
    "Title tag present: Apple",
    "Meta description present.",
    "Primary heading: Apple",
    "Canonical URL present.",
    "Structured data found: Organization",
  ],
  securitySignals: [
    "HSTS header present.",
    "Content Security Policy present.",
    "Frame embedding policy present.",
    "Referrer policy present.",
  ],
  technicalSignals: [
    "Viewport meta tag present.",
    "Language attribute present on the HTML element.",
    "Images appear to include alt attributes.",
  ],
  notableDetails: ["Phone listed: (800) 692-7753"],
  templateSignals: [],
  motionSignals: ["micro-feedback", "scroll-story", "reduced-motion"],
  screenshotUrl: createWebsiteScreenshotUrl("https://www.apple.com", "desktop"),
  ogImage: "https://www.apple.com/og.png",
  formCount: 1,
  internalLinkCount: 24,
  headingCount: 7,
  hasViewport: true,
  hasCanonical: true,
  hasSchema: true,
  hasLang: true,
  missingAltRatio: 0,
  fetchSucceeded: true,
};

describe("report enhancements", () => {
  it("produces stronger category scores when observed signals are strong", () => {
    const scores = buildObservedCategoryScores("saas", strongObservation);
    const scoreMap = Object.fromEntries(scores.map((entry) => [entry.key, entry.score]));

    expect(scoreMap["visual-design"]).toBeGreaterThanOrEqual(6.5);
    expect(scoreMap["security-posture"]).toBeGreaterThanOrEqual(7.5);
    expect(scoreMap["seo-readiness"]).toBeGreaterThanOrEqual(7);
  });

  it("returns benchmark references for each profile", () => {
    const references = buildBenchmarkReferences("local-service");

    expect(references.length).toBeGreaterThanOrEqual(4);
    expect(references.some((entry) => entry.name.includes("Apple"))).toBe(true);
  });
});
