/**
 * Goal — Personal goal tracking model
 */
export type GoalCategory =
  | 'fitness'
  | 'nutrition'
  | 'finance'
  | 'study'
  | 'habit'
  | 'health'
  | 'custom';

export type GoalStatus = 'active' | 'completed' | 'paused' | 'abandoned';

export interface Goal {
  id: string;
  title: string;
  description?: string;
  category: GoalCategory;
  /** Numeric target value */
  target: number;
  /** Current progress value */
  current: number;
  /** Unit label: "kg", "L", "₹", "%" */
  unit: string;
  /** 0–100 computed or manual */
  progress: number;
  /** ISO date string */
  deadline?: string;
  status: GoalStatus;
  /** Icon name from MaterialCommunityIcons */
  icon?: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
}
