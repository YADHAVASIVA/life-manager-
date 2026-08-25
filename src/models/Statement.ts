/**
 * Statement — Bank/credit card statement vault model
 *
 * SECURITY: Statement documents are sensitive personal data.
 * Store only metadata here; file references point to local device storage.
 * Never request or store: passwords, PINs, CVV, OTP.
 */

export type StatementInstitution = 'union_bank' | 'sbi' | 'kotak' | 'credit_card' | 'other';

export type StatementType = 'bank' | 'credit_card';

export interface StatementRecord {
  id: string;
  institution: StatementInstitution;
  institutionDisplayName: string;
  statementType: StatementType;
  /** e.g., "2024-01" */
  statementPeriod: string;
  /** ISO date statement was generated */
  statementDate: string;
  /** Opening balance in ₹ */
  openingBalanceINR?: number;
  /** Closing balance in ₹ */
  closingBalanceINR?: number;
  /** Total credits in ₹ */
  totalCreditsINR?: number;
  /** Total debits in ₹ */
  totalDebitsINR?: number;
  /** Reference to a local file URI (optional) */
  fileUri?: string;
  /** Whether a file has been attached */
  hasFile: boolean;
  notes?: string;
  /** ISO timestamp when record was created */
  createdAt: string;
  updatedAt: string;
}
