import { describe, expect, it } from "vitest";

import {
  buildBenchmarkReferencesForProfile,
  getBenchmarkRubricForProfile,
  getPrimaryBenchmarkVerticals,
} from "@/lib/benchmarks/library";

describe("benchmark library", () => {
  it("exposes the two primary verticals for the internal library", () => {
    expect(getPrimaryBenchmarkVerticals()).toEqual([
      "service-providers",
      "private-healthcare",
    ]);
  });

  it("returns profile-specific rubric criteria", () => {
    const healthcareRubric = getBenchmarkRubricForProfile("healthcare");
    const serviceRubric = getBenchmarkRubricForProfile("local-service");

    expect(healthcareRubric.title).toContain("Healthcare");
    expect(serviceRubric.title).toContain("Services");
    expect(
      healthcareRubric.criteria.some((criterion) =>
        criterion.signals.some((signal) => /insurance/i.test(signal)),
      ),
    ).toBe(true);
    expect(
      serviceRubric.criteria.some((criterion) =>
        criterion.signals.some((signal) => /guarantee|quote|service/i.test(signal)),
      ),
    ).toBe(true);
  });

  it("returns reusable measured benchmark references per profile", () => {
    const references = buildBenchmarkReferencesForProfile("local-service");

    expect(references.length).toBeGreaterThanOrEqual(4);
    expect(references.every((reference) => reference.mobilePreviewImage)).toBe(true);
    expect(references.every((reference) => reference.reusablePatterns.length >= 2)).toBe(true);
  });
});
