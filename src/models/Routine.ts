/**
 * Routine — Daily routine block model
 */
export type RoutineCategory =
  | 'health'
  | 'nutrition'
  | 'college'
  | 'work'
  | 'fitness'
  | 'study'
  | 'personal'
  | 'other';

export interface RoutineBlock {
  id: string;
  /** 24h format: "06:30" */
  time: string;
  title: string;
  subtitle?: string;
  /** MaterialCommunityIcons icon name */
  icon: string;
  color: string;
  category: RoutineCategory;
  enabled: boolean;
  /** Sort order */
  order: number;
  /** Whether to set a reminder notification */
  reminderEnabled?: boolean;
  /** Minutes before to remind */
  reminderMinutesBefore?: number;
}
