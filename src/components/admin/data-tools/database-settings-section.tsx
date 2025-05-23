// src/components/admin/data-tools/database-settings-section.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogClose, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription as AlertDialogDesc, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { Database, TestTubeDiagonal, Save, ShieldCheck, PlusCircle, Edit3, Trash2, CheckCircle, ServerCrash, AlertTriangle, Info, Power, ListChecks } from "lucide-react";
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useDatabaseSettingsStore } from '@/stores/databaseSettingsStore';
import type { DatabaseConnection, CollectionResourceKey } from '@/stores/databaseSettingsStore';
import { TARGET_MONGO_FIELDS_MAP, DATA_ENTITIES_KEYS } from '@/config/data-import-config';


const defaultMongoCollections = DATA_ENTITIES_KEYS.reduce((acc, key) => {
    acc[key] = key; // e.g., djs: "djs", venues: "venues"
    return acc;
}, {} as Record<CollectionResourceKey, string>);


function maskConnectionString(connStr: string | undefined, type: DatabaseConnection['type']): string {
  if (!connStr || typeof connStr !== 'string') return 'Not Set / Invalid';
  
  if (connStr.startsWith('internal://')) {
    return connStr;
  }
  if (type === 'notion') {
    if (connStr.length > 8 && connStr.startsWith('secret_')) return `secret_****${connStr.slice(-4)}`;
    return 'secret_****';
  }

  try {
    const url = new URL(connStr);
    if (url.password) {
      url.password = '****';
    }
    if (url.username) {
      url.username = url.username.length > 1 ? url.username[0] + '****' : '****';
    }
    return url.toString();
  } catch (e) {
    const parts = connStr.split('@');
    if (parts.length === 2) {
        const credentials = parts[0].split('//');
        if (credentials.length === 2 && credentials[1]) { 
            const userPass = credentials[1].split(':');
            const user = userPass[0].length > 1 ? userPass[0][0] + '****' : '****';
            const pass = userPass[1] ? '****' : ''; 
            return `${credentials[0]}//${user}${pass ? ':' + pass : ''}@${parts[1]}`;
        }
    }
    if (connStr.length > 8) {
        return connStr.substring(0, Math.min(8, connStr.length / 2)) + '****' + connStr.substring(connStr.length - Math.min(4, connStr.length / 3));
    }
    return '****'; 
  }
}


