
"use client"; 

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { UserCircle, Edit3, Mail, Shield, Music, MapPinIcon, Building2, Disc3 } from "lucide-react";
import { useAuthStore } from "@/stores/authStore"; 
import Link from "next/link";
import { Separator } from '@/components/ui/separator';
import { Badge } from "@/components/ui/badge";
import Image from "next/image"; 
import { generateUnsplashUrl } from "@/lib/utils";

export default function ViewProfilePage() {
  const { currentUserRole, isAuthenticated } = useAuthStore(); 

  // Updated mock user data to reflect "Artist" role
  const mockUserData = {
    name: "Alex Doe (Mock)",
    email: "alex.doe@example.com",
    bio: "Passionate about connecting the dots in the music industry. Loves discovering new talent and creating unforgettable event experiences. Currently exploring the vibrant world of electronic music.",
    role: currentUserRole,
    imageUrl: generateUnsplashUrl(400, 400, "user profile cool", "user profile cool"),
    aiHint: "user profile cool",
    favoriteGenres: currentUserRole === "Fan" ? ["Techno", "House", "Ambient"] : [],
    venueName: currentUserRole === "Buyer" ? "The Groove Lounge" : undefined,
    artistName: currentUserRole === "Artist" ? "DJ Sparkle" : undefined, // Changed from djName to artistName
    location: currentUserRole !== "Fan" ? "Metro City, USA" : undefined,
  };

  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Please log in to view your profile.</p>
          <Button asChild className="mt-4">
            <Link href="/login">Go to Login</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto p-4 md:p-0">
      <Card className="shadow-lg">
        <CardHeader className="text-center border-b pb-4">
          <div className="relative h-32 w-32 mx-auto mb-4 rounded-full overflow-hidden border-4 border-primary shadow-lg">
            <Image 
              src={mockUserData.imageUrl}
              alt={`${mockUserData.name}'s profile picture`}
              fill
              className="object-cover"
              data-ai-hint={mockUserData.aiHint || mockUserData.name}
              placeholder="empty"
            />
          </div>
          <CardTitle className="text-4xl font-bold">{mockUserData.name}</CardTitle>
          <CardDescription className="text-xl text-muted-foreground">
            Your {mockUserData.role} Profile
          </CardDescription>
          <Button asChild variant="outline" size="sm" className="mt-4 mx-auto">
            <Link href="/profile/edit">
              <Edit3 className="mr-2 h-4 w-4" /> Edit Profile
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          
          <section>
            <h2 className="text-2xl font-semibold mb-3 text-primary">About Me</h2>
            <p className="text-muted-foreground prose dark:prose-invert max-w-none">{mockUserData.bio}</p>
          </section>
          
          <Separator />

          <section>
            <h2 className="text-2xl font-semibold mb-3 text-primary">Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div className="flex items-center">
                <Mail className="mr-3 h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{mockUserData.email}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Shield className="mr-3 h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Role</p>
                  <p className="font-medium">{mockUserData.role}</p>
                </div>
              </div>
              {mockUserData.location && (
                 <div className="flex items-center">
                    <MapPinIcon className="mr-3 h-5 w-5 text-muted-foreground" />
                    <div>
                    <p className="text-sm text-muted-foreground">Primary Location</p>
                    <p className="font-medium">{mockUserData.location}</p>
                    </div>
                </div>
              )}
               {mockUserData.venueName && (
                 <div className="flex items-center">
                    <Building2 className="mr-3 h-5 w-5 text-muted-foreground" />
                    <div>
                    <p className="text-sm text-muted-foreground">Venue</p>
                    <p className="font-medium">{mockUserData.venueName}</p>
                    </div>
                </div>
              )}
               {mockUserData.artistName && ( // Changed from djName
                 <div className="flex items-center">
                    <Disc3 className="mr-3 h-5 w-5 text-muted-foreground" />
                    <div>
                    <p className="text-sm text-muted-foreground">Artist Name</p> 
                    <p className="font-medium">{mockUserData.artistName}</p>
                    </div>
                </div>
              )}
            </div>
          </section>

          {currentUserRole === 'Fan' && mockUserData.favoriteGenres.length > 0 && (
            <>
              <Separator />
              <section>
                <h2 className="text-2xl font-semibold mb-3 text-primary flex items-center">
                    <Music className="mr-2 h-6 w-6"/> Favorite Genres
                </h2>
                <div className="flex flex-wrap gap-2">
                  {mockUserData.favoriteGenres.map((genre) => (
                     <Link key={genre} href={`/genres/${encodeURIComponent(genre)}`} passHref>
                        <Badge variant="secondary" className="hover:bg-secondary/80 cursor-pointer text-sm px-3 py-1">{genre}</Badge>
                    </Link>
                  ))}
                </div>
              </section>
            </>
          )}
          
        </CardContent>
        <CardFooter className="border-t pt-6 mt-6 flex justify-center">
            <Button asChild variant="link">
                <Link href="/settings">Go to Account Settings</Link>
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
