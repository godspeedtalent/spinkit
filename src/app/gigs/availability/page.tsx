
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button, buttonVariants } from "@/components/ui/button"; // Added buttonVariants
import { Calendar, type CalendarProps } from "@/components/ui/calendar"; // Assuming this is your ShadCN calendar
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription as ShadDialogDescription, // Aliased
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import {
  format,
  isSameDay,
  startOfDay,
  getDaysInMonth,
  getMonth,
  getYear,
  addMonths,
  subMonths,
  startOfMonth,
  getDay,
  eachDayOfInterval,
  endOfMonth,
  isToday,
} from 'date-fns';
import { cn } from "@/lib/utils";
import { CalendarCheck, Save, CircleOff, StickyNote, BarChartHorizontalBig, PanelRightClose, PanelRightOpen, SlidersHorizontal, Dot, Edit3, Trash2, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription as ShadCardDescriptionAliased } from "@/components/ui/card"; // Renamed alias for CardDescription
import { Textarea } from "@/components/ui/textarea";

// Type definitions
type DayStatus = 'available' | 'unavailable' | 'notSet';

interface DailyAvailability {
  date: Date;
  status: DayStatus;
  note?: string;
}

// Props for the CustomDayContentComponent
interface CustomDayContentProps {
  date: Date;
  displayMonth: Date;
  children: React.ReactNode; // This will be the day number
  dailyAvailabilities: DailyAvailability[];
  onClearStatus: (date: Date) => void;
  onAddEditNote: (date: Date) => void;
}

