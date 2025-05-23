
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription as AlertDialogDesc, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useToast } from "@/hooks/use-toast";
import {
  LayoutGrid,
  Users,
  Plus,
  MousePointer2,
  RotateCcw,
  RotateCw,
  CheckCircle,
  ListFilter,
  Search,
  GripVertical,
  Sparkles,
  Rows,
  Pin,
  Ban,
  Trash2,
  UserX,
  ExternalLink,
  Edit3,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePinnedItemsStore } from "@/stores/pinnedItemsStore";
import { useToolWindowsStore } from "@/stores/toolWindowsStore";
import { useUserPreferencesStore } from "@/stores/userPreferencesStore"; // For AI feature toggle

const mockEvents = [
  { id: "evt1", name: "Summer Fest - Day 1", date: "2024-08-16", venue: "Main Stage Park" },
  { id: "evt2", name: "Club Night Series - Techno", date: "2024-08-17", venue: "The Underground" },
  { id: "evt3", name: "Corporate Gala Dinner", date: "2024-09-05", venue: "Grand Ballroom" },
];

const mockArtists = [
  { id: "dj1", name: "DJ Sparkle", genre: "House", imageUrl: "dj-sparkle.png", aiHint: "dj party" },
  { id: "dj2", name: "Groove Master G", genre: "Funk", imageUrl: "dj-groove.png", aiHint: "dj concert" },
  { id: "dj3", name: "Beatrix Kiddo", genre: "Electronic", imageUrl: "dj-beatrix.png", aiHint: "dj neon" },
  { id: "dj4", name: "Vinyl Villain", genre: "Rock", imageUrl: "dj-vinyl.png", aiHint: "dj dark" },
  { id: "dj5", name: "DJ Echo", genre: "Ambient", imageUrl: "dj-echo.png", aiHint: "dj chill" },
  { id: "dj6", name: "Selector Supreme", genre: "Reggae", imageUrl: "dj-selector.png", aiHint: "dj beach" },
];

interface TimelineHour {
  label: string;
  startHour: number; 
}

interface TimelineSlot {
  id: string;
  artistId: string | null;
  artistName: string;
  artistImageUrl?: string; 
  artistAiHint?: string;
  startHour: number;
  duration: number; 
  row: number;
  notes?: string;
}

interface Lane {
  id: string;
  title?: string;
}

const ROW_HEIGHT_PX = 64; 
const ROW_HANDLE_WIDTH_PX = 120; 
const HOUR_COL_MIN_WIDTH_PX = 110; 

const generateTimelineHours = (): TimelineHour[] => {
  const hours: TimelineHour[] = [];
  for (let i = 8; i <= 19; i++) { 
    let label: string;
    const displayHour = i % 12 === 0 ? 12 : i % 12;
    const suffix = i < 12 || i === 24 ? " AM" : " PM";
    if (i === 24) label = "12 AM"; 
    else label = `${displayHour}${suffix}`;
    hours.push({ label, startHour: i });
  }
  return hours;
};

const timelineHours: TimelineHour[] = generateTimelineHours();
const hourBlockWidthPercent = 100 / timelineHours.length;

