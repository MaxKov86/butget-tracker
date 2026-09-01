export type TransactionType = 'income' | 'expense';

export interface Category {
  id: string;
  name: string;
  color: string; // hex — використовується і в badge, і в графіках
  type: TransactionType; // категорія належить або доходам, або витратам
}

export interface Transaction {
  id: string;
  type: TransactionType;
  categoryId: string;
  amount: number; // у центах — уникаємо floating-point помилок з грошима
  description: string;
  date: string; // ISO 8601
}

// Наступні кроки додадуть сюди TransactionFilters —
// поки що тільки базова модель, щоб перевірити наскрізний потік даних
