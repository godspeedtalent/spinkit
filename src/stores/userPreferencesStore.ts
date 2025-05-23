
"use client";

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface FeatureToggles {
  social: boolean;
  discovery: boolean;
  musicPlayer: boolean;
  aiFeatures: boolean;
  transactions: boolean;
  notifications: boolean;
}

interface UserPreferencesState {
  currentCity: string;
  isBankAccountLinked: boolean;
  searchQuery: string;
  isSearchOpen: boolean;
  featureToggles: FeatureToggles;
  isCalendarQuickViewOpen: boolean;
  toolIconPosition: 'top' | 'bottom'; // New state
  setCurrentCity: (city: string) => void;
  setIsBankAccountLinked: (isLinked: boolean) => void;
  setSearchQuery: (query: string) => void;
  setIsSearchOpen: (isOpen: boolean) => void;
  toggleFeature: (featureKey: keyof FeatureToggles) => void;
  setCalendarQuickViewOpen: (isOpen: boolean) => void;
  toggleCalendarQuickView: () => void;
  toggleToolIconPosition: () => void; // New action
}

export const useUserPreferencesStore = create<UserPreferencesState>()(
  persist(
    (set, get) => ({
      currentCity: "Worldwide",
      isBankAccountLinked: false,
      searchQuery: "",
      isSearchOpen: false,
      featureToggles: { 
        social: true,
        discovery: true,
        musicPlayer: true,
        aiFeatures: true,
        transactions: true,
        notifications: true,
      },
      isCalendarQuickViewOpen: false,
      toolIconPosition: 'top', // Default to top
      setCurrentCity: (city) => set({ currentCity: city }),
      setIsBankAccountLinked: (isLinked) => set({ isBankAccountLinked: isLinked }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setIsSearchOpen: (isOpen) => set({ isSearchOpen: isOpen }),
      toggleFeature: (featureKey) =>
        set((state) => ({
          featureToggles: {
            ...state.featureToggles,
            [featureKey]: !state.featureToggles[featureKey],
          },
        })),
      setCalendarQuickViewOpen: (isOpen) => set({ isCalendarQuickViewOpen: isOpen }),
      toggleCalendarQuickView: () => set((state) => ({ isCalendarQuickViewOpen: !state.isCalendarQuickViewOpen })),
      toggleToolIconPosition: () => set((state) => ({ 
        toolIconPosition: state.toolIconPosition === 'top' ? 'bottom' : 'top' 
      })),
    }),
    {
      name: 'user-preferences-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentCity: state.currentCity,
        isBankAccountLinked: state.isBankAccountLinked,
        featureToggles: state.featureToggles,
        toolIconPosition: state.toolIconPosition, // Persist this new preference
        // searchQuery, isSearchOpen, and isCalendarQuickViewOpen are intentionally not persisted
      }),
    }
  )
);
