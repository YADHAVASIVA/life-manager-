import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeScreen } from '@/components/layout/SafeScreen';
import { AppCard } from '@/components/common/AppCard';
import { ProgressRing } from '@/components/common/ProgressRing';
import { Colors, Spacing, TextStyles, Radius } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useWeightStore, useUserStore, useReminderStore, useStreakStore } from '@/store';
import { format, parseISO, subDays, isAfter, isSameDay, startOfWeek, startOfMonth } from 'date-fns';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { Modal } from '@/components/common/Modal';
import { InputField } from '@/components/common/InputField';
import { PrimaryCTA } from '@/components/common/PrimaryCTA';
import { WeightLog } from '@/models/Weight';
import Svg, { Polyline, Circle, Line } from 'react-native-svg';

const MILESTONES = [50, 55, 60, 65, 70];
const TARGET_MIN = 65;
const TARGET_MAX = 70;

export function WeightScreen() {
  const navigation = useNavigation();
  const { logs, logWeight, editLog, removeLog } = useWeightStore();
  const { user } = useUserStore();
  const { reminders } = useReminderStore();
  const { markCompleted, removeTodayCompletion } = useStreakStore();

  const baselineWeight = user?.weightKg || 46;
  const currentWeight = logs.length > 0 ? logs[logs.length - 1].weightKg : baselineWeight;

  // State
  const [showLogModal, setShowLogModal] = useState(false);
  const [weightStr, setWeightStr] = useState('');
  const [noteStr, setNoteStr] = useState('');
  
  const [editingLog, setEditingLog] = useState<WeightLog | null>(null);
  const [editWeightStr, setEditWeightStr] = useState('');
  const [editNoteStr, setEditNoteStr] = useState('');

  const [chartFilter, setChartFilter] = useState<'7D' | '30D' | '3M' | '6M' | 'ALL'>('30D');

  // Computed Hero
  const remainingToMin = Math.max(0, TARGET_MIN - currentWeight);
  const progressPercent = Math.max(0, Math.min(100, Math.round(((currentWeight - baselineWeight) / (TARGET_MIN - baselineWeight)) * 100)));

  // Computed Milestones
  const nextMilestone = MILESTONES.find(m => currentWeight < m) || TARGET_MAX;
  const nextMilestoneRemaining = Math.max(0, nextMilestone - currentWeight);

  // Filter logs for chart
  const filteredLogs = useMemo(() => {
    const now = new Date();
    let cutoffDate = new Date(0);
    switch (chartFilter) {
      case '7D': cutoffDate = subDays(now, 7); break;
      case '30D': cutoffDate = subDays(now, 30); break;
      case '3M': cutoffDate = subDays(now, 90); break;
      case '6M': cutoffDate = subDays(now, 180); break;
    }
    return logs.filter(l => isAfter(parseISO(l.timestamp), cutoffDate));
  }, [logs, chartFilter]);

  // Summaries
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const monthStart = startOfMonth(new Date());

  const weekLogs = logs.filter(l => isAfter(parseISO(l.timestamp), weekStart));
  const monthLogs = logs.filter(l => isAfter(parseISO(l.timestamp), monthStart));

  const weekAvg = weekLogs.length ? weekLogs.reduce((acc, l) => acc + l.weightKg, 0) / weekLogs.length : 0;
  const monthAvg = monthLogs.length ? monthLogs.reduce((acc, l) => acc + l.weightKg, 0) / monthLogs.length : 0;
  
  const monthStartWeight = monthLogs.length ? monthLogs[0].weightKg : currentWeight;

  // Reverse sort for history list
  const historyLogs = [...logs].reverse();

  // Handlers
  const handleLogSubmit = () => {
    const w = parseFloat(weightStr);
    if (!isNaN(w) && w > 0) {
      logWeight(w, noteStr.trim() || undefined);
      markCompleted('weight');
      setShowLogModal(false);
      setWeightStr('');
      setNoteStr('');
    }
  };

  const handleEditSubmit = () => {
    if (editingLog) {
      const w = parseFloat(editWeightStr);
      if (!isNaN(w) && w > 0) {
        editLog(editingLog.id, { weightKg: w, note: editNoteStr.trim() || undefined });
      }
      setEditingLog(null);
    }
  };

  const confirmDeleteLog = (id: string, isTodayLog: boolean) => {
    Alert.alert('Delete Entry', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => {
        removeLog(id);
        if (isTodayLog) removeTodayCompletion('weight');
      } }
    ]);
  };

  const getStatusMessage = () => {
    if (logs.length === 0) return "Your journey starts here.";
    if (currentWeight >= TARGET_MAX) return "Target range completed.";
    if (currentWeight >= TARGET_MIN) return "Minimum target reached.";
    if (currentWeight > baselineWeight) return "You're moving forward.";
    return "Log your next weigh-in to update your trend.";
  };

  const renderLineChart = () => {
    if (filteredLogs.length < 2) {
      return (
        <View style={styles.chartEmpty}>
          <Text style={styles.emptyText}>Keep logging your weight to build your trend.</Text>
        </View>
      );
    }

    const minWeight = Math.min(...filteredLogs.map(l => l.weightKg)) - 1;
    const maxWeight = Math.max(...filteredLogs.map(l => l.weightKg)) + 1;
    const range = maxWeight - minWeight;
    
    const width = 300;
    const height = 150;
    
    const points = filteredLogs.map((l, i) => {
      const x = (i / (filteredLogs.length - 1)) * width;
      const y = height - ((l.weightKg - minWeight) / range) * height;
      return `${x},${y}`;
    }).join(' ');

    return (
      <View style={{ height: 160, alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={width} height={height}>
          <Polyline points={points} fill="none" stroke={Colors.primary} strokeWidth="3" />
          {filteredLogs.map((l, i) => {
            const x = (i / (filteredLogs.length - 1)) * width;
            const y = height - ((l.weightKg - minWeight) / range) * height;
            return <Circle key={l.id} cx={x} cy={y} r="4" fill={Colors.surfaceHighlight} stroke={Colors.primary} strokeWidth="2" />;
          })}
        </Svg>
      </View>
    );
  };

  const renderMilestones = () => {
    return (
      <View style={styles.milestoneWrap}>
        <View style={styles.milestoneLine} />
        {MILESTONES.map((m) => {
          const reached = currentWeight >= m;
          return (
            <View key={m} style={styles.milestoneNodeWrap}>
              <View style={[styles.milestoneDot, reached && styles.milestoneDotReached]} />
              <Text style={[styles.milestoneText, reached && styles.milestoneTextReached]}>{m}</Text>
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <SafeScreen style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: Spacing.sm }}>
            <MaterialCommunityIcons name="arrow-left" size={28} color={Colors.textPrimary} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>WEIGHT</Text>
            <Text style={styles.headerSubtitle}>Track your progress, one step at a time.</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.iconBtn}>
          <MaterialCommunityIcons name="cog-outline" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Hero Card */}
        <Animated.View entering={FadeInDown.delay(100)}>
          <AppCard style={styles.heroCard}>
            <View style={styles.heroTopRow}>
              <ProgressRing progress={progressPercent} size={160} strokeWidth={12} color={Colors.primary} trackColor={Colors.surfaceHighlight} />
              <View style={styles.ringInner}>
                <Text style={styles.ringValue}>{currentWeight.toFixed(1)}</Text>
                <Text style={styles.ringLabel}>kg</Text>
              </View>
            </View>
            
            <View style={styles.heroStatusWrap}>
              <Text style={styles.heroTarget}>Target: {TARGET_MIN}–{TARGET_MAX} kg</Text>
              {remainingToMin > 0 ? (
                <Text style={styles.heroRemaining}>{remainingToMin.toFixed(1)} kg remaining to min target</Text>
              ) : (
                <Text style={styles.heroStatusSuccess}>{getStatusMessage()}</Text>
              )}
            </View>
          </AppCard>
        </Animated.View>

        {/* Quick Log CTA */}
        <Animated.View entering={FadeInDown.delay(150)} style={styles.section}>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => setShowLogModal(true)}>
            <MaterialCommunityIcons name="scale" size={20} color={Colors.background} style={{ marginRight: 8 }} />
            <Text style={styles.primaryBtnText}>LOG WEIGHT</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Chart */}
        <Animated.View entering={FadeInDown.delay(200)} style={styles.section}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>TREND</Text>
            <View style={styles.filterRow}>
              {['7D', '30D', '3M', 'ALL'].map(f => (
                <TouchableOpacity key={f} onPress={() => setChartFilter(f as any)} style={[styles.filterBtn, chartFilter === f && styles.filterBtnActive]}>
                  <Text style={[styles.filterText, chartFilter === f && styles.filterTextActive]}>{f}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <AppCard style={styles.chartCard}>
            {renderLineChart()}
            <View style={styles.trendRow}>
              <View style={styles.trendCol}>
                <Text style={styles.trendLabel}>Starting</Text>
                <Text style={styles.trendValue}>{baselineWeight.toFixed(1)} kg</Text>
              </View>
              <View style={styles.trendCol}>
                <Text style={styles.trendLabel}>Current</Text>
                <Text style={styles.trendValue}>{currentWeight.toFixed(1)} kg</Text>
              </View>
              <View style={styles.trendCol}>
                <Text style={styles.trendLabel}>Change</Text>
                <Text style={[styles.trendValue, { color: currentWeight >= baselineWeight ? Colors.success : Colors.danger }]}>
                  {currentWeight >= baselineWeight ? '+' : ''}{(currentWeight - baselineWeight).toFixed(1)} kg
                </Text>
              </View>
            </View>
          </AppCard>
        </Animated.View>

        {/* Milestones */}
        <Animated.View entering={FadeInDown.delay(250)} style={styles.section}>
          <Text style={styles.sectionTitle}>MILESTONES</Text>
          <AppCard style={styles.milestoneCard}>
            {renderMilestones()}
            <View style={styles.nextMilestoneRow}>
              <Text style={styles.nextMilestoneLabel}>Next: {nextMilestone} kg</Text>
              <Text style={styles.nextMilestoneRemaining}>{nextMilestoneRemaining.toFixed(1)} kg to go</Text>
            </View>
          </AppCard>
        </Animated.View>

        {/* Summaries */}
        <Animated.View entering={FadeInDown.delay(300)} style={styles.section}>
          <Text style={styles.sectionTitle}>SUMMARY</Text>
          <View style={styles.grid2}>
            <AppCard style={styles.summaryCard}>
              <Text style={styles.summaryOverline}>THIS WEEK</Text>
              <Text style={styles.summaryAvg}>{weekAvg ? weekAvg.toFixed(1) : '—'} <Text style={styles.summaryUnit}>kg avg</Text></Text>
              <Text style={styles.summaryDetail}>{weekLogs.length} weigh-ins</Text>
            </AppCard>
            <AppCard style={styles.summaryCard}>
              <Text style={styles.summaryOverline}>THIS MONTH</Text>
              <Text style={styles.summaryAvg}>{monthAvg ? monthAvg.toFixed(1) : '—'} <Text style={styles.summaryUnit}>kg avg</Text></Text>
              <Text style={styles.summaryDetail}>Change: {monthLogs.length ? (currentWeight - monthStartWeight).toFixed(1) : '—'} kg</Text>
            </AppCard>
          </View>
        </Animated.View>

        {/* History */}
        <Animated.View entering={FadeInDown.delay(350)} style={styles.section}>
          <Text style={styles.sectionTitle}>HISTORY</Text>
          <AppCard style={styles.historyCard}>
            {historyLogs.length === 0 ? (
              <Text style={styles.emptyText}>No weigh-ins recorded yet.</Text>
            ) : (
              historyLogs.map((log, index) => {
                const prevLog = historyLogs[index + 1];
                const change = prevLog ? (log.weightKg - prevLog.weightKg) : 0;
                const isPositive = change > 0;
                
                return (
                  <View key={log.id} style={styles.logRow}>
                    <View style={styles.logLeft}>
                      <Text style={styles.logDate}>{format(parseISO(log.date), 'MMM d, yyyy')}</Text>
                      {log.note && <Text style={styles.logNote}>{log.note}</Text>}
                    </View>
                    <View style={styles.logRight}>
                      <Text style={styles.logWeight}>{log.weightKg.toFixed(1)} kg</Text>
                      {prevLog && (
                        <Text style={[styles.logChange, { color: isPositive ? Colors.success : Colors.textMuted }]}>
                          {isPositive ? '+' : ''}{change.toFixed(1)}
                        </Text>
                      )}
                    </View>
                    <View style={styles.logActions}>
                      <TouchableOpacity onPress={() => {
                        setEditingLog(log);
                        setEditWeightStr(log.weightKg.toString());
                        setEditNoteStr(log.note || '');
                      }} style={styles.actionBtn}>
                        <MaterialCommunityIcons name="pencil" size={18} color={Colors.textSecondary} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => confirmDeleteLog(log.id, isSameDay(parseISO(log.date), new Date()))} style={styles.actionBtn}>
                        <MaterialCommunityIcons name="trash-can-outline" size={18} color={Colors.danger} />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}
          </AppCard>
        </Animated.View>
      </ScrollView>

      {/* Log Modal */}
      <Modal visible={showLogModal} onClose={() => setShowLogModal(false)} title="Log Weight">
        <View style={styles.modalField}>
          <Text style={styles.modalLabel}>Weight (kg)</Text>
          <InputField value={weightStr} onChangeText={setWeightStr} keyboardType="numeric" placeholder="e.g. 46.8" autoFocus />
        </View>
        <View style={styles.modalField}>
          <Text style={styles.modalLabel}>Note (Optional)</Text>
          <InputField value={noteStr} onChangeText={setNoteStr} placeholder="e.g. Morning weigh-in" />
        </View>
        <PrimaryCTA label="Save Weight" onPress={handleLogSubmit} />
      </Modal>

      {/* Edit Modal */}
      <Modal visible={!!editingLog} onClose={() => setEditingLog(null)} title="Edit Weight Log">
        <View style={styles.modalField}>
          <Text style={styles.modalLabel}>Weight (kg)</Text>
          <InputField value={editWeightStr} onChangeText={setEditWeightStr} keyboardType="numeric" placeholder="e.g. 46.8" autoFocus />
        </View>
        <View style={styles.modalField}>
          <Text style={styles.modalLabel}>Note (Optional)</Text>
          <InputField value={editNoteStr} onChangeText={setEditNoteStr} placeholder="e.g. Morning weigh-in" />
        </View>
        <PrimaryCTA label="Save Changes" onPress={handleEditSubmit} />
      </Modal>

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
  heroCard: { padding: Spacing.xxl, alignItems: 'center', backgroundColor: Colors.surfaceHighlight, marginBottom: Spacing.md },
  heroTopRow: { alignItems: 'center', justifyContent: 'center' },
  ringInner: { position: 'absolute', alignItems: 'center' },
  ringValue: { ...TextStyles.hero, color: Colors.textPrimary },
  ringLabel: { ...TextStyles.body, color: Colors.textSecondary },
  heroStatusWrap: { alignItems: 'center', marginTop: Spacing.lg },
  heroTarget: { ...TextStyles.h3, color: Colors.textPrimary, marginBottom: 4 },
  heroRemaining: { ...TextStyles.body, color: Colors.textSecondary },
  heroStatusSuccess: { ...TextStyles.body, color: Colors.success, fontWeight: '600' },
  primaryBtn: { backgroundColor: Colors.primary, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 14, borderRadius: Radius.md },
  primaryBtnText: { ...TextStyles.label, color: Colors.background, fontWeight: '700' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingRight: Spacing.sm },
  filterRow: { flexDirection: 'row', gap: Spacing.xs },
  filterBtn: { paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: Radius.sm },
  filterBtnActive: { backgroundColor: Colors.primary + '20' },
  filterText: { ...TextStyles.tiny, color: Colors.textSecondary },
  filterTextActive: { color: Colors.primary, fontWeight: '700' },
  chartCard: { padding: Spacing.lg },
  chartEmpty: { height: 160, justifyContent: 'center', alignItems: 'center' },
  emptyText: { ...TextStyles.body, color: Colors.textMuted, textAlign: 'center' },
  trendRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: Spacing.md },
  trendCol: { alignItems: 'center' },
  trendLabel: { ...TextStyles.caption, color: Colors.textSecondary },
  trendValue: { ...TextStyles.label, color: Colors.textPrimary, marginTop: 2 },
  milestoneCard: { padding: Spacing.xl },
  milestoneWrap: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: Spacing.md, position: 'relative' },
  milestoneLine: { position: 'absolute', top: 6, left: 0, right: 0, height: 2, backgroundColor: Colors.border, zIndex: 0 },
  milestoneNodeWrap: { alignItems: 'center', zIndex: 1 },
  milestoneDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: Colors.surface, borderWidth: 2, borderColor: Colors.border },
  milestoneDotReached: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  milestoneText: { ...TextStyles.tiny, color: Colors.textMuted, marginTop: 6 },
  milestoneTextReached: { color: Colors.primary, fontWeight: '700' },
  nextMilestoneRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.lg, paddingTop: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.border },
  nextMilestoneLabel: { ...TextStyles.label, color: Colors.textPrimary },
  nextMilestoneRemaining: { ...TextStyles.caption, color: Colors.textSecondary },
  grid2: { flexDirection: 'row', gap: Spacing.md },
  summaryCard: { flex: 1, padding: Spacing.md },
  summaryOverline: { ...TextStyles.overline, color: Colors.textSecondary, marginBottom: Spacing.xs },
  summaryAvg: { ...TextStyles.h3, color: Colors.textPrimary },
  summaryUnit: { ...TextStyles.caption, color: Colors.textSecondary },
  summaryDetail: { ...TextStyles.tiny, color: Colors.textMuted, marginTop: 4 },
  historyCard: { padding: Spacing.md },
  logRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
  logLeft: { flex: 1 },
  logDate: { ...TextStyles.body, color: Colors.textPrimary },
  logNote: { ...TextStyles.caption, color: Colors.textSecondary, marginTop: 2 },
  logRight: { alignItems: 'flex-end', marginRight: Spacing.sm },
  logWeight: { ...TextStyles.label, color: Colors.textPrimary },
  logChange: { ...TextStyles.tiny, marginTop: 2 },
  logActions: { flexDirection: 'row', gap: Spacing.xs },
  actionBtn: { padding: Spacing.xs },
  modalField: { marginBottom: Spacing.lg },
  modalLabel: { ...TextStyles.label, color: Colors.textSecondary, marginBottom: Spacing.sm }
});
