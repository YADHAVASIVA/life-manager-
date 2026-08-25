/**
 * PlaceholderScreen
 * Temporary screen shown in tab navigator slots until real screens are built.
 * Displays the tab name with the correct accent color and the design system preview.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeScreen } from '@/components/layout/SafeScreen';
import { Colors, TextStyles, Spacing } from '@/constants/theme';

// Tab-specific accent colors
const TAB_ACCENTS: Record<string, string> = {
  Home: Colors.primary,
  Tasks: Colors.primary,
  Nutrition: Colors.nutrition,
  Progress: Colors.workout,
  Profile: Colors.primary,
};

const TAB_ICONS: Record<string, string> = {
  Home: 'home-variant',
  Tasks: 'checkbox-marked-circle',
  Nutrition: 'food-apple',
  Progress: 'chart-line-variant',
  Profile: 'account-circle',
};

interface PlaceholderScreenProps {
  route: {
    name: string;
  };
}

export function PlaceholderScreen({ route }: PlaceholderScreenProps) {
  const tabName = route.name;
  const accent = TAB_ACCENTS[tabName] ?? Colors.primary;
  const icon = TAB_ICONS[tabName] ?? 'dots-horizontal';

  return (
    <SafeScreen scrollable={false} withTabBar>
      <View style={styles.container}>
        <View style={[styles.iconContainer, { backgroundColor: `${accent}15` }]}>
          <MaterialCommunityIcons name={icon as any} size={48} color={accent} />
        </View>
        <Text style={[styles.tabName, { color: accent }]}>{tabName}</Text>
        <Text style={styles.subtitle}>Coming in the next build step</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Foundation Ready ✓</Text>
        </View>
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: Spacing.xxl,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  tabName: {
    ...TextStyles.h1,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...TextStyles.body,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  badge: {
    backgroundColor: Colors.successMuted,
    borderRadius: 20,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.success,
  },
  badgeText: {
    ...TextStyles.badge,
    color: Colors.success,
  },
});
