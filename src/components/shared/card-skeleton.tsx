
"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function CardSkeleton() {
  return (
    <Card className="flex flex-col overflow-hidden shadow-lg">
      <Skeleton className="h-48 w-full rounded-t-lg" />
      <CardHeader className="pb-2 pt-3">
        <Skeleton className="h-6 w-3/4 rounded" />
        <Skeleton className="h-4 w-1/2 rounded mt-1.5" />
      </CardHeader>
      <CardContent className="text-xs text-muted-foreground space-y-1.5 py-2">
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="h-4 w-5/6 rounded" />
        <Skeleton className="h-4 w-2/3 rounded" />
      </CardContent>
    </Card>
  );
}
