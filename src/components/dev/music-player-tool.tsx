
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Music, Play, Pause, SkipForward, SkipBack, Search } from "lucide-react";
import ToolWindowWrapper from "@/components/shared/tool-window-wrapper";

interface MusicPlayerToolProps {
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export default function MusicPlayerTool({ isExpanded, onToggleExpand }: MusicPlayerToolProps) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  if (!mounted) {
    return null;
  }

  if (!isExpanded) {
    return null;
  }

  return (
    <ToolWindowWrapper
      title="Music Player"
      icon={Music}
      onToggleExpand={onToggleExpand}
      className="w-72 border-accent/50"
      headerClassName="border-accent/30"
      titleClassName="text-accent"
      contentClassName="p-3 space-y-3"
      footerContent="Note: Music integration is a mock-up."
    >
      <div className="flex items-center space-x-2">
        <Input type="search" placeholder="Search Spotify/Soundcloud..." className="h-8 text-xs flex-grow" />
        <Button variant="outline" size="icon" className="h-8 w-8" aria-label="Search Music">
          <Search className="h-4 w-4" />
        </Button>
      </div>
      <div className="p-2 text-center bg-muted/50 rounded-md min-h-[40px]">
        <p className="text-xs text-muted-foreground">Search results will appear here.</p>
      </div>
      <div className="mt-3 pt-3 border-t border-border">
        <p className="text-xs text-center font-semibold mb-1">Now Playing (Mock)</p>
        <div className="text-center p-2 bg-muted/50 rounded-md">
          <p className="text-sm font-medium truncate">Placeholder Track Title</p>
          <p className="text-xs text-muted-foreground truncate">Placeholder Artist</p>
        </div>
        <div className="flex justify-center items-center space-x-2 mt-2">
          <Button variant="ghost" size="icon" aria-label="Previous Track"><SkipBack className="h-5 w-5" /></Button>
          <Button variant="primary" size="icon" aria-label="Play/Pause"><Play className="h-5 w-5" /></Button>
          <Button variant="ghost" size="icon" aria-label="Next Track"><SkipForward className="h-5 w-5" /></Button>
        </div>
      </div>
    </ToolWindowWrapper>
  );
}
