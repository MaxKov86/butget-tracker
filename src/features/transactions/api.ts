import { useQuery } from '@tanstack/react-query';
import type { Transaction, Category } from './types';

async function fetchTransactions(): Promise<Transaction[]> {
  const res = await fetch('/api/transactions');
  if (!res.ok) throw new Error('Failed to fetch transactions');
  return res.json();
}

async function fetchCategories(): Promise<Category[]> {
  const res = await fetch('/api/categories');
  if (!res.ok) throw new Error('Failed to fetch categories');
  return res.json();
}

/**
 * useQuery замінює useState+useEffect з кроку 1: isLoading/isError/data
 * приходять "з коробки", кешуються між рендерами й компонентами.
 * queryKey — 'transactions'/'categories' — знадобиться на кроці 5/6
 * для інвалідації кешу після мутацій (create/update/delete транзакції).
 */
export function useTransactions() {
  return useQuery({
    queryKey: ['transactions'],
    queryFn: fetchTransactions,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });
}
