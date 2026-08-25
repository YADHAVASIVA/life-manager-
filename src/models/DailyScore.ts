/**
 * DailyScore — Daily personal score model
 */

export interface DailyScoreCategory {
  name: 'health' | 'productivity' | 'fitness' | 'nutrition' | 'finance' | 'consistency';
  label: string;
  /** 0–100 */
  score: number;
  /** Max possible points for this category */
  maxPoints: number;
  /** What contributed to this score */
  breakdown: string[];
}

export interface DailyScore {
  id: string;
  /** ISO date: "2024-01-15" */
  date: string;
  /** Overall score 0–100 */
  overallScore: number;
  categories: DailyScoreCategory[];
  /** Encouraging message generated from score */
  message?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Score thresholds for messages
 */
export const SCORE_THRESHOLDS = {
  excellent: 85,
  good: 70,
  fair: 50,
  low: 0,
} as const;
