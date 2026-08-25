/**
 * LifeOS Color Palette
 * Single source of truth for all colors in the application.
 * Never use raw hex values outside this file.
 */

export const Colors = {
  // ─── Backgrounds ───────────────────────────────────────────────
  /** Primary app background — deepest layer */
  background: '#0A0A0F',
  /** Surface background — cards, sheets */
  surface: '#12121A',
  /** Elevated surface — modals, tooltips, dropdowns */
  surfaceElevated: '#1C1C28',
  /** Subtle highlight overlay (pressed states etc.) */
  surfaceHighlight: '#252535',

  // ─── Brand / Primary ───────────────────────────────────────────
  /** Primary gold accent */
  primary: '#C9A84C',
  /** Gold — lighter variant for text/icon on dark */
  primaryLight: '#E4C46A',
  /** Gold — darker variant for pressed states */
  primaryDark: '#A8872E',
  /** Gold at 15% opacity — subtle tint backgrounds */
  primaryMuted: 'rgba(201, 168, 76, 0.15)',
  /** Gold at 8% opacity — very subtle tint */
  primaryFaint: 'rgba(201, 168, 76, 0.08)',

  // ─── Text ──────────────────────────────────────────────────────
  /** Primary text — headings, body */
  textPrimary: '#F0F0F5',
  /** Secondary text — subtitles, labels */
  textSecondary: '#A0A0B0',
  /** Muted text — placeholders, hints, disabled */
  textMuted: '#5A5A72',
  /** Inverse text — text on gold/light backgrounds */
  textInverse: '#0A0A0F',

  // ─── Borders ───────────────────────────────────────────────────
  /** Default border */
  border: '#1E1E2E',
  /** Subtle border — dividers */
  borderSubtle: '#16161F',
  /** Focused/active border */
  borderActive: '#C9A84C',

  // ─── Semantic ──────────────────────────────────────────────────
  /** Success green — completed tasks, goals met */
  success: '#4CAF82',
  successMuted: 'rgba(76, 175, 130, 0.15)',
  /** Warning amber — upcoming deadlines, low stock */
  warning: '#F0A500',
  warningMuted: 'rgba(240, 165, 0, 0.15)',
  /** Danger red — errors, missed, overdue */
  danger: '#E05C5C',
  dangerMuted: 'rgba(224, 92, 92, 0.15)',
  /** Info blue */
  info: '#5B9CF6',
  infoMuted: 'rgba(91, 156, 246, 0.15)',

  // ─── Domain / Semantic ─────────────────────────────────────────
  /** Water / hydration — cyan */
  water: '#38BDF8',
  waterMuted: 'rgba(56, 189, 248, 0.15)',
  /** Workout / fitness — vibrant green */
  workout: '#22C55E',
  workoutMuted: 'rgba(34, 197, 94, 0.15)',
  /** Nutrition / food — warm orange */
  nutrition: '#FB923C',
  nutritionMuted: 'rgba(251, 146, 60, 0.15)',
  /** Finance / money — gold (same as primary) */
  finance: '#C9A84C',
  financeMuted: 'rgba(201, 168, 76, 0.15)',
  /** Sleep — soft purple */
  sleep: '#A78BFA',
  sleepMuted: 'rgba(167, 139, 250, 0.15)',
  /** College / schedule — cyan-blue */
  schedule: '#67E8F9',
  scheduleMuted: 'rgba(103, 232, 249, 0.15)',

  // ─── Utility ───────────────────────────────────────────────────
  transparent: 'transparent',
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(0, 0, 0, 0.6)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
} as const;

export type ColorKey = keyof typeof Colors;
