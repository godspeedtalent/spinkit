
"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useDatabaseSettingsStore, type DatabaseConnection } from '@/stores/databaseSettingsStore';
import { useToast } from '@/hooks/use-toast';
import { appLogger } from '@/lib/logger';
import { useOperationHistoryStore } from '@/stores/operationHistoryStore';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription as ShadDialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { ScrollArea } from '@/components/ui/scroll-area';
import { DATA_ENTITIES_KEYS, getEntityTypeLabel, TARGET_MONGO_FIELDS_MAP } from '@/config/data-import-config';
import { cn } from '@/lib/utils';

import {
  Loader2,
  AlertTriangle,
  UploadCloud,
  FileJson,
  Database,
  ArrowRight,
  CheckCircle,
  FileDown,
  RefreshCw,
  ArrowLeft
} from 'lucide-react';
import { SpinKitExport, SpinKitPayloadTable, SpinKitRecord } from '@/types';

interface AvailableTable {
  id: string;
  name: string;
}

// Extends SpinKitExport with UI-specific fields
interface UIDataExport extends SpinKitExport {
  // driver, exportDate, payload are from SpinKitExport
  connectionName?: string; // UI specific, might be useful for logs or context
  selectedDatabases?: string[]; // For Notion: list of DB names exported (UI context)
  selectedEntities?: string[]; // For MongoDB/LocalJSON: list of entity/collection names exported (UI context)
}


