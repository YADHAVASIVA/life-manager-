import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeScreen } from '@/components/layout/SafeScreen';
import { AppCard } from '@/components/common/AppCard';
import { Colors, Spacing, TextStyles, Radius } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { 
  useTaskStore, useWaterStore, useWorkoutStore, useNutritionStore, 
  useFinanceStore, useWeightStore, useRoutineStore, useStreakStore, 
  useCreditCardStore, useBankStore 
} from '@/store';
import { TimePeriod, calculateLifeScore, periodToDays } from '@/utils/progressAnalytics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ProgressBar } from '@/components/common/ProgressBar';

const PERIODS: TimePeriod[] = ['7D', '30D', '3M', '6M', '1Y'];

export function ProgressScreen() {
  const [period, setPeriod] = useState<TimePeriod>('7D');
  const [privacyMode, setPrivacyMode] = useState(false);

  const { tasks } = useTaskStore();
  const { logs: waterLogs, todayTargetML } = useWaterStore();
  const { history: workouts } = useWorkoutStore();
  const { completions: meals, mealPlans } = useNutritionStore();
  const { budget, expenses } = useFinanceStore();
  const { logs: weightLogs } = useWeightStore();
  const { blocks: routineBlocks } = useRoutineStore();
  const { streaks } = useStreakStore();
  const { card } = useCreditCardStore();
  const { accounts } = useBankStore();

  const periodDays = periodToDays(period);
  const cutoffDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000).toISOString();

  // Scope data to period
  const scopedTasks = useMemo(() => tasks.filter(t => (t.createdAt || '') >= cutoffDate), [tasks, cutoffDate]);
  const scopedWater = useMemo(() => waterLogs.filter(w => (w.timestamp || '') >= cutoffDate), [waterLogs, cutoffDate]);
  const scopedWorkouts = useMemo(() => workouts.filter(w => (w.startedAt || '') >= cutoffDate), [workouts, cutoffDate]);
  const scopedMeals = useMemo(() => meals.filter(m => (m.date || '') >= cutoffDate.split('T')[0]), [meals, cutoffDate]);
  const scopedExpenses = useMemo(() => expenses.filter(e => (e.timestamp || '') >= cutoffDate), [expenses, cutoffDate]);
  const scopedWeight = useMemo(() => weightLogs.filter(w => (w.timestamp || '') >= cutoffDate), [weightLogs, cutoffDate]);

  const scoreData = useMemo(() => {
    return calculateLifeScore({
      tasks: scopedTasks,
      waterLogs: scopedWater,
      waterTargetML: todayTargetML,
      workouts: scopedWorkouts,
      meals: scopedMeals,
      mealTarget: mealPlans.filter(m => m.enabled).length,
      expenses: scopedExpenses,
      budget,
      routineBlocks,
      weightLogs: scopedWeight
    }, periodDays);
  }, [scopedTasks, scopedWater, todayTargetML, scopedWorkouts, scopedMeals, mealPlans, scopedExpenses, budget, routineBlocks, scopedWeight, periodDays]);

  const renderPrivacy = (val: string | number) => privacyMode ? '••••••' : val.toLocaleString();
  
  const currentWeight = weightLogs.length > 0 ? [...weightLogs].sort((a,b) => (b.timestamp || '').localeCompare(a.timestamp || ''))[0].weightKg : 46;
  const weightProgress = Math.min(1, Math.max(0, (currentWeight - 46) / (65 - 46)));

  const fixedAllocated = budget.rentINR + budget.gymINR + budget.gymFoodINR + budget.sipINR;
  const monthRemaining = budget.monthlyIncomeINR - fixedAllocated; 
  const budgetConflict = ((budget.dailySpendingLimitINR || 500) * 30) > monthRemaining;

  return (
    <SafeScreen style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>PROGRESS</Text>
          <Text style={styles.headerSubtitle}>See how far you've come.</Text>
        </View>
        <TouchableOpacity onPress={() => setPrivacyMode(!privacyMode)}>
          <MaterialCommunityIcons name={privacyMode ? 'eye-off' : 'eye'} size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <View style={styles.periodRow}>
        {PERIODS.map(p => (
          <TouchableOpacity key={p} onPress={() => setPeriod(p)} style={[styles.periodBtn, period === p && styles.periodBtnActive]}>
            <Text style={[styles.periodText, period === p && styles.periodTextActive]}>{p}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* HERO SCORE */}
        <Animated.View entering={FadeInDown.delay(50)} style={styles.section}>
          <AppCard style={styles.heroCard}>
            {scoreData.isBuilding ? (
              <View style={{ alignItems: 'center' }}>
                <MaterialCommunityIcons name="clock-outline" size={48} color={Colors.textMuted} />
                <Text style={styles.buildingTitle}>BUILDING YOUR SCORE</Text>
                <Text style={styles.buildingSub}>Complete more activities to generate your Life Score.</Text>
              </View>
            ) : (
              <View style={{ alignItems: 'center' }}>
                <Text style={styles.scoreLabel}>LIFE SCORE</Text>
                <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                  <Text style={styles.scoreBig}>{scoreData.total}</Text>
                  <Text style={styles.scoreSub}> / 100</Text>
                </View>
                <Text style={styles.scoreDesc}>Your consistency over {periodDays} days</Text>
              </View>
            )}
          </AppCard>
        </Animated.View>

        {/* DOMAIN BREAKDOWN */}
        {!scoreData.isBuilding && (
          <Animated.View entering={FadeInDown.delay(100)} style={styles.section}>
            <Text style={styles.sectionTitle}>HOW YOUR SCORE IS CALCULATED</Text>
            <AppCard style={{ padding: Spacing.md }}>
              <View style={styles.breakdownRow}><Text style={styles.bLabel}>Tasks</Text><Text style={styles.bVal}>{scoreData.breakdown.tasks.score} / {scoreData.breakdown.tasks.max}</Text></View>
              <View style={styles.breakdownRow}><Text style={styles.bLabel}>Hydration</Text><Text style={styles.bVal}>{scoreData.breakdown.water.score} / {scoreData.breakdown.water.max}</Text></View>
              <View style={styles.breakdownRow}><Text style={styles.bLabel}>Workout</Text><Text style={styles.bVal}>{scoreData.breakdown.workout.score} / {scoreData.breakdown.workout.max}</Text></View>
              <View style={styles.breakdownRow}><Text style={styles.bLabel}>Nutrition</Text><Text style={styles.bVal}>{scoreData.breakdown.nutrition.score} / {scoreData.breakdown.nutrition.max}</Text></View>
              <View style={styles.breakdownRow}><Text style={styles.bLabel}>Weight</Text><Text style={styles.bVal}>{scoreData.breakdown.weight.score} / {scoreData.breakdown.weight.max}</Text></View>
              <View style={styles.breakdownRow}><Text style={styles.bLabel}>Finance</Text><Text style={styles.bVal}>{scoreData.breakdown.finance.score} / {scoreData.breakdown.finance.max}</Text></View>
            </AppCard>
          </Animated.View>
        )}

        {/* CONSISTENCY STREAKS */}
        <Animated.View entering={FadeInDown.delay(150)} style={styles.section}>
          <Text style={styles.sectionTitle}>CONSISTENCY</Text>
          <View style={styles.gridRow}>
            {streaks.map(s => (
              <AppCard key={s.id} style={[styles.streakCard]}>
                <MaterialCommunityIcons name="fire" size={20} color={s.currentStreak > 0 ? Colors.warning : Colors.textMuted} />
                <Text style={styles.streakVal}>{s.currentStreak} days</Text>
                <Text style={styles.streakLabel}>{s.domain}</Text>
              </AppCard>
            ))}
          </View>
        </Animated.View>

        {/* WEIGHT PROGRESS */}
        <Animated.View entering={FadeInDown.delay(200)} style={styles.section}>
          <Text style={styles.sectionTitle}>WEIGHT JOURNEY</Text>
          <AppCard style={{ padding: Spacing.lg }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm }}>
              <Text style={styles.bLabel}>Starting: 46 kg</Text>
              <Text style={styles.bLabel}>Target: 65-70 kg</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <Text style={styles.bVal}>Current</Text>
              <Text style={[styles.scoreBig, { fontSize: 24 }]}>{renderPrivacy(currentWeight)} <Text style={styles.scoreSub}>kg</Text></Text>
            </View>
            <ProgressBar progress={weightProgress} color={Colors.primary} style={{ marginTop: Spacing.md }} />
            <Text style={[styles.bLabel, { marginTop: Spacing.sm, textAlign: 'center' }]}>Next Milestone: {Math.ceil(currentWeight/5)*5} kg</Text>
          </AppCard>
        </Animated.View>

        {/* FINANCE OVERVIEW */}
        <Animated.View entering={FadeInDown.delay(250)} style={styles.section}>
          <Text style={styles.sectionTitle}>MONEY</Text>
          <AppCard style={{ padding: Spacing.lg }}>
            {budgetConflict && (
              <View style={styles.warningBox}>
                <MaterialCommunityIcons name="alert" size={16} color="#F59E0B" />
                <Text style={styles.warningText}>
                  BUDGET ALERT: Your ₹{budget.dailySpendingLimitINR}/day spending preference exceeds the remaining monthly budget (₹{monthRemaining}).
                </Text>
              </View>
            )}
            <View style={styles.breakdownRow}>
              <Text style={styles.bLabel}>Monthly Income</Text>
              <Text style={styles.bVal}>₹{renderPrivacy(budget.monthlyIncomeINR)}</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.bLabel}>Credit Limit</Text>
              <Text style={styles.bVal}>₹{renderPrivacy(card?.limitINR || 1800)}</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.bLabel}>Personal CC Ceiling</Text>
              <Text style={styles.bVal}>₹{renderPrivacy(Math.round((card?.limitINR || 1800) * 0.3))}</Text>
            </View>
            <ProgressBar progress={(card?.usedINR || 0) / Math.round((card?.limitINR || 1800) * 0.3)} color={Colors.primary} style={{ marginTop: Spacing.md }} />
          </AppCard>
        </Animated.View>

        {/* INSIGHTS */}
        <Animated.View entering={FadeInDown.delay(300)} style={[styles.section, { paddingBottom: Spacing.xl }]}>
          <Text style={styles.sectionTitle}>SMART NEXT ACTION</Text>
          <AppCard style={{ padding: Spacing.lg, backgroundColor: Colors.surfaceHighlight }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.md }}>
              <MaterialCommunityIcons name="lightning-bolt" size={24} color={Colors.primary} />
              <View style={{ flex: 1 }}>
                {todayTargetML - waterLogs.filter(w => (w.timestamp || '').startsWith(cutoffDate.split('T')[0])).reduce((a, b) => a + b.amountML, 0) > 0 ? (
                  <>
                    <Text style={styles.bVal}>Drink Water</Text>
                    <Text style={styles.bLabel}>You haven't hit your hydration goal yet today.</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.bVal}>Keep Building Data</Text>
                    <Text style={styles.bLabel}>Log your meals today to maintain your consistency.</Text>
                  </>
                )}
              </View>
            </View>
          </AppCard>
        </Animated.View>
        
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg, paddingBottom: Spacing.md },
  headerTitle: { ...TextStyles.h1, color: Colors.textPrimary },
  headerSubtitle: { ...TextStyles.bodySmall, color: Colors.textSecondary, marginTop: 4 },
  periodRow: { flexDirection: 'row', paddingHorizontal: Spacing.lg, marginBottom: Spacing.md, gap: Spacing.sm },
  periodBtn: { flex: 1, paddingVertical: Spacing.sm, alignItems: 'center', borderRadius: Radius.sm, backgroundColor: Colors.surface },
  periodBtnActive: { backgroundColor: Colors.primary },
  periodText: { ...TextStyles.label, color: Colors.textSecondary },
  periodTextActive: { color: Colors.background },
  scrollContent: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxl },
  section: { marginTop: Spacing.xl },
  sectionTitle: { ...TextStyles.overline, color: Colors.textMuted, marginBottom: Spacing.sm, letterSpacing: 1.5, marginLeft: Spacing.sm },
  heroCard: { padding: Spacing.xl, alignItems: 'center', justifyContent: 'center' },
  scoreLabel: { ...TextStyles.overline, color: Colors.primary, letterSpacing: 2 },
  scoreBig: { fontSize: 64, fontWeight: 'bold', color: Colors.textPrimary, includeFontPadding: false },
  scoreSub: { ...TextStyles.h3, color: Colors.textMuted },
  scoreDesc: { ...TextStyles.caption, color: Colors.textSecondary, marginTop: Spacing.sm },
  buildingTitle: { ...TextStyles.h3, color: Colors.textPrimary, marginTop: Spacing.md },
  buildingSub: { ...TextStyles.caption, color: Colors.textSecondary, textAlign: 'center', marginTop: 4 },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border },
  bLabel: { ...TextStyles.body, color: Colors.textSecondary },
  bVal: { ...TextStyles.label, color: Colors.textPrimary },
  gridRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  streakCard: { flex: 1, minWidth: '30%', padding: Spacing.md, alignItems: 'center', gap: 4 },
  streakVal: { ...TextStyles.label, color: Colors.textPrimary },
  streakLabel: { ...TextStyles.tiny, color: Colors.textMuted, textTransform: 'uppercase' },
  warningBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: Spacing.sm, borderRadius: Radius.sm, marginBottom: Spacing.md, gap: Spacing.sm },
  warningText: { ...TextStyles.tiny, color: '#F59E0B', flex: 1 },
});
