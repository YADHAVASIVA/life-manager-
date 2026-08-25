/**
 * Finance Alert Store — manages smart financial alerts and thresholds
 */

import { create } from 'zustand';
import { FinancialAlert, FinancialAlertThreshold } from '@/models/FinancialAlert';
import { storageGet, storageSet, STORAGE_KEYS } from '@/services/storage';

const DEFAULT_THRESHOLDS: FinancialAlertThreshold = {
  dailySpendingLimitINR: 200,       // Warn if daily misc > ₹200
  monthlyBudgetWarningPercent: 80,  // Warn at 80% of budget
  creditWarningINR: 400,            // First credit warning
  creditCeilingINR: 540,            // 30% of ₹1,800
  sipReminderDaysBefore: 3,
  statementReminderDaysBefore: 5,
};

interface FinanceAlertState {
  alerts: FinancialAlert[];
  thresholds: FinancialAlertThreshold;
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  addAlert: (alert: FinancialAlert) => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  dismiss: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
  updateThresholds: (thresholds: Partial<FinancialAlertThreshold>) => Promise<void>;
  getUnreadCount: () => number;
  getActiveAlerts: () => FinancialAlert[];
}

export const useFinanceAlertStore = create<FinanceAlertState>((set, get) => ({
  alerts: [],
  thresholds: DEFAULT_THRESHOLDS,
  isHydrated: false,

  hydrate: async () => {
    const alerts = await storageGet<FinancialAlert[]>(STORAGE_KEYS.FINANCIAL_ALERTS);
    const thresholds = await storageGet<FinancialAlertThreshold>(STORAGE_KEYS.ALERT_THRESHOLDS);
    set({
      alerts: alerts ?? [],
      thresholds: thresholds ?? DEFAULT_THRESHOLDS,
      isHydrated: true,
    });
  },

  addAlert: async (alert) => {
    // Prepend newest first; cap at 50
    const alerts = [alert, ...get().alerts].slice(0, 50);
    set({ alerts });
    await storageSet(STORAGE_KEYS.FINANCIAL_ALERTS, alerts);
  },

  markRead: async (id) => {
    const alerts = get().alerts.map((a) => (a.id === id ? { ...a, read: true } : a));
    set({ alerts });
    await storageSet(STORAGE_KEYS.FINANCIAL_ALERTS, alerts);
  },

  markAllRead: async () => {
    const alerts = get().alerts.map((a) => ({ ...a, read: true }));
    set({ alerts });
    await storageSet(STORAGE_KEYS.FINANCIAL_ALERTS, alerts);
  },

  dismiss: async (id) => {
    const alerts = get().alerts.map((a) =>
      a.id === id ? { ...a, dismissed: true, read: true } : a
    );
    set({ alerts });
    await storageSet(STORAGE_KEYS.FINANCIAL_ALERTS, alerts);
  },

  clearAll: async () => {
    set({ alerts: [] });
    await storageSet(STORAGE_KEYS.FINANCIAL_ALERTS, []);
  },

  updateThresholds: async (partial) => {
    const thresholds = { ...get().thresholds, ...partial };
    set({ thresholds });
    await storageSet(STORAGE_KEYS.ALERT_THRESHOLDS, thresholds);
  },

  getUnreadCount: () => get().alerts.filter((a) => !a.read && !a.dismissed).length,

  getActiveAlerts: () => get().alerts.filter((a) => !a.dismissed),
}));
