
import { create } from 'zustand';
import type { ToolWindowId } from '@/config/site';

// Initialize toolStates with all tools closed by default
const initialToolStates: Record<ToolWindowId, boolean> = {
  dev: false,
  music: false,
  chat: false,
  aisandbox: false,
  pins: false,
  notifications: false,
};

interface ToolWindowsState {
  toolStates: Record<ToolWindowId, boolean>;
  hasNotifications: boolean; // True if the notification icon should be shown at all
  unreadNotificationCount: number;
  toggleToolWindow: (toolId: ToolWindowId) => void;
  openToolWindow: (toolId: ToolWindowId) => void;
  closeToolWindow: (toolId: ToolWindowId) => void;
  setHasNotifications: (status: boolean) => void; // For external control if needed
  setUnreadNotificationCount: (count: number) => void;
  decrementUnreadCount: () => void;
  resetUnreadCount: () => void; // Called when notifications tool is opened
}

export const useToolWindowsStore = create<ToolWindowsState>((set, get) => ({
  toolStates: initialToolStates,
  hasNotifications: true, // Default to showing the notification bell
  unreadNotificationCount: 3, // Mock initial unread count
  toggleToolWindow: (toolId) => {
    const currentToolState = get().toolStates[toolId];
    set((state) => ({
      toolStates: {
        ...state.toolStates,
        [toolId]: !currentToolState,
      },
    }));
    if (toolId === 'notifications' && !currentToolState) { // if it was just opened
      get().resetUnreadCount();
    }
  },
  openToolWindow: (toolId) => {
    set((state) => ({
      toolStates: { ...state.toolStates, [toolId]: true },
    }));
    if (toolId === 'notifications') {
      get().resetUnreadCount();
    }
  },
  closeToolWindow: (toolId) => {
    set((state) => ({
      toolStates: { ...state.toolStates, [toolId]: false },
    }));
  },
  setHasNotifications: (status) => set({ hasNotifications: status }),
  setUnreadNotificationCount: (count) => set({ unreadNotificationCount: Math.max(0, count) }),
  decrementUnreadCount: () =>
    set((state) => ({
      unreadNotificationCount: Math.max(0, state.unreadNotificationCount - 1),
    })),
  resetUnreadCount: () => set({ unreadNotificationCount: 0 }),
}));
