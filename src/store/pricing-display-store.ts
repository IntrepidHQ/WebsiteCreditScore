"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type PricingDisplayState = {
  /** Multiplier applied to proposal dollar amounts in audits (0.7–1.3). */
  proposalPriceMultiplier: number;
  setProposalPriceMultiplier: (value: number) => void;
};

export const usePricingDisplayStore = create(
  persist<PricingDisplayState>(
    (set) => ({
      proposalPriceMultiplier: 1,
      setProposalPriceMultiplier: (proposalPriceMultiplier) => set({ proposalPriceMultiplier }),
    }),
    {
      name: "wcs-proposal-price-display",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ proposalPriceMultiplier: state.proposalPriceMultiplier }),
    },
  ),
);
