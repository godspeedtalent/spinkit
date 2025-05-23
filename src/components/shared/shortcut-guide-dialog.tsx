
"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from '@/components/ui/separator';
import { Keyboard, CalendarDays } from 'lucide-react'; // Added CalendarDays

interface ShortcutGuideDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const KbdKey: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
    {children}
  </kbd>
);

export default function ShortcutGuideDialog({ isOpen, onOpenChange }: ShortcutGuideDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Keyboard className="mr-2 h-5 w-5 text-primary" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Boost your productivity with these keyboard shortcuts.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm">Open/Close Shortcut Guide</span>
            <div>
              <KbdKey>Ctrl</KbdKey> + <KbdKey>/</KbdKey>
              <span className="text-xs text-muted-foreground"> (or <KbdKey>⌘</KbdKey> + <KbdKey>/</KbdKey>)</span>
            </div>
          </div>
          <Separator />
           <div className="flex justify-between items-center">
            <span className="text-sm">Open/Close Focused Search</span>
            <div>
              <KbdKey>Ctrl</KbdKey> + <KbdKey>K</KbdKey>
              <span className="text-xs text-muted-foreground"> (or <KbdKey>⌘</KbdKey> + <KbdKey>K</KbdKey>)</span>
            </div>
          </div>
          <Separator />
           <div className="flex justify-between items-center">
            <span className="text-sm">Open Calendar Quick View</span>
            <div>
              <KbdKey>Ctrl</KbdKey> + <KbdKey>Shift</KbdKey> + <KbdKey>C</KbdKey>
              <span className="text-xs text-muted-foreground"> (or <KbdKey>⌘</KbdKey> + <KbdKey>Shift</KbdKey> + <KbdKey>C</KbdKey>)</span>
            </div>
          </div>
           <Separator />
          <p className="text-xs text-muted-foreground text-center pt-2">
            More shortcuts will be listed here as they are implemented.
          </p>
        </div>
        <DialogFooter className="sm:justify-end">
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
