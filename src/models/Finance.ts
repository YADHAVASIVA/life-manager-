/**
 * Finance — Expense, budget, and monthly summary models
 * (Extended from foundation to support full budget category architecture)
 */

export type ExpenseCategory =
  | 'rent'
  | 'gym'
  | 'gym_food'
  | 'food'
  | 'travel'
  | 'college'
  | 'shopping'
  | 'entertainment'
  | 'health'
  | 'bills'
  | 'sip'
  | 'savings'
  | 'subscriptions'
  | 'miscellaneous'
  | 'other';

export interface Expense {
  id: string;
  /** Amount in ₹ */
  amountINR: number;
  category: ExpenseCategory;
  /** ISO date: "2024-01-15" */
  date: string;
  /** ISO 8601 timestamp */
  timestamp: string;
  note?: string;
  /** Whether this is a recurring/fixed expense */
  isRecurring: boolean;
  /** Bank account used — if paid by bank */
  bankAccountId?: string;
  /** Credit card used — if paid by card */
  creditCardId?: string;
}

export interface BudgetCategory {
  id: string;
  name: string;
  category: ExpenseCategory;
  /** Planned monthly amount in ₹ */
  plannedINR: number;
  /** Actual spent this month in ₹ — computed */
  spentINR?: number;
  color?: string;
  icon?: string;
  /** Whether this is a fixed cost or variable */
  isFixed: boolean;
}

export interface Budget {
  /** Monthly income in ₹ */
  monthlyIncomeINR: number;
  /** Rent in ₹ */
  rentINR: number;
  /** Monthly gym fee in ₹ */
  gymINR: number;
  /** Gym food / supplements budget in ₹ */
  gymFoodINR: number;
  /** Monthly SIP amount in ₹ */
  sipINR: number;
  /** Monthly miscellaneous budget in ₹ */
  miscellaneousINR: number;
  dailySpendingLimitINR?: number;
  /** Whether privacy mode is enabled (hide amounts) */
  privacyModeEnabled: boolean;
}

/** Computed: total planned fixed expenses */
export function computeTotalPlanned(budget: Budget): number {
  return (
    budget.rentINR +
    budget.gymINR +
    budget.gymFoodINR +
    budget.sipINR +
    budget.miscellaneousINR
  );
}

export interface SIPRecord {
  id: string;
  /** ISO date invested */
  date: string;
  /** Amount in ₹ */
  amountINR: number;
  fundName?: string;
  note?: string;
}

/** Monthly finance summary (computed) */
export interface MonthlyFinanceSummary {
  /** "2024-01" */
  month: string;
  totalIncomeINR: number;
  totalExpensesINR: number;
  totalSavedINR: number;
  totalSIPINR: number;
  budgetAdherencePercent: number;
  expensesByCategory: Partial<Record<ExpenseCategory, number>>;
  /** Insight messages from actual data */
  insights: string[];
}

/** Weekly finance summary */
export interface WeeklyFinanceSummary {
  /** ISO start of week */
  weekStart: string;
  totalSpentINR: number;
  avgDailySpentINR: number;
  highestCategory: ExpenseCategory | null;
  lowestCategory: ExpenseCategory | null;
  sipStatus: 'completed' | 'pending' | 'missed';
  creditUtilizationPercent: number;
  budgetAdherencePercent: number;
  comparedToPreviousWeekPercent: number | null;
}
