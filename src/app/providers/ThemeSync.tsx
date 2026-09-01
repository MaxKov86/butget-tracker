'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/store/themeStore';

/**
 * Без UI — лише side-effect: тримає document.documentElement[data-theme]
 * синхронізованим зі станом у Zustand. CSS (globals.css) реагує на
 * зміну атрибута сам, без жодного додаткового коду.
 */
export function ThemeSync() {
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return null;
}
