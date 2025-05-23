
"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CardFooter } from "@/components/ui/card";
import { Terminal, Trash2, Copy, Filter as FilterIcon } from "lucide-react";
import { useConsoleLogStore, type LogEntry } from "@/stores/consoleLogStore";
import { format } from "date-fns";
import ToolWindowWrapper from "@/components/shared/tool-window-wrapper";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "../ui/label";


interface ConsoleOutputToolProps {
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const formatLogPart = (part: any): string => {
  if (typeof part === 'string') return part;
  if (typeof part === 'number' || typeof part === 'boolean' || part === null || part === undefined) {
    return String(part);
  }
  try {
    return JSON.stringify(part, null, 2);
  } catch (e) {
    return '[Unserializable Object]';
  }
};

export default function ConsoleOutputTool({ isExpanded, onToggleExpand }: ConsoleOutputToolProps) {
  const [mounted, setMounted] = React.useState(false);
  const { logs, clearLogs } = useConsoleLogStore();
  const { toast } = useToast();
  const [filterType, setFilterType] = useState<LogEntry['type'] | 'all'>('all');

  React.useEffect(() => setMounted(true), []);

  const filteredLogs = useMemo(() => {
    if (filterType === 'all') {
      return logs;
    }
    return logs.filter(log => log.type === filterType);
  }, [logs, filterType]);

  const handleCopyLogs = async () => {
    if (filteredLogs.length === 0) {
      toast({ title: "No logs to copy", variant: "default" });
      return;
    }
    const logText = filteredLogs
      .map(log => `[${format(log.timestamp, "HH:mm:ss.SSS")}] [${log.type.toUpperCase()}] ${log.parts.map(formatLogPart).join(' ')}`)
      .join("\n");
    try {
      await navigator.clipboard.writeText(logText);
      toast({ title: "Logs Copied!", description: `${filteredLogs.length} log entries copied to clipboard.` });
    } catch (err) {
      toast({ title: "Copy Failed", description: "Could not copy logs to clipboard.", variant: "destructive" });
      console.error("Failed to copy logs:", err);
    }
  };
  
  const logTypeColors: Record<LogEntry['type'], string> = {
    log: "text-muted-foreground",
    info: "text-blue-500 dark:text-blue-400",
    warn: "text-yellow-500 dark:text-yellow-400",
    error: "text-destructive",
    debug: "text-purple-500 dark:text-purple-400",
  };

  if (!mounted) return null;
  if (!isExpanded) return null;

  const toolSpecificHeaderActions = (
    <div className="flex items-center gap-1">
       <Select value={filterType} onValueChange={(value) => setFilterType(value as LogEntry['type'] | 'all')}>
        <SelectTrigger 
            className="h-6 w-auto text-xs px-2 py-0.5 border-primary/30 bg-card hover:bg-primary/10 focus:ring-primary/50"
            aria-label="Filter log types"
        >
            <FilterIcon className="h-3 w-3 mr-1 text-primary/80" />
            <SelectValue placeholder="Filter..." />
        </SelectTrigger>
        <SelectContent className="z-[160]">
            <SelectItem value="all" className="text-xs">All Types</SelectItem>
            <SelectItem value="log" className="text-xs">Log</SelectItem>
            <SelectItem value="info" className="text-xs">Info</SelectItem>
            <SelectItem value="warn" className="text-xs">Warning</SelectItem>
            <SelectItem value="error" className="text-xs">Error</SelectItem>
            <SelectItem value="debug" className="text-xs">Debug</SelectItem>
        </SelectContent>
      </Select>
      <Button variant="ghost" size="icon" className="h-6 w-6 text-primary hover:bg-primary/10" title="Copy Logs" onClick={handleCopyLogs}>
        <Copy className="h-3.5 w-3.5" />
      </Button>
    </div>
  );

  return (
    <ToolWindowWrapper
      title="Console Output"
      icon={Terminal}
      onToggleExpand={onToggleExpand}
      className="w-96 h-[450px] border-primary/50"
      headerClassName="border-primary/30"
      titleClassName="text-primary"
      contentClassName="p-0 flex flex-col"
      toolSpecificHeaderActions={toolSpecificHeaderActions}
    >
      <ScrollArea className="flex-1 bg-muted/10 p-2">
        <div className="space-y-1.5 font-mono text-xs">
          {filteredLogs.length === 0 ? (
            <p className="text-center text-muted-foreground italic py-4">No logs to display for this filter.</p>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.id} className={cn("flex items-start gap-1.5 leading-relaxed", logTypeColors[log.type])}>
                <span className="text-muted-foreground/70 shrink-0">
                  [{format(log.timestamp, "HH:mm:ss.SSS")}]
                </span>
                <span className={cn("font-semibold uppercase w-12 shrink-0", log.type === 'error' && 'text-destructive', log.type === 'warn' && 'text-yellow-600 dark:text-yellow-500')}>
                  [{log.type}]
                </span>
                <span className="whitespace-pre-wrap break-all flex-1">
                  {log.parts.map((part, index) => (
                    <React.Fragment key={index}>
                      {formatLogPart(part)}{index < log.parts.length - 1 ? ' ' : ''}
                    </React.Fragment>
                  ))}
                </span>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
      <CardFooter className="p-2 border-t">
        <Button variant="outline" size="sm" className="w-full text-xs" onClick={clearLogs}>
          <Trash2 className="mr-2 h-3.5 w-3.5" /> Clear Logs
        </Button>
      </CardFooter>
    </ToolWindowWrapper>
  );
}
