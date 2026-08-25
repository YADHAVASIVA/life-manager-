/**
 * LifeOS Alarm Service
 *
 * Compatible with expo-notifications 0.28.x (Expo SDK 51).
 * Uses the legacy trigger object format (no SchedulableTriggerInputTypes enum).
 */

import * as ExpoNotifications from 'expo-notifications';
import { Alarm, RepeatDay } from '@/models/Alarm';

const DAY_TO_WEEKDAY: Record<RepeatDay, number> = {
  sun: 1,
  mon: 2,
  tue: 3,
  wed: 4,
  thu: 5,
  fri: 6,
  sat: 7,
};

/**
 * Parse a "HH:MM" time string into { hour, minute }.
 */
function parseTime(time: string): { hour: number; minute: number } {
  const [h, m] = time.split(':').map(Number);
  return { hour: h ?? 0, minute: m ?? 0 };
}

/**
 * Schedule all notifications for an alarm.
 * Returns an array of notification IDs (one per repeat day, or one for one-time).
 */
export async function scheduleAlarm(alarm: Alarm): Promise<string[]> {
  const { hour, minute } = parseTime(alarm.time);
  const ids: string[] = [];

  if (alarm.repeatDays.length === 0) {
    // One-time alarm: find next occurrence of this time
    const trigger = new Date();
    trigger.setHours(hour, minute, 0, 0);
    if (trigger <= new Date()) {
      trigger.setDate(trigger.getDate() + 1);
    }

    try {
      const id = await ExpoNotifications.scheduleNotificationAsync({
        content: {
          title: alarm.title,
          body: 'Alarm',
          sound: true,
          data: { alarmId: alarm.id, type: 'alarm' },
        },
        trigger: {
          date: trigger,
          channelId: 'alarms',
        },
      });
      ids.push(id);
    } catch (err) {
      console.warn('[Alarms] Failed to schedule one-time alarm:', err);
    }
  } else {
    // Repeating alarm: one weekly notification per selected day
    for (const day of alarm.repeatDays) {
      try {
        const id = await ExpoNotifications.scheduleNotificationAsync({
          content: {
            title: alarm.title,
            body: 'Alarm',
            sound: true,
            data: { alarmId: alarm.id, type: 'alarm', day },
          },
          trigger: {
            weekday: DAY_TO_WEEKDAY[day],
            hour,
            minute,
            repeats: true,
            channelId: 'alarms',
          },
        });
        ids.push(id);
      } catch (err) {
        console.warn(`[Alarms] Failed to schedule alarm for day ${day}:`, err);
      }
    }
  }

  return ids;
}

/**
 * Cancel all notifications for an alarm by notification IDs.
 */
export async function cancelAlarm(notificationIds: string[]): Promise<void> {
  for (const id of notificationIds) {
    try {
      await ExpoNotifications.cancelScheduledNotificationAsync(id);
    } catch (err) {
      console.warn(`[Alarms] Failed to cancel notification ${id}:`, err);
    }
  }
}
