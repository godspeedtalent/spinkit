
"use client";

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CardSize, DjSortOption, EventSortOption, RecordingSortOption, VenueSortOption } from '@/types'; // Assuming these types are defined in types.ts

// Define filter state interfaces for each entity type
export interface UIDjFilters {
  selectedGenres: string[];
  locationFilter: string;
  scoreFilter: [number, number]; // Now a range [min, max]
  showFavorites: boolean;
}

export interface UIVenueFilters {
  locationFilter: string;
  capacityFilter: [number]; // Single value for minCapacity
  fanScoreFilter: [number];   // Single value for minFanScore
  selectedGenres: string[];   // For djNeeds
  showFavorites: boolean;
}

export interface UIEventFilters {
  selectedGenres: string[];
  selectedCities: string[];
  showFavorites: boolean;
}

export interface UIRecordingFilters {
  genres: string[];
  showFavorites: boolean;
}

interface DiscoveryFiltersState {
  // DJ Filters
  djFilters: UIDjFilters;
  djSortOrder: DjSortOption;
  djCardSize: CardSize;
  setDjFilters: (filters: Partial<UIDjFilters>) => void;
  setDjSortOrder: (sortOrder: DjSortOption) => void;
  setDjCardSize: (cardSize: CardSize) => void;

  // Venue Filters
  venueFilters: UIVenueFilters;
  venueSortOrder: VenueSortOption;
  venueCardSize: CardSize;
  setVenueFilters: (filters: Partial<UIVenueFilters>) => void;
  setVenueSortOrder: (sortOrder: VenueSortOption) => void;
  setVenueCardSize: (cardSize: CardSize) => void;

  // Event Filters
  eventFilters: UIEventFilters;
  eventSortOrder: EventSortOption;
  eventCardSize: CardSize;
  setEventFilters: (filters: Partial<UIEventFilters>) => void;
  setEventSortOrder: (sortOrder: EventSortOption) => void;
  setEventCardSize: (cardSize: CardSize) => void;

  // Recording Filters
  recordingFilters: UIRecordingFilters;
  recordingSortOrder: RecordingSortOption;
  recordingCardSize: CardSize;
  setRecordingFilters: (filters: Partial<UIRecordingFilters>) => void;
  setRecordingSortOrder: (sortOrder: RecordingSortOption) => void;
  setRecordingCardSize: (cardSize: CardSize) => void;
}

const initialDjFilters: UIDjFilters = {
  selectedGenres: [],
  locationFilter: "",
  scoreFilter: [60, 100], // Default for range slider
  showFavorites: false,
};

const initialVenueFilters: UIVenueFilters = {
  locationFilter: "",
  capacityFilter: [0],
  fanScoreFilter: [0],
  selectedGenres: [],
  showFavorites: false,
};

const initialEventFilters: UIEventFilters = {
  selectedGenres: [],
  selectedCities: [],
  showFavorites: false,
};

const initialRecordingFilters: UIRecordingFilters = {
  genres: [],
  showFavorites: false,
};

export const useDiscoveryFilterStore = create<DiscoveryFiltersState>()(
  persist(
    (set) => ({
      // DJ States
      djFilters: initialDjFilters,
      djSortOrder: "score_desc" as DjSortOption,
      djCardSize: "medium" as CardSize,
      setDjFilters: (filters) => set((state) => ({ djFilters: { ...state.djFilters, ...filters } })),
      setDjSortOrder: (sortOrder) => set({ djSortOrder: sortOrder }),
      setDjCardSize: (cardSize) => set({ djCardSize: cardSize }),

      // Venue States
      venueFilters: initialVenueFilters,
      venueSortOrder: "score_desc" as VenueSortOption,
      venueCardSize: "medium" as CardSize,
      setVenueFilters: (filters) => set((state) => ({ venueFilters: { ...state.venueFilters, ...filters } })),
      setVenueSortOrder: (sortOrder) => set({ venueSortOrder: sortOrder }),
      setVenueCardSize: (cardSize) => set({ venueCardSize: cardSize }),

      // Event States
      eventFilters: initialEventFilters,
      eventSortOrder: "date_asc" as EventSortOption,
      eventCardSize: "medium" as CardSize,
      setEventFilters: (filters) => set((state) => ({ eventFilters: { ...state.eventFilters, ...filters } })),
      setEventSortOrder: (sortOrder) => set({ eventSortOrder: sortOrder }),
      setEventCardSize: (cardSize) => set({ eventCardSize: cardSize }),

      // Recording States
      recordingFilters: initialRecordingFilters,
      recordingSortOrder: "recent" as RecordingSortOption,
      recordingCardSize: "medium" as CardSize,
      setRecordingFilters: (filters) => set((state) => ({ recordingFilters: { ...state.recordingFilters, ...filters } })),
      setRecordingSortOrder: (sortOrder) => set({ recordingSortOrder: sortOrder }),
      setRecordingCardSize: (cardSize) => set({ recordingCardSize: cardSize }),
    }),
    {
      name: 'discovery-filters-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Helper type for the hook
export type EntityType = 'dj' | 'venue' | 'event' | 'recording';

export type DiscoveryStoreFilterTypes = UIDjFilters | UIVenueFilters | UIEventFilters | UIRecordingFilters;
export type DiscoveryStoreSortTypes = DjSortOption | VenueSortOption | EventSortOption | RecordingSortOption;

export type FilterStoreActions<F extends DiscoveryStoreFilterTypes, S extends DiscoveryStoreSortTypes> = {
  setFilters: (filters: Partial<F>) => void;
  setSortOrder: (sortOrder: S) => void;
  setCardSize: (cardSize: CardSize) => void;
};

export type FilterStoreSelectors<F extends DiscoveryStoreFilterTypes, S extends DiscoveryStoreSortTypes> = {
  selectFilters: () => F;
  selectSortOrder: () => S;
  selectCardSize: () => CardSize;
};
