'use client';

import { useMemo } from 'react';
import { useTransactions } from '@/features/transactions/api';
import { buildDailySeries, computeTotals } from '../utils/aggregateTransactions';
import { BalanceCards } from './BalanceCards';
import { SpendingChart } from './SpendingChart';

const PERIOD_DAYS = 30;

export function DashboardOverview() {
  const { data: transactions, isLoading, isError } = useTransactions();

  const dailySeries = useMemo(
    () => buildDailySeries(transactions ?? [], PERIOD_DAYS),
    [transactions]
  );

  const periodTotals = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - PERIOD_DAYS);
    const periodTransactions = (transactions ?? []).filter((tx) => new Date(tx.date) >= cutoff);
    return computeTotals(periodTransactions);
  }, [transactions]);

  // Total balance — за ВЕСЬ час, а не лише період графіка (це окрема,
  // навмисно ширша метрика: "скільки я маю зараз" vs "як я заробляв/тратив
  // останні 30 днів")
  const allTimeBalance = useMemo(() => computeTotals(transactions ?? []).balance, [transactions]);

  if (isLoading) {
    return <p className="text-sm text-muted">Завантаження...</p>;
  }

  if (isError || !transactions) {
    return <p className="text-sm text-expense">Не вдалося завантажити дані.</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <BalanceCards allTimeBalance={allTimeBalance} periodTotals={periodTotals} periodDays={PERIOD_DAYS} />
      <SpendingChart data={dailySeries} />
    </div>
  );
}
