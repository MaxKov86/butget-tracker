import { DashboardOverview } from '@/features/dashboard/components/DashboardOverview';
import { PeriodToggle } from '@/features/dashboard/components/PeriodToggle';

export default function Home() {
  return (
    <main className="flex-1 p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-muted">Огляд за обраний період</p>
        </div>
        <PeriodToggle />
      </div>

      <div className="mt-6">
        <DashboardOverview />
      </div>
    </main>
  );
}
