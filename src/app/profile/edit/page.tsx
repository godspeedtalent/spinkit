
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UserCircle, Link as LinkIcon } from "lucide-react"; // Added LinkIcon for Spotify
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";


export default function EditProfilePage() {
  const { toast } = useToast();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // In a real app, you would handle form submission, API calls, etc.
    toast({
      title: "Profile Updated (Simulated)",
      description: "Your profile information has been saved.",
    });
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <Card className="shadow-lg">
        <CardHeader className="text-center">
          <UserCircle className="h-16 w-16 text-primary mx-auto mb-4" />
          <CardTitle className="text-3xl">Edit Your Profile</CardTitle>
          <CardDescription>
            Update your personal information and preferences.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="fullName" className="text-lg">Full Name</Label>
              <Input id="fullName" placeholder="e.g., Alex Doe" className="mt-1" defaultValue="Alex Doe (Placeholder)" />
            </div>
            <div>
              <Label htmlFor="email" className="text-lg">Email Address</Label>
              <Input id="email" type="email" placeholder="e.g., alex.doe@example.com" className="mt-1" defaultValue="alex.doe@example.com" />
            </div>
            <div>
              <Label htmlFor="bio" className="text-lg">Bio</Label>
              <Textarea id="bio" placeholder="Tell us a bit about yourself..." className="mt-1 min-h-[100px]" defaultValue="Lover of music and connecting people! (Placeholder bio)" />
            </div>
            <div>
              <Label htmlFor="profilePicture" className="text-lg">Profile Picture</Label>
              <Input id="profilePicture" type="file" className="mt-1" />
              <p className="text-sm text-muted-foreground mt-1">Upload a new profile picture.</p>
            </div>

            <Separator className="my-6" />

            <div>
                <h3 className="text-xl font-semibold mb-2 text-primary">Connected Accounts</h3>
                <Card className="bg-muted/30 p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 fill-green-500"><title>Spotify</title><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm6.235 17.596c-.202.32-.58.433-.893.233-2.523-1.543-5.713-1.886-9.458-1.036-.356.08-.69-.12-.77-.473-.08-.353.12-.69.473-.77C11.53 14.67 15.018 15.04 17.82 16.74c.314.197.426.577.215.856zm1.19-2.458c-.25.396-.71.53-1.108.278-2.903-1.763-7.19-2.29-10.562-1.254-.422.13-.86-.094-.99-.516-.13-.422.094-.86.516-.99C10.082 11.503 14.78 12.086 18.07 14.07c.397.25.53.71.278 1.107zm.132-2.768C15.045 10.06 9.38 9.762 5.436 10.91c-.484.144-.99-.132-1.14-.613-.144-.484.132-.99.613-1.14C9.475 7.71 15.736 8.026 20.26 10.46c.44.233.603.787.37 1.224-.237.437-.787.603-1.224.37z"/></svg>
                            <span className="font-medium">Spotify</span>
                        </div>
                        <Button variant="outline" size="sm" disabled>
                            <LinkIcon className="mr-2 h-4 w-4" /> Connect (Mock)
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Link your Spotify account to enhance your music recommendations and share your taste. (UI Placeholder)</p>
                </Card>
            </div>

            <Button type="submit" className="w-full mt-8">Save Changes</Button>
          </form>
        </CardContent>
      </Card>
       <p className="text-center text-muted-foreground text-sm">
        Note: This is a placeholder form. Profile updates are simulated.
      </p>
    </div>
  );
}
