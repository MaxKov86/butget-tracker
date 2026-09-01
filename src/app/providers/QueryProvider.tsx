'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';

/**
 * QueryClient створюється через useState (а не як module-level singleton) —
 * у Next.js App Router модуль може виконуватись на сервері для кількох
 * запитів одночасно; module-level singleton означав би, що різні
 * користувачі діляться одним і тим же кешем. useState гарантує окремий
 * інстанс на кожен рендер компонентного дерева.
 */
export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
