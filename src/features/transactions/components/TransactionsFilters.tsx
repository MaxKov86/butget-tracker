'use client';

import { useCategories } from '../api';
import { useFiltersStore, type PeriodPreset } from '@/store/filtersStore';
import type { TransactionType } from '../types';

const PERIOD_OPTIONS: { value: PeriodPreset; label: string }[] = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: 'all', label: 'All time' },
];

const selectClassName =
  'rounded-md border border-border bg-surface px-3 py-2 text-sm text-text';

export function TransactionsFilters() {
  const period = useFiltersStore((s) => s.period);
  const categoryId = useFiltersStore((s) => s.categoryId);
  const type = useFiltersStore((s) => s.type);
  const setPeriod = useFiltersStore((s) => s.setPeriod);
  const setCategoryId = useFiltersStore((s) => s.setCategoryId);
  const setType = useFiltersStore((s) => s.setType);
  const reset = useFiltersStore((s) => s.reset);

  const { data: categories } = useCategories();

  const hasActiveFilters = period !== '30d' || categoryId !== 'all' || type !== 'all';

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        value={period}
        onChange={(e) => setPeriod(e.target.value as PeriodPreset)}
        className={selectClassName}
        aria-label="Період"
      >
        {PERIOD_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <select
        value={type}
        onChange={(e) => setType(e.target.value as TransactionType | 'all')}
        className={selectClassName}
        aria-label="Тип"
      >
        <option value="all">All types</option>
        <option value="income">Income</option>
        <option value="expense">Expense</option>
      </select>

      <select
        value={categoryId}
        onChange={(e) => setCategoryId(e.target.value)}
        className={selectClassName}
        aria-label="Категорія"
      >
        <option value="all">All categories</option>
        {(categories ?? []).map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={reset}
          className="text-sm text-muted transition-colors hover:text-text"
        >
          Reset filters
        </button>
      )}
    </div>
  );
}
