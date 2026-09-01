'use client';

import { useTransactions, useCategories } from '../api';
import { formatCurrency, formatDate } from '@/shared/lib/formatters';

/**
 * Крок 2: рендер РЕАЛЬНИХ даних без фільтрів/пагінації — весь масив
 * одразу (250 транзакцій). Фільтри й пагінація (крок 5) не змінять
 * структуру цього компонента — вони лише передадуть параметри в
 * useTransactions(params), сам рендер рядків лишиться той самий.
 */
export function TransactionsList() {
  const { data: transactions, isLoading: isTxLoading, isError: isTxError } = useTransactions();
  const { data: categories } = useCategories();

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
          {transactions.map((tx) => {
            const category = categoryMap.get(tx.categoryId);
            const isIncome = tx.type === 'income';

            return (
              <tr key={tx.id} className="border-t border-border transition-colors hover:bg-surface-2">
                <td className="px-4 py-3">{tx.description}</td>
                <td className="px-4 py-3">
                  {category && (
                    <span className="inline-flex items-center gap-2">
                      {/* Колір категорії — динамічний, з даних, тому inline
                          style (не class): Tailwind генерує класи лише
                          з рядків, відомих на етапі збірки, не з рантайм-значень */}
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
