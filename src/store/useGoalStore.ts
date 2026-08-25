/**
 * Goal Store
 * Manages personal goals. Persists to AsyncStorage.
 */

import { create } from 'zustand';
import { Goal } from '@/models/Goal';
import { storageGet, storageSet, STORAGE_KEYS } from '@/services/storage';

interface GoalState {
  goals: Goal[];
  isHydrated: boolean;
  // Actions
  hydrate: () => Promise<void>;
  addGoal: (goal: Goal) => Promise<void>;
  updateGoal: (id: string, partial: Partial<Goal>) => Promise<void>;
  removeGoal: (id: string) => Promise<void>;
  updateProgress: (id: string, current: number) => Promise<void>;
}

export const useGoalStore = create<GoalState>((set, get) => ({
  goals: [],
  isHydrated: false,

  hydrate: async () => {
    const stored = await storageGet<Goal[]>(STORAGE_KEYS.GOALS);
    set({ goals: stored ?? [], isHydrated: true });
  },

  _persist: async (goals: Goal[]) => {
    await storageSet(STORAGE_KEYS.GOALS, goals);
  },

  addGoal: async (goal) => {
    const goals = [...get().goals, goal];
    set({ goals });
    await storageSet(STORAGE_KEYS.GOALS, goals);
  },

  updateGoal: async (id, partial) => {
    const goals = get().goals.map((g) =>
      g.id === id
        ? { ...g, ...partial, updatedAt: new Date().toISOString() }
        : g
    );
    set({ goals });
    await storageSet(STORAGE_KEYS.GOALS, goals);
  },

  removeGoal: async (id) => {
    const goals = get().goals.filter((g) => g.id !== id);
    set({ goals });
    await storageSet(STORAGE_KEYS.GOALS, goals);
  },

  updateProgress: async (id, current) => {
    const goals = get().goals.map((g) => {
      if (g.id !== id) return g;
      const progress = Math.min(100, Math.round((current / g.target) * 100));
      const status = progress >= 100 ? 'completed' : g.status;
      return {
        ...g,
        current,
        progress,
        status,
        updatedAt: new Date().toISOString(),
      };
    });
    set({ goals });
    await storageSet(STORAGE_KEYS.GOALS, goals);
  },
}));
