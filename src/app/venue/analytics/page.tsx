
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export default function VenueAnalyticsPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            <CardTitle className="text-2xl">Venue Analytics</CardTitle>
          </div>
          <CardDescription>
            Insights and performance data for your venue. (Placeholder)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Detailed charts and analytics related to your venue's bookings, popular event times,
            DJ performance metrics, and audience engagement will be displayed here.
          </p>
          <div className="mt-6 p-8 border-2 border-dashed border-muted rounded-lg text-center">
            <p className="text-lg font-semibold text-muted-foreground">Analytics Dashboard Coming Soon</p>
            <p className="text-sm text-muted-foreground">Check back later for powerful insights!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
