
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCircle, Disc3, CalendarClock, BarChart3, Building2, Mail } from "lucide-react";
import Image from "next/image"; // Import next/image

export default function SellerDashboard() {
  const djName = "DJ Sparkle (Example)";
  const profileCompleteness = 85; 
  const upcomingGigs = 2;
  const newMessages = 3;
  const profileImageUrl = "https://source.unsplash.com/featured/100x100/?dj,headphones,cool"; // Example Unsplash URL
  const profileAiHint = "dj headphones cool";


  return (
    <div className="space-y-8">
      <section className="bg-card p-6 rounded-lg shadow-md">
         <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Welcome back, {djName}!</h1>
            <p className="text-muted-foreground">Manage your profile, gigs, and earnings.</p>
          </div>
          <div className="mt-4 md:mt-0 relative w-24 h-24">
             <Image 
                src={profileImageUrl}
                alt="DJ Profile Picture"
                fill
                className="rounded-full object-cover" 
                data-ai-hint={profileAiHint}
                placeholder="empty"
              />
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-sm hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center"><UserCircle className="mr-2 h-5 w-5 text-primary"/>Your Profile</CardTitle>
            <CardDescription>Profile completeness: <span className="font-bold text-primary">{profileCompleteness}%</span></CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/profile/edit">Edit Your DJ Profile</Link>
            </Button>
             {profileCompleteness < 100 && (
              <p className="text-xs text-muted-foreground mt-2 text-center">Complete your profile to attract more venues!</p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center"><Building2 className="mr-2 h-5 w-5 text-primary"/>Find Gigs</CardTitle>
            <CardDescription>Discover venues looking for DJs like you.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/venues">Browse Venues & Openings</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center"><CalendarClock className="mr-2 h-5 w-5 text-primary"/>Upcoming Gigs</CardTitle>
             <CardDescription>You have <span className="font-bold text-primary">{upcomingGigs}</span> confirmed gig(s).</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="secondary" className="w-full" disabled>
              <Link href="/dj-schedule">View Your Schedule (TBD)</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center"><BarChart3 className="mr-2 h-5 w-5 text-primary"/>Performance Insights</CardTitle>
            <CardDescription>Analyze your past performances.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/performance">View Performance Data</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center"><Disc3 className="mr-2 h-5 w-5 text-primary"/>AI Profile Tools</CardTitle>
            <CardDescription>Generate or enhance your DJ bio with AI.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/djs/create">AI Profile Generator</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center"><Mail className="mr-2 h-5 w-5 text-primary"/>Messages</CardTitle>
            <CardDescription>You have <span className="font-bold text-destructive">{newMessages}</span> new message(s).</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="secondary" className="w-full">
              <Link href="/messages">View Messages</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
