import { getDashboardData } from './actions';
import SummaryCard from '@/components/dashboard/SummaryCard';
import AppointmentsChart from '@/components/dashboard/AppointmentsChart';
import TodaysAppointmentsCard from '@/components/dashboard/TodaysAppointmentsCard';
import { Calendar, UserPlus, DollarSign, Clock } from 'lucide-react';

export default async function DashboardPage() {
  const {
    newPatientsThisMonth,
    monthlyRevenue,
    upcomingAppointments,
    weeklyAppointments,
  } = await getDashboardData();

  const dayMap: { [key: string]: number } = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  const today = new Date();
  const todayName = today.toLocaleDateString('en-US', { weekday: 'short' });
  const todaysAppointmentsCount = weeklyAppointments.find((d: any) => d.name === todayName)?.total || 0;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <SummaryCard title="Citas de Hoy" value={todaysAppointmentsCount.toString()} icon={Calendar} />
        <SummaryCard title="Nuevos Pacientes (Mes)" value={newPatientsThisMonth.toString()} icon={UserPlus} />
        <SummaryCard title="Ingresos (Mes)" value={`$${monthlyRevenue.toLocaleString()}`} icon={DollarSign} />
        <SummaryCard title="Citas Restantes (Semana)" value={upcomingAppointments.length.toString()} icon={Clock} />
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-4">
          <AppointmentsChart data={weeklyAppointments} />
        </div>
        <div className="lg:col-span-3 space-y-4">
          <TodaysAppointmentsCard appointments={upcomingAppointments} />
        </div>
      </div>
    </div>
  );
}
