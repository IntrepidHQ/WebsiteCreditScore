import { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it } from "vitest";
import { IndustryStandards } from "@/app/benchmarks/industry-standards";

describe("IndustryStandards", () => {
  it("opens the rubric carousel on the clicked industry", async () => {
    const container = document.createElement("div");
    document.body.append(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(<IndustryStandards />);
    });

    const dentalButton = container.querySelector('[aria-label="Open Dental Practices industry rubric"]');
    expect(dentalButton).toBeTruthy();

    await act(async () => {
      dentalButton!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(container.textContent).toContain("Rubric details");
    expect(container.textContent).toContain("Dental Practices");
    expect(container.textContent).toContain("Next");
    expect(container.textContent).toContain("Previous");

    await act(async () => {
      root.unmount();
    });
  });
});
