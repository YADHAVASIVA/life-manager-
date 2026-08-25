/**
 * Water — Hydration tracking models
 */
export interface WaterLog {
  id: string;
  /** Amount in mL */
  amountML: number;
  /** ISO 8601 timestamp */
  timestamp: string;
  /** e.g., "glass", "bottle", "custom" */
  source?: string;
}

/** Aggregated daily water summary */
export interface WaterDay {
  /** ISO date: "2024-01-15" */
  date: string;
  /** Total consumed in mL */
  totalML: number;
  /** Target for that day in mL */
  targetML: number;
  logs: WaterLog[];
}

/** Quick-add preset amounts */
export interface WaterPreset {
  id: string;
  label: string;
  amountML: number;
  icon: string;
}
