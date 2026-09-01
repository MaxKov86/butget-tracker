import { TransactionsList } from '@/features/transactions/components/TransactionsList';

export default function Home() {
  return (
    <main className="flex-1 p-8">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
      <p className="mt-1 text-sm text-muted">Огляд транзакцій</p>

      <div className="mt-6">
        <TransactionsList />
      </div>
    </main>
  );
}
