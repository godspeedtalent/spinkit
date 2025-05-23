// src/components/cards/event-card.tsx
"use client";

import React from "react";
import Link from "next/link";
import type { EventClient } from '@/types';
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CalendarDays, MapPin, Users, Tags, MicVocal, Building2 } from "lucide-react";
import BaseDiscoveryCard, { type BaseCardItemData } from "./base-discovery-card";
import { generateUnsplashUrl } from "@/lib/utils";

interface EventCardProps {
  event: EventClient;
  onFavoriteToggle: (eventId: string) => void;
  onPopOut: (itemData: EventClient) => void;
  isPriorityImage: boolean;
}

const EventCardComponent: React.FC<EventCardProps> = ({ event, onFavoriteToggle, onPopOut, isPriorityImage }) => {
  const baseItemData: BaseCardItemData = {
    id: event.id,
    name: event.name,
    href: `/events#${event.id}`, // Or link to a specific event detail page if one exists
    imageUrl: (event.imageUrl && event.imageUrl.startsWith('http')) ? event.imageUrl : generateUnsplashUrl(600, 400, event.aiHint || event.name, "event concert music"),
    aiHint: event.aiHint,
    isFavorited: event.isFavorited,
  };

  const primaryMeta = (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="text-sm text-muted-foreground cursor-default">
          <Link href={`/venues/${event.venueId || 'unknown'}`} className="flex items-center text-primary hover:underline active:opacity-75">
            <Building2 className="mr-1.5 h-3.5 w-3.5" /> {event.venueName}
          </Link>
        </div>
      </TooltipTrigger>
      <TooltipContent><p>Venue</p></TooltipContent>
    </Tooltip>
  );

  const secondaryMeta = event.djName && event.djId ? (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center text-xs text-muted-foreground cursor-default">
          <MicVocal className="mr-1.5 h-3 w-3" />
          <Link href={`/djs/${event.djId}`} className="hover:underline active:opacity-75">{event.djName}</Link>
        </div>
      </TooltipTrigger>
      <TooltipContent><p>Performing Artist</p></TooltipContent>
    </Tooltip>
  ) : null;

  return (
    <BaseDiscoveryCard
      itemData={baseItemData}
      itemType="Event"
      viewProfileHref={`/events#${event.id}`} // Or a specific event detail page
      onFavoriteToggle={onFavoriteToggle}
      onPopOut={() => onPopOut(event)}
      isPriorityImage={isPriorityImage}
      primaryMetaLine={primaryMeta}
      secondaryMetaLine={secondaryMeta}
    >
      <div className="text-sm text-muted-foreground space-y-1.5 py-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center cursor-default">
              <CalendarDays className="mr-2 h-4 w-4 text-primary" />
              <span>{new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} at {event.time}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent><p>Date & Time</p></TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href={`/city/${encodeURIComponent((event.city || "unknown").trim())}`} className="flex items-center cursor-pointer hover:text-primary hover:underline active:opacity-75">
              <MapPin className="mr-2 h-4 w-4 text-primary" />
              <span>{event.city}</span>
            </Link>
          </TooltipTrigger>
          <TooltipContent><p>Location: {event.city}</p></TooltipContent>
        </Tooltip>
        {event.expectedAttendance && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center cursor-default">
                <Users className="mr-2 h-4 w-4 text-primary" />
                <span>Approx. {event.expectedAttendance}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent><p>Expected Attendance</p></TooltipContent>
          </Tooltip>
        )}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center flex-wrap gap-1 mt-1 cursor-default">
              <Tags className="mr-1 h-3.5 w-3.5 text-muted-foreground" />
              {event.genres.slice(0, 3).map((genre) => (
                <Link key={genre} href={`/genres/${encodeURIComponent(genre)}`} passHref legacyBehavior>
                  <Badge variant="secondary" className="text-xs hover:bg-secondary/80 cursor-pointer">{genre}</Badge>
                </Link>
              ))}
              {event.genres.length > 3 && <Badge variant="secondary" className="text-xs">...</Badge>}
            </div>
          </TooltipTrigger>
          <TooltipContent><p>Genres</p></TooltipContent>
        </Tooltip>
      </div>
    </BaseDiscoveryCard>
  );
};

export default React.memo(EventCardComponent);
