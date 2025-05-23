
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { UserRole } from '@/config/site';

interface AuthState {
  isAuthenticated: boolean;
  currentUserRole: UserRole;
  login: (role: UserRole) => void;
  logout: () => void;
  setRole: (role: UserRole) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: true, 
      currentUserRole: 'Admin', 
      login: (role) => set({ isAuthenticated: true, currentUserRole: role }),
      logout: () => set({ isAuthenticated: false, currentUserRole: 'Guest' }),
      setRole: (role) => set({ currentUserRole: role }),
    }),
    {
      name: 'auth-storage', 
      storage: createJSONStorage(() => localStorage), 
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        currentUserRole: state.currentUserRole,
      }),
    }
  )
);