export default function DatabaseSettingsSection() {
  const { connections, addConnection, editConnection, deleteConnection, setActiveConnection } = useDatabaseSettingsStore();
  
  const [isTesting, setIsTesting] = useState<string | null>(null); 
  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
  const [editingConnectionConfig, setEditingConnectionConfig] = useState<DatabaseConnection | null>(null); 
  
  const [formData, setFormData] = useState<Partial<DatabaseConnection>>({
    name: '',
    type: 'localJson', 
    connectionString: 'internal://local-json-files',
    isActive: false,
    collections: { ...defaultMongoCollections }
  });

  const activeConnection = connections.find(conn => conn.isActive);

  const handleOpenAddDialog = () => {
    setEditingConnectionConfig(null); 
    setFormData({ 
        name: '', 
        type: 'localJson', 
        connectionString: 'internal://local-json-files', 
        isActive: connections.length === 0, 
        collections: { ...defaultMongoCollections } 
    }); 
    setIsAddEditDialogOpen(true);
  };

  const handleOpenEditDialog = (conn: DatabaseConnection) => {
    setEditingConnectionConfig(conn);
    setFormData({ 
        ...conn, 
        collections: (conn.type === 'mongodb') ? { ...(conn.collections || defaultMongoCollections) } : undefined 
    }); 
    setIsAddEditDialogOpen(true);
  };

  const handleFormDataChange = (field: keyof DatabaseConnection | 'collections', value: any) => {
    setFormData(prev => {
        const newState = { ...prev, [field]: value };
        if (field === 'type') {
            if (value === 'mongodb') {
                newState.collections = { ...(prev.collections || defaultMongoCollections) };
                newState.connectionString = prev.connectionString?.startsWith('mongodb+srv://') || prev.connectionString?.startsWith('mongodb://') ? prev.connectionString : '';
            } else if (value === 'notion') {
                newState.collections = undefined;
                newState.connectionString = prev.connectionString?.includes('secret_') ? prev.connectionString : '';
            } else if (value === 'localJson') {
                newState.collections = undefined;
                newState.connectionString = 'internal://local-json-files';
            } else { 
                newState.collections = undefined;
                newState.connectionString = prev.connectionString?.startsWith(value + '://') ? prev.connectionString : '';
            }
        }
        return newState;
    });
  };
  
  const handleCollectionNameChange = (colKey: CollectionResourceKey, colValue: string) => {
    setFormData(prev => ({
      ...prev,
      collections: {
        ...(prev.collections || {}),
        [colKey]: colValue,
      },
    }));
  };

  const handleSaveConnection = () => {
    if (!formData.name?.trim()) {
      toast({ title: "Error", description: "Configuration Name is required.", variant: "destructive" });
      return;
    }
    if (formData.type !== 'localJson' && !formData.connectionString?.trim()) {
      toast({ title: "Error", description: "Connection String/Identifier is required for non-Local JSON types.", variant: "destructive" });
      return;
    }
    
    const finalFormDataToSave: Omit<DatabaseConnection, 'id'> & { id?: string } = {
        name: formData.name!,
        type: formData.type!,
        connectionString: formData.connectionString!,
        isActive: formData.isActive || false,
        collections: (formData.type === 'mongodb') ? formData.collections : undefined,
    };
    
    if (editingConnectionConfig?.id) {
      editConnection({ ...finalFormDataToSave, id: editingConnectionConfig.id } as DatabaseConnection);
    } else {
      addConnection(finalFormDataToSave as Omit<DatabaseConnection, 'id'>);
    }
    
    setIsAddEditDialogOpen(false);
    setEditingConnectionConfig(null); 
  };
  
  const handleTestConnection = (conn: DatabaseConnection | Partial<DatabaseConnection> | null, testSourceId?: string) => {
    if(!conn || !conn.connectionString || !conn.type) return;
    const testId = testSourceId || conn.id || 'dialog-test';
    setIsTesting(testId); 
    toast({
      title: "Testing Connection...",
      description: `Attempting to connect to ${conn.type} using ${maskConnectionString(conn.connectionString, conn.type)}.`,
    });
    setTimeout(() => {
      setIsTesting(null); 
      const success = Math.random() > 0.3; 
      if (success) {
        toast({ title: "Connection Successful!", description: "Successfully connected.", variant: "default" });
      } else {
        toast({ title: "Connection Failed", description: "Could not connect. Please check settings.", variant: "destructive" });
      }
    }, 1500);
  };

  return (
    <TooltipProvider>
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center"> {/* Changed from text-2xl for consistency */}
          <Database className="mr-3 h-5 w-5 text-primary" /> {/* Changed icon from ServerCog */}
          Database Settings
        </CardTitle>
        <CardDescription>
          Manage and select the active data source configuration for the application.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        <Card className="shadow-md max-w-lg"> {/* Added max-w-lg to constrain width */}
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center"> {/* Changed from text-xl */}
              <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
              Active Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeConnection ? (
              <>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Name</Label>
                  <p className="text-md font-semibold">{activeConnection.name}</p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Type</Label>
                  <p className="capitalize text-sm">{activeConnection.type.replace(/([A-Z])/g, ' $1').trim()}</p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Identifier (Masked)</Label>
                  <p className="font-mono text-xs break-all">{maskConnectionString(activeConnection.connectionString, activeConnection.type)}</p>
                </div>
                 {activeConnection.type === 'mongodb' && activeConnection.collections && (
                  <div className="pt-2">
                    <Label className="text-xs font-medium text-muted-foreground flex items-center mb-1">
                        <ListChecks className="h-4 w-4 mr-1.5"/> MongoDB Collections
                    </Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs pl-2">
                      {DATA_ENTITIES_KEYS.map((key) => (
                        <div key={key} className="truncate">
                          <span className="capitalize font-medium">{key.charAt(0).toUpperCase() + key.slice(1)}:</span> 
                          <code className="text-muted-foreground ml-1">{activeConnection.collections![key] || 'N/A'}</code>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {activeConnection.type === 'notion' && (
                    <p className="text-xs text-muted-foreground mt-1">For Notion, specific Database IDs are configured via environment variables (e.g., NOTION_DJS_DATABASE_ID).</p>
                )}
                <div className="flex gap-1 pt-2">
                   <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEditDialog(activeConnection)}>
                            <Edit3 className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>Edit Active Configuration</p></TooltipContent>
                  </Tooltip>
                   <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={() => handleTestConnection(activeConnection, `active-${activeConnection.id}`)} disabled={isTesting === `active-${activeConnection.id}` || activeConnection.type === 'localJson'}>
                        {isTesting === `active-${activeConnection.id}` ? <ServerCrash className="h-4 w-4 animate-ping" /> : <TestTubeDiagonal className="h-4 w-4" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>{isTesting === `active-${activeConnection.id}` ? "Testing..." : (activeConnection.type === 'localJson' ? "Test N/A for Local JSON" : "Test Configuration")}</p></TooltipContent>
                  </Tooltip>
                </div>
              </>
            ) : (
              <div className="text-center py-4 text-muted-foreground flex items-center justify-center">
                <Info className="mr-2 h-5 w-5" />
                No active configuration selected. Please configure and activate one below.
              </div>
            )}
          </CardContent>
        </Card>
        
        <Separator className="my-8" />

        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">All Configured Connections</h3> {/* Changed from text-xl */}
             <Tooltip>
                <TooltipTrigger asChild>
                    <Button onClick={handleOpenAddDialog} variant="ghost" size="icon">
                    <PlusCircle className="h-5 w-5" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent><p>Add New Configuration</p></TooltipContent>
            </Tooltip>
          </div>
          {connections.length === 0 ? ( 
            <p className="text-muted-foreground text-center py-4">No data source configurations defined yet. Click "+" to add one.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {connections.map(conn => (
                <Card key={conn.id} className={cn("relative transition-all flex flex-col", conn.isActive && "border-primary ring-1 ring-primary")}>
                  {conn.isActive && (
                    <div className="absolute -top-2 -left-2 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full flex items-center shadow-sm z-10">
                      <CheckCircle className="h-3 w-3 mr-1" /> Active
                    </div>
                  )}
                  <CardHeader className="pb-2 pt-4"> 
                     <div className="flex items-baseline gap-2">
                      <CardTitle className="text-md truncate">{conn.name}</CardTitle>
                      <span className="text-xs text-muted-foreground capitalize">({conn.type.replace(/([A-Z])/g, ' $1').trim()})</span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    {/* Placeholder for any brief summary content if needed */}
                  </CardContent>
                  <CardFooter className="flex flex-wrap gap-1 items-center mt-auto pt-2 pb-3 px-3 justify-start">
                     {!conn.isActive && (
                       <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => setActiveConnection(conn.id)}>
                            <Power className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Set Active</p></TooltipContent>
                      </Tooltip>
                    )}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEditDialog(conn)}>
                          <Edit3 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent><p>Edit Connection</p></TooltipContent>
                    </Tooltip>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" disabled={conn.isActive && connections.length === 1}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent><p>Delete Connection</p></TooltipContent>
                        </Tooltip>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                          <AlertDialogDesc>
                            Are you sure you want to delete the configuration "{conn.name}"? This action cannot be undone.
                          </AlertDialogDesc>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteConnection(conn.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>

        <Dialog open={isAddEditDialogOpen} onOpenChange={(isOpen) => {
            setIsAddEditDialogOpen(isOpen);
            if (!isOpen) setEditingConnectionConfig(null); 
        }}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>{editingConnectionConfig?.id ? 'Edit Data Source Configuration' : 'Add New Data Source Configuration'}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
              <div>
                <Label htmlFor="connName">Configuration Name</Label>
                <Input id="connName" value={formData.name || ''} onChange={(e) => handleFormDataChange('name', e.target.value)} placeholder="e.g., Production DB, Notion API" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="connType">Data Source Type</Label>
                <Select value={formData.type || 'localJson'} onValueChange={(value) => handleFormDataChange('type', value as DatabaseConnection['type'])}>
                  <SelectTrigger id="connType" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="localJson">Local JSON</SelectItem>
                    <SelectItem value="mongodb">MongoDB</SelectItem>
                    <SelectItem value="notion">Notion</SelectItem>
                    <SelectItem value="postgresql" disabled>PostgreSQL (TBD)</SelectItem>
                    <SelectItem value="mysql" disabled>MySQL (TBD)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="connString">{formData.type === 'notion' ? 'Notion API Key' : 'Connection String / Path'}</Label>
                <Input 
                  id="connString" 
                  type="password" 
                  value={formData.connectionString || ''} 
                  onChange={(e) => handleFormDataChange('connectionString', e.target.value)} 
                  placeholder={
                    formData.type === 'localJson' ? 'internal://local-json-files' : 
                    formData.type === 'notion' ? 'secret_YOUR_NOTION_INTEGRATION_TOKEN' :
                    formData.type === 'mongodb' ? 'mongodb+srv://user:pass@host/db' :
                    "Connection specific URI"
                  }
                  className="mt-1" />
                 <p className="text-xs text-muted-foreground mt-1">
                    {formData.type === 'notion' 
                        ? "Enter your Notion Internal Integration Token. Database IDs are managed via environment variables." 
                        : formData.type === 'localJson'
                        ? "Typically 'internal://local-json-files' for mock data."
                        : "Enter the full URI or key. It will be masked for display where possible."
                    }
                 </p>
              </div>
               <div className="flex items-center space-x-2">
                <input
                    type="checkbox"
                    id="connIsActive"
                    checked={!!formData.isActive}
                    onChange={(e) => handleFormDataChange('isActive', e.target.checked)}
                    className="h-4 w-4 rounded border-primary text-primary focus:ring-primary accent-primary cursor-pointer"
                />
                <Label htmlFor="connIsActive" className="text-sm font-normal cursor-pointer">
                    Set as active configuration
                </Label>
              </div>

              {formData.type === 'mongodb' && (
                <>
                  <Separator className="my-2" />
                  <div>
                    <h4 className="text-md font-medium mb-2 flex items-center">
                        <ListChecks className="h-4 w-4 mr-1.5 text-primary"/> MongoDB Collection Names
                    </h4>
                    <DialogDescription className="text-xs mb-3">Specify the MongoDB collection names for each resource type. These should match your environment variable setup (e.g., `MONGODB_DJS_COLLECTION`).</DialogDescription>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                      {DATA_ENTITIES_KEYS.map((colKey) => (
                        <div key={colKey}>
                          <Label htmlFor={`col-${colKey}`} className="capitalize text-sm">
                            {colKey.charAt(0).toUpperCase() + colKey.slice(1)} Collection
                          </Label>
                          <Input
                            id={`col-${colKey}`}
                            value={formData.collections?.[colKey] || ''}
                            onChange={(e) => handleCollectionNameChange(colKey, e.target.value)}
                            placeholder={`e.g., ${defaultMongoCollections[colKey] || colKey}`}
                            className="mt-1 h-8 text-sm"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
              {formData.type === 'notion' && (
                  <div className="mt-2 text-xs text-muted-foreground p-2 border rounded-md bg-muted/30">
                    <Info className="inline h-3 w-3 mr-1"/> For Notion, specific Database IDs (e.g., for DJs, Venues) are configured using server-side environment variables (e.g., `NOTION_DJS_DATABASE_ID`). This UI entry primarily stores the API key.
                  </div>
              )}

            </div>
            <DialogFooter className="sm:justify-between">
               <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={() => handleTestConnection(formData, 'dialog-test')} disabled={isTesting === 'dialog-test' || !formData.connectionString || formData.type === 'localJson'}>
                        {isTesting === 'dialog-test' ? <ServerCrash className="mr-1.5 h-4 w-4 animate-ping" /> : <TestTubeDiagonal className="mr-1.5 h-4 w-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>{isTesting === 'dialog-test' ? "Testing..." : (formData.type === 'localJson' ? "Test N/A for Local JSON" : "Test Configuration")}</p></TooltipContent>
              </Tooltip>
             <div className="flex gap-2">
                <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                <Button onClick={handleSaveConnection}>Save Configuration</Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <CardFooter className="pt-6 border-t">
            <Button onClick={() => toast({ title: "Note", description: "UI settings are persisted locally. Actual backend data source is set via environment variables."})} size="sm" variant="outline" disabled>
                <Save className="mr-2 h-4 w-4" /> Save All Database Settings (UI Only)
            </Button>
            <p className="text-xs text-muted-foreground ml-4">Note: Changes to this UI are persisted locally. The actual backend data source is determined by server environment variables.</p>
        </CardFooter>
      </CardContent>
    </Card>
    </TooltipProvider>
  );
}
