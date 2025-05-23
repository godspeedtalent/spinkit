// src/app/venues/page.tsx
"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle, ListFilter, Loader2, Building, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTrigger } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { CardSkeleton } from "@/components/shared/card-skeleton";
import VenueCard from "@/components/cards/venue-card";
import type { VenueClient, VenueSortOption, CardSize, UIVenueFilters as StoreVenueFilters } from '@/types'; // Changed import
import FilterControls, { type FilterConfig } from "@/components/shared/filter-controls";
import { useAuthStore } from "@/stores/authStore";
import { useDiscoveryPageLogic } from '@/hooks/useDiscoveryPageLogic';
import { useDiscoveryFilterStore } from '@/stores/discoveryFiltersStore';
import { allGenresList } from "@/data/mock-data/djs";
import { useToast } from "@/hooks/use-toast"; // For mock pop-out

const PAGE_LIMIT = 8;

const initialVenueFilters: StoreVenueFilters = {
  locationFilter: "",
  capacityFilter: [0],
  fanScoreFilter: [0],
  selectedGenres: [],
  showFavorites: false,
};

export default function VenuesPage() {
  const { currentUserRole } = useAuthStore();
  const { toast } = useToast(); // For mock pop-out

  const {
    displayedItems: displayedVenues,
    isLoading,
    isLoadingMore,
    hasMoreData,
    loadMoreRef,
    handleFavoriteToggle,
    currentFilters,
    currentSortOrder,
    currentCardSize,
    setStoreFilters,
    setStoreSortOrder,
    setStoreCardSize,
    applyFiltersAndSort,
    resetFiltersAndFetch,
  } = useDiscoveryPageLogic<VenueClient, StoreVenueFilters, VenueSortOption>({
    apiPath: "/api/venues",
    entityType: 'venue',
    initialFilterValues: initialVenueFilters,
    PAGE_LIMIT,
  });

  // Mock pop-out handler for this page
  const handlePopOut = (venue: VenueClient) => {
    toast({
      title: "Quick View (Mock)",
      description: `Dialog for ${venue.name} would open here.`,
    });
  };

  const getGridColsClass = () => {
    switch (currentCardSize) {
      case "small": return "sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4";
      case "medium": return "sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3";
      case "large": return "sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2";
      default: return "sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3";
    }
  };

  const filterConfig: FilterConfig[] = [
    {
      type: 'text', label: 'Location', id: 'venue-location-filter',
      state: currentFilters.locationFilter, setState: (value) => setStoreFilters({ locationFilter: value as string }),
      placeholder: "e.g., Downtown, Metro City",
    },
    {
      type: 'slider', label: 'Minimum Capacity', id: 'venue-capacity-filter',
      state: currentFilters.capacityFilter, setState: (value) => setStoreFilters({ capacityFilter: value as [number] }),
      min: 0, max: 2000, step: 50,
    },
    {
      type: 'slider', label: 'Minimum Fan Score', id: 'venue-fanscore-filter',
      state: currentFilters.fanScoreFilter, setState: (value) => setStoreFilters({ fanScoreFilter: value as [number] }),
      min: 0, max: 5, step: 0.1,
    },
    {
      type: 'popover-checkbox', label: 'Genres Needed', id: 'venue-genre-filter',
      state: currentFilters.selectedGenres, setState: (value) => setStoreFilters({ selectedGenres: value as string[] }),
      options: allGenresList.map(genre => ({ id: `vgenre-${genre}`, label: genre, value: genre })),
      popoverPlaceholder: "Select genres",
    },
    {
      type: 'checkbox', label: 'Show Favorites Only', id: 'venue-favorites-filter',
      state: currentFilters.showFavorites, setState: (value) => setStoreFilters({ showFavorites: value as boolean }),
    },
  ];

  return (
    <div className="flex h-full">
      <div className="hidden md:block w-72 sticky top-[calc(theme(spacing.14)_-_1px)] h-[calc(100vh_-_theme(spacing.14)_-_1px)] border-r">
        <Card className="h-full flex flex-col shadow-none rounded-none border-t-0">
            <CardContent className="p-4 flex-grow space-y-4"> 
                <FilterControls
                    config={filterConfig}
                    onApplyFilters={applyFiltersAndSort}
                    onResetFilters={resetFiltersAndFetch}
                    isSheet={false}
                />
            </CardContent>
        </Card>
      </div>

      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className="fixed top-[calc(theme(spacing.14)_-_1px_+_theme(spacing.4))] left-4 z-40 md:hidden shadow-lg">
            <ListFilter className="h-5 w-5" /> <span className="ml-2">Filters</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-full max-w-xs sm:max-w-sm p-0 flex flex-col">
           <SheetHeader className="p-4 border-b" />
            <div className="p-4 flex-grow overflow-y-auto space-y-4">
              <FilterControls
                config={filterConfig}
                onApplyFilters={applyFiltersAndSort}
                onResetFilters={resetFiltersAndFetch}
                isSheet={true}
              />
            </div>
        </SheetContent>
      </Sheet>

      <main className="flex-1 p-4 sm:p-6 md:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-2xl font-semibold">Explore Venues</h1>
            <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-end">
                <div className="flex items-center space-x-1">
                    <Label htmlFor="card-size-venue" className="text-xs text-muted-foreground whitespace-nowrap">View:</Label>
                    <Select value={currentCardSize} onValueChange={(value) => setStoreCardSize(value as CardSize)}>
                        <SelectTrigger id="card-size-venue" className="w-auto h-8 text-xs">
                            <SelectValue placeholder="Size" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="small">Small</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="large">Large</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center space-x-1">
                    <Label htmlFor="sort-order-venue" className="text-xs text-muted-foreground whitespace-nowrap">Order by:</Label>
                    <Select value={currentSortOrder} onValueChange={(value) => setStoreSortOrder(value as VenueSortOption)}>
                        <SelectTrigger id="sort-order-venue" className="w-auto h-8 text-xs">
                            <SelectValue placeholder="Sort by..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="score_desc">Fan Score: High to Low</SelectItem>
                            <SelectItem value="score_asc">Fan Score: Low to High</SelectItem>
                            <SelectItem value="capacity_desc">Capacity: High to Low</SelectItem>
                            <SelectItem value="capacity_asc">Capacity: Low to High</SelectItem>
                            <SelectItem value="name_asc">Name: A-Z</SelectItem>
                            <SelectItem value="name_desc">Name: Z-A</SelectItem>
                            <SelectItem value="recent">Recently Added</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                 {currentUserRole === "Admin" && (
                    <Button asChild size="sm" className="h-8 text-xs">
                        <Link href="/venues/create">
                            <PlusCircle className="mr-1.5 h-4 w-4" /> Add Venue
                        </Link>
                    </Button>
                )}
            </div>
        </div>
        {(isLoading && displayedVenues.length === 0) ? (
           <div className={`grid grid-cols-1 ${getGridColsClass()} gap-6`}>
             {Array.from({ length: PAGE_LIMIT }).map((_, index) => (
               <CardSkeleton key={index} />
             ))}
           </div>
         ) : displayedVenues.length > 0 ? (
            <>
            <div className={`grid grid-cols-1 ${getGridColsClass()} gap-6 animate-slide-up-fade-in`}>
              {displayedVenues.map((venue, index) => (
                <VenueCard
                    key={venue.id}
                    venue={venue}
                    onFavoriteToggle={() => handleFavoriteToggle(venue.id)}
                    onPopOut={handlePopOut}
                    isPriorityImage={index < PAGE_LIMIT / 2}
                />
              ))}
            </div>
            <div ref={loadMoreRef} className="h-16 flex items-center justify-center">
                {isLoadingMore && <Loader2 className="h-6 w-6 animate-spin text-primary" />}
                {!hasMoreData && displayedVenues.length > 0 && <p className="text-sm text-muted-foreground">You've reached the end of the list.</p>}
            </div>
            </>
        ) : (
          <Card className="col-span-full">
            <CardContent className="p-6 text-center">
              <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4"/>
              <p className="text-xl text-muted-foreground">No venues match your current filters.</p>
               <p className="text-sm text-muted-foreground mt-1">Try adjusting your criteria or <Button variant="link" className="p-0 h-auto" onClick={resetFiltersAndFetch}>reset all filters</Button>.</p>
                <Button asChild variant="link" className="mt-2">
                    <Link href="/genres">Explore all genres</Link>
                </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
