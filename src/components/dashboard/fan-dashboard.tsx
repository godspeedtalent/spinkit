
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Search, Heart, Disc3, Calendar, MapPin } from "lucide-react";
import Image from "next/image"; // Import next/image

const featuredDjs = [
  { id: "1", name: "DJ Sparkle", genres: "House, Techno", imageUrl: "https://source.unsplash.com/featured/400x300/?dj,party,lights", aiHint: "dj party lights" },
  { id: "2", name: "Groove Master G", genres: "Funk, Soul", imageUrl: "https://source.unsplash.com/featured/400x300/?dj,concert,stage", aiHint: "dj concert stage" },
  { id: "3", name: "Beatrix Kiddo", genres: "Electronic, Trance", imageUrl: "https://source.unsplash.com/featured/400x300/?dj,setup,neon", aiHint: "electronic dj" },
];

const upcomingEvents = [
  { id: "evt1", djName: "DJ Sparkle", venueName: "The Groove Lounge", date: "July 28, 2024", city: "Metro City", imageUrl: "https://source.unsplash.com/featured/600x400/?club,interior,dark", aiHint: "club interior dark" },
  { id: "evt2", djName: "Vinyl Villain", venueName: "Skyline Rooftop", date: "August 3, 2024", city: "Metro City", imageUrl: "https://source.unsplash.com/featured/600x400/?rooftop,party,sunset", aiHint: "rooftop event" },
];

export default function FanDashboard() {
  return (
    <div className="space-y-8">
      <section className="text-center py-10 bg-gradient-to-r from-primary/80 to-accent/70 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold text-primary-foreground mb-3">Discover Your Next Vibe</h1>
        <p className="text-lg text-primary-foreground/90 mb-6">Find amazing DJs, explore venues, and catch upcoming events.</p>
        <Button size="lg" asChild className="bg-background text-foreground hover:bg-background/90">
          <Link href="/djs" className="flex items-center">
            <Search className="mr-2 h-5 w-5" /> Explore Artists
          </Link>
        </Button>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4 flex items-center"><Disc3 className="mr-2 h-6 w-6 text-primary" /> Featured DJs</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredDjs.map(dj => (
            <Card key={dj.id} className="overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
              <div className="relative w-full h-48">
                 <Image 
                    src={dj.imageUrl}
                    alt={dj.name}
                    fill
                    className="object-cover" 
                    data-ai-hint={dj.aiHint || dj.id}
                    placeholder="empty"
                  />
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">{dj.name}</CardTitle>
                <CardDescription>{dj.genres}</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-between items-center">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/djs/${dj.id}`}>View Profile</Link>
                </Button>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                  <Heart className="h-5 w-5" />
                  <span className="sr-only">Favorite</span>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4 flex items-center"><Calendar className="mr-2 h-6 w-6 text-primary"/> Upcoming Events Near You</h2>
        {upcomingEvents.length > 0 ? (
          <div className="space-y-4">
            {upcomingEvents.map(event => (
              <Card key={event.id} className="shadow-sm overflow-hidden">
                <div className="md:flex">
                  <div className="md:w-1/3 relative h-40 md:h-auto">
                     <Image 
                        src={event.imageUrl}
                        alt={`${event.djName} at ${event.venueName}`}
                        fill
                        className="object-cover" 
                        data-ai-hint={event.aiHint || event.id}
                        placeholder="empty"
                      />
                  </div>
                  <div className="md:w-2/3">
                    <CardContent className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 h-full">
                      <div className="flex-grow">
                        <h3 className="font-semibold text-lg text-primary">{event.djName} at {event.venueName}</h3>
                        <p className="text-sm text-muted-foreground flex items-center mt-1">
                          <Calendar className="mr-1.5 h-4 w-4"/> {event.date}
                          <MapPin className="ml-3 mr-1.5 h-4 w-4"/> {event.city}
                        </p>
                      </div>
                      <Button asChild variant="secondary" size="sm" className="mt-2 sm:mt-0 self-end sm:self-center">
                        {/* Link to specific event detail page if available, otherwise venue or event list */}
                        <Link href={`/venues/${event.venueName.toLowerCase().replace(/\s+/g, "-")}`}>Event Details</Link> 
                      </Button>
                    </CardContent>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">No upcoming events listed in your area right now. Check back soon!</p>
            </CardContent>
          </Card>
        )}
      </section>
      
      <section className="text-center">
         <Button variant="link" asChild>
            <Link href="/venues">Explore All Venues <Users className="ml-2 h-4 w-4"/></Link>
         </Button>
      </section>
    </div>
  );
}
