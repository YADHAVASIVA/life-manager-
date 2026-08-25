/**
 * BankAccount — Three-bank architecture model
 *
 * SECURITY: Never store PINs, passwords, OTPs, or CVVs.
 * This is a personal tracking tool, not a banking app.
 */

export type BankName = 'union_bank' | 'sbi' | 'kotak' | 'other';

export type AccountPurpose = 'sip_investment' | 'daily_use' | 'savings' | 'other';

export type AccountType = 'savings' | 'current' | 'salary';

export interface BankAccount {
  id: string;
  bankName: BankName;
  /** Human-readable display name */
  nickname: string;
  /** e.g., "SBI", "Union Bank" */
  displayBankName: string;
  accountType: AccountType;
  purpose: AccountPurpose;
  /** Last 4 digits only — for display/identification */
  last4Digits?: string;
  /** Current tracked balance in ₹ */
  balanceINR: number;
  /** Account-level color accent */
  color: string;
  /** MaterialCommunityIcons icon name */
  icon: string;
  /** Whether this is the primary daily-use account */
  isPrimary: boolean;
  /** Whether account is active */
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BankTransaction {
  id: string;
  bankAccountId: string;
  /** Amount in ₹ — always positive */
  amountINR: number;
  type: 'credit' | 'debit';
  category: BankTransactionCategory;
  description: string;
  note?: string;
  /** ISO date: "2024-01-15" */
  date: string;
  /** ISO 8601 timestamp */
  timestamp: string;
  /** Balance after this transaction */
  balanceAfterINR?: number;
  /** Reference number or UPI ID (non-sensitive) */
  referenceId?: string;
}

export type BankTransactionCategory =
  | 'food'
  | 'travel'
  | 'college'
  | 'gym'
  | 'gym_food'
  | 'shopping'
  | 'entertainment'
  | 'health'
  | 'bills'
  | 'rent'
  | 'sip'
  | 'transfer'
  | 'salary'
  | 'savings'
  | 'other';
