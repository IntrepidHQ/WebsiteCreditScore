"use client";

import { create } from "zustand";

interface UiState {
  previewDevice: "desktop" | "mobile";
  contactModalOpen: boolean;
  setPreviewDevice: (previewDevice: "desktop" | "mobile") => void;
  setContactModalOpen: (contactModalOpen: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  previewDevice: "desktop",
  contactModalOpen: false,
  setPreviewDevice: (previewDevice) => set({ previewDevice }),
  setContactModalOpen: (contactModalOpen) => set({ contactModalOpen }),
}));
