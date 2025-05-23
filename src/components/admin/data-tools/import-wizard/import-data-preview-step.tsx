"use client";

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { ListChecks, Upload, Loader2 } from 'lucide-react';
import WizardStepSection from './wizard-step-section';
import WizardStepNavigation from './wizard-step-navigation';

interface ImportDataPreviewStepProps {
  transformedDataPreview: Record<string, any[]> | null;
  getDisplayValue: (record: any, columnKey: string, driverType?: string, isTransformedPreview?: boolean) => string | null | JSX.Element; // Added isTransformedPreview
  sourceDriver?: string | null; // To pass to getDisplayValue
  onConfirmImport: () => void;
  onBackToColumnMapping: () => void;
  isImporting: boolean;
}

const ImportDataPreviewStep: React.FC<ImportDataPreviewStepProps> = ({
  transformedDataPreview,
  getDisplayValue,
  sourceDriver,
  onConfirmImport,
  onBackToColumnMapping,
  isImporting,
}) => {
  if (!transformedDataPreview) {
    return <p className="text-muted-foreground p-4 text-center">Preview not generated. Please apply column mappings.</p>;
  }

  const targetTablesWithPreview = Object.keys(transformedDataPreview).filter(key => transformedDataPreview[key]?.length > 0);

  return (
    <WizardStepSection
      stepNumber={6}
      title="Pre-Import Data Preview"
      icon={ListChecks}
      description="Review a sample of how your data will look after column mappings are applied. This shows transformed records for each target collection."
    >
      {targetTablesWithPreview.length > 0 ? (
        <Tabs defaultValue={targetTablesWithPreview[0]} className="w-full">
          <ScrollArea className="whitespace-nowrap border-b">
            <TabsList className="grid w-auto grid-flow-col">
              {targetTablesWithPreview.map(targetCollectionName => (
                <TabsTrigger key={`previewtrigger-${targetCollectionName}`} value={targetCollectionName} className="text-xs truncate px-3">
                  {targetCollectionName}
                </TabsTrigger>
              ))}
            </TabsList>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
          {Object.entries(transformedDataPreview).map(([targetCollectionName, records]) => {
            if (!records || records.length === 0) return (
              <TabsContent key={`previewcontent-empty-${targetCollectionName}`} value={targetCollectionName} className="mt-2">
                <p className="p-4 text-xs text-muted-foreground text-center">No records to preview for target collection: {targetCollectionName}.</p>
              </TabsContent>
            );
            const columnsToDisplay = records[0] ? Object.keys(records[0]).sort((a, b) => a.localeCompare(b)) : [];
            return (
              <TabsContent key={`previewcontent-${targetCollectionName}`} value={targetCollectionName} className="mt-2">
                <div className="p-2 border-b bg-muted/30 rounded-t-md">
                  <p className="text-sm">Preview for target: <strong>{targetCollectionName}</strong> (Showing {records.length} sample transformed records)</p>
                </div>
                {columnsToDisplay.length > 0 ? (
                  <ScrollArea className="h-[400px] w-full border rounded-b-md">
                    <div className="overflow-x-auto">
                      <Table className="min-w-max text-xs">
                        <TableHeader>
                          <TableRow>
                            {columnsToDisplay.map(col => <TableHead key={`th-preview-${col}`} className="p-1.5 h-8 truncate whitespace-nowrap">{col}</TableHead>)}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {records.map((record, recIndex) => (
                            <TableRow key={`rec-preview-${targetCollectionName}-${recIndex}`}>
                              {columnsToDisplay.map(col => {
                                // Use getDisplayValue, passing true for isTransformedPreview
                                const displayVal = getDisplayValue(record, col, sourceDriver || undefined, true);
                                return (
                                  <TableCell key={`td-preview-${col}-${recIndex}`} className="p-1.5 truncate max-w-[150px] whitespace-nowrap" title={typeof record[col] === 'object' ? JSON.stringify(record[col]) : String(record[col])}>
                                    {displayVal === null ? <span className="italic text-muted-foreground/70">Empty</span> : displayVal}
                                  </TableCell>
                                );
                              })}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <ScrollBar orientation="horizontal" />
                  </ScrollArea>
                ) : (
                  <p className="p-4 text-xs text-muted-foreground text-center border rounded-b-md">No columns to display for this collection's preview.</p>
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-4">No data available for preview. Mappings might be incomplete or resulted in no importable data.</p>
      )}
      <WizardStepNavigation
        onBack={onBackToColumnMapping}
        isBackDisabled={isImporting}
        onNext={onConfirmImport}
        isNextDisabled={isImporting || !transformedDataPreview || Object.keys(transformedDataPreview).length === 0}
        isLoadingNext={isImporting}
        nextLabel={isImporting ? "Importing..." : "Confirm and Start Import"}
        nextIcon={isImporting ? Loader2 : Upload}
      />
    </WizardStepSection>
  );
};

export default ImportDataPreviewStep;