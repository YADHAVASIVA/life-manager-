/**
 * Daily Score Store — manages daily personal scores
 */

import { create } from 'zustand';
import { DailyScore, SCORE_THRESHOLDS } from '@/models/DailyScore';
import { storageGet, storageSet, STORAGE_KEYS } from '@/services/storage';
import { format } from 'date-fns';

function generateScoreMessage(score: number): string {
  if (score >= SCORE_THRESHOLDS.excellent) return 'Excellent day! Keep it up 🔥';
  if (score >= SCORE_THRESHOLDS.good) return 'Good day overall 👍';
  if (score >= SCORE_THRESHOLDS.fair) return 'Decent progress. Push a bit more tomorrow.';
  return 'Every day is a fresh start. Tomorrow is yours.';
}

interface DailyScoreState {
  scores: DailyScore[];
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  upsertScore: (score: Omit<DailyScore, 'message'>) => Promise<void>;
  getTodayScore: () => DailyScore | undefined;
  getScoreForDate: (date: string) => DailyScore | undefined;
  getWeekScores: () => DailyScore[];
}

export const useDailyScoreStore = create<DailyScoreState>((set, get) => ({
  scores: [],
  isHydrated: false,

  hydrate: async () => {
    const scores = await storageGet<DailyScore[]>(STORAGE_KEYS.DAILY_SCORES);
    set({ scores: scores ?? [], isHydrated: true });
  },

  upsertScore: async (scoreData) => {
    const message = generateScoreMessage(scoreData.overallScore);
    const score: DailyScore = { ...scoreData, message };
    const existing = get().scores.findIndex((s) => s.date === score.date);
    const scores =
      existing >= 0
        ? get().scores.map((s) => (s.date === score.date ? score : s))
        : [...get().scores, score];
    // Keep only last 90 days
    const trimmed = scores.slice(-90);
    set({ scores: trimmed });
    await storageSet(STORAGE_KEYS.DAILY_SCORES, trimmed);
  },

  getTodayScore: () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return get().scores.find((s) => s.date === today);
  },

  getScoreForDate: (date) => get().scores.find((s) => s.date === date),

  getWeekScores: () => {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - 6);
    const startStr = format(weekStart, 'yyyy-MM-dd');
    return get().scores.filter((s) => s.date >= startStr);
  },
}));
