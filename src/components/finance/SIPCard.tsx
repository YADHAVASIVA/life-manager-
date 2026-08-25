/**
 * SIPCard — SIP plan display card
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SIPPlan, SIPStatus } from '@/models/SIP';
import { AppCard } from '@/components/common/AppCard';
import { PrivacyAmount } from './PrivacyAmount';
import { Colors, Spacing, Radius, TextStyles } from '@/constants/theme';

interface SIPCardProps {
  plan: SIPPlan;
  /** Whether current month's contribution is done */
  currentMonthDone?: boolean;
  hidden?: boolean;
  onPress?: (plan: SIPPlan) => void;
  style?: ViewStyle;
}

const STATUS_CONFIG: Record<SIPStatus, { color: string; label: string }> = {
  active: { color: Colors.success, label: 'Active' },
  paused: { color: Colors.warning, label: 'Paused' },
  completed: { color: Colors.primary, label: 'Completed' },
  missed: { color: Colors.danger, label: 'Missed' },
};

export function SIPCard({ plan, currentMonthDone = false, hidden = false, onPress, style }: SIPCardProps) {
  const color = plan.color ?? Colors.primary;
  const statusConfig = STATUS_CONFIG[plan.status];

  return (
    <AppCard style={style} onPress={() => onPress?.(plan)} elevation="raised" accentColor={color}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: `${color}18` }]}>
          <MaterialCommunityIcons name={(plan.icon ?? 'trending-up') as any} size={20} color={color} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.fundName} numberOfLines={1}>{plan.fundName}</Text>
          {plan.fundType && <Text style={styles.fundType}>{plan.fundType}</Text>}
        </View>
        <View style={[styles.statusBadge, { backgroundColor: `${statusConfig.color}20` }]}>
          <Text style={[styles.statusText, { color: statusConfig.color }]}>{statusConfig.label}</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Monthly</Text>
          <PrivacyAmount amount={plan.monthlyAmountINR} hidden={hidden} allowReveal style={[styles.statValue, { color }]} />
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Invested</Text>
          <PrivacyAmount amount={plan.totalInvestedINR} hidden={hidden} style={styles.statValue} />
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>SIP Date</Text>
          <Text style={styles.statValue}>{plan.sipDate}th</Text>
        </View>
      </View>

      <View style={[styles.monthStatus, { backgroundColor: currentMonthDone ? Colors.successMuted : Colors.warningMuted }]}>
        <MaterialCommunityIcons
          name={currentMonthDone ? 'check-circle' : 'clock-outline'}
          size={14}
          color={currentMonthDone ? Colors.success : Colors.warning}
        />
        <Text style={[styles.monthStatusText, { color: currentMonthDone ? Colors.success : Colors.warning }]}>
          {currentMonthDone ? 'This month: Done' : 'This month: Pending'}
        </Text>
      </View>
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
  fundName: {
    ...TextStyles.h4,
    color: Colors.textPrimary,
  },
  fundType: {
    ...TextStyles.caption,
    color: Colors.textMuted,
    marginTop: 2,
  },
  statusBadge: {
    borderRadius: Radius.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
  },
  statusText: {
    ...TextStyles.badge,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md12,
  },
  stat: { alignItems: 'center' },
  statLabel: {
    ...TextStyles.tiny,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  statValue: {
    ...TextStyles.metricSmall,
    color: Colors.textPrimary,
  },
  monthStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.xs,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  monthStatusText: {
    ...TextStyles.caption,
    fontWeight: '500',
    marginLeft: Spacing.xs,
  },
});
