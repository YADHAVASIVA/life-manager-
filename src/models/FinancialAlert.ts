/**
 * FinancialAlert — Smart financial alert model
 */

export type FinancialAlertType =
  | 'daily_spending'
  | 'monthly_budget'
  | 'credit_approaching_ceiling'
  | 'credit_ceiling_reached'
  | 'credit_limit_exceeded'
  | 'sip_reminder'
  | 'sip_check'
  | 'savings_goal_reached'
  | 'statement_reminder'
  | 'weekly_review'
  | 'monthly_review'
  | 'custom';

export type FinancialAlertSeverity = 'info' | 'warning' | 'danger' | 'success';

export interface FinancialAlert {
  id: string;
  type: FinancialAlertType;
  severity: FinancialAlertSeverity;
  title: string;
  message: string;
  /** ISO timestamp */
  timestamp: string;
  read: boolean;
  /** Whether this alert has been dismissed permanently */
  dismissed: boolean;
  /** Context data (e.g., amount spent, threshold) */
  metadata?: Record<string, unknown>;
}

export interface FinancialAlertThreshold {
  /** When daily spending exceeds this amount, trigger alert */
  dailySpendingLimitINR: number;
  /** When monthly spending reaches this % of budget, trigger alert */
  monthlyBudgetWarningPercent: number;
  /** Credit amount at which to first warn (₹400 default) */
  creditWarningINR: number;
  /** Credit ceiling (₹540 = 30% of ₹1800) */
  creditCeilingINR: number;
  /** Days before SIP date to send reminder */
  sipReminderDaysBefore: number;
  /** Days before statement date to send reminder */
  statementReminderDaysBefore: number;
}
