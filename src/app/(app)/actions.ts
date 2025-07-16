'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function getDashboardData() {
    const supabase = await createSupabaseServerClient();

    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
    const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();

    const appointmentsPromise = supabase
        .from('appointments')
        .select(`
            id,
            start_time,
            end_time,
            service_description,
            status,
            patient:patients (id, first_name, last_name),
            doctor:profiles (id, full_name)
        `)
        .gte('start_time', startDate)
        .lt('start_time', endDate)
        .order('start_time', { ascending: true });

    const recentPatientsPromise = supabase
        .from('patients')
        .select('id, first_name, last_name, created_at')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(5);

    const monthlyRevenuePromise = supabase
        .rpc('get_monthly_revenue', {
            p_year: today.getFullYear(),
            p_month: today.getMonth() + 1
        });

    const [
        { data: appointments, error: appointmentsError },
        { data: recentPatients, error: recentPatientsError },
        { data: monthlyRevenue, error: monthlyRevenueError }
    ] = await Promise.all([
        appointmentsPromise,
        recentPatientsPromise,
        monthlyRevenuePromise
    ]);

    if (appointmentsError) console.error('Error fetching appointments:', appointmentsError);
    if (recentPatientsError) console.error('Error fetching recent patients:', recentPatientsError);
    if (monthlyRevenueError) console.error('Error fetching monthly revenue:', monthlyRevenueError);

    const transformedAppointments = (appointments || []).map((app: any) => {
        const singlePatient = Array.isArray(app.patient) ? app.patient[0] : app.patient;
        const singleDoctor = Array.isArray(app.doctor) ? app.doctor[0] : app.doctor;
        return { ...app, patient: singlePatient, doctor: singleDoctor };
    });

    return {
        appointments: transformedAppointments,
        recentPatients: recentPatients || [],
        monthlyRevenue: monthlyRevenue || 0,
    };
}
