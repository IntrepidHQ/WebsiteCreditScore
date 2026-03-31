import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { ScoreRadar } from "@/components/common/score-radar";
import { useThemeStore } from "@/store/theme-store";

const items = [
  {
    key: "visual-design" as const,
    label: "Visual design",
    score: 7.2,
  },
  {
    key: "ux-conversion" as const,
    label: "UX and conversion",
    score: 8.1,
  },
  {
    key: "mobile-experience" as const,
    label: "Mobile experience",
    score: 7.8,
  },
];

describe("ScoreRadar", () => {
  afterEach(() => {
    useThemeStore.getState().restoreDefaults();
  });

  it("shows an empty state when no category scores are passed", () => {
    render(<ScoreRadar centerLabel="Target" items={[]} />);

    expect(
      screen.getByText("Radar data appears when a scored example is available."),
    ).toBeInTheDocument();
  });

  it("renders the score balance legend in reduced motion mode", () => {
    act(() => {
      useThemeStore.setState({ motionPreference: "reduced" });
    });

    render(<ScoreRadar centerLabel="Target" items={items} />);

    expect(screen.getByText("Target")).toBeInTheDocument();
    expect(screen.getByText("Average 7.7")).toBeInTheDocument();
    expect(screen.getByText("Visual design")).toBeInTheDocument();
    expect(screen.getByText("UX and conversion")).toBeInTheDocument();
    expect(screen.getByText("Mobile experience")).toBeInTheDocument();
    expect(screen.getAllByText("8.1").length).toBeGreaterThan(0);
  });
});
