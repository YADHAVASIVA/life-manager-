/**
 * Statement Store — manages bank statement vault records
 */

import { create } from 'zustand';
import { StatementRecord } from '@/models/Statement';
import { storageGet, storageSet, STORAGE_KEYS } from '@/services/storage';

interface StatementState {
  statements: StatementRecord[];
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  addStatement: (statement: StatementRecord) => Promise<void>;
  updateStatement: (id: string, partial: Partial<StatementRecord>) => Promise<void>;
  removeStatement: (id: string) => Promise<void>;
  getByInstitution: (institution: StatementRecord['institution']) => StatementRecord[];
  getByPeriod: (period: string) => StatementRecord[];
}

export const useStatementStore = create<StatementState>((set, get) => ({
  statements: [],
  isHydrated: false,

  hydrate: async () => {
    const statements = await storageGet<StatementRecord[]>(STORAGE_KEYS.STATEMENTS);
    set({ statements: statements ?? [], isHydrated: true });
  },

  addStatement: async (statement) => {
    const statements = [...get().statements, statement];
    set({ statements });
    await storageSet(STORAGE_KEYS.STATEMENTS, statements);
  },

  updateStatement: async (id, partial) => {
    const statements = get().statements.map((s) =>
      s.id === id ? { ...s, ...partial, updatedAt: new Date().toISOString() } : s
    );
    set({ statements });
    await storageSet(STORAGE_KEYS.STATEMENTS, statements);
  },

  removeStatement: async (id) => {
    const statements = get().statements.filter((s) => s.id !== id);
    set({ statements });
    await storageSet(STORAGE_KEYS.STATEMENTS, statements);
  },

  getByInstitution: (institution) =>
    get().statements.filter((s) => s.institution === institution),

  getByPeriod: (period) =>
    get().statements.filter((s) => s.statementPeriod === period),
}));
