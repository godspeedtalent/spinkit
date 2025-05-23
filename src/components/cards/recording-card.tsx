// src/components/cards/recording-card.tsx
"use client";

import React from "react";
import Link from "next/link";
import type { RecordingClient } from '@/types';
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"; // Keep for Tags
import { User, Disc, CalendarDays, ThumbsUp, Tags } from "lucide-react"; // Ensure User is imported
import BaseDiscoveryCard, { type BaseCardItemData } from "./base-discovery-card";
import { generateUnsplashUrl } from "@/lib/utils";
import { MetadataItem } from '@/components/shared/metadata-item';

interface RecordingCardProps {
  recording: RecordingClient;
  onFavoriteToggle: (recordingId: string) => void;
  onPopOut: (itemData: RecordingClient) => void;
  isPriorityImage: boolean;
}

const RecordingCardComponent: React.FC<RecordingCardProps> = ({ recording: rec, onFavoriteToggle, onPopOut, isPriorityImage }) => {
  const baseItemData: BaseCardItemData = {
    id: rec.id,
    name: rec.title,
    href: `/recordings/${rec.id}`,
    imageUrl: (rec.artworkUrl && rec.artworkUrl.startsWith('http')) ? rec.artworkUrl : generateUnsplashUrl(400, 400, rec.aiHint || rec.title, "music album abstract"),
    aiHint: rec.aiHint,
    isFavorited: rec.isFavorited,
  };

  const primaryMeta = (
    <MetadataItem
      icon={User}
      label="Artist"
      value={<Link href={`/djs/${rec.djId}`} className="hover:underline active:opacity-75">{rec.djName || 'Unknown Artist'}</Link>}
      tooltipContent={<p>Artist: {rec.djName || 'Unknown Artist'}</p>}
      className="text-xs text-muted-foreground" // Applied original outer div classes
    />
  );

  return (
    <BaseDiscoveryCard
      itemData={baseItemData}
      itemType="Recording"
      viewProfileHref={`/recordings/${rec.id}`}
      onFavoriteToggle={onFavoriteToggle}
      onPopOut={() => onPopOut(rec)}
      isPriorityImage={isPriorityImage}
      primaryMetaLine={primaryMeta}
    >
      <div className="text-xs text-muted-foreground space-y-1 py-2">
        {rec.album && (
          <MetadataItem
            icon={Disc}
            label="Album"
            value={rec.album}
            tooltipContent={<p>Album: {rec.album}</p>}
            className="truncate cursor-default" // Added truncate and cursor-default
          />
        )}
        <MetadataItem
          icon={CalendarDays}
          label="Year & Type"
          value={`${rec.year} • ${rec.type}`}
          tooltipContent={<p>Year: {rec.year}, Type: {rec.type}</p>}
          className="cursor-default" // Added cursor-default
        />
        {typeof rec.fanScore === 'number' && (
          <MetadataItem
            icon={ThumbsUp} // Icon itself won't be primary by default, would need iconClassName prop in MetadataItem
            label="Fan Score"
            value={<><span className="font-semibold text-primary">{(rec.fanScore).toFixed(1)}</span>/10</>}
            tooltipContent={<p>Fan Score: {(rec.fanScore).toFixed(1)}/10</p>}
            className="cursor-default" // The ThumbsUp icon was text-primary. MetadataItem needs to support iconClass or we pass text-primary here to color the whole item.
                                       // For now, assuming the ThumbsUp icon in MetadataItem will take parent color or is fine as default.
                                       // If icon must be primary, and MetadataItem doesn't support iconClass, this might need adjustment.
                                       // A quick fix could be to pass 'text-primary' to className if the whole line should be primary.
                                       // However, the original only had icon and score as primary.
                                       // The value prop handles the score text color. Icon color is the main difference.
          />
        )}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center cursor-default">
              <Tags className="mr-1.5 h-3 w-3" />
              <Link href={`/genres/${encodeURIComponent(rec.genre)}`} passHref legacyBehavior>
                <Badge variant="outline" className="text-xs hover:bg-accent cursor-pointer">{rec.genre}</Badge>
              </Link>
            </div>
          </TooltipTrigger>
          <TooltipContent><p>Genre</p></TooltipContent>
        </Tooltip>
      </div>
    </BaseDiscoveryCard>
  );
};

export default React.memo(RecordingCardComponent);
