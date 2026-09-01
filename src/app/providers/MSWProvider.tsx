'use client';

import { useEffect, useState, type ReactNode } from 'react';

/**
 * У Next.js App Router MSW не можна просто "запустити і забути" —
 * на відміну від Vite (project 1/2), тут є SSR-прохід і client-side
 * hydration. MSW worker — суто браузерна річ (реальний Service Worker),
 * тому стартує лише в client-компоненті, і ми ГАРАНТОВАНО повинні
 * дочекатись його запуску, перш ніж дозволити дочірнім компонентам
 * (з TanStack Query хуками) робити перший fetch — інакше цей перший
 * запит піде в мережу насправді, ще до того, як MSW встигне його
 * перехопити, і впаде в 404.
 */
export function MSWProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(process.env.NODE_ENV !== 'development');

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    let isCancelled = false;

    async function enableMocking() {
      const { startWorker } = await import('../../mocks/browser');
      await startWorker();
      if (!isCancelled) {
        setIsReady(true);
      }
    }

    enableMocking();

    // Якщо StrictMode встиг "розмонтувати" компонент до завершення
    // await startWorker() — не викликаємо setIsReady на вже застарілому
    // мовтуванні (реального впливу на сам воркер це не має, startWorker
    // і так гарантує один виклик, це лише захист від React-warning про
    // setState на розмонтованому компоненті)
    return () => {
      isCancelled = true;
    };
  }, []);

  if (!isReady) return null;

  return <>{children}</>;
}
