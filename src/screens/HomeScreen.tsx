import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { RootStackParamList, BottomTabParamList } from '@/navigation/types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format, isToday, parse, isAfter, isBefore, addMinutes } from 'date-fns';
import Animated, { FadeInUp, Layout } from 'react-native-reanimated';

import { SafeScreen } from '@/components/layout/SafeScreen';
import {
  AppCard,
  ProgressRing,
  ProgressBar,
  PrivacyAmount,
} from '@/components';
import { Colors, Spacing, TextStyles, Radius } from '@/constants/theme';
import {
  useUserStore,
  useTaskStore,
  useWaterStore,
  useWorkoutStore, useNutritionStore,
  useFinanceStore,
  useBankStore,
  useCreditCardStore,
  useDailyScoreStore,
  useRoutineStore,
  useGoalStore,
  useReminderStore,
  useWeightStore,
} from '@/store';
import { differenceInSeconds } from 'date-fns';

type Props = CompositeScreenProps<
  BottomTabScreenProps<BottomTabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

export function HomeScreen({ navigation }: Props) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // ─── Store Subscriptions ──────────────────────────────────────────────────
  const user = useUserStore((s) => s.user);
  const tasks = useTaskStore((s) => s.tasks);
  const { logs: waterLogs, todayTargetML, logWater } = useWaterStore();
  const { budget, expenses, togglePrivacyMode } = useFinanceStore();
  const privacyModeEnabled = budget.privacyModeEnabled;
  const accounts = useBankStore((s) => s.accounts);
  const card = useCreditCardStore((s) => s.card);
  const getTodayScore = useDailyScoreStore((s) => s.getTodayScore);
  const latestScore = getTodayScore();
  const routineBlocks = useRoutineStore((s) => s.blocks);
  const goals = useGoalStore((s) => s.goals);

  // ─── Computations ─────────────────────────────────────────────────────────

  // Greeting
  const greeting = useMemo(() => {
    const hour = now.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    if (hour < 21) return 'Good Evening';
    return 'Good Night';
  }, [now]);

  // Tasks
  const todayTasks = useMemo(() => tasks.filter((t) => t.date === format(now, 'yyyy-MM-dd')), [tasks, now]);
  const completedTasks = todayTasks.filter((t) => t.completed);
  const taskProgress = todayTasks.length > 0 ? completedTasks.length / todayTasks.length : 0;

  // Water
  const todayWater = useMemo(() => 
    waterLogs.filter((l) => l.timestamp.startsWith(format(now, 'yyyy-MM-dd'))).reduce((sum, l) => sum + l.amountML, 0)
  , [waterLogs, now]);
  const waterProgress = todayTargetML > 0 ? Math.min(todayWater / todayTargetML, 1) : 0;

  // Money Today
  const todayExpenses = useMemo(() => 
    expenses.filter((e) => e.date === format(now, 'yyyy-MM-dd')).reduce((sum, e) => sum + e.amountINR, 0)
  , [expenses, now]);
  const totalSpentMonth = expenses.reduce((sum, e) => sum + e.amountINR, 0);
  const remainingBudget = Math.max(0, budget.monthlyIncomeINR - totalSpentMonth);

  // Daily Score
  const dailyScoreValue = latestScore?.overallScore ?? null;

  const reminders = useReminderStore((s) => s.reminders);

  const nextReminder = useMemo(() => {
    const activeReminders = reminders.filter(r => r.enabled);
    const todayStr = format(now, 'yyyy-MM-dd');
    
    // Sort all upcoming today
    const todayUpcoming = activeReminders.filter(r => {
      if (r.frequency === 'once' && r.date && r.date < todayStr) return false;
      const rTime = parse(r.time, 'HH:mm', now);
      return isAfter(rTime, now);
    }).sort((a, b) => a.time.localeCompare(b.time));

    return todayUpcoming[0] || null;
  }, [reminders, now]);

  const countdownStr = useMemo(() => {
    if (!nextReminder) return null;
    const rTime = parse(nextReminder.time, 'HH:mm', now);
    const diff = differenceInSeconds(rTime, now);
    if (diff <= 0) return 'Now';
    const h = Math.floor(diff / 3600);
    const m = Math.floor((diff % 3600) / 60);
    if (h > 0) return `in ${h}h ${m}m`;
    return `in ${m}m`;
  }, [nextReminder, now]);

  // Bank Roles
  const sipAccount = accounts.find((a) => a.bankName === 'union_bank');
  const dailyAccount = accounts.find((a) => a.bankName === 'sbi');
  const savingsAccount = accounts.find((a) => a.bankName === 'kotak');
  
  // Workout
  const workoutHistory = useWorkoutStore((s) => s.history);
  const workoutPlan = useWorkoutStore((s) => s.plan);
  
  const todayStr = format(now, 'yyyy-MM-dd');
  const isWorkoutCompleted = workoutHistory.some((h) => h.date === todayStr && h.status === 'completed');
  
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
  const weekStr = format(weekStart, 'yyyy-MM-dd');
  const workoutsThisWeek = workoutHistory.filter((h) => h.date >= weekStr && h.status === 'completed').length;
  const targetWorkoutsThisWeek = workoutPlan.filter((p) => p.isActive).length || 5;

  // Nutrition
  const { completions, mealPlans } = useNutritionStore();
  const mealsCompleted = completions.filter((c) => c.date === todayStr).length;
  const targetMeals = mealPlans.filter((m) => m.enabled).length;

  const cardUsed = card?.usedINR || 0;
  const cardCeiling = card?.personalCeilingINR || 540;
  const cardLimit = card?.limitINR || 1800;
  const cardUtilRatio = cardUsed / cardCeiling;

  // Weight
  const weightLogs = useWeightStore((s) => s.logs);
  const currentWeight = weightLogs.length > 0 ? weightLogs[weightLogs.length - 1].weightKg : (user?.weightKg || 46);
  const targetWeight = user?.targetWeightKg || 65;

  // ─── Render Helpers ───────────────────────────────────────────────────────

  const renderHeader = () => (
    <View style={styles.header}>
      <View>
        <Text style={styles.greeting}>{greeting}, {user?.name || 'User'} 👋</Text>
        <Text style={styles.dateText}>{format(now, 'EEEE, d MMMM')}</Text>
      </View>
      <View style={styles.headerRight}>
        <TouchableOpacity style={styles.iconButton} onPress={togglePrivacyMode}>
          <MaterialCommunityIcons name={privacyModeEnabled ? 'eye-off' : 'eye'} size={24} color={Colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Reminders' as never)}>
          <MaterialCommunityIcons name="bell-outline" size={24} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCommandCard = () => (
    <Animated.View entering={FadeInUp.delay(100)} style={styles.section}>
      <Text style={styles.sectionTitle}>TODAY'S PROGRESS</Text>
      <AppCard style={styles.commandCard}>
        <View style={styles.commandTop}>
          <View style={styles.commandProgress}>
            <ProgressRing progress={taskProgress} size={100} strokeWidth={8} color={Colors.primary} trackColor={Colors.surfaceHighlight} />
            <View style={styles.ringInner}>
              <Text style={styles.ringValue}>{completedTasks.length} / {todayTasks.length}</Text>
              <Text style={styles.ringLabel}>Tasks</Text>
            </View>
          </View>
          
          <View style={styles.commandMetrics}>
            <View style={styles.cmdMetricRow}>
              <MaterialCommunityIcons name="water" size={16} color={Colors.water} />
              <View style={styles.cmdMetricTextWrap}>
                <Text style={styles.cmdMetricLabel}>Water</Text>
                <Text style={styles.cmdMetricValue}>{(todayWater / 1000).toFixed(1)} / {(todayTargetML / 1000).toFixed(1)}L</Text>
              </View>
            </View>
            <View style={styles.cmdMetricRow}>
              <MaterialCommunityIcons name="dumbbell" size={16} color={Colors.workout} />
              <View style={styles.cmdMetricTextWrap}>
                <Text style={styles.cmdMetricLabel}>Gym</Text>
                <Text style={[styles.cmdMetricValue, { color: isWorkoutCompleted ? Colors.success : Colors.textPrimary }]}>
                  {isWorkoutCompleted ? 'Completed' : 'Pending'}
                </Text>
              </View>
            </View>
            <View style={styles.cmdMetricRow}>
              <MaterialCommunityIcons name="food-apple" size={16} color={Colors.nutrition} />
              <View style={styles.cmdMetricTextWrap}>
                <Text style={styles.cmdMetricLabel}>Meals</Text>
                <Text style={styles.cmdMetricValue}>{mealsCompleted} / {targetMeals}</Text>
              </View>
            </View>
            <View style={styles.cmdMetricRow}>
              <MaterialCommunityIcons name="cash" size={16} color={Colors.danger} />
              <View style={styles.cmdMetricTextWrap}>
                <Text style={styles.cmdMetricLabel}>Spent</Text>
                <PrivacyAmount amount={todayExpenses} hidden={privacyModeEnabled} style={styles.cmdMetricValue} />
              </View>
            </View>
          </View>
        </View>
      </AppCard>
    </Animated.View>
  );

  const renderDailyScore = () => (
    <Animated.View entering={FadeInUp.delay(200)} style={styles.scoreSection}>
      <AppCard style={styles.scoreCard}>
        <View style={styles.scoreLeft}>
          <Text style={styles.scoreValue}>{dailyScoreValue ?? '—'}</Text>
          <Text style={styles.scoreLabel}>TODAY'S SCORE</Text>
        </View>
        <View style={styles.scoreRight}>
          {dailyScoreValue === null ? (
            <Text style={styles.scoreMessage}>Start your day to build your score</Text>
          ) : (
            <Text style={styles.scoreMessage}>You're on track!</Text>
          )}
        </View>
      </AppCard>
    </Animated.View>
  );

  const renderNextReminder = () => {
    if (!nextReminder) return null;
    return (
      <Animated.View entering={FadeInUp.delay(300)} style={styles.section}>
        <Text style={styles.sectionTitle}>NEXT REMINDER</Text>
        <AppCard style={[styles.nextActionCard, { borderColor: nextReminder.color, borderWidth: 1 }]}>
          <View style={styles.nextActionHeader}>
            <Text style={styles.nextActionTime}>{format(parse(nextReminder.time, 'HH:mm', now), 'h:mm a')}</Text>
            <View style={[styles.badge, { backgroundColor: nextReminder.color + '20' }]}>
              <Text style={[styles.badgeText, { color: nextReminder.color }]}>{countdownStr}</Text>
            </View>
          </View>
          <View style={styles.nextActionBody}>
            <MaterialCommunityIcons name={nextReminder.icon as any} size={28} color={nextReminder.color} />
            <View style={{ marginLeft: Spacing.md }}>
              <Text style={styles.nextActionTitle}>{nextReminder.title}</Text>
              <Text style={styles.nextActionSubtitle}>{nextReminder.subtitle || nextReminder.category.toUpperCase()}</Text>
            </View>
          </View>
        </AppCard>
      </Animated.View>
    );
  };

  const renderRoutine = () => {
    // Construct a simple timeline for today's routine block
    const timeline = routineBlocks.map((e) => {
      const eTime = parse(e.time, 'HH:mm', now);
      const isPast = isBefore(eTime, now);
      const isActive = !isPast && isBefore(now, addMinutes(eTime, 90)); 
      return { ...e, parsedTime: eTime, isPast, isActive };
    }).sort((a, b) => a.time.localeCompare(b.time));

    return (
      <Animated.View entering={FadeInUp.delay(400)} style={styles.section}>
        <Text style={styles.sectionTitle}>TODAY'S ROUTINE</Text>
        <AppCard style={styles.routineCard}>
          {timeline.map((item, index) => {
            const isLast = index === timeline.length - 1;
            const statusColor = item.isPast ? Colors.success : item.isActive ? Colors.primary : Colors.textMuted;
            return (
              <View key={item.id} style={styles.routineRow}>
                <Text style={[styles.routineTime, { color: item.isActive ? Colors.textPrimary : Colors.textMuted }]}>
                  {format(item.parsedTime, 'HH:mm')}
                </Text>
                <View style={styles.routineTrack}>
                  <View style={[styles.routineDot, { backgroundColor: statusColor }]} />
                  {!isLast && <View style={[styles.routineLine, { backgroundColor: item.isPast ? Colors.success : Colors.border }]} />}
                </View>
                <View style={styles.routineContent}>
                  <MaterialCommunityIcons name={item.icon as any} size={20} color={statusColor} />
                  <Text style={[styles.routineTitle, { color: item.isActive ? Colors.primary : Colors.textPrimary }]}>
                    {item.title}
                  </Text>
                </View>
              </View>
            );
          })}
        </AppCard>
      </Animated.View>
    );
  };

  const renderHealth = () => (
    <Animated.View entering={FadeInUp.delay(500)} style={styles.section}>
      <Text style={styles.sectionTitle}>YOUR HEALTH</Text>
      
      <View style={styles.grid2}>
        {/* Weight */}
        <TouchableOpacity style={styles.gridCard} activeOpacity={0.8} onPress={() => navigation.navigate('Weight' as never)}>
          <AppCard style={{ padding: Spacing.md, height: '100%' }}>
            <Text style={styles.cardOverline}>WEIGHT</Text>
            {privacyModeEnabled ? (
              <Text style={styles.cardHero}>•• <Text style={styles.cardUnit}>kg</Text></Text>
            ) : (
              <Text style={styles.cardHero}>{currentWeight.toFixed(1)} <Text style={styles.cardUnit}>kg</Text></Text>
            )}
            <View style={styles.cardProgressWrap}>
              <ProgressBar progress={Math.min(currentWeight / targetWeight, 1)} color={Colors.primary} style={{ height: 4 }} />
              <Text style={styles.cardTargetText}>{currentWeight.toFixed(1)} / {targetWeight} kg</Text>
            </View>
          </AppCard>
        </TouchableOpacity>

        {/* Water */}
        <TouchableOpacity style={styles.gridCard} activeOpacity={0.8} onPress={() => navigation.navigate('Water' as never)}>
          <AppCard style={{ padding: Spacing.md, height: '100%' }}>
            <Text style={styles.cardOverline}>WATER</Text>
            <Text style={styles.cardHero}>{(todayWater / 1000).toFixed(1)} <Text style={styles.cardUnit}>L</Text></Text>
            <View style={styles.cardProgressWrap}>
              <ProgressBar progress={waterProgress} color={Colors.water} style={{ height: 4 }} />
              <Text style={styles.cardTargetText}>Target: {(todayTargetML / 1000).toFixed(1)} L</Text>
            </View>
            <TouchableOpacity 
              style={styles.quickAddBtn}
              onPress={() => logWater(250, 'custom')}
            >
              <Text style={styles.quickAddText}>+250 ml</Text>
            </TouchableOpacity>
          </AppCard>
        </TouchableOpacity>
      </View>

      {/* Workout Summary */}
      <AppCard style={styles.fullCard}>
        <View style={styles.rowBetween}>
          <View>
            <Text style={styles.cardOverline}>WORKOUTS THIS WEEK</Text>
            <Text style={styles.cardHero}>{workoutsThisWeek} <Text style={styles.cardUnit}>/ {targetWorkoutsThisWeek}</Text></Text>
          </View>
          <MaterialCommunityIcons name="run" size={32} color={Colors.workout} />
        </View>
      </AppCard>
    </Animated.View>
  );

  const renderMoney = () => (
    <Animated.View entering={FadeInUp.delay(600)} style={styles.section}>
      <Text style={styles.sectionTitle}>MONEY</Text>

      {/* Budget Summary */}
      <AppCard style={styles.fullCard}>
        <Text style={styles.cardOverline}>MONTHLY BUDGET</Text>
        <PrivacyAmount amount={budget.monthlyIncomeINR} hidden={privacyModeEnabled} style={styles.budgetHero} />
        
        <View style={styles.budgetRow}>
          <View style={styles.budgetCol}>
            <Text style={styles.budgetLabel}>Spent</Text>
            <PrivacyAmount amount={totalSpentMonth} hidden={privacyModeEnabled} style={[styles.budgetValue, { color: Colors.danger }]} />
          </View>
          <View style={styles.budgetCol}>
            <Text style={styles.budgetLabel}>Remaining</Text>
            <PrivacyAmount amount={remainingBudget} hidden={privacyModeEnabled} style={[styles.budgetValue, { color: Colors.success }]} />
          </View>
        </View>
        <ProgressBar progress={Math.min(totalSpentMonth / budget.monthlyIncomeINR, 1)} color={Colors.danger} style={{ height: 4, marginTop: Spacing.sm }} />
      </AppCard>

      {/* Banks */}
      <View style={styles.grid2}>
        <AppCard style={[styles.gridCard, { padding: Spacing.md, borderLeftColor: '#f9a826', borderLeftWidth: 3 }]}>
          <Text style={styles.cardOverline}>UNION BANK</Text>
          <Text style={styles.bankRole}>SIP</Text>
          {sipAccount ? (
             <PrivacyAmount amount={sipAccount.balanceINR} hidden={privacyModeEnabled} style={styles.bankBalance} />
          ) : (
            <Text style={styles.bankEmpty}>Balance not logged</Text>
          )}
        </AppCard>
        <AppCard style={[styles.gridCard, { padding: Spacing.md, borderLeftColor: '#0065b3', borderLeftWidth: 3 }]}>
          <Text style={styles.cardOverline}>SBI</Text>
          <Text style={styles.bankRole}>Daily Use</Text>
          {dailyAccount ? (
             <PrivacyAmount amount={dailyAccount.balanceINR} hidden={privacyModeEnabled} style={styles.bankBalance} />
          ) : (
            <Text style={styles.bankEmpty}>Balance not logged</Text>
          )}
        </AppCard>
      </View>
      
      {/* Kotak & Credit */}
      <View style={styles.grid2}>
        <AppCard style={[styles.gridCard, { padding: Spacing.md, borderLeftColor: '#ed1c24', borderLeftWidth: 3 }]}>
          <Text style={styles.cardOverline}>KOTAK</Text>
          <Text style={styles.bankRole}>Savings</Text>
          {savingsAccount ? (
             <PrivacyAmount amount={savingsAccount.balanceINR} hidden={privacyModeEnabled} style={styles.bankBalance} />
          ) : (
            <Text style={styles.bankEmpty}>Balance not logged</Text>
          )}
        </AppCard>

        <AppCard style={[styles.gridCard, { padding: Spacing.md, borderColor: cardUtilRatio > 1 ? Colors.danger : Colors.border }]}>
          <Text style={styles.cardOverline}>CREDIT CARD</Text>
          <PrivacyAmount amount={cardUsed} hidden={privacyModeEnabled} style={styles.bankBalance} />
          <View style={styles.cardProgressWrap}>
            <ProgressBar progress={Math.min(cardUtilRatio, 1)} color={cardUtilRatio > 1 ? Colors.danger : cardUtilRatio > 0.75 ? Colors.warning : Colors.success} style={{ height: 4 }} />
            <Text style={[styles.cardTargetText, cardUtilRatio > 1 && { color: Colors.danger }]}>
              {cardUtilRatio > 1 ? 'LIMIT EXCEEDED' : `Ceiling: ₹${cardCeiling}`}
            </Text>
          </View>
        </AppCard>
      </View>

      {/* Daily Money */}
      <AppCard style={styles.fullCard}>
        <View style={styles.rowBetween}>
          <View>
            <Text style={styles.cardOverline}>TODAY'S SPENDING</Text>
            <PrivacyAmount amount={todayExpenses} hidden={privacyModeEnabled} style={[styles.cardHero, { color: todayExpenses > 0 ? Colors.danger : Colors.textPrimary }]} />
            <Text style={styles.cardTargetText}>Misc planned: ₹500/mo</Text>
          </View>
          <MaterialCommunityIcons name="wallet-outline" size={32} color={Colors.finance} />
        </View>
      </AppCard>
    </Animated.View>
  );

  const renderQuickActions = () => (
    <Animated.View entering={FadeInUp.delay(700)} style={styles.section}>
      <Text style={styles.sectionTitle}>QUICK ACTIONS</Text>
      <View style={styles.quickActionGrid}>
        {[
          { label: 'Expense', icon: 'cash-minus', color: Colors.danger },
          { label: 'Task', icon: 'check-circle-outline', color: Colors.primary },
          { label: 'Water', icon: 'water', color: Colors.water },
          { label: 'Weight', icon: 'scale', color: Colors.workout },
          { label: 'Workout', icon: 'dumbbell', color: Colors.info },
        ].map((action, i) => (
          <TouchableOpacity key={i} style={styles.qaButton} onPress={() => {
            if (action.label === 'Water') navigation.navigate('Water' as never);
            if (action.label === 'Task') navigation.navigate('Tasks' as never);
            if (action.label === 'Weight') navigation.navigate('Weight' as never);
          }}>
            <View style={[styles.qaIconWrap, { backgroundColor: action.color + '20' }]}>
              <MaterialCommunityIcons name={action.icon as any} size={24} color={action.color} />
            </View>
            <Text style={styles.qaLabel}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </Animated.View>
  );

  const renderMotivation = () => (
    <Animated.View entering={FadeInUp.delay(800)} style={styles.motivationSection}>
      <Text style={styles.motivationText}>"Small Daily Habits.{'\n'}Big Life Results."</Text>
    </Animated.View>
  );

  const renderCalendarPreview = () => (
    <Animated.View entering={FadeInUp.delay(120)} style={styles.section}>
      <View style={[styles.flexRow, { justifyContent: 'space-between', marginBottom: Spacing.sm }]}>
        <Text style={styles.sectionTitle}>TIME MANAGEMENT</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Calendar')}>
          <Text style={[styles.sectionTitle, { color: Colors.primary }]}>VIEW CALENDAR</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={() => navigation.navigate('Calendar')}>
        <AppCard style={{ padding: Spacing.lg, flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primary + '15', borderColor: Colors.primary, borderWidth: 1 }}>
          <MaterialCommunityIcons name="calendar-month" size={32} color={Colors.primary} />
          <View style={{ marginLeft: Spacing.md, flex: 1 }}>
            <Text style={{ ...TextStyles.h3, color: Colors.primary }}>Open Calendar</Text>
            <Text style={{ ...TextStyles.bodySmall, color: Colors.textSecondary }}>Plan your day and review your schedule.</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color={Colors.primary} />
        </AppCard>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <SafeScreen style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderHeader()}
        {renderCommandCard()}
        {renderCalendarPreview()}
        {renderDailyScore()}
        {renderNextReminder()}
        {renderRoutine()}
        {renderHealth()}
        {renderMoney()}
        {renderQuickActions()}
        {renderMotivation()}
      </ScrollView>
    </SafeScreen>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxl,
    paddingTop: Spacing.md,
  },
  flexRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  section: {
    marginBottom: Spacing.xxl,
  },
  sectionTitle: {
    ...TextStyles.overline,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    letterSpacing: 1.5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  greeting: {
    ...TextStyles.h2,
    color: Colors.textPrimary,
  },
  dateText: {
    ...TextStyles.bodySmall,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  commandCard: {
    padding: Spacing.lg,
  },
  commandTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commandProgress: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ringInner: {
    position: 'absolute',
    alignItems: 'center',
  },
  ringValue: {
    ...TextStyles.h3,
    color: Colors.textPrimary,
  },
  ringLabel: {
    ...TextStyles.caption,
    color: Colors.textSecondary,
  },
  commandMetrics: {
    flex: 1,
    marginLeft: Spacing.xl,
    gap: Spacing.md,
  },
  cmdMetricRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cmdMetricTextWrap: {
    marginLeft: Spacing.sm,
  },
  cmdMetricLabel: {
    ...TextStyles.tiny,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
  },
  cmdMetricValue: {
    ...TextStyles.label,
    color: Colors.textPrimary,
  },
  scoreSection: {
    marginBottom: Spacing.xxl,
  },
  scoreCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primary,
  },
  scoreLeft: {
    alignItems: 'center',
    paddingRight: Spacing.md,
    borderRightWidth: 1,
    borderRightColor: Colors.primaryFaint,
  },
  scoreValue: {
    ...TextStyles.hero,
    color: Colors.primary,
  },
  scoreLabel: {
    ...TextStyles.badge,
    color: Colors.primary,
  },
  scoreRight: {
    flex: 1,
    paddingLeft: Spacing.md,
  },
  scoreMessage: {
    ...TextStyles.bodySmall,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  nextActionCard: {
    padding: Spacing.lg,
    backgroundColor: Colors.surfaceHighlight,
  },
  nextActionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  nextActionTime: {
    ...TextStyles.h3,
    color: Colors.textPrimary,
  },
  badge: {
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  badgeText: {
    ...TextStyles.badge,
    color: Colors.primary,
    fontWeight: '700',
  },
  nextActionBody: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  nextActionTitle: {
    ...TextStyles.h2,
    color: Colors.textPrimary,
  },
  nextActionSubtitle: {
    ...TextStyles.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    height: 44,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    ...TextStyles.label,
    color: Colors.background,
    fontWeight: '700',
  },
  routineCard: {
    padding: Spacing.md,
  },
  routineRow: {
    flexDirection: 'row',
    minHeight: 56,
  },
  routineTime: {
    ...TextStyles.caption,
    width: 48,
    textAlign: 'right',
    marginTop: 2,
    fontWeight: '500',
  },
  routineTrack: {
    width: 32,
    alignItems: 'center',
    marginHorizontal: Spacing.sm,
  },
  routineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
    zIndex: 2,
  },
  routineLine: {
    width: 2,
    flex: 1,
    marginTop: -4,
    marginBottom: -4,
    zIndex: 1,
  },
  routineContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  routineTitle: {
    ...TextStyles.body,
    marginLeft: Spacing.sm,
    fontWeight: '500',
  },
  grid2: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  gridCard: {
    flex: 1,
  },
  fullCard: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  cardOverline: {
    ...TextStyles.overline,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  cardHero: {
    ...TextStyles.h2,
    color: Colors.textPrimary,
  },
  cardUnit: {
    ...TextStyles.bodySmall,
    color: Colors.textSecondary,
  },
  cardProgressWrap: {
    marginTop: Spacing.md,
  },
  cardTargetText: {
    ...TextStyles.caption,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
  },
  quickAddBtn: {
    backgroundColor: Colors.water + '20',
    paddingVertical: 6,
    borderRadius: Radius.sm,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  quickAddText: {
    ...TextStyles.label,
    color: Colors.water,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  budgetHero: {
    ...TextStyles.display,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  budgetCol: {
    flex: 1,
  },
  budgetLabel: {
    ...TextStyles.caption,
    color: Colors.textSecondary,
  },
  budgetValue: {
    ...TextStyles.label,
  },
  bankRole: {
    ...TextStyles.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  bankBalance: {
    ...TextStyles.h3,
    color: Colors.textPrimary,
  },
  bankEmpty: {
    ...TextStyles.caption,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  quickActionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  qaButton: {
    alignItems: 'center',
    width: 60,
  },
  qaIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  qaLabel: {
    ...TextStyles.badge,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  motivationSection: {
    paddingVertical: Spacing.xl,
    alignItems: 'center',
  },
  motivationText: {
    ...TextStyles.body,
    color: Colors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 24,
  },
});
