'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User, Workspace } from '@/types/domain';

interface AuthState {
  user: User | null;
  workspace: Workspace | null;
  hydrated: boolean;
  setAuth: (payload: { user: User; workspace: Workspace }) => void;
  clearAuth: () => void;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      workspace: null,
      hydrated: false,
      setAuth: ({ user, workspace }) => set({ user, workspace }),
      clearAuth: () => set({ user: null, workspace: null }),
      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: 'inv_auth_state',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, workspace: state.workspace }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);
