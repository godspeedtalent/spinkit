
"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, CalendarPlus, CalendarCheck, MailWarning, Save, DollarSign, ClockIcon } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/stores/authStore";
import { useToast } from "@/hooks/use-toast";

// Mock data - in a real app, this would come from an API and be role-dependent
const mockArtistBookings = {
  upcoming: [
    { id: "booking1", eventName: "Neon Nights", venueName: "The Groove Lounge", date: "2024-08-25", time: "10 PM - 2 AM", status: "Confirmed", pay: "$350" },
    { id: "booking2", eventName: "Rooftop Grooves", venueName: "Skyline Rooftop Bar", date: "2024-09-02", time: "6 PM - 10 PM", status: "Confirmed", pay: "$250" },
  ],
  past: [
    { id: "booking3", eventName: "Warehouse Takeover", venueName: "The Warehouse Project", date: "2024-07-15", time: "11 PM - 4 AM", status: "Completed, Paid", pay: "$500" },
  ],
};

const mockBuyerBookingRequests = [
    { id: "request1", djName: "DJ Sparkle", eventName: "Saturday Night Prime", date: "2024-09-10", proposedPay: "$300", status: "Pending Review"},
    { id: "request2", djName: "Beatrix Kiddo", eventName: "Techno Tuesday", date: "2024-09-14", proposedPay: "$200", status: "Pending Review"},
];


export default function BookingsPage() {
  const { currentUserRole } = useAuthStore();
  const { toast } = useToast();

  const renderArtistView = () => (
    <Tabs defaultValue="my-bookings" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-4"> {/* Changed from grid-cols-3 */}
        <TabsTrigger value="my-bookings">My Bookings</TabsTrigger>
        <TabsTrigger value="booking-requests">Booking Requests</TabsTrigger>
      </TabsList>

      <TabsContent value="my-bookings">
        <Card>
          <CardHeader>
            <CardTitle>My Bookings</CardTitle>
            <CardDescription>Overview of your confirmed and past gigs.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Upcoming Gigs</h3>
              {mockArtistBookings.upcoming.length > 0 ? mockArtistBookings.upcoming.map(b => (
                <Card key={b.id} className="mb-3 p-3 bg-muted/30">
                  <p className="font-medium">{b.eventName} @ {b.venueName}</p>
                  <p className="text-sm text-muted-foreground">Date: {b.date}, {b.time}</p>
                  <p className="text-sm text-muted-foreground">Status: <span className="text-green-500">{b.status}</span> | Pay: {b.pay}</p>
                </Card>
              )) : <p className="text-sm text-muted-foreground">No upcoming gigs scheduled.</p>}
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Past Gigs</h3>
              {mockArtistBookings.past.length > 0 ? mockArtistBookings.past.map(b => (
                 <Card key={b.id} className="mb-3 p-3 bg-muted/20 opacity-80">
                  <p className="font-medium">{b.eventName} @ {b.venueName}</p>
                  <p className="text-sm text-muted-foreground">Date: {b.date}, {b.time}</p>
                  <p className="text-sm text-muted-foreground">Status: {b.status} | Pay: {b.pay}</p>
                </Card>
              )) : <p className="text-sm text-muted-foreground">No past gigs recorded.</p>}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Availability Tab Content Removed */}

      <TabsContent value="booking-requests">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center"><MailWarning className="mr-2 h-5 w-5 text-primary"/>Incoming Booking Requests</CardTitle>
            <CardDescription>Review and respond to booking inquiries from venues.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-6 bg-secondary/20 rounded-lg text-center">
              <p className="text-lg font-semibold text-muted-foreground">
                Booking Request Management - Coming Soon!
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                This is where you'll see requests from venues, negotiate terms, and confirm bookings.
              </p>
            </div>
             {/* Placeholder for list of requests */}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );

  const renderBuyerView = () => (
     <Tabs defaultValue="my-venue-bookings" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-4">
        <TabsTrigger value="my-venue-bookings">Venue Bookings</TabsTrigger>
        <TabsTrigger value="pending-requests">Requests to Artists</TabsTrigger>
      </TabsList>
       <TabsContent value="my-venue-bookings">
        <Card>
          <CardHeader>
            <CardTitle>Bookings at Your Venue</CardTitle>
            <CardDescription>Manage artists booked for your events.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
             <div>
              <h3 className="text-lg font-semibold mb-2">Upcoming Events</h3>
              {mockBuyerBookingRequests.filter(r => r.status !== "Pending Review").length > 0 ? 
                mockBuyerBookingRequests.filter(r => r.status !== "Pending Review").map(b => (
                 <Card key={b.id} className="mb-3 p-3 bg-muted/30">
                  <p className="font-medium">{b.eventName} ft. {b.djName}</p>
                  <p className="text-sm text-muted-foreground">Date: {b.date}</p>
                  <p className="text-sm text-muted-foreground">Status: <span className="text-green-500">Confirmed</span> | Agreed Pay: {b.proposedPay}</p>
                </Card>
                )) : <p className="text-sm text-muted-foreground">No upcoming events with confirmed DJs.</p>
              }
            </div>
             <Button asChild variant="outline">
                <Link href="/scheduling"><CalendarPlus className="mr-2 h-4 w-4"/> Schedule New Event / Artist</Link>
            </Button>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="pending-requests">
         <Card>
          <CardHeader>
            <CardTitle>Artist Booking Requests</CardTitle>
            <CardDescription>Track booking requests you've sent to artists.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
              {mockBuyerBookingRequests.filter(r => r.status === "Pending Review").length > 0 ? mockBuyerBookingRequests.filter(r => r.status === "Pending Review").map(b => (
                 <Card key={b.id} className="mb-3 p-3 bg-yellow-500/10">
                  <p className="font-medium">Request to {b.djName} for {b.eventName}</p>
                  <p className="text-sm text-muted-foreground">Date: {b.date} | Proposed Pay: {b.proposedPay}</p>
                  <p className="text-sm text-yellow-600">Status: {b.status}</p>
                  <div className="mt-2 flex gap-2">
                    <Button size="sm" variant="outline" disabled>Withdraw Request</Button>
                    <Button size="sm" variant="ghost" disabled>Send Reminder</Button>
                  </div>
                </Card>
                )) : <p className="text-sm text-muted-foreground">No pending requests to artists.</p>
              }
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );

  const renderGenericView = () => (
    <Card className="shadow-lg">
      <CardHeader className="text-center">
        <Briefcase className="h-16 w-16 text-primary mx-auto mb-4" />
        <CardTitle className="text-3xl">Manage Your Bookings</CardTitle>
        <CardDescription>
          View upcoming gigs, manage requests, and see your booking history.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="p-6 bg-secondary/20 rounded-lg text-center">
          <p className="text-lg font-semibold text-muted-foreground">
            Full Booking Management System Coming Soon!
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            This is where you'll manage all your gig details, accept or send booking requests, and keep track of your schedule.
          </p>
        </div>
      </CardContent>
    </Card>
  );
  
  return (
    <div className="space-y-8">
      {currentUserRole === "Artist" ? renderArtistView() : currentUserRole === "Buyer" ? renderBuyerView() : renderGenericView()}
    </div>
  );
}
