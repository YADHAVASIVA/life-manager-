/**
 * ProgressRing — Circular progress indicator using SVG
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Colors, TextStyles } from '@/constants/theme';

interface ProgressRingProps {
  /** 0–100 */
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  /** Label shown in the center */
  centerLabel?: string;
  /** Sub-label shown below center label */
  centerSublabel?: string;
  style?: ViewStyle;
}

export function ProgressRing({
  progress,
  size = 80,
  strokeWidth = 8,
  color = Colors.primary,
  trackColor = Colors.border,
  centerLabel,
  centerSublabel,
  style,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedProgress = Math.min(100, Math.max(0, progress));
  const strokeDashoffset = circumference - (clampedProgress / 100) * circumference;
  const center = size / 2;

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <Svg width={size} height={size} style={styles.svg}>
        {/* Track */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${center}, ${center}`}
        />
      </Svg>
      {(centerLabel || centerSublabel) && (
        <View style={styles.centerContent}>
          {centerLabel && (
            <Text style={[styles.centerLabel, { color }]} numberOfLines={1}>
              {centerLabel}
            </Text>
          )}
          {centerSublabel && (
            <Text style={styles.centerSublabel} numberOfLines={1}>
              {centerSublabel}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    position: 'absolute',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerLabel: {
    ...TextStyles.metricSmall,
  },
  centerSublabel: {
    ...TextStyles.tiny,
    color: Colors.textMuted,
  },
});
