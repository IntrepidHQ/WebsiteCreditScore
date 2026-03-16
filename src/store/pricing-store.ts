"use client";

import { create } from "zustand";

import type { RoiScenarioDefaults } from "@/lib/types/audit";

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
      const next = existing.includes(itemId)
        ? existing.filter((entry) => entry !== itemId)
        : [...existing, itemId];

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
