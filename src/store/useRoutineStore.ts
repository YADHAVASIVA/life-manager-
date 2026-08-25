/**
 * Routine Store
 * Manages daily routine blocks. Persists to AsyncStorage.
 */

import { create } from 'zustand';
import { RoutineBlock } from '@/models/Routine';
import { storageGet, storageSet, STORAGE_KEYS } from '@/services/storage';
import { INITIAL_ROUTINE } from '@/constants/initialData';

interface RoutineState {
  blocks: RoutineBlock[];
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  addBlock: (block: RoutineBlock) => Promise<void>;
  updateBlock: (id: string, partial: Partial<RoutineBlock>) => Promise<void>;
  removeBlock: (id: string) => Promise<void>;
  reorderBlocks: (ordered: RoutineBlock[]) => Promise<void>;
  toggleBlock: (id: string) => Promise<void>;
  getEnabledBlocks: () => RoutineBlock[];
}

export const useRoutineStore = create<RoutineState>((set, get) => ({
  blocks: INITIAL_ROUTINE,
  isHydrated: false,

  hydrate: async () => {
    const stored = await storageGet<RoutineBlock[]>(STORAGE_KEYS.ROUTINE);
    if (stored && stored.length > 0) {
      set({ blocks: stored, isHydrated: true });
    } else {
      // First launch: persist initial routine
      await storageSet(STORAGE_KEYS.ROUTINE, INITIAL_ROUTINE);
      set({ blocks: INITIAL_ROUTINE, isHydrated: true });
    }
  },

  addBlock: async (block) => {
    const blocks = [...get().blocks, block].sort((a, b) => a.order - b.order);
    set({ blocks });
    await storageSet(STORAGE_KEYS.ROUTINE, blocks);
  },

  updateBlock: async (id, partial) => {
    const blocks = get().blocks.map((b) => (b.id === id ? { ...b, ...partial } : b));
    set({ blocks });
    await storageSet(STORAGE_KEYS.ROUTINE, blocks);
  },

  removeBlock: async (id) => {
    const blocks = get().blocks.filter((b) => b.id !== id);
    set({ blocks });
    await storageSet(STORAGE_KEYS.ROUTINE, blocks);
  },

  reorderBlocks: async (ordered) => {
    const blocks = ordered.map((b, i) => ({ ...b, order: i }));
    set({ blocks });
    await storageSet(STORAGE_KEYS.ROUTINE, blocks);
  },

  toggleBlock: async (id) => {
    const blocks = get().blocks.map((b) =>
      b.id === id ? { ...b, enabled: !b.enabled } : b
    );
    set({ blocks });
    await storageSet(STORAGE_KEYS.ROUTINE, blocks);
  },

  getEnabledBlocks: () => {
    return get().blocks.filter((b) => b.enabled).sort((a, b) => a.order - b.order);
  },
}));
