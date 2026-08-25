/**
 * SafeScreen — Base screen layout wrapper
 * Handles safe area, background color, and optional scroll.
 */

import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ViewStyle,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing } from '@/constants/theme';

interface SafeScreenProps {
  children: React.ReactNode;
  scrollable?: boolean;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  backgroundColor?: string;
  /** Add bottom padding for the tab bar */
  withTabBar?: boolean;
  /** Adjust for keyboard */
  keyboardAvoiding?: boolean;
}

export function SafeScreen({
  children,
  scrollable = false,
  style,
  contentStyle,
  backgroundColor = Colors.background,
  withTabBar = true,
  keyboardAvoiding = false,
}: SafeScreenProps) {
  const content = scrollable ? (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.scrollContent,
        withTabBar && styles.withTabBarPadding,
        contentStyle,
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View
      style={[
        styles.content,
        withTabBar && styles.withTabBarPadding,
        contentStyle,
      ]}
    >
      {children}
    </View>
  );

  const inner = (
    <SafeAreaView
      style={[styles.container, { backgroundColor }, style]}
      edges={['top', 'left', 'right']}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor={backgroundColor}
        translucent={false}
      />
      {content}
    </SafeAreaView>
  );

  if (keyboardAvoiding) {
    return (
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {inner}
      </KeyboardAvoidingView>
    );
  }

  return inner;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.screenPaddingH,
    paddingTop: Spacing.screenPaddingV,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.screenPaddingH,
    paddingTop: Spacing.screenPaddingV,
  },
  withTabBarPadding: {
    paddingBottom: Spacing.bottomNavHeight + Spacing.xl,
  },
});
