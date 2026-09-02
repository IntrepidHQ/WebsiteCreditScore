import { describe, expect, it, vi } from "vitest";
import { verifyReportSources } from "@/lib/source-verification";

describe("verifyReportSources", () => {
  it("records a reachable source and carries its verified state to evidence", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(
      '<html><head><title>Source title</title><meta name="description" content="Short source description."></head></html>',
      { status: 200, headers: { "content-type": "text/html" } },
    )));
    const report = {
      domain: "example.com",
      sources: [{ url: "https://example.com/about", title: "About", confidence: "verified" }],
      dimensions: [{ evidence: [{ url: "https://example.com/about", claim: "A claim" }] }],
    } as never;

    const verified = await verifyReportSources(report);
    expect(verified.sources[0]).toMatchObject({ reachable: true, page_title: "Source title", excerpt: "Short source description." });
    expect(verified.dimensions[0].evidence[0]).toMatchObject({ reachable: true, confidence: "verified" });
  });

  it("does not treat an anti-bot challenge page as reachable evidence", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(
      "<html><head><title>Verifying Connection</title></head><body>Please wait while we verify your browser.</body></html>",
      { status: 200, headers: { "content-type": "text/html" } },
    )));
    const report = {
      domain: "example.com",
      sources: [{ url: "https://review.example/review/example.com", title: "Reviews", confidence: "reported" }],
      dimensions: [{ evidence: [{ url: "https://review.example/review/example.com", claim: "A claim" }] }],
    } as never;

    const verified = await verifyReportSources(report);
    expect(verified.sources[0]).toMatchObject({ reachable: false, confidence: "unverified", page_title: "Verifying Connection" });
    expect(verified.dimensions[0].evidence[0]).toMatchObject({ reachable: false, confidence: "unverified" });
  });
});
