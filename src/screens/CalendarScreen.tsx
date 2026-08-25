import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeScreen, AppCard } from '../components';
import { Colors, Spacing, TextStyles, Radius } from '../constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format, addDays, subDays, startOfWeek, endOfWeek, eachDayOfInterval, startOfMonth, endOfMonth, isSameDay, isSameMonth, addWeeks, subWeeks, addMonths, subMonths } from 'date-fns';
import { useTaskStore } from '../store/useTaskStore';
import { useReminderStore } from '../store/useReminderStore';
import { useRoutineStore } from '../store/useRoutineStore';
import { useNutritionStore } from '../store/useNutritionStore';
import { useWorkoutStore } from '../store/useWorkoutStore';
import { useCalendarStore } from '../store/useCalendarStore';
import { getDayEvents, detectConflicts, getOverdueEvents, getNextEvent } from '../utils/calendarUtils';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { RootStackScreenProps } from '../navigation/types';

type Mode = 'DAY' | 'WEEK' | 'MONTH';

export function CalendarScreen({ navigation }: RootStackScreenProps<'Calendar'>) {
  const [mode, setMode] = useState<Mode>('DAY');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const isToday = dateStr === format(new Date(), 'yyyy-MM-dd');

  // Stores
  const tasks = useTaskStore(s => s.tasks);
  const reminders = useReminderStore(s => s.reminders);
  const routineBlocks = useRoutineStore(s => s.blocks);
  const mealPlans = useNutritionStore(s => s.mealPlans);
  const mealEntries = useNutritionStore(s => s.entries);
  const workouts = useWorkoutStore(s => s.history);
  const activeSession = useWorkoutStore(s => s.activeSession);
  const allWorkouts = activeSession ? [...workouts, activeSession] : workouts;
  
  const dailyNotes = useCalendarStore(s => s.dailyNotes);
  const topPriorities = useCalendarStore(s => s.topPriorities);
  const setDailyNote = useCalendarStore(s => s.setDailyNote);

  // Aggregation
  const stores = useMemo(() => ({
    tasks, reminders, routineBlocks, mealPlans, mealEntries, workouts: allWorkouts, transactions: [], topPriorityId: topPriorities[dateStr]
  }), [tasks, reminders, routineBlocks, mealPlans, mealEntries, allWorkouts, topPriorities, dateStr]);

  const events = useMemo(() => getDayEvents(dateStr, stores), [dateStr, stores]);
  const overdue = useMemo(() => getOverdueEvents(stores), [stores]);
  const conflicts = useMemo(() => detectConflicts(events), [events]);
  const nextAction = useMemo(() => getNextEvent(events), [events]);

  const goToToday = () => setSelectedDate(new Date());
  
  const handlePrev = () => {
    if (mode === 'DAY') setSelectedDate(subDays(selectedDate, 1));
    if (mode === 'WEEK') setSelectedDate(subWeeks(selectedDate, 1));
    if (mode === 'MONTH') setSelectedDate(subMonths(selectedDate, 1));
  };
  
  const handleNext = () => {
    if (mode === 'DAY') setSelectedDate(addDays(selectedDate, 1));
    if (mode === 'WEEK') setSelectedDate(addWeeks(selectedDate, 1));
    if (mode === 'MONTH') setSelectedDate(addMonths(selectedDate, 1));
  };

  const renderDayView = () => (
    <Animated.ScrollView entering={FadeIn} contentContainerStyle={styles.scrollContent}>
      {isToday && overdue.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>OVERDUE</Text>
          {overdue.map(ev => (
            <AppCard key={ev.id} style={[styles.eventCard, { borderColor: Colors.danger, borderWidth: 1 }]}>
              <Text style={styles.eventTitle}>{ev.title}</Text>
              <Text style={styles.eventTime}>{ev.startDateTime ? format(new Date(ev.startDateTime), 'MMM d, h:mm a') : ''}</Text>
            </AppCard>
          ))}
        </View>
      )}

      {isToday && nextAction && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>NEXT ACTION</Text>
          <AppCard style={styles.nextActionCard}>
            <Text style={styles.nextActionTitle}>{nextAction.title}</Text>
            <Text style={styles.nextActionSub}>{nextAction.startDateTime ? format(new Date(nextAction.startDateTime), 'h:mm a') : 'Anytime'}</Text>
          </AppCard>
        </View>
      )}

      {conflicts.length > 0 && (
        <View style={styles.conflictBanner}>
          <MaterialCommunityIcons name="alert-circle-outline" size={20} color={Colors.danger} />
          <Text style={styles.conflictText}>SCHEDULE CONFLICT: {conflicts.length} activities overlap.</Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>TODAY'S SCHEDULE</Text>
        {events.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="calendar-blank" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyText}>CLEAR DAY</Text>
            <Text style={styles.emptySub}>No scheduled activities.</Text>
          </View>
        ) : (
          events.map((ev, i) => (
            <Animated.View key={ev.id} entering={FadeInDown.delay(i * 50)}>
              <AppCard style={[styles.eventCard, ev.isCompleted && styles.eventCompleted]}>
                <View style={styles.eventLeft}>
                  <Text style={[styles.eventTime, ev.isCompleted && styles.textCompleted]}>
                    {ev.startDateTime ? format(new Date(ev.startDateTime), 'HH:mm') : 'Anytime'}
                  </Text>
                  <View style={[styles.sourceBadge, { backgroundColor: (ev.color || Colors.primary) + '20' }]}>
                    <Text style={[styles.sourceText, { color: ev.color || Colors.primary }]}>{ev.source}</Text>
                  </View>
                </View>
                <View style={styles.eventRight}>
                  <Text style={[styles.eventTitle, ev.isCompleted && styles.textCompleted]}>{ev.title}</Text>
                  {ev.notes && <Text style={styles.eventNotes}>{ev.notes}</Text>}
                </View>
                {ev.isCompleted && (
                  <MaterialCommunityIcons name="check-circle" size={24} color={Colors.success} style={{ marginLeft: 'auto' }} />
                )}
              </AppCard>
            </Animated.View>
          ))
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>DAILY NOTE</Text>
        <TextInput
          style={styles.noteInput}
          multiline
          placeholder="Write a note for today..."
          placeholderTextColor={Colors.textMuted}
          value={dailyNotes[dateStr] || ''}
          onChangeText={(txt) => setDailyNote(dateStr, txt)}
        />
      </View>
    </Animated.ScrollView>
  );

  const renderWeekView = () => {
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const weekDays = eachDayOfInterval({ start: weekStart, end: endOfWeek(weekStart, { weekStartsOn: 1 }) });
    const HOUR_HEIGHT = 50;
    const hours = Array.from({length: 24}).map((_, i) => i);

    return (
      <Animated.View entering={FadeIn} style={styles.weekContainer}>
        <View style={styles.weekHeader}>
           <View style={styles.timeColumnHeader} />
           {weekDays.map(day => (
             <TouchableOpacity key={day.toISOString()} style={[styles.weekDayCol, isSameDay(day, new Date()) && styles.weekDayToday, isSameDay(day, selectedDate) && styles.weekDaySelected]} onPress={() => { setSelectedDate(day); setMode('DAY'); }}>
               <Text style={[styles.weekDayName, (isSameDay(day, new Date()) || isSameDay(day, selectedDate)) && {color: Colors.textInverse}]}>{format(day, 'EEE').toUpperCase()}</Text>
               <Text style={[styles.weekDayDate, (isSameDay(day, new Date()) || isSameDay(day, selectedDate)) && {color: Colors.textInverse}]}>{format(day, 'd')}</Text>
             </TouchableOpacity>
           ))}
        </View>
        <ScrollView style={styles.weekScrollContainer} contentContainerStyle={{ paddingBottom: Spacing.xl }}>
           <View style={styles.weekGrid}>
             <View style={styles.timeColumn}>
               {hours.map(h => (
                  <View key={h} style={[styles.timeCell, { height: HOUR_HEIGHT }]}>
                    <Text style={styles.timeText}>{h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h-12} PM`}</Text>
                  </View>
               ))}
             </View>
             <View style={styles.daysContainer}>
               {weekDays.map(day => {
                  const dayStr = format(day, 'yyyy-MM-dd');
                  // For the week view we need fresh stores but since we memoized them for the current selectedDate,
                  // we actually need the store values. `stores` is fully reactive to all changes.
                  // This is fine since it just uses the array references.
                  const evs = getDayEvents(dayStr, stores).filter(e => e.startDateTime && e.endDateTime);
                  
                  return (
                    <View key={dayStr} style={styles.dayColumn}>
                      {hours.map(h => <View key={h} style={[styles.gridLine, { height: HOUR_HEIGHT }]} />)}
                      {evs.map(ev => {
                         const startDt = new Date(ev.startDateTime!);
                         const endDt = new Date(ev.endDateTime!);
                         const top = (startDt.getHours() + startDt.getMinutes() / 60) * HOUR_HEIGHT;
                         const height = Math.max(((endDt.getTime() - startDt.getTime()) / (1000 * 60 * 60)) * HOUR_HEIGHT, 20);
                         return (
                           <TouchableOpacity key={ev.id} style={[styles.weekEvent, { top, height, backgroundColor: ev.color || Colors.primary }]} onPress={() => { setSelectedDate(day); setMode('DAY'); }}>
                              <Text style={styles.weekEventTitle} numberOfLines={1}>{ev.title}</Text>
                           </TouchableOpacity>
                         )
                      })}
                    </View>
                  )
               })}
             </View>
           </View>
        </ScrollView>
      </Animated.View>
    );
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const monthDays = eachDayOfInterval({ start: gridStart, end: gridEnd });

    return (
      <Animated.ScrollView entering={FadeIn} contentContainerStyle={styles.monthScrollContent}>
        <View style={styles.monthHeaderRow}>
          {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(d => (
            <Text key={d} style={styles.monthDayLabel}>{d}</Text>
          ))}
        </View>
        <View style={styles.monthGrid}>
          {monthDays.map(day => {
            const dayStr = format(day, 'yyyy-MM-dd');
            const evs = getDayEvents(dayStr, stores);
            const isSelected = isSameDay(day, selectedDate);
            const isTodayDate = isSameDay(day, new Date());
            const isCurrentMonth = isSameMonth(day, selectedDate);

            return (
              <TouchableOpacity key={day.toISOString()} style={[styles.monthCell, isSelected && styles.monthCellSelected]} onPress={() => { setSelectedDate(day); setMode('DAY'); }}>
                <View style={[styles.monthDateBadge, isTodayDate && styles.monthDateToday]}>
                  <Text style={[styles.monthDateText, !isCurrentMonth && styles.monthDateMuted, isTodayDate && {color: Colors.background}]}>{format(day, 'd')}</Text>
                </View>
                <View style={styles.monthIndicators}>
                  {evs.slice(0, 4).map((ev, idx) => (
                    <View key={idx} style={[styles.monthDot, { backgroundColor: ev.color || Colors.primary }]} />
                  ))}
                  {evs.length > 4 && <Text style={styles.monthMore}>+{evs.length - 4}</Text>}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </Animated.ScrollView>
    );
  };

  return (
    <SafeScreen style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={28} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>CALENDAR</Text>
        <TouchableOpacity onPress={goToToday}>
          <Text style={styles.todayBtn}>TODAY</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.dateSelector}>
        <TouchableOpacity onPress={handlePrev}>
          <MaterialCommunityIcons name="chevron-left" size={32} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.dateTextWrapper}>
          <Text style={styles.dateDayName}>
            {mode === 'DAY' ? format(selectedDate, 'EEEE').toUpperCase() : mode === 'WEEK' ? 'WEEK OF' : format(selectedDate, 'yyyy')}
          </Text>
          <Text style={styles.dateFull}>
            {mode === 'DAY' ? format(selectedDate, 'd MMMM') : mode === 'WEEK' ? format(startOfWeek(selectedDate, {weekStartsOn: 1}), 'd MMMM') : format(selectedDate, 'MMMM').toUpperCase()}
          </Text>
        </View>
        <TouchableOpacity onPress={handleNext}>
          <MaterialCommunityIcons name="chevron-right" size={32} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <View style={styles.segmentedControl}>
        {(['DAY', 'WEEK', 'MONTH'] as Mode[]).map(m => (
          <TouchableOpacity key={m} style={[styles.segment, mode === m && styles.segmentActive]} onPress={() => setMode(m)}>
            <Text style={[styles.segmentText, mode === m && styles.segmentTextActive]}>{m}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {mode === 'DAY' && renderDayView()}
      {mode === 'WEEK' && renderWeekView()}
      {mode === 'MONTH' && renderMonthView()}

      {/* QUICK ADD FAB */}
      <TouchableOpacity style={styles.fab}>
        <MaterialCommunityIcons name="plus" size={32} color={Colors.background} />
      </TouchableOpacity>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.lg },
  headerTitle: { ...TextStyles.h2, color: Colors.textPrimary },
  todayBtn: { ...TextStyles.label, color: Colors.primary },
  dateSelector: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.xl, marginBottom: Spacing.md },
  dateTextWrapper: { alignItems: 'center' },
  dateDayName: { ...TextStyles.overline, color: Colors.textMuted, letterSpacing: 2 },
  dateFull: { ...TextStyles.h1, color: Colors.textPrimary },
  segmentedControl: { flexDirection: 'row', marginHorizontal: Spacing.lg, backgroundColor: Colors.surfaceHighlight, borderRadius: Radius.full, padding: 4, marginBottom: Spacing.lg },
  segment: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: Radius.full },
  segmentActive: { backgroundColor: Colors.surface },
  segmentText: { ...TextStyles.label, color: Colors.textMuted },
  segmentTextActive: { color: Colors.textPrimary },
  
  // Day View
  scrollContent: { paddingHorizontal: Spacing.lg, paddingBottom: 100 },
  section: { marginBottom: Spacing.xl },
  sectionTitle: { ...TextStyles.overline, color: Colors.textMuted, marginBottom: Spacing.sm, letterSpacing: 1.5 },
  conflictBanner: { flexDirection: 'row', backgroundColor: '#FEE2E210', padding: Spacing.md, borderRadius: Radius.md, alignItems: 'center', marginBottom: Spacing.lg },
  conflictText: { ...TextStyles.bodySmall, color: Colors.danger, marginLeft: Spacing.sm },
  emptyState: { alignItems: 'center', paddingVertical: Spacing.xxl },
  emptyText: { ...TextStyles.h3, color: Colors.textPrimary, marginTop: Spacing.md },
  emptySub: { ...TextStyles.body, color: Colors.textSecondary },
  eventCard: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, marginBottom: Spacing.sm },
  eventCompleted: { opacity: 0.6 },
  eventLeft: { width: 80 },
  eventTime: { ...TextStyles.h3, color: Colors.textPrimary },
  sourceBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: Radius.sm, alignSelf: 'flex-start', marginTop: 4 },
  sourceText: { ...TextStyles.tiny, textTransform: 'uppercase', fontWeight: 'bold' },
  eventRight: { flex: 1, marginLeft: Spacing.sm },
  eventTitle: { ...TextStyles.body, color: Colors.textPrimary },
  textCompleted: { textDecorationLine: 'line-through', color: Colors.textMuted },
  eventNotes: { ...TextStyles.caption, color: Colors.textSecondary, marginTop: 2 },
  nextActionCard: { padding: Spacing.lg, backgroundColor: Colors.primary + '15', borderColor: Colors.primary, borderWidth: 1 },
  nextActionTitle: { ...TextStyles.h2, color: Colors.primary },
  nextActionSub: { ...TextStyles.body, color: Colors.textPrimary, marginTop: 4 },
  noteInput: { backgroundColor: Colors.surface, color: Colors.textPrimary, borderRadius: Radius.md, padding: Spacing.md, minHeight: 100, textAlignVertical: 'top', ...TextStyles.body },
  
  // Week View
  weekContainer: { flex: 1 },
  weekHeader: { flexDirection: 'row', paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border },
  timeColumnHeader: { width: 50 },
  weekDayCol: { flex: 1, alignItems: 'center', paddingVertical: Spacing.sm, borderRadius: Radius.sm },
  weekDayToday: { backgroundColor: Colors.primary },
  weekDaySelected: { backgroundColor: Colors.surfaceHighlight },
  weekDayName: { ...TextStyles.overline, color: Colors.textMuted },
  weekDayDate: { ...TextStyles.h3, color: Colors.textPrimary, marginTop: 2 },
  weekScrollContainer: { flex: 1 },
  weekGrid: { flexDirection: 'row', paddingHorizontal: Spacing.md },
  timeColumn: { width: 50, paddingTop: 25 }, // shift down to align with lines
  timeCell: { justifyContent: 'flex-start' },
  timeText: { ...TextStyles.tiny, color: Colors.textMuted, marginTop: -8 }, // align with top border
  daysContainer: { flex: 1, flexDirection: 'row' },
  dayColumn: { flex: 1, position: 'relative' },
  gridLine: { borderTopWidth: 1, borderTopColor: Colors.borderSubtle, width: '100%' },
  weekEvent: { position: 'absolute', left: 2, right: 2, borderRadius: 4, padding: 2, overflow: 'hidden' },
  weekEventTitle: { ...TextStyles.tiny, color: Colors.background, fontWeight: 'bold', fontSize: 9 },

  // Month View
  monthScrollContent: { paddingHorizontal: Spacing.md, paddingBottom: 100 },
  monthHeaderRow: { flexDirection: 'row', marginBottom: Spacing.md },
  monthDayLabel: { flex: 1, textAlign: 'center', ...TextStyles.overline, color: Colors.textMuted },
  monthGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  monthCell: { width: '14.28%', aspectRatio: 0.8, alignItems: 'center', padding: 2, borderTopWidth: 1, borderTopColor: Colors.borderSubtle },
  monthCellSelected: { backgroundColor: Colors.surfaceHighlight },
  monthDateBadge: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  monthDateToday: { backgroundColor: Colors.primary },
  monthDateText: { ...TextStyles.body, color: Colors.textPrimary },
  monthDateMuted: { color: Colors.textMuted },
  monthIndicators: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', width: '100%', gap: 2 },
  monthDot: { width: 6, height: 6, borderRadius: 3 },
  monthMore: { ...TextStyles.tiny, color: Colors.textMuted, fontSize: 8 },

  fab: { position: 'absolute', bottom: Spacing.xl, right: Spacing.xl, width: 64, height: 64, borderRadius: 32, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', elevation: 4 },
});
