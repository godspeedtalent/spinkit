// src/app/events/page.tsx
"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Ticket, ListFilter, Loader2, X } from "lucide-react"; // Keep Ticket for noResultsMessage
import { Sheet, SheetContent, SheetHeader, SheetTrigger } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { CardSkeleton } from "@/components/shared/card-skeleton"; // Keep for explicit pass to ItemGrid
import EventCard from "@/components/cards/event-card";
import type { EventClient, EventSortOption, CardSize, UIEventFilters as StoreEventFilters } from '@/types';
import FilterControls, { type FilterConfig } from "@/components/shared/filter-controls";
import { ItemGrid } from '@/components/shared/item-grid'; // Import ItemGrid
import { useDiscoveryPageLogic } from '@/hooks/useDiscoveryPageLogic';
import { useDiscoveryFilterStore } from '@/stores/discoveryFiltersStore';
import { allGenresList } from "@/data/mock-data/djs";
import { allEventCitiesList } from "@/data/mock-data/events";
import { useToast } from "@/hooks/use-toast"; // For mock pop-out

const PAGE_LIMIT = 8;

const initialEventFilters: StoreEventFilters = {
  selectedGenres: [],
  selectedCities: [],
  showFavorites: false,
};

export default function EventDiscoveryPage() {
  const { toast } = useToast(); // For mock pop-out

  const {
    displayedItems: displayedEvents,
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
  } = useDiscoveryPageLogic<EventClient, StoreEventFilters, EventSortOption>({
    apiPath: "/api/events",
    entityType: 'event',
    initialFilterValues: initialEventFilters,
    PAGE_LIMIT,
  });
  
  // Mock pop-out handler for this page
  const handlePopOut = (event: EventClient) => {
    toast({
      title: "Quick View (Mock)",
      description: `Dialog for ${event.name} would open here.`,
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
      type: 'popover-checkbox', label: 'Genre(s)', id: 'event-genre-filter',
      state: currentFilters.selectedGenres, setState: (value) => setStoreFilters({ selectedGenres: value as string[] }),
      options: allGenresList.map(genre => ({ id: `egenre-${genre}`, label: genre, value: genre })),
      popoverPlaceholder: "Select genres",
    },
    {
      type: 'popover-checkbox', label: 'City/Location', id: 'event-city-filter',
      state: currentFilters.selectedCities, setState: (value) => setStoreFilters({ selectedCities: value as string[] }),
      options: allEventCitiesList.map(city => ({ id: `ecity-${city}`, label: city, value: city })),
      popoverPlaceholder: "Select cities",
    },
    {
      type: 'checkbox', label: 'Show Favorites Only', id: 'event-favorites-filter',
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
            <div className="p-4 flex-grow overflow-y-auto">
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
            <h1 className="text-2xl font-semibold">Browse Events</h1>
            <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                 <div className="flex items-center space-x-1">
                    <Label htmlFor="card-size-event" className="text-xs text-muted-foreground whitespace-nowrap">View:</Label>
                    <Select value={currentCardSize} onValueChange={(value) => setStoreCardSize(value as CardSize)}>
                        <SelectTrigger id="card-size-event" className="w-auto h-8 text-xs">
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
                    <Label htmlFor="sort-order-event" className="text-xs text-muted-foreground whitespace-nowrap">Order by:</Label>
                    <Select value={currentSortOrder} onValueChange={(value) => setStoreSortOrder(value as EventSortOption)}>
                        <SelectTrigger id="sort-order-event" className="w-auto h-8 text-xs">
                            <SelectValue placeholder="Sort by..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="date_asc">Date: Soonest First</SelectItem>
                            <SelectItem value="date_desc">Date: Latest First</SelectItem>
                            <SelectItem value="recent">Recently Added</SelectItem>
                            <SelectItem value="name_asc">Name: A-Z</SelectItem>
                            <SelectItem value="name_desc">Name: Z-A</SelectItem>
                            <SelectItem value="city_asc">City: A-Z</SelectItem>
                            <SelectItem value="city_desc">City: Z-A</SelectItem>
                            <SelectItem value="attendance_desc">Attendance: High to Low</SelectItem>
                            <SelectItem value="attendance_asc">Attendance: Low to High</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
        <ItemGrid<EventClient>
          isLoading={isLoading && displayedEvents.length === 0}
          items={displayedEvents}
          renderItem={(event, index) => (
            <EventCard
                key={event.id}
                event={event}
                onFavoriteToggle={() => handleFavoriteToggle(event.id)}
                onPopOut={handlePopOut}
                isPriorityImage={index < PAGE_LIMIT / 2}
            />
          )}
          cardSize={currentCardSize}
          pageLimit={PAGE_LIMIT}
          noResultsMessage={
            <Card className="col-span-full">
              <CardContent className="p-6 text-center">
                  <Ticket className="h-12 w-12 text-muted-foreground mx-auto mb-4"/>
                  <p className="text-xl text-muted-foreground">No events match your current filters.</p>
                  <p className="text-sm text-muted-foreground mt-1">Try adjusting your criteria or <Button variant="link" className="p-0 h-auto" onClick={resetFiltersAndFetch}>reset all filters</Button>.</p>
                  <Button asChild variant="link" className="mt-2">
                      <Link href="/genres">Explore all genres</Link>
                  </Button>
              </CardContent>
            </Card>
          }
          getGridColsClass={getGridColsClass}
          skeletonComponent={CardSkeleton}
        />

        {/* Infinite scroll loading indicator and end of list message */}
        {displayedEvents.length > 0 && (
            <div ref={loadMoreRef} className="h-16 flex items-center justify-center">
                {isLoadingMore && <Loader2 className="h-6 w-6 animate-spin text-primary" />}
                {!isLoadingMore && !hasMoreData && <p className="text-sm text-muted-foreground">You've reached the end of the list.</p>}
            </div>
        )}
      </main>
    </div>
  );
}
