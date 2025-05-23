"use client";

import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { CheckCircle, AlertTriangle, FileText, RotateCcw } from 'lucide-react';
import WizardStepSection from './WizardStepSection';
import WizardStepNavigation from './WizardStepNavigation';
import { cn } from '@/lib/utils';

interface ImportReport {
  success: boolean;
  message: string;
  details?: string[];
}

interface ImportReportStepProps {
  importReport: ImportReport | null;
  onStartNewImport: () => void;
}

const ImportReportStep: React.FC<ImportReportStepProps> = ({
  importReport,
  onStartNewImport,
}) => {
  if (!importReport) {
    return (
      <WizardStepSection
        stepNumber={7}
        title="Import Report"
        icon={FileText}
        description="Summary of the data import process."
      >
        <p className="text-muted-foreground p-4 text-center">
          No import report available. Please complete an import process.
        </p>
        <WizardStepNavigation
          onNext={onStartNewImport}
          nextLabel="Start New Import"
          nextIcon={RotateCcw}
        />
      </WizardStepSection>
    );
  }

  return (
    <WizardStepSection
      stepNumber={7}
      title="Import Report"
      icon={FileText}
      description="Summary of the data import process."
    >
      <Alert
        variant={importReport.success ? "default" : "destructive"}
        className={cn(
          "text-xs mt-3",
          importReport.success
            ? "bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-300"
            : "bg-destructive/10 border-destructive/30 text-destructive"
        )}
      >
        {importReport.success ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
        <AlertTitle className="font-semibold">
          {importReport.success ? "Import Process Finished Successfully" : "Import Process Finished with Issues"}
        </AlertTitle>
        <AlertDescription className="whitespace-pre-wrap">{importReport.message}</AlertDescription>
        {importReport.details && importReport.details.length > 0 && (
          <>
            <Label className="text-xs font-medium mt-2 block">Details:</Label>
            <Card className="mt-1 bg-background/50 p-2 shadow-inner max-h-40"> {/* Added max-h for consistency */}
              <ScrollArea className="h-full"> {/* Ensure ScrollArea takes full height of its parent */}
                <pre className="text-[10px] whitespace-pre-wrap">{importReport.details.join("\n")}</pre>
              </ScrollArea>
            </Card>
          </>
        )}
      </Alert>
      <WizardStepNavigation
        onNext={onStartNewImport}
        nextLabel="Start New Import"
        nextIcon={RotateCcw}
      />
    </WizardStepSection>
  );
};

export default ImportReportStep;