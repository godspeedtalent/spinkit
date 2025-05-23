"use client";

import React from 'react';
import Link from 'next/link';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Database, AlertTriangle, ChevronDown, Loader2 } from 'lucide-react';
import WizardStepSection from './WizardStepSection';
import WizardStepNavigation from './WizardStepNavigation';
import type { DatabaseConnection } from '@/stores/databaseSettingsStore';
import { DATA_ENTITIES_KEYS, TARGET_MONGO_FIELDS_MAP, getEntityTypeLabel } from '@/config/data-import-config';

interface ImportTargetInfoStepProps {
  targetConnectionInfo: (DatabaseConnection & { collections: Record<string, string> }) | null;
  openCollectionStructures: string[];
  setOpenCollectionStructures: React.Dispatch<React.SetStateAction<string[]>>;
  onProceed: () => void;
  isLoading: boolean; // True if connections are being fetched/evaluated
}

const ImportTargetInfoStep: React.FC<ImportTargetInfoStepProps> = ({
  targetConnectionInfo,
  openCollectionStructures,
  setOpenCollectionStructures,
  onProceed,
  isLoading,
}) => {

  return (
    <WizardStepSection
      title="Target Data Connection (MongoDB)"
      icon={Database}
      isLoading={isLoading && !targetConnectionInfo}
      description="Verify the active MongoDB connection and its collection schema where data will be imported."
    >
      {!targetConnectionInfo && !isLoading && (
        <Alert variant="destructive" className="mt-2">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>No Active/Valid MongoDB Target Configured</AlertTitle>
          <AlertDescription className="text-xs">
            An active MongoDB connection with defined collections must be configured in Database Settings for import to proceed.
            <Link href="/admin/data-tools" className="underline ml-1 font-semibold hover:text-destructive/80">
              Configure Database Settings
            </Link>
          </AlertDescription>
        </Alert>
      )}

      {targetConnectionInfo && (
        <div className="text-xs space-y-3 mt-2">
          <div className="p-3 border rounded-md bg-background shadow-sm">
            <p><strong>Name:</strong> {targetConnectionInfo.name}</p>
            <p><strong>Type:</strong> {targetConnectionInfo.type}</p>
          </div>

          <div className="border rounded-md bg-background text-xs shadow-sm overflow-hidden">
            <div className="flex w-full px-3 py-2 border-b bg-muted/40 font-semibold text-muted-foreground rounded-t-md items-center">
              <span className="w-[calc(40%-0.5rem)] text-left">Resource Type</span>
              <span className="w-[calc(40%-0.5rem)] text-left">Target Collection Name</span>
              <span className="w-[calc(20%-0.5rem)] text-right">Fields</span>
              <span className="w-4 shrink-0 ml-auto"></span> {/* Spacer for accordion chevron */}
            </div>
            <Accordion
              type="multiple"
              value={openCollectionStructures}
              onValueChange={setOpenCollectionStructures}
              className="w-full border-t-0"
            >
              {DATA_ENTITIES_KEYS.map((key) => {
                const entityKey = key as keyof typeof TARGET_MONGO_FIELDS_MAP;
                const collectionName = targetConnectionInfo.collections?.[entityKey];
                if (!collectionName) return null;

                const resourceTypeLabel = getEntityTypeLabel(entityKey);
                const fields = TARGET_MONGO_FIELDS_MAP[entityKey] || [];
                const structureExample = fields.reduce((acc: Record<string, string>, field: string) => ({ ...acc, [field]: `Sample ${field.replace(/([A-Z])/g, ' $1').trim()} value` }), {});

                return (
                  <AccordionItem value={entityKey} key={`structure-${entityKey}`} className="border-b last:border-b-0">
                    <AccordionTrigger className="py-2 px-3 text-xs hover:no-underline hover:bg-muted/50 rounded-none">
                       <div className="flex justify-between items-center w-full">
                        <span className="font-medium capitalize w-[calc(40%-0.5rem)] text-left truncate" title={resourceTypeLabel}>{resourceTypeLabel}</span>
                        <code className="text-xs bg-muted/80 px-1.5 py-0.5 rounded-sm text-muted-foreground w-[calc(40%-0.5rem)] text-left truncate" title={collectionName}>{collectionName}</code>
                        <span className="text-xs text-muted-foreground w-[calc(20%-0.5rem)] text-right">{fields.length} fields</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-3 py-2 bg-popover border-t">
                      <p className="text-xs font-semibold text-muted-foreground">Expected JSON Structure (for records in this collection):</p>
                      <ScrollArea className="h-32 mt-1 bg-background p-2 rounded border">
                        <pre className="text-[10px]">{JSON.stringify(structureExample, null, 2)}</pre>
                      </ScrollArea>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </div>
        </div>
      )}

      {isLoading && !targetConnectionInfo && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
          <span className="text-sm text-muted-foreground">Verifying target connection...</span>
        </div>
      )}
      
      <WizardStepNavigation
        onNext={onProceed}
        isNextDisabled={!targetConnectionInfo || isLoading}
        nextLabel="Next: Configure Source & Upload"
      />
      {!targetConnectionInfo && !isLoading && (
        <p className="text-xs text-destructive mt-2 text-center">
          Cannot proceed. Please ensure an active MongoDB connection with defined collections is configured in Database Settings.
        </p>
      )}
    </WizardStepSection>
  );
};

export default ImportTargetInfoStep;
