// src/components/cards/base-discovery-card.tsx
"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Pin, Eye, ExternalLink, Heart, PinOff } from "lucide-react";
import { usePinnedItemsStore } from "@/stores/pinnedItemsStore";
import { cn } from "@/lib/utils";
import type { PinnedItemType } from "@/config/site";

export interface BaseCardItemData {
  id: string;
  name: string;
  href: string;
  imageUrl: string;
  aiHint?: string;
  isFavorited?: boolean;
}

interface BaseDiscoveryCardProps<T extends BaseCardItemData> {
  itemData: T;
  itemType: PinnedItemType;
  viewProfileHref: string;
  onFavoriteToggle: (id: string) => void;
  onPopOut: (itemData: T) => void;
  isPriorityImage: boolean;
  titleLinkHref?: string;
  primaryMetaLine?: React.ReactNode;
  secondaryMetaLine?: React.ReactNode;
  children: React.ReactNode; // For the main content body specific to each card type
  className?: string;
}

function BaseDiscoveryCard<T extends BaseCardItemData>({
  itemData,
  itemType,
  viewProfileHref,
  onFavoriteToggle,
  onPopOut,
  isPriorityImage,
  titleLinkHref,
  primaryMetaLine,
  secondaryMetaLine,
  children,
  className,
}: BaseDiscoveryCardProps<T>) {
  const { togglePin, isItemPinned } = usePinnedItemsStore();
  const isPinned = isItemPinned(itemData.href);

  const handlePinToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    togglePin({
      type: itemType,
      name: itemData.name,
      href: itemData.href,
      imageUrl: itemData.imageUrl,
      aiHint: itemData.aiHint,
    });
  };

  const handleOpenQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onPopOut(itemData);
  };

  return (
    <Card className={cn(
      "flex flex-col shadow-lg hover:shadow-2xl transition-all duration-200 hover:scale-[1.02] rounded-lg relative group active:scale-[0.98] active:shadow-xl",
      "overflow-hidden",
      className
    )}>
      <div className="absolute top-2 right-2 z-10 flex items-center space-x-1 bg-card/70 p-1 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full h-7 w-7 text-primary hover:bg-primary/10" onClick={handleOpenQuickView}>
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent><p>Quick View</p></TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn("rounded-full h-7 w-7 text-primary hover:bg-primary/10", isPinned && "bg-primary/20")}
              onClick={handlePinToggle}
            >
              {isPinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent><p>{isPinned ? `Unpin ${itemData.name}` : `Pin ${itemData.name}`}</p></TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button asChild variant="ghost" size="icon" className="rounded-full h-7 w-7 text-primary hover:bg-primary/10">
              <Link href={viewProfileHref} className="active:opacity-75">
                <Eye className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent><p>View Profile</p></TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className={cn("rounded-full h-7 w-7 hover:bg-destructive/10", itemData.isFavorited ? "text-destructive fill-destructive" : "text-muted-foreground hover:text-destructive")} onClick={() => onFavoriteToggle(itemData.id)}>
              <Heart className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent><p>{itemData.isFavorited ? "Unfavorite" : "Favorite"}</p></TooltipContent>
        </Tooltip>
      </div>

      <Link href={itemData.href} className="block w-full h-48 relative active:brightness-90 transition-all duration-150">
        <Image
          src={itemData.imageUrl}
          alt={`Image of ${itemData.name}`}
          fill
          className="rounded-t-lg object-cover"
          priority={isPriorityImage}
          data-ai-hint={itemData.aiHint || itemData.name}
          placeholder="empty"
        />
      </Link>

      <CardHeader className="pt-4 pb-2">
        <Link href={titleLinkHref || itemData.href} className="hover:underline active:opacity-75">
          <CardTitle className="text-xl">{itemData.name}</CardTitle>
        </Link>
        {primaryMetaLine && <div className="text-sm text-muted-foreground">{primaryMetaLine}</div>}
        {secondaryMetaLine && <div className="text-xs text-muted-foreground mt-0.5">{secondaryMetaLine}</div>}
      </CardHeader>

      <CardContent className="flex-grow py-2">
        {children}
      </CardContent>
    </Card>
  );
}

export default React.memo(BaseDiscoveryCard) as typeof BaseDiscoveryCard; // Type assertion for generic component
