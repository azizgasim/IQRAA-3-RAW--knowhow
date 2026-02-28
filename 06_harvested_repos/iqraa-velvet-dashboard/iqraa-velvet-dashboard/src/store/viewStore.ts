import { create } from 'zustand';

type ActiveView = "projects" | "concept-analysis" | "primary-processing" | "concept-modeling" | "decision-execution" | "interaction-expansion" | "concept-exploration" | "sources" | "settings";
type ActiveLensType = "relationship" | "impact" | "sequence" | "structure" | "scope" | "interpretive";

interface ViewState {
  activeView: ActiveView;
  activeLens: ActiveLensType;
  setActiveView: (view: ActiveView) => void;
  setActiveLens: (lens: ActiveLensType) => void;
}

export const useViewStore = create<ViewState>((set) => ({
  activeView: "projects", // Default view
  activeLens: "relationship", // Default lens
  setActiveView: (view) => set({ activeView: view }),
  setActiveLens: (lens) => set({ activeLens: lens }),
}));
