// src/stores/databaseSettingsStore.ts
"use client";

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
export type DatabaseConnection = { // Define the type here
  id: string;
  name: string;
  type: 'localJson' | 'mongodb' | 'notion'; // Add other types as needed
  connectionString: string;
  isActive: boolean;
  collections?: { [key: string]: string }; // Optional, for MongoDB/Notion
};
import { toast } from '@/hooks/use-toast';

const initialConnections: DatabaseConnection[] = [
  {
    id: 'conn-local-json',
    name: 'Local JSON',
    type: 'localJson',
    connectionString: 'internal://local-json-files',
    isActive: true,
  },
  {
    id: 'conn-mongo-prod',
    name: 'MongoDB',
    type: 'mongodb',
    connectionString: 'mongodb+srv://prod_user:PASSWORD_PLACEHOLDER@prodcluster.mongodb.net/spinkit_db_prod?retryWrites=true&w=majority',
    isActive: false,
    collections: {
      djs: 'djs',
      venues: 'venues',
      events: 'events',
      recordings: 'recordings',
      genres: 'genres',
      cities: 'cities',
    }
  },
  {
    id: 'conn-notion-workspace',
    name: 'Notion',
    type: 'notion', // Ensure 'notion' is a valid type
    connectionString: 'secret_YOUR_NOTION_API_KEY_PLACEHOLDER',
    isActive: false,
    // collections for Notion might represent database IDs, 
    // but this structure is primarily for MongoDB. Notion connections might not use this.
  },
];

interface DatabaseSettingsState {
  connections: DatabaseConnection[];
  addConnection: (connection: Omit<DatabaseConnection, 'id'>) => void;
  editConnection: (updatedConnection: DatabaseConnection) => void;
  deleteConnection: (connectionId: string) => void;
  setActiveConnection: (connectionId: string) => void;
  setConnections: (connections: DatabaseConnection[]) => void;
}

export const useDatabaseSettingsStore = create<DatabaseSettingsState>()(
  persist(
    (set, get) => ({
      connections: initialConnections,
      setConnections: (connections) => set({ connections }),
      addConnection: (connectionData) => {
        const newConnection: DatabaseConnection = {
          ...connectionData,
          id: `conn-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        };
        set((state) => {
          let updatedConnections = [...state.connections, newConnection];
          if (newConnection.isActive) {
            updatedConnections = updatedConnections.map(c => 
              c.id === newConnection.id ? c : { ...c, isActive: false }
            );
          } else if (updatedConnections.length === 1 && !updatedConnections[0].isActive) {
            updatedConnections[0].isActive = true;
          }
          return { connections: updatedConnections };
        });
        toast({ title: "Connection Added", description: `"${newConnection.name}" has been added.` });
      },
      editConnection: (updatedConnection) => {
        set((state) => {
          let updatedConnections = state.connections.map(c =>
            c.id === updatedConnection.id ? updatedConnection : c
          );
          if (updatedConnection.isActive) {
            updatedConnections = updatedConnections.map(c =>
              c.id === updatedConnection.id ? c : { ...c, isActive: false }
            );
          } else {
            const activeStillExists = updatedConnections.some(c => c.isActive);
            if (!activeStillExists && updatedConnections.length > 0) {
              const firstNonBeingEdited = updatedConnections.find(c => c.id !== updatedConnection.id);
              if(firstNonBeingEdited) firstNonBeingEdited.isActive = true;
              else if (updatedConnections.length > 0) updatedConnections[0].isActive = true; 
            }
          }
          return { connections: updatedConnections };
        });
        toast({ title: "Connection Updated", description: `Details for "${updatedConnection.name}" have been updated.` });
      },
      deleteConnection: (connectionId) => {
        const connToDelete = get().connections.find(c => c.id === connectionId);
        if (!connToDelete) return;

        if (connToDelete.isActive && get().connections.length === 1) {
          toast({ title: "Action Prevented", description: "Cannot delete the only connection, especially if it's active.", variant: "destructive" });
          return;
        }

        set((state) => {
          let updatedConnections = state.connections.filter(c => c.id !== connectionId);
          if (connToDelete.isActive && updatedConnections.length > 0) {
            updatedConnections[0].isActive = true;
          }
          return { connections: updatedConnections };
        });
        toast({ title: "Connection Deleted", description: `Connection "${connToDelete.name}" has been removed.` });
      },
      setActiveConnection: (connectionId) => {
        const newlyActiveConn = get().connections.find(c => c.id === connectionId);
        set((state) => ({
          connections: state.connections.map(c => ({
            ...c,
            isActive: c.id === connectionId,
          })),
        }));
        if (newlyActiveConn) {
          toast({ title: "Active Connection Set", description: `"${newlyActiveConn.name}" is now the active data source configuration in the UI.` });
        }
      },
    }),
    {
      name: 'database-settings-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
