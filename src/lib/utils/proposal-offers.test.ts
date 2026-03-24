import { describe, expect, it } from "vitest";

import { applyProposalOffer, createDefaultProposalOffer, isProposalOfferActive } from "@/lib/utils/proposal-offers";

describe("proposal offers", () => {
  it("creates an active expiring offer by default", () => {
    const offer = createDefaultProposalOffer(5000, new Date("2026-03-10T00:00:00.000Z"));

    expect(offer.displayMode).toBe("fixed");
    expect(offer.value).toBeGreaterThanOrEqual(500);
    expect(isProposalOfferActive(offer, new Date("2026-03-12T00:00:00.000Z"))).toBe(true);
  });

  it("applies fixed discounts without affecting negative totals", () => {
    const offer = {
      id: "offer-1",
      label: "Priority credit",
      reason: "Reserved for a short approval window.",
      displayMode: "fixed" as const,
      value: 600,
      expiresAt: "2026-03-20T00:00:00.000Z",
    };

    const now = new Date("2026-03-10T00:00:00.000Z");

    expect(applyProposalOffer(5000, offer, now).finalTotal).toBe(4400);
    expect(applyProposalOffer(400, offer, now).finalTotal).toBe(0);
  });

  it("ignores expired offers", () => {
    const offer = {
      id: "offer-2",
      label: "Expired credit",
      reason: "No longer active.",
      displayMode: "percentage" as const,
      value: 10,
      expiresAt: "2026-03-01T00:00:00.000Z",
    };

    const result = applyProposalOffer(5000, offer, new Date("2026-03-10T00:00:00.000Z"));

    expect(result.finalTotal).toBe(5000);
    expect(result.savings).toBe(0);
    expect(result.active).toBe(false);
  });
});
