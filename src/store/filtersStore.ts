import { create } from 'zustand';
import type { TransactionType } from '@/features/transactions/types';

export type PeriodPreset = '7d' | '30d' | '90d' | 'all';

export interface FiltersState {
  period: PeriodPreset;
  categoryId: string; // 'all' або конкретний Category['id']
  type: TransactionType | 'all';
  page: number;
  pageSize: number;
}

interface FiltersActions {
  setPeriod: (period: PeriodPreset) => void;
  setCategoryId: (categoryId: string) => void;
  setType: (type: TransactionType | 'all') => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  reset: () => void;
  /** Викликається лише з FiltersUrlSync при гідратації з URL — не для прямого UI-виклику */
  hydrateFromUrl: (updates: Partial<FiltersState>) => void;
}

const DEFAULTS: FiltersState = {
  period: '30d',
  categoryId: 'all',
  type: 'all',
  page: 1,
  pageSize: 15,
};

/**
 * Без persist middleware (на відміну від themeStore) — тут URL є єдиним
 * джерелом персистентності (FiltersUrlSync нижче), а не localStorage.
 * Це навмисно різні патерни для різних видів UI-стану: тема — особиста
 * преференція користувача (має жити довше однієї сесії), фільтри й
 * пагінація — контекст конкретного перегляду (природно належить URL,
 * щоб посилання можна було передати комусь іншому з тим самим станом).
 */
export const useFiltersStore = create<FiltersState & FiltersActions>((set) => ({
  ...DEFAULTS,
  setPeriod: (period) => set({ period, page: 1 }),
  setCategoryId: (categoryId) => set({ categoryId, page: 1 }),
  setType: (type) => set({ type, page: 1 }),
  setPage: (page) => set({ page }),
  // Зміна розміру сторінки скидає на першу — інакше можна легко
  // опинитись на "неіснуючій" сторінці (був на сторінці 10 по 15
  // записів, переключився на 50 по сторінці — сторінки 10 більше нема)
  setPageSize: (pageSize) => set({ pageSize, page: 1 }),
  reset: () => set(DEFAULTS),
  hydrateFromUrl: (updates) => set((state) => ({ ...state, ...updates })),
}));
