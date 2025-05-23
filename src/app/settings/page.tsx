
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Settings as SettingsIconLucide, UserCircle, Bell, MessageSquare, Shield, Trash2, UserX, Edit3, Settings2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/stores/authStore";
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import Link from 'next/link';

type SettingsSectionId = 'profile' | 'notifications' | 'messaging' | 'security' | 'dangerZone';

interface NavLinkProps {
  label: string;
  sectionId: SettingsSectionId;
  activeSection: SettingsSectionId;
  setActiveSection: (section: SettingsSectionId) => void;
  icon: React.ElementType;
  disabled?: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({ label, sectionId, activeSection, setActiveSection, icon: Icon, disabled }) => {
  return (
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start text-base py-6",
        activeSection === sectionId && "bg-accent text-accent-foreground font-semibold",
        disabled && "opacity-50 cursor-not-allowed"
      )}
      onClick={() => !disabled && setActiveSection(sectionId)}
      disabled={disabled}
    >
      <Icon className="mr-3 h-5 w-5" />
      {label}
    </Button>
  );
};

export default function SettingsPage() {
  const { toast } = useToast();
  const { currentUserRole } = useAuthStore(); 
  const [activeSection, setActiveSection] = useState<SettingsSectionId>('profile');
  const [deleteConfirmStep, setDeleteConfirmStep] = useState(0);
  const [deleteInput, setDeleteInput] = useState("");

  const isVenueOrArtist = currentUserRole === 'Buyer' || currentUserRole === 'Artist'; // Changed from Seller

  const handleDeleteAccount = () => {
    if (deleteInput.toUpperCase() === "DELETE") {
      toast({
        title: "Account Deletion Initiated (Mock)",
        description: "Your account is scheduled for deletion. For now, it's just a simulation.",
        variant: "destructive"
      });
      setDeleteConfirmStep(0);
      setDeleteInput("");
    } else {
      toast({
        title: "Incorrect Confirmation",
        description: "Please type 'DELETE' to confirm account deletion.",
        variant: "destructive"
      });
    }
  };

  const sections: Array<{ id: SettingsSectionId; label: string; icon: React.ElementType; component: React.ReactNode; disabled?: boolean }> = [
    {
      id: 'profile', label: 'Profile Information', icon: UserCircle,
      component: (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center"><UserCircle className="mr-2 h-6 w-6 text-primary" /> Profile Information</CardTitle>
            <CardDescription>Basic profile details like your name, email, and bio.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-3">
              Manage your personal details on the edit profile page.
            </p>
            <Button asChild variant="outline">
              <Link href="/profile/edit"><Edit3 className="mr-2 h-4 w-4"/> Go to Edit Profile</Link>
            </Button>
          </CardContent>
        </Card>
      )
    },
    {
      id: 'notifications', label: 'Notifications', icon: Bell,
      component: (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center"><Bell className="mr-2 h-6 w-6 text-primary" /> Notification Preferences</CardTitle>
            <CardDescription>Choose how you receive alerts from SpinKit.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
              <Label htmlFor="email-notifications" className="text-base flex-1">Email Notifications</Label>
              <Switch id="email-notifications" defaultChecked disabled />
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
              <Label htmlFor="gig-alerts" className="text-base flex-1">New Gig Alerts (for Artists)</Label> {/* Changed from DJs */}
              <Switch id="gig-alerts" disabled />
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
              <Label htmlFor="message-notifications" className="text-base flex-1">New Message Notifications</Label>
              <Switch id="message-notifications" defaultChecked disabled />
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">Notification settings are currently placeholders.</p>
          </CardContent>
        </Card>
      )
    },
    {
      id: 'messaging', label: 'Messaging', icon: MessageSquare, disabled: !isVenueOrArtist,
      component: isVenueOrArtist ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center"><MessageSquare className="mr-2 h-6 w-6 text-primary" /> Messaging Preferences</CardTitle>
            <CardDescription>Control who can message you and how.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
              <div className="flex-1">
                <Label htmlFor="allow-fan-messages" className="text-base">Allow Messages from Fans</Label>
                <p className="text-xs text-muted-foreground">Control whether music fans can initiate conversations with you.</p>
              </div>
              <Switch id="allow-fan-messages" defaultChecked />
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
              <div className="flex-1">
                <Label htmlFor="auto-reply" className="text-base">Enable Auto-Reply (Placeholder)</Label>
                 <p className="text-xs text-muted-foreground">Set up an automated response for new messages.</p>
              </div>
              <Switch id="auto-reply" disabled />
            </div>
          </CardContent>
        </Card>
      ) : null
    },
    {
      id: 'security', label: 'Account Security', icon: Shield,
      component: (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center"><Shield className="mr-2 h-6 w-6 text-primary" /> Account Security</CardTitle>
            <CardDescription>Manage your password and two-factor authentication.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full" disabled>Change Password (Placeholder)</Button>
            <Button variant="outline" className="w-full" disabled>Enable Two-Factor Authentication (Placeholder)</Button>
          </CardContent>
        </Card>
      )
    },
    {
      id: 'dangerZone', label: 'Danger Zone', icon: UserX,
      component: (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-xl flex items-center text-destructive"><UserX className="mr-2 h-6 w-6" /> Danger Zone</CardTitle>
          </CardHeader>
          <CardContent className="bg-destructive/10 p-4 rounded-b-md">
            <div className="text-destructive/80 mb-2">
              <p className="font-semibold">Delete Account</p>
              <p className="text-xs">Permanently delete your account and all associated data. This action is irreversible.</p>
            </div>
            <AlertDialog onOpenChange={(open) => { if(!open) { setDeleteConfirmStep(0); setDeleteInput("");}}}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full sm:w-auto">
                  <Trash2 className="mr-2 h-4 w-4" /> Delete My Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                {deleteConfirmStep === 0 && (
                <>
                  <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your account
                    and remove your data from our servers (simulated).
                  </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setDeleteConfirmStep(0)}>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => setDeleteConfirmStep(1)} className="bg-destructive hover:bg-destructive/90">Continue</AlertDialogAction>
                  </AlertDialogFooter>
                </>
                )}
                {deleteConfirmStep === 1 && (
                <>
                  <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                  <AlertDialogDescription>
                    To confirm, please type "DELETE" in the box below.
                  </AlertDialogDescription>
                  </AlertDialogHeader>
                  <Input 
                    value={deleteInput}
                    onChange={(e) => setDeleteInput(e.target.value)}
                    placeholder="DELETE"
                    className="my-2 border-destructive focus-visible:ring-destructive"
                  />
                  <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => { setDeleteConfirmStep(0); setDeleteInput(""); }}>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive hover:bg-destructive/90" disabled={deleteInput.toUpperCase() !== "DELETE"}>
                    Delete Account
                  </AlertDialogAction>
                  </AlertDialogFooter>
                </>
                )}
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      )
    },
  ];

  const currentSectionDetails = sections.find(sec => sec.id === activeSection);

  return (
    <div className="flex flex-col md:flex-row gap-8 h-full">
      <nav className="md:w-64 lg:w-72 shrink-0 md:border-r md:pr-6 space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight mb-4 px-2 flex items-center">
          <Settings2 className="mr-3 h-6 w-6 text-primary" /> Account Settings
        </h2>
        {sections.map((section) => (
          section.component && ( 
            <NavLink
              key={section.id}
              label={section.label}
              sectionId={section.id}
              activeSection={activeSection}
              setActiveSection={setActiveSection}
              icon={section.icon}
              disabled={section.disabled}
            />
          )
        ))}
      </nav>

      <div className="flex-1 min-w-0">
        {currentSectionDetails ? currentSectionDetails.component : <p>Select a settings section.</p>}
      </div>
    </div>
  );
}
