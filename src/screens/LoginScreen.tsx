import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';
import { SafeScreen } from '@/components/layout/SafeScreen';

export function LoginScreen() {
  return (
    <SafeScreen style={styles.container}>
      <Text style={styles.text}>Login Screen (Placeholder)</Text>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: Colors.textPrimary,
    fontSize: 18,
  },
});
