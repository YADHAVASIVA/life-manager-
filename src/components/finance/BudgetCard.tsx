/**
 * BudgetCard — Monthly budget overview card
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { AppCard } from '@/components/common/AppCard';
import { PrivacyAmount } from './PrivacyAmount';
import { BudgetProgressBar } from './BudgetProgressBar';
import { Budget } from '@/models/Finance';
import { Colors, Spacing, TextStyles } from '@/constants/theme';

interface BudgetCardProps {
  budget: Budget;
  spentByCategory: Partial<Record<string, number>>;
  hidden?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

export function BudgetCard({
  budget,
  spentByCategory,
  hidden = false,
  onPress,
  style,
}: BudgetCardProps) {
  const totalSpentINR = Object.values(spentByCategory).reduce<number>((sum, v) => sum + (v ?? 0), 0);
  const remaining = budget.monthlyIncomeINR - totalSpentINR;

  return (
    <AppCard style={style} onPress={onPress} elevation="raised">
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Monthly Budget</Text>
        <PrivacyAmount amount={budget.monthlyIncomeINR} hidden={hidden} style={styles.income} />
      </View>

      {/* Summary row */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Spent</Text>
          <PrivacyAmount amount={totalSpentINR} hidden={hidden} style={[styles.summaryValue, { color: Colors.danger }]} />
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Remaining</Text>
          <PrivacyAmount
            amount={remaining}
            hidden={hidden}
            style={[styles.summaryValue, { color: remaining >= 0 ? Colors.success : Colors.danger }]}
          />
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>SIP</Text>
          <PrivacyAmount amount={budget.sipINR} hidden={hidden} style={styles.summaryValue} />
        </View>
      </View>

      <View style={styles.divider} />

      {/* Category breakdown */}
      <BudgetProgressBar
        label="Rent"
        spentINR={spentByCategory['rent'] ?? 0}
        plannedINR={budget.rentINR}
        color={Colors.sleep}
        hidden={hidden}
      />
      <BudgetProgressBar
        label="Gym"
        spentINR={spentByCategory['gym'] ?? 0}
        plannedINR={budget.gymINR}
        color={Colors.workout}
        hidden={hidden}
      />
      <BudgetProgressBar
        label="Gym Food"
        spentINR={spentByCategory['gym_food'] ?? 0}
        plannedINR={budget.gymFoodINR}
        color={Colors.nutrition}
        hidden={hidden}
      />
      <BudgetProgressBar
        label="Miscellaneous"
        spentINR={spentByCategory['miscellaneous'] ?? 0}
        plannedINR={budget.miscellaneousINR}
        color={Colors.primary}
        hidden={hidden}
        style={{ marginBottom: 0 }}
      />
    </AppCard>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md12,
  },
  title: {
    ...TextStyles.h4,
    color: Colors.textPrimary,
  },
  income: {
    ...TextStyles.metricSmall,
    color: Colors.primary,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md12,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    ...TextStyles.tiny,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  summaryValue: {
    ...TextStyles.metricSmall,
    color: Colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: Spacing.md12,
  },
});
