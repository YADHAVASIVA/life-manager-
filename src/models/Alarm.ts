/**
 * Alarm — Scheduled alarm model
 */
export type RepeatDay = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export interface Alarm {
  id: string;
  title: string;
  /** 24h format: "06:30" */
  time: string;
  /** Days to repeat, empty = one-time */
  repeatDays: RepeatDay[];
  enabled: boolean;
  /** Sound identifier / file name */
  sound: string;
  vibration: boolean;
  /** Snooze duration in minutes */
  snoozeDuration: number;
  /** Notification ID for cancelling */
  notificationId?: string;
  createdAt: string;
  updatedAt: string;
}
