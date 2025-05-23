"use client";

import React from 'react';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Database, AlertTriangle, ChevronDown } from 'lucide-react';
import WizardStepSection from './wizard-step-section';
import WizardStepNavigation from './wizard-step-navigation';
import type { DatabaseConnection } from '@/stores/databaseSettingsStore';
import { DATA_ENTITIES_KEYS, TARGET_MONGO_FIELDS_MAP, getEntityTypeLabel } from '@/config/data-import-config';

interface ImportTargetInfoStepProps {
  targetConnectionInfo: (DatabaseConnection & { collections: Record<string, string> }) | null;
  openCollectionStructures: string[];
  setOpenCollectionStructures: React.Dispatch<React.SetStateAction<string[]>>;
  onProceed: () => void;
  isLoading: boolean;
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
      stepNumber={1}
      title="Target Data Connection (MongoDB)"
      icon={Database}
      isLoading={isLoading}
      description="Information about the currently active MongoDB database connection where data will be imported."
    >
      {!targetConnectionInfo ? (
        <Alert variant="destructive" className="mt-2">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>No Active/Valid MongoDB Target Configured</AlertTitle>
          <AlertDescription className="text-xs">
            An active MongoDB connection with defined collections must be configured in Database Settings for import to proceed.
            <Link href="/admin/data-tools" className="underline ml-1">Configure now</Link>
          </AlertDescription>
        </Alert>
      ) : (
        <div className="text-xs space-y-2 mt-2">
          <p><strong>Name:</strong> {targetConnectionInfo.name}</p>
          <p><strong>Type:</strong> {targetConnectionInfo.type}</p>
          <p className="font-medium mt-2 mb-1">Target Collections & Expected Structure:</p>
          <div className="border rounded-md bg-background text-xs shadow-sm overflow-hidden">
            <div className="flex w-full px-3 py-2 border-b bg-muted/40 font-semibold text-muted-foreground rounded-t-md">
              <span className="w-[calc(50%-0.5rem)] text-left">Resource Type</span>
              <span className="w-[calc(50%-0.5rem)] text-left">Target Collection Name</span>
              <span className="w-4 shrink-0"></span>
            </div>
            <Accordion
              type="multiple"
              value={openCollectionStructures}
              onValueChange={setOpenCollectionStructures}
              className="w-full border-t-0"
            >
              {(Object.keys(targetConnectionInfo.collections) as Array<keyof typeof targetConnectionInfo.collections>)
                .sort((a, b) => getEntityTypeLabel(a).localeCompare(getEntityTypeLabel(b)))
                .map((key) => {
                  const collectionName = targetConnectionInfo.collections[key as keyof typeof targetConnectionInfo.collections];
                  if (!collectionName) return null;
                  const resourceTypeLabel = getEntityTypeLabel(key);
                  const fields = TARGET_MONGO_FIELDS_MAP[key as keyof typeof TARGET_MONGO_FIELDS_MAP] || [];
                  const structureExample = fields.reduce((acc: Record<string, string>, field: string) => ({ ...acc, [field]: `Sample ${field.replace(/([A-Z])/g, ' $1').trim()} value` }), {});

                  return (
                    <AccordionItem value={`${key}`} key={`structure-${key}`} className="border-b last:border-b-0">
                      <AccordionTrigger className="py-2 px-3 text-xs hover:no-underline hover:bg-muted/50 rounded-none [&>svg]:ml-2">
                        <div className="flex justify-between items-center w-full">
                          <span className="font-medium capitalize w-[calc(50%-0.5rem)] text-left" title={resourceTypeLabel}>{resourceTypeLabel}</span>
                          <code className="text-xs bg-muted/80 px-1.5 py-0.5 rounded-sm text-muted-foreground w-[calc(50%-0.5rem)] text-left truncate" title={collectionName}>{collectionName}</code>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-3 py-2 bg-popover border-t">
                        <p className="text-xs font-semibold text-muted-foreground">Expected JSON Structure ({fields.length} fields):</p>
                        <ScrollArea className="h-32 mt-1">
                          <pre className="text-[10px] p-2 bg-background rounded">{JSON.stringify(structureExample, null, 2)}</pre>
                          <ScrollBar orientation="vertical" />
                        </ScrollArea>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
            </Accordion>
          </div>
        </div>
      )}
      <WizardStepNavigation
        onNext={onProceed}
        isNextDisabled={!targetConnectionInfo || isLoading}
        nextLabel="Configure Source & Upload"
      />
    </WizardStepSection>
  );
};

export default ImportTargetInfoStep;