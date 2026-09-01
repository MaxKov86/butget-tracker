'use client';

import { useMemo } from 'react';
import { useTransactions, useCategories } from '@/features/transactions/api';
import { useDashboardStore } from '@/store/dashboardStore';
import { Skeleton } from '@/shared/components/Skeleton';
import { buildDailySeries, computeTotals, aggregateExpensesByCategory } from '../utils/aggregateTransactions';
import { BalanceCards } from './BalanceCards';
import { SpendingChart } from './SpendingChart';
import { CategoryBreakdownChart } from './CategoryBreakdownChart';
import { BudgetLimits } from './BudgetLimits';

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[3fr_2fr]">
        <Skeleton className="h-72" />
        <Skeleton className="h-72" />
      </div>
    </div>
  );
}

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
  const allTimeBalance = useMemo(() => computeTotals(transactions ?? []).balance, [transactions]);

  const categoryBreakdown = useMemo(
    () => aggregateExpensesByCategory(periodTransactions, categories ?? []),
    [periodTransactions, categories]
  );

  const expenseCategories = useMemo(
    () => (categories ?? []).filter((c) => c.type === 'expense'),
    [categories]
  );

  const spentByCategory = useMemo(
    () => new Map(categoryBreakdown.map((item) => [item.categoryId, item.total])),
    [categoryBreakdown]
  );

  if (isLoading) {
    return <DashboardSkeleton />;
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

      <BudgetLimits expenseCategories={expenseCategories} spentByCategory={spentByCategory} />
    </div>
  );
}
