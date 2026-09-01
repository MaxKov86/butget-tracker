import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface BudgetStore {
  /** categoryId -> ліміт у центах. Категорія без ключа = ліміт не встановлено */
  limits: Record<string, number>;
  setLimit: (categoryId: string, limitInCents: number) => void;
  clearLimit: (categoryId: string) => void;
}

/**
 * Той самий принцип, що й dashboardStore/themeStore: бюджет-ліміти —
 * особиста преференція користувача ("я хочу тратити не більше $200 на
 * Food щомісяця"), не серверні дані — тому Zustand + persist, а не
 * TanStack Query. У реальному застосунку ліміти, ймовірно, жили б на
 * бекенді (прив'язані до акаунту користувача), але для портфоліо-демо
 * без реальної авторизації localStorage — цілком доречне спрощення.
 */
export const useBudgetStore = create<BudgetStore>()(
  persist(
    (set) => ({
      limits: {},
      setLimit: (categoryId, limitInCents) =>
        set((state) => ({ limits: { ...state.limits, [categoryId]: limitInCents } })),
      clearLimit: (categoryId) =>
        set((state) => {
          const nextLimits = { ...state.limits };
          delete nextLimits[categoryId];
          return { limits: nextLimits };
        }),
    }),
    { name: 'budget-tracker-budget-limits' }
  )
);
