/**
 * TaskRow — Premium task list item
 */

import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
  withSpring,
} from 'react-native-reanimated';
import { Task, TaskPriority } from '@/models/Task';
import { Colors, Spacing, Radius, TextStyles } from '@/constants/theme';
import { format, parse } from 'date-fns';

interface TaskRowProps {
  task: Task;
  onToggle: (id: string) => void;
  onPress?: (task: Task) => void;
  onLongPress?: (task: Task) => void;
  style?: StyleProp<ViewStyle>;
}

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: Colors.textMuted,
  medium: Colors.primary, // Gold
  high: Colors.warning,   // Amber
  critical: Colors.danger, // Red
};

export function TaskRow({ task, onToggle, onPress, onLongPress, style }: TaskRowProps) {
  const priorityColor = PRIORITY_COLORS[task.priority];

  const progress = useSharedValue(task.completed ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(task.completed ? 1 : 0, { duration: 300 });
  }, [task.completed]);

  const animatedTitleStyle = useAnimatedStyle(() => {
    return {
      color: interpolateColor(
        progress.value,
        [0, 1],
        [Colors.textPrimary, Colors.textMuted]
      ),
      textDecorationLine: progress.value > 0.5 ? 'line-through' : 'none',
      textDecorationColor: Colors.textMuted,
    };
  });

  const checkScale = useAnimatedStyle(() => {
    return {
      transform: [{ scale: withSpring(task.completed ? 1 : 0.8) }],
      opacity: withTiming(task.completed ? 1 : 0),
    };
  });

  const uncheckScale = useAnimatedStyle(() => {
    return {
      transform: [{ scale: withSpring(task.completed ? 0.8 : 1) }],
      opacity: withTiming(task.completed ? 0 : 1),
    };
  });

  // Format time beautifully if available
  let displayTime = '';
  if (task.time) {
    try {
      displayTime = format(parse(task.time, 'HH:mm', new Date()), 'h:mm a');
    } catch {
      displayTime = task.time;
    }
  }

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onPress?.(task)}
      onLongPress={() => onLongPress?.(task)}
      accessibilityLabel={`Task: ${task.title}`}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: task.completed }}
      style={[styles.container, style]}
    >
      <View style={[styles.priorityIndicator, { backgroundColor: priorityColor }]} />

      <TouchableOpacity
        onPress={() => onToggle(task.id)}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        style={styles.checkboxContainer}
      >
        <Animated.View style={[StyleSheet.absoluteFill, styles.iconWrapper, uncheckScale]}>
          <MaterialCommunityIcons name="checkbox-blank-circle-outline" size={24} color={Colors.textMuted} />
        </Animated.View>
        <Animated.View style={[StyleSheet.absoluteFill, styles.iconWrapper, checkScale]}>
          <MaterialCommunityIcons name="check-circle" size={24} color={Colors.primary} />
        </Animated.View>
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.rowTop}>
          {displayTime ? (
            <Text style={[styles.time, task.completed && styles.mutedText]}>{displayTime}</Text>
          ) : null}
          {task.reminder && (
            <MaterialCommunityIcons name="bell-ring" size={12} color={task.completed ? Colors.textMuted : Colors.primary} style={styles.reminderIcon} />
          )}
        </View>
        
        <Animated.Text style={[styles.title, animatedTitleStyle]} numberOfLines={2}>
          {task.title}
        </Animated.Text>

        <View style={styles.rowBottom}>
          <Text style={styles.category}>{task.category.toUpperCase()}</Text>
          <View style={styles.dot} />
          <Text style={[styles.priority, { color: task.completed ? Colors.textMuted : priorityColor }]}>
            {task.priority.toUpperCase()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  priorityIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
  },
  checkboxContainer: {
    width: 24,
    height: 24,
    marginRight: Spacing.md,
    marginLeft: Spacing.xs,
  },
  iconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  time: {
    ...TextStyles.caption,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  mutedText: {
    color: Colors.textMuted,
  },
  reminderIcon: {
    marginLeft: Spacing.xs,
  },
  title: {
    ...TextStyles.body,
    fontWeight: '500',
    marginBottom: Spacing.xs,
  },
  rowBottom: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  category: {
    ...TextStyles.badge,
    color: Colors.textMuted,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.textMuted,
    marginHorizontal: Spacing.sm,
  },
  priority: {
    ...TextStyles.badge,
  },
});
