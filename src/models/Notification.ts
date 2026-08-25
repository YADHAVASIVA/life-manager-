/**
 * Notification — In-app notification model
 */
export type NotificationCategory =
  | 'water'
  | 'alarm'
  | 'task'
  | 'workout'
  | 'finance'
  | 'weight'
  | 'goal'
  | 'system';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  category: NotificationCategory;
  /** ISO 8601 timestamp */
  timestamp: string;
  read: boolean;
  /** Screen/tab to navigate to when tapped */
  destination?: string;
  /** Optional extra data payload */
  data?: Record<string, unknown>;
}
