// src/components/cards/dj-card.tsx
"use client";

import React from "react";
import Link from "next/link";
import type { DJClient } from '@/types';
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ThumbsUp, Tags, MapPin } from "lucide-react";
import BaseDiscoveryCard, { type BaseCardItemData } from "./base-discovery-card";

interface DJCardProps {
  dj: DJClient;
  onFavoriteToggle: (djId: string) => void;
  onPopOut: (itemData: DJClient) => void; // Updated to pass DJClient
  isPriorityImage: boolean;
}

const DJCardComponent: React.FC<DJCardProps> = ({ dj, onFavoriteToggle, onPopOut, isPriorityImage }) => {
  const baseItemData: BaseCardItemData = {
    id: dj.id,
    name: dj.name,
    href: `/djs/${dj.id}`,
    imageUrl: dj.imageUrl,
    aiHint: dj.aiHint,
    isFavorited: dj.isFavorited,
  };

  const primaryMeta = (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link 
            href={`/city/${encodeURIComponent((dj.location || "unknown").split(',')[0].trim())}`} 
            className="flex items-center cursor-pointer hover:text-primary hover:underline active:opacity-75"
        >
          <MapPin className="mr-1 h-3.5 w-3.5" />
          <span>{dj.location}</span>
        </Link>
      </TooltipTrigger>
      <TooltipContent><p>Location: {dj.location}</p></TooltipContent>
    </Tooltip>
  );

  return (
    <BaseDiscoveryCard
      itemData={baseItemData}
      itemType="DJ"
      viewProfileHref={`/djs/${dj.id}`}
      onFavoriteToggle={onFavoriteToggle}
      onPopOut={() => onPopOut(dj)} // Pass full dj object
      isPriorityImage={isPriorityImage}
      primaryMetaLine={primaryMeta}
    >
      <div className="space-y-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center flex-wrap gap-1 cursor-default">
              <Tags className="mr-1 h-3.5 w-3.5 text-muted-foreground" />
              {dj.genres.slice(0, 3).map((genre) => (
                <Link key={genre} href={`/genres/${encodeURIComponent(genre)}`} passHref legacyBehavior>
                  <Badge variant="secondary" className="text-xs hover:bg-secondary/80 cursor-pointer">{genre}</Badge>
                </Link>
              ))}
              {dj.genres.length > 3 && <Badge variant="secondary" className="text-xs">...</Badge>}
            </div>
          </TooltipTrigger>
          <TooltipContent><p>Genres</p></TooltipContent>
        </Tooltip>
        {dj.score > 59 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center text-sm text-muted-foreground cursor-default pt-1">
                <ThumbsUp className="mr-1 h-3.5 w-3.5 text-primary" />
                <span className="font-semibold text-primary">{dj.score}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent><p>Score</p></TooltipContent>
          </Tooltip>
        )}
      </div>
    </BaseDiscoveryCard>
  );
};

export default React.memo(DJCardComponent);
