/**
 * Streak — Multi-domain streak tracking model
 */

export type StreakDomain =
  | 'gym'
  | 'water'
  | 'tasks'
  | 'study'
  | 'budget'
  | 'nutrition'
  | 'weight'
  | 'overall';

export interface Streak {
  id: string;
  domain: StreakDomain;
  /** Display label */
  label: string;
  /** Current consecutive days */
  currentStreak: number;
  /** All-time best streak */
  bestStreak: number;
  /** ISO date of last successful completion */
  lastCompletedDate: string | null;
  /** ISO date streak was started */
  streakStartDate: string | null;
  /** Total days completed (all time) */
  totalDaysCompleted: number;
  /** Weekly consistency (0–7 days this week) */
  weeklyConsistency: number;
  color?: string;
  icon?: string;
  updatedAt: string;
}
