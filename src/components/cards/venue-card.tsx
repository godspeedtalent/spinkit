// src/components/cards/venue-card.tsx
"use client";

import React from "react";
import Link from "next/link";
import type { VenueClient } from '@/types';
// Badge import might be removed if EntityTags is the only consumer and it imports Badge itself.
// For now, assume Badge might be used elsewhere or by EntityTags directly.
import { Badge } from "@/components/ui/badge";
// Tooltip imports will be removed if EntityTags is the only consumer of Tooltip for this section.
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Users, ThumbsUp, Tags, MapPin } from "lucide-react";
import BaseDiscoveryCard, { type BaseCardItemData } from "./base-discovery-card";
import { generateUnsplashUrl } from "@/lib/utils";
import { MetadataItem } from '@/components/shared/metadata-item';
import { EntityTags } from '@/components/shared/entity-tags';

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
    <MetadataItem
      icon={MapPin}
      label="Location"
      value={venueLocationString || 'Location not available'}
      href={`/city/${encodeURIComponent(cityNameForLink)}`}
      tooltipContent={<p>Location: {venueLocationString || 'N/A'}</p>}
      className="cursor-pointer hover:text-primary active:opacity-75" // Link in MetadataItem handles hover:underline
    />
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
        <MetadataItem
          icon={Users}
          label="Capacity"
          value={venue.capacity}
          tooltipContent={<p>Capacity: {venue.capacity}</p>}
          className="cursor-default" // Original had no specific text color, default from text-muted-foreground
        />
        <MetadataItem
          icon={ThumbsUp}
          label="Fan Score"
          value={`${venue.fanScore ? venue.fanScore.toFixed(1) : 'N/A'}/5.0`}
          tooltipContent={<p>Fan Score: {venue.fanScore ? venue.fanScore.toFixed(1) : 'N/A'}/5.0</p>}
          className="cursor-default" // Original had no specific text color
        />
        <EntityTags
          tags={venue.djNeeds || []}
          icon={Tags}
          tooltipLabel="Genres Needed"
          tagLinkPrefix="/genres/"
          visibleTagCount={3}
          badgeVariant="outline"
          // EntityTags handles icon margin, badge text size (via default Badge size), and hover effects.
          // The 'hover:bg-accent' for outline badges is a specific behavior for this variant.
          // EntityTags's default linked badge hover is 'hover:bg-secondary/80'.
          // If 'hover:bg-accent' is critical for 'outline' variant, EntityTags might need enhancement
          // or a specific className passed to EntityTags to target its badges.
          // For now, we rely on EntityTags default hover or what its Badge component provides for 'outline'.
        />
      </div>
    </BaseDiscoveryCard>
  );
};

export default React.memo(VenueCardComponent);
