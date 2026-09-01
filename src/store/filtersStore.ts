import { create } from 'zustand';
import type { TransactionType } from '@/features/transactions/types';

export type PeriodPreset = '7d' | '30d' | '90d' | 'all';

export interface FiltersState {
  period: PeriodPreset;
  categoryId: string; // 'all' або конкретний Category['id']
  type: TransactionType | 'all';
}

interface FiltersActions {
  setPeriod: (period: PeriodPreset) => void;
  setCategoryId: (categoryId: string) => void;
  setType: (type: TransactionType | 'all') => void;
  reset: () => void;
  /** Викликається лише з FiltersUrlSync при гідратації з URL — не для прямого UI-виклику */
  hydrateFromUrl: (updates: Partial<FiltersState>) => void;
}

const DEFAULTS: FiltersState = {
  period: '30d',
  categoryId: 'all',
  type: 'all',
};

/**
 * Без persist middleware (на відміну від themeStore) — тут URL є єдиним
 * джерелом персистентності (FiltersUrlSync нижче), а не localStorage.
 * Це навмисно різні патерни для різних видів UI-стану: тема — особиста
 * преференція користувача (має жити довше однієї сесії), фільтри —
 * контекст конкретного перегляду (природно належить URL, щоб посилання
 * можна було передати комусь іншому з тим самим станом).
 */
export const useFiltersStore = create<FiltersState & FiltersActions>((set) => ({
  ...DEFAULTS,
  setPeriod: (period) => set({ period }),
  setCategoryId: (categoryId) => set({ categoryId }),
  setType: (type) => set({ type }),
  reset: () => set(DEFAULTS),
  hydrateFromUrl: (updates) => set((state) => ({ ...state, ...updates })),
}));
