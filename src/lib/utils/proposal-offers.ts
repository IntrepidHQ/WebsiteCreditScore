import type { ProposalOffer } from "@/lib/types/product";

export interface AppliedProposalOffer {
  originalTotal: number;
  finalTotal: number;
  savings: number;
  active: boolean;
  bonusLabel?: string;
}

export function isProposalOfferActive(
  offer: ProposalOffer | null | undefined,
  now = new Date(),
) {
  if (!offer) {
    return false;
  }

  return new Date(offer.expiresAt).getTime() > now.getTime();
}

export function applyProposalOffer(
  total: number,
  offer: ProposalOffer | null | undefined,
  now = new Date(),
): AppliedProposalOffer {
  if (!offer || !isProposalOfferActive(offer, now)) {
    return {
      originalTotal: total,
      finalTotal: total,
      savings: 0,
      active: false,
    };
  }

  if (offer.displayMode === "bonus") {
    return {
      originalTotal: total,
      finalTotal: total,
      savings: 0,
      active: true,
      bonusLabel: offer.bonusLabel ?? offer.label,
    };
  }

  const rawSavings =
    offer.displayMode === "percentage"
      ? total * (offer.value / 100)
      : offer.value;
  const savings = Math.min(total, Math.max(0, Math.round(rawSavings)));

  return {
    originalTotal: total,
    finalTotal: Math.max(0, total - savings),
    savings,
    active: true,
  };
}

export function createDefaultProposalOffer(
  total: number,
  createdAt = new Date(),
): ProposalOffer {
  const baseSavings = Math.max(500, Math.min(1200, Math.round((total * 0.1) / 50) * 50));
  const expiresAt = new Date(createdAt);
  expiresAt.setDate(expiresAt.getDate() + 7);

  return {
    id: `offer-${createdAt.getTime()}`,
    label: "Seven-day priority credit",
    reason: "Approve scope within seven days to keep this reserved pricing.",
    displayMode: "fixed",
    value: baseSavings,
    expiresAt: expiresAt.toISOString(),
    note: "Applied to the build total after scope approval. It never changes the projected score.",
  };
}
