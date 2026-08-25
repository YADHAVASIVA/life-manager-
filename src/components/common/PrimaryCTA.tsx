/**
 * PrimaryCTA — Full-width prominent call-to-action button
 * Used for primary actions like "Log Water", "Add Task", "Start Workout"
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, TextStyles, Shadow } from '@/constants/theme';

interface PrimaryCTAProps {
  label: string;
  onPress: () => void;
  icon?: string;
  loading?: boolean;
  disabled?: boolean;
  /** Custom background gradient start color */
  color?: string;
  style?: ViewStyle;
  accessibilityLabel?: string;
}

export function PrimaryCTA({
  label,
  onPress,
  icon,
  loading = false,
  disabled = false,
  color = Colors.primary,
  style,
  accessibilityLabel,
}: PrimaryCTAProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      style={[
        styles.button,
        { backgroundColor: color, opacity: isDisabled ? 0.5 : 1 },
        Shadow.goldGlow,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={Colors.textInverse} size="small" />
      ) : (
        <View style={styles.inner}>
          {icon && (
            <MaterialCommunityIcons
              name={icon as any}
              size={22}
              color={Colors.textInverse}
              style={styles.icon}
            />
          )}
          <Text style={styles.label}>{label}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: 52,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: Spacing.sm,
  },
  label: {
    ...TextStyles.h4,
    color: Colors.textInverse,
    fontWeight: '700',
  },
});
