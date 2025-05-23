
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Edit3, Trash2, ListChecks, Settings, ChevronRight, BarChart2, Loader2, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TARGET_MONGO_FIELDS_MAP, DATA_ENTITIES_KEYS, getEntityTypeLabel, NEW_FIELD_TYPE_OPTIONS, DO_NOT_IMPORT_VALUE } from '@/config/data-import-config';
import type { DatabaseConnection } from '@/stores/databaseSettingsStore'; // For context if needed, though active config might be assumed
import { useDatabaseSettingsStore } from '@/stores/databaseSettingsStore';
import type { PaginatedResponse } from '@/types'; // For API response typing
import { appLogger } from '@/lib/logger';

interface PropertyDefinition {
  name: string;
  dbFieldName: string;
  type: string;
}

interface CollectionSchema {
  name: string;
  entityKey: (typeof DATA_ENTITIES_KEYS)[number];
  dbCollectionName?: string;
  properties: PropertyDefinition[];
}

interface CollectionStatistics {
  totalRecords: number | null;
  propertiesDefined: number;
}

const inferDataTypeFromFieldName = (fieldName: string): string => {
  const lowerField = fieldName.toLowerCase();
  if (['id', '_id', 'slug'].some(term => lowerField.includes(term))) return "ID / String";
  if (lowerField.includes('id') && !lowerField.includes('ids') && !lowerField.startsWith('dj') && !lowerField.startsWith('venue')) return "ID / String"; // For foreign keys like djId
  if (lowerField.includes('date') || lowerField.includes('timestamp') || lowerField.includes('time') || lowerField === 'year') return "Date / Number";
  if (['is', 'has'].some(term => lowerField.startsWith(term)) || lowerField.endsWith('ed') && !lowerField.includes('seed')) return "Boolean";
  if (['score', 'rating', 'count', 'number', 'capacity', 'total', 'fanscore', 'totalplays', 'totalbookings', 'totalrsvps', 'expectedattendance', 'limit', 'page'].some(term => lowerField.includes(term))) return "Number";
  if (['genres', 'tags', 'needs', 'days', 'specialties', 'recordings', 'topartists', 'topvenues', 'populargenres', 'soundsystem', 'typicaleventdays', 'items', 'roles'].some(term => lowerField.includes(term))) return "Array";
  if (['url', 'image', 'pic', 'seed', 'link', 'profilepic'].some(term => lowerField.includes(term))) return "URL / String";
  if (['location', 'city', 'address', 'bio', 'description', 'name', 'title', 'album', 'type', 'text', 'note'].some(term => lowerField.includes(term))) return "Text";
  if (lowerField.includes('hint')) return "Text (AI Hint)";
  return "Text";
};


