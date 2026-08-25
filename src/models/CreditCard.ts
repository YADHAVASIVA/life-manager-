/**
 * CreditCard — Credit card tracking model
 *
 * SECURITY: Never store CVV, PIN, or card number.
 * Only track spending, utilization, and payment metadata.
 */

export type CreditUtilizationStatus = 'safe' | 'caution' | 'high' | 'very_high';

export interface CreditCard {
  id: string;
  /** e.g., "HDFC", "SBI", "Kotak" */
  issuer: string;
  /** User-defined nickname */
  nickname: string;
  /** Last 4 digits only — never full number */
  last4Digits?: string;
  /** Total credit limit in ₹ */
  limitINR: number;
  /** Personal utilization safety ceiling in ₹ (default 30% of limit) */
  personalCeilingINR: number;
  /** Personal ceiling as % (default 30) */
  personalCeilingPercent: number;
  /** Currently used amount in ₹ */
  usedINR: number;
  /** Available credit in ₹ (computed: limit - used) */
  availableINR: number;
  /** Utilization % (computed: used / limit * 100) */
  utilizationPercent: number;
  /** Current utilization status */
  utilizationStatus: CreditUtilizationStatus;
  /** Day of month payment is due */
  paymentDueDay: number;
  /** Day of month statement generates */
  statementDay: number;
  /** Outstanding amount to be paid */
  outstandingINR: number;
  /** Whether card is active */
  isActive: boolean;
  color: string;
  icon: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreditCardTransaction {
  id: string;
  creditCardId: string;
  /** Amount in ₹ — always positive */
  amountINR: number;
  type: 'purchase' | 'payment' | 'refund' | 'fee';
  category: CreditCardCategory;
  description: string;
  note?: string;
  /** ISO date */
  date: string;
  /** ISO 8601 timestamp */
  timestamp: string;
  /** Statement cycle this belongs to */
  statementMonth?: string;
}

export type CreditCardCategory =
  | 'food'
  | 'travel'
  | 'shopping'
  | 'entertainment'
  | 'health'
  | 'bills'
  | 'gym'
  | 'gym_food'
  | 'college'
  | 'other';

/**
 * Compute utilization status from percentage
 */
export function getCreditUtilizationStatus(percent: number): CreditUtilizationStatus {
  if (percent <= 30) return 'safe';
  if (percent <= 50) return 'caution';
  if (percent <= 75) return 'high';
  return 'very_high';
}

/**
 * Compute credit card derived fields
 */
export function computeCreditCardFields(
  card: Pick<CreditCard, 'limitINR' | 'usedINR' | 'personalCeilingPercent'>
): Pick<CreditCard, 'personalCeilingINR' | 'availableINR' | 'utilizationPercent' | 'utilizationStatus'> {
  const personalCeilingINR = Math.round(card.limitINR * (card.personalCeilingPercent / 100));
  const availableINR = card.limitINR - card.usedINR;
  const utilizationPercent = Math.round((card.usedINR / card.limitINR) * 100);
  const utilizationStatus = getCreditUtilizationStatus(utilizationPercent);
  return { personalCeilingINR, availableINR, utilizationPercent, utilizationStatus };
}
