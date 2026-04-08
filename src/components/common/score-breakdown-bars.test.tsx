import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { ScoreBreakdownBars } from "@/components/common/score-breakdown-bars";
import { useThemeStore } from "@/store/theme-store";

const items = [
  {
    key: "visual-design" as const,
    label: "Visual design",
    score: 7.2,
    weight: 1.25,
  },
  {
    key: "ux-conversion" as const,
    label: "UX and conversion",
    score: 6.8,
    weight: 1,
  },
];

describe("ScoreBreakdownBars", () => {
  afterEach(() => {
    useThemeStore.getState().restoreDefaults();
  });

  it("shows an empty state when no scores are available", () => {
    render(<ScoreBreakdownBars items={[]} />);

    expect(
      screen.getByText("No score breakdown has been generated yet."),
    ).toBeInTheDocument();
  });

  it("renders weights, targets, and reduced-motion widths", () => {
    act(() => {
      useThemeStore.setState({ motionPreference: "reduced" });
    });

    const { container } = render(
      <ScoreBreakdownBars
        items={items}
        showWeights
        targetItems={[
          { ...items[0], score: 9.1 },
          { ...items[1], score: 9.3 },
        ]}
      />,
    );

    expect(screen.getByText("Visual design")).toBeInTheDocument();
    expect(screen.getByText("1.25x")).toBeInTheDocument();
    expect(screen.getAllByText("Target")).toHaveLength(2);
    expect(screen.getAllByText("9.1").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("7.2").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Weight 100%")).toBeInTheDocument();

    const bar0 = container.querySelector("[data-testid=\"score-bar-fill-visual-design\"]");
    const bar1 = container.querySelector("[data-testid=\"score-bar-fill-ux-conversion\"]");

    expect(bar0).toHaveStyle({ width: "72%" });
    expect(bar1).toHaveStyle({ width: "68%" });
  });
});
