import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SampleAuditCard } from "@/features/landing/components/sample-audit-card";

describe("SampleAuditCard", () => {
  it("renders the live preview route and score summary", () => {
    render(
      <SampleAuditCard
        audit={{
          id: "mark-deford-md",
          title: "Mark Deford M.D.",
          url: "https://markdeford.dr-leonardo.com",
          profile: "healthcare",
          summary: "Provider details are present, but the page still feels like a stock medical profile.",
          previewImage:
            "/api/preview?url=https%3A%2F%2Fmarkdeford.dr-leonardo.com&device=desktop&v=static-shot-2",
          score: 4.9,
        }}
      />,
    );

    const image = screen.getByAltText(/mark deford m\.d\. preview/i) as HTMLImageElement;

    expect(image.getAttribute("src")).toContain("/api/preview?");
    expect(screen.getByText("4.9 / 10")).toBeInTheDocument();
  });
});
