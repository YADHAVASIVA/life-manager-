/**
 * SIP — Systematic Investment Plan tracking model
 * (Replaces the minimal SIPRecord in Finance.ts with a full model)
 */

export type SIPStatus = 'active' | 'paused' | 'completed' | 'missed';

export interface SIPPlan {
  id: string;
  /** Fund/scheme name — user-defined */
  fundName: string;
  fundType?: string;
  /** Monthly investment amount in ₹ */
  monthlyAmountINR: number;
  /** Day of month to invest */
  sipDate: number;
  /** Linked bank account ID (Union Bank) */
  bankAccountId: string;
  status: SIPStatus;
  /** ISO start date */
  startDate: string;
  /** ISO end date if applicable */
  endDate?: string;
  /** Total invested so far in ₹ */
  totalInvestedINR: number;
  /** Total number of contributions made */
  totalContributions: number;
  color?: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SIPContribution {
  id: string;
  sipPlanId: string;
  /** Amount in ₹ */
  amountINR: number;
  /** ISO date of contribution */
  date: string;
  timestamp: string;
  status: 'completed' | 'missed' | 'pending';
  note?: string;
}
