import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal } from 'react-native';
import { SafeScreen } from '@/components/layout/SafeScreen';
import { AppCard } from '@/components/common/AppCard';
import { InputField } from '@/components/common/InputField';
import { PrimaryCTA } from '@/components/common/PrimaryCTA';
import { Colors, Spacing, TextStyles, Radius } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useWorkoutStore, useWeightStore, useWaterStore, useStreakStore } from '@/store';
import { format, parseISO, isSameDay, differenceInSeconds } from 'date-fns';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { DayOfWeek, WorkoutExercise, WorkoutSet, WorkoutSession, WorkoutPlanDay } from '@/models/Workout';

// ─── HELPER COMPONENTS ────────────────────────────────────────────────────────

const DAYS: DayOfWeek[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const DAY_INDEX_MAP: Record<number, DayOfWeek> = { 1: 'MON', 2: 'TUE', 3: 'WED', 4: 'THU', 5: 'FRI', 6: 'SAT', 0: 'SUN' };

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ─── ACTIVE WORKOUT VIEW ──────────────────────────────────────────────────────

function ActiveWorkoutView({ session, endWorkout, logSet, skipExercise, updateActiveSessionDuration, getPreviousExerciseStats }: { 
  session: WorkoutSession, 
  endWorkout: (s: 'completed'|'incomplete') => void,
  logSet: any,
  skipExercise: any,
  updateActiveSessionDuration: any,
  getPreviousExerciseStats: any
}) {
  const [elapsed, setElapsed] = useState(session.durationSeconds || 0);
  const [restTimer, setRestTimer] = useState(0);
  const [activeExIdx, setActiveExIdx] = useState(0);
  
  // Set Logging State
  const [weightStr, setWeightStr] = useState('');
  const [repsStr, setRepsStr] = useState('');

  // Elapsed Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(prev => {
        const next = prev + 1;
        if (next % 10 === 0) updateActiveSessionDuration(next); // Sync every 10s
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [updateActiveSessionDuration]);

  // Rest Timer
  useEffect(() => {
    if (restTimer > 0) {
      const timer = setInterval(() => setRestTimer(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [restTimer]);

  const activeEx = session.exercises[activeExIdx];
  const isLastEx = activeExIdx === session.exercises.length - 1;

  const handleCompleteSet = () => {
    const w = parseFloat(weightStr);
    const r = parseInt(repsStr, 10);
    if (!isNaN(w) && !isNaN(r)) {
      const nextSetNum = (activeEx.sets?.length || 0) + 1;
      logSet(activeEx.id, nextSetNum, w, r);
      setWeightStr('');
      setRepsStr('');
      setRestTimer(activeEx.restSeconds || 90);
    }
  };

  const confirmEnd = () => {
    Alert.alert('End Workout', 'Are you sure you want to end this workout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Incomplete', onPress: () => endWorkout('incomplete') },
      { text: 'Complete', style: 'default', onPress: () => endWorkout('completed') }
    ]);
  };

  const prevStats = getPreviousExerciseStats(activeEx?.name || '');

  return (
    <View style={styles.activeContainer}>
      <View style={styles.activeHeader}>
        <View>
          <Text style={styles.activeTitle}>{session.name}</Text>
          <Text style={styles.activeSubtitle}>{activeExIdx + 1} / {session.exercises.length} exercises</Text>
        </View>
        <Text style={styles.activeTimer}>{formatDuration(elapsed)}</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: Spacing.lg, paddingBottom: 100 }}>
        {restTimer > 0 && (
          <AppCard style={styles.restCard}>
            <Text style={styles.restOverline}>REST TIMER</Text>
            <Text style={styles.restTime}>{formatDuration(restTimer)}</Text>
            <TouchableOpacity style={styles.skipRestBtn} onPress={() => setRestTimer(0)}>
              <Text style={styles.skipRestText}>Skip Rest</Text>
            </TouchableOpacity>
          </AppCard>
        )}

        <Text style={styles.exerciseName}>{activeEx.name}</Text>
        <View style={styles.exerciseMetaRow}>
          <Text style={styles.exerciseTarget}>Target: {activeEx.targetSets} sets × {activeEx.targetReps}</Text>
          {prevStats && (
            <Text style={styles.exercisePrev}>Prev: {prevStats.weightKg}kg × {prevStats.reps}</Text>
          )}
        </View>

        {activeEx.sets.map((set, i) => (
          <View key={set.id} style={styles.completedSetRow}>
            <Text style={styles.setNum}>Set {set.setNumber}</Text>
            <Text style={styles.setDetail}>{set.weightKg} kg × {set.reps} reps</Text>
            <MaterialCommunityIcons name="check-circle" size={20} color={Colors.success} />
          </View>
        ))}

        <AppCard style={styles.logCard}>
          <Text style={styles.logCardTitle}>Log Set {(activeEx.sets.length || 0) + 1}</Text>
          <View style={styles.logRow}>
            <View style={styles.logCol}>
              <Text style={styles.logLabel}>Weight (kg)</Text>
              <InputField value={weightStr} onChangeText={setWeightStr} keyboardType="numeric" placeholder="e.g. 20" />
            </View>
            <View style={{ width: Spacing.md }} />
            <View style={styles.logCol}>
              <Text style={styles.logLabel}>Reps</Text>
              <InputField value={repsStr} onChangeText={setRepsStr} keyboardType="numeric" placeholder="e.g. 10" />
            </View>
          </View>
          <PrimaryCTA label="COMPLETE SET" onPress={handleCompleteSet} style={{ marginTop: Spacing.md }} />
        </AppCard>

        <View style={styles.activeNavRow}>
          <TouchableOpacity 
            style={styles.navBtn} 
            disabled={activeExIdx === 0} 
            onPress={() => setActiveExIdx(i => i - 1)}
          >
            <MaterialCommunityIcons name="chevron-left" size={24} color={activeExIdx === 0 ? Colors.textMuted : Colors.textPrimary} />
            <Text style={[styles.navBtnText, { color: activeExIdx === 0 ? Colors.textMuted : Colors.textPrimary }]}>Prev</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.navSkipBtn} onPress={() => {
            skipExercise(activeEx.id);
            if (!isLastEx) setActiveExIdx(i => i + 1);
          }}>
            <Text style={styles.navSkipText}>Skip</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.navBtn} 
            disabled={isLastEx} 
            onPress={() => setActiveExIdx(i => i + 1)}
          >
            <Text style={[styles.navBtnText, { color: isLastEx ? Colors.textMuted : Colors.textPrimary }]}>Next</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color={isLastEx ? Colors.textMuted : Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.endBtn} onPress={confirmEnd}>
          <Text style={styles.endBtnText}>END WORKOUT</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

