import { Suspense } from 'react';
import { FiltersUrlSync } from '@/features/transactions/components/FiltersUrlSync';
import { TransactionsFilters } from '@/features/transactions/components/TransactionsFilters';
import { TransactionsList } from '@/features/transactions/components/TransactionsList';

export default function TransactionsPage() {
  return (
    <main className="flex-1 p-8">
      {/* useSearchParams() всередині FiltersUrlSync вимагає Suspense-межу
          в Next.js App Router — інакше вся сторінка втратила б статичний
          пре-рендер (build попереджає про це явно) */}
      <Suspense fallback={null}>
        <FiltersUrlSync />
      </Suspense>

      <h1 className="text-2xl font-semibold tracking-tight">Transactions</h1>
      <p className="mt-1 text-sm text-muted">Повний список транзакцій</p>

      <div className="mt-6 flex flex-col gap-4">
        <TransactionsFilters />
        <TransactionsList />
      </div>
    </main>
  );
}
