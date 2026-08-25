import { create } from 'zustand';
import { WorkoutSession, WorkoutPlanDay, WorkoutExercise, WorkoutSet, DayOfWeek, ExerciseLibraryItem } from '@/models/Workout';
import { storageGet, storageSet, STORAGE_KEYS } from '@/services/storage';
import { format, differenceInSeconds } from 'date-fns';

function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substring(2, 9);
}

export const EXERCISE_LIBRARY: ExerciseLibraryItem[] = [
  { id: 'ex_bp', name: 'Bench Press', muscle: 'Chest' },
  { id: 'ex_idp', name: 'Incline Dumbbell Press', muscle: 'Chest' },
  { id: 'ex_cf', name: 'Chest Fly', muscle: 'Chest' },
  { id: 'ex_pu', name: 'Push Ups', muscle: 'Chest' },
  { id: 'ex_lp', name: 'Lat Pulldown', muscle: 'Back' },
  { id: 'ex_scr', name: 'Seated Cable Row', muscle: 'Back' },
  { id: 'ex_br', name: 'Barbell Row', muscle: 'Back' },
  { id: 'ex_pu2', name: 'Pull Ups', muscle: 'Back' },
  { id: 'ex_dc', name: 'Dumbbell Curl', muscle: 'Biceps' },
  { id: 'ex_hc', name: 'Hammer Curl', muscle: 'Biceps' },
  { id: 'ex_bc', name: 'Barbell Curl', muscle: 'Biceps' },
  { id: 'ex_tp', name: 'Tricep Pushdown', muscle: 'Triceps' },
  { id: 'ex_oe', name: 'Overhead Extension', muscle: 'Triceps' },
  { id: 'ex_cgp', name: 'Close Grip Press', muscle: 'Triceps' },
  { id: 'ex_sp', name: 'Shoulder Press', muscle: 'Shoulders' },
  { id: 'ex_lr', name: 'Lateral Raise', muscle: 'Shoulders' },
  { id: 'ex_rdf', name: 'Rear Delt Fly', muscle: 'Shoulders' },
  { id: 'ex_sq', name: 'Squat', muscle: 'Legs' },
  { id: 'ex_lep', name: 'Leg Press', muscle: 'Legs' },
  { id: 'ex_lc', name: 'Leg Curl', muscle: 'Legs' },
  { id: 'ex_le', name: 'Leg Extension', muscle: 'Legs' },
  { id: 'ex_cr', name: 'Calf Raise', muscle: 'Legs' },
];

function generateInitialPlan(): WorkoutPlanDay[] {
  const createEx = (name: string, muscle: string, targetSets: number, targetReps: string): WorkoutExercise => ({
    id: generateId(),
    name,
    targetMuscle: muscle,
    targetSets,
    targetReps,
    restSeconds: 90,
    sets: []
  });

  return [
    { day: 'MON', name: 'Chest + Triceps', isActive: true, exercises: [
      createEx('Bench Press', 'Chest', 4, '8-10'),
      createEx('Incline Dumbbell Press', 'Chest', 3, '10-12'),
      createEx('Chest Fly', 'Chest', 3, '12-15'),
      createEx('Tricep Pushdown', 'Triceps', 4, '10-12'),
      createEx('Overhead Extension', 'Triceps', 3, '12-15'),
    ]},
    { day: 'TUE', name: 'Back + Biceps', isActive: true, exercises: [
      createEx('Lat Pulldown', 'Back', 4, '8-10'),
      createEx('Barbell Row', 'Back', 3, '8-10'),
      createEx('Seated Cable Row', 'Back', 3, '10-12'),
      createEx('Barbell Curl', 'Biceps', 4, '10-12'),
      createEx('Hammer Curl', 'Biceps', 3, '10-12'),
    ]},
    { day: 'WED', name: 'Recovery / Rest', isActive: false, exercises: [] },
    { day: 'THU', name: 'Shoulders', isActive: true, exercises: [
      createEx('Shoulder Press', 'Shoulders', 4, '8-10'),
      createEx('Lateral Raise', 'Shoulders', 4, '12-15'),
      createEx('Rear Delt Fly', 'Shoulders', 3, '12-15'),
    ]},
    { day: 'FRI', name: 'Legs', isActive: true, exercises: [
      createEx('Squat', 'Legs', 4, '6-8'),
      createEx('Leg Press', 'Legs', 3, '10-12'),
      createEx('Leg Extension', 'Legs', 3, '12-15'),
      createEx('Leg Curl', 'Legs', 3, '12-15'),
      createEx('Calf Raise', 'Legs', 4, '15-20'),
    ]},
    { day: 'SAT', name: 'Optional Full Body / Weak Point', isActive: false, exercises: [] },
    { day: 'SUN', name: 'Rest', isActive: false, exercises: [] },
  ];
}

interface WorkoutState {
  plan: WorkoutPlanDay[];
  activeSession: WorkoutSession | null;
  history: WorkoutSession[];
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  
  // Plan Mgmt
  updatePlanDay: (day: DayOfWeek, updates: Partial<WorkoutPlanDay>) => Promise<void>;

