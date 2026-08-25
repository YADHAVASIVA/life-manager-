/**
 * LifeOS — App Entry Point
 *
 * Responsibilities:
 *  1. Hydrate all Zustand stores from persistence
 *  2. Request notification permissions
 *  3. Seed first-launch data if needed
 *  4. Render navigation
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppNavigator } from '@/navigation/AppNavigator';
import { LoadingState } from '@/components/common/LoadingState';
import { Colors } from '@/constants/theme';
import {
  useUserStore,
  useGoalStore,
  useTaskStore,
  useAlarmStore,
  useWaterStore,
  useWeightStore,
  useWorkoutStore,
  useNutritionStore,
  useFinanceStore,
  useNotificationStore,
  useRoutineStore,
  useBankStore,
  useCreditCardStore,
  useSavingsStore,
  useSIPStore,
  useStatementStore,
  useFinanceAlertStore,
  useStreakStore,
  useDailyScoreStore,
  useReminderStore,
} from '@/store';
import { isAppInitialized } from '@/services/storage';
import { requestNotificationPermissions } from '@/services/notifications';

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [hasOnboarded, setHasOnboarded] = useState(false);

  // Store hydration actions
  const hydrateUser = useUserStore((s) => s.hydrate);
  const hydrateGoals = useGoalStore((s) => s.hydrate);
  const hydrateTasks = useTaskStore((s) => s.hydrate);
  const hydrateAlarms = useAlarmStore((s) => s.hydrate);
  const hydrateWater = useWaterStore((s) => s.hydrate);
  const hydrateWeight = useWeightStore((s) => s.hydrate);
  const hydrateWorkout = useWorkoutStore((s) => s.hydrate);
  const hydrateNutrition = useNutritionStore((s) => s.hydrate);
  const hydrateFinance = useFinanceStore((s) => s.hydrate);
  const hydrateNotifications = useNotificationStore((s) => s.hydrate);
  const hydrateRoutine = useRoutineStore((s) => s.hydrate);
  const hydrateBanks = useBankStore((s) => s.hydrate);
  const hydrateCreditCard = useCreditCardStore((s) => s.hydrate);
  const hydrateSavings = useSavingsStore((s) => s.hydrate);
  const hydrateSIP = useSIPStore((s) => s.hydrate);
  const hydrateStatements = useStatementStore((s) => s.hydrate);
  const hydrateFinanceAlerts = useFinanceAlertStore((s) => s.hydrate);
  const hydrateStreaks = useStreakStore((s) => s.hydrate);
  const hydrateDailyScores = useDailyScoreStore((s) => s.hydrate);
  const hydrateReminders = useReminderStore((s) => s.hydrate);

  useEffect(() => {
    async function bootstrap() {
      try {
        // Hydrate all 20 stores in parallel
        await Promise.all([
          hydrateUser(),
          hydrateGoals(),
          hydrateTasks(),
          hydrateAlarms(),
          hydrateWater(),
          hydrateWeight(),
          hydrateWorkout(),
          hydrateNutrition(),
          hydrateFinance(),
          hydrateNotifications(),
          hydrateRoutine(),
          hydrateBanks(),
          hydrateCreditCard(),
          hydrateSavings(),
          hydrateSIP(),
          hydrateStatements(),
          hydrateFinanceAlerts(),
          hydrateStreaks(),
          hydrateDailyScores(),
          hydrateReminders(),
        ]);

        const initialized = await isAppInitialized();
        setHasOnboarded(initialized);

        // Request notification permissions (non-blocking)
        requestNotificationPermissions().catch(() => {
          // Silently fail — user can grant later in Settings
        });
      } catch (error) {
        console.error('[App] Bootstrap error:', error);
      } finally {
        setIsReady(true);
      }
    }

    bootstrap();
  }, [
    hydrateUser,
    hydrateGoals,
    hydrateTasks,
    hydrateAlarms,
    hydrateWater,
    hydrateWeight,
    hydrateWorkout,
    hydrateNutrition,
    hydrateFinance,
    hydrateNotifications,
    hydrateRoutine,
    hydrateBanks,
    hydrateCreditCard,
    hydrateSavings,
    hydrateSIP,
    hydrateStatements,
    hydrateFinanceAlerts,
    hydrateStreaks,
    hydrateDailyScores,
    hydrateReminders,
  ]);

  if (!isReady) {
    return (
      <View style={styles.loading}>
        <LoadingState fullScreen message="Loading LifeOS..." color={Colors.primary} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <AppNavigator hasOnboarded={hasOnboarded} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loading: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
