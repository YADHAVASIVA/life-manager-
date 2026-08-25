/**
 * Credit Card Store — manages credit card and transactions
 */

import { create } from 'zustand';
import { CreditCard, CreditCardTransaction, computeCreditCardFields } from '@/models/CreditCard';
import { storageGet, storageSet, STORAGE_KEYS } from '@/services/storage';
import { INITIAL_CREDIT_CARD } from '@/constants/initialData';
import { format } from 'date-fns';

interface CreditCardState {
  card: CreditCard;
  transactions: CreditCardTransaction[];
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  updateCard: (partial: Partial<CreditCard>) => Promise<void>;
  /** Record a purchase — increases usedINR */
  addPurchase: (tx: CreditCardTransaction) => Promise<void>;
  /** Record a payment — decreases usedINR and outstanding */
  addPayment: (tx: CreditCardTransaction) => Promise<void>;
  removeTransaction: (id: string) => Promise<void>;
  getMonthTransactions: (month: string) => CreditCardTransaction[];
  /** Whether current usage has crossed the personal ceiling */
  isAbovePersonalCeiling: () => boolean;
}

export const useCreditCardStore = create<CreditCardState>((set, get) => ({
  card: INITIAL_CREDIT_CARD,
  transactions: [],
  isHydrated: false,

  hydrate: async () => {
    const card = await storageGet<CreditCard>(STORAGE_KEYS.CREDIT_CARDS);
    const transactions = await storageGet<CreditCardTransaction[]>(
      STORAGE_KEYS.CREDIT_CARD_TRANSACTIONS
    );
    if (card) {
      set({ card, transactions: transactions ?? [], isHydrated: true });
    } else {
      await storageSet(STORAGE_KEYS.CREDIT_CARDS, INITIAL_CREDIT_CARD);
      set({ card: INITIAL_CREDIT_CARD, transactions: [], isHydrated: true });
    }
  },

  updateCard: async (partial) => {
    const updated = { ...get().card, ...partial, updatedAt: new Date().toISOString() };
    // Recompute derived fields if limit/used changed
    const computed = computeCreditCardFields(updated);
    const final: CreditCard = { ...updated, ...computed };
    set({ card: final });
    await storageSet(STORAGE_KEYS.CREDIT_CARDS, final);
  },

  addPurchase: async (tx) => {
    const transactions = [...get().transactions, tx];
    set({ transactions });
    await storageSet(STORAGE_KEYS.CREDIT_CARD_TRANSACTIONS, transactions);
    // Update used and outstanding
    const newUsed = get().card.usedINR + tx.amountINR;
    await get().updateCard({ usedINR: newUsed, outstandingINR: get().card.outstandingINR + tx.amountINR });
  },

  addPayment: async (tx) => {
    const transactions = [...get().transactions, tx];
    set({ transactions });
    await storageSet(STORAGE_KEYS.CREDIT_CARD_TRANSACTIONS, transactions);
    // Payment reduces outstanding (and usedINR resets on full payment)
    const newOutstanding = Math.max(0, get().card.outstandingINR - tx.amountINR);
    const newUsed = Math.max(0, get().card.usedINR - tx.amountINR);
    await get().updateCard({ usedINR: newUsed, outstandingINR: newOutstanding });
  },

  removeTransaction: async (id) => {
    const transactions = get().transactions.filter((t) => t.id !== id);
    set({ transactions });
    await storageSet(STORAGE_KEYS.CREDIT_CARD_TRANSACTIONS, transactions);
  },

  getMonthTransactions: (month) =>
    get().transactions.filter((t) => t.date.startsWith(month)),

  isAbovePersonalCeiling: () =>
    get().card.usedINR >= get().card.personalCeilingINR,
}));
