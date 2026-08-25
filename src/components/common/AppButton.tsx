/**
 * AppButton — Primary reusable button component
 * Supports: primary, secondary, ghost, danger variants
 * Sizes: sm, md, lg
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, TextStyles } from '@/constants/theme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface AppButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: string;
  rightIcon?: string;
  style?: ViewStyle;
  labelStyle?: TextStyle;
  fullWidth?: boolean;
  accessibilityLabel?: string;
}

const VARIANT_STYLES: Record<ButtonVariant, { bg: string; text: string; border?: string }> = {
  primary: { bg: Colors.primary, text: Colors.textInverse },
  secondary: { bg: Colors.surfaceElevated, text: Colors.textPrimary, border: Colors.border },
  ghost: { bg: Colors.transparent, text: Colors.primary, border: Colors.border },
  danger: { bg: Colors.dangerMuted, text: Colors.danger, border: Colors.danger },
};

const SIZE_STYLES: Record<ButtonSize, { paddingV: number; paddingH: number; iconSize: number; textStyle: TextStyle }> = {
  sm: { paddingV: Spacing.xs, paddingH: Spacing.md12, iconSize: 14, textStyle: TextStyles.label },
  md: { paddingV: Spacing.md12, paddingH: Spacing.md, iconSize: 18, textStyle: TextStyles.label },
  lg: { paddingV: Spacing.md, paddingH: Spacing.lg, iconSize: 20, textStyle: TextStyles.h4 },
};

export function AppButton({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  style,
  labelStyle,
  fullWidth = false,
  accessibilityLabel,
}: AppButtonProps) {
  const variantStyle = VARIANT_STYLES[variant];
  const sizeStyle = SIZE_STYLES[size];
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.75}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      style={[
        styles.base,
        {
          backgroundColor: variantStyle.bg,
          paddingVertical: sizeStyle.paddingV,
          paddingHorizontal: sizeStyle.paddingH,
          borderColor: variantStyle.border ?? Colors.transparent,
          borderWidth: variantStyle.border ? 1 : 0,
          opacity: isDisabled ? 0.5 : 1,
          minHeight: Spacing.touchTarget,
        },
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variantStyle.text} />
      ) : (
        <View style={styles.row}>
          {leftIcon && (
            <MaterialCommunityIcons
              name={leftIcon as any}
              size={sizeStyle.iconSize}
              color={variantStyle.text}
              style={styles.leftIcon}
            />
          )}
          <Text style={[sizeStyle.textStyle, { color: variantStyle.text }, labelStyle]}>
            {label}
          </Text>
          {rightIcon && (
            <MaterialCommunityIcons
              name={rightIcon as any}
              size={sizeStyle.iconSize}
              color={variantStyle.text}
              style={styles.rightIcon}
            />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftIcon: {
    marginRight: Spacing.xs,
  },
  rightIcon: {
    marginLeft: Spacing.xs,
  },
});
