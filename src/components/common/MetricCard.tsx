/**
 * MetricCard — Displays a single metric with label, value, unit, and optional trend
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppCard } from './AppCard';
import { Colors, Spacing, TextStyles } from '@/constants/theme';

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  /** MaterialCommunityIcons icon name */
  icon?: string;
  iconColor?: string;
  /** Trend: positive=up, negative=down, neutral=flat */
  trend?: 'up' | 'down' | 'neutral';
  trendLabel?: string;
  accentColor?: string;
  style?: ViewStyle;
  onPress?: () => void;
}

const TREND_ICONS = { up: 'trending-up', down: 'trending-down', neutral: 'minus' };
const TREND_COLORS = { up: Colors.success, down: Colors.danger, neutral: Colors.textMuted };

export function MetricCard({
  label,
  value,
  unit,
  icon,
  iconColor = Colors.primary,
  trend,
  trendLabel,
  accentColor,
  style,
  onPress,
}: MetricCardProps) {
  return (
    <AppCard accentColor={accentColor} style={style} onPress={onPress} elevation="raised">
      <View style={styles.header}>
        <Text style={styles.label} numberOfLines={1}>{label}</Text>
        {icon && (
          <MaterialCommunityIcons name={icon as any} size={18} color={iconColor} />
        )}
      </View>
      <View style={styles.valueRow}>
        <Text style={styles.value}>{value}</Text>
        {unit && <Text style={styles.unit}> {unit}</Text>}
      </View>
      {trend && (
        <View style={styles.trendRow}>
          <MaterialCommunityIcons
            name={TREND_ICONS[trend] as any}
            size={14}
            color={TREND_COLORS[trend]}
          />
          {trendLabel && (
            <Text style={[styles.trendLabel, { color: TREND_COLORS[trend] }]}>
              {' '}{trendLabel}
            </Text>
          )}
        </View>
      )}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  label: {
    ...TextStyles.caption,
    color: Colors.textSecondary,
    flex: 1,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  value: {
    ...TextStyles.metricLarge,
    color: Colors.textPrimary,
  },
  unit: {
    ...TextStyles.bodySmall,
    color: Colors.textSecondary,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  trendLabel: {
    ...TextStyles.caption,
  },
});
