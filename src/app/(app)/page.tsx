import { getDashboardData } from './actions';
import TodaysAppointmentsCard from '@/components/dashboard/TodaysAppointmentsCard';
import RecentPatientsCard from '@/components/dashboard/RecentPatientsCard';
import FinancialsCard from '@/components/dashboard/FinancialsCard';

export default async function DashboardPage() {
  const { appointments, recentPatients, monthlyRevenue } = await getDashboardData();

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <TodaysAppointmentsCard appointments={appointments} />
        </div>
        <div className="space-y-8">
          <RecentPatientsCard patients={recentPatients} />
          <FinancialsCard monthlyRevenue={monthlyRevenue} />
        </div>
      </div>
    </div>
  );
}
