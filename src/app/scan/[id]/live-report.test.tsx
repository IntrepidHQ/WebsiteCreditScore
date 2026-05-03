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

    expect(html).toContain("Scan result");
    expect(html).toContain("apple.com");
    expect(html).toContain("9.6");
    expect(html).toContain("Business Legitimacy");
    expect(html).toContain("Visual Design");
    expect(html).toContain("UX / Conversion");
    expect(html).toContain("View reasoning");
  });

  it("opens dimension reasoning from a score card", async () => {
    const container = document.createElement("div");
    document.body.append(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(<ScanResultSummary report={fixture as WCSReport} />);
    });

    const button = Array.from(container.querySelectorAll("button")).find((candidate) =>
      candidate.textContent?.includes("Business Legitimacy")
    );
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
});
