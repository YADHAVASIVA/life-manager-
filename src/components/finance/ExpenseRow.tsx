/**
 * ExpenseRow — Expense tracking list item (for miscellaneous daily expenses)
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Expense, ExpenseCategory } from '@/models/Finance';
import { PrivacyAmount } from './PrivacyAmount';
import { Colors, Spacing, Radius, TextStyles } from '@/constants/theme';
import { format } from 'date-fns';

const CATEGORY_CONFIG: Record<ExpenseCategory, { icon: string; color: string; label: string }> = {
  food: { icon: 'food', color: Colors.nutrition, label: 'Food' },
  travel: { icon: 'bus', color: Colors.water, label: 'Travel' },
  college: { icon: 'school', color: Colors.schedule, label: 'College' },
  gym: { icon: 'dumbbell', color: Colors.workout, label: 'Gym' },
  gym_food: { icon: 'food-drumstick', color: Colors.nutrition, label: 'Gym Food' },
  shopping: { icon: 'shopping', color: Colors.primary, label: 'Shopping' },
  entertainment: { icon: 'play-circle', color: Colors.sleep, label: 'Entertainment' },
  health: { icon: 'heart-pulse', color: Colors.danger, label: 'Health' },
  bills: { icon: 'receipt', color: Colors.warning, label: 'Bills' },
  rent: { icon: 'home', color: Colors.primary, label: 'Rent' },
  sip: { icon: 'trending-up', color: Colors.success, label: 'SIP' },
  savings: { icon: 'piggy-bank', color: Colors.success, label: 'Savings' },
  subscriptions: { icon: 'television-play', color: Colors.sleep, label: 'Subscriptions' },
  miscellaneous: { icon: 'dots-horizontal', color: Colors.textMuted, label: 'Other' },
  other: { icon: 'dots-horizontal', color: Colors.textMuted, label: 'Other' },
};

interface ExpenseRowProps {
  expense: Expense;
  hidden?: boolean;
  onPress?: (expense: Expense) => void;
  onDelete?: (id: string) => void;
}

export function ExpenseRow({ expense, hidden = false, onPress, onDelete }: ExpenseRowProps) {
  const config = CATEGORY_CONFIG[expense.category] ?? CATEGORY_CONFIG.miscellaneous;

  return (
    <TouchableOpacity
      onPress={() => onPress?.(expense)}
      activeOpacity={0.8}
      disabled={!onPress}
      accessibilityLabel={`${expense.note ?? expense.category} — ₹${expense.amountINR}`}
      style={styles.container}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${config.color}18` }]}>
        <MaterialCommunityIcons name={config.icon as any} size={18} color={config.color} />
      </View>
      <View style={styles.content}>
        <Text style={styles.note} numberOfLines={1}>
          {expense.note ?? config.label}
        </Text>
        <Text style={styles.meta}>
          {config.label} · {format(new Date(expense.timestamp), 'hh:mm a')}
        </Text>
      </View>
      <View style={styles.right}>
        <PrivacyAmount
          amount={expense.amountINR}
          hidden={hidden}
          style={styles.amount}
        />
        {onDelete && (
          <TouchableOpacity
            onPress={() => onDelete(expense.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.deleteButton}
          >
            <MaterialCommunityIcons name="close-circle" size={16} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
    minHeight: Spacing.touchTarget,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md12,
  },
  content: { flex: 1 },
  note: {
    ...TextStyles.bodySmall,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  meta: {
    ...TextStyles.tiny,
    color: Colors.textMuted,
    marginTop: 2,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amount: {
    ...TextStyles.metricSmall,
    color: Colors.textPrimary,
  },
  deleteButton: {
    marginLeft: Spacing.sm,
  },
});
