import { rollup, sum } from 'd3-array';
import type { Transaction, Category } from '@/features/transactions/types';

export interface DailyTotal {
  date: Date;
  income: number;
  expense: number;
}

/**
 * Денні суми доходу/витрати за останні `days` днів. Заповнюємо ВСІ дні
 * в діапазоні нулями заздалегідь (а не тільки ті, де є транзакції) —
 * інакше scaleTime на графіку показував би нерівномірні інтервали між
 * точками, і "дірки" без транзакцій виглядали б як розрив лінії,
 * а не як законний нуль.
 */
export function buildDailySeries(transactions: Transaction[], days = 30): DailyTotal[] {
  const end = new Date();
  end.setHours(0, 0, 0, 0);
  const start = new Date(end);
  start.setDate(start.getDate() - (days - 1));

  const buckets = new Map<string, DailyTotal>();
  for (let i = 0; i < days; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    buckets.set(date.toISOString().slice(0, 10), { date, income: 0, expense: 0 });
  }

  for (const tx of transactions) {
    const key = tx.date.slice(0, 10);
    const bucket = buckets.get(key);
    if (!bucket) continue; // транзакція старіша за обраний період — не рахуємо

    if (tx.type === 'income') {
      bucket.income += tx.amount;
    } else {
      bucket.expense += tx.amount;
    }
  }

  return Array.from(buckets.values());
}

export interface PeriodTotals {
  income: number;
  expense: number;
  balance: number;
}

export function computeTotals(transactions: Transaction[]): PeriodTotals {
  let income = 0;
  let expense = 0;

  for (const tx of transactions) {
    if (tx.type === 'income') {
      income += tx.amount;
    } else {
      expense += tx.amount;
    }
  }

  return { income, expense, balance: income - expense };
}

export interface CategoryBreakdownItem {
  categoryId: string;
  name: string;
  color: string;
  total: number;
}

/**
 * Розподіл ВИТРАТ (не доходів — категорії доходів у нас лише дві:
 * Salary/Freelance, розподіл там менш показовий) по категоріях.
 * d3-array.rollup — те, заради чого власне встановлювали d3-array ще
 * на кроці 1: групування + агрегація (sum) в одному виклику, замість
 * ручного reduce() з Map, як у buildDailySeries вище (там ручний Map
 * був природнішим через потребу заповнювати "дірки" нулями — тут такої
 * потреби нема, тому rollup доречніший).
 */
export function aggregateExpensesByCategory(
  transactions: Transaction[],
  categories: Category[]
): CategoryBreakdownItem[] {
  const expenseTransactions = transactions.filter((tx) => tx.type === 'expense');
  const totalsByCategory = rollup(
    expenseTransactions,
    (txs) => sum(txs, (tx) => tx.amount),
    (tx) => tx.categoryId
  );
  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  return Array.from(totalsByCategory.entries())
    .map(([categoryId, total]) => {
      const category = categoryMap.get(categoryId);
      return {
        categoryId,
        name: category?.name ?? categoryId,
        color: category?.color ?? '#8b949e',
        total,
      };
    })
    .sort((a, b) => b.total - a.total); // найбільші витрати спочатку — і для легенди, і для читабельності діаграми
}
