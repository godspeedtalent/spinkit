"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useDatabaseSettingsStore, type DatabaseConnection } from '@/stores/databaseSettingsStore';
import { useToast } from '@/hooks/use-toast';
import { appLogger } from '@/lib/logger';
import { useOperationHistoryStore } from '@/stores/operationHistoryStore';

// UI Components
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription as ShadDialogDescription, // Alias to avoid conflict with AlertDescription
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Checkbox } from '@/components/ui/checkbox';

// Import step components
import ImportTargetInfoStep from './import-wizard/ImportTargetInfoStep';
import ImportSourceUploadStep from './import-wizard/ImportSourceUploadStep';
import ImportFileReviewStep from './import-wizard/ImportFileReviewStep';
import ImportTableMappingStep from './import-wizard/ImportTableMappingStep';
import ImportColumnMappingStep from './import-wizard/ImportColumnMappingStep';
import ImportDataPreviewStep from './import-wizard/ImportDataPreviewStep';
import ImportReportStep from './import-wizard/ImportReportStep';

// Helper Interfaces and Utilities
import type { StagedPayloadItem, StagedDataFormat } from './import-wizard/import-wizard-utils';
import {
  getDisplayValue,
  transformSingleRecord,
  generateSingleSampleRecord,
} from './import-wizard/import-wizard-utils';

import {
  DATA_ENTITIES_KEYS,
  TARGET_MONGO_FIELDS_MAP,
  DO_NOT_IMPORT_VALUE,
  CREATE_NEW_FIELD_VALUE,
  NEW_FIELD_TYPE_OPTIONS,
  getEntityTypeLabel,
} from '@/config/data-import-config';

