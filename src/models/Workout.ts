export type DayOfWeek = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';

export interface WorkoutSet {
  id: string;
  setNumber: number;
  weightKg?: number;
  reps?: number;
  rpe?: number;
  completed: boolean;
  timestamp?: string;
}

export interface WorkoutExercise {
  id: string;
  name: string;
  targetMuscle?: string;
  sets: WorkoutSet[];
  targetSets: number;
  targetReps: string; // e.g., "8-10"
  restSeconds: number;
  isSkipped?: boolean;
}

export interface WorkoutPlanDay {
  day: DayOfWeek;
  name: string;
  isActive: boolean; // Is it a rest day or workout day?
  exercises: WorkoutExercise[];
}

export interface WorkoutSession {
  id: string;
  name: string;
  date: string; // "YYYY-MM-DD"
  startedAt: string; // ISO
  completedAt?: string; // ISO
  durationSeconds: number;
  exercises: WorkoutExercise[];
  volumeKg: number;
  status: 'active' | 'completed' | 'incomplete';
  notes?: string;
}

export interface ExerciseLibraryItem {
  id: string;
  name: string;
  muscle: string;
}
