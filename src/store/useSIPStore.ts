/**
 * SIP Store — manages SIP plans and contribution history
 */

import { create } from 'zustand';
import { SIPPlan, SIPContribution } from '@/models/SIP';
import { storageGet, storageSet, STORAGE_KEYS } from '@/services/storage';
import { format } from 'date-fns';

interface SIPState {
  plans: SIPPlan[];
  contributions: SIPContribution[];
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  addPlan: (plan: SIPPlan) => Promise<void>;
  updatePlan: (id: string, partial: Partial<SIPPlan>) => Promise<void>;
  removePlan: (id: string) => Promise<void>;
  recordContribution: (contribution: SIPContribution) => Promise<void>;
  getPlanContributions: (planId: string) => SIPContribution[];
  getCurrentMonthStatus: (planId: string) => SIPContribution | undefined;
  getTotalInvested: () => number;
}

export const useSIPStore = create<SIPState>((set, get) => ({
  plans: [],
  contributions: [],
  isHydrated: false,

  hydrate: async () => {
    const plans = await storageGet<SIPPlan[]>(STORAGE_KEYS.SIP_PLANS);
    const contributions = await storageGet<SIPContribution[]>(STORAGE_KEYS.SIP_CONTRIBUTIONS);
    set({ plans: plans ?? [], contributions: contributions ?? [], isHydrated: true });
  },

  addPlan: async (plan) => {
    const plans = [...get().plans, plan];
    set({ plans });
    await storageSet(STORAGE_KEYS.SIP_PLANS, plans);
  },

  updatePlan: async (id, partial) => {
    const plans = get().plans.map((p) =>
      p.id === id ? { ...p, ...partial, updatedAt: new Date().toISOString() } : p
    );
    set({ plans });
    await storageSet(STORAGE_KEYS.SIP_PLANS, plans);
  },

  removePlan: async (id) => {
    const plans = get().plans.filter((p) => p.id !== id);
    set({ plans });
    await storageSet(STORAGE_KEYS.SIP_PLANS, plans);
  },

  recordContribution: async (contribution) => {
    const contributions = [...get().contributions, contribution];
    set({ contributions });
    await storageSet(STORAGE_KEYS.SIP_CONTRIBUTIONS, contributions);
    // Update plan totals
    if (contribution.status === 'completed') {
      const plan = get().plans.find((p) => p.id === contribution.sipPlanId);
      if (plan) {
        await get().updatePlan(plan.id, {
          totalInvestedINR: plan.totalInvestedINR + contribution.amountINR,
          totalContributions: plan.totalContributions + 1,
        });
      }
    }
  },

  getPlanContributions: (planId) =>
    get().contributions.filter((c) => c.sipPlanId === planId),

  getCurrentMonthStatus: (planId) => {
    const month = format(new Date(), 'yyyy-MM');
    return get().contributions.find(
      (c) => c.sipPlanId === planId && c.date.startsWith(month)
    );
  },

  getTotalInvested: () =>
    get().plans.reduce((sum, p) => sum + p.totalInvestedINR, 0),
}));
