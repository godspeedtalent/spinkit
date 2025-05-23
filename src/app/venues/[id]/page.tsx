
"use client";
import React, { useState, useEffect } from "react";
import { useParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Users, Star, Pin, PinOff, Ticket, ChevronRight, CalendarDays, Tags, Music } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import ContentInteractionSection, { type InteractionItem } from "@/components/shared/content-interaction-section";
import type { Venue as VenueType, DJ, Event as EventType } from '@/types';
import { usePinnedItemsStore } from "@/stores/pinnedItemsStore";
import { VenueProfilePageSkeleton } from "@/components/skeletons/venue-profile-page-skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { generateUnsplashUrl } from "@/lib/utils"; // Import centralized helper

type PageReview = {
  id: string;
  userName: string;
  userAvatarSeed: string;
  rating: number;
  text: string;
  date: string;
};

// Mock data specific to this page's new design
const mockRecentlyBookedDjs: Array<Pick<DJ, 'id' | 'name' | 'imageUrl' | 'aiHint'>> = [
  { id: "1", name: "DJ Sparkle", imageUrl: generateUnsplashUrl(128, 128, "dj portrait"), aiHint: "dj portrait" },
  { id: "3", name: "Beatrix K.", imageUrl: generateUnsplashUrl(128, 128, "dj cool"), aiHint: "dj cool" },
  { id: "2", name: "Groove Mstr", imageUrl: generateUnsplashUrl(128, 128, "dj fun"), aiHint: "dj fun" },
  { id: "4", name: "Vinyl V.", imageUrl: generateUnsplashUrl(128, 128, "dj dark"), aiHint: "dj dark" },
  { id: "5", name: "DJ Echo", imageUrl: generateUnsplashUrl(128, 128, "dj chill"), aiHint: "dj chill" },
];

const mockUpcomingEvents: Array<Pick<EventType, 'id' | 'name' | 'date' | 'time'>> = [
  { id: "evt-venue1", name: "Techno Takeover", date: "2024-09-15", time: "10 PM" },
  { id: "evt-venue2", name: "House Grooves Night", date: "2024-09-22", time: "9 PM" },
  { id: "evt-venue3", name: "Funk Friday", date: "2024-09-29", time: "8 PM" },
];


