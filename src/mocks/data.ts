import type { Category, Transaction } from '../features/transactions/types';

export const mockCategories: Category[] = [
  { id: 'salary', name: 'Salary', color: '#5fb87a', type: 'income' },
  { id: 'freelance', name: 'Freelance', color: '#7fb0e0', type: 'income' },
  { id: 'food', name: 'Food', color: '#f0a63c', type: 'expense' },
  { id: 'transport', name: 'Transport', color: '#e0a95d', type: 'expense' },
  { id: 'entertainment', name: 'Entertainment', color: '#c48fe0', type: 'expense' },
  { id: 'utilities', name: 'Utilities', color: '#8d8880', type: 'expense' },
  { id: 'shopping', name: 'Shopping', color: '#e05d8f', type: 'expense' },
];

function seededRandom(seed: number): () => number {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

const random = seededRandom(7);

function pick<T>(arr: T[]): T {
  return arr[Math.floor(random() * arr.length)];
}

const EXPENSE_CATEGORIES = mockCategories.filter((c) => c.type === 'expense');
const INCOME_CATEGORIES = mockCategories.filter((c) => c.type === 'income');

const EXPENSE_DESCRIPTIONS: Record<string, string[]> = {
  food: ['Grocery store', 'Restaurant', 'Coffee shop'],
  transport: ['Fuel', 'Taxi', 'Metro card'],
  entertainment: ['Cinema', 'Streaming subscription', 'Concert tickets'],
  utilities: ['Electricity bill', 'Internet bill', 'Water bill'],
  shopping: ['Clothing', 'Electronics', 'Home goods'],
};

function generateTransaction(index: number): Transaction {
  // ~90 днів історії, кілька транзакцій на день у середньому
  const daysAgo = Math.floor(random() * 90);
  const date = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();

  // Раз на ~15 транзакцій — дохід (зарплата рідше за побутові витрати)
  const isIncome = index % 15 === 0;

  if (isIncome) {
    const category = pick(INCOME_CATEGORIES);
    return {
      id: `TXN-${10000 + index}`,
      type: 'income',
      categoryId: category.id,
      amount: Math.floor(random() * 300000) + 50000, // 500 - 3500 у доларах (центи)
      description: category.name === 'Salary' ? 'Monthly salary' : 'Freelance project',
      date,
    };
  }

  const category = pick(EXPENSE_CATEGORIES);
  const descriptions = EXPENSE_DESCRIPTIONS[category.id];

  return {
    id: `TXN-${10000 + index}`,
    type: 'expense',
    categoryId: category.id,
    amount: Math.floor(random() * 15000) + 500, // 5 - 155 у доларах (центи)
    description: pick(descriptions),
    date,
  };
}

export const mockTransactions: Transaction[] = Array.from({ length: 250 }, (_, i) =>
  generateTransaction(i)
);
