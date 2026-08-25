/**
 * App Navigator — Root navigation stack
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { RootStackParamList } from './types';
import { SplashScreen, OnboardingScreen, LoginScreen, RemindersScreen,  WaterScreen,
  WeightScreen,
  WorkoutScreen,
  FinanceScreen,
  CalendarScreen,
} from '@/screens';
import { BottomTabNavigator } from './BottomTabNavigator';
import { Colors } from '@/constants/theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator({ hasOnboarded }: { hasOnboarded: boolean }) {
  return (
    <NavigationContainer
      theme={{
        dark: true,
        colors: {
          primary: Colors.primary,
          background: Colors.background,
          card: Colors.surface,
          text: Colors.textPrimary,
          border: Colors.border,
          notification: Colors.primary,
        },
      }}
    >
      <Stack.Navigator
        initialRouteName={hasOnboarded ? 'Main' : 'Splash'}
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.background },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Main" component={BottomTabNavigator} />
        <Stack.Screen name="Reminders" component={RemindersScreen} options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="Water" component={WaterScreen} options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="Weight" component={WeightScreen} options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="Workout" component={WorkoutScreen} options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="Finance" component={FinanceScreen} options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="Calendar" component={CalendarScreen} options={{ animation: 'slide_from_bottom' }} />
        {/* Future screens: */}
        {/* <Stack.Screen name="AddTask" component={AddTaskScreen} options={{ presentation: 'modal' }} /> */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
