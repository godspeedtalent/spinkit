
"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation'; // Import useParams
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Loader2, Users, Building2, ListMusic, MapPin as MapPinIcon, Pin, PinOff } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { CityDetails, DJ, Venue } from '@/types';
import { useToast } from '@/hooks/use-toast';
import Image from "next/image";
import { usePinnedItemsStore } from '@/stores/pinnedItemsStore';
import { CityViewPageSkeleton } from '@/components/skeletons/city-view-page-skeleton';


export default function CityViewPage({ params: propParams }: { params: { cityName: string } }) {
  const params = useParams(); // Use the hook
  const cityNameRaw = typeof params.cityName === 'string' ? params.cityName : propParams.cityName;
  const cityName = decodeURIComponent(cityNameRaw);

  const { togglePin, isItemPinned } = usePinnedItemsStore();
  const { toast } = useToast();

  const [cityData, setCityData] = useState<CityDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cityName) {
      setIsLoading(true);
      setError(null);
      fetch(`/api/cities/${encodeURIComponent(cityName)}`)
        .then(res => {
          if (!res.ok) throw new Error(`Failed to fetch city details for ${cityName}`);
          return res.json();
        })
        .then((data: CityDetails) => {
          setCityData(data);
        })
        .catch(err => {
          console.error("Failed to load city data:", err);
          setError(`Could not load data for ${cityName}.`);
          toast({ title: "Error", description: `Could not load data for ${cityName}.`, variant: "destructive" });
        })
        .finally(() => setIsLoading(false));
    } else {
        setIsLoading(false);
        setError("City name not provided.");
    }
  }, [cityName, toast]);

  if (isLoading) {
    return <CityViewPageSkeleton />;
  }

  if (error || !cityData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] p-4 md:p-6 lg:p-8 text-center">
        <MapPinIcon className="h-16 w-16 text-destructive mb-4" />
        <h2 className="text-2xl font-semibold text-destructive mb-2">Oops! Something went wrong.</h2>
        <p className="text-muted-foreground">{error || "Could not load city information."}</p>
        <Button asChild variant="link" className="mt-4">
          <Link href="/djs">Explore Artists</Link>
        </Button>
      </div>
    );
  }

  const isPinned = isItemPinned(`/city/${encodeURIComponent(cityData.name)}`);

  const handlePinToggle = () => {
     togglePin({ type: 'City', name: cityData.name, href: `/city/${encodeURIComponent(cityData.name)}`, imageUrl: cityData.profilePicSeed, aiHint: cityData.aiHint });
  };


  return (
    <TooltipProvider>
    <div className="space-y-8 p-4 md:p-6 lg:p-8">
      <Card className="shadow-lg">
        <CardHeader className="text-center border-b pb-6 relative">
          <div className="absolute top-4 right-4">
             <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 text-primary hover:bg-primary/10" onClick={handlePinToggle}>
                    {isPinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>{isPinned ? `Unpin City: ${cityData.name}` : `Pin City: ${cityData.name}`}</p></TooltipContent>
              </Tooltip>
          </div>
          <MapPinIcon className="h-20 w-20 text-primary mx-auto mb-4" />
          <CardTitle className="text-4xl font-bold">{cityData.name}</CardTitle>
          <CardDescription className="text-md text-muted-foreground mt-2 max-w-2xl mx-auto">{cityData.description}</CardDescription>
        </CardHeader>

        <CardContent className="pt-8 space-y-12">
          <section>
            <h2 className="text-3xl font-semibold mb-6 flex items-center text-primary">
              <Users className="mr-3 h-8 w-8" /> Top DJs in {cityData.name}
            </h2>
            {cityData.topDjs.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {cityData.topDjs.map(dj => (
                  <Card key={dj.id} className="overflow-hidden shadow-md hover:shadow-lg transition-shadow flex flex-col">
                    <Link href={`/djs/${dj.id}`} className="block">
                      <div className="relative w-full aspect-square">
                        <Image
                          src={dj.imageUrl}
                          alt={dj.name}
                          fill
                          className="object-cover"
                          data-ai-hint={dj.aiHint || dj.id}
                          placeholder="empty"
                        />
                      </div>
                      <CardHeader className="p-3 flex-grow">
                        <CardTitle className="text-lg">{dj.name}</CardTitle>
                        <CardDescription className="text-xs">{dj.genres.slice(0,2).join(', ')}</CardDescription>
                      </CardHeader>
                    </Link>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No featured DJs found for this city yet. Stay tuned!</p>
            )}
          </section>

          <Separator />

          <section>
            <h2 className="text-3xl font-semibold mb-6 flex items-center text-primary">
              <Building2 className="mr-3 h-8 w-8" /> Top Venues in {cityData.name}
            </h2>
            {cityData.topVenues.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {cityData.topVenues.map(venue => (
                  <Card key={venue.id} className="overflow-hidden shadow-md hover:shadow-lg transition-shadow flex flex-col">
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
                        <CardHeader className="p-3 flex-grow">
                            <CardTitle className="text-lg">{venue.name}</CardTitle>
                            <CardDescription className="text-xs">{venue.location.split(',')[0]}</CardDescription>
                        </CardHeader>
                    </Link>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Discovering the hottest venues in {cityData.name}. Check back soon!</p>
            )}
          </section>

          <Separator />

          <section>
            <h2 className="text-3xl font-semibold mb-6 flex items-center text-primary">
              <ListMusic className="mr-3 h-8 w-8" /> Popular Genres in {cityData.name}
            </h2>
            {cityData.popularGenres.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {cityData.popularGenres.map(genre => (
                   <Link key={genre} href={`/genres/${encodeURIComponent(genre)}`} passHref>
                    <Badge variant="secondary" className="text-md px-4 py-2 hover:bg-secondary/80 cursor-pointer">{genre}</Badge>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Exploring the signature sounds of {cityData.name}...</p>
            )}
          </section>
        </CardContent>
      </Card>
    </div>
    </TooltipProvider>
  );
}
