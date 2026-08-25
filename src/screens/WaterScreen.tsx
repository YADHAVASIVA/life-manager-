import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeScreen } from '@/components/layout/SafeScreen';
import { AppCard } from '@/components/common/AppCard';
import { ProgressRing } from '@/components/common/ProgressRing';
import { Colors, Spacing, TextStyles, Radius } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useWaterStore, useStreakStore, useReminderStore } from '@/store';
import { format, parseISO, isSameDay } from 'date-fns';
import Animated, { FadeInDown, FadeOutDown, Layout } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { Modal } from '@/components/common/Modal';
import { InputField } from '@/components/common/InputField';
import { PrimaryCTA } from '@/components/common/PrimaryCTA';
import { WaterLog } from '@/models/Water';

export function WaterScreen() {
  const navigation = useNavigation();
  const { logs, todayTargetML, getTodayTotal, logWater, removeLog, editLog } = useWaterStore();
  const { markCompleted, removeTodayCompletion, getStreak } = useStreakStore();
  const { reminders } = useReminderStore();

  const [undoLogId, setUndoLogId] = useState<string | null>(null);
  
  // Custom Add State
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customAmountStr, setCustomAmountStr] = useState('');

  // Edit Log State
  const [editingLog, setEditingLog] = useState<WaterLog | null>(null);
  const [editAmountStr, setEditAmountStr] = useState('');

  // Data
  const todayTotalML = getTodayTotal();
  const progressPercent = Math.min(100, Math.round((todayTotalML / todayTargetML) * 100));
  const remainingML = Math.max(0, todayTargetML - todayTotalML);

  const todayLogs = useMemo(() => {
    return logs.filter(l => l.timestamp.startsWith(format(new Date(), 'yyyy-MM-dd')))
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }, [logs]);

  // Handle Streak Sync
  useEffect(() => {
    if (todayTotalML >= todayTargetML && todayTargetML > 0) {
      markCompleted('water');
    } else {
      removeTodayCompletion('water');
    }
  }, [todayTotalML, todayTargetML, markCompleted, removeTodayCompletion]);

  // Handle Undo timer
  useEffect(() => {
    if (undoLogId) {
      const timer = setTimeout(() => setUndoLogId(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [undoLogId]);

  const handleAddWater = async (amount: number, source: string = 'quick') => {
    if (amount <= 0) return;
    const initialLogsLength = logs.length;
    await logWater(amount, source);
    // Grab the newly created log id to allow undo
    const newLogs = useWaterStore.getState().logs;
    if (newLogs.length > initialLogsLength) {
      setUndoLogId(newLogs[newLogs.length - 1].id);
    }
  };

  const handleUndo = () => {
    if (undoLogId) {
      removeLog(undoLogId);
      setUndoLogId(null);
    }
  };

  const handleCustomAdd = () => {
    const amount = parseInt(customAmountStr, 10);
    if (!isNaN(amount) && amount > 0) {
      handleAddWater(amount, 'custom');
      setShowCustomModal(false);
      setCustomAmountStr('');
    }
  };

  const handleSaveEdit = () => {
    if (editingLog) {
      const amount = parseInt(editAmountStr, 10);
      if (!isNaN(amount) && amount > 0) {
        editLog(editingLog.id, { amountML: amount });
      }
      setEditingLog(null);
    }
  };

  const confirmDeleteLog = (id: string) => {
    Alert.alert('Delete Entry', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => removeLog(id) }
    ]);
  };

  const getStatusMessage = () => {
    if (todayTotalML === 0) return "Start your hydration journey.";
    if (progressPercent < 25) return "Let's get started.";
    if (progressPercent < 50) return "Good start.";
    if (progressPercent < 75) return "You're on track.";
    if (progressPercent < 100) return "Almost there.";
    return "Daily goal reached.";
  };

  // History & Consistency
  const streakData = getStreak('water');
  
  // Chart calculation (last 7 days)
  const chartData = useMemo(() => {
    const days = [];
    const today = new Date();
    let daysReached = 0;
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = format(d, 'yyyy-MM-dd');
      const label = format(d, 'EE');
      
      const dayTotal = logs.filter(l => l.timestamp.startsWith(dateStr))
                           .reduce((sum, l) => sum + l.amountML, 0);
      
      if (dayTotal >= todayTargetML) daysReached++;
      
      days.push({ label, amount: dayTotal });
    }
    return { days, daysReached };
  }, [logs, todayTargetML]);

  const maxChartVal = Math.max(todayTargetML, ...chartData.days.map(d => d.amount));

  // Water Reminders
  const waterReminders = reminders.filter(r => r.category === 'water');

  return (
    <SafeScreen style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: Spacing.sm }}>
            <MaterialCommunityIcons name="arrow-left" size={28} color={Colors.textPrimary} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>HYDRATION</Text>
            <Text style={styles.headerSubtitle}>Stay hydrated. Stay consistent.</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.iconBtn} onPress={() => Alert.alert('Settings', 'Water settings placeholder')}>
          <MaterialCommunityIcons name="cog-outline" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Hero Card */}
        <Animated.View entering={FadeInDown.delay(100)}>
          <AppCard style={styles.heroCard}>
            <View style={styles.heroTopRow}>
              <ProgressRing progress={progressPercent} size={160} strokeWidth={12} color={Colors.water} trackColor={Colors.surfaceHighlight} />
              <View style={styles.ringInner}>
                <Text style={styles.ringValue}>{(todayTotalML / 1000).toFixed(1)} L</Text>
                <Text style={styles.ringLabel}>of {(todayTargetML / 1000).toFixed(1)} L</Text>
              </View>
            </View>
            
            <View style={styles.heroStatusWrap}>
              <Text style={styles.heroPercent}>{progressPercent}%</Text>
              <Text style={styles.heroStatus}>{getStatusMessage()}</Text>
            </View>
          </AppCard>
        </Animated.View>

        {/* Quick Add */}
        <Animated.View entering={FadeInDown.delay(150)}>
          <Text style={styles.sectionTitle}>QUICK ADD</Text>
          <View style={styles.quickAddRow}>
            {[250, 300, 500].map(amt => (
              <TouchableOpacity key={amt} style={styles.quickBtn} onPress={() => handleAddWater(amt)}>
                <MaterialCommunityIcons name="cup-water" size={24} color={Colors.water} />
                <Text style={styles.quickBtnText}>+{amt} ml</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.quickBtnCustom} onPress={() => setShowCustomModal(true)}>
              <MaterialCommunityIcons name="plus" size={24} color={Colors.textPrimary} />
              <Text style={styles.quickBtnTextCustom}>Custom</Text>
            </TouchableOpacity>
          </View>

          {undoLogId && (
            <Animated.View entering={FadeInDown} exiting={FadeOutDown} style={styles.undoWrap}>
              <Text style={styles.undoText}>Water added</Text>
              <TouchableOpacity style={styles.undoBtn} onPress={handleUndo}>
                <Text style={styles.undoBtnText}>UNDO</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </Animated.View>

        {/* Today's Progress Details */}
        <Animated.View entering={FadeInDown.delay(200)}>
          <AppCard style={styles.detailsCard}>
            <View style={styles.detailCol}>
              <Text style={styles.detailLabel}>Consumed</Text>
              <Text style={styles.detailValue}>{(todayTotalML / 1000).toFixed(1)} L</Text>
            </View>
            <View style={styles.detailLine} />
            <View style={styles.detailCol}>
              <Text style={styles.detailLabel}>Remaining</Text>
              <Text style={styles.detailValue}>{(remainingML / 1000).toFixed(1)} L</Text>
            </View>
            <View style={styles.detailLine} />
            <View style={styles.detailCol}>
              <Text style={styles.detailLabel}>Target</Text>
              <Text style={styles.detailValue}>{(todayTargetML / 1000).toFixed(1)} L</Text>
            </View>
          </AppCard>
        </Animated.View>

        {/* Today's Timeline */}
        <Animated.View entering={FadeInDown.delay(250)} style={styles.section}>
          <Text style={styles.sectionTitle}>TODAY'S TIMELINE</Text>
          <AppCard style={styles.timelineCard}>
            {todayLogs.length === 0 ? (
              <Text style={styles.emptyText}>0 ml logged today.</Text>
            ) : (
              todayLogs.map((log) => (
                <View key={log.id} style={styles.logRow}>
                  <Text style={styles.logTime}>{format(parseISO(log.timestamp), 'h:mm a')}</Text>
                  <View style={styles.logMain}>
                    <Text style={styles.logAmount}>{log.amountML} ml</Text>
                    {log.source !== 'custom' && <Text style={styles.logSource}>({log.source})</Text>}
                  </View>
                  <View style={styles.logActions}>
                    <TouchableOpacity onPress={() => { setEditAmountStr(log.amountML.toString()); setEditingLog(log); }} style={styles.actionBtn}>
                      <MaterialCommunityIcons name="pencil" size={18} color={Colors.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => confirmDeleteLog(log.id)} style={styles.actionBtn}>
                      <MaterialCommunityIcons name="trash-can-outline" size={18} color={Colors.danger} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </AppCard>
        </Animated.View>

        {/* History & Consistency */}
        <Animated.View entering={FadeInDown.delay(300)} style={styles.section}>
          <Text style={styles.sectionTitle}>7-DAY HISTORY</Text>
          <AppCard style={styles.chartCard}>
            <View style={styles.chartArea}>
              {chartData.days.map((d, i) => (
                <View key={i} style={styles.chartBarWrap}>
                  <View style={styles.chartBarBg}>
                    <View style={[styles.chartBarFill, { height: `${Math.min(100, (d.amount / maxChartVal) * 100)}%`, backgroundColor: d.amount >= todayTargetML ? Colors.water : Colors.water + '80' }]} />
                  </View>
                  <Text style={styles.chartLabel}>{d.label}</Text>
                </View>
              ))}
            </View>
            <View style={styles.chartFooter}>
              <View style={styles.chartStat}>
                <Text style={styles.chartStatValue}>{chartData.daysReached} <Text style={styles.chartStatUnit}>/ 7</Text></Text>
                <Text style={styles.chartStatLabel}>Goal Days</Text>
              </View>
              <View style={styles.chartStat}>
                <Text style={styles.chartStatValue}>{streakData?.currentStreak || 0} <Text style={styles.chartStatUnit}>days</Text></Text>
                <Text style={styles.chartStatLabel}>Current Streak</Text>
              </View>
            </View>
          </AppCard>
        </Animated.View>

        {/* Reminders */}
        <Animated.View entering={FadeInDown.delay(350)} style={styles.section}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>WATER REMINDERS</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Reminders' as never)}>
              <Text style={styles.linkText}>Manage</Text>
            </TouchableOpacity>
          </View>
          <AppCard style={styles.reminderCard}>
            {waterReminders.length === 0 ? (
              <Text style={styles.emptyText}>No water reminders set.</Text>
            ) : (
              waterReminders.map(r => (
                <View key={r.id} style={styles.remRow}>
                  <MaterialCommunityIcons name={r.icon as any} size={20} color={r.enabled ? Colors.water : Colors.textMuted} />
                  <Text style={[styles.remTitle, !r.enabled && { color: Colors.textMuted }]}>{r.time} • {r.frequency}</Text>
                  <View style={[styles.badge, { backgroundColor: r.enabled ? Colors.water + '20' : Colors.surfaceHighlight }]}>
                    <Text style={[styles.badgeText, { color: r.enabled ? Colors.water : Colors.textMuted }]}>{r.enabled ? 'ON' : 'OFF'}</Text>
                  </View>
                </View>
              ))
            )}
          </AppCard>
        </Animated.View>
      </ScrollView>

      {/* Custom Add Modal */}
      <Modal visible={showCustomModal} onClose={() => setShowCustomModal(false)} title="Custom Amount">
        <View style={{ marginBottom: Spacing.xl }}>
          <Text style={styles.modalLabel}>Amount (ml)</Text>
          <InputField value={customAmountStr} onChangeText={setCustomAmountStr} keyboardType="numeric" placeholder="e.g. 150" autoFocus />
        </View>
        <PrimaryCTA label="Add Water" onPress={handleCustomAdd} />
      </Modal>

      {/* Edit Log Modal */}
      <Modal visible={!!editingLog} onClose={() => setEditingLog(null)} title="Edit Water Log">
        <View style={{ marginBottom: Spacing.xl }}>
          <Text style={styles.modalLabel}>Amount (ml)</Text>
          <InputField value={editAmountStr} onChangeText={setEditAmountStr} keyboardType="numeric" placeholder="e.g. 250" autoFocus />
        </View>
        <PrimaryCTA label="Save Changes" onPress={handleSaveEdit} />
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
  heroPercent: { ...TextStyles.h2, color: Colors.water, marginBottom: 4 },
  heroStatus: { ...TextStyles.body, color: Colors.textPrimary, fontWeight: '500' },
  quickAddRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  quickBtn: { flex: 1, minWidth: '45%', backgroundColor: Colors.water + '18', padding: Spacing.md, borderRadius: Radius.md, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', borderWidth: 1, borderColor: Colors.water + '30' },
  quickBtnText: { ...TextStyles.label, color: Colors.water, marginLeft: Spacing.sm },
  quickBtnCustom: { flex: 1, minWidth: '45%', backgroundColor: Colors.surface, padding: Spacing.md, borderRadius: Radius.md, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border },
  quickBtnTextCustom: { ...TextStyles.label, color: Colors.textPrimary, marginLeft: Spacing.sm },
  undoWrap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.surfaceElevated, padding: Spacing.md, borderRadius: Radius.md, marginTop: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  undoText: { ...TextStyles.body, color: Colors.textPrimary },
  undoBtn: { paddingHorizontal: Spacing.md, paddingVertical: 6, backgroundColor: Colors.surfaceHighlight, borderRadius: Radius.sm },
  undoBtnText: { ...TextStyles.label, color: Colors.textPrimary },
  detailsCard: { flexDirection: 'row', justifyContent: 'space-between', padding: Spacing.lg, marginTop: Spacing.xl },
  detailCol: { alignItems: 'center' },
  detailLine: { width: 1, backgroundColor: Colors.border },
  detailLabel: { ...TextStyles.caption, color: Colors.textSecondary, marginBottom: 4 },
  detailValue: { ...TextStyles.h3, color: Colors.textPrimary },
  timelineCard: { padding: Spacing.md },
  emptyText: { ...TextStyles.body, color: Colors.textMuted, textAlign: 'center', padding: Spacing.md },
  logRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md12, borderBottomWidth: 1, borderBottomColor: Colors.border },
  logTime: { ...TextStyles.bodySmall, color: Colors.textMuted, width: 70 },
  logMain: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  logAmount: { ...TextStyles.body, color: Colors.textPrimary, fontWeight: '500' },
  logSource: { ...TextStyles.caption, color: Colors.textMuted, marginLeft: Spacing.sm },
  logActions: { flexDirection: 'row', gap: Spacing.sm },
  actionBtn: { padding: 4 },
  chartCard: { padding: Spacing.lg },
  chartArea: { flexDirection: 'row', justifyContent: 'space-between', height: 120, alignItems: 'flex-end', borderBottomWidth: 1, borderBottomColor: Colors.border, paddingBottom: Spacing.sm, marginBottom: Spacing.md },
  chartBarWrap: { alignItems: 'center', width: '12%' },
  chartBarBg: { width: '100%', height: 100, justifyContent: 'flex-end', backgroundColor: Colors.surfaceHighlight, borderRadius: Radius.sm, overflow: 'hidden' },
  chartBarFill: { width: '100%', borderRadius: Radius.sm },
  chartLabel: { ...TextStyles.tiny, color: Colors.textSecondary, marginTop: Spacing.xs },
  chartFooter: { flexDirection: 'row', justifyContent: 'space-around' },
  chartStat: { alignItems: 'center' },
  chartStatValue: { ...TextStyles.h3, color: Colors.textPrimary },
  chartStatUnit: { ...TextStyles.caption, color: Colors.textSecondary },
  chartStatLabel: { ...TextStyles.tiny, color: Colors.textMuted, marginTop: 2, textTransform: 'uppercase' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingRight: Spacing.sm },
  linkText: { ...TextStyles.label, color: Colors.primary },
  reminderCard: { padding: Spacing.md },
  remRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.sm },
  remTitle: { ...TextStyles.body, color: Colors.textPrimary, flex: 1, marginLeft: Spacing.sm },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radius.sm },
  badgeText: { ...TextStyles.tiny, fontWeight: '700' },
  modalLabel: { ...TextStyles.label, color: Colors.textSecondary, marginBottom: Spacing.sm }
});
