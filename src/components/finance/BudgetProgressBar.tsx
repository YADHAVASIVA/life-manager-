/**
 * BudgetProgressBar — Shows budget category progress with spent vs planned
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { ProgressBar } from '@/components/common/ProgressBar';
import { PrivacyAmount } from './PrivacyAmount';
import { Colors, Spacing, TextStyles } from '@/constants/theme';

interface BudgetProgressBarProps {
  label: string;
  spentINR: number;
  plannedINR: number;
  color?: string;
  hidden?: boolean;
  style?: ViewStyle;
}

export function BudgetProgressBar({
  label,
  spentINR,
  plannedINR,
  color = Colors.primary,
  hidden = false,
  style,
}: BudgetProgressBarProps) {
  const progress = plannedINR > 0 ? Math.min(100, (spentINR / plannedINR) * 100) : 0;
  const isOver = spentINR > plannedINR;
  const barColor = isOver ? Colors.danger : progress >= 80 ? Colors.warning : color;

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.amounts}>
          <PrivacyAmount amount={spentINR} style={styles.spent} hidden={hidden} />
          <Text style={styles.separator}> / </Text>
          <PrivacyAmount amount={plannedINR} style={styles.planned} hidden={hidden} />
        </View>
      </View>
      <ProgressBar
        progress={progress}
        color={barColor}
        height={5}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  label: {
    ...TextStyles.bodySmall,
    color: Colors.textSecondary,
    flex: 1,
  },
  amounts: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  spent: {
    ...TextStyles.metricSmall,
    color: Colors.textPrimary,
  },
  separator: {
    ...TextStyles.caption,
    color: Colors.textMuted,
  },
  planned: {
    ...TextStyles.caption,
    color: Colors.textMuted,
  },
});
