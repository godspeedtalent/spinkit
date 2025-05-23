// src/components/cards/event-card.tsx
"use client";

import React from "react";
import Link from "next/link";
import type { EventClient } from '@/types';
import { Badge } from "@/components/ui/badge"; // Badge may still be used by EntityTags or other parts, keep for now
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"; // Keep for DJ Name Tooltip
import { CalendarDays, MapPin, Users, Tags, MicVocal, Building2 } from "lucide-react";
import BaseDiscoveryCard, { type BaseCardItemData } from "./base-discovery-card";
import { generateUnsplashUrl } from "@/lib/utils";
import { MetadataItem } from '@/components/shared/metadata-item';
import { EntityTags } from '@/components/shared/entity-tags';

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
    <MetadataItem
      icon={Building2}
      label="Venue"
      value={event.venueName}
      href={`/venues/${event.venueId || 'unknown'}`}
      tooltipContent={<p>Venue: {event.venueName}</p>}
      className="text-sm text-primary" // Matched original styling, Link in MetadataItem handles hover effects
    />
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
        <MetadataItem
          icon={CalendarDays}
          label="Date & Time"
          value={`${new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} at ${event.time}`}
          tooltipContent={<p>Date & Time</p>}
          className="cursor-default" // Icon styling is handled within MetadataItem, but can be overridden if needed
        />
        <MetadataItem
          icon={MapPin}
          label="Location"
          value={event.city}
          href={`/city/${encodeURIComponent((event.city || "unknown").trim())}`}
          tooltipContent={<p>Location: {event.city}</p>}
          className="cursor-pointer hover:text-primary" // Link in MetadataItem handles hover:underline
        />
        {event.expectedAttendance && (
          <MetadataItem
            icon={Users}
            label="Expected Attendance"
            value={`Approx. ${event.expectedAttendance}`}
            tooltipContent={<p>Expected Attendance</p>}
            className="cursor-default"
          />
        )}
        <EntityTags
          tags={event.genres}
          icon={Tags}
          tooltipLabel="Genres"
          tagLinkPrefix="/genres/"
          visibleTagCount={3}
          badgeVariant="secondary"
          className="mt-1" // Preserve original margin
        />
      </div>
    </BaseDiscoveryCard>
  );
};

export default React.memo(EventCardComponent);
