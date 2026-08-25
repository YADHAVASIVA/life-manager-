/**
 * Weight — Weight tracking models
 */
export interface WeightLog {
  id: string;
  /** Weight in kg */
  weightKg: number;
  /** ISO date: "2024-01-15" */
  date: string;
  /** ISO 8601 timestamp */
  timestamp: string;
  /** Optional note e.g., "after gym", "morning" */
  note?: string;
  /** BMI calculated at time of log */
  bmi?: number;
}
