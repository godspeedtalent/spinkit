// src/components/cards/venue-card.tsx
"use client";

import React from "react";
import Link from "next/link";
import type { VenueClient } from '@/types';
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Users, ThumbsUp, Tags, MapPin } from "lucide-react";
import BaseDiscoveryCard, { type BaseCardItemData } from "./base-discovery-card"; // Corrected import
import { generateUnsplashUrl } from "@/lib/utils"; // Import the helper for consistency

interface VenueCardProps {
  venue: VenueClient;
  onFavoriteToggle: (venueId: string) => void;
  onPopOut: (itemData: VenueClient) => void;
  isPriorityImage: boolean;
}

const VenueCardComponent: React.FC<VenueCardProps> = ({ venue, onFavoriteToggle, onPopOut, isPriorityImage }) => {
  const baseItemData: BaseCardItemData = {
    id: venue.id,
    name: venue.name,
    href: `/venues/${venue.id}`,
    imageUrl: (venue.imageUrl && venue.imageUrl.startsWith('http')) ? venue.imageUrl : generateUnsplashUrl(600, 400, venue.aiHint || venue.name, "venue building"),
    aiHint: venue.aiHint,
    isFavorited: venue.isFavorited,
  };

  const venueLocationString = venue.location || "";
  const cityNameForLink = venueLocationString ? venueLocationString.split(',')[0].trim() : 'unknown-city';

  const primaryMeta = (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link 
            href={`/city/${encodeURIComponent(cityNameForLink)}`} 
            className="flex items-center cursor-pointer hover:text-primary hover:underline active:opacity-75"
        >
          <MapPin className="mr-1.5 h-3.5 w-3.5" />
          <span>{venueLocationString || 'Location not available'}</span>
        </Link>
      </TooltipTrigger>
      <TooltipContent><p>Location: {venueLocationString || 'N/A'}</p></TooltipContent>
    </Tooltip>
  );

  return (
    <BaseDiscoveryCard
      itemData={baseItemData}
      itemType="Venue"
      viewProfileHref={`/venues/${venue.id}`}
      onFavoriteToggle={onFavoriteToggle}
      onPopOut={() => onPopOut(venue)}
      isPriorityImage={isPriorityImage}
      primaryMetaLine={primaryMeta}
    >
      <div className="text-sm text-muted-foreground space-y-1.5 py-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center cursor-default">
              <Users className="mr-1.5 h-3.5 w-3.5" />
              <span>{venue.capacity}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent><p>Capacity</p></TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center cursor-default">
              <ThumbsUp className="mr-1.5 h-3.5 w-3.5" />
              <span>{venue.fanScore ? venue.fanScore.toFixed(1) : 'N/A'}/5.0</span>
            </div>
          </TooltipTrigger>
          <TooltipContent><p>Fan Score</p></TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center flex-wrap gap-1 cursor-default">
              <Tags className="mr-1 h-3.5 w-3.5 text-muted-foreground" />
              {(venue.djNeeds || []).slice(0, 3).map(genre => (
                <Link key={genre} href={`/genres/${encodeURIComponent(genre)}`} passHref legacyBehavior>
                  <Badge variant="outline" className="text-xs hover:bg-accent cursor-pointer">{genre}</Badge>
                </Link>
              ))}
              {(venue.djNeeds || []).length > 3 && <Badge variant="outline" className="text-xs">...</Badge>}
            </div>
          </TooltipTrigger>
          <TooltipContent><p>Genres Needed</p></TooltipContent>
        </Tooltip>
      </div>
    </BaseDiscoveryCard>
  );
};

export default React.memo(VenueCardComponent);
