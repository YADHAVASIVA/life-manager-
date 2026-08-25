/**
 * BankCard — Premium bank account display card
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BankAccount } from '@/models/BankAccount';
import { PrivacyAmount } from './PrivacyAmount';
import { Colors, Spacing, Radius, TextStyles, Shadow } from '@/constants/theme';

interface BankCardProps {
  account: BankAccount;
  hidden?: boolean;
  onPress?: (account: BankAccount) => void;
  style?: ViewStyle;
}

export function BankCard({ account, hidden = false, onPress, style }: BankCardProps) {
  return (
    <TouchableOpacity
      onPress={() => onPress?.(account)}
      activeOpacity={0.85}
      disabled={!onPress}
      accessibilityLabel={`${account.nickname} account`}
      style={[styles.card, { borderLeftColor: account.color }, Shadow.sm, style]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: `${account.color}18` }]}>
          <MaterialCommunityIcons name={account.icon as any} size={20} color={account.color} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.nickname} numberOfLines={1}>{account.nickname}</Text>
          <Text style={styles.bankName} numberOfLines={1}>{account.displayBankName}</Text>
        </View>
        {account.isPrimary && (
          <View style={styles.primaryBadge}>
            <Text style={styles.primaryText}>Primary</Text>
          </View>
        )}
      </View>

      {/* Balance */}
      <View style={styles.balanceRow}>
        <Text style={styles.balanceLabel}>Balance</Text>
        <PrivacyAmount
          amount={account.balanceINR}
          hidden={hidden}
          allowReveal
          style={styles.balance}
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderLeftWidth: 3,
    padding: Spacing.cardPadding,
    marginBottom: Spacing.cardGap,
  },
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
  headerText: {
    flex: 1,
  },
  nickname: {
    ...TextStyles.h4,
    color: Colors.textPrimary,
  },
  bankName: {
    ...TextStyles.caption,
    color: Colors.textMuted,
    marginTop: 2,
  },
  primaryBadge: {
    backgroundColor: Colors.primaryMuted,
    borderRadius: Radius.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
  },
  primaryText: {
    ...TextStyles.badge,
    color: Colors.primary,
    fontWeight: '600',
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLabel: {
    ...TextStyles.caption,
    color: Colors.textMuted,
  },
  balance: {
    ...TextStyles.metricMedium,
    color: Colors.textPrimary,
  },
});
