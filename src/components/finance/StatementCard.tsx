/**
 * StatementCard — Bank/credit statement record display
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatementRecord, StatementInstitution } from '@/models/Statement';
import { PrivacyAmount } from './PrivacyAmount';
import { Colors, Spacing, Radius, TextStyles, Shadow } from '@/constants/theme';

const INSTITUTION_COLORS: Record<StatementInstitution, string> = {
  union_bank: Colors.primary,
  sbi: Colors.water,
  kotak: Colors.success,
  credit_card: Colors.sleep,
  other: Colors.textMuted,
};

interface StatementCardProps {
  statement: StatementRecord;
  hidden?: boolean;
  onPress?: (statement: StatementRecord) => void;
  style?: ViewStyle;
}

export function StatementCard({ statement, hidden = false, onPress, style }: StatementCardProps) {
  const color = INSTITUTION_COLORS[statement.institution];

  return (
    <TouchableOpacity
      onPress={() => onPress?.(statement)}
      activeOpacity={0.85}
      disabled={!onPress}
      style={[styles.card, { borderLeftColor: color }, Shadow.sm, style]}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.institution}>{statement.institutionDisplayName}</Text>
          <Text style={styles.period}>Statement: {statement.statementPeriod}</Text>
        </View>
        <View style={styles.fileStatus}>
          <MaterialCommunityIcons
            name={statement.hasFile ? 'file-check' : 'file-outline'}
            size={20}
            color={statement.hasFile ? Colors.success : Colors.textMuted}
          />
          <Text style={[styles.fileLabel, { color: statement.hasFile ? Colors.success : Colors.textMuted }]}>
            {statement.hasFile ? 'Saved' : 'No file'}
          </Text>
        </View>
      </View>

      {(statement.closingBalanceINR !== undefined || statement.totalDebitsINR !== undefined) && (
        <View style={styles.balanceRow}>
          {statement.closingBalanceINR !== undefined && (
            <View style={styles.balanceItem}>
              <Text style={styles.balanceLabel}>Closing Balance</Text>
              <PrivacyAmount amount={statement.closingBalanceINR} hidden={hidden} style={styles.balanceValue} />
            </View>
          )}
          {statement.totalDebitsINR !== undefined && (
            <View style={styles.balanceItem}>
              <Text style={styles.balanceLabel}>Total Debits</Text>
              <PrivacyAmount amount={statement.totalDebitsINR} hidden={hidden} style={[styles.balanceValue, { color: Colors.danger }]} />
            </View>
          )}
          {statement.totalCreditsINR !== undefined && (
            <View style={styles.balanceItem}>
              <Text style={styles.balanceLabel}>Total Credits</Text>
              <PrivacyAmount amount={statement.totalCreditsINR} hidden={hidden} style={[styles.balanceValue, { color: Colors.success }]} />
            </View>
          )}
        </View>
      )}
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  institution: {
    ...TextStyles.h4,
    color: Colors.textPrimary,
  },
  period: {
    ...TextStyles.caption,
    color: Colors.textMuted,
    marginTop: 2,
  },
  fileStatus: {
    alignItems: 'center',
  },
  fileLabel: {
    ...TextStyles.badge,
    marginTop: 2,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderSubtle,
  },
  balanceItem: { alignItems: 'center' },
  balanceLabel: {
    ...TextStyles.tiny,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  balanceValue: {
    ...TextStyles.metricSmall,
    color: Colors.textPrimary,
  },
});
