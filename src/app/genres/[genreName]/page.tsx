
"use client";

import Link from "next/link";
import { useParams } from "next/navigation"; // Import useParams
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Building2, UserCircle, Tags, Loader2, Pin, PinOff } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import type { Genre as GenreType } from '@/types';
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { usePinnedItemsStore } from "@/stores/pinnedItemsStore";


export default function GenreDetailPage({ params: propParams }: { params: { genreName: string } }) {
  const params = useParams(); // Use the hook
  const genreNameParamRaw = typeof params.genreName === 'string' ? params.genreName : propParams.genreName;
  const genreNameParam = decodeURIComponent(genreNameParamRaw);

  const { togglePin, isItemPinned } = usePinnedItemsStore();
  const { toast } = useToast();

  const [genreDetails, setGenreDetails] = useState<GenreType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (genreNameParam) {
      setIsLoading(true);
      fetch(`/api/genres/${encodeURIComponent(genreNameParam)}`)
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch genre details');
          return res.json();
        })
        .then((data: GenreType) => {
          setGenreDetails(data);
        })
        .catch(error => {
          console.error("Failed to load genre details:", error);
          toast({ title: "Error", description: `Could not load details for ${genreNameParam}.`, variant: "destructive" });
        })
        .finally(() => setIsLoading(false));
    }
  }, [genreNameParam, toast]);

  const isPinned = genreDetails ? isItemPinned(`/genres/${encodeURIComponent(genreDetails.name)}`) : false;

  const handlePinToggle = () => {
    if (genreDetails) {
      togglePin({ type: 'Genre', name: genreDetails.name, href: `/genres/${encodeURIComponent(genreDetails.name)}`, imageUrl: genreDetails.imageSeed, aiHint: genreDetails.aiHint });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Loading {genreNameParam || "genre"} details...</p>
      </div>
    );
  }

  if (!genreDetails) {
    return <div className="text-center p-10">Genre details not found for {genreNameParam}.</div>;
  }

  return (
    <div className="space-y-8 p-4 md:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <div/>
        <Button variant="outline" size="sm" onClick={handlePinToggle}>
            {isPinned ? <PinOff className="mr-2 h-4 w-4"/> : <Pin className="mr-2 h-4 w-4"/>}
            {isPinned ? "Unpin Genre" : "Pin Genre"}
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader className="text-center border-b pb-4">
           <Tags className="h-16 w-16 text-primary mx-auto mb-4" />
          <CardTitle className="text-4xl font-bold">{genreDetails.name}</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            {genreDetails.description || `Discover artists, venues, and fans who love ${genreDetails.name.toLowerCase()}.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-10">

          <section>
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <Users className="mr-3 h-6 w-6 text-primary" /> Top Artists in {genreDetails.name}
            </h2>
            {genreDetails.topArtists && genreDetails.topArtists.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {genreDetails.topArtists.map(artist => (
                  <Card key={artist.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <Link href={`/djs/${artist.id}`} className="block">
                      <div className="relative w-full aspect-[4/3]">
                         <Image
                            src={artist.imageUrl}
                            alt={artist.name}
                            fill
                            className="object-cover"
                            data-ai-hint={artist.aiHint || artist.id}
                            placeholder="empty"
                          />
                      </div>
                      <CardContent className="p-3">
                        <p className="font-semibold truncate text-sm">{artist.name}</p>
                      </CardContent>
                    </Link>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No featured artists for this genre yet.</p>
            )}
          </section>

          <Separator />

          <section>
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <Building2 className="mr-3 h-6 w-6 text-primary" /> Venues Booking {genreDetails.name}
            </h2>
            {genreDetails.topVenues && genreDetails.topVenues.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {genreDetails.topVenues.map(venue => (
                  <Card key={venue.id} className="overflow-hidden hover:shadow-md transition-shadow">
                     <Link href={`/venues/${venue.id}`} className="block">
                        <div className="relative w-full aspect-video">
                            <Image
                              src={venue.imageUrl}
                              alt={venue.name}
                              fill
                              className="object-cover"
                              data-ai-hint={venue.aiHint || venue.id}
                              placeholder="empty"
                            />
                        </div>
                        <CardContent className="p-3">
                            <p className="font-semibold truncate text-sm">{venue.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{venue.location}</p>
                        </CardContent>
                    </Link>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No venues actively seeking this genre listed currently.</p>
            )}
          </section>

          <Separator />

          <section>
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <UserCircle className="mr-3 h-6 w-6 text-primary" /> Fans of {genreDetails.name} (Mock)
            </h2>
            <p className="text-muted-foreground">Fan display for this genre coming soon!</p>
          </section>

        </CardContent>
      </Card>
    </div>
  );
}
