/**
 * Bank Store — manages three bank accounts and their transactions
 */

import { create } from 'zustand';
import { BankAccount, BankTransaction } from '@/models/BankAccount';
import { storageGet, storageSet, STORAGE_KEYS } from '@/services/storage';
import { INITIAL_BANK_ACCOUNTS } from '@/constants/initialData';
import { format } from 'date-fns';

interface BankState {
  accounts: BankAccount[];
  transactions: BankTransaction[];
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  // Account actions
  updateAccount: (id: string, partial: Partial<BankAccount>) => Promise<void>;
  updateBalance: (id: string, balanceINR: number) => Promise<void>;
  // Transaction actions
  addTransaction: (tx: BankTransaction) => Promise<void>;
  removeTransaction: (id: string) => Promise<void>;
  // Selectors
  getAccount: (id: string) => BankAccount | undefined;
  getAccountTransactions: (accountId: string) => BankTransaction[];
  getTodayTransactions: (accountId?: string) => BankTransaction[];
  getMonthTransactions: (month: string, accountId?: string) => BankTransaction[];
  getTotalBalance: () => number;
}

export const useBankStore = create<BankState>((set, get) => ({
  accounts: INITIAL_BANK_ACCOUNTS,
  transactions: [],
  isHydrated: false,

  hydrate: async () => {
    const accounts = await storageGet<BankAccount[]>(STORAGE_KEYS.BANK_ACCOUNTS);
    const transactions = await storageGet<BankTransaction[]>(STORAGE_KEYS.BANK_TRANSACTIONS);
    if (accounts && accounts.length > 0) {
      set({ accounts, transactions: transactions ?? [], isHydrated: true });
    } else {
      await storageSet(STORAGE_KEYS.BANK_ACCOUNTS, INITIAL_BANK_ACCOUNTS);
      set({ accounts: INITIAL_BANK_ACCOUNTS, transactions: [], isHydrated: true });
    }
  },

  updateAccount: async (id, partial) => {
    const accounts = get().accounts.map((a) =>
      a.id === id ? { ...a, ...partial, updatedAt: new Date().toISOString() } : a
    );
    set({ accounts });
    await storageSet(STORAGE_KEYS.BANK_ACCOUNTS, accounts);
  },

  updateBalance: async (id, balanceINR) => {
    await get().updateAccount(id, { balanceINR });
  },

  addTransaction: async (tx) => {
    const transactions = [...get().transactions, tx];
    set({ transactions });
    await storageSet(STORAGE_KEYS.BANK_TRANSACTIONS, transactions);
    // Update account balance if balanceAfterINR provided
    if (tx.balanceAfterINR !== undefined) {
      await get().updateBalance(tx.bankAccountId, tx.balanceAfterINR);
    }
  },

  removeTransaction: async (id) => {
    const transactions = get().transactions.filter((t) => t.id !== id);
    set({ transactions });
    await storageSet(STORAGE_KEYS.BANK_TRANSACTIONS, transactions);
  },

  getAccount: (id) => get().accounts.find((a) => a.id === id),

  getAccountTransactions: (accountId) =>
    get().transactions.filter((t) => t.bankAccountId === accountId),

  getTodayTransactions: (accountId) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return get().transactions.filter(
      (t) => t.date === today && (!accountId || t.bankAccountId === accountId)
    );
  },

  getMonthTransactions: (month, accountId) =>
    get().transactions.filter(
      (t) => t.date.startsWith(month) && (!accountId || t.bankAccountId === accountId)
    ),

  getTotalBalance: () =>
    get().accounts.filter((a) => a.isActive).reduce((sum, a) => sum + a.balanceINR, 0),
}));
