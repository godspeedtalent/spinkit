
"use client";

import { create } from 'zustand';

export interface LogEntry {
  id: string;
  timestamp: Date;
  type: 'log' | 'warn' | 'error' | 'info' | 'debug';
  parts: any[]; // To hold multiple arguments like console.log(...args)
}

interface ConsoleLogState {
  logs: LogEntry[];
  addLogEntry: (type: LogEntry['type'], parts: any[]) => void;
  clearLogs: () => void;
}

export const useConsoleLogStore = create<ConsoleLogState>((set) => ({
  logs: [],
  addLogEntry: (type, parts) => {
    const newEntry: LogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date(),
      type,
      parts,
    };
    set((state) => ({ logs: [newEntry, ...state.logs].slice(0, 200) })); // Keep last 200 entries
  },
  clearLogs: () => set({ logs: [] }),
}));
