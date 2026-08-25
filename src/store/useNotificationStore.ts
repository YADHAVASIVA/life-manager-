/**
 * Notification Store
 * Manages in-app notifications. Persists to AsyncStorage.
 */

import { create } from 'zustand';
import { AppNotification } from '@/models/Notification';
import { storageGet, storageSet, STORAGE_KEYS } from '@/services/storage';

interface NotificationState {
  notifications: AppNotification[];
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  addNotification: (notification: AppNotification) => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  removeNotification: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
  getUnreadCount: () => number;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  isHydrated: false,

  hydrate: async () => {
    const stored = await storageGet<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS);
    set({ notifications: stored ?? [], isHydrated: true });
  },

  addNotification: async (notification) => {
    // Prepend so newest is first; cap at 100 entries
    const notifications = [notification, ...get().notifications].slice(0, 100);
    set({ notifications });
    await storageSet(STORAGE_KEYS.NOTIFICATIONS, notifications);
  },

  markRead: async (id) => {
    const notifications = get().notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    set({ notifications });
    await storageSet(STORAGE_KEYS.NOTIFICATIONS, notifications);
  },

  markAllRead: async () => {
    const notifications = get().notifications.map((n) => ({ ...n, read: true }));
    set({ notifications });
    await storageSet(STORAGE_KEYS.NOTIFICATIONS, notifications);
  },

  removeNotification: async (id) => {
    const notifications = get().notifications.filter((n) => n.id !== id);
    set({ notifications });
    await storageSet(STORAGE_KEYS.NOTIFICATIONS, notifications);
  },

  clearAll: async () => {
    set({ notifications: [] });
    await storageSet(STORAGE_KEYS.NOTIFICATIONS, []);
  },

  getUnreadCount: () => {
    return get().notifications.filter((n) => !n.read).length;
  },
}));
