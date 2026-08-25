/**
 * Reminder Store — centralized reminder management
 */

import { create } from 'zustand';
import { Reminder } from '@/models/Reminder';
import { storageGet, storageSet, STORAGE_KEYS } from '@/services/storage';
import { INITIAL_REMINDERS } from '@/constants/initialData';
import { cancelNotification } from '@/services/notifications';

interface ReminderState {
  reminders: Reminder[];
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  addReminder: (reminder: Reminder) => Promise<void>;
  updateReminder: (id: string, partial: Partial<Reminder>) => Promise<void>;
  removeReminder: (id: string) => Promise<void>;
  toggleReminder: (id: string) => Promise<void>;
  getEnabledReminders: () => Reminder[];
  getRemindersByFrequency: (frequency: Reminder['frequency']) => Reminder[];
}

export const useReminderStore = create<ReminderState>((set, get) => ({
  reminders: INITIAL_REMINDERS,
  isHydrated: false,

  hydrate: async () => {
    const stored = await storageGet<Reminder[]>(STORAGE_KEYS.REMINDERS);
    if (stored && stored.length > 0) {
      set({ reminders: stored, isHydrated: true });
    } else {
      await storageSet(STORAGE_KEYS.REMINDERS, INITIAL_REMINDERS);
      set({ reminders: INITIAL_REMINDERS, isHydrated: true });
    }
  },

  addReminder: async (reminder) => {
    const reminders = [...get().reminders, reminder].sort((a, b) => a.order - b.order);
    set({ reminders });
    await storageSet(STORAGE_KEYS.REMINDERS, reminders);
  },

  updateReminder: async (id, partial) => {
    const reminders = get().reminders.map((r) =>
      r.id === id ? { ...r, ...partial, updatedAt: new Date().toISOString() } : r
    );
    set({ reminders });
    await storageSet(STORAGE_KEYS.REMINDERS, reminders);
  },

  removeReminder: async (id) => {
    const reminder = get().reminders.find((r) => r.id === id);
    // Cancel scheduled notification if exists
    if (reminder?.notificationId) {
      await cancelNotification(reminder.notificationId);
    }
    const reminders = get().reminders.filter((r) => r.id !== id);
    set({ reminders });
    await storageSet(STORAGE_KEYS.REMINDERS, reminders);
  },

  toggleReminder: async (id) => {
    const reminder = get().reminders.find((r) => r.id === id);
    if (!reminder) return;
    // Cancel notification when disabling
    if (reminder.enabled && reminder.notificationId) {
      await cancelNotification(reminder.notificationId);
    }
    await get().updateReminder(id, { enabled: !reminder.enabled, notificationId: undefined });
  },

  getEnabledReminders: () =>
    get().reminders.filter((r) => r.enabled).sort((a, b) => a.order - b.order),

  getRemindersByFrequency: (frequency) =>
    get().reminders.filter((r) => r.frequency === frequency),
}));
