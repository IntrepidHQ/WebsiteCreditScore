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
    expect(screen.getByText("Target 9.1")).toBeInTheDocument();
    expect(screen.getByText("7.2")).toBeInTheDocument();
    expect(screen.getByText("Weight 100%")).toBeInTheDocument();

    const bars = container.querySelectorAll("div.h-full.rounded-full");

    expect(bars[0]).toHaveStyle({ width: "72%" });
    expect(bars[1]).toHaveStyle({ width: "68%" });
  });
});
