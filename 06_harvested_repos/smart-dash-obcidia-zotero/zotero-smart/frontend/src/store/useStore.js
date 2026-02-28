/**
 * Zotero Smart - Zustand Store
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useStore = create(
  persist(
    (set, get) => ({
      // Theme
      darkMode: false,
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),

      // View preferences
      viewMode: 'grid', // grid | list | table
      setViewMode: (mode) => set({ viewMode: mode }),

      // Sort preferences
      sortBy: 'updated_at',
      sortOrder: 'desc',
      setSortBy: (field) => set({ sortBy: field }),
      setSortOrder: (order) => set({ sortOrder: order }),

      // Selected items (for bulk actions)
      selectedReferences: [],
      selectReference: (id) => set((state) => ({
        selectedReferences: state.selectedReferences.includes(id)
          ? state.selectedReferences
          : [...state.selectedReferences, id]
      })),
      deselectReference: (id) => set((state) => ({
        selectedReferences: state.selectedReferences.filter((i) => i !== id)
      })),
      toggleSelectReference: (id) => set((state) => ({
        selectedReferences: state.selectedReferences.includes(id)
          ? state.selectedReferences.filter((i) => i !== id)
          : [...state.selectedReferences, id]
      })),
      clearSelection: () => set({ selectedReferences: [] }),
      selectAll: (ids) => set({ selectedReferences: ids }),

      // Active collection filter
      activeCollectionId: null,
      setActiveCollectionId: (id) => set({ activeCollectionId: id }),

      // Citation style preference
      preferredCitationStyle: 'apa',
      setPreferredCitationStyle: (style) => set({ preferredCitationStyle: style }),

      // Recent searches
      recentSearches: [],
      addRecentSearch: (query) => set((state) => ({
        recentSearches: [
          query,
          ...state.recentSearches.filter((q) => q !== query)
        ].slice(0, 10)
      })),
      clearRecentSearches: () => set({ recentSearches: [] }),

      // Sidebar state
      sidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    }),
    {
      name: 'zotero-smart-storage',
      partialize: (state) => ({
        darkMode: state.darkMode,
        viewMode: state.viewMode,
        sortBy: state.sortBy,
        sortOrder: state.sortOrder,
        preferredCitationStyle: state.preferredCitationStyle,
        recentSearches: state.recentSearches,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);
