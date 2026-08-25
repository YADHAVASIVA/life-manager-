/**
 * Modal — Reusable bottom sheet / dialog modal
 */

import React from 'react';
import {
  View,
  Text,
  Modal as RNModal,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, TextStyles, Shadow } from '@/constants/theme';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  style?: ViewStyle;
  /** If true, fills more screen height */
  tall?: boolean;
  /** Show a close button in the header */
  showCloseButton?: boolean;
}

export function Modal({
  visible,
  onClose,
  title,
  children,
  style,
  tall = false,
  showCloseButton = true,
}: ModalProps) {
  return (
    <RNModal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Backdrop */}
        <TouchableOpacity
          style={StyleSheet.absoluteFillObject}
          activeOpacity={1}
          onPress={onClose}
          accessibilityLabel="Close modal"
        />

        {/* Sheet */}
        <View style={[styles.sheet, tall && styles.tallSheet, Shadow.lg, style]}>
          {/* Handle */}
          <View style={styles.handle} />

          {/* Header */}
          {(title || showCloseButton) && (
            <View style={styles.header}>
              {title && <Text style={styles.title}>{title}</Text>}
              {showCloseButton && (
                <TouchableOpacity
                  onPress={onClose}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  accessibilityLabel="Close"
                  accessibilityRole="button"
                >
                  <MaterialCommunityIcons
                    name="close"
                    size={22}
                    color={Colors.textSecondary}
                  />
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Content */}
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.surfaceElevated,
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    maxHeight: '80%',
    paddingBottom: Spacing.xl,
  },
  tallSheet: {
    maxHeight: '92%',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: Radius.full,
    alignSelf: 'center',
    marginTop: Spacing.md12,
    marginBottom: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.screenPaddingH,
    paddingVertical: Spacing.md12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    ...TextStyles.h3,
    color: Colors.textPrimary,
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.screenPaddingH,
    paddingTop: Spacing.md,
  },
});
