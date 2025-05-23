
"use client";

import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from '@/components/ui/scroll-area';
import { TARGET_MONGO_FIELDS_MAP, DO_NOT_IMPORT_VALUE, CREATE_NEW_FIELD_VALUE, NEW_FIELD_TYPE_OPTIONS, getEntityTypeLabel } from '@/config/data-import-config';
import type { DatabaseConnection } from '@/stores/databaseSettingsStore'; // For targetConnectionInfo type
import WizardStepSection from './WizardStepSection';
import WizardStepNavigation from './WizardStepNavigation';
import { ListChecks, RefreshCw, CheckCircle, Loader2 } from 'lucide-react';

interface ImportColumnMappingStepProps {
  mappedSourceTables: string[];
  tableMappings: Record<string, string>;
  sourceTableColumns: Record<string, string[]>;
  columnMappings: Record<string, Record<string, string>>;
  newFieldTypes: Record<string, Record<string, string>>;
  targetConnectionInfo: (DatabaseConnection & { collections: Record<string, string> }) | null;
  handleColumnMappingChange: (sourceTable: string, sourceColumn: string, targetFieldValue: string) => void;
  handleNewFieldTypeChange: (sourceTable: string, sourceColumn: string, newType: string) => void;
  onApplyAndPreview: () => void;
  onBackToTableMapping: () => void;
  onResetColumnMappings: () => void;
  isProcessingMappings: boolean;
}

const ImportColumnMappingStep: React.FC<ImportColumnMappingStepProps> = ({
  mappedSourceTables,
  tableMappings,
  sourceTableColumns,
  columnMappings,
  newFieldTypes,
  targetConnectionInfo,
  handleColumnMappingChange,
  handleNewFieldTypeChange,
  onApplyAndPreview,
  onBackToTableMapping,
  onResetColumnMappings,
  isProcessingMappings,
}) => {
  if (!mappedSourceTables || mappedSourceTables.length === 0) {
    return <p className="text-muted-foreground p-4 text-center">No tables mapped for column configuration. Please complete Table Mapping in Step 3.</p>;
  }

  return (
    <WizardStepSection
      stepNumber={4}
      title="Map Columns for Import"
      icon={ListChecks}
      description="For each table selected for import, map its source columns to the target MongoDB fields. You can choose to 'Do Not Import' a column or 'Create New Target Field' if needed."
    >
      <div className="flex justify-end mb-3">
        <Button variant="outline" size="xs" onClick={onResetColumnMappings} className="text-xs" disabled={isProcessingMappings}>
          <RefreshCw className="mr-1.5 h-3 w-3" /> Reset All Column Mappings
        </Button>
      </div>

      <Tabs defaultValue={mappedSourceTables[0]} className="w-full">
        <ScrollArea className="whitespace-nowrap border-b">
          <TabsList className="grid w-auto grid-flow-col">
            {mappedSourceTables.map((sourceTable) => (
              <TabsTrigger key={`colmaptrigger-${sourceTable}`} value={sourceTable} className="text-xs truncate px-3">
                {sourceTable}
              </TabsTrigger>
            ))}
          </TabsList>
        </ScrollArea>
        {mappedSourceTables.map((sourceTable) => {
          const targetCollectionName = tableMappings[sourceTable];
          const currentTargetResourceKey = targetConnectionInfo?.collections
            ? (Object.keys(targetConnectionInfo.collections) as Array<keyof typeof targetConnectionInfo.collections>)
              .find(key => targetConnectionInfo.collections[key as keyof typeof targetConnectionInfo.collections] === targetCollectionName)
            : undefined;
          const currentTargetFields = currentTargetResourceKey
            ? (TARGET_MONGO_FIELDS_MAP[currentTargetResourceKey as keyof typeof TARGET_MONGO_FIELDS_MAP] || []).sort()
            : [];
          const currentSourceColumns = sourceTableColumns[sourceTable] || [];

          return (
            <TabsContent key={`colmapcontent-${sourceTable}`} value={sourceTable} className="mt-2">
              <Card className="shadow-inner bg-background">
                <CardHeader className="p-3 border-b bg-muted/30">
                  <h4 className="text-sm font-semibold">
                    Map columns for: <strong className="text-primary">{sourceTable}</strong> &rarr; <strong className="text-primary">{targetCollectionName}</strong>
                    {currentTargetResourceKey && (
                      <span className="text-xs text-muted-foreground ml-1">({getEntityTypeLabel(currentTargetResourceKey)})</span>
                    )}
                  </h4>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="max-h-72 pr-1"> {/* Adjusted for scrollbar */}
                    <div className="p-3 space-y-1.5">
                      {currentSourceColumns.length > 0 ? currentSourceColumns.map(srcCol => (
                        <div key={`${sourceTable}-${srcCol}`} className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 items-start py-2 border-b last:border-b-0">
                          <Label htmlFor={`colmap-${sourceTable}-${srcCol}`} className="text-xs font-medium truncate pt-1.5" title={srcCol}>
                            Source: <span className="font-normal text-foreground">{srcCol}</span>
                          </Label>
                          <div className="space-y-1">
                            <Select
                              value={columnMappings[sourceTable]?.[srcCol] || DO_NOT_IMPORT_VALUE}
                              onValueChange={(value) => handleColumnMappingChange(sourceTable, srcCol, value)}
                              disabled={isProcessingMappings}
                            >
                              <SelectTrigger id={`colmap-${sourceTable}-${srcCol}`} className="h-8 text-xs hover:bg-accent hover:text-accent-foreground">
                                <SelectValue placeholder="Select target field..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value={DO_NOT_IMPORT_VALUE} className="text-xs italic">Do Not Import This Column</SelectItem>
                                <SelectItem value={CREATE_NEW_FIELD_VALUE} className="text-xs text-primary">Create New Target Field...</SelectItem>
                                {currentTargetFields.map(field => (
                                  <SelectItem key={`${sourceTable}-${srcCol}-tgt-${field}`} value={field} className="text-xs">{field}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {columnMappings[sourceTable]?.[srcCol] === CREATE_NEW_FIELD_VALUE && (
                              <Select
                                value={newFieldTypes[sourceTable]?.[srcCol] || ""}
                                onValueChange={(value) => handleNewFieldTypeChange(sourceTable, srcCol, value)}
                                disabled={isProcessingMappings}
                              >
                                <SelectTrigger className="h-8 text-xs mt-1 bg-background/70 hover:bg-accent hover:text-accent-foreground">
                                  <SelectValue placeholder="Select new field type..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {NEW_FIELD_TYPE_OPTIONS.map(type => (
                                    <SelectItem key={`${sourceTable}-${srcCol}-newtype-${type}`} value={type} className="text-xs">{type}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          </div>
                        </div>
                      )) : <p className="text-xs text-muted-foreground py-2 text-center">No source columns detected for this table.</p>}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>
      <WizardStepNavigation
        onBack={onBackToTableMapping}
        isBackDisabled={isProcessingMappings}
        onNext={onApplyAndPreview}
        isLoadingNext={isProcessingMappings}
        isNextDisabled={isProcessingMappings || mappedSourceTables.length === 0}
        nextLabel={isProcessingMappings ? "Applying..." : "Apply Mappings & Preview Data"}
        nextIcon={isProcessingMappings ? Loader2 : CheckCircle}
      />
    </WizardStepSection>
  );
};

export default ImportColumnMappingStep;
