"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { CheckCircle, AlertTriangle, FileText } from 'lucide-react';
import WizardStepSection from './wizard-step-section';
import WizardStepNavigation from './wizard-step-navigation';
import { cn } from '@/lib/utils';

interface ImportReportStepProps {
  importReport: { success: boolean; message: string; details?: string[] } | null;
  onStartNewImport: () => void;
}

const ImportReportStep: React.FC<ImportReportStepProps> = ({
  importReport,
  onStartNewImport,
}) => {
  if (!importReport) {
    return <p className="text-muted-foreground p-4 text-center">No import report available. Please complete an import process.</p>;
  }

  return (
    <WizardStepSection
      stepNumber={7}
      title="Import Report"
      icon={FileText}
      description="Summary of the data import process."
    >
      <Alert variant={importReport.success ? "default" : "destructive"} className={cn("text-xs mt-3", importReport.success ? "bg-green-500/10 border-green-500/30" : "bg-destructive/10 border-destructive/30" )}>
        {importReport.success ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
        <AlertTitle className="font-semibold">
          {importReport.success ? "Import Process Finished" : "Import Process Finished with Issues"}
        </AlertTitle>
        <p className="whitespace-pre-wrap">{importReport.message}</p>
        {importReport.details && importReport.details.length > 0 && (
          <>
            <Label className="text-xs font-medium mt-2 block">Details:</Label>
            <Card className="mt-1 bg-background/50 p-2 shadow-inner">
              <ScrollArea className="max-h-40">
                <pre className="text-[10px] whitespace-pre-wrap">{importReport.details.join("")}</pre>
              </ScrollArea>
            </Card>
          </>
        )}
      </Alert>
      <WizardStepNavigation
        onNext={onStartNewImport}
        nextLabel="Start New Import"
      />
    </WizardStepSection>
  );
};

export default ImportReportStep;