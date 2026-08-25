/**
 * Bottom Tab Navigator
 * 5 primary tabs: Home, Tasks, Nutrition, Progress, Profile
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { BottomTabParamList } from './types';
import { Colors, Spacing, Radius } from '@/constants/theme';
import { PlaceholderScreen, HomeScreen, TasksScreen, NutritionScreen, ProgressScreen } from '@/screens';

const Tab = createBottomTabNavigator<BottomTabParamList>();

type TabIconName =
  | 'home-variant'
  | 'home-variant-outline'
  | 'checkbox-marked-circle-outline'
  | 'checkbox-marked-circle'
  | 'food-apple-outline'
  | 'food-apple'
  | 'chart-line'
  | 'chart-line-variant'
  | 'account-circle-outline'
  | 'account-circle';

interface TabConfig {
  name: keyof BottomTabParamList;
  label: string;
  activeIcon: TabIconName;
  inactiveIcon: TabIconName;
  accentColor: string;
}

const TAB_CONFIG: TabConfig[] = [
  {
    name: 'Home',
    label: 'Home',
    activeIcon: 'home-variant',
    inactiveIcon: 'home-variant-outline',
    accentColor: Colors.primary,
  },
  {
    name: 'Tasks',
    label: 'Tasks',
    activeIcon: 'checkbox-marked-circle',
    inactiveIcon: 'checkbox-marked-circle-outline',
    accentColor: Colors.primary,
  },
  {
    name: 'Nutrition',
    label: 'Nutrition',
    activeIcon: 'food-apple',
    inactiveIcon: 'food-apple-outline',
    accentColor: Colors.nutrition,
  },
  {
    name: 'Progress',
    label: 'Progress',
    activeIcon: 'chart-line-variant',
    inactiveIcon: 'chart-line',
    accentColor: Colors.workout,
  },
  {
    name: 'Profile',
    label: 'Profile',
    activeIcon: 'account-circle',
    inactiveIcon: 'account-circle-outline',
    accentColor: Colors.primary,
  },
];

export function BottomTabNavigator() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: [
          styles.tabBar,
          { paddingBottom: Math.max(insets.bottom, Spacing.sm) },
        ],
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: styles.tabLabel,
        tabBarBackground: () => <View style={styles.tabBarBackground} />,
      }}
    >
      {TAB_CONFIG.map((tab) => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={(tab.name === 'Home' ? HomeScreen : tab.name === 'Tasks' ? TasksScreen : tab.name === 'Nutrition' ? NutritionScreen : tab.name === 'Progress' ? ProgressScreen : PlaceholderScreen) as React.ComponentType<any>}
          options={{
            tabBarLabel: tab.label,
            tabBarIcon: ({ focused, color, size }) => (
              <MaterialCommunityIcons
                name={focused ? tab.activeIcon : tab.inactiveIcon}
                size={size}
                color={focused ? tab.accentColor : color}
              />
            ),
            tabBarActiveTintColor: tab.accentColor,
          }}
        />
      ))}
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: 'transparent',
    elevation: 0,
    height: Spacing.bottomNavHeight + Spacing.sm,
    paddingTop: Spacing.xs,
  },
  tabBarBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.3,
    marginTop: 2,
  },
});
