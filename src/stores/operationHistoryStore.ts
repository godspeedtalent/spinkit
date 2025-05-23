
"use client";

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface OperationEntry {
  id: string;
  timestamp: string;
  operation: 'Import' | 'Export';
  status: 'Success' | 'Partial Success' | 'Failure' | 'Started';
  details: string;
  connectionName?: string;
  entities?: string[];
  format?: string;
}

interface OperationHistoryState {
  history: OperationEntry[];
  addHistoryEntry: (entryData: Omit<OperationEntry, 'id' | 'timestamp'>) => void;
  clearHistory: () => void;
}

export const useOperationHistoryStore = create<OperationHistoryState>()(
  persist(
    (set, get) => ({
      history: [],
      addHistoryEntry: (entryData) => {
        const newEntry: OperationEntry = {
          ...entryData,
          id: `op-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          timestamp: new Date().toISOString(),
        };
        set((state) => ({ history: [newEntry, ...state.history].slice(0, 100) })); // Keep last 100 entries
      },
      clearHistory: () => {
        set({ history: [] });
      },
    }),
    {
      name: 'operation-history-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