const CustomDayContentComponent: React.FC<CustomDayContentProps> = ({
  date,
  displayMonth,
  children,
  dailyAvailabilities,
  onClearStatus,
  onAddEditNote,
}) => {
  // Only render for days in the current display month
  if (getMonth(date) !== getMonth(displayMonth)) {
    return <div className="invisible">{children}</div>;
  }

  const dayEntry = dailyAvailabilities.find(d => isSameDay(d.date, date));
  const hasNote = !!dayEntry?.note;

  const handleClearSelect = (e: Event) => {
    e.preventDefault(); // Prevent default browser context menu
    setTimeout(() => onClearStatus(date), 0);
  };

  const handleAddNoteSelect = (e: Event) => {
    e.preventDefault();
    setTimeout(() => onAddEditNote(date), 0);
  };
  
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div className="relative h-full w-full flex items-center justify-center">
          {children}
          {hasNote && <Dot className="absolute top-0.5 right-0.5 h-3 w-3 text-blue-500" strokeWidth={4} />}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onSelect={handleClearSelect}>
          <CircleOff className="mr-2 h-4 w-4" /> Clear Day Status
        </ContextMenuItem>
        <ContextMenuItem onSelect={handleAddNoteSelect}>
          <StickyNote className="mr-2 h-4 w-4" /> Add/Edit Note
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

const areEqualCustomDayContent = (prevProps: CustomDayContentProps, nextProps: CustomDayContentProps) => {
  if (prevProps.date.getTime() !== nextProps.date.getTime() ||
      prevProps.displayMonth.getTime() !== nextProps.displayMonth.getTime() ||
      prevProps.children !== nextProps.children ||
      prevProps.onClearStatus !== nextProps.onClearStatus ||
      prevProps.onAddEditNote !== nextProps.onAddEditNote) {
    return false;
  }
  const prevDayEntry = prevProps.dailyAvailabilities.find(d => isSameDay(d.date, prevProps.date));
  const nextDayEntry = nextProps.dailyAvailabilities.find(d => isSameDay(d.date, nextProps.date));
  
  return (prevDayEntry?.status === nextDayEntry?.status) && (!!prevDayEntry?.note === !!nextDayEntry?.note);
};

const CustomDayContent = React.memo(CustomDayContentComponent, areEqualCustomDayContent);


export default function AvailabilityToolPage() {
  const { toast } = useToast();
  const [selectedMonth, setSelectedMonth] = useState<Date>(startOfMonth(new Date()));
  const [dailyAvailabilities, setDailyAvailabilities] = useState<DailyAvailability[]>([]);
  
  const [generalAvailability, setGeneralAvailability] = useState<Record<string, { isGenerallyAvailable: boolean; startTime?: string; endTime?: string }>>({
    Sunday: { isGenerallyAvailable: false, startTime: "09:00", endTime: "17:00" },
    Monday: { isGenerallyAvailable: false, startTime: "09:00", endTime: "17:00" },
    Tuesday: { isGenerallyAvailable: false, startTime: "09:00", endTime: "17:00" },
    Wednesday: { isGenerallyAvailable: false, startTime: "09:00", endTime: "17:00" },
    Thursday: { isGenerallyAvailable: true, startTime: "09:00", endTime: "17:00" },
    Friday: { isGenerallyAvailable: true, startTime: "18:00", endTime: "02:00" },
    Saturday: { isGenerallyAvailable: true, startTime: "18:00", endTime: "02:00" },
  });

  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [editingNoteForDate, setEditingNoteForDate] = useState<Date | null>(null);
  const [currentNoteText, setCurrentNoteText] = useState("");
  
  const [isControlsSidebarOpen, setIsControlsSidebarOpen] = useState(true);


  const handlePrevMonth = () => setSelectedMonth(prev => subMonths(prev, 1));
  const handleNextMonth = () => setSelectedMonth(prev => addMonths(prev, 1));

  const handleDayClick = (day: Date | undefined) => {
    if (!day) return;
    const cleanDay = startOfDay(day);
    setDailyAvailabilities(prev => {
      const existingDayIndex = prev.findIndex(d => isSameDay(d.date, cleanDay));
      let newStatus: DayStatus;
      let existingNote = "";

      if (existingDayIndex > -1) {
        const currentEntry = prev[existingDayIndex];
        newStatus = currentEntry.status === 'available' ? 'unavailable' : currentEntry.status === 'unavailable' ? 'notSet' : 'available';
        existingNote = currentEntry.note || "";
      } else {
        newStatus = 'available';
      }
      
      if (newStatus === 'notSet' && existingDayIndex > -1) {
        if (existingNote.trim() === "") { 
            return prev.filter((_, index) => index !== existingDayIndex);
        } else { 
            return prev.map((d, index) => index === existingDayIndex ? { ...d, status: 'notSet' } : d);
        }
      } else if (existingDayIndex > -1) {
        return prev.map((d, index) => index === existingDayIndex ? { ...d, status: newStatus } : d);
      } else {
        return [...prev, { date: cleanDay, status: newStatus, note: "" }];
      }
    });
  };
  
  const handleClearDayStatus = useCallback((dateToClear: Date) => {
    const cleanDay = startOfDay(dateToClear);
    setDailyAvailabilities(prev => 
      prev.map(d => isSameDay(d.date, cleanDay) ? {...d, status: 'notSet', note: d.note?.trim() === '' ? undefined : d.note} : d)
          .filter(d => d.status !== 'notSet' || d.note !== undefined) // Keep if status not 'notSet' OR if there's still a note
    );
    toast({ title: "Day Status Cleared", description: `Availability for ${format(cleanDay, "PPP")} has been reset.` });
  }, [toast]);


  const openNoteDialog = useCallback((dateForNote: Date) => {
    const cleanDay = startOfDay(dateForNote);
    const existingEntry = dailyAvailabilities.find(d => isSameDay(d.date, cleanDay));
    setEditingNoteForDate(cleanDay);
    setCurrentNoteText(existingEntry?.note || "");
    setIsNoteDialogOpen(true);
  }, [dailyAvailabilities]);


  const handleSaveNote = () => {
    if (!editingNoteForDate) return;
    const cleanDay = startOfDay(editingNoteForDate);
    setDailyAvailabilities(prev => {
      const existingDayIndex = prev.findIndex(d => isSameDay(d.date, cleanDay));
      if (currentNoteText.trim() === "" && existingDayIndex > -1 && prev[existingDayIndex].status === 'notSet') {
        return prev.filter((_, index) => index !== existingDayIndex);
      }
      if (existingDayIndex > -1) {
        return prev.map((d, index) => index === existingDayIndex ? { ...d, note: currentNoteText.trim() } : d);
      } else {
        return currentNoteText.trim() !== "" ? [...prev, { date: cleanDay, status: 'notSet', note: currentNoteText.trim() }] : prev;
      }
    });
    toast({ title: "Note Saved", description: `Note for ${format(cleanDay, "PPP")} has been updated.` });
    setIsNoteDialogOpen(false);
    setEditingNoteForDate(null);
    setCurrentNoteText("");
  };


  const handleGeneralAvailabilityToggle = (dayOfWeek: string, checked: boolean) => {
    setGeneralAvailability(prev => ({ ...prev, [dayOfWeek]: { ...(prev[dayOfWeek] || { startTime: '09:00', endTime: '17:00' }), isGenerallyAvailable: checked } }));
  };

  const handleGeneralTimeChange = (dayOfWeek: string, timeType: 'startTime' | 'endTime', value: string) => {
    setGeneralAvailability(prev => ({ ...prev, [dayOfWeek]: { ...(prev[dayOfWeek] || { isGenerallyAvailable: false }), [timeType]: value } }));
  };

  const handleSaveSpecificDayAvailability = () => toast({ title: "Specific Day Settings Saved (Mock)" });
  const handleSaveGeneralAvailability = () => toast({ title: "General Availability Saved (Mock)" });

  const currentMonthNumber = getMonth(selectedMonth);
  const currentYearNumber = getYear(selectedMonth);
  const daysInSelectedMonthCount = getDaysInMonth(selectedMonth);
  
  const availableDaysThisMonth = dailyAvailabilities.filter(d => 
    d.status === 'available' && 
    getMonth(d.date) === currentMonthNumber && 
    getYear(d.date) === currentYearNumber
  ).length;
  
  const unavailableDaysThisMonth = dailyAvailabilities.filter(d => 
    d.status === 'unavailable' && 
    getMonth(d.date) === currentMonthNumber && 
    getYear(d.date) === currentYearNumber
  ).length;
  
  const notSetDaysThisMonth = daysInSelectedMonthCount - availableDaysThisMonth - unavailableDaysThisMonth;
  
  const calendarModifiers: CalendarProps['modifiers'] = {
    available: dailyAvailabilities.filter(d => d.status === 'available').map(d => d.date),
    unavailable: dailyAvailabilities.filter(d => d.status === 'unavailable').map(d => d.date),
    today: new Date(),
  };

  const calendarModifiersClassNames: CalendarProps['modifiersClassNames'] = {
    available: 'bg-green-500/30 text-green-900 dark:bg-green-700/40 dark:text-green-200 hover:bg-green-500/40 rounded-md',
    unavailable: 'bg-background text-muted-foreground line-through rounded-md hover:bg-muted/80 opacity-80',
    today: 'ring-2 ring-primary ring-inset rounded-md',
  };


  return (
    <div className="flex flex-col lg:flex-row flex-1 gap-6 p-4 md:p-6 min-h-[calc(100vh-theme(spacing.14)-2rem)]"> {/* Added min-h for full height attempt */}
      {/* Main Calendar Area */}
      <div className={cn(
        "flex-grow flex flex-col transition-all duration-300 ease-in-out",
        isControlsSidebarOpen ? "lg:w-2/3" : "lg:w-full"
      )}>
        <div className="flex justify-between items-center mb-4 shrink-0">
          <h1 className="text-2xl font-semibold flex items-center">
            <CalendarCheck className="mr-3 h-7 w-7 text-primary" /> Manage Your Availability
          </h1>
          <Button variant="ghost" size="icon" onClick={() => setIsControlsSidebarOpen(!isControlsSidebarOpen)} className="lg:hidden">
            <SlidersHorizontal className="h-5 w-5" />
          </Button>
           <Button variant="ghost" size="icon" onClick={() => setIsControlsSidebarOpen(!isControlsSidebarOpen)} className="hidden lg:inline-flex">
            {isControlsSidebarOpen ? <PanelRightClose className="h-5 w-5" /> : <PanelRightOpen className="h-5 w-5" />}
          </Button>
        </div>

        <div className="flex-1 flex flex-col bg-card shadow-lg rounded-md p-4 overflow-hidden"> {/* Flex-1 and overflow-hidden for calendar growth */}
          <div className="flex items-center justify-between mb-3 px-2 shrink-0">
            <Button variant="outline" size="icon" onClick={handlePrevMonth} aria-label="Previous month">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h3 className="text-lg font-semibold text-center">
              {format(selectedMonth, "MMMM yyyy")}
            </h3>
            <Button variant="outline" size="icon" onClick={handleNextMonth} aria-label="Next month">
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto w-full flex justify-center items-start"> {/* Center calendar for smaller sizes, allow scroll */}
            <Calendar
              mode="single"
              month={selectedMonth}
              onMonthChange={setSelectedMonth}
              selected={undefined} 
              onSelect={handleDayClick}
              modifiers={calendarModifiers}
              modifiersClassNames={calendarModifiersClassNames}
              components={{
                DayContent: (dayProps) => (
                  <CustomDayContent
                    {...dayProps}
                    dailyAvailabilities={dailyAvailabilities}
                    onClearStatus={handleClearDayStatus}
                    onAddEditNote={openNoteDialog}
                  />
                ),
              }}
              className="p-0 w-full max-w-full" // Ensure calendar can take full width
              classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 w-full justify-center",
                month: "space-y-4 w-full", 
                table: "w-full border-collapse space-y-1", 
                head_row: "flex w-full",
                head_cell: "text-muted-foreground rounded-md w-[14.28%] font-normal text-[0.8rem]", 
                row: "flex w-full mt-2",
                cell: cn(
                  "w-[14.28%] text-center text-sm relative first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20 flex items-center justify-center aspect-square", 
                  "[&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent" 
                ),
                day: cn(
                  buttonVariants({ variant: "ghost" }),
                  "h-full w-full font-normal aria-selected:opacity-100 p-0" // Ensure button fills cell
                ),
              }}
            />
          </div>
          <div className="flex space-x-4 text-xs justify-center mt-3 pt-3 border-t shrink-0">
            <div className="flex items-center"><span className="h-3 w-3 rounded-sm bg-green-500/30 border border-green-600/30 mr-1.5"></span>Available</div>
            <div className="flex items-center"><span className="h-3 w-3 rounded-sm bg-background border border-muted-foreground/30 mr-1.5"></span>Unavailable</div>
            <div className="flex items-center"><span className="h-3 w-3 rounded-sm border bg-card mr-1.5"></span>Not Set</div>
            <div className="flex items-center"><Dot className="h-4 w-4 text-blue-500 mr-0.5" strokeWidth={5} />Has Note</div>
          </div>
          <div className="mt-4 flex justify-center shrink-0">
            <Button onClick={handleSaveSpecificDayAvailability} size="sm">
              <Save className="mr-2 h-4 w-4" /> Save Specific Day Settings (Mock)
            </Button>
          </div>
        </div>
      </div>

      {/* Right Sidebar for Controls */}
      {isControlsSidebarOpen && (
        <aside className="w-full lg:w-80 xl:w-96 shrink-0 border-t lg:border-t-0 lg:border-l bg-muted/20 p-4 md:p-6 space-y-6 lg:h-full lg:overflow-y-auto transition-all duration-300 ease-in-out rounded-lg">
          <Accordion type="multiple" defaultValue={['summary', 'general-weekly']} className="w-full">
            <AccordionItem value="summary">
              <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                <div className="flex items-center"><BarChartHorizontalBig className="mr-2 h-5 w-5 text-primary" /> Monthly Summary</div>
              </AccordionTrigger>
              <AccordionContent className="pt-2 space-y-3">
                <p className="text-sm font-medium text-center text-muted-foreground mb-2">Summary for {format(selectedMonth, "MMMM yyyy")}</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Card className="p-3 text-center shadow-sm bg-background/70"><p className="text-3xl font-bold text-green-500">{availableDaysThisMonth}</p><p className="text-xs font-medium text-muted-foreground mt-0.5">Available</p></Card>
                  <Card className="p-3 text-center shadow-sm bg-background/70"><p className="text-3xl font-bold text-muted-foreground">{unavailableDaysThisMonth}</p><p className="text-xs font-medium text-muted-foreground mt-0.5">Unavailable</p></Card>
                  <Card className="p-3 text-center shadow-sm bg-background/70"><p className="text-3xl font-bold text-muted-foreground/80">{notSetDaysThisMonth}</p><p className="text-xs font-medium text-muted-foreground mt-0.5">Not Set</p></Card>
                </div>
                <p className="text-center text-xs text-muted-foreground pt-1">Total days in month: {daysInSelectedMonthCount}</p>
                
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="general-weekly">
              <AccordionTrigger className="text-lg font-semibold hover:no-underline"><div className="flex items-center"><CalendarCheck className="mr-2 h-5 w-5 text-primary" /> General Weekly Availability</div></AccordionTrigger>
              <AccordionContent className="pt-2 space-y-3">
                <p className="text-xs text-muted-foreground mb-2">Set your typical available hours. These apply unless a specific day is set on the calendar.</p>
                {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map(day => (
                  <Card key={day} className="p-3 bg-card shadow-sm rounded-md">
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor={`ga-${day}-switch`} className="text-sm font-medium">{day}</Label>
                      <Switch id={`ga-${day}-switch`} checked={generalAvailability[day]?.isGenerallyAvailable || false} onCheckedChange={(checked) => handleGeneralAvailabilityToggle(day, checked)} />
                    </div>
                    {(generalAvailability[day]?.isGenerallyAvailable) && (
                      <div className="grid grid-cols-2 gap-2 pl-1 border-l-2 border-primary/30 ml-1 pt-1.5 mt-1.5">
                        <div><Label htmlFor={`ga-${day}-start`} className="text-xs text-muted-foreground">From</Label><Input id={`ga-${day}-start`} type="time" className="h-8 text-xs mt-0.5" value={generalAvailability[day]?.startTime || "09:00"} onChange={(e) => handleGeneralTimeChange(day, 'startTime', e.target.value)} /></div>
                        <div><Label htmlFor={`ga-${day}-end`} className="text-xs text-muted-foreground">To</Label><Input id={`ga-${day}-end`} type="time" className="h-8 text-xs mt-0.5" value={generalAvailability[day]?.endTime || "17:00"} onChange={(e) => handleGeneralTimeChange(day, 'endTime', e.target.value)} /></div>
                      </div>
                    )}
                  </Card>
                ))}
                <div className="mt-4 flex justify-start"><Button onClick={handleSaveGeneralAvailability} size="sm"><Save className="mr-2 h-4 w-4" /> Save General Availability (Mock)</Button></div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </aside>
      )}

      {/* Note Dialog */}
      <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Note for {editingNoteForDate ? format(editingNoteForDate, "PPP") : "Date"}</DialogTitle>
            <ShadDialogDescription>Add or edit a private note for this day.</ShadDialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea value={currentNoteText} onChange={(e) => setCurrentNoteText(e.target.value)} placeholder="Enter your note here..." className="min-h-[100px]" />
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleSaveNote}>Save Note</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

