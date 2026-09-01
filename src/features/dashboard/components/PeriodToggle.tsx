'use client';

import { useDashboardStore, type DashboardPeriod } from '@/store/dashboardStore';

const OPTIONS: DashboardPeriod[] = [7, 30, 90];

export function PeriodToggle() {
  const periodDays = useDashboardStore((s) => s.periodDays);
  const setPeriodDays = useDashboardStore((s) => s.setPeriodDays);

  return (
    <div className="inline-flex rounded-md border border-border bg-surface p-1">
      {OPTIONS.map((days) => {
        const isActive = periodDays === days;
        return (
          <button
            key={days}
            type="button"
            onClick={() => setPeriodDays(days)}
            className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
              isActive ? 'bg-brand text-on-brand' : 'text-muted hover:text-text'
            }`}
          >
            {days}D
          </button>
        );
      })}
    </div>
  );
}
