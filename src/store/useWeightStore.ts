/**
 * Weight Store
 * Manages weight logs. Persists to AsyncStorage.
 */

import { create } from 'zustand';
import { WeightLog } from '@/models/Weight';
import { storageGet, storageSet, STORAGE_KEYS } from '@/services/storage';
import { format } from 'date-fns';
import { INITIAL_USER } from '@/constants/initialData';

/** Calculate BMI */
function calculateBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

interface WeightState {
  logs: WeightLog[];
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  logWeight: (weightKg: number, note?: string) => Promise<void>;
  removeLog: (id: string) => Promise<void>;
  editLog: (id: string, partial: Partial<WeightLog>) => Promise<void>;
  getLatestWeight: () => number;
  getWeightChange: () => number;
}

export const useWeightStore = create<WeightState>((set, get) => ({
  logs: [],
  isHydrated: false,

  hydrate: async () => {
    const stored = await storageGet<WeightLog[]>(STORAGE_KEYS.WEIGHT_LOGS);
    set({ logs: stored ?? [], isHydrated: true });
  },

  logWeight: async (weightKg, note) => {
    const now = new Date();
    const log: WeightLog = {
      id: `weight-${Date.now()}`,
      weightKg,
      date: format(now, 'yyyy-MM-dd'),
      timestamp: now.toISOString(),
      note,
      bmi: calculateBMI(weightKg, INITIAL_USER.heightCm),
    };
    const logs = [...get().logs, log];
    set({ logs });
    await storageSet(STORAGE_KEYS.WEIGHT_LOGS, logs);
  },

  removeLog: async (id) => {
    const logs = get().logs.filter((l) => l.id !== id);
    set({ logs });
    await storageSet(STORAGE_KEYS.WEIGHT_LOGS, logs);
  },

  editLog: async (id, partial) => {
    const logs = get().logs.map((l) => {
      if (l.id === id) {
        const updated = { ...l, ...partial };
        if (partial.weightKg !== undefined) {
          updated.bmi = calculateBMI(updated.weightKg, INITIAL_USER.heightCm);
        }
        return updated;
      }
      return l;
    });
    set({ logs });
    await storageSet(STORAGE_KEYS.WEIGHT_LOGS, logs);
  },

  getLatestWeight: () => {
    const { logs } = get();
    if (logs.length === 0) return INITIAL_USER.weightKg;
    return logs[logs.length - 1]!.weightKg;
  },

  getWeightChange: () => {
    const { logs } = get();
    if (logs.length < 2) return 0;
    const latest = logs[logs.length - 1]!.weightKg;
    const previous = logs[logs.length - 2]!.weightKg;
    return Math.round((latest - previous) * 10) / 10;
  },
}));
