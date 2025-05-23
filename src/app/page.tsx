
"use client";

import { useAuthStore } from "@/stores/authStore";
import AdminDashboard from "@/components/dashboard/admin-dashboard";
import BuyerDashboard from "@/components/dashboard/buyer-dashboard";
import ArtistDashboard from "@/components/dashboard/artist-dashboard"; // Renamed
import FanDashboard from "@/components/dashboard/fan-dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import CompactLoadingIndicator from "@/components/shared/CompactLoadingIndicator";

export default function DashboardPage() {
  const { currentUserRole, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <Card>
          <CardHeader>
            <CardTitle>Redirecting...</CardTitle>
            <CardDescription>Please log in to view the dashboard.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
             <CompactLoadingIndicator message="Redirecting..." iconSize="h-8 w-8" textSize="text-sm" />
          </CardContent>
        </Card>
      </div>
    );
  }
  
  switch (currentUserRole) {
    case "Admin":
      return <AdminDashboard />;
    case "Buyer":
      return <BuyerDashboard />;
    case "Artist": // Changed from "Seller"
      return <ArtistDashboard />;
    case "Fan":
      return <FanDashboard />;
    default: 
      return (
         <Card>
          <CardHeader>
            <CardTitle>Welcome to {process.env.NEXT_PUBLIC_APP_NAME || "SpinKit"}</CardTitle>
            <CardDescription>Your personalized dashboard experience.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Please select a role or log in to see more specific content.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              (Current Role: {currentUserRole})
            </p>
          </CardContent>
        </Card>
      );
  }
}
