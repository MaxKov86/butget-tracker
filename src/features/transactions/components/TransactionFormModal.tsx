'use client';

import { useState, type FormEvent } from 'react';
import { Modal } from '@/shared/components/Modal';
import { useCreateTransaction, useUpdateTransaction, useCategories } from '../api';
import { validateTransactionForm, type TransactionFormErrors } from '../utils/validateTransactionForm';
import type { Transaction, TransactionFormValues, TransactionType } from '../types';

const inputClassName =
  'w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text focus:border-brand focus:outline-none';
const labelClassName = 'mb-1.5 block text-sm font-medium text-text';
const errorClassName = 'mt-1 text-xs text-expense';

function toFormValues(tx?: Transaction): TransactionFormValues {
  if (!tx) {
    return {
      type: 'expense',
      categoryId: '',
      amount: 0,
      description: '',
      date: new Date().toISOString().slice(0, 10),
    };
  }

  return {
    type: tx.type,
    categoryId: tx.categoryId,
    amount: tx.amount / 100, // центи -> долари для форми
    description: tx.description,
    date: tx.date.slice(0, 10),
  };
}

interface TransactionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Якщо передано — режим редагування, інакше створення нової транзакції */
  transaction?: Transaction;
}

export function TransactionFormModal({ isOpen, onClose, transaction }: TransactionFormModalProps) {
  const isEditMode = Boolean(transaction);

  const [values, setValues] = useState<TransactionFormValues>(() => toFormValues(transaction));
  const [errors, setErrors] = useState<TransactionFormErrors>({});

  const { data: categories } = useCategories();
  const createTransaction = useCreateTransaction();
  const updateTransaction = useUpdateTransaction();

  const isSubmitting = createTransaction.isPending || updateTransaction.isPending;
  const apiError = createTransaction.isError || updateTransaction.isError;

  const availableCategories = (categories ?? []).filter((c) => c.type === values.type);

  function updateField<K extends keyof TransactionFormValues>(
    field: K,
    value: TransactionFormValues[K]
  ) {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  function handleTypeChange(type: TransactionType) {
    // Зміна типу могла зробити поточну категорію недоступною (категорії
    // прив'язані до конкретного типу: Salary — income, Food — expense
    // тощо) — скидаємо вибір, а не лишаємо невалідний categoryId
    // "приховано" в стані форми
    const stillValid = (categories ?? []).some(
      (c) => c.id === values.categoryId && c.type === type
    );
    setValues((prev) => ({ ...prev, type, categoryId: stillValid ? prev.categoryId : '' }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const validationErrors = validateTransactionForm(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      if (isEditMode && transaction) {
        await updateTransaction.mutateAsync({ id: transaction.id, ...values });
      } else {
        await createTransaction.mutateAsync(values);
      }
      handleClose();
    } catch {
      // apiError вже показується нижче через isError зі стану мутації —
      // тут нічого додатково робити не треба, форма просто лишається відкритою
    }
  }

  function handleClose() {
    setValues(toFormValues(undefined));
    setErrors({});
    onClose();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditMode ? 'Редагувати транзакцію' : 'Нова транзакція'}
      description={
        isEditMode ? 'Форма редагування існуючої транзакції' : 'Форма створення нової транзакції'
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        {apiError && (
          <p className="mb-3 text-sm text-expense">
            Не вдалося зберегти транзакцію. Спробуйте ще раз.
          </p>
        )}

        <div className="mb-4">
          <span className={labelClassName}>Тип</span>
          <div className="flex gap-2">
            {(['expense', 'income'] as TransactionType[]).map((type) => {
              const isActive = values.type === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleTypeChange(type)}
                  className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? type === 'income'
                        ? 'border-income bg-income/10 text-income'
                        : 'border-expense bg-expense/10 text-expense'
                      : 'border-border text-muted hover:text-text'
                  }`}
                >
                  {type === 'income' ? 'Income' : 'Expense'}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mb-4">
          <label className={labelClassName} htmlFor="categoryId">
            Категорія
          </label>
          <select
            id="categoryId"
            value={values.categoryId}
            onChange={(e) => updateField('categoryId', e.target.value)}
            className={inputClassName}
          >
            <option value="">Оберіть категорію</option>
            {availableCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.categoryId && <p className={errorClassName}>{errors.categoryId}</p>}
        </div>

        <div className="mb-4">
          <label className={labelClassName} htmlFor="description">
            Опис
          </label>
          <input
            id="description"
            type="text"
            value={values.description}
            onChange={(e) => updateField('description', e.target.value)}
            className={inputClassName}
            autoFocus
          />
          {errors.description && <p className={errorClassName}>{errors.description}</p>}
        </div>

        <div className="mb-4 grid grid-cols-2 gap-3">
          <div>
            <label className={labelClassName} htmlFor="amount">
              Сума ($)
            </label>
            <input
              id="amount"
              type="number"
              min={0}
              step={0.01}
              value={values.amount}
              onChange={(e) => updateField('amount', Number(e.target.value))}
              className={inputClassName}
            />
            {errors.amount && <p className={errorClassName}>{errors.amount}</p>}
          </div>

          <div>
            <label className={labelClassName} htmlFor="date">
              Дата
            </label>
            <input
              id="date"
              type="date"
              value={values.date}
              onChange={(e) => updateField('date', e.target.value)}
              className={inputClassName}
            />
            {errors.date && <p className={errorClassName}>{errors.date}</p>}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-md border border-border px-4 py-2 text-sm text-text hover:bg-surface-2"
          >
            Скасувати
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-on-brand hover:bg-brand-hover disabled:opacity-60"
          >
            {isSubmitting ? 'Збереження...' : isEditMode ? 'Зберегти' : 'Створити'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
