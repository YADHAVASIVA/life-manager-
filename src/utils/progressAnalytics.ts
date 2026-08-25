/**
 * Progress Analytics — pure utility functions
 * Calculates insights and scores from domain stores.
 */

import { Task } from '@/models/Task';
import { WaterLog } from '@/models/Water';
import { WorkoutSession } from '@/models/Workout';
import { NutritionEntry, DailyMealCompletion } from '@/models/Nutrition';
import { Expense, Budget } from '@/models/Finance';
import { RoutineBlock } from '@/models/Routine';
import { WeightLog } from '@/models/Weight';

// Type alias to handle date grouping
export type TimePeriod = '7D' | '30D' | '3M' | '6M' | '1Y';

export interface ScoreData {
  tasks: Task[];
  waterLogs: WaterLog[];
  waterTargetML: number;
  workouts: WorkoutSession[];
  meals: DailyMealCompletion[];
  mealTarget: number;
  expenses: Expense[];
  budget: Budget;
  routineBlocks: RoutineBlock[];
  weightLogs: WeightLog[];
}

export interface DomainScore {
  score: number;
  max: number;
  hasData: boolean;
}

export function calculateTaskScore(tasks: Task[], periodDays: number): DomainScore {
  if (!tasks.length) return { score: 0, max: 15, hasData: false };
  const completed = tasks.filter((t) => t.completed).length;
  const rate = tasks.length > 0 ? completed / tasks.length : 0;
  return { score: Math.round(rate * 15), max: 15, hasData: true };
}

export function calculateWaterScore(logs: WaterLog[], target: number, periodDays: number): DomainScore {
  if (!logs.length) return { score: 0, max: 15, hasData: false };
  
  // Group by day
  const dailyTotals: Record<string, number> = {};
  logs.forEach(l => {
    const d = (l.timestamp || '').split('T')[0];
    dailyTotals[d] = (dailyTotals[d] || 0) + l.amountML;
  });

  const daysWithData = Object.keys(dailyTotals).length;
  const goalDays = Object.values(dailyTotals).filter(v => v >= target).length;
  const rate = daysWithData > 0 ? goalDays / daysWithData : 0;
  return { score: Math.round(rate * 15), max: 15, hasData: true };
}

export function calculateWorkoutScore(workouts: WorkoutSession[], periodDays: number): DomainScore {
  if (!workouts.length) return { score: 0, max: 15, hasData: false };
  // Expected roughly 3-5 workouts a week. Let's say target is 3.
  const targetWorkouts = Math.max(1, Math.round((periodDays / 7) * 3));
  const completed = workouts.filter(w => w.completedAt).length;
  const rate = Math.min(1, completed / targetWorkouts);
  return { score: Math.round(rate * 15), max: 15, hasData: true };
}

export function calculateNutritionScore(completions: DailyMealCompletion[], targetMeals: number, periodDays: number): DomainScore {
  if (!completions.length || targetMeals === 0) return { score: 0, max: 15, hasData: false };
  const expectedMeals = periodDays * targetMeals;
  const rate = Math.min(1, completions.length / expectedMeals);
  return { score: Math.round(rate * 15), max: 15, hasData: true };
}

export function calculateWeightScore(logs: WeightLog[]): DomainScore {
  if (!logs.length) return { score: 0, max: 10, hasData: false };
  // Just tracking consistency (if they have >= 1 log in period)
  return { score: 10, max: 10, hasData: true };
}

export function calculateFinanceScore(expenses: Expense[], budget: Budget): DomainScore {
  if (!expenses.length) return { score: 0, max: 20, hasData: false };
  
  const totalSpent = expenses.filter(e => ['expense', 'rent', 'sip'].includes(e.category)).reduce((sum, e) => sum + e.amountINR, 0);
  const totalAllocated = budget.rentINR + budget.gymINR + budget.gymFoodINR + budget.sipINR;
  const remaining = budget.monthlyIncomeINR - totalAllocated;
  
  // Very simplistic: just check if they are under their available limits
  const rate = totalSpent <= budget.monthlyIncomeINR ? 1 : 0.5;
  return { score: Math.round(rate * 20), max: 20, hasData: true };
}

export function calculateRoutineScore(blocks: RoutineBlock[]): DomainScore {
  if (!blocks.length) return { score: 0, max: 10, hasData: false };
  return { score: 8, max: 10, hasData: true }; // Simplified for now since routine store is mostly config
}

export function calculateLifeScore(data: ScoreData, periodDays: number) {
  const tScore = calculateTaskScore(data.tasks, periodDays);
  const wScore = calculateWaterScore(data.waterLogs, data.waterTargetML, periodDays);
  const woScore = calculateWorkoutScore(data.workouts, periodDays);
  const nScore = calculateNutritionScore(data.meals, data.mealTarget, periodDays);
  const wtScore = calculateWeightScore(data.weightLogs);
  const fScore = calculateFinanceScore(data.expenses, data.budget);
  const rScore = calculateRoutineScore(data.routineBlocks);

  const scores = [tScore, wScore, woScore, nScore, wtScore, fScore, rScore];
  
  const activeDomains = scores.filter(s => s.hasData);
  const breakdown = {
    tasks: tScore,
    water: wScore,
    workout: woScore,
    nutrition: nScore,
    weight: wtScore,
    finance: fScore,
    routine: rScore
  };

  if (activeDomains.length === 0) return { total: 0, max: 100, isBuilding: true, breakdown };

  const earned = activeDomains.reduce((sum, s) => sum + s.score, 0);
  const maxPossible = activeDomains.reduce((sum, s) => sum + s.max, 0);

  // Normalize to 100
  const total = Math.round((earned / maxPossible) * 100);

  return {
    total,
    max: 100,
    isBuilding: activeDomains.length < 3, // require at least 3 domains for a 'fair' score
    breakdown: {
      tasks: tScore,
      water: wScore,
      workout: woScore,
      nutrition: nScore,
      weight: wtScore,
      finance: fScore,
      routine: rScore
    }
  };
}

export function periodToDays(p: TimePeriod): number {
  switch(p) {
    case '7D': return 7;
    case '30D': return 30;
    case '3M': return 90;
    case '6M': return 180;
    case '1Y': return 365;
    default: return 7;
  }
}
