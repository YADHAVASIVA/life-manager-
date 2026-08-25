/**
 * Navigation Type Declarations
 * Typed param lists for all navigators and screens.
 */

import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

// ─── Bottom Tab Navigator ───────────────────────────────────────────────────

export type BottomTabParamList = {
  Home: undefined;
  Tasks: undefined;
  Nutrition: undefined;
  Progress: undefined;
  Profile: undefined;
};

// ─── Root Stack Navigator ───────────────────────────────────────────────────

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  Main: NavigatorScreenParams<BottomTabParamList>;
  Reminders: undefined;
  Water: undefined;
  Weight: undefined;
  Workout: undefined;
  Finance: undefined;
  Calendar: undefined;
  // Future modal screens will be added here:
  // AddTask: { date?: string };
  // AddExpense: undefined;
  // WorkoutSession: { workoutId: string };
};

// ─── Screen Props Helpers ───────────────────────────────────────────────────

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type BottomTabScreenProps_<T extends keyof BottomTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<BottomTabParamList, T>,
    RootStackScreenProps<keyof RootStackParamList>
  >;

// ─── Global augmentation for useNavigation() ───────────────────────────────

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
