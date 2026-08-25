/**
 * LifeOS Notification Service
 *
 * Compatible with expo-notifications 0.28.x (Expo SDK 51).
 * Uses the legacy trigger object format (no SchedulableTriggerInputTypes enum).
 */

import * as ExpoNotifications from 'expo-notifications';
import { Platform } from 'react-native';

// ─── Configuration ─────────────────────────────────────────────────────────

ExpoNotifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// ─── Permission ────────────────────────────────────────────────────────────

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await ExpoNotifications.setNotificationChannelAsync('default', {
      name: 'LifeOS Notifications',
      importance: ExpoNotifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#C9A84C',
    });
    await ExpoNotifications.setNotificationChannelAsync('alarms', {
      name: 'LifeOS Alarms',
      importance: ExpoNotifications.AndroidImportance.MAX,
      vibrationPattern: [0, 500, 250, 500],
      lightColor: '#C9A84C',
      bypassDnd: true,
    });
    await ExpoNotifications.setNotificationChannelAsync('reminders', {
      name: 'LifeOS Reminders',
      importance: ExpoNotifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#C9A84C',
    });
    await ExpoNotifications.setNotificationChannelAsync('finance', {
      name: 'LifeOS Finance',
      importance: ExpoNotifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#C9A84C',
    });
    await ExpoNotifications.setNotificationChannelAsync('health', {
      name: 'LifeOS Health',
      importance: ExpoNotifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#C9A84C',
    });
  }

  const { status } = await ExpoNotifications.requestPermissionsAsync();
  return status === 'granted';
}

// ─── Schedule helpers ──────────────────────────────────────────────────────

/** Schedule a one-time notification at a specific date. */
export async function scheduleNotification(params: {
  title: string;
  body: string;
  trigger: Date;
  channelId?: string;
  data?: Record<string, unknown>;
}): Promise<string | null> {
  try {
    const id = await ExpoNotifications.scheduleNotificationAsync({
      content: {
        title: params.title,
        body: params.body,
        data: params.data ?? {},
        sound: true,
      },
      trigger: {
        date: params.trigger,
        channelId: params.channelId ?? 'default',
      },
    });
    return id;
  } catch (err) {
    console.warn('[Notifications] Failed to schedule:', err);
    return null;
  }
}

/** Cancel a scheduled notification by its ID. */
export async function cancelNotification(id: string): Promise<void> {
  try {
    await ExpoNotifications.cancelScheduledNotificationAsync(id);
  } catch (err) {
    console.warn('[Notifications] Failed to cancel:', err);
  }
}

/** Cancel all scheduled notifications. */
export async function cancelAllNotifications(): Promise<void> {
  try {
    await ExpoNotifications.cancelAllScheduledNotificationsAsync();
  } catch (err) {
    console.warn('[Notifications] Failed to cancel all:', err);
  }
}

/** Send an immediate local notification. */
export async function sendImmediateNotification(params: {
  title: string;
  body: string;
  data?: Record<string, unknown>;
}): Promise<void> {
  try {
    await ExpoNotifications.scheduleNotificationAsync({
      content: {
        title: params.title,
        body: params.body,
        data: params.data ?? {},
        sound: true,
      },
      trigger: null,
    });
  } catch (err) {
    console.warn('[Notifications] Failed to send immediate:', err);
  }
}
