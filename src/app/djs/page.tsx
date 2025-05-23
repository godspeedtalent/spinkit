// src/app/djs/page.tsx
"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ListFilter, Loader2, ImageIcon, X, MapPin as MapPinIcon, Tags } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTrigger } from "@/components/ui/sheet";
import { CardSkeleton } from "@/components/shared/card-skeleton";
import DJCard from "@/components/cards/dj-card";
import type { DJClient, DjSortOption, CardSize, UIDjFilters as StoreDjFilters } from '@/types'; // Changed import
import FilterControls, { type FilterConfig } from "@/components/shared/filter-controls";
import { useDiscoveryPageLogic } from '@/hooks/useDiscoveryPageLogic';
import { useDiscoveryFilterStore } from '@/stores/discoveryFiltersStore';
import Image from "next/image";
import { allGenresList } from "@/data/mock-data/djs";

const PAGE_LIMIT = 8;

const initialDjFilters: StoreDjFilters = {
  selectedGenres: [],
  locationFilter: "",
  scoreFilter: [60, 100],
  showFavorites: false,
};

export default function ArtistDiscoveryPage() {
  const store = useDiscoveryFilterStore();

  const {
    displayedItems: displayedDjs,
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
  } = useDiscoveryPageLogic<DJClient, StoreDjFilters, DjSortOption>({
    apiPath: "/api/djs",
    entityType: 'dj',
    initialFilterValues: initialDjFilters,
    PAGE_LIMIT,
  });

  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [selectedDjForQuickView, setSelectedDjForQuickView] = useState<DJClient | null>(null);

  const handlePopOut = (dj: DJClient) => {
    setSelectedDjForQuickView(dj);
    setIsQuickViewOpen(true);
  };

  const getGridColsClass = () => {
    switch (currentCardSize) {
      case "small": return "sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5";
      case "medium": return "sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3";
      case "large": return "sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2";
      default: return "sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3";
    }
  };
  
  const filterConfig: FilterConfig[] = [
    {
      type: 'popover-checkbox',
      label: 'Genre(s)',
      id: 'genre-filter',
      state: currentFilters.selectedGenres,
      setState: (value) => setStoreFilters({ selectedGenres: value as string[] }),
      options: allGenresList.map(genre => ({ id: `genre-${genre}`, label: genre, value: genre })),
      popoverPlaceholder: "Select genres",
    },
    {
      type: 'text',
      label: 'Location',
      id: 'location-filter',
      state: currentFilters.locationFilter,
      setState: (value) => setStoreFilters({ locationFilter: value as string }),
      placeholder: "e.g., New York, Berlin",
    },
    {
      type: 'slider',
      label: 'Score Range',
      id: 'score-filter',
      state: currentFilters.scoreFilter,
      setState: (value) => setStoreFilters({ scoreFilter: value as [number, number] }),
      min: 0,
      max: 100,
      step: 1,
      range: true,
    },
    {
      type: 'checkbox',
      label: 'Show Favorites Only',
      id: 'favorites-filter',
      state: currentFilters.showFavorites,
      setState: (value) => setStoreFilters({ showFavorites: value as boolean }),
    },
  ];

  return (
    <div className="flex h-full">
      <div className="hidden md:block w-72 sticky top-[calc(theme(spacing.14)_-_1px)] h-[calc(100vh_-_theme(spacing.14)_-_1px)] border-r">
        <Card className="h-full flex flex-col shadow-none rounded-none border-t-0">
            <CardContent className="p-4 flex-grow overflow-y-auto space-y-4"> 
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
            <h1 className="text-2xl font-semibold">Browse Artists</h1>
            <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                <div className="flex items-center space-x-1">
                    <Label htmlFor="card-size" className="text-xs text-muted-foreground whitespace-nowrap">View:</Label>
                    <Select value={currentCardSize} onValueChange={(value) => setStoreCardSize(value as CardSize)}>
                        <SelectTrigger id="card-size" className="w-auto h-8 text-xs">
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
                    <Label htmlFor="sort-order" className="text-xs text-muted-foreground whitespace-nowrap">Order by:</Label>
                    <Select value={currentSortOrder} onValueChange={(value) => setStoreSortOrder(value as DjSortOption)}>
                        <SelectTrigger id="sort-order" className="w-auto h-8 text-xs">
                            <SelectValue placeholder="Sort by..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="score_desc">Score: High to Low</SelectItem>
                            <SelectItem value="score_asc">Score: Low to High</SelectItem>
                            <SelectItem value="name_asc">Name: A-Z</SelectItem>
                            <SelectItem value="name_desc">Name: Z-A</SelectItem>
                            <SelectItem value="recent">Recently Added</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
         {(isLoading && displayedDjs.length === 0) ? (
           <div className={`grid grid-cols-1 ${getGridColsClass()} gap-6`}>
             {Array.from({ length: PAGE_LIMIT }).map((_, index) => (
               <CardSkeleton key={index} />
             ))}
           </div>
         ) : displayedDjs.length > 0 ? (
            <>
            <div className={`grid grid-cols-1 ${getGridColsClass()} gap-6 animate-slide-up-fade-in`}>
              {displayedDjs.map((dj, index) => (
                <DJCard 
                    key={dj.id}
                    dj={dj}
                    onFavoriteToggle={() => handleFavoriteToggle(dj.id)}
                    onPopOut={handlePopOut}
                    isPriorityImage={index < PAGE_LIMIT / 2} 
                />
              ))}
          </div>
          <div ref={loadMoreRef} className="h-16 flex items-center justify-center">
            {isLoadingMore && <Loader2 className="h-6 w-6 animate-spin text-primary" />}
            {!hasMoreData && displayedDjs.length > 0 && <p className="text-sm text-muted-foreground">You've reached the end of the list.</p>}
          </div>
          </>
        ) : (
            <Card className="col-span-full">
              <CardContent className="p-6 text-center">
                  <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-xl text-muted-foreground">No artists match your current filters.</p>
                  <p className="text-sm text-muted-foreground mt-1">Try adjusting your criteria or <Button variant="link" className="p-0 h-auto" onClick={resetFiltersAndFetch}>reset all filters</Button>.</p>
                  <Button asChild variant="link" className="mt-2">
                      <Link href="/genres">Explore all genres</Link>
                  </Button>
              </CardContent>
            </Card>
        )}
      </main>

      {selectedDjForQuickView && (
         <Dialog open={isQuickViewOpen} onOpenChange={setIsQuickViewOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl">{selectedDjForQuickView.name}</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <div className="w-full aspect-square rounded-lg shadow-lg overflow-hidden mb-4 relative">
                    <Image 
                        src={selectedDjForQuickView.imageUrl}
                        alt={selectedDjForQuickView.name}
                        fill
                        className="object-cover"
                        data-ai-hint={selectedDjForQuickView.aiHint || selectedDjForQuickView.name}
                        placeholder="empty"
                    />
                  </div>
                  <div className="text-sm space-y-1">
                    <p className="flex items-center"><MapPinIcon className="h-4 w-4 mr-2 text-primary" /> Location: {selectedDjForQuickView.location}</p>
                    <p className="flex items-center"><Tags className="h-4 w-4 mr-2 text-primary" /> Genres: {selectedDjForQuickView.genres.join(', ')}</p>
                    {selectedDjForQuickView.score > 59 && <p className="flex items-center"><MapPinIcon className="h-4 w-4 mr-2 text-primary" /> Score: {selectedDjForQuickView.score}</p>}
                  </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsQuickViewOpen(false)}>Close</Button>
                    <Button asChild>
                        <Link href={`/djs/${selectedDjForQuickView.id}`} onClick={() => setIsQuickViewOpen(false)}>View Full Profile</Link>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
