'use client';

import { useMemo } from 'react';
import { useTransactions, useCategories } from '../api';
import { useFiltersStore } from '@/store/filtersStore';
import { filterTransactions } from '../utils/filterTransactions';
import { formatCurrency, formatDate } from '@/shared/lib/formatters';

export function TransactionsList() {
  const { data: transactions, isLoading: isTxLoading, isError: isTxError } = useTransactions();
  const { data: categories } = useCategories();

  const period = useFiltersStore((s) => s.period);
  const categoryId = useFiltersStore((s) => s.categoryId);
  const type = useFiltersStore((s) => s.type);

  const filtered = useMemo(
    () => filterTransactions(transactions ?? [], { period, categoryId, type }),
    [transactions, period, categoryId, type]
  );

  if (isTxLoading) {
    return <p className="p-8 text-center text-sm text-muted">Завантаження транзакцій...</p>;
  }

  if (isTxError) {
    return (
      <p className="p-8 text-center text-sm text-expense">
        Не вдалося завантажити транзакції. Спробуйте пізніше.
      </p>
    );
  }

  if (!transactions || transactions.length === 0) {
    return <p className="p-8 text-center text-sm text-muted">Транзакцій поки немає.</p>;
  }

  if (filtered.length === 0) {
    return (
      <p className="p-8 text-center text-sm text-muted">
        Жодна транзакція не відповідає обраним фільтрам.
      </p>
    );
  }

  const categoryMap = new Map((categories ?? []).map((c) => [c.id, c]));

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[520px] text-sm">
        <thead className="bg-surface-2 text-xs uppercase tracking-wide text-faint">
          <tr>
            <th className="px-4 py-3 text-left font-medium">Опис</th>
            <th className="px-4 py-3 text-left font-medium">Категорія</th>
            <th className="px-4 py-3 text-left font-medium">Дата</th>
            <th className="px-4 py-3 text-right font-medium">Сума</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((tx) => {
            const category = categoryMap.get(tx.categoryId);
            const isIncome = tx.type === 'income';

            return (
              <tr key={tx.id} className="border-t border-border transition-colors hover:bg-surface-2">
                <td className="px-4 py-3">{tx.description}</td>
                <td className="px-4 py-3">
                  {category && (
                    <span className="inline-flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      {category.name}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-muted">{formatDate(tx.date)}</td>
                <td
                  className={`px-4 py-3 text-right font-mono tabular-nums ${
                    isIncome ? 'text-income' : 'text-expense'
                  }`}
                >
                  {isIncome ? '+' : '−'}
                  {formatCurrency(tx.amount)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