export default function InteractiveSchedulingPage() {
  const { toggleToolWindow } = useToolWindowsStore();
  const { addPinnedItem } = usePinnedItemsStore();
  const { featureToggles } = useUserPreferencesStore(); // For AI feature toggle
  const { toast } = useToast();

  const [selectedEventId, setSelectedEventId] = useState<string | undefined>(mockEvents[0]?.id);
  const selectedEvent = mockEvents.find(e => e.id === selectedEventId);
  const [selectedArtistId, setSelectedArtistId] = useState<string | null>(null);
  
  const [lanes, setLanes] = useState<Lane[]>([
    { id: `lane-${Date.now()}-1`, title: "Lane 1" },
    { id: `lane-${Date.now()}-2`, title: "Lane 2" },
  ]);
  const [timelineSlots, setTimelineSlots] = useState<TimelineSlot[]>([]);
  
  const [hoveredCell, setHoveredCell] = useState<{ hour: number; row: number } | null>(null);
  const [selectedCell, setSelectedCell] = useState<{ hour: number; row: number } | null>(null);
  const [hoveredColumn, setHoveredColumn] = useState<number | null>(null);
  const [hoveredRowHandle, setHoveredRowHandle] = useState<number | null>(null);
  const [draggingOverCell, setDraggingOverCell] = useState<{hour: number, row: number} | null>(null);

  const [isSlotDialogOpen, setIsSlotDialogOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimelineSlot | null>(null);
  const [slotForm, setSlotForm] = useState({ artistName: "", startTime: "", endTime: "", notes: "" });
  const [defaultSlotDurationHours, setDefaultSlotDurationHours] = useState(2);

  const [isLaneTitleDialogOpen, setIsLaneTitleDialogOpen] = useState(false);
  const [editingLaneConfig, setEditingLaneConfig] = useState<{ index: number; currentTitle: string } | null>(null);


  const handleArtistDragStart = (e: React.DragEvent<HTMLDivElement>, artist: typeof mockArtists[0]) => {
    const artistData = {
      id: artist.id,
      name: artist.name,
      genre: artist.genre,
      imageUrl: artist.imageUrl, 
      aiHint: artist.aiHint
    };
    e.dataTransfer.setData("application/json", JSON.stringify(artistData));
    e.dataTransfer.effectAllowed = "move";
  };

  const handleSlotDragStart = (e: React.DragEvent<HTMLDivElement>, slotId: string) => {
    e.dataTransfer.setData("application/slot-info", JSON.stringify({ type: 'existing-slot', id: slotId }));
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleCellDragEnter = (e: React.DragEvent<HTMLDivElement>, hour: number, rowIndex: number) => {
    e.preventDefault();
    if (e.dataTransfer.types.includes("application/json") || e.dataTransfer.types.includes("application/slot-info")) {
        setDraggingOverCell({ hour, row: rowIndex });
    }
  };

  const handleCellDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDraggingOverCell(null);
    }
  };
  
  const parseTimeToHour = (timeStr: string): number => {
    const upperTimeStr = timeStr.trim().toUpperCase();
    const amPmMatch = upperTimeStr.match(/(\d+)(:(\d+))?\s*(AM|PM)/);
    if (amPmMatch) {
        let hour = parseInt(amPmMatch[1]);
        const minutes = amPmMatch[3] ? parseInt(amPmMatch[3]) : 0;
        const period = amPmMatch[4];
        if (period === 'PM' && hour < 12) hour += 12;
        if (period === 'AM' && hour === 12) hour = 0; // Midnight case
        if (period === 'AM' && hour === 12 && minutes > 0) hour = 0; // 12:xx AM is hour 0
        return hour + (minutes / 60);
    }
    const numericMatch = parseFloat(timeStr);
    if(!isNaN(numericMatch)) return numericMatch;
    return timelineHours[0].startHour; 
  };

  const formatHourToTime = (hour: number): string => {
    const h = Math.floor(hour);
    const minutes = Math.round((hour % 1) * 60);
    const displayHour = h === 0 ? 12 : (h % 12 === 0 ? 12 : h % 12); // Correct 12 AM/PM display
    const suffix = h < 12 || h === 24 ? " AM" : " PM"; // h === 24 also AM (midnight start of next day)
    if (minutes === 0) return `${displayHour}${suffix}`;
    return `${displayHour}:${minutes.toString().padStart(2, '0')}${suffix}`;
  };


  const handleTimelineDrop = (e: React.DragEvent<HTMLDivElement>, dropHour: number, dropRowIndex: number) => {
    e.preventDefault();
    setHoveredCell(null);
    setHoveredColumn(null);
    setDraggingOverCell(null);

    const existingSlotInfoString = e.dataTransfer.getData("application/slot-info");
    const newArtistDataString = e.dataTransfer.getData("application/json");

    let targetRow = dropRowIndex;

    if (existingSlotInfoString) {
      try {
        const slotInfo = JSON.parse(existingSlotInfoString);
        if (slotInfo.type === 'existing-slot') {
           const slotToMove = timelineSlots.find(s => s.id === slotInfo.id);
           if (!slotToMove) return;
           const isOccupied = timelineSlots.some(
            slot => slot.id !== slotInfo.id && 
                    slot.row === targetRow &&
                    dropHour < slot.startHour + slot.duration &&
                    dropHour + slotToMove.duration > slot.startHour
          );
          if(isOccupied){
            toast({ title: "Slot Conflict", description: "Cannot move timeslot here, it overlaps with another.", variant: "destructive"});
            return;
          }
          setTimelineSlots(prevSlots =>
            prevSlots.map(slot =>
              slot.id === slotInfo.id ? { ...slot, startHour: dropHour, row: targetRow } : slot
            )
          );
           toast({ title: "Timeslot Moved", description: `${slotToMove.artistName}'s slot moved to Row ${targetRow + 1} at ${formatHourToTime(dropHour)}.`});
        }
      } catch (error) { console.error("Error parsing existing slot data:", error); }
    } else if (newArtistDataString) {
      try {
        const artist = JSON.parse(newArtistDataString);
        const newSlotDuration = defaultSlotDurationHours;
        
        // Find first available row if dropped generally, or use targetRow if dropped on specific cell
        let assignedRow = targetRow; // Assume drop on cell dictates row
        if (targetRow === -1) { // -1 can indicate drop on header or unassigned area
            let foundAvailable = false;
            for (let r = 0; r < lanes.length; r++) {
                const isCurrentlyOccupied = timelineSlots.some(
                    slot => slot.row === r &&
                            dropHour < slot.startHour + slot.duration &&
                            dropHour + newSlotDuration > slot.startHour
                );
                if (!isCurrentlyOccupied) {
                    assignedRow = r;
                    foundAvailable = true;
                    break;
                }
            }
            if (!foundAvailable) {
                assignedRow = 0; // Default to first row if all are occupied at this hour
            }
        } else {
             const isCellOccupied = timelineSlots.some(
                slot => slot.row === assignedRow &&
                        dropHour < slot.startHour + slot.duration &&
                        dropHour + newSlotDuration > slot.startHour
            );
            if (isCellOccupied) {
                toast({ title: "Slot Occupied", description: "This timeslot is already taken in this lane.", variant: "destructive"});
                return; 
            }
        }

        const newSlot: TimelineSlot = {
          id: `slot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          artistId: artist.id,
          artistName: artist.name,
          artistImageUrl: artist.imageUrl,
          artistAiHint: artist.aiHint,
          startHour: dropHour,
          duration: newSlotDuration,
          row: assignedRow,
          notes: "",
        };
        setTimelineSlots(prevSlots => [...prevSlots, newSlot]);
        toast({ title: "Artist Scheduled", description: `${artist.name} added to Row ${assignedRow + 1} at ${formatHourToTime(dropHour)} for ${newSlotDuration}hr(s).`});
      } catch (error) { console.error("Error parsing artist data on drop:", error); }
    }
  };
  
  const handleAddLane = () => {
    setLanes(prev => [...prev, { id: `lane-${Date.now()}-${prev.length + 1}`, title: `Lane ${prev.length + 1}` }]);
  };

  const handleRowHandleClick = (rowIndex: number) => {
    setSelectedRow(prev => prev === rowIndex ? null : rowIndex);
    setSelectedCell(null);
  };

  const handleCellClick = (hour: number, rowIndex: number) => {
    setSelectedCell(prev => (prev?.hour === hour && prev?.row === rowIndex) ? null : { hour, row: rowIndex });
    setSelectedRow(null);
  };

  const openNewSlotDialog = () => {
    setEditingSlot(null);
    let defaultStartHour = selectedCell?.hour || timelineHours[0].startHour;
    let assignedRow = selectedCell?.row !== undefined ? selectedCell.row : 0;
    
    setSlotForm({
      artistName: "",
      startTime: formatHourToTime(defaultStartHour),
      endTime: formatHourToTime(defaultStartHour + defaultSlotDurationHours),
      notes: ""
    });
    // @ts-ignore
    setEditingSlot({ intendedRow: assignedRow, intendedHour: defaultStartHour });
    setIsSlotDialogOpen(true);
  };

  const openEditSlotDialog = (slot: TimelineSlot) => {
    setEditingSlot(slot);
    setSlotForm({
      artistName: slot.artistName,
      startTime: formatHourToTime(slot.startHour),
      endTime: formatHourToTime(slot.startHour + slot.duration),
      notes: slot.notes || ""
    });
    setIsSlotDialogOpen(true);
  };

  const handleDeleteSlot = (slotId: string) => {
    const slotToDelete = timelineSlots.find(s => s.id === slotId);
    setTimelineSlots(prev => prev.filter(s => s.id !== slotId));
    setIsSlotDialogOpen(false); 
    setEditingSlot(null);
    toast({ title: "Timeslot Deleted", description: `Slot for ${slotToDelete?.artistName || 'Unassigned'} removed.`});
  };

  const handleClearArtistFromSlot = (slotId: string) => {
    setTimelineSlots(prevSlots =>
      prevSlots.map(slot =>
        slot.id === slotId
          ? { ...slot, artistId: null, artistName: "Unassigned Slot", artistImageUrl: undefined, artistAiHint: undefined }
          : slot
      )
    );
    toast({ title: "Artist Cleared", description: "The artist has been unassigned from this timeslot." });
  };
  
  const handleSaveSlot = () => {
    const startHour = parseTimeToHour(slotForm.startTime);
    const endHour = parseTimeToHour(slotForm.endTime);
    let duration = Math.max(0.25, endHour - startHour); // Minimum 15 min duration
    if (endHour <= startHour) {
        toast({ title: "Invalid Time", description: "End time must be after start time.", variant: "destructive"});
        duration = defaultSlotDurationHours; 
    }

    if (editingSlot && editingSlot.id) { 
      const originalSlot = timelineSlots.find(s => s.id === editingSlot.id);
      if (!originalSlot) return;
      const targetRow = originalSlot.row;
      const isOccupied = timelineSlots.some(
        slot => slot.id !== editingSlot.id &&
                slot.row === targetRow &&
                startHour < slot.startHour + slot.duration &&
                startHour + duration > slot.startHour
      );
      if (isOccupied) {
        toast({ title: "Slot Conflict", description: "This timeslot overlaps with an existing slot in the same lane.", variant: "destructive"});
        return;
      }
      setTimelineSlots(prev => prev.map(s =>
        s.id === editingSlot!.id 
        ? { ...s, artistName: slotForm.artistName, startHour, duration, notes: slotForm.notes }
        : s
      ));
    } else { 
      // @ts-ignore
      const targetRow = editingSlot?.intendedRow !== undefined ? editingSlot.intendedRow : (selectedCell?.row || 0);
      // @ts-ignore
      let targetHour = editingSlot?.intendedHour !== undefined ? editingSlot.intendedHour : startHour;
      
      const newSlotArtist = mockArtists.find(a => a.name === slotForm.artistName);
      const isOccupied = timelineSlots.some(
        slot => slot.row === targetRow &&
                targetHour < slot.startHour + slot.duration &&
                targetHour + duration > slot.startHour
      );
      if (isOccupied) {
        toast({ title: "Slot Conflict", description: "This timeslot overlaps with an existing slot in the target lane.", variant: "destructive"});
        return;
      }
      const newSlot: TimelineSlot = {
        id: `slot-${Date.now()}`,
        artistId: newSlotArtist?.id || null,
        artistName: slotForm.artistName || "Unassigned Slot",
        artistImageUrl: newSlotArtist?.imageUrl,
        artistAiHint: newSlotArtist?.aiHint,
        startHour: targetHour,
        duration: duration,
        row: targetRow,
        notes: slotForm.notes,
      };
      setTimelineSlots(prev => [...prev, newSlot]);
    }
    setIsSlotDialogOpen(false);
    setEditingSlot(null);
    toast({ title: "Timeslot Saved", description: "The timeslot has been successfully saved."});
  };
  
  const handlePinArtist = (artist: typeof mockArtists[0]) => {
    addPinnedItem({ type: 'DJ', name: artist.name, href: `/djs/${artist.id}`, imageUrl: artist.imageUrl, aiHint: artist.aiHint });
  };

  const handleIgnoreArtist = (artist: typeof mockArtists[0]) => {
    toast({ title: "Artist Ignored (Mock)", description: `${artist.name} will be hidden from future suggestions (simulated).` });
  };
  
  const openSetLaneTitleDialog = (laneIndex: number) => {
    setEditingLaneConfig({ index: laneIndex, currentTitle: lanes[laneIndex].title || "" });
    setIsLaneTitleDialogOpen(true);
  };

  const handleSaveLaneTitle = () => {
    if (editingLaneConfig) {
      setLanes(prevLanes => prevLanes.map((lane, index) => 
        index === editingLaneConfig.index ? { ...lane, title: editingLaneConfig.currentTitle } : lane
      ));
      toast({ title: "Lane Title Updated", description: `Lane ${editingLaneConfig.index + 1} title set to "${editingLaneConfig.currentTitle}".`});
    }
    setIsLaneTitleDialogOpen(false);
    setEditingLaneConfig(null);
  };

  const confirmDeleteLane = (laneIndexToDelete: number) => {
    const laneTitle = lanes[laneIndexToDelete].title || `Lane ${laneIndexToDelete + 1}`;
    setLanes(prevLanes => prevLanes.filter((_, index) => index !== laneIndexToDelete));
    setTimelineSlots(prevSlots => 
        prevSlots
            .filter(slot => slot.row !== laneIndexToDelete) 
            .map(slot => slot.row > laneIndexToDelete ? { ...slot, row: slot.row - 1 } : slot) 
    );
    toast({ title: "Lane Deleted", description: `${laneTitle} and its timeslots have been removed.`});
  };


  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.14)-2rem)] space-y-4 p-4 md:p-6">
      {/* Top Controls: Event Selector & Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch gap-4 shrink-0">
          <Card className="sm:min-w-[280px] flex-shrink-0 shadow-sm">
            <CardContent className="p-3 h-full flex flex-col justify-center">
              <Label htmlFor="event-selector" className="text-sm font-medium text-muted-foreground mb-1 block">
                Event
              </Label>
              <Select value={selectedEventId} onValueChange={setSelectedEventId}>
                <SelectTrigger id="event-selector" className="w-full">
                  <SelectValue placeholder="Choose an event..." />
                </SelectTrigger>
                <SelectContent>
                  {mockEvents.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedEvent && (
                  <p className="text-xs text-muted-foreground mt-1">Venue: {selectedEvent.venue}, Date: {selectedEvent.date}</p>
              )}
            </CardContent>
          </Card>

          <Card className="flex-1 shadow-sm shrink-0">
            <CardHeader className="p-3 border-b flex items-center justify-between">
                <div className="flex items-center gap-1">
                    <Label htmlFor="default-slot-duration" className="text-sm font-medium text-muted-foreground whitespace-nowrap">Default Slot:</Label>
                    <Select 
                        value={defaultSlotDurationHours.toString()} 
                        onValueChange={(value) => setDefaultSlotDurationHours(parseFloat(value))}
                    >
                        <SelectTrigger id="default-slot-duration" className="w-auto h-8 text-xs">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3, 4].map(dur => ( 
                                <SelectItem key={dur} value={dur.toString()}>{dur * 60} Min</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center gap-1 ml-auto">
                    <Button variant="ghost" size="icon" title="Add Timeslot" onClick={openNewSlotDialog}><Plus className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" title="AI Scheduling Assistant" onClick={() => toggleToolWindow('aisandbox')} disabled={!featureToggles?.aiFeatures}>
                        <Sparkles className={cn("h-4 w-4", featureToggles?.aiFeatures && "text-primary")} />
                    </Button>
                    <Button variant="ghost" size="icon" title="Pan Tool (Mock)" disabled><MousePointer2 className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" title="Select Tool (Mock)" disabled><LayoutGrid className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" title="Undo (Mock)" disabled><RotateCcw className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" title="Redo (Mock)" disabled><RotateCw className="h-4 w-4" /></Button>
                    <Button variant="default" size="sm" className="ml-2" title="Finalize Schedule (Mock)" disabled>
                    <CheckCircle className="h-4 w-4 mr-1 sm:mr-2" /> <span className="hidden sm:inline">Finalize</span>
                    </Button>
                </div>
            </CardHeader>
          </Card>
      </div>

      {/* Main Content Area: Artist List & Timeline */}
      <div className="flex-grow flex gap-4 overflow-hidden">
        {/* Artist List Panel */}
        <Card className="w-full md:w-1/3 lg:w-1/4 min-w-[250px] max-w-xs shadow-sm flex flex-col">
          <CardHeader className="p-3 border-b">
            <CardTitle className="text-lg flex items-center">
              <Users className="mr-2 h-5 w-5 text-primary" /> Available Artists
            </CardTitle>
          </CardHeader>
          <div className="p-3 border-b space-y-2">
            <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search artists..." className="pl-8 h-9" disabled/>
            </div>
            <div className="flex gap-2">
                <Button variant="outline" size="sm" className="text-xs flex-1" disabled><ListFilter className="h-3 w-3 mr-1"/>Filter</Button>
                <Button variant="outline" size="sm" className="text-xs flex-1" disabled>Sort</Button>
            </div>
          </div>
          <ScrollArea className="flex-grow">
            <CardContent className="p-3 space-y-2">
              {mockArtists.map((artist) => (
                <ContextMenu key={artist.id}>
                  <ContextMenuTrigger asChild>
                    <div
                        className={cn(
                            "p-2 border rounded-md bg-card hover:bg-muted/70 cursor-grab active:cursor-grabbing flex items-center shadow-sm",
                            selectedArtistId === artist.id && "ring-2 ring-primary bg-primary/10"
                        )}
                        title={`Drag ${artist.name} to timeline`}
                        draggable="true"
                        onDragStart={(e) => handleArtistDragStart(e, artist)}
                        onClick={() => setSelectedArtistId(artist.id)}
                    >
                      <GripVertical className="h-5 w-5 text-muted-foreground mr-2 shrink-0" />
                      <div className="w-6 h-6 rounded-sm mr-2 shrink-0 relative">
                        <Image src={artist.imageUrl || `https://placehold.co/40x40.png?text=${artist.name.substring(0,1)}`} alt={artist.name} fill className="object-cover rounded-sm" data-ai-hint={artist.aiHint} placeholder="empty" />
                      </div>
                      <div className="flex-grow">
                        <p className="text-sm font-medium">{artist.name}</p>
                        <p className="text-xs text-primary">{artist.genre}</p>
                      </div>
                    </div>
                  </ContextMenuTrigger>
                   <ContextMenuContent className="w-48">
                    <ContextMenuItem onClick={() => handleIgnoreArtist(artist)}>
                      <Ban className="mr-2 h-4 w-4" /> Ignore Artist (Mock)
                    </ContextMenuItem>
                    <ContextMenuItem onClick={() => handlePinArtist(artist)}>
                      <Pin className="mr-2 h-4 w-4" /> Pin Artist
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              ))}
            </CardContent>
          </ScrollArea>
           <CardContent className="p-2 border-t text-center">
                <Button variant="link" size="sm" className="text-xs" disabled>Load More Artists</Button>
            </CardContent>
        </Card>

        {/* Timeline Section */}
        <Card className="flex-1 shadow-sm flex flex-col overflow-hidden">
            {/* Timeline Header (Hour Labels) */}
            <CardHeader className="p-0 sticky top-0 bg-background/95 backdrop-blur-sm z-10 border-b shadow-sm rounded-t-md">
                <div className="flex">
                    <div style={{ width: `${ROW_HANDLE_WIDTH_PX}px` }} className="shrink-0 border-r flex items-center justify-center text-xs font-medium text-muted-foreground p-1.5">Lanes</div>
                    {timelineHours.map((hour, colIndex) => (
                        <div
                            key={`header-${hour.startHour}`}
                            style={{ flexBasis: `${hourBlockWidthPercent}%`, minWidth: `${HOUR_COL_MIN_WIDTH_PX}px`}}
                            className={cn(
                                "text-center py-1.5 px-1 text-xs font-medium text-muted-foreground border-r last:border-r-0",
                                colIndex % 2 === 0 ? "bg-muted/10" : "bg-transparent"
                            )}
                            onDragOver={handleDragOver} 
                            onDrop={(e) => handleTimelineDrop(e, hour.startHour, -1)} // -1 indicates drop on header (find first available row)
                        >
                            {hour.label}
                        </div>
                    ))}
                </div>
            </CardHeader>
            
            <ScrollArea className="flex-grow relative">
                <CardContent className="p-0 flex flex-col bg-background min-h-full relative">
                     {/* Column Striping & Grid Background */}
                    <div className="absolute inset-0 z-[1] flex pointer-events-none">
                        <div style={{ width: `${ROW_HANDLE_WIDTH_PX}px` }} className="shrink-0 border-r border-dashed border-border/30"></div> 
                        {timelineHours.map((hour, colIndex) => (
                            <div
                                key={`bg-col-${hour.startHour}`}
                                style={{ flexBasis: `${hourBlockWidthPercent}%`, minWidth: `${HOUR_COL_MIN_WIDTH_PX}px`}}
                                className={cn(
                                    "h-full border-r border-dashed border-border/30",
                                    colIndex % 2 === 0 ? "bg-muted/5" : "bg-transparent",
                                    hoveredColumn === hour.startHour && "bg-primary/5 transition-colors duration-100 ease-in-out"
                                )}
                            />
                        ))}
                    </div>

                    <div className="relative z-[2] flex flex-col">
                        {lanes.map((lane, rowIndex) => (
                            <ContextMenu key={lane.id}>
                                <ContextMenuTrigger asChild>
                                    <div className="flex" style={{ height: `${ROW_HEIGHT_PX}px` }}>
                                        <div
                                            className={cn(
                                                "flex items-center justify-start px-2 cursor-pointer border-r border-b border-dashed border-border/30 transition-colors w-full truncate",
                                                hoveredRowHandle === rowIndex && !selectedRow && "bg-primary/10 text-primary",
                                                selectedRow === rowIndex && "bg-primary/20 text-primary font-semibold"
                                            )}
                                            style={{ width: `${ROW_HANDLE_WIDTH_PX}px` }}
                                            onMouseEnter={() => setHoveredRowHandle(rowIndex)}
                                            onMouseLeave={() => setHoveredRowHandle(null)}
                                            onClick={() => handleRowHandleClick(rowIndex)}
                                        >
                                            <Rows className="h-4 w-4 mr-2 shrink-0" />
                                            <span className="truncate text-xs">{lane.title || `Lane ${rowIndex + 1}`}</span>
                                        </div>
                                        {timelineHours.map((hour) => (
                                            <div
                                                key={`cell-${rowIndex}-${hour.startHour}`}
                                                className={cn(
                                                    "border-r border-b border-dashed border-border/30 flex-grow cursor-pointer transition-colors duration-100 ease-in-out relative",
                                                    (hoveredCell?.row === rowIndex && hoveredCell?.hour === hour.startHour) && "bg-primary/20",
                                                    (selectedCell?.row === rowIndex && selectedCell?.hour === hour.startHour) && "ring-2 ring-primary ring-inset z-10 bg-primary/25",
                                                    (draggingOverCell?.row === rowIndex && draggingOverCell?.hour === hour.startHour) && "border-primary border-solid ring-2 ring-primary bg-primary/10"
                                                )}
                                                style={{ flexBasis: `${hourBlockWidthPercent}%`, minWidth: `${HOUR_COL_MIN_WIDTH_PX}px` }}
                                                onMouseEnter={() => { setHoveredCell({ hour: hour.startHour, row: rowIndex }); setHoveredColumn(hour.startHour); }}
                                                onMouseLeave={() => { setHoveredCell(null); setHoveredColumn(null); setDraggingOverCell(null); }}
                                                onDrop={(e) => handleTimelineDrop(e, hour.startHour, rowIndex)}
                                                onDragOver={handleDragOver}
                                                onDragEnter={(e) => handleCellDragEnter(e, hour.startHour, rowIndex)}
                                                onDragLeave={handleCellDragLeave}
                                                onClick={() => handleCellClick(hour.startHour, rowIndex)}
                                            >  </div>
                                        ))}
                                    </div>
                                </ContextMenuTrigger>
                                <ContextMenuContent className="w-56">
                                    <ContextMenuItem onClick={() => openSetLaneTitleDialog(rowIndex)}>
                                        <Edit3 className="mr-2 h-4 w-4" /> Set Lane Title
                                    </ContextMenuItem>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <ContextMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                                                <Trash2 className="mr-2 h-4 w-4" /> Delete Lane
                                            </ContextMenuItem>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                <AlertDialogDesc>
                                                This will delete {lanes[rowIndex].title || `Lane ${rowIndex + 1}`} and all its timeslots. This action cannot be undone.
                                                </AlertDialogDesc>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => confirmDeleteLane(rowIndex)} className="bg-destructive hover:bg-destructive/90">Delete Lane</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </ContextMenuContent>
                            </ContextMenu>
                        ))}
                    </div>

                    <div className="absolute inset-0 z-[3] pointer-events-none" style={{ left: `${ROW_HANDLE_WIDTH_PX}px`, right: 0, top:0, bottom: 0 }}>
                        <div className="relative h-full w-full">
                            {timelineSlots.map((slot) => (
                                <ContextMenu key={slot.id}>
                                    <ContextMenuTrigger asChild>
                                        <div
                                            className={cn(
                                                "absolute p-1 rounded shadow-md flex items-center cursor-move hover:ring-2 hover:ring-primary pointer-events-auto text-xs overflow-hidden group",
                                                slot.artistId ? (mockArtists.find(a => a.id === slot.artistId)?.genre.toLowerCase().includes("house") ? "bg-blue-500/80 text-blue-50" :
                                                                mockArtists.find(a => a.id === slot.artistId)?.genre.toLowerCase().includes("funk") ? "bg-orange-500/80 text-orange-50" :
                                                                mockArtists.find(a => a.id === slot.artistId)?.genre.toLowerCase().includes("techno") || mockArtists.find(a => a.id === slot.artistId)?.genre.toLowerCase().includes("electronic") ? "bg-purple-500/80 text-purple-50" :
                                                                "bg-primary/70 text-primary-foreground")
                                                            : "bg-slate-500/80 text-slate-50"
                                            )}
                                            style={{
                                                top: `${slot.row * ROW_HEIGHT_PX + (ROW_HEIGHT_PX * 0.125)}px`,
                                                left: `${(slot.startHour - timelineHours[0].startHour) * hourBlockWidthPercent}%`,
                                                width: `${Math.max(slot.duration, 0.25) * hourBlockWidthPercent}%`, // Min width for 15min
                                                height: `${ROW_HEIGHT_PX * 0.75}px`,
                                            }}
                                            draggable="true"
                                            onDragStart={(e) => handleSlotDragStart(e, slot.id)}
                                            onClick={(e) => { e.stopPropagation(); openEditSlotDialog(slot); }}
                                        >
                                            {slot.artistImageUrl && (
                                                <div className="w-5 h-5 rounded-sm mr-1.5 shrink-0 relative">
                                                    <Image src={slot.artistImageUrl || `https://placehold.co/40x40.png?text=A`} alt={slot.artistName} fill className="object-cover rounded-sm" data-ai-hint={slot.artistAiHint || slot.artistName} placeholder="empty" />
                                                </div>
                                            )}
                                            <div className="overflow-hidden flex-grow">
                                                <p className="font-semibold truncate">{slot.artistName}</p>
                                                <p className="text-[10px]">{`${formatHourToTime(slot.startHour)} - ${formatHourToTime(slot.startHour + slot.duration)}`}</p>
                                            </div>
                                            <div className="absolute left-0 top-0 bottom-0 w-1 cursor-ew-resize group-hover:bg-white/30 transition-colors"></div>
                                            <div className="absolute right-0 top-0 bottom-0 w-1 cursor-ew-resize group-hover:bg-white/30 transition-colors"></div>
                                        </div>
                                    </ContextMenuTrigger>
                                    <ContextMenuContent className="w-56">
                                        <ContextMenuItem onClick={(e) => { e.stopPropagation(); openEditSlotDialog(slot); }}>
                                            <ExternalLink className="mr-2 h-4 w-4" /> Edit Timeslot Details
                                        </ContextMenuItem>
                                        <ContextMenuItem onClick={() => handleClearArtistFromSlot(slot.id)} disabled={!slot.artistId}>
                                            <UserX className="mr-2 h-4 w-4" /> Clear Artist from Slot
                                        </ContextMenuItem>
                                        <ContextMenuSeparator />
                                        <ContextMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive" onClick={() => handleDeleteSlot(slot.id)}>
                                            <Trash2 className="mr-2 h-4 w-4" /> Delete Timeslot
                                        </ContextMenuItem>
                                    </ContextMenuContent>
                                </ContextMenu>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </ScrollArea>
            <div className="p-2 text-center border-t">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={handleAddLane}
                    className="rounded-full"
                    title="Add Lane"
                >
                    <Plus className="h-5 w-5" />
                </Button>
            </div>
        </Card>
      </div>

      {/* Timeslot Dialog */}
      <Dialog open={isSlotDialogOpen} onOpenChange={(open) => {setIsSlotDialogOpen(open); if(!open) setEditingSlot(null);}}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingSlot?.id ? "Edit Timeslot" : "Add New Timeslot"}</DialogTitle>
             {editingSlot?.id && editingSlot.artistName && <DialogDescription>Modifying slot for {editingSlot.artistName}.</DialogDescription>}
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="artistName" className="text-right">Artist</Label>
              <Input id="artistName" value={slotForm.artistName} onChange={(e) => setSlotForm({...slotForm, artistName: e.target.value })} className="col-span-3" placeholder="Search or type artist name"/>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="startTime" className="text-right">Start</Label>
              <Input id="startTime" value={slotForm.startTime} onChange={(e) => setSlotForm({...slotForm, startTime: e.target.value })} className="col-span-3" placeholder="e.g., 9 AM or 14:30"/>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endTime" className="text-right">End</Label>
              <Input id="endTime" value={slotForm.endTime} onChange={(e) => setSlotForm({...slotForm, endTime: e.target.value })} className="col-span-3" placeholder="e.g., 11 AM or 16:00"/>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">Notes</Label>
              <Textarea id="notes" value={slotForm.notes} onChange={(e) => setSlotForm({...slotForm, notes: e.target.value })} className="col-span-3" placeholder="Optional notes for this timeslot..."/>
            </div>
          </div>
          <DialogFooter className="sm:justify-between">
            {editingSlot?.id && (
              <Button variant="destructive" onClick={() => handleDeleteSlot(editingSlot.id)}>Delete Slot</Button>
            )}
            <div className="sm:ml-auto flex gap-2">
                <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={handleSaveSlot}>Save Timeslot</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

       {/* Lane Title Dialog */}
      <Dialog open={isLaneTitleDialogOpen} onOpenChange={(open) => {setIsLaneTitleDialogOpen(open); if(!open) setEditingLaneConfig(null);}}>
        <DialogContent className="sm:max-w-[380px]">
          <DialogHeader>
            <DialogTitle>Set Lane Title</DialogTitle>
            <DialogDescription>
                {editingLaneConfig ? `Editing title for ${lanes[editingLaneConfig.index].title || `Lane ${editingLaneConfig.index + 1}`}.` : "Set a custom title for this lane."}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input 
                id="laneTitleInput" 
                value={editingLaneConfig?.currentTitle || ""} 
                onChange={(e) => setEditingLaneConfig(prev => prev ? {...prev, currentTitle: e.target.value} : null)}
                placeholder="Enter lane title (e.g., Main Stage)" 
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSaveLaneTitle}>Save Title</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      { !featureToggles?.aiFeatures &&
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-md shadow-lg flex items-center text-xs">
            <AlertTriangle className="h-4 w-4 mr-2"/> AI features are currently disabled. Enable them in Dev Tools for AI assistance.
        </div>
      }
    </div>
  );
}
