/**
 * Savings — Savings goal and vault tracking model
 */

export type SavingsGoalStatus = 'active' | 'completed' | 'paused';

export interface SavingsGoal {
  id: string;
  name: string;
  description?: string;
  /** Target amount in ₹ */
  targetINR: number;
  /** Current saved amount in ₹ */
  currentINR: number;
  /** Progress 0–100 */
  progressPercent: number;
  /** Linked bank account ID (Kotak) */
  bankAccountId?: string;
  status: SavingsGoalStatus;
  /** ISO target date */
  targetDate?: string;
  color?: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SavingsContribution {
  id: string;
  savingsGoalId: string;
  /** Amount in ₹ */
  amountINR: number;
  /** ISO date */
  date: string;
  timestamp: string;
  note?: string;
}

export interface EmergencyFund {
  /** Target months of expenses to cover */
  targetMonths: number;
  /** Monthly expense estimate in ₹ */
  monthlyExpenseINR: number;
  /** Current emergency fund balance in ₹ */
  currentINR: number;
}
