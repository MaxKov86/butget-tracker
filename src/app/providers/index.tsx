import type { ReactNode } from 'react';
import { QueryProvider } from './QueryProvider';
import { MSWProvider } from './MSWProvider';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <MSWProvider>{children}</MSWProvider>
    </QueryProvider>
  );
}
