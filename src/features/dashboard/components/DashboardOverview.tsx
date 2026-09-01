'use client';

import { useMemo } from 'react';
import { useTransactions, useCategories } from '@/features/transactions/api';
import { useDashboardStore } from '@/store/dashboardStore';
import { buildDailySeries, computeTotals, aggregateExpensesByCategory } from '../utils/aggregateTransactions';
import { BalanceCards } from './BalanceCards';
import { SpendingChart } from './SpendingChart';
import { CategoryBreakdownChart } from './CategoryBreakdownChart';

export function DashboardOverview() {
  const { data: transactions, isLoading, isError } = useTransactions();
  const { data: categories } = useCategories();
  const periodDays = useDashboardStore((s) => s.periodDays);

  const dailySeries = useMemo(
    () => buildDailySeries(transactions ?? [], periodDays),
    [transactions, periodDays]
  );

  const periodTransactions = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - periodDays);
    return (transactions ?? []).filter((tx) => new Date(tx.date) >= cutoff);
  }, [transactions, periodDays]);

  const periodTotals = useMemo(() => computeTotals(periodTransactions), [periodTransactions]);

  // Total balance — за ВЕСЬ час, незалежно від обраного періоду графіка
  // (це окрема, навмисно ширша метрика: "скільки я маю зараз")
  const allTimeBalance = useMemo(() => computeTotals(transactions ?? []).balance, [transactions]);

  // Розподіл по категоріях — за той самий період, що й графік динаміки
  const categoryBreakdown = useMemo(
    () => aggregateExpensesByCategory(periodTransactions, categories ?? []),
    [periodTransactions, categories]
  );

  if (isLoading) {
    return <p className="text-sm text-muted">Завантаження...</p>;
  }

  if (isError || !transactions) {
    return <p className="text-sm text-expense">Не вдалося завантажити дані.</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <BalanceCards allTimeBalance={allTimeBalance} periodTotals={periodTotals} periodDays={periodDays} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[3fr_2fr]">
        <SpendingChart data={dailySeries} />
        <CategoryBreakdownChart data={categoryBreakdown} />
      </div>
    </div>
  );
}
