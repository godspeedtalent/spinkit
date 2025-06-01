// src/components/cards/dj-card.tsx
"use client";

import React from "react";
import type { DJClient } from '@/types';
import { ThumbsUp, Tags, MapPin } from "lucide-react";
import BaseDiscoveryCard, { type BaseCardItemData } from "./base-discovery-card";
import { MetadataItem } from '@/components/shared/metadata-item';
import { EntityTags } from '@/components/shared/entity-tags';

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
    <MetadataItem
      icon={MapPin}
      label="Location"
      value={dj.location || 'N/A'}
      href={`/city/${encodeURIComponent((dj.location || "unknown").split(',')[0].trim())}`}
      tooltipContent={<p>Location: {dj.location || 'Not specified'}</p>}
      className="cursor-pointer hover:text-primary active:opacity-75" // Removed hover:underline as Link in MetadataItem handles it
    />
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
        <EntityTags
          tags={dj.genres}
          icon={Tags}
          tooltipLabel="Genres"
          tagLinkPrefix="/genres/"
          visibleTagCount={3}
          badgeVariant="secondary"
          // className prop can be used if additional styling for the wrapper is needed.
          // The EntityTags component handles icon margin and badge styling (including text-xs via default badge size).
          // The icon's default color in EntityTags is text-muted-foreground, matching the original.
        />
        {dj.score > 59 && (
          <MetadataItem
            icon={ThumbsUp}
            label="Score"
            value={<span className="font-semibold text-primary">{dj.score}</span>}
            tooltipContent={<p>DJ Score: {dj.score}/100</p>}
            className="pt-1 cursor-default"
          />
        )}
      </div>
    </BaseDiscoveryCard>
  );
};

export default React.memo(DJCardComponent);
