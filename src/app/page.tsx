import { DashboardOverview } from '@/features/dashboard/components/DashboardOverview';

export default function Home() {
  return (
    <main className="flex-1 p-8">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
      <p className="mt-1 text-sm text-muted">Огляд за останні 30 днів</p>

      <div className="mt-6">
        <DashboardOverview />
      </div>
    </main>
  );
}
