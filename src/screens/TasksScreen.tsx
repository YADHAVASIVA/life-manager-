import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { SafeScreen } from '@/components/layout/SafeScreen';
import { AppCard } from '@/components/common/AppCard';
import { TaskRow } from '@/components/common/TaskRow';
import { TaskEditorModal } from '@/components/tasks/TaskEditorModal';
import { Colors, Spacing, TextStyles, Radius } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTaskStore, useStreakStore } from '@/store';
import { Task } from '@/models/Task';
import { format, isBefore, isAfter, isToday, parse } from 'date-fns';
import Animated, { FadeIn, FadeInDown, Layout } from 'react-native-reanimated';

type FilterType = 'All' | 'Today' | 'Upcoming' | 'Completed' | 'Overdue';

export function TasksScreen() {
  const { tasks, toggleComplete, removeTask, updateTask, addTask } = useTaskStore();
  const [filter, setFilter] = useState<FilterType>('Today');
  
  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Computations
  const now = new Date();
  const todayStr = format(now, 'yyyy-MM-dd');
  const nowTime = format(now, 'HH:mm');

  const {
    todayTasks,
    upcomingTasks,
    overdueTasks,
    completedTasks,
  } = useMemo(() => {
    const today: Task[] = [];
    const upcoming: Task[] = [];
    const overdue: Task[] = [];
    const completed: Task[] = [];

    tasks.forEach(t => {
      // Apply search filter if active
      if (searchQuery) {
        const match = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                      t.notes?.toLowerCase().includes(searchQuery.toLowerCase());
        if (!match) return;
      }

      if (t.completed) {
        completed.push(t);
        return;
      }

      if (t.date < todayStr) {
        overdue.push(t);
      } else if (t.date === todayStr) {
        // If it has a time and time is past, it's overdue
        if (t.time && t.time < nowTime) {
          overdue.push(t);
        } else {
          today.push(t);
        }
      } else {
        upcoming.push(t);
      }
    });

    // Sort by time ascending
    const sortByTime = (a: Task, b: Task) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      if (a.time && b.time) return a.time.localeCompare(b.time);
      if (a.time) return -1;
      if (b.time) return 1;
      return 0;
    };

    return {
      todayTasks: today.sort(sortByTime),
      upcomingTasks: upcoming.sort(sortByTime),
      overdueTasks: overdue.sort(sortByTime),
      completedTasks: completed.sort((a, b) => (b.completedAt || '').localeCompare(a.completedAt || '')),
    };
  }, [tasks, nowTime, todayStr, searchQuery]);

  // Today Summary Stats (calculated ignoring search)
  const todayAllTasks = tasks.filter(t => t.date === todayStr);
  const todayCompleted = todayAllTasks.filter(t => t.completed).length;
  const todayRemaining = todayAllTasks.length - todayCompleted;
  const progressPercent = todayAllTasks.length > 0 ? Math.round((todayCompleted / todayAllTasks.length) * 100) : 0;

  const { getStreak, markCompleted } = useStreakStore();
  const taskStreak = getStreak('tasks');

  // Streak update logic: If all tasks for today are complete and there's at least one task
  useEffect(() => {
    if (todayAllTasks.length > 0 && todayCompleted === todayAllTasks.length) {
      markCompleted('tasks');
    }
  }, [todayCompleted, todayAllTasks.length, markCompleted]);

  // Filter logic
  const sections = useMemo(() => {
    let result: { title: string; data: Task[] }[] = [];
    
    if (filter === 'All' || filter === 'Overdue') {
      if (overdueTasks.length) result.push({ title: 'OVERDUE', data: overdueTasks });
    }
    if (filter === 'All' || filter === 'Today') {
      if (todayTasks.length) result.push({ title: 'TODAY', data: todayTasks });
    }
    if (filter === 'All' || filter === 'Upcoming') {
      if (upcomingTasks.length) result.push({ title: 'UPCOMING', data: upcomingTasks });
    }
    if (filter === 'All' || filter === 'Completed') {
      if (completedTasks.length) result.push({ title: 'COMPLETED', data: completedTasks });
    }

    return result;
  }, [filter, todayTasks, upcomingTasks, overdueTasks, completedTasks]);

  // Handlers
  const handleSaveTask = async (partial: Partial<Task>) => {
    if (editingTask) {
      await updateTask(editingTask.id, partial);
    } else {
      const newTask: Task = {
        id: `task-${Date.now()}`,
        title: partial.title || 'Untitled Task',
        date: partial.date || todayStr,
        time: partial.time,
        category: partial.category || 'personal',
        priority: partial.priority || 'medium',
        repeat: partial.repeat || 'none',
        reminder: partial.reminder || false,
        notes: partial.notes,
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await addTask(newTask);
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setModalVisible(true);
  };

  const handleAdd = () => {
    setEditingTask(null);
    setModalVisible(true);
  };

  const handleDelete = (id: string) => {
    removeTask(id);
  };

  return (
    <SafeScreen style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>TASKS</Text>
          <Text style={styles.headerSubtitle}>Stay consistent. One task at a time.</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => setIsSearching(!isSearching)}>
            <MaterialCommunityIcons name="magnify" size={24} color={Colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <MaterialCommunityIcons name="calendar-month-outline" size={24} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Today Summary */}
        <Animated.View entering={FadeInDown.delay(100)}>
          <AppCard style={styles.summaryCard}>
            <View style={styles.summaryTop}>
              <Text style={styles.summaryTitle}>TODAY</Text>
              <Text style={styles.summaryStreak}>{taskStreak?.currentStreak || 0} Days Streak 🔥</Text>
            </View>
            <View style={styles.summaryStats}>
              <View style={styles.statCol}>
                <Text style={styles.statValue}>{todayCompleted}</Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
              <View style={styles.statCol}>
                <Text style={styles.statValue}>{todayRemaining}</Text>
                <Text style={styles.statLabel}>Remaining</Text>
              </View>
              <View style={styles.statCol}>
                <Text style={[styles.statValue, { color: Colors.primary }]}>{progressPercent}%</Text>
                <Text style={styles.statLabel}>Progress</Text>
              </View>
            </View>
            {todayAllTasks.length === 0 && (
              <Text style={styles.summaryEmpty}>Your day is clear.</Text>
            )}
          </AppCard>
        </Animated.View>

        {/* Filters */}
        <Animated.View entering={FadeInDown.delay(200)} style={styles.filterWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            {(['All', 'Today', 'Upcoming', 'Overdue', 'Completed'] as FilterType[]).map((f) => {
               // calculate badge
               let count = 0;
               if (f === 'All') count = tasks.length;
               if (f === 'Today') count = todayTasks.length;
               if (f === 'Upcoming') count = upcomingTasks.length;
               if (f === 'Overdue') count = overdueTasks.length;
               if (f === 'Completed') count = completedTasks.length;

               return (
                 <TouchableOpacity
                   key={f}
                   onPress={() => setFilter(f)}
                   style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
                 >
                   <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
                   {count > 0 && (
                     <View style={[styles.filterBadge, filter === f && styles.filterBadgeActive]}>
                       <Text style={[styles.filterBadgeText, filter === f && styles.filterBadgeTextActive]}>{count}</Text>
                     </View>
                   )}
                 </TouchableOpacity>
               );
            })}
          </ScrollView>
        </Animated.View>

        {/* Task List */}
        <Animated.View entering={FadeInDown.delay(300)}>
          {sections.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="checkbox-marked-circle-outline" size={48} color={Colors.border} style={{ marginBottom: Spacing.md }} />
              <Text style={styles.emptyText}>
                {filter === 'Completed' ? "No completed tasks yet."
                 : filter === 'Overdue' ? "Nothing overdue."
                 : "You're clear for today."}
              </Text>
              {filter === 'Today' && <Text style={styles.emptySubtext}>Use this time for something meaningful.</Text>}
            </View>
          ) : (
            sections.map((section) => (
              <Animated.View key={section.title} layout={Layout.springify()}>
                <Text style={styles.sectionHeader}>{section.title}</Text>
                {section.data.map((task) => (
                  <Animated.View key={task.id} layout={Layout.springify()}>
                    <TaskRow
                      task={task}
                      onToggle={toggleComplete}
                      onPress={handleEdit}
                    />
                  </Animated.View>
                ))}
              </Animated.View>
            ))
          )}
        </Animated.View>
      </ScrollView>

      {/* FAB */}
      <Animated.View entering={FadeIn.delay(500)} style={styles.fabContainer}>
        <TouchableOpacity style={styles.fab} onPress={handleAdd} activeOpacity={0.9}>
          <MaterialCommunityIcons name="plus" size={32} color={Colors.background} />
        </TouchableOpacity>
      </Animated.View>

      <TaskEditorModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        task={editingTask}
        onSave={handleSaveTask}
        onDelete={handleDelete}
      />
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  headerTitle: {
    ...TextStyles.h1,
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    ...TextStyles.bodySmall,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  scrollContent: {
    paddingBottom: 100, // Make room for FAB
    paddingHorizontal: Spacing.lg,
  },
  summaryCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    backgroundColor: Colors.surfaceHighlight,
  },
  summaryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  summaryTitle: {
    ...TextStyles.overline,
    color: Colors.textSecondary,
    letterSpacing: 1.5,
  },
  summaryStreak: {
    ...TextStyles.badge,
    color: Colors.primary,
    fontWeight: '700',
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCol: {
    alignItems: 'center',
  },
  statValue: {
    ...TextStyles.h2,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  statLabel: {
    ...TextStyles.tiny,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
  },
  summaryEmpty: {
    ...TextStyles.bodySmall,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.md,
    fontStyle: 'italic',
  },
  filterWrapper: {
    marginBottom: Spacing.lg,
  },
  filterScroll: {
    paddingRight: Spacing.xl,
    gap: Spacing.sm,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterBtnActive: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primary,
  },
  filterText: {
    ...TextStyles.bodySmall,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  filterTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  filterBadge: {
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: Spacing.xs,
  },
  filterBadgeActive: {
    backgroundColor: Colors.primary,
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  filterBadgeTextActive: {
    color: Colors.background,
  },
  sectionHeader: {
    ...TextStyles.overline,
    color: Colors.textMuted,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
    letterSpacing: 1.5,
  },
  emptyState: {
    padding: Spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    ...TextStyles.body,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  emptySubtext: {
    ...TextStyles.bodySmall,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
  },
  fabContainer: {
    position: 'absolute',
    bottom: Spacing.bottomNavHeight + Spacing.lg,
    right: Spacing.lg,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
