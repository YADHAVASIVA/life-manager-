/**
 * LoadingState — Full-screen or inline loading indicator
 */

import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Spacing, TextStyles } from '@/constants/theme';

interface LoadingStateProps {
  message?: string;
  /** If true, takes up full screen */
  fullScreen?: boolean;
  color?: string;
  style?: ViewStyle;
}

export function LoadingState({
  message,
  fullScreen = false,
  color = Colors.primary,
  style,
}: LoadingStateProps) {
  return (
    <View style={[styles.container, fullScreen && styles.fullScreen, style]}>
      <ActivityIndicator size="large" color={color} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
  },
  fullScreen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  message: {
    ...TextStyles.bodySmall,
    color: Colors.textMuted,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
});
