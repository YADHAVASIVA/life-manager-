/**
 * PrivacyAmount — Masks financial amounts when privacy mode is enabled
 * Usage: <PrivacyAmount amount={13000} prefix="₹" />
 */

import React from 'react';
import { Text, TouchableOpacity, StyleSheet, TextStyle } from 'react-native';
import { Colors, TextStyles } from '@/constants/theme';

interface PrivacyAmountProps {
  /** Numeric amount */
  amount: number;
  /** Currency prefix, e.g. "₹" */
  prefix?: string;
  /** Currency suffix, e.g. "K" */
  suffix?: string;
  /** Whether privacy mode is active */
  hidden?: boolean;
  /** Text style preset */
  style?: import('react-native').StyleProp<import('react-native').TextStyle>;
  /** Allow tapping to reveal temporarily */
  allowReveal?: boolean;
  /** Decimal places */
  decimals?: number;
}

export function PrivacyAmount({
  amount,
  prefix = '₹',
  suffix = '',
  hidden = false,
  style,
  allowReveal = false,
  decimals = 0,
}: PrivacyAmountProps) {
  const [revealed, setRevealed] = React.useState(false);

  const formatted = `${prefix}${amount.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}${suffix}`;

  const masked = `${prefix}•••••${suffix}`;
  const displayText = hidden && !revealed ? masked : formatted;

  if (allowReveal && hidden) {
    return (
      <TouchableOpacity
        onPress={() => setRevealed((r) => !r)}
        activeOpacity={0.7}
        accessibilityLabel={revealed ? 'Hide amount' : 'Reveal amount'}
        accessibilityRole="button"
      >
        <Text style={[styles.amount, style]}>{displayText}</Text>
      </TouchableOpacity>
    );
  }

  return <Text style={[styles.amount, style]}>{displayText}</Text>;
}

const styles = StyleSheet.create({
  amount: {
    ...TextStyles.metricMedium,
    color: Colors.textPrimary,
  },
});
