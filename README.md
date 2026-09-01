# Budget Tracker

Pet-проект для портфоліо: трекер особистих фінансів з графіками витрат/доходів. Next.js (App Router) + TypeScript + Tailwind CSS + Zustand + TanStack Query + Visx.

## Запуск

```bash
npm install
npm run dev
```

MSW перехоплює запити до `/api/transactions` та `/api/categories` в dev-режимі — реального бекенду не потрібно.

## Прогрес по кроках ТЗ

- [x] **Крок 1:** Налаштування проекту (Next.js App Router + TS + Tailwind + TanStack Query + Zustand + Visx), мокове API через MSW
- [ ] Крок 2: Базовий TanStack Query шар, список транзакцій без фільтрів/графіків
- [ ] Крок 3: Dashboard — картки-підсумки + перший графік (Visx)
- [ ] Крок 4: Кругова діаграма розподілу по категоріях
- [ ] Крок 5: Фільтри (період, категорія, тип) — Zustand store + URL sync
- [ ] Крок 6: CRUD транзакцій — форма додавання/редагування з валідацією
- [ ] Крок 7: Видалення, бюджет-ліміти, поліш (skeleton, error states, темна тема)

## Архітектурний принцип проекту

**TanStack Query** відповідає за все, що приходить із сервера (транзакції,
категорії, кешування, інвалідація). **Zustand** відповідає ТІЛЬКИ за
клієнтський UI-стан (вибрані фільтри, відкриті модалки) — ніколи не
зберігає дані транзакцій.

## Структура

```
src/
  app/
    providers/      # QueryProvider, MSWProvider — client-side обгортки
    layout.tsx
    page.tsx
  features/
    transactions/
      types.ts       # Transaction, Category
      components/
    dashboard/
      components/
  store/            # Zustand stores (UI-стан, не дані з сервера)
  shared/
    components/
    lib/
  mocks/            # MSW handlers + генератор мокових даних
```
