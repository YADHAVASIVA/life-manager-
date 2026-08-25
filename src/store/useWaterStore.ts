/**
 * Water Store
 * Manages hydration logs and daily tracking. Persists to AsyncStorage.
 */

import { create } from 'zustand';
import { WaterLog, WaterDay, WaterPreset } from '@/models/Water';
import { storageGet, storageSet, STORAGE_KEYS } from '@/services/storage';
import { format } from 'date-fns';
import { INITIAL_USER } from '@/constants/initialData';

const DEFAULT_PRESETS: WaterPreset[] = [
  { id: 'preset-1', label: 'Sip', amountML: 100, icon: 'water-outline' },
  { id: 'preset-2', label: 'Glass', amountML: 250, icon: 'cup-water' },
  { id: 'preset-3', label: 'Bottle', amountML: 500, icon: 'bottle-soda-outline' },
  { id: 'preset-4', label: 'Large', amountML: 750, icon: 'bottle-wine' },
];

interface WaterState {
  logs: WaterLog[];
  presets: WaterPreset[];
  /** Water target for today in mL */
  todayTargetML: number;
  isHydrated: boolean;
  // Actions
  hydrate: () => Promise<void>;
  logWater: (amountML: number, source?: string) => Promise<void>;
  removeLog: (id: string) => Promise<void>;
  editLog: (id: string, partial: Partial<WaterLog>) => Promise<void>;
  updateTarget: (targetML: number) => Promise<void>;
  // Selectors
  getTodayTotal: () => number;
  getTodayLogs: () => WaterLog[];
  getTodayProgress: () => number;
}

export const useWaterStore = create<WaterState>((set, get) => ({
  logs: [],
  presets: DEFAULT_PRESETS,
  todayTargetML: INITIAL_USER.waterTargetML,
  isHydrated: false,

  hydrate: async () => {
    const stored = await storageGet<WaterLog[]>(STORAGE_KEYS.WATER_LOGS);
    const presets = await storageGet<WaterPreset[]>(STORAGE_KEYS.WATER_PRESETS);
    set({
      logs: stored ?? [],
      presets: presets ?? DEFAULT_PRESETS,
      isHydrated: true,
    });
  },

  logWater: async (amountML, source) => {
    const log: WaterLog = {
      id: `water-${Date.now()}`,
      amountML,
      timestamp: new Date().toISOString(),
      source: source ?? 'custom',
    };
    const logs = [...get().logs, log];
    set({ logs });
    await storageSet(STORAGE_KEYS.WATER_LOGS, logs);
  },

  removeLog: async (id) => {
    const logs = get().logs.filter((l) => l.id !== id);
    set({ logs });
    await storageSet(STORAGE_KEYS.WATER_LOGS, logs);
  },

  editLog: async (id, partial) => {
    const logs = get().logs.map((l) => l.id === id ? { ...l, ...partial } : l);
    set({ logs });
    await storageSet(STORAGE_KEYS.WATER_LOGS, logs);
  },

  updateTarget: async (targetML) => {
    set({ todayTargetML: targetML });
  },

  getTodayLogs: () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return get().logs.filter((l) => l.timestamp.startsWith(today));
  },

  getTodayTotal: () => {
    return get().getTodayLogs().reduce((sum, l) => sum + l.amountML, 0);
  },

  getTodayProgress: () => {
    const total = get().getTodayTotal();
    const target = get().todayTargetML;
    if (target === 0) return 0;
    return Math.min(100, Math.round((total / target) * 100));
  },
}));
