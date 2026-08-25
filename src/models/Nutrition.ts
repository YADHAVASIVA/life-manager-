export interface Food {
  id: string;
  name: string;
  servingSize: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  notes?: string;
}

export interface MealPlan {
  id: string;
  name: string;
  time: string; // e.g. "06:45 AM"
  enabled: boolean;
  foods: Food[]; 
}

export interface NutritionEntry {
  id: string;
  foodId?: string;
  foodName: string;
  mealId: string;
  quantity: number; // multiplier
  servingSize: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  timestamp: string; // ISO
  date: string; // "YYYY-MM-DD"
  notes?: string;
}

export interface DailyMealCompletion {
  date: string; // "YYYY-MM-DD"
  mealId: string;
  completedAt: string; // ISO
}

export interface NutritionSettings {
  targetCalories?: number;
  targetProtein?: number;
}