// ─── MAIN SCREEN ──────────────────────────────────────────────────────────────

export function WorkoutScreen() {
  const navigation = useNavigation();
  const { plan, activeSession, history, startWorkout, endWorkout, logSet, skipExercise, updateActiveSessionDuration, getPreviousExerciseStats } = useWorkoutStore();
  const { markCompleted, removeTodayCompletion, getStreak } = useStreakStore();
  const weightLogs = useWeightStore(s => s.logs);
  const waterLogs = useWaterStore(s => s.logs);
  
  const todayDayOfWeek = DAY_INDEX_MAP[new Date().getDay()];
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(todayDayOfWeek);
  
  const todayPlan = plan.find(p => p.day === todayDayOfWeek);
  const selectedPlan = plan.find(p => p.day === selectedDay);

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todayCompleted = history.find(h => h.date === todayStr && h.status === 'completed');

  const handleEndWorkout = (status: 'completed'|'incomplete') => {
    endWorkout(status);
    if (status === 'completed') {
      markCompleted('gym');
    }
  };

  // Metrics
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // rough monday
  const weekStr = format(weekStart, 'yyyy-MM-dd');
  const weekHistory = history.filter(h => h.date >= weekStr && h.status === 'completed');
  const weekMinutes = Math.floor(weekHistory.reduce((acc, h) => acc + h.durationSeconds, 0) / 60);
  const weekExercises = weekHistory.reduce((acc, h) => acc + h.exercises.filter(e => e.sets.length > 0 && !e.isSkipped).length, 0);
  const currentStreak = getStreak('gym')?.currentStreak || 0;

  // Integrations
  const currentWeight = weightLogs.length > 0 ? weightLogs[weightLogs.length - 1].weightKg : 46;
  const todayWaterLogs = waterLogs.filter(l => l.timestamp.startsWith(todayStr));
  const todayWater = todayWaterLogs.reduce((acc, l) => acc + l.amountML, 0);

  if (activeSession) {
    return (
      <SafeScreen style={styles.container}>
        <ActiveWorkoutView 
          session={activeSession} 
          endWorkout={handleEndWorkout} 
          logSet={logSet} 
          skipExercise={skipExercise}
          updateActiveSessionDuration={updateActiveSessionDuration}
          getPreviousExerciseStats={getPreviousExerciseStats}
        />
      </SafeScreen>
    );
  }

  return (
    <SafeScreen style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: Spacing.sm }}>
            <MaterialCommunityIcons name="arrow-left" size={28} color={Colors.textPrimary} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>WORKOUT</Text>
            <Text style={styles.headerSubtitle}>Train consistently. Get stronger.</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.iconBtn}>
          <MaterialCommunityIcons name="history" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* TODAY HERO */}
        <Animated.View entering={FadeInDown.delay(100)}>
          <AppCard style={styles.heroCard}>
            <Text style={styles.heroOverline}>TODAY</Text>
            <Text style={styles.heroTitle}>{todayPlan?.isActive ? todayPlan.name : 'Rest Day'}</Text>
            {todayPlan?.isActive && (
              <Text style={styles.heroSubtitle}>{todayPlan.exercises.length} exercises</Text>
            )}
            
            <View style={styles.heroActionWrap}>
              {todayCompleted ? (
                <View style={styles.completedBadge}>
                  <MaterialCommunityIcons name="check-circle" size={20} color={Colors.success} />
                  <Text style={styles.completedText}>WORKOUT COMPLETE</Text>
                </View>
              ) : todayPlan?.isActive ? (
                <PrimaryCTA label="START WORKOUT" onPress={() => startWorkout(todayPlan)} />
              ) : (
                <Text style={styles.restText}>Enjoy your recovery.</Text>
              )}
            </View>
          </AppCard>
        </Animated.View>

        {/* WEEKLY SUMMARY */}
        <Animated.View entering={FadeInDown.delay(150)} style={styles.section}>
          <Text style={styles.sectionTitle}>THIS WEEK</Text>
          <View style={styles.grid2}>
            <AppCard style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{weekHistory.length} <Text style={styles.summaryUnit}>/ 5</Text></Text>
              <Text style={styles.summaryLabel}>Workouts</Text>
            </AppCard>
            <AppCard style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{currentStreak} <Text style={styles.summaryUnit}>days</Text></Text>
              <Text style={styles.summaryLabel}>Streak</Text>
            </AppCard>
            <AppCard style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{weekMinutes} <Text style={styles.summaryUnit}>min</Text></Text>
              <Text style={styles.summaryLabel}>Duration</Text>
            </AppCard>
            <AppCard style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{weekExercises}</Text>
              <Text style={styles.summaryLabel}>Exercises</Text>
            </AppCard>
          </View>
        </Animated.View>

        {/* WORKOUT PROGRAM */}
        <Animated.View entering={FadeInDown.delay(200)} style={styles.section}>
          <Text style={styles.sectionTitle}>WORKOUT PROGRAM</Text>
          <View style={styles.daySelectorRow}>
            {DAYS.map(day => (
              <TouchableOpacity 
                key={day} 
                onPress={() => setSelectedDay(day)}
                style={[styles.daySelectorBtn, selectedDay === day && styles.daySelectorBtnActive]}
              >
                <Text style={[styles.daySelectorText, selectedDay === day && styles.daySelectorTextActive]}>{day}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <AppCard style={styles.planCard}>
            <Text style={styles.planCardTitle}>{selectedPlan?.name}</Text>
            {selectedPlan?.isActive ? (
              selectedPlan.exercises.map((ex, i) => {
                const prev = getPreviousExerciseStats(ex.name);
                return (
                  <View key={ex.id} style={styles.planExerciseRow}>
                    <View style={styles.planExLeft}>
                      <Text style={styles.planExName}>{ex.name}</Text>
                      <Text style={styles.planExMuscle}>{ex.targetMuscle} • {ex.targetSets} × {ex.targetReps}</Text>
                    </View>
                    <View style={styles.planExRight}>
                      {prev ? (
                        <Text style={styles.planExPrev}>Last: {prev.weightKg}kg</Text>
                      ) : (
                        <Text style={styles.planExPrev}>No history</Text>
                      )}
                    </View>
                  </View>
                );
              })
            ) : (
              <Text style={styles.emptyText}>Rest Day</Text>
            )}
          </AppCard>
        </Animated.View>

        {/* INTEGRATIONS */}
        <Animated.View entering={FadeInDown.delay(250)} style={styles.section}>
          <Text style={styles.sectionTitle}>BODY STATUS</Text>
          <View style={styles.grid2}>
            <AppCard style={styles.statusCard}>
              <MaterialCommunityIcons name="scale" size={20} color={Colors.workout} />
              <Text style={styles.statusTitle}>WEIGHT</Text>
              <Text style={styles.statusValue}>{currentWeight.toFixed(1)} kg</Text>
            </AppCard>
            <AppCard style={styles.statusCard}>
              <MaterialCommunityIcons name="water" size={20} color={Colors.water} />
              <Text style={styles.statusTitle}>WATER</Text>
              <Text style={styles.statusValue}>{(todayWater/1000).toFixed(1)} L</Text>
            </AppCard>
          </View>
        </Animated.View>

      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg, paddingBottom: Spacing.md },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { ...TextStyles.h1, color: Colors.textPrimary },
  headerSubtitle: { ...TextStyles.bodySmall, color: Colors.textSecondary, marginTop: 4 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.surface, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  scrollContent: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxl },
  section: { marginTop: Spacing.xl },
  sectionTitle: { ...TextStyles.overline, color: Colors.textMuted, marginBottom: Spacing.sm, letterSpacing: 1.5, marginLeft: Spacing.sm },
  heroCard: { padding: Spacing.xxl, backgroundColor: Colors.surfaceHighlight, alignItems: 'center' },
  heroOverline: { ...TextStyles.overline, color: Colors.primary },
  heroTitle: { ...TextStyles.h2, color: Colors.textPrimary, marginTop: Spacing.sm },
  heroSubtitle: { ...TextStyles.body, color: Colors.textSecondary, marginTop: 4 },
  heroActionWrap: { marginTop: Spacing.lg, width: '100%', alignItems: 'center' },
  completedBadge: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: Colors.success + '20', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.full },
  completedText: { ...TextStyles.label, color: Colors.success },
  restText: { ...TextStyles.body, color: Colors.textMuted },
  grid2: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  summaryCard: { flex: 1, minWidth: '45%', padding: Spacing.md, alignItems: 'center' },
  summaryValue: { ...TextStyles.h3, color: Colors.textPrimary },
  summaryUnit: { ...TextStyles.caption, color: Colors.textSecondary },
  summaryLabel: { ...TextStyles.tiny, color: Colors.textMuted, marginTop: 4 },
  daySelectorRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.md },
  daySelectorBtn: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.sm, borderRadius: Radius.sm },
  daySelectorBtnActive: { backgroundColor: Colors.primary + '20' },
  daySelectorText: { ...TextStyles.tiny, color: Colors.textSecondary },
  daySelectorTextActive: { color: Colors.primary, fontWeight: '700' },
  planCard: { padding: Spacing.lg },
  planCardTitle: { ...TextStyles.label, color: Colors.primary, marginBottom: Spacing.md },
  planExerciseRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
  planExLeft: { flex: 1 },
  planExName: { ...TextStyles.body, color: Colors.textPrimary, fontWeight: '600' },
  planExMuscle: { ...TextStyles.caption, color: Colors.textSecondary, marginTop: 2 },
  planExRight: { alignItems: 'flex-end', marginLeft: Spacing.sm },
  planExPrev: { ...TextStyles.tiny, color: Colors.textMuted },
  emptyText: { ...TextStyles.body, color: Colors.textMuted },
  statusCard: { flex: 1, minWidth: '45%', padding: Spacing.md },
  statusTitle: { ...TextStyles.tiny, color: Colors.textMuted, marginTop: Spacing.sm },
  statusValue: { ...TextStyles.label, color: Colors.textPrimary, marginTop: 2 },

  // Active Workout Styles
  activeContainer: { flex: 1, backgroundColor: Colors.background },
  activeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.lg, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  activeTitle: { ...TextStyles.h3, color: Colors.primary },
  activeSubtitle: { ...TextStyles.caption, color: Colors.textSecondary },
  activeTimer: { ...TextStyles.h2, color: Colors.textPrimary, fontVariant: ['tabular-nums'] },
  restCard: { padding: Spacing.lg, alignItems: 'center', backgroundColor: Colors.warning + '20', borderColor: Colors.warning, borderWidth: 1, marginBottom: Spacing.xl },
  restOverline: { ...TextStyles.overline, color: Colors.warning },
  restTime: { ...TextStyles.hero, color: Colors.warning, marginVertical: Spacing.sm },
  skipRestBtn: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.lg, backgroundColor: Colors.background, borderRadius: Radius.full },
  skipRestText: { ...TextStyles.label, color: Colors.textPrimary },
  exerciseName: { ...TextStyles.h2, color: Colors.textPrimary },
  exerciseMetaRow: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.xs, marginBottom: Spacing.lg },
  exerciseTarget: { ...TextStyles.caption, color: Colors.textSecondary },
  exercisePrev: { ...TextStyles.caption, color: Colors.textMuted },
  completedSetRow: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, backgroundColor: Colors.surface, borderRadius: Radius.sm, marginBottom: Spacing.sm },
  setNum: { ...TextStyles.label, color: Colors.textSecondary, width: 60 },
  setDetail: { ...TextStyles.body, color: Colors.textPrimary, flex: 1 },
  logCard: { padding: Spacing.md, backgroundColor: Colors.surfaceHighlight, marginTop: Spacing.sm },
  logCardTitle: { ...TextStyles.label, color: Colors.textPrimary, marginBottom: Spacing.md },
  logRow: { flexDirection: 'row' },
  logCol: { flex: 1 },
  logLabel: { ...TextStyles.caption, color: Colors.textSecondary, marginBottom: 4 },
  activeNavRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.xxl, marginBottom: Spacing.xl },
  navBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  navBtnText: { ...TextStyles.label },
  navSkipBtn: { padding: Spacing.sm },
  navSkipText: { ...TextStyles.label, color: Colors.textMuted },
  endBtn: { backgroundColor: Colors.surface, borderColor: Colors.danger, borderWidth: 1, padding: Spacing.md, borderRadius: Radius.md, alignItems: 'center' },
  endBtnText: { ...TextStyles.label, color: Colors.danger }
});
