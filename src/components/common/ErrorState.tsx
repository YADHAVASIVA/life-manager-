/**
 * ErrorState — Error display with retry action
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppButton } from './AppButton';
import { Colors, Spacing, TextStyles } from '@/constants/theme';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  style?: ViewStyle;
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  style,
}: ErrorStateProps) {
  return (
    <View style={[styles.container, style]}>
      <MaterialCommunityIcons
        name="alert-circle-outline"
        size={48}
        color={Colors.danger}
        style={styles.icon}
      />
      <Text style={styles.title}>{title}</Text>
      {message && <Text style={styles.message}>{message}</Text>}
      {onRetry && (
        <AppButton
          label="Try Again"
          onPress={onRetry}
          variant="ghost"
          size="sm"
          leftIcon="refresh"
          style={styles.retry}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
  },
  icon: {
    marginBottom: Spacing.md,
  },
  title: {
    ...TextStyles.h4,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  message: {
    ...TextStyles.bodySmall,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  retry: {
    marginTop: Spacing.sm,
  },
});
