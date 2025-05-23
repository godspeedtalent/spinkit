
"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { History, Trash2 } from 'lucide-react';
import { useOperationHistoryStore, type OperationEntry } from '@/stores/operationHistoryStore';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from '@/hooks/use-toast';

export default function OperationHistorySection() {
  const { history, clearHistory } = useOperationHistoryStore();

  const handleClearHistory = () => {
    clearHistory();
    toast({ title: "Operation History Cleared", description: "All log entries have been removed." });
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          <History className="mr-3 h-5 w-5 text-primary" />
          Data Operation History
        </CardTitle>
        <CardDescription>
          Log of recent data import and export operations performed via this admin panel.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No operation history recorded yet.</p>
        ) : (
          <ScrollArea className="h-[400px] border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Timestamp</TableHead>
                  <TableHead className="w-[100px]">Operation</TableHead>
                  <TableHead className="w-[120px]">Status</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="text-xs">
                      {format(new Date(entry.timestamp), "yyyy-MM-dd HH:mm:ss")}
                    </TableCell>
                    <TableCell>{entry.operation}</TableCell>
                    <TableCell>
                       <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        entry.status === "Success" ? "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300" :
                        entry.status === "Failure" ? "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400" :
                        entry.status === "Started" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400" :
                        "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-400" // Partial Success or other
                      }`}>
                        {entry.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs">
                        {entry.details}
                        {entry.connectionName && <div className="text-muted-foreground/80">Connection: {entry.connectionName}</div>}
                        {entry.entities && entry.entities.length > 0 && <div className="text-muted-foreground/80">Entities: {entry.entities.join(', ')}</div>}
                        {entry.format && <div className="text-muted-foreground/80">Format: {entry.format.toUpperCase()}</div>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </CardContent>
      {history.length > 0 && (
        <CardFooter>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Trash2 className="mr-2 h-4 w-4" /> Clear History
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all operation history logs. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearHistory} className="bg-destructive hover:bg-destructive/90">
                  Clear History
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      )}
    </Card>
  );
}
