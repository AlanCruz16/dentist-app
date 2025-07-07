'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function TestRemindersPage() {
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const supabase = createClient();
                const now = new Date();
                const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

                const { data, error } = await supabase
                    .from('appointments')
                    .select(`
                        start_time,
                        patients (
                            first_name,
                            last_name,
                            allow_whatsapp_reminders
                        )
                    `)
                    .gte('start_time', now.toISOString())
                    .lte('start_time', tomorrow.toISOString())
                    .neq('status', 'cancelled');

                if (error) {
                    throw error;
                }

                const filteredAppointments = data.filter(
                    (appt: any) => appt.patients && appt.patients.allow_whatsapp_reminders === true
                );

                setAppointments(filteredAppointments);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAppointments();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            <h1>Appointments to Remind</h1>
            <ul>
                {appointments.map((appt) => (
                    <li key={appt.start_time}>
                        {appt.patients.first_name} {appt.patients.last_name} - {new Date(appt.start_time).toLocaleString()}
                    </li>
                ))}
            </ul>
        </div>
    );
}
