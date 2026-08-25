/**
 * User — Core profile model
 */
export interface User {
  id: string;
  name: string;
  age: number;
  heightCm: number;
  weightKg: number;
  targetWeightKg: number;
  targetWeightMinKg: number;
  targetWeightMaxKg: number;
  /** 24h format: "06:30" */
  wakeTime: string;
  /** 24h format: "23:00" */
  sleepTime: string;
  sleepTargetEnd: string;
  /** 24h format: "08:15" */
  collegeStartTime: string;
  /** 24h format: "14:45" */
  collegeEndTime: string;
  /** Days per week 1–7 */
  gymDaysPerWeek: number;
  /** Baseline water in mL */
  waterBaselineML: number;
  /** Target water in mL */
  waterTargetML: number;
  /** ISO 8601 */
  createdAt: string;
  updatedAt: string;
  /** Optional profile picture URI */
  avatarUri?: string;
}
