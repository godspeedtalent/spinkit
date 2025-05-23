
"use client"; // This page uses client-side form handling

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
// No ArrowLeft needed due to breadcrumbs

export default function CreateVenuePage() {
  const { toast } = useToast();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // In a real app, handle form submission (API call, etc.)
    toast({
      title: "Venue Profile Submitted (Mock)",
      description: "Your venue profile has been submitted for review.",
    });
    // Optionally reset form or redirect
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      {/* Breadcrumbs will handle back navigation */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl">Create New Venue Profile</CardTitle>
          <CardDescription>
            Add your venue to VenueVibes to connect with amazing DJs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="venueName" className="text-lg">Venue Name</Label>
              <Input id="venueName" placeholder="e.g., The Underground Beat" className="mt-1" required />
            </div>
            <div>
              <Label htmlFor="location" className="text-lg">Location</Label>
              <Input id="location" placeholder="e.g., 123 Main St, Anytown, USA" className="mt-1" required />
            </div>
            <div>
              <Label htmlFor="capacity" className="text-lg">Capacity</Label>
              <Input id="capacity" type="number" placeholder="e.g., 150" className="mt-1" required />
            </div>
            <div>
              <Label htmlFor="description" className="text-lg">Description</Label>
              <Textarea id="description" placeholder="Tell us about your venue's vibe, equipment, and what you're looking for in a DJ." className="mt-1 min-h-[100px]" required />
            </div>
            <div>
              <Label htmlFor="venueImage" className="text-lg">Venue Image</Label>
              <Input id="venueImage" type="file" className="mt-1" accept="image/*" />
              <p className="text-sm text-muted-foreground mt-1">Upload a captivating image of your venue.</p>
            </div>
            <Button type="submit" className="w-full">Create Venue Profile</Button>
          </form>
        </CardContent>
      </Card>
       <p className="text-center text-muted-foreground text-sm">
        Note: This is a placeholder form. Submitting will not create a venue yet.
      </p>
    </div>
  );
}
