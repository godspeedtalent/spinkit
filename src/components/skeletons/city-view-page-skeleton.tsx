
"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CardSkeleton } from "@/components/shared/card-skeleton"; // Re-use card skeleton

export function CityViewPageSkeleton() {
  return (
    <div className="space-y-8 p-4 md:p-6 lg:p-8 animate-pulse">
      <Card className="shadow-lg">
        <CardHeader className="text-center border-b pb-6 relative">
          <Skeleton className="h-20 w-20 rounded-full mx-auto mb-4" /> {/* Icon */}
          <Skeleton className="h-10 w-1/2 mx-auto mb-2 rounded-md" /> {/* City Name */}
          <Skeleton className="h-4 w-3/4 mx-auto rounded-md" /> {/* Description Line 1 */}
          <Skeleton className="h-4 w-2/3 mx-auto rounded-md" /> {/* Description Line 2 */}
        </CardHeader>

        <CardContent className="pt-8 space-y-12">
          {/* Top DJs Section */}
          <section>
            <Skeleton className="h-8 w-1/3 mb-6 rounded-md" /> {/* Section Title */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => <CardSkeleton key={`dj-skel-${i}`} />)}
            </div>
          </section>

          <Skeleton className="h-px w-full rounded-md my-6" /> {/* Separator */}

          {/* Top Venues Section */}
          <section>
            <Skeleton className="h-8 w-1/3 mb-6 rounded-md" /> {/* Section Title */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => <CardSkeleton key={`venue-skel-${i}`} />)}
            </div>
          </section>
          
          <Skeleton className="h-px w-full rounded-md my-6" /> {/* Separator */}

          {/* Popular Genres Section */}
          <section>
            <Skeleton className="h-8 w-1/3 mb-6 rounded-md" /> {/* Section Title */}
            <div className="flex flex-wrap gap-3">
              <Skeleton className="h-8 w-20 rounded-full" />
              <Skeleton className="h-8 w-24 rounded-full" />
              <Skeleton className="h-8 w-16 rounded-full" />
              <Skeleton className="h-8 w-28 rounded-full" />
            </div>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
