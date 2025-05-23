
"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function MessagesPageSkeleton() {
  return (
    <div className="flex h-[calc(100vh-theme(spacing.14))] border-t animate-pulse">
      {/* Sidebar - Conversation List Skeleton */}
      <aside className="w-full md:w-1/3 lg:w-1/4 border-r bg-muted/40 flex flex-col">
        <div className="p-4 border-b space-y-2">
          <div className="flex justify-between items-center">
            <Skeleton className="h-6 w-20 rounded-md" /> {/* Inbox Title */}
            <Skeleton className="h-8 w-8 rounded-md" /> {/* New Message Icon */}
          </div>
          <Skeleton className="h-9 w-full rounded-md" /> {/* Search Input */}
        </div>
        <div className="flex-1 py-2 space-y-1">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={`conv-skel-${i}`} className="flex items-center p-3 space-x-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-3/4 rounded-md" />
                <Skeleton className="h-3 w-full rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Chat Area Skeleton */}
      <main className="flex-1 flex flex-col bg-background">
        {/* Chat Header Skeleton */}
        <header className="p-4 border-b flex items-center space-x-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-1">
            <Skeleton className="h-5 w-32 rounded-md" />
            <Skeleton className="h-3 w-20 rounded-md" />
          </div>
        </header>
        {/* Chat Messages Area Skeleton */}
        <div className="flex-1 p-4 space-y-4">
          {[1, 2, 3].map(i => (
            <div key={`msg-skel-out-${i}`} className="flex justify-end">
              <Skeleton className="h-10 w-2/3 rounded-lg" />
            </div>
          ))}
          {[1, 2].map(i => (
             <div key={`msg-skel-in-${i}`} className="flex justify-start">
              <Skeleton className="h-10 w-2/3 rounded-lg" />
            </div>
          ))}
        </div>
        {/* Message Input Area Skeleton */}
        <footer className="p-4 border-t">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-10 flex-1 rounded-md" /> {/* Input */}
            <Skeleton className="h-10 w-16 rounded-md" /> {/* Send Button */}
          </div>
        </footer>
      </main>
    </div>
  );
}
