
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GripVertical, Minus, ChevronsLeftRight, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ToolWindowWrapperProps {
  title: string;
  icon: LucideIcon;
  onToggleExpand: () => void;
  children: React.ReactNode;
  className?: string; 
  headerClassName?: string;
  contentClassName?: string;
  titleClassName?: string;
  toolSpecificHeaderActions?: React.ReactNode;
  footerContent?: React.ReactNode;
}

export default function ToolWindowWrapper({
  title,
  icon: ToolIcon,
  onToggleExpand,
  children,
  className,
  headerClassName,
  contentClassName,
  titleClassName,
  toolSpecificHeaderActions,
  footerContent,
}: ToolWindowWrapperProps) {
  return (
    <Card className={cn("shadow-2xl bg-card/95 backdrop-blur-sm flex flex-col relative", className)}>
      <CardHeader
        className={cn(
          "py-2 px-3 border-b flex flex-row items-center justify-between cursor-grab active:cursor-grabbing",
          headerClassName
        )}
      >
        <div className="flex items-center">
          <GripVertical className={cn("h-4 w-4 mr-1", titleClassName ? `text-[${titleClassName}]/70` : "text-muted-foreground/70")} />
          <CardTitle className={cn("text-sm flex items-center", titleClassName)}>
            <ToolIcon className="mr-2 h-4 w-4" />
            {title}
          </CardTitle>
        </div>
        <div className="flex items-center space-x-1">
          {toolSpecificHeaderActions}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleExpand}
            className={cn("h-6 w-6", titleClassName, titleClassName ? `hover:bg-[${titleClassName}]/10` : 'hover:bg-accent/10')}
            title={`Minimize ${title}`}
            aria-label={`Minimize ${title}`}
          >
            <Minus className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className={cn("p-3 flex-grow flex flex-col overflow-hidden", contentClassName)}>
        {children}
      </CardContent>
      {footerContent && (
        <div className="p-2 border-t text-center text-xs text-muted-foreground">
            {footerContent}
        </div>
      )}
      <div className="absolute bottom-1 right-1 cursor-nwse-resize text-muted-foreground/50 opacity-50 hover:opacity-100">
        <ChevronsLeftRight className="h-3 w-3 transform rotate-45" />
      </div>
    </Card>
  );
}
