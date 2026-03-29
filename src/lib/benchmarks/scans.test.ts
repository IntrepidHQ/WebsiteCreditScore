import { describe, expect, it } from "vitest";

import type { BenchmarkReference, BenchmarkScan } from "@/lib/types/audit";
import {
  selectFeaturedBenchmarkReferences,
  sortBenchmarkReferencesByScore,
} from "@/lib/benchmarks/scans";

function makeReference(
  id: string,
  name: string,
  score: number,
  focusArea?: BenchmarkReference["focusArea"],
): BenchmarkReference {
  return {
    id,
    siteId: id,
    vertical: "service-providers",
    focusArea,
    tier: "reference",
    name,
    url: `https://${id}.example.com`,
    sourceLabel: "Benchmark",
    note: `${name} note`,
    previewImage: `/previews/${id}.png`,
    mobilePreviewImage: `/previews/${id}-mobile.png`,
    targetScore: score,
    measuredScore: score,
    measuredAnimationScore: 2,
    strengths: ["visual-design"],
    whatWorks: ["Clear hierarchy"],
    bestFor: `${name} best for`,
    reusablePatterns: ["Pattern"],
  };
}

function makeScan(reference: BenchmarkReference, score: number): BenchmarkScan {
  return {
    id: `${reference.id}-scan`,
    siteId: reference.siteId,
    vertical: reference.vertical,
    overallScore: score,
    designScore: score,
    animationScore: 1,
    designElementScores: [],
    designPrincipleScores: [],
    categoryScores: [],
    scannedAt: new Date("2026-01-01T00:00:00Z").toISOString(),
    previewImages: {
      desktop: reference.previewImage,
      mobile: reference.mobilePreviewImage,
    },
    note: reference.note,
    tier: reference.tier,
    scoreSource: "measured",
  };
}

describe("benchmark scan ranking", () => {
  it("only surfaces featured benchmark references above the threshold", () => {
    const references = [
      makeReference("alpha", "Alpha", 9.6, "woodworking"),
      makeReference("beta", "Beta", 9.1, "woodworking"),
      makeReference("gamma", "Gamma", 8.8, "woodworking"),
      makeReference("delta", "Delta", 9.4, "woodworking"),
    ];
    const scans = references.map((reference) => makeScan(reference, reference.measuredScore ?? 0));

    const featured = selectFeaturedBenchmarkReferences(references, scans, {
      limit: 3,
      minScore: 9,
      focusArea: "woodworking",
    });

    expect(featured.map((reference) => reference.name)).toEqual(["Alpha", "Delta", "Beta"]);
  });

  it("sorts the full benchmark history by measured score", () => {
    const references = [
      makeReference("alpha", "Alpha", 8.5),
      makeReference("beta", "Beta", 9.2),
      makeReference("gamma", "Gamma", 7.9),
    ];
    const scans = references.map((reference) => makeScan(reference, reference.measuredScore ?? 0));

    expect(sortBenchmarkReferencesByScore(references, scans).map((reference) => reference.name)).toEqual([
      "Beta",
      "Alpha",
      "Gamma",
    ]);
  });
});
