import type { Transaction } from '@/features/transactions/types';

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
