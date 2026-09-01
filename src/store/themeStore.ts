import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'dark' | 'light';

interface ThemeStore {
  theme: Theme;
  toggleTheme: () => void;
}

/**
 * Тема — типовий приклад UI-стану (не даних із сервера), тому Zustand,
 * а не TanStack Query. persist middleware сам зберігає/відновлює
 * localStorage — не треба вручну писати StorageManager, як у проекті 1
 * на vanilla JS.
 */
export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: 'dark',
      toggleTheme: () =>
        set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
    }),
    { name: 'budget-tracker-theme' }
  )
);
