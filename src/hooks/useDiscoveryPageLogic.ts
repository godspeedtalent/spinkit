
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { PaginatedResponse, CardSize, BaseApiFilters } from '@/types';
import type { EntityType, DiscoveryStoreFilterTypes, DiscoveryStoreSortTypes, FilterStoreActions, FilterStoreSelectors } from '@/stores/discoveryFiltersStore';
import { useDiscoveryFilterStore } from '@/stores/discoveryFiltersStore'; // Import the store itself

const DEFAULT_PAGE_LIMIT = 8;

export interface DiscoveryItemBase {
  id: string;
  isFavorited?: boolean;
  addedDate?: string;
  name?: string; // For basic sorting
  score?: number; // For DJ/Venue sorting
  fanScore?: number; // For Recording/Venue sorting
  // Add other common sortable/filterable fields if necessary
}

interface UseDiscoveryPageLogicProps<
  TItem extends DiscoveryItemBase,
  TFilters extends DiscoveryStoreFilterTypes,
  TSortOption extends DiscoveryStoreSortTypes
> {
  apiPath: string;
  entityType: EntityType; // Used to get correct store slice
  initialFilterValues: TFilters;
  clientSortFunction?: (items: TItem[], sortOrder: TSortOption, filters: TFilters) => TItem[];
  PAGE_LIMIT?: number;
}

export interface UseDiscoveryPageLogicReturn<
  TItem extends DiscoveryItemBase,
  TFilters extends DiscoveryStoreFilterTypes,
  TSortOption extends DiscoveryStoreSortTypes
