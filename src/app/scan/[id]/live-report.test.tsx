import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import fixture from "@/lib/fixtures/wcs-mock.json";
import type { WCSReport } from "@/lib/schema";
import { ScanResultSummary } from "@/app/scan/[id]/live-report";

describe("ScanResultSummary", () => {
  it("renders the score, preview facts, priorities, and action links", () => {
    const html = renderToStaticMarkup(<ScanResultSummary report={fixture as WCSReport} />);

    expect(html).toContain("Scan result");
    expect(html).toContain("apple.com");
    expect(html).toContain("Category-defining restraint and earned trust");
    expect(html).toContain("What we found");
    expect(html).toContain("15 cited sources");
    expect(html).toContain("Top priorities");
    expect(html).toContain("Right-to-Repair Restrictions");
    expect(html).toContain("Score spread");
    expect(html).toContain("Strategy Call");
    expect(html).toContain("https://calendly.com/seekercray/30min");
  });
});
