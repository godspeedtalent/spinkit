
"use client";
import React, { useState, useEffect } from "react";
import { useParams } from 'next/navigation'; // Import useParams
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Music, User, Disc, CalendarDays, PlayCircle, Pin, Share2, Star, Tags, Loader2, MessageSquare, PinOff } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import ContentInteractionSection, { type InteractionItem } from "@/components/shared/content-interaction-section";
import type { Recording as RecordingType, DJ } from '@/types';
import Image from "next/image";
import { usePinnedItemsStore } from "@/stores/pinnedItemsStore";
import { RecordingDetailPageSkeleton } from "@/components/skeletons/recording-detail-page-skeleton";

const generatePlaceholderAvatarSeed = (hint: string = "person face") => {
    let Skeywords = hint.trim().toLowerCase();
    Skeywords = Skeywords.replace(/\s\s+/g, ' ').replace(/\s/g, '-');
    Skeywords = Skeywords.replace(/[^a-z0-9-]/g, '');
    Skeywords = Skeywords.replace(/^-,|-$/g, '').replace(/--+/g, '-');
    if (!Skeywords) Skeywords = "person-avatar";
    return `https://source.unsplash.com/featured/40x40/?${Skeywords},face,person`;
};


const mockComments: PageComment[] = [
    {id: "rc1", userName: "TrackLover99", userAvatarSeed: "music lover", text: "This track is fire! 🔥 On repeat all day.", date: "1 day ago"},
    {id: "rc2", userName: "MixMasterMike", userAvatarSeed: "audio engineer", text: "Great production quality. Smooth mix.", date: "5 days ago"},
];

const mockOtherRecordingsByArtist : Pick<RecordingType, 'id' | 'title' | 'artworkUrl' | 'aiHint' | 'type' | 'year'>[] = [
    {id: "rec-other-1", title: "Synth Dreams", artworkUrl: "https://source.unsplash.com/featured/100x100/?synthwave,album", type: "Single", year: 2022, aiHint:"synthwave album"},
    {id: "rec-other-2", title: "Bassline Journey", artworkUrl: "https://source.unsplash.com/featured/100x100/?bass,music,art", type: "EP", year: 2023, aiHint:"bass music art"},
];

type PageComment = {
  id: string;
  userName: string;
  userAvatarSeed: string;
  text: string;
  date: string;
};


