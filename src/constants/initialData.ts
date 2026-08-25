/**
 * LifeOS Initial / Seed Data
 * Pre-populated profile, routine, budget, banks, credit card, and reminders.
 * Written to storage on first launch only; fully editable thereafter.
 */

import { User } from '@/models/User';
import { RoutineBlock } from '@/models/Routine';
import { Budget } from '@/models/Finance';
import { BankAccount } from '@/models/BankAccount';
import { CreditCard, computeCreditCardFields } from '@/models/CreditCard';
import { Reminder } from '@/models/Reminder';
import { Streak } from '@/models/Streak';
import { Colors } from '@/constants/colors';

// ─── User Profile ──────────────────────────────────────────────────────────

export const INITIAL_USER: User = {
  id: 'user-001',
  name: 'Omen',
  age: 20,
  heightCm: 178,
  weightKg: 46,
  targetWeightKg: 67.5,
  targetWeightMinKg: 65,
  targetWeightMaxKg: 70,
  wakeTime: '06:30',
  sleepTime: '23:00',
  sleepTargetEnd: '23:15',
  collegeStartTime: '08:15',
  collegeEndTime: '14:45',
  gymDaysPerWeek: 4,
  waterBaselineML: 2250,
  waterTargetML: 2500,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// ─── Budget (₹13,000/month) ────────────────────────────────────────────────
// Rent 3000 + Gym 1250 + GymFood 7250 + SIP 1000 + Misc 500 = 13000

export const INITIAL_BUDGET: Budget = {
  monthlyIncomeINR: 13000,
  rentINR: 3000,
  gymINR: 1250,
  gymFoodINR: 7250,
  sipINR: 1000,
  miscellaneousINR: 500,
  privacyModeEnabled: false,
};

// ─── Bank Accounts ─────────────────────────────────────────────────────────

export const INITIAL_BANK_ACCOUNTS: BankAccount[] = [
  {
    id: 'bank-union',
    bankName: 'union_bank',
    nickname: 'Union Bank — SIP',
    displayBankName: 'Union Bank',
    accountType: 'savings',
    purpose: 'sip_investment',
    balanceINR: 0,
    color: '#C9A84C',
    icon: 'bank',
    isPrimary: false,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'bank-sbi',
    bankName: 'sbi',
    nickname: 'SBI — Daily Use',
    displayBankName: 'State Bank of India',
    accountType: 'savings',
    purpose: 'daily_use',
    balanceINR: 0,
    color: '#38BDF8',
    icon: 'bank-outline',
    isPrimary: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'bank-kotak',
    bankName: 'kotak',
    nickname: 'Kotak — Savings',
    displayBankName: 'Kotak Mahindra Bank',
    accountType: 'savings',
    purpose: 'savings',
    balanceINR: 0,
    color: '#22C55E',
    icon: 'piggy-bank',
    isPrimary: false,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// ─── Credit Card (₹1,800 limit, 30% = ₹540 personal ceiling) ───────────────

const creditCardBase = {
  limitINR: 1800,
  usedINR: 0,
  personalCeilingPercent: 30,
};

const creditCardComputed = computeCreditCardFields(creditCardBase);

export const INITIAL_CREDIT_CARD: CreditCard = {
  id: 'cc-001',
  issuer: 'Unknown',
  nickname: 'My Credit Card',
  limitINR: 1800,
  personalCeilingINR: creditCardComputed.personalCeilingINR,  // 540
  personalCeilingPercent: 30,
  usedINR: 0,
  availableINR: creditCardComputed.availableINR,
  utilizationPercent: creditCardComputed.utilizationPercent,
  utilizationStatus: creditCardComputed.utilizationStatus,
  paymentDueDay: 15,
  statementDay: 1,
  outstandingINR: 0,
  isActive: true,
  color: '#A78BFA',
  icon: 'credit-card-outline',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// ─── Daily Routine Blocks ──────────────────────────────────────────────────

export const INITIAL_ROUTINE: RoutineBlock[] = [
  {
    id: 'routine-001',
    time: '06:30',
    title: 'Wake Up + Hydrate',
    subtitle: 'Start the day with 500ml water',
    icon: 'weather-sunset-up',
    color: '#F0A500',
    category: 'health',
    enabled: true,
    order: 0,
  },
  {
    id: 'routine-002',
    time: '07:15',
    title: 'Breakfast',
    subtitle: 'High protein breakfast',
    icon: 'food-apple',
    color: '#FB923C',
    category: 'nutrition',
    enabled: true,
    order: 1,
  },
  {
    id: 'routine-003',
    time: '08:15',
    title: 'College',
    subtitle: 'Classes until 2:45 PM',
    icon: 'school',
    color: '#67E8F9',
    category: 'college',
    enabled: true,
    order: 2,
  },
  {
    id: 'routine-004',
    time: '16:30',
    title: 'Coding / Project',
    subtitle: 'Deep work session',
    icon: 'code-braces',
    color: '#5B9CF6',
    category: 'work',
    enabled: true,
    order: 3,
  },
  {
    id: 'routine-005',
    time: '17:30',
    title: 'Pre-Gym Food',
    subtitle: 'Fuel before workout',
    icon: 'food-drumstick',
    color: '#FB923C',
    category: 'nutrition',
    enabled: true,
    order: 4,
  },
  {
    id: 'routine-006',
    time: '18:00',
    title: 'Gym',
    subtitle: 'Workout session',
    icon: 'dumbbell',
    color: '#22C55E',
    category: 'fitness',
    enabled: true,
    order: 5,
  },
  {
    id: 'routine-007',
    time: '19:30',
    title: 'Post-Gym Food',
    subtitle: 'Recovery nutrition',
    icon: 'food-variant',
    color: '#4CAF82',
    category: 'nutrition',
    enabled: true,
    order: 6,
  },
  {
    id: 'routine-008',
    time: '20:15',
    title: 'Study / Project',
    subtitle: 'Evening deep work',
    icon: 'book-open-variant',
    color: '#A78BFA',
    category: 'study',
    enabled: true,
    order: 7,
  },
  {
    id: 'routine-009',
    time: '22:30',
    title: 'Wind Down',
    subtitle: 'Relax, no screens',
    icon: 'sleep',
    color: '#A78BFA',
    category: 'health',
    enabled: true,
    order: 8,
  },
  {
    id: 'routine-010',
    time: '23:00',
    title: 'Sleep',
    subtitle: '7-8 hours target',
    icon: 'moon-waning-crescent',
    color: '#A78BFA',
    category: 'health',
    enabled: true,
    order: 9,
  },
];

// ─── Centralized Reminders ─────────────────────────────────────────────────

export const INITIAL_REMINDERS: Reminder[] = [
  { id: 'rem-001', type: 'wake_up', category: 'routine', title: 'Wake Up', subtitle: 'Good morning!', time: '06:30', frequency: 'daily', enabled: true, icon: 'alarm', color: '#F0A500', order: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'rem-002', type: 'hydrate', category: 'water', title: 'Hydrate', subtitle: 'Drink 500ml water', time: '06:35', frequency: 'daily', enabled: true, icon: 'cup-water', color: '#38BDF8', order: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'rem-003', type: 'breakfast', category: 'nutrition', title: 'Breakfast Time', subtitle: 'High protein meal', time: '07:15', frequency: 'daily', enabled: true, icon: 'food-apple', color: '#FB923C', order: 2, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'rem-006', type: 'lunch', category: 'nutrition', title: 'Lunch', subtitle: 'Midday meal', time: '13:30', frequency: 'daily', enabled: true, icon: 'food', color: '#FB923C', order: 5, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'rem-009', type: 'gym_pre', category: 'nutrition', title: 'Pre-Gym Food', subtitle: 'Fuel up for workout', time: '17:30', frequency: 'daily', enabled: true, icon: 'food-drumstick', color: '#FB923C', order: 8, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'rem-010', type: 'gym', category: 'gym', title: 'Gym Time', subtitle: 'Workout session', time: '18:00', frequency: 'daily', enabled: true, icon: 'dumbbell', color: '#22C55E', order: 9, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'rem-011', type: 'gym_post', category: 'nutrition', title: 'Post-Gym Food', subtitle: 'Recovery nutrition', time: '19:30', frequency: 'daily', enabled: true, icon: 'food-variant', color: '#4CAF82', order: 10, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

export const INITIAL_STREAKS: Streak[] = [
  { id: 'streak-nutrition', domain: 'nutrition', label: 'Nutrition', currentStreak: 0, bestStreak: 0, lastCompletedDate: null, streakStartDate: null, totalDaysCompleted: 0, weeklyConsistency: 0, color: '#f9a826', icon: 'food-apple', updatedAt: new Date().toISOString() },
  { id: 'streak-weight', domain: 'weight', label: 'Weight Tracking', currentStreak: 0, bestStreak: 0, lastCompletedDate: null, streakStartDate: null, totalDaysCompleted: 0, weeklyConsistency: 0, color: '#f39c12', icon: 'scale', updatedAt: new Date().toISOString() },
  { id: 'streak-gym', domain: 'gym', label: 'Gym', currentStreak: 0, bestStreak: 0, lastCompletedDate: null, streakStartDate: null, totalDaysCompleted: 0, weeklyConsistency: 0, color: '#22C55E', icon: 'dumbbell', updatedAt: new Date().toISOString() },
  { id: 'streak-water', domain: 'water', label: 'Hydration', currentStreak: 0, bestStreak: 0, lastCompletedDate: null, streakStartDate: null, totalDaysCompleted: 0, weeklyConsistency: 0, color: '#38BDF8', icon: 'cup-water', updatedAt: new Date().toISOString() },
  { id: 'streak-tasks', domain: 'tasks', label: 'Tasks', currentStreak: 0, bestStreak: 0, lastCompletedDate: null, streakStartDate: null, totalDaysCompleted: 0, weeklyConsistency: 0, color: '#A78BFA', icon: 'check-circle-outline', updatedAt: new Date().toISOString() },
];
