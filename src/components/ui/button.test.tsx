import { render, screen } from "@testing-library/react";
import Link from "next/link";
import { describe, expect, it } from "vitest";

import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("keeps the accent foreground on default slotted buttons", () => {
    render(
      <Button asChild>
        <Link href="/audit/mark-deford-md">Open sample audit</Link>
      </Button>,
    );

    const link = screen.getByRole("link", { name: /open sample audit/i });
    const style = link.getAttribute("style") ?? "";

    expect(style).toContain("color: var(--theme-accent-foreground)");
    expect(link.className).toContain("text-[color:var(--theme-accent-foreground)]");
  });
});
