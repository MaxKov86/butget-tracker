"use client";

import { useMemo, useState } from "react";
import { useTransactions, useCategories, useDeleteTransaction } from "../api";
import { useFiltersStore } from "@/store/filtersStore";
import { filterTransactions } from "../utils/filterTransactions";
import { formatCurrency, formatDate } from "@/shared/lib/formatters";
import { TransactionFormModal } from "./TransactionFormModal";
import { Skeleton } from "@/shared/components/Skeleton";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import type { Transaction } from "../types";

const SKELETON_ROWS_COUNT = 6;

function TransactionsListSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <div className="divide-y divide-border">
        {Array.from({ length: SKELETON_ROWS_COUNT }).map((_, i) => (
          <div key={i} className="flex items-center gap-6 px-4 py-3.5">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="ml-auto h-4 w-16" />
            <Skeleton className="h-6 w-14" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function TransactionsList() {
  const {
    data: transactions,
    isLoading: isTxLoading,
    isError: isTxError,
  } = useTransactions();
  const { data: categories } = useCategories();

  const period = useFiltersStore((s) => s.period);
  const categoryId = useFiltersStore((s) => s.categoryId);
  const type = useFiltersStore((s) => s.type);

  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [deletingTransaction, setDeletingTransaction] =
    useState<Transaction | null>(null);

  const deleteTransaction = useDeleteTransaction();

  const filtered = useMemo(
    () => filterTransactions(transactions ?? [], { period, categoryId, type }),
    [transactions, period, categoryId, type],
  );

  async function handleConfirmDelete() {
    if (!deletingTransaction) return;
    await deleteTransaction.mutateAsync(deletingTransaction.id);
    setDeletingTransaction(null);
  }

  if (isTxLoading) {
    return <TransactionsListSkeleton />;
  }

  if (isTxError) {
    return (
      <p className="p-8 text-center text-sm text-expense">
        Не вдалося завантажити транзакції. Спробуйте пізніше.
      </p>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <p className="p-8 text-center text-sm text-muted">
        Транзакцій поки немає.
      </p>
    );
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
    <>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-160 text-sm">
          <thead className="bg-surface-2 text-xs uppercase tracking-wide text-faint">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Опис</th>
              <th className="px-4 py-3 text-left font-medium">Категорія</th>
              <th className="px-4 py-3 text-left font-medium">Дата</th>
              <th className="px-4 py-3 text-right font-medium">Сума</th>
              <th className="px-4 py-3 text-right font-medium">Дії</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((tx) => {
              const category = categoryMap.get(tx.categoryId);
              const isIncome = tx.type === "income";

              return (
                <tr
                  key={tx.id}
                  className="border-t border-border transition-colors hover:bg-surface-2"
                >
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
                  <td className="px-4 py-3 text-muted">
                    {formatDate(tx.date)}
                  </td>
                  <td
                    className={`px-4 py-3 text-right font-mono tabular-nums ${
                      isIncome ? "text-income" : "text-expense"
                    }`}
                  >
                    {isIncome ? "+" : "−"}
                    {formatCurrency(tx.amount)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingTransaction(tx)}
                        className="rounded-md border border-border px-2.5 py-1 text-xs text-muted hover:bg-surface hover:text-text"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingTransaction(tx)}
                        className="rounded-md border border-border px-2.5 py-1 text-xs text-muted hover:bg-surface hover:text-expense"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {editingTransaction && (
        <TransactionFormModal
          isOpen={Boolean(editingTransaction)}
          transaction={editingTransaction}
          onClose={() => setEditingTransaction(null)}
        />
      )}

      <ConfirmDialog
        isOpen={Boolean(deletingTransaction)}
        onOpenChange={(open) => !open && setDeletingTransaction(null)}
        onConfirm={handleConfirmDelete}
        title="Видалити транзакцію?"
        description={`"${deletingTransaction?.description}" буде видалено безповоротно.`}
        isConfirming={deleteTransaction.isPending}
      />
    </>
  );
}
