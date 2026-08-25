/**
 * SavingsProgressCard — Savings goal progress display
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SavingsGoal } from '@/models/Savings';
import { AppCard } from '@/components/common/AppCard';
import { ProgressBar } from '@/components/common/ProgressBar';
import { PrivacyAmount } from './PrivacyAmount';
import { Colors, Spacing, Radius, TextStyles } from '@/constants/theme';

interface SavingsProgressCardProps {
  goal: SavingsGoal;
  hidden?: boolean;
  onPress?: (goal: SavingsGoal) => void;
  style?: ViewStyle;
}

export function SavingsProgressCard({ goal, hidden = false, onPress, style }: SavingsProgressCardProps) {
  const color = goal.color ?? Colors.success;

  return (
    <AppCard style={style} onPress={() => onPress?.(goal)} elevation="raised">
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: `${color}18` }]}>
          <MaterialCommunityIcons name={(goal.icon ?? 'piggy-bank') as any} size={20} color={color} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.name} numberOfLines={1}>{goal.name}</Text>
          <Text style={[styles.percent, { color }]}>{goal.progressPercent}% achieved</Text>
        </View>
      </View>

      <View style={styles.amountRow}>
        <View>
          <Text style={styles.amountLabel}>Saved</Text>
          <PrivacyAmount amount={goal.currentINR} hidden={hidden} allowReveal style={styles.saved} />
        </View>
        <View>
          <Text style={styles.amountLabel}>Target</Text>
          <PrivacyAmount amount={goal.targetINR} hidden={hidden} style={[styles.target, { color: Colors.textMuted }]} />
        </View>
        <View>
          <Text style={styles.amountLabel}>Remaining</Text>
          <PrivacyAmount
            amount={Math.max(0, goal.targetINR - goal.currentINR)}
            hidden={hidden}
            style={styles.remaining}
          />
        </View>
      </View>

      <ProgressBar progress={goal.progressPercent} color={color} height={6} />
    </AppCard>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md12,
  },
  headerText: { flex: 1 },
  name: {
    ...TextStyles.h4,
    color: Colors.textPrimary,
  },
  percent: {
    ...TextStyles.caption,
    marginTop: 2,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md12,
  },
  amountLabel: {
    ...TextStyles.tiny,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  saved: {
    ...TextStyles.metricSmall,
    color: Colors.success,
  },
  target: {
    ...TextStyles.metricSmall,
  },
  remaining: {
    ...TextStyles.metricSmall,
    color: Colors.textPrimary,
  },
});
