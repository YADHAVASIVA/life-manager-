/**
 * LifeOS 8-Point Spacing System
 * All spacing values are multiples of 8 (or halves for fine-tuning).
 * Use these constants — never raw pixel numbers.
 */

export const Spacing = {
  /** 2px — micro gap, hairline */
  micro: 2,
  /** 4px — tight gap, icon padding */
  xs: 4,
  /** 8px — base unit */
  sm: 8,
  /** 12px — compact padding */
  md12: 12,
  /** 16px — standard padding */
  md: 16,
  /** 20px — medium gap */
  md20: 20,
  /** 24px — section gap */
  lg: 24,
  /** 32px — section separation */
  xl: 32,
  /** 40px — large section */
  xl40: 40,
  /** 48px — display spacing */
  xxl: 48,
  /** 64px — hero spacing */
  hero: 64,

  // ─── Semantic aliases ─────────────────────────────────────────
  /** Card inner padding */
  cardPadding: 16,
  /** Screen horizontal padding */
  screenPaddingH: 20,
  /** Screen vertical padding */
  screenPaddingV: 24,
  /** Between cards in a list */
  cardGap: 12,
  /** Between sections */
  sectionGap: 32,
  /** Section header bottom margin */
  sectionHeaderBottom: 12,
  /** Icon size — small */
  iconSm: 16,
  /** Icon size — medium */
  iconMd: 20,
  /** Icon size — large */
  iconLg: 24,
  /** Minimum touch target height (≈44dp) */
  touchTarget: 44,
  /** Bottom nav height */
  bottomNavHeight: 64,
  /** Status bar clearance */
  statusBarOffset: 48,
} as const;

export type SpacingKey = keyof typeof Spacing;
