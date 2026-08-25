/**
 * ProgressBar — Horizontal progress bar
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Spacing, Radius, TextStyles } from '@/constants/theme';

interface ProgressBarProps {
  /** 0–100 */
  progress: number;
  color?: string;
  trackColor?: string;
  height?: number;
  showLabel?: boolean;
  label?: string;
  labelRight?: string;
  style?: ViewStyle;
  animated?: boolean;
}

export function ProgressBar({
  progress,
  color = Colors.primary,
  trackColor = Colors.border,
  height = 6,
  showLabel = false,
  label,
  labelRight,
  style,
}: ProgressBarProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <View style={style}>
      {showLabel && (
        <View style={styles.labelRow}>
          {label && <Text style={styles.label}>{label}</Text>}
          {labelRight && <Text style={styles.labelRight}>{labelRight}</Text>}
        </View>
      )}
      <View style={[styles.track, { backgroundColor: trackColor, height, borderRadius: height / 2 }]}>
        <View
          style={[
            styles.fill,
            {
              backgroundColor: color,
              width: `${clampedProgress}%`,
              height,
              borderRadius: height / 2,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  label: {
    ...TextStyles.caption,
    color: Colors.textSecondary,
  },
  labelRight: {
    ...TextStyles.caption,
    color: Colors.textMuted,
  },
  track: {
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
});
