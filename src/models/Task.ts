/**
 * Task — Todo / task management model
 */
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export type TaskCategory =
  | 'personal'
  | 'college'
  | 'work'
  | 'fitness'
  | 'finance'
  | 'health'
  | 'other';

export type RepeatFrequency =
  | 'none'
  | 'daily'
  | 'weekdays'
  | 'weekends'
  | 'weekly'
  | 'monthly';

export interface Task {
  id: string;
  title: string;
  notes?: string;
  /** ISO date string: "2024-01-15" */
  date: string;
  /** 24h format: "09:30" */
  time?: string;
  category: TaskCategory;
  priority: TaskPriority;
  completed: boolean;
  completedAt?: string;
  repeat: RepeatFrequency;
  /** Whether to send a reminder notification */
  reminder: boolean;
  /** Minutes before task time */
  reminderMinutesBefore?: number;
  /** Icon name from MaterialCommunityIcons */
  icon?: string;
  /** Notification ID to cancel/update scheduled notification */
  notificationId?: string;
  createdAt: string;
  updatedAt: string;
}
