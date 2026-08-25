/**
 * Reminder — Centralized reminder system model
 * (More detailed than RoutineBlock — handles all app reminder types)
 */

export type ReminderType =
  | 'wake_up'
  | 'hydrate'
  | 'breakfast'
  | 'college'
  | 'lunch'
  | 'water'
  | 'coding'
  | 'gym_pre'
  | 'gym'
  | 'gym_post'
  | 'study'
  | 'wind_down'
  | 'sleep'
  | 'sip'
  | 'budget_review'
  | 'weekly_review'
  | 'monthly_review'
  | 'statement_save'
  | 'custom';

export type ReminderFrequency =
  | 'daily'
  | 'weekdays'
  | 'weekends'
  | 'weekly'
  | 'monthly'
  | 'once'
  | 'custom_days';

export type ReminderDay = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export type ReminderCategory = 
  | 'routine' | 'water' | 'gym' | 'nutrition' | 'study' 
  | 'college' | 'finance' | 'sip' | 'savings' | 'tasks' 
  | 'sleep' | 'personal' | 'other';

export interface Reminder {
  id: string;
  type: ReminderType;
  category: ReminderCategory;
  title: string;
  subtitle?: string;
  notes?: string;
  
  /** 24h format: "06:30" */
  time: string;
  /** ISO date string: "2024-01-15" (optional for recurring) */
  date?: string;
  
  frequency: ReminderFrequency;
  /** Used when frequency = 'custom_days' */
  customDays?: ReminderDay[];
  
  enabled: boolean;
  
  sound?: 'default' | 'silent';
  vibration?: boolean;
  
  /** MaterialCommunityIcons icon name */
  icon: string;
  color: string;
  /** Sort order */
  order: number;
  /** Expo notification ID (if scheduled) */
  notificationId?: string;
  createdAt: string;
  updatedAt: string;
}
