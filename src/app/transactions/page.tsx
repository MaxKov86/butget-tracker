'use client';

import { Suspense, useState } from 'react';
import { FiltersUrlSync } from '@/features/transactions/components/FiltersUrlSync';
import { TransactionsFilters } from '@/features/transactions/components/TransactionsFilters';
import { TransactionsList } from '@/features/transactions/components/TransactionsList';
import { TransactionFormModal } from '@/features/transactions/components/TransactionFormModal';

export default function TransactionsPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <main className="flex-1 p-8">
      {/* useSearchParams() всередині FiltersUrlSync вимагає Suspense-межу
          в Next.js App Router — інакше вся сторінка втратила б статичний
          пре-рендер (build попереджає про це явно) */}
      <Suspense fallback={null}>
        <FiltersUrlSync />
      </Suspense>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Transactions</h1>
          <p className="mt-1 text-sm text-muted">Повний список транзакцій</p>
        </div>
        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-on-brand hover:bg-brand-hover"
        >
          + New Transaction
        </button>
      </div>

      <div className="mt-6 flex flex-col gap-4">
        <TransactionsFilters />
        <TransactionsList />
      </div>

      <TransactionFormModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </main>
  );
}
