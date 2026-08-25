/**
 * ReminderRow — Single reminder list item
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Reminder } from '@/models/Reminder';
import { Colors, Spacing, Radius, TextStyles } from '@/constants/theme';
import { format, parse } from 'date-fns';

interface ReminderRowProps {
  reminder: Reminder;
  onToggle: (id: string) => void;
  onPress: (reminder: Reminder) => void;
}

export function ReminderRow({ reminder, onToggle, onPress }: ReminderRowProps) {
  // Format time beautifully
  let displayTime = '';
  if (reminder.time) {
    try {
      displayTime = format(parse(reminder.time, 'HH:mm', new Date()), 'h:mm a');
    } catch {
      displayTime = reminder.time;
    }
  }

  // Format repeat string
  const formatRepeat = () => {
    if (reminder.frequency === 'custom_days' && reminder.customDays) {
      return reminder.customDays.map(d => d.charAt(0).toUpperCase() + d.slice(1,3)).join(' ');
    }
    const map: Record<string, string> = {
      once: 'Once',
      daily: 'Every day',
      weekdays: 'Weekdays',
      weekends: 'Weekends',
      weekly: 'Weekly',
      monthly: 'Monthly',
    };
    return map[reminder.frequency] || reminder.frequency;
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onPress(reminder)}
      style={[styles.container, !reminder.enabled && styles.disabledContainer]}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${reminder.color}20` }]}>
        <MaterialCommunityIcons name={reminder.icon as any} size={20} color={reminder.enabled ? reminder.color : Colors.textMuted} />
      </View>

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, !reminder.enabled && styles.disabledText]} numberOfLines={1}>
            {reminder.title}
          </Text>
          <Text style={[styles.time, !reminder.enabled && styles.disabledText]}>{displayTime}</Text>
        </View>

        <View style={styles.footerRow}>
          <Text style={styles.category}>{reminder.category?.toUpperCase() || 'OTHER'}</Text>
          <View style={styles.dot} />
          <Text style={styles.repeat}>{formatRepeat()}</Text>
          
          <View style={{ flex: 1 }} />
          
          <TouchableOpacity
            onPress={() => onToggle(reminder.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.toggleBtn}
          >
            <Text style={[styles.toggleText, reminder.enabled && { color: reminder.color }]}>
              {reminder.enabled ? '[ON]' : '[OFF]'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  disabledContainer: {
    opacity: 0.7,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    ...TextStyles.body,
    fontWeight: '500',
    color: Colors.textPrimary,
    flex: 1,
    marginRight: Spacing.sm,
  },
  time: {
    ...TextStyles.h3,
    color: Colors.textPrimary,
  },
  disabledText: {
    color: Colors.textMuted,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  category: {
    ...TextStyles.badge,
    color: Colors.textSecondary,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.textMuted,
    marginHorizontal: Spacing.xs,
  },
  repeat: {
    ...TextStyles.caption,
    color: Colors.textSecondary,
  },
  toggleBtn: {
    paddingHorizontal: 4,
  },
  toggleText: {
    ...TextStyles.caption,
    fontWeight: '700',
    color: Colors.textMuted,
  },
});
