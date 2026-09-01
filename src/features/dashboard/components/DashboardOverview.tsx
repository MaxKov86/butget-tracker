'use client';

import { useMemo } from 'react';
import { useTransactions, useCategories } from '@/features/transactions/api';
import { buildDailySeries, computeTotals, aggregateExpensesByCategory } from '../utils/aggregateTransactions';
import { BalanceCards } from './BalanceCards';
import { SpendingChart } from './SpendingChart';
import { CategoryBreakdownChart } from './CategoryBreakdownChart';

const PERIOD_DAYS = 30;

export function DashboardOverview() {
  const { data: transactions, isLoading, isError } = useTransactions();
  const { data: categories } = useCategories();

  const dailySeries = useMemo(
    () => buildDailySeries(transactions ?? [], PERIOD_DAYS),
    [transactions]
  );

  const periodTransactions = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - PERIOD_DAYS);
    return (transactions ?? []).filter((tx) => new Date(tx.date) >= cutoff);
  }, [transactions]);

  const periodTotals = useMemo(() => computeTotals(periodTransactions), [periodTransactions]);

  // Total balance — за ВЕСЬ час, а не лише період графіка (це окрема,
  // навмисно ширша метрика: "скільки я маю зараз" vs "як я заробляв/тратив
  // останні 30 днів")
  const allTimeBalance = useMemo(() => computeTotals(transactions ?? []).balance, [transactions]);

  // Розподіл по категоріях — за той самий 30-денний період, що й графік
  // динаміки (а не за весь час) — інакше цифри на dashboard "не билися" б
  // одна з одною при першому погляді
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
      <BalanceCards allTimeBalance={allTimeBalance} periodTotals={periodTotals} periodDays={PERIOD_DAYS} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[3fr_2fr]">
        <SpendingChart data={dailySeries} />
        <CategoryBreakdownChart data={categoryBreakdown} />
      </div>
    </div>
  );
}
