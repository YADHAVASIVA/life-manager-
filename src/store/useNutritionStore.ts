import { create } from 'zustand';
import { Food, MealPlan, NutritionEntry, DailyMealCompletion, NutritionSettings } from '@/models/Nutrition';
import { storageGet, storageSet, STORAGE_KEYS } from '@/services/storage';
import { format } from 'date-fns';

function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substring(2, 9);
}

const DEFAULT_FOODS: Food[] = [
  { id: 'f1', name: 'Rice', servingSize: '1 bowl (150g)', calories: 200, protein: 4, carbs: 45, fat: 0.5 },
  { id: 'f2', name: 'Oats', servingSize: '1 cup (40g)', calories: 150, protein: 5, carbs: 27, fat: 3 },
  { id: 'f3', name: 'Banana', servingSize: '1 medium', calories: 105, protein: 1, carbs: 27, fat: 0.3 },
  { id: 'f4', name: 'Milk', servingSize: '1 glass (250ml)', calories: 150, protein: 8, carbs: 12, fat: 8 },
  { id: 'f5', name: 'Eggs', servingSize: '2 large', calories: 140, protein: 12, carbs: 1, fat: 10 },
  { id: 'f6', name: 'Chicken', servingSize: '100g breast', calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  { id: 'f7', name: 'Whey Protein', servingSize: '1 scoop (30g)', calories: 120, protein: 24, carbs: 3, fat: 1.5 },
  { id: 'f8', name: 'Peanut Butter', servingSize: '1 tbsp (15g)', calories: 95, protein: 3.5, carbs: 3, fat: 8 },
];

const DEFAULT_MEAL_PLANS: MealPlan[] = [
  { id: 'mp1', name: 'Breakfast', time: '06:45 AM', enabled: true, foods: [] },
  { id: 'mp2', name: 'Snack', time: '10:30 AM', enabled: true, foods: [] },
  { id: 'mp3', name: 'Lunch', time: '01:30 PM', enabled: true, foods: [] },
  { id: 'mp4', name: 'Pre-Gym Food', time: '04:30 PM', enabled: true, foods: [] },
  { id: 'mp5', name: 'Post-Gym Food', time: '07:30 PM', enabled: true, foods: [] },
  { id: 'mp6', name: 'Dinner', time: '09:00 PM', enabled: true, foods: [] },
];

interface NutritionState {
  foods: Food[];
  mealPlans: MealPlan[];
  entries: NutritionEntry[];
  completions: DailyMealCompletion[];
  settings: NutritionSettings;
  isHydrated: boolean;
  
  hydrate: () => Promise<void>;
  
  addFood: (food: Omit<Food, 'id'>) => Promise<void>;
  updateFood: (id: string, updates: Partial<Food>) => Promise<void>;
  
  updateMealPlan: (id: string, updates: Partial<MealPlan>) => Promise<void>;
  
  logEntry: (entry: Omit<NutritionEntry, 'id' | 'timestamp' | 'date'>) => Promise<void>;
  removeEntry: (id: string) => Promise<void>;
  
  markMealCompleted: (mealId: string, date: string) => Promise<void>;
  unmarkMealCompleted: (mealId: string, date: string) => Promise<void>;
  
  updateSettings: (settings: Partial<NutritionSettings>) => Promise<void>;
  _persist: () => Promise<void>;
}

export const useNutritionStore = create<NutritionState>((set, get) => ({
  foods: [],
  mealPlans: [],
  entries: [],
  completions: [],
  settings: {},
  isHydrated: false,

  hydrate: async () => {
    // Note: Re-using MEALS storage key for backward compatibility or simple namespace
    const data = await storageGet<any>(STORAGE_KEYS.MEALS);
    if (data) {
      set({
        foods: data.foods?.length ? data.foods : DEFAULT_FOODS,
        mealPlans: data.mealPlans?.length ? data.mealPlans : DEFAULT_MEAL_PLANS,
        entries: data.entries || [],
        completions: data.completions || [],
        settings: data.settings || {},
        isHydrated: true,
      });
    } else {
      set({
        foods: DEFAULT_FOODS,
        mealPlans: DEFAULT_MEAL_PLANS,
        entries: [],
        completions: [],
        settings: {},
        isHydrated: true,
      });
      await get()._persist();
    }
  },

  _persist: async () => {
    const { foods, mealPlans, entries, completions, settings } = get();
    await storageSet(STORAGE_KEYS.MEALS, { foods, mealPlans, entries, completions, settings });
  },

  addFood: async (food) => {
    set(s => ({ foods: [...s.foods, { ...food, id: generateId() }] }));
    await get()._persist();
  },

  updateFood: async (id, updates) => {
    set(s => ({ foods: s.foods.map(f => f.id === id ? { ...f, ...updates } : f) }));
    await get()._persist();
  },

  updateMealPlan: async (id, updates) => {
    set(s => ({ mealPlans: s.mealPlans.map(m => m.id === id ? { ...m, ...updates } : m) }));
    await get()._persist();
  },

  logEntry: async (entryData) => {
    const now = new Date();
    const entry: NutritionEntry = {
      ...entryData,
      id: generateId(),
      timestamp: now.toISOString(),
      date: format(now, 'yyyy-MM-dd'),
    };
    set(s => ({ entries: [...s.entries, entry] }));
    await get()._persist();
  },

  removeEntry: async (id) => {
    set(s => ({ entries: s.entries.filter(e => e.id !== id) }));
    await get()._persist();
  },

  markMealCompleted: async (mealId, date) => {
    const comp: DailyMealCompletion = { mealId, date, completedAt: new Date().toISOString() };
    set(s => ({ completions: [...s.completions.filter(c => !(c.mealId === mealId && c.date === date)), comp] }));
    await get()._persist();
  },

  unmarkMealCompleted: async (mealId, date) => {
    set(s => ({ completions: s.completions.filter(c => !(c.mealId === mealId && c.date === date)) }));
    await get()._persist();
  },

  updateSettings: async (settingsUpdate) => {
    set(s => ({ settings: { ...s.settings, ...settingsUpdate } }));
    await get()._persist();
  }
}));
