"use client";

import { create } from "zustand";

import type { RoiScenarioDefaults } from "@/lib/types/audit";

/** Human delivery tiers — only one should be active at a time in the configurator. */
const EXCLUSIVE_DELIVERY_TIER_IDS = new Set(["ai-assisted-handoff", "white-glove-build"]);

interface PricingState {
  selectionsByReport: Record<string, string[]>;
  roiByReport: Record<string, RoiScenarioDefaults>;
  initializeReport: (
    reportId: string,
    selectedIds: string[],
    roiDefaults: RoiScenarioDefaults,
  ) => void;
  toggleItem: (reportId: string, itemId: string) => void;
  setSelections: (reportId: string, selectedIds: string[]) => void;
  setRoiValue: (
    reportId: string,
    key: keyof RoiScenarioDefaults,
    value: number,
  ) => void;
}

export const usePricingStore = create<PricingState>((set) => ({
  selectionsByReport: {},
  roiByReport: {},
  initializeReport: (reportId, selectedIds, roiDefaults) =>
    set((state) => ({
      selectionsByReport: state.selectionsByReport[reportId]
        ? state.selectionsByReport
        : { ...state.selectionsByReport, [reportId]: selectedIds },
      roiByReport: state.roiByReport[reportId]
        ? state.roiByReport
        : { ...state.roiByReport, [reportId]: roiDefaults },
    })),
  toggleItem: (reportId, itemId) =>
    set((state) => {
      const existing = state.selectionsByReport[reportId] ?? [];
      const removing = existing.includes(itemId);
      let next = removing ? existing.filter((entry) => entry !== itemId) : [...existing, itemId];

      if (!removing && EXCLUSIVE_DELIVERY_TIER_IDS.has(itemId)) {
        next = next.filter((entry) => !EXCLUSIVE_DELIVERY_TIER_IDS.has(entry) || entry === itemId);
      }

      return {
        selectionsByReport: {
          ...state.selectionsByReport,
          [reportId]: next,
        },
      };
    }),
  setSelections: (reportId, selectedIds) =>
    set((state) => ({
      selectionsByReport: {
        ...state.selectionsByReport,
        [reportId]: selectedIds,
      },
    })),
  setRoiValue: (reportId, key, value) =>
    set((state) => ({
      roiByReport: {
        ...state.roiByReport,
        [reportId]: {
          ...(state.roiByReport[reportId] ?? {
            monthlyLeadGain: 10,
            leadToClientRate: 20,
            averageClientValue: 5000,
          }),
          [key]: value,
        },
      },
    })),
}));
