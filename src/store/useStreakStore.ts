/**
 * Streak Store — manages all domain streaks
 */

import { create } from 'zustand';
import { Streak, StreakDomain } from '@/models/Streak';
import { storageGet, storageSet, STORAGE_KEYS } from '@/services/storage';
import { INITIAL_STREAKS } from '@/constants/initialData';
import { format, differenceInCalendarDays } from 'date-fns';

interface StreakState {
  streaks: Streak[];
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  /**
   * Call when a domain is completed for today.
   * Extends streak if last completed was yesterday, resets if missed.
   */
  markCompleted: (domain: StreakDomain) => Promise<void>;
  removeTodayCompletion: (domain: StreakDomain) => Promise<void>;
  getStreak: (domain: StreakDomain) => Streak | undefined;
  updateWeeklyConsistency: (domain: StreakDomain, daysThisWeek: number) => Promise<void>;
}

export const useStreakStore = create<StreakState>((set, get) => ({
  streaks: INITIAL_STREAKS,
  isHydrated: false,

  hydrate: async () => {
    const stored = await storageGet<Streak[]>(STORAGE_KEYS.STREAKS);
    if (stored && stored.length > 0) {
      set({ streaks: stored, isHydrated: true });
    } else {
      await storageSet(STORAGE_KEYS.STREAKS, INITIAL_STREAKS);
      set({ streaks: INITIAL_STREAKS, isHydrated: true });
    }
  },

  markCompleted: async (domain) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const streaks = get().streaks.map((s) => {
      if (s.domain !== domain) return s;

      // Already marked today
      if (s.lastCompletedDate === today) return s;

      let newStreak = 1;
      let startDate = today;

      if (s.lastCompletedDate) {
        const daysDiff = differenceInCalendarDays(
          new Date(today),
          new Date(s.lastCompletedDate)
        );
        if (daysDiff === 1) {
          // Consecutive day — extend streak
          newStreak = s.currentStreak + 1;
          startDate = s.streakStartDate ?? today;
        }
        // If daysDiff > 1, streak resets to 1
      }

      return {
        ...s,
        currentStreak: newStreak,
        bestStreak: Math.max(s.bestStreak, newStreak),
        lastCompletedDate: today,
        streakStartDate: startDate,
        totalDaysCompleted: s.totalDaysCompleted + 1,
        updatedAt: new Date().toISOString(),
      };
    });
    set({ streaks });
    await storageSet(STORAGE_KEYS.STREAKS, streaks);
  },

  removeTodayCompletion: async (domain) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const streaks = get().streaks.map((s) => {
      if (s.domain !== domain) return s;
      if (s.lastCompletedDate !== today) return s;

      // We need to un-mark today.
      // Easiest approximation: decrement streak, total days, set lastCompletedDate to yesterday
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = format(yesterday, 'yyyy-MM-dd');
      
      return {
        ...s,
        currentStreak: Math.max(0, s.currentStreak - 1),
        lastCompletedDate: yesterdayStr, // Best guess to keep streak alive if they re-complete
        totalDaysCompleted: Math.max(0, s.totalDaysCompleted - 1),
        updatedAt: new Date().toISOString(),
      };
    });
    set({ streaks });
    await storageSet(STORAGE_KEYS.STREAKS, streaks);
  },

  getStreak: (domain) => get().streaks.find((s) => s.domain === domain),

  updateWeeklyConsistency: async (domain, daysThisWeek) => {
    const streaks = get().streaks.map((s) =>
      s.domain === domain
        ? { ...s, weeklyConsistency: daysThisWeek, updatedAt: new Date().toISOString() }
        : s
    );
    set({ streaks });
    await storageSet(STORAGE_KEYS.STREAKS, streaks);
  },
}));
