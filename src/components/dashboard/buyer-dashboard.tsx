
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building2, CalendarClock, Search, PlusCircle, CreditCard } from "lucide-react";
import Image from "next/image"; // Import next/image

export default function BuyerDashboard() {
  const venueName = "The Groove Lounge (Example)";
  const upcomingBookings = 3;
  const pendingPayments = 1;
  const venueImageUrl = "https://source.unsplash.com/featured/150x100/?club,stage"; // Example Unsplash URL
  const venueAiHint = "club stage";


  return (
    <div className="space-y-8">
      <section className="bg-card p-6 rounded-lg shadow-md">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Welcome, {venueName}!</h1>
            <p className="text-muted-foreground">Manage your venue and DJ bookings.</p>
          </div>
          <div className="mt-4 md:mt-0 relative w-[150px] h-[100px]">
             <Image 
                src={venueImageUrl} 
                alt="Venue Image"
                fill
                className="rounded-md object-cover" 
                data-ai-hint={venueAiHint}
                placeholder="empty"
              />
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-sm hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center"><Search className="mr-2 h-5 w-5 text-primary"/>Find DJs</CardTitle>
            <CardDescription>Discover and book talented DJs for your events.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/djs">Browse DJ Profiles</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center"><Building2 className="mr-2 h-5 w-5 text-primary"/>Manage Venue</CardTitle>
            <CardDescription>Update your venue's profile and details.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/venues/create">Edit Venue Profile</Link> 
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center"><CalendarClock className="mr-2 h-5 w-5 text-primary"/>Upcoming Bookings</CardTitle>
            <CardDescription>You have <span className="font-bold text-primary">{upcomingBookings}</span> upcoming events.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="secondary" className="w-full">
              <Link href="/events">View Schedule</Link> 
            </Button>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center"><PlusCircle className="mr-2 h-5 w-5 text-primary"/>Post an Opening</CardTitle>
            <CardDescription>Need a DJ for a specific date or event? Let them know.</CardDescription>
          </CardHeader>
          <CardContent>
             <Button variant="outline" className="w-full" disabled>Post New DJ Opening (TBD)</Button>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center"><CreditCard className="mr-2 h-5 w-5 text-primary"/>Payments</CardTitle>
            <CardDescription><span className="font-bold text-destructive">{pendingPayments}</span> pending payment(s).</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/payments">Manage Payments</Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle>Venue Performance Analytics (Coming Soon)</CardTitle>
            <CardDescription>Insights into past events and DJ impact at your venue.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Detailed charts and data about your venue's activity will be available here.</p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
