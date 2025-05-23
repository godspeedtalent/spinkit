
"use client";

import { Disc3 } from "lucide-react";

interface CompactLoadingIndicatorProps {
  message?: string;
  iconSize?: string; // e.g., "h-8 w-8"
  textSize?: string; // e.g., "text-sm"
}

export default function CompactLoadingIndicator({ 
  message = "Loading content...",
  iconSize = "h-10 w-10",
  textSize = "text-base"
}: CompactLoadingIndicatorProps) {
  return (
    <div className="flex flex-col items-center justify-center text-primary py-4">
      <Disc3 className={`${iconSize} animate-spinning-disc`} />
      <p className={`mt-2 font-semibold text-muted-foreground ${textSize}`}>
        {message}
      </p>
    </div>
  );
}
