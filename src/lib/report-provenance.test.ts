import { describe, expect, it } from "vitest";
import { classifyEvidence } from "@/lib/report-provenance";

describe("classifyEvidence", () => {
  it("uses conservative provenance categories", () => {
    expect(classifyEvidence("https://www.example.com/privacy", "example.com")).toEqual({ source_type: "first_party", confidence: "verified" });
    expect(classifyEvidence("https://www.bbb.org/us/sc/company", "example.com")).toEqual({ source_type: "registry", confidence: "verified" });
    expect(classifyEvidence("https://www.trustpilot.com/review/example.com", "example.com")).toEqual({ source_type: "review", confidence: "reported" });
    expect(classifyEvidence("https://unknown-source.example/article", "example.com")).toEqual({ source_type: "other", confidence: "unverified" });
  });
});
