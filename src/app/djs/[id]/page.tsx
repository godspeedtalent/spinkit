
"use client";
import React, { useState, useEffect } from "react";
import { useParams } from 'next/navigation'; // Import useParams
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Music, User, Disc, CalendarDays, PlayCircle, Pin, Share2, Loader2, MapPin, ThumbsUp, Users, BarChart3, MicVocal, ExternalLink, Eye, PinOff } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import ContentInteractionSection, { type InteractionItem } from "@/components/shared/content-interaction-section";
import type { DJ as DJType, Recording } from '@/types';
import { DjProfilePageSkeleton } from "@/components/skeletons/dj-profile-page-skeleton";
import Image from "next/image";
import { usePinnedItemsStore } from "@/stores/pinnedItemsStore";

const generatePlaceholderAvatarSeed = (hint: string = "person face") => {
    let Skeywords = hint.trim().toLowerCase();
    Skeywords = Skeywords.replace(/\s\s+/g, ' ').replace(/\s/g, '-');
    Skeywords = Skeywords.replace(/[^a-z0-9-]/g, '');
    Skeywords = Skeywords.replace(/^-,|-$/g, '').replace(/--+/g, '-');
    if (!Skeywords) Skeywords = "person-avatar";
    return `https://source.unsplash.com/featured/40x40/?${Skeywords},face,person`;
};


type PageComment = {
  id: string;
  userName: string;
  userAvatarSeed: string;
  text: string;
  date: string;
};

const mockComments: PageComment[] = [
    {id: "c1", userName: "MusicFan123", userAvatarSeed: "music fan", text: "Awesome DJ! Saw them live last week, incredible energy.", date: "3 days ago"},
    {id: "c2", userName: "GrooveSeeker", userAvatarSeed: "dj listener", text: "Their mixes are legendary. Highly recommend!", date: "1 week ago"},
];


