/**
 * AppCard — Base card container
 * Used as the visual wrapper for all card-style UI blocks.
 */

import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Colors, Spacing, Radius, Shadow } from '@/constants/theme';

interface AppCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  onLongPress?: () => void;
  /** Elevation variant: 'flat' | 'raised' | 'elevated' */
  elevation?: 'flat' | 'raised' | 'elevated';
  /** Left border accent color */
  accentColor?: string;
  padding?: number;
  accessibilityLabel?: string;
}

export function AppCard({
  children,
  style,
  onPress,
  onLongPress,
  elevation = 'raised',
  accentColor,
  padding = Spacing.cardPadding,
  accessibilityLabel,
}: AppCardProps) {
  const shadowStyle =
    elevation === 'elevated'
      ? Shadow.md
      : elevation === 'raised'
      ? Shadow.sm
      : {};

  const cardContent = (
    <View
      style={[
        styles.card,
        shadowStyle,
        { padding },
        accentColor && styles.withAccent,
        accentColor ? { borderLeftColor: accentColor } : {},
        style,
      ]}
    >
      {children}
    </View>
  );

  if (onPress || onLongPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        onLongPress={onLongPress}
        activeOpacity={0.85}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        style={styles.touchable}
      >
        {cardContent}
      </TouchableOpacity>
    );
  }

  return cardContent;
}

const styles = StyleSheet.create({
  touchable: {
    borderRadius: Radius.md,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  withAccent: {
    borderLeftWidth: 3,
  },
});