export default function RecordingDetailPage({ params: propParams }: { params: { id: string } }) {
  const params = useParams(); // Use the hook
  const recordingId = typeof params.id === 'string' ? params.id : propParams.id; // Fallback

  const [recording, setRecording] = useState<RecordingType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentFanScoreSlider, setCurrentFanScoreSlider] = useState([5]);
  const { togglePin, isItemPinned } = usePinnedItemsStore();

  useEffect(() => {
    if (recordingId) {
      setIsLoading(true);
      fetch(`/api/recordings/${recordingId}`)
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch recording details');
          return res.json();
        })
        .then((data: RecordingType) => {
          const recDataWithComments = {
            ...data,
            comments: data.id.includes("sparkle") || data.id.includes("beatrix") ? mockComments.slice(0,1) : [],
          };
          setRecording(recDataWithComments);
          if (data?.fanScore) {
            setCurrentFanScoreSlider([data.fanScore]);
          }
        })
        .catch(error => console.error("Failed to load recording details:", error))
        .finally(() => setIsLoading(false));
    }
  }, [recordingId]);


  if (isLoading) {
    return <RecordingDetailPageSkeleton />;
  }

  if (!recording) {
    return (
      <div className="text-center p-10">
        <h1 className="text-2xl font-bold">Recording not found.</h1>
      </div>
    );
  }

  const isPinned = isItemPinned(`/recordings/${recording.id}`);

  const handlePinToggle = () => {
    togglePin({ type: 'Recording', name: recording.title, href: `/recordings/${recording.id}`, imageUrl: recording.artworkUrl, aiHint: recording.aiHint });
  };

  const handlePostComment = (text: string) => {
    console.log("New comment on recording (mock):", text);
     if (recording) {
        const newComment: PageComment = {
            id: `comm${Date.now()}`,
            userName: "CurrentUser (Mock)",
            userAvatarSeed: "current user",
            text,
            date: "Just now"
        };
        // @ts-ignore
        setRecording(prevRec => ({ ...prevRec!, comments: [...(prevRec!.comments || []), newComment]}));
    }
  };

  const handleSubmitScore = () => {
    console.log("Score submitted (mock):", currentFanScoreSlider[0]);
    setRecording(prev => prev ? {...prev, fanScore: currentFanScoreSlider[0]} : null);
  };

  // @ts-ignore
  const interactionComments: InteractionItem[] = recording.comments?.map(comment => ({
    id: comment.id,
    userName: comment.userName,
    userAvatar: comment.userAvatarSeed,
    text: comment.text,
    date: comment.date,
  })) || [];

  return (
    <TooltipProvider>
      <div className="relative min-h-screen">
        <div className="absolute inset-0 z-0">
           <Image
            src={recording.artworkUrl}
            alt={`Background for ${recording.title}`}
            fill
            className="object-cover opacity-30"
            data-ai-hint={recording.aiHint || `background-${recording.id}`}
            placeholder="empty"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-8 md:py-16 space-y-12">
          <div className="md:grid md:grid-cols-12 md:gap-8 lg:gap-12 items-start">
            <div className="md:col-span-4 lg:col-span-3 mb-8 md:mb-0">
              <div className="sticky top-20">
                <div className="w-full aspect-square rounded-lg shadow-2xl overflow-hidden relative">
                  <Image
                    src={recording.artworkUrl}
                    alt={recording.title}
                    fill
                    className="object-cover"
                    data-ai-hint={recording.aiHint || recording.id}
                    placeholder="empty"
                  />
                </div>
                {typeof recording.fanScore === 'number' && (
                    <div className="mt-6 p-4 bg-card/70 backdrop-blur-sm rounded-lg text-center">
                        <p className="text-5xl font-bold text-primary">{recording.fanScore.toFixed(1)}</p>
                        <p className="text-sm text-muted-foreground">Fan Score</p>
                        <p className="text-xs text-muted-foreground">From {Math.floor(Math.random() * 30) + 10} ratings</p>
                    </div>
                )}
              </div>
            </div>

            <div className="md:col-span-8 lg:col-span-9">
              <div className="lg:grid lg:grid-cols-3 lg:gap-8">
                <div className="lg:col-span-2">
                  <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-2">{recording.title}</h1>
                  <div className="text-lg text-muted-foreground mb-1">
                    By <Link href={`/djs/${recording.djId}`} className="text-primary hover:underline">{recording.djName || "Unknown Artist"}</Link>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground mb-4">
                    {recording.album && (<span>Album: {recording.album}</span>)}
                    <span><CalendarDays className="inline h-4 w-4 mr-1"/>{recording.year}</span>
                    <span><Disc className="inline h-4 w-4 mr-1"/>{recording.type}</span>
                    <Link href={`/genres/${encodeURIComponent(recording.genre)}`} passHref>
                        <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80"><Tags className="inline h-3 w-3 mr-1"/>{recording.genre}</Badge>
                    </Link>
                  </div>

                  <div className="flex space-x-3 mb-8">
                    <Button size="lg" className="bg-primary hover:bg-primary/90 flex-1 sm:flex-none">
                      <PlayCircle className="mr-2 h-5 w-5" /> Play (Mock)
                    </Button>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="icon" className="h-11 w-11" onClick={handlePinToggle}>
                          {isPinned ? <PinOff className="h-5 w-5" /> : <Pin className="h-5 w-5" />}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent><p>{isPinned ? `Unpin ${recording.title}` : `Pin ${recording.title}`}</p></TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="icon" className="h-11 w-11" onClick={() => alert("Share Recording (Mock)")}><Share2 className="h-5 w-5" /></Button>
                      </TooltipTrigger>
                      <TooltipContent><p>Share {recording.title}</p></TooltipContent>
                    </Tooltip>
                  </div>

                  <div className="prose prose-sm sm:prose dark:prose-invert max-w-none text-muted-foreground mb-8">
                    <h2 className="text-xl font-semibold text-foreground mb-2">About this {recording.type.toLowerCase()}</h2>
                    <p>{recording.description || "No description available."}</p>
                  </div>

                  {typeof recording.totalPlays === 'number' && (
                    <div className="flex items-center text-muted-foreground mb-4">
                        <Music className="h-5 w-5 mr-2 text-primary"/> Total Plays: {recording.totalPlays.toLocaleString()}
                    </div>
                  )}
                </div>

                <div className="lg:col-span-1 space-y-8 mt-8 lg:mt-0">
                    <div>
                      <h2 className="text-xl font-semibold text-foreground mb-3">More by {recording.djName} (Mock)</h2>
                      <div className="space-y-3">
                        {mockOtherRecordingsByArtist.map(rec => (
                          <Link key={rec.id} href={`/recordings/${rec.id}`} className="block group">
                            <div className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50 transition-colors">
                              <div className="w-10 h-10 rounded object-cover aspect-square relative">
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
                      </div>
                    </div>
                     <Button variant="outline" size="sm" asChild className="w-full">
                        <Link href={`/djs/${recording.djId || 'unknown'}`}>
                            View Artist <User className="ml-2 h-4 w-4"/>
                        </Link>
                    </Button>
                </div>
              </div>
            </div>
          </div>

          <Separator className="my-12" />
          <div className="max-w-3xl mx-auto space-y-10">
             <div>
                <h3 className="text-2xl font-semibold mb-4 text-primary flex items-center">
                    <Star className="mr-2 h-6 w-6"/> Rate this Recording
                </h3>
                <div className="p-4 border rounded-lg bg-muted/30">
                    <Label htmlFor="fan-score-slider" className="text-base font-medium">Your Score: {currentFanScoreSlider[0].toFixed(1)}/10</Label>
                    <Slider
                        id="fan-score-slider"
                        min={0} max={10} step={0.1}
                        value={currentFanScoreSlider}
                        onValueChange={setCurrentFanScoreSlider}
                        className="my-3"
                    />
                    <Button size="sm" onClick={handleSubmitScore} disabled={currentFanScoreSlider[0] === (recording.fanScore || 5)}>
                        Submit Score (Mock)
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">Your rating helps others discover great music!</p>
                </div>
            </div>
             <ContentInteractionSection
                title="Comments"
                items={interactionComments}
                onPostInteraction={handlePostComment}
                currentUserAvatarSeed={"current user"}
                textareaPlaceholder="Leave a comment about this recording..."
                postButtonText="Post Comment"
                emptyStateText="No comments yet for this recording. Be the first!"
             />
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
