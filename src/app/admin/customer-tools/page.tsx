
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, Briefcase, Building2, MessageCircle, UserCog } from 'lucide-react'; 
import AdminSettingsLayout, { type AdminSettingsNavSectionGroup } from '@/components/layout/admin-settings-layout';
import AddVenueSection from '@/components/admin/customer-tools/add-venue-section';

type CustomerToolSectionId = 'addVenue' | 'userManagement' | 'communication';

export default function CustomerToolsPage() {
  const [activeSectionId, setActiveSectionId] = useState<CustomerToolSectionId>('addVenue');

  const customerToolsNavConfig: AdminSettingsNavSectionGroup[] = [
    {
      title: 'Onboarding',
      icon: Briefcase,
      items: [
        { 
          id: 'addVenue', 
          label: 'Add Venue', 
          icon: Building2, 
          component: <AddVenueSection /> 
        },
      ],
    },
    {
      title: 'Management',
      icon: UserCog,
      items: [
        { 
          id: 'userManagement', 
          label: 'User Management', 
          icon: Users, 
          component: (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center"><Users className="mr-2 h-5 w-5 text-primary"/>User Management</CardTitle>
                <CardDescription>Manage user accounts, roles, and permissions.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Features for viewing all users, editing roles, suspending accounts, and other user administration tasks will be available here. (TBD)
                </p>
              </CardContent>
            </Card>
          ), 
        },
      ]
    },
    {
      title: 'Communication',
      icon: MessageCircle,
      items: [
        { 
          id: 'communication', 
          label: 'Communication Tools', 
          icon: MessageCircle, 
          component: (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center"><MessageCircle className="mr-2 h-5 w-5 text-primary"/>Communication Tools</CardTitle>
                <CardDescription>Tools for system-wide announcements or targeted user messaging.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Functionality to send platform announcements, manage support tickets, or broadcast messages to specific user groups will be implemented here. (TBD)
                </p>
              </CardContent>
            </Card>
          ), 
        },
      ]
    }
  ];

  const activeComponent = customerToolsNavConfig
    .flatMap(group => group.items)
    .find(item => item.id === activeSectionId)?.component;

  return (
    <AdminSettingsLayout
      pageTitle="Customer Tools"
      pageIcon={Users}
      navConfig={customerToolsNavConfig}
      activeSectionId={activeSectionId}
      setActiveSectionId={setActiveSectionId as (id: string) => void}
    >
      {activeComponent || <p>Select a tool to configure.</p>}
    </AdminSettingsLayout>
  );
}
