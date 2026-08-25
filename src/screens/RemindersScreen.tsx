import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeScreen } from '@/components/layout/SafeScreen';
import { AppCard } from '@/components/common/AppCard';
import { ReminderRow } from '@/components/common/ReminderRow';
import { ReminderEditorModal } from '@/components/reminders/ReminderEditorModal';
import { Colors, Spacing, TextStyles, Radius } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useReminderStore, useTaskStore } from '@/store';
import { Reminder, ReminderCategory, ReminderFrequency } from '@/models/Reminder';
import { format, isBefore, isAfter, parse, differenceInSeconds } from 'date-fns';
import Animated, { FadeIn, FadeInDown, Layout } from 'react-native-reanimated';
import { requestNotificationPermissions, scheduleNotification } from '@/services/notifications';

type FilterType = 'All' | 'Active' | 'Today' | 'Upcoming' | 'Disabled' | 'Finance' | 'Health' | 'Productivity';

export function RemindersScreen() {
  const navigation = useNavigation();
  const { reminders, toggleReminder, addReminder, updateReminder, removeReminder } = useReminderStore();
  const { tasks } = useTaskStore();
  
  const [filter, setFilter] = useState<FilterType>('All');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [permissionsGranted, setPermissionsGranted] = useState(true);
  
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Check permissions on mount
    requestNotificationPermissions().then(granted => setPermissionsGranted(granted));
    
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Compute next reminder for Hero Card
  const nextReminder = useMemo(() => {
    const activeReminders = reminders.filter(r => r.enabled);
    
    // Sort all upcoming today
    const todayUpcoming = activeReminders.filter(r => {
      if (r.frequency === 'once' && r.date && r.date < format(currentTime, 'yyyy-MM-dd')) return false;
      const rTime = parse(r.time, 'HH:mm', currentTime);
      return isAfter(rTime, currentTime);
    }).sort((a, b) => a.time.localeCompare(b.time));

    return todayUpcoming[0] || null;
  }, [reminders, currentTime]);

  const countdownStr = useMemo(() => {
    if (!nextReminder) return null;
    const rTime = parse(nextReminder.time, 'HH:mm', currentTime);
    const diff = differenceInSeconds(rTime, currentTime);
    if (diff <= 0) return 'Now';
    const h = Math.floor(diff / 3600);
    const m = Math.floor((diff % 3600) / 60);
    if (h > 0) return `in ${h}h ${m}m`;
    return `in ${m}m`;
  }, [nextReminder, currentTime]);

  // Combine native reminders and task reminders for display
  const displayData = useMemo(() => {
    const allItems: Reminder[] = [...reminders];
    
    // Merge tasks as linked reminders
    tasks.forEach(t => {
      if (t.reminder && !t.completed) {
        allItems.push({
          id: `task-${t.id}`,
          type: 'custom',
          title: t.title,
          subtitle: `Task • ${t.category.toUpperCase()}`,
          time: t.time || '09:00',
          date: t.date,
          frequency: 'once',
          enabled: true,
          icon: 'checkbox-marked-circle-outline',
          color: Colors.primary,
          order: 999,
          category: 'tasks',
          createdAt: t.createdAt,
          updatedAt: t.updatedAt,
        });
      }
    });

    return allItems;
  }, [reminders, tasks]);

  // Filter sections
  const sections = useMemo(() => {
    let result: { title: string; data: Reminder[] }[] = [];
    
    const nowTimeStr = format(currentTime, 'HH:mm');
    const todayStr = format(currentTime, 'yyyy-MM-dd');

    const filtered = displayData.filter(r => {
      if (filter === 'Active') return r.enabled;
      if (filter === 'Disabled') return !r.enabled;
      if (filter === 'Today') return r.frequency !== 'once' || (r.date === todayStr);
      if (filter === 'Upcoming') return r.frequency === 'once' && r.date && r.date > todayStr;
      if (filter === 'Finance') return ['finance', 'sip', 'savings', 'budget_review'].includes(r.category);
      if (filter === 'Health') return ['routine', 'water', 'gym', 'nutrition', 'sleep'].includes(r.category);
      if (filter === 'Productivity') return ['tasks', 'study', 'college'].includes(r.category);
      return true;
    });

    const activeToday = filtered.filter(r => r.enabled && (r.frequency !== 'once' || r.date === todayStr));
    const disabled = filtered.filter(r => !r.enabled);
    const completed = filtered.filter(r => r.frequency === 'once' && r.date && r.date < todayStr);

    if (activeToday.length) result.push({ title: 'TODAY', data: activeToday.sort((a,b) => a.time.localeCompare(b.time)) });
    if (disabled.length) result.push({ title: 'DISABLED', data: disabled.sort((a,b) => a.time.localeCompare(b.time)) });
    if (completed.length) result.push({ title: 'COMPLETED', data: completed });

    return result;
  }, [displayData, filter, currentTime]);

  const scheduleReminderNotification = async (reminder: Reminder) => {
    if (!permissionsGranted) return undefined;
    
    const rTime = parse(reminder.time, 'HH:mm', new Date());
    if (isBefore(rTime, new Date())) {
      // If it's daily, schedule for tomorrow
      if (reminder.frequency === 'daily') {
        rTime.setDate(rTime.getDate() + 1);
      } else {
        return undefined; // passed today, or one-off passed
      }
    }
    
    const id = await scheduleNotification({
      title: reminder.title,
      body: reminder.notes || `Category: ${reminder.category?.toUpperCase()}`,
      trigger: rTime,
      channelId: 'reminders',
      data: { reminderId: reminder.id, destination: reminder.category === 'water' ? 'water' : 'reminders' },
    });
    return id || undefined;
  };

  const handleSave = async (partial: Partial<Reminder>) => {
    if (editingReminder) {
      if (editingReminder.id.startsWith('task-')) {
        Alert.alert('Task Reminder', 'Please edit this reminder directly from the Tasks screen to keep it perfectly synced.');
        return;
      }
      
      const newReminder = { ...editingReminder, ...partial } as Reminder;
      if (newReminder.enabled) {
        newReminder.notificationId = await scheduleReminderNotification(newReminder);
      }
      await updateReminder(editingReminder.id, partial);
    } else {
      const newReminder: Reminder = {
        id: `rem-${Date.now()}`,
        type: 'custom',
        title: partial.title || 'Untitled',
        notes: partial.notes,
        category: partial.category || 'other',
        time: partial.time || '09:00',
        date: partial.date,
        frequency: partial.frequency || 'once',
        enabled: true,
        icon: 'bell-ring',
        color: Colors.primary,
        order: reminders.length,
        sound: partial.sound,
        vibration: partial.vibration,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      newReminder.notificationId = await scheduleReminderNotification(newReminder);
      await addReminder(newReminder);
    }
  };

  const handleDelete = (id: string) => {
    if (id.startsWith('task-')) {
      Alert.alert('Task Reminder', 'Delete the parent task in the Tasks screen to remove this reminder.');
      return;
    }
    removeReminder(id);
  };

  const openTemplate = (template: Partial<Reminder>) => {
    setEditingReminder({
      id: '', type: 'custom', title: '', time: '09:00', frequency: 'daily', enabled: true, icon: 'bell', color: Colors.primary, order: 0, category: 'other', createdAt: '', updatedAt: '', ...template
    } as any);
    setModalVisible(true);
  };

  return (
    <SafeScreen style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: Spacing.sm }}>
            <MaterialCommunityIcons name="arrow-left" size={28} color={Colors.textPrimary} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>REMINDERS</Text>
            <Text style={styles.headerSubtitle}>Stay ahead of your day.</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.iconBtn} onPress={() => { setEditingReminder(null); setModalVisible(true); }}>
          <MaterialCommunityIcons name="plus" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {!permissionsGranted && (
        <View style={styles.permissionWarning}>
          <MaterialCommunityIcons name="alert-circle-outline" size={20} color={Colors.warning} />
          <Text style={styles.permissionText}>Notifications are disabled. Enable them in settings to receive reminders.</Text>
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Next Reminder Hero */}
        <Animated.View entering={FadeInDown.delay(100)}>
          <AppCard style={styles.heroCard}>
            <Text style={styles.heroLabel}>NEXT UP</Text>
            {nextReminder ? (
              <>
                <Text style={styles.heroTime}>{format(parse(nextReminder.time, 'HH:mm', new Date()), 'h:mm a')}</Text>
                <Text style={styles.heroTitle}>{nextReminder.title}</Text>
                <Text style={styles.heroSubtitle}>{nextReminder.subtitle || nextReminder.category?.toUpperCase()}</Text>
                <View style={styles.heroCountdownBadge}>
                  <Text style={styles.heroCountdownText}>{countdownStr}</Text>
                </View>
              </>
            ) : (
              <Text style={styles.heroEmpty}>You're all clear.</Text>
            )}
          </AppCard>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View entering={FadeInDown.delay(150)}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickScroll}>
            <TouchableOpacity style={styles.quickChip} onPress={() => openTemplate({ title: 'Drink Water', category: 'water', icon: 'cup-water', frequency: 'daily' })}>
              <MaterialCommunityIcons name="cup-water" size={16} color={Colors.water} /><Text style={styles.quickText}>Water</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickChip} onPress={() => openTemplate({ title: 'Gym Workout', category: 'gym', icon: 'dumbbell', frequency: 'daily' })}>
              <MaterialCommunityIcons name="dumbbell" size={16} color={Colors.success} /><Text style={styles.quickText}>Gym</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickChip} onPress={() => openTemplate({ title: 'Study', category: 'study', icon: 'book-open-variant', frequency: 'weekdays' })}>
              <MaterialCommunityIcons name="book-open-variant" size={16} color={Colors.primary} /><Text style={styles.quickText}>Study</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickChip} onPress={() => openTemplate({ title: 'SIP Reminder', category: 'sip', icon: 'trending-up', frequency: 'monthly' })}>
              <MaterialCommunityIcons name="trending-up" size={16} color={Colors.warning} /><Text style={styles.quickText}>SIP</Text>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>

        {/* Filters */}
        <Animated.View entering={FadeInDown.delay(200)} style={styles.filterWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            {(['All', 'Active', 'Today', 'Disabled', 'Health', 'Finance', 'Productivity'] as FilterType[]).map((f) => (
               <TouchableOpacity key={f} onPress={() => setFilter(f)} style={[styles.filterBtn, filter === f && styles.filterBtnActive]}>
                 <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
               </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Reminder List */}
        <Animated.View entering={FadeInDown.delay(300)}>
          {sections.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="bell-off-outline" size={48} color={Colors.border} style={{ marginBottom: Spacing.md }} />
              <Text style={styles.emptyText}>No reminders found.</Text>
            </View>
          ) : (
            sections.map((section) => (
              <Animated.View key={section.title} layout={Layout.springify()}>
                <Text style={styles.sectionHeader}>{section.title}</Text>
                {section.data.map((rem) => (
                  <Animated.View key={rem.id} layout={Layout.springify()}>
                    <ReminderRow
                      reminder={rem}
                      onToggle={rem.id.startsWith('task-') ? () => Alert.alert('Task Reminder', 'Toggle this directly in the Tasks screen.') : toggleReminder}
                      onPress={rem.id.startsWith('task-') ? () => Alert.alert('Task Reminder', 'Edit this directly in the Tasks screen.') : () => { setEditingReminder(rem); setModalVisible(true); }}
                    />
                  </Animated.View>
                ))}
              </Animated.View>
            ))
          )}
        </Animated.View>
      </ScrollView>

      <ReminderEditorModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        reminder={editingReminder}
        onSave={handleSave}
        onDelete={handleDelete}
      />
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
  permissionWarning: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surfaceHighlight, padding: Spacing.md, marginHorizontal: Spacing.lg, borderRadius: Radius.md, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  permissionText: { ...TextStyles.caption, color: Colors.textPrimary, marginLeft: Spacing.sm, flex: 1 },
  scrollContent: { paddingBottom: Spacing.xxl, paddingHorizontal: Spacing.lg },
  heroCard: { padding: Spacing.xl, marginBottom: Spacing.lg, backgroundColor: Colors.surfaceHighlight, alignItems: 'center' },
  heroLabel: { ...TextStyles.overline, color: Colors.textSecondary, letterSpacing: 1.5, marginBottom: Spacing.sm },
  heroTime: { ...TextStyles.display, color: Colors.primary, marginBottom: 4 },
  heroTitle: { ...TextStyles.h3, color: Colors.textPrimary, marginBottom: 4 },
  heroSubtitle: { ...TextStyles.caption, color: Colors.textSecondary, marginBottom: Spacing.md },
  heroCountdownBadge: { backgroundColor: Colors.primaryMuted, paddingHorizontal: Spacing.md, paddingVertical: 4, borderRadius: Radius.full },
  heroCountdownText: { ...TextStyles.badge, color: Colors.primary, fontWeight: '700' },
  heroEmpty: { ...TextStyles.body, color: Colors.textMuted, marginTop: Spacing.sm },
  quickScroll: { gap: Spacing.sm, paddingRight: Spacing.xl },
  quickChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border },
  quickText: { ...TextStyles.bodySmall, color: Colors.textPrimary, marginLeft: Spacing.xs, fontWeight: '500' },
  filterWrapper: { marginTop: Spacing.lg, marginBottom: Spacing.md },
  filterScroll: { paddingRight: Spacing.xl, gap: Spacing.sm },
  filterBtn: { paddingHorizontal: Spacing.md, paddingVertical: 8, borderRadius: Radius.full, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  filterBtnActive: { backgroundColor: Colors.primaryMuted, borderColor: Colors.primary },
  filterText: { ...TextStyles.bodySmall, color: Colors.textSecondary, fontWeight: '500' },
  filterTextActive: { color: Colors.primary, fontWeight: '700' },
  sectionHeader: { ...TextStyles.overline, color: Colors.textMuted, marginBottom: Spacing.sm, marginTop: Spacing.md, letterSpacing: 1.5 },
  emptyState: { padding: Spacing.xxl, alignItems: 'center', justifyContent: 'center' },
  emptyText: { ...TextStyles.body, color: Colors.textPrimary, fontWeight: '500' },
});
