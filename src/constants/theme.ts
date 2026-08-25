/**
 * LifeOS Design System — Master Theme
 * Single export that bundles all design tokens.
 * Import { Theme } from '@/constants/theme' everywhere.
 */

import { Colors } from './colors';
import { Spacing } from './spacing';
import { FontSize, FontWeight, TextStyles } from './typography';

export const Radius = {
  /** 4px — tags, badges, chips */
  xs: 4,
  /** 8px — buttons, small cards */
  sm: 8,
  /** 12px — standard cards */
  md: 12,
  /** 16px — large cards, modals */
  lg: 16,
  /** 20px — bottom sheets */
  xl: 20,
  /** 24px — hero cards */
  xxl: 24,
  /** 9999px — pill / full round */
  full: 9999,
} as const;

export const Shadow = {
  /** Very subtle shadow for flat cards */
  sm: {
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  /** Standard card shadow */
  md: {
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  /** Modal / bottom sheet shadow */
  lg: {
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  /** Gold glow — use very sparingly */
  goldGlow: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
} as const;

export const Animation = {
  /** Fast micro-interaction */
  fast: 150,
  /** Standard transition */
  normal: 250,
  /** Slow reveal */
  slow: 400,
} as const;

export const Theme = {
  colors: Colors,
  spacing: Spacing,
  fontSize: FontSize,
  fontWeight: FontWeight,
  textStyles: TextStyles,
  radius: Radius,
  shadow: Shadow,
  animation: Animation,
} as const;

export type Theme = typeof Theme;

// Re-export individual tokens for convenience
export { Colors, Spacing, FontSize, FontWeight, TextStyles };
