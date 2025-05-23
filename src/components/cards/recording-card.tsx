// src/components/cards/recording-card.tsx
"use client";

import React from "react";
import Link from "next/link";
import type { RecordingClient } from '@/types';
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { User, Disc, CalendarDays, ThumbsUp, Tags } from "lucide-react";
import BaseDiscoveryCard, { type BaseCardItemData } from "./base-discovery-card";
import { generateUnsplashUrl } from "@/lib/utils";

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
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center text-xs text-muted-foreground cursor-default">
          <User className="mr-1.5 h-3 w-3" />
          <Link href={`/djs/${rec.djId}`} className="hover:underline active:opacity-75">{rec.djName || 'Unknown Artist'}</Link>
        </div>
      </TooltipTrigger>
      <TooltipContent><p>Artist</p></TooltipContent>
    </Tooltip>
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
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center truncate cursor-default">
                <Disc className="mr-1.5 h-3 w-3" /> {rec.album}
              </div>
            </TooltipTrigger>
            <TooltipContent><p>Album</p></TooltipContent>
          </Tooltip>
        )}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center cursor-default">
              <CalendarDays className="mr-1.5 h-3 w-3" /> {rec.year} &bull; {rec.type}
            </div>
          </TooltipTrigger>
          <TooltipContent><p>Year & Type</p></TooltipContent>
        </Tooltip>
        {typeof rec.fanScore === 'number' && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center cursor-default">
                <ThumbsUp className="mr-1.5 h-3 w-3 text-primary" />
                <span className="font-semibold text-primary">{(rec.fanScore).toFixed(1)}</span>/10
              </div>
            </TooltipTrigger>
            <TooltipContent><p>Fan Score</p></TooltipContent>
          </Tooltip>
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
