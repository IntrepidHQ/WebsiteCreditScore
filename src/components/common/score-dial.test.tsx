import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { ScoreDial } from "@/components/common/score-dial";
import { useThemeStore } from "@/store/theme-store";

describe("ScoreDial", () => {
  afterEach(() => {
    useThemeStore.getState().restoreDefaults();
  });

  it("renders the current score and projected target in reduced motion mode", () => {
    act(() => {
      useThemeStore.setState({ motionPreference: "reduced" });
    });

    render(
      <ScoreDial
        bandLabel="Benchmark ready"
        label="Featured current score"
        projectedScore={8.8}
        score={7.2}
      />,
    );

    expect(screen.getByText("Featured current score")).toBeInTheDocument();
    expect(screen.getByText("7.2")).toBeInTheDocument();
    expect(screen.getByText("Benchmark ready")).toBeInTheDocument();
    expect(screen.getByText("Target 8.8")).toBeInTheDocument();
  });
});
