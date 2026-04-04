import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { STORAGE_KEYS } from '@/constants/storage';
import type { LoginResult, UserProfile } from '@/types/auth';

interface AuthStore {
  token: string | null;
  user: UserProfile | null;
  hasHydrated: boolean;
  setSession: (payload: LoginResult) => void;
  clearSession: () => void;
  setHydrated: (hydrated: boolean) => void;
}

type PersistedAuthState = Pick<AuthStore, 'token' | 'user'>;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      hasHydrated: false,
      setSession: ({ token, user }) =>
        set({
          token,
          user,
        }),
      clearSession: () =>
        set({
          token: null,
          user: null,
        }),
      setHydrated: (hasHydrated) =>
        set({
          hasHydrated,
        }),
    }),
    {
      name: STORAGE_KEYS.auth,
      storage: createJSONStorage(() => localStorage),
      partialize: ({ token, user }): PersistedAuthState => ({
        token,
        user,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('Failed to restore auth store.', error);
        }

        state?.setHydrated(true);
      },
    },
  ),
);
