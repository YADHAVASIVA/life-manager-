/**
 * LifeOS Typography Scale
 * Consistent type hierarchy from Display down to Caption.
 * Font: System default (San Francisco on iOS, Roboto on Android).
 */

import { TextStyle } from 'react-native';

export const FontSize = {
  /** 32px — Hero numbers, display metrics */
  display: 32,
  /** 28px — Large hero headings */
  hero: 28,
  /** 24px — Screen titles */
  h1: 24,
  /** 20px — Section headings */
  h2: 20,
  /** 18px — Card headings */
  h3: 18,
  /** 16px — Sub-headings, list items */
  h4: 16,
  /** 15px — Body text */
  body: 15,
  /** 14px — Secondary body, labels */
  bodySmall: 14,
  /** 13px — Dense labels, metadata */
  caption: 13,
  /** 12px — Fine print, timestamps */
  tiny: 12,
  /** 11px — Badges, tags */
  micro: 11,
} as const;

export const FontWeight = {
  light: '300' as TextStyle['fontWeight'],
  regular: '400' as TextStyle['fontWeight'],
  medium: '500' as TextStyle['fontWeight'],
  semiBold: '600' as TextStyle['fontWeight'],
  bold: '700' as TextStyle['fontWeight'],
  extraBold: '800' as TextStyle['fontWeight'],
} as const;

export const LineHeight = {
  tight: 1.2,
  snug: 1.35,
  normal: 1.5,
  relaxed: 1.625,
} as const;

/** Pre-composed text style presets */
export const TextStyles = {
  /** 32px / Bold — large metric numbers */
  display: {
    fontSize: FontSize.display,
    fontWeight: FontWeight.bold,
    letterSpacing: -0.5,
    lineHeight: FontSize.display * LineHeight.tight,
  } as TextStyle,

  /** 28px / Bold — hero headings */
  hero: {
    fontSize: FontSize.hero,
    fontWeight: FontWeight.bold,
    letterSpacing: -0.3,
    lineHeight: FontSize.hero * LineHeight.tight,
  } as TextStyle,

  /** 24px / Bold — screen titles */
  h1: {
    fontSize: FontSize.h1,
    fontWeight: FontWeight.bold,
    letterSpacing: -0.2,
    lineHeight: FontSize.h1 * LineHeight.snug,
  } as TextStyle,

  /** 20px / SemiBold — section headings */
  h2: {
    fontSize: FontSize.h2,
    fontWeight: FontWeight.semiBold,
    letterSpacing: -0.1,
    lineHeight: FontSize.h2 * LineHeight.snug,
  } as TextStyle,

  /** 18px / SemiBold — card headings */
  h3: {
    fontSize: FontSize.h3,
    fontWeight: FontWeight.semiBold,
    lineHeight: FontSize.h3 * LineHeight.snug,
  } as TextStyle,

  /** 16px / Medium — sub-headings */
  h4: {
    fontSize: FontSize.h4,
    fontWeight: FontWeight.medium,
    lineHeight: FontSize.h4 * LineHeight.normal,
  } as TextStyle,

  /** 15px / Regular — standard body */
  body: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.regular,
    lineHeight: FontSize.body * LineHeight.normal,
  } as TextStyle,

  /** 14px / Regular — secondary body */
  bodySmall: {
    fontSize: FontSize.bodySmall,
    fontWeight: FontWeight.regular,
    lineHeight: FontSize.bodySmall * LineHeight.normal,
  } as TextStyle,

  /** 14px / Medium — labels, form labels */
  label: {
    fontSize: FontSize.bodySmall,
    fontWeight: FontWeight.medium,
    letterSpacing: 0.1,
    lineHeight: FontSize.bodySmall * LineHeight.snug,
  } as TextStyle,

  /** 13px / Regular — captions, hints */
  caption: {
    fontSize: FontSize.caption,
    fontWeight: FontWeight.regular,
    lineHeight: FontSize.caption * LineHeight.normal,
  } as TextStyle,

  /** 12px / Regular — timestamps, fine print */
  tiny: {
    fontSize: FontSize.tiny,
    fontWeight: FontWeight.regular,
    lineHeight: FontSize.tiny * LineHeight.normal,
  } as TextStyle,

  /** 32px / Bold / Tabular — large metrics, counters */
  metricLarge: {
    fontSize: FontSize.display,
    fontWeight: FontWeight.bold,
    letterSpacing: -1,
    lineHeight: FontSize.display * LineHeight.tight,
  } as TextStyle,

  /** 20px / Bold / Tabular — medium metrics */
  metricMedium: {
    fontSize: FontSize.h2,
    fontWeight: FontWeight.bold,
    letterSpacing: -0.5,
    lineHeight: FontSize.h2 * LineHeight.tight,
  } as TextStyle,

  /** 16px / SemiBold — small inline metric */
  metricSmall: {
    fontSize: FontSize.h4,
    fontWeight: FontWeight.semiBold,
    letterSpacing: -0.2,
    lineHeight: FontSize.h4 * LineHeight.tight,
  } as TextStyle,

  /** 11px / SemiBold / UpperCase — section labels, nav tabs */
  overline: {
    fontSize: FontSize.micro,
    fontWeight: FontWeight.semiBold,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    lineHeight: FontSize.micro * LineHeight.normal,
  } as TextStyle,

  /** 13px / Medium — badge / tag text */
  badge: {
    fontSize: FontSize.caption,
    fontWeight: FontWeight.medium,
    letterSpacing: 0.2,
    lineHeight: FontSize.caption * LineHeight.snug,
  } as TextStyle,
} as const;
