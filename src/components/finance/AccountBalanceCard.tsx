/**
 * AccountBalanceCard — Compact balance summary across all accounts
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppCard } from '@/components/common/AppCard';
import { PrivacyAmount } from './PrivacyAmount';
import { Colors, Spacing, TextStyles } from '@/constants/theme';

interface AccountBalanceSummary {
  label: string;
  amountINR: number;
  icon: string;
  color: string;
}

interface AccountBalanceCardProps {
  title: string;
  accounts: AccountBalanceSummary[];
  totalINR: number;
  hidden?: boolean;
  style?: ViewStyle;
  onPress?: () => void;
}

export function AccountBalanceCard({
  title,
  accounts,
  totalINR,
  hidden = false,
  style,
  onPress,
}: AccountBalanceCardProps) {
  return (
    <AppCard style={style} onPress={onPress} elevation="raised">
      <Text style={styles.title}>{title}</Text>
      <PrivacyAmount
        amount={totalINR}
        hidden={hidden}
        allowReveal
        style={styles.total}
      />
      <Text style={styles.totalLabel}>Total Balance</Text>

      <View style={styles.divider} />

      {accounts.map((account, index) => (
        <View key={index} style={styles.row}>
          <View style={styles.rowLeft}>
            <MaterialCommunityIcons
              name={account.icon as any}
              size={14}
              color={account.color}
              style={styles.rowIcon}
            />
            <Text style={styles.rowLabel}>{account.label}</Text>
          </View>
          <PrivacyAmount
            amount={account.amountINR}
            hidden={hidden}
            style={styles.rowAmount}
          />
        </View>
      ))}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  title: {
    ...TextStyles.label,
    color: Colors.textMuted,
    marginBottom: Spacing.xs,
  },
  total: {
    ...TextStyles.metricLarge,
    color: Colors.textPrimary,
  },
  totalLabel: {
    ...TextStyles.tiny,
    color: Colors.textMuted,
    marginBottom: Spacing.md12,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: Spacing.md12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowIcon: {
    marginRight: Spacing.xs,
  },
  rowLabel: {
    ...TextStyles.bodySmall,
    color: Colors.textSecondary,
  },
  rowAmount: {
    ...TextStyles.metricSmall,
    color: Colors.textPrimary,
  },
});
