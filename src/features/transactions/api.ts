import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Transaction, Category, TransactionFormValues } from './types';

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
 * queryKey — 'transactions'/'categories' — саме на нього спираються
 * мутації нижче для інвалідації кешу після create/update.
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

async function createTransaction(values: TransactionFormValues): Promise<Transaction> {
  const res = await fetch('/api/transactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(values),
  });
  if (!res.ok) throw new Error('Failed to create transaction');
  return res.json();
}

/**
 * На відміну від RTK Query (проект 2), де invalidatesTags робить це
 * декларативно, тут invalidateQueries викликається вручну в onSuccess —
 * TanStack Query теж кешує запити, але інвалідація кешу після мутації
 * тут явний imperative виклик, а не декларативний тег на ендпоінті.
 */
export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}

interface UpdateTransactionInput extends TransactionFormValues {
  id: string;
}

async function updateTransaction({ id, ...values }: UpdateTransactionInput): Promise<Transaction> {
  const res = await fetch(`/api/transactions/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(values),
  });
  if (!res.ok) throw new Error('Failed to update transaction');
  return res.json();
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}

async function deleteTransaction(id: string): Promise<void> {
  const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete transaction');
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}