> {
  displayedItems: TItem[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMoreData: boolean;
  loadMoreRef: (node: HTMLDivElement | null) => void;
  handleFavoriteToggle: (itemId: string) => void;
  // Store values and setters are now derived from useDiscoveryFilterStore
  currentFilters: TFilters;
  currentSortOrder: TSortOption;
  currentCardSize: CardSize;
  setStoreFilters: (filters: Partial<TFilters>) => void;
  setStoreSortOrder: (sortOrder: TSortOption) => void;
  setStoreCardSize: (cardSize: CardSize) => void;
  applyFiltersAndSort: () => void; // Triggers refetch
  resetFiltersAndFetch: () => void; // Resets store and refetches
  totalPages: number;
}

export function useDiscoveryPageLogic<
  TItem extends DiscoveryItemBase,
  TFilters extends DiscoveryStoreFilterTypes,
  TSortOption extends DiscoveryStoreSortTypes
>(
  props: UseDiscoveryPageLogicProps<TItem, TFilters, TSortOption>
): UseDiscoveryPageLogicReturn<TItem, TFilters, TSortOption> {
  const { apiPath, entityType, initialFilterValues, clientSortFunction, PAGE_LIMIT = DEFAULT_PAGE_LIMIT } = props;
  const { toast } = useToast();

  // Get state and actions from the Zustand store
  const storeFilters = useDiscoveryFilterStore(state => state[`${entityType}Filters` as keyof typeof state] as TFilters);
  const storeSortOrder = useDiscoveryFilterStore(state => state[`${entityType}SortOrder` as keyof typeof state] as TSortOption);
  const storeCardSize = useDiscoveryFilterStore(state => state[`${entityType}CardSize` as keyof typeof state] as CardSize);

  const setStoreFilters = useDiscoveryFilterStore(state => state[`set${capitalize(entityType)}Filters` as keyof typeof state] as (filters: Partial<TFilters>) => void);
  const setStoreSortOrder = useDiscoveryFilterStore(state => state[`set${capitalize(entityType)}SortOrder` as keyof typeof state] as (sortOrder: TSortOption) => void);
  const setStoreCardSize = useDiscoveryFilterStore(state => state[`set${capitalize(entityType)}CardSize` as keyof typeof state] as (cardSize: CardSize) => void);

  const [allFetchedItems, setAllFetchedItems] = useState<TItem[]>([]);
  const [displayedItems, setDisplayedItems] = useState<TItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [totalPages, setTotalPages] = useState(1);

  const observer = useRef<IntersectionObserver | null>(null);

  const fetchItems = useCallback(async (page: number, resetList: boolean = false) => {
    if (resetList) {
      setIsLoading(true);
      setAllFetchedItems([]);
      setCurrentPage(1);
      setTotalPages(1);
      setHasMoreData(true);
    } else {
      setIsLoadingMore(true);
    }

    const queryParams = new URLSearchParams();
    queryParams.append('page', page.toString());
    queryParams.append('limit', PAGE_LIMIT.toString());

    // Add filter parameters from storeFilters
    Object.entries(storeFilters).forEach(([key, value]) => {
      if (key === 'showFavorites') return; // Handled client-side for now
      if (value !== undefined && value !== null && (Array.isArray(value) ? value.length > 0 : String(value).trim() !== '')) {
        if (Array.isArray(value)) {
          // For UIDjFilters scoreFilter is [min, max], for UIVenueFilters capacity/fanScore are [min]
          if (key === 'scoreFilter' && value.length === 2) {
            queryParams.append('minScore', String(value[0]));
            queryParams.append('maxScore', String(value[1]));
          } else if ((key === 'capacityFilter' || key === 'fanScoreFilter') && value.length === 1) {
            if (key === 'capacityFilter') queryParams.append('minCapacity', String(value[0]));
            if (key === 'fanScoreFilter') queryParams.append('minFanScore', String(value[0]));
          } else {
            queryParams.append(key, value.join(','));
          }
        } else {
          queryParams.append(key, String(value));
        }
      }
    });
    
    // Add sort order (API needs to support this)
    // queryParams.append('sort', storeSortOrder); 


    try {
      const res = await fetch(`${apiPath}?${queryParams.toString()}`);
      if (!res.ok) throw new Error(`Failed to fetch ${entityType}s`);
      const data: PaginatedResponse<TItem> = await res.json();

      const newItemsWithClientState = data.items.map(item => ({
        ...item,
        isFavorited: allFetchedItems.find(oldItem => oldItem.id === item.id)?.isFavorited || item.isFavorited || false,
      }));

      setAllFetchedItems(prev => resetList ? newItemsWithClientState : [...prev, ...newItemsWithClientState]);
      setCurrentPage(data.currentPage);
      setHasMoreData(data.hasMore);
      setTotalPages(data.totalPages);
    } catch (error: any) {
      toast({ title: "Error", description: `Could not load ${entityType} data: ${error.message}`, variant: "destructive" });
      setHasMoreData(false);
    } finally {
      if (resetList) setIsLoading(false);
      else setIsLoadingMore(false);
    }
  }, [apiPath, entityType, PAGE_LIMIT, toast, storeFilters, allFetchedItems]); // storeSortOrder removed if API doesn't sort

  // Effect for initial load and when store filters/sort order change
  useEffect(() => {
    fetchItems(1, true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeFilters, storeSortOrder]); // Re-fetch when filters or sort order from store changes


  // Effect for client-side processing (sorting, favorite filtering)
  useEffect(() => {
    if (isLoading || isLoadingMore) return;

    let processedItems = [...allFetchedItems];

    if (storeFilters.showFavorites) {
      processedItems = processedItems.filter(item => item.isFavorited);
    }

    if (clientSortFunction) {
      processedItems = clientSortFunction(processedItems, storeSortOrder, storeFilters);
    } else {
      // Basic client-side sort if no custom function and API doesn't sort fully
      // This is a simplified example, real sorting would be more complex
      processedItems.sort((a, b) => {
        if (storeSortOrder.includes('_asc')) {
          if (a.name && b.name) return a.name.localeCompare(b.name);
        } else if (storeSortOrder.includes('_desc')) {
          if (a.name && b.name) return b.name.localeCompare(a.name);
        }
        // Fallback or more sort options needed here
        return (new Date(b.addedDate || 0).getTime()) - (new Date(a.addedDate || 0).getTime());
      });
    }
    setDisplayedItems(processedItems);
  }, [allFetchedItems, storeSortOrder, storeFilters, isLoading, isLoadingMore, clientSortFunction]);


  const loadMoreRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoading || isLoadingMore) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMoreData && !isLoadingMore && currentPage < totalPages) {
        fetchItems(currentPage + 1, false);
      }
    }, { rootMargin: "200px 0px" });

    if (node) observer.current.observe(node);
  }, [isLoading, isLoadingMore, hasMoreData, currentPage, totalPages, fetchItems]);

  const handleFavoriteToggle = useCallback((itemId: string) => {
    setAllFetchedItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, isFavorited: !item.isFavorited } : item
      )
    );
    // DisplayedItems will update via its useEffect
  }, []);

  const applyFiltersAndSort = useCallback(() => {
    fetchItems(1, true); // This will use the current storeFilters and storeSortOrder
  }, [fetchItems]);

  const resetFiltersAndFetch = useCallback(() => {
    setStoreFilters(initialFilterValues);
    // setStoreSortOrder(initialSortOrder); // Need an initial sort order for each entity
    fetchItems(1, true);
  }, [setStoreFilters, initialFilterValues, fetchItems]);

  return {
    displayedItems,
    isLoading,
    isLoadingMore,
    hasMoreData,
    loadMoreRef,
    handleFavoriteToggle,
    currentFilters: storeFilters,
    currentSortOrder: storeSortOrder,
    currentCardSize: storeCardSize,
    setStoreFilters,
    setStoreSortOrder,
    setStoreCardSize,
    applyFiltersAndSort,
    resetFiltersAndFetch,
    totalPages,
  };
}

// Helper to capitalize entityType for store action names
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

