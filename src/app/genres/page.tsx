
"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tags, ChevronRight, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import type { Genre as AppGenreType } from '@/types'; // Import the Genre type

export default function GenresOverviewPage() {
  const [genres, setGenres] = useState<AppGenreType[]>([]); // State now holds Genre objects
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchGenres() {
      setIsLoading(true);
      try {
        const res = await fetch('/api/genres');
        if (!res.ok) throw new Error('Failed to fetch genres');
        const data: AppGenreType[] = await res.json(); // Expect an array of Genre objects
        setGenres(data); // Data from API should already be sorted by name by the repository
      } catch (error) {
        console.error("Failed to fetch genres:", error);
        toast({ title: "Error", description: "Could not load genres.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    }
    fetchGenres();
  }, [toast]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Loading genres...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 md:p-6 lg:p-8">
      <Card className="shadow-lg">
        <CardHeader className="text-center border-b pb-4">
          <Tags className="h-16 w-16 text-primary mx-auto mb-4" />
          <CardTitle className="text-3xl">Explore Music Genres</CardTitle>
          <CardContent className="text-muted-foreground mt-2">
            Discover artists, venues, and fans by your favorite genres.
          </CardContent>
        </CardHeader>
        <CardContent className="pt-6">
          {genres.length > 0 ? (
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {genres.map((genreObj) => ( // genreObj is now a Genre object
                <li key={genreObj.slug || genreObj.name}> {/* Use slug or name for key */}
                  <Button
                    asChild
                    variant="outline"
                    className="w-full justify-between hover:bg-accent hover:text-accent-foreground transition-colors group"
                  >
                    <Link href={`/genres/${encodeURIComponent(genreObj.name)}`}>
                      <span className="truncate">{genreObj.name}</span> {/* Display genre name */}
                      <ChevronRight className="h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-center">No genres available at the moment.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
