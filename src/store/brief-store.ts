"use client";

import { create } from "zustand";

import type { QuestionnaireResponseSet } from "@/lib/types/audit";

interface BriefState {
  responsesByReport: Record<string, QuestionnaireResponseSet>;
  approvedByReport: Record<string, boolean>;
  initializeBrief: (reportId: string, responses: QuestionnaireResponseSet) => void;
  updateResponse: (
    reportId: string,
    key: keyof QuestionnaireResponseSet,
    value: string,
  ) => void;
  setApproved: (reportId: string, approved: boolean) => void;
}

export const useBriefStore = create<BriefState>((set) => ({
  responsesByReport: {},
  approvedByReport: {},
  initializeBrief: (reportId, responses) =>
    set((state) => ({
      responsesByReport: state.responsesByReport[reportId]
        ? state.responsesByReport
        : { ...state.responsesByReport, [reportId]: responses },
    })),
  updateResponse: (reportId, key, value) =>
    set((state) => ({
      responsesByReport: {
        ...state.responsesByReport,
        [reportId]: {
          ...state.responsesByReport[reportId],
          [key]: value,
        },
      },
    })),
  setApproved: (reportId, approved) =>
    set((state) => ({
      approvedByReport: {
        ...state.approvedByReport,
        [reportId]: approved,
      },
    })),
}));
