// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
}

export async function getAppointmentsForWeek(startDate: string, endDate: string) { // Renaming to getCalendarEventsForWeek might be clearer
    const supabase = createClient();

    // Fetch Appointments
    const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select(`
      id,
      start_time,
      end_time,
      service_description,
      status,
      notes,
      patient:patients (id, first_name, last_name),
      doctor:profiles (id, full_name)
    `)
        .gte('start_time', startDate)
        .lt('start_time', endDate) // Fetch appointments that START within the week
        .order('start_time', { ascending: true });

    if (appointmentsError) {
        console.error('Error fetching appointments:', appointmentsError.message);
        // Decide on error handling: throw, return partial, or return empty with error indicator
    }

    const transformedAppointments = (appointmentsData || []).map((app: any) => {
        const singlePatient = app.patient && Array.isArray(app.patient) ? (app.patient[0] || null) : app.patient;
        const singleDoctor = app.doctor && Array.isArray(app.doctor) ? (app.doctor[0] || null) : app.doctor;
        return { ...app, type: 'appointment', patient: singlePatient, doctor: singleDoctor };
    });

    // Fetch Blocked Times
    const { data: blockedTimesData, error: blockedTimesError } = await supabase
        .from('blocked_times')
        .select(`
            id,
            start_time,
            end_time,
            reason,
            doctor:profiles (id, full_name) -- Assuming blocked times can be linked to a doctor
        `)
        .gte('start_time', startDate)
        .lt('start_time', endDate); // Or use a range overlap condition if end_time is relevant for fetching

    if (blockedTimesError) {
        console.error('Error fetching blocked times:', blockedTimesError.message);
    }

    const transformedBlockedTimes = (blockedTimesData || []).map((bt: any) => {
        const singleDoctor = bt.doctor && Array.isArray(bt.doctor) ? (bt.doctor[0] || null) : bt.doctor;
        return { ...bt, type: 'blocked', doctor: singleDoctor };
    });

    // Combine and return or return separately
    // For now, returning them separately to be handled in the component
    return {
        appointments: transformedAppointments,
        blockedTimes: transformedBlockedTimes,
        error: appointmentsError || blockedTimesError || null
    };
}
