import { http, HttpResponse } from 'msw';
import { mockTransactions, mockCategories } from './data';

export const handlers = [
  http.get('/api/transactions', () => {
    return HttpResponse.json(mockTransactions);
  }),

  http.get('/api/categories', () => {
    return HttpResponse.json(mockCategories);
  }),
];
