import { create } from 'zustand';
import { Source } from '@/types';
import { useActivityStore } from './activityStore';

interface SourceState {
  sources: Source[];
  addSource: (newSource: Omit<Source, 'id'>) => void;
  updateSource: (sourceId: string, updatedFields: Partial<Omit<Source, 'id'>>) => void;
  deleteSource: (sourceId: string) => { undo: () => void };
}

export const useSourceStore = create<SourceState>((set, get) => ({
  sources: [
    { id: 's1', title: 'The Republic', type: 'book', author: 'Plato' },
    { id: 's2', title: 'On the Shortness of Life', type: 'article', author: 'Seneca' },
    { id: 's3', title: 'Gemini Blog Post', type: 'website', url: 'https://gemini.google.com/blog' },
  ],
  addSource: (newSource) => {
    const addActivity = useActivityStore.getState().addActivity;
    const sourceWithId = { ...newSource, id: `s${get().sources.length + 1}` };
    set((state) => ({
      sources: [...state.sources, sourceWithId],
    }));
    addActivity({
      type: 'source_created',
      description: `Source \"${sourceWithId.title}\" was created.`,
    });
  },
  updateSource: (sourceId, updatedFields) => {
    const addActivity = useActivityStore.getState().addActivity;
    set((state) => ({
      sources: state.sources.map((s) => (s.id === sourceId ? { ...s, ...updatedFields } : s)),
    }));
    const updatedSource = get().sources.find(s => s.id === sourceId);
    if (updatedSource) {
      addActivity({
        type: 'source_updated',
        description: `Source \"${updatedSource.title}\" was updated.`,
      });
    }
  },
  deleteSource: (sourceId) => {
    const addActivity = useActivityStore.getState().addActivity;
    const originalSources = get().sources;
    const sourceToDelete = originalSources.find(s => s.id === sourceId);
    if (!sourceToDelete) return { undo: () => {} };

    set((state) => ({
      sources: state.sources.filter((s) => s.id !== sourceId),
    }));

    addActivity({
      type: 'source_deleted',
      description: `Source \"${sourceToDelete.title}\" was deleted.`,
    });

    return {
      undo: () => set({ sources: originalSources }),
    };
  },
}));
