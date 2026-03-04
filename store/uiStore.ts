import { create } from "zustand";


interface UIState {
    overviewExpanded: boolean;
    setOverviewExpanded: (val: boolean) => void;
}

export const useUI = create<UIState>((set) => ({
  overviewExpanded: false,
  setOverviewExpanded: (val: boolean) => set({ overviewExpanded: val }),
}));