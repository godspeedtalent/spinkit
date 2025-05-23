
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users2, UserPlus } from "lucide-react";

const mockTeamMembers = [
  { id: "tm1", name: "Jane Doe", role: "General Manager", email: "jane@examplevenue.com" },
  { id: "tm2", name: "John Smith", role: "Booking Coordinator", email: "john@examplevenue.com" },
  { id: "tm3", name: "Alice Brown", role: "Marketing Lead", email: "alice@examplevenue.com" },
];

export default function VenueTeamPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <Users2 className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl">Team Management</CardTitle>
            </div>
            <CardDescription>
              Manage your venue's team members and their roles. (Placeholder)
            </CardDescription>
          </div>
          <Button variant="outline" disabled>
            <UserPlus className="mr-2 h-4 w-4" /> Invite Team Member
          </Button>
        </CardHeader>
        <CardContent>
          {mockTeamMembers.length > 0 ? (
            <div className="space-y-4">
              {mockTeamMembers.map((member) => (
                <Card key={member.id} className="p-4 bg-muted/30">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{member.name}</p>
                      <p className="text-sm text-muted-foreground">{member.role}</p>
                      <p className="text-xs text-muted-foreground">{member.email}</p>
                    </div>
                    <Button variant="ghost" size="sm" disabled>Edit</Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">No team members added yet.</p>
          )}
           <div className="mt-6 p-8 border-2 border-dashed border-muted rounded-lg text-center">
            <p className="text-lg font-semibold text-muted-foreground">Full Team Management Features Coming Soon</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
