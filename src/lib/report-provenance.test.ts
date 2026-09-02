import { describe, expect, it } from "vitest";
import fixture from "@/lib/fixtures/wcs-mock.json";
import { attachReportProvenance, classifyEvidence } from "@/lib/report-provenance";
import type { WCSReport } from "@/lib/schema";

describe("classifyEvidence", () => {
  it("uses conservative provenance categories", () => {
    expect(classifyEvidence("https://www.example.com/privacy", "example.com")).toMatchObject({ source_type: "first_party", confidence: "verified", source_role: "primary" });
    expect(classifyEvidence("https://www.bbb.org/us/sc/company", "example.com")).toMatchObject({ source_type: "registry", confidence: "verified", source_role: "authority" });
    expect(classifyEvidence("https://www.trustpilot.com/review/example.com", "example.com")).toMatchObject({
      source_type: "review",
      confidence: "reported",
      source_role: "reported_experience",
      representativeness: "limited",
    });
    expect(classifyEvidence("https://unknown-source.example/article", "example.com")).toMatchObject({ source_type: "other", confidence: "unverified", source_role: "unknown" });
  });

  it("stamps report versions independently of model wording", () => {
    const result = attachReportProvenance(structuredClone(fixture) as WCSReport);
    expect(result.report_meta?.schema_version).toBe("1.2");
    expect(result.report_meta?.rubric_version).toBe("2026-09b");
    expect(result.report_meta?.scanner_version).toBe("2.1");
  });
});
