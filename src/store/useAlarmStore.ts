/**
 * Alarm Store
 * Manages alarms. Persists to AsyncStorage.
 * Scheduling is delegated to the alarm service.
 */

import { create } from 'zustand';
import { Alarm } from '@/models/Alarm';
import { storageGet, storageSet, STORAGE_KEYS } from '@/services/storage';
import { scheduleAlarm, cancelAlarm } from '@/services/alarms';

interface AlarmState {
  alarms: Alarm[];
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  addAlarm: (alarm: Alarm) => Promise<void>;
  updateAlarm: (id: string, partial: Partial<Alarm>) => Promise<void>;
  removeAlarm: (id: string) => Promise<void>;
  toggleAlarm: (id: string) => Promise<void>;
}

export const useAlarmStore = create<AlarmState>((set, get) => ({
  alarms: [],
  isHydrated: false,

  hydrate: async () => {
    const stored = await storageGet<Alarm[]>(STORAGE_KEYS.ALARMS);
    set({ alarms: stored ?? [], isHydrated: true });
  },

  addAlarm: async (alarm) => {
    // Schedule notifications and store IDs
    let notificationId: string | undefined;
    if (alarm.enabled) {
      const ids = await scheduleAlarm(alarm);
      notificationId = ids.join(',');
    }
    const alarmWithId: Alarm = { ...alarm, notificationId };
    const alarms = [...get().alarms, alarmWithId];
    set({ alarms });
    await storageSet(STORAGE_KEYS.ALARMS, alarms);
  },

  updateAlarm: async (id, partial) => {
    const existing = get().alarms.find((a) => a.id === id);
    if (!existing) return;

    // Cancel old notifications
    if (existing.notificationId) {
      await cancelAlarm(existing.notificationId.split(','));
    }

    const updated: Alarm = {
      ...existing,
      ...partial,
      updatedAt: new Date().toISOString(),
    };

    // Reschedule if enabled
    let notificationId: string | undefined;
    if (updated.enabled) {
      const ids = await scheduleAlarm(updated);
      notificationId = ids.join(',');
    }
    updated.notificationId = notificationId;

    const alarms = get().alarms.map((a) => (a.id === id ? updated : a));
    set({ alarms });
    await storageSet(STORAGE_KEYS.ALARMS, alarms);
  },

  removeAlarm: async (id) => {
    const alarm = get().alarms.find((a) => a.id === id);
    if (alarm?.notificationId) {
      await cancelAlarm(alarm.notificationId.split(','));
    }
    const alarms = get().alarms.filter((a) => a.id !== id);
    set({ alarms });
    await storageSet(STORAGE_KEYS.ALARMS, alarms);
  },

  toggleAlarm: async (id) => {
    const alarm = get().alarms.find((a) => a.id === id);
    if (!alarm) return;
    await get().updateAlarm(id, { enabled: !alarm.enabled });
  },
}));
