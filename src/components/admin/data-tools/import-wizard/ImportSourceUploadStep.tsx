
"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, FileText, Upload, XCircle } from 'lucide-react';
import WizardStepSection from './wizard-step-section';
import WizardStepNavigation from './wizard-step-navigation';

interface ImportSourceUploadStepProps {
  uploadedFile: File | null;
  fileKey: number;
  isProcessingFile: boolean;
  fileError: string | null;
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onProcessFile: () => void;
  onClearUpload: () => void;
  onBack: () => void;
}

const ImportSourceUploadStep: React.FC<ImportSourceUploadStepProps> = ({
  uploadedFile,
  fileKey,
  isProcessingFile,
  fileError,
  handleFileChange,
  onProcessFile,
  onClearUpload,
  onBack,
}) => {
  return (
    <WizardStepSection
      stepNumber={2}
      title="Upload Data File"
      icon={Upload}
      description="Upload a JSON file. The file structure should ideally specify its data driver (e.g., 'notion', 'mongodb') for automatic detection."
    >
      <div className="grid grid-cols-1 gap-4">
        <div>
          <Label htmlFor="file-upload-wizard" className="text-sm font-medium block mb-1">Upload JSON File</Label>
          <Input
            id="file-upload-wizard"
            type="file"
            accept=".json"
            key={fileKey}
            onChange={handleFileChange}
            disabled={isProcessingFile}
            className="mt-1 text-xs file:mr-4 file:py-2 file:px-4 file:rounded-md file:border file:border-input file:bg-background file:font-semibold file:text-foreground file:cursor-pointer file:transition-colors file:hover:bg-accent file:hover:text-accent-foreground file:active:bg-accent/80"
          />
          {uploadedFile && <p className="text-xs text-muted-foreground mt-1">Selected: {uploadedFile.name}</p>}
        </div>
      </div>

      {fileError && (
        <Alert variant="destructive" className="mt-3 text-xs">
          <AlertTitle className="text-sm font-semibold">File Processing Error</AlertTitle>
          <AlertDescription>{fileError}</AlertDescription>
        </Alert>
      )}

      <div className="mt-4 flex items-center gap-2">
        {uploadedFile && (
          <Button variant="outline" size="sm" onClick={onClearUpload} disabled={isProcessingFile}>
            <XCircle className="mr-2 h-4 w-4" /> Clear File Selection
          </Button>
        )}
      </div>
      <WizardStepNavigation
        onBack={onBack}
        onNext={onProcessFile}
        isNextDisabled={!uploadedFile || isProcessingFile}
        isLoadingNext={isProcessingFile}
        nextLabel={isProcessingFile ? "Processing..." : "Process File & Review"}
        nextIcon={isProcessingFile ? Loader2 : FileText}
      />
    </WizardStepSection>
  );
};

export default ImportSourceUploadStep;
