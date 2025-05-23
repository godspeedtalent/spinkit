"use client";

import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ListChecks, RefreshCw } from 'lucide-react';
import WizardStepSection from './wizard-step-section';
import WizardStepNavigation from './wizard-step-navigation';
import { DO_NOT_IMPORT_VALUE } from '@/config/data-import-config';
import type { StagedDataFormat } from '../import-data-section'; // Adjust path
import { Button } from '@/components/ui/button';

interface ImportTableMappingStepProps {
  stagedData: StagedDataFormat | null;
  sourceTableNames: string[];
  tableMappings: Record<string, string>;
  targetCollectionOptions: Array<{ label: string; value: string }>;
  handleTableMappingChange: (sourceTable: string, targetCollectionValue: string) => void;
  onProceedToColumnMapping: () => void;
  onBackToFileReview: () => void;
  onResetTableMappings: () => void;
}

const ImportTableMappingStep: React.FC<ImportTableMappingStepProps> = ({
  stagedData,
  sourceTableNames,
  tableMappings,
  targetCollectionOptions,
  handleTableMappingChange,
  onProceedToColumnMapping,
  onBackToFileReview,
  onResetTableMappings,
}) => {
  if (!stagedData || sourceTableNames.length === 0) {
    return <p className="text-muted-foreground p-4 text-center">File not staged or no tables found. Please complete previous steps.</p>;
  }

  const mappedTablesCount = Object.values(tableMappings).filter(val => val && val !== DO_NOT_IMPORT_VALUE).length;

  return (
    <WizardStepSection
      stepNumber={4}
      title="Map Source Tables to Target Collections"
      icon={ListChecks}
      description="Map each table from your uploaded file to a target MongoDB collection."
    >
      <Button variant="outline" size="xs" onClick={onResetTableMappings} className="text-xs mb-3">
        <RefreshCw className="mr-1.5 h-3 w-3" /> Reset Table Mappings
      </Button>
      <div className="space-y-3">
        {sourceTableNames.map((sourceTable) => (
          <div key={sourceTable} className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 items-center p-3 border rounded-md bg-background shadow-sm">
            <div>
              <Label htmlFor={`map-${sourceTable}`} className="text-sm font-medium">
                Source: <span className="font-normal text-foreground break-all">
                  {stagedData.payload.find(p => (p.name || p.databaseName) === sourceTable)?.name ||
                   stagedData.payload.find(p => (p.name || p.databaseName) === sourceTable)?.databaseName ||
                   sourceTable}
                </span>
              </Label>
            </div>
            <Select
              value={tableMappings[sourceTable] || DO_NOT_IMPORT_VALUE}
              onValueChange={(value) => handleTableMappingChange(sourceTable, value)}
            >
              <SelectTrigger id={`map-${sourceTable}`} className="mt-1 md:mt-0 h-9 text-xs hover:bg-accent hover:text-accent-foreground">
                <SelectValue placeholder="Select target collection..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={DO_NOT_IMPORT_VALUE} className="text-xs italic">Do Not Import This Table</SelectItem>
                {targetCollectionOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value} className="text-xs">{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>
      <WizardStepNavigation
        onBack={onBackToFileReview}
        onNext={onProceedToColumnMapping}
        isNextDisabled={mappedTablesCount === 0}
        nextLabel={`Proceed to Column Mapping (${mappedTablesCount} table(s) mapped)`}
      />
    </WizardStepSection>
  );
};

export default ImportTableMappingStep;