import type { TransactionFormValues } from '../types';

export type TransactionFormErrors = Partial<Record<keyof TransactionFormValues, string>>;

export function validateTransactionForm(values: TransactionFormValues): TransactionFormErrors {
  const errors: TransactionFormErrors = {};

  if (!values.categoryId) {
    errors.categoryId = "Оберіть категорію";
  }

  if (!Number.isFinite(values.amount) || values.amount <= 0) {
    errors.amount = 'Сума має бути більшою за 0';
  }

  if (!values.description.trim()) {
    errors.description = "Опис обов'язковий";
  }

  if (!values.date) {
    errors.date = "Дата обов'язкова";
  } else if (new Date(values.date) > new Date()) {
    errors.date = 'Дата не може бути в майбутньому';
  }

  return errors;
}
