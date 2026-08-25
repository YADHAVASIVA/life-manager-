/**
 * TransactionRow — Bank or credit card transaction list item
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BankTransaction, BankTransactionCategory } from '@/models/BankAccount';
import { PrivacyAmount } from './PrivacyAmount';
import { Colors, Spacing, Radius, TextStyles } from '@/constants/theme';
import { format } from 'date-fns';

const CATEGORY_ICONS: Partial<Record<BankTransactionCategory, string>> = {
  food: 'food',
  travel: 'bus',
  college: 'school',
  gym: 'dumbbell',
  gym_food: 'food-drumstick',
  shopping: 'shopping',
  entertainment: 'play-circle',
  health: 'heart-pulse',
  bills: 'receipt',
  rent: 'home',
  sip: 'trending-up',
  transfer: 'bank-transfer',
  salary: 'cash-multiple',
  savings: 'piggy-bank',
  other: 'dots-horizontal',
};

interface TransactionRowProps {
  transaction: BankTransaction;
  hidden?: boolean;
  onPress?: (tx: BankTransaction) => void;
}

export function TransactionRow({ transaction, hidden = false, onPress }: TransactionRowProps) {
  const isCredit = transaction.type === 'credit';
  const icon = CATEGORY_ICONS[transaction.category] ?? 'dots-horizontal';
  const amountColor = isCredit ? Colors.success : Colors.textPrimary;

  return (
    <TouchableOpacity
      onPress={() => onPress?.(transaction)}
      activeOpacity={0.8}
      disabled={!onPress}
      accessibilityLabel={`${transaction.description} — ₹${transaction.amountINR}`}
      style={styles.container}
    >
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons name={icon as any} size={18} color={Colors.textSecondary} />
      </View>
      <View style={styles.content}>
        <Text style={styles.description} numberOfLines={1}>{transaction.description}</Text>
        <Text style={styles.meta}>
          {format(new Date(transaction.timestamp), 'hh:mm a')} · {transaction.category.replace('_', ' ')}
        </Text>
      </View>
      <View style={styles.right}>
        <Text style={[styles.sign, { color: amountColor }]}>{isCredit ? '+' : '-'}</Text>
        <PrivacyAmount amount={transaction.amountINR} hidden={hidden} style={[styles.amount, { color: amountColor }]} />
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
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md12,
  },
  content: {
    flex: 1,
  },
  description: {
    ...TextStyles.bodySmall,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  meta: {
    ...TextStyles.tiny,
    color: Colors.textMuted,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  sign: {
    ...TextStyles.bodySmall,
    fontWeight: '600',
    marginRight: 2,
  },
  amount: {
    ...TextStyles.metricSmall,
  },
});
