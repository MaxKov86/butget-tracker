'use client';

import { useEffect, useState } from 'react';
import type { Transaction, Category } from '@/features/transactions/types';

export default function Home() {
  // ТИМЧАСОВО: сирий fetch, щоб на кроці 1 переконатись, що MSW handler
  // реально перехоплює запит крізь MSWProvider gate. На кроці 2 весь цей
  // useEffect зникне — його місце займе useQuery (TanStack Query).
  const [transactions, setTransactions] = useState<Transaction[] | null>(null);
  const [categories, setCategories] = useState<Category[] | null>(null);

  useEffect(() => {
    fetch('/api/transactions')
      .then((res) => res.json())
      .then(setTransactions);

    fetch('/api/categories')
      .then((res) => res.json())
      .then(setCategories);
  }, []);

  return (
    <main className="flex-1 p-8">
      <h1 className="text-2xl font-semibold tracking-tight">Budget Tracker</h1>
      <p className="mt-3 font-mono text-sm text-amber-400">
        {transactions === null
          ? 'Завантаження транзакцій...'
          : `MSW віддав ${transactions.length} транзакцій ✓`}
      </p>
      <p className="mt-1 font-mono text-sm text-amber-400">
        {categories === null
          ? 'Завантаження категорій...'
          : `MSW віддав ${categories.length} категорій ✓`}
      </p>
    </main>
  );
}
