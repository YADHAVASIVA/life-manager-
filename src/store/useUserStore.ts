/**
 * User Store
 * Manages the user's profile. Persists to AsyncStorage.
 */

import { create } from 'zustand';
import { User } from '@/models/User';
import { storageGet, storageSet, STORAGE_KEYS } from '@/services/storage';
import { INITIAL_USER } from '@/constants/initialData';

interface UserState {
  user: User;
  isHydrated: boolean;
  // Actions
  hydrate: () => Promise<void>;
  updateUser: (partial: Partial<User>) => Promise<void>;
  resetUser: () => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: INITIAL_USER,
  isHydrated: false,

  hydrate: async () => {
    const stored = await storageGet<User>(STORAGE_KEYS.USER);
    if (stored) {
      set({ user: stored, isHydrated: true });
    } else {
      // First launch: persist initial data
      await storageSet(STORAGE_KEYS.USER, INITIAL_USER);
      set({ user: INITIAL_USER, isHydrated: true });
    }
  },

  updateUser: async (partial) => {
    const updated: User = {
      ...get().user,
      ...partial,
      updatedAt: new Date().toISOString(),
    };
    set({ user: updated });
    await storageSet(STORAGE_KEYS.USER, updated);
  },

  resetUser: async () => {
    set({ user: INITIAL_USER });
    await storageSet(STORAGE_KEYS.USER, INITIAL_USER);
  },
}));
