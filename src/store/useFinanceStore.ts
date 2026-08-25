/**
 * Finance Store — manages expenses, budget, and SIP records
 * Updated to match extended Finance model (INR suffix on Budget fields)
 */

import { create } from 'zustand';
import {
  Expense,
  Budget,
  SIPRecord,
  MonthlyFinanceSummary,
  ExpenseCategory,
  computeTotalPlanned,
} from '@/models/Finance';
import { storageGet, storageSet, STORAGE_KEYS } from '@/services/storage';
import { INITIAL_BUDGET } from '@/constants/initialData';
import { format } from 'date-fns';

interface FinanceState {
  expenses: Expense[];
  budget: Budget;
  sipRecords: SIPRecord[];
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  addExpense: (expense: Expense) => Promise<void>;
  updateExpense: (id: string, partial: Partial<Expense>) => Promise<void>;
  removeExpense: (id: string) => Promise<void>;
  updateBudget: (budget: Budget) => Promise<void>;
  addSIPRecord: (record: SIPRecord) => Promise<void>;
  togglePrivacyMode: () => Promise<void>;
  getCurrentMonthSummary: () => MonthlyFinanceSummary;
  getTodayExpenses: () => Expense[];
  getRemainingMiscBudget: () => number;
  getDailyMiscGuidance: () => number;
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
  expenses: [],
  budget: INITIAL_BUDGET,
  sipRecords: [],
  isHydrated: false,

  hydrate: async () => {
    const expenses = await storageGet<Expense[]>(STORAGE_KEYS.EXPENSES);
    let budget = await storageGet<any>(STORAGE_KEYS.BUDGET);
    
    // Migrate legacy budget missing INR suffix
    if (budget && typeof budget.monthlyIncomeINR === 'undefined') {
      budget = {
        monthlyIncomeINR: budget.monthlyIncome || INITIAL_BUDGET.monthlyIncomeINR,
        rentINR: budget.rent || INITIAL_BUDGET.rentINR,
        gymINR: budget.gym || INITIAL_BUDGET.gymINR,
        gymFoodINR: budget.gymFood || INITIAL_BUDGET.gymFoodINR,
        sipINR: budget.sip || INITIAL_BUDGET.sipINR,
        miscellaneousINR: budget.miscellaneous || INITIAL_BUDGET.miscellaneousINR,
        dailySpendingLimitINR: budget.dailySpendingLimit || INITIAL_BUDGET.dailySpendingLimitINR,
        privacyModeEnabled: budget.privacyModeEnabled || false,
      };
      await storageSet(STORAGE_KEYS.BUDGET, budget);
    }

    const sipRecords = await storageGet<SIPRecord[]>(STORAGE_KEYS.SIP_RECORDS);
    set({
      expenses: expenses ?? [],
      budget: (budget as Budget) ?? INITIAL_BUDGET,
      sipRecords: sipRecords ?? [],
      isHydrated: true,
    });
  },

  addExpense: async (expense) => {
    const expenses = [...get().expenses, expense];
    set({ expenses });
    await storageSet(STORAGE_KEYS.EXPENSES, expenses);
  },

  updateExpense: async (id, partial) => {
    const expenses = get().expenses.map((e) => (e.id === id ? { ...e, ...partial } : e));
    set({ expenses });
    await storageSet(STORAGE_KEYS.EXPENSES, expenses);
  },

  removeExpense: async (id) => {
    const expenses = get().expenses.filter((e) => e.id !== id);
    set({ expenses });
    await storageSet(STORAGE_KEYS.EXPENSES, expenses);
  },

  updateBudget: async (budget) => {
    set({ budget });
    await storageSet(STORAGE_KEYS.BUDGET, budget);
  },

  addSIPRecord: async (record) => {
    const sipRecords = [...get().sipRecords, record];
    set({ sipRecords });
    await storageSet(STORAGE_KEYS.SIP_RECORDS, sipRecords);
  },

  togglePrivacyMode: async () => {
    const budget = { ...get().budget, privacyModeEnabled: !get().budget.privacyModeEnabled };
    set({ budget });
    await storageSet(STORAGE_KEYS.BUDGET, budget);
  },

  getTodayExpenses: () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return get().expenses.filter((e) => e.date === today);
  },

  getCurrentMonthSummary: () => {
    const month = format(new Date(), 'yyyy-MM');
    const { budget } = get();
    const monthExpenses = get().expenses.filter((e) => e.date.startsWith(month));

    const expensesByCategory = monthExpenses.reduce<Partial<Record<ExpenseCategory, number>>>(
      (acc, e) => {
        acc[e.category] = (acc[e.category] ?? 0) + e.amountINR;
        return acc;
      },
      {}
    );

    const totalExpensesINR = monthExpenses.reduce((sum, e) => sum + e.amountINR, 0);
    const totalSIPINR = get().sipRecords
      .filter((s) => s.date.startsWith(month))
      .reduce((sum, s) => sum + s.amountINR, 0);

    const totalPlanned = computeTotalPlanned(budget);
    const budgetAdherencePercent =
      totalPlanned > 0 ? Math.round((1 - totalExpensesINR / totalPlanned) * 100) : 100;

    return {
      month,
      totalIncomeINR: budget.monthlyIncomeINR,
      totalExpensesINR,
      totalSavedINR: budget.monthlyIncomeINR - totalExpensesINR - totalSIPINR,
      totalSIPINR,
      budgetAdherencePercent: Math.max(0, budgetAdherencePercent),
      expensesByCategory,
      insights: [],
    };
  },

  getRemainingMiscBudget: () => {
    const { budget } = get();
    const month = format(new Date(), 'yyyy-MM');
    const monthMisc = get().expenses
      .filter((e) => e.date.startsWith(month) && e.category === 'miscellaneous')
      .reduce((sum, e) => sum + e.amountINR, 0);
    return budget.miscellaneousINR - monthMisc;
  },

  getDailyMiscGuidance: () => {
    const remaining = get().getRemainingMiscBudget();
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const daysLeft = daysInMonth - today.getDate() + 1;
    if (daysLeft <= 0) return 0;
    return Math.round(remaining / daysLeft);
  },
}));