// Lucide Icons
import {
  Loader2,
  AlertTriangle,
  FileJson,
  DownloadCloud,
  XCircle,
  Settings,
  ChevronDown,
  FileDown,
  ListChecks, 
  Upload,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  FileText
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


export default function ImportDataSection() {
  const { connections } = useDatabaseSettingsStore();
  const { toast, dismiss, toasts } = useToast();
  const { addHistoryEntry } = useOperationHistoryStore();

  const [currentStep, setCurrentStep] = useState(1); // Start at Step 1: Target Info

  // Step 0: Target Connection Info
  const [targetConnectionInfo, setTargetConnectionInfo] = useState<(DatabaseConnection & { collections: Record<string, string> }) | null>(null);
  const [openCollectionStructures, setOpenCollectionStructures] = useState<string[]>([]);


  // Step 1 (formerly Step 2): Configure Source & Upload File
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileKey, setFileKey] = useState<number>(Date.now()); // To reset file input
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  // Step 2 (formerly Step 3): File Staged - Review Information
  const [stagedData, setStagedData] = useState<StagedDataFormat | null>(null);
  const [isFileStaged, setIsFileStaged] = useState(false); // True after successful staging
  const [sourceTableNames, setSourceTableNames] = useState<string[]>([]);
  const [sourceTableColumns, setSourceTableColumns] = useState<Record<string, string[]>>({});

  // Step 3 (formerly Step 4): Map Source Tables to Target Collections
  const [tableMappings, setTableMappings] = useState<Record<string, string>>({});
  const [areTablesMapped, setAreTablesMapped] = useState(false); // True after table mapping confirmed

  // Step 4 (formerly Step 5): Map Columns
  const [columnMappings, setColumnMappings] = useState<Record<string, Record<string, string>>>({});
  const [newFieldTypes, setNewFieldTypes] = useState<Record<string, Record<string, string>>>({});
  const [areColumnsMapped, setAreColumnsMapped] = useState(false); // True after column mapping applied
  const [isProcessingMappings, setIsProcessingMappings] = useState(false);


  // Step 5 (formerly Step 6): Pre-Import Data Preview
  const [transformedDataPreview, setTransformedDataPreview] = useState<Record<string, any[]> | null>(null);
  const [isPreviewGenerated, setIsPreviewGenerated] = useState(false); // True after preview generated

  // Step 6 (formerly Step 7): Import & Report
  const [isImporting, setIsImporting] = useState(false);
  const [importReport, setImportReport] = useState<{ success: boolean; message: string; details?: string[] } | null>(null);

  // For "Download Template" Dialog
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [selectedTemplateEntities, setSelectedTemplateEntities] = useState<Record<string, boolean>>(
    DATA_ENTITIES_KEYS.reduce((acc, key) => ({ ...acc, [key]: false }), {})
  );
  
  // Visibility flags (no longer used for main step control, but kept for internal conditional logic if needed)
  // const [showSourceUploadSection, setShowSourceUploadSection] = useState(false);
  // const [showFileReviewSection, setShowFileReviewSection] = useState(false);
  // const [showTableMappingSection, setShowTableMappingSection] = useState(false);
  // const [showColumnMappingSection, setShowColumnMappingSection] = useState(false);
  // const [showPreviewSection, setShowPreviewSection] = useState(false);
  // const [showImportReportSection, setShowImportReportSection] = useState(false);


  useEffect(() => {
    appLogger.debug("[Import Wizard] Connections from store:", connections);
    const activeMongo = connections.find(c => c.isActive && c.type === 'mongodb' && c.collections);
    if (activeMongo?.collections) {
      const typedActiveMongo = activeMongo as DatabaseConnection & { collections: Record<string, string> };
      appLogger.debug("[Import Wizard] Active MongoDB connection found:", typedActiveMongo.name);
      setTargetConnectionInfo(typedActiveMongo);
      if(currentStep === 0) setCurrentStep(1); // Ensure we are at least at step 1 if target is valid
    } else {
      appLogger.warn("[Import Wizard] No active MongoDB connection with collections found.");
      setTargetConnectionInfo(null);
      if(currentStep > 0) setCurrentStep(1); // Revert to step 1 to show the warning if target becomes invalid
    }
  }, [connections, currentStep]);


  const resetProcess = useCallback((fromStep?: 'file' | 'tableMapping' | 'columnMapping' | 'preview' | 'report') => {
    appLogger.debug(`Import Wizard: Resetting process from step: ${fromStep || 'full'}`);

    if (!fromStep || fromStep === 'file') {
      setUploadedFile(null);
      setFileKey(Date.now());
      setFileError(null);
      setIsFileStaged(false);
      setStagedData(null);
      setSourceTableNames([]);
      setSourceTableColumns({});
      // setShowFileReviewSection(false); // No longer needed with currentStep logic
    }
    if (!fromStep || fromStep === 'file' || fromStep === 'tableMapping') {
      setTableMappings({});
      setAreTablesMapped(false);
      // setShowTableMappingSection(false); // No longer needed
    }
    if (!fromStep || fromStep === 'file' || fromStep === 'tableMapping' || fromStep === 'columnMapping') {
      setColumnMappings({});
      setNewFieldTypes({});
      setAreColumnsMapped(false);
      // setShowColumnMappingSection(false); // No longer needed
    }
    if (!fromStep || fromStep === 'file' || fromStep === 'tableMapping' || fromStep === 'columnMapping' || fromStep === 'preview') {
      setTransformedDataPreview(null);
      setIsPreviewGenerated(false);
      // setShowPreviewSection(false); // No longer needed
    }
    if (!fromStep || fromStep === 'file' || fromStep === 'tableMapping' || fromStep === 'columnMapping' || fromStep === 'preview' || fromStep === 'report') {
      setImportReport(null);
      // setShowImportReportSection(false); // No longer needed
    }
    if (fromStep === 'file') {
      if (targetConnectionInfo) setCurrentStep(2); // Back to upload if file is cleared
      else setCurrentStep(1); // Back to target info if no target
    } else if (fromStep === 'tableMapping') {
      setCurrentStep(3); // Back to file review
    } else if (fromStep === 'columnMapping') {
      setCurrentStep(4); // Back to table mapping
    } else if (fromStep === 'preview') {
      setCurrentStep(5); // Back to column mapping
    } else if (fromStep === 'report') {
      setCurrentStep(6); // Back to preview
    } else if (!fromStep) { // Full reset
      setCurrentStep(targetConnectionInfo ? 2 : 1); // Start at upload (step 2) or target info (step 1)
    }
  }, [targetConnectionInfo]);


  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      appLogger.info("[Import Wizard] File selected:", file.name);
      setUploadedFile(file);
      setFileError(null);
      setIsFileStaged(false); // New file means previous staging is invalid
      resetProcess('tableMapping'); // Reset from table mapping onwards, keeps file & driver
      setCurrentStep(2); // Ensure we are on the upload step
    }
  }, [resetProcess]);

  const handleClearUploadAndReconfigure = useCallback(() => {
    setUploadedFile(null);
    setFileKey(Date.now()); // Reset file input
    resetProcess('file'); // Full reset from file stage onwards
    setCurrentStep(2); // Go back to the file upload step
    appLogger.info("[Import Wizard] Cleared uploaded file and reconfigured to file upload step.");
  }, [resetProcess]);

  const handleStageData = useCallback(async () => {
    if (!uploadedFile) {
      toast({ title: "No File Selected", description: "Please upload a JSON data file.", variant: "destructive" });
      return;
    }

    setIsProcessingFile(true);
    setFileError(null);
    setIsFileStaged(false);
    setStagedData(null);
    setSourceTableNames([]);
    setSourceTableColumns({});
    setTableMappings({});
    setColumnMappings({});
    setNewFieldTypes({});
    setAreTablesMapped(false);
    setAreColumnsMapped(false);
    setTransformedDataPreview(null);
    setIsPreviewGenerated(false);
    setImportReport(null);

    let stageToastId: string | undefined;
    appLogger.info("[handleStageData] Starting file processing for:", uploadedFile.name);

    try {
      const toastIdRef = toast({ title: "Processing File...", description: `Parsing ${uploadedFile.name}. Please wait.`, duration: 15000 });
      stageToastId = toastIdRef.id;

      const fileContent = await uploadedFile.text();
      const parsedJson = JSON.parse(fileContent);
      appLogger.debug("[handleStageData] Uploaded file parsed successfully.");

      let tempStagedDataFormat: StagedDataFormat = { driver: 'unknown', payload: [] };
      let tempSourceTableNames: string[] = [];
      let tempSourceTableColumns: Record<string, string[]> = {};
      const initialTableMappings: Record<string, string> = {};
      const initialColumnMappings: Record<string, Record<string, string>> = {};

      // Auto-detect driver from file content
      const detectedDriver = parsedJson.driver || (Object.keys(parsedJson).length > 0 && !Array.isArray(parsedJson) ? 'json_flat_object' : 'unknown');
      tempStagedDataFormat.driver = detectedDriver as StagedDataFormat['driver'];
      appLogger.info(`[handleStageData] Auto-detected driver: ${detectedDriver}`);

      if (detectedDriver === 'notion' || detectedDriver === 'mongodb' || detectedDriver === 'localJson' || detectedDriver === 'notion_template' || detectedDriver === 'json_template') {
        if (!Array.isArray(parsedJson.payload)) {
          throw new Error(`Expected 'payload' to be an array for driver: ${detectedDriver}`);
        }
        tempStagedDataFormat.driverInfo = `SpinKit Export (${detectedDriver})`;
        tempStagedDataFormat.exportDate = parsedJson.exportDate;

        parsedJson.payload.forEach((item: any) => {
          const sourceTableName = item.name || item.databaseName;
          if (!sourceTableName || typeof sourceTableName !== 'string' || !Array.isArray(item.records)) {
            appLogger.warn(`[handleStageData] SpinKit Format: Skipping payload item due to missing/invalid name or records:`, item);
            return;
          }
          tempSourceTableNames.push(sourceTableName);

          const originalRecords = item.records || [];
          let columnsSet = new Set<string>();
          const sampleSizeForColDetection = Math.min(10, originalRecords.length);
          let isSpinKitMongoFormat = false;

          if (sampleSizeForColDetection > 0 && (detectedDriver === 'mongodb' || detectedDriver === 'localJson')) {
            const firstRecord = originalRecords[0];
            if (firstRecord && typeof firstRecord.id === 'string' && firstRecord.properties && typeof firstRecord.properties === 'object') {
              isSpinKitMongoFormat = true;
              appLogger.info(`[handleStageData] Detected SpinKit MongoDB format for table: ${sourceTableName}`);
            }
          }

          for (let i = 0; i < sampleSizeForColDetection; i++) {
            const record = originalRecords[i];
            if (!record || typeof record !== 'object') continue;

            if (isSpinKitMongoFormat) {
              // For SpinKit MongoDB format, columns are from `properties` object, plus 'id'
              if (record.properties && typeof record.properties === 'object') {
                Object.keys(record.properties).forEach(key => columnsSet.add(key));
              }
              columnsSet.add('id'); // Add 'id' as a top-level column
            } else if (detectedDriver === 'notion' || detectedDriver === 'notion_template') {
              // For Notion, columns are from `properties` object's keys based on type
              if (record.properties && typeof record.properties === 'object') {
                Object.entries(record.properties).forEach(([propName, propDetails]: [string, any]) => {
                  const propTypeLower = String(propDetails?.type).toLowerCase();
                  // Exclude certain Notion-specific property types that aren't simple data fields
                  if (propDetails && propTypeLower && !['button', 'rollup', 'relation', 'formula', 'people', 'files', 'url', 'email', 'phone'].includes(propTypeLower)) {
                    columnsSet.add(propName);
                  }
                });
              }
            } else {
              // For other flat JSON structures (including non-SpinKit MongoDB)
              Object.keys(record).forEach(key => columnsSet.add(key));
            }
          }
          const allColsForTable = Array.from(columnsSet).sort();
          tempSourceTableColumns[sourceTableName] = allColsForTable;
          initialColumnMappings[sourceTableName] = allColsForTable.reduce((acc, col) => ({ ...acc, [col]: DO_NOT_IMPORT_VALUE }), {});
          
          const targetCollections = targetConnectionInfo?.collections ? Object.values(targetConnectionInfo.collections) : [];
          const matchedTargetCollection = targetCollections.find(tc =>
            tc.toLowerCase() === sourceTableName.toLowerCase().replace(/\s+/g, '_') || // Match slugified version too
            getEntityTypeLabel(tc as any).toLowerCase() === sourceTableName.toLowerCase()
          );
          initialTableMappings[sourceTableName] = matchedTargetCollection || DO_NOT_IMPORT_VALUE;

          let previewRecs: any[] = [];
          if(originalRecords.length > 0){
            const recordsWithCompleteness = originalRecords.map((record: any) => {
              let filledFields = 0;
              if (!record || typeof record !== 'object') return { record, completeness: 0 };
              allColsForTable.forEach(colName => {
                  // For SpinKit MongoDB, getDisplayValue will need to know to look in record.properties if colName is not 'id'
                  const val = getDisplayValue(record, colName, isSpinKitMongoFormat ? 'mongodb_spinkit' : detectedDriver, false);
                  if (val !== null && String(val).trim() !== '' && String(val).trim().toLowerCase() !== 'empty') filledFields++;
              });
              const completeness = allColsForTable.length > 0 ? (filledFields / allColsForTable.length) * 100 : 0;
              return { record, completeness };
            });
            previewRecs = recordsWithCompleteness
              .filter(r => r.completeness >= 75)
              .sort((a, b) => b.completeness - a.completeness)
              .slice(0, 5)
              .map(r => r.record);

            if (previewRecs.length < 5) {
              const fallbackNeeded = 5 - previewRecs.length;
              const fallbackRecords = originalRecords
                .filter((r: any) => !previewRecs.some(pr => pr === r))
                .slice(0, fallbackNeeded);
              previewRecs = [...previewRecs, ...fallbackRecords];
            }
          }

          tempStagedDataFormat.payload.push({
            name: sourceTableName,
            databaseName: item.databaseName,
            databaseId: item.databaseId,
            records: originalRecords,
            previewRecords: previewRecs,
            detectedColumns: allColsForTable,
          });
        });

      } else if (detectedDriver === 'json_flat_object') {
        tempStagedDataFormat.driverInfo = 'Generic JSON (Object of Arrays)';
        appLogger.info("[handleStageData] Processing as generic flat JSON object.");
        Object.entries(parsedJson).forEach(([tableName, records]: [string, any]) => {
          if (typeof tableName === 'string' && Array.isArray(records)) {
            tempSourceTableNames.push(tableName);
            const originalRecords = records;
            let columnsSet = new Set<string>();
            const sampleSizeForColDetection = Math.min(10, originalRecords.length);
            for (let i = 0; i < sampleSizeForColDetection; i++) {
              const record = originalRecords[i];
              if (record && typeof record === 'object') Object.keys(record).forEach(key => columnsSet.add(key));
            }
            const allColsForTable = Array.from(columnsSet).sort();
            tempSourceTableColumns[tableName] = allColsForTable;
            initialColumnMappings[tableName] = allColsForTable.reduce((acc, col) => ({ ...acc, [col]: DO_NOT_IMPORT_VALUE }), {});

            const targetCollections = targetConnectionInfo?.collections ? Object.values(targetConnectionInfo.collections) : [];
            const matchedTargetCollection = targetCollections.find(tc =>
              tc.toLowerCase() === tableName.toLowerCase().replace(/\s+/g, '_') ||
              getEntityTypeLabel(tc as any).toLowerCase() === tableName.toLowerCase()
            );
            initialTableMappings[tableName] = matchedTargetCollection || DO_NOT_IMPORT_VALUE;

             let previewRecs: any[] = [];
            if(originalRecords.length > 0){
                 const recordsWithCompleteness = originalRecords.map((record: any) => {
                    let filledFields = 0;
                    if (!record || typeof record !== 'object') return { record, completeness: 0 };
                    allColsForTable.forEach(colName => {
                        const val = getDisplayValue(record, colName, detectedDriver, false);
                        if (val !== null && String(val).trim() !== '' && String(val).trim().toLowerCase() !== 'empty') filledFields++;
                    });
                    const completeness = allColsForTable.length > 0 ? (filledFields / allColsForTable.length) * 100 : 0;
                    return { record, completeness };
                });
                previewRecs = recordsWithCompleteness
                .filter(r => r.completeness >= 75)
                .sort((a, b) => b.completeness - a.completeness)
                .slice(0, 5)
                .map(r => r.record);

                if (previewRecs.length < 5) {
                const fallbackNeeded = 5 - previewRecs.length;
                const fallbackRecords = originalRecords
                    .filter((r: any) => !previewRecs.some(pr => pr === r))
                    .slice(0, fallbackNeeded);
                previewRecs = [...previewRecs, ...fallbackRecords];
                }
            }

            tempStagedDataFormat.payload.push({
              name: tableName,
              records: originalRecords,
              previewRecords: previewRecs,
              detectedColumns: allColsForTable,
            });
          } else {
            appLogger.warn(`[handleStageData] Generic JSON: Key "${tableName}" is not an array or name is invalid. Skipping.`);
          }
        });
      } else {
        throw new Error("Unsupported file structure. Expected SpinKit export format (with 'driver' and 'payload' keys) or a flat JSON object where keys are table names and values are arrays of records. Driver found: " + detectedDriver);
      }

      if (tempStagedDataFormat.payload.length === 0) {
        throw new Error("No processable tables with records found in the file after detailed parsing.");
      }

      setStagedData(tempStagedDataFormat);
      setSourceTableNames(tempSourceTableNames.sort());
      setSourceTableColumns(tempSourceTableColumns);
      setTableMappings(initialTableMappings);
      setColumnMappings(initialColumnMappings); // Also set initial column mappings

      setIsFileStaged(true);
      setCurrentStep(3); // Move to File Review step

      if (stageToastId && toasts.some(t => t.id === stageToastId)) {
          dismiss(stageToastId);
      }
      toast({
        title: "File Staged Successfully",
        description: `${uploadedFile.name} ready for review. Format: ${tempStagedDataFormat.driverInfo || tempStagedDataFormat.driver}. Found ${tempSourceTableNames.length} table(s).`,
        duration: 5000,
      });
      appLogger.info("[handleStageData] File staging successful. Advancing to file review.");

    } catch (error: any) {
      appLogger.error("[Import Wizard] Error Staging File:", error.message, error.stack);
      const errorMessage = error.message || "Unknown error processing file.";
      setFileError(`Error processing file: ${errorMessage}`);
      setIsFileStaged(false);
      setCurrentStep(2); // Stay on upload step if error
       if (stageToastId && toasts.some(t => t.id === stageToastId)) {
          dismiss(stageToastId);
      }
      toast({ title: "File Processing Error", description: errorMessage, variant: "destructive", duration: 7000 });
    } finally {
      setIsProcessingFile(false);
    }
  }, [uploadedFile, toast, dismiss, appLogger, targetConnectionInfo, toasts]);


  const handleTableMappingChange = useCallback((sourceTableName: string, targetMongoCollectionName: string) => {
    setTableMappings(prev => ({ ...prev, [sourceTableName]: targetMongoCollectionName }));
    setAreTablesMapped(false);
    setAreColumnsMapped(false);
    setTransformedDataPreview(null);
    setIsPreviewGenerated(false);
    setImportReport(null);
    // Don't change currentStep here, user stays on table mapping
  }, []);

  const handleColumnMappingChange = useCallback((sourceTable: string, sourceColumn: string, targetMongoFieldName: string) => {
    setColumnMappings(prev => ({
      ...prev,
      [sourceTable]: {
        ...(prev[sourceTable] || {}),
        [sourceColumn]: targetMongoFieldName,
      },
    }));
    if (targetMongoFieldName !== CREATE_NEW_FIELD_VALUE) {
      setNewFieldTypes(prev => {
        const tableNewFields = { ...(prev[sourceTable] || {}) };
        delete tableNewFields[sourceColumn];
        if (Object.keys(tableNewFields).length === 0) {
          const { [sourceTable]: _, ...rest } = prev;
          return rest;
        }
        return { ...prev, [sourceTable]: tableNewFields };
      });
    }
    setAreColumnsMapped(false);
    setTransformedDataPreview(null);
    setIsPreviewGenerated(false);
    setImportReport(null);
    // Don't change currentStep
  }, []);

  const handleNewFieldTypeChange = useCallback((sourceTable: string, sourceColumn: string, newType: string) => {
    setNewFieldTypes(prev => ({
      ...prev,
      [sourceTable]: {
        ...(prev[sourceTable] || {}),
        [sourceColumn]: newType,
      },
    }));
    setAreColumnsMapped(false);
    setTransformedDataPreview(null);
    setIsPreviewGenerated(false);
    setImportReport(null);
  }, []);

  const mappedSourceTables = useMemo(() =>
    Object.entries(tableMappings)
      .filter(([, targetCollection]) => targetCollection && targetCollection !== DO_NOT_IMPORT_VALUE)
      .map(([sourceTable]) => sourceTable)
      .sort(),
    [tableMappings]
  );

  const handleApplyColumnMappingsAndPreview = useCallback(async () => {
    appLogger.info("[handleApplyColumnMappingsAndPreview] Applying column mappings and generating preview...");
    setIsProcessingMappings(true);
    let tToastId: string | undefined;

    for (const sourceTable of mappedSourceTables) {
      const cm = columnMappings[sourceTable] || {};
      const currentSrcCols = sourceTableColumns[sourceTable] || [];
      for (const srcCol of currentSrcCols) {
        if (cm[srcCol] === CREATE_NEW_FIELD_VALUE && !(newFieldTypes[sourceTable]?.[srcCol])) {
          toast({ title: "Missing New Field Type", description: `Please select a data type for the new field from source column "${srcCol}" in table "${sourceTable}".`, variant: "destructive" });
          setIsProcessingMappings(false);
          return;
        }
      }
    }

    try {
      const toastIdRef = toast({ title: "Generating Preview...", description: "Applying mappings to sample data. Please wait.", duration: 10000 });
      tToastId = toastIdRef.id;

      if (!stagedData?.payload || !targetConnectionInfo) {
        throw new Error("Staged data or target connection info missing for preview generation.");
      }

      const previewDataForStep: Record<string, any[]> = {};
      mappedSourceTables.forEach(sourceTable => {
        const targetCollectionName = tableMappings[sourceTable];
        if (!targetCollectionName || targetCollectionName === DO_NOT_IMPORT_VALUE) return;

        const payloadItem = stagedData.payload.find(p => (p.name || p.databaseName) === sourceTable);
        if (!payloadItem || !Array.isArray(payloadItem.records)) {
          appLogger.warn(`[PreviewGen] No records found in stagedData for source table: ${sourceTable}`);
          previewDataForStep[targetCollectionName] = [];
          return;
        }
        
        const recordsToSample = (payloadItem.previewRecords && payloadItem.previewRecords.length > 0)
          ? payloadItem.previewRecords
          : payloadItem.records.slice(0, 5);

        const transformedSample = recordsToSample
          .map(r => transformSingleRecord(r, columnMappings[sourceTable] || {}, newFieldTypes[sourceTable] || {}, stagedData.driver))
          .filter(Boolean) as any[];

        if (transformedSample.length > 0) {
          previewDataForStep[targetCollectionName] = transformedSample;
        } else {
          appLogger.warn(`[PreviewGen] No data to preview for target "${targetCollectionName}" from "${sourceTable}" after transformation.`);
          previewDataForStep[targetCollectionName] = [];
        }
      });

      setTransformedDataPreview(previewDataForStep);
      setIsPreviewGenerated(true);
      setAreColumnsMapped(true);
      setCurrentStep(6); // Move to Pre-Import Preview step

      if (tToastId && toasts.some(t => t.id === tToastId)) dismiss(tToastId);
      toast({ title: "Preview Generated", description: "Review the transformed data before importing." });
      appLogger.info("[handleApplyColumnMappingsAndPreview] Preview generated successfully.");

    } catch (e: any) {
      if (tToastId && toasts.some(t => t.id === tToastId)) dismiss(tToastId);
      toast({ title: "Preview Generation Error", description: e.message || "Could not generate preview.", variant: "destructive" });
      appLogger.error("[Import Wizard] Preview Generation Error:", e);
      setIsPreviewGenerated(false);
      setCurrentStep(5); // Stay on column mapping if error
    } finally {
      setIsProcessingMappings(false);
    }
  }, [stagedData, targetConnectionInfo, tableMappings, columnMappings, newFieldTypes, mappedSourceTables, sourceTableColumns, toast, dismiss, appLogger, toasts]);

  const handleImportData = useCallback(async () => {
    if (!stagedData || !targetConnectionInfo || !transformedDataPreview) {
      toast({ title: "Import Prerequisites Not Met", description: "Ensure data is staged, mapped, and previewed.", variant: "destructive" });
      return;
    }
    const tablesToActuallyImport = Object.entries(tableMappings)
      .filter(([, targetCollection]) => targetCollection && targetCollection !== DO_NOT_IMPORT_VALUE)
      .map(([sourceTable]) => sourceTable);

    if (tablesToActuallyImport.length === 0) {
      toast({ title: "No Tables Mapped for Import", description: "Please map at least one source table to a target collection.", variant: "destructive" });
      return;
    }

    setIsImporting(true);
    setImportReport(null);
    let importToastId: string | undefined;
    const operationLog: string[] = [];

    try {
      const toastIdRef = toast({ title: "Importing Data...", description: `Sending data to target: ${targetConnectionInfo.name}. This is a simulation.`, duration: 15000 });
      importToastId = toastIdRef.id;

      operationLog.push(`Target Connection: ${targetConnectionInfo.name} (Type: ${targetConnectionInfo.type})`);
      operationLog.push(`Source File Driver: ${stagedData.driverInfo || stagedData.driver}`);
      if (uploadedFile) operationLog.push(`Source File: ${uploadedFile.name}`);

      let totalAttemptedRecords = 0;
      let totalSuccessfullyProcessedRecords = 0;
      const transformedDataForImport: Array<{ targetCollectionName: string; recordsToImport: any[], sourceTableName: string }> = [];

      tablesToActuallyImport.forEach(sourceTable => {
        const targetCollectionName = tableMappings[sourceTable];
        const payloadItem = stagedData.payload.find(p => (p.name || p.databaseName) === sourceTable);
        if (!payloadItem || !Array.isArray(payloadItem.records)) {
          operationLog.push(` - SKIPPING source table "${sourceTable}": No records found in staged data.`);
          return;
        }

        const allOriginalRecords = payloadItem.records;
        operationLog.push(` - Processing source table "${sourceTable}" (mapped to "${targetCollectionName}"): ${allOriginalRecords.length} original records.`);

        const recordsToImport = allOriginalRecords
          .map(r => transformSingleRecord(r, columnMappings[sourceTable] || {}, newFieldTypes[sourceTable] || {}, stagedData.driver))
          .filter(Boolean) as any[];

        totalAttemptedRecords += allOriginalRecords.length;
        totalSuccessfullyProcessedRecords += recordsToImport.length;

        if (recordsToImport.length > 0) {
          transformedDataForImport.push({ targetCollectionName, recordsToImport, sourceTableName: sourceTable });
          operationLog.push(`   - ${recordsToImport.length} records transformed and prepared for import to "${targetCollectionName}".`);
        } else {
          operationLog.push(`   - No records to import for "${targetCollectionName}" after transformation for source table "${sourceTable}".`);
        }
      });

      appLogger.info("[Import Wizard] Simulating Import. Data prepared:",
        JSON.stringify(transformedDataForImport.map(t => ({
          collection: t.targetCollectionName,
          count: t.recordsToImport.length,
          sample: t.recordsToImport.slice(0, 1)
        })), null, 2).substring(0, 1000) + "..."
      );

      for (const { targetCollectionName, recordsToImport, sourceTableName } of transformedDataForImport) {
        operationLog.push(`   - Simulating import of ${recordsToImport.length} records from "${sourceTableName}" into "${targetCollectionName}"...`);
        await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 200));
        operationLog.push(`   - Mock import successful for "${targetCollectionName}".`);
      }

      let importStatus: 'Success' | 'Partial Success' | 'Failure' = 'Failure';
      if (tablesToActuallyImport.length === 0 && totalAttemptedRecords === 0) {
        importStatus = 'Success';
        operationLog.push("No tables were mapped for import, or mapped tables had no records.");
      } else if (totalSuccessfullyProcessedRecords > 0) {
        const mappedTablesWithOriginalDataCount = tablesToActuallyImport.filter(st => (stagedData.payload.find(p => (p.name || p.databaseName) === st)?.records.length || 0) > 0).length;
        if (transformedDataForImport.length === mappedTablesWithOriginalDataCount && mappedTablesWithOriginalDataCount > 0) {
          importStatus = 'Success';
        } else if (transformedDataForImport.length > 0) {
          importStatus = 'Partial Success';
        } else {
          importStatus = 'Failure';
          operationLog.push("No records were successfully processed for import, though tables were mapped and may have had original data.");
        }
      } else {
        importStatus = 'Failure';
        operationLog.push("No records were successfully processed for import.");
      }

      const reportMessage = `Import Simulation ${importStatus}. Processed ${totalSuccessfullyProcessedRecords} records from ${totalAttemptedRecords} original records across ${tablesToActuallyImport.length} selected source table(s). Data "imported" into ${transformedDataForImport.length} target collection(s).`;
      operationLog.push(`Final Status: ${importStatus}. ${reportMessage}`);
      setImportReport({ success: importStatus !== 'Failure', message: reportMessage, details: operationLog });
      if (importToastId && toasts.some(t => t.id === importToastId)) dismiss(importToastId);
      toast({ title: `Import Simulation ${importStatus}`, description: reportMessage, variant: importStatus === 'Failure' ? 'destructive' : 'default', duration: 10000 });
      addHistoryEntry({ operation: 'Import', status: importStatus, details: operationLog.join('\n'), connectionName: targetConnectionInfo.name, entities: transformedDataForImport.map(t => t.targetCollectionName), format: String(stagedData.driver) });
      setCurrentStep(7); // Move to Import Report step

    } catch (e: any) {
      if (importToastId && toasts.some(t => t.id === importToastId)) dismiss(importToastId);
      const errorMessage = e.message || "An unexpected error occurred during import simulation.";
      operationLog.push(`Critical error during import: ${errorMessage}`);
      setImportReport({ success: false, message: "Import failed critically.", details: operationLog });
      toast({ title: "Import Error", description: errorMessage, variant: "destructive" });
      addHistoryEntry({ operation: 'Import', status: 'Failure', details: operationLog.join('\n'), connectionName: targetConnectionInfo?.name || "Unknown", entities: [], format: String(stagedData?.driver || "Unknown") });
      setCurrentStep(7); // Move to Import Report step
    } finally {
      setIsImporting(false);
    }
  }, [stagedData, targetConnectionInfo, transformedDataPreview, tableMappings, columnMappings, newFieldTypes, toast, dismiss, addHistoryEntry, uploadedFile, appLogger, toasts]);

  const handleDownloadSelectedTemplates = useCallback(() => {
    const selectedKeysForTemplate = Object.entries(selectedTemplateEntities)
      .filter(([, isSelected]) => isSelected)
      .map(([key]) => key);

    if (selectedKeysForTemplate.length === 0) {
      toast({ title: "No Entities Selected", description: "Please select at least one entity type for the template.", variant: "destructive" });
      return;
    }

    const templatePayload: StagedPayloadItem[] = [];
    selectedKeysForTemplate.forEach(key => {
      const entityLabel = getEntityTypeLabel(key as any);
      const sampleRecord = generateSingleSampleRecord(key as keyof typeof TARGET_MONGO_FIELDS_MAP);
      templatePayload.push({
        name: entityLabel, // Use descriptive name for Notion export compatibility
        databaseName: entityLabel, // Same here
        records: [sampleRecord],
      });
    });

    const downloadData: StagedDataFormat = {
      driver: "json_template", // A generic template driver
      driverInfo: "SpinKit Import Template (JSON Structure with Payload)",
      payload: templatePayload,
      selectedEntities: selectedKeysForTemplate.map(key => getEntityTypeLabel(key as any)),
    };

    const jsonString = JSON.stringify(downloadData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    a.href = url;
    a.download = `spinkit_import_template_${timestamp}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({ title: "Template Downloaded", description: `Template for ${templatePayload.length} selected entities generated.` });
    setIsTemplateDialogOpen(false);
    setSelectedTemplateEntities(DATA_ENTITIES_KEYS.reduce((acc, key) => ({ ...acc, [key]: false }), {}));
  }, [selectedTemplateEntities, toast]);

  const getCurrentStepInfo = useCallback((): { number: number; title: string, total: number } => {
    const totalPossibleSteps = 6; // Target Info is not a "step" button, it's always present.
    if (currentStep === 7) return { number: 6, title: "Import Report", total: totalPossibleSteps };
    if (currentStep === 6) return { number: 5, title: "Pre-Import Data Preview", total: totalPossibleSteps };
    if (currentStep === 5) return { number: 4, title: "Map Columns for Import", total: totalPossibleSteps };
    if (currentStep === 4) return { number: 3, title: "Map Source Tables to Target Collections", total: totalPossibleSteps };
    if (currentStep === 3) return { number: 2, title: "Uploaded File Information & Staging Confirmation", total: totalPossibleSteps };
    if (currentStep === 2) return { number: 1, title: "Configure Source & Upload File", total: totalPossibleSteps };
    return { number: 0, title: "Target Connection Info", total: totalPossibleSteps }; // Initial state before user interaction
  }, [currentStep]);

  const stepInfo = getCurrentStepInfo();

  const handleProceedFromTargetInfo = useCallback(() => {
    if (targetConnectionInfo) {
      setCurrentStep(2); // Move to Configure Source & Upload
    }
  }, [targetConnectionInfo]);

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: // Target Connection Info
        return (
          <ImportTargetInfoStep
            targetConnectionInfo={targetConnectionInfo}
            openCollectionStructures={openCollectionStructures}
            setOpenCollectionStructures={setOpenCollectionStructures}
            onProceed={handleProceedFromTargetInfo}
            isLoading={connections.length > 0 && !targetConnectionInfo}
          />
        );
      case 2: // Configure Source & Upload File
        return (
          <ImportSourceUploadStep
            uploadedFile={uploadedFile}
            fileKey={fileKey}
            isProcessingFile={isProcessingFile}
            fileError={fileError}
            handleFileChange={handleFileChange}
            onProcessFile={handleStageData}
            onClearUpload={handleClearUploadAndReconfigure}
            onBack={() => {
              resetProcess('file'); // Full reset of upload state
              setCurrentStep(1);
            }}
          />
        );
      case 3: // File Staged - Review Information
        if (!isFileStaged || !stagedData) {
          appLogger.debug("[RenderStepContent Case 3] No stagedData or isFileStaged is false. isFileStaged:", isFileStaged, "stagedData:", stagedData ? "Exists" : "Does not exist");
          return <p className="text-muted-foreground p-4 text-center">No Data Staged. Please upload and process a file in Step 2.</p>;
        }
        return (
          <ImportFileReviewStep
            stagedData={stagedData}
            sourceTableNames={sourceTableNames}
            getDisplayValue={getDisplayValue} // Pass the helper
            onProceedToTableMapping={() => {
              if (sourceTableNames.length === 0) {
                toast({ title: "No Tables Found", description: "Cannot proceed, no tables were found in the staged file.", variant: "destructive" });
                return;
              }
              setAreTablesMapped(false);
              setCurrentStep(4); // Move to Table Mapping
            }}
            onBackToUpload={() => {
              resetProcess('tableMapping'); // Reset mapping states
              setCurrentStep(2); // Go back to Upload step
            }}
          />
        );
      case 4: // Map Source Tables to Target Collections
        if (!isFileStaged || !stagedData || sourceTableNames.length === 0) {
          return <p className="text-muted-foreground p-4 text-center">Please complete file staging in Step 2 first.</p>;
        }
        const targetCollectionOptions = targetConnectionInfo?.collections
          ? DATA_ENTITIES_KEYS
            .map(key => {
              const collectionName = targetConnectionInfo.collections[key as keyof typeof targetConnectionInfo.collections];
              const resourceLabel = getEntityTypeLabel(key as any);
              return collectionName ? { label: `${resourceLabel} (${collectionName})`, value: collectionName } : null;
            })
            .filter(Boolean)
            .sort((a, b) => a!.label.localeCompare(b!.label)) as { label: string; value: string }[]
          : [];
        return (
          <ImportTableMappingStep
            stagedData={stagedData}
            sourceTableNames={sourceTableNames}
            tableMappings={tableMappings}
            targetCollectionOptions={targetCollectionOptions}
            handleTableMappingChange={handleTableMappingChange}
            onProceedToColumnMapping={() => {
              const mappedCount = Object.values(tableMappings).filter(val => val && val !== DO_NOT_IMPORT_VALUE).length;
              if (mappedCount === 0) {
                toast({ title: "No Tables Mapped", description: "Please map at least one source table to a target collection.", variant: "destructive" });
                return;
              }
              setAreColumnsMapped(false);
              setIsPreviewGenerated(false);
              setCurrentStep(5); // Move to Column Mapping
            }}
            onBackToFileReview={() => {
              resetProcess('columnMapping'); // Reset column mapping state
              setCurrentStep(3); // Go back to File Review
            }}
            onResetTableMappings={() => {
              setTableMappings(sourceTableNames.reduce((acc, tblName) => ({ ...acc, [tblName]: DO_NOT_IMPORT_VALUE }), {}));
              resetProcess('columnMapping'); // Also reset downstream
            }}
          />
        );
      case 5: // Map Columns for Import
        if (!areTablesMapped || !stagedData || mappedSourceTables.length === 0) {
          return <p className="text-muted-foreground p-4 text-center">Please complete table mapping in Step 4 first.</p>;
        }
        return (
          <ImportColumnMappingStep
            mappedSourceTables={mappedSourceTables}
            tableMappings={tableMappings}
            sourceTableColumns={sourceTableColumns}
            columnMappings={columnMappings}
            newFieldTypes={newFieldTypes}
            targetConnectionInfo={targetConnectionInfo}
            handleColumnMappingChange={handleColumnMappingChange}
            handleNewFieldTypeChange={handleNewFieldTypeChange}
            onApplyAndPreview={handleApplyColumnMappingsAndPreview}
            onBackToTableMapping={() => {
              resetProcess('preview'); // Reset preview state
              setCurrentStep(4); // Go back to Table Mapping
            }}
            onResetColumnMappings={() => {
              setColumnMappings(prev => mappedSourceTables.reduce((acc, tbl) => {
                const currentSrcCols = sourceTableColumns[tbl] || [];
                acc[tbl] = currentSrcCols.reduce((colAcc, srcCol) => ({...colAcc, [srcCol]: DO_NOT_IMPORT_VALUE}),{});
                return acc;
              }, {}));
              setNewFieldTypes({});
              resetProcess('preview'); // Reset preview state
            }}
            isProcessingMappings={isProcessingMappings}
          />
        );
      case 6: // Pre-Import Data Preview
        if (!isPreviewGenerated || !transformedDataPreview) return <p className="text-muted-foreground p-4 text-center">Preview not generated. Please apply column mappings in Step 4.</p>;
        return (
          <ImportDataPreviewStep
            transformedDataPreview={transformedDataPreview}
            getDisplayValue={getDisplayValue}
            sourceDriver={stagedData?.driver || null}
            onConfirmImport={handleImportData}
            onBackToColumnMapping={() => {
              resetProcess('report'); // Reset report state
              setCurrentStep(5); // Go back to Column Mapping
            }}
            isImporting={isImporting}
          />
        );
      case 7: // Import Report
        if (!importReport) return <p className="text-muted-foreground p-4 text-center">Import process not yet run or report not available.</p>;
        return (
          <ImportReportStep
            importReport={importReport}
            onStartNewImport={() => {
              resetProcess('file'); // Full reset
              setCurrentStep(1); // Start over from Target Info
            }}
          />
        );
      default:
        return <p className="text-muted-foreground p-4 text-center">Loading import wizard step...</p>;
    }
  };


  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-xl flex items-center">
            <DownloadCloud className="mr-3 h-5 w-5 text-primary" />
            Import Data Wizard
          </CardTitle>
          {currentStep > 0 && ( // Only show step info if past initial target display
             <p className="text-sm text-muted-foreground">
                {stepInfo.number > 0 ? `Step ${stepInfo.number} of ${stepInfo.total}: ${stepInfo.title}` : stepInfo.title}
             </p>
          )}
        </div>
        <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <FileJson className="mr-2 h-4 w-4" /> Download Import Template
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Select Entities for Template</DialogTitle>
              <ShadDialogDescription>
                Choose entity types for your JSON import template. A sample record will be generated for each.
              </ShadDialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3 py-4 max-h-60 overflow-y-auto pr-2">
              {DATA_ENTITIES_KEYS.map((key) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={`template-${key}`}
                    checked={selectedTemplateEntities[key] || false}
                    onCheckedChange={(checked) => setSelectedTemplateEntities(prev => ({ ...prev, [key]: Boolean(checked) }))}
                  />
                  <label htmlFor={`template-${key}`} className="text-sm font-normal capitalize cursor-pointer">
                    {getEntityTypeLabel(key as any)}
                  </label>
                </div>
              ))}
            </div>
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
              <Button type="button" onClick={handleDownloadSelectedTemplates} disabled={Object.values(selectedTemplateEntities).every(v => !v)}>Download Template</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-4 p-4 md:p-6">
        {renderStepContent()}
      </CardContent>
    </Card>
  );
}
