
"use client";

import React, { useState, useEffect, useMemo } from 'react'; // Added useMemo
import { Database, UploadCloud, DownloadCloud, History, ServerCog, ArrowRightLeft as TransferIcon, FileCode as GenerateIcon, ListChecks } from 'lucide-react';
import AdminSettingsLayout, { type AdminSettingsNavSectionGroup } from '@/components/layout/admin-settings-layout';
import DatabaseSettingsSection from '@/components/admin/data-tools/database-settings-section';
import ExportDataSection from '@/components/admin/data-tools/export-data-section';
import ImportDataSection from '@/components/admin/data-tools/import-data-section';
import OperationHistorySection from '@/components/admin/data-tools/operation-history-section';
import GenerateScriptsSection from '@/components/admin/data-tools/generate-scripts-section';
import CompactLoadingIndicator from '@/components/shared/CompactLoadingIndicator';
import CollectionSettingsSection from '@/components/admin/data-tools/collection-settings-section'; 
import MigrationSection from '@/components/admin/data-tools/migration-section';

type DataToolSectionId = 'databaseSettings' | 'collectionSettings' | 'generateScripts' | 'migration' | 'import' | 'export' | 'history';

export default function DataToolsPage() {
  const [activeSectionId, setActiveSectionId] = useState<DataToolSectionId>('databaseSettings');
  const [isSectionContentLoading, setIsSectionContentLoading] = useState(false);

  const adminDataToolsNavConfig: AdminSettingsNavSectionGroup[] = useMemo(() => [
    {
      title: 'Settings',
      icon: ServerCog,
      items: [
        { 
          id: 'databaseSettings', 
          label: 'Database Connections',
          icon: Database, 
          component: <DatabaseSettingsSection />, 
        },
        {
          id: 'collectionSettings',
          label: 'Collections & Schema',
          icon: ListChecks,
          component: <CollectionSettingsSection />
        }
      ]
    },
    { 
      title: 'Generate',
      icon: GenerateIcon,
      items: [
        { 
          id: 'generateScripts', 
          label: 'Scripts', 
          icon: GenerateIcon,
          component: <GenerateScriptsSection />,
        },
      ]
    },
    {
      title: 'Transfer',
      icon: TransferIcon,
      items: [
        {
          id: 'migration',
          label: 'Data Migration',
          icon: TransferIcon,
          component: <MigrationSection />
        },
        { 
          id: 'import', 
          label: 'Import Data', 
          icon: DownloadCloud,
          component: <ImportDataSection />,
        },
        { 
          id: 'export', 
          label: 'Export Data', 
          icon: UploadCloud, 
          component: <ExportDataSection />, 
        },
      ]
    },
    {
      title: 'Logging',
      icon: History,
      items: [
        { 
          id: 'history', 
          label: 'Operation History', 
          icon: History, 
          component: <OperationHistorySection />,
        },
      ]
    }
  ], []); // Empty dependency array because the config is static
  
  useEffect(() => {
    const sectionToLoad = adminDataToolsNavConfig
      .flatMap(group => group.items)
      .find(item => item.id === activeSectionId);

    // Adjusted the condition to only show loading for import, collection settings, and generate scripts
    if (sectionToLoad?.id === 'import' || sectionToLoad?.id === 'collectionSettings' || sectionToLoad?.id === 'generateScripts') {
      setIsSectionContentLoading(true);
      const timer = setTimeout(() => {
        setIsSectionContentLoading(false);
      }, 500); 
      return () => clearTimeout(timer);
    } else {
      setIsSectionContentLoading(false);
    }
  }, [activeSectionId, adminDataToolsNavConfig]);


  // Find the component for the active section
  const ActiveComponent = adminDataToolsNavConfig
    .flatMap(group => group.items)
    .find(item => item.id === activeSectionId)?.component || <p>Select a tool to configure.</p>;

  return (
    <AdminSettingsLayout
      pageTitle="Data Management"
      pageIcon={Database}
      navConfig={adminDataToolsNavConfig}
      activeSectionId={activeSectionId}
      setActiveSectionId={setActiveSectionId as (id: string) => void}
    >
      {isSectionContentLoading ? (
        <CompactLoadingIndicator message={`Loading ${adminDataToolsNavConfig.flatMap(g => g.items).find(i => i.id === activeSectionId)?.label || 'section'}...`} />
      ) : (
        ActiveComponent
      )}
    </AdminSettingsLayout>
  );
}
