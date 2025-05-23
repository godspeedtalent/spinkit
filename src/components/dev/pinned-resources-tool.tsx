
"use client";

import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Pin, Trash2 } from "lucide-react";
import Link from "next/link";
import ToolWindowWrapper from "@/components/shared/tool-window-wrapper";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { usePinnedItemsStore } from "@/stores/pinnedItemsStore";
import { generateUnsplashUrl } from "@/lib/utils"; // Import the helper

interface PinnedResourcesToolProps {
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export default function PinnedResourcesTool({ isExpanded, onToggleExpand }: PinnedResourcesToolProps) {
  const [mounted, setMounted] = React.useState(false);
  const { pinnedItems, removePinnedItem } = usePinnedItemsStore();

  React.useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const titleWithCount = `Pinned Resources ${pinnedItems.length > 0 ? `(${pinnedItems.length})` : ''}`;

  return (
    <ToolWindowWrapper
      title={titleWithCount}
      icon={Pin}
      onToggleExpand={onToggleExpand}
      className="w-80 h-[400px] border-secondary/50"
      headerClassName="border-secondary/30"
      titleClassName="text-secondary"
      contentClassName="p-0"
      footerContent="Pins are for this session only."
    >
      <ScrollArea className="h-full p-3">
        {pinnedItems.length > 0 ? (
          <ul className="space-y-2">
            {pinnedItems.map((item) => {
              const imageSrc = (item.imageUrl && item.imageUrl.startsWith('http'))
                ? item.imageUrl
                : generateUnsplashUrl(32, 32, item.aiHint || item.name || item.type);

              return (
                <li key={item.href} className="flex items-center justify-between p-2 rounded-md bg-muted/30 hover:bg-muted/60 transition-colors group">
                  <div className="flex items-center flex-grow min-w-0">
                    <div className="w-8 h-8 mr-2.5 shrink-0 rounded relative">
                      <Image
                        src={imageSrc}
                        alt={`${item.type} thumbnail for ${item.name}`}
                        fill
                        className="rounded object-cover"
                        data-ai-hint={item.aiHint || item.name || item.type}
                        placeholder="empty"
                      />
                    </div>
                    <div className="flex-grow min-w-0">
                      <Link href={item.href} className="block" title={item.name}>
                        <div className="truncate text-sm text-foreground hover:underline">{item.name}</div>
                      </Link>
                      <p className="text-xs font-bold text-muted-foreground">{item.type}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-40 group-hover:opacity-100 text-destructive hover:bg-destructive/10 shrink-0 ml-2"
                    onClick={() => removePinnedItem(item.href)}
                    aria-label={`Unpin ${item.name}`}
                    title={`Unpin ${item.name}`}
                    >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
              <Pin className="h-10 w-10 text-muted-foreground/50 mb-3"/>
              <p className="text-xs text-muted-foreground">No items pinned yet.</p>
              <p className="text-xs text-muted-foreground/80 mt-1">Click the <Pin className="inline h-3 w-3"/> icon on various items to pin them here.</p>
          </div>
        )}
      </ScrollArea>
    </ToolWindowWrapper>
  );
}
