
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardList, PlusCircle, Filter } from "lucide-react";

// Mock data for gig board items
const mockGigs = [
  { id: "gig1", title: "House DJ for Saturday Night", venueName: "The Groove Lounge", date: "2024-08-31", budget: "$200 - $400" },
  { id: "gig2", title: "Techno Set - Friday Peak Time", venueName: "The Warehouse Project", date: "2024-09-06", budget: "$300 - $500" },
  { id: "gig3", title: "Chillout Sundowner Session", venueName: "Skyline Rooftop Bar", date: "2024-09-01", budget: "$150 - $250" },
  { id: "gig4", title: "Open Format for Corporate Event", venueName: "Grand Ballroom", date: "2024-09-12", budget: "Contact for Quote" },
];

export default function GigBoardPage() {
  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <ClipboardList className="h-8 w-8 text-primary" />
              <CardTitle className="text-3xl">Gig Board</CardTitle>
            </div>
            <CardDescription>
              Discover open gig opportunities posted by venues.
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
             <Button variant="outline" disabled>
                <Filter className="mr-2 h-4 w-4" /> Filter Gigs
            </Button>
            {/* Buyer role might have "Post New Gig" */}
            {/* <Button disabled> 
              <PlusCircle className="mr-2 h-4 w-4" /> Post New Gig
            </Button> */}
          </div>
        </CardHeader>
        <CardContent>
          {mockGigs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockGigs.map((gig) => (
                <Card key={gig.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{gig.title}</CardTitle>
                    <CardDescription>{gig.venueName}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-1 text-sm">
                    <p><span className="font-medium">Date:</span> {gig.date}</p>
                    <p><span className="font-medium">Budget:</span> {gig.budget}</p>
                  </CardContent>
                  <div className="p-4 pt-2">
                    <Button className="w-full" disabled>Apply (Mock)</Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No open gigs posted right now. Check back soon!</p>
            </div>
          )}
        </CardContent>
      </Card>
      <p className="text-xs text-muted-foreground text-center">This is a placeholder for the Gig Board. Functionality is mocked.</p>
    </div>
  );
}
