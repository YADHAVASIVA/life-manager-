/**
 * InputField — Styled text input with label, error, and icon support
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, TextStyles } from '@/constants/theme';

interface InputFieldProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  /** If true, toggles password visibility with an eye icon */
  isPassword?: boolean;
}

export function InputField({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  isPassword = false,
  secureTextEntry,
  ...textInputProps
}: InputFieldProps) {
  const [focused, setFocused] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const showSecure = isPassword ? !passwordVisible : (secureTextEntry ?? false);
  const borderColor = error ? Colors.danger : focused ? Colors.primary : Colors.border;

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View style={[styles.inputRow, { borderColor }]}>
        {leftIcon && (
          <MaterialCommunityIcons
            name={leftIcon as any}
            size={18}
            color={focused ? Colors.primary : Colors.textMuted}
            style={styles.leftIcon}
          />
        )}

        <TextInput
          style={styles.input}
          placeholderTextColor={Colors.textMuted}
          selectionColor={Colors.primary}
          secureTextEntry={showSecure}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...textInputProps}
        />

        {isPassword ? (
          <TouchableOpacity
            onPress={() => setPasswordVisible((v) => !v)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MaterialCommunityIcons
              name={passwordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={18}
              color={Colors.textMuted}
              style={styles.rightIcon}
            />
          </TouchableOpacity>
        ) : rightIcon ? (
          <TouchableOpacity
            onPress={onRightIconPress}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MaterialCommunityIcons
              name={rightIcon as any}
              size={18}
              color={Colors.textMuted}
              style={styles.rightIcon}
            />
          </TouchableOpacity>
        ) : null}
      </View>

      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: Spacing.md,
  },
  label: {
    ...TextStyles.label,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.sm,
    borderWidth: 1,
    minHeight: Spacing.touchTarget,
    paddingHorizontal: Spacing.md,
  },
  leftIcon: {
    marginRight: Spacing.sm,
  },
  rightIcon: {
    marginLeft: Spacing.sm,
  },
  input: {
    flex: 1,
    ...TextStyles.body,
    color: Colors.textPrimary,
    paddingVertical: Spacing.md12,
  },
  error: {
    ...TextStyles.tiny,
    color: Colors.danger,
    marginTop: Spacing.xs,
  },
  hint: {
    ...TextStyles.tiny,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
  },
});
