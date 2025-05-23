
"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function DjProfilePageSkeleton() {
  return (
    <div className="relative min-h-screen animate-pulse">
      {/* Background Placeholder */}
      <div className="absolute inset-0 z-0">
        <Skeleton className="absolute inset-0 w-full h-full opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 md:py-16 space-y-12">
        <div className="md:grid md:grid-cols-12 md:gap-8 lg:gap-12 items-start">
          {/* Left Column: Artwork & Score */}
          <div className="md:col-span-4 lg:col-span-3 mb-8 md:mb-0">
            <div className="sticky top-20">
              <Skeleton className="w-full aspect-[3/4] rounded-lg shadow-2xl" />
              <div className="mt-6 p-4 bg-card/70 backdrop-blur-sm rounded-lg text-center">
                <Skeleton className="h-12 w-20 mx-auto mb-1 rounded" />
                <Skeleton className="h-4 w-24 mx-auto mb-1 rounded" />
                <Skeleton className="h-3 w-20 mx-auto rounded" />
              </div>
            </div>
          </div>

          {/* Right Column: Details */}
          <div className="md:col-span-8 lg:col-span-9">
            <div className="lg:grid lg:grid-cols-3 lg:gap-8">
              <div className="lg:col-span-2">
                <Skeleton className="h-12 w-3/4 mb-2 rounded" /> {/* Title */}
                <Skeleton className="h-5 w-1/2 mb-4 rounded" /> {/* Location */}
                <div className="flex flex-wrap gap-2 mb-6">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-14 rounded-full" />
                </div>
                
                <div className="flex space-x-3 mb-8">
                  <Skeleton className="h-11 w-36 rounded-md" /> {/* Button */}
                  <Skeleton className="h-11 w-11 rounded-full" /> {/* Icon Button */}
                  <Skeleton className="h-11 w-11 rounded-full" /> {/* Icon Button */}
                </div>

                <Skeleton className="h-6 w-1/4 mb-2 rounded" /> {/* About Title */}
                <Skeleton className="h-4 w-full mb-1 rounded" />
                <Skeleton className="h-4 w-full mb-1 rounded" />
                <Skeleton className="h-4 w-5/6 mb-8 rounded" />

                <Skeleton className="h-6 w-1/3 mb-3 rounded" /> {/* Specialties Title */}
                <Skeleton className="h-4 w-full mb-1 rounded" />
                <Skeleton className="h-4 w-3/4 mb-8 rounded" />
              </div>
              
              <div className="lg:col-span-1 space-y-8 mt-8 lg:mt-0">
                <div>
                  <Skeleton className="h-6 w-3/5 mb-3 rounded" /> {/* Featured Recordings Title */}
                  <div className="space-y-3">
                    <Skeleton className="h-10 w-full rounded-md" />
                    <Skeleton className="h-10 w-full rounded-md" />
                  </div>
                </div>
                 <div>
                  <Skeleton className="h-6 w-3/5 mb-3 rounded" /> {/* Upcoming Gigs Title */}
                   <div className="space-y-3">
                    <Skeleton className="h-12 w-full rounded-md" />
                    <Skeleton className="h-12 w-full rounded-md" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <Skeleton className="h-1 w-full my-12 rounded" /> {/* Separator */}
        
        {/* Comments Skeleton */}
        <div className="max-w-3xl mx-auto">
            <Skeleton className="h-8 w-1/3 mb-4 rounded" /> {/* Comments Section Title */}
            <Card>
                <CardContent className="p-4 space-y-4">
                    {/* Mock input area */}
                    <div className="flex space-x-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <Skeleton className="h-20 w-full rounded-md" />
                    </div>
                    <div className="flex justify-end">
                        <Skeleton className="h-8 w-24 rounded-md" />
                    </div>
                    {/* Mock comment items */}
                    <div className="space-y-4 pt-4 border-t">
                        {[1, 2].map(i => (
                        <div key={i} className="flex space-x-3">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-1/4 rounded" />
                                <Skeleton className="h-4 w-full rounded" />
                                <Skeleton className="h-3 w-1/5 ml-auto rounded" />
                            </div>
                        </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
