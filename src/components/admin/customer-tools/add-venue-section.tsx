
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Building2 } from "lucide-react";

export default function AddVenueSection() {
  const { toast } = useToast();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // In a real app, handle form submission (API call, etc.)
    toast({
      title: "Venue Profile Submitted (Mock)",
      description: "The venue profile has been submitted for review by an admin.",
    });
    // Optionally reset form or redirect
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center">
            <Building2 className="mr-3 h-6 w-6 text-primary" />
            Create New Venue Profile
          </CardTitle>
          <CardDescription>
            Admins can use this tool to add new venues to the platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="venueNameAdmin" className="text-base">Venue Name</Label>
              <Input id="venueNameAdmin" placeholder="e.g., The Underground Beat" className="mt-1" required />
            </div>
            <div>
              <Label htmlFor="locationAdmin" className="text-base">Location</Label>
              <Input id="locationAdmin" placeholder="e.g., 123 Main St, Anytown, USA" className="mt-1" required />
            </div>
            <div>
              <Label htmlFor="capacityAdmin" className="text-base">Capacity</Label>
              <Input id="capacityAdmin" type="number" placeholder="e.g., 150" className="mt-1" required />
            </div>
            <div>
              <Label htmlFor="descriptionAdmin" className="text-base">Description</Label>
              <Textarea id="descriptionAdmin" placeholder="Tell us about the venue's vibe, equipment, etc." className="mt-1 min-h-[100px]" required />
            </div>
            <div>
              <Label htmlFor="venueImageAdmin" className="text-base">Venue Image</Label>
              <Input id="venueImageAdmin" type="file" className="mt-1" accept="image/*" />
              <p className="text-sm text-muted-foreground mt-1">Upload a captivating image of the venue.</p>
            </div>
            <Button type="submit" className="w-full md:w-auto">Create Venue Profile</Button>
          </form>
        </CardContent>
      </Card>
       <p className="text-center text-muted-foreground text-xs">
        Note: This is a placeholder form. Submitting will not create a venue yet.
      </p>
    </div>
  );
}