export default function ExportDataSection() {
  const { connections } = useDatabaseSettingsStore();
  const { toast, dismiss, toasts } = useToast();
  const { addHistoryEntry } = useOperationHistoryStore();

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
  
  const [availableTables, setAvailableTables] = useState<AvailableTable[]>([]);
  const [selectedTables, setSelectedTables] = useState<Record<string, boolean>>({}); 
  
  const [exportFormat, setExportFormat] = useState<'json'>('json'); // CSV option removed
  
  const [isLoadingTables, setIsLoadingTables] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [fetchTablesError, setFetchTablesError] = useState<string | null>(null);

  const selectedConnection = useMemo(() => {
    if (!selectedConnectionId) return null;
    const conn = connections.find(c => c.id === selectedConnectionId);
    if (!conn) {
      appLogger.warn(`[ExportDataSection] Selected connection ID "${selectedConnectionId}" not found in store. Resetting.`);
      setSelectedConnectionId(null); 
      return null;
    }
    return conn;
  }, [connections, selectedConnectionId]);

  const tablesToExportDetails = useMemo(() => {
    return availableTables.filter(table => selectedTables[table.id]);
  }, [availableTables, selectedTables]);

  const resetWizardToStep = useCallback((step: number) => {
    appLogger.info(`[ExportData] Resetting wizard to step ${step}`);
    setCurrentStep(step);
    if (step <= 1) { // Reset for connection selection or before
        setAvailableTables([]);
        setSelectedTables({});
        setFetchTablesError(null);
        setIsLoadingTables(false); // Ensure loading state is reset
    }
    if (step <= 2) { // Reset for table selection or before
        setSelectedTables({});
    }
    // Export format is now fixed, so no reset needed for it in this manner
    setIsExporting(false);
  }, []);


  const fetchTablesForSelectedConnection = useCallback(async (connection: DatabaseConnection) => {
    setIsLoadingTables(true);
    setFetchTablesError(null);
    setAvailableTables([]);
    setSelectedTables({});
    let schemaToastId: string | undefined;

    try {
      const toastInstance = toast({
        title: "Fetching schema...",
        description: `Discovering tables/databases for ${connection.name}.`,
        duration: 15000, 
      });
      schemaToastId = toastInstance.id;

      let tables: AvailableTable[] = [];
      if (connection.type === 'notion') {
        appLogger.info(`[ExportData] Fetching Notion databases for connection: ${connection.name}`);
        const response = await fetch('/api/admin/notion/list-databases');
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: "Failed to parse error from Notion DB list API" }));
          const errorMsg = errorData.error || errorData.details || `Failed to fetch Notion databases: ${response.statusText}`;
          appLogger.error("[ExportData] Error fetching Notion databases:", errorMsg, errorData);
          throw new Error(errorMsg);
        }
        const notionDbs: Array<{ id: string; name: string }> = await response.json();
        if (!Array.isArray(notionDbs)) {
          appLogger.error("[ExportData] Received unexpected data from Notion DB listing API:", notionDbs);
          throw new Error('Received unexpected data from Notion database listing API.');
        } else if (notionDbs.length === 0) {
          setFetchTablesError('No databases found for this Notion connection or the integration lacks access to any databases.');
        }
        tables = notionDbs.map(db => ({ id: db.id, name: db.name }));
        appLogger.info(`[ExportData] Fetched ${tables.length} Notion databases.`);
      } else if (connection.type === 'mongodb' && connection.collections) {
        appLogger.info(`[ExportData] Deriving MongoDB collections for connection: ${connection.name}`);
         tables = DATA_ENTITIES_KEYS
          .filter(key => connection.collections && connection.collections[key as keyof typeof connection.collections])
          .map(key => {
            const collectionName = connection.collections![key as keyof typeof connection.collections]!;
            const userFriendlyName = `${getEntityTypeLabel(key as any)} (${collectionName})`;
            return { id: collectionName, name: userFriendlyName };
          });
        appLogger.info(`[ExportData] Derived ${tables.length} MongoDB collections.`);
      } else if (connection.type === 'localJson') {
        appLogger.info(`[ExportData] Using LocalJSON entities for connection: ${connection.name}`);
         tables = DATA_ENTITIES_KEYS.map(key => ({ 
            id: key,
            name: `${getEntityTypeLabel(key as any)} (Local JSON)` 
        }));
        appLogger.info(`[ExportData] Using ${tables.length} LocalJSON entities.`);
      } else {
        const errorMsg = `Table discovery for type "${connection.type}" is not implemented yet.`;
        appLogger.warn(`[ExportData] ${errorMsg}`);
        setFetchTablesError(errorMsg);
      }
      
      setAvailableTables(tables.sort((a,b) => a.name.localeCompare(b.name)));
      setSelectedTables(tables.reduce((acc, table) => ({ ...acc, [table.id]: true }), {}));
      
      if (tables.length > 0) {
        setCurrentStep(2);
      } else if (!fetchTablesError) { 
          setFetchTablesError(`No tables/databases found or applicable for connection type "${connection.type}".`);
      }
    } catch (error: any) {
      const errorMessage = error.message || "An unknown error occurred while fetching tables.";
      setFetchTablesError(errorMessage);
      appLogger.error("[ExportData] Catch block: Error Fetching Tables for Export:", errorMessage, error);
    } finally {
      setIsLoadingTables(false);
      if (schemaToastId && toasts.some(t => t.id === schemaToastId)) {
        dismiss(schemaToastId);
      }
    }
  }, [toast, dismiss, toasts]);
  
  useEffect(() => {
    if (selectedConnectionId) {
        const conn = connections.find(c => c.id === selectedConnectionId);
        if (conn) {
            fetchTablesForSelectedConnection(conn);
        } else {
            appLogger.warn(`[ExportData] useEffect selectedConnectionId: Connection with ID ${selectedConnectionId} not found. Resetting.`);
            setSelectedConnectionId(null);
            resetWizardToStep(1);
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConnectionId]);


  const handleTableSelectionChange = (tableId: string, checked: boolean) => {
    setSelectedTables(prev => ({ ...prev, [tableId]: checked }));
  };

  const handleExport = async () => {
    if (!selectedConnection) {
      toast({ title: "Error", description: "Please select a data connection first.", variant: "destructive" });
      return;
    }
    if (tablesToExportDetails.length === 0) {
      toast({ title: "No Tables Selected", description: "Please select at least one table/entity to export.", variant: "destructive" });
      return;
    }

    setIsExporting(true);
    let exportToastId: string | undefined;
    const toastInstance = toast({
      title: "Export Process Starting...",
      description: `Preparing to export data for ${tablesToExportDetails.length} selected table(s)/database(s) as ${exportFormat.toUpperCase()}.`,
      duration: 25000,
    });
    exportToastId = toastInstance.id;

    let exportStatus: 'Success' | 'Partial Success' | 'Failure' = 'Failure';
    let exportDetailsLog: string[] = [`Export format: ${exportFormat.toUpperCase()}`];
    let successfullyExportedCount = 0;
    
    const driverValue: "notion" | "mongodb" = selectedConnection.type === 'notion' 
      ? "notion" 
      : "mongodb"; // localJson is treated as mongodb

    const uiExportData: UIDataExport = {
      driver: driverValue,
      exportDate: new Date().toISOString(),
      connectionName: selectedConnection.name,
      payload: [],
      // UI specific fields, initialize if needed, or they can be populated later
      selectedDatabases: selectedConnection.type === 'notion' ? [] : undefined,
      selectedEntities: selectedConnection.type !== 'notion' ? [] : undefined,
    };

    try {
      if (selectedConnection.type === 'notion') {
        exportDetailsLog.push(`Fetching and transforming data from Notion for ${tablesToExportDetails.length} database(s)...`);
        for (const table of tablesToExportDetails) {
          try {
            appLogger.info(`[ExportData] Fetching Notion DB: ${table.name} (ID: ${table.id})`);
            const response = await fetch(`/api/admin/notion/export-database/${table.id}`);
            if (!response.ok) {
              const errorData = await response.json().catch(() => ({ error: "Failed to parse error response" }));
              const errorMsg = `Notion API Error for "${table.name}" (ID: ${table.id}): ${response.status} ${response.statusText}. Details: ${errorData.error || errorData.details || 'N/A'}`;
              exportDetailsLog.push(`ERROR: ${errorMsg}`);
              appLogger.error("Notion Export API Error:", errorMsg, errorData);
              toast({ title: `Error Exporting ${table.name}`, description: errorMsg.substring(0, 200), variant: "destructive", duration: 10000 });
              continue; 
            }
            // Assuming transformedPagesData is an array of objects like { notion_page_id: string, properties: object, ... }
            const transformedPagesData: Array<{ notion_page_id: string, properties: object }> = await response.json();
            
            if (transformedPagesData && transformedPagesData.length > 0) {
              const records: SpinKitRecord[] = transformedPagesData.map(page => ({
                id: page.notion_page_id,
                properties: page.properties,
              }));
              uiExportData.payload.push({ name: table.name, id: table.id, records });
              if (uiExportData.selectedDatabases) uiExportData.selectedDatabases.push(table.name);
              successfullyExportedCount++;
            } else {
              exportDetailsLog.push(`No records found or fetched for Notion DB: "${table.name}".`);
            }
            exportDetailsLog.push(`Successfully processed Notion DB: "${table.name}".`);
          } catch (error: any) {
            const errorMsg = `Error exporting Notion DB "${table.name}": ${error.message}`;
            exportDetailsLog.push(`ERROR: ${errorMsg}`);
            appLogger.error(errorMsg, error);
            toast({ title: `Error Processing ${table.name}`, description: error.message.substring(0, 200), variant: "destructive", duration: 10000 });
          }
        }
      } else if (selectedConnection.type === 'mongodb' || selectedConnection.type === 'localJson') {
        const sourceTypeText = selectedConnection.type === 'mongodb' ? 'MongoDB' : 'Local JSON';
        exportDetailsLog.push(`Fetching data from ${sourceTypeText} for ${tablesToExportDetails.length} collection(s)/entities...`);
        
        for (const table of tablesToExportDetails) {
          const actualCollectionOrEntityKey = table.id; // This is the collection name for MongoDB or entity key for LocalJSON
          let entityKeyForApi = actualCollectionOrEntityKey; 
          
          // For MongoDB, map collection name back to entity key if needed for API path
          if (selectedConnection.type === 'mongodb' && selectedConnection.collections) {
             const foundKey = (Object.keys(selectedConnection.collections) as Array<keyof typeof selectedConnection.collections>)
              .find(key => selectedConnection.collections![key as keyof typeof selectedConnection.collections] === actualCollectionOrEntityKey);
            if (foundKey) {
              entityKeyForApi = foundKey; // Use the entity key (e.g., "djs", "venues") for the API path
            } else {
                const errorMsg = `Could not determine entity key for MongoDB collection "${actualCollectionOrEntityKey}". Skipping.`;
                exportDetailsLog.push(`ERROR: ${errorMsg}`);
                appLogger.error(errorMsg);
                toast({ title: `Config Error for ${table.name}`, description: errorMsg, variant: "destructive", duration: 7000 });
                continue;
            }
          }
          // For LocalJSON, actualCollectionOrEntityKey is already the entity key (e.g., "djs", "venues")
          
          const apiPath = `/api/${entityKeyForApi.toLowerCase()}?limit=10000`;
          appLogger.info(`[ExportData] Fetching from ${sourceTypeText}: ${table.name} (Key: ${entityKeyForApi}, ID: ${table.id}) via API: ${apiPath}`);

          try {
            const response = await fetch(apiPath);
            if (!response.ok) {
              const errorData = await response.json().catch(() => ({ error: `Failed to parse error from ${sourceTypeText} API` }));
              const errorMsg = `${sourceTypeText} API Error for "${table.name}": ${response.status} ${response.statusText}. Details: ${errorData.error || errorData.details || 'N/A'}`;
              exportDetailsLog.push(`ERROR: ${errorMsg}`);
              appLogger.error(`${sourceTypeText} Export API Error:`, errorMsg, errorData);
              toast({ title: `Error Exporting ${table.name}`, description: errorMsg.substring(0,200), variant: "destructive", duration: 10000 });
              continue;
            }
            const responseData: PaginatedResponse<any> = await response.json();
            // Ensure items exist, default to empty array if not
            const items = responseData.items || (Array.isArray(responseData) ? responseData : []); 
            
            if (items && items.length > 0) {
              const records: SpinKitRecord[] = items.map(item => ({
                id: item.id, // Assuming each item has an 'id' field
                properties: item,
              }));
              // table.id here is the actual collection name (for mongo) or entity key (for localJson)
              // table.name is the user-friendly name
              uiExportData.payload.push({ name: table.name, id: table.id, records });
              if (uiExportData.selectedEntities) uiExportData.selectedEntities.push(table.name);
              successfullyExportedCount++;
            } else {
              exportDetailsLog.push(`No records found or fetched for ${sourceTypeText} entity: "${table.name}".`);
            }
            exportDetailsLog.push(`Successfully processed ${sourceTypeText} entity: "${table.name}".`);
          } catch (error: any) {
            const errorMsg = `Error exporting ${sourceTypeText} entity "${table.name}": ${error.message}`;
            exportDetailsLog.push(`ERROR: ${errorMsg}`);
            appLogger.error(errorMsg, error);
            toast({ title: `Error Processing ${table.name}`, description: error.message.substring(0,200), variant: "destructive", duration: 10000 });
          }
        }
      } else {
        // This case should ideally not be hit if connections are only notion, mongodb, localJson
        exportDetailsLog.push(`Export for type "${selectedConnection.type}" not fully implemented for direct download. Simulating process.`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        tablesToExportDetails.forEach(t => {
            // Create a placeholder SpinKitPayloadTable structure
            const placeholderRecords: SpinKitRecord[] = [{id: "placeholder_id", properties: {mock: "data", note: "This is a placeholder due to unimplemented export for this type."}}];
            uiExportData.payload.push({ name: t.name, id: t.id, records: placeholderRecords });
            if(uiExportData.selectedEntities) uiExportData.selectedEntities.push(t.name);
            else if(uiExportData.selectedDatabases) uiExportData.selectedDatabases.push(t.name); // Should not happen for this "else"
            successfullyExportedCount++;
        });
      }

      if (uiExportData.payload.length > 0) {
        // Prepare the data for JSON stringification, excluding UI-specific fields for the final JSON
        const exportDataForJson: SpinKitExport = {
            driver: uiExportData.driver,
            exportDate: uiExportData.exportDate,
            connectionName: uiExportData.connectionName || selectedConnection.name, // fallback, though connectionName is in SpinKitExport
            payload: uiExportData.payload,
        };
        const jsonData = JSON.stringify(exportDataForJson, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        a.href = url;
        // Use uiExportData.driver for the filename, which is correctly "notion" or "mongodb"
        a.download = `${uiExportData.driver}_export_${selectedConnection.name.replace(/\s+/g, '_')}_${timestamp}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        exportDetailsLog.push("File download initiated.");
      } else if (tablesToExportDetails.length > 0) {
        exportDetailsLog.push("No data found in any of the selected tables/databases to include in the export file.");
      }


      const anyErrorsDuringFetch = exportDetailsLog.some(log => log.startsWith("ERROR:"));
      if (successfullyExportedCount === tablesToExportDetails.length && !anyErrorsDuringFetch) {
        exportStatus = 'Success';
      } else if (successfullyExportedCount > 0) {
        exportStatus = 'Partial Success';
      } else {
        exportStatus = 'Failure';
      }
      
      const finalToastMessage = uiExportData.payload.length > 0
        ? `Data export from "${selectedConnection.name}" complete. ${successfullyExportedCount} of ${tablesToExportDetails.length} selected entities/databases had data included. Download started.`
        : `Data export from "${selectedConnection.name}" finished. No data was found in the selected entities/databases to export.`;

      toast({
        title: `Export ${exportStatus}`,
        description: finalToastMessage,
        variant: exportStatus === 'Failure' ? "destructive" : (exportStatus === 'Partial Success' ? "warning" as any : "default"),
        duration: 10000
      });
      
      addHistoryEntry({
        operation: 'Export',
        status: exportStatus,
        details: exportDetailsLog.join('\n') || "Export process completed.",
        connectionName: selectedConnection.name,
        entities: tablesToExportDetails.map(t => t.name),
        format: exportFormat
      });

    } catch (error: any) {
      exportStatus = 'Failure';
      const errorMsg = error.message || "An unexpected error occurred during export.";
      exportDetailsLog.push(`CRITICAL EXPORT ERROR: ${errorMsg}`);
      appLogger.error("Critical Export Error:", errorMsg, error);
      toast({ title: "Export Failed Critically", description: errorMsg.substring(0, 200), variant: "destructive", duration: 10000 });
       addHistoryEntry({
        operation: 'Export',
        status: 'Failure',
        details: `Critical error during export: ${errorMsg}\n${exportDetailsLog.join('\n')}`,
        connectionName: selectedConnection?.name || "Unknown",
        entities: tablesToExportDetails.map(t => t.name),
        format: exportFormat
      });
    } finally {
      if (exportToastId && toasts.some(t => t.id === exportToastId)) {
        dismiss(exportToastId);
      }
      setIsExporting(false);
    }
  };
  
  const canProceedFromStep1 = !!selectedConnectionId;
  const canProceedFromStep2 = selectedConnectionId && !isLoadingTables && tablesToExportDetails.length > 0;
  const canProceedFromStep3 = canProceedFromStep2 && !!exportFormat;
  const canExport = canProceedFromStep3 && !isExporting;

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          <UploadCloud className="mr-3 h-5 w-5 text-primary" />
          Export Application Data
        </CardTitle>
        <CardDescription>
          Select a connection, choose entities/tables, select format, and export data.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Step 1: Select Connection */}
        <section className="space-y-3 p-4 border rounded-md bg-background/50">
          <Label htmlFor="connection-select" className="text-md font-semibold block">1. Select Data Connection</Label>
          {connections.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted-foreground mb-2">No data connections configured.</p>
              <Button asChild variant="outline" size="sm">
                <Link href="/admin/data-tools"> {/* Assuming data-tools defaults to database settings */}
                  <Database className="mr-2 h-4 w-4"/> Configure Connections
                </Link>
              </Button>
            </div>
          ) : (
            <Select 
              onValueChange={(value) => { 
                resetWizardToStep(1); 
                setSelectedConnectionId(value); 
              }} 
              value={selectedConnectionId || ""}
              disabled={isLoadingTables || isExporting || currentStep > 1}
            >
              <SelectTrigger id="connection-select" className="w-full md:w-2/3 lg:w-1/2 hover:bg-accent hover:text-accent-foreground">
                <SelectValue placeholder="Choose a connection..." />
              </SelectTrigger>
              <SelectContent>
                {connections.map(conn => (
                  <SelectItem key={conn.id} value={conn.id}>{conn.name} ({conn.type})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </section>

        {/* Step 2: Select Tables/Entities */}
        {currentStep >= 2 && selectedConnectionId && (
          <section className="space-y-3 p-4 border rounded-md bg-background/50 mt-4">
            <div className="flex justify-between items-center">
              <Label className="text-md font-semibold">2. Select Tables/Entities to Export</Label>
               <Button variant="ghost" size="icon" onClick={() => {if(selectedConnection) fetchTablesForSelectedConnection(selectedConnection)}} disabled={isLoadingTables || !selectedConnection || isExporting} title="Refresh table list">
                  <RefreshCw className={`h-4 w-4 ${isLoadingTables ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            {selectedConnection && <p className="text-xs text-muted-foreground">Source: {selectedConnection.name}</p>}
            
            {isLoadingTables ? (
              <div className="flex items-center justify-center py-4 h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
                <span className="text-muted-foreground">Loading available tables...</span>
              </div>
            ) : fetchTablesError ? (
              <Alert variant="destructive" className="text-xs">
                  <AlertTriangle className="h-4 w-4"/>
                  <AlertTitle className="font-semibold">Error Loading Tables</AlertTitle>
                  <AlertDescription>{fetchTablesError}</AlertDescription>
              </Alert>
            ) : availableTables.length > 0 ? (
              <>
              <ScrollArea className="max-h-60 border rounded-md p-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-3 p-2">
                  {availableTables.map(table => (
                    <div key={table.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`table-${table.id}`}
                        checked={selectedTables[table.id] || false}
                        onCheckedChange={(checked) => handleTableSelectionChange(table.id, Boolean(checked))}
                        disabled={isExporting || currentStep > 2}
                      />
                      <Label htmlFor={`table-${table.id}`} className="text-sm font-normal cursor-pointer truncate" title={table.name}>
                        {table.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
               <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                      const allSelectedCurrently = availableTables.length > 0 && tablesToExportDetails.length === availableTables.length;
                      const newSelectionState = availableTables.reduce((acc, table) => ({ ...acc, [table.id]: !allSelectedCurrently }), {});
                      setSelectedTables(newSelectionState);
                  }}
                  className="mt-2 text-xs"
                  disabled={availableTables.length === 0 || isExporting || currentStep > 2}
                  >
                  {availableTables.length > 0 && tablesToExportDetails.length === availableTables.length ? "Deselect All" : "Select All"}
              </Button>
              </>
            ) : (
              <p className="text-muted-foreground p-4 border rounded-md text-center">No tables/databases found for this connection.</p>
            )}
          </section>
        )}

        {/* Step 3: Select Export Format */}
        {currentStep >= 3 && canProceedFromStep2 && (
          <section className="space-y-3 p-4 border rounded-md bg-background/50 mt-4">
            <Label className="text-md font-semibold block">3. Export Format</Label>
            <p className="text-sm p-2 border rounded-md bg-muted">SpinKit JSON (.json)</p>
            {/* CSV Option Removed based on request
            <Select value={exportFormat} onValueChange={(value) => setExportFormat(value as 'json' | 'csv')} disabled={isExporting || currentStep > 3}>
              <SelectTrigger id="format-select" className="w-full md:w-1/3 lg:w-1/4 hover:bg-accent hover:text-accent-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">SpinKit JSON (.json)</SelectItem>
                 <SelectItem value="csv" disabled>CSV (.csv) - Coming Soon</SelectItem> 
              </SelectContent>
            </Select>
            */}
          </section>
        )}
        
        {/* Step 4: Confirmation and Export */}
        {currentStep >= 4 && canProceedFromStep3 && (
          <section className="space-y-4 p-4 border rounded-md bg-muted/20 shadow-sm mt-4">
            <h3 className="text-md font-semibold flex items-center text-foreground">
              <CheckCircle className="mr-2 h-4 w-4 text-primary"/>
              4. Confirm Export Details
            </h3>
            <Card className="p-4 bg-background">
              <CardContent className="p-0">
                <div className="text-sm space-y-1">
                  <p><strong>Connection:</strong> {selectedConnection?.name} ({selectedConnection?.type})</p>
                  <p><strong>Tables/Entities:</strong> {tablesToExportDetails.map(t => t.name).join(', ') || 'None'}</p>
                  <p><strong>Format:</strong> SpinKit JSON (.json)</p>
                </div>
              </CardContent>
            </Card>
          </section>
        )}
      </CardContent>
      <CardFooter className="border-t pt-4">
        <div className="flex w-full justify-between items-center">
            <div>
                {currentStep > 1 && (
                    <Button 
                        variant="outline" 
                        onClick={() => resetWizardToStep(currentStep - 1)} 
                        disabled={isExporting}
                        size="sm"
                    >
                       <ArrowLeft className="mr-2 h-4 w-4"/> Back
                    </Button>
                )}
            </div>
            <div>
                {currentStep < 4 && (
                     <Button 
                        onClick={() => setCurrentStep(currentStep + 1)} 
                        disabled={
                            (currentStep === 1 && !canProceedFromStep1) ||
                            (currentStep === 2 && !canProceedFromStep2) ||
                            (currentStep === 3 && !canProceedFromStep3) ||
                            isExporting || isLoadingTables
                        }
                        size="sm"
                    >
                        Next <ArrowRight className="ml-2 h-4 w-4"/>
                    </Button>
                )}
                {currentStep === 4 && (
                    <Button 
                        onClick={handleExport} 
                        size="lg" 
                        disabled={!canExport} 
                        className="w-full sm:w-auto"
                    >
                        {isExporting ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        ) : (
                        <FileDown className="mr-2 h-5 w-5" /> 
                        )}
                        {isExporting ? "Exporting..." : "Export Selected Data"}
                    </Button>
                )}
            </div>
        </div>
      </CardFooter>
    </Card>
  );
}

    