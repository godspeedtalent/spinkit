
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Settings as SettingsIcon, Save } from "lucide-react"; // Renamed to avoid conflict

export default function VenueSettingsPage() {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Mock save
    console.log("Venue settings saved (mock)");
    // toast({ title: "Venue Settings Saved", description: "Your venue settings have been updated." });
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <SettingsIcon className="h-6 w-6 text-primary" />
            <CardTitle className="text-2xl">Venue Settings</CardTitle>
          </div>
          <CardDescription>
            Manage specific settings for your venue. (Placeholder)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="venueName" className="text-base">Venue Name</Label>
              <Input id="venueName" defaultValue="The Groove Lounge (Example)" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="venueDescription" className="text-base">Venue Description</Label>
              <Textarea id="venueDescription" defaultValue="Your go-to spot for deep house and techno. Intimate vibe, killer sound." className="mt-1 min-h-[100px]" />
            </div>
            <div>
              <Label htmlFor="defaultBookingWindow" className="text-base">Default Booking Window (Days)</Label>
              <Input id="defaultBookingWindow" type="number" defaultValue="30" className="mt-1" />
              <p className="text-xs text-muted-foreground mt-1">How far in advance DJs can typically request bookings.</p>
            </div>
             <Button type="submit" className="w-full" disabled>
                <Save className="mr-2 h-4 w-4" /> Save Venue Settings (Mock)
            </Button>
          </form>
           <div className="mt-6 p-8 border-2 border-dashed border-muted rounded-lg text-center">
            <p className="text-lg font-semibold text-muted-foreground">Advanced Venue Settings Coming Soon</p>
            <p className="text-sm text-muted-foreground">Manage amenities, opening hours, cancellation policies, and more.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
