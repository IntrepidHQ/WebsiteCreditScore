import { act } from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import fixture from "@/lib/fixtures/wcs-mock.json";
import type { WCSReport } from "@/lib/schema";
import { ScanResultSummary } from "@/app/scan/[id]/live-report";

describe("ScanResultSummary", () => {
  it("renders the main score, score breakdown, and reasoning actions", () => {
    const html = renderToStaticMarkup(<ScanResultSummary report={fixture as WCSReport} />);
    const gradeIndex = html.indexOf("EXCELLENT");
    const scanResultIndex = html.indexOf("Scan result");

    expect(html).not.toContain("Average 9.6/10");
    expect(gradeIndex).toBeGreaterThanOrEqual(0);
    expect(scanResultIndex).toBeGreaterThan(gradeIndex);
    expect(html).toContain("Scan result");
    expect(html).toContain("apple.com");
    expect(html).toContain("9.6");
    expect(html).toContain("Business Legitimacy");
    expect(html).toContain("Visual Design");
    expect(html).toContain("UX / Conversion");
    expect(html).toContain("View reasoning");
  });

  it("opens dimension reasoning from the score key", async () => {
    const container = document.createElement("div");
    document.body.append(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(<ScanResultSummary report={fixture as WCSReport} />);
    });

    const button = container.querySelector('[aria-label="Open Business Legitimacy reasoning from key"]');
    expect(button).toBeTruthy();

    await act(async () => {
      button!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(container.textContent).toContain("Dimension reasoning");
    expect(container.textContent).toContain("Why it scored this way");
    expect(container.textContent).toContain("Delaware C-Corp incorporated");

    await act(async () => {
      root.unmount();
    });
  });

  it("shows a tappable radar tooltip for dimension scores", async () => {
    const container = document.createElement("div");
    document.body.append(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(<ScanResultSummary report={fixture as WCSReport} />);
    });

    const radarScore = container.querySelector('[aria-label="Show Business Legitimacy score tooltip"]');
    expect(radarScore).toBeTruthy();

    await act(async () => {
      radarScore!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(container.textContent).toContain("Radar score");
    expect(container.textContent).toContain("Business Legitimacy");
    expect(container.textContent).toContain("9.9");

    await act(async () => {
      root.unmount();
    });
  });
});
