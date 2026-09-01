import { formatCurrency } from '@/shared/lib/formatters';
import type { PeriodTotals } from '../utils/aggregateTransactions';

interface BalanceCardsProps {
  allTimeBalance: number;
  periodTotals: PeriodTotals;
  periodDays: number;
}

function Card({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <p className="text-xs uppercase tracking-wide text-faint">{label}</p>
      <p className={`mt-2 font-mono text-2xl font-semibold tabular-nums ${valueClassName ?? 'text-text'}`}>
        {value}
      </p>
    </div>
  );
}

export function BalanceCards({ allTimeBalance, periodTotals, periodDays }: BalanceCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Card label="Total balance" value={formatCurrency(allTimeBalance)} />
      <Card
        label={`Income (${periodDays}d)`}
        value={`+${formatCurrency(periodTotals.income)}`}
        valueClassName="text-income"
      />
      <Card
        label={`Expenses (${periodDays}d)`}
        value={`−${formatCurrency(periodTotals.expense)}`}
        valueClassName="text-expense"
      />
    </div>
  );
}
