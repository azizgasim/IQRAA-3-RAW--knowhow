/**
 * Obsidia Store - إدارة الحالة باستخدام Zustand
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useStore = create(
  persist(
    (set, get) => ({
      // ===== UI State =====
      darkMode: false,
      toggleDarkMode: () => {
        const newMode = !get().darkMode;
        set({ darkMode: newMode });
        // Apply to document
        if (newMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },

      sidebarOpen: true,
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      // ===== Notes State =====
      currentNote: null,
      setCurrentNote: (note) => set({ currentNote: note }),

      draftContent: '',
      setDraftContent: (content) => set({ draftContent: content }),

      // ===== Search State =====
      searchQuery: '',
      setSearchQuery: (query) => set({ searchQuery: query }),

      searchFilters: {
        searchIn: ['notes', 'questions', 'quotations'],
        projectId: null,
        tags: [],
        dateFrom: null,
        dateTo: null,
      },
      setSearchFilters: (filters) =>
        set((state) => ({
          searchFilters: { ...state.searchFilters, ...filters },
        })),
      resetSearchFilters: () =>
        set({
          searchFilters: {
            searchIn: ['notes', 'questions', 'quotations'],
            projectId: null,
            tags: [],
            dateFrom: null,
            dateTo: null,
          },
        }),

      // ===== Project State =====
      currentProject: null,
      setCurrentProject: (project) => set({ currentProject: project }),

      // ===== Notifications =====
      pendingReminders: 0,
      setPendingReminders: (count) => set({ pendingReminders: count }),

      // ===== Integration =====
      iqraConnected: false,
      setIqraConnected: (connected) => set({ iqraConnected: connected }),

      // ===== Cognitive =====
      momentum: {
        current_score: 0,
        trend: 'stable',
        streak_days: 0,
      },
      setMomentum: (momentum) => set({ momentum }),

      // ===== View Preferences =====
      notesViewMode: 'grid', // 'grid' | 'list'
      setNotesViewMode: (mode) => set({ notesViewMode: mode }),

      // ===== Recently Viewed =====
      recentNotes: [],
      addRecentNote: (noteId) =>
        set((state) => {
          const filtered = state.recentNotes.filter((id) => id !== noteId);
          return { recentNotes: [noteId, ...filtered].slice(0, 10) };
        }),
    }),
    {
      name: 'obsidia-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        darkMode: state.darkMode,
        searchFilters: state.searchFilters,
        notesViewMode: state.notesViewMode,
        recentNotes: state.recentNotes,
      }),
      onRehydrateStorage: () => (state) => {
        // Apply dark mode on rehydration
        if (state?.darkMode) {
          document.documentElement.classList.add('dark');
        }
      },
    }
  )
);

export default useStore;