  // Session Mgmt
  startWorkout: (dayPlan: WorkoutPlanDay) => Promise<void>;
  logSet: (exerciseId: string, setNumber: number, weightKg: number, reps: number, rpe?: number) => Promise<void>;
  skipExercise: (exerciseId: string) => Promise<void>;
  updateActiveSessionDuration: (seconds: number) => void; // Non-persisted interval update
  endWorkout: (status: 'completed' | 'incomplete') => Promise<void>;
  
  // History Mgmt
  removeHistory: (sessionId: string) => Promise<void>;
  
  // Helpers
  getPreviousExerciseStats: (exerciseName: string) => { weightKg: number, reps: number } | null;
}

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  plan: [],
  activeSession: null,
  history: [],
  isHydrated: false,

  hydrate: async () => {
    const plan = await storageGet<WorkoutPlanDay[]>(STORAGE_KEYS.WORKOUT_TEMPLATES);
    const active = await storageGet<WorkoutSession>(STORAGE_KEYS.WORKOUT_ACTIVE_SESSION);
    const history = await storageGet<WorkoutSession[]>(STORAGE_KEYS.WORKOUTS);

    set({
      plan: plan && plan.length > 0 ? plan : generateInitialPlan(),
      activeSession: active ?? null,
      history: history ?? [],
      isHydrated: true,
    });
  },

  updatePlanDay: async (day, updates) => {
    const plan = get().plan.map(p => p.day === day ? { ...p, ...updates } : p);
    set({ plan });
    await storageSet(STORAGE_KEYS.WORKOUT_TEMPLATES, plan);
  },

  startWorkout: async (dayPlan) => {
    const session: WorkoutSession = {
      id: generateId(),
      name: dayPlan.name,
      date: format(new Date(), 'yyyy-MM-dd'),
      startedAt: new Date().toISOString(),
      durationSeconds: 0,
      exercises: JSON.parse(JSON.stringify(dayPlan.exercises)), // deep clone
      volumeKg: 0,
      status: 'active'
    };
    set({ activeSession: session });
    await storageSet(STORAGE_KEYS.WORKOUT_ACTIVE_SESSION, session);
  },

  logSet: async (exerciseId, setNumber, weightKg, reps, rpe) => {
    const { activeSession } = get();
    if (!activeSession) return;

    const exercises = activeSession.exercises.map(ex => {
      if (ex.id !== exerciseId) return ex;
      
      const newSets = [...ex.sets];
      const existingIdx = newSets.findIndex(s => s.setNumber === setNumber);
      
      const setObj: WorkoutSet = {
        id: generateId(),
        setNumber,
        weightKg,
        reps,
        rpe,
        completed: true,
        timestamp: new Date().toISOString()
      };

      if (existingIdx >= 0) newSets[existingIdx] = setObj;
      else newSets.push(setObj);

      return { ...ex, sets: newSets };
    });

    const session = { ...activeSession, exercises };
    set({ activeSession: session });
    await storageSet(STORAGE_KEYS.WORKOUT_ACTIVE_SESSION, session);
  },

  skipExercise: async (exerciseId) => {
    const { activeSession } = get();
    if (!activeSession) return;

    const exercises = activeSession.exercises.map(ex => {
      if (ex.id !== exerciseId) return ex;
      return { ...ex, isSkipped: true };
    });

    const session = { ...activeSession, exercises };
    set({ activeSession: session });
    await storageSet(STORAGE_KEYS.WORKOUT_ACTIVE_SESSION, session);
  },

  updateActiveSessionDuration: (seconds) => {
    const { activeSession } = get();
    if (!activeSession) return;
    set({ activeSession: { ...activeSession, durationSeconds: seconds } });
  },

  endWorkout: async (status) => {
    const { activeSession, history } = get();
    if (!activeSession) return;

    // Calculate total volume
    let totalVol = 0;
    activeSession.exercises.forEach(ex => {
      if (!ex.isSkipped) {
        ex.sets.forEach(s => {
          if (s.completed && s.weightKg && s.reps) {
            totalVol += s.weightKg * s.reps;
          }
        });
      }
    });

    const finalSession: WorkoutSession = {
      ...activeSession,
      status,
      completedAt: new Date().toISOString(),
      volumeKg: totalVol,
    };

    const newHistory = [...history, finalSession];
    set({ activeSession: null, history: newHistory });
    
    await storageSet(STORAGE_KEYS.WORKOUTS, newHistory);
    await storageSet(STORAGE_KEYS.WORKOUT_ACTIVE_SESSION, null);
  },

  removeHistory: async (sessionId) => {
    const history = get().history.filter(h => h.id !== sessionId);
    set({ history });
    await storageSet(STORAGE_KEYS.WORKOUTS, history);
  },

  getPreviousExerciseStats: (exerciseName) => {
    const { history } = get();
    // Search backwards for the most recent completed sets of this exercise
    for (let i = history.length - 1; i >= 0; i--) {
      const session = history[i];
      if (session.status !== 'completed') continue;
      
      const ex = session.exercises.find(e => e.name === exerciseName && !e.isSkipped && e.sets.length > 0);
      if (ex) {
        // Return the best set or last set from that session
        const bestSet = ex.sets.reduce((prev, current) => {
          return (current.weightKg! > prev.weightKg!) ? current : prev;
        });
        return { weightKg: bestSet.weightKg || 0, reps: bestSet.reps || 0 };
      }
    }
    return null;
  }
}));