export default function CollectionSettingsSection() {
  const { toast } = useToast();
  const { connections } = useDatabaseSettingsStore(); // To get active connection for context

  const [appSchema, setAppSchema] = useState<CollectionSchema[]>([]);
  const [selectedCollectionKey, setSelectedCollectionKey] = useState<(typeof DATA_ENTITIES_KEYS)[number] | null>(null);

  const [isAddCollectionDialogOpen, setIsAddCollectionDialogOpen] = useState(false);
  const [newCollectionNameInput, setNewCollectionNameInput] = useState("");

  const [isAddPropertyDialogOpen, setIsAddPropertyDialogOpen] = useState(false);
  const [newPropertyNameInput, setNewPropertyNameInput] = useState("");
  const [newPropertyTypeInput, setNewPropertyTypeInput] = useState(NEW_FIELD_TYPE_OPTIONS[0]);

  const [collectionStats, setCollectionStats] = useState<CollectionStatistics | null>(null);
  const [isStatsLoading, setIsStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  useEffect(() => {
    const activeMongoConnection = connections.find(c => c.isActive && c.type === 'mongodb');
    const initialSchema: CollectionSchema[] = DATA_ENTITIES_KEYS.map(key => {
      const targetFieldsForEntity = TARGET_MONGO_FIELDS_MAP[key as keyof typeof TARGET_MONGO_FIELDS_MAP] || [];
      const properties: PropertyDefinition[] = targetFieldsForEntity.map(fieldName => ({
        name: fieldName,
        dbFieldName: fieldName,
        type: inferDataTypeFromFieldName(fieldName),
      }));

      return {
        name: getEntityTypeLabel(key),
        entityKey: key,
        dbCollectionName: activeMongoConnection?.collections?.[key] || `[Default: ${key}]`,
        properties,
      };
    });
    setAppSchema(initialSchema);
  }, [connections]);

  const selectedCollectionDetails = useMemo(() => {
    return appSchema.find(coll => coll.entityKey === selectedCollectionKey);
  }, [appSchema, selectedCollectionKey]);

  useEffect(() => {
    if (selectedCollectionDetails) {
      const fetchStats = async () => {
        setIsStatsLoading(true);
        setStatsError(null);
        setCollectionStats(null);

        const entityKey = selectedCollectionDetails.entityKey;
        // Determine API path - assumes pluralized entity key matches API path base
        // e.g., 'djs' -> '/api/djs', 'recordings' -> '/api/recordings'
        const apiPath = `/api/${entityKey.toLowerCase()}`;

        try {
          appLogger.info(`[CollectionSettings] Fetching stats for ${entityKey} from ${apiPath}?limit=1`);
          const response = await fetch(`${apiPath}?limit=1`); // Fetch minimal data to get totalItems
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || errorData.details || `Failed to fetch stats for ${selectedCollectionDetails.name}: ${response.statusText}`);
          }
          const data: PaginatedResponse<any> = await response.json();
          setCollectionStats({
            totalRecords: data.totalItems,
            propertiesDefined: selectedCollectionDetails.properties.length,
          });
          appLogger.info(`[CollectionSettings] Stats for ${entityKey}:`, { totalRecords: data.totalItems, propertiesDefined: selectedCollectionDetails.properties.length });

        } catch (error: any) {
          appLogger.error(`[CollectionSettings] Error fetching stats for ${entityKey}:`, error.message);
          setStatsError(error.message || `Could not load stats for ${selectedCollectionDetails.name}.`);
          setCollectionStats({
            totalRecords: null, // Indicate error
            propertiesDefined: selectedCollectionDetails.properties.length,
          });
        } finally {
          setIsStatsLoading(false);
        }
      };
      fetchStats();
    } else {
      setCollectionStats(null); // Clear stats if no collection is selected
    }
  }, [selectedCollectionDetails]);


  const handleAddCollection = () => {
    if (!newCollectionNameInput.trim()) {
      toast({ title: "Error", description: "Collection name cannot be empty.", variant: "destructive" });
      return;
    }
    const newKey = newCollectionNameInput.trim().toLowerCase().replace(/\s+/g, '_') as (typeof DATA_ENTITIES_KEYS)[number];
    if (appSchema.some(c => c.entityKey === newKey)) {
      toast({ title: "Error", description: "A collection with this key already exists.", variant: "destructive" });
      return;
    }
    setAppSchema(prev => [...prev, {
      name: newCollectionNameInput.trim(),
      entityKey: newKey,
      dbCollectionName: newCollectionNameInput.trim().toLowerCase().replace(/\s+/g, '_'),
      properties: []
    }]);
    toast({ title: "Collection Added", description: `Collection "${newCollectionNameInput.trim()}" added to local view. This is a UI mock and does not affect the database.` });
    setNewCollectionNameInput("");
    setIsAddCollectionDialogOpen(false);
  };

  const handleAddProperty = () => {
    if (!selectedCollectionKey || !newPropertyNameInput.trim()) {
      toast({ title: "Error", description: "Property name cannot be empty.", variant: "destructive" });
      return;
    }
    setAppSchema(prev => prev.map(coll => {
      if (coll.entityKey === selectedCollectionKey) {
        if (coll.properties.some(p => p.name.toLowerCase() === newPropertyNameInput.trim().toLowerCase())) {
          toast({ title: "Error", description: `Property "${newPropertyNameInput.trim()}" already exists in ${coll.name}.`, variant: "destructive" });
          return coll;
        }
        return {
          ...coll,
          properties: [...coll.properties, {
            name: newPropertyNameInput.trim(),
            dbFieldName: newPropertyNameInput.trim().toLowerCase().replace(/\s+/g, '_'),
            type: newPropertyTypeInput,
          }]
        };
      }
      return coll;
    }));
    toast({ title: "Property Added", description: `Property "${newPropertyNameInput.trim()}" added to ${selectedCollectionDetails?.name}. This is a UI mock.` });
    setNewPropertyNameInput("");
    setNewPropertyTypeInput(NEW_FIELD_TYPE_OPTIONS[0]);
    setIsAddPropertyDialogOpen(false);
  };

  const handleRemoveProperty = (collectionKey: string, propertyName: string) => {
    setAppSchema(prev => prev.map(coll => {
      if (coll.entityKey === collectionKey) {
        return { ...coll, properties: coll.properties.filter(p => p.name !== propertyName) };
      }
      return coll;
    }));
    toast({ title: "Property Removed", description: `Property "${propertyName}" removed from local view. This is a UI mock.` });
  };

  const handleRemoveCollection = (collectionKeyToRemove: string) => {
     setAppSchema(prev => prev.filter(coll => coll.entityKey !== collectionKeyToRemove));
     if (selectedCollectionKey === collectionKeyToRemove) {
       setSelectedCollectionKey(null);
     }
     toast({ title: "Collection Removed", description: `Collection removed from local view. This is a UI mock.`});
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-xl flex items-center">
            <ListChecks className="mr-3 h-5 w-5 text-primary" />
            Collection & Schema Management
          </CardTitle>
          <CardDescription>
            View application data structures and their conceptual database mappings.
          </CardDescription>
        </div>
        <Dialog open={isAddCollectionDialogOpen} onOpenChange={setIsAddCollectionDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><PlusCircle className="mr-2 h-4 w-4" /> Add New Collection</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Collection (Mock)</DialogTitle>
              <DialogDescription>Define a new data collection for the application (UI only).</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-2">
              <Label htmlFor="newCollectionName">Collection Name (e.g., Playlists)</Label>
              <Input id="newCollectionName" value={newCollectionNameInput} onChange={(e) => setNewCollectionNameInput(e.target.value)} />
            </div>
            <DialogFooter>
              <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
              <Button onClick={handleAddCollection}>Add Collection</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[450px]">
        <Card className="md:col-span-1 shadow-inner">
          <CardHeader className="p-3 border-b">
            <CardTitle className="text-md">Application Collections</CardTitle>
          </CardHeader>
          <ScrollArea className="h-[calc(100%-4rem)]">
            <CardContent className="p-2 space-y-1">
              {appSchema.map(coll => (
                <Button
                  key={coll.entityKey}
                  variant={selectedCollectionKey === coll.entityKey ? "secondary" : "ghost"}
                  className="w-full justify-between text-sm h-auto py-2.5 px-3"
                  onClick={() => setSelectedCollectionKey(coll.entityKey)}
                >
                  <span className="truncate">{coll.name}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Button>
              ))}
            </CardContent>
          </ScrollArea>
        </Card>

        <Card className="md:col-span-2 shadow-inner">
          <CardHeader className="p-3 border-b">
            <div className="flex justify-between items-center">
              <CardTitle className="text-md">
                {selectedCollectionDetails ? `Properties for: ${selectedCollectionDetails.name}` : "Select a Collection"}
              </CardTitle>
              {selectedCollectionKey && (
                 <div className="flex items-center gap-2">
                    <Dialog open={isAddPropertyDialogOpen} onOpenChange={setIsAddPropertyDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="xs" disabled={!selectedCollectionKey}>
                          <PlusCircle className="mr-1 h-3.5 w-3.5" /> Add Property
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Property to: {selectedCollectionDetails?.name}</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div>
                            <Label htmlFor="newPropertyName">Property Name (Application)</Label>
                            <Input id="newPropertyName" value={newPropertyNameInput} onChange={(e) => setNewPropertyNameInput(e.target.value)} className="mt-1" />
                          </div>
                          <div>
                            <Label htmlFor="newPropertyType">Data Type</Label>
                            <Select value={newPropertyTypeInput} onValueChange={setNewPropertyTypeInput}>
                              <SelectTrigger id="newPropertyType" className="mt-1"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {NEW_FIELD_TYPE_OPTIONS.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <DialogFooter>
                          <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                          <Button onClick={handleAddProperty}>Add Property</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <Button variant="destructive-outline" size="xs" onClick={() => handleRemoveCollection(selectedCollectionKey!)} disabled={!selectedCollectionKey || DATA_ENTITIES_KEYS.includes(selectedCollectionKey)}>
                        <Trash2 className="mr-1 h-3.5 w-3.5" /> Remove Collection
                    </Button>
                 </div>
              )}
            </div>
             {selectedCollectionDetails?.dbCollectionName && <p className="text-xs text-muted-foreground pt-0.5">Conceptual DB Collection: <code>{selectedCollectionDetails.dbCollectionName}</code></p>}
          </CardHeader>
          <CardContent className="p-0"> {/* Removed padding here to allow nested cards to control their own padding */}
            {selectedCollectionDetails ? (
              <>
                {/* Statistics Card */}
                <Card className="m-2 shadow-sm border bg-muted/20">
                  <CardHeader className="p-2 border-b">
                    <CardTitle className="text-sm flex items-center">
                      <BarChart2 className="mr-2 h-4 w-4 text-primary" />
                      Collection Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 text-xs space-y-1">
                    {isStatsLoading && (
                      <div className="flex items-center text-muted-foreground">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading statistics...
                      </div>
                    )}
                    {statsError && (
                      <div className="flex items-center text-destructive">
                        <AlertTriangle className="mr-2 h-4 w-4" /> {statsError}
                      </div>
                    )}
                    {!isStatsLoading && !statsError && collectionStats && (
                      <>
                        <p><strong>Total Records:</strong> {collectionStats.totalRecords !== null ? collectionStats.totalRecords : 'N/A'} (from active data source)</p>
                        <p><strong>Properties Defined:</strong> {collectionStats.propertiesDefined} (in application schema)</p>
                      </>
                    )}
                    {!isStatsLoading && !statsError && !collectionStats && (
                      <p className="text-muted-foreground">No statistics available.</p>
                    )}
                  </CardContent>
                </Card>

                {/* Properties Table */}
                {selectedCollectionDetails.properties.length > 0 ? (
                  <ScrollArea className="max-h-[calc(100vh-25rem)]"> {/* Adjust max-height as needed */}
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[35%] text-xs">Application Property</TableHead>
                          <TableHead className="w-[35%] text-xs">Database Field Name</TableHead>
                          <TableHead className="w-[20%] text-xs">Data Type</TableHead>
                          <TableHead className="w-[10%] text-xs text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedCollectionDetails.properties.map((prop) => (
                          <TableRow key={prop.name}>
                            <TableCell className="font-medium text-xs py-2">{prop.name}</TableCell>
                            <TableCell className="text-xs py-2"><code>{prop.dbFieldName}</code></TableCell>
                            <TableCell className="text-xs py-2">{prop.type}</TableCell>
                            <TableCell className="text-right py-2">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6" 
                                onClick={() => handleRemoveProperty(selectedCollectionDetails.entityKey, prop.name)} 
                                disabled={DATA_ENTITIES_KEYS.includes(selectedCollectionDetails.entityKey) && TARGET_MONGO_FIELDS_MAP[selectedCollectionDetails.entityKey as keyof typeof TARGET_MONGO_FIELDS_MAP]?.includes(prop.name)}
                                title="Remove property (mock)"
                              >
                                <Trash2 className="h-3.5 w-3.5 text-destructive/70 hover:text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                ) : (
                    <p className="p-4 text-sm text-muted-foreground text-center">No properties defined for this collection yet.</p>
                )}
              </>
            ) : (
              <p className="p-4 text-sm text-muted-foreground text-center">Select a collection from the left to view its properties and statistics.</p>
            )}
          </CardContent>
        </Card>
      </CardContent>
      {/* Footer can be added if needed */}
    </Card>
  );
}

    