export default function VenueProfilePage({ params: propParams }: { params: { id: string } }) {
  const params = useParams();
  const venueId = typeof params.id === 'string' ? params.id : propParams.id;

  const [venue, setVenue] = useState<VenueType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { togglePin, isItemPinned } = usePinnedItemsStore();

  useEffect(() => {
    if (venueId) {
      setIsLoading(true);
      fetch(`/api/venues/${venueId}`)
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch venue details');
          return res.json();
        })
        .then((data: VenueType) => {
           const venueDataWithReviews = {
            ...data,
            reviews: data.reviews || (Math.random() > 0.3 ? [
                {id: "r1", userName: "VenueGoerX", userAvatarSeed: "venue goer", rating: 5, text: "Amazing venue! Sound system is top-notch.", date: "2 weeks ago"},
                {id: "r2", userName: "PartyAnimal", userAvatarSeed: "party animal", rating: 4, text: "Great place for a night out.", date: "1 month ago"},
            ] : []),
           };
          setVenue(venueDataWithReviews);
        })
        .catch(error => console.error("Failed to load venue details:", error))
        .finally(() => setIsLoading(false));
    }
  }, [venueId]);

  if (isLoading) {
    return <VenueProfilePageSkeleton />;
  }

  if (!venue) {
    return <div className="text-center p-10">Venue profile not found.</div>;
  }
  
  const isPinned = isItemPinned(`/venues/${venue.id}`);

  const handlePinToggle = () => {
    togglePin({ type: 'Venue', name: venue.name, href: `/venues/${venue.id}`, imageUrl: venue.imageUrl, aiHint: venue.aiHint });
  };

  const handlePostReview = (text: string, rating?: number) => {
    console.log("New review posted (mock):", text, "Rating:", rating);
    if (venue) {
        const newReview: PageReview = {
            id: `rev${Date.now()}`,
            userName: "CurrentUser (Mock)",
            userAvatarSeed: "current user",
            text,
            rating: rating || 0,
            date: "Just now"
        };
        // @ts-ignore
        setVenue(prevVenue => ({ ...prevVenue!, reviews: [...(prevVenue!.reviews || []), newReview]}));
    }
  };

  const interactionReviews: InteractionItem[] = venue.reviews?.map(review => ({
    id: review.id,
    userName: review.userName,
    userAvatar: review.userAvatarSeed, 
    text: review.text,
    date: review.date,
    rating: review.rating,
  })) || [];

  return (
    <TooltipProvider>
      <div className="relative min-h-screen bg-background text-foreground pb-12">
        {/* Bleeding Top Hero Image */}
        <div className="relative w-full h-72 md:h-96 group">
          <Image
            src={venue.imageUrl}
            alt={`Hero image for ${venue.name}`}
            fill
            className="object-cover"
            priority
            data-ai-hint={venue.aiHint}
            placeholder="empty"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/20"></div>
          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 text-white z-10">
             <div className="container max-w-5xl mx-auto">
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight drop-shadow-lg">{venue.name}</h1>
                <p className="text-lg md:text-xl text-white/90 drop-shadow-md flex items-center space-x-2 mt-1">
                  <MapPin className="h-5 w-5" />
                  <Link href={`/city/${encodeURIComponent((venue.location || "unknown").split(',')[0].trim())}`} className="hover:underline">
                    {venue.location || "Location N/A"}
                  </Link>
                </p>
             </div>
          </div>
        </div>

        <div className="container max-w-5xl mx-auto px-4 space-y-10 mt-8">
          {/* Action Buttons & Key Stats - Placed below hero image */}
          <section className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-4 border-b">
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="flex items-center"><Users className="h-5 w-5 mr-1.5 text-primary" /> {venue.capacity} Capacity</span>
                </TooltipTrigger>
                <TooltipContent><p>Max Guest Capacity</p></TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="flex items-center"><Star className="h-5 w-5 mr-1.5 text-primary" /> {venue.fanScore.toFixed(1)} Fan Score</span>
                </TooltipTrigger>
                <TooltipContent><p>Average Fan Score</p></TooltipContent>
              </Tooltip>
            </div>
            <div className="flex space-x-3">
              <Button size="lg" variant="default" className="shadow-md">
                <Ticket className="mr-2 h-5 w-5" /> Check Availability (Mock)
              </Button>
              <Button size="lg" variant="outline" className="shadow-sm">
                Contact (Mock)
              </Button>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" className="h-11 w-11 rounded-full" onClick={handlePinToggle}>
                     {isPinned ? <PinOff className="h-5 w-5" /> : <Pin className="h-5 w-5" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>{isPinned ? `Unpin ${venue.name}` : `Pin ${venue.name}`}</p></TooltipContent>
              </Tooltip>
            </div>
          </section>
          
          {venue.description && (
            <section>
              <h2 className="text-2xl font-semibold mb-3">About {venue.name}</h2>
              <Card className="bg-card shadow-sm">
                <CardContent className="p-5">
                  <p className="text-muted-foreground leading-relaxed prose prose-sm dark:prose-invert max-w-none">{venue.description}</p>
                </CardContent>
              </Card>
            </section>
          )}

          <section>
            <h2 className="text-2xl font-semibold mb-4">DJs Recently Featured</h2>
            <ScrollArea className="w-full whitespace-nowrap rounded-md">
              <div className="flex space-x-4 pb-4">
                {mockRecentlyBookedDjs.map(dj => (
                  <Link href={`/djs/${dj.id}`} key={dj.id} className="group">
                    <Card className="w-32 shrink-0 hover:shadow-lg transition-shadow bg-card overflow-hidden">
                      <div className="relative h-32 w-full">
                        <Image 
                          src={dj.imageUrl} 
                          alt={dj.name} 
                          fill 
                          className="object-cover group-hover:scale-105 transition-transform"
                          data-ai-hint={dj.aiHint || "dj person"}
                          placeholder="empty"
                        />
                      </div>
                      <p className="text-xs font-medium text-center p-2 truncate group-hover:text-primary">{dj.name}</p>
                    </Card>
                  </Link>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Upcoming Events (Mock)</h2>
            <div className="space-y-3">
              {mockUpcomingEvents.map(event => (
                <Card key={event.id} className="p-3 bg-card shadow-sm hover:bg-muted/50 transition-colors">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-sm">{event.name}</h3>
                      <p className="text-xs text-muted-foreground">{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, {event.time}</p>
                    </div>
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/events#${event.id}`}>
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </Card>
              ))}
               {mockUpcomingEvents.length === 0 && <p className="text-muted-foreground text-sm">No upcoming events listed for this venue currently.</p>}
            </div>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold mb-4">Venue Info</h2>
            <Card className="bg-card shadow-sm">
              <CardContent className="p-5 space-y-3">
                {venue.typicalEventDays && venue.typicalEventDays.length > 0 && (
                  <div className="text-sm">
                    <strong className="text-foreground flex items-center"><CalendarDays className="mr-2 h-4 w-4 text-primary"/>Typical Event Days:</strong> 
                    <span className="text-muted-foreground ml-1">{venue.typicalEventDays.join(', ')}</span>
                  </div>
                )}
                {venue.soundSystem && venue.soundSystem.length > 0 && (
                    <div className="text-sm">
                        <strong className="text-foreground flex items-center"><Music className="mr-2 h-4 w-4 text-primary"/>Sound System:</strong> 
                        <span className="text-muted-foreground ml-1">{venue.soundSystem.join(', ')}</span>
                    </div>
                )}
                {venue.djNeeds && venue.djNeeds.length > 0 && (
                  <div>
                    <strong className="text-sm text-foreground flex items-center"><Tags className="mr-2 h-4 w-4 text-primary"/>Genres We Book:</strong>
                    <div className="flex flex-wrap gap-2 mt-1.5">
                      {venue.djNeeds.map(genre => (
                        <Link key={genre} href={`/genres/${encodeURIComponent(genre)}`} passHref>
                          <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">{genre}</Badge>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          <section className="max-w-3xl mx-auto"> 
             <ContentInteractionSection
                title="Fan Reviews"
                items={interactionReviews}
                onPostInteraction={handlePostReview}
                currentUserAvatarSeed="current user"
                textareaPlaceholder="Share your experience at this venue..."
                postButtonText="Submit Review"
                emptyStateText="No reviews yet. Be the first to share your experience!"
                enableRating={true}
            />
          </section>
        </div>
      </div>
    </TooltipProvider>
  );
}
