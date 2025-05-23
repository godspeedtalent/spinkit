
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Settings, MapPin, Code as CodeIcon, SlidersHorizontal } from 'lucide-react';
import AdminSettingsLayout, { type AdminSettingsNavSectionGroup } from '@/components/layout/admin-settings-layout';
import CitySettingsSection from '@/components/admin/system-config/city-settings-section';
import DevToolsSettingsSection from '@/components/admin/system-config/dev-tools-settings-section';

type SystemConfigSectionId = 'general' | 'city' | 'devTools';

export default function SystemConfigPage() {
  const [activeSectionId, setActiveSectionId] = useState<SystemConfigSectionId>('general');

  const systemConfigNavConfig: AdminSettingsNavSectionGroup[] = [
    {
      title: 'Configuration', // Grouping for consistency, can be removed if only one group
      icon: Settings, // Main icon for the group
      items: [
        { 
          id: 'general', 
          label: 'General Settings', 
          icon: Settings, 
          component: (
            <Card>
              <CardHeader><CardTitle>General System Settings</CardTitle><CardDescription>Global application configurations.</CardDescription></CardHeader>
              <CardContent><p className="text-muted-foreground">General settings will be configured here (e.g., site name, maintenance mode, default language).</p></CardContent>
            </Card>
          ) 
        },
        { 
          id: 'city', 
          label: 'City Parameters', 
          icon: MapPin, 
          component: <CitySettingsSection /> 
        },
        { 
          id: 'devTools', 
          label: 'Developer Tools', 
          icon: CodeIcon, 
          component: <DevToolsSettingsSection /> 
        },
      ],
    },
  ];

  const activeComponent = systemConfigNavConfig
    .flatMap(group => group.items)
    .find(item => item.id === activeSectionId)?.component;

  return (
    <AdminSettingsLayout
      pageTitle="System Configuration"
      pageIcon={SlidersHorizontal}
      navConfig={systemConfigNavConfig}
      activeSectionId={activeSectionId}
      setActiveSectionId={setActiveSectionId as (id: string) => void}
    >
      {activeComponent || <p>Select a section to configure.</p>}
    </AdminSettingsLayout>
  );
}
