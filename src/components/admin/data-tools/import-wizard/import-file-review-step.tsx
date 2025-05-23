"use client";

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, FileText, XCircle } from 'lucide-react';
import WizardStepSection from './wizard-step-section';
import WizardStepNavigation from './wizard-step-navigation';
import type { StagedDataFormat } from './import-wizard-utils'; // Adjust path as needed

interface ImportFileReviewStepProps {
  uploadedFile: File | null;
  stagedData: StagedDataFormat | null;
  sourceTableNames: string[];
  getDisplayValue: (record: any, columnKey: string, driverType?: string) => string | null | JSX.Element;
  onProceedToTableMapping: () => void;
  onBackToUpload: () => void;
}

const ImportFileReviewStep: React.FC<ImportFileReviewStepProps> = ({
  uploadedFile,
  stagedData,
  sourceTableNames,
  getDisplayValue,
  onProceedToTableMapping,
  onBackToUpload,
}) => {
  if (!stagedData || !uploadedFile) {
    return <p className="text-muted-foreground p-4 text-center">File not staged. Please complete the upload step.</p>;
  }

  return (
    <WizardStepSection
      stepNumber={3}
      title="Uploaded File - Review Staged Data"
      icon={FileText}
      description="Review the structure and a sample of records from your uploaded file."
    >
      <Alert variant="default" className="text-xs mb-3">
        <Info className="h-4 w-4" />
        <AlertTitle className="font-semibold">Uploaded File Summary</AlertTitle>
        <p><strong>File Name:</strong> {uploadedFile.name}</p>
        <p><strong>Detected Driver/Format:</strong> {stagedData.driverInfo || stagedData.driver || 'N/A'}</p>
        <p><strong>Databases/Tables Found:</strong> {sourceTableNames.length}</p>
        <p className="mt-1">Previewing up to 5 sample records per table/database that are at least 75% complete (or first few if none meet criteria).</p>
      </Alert>

      {sourceTableNames.length > 0 && stagedData.payload ? (
        <Tabs defaultValue={sourceTableNames[0]} className="w-full">
          <ScrollArea className="whitespace-nowrap border-b">
            <TabsList className="grid w-auto grid-flow-col">
              {sourceTableNames.map(tableName => (
                <TabsTrigger key={`tabtrigger-${tableName}`} value={tableName} className="text-xs truncate px-3">
                  {stagedData.payload.find(p => (p.name || p.databaseName) === tableName)?.name ||
                   stagedData.payload.find(p => (p.name || p.databaseName) === tableName)?.databaseName ||
                   tableName}
                </TabsTrigger>
              ))}
            </TabsList>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
          {sourceTableNames.map(tableName => {
            const tablePayloadItem = stagedData.payload.find(p => (p.name || p.databaseName) === tableName);
            const recordsToPreview = tablePayloadItem?.previewRecords || [];
            const columnsForTable = (tablePayloadItem?.records && tablePayloadItem.records.length > 0)
              ? Object.keys(stagedData.driver === 'notion' || stagedData.driver === 'notion_template'
                  ? tablePayloadItem.records[0].properties || {}
                  : tablePayloadItem.records[0] || {}
                ).filter(col => !(stagedData.driver === 'notion' || stagedData.driver === 'notion_template') || !['button', 'rollup', 'relation'].includes(String(tablePayloadItem.records[0]?.properties?.[col]?.type).toLowerCase()))
                .sort()
              : [];

            return (
              <TabsContent key={`tabcontent-${tableName}`} value={tableName} className="mt-2">
                <div className="p-2 border-b bg-muted/30 rounded-t-md">
                  <p className="text-sm">Preview for: <strong>{tablePayloadItem?.name || tablePayloadItem?.databaseName || tableName}</strong> (Showing {recordsToPreview.length} of {tablePayloadItem?.records?.length || 0} total records)</p>
                </div>
                {recordsToPreview.length > 0 && columnsForTable.length > 0 ? (
                  <ScrollArea className="h-[400px] w-full border rounded-b-md">
                    <div className="overflow-x-auto">
                      <Table className="min-w-max text-xs">
                        <TableHeader>
                          <TableRow>
                            {columnsForTable.map(col => <TableHead key={col} className="p-1.5 h-8 truncate whitespace-nowrap">{col}</TableHead>)}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {recordsToPreview.map((record, recIndex) => (
                            <TableRow key={`rec-${tableName}-${recIndex}`}>
                              {columnsForTable.map(col => {
                                const displayVal = getDisplayValue(record, col, stagedData?.driver);
                                return (
                                  <TableCell key={`${col}-${recIndex}`} className="p-1.5 truncate max-w-[150px] whitespace-nowrap" title={typeof displayVal === 'string' ? displayVal : String(displayVal)}>
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
                  <p className="p-4 text-xs text-muted-foreground text-center border rounded-b-md">No records to preview for this table, or no columns detected.</p>
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-4">No tables found in the staged file to preview.</p>
      )}
      <WizardStepNavigation
        onBack={onBackToUpload}
        onNext={onProceedToTableMapping}
        isNextDisabled={sourceTableNames.length === 0}
        nextLabel="Proceed to Table Mapping"
      />
    </WizardStepSection>
  );
};

export default ImportFileReviewStep;