'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function getDashboardData() {
    const supabase = await createSupabaseServerClient();
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const firstDayOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

    // Summary Cards
    const newPatientsThisMonthPromise = supabase
        .from('patients')
        .select('id', { count: 'exact' })
        .gte('created_at', firstDayOfMonth.toISOString())
        .lt('created_at', firstDayOfNextMonth.toISOString());

    const monthlyRevenuePromise = supabase
        .rpc('get_monthly_revenue', {
            p_year: today.getFullYear(),
            p_month: today.getMonth() + 1
        });

    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const startOfWeek = new Date(today.setDate(diff));
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    const upcomingAppointmentsPromise = supabase
        .from('appointments')
        .select('id, start_time, patient:patients(first_name, last_name)')
        .gte('start_time', new Date().toISOString())
        .lt('start_time', endOfWeek.toISOString())
        .order('start_time', { ascending: true });

    // Chart Data
    const weeklyAppointmentsPromise = supabase.rpc('get_weekly_appointment_counts');

    const [
        { count: newPatientsThisMonth, error: newPatientsThisMonthError },
        { data: monthlyRevenue, error: monthlyRevenueError },
        { data: upcomingAppointments, error: upcomingAppointmentsError },
        { data: weeklyAppointments, error: weeklyAppointmentsError },
    ] = await Promise.all([
        newPatientsThisMonthPromise,
        monthlyRevenuePromise,
        upcomingAppointmentsPromise,
        weeklyAppointmentsPromise,
    ]);

    if (newPatientsThisMonthError) console.error('Error fetching new patients this month:', newPatientsThisMonthError);
    if (monthlyRevenueError) console.error('Error fetching monthly revenue:', monthlyRevenueError);
    if (upcomingAppointmentsError) console.error('Error fetching upcoming appointments:', upcomingAppointmentsError);
    if (weeklyAppointmentsError) console.error('Error fetching weekly appointments:', weeklyAppointmentsError);

    const transformedUpcomingAppointments = (upcomingAppointments || []).map((app: any) => {
        const singlePatient = Array.isArray(app.patient) ? app.patient[0] : app.patient;
        return { ...app, patient: singlePatient };
    });

    return {
        newPatientsThisMonth: newPatientsThisMonth || 0,
        monthlyRevenue: monthlyRevenue || 0,
        upcomingAppointments: transformedUpcomingAppointments,
        weeklyAppointments: weeklyAppointments || [],
    };
}
