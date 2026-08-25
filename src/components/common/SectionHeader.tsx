/**
 * SectionHeader — Section title with optional action link
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, TextStyles } from '@/constants/theme';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: string;
  iconColor?: string;
  style?: ViewStyle;
}

export function SectionHeader({
  title,
  subtitle,
  actionLabel,
  onAction,
  icon,
  iconColor = Colors.primary,
  style,
}: SectionHeaderProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.left}>
        {icon && (
          <MaterialCommunityIcons
            name={icon as any}
            size={18}
            color={iconColor}
            style={styles.icon}
          />
        )}
        <View>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </View>
      {actionLabel && onAction && (
        <TouchableOpacity
          onPress={onAction}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel={actionLabel}
          accessibilityRole="button"
        >
          <Text style={styles.action}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sectionHeaderBottom,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    marginRight: Spacing.xs,
  },
  title: {
    ...TextStyles.h3,
    color: Colors.textPrimary,
  },
  subtitle: {
    ...TextStyles.caption,
    color: Colors.textMuted,
    marginTop: 2,
  },
  action: {
    ...TextStyles.caption,
    color: Colors.primary,
    fontWeight: '600',
  },
});
