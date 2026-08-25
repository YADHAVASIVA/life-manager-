/**
 * CreditUtilizationCard — Credit card utilization display
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { CreditCard, CreditUtilizationStatus } from '@/models/CreditCard';
import { AppCard } from '@/components/common/AppCard';
import { ProgressBar } from '@/components/common/ProgressBar';
import { PrivacyAmount } from './PrivacyAmount';
import { Colors, Spacing, Radius, TextStyles } from '@/constants/theme';

interface CreditUtilizationCardProps {
  card: CreditCard;
  hidden?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

const STATUS_LABELS: Record<CreditUtilizationStatus, string> = {
  safe: 'SAFE',
  caution: 'CAUTION',
  high: 'HIGH',
  very_high: 'VERY HIGH',
};

const STATUS_COLORS: Record<CreditUtilizationStatus, string> = {
  safe: Colors.success,
  caution: Colors.warning,
  high: Colors.nutrition,
  very_high: Colors.danger,
};

export function CreditUtilizationCard({
  card,
  hidden = false,
  onPress,
  style,
}: CreditUtilizationCardProps) {
  const statusColor = STATUS_COLORS[card.utilizationStatus];
  const isAboveCeiling = card.usedINR >= card.personalCeilingINR;

  return (
    <AppCard
      style={style}
      onPress={onPress}
      elevation="raised"
      accentColor={statusColor}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{card.nickname}</Text>
        <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>
            {STATUS_LABELS[card.utilizationStatus]}
          </Text>
        </View>
      </View>

      {/* Used / Limit */}
      <View style={styles.amountRow}>
        <View>
          <Text style={styles.amountLabel}>Used</Text>
          <PrivacyAmount amount={card.usedINR} hidden={hidden} allowReveal style={styles.used} />
        </View>
        <View style={styles.divider} />
        <View>
          <Text style={styles.amountLabel}>Available</Text>
          <PrivacyAmount amount={card.availableINR} hidden={hidden} style={styles.available} />
        </View>
        <View style={styles.divider} />
        <View>
          <Text style={styles.amountLabel}>Limit</Text>
          <PrivacyAmount amount={card.limitINR} hidden={hidden} style={styles.limit} />
        </View>
      </View>

      {/* Progress bar */}
      <ProgressBar
        progress={card.utilizationPercent}
        color={statusColor}
        height={6}
        style={styles.progressBar}
      />

      {/* Ceiling indicator */}
      <View style={styles.ceilingRow}>
        <Text style={styles.ceilingLabel}>
          Personal ceiling: {hidden ? '₹•••' : `₹${card.personalCeilingINR}`} ({card.personalCeilingPercent}%)
        </Text>
        <Text style={[styles.ceilingStatus, { color: isAboveCeiling ? Colors.danger : Colors.success }]}>
          {isAboveCeiling ? '⚠ Exceeded' : '✓ Within limit'}
        </Text>
      </View>
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
  statusBadge: {
    borderRadius: Radius.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
  },
  statusText: {
    ...TextStyles.badge,
    fontWeight: '700',
    letterSpacing: 0.5,
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
  used: {
    ...TextStyles.metricSmall,
    color: Colors.textPrimary,
  },
  available: {
    ...TextStyles.metricSmall,
    color: Colors.success,
  },
  limit: {
    ...TextStyles.metricSmall,
    color: Colors.textSecondary,
  },
  divider: {
    width: 1,
    height: '100%',
    backgroundColor: Colors.border,
  },
  progressBar: {
    marginBottom: Spacing.sm,
  },
  ceilingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ceilingLabel: {
    ...TextStyles.tiny,
    color: Colors.textMuted,
  },
  ceilingStatus: {
    ...TextStyles.tiny,
    fontWeight: '600',
  },
});
