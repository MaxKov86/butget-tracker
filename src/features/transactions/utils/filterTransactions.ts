import type { Transaction, TransactionType } from '../types';
import type { PeriodPreset } from '@/store/filtersStore';

function getPeriodCutoff(period: PeriodPreset): Date | null {
  if (period === 'all') return null;

  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return cutoff;
}

export interface TransactionFilters {
  period: PeriodPreset;
  categoryId: string;
  type: TransactionType | 'all';
}

/**
 * Фільтрація тут — client-side, над уже закешованим TanStack Query
 * масивом (на відміну від проекту 2, де пагінація/фільтри йшли на
 * "сервер" через MSW query-параметри). Свідома різниця: там задача була
 * показати server-side пагінацію для великої таблиці; тут весь датасет
 * (250 транзакцій) і так уже в кеші після першого запиту — гонити його
 * через мережу повторно на кожну зміну фільтра не було б сенсу.
 */
export function filterTransactions(
  transactions: Transaction[],
  filters: TransactionFilters
): Transaction[] {
  const cutoff = getPeriodCutoff(filters.period);

  return transactions.filter((tx) => {
    if (cutoff && new Date(tx.date) < cutoff) return false;
    if (filters.categoryId !== 'all' && tx.categoryId !== filters.categoryId) return false;
    if (filters.type !== 'all' && tx.type !== filters.type) return false;
    return true;
  });
}
