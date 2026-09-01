import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Свідомо вужчий тип, ніж PeriodPreset у filtersStore (без 'all'):
 * Dashboard-графік будує денні "відра" (bucket на кожен день) — для
 * "всього часу" з роками історії такий графік став би нечитабельним
 * або довелось би динамічно міняти гранулярність (тиждень/місяць
 * замість дня). Для tren-графіка фіксований набір днів — правильніший
 * інструмент, ніж "необмежений" період, який має сенс для ФІЛЬТРА СПИСКУ
 * (показати буквально кожну транзакцію), але не для графіка динаміки.
 */
export type DashboardPeriod = 7 | 30 | 90;

interface DashboardState {
  periodDays: DashboardPeriod;
  setPeriodDays: (days: DashboardPeriod) => void;
}

/**
 * Окремий від filtersStore (транзакції) стан — свідомо. Dashboard-період
 * і фільтр списку транзакцій це концептуально РІЗНІ речі: "вікно огляду"
 * vs "фільтр списку". Спільне поле означало б, що зміна на одній сторінці
 * неявно міняє поведінку іншої.
 *
 * persist (а не URL, як filtersStore) — це особиста преференція
 * ("я завжди хочу бачити 90 днів"), а не контекст конкретного перегляду,
 * яким хочеться поділитись посиланням. Той самий принцип, що й themeStore.
 */
export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      periodDays: 30,
      setPeriodDays: (periodDays) => set({ periodDays }),
    }),
    { name: 'budget-tracker-dashboard-period' }
  )
);
