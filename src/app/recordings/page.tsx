// src/app/recordings/page.tsx
"use client";
import React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Music, Loader2, X, Tags } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CardSkeleton } from "@/components/shared/card-skeleton";
import RecordingCard from "@/components/cards/recording-card";
import type { RecordingClient, RecordingSortOption, CardSize, UIRecordingFilters as StoreRecordingFilters } from '@/types'; // Changed import
import { useDiscoveryPageLogic } from '@/hooks/useDiscoveryPageLogic';
import { useDiscoveryFilterStore } from '@/stores/discoveryFiltersStore';
import { allGenresList } from "@/data/mock-data/djs";
import { useToast } from "@/hooks/use-toast"; // For mock pop-out

const PAGE_LIMIT = 8;

const initialRecordingFilters: StoreRecordingFilters = {
  genres: [], // Changed from selectedGenres for consistency with type
  showFavorites: false,
};

export default function RecordingsDiscoveryPage() {
  const { toast } = useToast(); // For mock pop-out

  const {
    displayedItems: displayedRecordings,
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
  } = useDiscoveryPageLogic<RecordingClient, StoreRecordingFilters, RecordingSortOption>({
    apiPath: "/api/recordings",
    entityType: 'recording',
    initialFilterValues: initialRecordingFilters,
    PAGE_LIMIT,
  });
  
  // Mock pop-out handler for this page
  const handlePopOut = (recording: RecordingClient) => {
    toast({
      title: "Quick View (Mock)",
      description: `Dialog for ${recording.title} would open here.`,
    });
  };

  const getGridColsClass = () => {
    switch (currentCardSize) {
      case "small": return "sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5";
      case "medium": return "sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4";
      case "large": return "sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3";
      default: return "sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4";
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 md:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-semibold">Discover Recordings</h1>
         <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
              <Select 
                value={currentFilters.genres.length > 0 ? currentFilters.genres[0] : ""} 
                onValueChange={(value) => {
                  setStoreFilters({ genres: value ? [value] : [] });
                }}>
                <SelectTrigger className="w-auto h-8 text-xs">
                  <SelectValue placeholder="Filter by Genre" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Genres</SelectItem>
                  {allGenresList.map(genre => (
                    <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={applyFiltersAndSort} size="sm" variant="outline" className="h-8 text-xs">Apply</Button>

             <div className="flex items-center space-x-1">
                <Label htmlFor="card-size-recording" className="text-xs text-muted-foreground whitespace-nowrap">View:</Label>
                <Select value={currentCardSize} onValueChange={(value) => setStoreCardSize(value as CardSize)}>
                    <SelectTrigger id="card-size-recording" className="w-auto h-8 text-xs">
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
                <Label htmlFor="sort-order-recording" className="text-xs text-muted-foreground whitespace-nowrap">Order by:</Label>
                <Select value={currentSortOrder} onValueChange={(value) => setStoreSortOrder(value as RecordingSortOption)}>
                    <SelectTrigger id="sort-order-recording" className="w-auto h-8 text-xs">
                        <SelectValue placeholder="Sort by..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="recent">Recently Added</SelectItem>
                        <SelectItem value="score_desc">Fan Score: High to Low</SelectItem>
                        <SelectItem value="score_asc">Fan Score: Low to High</SelectItem>
                        <SelectItem value="title_asc">Title: A-Z</SelectItem>
                        <SelectItem value="title_desc">Title: Z-A</SelectItem>
                        <SelectItem value="artist_asc">Artist: A-Z</SelectItem>
                        <SelectItem value="artist_desc">Artist: Z-A</SelectItem>
                        <SelectItem value="year_new">Year: Newest First</SelectItem>
                        <SelectItem value="year_old">Year: Oldest First</SelectItem>
                    </SelectContent>
                </Select>
            </div>
             <div className="flex items-center space-x-2">
                <Checkbox 
                  id="favorites-filter-recording" 
                  checked={currentFilters.showFavorites} 
                  onCheckedChange={(checked) => setStoreFilters({ showFavorites: Boolean(checked)})} 
                />
                <Label htmlFor="favorites-filter-recording" className="text-xs font-normal">Favorites</Label>
            </div>
        </div>
      </div>
      {(isLoading && displayedRecordings.length === 0) ? (
        <div className={`grid grid-cols-1 ${getGridColsClass()} gap-6`}>
          {Array.from({ length: PAGE_LIMIT }).map((_, index) => (
            <CardSkeleton key={index} />
          ))}
        </div>
      ) : displayedRecordings.length > 0 ? (
        <>
        <div className={`grid grid-cols-1 ${getGridColsClass()} gap-6 animate-slide-up-fade-in`}>
          {displayedRecordings.map((rec, index) => (
            <RecordingCard
                key={rec.id}
                recording={rec}
                onFavoriteToggle={() => handleFavoriteToggle(rec.id)}
                onPopOut={handlePopOut}
                isPriorityImage={index < PAGE_LIMIT / 2}
            />
          ))}
        </div>
        <div ref={loadMoreRef} className="h-16 flex items-center justify-center">
            {isLoadingMore && <Loader2 className="h-6 w-6 animate-spin text-primary" />}
            {!hasMoreData && displayedRecordings.length > 0 && <p className="text-sm text-muted-foreground">You've reached the end of the list.</p>}
        </div>
        </>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <Music className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-xl text-muted-foreground">No recordings match your current filters.</p>
            <p className="text-sm text-muted-foreground mt-1">Try adjusting your criteria or <Button variant="link" className="p-0 h-auto" onClick={resetFiltersAndFetch}>reset all filters</Button>.</p>
             <Button asChild variant="link" className="mt-2">
                 <Link href="/genres">Explore all genres</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
