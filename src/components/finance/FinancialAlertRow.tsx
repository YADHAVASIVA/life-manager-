/**
 * FinancialAlertRow — Single financial alert list item
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FinancialAlert, FinancialAlertSeverity } from '@/models/FinancialAlert';
import { Colors, Spacing, Radius, TextStyles } from '@/constants/theme';
import { format } from 'date-fns';

const SEVERITY_CONFIG: Record<FinancialAlertSeverity, { color: string; icon: string }> = {
  info: { color: Colors.info, icon: 'information-outline' },
  warning: { color: Colors.warning, icon: 'alert-outline' },
  danger: { color: Colors.danger, icon: 'alert-circle-outline' },
  success: { color: Colors.success, icon: 'check-circle-outline' },
};

interface FinancialAlertRowProps {
  alert: FinancialAlert;
  onPress?: (alert: FinancialAlert) => void;
  onDismiss?: (id: string) => void;
}

export function FinancialAlertRow({ alert, onPress, onDismiss }: FinancialAlertRowProps) {
  const config = SEVERITY_CONFIG[alert.severity];

  return (
    <TouchableOpacity
      onPress={() => onPress?.(alert)}
      activeOpacity={0.8}
      disabled={!onPress}
      style={[styles.container, !alert.read && styles.unread, { borderLeftColor: config.color }]}
    >
      <MaterialCommunityIcons
        name={config.icon as any}
        size={20}
        color={config.color}
        style={styles.icon}
      />
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>{alert.title}</Text>
        <Text style={styles.message} numberOfLines={2}>{alert.message}</Text>
        <Text style={styles.time}>
          {format(new Date(alert.timestamp), 'MMM d · hh:mm a')}
        </Text>
      </View>
      {onDismiss && (
        <TouchableOpacity
          onPress={() => onDismiss(alert.id)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <MaterialCommunityIcons name="close" size={16} color={Colors.textMuted} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderLeftWidth: 3,
    padding: Spacing.cardPadding,
    marginBottom: Spacing.cardGap,
    minHeight: Spacing.touchTarget,
  },
  unread: {
    backgroundColor: Colors.surfaceElevated,
  },
  icon: {
    marginRight: Spacing.md12,
    marginTop: 2,
  },
  content: { flex: 1 },
  title: {
    ...TextStyles.bodySmall,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginBottom: 4,
  },
  message: {
    ...TextStyles.caption,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  time: {
    ...TextStyles.tiny,
    color: Colors.textMuted,
  },
});
