'use client';

import { useEffect, useRef } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useFiltersStore, type FiltersState, type PeriodPreset } from '@/store/filtersStore';

const VALID_PERIODS: PeriodPreset[] = ['7d', '30d', '90d', 'all'];

/**
 * Без UI — лише side-effects, два незалежні напрямки:
 *
 * 1. URL -> Store: ОДИН РАЗ при монтуванні (порожній масив залежностей).
 *    Якщо перейшли за посиланням з готовими ?period=90d&type=income&page=2 —
 *    store підхоплює ці значення при старті.
 *
 * 2. Store -> URL: на кожну зміну period/categoryId/type/page/pageSize
 *    ПІСЛЯ гідратації. hasHydrated-ref — захист від того, щоб цей ефект
 *    не перезаписав URL дефолтними значеннями ще ДО того, як перший
 *    ефект встиг прочитати з нього щось.
 */
export function FiltersUrlSync() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasHydrated = useRef(false);

  const period = useFiltersStore((s) => s.period);
  const categoryId = useFiltersStore((s) => s.categoryId);
  const type = useFiltersStore((s) => s.type);
  const page = useFiltersStore((s) => s.page);
  const pageSize = useFiltersStore((s) => s.pageSize);
  const hydrateFromUrl = useFiltersStore((s) => s.hydrateFromUrl);

  useEffect(() => {
    const updates: Partial<FiltersState> = {};

    const urlPeriod = searchParams.get('period');
    if (urlPeriod && VALID_PERIODS.includes(urlPeriod as PeriodPreset)) {
      updates.period = urlPeriod as PeriodPreset;
    }

    const urlCategory = searchParams.get('category');
    if (urlCategory) {
      updates.categoryId = urlCategory;
    }

    const urlType = searchParams.get('type');
    if (urlType === 'income' || urlType === 'expense') {
      updates.type = urlType;
    }

    const urlPage = Number(searchParams.get('page'));
    if (Number.isInteger(urlPage) && urlPage > 0) {
      updates.page = urlPage;
    }

    const urlPageSize = Number(searchParams.get('pageSize'));
    if (Number.isInteger(urlPageSize) && urlPageSize > 0) {
      updates.pageSize = urlPageSize;
    }

    if (Object.keys(updates).length > 0) {
      hydrateFromUrl(updates);
    }

    hasHydrated.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- навмисно один раз, при монтуванні
  }, []);

  useEffect(() => {
    if (!hasHydrated.current) return;

    // Дефолтні значення НЕ пишемо в URL — інакше кожне посилання
    // виглядало б як ?period=30d&category=all&type=all&page=1&pageSize=15
    // замість чистого /transactions
    const params = new URLSearchParams();
    if (period !== '30d') params.set('period', period);
    if (categoryId !== 'all') params.set('category', categoryId);
    if (type !== 'all') params.set('type', type);
    if (page !== 1) params.set('page', String(page));
    if (pageSize !== 15) params.set('pageSize', String(pageSize));

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [period, categoryId, type, page, pageSize, pathname, router]);

  return null;
}
