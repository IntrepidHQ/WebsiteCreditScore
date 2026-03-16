import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ReportEmptyState } from "@/features/audit/components/report-empty-state";

describe("ReportEmptyState", () => {
  it("renders an audit error state", () => {
    render(
      <ReportEmptyState
        description="The requested report could not be loaded."
        title="Audit unavailable"
      />,
    );

    expect(screen.getByText("Audit unavailable")).toBeInTheDocument();
    expect(
      screen.getByText("The requested report could not be loaded."),
    ).toBeInTheDocument();
  });
});
