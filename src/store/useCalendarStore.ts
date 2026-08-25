import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CalendarState {
  // Keyed by local date string 'YYYY-MM-DD'
  dailyNotes: Record<string, string>;
  // Keyed by local date string 'YYYY-MM-DD', value is taskId
  topPriorities: Record<string, string>;
  
  setDailyNote: (dateStr: string, note: string) => void;
  setTopPriority: (dateStr: string, taskId: string | null) => void;
}

export const useCalendarStore = create<CalendarState>()(
  persist(
    (set) => ({
      dailyNotes: {},
      topPriorities: {},

      setDailyNote: (dateStr, note) =>
        set((state) => ({
          dailyNotes: { ...state.dailyNotes, [dateStr]: note },
        })),

      setTopPriority: (dateStr, taskId) =>
        set((state) => {
          const newPriorities = { ...state.topPriorities };
          if (taskId === null) {
            delete newPriorities[dateStr];
          } else {
            newPriorities[dateStr] = taskId;
          }
          return { topPriorities: newPriorities };
        }),
    }),
    {
      name: 'lifeos-calendar-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