export default function DjProfilePage({ params: propParams }: { params: { id: string } }) {
  const params = useParams(); // Use the hook
  const djId = typeof params.id === 'string' ? params.id : propParams.id; // Fallback if needed

  const [dj, setDj] = useState<DJType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { togglePin, isItemPinned } = usePinnedItemsStore();

  useEffect(() => {
    if (djId) {
      setIsLoading(true);
      fetch(`/api/djs/${djId}`)
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch DJ details');
          return res.json();
        })
        .then((data: DJType) => {
          const djDataWithComments = {
            ...data,
            comments: data.recordings && data.recordings.length > 0 && Math.random() > 0.3 ? mockComments.slice(0, Math.floor(Math.random() * mockComments.length) +1) : [],
          };
          setDj(djDataWithComments);
        })
        .catch(error => {
          console.error("Failed to load DJ details:", error);
        })
        .finally(() => setIsLoading(false));
    }
  }, [djId]);

  if (isLoading) {
    return <DjProfilePageSkeleton />;
  }

  if (!dj) {
    return <div className="text-center p-10">DJ profile not found.</div>;
  }

  const isPinned = isItemPinned(`/djs/${dj.id}`);

  const handlePinToggle = () => {
    togglePin({ type: 'DJ', name: dj.name, href: `/djs/${dj.id}`, imageUrl: dj.imageUrl, aiHint: dj.aiHint });
  };

  const handlePostComment = (text: string) => {
    console.log("New comment posted (mock):", text);
    if (dj) {
      const newComment: PageComment = {
        id: `c${Date.now()}`,
        userName: "CurrentUser (Mock)",
        userAvatarSeed: "current user",
        text,
        date: "Just now"
      };
      // @ts-ignore
      setDj(prevDj => ({ ...prevDj!, comments: [...(prevDj!.comments || []), newComment] }));
    }
  };

  // @ts-ignore
  const interactionComments: InteractionItem[] = dj.comments?.map(comment => ({
    id: comment.id,
    userName: comment.userName,
    userAvatar: comment.userAvatarSeed,
    text: comment.text,
    date: comment.date,
  })) || [];

  const mockGigs = [
    { id: "gig1", eventName: "Summer Fest Opening Set", venueName: "Main Stage", date: "Aug 15, 2024" },
    { id: "gig2", eventName: "Club Night", venueName: "The Underground", date: "Aug 22, 2024" },
  ];

  return (
    <TooltipProvider>
      <div className="relative min-h-screen">
        <div className="absolute inset-0 z-0">
          <Image
            src={dj.imageUrl}
            alt={`Background for ${dj.name}`}
            fill
            className="object-cover opacity-30"
            data-ai-hint={dj.aiHint || `background-${dj.id}`}
            placeholder="empty"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-8 md:py-16 space-y-12">
          <div className="md:grid md:grid-cols-12 md:gap-8 lg:gap-12 items-start">
            <div className="md:col-span-4 lg:col-span-3 mb-8 md:mb-0">
              <div className="sticky top-20">
                <div className="w-full aspect-[3/4] rounded-lg shadow-2xl overflow-hidden relative">
                  <Image
                    src={dj.imageUrl}
                    alt={dj.name}
                    fill
                    className="object-cover"
                    data-ai-hint={dj.aiHint || dj.id}
                    placeholder="empty"
                  />
                </div>
                {dj.score > 59 && (
                  <div className="mt-6 p-4 bg-card/70 backdrop-blur-sm rounded-lg text-center">
                    <p className="text-5xl font-bold text-primary">{dj.score}</p>
                    <p className="text-sm text-muted-foreground">Score</p>
                    <p className="text-xs text-muted-foreground">Based on {Math.floor(Math.random() * 100) + 50} reviews</p>
                  </div>
                )}
              </div>
            </div>

            <div className="md:col-span-8 lg:col-span-9">
              <div className="lg:grid lg:grid-cols-3 lg:gap-8">
                <div className="lg:col-span-2">
                  <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-2">{dj.name}</h1>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
                    <MapPin className="h-4 w-4" />
                    <span>{dj.location}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {dj.genres.map(genre => (
                      <Link key={genre} href={`/genres/${encodeURIComponent(genre)}`} passHref>
                        <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">{genre}</Badge>
                      </Link>
                    ))}
                  </div>

                  <div className="flex space-x-3 mb-8">
                    <Button size="lg" className="bg-primary hover:bg-primary/90 flex-1 sm:flex-none">
                      <MicVocal className="mr-2 h-5 w-5" /> Book DJ (Mock)
                    </Button>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="icon" className="h-11 w-11" onClick={handlePinToggle}>
                          {isPinned ? <PinOff className="h-5 w-5" /> : <Pin className="h-5 w-5" />}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent><p>{isPinned ? `Unpin ${dj.name}` : `Pin ${dj.name}`}</p></TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="icon" className="h-11 w-11" onClick={() => alert("Share DJ (Mock)")}><Share2 className="h-5 w-5" /></Button>
                      </TooltipTrigger>
                      <TooltipContent><p>Share {dj.name}</p></TooltipContent>
                    </Tooltip>
                  </div>

                  <div className="prose prose-sm sm:prose dark:prose-invert max-w-none text-muted-foreground mb-8">
                    <h2 className="text-xl font-semibold text-foreground mb-2">About Me</h2>
                    <p>{dj.bio || "No biography provided."}</p>
                  </div>

                  {dj.specialties && dj.specialties.length > 0 && (
                    <div className="mb-8">
                      <h2 className="text-xl font-semibold text-foreground mb-3">Specialties</h2>
                      <ul className="list-disc list-inside text-muted-foreground space-y-1">
                        {dj.specialties.map(spec => <li key={spec}>{spec}</li>)}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="lg:col-span-1 space-y-8">
                  {dj.recordings && dj.recordings.length > 0 && (
                    <div>
                      <h2 className="text-xl font-semibold text-foreground mb-3">Featured Recordings</h2>
                      <div className="space-y-3">
                        {dj.recordings.slice(0,3).map(rec => (
                          <Link key={rec.id} href={`/recordings/${rec.id}`} className="block group">
                            <div className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50 transition-colors">
                              <div className="w-12 h-12 rounded object-cover aspect-square relative">
                                <Image
                                  src={rec.artworkUrl}
                                  alt={`Artwork for ${rec.title}`}
                                  fill
                                  className="rounded object-cover"
                                  data-ai-hint={rec.aiHint || rec.id}
                                  placeholder="empty"
                                />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-foreground group-hover:text-primary truncate">{rec.title}</p>
                                <p className="text-xs text-muted-foreground">{rec.type} &bull; {rec.year}</p>
                              </div>
                            </div>
                          </Link>
                        ))}
                        {dj.recordings.length > 3 && (
                           <Button variant="link" size="sm" asChild className="text-xs px-0">
                             <Link href={`/djs/${dj.id}#discography`}>Show all recordings &rarr;</Link>
                           </Button>
                        )}
                      </div>
                    </div>
                  )}
                  <div>
                      <h2 className="text-xl font-semibold text-foreground mb-3">Upcoming Gigs (Mock)</h2>
                       <div className="space-y-3">
                        {mockGigs.slice(0,2).map(gig => (
                          <div key={gig.id} className="p-2 rounded-md bg-muted/30">
                            <p className="text-sm font-medium text-foreground">{gig.eventName}</p>
                            <p className="text-xs text-muted-foreground">{gig.venueName} &bull; {gig.date}</p>
                          </div>
                        ))}
                         <Button variant="link" size="sm" asChild className="text-xs px-0">
                           <Link href="#">Show all gigs &rarr;</Link>
                         </Button>
                      </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator className="my-12" />
          <div className="max-w-3xl mx-auto">
             <ContentInteractionSection
                title="Fan Comments"
                items={interactionComments}
                onPostInteraction={handlePostComment}
                currentUserAvatarSeed={"current user"}
                textareaPlaceholder="Leave a comment for the DJ..."
                postButtonText="Post Comment"
                emptyStateText="No comments yet. Be the first to share your thoughts!"
             />
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
