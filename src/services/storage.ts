/**
 * LifeOS Storage Service
 *
 * AsyncStorage-backed key-value store with typed helpers.
 * Swap AsyncStorage import for MMKV when using a native dev build.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Storage Keys ──────────────────────────────────────────────────────────

export const STORAGE_KEYS = {
  // Core
  USER: 'lifeos:user',
  GOALS: 'lifeos:goals',
  TASKS: 'lifeos:tasks',
  ALARMS: 'lifeos:alarms',
  WATER_LOGS: 'lifeos:water_logs',
  WATER_PRESETS: 'lifeos:water_presets',
  WEIGHT_LOGS: 'lifeos:weight_logs',
  WORKOUTS: 'lifeos:workouts',
  WORKOUT_TEMPLATES: 'lifeos:workout_templates',
  WORKOUT_ACTIVE_SESSION: 'lifeos:workout_active_session',
  MEALS: 'lifeos:meals',
  NUTRITION_TARGET: 'lifeos:nutrition_target',
  EXPENSES: 'lifeos:expenses',
  BUDGET: 'lifeos:budget',
  SIP_RECORDS: 'lifeos:sip_records',
  NOTIFICATIONS: 'lifeos:notifications',
  ROUTINE: 'lifeos:routine',

  // Finance — Extended (Step 01)
  BANK_ACCOUNTS: 'lifeos:bank_accounts',
  BANK_TRANSACTIONS: 'lifeos:bank_transactions',
  CREDIT_CARDS: 'lifeos:credit_cards',
  CREDIT_CARD_TRANSACTIONS: 'lifeos:credit_card_transactions',
  SAVINGS_GOALS: 'lifeos:savings_goals',
  SAVINGS_CONTRIBUTIONS: 'lifeos:savings_contributions',
  SIP_PLANS: 'lifeos:sip_plans',
  SIP_CONTRIBUTIONS: 'lifeos:sip_contributions',
  STATEMENTS: 'lifeos:statements',
  FINANCE: 'lifeos:finance',
  FINANCIAL_ALERTS: 'lifeos:financial_alerts',
  ALERT_THRESHOLDS: 'lifeos:alert_thresholds',

  // Gamification (Step 01)
  STREAKS: 'lifeos:streaks',
  DAILY_SCORES: 'lifeos:daily_scores',

  // Reminders (Step 01)
  REMINDERS: 'lifeos:reminders',

  // App meta
  APP_INITIALIZED: 'lifeos:initialized',
  PRIVACY_MODE: 'lifeos:privacy_mode',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

// ─── Storage API ───────────────────────────────────────────────────────────

export async function storageGet<T>(key: StorageKey): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw === null) return null;
    return JSON.parse(raw) as T;
  } catch (error) {
    console.warn(`[Storage] Failed to get key "${key}":`, error);
    return null;
  }
}

export async function storageSet<T>(key: StorageKey, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`[Storage] Failed to set key "${key}":`, error);
  }
}

export async function storageRemove(key: StorageKey): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.warn(`[Storage] Failed to remove key "${key}":`, error);
  }
}

export async function storageClearAll(): Promise<void> {
  try {
    const keys = Object.values(STORAGE_KEYS);
    await AsyncStorage.multiRemove(keys);
  } catch (error) {
    console.warn('[Storage] Failed to clear all data:', error);
  }
}

export async function isAppInitialized(): Promise<boolean> {
  const value = await storageGet<boolean>(STORAGE_KEYS.APP_INITIALIZED);
  return value === true;
}

export async function markAppInitialized(): Promise<void> {
  await storageSet(STORAGE_KEYS.APP_INITIALIZED, true);
}
