/**
 * Savings Store — manages savings goals and contributions
 */

import { create } from 'zustand';
import { SavingsGoal, SavingsContribution } from '@/models/Savings';
import { storageGet, storageSet, STORAGE_KEYS } from '@/services/storage';

interface SavingsState {
  goals: SavingsGoal[];
  contributions: SavingsContribution[];
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  addGoal: (goal: SavingsGoal) => Promise<void>;
  updateGoal: (id: string, partial: Partial<SavingsGoal>) => Promise<void>;
  removeGoal: (id: string) => Promise<void>;
  addContribution: (contribution: SavingsContribution) => Promise<void>;
  getGoalContributions: (goalId: string) => SavingsContribution[];
  getTotalSaved: () => number;
}

export const useSavingsStore = create<SavingsState>((set, get) => ({
  goals: [],
  contributions: [],
  isHydrated: false,

  hydrate: async () => {
    const goals = await storageGet<SavingsGoal[]>(STORAGE_KEYS.SAVINGS_GOALS);
    const contributions = await storageGet<SavingsContribution[]>(STORAGE_KEYS.SAVINGS_CONTRIBUTIONS);
    set({ goals: goals ?? [], contributions: contributions ?? [], isHydrated: true });
  },

  addGoal: async (goal) => {
    const goals = [...get().goals, goal];
    set({ goals });
    await storageSet(STORAGE_KEYS.SAVINGS_GOALS, goals);
  },

  updateGoal: async (id, partial) => {
    const goals = get().goals.map((g) =>
      g.id === id
        ? {
            ...g,
            ...partial,
            progressPercent: Math.min(
              100,
              Math.round(((partial.currentINR ?? g.currentINR) / g.targetINR) * 100)
            ),
            updatedAt: new Date().toISOString(),
          }
        : g
    );
    set({ goals });
    await storageSet(STORAGE_KEYS.SAVINGS_GOALS, goals);
  },

  removeGoal: async (id) => {
    const goals = get().goals.filter((g) => g.id !== id);
    set({ goals });
    await storageSet(STORAGE_KEYS.SAVINGS_GOALS, goals);
  },

  addContribution: async (contribution) => {
    const contributions = [...get().contributions, contribution];
    set({ contributions });
    await storageSet(STORAGE_KEYS.SAVINGS_CONTRIBUTIONS, contributions);
    // Update goal currentINR
    const goal = get().goals.find((g) => g.id === contribution.savingsGoalId);
    if (goal) {
      await get().updateGoal(goal.id, {
        currentINR: goal.currentINR + contribution.amountINR,
      });
    }
  },

  getGoalContributions: (goalId) =>
    get().contributions.filter((c) => c.savingsGoalId === goalId),

  getTotalSaved: () =>
    get().goals.reduce((sum, g) => sum + g.currentINR, 0),
}));
