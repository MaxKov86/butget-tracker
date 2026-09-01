import { http, HttpResponse } from 'msw';
import { mockTransactions, mockCategories, generateNextTransactionId } from './data';
import type { Transaction, TransactionFormValues } from '../features/transactions/types';

export const handlers = [
  http.get('/api/transactions', () => {
    return HttpResponse.json(mockTransactions);
  }),

  http.get('/api/categories', () => {
    return HttpResponse.json(mockCategories);
  }),

  /**
   * mockTransactions мутується напряму (unshift/splice) — це наша
   * "in-memory БД" на час життя вкладки браузера. Переживає навігацію
   * в SPA-частині застосунку, скидається при повному перезавантаженні
   * сторінки — очікувана поведінка для мокового API, не помилка.
   */
  http.post('/api/transactions', async ({ request }) => {
    const body = (await request.json()) as TransactionFormValues;

    const newTransaction: Transaction = {
      id: generateNextTransactionId(),
      type: body.type,
      categoryId: body.categoryId,
      amount: Math.round(body.amount * 100), // долари з форми -> центи для зберігання
      description: body.description,
      date: new Date(body.date).toISOString(),
    };

    mockTransactions.unshift(newTransaction); // нові транзакції зверху

    return HttpResponse.json(newTransaction, { status: 201 });
  }),

  http.patch('/api/transactions/:id', async ({ request, params }) => {
    const { id } = params;
    const body = (await request.json()) as TransactionFormValues;

    const index = mockTransactions.findIndex((tx) => tx.id === id);
    if (index === -1) {
      return HttpResponse.json({ message: 'Transaction not found' }, { status: 404 });
    }

    const updatedTransaction: Transaction = {
      ...mockTransactions[index],
      type: body.type,
      categoryId: body.categoryId,
      amount: Math.round(body.amount * 100),
      description: body.description,
      date: new Date(body.date).toISOString(),
      // id свідомо НЕ перезаписується з тіла запиту — це "серверне" поле
    };

    mockTransactions[index] = updatedTransaction;

    return HttpResponse.json(updatedTransaction);
  }),
];
