'use client';

import { useState } from 'react';
import { useBudgetStore } from '@/store/budgetStore';
import { formatCurrency } from '@/shared/lib/formatters';
import type { Category } from '@/features/transactions/types';

interface BudgetRowProps {
  category: Category;
  spent: number;
}

function BudgetRow({ category, spent }: BudgetRowProps) {
  const limit = useBudgetStore((s) => s.limits[category.id]);
  const setLimit = useBudgetStore((s) => s.setLimit);
  const clearLimit = useBudgetStore((s) => s.clearLimit);

  const [draft, setDraft] = useState(limit !== undefined ? String(limit / 100) : '');

  const hasLimit = limit !== undefined && limit > 0;
  const percent = hasLimit ? Math.min((spent / limit) * 100, 100) : 0;
  const isOver = hasLimit && spent > limit;
  const isNear = hasLimit && !isOver && percent >= 80;

  function handleBlur() {
    const parsed = Number(draft);
    if (draft === '' || !Number.isFinite(parsed) || parsed <= 0) {
      clearLimit(category.id);
      setDraft('');
      return;
    }
    setLimit(category.id, Math.round(parsed * 100));
  }

  return (
    <div className="py-2.5">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: category.color }}
          />
          {category.name}
        </span>
        <div className="flex items-center gap-2">
          <span
            className={`font-mono tabular-nums ${isOver ? 'text-expense' : 'text-muted'}`}
          >
            {formatCurrency(spent)}
          </span>
          <span className="text-faint">/</span>
          <input
            type="number"
            min={0}
            placeholder="No limit"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={handleBlur}
            className="w-20 rounded border border-border bg-bg px-2 py-1 text-right font-mono text-xs text-text focus:border-brand focus:outline-none"
          />
        </div>
      </div>

      {hasLimit && (
        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
          <div
            className={`h-full rounded-full transition-all ${
              isOver ? 'bg-expense' : isNear ? 'bg-warning' : 'bg-income'
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>
      )}
    </div>
  );
}

interface BudgetLimitsProps {
  expenseCategories: Category[];
  spentByCategory: Map<string, number>;
}

export function BudgetLimits({ expenseCategories, spentByCategory }: BudgetLimitsProps) {
  if (expenseCategories.length === 0) return null;

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <h3 className="text-sm font-semibold text-text">Budget limits</h3>
      <p className="mt-0.5 mb-1 text-xs text-muted">
        Встанови ліміт для категорії, щоб бачити прогрес витрат
      </p>

      <div className="divide-y divide-border">
        {expenseCategories.map((category) => (
          <BudgetRow
            key={category.id}
            category={category}
            spent={spentByCategory.get(category.id) ?? 0}
          />
        ))}
      </div>
    </div>
  );
}
