
"use client";

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { useUserPreferencesStore } from '@/stores/userPreferencesStore';
import { format } from 'date-fns';
import { ArrowLeft } from 'lucide-react';

export default function CalendarQuickViewDialog() {
  const { isCalendarQuickViewOpen, setCalendarQuickViewOpen } = useUserPreferencesStore();
  const [viewMode, setViewMode] = useState<'calendar' | 'timeline'>('calendar');
  const [selectedDateForTimeline, setSelectedDateForTimeline] = useState<Date | null>(null);

  const handleDayDoubleClick = (date: Date) => {
    setSelectedDateForTimeline(date);
    setViewMode('timeline');
  };

  const handleBackToCalendar = () => {
    setViewMode('calendar');
    setSelectedDateForTimeline(null);
  };
  
  const handleOpenChange = (open: boolean) => {
    setCalendarQuickViewOpen(open);
    if (!open) {
      // Reset internal state when dialog closes
      setViewMode('calendar');
      setSelectedDateForTimeline(null);
    }
  };

  return (
    <Dialog open={isCalendarQuickViewOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md md:max-w-lg p-0">
        {viewMode === 'calendar' && (
          <>
            <DialogHeader className="p-6 pb-2">
              <DialogTitle>Calendar Quick View</DialogTitle>
              <DialogDescription>
                Double-click a day to see a mock timeline view.
              </DialogDescription>
            </DialogHeader>
            <div className="p-4 flex justify-center">
              <Calendar
                mode="single"
                onDayDoubleClick={handleDayDoubleClick}
                className="rounded-md border"
              />
            </div>
          </>
        )}
        {viewMode === 'timeline' && selectedDateForTimeline && (
          <>
            <DialogHeader className="p-6 pb-2">
              <DialogTitle>Timeline for {format(selectedDateForTimeline, "PPP")}</DialogTitle>
              <DialogDescription>
                Detailed hourly availability for this day will be shown here. (Timeline view TBD)
              </DialogDescription>
            </DialogHeader>
            <div className="p-6 text-center min-h-[200px] flex flex-col items-center justify-center">
              <p className="text-muted-foreground">Timeline placeholder for {format(selectedDateForTimeline, "PPP")}.</p>
              <p className="text-xs text-muted-foreground">Interactive hourly view coming soon.</p>
            </div>
            <div className="p-4 border-t flex justify-start">
              <Button variant="outline" onClick={handleBackToCalendar}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Calendar
              </Button>
            </div>
          </>
        )}
         <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground" />
      </DialogContent>
    </Dialog>
  );
}
